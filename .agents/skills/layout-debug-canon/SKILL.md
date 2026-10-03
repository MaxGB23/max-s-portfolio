---
name: layout-debug-canon
description: "Trigger: debug de layout en este repo, activar canales de debug, ver limites de contenedor, localizar padding o margin inconsistente, probe puntual con debug-test. Operate this repo's layout-debug overlay: channel selection, disposable probes, and where the contract lives."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "2.1"
---

# Skill: Layout Debug Overlay (este repo)

## Activation Contract

**Paso 0, obligatorio.** Antes de nada, comprueba que este proyecto tiene el overlay
montado: existe el tipo `DebugChannel` o hay marcadores `debug-lN` en el markup.
Comprueba el CONTRACTO, no una ruta — el proyecto puede ser de otro framework.
Si no existe, PARA: este proyecto necesita instalarlo, y de eso se ocupa la skill
global `layout-debug`. No apliques las reglas de aqui a un proyecto sin overlay.

Aplicar al USAR el overlay ya montado: elegir que canales ver, marcar una caja
puntual, o localizar donde vive el contrato.

Esta skill contiene los HECHOS de este repo. Las REGLAS (convencion de profundidad,
como anadir un nivel) viven en la skill global `layout-debug` y no se duplican aqui.

## Hard Rules

- Default apagado: `LAYOUT_DEBUG: DebugChannel[] = []` en `app/layout.tsx`. Enciende
  solo los canales que vayas a mirar y apagalos antes de commitear.
- La tabla de canales de abajo es la verdad de este repo. Un marker con un nivel que
  no aparece en la tabla esta mal.
- La profundidad se cuenta desde el ancestro marcado mas externo; los wrappers sin
  marcar no cuentan. Ningun marker puede tener nivel <= el de un ancestro marcado,
  y varias raices hermanas arrancan cada una en l1.
- Activa UN canal por vez. Ver los 5 niveles anidados a la vez es el ruido que
  el overlay evita; para padding de un contenedor concreto, lista solo ese nivel.
- `debug-test` es una sonda desechable para UNA caja (icono, imagen, span inline).
  Ortogonal a la profundidad: nunca cuenta como nivel. Se quita al terminar la
  inspeccion; uno olvidado es inofensivo.
- Los marcadores `debug-lN` se quedan en el markup permanentemente.

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
| Contrato detallado (si existe) | `docs/design/components.md` seccion 10 — solo en este repo; si no esta, las reglas estan en `layout-debug` |
| Las reglas y como anadir un nivel | skill global `layout-debug` |

## Anadir un nivel

Ver el paso 4 de la skill global `layout-debug`: cuatro sitios, todos o ninguno. El
sitio que se olvida en silencio es la fila de la tabla de canales de arriba.

## Verification

Con el array vacio, el HTML servido NO debe contener ningun atributo `data-debug-*`.