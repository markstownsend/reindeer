import React, { useEffect, useMemo, useRef } from "react";
import { select } from "d3-selection";
import type { Activity } from "../../types/reindeer";
import { aggregateFaceData } from "../../utils/faceAggregation";
import { calculateBeamPositions } from "../../utils/beamAggregation";
import { aggregateStageData } from "../../utils/stageAggregation";
import {
  calculateLayout,
  updateLayoutWithBuckets,
  createScales,
} from "../../utils/scales";
import {
  renderFace,
  renderBeamsAndAntlers,
  renderBurrs,
  renderNose,
} from "./layers";
import { safeRender } from "../../utils/safeRender";

const MAX_ACTIVITIES = 2000;

interface ReindeerChartProps {
  width?: number;
  height?: number;
  data?: Activity[];
  fullData?: Activity[];
  faceWidthRatio?: number;
  activitiesHeightRatio?: number;
  focusedPeople?: Set<string>;
  focusMode?: "or" | "and";
}

export const ReindeerChart: React.FC<ReindeerChartProps> = ({
  width = 800,
  height = 600,
  data = [],
  fullData,
  faceWidthRatio = 0.6,
  activitiesHeightRatio = 0.5,
  focusedPeople,
  focusMode = "or",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Use fullData for layout/positioning, data for rendering
  const layoutData = useMemo(
    () => {
      const d = fullData || data;
      return d.length > MAX_ACTIVITIES ? d.slice(0, MAX_ACTIVITIES) : d;
    },
    [fullData, data],
  );
  const safeData = useMemo(
    () => data.length > MAX_ACTIVITIES ? data.slice(0, MAX_ACTIVITIES) : data,
    [data],
  );

  // Layout computed from full dataset (stable positions)
  const { buckets: layoutBuckets } = useMemo(() => aggregateFaceData(layoutData), [layoutData]);
  const layoutBeams = useMemo(() => calculateBeamPositions(layoutData), [layoutData]);

  // Render data computed from filtered dataset
  const { buckets } = useMemo(() => aggregateFaceData(safeData), [safeData]);
  const stageData = useMemo(() => aggregateStageData(safeData), [safeData]);
  const beams = useMemo(() => calculateBeamPositions(safeData), [safeData]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    svg.selectAll(":not(title):not(desc)").remove();

    // Create layers
    const faceLayer = svg.append("g").attr("id", "layer-face");
    const noseLayer = svg.append("g").attr("id", "layer-nose");
    const beamsLayer = svg.append("g").attr("id", "layer-beams");
    const antlersLayer = svg.append("g").attr("id", "layer-antlers");
    const burrsLayer = svg.append("g").attr("id", "layer-burrs");

    // Calculate layout from full dataset (stable positions)
    let layout = calculateLayout(
      width,
      height,
      faceWidthRatio,
      activitiesHeightRatio,
    );
    layout = updateLayoutWithBuckets(layout, layoutBuckets);

    // Create scales from full dataset
    const scales = createScales(layoutData, layoutBuckets, layout);

    // Compute focused opportunity IDs for face/nose dimming
    let focusedOppIds: Set<string> | undefined;
    if (focusedPeople && focusedPeople.size > 0) {
      focusedOppIds = new Set<string>();
      for (const beam of layoutBeams) {
        if (!beam.linkedOpportunityId) continue;
        const matchFn = (a: typeof safeData[0]) => {
          const names = [
            ...a.sellers.map((s) => s.name),
            ...a.customers.map((c) => c.name),
            ...(a.partners || []).map((p) => p.name),
          ];
          return names.some((n) => focusedPeople.has(n));
        };
        const isFocused = focusMode === "and"
          ? Array.from(focusedPeople).every((person) =>
              beam.activities.some((a) =>
                [...a.sellers.map((s) => s.name), ...a.customers.map((c) => c.name), ...(a.partners || []).map((p) => p.name)].includes(person),
              ),
            )
          : beam.activities.some(matchFn);
        if (isFocused) focusedOppIds.add(beam.linkedOpportunityId);
      }
    }

    // Check for empty activities
    if (safeData.length === 0) {
      faceLayer
        .append("text")
        .attr("x", width / 2)
        .attr("y", layout.margin.top + layout.activitiesHeight / 2)
        .attr("text-anchor", "middle")
        .attr("class", "fill-gray-500 text-sm")
        .text("No activities to display");
    }

    // Render face layer — use layout buckets for stable positions, filter to visible opps
    let opportunityPositions = new Map<string, { x: number; y: number }>();
    const filteredOppIdsForFace = new Set(
      safeData.flatMap((a) => a.linkedOpportunities.map((o) => o.id)),
    );
    safeRender(faceLayer, () => {
      opportunityPositions = renderFace(faceLayer, {
        buckets: layoutBuckets,
        layout,
        scales,
        width,
        focusedOppIds,
        filteredOppIds: filteredOppIdsForFace,
      });
    }, "face");

    // Render nose (pipeline donut) beneath opportunities
    safeRender(noseLayer, () => {
      renderNose(noseLayer, {
        stageData,
        layout,
        focusedOppIds,
        faceBuckets: buckets,
      });
    }, "nose");

    // Build render beams: use layout beam positions, keep entire beams whose opportunity is in filtered set
    const filteredOppIdsSet = new Set(
      safeData.flatMap((a) => a.linkedOpportunities.map((o) => o.id)),
    );
    const renderBeams = layoutBeams.filter((beam) =>
      beam.type === "free" || (beam.linkedOpportunityId && filteredOppIdsSet.has(beam.linkedOpportunityId)),
    );

    // Render beams and antlers
    safeRender(beamsLayer, () => {
      renderBeamsAndAntlers(beamsLayer, antlersLayer, {
        beams: renderBeams,
        layout,
        scales,
        opportunityPositions,
        focusedPeople,
        focusMode,
      });
    }, "beams");

    // Render burrs
    safeRender(burrsLayer, () => {
      renderBurrs(burrsLayer, {
        beams: renderBeams,
        layout,
        opportunityPositions,
      });
    }, "burrs");
  }, [width, height, layoutData, layoutBuckets, layoutBeams, safeData, buckets, stageData, beams, faceWidthRatio, activitiesHeightRatio, focusedPeople, focusMode]);

  return (
    <div className="reindeer-root w-full h-full flex justify-center items-center bg-gray-800 p-4 rounded-lg">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-gray-900 rounded shadow-lg"
        role="img"
        aria-label={`Reindeer Chart: ${safeData.length} activities across ${new Set(safeData.flatMap(a => a.linkedOpportunities.map(o => o.id))).size} opportunities`}
      >
        <title>Reindeer Chart</title>
        <desc>A timeline visualization showing sales activities and opportunities</desc>
      </svg>
    </div>
  );
};
