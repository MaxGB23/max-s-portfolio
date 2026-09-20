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
 * (≥1280px × ≥900px). NOTE: `featured-project-panel.tsx` still inlines these
 * exact classes (the file was out of scope for the shell refactor); these
 * tokens are the canonical reference and should be wired in there next.
 */
export const SECTION_GAP = "h-24 md:h-32";
export const FEATURED_GAP = "gap-12";
export const FEATURED_GAP_LG =
  "[@media(min-width:1280px)_and_(min-height:900px)]:gap-30";