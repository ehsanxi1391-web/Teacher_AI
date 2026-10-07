import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const upsert = (data: Record<string, unknown>) =>
  db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });

async function ensure() {
  return db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

export async function GET() {
  return NextResponse.json(await ensure());
}

export async function PUT(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  for (const k of ["apiKey", "apiBase", "model", "language", "grade"] as const) {
    if (typeof b[k] === "string") data[k] = b[k];
  }
  if (typeof b.onboarded === "boolean") data.onboarded = b.onboarded;
  const s = await upsert(data);
  return NextResponse.json(s);
}

export async function DELETE() {
  await db.book.deleteMany({});
  await db.chatThread.deleteMany({});
  await db.generatedTest.deleteMany({});
  await upsert({ onboarded: false });
  return NextResponse.json({ ok: true });
}
