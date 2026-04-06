import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pillarsCatalog from "../data/pillars.json";
import DetailPanel from "../components/DetailPanel";
import ProgressTracker from "../components/ProgressTracker";
import ProphetCard from "../components/ProphetCard";
import { useProgress } from "../hooks/useProgress";
import { useScriptureData } from "../hooks/useScriptureData";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProphet, setSelectedProphet] = useState(null);

  const { progress, completedPillars, markVisited, resetProgress } =
    useProgress();

  const pillarParam = searchParams.get("pillar") ?? "";
  const activePillar =
    pillarParam && pillarsCatalog.some((p) => p.id === pillarParam)
      ? pillarParam
      : "";

  const { filteredProphets, pillars, loading, verses } = useScriptureData(
    searchTerm,
    activePillar,
  );

  useEffect(() => {
    document.title = "Explore | Doctrine of Christ Explorer";
  }, []);

  function handlePillarClick(id) {
    if (activePillar === id) {
      setSearchParams({});
    } else {
      setSearchParams({ pillar: id });
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setSearchParams({});
  }

  const showEmpty = !loading && filteredProphets.length === 0;
  const total = filteredProphets.length;

  return (
    <div className="explore">
      <section
        className="explore-progress-wrap"
        aria-labelledby="explore-progress-heading"
      >
        <div className="explore-progress-card">
          <h2 id="explore-progress-heading" className="explore-progress-title">
            Where I&apos;m at with the five pillars
          </h2>
          <ProgressTracker
            progress={progress}
            completedPillars={completedPillars}
            resetProgress={resetProgress}
          />
        </div>
      </section>

      <div className="explore-toolbar">
        <div className="explore-search-block">
          <label htmlFor="explore-search" className="explore-label">
            Search
          </label>
          <div className="explore-search-wrap">
            <span className="explore-search-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.2-3.2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              id="explore-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search names or my notes…"
              className="explore-input"
            />
          </div>
        </div>
        {!loading ? (
          <p className="explore-count">
            <strong>{total}</strong>
            {total === 1 ? " result" : " results"}
          </p>
        ) : null}
      </div>

      <div>
        <p className="explore-pillar-heading">Filter by pillar</p>
        <div
          className="explore-pills"
          role="group"
          aria-label="Filter by pillar"
        >
          {pillars.map((pillar) => {
            const isActive = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                title={pillar.description}
                onClick={() => handlePillarClick(pillar.id)}
                className={`pill-btn${isActive ? " active" : ""}`}
              >
                {pillar.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="explore-loading-page">
          <p className="explore-loading-text">Loading scriptures…</p>
        </div>
      ) : showEmpty ? (
        <div className="explore-empty">
          <p>No results match your filters.</p>
          <button type="button" onClick={clearFilters} className="btn-secondary">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="explore-grid">
          {filteredProphets.map((prophet) => (
            <ProphetCard
              key={prophet.id}
              prophet={prophet}
              onClick={() => {
                markVisited(prophet);
                setSelectedProphet(prophet);
              }}
            />
          ))}
        </div>
      )}

      {selectedProphet ? (
        <DetailPanel
          prophet={selectedProphet}
          verses={verses}
          onClose={() => setSelectedProphet(null)}
        />
      ) : null}
    </div>
  );
}
