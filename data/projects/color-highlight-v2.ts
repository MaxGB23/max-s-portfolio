// Ficha `color-highlight-v2` (Color Highlight v2) en el shape bilingue
// `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya depurado contra el upstream en una
// sesion anterior (se quitaron los claims que no se sostenian: el fork no
// "renderiza sin tocar Git" y no hubo regresion de tests). Este writer NO
// reintroduce ni "mejora" ninguno de esos claims: traduce el texto actual tal
// cual.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// CIFRAS INTACTAS: `38 KB`, `150 ms`, `2`, `11`, `6 formatos` y la lista de
// formatos (SCSS, LESS, CSS vars, Hex/RGB, HSL, HWB) se traducen sin alterar
// un solo digito. Los valores de `metrics` son cifras puras salvo el nombre del
// producto, asi que van por identidad.

import type { ProjectL } from "./types";

export const colorHighlightV2: ProjectL = {
  id: "color-highlight-v2",
  title: {
    // Nombre de la extension: identidad a proposito.
    es: "Color Highlight v2",
    en: "Color Highlight v2",
  },
  category: {
    // "Dev Tools" ya es el termino del sector en ingles: identidad a proposito.
    es: "Dev Tools / VS Code",
    en: "Dev Tools / VS Code",
  },
  hook: {
    es: "Fork modernizado de la extensión que resalta colores en el editor: debounce de 150 ms, build con esbuild, 38 KB y 2 dependencias.",
    en: "Modernized fork of the extension that highlights colors in the editor: 150 ms debounce, esbuild build, 38 KB and 2 dependencies.",
  },
  metric: {
    es: "38 KB compilados, 2 dependencias en runtime",
    en: "38 KB compiled, 2 runtime dependencies",
  },
  // Stack names: no se traducen.
  tags: ["TypeScript", "esbuild", "pnpm", "VS Code"],
  image: "/images/projects/color-highlight-v2/main.webp",
  imageAlt: {
    es: "Mockup de Color Highlight v2: logo, eslogan y una ventana de VS Code resaltando colores en CSS y SCSS",
    en: "Color Highlight v2 mockup: logo, tagline and a VS Code window highlighting colors in CSS and SCSS",
  },
  links: [
    {
      label: {
        es: "Ver código",
        en: "View code",
      },
      kind: "code",
      url: "https://github.com/MaxGB23/color-highlight-v2",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "Escaneo con debounce de 150 ms y build con esbuild: 38 KB y 2 dependencias",
      en: "Scanning with a 150 ms debounce and an esbuild build: 38 KB and 2 dependencies",
    },
    summary: {
      es: "Fork modernizado de `vscode-ext-color-highlight` (GPL-3.0), la extensión que resalta los colores directamente en el editor. El original relanzaba un escaneo completo en cada tecla: añadí un debounce de 150 ms que elimina ese cuello de botella. También sustituí su cadena de build (webpack + babel + npm) por esbuild + pnpm, dejando el artefacto en 38 KB y las dependencias en runtime de 4 a 2, y migré el núcleo a TypeScript. Fork bajo GPL-3.0, con crédito explícito a los autores originales.",
      // El ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "Modernized fork of `vscode-ext-color-highlight` (GPL-3.0), the extension that highlights colors directly in the editor. The original re-ran a full scan on every keystroke: I added a 150 ms debounce that removes that bottleneck. I also replaced its build chain (webpack + babel + npm) with esbuild + pnpm, bringing the artifact down to 38 KB and runtime dependencies from 4 to 2, and migrated the core to TypeScript. GPL-3.0 fork, with explicit credit to the original authors.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          es: "38 KB",
          en: "38 KB",
        },
        label: {
          es: "del artefacto compilado de la extensión",
          en: "of the compiled extension artifact",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "150 ms",
          en: "150 ms",
        },
        label: {
          es: "de debounce añadido: el original relanzaba el escaneo completo en cada tecla",
          en: "debounce added: the original re-ran the full scan on every keystroke",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "2",
          en: "2",
        },
        label: {
          es: "dependencias en runtime, de 4 en el original a 2 en el fork",
          en: "runtime dependencies, down from 4 in the original to 2 in the fork",
        },
      },
      {
        value: {
          // Cifra pura: identidad.
          es: "11",
          en: "11",
        },
        label: {
          es: "estrategias de detección de color en 6 formatos: SCSS, LESS, CSS vars, Hex/RGB, HSL y HWB",
          // Nombres de formato: intactos, como los nombres de stack.
          en: "color detection strategies across 6 formats: SCSS, LESS, CSS vars, Hex/RGB, HSL and HWB",
        },
      },
    ],
    problem: {
      es: "La extensión original resolvía un problema real — ver los colores del código directamente en el editor — pero su base había envejecido: relanzaba un escaneo completo en cada tecla, su build pasaba por webpack y babel con cuatro dependencias en runtime, y el núcleo no estaba tipado. Modernizarla la hace mantenible y ligera sin abandonar la licencia ni el crédito de sus autores.",
      en: "The original extension solved a real problem — seeing code colors directly in the editor — but its foundation had aged: it re-ran a full scan on every keystroke, its build went through webpack and babel with four runtime dependencies, and the core was untyped. Modernizing it makes it maintainable and lightweight without giving up the license or the credit to its authors.",
    },
    role: [
      {
        es: "Sustituí la cadena de build (webpack + babel + npm) por esbuild + pnpm: el artefacto compilado quedó en 38 KB y las dependencias en runtime bajaron de 4 a 2.",
        en: "I replaced the build chain (webpack + babel + npm) with esbuild + pnpm: the compiled artifact came down to 38 KB and runtime dependencies dropped from 4 to 2.",
      },
      {
        es: "Añadí un debounce de 150 ms al motor de resaltado, que antes relanzaba el escaneo completo con cada tecla; el motivo está documentado en el código.",
        en: "I added a 150 ms debounce to the highlighting engine, which previously re-ran the full scan on every keystroke; the reason is documented in the code.",
      },
      {
        es: "Migré el núcleo a TypeScript (motor de resaltado, mapa de decoraciones, contraste e importer de Sass) y añadí un script `check-types` al pipeline.",
        en: "I migrated the core to TypeScript (highlighting engine, decoration map, contrast and Sass importer) and added a `check-types` script to the pipeline.",
      },
      {
        es: "Reescribí el mapa de decoraciones con ciclo de vida y liberación explícita, corrigiendo las fugas de memoria de decoraciones.",
        en: "I rewrote the decoration map with an explicit lifecycle and disposal, fixing the decoration memory leaks.",
      },
      {
        es: "Mantuve la licencia GPL-3.0 y el crédito a los autores originales: el proyecto se presenta como fork modernizado, nunca como invención propia.",
        en: "I kept the GPL-3.0 license and the credit to the original authors: the project presents itself as a modernized fork, never as my own invention.",
      },
    ],
    solution: [
      {
        // Cada `**Label:**` abre y cierra aqui, igual que en el ES.
        es: "**Debounce de 150 ms:** el motor deja de relanzar el escaneo completo en cada tecla, que es de donde venía el atasco al escribir.",
        en: "**150 ms debounce:** the engine stops re-running the full scan on every keystroke, which is where the typing lag came from.",
      },
      {
        es: "**Build con esbuild:** sustituye a webpack + babel, sin transpilación intermedia ni esa cadena de toolchain.",
        en: "**esbuild build:** replaces webpack + babel, with no intermediate transpilation and none of that toolchain chain.",
      },
      {
        es: "**38 KB y 2 dependencias:** el paquete se empaqueta con `--no-dependencies`, así que instala en VS Code, Cursor, Windsurf, VSCodium y Antigravity sin arrastrar nada.",
        en: "**38 KB and 2 dependencies:** the package is bundled with `--no-dependencies`, so it installs on VS Code, Cursor, Windsurf, VSCodium and Antigravity without dragging anything along.",
      },
      {
        es: "**Núcleo en TypeScript:** motor, mapa de decoraciones, contraste e importer de Sass con tipado, verificados en cada build con `check-types`.",
        en: "**TypeScript core:** engine, decoration map, contrast and Sass importer all typed, verified on every build with `check-types`.",
      },
    ],
    // Etiqueta traducida, nombre de stack intacto.
    stack: [
      {
        es: "Lenguaje: TypeScript (núcleo) + JavaScript (estrategias heredadas)",
        en: "Language: TypeScript (core) + JavaScript (legacy strategies)",
      },
      {
        es: "Build: esbuild (antes webpack + babel)",
        en: "Build: esbuild (previously webpack + babel)",
      },
      {
        // "Package manager" ya es la etiqueta inglesa del sector: identidad.
        es: "Package manager: pnpm",
        en: "Package manager: pnpm",
      },
      {
        es: "Plataforma: API de extensiones de VS Code (VS Code 1.90+)",
        en: "Platform: VS Code extension API (VS Code 1.90+)",
      },
      {
        es: "Licencia: GPL-3.0 (fork de `vscode-ext-color-highlight`)",
        en: "License: GPL-3.0 (fork of `vscode-ext-color-highlight`)",
      },
    ],
    gallery: [
      {
        src: "/images/projects/color-highlight-v2/demo-vscode.webp",
        alt: {
          es: "VS Code con los colores resaltados en un archivo CSS real",
          en: "VS Code with the colors highlighted in a real CSS file",
        },
      },
      {
        src: "/images/projects/color-highlight-v2/main.webp",
        alt: {
          es: "Mockup de Color Highlight v2 con el logo y el eslogan de la extensión",
          en: "Color Highlight v2 mockup with the extension logo and tagline",
        },
      },
    ],
    cta: {
      es: "¿Tu editor se atasca al escribir y quieres una extensión que no pese? Hablemos.",
      en: "Does your editor choke while you type and do you want an extension that doesn't weigh much? Let's talk.",
    },
  },
  architecture: {
    name: {
      // Nombre de la extension: identidad a proposito.
      es: "Color Highlight v2",
      en: "Color Highlight v2",
    },
    description: {
      es: "Fork modernizado de vscode-ext-color-highlight (GPL-3.0): debounce añadido al motor, build con esbuild y 38 KB de artefacto.",
      en: "Modernized fork of vscode-ext-color-highlight (GPL-3.0): debounce added to the engine, esbuild build and a 38 KB artifact.",
    },
    children: [
      {
        name: {
          es: "Debounce de 150 ms",
          en: "150 ms debounce",
        },
        description: {
          es: "El motor deja de relanzar el escaneo completo en cada tecla, que era el atasco al escribir.",
          en: "The engine stops re-running the full scan on every keystroke, which was the lag while typing.",
        },
      },
      {
        name: {
          es: "Build con esbuild",
          en: "esbuild build",
        },
        description: {
          es: "Sustituye a webpack + babel + npm; sin transpilación intermedia.",
          en: "Replaces webpack + babel + npm; with no intermediate transpilation.",
        },
      },
      {
        name: {
          es: "Dependencias reducidas",
          en: "Reduced dependencies",
        },
        description: {
          es: "De 4 a 2 en runtime: color y color-name, sin @babel/runtime ni file-importer.",
          en: "From 4 to 2 at runtime: color and color-name, with no @babel/runtime or file-importer.",
        },
      },
      {
        name: {
          es: "Núcleo en TypeScript",
          en: "TypeScript core",
        },
        description: {
          es: "Motor, mapa de decoraciones, contraste e importer de Sass, con check-types en cada build.",
          en: "Engine, decoration map, contrast and Sass importer, with check-types on every build.",
        },
      },
      {
        name: {
          es: "Mapa de decoraciones",
          en: "Decoration map",
        },
        description: {
          es: "Ciclo de vida y dispose explícitos: corrige las fugas de memoria de decoraciones.",
          en: "Explicit lifecycle and dispose: fixes the decoration memory leaks.",
        },
      },
    ],
  },
};