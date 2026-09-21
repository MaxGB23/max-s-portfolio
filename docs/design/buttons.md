# Botones - canon v3

> [!NOTE] Estado: CANONICO
> API y clases verificadas contra `components/ui/button.tsx` y todos los
> call sites del sitio. Glosario de migracion:
> `docs/design/archive/2026-09-21-pre-designmd/INDEX.md`.

Contenido:

- [1. API real](#1-api-real)
- [2. Principios](#2-principios)
- [3. Variantes y por que cada hover](#3-variantes-y-por-que-cada-hover)
- [4. Formas](#4-formas)
- [5. Tamanos y fullWidth](#5-tamanos-y-fullwidth)
- [6. Sombra (glow)](#6-sombra-glow)
- [7. Tipografia y foco](#7-tipografia-y-foco)
- [8. Inventario por seccion (verificado)](#8-inventario-por-seccion-verificado)
- [9. Historia v1 -> v2 -> v3](#9-historia-v1---v2---v3)
- [10. Deuda unica de botones](#10-deuda-unica-de-botones)

## 1. API real

`components/ui/button.tsx` (cva + Slot si `asChild`):

- Props: `className`, `variant`, `shape`, `size`, `fullWidth` (default
  `false`), `glow` (default `false`), `asChild` (default `false`).
- Base: `inline-flex items-center justify-center gap-2 text-sm 2xl:text-base
  font-semibold focus-visible:outline focus-visible:outline-offset-2
  focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50`.
- `data-slot="button"` en el raiz.

## 2. Principios

1. Solo dark-first: los botones existen para el tema dark (la marca ES dark).
2. Sin colores hardcodeados (excepto la regla de blancos sobre acento/foto,
   ver iteration-guide): todo viene de tokens/variantes.
3. Forma dual: `rounded` (default) para accion de UI; `pill` para CTA
   llamativos (navbar, hero, detalle).
4. Hover por variante, no global: cada variante define su propio hover
   (fondo vs opacidad) porque el cambio correcto depende del CONTRASTE
   de fondo sobre el que vive.
5. Sombra morada = firma del CTA secundario (glow opt-in), nunca en solidos.

## 3. Variantes y por que cada hover

| Variante | Clases reales | Hover | Por que |
|---|---|---|---|
| `primary` | `bg-foreground text-background` | `hover:opacity-80` | Solido inverso (foreground como fondo): un cambio de color romperia el contraste; la opacidad conserva el color de marca |
| `outline` | `border border-border text-foreground` | `hover:bg-purple-accent/5 hover:border-purple-accent/30` | El contorno se tiñe de acento de forma sutil: es la CTA secundaria que se insinua |
| `accent` | `bg-purple-accent text-foreground` | `hover:opacity-90` | Solido morado: opacidad suave (hoy SIN consumidores, reservada) |
| `inverted` | `bg-foreground text-background` | `hover:bg-purple-accent hover:text-white` | Cambio pleno a morado: es la CTA de detalle, el hover es la ficha de identidad |
| `white` | `bg-white text-purple-accent` | `hover:opacity-80` | Solido blanco sobre tarjeta morada (pricing destacado): opacidad, nunca otro color |

Transiciones reales: solidos usan `transition-opacity duration-200`
(primary, accent, white); los que cambian fondo usan `transition-colors
duration-200` (outline, inverted).

## 4. Formas

- `rounded` (default): `rounded-xl` (12px, = `--radius-lg`). Accion de UI.
- `pill`: `rounded-full`. CTA llamativos; requiere sizes que den altura
  suficiente (sm/md/lg y fullWidth en mobile).

## 5. Tamanos y fullWidth

| Size | Clases reales | Uso |
|---|---|---|
| `sm` | `px-5 py-2` | Navbar CTA (desktop y mobile) |
| `md` | `px-6 py-3` | Default: hero, detalle, featured |
| `lg` | `h-12 px-6` | Detalle (links), contacto (todos los botones) |
| `compact` | `px-4 py-2.5` | SIN consumidores (deuda 10.3) |

- `fullWidth` -> `w-full`. Patron aceptado: ajustes de altura por `className`
  (`py-3.5` pricing, `py-2.5` navbar mobile, `px-5 py-3 justify-between`
  products) - es delicado pero documentado por call site (seccion 8).
- Los botones del sitio NO usan tipografia fluida: `text-sm 2xl:text-base`
  fijo (regla de hit area, ver typography-families.md).

## 6. Sombra (glow)

- `glow` -> `shadow-sm shadow-purple-accent/60` (sombra morada suave).
- Solo en variante `outline` (CTA secundaria): 4 usos verificados
  (seccion 8). NUNCA en pricing, NUNCA en solidos, NUNCA por defecto.
- Excepcion heredada: "Ver Proyectos" (hero) lleva `shadow-md` neutro via
  `className` (deuda 10.1).

## 7. Tipografia y foco

- `text-sm 2xl:text-base font-semibold` (no fluido; keep 14px base).
- `gap-2` para iconos; `inline-flex items-center justify-center`.
- Foco: `focus-visible:outline focus-visible:outline-offset-2
  focus-visible:outline-ring` (anillo morado, igual que el sistema).
- `disabled:opacity-50` + `pointer-events-none`.

## 8. Inventario por seccion (verificado)

| Seccion | Uso | Variante / shape / size | Notas |
|---|---|---|---|
| Navbar desktop | Contacto | `primary pill sm` | Sin shadow; hover opacidad |
| Navbar mobile | Contacto | `primary pill sm fullWidth py-2.5` | Ocupa el ancho |
| Hero | Ver Proyectos | `primary pill md` + `shadow-md` | shadow heredada (deuda 10.1) |
| Hero | Descargar CV | `outline pill md glow` | Firma morada |
| Detalle | Volver | `primary pill md` + `back-btn hover:bg-foreground/80 transition-colors` | Excepcion: hover de fondo, NUNCA opacity (GSAP lo controla) |
| Detalle | Ver codigo / Ver demo | `inverted lg rounded` | Cambio pleno a morado |
| Detalle | CTA final (Volver a proyectos) | `primary md` | En banda morada suave |
| Featured | Ver caso de estudio | `primary md` | Con FadeIn |
| Pricing | Pro (destacado) | `white rounded fullWidth py-3.5` | Sin shadow (nunca) |
| Pricing | Los demas planes | `outline rounded fullWidth py-3.5` | Sin shadow (nunca) |
| Contacto | Conectemos en LinkedIn | `primary lg` | Unico primary en contacto |
| Contacto | Escríbeme... | `outline glow lg` | Firma morada |
| Contacto | Copiar correo | `outline glow lg` | Estado copiado: `border-purple-accent/40 text-purple-accent brightness-110` |
| Contacto | GitHub | `outline glow lg` | Firma morada |
| Products (no renderizado) | Saber mas | `outline fullWidth px-5 py-3 justify-between` | Import muerto en page.tsx (ver components.md 4.11) |

Nota: el inventario anterior incluia un boton "Banner" `compact px-4 py-2.5
w-11` que NO existe en el codigo actual: el contacto real usa 4 botones
grandes (lg) y la clase `compact` no tiene consumidores. El inventario de
este canon refleja el codigo.

## 9. Historia v1 -> v2 -> v3

- **v1** (origen): 2 variantes (primary/outline), un tamaño, hovers
  inconsistentes y colores directos en botones de seccion.
- **v2** (refactor de componentes): 4 variantes, 2 shapes, 3 tamanos;
  `fullWidth` en pricing; hover unificado por variante.
- **v3 (canon actual)**: se agregan `inverted` y `white` (detalle y pricing
  destacado), `glow` (firma morada opt-in), `compact` (sin uso hoy),
  transitions por tipo (opacity vs colors) y el record de hovers por
  variante que se documenta aqui. `copyEmail` con fallback mailto y estado
  copiado con acento (brightness-110) entraron en v3.

## 10. Deuda unica de botones

- 10.1 `shadow-md` neutral en "Ver Proyectos" (hero) via `className`
  (heredada de v1/v2): decidir si se vuelve patron del sistema o se elimina.
- 10.2 Transicion no uniforme: solidos `transition-opacity`, fondo-cambio
  `transition-colors`. Es intencional por variante, pero si el sistema
  quiere una sola convencion, unificarla (requiere tocar button.tsx, fuera
  de alcance de docs).
- 10.3 `size="compact"` sin consumidores (definido en la API, sin uso).
- 10.4 `variant="accent"` sin consumidores (reservada; el acento real se
  logra con outline hover y fondos `/5` y `/10`).