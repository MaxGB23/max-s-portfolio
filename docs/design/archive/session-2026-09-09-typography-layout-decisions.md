# Draft — Decisiones de Tipografía y Layout (Sesión 2026-09-09)

> [!WARNING] **HISTÓRICO — ARCHIVADO (2026-09-20)**
> Este documento es un draft de decisión ya cerrada. La mayoría de sus valores concretos NO coinciden con el código actual (la escala fluida fue recalibrada después: `app/globals.css` es la verdad). Se conserva por su valor de razonamiento: el *porqué* de decisiones aún vigentes (eyebrow kicker, ventana unificada 375→1600, regla grid vs flex, <320 estructural). Para el estado real, ver **[typography-families.md](../typography-families.md)** y **[components.md](../components.md)**.

> **Estado**: DRAFT. Documento de trabajo para consolidar en la versión final de `typography-families.md` / `typography-system.md`. Rama `feat/fluid-typo` (worktree `M:\worktrees\maxgb23-portfolio\fluid-typo`).

---

## 1. Recalibración unificada de la escala fluida (APLICADA — commit `04d8ed5`)

### Problema

Cada token `clamp()` interpolaba en una ventana distinta y topaba en un ancho diferente:

| Token | Antes topaba en |
|-------|-----------------|
| eyebrow | 857px |
| card-body | 933px |
| body | 1120px |
| section | 1600px |
| featured | 1631px |

Consecuencia: la jerarquía relativa entre tokens se distorsionaba al crecer la resolución. En mobile los labels eran desproporcionados; en desktop la jerarquía se aplanaba.

### Solución aplicada

Todos los tokens interpolan en la **misma ventana 375 → 1600px** y topan exactamente en 1600px:

| Token | Fórmula | Rango px |
|-------|---------|----------|
| `text-fluid-section` | `clamp(2.25rem, 1.56rem + 2.94vw, 4.5rem)` | 36 → 72 |
| `text-fluid-featured` | `clamp(2rem, 1.39rem + 2.61vw, 4rem)` | 32 → 64 |
| `text-fluid-card` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 → 24 |
| `text-fluid-subheading` | `clamp(1.5rem, 1.27rem + 0.98vw, 2.25rem)` | 24 → 36 |
| `text-fluid-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 |
| `text-fluid-card-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 → 18 |
| `text-fluid-eyebrow` | `clamp(0.9375rem, 0.86rem + 0.33vw, 1.1875rem)` | 15 → 19 |

**Body reducido de 20px → 18px máximo** (práctica 2026: 16–18px).

### Justificación

- Base en rems + pendiente en vw cumplen WCAG 1.4.4 (zoom 200% seguro).
- Ningún ratio supera 2.5× (guía Hoverify / buenas prácticas fluid).
- La continuidad tipográfica **desde mobile** (375px) es una decisión de producto: el portfolio es una vitrina tipográfica y la fluidez es parte del feature, no un fallback. Se evaluó el patrón "fijo en mobile + crece desde 768px" (visto en otras landings) y se rechazó: rompe la coherencia de la escalera.
- Pantallas < 375px: los títulos quedan fijos en su mínimo (comportamiento clamp estándar), aceptable — el mínimo real de dispositivo es ~320px.

---

## 2. Eyebrow: de "label mínimo" a "kicker" (APLICADO — commit `04d8ed5`)

### Proceso de decisión con datos

| Iteración | Eyebrow | Problema detectado |
|-----------|---------|--------------------|
| original | 13 → 15px | Era caption: ratio label/h1 caía 36% → 21% en desktop |
| intento A | `= body` (16 → 18px) | Competía con la descripción; role y about_label quedaban con tamaño idéntico al texto de lectura |
| **final** | **15 → 19px (kicker)** | Cruza la curva del body en ~941px; +1px sobre body a 1600px |

### Decisión final

El eyebrow (role del hero, "Conóceme" del about) se trata como **kicker del título**, no como eyebrow decorativo de UI:

- mobile: −1px bajo el body (15 vs 16)
- sm–md: ≈ igual al body
- grandes: +1px SOBRE el body (19 vs 18 a 1600px)

**Presencia por tamaño, no solo por uppercase + tracking.** Es la declaración de identidad del hero ("Full Stack Developer"); dejó de ser el texto más pequeño de la sección.

> Los eyebrows puramente decorativos de UI (badges, "desde" en pricing) siguen la norma 12–16px en contextos pequeños. No todos los labels usan el token kicker.

### Medidas reales en mobile 375px (aprobadas)

| Elemento | Token | Tamaño | Rango práctica 2026 |
|----------|-------|--------|---------------------|
| role / label | `text-fluid-eyebrow` | 15px | 12–16px ✅ |
| descripción | `text-fluid-body` | 16px | 16–18px ✅ |
| h1 hero / h2 about | `text-fluid-section` | 36px | 28–40px ✅ |

### Nota: ancho del role > ancho del título

No es un problema de font-size: es uppercase + tracking. La palanca correcta es el tracking (`2xl:tracking-widest` lo estrecha), no reducir el tamaño.

---

## 3. Tope de línea y retratos: consistencia imagen/texto (APLICADO — sin commitear)

### Problema

Descripciones muy anchas vs imagen fija en px arbitrarios; retratos que "varían demasiado" entre resoluciones.

### Soluciones aplicadas

**Hero** (`components/hero-section.tsx`):
- Descripción: `maxWidth: titleWidth ? min(${titleWidth}px, 60ch) : undefined` — el ancho de la línea más ancha del `h1` mide la descripción, con tope de lectura de **60ch** (sweet spot investigación 2026: 58–60ch). Sin valores mágicos adicionales.
- Retrato: `aspect-8/9` + escalera de altura `h-[280px] sm:h-[330px] md:h-[300px] 2xl:h-[340px]`.

**About** (`components/about-section.tsx`):
- Descripción: `max-w-[58ch]`.
- Retrato: `aspect-11/9` + escalera de altura `md:h-[320px] lg:h-[380px] 2xl:h-[400px]`, ancho derivado del aspecto.

### Consistencia de alturas entre hero y about

| Viewport | Hero (h, 8:9) | About (h, 11:9 → w) |
|----------|---------------|----------------------|
| mobile | 280px | 300px → 367px |
| md 768 | 300px | 320px → 391px |
| lg 1024 | 300px | 380px → 464px |
| 2xl 1536 | 340px | 400px → 489px |

`max-w-full` como red de seguridad en ambos retratos: nunca desborde horizontal, incluso en viewports extremos.

### Lección de layout (importante)

El error intermedio fue poner `w-full` en la imagen dentro de un grid `md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]`: el ancho (y por tanto la altura vía aspect) pasaba a depender del ancho del viewport → variación del ~27% (335px → 426px de alto) entre 1024 y 1280px.

**Patrón correcto**: el grid modela la **proporción entre columnas**, pero la imagen conserva su **escala propia** (h fija por breakpoint + aspect-ratio para derivar el ancho). Mezclar grid (layout) + escalera propia (contenido) es la combinación correcta.

---

## 4. Grid vs Flex para columnas imagen+texto (APLICADO — decisión)

### Error detectado y corregido

| Intento | Resultado |
|---------|-----------|
| Grid `1fr : 1.15fr` + imagen `w-full` | Imagen variaba ~27% con el viewport |
| Grid + imagen `md:w-auto` + h fija + aspect | **Imagen desbordaba su pista** en md: el ancho derivado de la altura (391px a h 320) superaba la pista (~305px a 768px) → se encimaba sobre el texto |
| **Flex + `shrink-0` + escalera fija + gap** | ✅ El texto fluye a su lado, gap fijo real, sin encimado |

### Regla

- **¿Hay proporción que modelar entre columnas?** → grid (con contenido que pueda llenar su pista, ej. `w-full`).
- **¿Es contenido + accesorio con tamaño propio?** → flex (`shrink-0` en el accesorio).
- El hero NUNCA se convierte a grid: es contenido centrado con retrato accesorio, sin proporción que modelar. Convertirlo "por consistencia" añadía complejidad sin resolver nada.

---

## 5. Max-width de contenedores: aire exterior vs gap (EN DISCUSIÓN — ver §6)

### Hallazgo técnico

El **gap** entre imagen y texto es **fijo y discreto** (`gap-8 md:gap-12 lg:gap-20`, saltos por media query — mismo comportamiento en hero y about). Lo que crece con la resolución es el **espacio exterior** del bloque centrado (`justify-center`): al expandir el contenedor hasta su max-w, el conjunto centrado deja más aire a los lados.

En el about con `max-w-7xl` (1280px) el bloque (imagen + texto) no llenaba el ancho y el aire crecía a partir de ~1280px — visualmente "se estiraba".

### Fix aplicado al about (user, aprobado)

`max-w-7xl` → `max-w-6xl` (1152px): el contenedor deja de crecer a ~1248px de viewport (1152 + padding), el bloque queda centrado con márgenes estables, el texto se reparte en más renglones en vez de estirarse.

**Principio**: limitar el contenedor (`max-w-6xl`) es la solución estructural; añadir padding compensatorio (`xl:px-24`) era un parche — se eliminó.

### Inventario actual de max-w por sección

| Sección | max-w |
|---------|-------|
| Navbar (desktop) | 7xl |
| Hero | 7xl |
| About | **6xl** |
| Products (desmontada) | 6xl |
| Pricing | 6xl |
| Footer | 6xl |
| Featured panel | 7xl |
| Projects grid | 7xl |
| Project detail | 7xl |

---

## 6. DECISIÓN PENDIENTE (próxima sesión)

### Pregunta abierta

¿Cómo avanzar con los max-w de **hero y about**?

**Opción A**: Contenedor 7xl (sigue el formato del resto del proyecto) + hijo 6xl interno.
**Opción B**: 6xl únicamente (evitar el aire exterior; el hero centrado no necesita 7xl).

### Hechos para decidir

- El hero está centrado: su contenido real abarca ~5xl; con 7xl deja aire exterior antiestético.
- El about ya está en 6xl y el usuario lo prefiere así (más proporcional, texto en renglones).
- Featured y Projects usan 7xl y lo aprovechan (video/imagen + grid denso).
- Pricing usa 6xl.
- La desalineación hero (7xl) vs about (6xl) es visible al hacer scroll.

### Candidato recomendado

Hero a `max-w-6xl` para alinear con about y eliminar el aire exterior (el gap interno no cambia — es fijo). Pendiente de confirmación del usuario en la próxima sesión.

---

## 7. Caso extremo: viewports < 320px

- **160px NO es un dispositivo real**: el mínimo real es ~320px (280px en plegables).
- **No** se diseñan media queries para sub-320 — es ruido que nadie verá.
- La protección es estructural: `max-w-full` / `w-full` como tope de seguridad para que la imagen se reduzca en vez de desbordar, sin media queries dedicadas.

---

## 8. Pendientes de fondo (no bloqueantes)

- Worktree `fluid-typo` tiene hero + about **sin commitear** (escaleras, ch, max-w-6xl about).
- Rama 3 commits ahead de `origin` (04d8ed5, 4409cf5, dbe602c); push pendiente de pedido del usuario.
- No merge a `feat/detalle-proyectos` hasta aprobación visual completa.