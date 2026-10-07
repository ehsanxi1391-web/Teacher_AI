"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import { useApp } from "@/lib/store";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  sub,
  onBack,
  right,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const lang = useApp((s) => s.lang);
  const BackIcon = lang === "fa" ? ArrowRight : ArrowLeft;
  return (
    <header className="sticky top-0 z-20 bg-background/85 backdrop-blur border-b">
      <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="back" className="shrink-0">
            <BackIcon className="size-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base truncate">{title}</h1>
          {sub && <p className="text-xs text-muted-foreground line-clamp-1">{sub}</p>}
        </div>
        {right}
      </div>
    </header>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`size-5 animate-spin text-primary ${className}`} />;
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-card border w-fit" dir="ltr">
      <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
      <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
      <span className="typing-dot size-2 rounded-full bg-primary inline-block" />
    </div>
  );
}

export function AiMarkdown({ text }: { text: string }) {
  return (
    <div className="md-body text-sm leading-7 break-words">
      <Markdown>{text}</Markdown>
    </div>
  );
}

export function FullLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Spinner className="size-7" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
