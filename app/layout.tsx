import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import { themeInitScript } from '@motir/design-system'
import { copy } from '@/lib/copy'
import './globals.css'

/*
 * The three faces the `motir` type pairing names — Source Serif 4 headlines
 * over an Inter body with JetBrains Mono meta — loaded as the RAW `-source`
 * variables the token layer reads.
 *
 * ⚠️ THE VARIABLE NAME MUST BE THE `-source` ONE. `theme.css` declares the
 * ROLE tokens as `--font-sans: var(--font-sans-source, <fallbacks>)`, and the
 * `[data-type]` blocks re-point those roles. Naming a loader variable
 * `--font-sans` directly would leave every `var(--font-*-source)` reference
 * unresolved and quietly disable the whole type axis. motir-core loads six
 * faces because it ships six pairings behind an Appearance picker; this site
 * has no picker, so it loads the default pairing's three and nothing else —
 * a visitor who lands here from a `[data-type]` they chose in the app is on a
 * different origin with different storage and gets the default either way.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-source',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif-source',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-source',
  display: 'swap',
})

/*
 * ⚠️ The root metadata is THIS card's; the ENTITY SIGNAL is not.
 * `Organization` + `WebSite` JSON-LD, the root OG image, the sitemap and
 * flipping `robots` off `disallow: /` are MOTIR-1154 (8.3.7) — the landing
 * shipping and the landing being indexable are two different events, and
 * `app/robots.ts` stays as it is until that card.
 */
export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        {/*
         * The design-system's own init script, not a local re-derivation of it.
         * It stamps `data-theme` / `-style` / `-palette` / `-type` on <html>
         * BEFORE first paint, resolving the `system` default through
         * `prefers-color-scheme` — which is what makes the dark theme the
         * design's Panel 4 draws actually reachable here. It must run blocking
         * in <head>: resolving after hydration is a visible light flash on a
         * dark-mode visitor's first paint. `suppressHydrationWarning` above is
         * the standard companion — the server cannot know the attribute this
         * writes.
         */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
