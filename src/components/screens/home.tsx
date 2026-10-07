"use client";

import { useEffect, useState } from "react";
import {
  ListOrdered,
  MessagesSquare,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LibraryBig,
  BadgeCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { gradeLabel, makeT } from "@/lib/i18n";
import type { BookDTO } from "@/lib/types";

interface TestListItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  createdAt: string;
}

export default function HomeScreen() {
  const { lang, grade, navigate } = useApp();
  const t = makeT(lang);
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [tests, setTests] = useState<TestListItem[]>([]);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then(setBooks)
      .catch(() => {});
    fetch("/api/tutor/test")
      .then((r) => r.json())
      .then(setTests)
      .catch(() => {});
  }, []);

  const Chevron = lang === "fa" ? ChevronLeft : ChevronRight;

  const features = [
    { view: "step" as const, icon: ListOrdered, title: t("featureStep"), desc: t("featureStepD") },
    { view: "explain" as const, icon: MessagesSquare, title: t("featureExplain"), desc: t("featureExplainD") },
    { view: "tests" as const, icon: FileQuestion, title: t("featureTest"), desc: t("featureTestD") },
  ];

  return (
    <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-6">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-primary to-emerald-800 text-primary-foreground p-5 shadow-lg shadow-primary/20">
        <p className="text-lg font-extrabold">{t("homeGreeting")}</p>
        <p className="text-sm opacity-90 mt-0.5">
          {t("homeHero")} · 🎓 {gradeLabel(grade, lang)}
        </p>
      </section>

      {/* Features */}
      <section aria-label="features" className="space-y-3">
        {features.map(({ view, icon: Icon, title, desc }) => (
          <button key={view} onClick={() => navigate(view)} className="block w-full text-start">
            <Card className="border hover:border-primary/50 hover:shadow-md transition-all">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="size-12 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-5 mt-0.5">{desc}</p>
                </div>
                <Chevron className="size-5 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      {/* Books */}
      <section aria-label="my books">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-bold text-sm flex items-center gap-1.5">
            <LibraryBig className="size-4 text-primary" />
            {t("myBooks")}
          </h2>
          <button onClick={() => navigate("books")} className="text-xs text-primary font-medium">
            {t("viewAll")}
          </button>
        </div>
        {books.length === 0 ? (
          <button onClick={() => navigate("books")} className="block w-full text-start">
            <div className="rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:border-primary/50 transition-colors">
              <BookOpen className="size-7 mx-auto mb-2 text-primary/60" />
              {t("addFirstBook")}
            </div>
          </button>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {books.slice(0, 8).map((b) => (
              <button
                key={b.id}
                onClick={() => navigate("book", { bookId: b.id })}
                className="shrink-0 w-40 text-start"
              >
                <Card className="border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-3.5 space-y-1.5">
                    <p className="font-bold text-xs line-clamp-2 min-h-8">{b.title}</p>
                    <p className="text-[11px] text-muted-foreground">{b.subject}</p>
                    {b.status === "ready" && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 gap-1">
                        <BadgeCheck className="size-3" /> {t("ready")}
                      </Badge>
                    )}
                    {b.status === "processing" && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 gap-1">
                        <Loader2 className="size-3 animate-spin" /> {t("processing")}
                      </Badge>
                    )}
                    {b.status === "error" && (
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0 gap-1">
                        <AlertTriangle className="size-3" /> {t("errorStatus")}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Recent tests */}
      {tests.length > 0 && (
        <section aria-label="recent tests">
          <h2 className="font-bold text-sm mb-2.5 flex items-center gap-1.5">
            <FileQuestion className="size-4 text-primary" />
            {t("recentTests")}
          </h2>
          <div className="space-y-2">
            {tests.slice(0, 3).map((test) => (
              <button
                key={test.id}
                onClick={() => navigate("tests")}
                className="block w-full text-start rounded-2xl border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
              >
                <p className="text-sm font-semibold line-clamp-1">{test.title || test.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {test.subject}
                  {test.topic ? ` · ${test.topic}` : ""}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
