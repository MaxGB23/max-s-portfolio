import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import { resolveLang } from '@/lib/lang'
import { SITE, SITE_URL } from '@/lib/site'
import { SmoothScroll } from '@/components/smooth-scroll'
import { StructuredData } from '@/components/structured-data'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

/**
 * Layout debug overlay for manual QA (visual only).
 * "l1".."l5" are depth levels: l1 = outermost marked container, each nested
 * marker +1; unmarked wrappers in between do not count. "test" is a disposable
 * one-off marker for a single box (icon, image, inline span); it is orthogonal
 * to depth and never counts as a level.
 * One attribute per channel, so toggling is deleting a word.
 * Empty array = off.
 */
type DebugChannel = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'test'

// Uncomment to enable layout debugging
const LAYOUT_DEBUG: DebugChannel[] = []
// const LAYOUT_DEBUG: DebugChannel[] = ['l1', 'l2', 'l3', 'l4', 'l5', 'test']

const debugAttrs = Object.fromEntries(
  LAYOUT_DEBUG.map((channel) => [`data-debug-${channel}`, true]),
)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // The title line is the most valuable space in a search result: it carries
  // the name a query types and the role a recruiter filters by. Child routes
  // append the name through the template.
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  // The legal name leads the description, so a search for it still matches.
  description: SITE.description,
  // Search Console verification for the URL prefix. The token is public by
  // design: Google reads it from this page's head, and it is not a secret.
  verification: {
    google: 'yHlm-OtKW3lNycRteuPTiFIJMt_Ao3xVSvQEpZOM_Mg',
  },
  alternates: { canonical: '/' },
}

/**
 * Reveal gate: the only JS that runs before the first paint.
 *
 * The served HTML is visible by default; this script is what arms the hiding
 * layer (see the "Reveal gate" block in app/globals.css). One atomic decision:
 * if IntersectionObserver is missing the attribute is never set and the page
 * renders complete and static.
 *
 * It deliberately does NOT check prefers-reduced-motion. That is a project
 * decision, not an oversight: the site keeps its entry animations for everyone
 * because they are opacity fades and short rises, never parallax, zoom or
 * scroll-driven motion. See the reduced motion policy in
 * docs/design/section-animations.md before adding anything larger.
 *
 * Raw <script>, NOT next/script: an inline beforeInteractive script is
 * serialized into `self.__next_s` and executed later by the async
 * app-bootstrap chunk, which can land after the first paint and flash visible
 * -> hidden. Inline here, it runs while the body is parsed, before any content
 * element exists, so the gate is always armed before the first paint.
 *
 * The 2s safety net lives HERE, not in the bundle: it must survive the exact
 * failure it covers (a bundle that never loads). Without it the worst case is
 * "content never appears"; with it the worst case is "content appears without
 * animation", which is strictly better than what the site did before.
 *
 * The net covers ONLY that failure, so it is cancelled by the client bundle as
 * soon as components/reveal.tsx is evaluated (it holds the id on
 * `window.__revealNet`). A blanket "reveal everything at 2s" also strips the
 * scroll entry from every section below the fold, because a natural scroll
 * always happens after the 2s mark.
 */
const REVEAL_GATE_SCRIPT = `if ('IntersectionObserver' in window) { document.documentElement.dataset.reveal = 'on'; window.__revealNet = setTimeout(function () { var pending = document.querySelectorAll('[data-reveal-item]:not([data-reveal-item="shown"])'); for (var i = 0; i < pending.length; i++) { pending[i].dataset.revealItem = 'shown'; } }, 2000); }`

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLang = await resolveLang()

  return (
    // `dark` is rendered by the server instead of being applied by a
    // next-themes script: the theme is forced and has no toggle, so the class
    // is a constant. Without JS the page is dark too, and there is no flash.
    <html lang={initialLang} className="dark" suppressHydrationWarning {...debugAttrs}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <StructuredData />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_GATE_SCRIPT }} />
        <LanguageProvider initialLang={initialLang}>
          <SmoothScroll>{children}</SmoothScroll>
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}
