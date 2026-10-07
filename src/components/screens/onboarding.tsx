"use client";

import { useState } from "react";
import { GraduationCap, KeyRound, Sparkles, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { gradeCodes, gradeLabel, makeT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function OnboardingScreen() {
  const { lang, setLang, hydrate, resetTo } = useApp();
  const currentGrade = useApp((s) => s.grade);
  const t = makeT(lang);
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const setGradeCode = (g: string) => {
    useApp.setState({ grade: g });
  };

  const finish = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, grade: currentGrade, apiKey, onboarded: true }),
      });
      const s = await res.json();
      hydrate({ language: s.language, grade: s.grade, onboarded: true });
      resetTo("home");
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <main className="flex-1 max-w-lg w-full mx-auto px-5 py-8 flex flex-col">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-2">
          <div className="size-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="size-9" />
          </div>
          <h1 className="text-xl font-extrabold">{t("onbTitle")}</h1>
          <p className="text-sm text-muted-foreground text-center max-w-xs">{t("onbSub")}</p>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-5 py-6">
          {step === 0 && (
            <Card className="border-none shadow-md">
              <CardContent className="p-5 space-y-5">
                <h2 className="font-bold">{t("onbLangTitle")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["fa", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-center font-bold text-lg transition-all min-h-12",
                        lang === l
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {l === "fa" ? "فارسی" : "English"}
                      {lang === l && <Check className="size-4 inline-block ms-1.5 -mt-1" />}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <KeyRound className="size-4 text-primary" />
                    {t("onbKeyTitle")}
                    <span className="text-xs text-muted-foreground font-normal">({t("optional")})</span>
                  </label>
                  <div className="relative">
                    <Input
                      dir="ltr"
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t("onbKeyPh")}
                      className="text-left pe-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      aria-label="toggle key visibility"
                    >
                      {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-5">{t("onbKeyDesc")}</p>
                  {!apiKey.trim() && (
                    <p className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Sparkles className="size-3.5" />
                      {t("onbDemoBadge")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card className="border-none shadow-md">
              <CardContent className="p-5 space-y-4">
                <h2 className="font-bold">{t("onbGradeTitle")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {gradeCodes.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGradeCode(g)}
                      className={cn(
                        "rounded-2xl border-2 py-4 px-3 font-bold transition-all min-h-12",
                        currentGrade === g
                          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                          : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {gradeLabel(g, lang)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-none shadow-md">
              <CardContent className="p-6 space-y-4 text-center">
                <div className="size-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="size-8" />
                </div>
                <h2 className="font-bold text-lg">{t("onbDoneTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("onbDoneSub")}</p>
                <div className="rounded-2xl bg-muted/60 p-4 text-sm space-y-1.5 text-start">
                  <p>
                    🌐 {t("languageLabel")}: <b>{lang === "fa" ? "فارسی" : "English"}</b>
                  </p>
                  <p>
                    🎓 {t("gradeLabel")}: <b>{gradeLabel(currentGrade, lang)}</b>
                  </p>
                  <p>
                    🤖 {t("keyLabel")}: <b>{apiKey.trim() ? "••••••••" : "AI Demo"}</b>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex gap-3 pb-4">
          {step > 0 && (
            <Button variant="outline" className="flex-1 min-h-12" onClick={() => setStep(step - 1)}>
              {t("back")}
            </Button>
          )}
          {step < 2 ? (
            <Button className="flex-[2] min-h-12 text-base" onClick={() => setStep(step + 1)}>
              {t("next")}
            </Button>
          ) : (
            <Button className="flex-[2] min-h-12 text-base" onClick={finish} disabled={saving}>
              {saving ? t("loading") : t("finish")}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
