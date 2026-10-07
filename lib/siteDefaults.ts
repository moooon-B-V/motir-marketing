import { THEME_STORAGE_KEYS } from '@motir/design-system'

/*
 * motir.co's own appearance defaults (2026-10 redesign), applied right after
 * the design system's `themeInitScript` (`app/layout.tsx`) and only where the
 * visitor has chosen nothing:
 *
 *   - STYLE: Hand-Drawn / Indie, when no style is stored.
 *   - TYPE: the Grotesk pairing, when neither a type nor a style is stored.
 *     Hand-drawn's own default type is the serif `editorial` pairing, which
 *     motir.co does not use; a visitor who PICKS a style still gets that
 *     style's own type, as the app gives it.
 *
 * A stored choice always wins: the script only fills what is empty, and it
 * writes nothing to storage, so the Appearance pickers still read "nothing
 * chosen" and the app's own defaults are untouched.
 */
export const SITE_DEFAULT_STYLE = 'hand-drawn-indie'
export const SITE_DEFAULT_TYPE = 'grotesk'

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
  value.replace(/[<>/\\\b\f\n\r\t\0\u2028\u2029]/g, char => SCRIPT_UNSAFE_CHAR_MAP[char] ?? char)

export const siteDefaultsScript = `(function(){try{var ls=window.localStorage,d=document.documentElement;var style=ls.getItem(${escapeUnsafeScriptChars(
  JSON.stringify(THEME_STORAGE_KEYS.style),
)}),type=ls.getItem(${escapeUnsafeScriptChars(
  JSON.stringify(THEME_STORAGE_KEYS.type),
)});if(!style){d.setAttribute('data-style',${escapeUnsafeScriptChars(
  JSON.stringify(SITE_DEFAULT_STYLE),
)});}if(!style&&!type){d.setAttribute('data-type',${escapeUnsafeScriptChars(
  JSON.stringify(SITE_DEFAULT_TYPE),
)});}}catch(e){}})();`
