const STEPS = [
  { id: "faith", number: 1, label: "Faith" },
  { id: "repentance", number: 2, label: "Repentance" },
  { id: "baptism", number: 3, label: "Baptism" },
  { id: "holy_ghost", number: 4, label: "Gift of the Holy Ghost" },
  { id: "enduring", number: 5, label: "Enduring to the End" },
];

function CheckIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProgressTracker({
  progress,
  completedPillars,
  resetProgress,
}) {
  const completedSet = new Set(completedPillars);
  const exploredCount = completedPillars.length;
  const allDone = exploredCount === 5;
  const totalProphetsMarked = STEPS.reduce(
    (n, s) => n + (progress[s.id]?.length ?? 0),
    0,
  );

  return (
    <div className="progress-tracker">
      <div
        className="progress-tracker-scroll"
        aria-label={`Doctrine of Christ progress: ${exploredCount} of 5 pillars explored, ${totalProphetsMarked} prophets visited`}
      >
        <div className="progress-tracker-path">
          {STEPS.map((step, i) => {
            const done = completedSet.has(step.id);
            return (
              <div className="progress-tracker-segment" key={step.id}>
                <div className="progress-tracker-step">
                  <div
                    className={`progress-tracker-circle${done ? " is-done" : ""}`}
                    aria-label={
                      done
                        ? `${step.label}, explored`
                        : `${step.label}, not yet explored`
                    }
                  >
                    {done ? (
                      <CheckIcon />
                    ) : (
                      <span className="progress-tracker-num">{step.number}</span>
                    )}
                  </div>
                  <span className="progress-tracker-name">{step.label}</span>
                </div>
                {i < STEPS.length - 1 ? (
                  <div
                    className={`progress-tracker-line${
                      completedSet.has(STEPS[i].id) &&
                      completedSet.has(STEPS[i + 1].id)
                        ? " is-complete"
                        : ""
                    }`}
                    aria-hidden
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="progress-tracker-footer">
        <p className="progress-tracker-count">
          {exploredCount} of 5 pillars touched so far
        </p>
        <button
          type="button"
          className="progress-tracker-reset"
          onClick={resetProgress}
        >
          Start over
        </button>
      </div>

      {allDone ? (
        <div className="progress-congrats-banner" role="status">
          <span className="progress-congrats-star" aria-hidden>
            ★
          </span>
          <span>Nice — you hit all five pillars.</span>
        </div>
      ) : null}
    </div>
  );
}
