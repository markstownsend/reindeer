import type { Beam } from "../../../types/reindeer";
import type { ChartScales, LayoutDimensions } from "../../../utils/scales";
import { createBeamXScale } from "../../../utils/scales";

export interface RenderBurrsOptions {
  beams: Beam[];
  layout: LayoutDimensions;
  scales: ChartScales;
  opportunityPositions: Map<string, { x: number; y: number }>;
}

/**
 * Renders the Burrs layer.
 * Burrs are horizontal dashed lines connecting beams (activities) to opportunities.
 * - Opportunity-bound beams connect horizontally to their opportunity at the opportunity's Y position.
 * - Opportunity-free beams connect to the top edge of the face.
 */
export function renderBurrs(
  burrsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBurrsOptions,
): void {
  const { beams, layout, opportunityPositions } = options;

  if (beams.length === 0) {
    return;
  }

  // Create beam X scale based on actual ordinal positions and layout
  const ordinalPositions = beams.map((b) => b.ordinalPosition);
  const beamXScale = createBeamXScale(ordinalPositions, layout);

  // Draw horizontal lines connecting beams to their targets
  beams.forEach((beam) => {
    const beamX = beamXScale(beam.ordinalPosition);

    if (beam.type === "bound" && beam.linkedOpportunityId) {
      // Opportunity-Bound: Connect to opportunity at its Y position
      if (opportunityPositions.has(beam.linkedOpportunityId)) {
        const oppPosition = opportunityPositions.get(beam.linkedOpportunityId)!;

        // Draw horizontal burr line
        burrsLayer
          .append("line")
          .attr(
            "class",
            "burr-line stroke-gray-500 stroke-1 stroke-dasharray-3,3",
          )
          .attr("x1", beamX)
          .attr("y1", oppPosition.y)
          .attr("x2", oppPosition.x)
          .attr("y2", oppPosition.y);
      }
    } else if (beam.type === "free") {
      // Opportunity-Free: Connect to top edge of face
      // Since these beams are typically centered/inside the face, they might drop straight down.
      // If they are not perfectly aligned with the center, we might want a small horizontal connector,
      // but for now, we'll assume they just terminate at the boundary line.
      // We can draw a small marker or line if needed, but the prompt implies the connection IS the termination.
      // However, to be consistent with "burrs", maybe we draw a line to the center?
      // If the beam is already at the center (ordinal 0), no horizontal line is needed.
      // If there are multiple free beams distributed, they might need to connect to something.
      // Given our current implementation puts all free activities in one beam at ordinal 0 (center),
      // no horizontal burr is needed.
      // But we should ensure the vertical beam line extends to the boundary (handled in renderBeamsAndAntlers).
      // Let's add a small horizontal "T" bar or similar if desired, but for now, do nothing.
    }
  });
}
