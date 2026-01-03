# reindeer

A complex visualization component which looks like a reindeer.

## Overview

The "Reindeer Chart" is a vertical timeline visualization named for its resemblance to a reindeer head. It maps activities over time on the antlers and connects them via a burr to the head and face. The face contains opportunities in stacked horizontal bars. Time advances as you go North to South on the chart. Navigation East to West reflects the revenue size of the opportunity.

## Visual Structure (based on sketch)

### 1. Layout

- **Orientation**: Vertical
- **Y-Axis**: Time (Historic start year (usually current year) -> Future Years)
- **X-Axis**: Split into two domains:
  - **West** (Left side, older opportunities/ before some date cut off)
  - **East** (Right side, newer opportunities/ after some date cut off)

### 2. Components

- **Central Axis**: A vertical dashed line separating West and East.
- **Activity Field**: The section of the screen above the face where the antlers appear.
  - Can scale the y-axis to be days, weeks or months in this section.
  - All activities are plotted in this section of the chart.
  - Contains horizontal lines indicating the time period boundaries.
- **Time Blocks**:
  - Represented as rectangular regions.
  - Can span multiple years.
  - Located on either West or East side.
  - Located in the face of the reindeer
- **Opportunities**:
  - Rectangles placed within the time blocks.
  - Size determined by absolute revenue normalized to the size of the largest opportunity.
- **Activities**:
  - Shapes placed in the activity field.
  - Shapes are different depending on what type of activity.
  - Shapes are colored differently depending on which customer actors attended:
    - red for economic buyer
    - yellow for technical buyer
    - red and yellow if both attended.
- **Activity Timelines aka "Beam"**:
  - Vertical lines extending Northwards from the same level as the specific opportunities that the activities relate to.
  - Activities along these vertical lines depending on the date when they occurred.
  - Connected to the opportunity via a horizontal line (the burr).

## Data Requirements (Inferred)

- **Timeline**: Start date, End date.
- **Items**:
  - ID
  - Label
  - Start Date / End Date (or Duration)
  - Side: 'West' | 'East'
  - Children/Milestones: List of sub-events with dates.

## Technical Approach

- **Library**: D3.js for rendering SVG primitives.
- **Integration**: React component wrapper (`ReindeerChart`).
- **Styling**: Tailwind CSS for container layout, D3/CSS for internal SVG styling.
