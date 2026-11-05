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
  // Solo se anuncia un ancla que EXISTA en la pagina actual. Este aviso llega
  // por onComplete pero tambien por el backstop de 1600ms, y ese backstop puede
  // dispararse despues de que el visitante ya haya pulsado otra cosa. Antes,
  // ese disparo tardio reescribia la URL de la pagina de destino con un ancla
  // que no le pertenece.
  const target = document.getElementById(href.slice(1));
  if (!target) return;

  const base = window.location.pathname + window.location.search;
  // `history.state` se conserva a proposito: Next guarda ahi el arbol de la
  // navegacion en curso. Pasar `null` lo borra, y si el aviso llega mientras
  // una transicion esta en vuelo (primera visita, RSC lento) el router no
  // puede confirmarla: la URL se queda en el ancla y la ficha nunca pinta.
  window.history.replaceState(window.history.state, "", base + href);

  target.classList.remove("arrive");
  void target.offsetWidth;
  target.classList.add("arrive");
  // Clear the class once the cue has played so a static reduced-motion
  // highlight does not linger and repeat clicks always start clean.
  window.setTimeout(() => target.classList.remove("arrive"), 2200);
}

// --- Mobile programmatic scroll (no Lenis) ---------------------------------
// `lenis.scrollTo(y, { lerp: 0.1 })` advances a FRACTION of the remaining
// distance per frame, so a 300px hop and a 3000px trip feel the same. The
// native `window.scrollTo({ behavior: "smooth" })` the mobile path fell back to
// does not: the UA owns the duration, caps the velocity, and derives one from
// the distance — so a near anchor crawls and the farthest one blurs past.
//
// So the jump is authored here, with the same arrival contract as desktop and a
// REAL completion signal: the fixed 1000ms timer it replaces could announce the
// arrival before a long trip had landed. Only the tap is animated — touch drag,
// wheel and keys keep the browser's scrolling, and all three cancel the jump,
// the same way native smooth scrolling yields to the visitor.
//
// **Duration does NOT scale with distance.** Measured on WebKit at 390x844: the
// UA takes ~200ms for a 995px trip and ~172ms for a 7904px one, so the far
// target travels 11x faster (108,357 px/s, 2145px in a single frame) — it reads
// as a teleport, while the near one reads as a scroll. Lenis has the opposite
// profile: `lerp` covers ~95% of the trip in ~0.5s at ANY distance, which is the
// feel being restored. A long trip must therefore still spend its distance, not
// compress it into the near-trip budget.
const MOBILE_SCROLL_MS = 560;
/** Short hops ramp down to this, so a 60px correction is not a 560ms creep. */
const MOBILE_SCROLL_SHORT_MS = 320;
/** Distance at which the trip is considered long: full `MOBILE_SCROLL_MS`. */
const MOBILE_SCROLL_RAMP_PX = 400;
/** Delay between the landing and the arrival cue. At 560ms from the tap, a cue
 *  on the landing frame reads as part of the deceleration instead of as the
 *  answer to the click (owner feedback on a real phone), so the two beats are
 *  separated. This is a beat, not a distance: it does not scale. */
const MOBILE_CUE_DELAY_MS = 180;

/** Cancels the in-flight mobile jump: a newer one owns the scroll. */
let cancelMobileScroll: (() => void) | null = null;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Animates `window.scrollY` to `y` on the mobile path (Lenis absent).
 * `onDone` runs when the trip lands OR when the visitor interrupts it with a
 * gesture: the tap on the link was registered, so the arrival cue is owed. It is
 * skipped only when a NEWER jump supersedes this one, because that announcement
 * would write the outdated target's hash one frame before the new jump starts.
 */
function animateScrollTo(y: number, onDone?: () => void) {
  cancelMobileScroll?.();

  const start = window.scrollY;
  const delta = y - start;
  // Already there (a repeated tap, or a target a pixel off): the arrival cue is
  // the whole answer, so fire it now instead of animating nothing.
  if (Math.abs(delta) < 1) {
    window.scrollTo({ top: y });
    onDone?.();
    return;
  }

  const duration =
    MOBILE_SCROLL_SHORT_MS +
    (MOBILE_SCROLL_MS - MOBILE_SCROLL_SHORT_MS) *
      Math.min(Math.abs(delta) / MOBILE_SCROLL_RAMP_PX, 1);
  const startedAt = performance.now();
  let frame = 0;
  let settled = false;

  function settle(announce: boolean) {
    if (settled) return;
    settled = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("touchstart", interrupt);
    window.removeEventListener("wheel", interrupt);
    window.removeEventListener("keydown", interrupt);
    if (cancelMobileScroll === supersede) cancelMobileScroll = null;
    if (announce) onDone?.();
  }
  // A finger, wheel or key ends the trip where it was left — native smooth
  // scrolling yields exactly like that — but the cue still fires: a missing
  // arrival cue is worse than one for a target the visitor nudged away from
  // (the same rule that drives the desktop `ARRIVAL_FALLBACK_MS` backstop).
  const interrupt = () => settle(true);
  // A newer jump ends the older one silently; see the contract above.
  const supersede = () => settle(false);

  function step(now: number) {
    const t = Math.min((now - startedAt) / duration, 1);
    window.scrollTo({ top: start + delta * easeOutCubic(t) });
    if (t >= 1) {
      settle(true);
      return;
    }
    frame = requestAnimationFrame(step);
  }

  cancelMobileScroll = supersede;
  window.addEventListener("touchstart", interrupt, { passive: true });
  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("keydown", interrupt);
  frame = requestAnimationFrame(step);
}

/**
 * Scroll to a hash target using Lenis, compensating for the fixed navbar height
 * and the target's own padding-top (so its content, not its box, lands under
 * the navbar).
 * Falls back to the authored mobile jump when Lenis is unavailable.
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
        // SKIPPED when the visitor scrolls during the tween — which used to
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

        lenis.scrollTo(y, { lerp: 0.1, onComplete: fire });
        window.setTimeout(fire, ARRIVAL_FALLBACK_MS);
      } else {
        // Mobile real (sin Lenis): el mismo cálculo de offset que desktop y el
        // mismo aviso al aterrizar. `scrollIntoView({smooth})` es flaky en
        // Chrome Android cuando hay cambios de layout concurrentes (cierre del
        // menú móvil) — el scroll se cancela y el link parece muerto; el salto
        // propio no depende de esa animación del navegador.
        // El aviso espera `MOBILE_CUE_DELAY_MS` tras el aterrizaje, y el token
        // invalida el aviso pendiente si mientras tanto se pulso otra ancla: es
        // el mismo `arrivalToken` que protege el backstop de desktop, y evita
        // que un hash viejo se escriba 180ms tarde.
        const token = ++arrivalToken;
        animateScrollTo(y, () => {
          window.setTimeout(() => {
            if (token !== arrivalToken) return;
            announceArrival(href);
          }, MOBILE_CUE_DELAY_MS);
        });
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
      // Sin `duration`: una duracion fija tarda lo mismo en 8000px que en 300px,
      // asi que el viaje corto se arrastra a 150px/s. `lerp` avanza un
      // porcentaje del recorrido restante en cada frame y conserva la misma
      // sensacion a cualquier distancia.
      lenis.scrollTo(0, { lerp: 0.1 });
    } else {
      // Same authored jump as the anchor path: "Inicio" must answer like an
      // anchor tap, not at whatever speed the UA picks for the distance.
      animateScrollTo(0);
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

/** Backstop delay — just past where the lerp converges (~1.2-1.5s at 60Hz), so
 *  it only fires when the scroll was interrupted and onComplete never runs. */
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