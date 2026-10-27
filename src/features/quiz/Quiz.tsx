import { useState } from 'react';
import type { QuizConfiguration } from '../../domain/configuration';
import type { StateRecord } from '../../domain/data';
import {
  createSession,
  quizScore,
  submitAnswer,
  type DraftAnswers,
  type QuestionField,
} from '../../domain/quiz';
import { Results } from '../results/Results';

function Value({
  field,
  value,
  description,
}: {
  field: QuestionField;
  value: string;
  description: string;
}) {
  return field.property.kind === 'image' ? (
    <img src={`${import.meta.env.BASE_URL}data/${value}`} alt={description} />
  ) : (
    <span>{value}</span>
  );
}

export function Quiz({
  configuration,
  states,
  onBack,
}: {
  configuration: QuizConfiguration;
  states: StateRecord[];
  onBack: () => void;
}) {
  const [session, setSession] = useState(() =>
    createSession(states, configuration),
  );
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<DraftAnswers>({});
  const restart = () => {
    setSession(createSession(states, configuration));
    setIndex(0);
    setDraft({});
  };
  if (index === session.questions.length)
    return (
      <Results score={quizScore(session)} onRestart={restart} onBack={onBack} />
    );
  const question = session.questions[index];
  const result = session.answers[index];
  const answerFields = question.fields.filter((field) => field.mode !== 'show');
  return (
    <section className="panel placeholder" aria-labelledby="question-title">
      <p className="eyebrow">
        State {index + 1} of {session.questions.length}
      </p>
      <progress
        value={index}
        max={session.questions.length}
        aria-label="Completed states"
      />
      <h2 id="question-title">Identify the missing properties</h2>
      <div className="quiz-clues">
        {question.fields
          .filter((field) => field.mode === 'show')
          .map((field) => (
            <figure className="quiz-outline" key={field.property.id}>
              <figcaption>{field.property.label}</figcaption>
              <Value
                field={field}
                value={field.value}
                description={`${field.property.label} clue for this state`}
              />
            </figure>
          ))}
      </div>
      <form
        key={index}
        onSubmit={(event) => {
          event.preventDefault();
          setSession((current) => submitAnswer(current, index, draft));
        }}
      >
        {answerFields.map((field, fieldIndex) => {
          const feedback = result?.fields.find(
            (item) => item.propertyId === field.property.id,
          );
          return (
            <fieldset className="answer-field" key={field.property.id}>
              <legend>{field.property.label}</legend>
              {field.mode === 'fill-in' ? (
                <>
                  <label
                    className="answer-label"
                    htmlFor={`answer-${field.property.id}`}
                  >
                    Your answer
                  </label>
                  <input
                    id={`answer-${field.property.id}`}
                    className="answer-input"
                    value={draft[field.property.id] ?? ''}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        [field.property.id]: event.target.value,
                      })
                    }
                    readOnly={!!result}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus={fieldIndex === 0}
                  />
                </>
              ) : (
                <div className="choice-grid">
                  {field.options.map((option, optionIndex) => (
                    <label className="choice" key={option.id}>
                      <input
                        type="radio"
                        name={field.property.id}
                        value={option.id}
                        checked={draft[field.property.id] === option.id}
                        disabled={!!result}
                        autoFocus={fieldIndex === 0 && optionIndex === 0}
                        onChange={() =>
                          setDraft({ ...draft, [field.property.id]: option.id })
                        }
                      />
                      <span>Option {optionIndex + 1}</span>
                      <Value
                        field={field}
                        value={option.value}
                        description={`${field.property.label}, option ${optionIndex + 1}`}
                      />
                    </label>
                  ))}
                </div>
              )}
              <div role="status">
                {feedback && (
                  <div className="field-feedback">
                    <strong
                      className={
                        feedback.correct
                          ? 'feedback-correct'
                          : 'feedback-incorrect'
                      }
                    >
                      {feedback.correct ? 'Correct!' : 'Incorrect.'}
                    </strong>
                    <p>
                      Correct answer
                      {field.correctOption
                        ? `: Option ${field.options.findIndex((option) => option.id === field.correctOption) + 1}`
                        : ':'}
                    </p>
                    <Value
                      field={field}
                      value={field.value}
                      description={`Correct ${field.property.label.toLowerCase()} answer`}
                    />
                  </div>
                )}
              </div>
            </fieldset>
          );
        })}
        {!result && (
          <button className="primary" type="submit">
            {answerFields.length === 1 ? 'Submit answer' : 'Submit answers'}
          </button>
        )}
      </form>
      <div className="quiz-actions">
        {result && (
          <button
            className="primary"
            autoFocus
            onClick={() => {
              setIndex(index + 1);
              setDraft({});
            }}
          >
            {index + 1 === session.questions.length
              ? 'See score'
              : 'Next state'}
          </button>
        )}
        <button type="button" onClick={onBack}>
          Return to setup
        </button>
      </div>
    </section>
  );
}
