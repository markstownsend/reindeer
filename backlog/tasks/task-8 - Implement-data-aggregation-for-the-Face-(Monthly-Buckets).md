---
id: task-8
title: Implement data aggregation for the Face (Monthly Buckets)
status: To Do
assignee: []
created_date: "2026-01-03 13:43"
updated_date: "2026-01-03 13:48"
labels:
  - "Phase 1: Core Components"
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement the logic to aggregate raw opportunity data into the monthly/yearly buckets required for the Face component's stacked bar visualization.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Creation of a utility to group opportunities by month/year based on `closeDate`.
- [ ] #2 Calculation of total revenue and normalized revenue widths for each opportunity within its time bucket.
- [ ] #3 Logic to stack opportunities within each bucket (preserving the 'stacked bar' requirement).
<!-- AC:END -->
