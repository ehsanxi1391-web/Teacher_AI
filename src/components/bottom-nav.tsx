"use client";

import { Home, LibraryBig, ClipboardList, Settings2 } from "lucide-react";
import { useApp, type View } from "@/lib/store";
import { makeT, type DictKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items: { view: View; icon: typeof Home; key: DictKey }[] = [
  { view: "home", icon: Home, key: "navHome" },
  { view: "books", icon: LibraryBig, key: "navBooks" },
  { view: "tests", icon: ClipboardList, key: "navTests" },
  { view: "settings", icon: Settings2, key: "navSettings" },
];

function isActive(item: View, current: View): boolean {
  if (item === current) return true;
  if (item === "books" && current === "book") return true;
  return false;
}

export default function BottomNav() {
  const { view, navigate, lang } = useApp();
  const t = makeT(lang);
  return (
    <footer className="sticky bottom-0 z-30 mt-auto border-t bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <nav
        aria-label="Main navigation"
        className="max-w-lg mx-auto grid grid-cols-4 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.4rem)]"
      >
        {items.map(({ view: v, icon: Icon, key }) => {
          const active = isActive(v, view);
          return (
            <button
              key={v}
              onClick={() => navigate(v)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors min-h-11",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "drop-shadow-sm")} strokeWidth={active ? 2.4 : 1.8} />
              <span>{t(key)}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
}
