import { db } from "./index";
import { requestForPartners, dataTeamPartners, teams } from "./schema";
import { eq, sql, and, ne } from "drizzle-orm";

/**
 * Status Priority (Lowest to Highest)
 * Any missing team (quota not met) counts as the lowest possible status: 'REQUESTED'
 */
const STATUS_HIERARCHY: Record<string, number> = {
  'REQUESTED': 0,
  'SOURCING': 1,
  'WAIT_SCHEDULE_TRAINING': 2,
  'TRAINING_SCHEDULED': 2, // Training Scheduled counts as ON_TRAINING
  'TRAINING_EVALUATED': 3, // Evaluation Pass
  'COMPLETED': 4
};

const REQUEST_STATUS_MAPPING: Record<number, any> = {
  0: 'REQUESTED',
  1: 'SOURCING',
  2: 'ON_TRAINING',
  3: 'TRAINED',
  4: 'COMPLETED'
};

/**
 * Recalculates the status of a Request For Partner based on the 
 * "worst-case" status among all required teams.
 */
export async function recalculateRequestStatus(tx: any, requestId: string) {
  // 1. Get the Request Quota
  const [request] = await tx.select({ 
    jumlahKebutuhan: requestForPartners.jumlahKebutuhan 
  }).from(requestForPartners).where(eq(requestForPartners.id, requestId));

  if (!request) return;

  // 2. Get all ACTIVE teams currently assigned for this request
  // IMPORTANT: Exclude any CANCELED assignments or teams from the calculation
  const allTeams = await tx.select({
    status: teams.status
  })
  .from(dataTeamPartners)
  .innerJoin(teams, eq(teams.dataTeamPartnerId, dataTeamPartners.id))
  .where(and(
    eq(dataTeamPartners.requestId, requestId),
    ne(dataTeamPartners.status, 'CANCELED'),
    ne(teams.status, 'CANCELED')
  ));

  // 3. Logic:
  // - If assigned teams < quota, lowest status is 'REQUESTED'
  // - Otherwise, lowest status is the minimum status among all teams
    
  let lowestScore = 999;

  if (allTeams.length < request.jumlahKebutuhan) {
    lowestScore = 0; // REQUESTED
  } else {
    for (const team of allTeams) {
        const score = STATUS_HIERARCHY[team.status] ?? 1; // Default to SOURCING
        if (score < lowestScore) {
            lowestScore = score;
        }
    }
  }

  // 4. Map score back to requestStatusEnum
  const newStatus = REQUEST_STATUS_MAPPING[lowestScore] || 'REQUESTED';

  // 5. Update the Request Table
  await tx.update(requestForPartners)
    .set({ status: newStatus })
    .where(eq(requestForPartners.id, requestId));
    
  console.log(`[STATUS] Request #${requestId} recalculated to ${newStatus}`);
}
