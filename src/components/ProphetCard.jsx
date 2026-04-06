function firstSentence(text) {
  const trimmed = text.trim();
  const split = trimmed.split(/(?<=[.!?])\s+/);
  return split[0] ?? trimmed;
}

export default function ProphetCard({ prophet, onClick }) {
  const reference = prophet.key_verses?.[0];
  const preview = firstSentence(prophet.historical_context);

  return (
    <button type="button" onClick={onClick} className="prophet-card">
      <div className="prophet-card-header">
        <h3 className="prophet-card-name">{prophet.name}</h3>
        <span className="prophet-badge">{prophet.pillar_exemplified}</span>
      </div>
      {reference ? (
        <p className="prophet-ref">{reference}</p>
      ) : null}
      <p className="prophet-preview">{preview}</p>
    </button>
  );
}
