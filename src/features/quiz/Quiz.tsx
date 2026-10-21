import type { QuizConfiguration } from '../../domain/configuration';
import { properties } from '../../domain/properties';

export function Quiz({
  configuration,
  onBack,
}: {
  configuration: QuizConfiguration;
  onBack: () => void;
}) {
  return (
    <section className="panel placeholder">
      <p className="eyebrow">Quiz setup saved</p>
      <h2>Your {configuration.length}-state quiz</h2>
      <p>Question play is coming next. Your selected settings are ready:</p>
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
}
