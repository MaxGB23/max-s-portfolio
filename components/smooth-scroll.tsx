"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // We only enable Lenis on desktop (>=768px) to preserve native momentum scrolling on mobile
    if (window.innerWidth < 768) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with optimal settings from docs
    const lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Bucle nativo estándar, más robusto para que Lenis tome el control 100%
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Disable GSAP's standard lag smoothing to prevent animation jumps during fast scrolling
    gsap.ticker.lagSmoothing(0);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
