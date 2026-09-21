# Componentes Custom — Referencia de Uso

Este documento es la **fuente de verdad** de los componentes custom del portfolio: qué existe, qué props recibe, cuándo usarlo y qué NO usar. Cubre solo lo hecho a mano para la app (rama `refactor/component-structure`, worktree `M:\worktrees\maxgb23-portfolio\component-structure`) — NO documenta el catálogo genérico shadcn que vive en `components/ui/` (scaffolds sin consumidores de la app: calendar, chart, resizable, etc.); si no está aquí y no es `Button`, no es parte del sistema.

Complementa a `typography-families.md` (qué token usa cada elemento) y a `buttons.md` (sistema de botones en detalle). Los tres alimentan el futuro `design.md`.

---

## Sistema base: `Button` (`components/ui/button.tsx`)

El único componente UI base del sistema. API renovada (no shadcn original): `variant` (primary | outline | accent | inverted | white, default primary), `shape` (rounded | pill), `size` (sm | md | lg | compact), `fullWidth`, `glow` (shadow morado opt-in), `asChild` (Radix Slot) y `className` passthrough vía `cn()`.

**Regla de gobierno**: una prop solo existe si hay 2+ usos con intención de sistema; una excepción puntual se resuelve con `className` documentada. Detalle completo (hover por variante, shadow, excepciones cerradas como el "Volver" de GSAP) en `buttons.md`.

> **Cuándo usar**: cualquier acción clicable del portfolio. **Cuándo NO**: si necesitas algo que no sea un botón (link plano, tooltip, etc.).

---

## Infraestructura de scroll (Lenis + hooks)

### `SmoothScroll` (`components/smooth-scroll.tsx`)
- `"use client"`; única prop: `children: ReactNode`.
- Envuelve `{children}` en `app/layout.tsx` (línea 43). Inicializa **Lenis `1.3.18-dev.1`** solo en desktop (`window.innerWidth >= 768`); en mobile queda `null` y todo cae al scroll nativo.
- Config: `duration: 1`, `easing` expo-out (`Math.min(1, 1.001 - Math.pow(2, -10 * t))`), `smoothWheel: true`, `wheelMultiplier: 1`. Conecta `lenisInstance.on("scroll", ScrollTrigger.update)` + `gsap.ticker.lagSmoothing(0)` y monta un `LenisProvider` custom con la instancia.
- Monta `<ScrollRestorer />` dentro del `LenisProvider` (ver Hooks) — autoridad de scroll ante cambios de ruta.

### Hooks (`hooks/use-lenis.tsx`) — **la vía correcta para navegar por anclas**
- `useScrollToAnchor(navbarHeight)` → devuelve un handler que hace `lenis.scrollTo(y, { duration: 2 })` compensando el navbar (64px) y con fallback a `window.scrollTo({ top: y, behavior: "smooth" })` con el mismo offset si Lenis es null (mobile). Usado por hero (CTA "Ver Proyectos") y pricing (CTA del plan), siempre con `useScrollToAnchor(64)`. El navbar usa también `useScrollToTop()`.
- `saveHomeScroll(y)` / `takeHomeScroll()` → handoff home⇄detail: las cards y el CTA del panel destacado capturan la posición del grid al salir; el "Volver" la consume y `ScrollRestorer` la reaplica. Next restaura scroll nativamente, pero Lenis mantiene su propio valor interno y lo escribe cada frame — por eso el handoff es explícito.
- `ScrollRestorer` (montado por `SmoothScroll`) → en `/` restaura la posición capturada (y al entrar a un detalle fuerza top), esperando layout estable (pin-spacer del stacking) y con watchdog post-aplicación de ~1.2 s si el documento vuelve a crecer; fuerza `lenis.scrollTo(target, { immediate: true })`.
- **Cuándo usar**: cualquier scroll programático a una sección. **Cuándo NO**: `window.scrollTo`/`scrollIntoView` a pelo — se pierde la integración Lenis + offset de navbar.

### `ScrollProgress` (`components/scroll-progress.tsx`)
- Sin props. Barra fija de 2px (`z-[60]`, `bg-purple-accent`) con `scaleX` animado por GSAP ScrollTrigger (`scrub: 0.3`), GSAP cargado con `import()` dinámico.
- Se monta **por página** (no en layout): `app/page.tsx` línea 12 y `app/proyectos/[id]/page.tsx` línea 41.
- **Cuándo usar**: en cualquier ruta nueva con scroll largo, incluirla como primer hijo del `<main>`.

---

## Media queries de GSAP (gates de stacking y layout)

| Gate | Dónde | Efecto |
|------|-------|--------|
| `(min-width: 1024px) and (min-height: 768px) and (orientation: landscape)` | `lib/breakpoints.ts` (`FEATURED_STACK_GATE`) — consumido por `featured-projects.tsx` (`gsap.matchMedia`) y `use-lenis.tsx` (`ScrollRestorer.PIN_MEDIA`) | **Única fuente de verdad** del stacking/pin: si el pin está activo, TODOS los consumidores lo saben (GSAP lo pinea, ScrollRestorer espera el pin-spacer). El requisito de orientación se añadió porque en tablets grandes en portrait (iPad Pro 13, 1024×1366) el pin cubría todo el viewport y, al salir del stack, el espaciado hacia about/all-projects quedaba gigantesco (~2300px de spacer). Fuera del rango (mobile, pantallas bajas Y portrait) los paneles fluyen en normal-flow sin pin. Subió de `700px` a `768px` de alto para que la card de 2 columnas quepa en el viewport pineado. |
| `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` | `featured-project-panel.tsx` (`ContentWrapper`) | En pantallas grandes Y altas el gap heading↔card crece a `120px`; si no, `gap-12`. |
| `lg:[@media(max-height:800px)]:text-6xl` | `hero-section.tsx` | Fallback de alto del display del hero (recorta a 60px en viewports bajos); documentado en `typography-families.md`. |

`ScrollRestorer` importa el mismo `FEATURED_STACK_GATE` (nunca lo re-escribe) para saber si el pin-spacer es esperado y esperar a que exista antes de restaurar la posición.

---

## Ritmo vertical entre secciones (`lib/rhythm.ts` + `components/section-spacing.tsx`)

Los valores de ritmo viven **tokenizados** en `lib/rhythm.ts` (constantes tipadas con cadenas de clases Tailwind v4): `SECTION_GAP`, `FEATURED_GAP` y `FEATURED_GAP_LG`.

Inter-section spacing en una sola fuente: **96px mobile (`h-24`) · 128px ≥768px (`md:h-32`)**, componente `aria-hidden` entre secciones top-level.

**Audit de regresión**: `node scripts/section-spacing.mjs` (dev server en `:3001`) — falla con `exit 1` si cualquier gap gobernado por `SectionSpacing` se sale del contrato (±10px). Los pares con heading intermedio (`Projects → All projects`) usan sanity de mínimo (altura de heading variable); el gap post-pin landscape no se aserta (el pin es dueño de su altura).

> [!WARNING]
> **Estado WIP (referencia `352ab13`)**: la página condiciona los `SectionSpacing` por orientación. Con ese estado el audit reporta **8 desviaciones frente al contrato clásico** (Hero→About=0 en tablet portrait; About→Projects=0 en desktop/wide; Projects→All=183<224 en iPad Pro portrait) — desviaciones **aceptadas en vivo** por decisión del propietario (cada régimen resuelve su propio layout; la última variante ordenada gana). Pendiente: cerrar el contrato por orientación (backlog `rhythm/orientation-contract`) y sincronizar el audit con el nuevo contrato.

| Elemento | Valor | Dónde |
|----------|-------|-------|
| `SectionSpacing` | `SECTION_GAP` (`h-24` 96px / `md:h-32` 128px) — token de `lib/rhythm.ts` consumido por `components/section-spacing.tsx` | `app/page.tsx`: entre Hero, About, Projects, Pricing y Contact (también antes del Footer). Desde `352ab13` los tres primeros spacers van envueltos en **condicionales de orientación** (tabla abajo) |
| `FEATURED_GAP` | `gap-12` (48px) — token del gap heading↔card del stack featured | Consumido por `featured-project-panel.tsx` desde `748c17e` (className interpolado `${FEATURED_GAP} ${FEATURED_GAP_LG}`) |
| `FEATURED_GAP_LG` | `[@media(min-width:1280px)_and_(min-height:900px)]:gap-30` (120px) — variante del mismo gap en viewports altos | Ídem: consumido por `featured-project-panel.tsx` desde `748c17e` |
| **Excepción — Featured** | El stack de proyectos NO usa `SectionSpacing`: en landscape el pin de GSAP es dueño de su altura; el ritmo interno vive en `featured-project-panel.tsx` / `featured-projects.tsx`; el grid vive en `all-projects.tsx`. Fuera del gate (landscape de altura <768px) los paneles fluyen a **altura de contenido** — desde `352ab13` se eliminó `landscape:lg:min-h-screen` |
| **Excepción — Hero** | Única sección que conserva espaciado grande intencional: mantiene su hueco con el indicador "deslizar" para que About aparezca al hacer scroll — decisión de diseño, no un bug (`docs/features/hero-design.md`) |

**Condicionales WIP (`352ab13`)** — envuelven los `SectionSpacing` de la página para eliminar aire redundante por régimen (el componente queda `aria-hidden`; el wrapper condicional decide si se renderiza):

| Par | Clases del wrapper | Efecto |
|-----|--------------------|--------|
| Hero → About | `portrait:md:hidden` | En tablet portrait (≥md) el spacer se oculta: el hero full-viewport ya da el aire |
| About → Projects | `landscape:lg:hidden landscape:[@media(max-height:768px)]:block` | Oculto en landscape lg alto (deja el siguiente spacer); visible en landscape de altura ≤768px |
| Projects → AllProjects | `portrait:lg:hidden landscape:lg:hidden landscape:lg:[@media(max-height:767px)]:block` | Oculto en lg (cualquier orientación); visible solo en landscape corto ≤767px |

### Featured en lg portrait (2 cols sin pin) — ritmo interno

Fuera del gate landscape (portrait lg, ej. iPad Pro), los paneles fluyen en 2 columnas sin pin; estos valores definen su ritmo:

| Relación | Clase | Valor |
|----------|-------|-------|
| Título "Proyectos Destacados" → card 1 | overlay `mb-8` + `gap-12` del `panel-content` | **80px** portrait lg y landscape (desde `352ab13`; antes 112px portrait lg con `portrait:lg:mb-16`) |
| Card → card | `portrait:lg:mb-24` en el `article` | **96px** portrait lg · 0 landscape (el pin lo controla todo) |
| Última card → "Todos los Proyectos" | `SectionSpacing` a nivel de página entre `FeaturedProjects` y `AllProjects` (condicional WIP: oculto en lg salvo landscape de altura ≤767px) | `SECTION_GAP` 96/128px donde visible · tras el pin landscape el spacer queda oculto y manda el flujo del pin |

---

## Primitivas de motion (`components/motion-primitives.tsx`)

Motor: **framer-motion** (`^12.0.0`). Viewport compartido `{ once: true, amount: 0.15 }`.

| Export | Props | Uso real |
|--------|-------|----------|
| `FadeIn` | `children`, `delay?` (0), `className?`, resto `HTMLMotionProps<"div">` | Footer, FeaturedProjectPanel (`contentWrapper`), SectionHeading, ContactBanner |
| `FadeInStagger` | `children`, `className?`, `stagger?` (0.1), `delay?` (0.05) | Grid de proyectos |
| `FadeInItem` | `children`, `className?` | Cada card del grid (hijo de `FadeInStagger`) |
| `SlideIn` | `children`, `from?: "left" \| "right"`, `delay?` | **SIN consumidores** (muerto) |
| `ScaleIn` | `children`, `delay?` | **SIN consumidores** (muerto) |

**Cuándo usar**: `FadeIn` para entradas sueltas; `FadeInStagger` + `FadeInItem` para grids/listas escalonadas. **Cuándo NO**: no introducir `SlideIn`/`ScaleIn` nuevos hasta decidir su destino (hoy son código muerto); los paneles de stacking de FeaturedProjects usan GSAP, no estas primitivas.

Gotcha: `FadeIn` declara prop `as` en su interfaz pero NO la usa (siempre `motion.div`).

---

## Aurora (`components/animations/Aurora`)

- Fondo animado con **ogl + shaders GLSL** (WebGL). Props: `colorStops` (default `['#5227FF', '#7cff67', '#5227FF']`), `amplitude` (1.0), `blend` (0.5), `speed` (1.0).
- En el hero se usa con `colorStops={["#223068", "#000000", "#3b337a"]}` y **solo si `mounted && isDark`** (el hero observa la clase `.dark` del `<html>` con un MutationObserver).
- **Cuándo usar**: solo hero (pieza pesada WebGL). No replicar en más secciones sin evaluar rendimiento.

---

## Tema (`components/theme-provider.tsx` + `components/dark-mode-toggle.tsx`)

- `ThemeProvider`: wrapper fino de **next-themes** (`^0.4.6`), montado en `app/layout.tsx` con `attribute="class"`, `defaultTheme="dark"`, **`forcedTheme="dark"`** y `disableTransitionOnChange` → el portfolio es dark-only por decisión.
- `DarkModeToggle`: custom (NO next-themes — `localStorage` + `matchMedia`, togglea `.dark` en `<html>`). **NO está montado**: import e instancias comentados en `navbar.tsx`. Convive mal con `forcedTheme="dark"` — NO re-montarlo sin resolver ese conflicto.

---

## Shell estructural: `Section` (`components/section.tsx`)

Categoría: **estructurales**. Única fuente del patrón de contenedor de las secciones top-level: inset horizontal + contenedor interno de ancho máximo + markers de QA (`debug-l*`). Server-safe (sin directivas ni hooks); `ref` como prop (React 19). Las secciones de abajo lo consumen — NO escribir `px-6 md:px-12` + `max-w-7xl` a mano fuera del shell.

**Defaults**: outer `debug-l1 px-6 md:px-12` · inner `debug-l2 mx-auto max-w-7xl`.

| Prop | Tipo / default | Semántica |
|------|----------------|-----------|
| `as` | `"section" \| "div"` (default `"section"`) | Elemento renderizado; `"div"` para bloques wrapper (headings) |
| `ref` | `Ref<HTMLElement>` | Ref al elemento más externo (React 19 ref-as-prop) |
| `id` / `aria-label` / `aria-labelledby` | `string` | Identidad y relaciones ARIA, preservadas del markup original |
| `className` | `string` | Clases extra **appendeadas** al elemento externo (layout propio de la sección) |
| `insetClassName` | `string` | **REEMPLAZA** el inset default (`px-6 md:px-12`): p. ej. `px-6`, `px-6 md:px-8 lg:px-12`. Reemplazo intencional: un override no puede "quitar" `md:px-12` por append |
| `debug` | `"default" \| "inverted" \| "none"` (default `"default"`) | Ubicación de los markers QA: `default` = l1@outer/l2@inner; `inverted` = l2@outer/l1@inner (bloque "Todos los Proyectos"); `none` = sin markers automáticos (heading mobile del featured pin — desde `352ab13` añade `debug-l2` manual por `className` para QA) |
| `container` | `boolean` (default `true`) | `false` omite el contenedor interno `mx-auto max-w-7xl` (contenido full-bleed) |
| `innerId` | `string` | `id` del contenedor interno (p. ej. `#all-projects-content`, **contrato del snapshot QA** en `scripts/snapshot-check.mjs`) |
| `innerClassName` | `string` | Clases extra appendeadas al contenedor interno; los conflictos se resuelven con tailwind-merge (p. ej. `max-w-6xl` reemplaza el `max-w-7xl` default) |
| `children` | `ReactNode` | Contenido de la sección |

**Cuándo usar**: cualquier sección top-level con inset + ancho máximo. **Cuándo NO**: el pin `#proyectos` de FeaturedProjects (full-bleed intencional del GSAP pin), el hero (excepción documentada), ni contenedores internos de sub-componentes.

---

## Secciones custom (quién es quién)

| Componente | Archivo | Props | Cuándo usarlo |
|------------|---------|-------|---------------|
| `Section` | `components/section.tsx` | `as`, `ref`, `id`, `aria-label`, `aria-labelledby`, `className`, `insetClassName`, `debug`, `container`, `innerId`, `innerClassName` | **Estructural** (categoría: estructurales) — shell de contenedor de las secciones top-level; lo usan About, Featured (heading mobile), AllProjects, Pricing y Contact |
| `Navbar` | `components/navbar.tsx` | (sin props) | Navegación global; la única pieza con `Button` pill |
| `HeroSection` | `components/hero-section.tsx` | (sin props) | Hero de la home (Aurora + indicador de scroll inline) |
| `AboutSection` | `components/about-section.tsx` | (sin props) | Sección "Sobre Mí" (`#sobre-mi`), timeline GSAP |
| `FeaturedProjectPanel` | `components/featured-project-panel.tsx` | `project: FeaturedProject`, `children?`, `overlay?` | Panel apilado del caso de estudio; `overlay` = heading flotante del índice 0 |
| `ProjectCard` | `components/project-card.tsx` | `project: Project` (interfaz local: id, title, description, metric, image, imageAlt, category, tags?, links?, featured?) | Card del grid, hija de `FadeInItem` |
| `FeaturedProjects` | `components/featured-projects.tsx` | (sin props) | Stack destacado (`#proyectos`) con pin GSAP (gate landscape); sub-componente privado `SectionHeading` |
| `AllProjects` | `components/all-projects.tsx` | (sin props) | Heading "Todos los Proyectos" + grid responsive (`#all-projects`); dato `allProjects` local |
| `ProjectDetail` | `components/project-detail.tsx` | `project: Project` (tipo de `@/data/projects`) | Página de detalle (`app/proyectos/[id]`); sub-componentes privados `SectionTitle`, `StackChips`, `AnimatedMetric` |
| `PricingSection` | `components/pricing-section.tsx` | (sin props) | Pricing "Servicios a medida" |
| `Footer` | `components/footer.tsx` | (sin props) | Footer `#contacto`, usa `FadeIn` |
| `ProductsSection` | `components/products-section.tsx` | (sin props) | **DESMONTADA** — comentada en `app/page.tsx` línea 24; no usarla hasta reactivar |

> Los sub-componentes privados (module-private) no son importables desde fuera de su archivo; si una sección los necesita, se extraen como export público con su API documentada aquí.

---

## Checklist antes de añadir un componente custom

- [ ] ¿Ya existe uno que cubra el caso? (busca en la tabla anterior antes de crear)
- [ ] ¿Es un botón/acción? → usa `Button` del sistema, no clases ad-hoc (`buttons.md`)
- [ ] ¿Necesito mover el scroll o navegar por sección? → `useScrollToAnchor`/`useScrollToTop` de `hooks/use-lenis.tsx`
- [ ] ¿Tiene animación de entrada? → `FadeIn` / `FadeInStagger` + `FadeInItem` (framer-motion)
- [ ] ¿Es una animación de scroll/scrub? → GSAP + ScrollTrigger (pattern de ScrollProgress / stacking)
- [ ] ¿Tiene tipografía de título/display? → token fluido de `typography-families.md`
- [ ] ¿China como página larga? → incluir `ScrollProgress` en esa ruta

---

## Gotchas conocidas

| Pieza | Estado |
|-------|--------|
| `FadeIn.as` | Declarado en la interfaz, **no implementado** (siempre `motion.div`) |
| `SlideIn` / `ScaleIn` | Exportados sin consumidores — código muerto |
| `DarkModeToggle` | Custom, desmontado; conflictivo con `forcedTheme="dark"` |
| `ProductsSection` | Importada pero comentada en la home |
| `Aurora` | WebGL pesado + reacciona a `.dark` por MutationObserver (no next-themes) |

---

## Próximo paso

Este documento, junto con `typography-families.md` y `buttons.md`, es la base del futuro `docs/design/design.md` del proyecto.

---

> [!NOTE]
> Vercel Preview Deployment activado para la rama `feat/fluid-typo`.