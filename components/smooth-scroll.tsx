"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisProvider, ScrollRestorer } from "@/hooks/use-lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Desktop-only, and now reactive. The gate used to be a one-time
    // `window.innerWidth < 768` read at mount, so a phone that loaded in
    // landscape (844px wide) created Lenis and kept it alive after rotating to
    // portrait, where the rest of the app assumes `lenis === null`
    // (pointer-gestures.md 7: on mobile overflow is the only scroll lock).
    // Measured with scripts/about-orientation.mjs: after such a rotation the
    // About portrait stayed at opacity 0 forever, because its own ScrollTrigger
    // (start "top 85%") never played while the section timeline did.
    const desktop = window.matchMedia("(min-width: 768px)");
    let teardown: (() => void) | null = null;

    const start = () => {
      // Initialize Lenis with optimal settings from docs
      // 0.6s, no 1s: a 165Hz la animacion de 1s sobrevive al gesto y la pagina
      // llega tarde respecto a la mano (eso se lee como delay). Medido con
      // scripts/audit-projects.mjs: la cola de frames que avanzan menos de la
      // mitad del paso baja de 7.8% a 4.6% y el salto maximo por frame de
      // 43-47px a 39-41px. Gana a 0.5 en las tres metricas.
      // La curva NO se toca: el ease-out exponencial es lo que evita que el
      // target acumulado se descargue de golpe al cesar el input.
      const lenisInstance = new Lenis({
        duration: 0.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
      });

      setLenis(lenisInstance);

      // Synchronize Lenis with GSAP ScrollTrigger
      lenisInstance.on("scroll", ScrollTrigger.update);

      // Bucle nativo estandar, mas robusto para que Lenis tome el control 100%
      let rafId = requestAnimationFrame(function raf(time: number) {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      });

      // Disable GSAP's standard lag smoothing to prevent animation jumps during fast scrolling
      gsap.ticker.lagSmoothing(0);

      // Adopt a foreign native scroll while a glide is running. Lenis's own
      // onNativeScroll only takes the native position when isScrolling is false
      // or "native" (lenis 1.3.18-dev.1, dist/lenis.mjs:701), so a scrollbar
      // drag, PageDown, find-in-page or middle-click autoscroll during a wheel
      // glide is discarded and the rAF loop keeps writing the stale
      // animatedScroll until the velocity reset: the page moves against the
      // drag and snaps back on release. scrollTo(..., { immediate: true }) is
      // the public path that adopts it: it sets animatedScroll = targetScroll =
      // target, writes the position, then reset() clears isScrolling and stops
      // the animation. The 2px filter drops Lenis's own per-frame echo, which
      // differs from the reported scrollY only by sub-pixel rounding. Measured
      // with scripts/scroll-guard.mjs: 25 direction reversals and 3092px of
      // pull-back without it, 0 and 0px with it.
      const onForeignScroll = () => {
        if (lenisInstance.isScrolling !== "smooth") return;
        if (Math.abs(window.scrollY - lenisInstance.animatedScroll) < 2) return;
        lenisInstance.scrollTo(window.scrollY, { immediate: true });
      };
      window.addEventListener("scroll", onForeignScroll, { passive: true });

      teardown = () => {
        window.removeEventListener("scroll", onForeignScroll);
        cancelAnimationFrame(rafId);
        lenisInstance.off("scroll", ScrollTrigger.update);
        lenisInstance.destroy();
        // Lenis owned this while it lived; hand the defaults back to GSAP so a
        // rotation to a phone layout leaves the ticker as mobile expects it.
        gsap.ticker.lagSmoothing(500, 33);
        setLenis(null);
      };
    };

    const sync = () => {
      if (desktop.matches) {
        if (!teardown) start();
        return;
      }
      if (teardown) {
        teardown();
        teardown = null;
      }
    };

    sync();
    desktop.addEventListener("change", sync);

    return () => {
      desktop.removeEventListener("change", sync);
      teardown?.();
      teardown = null;
    };
  }, []);

  // Lenis provider wraps children; on mobile (lenis is null) the hook returns null
  // and the navbar falls back to native scrollIntoView.
  return (
    <LenisProvider lenis={lenis as any}>
      <ScrollRestorer />
      {children}
    </LenisProvider>
  );
}
