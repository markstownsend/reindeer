---
id: task-13
title: Migrate ESLint to Flat Config format
status: Done
assignee: []
created_date: "2026-01-03 17:59"
updated_date: "2026-01-03 18:01"
labels: []
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Migrate project from legacy ESLint configuration (.eslintrc.json, .eslintignore) to the new Flat Config format (eslint.config.js).

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [x] #1 `eslint.config.js` created in project root
- [x] #2 `.eslintignore` and `.eslintrc.json` content migrated to `eslint.config.js`
- [x] #3 `.eslintignore` and `.eslintrc.json` files removed
- [x] #4 ESLint 9+ and required plugins installed in `devDependencies`
- [x] #5 `npm run lint` (or equivalent) works with the new config
<!-- AC:END -->
