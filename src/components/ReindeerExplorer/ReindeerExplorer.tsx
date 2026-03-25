import React, { useState, useEffect, useMemo } from "react";
import { ReindeerChart } from "../ReindeerChart/ReindeerChart";
import { datasets } from "./mockData";
import type { Activity } from "../../types/reindeer";

const toMs = (iso: string) => new Date(iso).getTime();
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString("en", { month: "short", year: "2-digit" })}`;
};

const toggleSet = (
  current: Set<string>,
  value: string,
  setter: (s: Set<string>) => void,
) => {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  setter(next);
};

export const ReindeerExplorer: React.FC = () => {
  const [selectedDatasetName, setSelectedDatasetName] = useState<
    keyof typeof datasets
  >("6 Opps / 2026 (40 Activities)");
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(800);
  const [faceWidthRatio, setFaceWidthRatio] = useState(0.6);
  const [activitiesHeightRatio, setActivitiesHeightRatio] = useState(0.5);

  const data = datasets[selectedDatasetName] as Activity[];

  // Extract filter options from current dataset
  const {
    stages, revMin, revMax, dtMin, dtMax,
    sellers, customers, partners,
  } = useMemo(() => {
    const stageSet = new Set<string>();
    const sellerSet = new Set<string>();
    const customerSet = new Set<string>();
    const partnerSet = new Set<string>();
    let rMin = Infinity;
    let rMax = -Infinity;
    let dMin = "";
    let dMax = "";

    for (const a of data) {
      a.sellers.forEach((s) => sellerSet.add(s.name));
      a.customers.forEach((c) => customerSet.add(c.name));
      (a.partners || []).forEach((p) => partnerSet.add(p.name));
      const dateStr = a.timestamp.slice(0, 10);
      if (!dMin || dateStr < dMin) dMin = dateStr;
      if (!dMax || dateStr > dMax) dMax = dateStr;
      for (const opp of a.linkedOpportunities) {
        stageSet.add(opp.stage);
        if (opp.revenue < rMin) rMin = opp.revenue;
        if (opp.revenue > rMax) rMax = opp.revenue;
      }
    }

    if (rMin === Infinity) { rMin = 0; rMax = 0; }

    return {
      stages: Array.from(stageSet),
      revMin: rMin,
      revMax: rMax,
      dtMin: dMin || "2020-01-01",
      dtMax: dMax || "2030-12-31",
      sellers: Array.from(sellerSet),
      customers: Array.from(customerSet),
      partners: Array.from(partnerSet),
    };
  }, [data]);

  // Filter state
  const [activeStages, setActiveStages] = useState<Set<string>>(new Set(stages));
  const [revenueRange, setRevenueRange] = useState<[number, number]>([revMin, revMax]);
  const [dateRange, setDateRange] = useState<[string, string]>([dtMin, dtMax]);
  const [focusedPeople, setFocusedPeople] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState<"or" | "and">("or");

  // Reset filters when dataset changes
  useEffect(() => {
    setActiveStages(new Set(stages));
    setRevenueRange([revMin, revMax]);
    setDateRange([dtMin, dtMax]);
    setFocusedPeople(new Set());
  }, [selectedDatasetName, stages, revMin, revMax, dtMin, dtMax, sellers, customers, partners]);

  // Compute latest stage per opportunity (most recent activity timestamp wins)
  const latestOppStage = useMemo(() => {
    const map = new Map<string, { stage: string; revenue: number; ts: number }>();
    for (const a of data) {
      const ts = new Date(a.timestamp).getTime();
      for (const opp of a.linkedOpportunities) {
        const existing = map.get(opp.id);
        if (!existing || ts > existing.ts) {
          map.set(opp.id, { stage: opp.stage, revenue: opp.revenue, ts });
        }
      }
    }
    return map;
  }, [data]);

  // Apply filters
  const filteredData = data.filter((activity) => {
    // Date filter
    if (activity.timestamp < dateRange[0] || activity.timestamp > dateRange[1] + "T23:59:59Z") return false;
    // Stage + Revenue filter based on opportunity's LATEST stage (not snapshot)
    if (activity.linkedOpportunities.length > 0) {
      const hasMatchingOpp = activity.linkedOpportunities.some((opp) => {
        const latest = latestOppStage.get(opp.id);
        if (!latest) return false;
        return activeStages.has(latest.stage) && latest.revenue >= revenueRange[0] && latest.revenue <= revenueRange[1];
      });
      if (!hasMatchingOpp) return false;
    }
    return true;
  });

  const checkboxSection = (
    label: string,
    items: string[],
    active: Set<string>,
    setter: (s: Set<string>) => void,
    capitalize = false,
  ) => (
    <section className="space-y-1">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={active.has(item)}
              onChange={() => toggleSet(active, item, setter)}
              className="accent-blue-500 w-3 h-3"
            />
            <span className={`text-gray-300 text-xs${capitalize ? " capitalize" : ""}`}>{item}</span>
          </label>
        ))}
      </div>
    </section>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">
          Reindeer Explorer
        </h1>
        <p className="text-sm text-gray-400">
          Interactive exploration of sales activity and opportunity data.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls + Filters */}
        <aside className="w-full lg:w-64 space-y-6 overflow-y-auto max-h-screen">
          <section>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Dataset Selection
            </label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDatasetName}
              onChange={(e) =>
                setSelectedDatasetName(e.target.value as keyof typeof datasets)
              }
            >
              {Object.keys(datasets).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Width</span>
                <span className="font-mono text-blue-400">{width}px</span>
              </div>
              <input
                type="range"
                min="400"
                max="2000"
                step="50"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Height</span>
                <span className="font-mono text-blue-400">{height}px</span>
              </div>
              <input
                type="range"
                min="400"
                max="2000"
                step="50"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Face Width Ratio</span>
                <span className="font-mono text-blue-400">
                  {(faceWidthRatio * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={faceWidthRatio}
                onChange={(e) => setFaceWidthRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Activities Height Ratio</span>
                <span className="font-mono text-purple-400">
                  {(activitiesHeightRatio * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={activitiesHeightRatio}
                onChange={(e) =>
                  setActivitiesHeightRatio(parseFloat(e.target.value))
                }
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </section>

          <hr className="border-gray-700" />

          <div className="space-y-4">
            <span className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Filters</span>

            {checkboxSection("Stage", stages, activeStages, setActiveStages)}

            {/* Revenue slider */}
            <section className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Revenue</span>
                <span className="text-blue-400 font-mono text-xs">${Math.round(revenueRange[0] / 1000)}k–${Math.round(revenueRange[1] / 1000)}k</span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min={revMin}
                  max={revMax}
                  step={1000}
                  value={revenueRange[0]}
                  onChange={(e) => setRevenueRange([parseInt(e.target.value), revenueRange[1]])}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="range"
                  min={revMin}
                  max={revMax}
                  step={1000}
                  value={revenueRange[1]}
                  onChange={(e) => setRevenueRange([revenueRange[0], parseInt(e.target.value)])}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </section>

            {/* Date range sliders */}
            <section className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Date Range</span>
                <span className="text-blue-400 font-mono text-xs">{formatDate(dateRange[0])}–{formatDate(dateRange[1])}</span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min={toMs(dtMin)}
                  max={toMs(dtMax)}
                  step={86400000}
                  value={toMs(dateRange[0])}
                  onChange={(e) => setDateRange([toIso(parseInt(e.target.value)), dateRange[1]])}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
                <input
                  type="range"
                  min={toMs(dtMin)}
                  max={toMs(dtMax)}
                  step={86400000}
                  value={toMs(dateRange[1])}
                  onChange={(e) => setDateRange([dateRange[0], toIso(parseInt(e.target.value))])}
                  className="w-full h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </section>

            {/* People focus (highlight mode) */}
            <section className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Focus People</span>
                <div className="flex gap-2 items-center">
                  {focusedPeople.size > 1 && (
                    <div className="flex gap-0.5 text-[10px]">
                      <button
                        onClick={() => setFocusMode("or")}
                        className={`px-1.5 py-0.5 rounded-l ${focusMode === "or" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                      >OR</button>
                      <button
                        onClick={() => setFocusMode("and")}
                        className={`px-1.5 py-0.5 rounded-r ${focusMode === "and" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                      >AND</button>
                    </div>
                  )}
                  {focusedPeople.size > 0 && (
                    <button
                      onClick={() => setFocusedPeople(new Set())}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >Clear</button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...sellers.map((n) => ({ name: n, color: "text-blue-300" })),
                  ...customers.map((n) => ({ name: n, color: "text-emerald-300" })),
                  ...partners.map((n) => ({ name: n, color: "text-orange-300" })),
                ].map(({ name, color }) => (
                  <label key={name} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={focusedPeople.has(name)}
                      onChange={() => toggleSet(focusedPeople, name, setFocusedPeople)}
                      className="accent-blue-500 w-3 h-3"
                    />
                    <span className={`${color} text-xs`}>{name}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 overflow-auto flex justify-center items-start min-h-[600px]">
            <ReindeerChart
              width={width}
              height={height}
              data={filteredData}
              fullData={data}
              faceWidthRatio={faceWidthRatio}
              activitiesHeightRatio={activitiesHeightRatio}
              focusedPeople={focusedPeople}
              focusMode={focusMode}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
