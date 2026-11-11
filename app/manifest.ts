import type { MetadataRoute } from 'next'

/**
 * Android asks for a manifest before it will offer "Add to home screen", and
 * without one the shortcut inherits a screenshot instead of the brand mark.
 * This is the minimum: a display name, the two icons `scripts/site-icons.mjs`
 * already builds, and the colours the mark is drawn with (a black circle with a
 * white M), so the splash screen matches the icon instead of flashing white.
 *
 * Not a PWA: no service worker, no offline mode. `display: standalone` only
 * removes the browser chrome from the shortcut.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Max González Ballesteros',
    short_name: 'Max',
    description: 'Portfolio of Max González Ballesteros, full stack developer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
