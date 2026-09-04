# Tipografía por Sección — Referencia Real del Código

Este documento es la **fuente de verdad** de la tipografía del portfolio: qué familia, qué tamaños por breakpoint, qué peso y qué estilos usa CADA elemento de CADA sección, según el estado actual del código.

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
- `font-mono` referencia `'Geist Mono'` como cadena literal en el theme. **Geist Mono NO se carga con `next/font`** (solo se cargan Inter y Space Grotesk); depende de que esté disponible localmente o cae a `'Geist Mono Fallback'`.

---

## Jerarquía tipográfica global (escalera real)

| Nivel | Pieza | Tamaño máximo (2xl) | Familia / Peso |
|-------|-------|---------------------|----------------|
| 1 | Hero `h1` / About `h2` | `2xl:text-8xl` (96px) | serif / black |
| 2 | Títulos de sección large ("Proyectos Destacados", "Todos los Proyectos", "Servicios a medida") | `2xl:text-7xl` (72px) | serif / black |
| 3 | Featured panel `h2` (caso de estudio apilado) | `xl:text-6xl` (60px) — **no escala a 2xl a propósito** | serif / black |
| 4 | Card grid `h3` (título de proyecto) | `2xl:text-2xl` (24px) | serif / bold |
| 5 | Body / descripciones | `2xl:text-xl` (20px) | sans (heredada) |

> Decisión explícita: el título del **featured panel** se queda en `xl:text-6xl` y NO sube a `2xl:text-7xl` — debe permanecer un escalón por debajo de la etiqueta de su sección ("Proyectos Destacados"), que sí llega a 7xl. Ver `featured-project-panel.tsx`.

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

> El Navbar es la única sección que usa `font-sans` de forma **explícita** (además del fondo global del `body`).

---

## Hero (`components/hero-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Full Stack Developer" | sans (heredada) | `uppercase tracking-[0.2em] 2xl:tracking-widest font-medium text-[15px] sm:text-base lg:text-xl 2xl:text-2xl` |
| `h1` "Max González Ballesteros" | serif | `font-serif font-black uppercase text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl leading-[0.9] tracking-tighter` |
| Descripción | sans (heredada) | `text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed max-w-lg lg:max-w-[480px] 2xl:max-w-[625px]` |
| Botones CTA (Ver Proyectos / Descargar CV) | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Label "Stack Principal" | sans (heredada) | `text-xs 2xl:text-base uppercase tracking-widest font-semibold` |
| Indicador "Deslizar" | sans (heredada) | `text-xs 2xl:text-base tracking-widest uppercase` |

---

## About (`components/about-section.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Label "Conóceme" | sans (heredada) | `uppercase tracking-[0.2em] font-medium text-[15px] sm:text-base lg:text-xl 2xl:text-2xl` |
| `h2` "Sobre Mí" | serif | `font-serif font-black uppercase text-5xl sm:text-6xl lg:text-7xl 2xl:text-8xl leading-[0.9] tracking-tighter` |
| Descripción (2 párrafos) | sans (heredada) | `text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed max-w-lg` |

> "Sobre Mí" es el único `h2` que llega a `2xl:text-8xl` (mismo nivel que el hero) — es tratado como display de bienvenida, no como título de sección.

---

## Featured / Stacking (`components/featured-project-panel.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Índice numérico "01" | mono | `text-sm 2xl:text-lg font-mono tabular-nums font-bold` |
| Badge de categoría | sans (heredada) | `text-xs font-semibold` (pill purple) |
| `h2` Título del proyecto | serif | `font-serif font-black text-4xl md:text-5xl xl:text-6xl leading-[1.05] tracking-tight text-balance` — **sin 2xl** |
| Descripción | sans (heredada) | `text-sm sm:text-base lg:text-lg 2xl:text-xl max-w-xl 2xl:max-w-[600px]` |
| Métrica clave | sans (heredada) | `text-xs sm:text-sm font-semibold` (pill outline purple) |
| Botón CTA "Ver caso de estudio" | sans (heredada) | `text-sm font-semibold` |
| Badge flotante de índice | serif | `text-2xl font-black font-serif` (número) |
| Placeholder de imagen (categoría) | mono | `font-mono text-xs uppercase tracking-widest` |

---

## Grid de proyectos (`components/projects-section.tsx`)

### Títulos de sección

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| `h2` "Proyectos Destacados" (SectionHeading) | serif | `font-serif font-black uppercase text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl leading-[0.9] tracking-tighter` |
| `h2` "Todos los Proyectos" (ProjectsTransition) | serif | `font-serif font-black uppercase text-5xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[0.9] tracking-tighter` |

### ContactBanner (banda de contacto bajo el grid)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Badge "Disponible para proyectos" | sans (heredada) | `text-[11px] font-semibold` |
| `h3` "¿Trabajamos juntos?" | serif | `font-serif font-bold text-xl` |
| Texto | sans (heredada) | `text-sm leading-relaxed max-w-xl` |
| Botones (Escríbeme / GitHub / LinkedIn / copiar) | sans (heredada) | `text-sm font-semibold` |

---

## Card del grid (`components/project-card.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Placeholder de imagen (categoría) | mono | `font-mono text-xs 2xl:text-sm uppercase tracking-widest` |
| `h3` Título del proyecto | serif | `font-serif font-bold text-lg 2xl:text-2xl` |
| Descripción | sans (heredada) | `text-sm 2xl:text-lg leading-relaxed line-clamp-3` |
| Métrica | sans (heredada) | `text-[11px] 2xl:text-sm font-semibold` (pill purple) |
| Tags de stack (iconos) | — | Iconos: contenedor `w-8 h-8 2xl:w-12 2xl:h-12`, SVG `w-4 h-4 2xl:w-6 2xl:h-6`, fallback `text-[9px] 2xl:text-[10px]` |
| Footer "Caso de estudio" | sans (heredada) | `text-xs 2xl:text-base font-semibold` |

---

## Detalle de proyecto (`components/project-detail.tsx`)

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Botón flotante "Volver" | sans (heredada) | `text-sm 2xl:text-base font-semibold` |
| Badge de categoría (hero) | sans (heredada) | `text-xs 2xl:text-sm font-semibold` (pill purple) |
| `h1` Título del proyecto | serif | `font-serif font-black text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl leading-[1.02] tracking-tight text-balance` |
| `p` headline (hero) | sans (heredada) | `text-base md:text-xl 2xl:text-2xl leading-relaxed max-w-2xl` |
| Chips de stack (StackChips) | sans (heredada) | texto `text-sm 2xl:text-base`; iconos `w-6 h-6 2xl:w-7 2xl:h-7`, fallback `text-[9px] 2xl:text-[10px]` |
| `h2` Sección (SectionTitle) | serif | `font-serif font-bold text-2xl md:text-3xl 2xl:text-4xl` |
| Valor de métrica | serif | `font-serif font-black text-2xl md:text-3xl 2xl:text-4xl` |
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
| `h2` "Servicios a medida" | serif | `font-serif font-black uppercase text-5xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-[0.9] tracking-tighter` |
| `p` subtítulo header | sans (heredada) | `text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed max-w-lg lg:max-w-xl` |
| Badge "Más popular" | sans (heredada) | `text-xs font-semibold` |
| `h3` Nombre del plan | serif | `font-serif font-bold text-xl` |
| Descripción del plan | sans (heredada) | `text-sm leading-relaxed` |
| Eyebrow "desde" | sans (heredada) | `text-xs font-medium uppercase tracking-widest` |
| Precio (`$6,000`) | serif | `font-serif font-black text-5xl leading-none` (**sin tabular-nums**) |
| Periodo ("MXN · por proyecto") | sans (heredada) | `text-sm` |
| Lista de características | sans (heredada) | `text-sm leading-relaxed` (+ iconos Check `size={15}`) |
| Botón CTA del plan | sans (heredada) | `text-sm font-semibold` |
| Proof line ("Respaldado por: …") | sans (heredada) | `text-xs leading-relaxed` |
| Nota final | sans (heredada) | `text-xs text-muted-foreground` |

> Inconsistencia conocida: la línea del subtítulo header contiene `2xl mx-auto` (clase malformada, "2xl" suelto sin selector `text-`) tal cual está en el código.

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

**Estado actual**: `ProductsSection` está **comentada** en `app/page.tsx` (línea 24) y NO se renderiza en la home. Se documenta por referencia futura.

| Elemento | Familia | Clases (orden real) |
|----------|---------|---------------------|
| Eyebrow "Lo que construyo" | sans (heredada) | `text-xs uppercase tracking-[0.2em] font-medium` |
| `h2` "Productos y Herramientas" | serif | `font-serif font-black text-4xl md:text-5xl text-balance` |
| `p` descripción header | sans (heredada) | `text-base leading-relaxed max-w-lg` |
| Tag de producto | sans (heredada) | `text-xs font-medium` (pill) |
| `h3` Nombre del producto | serif | `font-serif font-bold text-xl` |
| Descripción del producto | sans (heredada) | `text-sm leading-relaxed` |
| Features (`<li>`) | sans (heredada) | `text-sm` (+ iconos Check `size={15}`) |
| Botón "Saber más" | sans (heredada) | `text-sm font-semibold` |

---

## Convención general

Patrón reutilizable que se repite en todas las secciones:

- **`font-serif` (Space Grotesk) = display / títulos.** Toda jerarquía de título (`h1`, `h2`, `h3`) — hero, secciones, tarjetas, detalle, pricing, footer — usa Space Grotesk, casi siempre con `font-black`/`font-bold`.
- **`font-sans` (Inter) = body / UI.** Descripciones, párrafos, botones, listas, links, labels. Se hereda por defecto desde el `body`; solo el Navbar lo declara explícitamente.
- **`font-mono` (Geist Mono) = metadatos / técnico / etiquetas placeholder.** Índices numéricos de proyectos ("01"), placeholders de imágenes ("categoría", "Captura próximamente") y texto técnico en mayúsculas con tracking amplio.

### Escalado en `2xl:` (1536px+)

Casi todas las piezas escalan una vez más en `2xl` para aprovechar pantallas grandes. Excepciones deliberadas:
- **Featured panel `h2`**: se queda en `xl:text-6xl` (un escalón bajo el título de su sección).
- **Products `h2`/`h3`**: no tienen `2xl` (sección desmontada; quedaría por definir al reactivarla).
- **Pricing precio / CTA / features**: no escalan en 2xl.

### Regla rápida
> ¿Es un título? → `serif` (Space Grotesk). ¿Es body/UI/botón? → `sans` (Inter). ¿Es metadato/etiqueta técnica? → `mono` (Geist Mono).