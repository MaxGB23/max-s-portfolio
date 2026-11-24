// Ficha `funky-secure` en el shape bilingue `ProjectL`.
//
// FUENTE UNICA: docs/projects/drafts/portfolio-funky-ai/funky-secure.md (el
// borrador del producto, en ingles) mas la mencion de legacy que ya vive en
// `data/projects/funky-ai.ts` (`detail.solution` y `architecture`). La hoja ES
// ordena y traduce ese material; la `en` va al lado. No se reescribe la ficha
// del hub (S6).
//
// SIN CIFRAS (S9): el borrador solo trae un "~30% reduction" que el propio
// documento firma como "author estimate ... not externally benchmarked". Una
// estimacion del autor no es una medicion, asi que `detail.metrics` va VACIO.
// Las cifras que si aparecen en el copy (las 72 h de cuarentena y las 7 claves
// de la politica) son valores documentados del estandar, no estimaciones.
//
// SIN `home` (S2): secure vive en el catalogo y no en la home. La media es el
// diagrama de la auditoria de cadena de suministro, dibujado para esta ficha; no
// es una captura del producto y no reusa nada del hub (S7).

import { MEDIA_FIT_CONTAIN, type ProjectL } from "./types";

export const funkySecure: ProjectL = {
  id: "funky-secure",
  title: {
    // Nombre propio del producto: identidad a proposito.
    es: "funky secure",
    en: "funky secure",
  },
  category: {
    // Categoria propia: no hereda "AI Engineering" porque el producto cuida la
    // cadena de suministro de dependencias, no el flujo de IA.
    es: "Dev Tools / Seguridad de dependencias",
    en: "Dev Tools / Dependency Security",
  },
  hook: {
    es: "CLI que endurece la postura de dependencias de un repo pnpm: doctor diagnostica sin escribir nada, init aplica el estándar de forma idempotente y check es un gate de CI que falla cerrado.",
    en: "CLI that hardens the dependency posture of a pnpm repository: doctor diagnoses without writing anything, init applies the standard idempotently and check is a CI gate that fails closed.",
  },
  metric: {
    es: "Diagnóstico, política idempotente y gate de CI para dependencias pnpm",
    en: "Diagnostics, idempotent policy and a CI gate for pnpm dependencies",
  },
  // Stack names: no se traducen.
  tags: ["Node.js", "TypeScript", "CLI", "pnpm"],
  image: "/images/projects/funky-secure/main.jpg",
  imageAlt: {
    es: "Diagrama de la auditoria de cadena de suministro de funky-secure: las fuentes que lee, las reglas sin estado, el veredicto y el plan de hallazgos",
    en: "Diagram of the funky-secure supply-chain audit: the sources it reads, the stateless rules, the verdict and the findings plan",
  },
  // La media es un diagrama con texto legible, no una captura: recortarla corta
  // el titulo a mitad de palabra. `contain` la ajusta al marco con un inset.
  mediaFit: MEDIA_FIT_CONTAIN,
  status: "pre-release",
  lineage: "funky-ai",
  links: [],
  detail: {
    headline: {
      es: "Las dependencias se endurecen antes de instalar, no después de auditar",
      en: "Dependencies get hardened before installing, not after auditing",
    },
    summary: {
      es: "funky secure endurece la postura de dependencias de un repositorio pnpm con tres comandos: doctor diagnostica el estado sin escribir nada y recomienda el comando exacto; init aplica el estándar de forma idempotente, o sea que se puede volver a correr sin daño; y check es un gate de cumplimiento listo para CI que falla cerrado si una sonda no puede verificar el estado. La filosofía es defensa en profundidad centrada en la persona: una capa global mínima en la máquina del usuario, que solo contiene lo que ningún repo querría desactivar, y el estándar completo aplicado de forma uniforme por repo, con la línea base de hooks vigilada por drift.",
      // La copia ES no lleva pares `**`: el EN tampoco los inventa (docs/i18n.md:25).
      en: "funky secure hardens the dependency posture of a pnpm repository with three commands: doctor diagnoses the state without writing anything and recommends the exact command; init applies the standard idempotently, meaning it can be re-run safely; and check is a CI-ready compliance gate that fails closed when a probe cannot verify the state. The philosophy is defense-in-depth centered on the person: a minimal global layer on the user's machine, containing only what no repository would ever want to turn off, plus the full standard applied uniformly per repo, with the hook baseline watched for drift.",
    },
    // Vacio a proposito: el borrador no trae una cifra medida (ver cabecera).
    metrics: [],
    problem: {
      es: "Los ataques a la cadena de suministro no se llevan código: se llevan credenciales, y lo hacen en el momento de instalar. Los scripts de ciclo de vida de una dependencia corren al ejecutar `pnpm install`, justo en la ventana que `npm audit` no cubre, porque cuando se audita el script ya se ejecutó. Las versiones recién publicadas son la ventana clásica de infección, y un secreto commiteado es la fuga de credenciales que ni siquiera necesita un paquete malicioso.",
      en: "Supply-chain attacks do not steal code: they steal credentials, and they do it at install time. A dependency's lifecycle scripts run the moment you run `pnpm install`, exactly in the window `npm audit` does not cover, because by the time you audit the script has already run. Freshly published versions are the classic infection window, and a committed secret is the credential leak that does not even need a malicious package.",
    },
    role: [
      {
        es: "Escribí los tres comandos y su separación de responsabilidades: `doctor` no escribe nada, `init` es idempotente y `check` es un gate que falla cerrado.",
        en: "Wrote the three commands and their separation of duties: `doctor` writes nothing, `init` is idempotent and `check` is a gate that fails closed.",
      },
      {
        es: "Implementé la verificación conductual de la cuarentena: en lugar de confiar en la introspección de configuración, la sonda comprueba si el resolver realmente rechaza versiones inmaduras.",
        en: "Implemented behavioral quarantine verification: instead of trusting configuration introspection, the probe checks whether the resolver actually rejects immature versions.",
      },
      {
        es: "Construí el merge de la política preservando claves, comentarios y `packages:` existentes: un valor en conflicto se conserva y se reporta, nunca se pisa.",
        en: "Built the policy merge so existing keys, comments and `packages:` are preserved: a conflicting value is kept and reported, never overwritten.",
      },
      {
        es: "Diseñé el gate para que reporte violaciones por código y falle cerrado ante un error de sonda, además de exigir una decisión de postura explícita en `init` cuando no hay TTY.",
        en: "Designed the gate to report violations by code and to fail closed on a probe failure, plus to require an explicit posture choice in `init` when there is no TTY.",
      },
    ],
    solution: [
      {
        // Cada `**Label**` abre y cierra aqui, igual que en el ES.
        es: "**doctor, diagnóstico de solo lectura** — detecta la versión activa de pnpm de forma conductual, el estado de la cuarentena, instalaciones duplicadas en el PATH y señales del repo como rangos flotantes, `.env*` rastreados por git o drift en la línea base de hooks; después recomienda el comando exacto.",
        en: "**doctor, read-only diagnostics** — detects the active pnpm version behaviorally, the quarantine status, duplicate installs on PATH and repo signals such as floating ranges, `.env*` tracked by git or drift in the hook baseline; then it recommends the exact command.",
      },
      {
        es: "**init, estándar idempotente** — fusiona la semilla de postura de 7 claves en `pnpm-workspace.yaml`, agrega el bloque de gestor de paquetes a `AGENTS.md` detrás de un marcador sin duplicar contenido, guarda la línea base de hooks, ignora `.funky/` y fija `packageManager`.",
        en: "**init, idempotent standard** — merges the 7-key posture seed into `pnpm-workspace.yaml`, appends the package-manager block to `AGENTS.md` behind a marker without duplicating content, snapshots the hook baseline, ignores `.funky/` and pins `packageManager`.",
      },
      {
        es: "**check, gate de CI que falla cerrado** — reporta violaciones por código (`missing-lockfile`, `floating-ranges`, `quarantine-inactive`, `env-tracked`, `hook-drift` y el resto) y devuelve 0 o 1; si una sonda no puede verificar el estado, falla cerrado en lugar de aprobar.",
        en: "**check, a CI gate that fails closed** — reports violations by code (`missing-lockfile`, `floating-ranges`, `quarantine-inactive`, `env-tracked`, `hook-drift` and the rest) and returns 0 or 1; if a probe cannot verify the state, it fails closed instead of passing.",
      },
      {
        es: "**Dos planos de defensa** — la única capa global permitida es la que ningún repo querría desactivar, y todo lo que un repo podría querer sobrescribir vive por repo. Un mandato global se termina puenteando y entonces no protege a nadie.",
        en: "**Two planes of defense** — the only permitted global layer is the one no repository would ever want to turn off, and anything a repo might want to override lives per repo. A global mandate ends up bypassed and then protects nobody.",
      },
      {
        es: "**Nunca mutar la máquina del usuario** — el CLI diagnostica, recomienda el comando exacto y verifica que se aplicó; jamás fija variables de entorno ni configuración global, para no ampliar su propia superficie de ataque.",
        en: "**Never mutate the user's machine** — the CLI diagnoses, recommends the exact command and verifies it was applied; it never sets environment variables or global configuration, so it does not widen its own attack surface.",
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
        es: "Gestor de paquetes: pnpm (estándar asumido)",
        en: "Package manager: pnpm (the assumed standard)",
      },
      {
        es: "Política: `pnpm-workspace.yaml` con postura de 7 claves",
        en: "Policy: `pnpm-workspace.yaml` with the 7-key posture",
      },
      {
        es: "Estado local: `.funky/secure-state.json` (línea base de hooks)",
        en: "Local state: `.funky/secure-state.json` (hook baseline)",
      },
    ],
    // Sin captura propia todavia: el fallback de la ficha es render-safe.
    gallery: [],
    cta: {
      es: "¿Tu repositorio instala dependencias nuevas sin cuarentena y sin un gate que verifique la postura antes del merge?",
      en: "Does your repository install fresh dependencies without a quarantine and without a gate checking the posture before merge?",
    },
  },
};
