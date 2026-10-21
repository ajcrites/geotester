/** Initial state record contract for local dataset validation. */
export interface StateRecord {
  id: string;
  name: string;
  abbreviation: string;
  capital: string;
  /** Relative to the served data/ directory, e.g. assets/outline.svg. */
  shape: string;
  flag: string;
}
export interface Dataset {
  schemaVersion: 1;
  sample: boolean;
  states: StateRecord[];
}
export type DataStatus = {
  status: 'empty' | 'sample' | 'ready';
  count: number;
};
