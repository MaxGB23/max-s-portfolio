/**
 * Inter-section vertical rhythm: 96px mobile, 128px ≥768px.
 * Single source of truth for spacing between top-level sections.
 * The Featured stack is the documented exception (GSAP pin owns its height).
 */
export function SectionSpacing() {
  return <div aria-hidden="true" className="h-24 md:h-32" />;
}