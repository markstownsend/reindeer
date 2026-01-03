# Architect Mode Rules (Non-Obvious Only)

- **Component Layering**: The visualization follows a specific layering order (Face -> Antlers -> Beams -> Burr) defined in `design/reindeer-root.md`.
- **Data Transformation**: The core architectural challenge is mapping `activity_example.json` schema to the `ReindeerChart` component's internal state.
- **Responsiveness**: The chart must be designed to re-calculate D3 scales and positions when container dimensions change, handled via `useEffect` in `ReindeerChart.tsx`.
