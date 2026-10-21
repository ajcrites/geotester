# Geography Quiz Implementation Plan

## Purpose

Build a React web application for configurable geography quizzes, starting with the 50 US states. This document is the task backlog and handoff guide for Codex. Implement one task at a time, record validation, and update its status before moving on. Creating this plan does not start implementation.

## Agreed requirements

* Use React with Vite; use TypeScript as the proposed implementation default.
* Keep data hardcoded and assets local. No backend, accounts, database, or external runtime API is needed. (This may change in the future as we introduce more functionality).
* The homepage lets users configure and begin a quiz.
* Initial properties are state name, capital, shape (map outline), and flag.
* Every property supports omit and show (also described as keep). Other modes depend on the property.
* Support adding properties later without assuming every property supports every answer mode.
* Allow selection of quiz length, defaulting to 50 states.
* Use a slider with clickable shortcuts at 10, 20, 30, 40, and 50.
* Users complete quizzes and receive a score.

### Initial property capabilities

| Property | Omit | Show | Fill-in | Multiple choice |
| --- | --- | --- | --- | --- |
| State name | Yes | Yes | Yes | Yes |
| Capital | Yes | Yes | Yes | Yes |
| Shape | Yes | Yes | No | Yes, image options |
| Flag | Yes | Yes | No | Yes, image options |

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
* Record decisions and implementation assumptions without presenting proposals as user-approved requirements.

Acceptance criteria:

* A fresh Codex session can identify the next task, relevant conventions, and completion checks from repository documentation.
* Documentation distinguishes implemented behavior from planned behavior.
* Instructions avoid unnecessary dependencies, external services, and unrelated work.

Dependencies: None.

Completion notes (2026-10-21):

* Created root `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, and `scripts/README.md`; the latter establishes the scripts directory without adding utilities ahead of Task 03.
* Documented scope, planned folder conventions, capability-based property handling, configuration, generation, submission, scoring, local assets, and task-specific validation expectations.
* Preserved proposed defaults as assumptions and clearly identified the application as not yet scaffolded. Task 02 is next; later tasks remain Not started.
* Validation passed: all five Markdown documents exist, local Markdown links resolve, bulleted lists use asterisks, the scripts directory exists, and no application package was introduced. Manually reviewed documentation against Task 01's deliverables and acceptance criteria.
* No application tests or build checks apply yet. The workspace is not currently a Git repository; no commits were created.

## Task 02 — React application foundation

Status: Not started

Goal: Create a runnable application and basic development workflow.

Deliverables:

* Scaffold React, Vite, and TypeScript, preserving existing repository files.
* Configure formatting (prettier), linting and document install, development, lint, and production build commands.
* Create a responsive application shell with a homepage and placeholders for quiz and results views.
* Establish lightweight domain, data, feature, and asset folders; avoid a state management framework unless a concrete need arises.

Acceptance criteria:

* Development server runs and the production build and lint checks pass.
* The shell is usable on desktop and mobile widths.
* README instructions match the actual package scripts.

Dependencies: Task 01.

## Task 03 — Collect and verify US state data and assets

Status: Not started

Goal: Produce a complete, independently reviewable geography dataset. This goal builds the tools to collect this data in addition to the actual collection of data.

Deliverables:

*  Create a reusable script or scripts to fetch the asset data that will be used for quizzes.
*  Collect all 50 state names, stable identifiers, postal abbreviations, and capitals. Exclude DC and territories for this initial scope.
* Collect accurate state outline and flag assets and store them locally, preferably as SVG where practical.
* Verify current flags and factual data against authoritative sources at collection time.
* Document source URLs, retrieval dates, license or public-domain status, required attribution, and any asset transformations in `docs/DATA_SOURCES.md`.
* Ensure outlines have consistent visual bounds, preserve aspect ratio, include relevant islands, and remain recognizable at quiz size. Use individual outlines without location context initially.
* Define typed state records and a property registry containing stable property IDs, labels, supported modes, and text or image rendering information.

Acceptance criteria:

* Exactly 50 unique state records exist, with complete capital, outline, and flag data.
* Every referenced asset resolves locally; assets contain no embedded answer labels visible to quiz takers.
* An asset gallery or equivalent inspection verifies all outlines and flags render legibly.
* Basic validation catches missing fields, duplicate IDs, and missing asset references.
* Sources and redistribution terms are recorded for every asset collection.

Dependencies: Task 01; coordinate types and paths with Task 02. Keep this as a distinct data task.

## Task 04 — Configurable homepage

Status: Not started

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
* Set the status to Complete only after its acceptance criteria pass.
* Record changed behavior, validation results, unresolved issues, and any decisions affecting later tasks below the task.
* Keep task boundaries reviewable. Do not introduce deferred features without a request.
