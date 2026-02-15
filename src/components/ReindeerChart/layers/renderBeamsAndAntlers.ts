import * as d3 from "d3";
import type { Beam } from "../../../types/reindeer";
import type { ChartScales, LayoutDimensions } from "../../../utils/scales";
import { createBeamXScale } from "../../../utils/scales";
import { STAGE_COLORS, DEFAULT_STAGE_COLOR } from "./styles";

function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}

export interface RenderBeamsAndAntlersOptions {
  beams: Beam[];
  layout: LayoutDimensions;
  scales: ChartScales;
  height: number;
  opportunityPositions: Map<string, { x: number; y: number }>;
}

/**
 * Renders the Beams and Antlers layers.
 * Beams are the vertical lines, Antlers are the activity nodes.
 */
export function renderBeamsAndAntlers(
  beamsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  antlersLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBeamsAndAntlersOptions,
): void {
  const { beams, layout, scales, opportunityPositions } = options;
  const { activitiesTimeScale } = scales;

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
        .attr("class", "beam-activity-edge stroke-gray-500 stroke-1 fill-none")
        .attr("d", edgePath);
    }

    // Render activity nodes
    sortedActivities.forEach((activity) => {
      const y = activitiesTimeScale(new Date(activity.timestamp));

      // Calculate node size based on effort (number of participants)
      const participantCount =
        activity.sellers.length + activity.customers.length;
      const nodeRadius = 4 + participantCount * 2;

      // Create activity node group
      const nodeGroup = antlersLayer.append("g").attr("class", "activity-node");

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
          .text(seller.name.split(" ")[0]);
      });

      // Render customer icons
      activity.customers.forEach((customer, i) => {
        const iconY = y - nodeRadius - 8 - (activity.sellers.length + i) * 10;
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
          .text(customer.name.split(" ")[0]);
      });
    });
  });
}
