import { THEME_STORAGE_KEYS } from '@motir/design-system'

/*
 * motir.co's own default type: the Grotesk pairing (2026-10 redesign). The
 * design system's init script resolves an unpicked type to the style's default
 * (Motir: serif headlines); this runs right after it and re-points ONLY the
 * visitor who has picked neither a type nor a style, so a choice made on
 * /design — or in the app on this browser — still wins.
 */
export const siteDefaultTypeScript = `(function(){try{var ls=window.localStorage;if(!ls.getItem(${JSON.stringify(
  THEME_STORAGE_KEYS.type,
)})&&!ls.getItem(${JSON.stringify(
  THEME_STORAGE_KEYS.style,
)})){document.documentElement.setAttribute('data-type','grotesk');}}catch(e){}})();`
