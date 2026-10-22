/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors must fail the build. With `ignoreBuildErrors: true` Next prints
  // "Skipping validation of types" and a broken type ships to production without
  // anyone noticing until a visitor sees it. The codebase passes `tsc --noEmit`,
  // so this is a free safety net — keep it on.
  images: {
    // La optimizacion estaba apagada: con `unoptimized: true` next/image
    // renderizaba un <img> con el archivo ORIGINAL. Los `sizes` de las cards
    // eran codigo muerto y un slot de ~430px recibia originales de hasta
    // 4000x2800. Decodificar y escalar eso ocurre fuera del main thread, por
    // eso ninguna medicion de long tasks lo veia: picos de GPU de 60-130ms.
    // `sharp` es el motor de next/image en `next start`; Vercel lo provee.
    // Next 16 limita las calidades a esta allowlist (default [75]); un `quality`
    // fuera de la lista se coercion al valor mas cercano.
    qualities: [75, 90],
    // 480 entra porque el slot real de una card en 3 columnas es de 448px y
    // el candidato default mas cercano era 640: el navegador subia una
    // textura un 43% mas grande de la que se pinta. Medido en el trace: el
    // frame lento al entrar a la grid lo gasta el proceso GPU (subida de
    // texturas y escalado), con el renderer principal ocioso.
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
}

export default nextConfig
