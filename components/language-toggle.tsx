"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

/** Single-button language toggle. Shows the active language code on a sliding
    knob (ES | EN) and switches to the other language on click — same switch
    pattern as DarkModeToggle, sized to match navbar controls. */
export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();
  const isEs = lang === "es";

  return (
    <button
      type="button"
      onClick={() => setLang(isEs ? "en" : "es")}
      aria-label={isEs ? t("nav.aria.switchToEn") : t("nav.aria.switchToEs")}
      className="relative h-9 w-20 shrink-0 rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Static track labels — the knob covers the active one */}
      <span className="pointer-events-none absolute inset-0 flex items-center">
        <span className="flex-1 text-center text-[11px] font-semibold tracking-wide">ES</span>
        <span className="flex-1 text-center text-[11px] font-semibold tracking-wide">EN</span>
      </span>
      {/* Sliding knob with the active language code */}
      <span
        className={cn(
          "pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 flex w-[calc(50%-1px)] items-center justify-center rounded-full bg-foreground text-background text-[11px] font-semibold tracking-wide shadow-sm transition-transform duration-200",
          !isEs && "translate-x-full"
        )}
      >
        {isEs ? "ES" : "EN"}
      </span>
    </button>
  );
}