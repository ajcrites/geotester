# Intended architecture

## Implementation status

Task 02 implements React, Vite, TypeScript, formatting, linting, local data delivery, and a responsive shell with a homepage and no top-level view navigation. Setup, quiz play, and results remain placeholders; the design below describes later tasks. Task 01 supplies documentation and the repository ignore policy. Requirements and task status live in the [implementation plan](../IMPLEMENTATION_PLAN.md).

## Scope and boundaries

React with Vite and TypeScript form the implemented application foundation. Prettier and ESLint provide formatting and linting. Use local React state initially; keep domain operations independent of React so they can be checked without rendering the UI.

The first dataset contains the 50 US states. The application needs no backend, accounts, database, or runtime API. Future functionality can revisit that boundary through an explicit task.

## Planned modules

| Location                | Responsibility                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `src/domain/`           | Types, configuration validation, sampling, question generation, evaluation, scoring |
| `data/`                 | Collected state records and property metadata; excluded from version control        |
| `data/assets/`          | Local outlines and flags; excluded from version control                             |
| `src/features/setup/`   | Homepage configuration and length controls                                          |
| `src/features/quiz/`    | Clues, answer controls, progress, submission, feedback                              |
| `src/features/results/` | Score and, in Task 07, missed-answer review                                         |
| `src/components/`       | UI shared across features when needed                                               |
| `scripts/`              | Repeatable development utilities, including collection scripts                      |
| `docs/`                 | Durable design and data-source documentation                                        |

The domain and three feature folders now exist. Introduce shared components when reuse exists; collection and quiz domain behavior remain future work.

## Data model and property capabilities

Use a stable state ID independently of its display name. Each state record should contain its name, postal abbreviation, capital, and local outline and flag references. Task 03 defines the concrete types and verifies exactly 50 complete, unique records.

Represent a property's stable ID, display label, text or image kind, supported modes, and means of retrieving its value in a property registry. Separate domain data from UI rendering. Use text/image kind to select an answer renderer; avoid state-name-specific branches throughout the UI.

All properties support `omit` and `show`. Other capabilities are explicit per property:

| Property ID | Value kind | Answer modes             |
| ----------- | ---------- | ------------------------ |
| `name`      | Text       | Fill-in, multiple choice |
| `capital`   | Text       | Fill-in, multiple choice |
| `shape`     | Image      | Multiple choice          |
| `flag`      | Image      | Multiple choice          |

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

The confirmed storage policy is to exclude `data/`, including `data/assets/`, from version control. Commit collection scripts, schemas, types, application logic, and provenance documentation so a fresh checkout can reconstruct the dataset. Property metadata stored with the dataset follows the same collection workflow; rendering and capability validation code remain tracked.

Task 02 establishes local delivery: the development server either serves `data/` directly or uses an ignored copy, and the production build copies the records and assets into its output. Keep source data and served URLs distinct and ensure asset references resolve in both modes. The implemented Vite startup/build plugin validates and copies source data into ignored `public/data/`, clears stale copies, and generates `status.json`. Vite serves this directory and includes it in `dist/data/`. Restart Vite after changing data. All operations are local and offline. See the README for commands and the fixture manifest contract. Generated copies such as `public/data/` and build output are ignored too.

Before Task 03 supplies data, the Task 02 shell must serve and build successfully with a clear data-not-yet-collected state. Once quizzes require the dataset, missing or incomplete data must produce an actionable message pointing to the collection command. Builds intended to contain quizzes must validate and copy a complete dataset, without silently shipping empty or stale data. Collection remains an explicit setup step rather than an automatic network fetch during serve or build.

Task 03 collects factual data, outlines, and flags through reusable scripts. Prefer SVG where practical, preserve aspect ratio, and inspect every asset at quiz size. Include relevant islands in outlines. Verify current flags and capitals against authoritative sources at collection time.

Store sources, retrieval dates, redistribution terms, attribution, and transformations in `docs/DATA_SOURCES.md` when collection begins. Asset paths should resolve locally in development and the production build. Do not add runtime network requests for quiz data.

Before submission, visible labels and image alternative text must not reveal the expected answer. Provide neutral, useful descriptions such as the option number and visual characteristics; reveal identifying labels in feedback when appropriate. Local assets and bundled data are inspectable, so this is an educational quiz, not a secure assessment system.

## Validation by task

* Task 01: inspect documentation links, task consistency, and Markdown bullet conventions.
* Task 02: establish and run formatting, lint, type checking, and production output checks; inspect the shell at desktop and mobile widths.
* Task 03: verify record completeness and uniqueness, asset resolution and readability, and documented provenance.
* Task 04: check mode restrictions, configuration validation, synchronized length controls, and keyboard interaction.
* Task 05: test sampling without repetition, text normalization, scoring, and repeat-submission protection; complete the first playable quiz manually.
* Task 06: check supported combinations, stable distinct choices, and partial scoring across multiple answer fields.
* Task 07: verify results, keyboard navigation, focus, announcements, contrast, responsive layouts, and the documented application checks.

Add concrete commands only after their tooling exists. Record actual results and limitations in the implementation plan's task handoff notes.

## Foundation data contract

`src/domain/data.ts` defines the initial state record and manifest types. A manifest has `schemaVersion: 1`, `sample`, and `states`. Shape and flag use local `assets/` references relative to the data directory. The fictional fixture establishes delivery without collecting real geography data. The CLI and Vite plugin share `scripts/validate-data.ts`; full validation requires 50 nonsample records and existing local assets. Task 03 extends this hook for state membership, property registry metadata, factual validation, and provenance before the quiz consumes data.

Only absent `data/` means empty mode. Present but malformed or incomplete nonsample data fails serve/build rather than quietly falling back to the placeholder. Data changes require a server restart; production builds always refresh copies. No quiz configuration or scoring behavior is implemented yet.

Users advance through setup, quiz, and results using controls appropriate to the active step. No top-level navigation exposes future steps. The foundation renders only setup; quiz/results components remain unconnected placeholders.
