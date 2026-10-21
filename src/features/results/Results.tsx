export function Results({
  score,
  onRestart,
  onBack,
}: {
  score: { correct: number; total: number; percentage: number };
  onRestart: () => void;
  onBack: () => void;
}) {
  return (
    <section className="panel placeholder">
      <p className="eyebrow">Quiz complete</p>
      <h2>Your score: {score.percentage}%</h2>
      <p>
        {score.correct} correct out of {score.total} possible points.
      </p>
      <div className="quiz-actions">
        <button className="primary" onClick={onRestart} autoFocus>
          Start a new quiz
        </button>
        <button onClick={onBack}>Return to setup</button>
      </div>
    </section>
  );
}
