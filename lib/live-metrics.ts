/**
 * Metricas que se leen de un registry en vez de una medicion fija.
 *
 * El valor se consulta al servidor de Next con cache de 24 h: la pagina sigue
 * siendo barata y la cifra deja de envejecer a mano. Si la API no responde o
 * devuelve algo que no es un numero, se devuelve `null` y el llamador conserva
 * la constante escrita en `data/projects/*.ts` como respaldo.
 */

import type { ProjectL } from "@/data/projects";

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
      const source = project.liveMetric;
      if (!source || source.kind !== "openvsx") return null;
      const count = await getOpenVsxDownloads(source.url);
      return count === null ? null : ([project.id, formatDownloads(count)] as const);
    }),
  );
  return Object.fromEntries(entries.filter((entry) => entry !== null));
}
