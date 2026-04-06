import { useCallback, useMemo, useState } from "react";
import pillarsCatalog from "../data/pillars.json";

const STORAGE_KEY = "doctrineProgress";

const PILLAR_IDS = ["faith", "repentance", "baptism", "holy_ghost", "enduring"];

function emptyProgress() {
  return Object.fromEntries(PILLAR_IDS.map((id) => [id, []]));
}

function normalizeProgress(raw) {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  for (const id of PILLAR_IDS) {
    const v = raw[id];
    base[id] = Array.isArray(v)
      ? v.filter((x) => typeof x === "string")
      : [];
  }
  return base;
}

function loadFromStorage() {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyProgress();
    return normalizeProgress(JSON.parse(stored));
  } catch {
    return emptyProgress();
  }
}

function saveToStorage(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    void 0;
  }
}

function pillarIdForProphet(prophet) {
  if (!prophet?.pillar_exemplified) return null;
  const p = pillarsCatalog.find(
    (pl) => pl.label === prophet.pillar_exemplified,
  );
  return p?.id ?? null;
}

export function useProgress() {
  const [progress, setProgress] = useState(() => loadFromStorage());

  const completedPillars = useMemo(() => {
    return PILLAR_IDS.filter((id) => (progress[id]?.length ?? 0) > 0);
  }, [progress]);

  const markVisited = useCallback((prophet) => {
    const pillarId = pillarIdForProphet(prophet);
    const prophetId = prophet?.id;
    if (!pillarId || typeof prophetId !== "string") return;

    setProgress((prev) => {
      const current = prev[pillarId] ?? [];
      if (current.includes(prophetId)) return prev;
      const next = {
        ...prev,
        [pillarId]: [...current, prophetId],
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const cleared = emptyProgress();
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        void 0;
      }
    }
    setProgress(cleared);
  }, []);

  return {
    progress,
    completedPillars,
    markVisited,
    resetProgress,
  };
}
