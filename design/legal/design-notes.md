# motir.co/legal — the index and the document page, inside the public chrome (`legal.*`)

**Subtask:** MOTIR-4005 · (`type: design`) · **Story:** MOTIR-3932 (motir.co renders the public
reading surface) · **Epic 8 · Launch readiness.** **Repository: `motir-marketing`.**

`motir.co` is about to serve seven legal documents and an index for them, and **nothing draws that
reading surface anywhere.** MOTIR-3880 (`motir-core/design/public-site/`) draws the CHROME — one header, nav
and footer — and names `/legal` among its states with neither nav item current. A chrome asset
naming `/legal` is a DOOR; it is not the room. This asset draws the room.

**Asset files (three):** this `design-notes.md` (the AREA's note) · `legal.mock.html` (the source of
truth — standalone, re-stating the shipped `--el-*` values) · `legal.png` (full-page Playwright
chromium export, `deviceScaleFactor: 2`, re-exported with
`pnpm design:render --width 1440 design/legal/legal.mock.html`).

---

## The surface table

| surface                            | what it holds                                                                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`/legal`** — the index           | one row per published document, in `PREFERRED_ORDER` (terms · privacy · cookies · acceptable-use · dpa · subprocessors · model-providers), each row a title linking to `/legal/<slug>`; a contact line (`legal@motir.co`) |
| **`/legal/<slug>`** — one document | a _← All legal documents_ breadcrumb, an `h1` title, a version-and-effective-date line, a rule, then the Markdown body at `max-w-[46rem]`                                                                                 |

Both mirror the BEHAVIOUR of `motir-core/app/(public)/legal/` (`page.tsx` + `[slug]/page.tsx`; that directory left motir-core with MOTIR-4103, when `/legal` moved to this repository's `app/legal/`),
read on `origin/main` — not its layout, which is an app-host chrome this asset does not reproduce.

## Surfaces / panels (inspect every panel)

- **Panel 1 — `/legal`, the index, desktop (1280).** Seven rows in `PREFERRED_ORDER`, the
  two-armed version line, the contact line. Neither nav item current.
- **Panel 2 — `/legal/terms`, the document page, desktop.** Breadcrumb → h1 → version line → rule
  → real Terms of Service prose (not lorem).
- **Panel 3 — the effective-date line, both arms.** `not yet in effect` (the CURRENT state) and
  `in effect from …` (a published date).
- **Panel 4 — an unknown slug. ⚠️ SUPERSEDED (MOTIR-4247) — a RECORD, not a spec.** A real 404,
  inside the chrome, with the way back to the index. **It was never built and is not to be built:**
  an unknown legal slug is served by the SITE-WIDE room `app/not-found.tsx` (shipped by MOTIR-4193,
  drawn by MOTIR-4245). See § _The 404_ below — the panel stays as the record of what MOTIR-4005
  drew, and its own caption in `legal.mock.html` says so.
- **Panel 5 — the long-form body treatment.** Serif `h2`, sans body, nested lists, the
  subprocessors table.
- **Panel 6 — narrow (390 × 844).** The chrome collapses; the room reflows full-width.
- **Panel 7 — the access path.** Footer door · index row → document · breadcrumb → index.
- **Panel 8 — dark theme.**

## The two-armed effective-date line

`motir-core` `lib/legal/documents.ts` maps a front-matter `effectiveDate` of `TBD` (or absent) to
`null`, and its own comment says the literal must never reach a rendered page. So the date line has
two arms, and the copy keys are `versionAndEffective` / `versionNotYetEffective`:

- **`Version {version} · not yet in effect`** — the `null` arm, and **the CURRENT state for all
  seven documents** (`git grep 'effectiveDate:'` over `content/legal/` returns `TBD` on every file).
  It is drawn first because it is in force until the service opens — not an edge case.
- **`Version {version} · in effect from {date}`** — the arm a published date renders.

## The 404 — ⚠️ SUPERSEDED: an unknown slug is served by the SITE-WIDE not-found room

> **⚠️ AMENDED 2026-09-03 (MOTIR-4247).** What this section used to specify — a `/legal`-scoped
> not-found body, drawn as panel 4 — **was never built, and is not to be built.** motir.co has since
> decided its 404 once, for the whole host. What follows records what an unknown legal slug ACTUALLY
> renders. Panel 4 stays in `legal.mock.html` as the point-in-time record of what MOTIR-4005 drew.

An unknown slug is a genuine `notFound()`, and **Next resolves `notFound()` to the NEAREST
`not-found.tsx` ABOVE the route.** This repository has exactly one — `app/not-found.tsx`, shipped by
**MOTIR-4193** to the room **MOTIR-4245** draws in
`motir-core/design/public-site/design-notes.md` § _the NOT-FOUND room_ — and there is no
`app/legal/not-found.tsx`. So an unknown legal slug already lands in the **site-wide** room, which
serves all four `notFound()` arrivals on this host (an unknown `/legal/<slug>`, an unlisted
`/explore/topic/<slug>`, a `/p/<identifier>` that is not public, a mistyped URL) with **one room and
two doors** — _Explore projects_ (primary) and _Go to the homepage_ (ghost).

**⚠️ DO NOT ADD `app/legal/not-found.tsx`.** A per-segment file is the only thing that would
re-introduce a second, `/legal`-scoped 404 — and it is exactly the move panel 4 would otherwise
recommend to a reader who opens this area and builds to what it draws. The same decision is already
recorded in its other two homes, and **this paragraph is the third — the only one a `/legal` design
pass reads**:

- **The shipped code.** `app/not-found.tsx`'s header comment: _"… do not add a per-segment
  `app/legal/not-found.tsx` — `motir-marketing/design/legal/`'s panel-4 `/legal`-scoped room is
  SUPERSEDED by this one (the correction to that asset is MOTIR-4247)."_
- **The other repository's asset.** `motir-core/design/public-site/design-notes.md`
  § _This SUPERSEDES the `/legal`-specific 404 room_: _"do not build panel 4's room, and do not add
  `motir-marketing/app/legal/not-found.tsx`."_

**The way back is not lost — it MOVED into the chrome.** The one thing panel 4's body has that the
site-wide room does not is the `← All legal documents` link. The site-wide room answers that arrival
through the **footer's Legal column** — _Privacy Policy_ · _Terms of Service_ · _All legal
documents_ — which is on the 404 page itself, because the room wears this same chrome. That is the
site-wide asset's own argument for two doors rather than five: the room names the likeliest intent
and lets the chrome carry every other one.

**The `loading.tsx` rule STANDS, and it now protects the site-wide room's status.** Nothing above the
`[slug]` route draws a `loading.tsx` (`motir-core/CLAUDE.md`'s boundary rule — a boundary above an
existence-deciding route flushes a 200 and destroys the 404), so the status survives for a crawler.
`app/legal/layout.tsx` draws none, and none is to be added — that half of this section is unchanged
by the supersession, because it is about the STATUS rather than about the room.

## The long-form body treatment — decided

A Terms of Service is thousands of words and this repository has no long-form prose surface, so
this asset decides the treatment rather than leaving it to whoever renders the Markdown:

- **Measure:** `max-w-[46rem]` (736px), the shipped `motir-core` measure.
- **Heading hierarchy:** `h1` serif 30px/700 · `h2` serif 20px/700 · `h3` sans 15px/600 — the
  shipped legal page's `h1` and the doc body's own `##`/`###` levels.
- **Lists:** nested `ul` with 22px indent; **tables:** bordered, `--el-surface-soft` header, the
  subprocessors disclosure's real table.
- **Bold** renders `--el-text-strong` (the body's own emphasis).

**In-page navigation: NONE.** The shipped surface has none — the breadcrumb is the only
navigation, and a legal document is read top-to-bottom with the version line at the top. A
table-of-contents would be a new element the shipped surface does not have (the design-reference
rule: an unshipped element is a missing prerequisite, not a detail to improvise). The decision is
stated here so the render card does not invent one; if a document later grows a TOC need, that is
its own `type: design` change.

## The access path — drawn where it lives

1. **`/legal` is reached from the FOOTER** — Privacy · Terms · All legal — where it is reached from
   today, and where it stays (marking Explore as `aria-current` on a legal page would tell a screen
   reader the wrong thing, the shipped `ExploreTopBar` reasoning). Not moved into the nav.
2. **A document is reached from the index row** — each row is a link to `/legal/<slug>`.
3. **The index is reached from the document's breadcrumb** — `← All legal documents`.
4. `app.motir.co` reaches these documents **cross-origin** (sign-up, the rail, the re-consent
   screen); these pages therefore carry no application chrome and no session affordance of their
   own — that surface is MOTIR-3909's, not this card's.

## Composition, not redrawing

- **This asset COMPOSES MOTIR-3880's chrome and redraws none of it.** The header, nav and footer
  in the mock are `motir-core/design/public-site/`'s markup, class for class — that card's asset is
  a reference this card READS (`motir-core` path as evidence, not a deliverable). This card draws
  only what sits BETWEEN the header and the footer.
- The room composes `@motir/design-system`'s `--el-*` element tokens and element-semantic shape
  tokens; no Tier-0 `--color-*`, no raw `rounded-*` / `p-*`.

| drawn element                                                                                             | primitive / token                                                                            |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| the index rows                                                                                            | `<Link>` + `--el-text` / `--el-text-secondary` on `--el-page-bg`, `divide-y` → `--el-border` |
| the breadcrumb                                                                                            | `--el-text-secondary`, hover `--el-link`                                                     |
| the `h1`                                                                                                  | `--font-serif` · `--el-text`                                                                 |
| the version line                                                                                          | `--el-text-secondary`                                                                        |
| the body headings / lists / tables                                                                        | `--el-text` · `--el-text-strong` · `--el-border` · `--el-surface-soft`                       |
| the not-found body — **⚠️ SUPERSEDED (MOTIR-4247)**, panel 4's only; nothing renders it — see § _The 404_ | `--el-text-secondary` · `--el-link`                                                          |
| the chrome                                                                                                | `BrandMark` · `--el-accent-on-surface` · `--el-accent` / `--el-accent-text` (CTA)            |

## AA contrast

Measured over the `motir` palette (the binding default), light and dark. The room's inks are
`--el-text`, `--el-text-strong` and `--el-text-secondary` — never the muted ink, which is 4.34:1 on
the footer band and 4.17:1 on `--el-surface`. Every figure clears WCAG 1.4.3 (4.5:1 normal,
3:1 large):

| element                             | ink                                 | surface             | light       | dark        | AA  |
| ----------------------------------- | ----------------------------------- | ------------------- | ----------- | ----------- | --- |
| index row title                     | `--el-text`                         | `--el-page-bg`      | 16.44       | 17.31       | ✓   |
| index row version / contact / intro | `--el-text-secondary`               | `--el-page-bg`      | 6.80        | 7.35        | ✓   |
| document body                       | `--el-text`                         | `--el-page-bg`      | 16.44       | 17.31       | ✓   |
| body emphasis / headings            | `--el-text-strong`                  | `--el-page-bg`      | ≥ 12        | ≥ 12        | ✓   |
| breadcrumb (rest / hover)           | `--el-text-secondary` / `--el-link` | `--el-page-bg`      | 6.80 / 4.54 | 7.35 / 6.05 | ✓   |
| table header                        | `--el-text-strong`                  | `--el-surface-soft` | ≥ 10        | ≥ 10        | ✓   |
| nav current item                    | `--el-accent-on-surface`            | `--el-surface-soft` | 6.29        | 5.76        | ✓   |
| CTA "Start free"                    | `--el-accent-text`                  | `--el-accent`       | 6.57        | 6.57        | ✓   |

The lane's own scan (`pnpm test:design`) measures the asset in headless chromium and returns **0
sites below 1.4.3**, which is the load-bearing check — the table above is a summary of it.

## The measured fold

Both taken by rendering the frame at the true viewport and reading `getBoundingClientRect()`
offsets from the frame's top edge.

| viewport       | bar    | `h1`     | first row | last row  | contact   | fold | headroom                     |
| -------------- | ------ | -------- | --------- | --------- | --------- | ---- | ---------------------------- |
| **1280 × 900** | 1 → 58 | 98 → 134 | 242 → 310 | 650 → 717 | 750 → 765 | 900  | **135px** (contact ends 765) |
| **390 × 844**  | 1 → 58 | 98 → 134 | 309 → 377 | 717 → 784 | 817 → 832 | 844  | **12px** (contact ends 832)  |

**Above the fold in both: the whole index — all seven rows and the contact line.** The footer is
below the fold in both. The 390 headroom (12px) is tight; a future eighth document would push the
contact line below the fold at 390, which is worth knowing rather than rediscovering.

## Planning flags

1. **MOTIR-4011 (the marketing-side Vitest gate, in MOTIR-3909) does not cover `design/legal/`.** It
   lives in the other story and gates the render card's routes; this asset's ink is guarded by the
   lane here, which I extended to include `legal.mock.html` (see below). **No card owns a
   `design/legal/` address/three-file guard in this repository** — `tests/design/inkContrast.test.ts`
   is the only design guard here and its `ASSETS` list was hardcoded to `design/marketing/`. I
   extended that list in the same PR; a future `design/<area>/` here should be added to it the same
   way. **Key: MOTIR-4005** (this card is the one that owns it, because it is the first non-marketing
   area to ship an asset here).
2. **The render card must port `parseLegalDocument` / `byPreferredOrder` with their tests**, not
   re-derive them — that is MOTIR-4009's stated obligation and it is load-bearing here (the
   `TBD → null` mapping is what makes the date line two-armed). **Key: MOTIR-4009.**

## GIVES / TAKES sweep

`grep -oE 'MOTIR-[0-9]+' design/legal/*` over the asset, bounded by MOTIR-3932's subtree and
crossing into MOTIR-3909 where a key there is affected:

- **MOTIR-3880** — **TAKES nothing.** The chrome is COMPOSED, not redrawn; the asset cites
  `motir-core/design/public-site/` as a reference it reads. No amendment owed.
- **MOTIR-4009** — **GIVES it** the index, the document page, both date-line arms, ~~the 404,~~ and
  the long-form treatment (including the "no in-page navigation" decision). The render card is
  already `blocked_by` this one, so the edge carries the ordering; no amendment owed.
  **⚠️ AMENDED 2026-09-03 (MOTIR-4247): the 404 is STRUCK from this hand-over.** MOTIR-4009 shipped
  `/legal` without panel 4's room — correctly, as it turns out: the 404 belongs to the site-wide
  room (`app/not-found.tsx`, MOTIR-4193, drawn by MOTIR-4245), not to `/legal`. Nothing is owed to
  4009, which is `done`; the strike is here so a reader of this list does not go looking for a
  hand-over that must never be honoured. See § _The 404_.
- **MOTIR-3932** (this story) — **TAKES nothing.** The repo set is `motir-marketing` alone and
  remains so; the `motir-core` path named in the card's criterion 7 is evidence this card reads, not
  a deliverable (the card already says so).
- **MOTIR-3909** (cross-story) — **TAKES nothing.** The boundary excludes the application surface
  (sign-up notice, rail row, re-consent) that 3909's amendment owns, so no element moves between the
  two stories. The sweep found no card whose acceptance criteria this asset falsifies.

No `update_work_item` was needed — the sweep recorded gives and takes, and every consumer's criteria
already agree with the allocation.

## Out of scope — who owns what

- **The documents' prose is moooon B.V.'s legal work** and ports across unchanged (MOTIR-4009).
- **The chrome is MOTIR-3880's.** This asset composes it.
- **The application surface** (app.motir.co's sign-up notice, rail, re-consent) is MOTIR-3909's.
- **This asset ships three files and no code.**
- **`legal--binding-english-note.*` (MOTIR-8085) supersedes nothing above.** It is a delta: it adds
  one note to the index and the document page in the ten non-English locales and redraws neither
  surface. Every decision in this file stands; the section below cites the paths as they are today
  (`app/[locale]/legal/…`, since MOTIR-7948 moved the pages under the locale segment) rather than
  editing the citations above.

---

## `legal--binding-english-note.*` — the binding-English note on a non-English legal page (a delta)

**Card:** MOTIR-8085 (`type: design`) · **Story:** MOTIR-7740 (_Legal pages stay English_) ·
**Mock:** `design/legal/legal--binding-english-note.mock.html` (panels A–G). **Amends** this area's
base asset `legal.mock.html` (MOTIR-4005) by adding one element; it does not edit that file or
`legal.png`.

In the ten non-English locales, a legal document and the legal index show translated chrome around
English text. That is deliberate (the documents are never translated), but nothing on the page says
so, and an English contract under French navigation reads like an unfinished translation. This delta
adds one short note in the page's language: the documents are published in English only, the English
text is the binding version, and, on a document, a link to that document in English. **English shows
no note.**

### What it was drawn against — rendered, not remembered

The live pages were rendered before anything was drawn (`next dev` on this repository at `4f9033e`,
Playwright chromium: French Terms and the French index at 1280, the Japanese index at 390, and the
English `/legal`), and the mock's
token block holds the values `getComputedStyle` returned there, light and dark. Three facts from that
render changed the drawing:

- **The site runs `hand-drawn-indie` + Space Grotesk**, not the `warm-editorial` serif the base mock
  draws, so this mock carries the live colour and shape tokens (the base mock's values are stale).
- **At 1280 the nav is folded behind Menu** (`app/_components/SiteHeader.tsx` shows it at 1314px and
  up): the bar is brand · Start free · language · Menu. The panels draw it that way.
- **The French and German bars do not fit 390 today**: the Start free label paints over the logo.
  That is a shipped defect, filed as **MOTIR-8135** (in the `Bugs` folder, `relates_to` this card),
  and not part of this delta. Panel E is drawn in Polish and Japanese, whose bars fit.

The note composes `.note.reference` from `design/docs/docs--localized-notes.mock.html` (MOTIR-8030),
shipped as `app/[locale]/docs/_components/GeneratedReferenceNote.tsx`: same fill, hairline, ink,
radius, glyph, `role="note"`, and nothing in `en`. Both notes are permanent explanations of why
English appears on a translated page, so they look like the same idea. The only addition is the
inline link.

### Panels

- **A** — French Terms, desktop 1280: the note above the English `h1`.
- **B** — French index, desktop 1280: the index note between the intro and the list.
- **C** — the link's arrival, `/legal/terms` in English, plus `/legal` in English: no note. This is
  also the `en` state for both surfaces.
- **D** — Japanese and Polish Privacy: a CJK note in the Japanese face, a long Latin note, and the
  English islands returning to the Latin face through `lang="en"`.
- **E** — narrow 390 × 844: Polish document, Japanese index.
- **F** — dark theme, French document and index.
- **G** — the access path (the shipped language menu open on French, the footer's legal column with
  Terms marked) and the link at rest, on hover and with keyboard focus. **No new door is drawn.** A
  link from the app opens in whatever language the existing detection picks, and the note follows.

Not drawn: an unknown slug. It stays the site-wide room (§ _The 404_ above), with no note.

### Placement (decisions A and B)

| surface                                    | where the note sits                                                                                           | when                        |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| **document page** `/<locale>/legal/<slug>` | **between the breadcrumb and the document header**, so above the English `h1`; 24px below it, then the header | the ten non-English locales |
| **index** `/<locale>/legal`                | **between the intro and the list**; 24px above and below                                                      | the ten non-English locales |
| both, in `en`                              | no note                                                                                                       | —                           |

- **Decision A — above the `h1`, not between the rule and the body.** The `h1` is English front
  matter, so the first English words on the page are the title. A note placed under the header would
  explain the body after the reader had already met an English title with nothing said about it, and
  it would sit between the version line and the text it describes. Above the `h1` the reading order
  is: French breadcrumb, French note, then everything English. The cost is that the title moves down
  about 100px (measured below).
- **Decision B — the index note has its own sentence and no link.** The document sentence says
  "this document", which is wrong over a list of seven, so the index gets a plural variant that says
  the same two things. It carries **no link**: every row already opens a document whose own note
  links to its English text, and a link to the English index would only switch the page chrome to
  English, which is the language menu's job (the /docs notes take the same line: _the language menu
  is the way back_). So the index costs one extra catalogue key and no extra href.

### Copy (the catalogue card translates these)

| proposed key                 | English source                                                                                                               | notes                                                                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `legal.bindingNote.document` | `This document is published in English only. The English text is the binding version. <link>Open the English version</link>` | ONE message. The link is an ICU rich-text tag (the `<link>…</link>` form `docs.apiSpecSummary` already uses), so each language can place it where its grammar needs. Rendered with `formatIcu`. |
| `legal.bindingNote.index`    | `These documents are published in English only. For each one, the English text is the binding version.`                      | the index variant (decision B). No tag, no link.                                                                                                                                                |

It says the documents are published **in English only** and that **the English text is binding**,
and it promises no translation later. It keeps "Motir" out entirely (nothing to translate) and uses
none of "issue", "card", "tracker" or "coding agent". "Binding version" is the source; each language
uses its own legal idiom for it (_fait foi_, _maßgeblich_, _以英文版为准_ …), which the catalogue
card decides. The French, Japanese, Polish and German sentences in the mock are illustrative
renderings so the panels can be measured; they are not the translations.

### The link destination rule

The document note's link goes to **the same document in English**. On a non-English page that must
actually serve English to a reader whose remembered language is French, and must leave that
remembered language unchanged. How the href is spelled to do that (the proxy moves an unprefixed
address to the remembered locale) belongs to the render card; the design names only the
destination. The mock's hrefs use the English address `/legal/terms` because this file cannot name a
locale-prefixed address. The index note has no link.

**Treatment.** `--el-link` on the note's `--el-surface` fill, weight 500, **always underlined**: the
link ink is only 1.07:1 against the note's own `--el-text-secondary`, so colour alone cannot mark it
as a link (WCAG 1.4.1). Hover: `--el-link-pressed` and a 2px underline. Keyboard focus: a 2px
`--el-accent-on-surface` outline at 2px offset, the shipped header's focus treatment.

### The `lang` rule

On a non-English page, `lang="en"` goes on exactly the English regions:

| page     | carries `lang="en"`                                | carries no `lang` (page language)                                                                        |
| -------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| document | the `h1` (`doc.title`); the `MarkdownBody` wrapper | the breadcrumb `nav`; **the version line** (a translated catalogue sentence, not front matter); the note |
| index    | each row's title `span`                            | the `h1` and intro; the row link; the row's version `span`; the contact line; the note                   |

So the mark goes on those elements, never on the whole `header` (it holds the French version line)
or the whole row link (it holds the French version span). In `en` nothing carries a `lang` override.
The mock outlines each marked element with a dashed annotation and a `lang="en"` tag; neither is
product UI.

### The fold, re-measured

Measured on the live pages (`next dev`, Playwright chromium) with the note injected at the panel-A
and panel-B positions using the note's own tokens and the French and Japanese sentences, reading
`getBoundingClientRect()` from the viewport top. **The base asset's fold table above is stale**: it
was measured on the base mock's serif and spacing, and today's index already sits lower.

| surface           | viewport   | before (no note)                                      | with the note                                   | below the fold with the note                                                         |
| ----------------- | ---------- | ----------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| document, fr      | 1280 × 900 | `h1` 160–196 · body from 281                          | note 160–236 · `h1` 260–296 · body from 380     | nothing that matters: title, version line and the first body paragraph are all above |
| document, fr / ja | 390 × 844  | `h1` 152–188 · body from 273                          | note 152–249 · `h1` 273–309 · body from 393     | the same                                                                             |
| index, fr         | 1280 × 900 | last row 768–844 · contact 877–897 (**3px** headroom) | note 294–370 · rows 395–936 · contact 969–989   | the seventh row (partly) and the contact line                                        |
| index, ja         | 1280 × 900 | contact 888–908 (already 8px **below**)               | note 305–381 · rows 406–947 · contact 980–1000  | the seventh row (partly) and the contact line                                        |
| index, fr / ja    | 390 × 844  | last row 805–882 and contact 915+ already **below**   | note 331–428 · first row 453 · last row 918–995 | rows six and seven and the contact line (five rows show)                             |

**Accepted.** On a document the note costs about 100px and nothing important moves below the fold.
On the index the note pushes the last row and the contact line below at 1280, which at 390 was
already true before this change. The index is a list of links read by scrolling, and the note is the
one statement this story exists to add, so it goes above the list rather than below it.

### AA contrast

The design lane (`pnpm test:design`, `tests/design/inkContrast.test.ts`) discovers the new mock from
the tree and passes it at rest and in its hover / focus state arm. A summary of what it measures, on
the live `motir` palette:

| element                       | ink                      | surface        | light | dark  |
| ----------------------------- | ------------------------ | -------------- | ----- | ----- |
| note text                     | `--el-text-secondary`    | `--el-surface` | 5.91  | 7.81  |
| note link, rest               | `--el-link`              | `--el-surface` | 5.53  | 8.04  |
| note link, hover              | `--el-link-pressed`      | `--el-surface` | 7.37  | 10.26 |
| focus outline (non-text, 3:1) | `--el-accent-on-surface` | `--el-surface` | 5.53  | ≥ 3   |

### GIVES / TAKES

`grep -oE 'MOTIR-[0-9]+' design/legal/*`, bounded by MOTIR-7740's children:

- **MOTIR-8088 (render)** — **GIVES** panels A–G, the placement table and decisions A and B, the link
  destination rule and treatment, and the `lang` rule. The card already allows an index note with no
  link (`href` optional) and a link inside one sentence through `formatIcu`, which is the shape chosen.
  The component it builds sits in the legal tree (`app/[locale]/legal/_components/…`).
  **TAKES nothing.**
- **MOTIR-8087 (catalogue)** — **GIVES** the copy table: two keys, `legal.bindingNote.document` (one
  message with a `<link>` tag) and `legal.bindingNote.index`. The card was written for "the text, the
  link label, and an index variant only if panel B chose one"; panel B chose one, and the link label
  rides inside the document message as a tag, so the count is **two messages, not three**. Size
  unchanged. **TAKES nothing.**
- **MOTIR-8089 (coverage gate)** — **GIVES** the expected states. Its "link serves English" cases
  apply to the document note only; its index case is already written "a link if the design chose
  one", and the design chose none. **TAKES nothing.**
- **MOTIR-8090 (story E2E)** — **GIVES** the picture for steps 1–5; step 3's index link is already
  conditional on the design. **TAKES nothing.**
- **MOTIR-8086 (crawl data)** — nothing drawn, nothing given or taken.
- **MOTIR-8030 / MOTIR-4005** — composed, not redrawn; nothing taken.
- **MOTIR-8135** — a shipped header defect found while rendering (see above); not this delta's.

No consumer's criteria are falsified by these decisions, so no work item was amended.
