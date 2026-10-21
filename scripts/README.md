# Utility scripts

This directory is reserved for reusable project utilities. No executable scripts exist yet.

Task 03 will add repeatable state data and asset collection utilities, separate from the application's runtime. Document each script here when it is introduced:

* Purpose, required runtime, and prerequisites.
* Exact invocation, supported arguments, and input and output paths.
* Network sources, licensing and attribution requirements, and any asset transformations.
* Safe rerun behavior, including how existing files are handled.
* Validation steps for generated data and assets.

Write collected records and property metadata to ignored `data/` and images to `data/assets/`. Keep the collection scripts and provenance documentation version controlled so a fresh checkout can regenerate those files. Document the collection command and rerun behavior in Task 03.

Keep runtime quiz data local. Collection scripts may fetch assets during development; the shipped quiz must not depend on those fetches.
