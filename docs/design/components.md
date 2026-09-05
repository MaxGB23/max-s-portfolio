# Componentes Custom — Referencia de Uso

Este documento es la **fuente de verdad** de los componentes custom del portfolio: qué existe, qué props recibe, cuándo usarlo y qué NO usar. Cubre solo lo hecho a mano para la app (rama `feat/fluid-typo`, worktree `M:\worktrees\maxgb23-portfolio\fluid-typo`) — NO documenta el catálogo genérico shadcn que vive en `components/ui/` (scaffolds sin consumidores de la app: calendar, chart, resizable, etc.); si no está aquí y no es `Button`, no es parte del sistema.

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

### Hooks (`hooks/use-lenis.tsx`) — **la vía correcta para navegar por anclas**
- `useScrollToAnchor(navbarHeight)` → devuelve un handler que hace `lenis.scrollTo(y, { duration: 2 })` compensando el navbar (64px) y con fallback a `scrollIntoView` si Lenis es null (mobile). Usado por hero (CTA "Ver Proyectos") y pricing (CTA del plan), siempre con `useScrollToAnchor(64)`. El navbar usa también `useScrollToTop()`.
- **Cuándo usar**: cualquier scroll programático a una sección. **Cuándo NO**: `window.scrollTo`/`scrollIntoView` a pelo — se pierde la integración Lenis + offset de navbar.

### `ScrollProgress` (`components/scroll-progress.tsx`)
- Sin props. Barra fija de 2px (`z-[60]`, `bg-purple-accent`) con `scaleX` animado por GSAP ScrollTrigger (`scrub: 0.3`), GSAP cargado con `import()` dinámico.
- Se monta **por página** (no en layout): `app/page.tsx` línea 12 y `app/proyectos/[id]/page.tsx` línea 41.
- **Cuándo usar**: en cualquier ruta nueva con scroll largo, incluirla como primer hijo del `<main>`.

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

**Cuándo usar**: `FadeIn` para entradas sueltas; `FadeInStagger` + `FadeInItem` para grids/listas escalonadas. **Cuándo NO**: no introducir `SlideIn`/`ScaleIn` nuevos hasta decidir su destino (hoy son código muerto); los paneles de stacking de ProjectsSection usan GSAP, no estas primitivas.

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

## Secciones custom (quién es quién)

| Componente | Archivo | Props | Cuándo usarlo |
|------------|---------|-------|---------------|
| `Navbar` | `components/navbar.tsx` | (sin props) | Navegación global; la única pieza con `Button` pill |
| `HeroSection` | `components/hero-section.tsx` | (sin props) | Hero de la home (Aurora + indicador de scroll inline) |
| `AboutSection` | `components/about-section.tsx` | (sin props) | Sección "Sobre Mí" (`#sobre-mi`), timeline GSAP |
| `FeaturedProjectPanel` | `components/featured-project-panel.tsx` | `project: FeaturedProject`, `children?`, `overlay?` | Panel apilado del caso de estudio; `overlay` = heading flotante del índice 0 |
| `ProjectCard` | `components/project-card.tsx` | `project: Project` (interfaz local: id, title, description, metric, image, imageAlt, category, tags?, links?, featured?) | Card del grid, hija de `FadeInItem` |
| `ProjectsSection` | `components/projects-section.tsx` | (sin props) | Grid + stacking GSAP + ContactBanner; sub-componentes privados `SectionHeading`, `ProjectsGrid`, `ProjectsTransition`, `ContactBanner` |
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