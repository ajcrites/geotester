# Geotester

A planned geography quiz web application, starting with the 50 US states. Users will choose which properties to see as clues and which to answer, complete a quiz, and receive a score.

## Current state

Task 01 provides repository instructions, architecture documentation, a directory for reusable utility scripts, and `.gitignore` for local data and generated files. The application has not been scaffolded. There are no installed dependencies, package scripts, state data, or quiz assets yet.

Task 01 is complete and human-verified. Task 02 — React application foundation — is next. It will establish React, Vite, TypeScript, Prettier, linting, and verified installation, development, and build instructions. No application commands are available yet.

## Planned experience

* Configure state name, capital, shape, and flag as omitted properties, shown clues, or questions, according to each property's supported modes.
* Answer text properties through fill-in or multiple choice; answer visual properties through image choices.
* Select quiz length with a slider defaulting to 50, with clickable shortcuts at 10, 20, 30, 40, and 50.
* Use local state data and assets without a backend or runtime data service.
* Recreate untracked `data/` and `data/assets/` through tracked collection scripts. Development will serve or copy these files, and builds will copy them into output; this tooling is planned for Tasks 02–03.

## Project documentation

* [Implementation plan](IMPLEMENTATION_PLAN.md): requirements, proposed defaults, task dependencies, and acceptance criteria.
* [Codex repository instructions](AGENTS.md): scope, conventions, validation, and handoff expectations.
* [Architecture](docs/ARCHITECTURE.md): intended domain model, property capabilities, quiz flow, and asset handling.
* [Utility scripts](scripts/README.md): script conventions and planned data collection utilities.

Read the implementation plan before starting a task. Its proposed defaults remain assumptions unless separately confirmed; documentation describes planned behavior until implementation and validation are recorded.
