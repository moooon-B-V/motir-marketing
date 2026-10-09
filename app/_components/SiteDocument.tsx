import type { ReactNode } from 'react'
import {
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Source_Serif_4,
  Space_Grotesk,
} from 'next/font/google'
import { HandDrawnFilter, ImmersiveTilt } from '@motir/design-system'
import {
  clearStoredAppearanceScript,
  siteAppearanceAttributes,
} from '@/lib/siteDefaults'
import type { Locale } from '@/i18n/routing'
import { RootJsonLd } from './RootJsonLd'
import '../globals.css'

/*
 * THE DOCUMENT EVERY motir.co PAGE IS SERVED IN (MOTIR-7948).
 *
 * This was `app/layout.tsx`. The routes moved under `app/[locale]`, whose
 * layout now owns `<html lang>`, and the root layout became the pass-through
 * next-intl prescribes so that `app/not-found.tsx` can render a document of its
 * own. That gives the site TWO places that emit `<html>` — the locale layout
 * and the global 404 — and this module is the one both call, so the six faces,
 * the appearance attributes and the style engines cannot drift between them.
 */

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

export function SiteDocument({
  lang,
  children,
}: Readonly<{ lang: Locale; children: ReactNode }>) {
  return (
    <html
      lang={lang}
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
      /*
       * motir.co's ONE look — light, Hand-Drawn / Indie, Grotesk — rendered
       * on the first byte (MOTIR-7724). No init script, no `system` theme and
       * no stored choice. A visitor who picks another look on `/design`
       * (`lib/useVisitAppearance.ts`) restyles every page for the rest of that
       * visit — this `<html>` survives client-side navigation — and the next
       * fresh load is this look again. `suppressHydrationWarning` stays for
       * the attributes that pick (and browser extensions) change on the client.
       */
      {...siteAppearanceAttributes}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: clearStoredAppearanceScript }}
          suppressHydrationWarning
        />
      </head>
      <body>
        {/* The two style engines the app mounts too: the pointer tilt the 3D /
            Immersive style animates `data-tilt` panels with, and the roughen
            filter the Hand-Drawn style references. Both are inert under every
            other style (and the tilt under reduced motion). */}
        <ImmersiveTilt />
        <HandDrawnFilter />
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
