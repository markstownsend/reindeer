# Contributing to Reindeer

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone <your-fork-url>
cd reindeer
npm install
npm run dev
```

## Visual TDD

This project has **no automated test runner**. We use a Visual TDD approach with the `TestHarness` component:

1. Run `npm run dev` and navigate to the test harness
2. Switch between datasets, adjust dimensions, and configure ratios
3. Visually verify your changes render correctly across scenarios

Before submitting a PR, confirm your changes look correct in the test harness.

## Architecture & Coding Standards

The project follows a **"React wrapper, D3 engine"** pattern:

| Tech | Role |
|------|------|
| **React** | Holds state, renders container DOM (`<div>`, `<svg>`, `<g>`) |
| **D3.js** | Math (scales, shapes) and DOM manipulation inside React's layers |
| **Tailwind** | Styling via utility classes |

All code is written in **TypeScript**.

### Import Order

1. React / React libraries
2. Third-party (`d3`)
3. Local modules

See [AGENTS.md](./AGENTS.md) for detailed architecture guidelines.

## PR Process

1. Fork the repository
2. Create a feature branch (`git checkout -b my-feature`)
3. Make your changes
4. Verify visually using the test harness (`npm run dev`)
5. Ensure `npm run build` and `npm run lint` pass
6. Test the package locally before submitting:
   ```bash
   npm run pack:local          # builds the library and creates reindeer-<version>.tgz
   ```
   Then in a separate test project:
   ```bash
   npm install ../path/to/reindeer-<version>.tgz
   ```
   Verify the component imports, renders, and styles correctly as a consumer would experience it.
7. Submit a Pull Request with a clear description of what changed and why

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
