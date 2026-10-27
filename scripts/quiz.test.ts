import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sampleStates,
  normalizeAnswer,
  submitAnswer,
  quizScore,
  createSession,
} from '../src/domain/quiz';
import { defaultConfiguration } from '../src/domain/configuration';
import { validateConfiguration } from '../src/domain/configuration';
import { properties } from '../src/domain/properties';
import type { DraftAnswers } from '../src/domain/quiz';
import type { StateRecord } from '../src/domain/data';

const states: StateRecord[] = Array.from({ length: 50 }, (_, index) => ({
  id: `state-${index}`,
  name: `State ${index}`,
  abbreviation: '',
  capital: `Capital ${index}`,
  shape: `shape-${index}.svg`,
  flag: `flag-${index}.svg`,
}));
test('sampling respects length, includes every state at 50, and preserves source order', () => {
  const original = [...states];
  for (const length of [1, 10, 50]) {
    const selected = sampleStates(states, length, () => 0.25);
    assert.equal(selected.length, length);
    assert.equal(new Set(selected.map((state) => state.id)).size, length);
    if (length === 50) assert.deepEqual(new Set(selected), new Set(states));
  }
  assert.deepEqual(states, original);
  for (const length of [0, 51, 1.5])
    assert.throws(() => sampleStates(states, length));
  assert.throws(() => sampleStates([states[0], states[0]], 1));
});
test('normalization accepts case and whitespace without fuzzy matching', () => {
  assert.equal(normalizeAnswer('  nEw \n YoRk  '), 'new york');
  const session = createSession([{ ...states[0], name: 'New York' }], {
    ...defaultConfiguration(),
    length: 1,
  });
  assert.equal(
    submitAnswer(session, 0, { name: ' NEW   york ' }).answers[0].fields[0]
      .correct,
    true,
  );
  assert.equal(
    submitAnswer(session, 0, { name: 'NewYork' }).answers[0].fields[0].correct,
    false,
  );
  assert.equal(
    submitAnswer(session, 0, {}).answers[0].fields[0].correct,
    false,
  );
});
test('submission scores once and rejects out-of-order answers', () => {
  const initial = createSession(states, {
    ...defaultConfiguration(),
    length: 3,
  });
  assert.equal(submitAnswer(initial, 1, {}), initial);
  const first = submitAnswer(initial, 0, {
    name: initial.questions[0].fields.find(
      (field) => field.property.id === 'name',
    )!.value,
  });
  assert.equal(submitAnswer(first, 0, {}), first);
  const final = submitAnswer(submitAnswer(first, 1, {}), 2, {});
  assert.deepEqual(quizScore(final), { correct: 1, total: 3, percentage: 33 });
  assert.equal(submitAnswer(final, 3, {}), final);
  assert.deepEqual(quizScore(initial), { correct: 0, total: 3, percentage: 0 });
});
test('all valid combinations generate distinct stable choices and support partial credit', () => {
  const modes = ['omit', 'show', 'fill-in', 'multiple-choice'] as const;
  let count = 0;
  for (const name of modes)
    for (const capital of modes)
      for (const shape of modes)
        for (const flag of modes) {
          const config = { length: 1, modes: { name, capital, shape, flag } };
          if (validateConfiguration(config, states.length).length) {
            assert.throws(() => createSession(states, config));
            continue;
          }
          count++;
          const session = createSession(states, config);
          const before = JSON.stringify(session.questions);
          const fields = session.questions[0].fields.filter(
            (field) => field.mode !== 'show',
          );
          const draft: DraftAnswers = {};
          for (const field of fields) {
            if (field.mode === 'multiple-choice') {
              assert.equal(
                new Set(field.options.map((option) => option.value)).size,
                4,
              );
              assert.equal(
                field.options.filter((option) => option.value === field.value)
                  .length,
                1,
              );
            }
          }
          const first = fields[0];
          draft[first.property.id] =
            first.mode === 'fill-in' ? first.value : first.correctOption;
          const submitted = submitAnswer(session, 0, draft);
          assert.equal(quizScore(submitted).correct, 1);
          assert.equal(quizScore(submitted).total, fields.length);
          assert.equal(JSON.stringify(submitted.questions), before);
        }
  assert.ok(count > 50);
});
test('choice generation rejects insufficient distinct values and respects restricted capabilities', () => {
  const config = {
    length: 1,
    modes: {
      name: 'show',
      capital: 'multiple-choice',
      shape: 'omit',
      flag: 'omit',
    },
  } as const;
  assert.throws(
    () =>
      createSession(
        states.map((state) => ({ ...state, capital: 'Same' })),
        config,
      ),
    /distinct/,
  );
  assert.throws(
    () =>
      createSession(
        states,
        config,
        Math.random,
        properties.map((property) =>
          property.id === 'capital'
            ? { ...property, modes: ['omit', 'show'] }
            : property,
        ),
      ),
    /supported/,
  );
});
