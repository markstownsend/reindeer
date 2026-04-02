# Grammar to describe visualization artifacts

## 1. Data

This grammar describes logical entities and structure for reindeer visualization.

- **Activities**: Discrete events (e.g., meetings, emails) with timestamps, authors, and metrics.
- **Antlers**: A compound visualization made up of a vertical timeline (tine) representing a chronological stream of activities associated with a single opportunity and a horizontal bar at the Southern terminal of the timeline connecting to the opportunity. This horizontal bar is called a burr.
- **Beam**: The primary grouping mechanism. Each beam contains one "Antler" (opportunity) and is displaced along the horizontal axis based on opportunity revenue. Beam comes from antler anatomy and is the main stem of the antler.
- **Face**: A compound visualization made up of Opportunities placed on a horizontal stacked bar where (horizontal) size is proportional to revenue and bucketed (vertically) according to a time bucket (week or month) that the opportunity is due to close in. This is repeated for each year where there are opportunities.
- **Head**: A visual component that surrounds the face with a margin, for the purpose of giving antlers that don't relate to an opportunity somewhere for the burr to connect to.

## 2. Coordinate systems

- **Base Coordinates**:

  - **x-axis (Revenue)**: mixed axis. Beams are sorted by revenue (largest revenue closest to the origin, next largest on the opposite side of the origin and alternating).
  - **y-axis (Time)**: continuous time axis. The "Antler" stands vertically, with activities plotted at their corresponding timestamps.

- **Derivative Coordinates**:
  - **x-axis (Revenue)**: in the stacked bar which is part of the Face then revenue is continuous but normalized to a fixed size of the Face depending on screen resolution. The stacked bar inside the Face is a separate layer projected above the beams collection. **Face width is constrained to be narrower than beam width** (configurable via `faceWidthRatio`).
  - **x-axis (Revenue)**: in beam displacement revenue is an ordinal calculated according to the relative revenue of all opportunities and converted into an order. So ordinal 1 which appears to the left of the origin is the largest opportunity. Ordinal 2 which appears to the right of the origin is the next largest and so on alternating either side of the origin and diminishing in size further from the origin.
  - **y-axis (Time)**: in the activity area, in other words beams, time is continuous and the Southernmost point (lowest y value) is the latest activity date. From this point the burr must connect to the opportunity all the work relates to.
  - **y-axis (Time)**: in the stacked bar which is part of the Face then time is discrete in monthly buckets

## 3. Multiple Vertical Scales System

The visualization implements a **3-tier vertical scale system** to ensure proper separation between activities and opportunities:

- **Outside Total Scale**: Abstract continuous scale bound by visualization height
- **Inside Activities Scale**: Time scale taking up configurable proportion (default: 50% of total height)
- **Inside Opportunities Scale**: Time scale taking up remaining proportion (default: 50% of total height)

**Key Properties:**

- Activities always render above opportunities (past events precede future close dates)
- Each section maintains its own time padding
- Burr connections are the only visual elements that cross between scales
- Configurable via `activitiesHeightRatio` prop (0.0 to 1.0, default 0.5)

## 4. Scales

- x-scale: revenue → horizontal position.
- y-scale: time → vertical position (separate scales for activities and opportunities).
- Size scales: effort → visual effect (activity node radius).
- Color scales: effort → hue; status/category → hue or lightness (whether customer was an economic buyer).

## 5. Marks (geometric objects)

Break the picture into layers of marks:

- Axis marks:
  - Geom: lines + ticks + labels for time axis (x) and optional lane labels (y).
- Activity area:
  - Activity nodes: points or small glyphs at (x_beam, y_time).
  - Beam edges: polylines connecting previous activity → next activity across time.
- Stacked bar marks:
  - For each time bucket and lane (or global bar at bottom): rectangles stacked in x (within the bar) whose width encodes normalized revenue.
- Beam Crown:
  - Icons representing each person who worked on an activity in the beam.
- Beam Southern Terminus:
  - A line (the burr) which connects the beam to the opportunity in the Face.

Each mark type is a reusable building block you can instantiate in a layer.

## 6. Aesthetic mappings

For each mark, define how data fields map to visual channels:

- Activity nodes:
  - x ← beam
  - y ← timestamp
  - size ← metric (effort - number of participants)
  - color ← role of customerPerson
- Branch edges:
  - x,y path ← sequence of activities
  - color ← beam
- Stacked bars:
  - x ← normalized revenue
  - y ← time bucket
  - width of each segment ← metric value (normalized revenue)
  - fill color ← metric category
  - y origin ← lane or baseline
- Depth cues:
  - z ← logical layer → global "tilt" transform, blur, or lightness.

## 7. Statistical transformations

Define any derived computations before drawing:

- Layout: assign activities → beam_index (x).
- Edge routing: compute control points for polylines to avoid overlaps.

These can be pure functions from your raw tables to "plot-ready" tables.

## 8. Position adjustments

Specify how overlapping elements are separated:

- Dodge activities that share timestamp and beam (small vertical offset).
- Offset parallel beam edges slightly to keep them distinguishable.
- Adjust stacked bar segments to ensure clean boundaries and labels.

## 9. Layers

Compose the whole visualization as ordered layers:

1. Background grid and time axis.
2. Stacked bars (global or per lane).
3. Branch edges (tree structure).
4. Activity nodes on top.
5. Labels, legends, and annotations.
6. Interaction overlays (highlight halos, selection outlines, tooltips anchor marks).

Each layer has:

- data: which table or view it uses,
- mapping: aesthetics listed above,
- geom: which mark primitive it draws,
- stat: any transformation (e.g., aggregation) it applies,
- position: its adjustment rules (jitter, dodge, stack).

## 10. Interaction grammar (optional)

Describe interaction in similar terms:

- Selection: user action (click/hover/brush) → predicate on data (e.g., activity.id ∈ S).
- Highlighting: selection predicate → visual state change (increase opacity, thicken edge, bring to front).
- Filtering: selection predicate → subset of data passed to specific layers.
- Navigation: pan/zoom in time (update x-scale domain) or expand/collapse branches (change lane/depth assignments).

#### You can now "instantiate" this grammar in whatever stack you choose (e.g., SVG + D3, Canvas, or a 2.5D projection), but the grammar itself is technology-agnostic and should stay stable even if you change the rendering backend.
