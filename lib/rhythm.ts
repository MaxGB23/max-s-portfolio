/**
 * Vertical rhythm tokens — single source for the spacing values between and
 * inside top-level sections. Tailwind class strings (Tailwind v4 resolves the
 * numeric spacing scale at build time).
 *
 * SECTION_GAP — inter-section gap: 96px mobile (`h-24`) · 128px ≥768px
 * (`md:h-32`). Applied as the HEIGHT of the page-level spacer rendered by
 * `components/section-spacing.tsx`.
 *
 * SECTION_GAP_Y — the INSIDE half of SECTION_GAP (same values as
 * SECTION_GAP_HALF, NOT SECTION_GAP), applied as padding INSIDE a section that
 * owns its spacing instead of as a spacer at page level. Contact is the only
 * consumer: its arrival cue (`box-shadow: inset` ring on `#contacto`) is drawn
 * at the section box border, so the ring needs air INSIDE the box. The rhythm
 * there is split 50/50 — SECTION_GAP_HALF as the page spacer plus SECTION_GAP_Y
 * as this padding — so the visual total stays SECTION_GAP. Consumed by
 * `components/contact-section.tsx`.
 *
 * FEATURED_GAP / FEATURED_GAP_LG — vertical gap between the stacked blocks of a
 * featured panel: 48px (`gap-12`), growing to 120px (`gap-30`) on tall×wide
 * viewports (≥1280px × ≥900px). Consumed by `featured-project-panel.tsx` since
 * `748c17e` (className interpolated `${FEATURED_GAP} ${FEATURED_GAP_LG}`) on
 * `.panel-content`, whose children are the optional heading block and the
 * text/image grid.
 *
 * NOT to be confused with the gap between the text and image COLUMNS inside
 * that grid, which is a local value in the panel (`gap-6 md:gap-12`, with the
 * metric and tag rows adding `xl:mb-2`), not part of this contract.
 *
 * PAGE_SPACER_CLASSES — wrapper class per inter-section pair (6 pairs),
 * resolved by orientation regime (single source of the orientation contract).
 * Consumed by `components/page-spacing.tsx`; QA mirror in
 * `scripts/rhythm-contract.mjs`.
 *
 * The contract itself: `hero-about` and `about-projects` are the only pairs
 * with a conditional wrapper — the spacer renders in EVERY regime except
 * landscape taller than 800px, where the hero already fills the viewport, so
 * the extra air is dropped and the gap collapses to 0. The remaining four
 * pairs are unconditional (`""` = no wrapper → full-height spacer); the two
 * contact pairs carry `""` because contact owns its vertical spacing via
 * SECTION_GAP_Y instead.
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
