import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractPages } from "@/lib/parse";
import { analyzeBook } from "@/lib/analyze";

export const maxDuration = 300;

export async function GET() {
  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true, lessons: true } } },
  });
  return NextResponse.json(
    books.map(({ _count, ...b }) => ({
      ...b,
      pagesCount: _count.pages,
      lessonsCount: _count.lessons,
    })),
  );
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const file = form.get("file");
  const title = String(form.get("title") || "").trim();
  const subject = String(form.get("subject") || "").trim();
  const settings = await db.settings.findUnique({ where: { id: 1 } });
  const grade = String(form.get("grade") || settings?.grade || "7");

  if (!(file instanceof File) || !title || !subject) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (file.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let pages;
  try {
    pages = await extractPages(file.name, buf);
  } catch {
    return NextResponse.json({ error: "PARSE_FAILED" }, { status: 400 });
  }
  if (pages.length === 0) {
    return NextResponse.json({ error: "NO_TEXT" }, { status: 400 });
  }

  const book = await db.book.create({
    data: { title: title.slice(0, 120), subject: subject.slice(0, 60), grade, status: "processing" },
  });
  await db.page.createMany({
    data: pages.map((p) => ({ bookId: book.id, number: p.number, content: p.content })),
  });

  // Fire-and-forget analysis (long-running node server).
  analyzeBook(book.id).catch(() => {});

  return NextResponse.json(book, { status: 201 });
}
