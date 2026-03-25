import type { Activity, Beam } from "../types/reindeer";

/**
 * Groups activities by their linked opportunity ID.
 * Returns a Map where the key is the opportunity ID and the value is an array of activities.
 */
function groupActivitiesByOpportunity(
  activities: Activity[],
): Map<string, Activity[]> {
  const activityMap = new Map<string, Activity[]>();

  for (const activity of activities) {
    if (activity.linkedOpportunities.length === 0) {
      continue;
    }
    for (const opportunity of activity.linkedOpportunities) {
      if (!activityMap.has(opportunity.id)) {
        activityMap.set(opportunity.id, []);
      }
      activityMap.get(opportunity.id)!.push(activity);
    }
  }

  return activityMap;
}

/**
 * Calculates beam positions for all opportunities.
 * This function implements the core logic for beam displacement:
 * 1. Separates opportunity-bound and opportunity-free activities.
 * 2. Opportunity-bound activities follow the alternating ordinal logic (1, -1, 2, -2...) to be placed OUTSIDE the face.
 * 3. Opportunity-free activities are grouped into a single beam at ordinal 0 to be placed INSIDE the face.
 */
export function calculateBeamPositions(activities: Activity[]): Beam[] {
  const beams: Beam[] = [];

  // Step 1: Separate activities
  const boundActivities: Activity[] = [];
  const freeActivities: Activity[] = [];

  for (const activity of activities) {
    if (activity.linkedOpportunities.length > 0) {
      boundActivities.push(activity);
    } else {
      freeActivities.push(activity);
    }
  }

  // Step 2: Process Opportunity-Free Activities (Ordinal 0)
  if (freeActivities.length > 0) {
    const timestamps = freeActivities.map((a) => new Date(a.timestamp));
    const minDate = new Date(timestamps.reduce((min, d) => Math.min(min, d.getTime()), Infinity));
    const maxDate = new Date(timestamps.reduce((max, d) => Math.max(max, d.getTime()), -Infinity));

    beams.push({
      activities: freeActivities,
      ordinalPosition: 0,
      verticalExtent: { min: minDate, max: maxDate },
      burrConnection: { x: 0, y: 0 },
      type: "free",
    });
  }

  // Step 3: Process Opportunity-Bound Activities
  const activityMap = groupActivitiesByOpportunity(boundActivities);

  // Create a list of unique opportunities with their total revenue
  const opportunityRevenueMap = new Map<string, number>();

  for (const activity of boundActivities) {
    for (const opportunity of activity.linkedOpportunities) {
      const currentRevenue = opportunityRevenueMap.get(opportunity.id) || 0;
      opportunityRevenueMap.set(
        opportunity.id,
        currentRevenue + opportunity.revenue,
      );
    }
  }

  // Sort opportunities by total revenue (descending)
  const sortedOpportunities = Array.from(opportunityRevenueMap.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  // Assign alternating ordinal positions starting from 1/-1
  // Rank 0 -> ordinal 1
  // Rank 1 -> ordinal -1
  // Rank 2 -> ordinal 2
  // Rank 3 -> ordinal -2, etc.
  for (let i = 0; i < sortedOpportunities.length; i++) {
    const [oppId] = sortedOpportunities[i];
    const beamActivities = activityMap.get(oppId) || [];

    // Calculate ordinal position (skipping 0)
    let ordinalPosition: number;
    if (i % 2 === 0) {
      ordinalPosition = Math.ceil((i + 1) / 2); // 1, 2, 3...
    } else {
      ordinalPosition = -Math.ceil((i + 1) / 2); // -1, -2, -3...
    }

    // Calculate vertical extent
    const timestamps = beamActivities.map((a) => new Date(a.timestamp));
    const minDate = new Date(timestamps.reduce((min, d) => Math.min(min, d.getTime()), Infinity));
    const maxDate = new Date(timestamps.reduce((max, d) => Math.max(max, d.getTime()), -Infinity));

    beams.push({
      activities: beamActivities,
      ordinalPosition,
      verticalExtent: { min: minDate, max: maxDate },
      burrConnection: { x: 0, y: 0 },
      type: "bound",
      linkedOpportunityId: oppId,
    });
  }

  return beams;
}
