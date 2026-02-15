import * as d3 from "d3";
import { YearGroup, getMonthYearLabel } from "../../../utils/dataTransform";
import { LayoutDimensions, ChartScales } from "../../../utils/scales";
import { STAGE_COLORS, DEFAULT_STAGE_COLOR } from "./styles";

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}

export interface RenderFaceOptions {
  yearGroups: YearGroup[];
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
  const { yearGroups, layout, scales, width } = options;
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
  const hasOpportunities = yearGroups.some((yg) => yg.buckets.length > 0);
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

  if (yearGroups.length === 0) {
    return opportunityPositions;
  }

  // Render year groups and buckets
  for (const yearGroup of yearGroups) {
    // Render buckets
    for (const bucket of yearGroup.buckets) {
      const monthLabel = getMonthYearLabel(bucket.year, bucket.month);
      const bucketDate = new Date(bucket.year, bucket.month, 1);
      const bucketY = opportunitiesTimeScale(bucketDate);

      // Month label
      faceLayer
        .append("text")
        .attr("x", faceLeft - 10)
        .attr("y", bucketY + barHeight / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-gray-400 text-xs")
        .text(monthLabel);

      // Bucket background
      faceLayer
        .append("rect")
        .attr("x", faceLeft)
        .attr("y", bucketY)
        .attr("width", faceWidth)
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
      const totalInitialWidth = totalInitialBarWidth + totalSpacing;

      // Scaling factor if bars exceed face width
      const scalingFactor =
        totalInitialWidth > faceWidth
          ? (faceWidth - totalSpacing) / totalInitialBarWidth
          : 1;

      let xOffset = faceLeft;

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
  }

  return opportunityPositions;
}
