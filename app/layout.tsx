import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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

// Layout debug overlay for manual QA.
// Flip to `true` to render the colored container outlines (debug-l1..4) in
// hero/about while adjusting the layout; flip back to `false` for production.
const LAYOUT_DEBUG = true

export const metadata: Metadata = {
  title: "Max's Portfolio",
  description:
    'Personal portfolio of Max, a MX-based Full Stack Developer specializing in building polished, performant web experiences.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning {...(LAYOUT_DEBUG ? { 'data-debug': '' } : {})}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
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
      </body>
    </html>
  )
}
