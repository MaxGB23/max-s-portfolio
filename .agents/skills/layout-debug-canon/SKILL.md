---
name: layout-debug-canon
description: "Trigger: debug de layout en este repo, activar canales de debug, ver limites de contenedor, localizar padding o margin inconsistente, probe puntual con debug-test. Operate this repo's layout-debug overlay: channel selection, disposable probes, and where the contract lives."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "2.0"
---

# Skill: Layout Debug Overlay (este repo)

## Activation Contract

Aplicar al USAR el overlay que ya existe aqui: elegir que canales ver, marcar una caja
puntual, o localizar donde vive el contrato. Para MONTAR el overlay en un proyecto que
no lo tiene, usa la skill global `layout-debug` (instalacion cross-project).

## Hard Rules

- Default apagado: `LAYOUT_DEBUG: DebugChannel[] = []` en `app/layout.tsx`. Este repo
  tiene 5 niveles + `test`, pero el estado por defecto es apagado: enciende solo lo
  que vayas a mirar y apagalo antes de commitear.
- La profundidad se cuenta desde el ancestro marcado mas externo; los wrappers sin
  marcar no cuentan. Ningun marker puede tener nivel <= el de un ancestro marcado.
- Activa UN canal por vez. Ver los 5 niveles anidados a la vez es el ruido que
  el overlay evita; para padding de un contenedor concreto, lista solo ese nivel.
- `debug-test` es una sonda desechable para UNA caja (icono, imagen, span inline).
  Ortogonal a la profundidad: nunca cuenta como nivel. Se quita al terminar la
  inspeccion; uno olvidado es inofensivo.
- Los marcadores `debug-lN` se quedan en el markup permanentemente.
- El canon es la unica fuente del contrato. Esta skill no lo duplica.

## Canales

| Canal | Color | Para que |
|---|---|---|
| `l1` | `#f87171` rojo | contenedor marcado mas externo |
| `l2` | `#22c55e` verde | un nivel adentro |
| `l3` | `#eab308` ambar | dos niveles adentro |
| `l4` | `#60a5fa` azul | tres niveles adentro |
| `l5` | `#a78bfa` violeta | cuatro niveles adentro |
| `test` | `#f5f5f5` discontinuo | sonda de una caja, NO es nivel |

## Donde vive

| Que | Donde |
|---|---|
| El array de canales | `app/layout.tsx` (`LAYOUT_DEBUG`) |
| Las reglas CSS | `app/globals.css`, bloque `@layer utilities` |
| El contrato y los modos de `Section` | `docs/design/components.md` seccion 10 |

## Anadir un nivel

Tres sitios, y los tres o nada — el cuarto es esta tabla, que se pudre en silencio
si se olvida:

1. La union `DebugChannel` en `app/layout.tsx`.
2. Una regla `[data-debug-lN] .debug-lN` en el bloque `@layer utilities` de `app/globals.css`.
3. Una fila en la tabla de canales de esta skill.

Nada limita el numero de niveles: el techo lo pone la profundidad real de tus
componentes, no la paleta.

## Verification

Con el array vacio, el HTML servido NO debe contener ningun atributo `data-debug-*`.