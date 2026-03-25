import { scaleTime, scaleLinear } from "d3-scale";
import type { ScaleTime, ScaleLinear } from "d3-scale";
import type { Activity, FaceBucket } from "../types/reindeer";

/** Layout constants */
const MARGIN = { top: 60, right: 40, bottom: 40, left: 80 } as const;
const DEFAULT_ROW_HEIGHT = 40;
const BAR_HEIGHT_RATIO = 0.7;
const MIN_NOSE_HEIGHT = 40;
const NOSE_HEIGHT_RATIO = 0.25;
const MIN_PLOT_HEIGHT = 40;
const TIME_PADDING_RATIO = 0.05;
const DEFAULT_TIME_PADDING_MS = 86400000; // 1 day in milliseconds
const REVENUE_SCALE_WIDTH_RATIO = 0.8;

export interface ChartScales {
  activitiesTimeScale: ScaleTime<number, number, never>;
  opportunitiesTimeScale: ScaleTime<number, number, never>;
  revenueScale: ScaleLinear<number, number, never>;
  beamXScale: (ordinal: number) => number;
}

export interface LayoutDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  faceWidth: number;
  faceLeft: number;
  activitiesHeight: number;
  opportunitiesHeight: number;
  opportunitiesPlotHeight: number;
  noseHeight: number;
  activitiesRange: [number, number];
  opportunitiesRange: [number, number];
  opportunitiesPlotRange: [number, number];
  noseRange: [number, number];
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
  const margin = { ...MARGIN };
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
  const idealNoseHeight = Math.max(MIN_NOSE_HEIGHT * 2, opportunitiesHeight * NOSE_HEIGHT_RATIO);
  const noseHeight = Math.min(
    idealNoseHeight,
    Math.max(MIN_NOSE_HEIGHT, opportunitiesHeight - MIN_NOSE_HEIGHT),
  );
  const opportunitiesPlotHeight = Math.max(
    MIN_PLOT_HEIGHT,
    opportunitiesHeight - noseHeight,
  );

  const activitiesRange: [number, number] = [
    margin.top,
    margin.top + activitiesHeight,
  ];
  const opportunitiesRange: [number, number] = [
    margin.top + activitiesHeight,
    height - margin.bottom,
  ];
  const opportunitiesPlotRange: [number, number] = [
    opportunitiesRange[0],
    opportunitiesRange[0] + opportunitiesPlotHeight,
  ];
  const noseRange: [number, number] = [
    opportunitiesPlotRange[1],
    opportunitiesRange[1],
  ];

  const rowHeight = DEFAULT_ROW_HEIGHT;
  const barHeight = rowHeight * BAR_HEIGHT_RATIO;

  return {
    width,
    height,
    margin,
    faceWidth,
    faceLeft,
    activitiesHeight,
    opportunitiesHeight,
    opportunitiesPlotHeight,
    noseHeight,
    activitiesRange,
    opportunitiesRange,
    opportunitiesPlotRange,
    noseRange,
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
      ? Math.min(DEFAULT_ROW_HEIGHT, layout.opportunitiesPlotHeight / totalBuckets)
      : DEFAULT_ROW_HEIGHT;

  return {
    ...layout,
    rowHeight,
    barHeight: rowHeight * BAR_HEIGHT_RATIO,
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
  const { activitiesRange, opportunitiesPlotRange, faceWidth, width, margin } =
    layout;
  const maxRevenue = getMaxRevenue(buckets);

  // Revenue scale for bar widths
  const revenueScale = scaleLinear()
    .domain([0, maxRevenue > 0 ? maxRevenue : 1])
    .range([0, faceWidth * REVENUE_SCALE_WIDTH_RATIO]);

  // Activities time scale
  const activityTimestamps = data.map((a) => new Date(a.timestamp));
  let activitiesTimeScale: ScaleTime<number, number, never>;

  if (activityTimestamps.length > 0) {
    const minActivityTime = new Date(
      activityTimestamps.reduce((min, d) => Math.min(min, d.getTime()), Infinity),
    );
    const maxActivityTime = new Date(
      activityTimestamps.reduce((max, d) => Math.max(max, d.getTime()), -Infinity),
    );
    const activityTimePadding =
      (maxActivityTime.getTime() - minActivityTime.getTime()) * TIME_PADDING_RATIO ||
      DEFAULT_TIME_PADDING_MS;

    activitiesTimeScale = scaleTime()
      .domain([
        new Date(minActivityTime.getTime() - activityTimePadding),
        new Date(maxActivityTime.getTime() + activityTimePadding),
      ])
      .range(activitiesRange);
  } else {
    activitiesTimeScale = scaleTime()
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

  let opportunitiesTimeScale: ScaleTime<number, number, never>;

  if (opportunityCloseDates.length > 0) {
    const minOppTime = new Date(
      opportunityCloseDates.reduce((min, d) => Math.min(min, d.getTime()), Infinity),
    );
    const maxOppTime = new Date(
      opportunityCloseDates.reduce((max, d) => Math.max(max, d.getTime()), -Infinity),
    );
    const oppTimePadding =
      (maxOppTime.getTime() - minOppTime.getTime()) * TIME_PADDING_RATIO ||
      DEFAULT_TIME_PADDING_MS;

    const domainMin = new Date(minOppTime.getTime() - oppTimePadding);
    const domainMax = new Date(maxOppTime.getTime() + oppTimePadding);

    // Calculate where earliest bucket would render with natural domain
    const tempScale = scaleTime()
      .domain([domainMin, domainMax])
      .range(opportunitiesPlotRange);

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
      if (earliestBucketY < opportunitiesPlotRange[0]) {
        const timeSpanMs = domainMax.getTime() - domainMin.getTime();
        const pixelSpan = opportunitiesPlotRange[1] - opportunitiesPlotRange[0];
        const shiftMs =
          ((opportunitiesPlotRange[0] - earliestBucketY) / pixelSpan) *
          timeSpanMs;
        adjustedDomainMin = new Date(domainMin.getTime() - shiftMs);
      }
    }

    opportunitiesTimeScale = scaleTime()
      .domain([adjustedDomainMin, domainMax])
      .range(opportunitiesPlotRange);
  } else {
    opportunitiesTimeScale = scaleTime()
      .domain([new Date(0), new Date(1)])
      .range(opportunitiesPlotRange);
  }

  // Beam X scale placeholder (will be created in render functions)
  const beamXScale = scaleLinear()
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
 * Handles split domain:
 * - Ordinal 0 (Opportunity-Free): Centered in the face.
 * - Positive Ordinals (Right Bound): Mapped to right of face.
 * - Negative Ordinals (Left Bound): Mapped to left of face.
 */
export function createBeamXScale(
  ordinalPositions: number[],
  layout: LayoutDimensions,
): (ordinal: number) => number {
  const { width, margin, faceLeft, faceWidth } = layout;
  const faceRight = faceLeft + faceWidth;

  const maxOrdinal =
    ordinalPositions.length > 0
      ? ordinalPositions.reduce((max, p) => Math.max(max, Math.abs(p)), 0)
      : 0;

  // Create two linear scales for the left and right sides
  const leftScale = scaleLinear()
    .domain([-maxOrdinal - 0.5, -0.5])
    .range([margin.left, faceLeft]);

  const rightScale = scaleLinear()
    .domain([0.5, maxOrdinal + 0.5])
    .range([faceRight, width - margin.right]);

  return (ordinal: number) => {
    if (ordinal === 0) {
      return faceLeft + faceWidth / 2;
    }
    if (ordinal > 0) {
      return rightScale(ordinal);
    }
    return leftScale(ordinal);
  };
}

function getMaxRevenue(buckets: FaceBucket[]): number {
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
