import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = Number(id);
  const book = await db.book.findUnique({
    where: { id: bookId },
    include: {
      lessons: { orderBy: { index: "asc" } },
      pages: { orderBy: { number: "asc" }, select: { number: true, content: true } },
    },
  });
  if (!book) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({
    id: book.id,
    title: book.title,
    subject: book.subject,
    grade: book.grade,
    status: book.status,
    error: book.error,
    lessons: book.lessons.map((l) => ({
      id: l.id,
      index: l.index,
      title: l.title,
      pages: l.pages,
      topics: JSON.parse(l.topics || "[]"),
      summary: l.summary,
    })),
    pages: book.pages.map((p) => ({ number: p.number, preview: p.content.slice(0, 150) })),
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.book.delete({ where: { id: Number(id) } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
