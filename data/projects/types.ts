// Tipos del data layer de proyectos: el shape bilingue (`L`), una hoja por
// idioma, y su resolucion a `string` por locale.
//
// La regla del repo "tocar data obliga a actualizar ambos idiomas" vive en el
// COMPILADOR, no en la convencion: `L` NO es opcional, asi que falta `en` y
// `tsc` falla. `Localized<T>` / `localizeProject` resuelven `L -> string` para
// que los consumidores sigan leyendo `project.hook` sin cambiar el acceso a
// campos: lo que cambia es de donde sale el valor, no como se llama.

import type { Lang } from "@/data/translations";
import { tenureText } from "../../lib/tenure.ts";

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
  /**
   * Etiqueta alternativa para cuando la cifra se lee de un registry. Existe para
   * que el respaldo escrito pueda FECHARSE: una cifra estatica con la etiqueta
   * "(en vivo)" afirmaria estar actualizada sin serlo.
   */
  labelLive?: L;
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

/**
 * Registry que publica su propio conteo de descargas.
 *
 * `kind` decide el parser (la forma del JSON cambia de un registry a otro) y
 * `url` es el endpoint publico concreto de la extension.
 */
export type LiveMetricSource = {
  kind: "openvsx" | "zed";
  url: string;
};

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
  /**
   * Metrica que se lee de registries en vez de una medicion fija: la ficha
   * muestra la cifra viva y este bloque dice de donde sale. El valor escrito en
   * `detail.metrics` queda como respaldo si alguna API no responde.
   */
  liveMetric?: {
    /** Indice dentro de `detail.metrics` (por convencion, 0 es la raiz). */
    index: number;
    /**
     * Registries que publican su propio conteo: la ficha muestra la SUMA de
     * todos, y solo la muestra si TODOS responden. Una suma parcial omitiria
     * una plataforma y publicaria menos traccion que la real.
     */
    sources: LiveMetricSource[];
  };
  /**
   * Primera publicacion en produccion, en ISO `YYYY-MM-DD`.
   *
   * Con esta fecha la cifra de tiempo en produccion se CALCULA al renderizar
   * (`tenureText`) en vez de envejecer escrita a mano: la card y `metrics[0]`
   * del detail publican el texto calculado. Cuando falta, se publica la metrica
   * escrita tal cual; una fecha ilegible o futura tambien cae al texto escrito.
   * Un proyecto con periodo CERRADO no la lleva: si ya no esta en produccion,
   * una cifra que crece cada mes afirmaria algo falso.
   */
  productionSince?: string;
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
 *
 * Ademas calcula `productionTenure` cuando la ficha declara `productionSince`:
 * es el unico campo que NO sale de una hoja `L` sino de una fecha, y por eso se
 * anade aqui y no en el deep-walk. `now` existe para que un test fije el reloj.
 */
export function localizeProject<T extends ProjectL>(
  entry: T,
  lang: Lang,
  now: Date = new Date(),
): LocalizedProject<T> {
  const localized = localizeValue(entry, lang) as Localized<T>;
  // `tenureText` devuelve `null` si la fecha no se puede leer o cae en el futuro:
  // ahi el campo queda ausente y el consumidor publica el respaldo escrito.
  const productionTenure =
    entry.productionSince === undefined
      ? undefined
      : tenureText(entry.productionSince, lang, now) ?? undefined;

  // Sin tiempo calculado se devuelve el objeto tal cual: no se anade una clave
  // `undefined` que luego aparezca en un `Object.keys` o en un diff.
  return productionTenure === undefined
    ? (localized as LocalizedProject<T>)
    : { ...localized, productionTenure };
}

/**
 * Valor publicado de una metrica: la duracion calculada sustituye a la escrita.
 *
 * Sustituye solo el tramo inicial, no la frase entera: en «+10 meses en
 * produccion sin caidas» cambia «+10 meses» y deja intacta la afirmacion que
 * viene detras. Una sola regla de precedencia para las dos cards y para el
 * override de `metrics[0]` en el detail: si cada consumidor la escribiera a
 * mano, un cambio de prioridad quedaria a medias.
 */
export function productionMetricValue(
  productionTenure: string | undefined,
  written: string,
): string {
  if (productionTenure === undefined) return written;

  // La cifra escrita empieza por la duracion: "+10 meses", "10 months",
  // "1 año". Si no empieza asi, la ficha no sigue el contrato y se publica el
  // texto calculado en lugar de inventar una sustitucion a ciegas.
  const leadingDuration = /^\+?\s*\d+\s*(?:mes|meses|año|años|month|months|year|years|día|días|day|days)\b/i;

  return leadingDuration.test(written) ? written.replace(leadingDuration, productionTenure) : productionTenure;
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

/**
 * Ficha ya localizada mas el tiempo en produccion calculado.
 *
 * `productionTenure` es el unico campo que no viene de una hoja `L`: se calcula
 * para el idioma activo desde `productionSince`, y su ausencia significa "publica
 * la metrica escrita". Por eso es opcional y no una hoja mas.
 */
export type LocalizedProject<T extends ProjectL = ProjectL> = Localized<T> & {
  productionTenure?: string;
};