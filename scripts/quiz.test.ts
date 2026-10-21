import assert from 'node:assert/strict';
import test from 'node:test';
import {
  sampleStates,
  normalizeAnswer,
  submitAnswer,
  quizScore,
  supportsShapeQuiz,
} from '../src/domain/quiz';
import { defaultConfiguration } from '../src/domain/configuration';
import type { StateRecord } from '../src/domain/data';

const states: StateRecord[] = Array.from({ length: 50 }, (_, index) => ({
  id: `state-${index}`,
  name: `State ${index}`,
  abbreviation: '',
  capital: '',
  shape: '',
  flag: '',
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
  const session = {
    questions: [{ ...states[0], name: 'New York' }],
    answers: [],
  };
  assert.equal(
    submitAnswer(session, 0, ' NEW   york ').answers[0].correct,
    true,
  );
  assert.equal(submitAnswer(session, 0, 'NewYork').answers[0].correct, false);
  assert.equal(submitAnswer(session, 0, '').answers[0].correct, false);
});
test('submission scores once, rejects out-of-order answers, and fresh sessions have no stale score', () => {
  const initial = { questions: states.slice(0, 3), answers: [] };
  assert.equal(submitAnswer(initial, 1, 'State 1'), initial);
  const first = submitAnswer(initial, 0, 'State 0');
  assert.equal(submitAnswer(first, 0, 'wrong'), first);
  const final = submitAnswer(submitAnswer(first, 1, 'wrong'), 2, 'State 2');
  assert.deepEqual(quizScore(final), { correct: 2, total: 3, percentage: 67 });
  assert.equal(submitAnswer(final, 3, 'extra'), final);
  assert.deepEqual(quizScore(initial), { correct: 0, total: 3, percentage: 0 });
});
test('only the implemented configuration enters playable mode', () => {
  const config = defaultConfiguration();
  assert.equal(supportsShapeQuiz(config), true);
  for (const [id, mode] of [
    ['flag', 'show'],
    ['name', 'multiple-choice'],
    ['shape', 'omit'],
  ] as const)
    assert.equal(
      supportsShapeQuiz({ ...config, modes: { ...config.modes, [id]: mode } }),
      false,
    );
});
