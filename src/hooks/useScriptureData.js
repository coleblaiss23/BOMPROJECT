import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import doctrineOfChrist from "../data/doctrine-of-christ.json";
import pillars from "../data/pillars.json";

export function useScriptureData(searchTerm = "", activePillar = "") {
  const [verses, setVerses] = useState([]);
  const [allVerses, setAllVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(import.meta.env.BASE_URL + "data/lds-scriptures.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const rows = results.data ?? [];
        setAllVerses(rows);
        const bom = rows.filter(
          (row) => row.volume_title === "Book of Mormon",
        );
        setVerses(bom);
        setLoading(false);
      },
      error: () => {
        setLoading(false);
      },
    });
  }, []);

  const filteredProphets = useMemo(() => {
    const prophets = doctrineOfChrist;
    const activePillarLabel =
      activePillar === ""
        ? null
        : pillars.find((pillar) => pillar.id === activePillar)?.label;
    if (searchTerm === "" && activePillar === "") {
      return prophets;
    }
    const term = searchTerm.toLowerCase();
    return prophets.filter((p) => {
      if (activePillar !== "") {
        if (!activePillarLabel || p.pillar_exemplified !== activePillarLabel) {
          return false;
        }
      }
      if (searchTerm === "") {
        return true;
      }
      const nameMatch = p.name.toLowerCase().includes(term);
      const contextMatch = p.historical_context.toLowerCase().includes(term);
      return nameMatch || contextMatch;
    });
  }, [searchTerm, activePillar]);

  return {
    filteredProphets,
    pillars,
    verses,
    allVerses,
    loading,
  };
}
