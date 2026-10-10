import {
  checkDocsTree,
  listSlugs,
  recordRevision,
} from '../../lib/docsDocuments.ts'

// `pnpm docs:revisions record <slug>` — append the page's current English
// revision to `content/docs/<slug>/revisions.json`. Run it after EVERY edit to an
// `en.md`; nobody re-translates anything to unblock CI.
// `pnpm docs:revisions check` — exit 1 on a translation naming a revision the
// ledger never held, and on an `en.md` whose hash is not the ledger's last entry.
// (MOTIR-8032; `content/docs/README.md` is the authoring contract.)

const [command, slug] = process.argv.slice(2)

if (command === 'record' && slug) {
  const { revision, recorded } = recordRevision(slug)
  console.log(
    recorded
      ? `${slug}: recorded revision ${revision}`
      : `${slug}: revision ${revision} is already the ledger's last entry`,
  )
} else if (command === 'record' && !slug) {
  console.error(
    'usage: docs:revisions record <slug>   (slugs: ' +
      (listSlugs().join(', ') || 'none yet') +
      ')',
  )
  process.exit(2)
} else if (command === 'check') {
  const problems = checkDocsTree()
  for (const problem of problems) console.error(problem)
  if (problems.length > 0) {
    console.error(`\n${problems.length} problem(s) in content/docs/`)
    process.exit(1)
  }
  console.log(`content/docs/: ${listSlugs().length} page(s), consistent`)
} else {
  console.error('usage: docs:revisions record <slug> | docs:revisions check')
  process.exit(2)
}
