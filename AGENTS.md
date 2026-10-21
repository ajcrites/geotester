# Repository instructions

## Start here

* Read `IMPLEMENTATION_PLAN.md` before implementing a task. It is the source of truth for scope, dependencies, acceptance criteria, and task status.
* Read `README.md` for the current repository state and `docs/ARCHITECTURE.md` for the intended design.
* Inspect existing files and preserve user changes. Work on the requested task; do not automatically start later tasks.
* Mark the active task In progress. After implementation and agent checks pass, mark it Awaiting human verification. Mark it Complete only after the user explicitly confirms verification. Record validation, material limitations, and decisions below that task.

## Scope and stack

* Build a configurable geography quiz starting with the 50 US states; exclude DC and territories initially.
* Use React and Vite. TypeScript is the plan's proposed language default. Task 02 adds Prettier and linting.
* Use hardcoded data and local assets. No backend, database, accounts, or external runtime API is needed for the current scope. Do not commit collected data or assets; regenerate them through version-controlled scripts. Keep schemas, types, application logic, collection scripts, and provenance documentation in version control.
* Keep property capabilities explicit: every property supports omit and show, while answer modes vary. Do not assume future properties support fill-in or multiple choice.
* Treat the plan's proposed defaults as implementation assumptions, not confirmed user decisions. Document changes to those assumptions.
* Avoid unnecessary dependencies and abstractions. Start with local React state and pure domain functions.

## Folder conventions

The application folders below are planned for later tasks; create them when needed.

* `data/`: collected state records and property metadata; not version controlled.
* `data/assets/`: collected outlines and flags referenced by those records; not version controlled.
* Keep types and schemas in `src/domain/`. Serve local data directly or copy it for development, and copy data and assets into build output. Ignore generated copies as well as their source directory.
* `src/domain/`: framework-independent types, configuration validation, question generation, answer evaluation, and scoring.
* `src/features/`: setup, quiz, and results UI, grouped by feature.
* `src/components/`: UI shared by multiple features, introduced when reuse exists.
* `scripts/`: reusable utilities, including Task 03's data and asset collection scripts. Document invocation, inputs, outputs, and network needs.
* `docs/`: architecture, data provenance, and other durable project documentation.

## Validation and handoff

* After finishing each task's implementation and agent checks, record a short, concrete human verification checklist below that task in `IMPLEMENTATION_PLAN.md` and include it in the final response. Link relevant files or give exact UI steps and expected outcomes.
* Human checks should cover observable behavior or reviewable documents, not require repeating every automated check. For documentation tasks, ask the user to read and optionally edit the relevant documents.
* Leave the task Awaiting human verification until the user explicitly confirms the checks. If the user requests changes, return it to In progress, make and validate the changes, and provide an updated checklist. Silence or a request for changes is not verification.
* Record the user's confirmation and verification date when marking Complete. Do not start dependent tasks while verification is pending unless the user explicitly directs otherwise.

* Run checks appropriate to the task and report actual results. Never claim an unrun check passed.
* For documentation changes, verify links, consistency with the plan, and Markdown conventions; no application tests are needed.
* Once Task 02 establishes package scripts, use the documented format, lint, and build commands for relevant code changes. Add meaningful domain tests as quiz behavior is implemented. Remove references to completed tasks that are obviated by these updates (e.g. this line).
* Verify UI changes at desktop and mobile widths, including keyboard interaction when applicable.
* For data collection, verify completeness, unique IDs, local asset references, visual readability, authoritative sources, and redistribution terms.
* Keep implemented behavior distinct from future design. Update documentation alongside behavior changes.
* Do not invent setup commands before the corresponding tooling exists.

## Writing conventions

* Use `*` for Markdown bulleted lists, including documentation, commit messages, and pull request descriptions. Do not use hyphens as bullet markers.
* Write clear, concise instructions and record consequential decisions where later tasks can find them.
