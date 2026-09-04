"use client";

import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";
import type Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({ children, lenis }: { children: ReactNode; lenis: Lenis }) {
  const ref = useRef(lenis);
  ref.current = lenis;
  return <LenisContext.Provider value={ref.current}>{children}</LenisContext.Provider>;
}

/**
 * Returns the Lenis instance (desktop only).
 * On mobile, Lenis is not initialized — returns null.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/**
 * Scroll to a hash target using Lenis, compensating for the fixed navbar height.
 * Falls back to native scrollIntoView when Lenis is unavailable.
 */
export function useScrollToAnchor(navbarHeight = 64) {
  const lenis = useLenis();

  return useCallback(
    (href: string) => {
      if (!href.startsWith("#")) return false;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return false;

      if (lenis) {
        const y = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        lenis.scrollTo(y, { duration: 2 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return true;
    },
    [lenis, navbarHeight]
  );
}

/**
 * Smooth-scroll to the very top of the page using Lenis.
 * Falls back to native window.scrollTo when Lenis is unavailable.
 */
export function useScrollToTop() {
  const lenis = useLenis();

  return useCallback(() => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [lenis]);
}
