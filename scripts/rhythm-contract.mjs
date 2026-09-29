// Rhythm contract by orientation regime — QA mirror of lib/rhythm.ts PAGE_SPACER_CLASSES.
// Usage: expectedGap(pair, viewport) → { min, max? } | null (null = unasserted)
export function regime(vp) {
  const W = vp.width, H = vp.height;
  const landscape = W > H;
  const lg = W >= 1024;
  const gate = lg && H >= 768 && landscape; // FEATURED_STACK_GATE
  return { portrait: !landscape, landscape, lg, gate };
}
export function expectedGap(pair, vp) {
  const r = regime(vp);
  const spacing = vp.width >= 768 ? 128 : 96;
  const T = 10;
  switch (pair) {
    case "hero-about":
      if (r.portrait && vp.width >= 768) return { min: 0, max: T };      // portrait:md:hidden
      return { min: spacing };                                            // excepción Hero (sanity)
    case "about-projects":
      return { min: spacing - T, max: spacing + T };                 // "" → spacer estandar (el titulo vive dentro de #proyectos)
    case "projects-all-projects":
      return { min: spacing };                            // "" → spacer estandar; el gap medido incluye el heading "Todos" (vive fuera de #all-projects, sanity min)
    case "all-projects-pricing":
    case "pricing-contact":
    case "contact-footer":
      return { min: spacing - T, max: spacing + T };
    case "featured-card-card":
      if (r.gate) return null;                    // pin dueño de su altura
      if (r.portrait && r.lg) return { min: 96 - T, max: 96 + T };  // portrait:lg:mb-24
      if (r.landscape && r.lg && vp.height <= 768) return { min: 96 - T, max: 96 + T }; // landscape corto (≤768: cubre el píxel exacto 768, testeado en vivo; la gate ≥768 se aserta antes)
      return null;                                 // resto sin asertar
    default:
      return null;
  }
}