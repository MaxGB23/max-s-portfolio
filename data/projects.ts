// Single source of truth for portfolio projects.
// Extracted from docs/projects/candidatos/*.md. Fields without real content
// stay as empty string or undefined — never invent data.
//
// Los tipos viven en ./projects/types.ts (shape bilingue `L` + el legacy `*Es`).
// Este archivo sigue siendo el modulo publico: reexporta los tipos, asi que
// ningun consumidor cambia su linea de import durante la migracion ficha por
// ficha. Las fichas ya migradas viven en ./projects/<id>.ts como `ProjectL` y se
// reensamblan aqui en el MISMO orden (el orden es contrato de layout); las que
// quedan siguen en `ProjectEs` hasta que cada una migre a `ProjectL`.

import type { ProjectEs, ProjectEntry } from "./projects/types";
import { caf } from "./projects/caf";
import { presidencia } from "./projects/presidencia";
import { funkyAi } from "./projects/funky-ai";
import { grinchmasKart } from "./projects/grinchmas-kart";
import { cumyxel } from "./projects/cumyxel";
import { oneClickTi } from "./projects/one-click-ti";
import { autoshop } from "./projects/autoshop";
import { colorHighlightV2 } from "./projects/color-highlight-v2";
import { funkyTheme } from "./projects/funky-theme";

export type {
  ProjectEs,
  ProjectDetailEs,
  ProjectMetricEs,
  ProjectImageEs,
  ArchitectureNodeEs,
  ProjectLinkEs,
  ProjectL,
  ProjectEntry,
  MetricL,
  NodeL,
  LinkL,
  ProjectImageL,
  L,
  Localized,
} from "./projects/types";

export { localizeProject } from "./projects/types";

// Alias de compatibilidad hacia los nombres sin sufijo. Sobreviven al renombre
// `*Es` para que ningun consumidor tenga que editar su import durante la
// migracion (p.ej. `components/project-architecture.tsx` importa `ArchitectureNode`).
// Mueren con `ProjectEs` en T12.
export type {
  ProjectEs as Project,
  ProjectDetailEs as ProjectDetail,
  ProjectMetricEs as ProjectMetric,
  ProjectImageEs as ProjectImage,
  ArchitectureNodeEs as ArchitectureNode,
  ProjectLinkEs as ProjectLink,
} from "./projects/types";

export const projects: ProjectEntry[] = [
  caf,
  presidencia,
  funkyAi,
  grinchmasKart,
  cumyxel,
  oneClickTi,
  autoshop,
  colorHighlightV2,
  funkyTheme,
];

export function getProjectById(id: string): ProjectEntry | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): ProjectEntry[] {
  return projects.filter((project) => project.featured);
}
