import { db } from "./db";
import { aiChat, extractJson } from "./ai";
import { analysisPrompt, fallbackLessonName } from "./prompts";
import { tokenize } from "./retrieval";
import type { Lang } from "./i18n";

interface DraftLesson {
  title: string;
  pages: string;
  summary: string;
  topics: string[];
}

function fallbackLessons(pages: { number: number; content: string }[], lang: Lang): DraftLesson[] {
  const out: DraftLesson[] = [];
  const groupSize = 3;
  for (let i = 0; i < pages.length && out.length < 10; i += groupSize) {
    const group = pages.slice(i, i + groupSize);
    if (group.length === 0) break;
    const a = group[0].number;
    const b = group[group.length - 1].number;
    const freq = new Map<string, number>();
    for (const p of group) for (const t of tokenize(p.content)) freq.set(t, (freq.get(t) ?? 0) + 1);
    const topics = [...freq.entries()]
      .sort((x, y) => y[1] - x[1])
      .slice(0, 4)
      .map(([w]) => w);
    out.push({
      title: fallbackLessonName(lang, out.length + 1, a, b),
      pages: `${a}-${b}`,
      summary: "",
      topics,
    });
  }
  return out;
}

/** Runs AI analysis of a book: detects lessons/topics and stores them. */
export async function analyzeBook(bookId: number): Promise<void> {
  try {
    const book = await db.book.findUnique({
      where: { id: bookId },
      include: { pages: { orderBy: { number: "asc" } } },
    });
    if (!book) return;
    const settings = await db.settings.findUnique({ where: { id: 1 } });
    const lang: Lang = settings?.language === "en" ? "en" : "fa";

    const excerpt = book.pages
      .slice(0, 16)
      .map((p) => `--- [${lang === "en" ? "Page" : "صفحه"} ${p.number}] ---\n${p.content.slice(0, 380)}`)
      .join("\n\n");

    let lessons: DraftLesson[] | null = null;
    try {
      const raw = await aiChat([
        { role: "system", content: analysisPrompt(lang, book.grade, book.subject) },
        { role: "user", content: excerpt.slice(0, 9000) },
      ]);
      const parsed = extractJson(raw) as { lessons?: DraftLesson[] } | null;
      if (parsed && Array.isArray(parsed.lessons) && parsed.lessons.length > 0) {
        lessons = parsed.lessons;
      }
    } catch {
      lessons = null;
    }
    if (!lessons) lessons = fallbackLessons(book.pages, lang);

    await db.lesson.deleteMany({ where: { bookId } });
    let idx = 0;
    for (const l of lessons.slice(0, 12)) {
      const topics = Array.isArray(l.topics)
        ? l.topics.map((t) => String(t).slice(0, 60)).slice(0, 6)
        : [];
      await db.lesson.create({
        data: {
          bookId,
          index: idx,
          title: String(l.title || `#${idx + 1}`).slice(0, 120),
          pages: String(l.pages || "").slice(0, 20),
          topics: JSON.stringify(topics),
          summary: String(l.summary || "").slice(0, 600),
        },
      });
      idx++;
    }
    await db.book.update({ where: { id: bookId }, data: { status: "ready", error: null } });
  } catch (e) {
    const msg = String((e as Error)?.message || e).slice(0, 300);
    await db.book
      .update({ where: { id: bookId }, data: { status: "error", error: msg } })
      .catch(() => {});
  }
}
