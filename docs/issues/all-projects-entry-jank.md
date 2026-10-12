# AllProjects: tirón en la entrada — registro y decisión aceptada

> **ACEPTADO. No es una lista de trabajo activa.**
> El fix aplicado está descrito abajo; el tick residual de ~58 ms se acepta
> como costo conocido de las animaciones de entrada con framer-motion.
> Se conserva como registro de qué se midió y por qué no se hace más —
> el razonamiento es lo valioso, no la lista.
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
on clean load"). El tirón residual persistió tras ese cambio.

## 3. Fix aplicado (en este worktree)

| Archivo | Cambio |
|---|---|
| `components/all-projects.tsx:63-69` | El grid deja `FadeInStagger` + `FadeInItemFade` por card y pasa a UN solo `FadeIn delayEnter` de contenedor alrededor del `div` del grid. Una sola animación de opacidad en vez de 6 cascadas |
| `components/project-card.tsx:55` | `decoding="async"` en el `next/image`, para sacar el decode del camino crítico del main thread |
| `components/project-card.tsx:33` | `transition-all` → `transition-[transform,box-shadow]`: el hover solo anima lo que necesita |
| `public/images/projects/cumyxel/nivel1.webp` | Re-codificado optimizado: 120 KB → 83 KB (122930 → 84992 bytes) |
| `public/images/projects/grinchmas-kart/inicio.webp` | Re-codificado optimizado: 127 KB → 68 KB (129934 → 69644 bytes) |

La familia de la sección no cambia: AllProjects sigue en Framer Motion
(heading + contenedor con `FadeIn delayEnter`), así que la tabla
§Secciones por familia de `docs/design/section-animations.md` sigue válida.

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

## 6. Veredicto aceptado + motivo

**Se acepta el tick de ~58 ms** (8 ms sobre el umbral de long task,
~3-4 frames, una sola vez por visita fría) como costo conocido de las
animaciones de entrada con framer-motion. Motivos:

- Un grid solo-CSS rompería el patrón de la sección sin ganancia
  garantizada: el heading seguiría en framer-motion y el loop global
  despertaría igual al entrar la sección.
- Skeletons, blur-up o render diferido son sobreingeniería para un
  portfolio que funciona en producción: una sola interrupción menor por
  visita fría no justifica complejidad ni riesgo visual.

## 7. Evidencia cruda (excluida del repo a propósito)

Los traces `traces/main-natural.json`, `traces/main-rapido.json`,
`traces/worktree-natural.json`, `traces/worktree-rapido.json` (~37 MB
cada uno) y `traces/call-tree-breakdown.png` viven solo en este worktree
como binarios de diagnóstico: no se commitean.
