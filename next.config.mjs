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
  },
}

export default nextConfig
