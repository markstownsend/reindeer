import * as d3 from "d3";
import type { StageAggregationResult } from "../../../types/reindeer";
import type { LayoutDimensions } from "../../../utils/scales";
import { STAGE_COLORS, DEFAULT_STAGE_COLOR } from "./styles";

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}

export interface RenderTeethOptions {
  stageData: StageAggregationResult;
  layout: LayoutDimensions;
}

/**
 * Renders the "teeth" layer under the opportunities section.
 *
 * - Upper histogram: revenue by stage (normalized by total stage revenue)
 * - Lower histogram: activity count by stage (normalized by total stage activity count)
 */
export function renderTeeth(
  teethLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: RenderTeethOptions,
): void {
  const { stageData, layout } = options;
  const { faceLeft, faceWidth, teethRange } = layout;
  const { buckets, allStagesRevenueTotal, allStagesActivityCountTotal } =
    stageData;

  const [teethTop, teethBottom] = teethRange;
  const teethHeight = Math.max(0, teethBottom - teethTop);

  if (teethHeight <= 0) {
    return;
  }

  const baselineY = teethTop + teethHeight / 2;
  const upperMaxHeight = Math.max(0, baselineY - teethTop - 12);
  const lowerMaxHeight = Math.max(0, teethBottom - baselineY - 18);

  teethLayer
    .append("line")
    .attr("x1", faceLeft)
    .attr("y1", baselineY)
    .attr("x2", faceLeft + faceWidth)
    .attr("y2", baselineY)
    .attr("class", "stroke-gray-500")
    .attr("stroke-width", 1.5);

  if (buckets.length === 0) {
    teethLayer
      .append("text")
      .attr("x", faceLeft + faceWidth / 2)
      .attr("y", baselineY - 8)
      .attr("text-anchor", "middle")
      .attr("class", "fill-gray-500 text-xs")
      .text("No stage data");
    return;
  }

  const stageScale = d3
    .scaleBand<string>()
    .domain(buckets.map((b) => b.stage))
    .range([faceLeft, faceLeft + faceWidth])
    .paddingInner(0.15)
    .paddingOuter(0.05);

  const revenueNorm = d3
    .scaleLinear()
    .domain([0, allStagesRevenueTotal > 0 ? allStagesRevenueTotal : 1])
    .range([0, upperMaxHeight]);

  const activityNorm = d3
    .scaleLinear()
    .domain([
      0,
      allStagesActivityCountTotal > 0 ? allStagesActivityCountTotal : 1,
    ])
    .range([0, lowerMaxHeight]);

  buckets.forEach((bucket) => {
    const x = stageScale(bucket.stage);
    const barWidth = stageScale.bandwidth();

    if (x === undefined || barWidth <= 0) {
      return;
    }

    const colorClass = getStageColor(bucket.stage);
    const revenueHeight = revenueNorm(bucket.opportunityRevenueTotal);
    const activityHeight = activityNorm(bucket.activityCountTotal);

    // Upper tooth (revenue)
    teethLayer
      .append("rect")
      .attr("x", x)
      .attr("y", baselineY - revenueHeight)
      .attr("width", barWidth)
      .attr("height", revenueHeight)
      .attr("class", `${colorClass} opacity-90`)
      .attr("rx", 2);

    // Lower tooth (activity count)
    teethLayer
      .append("rect")
      .attr("x", x)
      .attr("y", baselineY)
      .attr("width", barWidth)
      .attr("height", activityHeight)
      .attr("class", `${colorClass} opacity-55`)
      .attr("rx", 2);

    // Activity count label below the lower bar
    teethLayer
      .append("text")
      .attr("x", x + barWidth / 2)
      .attr("y", baselineY + activityHeight + 10)
      .attr("text-anchor", "middle")
      .attr("class", "fill-gray-400 text-[10px]")
      .text(bucket.activityCountTotal);

    // Stage label around the baseline
    teethLayer
      .append("text")
      .attr("x", x + barWidth / 2)
      .attr("y", baselineY + 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
      .attr("class", "fill-gray-300 text-[9px]")
      .text(bucket.stage);
  });
}
