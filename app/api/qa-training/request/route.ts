import { NextResponse } from "next/server";
import { db } from "@/db";
import { dataTeamPartners, teams, trainingProcesses, requestForPartners } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { recalculateRequestStatus } from "@/db/status-utils";

export async function POST(req: Request) {
  try {
    const { dataTeamPartnerId, teamId } = await req.json();

    if (!dataTeamPartnerId && !teamId) {
      return NextResponse.json({ error: "Missing target ID (dataTeamPartnerId or teamId)" }, { status: 400 });
    }

    // 1. Transaction to update statuses
    await db.transaction(async (tx) => {
      let targetTeamIds: number[] = [];
      let currentAssignmentId = dataTeamPartnerId;

      if (teamId) {
        // Individual Team Request
        const team = await tx.query.teams.findFirst({
          where: eq(teams.id, teamId),
        });
        if (!team) throw new Error("Team not found");
        targetTeamIds = [teamId];
        currentAssignmentId = team.dataTeamPartnerId;
      } else {
        // Batch Assignment Request
        const partnerTeams = await tx.query.teams.findMany({
          where: eq(teams.dataTeamPartnerId, dataTeamPartnerId),
        });
        if (partnerTeams.length === 0) throw new Error("No teams found for this assignment");
        targetTeamIds = partnerTeams.map(t => t.id);
      }

      const assignment = await tx.query.dataTeamPartners.findFirst({
        where: eq(dataTeamPartners.id, currentAssignmentId),
      });

      if (!assignment) throw new Error("Partner Assignment not found");

      // 1a. Update specific Teams status to WAIT_SCHEDULE_TRAINING
      await tx.update(teams)
        .set({ status: 'WAIT_SCHEDULE_TRAINING' })
        .where(inArray(teams.id, targetTeamIds));

      // 1b. Update assignment status to ON_TRAINING
      await tx.update(dataTeamPartners)
        .set({ status: 'ON_TRAINING' })
        .where(eq(dataTeamPartners.id, currentAssignmentId));

      // 1c. Update the parent request status based on ALL teams
      await recalculateRequestStatus(tx, assignment.requestId);

      // 2. Init Training Process records for teams that don't have one
      for (const tId of targetTeamIds) {
        const existing = await tx.query.trainingProcesses.findFirst({
          where: eq(trainingProcesses.teamId, tId)
        });

        if (!existing) {
          await tx.insert(trainingProcesses).values({
            teamId: tId,
            result: 'PENDING'
          });
        }
      }
    });

    return NextResponse.json({ message: "Training requested successfully." });
  } catch (error: any) {
    console.error("Training request error:", error);
    return NextResponse.json({ error: "Gagal memproses request training: " + error.message }, { status: 500 });
  }
}
