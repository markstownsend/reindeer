# Reindeer

[![CI](https://github.com/markstownsend/reindeer/actions/workflows/ci.yml/badge.svg)](https://github.com/markstownsend/reindeer/actions/workflows/ci.yml)
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](https://unlicense.org/)

## Overview

The **Reindeer Chart** is a vertical timeline visualization named for its resemblance to a reindeer head. It maps activities over time on the antlers and connects them via a burr to the head and face. The face contains opportunities in stacked horizontal bars sized by revenue. Time advances as you go North to South on the chart. The first use case that motivated the need for the visualization was in enterprise software sales where you have a large enterprise sales team pursuing many opportunities at a large customer. It is hard to see what everyone is working on, who is working on what together, who owns what opportunity, what stage the opportunity is at, how much work has gone into it and various other things.

![initial sketch](./doc/design/reindeer-overview-001.jpg)

For the design intent behind each capability and evidence that it has been delivered, see [INTENT.md](INTENT.md).

## Features

- **Split Multi-Year Timeline**: Visualize activities and opportunities across multiple years with independent Y-axes
- **Activity Tracking**: Track sales activities with participant information (sellers and customers)
- **Opportunity Staging**: Display opportunities at different stages (Prospect, Qualified, Technical Validation, Launched, etc.)
- **Revenue Visualization**: Opportunity size reflects revenue, normalized to the largest opportunity
- **Flexible Layout**: Configure face width ratio and activities height ratio for different visualizations
- **Bound & Free Activities**: Support for activities linked to specific opportunities (bound) and standalone activities (free)

### Visual Examples

#### Multi-Year Portfolio

Shows 8 IT opportunities across 2023–2025 with different stages and many activities per timeline:

![Multi-year portfolio](./doc/img/multi-year-portfolio.png)

#### Bound Activities

Activities that are directly linked to specific opportunities, shown as vertical beams connecting to opportunity bars:

![Bound activities](./doc/img/bound-activities.png)

#### Mixed Bound and Free Activities

A combination of bound activities (connected to opportunities) and free activities (standalone):

![Mixed bound and free activities](./doc/img/mixed-bound-and-free-activities.png)

## Installation

```bash
npm install reindeer
```

The package includes the `ReindeerChart` React component, a `validateActivities` utility, and TypeScript type definitions. React 18 or 19 is required as a peer dependency.

## Usage

### Basic Component

```tsx
import { ReindeerChart } from "reindeer";
import "reindeer/styles.css";
import type { Activity } from "reindeer";

const myData: Activity[] = [
  {
    id: "a1",
    timestamp: "2023-10-01T09:00:00Z",
    type: "meeting",
    sellers: [{ name: "Alice Smith", role: "Account Executive", country: "US" }],
    customers: [{ name: "Charlie Brown", role: "CTO", country: "JP" }],
    partners: [{ name: "Pat Quinn", role: "Implementation Consultant", country: "IE" }],
    description: "First contact",
    linkedOpportunities: [
      {
        id: "opp-101",
        name: "APAC Cloud Migration",
        closeDate: "2023-12-15",
        stage: "Prospect",
        revenue: 50000,
        stageAdjustedRevenue: 5000,
      },
    ],
  },
];

function App() {
  return (
    <ReindeerChart
      width={1000}
      height={800}
      data={myData}
      faceWidthRatio={0.6}
      activitiesHeightRatio={0.5}
    />
  );
}
```

### Component Props

| Prop                    | Type       | Default | Description                                                                                                |
| ----------------------- | ---------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `width`                 | number     | 800     | Width of SVG container in pixels                                                                           |
| `height`                | number     | 600     | Height of SVG container in pixels                                                                          |
| `data`                  | Activity[] | []      | Array of activities to visualize                                                                           |
| `faceWidthRatio`        | number     | 0.6     | Proportion of available width for face (0.1 to 1.0). Face is centered, antlers extend beyond.              |
| `activitiesHeightRatio` | number     | 0.5     | Proportion of available height for activities section (0.1 to 0.9). Activities render above opportunities. |
| `focusedPeople`         | Set\<string\> | undefined | Set of participant names to highlight. When set, matching beams render at full opacity, others dim.     |
| `focusMode`             | "or" \| "and" | "or"  | Focus matching mode. "or": highlight beams with any focused person. "and": only beams with all focused people. |

### Styling

The `reindeer/styles.css` import is required — it provides all the Tailwind CSS utility classes used internally by the chart's SVG rendering. Without it, fills, strokes, and text styles will be missing.

Custom styling is not currently supported. The chart uses Tailwind utility classes applied directly to SVG elements via D3, so there is no stable set of semantic CSS classes to override. If you need to customise colours (e.g. stage colours or beam styles), you would need to fork the component.

### Data Structure

```typescript
interface Activity {
  id: string;
  timestamp: string;  // ISO 8601 UTC (e.g., "2023-10-01T09:00:00Z")
  type?: string;      // "meeting" | "call" | "email" | "demo" | "workshop" (defaults to "meeting")
  sellers: Seller[];
  customers: Customer[];
  partners?: Partner[];
  description: string;
  linkedOpportunities: Opportunity[];  // Empty array = free/unlinked activity
}

interface Seller {
  name: string;
  role: string;
  country?: string;  // ISO 3166-1 alpha-2 (e.g., "US", "GB", "DE")
}

interface Customer {
  name: string;
  role: string;
  country?: string;
}

interface Partner {
  name: string;
  role: string;
  country?: string;
}

interface Opportunity {
  id: string;
  name?: string;              // Human-readable name (e.g., "APAC Cloud Migration")
  closeDate: string;          // ISO 8601 date YYYY-MM-DD
  stage: string;              // Stage at time of activity (e.g., "Prospect", "Technical Validation", "Launched")
  revenue: number;            // Absolute revenue value
  stageAdjustedRevenue: number;
}
```

#### Key Concepts

- **Activities** are the atomic unit of data. Each activity represents a sales touchpoint — a meeting, call, email, demo, or workshop — between your sellers and a customer at a specific point in time. Think of it as a row in a CRM activity log.
- **Sellers, customers, and partners** are the people who participated in the activity. Sellers are your team, customers are the buyer's team, and partners are third parties (e.g. implementation consultants, channel partners). Each person has a name, role (e.g. "Account Executive", "CTO"), and optional country.
- **Opportunities** represent deals in your pipeline. Each opportunity has a stage (e.g. Prospect → Qualified → Technical Validation → Launched), a close date, and a revenue value. These map directly to the opportunity object in CRM systems like Salesforce.
- **Linked opportunities on activities are snapshots** — when you log an activity against a deal, you capture the deal's stage and revenue *at that moment*. The same opportunity can appear on many activities with different stages, showing how the deal progressed over time. The visualization uses this to color activity nodes by the stage when they occurred.
- **Free activities** (empty `linkedOpportunities` array) are sales work not tied to a specific deal — e.g. account planning sessions, relationship-building dinners, or general discovery calls before a deal exists.
- **Stage** can be any string. The built-in color palette maps common pipeline stages: Prospect (indigo), Qualified (blue), Technical Validation (purple), Business Validation (violet), Committed (green), Closed Lost (red), Launched (emerald), Completed (teal). Unrecognised stages render in gray.
- **Revenue** is the absolute deal value. `stageAdjustedRevenue` is the weighted value (e.g. a $100k deal at 20% probability = $20k stage-adjusted). Both are used in the visualization — revenue for sizing opportunity bars, stage-adjusted revenue for pipeline summaries.
- **Country codes** (ISO 3166-1 alpha-2, e.g. `"US"`, `"JP"`) enable flag emoji display in participant lists and tooltips. Optional — a dot is shown when omitted.
- **Activity type** determines the shape of the node on the chart: circle (meeting), diamond (call), square (email), triangle (demo), star (workshop). Optional — defaults to circle/meeting.

### Data Validation

The project includes a runtime validator for `Activity[]` data in `src/utils/validateActivities.ts`. This is a hand-written validator with no external dependencies — we deliberately avoided taking a dependency on a JSON Schema validation library (e.g. Ajv, Zod) to keep the package lightweight and free of transitive dependencies for what is a straightforward, stable schema.

```typescript
import { validateActivities } from "./utils/validateActivities";

const result = validateActivities(untrustedInput);

if (!result.valid) {
  console.error("Validation errors:", result.errors);
  // result.errors is a string[] of human-readable messages, e.g.:
  // ['activity "a1": "timestamp" must be a valid ISO 8601 string',
  //  'activity "a1" sellers[0]: "name" must be a non-empty string']
} else {
  // result.data is a typed Activity[] safe to pass to <ReindeerChart>
  <ReindeerChart data={result.data} />
}
```

The validator checks:

| Field | Rule |
| --- | --- |
| `id` | Required non-empty string |
| `timestamp` | Valid ISO 8601 date string |
| `type` | Optional; when present must be one of: `meeting`, `call`, `email`, `demo`, `workshop` |
| `description` | Required string |
| `sellers` | Required non-empty array of person objects |
| `customers` | Required array (may be empty) |
| `partners` | Optional; when present must be an array of person objects |
| `linkedOpportunities` | Required array (empty = free activity) |
| Person `.name`, `.role` | Required non-empty strings |
| Person `.country` | Optional; when present must be ISO 3166-1 alpha-2 (e.g. `"US"`) |
| Opportunity `.id`, `.stage` | Required non-empty strings |
| Opportunity `.closeDate` | Required `YYYY-MM-DD` format |
| Opportunity `.revenue`, `.stageAdjustedRevenue` | Required non-negative numbers |

Use the validator when loading data from external sources (JSON files, APIs, Salesforce exports) before passing it to `<ReindeerChart>`. The test harness (`mockData.ts`) uses it to validate `exampleData.json` at import time.

## Visual Structure

### Layout

- **Orientation**: Vertical
- **Y-Axis**: Time (earliest activities at top → latest opportunity close dates at bottom). The Y-axis for activities is independent of the Y-axis for opportunity close dates, to prevent overlap.
- **X-Axis**: Beams fan outward from center based on opportunity revenue; opportunity bars are stacked horizontally in the face

### Components

- **Activity Field**: The section of the chart above the face where the antlers appear
  - All activities are plotted in this section
  - Contains horizontal lines indicating time period boundaries
- **Opportunities**:
  - Horizontal bars stacked within time-period buckets in the face
  - Width determined by absolute revenue normalized to the largest opportunity
- **Activities**:
  - Shapes placed in the activity field along vertical beams
  - Shape varies by activity type: circle (meeting), diamond (call), square (email), triangle (demo), star (workshop)
- **Activity Timelines aka "Beam"**:
  - Each opportunity gets one vertical beam in the activity field (above the face)
  - Beams are positioned horizontally using an alternating displacement algorithm:
    1. Opportunities are sorted by their max revenue (descending)
    2. The highest-revenue opportunity is placed at ordinal +1 (right of center, closest to face)
    3. The next highest at ordinal -1 (left of center, closest to face)
    4. Then +2, -2, +3, -3, etc. — fanning outward like antlers
    5. Free (unlinked) activities sit at ordinal 0, the center of the face
  - The face is narrower than the full width, so bound beams always render outside the face in the "antler" zones
  - Activities are plotted along each beam at the y-position corresponding to their timestamp
  - Connected to the opportunity via a horizontal dashed line (the burr)

### Visualization Layers

The chart renders five distinct layers in order:

1. **Face** - Chart title, face boundary, month labels, opportunity bucket backgrounds, stacked opportunity bars with revenue labels
2. **Nose** - Pipeline summary bars showing revenue by stage (full pipeline bar, plus a focused subset bar when people filtering is active)
3. **Beams** - Monthly timeline gridlines and vertical beam lines connecting activity nodes
4. **Antlers** - Activity nodes (shapes vary by activity type) and Crown pills showing opportunity name, revenue, and participant details
5. **Burrs** - Horizontal dashed lines connecting each beam to its opportunity

## Development

### Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Test Harness

The project includes a Test Harness component for visual verification and testing:

```bash
npm run dev
```

Navigate to the test harness to:

- Switch between different datasets
- Adjust chart dimensions (width, height)
- Configure face width ratio and activities height ratio
- Visualize different scenarios (typical, large dataset, multi-year, etc.)

### Tech Stack

- **React 19** - Component framework
- **D3.js 7** - SVG rendering and data visualization
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

## Architecture

The visualization follows a **"React wrapper, D3 engine"** pattern:

| Tech         | Role            | Responsibility                                                                                                                    |
| :----------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **React**    | **The Boss**    | Holds State (Data, Dimensions, Hover). Renders container DOM (`<div>`, `<svg>`, `<g>`). Hands off control of SVG internals to D3. |
| **D3.js**    | **The Engine**  | Math (Scales, Shapes) and DOM Manipulation (Enter/Update/Exit, Transitions). Renders the _dynamic_ nodes inside React's layers.   |
| **Tailwind** | **The Stylist** | Defines aesthetics (Colors, Typography, Strokes) via classes.                                                                     |

React owns all state; D3 event listeners call back to React state setters, triggering re-renders through the standard unidirectional data flow.

### Data Transformation Pipeline

Raw `Activity[]` data is transformed before rendering by four utility modules:

- **`faceAggregation.ts`** — deduplicates opportunities, groups by time period (monthly/quarterly), computes stacked bar positions
- **`beamAggregation.ts`** — groups activities by opportunity, implements beam displacement algorithm (alternating ordinals sorted by revenue)
- **`stageAggregation.ts`** — aggregates revenue and activity counts by stage for the pipeline summary (nose)
- **`scales.ts`** — layout calculation and D3 scale creation (outside, activities, and opportunities scales)

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

## Documentation

- **Design Specs**: Consult `doc/design/reindeer-grammar.md` for specific rules on how activities are mapped to the visualization
- **Agent Rules**: See `AGENTS.md` for detailed architectural guidelines and coding standards

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## License

This project is released under the [Unlicense](LICENSE) — dedicated to the public domain.
