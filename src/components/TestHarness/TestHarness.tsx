import React, { useState } from "react";
import { ReindeerChart } from "../ReindeerChart/ReindeerChart";
import { datasets } from "./mockData";

export const TestHarness: React.FC = () => {
  const [selectedDatasetName, setSelectedDatasetName] = useState<
    keyof typeof datasets
  >("Typical (3 Activities, 2 Opps)");
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(800);
  const [faceWidthRatio, setFaceWidthRatio] = useState(0.6);
  const [activitiesHeightRatio, setActivitiesHeightRatio] = useState(0.5);

  const data = datasets[selectedDatasetName];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 p-6">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-white">
          Reindeer Visualization Test Harness
        </h1>
        <p className="text-sm text-gray-400">
          Basic environment for testing Reindeer component progress.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <aside className="w-full lg:w-64 space-y-6">
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

          <section className="pt-4 border-t border-gray-800 text-xs text-gray-500">
            <h3 className="font-semibold mb-2 uppercase tracking-wider">
              Instructions
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the dropdown to switch datasets.</li>
              <li>Adjust sliders to test responsiveness.</li>
              <li>Chart updates automatically via React state.</li>
            </ul>
          </section>
        </aside>

        {/* Preview Area */}
        <main className="flex-1">
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 overflow-auto flex justify-center items-start min-h-[600px]">
            <ReindeerChart
              width={width}
              height={height}
              data={data}
              faceWidthRatio={faceWidthRatio}
              activitiesHeightRatio={activitiesHeightRatio}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
