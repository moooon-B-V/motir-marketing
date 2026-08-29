import type { Metadata } from 'next'
import {
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Source_Serif_4,
  Space_Grotesk,
} from 'next/font/google'
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
 * unresolved and quietly disable the whole type axis.
 *
 * ⚠️ THIS SITE NOW HAS A PICKER (`/design`, MOTIR-1043), so it loads all SIX
 * pairings' faces rather than the default pairing's three. The three added
 * below carry `preload: false`: the landing's first paint is unchanged and
 * only a visitor who actually selects one of those pairings pays for the face.
 * Two of the three would have failed HARD rather than degraded —
 * `[data-type='grotesk']` and `[data-type='editorial']` read
 * `var(--font-grotesk-source)` / `var(--font-editorial-source)` with NO in-var
 * fallback, so an unloaded face makes the whole declaration invalid and the
 * role silently falls back to the base.
 *
 * `tests/typeFaces.test.ts` reads every `-source` variable that
 * `@motir/design-system`'s `theme.css` references and asserts this file
 * defines each one — so a seventh pairing fails the suite rather than the eye.
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
// `grotesk` — Space Grotesk throughout (headlines + body/UI).
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk-source',
  display: 'swap',
  preload: false,
})
// `editorial` — Fraunces display headlines over the Inter body.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-editorial-source',
  display: 'swap',
  preload: false,
})
// `mono-technical` — IBM Plex Mono throughout. Not a variable font, so the
// weights it is used at are enumerated rather than inherited from an axis.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-technical-source',
  display: 'swap',
  preload: false,
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
      className={[
        inter.variable,
        sourceSerif.variable,
        jetbrainsMono.variable,
        spaceGrotesk.variable,
        fraunces.variable,
        ibmPlexMono.variable,
        'antialiased',
      ].join(' ')}
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
