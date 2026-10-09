import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/i18n/routing'
import { resolveCopy } from '@/lib/copy'

/*
 * THE ELEVEN CATALOGUES AS ONE SET (MOTIR-7967, case 2).
 *
 * Each catalogue card proved its own file. This proves the set: exactly one
 * catalogue per routed locale and no stray, the same keys and array lengths in
 * every one, a source record for each translation, and nothing the reader
 * would quietly swap for English. It also proves the per-catalogue gates READ
 * the set — a shape gate or a copy sweep over an empty directory is green for
 * the wrong reason.
 */

const messages = join(process.cwd(), 'messages')
const read = (file: string) =>
  JSON.parse(readFileSync(join(messages, file), 'utf8')) as unknown

/** The listing `tests/i18nMessageShape.test.ts` and `tests/copy.test.ts` use. */
const CATALOGUE_FILE = /^[a-z]{2,3}(-[A-Za-z0-9]+)?\.json$/
const catalogueFiles = readdirSync(messages)
  .filter((f) => CATALOGUE_FILE.test(f))
  .sort()
const locales = catalogueFiles.map((f) => f.replace(/\.json$/, ''))
const translated = locales.filter((l) => l !== 'en')

/** Every leaf path, with an array's length recorded as a path of its own. */
function shape(node: unknown, prefix = '', out: string[] = []): string[] {
  if (Array.isArray(node)) {
    out.push(`${prefix}[length=${node.length}]`)
    node.forEach((v, i) => shape(v, `${prefix}.${i}`, out))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node))
      shape(v, prefix ? `${prefix}.${k}` : k, out)
  } else {
    out.push(prefix)
  }
  return out
}

describe('the set of catalogues', () => {
  it('is exactly the routed locales — none missing, none extra', () => {
    expect(locales).toEqual([...LOCALES].sort())
    expect(locales).toHaveLength(11)
  })

  it('has a source record for each of the ten translations, and nothing else', () => {
    expect(readdirSync(join(messages, 'sources')).sort()).toEqual(
      translated.map((l) => `${l}.json`),
    )
  })

  it('is what the shape gate and the copy sweeps iterate — ten beside English', () => {
    // Both list `messages/` with this same pattern; a pattern that matched
    // nothing would leave them reading zero catalogues and passing.
    expect(translated).toHaveLength(10)
    for (const gate of ['tests/i18nMessageShape.test.ts', 'tests/copy.test.ts'])
      expect(readFileSync(gate, 'utf8'), gate).toContain(
        String.raw`/^[a-z]{2,3}(-[A-Za-z0-9]+)?\.json$/`,
      )
  })
})

const en = read('en.json')
const enShape = shape(en)

describe.each(translated)('%s', (locale) => {
  const catalogue = read(`${locale}.json`)

  it('has en.json’s exact key set and array lengths', () => {
    expect(shape(catalogue)).toEqual(enShape)
  })

  it('is served as it is — the reader replaces none of its values', () => {
    expect(resolveCopy(catalogue)).toEqual(catalogue)
  })
})
