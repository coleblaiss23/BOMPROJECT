export function retrieveContext(query, verses, prophets) {
  const queryLower = query.toLowerCase();

  let matched = [];

  for (const p of prophets) {
    if (queryLower.includes(p.name.toLowerCase())) {
      matched.push(p);
    }
  }

  if (matched.length === 0) {
    const words = queryLower.match(/[a-z0-9']+/g) ?? [];
    const significant = [...new Set(words.filter((w) => w.length > 3))];
    const scored = prophets.map((p) => {
      const pillar = p.pillar_exemplified.toLowerCase();
      const ctx = p.historical_context.toLowerCase();
      let score = 0;
      for (const w of significant) {
        if (pillar.includes(w) || ctx.includes(w)) score += 1;
      }
      return { prophet: p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    matched = scored
      .filter((x) => x.score > 0)
      .slice(0, 2)
      .map((x) => x.prophet);
  }

  const parts = [];

  for (const prophet of matched) {
    parts.push(prophet.name);
    parts.push(`Pillar: ${prophet.pillar_exemplified}`);
    parts.push(`My notes: ${prophet.historical_context}`);

    const refs = prophet.key_verses ?? [];
    for (const ref of refs) {
      const parsed = parseVerseReference(ref);
      if (!parsed) continue;
      const { book, chapter, verseNumbers } = parsed;
      for (const vn of verseNumbers) {
        const row = findVerseRow(verses, book, chapter, vn);
        if (row?.scripture_text != null) {
          parts.push(`${book} ${chapter}:${vn}: ${row.scripture_text}`);
        }
      }
    }

    parts.push("");
  }

  return parts.join("\n").trimEnd();
}

export function parseVerseReference(ref) {
  const trimmed = ref.trim();
  const colonIdx = trimmed.lastIndexOf(":");
  if (colonIdx === -1) return null;

  const beforeColon = trimmed.slice(0, colonIdx).trim();
  const afterColon = trimmed.slice(colonIdx + 1).trim().replace(/–/g, "-");
  const beforeParts = beforeColon.split(/\s+/).filter(Boolean);
  if (beforeParts.length < 2) return null;

  const chapter = parseInt(beforeParts[beforeParts.length - 1], 10);
  if (!Number.isFinite(chapter)) return null;

  const book = beforeParts.slice(0, -1).join(" ");

  const verseNumbers = [];
  if (afterColon.includes("-")) {
    const [a, b] = afterColon.split("-").map((s) => parseInt(s.trim(), 10));
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    for (let v = start; v <= end; v++) verseNumbers.push(v);
  } else {
    const v = parseInt(afterColon, 10);
    if (!Number.isFinite(v)) return null;
    verseNumbers.push(v);
  }

  return { book, chapter, verseNumbers };
}

export function findVerseRow(verses, book, chapter, verseNum) {
  return verses.find(
    (r) =>
      String(r.book_title ?? "").trim() === book &&
      Number(r.chapter_number) === Number(chapter) &&
      Number(r.verse_number) === Number(verseNum),
  );
}
