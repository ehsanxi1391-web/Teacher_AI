"use client";

import { useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { useApp } from "@/lib/store";
import { makeT } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import BottomNav from "@/components/bottom-nav";
import OnboardingScreen from "@/components/screens/onboarding";
import HomeScreen from "@/components/screens/home";
import BooksScreen from "@/components/screens/books";
import BookDetailScreen from "@/components/screens/book-detail";
import TutorChatScreen from "@/components/screens/tutor-chat";
import TestsScreen from "@/components/screens/tests";
import SettingsScreen from "@/components/screens/settings";

export default function AppRoot() {
  const { view, ready, lang, hydrate } = useApp();
  const onboarded = useApp((s) => s.onboarded);
  const t = makeT(lang);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) =>
        hydrate({ language: s.language ?? "fa", grade: s.grade ?? "7", onboarded: !!s.onboarded }),
      )
      .catch(() => hydrate({ language: "fa", grade: "7", onboarded: false }));
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  if (!ready) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background">
        <div className="size-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
          <GraduationCap className="size-9" />
        </div>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <>
        <OnboardingScreen />
        <Toaster position="top-center" richColors closeButton />
      </>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <main className="flex-1 flex flex-col">
        {view === "home" && <HomeScreen />}
        {view === "books" && <BooksScreen />}
        {view === "book" && <BookDetailScreen />}
        {view === "step" && <TutorChatScreen mode="step" />}
        {view === "explain" && <TutorChatScreen mode="explain" />}
        {view === "tests" && <TestsScreen />}
        {view === "settings" && <SettingsScreen />}
      </main>
      <BottomNav />
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
