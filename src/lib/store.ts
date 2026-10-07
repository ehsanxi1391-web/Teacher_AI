"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";

export type View = "home" | "books" | "book" | "step" | "explain" | "tests" | "settings";

export interface ViewParams {
  bookId?: number;
  page?: number;
  topic?: string;
}

interface Snapshot {
  view: View;
  params: ViewParams;
}

interface AppState {
  view: View;
  params: ViewParams;
  stack: Snapshot[];
  lang: Lang;
  grade: string;
  onboarded: boolean;
  ready: boolean;
  navigate: (view: View, params?: ViewParams) => void;
  goBack: () => void;
  resetTo: (view: View) => void;
  hydrate: (s: { language: string; grade: string; onboarded: boolean }) => void;
  setLang: (l: Lang) => void;
}

export const useApp = create<AppState>((set, get) => ({
  view: "home",
  params: {},
  stack: [],
  lang: "fa",
  grade: "7",
  onboarded: false,
  ready: false,
  navigate: (view, params = {}) =>
    set((st) => ({ stack: [...st.stack.slice(-20), { view: st.view, params: st.params }], view, params })),
  goBack: () =>
    set((st) => {
      const prev = st.stack[st.stack.length - 1];
      if (!prev) return { view: "home" as View, params: {}, stack: [] };
      return { view: prev.view, params: prev.params, stack: st.stack.slice(0, -1) };
    }),
  resetTo: (view) => set({ view, params: {}, stack: [] }),
  hydrate: (s) =>
    set({
      lang: s.language === "en" ? "en" : "fa",
      grade: s.grade || "7",
      onboarded: !!s.onboarded,
      ready: true,
    }),
  setLang: (l) => set({ lang: l }),
}));
