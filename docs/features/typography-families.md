# Estrategia de Familias de Fuente por Sección

Este documento describe la **asignación real de familias tipográficas** por sección y por tipo de elemento, según el estado actual del código. Complementa a `typography-system.md` (que cubre los tamaños por breakpoint); aquí **no** se documentan tamaños, solo qué familia se usa en cada elemento.

---

## Las tres familias y su propósito

Definidas en `app/globals.css` (`@theme inline`) y configuradas en `app/layout.tsx`:

| Clase       | Familia                             | Variable / Origen              | Propósito                                    |
|-------------|-------------------------------------|--------------------------------|----------------------------------------------|
| `font-sans` | Inter                               | `--font-inter` (next/font)     | UI / body general, texto de lectura          |
| `font-serif`| Space Grotesk                       | `--font-space-grotesk` (next/font) | Titulares / display de alto impacto       |
| `font-mono` | `'Geist Mono'`                      | Hardcodeado en el theme        | Metadatos / etiquetas técnicas               |

Nota de configuración:
- El `<body>` aplica `font-sans` por defecto (`app/layout.tsx`), por lo que **todo texto sin clase de familia explícita hereda Inter**.
- `font-serif` se usa explícitamente (Space Grotesk) en todos los títulos de display.
- `font-mono` referencia `'Geist Mono'` como cadena literal en el theme. **Geist Mono NO se carga con `next/font`** (solo se cargan Inter y Space Grotesk); depende de que esté disponible localmente o cae a `'Geist Mono Fallback'`.

---

## Hero (`components/hero-section.tsx`)

| Elemento                     | Familia        | Clase / Nota                            |
|------------------------------|----------------|------------------------------------------|
| Label "Full Stack Developer" | `sans` (heredada) | Texto en mayúsculas, sin clase explícita |
| `h1` Título principal        | `serif`        | `font-serif font-black` (Space Grotesk)  |
| Descripción (`p`)            | `sans` (heredada) | `max-w-*` body                           |
| Botones CTA (Ver Proyectos / Descargar CV) | `sans` (heredada) | Botones redondeados llenos/outline  |
| Étiqueta "Stack Principal"   | `sans` (heredada) | Mayúsculas, tracking amplio              |
| Indicador de scroll          | `sans` (heredada) |                                        |

---

## About (`components/about-section.tsx`)

| Elemento                 | Familia        | Clase / Nota                        |
|--------------------------|----------------|-------------------------------------|
| Label "Conóceme"         | `sans` (heredada) | Mayúsculas, tracking amplio       |
| `h2` Título "Sobre Mí"   | `serif`        | `font-serif font-black`             |
| Párrafos de descripción  | `sans` (heredada) | Body                               |

---

## Featured / Stacking (`components/featured-project-panel.tsx`)

| Elemento                     | Familia        | Clase / Nota                         |
|------------------------------|----------------|--------------------------------------|
| Índice numérico "01"         | `mono`         | `font-mono tabular-nums font-bold`   |
| Badge de categoría           | `sans` (heredada) | Pill con fondo purple            |
| `h2` Título del proyecto     | `serif`        | `font-serif font-black`              |
| Descripción (`p`)            | `sans` (heredada) | Body                              |
| Métrica clave                | `sans` (heredada) | Pill outline purple              |
| Tags de stack (íconos)       | —              | Íconos, sin texto de familia         |
| Botón CTA "Ver caso de estudio" | `sans` (heredada) | Botón lleno                    |
| Placeholder de imagen (categoría) | `mono`  | `font-mono uppercase tracking-widest` |
| Badge flotante de índice     | `serif`        | `font-black font-serif` (número)     |

---

## Grid de proyectos (`components/projects-section.tsx`)

| Elemento                        | Familia        | Clase / Nota                       |
|---------------------------------|----------------|------------------------------------|
| `h2` "Proyectos Destacados"     | `serif`        | `font-serif font-black uppercase`  |
| `h2` "Todos los Proyectos"      | `serif`        | `font-serif font-black uppercase`  |
| ContactBanner: badge "Disponible para proyectos" | `sans` (heredada) | Pill        |
| ContactBanner: `h3` "¿Trabajamos juntos?" | `serif` | `font-serif font-bold`       |
| ContactBanner: texto             | `sans` (heredada) | Body                          |
| ContactBanner: botones           | `sans` (heredada) | Botones                        |
| Grid de tarjetas (usa `ProjectCard`) | —           | Ver sección Card                |

---

## Card (`components/project-card.tsx`)

| Elemento                | Familia        | Clase / Nota                              |
|-------------------------|----------------|-------------------------------------------|
| Placeholder de imagen (categoría) | `mono`  | `font-mono uppercase tracking-widest`     |
| `h3` Título del proyecto | `serif`      | `font-serif font-bold text-lg`           |
| Descripción (`p`)       | `sans` (heredada) | Body, `line-clamp-3`                   |
| Métrica                 | `sans` (heredada) | Pill con borde purple                  |
| Tags de stack (íconos)  | —              | Íconos, sin texto de familia             |
| Footer "Caso de estudio" | `sans` (heredada) | Enlace de texto                        |

---

## Detalle (`components/project-detail.tsx`)

| Elemento                         | Familia        | Clase / Nota                              |
|----------------------------------|----------------|-------------------------------------------|
| Botón flotante "Volver"          | `sans` (heredada) | Botón lleno                            |
| Badge de categoría (hero)        | `sans` (heredada) | Pill                                  |
| `h1` Título del proyecto         | `serif`        | `font-serif font-black`                  |
| `p` headline (hero)              | `sans` (heredada) | Body                                  |
| Chips de stack (StackChips)      | `sans` (heredada) | Texto de chips                        |
| `h2` Sección (Métricas, Resumen, etc.) | `serif` | `font-serif font-bold` (SectionTitle) |
| Valor de métrica                 | `serif`        | `font-serif font-black` en purple       |
| etiqueta de métrica              | `sans` (heredada) | Texto pequeño                         |
| Placeholder de galería "Captura próximamente" | `mono` | `font-mono uppercase tracking-widest` |
| CTA final `h2`                   | `serif`        | `font-serif font-bold`                  |
| Botón de enlace                | `sans` (heredada) | Botones                              |

---

## Navbar (`components/navbar.tsx`)

| Elemento                        | Familia        | Clase / Nota                           |
|---------------------------------|----------------|----------------------------------------|
| Indicador "Disponible para trabajo remoto" | `sans` | `font-sans font-medium` (Explícito) |
| Links de navegación             | `sans` (heredada) | Texto medium                         |
| Botón "Contacto" (desktop)      | `sans` (heredada) | Botón lleno                          |
| Menú móvil (links + Contacto)   | `sans` (heredada) |                                       |

> El Navbar es la única sección que usa `font-sans` de forma **explícita** (además del fondo global del `body`).

---

## Pricing (`components/pricing-section.tsx`)

| Elemento                   | Familia        | Clase / Nota                        |
|----------------------------|----------------|-------------------------------------|
| `h2` "Planes Simples"      | `serif`        | `font-serif font-black uppercase`   |
| `p` subtítulo              | `sans` (heredada) | Body                             |
| `h3` Nombre del plan       | `serif`        | `font-serif font-bold`              |
| Descripción del plan       | `sans` (heredada) | Body                             |
| Precio                     | `serif`        | `font-serif font-black` (número)    |
| Periodo del precio         | `sans` (heredada) | Texto pequeño                     |
| Lista de características    | `sans` (heredada) | Body, con íconos Check            |
| Botón CTA                  | `sans` (heredada) | Botón                            |
| Badge "Most Popular"       | `sans` (heredada) | Pill                             |
| Nota de pie de página      | `sans` (heredada) | Texto pequeño                    |

---

## Footer (`components/footer.tsx`)

| Elemento                 | Familia        | Clase / Nota                          |
|--------------------------|----------------|---------------------------------------|
| Marca "Funko"            | `serif`        | `font-serif font-bold`                |
| "Frontend Developer & UI Engineer" | `sans` (heredada) | Texto pequeño          |
| Enlace de correo         | `sans` (heredada) | Texto                              |
| Íconos sociales          | —              | Íconos, sin texto de familia          |
| Copyright                | `sans` (heredada) | Texto pequeño                     |

---

## Convención general

Patrón reutilizable que se repite en todas las secciones:

- **`font-serif` (Space Grotesk) = display / títulos.** Toda jerarquía de título (`h1`, `h2`, `h3`) — hero, secciones, tarjetas, detalle, pricing, footer — usa Space Grotesk, casi siempre con `font-black`/`font-bold` y (`uppercase` + `tracking-tighter`) en títulos de gran impacto.
- **`font-sans` (Inter) = body / UI.** Descripciones, párrafos, botones, listas, links, labels. Se hereda por defecto desde el `body`; solo el Navbar lo declara explícitamente.
- **`font-mono` (Geist Mono) = metadatos / técnico / etiquetas placeholder.** Índices numéricos de proyectos ("01"), placeholders de imágenes ("categoría", "Captura próximamente") y texto técnico en mayúsculas con tracking amplio.

### Regla rápida
> ¿Es un título? → `serif` (Space Grotesk). ¿Es body/UI/botón? → `sans` (Inter). ¿Es metadato/etiqueta técnica? → `mono` (Geist Mono).
