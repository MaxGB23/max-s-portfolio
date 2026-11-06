/**
 * Metricas que se leen de un registry en vez de una medicion fija.
 *
 * El valor se consulta al servidor de Next con cache de 24 h: la pagina sigue
 * siendo barata y la cifra deja de envejecer a mano. Si una API no responde o
 * devuelve algo que no es un numero, se devuelve `null` y el llamador conserva
 * la constante escrita en `data/projects/*.ts` como respaldo.
 *
 * Una metrica puede venir de varios registries (hoy Open VSX y Zed): la cifra
 * visible es la suma y solo se publica cuando todas las fuentes respondieron.
 */

import type { LiveMetricSource, ProjectL } from "@/data/projects";

/** Ventana de cache de la respuesta del registry (24 h). */
export const LIVE_METRIC_REVALIDATE_SECONDS = 24 * 60 * 60;

/** Tope de espera del registry: un endpoint colgado cae al respaldo, no espera. */
export const LIVE_METRIC_TIMEOUT_MS = 3000;

/**
 * Formatea una cuenta de descargas como la escribe el sitio: 999, 4.4k, 12.3k.
 *
 * Trunca en vez de redondear a la decima: una cifra de traccion nunca debe
 * quedar mas alta que la real.
 */
export function formatDownloads(count: number): string {
  if (!Number.isFinite(count) || count < 0) {
    throw new RangeError(`descargas invalidas: ${count}`);
  }
  if (count < 1000) return String(Math.trunc(count));
  const tenths = Math.floor(count / 100);
  const whole = Math.floor(tenths / 10);
  const decimal = tenths % 10;
  return decimal === 0 ? `${whole}k` : `${whole}.${decimal}k`;
}

/** Descargas acumuladas del endpoint de Open VSX, o `null` si no se pudo leer. */
export async function getOpenVsxDownloads(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: LIVE_METRIC_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(LIVE_METRIC_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const count = (payload as { downloadCount?: unknown } | null)?.downloadCount;
    return typeof count === "number" && Number.isFinite(count) && count >= 0 ? count : null;
  } catch {
    // Un registry caido no puede tumbar la ficha: se cae al valor estatico.
    return null;
  }
}

/** Valores vivos ya formateados, indexados por id de proyecto. */
export type LiveMetricValues = Record<string, string>;

/** Descargas acumuladas del endpoint de Zed, o `null` si no se pudo leer. */
export async function getZedDownloads(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: LIVE_METRIC_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(LIVE_METRIC_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const rows = (payload as { data?: unknown } | null)?.data;
    // Un id inexistente en Zed responde 200 con `data: []`, no 404: una lista
    // vacia es "no disponible", nunca cero descargas.
    if (!Array.isArray(rows) || rows.length === 0) return null;
    // Zed devuelve una fila por version publicada. `download_count` es acumulado
    // y viene igual en todas, pero la fila de la version mas reciente es la que
    // representa la extension hoy.
    const publishedAt = (row: unknown) => (row as { published_at?: unknown } | null)?.published_at;
    const latest = rows.reduce((best: unknown, row: unknown) => {
      const candidate = publishedAt(row);
      const current = publishedAt(best);
      if (typeof candidate !== "string") return best;
      if (typeof current !== "string") return row;
      return candidate > current ? row : best;
    }, rows[0] as unknown);
    const count = (latest as { download_count?: unknown } | null)?.download_count;
    return typeof count === "number" && Number.isFinite(count) && count >= 0 ? count : null;
  } catch {
    // Un registry caido no puede tumbar la ficha: se cae al valor estatico.
    return null;
  }
}

/**
 * Suma las descargas de todos los registries declarados.
 *
 * Si una sola fuente falla devuelve `null`: una suma parcial omitiria una
 * plataforma y publicaria una traccion mas baja que la real sin avisar. El
 * llamador cae entonces a la cifra escrita y fechada.
 */
export async function sumDownloads(sources: LiveMetricSource[]): Promise<number | null> {
  const counts = await Promise.all(
    sources.map((source) =>
      source.kind === "zed" ? getZedDownloads(source.url) : getOpenVsxDownloads(source.url),
    ),
  );
  let total = 0;
  for (const count of counts) {
    if (count === null) return null;
    total += count;
  }
  return total;
}

/**
 * Sustituye la cifra inicial de una metrica de card por su valor vivo.
 *
 * La metrica de una card es una frase ("4.4k descargas en Open VSX"): cambiar la
 * frase entera por la cifra dejaba la card mostrando solo el numero. Si la
 * frase no empieza con una cifra ("Verified Open VSX Publisher"), se devuelve
 * intacta: ahi no hay numero que actualizar.
 */
export function withLiveMetric(metric: string, live: string): string {
  // Sin `\s*` entre la cifra y la `k`: consumiria el espacio de "999 descargas"
  // y devolveria "1kdescargas".
  return metric.replace(/^[\d.,]+k?/i, live);
}

/**
 * Resuelve en paralelo la metrica viva de cada proyecto que la declara.
 *
 * Un proyecto cuya API no responde queda FUERA del mapa: quien consume el
 * resultado cae entonces a la cifra escrita en `data/projects`. El mapa se arma
 * en el servidor una vez por render y comparte la cache de 24 h del fetch.
 */
export async function getLiveMetrics(projects: ProjectL[]): Promise<LiveMetricValues> {
  const entries = await Promise.all(
    projects.map(async (project) => {
      const live = project.liveMetric;
      if (!live) return null;
      const count = await sumDownloads(live.sources);
      return count === null ? null : ([project.id, formatDownloads(count)] as const);
    }),
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
