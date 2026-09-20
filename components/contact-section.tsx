"use client";

import { useState } from "react";
import { Check, Copy, Github, Linkedin, Mail } from "lucide-react";
import { FadeIn } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/section";

const CONTACT_EMAIL = "maxgonzalezballesteros@gmail.com";

export function ContactSection() {
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
      insetClassName="px-6"
      innerClassName="max-w-6xl"
    >
      <FadeIn>
        {/* Section header */}
        <header className="debug-l3 flex flex-col items-center text-center mb-5 md:mb-8">
          <span className="inline-flex items-center rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2 text-xs sm:text-sm font-semibold text-purple-accent mb-5">
            Disponible para proyectos
          </span>

          <h2 id="contact-heading" className="flex flex-col md:flex-row gap-2 md:gap-3 justify-center items-center font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter text-foreground mb-5">
            <span>Trabajemos</span>
            <span className="text-purple-accent brightness-110">juntos</span>
          </h2>

          <p className="text-fluid-body px-4 sm:px-16 md:px-0 text-content max-w-lg mx-auto leading-relaxed">
            ¿Tienes un proyecto en mente? Conecta conmigo por LinkedIn o escríbeme — respondo en 24–48 h.
          </p>
        </header>

        {/* CTA row */}
        <div className="debug-l3 flex flex-col md:flex-row justify-center items-center gap-3">
          <Button asChild variant="primary" size="lg">
            <a
              href="https://www.linkedin.com/in/maxballesteros"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={16} aria-hidden="true" />
              Conectemos en LinkedIn
            </a>
          </Button>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" glow size="lg">
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail size={16} aria-hidden="true" />
                Escríbeme
              </a>
            </Button>
            <Button
              variant="outline"
              glow
              size="lg"
              type="button"
              onClick={copyEmail}
              aria-label={copied ? "Correo copiado" : "Copiar correo"}
              className={copied ? "border-purple-accent/40  text-purple-accent brightness-110" : ""}
            >
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? "Copiado" : "Copiar correo"}
            </Button>
          </div>

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
      </FadeIn>
    </Section>
  );
}
