import type {
  Activity,
  FaceBucket,
  Opportunity,
  StackedOpportunity,
} from "../types/reindeer";

/**
 * Extracts unique opportunities from a list of activities.
 * Deduplicates based on the opportunity ID.
 */
export function extractUniqueOpportunities(
  activities: Activity[],
): Opportunity[] {
  const opportunityMap = new Map<string, Opportunity>();

  for (const activity of activities) {
    for (const opportunity of activity.linkedOpportunities) {
      if (!opportunityMap.has(opportunity.id)) {
        opportunityMap.set(opportunity.id, opportunity);
      }
    }
  }

  return Array.from(opportunityMap.values());
}

/**
 * Groups opportunities by a specified time period (month or quarter).
 * Returns a Map where the key is the period identifier (e.g., "2023-12" or "2023-Q4").
 */
export function groupOpportunitiesByPeriod(
  opportunities: Opportunity[],
  period: "month" | "quarter",
): Map<string, Opportunity[]> {
  const grouped = new Map<string, Opportunity[]>();

  for (const opportunity of opportunities) {
    const date = new Date(opportunity.closeDate);
    let key: string;

    if (period === "month") {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      key = `${year}-${month}`;
    } else {
      // quarter
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      key = `${year}-Q${quarter}`;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(opportunity);
  }

  return grouped;
}

/**
 * Calculates FaceBucket structures from grouped opportunity data.
 * Sorts buckets chronologically and assigns layout properties.
 */
export function calculateFaceBuckets(
  groupedData: Map<string, Opportunity[]>,
  layout: { rowHeight: number; maxWidth: number },
): FaceBucket[] {
  const buckets: FaceBucket[] = [];

  // Sort keys chronologically
  const sortedKeys = Array.from(groupedData.keys()).sort();

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const opportunities = groupedData.get(key)!;

    // Calculate total revenue for this bucket
    const totalRevenue = opportunities.reduce(
      (sum, opp) => sum + opp.revenue,
      0,
    );

    buckets.push({
      bucketId: key,
      opportunities,
      yPosition: 0, // Placeholder, will be set by layout engine
      height: layout.rowHeight,
      totalRevenue,
      maxWidth: layout.maxWidth,
    });
  }

  return buckets;
}

/**
 * Calculates StackedOpportunity structures for all buckets.
 * Computes width and xPosition for each opportunity within its bucket.
 */
export function calculateStackedOpportunities(
  buckets: FaceBucket[],
): StackedOpportunity[] {
  const stacked: StackedOpportunity[] = [];

  for (const bucket of buckets) {
    let xOffset = 0;

    for (const opportunity of bucket.opportunities) {
      const width =
        bucket.totalRevenue > 0
          ? (opportunity.revenue / bucket.totalRevenue) * bucket.maxWidth
          : 0;

      stacked.push({
        opportunity,
        bucketId: bucket.bucketId,
        xPosition: xOffset,
        width,
        isSelected: false,
        isHovered: false,
        opacity: 1,
      });

      xOffset += width;
    }
  }

  return stacked;
}

/**
 * Main aggregation function that orchestrates the entire transformation pipeline.
 * Takes raw activities and returns FaceBuckets and StackedOpportunities.
 */
export function aggregateFaceData(
  activities: Activity[],
  options: {
    period?: "month" | "quarter";
    rowHeight?: number;
    maxWidth?: number;
  } = {},
): { buckets: FaceBucket[]; stacked: StackedOpportunity[] } {
  const { period = "month", rowHeight = 60, maxWidth = 400 } = options;

  const uniqueOpportunities = extractUniqueOpportunities(activities);
  const grouped = groupOpportunitiesByPeriod(uniqueOpportunities, period);
  const buckets = calculateFaceBuckets(grouped, { rowHeight, maxWidth });
  const stacked = calculateStackedOpportunities(buckets);

  return { buckets, stacked };
}
