"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizontal, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScreenHeader, TypingDots, AiMarkdown, FullLoader } from "@/components/shared";
import { useApp } from "@/lib/store";
import { makeT } from "@/lib/i18n";
import { toast } from "sonner";
import type { BookDTO, BookDetailDTO, ChatMsg } from "@/lib/types";

export default function TutorChatScreen({ mode }: { mode: "step" | "explain" }) {
  const { params, lang, goBack } = useApp();
  const t = makeT(lang);
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [bookId, setBookId] = useState<number | null>(params.bookId ?? null);
  const [detail, setDetail] = useState<BookDetailDTO | null>(null);
  const [page, setPage] = useState<number | null>(params.page ?? null);
  const [topic, setTopic] = useState<string>(params.topic ?? "");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [booting, setBooting] = useState(false);
  const bootedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const ready = mode === "step" ? !!bookId && page != null : !!bookId && !!topic.trim();

  // Load ready books for the picker
  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((list: BookDTO[]) => setBooks(list.filter((b) => b.status === "ready")))
      .catch(() => {});
  }, []);

  // Load book detail (page list / topic list)
  useEffect(() => {
    if (!bookId) return;
    fetch(`/api/books/${bookId}`)
      .then((r) => r.json())
      .then(setDetail)
      .catch(() => {});
  }, [bookId]);

  // Kick the initial AI explanation once selection is complete
  useEffect(() => {
    if (!ready || bootedRef.current) return;
    bootedRef.current = true;
    setBooting(true);
    call({ message: "" })
      .finally(() => setBooting(false));
  }, [ready]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, booting]);

  const call = useCallback(
    async (opts: { message?: string; reset?: boolean }) => {
      try {
        const body: Record<string, unknown> = { bookId, message: opts.message ?? "" };
        if (mode === "step") body.page = page;
        else body.topic = topic.trim();
        if (opts.reset) body.reset = true;
        const res = await fetch(`/api/tutor/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "error");
        setMessages(j.messages);
        return j;
      } catch {
        toast.error(t("errorGeneric"));
        return null;
      }
    },
    [bookId, page, topic, mode, t],
  );

  const send = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: msg }]);
    await call({ message: msg });
    setSending(false);
  };

  const clearChat = async () => {
    if (sending || booting) return;
    setBooting(true);
    bootedRef.current = true;
    await call({ reset: true });
    setBooting(false);
  };

  const Chevron = lang === "fa" ? ChevronLeft : ChevronRight;
  const allTopics = (detail?.lessons ?? []).flatMap((l) => l.topics).slice(0, 14);

  /* ---------- Book picker ---------- */
  if (!bookId) {
    return (
      <>
        <ScreenHeader title={mode === "step" ? t("stepTitle") : t("explainTitle")} sub={mode === "step" ? t("stepSub") : t("explainSub")} onBack={goBack} />
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5">
          {books.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-sm text-muted-foreground space-y-2">
                <p>{t("noReadyBooks")}</p>
                <Button variant="outline" size="sm" onClick={() => goBack()}>
                  {t("back")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="font-bold text-sm">{t("selectBook")}</h2>
              {books.map((b) => (
                <button key={b.id} onClick={() => setBookId(b.id)} className="block w-full text-start">
                  <Card className="border hover:border-primary/50 transition-colors">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        📕
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm line-clamp-1">{b.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.subject} · {b.pagesCount} {t("pagesCount")}
                        </p>
                      </div>
                      <Chevron className="size-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  /* ---------- Page picker (step mode) ---------- */
  if (mode === "step" && page == null) {
    return (
      <>
        <ScreenHeader title={t("choosePage")} sub={detail?.title} onBack={goBack} />
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5">
          {!detail ? (
            <FullLoader label={t("loading")} />
          ) : (
            <div className="space-y-3">
              <Select onValueChange={(v) => setPage(Number(v))}>
                <SelectTrigger className="min-h-12 w-full">
                  <SelectValue placeholder={t("pickPage")} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {detail.pages.map((p) => (
                    <SelectItem key={p.number} value={String(p.number)}>
                      {t("showPage")} {p.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{detail.pages.length} {t("pagesCount")}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ---------- Topic picker (explain mode) ---------- */
  if (mode === "explain" && !topic.trim()) {
    return (
      <>
        <ScreenHeader title={t("chooseTopic")} sub={detail?.title} onBack={goBack} />
        <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 space-y-4">
          {!detail ? (
            <FullLoader label={t("loading")} />
          ) : (
            <>
              {allTopics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((topicItem) => (
                    <button
                      key={topicItem}
                      onClick={() => setTopic(topicItem)}
                      className="text-xs rounded-full border border-primary/30 text-primary px-3.5 py-2 hover:bg-primary/5 transition-colors"
                    >
                      {topicItem}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={t("customTopicPh")}
                  onKeyDown={(e) => e.key === "Enter" && customTopic.trim() && setTopic(customTopic.trim())}
                />
                <Button onClick={() => customTopic.trim() && setTopic(customTopic.trim())} disabled={!customTopic.trim()}>
                  <Chevron className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  /* ---------- Chat ---------- */
  const subtitle =
    mode === "step"
      ? `${detail?.title ?? ""} · ${t("showPage")} ${page}`
      : `${detail?.title ?? ""} · ${topic}`;

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-4.4rem)] min-h-0">
      <ScreenHeader
        title={mode === "step" ? t("stepTitle") : t("explainTitle")}
        sub={subtitle}
        onBack={goBack}
        right={
          <Button variant="ghost" size="icon" onClick={clearChat} aria-label={t("clearChat")} title={t("clearChat")}>
            <RotateCcw className="size-4" />
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-start gap-2 rounded-2xl bg-primary/5 border border-primary/20 px-3.5 py-2.5 mb-2">
          <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] leading-5 text-primary">{t("aiNote")}</p>
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="max-w-[85%] ms-auto bg-primary text-primary-foreground text-sm leading-6 rounded-2xl rounded-ee-md px-4 py-2.5 whitespace-pre-wrap"
            >
              {m.content}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[95%] me-auto bg-card border rounded-2xl rounded-es-md px-4 py-3 shadow-sm"
            >
              <AiMarkdown text={m.content} />
            </div>
          ),
        )}

        {(booting || sending) && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      <div className="border-t bg-background/95 backdrop-blur p-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={mode === "step" ? t("chatPhStep") : t("chatPhExplain")}
            className="min-h-11"
            disabled={sending || booting}
          />
          <Button onClick={send} disabled={!input.trim() || sending || booting} className="min-h-11 px-4">
            <SendHorizontal className="size-4 rtl:-scale-x-100" />
          </Button>
        </div>
      </div>
    </div>
  );
}
