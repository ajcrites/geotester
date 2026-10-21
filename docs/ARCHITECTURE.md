# Intended architecture

## Implementation status

This is the design baseline for later tasks, not an account of implemented code. Task 01 creates documentation and the scripts directory only. Requirements and task status live in the [implementation plan](../IMPLEMENTATION_PLAN.md).

## Scope and boundaries

React with Vite is the intended application foundation, with TypeScript as the proposed language default. Task 02 establishes formatting and linting. Use local React state initially; keep domain operations independent of React so they can be checked without rendering the UI.

The first dataset contains the 50 US states. The application needs no backend, accounts, database, or runtime API. Future functionality can revisit that boundary through an explicit task.

## Planned modules

| Location | Responsibility |
| --- | --- |
| `src/domain/` | Types, configuration validation, sampling, question generation, evaluation, scoring |
| `src/data/` | State records and property registry |
| `src/features/setup/` | Homepage configuration and length controls |
| `src/features/quiz/` | Clues, answer controls, progress, submission, feedback |
| `src/features/results/` | Score and, in Task 07, missed-answer review |
| `src/components/` | UI shared across features when needed |
| `public/assets/states/` | Local outline and flag files |
| `scripts/` | Repeatable development utilities, including collection scripts |
| `docs/` | Durable design and data-source documentation |

These paths are conventions to follow when creating code, not files that already exist.

## Data model and property capabilities

Use a stable state ID independently of its display name. Each state record should contain its name, postal abbreviation, capital, and local outline and flag references. Task 03 defines the concrete types and verifies exactly 50 complete, unique records.

Represent a property's stable ID, display label, text or image kind, supported modes, and means of retrieving its value in a property registry. Separate domain data from UI rendering. Use text/image kind to select an answer renderer; avoid state-name-specific branches throughout the UI.

All properties support `omit` and `show`. Other capabilities are explicit per property:

| Property ID | Value kind | Answer modes |
| --- | --- | --- |
| `name` | Text | Fill-in, multiple choice |
| `capital` | Text | Fill-in, multiple choice |
| `shape` | Image | Multiple choice |
| `flag` | Image | Multiple choice |

Render configuration controls from supported modes. Domain validation must also reject unsupported modes so correctness does not depend on UI restrictions. Additional properties may support a different subset, including no answer modes.

## Quiz configuration

Configuration consists of the selected mode for each property and the number of states. The confirmed length default is 50, with clickable shortcuts at 10, 20, 30, 40, and 50.

The following remain implementation assumptions from the plan:

* Allow lengths 1–50 in increments of one.
* Default to fill-in name, show shape, omit capital, and omit flag.
* Require at least one shown property and one answer property.
* Count length in states; a state can have multiple answer fields.

Validate against available dataset size and registered capabilities. Show configuration errors near the start control. Freeze a copy of valid configuration when starting a quiz so later setup changes cannot affect an active score.

## Question generation

Shuffle state IDs and select the configured number without replacement. Each selected state produces one question containing shown clues and answer fields; omitted properties produce neither.

For each multiple-choice field, use the correct property's value and three distinct distractors from the full dataset, then shuffle the choices. Ensure distinct answer values as well as IDs if future properties contain duplicate values. The initial state names, capitals, outlines, and flags must provide enough distinct options. Keep question order and choices stable across renders and answer edits.

Task 05 first implements the default shape-to-name flow. Task 06 extends generation and rendering to all supported combinations.

## Quiz state and submission

Model setup, active quiz, and results as explicit views. An active quiz holds its frozen configuration, generated questions, current index, draft answers, and submitted results.

Submission evaluates all fields for the current state once, records the outcome, and reveals feedback. Subsequent submissions must not award points again. Next advances to a fresh draft or shows results after the final question. Starting again creates fresh questions and clears prior answers. Returning to setup preserves configuration in Task 07. Reload persistence is deferred.

## Answer evaluation and scoring

The plan proposes one point per correct answer property, allowing partial credit within a state. Shown and omitted properties are excluded from the denominator. Total possible points equal the number of states multiplied by the configured answer-property count. Derive aggregate scores from recorded results to avoid duplicate accumulation.

Normalize text by trimming, collapsing repeated whitespace, and ignoring case. Accepted aliases should be explicit and documented with data; fuzzy matching is deferred. Evaluate choice answers by stable option identity. Retain submitted and correct answers for feedback and the eventual missed-answer review.

Scoring and normalization rules are proposed defaults, not separately confirmed user requirements.

## Local assets and provenance

Task 03 collects factual data, outlines, and flags through reusable scripts. Prefer SVG where practical, preserve aspect ratio, and inspect every asset at quiz size. Include relevant islands in outlines. Verify current flags and capitals against authoritative sources at collection time.

Store sources, retrieval dates, redistribution terms, attribution, and transformations in `docs/DATA_SOURCES.md` when collection begins. Asset paths should resolve locally in development and the production build. Do not add runtime network requests for quiz data.

Before submission, visible labels and image alternative text must not reveal the expected answer. Provide neutral, useful descriptions such as the option number and visual characteristics; reveal identifying labels in feedback when appropriate. Local assets and bundled data are inspectable, so this is an educational quiz, not a secure assessment system.

## Validation by task

* Task 01: inspect documentation links, task consistency, and Markdown bullet conventions.
* Task 02: establish and run formatting, lint, and production build checks; inspect the shell at desktop and mobile widths.
* Task 03: verify record completeness and uniqueness, asset resolution and readability, and documented provenance.
* Task 04: check mode restrictions, configuration validation, synchronized length controls, and keyboard interaction.
* Task 05: test sampling without repetition, text normalization, scoring, and repeat-submission protection; complete the first playable quiz manually.
* Task 06: check supported combinations, stable distinct choices, and partial scoring across multiple answer fields.
* Task 07: verify results, keyboard navigation, focus, announcements, contrast, responsive layouts, and the documented application checks.

Add concrete commands only after their tooling exists. Record actual results and limitations in the implementation plan's task handoff notes.
