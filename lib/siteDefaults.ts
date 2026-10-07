import {
  DEFAULT_PALETTE_ID,
  STYLE_DEFAULT_TYPE,
  THEME_STORAGE_KEYS,
  type PaletteId,
  type StyleId,
  type TypeId,
} from '@motir/design-system'

/*
 * motir.co's own appearance (MOTIR-7724) — the ONE look every page is served:
 *
 *   - THEME: light. Never resolved from `prefers-color-scheme`; a visitor sees
 *     dark only by picking it on `/design`, and only for that visit.
 *   - STYLE: Hand-Drawn / Indie (the 2026-10 redesign).
 *   - PALETTE: the design system's default.
 *   - TYPE: the Grotesk pairing. Hand-drawn's own default type is the serif
 *     `editorial` pairing, which motir.co does not use; a visitor who PICKS
 *     another style on `/design` gets that style's own type, as the app gives
 *     it (`siteTypeForStyle`).
 *
 * ⚠️ NOTHING IS STORED, AND NOTHING STORED IS READ. `app/layout.tsx` renders
 * these four as attributes on `<html>`, server-side, so they are right on the
 * first byte with no init script. The site used to run the package's
 * `themeInitScript`, which followed the OS into dark mode and replayed every
 * `/design` choice from `localStorage` on every page and every later visit;
 * a `/design` pick now lasts for the visit only (`lib/useVisitAppearance.ts`)
 * and writes no storage.
 */
export const SITE_DEFAULT_STYLE: StyleId = 'hand-drawn-indie'
export const SITE_DEFAULT_TYPE: TypeId = 'grotesk'

export const SITE_APPEARANCE = {
  pattern: 'light',
  style: SITE_DEFAULT_STYLE,
  palette: DEFAULT_PALETTE_ID as PaletteId,
  type: SITE_DEFAULT_TYPE,
} as const

/** The `<html>` attributes every motir.co page is served with. */
export const siteAppearanceAttributes = {
  'data-theme': SITE_APPEARANCE.pattern,
  'data-style': SITE_APPEARANCE.style,
  'data-palette': SITE_APPEARANCE.palette,
  'data-type': SITE_APPEARANCE.type,
} as const

/**
 * The type pairing a style wears on motir.co when the visitor has not pinned
 * one: Grotesk under the site's own style, the style's own default otherwise.
 */
export function siteTypeForStyle(style: StyleId): TypeId {
  return style === SITE_DEFAULT_STYLE
    ? SITE_DEFAULT_TYPE
    : (STYLE_DEFAULT_TYPE[style] as TypeId)
}

const SCRIPT_UNSAFE_CHAR_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
}

const escapeUnsafeScriptChars = (value: string): string =>
  value.replace(
    /[<>/\\\b\f\n\r\t\0\u2028\u2029]/g,
    (char) => SCRIPT_UNSAFE_CHAR_MAP[char] ?? char,
  )

/*
 * Forgets what the old persisting `/design` wrote. Nothing reads these keys
 * any more, so this changes nothing a visitor sees; it only stops a choice
 * made before MOTIR-7724 from sitting in their browser indefinitely.
 */
export const clearStoredAppearanceScript = `(function(){try{var ls=window.localStorage,k=${escapeUnsafeScriptChars(
  JSON.stringify(Object.values(THEME_STORAGE_KEYS)),
)};for(var i=0;i<k.length;i++){ls.removeItem(k[i]);}}catch(e){}})();`
