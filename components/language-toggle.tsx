"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Language toggle using the system Button everywhere for full consistency.
    - sm:+  outline pill size sm (same rhythm as Contact)
    - < sm  outline pill size compact (tighter padding for the tight mobile row) */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const isEs = lang === "es";
  const label = isEs ? t("nav.aria.switchToEn") : t("nav.aria.switchToEs");

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
        className="hidden sm:inline-flex shrink-0 hover:border-purple-accent/15 border-purple-accent/15"
      >
        {isEs ? "ES" : "EN"}
      </Button>
      {/* Mobile: same button, compact size */}
      <Button
        type="button"
        variant="outline"
        shape="pill"
        size="compact"
        onClick={() => setLang(isEs ? "en" : "es")}
        aria-label={label}
        className="inline-flex shrink-0 sm:hidden hover:border-purple-accent/15 border-purple-accent/15"
      >
        {isEs ? "ES" : "EN"}
      </Button>
    </>
  );
}
