import { readFile } from 'node:fs/promises'
import path from 'node:path'

// Inter, for the root `next/og` card (MOTIR-1154 · motir-core
// `design/brand/design-notes.md` §6 "OG template").
//
// `next/og` renders through satori, OUTSIDE the CSS tree: it cannot read
// `--font-sans-source`, cannot see the `next/font` faces `app/layout.tsx`
// loads, and has no system font stack to fall back to. The only way it gets a
// typeface is `ImageResponse`'s `fonts` option, and the only thing that option
// accepts is font BYTES — so the faces are committed beside this file and read
// at request time. A template that sets `fontFamily: 'sans-serif'` does not
// error; it silently ships whatever face the build container happens to have,
// which is exactly the defect §6 records against motir-core's own two cards.
//
// WHY THREE FILES. §6's template uses exactly three weights: 400 for the lede,
// 700 for the wordmark, 800 for the headline. satori does not synthesise weight
// — an absent one silently snaps to the nearest present face — so shipping
// fewer would quietly re-weight the design.
//
// WHY `.ttf`. satori parses TTF / OTF / WOFF; it cannot decompress WOFF2, which
// is the only format Google Fonts serves a modern browser. These are the static
// Inter v20 instances Google serves for legacy formats (SIL Open Font License
// 1.1), byte-identical to motir-core's `app/_brand/fonts/` — the same faces the
// two share cards are set in, because the two properties are one brand.
//
// ⚠️ A SECOND COPY OF THREE BINARIES, AND IT IS A KNOWN COST, NOT AN OVERSIGHT.
// `@motir/brand` ships the mark's geometry and colour to both repositories and
// would be the right home for these bytes too, but it is a JS package that
// publishes `dist` and `brand.css` and carries no font assets today — adding
// them is a change in motir-core, and ONE SUBTASK = ONE REPO. Filed rather than
// deferred in prose: see the card this file ships under.
//
// ⚠️ `process.cwd()` + `readFile` is invisible to a webpack tracer, and
// `outputFileTracingIncludes` is INERT under Next 16's Turbopack build
// (`collect-build-traces.js` is skipped entirely). What actually ships these
// bytes is Turbopack's own tracer, which follows this read BECAUSE `FONT_DIR`
// and `FACES` are statically analysable — a path returned from a function call
// is not, and defeats it. Verify by grepping the built
// `.next/server/app/opengraph-image*/route.js.nft.json` for the file names,
// never by reading the config.

const FONT_DIR = path.join(process.cwd(), 'app', '_brand', 'fonts')

const FACES = [
  { file: 'Inter-Regular.ttf', weight: 400 as const },
  { file: 'Inter-Bold.ttf', weight: 700 as const },
  { file: 'Inter-ExtraBold.ttf', weight: 800 as const },
]

/** The family name the OG template sets as `fontFamily`. */
export const OG_FONT_FAMILY = 'Inter'

export interface OgFont {
  name: string
  data: Buffer
  weight: 400 | 700 | 800
  style: 'normal'
}

/**
 * The `fonts` array for `new ImageResponse(..., { fonts })`.
 *
 * Read per request rather than cached at module scope: the OG route is rendered
 * rarely and by a cold function most times it is hit, so a module-level cache
 * buys nothing and would pin ~1 MB in every warm instance of a route that also
 * serves nothing else.
 */
export async function loadOgFonts(): Promise<OgFont[]> {
  return Promise.all(
    FACES.map(async ({ file, weight }) => ({
      name: OG_FONT_FAMILY,
      data: await readFile(path.join(FONT_DIR, file)),
      weight,
      style: 'normal' as const,
    })),
  )
}
