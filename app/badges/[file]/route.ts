import { BADGE_CACHE_SECONDS, findBadge, renderBadge } from "@/lib/badge-svg";
import { getOpenVsxDownloads, getZedDownloads } from "@/lib/live-metrics";

/**
 * Endpoint de los badges de descargas que pinta el README del perfil.
 *
 * El README apunta aqui en vez de a un SVG versionado: GitHub solo sirve
 * archivos y no ejecuta codigo, asi que un numero en vivo necesita un endpoint.
 * Se sirve en cache de CDN, y si el registry no responde se publica el respaldo
 * escrito del badge: una cifra con fecha es preferible a una imagen rota.
 */
export const dynamic = "force-dynamic";

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
      // El CDN guarda el dibujo; `stale-while-revalidate` evita que un visitante
      // espere el refresco. La ventana coincide con la del fetch del registry.
      "cache-control": `public, max-age=300, s-maxage=${BADGE_CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
