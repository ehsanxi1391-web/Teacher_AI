export interface ParsedPage {
  number: number;
  content: string;
}

const MAX_PAGES = 80;
const MAX_PAGE_CHARS = 6000;

/** Splits raw text into pseudo-pages: form feeds, then [صفحه N]/[Page N] markers, then chunks. */
export function splitTextPages(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  // 1) Form-feed separated pages (common in converted PDFs)
  let parts = clean
    .split(/\f+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts;

  // 2) Explicit page markers like "صفحه 12" / "[Page 3]" / "Page: 4"
  const re = /\[?\s*(?:صفحه|page)\s*[:.\-]?\s*\d{1,3}\s*\]?/gi;
  const marks = [...clean.matchAll(re)];
  if (marks.length >= 2) {
    const out: string[] = [];
    for (let i = 0; i < marks.length; i++) {
      const start = (marks[i].index ?? 0) + marks[i][0].length;
      const end = i + 1 < marks.length ? marks[i + 1].index ?? clean.length : clean.length;
      const chunk = clean.slice(start, end).trim();
      if (chunk.length > 20) out.push(chunk);
    }
    if (out.length >= 2) return out;
  }

  // 3) Fallback: chunk into ~1600-char pseudo pages at whitespace boundaries
  const chunks: string[] = [];
  const size = 1600;
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + size, clean.length);
    if (end < clean.length) {
      const breakAt = clean.lastIndexOf(" ", end);
      const breakAt2 = clean.lastIndexOf("\n", end);
      const br = Math.max(breakAt, breakAt2);
      if (br > i + size * 0.5) end = br;
    }
    const chunk = clean.slice(i, end).trim();
    if (chunk) chunks.push(chunk);
    i = end;
  }
  return chunks;
}

/** Extracts per-page text from an uploaded file (PDF or plain text). */
export async function extractPages(filename: string, buf: Buffer): Promise<ParsedPage[]> {
  const name = (filename || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    const mod: any = await import("pdf-parse");
    const pdfParse = mod.default ?? mod;
    const pages: string[] = [];
    const options = {
      pagerender: async (pageData: any) => {
        try {
          const tc = await pageData.getTextContent();
          const text = tc.items.map((it: any) => it.str).join(" ").replace(/\s+/g, " ").trim();
          pages.push(text);
        } catch {
          pages.push("");
        }
        return "";
      },
    };
    const data = await pdfParse(buf, options);
    let list = pages.filter((p) => p && p.length > 0);
    if (list.length === 0 && data?.text) list = splitTextPages(String(data.text));
    if (list.length === 0) throw new Error("NO_TEXT");
    return list.slice(0, MAX_PAGES).map((content, i) => ({
      number: i + 1,
      content: content.slice(0, MAX_PAGE_CHARS),
    }));
  }

  // Plain text-ish files (.txt, .md, …)
  const text = buf.toString("utf8");
  const list = splitTextPages(text);
  if (list.length === 0) throw new Error("NO_TEXT");
  return list.slice(0, MAX_PAGES).map((content, i) => ({
    number: i + 1,
    content: content.slice(0, MAX_PAGE_CHARS),
  }));
}
