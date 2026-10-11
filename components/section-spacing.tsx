import { SECTION_GAP } from "@/lib/rhythm";

/**
 * Inter-section vertical rhythm: 96px mobile, 128px ≥768px.
 * Values come from lib/rhythm.ts (SECTION_GAP) — single source of truth.
 */
export function SectionSpacing({ height = SECTION_GAP }: { height?: string }) {
  return <div aria-hidden="true" className={height} />;
}
