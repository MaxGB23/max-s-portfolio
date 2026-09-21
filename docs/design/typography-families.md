# Tipografia - familias y sistema fluido

> [!NOTE] Estado: CANONICO
> Valores verbatim de `app/globals.css` (`@theme inline`) y de las clases
> reales de los componentes. Glosario de migracion en
> `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

Contenido:

- [1. Familias](#1-familias)
- [2. Los 13 tokens fluidos](#2-los-13-tokens-fluidos)
- [3. Dos escalas: editorial y UI](#3-dos-escalas-editorial-y-ui)
- [4. Reglas de jerarquia](#4-reglas-de-jerarquia)
- [5. Jerarquia global (quien usa que)](#5-jerarquia-global-quien-usa-que)
- [6. Medida editorial](#6-medida-editorial)
- [7. Historia (callouts)](#7-historia-callouts)
- [8. Gotchas](#8-gotchas)
- [9. Deuda unica de tipografia](#9-deuda-unica-de-tipografia)

## 1. Familias

Tres familias, tres roles. Cargadas con `next/font` en `app/layout.tsx`
(interceptadas como `--font-*` y mapeadas en `@theme inline`):

| Rol | Familia | Token real | Fuente |
|---|---|---|---|
| Display / persona | Serif | `--font-serif` = `var(--font-space-grotesk), ui-serif, Georgia, serif` | Space Grotesk Variable (`next/font`) |
| UI / lectura | Sans | `--font-sans` = `var(--font-inter), ui-sans-serif, system-ui, sans-serif` | Inter Variable (`next/font`) |
| Datos / eyebrows | Mono | `--font-mono` = `'Geist Mono', 'Geist Mono Fallback'` | CADENA literal, NO cargada con next/font (deuda 9.1) |

Regla rapida de decision:

- Titulo de persona o seccion con intencion: `font-serif font-black uppercase tracking-tighter`.
- Cuerpo, UI, botones: `font-sans`.
- Eyebrows, cifras, metadatos tecnicos: `font-mono`.

## 2. Los 13 tokens fluidos

Doce en CSS + el par de cards cappeadas por columna; todos deben estar
registrados en `lib/utils.ts` (extendTailwindMerge) o `cn()` los rompe.

Escala editorial fluida:

| Token | Min | Max | Uso |
|---|---|---|---|
| `text-fluid-display` | 2.5rem (40) | 5rem (80) | h1 del hero |
| `text-fluid-section` | 2rem (32) | 3.25rem (52) | h2 de secciones |
| `text-fluid-detail` | 2.25rem (36) | 3.375rem (54) | h1 del detalle de proyecto |
| `text-fluid-featured` | 1.75rem (28) | 2.75rem (44) | h2 de panel destacado (cap: `lg:[@media(max-height:800px)]:text-4xl`) |
| `text-fluid-price` | 2rem (32) | 2.625rem (42) | Precio (dominante sobre label, debajo del titulo) |
| `text-fluid-subheading` | 1.5rem (24) | 2.25rem (36) | Subtitulos |
| `text-fluid-metric` | 1.125rem (18) | 1.5rem (24) | Cifra de metrica (rol display, token dedicado) |
| `text-fluid-eyebrow` | 0.9375rem (15) | 1.1875rem (19) | Etiqueta uppercase, tracking ancho |

Escala UI casi estatica:

| Token | Min | Max | Uso |
|---|---|---|---|
| `text-fluid-body` | 1rem (16) | 1.125rem (18) | Cuerpo editorial |
| `text-fluid-card-body` | 1rem (16) | 1.125rem (18) | Descripcion de card |
| `text-fluid-card` | 1.125rem (18) | 1.5rem (24) | Titulo generico de card |
| `text-fluid-card-title` | 1.125rem (18) | 1.375rem (22) | Titulo en grid de cards (cap ~395px) |
| `text-fluid-card-desc` | 0.9375rem (15) | 1rem (16) | Descripcion en grid de cards (cap ~395px) |

Notas del sistema:

- Los tokens NO incluyen `line-height`: lo fija la seccion
  (`leading-[0.9]` titulares, `leading-relaxed` cuerpo).
- Topo: el crecimiento `vw` se agota a los 1600px de ancho.
- Ratios min->max <= 2.5x (el mas agresivo, `display`, es 2x).
- Los tokens solo existen via `@theme inline`; no hay clases `text-5xl`
  arbitraras en el canon.

## 3. Dos escalas: editorial y UI

- **Editorial fluida**: visible en titulares (display/section/detail/featured/
  subheading/price). Crece con el viewport porque el titular DOMINA la
  seccion; freeze intencional solo en el stack de featured (cap de altura).
- **UI casi estatica**: cuerpo y cards (body/card-body/card/card-title/
  card-desc). El texto de lectura no debe bailar con la resolucion; los
  cambios son de 1-2px en rangos extremos. `card-title`/`card-desc` estan
  cappeados por la columna fisica del grid (max-w-7xl, 3 cols, gap-6 ->
  ~395px): el vw global seguiria creciendo despues de que la columna deja
  de crecer.
- **Botones NUNCA fluidos**: `text-sm 2xl:text-base` (14/16px). Un CTA debe
  caber en cualquier viewport y mantener area de toque (~44px). Ver
  `docs/design/buttons.md`.

## 4. Reglas de jerarquia

- La jerarquia se resuelve por TAMAÑO y TRACKING, no por opacidad: los
  titulos son `text-foreground` solido; el cuerpo es `text-content`.
  Excepciones acotadas decididas en este restructure:
  - Micro tag labels (chips de stack, 9-12px): `text-foreground/60` a
    `text-foreground/70` (4 usos verificados en featured panel, project card
    y detalle). Es una excepcion tipo "etiqueta degradada", no una regla
    general.
  - Palabra acento en titulares: `text-purple-accent` + `brightness-110`
    (o `brightness-125` en el panel featured) es el PATRON del sistema,
    no un hack (ver `docs/design/iteration-guide.md`, decision E9).
- Uppercase SOLO en eyebrows y titulares (doble uso de tracking que comprime
  y de uppercase que ensancha: nunca ambos con tracking-tighter).
- `font-black` es la voz del titular (con `uppercase` y `tracking-tighter`);
  nunca usar `font-bold` en titulares de seccion.

## 5. Jerarquia global (quien usa que)

| Nivel | Pieza | Token | Familia / peso | Notas |
|---|---|---|---|---|
| L0 | h1 hero | `text-fluid-display` | serif black uppercase tracking-tighter | con palabra final acento |
| L1 | h2 seccion | `text-fluid-section` | serif black uppercase tracking-tighter | `leading-[0.9]`, palabra acento brightness |
| L1b | h1 detalle | `text-fluid-detail` | serif black uppercase tracking-tighter | con header meta mono |
| L2 | titulo panel featured | `text-fluid-featured` | serif black uppercase tracking-tighter | cap de altura en featured |
| L2b | subtitulos | `text-fluid-subheading` | serif black | pocas instancias |
| L3 | titulo card | `text-fluid-card-title` / `text-fluid-card` | sans semibold | grid cappado vs card libre |
| L3b | precio | `text-fluid-price` | sans font-black | dominante sobre label |
| L4 | body | `text-fluid-body` / `text-fluid-card-body` | sans | `leading-relaxed`, `text-content` |
| L5 | meta / cifras | `text-fluid-metric` / `text-[10px]`-`text-xs` / `text-fluid-eyebrow` | mono / sans medium | labels uppercase tracking ancho |

## 6. Medida editorial

Ancho de linea por `ch` (o max-width) para textos de lectura, tomado del
codigo real:

| Contexto | Medida | Factor |
|---|---|---|
| Hero description | `min(titleWidth + 4, 60ch)` (JS) | 60ch max |
| Sobre-mi parrafos | `max-w-[48ch]` | 48ch |
| Featured description | `max-w-[50ch]` | 50ch |
| Detalle headline | `max-w-2xl` (672px) | Headline corto |
| Detalle editorial | `max-w-3xl` + `text-base 2xl:text-lg` | Lectura larga |
| Contact / pricing sub | `max-w-xl` / `max-w-lg` | Una idea |

El contraste de lectura:

- Dark: `--content` = `oklch(0.75 0 0)` sobre background oscuro (~9.2:1).
- Light: `--content` = `oklch(0.38 0 0)` sobre blanco (~10.0:1).
- `text-muted-foreground` solo para labels/meta, nunca para parrafos.

## 7. Historia (callouts)

> [!NOTE] 2026-09-14 - Escalera tipografica
> Se sustituyo el sistema de "max-w + clamp por resolucion con saltos" por
> la escalera fluida actual (los 13 tokens). Razon: los saltos por breakpoint
> generaban escalones visibles (p. ej. 40 -> 48 -> 56) que parecian errores
> de render. El vw continuo elimina los escalones; el cap por token limita el
> crecimiento en ultra-anchos.

> [!NOTE] 2026-09-17 - Recalibracion del detalle
> El h1 de detalle bajo de `text-fluid-display` a `text-fluid-detail`
> (36-54). Razon: el detalle convive con la meta header (eyebrow + circulo
> con numero) y un titulo del tamano del hero lo aplastaba.

> [!NOTE] Precio < titulo (ratio ~0.92)
> El precio (32-42) queda por debajo del titulo de pricing (32-52) en todas
> las resoluciones medidas (390 / 1280 / 1920). El precio es prominente
> sobre su label, pero nunca compite con el h2.

> [!NOTE] 2026-09-20 - Hero: fallback ELIMINADO y regimen de altura
> Los gradientes de fallback que simulaban el ancho del titulo fueron
> eliminados; el ancho lo mide JS (`useTitleWidth`). El pad superior es un
> regimen de altura: `pt-22 sm:pt-24 lg:[@media(min-height:700px)]:pt-34 2xl:pt-40`
> (el hero respira segun la ALTURA disponible, no solo el ancho).

> [!NOTE] 2026-09-14 - Footer minimal
> El footer dejo de ser un navegador (sin nav, sin reloj en vivo) y se
> volvio una firma: marca + bio + redes + copyright.

## 8. Gotchas

- Turbopack NO recarga en caliente los cambios de tokens fluidos: reiniciar
  el dev server (y purgar `.next`) y correr `scripts/type-scale.mjs` para
  validar la escala.
- Agregar un token nuevo a `@theme inline` NO basta: hay que registrarlo en
  `lib/utils.ts` (`extendTailwindMerge`, lista de `fluid-*`) o `cn()`
  concatena mal las clases.
- `docs/design/archive/2026-09-21-pre-designmd/typography-families.md`
  contiene el estado pre-migracion (no canonico).

## 9. Deuda unica de tipografia

- 9.1 Geist Mono no esta cargado con `next/font` (cadena literal en `@theme
  inline`): si el visitante no tiene la fuente instalada, cae en el fallback.
  Cargarlo requiere tocar `app/layout.tsx` (fuera de alcance de docs; NO
  normalizar con `next/font/google` sin plan de peso).
- 9.2 El par `card` vs `card-title` convive con roles superpuestos:
  `card` (18-24, libre) solo se usa fuera del grid cappado. Si queda un solo
  uso, unificar en `card-title` en una futura limpieza de codigo.