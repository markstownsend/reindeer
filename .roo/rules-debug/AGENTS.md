# Debug Mode Rules (Non-Obvious Only)

- **Test Harness Dataset**: Mock datasets for debugging are located in `src/components/TestHarness/mockData.ts`.
- **D3 Selection Debugging**: When inspecting SVG elements, remember that D3 selections are often cleared and redrawn on React state changes.
- **Tailwind JIT**: Tailwind v4 is used; if styles aren't applying, check if classes are being dynamically generated in a way that bypasses the scanner.
