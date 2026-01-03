# Code Mode Rules (Non-Obvious Only)

- **Backlog First**: Non-trivial changes MUST be tracked in Backlog. Check for existing tasks before creating new ones.
- **D3/React Lifecycle**: Always include `svg.selectAll("*").remove()` at the beginning of `useEffect` to prevent duplicate elements on re-renders.
- **Tailwind v4**: Use utility classes directly in `className` for SVG elements where possible (e.g., `fill-white`, `stroke-gray-600`).
- **Imports**: Follow the mandatory order: React → third-party (d3) → local (`../../types`, `./components`).
- **Visual Verification**: Use `src/components/TestHarness/TestHarness.tsx` to verify component rendering as there is no automated test runner.
