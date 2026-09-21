# Guia de iteracion

> [!NOTE] Estado: CANONICO
> Reglas de decision para iterar sobre el sistema de diseño. Fuentes:
> decisiones tomadas en este restructure (E9/E15) y reglas migradas del
> canon anterior, verificadas contra el codigo.
> Glosario: `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

Contenido:

- [1. Como decides (reglas duras)](#1-como-decides-reglas-duras)
- [2. Decisiones de este restructure (E9 / E15)](#2-decisiones-de-este-restructure-e9--e15)
- [3. Flujo de decision serif / sans / mono](#3-flujo-de-decision-serif--sans--mono)
- [4. Jerarquia por tamano y tracking](#4-jerarquia-por-tamano-y-tracking)
- [5. Blancos y opacidades](#5-blancos-y-opacidades)
- [6. Gradientes escasos](#6-gradientes-escasos)
- [7. Que NO copiamos de las marcas de referencia](#7-que-no-copiamos-de-las-marcas-de-referencia)
- [8. Iteracion segura (paso a paso)](#8-iteracion-segura-paso-a-paso)
- [9. Gotchas de entorno](#9-gotchas-de-entorno)
- [10. Deuda unica de la guia](#10-deuda-unica-de-la-guia)

## 1. Como decides (reglas duras)

1. Dark-first: diseña para dark; el light es un derivado pasivo.
2. UN solo acento (morado): cualquier otro color de marca requiere
   evaluacion explicita y se registra aqui.
3. Tipo-led: jerarquia por tamano y tracking, NO por opacidad (con las
   excepciones acotadas de la seccion 5).
4. Editorial fluido vs UI estatica: titulares crecen con el viewport;
   cuerpos y botones no.
5. Sin colores hardcodeados: solo tokens. Excepcion documentada: whites
   sobre acento/foto (seccion 5) y los colores del hero badge historico
   (ver seccion 10).
6. El CODIGO gana: si un cambio de codigo contradice estos docs, se
   actualiza el doc, no se revierte el codigo.

## 2. Decisiones de este restructure (E9 / E15)

### E9 - brightness como patron del sistema

`brightness-110` (y `brightness-125` en el panel featured) sobre texto
`text-purple-accent` es el PATRON para la palabra acento de titulares
(verificado en 7+ instancias: hero detail, about aside, section headings,
pricing, contact, featured). Reglas:

- `brightness-110` -> palabra acento en h1/h2 de seccion.
- `brightness-125` -> reservada al titulo del panel featured (mayor enfasis).
- `brightness-110` sobre `text-muted-foreground` SOLO en la etiqueta del
  hero (excepcion historica verificada).
- `brightness-150` en un divisor (`w-px h-8 bg-border` del hero) es un
  one-off, NO se replica.
- Prohibido usar brightness como hack de contraste sobre texto muted en
  general.

### E15 - blancos y opacidades (regla re-escrita)

La regla absoluta "text-white esta prohibido" se sustituye por una regla
acotada y verificada (22 matches en el codigo):

**Blancos permitidos SOLO en:**
- Texto sobre fill morado (`bg-purple-accent`): badges de categoria,
  pricing destacado (`text-white/70` y `/75` en el tier highlight).
- Texto y controles sobre fotografia / backdrop oscuro: hero badge (sobre
  la foto), lightbox (`bg-white/10 text-white`, contador `text-white/80`,
  figcaption).
- Prohibido sobre canvas o superficie neutra (background/card).

**Opacidades de texto (excepcion tag-label):**
- `text-foreground/60` y `text-foreground/70` SOLO en micro labels de tags
  de stack (9-12px: featured panel, project card, circulo del detalle);
  `text-muted-foreground/90` solo en el link footer de las cards.
- Cualquier otro texto con opacidad requiere discutirlo y registrarlo aqui.

## 3. Flujo de decision serif / sans / mono

1. Es un titular de marca (hero, seccion, detalle, panel)? -> serif black
   uppercase tracking-tighter + token fluido editorial.
2. Es texto de lectura o UI? -> sans (`text-content` cuerpo, `text-foreground`
   titulos de card).
3. Es dato / etiqueta / cifra / eyebrow? -> mono o sans medium uppercase con
   tracking ancho (`text-flow-eyebrow`, `text-[10px]`-`text-xs` para chips).
4. Es un boton? -> sans semibold estatico (`text-sm 2xl:text-base`), nunca
   fluido.

## 4. Jerarquia por tamano y tracking

- Titular de seccion: `font-serif font-black uppercase tracking-tighter
  leading-[0.9]`, token `text-fluid-section` (varia por seccion).
- Uppercase SOLO en eyebrows y titulares: nunca ambos con tracking-tighter
  sin evaluar el efecto de ensanche.
- Palabra acento del titular: `text-purple-accent brightness-110` (E9).
- Cuerpo: `text-content leading-relaxed`; nunca `text-muted-foreground` en
  parrafos.

## 5. Blancos y opacidades

Resumen operativo:

| Contexto | Permiso |
|---|---|
| Palabra acento en titular | `text-purple-accent` + brightness (E9) |
| Badge categoria sobre morado | `bg-purple-accent text-white` |
| Tier destacado pricing | texto blanco (`white` / `white/70` / `white/75`) |
| Lightbox / hero badge sobre foto | blancos y transparencias |
| Micro tag labels (9-12px) | `text-foreground/60`-`/70` |
| Link footer de card | `text-muted-foreground/90` hover foreground |
| Cualquier otro texto | solido (foreground / content / muted-foreground por rol) |

## 6. Gradientes escasos

- Solo tres fuentes de "color de ambiente": aurora del hero (solo dark),
  glow inferior del footer (`bg-accent-purple/10 blur-[120px]`), y los
  placeholders de gradiente en cards (`from-purple-accent/10`).
- Un card puede tener glow; una SECCION completa, no (salvo hero).

## 7. Que NO copiamos de las marcas de referencia

Las marcas de referencia (`docs/design/ejemplos/`) ilustran FORMA, no son
prescripcion:

- Bugatti: oscuridad + tipografia editorial (forma); NO copiar su nav
  fullscreen ni el glitch de "select tool".
- Framer: composicion y luz (forma); NO copiar su grid de marcas ni el
  colorido.
- El portfolio no tiene light mode de marca: la marca ES dark (tenemos un
  tema light derivado en tokens, sin UI para cambiarlo).

## 8. Iteracion segura (paso a paso)

1. Nueva seccion: crea con `Section` (shell + debug), elige tokens de color
   y tipografia ANTES de maquetar.
2. Respeta el contrato de ritmo (`lib/rhythm.ts` + etiquetas de pares);
   corre `scripts/rhythm-contract.mjs` y `scripts/section-spacing.mjs`.
3. Textos: regla de jerarquia (seccion 4) y de blancos (seccion 5).
4. Botones: usa `Button` con las variantes del canon; si necesitas un hover
   nuevo, justificalo en buttons.md.
5. Motion: `FadeIn`/`FadeInStagger` (framer-motion). NO revertir a
   `SlideIn`/`ScaleIn`. GSAP solo donde ya vive (pin featured, detalle,
   pricing, about).
6. QA: `layout-debug` (data-debug + debug-l1..l4) antes de pedir review.

## 9. Gotchas de entorno

- `@source not "../docs"` en globals.css: los DOCS contienen clases
  literales que romperian el CSS si Tailwind los escanea. Al escribir
  ejemplos de clase en estos docs, hazlo en bloques de codigo, nunca como
  texto plano suelto en contexto de template.
- Turbopack no hot-reloada los tokens fluidos: tras un cambio en
  `@theme inline`, reinicia dev y purga `.next`; valida con
  `scripts/type-scale.mjs`.
- `overflow-x: clip` (no `hidden`): no crea scroll container y no rompe
  scrolls internos; no "mejorarlo" a hidden sin prueba.
- `cn()` requiere el registro de tokens fluidos en `lib/utils.ts`.
- El pin del featured NO debe recibir `overflow-y-auto`.
- Snapshot: `docs/design/archive/2026-09-21-pre-designmd/` es un espejo
  byte-igual del canon anterior, CONGELADO y no canonico; la verifica
  `scripts/snapshot-check.mjs`.

## 10. Deuda unica de la guia

- 10.1 Hero badge historico: el badge del hero hardcodea `#5865F2` (Discord
  blurple) + ola blanca, contradiciendo "un solo acento y sin hardcodear":
  se documenta como excepcion historica del hero, NO como patron; decidir su
  reemplazo por tokens con la proxima iteracion de hero
  (`docs/ideas-features/hero-design.md`).
- 10.2 La nota stale "Vercel Preview Deployment activado para la rama
  feat/fluid-typo" (canon anterior) se ELIMINO deliberadamente del canon
  vivo: es informacion de rama agotada y el snapshot la conserva.
- 10.3 `chart-1..5` mapeados sin definicion (ver tokens.md 9.1): si llega
  un chart, definirlos; si no, eliminar el mapeo.