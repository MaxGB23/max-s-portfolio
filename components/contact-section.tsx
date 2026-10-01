"use client";

import { useState } from "react";
import { Check, Copy, Download, Github, Linkedin, Mail } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";
import { useLanguage } from "@/contexts/language-context";
import { cvHref } from "@/data/cv";
import { SECTION_GAP_Y } from "@/lib/rhythm";

const CONTACT_EMAIL = "maxgonzalezballesteros@gmail.com";

export function ContactSection() {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible (contexto no seguro / navegador viejo):
      // fallback al mailto, que sigue siendo la vía directa.
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    }
  };

  return (
    <Section
      id="contacto"
      aria-labelledby="contact-heading"
      // Contact owns its vertical spacing (the two page-level spacers around
      // it moved inside): the arrival ring is drawn at the section box border,
      // so it needs air INSIDE the box — 96/128px of padding the ring encloses.
      // The padding lives on the INNER container (not the outer section) so the
      // ring is painted on a max-w-6xl panel instead of a full-bleed rectangle.
      innerId="contact-content"
      insetClassName="px-6"
      innerClassName={`max-w-6xl ${SECTION_GAP_Y}`}
    >
      <FadeIn>
        {/* Section header */}
        <header className="debug-l3 flex flex-col items-center text-center mb-5 md:mb-8">
          <span className="inline-flex items-center rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2 text-xs sm:text-sm font-semibold text-purple-accent mb-5">
            {t("section.contact.badge")}
          </span>

          <h2 id="contact-heading" className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground mb-5">
            <span>{t("section.contact.title.first")}</span>
            <span className="text-purple-accent brightness-110">{t("section.contact.title.second")}</span>
          </h2>

          <p className="text-fluid-body px-4 sm:px-16 md:px-0 text-content max-w-lg mx-auto leading-relaxed">
            {t("section.contact.subtitle")} {t("common.responseTime24h")}
          </p>
        </header>

        {/* CTA row: single row from lg (5 buttons don't fit at md). Below lg
            it stacks in blocks of 2 columns, mirroring email + copy. */}
        <div className="debug-l3 flex flex-col lg:flex-row justify-center items-center gap-3">
          <Button asChild variant="primary" size="lg">
            <a
              href="https://www.linkedin.com/in/maxballesteros"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={16} aria-hidden="true" />
              {t("section.contact.ctaLinkedin")}
            </a>
          </Button>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" glow size="lg">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail size={16} aria-hidden="true" />
                {t("section.contact.ctaEmail")}
              </a>
            </Button>
            <Button
              variant="outline"
              glow
              size="lg"
              type="button"
              onClick={copyEmail}
              aria-label={copied ? t("section.contact.copy.ariaCopied") : t("section.contact.copy.ariaCopy")}
              className={copied ? "border-purple-accent/40  text-purple-accent brightness-110" : ""}
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? t("section.contact.copy.copied") : <>
                <span className="hidden sm:block">{t("section.contact.copy.copyEmail")}</span>
                <span className="sm:hidden">{t("section.contact.copy.emailShort")}</span>
              </>}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" glow size="lg">
              <a href={cvHref(lang)} download>
                <Download size={16} aria-hidden="true" />
                <span className="hidden sm:block">{t("section.contact.ctaCv")}</span>
                <span className="sm:hidden">{t("section.contact.ctaCvShort")}</span>
              </a>
            </Button>

            <Button asChild variant="outline" glow size="lg">
              <a
                href="https://github.com/MaxGB23"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={16} aria-hidden="true" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
