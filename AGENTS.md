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

### Component Layering

The visualization follows a specific layering order defined in `design/reindeer-root.md`:

1.  **Face** (Background/Base)
2.  **Antlers**
3.  **Beams**
4.  **Burr**

### Multiple Vertical Scales System

The visualization implements a **3-tier vertical scale system** to ensure proper separation between activities and opportunities:

```
┌─────────────────────────────────────────────────────────┐
│                   Outside Total Scale                  │
│              (Abstract continuous scale)               │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │      Inside Activities Scale (Time Scale)       │  │
│  │         - Configurable proportion              │  │
│  │         - Default: 50% of total height       │  │
│  │         - Earliest activity at top            │  │
│  │         - Latest activity at bottom           │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │     Inside Opportunities Scale (Time Scale)     │  │
│  │         - Remaining proportion                │  │
│  │         - Default: 50% of total height       │  │
│  │         - Earliest opportunity at top         │  │
│  │         - Latest opportunity at bottom        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
└─────────────────────────────────────────────────────────┘
```

**Key Properties:**

- Activities always render above opportunities (past events precede future close dates)
- Each section maintains its own time padding
- Burr connections are the only visual elements that cross between scales
- Configurable via `activitiesHeightRatio` prop (0.0 to 1.0, default 0.5)

### Constrained Face Width

The **face** (opportunity bars) is constrained to be narrower than the **antlers** (beams) to create a realistic reindeer appearance:

- Configurable via `faceWidthRatio` prop (0.0 to 1.0, default 0.6)
- Face is centered within the available width
- Beams span the full available width
- Visual effect: antlers extend beyond the face on both sides

### Data Transformation Architecture

The core architectural challenge is mapping the `activity_example.json` schema to the `ReindeerChart` component's internal state. This is handled through three utility modules:

1. **`src/utils/faceAggregation.ts`** - Pure logic for face layer data:

   - `extractUniqueOpportunities()` - Deduplicates opportunities by ID
   - `groupOpportunitiesByPeriod()` - Groups by month or quarter
   - `calculateFaceBuckets()` - Creates FaceBucket structures
   - `calculateStackedOpportunities()` - Computes positioning for stacked bars

2. **`src/utils/beamAggregation.ts`** - Pure logic for antler/beam layer data:

   - `groupActivitiesByOpportunity()` - Groups activities by opportunity ID
   - `calculateBeamPositions()` - Implements beam displacement algorithm with alternating ordinal positions

3. **`src/utils/dataTransform.ts`** - Shared transformation utilities:
   - `groupOpportunitiesByMonth()` - Creates YearGroup structures for rendering
   - `getMaxRevenue()` - Calculates maximum revenue for scale normalization
   - `getMonthName()` - Utility for month label display

### Responsiveness

The chart must be designed to re-calculate D3 scales and positions when container dimensions change, handled via `useEffect` in `ReindeerChart.tsx`.

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

## Component Configuration

The `ReindeerChart` component accepts the following configuration props:

| Prop                    | Type       | Default | Description                                                                                                |
| ----------------------- | ---------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `width`                 | number     | 800     | Width of SVG container in pixels                                                                           |
| `height`                | number     | 600     | Height of SVG container in pixels                                                                          |
| `data`                  | Activity[] | []      | Array of activities to visualize                                                                           |
| `faceWidthRatio`        | number     | 0.6     | Proportion of available width for face (0.1 to 1.0). Face is centered, antlers extend beyond.              |
| `activitiesHeightRatio` | number     | 0.5     | Proportion of available height for activities section (0.1 to 0.9). Activities render above opportunities. |

**Validation**: Both `faceWidthRatio` and `activitiesHeightRatio` are automatically clamped to valid ranges.

## Visualization Layers

The chart renders four distinct layers in order:

1. **`layer-face`** (`<g id="layer-face">`)

   - Year labels and separator lines
   - Month labels
   - Opportunity bucket backgrounds
   - Stacked opportunity bars (colored by stage)
   - Revenue labels
   - Legend

2. **`layer-beams`** (`<g id="layer-beams">`)

   - Vertical beam edges (lines connecting activity nodes)
   - Beam labels at bottom

3. **`layer-antlers`** (`<g id="layer-antlers">`)

   - Activity nodes (circles, sized by participant count)
   - Northern Terminus icons (seller/customer participants)

4. **`layer-burrs`** (`<g id="layer-burrs">`)
   - Horizontal dashed lines connecting beam bottom to opportunity center

## Data Flow

```mermaid
graph TD
    A[Raw Activities] --> B[faceAggregation.ts]
    A --> C[beamAggregation.ts]
    A --> D[dataTransform.ts]

    B --> E[Face Buckets]
    C --> F[Beams]
    D --> G[Year Groups]

    E --> H[ReindeerChart]
    F --> H
    G --> H

    H --> I[SVG Rendering]
    I --> J[layer-face]
    I --> K[layer-beams]
    I --> L[layer-antlers]
    I --> M[layer-burrs]
```

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
