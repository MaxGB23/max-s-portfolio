# Secciones de la home - canon de geometria

<!-- toc:start -->
- [1. Shell Section](#1-shell-section)
- [2. Contrato de ritmo](#2-contrato-de-ritmo)
- [4. Geometria por componente (4.1-4.4)](#4-geometria-por-componente-41-44)
- [9. Cue de llegada a contacto](#9-cue-de-llegada-a-contacto)
- [13. Deuda](#13-deuda)
<!-- toc:end -->

> [!NOTE] Estado: CANONICO
> Parte del canon de geometria que vivia en un solo `components.md` hasta el
> 2026-10-21. Numeracion compartida: este archivo cubre 1, 2, 4.1-4.4 y 9; 3, 5 y 6 viven en `motion.md`;
> Si un cambio visual contradice este archivo, el CODIGO gana y el doc se
> actualiza. Glosario de migracion: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

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
- `SECTION_GAP_Y` = `py-12 md:py-16` (48/64px): padding vertical DENTRO del
  contenedor interno `#contact-content` de `#contacto`, consumido por
  `contact-section.tsx` (`innerClassName`). Contacto es la UNICA seccion con
  padding vertical propio: su cue de llegada (ring inset) se pinta en ese hijo
  directo, asi que ahi necesita aire. Pintarlo en el shell daria un rectangulo
  full-bleed. Por eso los dos pares de contacto (`pricing-contact` y
  `contact-footer`) no llevan wrapper condicional: el ritmo se reparte 50/50
  entre el spacer de pagina (`SECTION_GAP_HALF`, 48/64px, pasado explicitamente
  por `app/page.tsx`) y ese padding (48/64px) — los mismos 96/128px visuales
  entre Pricing<->Contacto y Contacto<->Footer (regla de 2 niveles: shell +
  primer hijo, la misma que usan el aterrizaje del scroll y la auditoria).
- `FEATURED_GAP` = `gap-12` (48px) y `FEATURED_GAP_LG` =
  `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` (120px): gap
  vertical entre los bloques apilados de un panel featured (bloque de heading
  opcional <-> grid texto/imagen), consumido por `featured-project-panel.tsx`
  desde `748c17e`. NO es el gap entre las COLUMNAS texto e imagen de esa grid:
  ese es un valor local del panel (`gap-6 md:gap-12`).
- `PAGE_SPACER_CLASSES` (contrato de orientacion, verbatim desde `lib/rhythm.ts`;
  6 pares):

| Par | Clase |
|---|---|
| `hero-about` | `landscape:hidden [@media(orientation:landscape)_and_(max-height:800px)]:block` |
| `about-projects` | `landscape:hidden [@media(orientation:landscape)_and_(max-height:800px)]:block` |
| `projects-all-projects` | (sin wrapper condicional) |
| `all-projects-pricing` | (sin wrapper condicional) |
| `pricing-contact` | (sin wrapper condicional) |
| `contact-footer` | (sin wrapper condicional) |

Regimen de visibilidad: `hero-about` y `about-projects` son los unicos pares con
wrapper condicional — el spacer renderiza en portrait (cualquier ancho) y en
landscape de hasta 800px de alto (umbral `max-height:800px`, inclusivo). Por
encima de ese umbral el wrapper queda `hidden` y el gap se contrae a 0, porque
el hero ya ocupa el viewport. Los otros cuatro pares son incondicionales.

Reglas: no hand-editear estos valores (editar `lib/rhythm.ts` y correr el
contrato); las variantes arbitrarias ganan por orden CSS.
Excepcion de medicion: como esos dos pares de contacto ya no tienen spacer de
pagina, `scripts/section-spacing.mjs` compensa el padding propio de
`#contacto` (`PADDING_OWNED_PAIRS`) al asertarlos — los valores del contrato
(`scripts/rhythm-contract.mjs`) no cambiaron.

## 4. Geometria por componente (4.1-4.4)

### 4.1 Navbar (`navbar.tsx`)

- `fixed h-16`; nav interior `max-w-7xl px-6`; links: Inicio `/`, Sobre mi
  `#sobre-mi`, Proyectos `#proyectos`, Precios `#precios`.
- Con scroll (umbral 20px, `setScrolled(currentY > 20)`): `bg-nav
  backdrop-blur-none md:backdrop-blur-md border-b border-border shadow-sm`.
  OJO: `SCROLL_THRESHOLD = 8` NO es este umbral — alimenta el auto-hide/show del
  menu mobile, que es otra regla.
- Sin app (JS apagado o script del gate bloqueado por CSP): el fondo condicional
  nunca se activa porque `scrolled` es estado de React. La regla
  `html:not([data-reveal="on"]) .nav-surface` de `globals.css` pinta entonces un
  fondo opaco estatico con `--background` y borde `--border`. NO usa
  `--color-nav`: ese token es translucido a proposito porque depende del
  backdrop blur, que tambien es JS. La regla va sin capa para ganar a
  `bg-transparent`/`border-transparent` sin `!important`. Alcance: cubre "la app
  nunca arranco", no "el bundle murio" (ahi el atributo si esta y el header
  sigue transparente hasta que el JS lo arregle).
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
  WCAG 2.5.3 Label in Name: `aria-label` = `"{code} — {switchTo}"` (raya em,
  U+2014), contiene el label visible.
  `hover:border-purple-accent/15 border-transparent`.
- `useScrollToAnchor(64)` (ancla con offset de navbar) y `useScrollToTop`.

### 4.2 Hero (`hero-section.tsx`)

- `section#inicio` con `min-h-[85dvh]`, pad superior por regimen de altura:
  `pt-20 sm:pt-24 lg:[@media(min-height:700px)]:pt-34` (80 / 96 / 136px),
  `px-6 md:px-8 lg:px-12`. La escalera tiene TRES peldanos, no cuatro: no
  existe peldan `2xl`. Un `2xl:pt-40` quedo como codigo muerto y se elimino
  — nunca aplico, porque `lg:[@media(min-height:700px)]:pt-34` va despues en
  la cascada y gana (medido: pt = 136px a 1920x1080, no 160px).
- La `section` NO lleva `justify-center`: el centrado vive en el bloque l2
  interior (`flex-1 flex flex-col items-center justify-center`), que es el que
  absorbe el sobrante de `min-h-[85dvh]`.
- `.hero-scroll` es el ULTIMO hijo de flujo de la `section` (NO del bloque l2),
  con `shrink-0` y `mt-10 2xl:mt-14`. Al ser el borde inferior de la seccion,
  el indicador queda SIEMPRE a ras de la caja: medido a ras en 390x844
  (1005px), 768x1024 (870px) y 1920x1080 (918px). El espacio sobrante de
  `min-h-[85dvh]` queda POR ENCIMA del indicador, dentro de la seccion — no
  debajo del contenido. (En el canon anterior se describia al contrario: un
  "hueco con el indicador para que About aparezca al hacer scroll". Ese
  encuadre ya no describe el codigo.)
- Mobile 390x844 (comportamiento APROBADO, NO un bug): la caja del hero mide
  1005px de alto, asi que el indicador de scroll queda ~161px POR DEBAJO del
  fold. Es intencionado y esta aprobado; no "corregir" la caja ni el
  `min-h-[85dvh]` para traerlo al viewport.
- inner `max-w-5xl`, gaps `gap-2 md:gap-12 lg:gap-20`; bloque principal
  `gap-10 2xl:gap-14`; columns `md:flex-row` con la columna de TEXTO primero en
  el DOM (queda a la izquierda) y el retrato a la derecha. El gap mobile es
  8px a proposito: en una sola columna el bloque se lee como un conjunto y no
  como dos zonas separadas (`md:gap-12` conserva la escalera por resolucion).
- h1 `text-fluid-display` con ancho medido por JS (`useTitleWidth`, fallback
  ELIMINADO desde 2026-09-20); description `min(titleWidth + 4, 60ch)`.
  Margen titulo -> description `mb-4 md:mb-6`: en mobile el titulo y su
  descripcion son un solo bloque, asi que el aire baja a 16px y `md+` conserva
  los 24px. Mismo contrato que el h2 de sobre-mi.
- Badge flotante: `absolute -bottom-6 -right-6 w-24 h-24 rounded-full shadow-2xl`
  sobre la foto del retrato.
- Retrato: `rounded-4xl shadow-xl aspect-8/9`.
- Etiqueta hero: `text-[10px] 2xl:text-xs font-bold uppercase tracking-tighter
  text-muted-foreground brightness-110` (excepcion documentada: brightness
  sobre muted, ver iteration-guide).
- CTA: "Ver Proyectos" primary pill md con `shadow-md` heredado; "Descargar CV"
  outline pill md con `glow`, `href` de `data/cv.ts` (`cvHref(lang)`, un PDF por
  idioma — mismo archivo que contacto; EN dice "Resume"). Ver buttons.md.
- Cue "Deslizar": indicador de scroll. Es el ULTIMO hijo de flujo de la
  `section`, o sea su BORDE INFERIOR, no un remate colgando debajo del
  contenido: el sobrante de `min-h-[85dvh]` se acumula por encima del indicador
  (dentro de la seccion) porque el bloque l2 lleva `flex-1`. Decisional, ya
  asimilado en este canon.

### 4.3 Sobre-mi (`about-section.tsx`)

- `Section#sobre-mi` con `insetClassName="px-6 md:px-8 lg:px-12"`, inner
  `max-w-5xl`, `flex-col-reverse md:flex-row`, gaps
  `gap-6 md:gap-12 lg:gap-14 xl:gap-16`.
- `min-h-[60dvh] 2xl:min-h-[70dvh] portrait:min-h-[50dvh]`: en landscape la seccion nunca baja del
  60% del viewport — garantiza que toque la banda centrada del scroll-spy en
  viewports altos (D11, resolucion 2026-10-01; ver `section-animations.md`
  punto 5); en 2xl sube a 70% para dar presencia en viewports muy anchos.
  En portrait el alto minimo baja a 50%: en vertical el 60% obligaba
  a un bloque desproporcionado antes del primer proyecto.
- Retrato `aspect-11/9 rounded-4xl shadow-xl`, alto escalado por breakpoint:
  `md:h-[280px] lg:h-[320px] xl:h-[360px] 2xl:h-[380px]`, `max-w-[400px]`
  mobile.
- Texto: eyebrow uppercase `text-fluid-eyebrow` + h2 `text-fluid-section`
  serif black con palabra acento, con `mb-4 md:mb-6` (mismo criterio que el
  h1 del hero: 16px en mobile, 24px desde md); parrafos `text-fluid-body
  text-content max-w-[48ch] leading-relaxed`.
- Animacion: timeline GSAP en scroll (autoAlpha + desplazamientos suaves),
  sin staggers; el estado oculto previo al primer paint lo aporta el gate CSS
  (los nodos llevan `data-reveal-item`), no el markup. El gate oculta solo con
  `opacity`, asi que estos nodos siguen en el arbol de accesibilidad (antes
  llevaban `visibility: hidden` inline y quedaban fuera).

### 4.4 Stack featured (`featured-projects.tsx` + `featured-project-panel.tsx`)

- Titulo standalone (mobile, `Section debug=none`) + seccion `#proyectos`
  (desktop). Sin pin y deliberadamente GSAP-free: el stack vive en el flujo del
  documento (`featured-projects.tsx`) y la animacion de los paneles es el
  one-slide rule (ver `section-animations.md`).
- El panel (article `featured-panel`) es dueño de su altura en el flujo: NO usa
  `landscape:lg:min-h-screen` (eliminado en `352ab13`); nada lo estira ni lo
  desplaza.
- Gaps titulo<->card: `FEATURED_GAP` + `FEATURED_GAP_LG` interpolados
  (`gap-12 [@media(min-width:1280px)_and_(min-height:900px)]:gap-30`).
- Gap titulo -> primera card de la seccion `#proyectos` (desktop):
  `mb-6 md:mb-12 lg:mb-16`. Este es el unico margen que separa el titulo del
  stack: el `article` NO lleva margenes inferiores por regime. Los
  `portrait:lg:mb-24` / `landscape:...mb-24` / `last:mb-0` que el canon anterior
  listaba aqui NO EXISTEN en el repo, y por eso el par `featured-card-card`
  esta sin asertar en `scripts/rhythm-contract.mjs` (ver nota de medicion).
  El bloque de heading del panel (`children`, envuelto en un div con
  `mb-12 md:mb-16`) usa los mismos valores.
- Panel: `article px-6 md:px-8 lg:px-12`; `panel-content w-full max-w-7xl
  mx-auto flex flex-col` + `FEATURED_GAP`/`FEATURED_GAP_LG` interpolados
  (`gap-12 [@media(min-width:1280px)_and_(min-height:900px)]:gap-30`) +
  `pb-12 lg:pb-20` (omitido en el ultimo panel, el spacer de pagina cierra).
- Grid interno `grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12` con `items-stretch`
  para acoplar la imagen a la altura de la columna de texto (texto
  `order-2 lg:order-1`, imagen `order-1 lg:order-2`): `gap-6` en mobile y
  `md:gap-12` desde md. En una sola columna el gap vertical de la grid NO es
  separacion real entre texto e imagen (estan apilados), asi que bajarlo
  hace que el ritmo mobile se lea como un bloque coherente en vez de heredar
  el gap de escritorio; `md:gap-12` conserva la separacion horizontal entre
  columnas a partir de lg. Antes era `gap-12 lg:gap-0`, que anulaba el gap
  justo en el breakpoint donde las columnas son mas estrechas (464px a 1024).
  Medido: sin el, el `max-w-[50ch]` de la descripcion NO ata por debajo de
  ~1280 y el texto llegaba al borde de la imagen. El titulo nunca lleva `max-w`.
- Columna de texto `flex flex-col gap-6`: la columna entrega TODO el ritmo con
  UN solo `gap-*`; los hijos (indice+categoria, h3, descripcion, metrica,
  tags, CTA) no se separan con margenes inferiores, sino con el gap del
  contenedor. Dos margenes sobreviven a esa regla y conviene no confundirlos:
(1) el crop del h3 (`-mb-2 md:mb-0`), que cancela su propio aire de line-box
   y NO separa bloques — el h1 del detalle declara el mismo valor (ver
   `typography-families.md` secciones 4 y 9.3);
   (2) `xl:mb-2` en la metrica y en la fila de tags, preexistente y solo desde
   `xl`, para que en escritorio los iconos no queden pegados al texto. El
   detalle adopto el mismo patron de aflojo en `xl` (headline y header de
   metrics), asi que `xl:mb-2` ya es una convencion del sitio y no un caso
   aislado del panel.
- **REGLA DEL BADGE**: el badge se dimensiona para que su ALTO mas su crop
  iguale el `gap` de la columna (24px), nunca para igualar a otro badge. Dos
  caminos: (a) cabe exacto y NO lleva crop, o (b) excede y lo compensa con un
  negativo proporcional al exceso. El panel aplica (b): `text-xs` + `py-1.5` =
  28px, excede en 4px, de ahi el `-mb-1` de la fila indice+categoria (se anula
  desde `md`). El hero detalle aplica (a), ver 4.10. Si cambia un `py-*` o un
  `text-*` del badge, recalcular su alto contra el gap de la columna: los dos
  badges miden distinto a proposito (escala por rol), lo que no puede variar
  es su separacion visual.
- Fila indice+categoria `gap-2 md:gap-3` (era `gap-4` plano): el `01` y la
  etiqueta se leen como un par, no como dos zonas separadas. Su `-mb-1` es
  crop de badge por la regla anterior, no un margen de ritmo.
- Descripcion `max-w-[50ch] md:max-w-[60ch] lg:max-w-[53ch]`: 50ch en mobile,
  60ch en md (donde la columna es de una sola medida) y 53ch en lg (donde la
  columna se estrecha al 50% del grid y hay que recortar para no rebasar el
  limite de medida).
- Imagen mockup: `aspect-4/3` en móvil + `lg:aspect-auto lg:h-full lg:min-h-[25rem] lg:max-h-[28rem] 2xl:min-h-[28rem] 2xl:max-h-[36rem]`, `rounded-2xl shadow-2xl ring-1 ring-black/5`, `object-cover` intacto; el segundo tramo vive en `2xl` porque ahí crecen texto e iconos (`text-sm→2xl:text-lg`, `w-10→2xl:w-12`), mientras `xl` solo añade `xl:mb-2` de espaciado y lo cubre la banda `lg`; empalme sin salto en 28rem; excepción deliberada de featured, no patrón;
  badge flotante `-bottom-4 -right-4 w-14 h-14 rounded-full shadow-lg`;
  chips de stack con `shadow-sm` y rings.
- h3 `text-fluid-featured` serif black con ultima palabra
  `text-purple-accent + brightness-125` (patron E9). Es `h3` — hijo logico del
  `h2` de la seccion `#proyectos` (cambio de `h2` a `h3` en `3f8191b`); el
  estilo viene de clases explicitas, no del selector de etiqueta.
  `leading-[1.05]` + crop `-mb-2 md:mb-0` (ver la columna de texto).
- Visibilidad de cada panel por geometria (one-slide rule), no por pin: el
  estado se lee del `getBoundingClientRect()` en cada frame de scroll. Gotcha
  vigente: NO agregar `overflow-y-auto` al panel ni al stack, porque crea un
  scroll container anidado dentro de una pagina con autoridad de scroll propia
  (Lenis) y el motivo historico (rompia el pin de GSAP, ya retirado) no es el
  unico riesgo.

## 9. Cue de llegada a contacto

- Los CTA de pricing y el boton "Contacto" de la navbar hacen smooth-scroll a
  `#contacto`; al completar, `announceArrival` agrega la clase `arrive` que
  reproduce el wash morado (`#contacto.arrive #contact-content` en globals.css
  — el cue se pinta en el contenedor interno para que el ring sea un panel
  `max-w-6xl` centrado y no un rectangulo full-bleed).
- Un clic repetido lo repite: quitar clase, reflow, re-agregar.
- Reduced motion: wash + ring estaticos mientras la clase esta presente
  (el hook la quita ~2.2s).

## 13. Deuda

- 13.4 `text-hero-text` en utilidades: se usa en el retrato de featured con
  index label; token mapeado, verificar usos al tocar hero.