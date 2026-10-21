import { useState } from 'react';
import type { QuizConfiguration } from '../../domain/configuration';
import type { StateRecord } from '../../domain/data';
import { properties } from '../../domain/properties';
import {
  quizScore,
  sampleStates,
  submitAnswer,
  supportsShapeQuiz,
  type QuizSession,
} from '../../domain/quiz';
import { Results } from '../results/Results';

export function Quiz({
  configuration,
  states,
  onBack,
}: {
  configuration: QuizConfiguration;
  states: StateRecord[];
  onBack: () => void;
}) {
  if (!supportsShapeQuiz(configuration))
    return (
      <section className="panel placeholder">
        <h2>Your {configuration.length}-state quiz settings</h2>
        <p>
          This configuration is saved as a preview. Play currently supports
          fill-in name, shown outline, and omitted capital and flag. Other
          combinations are coming next.
        </p>
        <dl>
          {properties.map(({ id, label }) => (
            <div key={id}>
              <dt>{label}</dt>
              <dd>{configuration.modes[id].replaceAll('-', ' ')}</dd>
            </div>
          ))}
        </dl>
        <button className="primary" onClick={onBack}>
          Edit settings
        </button>
      </section>
    );
  return (
    <ShapeQuiz states={states} length={configuration.length} onBack={onBack} />
  );
}

function ShapeQuiz({
  states,
  length,
  onBack,
}: {
  states: StateRecord[];
  length: number;
  onBack: () => void;
}) {
  const [session, setSession] = useState<QuizSession>(() => ({
    questions: sampleStates(states, length),
    answers: [],
  }));
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const restart = () => {
    setSession({ questions: sampleStates(states, length), answers: [] });
    setIndex(0);
    setDraft('');
  };
  if (index === session.questions.length)
    return (
      <Results score={quizScore(session)} onRestart={restart} onBack={onBack} />
    );
  const question = session.questions[index];
  const result = session.answers[index];
  return (
    <section className="panel placeholder" aria-labelledby="question-title">
      <p className="eyebrow">
        State {index + 1} of {length}
      </p>
      <progress value={index} max={length} aria-label="Completed states" />
      <h2 id="question-title">Which state is this?</h2>
      <figure className="quiz-outline">
        <img
          src={`${import.meta.env.BASE_URL}data/${question.shape}`}
          alt="Outline of the state to identify"
        />
      </figure>
      <form
        key={index}
        onSubmit={(event) => {
          event.preventDefault();
          setSession((current) => submitAnswer(current, index, draft));
        }}
      >
        <label htmlFor="state-answer">State name</label>
        <input
          id="state-answer"
          className="answer-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          readOnly={!!result}
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        {!result && (
          <button className="primary" type="submit">
            Submit answer
          </button>
        )}
      </form>
      <div role="status">
        {result && (
          <p>
            <strong
              className={
                result.correct ? 'feedback-correct' : 'feedback-incorrect'
              }
            >
              {result.correct ? 'Correct!' : 'Incorrect.'}
            </strong>{' '}
            The state is {question.name}.
          </p>
        )}
      </div>
      <div className="quiz-actions">
        {result && (
          <button
            className="primary"
            autoFocus
            onClick={() => {
              setIndex(index + 1);
              setDraft('');
            }}
          >
            {index + 1 === length ? 'See score' : 'Next state'}
          </button>
        )}
        <button type="button" onClick={onBack}>
          Return to setup
        </button>
      </div>
    </section>
  );
}
