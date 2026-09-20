"use client";

import { createContext, useContext, useRef, useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { FEATURED_STACK_GATE } from "@/lib/breakpoints";

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

      const y = Math.max(target.getBoundingClientRect().top + window.scrollY - navbarHeight, 0);
      if (lenis) {
        lenis.scrollTo(y, { duration: 2 });
      } else {
        // Mobile real (sin Lenis): el mismo cálculo de offset que desktop.
        // scrollIntoView({smooth}) es flaky en Chrome Android cuando hay
        // cambios de layout concurrentes (cierre del menú móvil) — el scroll
        // se cancela y el link parece muerto.
        window.scrollTo({ top: y, behavior: "smooth" });
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

// --- Route-scroll handoff (home ⇄ detail) ----------------------------------
// Next.js restores scroll natively on back() and scrolls to top on push, but
// Lenis keeps its OWN internal scroll value and writes it to the window every
// RAF frame — so Lenis always wins the race and clobbers Next's scroll.
// Fix: own the handoff with a tiny module store. Capture the home position on
// the way out, restore it (or reset to top) after the new route paints, and
// force Lenis to adopt the target with `immediate: true` so its next frame
// doesn't overwrite what we just set.
let savedHomeScroll: number | null = null;
let pendingRestore: number | null = null;

/** Called on portfolio card clicks: remember where the grid was. */
export function saveHomeScroll(y: number) {
  savedHomeScroll = y;
}

/** Volver: consume the captured position and mark it for restoration. */
export function takeHomeScroll(): number | null {
  const y = savedHomeScroll;
  savedHomeScroll = null;
  if (y != null) {
    pendingRestore = y;
  }
  return y;
}

/**
 * Layout-level scroll authority for route changes. Rendered inside
 * LenisProvider so it survives route changes and can reach the Lenis instance.
 * - Entering a detail page: force scroll to top (Next does this natively, but
 *   Lenis would clobber it with the home page's stale scroll).
 * - Returning to `/` via the Volver pill or the browser back button: land
 *   exactly where the user left the grid.
 */
export function ScrollRestorer() {
  const pathname = usePathname();
  const lenis = useLenis();

  // Any pop (Volver pill, browser back) may mean "return to the grid": promote
  // the captured position before the pathname effect consumes it. The pill
  // path already consumed it via takeHomeScroll(), so it won't double-apply.
  useEffect(() => {
    const onPop = () => {
      if (savedHomeScroll != null) {
        pendingRestore = savedHomeScroll;
        savedHomeScroll = null;
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    // Home: restore the captured position.
    if (pathname === "/") {
      const target = pendingRestore;
      if (target == null) return;
      pendingRestore = null;

      // The featured stack (desktop) pins with a ScrollTrigger pin-spacer that
      // GROWS the document in later refresh passes, AFTER React paints and
      // even after the spacer first appears. Applying the restore against a
      // partially-grown layout clamps the target to that smaller max scroll
      // and leaves us short (e.g. back at a featured card): once the spacer
      // finishes growing, everything below it shifts down and we're stuck.
      // So: wait until the layout is stable (and the pin exists, when a pin is
      // expected), then apply with Lenis — and if the document grows again
      // right after, re-apply the same absolute target.
      // Shared gate: same media query that activates the GSAP pin, imported —
      // not re-typed. If GSAP pins, this must expect a pin-spacer too.
      const PIN_MEDIA = FEATURED_STACK_GATE;
      const pinExpected = window.matchMedia(PIN_MEDIA).matches;
      const hasPinSpacer = () =>
        !!document
          .querySelector(".featured-section")
          ?.parentElement?.matches?.(".pin-spacer");

      const apply = () => {
        if (lenis) {
          lenis.resize(); // recalc the scroll limit against the final layout
          lenis.scrollTo(target, { immediate: true });
        } else {
          window.scrollTo(0, target);
        }
      };

      const deadline = Date.now() + 1200;
      let lastHeight = -1; // first sample always counts as "grew"
      let lastAppliedY = window.scrollY;

      // Post-apply watchdog: if the document grows again (pin spacer finishing
      // late), the same absolute target still points at the grid — jump again,
      // unless the user has taken control of the scroll.
      let watchRuns = 0;
      const watch = () => {
        if (watchRuns++ > 20) return; // ~1.2s cap
        const h = document.documentElement.scrollHeight;
        if (h > lastHeight) {
          lastHeight = h;
          if (Math.abs(window.scrollY - lastAppliedY) < 60) apply();
        }
        setTimeout(watch, 60);
      };

      const check = () => {
        const h = document.documentElement.scrollHeight;
        const grew = h !== lastHeight;
        lastHeight = h;
        const ready = hasPinSpacer() || !pinExpected;
        if ((ready && !grew) || Date.now() > deadline) {
          apply();
          lastAppliedY = window.scrollY;
          setTimeout(watch, 60);
          return;
        }
        setTimeout(check, 40);
      };
      check();
      return;
    }

    // Entering a detail page: force scroll to top. Next does this natively,
    // but Lenis would clobber it with the home page's stale scroll.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      });
    });
  }, [pathname, lenis]);

  return null;
}
