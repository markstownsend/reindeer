/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // Fill colors for opportunity stages (used dynamically by D3)
    "fill-indigo-400",
    "fill-purple-400",
    "fill-blue-400",
    "fill-green-400",
    "fill-emerald-500",
    "fill-red-400",
    "fill-gray-400",
    "fill-gray-500",
    "fill-gray-800",
    "fill-white",
    // Stroke colors
    "stroke-gray-700",
    // Text colors
    "text-xs",
    "text-sm",
    "text-lg",
    "font-bold",
    "font-medium",
    "font-semibold",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
