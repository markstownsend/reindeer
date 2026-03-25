import type { Selection } from "d3-selection";
import type { StageAggregationResult, FaceBucket } from "../../../types/reindeer";
import type { LayoutDimensions } from "../../../utils/scales";
import { getStageColor } from "./styles";

export interface RenderNoseOptions {
  stageData: StageAggregationResult;
  layout: LayoutDimensions;
  focusedOppIds?: Set<string>;
  faceBuckets?: FaceBucket[];
}

/**
 * Renders the "nose" — two inline summary bars showing pipeline by stage.
 * Top bar: full pipeline. Bottom bar: focused subset (only when focus active).
 */
export function renderNose(
  noseLayer: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderNoseOptions,
): void {
  const { stageData, layout, focusedOppIds, faceBuckets } = options;
  const { faceLeft, faceWidth, noseRange } = layout;
  const { buckets, allStagesRevenueTotal } = stageData;
  const hasFocus = focusedOppIds && focusedOppIds.size > 0;

  const [noseTop] = noseRange;
  const barHeight = 14;
  const barGap = 6;
  const labelHeight = 12;
  const padding = 8;
  const barLeft = faceLeft + padding;
  const barWidth = faceWidth - padding * 2;
  const barY = noseTop + 8;

  if (buckets.length === 0 || allStagesRevenueTotal <= 0) {
    noseLayer
      .append("text")
      .attr("x", faceLeft + faceWidth / 2)
      .attr("y", barY + barHeight / 2)
      .attr("text-anchor", "middle")
      .attr("class", "fill-gray-500 text-xs")
      .text("No pipeline data");
    return;
  }

  const formatRevenue = (v: number) =>
    v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : `$${Math.round(v / 1000)}k`;

  // --- Full pipeline bar ---
  noseLayer
    .append("text")
    .attr("x", barLeft)
    .attr("y", barY - 2)
    .attr("class", "fill-gray-400 text-[9px]")
    .text(`Pipeline ${formatRevenue(allStagesRevenueTotal)}`);

  // Background
  noseLayer
    .append("rect")
    .attr("x", barLeft)
    .attr("y", barY)
    .attr("width", barWidth)
    .attr("height", barHeight)
    .attr("class", "fill-gray-800")
    .attr("rx", 3);

  // Segments
  let xOffset = barLeft;
  for (const bucket of buckets) {
    if (bucket.opportunityRevenueTotal <= 0) continue;
    const segWidth = (bucket.opportunityRevenueTotal / allStagesRevenueTotal) * barWidth;
    noseLayer
      .append("rect")
      .attr("x", xOffset)
      .attr("y", barY)
      .attr("width", segWidth)
      .attr("height", barHeight)
      .attr("class", `${getStageColor(bucket.stage)}`)
      .attr("opacity", 0.9)
      .attr("rx", 1);
    if (segWidth > 35) {
      noseLayer
        .append("text")
        .attr("x", xOffset + segWidth / 2)
        .attr("y", barY + barHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-white text-[8px] font-medium")
        .text(formatRevenue(bucket.opportunityRevenueTotal));
    }
    xOffset += segWidth;
  }

  // --- Focused pipeline bar (only when focus active) ---
  if (hasFocus && faceBuckets) {
    const focusedByStage = new Map<string, number>();
    let focusedTotal = 0;
    for (const bucket of faceBuckets) {
      for (const opp of bucket.opportunities) {
        if (focusedOppIds.has(opp.id)) {
          focusedTotal += opp.revenue;
          focusedByStage.set(opp.stage, (focusedByStage.get(opp.stage) || 0) + opp.revenue);
        }
      }
    }

    const focusedBarY = barY + barHeight + barGap + labelHeight;

    noseLayer
      .append("text")
      .attr("x", barLeft)
      .attr("y", focusedBarY - 2)
      .attr("class", "fill-blue-400 text-[9px]")
      .text(`Focused ${formatRevenue(focusedTotal)}`);

    // Background (same width as full bar for scale comparison)
    noseLayer
      .append("rect")
      .attr("x", barLeft)
      .attr("y", focusedBarY)
      .attr("width", barWidth)
      .attr("height", barHeight)
      .attr("class", "fill-gray-800")
      .attr("opacity", 0.3)
      .attr("rx", 3);

    // Segments (same scale as full pipeline bar)
    let fxOffset = barLeft;
    for (const bucket of buckets) {
      const stageRevenue = focusedByStage.get(bucket.stage) || 0;
      if (stageRevenue <= 0) continue;
      const segWidth = (stageRevenue / allStagesRevenueTotal) * barWidth;
      noseLayer
        .append("rect")
        .attr("x", fxOffset)
        .attr("y", focusedBarY)
        .attr("width", segWidth)
        .attr("height", barHeight)
        .attr("class", `${getStageColor(bucket.stage)}`)
        .attr("opacity", 0.9)
        .attr("rx", 1);
      if (segWidth > 35) {
        noseLayer
          .append("text")
          .attr("x", fxOffset + segWidth / 2)
          .attr("y", focusedBarY + barHeight / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-white text-[8px] font-medium")
          .text(formatRevenue(stageRevenue));
      }
      fxOffset += segWidth;
    }
  }
}
