# Color Highlight v2 — Fork modernizado de extensión VS Code (Consolidado)

> Fuente única de contenido para el portfolio. Editar aquí; luego se refleja en `data/projects.ts`.
> Última actualización: 2026-10-08
> ⚠️ Regla de frame: se presenta como **fork modernizado con crédito a los autores originales**, nunca como creación propia. Pero el crédito va **una vez, en el cuerpo** — no abre la ficha. Tres menciones del descargo turnaban la debilidad en el primer mensaje.
> ✅ Repo público: [MaxGB23/color-highlight-v2](https://github.com/MaxGB23/color-highlight-v2) — todo lo de abajo está verificado en el código.

---

## 1. Brief — Vista normal (card del grid)

| Campo | Valor |
| --- | --- |
| `id` | `color-highlight-v2` |
| `title` | Color Highlight v2 |
| `category` | Dev Tools / VS Code |
| `hook` | Fork modernizado de la extensión que resalta colores en el editor: debounce de 150 ms, build con esbuild, 38 KB y 2 dependencias. |
| `metric` | 38 KB compilados, 2 dependencias en runtime |
| `tags` | TypeScript · esbuild · pnpm · VS Code |
| `image` | `/images/projects/color-highlight-v2/main.webp` |
| `imageAlt` | Mockup de Color Highlight v2: logo, eslogan y una ventana de VS Code resaltando colores en CSS y SCSS |
| `links` | Repo: [color-highlight-v2](https://github.com/MaxGB23/color-highlight-v2) (público) · Release: `v1.0.0` vía `.vsix` (no está en Marketplace) |

---

## 2. Detail — Vista detallada

### Headline

**Escaneo con debounce de 150 ms y build con esbuild: 38 KB y 2 dependencias**

### Summary

Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0), la extensión que resalta los colores directamente en el editor. El original relanzaba un escaneo completo en cada tecla: añadí un debounce de 150 ms que elimina ese cuello de botella. También sustituí su cadena de build (webpack + babel + npm) por esbuild + pnpm, dejando el artefacto en 38 KB y las dependencias en runtime de 4 a 2, y migré el núcleo a TypeScript. Fork bajo GPL-3.0, con crédito explícito a los autores originales.

### Metrics

| Value | Label |
| --- | --- |
| 38 KB | del artefacto compilado de la extensión |
| 150 ms | de debounce añadido: el original relanzaba el escaneo completo en cada tecla |
| 2 | dependencias en runtime, de 4 en el original a 2 en el fork |
| 11 | estrategias de detección de color en 6 formatos: SCSS, LESS, CSS vars, Hex/RGB, HSL y HWB |

> La métrica `11 estrategias` describe una propiedad de la extensión, no un aporte del fork: el upstream ya traía esas 11 estrategias en `src/strategies/`. Ver la comparación completa abajo.

### Problem

La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: relanzaba un escaneo completo en cada tecla, su build pasaba por webpack y babel con cuatro dependencias en runtime, y el núcleo no estaba tipado. Modernizarla la hace mantenible y ligera sin abandonar la licencia ni el crédito de sus autores.

### Role

- Sustituí la cadena de build (webpack + babel + npm) por esbuild + pnpm: el artefacto compilado quedó en 38 KB y las dependencias en runtime bajaron de 4 a 2.
- Añadí un debounce de 150 ms al motor de resaltado, que antes relanzaba el escaneo completo con cada tecla; el motivo está documentado en el código.
- Migré el núcleo a TypeScript (motor de resaltado, mapa de decoraciones, contraste e importer de Sass) y añadí un script `check-types` al pipeline.
- Reescribí el mapa de decoraciones con ciclo de vida y liberación explícita, corrigiendo las fugas de memoria de decoraciones.
- Mantuve la licencia GPL-3.0 y el crédito a los autores originales: el proyecto se presenta como fork modernizado, nunca como invención propia.

### Solution

- **Debounce de 150 ms:** el motor deja de relanzar el escaneo completo en cada tecla, que es de donde venía el atasco al escribir.
- **Build con esbuild:** sustituye a webpack + babel, sin transpilación intermedia ni esa cadena de toolchain.
- **38 KB y 2 dependencias:** el paquete se empaqueta con `--no-dependencies`, así que instala en VS Code, Cursor, Windsurf, VSCodium y Antigravity sin arrastrar nada.
- **Núcleo en TypeScript:** motor, mapa de decoraciones, contraste e importer de Sass con tipado, verificados en cada build con `check-types`.

### Stack

- **Lenguaje:** TypeScript (núcleo) + JavaScript (estrategias heredadas)
- **Build:** esbuild
- **Package manager:** pnpm
- **Plataforma:** API de extensiones de VS Code (VS Code 1.90+)
- **Licencia:** GPL-3.0 (fork de `vscode-ext-color-highlight`)

### Contexto de carrera

Paso de *tooling* en la curva profesional: PHP/Laravel/Vue → tooling VS Code → especialidad actual. Demuestra capacidad de trabajar sobre código ajeno con respeto al open source: modernizar sin romper licencia ni crédito.

### Gallery

| Archivo | Qué muestra |
| --- | --- |
| `demo-vscode.webp` | Captura real de VS Code con los colores resaltados en `globals.css` del propio portfolio |
| `main.webp` | **Imagen de la card:** mockup con el logo, el eslogan y una ventana de VS Code con colores en CSS y SCSS |

> Solo existen 2 capturas del proyecto, y **ambas están en la galería**. `main.webp` es también la imagen de la card: repetirla es correcto porque la card no tiene galería dedicada con zoom.
> La card usa el mockup porque se lee mejor en miniatura (logo y título identifican la extensión de un vistazo); la captura real queda en la galería, donde se aprecia que la extensión funciona sobre código real.

### CTA

_"¿Quieres que tus colores se vean al instante, sin pesar y sin ensuciar Git? Hablemos."_

---

## 3. Comparación verificada contra el upstream (2026-10-08)

Todo lo afirmado arriba sale del código. La comparación se hizo clonando **ambos** repositorios: `MaxGB23/color-highlight-v2` y `naumovs/vscode-ext-color-highlight`.

| | Original (upstream) | v2 (fork) | ¿Aporte del fork? |
| --- | --- | --- | --- |
| Debounce al escribir | **ninguno** | 150 ms | ✅ **sí** |
| Cadena de build | webpack + babel + npm | esbuild + pnpm | ✅ **sí** |
| Deps en runtime | 4 (`@babel/runtime`, `color`, `color-name`, `file-importer`) | **2** (`color`, `color-name`) | ✅ **sí** |
| Núcleo en TypeScript | JS sin tipar | TS + `check-types` | ✅ **sí** |
| `decoration-map` | 2,343 bytes | 7,892 bytes (lifecycle + `dispose`) | ✅ **sí** |
| Artefacto compilado | — | 38 KB | ✅ **sí** |
| Render sin tocar Git | ya usaba `setDecorations` (`color-highlight.js:172`) | igual | ❌ **heredado** |
| Mapa de decoraciones | ya existía `decoration-map.js` | reescrito | ❌ heredado |
| Auto-contraste WCAG | ya existía, mismo `relativeLuminance`/`contrastRatio` citando WCAG 2.0 | igual | ❌ **heredado** |
| 11 estrategias de detección | ya estaban en `src/strategies/` | igual | ❌ heredado |
| Tests | **10 archivos con fixtures** (mocha) | **0** | ⚠️ **regresión** |

### Corrección aplicada

Una versión anterior de esta ficha ponía **"Render sin tocar Git" como headline** y listaba el **auto-contraste WCAG** como logro del fork. Ambas cosas **ya existían en el upstream**: el original usaba `setDecorations` (`color-highlight.js:172`) y traía un `dynamic-contrast.js` con la misma implementación de WCAG 2.0. Presentarlas como局局长 del fork era una afirmación falsa de autoría.

El headline y las secciones de `Role`/`Solution` ahora citan solo lo que sí aporta el fork. `Clean Render` y el auto-contraste se conservan como descripción honesta de lo que hace la extensión, sin reclamarlos como propia.

**Regla para futuros forks: verificar contra el upstream, no solo contra el repo propio.** Un repo propio demuestra qué hace el código, no qué cambió.

### Limitaciones honestas

- **Regresión de tests:** el upstream traía 10 archivos de test con fixtures; el fork los eliminó y no los repuso. La "modernización" quitó cobertura existente. Es la deuda más seria del proyecto.
- **Sin distribución:** no está en VS Code Marketplace ni Open VSX. Solo `.vsix` desde GitHub Releases (`v1.0.0`). Por eso la ficha **no presenta ninguna métrica de adopción** — no hay ninguna que sea cierta.
- **1 estrella** en GitHub.
- **Sin CI:** no existe `.github/`; `check-types` existe como script pero no corre en ningún pipeline.
- **Migración a TypeScript parcial:** 5 archivos TS (núcleo) y 11 JS (estrategias heredadas). El Stack lo declara así en vez de decir "reconstruido con TypeScript".
- **Alcance:** `createdAt` == `pushedAt` == 2026-08-09. Un día de trabajo, un release. Es velocidad, pero conviene saber la escala.
- **Decisión pendiente:** `ORCHESTRATOR-STATE.md` está en la **raíz** del repo y es visible al abrirlo. Para un portfolio de AI-engineer es neutral o favorable; sin limpiar, se ve como andamiaje.

### Deuda declarada

Único proyecto del portfolio sin métrica de adopción y el único con una regresión de tests conocida. La mejora real es publicar en un marketplace y recuperar los tests, no reescribir la ficha.