# AGENTS.md

This file provides the definitive guidance to agents when working with code in this repository. It consolidates rules from all project contexts.

## Commands

- **Dev Server**: `npm run dev` (Vite)
- **Build**: `npm run build` (tsc + vite build)
- **Lint**: `npm run lint` (eslint)
- **Testing**: **No automated test runner (Vitest/Jest) is configured.**

## Testing & Visual TDD Strategy

Since there is no automated test runner, references to "TDD" or "running tests" in generic SOPs (like `implement/CODEASSIST.md`) must be interpreted as **Visual TDD**:

1.  **Red**: Create or identify a scenario in `src/components/TestHarness/mockData.ts` and `TestHarness.tsx` that demonstrates the missing feature or bug. Verify it fails to render correctly in the browser.
2.  **Green**: Implement logic in `ReindeerChart` until the specific scenario renders correctly.
3.  **Refactor**: Clean up code while ensuring the visual output remains stable.

## Visualization Architecture

- **Component Layering**: The visualization follows a specific layering order defined in `design/reindeer-root.md`:
  1.  **Face** (Background/Base)
  2.  **Antlers**
  3.  **Beams**
  4.  **Burr**
- **Data Transformation**: The core architectural challenge is mapping the `activity_example.json` schema to the `ReindeerChart` component's internal state.
- **Responsiveness**: The chart must be designed to re-calculate D3 scales and positions when container dimensions change, handled via `useEffect` in `ReindeerChart.tsx`.

## React + D3 + Tailwind Architecture

The project follows the **"React wrapper, D3 engine"** pattern.

### 1. Roles & Responsibilities

| Tech         | Role            | Responsibility                                                                                                                   |
| :----------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **React**    | **The Boss**    | Holds State (Data, Dimensions, Hover). Renders container DOM (`<div>`, `<svg>`, `<g>`). Handsoff control of SVG internals to D3. |
| **D3.js**    | **The Engine**  | Math (Scales, Shapes) and DOM Manipulation (Enter/Update/Exit, Transitions). Renders the _dynamic_ nodes inside React's layers.  |
| **Tailwind** | **The Stylist** | Defines aesthetics (Colors, Typography, Strokes) via classes.                                                                    |

### 2. The "D3-Effect" Methodology

**Rule 1: DOM Ownership (The Black Box)**

- React renders the `<svg ref={ref}>` and high-level `<g id="layer-name">` containers.
- React **NEVER** renders individual data elements (`<circle>`, `<path>`, `<rect>`) directly.
- D3 takes full control of the SVG internals within a `useEffect`.

**Rule 2: Styling (Separation of Concerns)**

- **Geometry (D3 attributes):** `x`, `y`, `r`, `d`, `transform`.
- **Aesthetics (Tailwind classes):** `fill`, `stroke`, `opacity` applied via D3: `.attr('class', 'fill-blue-500 transition-colors')`.
- _Exception:_ Dynamic, data-driven colors (e.g., heatmaps) use D3 attributes.

**Rule 3: Interaction Bridge**

- **Events:** D3 attaches listeners (`.on('click', ...)`).
- **Logic:** Listeners invoke React callbacks passed as props (`onClick={() => setSelection(d.id)}`).

## Design & Implementation Guidelines

- **Design Specs**: Consult `design/reindeer-grammar.md` for specific rules on how activities are mapped to the visualization (e.g., beam displacement, antlers).
- **Implementation Guide**: Refer to `implement/CODEASSIST.md` for the structured workflow, but adapt its "Test" steps to the **Visual TDD** strategy described above.
- **Project Structure**:
  - `design/`: Visual and architectural specifications.
  - `implement/`: SOPs (e.g., `CODEASSIST.md`).
  - `src/components/ReindeerChart/`: Core visualization logic.
  - `src/components/TestHarness/`: Visual verification tool.

## Coding Standards

- **D3/React Lifecycle**: **CRITICAL**: Always include `svg.selectAll("*").remove()` at the beginning of the `useEffect` hook in `ReindeerChart` to prevent duplicate elements on re-renders/HMR.
- **Styling (Tailwind v4)**:
  - Use utility classes directly in `className` for SVG elements where possible (e.g., `fill-white`, `stroke-gray-600`, `text-xl`).
  - **Debugging**: If styles aren't applying, check if classes are being dynamically generated in a way that bypasses the Tailwind JIT scanner.
- **Imports**: Follow the mandatory order:
  1.  React
  2.  Third-party libraries (d3)
  3.  Local modules (`../../types`, `./components`)

## Debugging

- **Mock Data**: Use `src/components/TestHarness/mockData.ts` to tweak or add data scenarios for debugging.
- **D3 Selections**: When inspecting SVG elements, remember that D3 selections are often cleared and redrawn completely on React state changes.

## Tessl Capabilities & Documentation

This project uses Tessl tiles to provide specialized documentation and capabilities.

- **Active Rules**: `.tessl/RULES.md` (Check this for installed steering capabilities)
- **Library Documentation**:
  - **D3.js**: `.tessl/tiles/tessl/npm-d3/docs/` (Essential for Selection, Scales, Shapes, and Animations)
  - **Tailwind CSS**: `.tessl/tiles/tessl/npm-tailwindcss/docs/` (Theme system and configuration)

**Instruction**: When implementing complex D3 logic or configuring Tailwind, verify patterns against these local documentation files to ensure compatibility with the installed versions.
