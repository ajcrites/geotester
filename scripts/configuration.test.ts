import assert from 'node:assert/strict';
import test from 'node:test';
import {
  defaultConfiguration,
  validateConfiguration,
} from '../src/domain/configuration';
import { properties, type PropertyDefinition } from '../src/domain/properties';

test('default configuration is valid and each supported length is accepted', () => {
  const configuration = defaultConfiguration();
  assert.equal(configuration.length, 50);
  assert.deepEqual(configuration.modes, {
    name: 'fill-in',
    capital: 'omit',
    shape: 'show',
    flag: 'omit',
  });
  for (let length = 1; length <= 50; length++)
    assert.deepEqual(
      validateConfiguration({ ...configuration, length }, 50),
      [],
    );
  for (const length of [0, 51, 1.5, NaN])
    assert.ok(validateConfiguration({ ...configuration, length }, 50).length);
  assert.ok(validateConfiguration(configuration, 49).length);
});

test('capabilities, missing modes, clues and answers are independently validated', () => {
  const configuration = defaultConfiguration();
  for (const id of ['shape', 'flag'])
    assert.ok(
      validateConfiguration(
        {
          ...configuration,
          modes: { ...configuration.modes, [id]: 'fill-in' },
        },
        50,
      ).some((error) => error.includes('supported mode')),
    );
  assert.ok(validateConfiguration({ ...configuration, modes: {} }, 50).length);
  assert.ok(
    validateConfiguration(
      { ...configuration, modes: { ...configuration.modes, shape: 'omit' } },
      50,
    ).some((error) => error.includes('clue')),
  );
  assert.ok(
    validateConfiguration(
      { ...configuration, modes: { ...configuration.modes, name: 'show' } },
      50,
    ).some((error) => error.includes('to answer')),
  );
  const registry: PropertyDefinition[] = [
    ...properties,
    {
      id: 'extra',
      label: 'Extra',
      field: 'name',
      kind: 'text',
      modes: ['omit', 'show'],
    } as unknown as PropertyDefinition,
  ];
  assert.equal(defaultConfiguration(registry).modes.extra, 'omit');
  assert.deepEqual(
    validateConfiguration(defaultConfiguration(registry), 50, registry),
    [],
  );
});
