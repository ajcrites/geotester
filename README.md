# Geotester

A geography quiz application, starting with the 50 US states. The React foundation provides a responsive homepage and local data tooling.

## Current capabilities

* Implemented: React/Vite/TypeScript setup, responsive configurable homepage, capability-based property settings, quiz length controls, configuration validation and a playable outline-to-name quiz, 50 verified state records, local outline/flag SVGs, a review gallery, reproducible collection scripts, schema/factual/asset validation, formatting, linting, and type checking.
* The default configuration now supports random questions without repeats, text answers, feedback, explicit advancement, a final score, and fresh restarts. Other property combinations still open a settings preview; full combination support and missed-answer review remain future work.

## Development

Requires Node.js 22.18+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No dataset is needed for the foundation: Home explains that data has not been collected. The Begin quiz button requires complete data, at least one shown clue, and at least one property to answer. Users will progress through setup, questions, and results using on-screen controls; there is no top-level view navigation.

```sh
npm run format        # Apply Prettier formatting
npm run format:check  # Check formatting
npm run lint          # ESLint, including React hooks
npm run test:domain   # Check configuration, sampling, answers, and scoring
npm run typecheck     # Check application, scripts, and tool configuration types
npm run build         # Build the production application into dist/
npm run preview       # Serve the production build locally
```

Formatting targets TypeScript, TSX, CSS, JSON, and HTML, using `.gitignore` to skip generated files. Markdown is reviewed separately to preserve required `*` bullets. Tool configuration lives in `prettier.config.ts` and `eslint.config.ts`; scripts run as TypeScript through `tsx`.

## Commit checks

`npm ci` installs Lefthook's Git hooks through the `prepare` script. For commits with staged changes, the pre-commit hook runs Prettier (`npm run format:check`), ESLint (`npm run lint`), and TypeScript (`npm run typecheck`) in parallel across the working tree. A failed check blocks the commit. The hook checks formatting without modifying or staging files; use `npm run format` to fix formatting before retrying.

Run the same hook manually with `npx lefthook run pre-commit --force`, even without staged files, or reinstall it with `npm run prepare`. Configuration lives in [lefthook.yml](lefthook.yml).

## Local data

Serving and building never download data. Collect the reviewed 50-state snapshot explicitly:

```sh
npm run data:collect
npm run data:validate
npm run data:gallery
npm run dev
```

Collection requires `curl` and network access; see [sources and terms](docs/DATA_SOURCES.md). Open `/data/gallery.html` on Vite's local URL to inspect all 100 images and their credits. Home reports 50 state records and enables valid quiz configurations. Use `npm run data:collect -- --replace` if a sample/dataset already exists; the previous directory is backed up after the replacement validates. Plain collection refuses overwrite. Downloads are cached in ignored `.cache/collection/`. `npm run test:data` runs data and SVG regression tests; full-data checks skip explicitly if no real data is installed.

A fresh checkout can still serve and build with an explicit empty-data placeholder before collection.

To check data and image delivery with one clearly fictional sample:

```sh
npm run data:fixture
npm run dev
npm run build
```

The installer refuses to overwrite any existing `data/` directory. Home shows the sample name, capital, and SVG; the sample is not playable geography data. To return to empty mode, move `data/` outside the repository, then restart Vite or rebuild. Restart Vite after any data changes.

* Source: ignored `data/dataset.json` (records and property metadata), `data/assets/`, and `data/provenance.json`. The version-controlled [gallery](scripts/templates/gallery.html) is copied unchanged into `data/` by collection or `npm run data:gallery`. It reads the adjacent local JSON files in the browser. Edit the tracked HTML, then run `npm run data:gallery` and restart Vite to refresh the preview.
* On server startup and build, a local Vite plugin validates the source, clears stale `public/data/`, and copies source files into that ignored directory. Vite serves it under `/data/` and copies it into `dist/data/` for production.
* The plugin generates `status.json` with `empty`, `sample`, or `ready` status and record count. Empty mode is allowed only when `data/` is absent; a present directory without its manifest is an error.
* Invalid manifests, duplicate IDs or abbreviations, missing fields, unsafe paths, and missing images stop serve/build with actionable errors.
* `npm run data:validate` requires a nonsample dataset with exactly 50 records and valid local assets. It rejects empty or sample data. Nonsample data must pass that same validation during serve/build.
* Validation enforces the complete-data JSON schemas, all 50 state identities and reviewed capitals/FIPS codes, property metadata/capabilities, unique local images, source provenance, asset hashes and self-contained SVGs. Invalid data stops serve/build. The tracked source lock pins the snapshot; source changes require deliberate review and refresh.

Manifests use `schemaVersion: 1`, `sample`, and `states`. Real data additionally requires `properties` and each state's two-digit `fips`; record IDs use `us-al` style postal identities. Shape and flag paths use readable state names, for example `assets/shapes/new-york-shape.svg` and `assets/flags/new-york-flag.svg`. See [domain types](src/domain/data.ts), [the complete-data schema](src/domain/dataset.schema.json), and [property capabilities](src/domain/properties.ts). The fictional fixture retains its smaller sample contract. Flags preserve authentic lettering, which can itself identify some states; added answer labels and metadata are excluded. Filenames identify states too, so future quiz UI should not display filenames as clue labels.

## Project documentation

* [Implementation plan](IMPLEMENTATION_PLAN.md): requirements, task status, and human verification.
* [Repository instructions](AGENTS.md): conventions and handoff workflow.
* [Architecture](docs/ARCHITECTURE.md): implemented foundation and intended quiz design.
* [Data sources](docs/DATA_SOURCES.md): provenance, reuse terms, transformations and snapshot refresh instructions.
* [Utility scripts](scripts/README.md): local data tooling.

## Commit convention

Use semantic commit messages in the form `type: description` or `type(scope): description`, using a zero-padded `task-XX` scope for numbered implementation-plan work, for example `feat(task-04): add configurable quiz setup`. Use the appropriate type with the task scope (`fix(task-04)`, `docs(task-04)`, etc.); other work may use another useful scope or omit it. Common types include `feat`, `fix`, `docs`, `refactor`, `test`, and `chore`. See [repository instructions](AGENTS.md#commit-messages) for the full convention.
