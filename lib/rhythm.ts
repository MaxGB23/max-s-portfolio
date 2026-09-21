/**
 * Vertical rhythm tokens — single source for the spacing values between and
 * inside top-level sections. Tailwind class strings (Tailwind v4 resolves the
 * numeric spacing scale at build time).
 *
 * SECTION_GAP — inter-section gap: 96px mobile (`h-24`) · 128px ≥768px
 * (`md:h-32`). Consumed by `components/section-spacing.tsx`.
 *
 * FEATURED_GAP / FEATURED_GAP_LG — heading↔card gap inside the featured stack:
 * 48px (`gap-12`), growing to 120px (`gap-30`) on tall×wide viewports
 * (≥1280px × ≥900px). Consumed by `featured-project-panel.tsx` since `748c17e`
 * (className interpolated `${FEATURED_GAP} ${FEATURED_GAP_LG}`).
 *
 * PAGE_SPACER_CLASSES — wrapper class per inter-section pair, resolved by
 * orientation regime (single source of the orientation contract, byte-equal to
 * `352ab13`). Consumed by `components/page-spacing.tsx`; QA mirror in
 * `scripts/rhythm-contract.mjs`.
 */
export const SECTION_GAP = "h-24 md:h-32";
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
  "hero-about": "portrait:md:hidden",
  "about-projects": "landscape:lg:hidden landscape:[@media(max-height:768px)]:block",
  "projects-all-projects":
    "portrait:lg:hidden landscape:lg:hidden landscape:lg:[@media(max-height:767px)]:block",
  "all-projects-pricing": "",
  "pricing-contact": "",
  "contact-footer": "",
};