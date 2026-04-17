import { NextResponse } from "next/server";
import { db } from "@/db";
import { dataTeamPartners, requestForPartners, teams, users } from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { eq } from "drizzle-orm";
import { recalculateRequestStatus } from "@/db/status-utils";
import { generateUuid } from "@/lib/uuid";

const UPLOAD_DIR = join(process.cwd(), "public/uploads");

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const role = user.role;
    const userId = user.id;

    // Fetch assignments with relations
    const assignments = await db.query.dataTeamPartners.findMany({
      where: role === "PARTNER" ? eq(dataTeamPartners.partnerId, userId) : undefined,
      with: {
        partner: {
          columns: { name: true, email: true }
        },
        request: {
          columns: { sowPekerjaan: true, provinsi: true, area: true, membersPerTeam: true, jumlahKebutuhan: true }
        },
        teams: {
          with: {
            members: true
          }
        }
      },
      orderBy: (dt, { desc }) => [desc(dt.createdAt)]
    });

    return NextResponse.json(assignments);
  } catch (error: any) {
    console.error("Fetch assignments error:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    
    // Only Procurement or Superadmin can create new assignments
    if (!session || (role !== "PROCUREMENT" && role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Procurement or Superadmin only." }, { status: 403 });
    }

    const formData = await req.formData();
    const requestIdStr = formData.get("requestId") as string;
    const partnerIdStr = formData.get("partnerId") as string;
    const numTeamsStr = formData.get("numTeams") as string;
    const numTeams = parseInt(numTeamsStr) || 0;
    
    const torFile = formData.get("torFile") as File | null;
    const bakFile = formData.get("bakFile") as File | null;

    if (!requestIdStr || !partnerIdStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requestId = requestIdStr;

    // 1. Fetch Request to check quota and get location for placeholders
    const request = await db.query.requestForPartners.findFirst({
      where: eq(requestForPartners.id, requestId),
      with: {
        dataTeamPartners: {
          with: {
            teams: true
          }
        }
      }
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Calculate existing total teams across all partners for this request
    // IMPORTANT: Ignore assignments and teams that have been CANCELED
    const currentTotal = request.dataTeamPartners
      .filter(dt => dt.status !== 'CANCELED')
      .reduce((acc, dt) => acc + dt.teams.filter(t => t.status !== 'CANCELED').length, 0);
      
    const remainingQuota = request.jumlahKebutuhan - currentTotal;

    if (numTeams > remainingQuota) {
      return NextResponse.json({ 
        error: `Kuota tidak mencukupi. Sisa kuota: ${remainingQuota} tim. Anda mencoba input: ${numTeams} tim.` 
      }, { status: 400 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    let torFilePath = null;
    let bakFilePath = null;

    if (torFile && torFile.size > 0) {
      const bytes = await torFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `tor_${Date.now()}_${torFile.name.replace(/\s+/g, '_')}`;
      await writeFile(join(UPLOAD_DIR, filename), buffer);
      torFilePath = `/uploads/${filename}`;
    }

    if (bakFile && bakFile.size > 0) {
      const bytes = await bakFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `bak_${Date.now()}_${bakFile.name.replace(/\s+/g, '_')}`;
      await writeFile(join(UPLOAD_DIR, filename), buffer);
      bakFilePath = `/uploads/${filename}`;
    }

    const locationPlaceholder = `${request.provinsi}, ${request.area}`;

    const resultId = await db.transaction(async (tx) => {
      // 1.5 Fetch Partner Details for Snapshot
      const partnerUser = await tx.query.users.findFirst({
        where: eq(users.id, partnerIdStr),
        columns: { companyName: true }
      });

      const assignmentId = generateUuid();
      // 2. Insert Assignment with Company Name Snapshot
      await tx.insert(dataTeamPartners).values({
        id: assignmentId,
        requestId: requestId,
        partnerId: partnerIdStr,
        companyName: partnerUser?.companyName || null,
        torFilePath,
        bakFilePath,
        status: 'SOURCING'
      });

      // 3. Update the request status based on fulfillment
      await recalculateRequestStatus(tx, requestId);

      // 4. Create Team Placeholders
      if (numTeams > 0) {
        for (let i = 1; i <= numTeams; i++) {
          await tx.insert(teams).values({
            id: generateUuid(),
            dataTeamPartnerId: assignmentId,
            teamNumber: i,
            location: locationPlaceholder,
            position: 'Team Leader' // Initial default position
          });
        }
      }

      return assignmentId;
    });

    return NextResponse.json({ message: "Team data and placeholders created successfully", id: resultId }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process team data: " + error.message }, { status: 500 });
  }
}
