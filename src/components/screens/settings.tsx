"use client";

import { useEffect, useState } from "react";
import { Save, Eye, EyeOff, Trash2, Info, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { gradeCodes, gradeLabel, makeT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsScreen() {
  const { lang, goBack, hydrate } = useApp();
  const currentGrade = useApp((s) => s.grade);
  const t = makeT(lang);
  const [apiKey, setApiKey] = useState("");
  const [apiBase, setApiBase] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        setApiKey("");
        setApiBase(s.apiBase || "");
        setModel(s.model || "gpt-4o-mini");
        setHasKey(!!s.apiKey);
      })
      .catch(() => {});
  }, []);

  const save = async (extra: Record<string, unknown> = {}) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        language: lang,
        grade: currentGrade,
        apiBase,
        model,
        ...extra,
      };
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const s = await res.json();
      setHasKey(!!s.apiKey);
      setApiKey("");
      hydrate({ language: s.language, grade: s.grade, onboarded: true });
      toast.success(t("saved"));
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  const testConn = async () => {
    setTesting(true);
    try {
      // Save current fields first so the test reflects what is on screen.
      await save();
      const r = await fetch("/api/settings/check", { method: "POST" });
      const d = (await r.json()) as { provider: string; ok: boolean; error?: string };
      if (d.provider === "demo") {
        toast.info(t("testDemo"));
      } else if (d.ok) {
        toast.success(t("testOk"));
      } else {
        toast.error(`${t("testFail")} ${d.error ?? ""}`.slice(0, 160));
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setTesting(false);
    }
  };

  const resetAll = async () => {
    await fetch("/api/settings", { method: "DELETE" }).catch(() => {});
    setConfirmReset(false);
    toast.success(t("resetDone"));
    hydrate({ language: "fa", grade: "7", onboarded: false });
    goBack();
  };

  return (
    <>
      <ScreenHeader title={t("setTitle")} onBack={goBack} />
      <div className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 space-y-4">
        {/* Language & grade */}
        <Card className="border">
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("languageLabel")}</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {(["fa", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => useApp.getState().setLang(l)}
                    className={cn(
                      "rounded-xl border-2 py-3 font-bold transition-all min-h-11",
                      lang === l
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {l === "fa" ? "فارسی" : "English"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("gradeLabel")}</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {gradeCodes.map((g) => (
                  <button
                    key={g}
                    onClick={() => useApp.setState({ grade: g })}
                    className={cn(
                      "rounded-xl border-2 py-2.5 text-xs font-bold transition-all min-h-11",
                      currentGrade === g
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {gradeLabel(g, lang)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI provider */}
        <Card className="border">
          <CardContent className="p-4 space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                {t("keyLabel")} {hasKey ? "(••••••••)" : ""}
              </label>
              <div className="relative mt-1.5">
                <Input
                  dir="ltr"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t("keyNewPh")}
                  className="text-left pe-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="toggle key"
                >
                  {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("baseUrlLabel")}</label>
              <Input
                dir="ltr"
                className="mt-1.5 text-left font-mono text-xs"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{t("modelLabel")}</label>
              <Input
                dir="ltr"
                className="mt-1.5 text-left font-mono text-xs"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
            </div>
            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-5">
              <Info className="size-3.5 shrink-0 mt-0.5" />
              {t("providerNote")}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full min-h-12" onClick={testConn} disabled={testing || saving}>
                <PlugZap className="size-4" />
                {testing ? t("testing") : t("testConn")}
              </Button>
              <Button className="w-full min-h-12" onClick={() => save()} disabled={saving || testing}>
                <Save className="size-4" />
                {t("saveSettings")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-200">
          <CardContent className="p-4 space-y-2.5">
            <h2 className="font-bold text-sm text-red-600">{t("dangerZone")}</h2>
            <Button variant="outline" className="w-full min-h-11 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmReset(true)}>
              <Trash2 className="size-4" />
              {t("resetAll")}
            </Button>
          </CardContent>
        </Card>

        <p className="text-[11px] text-muted-foreground text-center pb-2">{t("aboutText")}</p>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetAll")}</AlertDialogTitle>
            <AlertDialogDescription>{t("resetConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("back")}</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={resetAll}>
              {t("resetAll")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
