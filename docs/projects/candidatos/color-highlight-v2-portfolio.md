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
| `hook` | Fork modernizado de la extensión que resalta colores en el editor: render sin tocar el historial Git, 38 KB y 2 dependencias. |
| `metric` | 38 KB compilados, 2 dependencias en runtime |
| `tags` | TypeScript · esbuild · pnpm · VS Code |
| `image` | `/images/projects/color-highlight-v2/demo-vscode.webp` |
| `imageAlt` | VS Code con los colores resaltados en un archivo CSS real |
| `links` | Repo: [color-highlight-v2](https://github.com/MaxGB23/color-highlight-v2) (público) · Release: `v1.0.0` vía `.vsix` (no está en Marketplace) |

---

## 2. Detail — Vista detallada

### Headline

**Resalta los colores de tu código sin tocar el historial Git, en 38 KB**

### Summary

Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0), la extensión que resalta los colores directamente en el editor. Reescribí el núcleo en TypeScript con esbuild y pnpm: el render se inyecta en el DOM del editor mediante un mapa de decoraciones, así que ver los colores no ensucia el historial de Git del archivo. El artefacto compilado pesa 38 KB y depende de 2 paquetes en runtime. Fork bajo GPL-3.0, con crédito explícito a los autores originales.

### Metrics

| Value | Label |
| --- | --- |
| 38 KB | del artefacto compilado de la extensión |
| 150 ms | de debounce para no bloquear el editor al teclear (cuello de botella en la compilación de promesas de regex) |
| 11 | estrategias de detección de color en 6 formatos: SCSS, LESS, CSS vars, Hex/RGB, HSL y HWB |
| 2 | dependencias en runtime, sin framework |

### Problem

La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: sin tipado, build lento y dependencias pesadas. Modernizarla la hace mantenible y ligera sin abandonar la licencia ni el crédito de sus autores, y el render se diseñó para no ensuciar el historial de Git.

### Role

- Modernicé un proyecto open source existente (GPL-3.0): núcleo, motor de resaltado y lifecycle reescritos en TypeScript, compilados con esbuild y gestionados con pnpm.
- Reescribí el renderizador con un mapa de decoraciones (DecorationMap): los colores se inyectan en el DOM del editor sin ensuciar el historial de Git y sin dejar decoraciones huérfanas en memoria.
- Implementé auto-contraste WCAG: calculo la luminancia relativa (WCAG 2.0 §1.4.3) y elijo blanco o negro según el ratio de contraste.
- Apliqué un debounce de 150 ms para no bloquear el editor al teclear, atacando el cuello de botella de la compilación de promesas de regex.
- Mantuve la licencia GPL-3.0 y el crédito a los autores originales: el proyecto se presenta como fork modernizado, nunca como invención propia.

### Solution

- **Render sin tocar Git:** los colores se inyectan en el DOM mediante un mapa de decoraciones, así que verlos no ensucia el historial de Git del archivo.
- **Núcleo en TypeScript:** extension, motor de resaltado, mapa de decoraciones y contraste reescritos con tipado y compilados con esbuild.
- **11 estrategias de detección:** SCSS vars, LESS vars, CSS vars, Hex/RGB, HSL y HWB, integradas en un motor central.
- **Auto-contraste WCAG:** luminancia relativa y ratio de contraste (WCAG 2.0) para elegir texto blanco o negro sobre cualquier color resaltado.
- **Ultraligera:** 38 KB de artefacto y 2 dependencias en runtime.

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
| `demo-vscode.webp` | **Imagen de la card:** captura real de VS Code con los colores resaltados en `globals.css` del propio portfolio |
| `main.webp` | Mockup de presentación de la extensión |

> Solo existen 2 capturas del proyecto, y **ambas están en la galería**. La captura real es también la imagen de la card; repetirla es correcto porque la card no tiene galería dedicada con zoom. Con una sola imagen la galería se veía vacía.
> Antes la imagen de la card era `main.webp` (el mockup) con `imageAlt` genérico. Ahora la card es la captura real, que demuestra que la extensión funciona.

### CTA

_"¿Quieres que tus colores se vean al instante, sin pesar y sin ensuciar Git? Hablemos."_

---

## 3. Evidencia verificada en el repo (2026-10-08)

Todo lo afirmado arriba sale del código, no de estimaciones:

- **38 KB** — `ORCHESTRATOR-STATE.md`: *"Artifact (.js) de extensión compila a 38KB"*.
- **2 dependencias en runtime** — `package.json`: `dependencies: { color: 5.0.3, color-name: 2.1.0 }`. Cero framework.
- **150 ms con razón medida** — `src/document-highlight.ts:128`, con el comentario *"Se usa un intervalo de 150ms para evitar cuellos de botella en la compilación de promesas de regex"*.
- **WCAG real** — `src/lib/dynamic-contrast.ts` implementa `relativeLuminance` (WCAG 2.0 §1.4.3) y `contrastRatio`, citando la spec.
- **11 estrategias** — 11 archivos en `src/strategies/`: css-vars, functions, hex, hsla, hslWithoutFunction, hwb, less-vars, rgbWithoutFunction, scss-vars, styl-vars, words.
- **Clean Render** — patrón `DecorationMap` en `src/lib/decoration-map.ts`; resuelve también fugas de memoria de decoraciones ("zombies").
- **store-agnostic** — script `package: vsce package --no-dependencies`: el `.vsix` no arrastra dependencias, por eso instala en VS Code, Cursor, Windsurf, VSCodium y Antigravity.
- **Toolchain** — esbuild 0.20.2, TypeScript 5.4.5, `@types/vscode`, `engines.vscode ^1.90.0`, script `check-types`.

### Limitaciones honestas (no son defecto de copy, son del proyecto)

- **Sin distribución:** no está en VS Code Marketplace ni Open VSX. Solo `.vsix` desde GitHub Releases (`v1.0.0`). Por eso la ficha **no presenta ninguna métrica de adopción** — no hay ninguna que sea cierta.
- **1 estrella** en GitHub.
- **Sin CI ni tests:** no existe `.github/` y `package.json` no tiene script `test`. Es lo que `ORCHESTRATOR-STATE.md` llama Backlog: *"las pruebas e2e y mejoras opcionales se movieron al Backlog"*.
- **Migración a TypeScript parcial:** 5 archivos TS (núcleo) y 11 JS (estrategias heredadas). Por eso el Stack dice "TypeScript (núcleo) + JavaScript (estrategias heredadas)" en vez de "reconstruido con TypeScript".
- **Alcance:** `createdAt` == `pushedAt` == 2026-08-09. Un día de trabajo, un release. Es velocidad, pero conviene saber la escala antes de presentarlo como proyecto grande.
- **Decisión pendiente:** `ORCHESTRATOR-STATE.md` está en la **raíz** del repo y es visible al abrirlo. Para un portfolio de AI-engineer es neutral o favorable; sin limpiar, se ve como andamiaje.

### Deuda declarada

El único proyecto del portfolio sin métrica de adopción. La mejora real es publicar en un marketplace, no reescribir la ficha.