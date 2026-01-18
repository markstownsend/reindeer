import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Activity } from "../../types/reindeer";
import {
  groupOpportunitiesByMonth,
  getMaxRevenue,
  getMonthName,
  YearGroup,
} from "../../utils/dataTransform";

interface ReindeerChartProps {
  width?: number;
  height?: number;
  data?: Activity[];
}

const STAGE_COLORS: Record<string, string> = {
  Discovery: "fill-indigo-400",
  Proposal: "fill-purple-400",
  Qualified: "fill-blue-400",
  Closing: "fill-green-400",
  "Closed Won": "fill-emerald-500",
  "Closed Lost": "fill-red-400",
};

const DEFAULT_STAGE_COLOR = "fill-gray-400";

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}

export const ReindeerChart: React.FC<ReindeerChartProps> = ({
  width = 800,
  height = 600,
  data = [],
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const faceLayer = svg.append("g").attr("id", "layer-face");

    const yearGroups: YearGroup[] = groupOpportunitiesByMonth(data);
    const maxRevenue = getMaxRevenue(yearGroups);

    const margin = { top: 60, right: 40, bottom: 40, left: 80 };
    const faceWidth = width - margin.left - margin.right;
    const faceHeight = height - margin.top - margin.bottom;

    const revenueScale = d3
      .scaleLinear()
      .domain([0, maxRevenue > 0 ? maxRevenue : 1])
      .range([0, faceWidth * 0.8]);

    let totalBuckets = 0;
    for (const yearGroup of yearGroups) {
      totalBuckets += yearGroup.buckets.length;
    }
    totalBuckets += yearGroups.length;

    const rowHeight = totalBuckets > 0 ? Math.min(40, faceHeight / totalBuckets) : 40;
    const barHeight = rowHeight * 0.7;
    const minBarWidth = 4;

    faceLayer
      .append("text")
      .attr("x", margin.left + faceWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("class", "fill-white text-lg font-semibold")
      .text("Monthly Opportunity Buckets");

    if (yearGroups.length === 0) {
      faceLayer
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "fill-gray-500 text-sm")
        .text("No opportunities to display");
      return;
    }

    let currentY = margin.top;

    for (const yearGroup of yearGroups) {
      faceLayer
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", currentY + rowHeight / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-white text-sm font-bold")
        .text(yearGroup.year.toString());

      faceLayer
        .append("line")
        .attr("x1", margin.left)
        .attr("y1", currentY)
        .attr("x2", margin.left + faceWidth)
        .attr("y2", currentY)
        .attr("stroke", "#374151")
        .attr("stroke-width", 1);

      currentY += rowHeight * 0.5;

      for (const bucket of yearGroup.buckets) {
        const monthLabel = getMonthName(bucket.month);

        faceLayer
          .append("text")
          .attr("x", margin.left - 10)
          .attr("y", currentY + barHeight / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-gray-400 text-xs")
          .text(monthLabel);

        faceLayer
          .append("rect")
          .attr("x", margin.left)
          .attr("y", currentY)
          .attr("width", faceWidth)
          .attr("height", barHeight)
          .attr("class", "fill-gray-800")
          .attr("rx", 2);

        let xOffset = margin.left;

        for (const opp of bucket.opportunities) {
          const barWidth = Math.max(minBarWidth, revenueScale(opp.revenue));

          const oppGroup = faceLayer.append("g").attr("class", "opportunity-bar");

          oppGroup
            .append("rect")
            .attr("x", xOffset)
            .attr("y", currentY)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr("class", `${getStageColor(opp.stage)} stroke-gray-700`)
            .attr("stroke-width", 1)
            .attr("rx", 2);

          if (barWidth > 40) {
            oppGroup
              .append("text")
              .attr("x", xOffset + barWidth / 2)
              .attr("y", currentY + barHeight / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("class", "fill-white text-xs font-medium")
              .text(`$${(opp.revenue / 1000).toFixed(0)}k`);
          }

          xOffset += barWidth + 2;
        }

        const totalRevenueText = `$${(bucket.totalRevenue / 1000).toFixed(0)}k`;
        faceLayer
          .append("text")
          .attr("x", margin.left + faceWidth + 5)
          .attr("y", currentY + barHeight / 2)
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-gray-400 text-xs")
          .text(totalRevenueText);

        currentY += rowHeight;
      }

      currentY += rowHeight * 0.3;
    }

    const legendY = height - 25;
    const legendX = margin.left;
    const legendItems = Object.entries(STAGE_COLORS);
    const legendSpacing = 100;

    for (let i = 0; i < legendItems.length; i++) {
      const [stage, colorClass] = legendItems[i];
      const itemX = legendX + i * legendSpacing;

      faceLayer
        .append("rect")
        .attr("x", itemX)
        .attr("y", legendY)
        .attr("width", 12)
        .attr("height", 12)
        .attr("class", colorClass)
        .attr("rx", 2);

      faceLayer
        .append("text")
        .attr("x", itemX + 16)
        .attr("y", legendY + 6)
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-gray-400 text-xs")
        .text(stage);
    }

    svg
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", margin.top)
      .attr("x2", width / 2)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#4B5563")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");
  }, [width, height, data]);

  return (
    <div className="reindeer-root w-full h-full flex justify-center items-center bg-gray-800 p-4 rounded-lg">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900 rounded shadow-lg"
      />
    </div>
  );
};
