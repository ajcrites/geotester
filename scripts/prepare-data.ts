import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateData } from './validate-data.ts';

export const root = fileURLToPath(new URL('../', import.meta.url));
export function prepareData() {
  const source = resolve(root, 'data');
  const destination = resolve(root, 'public/data');
  const dataset = validateData(source);
  // Remove stale copies, including when source data has been removed.
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  if (existsSync(source)) cpSync(source, destination, { recursive: true });
  writeFileSync(
    resolve(destination, 'status.json'),
    JSON.stringify({
      status: dataset ? (dataset.sample ? 'sample' : 'ready') : 'empty',
      count: dataset?.states.length ?? 0,
    }),
  );
}
