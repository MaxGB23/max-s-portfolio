// Tipos del data layer de proyectos: el shape bilingue (`L`), una hoja por
// idioma, y su resolucion a `string` por locale.
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

/** `kind` elige icono y NO se traduce; `label` es una hoja `L` normal, pero los
    4 labels genericos que se repiten en las 9 fichas viven UNA vez como
    constantes compartidas aqui (T15, variante B) en vez de 11 literales
    duplicados. Solo un label distinto del generico de su `kind` se escribe
    inline en la ficha (ej. "Cumyxel (MIT)", "VSCode Marketplace"). */
export interface LinkL {
  label: L;
  /** Categoria del enlace para elegir icono: "code" | "demo" | "site" | "landing" | "app" | ... */
  kind?: string;
  url: string;
  external?: boolean;
}

/**
 * Labels genericos de enlace, UNA sola fuente (T15, variante B).
 *
 * Por que constantes `L` y NO claves de chrome en `translations.ts`: la regla
 * del repo es que `L` nunca es opcional — mover estos labels a `t()` obligaba a
 * volver `label?` opcional y a meter un fallback `undefined` en DOS renders
 * (`project-detail` y el aria-label de `project-card`), es decir, una clase
 * entera de `undefined` a cambio de nada: el label YA respondia al locale via
 * `localizeProject`. La duplicacion real (11 literales identicos) desaparece
 * igual apuntando a estas 4 constantes, con menor blast radius y sin tocar
 * ningun componente.
 */
export const linkLabelCode: L = { es: "Ver código", en: "View code" };
export const linkLabelDemo: L = { es: "Ver demo", en: "View demo" };
export const linkLabelLanding: L = { es: "Ver landing", en: "View landing page" };
export const linkLabelApp: L = { es: "Probar la app", en: "Try the app" };

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
 * se resuelve, este o cualquier nodo del arbol. Array -> mapea; objeto -> mapea
 * sus claves; primitivo -> intacto.
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
 * Resuelve CADA hoja `{es,en}` al copy del locale activo y deja intacto lo que
 * no se traduce (rutas de imagen, `tags`, `kind`). Es el unico punto donde una
 * hoja se resuelve: el consumidor lee `project.hook` como string sin saber si el
 * valor venia de `es` o de `en`, y cambiar de idioma no le cambia ni una linea.
 *
 * El deep-walk es por eso puramente estructural: agregar `en` a una hoja nueva
 * no requiere tocar ni el localize ni ningun consumidor.
 */
export function localizeProject<T extends ProjectL>(
  entry: T,
  lang: Lang,
): Localized<T> {
  return localizeValue(entry, lang) as Localized<T>;
}

// ---------------------------------------------------------------------------
// La ficha YA RESUELTA
//
// Un componente de render nunca recibe la ficha CRUD sino la que ya paso por
// `localizeProject`: hojas en `string`. Estos alias son el nombre legible de
// "el tipo que renderiza", y son los que `@/data/projects` reexporta sin sufijo
// (`ProjectImage`, `ProjectMetric`, `ProjectLink`, `ArchitectureNode`).
// ---------------------------------------------------------------------------

export type LocalizedProjectImage = Localized<ProjectImageL>;
export type LocalizedMetric = Localized<MetricL>;
export type LocalizedLink = Localized<LinkL>;
export type LocalizedNode = Localized<NodeL>;