// Stage color mappings for opportunity bars
export const STAGE_COLORS: Record<string, string> = {
  Prospect: "fill-indigo-400",
  Qualified: "fill-blue-400",
  "Technical Validation": "fill-purple-400",
  "Business Validation": "fill-violet-400",
  Committed: "fill-green-400",
  "Closed Lost": "fill-red-400",
  Launched: "fill-emerald-500",
  Completed: "fill-teal-500",
};

export const DEFAULT_STAGE_COLOR = "fill-gray-400";

export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage] || DEFAULT_STAGE_COLOR;
}