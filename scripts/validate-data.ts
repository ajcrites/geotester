import { stateAssetPath, type Dataset } from '../src/domain/data.ts';
import type { SourceLock } from './collection-sources.ts';
import { properties } from '../src/domain/properties.ts';
import { createHash } from 'node:crypto';
import { assertLocalSvg } from './svg.ts';
import Ajv2020 from 'ajv/dist/2020.js';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const schema = (name: string) =>
  JSON.parse(
    readFileSync(
      fileURLToPath(
        new URL(`../src/domain/${name}.schema.json`, import.meta.url),
      ),
      'utf8',
    ),
  );
const ajv = new Ajv2020({ allErrors: true });
ajv.addSchema(schema('property'));
const validateManifest = ajv.compile(schema('dataset'));

// Exactly the initial 50-state scope, independently of source row count.
export const stateCodes =
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(
    ' ',
  );
export function factsDigest(
  states: {
    name: string;
    abbreviation: string;
    fips?: string;
    capital: string;
  }[],
) {
  return createHash('sha256')
    .update(
      JSON.stringify(
        [...states]
          .sort((a, b) => a.name.localeCompare(b.name, 'en'))
          .map((state) => ({
            name: state.name,
            abbreviation: state.abbreviation,
            fips: state.fips,
            capital: state.capital,
          })),
      ),
    )
    .digest('hex');
}

function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Geography data: ${message}`);
}
export function validateData(
  directory: string,
  {
    complete = false,
    sourceLock,
  }: { complete?: boolean; sourceLock?: SourceLock } = {},
): Dataset | null {
  const manifest = resolve(directory, 'dataset.json');
  if (!existsSync(manifest)) {
    requireValue(
      !complete && !existsSync(directory),
      'Missing data/dataset.json. Run npm run data:collect for all 50 states, or npm run data:fixture for the fictional sample.',
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
  requireValue(
    dataset && typeof dataset === 'object' && dataset.schemaVersion === 1,
    'Expected schemaVersion: 1.',
  );
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
    requireValue(
      stateCodes.every((code) => abbreviations.has(code)),
      'Expected the 50 US states, excluding DC and territories.',
    );
    requireValue(
      JSON.stringify(dataset.properties) === JSON.stringify(properties),
      'Property metadata must match the supported registry, including image mode restrictions. Regenerate data.',
    );
    requireValue(
      validateManifest(dataset),
      `Complete manifest does not match dataset.schema.json: ${ajv.errorsText(validateManifest.errors)}.`,
    );
    const lock: SourceLock =
      sourceLock ??
      JSON.parse(
        readFileSync(
          fileURLToPath(new URL('./source-lock.json', import.meta.url)),
          'utf8',
        ),
      );
    requireValue(
      lock.schemaVersion === 1 &&
        lock.flags.length === 50 &&
        new Set(lock.flags.map((flag) => flag.abbreviation)).size === 50 &&
        stateCodes.every((code) =>
          lock.flags.some((flag) => flag.abbreviation === code),
        ),
      'Source lock must cover all 50 states.',
    );
    requireValue(
      factsDigest(dataset.states) === lock.factsSha256,
      'State names, capitals, abbreviations, or FIPS codes differ from reviewed official references. Regenerate data.',
    );
    const provenancePath = resolve(directory, 'provenance.json');
    requireValue(
      existsSync(provenancePath),
      'Missing provenance.json. Run npm run data:collect.',
    );
    const provenance = JSON.parse(readFileSync(provenancePath, 'utf8')) as {
      schemaVersion: number;
      collectedAt: string;
      sourceLock: SourceLock;
      assets: {
        path: string;
        sha256: string;
        source: string;
        transformation: string;
      }[];
    };
    requireValue(
      provenance.schemaVersion === 1 &&
        Number.isFinite(Date.parse(provenance.collectedAt)) &&
        JSON.stringify(provenance.sourceLock) === JSON.stringify(lock),
      'Provenance must match the reviewed source lock and have a retrieval date.',
    );
    requireValue(
      Array.isArray(provenance.assets) &&
        provenance.assets.length === 100 &&
        new Set(provenance.assets.map((asset) => asset.path)).size === 100,
      'Expected provenance for 100 distinct assets.',
    );
    const paths = new Set<string>();
    for (const state of dataset.states) {
      requireValue(
        state.id === `us-${state.abbreviation.toLowerCase()}` &&
          /^\d{2}$/.test(state.fips ?? ''),
        `Invalid stable ID or FIPS code: ${state.id}.`,
      );
      for (const field of ['shape', 'flag'] as const) {
        const path = state[field];
        requireValue(
          !paths.has(path),
          `Asset reused across properties or states: ${path}.`,
        );
        paths.add(path);
        requireValue(
          path === stateAssetPath(state.name, field),
          `Unexpected asset naming: ${path}.`,
        );
        const entry = provenance.assets.find((asset) => asset.path === path);
        const svg = readFileSync(resolve(directory, path), 'utf8');
        requireValue(
          entry &&
            entry.sha256 === createHash('sha256').update(svg).digest('hex') &&
            typeof entry.transformation === 'string' &&
            entry.transformation.length > 0,
          `Missing provenance or changed asset: ${path}.`,
        );
        const expectedSource =
          field === 'shape'
            ? lock.sources.boundaries.url
            : lock.flags.find(
                (flag) => flag.abbreviation === state.abbreviation,
              )?.page;
        requireValue(
          entry.source === expectedSource,
          `Unexpected provenance source: ${path}.`,
        );
        try {
          assertLocalSvg(svg);
        } catch (error) {
          throw new Error(
            `Geography data: invalid ${path}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        if (field === 'shape')
          requireValue(
            !/<text\b/i.test(svg),
            `Outline contains visible text: ${path}.`,
          );
      }
    }
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
