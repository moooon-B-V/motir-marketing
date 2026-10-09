import type { ReactNode } from 'react'
import { HandDrawnFilter, ImmersiveTilt } from '@motir/design-system'
import {
  clearStoredAppearanceScript,
  siteAppearanceAttributes,
} from '@/lib/siteDefaults'
import type { Locale } from '@/i18n/routing'
import { fontVariables } from '../fonts'
import { RootJsonLd } from './RootJsonLd'
import '../globals.css'

/*
 * THE DOCUMENT EVERY motir.co PAGE IS SERVED IN (MOTIR-7948).
 *
 * This was `app/layout.tsx`. The routes moved under `app/[locale]`, whose
 * layout now owns `<html lang>`, and the root layout became the pass-through
 * next-intl prescribes so that `app/not-found.tsx` can render a document of its
 * own. That gives the site TWO places that emit `<html>` — the locale layout
 * and the global 404 — and this module is the one both call, so the faces,
 * the appearance attributes and the style engines cannot drift between them.
 * The faces themselves are declared in `app/fonts.ts` (MOTIR-7952).
 */

export function SiteDocument({
  lang,
  description,
  children,
}: Readonly<{
  lang: Locale
  /** The locale catalogue's `meta.description`, for the entity graph. */
  description: string
  children: ReactNode
}>) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${fontVariables} antialiased`}
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
        <RootJsonLd locale={lang} description={description} />
      </body>
    </html>
  )
}
