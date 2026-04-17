import { NextResponse } from "next/server";
import { db } from "../../../../../db";
import { teamMembers, teams } from "../../../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { recalculateTeamStatus, recalculateAssignmentStatus, recalculateRequestStatus } from "../../../../../db/status-utils";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const memberId = id;
    if (!memberId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    // 1. Fetch member and associated team info for sync
    const member = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.id, memberId),
      with: {
        team: {
            with: {
                dataTeamPartner: true
            }
        }
      }
    });

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // 2. TRANSACTIONAL DELETE & SYNC
    await db.transaction(async (tx) => {
        // a. Conditional Delete/Deactivate
        if (member.certificateFilePath) {
          await tx.update(teamMembers)
            .set({ isActive: 0 })
            .where(eq(teamMembers.id, memberId));
        } else {
          await tx.delete(teamMembers).where(eq(teamMembers.id, memberId));
        }

        // b. Leader Sync
        if (member.position === "Leader") {
            await tx.update(teams)
              .set({ leaderName: "", leaderPhone: "" })
              .where(eq(teams.id, member.teamId));
        }

        // c. STATUS SYNC (Cascading Update / Downgrade)
        await recalculateTeamStatus(tx, member.teamId);
        await recalculateAssignmentStatus(tx, member.team.dataTeamPartnerId);
        await recalculateRequestStatus(tx, member.team.dataTeamPartner.requestId);
    });

    return NextResponse.json({ message: "Member removal processed and status synchronized successfully." });

  } catch (error: any) {
    console.error("Delete member error:", error);
    return NextResponse.json({ error: "Failed to process member removal: " + error.message }, { status: 500 });
  }
}
