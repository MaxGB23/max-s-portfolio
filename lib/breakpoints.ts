/**
 * FEATURED_STACK_GATE — single source of truth for the Featured stack layout
 * gate. Every consumer that needs to know "is the GSAP pin active?" MUST read
 * this constant, never a hand-written media query:
 *
 *  - `components/featured-projects.tsx`  -> gsap.matchMedia (pin/stacking)
 *  - `hooks/use-lenis.tsx`                -> ScrollRestorer PIN_MEDIA (pin
 *                                            expected when restoring scroll)
 *
 * The gate is landscape desktop editorial only: it needs enough BOTH width
 * (lg+, 1024px) and height (768px+) so the in-flow heading and the full
 * two-column card fit the pinned viewport, and landscape orientation (a
 * 1024x1366 iPad Pro portrait would otherwise activate the pin and buy a
 * ~2300px scroll spacer between featured and the grid). Outside that range the
 * panels render in normal flow — each card (CTA included) fully visible with
 * native scroll, no jank, no overlap.
 *
 * A mismatch between consumers is a bug by construction (that is why the
 * ScrollRestorer used to sit at 1.2s of watchdog when its gate still allowed
 * portrait tablets while GSAP's did not).
 */
export const FEATURED_STACK_GATE =
  "(min-width: 1024px) and (min-height: 768px) and (orientation: landscape)";