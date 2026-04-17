import { NextResponse } from "next/server";
import { db } from "../../../../../db";
import { teamMembers, teams } from "../../../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { eq, and } from "drizzle-orm";
import { recalculateTeamStatus, recalculateAssignmentStatus, recalculateRequestStatus } from "../../../../../db/status-utils";
import fs from "fs-extra";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public/uploads");

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const memberId = id;

    const formData = await req.formData();
    const position = formData.get("position") as string;
    const selfieFile = formData.get("selfieFile") as File | null;

    // 1. Fetch member and check team status
    const member = await db.query.teamMembers.findFirst({
        where: and(eq(teamMembers.id, memberId), eq(teamMembers.isActive, 1)),
        with: {
            team: true
        }
    });

    if (!member) return NextResponse.json({ error: "Member not found or inactive" }, { status: 404 });

    // 2. Strict Validation: Only SOURCING teams can be edited
    if (member.team.status !== 'SOURCING') {
        return NextResponse.json({ error: "Data sudah terkunci. Edit hanya diperbolehkan saat tim berstatus SOURCING." }, { status: 400 });
    }

    // 3. Process Upload if new selfie provided
    let selfieFilePath = member.selfieFilePath;
    if (selfieFile && selfieFile.size > 0) {
        await fs.ensureDir(UPLOAD_DIR);
        const bytes = await selfieFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `selfie_upd_${Date.now()}_${selfieFile.name.replace(/\s+/g, '_')}`;
        await fs.writeFile(join(UPLOAD_DIR, filename), buffer);
        selfieFilePath = `/uploads/${filename}`;
    }

    // 4. Update Member in Transaction to handle Leader Sync
    await db.transaction(async (tx) => {
        // a. Update member
        await tx.update(teamMembers)
            .set({ 
                position: position || member.position,
                selfieFilePath: selfieFilePath
            })
            .where(eq(teamMembers.id, memberId));

        // b. Leader Sync if position changed
        if (position && position !== member.position) {
            if (position === "Leader") {
                // Member becomes leader
                await tx.update(teams)
                    .set({ leaderName: member.name, leaderPhone: member.phone })
                    .where(eq(teams.id, member.teamId));
            } else if (member.position === "Leader") {
                // Member was leader, now is not
                await tx.update(teams)
                    .set({ leaderName: "", leaderPhone: "" })
                    .where(eq(teams.id, member.teamId));
            }
        }
    });

    return NextResponse.json({ message: "Member updated successfully", selfieFilePath });

  } catch (error: any) {
    console.error("Update member error:", error);
    return NextResponse.json({ error: "Failed to update member: " + error.message }, { status: 500 });
  }
}
