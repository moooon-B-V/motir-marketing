import { useMessages } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import en from '@/messages/en.json'

/**
 * The copy catalogue, read through the page's locale (MOTIR-7950).
 *
 * `messages/en.json` is the baseline and the type: every other locale is a
 * sibling `messages/<locale>.json` with the same key set, and this module turns
 * whatever that file holds into a complete `Copy` by taking English for every
 * key it lacks. A reader therefore never sees a raw key or `undefined`, and a
 * locale with no file at all renders wholly in English.
 *
 * ⚠️ STILL A TYPED OBJECT, NOT `t('…')`. The site reads `copy.landing.hero.cta`
 * and keeps reading it that way. next-intl is used for what a typed import
 * could not give: the request-scoped locale and the server/client handoff
 * (`useMessages`, `NextIntlClientProvider`). The English fallback lives in ONE
 * place, `resolveCopy`, on the server; the client receives the already-merged
 * object, so no component ever handles a missing key.
 *
 * Three ways to read it:
 *  • `useCopy()` — any component that is not `async`, server or client.
 *  • `await getCopy(locale)` — an `async` server component, with the locale
 *    from its `params` (`enterLocale`).
 *  • `englishCopy` — only page METADATA, the share image, the JSON-LD and the
 *    global 404, each of which another card localises.
 *    `tests/i18n/copyReaders.test.ts` holds that list.
 */
export type Copy = typeof en

/** The English catalogue. See the third bullet above for who may import it. */
export const englishCopy: Copy = en

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Merge one value of a locale's catalogue over its English counterpart.
 *
 * The locale's value is taken only where it has English's SHAPE: a non-empty
 * string for a string, an object for an object (merged key by key), an array of
 * the same length for an array (merged item by item). Anything else — a missing
 * key, an empty string, a number, an object where English has a string — is
 * English. Keys English lacks are never visited, so they are dropped.
 */
function merge(english: unknown, local: unknown): unknown {
  if (typeof english === 'string') {
    return typeof local === 'string' && local.length > 0 ? local : english
  }
  if (Array.isArray(english)) {
    if (!Array.isArray(local) || local.length !== english.length) {
      return english
    }
    return english.map((item, index) => merge(item, local[index]))
  }
  if (isRecord(english)) {
    const source = isRecord(local) ? local : {}
    return Object.fromEntries(
      Object.entries(english).map(([key, value]) => [
        key,
        merge(value, source[key]),
      ]),
    )
  }
  // A number or a boolean — a card's child count, a flag on an illustration —
  // is not copy a translator edits, so English's value stands.
  return english
}

/** A locale's catalogue, completed with English per missing key. Pure. */
export function resolveCopy(partial: unknown): Copy {
  return merge(en, partial) as Copy
}

/** Loads one locale's catalogue file; rejects when it does not exist. */
export type CatalogueLoader = (locale: Locale) => Promise<unknown>

/**
 * ⚠️ A TEMPLATE `import()`, SO A NEW LOCALE IS A FILE AND NOTHING ELSE. The
 * bundler turns `../messages/${locale}.json` into one chunk per file present in
 * `messages/` at build time; a translation card adds `messages/ja.json` and
 * this line already reaches it. Relative rather than `@/`, because that is the
 * form both Next's bundler and Vite resolve as a variable import.
 */
const loadCatalogue: CatalogueLoader = async (locale) =>
  (await import(`../messages/${locale}.json`)).default

/**
 * "This locale has no catalogue file" — the ONE failure that means English.
 * Node and webpack say `MODULE_NOT_FOUND`; Vite's variable import says it has
 * no such file. Anything else (a malformed file, a bundler fault) is rethrown.
 */
function isMissingCatalogue(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const code = (error as { code?: unknown }).code
  return (
    code === 'MODULE_NOT_FOUND' ||
    code === 'ERR_MODULE_NOT_FOUND' ||
    /^Cannot find module\b|^Unknown variable dynamic import\b/.test(
      error.message,
    )
  )
}

const resolved = new Map<Locale, Promise<Copy>>()

/**
 * The page's catalogue, English per missing key — SERVER-side, memoised per
 * locale. `en` is the English object itself, never a load.
 *
 * `load` is the seam the fallback tests use; a caller in the app passes only
 * the locale, and only that call is memoised.
 */
export function getCopy(
  locale: Locale,
  load: CatalogueLoader = loadCatalogue,
): Promise<Copy> {
  if (locale === 'en') return Promise.resolve(englishCopy)
  const read = async () => {
    try {
      return resolveCopy(await load(locale))
    } catch (error) {
      if (isMissingCatalogue(error)) return englishCopy
      throw error
    }
  }
  if (load !== loadCatalogue) return read()
  let pending = resolved.get(locale)
  if (!pending) {
    pending = read()
    resolved.set(locale, pending)
  }
  return pending
}

/**
 * The namespaces a `'use client'` module reads — and so the only part of the
 * catalogue the locale layout sends to the browser.
 *
 * ⚠️ MEASURED, NOT TIDY. Handing the providers the whole catalogue put every
 * namespace into every page's payload, most of it `products` (26 KB) that no
 * client module reads: `/docs/mcp` measured 211,265 bytes that way and
 * 168,544 with this list (same build, same stub).
 * The global 404's provider is the second sender, and it matters as much:
 * Next puts that boundary into EVERY page's payload. A client module that
 * starts reading another namespace adds it here, and
 * `tests/i18n/copyReaders.test.ts` fails until it does.
 */
export const CLIENT_COPY_NAMESPACES = [
  'nav',
  'setupPrompt',
  'landing',
  'designShowcase',
  'docs',
  'howItWorks',
] as const satisfies readonly (keyof Copy)[]

/** The part of a catalogue the browser receives: `CLIENT_COPY_NAMESPACES`. */
export function clientCopy(
  copy: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    CLIENT_COPY_NAMESPACES.map((namespace) => [namespace, copy[namespace]]),
  )
}

/**
 * The page's catalogue in a component that is not `async` — server or client.
 * It is next-intl's `useMessages()`, which `i18n/request.ts` fills with
 * `getCopy(locale)` and the locale layout hands to the client through
 * `NextIntlClientProvider`, so both halves read the same merged object.
 */
export function useCopy(): Copy {
  return useMessages() as unknown as Copy
}

/**
 * Fill `{name}` placeholders. Two strings carry them — the character counter
 * and the copyright year — and a template literal in the component would put
 * half of each sentence back in the JSX, which is the thing the catalogue
 * exists to prevent.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  )
}
