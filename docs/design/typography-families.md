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
| `text-fluid-section` | `clamp(2.25rem, 1.56rem + 2.94vw, 4.5rem)` | 36 → 72 | Headings de sección + Hero `h1` + Detail `h1` |
| `text-fluid-featured` | `clamp(2rem, 1.39rem + 2.61vw, 4rem)` | 32 → 64 | Featured panel `h2` |
| `text-fluid-card` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 → 24 | Card `h3` |
| `text-fluid-subheading` | `clamp(1.5rem, 1.27rem + 0.98vw, 2.25rem)` | 24 → 36 | Detail SectionTitle + métricas |
| `text-fluid-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 | Descripciones (hero, about, featured, pricing) |
| `text-fluid-card-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 | Descripción de cards |
| `text-fluid-eyebrow` | `clamp(0.9375rem, 0.86rem + 0.33vw, 1.1875rem)` | 15 → 19 | Labels / eyebrows (role, "Conóceme") |

**Calibración (2026-09, recalibración unificada)**: TODOS los tokens interpolan en la **misma ventana 375 → 1600px** y topan exactamente en 1600px. Antes cada token topaba en un ancho distinto (eyebrow 857px, card-body 933px, body 1120px, section 1600px, featured 1631px) y la jerarquía relativa se distorsionaba al crecer la resolución. Body reducido de 20px → 18px máximo (práctica 2026: 16–18px). En pantallas < 375px los títulos quedan fijos en su mínimo.

> Decisión clave (actualizada 2026-09): **el primer escalón de la escalera es 16px (body)** — nada de texto de lectura baja de eso. Los labels/eyebrows (role, "Conóceme") se tratan como **kicker del título**, NO como eyebrow decorativo de UI: van −1px bajo el body en mobile (15 vs 16), ≈igual en sm–md, y +1px SOBRE el body en grandes (19 vs 18 a 1600px). El cruce con la curva del body ocurre en ~941px. La presencia del role se apoya en tamaño (no solo uppercase + tracking como antes), porque es la declaración de identidad del hero: el "Full Stack Developer" dejó de ser el texto más pequeño de la sección. Los eyebrows puramente decorativos de UI (badges, "desde" en pricing) siguen la norma 12–16px en contextos pequeños.

**Medidas reales en mobile 375px** (2026-09, aprobadas por el usuario):

| Elemento | Token | Tamaño real (375px) | Rango de práctica 2026 |
|----------|-------|---------------------|------------------------|
| role / label (hero y about) | `text-fluid-eyebrow` | **15px** | 12–16px ✅ |
| descripción | `text-fluid-body` | **16px** | 16–18px ✅ |
| h1 hero / h2 about | `text-fluid-section` | **36px** | 28–40px ✅ |

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
| 1 | Headings de sección — Hero `h1`, Detail `h1`, About `h2`, "Proyectos Destacados", "Todos los Proyectos", "Servicios a medida" | `text-fluid-section` | 72px | serif / black |
| 2 | Featured panel `h2` (caso de estudio apilado) | `text-fluid-featured` | 64px — **escalón bajo las secciones (4–9px menor en todo el rango, ratio ≈ 0.88)** | serif / black |
| 3 | Card `h3` (título de proyecto) | `text-fluid-card` | 24px | serif / bold |
| 4 | Detail SectionTitle `h2` + métricas | `text-fluid-subheading` | 36px | serif / bold |
| 5 | Descripciones / body | `text-fluid-body` | 18px | sans (heredada) |
| 6 | Descripción de cards | `text-fluid-card-body` | 18px | sans (heredada) |
| 7 | Labels / eyebrows (kicker) | `text-fluid-eyebrow` | 19px | sans (heredada) |

> Nota histórica: el hero `h1` **solía** tener un titular propio de 96px (`text-fluid-display`, ratio fijo 4:3 sobre la sección — se percibía desproporcionado en todos los dispositivos). Uniformización (2026-09): hero y detail usan `text-fluid-section` (36→72px); se eliminaron el token `text-fluid-display`, la mq quirúrgica 768–800px y el `md:px-4`. La jerarquía del hero se apoya en composición (uppercase, tracking, layout, aurora), no en tamaño.

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

> El Navbar es la única sección que usa `font-sans` de forma **explícita** (además del fondo global del `body`). No usa tokens fluidos.

---

## Hero (`components/hero-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Full Stack Developer" | sans (heredada) | `uppercase tracking-[0.2em] 2xl:tracking-widest font-medium text-fluid-eyebrow` |
| `h1` "Max González Ballesteros" | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| Descripción | sans (heredada) | `px-4 sm:px-16 md:px-0 text-fluid-body leading-relaxed brightness-125 text-muted-foreground max-w-full` + `style: maxWidth` medido del título (hook `useTitleWidth`) |
| Botones CTA (Ver Proyectos / Descargar CV) | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Label "Stack Principal" | sans (heredada) | `text-xs 2xl:text-base uppercase tracking-widest font-semibold` |
| Indicador "Deslizar" | sans (heredada) | `text-xs 2xl:text-base tracking-widest uppercase` |
| Icónos de stack | — | `size-6 2xl:size-7` |

> La descripción toma el ancho de la línea más ancha del `h1` (hook `useTitleWidth`, mide los `<span>` del título). Sin "valores mágicos": max-width solo en multi-columna (md+, 768px); en mobile fluye al ancho natural del contenedor.

---

## About (`components/about-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Conóceme" | sans (heredada) | `uppercase tracking-[0.2em] font-medium text-fluid-eyebrow` |
| `h2` "Sobre Mí" | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| Descripción (2 párrafos) | sans (heredada) | `px-4 sm:px-16 md:px-0 text-fluid-body leading-relaxed text-muted-foreground max-w-[62ch] space-y-4` |

---

## Featured / Stacking (`components/featured-project-panel.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Índice numérico "01" | mono | `text-sm 2xl:text-lg font-mono tabular-nums font-bold` |
| Badge de categoría | sans (heredada) | `text-xs font-semibold` (pill purple) |
| `h2` Título del proyecto | serif | `font-serif font-black text-fluid-featured leading-[1.05] tracking-tight text-balance` |
| Descripción | sans (heredada) | `text-fluid-body leading-relaxed text-muted-foreground mb-6 mr-6 sm:mr-0 max-w-[62ch]` |
| Métrica clave | sans (heredada) | `text-xs sm:text-sm font-semibold` (pill outline purple) |
| Botón CTA "Ver caso de estudio" | sans (heredada) | `text-sm font-semibold` |
| Badge flotante de índice | serif | `text-2xl font-black font-serif` (número) |
| Placeholder de imagen (categoría) | mono | `font-mono text-xs uppercase tracking-widest` |

---

## Grid de proyectos (`components/projects-section.tsx`)

### Títulos de sección

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| `h2` "Proyectos Destacados" (SectionHeading) | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| `h2` "Todos los Proyectos" (ProjectsTransition) | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |

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
| Descripción | sans (heredada) | `text-fluid-card-body leading-relaxed line-clamp-3` |
| Métrica | sans (heredada) | `text-[11px] 2xl:text-sm font-semibold` (pill purple) |
| Tags de stack (iconos) | — | `labelClassName` `text-[9px] 2xl:text-[10px]`, contenedor `w-8 h-8 2xl:w-12 2xl:h-12` |
| Footer "Caso de estudio" | sans (heredada) | `text-xs 2xl:text-base font-semibold` |

---

## Detalle de proyecto (`components/project-detail.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Botón flotante "Volver" | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Badge de categoría (hero) | sans (heredada) | `text-xs 2xl:text-sm font-semibold` (pill purple) |
| `h1` Título del proyecto | serif | `font-serif font-black text-fluid-section leading-[1.02] tracking-tight text-balance` |
| `p` headline (hero) | sans (heredada) | `text-base 2xl:text-2xl leading-relaxed max-w-2xl` |
| Chips de stack (StackChips) | sans (heredada) | texto `text-sm 2xl:text-base`; iconos `w-6 h-6 2xl:w-7 2xl:h-7`; fallback `text-[9px] 2xl:text-[10px]` |
| `h2` Sección (SectionTitle) | serif | `font-serif font-bold text-fluid-subheading` |
| Valor de métrica | serif | `font-serif font-black text-fluid-subheading` |
| Etiqueta de métrica | sans (heredada) | `text-xs sm:text-sm 2xl:text-base leading-snug` |
| Cuerpo editorial (Resumen/Problema/Rol/Solución/Galería) | sans (heredada) | `text-base 2xl:text-lg leading-relaxed` |
| Placeholder de galería "Captura próximamente" | mono | `font-mono text-xs 2xl:text-sm uppercase tracking-widest` |
| Botones de enlace de proyecto | sans (heredada) | `text-sm lg:text-base 2xl:text-lg font-semibold` |
| CTA final `h2` | serif | `font-serif font-bold text-xl md:text-2xl 2xl:text-3xl text-balance` |
| Botón CTA "Volver a proyectos" | sans (heredada) | `text-sm 2xl:text-base font-semibold` |

---

## Pricing (`components/pricing-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| `h2` "Servicios a medida" | serif | `font-serif font-black uppercase text-fluid-section leading-[0.9] tracking-tighter` |
| `p` subtítulo header | sans (heredada) | `text-fluid-body max-w-lg lg:max-w-xl leading-relaxed` (contiene la clase malformada `2xl mx-auto`) |
| Badge "Más popular" | sans (heredada) | `text-xs font-semibold` |
| `h3` Nombre del plan | serif | `font-serif font-bold text-xl` |
| Descripción del plan | sans (heredada) | `text-base leading-relaxed` |
| Eyebrow "desde" | sans (heredada) | `text-xs font-medium uppercase tracking-widest` |
| Precio (`$6,000`) | serif | `font-serif font-black text-5xl leading-none` (**sin tabular-nums**) |
| Periodo ("MXN · por proyecto") | sans (heredada) | `text-sm` |
| Lista de características | sans (heredada) | `text-base leading-relaxed` (+ iconos Check `size={15}`) |
| Botón CTA del plan | sans (heredada) | `text-sm font-semibold` |
| Proof line ("Respaldado por: …") | sans (heredada) | `text-xs leading-relaxed` |
| Nota final | sans (heredada) | `text-xs text-muted-foreground` |

---

## Footer (`components/footer.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Marca "Funko" | serif | `font-serif font-bold text-lg` |
| "Frontend Developer & UI Engineer" | sans (heredada) | `text-xs` |
| Enlace de correo | sans (heredada) | `text-sm` |
| Copyright | sans (heredada) | `text-xs text-center` |

---

## Products (`components/products-section.tsx`) — DESMONTADA

**Estado actual**: `ProductsSection` está **comentada** en `app/page.tsx` (línea 24) y NO se renderiza en la home. Se documenta por referencia futura. Sin tokens fluidos (quedaría por definir al reactivarla).

---

## Deuda conocida

1. Pricing subtítulo header: clase malformada `2xl mx-auto` (un "2xl" suelto sin selector `text-`) tal cual está en el código.
2. Pricing precio: `font-serif font-black text-5xl leading-none` sin `tabular-nums` (los dígitos pueden no alinear).
3. Geist Mono no se carga con `next/font`; cae a fallback local.

---

## Convención general

Patrón reutilizable que se repite en todas las secciones:

- **`font-serif` (Space Grotesk) = display / títulos.** Toda jerarquía de título usa Space Grotesk, casi siempre con `font-black`/`font-bold`.
- **`font-sans` (Inter) = body / UI.** Descripciones, párrafos, botones, listas, links, labels. Se hereda por defecto desde el `body`; solo el Navbar lo declara explícitamente.
- **`font-mono` (Geist Mono) = metadatos / técnico / etiquetas placeholder.** Índices numéricos de proyectos ("01"), placeholders de imágenes ("categoría", "Captura próximamente") y texto técnico en mayúsculas con tracking amplio.

### Regla rápida
> ¿Es un título? → `serif` (Space Grotesk) + token fluido según nivel. ¿Es body/UI/botón? → `sans` (Inter), `text-fluid-body` si es descripción principal. ¿Es metadato/etiqueta técnica? → `mono` (Geist Mono).