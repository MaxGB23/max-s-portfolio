"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { consumeAnchorOwnership, useLenis, useScrollToAnchor } from "@/hooks/use-lenis";

/**
 * Same navbar offset every anchor caller passes (`navbar.tsx`,
 * `hero-section.tsx`, `pricing-section.tsx`).
 */
const NAVBAR_HEIGHT = 64;

/**
 * The gate `smooth-scroll.tsx` uses to decide whether Lenis exists, i.e. which
 * half of `useScrollToAnchor` runs: the `lerp` tween on desktop, the authored
 * `animateScrollTo` jump on mobile. Duplicating the literal here is deliberate
 * (the 768 is documented as a single literal, see `docs/design/platform.md`
 * 8): it is the only way this component knows whether a missing Lenis instance
 * means "not created yet" or "will never exist".
 */
const LENIS_QUERY = "(min-width: 768px)";

/**
 * Arrival announcement for a URL that already names a section.
 *
 * The arrival cue used to live ONLY inside the in-page click path: a click on
 * the navbar called `useScrollToAnchor`, which owns the arrival token, the
 * `ARRIVAL_FALLBACK_MS` backstop and the `announceArrival` call. Navigating to
 * `/#contacto` from another route — or loading that URL directly — scrolled to
 * the section (the browser applies the fragment, the router lands on it) and
 * never announced it, because no click owned the arrival.
 *
 * So this is not a second announcer: it is the same one, with the click
 * replaced by the hash the visit arrived with. Mounted only on the home
 * (`app/page.tsx`), it reads `location.hash` ONCE and, when it names an element
 * that exists here, replays that exact call. Everything the click path
 * guarantees then applies unchanged — including `++arrivalToken`, which is what
 * invalidates a stale backstop left behind by an earlier click.
 *
 * It runs at most once per mount, for four separate reasons:
 * 1. `announced` is set before the call, so the effect's own re-runs (and
 *    React's double effect in StrictMode) cannot call it twice.
 * 2. On desktop the first run happens BEFORE `SmoothScroll` creates Lenis (a
 *    child's effect runs before its parent's), so firing there would take the
 *    mobile branch and race a tween that appears one commit later. The effect
 *    therefore waits for the instance, which re-runs it — and `announced` keeps
 *    that re-run from becoming a second cue.
 * 3. A hash that names nothing (or no hash at all) is settled as done: the
 *    in-page click path stays the owner of every later anchor, exactly as
 *    today.
 * 4. It is never mounted off the home, and it never watches for hash changes.
 *
 * And it announces only a hash that NOBODY claimed. A return to a grid position
 * ("Volver", or the browser back button) arrives with the hash the visitor had
 * when they clicked the card, so the URL alone cannot tell an arrival from a
 * return. `ScrollRestorer` cannot be asked either: it is a sibling mounted
 * BEFORE this component, and React runs siblings' passive effects in mount
 * order, so it has already consumed the pending position here. The ownership is
 * therefore published by the event that starts the navigation
 * (`takeHomeScroll`, the `popstate` promoter) and read once, here — see
 * `scrollOwnerClaim` in `hooks/use-lenis.tsx`.
 */
export function AnchorArrival() {
  const pathname = usePathname();
  const lenis = useLenis();
  const scrollToAnchor = useScrollToAnchor(NAVBAR_HEIGHT);
  const announced = useRef(false);

  useEffect(() => {
    if (announced.current) return;
    if (pathname !== "/") return;

    const hash = window.location.hash;
    // `#` alone, or an anchor that this document does not have: nothing arrived,
    // so nothing is announced. Marked done, matching the click path's own
    // abort (`announceArrival` returns when the target is missing).
    if (!hash || hash.length < 2 || !document.getElementById(hash.slice(1))) {
      // Una llegada sin ancla tambien termina la marca del dueno, si la habia:
      // nadie la va a consumir despues y silenciaria la proxima llegada.
      consumeAnchorOwnership();
      announced.current = true;
      return;
    }

    // Lenis is created by the parent's effect, after this one. Wait for it
    // rather than announcing from the mobile branch of a desktop page.
    if (!lenis && window.matchMedia(LENIS_QUERY).matches) return;

    // Un cambio de ruta que YA tiene el scroll no es una llegada. Se consulta y
    // se limpia ANTES de decidir: el dueno lo publico el evento que arranco la
    // navegacion, asi que no depende del orden de los efectos, y una llegada
    // que nadie reclamo (`/#contacto` desde el catalogo, una carga directa de
    // `/#contacto`) sigue anunciando.
    const owned = consumeAnchorOwnership();
    announced.current = true;
    if (owned) return;

    // Lenis clamps every tween target against a scroll `limit` it measured on
    // the route we just LEFT (lenis.mjs:860), and its own ResizeObserver only
    // catches up a frame later. Arriving from the catalogue — a much shorter
    // page — clamped the trip to the catalogue's limit and left the section
    // 3,087px out of view. Same step the restore path takes for the same
    // reason (`ScrollRestorer`: "recalcula el limite de Lenis"). It recomputes
    // dimensions and resyncs to the current position; it does not scroll.
    lenis?.resize();

    scrollToAnchor(hash);
  }, [lenis, pathname, scrollToAnchor]);

  return null;
}
