# Sistema de Botones

> Fuente de verdad del sistema de botones del portfolio. Estado: **v3 — aprobado por el usuario tras comparación en vivo (:3000 vs :3001)**.
> Relacionado: [typography-families.md](./typography-families.md) define los tamaños de texto usados en los botones.

## Principios

1. **Solo dark mode activo hoy**, pero **jamás hardcodear colores** (`text-white`, `bg-white/90`…). Todo color sale de tokens: `text-foreground`, `text-background`, `text-muted-foreground`, `bg-purple-accent`, `border-border`.
2. **Forma dual por rol**: píldora (`rounded-full`) para navegación global; `rounded-xl` para acciones contextuales.
3. **Hover por variante, constante**: cada variante tiene UN único hover en todo el sitio.
4. **Shadow morado es la firma de marca**, con excepciones explícitas y justificadas (nunca arbitrarias).
5. Un botón documentable es un botón con **intención**: si necesitas un valor distinto, es un caso nuevo y se documenta, no se improvisa.

## Variantes

| Variante | Clases base | Hover | Uso |
| --- | --- | --- | --- |
| `primary` (sólido) | `bg-foreground text-background` | `hover:opacity-80` | Acción principal: navbar Contacto, hero Ver Proyectos, Volver, CTA detalle, featured |
| `outline` (borde) | `border border-border text-foreground` | `hover:bg-purple-accent/5 hover:border-purple-accent/30` | Acción secundaria: Descargar CV, GitHub/LinkedIn, copiar correo, pricing normal |
| `accent` (marca) | `bg-purple-accent text-foreground` | `hover:opacity-90` | Destacado de marca: Escríbeme (banner contacto) |
| `white` (inverso) | `bg-white text-purple-accent` | `hover:opacity-80` | Pricing destacado (plan Pro) |
| `inverted` (excepción) | `bg-foreground text-background` | `hover:bg-purple-accent hover:text-white` | **SOLO** links de proyecto del detalle (Ver código / Ver demo) |

### Por qué cada hover

- **`hover:opacity-80` en sólidos**: atenúa el botón completo, el contraste texto/fondo interno se mantiene. Es el patrón original del sitio y es superior a `hover:bg-white/80` o `hover:bg-foreground/80`, que cambian el fondo sin ajustar el texto y rompen legibilidad.
- **Hover morado `/5 + /30` en outlines**: firma de marca sutil; `bg-purple-accent/5` + `border-purple-accent/30` son los únicos valores permitidos. No hay segunda intensidad.
- **`hover:opacity-90` en accent**: suave, mantiene el morado protagonista.
- **Hover morado pleno SOLO en `inverted`**: es la excepción deliberada para que los enlaces de proyecto del detalle griten "acción de proyecto".

## Formas

| Forma | Clases | Rol |
| --- | --- | --- |
| Píldora | `rounded-full` | Navegación global y CTAs principales de sección hero/volver |
| Rounded | `rounded-xl` | Acciones contextuales: cards, banners, pricing, links de proyecto |

## Tamaños y paddings

| Tamaño | Clases | Dónde |
| --- | --- | --- |
| Navbar | `px-5 py-2` (desktop), `px-5 py-2.5 w-full` (mobile) | Contacto |
| Hero / estándar | `px-6 py-3` | Ver Proyectos, Descargar CV, Volver, CTA final, featured |
| Proyecto | `h-12 px-6` | Ver código / Ver demo |
| Compacto | `px-4 py-2.5` | Banner contacto (Escríbeme, GitHub, LinkedIn) |
| Full-width | `w-full py-3.5` | Pricing CTA |
| Icono cuadrado | `w-11` | Copiar correo |

## Shadow morado (firma "accent glow")

- **Regla general**: `shadow-sm shadow-purple-accent/60` en outlines contextuales (banner contacto: copiar, GitHub, LinkedIn; hero: Descargar CV).
- **Sin shadow**:
  - Pricing (highlighted y normal): los botones de pricing solo manejan lógica de hover, no shadow.
  - Primary sólidos (navbar, hero Ver Proyectos, Volver, featured): sin shadow morado. El `shadow-md` neutral de Ver Proyectos es heredado; se decide en el componente base.
  - Ver código / Ver demo.

## Tipografía

- Estándar: `text-sm 2xl:text-base font-semibold`.
- Navbar Contacto conserva `text-[15px] font-medium` (estilo original restaurado) — **deuda**: unificar a estándar al crear el componente base.

## Transición y foco

- `transition-colors duration-200`; los sólidos con hover de opacidad usan `transition-opacity duration-200`.
- Foco accesible en todos los botones migrados: `focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring`.
- Iconos: `gap-2` interno; tamaño contextual (14 banner / 15 hero / 16 CV).

## Inventario por sección (estado actual en :3001)

| Sección | Botón | Variante | Forma | Padding | Shadow | Hover |
| --- | --- | --- | --- | --- | --- | --- |
| Navbar | Contacto (desktop) | primary | pill | px-5 py-2 | — | opacity-80 |
| Navbar | Contacto (mobile) | primary | pill | px-5 py-2.5 w-full | — | opacity-80 |
| Hero | Ver Proyectos | primary | pill | px-6 py-3 | shadow-md (neutral, heredado) | opacity-80 |
| Hero | Descargar CV | outline | pill | px-6 py-3 | sm purple/60 | /5 + /30 |
| Detalle | Volver | primary | pill | px-6 py-3 | — | opacity-80 |
| Detalle | Ver código / Ver demo | inverted | rounded | h-12 px-6 | — | bg-purple-accent text-white |
| Detalle | CTA final | primary | rounded | px-6 py-3 | — | opacity-80 |
| Featured | CTA | primary | rounded | px-6 py-3 | — | opacity-80 |
| Pricing | CTA destacado (Pro) | white | rounded | w-full py-3.5 | — | opacity-80 |
| Pricing | CTA normal | outline | rounded | w-full py-3.5 | — | /5 + /30 |
| Banner | Escríbeme | accent | rounded | px-4 py-2.5 | — | opacity-90 |
| Banner | Copiar correo | outline | rounded | w-11 | sm purple/60 | /5 + /30 |
| Banner | GitHub / LinkedIn | outline | rounded | px-4 py-2.5 | sm purple/60 | /5 + /30 |
| Products | CTA | outline | rounded | w-full px-5 py-3 | — | **bg-secondary (deuda)** |

## Reglas de excepción (cerradas)

- Hover morado pleno en `inverted`: permitido solo en links de proyecto del detalle.
- Pricing: nunca shadow, siempre lógica de hover.

## Deuda técnica → componente base (próxima sesión)

Objetivo: crear componentes base que crezcan con `className` para eliminar micro-variaciones y hacer el sistema documentable en código.

1. **Renovar `components/ui/button.tsx`** (shadcn ya instalado y sin uso) con variantes propias: `primary`, `outline`, `accent`, `white`, `inverted` + `shape: pill | rounded` + `size` + passthrough de `className`.
2. Unificar deudas detectadas:
   - Navbar `text-[15px] font-medium` → `text-sm 2xl:text-base font-semibold`.
   - Products CTA `hover:bg-secondary` → `/5 + /30` (o documentar como excepción dedicada).
   - Decidir el `shadow-md` neutral de Ver Proyectos (mantener como estándar de primary hero o eliminar).
   - `transition-opacity` → `transition-colors` consistente en sólidos.
3. Migrar los 14 botones del inventario al componente sin cambiar decisiones visuales.

## Historial de decisiones

- **v1**: sistema con formas duales y hover morado en casi todo → **descartado en vivo** (el hover morado en sólidos de navegación no gustó).
- **v2**: hover morado solo en links de proyecto; resto estilo original (`bg-secondary`). → refinado en discusión.
- **v3 (actual)**: hover de marca `/5 + /30` como estándar de outlines (en vez de `bg-secondary`), shadow sm única (el `shadow-lg` de hero tomó el estándar `sm purple/60` en vivo), pricing sin shadow, tokens en vez de hardcoded.