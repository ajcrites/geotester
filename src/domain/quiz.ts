import type { StateRecord } from './data';
import type { QuizConfiguration } from './configuration';

export function supportsShapeQuiz(configuration: QuizConfiguration): boolean {
  return (
    configuration.modes.name === 'fill-in' &&
    configuration.modes.shape === 'show' &&
    Object.entries(configuration.modes).every(
      ([id, mode]) => id === 'name' || id === 'shape' || mode === 'omit',
    )
  );
}

export function sampleStates(
  states: StateRecord[],
  length: number,
  random = Math.random,
): StateRecord[] {
  if (
    !Number.isInteger(length) ||
    length < 1 ||
    length > states.length ||
    new Set(states.map((state) => state.id)).size !== states.length
  )
    throw new Error(
      'Choose a valid length from a dataset with unique state IDs.',
    );
  const shuffled = [...states];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled.slice(0, length);
}

export function normalizeAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface QuizSession {
  questions: StateRecord[];
  answers: { answer: string; correct: boolean }[];
}

export function submitAnswer(
  session: QuizSession,
  index: number,
  answer: string,
): QuizSession {
  // Only the next unanswered question may be scored, once.
  if (index !== session.answers.length || index >= session.questions.length)
    return session;
  return {
    ...session,
    answers: [
      ...session.answers,
      {
        answer,
        correct:
          normalizeAnswer(answer) ===
          normalizeAnswer(session.questions[index].name),
      },
    ],
  };
}

export function quizScore(session: QuizSession) {
  const correct = session.answers.filter((answer) => answer.correct).length;
  const total = session.questions.length;
  return { correct, total, percentage: Math.round((correct / total) * 100) };
}
