/**
 * Vertical rhythm tokens — single source for the spacing values between and
 * inside top-level sections. Tailwind class strings (Tailwind v4 resolves the
 * numeric spacing scale at build time).
 *
 * SECTION_GAP — inter-section gap: 96px mobile (`h-24`) · 128px ≥768px
 * (`md:h-32`). Applied as the HEIGHT of the page-level spacer rendered by
 * `components/section-spacing.tsx`.
 *
 * SECTION_GAP_Y — vertical counterpart of SECTION_GAP (same values), applied
 * as padding INSIDE a section that owns its spacing instead of as a spacer at
 * page level. Contact is the only consumer: its arrival cue (`box-shadow:
 * inset` ring on `#contacto`) is drawn at the section box border, so the ring
 * needs air INSIDE the box. Consumed by `components/contact-section.tsx`.
 *
 * FEATURED_GAP / FEATURED_GAP_LG — heading↔card gap inside the featured stack:
 * 48px (`gap-12`), growing to 120px (`gap-30`) on tall×wide viewports
 * (≥1280px × ≥900px). Consumed by `featured-project-panel.tsx` since `748c17e`
 * (className interpolated `${FEATURED_GAP} ${FEATURED_GAP_LG}`).
 *
 * PAGE_SPACER_CLASSES — wrapper class per inter-section pair (4 pairs; the
 * contact pairs were retired when contact started owning its vertical spacing
 * via SECTION_GAP_Y), resolved by orientation regime (single source of the
 * orientation contract, byte-equal to `352ab13`). Consumed by
 * `components/page-spacing.tsx`; QA mirror in `scripts/rhythm-contract.mjs`.
 */
export const SECTION_GAP = "h-24 md:h-32";
/** Half of SECTION_GAP — page-level share when contact splits its rhythm. */
export const SECTION_GAP_HALF = "h-12 md:h-16";
/** Contact's own share of the rhythm: HALF of SECTION_GAP (visual total = SECTION_GAP). */
export const SECTION_GAP_Y = "py-12 md:py-16";
export const FEATURED_GAP = "gap-12";
export const FEATURED_GAP_LG =
  "[@media(min-width:1280px)_and_(min-height:900px)]:gap-30";

/** Pairs of top-level sections separated by a page-level spacer. */
export type PageSpacerPair =
  | "hero-about"
  | "about-projects"
  | "projects-all-projects"
  | "all-projects-pricing"
  | "pricing-contact"
  | "contact-footer";

/**
 * Wrapper class for the spacer between each section pair: decides `display`
 * per regime (`""` = no conditional wrapper → SectionSpacing at full height).
 * The arbitrary media variants win by CSS order — the last ordered variant
 * resolves the layout.
 */
export const PAGE_SPACER_CLASSES: Record<PageSpacerPair, string> = {
  "hero-about": "landscape:hidden [@media(orientation:landscape)_and_(max-height:800px)]:block",
  "about-projects": "landscape:hidden [@media(orientation:landscape)_and_(max-height:800px)]:block",
  "projects-all-projects": "",
  "all-projects-pricing": "",
  "pricing-contact": "",
  "contact-footer": "",
};
