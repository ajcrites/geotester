# Utility scripts

Run commands from the repository root with Node.js 22.18+ and installed npm dependencies. Scripts use TypeScript, executed through `tsx` by the package commands; they are included in `npm run typecheck`.

| Command or module       | Purpose                                                                                                | Inputs and outputs                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `npm run data:fixture`  | Install one fictional record and project-authored SVG; refuses any existing `data/` directory          | Tracked `scripts/fixtures/` → ignored `data/`                      |
| `npm run data:validate` | Require complete, nonsample data and validate records and local asset references                       | `data/dataset.json` and `data/assets/`; no writes                  |
| `prepare-data.ts`      | Vite startup/build hook: validate, remove stale generated copies, copy local data, and generate status | `data/` → ignored `public/data/`; Vite then copies to `dist/data/` |

All current scripts are offline. Empty data works only when `data/` is absent. A partial directory is an actionable error. After installing or changing source data, restart Vite; builds always refresh generated copies. Never edit `public/data/` directly.

`validateData(directory, { complete })` is exported for collection utilities. It returns the parsed dataset or null for an allowed absent dataset, and throws for invalid data. `complete: true` requires 50 nonsample records. Nonsample manifests automatically require 50 records even without this flag. Validation of real state membership, property metadata, and factual completeness is not implemented yet.

For state data and asset collection utilities, document exact invocation, prerequisites, inputs/outputs, network sources, retrieval dates, licenses, transformations, safe rerun behavior, and validation here. Collection must remain separate from serving and building; collected records and images stay ignored.
