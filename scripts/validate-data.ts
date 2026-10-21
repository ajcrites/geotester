import type { Dataset } from '../src/domain/data.ts';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Geography data: ${message}`);
}
export function validateData(
  directory: string,
  { complete = false } = {},
): Dataset | null {
  const manifest = resolve(directory, 'dataset.json');
  if (!existsSync(manifest)) {
    requireValue(
      !complete && !existsSync(directory),
      'Missing data/dataset.json. Run npm run data:fixture for the sample. Full dataset collection is not available yet.',
    );
    return null;
  }
  let dataset: Dataset;
  try {
    dataset = JSON.parse(readFileSync(manifest, 'utf8')) as Dataset;
  } catch {
    throw new Error(
      'Geography data: data/dataset.json must be valid JSON. Regenerate or repair it.',
    );
  }
  requireValue(dataset?.schemaVersion === 1, 'Expected schemaVersion: 1.');
  requireValue(
    typeof dataset.sample === 'boolean',
    'Expected explicit sample boolean.',
  );
  requireValue(
    Array.isArray(dataset.states) && dataset.states.length > 0,
    'Expected nonempty states array.',
  );
  const ids = new Set();
  const abbreviations = new Set();
  for (const state of dataset.states) {
    for (const field of [
      'id',
      'name',
      'abbreviation',
      'capital',
      'shape',
      'flag',
    ] as const) {
      requireValue(
        typeof state?.[field] === 'string' && state[field].trim(),
        `Record is missing ${field}.`,
      );
    }
    requireValue(!ids.has(state.id), `Duplicate state ID: ${state.id}.`);
    requireValue(
      /^[A-Z]{2}$/.test(state.abbreviation) &&
        !abbreviations.has(state.abbreviation),
      `Invalid or duplicate abbreviation: ${state.abbreviation}.`,
    );
    ids.add(state.id);
    abbreviations.add(state.abbreviation);
    for (const field of ['shape', 'flag'] as const) {
      const asset = state[field];
      requireValue(
        asset.startsWith('assets/') &&
          !asset.includes('\\') &&
          !asset.includes('?') &&
          !asset.includes('#'),
        `${field} must be a local assets/ path.`,
      );
      const path = resolve(directory, asset);
      requireValue(
        path.startsWith(resolve(directory) + sep) && existsSync(path),
        `Missing or unsafe asset: ${asset}. Regenerate local data.`,
      );
      const actual = relative(realpathSync(directory), realpathSync(path));
      requireValue(
        !actual.startsWith('..') &&
          !isAbsolute(actual) &&
          statSync(path).isFile(),
        `Unsafe asset: ${asset}.`,
      );
    }
  }
  if (complete || !dataset.sample) {
    requireValue(
      !dataset.sample && dataset.states.length === 50,
      'Complete data must have sample: false and exactly 50 states (exclude DC and territories).',
    );
  }
  return dataset;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const dataset = validateData(
      fileURLToPath(new URL('../data', import.meta.url)),
      { complete: process.argv.includes('--complete') },
    );
    console.log(`Validated ${dataset?.states.length ?? 0} records.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
