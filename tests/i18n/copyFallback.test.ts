import { describe, expect, it } from 'vitest'
import { englishCopy, getCopy, resolveCopy } from '@/lib/copy'
import en from '@/messages/en.json'

/*
 * The per-key English fallback (MOTIR-7950). The story's rule is "English
 * fallback, never a key": whatever a locale's catalogue holds, a reader gets a
 * complete `Copy`, and every key the locale lacks reads its English text.
 */

/** Every leaf path whose value is not a string. */
function nonStringLeaves(value: unknown, path = ''): string[] {
  if (typeof value === 'string') return []
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => nonStringLeaves(item, `${path}[${i}]`))
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      nonStringLeaves(item, `${path}.${key}`),
    )
  }
  return [path]
}

const clone = <T>(value: T): T => structuredClone(value)

describe('resolveCopy', () => {
  it('is English, whole, for an empty catalogue', () => {
    expect(resolveCopy({})).toEqual(en)
    expect(resolveCopy(undefined)).toEqual(en)
  })

  it('takes a translated key, and English for a deleted one', () => {
    const local = clone(en) as Omit<typeof en, 'nav'> & {
      nav: Omit<typeof en.nav, 'productGroups'> & {
        productGroups: Partial<typeof en.nav.productGroups>
      }
    }
    local.nav.skipToContent = 'Zum Inhalt springen'
    delete local.nav.productGroups.ai
    const resolved = resolveCopy(local)
    expect(resolved.nav.skipToContent).toBe('Zum Inhalt springen')
    expect(resolved.nav.productGroups.ai).toBe(en.nav.productGroups.ai)
  })

  it('falls back to English for every value of the wrong shape', () => {
    const resolved = resolveCopy({
      meta: { title: 42, description: '' },
      nav: { explore: { nested: 'no' }, ideas: ['a'] },
      landing: {
        projectManager: { points: ['only one'] },
        builtByMotir: { points: 'not a list' },
        art: { plan: { rows: [['a', 'b'], 'x', null, ['c', 'd']] } },
      },
      footer: 'not an object',
    })
    expect(resolved.meta.title).toBe(en.meta.title)
    expect(resolved.meta.description).toBe(en.meta.description)
    expect(resolved.nav.explore).toBe(en.nav.explore)
    expect(resolved.nav.ideas).toBe(en.nav.ideas)
    // An array of another length is English whole.
    expect(resolved.landing.projectManager.points).toEqual(
      en.landing.projectManager.points,
    )
    expect(resolved.landing.builtByMotir.points).toEqual(
      en.landing.builtByMotir.points,
    )
    // An array of the same length merges item by item.
    expect(resolved.landing.art.plan.rows).toEqual([
      ['a', 'b'],
      en.landing.art.plan.rows[1],
      en.landing.art.plan.rows[2],
      ['c', 'd'],
    ])
    expect(resolved.footer).toEqual(en.footer)
    // No leaf went missing: the only non-string leaves are English's own
    // numbers and booleans (card counts, flags), never an `undefined`.
    expect(nonStringLeaves(resolved)).toEqual(nonStringLeaves(en))
  })

  it('drops a key English does not have', () => {
    const resolved = resolveCopy({
      nav: { explore: 'Entdecken', notAKey: 'x' },
      notANamespace: { a: 'b' },
    })
    expect(resolved.nav.explore).toBe('Entdecken')
    expect('notAKey' in resolved.nav).toBe(false)
    expect('notANamespace' in resolved).toBe(false)
    expect(Object.keys(resolved)).toEqual(Object.keys(en))
  })
})

describe('getCopy', () => {
  it('is the English object itself for en', async () => {
    expect(await getCopy('en')).toBe(englishCopy)
  })

  it('reads the real catalogue file for a translated locale', async () => {
    // Written while no `messages/ja.json` existed, this asserted English; the
    // catalogue cards (MOTIR-7957 … 7966) shipped every file, so the real
    // loader now reads one. A MISSING file is still English — the
    // "module not found" cases below drive that through the loader seam.
    const ja = (await import('@/messages/ja.json')).default
    expect(await getCopy('ja')).toEqual(resolveCopy(ja))
    expect((await getCopy('ja')).meta.title).toBe(ja.meta.title)
  })

  it('reads a catalogue a loader returns, with English filled in', async () => {
    const copy = await getCopy('de', async () => ({
      nav: { skipToContent: 'Zum Inhalt springen' },
    }))
    expect(copy.nav.skipToContent).toBe('Zum Inhalt springen')
    expect(copy.nav.explore).toBe(en.nav.explore)
  })

  it('treats "module not found" as English', async () => {
    const missing = Object.assign(new Error("Cannot find module './ko.json'"), {
      code: 'MODULE_NOT_FOUND',
    })
    expect(
      await getCopy('ko', async () => {
        throw missing
      }),
    ).toEqual(en)
  })

  it('rethrows any other loader failure', async () => {
    const broken = new SyntaxError('Unexpected token } in JSON at position 9')
    await expect(
      getCopy('fr', async () => {
        throw broken
      }),
    ).rejects.toBe(broken)
  })
})
