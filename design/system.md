# Sistema de diseño — projects-catalog (`feat/projects-catalog`)

Sistema **derivado**: todos los valores de este documento aparecen en fuentes vivas del
repositorio y cada entrada nombra su `path`. Nada está inventado. Las sombras y el
`z-index` **no tienen tokens** en este proyecto: en esos dos grupos solo se registran los
valores que los componentes escriben a mano.

Generado con la sync de `gentle-design`. El tablero que acompaña este archivo es
`design/system.html` (1440 px, autocontenido, con las dos familias reales embebidas como
`data:` URIs y sin ninguna URL externa).

## Fuentes leídas

| path | papel |
| --- | --- |
| `app/globals.css` | **fuente de verdad**: `:root`, `.dark`, `@theme inline`, base, focus ring, scrollbar, gates de motion |
| `app/layout.tsx` | tema forzado (`<html className="dark">`), fuentes cargadas con `next/font`, breakpoints de debug |
| `docs/design/tailwind-v4-theme.css` | espejo de referencia de `app/globals.css` (lo dice su cabecera: "NO cargar en el build", gana `app/globals.css`) |
| `styles/globals.css` | **retirado el 2026-11-07**: nunca estuvo importado y sus valores chocaban con `app/globals.css`; su fila vive en `docs/design/DEAD.md` |
| `components.json` | confirma `"css": "app/globals.css"`, `baseColor: neutral`, `style: new-york` |
| `postcss.config.mjs` | `@tailwindcss/postcss` (Tailwind v4, sin `tailwind.config.*` en el repo) |
| `lib/rhythm.ts` | únicos tokens de espaciado vertical con nombre |
| `components/ui/button.tsx` | contrato de botones (`cva`) |
| `components/section.tsx`, `components/page-spacing.tsx`, `components/section-spacing.tsx` | shell de sección y ritmo entre secciones |
| `components/project-card.tsx`, `components/pricing-section.tsx`, `components/contact-section.tsx`, `components/footer.tsx`, `components/navbar.tsx`, `components/hero-section.tsx`, `components/products-section.tsx`, `components/project-architecture.tsx` | reglas de componente observadas |
| `docs/design/archive/ejemplos/bugatti/tailwind-v4-theme.css` | **archivo muerto**: leído solo para descartarlo; no aporta ni un valor a este sistema |

No existe ningún `@font-face` en el repositorio (búsqueda en `*.css`, `*.ts`, `*.tsx`,
`*.html`): las familias entran por `next/font/google` desde `app/layout.tsx` y el build
genera los `@font-face` con los woff2 subsetted. `design/system.html` embebe esos mismos
archivos (ver Fidelidad).

## Modo

El tema es **oscuro forzado**: `app/layout.tsx` renderiza `<html className="dark">` como
constante de servidor, sin toggle (el `DarkModeToggle` está comentado en `navbar.tsx`).
La paleta clara existe en `:root` pero no se activa en producción.

---

## 1. Color

32 nombres de token en `:root` (claro) + 32 redefiniciones en `.dark` + 4 overrides
directos solo-dark en `.dark`. Fuente: `app/globals.css`.

### Tokens semánticos

| token | claro (`:root`) | oscuro (`.dark`) | uso observado |
| --- | --- | --- | --- |
| `--background` | `oklch(1 0 0)` | `oklch(0.11 0.005 270)` | `body` (`bg-background`), superficie de página |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | texto principal, `bg-foreground` de botón primario |
| `--content` | `oklch(0.38 0 0)` | `oklch(0.75 0 0)` | párrafos de cuerpo (`text-content`, 19 usos) |
| `--card` | `oklch(0.98 0 0)` | `oklch(0.15 0.005 270)` | `bg-card` en cards de proyecto, pricing y footer |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | `text-card-foreground` (`ui/card.tsx`) |
| `--popover` / `--popover-foreground` | `oklch(1 0 0)` / `oklch(0.13 0 0)` | `oklch(0.15 0.005 270)` / `oklch(0.96 0 0)` | `bg-popover` en overlays de Radix |
| `--primary` / `--primary-foreground` | `oklch(0.13 0 0)` / `oklch(1 0 0)` | `oklch(0.96 0 0)` / `oklch(0.11 0.005 270)` | controles de formulario (`ui/input.tsx`, `ui/checkbox.tsx`) |
| `--secondary` / `--secondary-foreground` | `oklch(0.96 0 0)` / `oklch(0.13 0 0)` | `oklch(0.2 0.005 270)` / `oklch(0.96 0 0)` | `bg-secondary` en chips y hover de iconos (`project-card.tsx`) |
| `--muted` / `--muted-foreground` | `oklch(0.96 0 0)` / `oklch(0.52 0 0)` | `oklch(0.2 0.005 270)` / `oklch(0.62 0 0)` | `bg-muted` de slot de imagen; `text-muted-foreground` (69 usos) para texto secundario, eyebrows y footer |
| `--accent` / `--accent-foreground` | `oklch(0.58 0.22 270)` / `oklch(1 0 0)` | `oklch(0.62 0.22 270)` / `oklch(1 0 0)` | **morado de marca**: foco (`--ring`), item activo de menús |
| `--destructive` / `--destructive-foreground` | `oklch(0.577 0.245 27.325)` / `oklch(1 0 0)` | `oklch(0.396 0.141 25.723)` / `oklch(0.96 0 0)` | errores de formulario y variantes `destructive` de `components/ui/*` |
| `--border` | `oklch(0.91 0 0)` | `oklch(0.25 0.005 270)` | `border-border` en cards, navbar, footer, divisores |
| `--input` | `oklch(0.91 0 0)` | `oklch(0.25 0.005 270)` | `border-input` en inputs, selects, checkboxes |
| `--ring` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | anillo de foco único del sitio (`app/globals.css`, `:where(...):focus-visible`) |

### Tokens de portafolio (capa propia, además de la base shadcn)

| token | claro | oscuro | uso observado |
| --- | --- | --- | --- |
| `--hero-text` | `oklch(0.1 0 0)` | `oklch(0.96 0 0)` | declarado y mapeado a `--color-hero-text`; **0 usos** de `text-hero-text` en el código |
| `--nav-bg` | `oklch(1 0 0 / 0.85)` | `oklch(0.11 0.005 270 / 0.85)` | superficie translúcida de la navbar vía `bg-nav` + `backdrop-blur-md` (`navbar.tsx`) |
| `--accent-purple` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | morado de marca usado como utilidad `purple-accent` (heading del hero, badges, pricing destacado) |
| `--accent-purple-light` | `oklch(0.92 0.08 270)` | `oklch(0.22 0.08 270)` | fondo del chip de `products-section.tsx` (`bg-purple-accent-light`) |

### Tokens de sidebar

`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`,
`--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`
(claro y oscuro) están declarados en `app/globals.css` y **no hay `components/ui/sidebar.tsx`
ni ningún uso**: son residuo del scaffold de shadcn.

### Mapeos colgantes

`@theme inline` mapea `--color-chart-1` … `--color-chart-5` a `var(--chart-1)` … `var(--chart-5)`,
pero `app/globals.css` **no define** `--chart-1..5` en `:root` ni en `.dark`. El único archivo
que las definía era `styles/globals.css`, retirado el 2026-11-07 por no estar importado,
así que hoy las utilidades `text-chart-*` / `bg-chart-*` quedan vacías en silencio: la
retirada quitó la pista falsa, no la causa.

### Valores de color no tokenizados (literales en componentes)

| valor | path | uso |
| --- | --- | --- |
| `#5865F2` | `components/hero-section.tsx` (`hero-badge`) | fondo del badge de saludo, con `border: 12px solid var(--background)` |
| `#223068`, `#000000`, `#3b337a` | `components/hero-section.tsx` → `Aurora` | `colorStops` del fondo animado del hero |
| `#34d399` (`emerald-400`), `#10b981` (`emerald-500`) | `components/navbar.tsx` | punto "disponible" con `animate-ping` |
| `#f87171`, `#22c55e`, `#eab308`, `#60a5fa`, `#a78bfa`, `#f5f5f5` | `app/globals.css` (`@layer utilities`) | outlines del overlay de QA (`data-debug-*`); herramienta de medición, no UI |

---

## 2. Tipografía

### Familias (3 tokens en `@theme inline`, `app/globals.css`)

| token | valor declarado | fuente cargada | uso |
| --- | --- | --- | --- |
| `--font-sans` | `var(--font-inter), ui-sans-serif, system-ui, sans-serif` | **Inter** vía `next/font/google` (`app/layout.tsx`, `variable: '--font-inter'`) | base del `body` (`font-sans antialiased`); navbar, botones, cuerpo |
| `--font-serif` | `var(--font-space-grotesk), ui-serif, Georgia, serif` | **Space Grotesk** vía `next/font/google` (`app/layout.tsx`, `variable: '--font-space-grotesk'`) | **display del sitio**: `font-serif` en 19 lugares (h1 del hero, títulos de sección, títulos de card, pricing) |
| `--font-mono` | `'Geist Mono', 'Geist Mono Fallback'` | **ninguna**: no hay `@font-face`, no hay `next/font` para mono y `geist` no está en `package.json` | `font-mono` en labels de categoría de `project-card.tsx` |

Ambigüedad de nombre: la cara display se llama **`serif`** pero es **Space Grotesk**, una
grotesca geométrica; el fallback declarado después de la variable sí es serif
(`ui-serif, Georgia, serif`). Si Space Grotesk no carga, el display cambia de género.

**El display nunca llega a 900.** La variable de Space Grotesk va de 300 a 700 y el sitio
declara `font-black` (900) en 19 lugares. El navegador no puede superar el máximo de la
familia: el CSS dice 900 y el dibujo es 700. Inter sí llega a 900.

### Escala fluida (13 tokens `--text-fluid-*`, `@theme inline`)

`rem` a 16px; columna @1440 = valor del `clamp()` en un viewport de 1440 px (14.4 px por `1vw`).

| token | `clamp()` | mín | @1440 | máx |
| --- | --- | --- | --- | --- |
| `--text-fluid-display` | `clamp(2.5rem, 1.88rem + 3.13vw, 5rem)` | 40 px | 75.2 px | 80 px |
| `--text-fluid-detail` | `clamp(2.25rem, 1.9rem + 1.47vw, 3.375rem)` | 36 px | 51.6 px | 54 px |
| `--text-fluid-section` | `clamp(2rem, 1.72rem + 1.4vw, 3.25rem)` | 32 px | 47.7 px | 52 px |
| `--text-fluid-featured` | `clamp(1.75rem, 1.52rem + 1.15vw, 2.75rem)` | 28 px | 40.9 px | 44 px |
| `--text-fluid-price` | `clamp(2rem, 1.8rem + 1vw, 2.625rem)` | 32 px | 42 px (tope) | 42 px |
| `--text-fluid-subheading` | `clamp(1.5rem, 1.27rem + 0.98vw, 2.25rem)` | 24 px | 34.4 px | 36 px |
| `--text-fluid-card` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 px | 23.2 px | 24 px |
| `--text-fluid-metric` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 px | 23.2 px | 24 px |
| `--text-fluid-card-title` | `clamp(1.125rem, 1.05rem + 0.32vw, 1.375rem)` | 18 px | 21.4 px | 22 px |
| `--text-fluid-card-desc` | `clamp(0.9375rem, 0.9rem + 0.12vw, 1rem)` | 15 px | 16 px (tope) | 16 px |
| `--text-fluid-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 px | 17.7 px | 18 px |
| `--text-fluid-card-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 px | 17.7 px | 18 px |
| `--text-fluid-eyebrow` | `clamp(0.9375rem, 0.86rem + 0.33vw, 1.1875rem)` | 15 px | 18.5 px | 19 px |

Escala fija usada en componentes: `text-xs` (labels, badges, footer), `text-sm` (botones,
navbar, descripción de card → `2xl:text-base`), `text-base` (links de navbar, nav mobile),
`text-xl` (marca del footer).

### Pesos observados (81 declaraciones en `components/*.tsx`)

| peso | clase | uso |
| --- | --- | --- |
| 400 | (sin clase) | cuerpo por defecto |
| 500 | `font-medium` | links de navbar, eyebrow del hero, label de disponibilidad |
| 600 | `font-semibold` | botones (`ui/button.tsx`), badges, badges de pricing |
| 700 | `font-bold` | títulos de card, marca del footer, nombres de plan |
| 900 | `font-black` | display declarado: h1 del hero, títulos de sección, precio, numeral de métrica. En Space Grotesk se dibuja al 700 (máximo de la familia) |

### Tracking, leading y caja

| regla | valor | dónde |
| --- | --- | --- |
| `tracking-tighter` | display y títulos de sección en mayúsculas | `hero-section.tsx`, `contact-section.tsx` |
| `sm:tracking-[0.01em]` | corrección del apellido del hero | `hero-section.tsx` |
| `tracking-widest` | eyebrow del hero, "desde" de pricing, categoría mono de card | `hero-section.tsx`, `pricing-section.tsx`, `project-card.tsx` |
| `tracking-wider` | label de disponibilidad de la navbar, heading del footer | `navbar.tsx`, `footer.tsx` |
| `leading-[0.9]` | display en mayúsculas (hero, títulos de sección) | `hero-section.tsx`, `contact-section.tsx` |
| `leading-[1.05]` | headings display de detalle y featured | documentado en `lib/rhythm.ts`, componentes |
| `leading-relaxed` | cuerpo y descripciones | `hero-section.tsx`, `project-card.tsx`, `pricing-section.tsx` |
| `uppercase` | display, eyebrows, badges, categorías | varios |
| `tabular-nums` | precios | `pricing-section.tsx` |
| `text-balance` | títulos de card | `project-card.tsx` |
| `antialiased` | `body` | `app/layout.tsx` |

### Breakpoint de navegación

`--breakpoint-nav: 830px` (`app/globals.css`, `@theme inline`) — único breakpoint de token;
el resto son los de Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536).

---

## 3. Espaciado

### Tokens de ritmo (`lib/rhythm.ts`)

| token | valor | px | uso |
| --- | --- | --- | --- |
| `SECTION_GAP` | `h-24 md:h-32` | 96 / 128 | separación entre secciones de primer nivel (altura del spacer de página) |
| `SECTION_GAP_HALF` | `h-12 md:h-16` | 48 / 64 | mitad de página en los dos pares que contact divide |
| `SECTION_GAP_Y` | `py-12 md:py-16` | 48×2 / 64×2 | padding interno de `#contacto` (para que el ring de llegada tenga aire) |
| `FEATURED_GAP` | `gap-12` | 48 | gap vertical entre bloques de un panel featured |
| `FEATURED_GAP_LG` | `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` | 120 | mismo gap en viewports altos y anchos |

### Constantes estructurales (sin token propio)

| valor | path | uso |
| --- | --- | --- |
| `px-6 md:px-12` | `components/section.tsx` (`DEFAULT_INSET`) | inset horizontal canónico de toda sección; algunas secciones lo reemplazan (`px-6` en contact) |
| `mx-auto max-w-7xl` | `components/section.tsx` (`DEFAULT_INNER`) | ancho de contenido 1280 px |
| `max-w-6xl` | `contact-section.tsx`, `footer.tsx`, `navbar.tsx` (menú mobile) | 1152 px |
| `max-w-5xl` | `hero-section.tsx` | 1024 px |
| `h-16` | `navbar.tsx` | altura de la navbar: 64 px |
| `scroll-margin-top: 5rem` | `app/globals.css` (`section[id]`) | 80 px de holgura para el hash landing bajo la navbar fija |

La escala numérica de Tailwind v4 (`--spacing: 0.25rem`) no está declarada en el repo: es
el default de la librería. Gaps observados en componentes: `gap-2`, `gap-3`, `gap-4`,
`gap-6`, `gap-8`, `gap-10`, `gap-12`, `gap-14`, `gap-20`, `gap-30`.

---

## 4. Radio

| token | valor | px | fuente |
| --- | --- | --- | --- |
| `--radius` | `0.75rem` | 12 | `app/globals.css` `:root` |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 8 | `@theme inline` |
| `--radius-md` | `calc(var(--radius) - 2px)` | 10 | `@theme inline` |
| `--radius-lg` | `var(--radius)` | 12 | `@theme inline` |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 16 | `@theme inline` |

Radios usados fuera de la escala de tokens: `rounded-2xl` (16 px, cards de proyecto y pricing,
paneles featured), `rounded-4xl` (32 px, retratos del hero y about), `rounded-full` (botones
`shape="pill"`, badges, avatares, iconos sociales), `rounded-lg` (botón de menú mobile,
chip de link externo), `rounded-[4px]` (`ui/checkbox.tsx`), `border-radius: 10px` en el thumb
del scrollbar.

---

## 5. Sombras

**No existen tokens de sombra** en el repositorio. Solo se observan utilidades de la escala
por defecto de Tailwind más dos literales escritos en JS.

| valor observado | path | uso |
| --- | --- | --- |
| `shadow-sm` | `navbar.tsx`, `ui/card.tsx`, `project-card.tsx`, `footer` sociales | navbar con scroll, card base, chip de icono |
| `shadow-sm shadow-purple-accent/60` | `ui/button.tsx` (`glow`) | CTA con glow morado (`contact-section.tsx`) |
| `shadow-md` | `hero-section.tsx` (CTA), `ui/navigation-menu.tsx` | botón primario del hero |
| `shadow-lg` | `project-card.tsx` (hover), `ui/*` popovers | elevación al hover de card |
| `shadow-xl` | `hero-section.tsx`, `about-section.tsx` (retratos) | retratos |
| `shadow-2xl` | `hero-section.tsx` (badge), `featured-project-panel.tsx` (imagen), `pricing-section.tsx` (card destacada) | piezas dominantes |
| `0 24px 48px -10px rgba(0,0,0,0.22)` | `pricing-section.tsx` (GSAP hover, card destacada) | hover de pricing destacado |
| `0 16px 36px -10px rgba(0,0,0,0.11)` | `pricing-section.tsx` (GSAP hover, card normal) | hover de pricing normal |
| `inset 0 0 0 2px color-mix(...)` | `app/globals.css` (`contact-arrive`) | ring interior del cue de llegada a `#contacto` |
| `ring-1 ring-black/5` | `featured-project-panel.tsx` | borde óptico sobre imagen |

---

## 6. Z-index

**No hay tokens de z-index**; los valores están escritos en los componentes.

| valor | path | uso |
| --- | --- | --- |
| `z-0` | `hero-section.tsx` | retrato (capa base) |
| `z-10` | `hero/contact/footer`, `project-card.tsx` (link overlay), `project-architecture.tsx` | contenido sobre el fondo y overlay de card completa |
| `z-20` | `hero-section.tsx` (badge), `project-card.tsx` (link externo) | sobre el overlay de la card |
| `z-50` | `navbar.tsx`, `project-detail.tsx` (barra fija) | navbar y barra de detalle |
| `z-[60]` | `scroll-progress.tsx` | barra de progreso, sobre la navbar |
| `z-[70]` | `project-detail.tsx` (lightbox) | por encima de todo |

Orden efectivo: `0 < 10 < 20 < 50 (navbar) < 60 (progreso) < 70 (lightbox)`.

---

## 7. Reglas de componente observadas

### Botón (`components/ui/button.tsx`, `cva`)

- Base: `inline-flex items-center justify-center gap-2 text-sm 2xl:text-base font-semibold`,
  `disabled:opacity-50`, foco con `outline-ring` + `outline-offset-2`.
- Variantes: `primary` (`bg-foreground text-background`, hover `opacity-80`), `outline`
  (`border-border`, hover `bg-purple-accent/5` + `border-purple-accent/30`), `accent`
  (`bg-purple-accent text-foreground`), `inverted` (`bg-foreground` → hover `bg-purple-accent text-white`),
  `white` (`bg-white text-purple-accent`).
- Forma: `rounded` = `rounded-xl` (16 px) · `pill` = `rounded-full`. Usado: `pill` en navbar,
  `rounded` por defecto (pricing y contact).
- Tamaños: `sm` `px-5 py-2` · `md` `px-6 py-3` · `lg` `h-12 px-6` · `compact` `px-4 py-2.5`.
- Flags: `fullWidth` (`w-full`), `glow` (`shadow-sm shadow-purple-accent/60`), `asChild` (Slot).

### Shell de sección (`components/section.tsx`)

- Exterior: `px-6 md:px-12` + marca de QA `debug-l1`. Interior: `mx-auto max-w-7xl` + `debug-l2`.
- `insetClassName` **reemplaza** el inset por defecto; `innerClassName` **agrega** y resuelve por
  `tailwind-merge`. `container={false}` da contenido full-bleed.

### Card de proyecto (`components/project-card.tsx`)

- `bg-card border rounded-2xl overflow-hidden`, hover `-translate-y-1.5` + `shadow-lg`, `duration-300 ease-out`.
- Destacada: `border-purple-accent/40 ring-1 ring-purple-accent/20`; normal: `border-border`.
- Link de card completa: `absolute inset-0 z-10 rounded-2xl` con
  `focus-visible:ring-2 focus-visible:ring-purple-accent/60`.
- Media: `aspect-16/10` con fallback `bg-gradient-to-br from-purple-accent/10 to-transparent` y
  label `font-mono text-xs uppercase tracking-widest text-muted-foreground`.
- Cuerpo `p-5`: título `font-serif font-bold text-fluid-card-title text-balance`; descripción
  `text-fluid-card-desc leading-relaxed text-content line-clamp-3`.
- Píldora de métrica: `rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2
  text-xs font-semibold text-purple-accent`.
- Iconos de stack: círculo `w-8 h-8` (`2xl:w-12 2xl:h-12`) `rounded-full border border-black
  bg-card shadow-sm shadow-gray-700`.
- Footer: `pt-4 border-t border-border`, label `text-xs font-semibold text-muted-foreground/90`
  y botón externo `rounded-lg bg-secondary`.

### Navbar (`components/navbar.tsx`)

- `fixed top-0 left-0 right-0 z-50`, alto `h-16`, interior `max-w-7xl px-6`.
- Superficie condicional: al scroll `bg-nav border-b border-border shadow-sm` +
  `md:backdrop-blur-md`; en top `bg-transparent border-transparent shadow-none`.
- Entrada CSS `.nav-arrive` (`0.45s` fade + `0.35s` drop `cubic-bezier(0.22, 1, 0.36, 1)`),
  hide-on-scroll mobile con `translateY(-110%)` y `0.35s` del mismo easing.
- Links desktop: `text-base font-medium`, gap `8`, underline propio por estado/hover; botón de
  contacto `variant="primary" shape="pill" size="sm"`.
- Menú mobile: `bg-nav`, `gap-3` entre links, target táctil de 44 px (`py-2.5`), CTA full width.

### Pricing (`components/pricing-section.tsx`)

- Card: `rounded-2xl p-8 border`; normal `border-border bg-card`; destacada
  `border-purple-accent shadow-2xl` con `backgroundColor: var(--accent-purple)` inline.
- Badge "popular": `absolute -top-3.5 left-1/2 px-4 py-1 bg-foreground text-background text-xs
  font-semibold rounded-full shadow`.
- Nombre `font-serif font-bold text-fluid-card`; precio `font-serif font-black text-fluid-price
  leading-none tabular-nums`; "desde" `text-xs uppercase tracking-widest`.
- Texto sobre la card destacada: `text-white` y `text-white/75` / `text-white/70`.
- Hover (GSAP, `0.28s power2.out`): `y` −5 destacada / −7 normal, `scale` 1.015 / 1, sombras
  literales de la tabla de sombras.

### Contacto (`components/contact-section.tsx`)

- `Section` con `insetClassName="px-6"`, `innerId="contact-content"`, `innerClassName="max-w-6xl
  py-12 md:py-16"` (`SECTION_GAP_Y`).
- Badge: `rounded-full border border-purple-accent/25 bg-purple-accent/10 px-3 py-2 text-xs
  sm:text-sm font-semibold text-purple-accent`.
- Título: `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter`,
  segunda parte en `text-purple-accent brightness-110`.
- CTA: `Button size="lg"` — LinkedIn (`primary`), email y copiar (`outline glow`).

### Footer (`components/footer.tsx`)

- `border-t border-border bg-background/50 backdrop-blur-md py-16 px-6`.
- Glow inferior: `w-[600px] h-[250px] bg-accent-purple/10 blur-[120px] rounded-full`.
- Grid `md:grid-cols-3 gap-10 pb-12 border-b border-border/60`; marca `font-serif font-bold text-xl`
  con el "23" en `text-purple-accent`; iconos sociales en círculo `w-10 h-10 rounded-full border
  border-border bg-card/60` con hover `border-purple-accent`.

### Foco, scrollbar y motion (global, `app/globals.css`)

- Un solo anillo de foco para todo el sitio: `:where(a, button, summary, input, select, textarea,
  [tabindex]):focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`, con
  especificidad cero a propósito.
- Scrollbar: `scrollbar-width: thin`, thumb `6px` `--muted-foreground` `radius 10px` con borde
  `1px solid var(--background)`, hover `--foreground`.
- Motion: entrada de secciones por clase `.reveal-fade` (`opacity` + `translate` de `20px`,
  `0.55s cubic-bezier(0.22, 1, 0.36, 1)`, delay por `--reveal-delay`); el sitio **mantiene** las
  animaciones de entrada con `prefers-reduced-motion` (decisión de proyecto en `app/layout.tsx`),
  pero sí las desactiva en el cue de llegada a `#contacto`, que pasa a wash estático.

---

## 8. Contraste medido (AA)

Ratios calculados sobre los valores `oklch()` de `app/globals.css` (conversión a sRGB y
luminancia relativa WCAG). Umbral AA: 4.5 texto normal, 3.0 texto grande y componentes.

| par | tema | ratio | estado |
| --- | --- | --- | --- |
| `foreground` / `background` | oscuro | 18.21 | cumple |
| `content` / `background` | oscuro | 9.19 | cumple |
| `muted-foreground` / `background` | oscuro | 5.62 | cumple |
| `muted-foreground` / `card` | oscuro | 5.40 | cumple |
| `accent-purple` / `background` | oscuro | 5.20 | cumple |
| `background` sobre `accent-purple` (sustitución AA del tablero) | oscuro | 5.20 | cumple |
| `accent-purple` / `card` | oscuro | 5.00 | cumple |
| `accent-purple` sobre `accent-purple/10` sobre `card` (píldora de métrica) | oscuro | 4.59 | cumple |
| `ring` / `background` (indicador de foco) | oscuro | 5.20 | cumple (≥3.0) |
| `muted-foreground/90` / `card` | oscuro | 4.56 | cumple |
| `accent-foreground` (blanco) / `accent` | ambos | 3.93 | **no cumple** texto normal; sí texto grande |
| `purple-accent` / `white` (variante `white` de Button, CTA de pricing) | oscuro | 3.93 | **no cumple** texto normal |
| `foreground` / `accent` (variante `accent` de Button) | oscuro | 3.50 | **no cumple** |
| `white/75` / `accent` (card de pricing destacada) | oscuro | 2.91 | **no cumple** |
| `purple-accent` sobre `purple-accent-light` (chip de `products-section`) | oscuro | 4.46 | **no cumple por margen** |
| `purple-accent` sobre `purple-accent-light` | claro | 3.49 | **no cumple** |
| `ring-purple-accent/60` sobre `card` (foco del link de card) | oscuro | 2.48 | **no cumple** 3.0 de componentes |
| `destructive` / `background` | oscuro | 2.03 | **no cumple** (solo en `components/ui/*` no montados hoy) |
| `foreground` / `background` | claro | 20.12 | cumple |
| `content` / `background` | claro | 10.01 | cumple |
| `muted-foreground` / `background` | claro | 5.51 | cumple |
| `accent` / `background` | claro | 4.55 | cumple |
| `foreground` / `accent` | claro | 4.42 | **no cumple por margen** |

---

## 9. Conflictos y ambigüedades

1. ~~`styles/globals.css` contradice a `app/globals.css` y no está conectado.~~ **RESUELTO el
   2026-11-07**: el archivo se retiró; nunca estuvo importado (`app/layout.tsx` importa
   `./globals.css` y `components.json` apunta a `app/globals.css`). Las diferencias que
   seguían listadas quedan como historia:
   vs morado, `--radius` `0.625rem` vs `0.75rem`, `--font-sans: 'Geist'` vs `var(--font-inter)`, sin
   `--content` ni ningún `--text-fluid-*`, y **sí** define `--chart-1..5`. Es el único lugar del
   repo con valores de chart.
2. **Familias fantasma.** `--font-mono` nombra `'Geist Mono'` sin `@font-face` ni loader, y el
   paquete `geist` no está instalado: el token no resuelve a ninguna cara real.
3. **`serif` que no es serif.** `--font-serif` apunta a Space Grotesk (grotesca) con fallback
   serif. El nombre del token y la cara real no coinciden.
4. **`--chart-1..5` colgantes** (ver arriba): el mapeo existe, la definición no.
5. **Tokens declarados sin uso:** `--sidebar-*` (8), `--hero-text` / `--color-hero-text`,
   `--content` sí se usa pero no tiene equivalente `--color-content`… lo tiene (`--color-content`),
   y `bg-content` no se usa nunca.
6. **Doble camino para el mismo color de marca:** `--accent` y `--accent-purple` tienen el mismo
   valor en ambos temas y conviven; `.dark` redefine además `--color-purple-accent` como valor
   directo (no `var()`), con un comentario en el espejo de docs que prohíbe refactorizarlo.
7. **Morado `accent` como fondo de texto:** las variantes `accent`/`white` del botón y el texto
   blanco de la card destacada no llegan a AA (tabla de contraste).
8. **Radios duplicados:** `rounded-2xl` (16 px) coincide con `--radius-xl` sin usar el token;
   `rounded-4xl` (32 px) y `rounded-[4px]` no están en la escala.
9. **Rojo destructivo oscuro ilegible** (`2.03:1`) en los componentes shadcn que hoy no se montan.
10. **`font-black` que el display no puede alcanzar.** 19 declaraciones de 900 se aplican a
    Space Grotesk, cuyo rango variable termina en 700: el valor del CSS es real, el dibujo no.
    Ningún componente lo nota porque el resultado (700) sigue leyéndose como display.

---

## 10. Fidelidad del tablero

`design/system.html` renderiza estos tokens en 1440 px con el tema **oscuro** (el que la app
fuerza). Es un archivo autocontenido: no hay ninguna URL externa, ni CDN, ni imagen remota.

### Familias embebidas

Los cuatro `@font-face` salen del CSS que genera `next/font/google` en el build del sitio
(`.next/dev/static/chunks/[next]_internal_font_google_*_module_css_*.single.css`) y los woff2
son los subsetted de `.next/static/media/`. Cada bloque conserva el `font-weight` y el
`unicode-range` reales, con `font-display: swap`:

| familia | subset | `font-weight` | archivo woff2 | bytes |
| --- | --- | --- | --- | --- |
| `Inter` | latin | `100 900` | `83afe278b6a6bb3c-s.p.3a6ba036.woff2` | 48432 |
| `Inter` | latin-ext | `100 900` | `1bffadaabf893a1e-s.7cd81963.woff2` | 85272 |
| `Space Grotesk` | latin | `300 700` | `0c89a48fa5027cee-s.p.4564287c.woff2` | 22320 |
| `Space Grotesk` | latin-ext | `300 700` | `28868e710e86be81-s.c30238d4.woff2` | 18924 |

Los nombres son los reales (`Space Grotesk`, `Inter`), y `--font-sans` → Inter y `--font-serif`
→ Space Grotesk, igual que en `@theme inline`. `--font-mono` sigue siendo el token roto del
repo (`'Geist Mono'`, sin cara): los labels mono del tablero caen al genérico del navegador,
como en el sitio.

### Qué es exacto y qué es traducción manual

Exacto: color (32 tokens + `.dark`), escala fluida fijada a su valor de 1440 px, tokens de
ritmo, pesos, tracking, leading, radios, sombras, z-index y la tabla de contraste medida. La
estructura y el copy de cada componente salen de su `.tsx` y de `data/` (planes, precios, CTAs,
links, bio, copyright).

Traducción manual: **los especímenes de componente son una reescritura a mano de sus clases
Tailwind, no los componentes**. No hay React, ni `cn()`/`tailwind-merge`, ni GSAP, ni
`next/image`; una diferencia de 1–2 px en gaps, paddings o líneas base es posible. Tampoco hay
datos vivos (scroll-spy, clipboard, métricas de API) y las alturas dependientes del viewport
(`min-h-[85dvh]`) se fijan a 1440×900. Los assets (`/images/**`, `/brands/*.webp`) se dibujan
como marcadores con la medida real; los iconos de interfaz son los paths reales de lucide.

### Dos sustituciones por AA

El tablero nunca dibuja un par de texto que no alcance AA, ni siquiera cuando el componente
real sí lo hace:

1. **Card de pricing destacada.** El cuerpo real es `text-white/75` (2.91) y `text-white/70`
   en «desde», periodo y respaldo; la lista usa `text-white` (3.93 a 17.7 px). El tablero los
   pinta en `var(--background)` sobre el morado (5.20) y conserva el `text-white` real solo
   donde es texto grande: nombre del plan (23.2 px, 700) y precio (42 px, 900), 3.93 ≥ 3.0.
2. **Botón `white`.** El real es `bg-white text-purple-accent` (3.93 sobre blanco). El tablero
   usa `oklch(0.58 0.22 270)`, el `--accent` del tema claro, que mide 4.55 sobre blanco.

Los `href` de los especímenes son anclas locales: los destinos reales son rutas de Next,
`mailto:` y URLs externas que no pertenecen a un archivo autocontenido.
