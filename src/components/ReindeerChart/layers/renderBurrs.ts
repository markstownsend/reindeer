import { Beam } from "../../../types/reindeer";
import {
  ChartScales,
  LayoutDimensions,
  createBeamXScale,
} from "../../../utils/scales";

export interface RenderBurrsOptions {
  beams: Beam[];
  layout: LayoutDimensions;
  scales: ChartScales;
  opportunityPositions: Map<string, { x: number; y: number }>;
}

/**
 * Renders the Burrs layer.
 * Burrs are horizontal dashed lines connecting beams (activities) to opportunities.
 */
export function renderBurrs(
  burrsLayer: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: RenderBurrsOptions,
): void {
  const { beams, layout, scales, opportunityPositions } = options;
  const { margin } = layout;
  const { activitiesTimeScale } = scales;

  if (beams.length === 0) {
    return;
  }

  // Create beam X scale based on actual ordinal positions
  const ordinalPositions = beams.map((b) => b.ordinalPosition);
  const beamXScale = createBeamXScale(ordinalPositions, layout.width, margin);

  // Draw horizontal lines connecting beams to their opportunities
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
}
