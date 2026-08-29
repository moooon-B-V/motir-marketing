import type { NextConfig } from 'next'

// `output: 'standalone'` is not a preference here — it is what the host implies.
// `docs/decisions/marketing-site-hosting.md` (motir-core) Q1 puts motir.co on
// Fly as a long-running Node process built from a Dockerfile, the same shape
// motir-core uses. A static export would not serve from this image.
const nextConfig: NextConfig = {
  output: 'standalone',

  /*
   * The OG card's font BYTES (MOTIR-1154). `app/_brand/ogFonts.ts` reads three
   * `.ttf` files through `process.cwd()`, which a WEBPACK dependency trace
   * cannot see — so the directory is named here for it.
   *
   * ⚠️ THE DIRECTORY MOVED (MOTIR-3848). The faces are `@motir/brand`'s now —
   * one home across both Motir properties, per MOTIR-3724 — so the glob names
   * the installed package's `fonts/` rather than a copy committed in this
   * repository. Getting this wrong is silent in BOTH directions under the build
   * that runs, which is the reason the paragraph below exists.
   *
   * ⚠️ THIS KEY IS INERT UNDER THE BUILD THAT ACTUALLY RUNS, and it is kept
   * anyway. `outputFileTracingIncludes` is read in exactly one module,
   * `next/dist/build/collect-build-traces.js`, which `next/dist/build/index.js`
   * invokes only when the bundler is NOT Turbopack — and Next 16 builds with
   * Turbopack by default, which is what `pnpm next build` runs in CI and in the
   * Dockerfile. What ships the bytes today is TURBOPACK's own tracer, which
   * follows the read because `FONT_DIR` and `FACES` are statically analysable.
   *
   * So this is the webpack-path net, nothing more. **Never read its presence as
   * evidence the fonts shipped** — a dead include reads exactly like a
   * delivered asset. The evidence is the built trace:
   *
   *   grep -l Inter- .next/server/app/**\/*.nft.json
   *
   * The key matches with picomatch `{ contains: true }` against the normalised
   * route, so the bare prefix below also matches the content hash Next appends
   * to a metadata route (`/opengraph-image-1br99b`).
   */
  outputFileTracingIncludes: {
    '/opengraph-image': ['./node_modules/@motir/brand/fonts/**'],
  },
}

export default nextConfig
