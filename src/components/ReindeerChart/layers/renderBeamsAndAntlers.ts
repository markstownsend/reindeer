import { timeFormat } from "d3-time-format";
import { timeMonth } from "d3-time";
import { line, curveStepAfter } from "d3-shape";
import { select } from "d3-selection";
import type { Selection } from "d3-selection";
import type { Activity, Beam } from "../../../types/reindeer";
import type { ChartScales, LayoutDimensions } from "../../../utils/scales";
import { createBeamXScale } from "../../../utils/scales";
import { getStageColor } from "./styles";
import { activityShapePath } from "../../../utils/activityShape";
import { countryToFlag } from "../../../utils/countryFlag";

export interface RenderBeamsAndAntlersOptions {
  beams: Beam[];
  layout: LayoutDimensions;
  scales: ChartScales;
  opportunityPositions: Map<string, { x: number; y: number }>;
  focusedPeople?: Set<string>;
  focusMode?: "or" | "and";
}

/**
 * Renders the Beams and Antlers layers.
 * Beams are the vertical lines, Antlers are the activity nodes.
 */
export function renderBeamsAndAntlers(
  beamsLayer: Selection<SVGGElement, unknown, null, undefined>,
  antlersLayer: Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBeamsAndAntlersOptions,
): void {
  const { beams, layout, scales, opportunityPositions, focusedPeople, focusMode } = options;
  const { activitiesTimeScale } = scales;

  const hasFocus = focusedPeople && focusedPeople.size > 0;

  const activityHasPerson = (a: Activity): boolean => {
    if (a.sellers.some((s) => focusedPeople!.has(s.name))) return true;
    if (a.customers.some((c) => focusedPeople!.has(c.name))) return true;
    if ((a.partners || []).some((p) => focusedPeople!.has(p.name))) return true;
    return false;
  };

  const isBeamFocused = (beam: Beam): boolean => {
    if (!hasFocus) return true;
    if (focusMode === "and") {
      // Every focused person must appear on at least one activity in this beam
      return Array.from(focusedPeople!).every((person) =>
        beam.activities.some((a) =>
          a.sellers.some((s) => s.name === person) ||
          a.customers.some((c) => c.name === person) ||
          (a.partners || []).some((p) => p.name === person),
        ),
      );
    }
    // OR mode: any focused person on any activity
    return beam.activities.some(activityHasPerson);
  };

  const isActivityFocused = (activity: Activity): boolean => {
    if (!hasFocus) return true;
    if (focusMode === "and") {
      const names = [
        ...activity.sellers.map((s) => s.name),
        ...activity.customers.map((c) => c.name),
        ...(activity.partners || []).map((p) => p.name),
      ];
      return Array.from(focusedPeople!).every((person) => names.includes(person));
    }
    return activityHasPerson(activity);
  };

  // Render faint monthly timeline gridlines within the activities section
  const tickFormatter = timeFormat("%m-%y");
  const monthlyTicks = activitiesTimeScale.ticks(timeMonth.every(1)!);
  const activitiesTop = layout.margin.top;
  const activitiesBottom = layout.margin.top + layout.activitiesHeight;
  const timelineTicksInRange = monthlyTicks.filter((tick) => {
    const y = activitiesTimeScale(tick);
    return y >= activitiesTop && y <= activitiesBottom;
  });

  const tickStep = Math.max(1, Math.ceil(timelineTicksInRange.length / 10));
  const timelineTicks = timelineTicksInRange.filter(
    (_, index) => index % tickStep === 0,
  );

  const timelineClipPathId = "activity-timeline-clip";
  beamsLayer
    .append("clipPath")
    .attr("id", timelineClipPathId)
    .append("rect")
    .attr("x", layout.margin.left)
    .attr("y", activitiesTop)
    .attr("width", layout.width - layout.margin.left - layout.margin.right)
    .attr("height", layout.activitiesHeight);

  const timelineGridGroup = beamsLayer
    .append("g")
    .attr("class", "activity-timeline-grid")
    .attr("clip-path", `url(#${timelineClipPathId})`);

  timelineGridGroup
    .selectAll(".timeline-gridline")
    .data(timelineTicks)
    .enter()
    .append("line")
    .attr("class", "timeline-gridline stroke-gray-500")
    .attr("stroke-opacity", 0.25)
    .attr("stroke-width", 1)
    .attr("x1", layout.margin.left)
    .attr("x2", layout.width - layout.margin.right)
    .attr("y1", (d) => activitiesTimeScale(d))
    .attr("y2", (d) => activitiesTimeScale(d));

  const timelineLabelGroup = beamsLayer
    .append("g")
    .attr("class", "activity-timeline-labels");

  timelineLabelGroup
    .selectAll(".timeline-gridlabel")
    .data(timelineTicks)
    .enter()
    .append("text")
    .attr("class", "timeline-gridlabel fill-gray-400 text-[10px]")
    .attr("x", layout.margin.left - 10)
    .attr("y", (d) => activitiesTimeScale(d))
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("opacity", 0.9)
    .text((d) => tickFormatter(d));

  if (beams.length === 0) {
    return;
  }

  // Create beam X scale based on actual ordinal positions and layout
  const ordinalPositions = beams.map((b) => b.ordinalPosition);
  const beamXScale = createBeamXScale(ordinalPositions, layout);

  // Render beam edges (vertical lines)
  beamsLayer
    .selectAll(".beam-edge")
    .data(beams)
    .enter()
    .append("line")
    .attr("class", "beam-edge stroke-gray-600 stroke-2")
    .attr("opacity", (d) => isBeamFocused(d) ? 1 : 0.15)
    .attr("x1", (d) => beamXScale(d.ordinalPosition))
    .attr("x2", (d) => beamXScale(d.ordinalPosition))
    .attr("y1", (d) => activitiesTimeScale(d.verticalExtent.min))
    .attr("y2", (d) => {
      // Extend beam down to its connection point
      if (d.type === "bound" && d.linkedOpportunityId) {
        // Connect to opportunity Y
        const oppPos = opportunityPositions.get(d.linkedOpportunityId);
        if (oppPos) {
          return oppPos.y;
        }
      } else if (d.type === "free") {
        // Connect to top edge of face (activities/opportunities boundary)
        return layout.margin.top + layout.activitiesHeight;
      }
      // Fallback to max activity time
      return activitiesTimeScale(d.verticalExtent.max);
    });

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
      const edgePath = line<{ x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(curveStepAfter);

      const edgePoints = sortedActivities.map((activity) => ({
        x: beamX,
        y: activitiesTimeScale(new Date(activity.timestamp)),
      }));

      beamsLayer
        .append("path")
        .datum(edgePoints)
        .attr("class", "beam-activity-edge stroke-gray-500 stroke-1 fill-none")
        .attr("d", edgePath)
        .attr("opacity", isBeamFocused(beam) ? 1 : 0.15);
    }

    // Render activity nodes (circles only — names shown at terminus and on hover)
    sortedActivities.forEach((activity) => {
      const y = activitiesTimeScale(new Date(activity.timestamp));

      const nodeRadius = 3;

      const nodeGroup = antlersLayer.append("g").attr("class", "activity-node");

      nodeGroup
        .append("path")
        .attr("d", activityShapePath(activity.type, nodeRadius))
        .attr("transform", `translate(${beamX},${y})`)
        .attr(
          "class",
          `${getStageColor(
            activity.linkedOpportunities[0]?.stage || "Prospect",
          )} stroke-white stroke-1`,
        )
        .attr("opacity", isActivityFocused(activity) ? 0.9 : 0.1)
        .style("cursor", "pointer")
        .on("mouseenter", function () {
          const tooltip = antlersLayer
            .append("g")
            .attr("class", "activity-tooltip");

          const entries: { text: string; colorClass: string }[] = [];
          const actDate = new Date(activity.timestamp);
          const dateStr = `${actDate.getDate()} ${actDate.toLocaleString("en", { month: "short", year: "2-digit" })}`;
          entries.push({ text: `${(activity.type || "meeting").toUpperCase()} · ${dateStr}`, colorClass: "fill-white" });
          activity.sellers.forEach((s) => entries.push({
            text: `${countryToFlag(s.country)} ${s.name.split(" ")[0]}`,
            colorClass: "fill-blue-300",
          }));
          activity.customers.forEach((c) => entries.push({
            text: `${countryToFlag(c.country)} ${c.name.split(" ")[0]}`,
            colorClass: "fill-emerald-300",
          }));
          (activity.partners || []).forEach((p) => entries.push({
            text: `${countryToFlag(p.country)} ${p.name.split(" ")[0]}`,
            colorClass: "fill-orange-300",
          }));

          const tooltipX = beamX + nodeRadius + 6;
          const tooltipY = y - (entries.length * 12) / 2;
          const padding = 4;
          const lineHeight = 12;
          const maxChars = entries.reduce((max, e) => Math.max(max, e.text.length), 0);
          const textWidth = Math.max(70, maxChars * 5.5);

          tooltip
            .append("rect")
            .attr("x", tooltipX - padding)
            .attr("y", tooltipY - padding - 2)
            .attr("width", textWidth + padding * 2)
            .attr("height", entries.length * lineHeight + padding * 2)
            .attr("rx", 3)
            .attr("class", "fill-gray-800")
            .attr("opacity", 0.9)
            .attr("stroke", "#6B7280")
            .attr("stroke-width", 0.5);

          entries.forEach((entry, i) => {
            tooltip
              .append("text")
              .attr("x", tooltipX)
              .attr("y", tooltipY + i * lineHeight + lineHeight / 2)
              .attr("dominant-baseline", "middle")
              .attr("class", `${entry.colorClass} text-[9px]`)
              .text(entry.text);
          });
        })
        .on("mouseleave", function () {
          antlersLayer.selectAll(".activity-tooltip").remove();
        });
    });

    // Northern Terminus: compact pill (name + revenue + count), expands on hover
    const uniqueSellers = new Map<string, string | undefined>();
    const uniqueCustomers = new Map<string, string | undefined>();
    const uniquePartners = new Map<string, string | undefined>();
    beam.activities.forEach((a) => {
      a.sellers.forEach((s) => { if (!uniqueSellers.has(s.name)) uniqueSellers.set(s.name, s.country); });
      a.customers.forEach((c) => { if (!uniqueCustomers.has(c.name)) uniqueCustomers.set(c.name, c.country); });
      (a.partners || []).forEach((p) => { if (!uniquePartners.has(p.name)) uniquePartners.set(p.name, p.country); });
    });

    let oppName = "";
    let oppRevenue = 0;
    let oppStage = "";
    let oppTs = 0;
    if (beam.linkedOpportunityId) {
      for (const a of beam.activities) {
        const ts = new Date(a.timestamp).getTime();
        const opp = a.linkedOpportunities.find((o) => o.id === beam.linkedOpportunityId);
        if (opp) {
          if (opp.name) oppName = opp.name;
          if (opp.revenue > oppRevenue) oppRevenue = opp.revenue;
          if (ts > oppTs) { oppStage = opp.stage; oppTs = ts; }
        }
      }
      if (!oppName) oppName = beam.linkedOpportunityId;
    } else {
      oppName = "Unlinked";
    }

    const topY = activitiesTimeScale(beam.verticalExtent.min);
    const activityCount = beam.activities.length;
    const revenueLabel = oppRevenue >= 1000 ? `$${Math.round(oppRevenue / 1000)}k` : `$${oppRevenue}`;

    // Compact pill dimensions
    const pillWidth = 54;
    const pillHeight = 32;
    const pillX = beamX - pillWidth / 2;
    const pillY = Math.max(layout.margin.top, topY - 6 - pillHeight);

    const terminusGroup = antlersLayer
      .append("g")
      .attr("class", "northern-terminus")
      .attr("cursor", "pointer");

    terminusGroup.attr("opacity", isBeamFocused(beam) ? 1 : 0.15);

    const stageStroke = getStageColor(oppStage).replace("fill-", "stroke-");

    // Compact pill (always visible)
    terminusGroup
      .append("rect")
      .attr("x", pillX)
      .attr("y", pillY)
      .attr("width", pillWidth)
      .attr("height", pillHeight)
      .attr("rx", 4)
      .attr("class", `fill-gray-800 ${stageStroke}`)
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.9);

    terminusGroup
      .append("text")
      .attr("x", pillX + pillWidth / 2)
      .attr("y", pillY + 10)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-orange-400 text-[7px] font-semibold")
      .text(oppName.length > 10 ? oppName.slice(0, 9) + "…" : oppName);

    terminusGroup
      .append("text")
      .attr("x", pillX + pillWidth / 2)
      .attr("y", pillY + 23)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-gray-300 text-[7px]")
      .text(`${revenueLabel} · ${activityCount}`);

    // Expanded panel (hidden, shown on hover)
    const lineHeight = 12;
    const padding = { x: 6, y: 5 };
    const totalNames = uniqueSellers.size + uniqueCustomers.size + uniquePartners.size;
    const headerHeight = 26;
    const expandedHeight = totalNames * lineHeight + padding.y * 2 + headerHeight;
    const expandedWidth = 54;
    const expandedX = beamX - expandedWidth / 2;
    const expandedY = Math.max(layout.margin.top, topY - 6 - pillHeight - expandedHeight - 2);

    const expandedGroup = terminusGroup
      .append("g")
      .attr("class", "terminus-expanded")
      .attr("opacity", 0);

    expandedGroup
      .append("rect")
      .attr("x", expandedX)
      .attr("y", expandedY)
      .attr("width", expandedWidth)
      .attr("height", expandedHeight)
      .attr("rx", 4)
      .attr("class", `fill-gray-800 ${stageStroke}`)
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.95);

    // Full opportunity name
    expandedGroup
      .append("text")
      .attr("x", expandedX + expandedWidth / 2)
      .attr("y", expandedY + padding.y + 6)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-orange-400 text-[8px] font-semibold")
      .text(oppName);

    // Activity count
    expandedGroup
      .append("text")
      .attr("x", expandedX + expandedWidth / 2)
      .attr("y", expandedY + padding.y + headerHeight - 6)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("class", "fill-white text-[9px] font-semibold")
      .text(`${activityCount} activities`);

    let offsetY = 0;
    const renderParticipant = (name: string, country: string | undefined, colorClass: string) => {
      const iconY = expandedY + padding.y + headerHeight + offsetY * lineHeight + lineHeight / 2;
      expandedGroup
        .append("text")
        .attr("x", expandedX + padding.x)
        .attr("y", iconY)
        .attr("dominant-baseline", "middle")
        .attr("class", "text-[9px]")
        .text(countryToFlag(country));
      expandedGroup
        .append("text")
        .attr("x", expandedX + padding.x + 14)
        .attr("y", iconY + 1)
        .attr("dominant-baseline", "middle")
        .attr("class", `${colorClass} text-[8px]`)
        .text(name.split(" ")[0]);
      offsetY++;
    };

    uniqueSellers.forEach((country, name) => renderParticipant(name, country, "fill-blue-300"));
    uniqueCustomers.forEach((country, name) => renderParticipant(name, country, "fill-emerald-300"));
    uniquePartners.forEach((country, name) => renderParticipant(name, country, "fill-orange-300"));

    // Hover interaction
    terminusGroup
      .on("mouseenter", function () {
        select(this).select(".terminus-expanded").attr("opacity", 1);
      })
      .on("mouseleave", function () {
        select(this).select(".terminus-expanded").attr("opacity", 0);
      });
  });
}
