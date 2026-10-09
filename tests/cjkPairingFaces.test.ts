// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  FONT_SET_REGISTRY,
  TYPE_IDS,
  fontSetMemberVar,
} from '@motir/design-system'
import {
  CJK_PAIRING_FACES,
  CJK_SETS,
  CJK_SET_LANG,
} from '@/app/_brand/cjkPairingFaces'

/*
 * CJK TEXT FOLLOWS THE TYPE PAIRING. The table in `app/_brand/cjkPairingFaces.ts`
 * says which face each pairing draws Han, kana and hangul from; `globals.css`
 * is where the browser reads it. This holds the two together, and every face
 * the table names to the installed font-set registry, so a package bump that
 * drops a member fails here rather than silently falling back.
 */

const GLOBALS = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

/** `[lang][data-type='x']:lang(l) { … }` → "x/l" → its declarations. */
function cssRules(): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>()
  const block = /\[lang\]\[data-type='([\w-]+)'\]:lang\((\w+)\)\s*\{([^}]*)\}/g
  for (const [, type, lang, body] of GLOBALS.matchAll(block)) {
    const decls = new Map<string, string>()
    for (const [, prop, value] of (body ?? '').matchAll(
      /(--font-script-\w+):\s*([^;]+);/g,
    )) {
      decls.set(prop ?? '', (value ?? '').trim())
    }
    rules.set(`${type}/${lang}`, decls)
  }
  return rules
}

/** What the table says each rule must declare. */
function expectedRules(): Map<string, Map<string, string>> {
  const rules = new Map<string, Map<string, string>>()
  for (const type of TYPE_IDS) {
    for (const set of CJK_SETS) {
      const decls = new Map<string, string>()
      for (const slot of ['serif', 'sans'] as const) {
        const face = CJK_PAIRING_FACES[type][set][slot]
        if (!face) continue
        const variable = fontSetMemberVar(set, face[0], face[1])
        const generic =
          slot === 'serif' && face[0] === 'serif' ? 'serif' : 'sans-serif'
        decls.set(`--font-script-${slot}`, `var(${variable}, ${generic})`)
      }
      if (decls.size > 0) rules.set(`${type}/${CJK_SET_LANG[set]}`, decls)
    }
  }
  return rules
}

describe('CJK faces follow the Type pairing', () => {
  it('maps every pairing the installed design system registers', () => {
    expect(new Set(Object.keys(CJK_PAIRING_FACES))).toEqual(new Set(TYPE_IDS))
  })

  it('names only faces the installed font sets list', () => {
    for (const type of TYPE_IDS) {
      for (const set of CJK_SETS) {
        for (const face of Object.values(CJK_PAIRING_FACES[type][set])) {
          const [role, member] = face
          const listed = FONT_SET_REGISTRY[set].roles[role].members.map(
            (m) => m.id,
          )
          expect(listed, `${type}/${set}`).toContain(member)
          expect(fontSetMemberVar(set, role, member)).not.toBeNull()
        }
      }
    }
  })

  it('globals.css declares exactly the table', () => {
    const actual = cssRules()
    const expected = expectedRules()
    expect([...actual.keys()].sort()).toEqual([...expected.keys()].sort())
    for (const [key, decls] of expected) {
      expect(Object.fromEntries(actual.get(key) ?? []), key).toEqual(
        Object.fromEntries(decls),
      )
    }
  })

  it('gives an all-sans pairing sans headlines, and keeps the house pairing on the defaults', () => {
    for (const set of CJK_SETS) {
      expect(CJK_PAIRING_FACES.grotesk[set].serif?.[0]).toBe('sans')
      expect(CJK_PAIRING_FACES.motir[set]).toEqual({})
    }
  })
})
