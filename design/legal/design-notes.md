# motir.co/legal — the index and the document page, inside the public chrome (`legal.*`)

**Subtask:** MOTIR-4005 · (`type: design`) · **Story:** MOTIR-3932 (motir.co renders the public
reading surface) · **Epic 8 · Launch readiness.** **Repository: `motir-marketing`.**

`motir.co` is about to serve seven legal documents and an index for them, and **nothing draws that
reading surface anywhere.** MOTIR-3880 (`design/public-site/`) draws the CHROME — one header, nav
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

Both mirror the BEHAVIOUR of `motir-core` `app/(public)/legal/` (`page.tsx` + `[slug]/page.tsx`),
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
