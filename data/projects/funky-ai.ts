// Ficha `funky-ai` en el shape bilingue `ProjectL`.
//
// Copy ES VERBATIM: es el copy editorial ya auditado contra el repo real
// (docs/projects/candidatos/funky-ai.md). No se reescribe ni se "mejora": la
// hoja `en` va al lado, nunca dentro del texto de origen.
//
// CONTRATO DE ORDEN (ver ProjectL.detail.metrics): `metrics[0]` es la metrica
// raiz del detail, y el orden de `metrics`, `role`, `solution` y `gallery` es
// contrato de layout (KpiGrid de 2 columnas, nodo raiz de la topologia). No
// reordenar al anadir el `en`.
//
// HONESTIDAD DE ESTADO (summary + solution[3] + la hoja ODD): el ES afirma que
// ODD "no esta implementado, se plantea como linea futura". El EN conserva esa
// misma honestidad: nunca presenta ODD como algo entregado.
//
// `metrics[5]` es un valor cualitativo ("Asistido"), no una cifra: el EN traduce
// el significado ("Assisted"), no la palabra suelta.

import type { ProjectL } from "./types";

export const funkyAi: ProjectL = {
  id: "funky-ai",
  title: {
    // Nombre propio del producto: identidad a proposito.
    es: "Funky AI",
    en: "Funky AI",
  },
  category: {
    // "Dev Tools" y "AI Engineering" ya son los terminos del sector en ingles.
    es: "Dev Tools / AI Engineering",
    en: "Dev Tools / AI Engineering",
  },
  hook: {
    es: "CLI modular `funky` con 10 comandos para planificar, construir y endurecer proyectos con proceso repetible.",
    en: "Modular `funky` CLI with 10 commands to plan, build and harden projects with a repeatable process.",
  },
  metric: {
    es: "10 comandos · 443 tests · 27 reglas",
    en: "10 commands · 443 tests · 27 rules",
  },
  // Stack names: no se traducen.
  tags: ["Node.js", "TypeScript", "CLI", "pnpm", "Vitest", "GitHub Actions"],
  image: "/images/projects/funky-ai/funky-ai-main.webp",
  imageAlt: {
    es: "Terminal del CLI de funky-ai mostrando el pipeline SDD",
    en: "funky-ai CLI terminal showing the SDD pipeline",
  },
  links: [
    {
      label: {
        es: "Ver código",
        en: "View code",
      },
      kind: "code",
      url: "https://github.com/MaxGB23/funky-ai",
      external: true,
    },
  ],
  detail: {
    headline: {
      es: "De idea a release con proceso, en un solo CLI",
      en: "From idea to release with a process, in a single CLI",
    },
    summary: {
      es: "funky-ai es un solo CLI con 10 comandos independientes para planificar, construir y endurecer proyectos sin imponer memoria ni interfaz gráfica; se instala por clonar + symlink con pnpm (npm no publicado, pnpm-first). Deja una base mínima para arrancar, solo inyecta OpenSpec cuando se pide con `funky sdd install`, y Forge ayuda a aprender a planificar y a saber cómo cobrar con asesoría de IA. Secure es asistido y honesto: diagnostica y recomienda sin bloquear por defecto. SDD se conserva como metodología vigente; ODD no está implementado, se plantea como línea futura: cada fase SDD equivaldría a una tarea ODD con su work-unit commit.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      // ODD sigue declarado como NO implementado, igual que en el ES.
      en: "funky-ai is a single CLI with 10 independent commands to plan, build and harden projects without imposing memory or a graphical interface; it installs by clone + symlink with pnpm (npm not published, pnpm-first). It leaves a minimal base to start from, injects OpenSpec only when requested with `funky sdd install`, and Forge helps you learn to plan and how to price AI-assisted work. Secure is assisted and honest: it diagnoses and recommends without blocking by default. SDD stays as the current methodology; ODD is not implemented and is proposed as a future direction: each SDD phase would map to an ODD task with its own work-unit commit.",
    },
    metrics: [
      {
        // metrics[0] = metrica RAIZ del detail (nodo raiz de la topologia).
        value: {
          es: "10",
          // Cifra pura: se traduce por identidad (no hay palabra que traducir).
          en: "10",
        },
        label: {
          es: "comandos en un solo CLI para planificar, construir y asegurar",
          en: "commands in a single CLI to plan, build and secure",
        },
      },
      {
        value: {
          es: "47+7",
          // Cifra pura: se traduce por identidad.
          en: "47+7",
        },
        label: {
          es: "plantillas base para arrancar cualquier proyecto en minutos",
          en: "base templates to start any project in minutes",
        },
      },
      {
        value: {
          es: "27",
          // Cifra pura: se traduce por identidad.
          en: "27",
        },
        label: {
          es: "reglas de IA que ordenan el trabajo entre agente y humano",
          en: "AI rules that structure the work between agent and human",
        },
      },
      {
        value: {
          es: "443",
          // Cifra pura: se traduce por identidad.
          en: "443",
        },
        label: {
          es: "pruebas automatizadas con Vitest en verde que cuidan cada cambio en 36 archivos",
          en: "automated Vitest tests, all passing, that protect every change across 36 files",
        },
      },
      {
        value: {
          es: "3",
          // Cifra pura: se traduce por identidad.
          en: "3",
        },
        label: {
          es: "acciones de CI fijadas por SHA",
          en: "CI actions pinned by SHA",
        },
      },
      {
        // Valor cualitativo, no cifra: se traduce el significado.
        value: {
          es: "Asistido",
          en: "Assisted",
        },
        label: {
          es: "revisión de dependencias que avisa antes de instalar algo riesgoso",
          en: "dependency review that warns you before installing something risky",
        },
      },
    ],
    visual: {
      src: "/images/projects/funky-ai/funky-ai-main.webp",
      alt: {
        // Nombre del logo: identidad a proposito.
        es: "Funky-AI logo",
        en: "Funky-AI logo",
      },
    },
    problem: {
      es: "Las tareas grandes de IA asistida que arrancan de un único prompt masivo fallan de forma predecible: la ventana de contexto se desborda, el modelo alucina sobre partes que ya no recuerda y no hay punto natural de intervención humana. Los agentes no tienen memoria confiable entre sesiones, cada sesión re-aprende desde cero recargando contexto caro, y la planificación de proyectos ocurre ad-hoc, después de elegir el stack.",
      en: "Large AI-assisted tasks that start from a single massive prompt fail predictably: the context window overflows, the model hallucinates about parts it no longer remembers, and there is no natural point for human intervention. Agents have no reliable memory between sessions, each session relearns from scratch by reloading expensive context, and project planning happens ad hoc, after the stack has been chosen.",
    },
    role: [
      {
        es: "Diseñé el ecosistema CLI completo: pipeline SDD con contexto just-in-time y separación orquestador/sub-agentes.",
        en: "Designed the complete CLI ecosystem: SDD pipeline with just-in-time context and orchestrator/sub-agent separation.",
      },
      {
        es: "Construí funkygram (memoria persistente), funky-forge (planificación) y funky secure (hardening de dependencias).",
        en: "Built funkygram (persistent memory), funky-forge (planning) and funky secure (dependency hardening).",
      },
      {
        es: "Apliqué TDD con Vitest y workflow issue-first desde el inicio: cada cambio rastreado a un issue triado.",
        en: "Applied TDD with Vitest and an issue-first workflow from the start: every change traced back to a triaged issue.",
      },
      {
        es: "Mantuve CI/CD con GitHub Actions (SHA fijados por seguridad) y documentación viva verificada contra el CLI real.",
        en: "Maintained CI/CD with GitHub Actions (SHAs pinned for security) and living documentation verified against the real CLI.",
      },
    ],
    solution: [
      {
        // Cada `**Label**` abre y cierra aqui, igual que en el ES.
        es: "**Scaffold base mínima para arrancar** — deja lo justo para empezar un proyecto en minutos, con estructura interoperable. No impone metodología; funciona con la memoria que ya tengas.",
        en: "**Minimal scaffold to get started** — provides just enough to begin a project in minutes, with an interoperable structure. It imposes no methodology; it works with the memory you already have.",
      },
      {
        es: "**funkygram, memoria persistente opcional** — guarda el conocimiento del proyecto en archivos Markdown dentro del repo, organizado por temas con índice central. Es opcional: si ya tienes otra memoria, la respeta; las sesiones dejan de reaprender desde cero.",
        en: "**funkygram, optional persistent memory** — stores project knowledge in Markdown files inside the repo, organized by topic with a central index. It is optional: if you already have another memory, it respects it; sessions stop relearning from scratch.",
      },
      {
        // ODD sigue declarado como NO implementado: el EN no lo vende como feature.
        es: "**Framework SDD propio con prompt based harnesses** — pipeline por fases (proposal, specs, design, tasks, apply, verify, archive) con 27 reglas que ordenan la delegación entre orquestador y sub-agentes, cargando contexto solo cuando se necesita. Es la base de mi experiencia creando harnesses a medida y adaptándome a cada modelo y plataforma. SDD sigue vigente; ODD no está implementado, se plantea como línea futura.",
        en: "**Own SDD framework with prompt-based harnesses** — phased pipeline (proposal, specs, design, tasks, apply, verify, archive) with 27 rules that structure delegation between the orchestrator and sub-agents, loading context only when it is needed. It is the base of my experience building custom harnesses and adapting to each model and platform. SDD stays current; ODD is not implemented and is proposed as a future direction.",
      },
      {
        es: "**OpenSpec solo cuando se pide** — solo un comando instala OpenSpec; el resto del CLI no lo impone ni lo mezcla con la base inicial.",
        en: "**OpenSpec only when requested** — a single command installs OpenSpec; the rest of the CLI neither imposes it nor mixes it with the initial base.",
      },
      {
        es: "**Forge para aprender a planificar y saber cómo cobrar** — prepara material de planificación, revisión de arquitectura y estimación de costos con asesoría de IA. La herramienta ordena las ideas, no decide por ti.",
        en: "**Forge to learn planning and how to price work** — prepares planning material, architecture review and cost estimation for AI-assisted work. The tool organizes your ideas, it does not decide for you.",
      },
      {
        es: "**Secure asistido honesto** — diagnostica dependencias y recomienda buenas prácticas. La cuarentena y la revisión de secretos funcionan como guía asistida, no como bloqueo automático.",
        en: "**Honest assisted security** — diagnoses dependencies and recommends best practices. Quarantine and secret review work as an assisted guide, not as an automatic block.",
      },
      {
        es: "**Prácticas** — sin código sin issue previo, pruebas con Vitest, integración continua con SHA fijados, versiones ordenadas con notas de cambio y documentación verificada contra el CLI real. El mismo flujo sirve a personas y a agentes: en terminal pregunta antes de sobrescribir, en CI falla de forma documentada; si no puede comprobar el estado, no sobrescribe. Objetivos de diseño, no medidos: menos tokens con contexto justo a tiempo, menos costo de recordar, más rápido de idea difusa a arquitectura costeada y menos riesgo en dependencias.",
        en: "**Practices** — no code without a prior issue, tests with Vitest, continuous integration with pinned SHAs, ordered releases with changelogs and documentation verified against the real CLI. The same flow serves people and agents: in the terminal it asks before overwriting, in CI it fails in a documented way; if it cannot verify the state, it does not overwrite. Design goals, not measurements: fewer tokens with just-in-time context, lower cost of recalling, faster from vague idea to costed architecture and less dependency risk.",
      },
    ],
    stack: [
      {
        es: "Lenguaje / Runtime: Node.js, TypeScript",
        en: "Language / Runtime: Node.js, TypeScript",
      },
      {
        // "Package manager" ya es la palabra inglesa: identidad a proposito.
        es: "Package manager: pnpm",
        en: "Package manager: pnpm",
      },
      {
        es: "CLI: sin interfaz gráfica",
        en: "CLI: no graphical interface",
      },
      {
        // "Red -> Green -> Refactor" son las fases de TDD, ya en ingles.
        es: "Testing: Vitest (TDD, Red → Green → Refactor)",
        en: "Testing: Vitest (TDD, Red → Green → Refactor)",
      },
      {
        es: "CI/CD: GitHub Actions (SHA fijados por seguridad)",
        en: "CI/CD: GitHub Actions (SHAs pinned for security)",
      },
      {
        es: "Memoria: archivos Markdown por temas + índice central",
        en: "Memory: Markdown files by topic + central index",
      },
      {
        es: "Pipeline: plantillas SDD en Markdown, contexto justo a tiempo",
        en: "Pipeline: SDD templates in Markdown, just-in-time context",
      },
      {
        es: "Capa agéntica: 27 reglas de trabajo entre agente y humano + formato fijo de lecciones",
        en: "Agentic layer: 27 work rules between agent and human + fixed lesson format",
      },
    ],
    gallery: [
      {
        src: "/images/projects/funky-ai/funky-forge.webp",
        alt: {
          es: "Pipeline Funky Forge",
          en: "Funky Forge pipeline",
        },
      },
      {
        src: "/images/projects/funky-ai/funky-secure-neon-diagram.webp",
        alt: {
          es: "Vista general de Funky Secure",
          en: "Funky Secure overview",
        },
      },
      {
        src: "/images/projects/funky-ai/funkygram-neon.webp",
        alt: {
          es: "Interfaz de terminal de Funkygram",
          en: "Funkygram terminal interface",
        },
      },
      {
        src: "/images/projects/funky-ai/funky-sdd-neon.webp",
        alt: {
          es: "Ejecución del pipeline SDD de funky-ai",
          en: "funky-ai SDD pipeline run",
        },
      },
    ],
    cta: {
      es: "¿Buscas incorporar IA en tu flujo de desarrollo con proceso y sin caos? Este framework es mi laboratorio público.",
      en: "Looking to bring AI into your development workflow with process and without chaos? This framework is my public lab.",
    },
  },
  architecture: {
    name: {
      // Nombre propio del producto: identidad a proposito.
      es: "funky-ai",
      en: "funky-ai",
    },
    description: {
      es: "Ecosistema de un solo CLI en Node.js con pnpm y sin interfaz gráfica: une reglas de trabajo con IA, plantillas de planificación y herramientas de costos en un único punto de entrada.",
      en: "Single-CLI ecosystem in Node.js with pnpm and no graphical interface: it brings together AI work rules, planning templates and cost tools at a single entry point.",
    },
    children: [
      {
        name: {
          // Nombre del subsistema: identidad a proposito.
          es: "SDD framework",
          en: "SDD framework",
        },
        description: {
          es: "Proceso por fases con documentos Markdown y contexto justo a tiempo; las decisiones delicadas siempre piden confirmación humana.",
          en: "Phased process with Markdown documents and just-in-time context; delicate decisions always require human confirmation.",
        },
        children: [
          {
            // Los nombres de fase del pipeline son tokens literales del comando.
            name: {
              es: "Pipeline de fases (proposal → specs → design → tasks → apply → verify → archive)",
              en: "Phase pipeline (proposal → specs → design → tasks → apply → verify → archive)",
            },
          },
          {
            // "Insano" es el nombre real del tier T3 en el CLI, no una palabra
            // traducible: identidad a proposito.
            name: {
              es: "3 tiers: T1 Flash, T2 Standard, T3 Insano",
              en: "3 tiers: T1 Flash, T2 Standard, T3 Insano",
            },
          },
          {
            // Los nombres de modo son tokens literales del comando.
            name: {
              es: "3 modos de ejecución: Interactive, Auto, Handoff",
              en: "3 execution modes: Interactive, Auto, Handoff",
            },
          },
          {
            name: {
              es: "Puertas humanas antes de Git y operaciones destructivas",
              en: "Human gates before Git and destructive operations",
            },
          },
        ],
      },
      {
        name: {
          // Nombre del subsistema: identidad a proposito.
          es: "funkygram",
          en: "funkygram",
        },
        description: {
          es: "Memoria persistente en archivos Markdown dentro del repo, organizada por temas con formato fijo de lecciones e índice central que se actualiza solo.",
          en: "Persistent memory in Markdown files inside the repo, organized by topic with a fixed lesson format and a central index that updates itself.",
        },
        children: [
          {
            name: {
              es: "Shards O(1) por categoría",
              en: "O(1) shards per category",
            },
          },
          {
            // What/Why/Where/Learned son las claves literales del esquema.
            name: {
              es: "Esquema What/Why/Where/Learned",
              en: "Schema What/Why/Where/Learned",
            },
          },
          {
            name: {
              es: "Índice central auto-actualizado",
              en: "Self-updating central index",
            },
          },
        ],
      },
      {
        name: {
          // Nombre del subsistema: identidad a proposito.
          es: "funky-forge",
          en: "funky-forge",
        },
        description: {
          es: "De idea difusa a plan con costos; la herramienta prepara material para aprender a planificar y saber cómo cobrar, no decide por ti.",
          en: "From a vague idea to a costed plan; the tool prepares material to learn planning and how to price work, it does not decide for you.",
        },
        children: [
          {
            // "init" es el nombre literal del subcomando.
            name: {
              es: "init (canvases de proyecto e infra)",
              en: "init (project and infra canvases)",
            },
          },
          {
            name: {
              es: "assess (revisión de arquitectura con registro de decisiones)",
              en: "assess (architecture review with a decision record)",
            },
          },
          {
            name: {
              es: "estimate (guía de costos con buffers y TCO)",
              en: "estimate (cost guide with buffers and TCO)",
            },
          },
          {
            name: {
              es: "pipeline (estado compartido entre fases)",
              en: "pipeline (state shared across phases)",
            },
          },
        ],
      },
      {
        name: {
          // Nombre del subsistema: identidad a proposito.
          es: "funky secure",
          en: "funky secure",
        },
        description: {
          es: "Cuidado de dependencias con pnpm: diagnostica y recomienda como guía asistida, sin bloquear por defecto.",
          en: "Dependency care with pnpm: it diagnoses and recommends as an assisted guide, without blocking by default.",
        },
        children: [
          {
            // "doctor" es el nombre literal del subcomando.
            name: {
              es: "doctor (diagnóstico read-only)",
              en: "doctor (read-only diagnostics)",
            },
          },
          {
            name: {
              es: "init (política idempotente)",
              en: "init (idempotent policy)",
            },
          },
          {
            name: {
              es: "check (gate CI fail-closed)",
              en: "check (fail-closed CI gate)",
            },
          },
        ],
      },
      {
        name: {
          es: "Capa de contratos agénticos",
          en: "Agentic contract layer",
        },
        description: {
          es: "27 reglas que ordenan el trabajo entre agente y humano y solo cargan contexto cuando se necesita.",
          en: "27 rules that structure the work between agent and human and load context only when it is needed.",
        },
        children: [
          {
            name: {
              es: "7 contratos T2 por fase",
              en: "7 T2 contracts per phase",
            },
          },
          {
            name: {
              es: "9 workflows T3",
              en: "9 T3 workflows",
            },
          },
          {
            name: {
              es: "Contratos de exploración y memoria",
              en: "Exploration and memory contracts",
            },
          },
          {
            name: {
              es: "Carga just-in-time",
              en: "Just-in-time loading",
            },
          },
        ],
      },
      {
        name: {
          es: "Prácticas",
          en: "Practices",
        },
        description: {
          es: "Disciplina transversal que mantiene el proceso honesto: sin código sin issue previo, integración continua, releases ordenados y pruebas primero.",
          en: "Cross-cutting discipline that keeps the process honest: no code without a prior issue, continuous integration, ordered releases and tests first.",
        },
        children: [
          {
            name: {
              es: "Issue-first (no hay código sin issue)",
              en: "Issue-first (no code without an issue)",
            },
          },
          {
            name: {
              es: "CI con GitHub Actions (toolchain pineado a SHAs)",
              en: "CI with GitHub Actions (toolchain pinned to SHAs)",
            },
          },
          {
            name: {
              es: "Releases estructurados y docs vivas",
              en: "Structured releases and living docs",
            },
          },
          {
            name: {
              // TDD y Vitest: se traduce la preposicion, los nombres no.
              es: "TDD con Vitest",
              en: "TDD with Vitest",
            },
          },
        ],
      },
    ],
  },
};