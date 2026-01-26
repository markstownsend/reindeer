# Plan: Constrain Face Width for Reindeer Visualization

## Problem Statement

The current visualization has the **face** (opportunity bars) spanning the same width as the **antlers** (beams). This doesn't look like a real reindeer, where antlers should be wider than the head.

## Current State Analysis

In [`ReindeerChart.tsx`](src/components/ReindeerChart/ReindeerChart.tsx):

1. **Face Width** (line 57):

   ```javascript
   const faceWidth = width - margin.left - margin.right;
   ```

2. **Beam X Scale** (lines 262-266):
   ```javascript
   const beamXScale = d3
     .scaleLinear()
     .domain([-maxOrdinal - 0.5, maxOrdinal + 0.5])
     .range([margin.left, width - margin.right]);
   ```

Both the face and the beams span from `margin.left` to `width - margin.right`, resulting in equal widths.

## Proposed Solution

### 1. Define Face Width as a Configurable Ratio

Add `faceWidthRatio` as an optional prop to `ReindeerChartProps` with a default value of 0.6 (60%). This determines how much of the available width the face should occupy.

```javascript
interface ReindeerChartProps {
  width?: number;
  height?: number;
  data?: Activity[];
  faceWidthRatio?: number; // New prop: 0.0 to 1.0, default 0.6
}

export const ReindeerChart: React.FC<ReindeerChartProps> = ({
  width = 800,
  height = 600,
  data = [],
  faceWidthRatio = 0.6, // Default: Face occupies 60% of available width
}) => {
  const totalAvailableWidth = width - margin.left - margin.right;
  const faceWidth = totalAvailableWidth * faceWidthRatio;
```

### 2. Center the Face

Calculate the left position of the face to center it within the available width:

```javascript
const faceLeft = margin.left + (totalAvailableWidth - faceWidth) / 2;
```

### 3. Update Face Rendering

Replace all occurrences of `margin.left` with `faceLeft` when rendering face elements:

- Year labels (line 134)
- Year separator lines (line 143)
- Month labels (line 157)
- Bucket backgrounds (line 166)
- Opportunity bars (line 182)
- Total revenue text (line 213)

### 4. Keep Beams Spanning Full Width

The `beamXScale` should continue to use the full available width so antlers extend beyond the face:

```javascript
const beamXScale = d3
  .scaleLinear()
  .domain([-maxOrdinal - 0.5, maxOrdinal + 0.5])
  .range([margin.left, width - margin.right]); // No change needed
```

### 5. Update Revenue Scale

The revenue scale should use the constrained `faceWidth`:

```javascript
const revenueScale = d3
  .scaleLinear()
  .domain([0, maxRevenue > 0 ? maxRevenue : 1])
  .range([0, faceWidth * 0.8]); // Use constrained faceWidth
```

## Implementation Steps

### Step 1: Add Prop and Validation

- Add `faceWidthRatio` to `ReindeerChartProps` interface with default value 0.6
- Add validation to clamp `faceWidthRatio` between 0.1 and 1.0
- Calculate `totalAvailableWidth`, `faceWidth`, and `faceLeft`

### Step 2: Update Revenue Scale

- Modify `revenueScale` to use the new `faceWidth`

### Step 3: Update Face Layer Rendering

- Replace `margin.left` with `faceLeft` for all face elements
- Update bucket background width to use `faceWidth`
- Update year separator line x2 to use `faceLeft + faceWidth`

### Step 4: Update Face Layer Text Positioning

- Center title using `faceLeft + faceWidth / 2`
- Update total revenue text x position to `faceLeft + faceWidth + 5`

### Step 5: Update Legend Positioning

- Ensure legend stays aligned with the face width

### Step 6: Visual TDD Verification

- Use existing mock data scenarios to verify the face is centered and narrower than antlers
- Test with `beamComplexDisplacement` dataset to see multiple beams extending beyond the face

## Visual Impact

```
Before:
|<---------------- Full Width (Face + Antlers Same Width) ---------------->|
[  Face (Full Width)  ]
[  Antlers (Full Width)  ]

After:
|<---------------- Full Width ---------------->|
       |<-- Face (60%) -->|
[       Face (Centered)       ]
[  Antlers (Full Width)  ]
```

## Configuration Considerations

The `faceWidthRatio` prop allows users to customize the face-to-antler width ratio:

- **0.5**: Face is half the width (more dramatic antlers)
- **0.6**: Face is 60% width (default, balanced appearance)
- **0.7**: Face is 70% width (subtler effect)
- **1.0**: Face spans full width (original behavior)

### Validation

Add validation to ensure `faceWidthRatio` is between 0.1 and 1.0:

```javascript
const validatedFaceWidthRatio = Math.max(0.1, Math.min(1.0, faceWidthRatio));
```

## Files to Modify

- [`src/components/ReindeerChart/ReindeerChart.tsx`](src/components/ReindeerChart/ReindeerChart.tsx)
  - Update `ReindeerChartProps` interface
  - Add `faceWidthRatio` prop with default value
  - Add validation for `faceWidthRatio`
  - Calculate `faceWidth` and `faceLeft` based on the prop
  - Update all face rendering to use the constrained width

## Testing Strategy

1. **Visual TDD**: Use TestHarness with `beamComplexDisplacement` dataset
2. Verify face is centered within the available width
3. Verify antlers extend beyond the face on both sides
4. Verify burr connections still work correctly with the new face positioning
5. Test with different `faceWidthRatio` values (0.5, 0.6, 0.7, 1.0)
6. Verify edge cases: values below 0.1 are clamped to 0.1, values above 1.0 are clamped to 1.0
