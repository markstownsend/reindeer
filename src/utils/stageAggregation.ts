import type {
  Activity,
  StageAggregationResult,
  StageBucket,
} from "../types/reindeer";

const KNOWN_STAGE_ORDER = [
  "Prospect",
  "Qualified",
  "Technical Validation",
  "Business Validation",
  "Committed",
  "Closed Lost",
  "Launched",
  "Completed",
];

function normalizeStage(stage: string): string {
  const trimmed = stage.trim();
  return trimmed.length > 0 ? trimmed : "Unknown";
}

function sortStageBuckets(a: StageBucket, b: StageBucket): number {
  const aKnownIndex = KNOWN_STAGE_ORDER.indexOf(a.stage);
  const bKnownIndex = KNOWN_STAGE_ORDER.indexOf(b.stage);

  if (aKnownIndex !== -1 && bKnownIndex !== -1) {
    return aKnownIndex - bKnownIndex;
  }
  if (aKnownIndex !== -1) {
    return -1;
  }
  if (bKnownIndex !== -1) {
    return 1;
  }

  return a.stage.localeCompare(b.stage);
}

/**
 * Aggregates stage-level data for the nose layer.
 *
 * Revenue semantics:
 * - Revenue is deduplicated per opportunity ID.
 * - If an opportunity appears in multiple activities, only the latest observed
 *   stage/revenue snapshot (by activity timestamp) is used.
 */
export function aggregateStageData(
  activities: Activity[],
): StageAggregationResult {
  const latestOpportunityById = new Map<
    string,
    { stage: string; revenue: number; activityTimestampMs: number }
  >();
  const activityCountByStage = new Map<string, number>();

  for (const activity of activities) {
    const activityTimestampMs = new Date(activity.timestamp).getTime();
    const normalizedTimestampMs = Number.isNaN(activityTimestampMs)
      ? Number.MIN_SAFE_INTEGER
      : activityTimestampMs;

    const stagesSeenInActivity = new Set<string>();

    for (const opportunity of activity.linkedOpportunities) {
      const stage = normalizeStage(opportunity.stage);
      stagesSeenInActivity.add(stage);

      const existing = latestOpportunityById.get(opportunity.id);
      if (!existing || normalizedTimestampMs >= existing.activityTimestampMs) {
        latestOpportunityById.set(opportunity.id, {
          stage,
          revenue: opportunity.revenue,
          activityTimestampMs: normalizedTimestampMs,
        });
      }
    }

    for (const stage of stagesSeenInActivity) {
      activityCountByStage.set(
        stage,
        (activityCountByStage.get(stage) || 0) + 1,
      );
    }
  }

  const revenueByStage = new Map<string, number>();
  latestOpportunityById.forEach(({ stage, revenue }) => {
    revenueByStage.set(stage, (revenueByStage.get(stage) || 0) + revenue);
  });

  const allStages = new Set<string>([
    ...Array.from(revenueByStage.keys()),
    ...Array.from(activityCountByStage.keys()),
  ]);

  const buckets: StageBucket[] = Array.from(allStages).map((stage) => ({
    stage,
    opportunityRevenueTotal: revenueByStage.get(stage) || 0,
    activityCountTotal: activityCountByStage.get(stage) || 0,
  }));

  buckets.sort(sortStageBuckets);

  const allStagesRevenueTotal = buckets.reduce(
    (sum, bucket) => sum + bucket.opportunityRevenueTotal,
    0,
  );
  const allStagesActivityCountTotal = buckets.reduce(
    (sum, bucket) => sum + bucket.activityCountTotal,
    0,
  );

  return {
    buckets,
    allStagesRevenueTotal,
    allStagesActivityCountTotal,
  };
}
