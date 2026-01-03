# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands

- **Dev Server**: `npm run dev` (Vite)
- **Build**: `npm run build` (tsc + vite build)
- **Lint**: `npm run lint` (eslint)
- **Testing**: No automated test runner configured (Vitest/Jest). Use `src/components/TestHarness/TestHarness.tsx` for visual verification.

## Non-Obvious Patterns

- **Backlog Management**: Always use `mcp--backlog` tools. Do not edit `backlog/` markdown files directly. See `backlog://workflow/overview`.
- **Visualization**: Core logic is in `src/components/ReindeerChart/ReindeerChart.tsx`. It uses D3.js within a React `useEffect` hook with an SVG `ref`.
- **CSS**: Uses Tailwind CSS v4. Standard Tailwind classes are used directly in `className`.
- **Project Structure**:
  - `design/`: Contains visual and architectural specifications for the Reindeer visualization.
  - `implement/`: Contains SOPs and implementation guidelines (e.g., `CODEASSIST.md`).
- **Imports**: Order: React → third-party (d3) → local (types/components).

## Custom Constraints

- **D3 Selection**: Use `svg.selectAll("*").remove()` at the start of `useEffect` to ensure clean redraws on data/dimension updates.
- **Styling**: Prefer Tailwind utility classes for colors and fonts within SVG (e.g., `fill-white`, `text-xl`).

@.tessl/RULES.md

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities. Read `backlog://workflow/overview` before starting work.
</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:

- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and completion
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
