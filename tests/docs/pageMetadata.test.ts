// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { copy } from '@/lib/copy'

/*
 * EVERY `/docs` PAGE PUBLISHES ITS OWN TITLE (MOTIR-4429).
 *
 * ── The defect this closes, which is a REGRESSION of a fixed one ────────────
 * `app/docs/layout.tsx` exported the only metadata in the tree and every page
 * inherited it, so `/docs/mcp`, `/docs/cli`, `/docs/sandbox`, `/docs/api` and
 * the rest all published "Docs · Motir" — in the browser tab, in search
 * results, in a shared link's preview, and to a screen reader on arrival.
 *
 * That is exactly the defect MOTIR-2526 fixed in motir-core, page by page,
 * before the cutover; `lib/apiDocs/pageMetadata.ts` and eight
 * `generateMetadata` exports were deleted with the pages and nothing replaced
 * them. MOTIR-4397's parity ledger did not measure it — its instrument was
 * rendered TEXT — which is precisely why it is in this card: the ledger's own
 * last criterion is that every difference is restored or recorded, and a
 * difference nobody's instrument could see is the family this whole bug is
 * about.
 *
 * ── Why the check is structural rather than a render ────────────────────────
 * Nothing FAILS when a page inherits: the shell supplies a title, so every
 * page has one. It is invisible from inside the product and visible only from
 * outside it. So the check reads the file system — every page under `app/docs`
 * must carry the export — which also means a page added tomorrow is covered
 * without anybody remembering to add a case.
 *
 * ── THE PATTERN, chosen once and applied to all of them ─────────────────────
 *
 *     <page> · Motir docs                     — a page that IS a surface
 *     <page> · <surface> · Motir docs         — a page INSIDE a surface
 *
 * The middle segment appears exactly when the page is not itself the surface,
 * which is the same fact the rail's second tier is gated on, read one layer
 * out.
 */

const DOCS_ROOT = join(process.cwd(), 'app', 'docs')

/**
 * ⚠️ THE ONE EXEMPT ROUTE, by name and with its reason. `/docs` INHERITS the
 * layout's metadata deliberately: `docs.metaTitle` is the AREA's identity and
 * that page IS the area. Every other page inheriting it is the defect.
 */
const INHERITS = new Set([join(DOCS_ROOT, '(guides)', 'page.tsx')])

/** Every `page.tsx` under `app/docs`, found rather than listed. */
function docsPages(dir: string = DOCS_ROOT): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return docsPages(full)
    return entry === 'page.tsx' ? [full] : []
  })
}

describe('every /docs page publishes its own title and description', () => {
  const pages = docsPages()

  it('finds the pages at all — a walk that returns nothing passes vacuously', () => {
    // The floor exists because this whole suite is about a check that measured
    // the wrong thing. A file walk that silently found nothing would be green.
    expect(pages.length).toBeGreaterThanOrEqual(9)
  })

  for (const page of pages.filter((path) => !INHERITS.has(path))) {
    const relative = page.slice(process.cwd().length + 1)

    it(`${relative} exports its own metadata`, () => {
      const source = readFileSync(page, 'utf8')
      expect(source).toMatch(/export const metadata\s*=/)
      // Read from the catalogue, not typed into the page — the same rule every
      // rendered string in this repository follows.
      expect(source).toMatch(/title:\s*copy\.docs\.metaTitle/)
      expect(source).toMatch(/description:\s*copy\.docs\.metaDescription/)
    })
  }

  it('the index INHERITS, deliberately — and it is the only one', () => {
    const source = readFileSync([...INHERITS][0]!, 'utf8')
    expect(source).not.toMatch(/export const metadata/)
  })
})

describe('the titles follow one pattern, so a reader can place a tab', () => {
  const titles = {
    metaTitleReference: 'API reference · Motir docs',
    metaTitleGuide: 'Getting started · API reference · Motir docs',
    metaTitleStability: 'Stability & deprecation · API reference · Motir docs',
    metaTitleMcp: 'MCP server · Motir docs',
    metaTitleMcpTools: 'Tools · MCP server · Motir docs',
    metaTitleCli: 'Motir CLI · Motir docs',
    metaTitleSandbox: 'Agent sandbox · Motir docs',
    metaTitlePublicAddress: 'Public address · Motir docs',
  } as const

  for (const [key, expected] of Object.entries(titles)) {
    it(`${key} carries the surface segment it should`, () => {
      expect(copy.docs[key as keyof typeof copy.docs]).toBe(expected)
    })
  }

  it('every one of them ends in the area, and every description is a sentence', () => {
    for (const [key, value] of Object.entries(copy.docs)) {
      if (key.startsWith('metaTitle') && key !== 'metaTitle') {
        expect(value, key).toMatch(/ · Motir docs$/)
      }
      if (key.startsWith('metaDescription') && key !== 'metaDescription') {
        // Long enough to say something, short enough for a search result.
        expect(String(value).length, key).toBeGreaterThan(60)
        expect(String(value).length, key).toBeLessThan(200)
      }
    }
  })
})
