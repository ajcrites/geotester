import type { PropertyDefinition } from './properties';

/** Readable local filenames; quiz UI should use neutral image descriptions. */
export function stateAssetPath(name: string, kind: 'shape' | 'flag'): string {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return `assets/${kind === 'shape' ? 'shapes' : 'flags'}/${slug}-${kind}.svg`;
}

/** Local geography records. IDs use the stable USPS code, e.g. us-al. */
export interface StateRecord {
  id: string;
  name: string;
  abbreviation: string;
  capital: string;
  /** Relative to the served data/ directory, e.g. assets/outline.svg. */
  shape: string;
  flag: string;
  /** Census state FIPS code. Required for real data, absent in the fixture. */
  fips?: string;
}
export interface Dataset {
  schemaVersion: 1;
  sample: boolean;
  states: StateRecord[];
  /** Required by validation for real data; fixtures retain their small contract. */
  properties?: PropertyDefinition[];
}
export type DataStatus = {
  status: 'empty' | 'sample' | 'ready';
  count: number;
};
