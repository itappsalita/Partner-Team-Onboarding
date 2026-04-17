import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { dataTeamPartners, teamMembers, teams } from "../../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "PEOPLE_CULTURE" && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied. People & Culture only." }, { status: 403 });
    }

    // Fetch teams that have completed QA Training or are already completed
    const assignments = await db.query.teams.findMany({
      where: inArray(teams.status, ["TRAINING_EVALUATED", "COMPLETED"]),
      with: {
        dataTeamPartner: {
          with: {
            partner: {
              columns: { name: true, email: true }
            },
            request: {
              columns: { sowPekerjaan: true, provinsi: true }
            }
          }
        },
        members: {
          where: eq(teamMembers.isAttendedTraining, 1)
        }
      },
      orderBy: (t, { desc }) => [desc(t.createdAt)]
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Fetch pending certificates error:", error);
    return NextResponse.json({ error: "Gagal mengambil data sertifikat" }, { status: 500 });
  }
}
