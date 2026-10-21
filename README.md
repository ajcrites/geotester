# Geotester

A geography quiz application, starting with the 50 US states. The React foundation provides a responsive homepage and local data tooling.

## Current capabilities

* Implemented: React/Vite/TypeScript setup, responsive homepage, local data and sample image delivery, structural data validation, formatting, linting, and type checking.
* Not implemented: complete state data collection, quiz configuration, question progression, scoring, and results. Quiz and results components are placeholders; they are not reachable from the homepage.

## Development

Requires Node.js 22.18+ and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No dataset is needed for the foundation: Home explains that data has not been collected. The setup button is disabled until quiz functionality is implemented. Users will progress through setup, questions, and results using on-screen controls; there is no top-level view navigation.

```sh
npm run format        # Apply Prettier formatting
npm run format:check  # Check formatting
npm run lint          # ESLint, including React hooks
npm run typecheck     # Check application, scripts, and tool configuration types
npm run build         # Build the production application into dist/
npm run preview       # Serve the production build locally
```

Formatting targets TypeScript, TSX, CSS, JSON, and HTML, using `.gitignore` to skip generated files. Markdown is reviewed separately to preserve required `*` bullets. Tool configuration lives in `prettier.config.ts` and `eslint.config.ts`; scripts run as TypeScript through `tsx`.

## Commit checks

`npm ci` installs Lefthook's Git hooks through the `prepare` script. For commits with staged changes, the pre-commit hook runs Prettier (`npm run format:check`), ESLint (`npm run lint`), and TypeScript (`npm run typecheck`) in parallel across the working tree. A failed check blocks the commit. The hook checks formatting without modifying or staging files; use `npm run format` to fix formatting before retrying.

Run the same hook manually with `npx lefthook run pre-commit --force`, even without staged files, or reinstall it with `npm run prepare`. Configuration lives in [lefthook.yml](lefthook.yml).

## Local data

No command automatically collects or downloads data. A fresh checkout serves and builds with an explicit empty-data placeholder.

To check data and image delivery with one clearly fictional sample:

```sh
npm run data:fixture
npm run dev
npm run build
```

The installer refuses to overwrite any existing `data/` directory. Home shows the sample name, capital, and SVG; the sample is not playable geography data. To return to empty mode, move `data/` outside the repository, then restart Vite or rebuild. Restart Vite after any data changes.

* Source: ignored `data/dataset.json` and `data/assets/`.
* On server startup and build, a local Vite plugin validates the source, clears stale `public/data/`, and copies source files into that ignored directory. Vite serves it under `/data/` and copies it into `dist/data/` for production.
* The plugin generates `status.json` with `empty`, `sample`, or `ready` status and record count. Empty mode is allowed only when `data/` is absent; a present directory without its manifest is an error.
* Invalid manifests, duplicate IDs or abbreviations, missing fields, unsafe paths, and missing images stop serve/build with actionable errors.
* `npm run data:validate` requires a nonsample dataset with exactly 50 records and valid local assets. It rejects empty or sample data. Nonsample data must pass that same validation during serve/build.
* Validation currently checks structure and asset references; it does not verify authoritative state membership, factual accuracy, property metadata/capabilities, or provenance. A full dataset collection command is not available yet.

The initial manifest contract is `schemaVersion: 1`, an explicit `sample` boolean, and a nonempty `states` array. Records have nonempty `id`, `name`, `abbreviation` (two uppercase letters), `capital`, `shape`, and `flag`. Asset references are relative local paths beginning with `assets/`. See [the fixture](scripts/fixtures/dataset.json) and [domain types](src/domain/data.ts). Sample assets are project-authored geometric illustrations, not collected state assets.

## Project documentation

* [Implementation plan](IMPLEMENTATION_PLAN.md): requirements, task status, and human verification.
* [Repository instructions](AGENTS.md): conventions and handoff workflow.
* [Architecture](docs/ARCHITECTURE.md): implemented foundation and intended quiz design.
* [Utility scripts](scripts/README.md): local data tooling.

## Commit convention

Use semantic commit messages in the form `type: description` or `type(scope): description`, for example `feat: add local data validation`. Common types include `feat`, `fix`, `docs`, `refactor`, `test`, and `chore`. See [repository instructions](AGENTS.md#commit-messages) for the full convention.
