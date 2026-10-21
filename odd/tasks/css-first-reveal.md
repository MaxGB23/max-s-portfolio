# Feature: Reveal CSS-first — entradas sin framer-motion y home visible sin JS

## Objective
Sacar las animaciones de entrada de la home de framer-motion a un primitivo `Reveal`
basado en IntersectionObserver + transición CSS de opacidad, de modo que el contenido
sea **visible por defecto** cuando el JS no corre. Incluye: gate CSS activado por un
script inline antes del primer paint, red de seguridad de 2s, tema oscuro estático en
el servidor (fuera next-themes), 12 estilos inline fuera de hero/about, y el navbar con
entrada fade-only en CSS más un deadband que evita que un temblor de dedo lo esconda.

## Problem
Hoy el estado `initial="hidden"` de framer-motion se hornea como `opacity:0` inline en
el HTML del servidor. Sin JS la home se ve vacía: navbar, hero, about, featured,
all-projects y footer arrancan invisibles. Además:

- Hero y about usan `visibility: hidden` inline en 12 nodos, así que sin JS ese
  contenido queda **fuera del árbol de accesibilidad** (no solo invisible).
- Sin JS el tema gana los tokens de `:root`: la página se ve **clara**, porque
  `forcedTheme="dark"` aplica la clase desde un script de next-themes.
- El RFC revisión 1 justificó esto con "los LLM y crawlers no ven la home", que es
  **falso**: el texto viaja en el HTML crudo dentro del propio div con `opacity:0`. Lo
  que falla es el render visual y el árbol a11y, no la presencia textual.
- El navbar esconde/muestra por dirección de scroll con `SCROLL_THRESHOLD = 8` y
  `lastY` que **solo se actualiza al cruzar el umbral**: los deltas de jitter se
  acumulan y 3 temblores de 3px esconden el navbar.

Contexto completo: `docs/rfcs/css-first-reveal.md` (revisión 2).

## Why
Un portfolio existe para ser leído y contactado. Una página en blanco ante un fallo de
JS (bloqueador, proxy corporativo, timeout de red) es un fallo mudo, y 12 nodos fuera
del árbol a11y es un defecto objetivo. El rendimiento del tick de ~58ms en AllProjects
**no** justifica nada por sí solo: es 1 long task, una vez por visita fría. El Reveal es
comparable en tamaño a lo que sustituye, elimina 4 primitivas y una dependencia, y sigue
haciendo exactamente la misma animación.

## Scope

**IN (14 archivos + 3 docs)**

| Archivo | Cambio |
|---|---|
| `app/layout.tsx` | script inline `beforeInteractive` (gate + red de seguridad); `className="dark"`; quitar `ThemeProvider` |
| `app/globals.css` | CSS del gate; keyframe `nav-arrive` |
| `components/reveal.tsx` | nuevo: primitivo `Reveal` (IO compartido + atributo) |
| `components/theme-provider.tsx` | borrar |
| `components/motion-primitives.tsx` | borrar (`FadeIn`, `FadeInStagger`, `FadeInItem`, `FadeInItemFade`) |
| `components/all-projects.tsx` | 2 `FadeIn` -> `Reveal` |
| `components/featured-projects.tsx` | 1 `FadeIn` (heading) -> `Reveal` |
| `components/footer.tsx` | 2 `FadeIn` -> `Reveal` |
| `components/hero-section.tsx` | quitar 8 `style` inline |
| `components/about-section.tsx` | quitar 4 `style` inline |
| `components/navbar.tsx` | `initial={false}`, fuera `opacity` del animate/transition, clase `nav-arrive`, deadband 4px, umbral 14 |
| `package.json` + `pnpm-lock.yaml` | quitar `next-themes` |
| `docs/rfcs/css-first-reveal.md` | STATUS a implementado al cerrar |
| `docs/issues/all-projects-entry-jank.md` | §6 reescrito: el argumento del heading y el número de nodos |
| `docs/design/section-animations.md` | canon sincronizado (sin acentos) |
| `docs/design/components.md` | canon sincronizado: seccion 5 (Reveal), seccion 7 (tema), gotchas, deuda 13.2 |
| `docs/design/buttons.md` + `docs/design/iteration-guide.md` | menciones de `FadeIn` al dia |

**OUT (explícito)**
- NO migrar `AnimatePresence` del menú mobile ni el hide/show por scroll del navbar a CSS.
- NO tocar los timelines GSAP: solo el estado inicial (inline -> gate) y el early return
  con reduced-motion.
- NO tocar `pricing-section.tsx` ni `contact-section.tsx`: su estado inicial lo pone GSAP
  en runtime, no está inline, y sin JS ya se ven.
- NO tocar los reveals de `project-detail.tsx` (tabs del detalle): otra superficie, otra
  work unit si algún día se quiere.
- NO usar `animation-timeline: view()`.
- NO añadir `<noscript>`, skeletons ni blur-up.
- NO tocar `ScrollProgress`, el overlay `layout-debug` ni `data/projects.ts`.

## Constraints
- Sintaxis ASCII estándar; sin caracteres Unicode que sustituyan operadores.
- Cero cambio visual con JS activo: duración 0.55s (heading/grid/footer), easing
  `cubic-bezier(0.22, 1, 0.36, 1)`, `rootMargin` de -15% abajo cuando aplica,
  `earlyOnMobile` conservado (grid antes que título en mobile, delay 0.15s).
- `data-reveal-item` debe renderizarse en el **markup del servidor**, nunca añadirse en
  un efecto (provocaría flash visible -> oculto -> visible).
- La red de seguridad vive en el **mismo script inline** que el gate: si viviera en el
  bundle, moriría en el fallo que debe cubrir.
- El script va como `<script>` inline crudo en el `<body>`, **nunca** `next/script` con
  `strategy="beforeInteractive"`: verificado en el HTML compilado, un inline
  `beforeInteractive` se serializa en `self.__next_s` y lo ejecuta el chunk `async`
  `app-bootstrap`, que puede llegar después del primer paint y producir el flash
  visible -> oculto. Inline en el body corre durante el parseo, antes de que exista
  cualquier nodo de contenido.
- El gate falla **abierto**: si el script no corre (CSP, error), el contenido se ve.
- Verificación del agente: `pnpm typecheck`, `pnpm build`, curl del HTML de producción
  local y grep del CSS compilado. El pase visual y las 4 pasadas de perfil son del usuario.
- Un commit por work unit. Nunca commitear sin permiso explícito del usuario.

## Decisiones (cerradas con el usuario)
1. Gate por script inline antes del primer paint + red de seguridad de 2s en el mismo
   bloque. Sin `<noscript>` (redundante: si el script no corre, el gate nunca se activa).
2. Migrar los 5 nodos `FadeIn` y borrar `motion-primitives.tsx` completo.
3. Navbar: entrada **fade-only** en CSS. El `-24` era la entrada decorativa heredada del
   `useGsapAnimation` original (commit `ab90565`), no una protección contra jitter; el
   jitter se arregla con deadband de 4px por evento + umbral 14.
4. `next-themes` se elimina: `forcedTheme="dark"` sin toggle, solo inyecta un script
   para poner una clase.
5. El experimento de 5 minutos deja de ser gate de la migración (la migración es
   necesaria para el baseline); solo decide si se **afirma** mejora de rendimiento.
6. Los vehículos WU1..WU4 se ejecutan en la rama `feat/css-first-reveal`, worktree
   `M:\worktrees\maxgb23-portfolio\css-first-reveal`. Nada toca `main` hasta el merge.
7. **Las animaciones de entrada corren siempre, también con `prefers-reduced-motion`.**
   Decisión del usuario: la preferencia viene activada por defecto en bastantes equipos
   Windows por rendimiento (no por vestibular) y matar la entrada empobrece la página sin
   ganar nada. Frontera escrita en el canon (`docs/design/section-animations.md`): fades y
   desplazamientos <= 24px sí; parallax, zoom, giros o scroll-jacking tendrían que
   respetar la preferencia. Efecto: el gate no consulta la preferencia y se cae el
   early-return de GSAP que iba en WU3.
8. **La transicion del fade vive en la clase `reveal-fade`, no en el estado `shown`.**
   Hero y about también llevan `data-reveal-item` (para que el gate los oculte antes del
   primer paint), pero su opacidad la escribe GSAP frame a frame. Con la transición en
   `[data-reveal-item="shown"]`, la red de seguridad de 2s caería en mitad del timeline de
   hero y empezaría a amortiguar cada escritura de GSAP. Solo `components/reveal.tsx`
   renderiza la clase.

## Diseño del primitivo
`components/reveal.tsx`
- IntersectionObserver **compartido** por perfil (`rootMargin` + `threshold`), no uno por
  nodo. Perfiles: default (threshold 0.15, sin margen), `delayEnter` (0.15 + margen
  -15%), `earlyOnMobile` en mobile (threshold 0 + margen -15%).
- Al intersectar: `el.dataset.revealItem = 'shown'` + `unobserve`. Sin estado de React,
  sin re-render, sin loop de animación.
- `--reveal-delay` se escribe en el efecto (`0.15s` extra cuando `earlyOnMobile` corre en
  mobile), no en el render: así no hay estado ni mismatch de hidratación.
- Si no hay `IntersectionObserver`: marca `shown` de inmediato.
- No consulta `prefers-reduced-motion` (decisión 7).

## Tasks
- [x] T1 `app/globals.css` + `components/reveal.tsx` — CSS del gate y primitivo Reveal.
- [x] T2 `app/layout.tsx` + `components/theme-provider.tsx` + `package.json` — script
      inline, `class="dark"`, fuera ThemeProvider, fuera next-themes.
- [x] T3 Verificar WU1 (typecheck + build + curl) y commit de work unit.
- [x] T4 `all-projects.tsx` + `featured-projects.tsx` + `footer.tsx` +
      `motion-primitives.tsx` — migrar 5 nodos y borrar el módulo.
- [x] T5 Verificar WU2 y commit de work unit.
- [x] T6 `hero-section.tsx` + `about-section.tsx` — fuera los 12 estilos inline y
      `data-reveal-item`.
- [x] T7 Verificar WU3 y commit de work unit.
- [x] T8 `navbar.tsx` + `globals.css` — `initial={false}`, keyframe fade-only, deadband
      y umbral.
- [x] T9 Verificar WU4 y commit de work unit.
- [x] T10 Docs + medición — §6 del doc de jank, canon `section-animations.md`,
      canon `components.md` (+ botones e iteration-guide), STATUS del RFC, y
      registrar la medición del usuario si la hay (no la hay todavía).
- [x] T11 Correcciones del primer testeo en vivo:
      - [x] Red de seguridad acotada: el bundle la cancela (`window.__revealNet`).
      - [x] Featured sin JS: `featured-one-slide` + regla del gate.
      - [x] Hero sin JS: techo estático `md:max-w-[60ch]` en la descripción.
- [x] T12 Verificar y commitear las correcciones (permiso dado y ejecutado:
      `6b55773` correcciones del reveal y `592382c` el Volver del detalle).
- [x] T14 Cierre documental posterior a los commits (2026-10-19):
      - [x] `docs`: registro de la segunda ronda de testeo y sincronía de lo que
            invalidó (RFC, `reduced-motion.md`, `a11y-and-performance.md`,
            `section-animations.md`, dos tareas ODD con `FadeIn` muerto).
      - [x] `docs`: el canon del featured describía un pin GSAP retirado
            (`FEATURED_STACK_GATE`, `PIN_MEDIA`, watchdog del pin-spacer) y el
            README vendía framer-motion como primitiva de entrada: corregido.
- [x] T15 Medición acotada de la entrada a All Projects (2026-10-20): 3 pasadas
      frías + 3 en caliente, CPU 4x, ventana `[entry, entry+1500]`; 0 long
      tasks. El tirón percibido no es bloqueo de JS en el hilo principal.
      Registrado en `docs/issues/all-projects-entry-jank.md` §6.1. No se afirma
      mejora.
      - [x] (2026-10-20, después del cierre) Causa real: `images.unoptimized:
            true` servía los originales (hasta 4000x2800) y el costo estaba en
            la GPU, no en el main thread. Registrado en §6.2 del mismo issue
            doc. Este track no fue el fix de rendimiento.
- [x] T13 Segunda ronda de testeo (detalle de proyecto sin JS): el botón Volver
      pasa a `<a href="/">` real dentro de `Button asChild` (`onClick` con
      `preventDefault()` igual que antes) porque la página no renderiza navbar y
      era el único camino de vuelta dentro del sitio. Tabs y galería NO se
      tocan: sin JS quedan sin alcanzar, y se declaran como deuda ACEPTADA en
      `components.md` §13.7 (reimplementarlas con `:target`/radios CSS o como
      página aparte queda descartado: duplicaría la fuente de verdad del estado
      activo y arriesga la experiencia con JS, que es la que importa). Criterio
      del usuario: sin sobreingeniería, navegar sin JS es deliberado y rarísimo.

## Acceptance criteria
- `grep FadeIn` en `components/` = 0 resultados; `motion-primitives.tsx` no existe.
- No queda ningún `style="opacity:0"` ni `visibility:hidden` inline en hero, about,
  navbar, all-projects, featured ni footer del HTML servido.
- El HTML servido trae `class="dark"` en `<html>` y **no** trae el script de next-themes.
- El script del gate aparece en el HTML servido, inline, dentro del `<body>` y antes de
  `<main>`.
- `data-reveal-item` está presente en el HTML del servidor en los 5 nodos migrados.
- Sin JS: navbar, hero, about, featured, all-projects y footer visibles, en oscuro.
- Con JS: la coreografía es indistinguible de `main` (desktop y mobile).
- Un temblor de dedo de <4px por evento no esconde el navbar.
- `pnpm typecheck` exit 0 y `pnpm build` exit 0.
- `git diff --stat` limitado al scope de este doc.

## Applicable checks
- `pnpm typecheck` (exit 0)
- `pnpm build` (exit 0)
- `pnpm start` en puerto libre + `curl` del HTML: `class="dark"`, script del gate en
  `<head>`, ausencia de `opacity:0` inline de entrada, ausencia de next-themes
- `grep` del CSS compilado buscando las reglas del gate
- Pase visual del usuario (desktop + mobile, con y sin JS)

## Route
- Delegated direct (1 writer) — 14 archivos, 6 con contenido nuevo; Writer trigger.
- Sin subagentes: el trabajo es secuencial y cada WU depende del estado de la anterior.

## Delivery strategy
- 4 work units en `feat/css-first-reveal`, un commit por WU, commits en inglés
  (conventional commits). Sin PR hasta que el usuario valide en vivo.
- Orden obligatorio: WU1 (infra, inerte) -> WU2 (entradas framer) -> WU3 (hero/about) ->
  WU4 (navbar). WU1 es inerte a propósito: sin `data-reveal-item` en ningún nodo, el gate
  no oculta nada, así que un error revierte un solo commit.
- Forecast: ~120 líneas netas (borra más de lo que añade: 4 primitivas y una dependencia
  fuera).
