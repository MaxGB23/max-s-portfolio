# Tokens del sistema

> [!NOTE] Estado: CANONICO
> Fuente de verdad: `app/globals.css` (bloques `:root`, `.dark` y `@theme inline`).
> Espejo de extraccion: `docs/design/tailwind-v4-theme.css` (NO editar a mano).
> Este documento describe los tokens y sus roles; el CSS real vive en el codigo.

Contenido:

- [1. Identidad](#1-identidad)
- [2. Color](#2-color)
- [3. Tipografia](#3-tipografia)
- [4. Radio](#4-radio)
- [5. Espaciado y ritmo](#5-espaciado-y-ritmo)
- [6. Elevacion](#6-elevacion)
- [7. Responsive](#7-responsive)
- [8. Scrollbar](#8-scrollbar)
- [9. Deuda unica de tokens](#9-deuda-unica-de-tokens)

## 1. Identidad

- Dark-first: el sitio se ve y se diseña en dark. El tema light existe pero la
  marca ES oscura (ver `docs/design/README.md`).
- Un solo acento: morado (`--accent-purple`). Nunca un segundo color de marca.
- Tipo-led: la jerarquia se resuelve con tamano y tracking, no con color
  (`docs/design/typography-families.md`).
- Canon formal del tema: `app/globals.css`; glosario de migracion en
  `docs/design/archive/2026-09-21-pre-designmd/INDEX.md` (snapshot, no canonico).

## 2. Color

Todas las variables son `oklch()`. Se mapean a utilidades Tailwind via
`@theme inline` (`--color-*`). No hay tokens de opacidad: se usa la sintaxis
de Tailwind (`text-foreground/80`).

### 2.1 Neutros shadcn (base)

| Token | Light | Dark | Rol |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.11 0.005 270)` | Lienzo de pagina |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Texto principal (titulos y resaltados) |
| `--content` | `oklch(0.38 0 0)` | `oklch(0.75 0 0)` | Texto de lectura (parrafos, descripciones) |
| `--card` | `oklch(0.98 0 0)` | `oklch(0.15 0.005 270)` | Superficie de cards |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Titulo sobre card |
| `--popover` | `oklch(1 0 0)` | `oklch(0.15 0.005 270)` | Superficie popover/menu |
| `--popover-foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Texto sobre popover |
| `--primary` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Accion principal (boton solido) |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(0.11 0.005 270)` | Texto sobre primary |
| `--secondary` | `oklch(0.96 0 0)` | `oklch(0.2 0.005 270)` | Superficie secundaria (chips, hovers suaves) |
| `--secondary-foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Texto sobre secondary |
| `--muted` | `oklch(0.96 0 0)` | `oklch(0.2 0.005 270)` | Superficie muted |
| `--muted-foreground` | `oklch(0.52 0 0)` | `oklch(0.62 0 0)` | Texto secundario (labels, meta, scrollbar) |
| `--accent` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | Sin uso propio: el acento real es `--accent-purple` (ver deuda 9.3) |
| `--accent-foreground` | `oklch(1 0 0)` | `oklch(1 0 0)` | Texto sobre accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.396 0.141 25.723)` | Error/destructivo |
| `--destructive-foreground` | `oklch(1 0 0)` | `oklch(0.96 0 0)` | Texto sobre destructive |
| `--border` | `oklch(0.91 0 0)` | `oklch(0.25 0.005 270)` | Bordes y divisores |
| `--input` | `oklch(0.91 0 0)` | `oklch(0.25 0.005 270)` | Borde de inputs |
| `--ring` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | Anillo de foco (morado) |

### 2.2 Custom del portfolio

| Token | Light | Dark | Rol |
|---|---|---|---|
| `--hero-text` | `oklch(0.1 0 0)` | `oklch(0.96 0 0)` | Texto en hero (variante local) |
| `--nav-bg` | `oklch(1 0 0 / 0.85)` | `oklch(0.11 0.005 270 / 0.85)` | Fondo de navbar con blur (85% opaco) |
| `--accent-purple` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | EL acento de marca (unico) |
| `--accent-purple-light` | `oklch(0.92 0.08 270)` | `oklch(0.22 0.08 270)` | Version clara del acento (fondos suaves) |

Mapeo a utilidades (`@theme inline`, bloque "Custom portfolio tokens"):

- `--color-nav: var(--nav-bg)` -> `bg-nav`
- `--color-purple-accent: var(--accent-purple)` -> `bg-/text-/border-purple-accent`
- `--color-purple-accent-light: var(--accent-purple-light)` -> `bg-/text-purple-accent-light`
- `--color-hero-text: var(--hero-text)` -> `text-hero-text`

> [!WARNING] Duplicacion en `.dark` (E10 - NO normalizar)
> El bloque `.dark` **redefine como valores directos** `--color-purple-accent`,
> `--color-purple-accent-light`, `--color-nav` y `--color-hero-text`. Es
> intencional: garantiza que en dark los valores ganen sin depender del mapeo
> light. No refactorizar a `var()` sin tocar el CSS con pruebas.

### 2.3 Sidebar (catalogo shadcn, heredado)

`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`,
`--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`,
`--sidebar-border`, `--sidebar-ring`. Se mantienen para compatibilidad con
componentes shadcn; no hay sidebar en el sitio.

## 3. Tipografia

No hay tokens de `font-family` por rol fuera de `@theme`: las familias se
resuelven con `font-sans`, `font-serif`, `font-mono` (ver
`docs/design/typography-families.md`).

Trece tokens `text-fluid-*` (font-size, fluido por `vw`). Valores verbatim de
`app/globals.css`:

| Token | Min | Max | Uso |
|---|---|---|---|
| `text-fluid-display` | `2.5rem` (40) | `5rem` (80) | Titulo h1 del hero |
| `text-fluid-detail` | `2.25rem` (36) | `3.375rem` (54) | h1 del detalle de proyecto |
| `text-fluid-section` | `2rem` (32) | `3.25rem` (52) | h2 de secciones |
| `text-fluid-featured` | `1.75rem` (28) | `2.75rem` (44) | h2 de panel destacado (con cap de altura, ver 3.2) |
| `text-fluid-price` | `2rem` (32) | `2.625rem` (42) | Precio (dominante sobre label, debajo del titulo) |
| `text-fluid-card` | `1.125rem` (18) | `1.5rem` (24) | Titulo generico de card |
| `text-fluid-metric` | `1.125rem` (18) | `1.5rem` (24) | Cifra de metrica en detalle (token dedicado, rol display) |
| `text-fluid-subheading` | `1.5rem` (24) | `2.25rem` (36) | Subtitulos de seccion |
| `text-fluid-body` | `1rem` (16) | `1.125rem` (18) | Cuerpo editorial |
| `text-fluid-card-body` | `1rem` (16) | `1.125rem` (18) | Descripcion en cards |
| `text-fluid-card-title` | `1.125rem` (18) | `1.375rem` (22) | Titulo en grid de cards (cap por columna) |
| `text-fluid-card-desc` | `0.9375rem` (15) | `1rem` (16) | Descripcion en grid de cards (cap por columna) |
| `text-fluid-eyebrow` | `0.9375rem` (15) | `1.1875rem` (19) | Etiquetas uppercase (tracking ancho) |

Reglas del sistema (detalle y razon historica en `typography-families.md`):

- Ratio min->max <= 2.5x; el mas agresivo es `display` (2x, 40->80).
- Dos escalas: editorial fluida (`display`, `detail`, `section`, `featured`,
  `price`, `subheading`, `eyebrow`) y UI casi estatica (`body`, `card-body`,
  `card-title`, `card-desc`).
- `card-title`/`card-desc` estan cappeados por la columna fisica del grid
  (max-w-7xl, 3 cols, gap-6 -> ~395px): el vw global seguiria creciendo
  despues de que la columna deja de crecer.
- `metric` comparte escala con `card` (18->24) pero es un token aparte: es un
  numeral de rol display (font-black, accent) y no debe pedir prestado el token
  de titulo de card generico.
- Los tokens NO incluyen `line-height`: lo fija cada seccion
  (`leading-[0.9]` en titulares, `leading-relaxed` en cuerpo).
- Los tokens solo se registran en CSS; ademas hay que registrarlos en
  `lib/utils.ts` (extendTailwindMerge) o `cn()` los rompe (ver gotchas en
  `docs/design/iteration-guide.md`).

### 3.2 Cap de altura en featured

El h2 del panel destacado apila ademas `lg:[@media(max-height:800px)]:text-4xl`:
en pantallas altas pero con altura disponible pequeña, el titulo se congela en
4xl para no empujar el layout del pin.

## 4. Radio

| Token | Valor | Uso de-facto |
|---|---|---|
| `--radius` | `0.75rem` (12px) | Base |
| `--radius-sm` | `8px` (calc -4px) | Micro-elementos |
| `--radius-md` | `10px` (calc -2px) | Elementos medianos |
| `--radius-lg` | `12px` (= base) | Botones `rounded-xl` |
| `--radius-xl` | `16px` (calc +4px) | Hoveres amplios |

Mapa real en el codigo:

- `rounded-xl` (12px): botones (`shape="rounded"`).
- `rounded-2xl` (16px, escala Tailwind): cards, mockups de featured, panel de pricing.
- `rounded-3xl` (24px): banda CTA de detalle y visual principal.
- `rounded-4xl` (32px): retratos hero / sobre-mi.
- `rounded-full`: pills (botones pill, badges, chips de stack, scroll indicator).

## 5. Espaciado y ritmo

No hay tokens de spacing custom: se usa la escala numerica de Tailwind
(base 0.25rem: `h-24` = 96px, `h-32` = 128px, `gap-12` = 48px, `gap-30` = 120px,
`pt-22` = 88px, `pt-34` = 136px, `pt-40` = 160px).

El ritmo vertical es un contrato de codigo con fuente unica en
`lib/rhythm.ts` (espejo QA: `scripts/rhythm-contract.mjs`):

| Token | Valor | Uso |
|---|---|---|
| `SECTION_GAP` | `h-24 md:h-32` (96 / 128px) | Separacion entre secciones top-level |
| `FEATURED_GAP` | `gap-12` (48px) | Titulo <-> card dentro del stack destacado |
| `FEATURED_GAP_LG` | `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` (120px) | El mismo gap en pantallas altas y anchas |
| `PAGE_SPACER_CLASSES` | ver tabla | Clase del wrapper por par de secciones |

`PAGE_SPACER_CLASSES` (contrato de orientacion, verbatim):

| Par | Clase |
|---|---|
| `hero-about` | `portrait:md:hidden` |
| `about-projects` | `landscape:lg:hidden landscape:[@media(max-height:768px)]:block` |
| `projects-all-projects` | `portrait:lg:hidden landscape:lg:hidden landscape:lg:[@media(max-height:767px)]:block` |
| `all-projects-pricing` | (sin wrapper condicional) |
| `pricing-contact` | (sin wrapper condicional) |
| `contact-footer` | (sin wrapper condicional) |

Las variantes arbitrarias ganan por orden CSS: el ultimo variant ordenado
resuelve el layout. NO reescribir estos valores a mano: editar `lib/rhythm.ts`
y correr `scripts/rhythm-contract.mjs`.

## 6. Elevacion

Decision del sistema: NO existen tokens `--shadow-*`. Las sombras son
patrones ad-hoc, intencionales y documentados aqui (sin inventar, tomados del
codigo real):

| Contexto | Patron real | Por que |
|---|---|---|
| Boton outline con `glow` (opt-in) | `shadow-sm shadow-purple-accent/60` | Firma morada del CTA secundario |
| Hero CTA "Ver proyectos" | `shadow-md` (neutro) | Hover del panel leading (deuda abierta, ver buttons.md) |
| Retratos hero / sobre-mi | `shadow-xl` | Foto, sombra neutra suave |
| Hero badge flotante | `shadow-2xl` | Carta flotando sobre foto |
| Navbar con scroll | `shadow-sm` + `border-b` | Ancla contextural, sutil |
| Cards (ProjectCard) hover | `hover:-translate-y-1.5 hover:shadow-lg hover:shadow-black/8` | Elevacion en hover, sombra negra al 8% |
| Mockup destacado (featured) | `shadow-2xl ring-1 ring-black/5` | Foto; el ring negro evita halo morado |
| Chips / tag circles | `shadow-sm` (con `shadow-gray-700` variante) | Micro-elevacion |
| Pricing destacado | `shadow-2xl` + hover GSAP `0 24px 48px -10px rgba(0,0,0,0.22)` | Tarjeta protagonista, sombra dura |
| Pricing normal | hover GSAP `0 16px 36px -10px rgba(0,0,0,0.11)` | Elevacion media |
| Lightbox | `bg-black/90` (sin sombra) | Capa de fotos, no eleva |

Reglas:

- Sombras **neutrales** (negro / bordes) para fotos y paneles.
- Glow morado SOLO en botones `outline` con prop `glow` (nunca en pricing, nunca
  en solidos).
- El hover de las cards de pricing lo hace GSAP inline (boxShadow con rgba),
  no utilidades Tailwind: al tocar ese componente, mantener la logica GSAP.

## 7. Responsive

Vocabulario del sistema (sin inventar):

- Gates de media en codigo: `FEATURED_STACK_GATE` en `lib/breakpoints.ts`
  (unica fuente, compartida por GSAP y ScrollRestorer):
  `(min-width: 1024px) and (min-height: 768px) and (orientation: landscape)`.
- Escalado de featured a 120px: `>=1280px` de ancho y `>=900px` de alto
  (`FEATURED_GAP_LG`).
- Hero: `lg:[@media(min-height:700px)]:pt-34` (pad superior alto en pantallas
  con altura).
- Topo tipografico: el crecimiento `vw` se agota a los 1600px de ancho
  (3.13vw del display = 50px = cap).
- Paddings horizontales por seccion: ver tabla de geometria en
  `docs/design/components.md` (unica fuente, no duplicar aqui).

## 8. Scrollbar

Scrollbar custom, delgada y silenciosa (base en `app/globals.css`):

- Estandar: `scrollbar-width: thin`; `scrollbar-color: var(--muted-foreground) transparent`.
- WebKit: 6px, track transparente, thumb `muted-foreground` con `border-radius: 10px`
  y borde de 1px del color `background`; hover -> `foreground`.
- `scroll-behavior: auto` (el scroll suave lo gestiona Lenis, no el navegador).

## 9. Deuda unica de tokens

- 9.1 `chart-1..5`: el `@theme` los mapea (`--color-chart-1: var(--chart-1)`),
  pero `:root`/`.dark` NO definen `--chart-1..5`. Las utilities `text-chart-*`
  quedan rotas en silencio. Decidir: definir los cinco o eliminar el mapeo.
- 9.2 `--accent`/`--ring` duplican el valor del acento morado: el sistema usa
  `--accent-purple`; `accent` (shadcn) queda reservado sin uso.
- 9.3 `--color-purple-accent` etc. duplicados como directos en `.dark`
  (E10): documentado en 2.2, NO normalizar.
- 9.4 `--content` no tiene entidad shadcn propia mas alla del mapeo
  `--color-content`: se usa como `text-content` en parrafos. Mantener solo si
  se usa; el contrato de contraste vive en `typography-families.md`.