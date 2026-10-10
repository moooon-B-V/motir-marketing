import { cpSync, mkdtempSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * A copy of `content/docs/` holding only the English documents and their ledgers
 * (MOTIR-8039…8048 added the ten translations). The move tests assert how a page
 * behaves when its translation is MISSING — the English under the "being updated"
 * note — which is no longer the repository's own state, so they point
 * `resolveDocsDocument` at this tree instead of at the real one.
 */
export function englishOnlyRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'docs-en-only-'))
  cpSync('content/docs', root, {
    recursive: true,
    filter: (source) =>
      statSync(source).isDirectory() ||
      /(^|\/)(en\.md|revisions\.json)$/.test(source) ||
      !source.endsWith('.md'),
  })
  return root
}
