# Componentes - canon de geometria

> [!NOTE] Estado: CANONICO
> Todo el layout del portfolio esta verificado contra el codigo real
> (componentes bajo `components/`). Si un cambio visual contradice este
> archivo, el CODIGO gana y este documento se actualiza.
> Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

Contenido:

- [1. Shell Section](#1-shell-section)
- [2. Contrato de ritmo](#2-contrato-de-ritmo)
- [3. Gates de media](#3-gates-de-media)
- [4. Geometria por componente](#4-geometria-por-componente)
- [5. Motion primitives](#5-motion-primitives)
- [6. Aurora](#6-aurora)
- [7. Tema y dark mode](#7-tema-y-dark-mode)
- [8. Infraestructura de scroll](#8-infraestructura-de-scroll)
- [9. Cue de llegada a contacto](#9-cue-de-llegada-a-contacto)
- [10. Debug overlay](#10-debug-overlay)
- [11. Gotchas](#11-gotchas)
- [12. CheckList](#12-checklist)
- [13. Deuda unica de componentes](#13-deuda-unica-de-componentes)

## 1. Shell Section

`components/section.tsx` - el envoltorio base de toda seccion:

- `outer` por defecto: `px-6 md:px-12` + `debug-l1` (marcador QA).
- `inner` por defecto: `mx-auto max-w-7xl` + `debug-l2`.
- Props: `as`, `ref`, `id`, `aria-*`, `className` (al wrapper), `insetClassName`
  (REEMPLAZA el padding por defecto), `debug` (`default` | `none`),
  `container` (bool; `false` = full-bleed sin contenido max-width),
  `innerId`, `innerClassName` (SE ANEXA al inner, no lo reemplaza).

Regla: el padding horizontal default de seccion es `px-6 md:px-12`; las
secciones con foto propia usan `px-6 md:px-8 lg:px-12` (tres ladders
distintas para acercar la foto al borde); el detalle de proyecto usa
`lg:px-20`.

## 2. Contrato de ritmo

Fuente unica: `lib/rhythm.ts`. QA espejo: `scripts/rhythm-contract.mjs`.
Auditoria de separaciones: `scripts/section-spacing.mjs` (9 viewports, tolerancia
+/-10px, excepciones declaradas).

- `SECTION_GAP` = `h-24 md:h-32` (96/128px): separacion entre secciones
  top-level, consumida por `components/section-spacing.tsx` como altura del
  spacer de pagina.
- `SECTION_GAP_Y` = `py-24 md:py-32` (96/128px): padding vertical DENTRO del
  contenedor interno `#contact-content` de `#contacto`, consumido por
  `contact-section.tsx` (`innerClassName`). Contacto es la UNICA seccion con
  padding vertical propio: su cue de llegada (ring inset) se pinta en ese hijo
  directo, asi que ahi necesita aire. Pintarlo en el shell daria un rectangulo
  full-bleed. Por eso los pares de pagina pasan de 6 a 4 (`pricing-contact` y
  `contact-footer` retirados de `PageSpacerPair`/`PAGE_SPACER_CLASSES`): el
  ritmo visual entre Pricing<->Contacto y Contacto<->Footer sigue siendo
  96/128px, ahora aportado por ese padding (regla de 2 niveles: shell + primer
  hijo, la misma que usan el aterrizaje del scroll y la auditoria).
- `FEATURED_GAP` = `gap-12` (48px) y `FEATURED_GAP_LG` =
  `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` (120px):
  gap titulo<->card dentro del stack featured, consumido por
  `featured-project-panel.tsx` desde `748c17e`.
- `PAGE_SPACER_CLASSES` (contrato de orientacion, verbatim desde `352ab13`;
  4 pares desde que contacto es dueño de su spacing vertical):

| Par | Clase |
|---|---|
| `hero-about` | `portrait:md:hidden` |
| `about-projects` | (sin wrapper condicional) |
| `projects-all-projects` | (sin wrapper condicional) |
| `all-projects-pricing` | (sin wrapper condicional) |

Reglas: no hand-editear estos valores (editar `lib/rhythm.ts` y correr el
contrato); las variantes arbitrarias ganan por orden CSS.
Excepcion de medicion: como esos dos pares de contacto ya no tienen spacer de
pagina, `scripts/section-spacing.mjs` compensa el padding propio de
`#contacto` (`PADDING_OWNED_PAIRS`) al asertarlos — los valores del contrato
(`scripts/rhythm-contract.mjs`) no cambiaron.

## 3. Gates de media

| Gate | Valor | Consumido por |
|---|---|---|
| `FEATURED_STACK_GATE` | `(min-width: 1024px) and (min-height: 768px) and (orientation: landscape)` | `featured-projects.tsx` (pin GSAP) y `use-lenis.tsx` (`PIN_MEDIA` del ScrollRestorer) |
| Featured gap LARGE | `>=1280px` de ancho y `>=900px` de alto | `FEATURED_GAP_LG` |
| Hero pt alto | `lg` + `min-height:700px` | `lg:[@media(min-height:700px)]:pt-34` |
| Cap titulo featured | `max-height:800px` en `lg` | `lg:[@media(max-height:800px)]:text-4xl` |

Fuente unica del gate de featured: `lib/breakpoints.ts`. No duplicar el string
en otro archivo.

## 4. Geometria por componente

### 4.1 Navbar (`navbar.tsx`)

- `fixed h-16`; nav interior `max-w-7xl px-6`; links: Inicio `/`, Sobre mi
  `#sobre-mi`, Proyectos `#proyectos`, Precios `#precios`.
- Con scroll (umbral 8px): `bg-nav backdrop-blur-none md:backdrop-blur-md
  border-b border-border shadow-sm`.
- Scroll-spy de seccion activa (`hooks/use-active-section.ts`,
  `useActiveSection(spySections)`): IntersectionObserver con
  `rootMargin "-40% 0px -40% 0px"` (banda central del 20%), sin dependencias y
  agnostico al motor de scroll (Lenis desktop / nativo mobile). Observa TODAS
  las secciones de la home en orden documental; `#inicio` limpia el estado
  (arriba ningun link activo) y en huecos entre anclas gana el ultimo activo.
  Entre las secciones presentes en la banda gana SIEMPRE la primera en orden
  documental, evaluada sobre el set COMPLETO de intersecciones (los `entries`
  del IO son deltas por batch: sin el set, el aterrizaje animado de una
  seccion corta — About a 2 columnas en md — dejaba encendida la siguiente
  en iPad portrait 768x1024, donde la banda 409..819 alcanza el top de
  Projects ~552).
  El link activo recibe `aria-current="page"` (se mantiene SIEMPRE, incluso
  mientras su linea colapsada — accesibilidad) + underline de CANAL UNICO:
  una sola linea a la vez — activa = "estas aqui" o hover = "puedes ir
  aqui". Al hacer hover en OTRO link el activo colapsa (`w-0`) y el hover
  toma el canal al 100% (via `transition-[width]`); al retirar el puntero
  el handoff es SECUENCIAL: la linea hover colapsa (200ms) y el activo
  espera `delay-[200ms]` y crece lento (`duration-[400ms]`) — nunca hay
  dos lineas a la vez. Hover sobre el propio activo no cambia la
  linea (sin flicker). Grosor unico `h-px` y `bg-purple-accent` al 100% en
  ambas ramas (sin `/60` ni 1.5px); estado `hovered` en navbar.tsx, limpiado
  al cerrar el menu mobile. Mismo estilo en desktop y mobile;
  `all-projects` enciende "Proyectos" via `SECTION_ALIAS`; `contacto` y
  `footer` (sin link en navLinks) no encienden ninguno.
- Mobile: menu hamburguesa auto-ocultable (`hover:bg-secondary`), links en
  `flex-col gap-3` (12px) con `py-2.5` → target de 44px (Apple HIG) y ritmo
  texto-a-texto de 56px (= el gap-8 historico, decision revisada); CTA abajo
  con `mt-7` (12+28 = 40px visual de separacion, spacing puro — sin divider).
  Eje de alineacion 44px intacto (`px-6` + `pl-5`); el underline del marker
  vive dentro del eje via un wrapper `relative inline-block` que abraza solo
  el label.
- CTA "Contacto": `variant="primary" shape="pill" size="sm"` desktop;
  `size="sm" fullWidth className="py-2.5 mt-7"` mobile (ancho completo,
  label CENTRADO — es un action, no un item de la lista; el eje 44px es
  contrato de la lista de links — ver buttons.md).
- LanguageToggle (`language-toggle.tsx`): outline pill con icono `Globe` +
  codigo ISO (`ES`/`EN`) — el icono da la affordance de control de idioma y
  el codigo el estado actual. `size="sm"` en `sm:+` y `size="compact"` en
  `<sm` (fila mobile ajustada); `gap-1.5` (el gap base 2 ensancharia la fila).
  WCAG 2.5.3 Label in Name: `aria-label` = `"{code} — {switchTo}"`, contiene
  el label visible. `hover:border-purple-accent/15 border-transparent`.
- `useScrollToAnchor(64)` (ancla con offset de navbar) y `useScrollToTop`.

### 4.2 Hero (`hero-section.tsx`)

- `section#inicio` con `min-h-[85dvh]`, pad superior por regimen de altura:
  `pt-22 sm:pt-24 lg:[@media(min-height:700px)]:pt-34 2xl:pt-40`,
  `px-6 md:px-8 lg:px-12`.
- inner `max-w-5xl`, gaps `gap-8 md:gap-12 lg:gap-20`; bloque principal
  `gap-10 2xl:gap-14`; columns `md:flex-row` con TITULO Y BADGE en columna
  **invertida** (imagen derecha, texto izquierda; `md:flex-row-reverse`).
- h1 `text-fluid-display` con ancho medido por JS (`useTitleWidth`, fallback
  ELIMINADO desde 2026-09-20); description `min(titleWidth + 4, 60ch)`.
- Badge flotante: `absolute -bottom-6 -right-6 w-24 h-24 rounded-full shadow-2xl`
  sobre la foto del retrato.
- Retrato: `rounded-4xl shadow-xl aspect-8/9`.
- Etiqueta hero: `text-[10px] 2xl:text-xs font-bold uppercase tracking-tighter
  text-muted-foreground brightness-110` (excepcion documentada: brightness
  sobre muted, ver iteration-guide).
- CTA: "Ver Proyectos" primary pill md con `shadow-md` heredado; "Descargar CV"
  outline pill md con `glow`, `href` de `data/cv.ts` (`cvHref(lang)`, un PDF por
  idioma — mismo archivo que contacto; EN dice "Resume"). Ver buttons.md.
- Cue "Deslizar": indicador de scroll (decisional, ver
  `docs/ideas-features/hero-design.md`; ref corregida desde el canon anterior).

### 4.3 Sobre-mi (`about-section.tsx`)

- `Section#sobre-mi` con `insetClassName="px-6 md:px-8 lg:px-12"`, inner
  `max-w-5xl`, `flex-col-reverse md:flex-row`, gaps
  `gap-8 md:gap-12 lg:gap-14 xl:gap-16`.
- `min-h-[60dvh]`: la seccion nunca baja del 60% del viewport — garantiza que
  toque la banda centrada del scroll-spy en viewports altos (D11, resolucion
  2026-10-01; ver `section-animations.md` punto 5).
- Retrato `aspect-11/9 rounded-4xl shadow-xl`, alto escalado por breakpoint:
  `md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[380px]`, `max-w-[400px]`
  mobile.
- Texto: eyebrow uppercase `text-fluid-eyebrow` + h2 `text-fluid-section`
  serif black con palabra acento; parrafos `text-fluid-body text-content
  max-w-[48ch] leading-relaxed`.
- Animacion: timeline GSAP en scroll (autoAlpha + desplazamientos suaves),
  sin staggers; estados iniciales ocultos en el DOM para evitar flash.

### 4.4 Stack featured (`featured-projects.tsx` + `featured-project-panel.tsx`)

- Titulo standalone (mobile, `Section debug=none`) + seccion `#proyectos`
  (desktop, pin GSAP dentro del `FEATURED_STACK_GATE`).
- El panel (article `featured-panel`) es dueño de su altura dentro del pin:
  NO usa `landscape:lg:min-h-screen` (eliminado en `352ab13`); el pin lo
  mueve, no lo estira.
- Gaps titulo<->card: `FEATURED_GAP` + `FEATURED_GAP_LG` interpolados
  (`gap-12 [@media(min-width:1280px)_and_(min-height:900px)]:gap-30`).
- Margenes inferiores FUERA del gate:
  - `portrait:lg:mb-24`
  - `landscape` con `max-height:768px`: `mb-24`
  - `portrait` md con `max-height:768px`: `mb-12`
  - `last:mb-0` en <=767px
- Panel: `article px-6 md:px-8 lg:px-12`; `panel-content max-w-7xl flex
  flex-col justify-center gap-12 lg:gap-0 pt-12 md:pt-14 lg:pt-0`.
- Grid interno `lg:grid-cols-2 gap-12 lg:gap-0` (imagen izquierda, texto
  derecha, o invertido por panel).
- Imagen mockup: `aspect-4/3 rounded-2xl shadow-2xl ring-1 ring-black/5`;
  badge flotante `-bottom-4 -right-4 w-14 h-14 rounded-full shadow-lg`;
  chips de stack con `shadow-sm` y rings.
- h2 `text-fluid-featured` serif black uppercase con cap de altura y ultima
  palabra `text-purple-accent + brightness-125` (patron E9).
- Stacking por pin GSAP con `matchMedia(FEATURED_STACK_GATE)`; comentario en
  el codigo advierte: NO agregar `overflow-y-auto` al panel (rompe el pin y
  crea scrollbars fantasma).

### 4.5 Todos los proyectos (`all-projects.tsx`)

- Heading: `Section` (markers `default` l1/l2) con clase real
  `insetClassName="px-6"`.
- Grid: `Section#all-projects` con `insetClassName="px-6 pt-12 lg:pt-16"`,
  `innerId="all-projects-content"`; grid `1/2/3` con `gap-6`.
- h2 `text-fluid-section` con palabra "Proyectos" acento + brightness-110.
- `FadeInStagger` + `FadeInItem` en cada card (grid).
- Fuente de datos: `data/projects.ts` (`getFeaturedProjects`, categorias).

### 4.6 ProjectCard (`project-card.tsx`)

- `article h-full bg-card border rounded-2xl overflow-hidden cursor-pointer`
  + hover `hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8`
  (`transition-all duration-300 ease-out`). Featured: `border-purple-accent/40
  ring-1 ring-purple-accent/20` en lugar de `border-border`.
- Imagen `aspect-16/10 bg-muted` con scale suave en hover.
- Cuerpo `p-5`: h3 `text-fluid-card-title font-semibold capitalize`; desc
  `text-fluid-card-desc text-muted-foreground line-clamp-3 max-h-[4.875em]`;
  chip metrica (etiqueta degradada `text-foreground/60`, excepcion acotada);
  footer `mt-auto pt-4 border-t` con link externo `text-muted-foreground/90
  group-hover:text-foreground`.
- Link overlay `z-10` con `aria-label`; `saveHomeScroll(scrollY)` en click
  (handoff de scroll, ver seccion 8).

### 4.7 Pricing (`pricing-section.tsx`)

- `Section#precios` con `innerClassName="max-w-6xl"`; header centrado
  `mb-5 lg:mb-16`; grid `lg:grid-cols-3 gap-6 max-w-md lg:max-w-none`.
- Destacado: card protagonista con `border-purple-accent shadow-2xl` y fondo
  `var(--accent-purple)` inline; badge "Mas popular" `absolute -top-3.5`.
  Texto sobre morado en blanco (regla de blancos, ver iteration-guide).
- CTA: `fullWidth className="py-3.5"`; destacado usa `variant="white"`,
  el resto `variant="outline"`. NUNCA shadow (regla de pricing).
- Hover de cards por GSAP `fromTo` (opacity + lift con boxShadow rgba);
  stagger con `ScrollTrigger` `start: "top 85%"`.

### 4.8 Contacto (`contact-section.tsx`) - VIVO en `page.tsx`

- `Section#contacto` con `insetClassName="px-6"`, `innerId="contact-content"` e
  `innerClassName={`max-w-6xl ${SECTION_GAP_Y}`}` — el padding vertical propio
  (unica seccion con `py`, el ring de llegada necesita aire) vive en el
  contenedor interno, que es donde se pinta el cue: el ring queda como un panel
  `max-w-6xl` centrado en vez de un rectangulo full-bleed.
- Badge "Disponible para proyectos": pill `border-purple-accent/25
  bg-purple-accent/10 text-purple-accent`.
- h2 "Trabajemos juntos": `font-serif font-black uppercase text-fluid-section
  leading-[0.9] tracking-tighter`, palabra "juntos" en acento + brightness-110
  (patron E9).
- CTA row: `flex flex-col lg:flex-row gap-3` — UNA sola fila recién en `lg`
  (a partir de `md` los 5 no caben); por debajo se apila en bloques de 2
  columnas. Orden por prioridad: LinkedIn `primary lg` · grupo [Escríbeme +
  copiar correo] (`outline glow lg`, con estado copiado
  `border-purple-accent/40 text-purple-accent brightness-110`) · grupo
  [Descargar CV + GitHub] (`outline glow lg` cada uno). Descargar CV: icono
  `Download` primero, `href` de `data/cv.ts` — `cvHref(lang)`, un PDF por
  idioma (hoy ES y EN apuntan al mismo PDF EN) — con `download`, y label corto
  `CV`/`Resume` en <sm (clave `ctaCvShort`, el mismo truco de `emailShort`).
  El CV ya no vive solo en el hero. Ver buttons.md.
- `copyEmail`: `navigator.clipboard` con fallback `mailto:`; mensaje de copiado
  temporizado (mejorado en v3, ver buttons.md historial).
- Cue de llegada: wash morado via clase `arrive` (ver seccion 9).

### 4.9 Footer (`footer.tsx`)

- `footer#footer border-t bg-background/50 backdrop-blur-md py-16 px-6`
  (debug-l1); glow inferior: `w-[600px] h-[250px] bg-accent-purple/10
  blur-[120px] rounded-full` centrado bajo el contenido.
- inner `max-w-6xl space-y-12`; grid `1/2/3` con `gap-10 pb-12 border-b
  border-white/10`; marca serif "MaxGB23" (con 23 en acento), bio `max-w-sm`,
  redes (GitHub/LinkedIn) con hovers suaves.
- BOTTOM: copyright una linea. Minimal por decision (sin nav, sin reloj en
  vivo). `FadeIn` en el contenido.

### 4.10 Detalle de proyecto (`project-detail.tsx`)

- Volver: `fixed` arriba-izquierda, pill primary md con `className="back-btn
  pointer-events-auto hover:bg-foreground/80 transition-colors"` (excepcion:
  hover de fondo, NUNCA transition-opacity - GSAP lo controla).
- Hero detalle: `px-6 md:px-12 lg:px-20 pt-20 md:pt-24 pb-12 max-w-5xl`; h1
  `text-fluid-detail` serif black; headline `max-w-2xl`; meta header: circulo
  con numero (`text-foreground/70`, etiqueta degradada) + eyebrow mono.
- Categorias: chips con badges `bg-purple-accent text-white` (regla de blanco
  sobre acento).
- Metrica: `text-fluid-metric` con cifra en acento (section token dedicado,
  ver typography). Boton copiar estilo.
- Switch (metricas/arquitectura): `p-1 rounded-xl bg-card border`; tab activo
  `shadow-sm`; foco visible. Patron ARIA de tabs: `role="tablist"` sobre el
  contenedor, `role="tab"` + `aria-selected` + `aria-controls` por boton,
  `role="tabpanel"` con `aria-labelledby` en el panel. `roving tabindex`
  (solo la tab activa con `tabIndex={0}`) + flechas ←/→ para moverse, que
  seleccionan al mover. NO adoptar `components/ui/tabs.tsx` (shadcn): cambia el
  DOM y obliga a reestilizar. `Home`/`End` fuera a proposito — con dos vistas las
  flechas ya recorren el grupo.
- Visual principal: `max-w-5xl aspect-video rounded-3xl` con glow suave.
- Links: `variant="inverted"` tamaños `lg` (excepcion al tamano default md).
- Editorial: `max-w-3xl` con `text-base 2xl:text-lg` (`2xl:text-lg` por
  pantallas ultra-anchas), `leading-relaxed`, hoja de ruta en codigo.
- Galeria: grid `1/2/3` con `gap-4`; imagenes con `data-tag`? para lightbox.
- CTA final: banda `rounded-3xl border-purple-accent/30 bg-purple-accent/5
  px-6 py-12 md:p-14` con `Volver a proyectos` primary md.
- Lightbox: `z-[70] bg-black/90`, overlay `touch-pan-y select-none`
  (ver `docs/design/pointer-gestures.md`), figcaption `text-white/70`,
  `draggable={false}`.
  - **`z-10` en los tres controles** (X, ◀, ▶). El `<figure>` es `relative` y va
    despues en el DOM: sin `z-index` la imagen pintaba encima y recortaba ~28px de
    cada flecha entre `nav` y ~1144px, donde el figure aun es mas angosto que
    `max-w-5xl`.
  - Flechas ◀ ▶: `bg-black/40 xl:bg-white/10`; X y contador `bg-white/10`. El velo
    blanco se pierde sobre captura clara; ver la regla en `iteration-guide.md`.
  - Breakpoint `nav:` (830px), no `sm:` — entre 640 y 830 hay tablets/landscape con
    swipe, que no necesitan controles de puntero.
  - Teclado: `Escape` cierra, `←`/`→` recorren la galeria (con wrap-around, solo si
    hay >1 imagen). El trap de Tab va en el `div` del dialog, **nunca en
    `window`**: alli seguiria atrapando tras el desmontaje, porque el cleanup del
    scroll-lock corre despues del re-render. Focables filtrados por
    `getClientRects()` para que las flechas ocultas bajo `nav` no cuenten como
    destino.
  - Foco: entra al abrir (boton de cerrar, tras `rAF` porque `backdrop-blur` fuerza
    compositing en el primer frame) y vuelve al boton de galeria al cerrar. El
    efecto de gestion de foco depende del booleano `isLightboxOpen`, no de
    `lightboxIndex`: si dependiera del indice, cada flecha re-ejecutaria el efecto
    y capturaria un control del lightbox como "opener".

### 4.11 ProductsSection - NO RENDERIZADA

- `ProductsSection` esta IMPORTADO en `app/page.tsx` (linea 6) pero NO se
  renderiza (import muerto). Usa CTA `variant="outline" fullWidth
  className="px-5 py-3 justify-between"`. No documentar como seccion viva.

### 4.12 ScrollProgress (`scroll-progress.tsx`)

- Barra fija superior: `fixed top-0 left-0 right-0 z-[60] h-[2px]
  pointer-events-none`; hijo `bg-purple-accent` con `transform: scaleX(0)`
  que GSAP/ScrollTrigger anima a `scaleX(1)` con `scrub: 0.3` desde
  `"top top"` a `"bottom bottom"` del documento. Se monta por pagina
  (home y detalle). `aria-hidden`.

## 5. Motion primitives

`components/motion-primitives.tsx` (framer-motion):

- `FadeIn`, `FadeInStagger`, `FadeInItem`. Viewports: `VIEWPORT` = `{once:
  true, amount: 0.15}`; `VIEWPORT_DELAYED` agrega `margin: "0px 0px -15% 0px"`;
  `STAGGER_VIEWPORT` = `{once: true, amount: "some"}`.
- `FadeIn`: opacity + scale 0.96, 0.55s ease cubic; `FadeInItem`: y 18, 0.5s.
- `FadeIn.as` esta declarado en la interfaz pero NO implementado (siempre
  motion.div; el prop cae en `...rest`) - deuda.
- `SlideIn` y `ScaleIn` YA NO se exportan: no reintroducirlos (se eliminaron
  en el restructure de motion).

## 6. Aurora

- Solo en el hero, solo en dark (`mounted && isDark` + `MutationObserver`
  sobre la clase del `<html>`): es un canvas de ogl/GLSL que renderiza
  particulas/aurora. No replicarlo fuera del hero (costoso); no portarlo a
  otros componentes.

## 7. Tema y dark mode

- `ThemeProvider` con `attribute="class"`, `defaultTheme="dark"`,
  `forcedTheme="dark"` y `disableTransitionOnChange` (layout.tsx): el sitio
  es dark-first y el tema light NO se ofrece en la UI.
- `DarkModeToggle` esta DESMONTADO (import comentado en navbar.tsx): reintroducirlo
  requiere plan de tema completo; no descomentar a ciegas. Ver
  `docs/ideas-features/dark-mode-guide.md`.

## 8. Infraestructura de scroll

- `SmoothScroll` (`smooth-scroll.tsx`): Lenis SOLO desktop (`window.innerWidth
  >= 768`); config `duration: 1`, easing expo-out, `smoothWheel: true`,
  `wheelMultiplier: 1`; `gsap.registerPlugin(ScrollTrigger)`,
  `lenisInstance.on("scroll", ScrollTrigger.update)` con rAF nativo y
  `gsap.ticker.lagSmoothing(0)`.
- `useScrollToAnchor(64)`: duracion 1.4s; aterriza con el CONTENIDO del
  target bajo el navbar (compensa la suma de `padding-top` de 2 niveles:
  shell + primer hijo — para `#contacto` eso lee el `SECTION_GAP_Y` que vive en
  `#contact-content` y devuelve el badge/titulo justo bajo el navbar; para el
  resto de anclas ambos niveles son 0, o sea no-op); al completar,
  `announceArrival`
  (fija hash con `history.replaceState` + clase `arrive` reflow forzado;
  mobile: `window.scrollTo` + timeout 1000ms). NO usa `:target`
  (replaceState no lo actualiza, ver seccion 9).
- `useScrollToTop`: duracion 2s.
- Handoff home -> detalle: `saveHomeScroll(scrollY)` en el click de las cards;
  `takeHomeScroll`/`ScrollRestorer` en el retorno; `PIN_MEDIA` =
  `FEATURED_STACK_GATE` (no pinear en mobile); watchdog del restorer:
  intervalo 60ms, max 20 runs (~1.2s de deadline).

## 9. Cue de llegada a contacto

- Los CTA de pricing y el boton "Contacto" de la navbar hacen smooth-scroll a
  `#contacto`; al completar, `announceArrival` agrega la clase `arrive` que
  reproduce el wash morado (`#contacto.arrive #contact-content` en globals.css
  — el cue se pinta en el contenedor interno para que el ring sea un panel
  `max-w-6xl` centrado y no un rectangulo full-bleed).
- Un clic repetido lo repite: quitar clase, reflow, re-agregar.
- Reduced motion: wash + ring estaticos mientras la clase esta presente
  (el hook la quita ~2.2s).

## 10. Debug overlay

- Convencion de profundidad: se cuenta desde el ancestro marcado mas externo.
  Los wrappers sin marcar (pin GSAP, wrappers de animacion, `motion.div`) NO
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
- NO agregar `overflow-y-auto` al stack de featured (rompe el pin GSAP).
- `announceArrival` usa `replaceState` + clase, NO `:target` (no confiable
  con replaceState).
- `copyEmail` con fallback mailto: si un futuro cambio de API lo rompe,
  mantener el fallback.
- `FadeIn.as` sin implementar: si se necesita renderizar otro elemento,
  implementarlo en motion-primitives (no en cada caller).
- `DarkModeToggle` desmontado: no reintroducir sin plan.

## 12. CheckList

- [ ] Nueva seccion: usar `Section` primero (shell + debug), luego tokens de
      color/tipografia, luego ritmo (`SECTION_GAP`/pares de espaciadores).
- [ ] Verificar contraste: titulos `text-foreground`, cuerpo `text-content`,
      labels `text-muted-foreground` (nunca parrafos en muted).
- [ ] Respecto de reglas de blancos y brightness (ver iteration-guide).
- [ ] Correr audit de ritmo (`scripts/rhythm-contract.mjs`,
      `scripts/section-spacing.mjs`) antes de commitear layout.

## 13. Deuda unica de componentes

- 13.1 `ProductsSection` import muerto en `page.tsx` (importado, no
  renderizado): decidir si se monta o se elimina el import.
- 13.2 `FadeIn.as` declarado sin implementar.
- 13.3 `DarkModeToggle` desmontado (tema light no ofrecido; forcedTheme).
- 13.4 `text-hero-text` en utilidades: se usa en el retrato de featured con
  index label; token mapeado, verificar usos al tocar hero.
- 13.5 La nota "Vercel Preview Deployment activado para la rama
  feat/fluid-typo" del canon anterior se ELIMINO del canon vivo (informacion
  de rama agotada; el snapshot `2026-09-21-pre-designmd` la conserva).