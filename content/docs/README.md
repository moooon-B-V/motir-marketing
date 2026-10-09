# /docs documents

Each /docs page's **prose** lives here as an authored document per language. The
page's TSX keeps everything a reader copies and everything generated; the document
keeps the words. The contract is `lib/docsDocuments.ts`; the renderer is
`app/[locale]/docs/_components/DocsDocument.tsx` (MOTIR-8032, story MOTIR-7739).

## Path scheme

`content/docs/<slug>/<locale>.md`, where `<slug>` is the route minus `/docs`:
`index` for `/docs`, `sandbox` for `/docs/sandbox`, `mcp/tools` for `/docs/mcp/tools`.
`en.md` is the source. A translation sits beside it (`de.md`, `ja.md`, …); there
is no file for a locale that has not been translated, and the English page renders.

## What a document may contain

Markdown (`react-markdown` + `remark-gfm`, the renderer `content/legal/` uses),
with four rules that make a translation safe:

- **Block slots, never code blocks.** Anything a reader copies — a command, a
  `docker run`, a copy button's payload, a generated table, a `<CodeBlock>` — is a
  slot: `{{slot:name}}` alone on its own line, resolved from the `slots` map the
  page passes to `<DocsDocument>`. A fenced code block in a document is a load
  error, so a translation cannot contain, and therefore cannot restate, a command.
  **A slot's payload is the same in every language; its human labels are not:** a
  `CodeBlock` caption, a copy button's accessible name and a slot table's column
  headers are read by a person, so the page builds them from its catalogue keys
  (`getCopy(locale)`), never from a string typed in the slot.
- **Inline values.** `{{value:name}}` may appear inside a paragraph, a list item, a
  table cell, an inline code span or a link destination. It resolves from the
  `values: Record<string, string>` map the page builds per request and per locale.
  Use it for anything the prose must not restate: a release tag, a URL built from
  configuration, a date. **A date is formatted per locale by the page**
  (`formatDocsDate(locale, isoDate)`, `Intl.DateTimeFormat`), so a German page never
  reads "6 October 2026". A value is a plain one-line string: no newline, no
  backtick, no markup. An unresolved slot or value name throws at render.
- **Explicit anchors.** Every heading carries its id: `## Heading {#anchor-id}`
  (lowercase, hyphen-separated). The renderer uses it verbatim, so a translated
  heading keeps the English anchor and a `#…` deep link survives the locale prefix.
  A heading without one is a load error.
- **Inline code is allowed, and it is an invariant.** `` `motir run` `` stays literal
  in the prose and is never translated. `documentInvariants(markdown)` lists a
  document's slot names, value names, inline code spans, link hrefs and anchor ids
  in order, so a translation can be compared with its English (the coverage gate
  does the per-page, per-locale comparison).

Root-relative links (`/docs/api#start`) are spelled in the page's locale by the
renderer; absolute links open in a new tab.

## Which English a translation was made from

Each page keeps an append-only ledger, `<slug>/revisions.json`:
`[{ "revision": "<12 hex>", "recordedAt": "<ISO date>" }, …]`, newest last. A
revision is the first 12 hex of the SHA-256 of `en.md` (LF line endings).

A translation opens with a front-matter block of exactly one key:

```
---
source: <revision>
---
```

`en.md` carries none. `source` is the English revision the translation was made
from. What a reader is shown:

| the translation's `source`       | shown                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| the ledger's last revision       | the translation                                              |
| an older revision in the ledger  | the English page, under the "being updated" note (**stale**) |
| (no file for the locale)         | the English page, under the same note (**missing**)          |
| a revision the ledger never held | **a build error** — `docs:revisions check` names the file    |

## After every edit to an `en.md`

```sh
pnpm docs:revisions record <slug>
```

This appends the new revision to the ledger. Every translation made from the
previous one is now stale and the English renders under the note until somebody
re-translates it; nobody re-translates anything to unblock CI. `pnpm docs:revisions
check` (and `tests/docs/docsRevisions.test.ts`, which runs it in CI) fails when
`en.md`'s hash is not the ledger's last entry, so an unrecorded English edit cannot
merge. Use `git log -p content/docs/<slug>/en.md` to see what changed.

## Never

- put a command, a code block or a copy payload in a document — use a slot;
- type a release tag, a configured URL or a date in prose — use a value;
- leave a heading without `{#id}`;
- write a `source` by hand: copy the revision from the ledger entry you translated from.
