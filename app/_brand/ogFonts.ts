import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { OG_FONT_FAMILY } from '@motir/brand'

// Inter, for the root `next/og` card (MOTIR-1154 · motir-core
// `design/brand/design-notes.md` §6 "OG template").
//
// `next/og` renders through satori, OUTSIDE the CSS tree: it cannot read
// `--font-sans-source`, cannot see the `next/font` faces `app/layout.tsx`
// loads, and has no system font stack to fall back to. The only way it gets a
// typeface is `ImageResponse`'s `fonts` option, and the only thing that option
// accepts is font BYTES — so the faces are read off disk at request time. A
// template that sets `fontFamily: 'sans-serif'` does not error; it silently
// ships whatever face the build container happens to have, which is exactly the
// defect §6 records against motir-core's own two cards.
//
// ⚠️ THE BYTES COME FROM `@motir/brand` NOW, AND THAT IS THE POINT (MOTIR-3848).
// They used to be committed here AND in motir-core — three binaries,
// byte-identical, with no shared owner, against MOTIR-3724's own ruling that
// Motir's brand chrome has ONE home across both properties. The header that
// stood here recorded the duplication as "a known cost, not an oversight",
// because `@motir/brand` published `dist` + `brand.css` and carried no font
// assets; it now carries them, in `fonts/`, listed in `files` and exposed as
// `@motir/brand/fonts/*`. The reasoning that used to live here — WHY THREE
// FILES (400 / 700 / 800, and satori does not synthesise weight) and WHY `.ttf`
// (satori cannot decompress WOFF2, which is all Google Fonts serves a modern
// browser) — travelled with the bytes, into
// `motir-core/packages/brand/src/ogFonts.ts`.
//
// ⚠️ EVERY SEGMENT OF `FONT_DIR` IS A LITERAL, AND `OG_FONT_FACES` IS A LOCAL
// ARRAY OF LITERALS — BOTH DELIBERATELY, AND THIS IS THE ONE THING THE MOVE
// COULD HAVE BROKEN. `outputFileTracingIncludes` is INERT under Next 16's
// Turbopack build (`collect-build-traces.js` is skipped entirely). What actually
// ships these bytes is Turbopack's own tracer, which follows this read only
// BECAUSE the path is statically analysable — a value returned from a function
// call is not, and its fallback for an unresolvable read is to trace the ENTIRE
// project (motir-core MOTIR-3219: 4510 files, a 464 MB standalone image). That
// is why `@motir/brand` exports a MANIFEST and no path helper, and why this file
// repeats the face list rather than mapping over the imported one.
// `tests/ogFonts.test.ts` pins these literals against the package's.
//
// Verify by grepping the built
// `.next/server/app/opengraph-image*/route.js.nft.json` for the file names,
// never by reading the config.

const FONT_DIR = path.join(
  process.cwd(),
  'node_modules',
  '@motir',
  'brand',
  'fonts',
)

/** The faces this site loads, as literals the tracer can follow. */
export const OG_FONT_FACES = [
  { file: 'Inter-Regular.ttf', weight: 400 as const },
  { file: 'Inter-Bold.ttf', weight: 700 as const },
  { file: 'Inter-ExtraBold.ttf', weight: 800 as const },
]

/** The family name the OG template sets as `fontFamily` — the package owns it. */
export { OG_FONT_FAMILY }

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
    OG_FONT_FACES.map(async ({ file, weight }) => ({
      name: OG_FONT_FAMILY,
      data: await readFile(path.join(FONT_DIR, file)),
      weight,
      style: 'normal' as const,
    })),
  )
}
