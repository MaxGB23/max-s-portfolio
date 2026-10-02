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

- [ ] T1 (WU1) `hero-section.tsx` — emoji 🖐: una sola intención.
- [ ] T2 (WU2) `featured-project-panel.tsx:75` — `h2` → `h3`.
- [ ] T3 (WU3) `footer.tsx:48` + `data/translations.ts` — `aria-label` por `t()`.
- [ ] T4 (WU4) `project-detail.tsx:490-527` — `role="tablist"` / `role="tab"` / `aria-selected` / `aria-controls` + panel con `id` y `role="tabpanel"` + `roving tabindex` y flechas ←/→.
- [ ] T5 (WU5) `project-detail.tsx:697-772` — trap de foco dentro del dialog + foco al opener en `useEffect` de cierre.
- [ ] T6 (WU6) Test manual de teclado. Evidencia de que A3 y A4 funcionan; no hay cobertura automatizada.

## Acceptance criteria

1. El lector de pantalla anuncia el switcher como lista de pestañas y dice cuál está activa, sin depender del color de fondo.
2. Las flechas ←/→ mueven el foco y la selección entre las dos pestañas. `Tab` no queda atrapado en un bucle.
3. Con el lightbox abierto, cinco pulsaciones de `Tab` ciclan entre sus controles y **nunca** salen al contenido de fondo.
4. Al cerrar el lightbox, el foco vuelve al botón de la imagen que lo abrió.
5. Con mouse, click en las pestañas y en el lightbox se comportan exactamente como antes.
6. Ningún anillo de foco aparece como consecuencia de abrir o cerrar el lightbox con mouse.
7. El render no cambió: mismos colores, tamaños y ritmo en hero, panel destacado, footer y detail.
8. `pnpm exec tsc --noEmit` PASS. No hay check de lint disponible en el repo (ver *Applicable checks*).

## Applicable checks

- `pnpm exec tsc --noEmit` — **PASS** (exit 0) en WU1. Es la verificación disponible.
- `pnpm lint` — **NO DISPONIBLE (falla en la base, preexistente).** El script
  `"lint": "eslint ."` existe en `package.json`, pero `eslint` no está en
  `devDependencies`, no hay archivo de configuración en el repo y no está
  instalado en `node_modules`. El script nunca corrió en este checkout. No se
  arregla acá: instalar eslint y escribir su config es scope creep. Registrar
  el gap, no simular un PASS.
- Comparación visual antes/después en `:3001` (hero, panel destacado, footer, detail).
- Test manual de teclado (T6): tres rondas — lightbox no escapa el foco · foco vuelve al opener · flechas en el switcher.

## Route

ODD — directo/delegado, sin SDD. Tres work units mecánicos (WU1–WU3) y dos con
lógica propia (WU4–WU5). Cada work unit se ejecuta y verifica antes del siguiente;
ninguno depende del anterior.

## Delivery strategy

`ask-on-risk` (default). Forecast: ~90 líneas de código cambiadas + documentación,
muy por debajo del presupuesto de 400. Rama única `feat/recede-fade`, sin PR por ahora.