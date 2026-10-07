import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiChat } from "@/lib/ai";
import { explainPrompt } from "@/lib/prompts";
import { findRelevantPages } from "@/lib/retrieval";
import type { Lang } from "@/lib/i18n";
import type { ChatMsg } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bookId = Number(body.bookId);
    const topic = String(body.topic || "").slice(0, 120);
    const message = typeof body.message === "string" ? body.message.slice(0, 2000) : "";
    const reset = !!body.reset;
    if (!topic) return NextResponse.json({ error: "TOPIC_REQUIRED" }, { status: 400 });

    const book = await db.book.findUnique({
      where: { id: bookId },
      include: { pages: true, lessons: { orderBy: { index: "asc" } } },
    });
    if (!book) return NextResponse.json({ error: "BOOK_NOT_FOUND" }, { status: 404 });

    const settings = await db.settings.findUnique({ where: { id: 1 } });
    const lang: Lang = settings?.language === "en" ? "en" : "fa";

    const key = `explain:${book.id}:${topic}`;
    if (reset) await db.chatThread.delete({ where: { id: key } }).catch(() => {});
    const thread = await db.chatThread.findUnique({ where: { id: key } });
    const history: ChatMsg[] = thread ? JSON.parse(thread.messages) : [];

    const relevant = await findRelevantPages(book.id, topic, 4);
    const context = relevant
      .map((p) => `[${lang === "en" ? "Page" : "صفحه"} ${p.number}]\n${p.content.slice(0, 3000)}`)
      .join("\n\n---\n\n");

    const sys = explainPrompt(lang, book.grade, book.title, topic, context.slice(0, 12000));

    let newMessages: ChatMsg[];
    if (history.length === 0) {
      const first =
        lang === "en"
          ? `Start explaining the topic "${topic}" based on the book, then ask me where I want to begin.`
          : `موضوع «${topic}» را بر اساس کتاب شروع کن و بگو از کجا بهتر است شروع کنیم.`;
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
