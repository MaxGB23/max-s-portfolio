# Componentes de listas y detalle - canon de geometria

<!-- toc:start -->
- [4. Geometria por componente (4.5-4.13)](#4-geometria-por-componente-45-413)
- [13. Deuda](#13-deuda)
<!-- toc:end -->
<!-- docs-lint: allow-tokens FadeInStagger -->

> [!NOTE] Estado: CANONICO
> Parte del canon de geometria que vivia en un solo `components.md` hasta el
> 2026-10-21. Numeracion compartida: este archivo cubre 4.5-4.13; 1, 2, 4.1-4.4 y 9 viven en `sections.md`.
> Si un cambio visual contradice este archivo, el CODIGO gana y el doc se
> actualiza. Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

## 4. Geometria por componente (4.5-4.13)

### 4.5 Todos los proyectos (`all-projects.tsx`)

- Heading: `Section` (markers `default` l1/l2) con clase real
  `insetClassName="px-6"`.
- Grid: `Section#all-projects` con `insetClassName="px-6"` y
  `className="pt-6 md:pt-12 lg:pt-16"` (el pad vertical va en `className`, no en
  el inset), `innerId="all-projects-content"`; grid `1/2/3` con `gap-6`.
- h2 `text-fluid-section` con palabra "Proyectos" acento + brightness-110.
- Entrada con `Reveal`: UN `Reveal delayEnter` para el heading y UNO para todo
  el grid (sin stagger por card; antes `FadeInStagger` + `FadeInItemFade`). En
  mobile el grid usa `earlyOnMobile`.
- Fuente de datos: `data/projects.ts` (`getFeaturedProjects`, categorias).

### 4.6 ProjectCard (`project-card.tsx`)

- `article h-full bg-card border rounded-2xl overflow-hidden cursor-pointer`
  + hover `hover:-translate-y-1.5 hover:shadow-lg`
  (`duration-300 ease-out`; `shadow-black/8` retirado por codigo muerto en
  dark mode). Featured: `border-purple-accent/40
  ring-1 ring-purple-accent/20` en lugar de `border-border`.
- Imagen `aspect-16/10 bg-muted` con scale suave en hover. La imagen se pide
  con `loading="eager"` (no lazy): la politica y sus numeros estan en
  `motion.md` 3.
- Cuerpo `p-5`: h3 `text-fluid-card-title font-semibold capitalize`; desc
  `text-fluid-card-desc text-muted-foreground line-clamp-3 max-h-[4.875em]`;
  chip metrica (etiqueta degradada `text-foreground/60`, excepcion acotada);
  footer `mt-auto pt-4 border-t` con link externo `text-muted-foreground/90
  group-hover:text-foreground`.
- Link overlay `z-10` con `aria-label`; `saveHomeScroll(scrollY)` en click
  (handoff de scroll, ver seccion 8).

### 4.7 Pricing (`pricing-section.tsx`)

- `Section#precios` con `innerClassName="max-w-6xl"`; header centrado
  `mb-6 lg:mb-16`; grid `lg:grid-cols-3 gap-6 max-w-md lg:max-w-none`.
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
  vivo). Dos `Reveal`: grid de navegacion sin delay y barra de copyright con
  `delay={0.1}`.

### 4.10 Detalle de proyecto (`project-detail.tsx`)

- Volver: `fixed` arriba-izquierda, pill primary md con `className="back-btn
  pointer-events-auto hover:bg-foreground/80 transition-colors"` (excepcion:
  hover de fondo, NUNCA transition-opacity - GSAP lo controla).
  El control NAVEGA, asi que es un `<a href="/">` real dentro de `Button
  asChild`, no un `<button>` (2026-10-19): la pagina no renderiza navbar, asi
  que sin JS era el unico camino de vuelta dentro del sitio y estaba muerto. El
  `onClick` hace `preventDefault()` y ejecuta la logica de siempre (history +
  scroll restaurado si venimos del grid, `replace("/")` en llegada directa), de
  modo que con JS el href nunca se sigue y el comportamiento no cambia.
- Hero detalle: `px-6 md:px-12 lg:px-20 pt-22 md:pt-24 2xl:pt-26 pb-12 md:pb-16 max-w-5xl`.
  El `pt` superior iguala el espaciado entre el boton Volver flotante y el badge
  de categoria (88 / 96 / 104px).
  La columna interna es `flex flex-col gap-6` y entrega TODO el ritmo del hero
  con ese UNICO `gap-*`: el wrapper del badge perdio `mb-6` y el wrapper de
  `StackChips` perdio `mt-8`, asi que los hermanos del bloque NO declaran
margen vertical. Badge `px-3.5 py-1 text-xs 2xl:text-sm`: el `py-1` es
  deliberado y hace que mida EXACTAMENTE el `gap-6` (12px + 8px = 24px), por
  lo que NO lleva crop - camino (a) de la REGLA DEL BADGE en 4.4. OJO: es un
  `<span>` inline y los margenes verticales NO aplican a inline, asi que un
  `-mb-*` ahi seria codigo muerto. Su tamano (un escalon bajo el del panel) es
  jerarquico: metadata de una linea sobre un h1 de 54px. En `2xl` crece a
  `text-sm` (26px), +2px sin compensar, asumido.
  h1 `text-fluid-detail` serif black `leading-[1.05]`, con crop `-mb-2 md:mb-0`
  - el MISMO declarado que el h3 del panel destacado (ver
  `typography-families.md` secciones 4 y 9.3); headline `max-w-2xl` con
  `xl:mb-2`, que AFLOJA en escritorio como la metrica y los tags del panel (no
  es crop: no cancela aire de line-box, separa bloques); meta header: circulo con
  numero (`text-foreground/70`, etiqueta degradada) + eyebrow mono. El header de
  metrics lleva `gap-4 mb-6 xl:mb-8`: aprieta en mobile y recupera el margen
  original en `xl`, un tercer patron (aflojo en ancho) que no debe confundirse
  con el crop. El bottom del hero es la excepcion a la regla de mas abajo:
  AFLOJA en desktop (48 -> 64px) mientras todo lo demas aprieta mobile.
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
- Tabs legibles por crawlers y LLM (2026-10-13): los dos `tabpanel` van SIEMPRE
  montados con ids fijos (`detail-panel-kpis`, `detail-panel-topology`, los que
  las tabs ya referencian en `aria-controls`); el inactivo se oculta con
  `hidden`, NUNCA se desmonta con `&&`. Asi el HTML inicial/SSR trae metricas +
  arquitectura sin interaccion: los LLM y scrapers sin JS tambien leen el trabajo
  tecnico. Excepcion deliberada: `KpiGrid` conserva montaje condicional para que
  el count-up se repita al volver a su tab.
- Bloques de arriba abajo con `mb-12 md:mb-16` (metrics, links, y tambien los
  bloques de lectura `.detail-section`: summary, problem, role, solution,
  gallery) y `mb-6 md:mb-16` (visual principal): el ancho ya no carga el margen
  de desktop, asi que cada bloque lo declara y mobile va mas cerrado. El visual
  principal baja a `mb-6` porque su banda es visualmente autosuficiente; los de
  metrics, links y lectura mantienen `mb-12` porque separan bloques de lectura.
- REGLA de espaciado del detail: cada margen declara su par mobile/desktop y
  mobile va mas cerrado. `SectionTitle` la sigue en `mb-3 md:mb-3.5` (antes
  `mb-5` plano). Los `.detail-section` dejaron de llevar `mb-16` plano al
  adoptarla — la regla ya existia para metrics y links, el codigo de lectura
  era el que se habia quedado atras.
- Fila de cabecera de metrics: `flex flex-col md:flex-row md:items-end
  justify-between gap-4 mb-6` (era `gap-6 mb-8`). El `mb-6` sigue PLANO, sin
  par mobile/desktop: la escalera de la regla de arriba aplica a los bloques
  `.detail-section`, no a las filas dentro de una cabecera. Aprieta en la misma
  linea que el hero.
- Estos valores son LOCALES a `project-detail.tsx`, NO salen de `lib/rhythm.ts`:
  el contrato de ritmo se scopea al espaciado entre secciones de primer nivel y
  excluye explicito los gaps intra-componente (mismo caso que `gap-6 md:gap-12`
  del featured panel). `mb-12 md:mb-16` coincide NUMERICAMENTE con
  `SECTION_GAP_Y` (`py-12 md:py-16`) por conveniencia, no por acoplamiento: no
  deduplicar uno contra otro.
- Visual principal: `max-w-5xl aspect-video rounded-3xl` con glow suave. La
  imagen sale de `detail.visual?.src ?? project.image` — `visual` es la portada
  propia del detail y es opcional; sin ella cae a la imagen de la card.
- Links: `variant="inverted"` tamaños `lg` (excepcion al tamano default md).
- Editorial: `max-w-3xl` con `text-base 2xl:text-lg` (`2xl:text-lg` por
  pantallas ultra-anchas), `leading-relaxed`, hoja de ruta en codigo.
- Galeria: grid `1/2/3` con `gap-4`; imagenes con `data-tag`? para lightbox.
- CTA final: banda `rounded-3xl border-purple-accent/30 bg-purple-accent/5
  px-6 py-12 md:p-14` con `Volver a proyectos` primary md.
- Lightbox: `z-[70] bg-black/90`, overlay `touch-pan-y select-none`
  (ver `docs/design/pointer-gestures.md`), figcaption `text-white/70`,
  `draggable={false}`.
  - Las imagenes del visor quedan TODAS montadas y apiladas (`fill`); la activa
    es `opacity-100` y el resto `opacity-0 pointer-events-none`, con
    `transition-opacity duration-100`. Montar solo la activa remontaba el
    `<Image>` en cada flecha y la siguiente llegaba sin cache; con el set en el
    DOM, `next`/`prev` no hace ninguna request (medido: 0 requests al abrir).
  - Las variantes del visor se precargan al ACERCARSE la galeria
    (IntersectionObserver con `rootMargin: 300px` mas `pointerenter`): hover
    solo no existe en tactil, asi que no puede ser el unico disparador.
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

### 4.13 Grafo de arquitectura (`project-architecture.tsx`)

- Grid de hijos: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` con
  `sm:pt-8` (deja sitio al bus horizontal, que es absoluto y solo `sm+`).
  En `lg` cada card es de ~1/3 de ancho: por eso los titulos de nodo deben
  ser CORROS (~17-25 caracteres). Un titulo largo es legal y se parte, pero
  eleva la fila, porque el grid estira las cards a la mas alta.
- Cabecera de card con SANGRIA FRANCESA: `relative pl-7 mb-2`, numero en
  `absolute left-0 top-0`, y el `h4` a ancho completo. Asi los renglones de
  continuacion alinean bajo la primera letra del titulo, no debajo del numero.
- PROHIBIDO `flex-wrap` en esa cabecera (defecto corregido): el `h4` es un
  solo nodo de texto, asi que en cuanto el conjunto no cabe entero el
  navegador lo baja a una linea flex nueva y el numero queda huerfano solo
  arriba. Con `flex-wrap` + `items-center` el defecto se agrava: al partirse
  el titulo, `items-center` centraba el numero en medio del bloque. Por eso
  la cabecera no es flex.
- Lo que obliga a los titulos cortos y a la sangria francesa es el MISMO
  contrato: `detail.solution[]` y `detail.architecture{}` repiten el mismo
  contenido, y los 9 nodos del grafo deben repetir textualmente la etiqueta de
  su bullet en Solucion. Si divergen, el lector ve dos versiones del mismo
  modulo en la misma pagina.
- Verificado visualmente por el dueno tras el cambio, con un titulo corto y
  uno largo en la misma fila del grid: el numero queda alineado con la primera
  letra del titulo y la continuacion alinea debajo, sin numero huerfano.

## 13. Deuda

- 13.1 `ProductsSection` import muerto en `page.tsx` (importado, no
  renderizado): decidir si se monta o se elimina el import.

- 13.7 Detalle de proyecto sin JS (2026-10-19): AMBAS vistas viajan en el HTML
  (decisión 2026-10-13), pero el switcher de tabs y el lightbox de la galeria
  son JS puro, asi que sin JS quedan sin alcanzar. DEUDA ACEPTADA, no
  pendiente: navegar sin JS es deliberado y rarisimo, y el contenido ya esta
  indexable e imprimible. La unica pieza que SI se arreglo es el boton Volver
  (ver 4.10): era un callejon real, no una comodidad. Reimplementar tabs
  (`:target`, radios CSS) o galeria como pagina aparte queda DESCARTADO:
  duplicaria la fuente de verdad del estado activo y arriesga la experiencia
  con JS, que es la que importa.