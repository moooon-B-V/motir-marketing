import type { Page } from '@playwright/test'

/*
 * WHICH FACE A FONT FILE BELONGS TO (MOTIR-7952, shared by MOTIR-7968).
 *
 * `next/font` self-hosts under hashed names, so a request URL does not name
 * its family. The page's own `@font-face` rules do: each `src` url maps to the
 * `font-family` it declares. `fontSets.spec.ts` and the eleven-languages
 * acceptance walk both read requests through this.
 */

/** Each CJK set's faces, by the family names next/font gives them. */
export const SET_FAMILIES = {
  zh: ['Noto Sans SC', 'Noto Serif SC', 'LXGW WenKai TC'],
  ja: ['Noto Sans JP', 'M PLUS Rounded 1c', 'Noto Serif JP'],
  ko: ['Noto Sans KR', 'Nanum Gothic', 'Noto Serif KR'],
} as const

export const CJK_FAMILIES: readonly string[] =
  Object.values(SET_FAMILIES).flat()

/** Record every font file the page requests, as a same-origin pathname. */
export function watchFontRequests(page: Page): string[] {
  const requested: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (/\.woff2$/.test(url.pathname)) requested.push(url.pathname)
  })
  return requested
}

/** `@font-face` src pathname → family, read from the page's own stylesheets. */
export async function fontFaceFamilies(
  page: Page,
): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const map: Record<string, string> = {}
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList
      try {
        rules = sheet.cssRules
      } catch {
        continue
      }
      for (const rule of Array.from(rules)) {
        if (!(rule instanceof CSSFontFaceRule)) continue
        const family = rule.style
          .getPropertyValue('font-family')
          .replace(/["']/g, '')
          .trim()
        const src = rule.style.getPropertyValue('src')
        // ⚠️ AGAINST THE STYLESHEET, NOT THE PAGE. A Turbopack build writes
        // `url(../media/….woff2)`, relative to the CSS file; resolved against
        // the page it names a path nothing fetched. Webpack (what `pnpm build`
        // runs) writes absolute urls, which resolve the same either way.
        const base = sheet.href ?? location.href
        for (const [, href] of src.matchAll(/url\("?([^")]+)"?\)/g)) {
          map[new URL(href!, base).pathname] = family
        }
      }
    }
    return map
  })
}

/** The families of every font file the page fetched. */
export async function fetchedFamilies(
  page: Page,
  requested: string[],
): Promise<Set<string>> {
  const families = await fontFaceFamilies(page)
  return new Set(
    requested.map((path) => families[path]).filter((f) => f !== undefined),
  )
}

/** Let the browser lay out what was just added and settle every font load. */
export async function settleFonts(page: Page): Promise<void> {
  // A layout, then the font set settling: every load the new text triggered
  // has started by the frame after it rendered, and `ready` waits for them all.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            void document.fonts.ready.then(() => resolve())
          }),
        ),
      ),
  )
}
