# Plataforma - tema, scroll, debug y gotchas

<!-- toc:start -->
- [7. Tema y dark mode](#7-tema-y-dark-mode)
- [8. Infraestructura de scroll](#8-infraestructura-de-scroll)
- [10. Debug overlay](#10-debug-overlay)
- [11. Gotchas](#11-gotchas)
- [13. Deuda](#13-deuda)
<!-- toc:end -->
<!-- docs-lint: allow-tokens next-themes ThemeProvider -->

> [!NOTE] Estado: CANONICO
> Parte del canon de geometria que vivia en un solo `components.md` hasta el
> 2026-10-21. Numeracion compartida: este archivo cubre 7, 8, 10 y 11; el resto vive en `sections.md` y `motion.md`.
> Si un cambio visual contradice este archivo, el CODIGO gana y el doc se
> actualiza. Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

## 7. Tema y dark mode

- Tema: `class="dark"` renderizado por el SERVIDOR en el `<html>`
  (layout.tsx). No hay provider ni script de tema: `next-themes` y
  `components/theme-provider.tsx` se eliminaron en el track
  `css-first-reveal` (el tema es forzado y no hay toggle, asi que el provider
  solo inyectaba un script). Sin JS el sitio se ve oscuro, porque la clase
  viene en el HTML.
- `DarkModeToggle` esta DESMONTADO (import comentado en navbar.tsx): reintroducirlo
  requiere plan de tema completo; no descomentar a ciegas. El modo light existe
  solo como derivado de tokens (ver seccion 7 y `tokens.md`), sin UI para
  alternar.

## 8. Infraestructura de scroll

- `SmoothScroll` (`smooth-scroll.tsx`): Lenis SOLO desktop (`window.innerWidth
  >= 768`); config `duration: 0.6`, easing expo-out, `smoothWheel: true`,
  `wheelMultiplier: 1`; `gsap.registerPlugin(ScrollTrigger)`,
  `lenisInstance.on("scroll", ScrollTrigger.update)` con rAF nativo y
  `gsap.ticker.lagSmoothing(0)`.
- **`duration` 0.6, no 1: medido.** Con `scripts/audit-projects.mjs` (desktop
  2048x1280 dpr1.25, gesto `--wheel`, iGPU) la animacion de 1s deja 7.8% de
  frames avanzando menos de la mitad del paso y la pagina llega tarde respecto
  a la mano — ese es el "delay" que se percibe. A 0.6 baja a 4.6%, el salto
  maximo por frame de 43-47px a 39-41px y el ratio max/mediana queda en
  5.0-6.6x. **0.6 gana a 0.5 en las tres metricas** (0.5: cola 4.5-5.1% pero
  ratio 7.3-7.7x, o sea cada notch pega mas fuerte), asi que 0.6 es el valor.
- **La curva NO se cambia.** `ease-in-out` (arranque lento) con input
  re-apuntado acumula deuda: `current` se queda atras de un `target` que sigue
  sumando notches y al cesar el gesto la deuda se descarga de golpe. Medido:
  saltos de 1315px en un frame y el scroll terminando en 0.4s. El ease-out
  exponencial es obligatorio.
- **Frames muertos: ~1 por notch, estructurales.** ~12.6% del gesto y ~26% de
  la ventana asentada, identico con `duration 1`, `duration 0.5`, `duration
  0.6`, `lerp 0.1` y `lerp 0.2` (~108 en valor absoluto en las cuatro). Es el frame en que el
  evento nuevo re-apunta la animacion sin que la posicion avance, y ocurre
  justo cuando la mano se mueve: no se percibe como frenazo y NO es ajustable.
- `useScrollToAnchor(64)`: `lerp: 0.1` (sin duracion fija, ver
  `useScrollToTop`); aterriza con el CONTENIDO del
  target bajo el navbar (compensa la suma de `padding-top` de 2 niveles:
  shell + primer hijo — para `#contacto` eso lee el `SECTION_GAP_Y` que vive en
  `#contact-content` y devuelve el badge/titulo justo bajo el navbar; para el
  resto de anclas ambos niveles son 0, o sea no-op); al completar — o a los
  `ARRIVAL_FALLBACK_MS = 1600ms`, backstop que cubre un tween interrumpido —
  `announceArrival`
  (fija hash con `history.replaceState` CONSERVANDO `history.state`: pasar
  `null` borra el estado de navegacion de Next y mata la transicion en vuelo,
  ver `docs/issues/navigation-race.md`; aborta si el ancla no existe en el
  documento actual, y aplica la clase `arrive` con reflow forzado; mobile:
  `window.scrollTo` + timeout 1000ms). NO usa `:target`
  (replaceState no lo actualiza, ver seccion 9).
- `useScrollToTop`: `lerp: 0.1`, sin duracion fija. El viaje converge en
  `ln(distancia)/6` segundos: ~0,9s a 300px, ~1,2s a 1200px, ~1,5s a 8000px
  (medido: 1241px -> 1260ms; con `duration` fija eran 2s para cualquier
  distancia). Lenis escala el lerp por delta time, asi que el refresco de
  pantalla no cambia la duracion.
- Inicio desde la propia home (`handleHomeClick`): `preventDefault` +
  `history.replaceState(state, "", "/")` + `useScrollToTop`. El hash se limpia
  en el CLICK, no en un `onComplete`: si el visitante interrumpe el scroll, la
  URL igual queda sin ancla.
- Handoff home -> detalle: `saveHomeScroll(scrollY)` en el click de las cards;
  `takeHomeScroll`/`ScrollRestorer` en el retorno. Sin pin no hay pin-spacer que
  esperar: el restorer recalcula el limite de Lenis (`lenis.resize()`) y hace
  `scrollTo(target, { immediate: true })`.
- **Gate de 768px: decision consciente, NO tocar.** `syncTouch = false` es el
  default de Lenis y el codigo no lo overridea, asi que en touch Lenis es
  pasivo: `onVirtualScroll` retorna temprano (lenis.mjs:649-655, sin
  `preventDefault` ni `scrollTo`) y `onNativeScroll` solo adopta la posicion
  del navegador (lenis.mjs:696-707). Por eso la imprecision del gate (un tablet
  o un telefono al rotar cruzan 768px y activan Lenis) no cuesta nada
  perceptible.
- **Descartado: cambiar el gate por `(hover: hover) and (any-pointer: fine)`.**
  Ningun ancho separa desktop de touch (landscape de telefono ~932-956 CSS px
  < portrait de iPad Pro 12.9 = 1024) y ademas seria perdida neta: touch
  dejaria de tener `lenis.scrollTo(..., { onComplete })` preciso para
  `announceArrival` y el `lenis.resize()` del `ScrollRestorer`, degradando a
  `window.scrollTo` + `setTimeout(1000)`.
- **Descartado: mover los imports de `gsap`/`ScrollTrigger` a dynamic.**
  Medido en el chunk del root layout: lenis 4.8 KB + ScrollTrigger 17.4 KB +
  gsap 27.6 KB = 49.9 KB gzip. Ahorraria 0 bytes: `ScrollTrigger` se registra
  solo en `use-gsap-animation.ts:41-45`, `scroll-progress.tsx:17-19` y
  `project-detail.tsx:126,196`, y `ScrollProgress` se renderiza en todas las
  rutas (`app/page.tsx:16`, `app/proyectos/[id]/page.tsx:48`). Solo moveria el
  fetch a un chunk async.
- El 768 es un literal en `smooth-scroll.tsx:14`, NO vive en
  `lib/breakpoints.ts` (seccion 3): no lo centralices sin releer esta seccion.
  `ScrollTrigger` no depende de que Lenis este vivo, asi que el gate no puede
  romper animaciones de scroll. Nota: `import gsap from "gsap"` resuelve por
  `module: index.js` (bundle completo, 71.1 KB), no a un core minimo.

## 10. Debug overlay

- Convencion de profundidad: se cuenta desde el ancestro marcado mas externo.
  Los wrappers sin marcar (wrappers de animacion, `motion.div`) NO
  cuentan, y varias raices hermanas arrancan cada una en l1. Regla: ningun
  marker puede tener nivel <= el de un ancestro marcado.
- `Section.debug`: `default` (l1 outer / l2 inner) o `none` (sin markers). El
  shell no re-mapea niveles: no puede emitir un marker por encima del de su
  ancestro marcado. Sin cambios de layout en produccion (los markers dependen
  de `data-debug-<canal>` en `<html>`).
- Activacion por canal: `LAYOUT_DEBUG: DebugChannel[]` en `app/layout.tsx`;
  cada entrada del array anade un atributo `data-debug-<canal>` al `<html>`.
  `[]` = apagado.
- `l1`..`l5` son nivel de profundidad (l1 = contenedor marcado mas externo,
  cada marcador anidado +1; paleta en `app/globals.css`). `test` es sonda
  desechable de una caja puntual (icono, imagen, span): marca una caja, no un
  nivel, y es ortogonala la profundidad.
- Un canal solo (`LAYOUT_DEBUG = ['l2']`) para depurar el padding de un
  contenedor sin el ruido de los niveles vecinos.
- Mecanismo: `outline` + `outline-offset: -1px`, nunca `border` (cero shift).
- CSS en `app/globals.css` (`@layer utilities`), una regla por canal.
  Uso diario en la skill `layout-debug-canon`; instalacion en otro
  proyecto en la skill global `layout-debug`.

## 11. Gotchas

- `cn()` necesita el registro de tokens fluidos en `lib/utils.ts` (ver
  typography-families.md seccion 8).
- NO agregar `overflow-y-auto` al stack de featured: crea un scroll container
  anidado (el motivo original era el pin de GSAP, retirado el 2026-10).
- `announceArrival` usa `replaceState` + clase, NO `:target` (no confiable
  con replaceState).
- `copyEmail` con fallback mailto: si un futuro cambio de API lo rompe,
  mantener el fallback.
- `Reveal` escribe `data-reveal-item` en el MARKUP y la transicion del fade en
  `.reveal-fade`, no en el estado `shown`: hero y about tambien son items del
  gate, pero su opacidad la escribe GSAP frame a frame, y una transicion ahi
  amortiguaria cada escritura (ademas la red de seguridad de 2s cae en mitad de
  su timeline).
- `DarkModeToggle` desmontado: no reintroducir sin plan.

## 13. Deuda

- 13.3 `DarkModeToggle` desmontado (tema light no ofrecido; forcedTheme).