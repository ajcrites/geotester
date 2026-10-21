# Utility scripts

Run from the repository root with Node.js 22.18+ and installed npm dependencies. Collection also requires `curl` on PATH. Scripts use TypeScript through `tsx` and are covered by type checking.

| Command / module | Purpose | Inputs and outputs |
| --- | --- | --- |
| `npm run data:collect` | Reproduce the reviewed 50-state snapshot; network is needed for uncached sources | Tracked source lock and remote sources → ignored `data/`, with raw downloads in ignored `.cache/collection/` |
| `npm run data:collect -- --replace` | Install a validated replacement and preserve the old directory | Previous `data/` → ignored `.data-backup-<timestamp>/`; new validated directory → `data/` |
| `npm run data:collect -- --replace --refresh-sources --no-cache` | Maintainer source refresh requiring renewed factual, visual and licensing review | Fresh network sources → new source lock and local data; update provenance docs after review |
| `npm run data:validate` | Require complete data and validate schema, facts, modes, provenance and every SVG | `data/` and tracked `scripts/source-lock.json`; no writes |
| `npm run data:gallery` | Copy the tracked offline review page after validating local data | `scripts/templates/gallery.html` → `data/gallery.html`; open `/data/gallery.html` through Vite |
| `npm run test:data` | Run malformed-data, SVG and outline regressions | Temporary test files; complete-data cases skip explicitly before collection |
| `npm run data:fixture` | Install a fictional sample; refuses existing data | Tracked `scripts/fixtures/` → ignored `data/` |
| `prepare-data.ts` | Vite startup/build validation and copying; never downloads | `data/` → ignored `public/data/` → production `dist/data/` |

## Collection behavior

* `collect-data.ts` downloads Census KML/ZIP and codes, extracts a capital table from the official Minnesota manual, projects outline SVGs, fetches Commons flag metadata in one batch, cleans flag SVG metadata without changing painter order, and generates records, property metadata, provenance and a gallery. Collection dependencies are development-only and are not imported by the browser app.
* The gallery's HTML, styles and browser rendering code live in tracked [templates/gallery.html](templates/gallery.html). `writeGallery` copies that file unchanged into the validated collection staging directory before installation, or into existing `data/` through `npm run data:gallery`. The page reads adjacent `dataset.json` and `provenance.json`; collected records are not embedded in tracked HTML. Edit the tracked file, recopy it and restart Vite to preview changes. Gallery copying is offline and does not rerun collection.
* `collection-sources.ts` selects reference URLs and records official-source checks for recent flag designs. `source-lock.json` pins source hashes, review/retrieval dates, each original flag revision and licensing/creator details. Ordinary collection reproduces that snapshot; it does not imply that the flags were freshly reviewed on every rerun.
* `--refresh-sources` resolves source metadata and writes a new lock after validation; cached responses are still eligible unless `--no-cache` is also passed. Review all changes and update `docs/DATA_SOURCES.md` before accepting a refresh. Network retries do not silently accept bytes that differ from the reviewed lock.
* `--replace` is explicit because source data may already exist. Downloads and processing finish in an ignored staging directory; the current dataset is replaced only after all validation passes. Previous data is retained as an ignored backup, and failed staging work is removed. Without `--replace`, existing data causes an actionable refusal.
* Source PDFs and raw SVG/XML/API responses remain in `.cache/collection/`. They are not included in served/build output. Downloads are serialized, Wikimedia requests are paced, and curl retries transient errors. A failed collection can be retried with completed downloads reused.

## Contracts and validation

`src/domain/data.ts` defines record/manifest types; `src/domain/properties.ts` defines serializable capability metadata with rendering in app code. `src/domain/dataset.schema.json` and `property.schema.json` are enforced with Ajv for complete data. The fictional fixture remains a smaller explicitly sample-only contract.

`validateData(directory, { complete })` returns a parsed dataset or null for an allowed absent directory. A present directory without a manifest is an error. Real data always requires exactly the 50 allowed states, the reviewed factual digest, correctly named unique assets, matching provenance/output hashes, and valid self-contained SVGs. Every property must match the registered capabilities; image properties cannot offer fill-in. The CLI and Vite hook use this same validator.

Empty-data mode is still available before collection. Restart Vite after changing source data; builds refresh generated copies. Never edit `public/data/` directly. See [data provenance](../docs/DATA_SOURCES.md) for source choices, original download URLs, date/license tables, corrections, island layout, intrinsic flag lettering and refresh review instructions.
