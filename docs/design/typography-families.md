# Tipografía por Sección — Referencia Real del Código

Este documento es la **fuente de verdad** de la tipografía del portfolio: qué familia, qué token, qué tamaño por resolución usa CADA elemento de CADA sección, según el estado actual del código (rama `feat/fluid-typo`, worktree `M:\worktrees\maxgb23-portfolio\fluid-typo`).

Complementa a `typography-system.md` (que es un borrador teórico de sistema); aquí se documenta lo que **realmente** está implementado.

---

## Las tres familias y su propósito

Definidas en `app/globals.css` (`@theme inline`) y configuradas en `app/layout.tsx`:

| Clase       | Familia                             | Variable / Origen              | Propósito                                    |
|-------------|-------------------------------------|--------------------------------|----------------------------------------------|
| `font-sans` | Inter                               | `--font-inter` (next/font)     | UI / body general, texto de lectura          |
| `font-serif`| Space Grotesk                       | `--font-space-grotesk` (next/font) | Titulares / display de alto impacto       |
| `font-mono` | `'Geist Mono'`                      | Hardcodeado en el theme        | Metadatos / etiquetas técnicas               |

Nota de configuración:
- `<body>` aplica `font-sans` por defecto (`app/layout.tsx` línea 36: `className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}`), por lo que **todo texto sin clase de familia explícita hereda Inter**.
- `font-serif` se usa explícitamente (Space Grotesk) en todos los títulos de display.
- `font-mono` referencia `'Geist Mono'` como cadena literal en el theme. **Geist Mono NO se carga con `next/font`**; depende de que esté disponible localmente o cae a `'Geist Mono Fallback'`.

---

## Tokens fluidos del sistema (app/globals.css, @theme inline)

Todos son `clamp(min, rem + vw, max)` — base en rems, pendiente en vw (cumple WCAG 1.4.4: zoom 200% seguro, nunca vw puro). Ningún ratio supera 2.5× (guía Hoverify).

| Token | Fórmula | Tamaño (px) | Uso |
|-------|---------|-------------|-----|
| `text-fluid-display` | `clamp(2.5rem, 1.88rem + 3.13vw, 5rem)` | 40 → 80 | Hero `h1` (único) |
| `text-fluid-detail` | `clamp(2.25rem, 1.9rem + 1.47vw, 3.375rem)` | 36 → 54 | Detail `h1` (título de proyecto) |
| `text-fluid-section` | `clamp(2rem, 1.72rem + 1.4vw, 3.25rem)` | 32 → 52 | Headings de sección: About `h2`, "Proyectos Destacados", "Todos los Proyectos", "Servicios a medida" |
| `text-fluid-featured` | `clamp(1.75rem, 1.52rem + 1.15vw, 2.75rem)` | 28 → 44 | Featured panel `h2` (caso de estudio apilado) |
| `text-fluid-price` | `clamp(2rem, 1.8rem + 1vw, 2.625rem)` | 32 → 42 | Precio en cards de pricing |
| `text-fluid-card` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 → 24 | CTA card `h3` ("¿Trabajamos juntos?") + nombre del plan |
| `text-fluid-metric` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 → 24 | Valor de métrica (detail) — numeral display, token propio desde 2026-09-16 |
| `text-fluid-card-title` | `clamp(1.125rem, 1.05rem + 0.32vw, 1.375rem)` | 18 → 22 | Título de card del grid "Todos los Proyectos" (`project-card.tsx`) |
| `text-fluid-card-desc` | `clamp(0.9375rem, 0.9rem + 0.12vw, 1rem)` | 15 → 16 | Descripción de card del grid |
| `text-fluid-subheading` | `clamp(1.5rem, 1.27rem + 0.98vw, 2.25rem)` | 24 → 36 | Detail SectionTitle |
| `text-fluid-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 | Descripciones (hero, about, featured, pricing) |
| `text-fluid-card-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 | Descripción de cards |
| `text-fluid-eyebrow` | `clamp(0.9375rem, 0.86rem + 0.33vw, 1.1875rem)` | 15 → 19 | Labels / eyebrows (role, "Conóceme") |

> ⚠️ **Dependencia crítica para `cn()`**: estas utilidades custom `text-fluid-*` son desconocidas para tailwind-merge. Sin el `extendTailwindMerge` de `lib/utils.ts` (que las registra como font-size), `cn("... text-fluid-card ...", "... text-foreground ...")` **borra** la clase fluid (colisión de grupo `text-*`) y el elemento cae a 16px. Este fix + la tabla de arriba van juntos; no eliminar el extend al refactorizar `cn()`.

**Calibración (2026-09)**: TODOS los tokens interpolan en la **misma ventana 375 → 1600px** y topan en ~1600px. Antes cada token topaba en un ancho distinto (eyebrow 857px, card-body 933px, body 1120px, section 1600px, featured 1631px) y la jerarquía relativa se distorsionaba al crecer la resolución. Body reducido de 20px → 18px máximo (práctica 2026: 16–18px). En pantallas < 375px los títulos quedan fijos en su mínimo.

**Recalibración de la escalera superior (2026-09-14, aprobada)**: se reintroducen el escalón display y se separa el detail del section, y section/featured bajan un escalón:
- Hero `h1` recupera token propio `text-fluid-display` (40→80, era la misma pieza que la sección a 36→72 tras la uniformización previa; el fallback `lg:[@media(max-height:800px)]:text-6xl` lo recorta a 60px en viewports bajos) y Detail `h1` usa `text-fluid-detail` (40→64).
- `text-fluid-section` baja de 36→72 a **32→52**; `text-fluid-featured` de 32→64 a **28→44**. Los títulos de sección matienen 2 renglones por diseño (`flex flex-col`).
- Nace `text-fluid-price` (32→42) calibrado por medición real: **siempre por debajo del section** (1280: 41.6 vs 45.4, ratio 0.92; mobile: 32.7 vs 33) y a la vez dominante sobre el plan name (1.86× a 1280). Se midió con `scripts/type-scale.mjs` en 390/1280/1920 antes de fijar la fórmula (el primer intento a `clamp(2.25rem, 1.95rem + 1.3vw, 3rem)` aún superaba a la sección).

**Recalibración del detail (2026-09-17, aprobada)**: `text-fluid-detail` baja de **40→64** a **36→54** (`clamp(2.25rem, 1.9rem + 1.47vw, 3.375rem)`). Motivo: el mínimo (40px) igualaba al hero en mobile (98% de su tamaño) y el ratio título/body superaba 3× desde 1024px (2.58→3.56×), fuera del rango 2–3× recomendado para páginas de contenido. Con 36→54 el ratio queda en **2.25–3.0×** y la escalera interna del detail es *perfect fifth* exacta en desktop: h1 54 → SectionTitle 36 → valor de métrica 24 → label 16 (1.5× por escalón). La presencia del detail se apoya en composición (font-black, text-balance, espacio), no en tamaño — jerarquía por espacio, no por masa (práctica 2026).

> Decisión clave (actualizada 2026-09): **el primer escalón de la escalera es 16px (body)** — nada de texto de lectura baja de eso. Los labels/eyebrows (role, "Conóceme") se tratan como **kicker del título**, NO como eyebrow decorativo de UI: van −1px bajo el body en mobile (15 vs 16), ≈igual en sm–md, y +1px SOBRE el body en grandes (19 vs 18 a 1600px). El cruce con la curva del body ocurre en ~941px. La presencia del role se apoya en tamaño (no solo uppercase + tracking como antes), porque es la declaración de identidad del hero: el "Full Stack Developer" dejó de ser el texto más pequeño de la sección. Los eyebrows puramente decorativos de UI (badges, "desde" en pricing) siguen la norma 12–16px en contextos pequeños.

**Medidas reales en mobile @390px** (2026-09-14, `scripts/type-scale.mjs`):

| Elemento | Token | Tamaño real (390px) | Rango de práctica 2026 |
|----------|-------|---------------------|------------------------|
| role / label (hero y about) | `text-fluid-eyebrow` | **15px** | 12–16px ✅ |
| descripción | `text-fluid-body` | **16px** | 16–18px ✅ |
| h1 hero | `text-fluid-display` | **42.3px** | — |
| título de sección (about) | `text-fluid-section` | **33px** | 28–40px ✅ |
| precio pricing | `text-fluid-price` | **32.7px** | — |
| featured h2 | `text-fluid-featured` | **28.8px** | — |

---

## Padding horizontal de secciones (decisión aplicada)

| Sección | Padding base | md (768–1023) | lg (1024+) |
|---------|-------------|---------------|------------|
| Hero | `px-6` (24px) | `md:px-8` (32px) | `lg:px-12` (48px) |
| About | `px-6` (24px) | `md:px-8` (32px) | `lg:px-12` (48px) |
| Featured | `px-6` (24px) | `md:px-12` (48px) | `lg:px-20` (80px) |
| Navbar / Footer / Projects / Pricing | `px-6` (24px) | — | — |
| Detail | `px-6` (24px) | `md:px-12` (48px) | `lg:px-20` (80px) |

> Hero/About usan `md:px-8` (32px). El `md:px-4` de la versión anterior y su mq quirúrgica 768–800px desaparecieron con la uniformización del `h1` (2026-09): ya no hay desborde en dos columnas.

---

## Jerarquía tipográfica global

| Nivel | Pieza | Token | Máx (2xl) | Familia / Peso |
|-------|-------|-------|-----------|----------------|
| 1 | Hero `h1` | `text-fluid-display` | 80px | serif / black |
| 2 | Detail `h1` (título de proyecto) | `text-fluid-detail` | 54px | serif / black |
| 3 | Headings de sección — About `h2`, "Proyectos Destacados", "Todos los Proyectos", "Servicios a medida" | `text-fluid-section` | 52px | serif / black |
| 4 | Featured panel `h2` (caso de estudio apilado) | `text-fluid-featured` | 44px — **escalón bajo las secciones (ratio ≈ 0.85)** | serif / black |
| 5 | Precio pricing | `text-fluid-price` | 42px — **siempre por debajo del section** (0.81–0.99×, nunca por encima) | serif / black |
| 6 | Detail SectionTitle `h2` | `text-fluid-subheading` | 36px | serif / bold |
| 7 | Valor de métrica (detail) | `text-fluid-metric` | 24px — numeral display (font-black + accent), ~1.5× bajo su SectionTitle y 1.2×–1.5× sobre su label | serif / black |
| 8 | Card `h3` + nombre del plan | `text-fluid-card` | 24px | serif / bold |
| 9 | Descripciones / body | `text-fluid-body` | 18px | sans (heredada) |
| 10 | Descripción de cards | `text-fluid-card-body` | 18px | sans (heredada) |
| 11 | Labels / eyebrows (kicker) | `text-fluid-eyebrow` | 19px | sans (heredada) |

## Roles de color de texto

| Rol | Valor | Contraste sobre fondo | Uso |
|-----|-------|----------------------|-----|
| `foreground` | `oklch(0.13 0 0)` (light) / `oklch(0.96 0 0)` (dark) | ~18:1 (dark) | Títulos y headings |
| `content` | `oklch(0.38 0 0)` (light) / `oklch(0.75 0 0)` (dark) | ~9.2:1 (dark), ~10.0:1 (light) | Párrafos de lectura (body fluid, cards, detail, descripciones de sección) |
| `muted-foreground` | `oklch(0.52 0 0)` (light) / `oklch(0.62 0 0)` (dark) | ~5.6:1 (dark) | Metadata: labels, eyebrows, chips, breadcrumbs, footer |

> Decisión: `content` separa el contenido de lectura de la metadata. Ocupa el escalón intermedio entre `foreground` (títulos) y `muted-foreground` (metadata) para mantener una jerarquía visible de tres niveles: títulos → párrafos → metadata. Se aplica solo donde hay lectura continua — body fluido (hero, about, featured), descripciones de cards (grid, products), cuerpo editorial del detail (headline, resumen, problema, rol, solución) y cierres de sección — mientras todo lo que es metadata (labels, eyebrows, chips, breadcrumbs, footer) conserva `muted-foreground`.
>
> Nota de contraste (2026-09-16, ajustado 2026-09-17): el token se calibra por modo al mismo ratio objetivo — `oklch(0.75 0 0)` ≈ 9.2:1 sobre el fondo dark real (`oklch(0.11 0.005 270)`, L≈0.0013) y `oklch(0.38 0 0)` ≈ 10.0:1 sobre el fondo light (`oklch(1 0 0)`). El valor dark supera AAA (7:1) con margen y queda claramente por debajo del `foreground` (~18:1) para mantener jerarquía de títulos vs. lectura. Aunque el portfolio usa `forcedTheme="dark"`, ambos valores quedan definidos para no dejar trampa si se habilita el modo claro.

> Nota histórica: en la uniformización previa (2026-09) el hero `h1` perdió su título propio y usaba `text-fluid-section` (36→72px); se percibió la jerarquía plana entre hero/sección/detalle y (2026-09-14) se reintrodujeron escalones propios: display (40→80) para el hero y detail (40→64) para el detalle (luego recalibrado a 36→54 el 2026-09-17, ver arriba), bajando section y featured para que el ancla de cada sección quede ~0.65× sobre el display y el precio nunca supere a su sección. El hero se apoya además en composición (uppercase, tracking, layout, aurora) y en el fallback de alto `lg:[@media(max-height:800px)]:text-6xl`.

---

## Navbar (`components/navbar.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Badge "Disponible para trabajo remoto" (desktop) | `font-sans` (explícito) | `font-sans font-medium text-sm md:text-base tracking-wider` |
| Badge "Disponible en remoto" (mobile) | `font-sans` (explícito) | `font-sans font-medium text-sm lg:text-lg tracking-wider` |
| Links de navegación (desktop) | sans (heredada) | `text-base font-medium` |
| Botón "Contacto" (desktop) | sans (heredada) | `text-[15px] font-medium` |
| Links de menú móvil | sans (heredada) | `text-base font-medium` |
| Botón "Contacto" (mobile) | sans (heredada) | `text-sm font-medium` |

> El Navbar es la única sección que usa `font-sans` de forma **explícita** (además del fondo global del `body`). No usa tokens fluidos — UI estática, ver "Convención: UI estática vs. contenido fluido" al final.

---

## Hero (`components/hero-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Full Stack Developer" | sans (heredada) | `uppercase tracking-[0.2em] 2xl:tracking-widest font-medium text-fluid-eyebrow` |
| `h1` "Max González Ballesteros" | serif | `font-serif font-black uppercase text-fluid-display leading-[0.9] tracking-tighter lg:[@media(max-height:800px)]:text-6xl` |
| Descripción | sans (heredada) | `px-4 sm:px-16 md:px-0 text-fluid-body leading-relaxed text-content max-w-full` + `style: maxWidth` medido del título (hook `useTitleWidth`) |
| Botones CTA (Ver Proyectos / Descargar CV) | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Label "Stack Principal" | sans (heredada) | `text-xs 2xl:text-base uppercase tracking-widest font-semibold` |
| Indicador "Deslizar" | sans (heredada) | `text-xs 2xl:text-base tracking-widest uppercase` |
| Icónos de stack | — | `size-6 2xl:size-7` |

> La descripción toma el ancho de la línea más ancha del `h1` (hook `useTitleWidth`, mide los `<span>` del título). Sin "valores mágicos": max-width solo en multi-columna (md+, 768px); en mobile fluye al ancho natural del contenedor.

#### Régimen de altura del hero (2026-09)

El hero tiene dos medias de altura que conviven con el escalón `text-fluid-display` (40→80px por ancho, independiente de altura):

| Variable | Clase | Valor |
|----------|-------|-------|
| Padding superior | `pt-22 sm:pt-24 lg:[@media(min-height:700px)]:pt-34 2xl:pt-40` | 88px → 96px → **136px** (lg + altura ≥700) → 160px (2xl ≥1536) |
| Título en viewport bajo | `lg:[@media(max-height:800px)]:text-6xl` | 60px fijo (solo lg, altura ≤800) |
| Título en viewport alto | `text-fluid-display` | `clamp(2.5rem, 1.88rem + 3.13vw, 5rem)` — 40→80px por ancho |

> La frontera de 800px produce una discontinuidad: en 801px el display fluido se reanuda y crece con el ancho (≈62px @1024w → 70px @1280w → 80px ≥1600w). Ese fallback nació por un desborde del título en viewports bajos (768px de altura); con los clamps custom ese desborde ya no ocurre, así que su necesidad está **en evaluación** — si la validación en vivo (1280×700, 1366×768, 1920×800) confirma que el hero cabe sin el cap, se elimina y el título queda puramente vw-driven.

---

## About (`components/about-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Conóceme" | sans (heredada) | `uppercase tracking-[0.2em] font-medium text-fluid-eyebrow` |
| `h2` "Sobre Mí" | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| Descripción (2 párrafos) | sans (heredada) | `px-4 sm:px-16 md:px-0 text-fluid-body leading-relaxed text-content max-w-[62ch] space-y-4` |

---

## Featured / Stacking (`components/featured-project-panel.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Índice numérico "01" | mono | `text-sm 2xl:text-lg font-mono tabular-nums font-bold` |
| Badge de categoría | sans (heredada) | `text-xs font-semibold` (pill purple) |
| `h2` Título del proyecto | serif | `font-serif font-black text-fluid-featured leading-[1.05] tracking-tight text-balance` |
| Descripción | sans (heredada) | `text-fluid-body leading-relaxed text-content mb-6 mr-6 sm:mr-0 max-w-[62ch]` |
| Métrica clave | sans (heredada) | `text-xs sm:text-sm font-semibold` (pill outline purple) |
| Botón CTA "Ver caso de estudio" | sans (heredada) | `text-sm font-semibold` |
| Badge flotante de índice | serif | `text-2xl font-black font-serif` (número) |
| Placeholder de imagen (categoría) | mono | `font-mono text-xs uppercase tracking-widest` |

---

## Grid de proyectos (`components/all-projects.tsx`)

### Títulos de sección

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| `h2` "Proyectos Destacados" (SectionHeading) | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| `h2` "Todos los Proyectos" (AllProjects) | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |

### ContactBanner (banda de contacto bajo el grid)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Badge "Disponible para proyectos" | sans (heredada) | `text-[11px] font-semibold` |
| `h3` "¿Trabajamos juntos?" | serif | `font-serif font-bold text-xl` |
| Texto | sans (heredada) | `text-base leading-relaxed max-w-xl` |
| Botones (Escríbeme / GitHub / LinkedIn / copiar) | sans (heredada) | `text-sm font-semibold` |

---

## Card del grid (`components/project-card.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Placeholder de imagen (categoría) | mono | `font-mono text-xs 2xl:text-sm uppercase tracking-widest` |
| `h3` Título del proyecto | serif | `font-serif font-bold text-fluid-card` |
| Descripción | sans (heredada) | `text-fluid-card-body leading-relaxed flex-1 mb-4 line-clamp-3 max-h-[4.875em]` — ver nota de clamp abajo |
| Métrica | sans (heredada) | `text-[11px] 2xl:text-sm font-semibold` (pill purple) |
| Tags de stack (iconos) | — | `labelClassName` `text-[11px] 2xl:text-xs`, contenedor `w-8 h-8 2xl:w-12 2xl:h-12` |
| Footer "Caso de estudio" | sans (heredada) | `text-xs 2xl:text-sm font-semibold`, envoltorio `mt-auto pt-4` |

> **Clamp del line-clamp (2026-09-14)**: `line-clamp-3` + `flex-1` era un bug real: en cards con poco contenido el flex estiraba la caja a 3.42 líneas y se veía un 4º renglón fantasma (AutoShop: 96.8px vs 84.8px normales). El `max-h-[4.875em]` (3 × 1.625 de `leading-relaxed`) congela la caja en 3 líneas y el `mt-auto` del footer empuja el contenido sobrante al final de la card. El `scrollHeight > clientHeight` que marcan las herramientas es contenido interno recortado (behavior normal de clamp), no un renglón visible.

---

## Detalle de proyecto (`components/project-detail.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Botón flotante "Volver" | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Badge de categoría (hero) | sans (heredada) | `text-xs 2xl:text-sm font-semibold` (pill purple) |
| `h1` Título del proyecto | serif | `font-serif font-black text-fluid-detail leading-[1.02] tracking-tight text-balance` |
| `p` headline (lead, bajo el título de proyecto) | sans (heredada) | `text-fluid-body leading-relaxed max-w-2xl` — fluid 16→18 (corregido 2026-09-17; la doc previa decía `text-base 2xl:text-2xl`) |
| Chips de stack (StackChips) | sans (heredada) | texto `text-sm 2xl:text-base`; iconos `w-6 h-6 2xl:w-7 2xl:h-7`; fallback `text-[9px] 2xl:text-[10px]` |
| `h2` Sección (SectionTitle) | serif | `font-serif font-bold text-fluid-subheading` |
| Valor de métrica | serif | `font-serif font-black text-fluid-metric text-purple-accent` — **token propio (2026-09-16)**: extraído de `text-fluid-card` (préstamo genérico de card heading); misma escala visual 18 → 24, sin cambio de render. Historial: bajó de `subheading` (2026-09-14) porque competía con su SectionTitle (mismo token + black); ahora queda 1.5× bajo el título y 1.2×–1.5× sobre su label |
| Etiqueta de métrica | sans (heredada) | `text-fluid-card-desc leading-snug` — **fluid (2026-09-16)**: reemplaza el estático `text-xs sm:text-sm 2xl:text-base` (escalera 12→14→16). Reusa la escala secundaria de card siguiendo el patrón pricing (numeral con token propio, secundario reusado); el captions sube a 15px en mobile (ratio valor/label 1.2×) y converge a 16px (1.5×) en desktop |
| `p` subtítulo sección ("Métricas de rendimiento y topología del sistema") | sans (heredada) | `text-fluid-body leading-relaxed text-content max-w-xl` — **fluid (2026-09-17)**: era `text-sm` estático, sin clase fluid. Alineado al patrón de subtítulo de pricing (text-fluid-body + text-content); escala medida 16 → 17.4 → 18 |
| Switch de vistas (Métricas/Grafo) | sans | botones `text-xs font-sans font-medium` — UI estática en norma 12px; sin mono (corregido 2026-09-17)
| Cuerpo editorial (Resumen/Problema/Rol/Solución/Galería) | sans (heredada) | `text-base 2xl:text-lg leading-relaxed` |
| Placeholder de galería "Captura próximamente" | mono | `font-mono text-xs 2xl:text-sm uppercase tracking-widest` |
| Botones de enlace de proyecto | sans (heredada) | `text-sm lg:text-base 2xl:text-lg font-semibold` |
| CTA final `h2` | serif | `font-serif font-bold text-xl md:text-2xl 2xl:text-3xl text-balance` |
| Botón CTA "Volver a proyectos" | sans (heredada) | `text-sm 2xl:text-base font-semibold` |

### Vista Grafo Arquitectura (`components/project-architecture.tsx`)

Diagrama técnico = **UI estática** (no fluido): el grafo queda subordinado a las métricas (valores fluid 18→24). **Escala 12/14/16 (2026-09-17, datos medidos)**: antes TODO el grafo vivía en 12–14px sin escalar (nombres 14px, descripciones 12px) mientras los labels de métrica llegaban a 16px; el suelo de 12px se eliminó y quedó una escalera de 3 peldaños. El grafo NO escala con viewport por diseño (un diagrama denso como funky-ai —7 hijos— desbordaría al fluir).

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Badge ROOT ENGINE | sans | `text-xs tracking-wider uppercase` — única pieza en 12px (rol decorativo, norma badges) |
| Nombre raíz | sans | `font-bold text-base tracking-wider uppercase` |
| Descripción raíz | sans | `text-sm text-content leading-relaxed mt-3` |
| Contador "n módulos documentados" | sans | `text-sm` |
| Número de nodo 01..N | sans | `text-sm font-bold tabular-nums` |
| Nombre de nodo (`h4`) | sans | `font-semibold text-base` |
| Descripción de nodo | sans | `text-sm text-content leading-relaxed` |
| Nietos (nombre y descripción) | sans | nombre `text-foreground`; descripción `text-sm text-content` |
| Empty state | sans | título `text-sm`; cuerpo `text-sm text-content leading-relaxed max-w-md mx-auto` |

Reglas del grafo (2026-09-17): **sin mono** — la familia única del diagrama es sans/Inter, como el resto de la sección; **sin valores arbitrarios** — los `text-[10px]`/`text-[11px]` se eliminaron; **roles de color del sistema** — nombres → `foreground` (títulos de nodo), descripciones y prosa → `content` (lectura continua), badge/números/contador → `muted-foreground` (metadata).

---

## Pricing (`components/pricing-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| `h2` "Servicios a medida" | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| `p` subtítulo header | sans (heredada) | `text-fluid-body max-w-lg lg:max-w-xl leading-relaxed` (contiene la clase malformada `2xl mx-auto`) |
| Badge "Más popular" | sans (heredada) | `text-xs font-semibold` |
| `h3` Nombre del plan | serif | `font-serif font-bold text-xl` → **`text-fluid-card`** |
| Descripción del plan | sans (heredada) | `text-base leading-relaxed` → **`text-fluid-card-body`** |
| Eyebrow "desde" | sans (heredada) | `text-xs font-medium uppercase tracking-widest` |
| Precio (`$6,000`) | serif | `font-serif font-black text-5xl leading-none` → **`text-fluid-price`** (**sin tabular-nums**) |
| Periodo ("MXN · por proyecto") | sans (heredada) | `text-sm` |
| Lista de características | sans (heredada) | `text-base leading-relaxed` → **`text-fluid-card-body`** (+ iconos Check `size={15}`) |
| Botón CTA del plan | sans (heredada) | `text-sm font-semibold` |
| Proof line ("Respaldado por: …") | sans (heredada) | `text-xs leading-relaxed` |
| Nota final | sans (heredada) | `text-xs text-muted-foreground` |

---

## Footer (`components/footer.tsx`)

**Estado (2026-09-14, recorte minimal)**: sin navegación (el one-pager ya la tiene en el navbar) y sin reloj en vivo (re-render cada 1s; criterio "solo info necesaria"). Quedan marca + bio + redes + copyright.

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Marca "MaxGB23" | serif | `font-serif font-bold text-xl` |
| Pill "Dev" | sans (heredada) | `text-xs text-muted-foreground px-2 py-0.5 rounded border border-border` |
| Bio | sans (heredada) | `text-sm text-muted-foreground leading-relaxed max-w-sm` |
| Iconos sociales (GitHub / LinkedIn) | sans (heredada) | círculos `w-10 h-10 rounded-full border border-border bg-card/60`, icono `size-18`; hover escala 1.1 + borde accent-purple (framer `motion.div`) |
| Copyright | sans (heredada) | `text-xs text-muted-foreground` |
| Glow de fondo | — | `bg-accent-purple/10 blur-[120px]` bajo el contenido (coherente con aurora del hero) |

> Nota: tamaños fijos (no fluid) — UI estática, ver "Convención: UI estática vs. contenido fluido" al final. Los headers de columna seguirían la norma de eyebrows de UI 12–16px si vuelven a existir columnas.

---

## Products (`components/products-section.tsx`) — DESMONTADA

**Estado actual**: `ProductsSection` está **comentada** en `app/page.tsx` (línea 24) y NO se renderiza en la home. Se documenta por referencia futura. Sin tokens fluidos (quedaría por definir al reactivarla).

---

## Deuda conocida

1. Pricing subtítulo header: clase malformada `2xl mx-auto` (un "2xl" suelto sin selector `text-`) tal cual está en el código.
2. Pricing precio: `font-serif font-black text-fluid-price leading-none` sin `tabular-nums` (los dígitos pueden no alinear).
3. Geist Mono no se carga con `next/font`; cae a fallback local.
4. **Resuelto** (2026-09-14): el footer se recortó a marca + bio + redes + copyright (sin navegación ni reloj en vivo).
5. Gotcha de desarrollo: cambiоs de tokens `--text-fluid-*` en `@theme` NO hot-reloadan con Turbopack (el navegador sigue sirviendo el CSS viejo). Tras tocar `globals.css` así, reiniciar el dev server con `.next` purgado; verificar con `scripts/type-scale.mjs` (2º incidente confirmado).
6. **Resuelto** (2026-09-17): contraste de eyebrows con opacidad. Se eliminaron TODAS las opacidades (`/60` y `/70`) y el filtro `brightness-125` de eyebrows/labels; el sistema quedó con el patrón del scroll indicator: `text-muted-foreground` puro (5.62:1 ✓) en todos los eyebrows. Contexto: el `brightness-125` sobre `muted` (6.78:1) era un hack inconsistente — los mismos eyebrows tenían contraste distinto según la sección (6.78:1 hero vs 4.22:1 cards). La jerarquía entre eyebrows y labels se mantiene por tamaño y tracking (eyebrow fluid 15→19px vs stack 12→16px), no por opacidad — "jerarquía por espacio, no por masa". Casos afectados: hero-section (138, 233), about-section (88), project-card (59), featured-project-panel (166), project-detail (563). Queda el `brightness-125` de `featured-project-panel.tsx:105` sobre `text-purple-accent` (palabra en acento, no eyebrow) — fuera de esta normalización. **Excepción deliberada (2026-09-17)**: el label del hero (`hero-section.tsx:138`) lleva `brightness-110` sobre `muted`, añadido a propósito para que el texto resalte sobre el fondo animado de aurora — la única superficie del sitio con movimiento de fondo continuo detrás del texto. No es un hack de contraste sino una decisión de legibilidad sobre animación; el resto de eyebrows mantiene muted puro.

---

## Convención general

Patrón reutilizable que se repite en todas las secciones:

- **`font-serif` (Space Grotesk) = display / títulos.** Toda jerarquía de título usa Space Grotesk, casi siempre con `font-black`/`font-bold`.
- **`font-sans` (Inter) = body / UI.** Descripciones, párrafos, botones, listas, links, labels. Se hereda por defecto desde el `body`; solo el Navbar lo declara explícitamente.
- **`font-mono` (Geist Mono) = metadatos / técnico / etiquetas placeholder.** Índices numéricos de proyectos ("01"), placeholders de imágenes ("categoría", "Captura próximamente") y texto técnico en mayúsculas con tracking amplio.

### Regla rápida
> ¿Es un título? → `serif` (Space Grotesk) + token fluido según nivel. ¿Es body/UI/botón? → `sans` (Inter), `text-fluid-body` si es descripción principal. ¿Es metadato/etiqueta técnica? → `mono` (Geist Mono).

### Convención: UI estática vs. contenido fluido (2026-09-17)

El sistema tipográfico se divide en **dos familias de escala con reglas distintas**:

| Sistema | Qué incluye | Escala | Justificación |
|---------|------------|--------|---------------|
| **Contenido editorial** | Títulos (`display`, `detail`, `section`, `featured`, `card`), cuerpo de lectura (`body`, `card-body`), numerals (`price`, `metric`), eyebrows de hero/about | **Fluida** — tokens `text-fluid-*` con `clamp(min, rem + vw, max)` | El texto editorial responde al viewport: debe escalar con el lienzo para mantener proporción con el layout |
| **Interfaz (UI)** | Footer completo, navbar (links, badge, botón Contacto), todos los botones del sistema, links de navegación, metadata técnica (eyebrows de cards, placeholders, breadcrumbs, chips) | **Estática** — `text-xs`/`text-sm`/`text-base` fijos, con micro-bumps de breakpoint (`sm:`/`2xl:`) permitidos | Los objetos UI son herramientas: su escala percibida la dicta el contenedor (altura, padding, área de toque), no el texto. Fluidizar el label sin fluidizar el contenedor rompe la proporción interna; fluidizar ambos viola la densidad UI |

**Reglas operativas:**

1. **Los botones nunca usan tokens fluidos.** Su tamaño lo define el sistema `size` del componente (`sm`/`md`/`lg`/`compact`), no la tipografía. El texto base es `text-sm 2xl:text-base` (14→16px) — el bump es un micro-ajuste de densidad, no una escala.
2. **Navbar y footer quedan estáticos.** Altura del navbar fija (`h-16`), footer con tamaños fijos. Solo se permiten micro-bumps (`text-sm lg:text-base`, `text-xs 2xl:text-sm`).
3. **El hero es contenido editorial** aunque contenga UI: los eyebrows `text-fluid-eyebrow` y el body `text-fluid-body` son fluidos; los botones CTA que los acompañan son estáticos. La convivencia es deliberada — las acciones no compiten con los displays.
4. **El área de toque manda.** Un botón no crece con el viewport porque su hit-area (~44px) es constante; el zoom de accesibilidad (WCAG 1.4.4) ya queda cubierto por `rem`, no requiere fluid.