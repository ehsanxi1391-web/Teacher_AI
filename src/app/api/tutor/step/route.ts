import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiChat } from "@/lib/ai";
import { stepPrompt } from "@/lib/prompts";
import type { Lang } from "@/lib/i18n";
import type { ChatMsg } from "@/lib/ai";

/** Finds the lesson whose page-range covers the given page. */
function lessonForPage(lessons: { title: string; pages: string }[], page: number): string {
  for (const l of lessons) {
    const m = l.pages.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (page >= Math.min(a, b) && page <= Math.max(a, b)) return `${l.title} (${l.pages})`;
    }
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bookId = Number(body.bookId);
    const pageNo = Number(body.page);
    const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "";
    const reset = !!body.reset;

    const book = await db.book.findUnique({
      where: { id: bookId },
      include: { pages: true, lessons: { orderBy: { index: "asc" } } },
    });
    if (!book) return NextResponse.json({ error: "BOOK_NOT_FOUND" }, { status: 404 });
    const page = book.pages.find((p) => p.number === pageNo) ?? book.pages[0];
    if (!page) return NextResponse.json({ error: "PAGE_NOT_FOUND" }, { status: 404 });

    const settings = await db.settings.findUnique({ where: { id: 1 } });
    const lang: Lang = settings?.language === "en" ? "en" : "fa";

    const key = `step:${book.id}:${page.number}`;
    if (reset) await db.chatThread.delete({ where: { id: key } }).catch(() => {});
    const thread = await db.chatThread.findUnique({ where: { id: key } });
    const history: ChatMsg[] = thread ? JSON.parse(thread.messages) : [];

    const sys = stepPrompt(
      lang,
      book.grade,
      book.title,
      page.number,
      page.content.slice(0, 6000),
      lessonForPage(book.lessons, page.number),
    );

    let newMessages: ChatMsg[];
    if (history.length === 0) {
      const first =
        lang === "en"
          ? `Please explain page ${page.number} step by step in a clear and useful way.`
          : `لطفاً صفحه ${page.number} را گام‌به‌گام، کامل و مفید توضیح بده.`;
      const reply = await aiChat([
        { role: "system", content: sys },
        { role: "user", content: first },
      ]);
      newMessages = [
        { role: "user", content: first },
        { role: "assistant", content: reply },
      ];
    } else if (message) {
      const reply = await aiChat([
        { role: "system", content: sys },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ]);
      newMessages = [...history, { role: "user", content: message }, { role: "assistant", content: reply }];
    } else {
      // Resume: return the stored conversation without calling the AI.
      newMessages = history;
    }

    await db.chatThread.upsert({
      where: { id: key },
      update: { messages: JSON.stringify(newMessages), updatedAt: new Date() },
      create: { id: key, bookId: book.id, messages: JSON.stringify(newMessages) },
    });

    return NextResponse.json({ messages: newMessages });
  } catch (e) {
    return NextResponse.json(
      { error: String((e as Error)?.message || e).slice(0, 300) },
      { status: 500 },
    );
  }
}
