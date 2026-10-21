import type { DataStatus, Dataset } from '../../domain/data';
export function Setup({
  status,
  sample,
  error,
}: {
  status: DataStatus | null;
  sample: Dataset | null;
  error: string;
}) {
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
            Choose your clues and test what you know. Quiz configuration is
            coming in a later step.
          </p>
        </div>
        <div className="properties">
          {['State names', 'Capitals', 'State shapes', 'Flags'].map(
            (label, index) => (
              <div className="property" key={label}>
                <span aria-hidden="true">0{index + 1}</span>
                <strong>{label}</strong>
              </div>
            ),
          )}
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
                ? 'State data has not been collected yet. This preview is ready to explore; quizzes will follow once the dataset is added.'
                : status?.status === 'sample'
                  ? 'This fictional record checks local data and image delivery. It is not a real state or a playable quiz.'
                  : 'The application foundation is ready. Quiz configuration and play are coming next.')}
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
        <button className="primary" disabled>
          Quiz setup coming soon
        </button>
      </section>
    </>
  );
}
