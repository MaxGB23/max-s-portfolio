"use client";

import { createContext, useContext, useRef, useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
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
 * Announces the arrival at an in-page anchor once its smooth scroll lands:
 * 1. Reflects the target hash in the URL without adding history entries
 *    (replaceState never navigates) — shareable anchors, no native jump.
 * 2. Plays the CSS arrival cue on the target element via a class.
 *
 * The cue is class-triggered, NOT `:target`. history.replaceState with a
 * fragment does not run fragment navigation, so the browser never updates
 * the target element and `:target` would never match (confirmed in Chrome);
 * a class is deterministic and replays trivially: remove -> reflow -> add.
 * The forced reflow restarts the CSS animation on repeat clicks.
 */
function announceArrival(href: string) {
  const base = window.location.pathname + window.location.search;
  window.history.replaceState(null, "", base + href);

  const target = document.getElementById(href.slice(1));
  if (target) {
    target.classList.remove("arrive");
    void target.offsetWidth;
    target.classList.add("arrive");
    // Clear the class once the cue has played so a static reduced-motion
    // highlight does not linger and repeat clicks always start clean.
    window.setTimeout(() => target.classList.remove("arrive"), 2200);
  }
}

/**
 * Scroll to a hash target using Lenis, compensating for the fixed navbar height
 * and the target's own padding-top (so its content, not its box, lands under
 * the navbar).
 * Falls back to native scrollIntoView when Lenis is unavailable.
 * Reflects the target hash on arrival (see reflectHashInUrl).
 */
export function useScrollToAnchor(navbarHeight = 64) {
  const lenis = useLenis();

  return useCallback(
    (href: string) => {
      if (!href.startsWith("#")) return false;

      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return false;

      // Land with the target's CONTENT under the navbar, not its box: sections
      // that own their vertical spacing would otherwise park their content one
      // padding below the navbar. The air can live on the section shell or on
      // its first child (the inner container — #contact-content carries
      // SECTION_GAP_Y so the arrival ring encloses air), so sum both levels.
      // 2-level rule: no-op for every other anchor target (#sobre-mi,
      // #proyectos, #precios have padding-top 0 at both levels).
      const inner = target.firstElementChild;
      const padTop =
        (parseFloat(getComputedStyle(target).paddingTop) || 0) +
        (inner ? parseFloat(getComputedStyle(inner).paddingTop) || 0 : 0);
      const y = Math.max(
        target.getBoundingClientRect().top + window.scrollY - navbarHeight + padTop,
        0
      );
      // The cue must fire at arrival, not at click time (the visitor is still
      // looking at the previous section).
      if (lenis) {
        // onComplete gives the right timing when the tween lands, but it is
        // SKIPPED when the visitor scrolls during the 1.4s tween — which used to
        // drop the cue, and the URL hash with it, since both live in
        // announceArrival. So the cue is unconditional and the backstop
        // guarantees it; a missed cue is far worse than an arrival announced
        // for a target the visitor nudged away from. A ring painted off-screen
        // is invisible and self-cleans after ~2.2s.
        const token = ++arrivalToken;
        let fired = false;
        const fire = () => {
          if (fired || token !== arrivalToken) return;
          fired = true;
          announceArrival(href);
        };

        lenis.scrollTo(y, { duration: 1.4, onComplete: fire });
        window.setTimeout(fire, ARRIVAL_FALLBACK_MS);
      } else {
        // Mobile real (sin Lenis): el mismo cálculo de offset que desktop.
        // scrollIntoView({smooth}) es flaky en Chrome Android cuando hay
        // cambios de layout concurrentes (cierre del menú móvil) — el scroll
        // se cancela y el link parece muerto.
        window.scrollTo({ top: y, behavior: "smooth" });
        // Native smooth scroll has no completion signal; schedule the arrival
        // just past the typical landing (mobile is not the broken perception
        // case — that is desktop — so a close approximation is fine).
        window.setTimeout(() => announceArrival(href), 1000);
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
// Only one arrival can be pending: a newer anchor click supersedes the previous
// one, so a stale backstop can never announce the wrong destination.
let arrivalToken = 0;

/** Backstop delay — just past the 1.4s tween, so it only fires when the tween
 *  was interrupted and onComplete will never run. */
const ARRIVAL_FALLBACK_MS = 1600;

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
 * 
 * NOTE: No more GSAP pin, so no pin-spacer growth to wait for. Simple restore.
 */
export function ScrollRestorer() {
  const pathname = usePathname();
  const lenis = useLenis();
  // The effect deps are [pathname, lenis], and the Lenis instance arrives
  // asynchronously — so it runs more than once per visit. Track the PATHNAME
  // change instead of a run counter: a run counter treats Lenis's late arrival
  // as a navigation and forces the top on reload, which is the bug.
  const lastPathname = useRef<string | null>(null);

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
    const prevPathname = lastPathname.current;
    lastPathname.current = pathname;

    // Home: restore the captured position.
    if (pathname === "/") {
      const target = pendingRestore;
      if (target == null) return;
      pendingRestore = null;

      // No GSAP pin anymore — no pin-spacer growth to wait for.
      // Simple: recalc Lenis limits and scroll to target.
      if (lenis) {
        lenis.resize(); // recalc the scroll limit against the final layout
        lenis.scrollTo(target, { immediate: true });
      } else {
        window.scrollTo(0, target);
      }
      return;
    }

    // Entering a detail page: force scroll to top. Next does this natively,
    // but Lenis would clobber it with the home page's stale scroll.
    //
    // Only when the ROUTE CHANGED. On the first run of a given pathname (an
    // initial load or a RELOAD) there is no stale home scroll to clobber, and
    // the browser has already restored the reload position (~13ms, before
    // hydration). Forcing top there raced that restore and produced a visible
    // jump to top and back.
    if (prevPathname == null || prevPathname === pathname) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (lenis) lenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      });
    });
  }, [pathname, lenis]);

  return null;
}