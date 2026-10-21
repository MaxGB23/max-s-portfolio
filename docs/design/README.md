# Sistema de diseño - Portfolio de Max Gonzalez Ballesteros

> [!NOTE] Estado: CANONICO - canon multi-archivo estilo design.md
> Fuente de verdad del codigo: `app/globals.css`, `lib/rhythm.ts`,
> `lib/breakpoints.ts`, `lib/utils.ts` y los componentes.
> Glosario de migracion (que vino de donde): `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.
> Punto de entrada general (mapa de preguntas de todo el repo): `docs/README.md`.

## Identidad (resumen)

Portfolio dark-first de un desarrollador full-stack: oscuridad de fondo,
UN solo acento morado (oklch acorde a tema), tipografia tipo-led (Space
Grotesk en titulares, Inter en lectura, Geist Mono en datos/eyebrows) y
fluidez editorial (13 tokens `text-fluid-*`). Jerarquia por tamano y
tracking, no por opacidad. Marca ES dark: el modo claro existe solo como
derivado de tokens, sin UI para alternar. Detalle completo:
`docs/design/tokens.md` y `docs/design/typography-families.md`.

## Indice del canon

| Archivo | Que contiene | Para que sirve |
|---|---|---|
| [tokens.md](tokens.md) | Tokens de color, tipografia, radio, ritmo, elevacion y scrollbar | La paleta y las variables del sistema; fuente: globals.css |
| [tailwind-v4-theme.css](tailwind-v4-theme.css) | Espejo de extraccion del nucleo de tema (NO editar) | Regenerar/verificar el tema Tailwind v4 |
| [typography-families.md](typography-families.md) | Familias, 13 tokens fluidos, jerarquia, medida, historia | Tipografia: que token para que texto |
| [sections.md](sections.md) | 1 shell, 2 contrato de ritmo, 4.1-4.4 (navbar, hero, about, featured), 9 cue de llegada | La estructura de la home, verificada |
| [components-detail.md](components-detail.md) | 4.5-4.13: all-projects, cards, pricing, contacto, footer, detalle, auxiliares | Las superficies fuera de la home |
| [motion.md](motion.md) | 3 gates de media, 5 reveal y motion, 6 aurora | Como entra y se mueve el contenido |
| [platform.md](platform.md) | 7 tema y dark mode, 8 scroll, 10 debug overlay, 11 gotchas | La infraestructura que sostiene todo |
| [buttons.md](buttons.md) | API de Button, variantes, hovers, inventario por seccion, historia v1->v3 | Que boton usar donde |
| [pointer-gestures.md](pointer-gestures.md) | Reglas de pointer/teclado/foco + lightbox (detalle) | Interaccion con el puntero, trap de foco y el lightbox como caso canonico (7 rondas de bugs QA) |
| [section-animations.md](section-animations.md) | Patron unificado de animacion de titulos, excepciones, familias | Como se anima cada seccion y por que |
| [iteration-guide.md](iteration-guide.md) | Reglas de decision, E9/E15, flujo serif/sans/mono, gotchas, checklist (12) | Como iterar sin romper el sistema |
| [../../app/globals.css](../../app/globals.css) | Fuente de verdad del tema (no es doc, es codigo) | Leerlo primero si dudas de valores |

Los archivos `sections.md`, `components-detail.md`, `motion.md` y `platform.md`
nacieron el 2026-10-21 de partir `components.md`. Conservan la numeracion del
original: 4.4 sigue siendo el featured y 10 sigue siendo el debug overlay, vivan
donde vivan.

## Snapshot (no canonico)

- `archive/2026-09-21-pre-designmd/` - espejo byte-igual del canon anterior
  a este restructure, CONGELADO. No editar; verifica
  `scripts/snapshot-check.mjs`.
- `archive/` tambien conserva documentos historicos de trabajo:
  `refactor-theme-plan.md` y `session-2026-09-09-typography-layout-decisions.md`.

## Marcas de referencia (forma, no prescripcion)

`ejemplos/bugatti/` y `ejemplos/framer/` ilustran el FORMATO design.md y la
forma de documentos de marca. No son canonicos y no se copian como
prescripcion (ver `iteration-guide.md` seccion 7).

## Deuda unica del canon

La deuda del sistema vive DENTRO de cada archivo (seccion "Deuda") y en
`iteration-guide.md` seccion 10; el README no la repite para no duplicar
fuentes. Regla del canon: cada tema lista la suya, una sola vez.

## Donde esta cada pieza

El mapa de preguntas se mudo a `docs/README.md`: una sola fuente por cosa. Aqui
solo queda el indice de archivos de arriba.
