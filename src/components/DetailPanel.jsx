import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { findVerseRow, parseVerseReference } from "../utils/retrieval";

export default function DetailPanel({ prophet, verses = [], onClose }) {
  const navigate = useNavigate();
  const titleId = useId();
  const scriptureModalTitleId = useId();
  const closeRef = useRef(null);
  const [selectedVerse, setSelectedVerse] = useState(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (selectedVerse) {
          setSelectedVerse(null);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, selectedVerse]);

  if (!prophet) return null;

  function handleVerseChipClick(citation) {
    const parsed = parseVerseReference(citation);
    if (!parsed) {
      setSelectedVerse({ citation, row: null });
      return;
    }
    const { book, chapter, verseNumbers } = parsed;
    const texts = [];
    let firstRow = null;
    for (const vn of verseNumbers) {
      const row = findVerseRow(verses, book, chapter, vn);
      if (row) {
        if (!firstRow) firstRow = { ...row };
        if (row.scripture_text) texts.push(row.scripture_text);
      }
    }
    if (texts.length === 0) {
      setSelectedVerse({ citation, row: null });
      return;
    }
    const combined = texts.join("\n\n");
    setSelectedVerse({
      citation,
      row: firstRow
        ? { ...firstRow, scripture_text: combined }
        : null,
    });
  }

  function handleAskTutor() {
    const q = new URLSearchParams({
      prophet: prophet.name,
      pillar: prophet.pillar_exemplified,
    });
    navigate(`/chat?${q.toString()}`);
  }

  const keyVerseCitations = prophet.key_verses ?? [];

  return (
    <div className="detail-overlay" role="presentation">
      <button
        type="button"
        className="detail-backdrop"
        aria-label="Close panel"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-panel-header">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="detail-close"
            aria-label="Close panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>

          <h2 id={titleId} className="detail-title">
            {prophet.name}
          </h2>
          <span className="detail-badge">{prophet.pillar_exemplified}</span>
        </div>

        <div className="detail-body">
          <h3 className="detail-section-title">
            Why I paired {prophet.name} with {prophet.pillar_exemplified}
          </h3>

          {keyVerseCitations.length > 0 ? (
            <div className="detail-chips">
              {keyVerseCitations.map((citation) => (
                <div key={citation} className="detail-chip-wrap">
                  <button
                    type="button"
                    onClick={() => handleVerseChipClick(citation)}
                    className="detail-chip"
                  >
                    {citation}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <p className="detail-context">{prophet.historical_context}</p>

          {prophet.doc_of_christ_quote ? (
            <figure className="detail-blockquote-wrap">
              <figcaption className="detail-blockquote-label">
                Verse I&apos;m highlighting
              </figcaption>
              <blockquote className="detail-blockquote">
                {prophet.doc_of_christ_quote}
              </blockquote>
            </figure>
          ) : null}

          <div className="detail-cta">
            <button
              type="button"
              onClick={handleAskTutor}
              className="btn-navy"
            >
              Ask the Tutor about {prophet.name}
            </button>
          </div>
        </div>
      </aside>

      {selectedVerse ? (
        <div
          className="scripture-modal-overlay"
          role="presentation"
          onClick={() => setSelectedVerse(null)}
        >
          <div
            className="scripture-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={scriptureModalTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id={scriptureModalTitleId} className="scripture-modal-title">
              {selectedVerse.citation}
            </h3>
            {selectedVerse.row?.scripture_text ? (
              <p className="scripture-modal-text">{selectedVerse.row.scripture_text}</p>
            ) : (
              <p className="scripture-modal-unavailable">
                Full text not available — check your scriptures data.
              </p>
            )}
            <button
              type="button"
              className="scripture-modal-close btn-secondary"
              onClick={() => setSelectedVerse(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
