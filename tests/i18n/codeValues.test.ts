import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { flattenCatalogue } from '@/scripts/i18n/sourceRecord'

/*
 * THE CATALOGUE'S CODE VALUES ARE NOT COPY (MOTIR-7957 … MOTIR-7966).
 *
 * The landing's and the product pages' drawn panels keep a few SWITCH values in
 * en.json beside the words they draw: a run's `tone`, a card's `kind` / `pill` /
 * `ci` / `who`, a chat line's `role`, a node's `key`, a story's `product` slug,
 * the Watch lanes' state (`landing.art.watch.lanes.*.1`), whose turn a history
 * event was (`landing.art.history.events.*.3`) and a plan-tree row's kind
 * (`howItWorks.art.plan.tree.*.0`). The components compare them —
 * `who === 'you'`, `state === 'running'`, `KIND_ICON[kind]` — so a translated
 * one does not read as foreign text: it silently draws the wrong tint, the
 * wrong glyph or nothing. Every catalogue therefore holds en.json's value at
 * each of them, verbatim. A translator who meets one leaves it alone.
 */

const CODE_VALUE =
  /\.(tone|kind|role|pill|ci|who|key|product)$|^landing\.art\.watch\.lanes\.\d+\.1$|^landing\.art\.history\.events\.\d+\.3$|^howItWorks\.art\.plan\.tree\.\d+\.0$/

const messages = join(process.cwd(), 'messages')
const flat = (file: string) =>
  flattenCatalogue(JSON.parse(readFileSync(join(messages, file), 'utf8')))
const en = flat('en.json')
const codeKeys = [...en.keys()].filter((key) => CODE_VALUE.test(key))
const locales = readdirSync(messages)
  .filter(
    (f) => /^[a-z]{2,3}(-[A-Za-z0-9]+)?\.json$/.test(f) && f !== 'en.json',
  )
  .map((f) => f.replace(/\.json$/, ''))
  .sort()

describe('every catalogue keeps en.json’s code values verbatim', () => {
  it('finds the code values it guards', () => {
    // A rename in en.json that moved them all out of the pattern would turn
    // every case below vacuous.
    expect(codeKeys.length).toBeGreaterThan(100)
    expect(codeKeys).toContain('landing.art.history.events.0.3')
    expect(codeKeys).toContain('landing.art.watch.lanes.0.1')
  })

  it.each(locales)('%s', (locale) => {
    const catalogue = flat(`${locale}.json`)
    const translated = codeKeys
      .filter((key) => catalogue.has(key) && catalogue.get(key) !== en.get(key))
      .map((key) => `${key}: ${catalogue.get(key)} (en: ${en.get(key)})`)
    expect(translated).toEqual([])
  })
})
