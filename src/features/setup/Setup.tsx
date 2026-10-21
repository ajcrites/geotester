import { properties, type PropertyMode } from '../../domain/properties';
import {
  validateConfiguration,
  type QuizConfiguration,
} from '../../domain/configuration';
import type { DataStatus, Dataset } from '../../domain/data';
export function Setup({
  status,
  sample,
  error,
  configuration,
  onChange,
  onStart,
}: {
  status: DataStatus | null;
  sample: Dataset | null;
  error: string;
  configuration: QuizConfiguration;
  onChange: (configuration: QuizConfiguration) => void;
  onStart: () => void;
}) {
  const errors = validateConfiguration(configuration, 50);
  const ready = status?.status === 'ready' && !error;
  const modeLabels: Record<PropertyMode, string> = {
    omit: 'Omit',
    show: 'Show as clue',
    'fill-in': 'Fill-in',
    'multiple-choice': 'Multiple choice',
  };
  return (
    <>
      <p className="intro">
        Get to know the United States through names, capitals, shapes, and
        flags. Your next geography adventure starts here.
      </p>
      <section className="panel" aria-labelledby="setup-title">
        <div>
          <p className="eyebrow">Your field guide</p>
          <h2 id="setup-title">A quiz your way</h2>
          <p>
            Choose which properties to show as clues, answer, or omit. Fill-in
            uses a text answer; multiple choice offers four options.
          </p>
        </div>
        <div className="properties">
          {properties.map((property) => (
            <label className="property" key={property.id}>
              <strong>{property.label}</strong>
              <select
                value={configuration.modes[property.id]}
                onChange={(event) =>
                  onChange({
                    ...configuration,
                    modes: {
                      ...configuration.modes,
                      [property.id]: event.target.value as PropertyMode,
                    },
                  })
                }
              >
                {property.modes.map((mode) => (
                  <option key={mode} value={mode}>
                    {modeLabels[mode]}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="length-control">
          <label htmlFor="quiz-length">
            Quiz length: <output>{configuration.length}</output> states
          </label>
          <input
            id="quiz-length"
            type="range"
            min="1"
            max="50"
            step="1"
            value={configuration.length}
            onChange={(event) =>
              onChange({ ...configuration, length: Number(event.target.value) })
            }
          />
          <div className="shortcuts" aria-label="Quiz length shortcuts">
            {[10, 20, 30, 40, 50].map((length) => (
              <button
                type="button"
                key={length}
                aria-pressed={configuration.length === length}
                onClick={() => onChange({ ...configuration, length })}
              >
                {length}
              </button>
            ))}
          </div>
        </div>
        <div className="data-status" role="status">
          <strong>
            {error
              ? 'Local data needs attention'
              : !status
                ? 'Checking local data…'
                : status.status === 'empty'
                  ? 'The map is still taking shape'
                  : status.status === 'sample'
                    ? 'Sample data only'
                    : `${status.count} state records available`}
          </strong>
          <p>
            {error ||
              (status?.status === 'empty'
                ? 'Run npm run data:collect, then restart the development server or rebuild to enable quiz setup.'
                : status?.status === 'sample'
                  ? 'This fictional record checks local data and image delivery. It is not a real state or a playable quiz.'
                  : 'Local data is ready. Choose your settings to begin.')}
          </p>
        </div>
        {sample && (
          <figure>
            <img
              src={`${import.meta.env.BASE_URL}data/${sample.states[0].shape}`}
              alt="Fictional sample outline used to verify image delivery"
            />
            <figcaption>
              {sample.states[0].name} · {sample.states[0].capital}
            </figcaption>
          </figure>
        )}
        <div id="configuration-feedback" aria-live="polite">
          {errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
          {!ready && (
            <p>Starting requires the complete 50-state dataset to be ready.</p>
          )}
        </div>
        <button
          className="primary"
          disabled={!ready || errors.length > 0}
          aria-describedby="configuration-feedback"
          onClick={onStart}
        >
          Begin quiz
        </button>
      </section>
    </>
  );
}
