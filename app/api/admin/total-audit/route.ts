import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { dataTeamPartners, requestForPartners } from "../../../../db/schema";

export async function GET() {
  try {
    const assignments = await db.query.dataTeamPartners.findMany({
      with: {
        request: true,
        teams: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      assignments: assignments.map(a => ({
        id: a.id,
        displayId: a.displayId,
        status: a.status,
        requestDisplayId: a.request?.displayId,
        teamCount: a.teams?.length,
        teamStatuses: a.teams?.map(t => t.status)
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
