import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiChat } from "@/lib/ai";
import { helpPrompt } from "@/lib/prompts";
import type { Lang } from "@/lib/i18n";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await db.settings.findUnique({ where: { id: 1 } });
    const lang: Lang = settings?.language === "en" ? "en" : "fa";

    const question = String(body.question || "").slice(0, 800);
    const options = Array.isArray(body.options) ? body.options.map((o: unknown) => String(o)) : [];
    const expected = String(body.expected ?? "").slice(0, 400);
    const userAnswer = String(body.userAnswer ?? "").slice(0, 400);
    const mode: "hint" | "check" | "explain" = ["hint", "check", "explain"].includes(body.mode)
      ? body.mode
      : "hint";
    if (!question) return NextResponse.json({ error: "QUESTION_REQUIRED" }, { status: 400 });

    const reply = await aiChat([
      { role: "system", content: helpPrompt(lang, mode, question, options, expected, userAnswer) },
      { role: "user", content: lang === "en" ? "Help me, please." : "لطفاً کمکم کن." },
    ]);

    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { error: String((e as Error)?.message || e).slice(0, 300) },
      { status: 500 },
    );
  }
}
