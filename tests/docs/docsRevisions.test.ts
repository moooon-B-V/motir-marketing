import { describe, expect, it } from 'vitest'
import {
  checkDocsTree,
  DOCS_CONTENT_ROOT,
  listSlugs,
} from '@/lib/docsDocuments'

/*
 * MOTIR-8032 — the CI guard over the REAL `content/docs/` tree (the same check
 * `pnpm docs:revisions check` runs). It passes on an empty tree today and starts
 * biting as the move items and the translation items populate it:
 *   - a translation whose `source` names a revision the page's ledger never held
 *     ("never existed"), and
 *   - an `en.md` whose hash is not the ledger's last entry (English edited
 *     without `pnpm docs:revisions record <slug>`).
 * A stale translation is not a failure: it is a state the renderer handles.
 */
describe('content/docs/ is consistent', () => {
  it('has no translation naming a revision that never existed, and no unrecorded English edit', () => {
    expect(checkDocsTree(DOCS_CONTENT_ROOT)).toEqual([])
  })

  it('lists its pages (vacuously none until the move items land)', () => {
    expect(Array.isArray(listSlugs(DOCS_CONTENT_ROOT))).toBe(true)
  })
})
