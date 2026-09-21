# README del Sistema de Diseño

> Índice e identidad del sistema de diseño del portfolio. Este documento es la puerta de entrada a `docs/design/`: resume la identidad, el origen de las decisiones y apunta a los documentos canónicos que son la fuente de verdad de cada área.
>
> **Fuente de verdad**: los documentos canónicos (`typography-families.md`, `components.md`, `buttons.md`, `pointer-gestures.md`) y el código real (`app/globals.css`, `app/layout.tsx`). Este README es un índice + declaración de identidad; si contradice a un documento canónico, el documento canónico gana.
>
> **Contexto técnico**: Next.js 16, Tailwind CSS v4 (tokens `@theme inline`), GSAP (ScrollTrigger), Framer Motion, Lenis. Stack: pnpm.

## 1. Identidad

Portfolio personal de desarrollador con un lienzo oscuro como voz de marca. Es dark-first por decisión: el modo claro existe y los tokens están definidos en ambos modos (y calibrados por contraste), pero la identidad es la superficie `oklch(0.11 0.005 270)` - un negro apenas teñido de violeta - con un único acento cromático: el **morado** (`--accent-purple`). La tipografía es la protagonista: Space Grotesk en display mayúsculo con tracking apretado lidera la página, Inter sostiene la lectura y Geist Mono firma los metadatos técnicos. El color y el movimiento son atmósfera escasa y con propósito: el glow morado en hovers y sombras, la aurora WebGL del hero como único fondo animado continuo, el scroll suavizado de Lenis y las entradas escalonadas - nada decorativo sin intención. Calma de tipo y ritmo controlado, chispa de luz morada.

## 2. Origen: qué tomamos de cada referencia

Las referencias son **inspiración, no canon**. Se extrajo un snapshot de cada una a `docs/design/ejemplos/` (Bugatti y Framer) y de ahí adoptamos conceptos que transformamos en algo propio. Los criterios de "no copiamos" son deliberados y están documentados aquí para no re-negociarlos.

### De Bugatti (calma, tipo como protagonista, monocromo)

| Concepto que tomamos | Cómo lo hacemos nuestro |
| --- | --- |
| La tipografía como protagonista absoluta, sin decoración que compita | Títulos Space Grotesk `font-black uppercase tracking-tighter` lideran el layout; el resto del sistema se subordina |
| Aire generoso entre secciones, densidad cómoda | Contrato de ritmo por orientación (`lib/rhythm.ts`): 96px mobile / 128px >=768px entre secciones; gap featured 48px / 120px en pantallas altas |
| Metadata en mayúsculas + tracking amplio | Nuestra firma mono: placeholders de imagen ("categoría", "Captura próximamente"), índices numéricos "01", todo `uppercase tracking-widest` |
| Lienzo monocromo casi negro donde el contenido vive sobre surface | Canvas `oklch(0.11 0.005 270)` + escalera de superficies neutras; la jerarquía se apoya en la escala acromática |
| La fotografía full-bleed como única "electricidad" de la página | Nuestra electricidad es el glow morado y la aurora, no fotografía; el lienzo oscuro ES el espacio en blanco |

**No copiamos de Bugatti**: sus tipografías (Bugatti Display / Text / Monospace - las nuestras son Space Grotesk, Inter y Geist Mono), su ausencia total de acento cromático (nosotros tenemos UN acento morado deliberado), ni sus métricas de espaciado ni su scale de etiquetas (las nuestras vienen del contrato propio y de Tailwind v4).

### De Framer (poster oscuro, spotlight escaso, un solo acento)

| Concepto que tomamos | Cómo lo hacemos nuestro |
| --- | --- |
| Lienzo oscuro tipo poster con una declaración por banda | Hero y secciones como "declaraciones" tipográficas sobre el canvas oscuro con aire arriba y abajo |
| Tracking negativo en display como firma | Nuestro Space Grotesk usa su propio tracking (`tracking-tighter` / `tracking-tight`, leading 0.9-1.05), NUNCA los valores verbatim de Framer (-5.5px, -4.25px, etc.) |
| Spotlight gradient cards como atmósfera escasa (1-2 por página larga) | Nuestro spotlight es la aurora del hero y el glow morado de footer/cards; los gradientes son CARDS, nunca el fondo de una sección completa |
| Jerarquía en oscuro por elevación de superficie (canvas -> surface-1 -> surface-2) | Escalera oklch propia: `background` (0.11) -> `card` (0.15) -> `secondary`/`muted` (0.2), todos con tinte violeta 270 y chroma 0.005 |
| La disciplina de UN solo acento cromático | El nuestro es morado: `--accent-purple` para glow, hovers, selección, pills y valores de métrica - jamás un segundo color (ni blue, ni magenta/violeta ajeno) |
| Inter como voz de body | Coincidencia deliberada: Inter es nuestro `font-sans`; el carácter del body lo damos nosotros con roles de color y medida `ch`, no con variantes OpenType espejadas |

**No copiamos de Framer**: GT Walsheim (display), los porcentajes de negative tracking, la familia de gradientes magenta/violeta/azul (el nuestro es morado puro con `colorStops` propias), ni su ausencia de modo claro como dogma (nosotros tenemos tokens light completos, pero el dark es la voz).

## 3. Principios

1. **Un solo acento cromático: morado.** Todo glow, hover, selección, pill y valor destacado deriva de `--accent-purple`. Nada de blue, magenta ni segundos acentos.
2. **Tipo-led.** La tipografía es la protagonista; el color y el movimiento son atmósfera escasa con propósito.
3. **Dos escalas, dos reglas.** Contenido editorial = tokens fluidos (`text-fluid-*`); UI = estática (`text-xs`/`sm`/`base`). Los botones nunca usan tokens fluidos.
4. **Jerarquía por tamaño y tracking, no por opacidad.** Muted puro (`muted-foreground`); las opacidades `/60` `/70` están eliminadas del sistema.
5. **El lienzo oscuro es el espacio en blanco.** Dark-first de decisión; el aire se logra con canvas + ritmo. El modo claro es token-completo pero no es la voz.
6. **Los gradientes son cards, no fondos de sección.** Spotlight escaso: aurora = hero, glow = footer/cards; 1-2 piezas atmosféricas por página larga.
7. **Movimiento con propósito y ritmo por contrato.** Todo motion responde a una intención (entrada, scroll, llegada, scroll suavizado) y el espaciado entre secciones cambia por régimen de orientación validado por scripts, no improvisado.

## 4. Tokens de color

**Fuente de verdad: `app/globals.css`.** Los valores de aquí son un espejo de los bloques `:root` (light) y `.dark` del archivo; si el CSS cambia, este documento queda desactualizado.

Paleta oklch (los neutros del dark llevan tinte violeta `270` con chroma `0.005`):

| Rol (clase) | Light | Dark | Uso |
| --- | --- | --- | --- |
| `background` | `oklch(1 0 0)` | `oklch(0.11 0.005 270)` | Fondo de página / canvas |
| `foreground` | `oklch(0.13 0 0)` | `oklch(0.96 0 0)` | Títulos y headings (aprox. 18:1 en dark) |
| `content` | `oklch(0.38 0 0)` | `oklch(0.75 0 0)` | Párrafos de lectura (aprox. 9.2:1 dark, 10:1 light) |
| `card` | `oklch(0.98 0 0)` | `oklch(0.15 0.005 270)` | Superficie de cards (nivel 1) |
| `secondary` / `muted` | `oklch(0.96 0 0)` | `oklch(0.2 0.005 270)` | Superficie elevada / fondos secundarios (nivel 2) |
| `muted-foreground` | `oklch(0.52 0 0)` | `oklch(0.62 0 0)` | Metadata: labels, eyebrows de UI, chips, footer (aprox. 5.6:1 dark) |
| `border` / `input` | `oklch(0.91 0 0)` | `oklch(0.25 0.005 270)` | Hairlines y bordes |
| `primary` / `primary-foreground` | `oklch(0.13 0 0)` / `oklch(1 0 0)` | `oklch(0.96 0 0)` / `oklch(0.11 0.005 270)` | Botón primary (sólido inverso sobre el canvas) |

**Acento morado (el único acento cromático):**

| Token | Light | Dark | Roles |
| --- | --- | --- | --- |
| `--accent-purple` / `--color-purple-accent` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | Glow (`shadow-purple-accent/60`), hover de outlines (`/5` + `/30`), pills de categoría/métrica, valores de métrica (`text-purple-accent`), ScrollProgress, glow de footer (`/10 blur`), ring de foco, wash de llegada a `#contacto` |
| `--accent-purple-light` | `oklch(0.92 0.08 270)` | `oklch(0.22 0.08 270)` | Superfici moradas claras (variante de apoyo) |
| `--accent` / `--ring` | `oklch(0.58 0.22 270)` | `oklch(0.62 0.22 270)` | El token genérico shadcn coincide con el morado - refuerza la regla de acento único |

**Semánticos y especiales**: `destructive` `oklch(0.577 0.245 27.325)` light / `oklch(0.396 0.141 25.723)` dark (sin uso activo hoy); `hero-text` para el primer plano del hero; `nav-bg` (`/0.85`) para la superficie translúcida del navbar; `--radius: 0.75rem` (formas del sistema: `rounded-xl` contextual, `rounded-full` píldora).

## 5. Tipografía

Detalle por elemento en `typography-families.md`; aquí el mapa del sistema.

| Clase | Familia | Origen | Propósito |
| --- | --- | --- | --- |
| `font-serif` | Space Grotesk | `--font-space-grotesk` (next/font) | Display / títulos (casi siempre `font-black`/`font-bold`, uppercase, tracking apretado) |
| `font-sans` | Inter | `--font-inter` (next/font) | Body / UI (heredada por defecto desde `<body>`) |
| `font-mono` | Geist Mono | Cadena literal en el theme (sin next/font) | Metadatos / técnico / placeholders, `uppercase tracking-widest` |

**Escala editorial fluida** (tokens `--text-fluid-*`; todos `clamp(min, rem + vw, max)` interpolando en la misma ventana 375 -> 1600px con tope en ~1600px; ratios <= 2.5x; zoom WCAG 1.4.4 seguro):

| Token | Fórmula | Rango px | Uso |
| --- | --- | --- | --- |
| `text-fluid-display` | `clamp(2.5rem, 1.88rem + 3.13vw, 5rem)` | 40 -> 80 | Hero `h1` (único, vw-puro) |
| `text-fluid-detail` | `clamp(2.25rem, 1.9rem + 1.47vw, 3.375rem)` | 36 -> 54 | Detail `h1` (título de proyecto) |
| `text-fluid-section` | `clamp(2rem, 1.72rem + 1.4vw, 3.25rem)` | 32 -> 52 | Headings de sección (About, "Proyectos Destacados", "Todos los Proyectos", "Servicios a medida") |
| `text-fluid-featured` | `clamp(1.75rem, 1.52rem + 1.15vw, 2.75rem)` | 28 -> 44 | Featured `h2` (escalón bajo las secciones, ratio aprox. 0.85) |
| `text-fluid-price` | `clamp(2rem, 1.8rem + 1vw, 2.625rem)` | 32 -> 42 | Precio en pricing (siempre por debajo de su sección) |
| `text-fluid-card` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 -> 24 | CTA card `h3`, nombre de plan |
| `text-fluid-metric` | `clamp(1.125rem, 1.01rem + 0.49vw, 1.5rem)` | 18 -> 24 | Numeral display de métricas (detail, font-black + accent) |
| `text-fluid-subheading` | `clamp(1.5rem, 1.27rem + 0.98vw, 2.25rem)` | 24 -> 36 | Detail SectionTitle |
| `text-fluid-body` / `card-body` | `clamp(1rem, 0.96rem + 0.16vw, 1.125rem)` | 16 -> 18 | Cuerpo de lectura (hero, about, featured, cards) |
| `text-fluid-eyebrow` | `clamp(0.9375rem, 0.86rem + 0.33vw, 1.1875rem)` | 15 -> 19 | Kicker de hero/about (rol, "Conóceme") |

**Escala UI estática** (no fluida): `text-xs`/`text-sm`/`text-base` fijos con micro-bumps de breakpoint (`sm:`/`2xl:`) - navbar, footer, TODOS los botones (`text-sm 2xl:text-base`), eyebrows de cards, chips, breadcrumbs, grafo de arquitectura (escalera 12/14/16).

**Reglas de cajón**:
- ¿Título? -> `serif` (Space Grotesk) + token fluido según nivel. ¿Body/UI/botón? -> `sans` (fluid si es lectura, estático si es UI). ¿Metadato/técnico? -> `mono` (Geist Mono).
- **Eyebrow = kicker** (15 -> 19px fluido) solo para el rol del hero y "Conóceme"; los eyebrows decorativos de UI son 12-16px estáticos. Jerarquía por tamaño + tracking, no por opacidad.
- **Régimen de altura del hero**: escalera de padding `pt-22 sm:pt-24 lg:[@media(min-height:700px)]:pt-34 2xl:pt-40` (88/96/136/160px); el título NUNCA se topa por altura (el fallback `@media(max-height:800px)` se eliminó 2026-09-20; los clamps custom ya evitan el desborde).
- **`cn()` dependencia**: `lib/utils.ts` registra `text-fluid-*` en `extendTailwindMerge`; sin ese registro, `cn("... text-fluid-card ...", "... text-foreground ...")` borra la clase fluid (colisión de grupo `text-*`). No eliminar al refactorizar.

## 6. Ritmo y layout

- **Contenedor**: shell único `Section` (`components/section.tsx`) - outer inset por sección + inner `mx-auto max-w-7xl` por defecto (`innerClassName` puede override, p. ej. `max-w-6xl`). NO escribir `px-6 md:px-12` + `max-w-*` a mano fuera del shell. (No existe `max-w-5xl` en secciones: el default del sistema es `max-w-7xl`.)
- **Inset horizontal por sección**: Hero/About `px-6 md:px-8 lg:px-12` - Featured/Detail `px-6 md:px-12 lg:px-20` - Navbar/Footer/Projects/Pricing `px-6`.
- **Medida del texto editorial**: por `ch`, no por la columna de la sección - body de about/featured `max-w-[62ch]`, headline de detail `max-w-2xl`, subtítulos `max-w-xl`/`lg:max-w-xl`, texto de banner `max-w-xl`.
- **Ritmo entre secciones** (`lib/rhythm.ts` + `PageSpacing`/`SectionSpacing`): 96px mobile (`h-24`) - 128px >=768px (`md:h-32`); 6 pares de página controlados por contrato de régimen (`PAGE_SPACER_CLASSES`, un par -> una cadena de variantes), con espejo QA en `scripts/rhythm-contract.mjs` y audit `scripts/section-spacing.mjs` (9 viewports, tolerancia +/-10px, excepciones declaradas en el contrato).
- **Contrato por orientación**: portrait vs landscape decide qué spacers se renderizan (p. ej. `portrait:md:hidden`, `landscape:lg:hidden ...`). El pin GSAP del stack featured es dueño de su altura dentro del gate `(min-width: 1024px) and (min-height: 768px) and (orientation: landscape)` (`FEATURED_STACK_GATE` en `lib/breakpoints.ts`); fuera de él los paneles fluyen con `mb-24` (96px) en los regímenes declarados.
- **Gap interno featured**: `FEATURED_GAP` 48px (`gap-12`) -> 120px (`[@media(min-width:1280px)_and_(min-height:900px)]:gap-30`) en pantallas grandes y altas.
- **Excepciones deliberadas**: hero (padding ladder + hueco con el indicador "Deslizar" - decisión de diseño, ver `docs/ideas-features/hero-design.md`), heading móvil del pin featured, y `last:mb-0` que espeja al spacer de página en 767px.

## 7. Componentes

Inventario completo, props y reglas de uso en `components.md`. Mapa rápido:

- **`Button`** (`components/ui/button.tsx`) - único componente UI base del sistema: `variant` (primary | outline | accent | white | inverted), `shape` (rounded | pill), `size` (sm | md | lg | compact), `fullWidth`, `glow` (shadow morado opt-in), `asChild`, `className` passthrough. Regla de gobierno: una prop existe solo con 2+ usos; excepciones puntuales vía `className` documentada. Detalle completo en `buttons.md`.
- **Estructurales**: `Section` (shell de contenedor con markers `debug-l*`), `PageSpacing` / `SectionSpacing` (ritmo por contrato), `Navbar`, `Footer`.
- **Secciones custom**: `HeroSection` (aurora + indicador de scroll), `AboutSection` (timeline GSAP), `FeaturedProjects` (stack con pin GSAP), `FeaturedProjectPanel`, `AllProjects` + `ProjectCard`, `ProjectDetail` (+ privados `SectionTitle`, `StackChips`, `AnimatedMetric`), `PricingSection`. `ProductsSection` está DESMONTADA (comentada en la home).
- **Infraestructura de scroll**: `SmoothScroll` (Lenis, solo desktop >=768px), hooks `useScrollToAnchor`/`useScrollToTop` (la vía correcta para anclas), handoff `saveHomeScroll`/`takeHomeScroll`, `ScrollRestorer`; `ScrollProgress` (barra 2px morada con GSAP, montada por página).
- **Motion**: primitivas framer-motion `FadeIn` / `FadeInStagger` + `FadeInItem` (viewport `{ once: true, amount: 0.15 }`; `delayEnter` espera a ~15% del viewport). GSAP para scrub/pin: stacking, ScrollProgress, timeline de about.
- **`Aurora`** (ogl + shaders GLSL): SOLO hero, solo en dark, pieza WebGL pesada - no replicar en más secciones sin evaluar rendimiento.
- **Gotchas**: `FadeIn.as` declarado pero no implementado; `SlideIn`/`ScaleIn` muertos (no introducir); `DarkModeToggle` desmontado y conflictivo con `forcedTheme="dark"`; `Aurora` reacciona a `.dark` por MutationObserver.

## 8. Interacción

- **Pointer / drag / select**: reglas obligatorias en `pointer-gestures.md` - `touch-action` siempre en swipes, `draggable={false}` + `select-none` + `onDragStart` preventDefault en visores, hit-test del rect pintado para "tap fuera = cerrar", `suppressClose` tras drag, scroll lock con `overflow` + `lenis?.stop()`. El lightbox del detail es el caso canónico (4 rondas de bugs QA resueltas con estas reglas).
- **Cue de llegada**: al navegar por ancla a `#contacto` (pricing CTA, navbar), `announceArrival` en `hooks/use-lenis.tsx` asigna la clase `arrive` - wash morado one-shot (`contact-arrive`, 1.5s) que identifica el destino como la respuesta al click, incluso con scroll delta pequeño; variante estática persistente bajo `prefers-reduced-motion`. La clase es la vía correcta porque `history.replaceState` con fragment no actualiza `:target`.

## 9. Do's and Don'ts

**Do**
- Un solo acento cromático: morado (`--accent-purple`). Todo glow, hover, selección y pill sale de él.
- Diseñar dark-first: el lienzo oscuro es la voz; el modo claro es token-completo pero no el objetivo estético.
- Títulos Space Grotesk uppercase con tracking apretado; body Inter; metadata Geist Mono `uppercase tracking-widest`.
- Contenido editorial con `text-fluid-*`; UI con estática; botones SIEMPRE `text-sm 2xl:text-base` (nunca fluidos).
- Ritmo por contrato (`PageSpacing` + `lib/rhythm.ts`); validar con `scripts/rhythm-contract.mjs` y `scripts/section-spacing.mjs`.
- Gradientes como cards escasas: aurora solo en hero, glow morado en footer/cards; 1-2 piezas atmosféricas por página larga.
- Hover por variante, constante en todo el sitio; shadow morado `sm purple/60` solo en outlines contextuales (regla de `buttons.md`).
- Jerarquía por tamaño y tracking, no por opacidad: `muted-foreground` puro. Excepciones deliberadas documentadas: `brightness-110` del eyebrow del hero sobre la aurora (único fondo animado continuo) y `brightness-125` de `featured-project-panel.tsx:105` sobre un acento.
- Tras tocar tokens en `app/globals.css`, reiniciar el dev server con `.next` purgado (Turbopack no hot-reloada `--text-fluid-*`).

**Don't**
- No introduzcas un segundo acento cromático (azul, verde, magenta).
- No fluidices botones ni objetos UI: su escala percibida la dicta el contenedor y el hit-area.
- No uses opacidad para jerarquía (`/60`, `/70`) ni `brightness-*` como hack de contraste (las dos excepciones citadas son las únicas).
- No apliques gradientes como fondo de sección completa.
- No copies tipografías ni gradientes de las referencias (ni las familias de Bugatti ni las de GT Walsheim, ni su tracking verbatim, ni la familia magenta/violeta/azul).
- No hardcodees colores: `text-white`, `bg-white/90` están prohibidos; todo color sale de tokens.
- No toques el `extendTailwindMerge` de `lib/utils.ts` (sin él se rompen los `text-fluid-*`).
- No re-montes `DarkModeToggle` (conflicto con `forcedTheme="dark"`) ni introduzcas `SlideIn`/`ScaleIn`.
- No repliques `Aurora` fuera del hero sin evaluar rendimiento.
- No reescribas el contrato de ritmo a mano: si un gap no cuadra, cambia `lib/rhythm.ts` y el espejo QA a la vez.

## 10. Índice de documentos

| Documento | Qué es |
| --- | --- |
| `README.md` (este) | Identidad + índice del sistema de diseño |
| `typography-families.md` | Fuente de verdad de tipografía: qué familia/token/tamaño usa CADA elemento de CADA sección, régimen de altura del hero, convención UI estática vs. contenido fluido, deuda |
| `buttons.md` | Sistema de botones v3: variantes, hovers por variante, formas, sombras moradas, inventario por sección, deuda hacia el componente base |
| `components.md` | Componentes custom (API, cuándo usar / cuándo NO), infraestructura de scroll y motion, gotchas, checklist de nuevos componentes |
| `pointer-gestures.md` | Reglas de interacciones pointer/drag/select con el lightbox como caso canónico (4 rondas de bugs QA) |
| `archive/` | Decisiones y planes superados, conservados por trazabilidad: `refactor-theme-plan.md`, `session-2026-09-09-typography-layout-decisions.md` (y `typography-system.md`, archivado/eliminado 2026-09-20; lo que documentaba está absorbido por `typography-families.md`) |
| `ejemplos/` | Snapshots extraídos de sitios reales como INSPIRACIÓN: `bugatti/DESIGN.md` (+ `tailwind-v4-theme.css`) y `framer/DESIGN.md`. NO son canon del proyecto; solo aportan los conceptos de la sección 2 |

## 11. Estado y deuda conocida

**En producción hoy**: dark-only (`forcedTheme="dark"`), sistema de botones v3 aprobado en vivo, tipografía fluida calibrada (ventana 375 -> 1600px, escalera superior recalibrada 2026-09-14/17), contrato de ritmo por orientación con audit de scripts, stacking featured con pin GSAP bajo gate, aurora hero, scroll Lenis, primitivas framer-motion, lightbox con reglas de pointer consolidadas.

**Deuda pendiente** (detalle en cada documento canónico):
- Botones (`buttons.md`): unificar Navbar Contacto `text-[15px]` al estándar; Products CTA `hover:bg-secondary` -> `/5 + /30`; decidir el `shadow-md` neutral de "Ver Proyectos"; unificar `transition-opacity` vs `transition-colors` en sólidos; la variante `accent` sigue reservada sin uso.
- Tipografía (`typography-families.md`): clase malformada `2xl mx-auto` en el subtítulo de pricing; precio sin `tabular-nums`; Geist Mono sin `next/font` (cae a fallback local); los cambios de `--text-fluid-*` no hot-reloadan con Turbopack (reiniciar con `.next` purgado y verificar con `scripts/type-scale.mjs`).
- Componentes (`components.md`): `FadeIn.as` sin implementar; `SlideIn`/`ScaleIn` muertos; `DarkModeToggle` desmontado; `ProductsSection` comentada; `Aurora` pesada (reactiva solo en dark).
- Tokens (`app/globals.css`): `--color-chart-1..5` se referencian en `@theme inline` sin definición visible en `:root`/`.dark` (deuda latente, sin consumidores conocidos).
- Convención UI estática: residuos por migrar (p. ej. el eyebrow "desde" de pricing podría alinearse a la norma estricta 12-16px).