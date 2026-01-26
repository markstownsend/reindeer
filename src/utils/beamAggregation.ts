import { Activity, Beam, Opportunity } from "../types/reindeer";

/**
 * Groups activities by their linked opportunity ID.
 * Returns a Map where the key is the opportunity ID and the value is an array of activities.
 */
export function groupActivitiesByOpportunity(
  activities: Activity[],
): Map<string, Activity[]> {
  const activityMap = new Map<string, Activity[]>();

  for (const activity of activities) {
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
 * 1. Unique opportunities are sorted by total revenue.
 * 2. Alternating ordinal positions (0, -1, 1, -2, 2...) are assigned based on revenue rank.
 * 3. Vertical extents (min/max timestamps) are calculated for each beam.
 */
export function calculateBeamPositions(activities: Activity[]): Beam[] {
  // Step 1: Group activities by opportunity
  const activityMap = groupActivitiesByOpportunity(activities);

  // Step 2: Create a list of unique opportunities with their total revenue
  const opportunityRevenueMap = new Map<string, number>();
  const opportunityMap = new Map<string, Opportunity>();

  for (const activity of activities) {
    for (const opportunity of activity.linkedOpportunities) {
      const currentRevenue = opportunityRevenueMap.get(opportunity.id) || 0;
      opportunityRevenueMap.set(
        opportunity.id,
        currentRevenue + opportunity.revenue,
      );
      opportunityMap.set(opportunity.id, opportunity);
    }
  }

  // Step 3: Sort opportunities by total revenue (descending)
  const sortedOpportunities = Array.from(opportunityRevenueMap.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  // Step 4: Assign alternating ordinal positions
  // Rank 0 (largest) -> ordinal 0
  // Rank 1 -> ordinal -1
  // Rank 2 -> ordinal 1
  // Rank 3 -> ordinal -2, etc.
  const beams: Beam[] = [];

  for (let i = 0; i < sortedOpportunities.length; i++) {
    const [oppId, _] = sortedOpportunities[i];
    const opportunity = opportunityMap.get(oppId)!;
    const beamActivities = activityMap.get(oppId) || [];

    // Calculate ordinal position
    let ordinalPosition: number;
    if (i === 0) {
      ordinalPosition = 0;
    } else if (i % 2 === 1) {
      ordinalPosition = -Math.ceil(i / 2);
    } else {
      ordinalPosition = Math.ceil(i / 2);
    }

    // Calculate vertical extent (min and max timestamps)
    const timestamps = beamActivities.map((a) => new Date(a.timestamp));
    const minDate = new Date(Math.min(...timestamps.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...timestamps.map((d) => d.getTime())));

    beams.push({
      activities: beamActivities,
      ordinalPosition,
      verticalExtent: { min: minDate, max: maxDate },
      burrConnection: { x: 0, y: 0 }, // Will be calculated during rendering
    });
  }

  return beams;
}
