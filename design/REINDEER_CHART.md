# Reindeer Chart Design

## Overview
The "Reindeer Chart" is a vertical timeline visualization named for its resemblance to reindeer antlers. It maps events and milestones across a timeline, split between "West" and "East" categories.

## Visual Structure (based on sketch)

### 1. Layout
- **Orientation**: Vertical
- **Y-Axis**: Time (Current Year -> Future Years)
- **X-Axis**: Split into two domains:
    - **West** (Left side)
    - **East** (Right side)

### 2. Components
- **Central Axis**: A vertical dashed line separating West and East.
- **Time Blocks**:
    - Represented as rectangular regions.
    - Can span multiple years.
    - Located on either West or East side.
- **Items/Events**:
    - Rectangles placed within the time blocks or independently.
- **"Antlers" (Callouts)**:
    - Vertical lines extending upwards from specific items.
    - Nodes (dots) along these vertical lines representing specific milestones or sub-events (e.g., "Meet", "Plan", "Dinner", "Kickoff").
    - Connected to the main item via a line.

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
