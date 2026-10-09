import {
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  LXGW_WenKai_TC,
  M_PLUS_Rounded_1c,
  Nanum_Gothic,
  Noto_Sans_JP,
  Noto_Sans_KR,
  Noto_Sans_SC,
  Noto_Serif_JP,
  Noto_Serif_KR,
  Noto_Serif_SC,
  Source_Serif_4,
  Space_Grotesk,
} from 'next/font/google'

/*
 * EVERY FACE motir.co DRAWS, DECLARED ONCE (MOTIR-7952).
 *
 * The two documents that own an `<html>` — the locale layout and the global
 * 404 — both render `SiteDocument`, which reads {@link fontVariables} from
 * here. This file mirrors motir-core's `app/fonts.ts` (MOTIR-7847), so the two
 * sites load the same faces under the same variable names.
 *
 * ── The six pairing faces ────────────────────────────────────────────────
 *
 * The Latin faces the six Type pairings name, loaded as the RAW `-source`
 * variables the token layer reads.
 *
 * ⚠️ THE VARIABLE NAME MUST BE THE `-source` ONE. `theme.css` declares the
 * ROLE tokens as `--font-sans: var(--font-sans-source, <fallbacks>)`, and the
 * `[data-type]` blocks re-point those roles. Naming a loader variable
 * `--font-sans` directly would leave every `var(--font-*-source)` reference
 * unresolved and quietly disable the whole type axis.
 *
 * ⚠️ `latin-ext` AS WELL AS `latin`, so ą ę ł ś ź ż ó and the other accents
 * the Polish, German, French and other Latin-script pages carry draw in the
 * pairing's face rather than a fallback (motir-core MOTIR-7842 did the same).
 *
 * The site has a picker (`/design`, MOTIR-1043), so it loads all SIX pairings'
 * faces. The three non-default ones carry `preload: false`: the landing's first
 * paint is unchanged and only a visitor who picks one of those pairings pays
 * for the face. Two of the three would fail HARD rather than degrade —
 * `[data-type='grotesk']` and `[data-type='editorial']` read their `-source`
 * variable with NO in-var fallback.
 *
 * `tests/typeFaces.test.ts` reads every `-source` variable the installed
 * `theme.css` references and asserts this file defines each one.
 */
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans-source',
  display: 'swap',
})
const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif-source',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono-source',
  display: 'swap',
})
// `grotesk` — Space Grotesk throughout (headlines + body/UI).
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-grotesk-source',
  display: 'swap',
  preload: false,
})
// `editorial` — Fraunces display headlines over the Inter body.
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-editorial-source',
  display: 'swap',
  preload: false,
})
// `mono-technical` — IBM Plex Mono throughout. Not a variable font, so the
// weights it is used at are enumerated rather than inherited from an axis.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-technical-source',
  display: 'swap',
  preload: false,
})

/*
 * ── The font sets (Story MOTIR-7733 · MOTIR-7737) ────────────────────────
 *
 * One loader per FACE in `@motir/design-system`'s `FONT_SET_REGISTRY`: the CJK
 * faces a zh, ja or ko page's script is drawn in, BEHIND the pairing's Latin
 * faces. `variable` is the name `fontSetMemberVar(set, role, member)` returns;
 * next/font takes only literal options, so the names are written out and
 * `tests/fontSetFaces.test.ts` holds them to the installed registry. A CJK mono
 * role re-uses its set's sans face, so it has no loader of its own.
 *
 * ⚠️ DECLARING A FACE DOWNLOADS NOTHING BY ITSELF — which is why these are not
 * gated per locale here. Each loader emits `@font-face` rules, one per
 * `unicode-range` slice, and the browser fetches a slice only when an element's
 * `font-family` names the family AND a rendered character falls in it. The
 * installed `theme.css` names a CJK family only under its own `:lang()` block,
 * so an English page fetches no CJK file and a `ja` page no `zh` or `ko` file
 * (`e2e/specs/fontSets.spec.ts` measures exactly that). `preload: false` keeps
 * every CJK file out of the preload list, which would otherwise download it on
 * every page. No `subsets`: next/font fetches every slice regardless and uses
 * `subsets` only to choose what to preload. Static faces declare the set's two
 * weights, `400` and `700`.
 */
const notoSansSC = Noto_Sans_SC({
  variable: '--font-set-zh-Hans-sans-noto-sans-sc',
  display: 'swap',
  preload: false,
})
const notoSerifSC = Noto_Serif_SC({
  variable: '--font-set-zh-Hans-serif-noto-serif-sc',
  display: 'swap',
  preload: false,
})
const lxgwWenKaiTC = LXGW_WenKai_TC({
  weight: ['400', '700'],
  variable: '--font-set-zh-Hans-serif-lxgw-wenkai-tc',
  display: 'swap',
  preload: false,
})
const notoSansJP = Noto_Sans_JP({
  variable: '--font-set-ja-sans-noto-sans-jp',
  display: 'swap',
  preload: false,
})
const mPlusRounded1c = M_PLUS_Rounded_1c({
  weight: ['400', '700'],
  variable: '--font-set-ja-sans-m-plus-rounded-1c',
  display: 'swap',
  preload: false,
})
const notoSerifJP = Noto_Serif_JP({
  variable: '--font-set-ja-serif-noto-serif-jp',
  display: 'swap',
  preload: false,
})
const notoSansKR = Noto_Sans_KR({
  variable: '--font-set-ko-sans-noto-sans-kr',
  display: 'swap',
  preload: false,
})
const nanumGothic = Nanum_Gothic({
  weight: ['400', '700'],
  variable: '--font-set-ko-sans-nanum-gothic',
  display: 'swap',
  preload: false,
})
const notoSerifKR = Noto_Serif_KR({
  variable: '--font-set-ko-serif-noto-serif-kr',
  display: 'swap',
  preload: false,
})

/** Every face's variable class, for an `<html>` element's `className`. */
export const fontVariables = [
  inter.variable,
  sourceSerif.variable,
  jetbrainsMono.variable,
  spaceGrotesk.variable,
  fraunces.variable,
  ibmPlexMono.variable,
  notoSansSC.variable,
  notoSerifSC.variable,
  lxgwWenKaiTC.variable,
  notoSansJP.variable,
  mPlusRounded1c.variable,
  notoSerifJP.variable,
  notoSansKR.variable,
  nanumGothic.variable,
  notoSerifKR.variable,
].join(' ')
