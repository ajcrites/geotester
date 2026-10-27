import { useEffect, useRef } from 'react';
import { quizScore, type QuizSession } from '../../domain/quiz';
import type { StateRecord } from '../../domain/data';

export function Results({
  session,
  states,
  onRestart,
  onBack,
}: {
  session: QuizSession;
  states: StateRecord[];
  onRestart: () => void;
  onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const score = quizScore(session);
  const missed = session.questions.flatMap((question, index) => {
    const fields = session.answers[index].fields.filter(
      (answer) => !answer.correct,
    );
    return fields.length ? [{ question, index, fields }] : [];
  });
  return (
    <section className="panel placeholder" aria-labelledby="results-title">
      <p className="eyebrow">Quiz complete</p>
      <h2 id="results-title" ref={heading} tabIndex={-1}>
        Your score: {score.percentage}%
      </h2>
      <p>
        {score.correct} correct out of {score.total} possible points.
      </p>
      <div className="quiz-actions">
        <button className="primary" onClick={onRestart}>
          Start a new quiz
        </button>
        <button onClick={onBack}>Return to setup</button>
      </div>
      <h3>Missed answers</h3>
      {missed.length === 0 ? (
        <p>Perfect score! You answered every property correctly.</p>
      ) : (
        <>
          <p>Only incorrect or unanswered properties appear below.</p>
          {missed.map(({ question, index, fields }) => {
            const state = states.find((item) => item.id === question.stateId)!;
            return (
              <section
                className="missed-state"
                key={question.stateId}
                aria-labelledby={`review-${index}`}
              >
                <h4 id={`review-${index}`}>
                  State {index + 1}: {state.name}
                </h4>
                {fields.map((answer) => {
                  const field = question.fields.find(
                    (item) => item.property.id === answer.propertyId,
                  )!;
                  const submitted =
                    field.mode === 'multiple-choice'
                      ? field.options.find(
                          (option) => option.id === answer.answer,
                        )?.value
                      : answer.answer;
                  const render = (value: string, label: string) =>
                    field.property.kind === 'image' ? (
                      <img
                        src={`${import.meta.env.BASE_URL}data/${value}`}
                        alt={`${label} ${field.property.label.toLowerCase()}: ${states.find((item) => item[field.property.field] === value)?.name ?? state.name}`}
                      />
                    ) : (
                      <span>{value}</span>
                    );
                  return (
                    <div className="review-field" key={answer.propertyId}>
                      <h5>{field.property.label}</h5>
                      <dl className="review-answers">
                        <div>
                          <dt>Your answer</dt>
                          <dd>
                            {submitted?.trim()
                              ? render(submitted, 'Submitted')
                              : 'No answer'}
                          </dd>
                        </div>
                        <div>
                          <dt>Correct answer</dt>
                          <dd>{render(field.value, 'Correct')}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </>
      )}
    </section>
  );
}
