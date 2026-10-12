# Featured stretch acotado + fallback estático mínimo

## Objective
Probar en vivo los dos fixes de `docs/rfcs/featured-aspect-ratio.md` sin sobreingeniería: D (stretch acotado de imagen) + F2 como guard mínimo (sección cabe en viewport → todo visible).

## Problem
- En `lg` compacto (~1024-1280px) la columna de texto es más alta que la imagen `aspect-4/3` fija y queda un hueco bajo la imagen (`components/featured-project-panel.tsx` línea 59, `items-start`).
- Con viewport CSS muy alto (zoom <=50% en 1600p, 4K sin escalado OS) los 3 paneles cruzan la línea del 60% a la vez y la one-slide rule salta de la card 1 a la 3 — la card 2 es inalcanzable (`components/featured-projects.tsx` `evaluate()`).

## Why
D toca el camino común (laptops/tablets reales). F2 toca un régimen raro pero real para el owner (1600p sin escalado, 4K, UI compacta). Ambos son baratos si F2 se queda en guard mínimo y no en modo completo.

## Scope
- Solo featured projects, worktree `featured-rfc`.
- Sin cambios de contenido, breakpoints, `object-cover`, orden de columnas ni `gap`.

## Constraints
- D es excepción deliberada de featured, no patrón del sistema.
- F2 detecta geometría (sección cabe), NUNCA `devicePixelRatio` ni nivel de zoom.
- Móvil conserva `aspect-4/3`.
- Textos ES/EN cambian la altura — la banda min/max debe servir en ambos idiomas.

## Authorized scope
- `components/featured-project-panel.tsx`
- `components/featured-projects.tsx`

## Tasks
- [x] T1 (D — stretch acotado): grid `items-start` → `items-stretch` solo en ese grid; imagen sin ratio fija en desktop (`lg:aspect-auto lg:h-full`) con `lg:min-h-[28rem]` como piso y `lg:max-h-[36rem]` como techo (calibrar en vivo a 1024 / 1180 / 1440, ES+EN); móvil intacto; `object-cover` intacto. Route: delegated direct (writer trigger: 2 ficheros en el feature). Trigger evidence: se tocan panel + projects. Completado 2026-10-12: `pnpm tsc --noEmit` pass, `pnpm build` pass (Next 16.1.6, 13/13 páginas); prueba en vivo del dueño en 10 dispositivos; refinamiento 2xl del dueño (`lg:min-h-[25rem] lg:max-h-[28rem]` + `2xl:min-h-[28rem] 2xl:max-h-[36rem]`).
- [x] T2 (F2 — guard mínimo): en `evaluate()`, si la altura total de `#proyectos` cabe en el viewport, marcar los 3 paneles visibles + heading visible, sin animación one-slide; en caso contrario, regla actual intacta. Una sola rama geométrica, sin deshabilitar animaciones en otro lado. Implementar DESPUÉS de T1 y reverificar el umbral porque D cambia `tops[]`. Route: delegated direct (mismo writer, mismo batch). Completado 2026-10-12 (después de T1, umbral reverificado): `pnpm tsc --noEmit` pass, `pnpm build` pass; prueba en vivo del dueño.

## Acceptance criteria
- T1: a 1024/1280 no hay hueco bajo la imagen; cada card se ve llena; la varianza entre cards queda acotada por el techo; sin deformación.
- T2: a zoom 50% / viewport gigante los 3 paneles se ven (no hay salto 1→3); a zoom 67-100% la one-slide rule sigue avanzando de una en una.
- `pnpm tsc --noEmit` pasa; `pnpm build` pasa.

## Applicable checks
- Test-first: NO aplica RED/GREEN determinista (cambio visual + geometría de scroll sin runner unitario significativo). Excepción documentada; verificación = estructural + vivo.
- Estructural: `pnpm tsc --noEmit`, `pnpm build`, grep del CSS compilado para las clases nuevas.
- Vivo (usuario): 1024 / 1180 / 1440 en ES+EN para T1; zoom 50% vs 67-100% para T2.

## Conflicto D × F2 (veredicto)
- Sin conflicto de merge (archivos distintos).
- Acoplamiento de comportamiento: D cambia alturas → cambia `tops[]` y la condición "cabe en viewport" de F2. Orden: calibrar banda min/max de D primero, después verificar umbral de F2.
- F2 expone la varianza de D en modo estático (3 paneles a la vez comparables), acotada por el `max-h`. Régimen raro, anotado.

## Progress
- 2026-10-12: doc creado, sin implementación. Siguiente: T1 → T2 con un writer, luego checks + pase visual.
- 2026-10-12: T1+T2 completados y verificados. `pnpm tsc --noEmit`: pass. `pnpm build`: pass (Next 16.1.6, 13/13 páginas). Prueba en vivo del dueño en 10 dispositivos + refinamiento 2xl del dueño. Docs sincronizados (canon, animaciones, RFC).

## Next step
Commit de work unit única pendiente.
