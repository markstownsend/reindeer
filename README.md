# Reindeer

A complex visualization component which looks like a reindeer.

## Overview

The **Reindeer Chart** is a vertical timeline visualization named for its resemblance to a reindeer head. It maps activities over time on the antlers and connects them via a burr to the head and face. The face contains opportunities in stacked horizontal bars. Time advances as you go North to South on the chart. Navigation East to West in the face reflects the revenue size of the opportunity. The first use case that motivated the need for the visualization was in enterprise software sales where you have a large enterprise sales team pursuing many opportunities at a large customer. It is hard to see what everyone is working on, who is working on what together, who owns what opportunity, what stage the opportunity is at, how much work has gone into it and various other things.

![initial sketch](./doc/design/reindeer-overview-001.jpg)

## Features

- **Multi-Year Timeline**: Visualize activities and opportunities across multiple years
- **Activity Tracking**: Track sales activities with participant information (sellers and customers)
- **Opportunity Staging**: Display opportunities at different stages (Discovery, Proposal, Closed Won, etc.)
- **Revenue Visualization**: Opportunity size reflects revenue, normalized to the largest opportunity
- **Flexible Layout**: Configure face width ratio and activities height ratio for different visualizations
- **Bound & Free Activities**: Support for activities linked to specific opportunities (bound) and standalone activities (free)

### Visual Examples

#### Multi-Year Stage Mix

Shows opportunities across multiple years with different stages, demonstrating the full visualization capabilities:

![3-year stage mix](./doc/img/3-year-stage-mix.png)

#### Bound Activities

Activities that are directly linked to specific opportunities, shown as vertical beams connecting to opportunity bars:

![Bound activities](./doc/img/bound-activities.png)

#### Mixed Bound and Free Activities

A combination of bound activities (connected to opportunities) and free activities (standalone):

![Mixed bound and free activities](./doc/img/mixed-bound-and-free-activities.png)

## Installation

```bash
npm install
```

## Usage

### Basic Component

```tsx
import { ReindeerChart } from "./components/ReindeerChart";
import type { Activity } from "./types/reindeer";

const myData: Activity[] = [
  {
    id: "a1",
    timestamp: "2023-10-01T09:00:00Z",
    sellers: [{ name: "Alice Smith", role: "Account Executive" }],
    customers: [{ name: "Charlie Brown", role: "CTO" }],
    description: "First contact",
    linkedOpportunities: [
      {
        id: "opp-101",
        closeDate: "2023-12-15",
        stage: "Discovery",
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

### Data Structure

```typescript
interface Activity {
  id: string;
  timestamp: string; // ISO 8601 UTC format
  sellers: Seller[];
  customers: Customer[];
  description: string;
  linkedOpportunities: Opportunity[];
}

interface Seller {
  name: string;
  role: string;
}

interface Customer {
  name: string;
  role: string;
}

interface Opportunity {
  id: string;
  closeDate: string; // ISO 8601 date YYYY-MM-DD
  stage: string;
  revenue: number;
  stageAdjustedRevenue: number;
}
```

## Visual Structure

### Layout

- **Orientation**: Vertical
- **Y-Axis**: Time (Historic start year (usually current year) → Future Years)
- **X-Axis**: Split into two domains:
  - **West** (Left side, older opportunities/ before some date cut off)
  - **East** (Right side, newer opportunities/ after some date cut off)

### Components

- **Central Axis**: A vertical dashed line separating West and East
- **Activity Field**: The section of the screen above the face where the antlers appear
  - Can scale the y-axis to be days, weeks or months in this section
  - All activities are plotted in this section of the chart
  - Contains horizontal lines indicating the time period boundaries
- **Time Blocks**:
  - Represented as rectangular regions
  - Can span multiple years
  - Located on either West or East side
  - Located in the face of the reindeer
- **Opportunities**:
  - Rectangles placed within the time blocks
  - Size determined by absolute revenue normalized to the size of the largest opportunity
- **Activities**:
  - Shapes placed in the activity field
  - Shapes are different depending on what type of activity
  - Shapes are colored differently depending on which customer actors attended
    - red for economic buyer
    - yellow for technical buyer
    - red and yellow if both attended
- **Activity Timelines aka "Beam"**:
  - Vertical lines extending Northwards from the same level as the specific opportunities that the activities relate to
  - Activities along these vertical lines depending on the date when they occurred
  - Connected to the opportunity via a horizontal line (the burr)

### Visualization Layers

The chart renders four distinct layers in order:

1. **Face** - Year labels, month labels, opportunity bucket backgrounds, stacked opportunity bars, revenue labels, and legend
2. **Teeth** - Separator lines between time periods
3. **Beams** - Vertical beam edges connecting activity nodes
4. **Antlers** - Activity nodes (circles, sized by participant count) and Northern Terminus icons
5. **Burrs** - Horizontal dashed lines connecting beam bottom to opportunity center

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

- **Design Specs**: Consult `design/reindeer-grammar.md` for specific rules on how activities are mapped to the visualization
- **Implementation Guide**: Refer to `implement/CODEASSIST.md` for the structured workflow
- **Agent Rules**: See `AGENTS.md` for detailed architectural guidelines and coding standards

## License

See LICENSE file for details.
