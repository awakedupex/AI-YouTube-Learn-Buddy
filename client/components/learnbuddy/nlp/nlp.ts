const STOPWORDS = new Set([
  "the","is","in","at","of","a","an","and","or","to","for","on","with","as","by","it","that","this","are","be","from","we","you","your","our","their","was","were","will","shall","has","have","had","but","so","if","then","than","which","who","what","when","where","why","how","into","about","each","more","much","many","few","most","least","can","could","should","would","may","might","also","just","like","one","two","three","such","using","use","used","over","under","between","within","without","until","while"
]);

export function keywords(text: string, topN = 6): string[] {
  const counts: Record<string, number> = {};
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (!raw || STOPWORDS.has(raw) || raw.length < 3) continue;
    counts[raw] = (counts[raw] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);
}

export function summarize(text: string, maxSentences = 3): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]/g) || [text];
  const keys = new Set(keywords(text, 10));
  const ranked = sentences
    .map((s) => ({ s: s.trim(), score: s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => keys.has(w)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map((x) => x.s);
  if (ranked.length === 0) return text.slice(0, 200);
  return ranked.join(" ");
}
