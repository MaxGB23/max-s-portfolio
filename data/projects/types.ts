// Tipos del data layer de proyectos: el shape bilingue (`L`) y el shape legacy
// espanol-plano (`*Es`) que migra ficha por ficha.
//
// La regla del repo "tocar data obliga a actualizar ambos idiomas" vive en el
// COMPILADOR, no en la convencion: `L` NO es opcional, asi que falta `en` y
// `tsc` falla. `Localized<T>` / `localizeProject` resuelven `L -> string` para
// que los consumidores sigan leyendo `project.hook` sin cambiar el acceso a
// campos: lo que cambia es de donde sale el valor, no como se llama.

import type { Lang } from "@/data/translations";

// ---------------------------------------------------------------------------
// La hoja traducida
// ---------------------------------------------------------------------------

/** Copia de una hoja en los dos idiomas. `en` NO opcional: la paridad ES/EN es
    un invariante del compilador, no una convención de revisión. */
export type L = { es: string; en: string };

// ---------------------------------------------------------------------------
// Shape bilingue - `L` en cada hoja visible
//
// Tipos explicitos y NO un mapped type generico: el mapped type no sabe que
// `image`/`src`/`tags`/`url` NO se traducen. El tipo es el checklist.
// ---------------------------------------------------------------------------

/** `src` no se traduce (es una ruta); `alt` si, es contenido visible. */
export interface ProjectImageL {
  src: string;
  alt: L;
}

export interface MetricL {
  value: L;
  label: L;
}

/** Nodo del grafo de arquitectura. `children` es recursivo por diseno: la
    topologia del detail es un arbol real, no una lista plana. */
export interface NodeL {
  name: L;
  description?: L;
  children?: NodeL[];
}

/** `kind` elige icono y NO se traduce; `label` si, hasta que T15 lo convierta en
    clave de chrome por `kind` y elimine el "Ver codigo" repetido en 9 fichas. */
export interface LinkL {
  label: L;
  /** Categoria del enlace para elegir icono: "code" | "demo" | "site" | "landing" | "app" | ... */
  kind?: string;
  url: string;
  external?: boolean;
}

export interface ProjectL {
  id: string;
  title: L;
  category: L;
  hook: L;
  metric: L;
  /** Nombres de stack (Next.js, Prisma, Tailwind...): no se traducen. */
  tags: string[];
  image: string;
  imageAlt: L;
  links: LinkL[];
  featured?: boolean;
  detail: {
    headline: L;
    summary: L;
    /**
     * Imagen introductoria del detail (portada grande, independiente de la card).
     * Si falta, el detail cae a `project.image` — los proyectos sin `visual`
     * siguen mostrando la misma imagen de la card.
     */
    visual?: ProjectImageL;
    /**
     * Métricas clave del detail.
     * CONVENCIÓN DE ORDEN: `metrics[0]` es la métrica RAÍZ / principal — se
     * renderiza como nodo raíz (columna izquierda) en la topología del detail;
     * el resto son nodos hijos (columna derecha). Mantener la más importante
     * primero, siempre.
     */
    metrics: MetricL[];
    problem?: L;
    role?: L[];
    solution: L[];
    /** Lineas "Stack: Next.js": la etiqueta se traduce, el nombre no. */
    stack: L[];
    gallery: ProjectImageL[];
    cta: L;
  };
  /**
   * Árbol de arquitectura real por proyecto (extraído de docs/projects).
   * Vive en el proyecto (no en el detail) porque la vista "Grafo Arquitectura"
   * lo lee naturalmente y la topología describe el proyecto completo, no su
   * vista detallada. Sin él, la vista muestra un estado vacío honesto — nunca se
   * inventa topología.
   */
  architecture?: NodeL;
}

// ---------------------------------------------------------------------------
// Shape legacy espanol-plano (`*Es`) - las fichas que aun NO migraron.
//
// Mismo shape que antes de la feature, con las hojas en `string`. Se borran al
// convertir la ficha 9 (T12), momento en que `ProjectEntry` deja de incluirlas.
// ---------------------------------------------------------------------------

export interface ProjectLinkEs {
  label: string;
  /** Categoría del enlace para elegir icono: "code" | "demo" | "site" | "landing" | "app" | ... */
  kind?: string;
  url: string;
  external?: boolean;
}

export interface ProjectMetricEs {
  value: string;
  label: string;
}

export interface ProjectImageEs {
  src: string;
  alt: string;
}

export interface ArchitectureNodeEs {
  /** Nombre del nodo/capa, extraído de la documentación real. */
  name: string;
  /** Descripción breve solo si las fuentes la respaldan. */
  description?: string;
  children?: ArchitectureNodeEs[];
}

export interface ProjectDetailEs {
  headline: string;
  summary: string;
  /**
   * Imagen introductoria del detail (portada grande, independiente de la card).
   * Si falta, el detail cae a `project.image` — los proyectos sin `visual`
   * siguen mostrando la misma imagen de la card.
   */
  visual?: ProjectImageEs;
  /**
   * Métricas clave del detail.
   * CONVENCIÓN DE ORDEN: `metrics[0]` es la métrica RAÍZ / principal — se
   * renderiza como nodo raíz (columna izquierda) en la topología del detail;
   * el resto son nodos hijos (columna derecha). Mantener la más importante
   * primero, siempre.
   */
  metrics: ProjectMetricEs[];
  problem?: string;
  role?: string[];
  solution: string[];
  stack: string[];
  gallery: ProjectImageEs[];
  cta: string;
}

export interface ProjectEs {
  id: string;
  title: string;
  category: string;
  hook: string;
  metric: string;
  tags: string[];
  image: string;
  imageAlt: string;
  links: ProjectLinkEs[];
  featured?: boolean;
  detail: ProjectDetailEs;
  /** Ver nota de `ProjectL.architecture`: mismo arbol, mismo criterio. */
  architecture?: ArchitectureNodeEs;
}

/**
 * Tipo TRANSITORIO: permite migrar proyecto por proyecto sin romper `tsc`.
 * `ProjectL | ProjectEs` — cada `localizeProject` acepta las dos, asi que un
 * work unit es reversible por separado. Desaparece en T12.
 */
export type ProjectEntry = ProjectL | ProjectEs;

// ---------------------------------------------------------------------------
// Resolucion de locale
// ---------------------------------------------------------------------------

/**
 * `L -> string`, recursivo sobre arrays y objetos; `string` pasa intacto.
 *
 * El ORDEN de las ramas es lo importante: `L` ES un objeto, asi que sin la
 * primera rama caeria en `T extends object` y devolveria `{ es; en }` en lugar
 * del string del locale.
 *
 * Efecto para el consumidor: los accesos NO cambian de forma. `project.hook`
 * sigue siendo un string con el mismo nombre de clave.
 */
export type Localized<T> = T extends L ? string
  : T extends string ? T
  : T extends (infer U)[] ? Localized<U>[]
  : T extends object ? { [K in keyof T]: Localized<T[K]> }
  : T;

/** Un objeto con claves `es` y `en` es una hoja traducida: se resuelve a `[lang]`. */
function isLocalizedLeaf(value: unknown): value is L {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "es" in value &&
    "en" in value
  );
}

/**
 * Deep-walk puramente ESTRUCTURAL (sin lista de campos): cualquier hoja `{es,en}`
 * se resuelve, tanto en las fichas de hoy como en las que se migren despues.
 * Array -> mapea; objeto -> mapea sus claves; primitivo -> intacto.
 */
function localizeValue(value: unknown, lang: Lang): unknown {
  if (isLocalizedLeaf(value)) return value[lang];
  if (Array.isArray(value)) {
    return value.map((item) => localizeValue(item, lang));
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).map(
      ([key, item]) => [key, localizeValue(item, lang)] as const,
    );
    return Object.fromEntries(entries);
  }
  return value;
}

/**
 * Localiza una ficha para `lang`.
 *
 * Con las fichas todavia en `ProjectEs` (ninguna hoja es `L`) esto es IDENTIDAD
 * en ES: los strings pasan intactos y el render no puede cambiar. Al migrar cada
 * ficha a `ProjectL`, el mismo consumidor empieza a devolver el copy del locale
 * sin tocar una sola lectura.
 *
 * El deep-walk es por eso puramente estructural: agregar `en` a una hoja nueva
 * no requiere tocar ni el localize ni ningun consumidor.
 */
export function localizeProject<T extends ProjectEntry>(
  entry: T,
  lang: Lang,
): Localized<T> {
  return localizeValue(entry, lang) as Localized<T>;
}

// ---------------------------------------------------------------------------
// Invariante de la migracion (aserción de compilacion)
// ---------------------------------------------------------------------------

/** Falla al compilar si `T` no es `true`. */
type ExpectTrue<T extends true> = T;

/**
 * Con las 9 fichas en `ProjectEs` ninguna hoja es `L`, asi que `Localized<ProjectEs>`
 * es estructuralmente identico a `ProjectEs`: ES el proxy determinista de que el
 * render ES no cambia. Los consumidores lo demuestran solos — si un `Localized`
 * devolviera otra cosa, `StackChips tags={...}`, `KpiGrid metrics={...}` y
 * `ProjectArchitecture tree={...}` dejarian de compilar.
 *
 * Esta asercion lo fija de forma explicita. Cuando la ultima ficha migre a
 * `ProjectL` (T12) debe FALLAR: es la señal de borrar esto junto con `ProjectEs`.
 */
type _ProjectEsIsUnchangedByLocalize = ExpectTrue<
  [ProjectEs, Localized<ProjectEs>] extends [Localized<ProjectEs>, ProjectEs]
    ? true
    : false
>;