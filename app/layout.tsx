import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import { themeInitScript } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { SITE_ORIGIN, siteUrl } from '@/lib/siteOrigin'
import { RootJsonLd } from './_components/RootJsonLd'
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
 * The root metadata. MOTIR-1152 shipped the title and description and left the
 * ENTITY SIGNAL to MOTIR-1154 (8.3.7); this is that card, so the rest of it
 * arrives here — `metadataBase`, the canonical, the OpenGraph / Twitter shape
 * that makes `app/opengraph-image.tsx` render as a large card, and the Search
 * Console meta tag. The JSON-LD graph is a `<script>` rather than metadata and
 * is injected in the tree below.
 *
 * ⚠️ `metadataBase` IS THE LOAD-BEARING LINE, AND ITS ABSENCE FAILS QUIETLY.
 * Next injects a file-convention `opengraph-image` as a site-RELATIVE path and
 * resolves it against this value when it writes `<meta property="og:image">`.
 * With none set it falls back to the dev origin and advertises the card at
 * `http://localhost:3000/opengraph-image` — an address no crawler, social-card
 * renderer or link-preview fetcher can reach. motir-core shipped exactly that
 * on its whole public surface until MOTIR-2505, saying so in its logs on every
 * render; this site starts with the line in place.
 *
 * ⚠️ EVALUATED AT BUILD TIME, because this is a static export on a statically
 * rendered route. That is correct for every value here — `SITE_ORIGIN` is a
 * `NEXT_PUBLIC_*` constant and the catalogue is a compiled-in import — but it
 * is also why the verification variable below must be a BUILD arg if it is ever
 * set, never a Fly secret. Same rule, and same reason, as
 * `NEXT_PUBLIC_MOTIR_APP_ORIGIN`.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: copy.meta.title,
  description: copy.meta.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl('/'),
    siteName: 'Motir',
    title: copy.meta.title,
    description: copy.meta.description,
    locale: 'en',
  },
  // `summary_large_image` is what makes the 1200 × 630 card render at full
  // width rather than as a thumbnail. The image itself is not named here —
  // `app/opengraph-image.tsx` is a file convention, so Next injects it into
  // both the OpenGraph and Twitter tag sets on its own.
  twitter: { card: 'summary_large_image' },
  verification: {
    /*
     * ⚠️ UNSET IS THE EXPECTED STATE, AND IT IS NOT A GAP. MOTIR-1155 verified
     * `motir.co` in Search Console on 2026-08-27 by DNS, on a DOMAIN property —
     * which issues no meta-tag token at all: the `google-site-verification=`
     * string it produced is a TXT record VALUE and is not interchangeable with
     * the HTML-tag token. Ownership is therefore already proven, for the apex
     * and every subdomain, and Next omits the tag entirely when this is
     * undefined. The wiring exists so a later URL-prefix property can be
     * verified without a code change; it is belt-and-braces, not the
     * verification path.
     *
     * ⚠️ AND IT IS NOT A LICENCE TO TOUCH THE APEX TXT SET — MOTIR-2596 (the
     * mailbox SPF) and MOTIR-1155 (the verification record) both write there.
     */
    google: process.env.MOTIR_GOOGLE_SITE_VERIFICATION,
  },
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
      <body>
        {children}
        {/*
         * The Organization + WebSite entity graph (MOTIR-1154). It sits at the
         * END of <body> rather than in <head> deliberately: structured data is
         * read from the parsed document, position-independently, and nothing
         * above it should wait on it. Site-wide because the entity is the
         * SITE's, not any one page's — a second page inherits it from here.
         */}
        <RootJsonLd />
      </body>
    </html>
  )
}
