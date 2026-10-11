"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";

/** Language toggle using the system Button everywhere for full consistency.
    - sm:+  outline pill size sm (same rhythm as Contact)
    - < sm  outline pill size compact (tighter padding for the tight mobile row)
    - Globe icon carries the "this is a language control" affordance; the ISO
      code carries the current state. gap-1.5 keeps the icon from widening the
      tight mobile row (base Button gap is 2). */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const isEs = lang === "es";
  const code = isEs ? "ES" : "EN";
  // WCAG 2.5.3 Label in Name: the accessible name must contain the visible label.
  const label = `${code} — ${isEs ? t("nav.aria.switchToEn") : t("nav.aria.switchToEs")}`;

  const content = (
    <>
      <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {code}
    </>
  );

  return (
    <>
      {/* Desktop / tablet */}
      <Button
        type="button"
        variant="outline"
        shape="pill"
        size="sm"
        onClick={() => setLang(isEs ? "en" : "es")}
        aria-label={label}
        title={label}
        className="hidden sm:inline-flex shrink-0 gap-1.5 hover:border-purple-accent/15 border-transparent"
      >
        {content}
      </Button>
      {/* Mobile: same button, compact size */}
      <Button
        type="button"
        variant="outline"
        shape="pill"
        size="compact"
        onClick={() => setLang(isEs ? "en" : "es")}
        aria-label={label}
        title={label}
        className="inline-flex shrink-0 sm:hidden gap-1.5 hover:border-purple-accent/15 border-transparent"
      >
        {content}
      </Button>
    </>
  );
}
