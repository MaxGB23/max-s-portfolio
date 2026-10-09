// Single source of truth for portfolio projects.
// Extracted from docs/projects/candidatos/*.md. Fields without real content
// stay as empty string or undefined — never invent data.
//
// Modulo publico del data layer: cada ficha vive en su propio archivo
// ./projects/<id>.ts y aqui solo se reensamblan en el MISMO orden (el orden es
// contrato de layout). Los tipos viven en ./projects/types.ts y se reexportan
// desde aqui para que ningun consumidor tenga que bajar a la carpeta interna.

import type { ProjectL } from "./projects/types";
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
  ProjectL,
  MetricL,
  NodeL,
  LinkL,
  ProjectImageL,
  L,
  Localized,
  LocalizedProjectImage,
  LocalizedMetric,
  LocalizedLink,
  LocalizedNode,
} from "./projects/types";

export { localizeProject } from "./projects/types";

// Alias sin sufijo hacia los tipos YA LOCALIZADOS. Los componentes de render
// reciben la ficha despues de `localizeProject`, asi que el tipo que necesitan
// tiene las hojas en `string` — nunca en `L`.
export type {
  LocalizedProjectImage as ProjectImage,
  LocalizedMetric as ProjectMetric,
  LocalizedLink as ProjectLink,
  LocalizedNode as ArchitectureNode,
} from "./projects/types";

export const projects: ProjectL[] = [
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

export function getProjectById(id: string): ProjectL | undefined {
  return projects.find((project) => project.id === id);
}

export function getFeaturedProjects(): ProjectL[] {
  return projects.filter((project) => project.featured);
}
