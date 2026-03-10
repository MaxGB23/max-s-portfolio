"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useGsapAnimation } from "@/hooks/use-gsap-animation";
import Aurora from "@/components/animations/Aurora";
import { useState, useEffect } from "react";
import { NextJsIcon, ReactIcon, TypeScriptIcon, PostgresIcon } from "@/components/icons";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from the DOM (matches the DarkModeToggle's method)
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));
    setMounted(true);

    // Watch for .dark class changes on <html>
    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  // GSAP timeline: sequences all hero elements on load.
  const containerRef = useGsapAnimation<HTMLElement>((gsap) => {
    const elements = [
      ".hero-portrait",
      ".hero-badge",
      ".hero-label",
      ".hero-title",
      ".hero-description",
      ".hero-chips",
      ".hero-cta",
      ".hero-scroll",
    ];

    // Set initial hidden state synchronously BEFORE the timeline starts.
    // autoAlpha sets both opacity:0 and visibility:hidden so there's no flash.
    gsap.set(elements, { autoAlpha: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".hero-portrait", {
      autoAlpha: 1,
      x: 0,
      duration: 0.8,
      startAt: { x: 40 },
    })
      .to(
        ".hero-badge",
        { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)", startAt: { scale: 0.6 } },
        "-=0.4"
      )
      .to(
        ".hero-label",
        { autoAlpha: 1, y: 0, duration: 0.5, startAt: { y: 12 } },
        "-=0.4"
      )
      .to(
        ".hero-title",
        { autoAlpha: 1, x: 0, duration: 0.6, startAt: { x: -20 } },
        "-=0.3"
      )
      .to(
        ".hero-description",
        { autoAlpha: 1, y: 0, duration: 0.45, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-chips",
        { autoAlpha: 1, y: 0, duration: 0.4, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-cta",
        { autoAlpha: 1, y: 0, duration: 0.4, startAt: { y: 10 } },
        "-=0.2"
      )
      .to(
        ".hero-scroll",
        { autoAlpha: 1, duration: 0.4 },
        "-=0.1"
      );
  });

  return (
    <section
      id="inicio"
      ref={containerRef}
      aria-label="Introducción"
      className="relative min-h-[85vh] flex flex-col items-center justify-center pt-16 px-4"
    >
      {/* Background Aurora */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)"
        }}
      >
        {mounted && isDark && (
          <Aurora
            colorStops={["#223068", "#000000", "#3b337a"]}
            blend={0.5}
            amplitude={1.0}
            speed={1.0}
          />
        )}
      </div>
      {/* Main hero layout */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="relative flex flex-col md:flex-row items-center justify-center w-full max-w-7xl mx-auto gap-8 md:gap-12 lg:gap-20">

          {/* Left Column: Info */}
          <div className="hero-info flex flex-col items-center md:items-start text-center md:text-left z-10 max-w-2xl">
            <p className="hero-label uppercase tracking-[0.2em] font-medium text-muted-foreground mb-4 text-xs sm:text-sm lg:text-base" style={{ opacity: 0, visibility: 'hidden' }}>
              Max González Ballesteros
            </p>

            <h1 className="hero-title font-serif font-black uppercase text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tighter text-foreground mb-6" style={{ opacity: 0, visibility: 'hidden' }}>
              Full Stack <br />
              <span style={{ color: "var(--accent-purple)" }}>Developer</span>
            </h1>

            <p className="hero-description text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed text-muted-foreground max-w-[400px] lg:max-w-lg" style={{ opacity: 0, visibility: 'hidden' }}>
              {"Creo aplicaciones web rápidas, modernas y enfocadas en la experiencia del usuario. Especializado en Next.js y React."}
            </p>
          </div>

          {/* Right Column: Portrait */}
          <div
            className="hero-portrait relative rounded-4xl shrink-0 shadow-xl w-[clamp(240px,30vw,400px)] aspect-8/9 z-0 mt-4 md:mt-0"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <div className="w-full h-full rounded-4xl overflow-hidden relative">
              <Image
                src="/images/funko2.png"
                alt="Maximiliano González Ballesteros Full Stack Developer Profile Picture"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 768px) 240px, (max-width: 1200px) 30vw, 380px"
              />
            </div>

            {/* Waving Hand Badge */}
            <motion.div
              className="hero-badge absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-2xl z-20 cursor-pointer"
              style={{ backgroundColor: "#5865F2", border: "12px solid var(--background)", opacity: 0, visibility: 'hidden' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            >
              <motion.span
                className="text-4xl md:text-5xl text-white origin-bottom-right"
                role="img"
                aria-label="wave"
                animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1, ease: "easeInOut" }}
              >
                🖐
              </motion.span>
            </motion.div>
          </div>
        </div>

        {/* Skill chips */}
        <div className="hero-chips mt-8 flex flex-wrap items-center justify-center gap-2" style={{ opacity: 0, visibility: 'hidden' }}>
          <span className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground tracking-wide">
            Frontend Developer
          </span>
          <span
            className="px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-white"
            style={{ backgroundColor: "var(--accent-purple)" }}
          >
            Full Stack Developer
          </span>
        </div>

        {/* Tech Stack Ticker */}
        <div className="hero-chips flex flex-col justify-center items-center md:items-start gap-3 w-full" style={{ opacity: 0, visibility: 'hidden' }}>
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold">
            Stack Principal
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <NextJsIcon className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <ReactIcon className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <TypeScriptIcon className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
            <PostgresIcon className="h-6 w-auto opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          </div>
        </div>

        {/* CTA buttons */}
        <div className="hero-cta mt-8 flex flex-wrap items-center justify-center gap-4" style={{ opacity: 0, visibility: 'hidden' }}>
          <Link
            href="#productos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity duration-200 shadow-md"
          >
            Ver Productos
            <ArrowDown size={15} aria-hidden="true" />
          </Link>
          <a
            href="/cv.pdf"
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors duration-200"
          >
            Descargar CV
            <Download size={15} aria-hidden="true" />
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll mt-16 mb-8 flex flex-col items-center gap-2 text-muted-foreground" style={{ opacity: 0, visibility: 'hidden' }}>
          <span className="text-xs tracking-widest uppercase">Deslizar</span>
          <motion.div
            className="w-px h-8 bg-border"
            animate={{ scaleY: [1, 0.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ originY: 0 }}
            aria-hidden="true"
          />
        </div>

      </div>
    </section >
  );
}
