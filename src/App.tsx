import {
  defaultConfiguration,
  validateConfiguration,
  type QuizConfiguration,
} from './domain/configuration';
import { Quiz } from './features/quiz/Quiz';
import { useEffect, useState } from 'react';
import type { DataStatus, Dataset } from './domain/data';
import { Setup } from './features/setup/Setup';

export function App() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [configuration, setConfiguration] = useState(defaultConfiguration);
  const [activeConfiguration, setActiveConfiguration] =
    useState<QuizConfiguration | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}data/status.json`,
          { signal: controller.signal },
        );
        if (!response.ok)
          throw new Error(
            'Local data status is unavailable. Restart npm run dev or rebuild the app.',
          );
        const data: DataStatus = await response.json();
        setStatus(data);
        if (data.status === 'sample' || data.status === 'ready') {
          const fixture = await fetch(
            `${import.meta.env.BASE_URL}data/dataset.json`,
            { signal: controller.signal },
          );
          if (!fixture.ok)
            throw new Error(
              'Local dataset is missing. Restart npm run dev to refresh local files.',
            );
          setDataset(await fixture.json());
        }
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Unable to load local data.',
          );
      }
    }
    void load();
    return () => controller.abort();
  }, []);
  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="#main">
          <span aria-hidden="true">◎</span> geotester
        </a>
      </header>
      <main id="main">
        <p className="eyebrow">A little curiosity. A whole country.</p>
        <h1>Find your way to knowing more.</h1>
        {activeConfiguration ? (
          <Quiz
            configuration={activeConfiguration}
            states={dataset!.states}
            onBack={() => setActiveConfiguration(null)}
          />
        ) : (
          <Setup
            status={status}
            sample={status?.status === 'sample' ? dataset : null}
            error={error}
            configuration={configuration}
            onChange={setConfiguration}
            onStart={() => {
              if (
                status?.status === 'ready' &&
                dataset &&
                !error &&
                validateConfiguration(configuration, status.count).length === 0
              )
                setActiveConfiguration({
                  length: configuration.length,
                  modes: { ...configuration.modes },
                });
            }}
          />
        )}
      </main>
      <footer>
        50 states. Countless discoveries.<span>Built for curious minds.</span>
      </footer>
    </div>
  );
}
