# Feature: A11y — roles, teclado y foco (a11y-roles-and-keyboard)

## Objective

Cinco work units de accesibilidad derivados de la auditoría en
`docs/issues/a11y-and-performance.md`, elegidas porque **no alteran el render ni el
comportamiento de quien usa mouse**. Un commit por work unit, para que un `git revert`
aislado sea el mecanismo de rollback.

## Problem

La auditoría detectó cinco defectos reales de accesibilidad. Ninguno es cosmético: son
cosas que un usuario de teclado o de lector de pantalla no puede sortear.

| # | Defecto | Dónde |
|---|---|---|
| A2 | El emoji 🖐 declara dos intenciones opuestas a la vez: decorativo (`aria-hidden` en el padre) e imagen con etiqueta (`role="img"` + `aria-label`) | `hero-section.tsx:170-187` |
| S2 | El título de cada panel destacado es `h2`, hermano del `h2` de la sección, cuando las otras tres rejillas usan `h3` | `featured-project-panel.tsx:75` |
| S3 | `aria-label` fijo en inglés, sin pasar por `t()`, contradiciendo la regla del proyecto | `footer.tsx:48` |
| A3 | El switcher Métricas/Topología no expone que es un conjunto mutuamente excluyente, ni cuál está activa (la única señal es el fondo oscuro) | `project-detail.tsx:491-515` |
| A4 | `aria-modal="true"` es una promesa incumplida: el contenido de fondo sigue enfocable, y al cerrar el foco se pierde | `project-detail.tsx:697-772` |

## Decisions (aprobadas por el usuario)

| # | Decisión | Detalle |
|---|----------|---------|
| D1 | A3 completo, no versión ligera | Se acepta el cambio de orden de tabulación (`roving tabindex` + flechas ←/→) a cambio del patrón canónico de ARIA. Justificación: el sitio no tiene cobertura de a11y testeada, y el patrón parcial deja el beneficio a medias |
| D2 | A4 focus trap completo | Atrapar foco mientras el lightbox está abierto **y** devolverlo al botón que lo abrió. El comportamiento con mouse queda intacto |
| D3 | Cero cambio de render y cero cambio de mouse como criterio duro | Cualquier work unit que falle eso sale de alcance, no se "ajusta" |
| D4 | A3 se implementa con atributos, no adoptando `ui/tabs.tsx` | Ese primitive de shadcn cambia el DOM y obligaría a reestilizar. Adoptarlo es exactamente el riesgo que D3 prohíbe |
| D5 | Un commit por work unit | Revertir es `git revert <sha>`, sin deshacer a mano un commit mezclado |
| D6 | WU6 (test manual de teclado) es work unit propio, no nota | No hay cobertura automatizada de a11y. El test es la única evidencia de que A3/A4 funcionan |

## Scope

- `components/hero-section.tsx` — A2
- `components/featured-project-panel.tsx` — S2
- `components/footer.tsx` + `data/translations.ts` — S3
- `components/project-detail.tsx` — A3, A4
- `docs/issues/a11y-and-performance.md` — marcar los items resueltos
- `odd/tasks/a11y-roles-and-keyboard.md` — este documento

## Out of scope

- **S1 + A1** (reestructurar `<main>` + skip-link) — **el único con riesgo visual real**: el navbar hereda `text-foreground` de `<main className="... text-foreground ...">` y perdería el color al salir. Requiere mover las clases al lugar correcto y verificar píxeles.
- **2.1** dividir `project-detail.tsx` — riesgo de regresión silenciosa: `gsap.context` resuelve `.detail-hero > *`, `.detail-section`, `.back-btn` y `.detail-gallery-item` por jerarquía DOM, no por árbol de React. Si un componente sale del `rootRef`, los selectores dejan de matchear y las animaciones **dejan de reproducirse sin error**. Valor cero para quien ve el sitio.
- **P5** quitar `images.unoptimized` — re-codifica imágenes; exige comparación visual lado a lado.
- **P1** Aurora — decisión del owner: no se toca.
- **Reduced motion** — decisión auditada en `docs/issues/reduced-motion.md`, con su propio gatillo de reevaluación.
- **SEO** — ver la sección correspondiente de la auditoría.

## Constraints

- **Ningún work unit puede alterar el render.** Para S2 esto ya está verificado: `app/globals.css` no tiene ni un selector de elemento para `h1`/`h2`/`h3`, y Tailwind preflight resetea headings a `inherit`. El estilo viene de clases explícitas en el elemento.
- **Ningún work unit puede alterar el comportamiento de mouse.** En A3, el click sigue yendo por `onClick` → `setViewMode`, y como `tabIndex` se declara según `viewMode`, el botón pulsado queda activo en el re-render siguiente. En A4, el click en backdrop y en imagen quedan intactos.
- A3: interceptar solo ←/→, y solo con el foco dentro del switcher. ↑/↓ no se tocan, así que el scroll vertical queda intacto. `aria-controls` exige un `id` en el panel: ese `div` va dentro de `<section>` (block), junto al header (block) — el apilado no cambia.
- A4: el handler de Tab va en el `div` del dialog, **nunca en `window`** (atraparía el Tab de toda la página mientras el lightbox está abierto). El `onKeyDown` de Escape que ya existe en `window` no se toca.
- A4: al abrir, el foco **debe entrar** al dialog (si no, el trap no engancha y `aria-modal` sigue mintiendo). El anillo de foco se maneja con `:focus-visible`, nunca con `outline: none`.
- Textos visibles y `aria-label` por `t()` en `data/translations.ts` (ES+EN).
- Un solo worktree: `feat/recede-fade`. **Preguntar antes de commitear.**

## Tasks

Todos completos. WU4b/c/d no estaban en el plan original: los destapó el testing
manual de teclado del usuario, no la auditoría.

- [x] T1 (WU1) `hero-section.tsx` — emoji 🖐: una sola intención. `6cedb2e`
- [x] T2 (WU2) `featured-project-panel.tsx:75` — `h2` → `h3`. `3f8191b`
- [x] T3 (WU3) `footer.tsx:48` — `aria-label` por `t()`. `9086820`
- [x] T4 (WU4) `project-detail.tsx` — roles de tab + `roving tabindex` + flechas. `50e8b30`
- [x] T5 (WU4b) `project-detail.tsx` — flechas ←/→ en el lightbox. `a5c675d`
- [x] T6 (WU4c) `project-detail.tsx` — `z-10` + breakpoint `sm:` → `nav:`. `70c6275`
- [x] T7 (WU4d) `project-detail.tsx` — `bg-black/40` bajo `xl` en las flechas. `22418f2`
- [x] T8 (WU5) `project-detail.tsx` — trap de foco + retorno al opener. `899783c`
- [x] T9 (WU6) Test manual de teclado, gate por work unit (ver abajo).

### Defectos que el testing manual destapó (no estaban en la auditoría)

La auditoría leyó código; estos tres solo aparecen mirando el comportamiento.
Por eso T9 no es una nota: es la razón de que los ocho work units anteriores
estén verificados uno por uno.

| ID | Defecto | Por qué la auditoría no lo vio | Fix |
|---|---|---|---|
| WU4b | El lightbox no tenía navegación por teclado: `onKeyDown` solo manejaba `Escape`. Solo se recorría con los botones ◀ ▶ (ocultos bajo `nav`) o swipe | El código parecía completo — `role="dialog"`, Escape, scroll-lock — pero faltaba una tecla. Un lector de usuario de teclado lo encuentra en un segundo, una auditoría de estática no | `ArrowLeft`/`ArrowRight` con wrap-around, guardadas por `realImages.length > 1` |
| WU4c | Los controles pintaban **debajo** de la imagen: el `<figure>` es `relative` y va después en el DOM, así que sin `z-index` el `z` document tapaba ~28px de cada flecha entre `nav` y ~1144px | Es un bug de **orden de pintado**, no de tamaño. La geometría daba la impresión de "no cabe" cuando la causa era el stacking context | `z-10` en X, ◀ y ▶ |
| WU4d | Con velo `bg-white/10`, los controles eran invisibles sobre capturas de interfaz clara — 3 de 11 por luminancia medida (caf/dashboard-light 243, autoshop/crud 221, caf/editar_profile 203). El "3 / 9" también: `text-white/80` sobre blanco | Necesita medir el contenido real. `bg-white/10` sobre una captura oscura se ve bien, y las capturas mayoritarias son oscuras — el caso raro se ve bien en pantalla y falla en la excepción | `bg-black/40` bajo `xl`, `xl:bg-white/10` desde `xl` (donde las flechas ya no tocan la imagen) |

### Verificación (T9)

No hay cobertura automatizada de a11y en el repo, así que cada work unit se
aprobó con teclado y mouse **antes** de commitear. El usuario ejecutó esta
ronda por work unit, no una sola al final:

- **Anillo de foco por Tab** — llega a la pestaña activa, no a las dos; sale del
  switcher con `Tab`; `←`/`→` mueven foco y selección
- **Foco entra al lightbox** — al abrir con `Enter`, el anillo queda en la X
- **Trap** — cinco vueltas de `Tab` ciclan X → ◀ → ▶ → X sin salir al fondo
- **Retorno de foco** — `Escape`, X y click en el fondo devuelven el foco a la
  imagen de galería (antes caía a `<body>`)
- **Sin anillo con mouse** — abrir y cerrar con click no muestra anillo
- **Caso de una imagen** (`funky-theme`) — sin flechas, sin contador, `Tab` no
  escapa
- **`document.activeElement.getAttribute('aria-label')`** → `"Cerrar visor"`, que
  es `section.projects.lightboxClose` (el botón de cerrar). El dialog lleva
  `"Visor de imagen"` = `lightboxViewer`; son claves distintas y el resultado
  confirma que el foco está en la X, no en el contenedor
- **Consola** — verificado que nunca devuelve `INPUT`/`TEXTAREA`, lo que
  confirmaría que `preventDefault` no agarró las flechas

## Acceptance criteria

1. El lector de pantalla anuncia el switcher como lista de pestañas y dice cuál está activa, sin depender del color de fondo.
2. Las flechas ←/→ mueven el foco y la selección entre las dos pestañas. `Tab` no queda atrapado en un bucle.
3. Con el lightbox abierto, cinco pulsaciones de `Tab` ciclan entre sus controles y **nunca** salen al contenido de fondo.
4. Al cerrar el lightbox, el foco vuelve al botón de la imagen que lo abrió.
5. Con mouse, click en las pestañas y en el lightbox se comportan exactamente como antes.
6. Ningún anillo de foco aparece como consecuencia de abrir o cerrar el lightbox con mouse.
7. El render no cambió: mismos colores, tamaños y ritmo en hero, panel destacado, footer y detail.
8. `pnpm typecheck` PASS. El build de producción también valida tipos desde que
   se retiró `ignoreBuildErrors` (ver *Applicable checks*).

## Applicable checks

- `pnpm typecheck` (antes `pnpm exec tsc --noEmit`) — **PASS (exit 0)** en los ocho
  work units. Es la verificación automatizada disponible. El script se agregó en
  el mismo commit que retiró `ignoreBuildErrors`, para que el chequeo de tipos sea
  un comando con nombre en vez de una invocación suelta.
- `pnpm lint` — **ya no existe.** El script `"lint": "eslint ."` estaba en
  `package.json` pero eslint no estaba en `devDependencies`, no había config y no
  estaba instalado: `pnpm lint` fallaba con "no se reconoce el comando". Se
  eliminó el script en vez de instalar eslint, que es alcance de tooling y no de
  esta auditoría. Si algún día se quiere un linter real, se reinstala con su
  config y su propio script.
- Comparación visual antes/después en `:3000` (hero, panel destacado, footer, detail).
- Test manual de teclado, gate por work unit. Ver *Verificación (T9)*.

## Route

ODD — directo, sin SDD. Cinco work units mecánicos y tres con lógica propia
(roles de tab, flechas del lightbox, trap de foco). Ninguno depende del otro;
cada uno se ejecutó, verificó y commiteó antes del siguiente.

Dos desviaciones de las decisiones originales, ambas porque el código forzó
el camino: `Home`/`End` se dejaron fuera del patrón de tabs (con dos vistas las
flechas ya recorren el grupo, y sumaban superficie de verificación en un momento
donde el teclado era lo más frágil), y el tratamiento de fondo de los controles
terminó siendo condicional por breakpoint en vez de uniforme — la X nunca toca
la imagen y las flechas sí, así que no comparten caso.

## Outcome

Los cinco work units aprobados quedaron commiteados y verificados por teclado y
mouse antes de pasar al siguiente. Tres defectos que la auditoría estática no
vio quedaron corregidos de paso (ver la tabla en *Tasks*).

Deuda que queda, sin tocar:

- **S1 + A1** — reestructurar `<main>` + skip-link. El navbar hereda
  `text-foreground` de `<main>`, así que requiere mover las clases y verificar
  píxeles. Único punto del documento con riesgo visual real.
- **Dividir `project-detail.tsx`** — riesgo de regresión silenciosa: `gsap.context`
  resuelve `.detail-hero > *`, `.detail-section`, `.back-btn` y
  `.detail-gallery-item` por jerarquía DOM, no por árbol de React. Si un
  componente sale del `rootRef`, los selectores dejan de matchear y las
  animaciones **dejan de reproducirse sin error**. Valor cero para quien ve el
  sitio: es higiene de código, no señal de contratación.
- **Imágenes** — `pnpm build` **PASS** tras retirar `ignoreBuildErrors`; el build
  pasó a reportar "Running TypeScript ..." en vez de "Skipping validation of
  types". No había errores de tipo ocultos: el flag era peso muerto.
- **`pnpm lint`** — el script existía pero eslint no estaba instalado ni
  configurado. Preexistente, no lo introduce este trabajo. Retirado en el mismo
  commit; el chequeo de tipos quedó con nombre (`pnpm typecheck`).

## Delivery strategy

`ask-on-risk` (default). Forecast: ~90 líneas de código cambiadas + documentación,
muy por debajo del presupuesto de 400. Rama única `feat/recede-fade`, sin PR por ahora.