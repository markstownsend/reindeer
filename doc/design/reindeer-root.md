### Styling and layout constraints for the visualization component

When generating code for the visualization:

1. **Root container requirement**

   - All rendered UI for the visualization must be wrapped in a single root element with the class `reindeer-root`.
   - Example:
     ```tsx
     export function MyVisualization() {
       return (
         <div className="reindeer-root">
           {/* all visualization content goes here */}
         </div>
       );
     }
     ```

2. **Scoped layout**

   - Apply all layout, spacing, and typography using TailwindCSS classes **inside** the `.reindeer-root` subtree.
   - Do **not** rely on global `body`/`html` styles or external layout (e.g. no assumptions about page background, fonts, or margins outside `.reindeer-root`).

3. **No global CSS side effects**

   - Do not add or modify global styles (e.g. no `* {}` rules, no styling `body`, `html`, or generic tags without a `.reindeer-root` ancestor).
   - If non-Tailwind classes are needed, prefix them with `viz-` and always use them within `.reindeer-root` (e.g. `viz-panel`, `viz-button`), so that they are easy to scope later.

4. **Embedding-friendly design**
   - Assume the visualization will be embedded into an arbitrary host application.
   - All visual and layout behavior must be determined by markup and classes inside `.reindeer-root`, so that it can be safely packaged into a self-contained CSS bundle later.
