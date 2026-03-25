import { scaleTime } from "d3-scale";
import type { Selection } from "d3-selection";
import { getMonthYearLabel } from "../../../utils/dataTransform";
import type { LayoutDimensions, ChartScales } from "../../../utils/scales";
import type { FaceBucket } from "../../../types/reindeer";
import { getStageColor } from "./styles";

export interface RenderFaceOptions {
  buckets: FaceBucket[];
  layout: LayoutDimensions;
  scales: ChartScales;
  focusedOppIds?: Set<string>;
  filteredOppIds?: Set<string>;
  width: number;
}

/**
 * Renders the Face layer (opportunity buckets and bars).
 */
export function renderFace(
  faceLayer: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderFaceOptions,
): Map<string, { x: number; y: number }> {
  const { buckets, layout, scales, width, focusedOppIds, filteredOppIds } = options;
  const hasFocus = focusedOppIds && focusedOppIds.size > 0;
  const hasFilter = filteredOppIds && filteredOppIds.size > 0;
  const {
    faceWidth,
    faceLeft,
    activitiesHeight,
    opportunitiesHeight,
    opportunitiesPlotHeight,
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
      .attr("y", margin.top + activitiesHeight + opportunitiesPlotHeight / 2)
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
    .text("Reindeer Chart");

  if (buckets.length === 0) {
    return opportunityPositions;
  }

  // Calculate face boundary with padding
  const facePadding = 30;
  // Add specific top padding for the first item
  const topItemPadding = 20;
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

  // Create a scale that maps to the padded face boundary (plot area only, above nose)
  const originalDomain = opportunitiesTimeScale.domain();
  const plotBoundaryBottom = faceBoundaryTop + (opportunitiesPlotHeight - facePadding);
  const paddedTimeScale = scaleTime()
    .domain(originalDomain)
    .range([
      faceBoundaryTop + topItemPadding,
      plotBoundaryBottom - barHeight,
    ]);

  // Layout constants for labels
  const dateLabelWidth = 50;
  const internalPadding = 8;
  const barAreaLeft = faceLeft + dateLabelWidth + internalPadding;
  const barAreaWidth =
    faceWidth - dateLabelWidth - internalPadding * 2;

  // Render buckets
  for (let bucketIdx = 0; bucketIdx < buckets.length; bucketIdx++) {
    const bucket = buckets[bucketIdx];
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

    // Bucket background (behind bars)
    faceLayer
      .append("rect")
      .attr("x", barAreaLeft)
      .attr("y", bucketY)
      .attr("width", barAreaWidth)
      .attr("height", barHeight)
      .attr("class", "fill-gray-800")
      .attr("rx", 2);

    // Month label — alternate left/right to avoid crowding (rendered after background)
    const labelOnRight = bucketIdx % 2 === 1;
    faceLayer
      .append("text")
      .attr("x", labelOnRight ? faceLeft + faceWidth - internalPadding : faceLeft + internalPadding)
      .attr("y", bucketY + barHeight / 2)
      .attr("text-anchor", labelOnRight ? "end" : "start")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-orange-500 text-xs font-medium")
      .text(monthLabel);

    // Calculate bar widths based on revenue
    const initialBarWidths = bucket.opportunities.map((opp) =>
      Math.max(minBarWidth, revenueScale(opp.revenue)),
    );
    const totalInitialBarWidth = initialBarWidths.reduce(
      (sum, w) => sum + w,
      0,
    );
    const totalSpacing = (initialBarWidths.length - 1) * 2;
    // Use barAreaWidth instead of previous availableWidth
    const availableWidth = barAreaWidth;
    const totalInitialWidth = totalInitialBarWidth + totalSpacing;

    // Scaling factor if bars exceed face width
    const scalingFactor =
      totalInitialWidth > availableWidth
        ? (availableWidth - totalSpacing) / totalInitialBarWidth
        : 1;

    let xOffset = barAreaLeft;

    for (let i = 0; i < bucket.opportunities.length; i++) {
      const opp = bucket.opportunities[i];
      const unscaledWidth = initialBarWidths[i];
      const barWidth = unscaledWidth * scalingFactor;
      const spacing = i < bucket.opportunities.length - 1 ? 2 : 0;

      const isFiltered = !hasFilter || filteredOppIds.has(opp.id);
      const isFocused = !hasFocus || focusedOppIds.has(opp.id);

      // Store position for burr connections regardless of visibility
      opportunityPositions.set(opp.id, {
        x: xOffset + barWidth / 2,
        y: bucketY + barHeight / 2,
      });

      // Skip rendering if filtered out, but still advance xOffset for stable layout
      if (!isFiltered) {
        xOffset += barWidth + spacing;
        continue;
      }

      const oppGroup = faceLayer.append("g").attr("class", "opportunity-bar")
        .attr("opacity", isFocused ? 1 : 0.15);

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

      // Opportunity name and revenue if bar is wide enough
      if (barWidth > 30) {
        const displayName = opp.name || opp.id;
        const revLabel = opp.revenue >= 1000 ? `$${Math.round(opp.revenue / 1000)}k` : `$${opp.revenue}`;
        const fullLabel = `${displayName} · ${revLabel}`;
        const maxChars = Math.floor(barWidth / 5);
        const truncated = fullLabel.length > maxChars ? fullLabel.slice(0, maxChars - 1) + "…" : fullLabel;
        oppGroup
          .append("text")
          .attr("x", xOffset + barWidth / 2)
          .attr("y", bucketY + barHeight / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-white text-[8px] font-medium")
          .text(truncated);
      }

      // Hover tooltip
      oppGroup
        .style("cursor", "pointer")
        .on("mouseenter", function () {
          const tooltip = faceLayer.append("g").attr("class", "face-tooltip");
          const lines = [
            opp.name || opp.id,
            `${opp.stage} · $${(opp.revenue / 1000).toFixed(0)}k`,
            `Close: ${opp.closeDate}`,
          ];
          const tw = 130;
          const tlh = 13;
          const tp = 5;
          const tx = faceLeft + faceWidth / 2 - tw / 2;
          const ty = margin.top + activitiesHeight - (lines.length * tlh + tp * 2) - 10;

          tooltip.append("rect")
            .attr("x", tx)
            .attr("y", ty)
            .attr("width", tw)
            .attr("height", lines.length * tlh + tp * 2)
            .attr("rx", 3)
            .attr("class", "fill-gray-800")
            .attr("opacity", 0.95)
            .attr("stroke", "#6B7280")
            .attr("stroke-width", 0.5);

          lines.forEach((text, li) => {
            tooltip.append("text")
              .attr("x", tx + tp)
              .attr("y", ty + tp + li * tlh + tlh / 2)
              .attr("dominant-baseline", "middle")
              .attr("class", li === 0 ? "fill-white text-[9px] font-semibold" : "fill-gray-300 text-[8px]")
              .text(text);
          });
        })
        .on("mouseleave", function () {
          faceLayer.selectAll(".face-tooltip").remove();
        });

      xOffset += barWidth + spacing;
    }
  }

  return opportunityPositions;
}
