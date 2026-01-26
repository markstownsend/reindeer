# Steering Documentation Update Summary

## Date: 2026-01-26

## Overview

Updated all project steering documentation to reflect recently implemented features in the Reindeer visualization project.

## Files Updated

### 1. AGENTS.md

**Purpose**: Main steering document for all agents working on this project.

**Changes Made**:

#### Added Multiple Vertical Scales System Section

- Documented the 3-tier vertical scale architecture
- Explained the separation between activities (top) and opportunities (bottom) sections
- Included ASCII diagram showing the scale hierarchy
- Listed key properties:
  - Activities always render above opportunities
  - Each section maintains its own time padding
  - Burr connections cross between scales
  - Configurable via `activitiesHeightRatio` prop

#### Added Constrained Face Width Section

- Documented the face width constraint feature
- Explained that face is narrower than antlers for realistic reindeer appearance
- Listed key properties:
  - Configurable via `faceWidthRatio` prop (0.0 to 1.0, default 0.6)
  - Face is centered within available width
  - Beams span full available width

#### Expanded Data Transformation Architecture Section

- Documented all three utility modules:
  1. `src/utils/faceAggregation.ts` - Pure logic for face layer data
  2. `src/utils/beamAggregation.ts` - Pure logic for antler/beam layer data
  3. `src/utils/dataTransform.ts` - Shared transformation utilities
- Listed all functions in each module with descriptions

#### Added Component Configuration Section

- Created table documenting all `ReindeerChart` props:
  - `width`, `height`, `data` (existing)
  - `faceWidthRatio` (new, default 0.6)
  - `activitiesHeightRatio` (new, default 0.5)
- Documented validation: both ratio props are clamped to valid ranges

#### Added Visualization Layers Section

- Documented all four layers with their contents:
  1. `layer-face` - Year labels, month labels, bucket backgrounds, stacked bars, revenue labels, legend
  2. `layer-beams` - Vertical beam edges, beam labels
  3. `layer-antlers` - Activity nodes, Northern Terminus icons
  4. `layer-burrs` - Horizontal dashed lines connecting beams to opportunities

#### Added Data Flow Section

- Created Mermaid diagram showing data flow from raw activities through transformation utilities to rendering layers

### 2. design/reindeer-grammar.md

**Purpose**: Grammar describing visualization artifacts and coordinate systems.

**Changes Made**:

#### Updated Derivative Coordinates Section

- Added note about constrained face width: "Face width is constrained to be narrower than beam width (configurable via `faceWidthRatio`)"

#### Added Multiple Vertical Scales System Section (New Section 3)

- Documented the 3-tier vertical scale system
- Explained Outside Total Scale, Inside Activities Scale, and Inside Opportunities Scale
- Listed key properties:
  - Activities always render above opportunities
  - Each section maintains its own time padding
  - Burr connections are only visual elements that cross between scales
  - Configurable via `activitiesHeightRatio` prop

#### Renumbered Subsequent Sections

- Renumbered "Scales" section to section 4
- Renumbered "Marks" section to section 5
- Renumbered "Aesthetic mappings" section to section 6
- Renumbered "Statistical transformations" section to section 7
- Renumbered "Position adjustments" section to section 8
- Renumbered "Layers" section to section 9
- Renumbered "Interaction grammar" section to section 10

#### Updated Activity Node Size Mapping

- Changed from "effort - number of hours" to "effort - number of participants" to match actual implementation

## Features Now Documented

1. **Multiple Vertical Scales**

   - 3-tier scale system (Outside Total, Inside Activities, Inside Opportunities)
   - Activities render above opportunities
   - Configurable via `activitiesHeightRatio` prop

2. **Constrained Face Width**

   - Face narrower than antlers
   - Configurable via `faceWidthRatio` prop
   - Creates realistic reindeer appearance

3. **Burr Connections**

   - Horizontal dashed lines connecting beams to opportunities
   - Cross between activities and opportunities scales
   - Documented in both AGENTS.md and reindeer-grammar.md

4. **Data Transformation Architecture**

   - Three utility modules documented
   - Face aggregation logic
   - Beam aggregation logic
   - Shared transformation utilities

5. **Component Configuration**

   - All props documented with types and defaults
   - Validation rules documented
   - New props: `faceWidthRatio`, `activitiesHeightRatio`

6. **Visualization Layers**

   - All four layers documented with contents
   - Layer ordering maintained

7. **Data Flow**
   - Mermaid diagram showing end-to-end data flow

## Impact

All recently implemented features are now properly documented in the steering documentation. Future agents working on this project will have clear guidance on:

- How the multiple vertical scales system works
- How face width constraints are applied
- How burr connections cross between scales
- The complete data transformation architecture
- All available component configuration options
- The visualization layer structure
- The data flow from raw activities to rendered layers

## Files Not Requiring Updates

The following files were reviewed and determined to not require updates:

- **design/reindeer-root.md** - Styling and layout constraints (still relevant)
- **design/reindeer-component.md** - Component design specs (not modified by recent features)
- **.tessl/RULES.md** - Tessl steering capabilities (project-specific, not affected)
- **.tessl/tiles/tessl/cli-setup/steering/query_library_docs.md** - Generic Tessl steering (not affected)
