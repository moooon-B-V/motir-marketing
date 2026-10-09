// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  FONT_SET_IDS,
  FONT_SET_REGISTRY,
  FONT_SET_ROLES,
  fontSetMemberVar,
  type FontSetMember,
} from '@motir/design-system'

/*
 * `app/fonts.ts` DECLARES EVERY FONT-SET FACE THE INSTALLED PACKAGE NAMES
 * (MOTIR-7952 — a port of motir-core's `tests/theme/fontSetFaces.test.ts`).
 *
 * next/font takes only literal options, so the file cannot call
 * `fontSetMemberVar` itself; this reads the source and holds each literal to
 * the registry the INSTALLED `@motir/design-system` exports. It cannot import
 * the module (next/font's loaders exist only under the Next compiler), so it
 * reads the call expressions. A face added to the registry by a package bump
 * fails here until a loader declares it.
 */

const FONTS_TS = readFileSync(join(process.cwd(), 'app/fonts.ts'), 'utf8')

/** `const <name> = <Export>({ … })` → { name, loader, body }. */
const LOADERS = [
  ...FONTS_TS.matchAll(/const (\w+) = (\w+)\(\{([^}]*)\}\)/g),
].map((m) => ({ name: m[1] ?? '', loader: m[2] ?? '', body: m[3] ?? '' }))

/** Each distinct face the registry names, with the variable it is read through. */
function registryFaces() {
  const faces = new Map<
    string,
    { googleFamily: string; variable: string; cjk: boolean }
  >()
  for (const setId of FONT_SET_IDS) {
    const set = FONT_SET_REGISTRY[setId]
    for (const role of FONT_SET_ROLES) {
      for (const m of set.roles[role].members as readonly FontSetMember[]) {
        if (m.source.kind !== 'next/font/google') continue
        const variable = fontSetMemberVar(setId, role, m.id)
        if (variable === null) {
          throw new Error(`${setId}/${role}/${m.id} has no variable`)
        }
        faces.set(variable, {
          googleFamily: m.source.googleFamily,
          variable,
          cjk: set.cjk,
        })
      }
    }
  }
  return [...faces.values()]
}

describe('app/fonts.ts declares every font-set face', () => {
  const faces = registryFaces()

  it('finds the nine distinct faces the installed registry names', () => {
    expect(faces).toHaveLength(9)
  })

  it.each(faces.map((f) => [f.variable, f] as const))(
    'declares %s with its registry family, swap, and no preload',
    (_variable, face) => {
      const declared = LOADERS.filter((l) =>
        l.body.includes(`variable: '${face.variable}'`),
      )
      expect(declared, `exactly one loader for ${face.variable}`).toHaveLength(
        1,
      )
      const loader = declared[0]!
      expect(loader.loader).toBe(face.googleFamily)
      expect(loader.body).toContain("display: 'swap'")
      expect(loader.body).toContain('preload: false')
      // No `subsets`: every slice is fetched by unicode-range on demand.
      expect(loader.body).not.toContain('subsets')
    },
  )

  it('declares no font-set face the registry does not name', () => {
    const known = new Set(faces.map((f) => f.variable))
    const stray = LOADERS.map(
      (l) => /variable: '(--font-set-[^']+)'/.exec(l.body)?.[1],
    )
      .filter((v): v is string => v !== undefined)
      .filter((v) => !known.has(v))
    expect(stray).toEqual([])
  })

  it('joins every loader into fontVariables', () => {
    const joined =
      /export const fontVariables = \[([^\]]*)\]/.exec(FONTS_TS)?.[1] ?? ''
    expect(LOADERS.length).toBe(15)
    for (const l of LOADERS) expect(joined).toContain(`${l.name}.variable`)
  })
})
