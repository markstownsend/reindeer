import * as d3 from "d3";
import { getMonthYearLabel } from "../../../utils/dataTransform";
import type { LayoutDimensions, ChartScales } from "../../../utils/scales";
import type { FaceBucket, StackedOpportunity } from "../../../types/reindeer";
import { STAGE_COLORS, DEFAULT_STAGE_COLOR } from "./styles";

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}

export interface RenderFaceOptions {
  buckets: FaceBucket[];
  stacked: StackedOpportunity[];
  layout: LayoutDimensions;
  scales: ChartScales;
  width: number;
  height: number;
}

/**
 * Renders the Face layer (opportunity buckets and bars).
 */
export function renderFace(
  faceLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: RenderFaceOptions,
): Map<string, { x: number; y: number }> {
  const { buckets, stacked: _stacked, layout, scales, width } = options;
  const {
    faceWidth,
    faceLeft,
    activitiesHeight,
    opportunitiesHeight,
    barHeight,
    margin,
  } = layout;
  const { opportunitiesTimeScale, revenueScale } = scales;

  const opportunityPositions = new Map<string, { x: number; y: number }>();
  const minBarWidth = 4;

  // Empty section messages
  const hasOpportunities = buckets.length > 0;
  if (!hasOpportunities) {
    faceLayer
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top + activitiesHeight + opportunitiesHeight / 2)
      .attr("text-anchor", "middle")
      .attr("class", "fill-gray-500 text-sm")
      .text("No opportunities to display");
  }

  // Title
  faceLayer
    .append("text")
    .attr("x", faceLeft + faceWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("class", "fill-white text-lg font-semibold")
    .text("Monthly Opportunity Buckets");

  if (buckets.length === 0) {
    return opportunityPositions;
  }

  // Calculate face boundary with padding
  const facePadding = 30;
  const faceBoundaryTop = margin.top + activitiesHeight + facePadding;
  const faceBoundaryHeight = opportunitiesHeight - facePadding * 2;

  // Face boundary rectangle (surrounds all opportunities)
  faceLayer
    .append("rect")
    .attr("x", faceLeft)
    .attr("y", faceBoundaryTop)
    .attr("width", faceWidth)
    .attr("height", faceBoundaryHeight)
    .attr("class", "fill-transparent stroke-orange-500")
    .attr("stroke-width", 2)
    .attr("rx", 8);

  // Create a scale that maps to the padded face boundary
  const originalDomain = opportunitiesTimeScale.domain();
  const paddedTimeScale = d3
    .scaleTime()
    .domain(originalDomain)
    .range([faceBoundaryTop, faceBoundaryTop + faceBoundaryHeight - barHeight]);

  // Render buckets
  for (const bucket of buckets) {
    let year = 0;
    let month = 0;

    // Parse bucketId "YYYY-MM"
    if (bucket.bucketId.includes("-")) {
      const parts = bucket.bucketId.split("-");
      if (parts.length === 2 && !bucket.bucketId.includes("Q")) {
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1; // 0-based
      }
    }

    const monthLabel = getMonthYearLabel(year, month);
    const bucketDate = new Date(year, month, 1);
    // Use padded scale to fit buckets inside the face boundary
    const bucketY = paddedTimeScale(bucketDate);

    // Month label (inside the boundary rectangle)
    faceLayer
      .append("text")
      .attr("x", faceLeft + facePadding)
      .attr("y", bucketY + barHeight / 2)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-orange-300 text-xs font-medium")
      .text(monthLabel);

    // Bucket background
    faceLayer
      .append("rect")
      .attr("x", faceLeft + facePadding)
      .attr("y", bucketY)
      .attr("width", faceWidth - facePadding * 2)
      .attr("height", barHeight)
      .attr("class", "fill-gray-800")
      .attr("rx", 2);

    // Calculate bar widths based on revenue
    const initialBarWidths = bucket.opportunities.map((opp) =>
      Math.max(minBarWidth, revenueScale(opp.revenue)),
    );
    const totalInitialBarWidth = initialBarWidths.reduce(
      (sum, w) => sum + w,
      0,
    );
    const totalSpacing = (initialBarWidths.length - 1) * 2;
    const availableWidth = faceWidth - facePadding * 2;
    const totalInitialWidth = totalInitialBarWidth + totalSpacing;

    // Scaling factor if bars exceed face width
    const scalingFactor =
      totalInitialWidth > availableWidth
        ? (availableWidth - totalSpacing) / totalInitialBarWidth
        : 1;

    let xOffset = faceLeft + facePadding;

    for (let i = 0; i < bucket.opportunities.length; i++) {
      const opp = bucket.opportunities[i];
      const unscaledWidth = initialBarWidths[i];
      const barWidth = unscaledWidth * scalingFactor;
      const spacing = i < bucket.opportunities.length - 1 ? 2 : 0;

      const oppGroup = faceLayer.append("g").attr("class", "opportunity-bar");

      // Bar rectangle
      oppGroup
        .append("rect")
        .attr("x", xOffset)
        .attr("y", bucketY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("class", `${getStageColor(opp.stage)} stroke-gray-700`)
        .attr("stroke-width", 1)
        .attr("rx", 2);

      // Revenue label if bar is wide enough
      if (barWidth > 40) {
        oppGroup
          .append("text")
          .attr("x", xOffset + barWidth / 2)
          .attr("y", bucketY + barHeight / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-white text-xs font-medium")
          .text(`$${(opp.revenue / 1000).toFixed(0)}k`);
      }

      // Store opportunity position for burr connections
      opportunityPositions.set(opp.id, {
        x: xOffset + barWidth / 2,
        y: bucketY + barHeight / 2,
      });

      xOffset += barWidth + spacing;
    }

    // Total revenue label
    const totalRevenueText = `$${(bucket.totalRevenue / 1000).toFixed(0)}k`;
    faceLayer
      .append("text")
      .attr("x", faceLeft + faceWidth + 5)
      .attr("y", bucketY + barHeight / 2)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-gray-400 text-xs")
      .text(totalRevenueText);
  }

  return opportunityPositions;
}
