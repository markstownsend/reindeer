---
id: task-12
title: Develop Visualization Test Harness and Mock Data Provider
status: Done
assignee: []
created_date: "2026-01-03 15:34"
updated_date: "2026-01-03 17:27"
labels:
  - "Phase 1: Core Components"
  - Infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Develop a dedicated test harness component to visualize progress, test components in isolation with varying datasets, and ensure layout constraints are met.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 Creation of a `src/components/TestHarness/` directory and component.
- [x] #2 Integration of the `TestHarness` into `App.tsx` or a dedicated route.
- [x] #3 Ability to toggle between different activity datasets (e.g., small, large, edge cases).
- [x] #4 Visual controls to adjust viewport dimensions (width/height) to test responsiveness and layout.
- [x] #5 Placeholders for rendering each core component (`Face`, `Antler`, `Beam`) in isolation or combination.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

- [ ] Create `src/components/TestHarness` directory.
- [ ] Implement `mockData.ts` with at least three scenarios: Small (1 opportunity), Typical (5 opportunities), and Edge Case (Zero or many opportunities).
- [ ] Implement `TestHarness.tsx` with:
  - Dataset selector (dropdown).
  - Basic width/height sliders.
  - `ReindeerChart` preview.
- [ ] Update `src/App.tsx` to render `TestHarness`.
- [ ] Verify `ReindeerChart` updates correctly when props change.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

Simplified plan:

1. Create `src/components/TestHarness/TestHarness.tsx` as a basic wrapper.
2. Create `src/components/TestHarness/mockData.ts` with diverse activity datasets.
3. Update `TestHarness` to allow switching between datasets and basic width/height sizing via range inputs.
4. Replace `App.tsx` content with `TestHarness`.
5. Keep UI minimal using standard Tailwind.
<!-- SECTION:NOTES:END -->
