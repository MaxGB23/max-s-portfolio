// Rhythm contract by orientation regime — QA mirror of lib/rhythm.ts.
// Usage: expectedGap(pair, viewport) → { min, max? } | null (null = unasserted)
//
// Note on the contact pairs: `pricing-contact` and `contact-footer` are no
// longer backed by page-level spacers (PAGE_SPACER_CLASSES) — that whitespace
// is now the vertical padding of #contacto itself (SECTION_GAP_Y). The
// expected values below are unchanged; scripts/section-spacing.mjs compensates
// the contact section's own padding when measuring those two pairs.

// Espejo de la clase wrapper de `hero-about` / `about-projects` en
// lib/rhythm.ts PAGE_SPACER_CLASSES. Se PARSEA en vez de fijarse a mano: el
// umbral sale del propio string de clases, así un cambio de 800px en el
// código aparece como diff en este archivo.
const SPACER_WRAPPER_CLASS =
  "landscape:hidden [@media(orientation:landscape)_and_(max-height:800px)]:block";
// Altura (px) por encima de la cual el wrapper queda `hidden` en landscape.
const SPACER_HIDDEN_ABOVE_LANDSCAPE = Number(
  /max-height:(\d+)px/.exec(SPACER_WRAPPER_CLASS)?.[1],
);

/**
 * ¿El wrapper del spacer ocupa alto en este viewport?
 * La clase dice `landscape:hidden` + `:block` para landscape hasta el umbral,
 * y la variante arbitraria gana por orden CSS: luego el spacer SE VE en
 * portrait (cualquier ancho) y en landscape de hasta 800px de alto, y queda
 * OCULTO (gap 0) solo en landscape por encima de ese umbral.
 */
function spacerVisible(vp) {
  const landscape = vp.width > vp.height;
  if (!landscape) return true; // portrait: el wrapper nunca se oculta
  return (
    Number.isFinite(SPACER_HIDDEN_ABOVE_LANDSCAPE) &&
    vp.height <= SPACER_HIDDEN_ABOVE_LANDSCAPE
  );
}

export function regime(vp) {
  const W = vp.width, H = vp.height;
  const landscape = W > H;
  const lg = W >= 1024;
  const gate = lg && H >= 768 && landscape; // FEATURED_STACK_GATE
  return { portrait: !landscape, landscape, lg, gate, spacerVisible: spacerVisible(vp) };
}
export function expectedGap(pair, vp) {
  const r = regime(vp);
  const spacing = vp.width >= 768 ? 128 : 96;
  const T = 10;
  switch (pair) {
    case "hero-about":
      // Wrapper VISIBLE: el spacer aporta el ancho completo del ritmo.
      if (r.spacerVisible) return { min: spacing };
      // Wrapper OCULTO (landscape alto): sin spacer, las cajas quedan pegadas.
      return { min: 0, max: T };
    case "about-projects":
      // Wrapper VISIBLE: spacer estándar (± T porque el título vive dentro de #proyectos).
      if (r.spacerVisible) return { min: spacing - T, max: spacing + T };
      // Wrapper OCULTO (landscape alto): el gap es 0, no un ritmo truncado.
      return { min: 0, max: T };
    case "projects-all-projects":
      return { min: spacing };                            // "" → spacer estandar; el gap medido incluye el heading "Todos" (vive fuera de #all-projects, sanity min)
    case "all-projects-pricing":
    case "pricing-contact":
    case "contact-footer":
      return { min: spacing - T, max: spacing + T };
    case "featured-card-card":
      // Sin asertar en NINGÚN régimen, y no por pereza: fuera de la gate del
      // pin GSAP los panels fluyen en DOS COLUMNAS, así que `card2.top -
      // card1.bottom` mide 0 porque están uno al lado del otro, no porque
      // estén apilados. Es un artefacto de medición, no un gap vertical.
      // Asertar ese 0 congelaría el artefacto; y los 96px que se afirmaban
      // antes venían de clases `portrait:lg:mb-24` /
      // `landscape:lg:[@media(max-height:768px)]:mb-24` que NO EXISTEN en el
      // repo. La verdad honesta es "no observable aquí" → null.
      return null;
    default:
      return null;
  }
}