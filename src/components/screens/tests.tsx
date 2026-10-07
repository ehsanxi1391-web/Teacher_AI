"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Globe,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  MessageCircleQuestion,
  Trophy,
  RotateCcw,
  Plus,
  Check,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScreenHeader, FullLoader, AiMarkdown } from "@/components/shared";
import { useApp } from "@/lib/store";
import { makeT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BookDTO, TestDTO, TestQuestion } from "@/lib/types";

type Stage = "form" | "generating" | "run" | "result";

const SUBJECTS_FA = ["ریاضی", "علوم تجربی", "فارسی", "عربی", "دینی", "انگلیسی", "مطالعات اجتماعی"];
const SUBJECTS_EN = ["Math", "Science", "Language", "History", "Physics", "Chemistry", "English"];

interface TestListItem extends TestDTO {
  count: number;
}

export default function TestsScreen() {
  const { lang, grade, goBack } = useApp();
  const t = makeT(lang);
  const [stage, setStage] = useState<Stage>("form");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<"topic" | "midterm" | "final">("topic");
  const [topic, setTopic] = useState("");
  const [bookId, setBookId] = useState<string>("none");
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [test, setTest] = useState<TestDTO | null>(null);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [hint, setHint] = useState<Record<number, string>>({});
  const [hintLoading, setHintLoading] = useState(false);
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [past, setPast] = useState<TestListItem[]>([]);
  const Chevron = lang === "fa" ? ChevronLeft : ChevronRight;

  const loadPast = () =>
    fetch("/api/tutor/test")
      .then((r) => r.json())
      .then(setPast)
      .catch(() => {});

  useEffect(() => {
    loadPast();
    fetch("/api/books")
      .then((r) => r.json())
      .then((list: BookDTO[]) => setBooks(list.filter((b) => b.status === "ready")))
      .catch(() => {});
  }, []);

  const generate = async () => {
    if (!subject.trim() || (mode === "topic" && !topic.trim())) return;
    setStage("generating");
    try {
      const res = await fetch("/api/tutor/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject: subject.trim(),
          topic: mode === "topic" ? topic.trim() : "",
          mode,
          bookId: bookId !== "none" ? Number(bookId) : null,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      startTest(j);
      toast.success(t("testSaved"));
    } catch {
      toast.error(t("errorGeneric"));
      setStage("form");
    }
  };

  const startTest = (dto: TestDTO) => {
    setTest(dto);
    setAnswers((dto.data ?? []).map(() => null));
    setIdx(0);
    setHint({});
    setFeedback({});
    setStage("run");
  };

  const askHint = async (q: TestQuestion, i: number) => {
    if (hint[i] || hintLoading) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/tutor/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "hint", question: q.question, options: q.options ?? [] }),
      });
      const j = await res.json();
      if (res.ok) setHint((h) => ({ ...h, [i]: j.reply }));
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setHintLoading(false);
    }
  };

  const checkShort = async (q: TestQuestion, i: number) => {
    const ua = String(answers[i] ?? "").trim();
    if (!ua || feedback[i]) return;
    setHintLoading(true);
    try {
      const res = await fetch("/api/tutor/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "check",
          question: q.question,
          options: [],
          expected: typeof q.answer === "string" ? q.answer : "",
          userAnswer: ua,
        }),
      });
      const j = await res.json();
      if (res.ok) setFeedback((f) => ({ ...f, [i]: j.reply }));
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setHintLoading(false);
    }
  };

  const submit = () => {
    if (answers.some((a) => a === null || a === "")) {
      toast.error(t("answerFirst"));
      return;
    }
    setStage("result");
  };

  const mcqCount = (test?.data ?? []).filter((q) => q.type === "mcq").length;
  const mcqCorrect =
    test?.data?.filter((q, i) => q.type === "mcq" && q.answer === answers[i]).length ?? 0;

  /* ---------- Generating ---------- */
  if (stage === "generating") {
    return (
      <>
        <ScreenHeader title={t("testsTitle")} onBack={goBack} />
        <FullLoader label={t("generating")} />
        <p className="text-xs text-muted-foreground text-center -mt-8 flex items-center justify-center gap-1.5">
          <Globe className="size-3.5 animate-pulse text-primary" />
          {t("searchWeb")}
        </p>
      </>
    );
  }

  /* ---------- Runner ---------- */
  if (stage === "run" && test) {
    const q = test.data[idx];
    const answeredAll = answers.every((a) => a !== null && a !== "");
    return (
      <>
        <ScreenHeader title={test.title || t("testsTitle")} sub={`${test.subject} · ${t("question")} ${idx + 1} ${t("ofQ")} ${test.data.length}`} onBack={goBack} />
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-4">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((idx + 1) / test.data.length) * 100}%` }}
            />
          </div>

          <Card className="border-none shadow-md">
            <CardContent className="p-5 space-y-4">
              <p className="font-bold text-sm leading-7">{q.question}</p>

              {q.type === "mcq" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((a) => a.map((v, vi) => (vi === idx ? oi : v)))}
                      className={cn(
                        "w-full text-start rounded-2xl border-2 px-4 py-3 text-sm transition-all min-h-11",
                        answers[idx] === oi
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="inline-flex items-center justify-center size-6 rounded-full border text-xs font-bold me-2 shrink-0 align-middle">
                        {oi + 1}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "short" && (
                <div className="space-y-2">
                  <Textarea
                    value={String(answers[idx] ?? "")}
                    onChange={(e) => setAnswers((a) => a.map((v, vi) => (vi === idx ? e.target.value : v)))}
                    placeholder={t("shortAnswerPh")}
                    className="min-h-24"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkShort(q, idx)}
                    disabled={hintLoading || !String(answers[idx] ?? "").trim() || !!feedback[idx]}
                  >
                    <Check className="size-3.5 text-primary" />
                    {t("checkAnswer")}
                  </Button>
                  {feedback[idx] && (
                    <div className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3">
                      <p className="text-[11px] font-bold text-primary mb-1">{t("feedback")}</p>
                      <AiMarkdown text={feedback[idx]} />
                    </div>
                  )}
                </div>
              )}

              {/* Help */}
              <div>
                <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => askHint(q, idx)} disabled={hintLoading}>
                  <MessageCircleQuestion className="size-4" />
                  {t("needHelp")}
                </Button>
                {hintLoading && <p className="text-xs text-muted-foreground">{t("gettingHint")}</p>}
                {hint[idx] && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 mt-1">
                    <p className="text-[11px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                      <Lightbulb className="size-3.5" />
                      {t("hintLabel")}
                    </p>
                    <AiMarkdown text={hint[idx]} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
              <Chevron className="size-4 rotate-180" />
            </Button>
            {idx < test.data.length - 1 ? (
              <Button className="flex-1 min-h-12" onClick={() => setIdx((i) => i + 1)}>
                {t("next")}
                <Chevron className="size-4" />
              </Button>
            ) : (
              <Button className="flex-1 min-h-12" onClick={submit} disabled={!answeredAll}>
                <Trophy className="size-4" />
                {t("submit")}
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ---------- Result ---------- */
  if (stage === "result" && test) {
    const pct = mcqCount > 0 ? Math.round((mcqCorrect / mcqCount) * 100) : 0;
    return (
      <>
        <ScreenHeader title={t("resultsTitle")} onBack={goBack} />
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground">
            <CardContent className="p-6 text-center space-y-1">
              <Trophy className="size-9 mx-auto" />
              <p className="text-sm opacity-90">{t("scoreLabel")}</p>
              <p className="text-4xl font-extrabold">
                {mcqCorrect} / {mcqCount}
              </p>
              <p className="text-sm opacity-90">{pct}%</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {test.data.map((q, i) => {
              const userAns = answers[i];
              const isMcq = q.type === "mcq";
              const correct = isMcq ? q.answer === userAns : null;
              return (
                <Card key={i} className="border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start gap-2">
                      {correct === true && <Check className="size-5 text-primary shrink-0 mt-0.5" />}
                      {correct === false && <X className="size-5 text-red-500 shrink-0 mt-0.5" />}
                      {correct === null && <Badge variant="outline" className="shrink-0">{t("yourAnswer")}</Badge>}
                      <p className="text-sm font-semibold leading-6">{q.question}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("yourAnswer")}:{" "}
                      <span className={cn("font-bold", correct === false && "text-red-500")}>
                        {isMcq && q.options ? q.options[Number(userAns)] : String(userAns)}
                      </span>
                    </p>
                    {isMcq && q.options ? (
                      <p className="text-xs">
                        {t("correctAns")}:{" "}
                        <span className="font-bold text-primary">{q.options[Number(q.answer)]}</span>
                      </p>
                    ) : (
                      <p className="text-xs">
                        {t("correctAns")}: <span className="font-bold text-primary">{String(q.answer)}</span>
                      </p>
                    )}
                    {q.explanation && (
                      <div className="rounded-xl bg-muted/60 px-3.5 py-2.5">
                        <AiMarkdown text={q.explanation} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 min-h-12"
              onClick={() => {
                setAnswers(test.data.map(() => null));
                setIdx(0);
                setHint({});
                setFeedback({});
                setStage("run");
              }}
            >
              <RotateCcw className="size-4" />
              {t("retake")}
            </Button>
            <Button className="flex-1 min-h-12" onClick={() => setStage("form")}>
              <Plus className="size-4" />
              {t("newTest")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  /* ---------- Form ---------- */
  const chips = lang === "fa" ? SUBJECTS_FA : SUBJECTS_EN;
  return (
    <>
      <ScreenHeader title={t("testsTitle")} sub={t("testsSub")} onBack={goBack} />
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-5">
        <Card className="border-none shadow-md">
          <CardContent className="p-4 space-y-3.5">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              {t("generate")}
            </h2>

            {/* Subject */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("subjectLabel")}</label>
              <Input className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subjectPh")} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {chips.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSubject(s)}
                    className={cn(
                      "text-xs rounded-full border px-3 py-1.5 transition-colors",
                      subject === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("examMode")}</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {([
                  { v: "topic", label: t("modeTopic") },
                  { v: "midterm", label: t("modeMidterm") },
                  { v: "final", label: t("modeFinal") },
                ] as const).map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => setMode(v)}
                    className={cn(
                      "rounded-xl border-2 px-2 py-2.5 text-[11px] font-bold transition-all min-h-11",
                      mode === v
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            {mode === "topic" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{t("topicLabel")}</label>
                <Input className="mt-1.5" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("topicPh")} />
              </div>
            )}

            {/* Optional book context */}
            {books.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <FileQuestion className="size-3.5" />
                  {t("useBookContext")} ({t("optional")})
                </label>
                <Select value={bookId} onValueChange={setBookId}>
                  <SelectTrigger className="mt-1.5 min-h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {books.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full min-h-12 text-base"
              onClick={generate}
              disabled={!subject.trim() || (mode === "topic" && !topic.trim())}
            >
              <Sparkles className="size-4" />
              {t("generate")}
            </Button>
          </CardContent>
        </Card>

        {past.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <History className="size-4 text-primary" />
              {t("recentTests")}
            </h2>
            {past.map((p) => (
              <button
                key={p.id}
                onClick={() => startTest({ ...p, data: p.data })}
                className="block w-full text-start rounded-2xl border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <p className="text-sm font-semibold line-clamp-1">{p.title || p.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {p.subject}
                  {p.topic ? ` · ${p.topic}` : ""} · {p.count} {t("question")}
                </p>
              </button>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
