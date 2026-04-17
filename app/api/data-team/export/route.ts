import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { dataTeamPartners } from "../../../../db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "PMO_OPS" && role !== "PROCUREMENT" && role !== "QA" && role !== "PEOPLE_CULTURE" && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Fetch all assignments with deep relations
    const assignments = await db.query.dataTeamPartners.findMany({
      with: {
        request: true,
        partner: true,
        teams: {
          with: {
            members: true,
            trainingProcess: true
          }
        }
      },
      orderBy: (dt, { desc }) => [desc(dt.createdAt)]
    });

    // Flatten data to per-personnel level
    const exportData: any[] = [];

    assignments.forEach((assignment) => {
      const sows = assignment.request?.sowPekerjaan || "-";
      const perusahaan = assignment.companyName || assignment.partner?.companyName || "-";
      const tanggalAssign = assignment.createdAt 
        ? new Date(assignment.createdAt).toLocaleDateString("id-ID") 
        : "-";

      // If there are no teams, skip or add placeholder? Usually there are teams.
      if (!assignment.teams || assignment.teams.length === 0) {
        // Optional: Export assignment info even if no teams assigned yet
        return;
      }

      assignment.teams.forEach((team) => {
        const trainingDate = team.trainingProcess?.trainingDate
          ? new Date(team.trainingProcess.trainingDate).toLocaleDateString("id-ID")
          : "-";

        const teamInfo = {
          "Assignment (SOW)": sows,
          "Perusahaan": perusahaan,
          "Tanggal Assign": tanggalAssign,
          "Nama Team": `TEAM #${team.teamNumber}`,
          "Nama Leader Team": team.leaderName || "-",
          "No Handphone Leader": team.leaderPhone || "-",
          "Lokasi Penugasan": team.location || "-",
          "Nomor TKPK1": team.tkpk1Number || "-",
          "Nomor First Aid": team.firstAidNumber || "-",
          "Nomor Electrical": team.electricalNumber || "-",
        };

        // If there are no members, create one row with blank member info
        if (!team.members || team.members.length === 0) {
          exportData.push({
            ...teamInfo,
            "Nama Anggota": "-",
            "Posisi": "-",
            "Training?": "No",
            "Date Training": trainingDate,
            "Email ext Alita": "-"
          });
        } else {
          team.members.forEach((member) => {
            exportData.push({
              ...teamInfo,
              "Nama Anggota": member.name || "-",
              "Posisi": member.position || "-",
              "Training?": member.isAttendedTraining === 1 ? "Yes" : "No",
              "Date Training": trainingDate,
              "Email ext Alita": member.alitaExtEmail || "-"
            });
          });
        }
      });
    });

    // Create Excel Workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Team Personnel");

    // Output to Buffer (as Uint8Array for better compatibility)
    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    // Return as Stream/File
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Expert_Data_Team_Personnel.xlsx"',
      },
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to generate export file: " + error.message }, { status: 500 });
  }
}
