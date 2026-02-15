import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Activity, Beam } from "../../types/reindeer";
import {
  groupOpportunitiesByMonth,
  getMaxRevenue,
  getMonthName,
  YearGroup,
} from "../../utils/dataTransform";
import { calculateBeamPositions } from "../../utils/beamAggregation";

interface ReindeerChartProps {
  width?: number;
  height?: number;
  data?: Activity[];
  faceWidthRatio?: number; // 0.0 to 1.0, default 0.6
  activitiesHeightRatio?: number; // 0.0 to 1.0, default 0.5 (proportion for activities section)
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
  faceWidthRatio = 0.6, // Default: Face occupies 60% of available width
  activitiesHeightRatio = 0.5, // Default: Activities occupy 50% of available height
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove();

    const faceLayer = svg.append("g").attr("id", "layer-face");
    const beamsLayer = svg.append("g").attr("id", "layer-beams");
    const antlersLayer = svg.append("g").attr("id", "layer-antlers");
    const burrsLayer = svg.append("g").attr("id", "layer-burrs");

    const yearGroups: YearGroup[] = groupOpportunitiesByMonth(data);
    const beams: Beam[] = calculateBeamPositions(data);
    const maxRevenue = getMaxRevenue(yearGroups);

    const margin = { top: 60, right: 40, bottom: 40, left: 80 };
    const validatedFaceWidthRatio = Math.max(
      0.1,
      Math.min(1.0, faceWidthRatio),
    );
    const validatedActivitiesHeightRatio = Math.max(
      0.1,
      Math.min(0.9, activitiesHeightRatio),
    );
    const totalAvailableWidth = width - margin.left - margin.right;
    const faceWidth = totalAvailableWidth * validatedFaceWidthRatio;
    const faceLeft = margin.left + (totalAvailableWidth - faceWidth) / 2;
    const totalAvailableHeight = height - margin.top - margin.bottom;

    const revenueScale = d3
      .scaleLinear()
      .domain([0, maxRevenue > 0 ? maxRevenue : 1])
      .range([0, faceWidth * 0.8]);

    // ===== MULTIPLE VERTICAL SCALES =====
    // Outside total scale: abstract continuous scale bound by visualization size
    // Inside activities scale: time scale taking up configurable proportion
    // Inside opportunities scale: time scale taking up remaining proportion

    const activitiesHeight =
      totalAvailableHeight * validatedActivitiesHeightRatio;
    const opportunitiesHeight =
      totalAvailableHeight * (1 - validatedActivitiesHeightRatio);

    const activitiesRange = [margin.top, margin.top + activitiesHeight];
    const opportunitiesRange = [
      margin.top + activitiesHeight,
      height - margin.bottom,
    ];

    // Activities time scale
    const activityTimestamps = data.map((a) => new Date(a.timestamp));
    let activitiesTimeScale: d3.ScaleTime<number, number, never>;
    let minActivityTime: Date | null = null;
    let maxActivityTime: Date | null = null;

    if (activityTimestamps.length > 0) {
      minActivityTime = new Date(
        Math.min(...activityTimestamps.map((d) => d.getTime())),
      );
      maxActivityTime = new Date(
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
      // Fallback scale for empty activities
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
    let minOppTime: Date | null = null;
    let maxOppTime: Date | null = null;

    if (opportunityCloseDates.length > 0) {
      minOppTime = new Date(
        Math.min(...opportunityCloseDates.map((d) => d.getTime())),
      );
      maxOppTime = new Date(
        Math.max(...opportunityCloseDates.map((d) => d.getTime())),
      );
      const oppTimePadding =
        (maxOppTime.getTime() - minOppTime.getTime()) * 0.05 || 86400000;

      // Constrain opportunities scale so earliest bucket renders at start of opportunities section
      // This ensures visual separation: activities always above opportunities
      const domainMin = new Date(minOppTime.getTime() - oppTimePadding);
      const domainMax = new Date(maxOppTime.getTime() + oppTimePadding);

      // Calculate where earliest bucket would render with natural domain
      const tempScale = d3
        .scaleTime()
        .domain([domainMin, domainMax])
        .range(opportunitiesRange);

      // Find earliest bucket date from yearGroups
      let earliestBucketDate: Date | null = null;
      for (const yearGroup of yearGroups) {
        for (const bucket of yearGroup.buckets) {
          const bucketDate = new Date(bucket.year, bucket.month, 1);
          if (
            !earliestBucketDate ||
            bucketDate.getTime() < earliestBucketDate.getTime()
          ) {
            earliestBucketDate = bucketDate;
          }
        }
      }

      let adjustedDomainMin = domainMin;
      if (earliestBucketDate) {
        const earliestBucketY = tempScale(earliestBucketDate);
        if (earliestBucketY < opportunitiesRange[0]) {
          // Shift domain so earliest bucket maps to start of opportunities section
          const timeSpanMs = domainMax.getTime() - domainMin.getTime();
          const pixelSpan = opportunitiesRange[1] - opportunitiesRange[0];
          const shiftMs =
            ((opportunitiesRange[0] - earliestBucketY) / pixelSpan) *
            timeSpanMs;
          adjustedDomainMin = new Date(domainMin.getTime() - shiftMs);
        }
      }

      opportunitiesTimeScale = d3
        .scaleTime()
        .domain([adjustedDomainMin, domainMax])
        .range(opportunitiesRange);
    } else {
      // Fallback scale for empty opportunities
      opportunitiesTimeScale = d3
        .scaleTime()
        .domain([new Date(0), new Date(1)])
        .range(opportunitiesRange);
    }

    // Store opportunity positions for burr connections
    const opportunityPositions = new Map<string, { x: number; y: number }>();
    // ===== END MULTIPLE VERTICAL SCALES =====

    let totalBuckets = 0;
    for (const yearGroup of yearGroups) {
      totalBuckets += yearGroup.buckets.length;
    }
    totalBuckets += yearGroups.length;

    const rowHeight =
      totalBuckets > 0 ? Math.min(40, opportunitiesHeight / totalBuckets) : 40;
    const barHeight = rowHeight * 0.7;
    const minBarWidth = 4;

    // ===== EMPTY SECTION MESSAGES =====
    // Show empty activities section if no activities
    if (activityTimestamps.length === 0) {
      faceLayer
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + activitiesHeight / 2)
        .attr("text-anchor", "middle")
        .attr("class", "fill-gray-500 text-sm")
        .text("No activities to display");
    }

    // Show empty opportunities section if no opportunities
    if (opportunityCloseDates.length === 0) {
      faceLayer
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + activitiesHeight + opportunitiesHeight / 2)
        .attr("text-anchor", "middle")
        .attr("class", "fill-gray-500 text-sm")
        .text("No opportunities to display");
    }
    // ===== END EMPTY SECTION MESSAGES =====

    faceLayer
      .append("text")
      .attr("x", faceLeft + faceWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("class", "fill-white text-lg font-semibold")
      .text("Monthly Opportunity Buckets");

    if (yearGroups.length === 0) {
      return;
    }

    // Use opportunitiesTimeScale to position year labels and buckets
    for (const yearGroup of yearGroups) {
      // Position year label at the start of the year
      const yearStartDate = new Date(yearGroup.year, 0, 1);
      const yearY = opportunitiesTimeScale(yearStartDate);

      faceLayer
        .append("text")
        .attr("x", faceLeft - 10)
        .attr("y", yearY)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("class", "fill-white text-sm font-bold")
        .text(yearGroup.year.toString());

      faceLayer
        .append("line")
        .attr("x1", faceLeft)
        .attr("y1", yearY)
        .attr("x2", faceLeft + faceWidth)
        .attr("y2", yearY)
        .attr("stroke", "#374151")
        .attr("stroke-width", 1);

      for (const bucket of yearGroup.buckets) {
        const monthLabel = getMonthName(bucket.month);
        const bucketDate = new Date(bucket.year, bucket.month, 1);
        const bucketY = opportunitiesTimeScale(bucketDate);

        faceLayer
          .append("text")
          .attr("x", faceLeft - 10)
          .attr("y", bucketY + barHeight / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("class", "fill-gray-400 text-xs")
          .text(monthLabel);

        faceLayer
          .append("rect")
          .attr("x", faceLeft)
          .attr("y", bucketY)
          .attr("width", faceWidth)
          .attr("height", barHeight)
          .attr("class", "fill-gray-800")
          .attr("rx", 2);

        // Calculate initial bar widths based on revenue
        const initialBarWidths = bucket.opportunities.map((opp) =>
          Math.max(minBarWidth, revenueScale(opp.revenue)),
        );
        const totalInitialBarWidth = initialBarWidths.reduce(
          (sum, width) => sum + width,
          0,
        );
        const totalSpacing = (initialBarWidths.length - 1) * 2; // 2px spacing between bars
        const totalInitialWidth = totalInitialBarWidth + totalSpacing;

        // Calculate scaling factor if bars exceed face width
        // Scale only the bar widths, not the spacing
        const scalingFactor =
          totalInitialWidth > faceWidth
            ? (faceWidth - totalSpacing) / totalInitialBarWidth
            : 1;

        let xOffset = faceLeft;
        let totalBarWidth = 0;

        for (let i = 0; i < bucket.opportunities.length; i++) {
          const opp = bucket.opportunities[i];
          const unscaledWidth = initialBarWidths[i];
          const barWidth = unscaledWidth * scalingFactor;
          // Add spacing between bars (not after the last one)
          const spacing = i < bucket.opportunities.length - 1 ? 2 : 0;
          totalBarWidth += barWidth + spacing;

          const oppGroup = faceLayer
            .append("g")
            .attr("class", "opportunity-bar");

          oppGroup
            .append("rect")
            .attr("x", xOffset)
            .attr("y", bucketY)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr("class", `${getStageColor(opp.stage)} stroke-gray-700`)
            .attr("stroke-width", 1)
            .attr("rx", 2);

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

          xOffset += barWidth + 2;
        }

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

    svg
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", margin.top)
      .attr("x2", width / 2)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#4B5563")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // ===== BEAM & ANTLER RENDERING =====
    if (beams.length > 0) {
      // Create beam X scale (ordinal positions to horizontal pixel offsets)
      const maxOrdinal = Math.max(
        ...beams.map((b) => Math.abs(b.ordinalPosition)),
      );
      const beamXScale = d3
        .scaleLinear()
        .domain([-maxOrdinal - 0.5, maxOrdinal + 0.5])
        .range([margin.left, width - margin.right]);

      // Render beam edges (vertical lines) using activitiesTimeScale
      beamsLayer
        .selectAll(".beam-edge")
        .data(beams)
        .enter()
        .append("line")
        .attr("class", "beam-edge stroke-gray-600 stroke-2")
        .attr("x1", (d) => beamXScale(d.ordinalPosition))
        .attr("x2", (d) => beamXScale(d.ordinalPosition))
        .attr("y1", (d) => activitiesTimeScale(d.verticalExtent.min)) // Earliest at top
        .attr("y2", (d) => activitiesTimeScale(d.verticalExtent.max)); // Latest at bottom

      // Render activity nodes on antlers
      beams.forEach((beam) => {
        const beamX = beamXScale(beam.ordinalPosition);

        // Sort activities by timestamp for proper edge rendering
        const sortedActivities = [...beam.activities].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );

        // Render beam edges connecting sequential activities
        if (sortedActivities.length > 1) {
          const edgePath = d3
            .line<{ x: number; y: number }>()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveStepAfter);

          const edgePoints = sortedActivities.map((activity) => ({
            x: beamX,
            y: activitiesTimeScale(new Date(activity.timestamp)),
          }));

          beamsLayer
            .append("path")
            .datum(edgePoints)
            .attr(
              "class",
              "beam-activity-edge stroke-gray-500 stroke-1 fill-none",
            )
            .attr("d", edgePath);
        }

        // Render activity nodes
        sortedActivities.forEach((activity) => {
          const y = activitiesTimeScale(new Date(activity.timestamp));

          // Calculate node size based on effort (number of participants)
          const participantCount =
            activity.sellers.length + activity.customers.length;
          const nodeRadius = 4 + participantCount * 2; // Base 4px + 2px per participant

          // Create activity node group
          const nodeGroup = antlersLayer
            .append("g")
            .attr("class", "activity-node");

          // Draw node circle
          nodeGroup
            .append("circle")
            .attr("cx", beamX)
            .attr("cy", y)
            .attr("r", nodeRadius)
            .attr(
              "class",
              `${getStageColor(
                activity.linkedOpportunities[0]?.stage || "Discovery",
              )} stroke-white stroke-1`,
            )
            .attr("opacity", 0.9);

          // Northern Terminus: participant icons
          const terminusGroup = antlersLayer
            .append("g")
            .attr("class", "northern-terminus");

          // Render seller icons above the node
          activity.sellers.forEach((seller, i) => {
            const iconY = y - nodeRadius - 8 - i * 10;
            terminusGroup
              .append("circle")
              .attr("cx", beamX - 5)
              .attr("cy", iconY)
              .attr("r", 3)
              .attr("class", "fill-blue-400");
            terminusGroup
              .append("text")
              .attr("x", beamX + 2)
              .attr("y", iconY + 1)
              .attr("class", "fill-gray-400 text-[8px]")
              .text(seller.name.split(" ")[0]); // First name only
          });

          // Render customer icons
          activity.customers.forEach((customer, i) => {
            const iconY =
              y - nodeRadius - 8 - (activity.sellers.length + i) * 10;
            terminusGroup
              .append("circle")
              .attr("cx", beamX + 5)
              .attr("cy", iconY)
              .attr("r", 3)
              .attr("class", "fill-emerald-400");
            terminusGroup
              .append("text")
              .attr("x", beamX + 12)
              .attr("y", iconY + 1)
              .attr("class", "fill-gray-400 text-[8px]")
              .text(customer.name.split(" ")[0]); // First name only
          });
        });
      });

      // Add beam labels (opportunity IDs)
      beamsLayer
        .selectAll(".beam-label")
        .data(beams)
        .enter()
        .append("text")
        .attr("class", "beam-label fill-gray-400 text-xs text-center")
        .attr("x", (d) => beamXScale(d.ordinalPosition))
        .attr("y", height - 10)
        .text((d) => d.activities[0]?.linkedOpportunities[0]?.id || "Unknown");

      // ===== BURR RENDERING =====
      // Draw horizontal lines connecting beams (activities scale) to their opportunities (opportunities scale)
      beams.forEach((beam) => {
        const beamX = beamXScale(beam.ordinalPosition);
        const latestActivityDate = beam.verticalExtent.max;
        const beamBottomY = activitiesTimeScale(latestActivityDate);

        // Get the opportunity ID from the beam's activities
        const opportunityId = beam.activities[0]?.linkedOpportunities[0]?.id;

        if (opportunityId && opportunityPositions.has(opportunityId)) {
          const oppPosition = opportunityPositions.get(opportunityId)!;

          // Draw burr line from beam bottom to opportunity
          burrsLayer
            .append("line")
            .attr(
              "class",
              "burr-line stroke-gray-500 stroke-1 stroke-dasharray-3,3",
            )
            .attr("x1", beamX)
            .attr("y1", beamBottomY)
            .attr("x2", oppPosition.x)
            .attr("y2", oppPosition.y);
        }
      });
      // ===== END BURR RENDERING =====
    }
  }, [width, height, data, faceWidthRatio, activitiesHeightRatio]);

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
