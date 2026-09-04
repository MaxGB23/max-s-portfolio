"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisProvider } from "@/hooks/use-lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // We only enable Lenis on desktop (>=768px) to preserve native momentum scrolling on mobile
    if (window.innerWidth < 768) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis with optimal settings from docs
    const lenisInstance = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    setLenis(lenisInstance);

    // Synchronize Lenis with GSAP ScrollTrigger
    lenisInstance.on("scroll", ScrollTrigger.update);

    // Bucle nativo estándar, más robusto para que Lenis tome el control 100%
    let rafId: number;
    function raf(time: number) {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Disable GSAP's standard lag smoothing to prevent animation jumps during fast scrolling
    gsap.ticker.lagSmoothing(0);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.off("scroll", ScrollTrigger.update);
      lenisInstance.destroy();
    };
  }, []);

  // Lenis provider wraps children; on mobile (lenis is null) the hook returns null
  // and the navbar falls back to native scrollIntoView.
  return <LenisProvider lenis={lenis as any}>{children}</LenisProvider>;
}
