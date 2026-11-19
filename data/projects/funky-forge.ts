// Ficha `funky-forge` en el shape bilingue `ProjectL`.
//
// FUENTE UNICA: docs/projects/drafts/portfolio-funky-ai/funky-forge.md (el
// borrador del producto, en ingles) mas la mencion de legacy que ya vive en
// `data/projects/funky-ai.ts` (`detail.solution` y `architecture`). La hoja ES
// ordena y traduce ese material; la `en` va al lado. No se reescribe la ficha
// del hub (S6).
//
// CIFRAS: desde la publicacion de la `0.2.0` (2026-11-11) la fuente de los
// numeros es `docs/projects/candidatos/portfolio-npm-launch-forge.md`, revisado
// contra el registro y el repo el 2026-11-18. Siguen fuera las estimaciones del
// autor (S9): el borrador del producto solo traia un "~50% faster" que el propio
// documento firma como estimacion, no como medicion. Las cuatro metricas son
// hechos medidos: fases del metodo, archivos del paquete, tests de la suite y
// credenciales.
//
// SIN `home` (S2): forge vive en el catalogo y no en la home. La media es el
// diagrama del flujo de estimacion, dibujado para esta ficha; no es una captura
// del producto y no reusa nada del hub (S7).

import { MEDIA_FIT_CONTAIN, linkLabelCode, type ProjectL } from "./types";

export const funkyForge: ProjectL = {
  id: "funky-forge",
  title: {
    // Nombre propio del producto: identidad a proposito.
    es: "funky-forge",
    en: "funky-forge",
  },
  category: {
    // Misma familia que el hub: "Dev Tools" y "AI Engineering" ya son los
    // terminos del sector en ingles, traducirlos seria inventar jerga.
    es: "Dev Tools / AI Engineering",
    en: "Dev Tools / AI Engineering",
  },
  hook: {
    es: "CLI que convierte una idea difusa en un plan con arquitectura revisada y costos estimados: init, assess, estimate y pipeline, cada uno con su documento Markdown revisable.",
    en: "CLI that turns a fuzzy idea into a plan with a reviewed architecture and estimated costs: init, assess, estimate and pipeline, each with its own reviewable Markdown document.",
  },
  metric: {
    es: "De idea difusa a arquitectura costeada, con las decisiones escritas",
    en: "From a fuzzy idea to a costed architecture, with the decisions written down",
  },
  // Stack names: no se traducen.
  tags: ["Node.js", "TypeScript", "CLI", "pnpm", "Markdown"],
  image: "/images/projects/funky-forge/main.jpg",
  imageAlt: {
    es: "Diagrama del flujo de estimacion de funky-forge: artefactos, revision por pares, checklist automatico y motor de precios PERT",
    en: "Diagram of the funky-forge estimation workflow: artifacts, peer review, automated checklist and a PERT pricing engine",
  },
  // La media es un diagrama con texto legible, no una captura: recortarla corta
  // el titulo a mitad de palabra. `contain` la muestra entera, sin recortar.
  mediaFit: MEDIA_FIT_CONTAIN,
  // Publicado: `funky-forge@0.2.0` esta en el registro desde el 2026-11-11, asi
  // que el estado vuelve al default (`active`) y no lleva sello. `pre-release`
  // describia la etapa previa a publicar; hoy seria un claim falso en la UI.
  lineage: "funky-ai",
  links: [
    {
      label: linkLabelCode,
      kind: "code",
      url: "https://github.com/MaxGB23/funky-forge",
      external: true,
    },
    {
      // Sin `kind`: no es un demo ni un landing, y un kind desconocido cae al
      // icono generico de enlace externo (project-detail, `linkIcon`).
      label: { es: "Ver en npm", en: "View on npm" },
      url: "https://www.npmjs.com/package/funky-forge",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "De la idea difusa al plan con costos, antes de escribir código",
      en: "From a fuzzy idea to a costed plan, before writing any code",
    },
    summary: {
      es: "funky-forge ordena la fase previa al código en una secuencia de comandos, y cada uno produce un artefacto Markdown que se puede revisar: los canvases de proyecto e infraestructura primero, después la revisión de arquitectura con su registro de decisiones, y por último la guía de costos de infraestructura con factores, buffers y TCO. El CLI prepara el material y no pretende juzgar arquitectura ni precios: la revisión y la conversación de costos ocurren en una sesión de IA guiada por los prompts generados, y lo decidido queda en archivos de decisión vivos. Las decisiones existentes nunca se sobrescriben solas, y `pipeline` comparte el estado entre assess y estimate para trabajo en equipo o repartido en varias sesiones.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "funky-forge structures the pre-code phase into a sequence of commands, and each one produces a Markdown artifact that can be reviewed: the project and infrastructure canvases first, then the architecture review with its decision record, and finally the infrastructure cost guide with cost factors, buffers and TCO. The CLI prepares the material and does not pretend to judge architecture or pricing: the review and the pricing conversation happen in an AI session guided by the generated prompts, and the outcomes live in living decision files. Existing decisions are never overwritten automatically, and `pipeline` shares the state between assess and estimate for team work or for work spread across several sessions.",
    },
    // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
    metrics: [
      {
        value: {
          // Cifra pura: se traduce por identidad.
          es: "4",
          en: "4",
        },
        label: {
          es: "fases con compuertas: problema, diseño, estimación y propuesta",
          en: "gated phases: problem, design, estimation and proposal",
        },
      },
      {
        value: {
          es: "39",
          en: "39",
        },
        label: {
          es: "archivos en el paquete publicado, versión 0.2.0",
          en: "files in the published package, version 0.2.0",
        },
      },
      {
        value: {
          es: "289",
          en: "289",
        },
        label: {
          es: "tests en 24 archivos, sin skips, sin relojes ni azar",
          en: "tests across 24 files, no skips, no clocks, no randomness",
        },
      },
      {
        value: {
          es: "0",
          en: "0",
        },
        label: {
          es: "credenciales en el repositorio y en los secretos de Actions",
          en: "credentials in the repository and in the Actions secrets",
        },
      },
    ],
    problem: {
      es: "La planificación es donde más proyectos se tuercen en silencio: una idea vaga salta directo al código sin una definición acordada de qué se construye ni para quién; la discusión de arquitectura no deja registro de decisiones; y los costos de infraestructura se adivinan tarde, cuando el stack ya está elegido. El resultado es un stack que nadie revisó, costos que nadie estimó y decisiones que nadie escribió.",
      en: "Planning is where most projects quietly go wrong: a vague idea jumps straight into code with no agreed definition of what is being built or for whom; the architecture discussion leaves no decision record; and infrastructure costs are guessed late, after the stack has already been chosen. The result is a stack nobody reviewed, costs nobody estimated, and decisions nobody wrote down.",
    },
    role: [
      {
        es: "Diseñé los cuatro comandos sobre un mismo contrato de manejo de archivos: un prompt solo aparece cuando la operación podría perder algo.",
        en: "Designed the four commands on a single file-handling contract: a prompt is only shown when the operation could lose something.",
      },
      {
        es: "Implementé la preservación de decisiones: canvases, patrones de riesgo y registros de decisiones nunca se sobrescriben; sin TTY las guías se omiten y las decisiones quedan intactas.",
        en: "Implemented decision preservation: canvases, risk patterns and decision records are never overwritten; without a TTY the guides are skipped and the decisions stay intact.",
      },
      {
        es: "Construí el pipeline con estado compartido en `context.json` (schema v2, con migración automática desde v1) y una salida `pipeline status --json` determinista para integraciones.",
        en: "Built the pipeline with state shared through `context.json` (schema v2, migrating v1 automatically) and a deterministic `pipeline status --json` output for integrations.",
      },
      {
        es: "Escribí la guía de costos con embedding aditivo por marcador: las secciones nuevas se agregan sin tocar las que ya existían.",
        en: "Wrote the cost guide with additive embedding by marker: new sections are appended without touching the existing ones.",
      },
    ],
    solution: [
      {
        // Cada `**Label**` abre y cierra aqui, igual que en el ES.
        es: "**init, el qué antes del cómo** — genera el brief funcional antes de los canvases técnicos, para que la definición del producto preceda a la elección del stack.",
        en: "**init, what before how** — generates the functional brief before the technical canvases, so the product definition precedes the stack choice.",
      },
      {
        es: "**assess, revisión de arquitectura con registro de decisiones** — arma la sesión con un prompt, una plantilla de decisiones y una referencia de patrones de riesgo que el equipo edita; los patrones son candidatos a evaluar, no riesgos confirmados.",
        en: "**assess, architecture review with a decision record** — prepares the session with a prompt, a decisions template and a team-editable risk-patterns reference; the patterns are candidates to evaluate, not confirmed risks.",
      },
      {
        es: "**estimate, costos antes de bloquear el stack** — cruza los canvases con las decisiones de arquitectura y produce una guía de discusión declarativa con factores de costo, buffers y TCO, más temas opcionales que se incrustan de forma aditiva.",
        en: "**estimate, costs before the stack is locked in** — crosses the canvases with the architecture decisions and produces a declarative discussion guide with cost factors, buffers and TCO, plus optional topic sections that embed additively.",
      },
      {
        es: "**pipeline, estado compartido entre fases** — orquesta assess y estimate con estado por fase, artefactos y errores; `pipeline assess` corre antes que `pipeline estimate`, y una fase interrumpida se reintenta sola.",
        en: "**pipeline, state shared across phases** — orchestrates assess and estimate with per-phase status, artifacts and errors; `pipeline assess` runs before `pipeline estimate`, and an interrupted phase re-runs on its own.",
      },
      {
        es: "**Contrato de retroalimentación** — un archivo nuevo se crea sin preguntar, una guía regenerable pregunta Y/N antes de actualizarse, una decisión existente nunca se sobrescribe y una operación aditiva corre sin preguntar porque nada se puede perder. \"El usuario declinó actualizar\" es una finalización exitosa, no un error.",
        en: "**Feedback contract** — a new file is created without asking, a regenerable guide asks Y/N before updating, an existing decision is never overwritten, and an additive operation runs without asking because nothing can be lost. \"The user declined to update\" is a successful completion, not an error.",
      },
    ],
    stack: [
      {
        es: "Entorno de ejecución: Node.js",
        en: "Runtime: Node.js",
      },
      {
        es: "Lenguaje: TypeScript",
        en: "Language: TypeScript",
      },
      {
        es: "Superficie: CLI sin interfaz gráfica",
        en: "Surface: CLI with no graphical interface",
      },
      {
        es: "Gestor de paquetes: pnpm",
        en: "Package manager: pnpm",
      },
      {
        es: "Artefactos: documentos Markdown revisables por comando",
        en: "Artifacts: reviewable Markdown documents per command",
      },
      {
        es: "Estado del pipeline: `context.json` con esquema versionado",
        en: "Pipeline state: `context.json` with a versioned schema",
      },
    ],
    // Sin captura propia todavia: el fallback de la ficha es render-safe.
    gallery: [],
    cta: {
      es: "¿Vas a arrancar un proyecto y todavía no está claro qué se construye, con qué stack ni cuánto cuesta la infraestructura?",
      en: "About to start a project and still unsure what gets built, with which stack, or what the infrastructure will cost?",
    },
  },
};
