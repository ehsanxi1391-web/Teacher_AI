"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ListOrdered,
  MessagesSquare,
  Loader2,
  AlertTriangle,
  BookOpen,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScreenHeader, FullLoader } from "@/components/shared";
import { useApp } from "@/lib/store";
import { makeT } from "@/lib/i18n";
import type { BookDetailDTO } from "@/lib/types";

function startPageOf(pages: string): number | null {
  const m = pages.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export default function BookDetailScreen() {
  const { params, lang, goBack, navigate } = useApp();
  const t = makeT(lang);
  const bookId = params.bookId;
  const [book, setBook] = useState<BookDetailDTO | null>(null);
  const [selPage, setSelPage] = useState<string>("");

  const load = useCallback(() => {
    if (!bookId) return;
    fetch(`/api/books/${bookId}`)
      .then((r) => r.json())
      .then(setBook)
      .catch(() => {});
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (book?.status !== "processing") return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [book, load]);

  if (!bookId) {
    return (
      <>
        <ScreenHeader title={t("notFound")} onBack={goBack} />
        <FullLoader label={t("notFound")} />
      </>
    );
  }
  if (!book) {
    return (
      <>
        <ScreenHeader title={t("loading")} onBack={goBack} />
        <FullLoader label={t("loading")} />
      </>
    );
  }

  const preview = book.pages.find((p) => String(p.number) === selPage);

  return (
    <>
      <ScreenHeader title={book.title} sub={`${book.subject} · 🎓 ${book.grade}`} onBack={goBack} />
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-5">
        {book.status === "processing" && (
          <Card className="border-none shadow-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
              <p className="font-bold">{t("analyzing")}</p>
              <div className="flex justify-center gap-1.5" dir="ltr">
                <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
                <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
                <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
              </div>
            </CardContent>
          </Card>
        )}

        {book.status === "error" && (
          <Card className="border-red-200">
            <CardContent className="p-6 text-center space-y-3">
              <AlertTriangle className="size-10 mx-auto text-red-500" />
              <p className="font-bold text-red-600">{t("analysisFail")}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {book.error}
              </p>
            </CardContent>
          </Card>
        )}

        {book.status === "ready" && (
          <>
            {/* Lessons */}
            <section className="space-y-3">
              <h2 className="font-bold text-sm flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" />
                {t("bookLessons")}
              </h2>
              {book.lessons.map((l) => (
                <Card key={l.id} className="border">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="size-7 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {l.index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{l.title}</p>
                        {l.summary && (
                          <p className="text-xs text-muted-foreground leading-5 mt-1">{l.summary}</p>
                        )}
                        {l.pages && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            📄 {t("lessonPages")}: {l.pages}
                          </p>
                        )}
                      </div>
                    </div>
                    {l.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {l.topics.map((topic) => (
                          <button key={topic} onClick={() => navigate("explain", { bookId, topic })}>
                            <Badge
                              variant="outline"
                              className="text-[11px] font-normal border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                            >
                              {topic}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1 min-h-10"
                        onClick={() =>
                          navigate("step", {
                            bookId,
                            page: startPageOf(l.pages) ?? book.pages[0]?.number ?? 1,
                          })
                        }
                      >
                        <ListOrdered className="size-4" />
                        {t("featureStep")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-h-10"
                        onClick={() =>
                          navigate("explain", { bookId, topic: l.topics[0] || l.title })
                        }
                      >
                        <MessagesSquare className="size-4" />
                        {t("explainTopic")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Page picker */}
            <section className="space-y-2.5">
              <h2 className="font-bold text-sm flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                {t("bookPages")}
              </h2>
              <Select value={selPage} onValueChange={setSelPage}>
                <SelectTrigger className="min-h-12 w-full">
                  <SelectValue placeholder={t("pickPage")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {book.pages.map((p) => (
                    <SelectItem key={p.number} value={String(p.number)}>
                      {t("showPage")} {p.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preview && (
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-[11px] font-bold text-muted-foreground mb-1.5">{t("pagePreview")}</p>
                  <p className="text-xs leading-6 line-clamp-4">{preview.preview}…</p>
                </div>
              )}
              <Button
                className="w-full min-h-12"
                disabled={!selPage}
                onClick={() => navigate("step", { bookId, page: Number(selPage) })}
              >
                <ListOrdered className="size-4" />
                {t("startStep")}
              </Button>
            </section>
          </>
        )}
      </div>
    </>
  );
}
