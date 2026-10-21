# Repository instructions

## Start here

* Read `IMPLEMENTATION_PLAN.md` before implementing a task. It is the source of truth for scope, dependencies, acceptance criteria, and task status.
* Read `README.md` for the current repository state and `docs/ARCHITECTURE.md` for the intended design.
* Inspect existing files and preserve user changes. Work on the requested task; do not automatically start later tasks.
* Mark the active task In progress, then Complete only after its acceptance criteria pass. Record validation, material limitations, and decisions below that task.

## Scope and stack

* Build a configurable geography quiz starting with the 50 US states; exclude DC and territories initially.
* Use React and Vite. TypeScript is the plan's proposed language default. Task 02 adds Prettier and linting.
* Use hardcoded data and local assets. No backend, database, accounts, or external runtime API is needed for the current scope.
* Keep property capabilities explicit: every property supports omit and show, while answer modes vary. Do not assume future properties support fill-in or multiple choice.
* Treat the plan's proposed defaults as implementation assumptions, not confirmed user decisions. Document changes to those assumptions.
* Avoid unnecessary dependencies and abstractions. Start with local React state and pure domain functions.

## Folder conventions

The application folders below are planned for later tasks; create them when needed.

* `src/domain/`: framework-independent types, configuration validation, question generation, answer evaluation, and scoring.
* `src/data/`: typed state records and property definitions.
* `src/features/`: setup, quiz, and results UI, grouped by feature.
* `src/components/`: UI shared by multiple features, introduced when reuse exists.
* `public/assets/states/`: locally stored outlines and flags; keep source attribution in `docs/DATA_SOURCES.md` when Task 03 collects assets.
* `scripts/`: reusable utilities, including Task 03's data and asset collection scripts. Document invocation, inputs, outputs, and network needs.
* `docs/`: architecture, data provenance, and other durable project documentation.

## Validation and handoff

* Run checks appropriate to the task and report actual results. Never claim an unrun check passed.
* For documentation changes, verify links, consistency with the plan, and Markdown conventions; no application tests are needed.
* Once Task 02 establishes package scripts, use the documented format, lint, and build commands for relevant code changes. Add meaningful domain tests as quiz behavior is implemented.
* Verify UI changes at desktop and mobile widths, including keyboard interaction when applicable.
* For data collection, verify completeness, unique IDs, local asset references, visual readability, authoritative sources, and redistribution terms.
* Keep implemented behavior distinct from future design. Update documentation alongside behavior changes.
* Do not invent setup commands before the corresponding tooling exists.

## Writing conventions

* Use `*` for Markdown bulleted lists, including documentation, commit messages, and pull request descriptions. Do not use hyphens as bullet markers.
* Write clear, concise instructions and record consequential decisions where later tasks can find them.
