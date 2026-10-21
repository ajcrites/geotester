export type PropertyId = 'name' | 'capital' | 'shape' | 'flag';
export type PropertyMode = 'omit' | 'show' | 'fill-in' | 'multiple-choice';
export interface PropertyDefinition {
  id: PropertyId;
  label: string;
  kind: 'text' | 'image';
  modes: PropertyMode[];
  field: PropertyId;
}

/** Rendering stays in application code; the collector serializes this metadata. */
export const properties: PropertyDefinition[] = [
  {
    id: 'name',
    label: 'State name',
    kind: 'text',
    modes: ['omit', 'show', 'fill-in', 'multiple-choice'],
    field: 'name',
  },
  {
    id: 'capital',
    label: 'Capital',
    kind: 'text',
    modes: ['omit', 'show', 'fill-in', 'multiple-choice'],
    field: 'capital',
  },
  {
    id: 'shape',
    label: 'Outline',
    kind: 'image',
    modes: ['omit', 'show', 'multiple-choice'],
    field: 'shape',
  },
  {
    id: 'flag',
    label: 'Flag',
    kind: 'image',
    modes: ['omit', 'show', 'multiple-choice'],
    field: 'flag',
  },
];
