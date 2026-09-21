# Sistema de diseno - Portfolio de Max Gonzalez Ballesteros

> [!NOTE] Estado: CANONICO - canon multi-archivo estilo design.md
> Fuente de verdad del codigo: `app/globals.css`, `lib/rhythm.ts`,
> `lib/breakpoints.ts`, `lib/utils.ts` y los componentes.
> Glosario de migracion (que vino de donde): `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

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
| `tokens.md` | Tokens de color, tipografia, radio, ritmo, elevacion y scrollbar | La paleta y las variables del sistema; fuente: globals.css |
| `tailwind-v4-theme.css` | Espejo de extraccion del nucleo de tema (NO editar) | Regenerar/verificar el tema Tailwind v4 |
| `typography-families.md` | Familias, 13 tokens fluidos, jerarquia, medida, historia | Tipografia: que token para que texto |
| `components.md` | Shell Section, contrato de ritmo, gates, geometria por componente, motion, scroll | Layout verificada de cada seccion |
| `buttons.md` | API de Button, variantes, hovers, inventario por seccion, historia v1->v3 | Que boton usar donde |
| `pointer-gestures.md` | Reglas de pointer/drag/select + lightbox (detalle) | Interaccion con el puntero y lightbox |
| `iteration-guide.md` | Reglas de decision, E9/E15, flujo serif/sans/mono, gotchas | Como iterar sin romper el sistema |
| `../../app/globals.css` | Fuente de verdad del tema (no es doc, es codigo) | Leerlo primero si dudas de valores |

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

La deuda del sistema vive DENTRO de cada archivo (seccion "Deuda unica") y
en `iteration-guide.md` seccion 10; el README no la repite para no duplicar
fuentes. Regla del canon: cada tema lista la suya, una sola vez.

## Donde esta cada pieza (mapa rapido)

| Pregunta | Archivo |
|---|---|
| Que valor tiene X color? | `tokens.md` 2 |
| Que token fluido para un titulo de card en grid? | `typography-families.md` 2 |
| Cual es el gap entre hero y about? | `components.md` 2 (o `lib/rhythm.ts`) |
| Por que el featured se apila en ciertas pantallas? | `components.md` 3 (`FEATURED_STACK_GATE`) |
| Que variante de Button para el CTA de pricing? | `buttons.md` 8 |
| Puedo usar text-white? | `iteration-guide.md` 5 |
| Como se activa el debug de layout? | `components.md` 10 (o skill `layout-debug`) |
| De donde se extrae el espejo del tema? | `app/globals.css` -> `tailwind-v4-theme.css` |