import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/contexts/language-context'
import type { Lang } from '@/data/translations'
import { SmoothScroll } from '@/components/smooth-scroll'
import { ThemeProvider } from '@/components/theme-provider'
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
 * "l1".."l4" are depth levels: l1 = outermost marked container, each nested
 * marker +1. "test" is a disposable one-off marker for a single box (icon,
 * image, inline span); it is orthogonal to depth and never counts as a level.
 * One attribute per channel, so toggling is deleting a word.
 * Empty array = off.
 */
type DebugChannel = 'l1' | 'l2' | 'l3' | 'l4' | 'test'

const LAYOUT_DEBUG: DebugChannel[] = []

const debugAttrs = Object.fromEntries(
  LAYOUT_DEBUG.map((channel) => [`data-debug-${channel}`, true]),
)

export const metadata: Metadata = {
  title: "Max's Portfolio",
  description:
    'Personal portfolio of Max, a MX-based Full Stack Developer specializing in building polished, performant web experiences.'
}

// Initial language decided on the SERVER (zero flash):
// 1. Cookie 'lang' → honors a previous choice
// 2. Accept-Language → browser preference on first visit
// 3. Fallback: 'es'
async function getInitialLang(): Promise<Lang> {
  const store = await cookies()
  const cookieLang = store.get('lang')?.value
  if (cookieLang === 'es' || cookieLang === 'en') return cookieLang

  const accept = (await headers()).get('accept-language') ?? ''
  return accept.startsWith('en') ? 'en' : 'es'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLang = await getInitialLang()

  return (
    <html lang={initialLang} suppressHydrationWarning {...debugAttrs}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <LanguageProvider initialLang={initialLang}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <SmoothScroll>
              {children}
            </SmoothScroll>
            <Analytics />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
