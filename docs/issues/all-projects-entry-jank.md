# AllProjects: tirón en la entrada — registro y decisión aceptada

> **ACEPTADO como costo conocido. No es una lista de trabajo activa.**
> El fix aplicado está descrito abajo. El tick residual de ~58 ms se aceptó
> como costo de las animaciones de entrada con framer-motion; el track
> `css-first-reveal` (2026-10-19) sacó después esta sección de framer-motion por
> otros motivos (§6). Se conserva como registro de qué se midió y por qué no se
> hizo más — el razonamiento es lo valioso, no la lista.
>
> Contexto: el sitio está desplegado en Vercel y funciona en producción.
> El diseño visual está aprobado, así que nada que altere el render entró
> en alcance.

---

## 1. Síntoma

En carga fría, al entrar la sección AllProjects al viewport, el grid de las
6 cards no destacadas (desktop a 3 columnas) presentaba un tirón visible:
6 animaciones por card arrancaban en el mismo frame que 6 decodificaciones
de imagen.

## 2. Qué hizo el PR #3

El PR #3 ya había eliminado el transform vertical en el grid: añadió
`FadeInItemFade` en `components/motion-primitives.tsx` (solo opacidad,
`duration: 0.35`, sin `y`) y lo usó por card dentro de `FadeInStagger`
(commit `e4ff08d`, "perf(all-projects): fade-only entry to remove hitch
on clean load"). El tirón residual persistió tras ese cambio. Ese módulo se
borró después, en el track `css-first-reveal`: `FadeInItemFade`,
`FadeInStagger` y `FadeIn` no tenían consumidores.

## 3. Fix aplicado (en este worktree)

| Archivo | Cambio |
|---|---|
| `components/all-projects.tsx:63-69` | El grid deja `FadeInStagger` + `FadeInItemFade` por card y pasa a UN solo `FadeIn delayEnter` de contenedor alrededor del `div` del grid. Una sola animación de opacidad en vez de 6 cascadas |
| `components/project-card.tsx:55` | `decoding="async"` en el `next/image`, para sacar el decode del camino crítico del main thread |
| `components/project-card.tsx:33` | `transition-all` → `transition-[transform,box-shadow]`: el hover solo anima lo que necesita |
| `public/images/projects/cumyxel/nivel1.webp` | Re-codificado optimizado: 120 KB → 83 KB (122930 → 84992 bytes) |
| `public/images/projects/grinchmas-kart/inicio.webp` | Re-codificado optimizado: 127 KB → 68 KB (129934 → 69644 bytes) |

La familia de la sección cambió después, en el track `css-first-reveal`
(2026-10-19): AllProjects pasó de la familia Framer a `Reveal` (CSS). La tabla
§Secciones por familia de `docs/design/section-animations.md` está al día.

## 4. Medición

Método: Performance de DevTools en producción, incógnito, sin caché, con
filmstrip. Comparación main vs worktree, cada uno con pasada natural y
pasada rápida (scroll natural + scroll rápido): 4 pasadas en total.

| Pase | Long tasks | Tick | Decode en main thread | CLS |
|---|---|---|---|---|
| main, scroll natural | 1 | ~58 ms | 0 ms | 0 |
| main, scroll rápido | 1 | ~58 ms | 0 ms | 0 |
| worktree, scroll natural | 1 | ~58 ms (58.74 ms en la pasada capturada) | 0 ms | 0 |
| worktree, scroll rápido | 1 | ~58 ms | 0 ms | 0 |

Scripting total observado, ligeramente menor en el worktree: 363 ms frente
a 396 ms en main. No se registraron cifras de raster ni de frames
descartados: no aportaban nada a la atribución una vez localizado el tick.

## 5. Atribución (bottom-up)

En las 4 pasadas hay exactamente 1 long task de ~58 ms. El bottom-up
atribuye el 97%+ del self time al loop central de framer-motion —
`processFrame` / `frameLoop` (`framer-motion/dist/es/frameloop/frame.mjs`,
self 57.52 ms, 97.9% en la pasada capturada): es el loop global que
despierta para todas las animaciones de la página al entrar la sección.
Handlers de scroll (Lenis / observers): 0 ms dentro del long task.
Callbacks de imagen (decode / onLoad): 0 ms en el main thread.

## 6. Veredicto: costo aceptado, y esa entrada ya no existe

**El tick de ~58 ms se aceptó** (8 ms sobre el umbral de long task, ~3-4
frames, una sola vez por visita fría) como costo conocido de las animaciones de
entrada con framer-motion. Motivos, tal como se decidieron entonces:

- Un grid solo-CSS rompería el patrón de la sección sin ganancia garantizada:
  el heading seguiría en framer-motion y el loop global despertaría igual al
  entrar la sección.
- Skeletons, blur-up o render diferido son sobreingeniería para un
  portfolio que funciona en producción: una sola interrupción menor por
  visita fría no justifica complejidad ni riesgo visual.

**Estado tras el track `css-first-reveal` (2026-10-19):** la sección ya no usa
framer-motion. El heading y el grid son `Reveal` (IntersectionObserver +
transición CSS de opacidad), así que la causa atribuida en §5 — el `frameLoop`
global despertando al entrar la sección — no corre por esta entrada, y el
segundo motivo de la lista (el heading seguiría en framer-motion) dejó de
aplicar.

**Por qué se migró: no por este tick.** El RFC lo declara explícitamente como
motivación débil (1 long task, 3-4 frames, una vez por visita fría). Lo que
justificó la migración fue otra cosa: el `initial="hidden"` de framer-motion
horneaba `opacity:0` en el HTML del servidor, de modo que sin JS la página se
veía vacía, y 12 nodos de hero/about con `visibility:hidden` inline quedaban
fuera del árbol de accesibilidad.

**Lo que NO se puede afirmar:** que el tick haya bajado. §5 dice dónde estaba
el costo en main, no cuánto vale ahora. La medición acotada de §6.1 ya existe y
no encuentra long tasks en la entrada, así que la pregunta cambió de forma: no
es "cuánto bajó el tick" sino "por qué se percibe un tirón que no es JS". El
canon (`docs/design/section-animations.md`) solo afirma que el loop de
framer-motion ya no corre en esta sección.

### 6.1 Medición acotada a la entrada (2026-10-20)

Método: Playwright/Chromium, contexto nuevo y cache deshabilitada por CDP en
cada pasada, viewport 1440x900, CPU throttling 4x, `PerformanceObserver` de
`longtask` instalado antes de navegar y `performance.mark` disparado por el
IntersectionObserver de `#all-projects`. Ventana medida: `[entry, entry+1500]`.
3 pasadas frías y 3 en caliente (entrar, salir, volver a entrar). Sin tracing
en esta fase: el tracing infla las métricas.

| Pasada | Long tasks en la ventana | Max (ms) | Total (ms) |
|---|---|---|---|
| Cold 1/2/3 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Warm 1/2/3 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |

**Resultado:** la entrada a la sección no produce long tasks en el hilo
principal, ni en frío ni en caliente. Las long tasks de JS de la carga fría
(5-6, máximo ~236 ms con 4x, que equivalen a ~59 ms sin throttle) caen en la
ventana de hidratación (~1.0-2.0 s), antes del scroll.

**Lo que esto significa:** el tirón percibido al entrar NO es bloqueo de JS en
el hilo principal. Queda atribuido a raster/composicion y a la decodificacion
asincrona de las 6 imagenes del grid, que ocurre fuera del hilo principal y por
eso no genera long tasks. La atribucion de §5 (`frameLoop` al entrar la
seccion) no describe esta rama.

**Lo que NO se puede afirmar:** que el tirón haya desaparecido — se sigue
percibiendo en sesion fria desde incognito — ni que la rama rinda igual que
main en esta ventana: no hubo pasada de main con este metodo, y cero long tasks
es el resultado esperado si el costo nunca estuvo en el hilo principal.
Tampoco se afirma mejora de rendimiento.

**Si alguna vez se retoma:** `PerformanceObserver('long-animation-frame')`
(LoAF) es la herramienta que si atribuye frames largos de render/composicion.
No se abre trabajo con esto: la unica via de mejora identificada (imagenes) ya
esta optimizada en `project-card.tsx` (`next/image` con `sizes` de 33vw y
`decoding="async"`, ~478 KB de grid).

## 7. Evidencia cruda (excluida del repo a propósito)

Los traces `traces/main-natural.json`, `traces/main-rapido.json`,
`traces/worktree-natural.json`, `traces/worktree-rapido.json` (~37 MB
cada uno) y `traces/call-tree-breakdown.png` viven solo en este worktree
como binarios de diagnóstico: no se commitean.
