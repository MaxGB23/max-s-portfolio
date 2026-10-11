/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors must fail the build. With `ignoreBuildErrors: true` Next prints
  // "Skipping validation of types" and a broken type ships to production without
  // anyone noticing until a visitor sees it. The codebase passes `tsc --noEmit`,
  // so this is a free safety net — keep it on.
  images: {
    unoptimized: true,
  },
}

export default nextConfig
