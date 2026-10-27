import type { StateRecord } from './data';
import { validateConfiguration, type QuizConfiguration } from './configuration';
import {
  properties,
  type PropertyDefinition,
  type PropertyId,
} from './properties';

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

export interface QuestionField {
  property: PropertyDefinition;
  mode: 'show' | 'fill-in' | 'multiple-choice';
  value: string;
  options: { id: string; value: string }[];
  correctOption?: string;
}
export interface QuizQuestion {
  stateId: string;
  fields: QuestionField[];
}
export type DraftAnswers = Partial<Record<PropertyId, string>>;
export interface QuizSession {
  questions: QuizQuestion[];
  answers: {
    fields: { propertyId: PropertyId; answer: string; correct: boolean }[];
  }[];
}

export function createSession(
  states: StateRecord[],
  configuration: QuizConfiguration,
  random = Math.random,
  registry = properties,
): QuizSession {
  const errors = validateConfiguration(configuration, states.length, registry);
  if (errors.length) throw new Error(errors.join(' '));
  return {
    questions: sampleStates(states, configuration.length, random).map(
      (state) => ({
        stateId: state.id,
        fields: registry.flatMap((property): QuestionField[] => {
          const mode = configuration.modes[property.id];
          if (mode === 'omit') return [];
          const value = state[property.field];
          const field: QuestionField = {
            property: { ...property, modes: [...property.modes] },
            mode,
            value,
            options: [],
          };
          if (mode === 'multiple-choice') {
            const distinct = [
              ...new Map(
                states
                  .filter((candidate) => candidate[property.field] !== value)
                  .map((candidate) => [candidate[property.field], candidate]),
              ).values(),
            ];
            if (distinct.length < 3)
              throw new Error(
                `Four distinct values are required for ${property.label}.`,
              );
            const choices = sampleStates(
              [state, ...sampleStates(distinct, 3, random)],
              4,
              random,
            );
            field.options = choices.map((candidate, index) => ({
              id: `option-${index + 1}`,
              value: candidate[property.field],
            }));
            field.correctOption = field.options.find(
              (option) => option.value === value,
            )!.id;
          }
          return [field];
        }),
      }),
    ),
    answers: [],
  };
}

export function submitAnswer(
  session: QuizSession,
  index: number,
  draft: DraftAnswers,
): QuizSession {
  if (
    index !== session.answers.length ||
    index < 0 ||
    index >= session.questions.length
  )
    return session;
  return {
    ...session,
    answers: [
      ...session.answers,
      {
        fields: session.questions[index].fields
          .filter((field) => field.mode !== 'show')
          .map((field) => {
            const answer = draft[field.property.id] ?? '';
            return {
              propertyId: field.property.id,
              answer,
              correct:
                field.mode === 'fill-in'
                  ? normalizeAnswer(answer) === normalizeAnswer(field.value)
                  : answer === field.correctOption,
            };
          }),
      },
    ],
  };
}

export function quizScore(session: QuizSession) {
  const correct = session.answers
    .flatMap((answer) => answer.fields)
    .filter((field) => field.correct).length;
  const total = session.questions.reduce(
    (sum, question) =>
      sum + question.fields.filter((field) => field.mode !== 'show').length,
    0,
  );
  return {
    correct,
    total,
    percentage: total ? Math.round((correct / total) * 100) : 0,
  };
}
