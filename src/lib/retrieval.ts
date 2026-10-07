import { db } from "./db";

const STOP = new Set([
  "از","به","با","که","این","آن","برای","است","هست","و","در","را","یک","تا","هم","می","شود","بود","خواهد",
  "the","a","an","of","to","and","is","are","in","on","for","with","that","this","it","as","be","by","or",
]);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Simple keyword-overlap retrieval over a book's pages. */
export async function findRelevantPages(bookId: number, query: string, k = 4) {
  const pages = await db.page.findMany({ where: { bookId } });
  const q = new Set(tokenize(query));
  if (q.size === 0) return pages.slice(0, k);
  const scored = pages.map((p) => {
    const toks = tokenize(p.content);
    let hits = 0;
    const seen = new Set<string>();
    for (const t of toks) {
      if (q.has(t) && !seen.has(t)) {
        hits++;
        seen.add(t);
      }
    }
    const score = hits / Math.sqrt(toks.length || 1) + hits / q.size;
    return { page: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).filter((s) => s.score > 0);
  if (top.length === 0) return pages.slice(0, k);
  return top.map((s) => s.page);
}
