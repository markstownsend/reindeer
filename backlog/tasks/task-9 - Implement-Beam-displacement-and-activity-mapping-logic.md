---
id: task-9
title: Implement Beam displacement and activity mapping logic
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

Implement the transformation logic to map activities to specific Beams and calculate the horizontal ordinal displacement based on opportunity revenue.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Logic to unique/sort all opportunities by total revenue.
- [ ] #2 Algorithm to assign alternating ordinals (0, -1, 1, -2, 2...) based on revenue rank.
- [ ] #3 Mapping of `Activity` objects to their respective `Beam` and horizontal offset.
<!-- AC:END -->
