import { copy } from '@/lib/copy'
import { SITE_ORIGIN, siteUrl } from '@/lib/siteOrigin'

/*
 * The ENTITY SIGNAL for motir.co (MOTIR-1154 · 8.3.7) — the standing
 * `Organization` + `WebSite` pair a search engine learns the brand from.
 *
 * motir-core already emits per-PAGE structured data on its public surface: a
 * `SoftwareApplication` + `FAQPage` on each public project, a `CollectionPage`
 * on the square. Every one of those describes a PAGE. None of them declares who
 * MOTIR IS — the square's only site-level gesture is an `isPartOf: WebSite`
 * nested inside a CollectionPage, which names a website without ever defining
 * it. This is the missing root of that graph, and it belongs at the brand's
 * apex rather than on the application host: motir.co is the entity, app.motir.co
 * is a product surface of it.
 *
 * ── WHY THE `@id`s MATTER ──────────────────────────────────────────────────
 * Both nodes carry a stable fragment `@id` (`…/#organization`, `…/#website`) and
 * the WebSite's `publisher` is a REFERENCE to the Organization rather than a
 * second copy of it. That is what makes the two one graph instead of two
 * unrelated blobs, and it is the shape any later page-level node
 * (`isPartOf: { '@id': …/#website' }`) can point at without redefining anything.
 *
 * ── WHAT IS DELIBERATELY ABSENT ────────────────────────────────────────────
 * `sameAs` names ONE profile, and that is the whole of what exists today. §6 of
 * this card's brief lists GitHub / Product Hunt / G2 / X, but the directory
 * listings are MOTIR-1156's deliverable and none of them has been created — a
 * `sameAs` entry pointing at a 404 is an anti-signal, not a placeholder, because
 * the property's entire meaning is "this is the same entity, verifiably". The
 * landing's own proof band draws those four as EMPTY SLOTS for exactly the same
 * reason (`design/marketing/design-notes.md`). When MOTIR-1156 lands a listing,
 * its URL is one line here.
 *
 * `logo` is an SVG, and it is the ONE place the mark is served from on this
 * origin. It is a build output of `@motir/brand`'s `waveBandSvg()` rather than a
 * hand-drawn copy, and `tests/brandAsset.test.ts` asserts the committed file
 * still equals what that function produces — so the mark cannot drift here the
 * way a second inline copy of the artwork did in motir-core's own mock.
 */

/** The Organization node's stable identifier within the graph. */
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`
/** The WebSite node's stable identifier within the graph. */
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`

/**
 * The brand's other official profile. `moooon-B-V` is the GitHub organisation
 * both repositories live under, and the footer's `GitHub` link already sends a
 * reader into it — so it is a profile a crawler can corroborate, which is the
 * only kind that belongs in `sameAs`.
 */
export const SAME_AS = ['https://github.com/moooon-B-V']

/**
 * The graph, built as a plain object so it can be asserted in a test without
 * rendering. Nothing here is user-controlled: every value is a module constant
 * or a string from the copy catalogue.
 */
export function buildRootJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Motir',
        url: siteUrl('/'),
        logo: siteUrl('/motir-mark.svg'),
        description: copy.meta.description,
        sameAs: SAME_AS,
        // The legal entity behind the brand, exactly as the footer states it:
        // "Motir is a product of moooon B.V." — Motir is not itself the company,
        // so this is a parent rather than a `legalName` on the same node.
        parentOrganization: {
          '@type': 'Organization',
          name: 'moooon B.V.',
        },
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'Motir',
        url: siteUrl('/'),
        description: copy.meta.description,
        inLanguage: 'en',
        publisher: { '@id': ORGANIZATION_ID },
        // ⚠️ THE TARGET IS A REAL, SHIPPED SEARCH, AND IT NOW LIVES ON THIS
        // ORIGIN (MOTIR-4045). `/explore` moved from motir-core onto motir.co,
        // and `?q=` is its free-text search — a genuine URL param the page
        // parses. Declaring an action a visitor cannot actually perform is the
        // failure mode this property has; pointing it at the surface that
        // performs it, on the origin that hosts it, is not.
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl('/explore')}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

/**
 * Injected once, site-wide, from the root layout. `<script
 * type="application/ld+json">` is the standard structured-data carrier and the
 * same one motir-core's public surface uses.
 */
export function RootJsonLd() {
  return (
    <script
      type="application/ld+json"
      // `JSON.stringify` of a server-built object with no user-controlled keys
      // or values — the same posture as motir-core's `PublicProjectJsonLd`.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(buildRootJsonLd()) }}
    />
  )
}
