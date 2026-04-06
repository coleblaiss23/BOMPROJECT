import { useEffect, useMemo, useState } from "react";
import { useScriptureData } from "../hooks/useScriptureData";

const VOLUME_OPTIONS = [
  { label: "All", value: null },
  { label: "Old Testament", value: "Old Testament" },
  { label: "New Testament", value: "New Testament" },
  { label: "Book of Mormon", value: "Book of Mormon" },
  { label: "Doctrine & Covenants", value: "Doctrine and Covenants" },
  { label: "Pearl of Great Price", value: "Pearl of Great Price" },
];

const DISPLAY_LIMIT = 50;

function highlightText(text, query) {
  if (!query || query.length < 3 || !text) return text;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const len = query.length;
  const segments = [];
  let pos = 0;
  let idx = lower.indexOf(q, pos);
  let key = 0;
  while (idx !== -1) {
    if (idx > pos) {
      segments.push(
        <span key={`t-${key++}`}>{text.slice(pos, idx)}</span>,
      );
    }
    segments.push(
      <mark key={`m-${key++}`} className="scripture-highlight">
        {text.slice(idx, idx + len)}
      </mark>,
    );
    pos = idx + len;
    idx = lower.indexOf(q, pos);
  }
  if (pos < text.length) {
    segments.push(<span key={`t-${key++}`}>{text.slice(pos)}</span>);
  }
  return segments.length > 0 ? segments : text;
}

export default function ScripturePage() {
  const { allVerses, loading } = useScriptureData("", "");
  const [query, setQuery] = useState("");
  const [activeVolume, setActiveVolume] = useState("Book of Mormon");

  useEffect(() => {
    document.title = "Scripture Search | Doctrine of Christ Explorer";
  }, []);

  const matches = useMemo(() => {
    if (query.trim().length < 3) return [];
    const q = query.trim();
    const qLower = q.toLowerCase();

    return allVerses.filter((row) => {
      if (!row?.scripture_text) return false;
      if (activeVolume != null && row.volume_title !== activeVolume) {
        return false;
      }
      return row.scripture_text.toLowerCase().includes(qLower);
    });
  }, [allVerses, query, activeVolume]);

  const total = matches.length;
  const displayed = matches.slice(0, DISPLAY_LIMIT);
  const capped = total > DISPLAY_LIMIT;

  if (loading) {
    return (
      <div className="explore-loading-page">
        <p className="explore-loading-text">Loading scriptures…</p>
      </div>
    );
  }

  const showPrompt = query.trim().length < 3;
  const showNoResults = !showPrompt && total === 0;

  return (
    <div className="scripture-page">
      <input
        type="search"
        className="scripture-search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search any word or phrase across all scriptures..."
        aria-label="Search scriptures"
        autoComplete="off"
      />

      <div
        className="scripture-volume-row"
        role="group"
        aria-label="Filter by volume"
      >
        {VOLUME_OPTIONS.map((opt) => {
          const isActive =
            opt.value === null
              ? activeVolume === null
              : activeVolume === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              className={`scripture-volume-btn${isActive ? " active" : ""}`}
              onClick={() => setActiveVolume(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {showPrompt ? (
        <p className="scripture-prompt">
          Type at least 3 characters to search.
        </p>
      ) : null}

      {!showPrompt && !showNoResults ? (
        <>
          <p className="scripture-count">
            {total === 1 ? "1 verse found" : `${total} verses found`}
          </p>
          {capped ? (
            <p className="scripture-cap-notice">
              Showing {DISPLAY_LIMIT} of {total} results — refine your search to
              see more
            </p>
          ) : null}
        </>
      ) : null}

      {showNoResults ? (
        <p className="scripture-empty">No verses found for that search.</p>
      ) : null}

      {!showPrompt && !showNoResults ? (
        <div className="scripture-results">
          {displayed.map((row, i) => {
            const ref = `${row.book_title ?? ""} ${row.chapter_number ?? ""}:${row.verse_number ?? ""}`;
            return (
              <article key={`${row.verse_id ?? i}-${i}`} className="scripture-card">
                <h2 className="scripture-card-ref">{ref}</h2>
                <p className="scripture-card-text">
                  {highlightText(row.scripture_text, query.trim())}
                </p>
                <span className="scripture-card-volume">
                  {row.volume_title}
                </span>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
