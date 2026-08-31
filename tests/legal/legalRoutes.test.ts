// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { copy, format } from '@/lib/copy'
import { getLegalDocument, listLegalDocuments } from '@/lib/legal/documents'

/**
 * The route-level half of MOTIR-4009's acceptance criteria — the things a
 * parser test cannot see, over the real `content/legal/` directory.
 *
 *  1. The two-armed effective-date line, and the literal `TBD` never reaching a
 *     page (the arm in force today is `not yet in effect`, because every
 *     document's front matter still says `TBD`).
 *  2. An unknown slug is a 404 precondition (`getLegalDocument` → `null`, which
 *     is what the page's `notFound()` branches on).
 *  3. No `loading.tsx` sits above the document route, so the 404 status
 *     survives for a crawler.
 *  4. No database client / Prisma / connection string appears in this
 *     repository — the standing rule, and the cheap wrong answer this card
 *     must not take.
 */

describe('the effective-date line', () => {
  it('renders BOTH arms from the catalogue, and never the literal TBD', () => {
    const inEffect = format(copy.legal.versionAndEffective, {
      version: '1.1.0',
      date: '1 September 2026',
    })
    const notYet = format(copy.legal.versionNotYetEffective, {
      version: '1.0.0',
    })

    expect(inEffect).toBe('Version 1.1.0 · in effect from 1 September 2026')
    expect(notYet).toBe('Version 1.0.0 · not yet in effect')
    expect(inEffect).not.toContain('TBD')
    expect(notYet).not.toContain('TBD')
  })

  it('the arm in force today is `not yet in effect` — every document is still TBD', () => {
    for (const doc of listLegalDocuments()) {
      expect(
        doc.effectiveDate,
        `${doc.slug} has an effective date; the page would render the wrong arm`,
      ).toBeNull()
      const line = doc.effectiveDate
        ? format(copy.legal.versionAndEffective, {
            version: doc.version,
            date: doc.effectiveDate,
          })
        : format(copy.legal.versionNotYetEffective, { version: doc.version })
      expect(line, `${doc.slug} version line`).not.toContain('TBD')
    }
  })
})

describe('an unknown slug is a 404', () => {
  it('returns null for an unknown slug, which the page 404s on', () => {
    expect(getLegalDocument('not-a-document')).toBeNull()
    expect(getLegalDocument('terms')).not.toBeNull()
  })
})

describe('no loading.tsx above the document route', () => {
  it('the legal tree and the app root carry no loading boundary', () => {
    for (const candidate of ['app/legal/loading.tsx', 'app/loading.tsx']) {
      expect(
        existsSync(candidate),
        `${candidate} would flush a 200 and turn the unknown-slug 404 into a page`,
      ).toBe(false)
    }
  })
})

describe('no database client in this repository', () => {
  const FORBIDDEN = [
    /@prisma\/client/,
    /from\s+['"]prisma['"]/,
    /from\s+['"]pg['"]/,
    /DATABASE_URL/,
    /postgres(ql)?:\/\//i,
    /connection\s*string/i,
  ]

  const sourceFiles = (dir: string, out: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) {
        if (entry === 'node_modules' || entry === '.next') continue
        sourceFiles(path, out)
      } else if (/\.(ts|tsx|mts|cts)$/.test(entry)) {
        out.push(path)
      }
    }
    return out
  }

  it('no source file imports or references a database', () => {
    const hits: string[] = []
    for (const file of sourceFiles('app')) {
      const src = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (pattern.test(src)) hits.push(`${file}: ${pattern}`)
      }
    }
    for (const file of sourceFiles('lib')) {
      const src = readFileSync(file, 'utf8')
      for (const pattern of FORBIDDEN) {
        if (pattern.test(src)) hits.push(`${file}: ${pattern}`)
      }
    }
    expect(
      hits,
      'a database client or connection string appeared in the repo',
    ).toEqual([])
  })
})
