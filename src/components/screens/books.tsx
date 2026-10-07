"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, BookPlus, Sparkles, FileText, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScreenHeader } from "@/components/shared";
import { useApp } from "@/lib/store";
import { makeT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BookDTO } from "@/lib/types";

const SUBJECTS_FA = ["ریاضی", "علوم تجربی", "فارسی", "عربی", "دینی", "انگلیسی", "مطالعات اجتماعی", "کار و فناوری"];
const SUBJECTS_EN = ["Math", "Science", "Language", "History", "Geography", "Physics", "Chemistry", "English"];

export default function BooksScreen() {
  const { lang, grade, goBack } = useApp();
  const t = makeT(lang);
  const [books, setBooks] = useState<BookDTO[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then(setBooks)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while any book is being analyzed
  useEffect(() => {
    if (!books.some((b) => b.status === "processing")) return;
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [books, load]);

  const upload = async () => {
    if (!file || !title.trim() || !subject.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title.trim());
      fd.append("subject", subject.trim());
      fd.append("grade", grade);
      const res = await fetch("/api/books", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error === "PARSE_FAILED" ? t("parseFail") : t("uploadFail"));
        return;
      }
      toast.success(t("uploadOk"));
      setTitle("");
      setSubject("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch {
      toast.error(t("uploadFail"));
    } finally {
      setUploading(false);
    }
  };

  const loadSample = async () => {
    setLoadingSample(true);
    try {
      await fetch("/api/books/sample", { method: "POST" });
      toast.success(t("uploadOk"));
      load();
    } catch {
      toast.error(t("uploadFail"));
    } finally {
      setLoadingSample(false);
    }
  };

  const removeBook = async () => {
    if (deleteId == null) return;
    await fetch(`/api/books/${deleteId}`, { method: "DELETE" }).catch(() => {});
    setDeleteId(null);
    toast.success(t("bookDeleted"));
    load();
  };

  const chips = lang === "fa" ? SUBJECTS_FA : SUBJECTS_EN;
  const canUpload = !!file && !!title.trim() && !!subject.trim() && !uploading;

  return (
    <>
      <ScreenHeader title={t("booksTitle")} sub={t("booksSub")} onBack={goBack} />
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-5">
        {/* Upload card */}
        <Card className="border-none shadow-md">
          <CardContent className="p-4 space-y-3.5">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <BookPlus className="size-4 text-primary" />
              {t("newBook")}
            </h2>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("bookTitlePh")} />
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("subjectPh")} />
            <div className="flex flex-wrap gap-1.5">
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

            <label
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition-colors",
                file ? "border-primary/60 bg-primary/5" : "border-border hover:border-primary/40",
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,text/plain,application/pdf"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <FileText className="size-6 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {file ? file.name : t("chooseFile")}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            </label>

            <Button className="w-full min-h-12" onClick={upload} disabled={!canUpload}>
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("uploading")}
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  {t("uploadBtn")}
                </>
              )}
            </Button>

            <div className="rounded-2xl bg-muted/50 p-3.5 space-y-2">
              <p className="text-xs text-muted-foreground">{t("sampleDesc")}</p>
              <Button variant="outline" className="w-full min-h-10" onClick={loadSample} disabled={loadingSample}>
                {loadingSample ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4 text-primary" />}
                {t("sampleBtn")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-3">
          {books.map((b) => (
            <Card key={b.id} className="border">
              <CardContent className="flex items-center gap-3 p-4">
                <button onClick={() => useApp.getState().navigate("book", { bookId: b.id })} className="flex-1 min-w-0 text-start">
                  <p className="font-bold text-sm line-clamp-1">{b.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.subject} · {b.pagesCount ?? 0} {t("pagesCount")} · {b.lessonsCount ?? 0} {t("lessonsCount")}
                  </p>
                  <div className="mt-1.5">
                    {b.status === "ready" && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0">{t("ready")}</Badge>
                    )}
                    {b.status === "processing" && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 gap-1">
                        <Loader2 className="size-3 animate-spin" /> {t("analyzing")}
                      </Badge>
                    )}
                    {b.status === "error" && (
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-0">{t("analysisFail")}</Badge>
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => setDeleteId(b.id)}
                  aria-label={t("deleteBook")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteId != null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteBook")}</AlertDialogTitle>
            <AlertDialogDescription>{t("resetConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("back")}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={removeBook}>
              {t("deleteBook")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
