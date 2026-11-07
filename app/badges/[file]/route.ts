import { BADGES, BADGE_CACHE_SECONDS, findBadge, renderBadge } from "@/lib/badge-svg";
import { getOpenVsxDownloads, getZedDownloads } from "@/lib/live-metrics";

/**
 * Endpoint de los badges de descargas que pinta el README del perfil.
 *
 * El README apunta aqui en vez de a un SVG versionado: GitHub solo sirve
 * archivos y no ejecuta codigo, asi que un numero en vivo necesita un endpoint.
 * Se sirve en cache de CDN, y si el registry no responde se publica el respaldo
 * escrito del badge: una cifra con fecha es preferible a una imagen rota.
 */
export const dynamicParams = false;

/**
 * Revalidacion de la ruta: coincide con `BADGE_CACHE_SECONDS` (1 h). Va como
 * literal porque Next la lee de forma estatica; si cambia la constante, cambia
 * esta linea. Con esto el dibujo se sirve prerenderizado desde el CDN y solo se
 * regenera una vez por hora, en vez de ejecutar el handler en cada visita.
 */
export const revalidate = 3600;

/** Los badges son un conjunto cerrado: se prerenderizan los dos y el resto no existe. */
export function generateStaticParams(): Array<{ file: string }> {
  return Object.values(BADGES).map((badge) => ({ file: badge.file }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
): Promise<Response> {
  const { file } = await params;
  const badge = findBadge(file);

  if (badge === null) {
    return new Response("badge desconocido", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const count =
    badge.source.kind === "zed"
      ? await getZedDownloads(badge.source.url, BADGE_CACHE_SECONDS)
      : await getOpenVsxDownloads(badge.source.url, BADGE_CACHE_SECONDS);

  const svg = renderBadge(badge, count ?? badge.fallbackCount);

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // El navegador puede guardarlo 5 min; el CDN lo sirve prerenderizado y lo
      // regenera segun `revalidate`.
      "cache-control": "public, max-age=300",
    },
  });
}
