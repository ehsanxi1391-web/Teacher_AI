import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzeBook } from "@/lib/analyze";
import { SAMPLE_BOOK_SUBJECT, SAMPLE_BOOK_TITLE, SAMPLE_PAGES } from "@/lib/sample-book";

export const maxDuration = 300;

export async function POST() {
  const settings = await db.settings.findUnique({ where: { id: 1 } });
  const grade = settings?.grade || "7";
  const book = await db.book.create({
    data: { title: SAMPLE_BOOK_TITLE, subject: SAMPLE_BOOK_SUBJECT, grade, status: "processing" },
  });
  await db.page.createMany({
    data: SAMPLE_PAGES.map((p) => ({ bookId: book.id, number: p.number, content: p.content })),
  });
  analyzeBook(book.id).catch(() => {});
  return NextResponse.json(book, { status: 201 });
}
