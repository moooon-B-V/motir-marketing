import { DEFAULT_LOCALE, type Locale } from './routing'

/**
 * A site path in one locale's spelling (MOTIR-7955) — `/explore` in `fr` is
 * `/fr/explore`, `/` is `/fr`, and English keeps the unprefixed address
 * (`localePrefix: 'as-needed'`). A query or a fragment rides along.
 *
 * Pure, so a SYNCHRONOUS server component — the locale 404 boundary — can call
 * it with no request read. The room's two doors are its first callers; the
 * chrome's links are MOTIR-7971's, which folds this into the one helper they
 * all use.
 */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path
  // `/` and `/?q=…` hang off the locale root itself, not `/fr/`.
  return `/${locale}${path === '/' || /^\/[?#]/.test(path) ? path.slice(1) : path}`
}
