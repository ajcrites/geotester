# Geography Quiz Implementation Plan

## Purpose

Build a React web application for configurable geography quizzes, starting with the 50 US states. This document is the task backlog and handoff guide for Codex. Implement one task at a time, record validation, and update its status before moving on. Creating this plan does not start implementation.

## Agreed requirements

* Use React with Vite; use TypeScript as the proposed implementation default.
* Store collected quiz records and property metadata in untracked `data/` and assets in untracked `data/assets/`. Keep collection scripts, types, schemas, application logic, and provenance documentation version controlled. Serve or copy local data during development and copy it into production build output.
* Keep data local and static. No backend, accounts, database, or external runtime API is needed. (This may change in the future as we introduce more functionality).
* The homepage lets users configure and begin a quiz.
* Initial properties are state name, capital, shape (map outline), and flag.
* Every property supports omit and show (also described as keep). Other modes depend on the property.
* Support adding properties later without assuming every property supports every answer mode.
* Allow selection of quiz length, defaulting to 50 states.
* Use a slider with clickable shortcuts at 10, 20, 30, 40, and 50.
* Users complete quizzes and receive a score.

### Initial property capabilities

| Property   | Omit | Show | Fill-in | Multiple choice    |
| ---------- | ---- | ---- | ------- | ------------------ |
| State name | Yes  | Yes  | Yes     | Yes                |
| Capital    | Yes  | Yes  | Yes     | Yes                |
| Shape      | Yes  | Yes  | No      | Yes, image options |
| Flag       | Yes  | Yes  | No      | Yes, image options |

Omit hides a property entirely. Show displays it as a clue. Fill-in asks for a text answer. Multiple choice asks the user to select an answer from four options.

### Proposed defaults and behavior

These are implementation assumptions, separate from the agreed requirements; adjust if the user requests a different behavior.

* Default configuration: fill-in name, show shape, omit capital and flag.
* Slider range: 1–50, in single-state increments; shortcuts select the exact labeled value.
* A quiz needs at least one shown clue and one property to answer. Explain invalid configurations beside the start control.
* One quiz question represents one state and may contain multiple answer fields.
* Select states randomly without repeats; the selected length counts states, not individual answer fields.
* Award one point per correctly answered property. Display correct answers, total possible points, and percentage; shown or omitted properties earn no points.
* Trim surrounding whitespace, collapse repeated whitespace, and ignore case for text answers. Use explicit accepted aliases if needed; do not introduce fuzzy matching initially.
* Submit all answers for the state together, show feedback, and require an explicit Next action. Prevent repeat scoring after submission.
* Each multiple-choice field has one correct answer and three distinct distractors from the full state dataset, even for short quizzes. Shuffle their positions once per question.
* The MVP does not persist an in-progress quiz across a page reload.

## Task 01 — AI scaffolding

Status: Complete

Goal: Establish clear, durable instructions for future Codex work.

Deliverables:

* Create a root `AGENTS.md` (the conventional Codex instruction filename; use this instead of a separate `AGENT.md`). Read and preserve any existing instructions first.
* Document project scope, intended stack, folder conventions, validation expectations, and the rule that Markdown bulleted lists use asterisks.
* Create or update `README.md` with the project purpose and links to this plan and other documentation. Add runnable commands after the app exists.
* Create `docs/ARCHITECTURE.md` covering the data model, property capabilities, configuration, question generation, scoring, and local assets.
* Create a scripts/ directory for reusable utility scripts.
* Create `.gitignore` for `data/`, generated data copies, dependencies, build output, and local environment files.
* Record decisions and implementation assumptions without presenting proposals as user-approved requirements.

Acceptance criteria:

* A fresh Codex session can identify the next task, relevant conventions, and completion checks from repository documentation.
* Documentation distinguishes implemented behavior from planned behavior.
* Instructions avoid unnecessary dependencies, external services, and unrelated work.

Dependencies: None.

Implementation and agent validation notes (2026-10-21):

* Created root `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, and `scripts/README.md`; the latter establishes the scripts directory without adding utilities ahead of Task 03.
* Documented scope, planned folder conventions, capability-based property handling, configuration, generation, submission, scoring, local assets, and task-specific validation expectations.
* Preserved proposed defaults as assumptions and clearly identified the application as not yet scaffolded. Task 02 is next after human verification; later tasks remain Not started.
* Validation passed: all five Markdown documents exist, local Markdown links resolve, bulleted lists use asterisks, the scripts directory exists, and no application package was introduced. Manually reviewed documentation against Task 01's deliverables and acceptance criteria.
* No application tests or build checks apply yet. The workspace is not currently a Git repository; no commits were created.

Storage-policy revision notes (2026-10-21):

* User reviewed and edited the documents, confirming that collected data and assets must remain outside version control. Aligned the plan and documentation with `data/` and `data/assets/`.
* Added `.gitignore` as Task 01 repository scaffolding. Task 02 owns development delivery and build copying; Task 03 owns reproducible collection into the ignored directories.
* Human verification completed on 2026-10-21: the user explicitly confirmed Task 01 is complete and requested a commit.

Human verification checklist:

* Read and optionally edit [AGENTS.md](AGENTS.md). Confirm the scope, folder conventions, validation expectations, asterisk bullets, and human verification workflow match how you want Codex to work.
* Read and optionally edit [README.md](README.md). Confirm it accurately explains the project, says the app has not been scaffolded, and links to the project documentation.
* Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Confirm the intended design is understandable and proposed defaults remain identified as assumptions.
* Open [scripts/README.md](scripts/README.md). Confirm the scripts directory exists and its instructions support reusable collection utilities in Task 03.
* Review [.gitignore](.gitignore): confirm `data/`, generated data copies, dependencies, and build output are excluded while scripts, schemas, and documentation remain trackable.
* Verified: the user confirmed the revised Task 01 is complete on 2026-10-21.

## Task 02 — React application foundation

Status: Complete

Goal: Create a runnable application and basic development workflow.

Deliverables:

* Scaffold React, Vite, and TypeScript, preserving existing repository files.
* Configure formatting (prettier), linting and document install, development, lint, and production build commands.
* Create a responsive application shell with a homepage and placeholders for quiz and results views.
* Establish lightweight domain and feature folders, with collected data in ignored `data/` and images in `data/assets/`; avoid a state management framework unless a concrete need arises.
* Configure development to serve `data/` directly or copy it to an ignored served location, and configure builds to copy data and assets into output. Do not fetch data automatically on serve or build.
* Before Task 03, support an empty dataset with a clear placeholder so the shell can serve and build. Establish actionable missing-data errors and a validation hook for the complete dataset that Task 03 will supply. Document the chosen mechanism and extend `.gitignore` if it introduces other generated paths.

Acceptance criteria:

* Development server runs and the production build and lint checks pass.
* The shell is usable on desktop and mobile widths.
* README instructions match the actual package scripts.
* Include a reusable, version-controlled fixture under `scripts/fixtures/` containing one clearly labeled sample record and a simple SVG, plus a script that copies it into ignored `data/` without overwriting existing data. Verify that the sample record and image resolve in dev and are copied into build output; generated copies remain ignored. The empty-data shell also serves and builds before Task 03.

Dependencies: Task 01.

Initial implementation and agent validation notes (2026-10-21; superseded where revised below):

* Added React, Vite, TypeScript, ESLint, Prettier, a lockfile, and documented install/dev/format/lint/build/preview commands. Markdown is excluded from Prettier to preserve required asterisk bullets and checked separately.
* Added a responsive Home shell and navigable Quiz/Results placeholders, using local React state and initial domain/feature folders. No quiz configuration, scoring, or real state collection was started.
* Added an offline Vite data hook: validate ignored `data/`, refresh ignored `public/data/`, generate a status manifest, and let Vite include it in `dist/data/`. An absent source supports the empty shell; a partial/invalid source fails. Restart the dev server after changing source data.
* Added one project-authored fictional record and geometric SVG under `scripts/fixtures/`, plus a safe installer that refuses any existing `data/`. Source records and assets resolved in development and production; generated copies are ignored (verified with `git check-ignore`). The sample remains installed for human review.
* Added an initial manifest/type contract and shared validation hook. `npm run data:validate` requires 50 nonsample records; its rejection of the fictional sample was verified. Task 03 must extend this hook for authoritative state membership, property metadata, factual correctness, and provenance, and supply the real collection command.
* Passed: `npm run lint`, `npm run format:check`, production builds with both absent and fixture data, and 12 validation assertions covering empty/partial data, sample loading, full-data rejection, duplicate IDs, missing fields/assets, unsafe paths, and invalid JSON. Verified the fixture installer's overwrite refusal. Dependency installation reported zero audit vulnerabilities.
* Headless Chrome checks passed at 1280px and 390px: empty and sample states, all navigation views, keyboard activation and heading focus, no horizontal overflow or JavaScript errors. The sample SVG and caption loaded in both Vite dev and production preview. Inspected desktop and mobile screenshots.
* Updated README, architecture, and script documentation; verified local links, Markdown bullets, and `git diff --check`. No later task is started. No real dataset or playable quiz exists yet.
* The original workspace path was absent; the repository was found at `/Users/andrew.crites/projects/personal/geotester`. Changes there were applied with explicit filesystem approval.

Revision and validation notes (2026-10-21):

* README describes implemented and unfinished capabilities without numbered task references. AGENTS remains durable instructions; dated implementation notes are kept here. On inspection, the reported dated AGENTS section was already in this plan rather than AGENTS; verified neither README nor AGENTS contains numbered task references or dated implementation history.
* Added `npm run typecheck` (`tsc --noEmit`) for app, scripts, and configuration; `npm run build` now only runs `vite build`. Routine agent validation uses typecheck, with production builds reserved for checking production output.
* Converted all utility scripts to TypeScript, run CLI scripts through `tsx`, and removed the suppressed type error in Vite configuration. Tool configs are now `prettier.config.ts` and `eslint.config.ts`, with `jiti` supporting ESLint configuration loading. Removed `.prettierrc.json`, `.prettierignore`, and the JavaScript ESLint config. Formatting globs plus `.gitignore` preserve Markdown bullets and skip generated data.
* Node.js minimum is now 22.18 to load Prettier's TypeScript configuration without experimental flags. Updated package lock and setup instructions; installation reported zero audit vulnerabilities.
* Removed header navigation and its view switching logic/styles. Setup is the only current screen; quiz/results components remain unconnected placeholders. Future progression uses on-screen controls, without direct access to results from setup.
* Passed revised `npm run typecheck`, `npm run lint`, and `npm run format:check`; production output built successfully with sample data and with absent data in an isolated temporary copy. The migrated TypeScript fixture installer installs in an empty directory and refuses overwrite; all 12 data validation assertions still pass.
* Headless Chrome checks at 1280px and 390px passed: no top navigation or view shortcuts, sample SVG loaded, setup remains disabled, brand link works with keyboard, no horizontal overflow or runtime errors. Inspected the updated mobile screenshot. Markdown bullets, local document links, and whitespace checks passed.

Commit-hook addition and validation (2026-10-21):

* Added Lefthook as a development dependency and `lefthook.yml` with parallel pre-commit checks for Prettier (`format:check`), ESLint (`lint`), and TypeScript (`typecheck`). Checks use the full working tree and do not modify or stage files. No build runs on commit.
* Added `prepare: lefthook install` so normal npm installs wire up Git hooks. Verified installation into `.git/hooks/pre-commit`; there was no existing custom hook or configured hooks path to replace.
* Passed all three checks through `npx lefthook run pre-commit --force` (force runs checks even without staged files). Dependency installation reported zero audit vulnerabilities. Updated README and AGENTS with hook setup and manual invocation; checked documentation links, asterisk bullets, and whitespace.

Human verification checklist:

* Run `npm run dev` and open its local URL. Confirm Home shows “Sample data only”, the fictional record, and its green sample SVG. The setup button should be disabled.
* Confirm the header has no Home/Quiz/Results navigation and no control lets you skip from setup to results. Quiz play remains unavailable.
* At a narrow mobile width, confirm readable text, visible sample artwork, and no sideways scrolling.
* Review [lefthook.yml](lefthook.yml) and run `npx lefthook run pre-commit --force`; expect successful Prettier, ESLint, and typecheck checks.
* Review [README.md](README.md), especially commands and local-data behavior. Confirm the shell and tooling meet Task 02's scope before marking it Complete.

Human verification completed (2026-10-21):

* The user confirmed the revised application foundation and commit hooks are good, and explicitly requested stopping the dev servers and committing Task 02.
* Stopped both development servers started for this task. Later tasks remain Not started.

## Task 03 — Collect and verify US state data and assets

Status: Complete

Goal: Produce a complete, independently reviewable geography dataset. This goal builds the tools to collect this data in addition to the actual collection of data.

Deliverables:

* Create reusable scripts to collect quiz records and property metadata into ignored `data/` and assets into `data/assets/`. Keep scripts, schemas, and provenance documentation version controlled; document setup and rerun commands.
* Collect all 50 state names, stable identifiers, postal abbreviations, and capitals. Exclude DC and territories for this initial scope.
* Collect accurate state outline and flag assets and store them locally, preferably as SVG where practical.
* Verify current flags and factual data against authoritative sources at collection time.
* Document source URLs, retrieval dates, license or public-domain status, required attribution, and any asset transformations in `docs/DATA_SOURCES.md`.
* Ensure outlines have consistent visual bounds, preserve aspect ratio, include relevant islands, and remain recognizable at quiz size. Use individual outlines without location context initially.
* Define version-controlled types and schemas for state records and property metadata. Generate the dataset and property registry metadata in `data/`, containing stable property IDs, labels, supported modes, and text or image rendering information; keep rendering logic in application code.

Acceptance criteria:

* Exactly 50 unique state records exist, with complete capital, outline, and flag data.
* Every referenced asset resolves locally; assets contain no embedded answer labels visible to quiz takers.
* An asset gallery or equivalent inspection verifies all outlines and flags render legibly.
* Basic validation catches missing fields, duplicate IDs, and missing asset references.
* Sources and redistribution terms are recorded for every asset collection.
* A fresh checkout can regenerate the complete dataset using documented scripts. Validate all records and asset references before serving quizzes or building the full quiz application; verify the complete dataset resolves in dev and is copied into the production output.
* Collected data, assets, and generated copies are ignored; collection code and provenance remain trackable.

Dependencies: Task 01; coordinate types and paths with Task 02. Keep this as a distinct data task.

Implementation and agent validation notes (2026-10-21):

* Implemented reusable TypeScript collection, SVG cleanup, gallery generation and shared validation. Collected 50 real states with names, USPS-based stable IDs, FIPS codes, capitals, 50 outlines and 50 flags in ignored `data/`. Property capability metadata is serialized into the manifest from a tracked registry; complete-data JSON schemas are enforced with Ajv.
* Selected Census 2025 1:500,000 cartographic KML for outlines, Census ANSI codes for identities, and the Minnesota Legislative Reference Library's archived official capital table. Corrected the source's `Montomgery` typo and OCR `5t. Paul`, recording the corrections and independent government references. The reference's publication date is 1975–76, not the archive URL's 2013; all 50 resulting capital values were reviewed during collection.
* Selected Commons SVG flag files with per-file revision, creator and reuse metadata. Compared all 50 designs with the GPO federal flag reference and checked later/special designs against official state sources, including Minnesota, Utah, Mississippi, New York, Louisiana, Maine, Massachusetts, Illinois and Oregon. Georgia is disambiguated from the country; Oregon uses its obverse.
* Kept exact source URLs, SHA-256 hashes, retrieval timestamps, licensing details and official-source checks in tracked `scripts/source-lock.json`. `data/provenance.json` records all 100 transformed asset hashes and transformations. Documented sources, terms and per-file flag credits in `docs/DATA_SOURCES.md`: 49 selected flag files are public domain; Mississippi is copyrighted free use. Census acknowledgement is included in the gallery and documented for future quiz credits. Raw downloads stay in ignored `.cache/collection/` and are not served or built.
* Outlines retain every Census polygon and inner ring in a consistent viewBox using equal-area projection and uniform fitting. Alaska unwraps across the antimeridian; Hawaii includes a separately fitted Northwestern Hawaiian Islands inset below the main islands. Small islands can be subpixel at quiz size but remain in the SVG geometry.
* Flag cleanup preserves painter order, original proportions and authentic lettering, while removing added titles/descriptions/metadata/editor attributes. Normalized invalid `opacity="NaN"` attributes in Indiana's upstream file to the default browsers already use. Intrinsic names/initials on official flags remain visible; removing them would make the flags inaccurate. This is an explicit limitation of the no-answer-label requirement for future quiz play. No visible labels are added to outlines; the filename policy was revised below. The named gallery is for review only.
* Collection uses curl with caching, paced Wikimedia requests, batching for Commons metadata, retry/backoff and content hash verification. Ordinary collection reproduces the reviewed source snapshot. An explicit refresh can bypass cache and update the lock after validation, but requires renewed source/licensing/visual review. Serving and building remain offline.
* Collection stages and validates all output before installation. A plain rerun refuses an existing `data/`; `--replace` preserves previous data in an ignored timestamped backup. Preserved the original fictional fixture and the pre-normalization dataset in backups. A normal cached regeneration with the reviewed source lock passed after the SVG fix.
* Passed: `npm run data:validate`, all 18 `npm run test:data` cases with no skips, `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build`. Cases cover absent/sample/partial data, duplicate IDs, missing fields/assets, escaping paths/symlinks, forbidden SVG resources, painter order, source opacity normalization, islands/holes, reviewed facts/membership, unsupported image modes, reused images and modified bytes.
* Headless Chrome checks passed in development and production: all 100 SVGs decode, every served asset matches its local bytes, homepage reports 50 states with setup disabled, gallery credits work with the keyboard, and 1280px/390px layouts have no horizontal overflow or runtime errors. No external image/network dependencies were requested. Inspected all 50 image pairs and the mobile gallery. Raster comparison at 320×240 found 49 cleaned flags pixel-identical to their originals; Louisiana differed by one channel value in four channels out of 307,200, within a two-value/eight-channel antialiasing tolerance.
* Verified generated data, assets, served/build copies, raw cache and backups are ignored; collection code, schema, source lock and provenance documentation remain trackable. Markdown links, asterisk bullets and whitespace checks passed. Quiz configuration/play/scoring are not implemented; later tasks remain Not started. No commit was requested or created.
* Verification limit: the separate attempt to rerun collection from an empty download cache in an isolated checkout was declined at execution approval and was not run. Initial online collection and subsequent cached regeneration passed; do not represent the empty-cache fresh-checkout scenario as tested.

Asset filename revision (2026-10-21):

* The user requested readable `state-name-shape.svg` and `state-name-flag.svg` filenames and explicitly said not to rerun collection. Updated the collector's future output, shared naming helper, JSON schema, runtime validation and source documentation. Existing shape/flag subdirectories are retained; examples are `assets/shapes/new-york-shape.svg` and `assets/flags/new-york-flag.svg`.
* Renamed the 100 existing local SVGs and updated dataset/provenance paths and gallery references without running collection or downloading anything. Confirmed every image's SHA-256 remained unchanged. FIPS metadata and stable record IDs are unchanged. Filenames now identify their states at the user's request; later quiz UI should use neutral descriptions and avoid displaying filenames as clues.
* Passed all 18 data tests, complete-data validation, formatting, lint, type checking and the production build. Independently checked all 100 filenames, manifest/gallery references and byte-identical images in source `data/`, served `public/data/` and production `dist/data/`; each directory contains 50 shapes and 50 flags with no remaining numeric SVG names. No fresh collection check was run or requested again.
* Human check for this revision: open `/data/gallery.html`, confirm all images still load, and inspect the New York image links to confirm their readable `new-york-shape.svg` / `new-york-flag.svg` filenames. The broader checklist below remains available for Task 03 verification.

Version-controlled gallery revision (2026-10-21):

* Moved the gallery's HTML, styles and rendering code into `scripts/templates/gallery.html` and added that file to Git's index. The collector's existing installation hook and `npm run data:gallery` now copy this file unchanged into `data/gallery.html`. The page reads adjacent `dataset.json` and `provenance.json` in the browser; collected records and assets remain ignored instead of being embedded in tracked HTML.
* Preserved the layout, local images, credit controls, Census acknowledgement and Hawaii inset caption. Added loading/missing-data messaging for local JSON requests. Updated README, script instructions, architecture and provenance docs with the source location and offline recopy workflow. No collection or downloads were rerun.
* Passed formatting, lint, type checking and the production build. Confirmed the gallery copies in `data/`, `public/data/` and `dist/data/` are byte-identical to the Git-tracked source and all preview/build copies remain ignored.
* Headless Chrome checks passed against dev and production: 50 cards and 100 decoded images, identical served asset bytes, keyboard-operated credits, homepage status, no external requests or runtime errors, and no overflow at 1280px/390px. Inspected updated desktop/mobile screenshots. A simulated missing dataset produces a visible, actionable message with no partial cards.
* Human check for this revision: review [the tracked gallery source](scripts/templates/gallery.html), refresh `/data/gallery.html`, and confirm the same 50-state gallery and source credits appear. Future edits go in the tracked HTML; run `npm run data:gallery` and restart Vite to refresh the local preview.

Human verification checklist:

* Open `/data/gallery.html` on the URL printed by `npm run dev`. Review all 50 outline/flag pairs at desktop and mobile widths, especially Alaska's islands, Hawaii's inset, and the Minnesota/Utah/Mississippi flags. All 100 images should load without clipping or distortion.
* Review [DATA_SOURCES.md](docs/DATA_SOURCES.md), including source choices, per-file terms/credits, capital corrections, island transforms and the decision to retain authentic lettering within flags.
* Visit the homepage. Confirm it reports 50 state records while quiz setup remains disabled; this task adds data, not quiz play.
* Review [property capabilities](src/domain/properties.ts) and the generated local `data/dataset.json`: name/capital support fill-in and multiple choice; outline/flag support multiple choice but not fill-in. Confirm this matches the intended initial scope before marking Complete.

Human verification completed (2026-10-21):

* The user confirmed satisfaction with Task 03, including the readable asset filenames and version-controlled gallery, and explicitly requested marking the task complete and committing the changes.
* The user previously confirmed that collection did not need to be rerun; verification used the existing assets, checksums, validation, build copies and browser checks. The documented empty-cache collection scenario remains untested.
* Task 03 is complete. Later tasks remain Not started.

## Task 04 — Configurable homepage

Status: Complete

Goal: Let users configure a valid quiz using the property registry.

Deliverables:

* Render a settings row for each registered property with only its supported modes.
* Implement the length slider, default of 50, current-value display, and clickable shortcuts for every 10 states.
* Validate configuration and provide clear feedback when it cannot start a quiz.
* Add accessible labels, keyboard support, visible focus states, and mobile-friendly controls.

Acceptance criteria:

* Shape and flag never offer fill-in.
* Adding a property definition drives its settings row without duplicating the page's control logic.
* Slider and shortcut selection remain synchronized and stay within 1–50.
* Valid configurations can begin a quiz; invalid configurations explain what needs changing.

Dependencies: Tasks 02 and 03.


Implementation and agent validation notes (2026-10-21):

* Added registry-driven native mode selectors, a 1–50 slider and synchronized 10/20/30/40/50 shortcuts. Outline and flag exclude fill-in. Added pure configuration defaults/validation and `npm run test:domain`.
* Kept the proposed defaults: fill-in name, show outline, omit capital/flag; require a clue and an answer property. Invalid configurations explain the required changes beside the disabled Begin quiz control. Empty/sample/error/loading data cannot start.
* Valid settings open a handoff preview with an independent copy of the configuration; Edit settings preserves choices. This is the Task 04 start boundary: question generation, play, scoring and results remain Task 05/06 work. Initial heading focus behavior was removed after human review (see below).
* Passed `npm run test:domain` (2 tests covering all lengths, invalid bounds, dataset size, capabilities, missing modes, clue/answer requirements and an extended registry). The initial sandbox run could not create tsx's IPC socket; the approved rerun passed.
* Passed formatting, lint and typecheck, including `npx lefthook run pre-commit --force`. Browser checks verified supported modes, a 10-state shortcut, native slider Right key changing 10 to 11 and clearing shortcut selection, invalid clue feedback and disabled start, a valid 11-state handoff with heading focus, and preserved settings on return. Inspected layouts at 390px and 1280px; desktop DOM check found no horizontal overflow. No production build was needed for these setup-only changes.
* Updated README and architecture to distinguish implemented setup from future quiz play. Task 05 remains Not started.

Human verification checklist:

* Run `npm run dev`. Confirm defaults are fill-in name, shown outline, omitted capital/flag, and 50 states. Outline and flag must never offer fill-in.
* Select length shortcuts and use the slider with arrow keys. Confirm displayed length and selected shortcut stay synchronized from 1 to 50.
* Omit the outline to remove all clues; confirm an explanation appears and Begin quiz is disabled. Restore a clue, then remove all answer properties and confirm the corresponding explanation.
* Restore a valid configuration and select Begin quiz. Confirm the preview matches your settings; Edit settings should preserve them. Question play is intentionally deferred.
* At desktop and narrow mobile widths, confirm readable controls, visible keyboard focus, and no sideways scrolling.

Human verification completed (2026-10-21):

* The user confirmed the configuration functions correctly and removed heading `tabIndex` attributes because they caused issues. Preserved that change and removed the now-ineffective heading refs and focus effects.
* Formatting, lint, typecheck, and whitespace checks passed after cleanup. Task 05 remains Not started.

## Task 05 — First playable quiz: name from shape

Status: Not started

Goal: Complete a small end-to-end path before implementing all mode combinations.

Deliverables:

* Implement state sampling without replacement and respect the selected quiz length.
* Support the default configuration: show shape and fill in name.
* Add progress, answer submission, correctness feedback, explicit advancement, and a final score.
* Allow starting a new quiz or returning to setup.
* Test meaningful domain behavior: sampling, text normalization, and score calculation.

Acceptance criteria:

* A 10-state quiz contains exactly 10 distinct states; a 50-state quiz covers every state once.
* Case and whitespace variations are accepted as described above.
* Repeated submissions do not change the score.
* The user can complete a quiz and start another without stale answers or results.

Dependencies: Task 04.

## Task 06 — All supported property combinations

Status: Not started

Goal: Fulfill the complete initial capability matrix.

Deliverables:

* Support shown text and image clues, capital fill-in, and text or image multiple-choice answers.
* Support multiple clues and multiple answer properties in the same state question.
* Generate four distinct options per multiple-choice field and keep options stable while the user answers.
* Score per answered property and show field-level feedback after submission.
* Keep answer-bearing labels, image alternatives, and visible filenames from disclosing correct answers before submission; provide useful neutral image descriptions.

Acceptance criteria:

* Every supported property/mode pairing works and unsupported combinations are rejected by domain validation as well as omitted from the UI.
* Mixed configurations work, including show flag with multiple-choice capital, and show name with image choices for shape and flag.
* Each choice set contains the correct answer exactly once, including in a one-state quiz.
* Total possible points equal quiz length multiplied by the number of answer properties.
* A new property's capability definition can restrict its available modes without changing global mode assumptions.

Dependencies: Task 05.

## Task 07 — Results, accessibility, and release checks

Status: Not started

Goal: Make the full quiz comfortable to use and ready for review.

Deliverables:

* Show final points, percentage, and a review of missed answers with the correct answers.
* Preserve configuration when returning to setup or starting another shuffled quiz.
* Verify keyboard navigation, focus movement, feedback announcements, contrast, image sizing, and mobile layout.
* Run lint, build, relevant automated checks, and manual end-to-end checks for representative configurations.
* Update README and architecture documentation to reflect the finished implementation and any known limitations.

Acceptance criteria:

* Results accurately reflect multiple answer properties, including partial credit within a state.
* A complete quiz works with keyboard controls.
* Text and image choices remain usable at mobile widths.
* Validation results and material limitations are documented in the implementation handoff.

Dependencies: Task 06.

## Deferred enhancements

* Retry only missed states or properties.
* Additional geography properties and regions.
* Saved preferences and quiz history.
* Timed quizzes and difficulty options.
* Alternative map contexts, such as highlighting a state within a US map.

## Codex task handoff

For each task:

* Read applicable `AGENTS.md` instructions and this plan before editing.
* Confirm prerequisite tasks are complete and inspect existing work.
* Set the task status to In progress, implement its scoped deliverables, and run relevant checks.
* After implementation and agent checks pass, set the status to Awaiting human verification.
* Record a short human verification checklist below the task and output it in the final response. Give concrete document review items or UI steps, with relevant links and expected outcomes.
* Wait for explicit user verification before marking Complete. Record the confirmation and date; do not infer verification from silence.
* If the user requests changes, return the task to In progress, address and validate the changes, then provide an updated checklist.
* Do not start dependent tasks while verification is pending unless the user explicitly directs otherwise.
* Record changed behavior, validation results, unresolved issues, and any decisions affecting later tasks below the task.
* Keep task boundaries reviewable. Do not introduce deferred features without a request.
