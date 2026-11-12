/**
 * Agrupacion del catalogo `/proyectos` a partir de las fichas.
 *
 * Por que vive en `lib/` y NO dentro del componente: es una regla, no un
 * render. Asi se prueba sola en `node --test`
 * (`scripts/projects-catalog-page.test.mjs`) sin importar `data/projects.ts`,
 * cuyos imports no llevan extension y no resuelven fuera de Next.
 *
 * Estructura pura: el tipo de entrada es el minimo que la regla necesita
 * (`id`, `lineage`, `status`), asi que los fixtures del test son fichas
 * minimas y `ProjectL` entra sin conversiones.
 */

/** Lo minimo que la agrupacion lee de una ficha. */
export interface CatalogEntry {
  id: string;
  /** Id de la ficha padre: la familia se arma con esta relacion (S3). */
  lineage?: string;
  /** Ausente = activo. `finished` ordena al final del catalogo. */
  status?: "active" | "pre-release" | "finished";
}

export type CatalogGroupKind = "family" | "projects" | "earlier";

export interface CatalogGroup<T extends CatalogEntry> {
  /**
   * Identidad del grupo; tambien es la clave de su etiqueta i18n. Los tres
   * grupos son los unicos: no existe una seccion de archivados (D2).
   */
  kind: CatalogGroupKind;
  /**
   * Id de la ficha padre que da nombre al grupo de familia. Ausente en los
   * otros dos grupos. Se expone para que la etiqueta pueda apoyarse en la
   * ficha real si algun dia se quiere leer su titulo localizado.
   */
  lineage?: string;
  projects: T[];
}

/**
 * Parte el catalogo en sus tres grupos, en el orden visible:
 *
 *   1. `family`   - la ficha padre (su id es el `lineage` de otras) seguida por
 *                   sus derivadas. El padre es la primera ficha del array cuyo
 *                   id aparece como linaje de otra: el orden del array es
 *                   contrato de layout, asi que la eleccion es determinista.
 *   2. `projects` - el resto de fichas activas.
 *   3. `earlier`  - las `finished`, siempre al final.
 *
 * Invariantes:
 *   - los grupos particionan la entrada: ninguna ficha se cae y ninguna se
 *     repite (lo garantiza el recorrido de una sola pasada);
 *   - dentro de cada grupo se conserva el orden de la entrada;
 *   - un grupo vacio NO se emite, asi que la pagina nunca renderiza un
 *     encabezado sin tarjetas;
 *   - `finished` gana sobre el linaje: lo terminado va al final aunque su ficha
 *     padre siga activa.
 */
export function groupCatalog<T extends CatalogEntry>(projects: readonly T[]): CatalogGroup<T>[] {
  // Un linaje que apunta a una ficha inexistente no inventa familia: el padre
  // tiene que estar en el catalogo.
  const ids = new Set(projects.map((project) => project.id));
  const parentIds = new Set(
    projects
      .map((project) => project.lineage)
      .filter((lineage): lineage is string => lineage !== undefined && ids.has(lineage)),
  );

  let parentId: string | undefined;
  for (const project of projects) {
    if (parentIds.has(project.id)) {
      parentId = project.id;
      break;
    }
  }

  const family: T[] = [];
  const active: T[] = [];
  const earlier: T[] = [];

  for (const project of projects) {
    if (project.status === "finished") {
      earlier.push(project);
    } else if (parentId !== undefined && (project.id === parentId || project.lineage === parentId)) {
      family.push(project);
    } else {
      active.push(project);
    }
  }

  const groups: CatalogGroup<T>[] = [];
  if (family.length > 0) {
    groups.push({ kind: "family", lineage: parentId, projects: family });
  }
  if (active.length > 0) {
    groups.push({ kind: "projects", projects: active });
  }
  if (earlier.length > 0) {
    groups.push({ kind: "earlier", projects: earlier });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Sello de la tarjeta (`components/project-card.tsx`, T2b)
//
// El sello vive sobre la media de la card y dice solo lo que el contexto no
// dice. Por eso es una regla y no un condicional dentro del JSX: se prueba sin
// navegador y sin importar `data/projects.ts`.
// ---------------------------------------------------------------------------

/** Los dos sellos posibles. Orden de prioridad: `pre-release` gana. */
export type ProjectSeal = "pre-release" | "featured";

/**
 * Lo minimo que la regla del sello lee de una tarjeta.
 *
 * `featured` es la API PROPIA de la card (borde destacado, sello que dice que
 * la ficha tambien vive en la home); quien la pasa la deriva de la superficie
 * de la ficha (`home === "featured"`), nunca de un flag del modelo. Por eso la
 * entrada es el shape de la tarjeta y no el de `ProjectL`.
 */
export interface SealEntry {
  /** Ciclo de vida. Ausente = activo. */
  status?: "active" | "pre-release" | "finished";
  /** Superficie destacada de la ficha, ya resuelta por el consumidor. */
  featured?: boolean;
}

/**
 * Que sello corresponde a una tarjeta, o `null` si no lleva ninguno.
 *
 *   1. `status === "pre-release"` -> se sella como pre-release, aunque la ficha
 *      tambien sea destacada: lo que esta por salir pesa mas que la superficie.
 *   2. `featured === true`        -> se sella como destacada. Estas fichas
 *      tambien viven en la home, y el catalogo es el unico lugar donde eso no
 *      es obvio.
 *   3. resto                      -> sin sello. `finished` no lleva: ya lo dice
 *      el grupo "Trabajo anterior".
 *
 * Nunca dos sellos y nunca un conteo: uno o ninguno.
 */
export function projectSeal(entry: SealEntry): ProjectSeal | null {
  if (entry.status === "pre-release") return "pre-release";
  if (entry.featured === true) return "featured";
  return null;
}
