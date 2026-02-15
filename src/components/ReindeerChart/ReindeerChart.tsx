import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { Activity } from "../../types/reindeer";
import { aggregateFaceData } from "../../utils/faceAggregation";
import { calculateBeamPositions } from "../../utils/beamAggregation";
import {
  calculateLayout,
  updateLayoutWithBuckets,
  createScales,
} from "../../utils/scales";
import { renderFace, renderBeamsAndAntlers, renderBurrs } from "./layers";

interface ReindeerChartProps {
  width?: number;
  height?: number;
  data?: Activity[];
  faceWidthRatio?: number;
  activitiesHeightRatio?: number;
}

export const ReindeerChart: React.FC<ReindeerChartProps> = ({
  width = 800,
  height = 600,
  data = [],
  faceWidthRatio = 0.6,
  activitiesHeightRatio = 0.5,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create layers
    const faceLayer = svg.append("g").attr("id", "layer-face");
    const beamsLayer = svg.append("g").attr("id", "layer-beams");
    const antlersLayer = svg.append("g").attr("id", "layer-antlers");
    const burrsLayer = svg.append("g").attr("id", "layer-burrs");

    // Calculate data
    // Use aggregateFaceData with initial defaults; layout properties will be updated later
    const { buckets, stacked } = aggregateFaceData(data);
    const beams = calculateBeamPositions(data);

    // Calculate layout
    let layout = calculateLayout(
      width,
      height,
      faceWidthRatio,
      activitiesHeightRatio,
    );
    layout = updateLayoutWithBuckets(layout, buckets);

    // Create scales
    const scales = createScales(data, buckets, layout);

    // Check for empty activities
    const activityTimestamps = data.map((a) => new Date(a.timestamp));
    if (activityTimestamps.length === 0) {
      faceLayer
        .append("text")
        .attr("x", width / 2)
        .attr("y", layout.margin.top + layout.activitiesHeight / 2)
        .attr("text-anchor", "middle")
        .attr("class", "fill-gray-500 text-sm")
        .text("No activities to display");
    }

    // Render face layer (returns opportunity positions for burr connections)
    const opportunityPositions = renderFace(faceLayer, {
      buckets,
      stacked,
      layout,
      scales,
      width,
      height,
    });

    // Render center divider line
    svg
      .append("line")
      .attr("x1", width / 2)
      .attr("y1", layout.margin.top)
      .attr("x2", width / 2)
      .attr("y2", height - layout.margin.bottom)
      .attr("stroke", "#4B5563")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Render beams and antlers
    renderBeamsAndAntlers(beamsLayer, antlersLayer, {
      beams,
      layout,
      scales,
      height,
    });

    // Render burrs
    renderBurrs(burrsLayer, {
      beams,
      layout,
      scales,
      opportunityPositions,
    });
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
