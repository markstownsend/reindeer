import * as d3 from "d3";
import type { Activity, FaceBucket } from "../types/reindeer";

export interface ChartScales {
  activitiesTimeScale: d3.ScaleTime<number, number, never>;
  opportunitiesTimeScale: d3.ScaleTime<number, number, never>;
  revenueScale: d3.ScaleLinear<number, number, never>;
  beamXScale: d3.ScaleLinear<number, number, never>;
}

export interface LayoutDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  faceWidth: number;
  faceLeft: number;
  activitiesHeight: number;
  opportunitiesHeight: number;
  activitiesRange: [number, number];
  opportunitiesRange: [number, number];
  rowHeight: number;
  barHeight: number;
}

/**
 * Calculates layout dimensions based on chart configuration.
 */
export function calculateLayout(
  width: number,
  height: number,
  faceWidthRatio: number,
  activitiesHeightRatio: number,
): LayoutDimensions {
  const margin = { top: 60, right: 40, bottom: 40, left: 80 };
  const validatedFaceWidthRatio = Math.max(0.1, Math.min(1.0, faceWidthRatio));
  const validatedActivitiesHeightRatio = Math.max(
    0.1,
    Math.min(0.9, activitiesHeightRatio),
  );

  const totalAvailableWidth = width - margin.left - margin.right;
  const faceWidth = totalAvailableWidth * validatedFaceWidthRatio;
  const faceLeft = margin.left + (totalAvailableWidth - faceWidth) / 2;
  const totalAvailableHeight = height - margin.top - margin.bottom;

  const activitiesHeight =
    totalAvailableHeight * validatedActivitiesHeightRatio;
  const opportunitiesHeight =
    totalAvailableHeight * (1 - validatedActivitiesHeightRatio);

  const activitiesRange: [number, number] = [
    margin.top,
    margin.top + activitiesHeight,
  ];
  const opportunitiesRange: [number, number] = [
    margin.top + activitiesHeight,
    height - margin.bottom,
  ];

  const rowHeight = 40;
  const barHeight = rowHeight * 0.7;

  return {
    width,
    height,
    margin,
    faceWidth,
    faceLeft,
    activitiesHeight,
    opportunitiesHeight,
    activitiesRange,
    opportunitiesRange,
    rowHeight,
    barHeight,
  };
}

/**
 * Updates layout with proper row height based on bucket count.
 */
export function updateLayoutWithBuckets(
  layout: LayoutDimensions,
  buckets: FaceBucket[],
): LayoutDimensions {
  const totalBuckets = buckets.length;

  const rowHeight =
    totalBuckets > 0
      ? Math.min(40, layout.opportunitiesHeight / totalBuckets)
      : 40;

  return {
    ...layout,
    rowHeight,
    barHeight: rowHeight * 0.7,
  };
}

/**
 * Creates all chart scales based on data and layout.
 */
export function createScales(
  data: Activity[],
  buckets: FaceBucket[],
  layout: LayoutDimensions,
): ChartScales {
  const { activitiesRange, opportunitiesRange, faceWidth, width, margin } =
    layout;
  const maxRevenue = getMaxRevenue(buckets);

  // Revenue scale for bar widths
  const revenueScale = d3
    .scaleLinear()
    .domain([0, maxRevenue > 0 ? maxRevenue : 1])
    .range([0, faceWidth * 0.8]);

  // Activities time scale
  const activityTimestamps = data.map((a) => new Date(a.timestamp));
  let activitiesTimeScale: d3.ScaleTime<number, number, never>;

  if (activityTimestamps.length > 0) {
    const minActivityTime = new Date(
      Math.min(...activityTimestamps.map((d) => d.getTime())),
    );
    const maxActivityTime = new Date(
      Math.max(...activityTimestamps.map((d) => d.getTime())),
    );
    const activityTimePadding =
      (maxActivityTime.getTime() - minActivityTime.getTime()) * 0.05 ||
      86400000;

    activitiesTimeScale = d3
      .scaleTime()
      .domain([
        new Date(minActivityTime.getTime() - activityTimePadding),
        new Date(maxActivityTime.getTime() + activityTimePadding),
      ])
      .range(activitiesRange);
  } else {
    activitiesTimeScale = d3
      .scaleTime()
      .domain([new Date(0), new Date(1)])
      .range(activitiesRange);
  }

  // Opportunities time scale
  const opportunityCloseDates: Date[] = [];
  for (const activity of data) {
    for (const opp of activity.linkedOpportunities) {
      const closeDate = new Date(opp.closeDate);
      if (!isNaN(closeDate.getTime())) {
        opportunityCloseDates.push(closeDate);
      }
    }
  }

  let opportunitiesTimeScale: d3.ScaleTime<number, number, never>;

  if (opportunityCloseDates.length > 0) {
    const minOppTime = new Date(
      Math.min(...opportunityCloseDates.map((d) => d.getTime())),
    );
    const maxOppTime = new Date(
      Math.max(...opportunityCloseDates.map((d) => d.getTime())),
    );
    const oppTimePadding =
      (maxOppTime.getTime() - minOppTime.getTime()) * 0.05 || 86400000;

    const domainMin = new Date(minOppTime.getTime() - oppTimePadding);
    const domainMax = new Date(maxOppTime.getTime() + oppTimePadding);

    // Calculate where earliest bucket would render with natural domain
    const tempScale = d3
      .scaleTime()
      .domain([domainMin, domainMax])
      .range(opportunitiesRange);

    // Find earliest bucket date from buckets
    let earliestBucketDate: Date | null = null;
    for (const bucket of buckets) {
      // bucketId format "YYYY-MM" or "YYYY-Qn"
      // Assuming "YYYY-MM" for now as per aggregateFaceData default
      if (bucket.bucketId.includes("-")) {
        const parts = bucket.bucketId.split("-");
        if (parts.length === 2 && !bucket.bucketId.includes("Q")) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // 0-based
          const bucketDate = new Date(year, month, 1);
          if (
            !earliestBucketDate ||
            bucketDate.getTime() < earliestBucketDate.getTime()
          ) {
            earliestBucketDate = bucketDate;
          }
        }
      }
    }

    let adjustedDomainMin = domainMin;
    if (earliestBucketDate) {
      const earliestBucketY = tempScale(earliestBucketDate);
      if (earliestBucketY < opportunitiesRange[0]) {
        const timeSpanMs = domainMax.getTime() - domainMin.getTime();
        const pixelSpan = opportunitiesRange[1] - opportunitiesRange[0];
        const shiftMs =
          ((opportunitiesRange[0] - earliestBucketY) / pixelSpan) * timeSpanMs;
        adjustedDomainMin = new Date(domainMin.getTime() - shiftMs);
      }
    }

    opportunitiesTimeScale = d3
      .scaleTime()
      .domain([adjustedDomainMin, domainMax])
      .range(opportunitiesRange);
  } else {
    opportunitiesTimeScale = d3
      .scaleTime()
      .domain([new Date(0), new Date(1)])
      .range(opportunitiesRange);
  }

  // Beam X scale (will be created based on beams data)
  const beamXScale = d3
    .scaleLinear()
    .domain([-0.5, 0.5])
    .range([margin.left, width - margin.right]);

  return {
    activitiesTimeScale,
    opportunitiesTimeScale,
    revenueScale,
    beamXScale,
  };
}

/**
 * Creates beam X scale based on beam ordinal positions.
 */
export function createBeamXScale(
  ordinalPositions: number[],
  width: number,
  margin: { left: number; right: number },
): d3.ScaleLinear<number, number, never> {
  const maxOrdinal =
    ordinalPositions.length > 0
      ? Math.max(...ordinalPositions.map(Math.abs))
      : 0;

  return d3
    .scaleLinear()
    .domain([-maxOrdinal - 0.5, maxOrdinal + 0.5])
    .range([margin.left, width - margin.right]);
}

// Re-export getMaxRevenue for convenience
export function getMaxRevenue(buckets: FaceBucket[]): number {
  let maxRevenue = 0;
  for (const bucket of buckets) {
    for (const opp of bucket.opportunities) {
      if (opp.revenue > maxRevenue) {
        maxRevenue = opp.revenue;
      }
    }
  }
  return maxRevenue;
}
