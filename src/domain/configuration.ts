import {
  properties,
  type PropertyDefinition,
  type PropertyMode,
} from './properties';

export interface QuizConfiguration {
  length: number;
  modes: Record<string, PropertyMode>;
}

export function defaultConfiguration(registry = properties): QuizConfiguration {
  return {
    length: 50,
    modes: Object.fromEntries(
      registry.map(({ id }) => [
        id,
        id === 'name' ? 'fill-in' : id === 'shape' ? 'show' : 'omit',
      ]),
    ),
  };
}

export function validateConfiguration(
  configuration: QuizConfiguration,
  availableStates: number,
  registry: PropertyDefinition[] = properties,
): string[] {
  const errors: string[] = [];
  if (
    !Number.isInteger(configuration.length) ||
    configuration.length < 1 ||
    configuration.length > Math.min(50, availableStates)
  ) {
    errors.push(
      `Choose a whole number of states from 1 to ${Math.min(50, availableStates)}.`,
    );
  }
  for (const property of registry) {
    if (!property.modes.includes(configuration.modes[property.id]))
      errors.push(`Choose a supported mode for ${property.label}.`);
  }
  if (!registry.some(({ id }) => configuration.modes[id] === 'show'))
    errors.push('Show at least one property as a clue.');
  if (
    !registry.some(({ id }) =>
      ['fill-in', 'multiple-choice'].includes(configuration.modes[id]),
    )
  )
    errors.push(
      'Choose fill-in or multiple choice for at least one property to answer.',
    );
  return errors;
}
