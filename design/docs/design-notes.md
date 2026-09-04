# `motir.co/docs` — the reading surface, its rail, and an operation drawn open (`docs.*`)

**Subtask:** MOTIR-4393 · (`type: design`) · **Bug:** MOTIR-4375 (`motir.co/docs` is unusable) ·
**Epic MOTIR-3875 · Motir's public web presence.** **Repository: `motir-marketing`.**

**Asset files (three):** this `design-notes.md` (the AREA's note) · `docs.mock.html` (the source of
truth — standalone, re-stating the shipped `--el-*` values) · `docs.png` (full-page Playwright
chromium export, light theme, `deviceScaleFactor: 2`, re-exported with
`pnpm design:render --width 1280 design/docs/docs.mock.html`).

---

## Why this asset exists

**The design gate fired.** `motir.co` serves nine documentation pages and **nothing in this
repository draws them.** `design/` here holds `legal`, `marketing` and `public-projects`, and no
`docs` area. The surface's only asset is `motir-core/design/api-docs/` — five files, drawn for a
shell that MOTIR-3951 deleted, in a repository that no longer serves the page.

So MOTIR-4396 was a UI card with no design reference in its owning repository, and MOTIR-4391 was
about to build an expanded-operation state nobody had drawn. This asset is the reference both build
to.

---

## What ships today — MEASURED, not remembered

Rendered in headless chromium at 1280 × 900 on **2026-09-04**, before anything here was drawn. All
four `200`.

| page              | `<pre>` | `<code>` | `<table>` | nav links | body height |
| ----------------- | ------: | -------: | --------: | --------: | ----------: |
| `/docs`           |       0 |        0 |         0 |        12 |      1325px |
| `/docs/api`       |       0 |       49 |         0 |        12 |      3943px |
| `/docs/cli`       |       0 |        3 |         0 |        12 |       900px |
| `/docs/mcp/tools` |       0 |       58 |         0 |        12 |      6042px |

**The 49 `<code>` elements on `/docs/api` are the operation PATHS, and there is nothing else.** No
parameters, no bodies, no responses, no examples — 3943px of `METHOD /path — summary`. The nav is
twelve links in one wrapped row above the content, five of them the site bar's; there is no rail,
no filter, and no in-page index. Reaching the forty-ninth operation is a scroll and nothing else.

That is the pixel reality this asset is drawn against, per the design-against-shipped-reality rule.
Screenshots are on file with the card; the numbers above are the part that survives re-rendering.

---

## The panels (inspect every one)

| panel | what it shows                                                                            |
| ----- | ---------------------------------------------------------------------------------------- |
| **1** | `/docs/api` at rest, 1280 × 900 — the rail, the find box, the catalogue                  |
| **2** | **one operation EXPANDED** — the state MOTIR-4391 builds; the whole reason for the asset |
| **3** | a PROSE page (`/docs/sandbox`) — the rail without its third tier                         |
| **4** | the **navigation ANSWER** and its **ACCESS PATH**, marked ① ② ③                          |
| **5** | the docs INDEX — where the top bar's `Docs` item lands                                   |
| **6** | **UNREACHABLE** — a real state, because the no-fallback contract makes it one            |
| **7** | **narrow** (390 × 844)                                                                   |
| **8** | **dark**                                                                                 |

---

## What this design does NOT own

Stated first, because two panels draw chrome that belongs to another design and would otherwise read
as a redesign of it.

| Element                                | Owned by                                                           | What THIS design does                                                      |
| -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| The site bar and the footer            | `app/_components/SiteShell.tsx` · `motir-core/design/public-site/` | **Composes** them, class for class. Marks `Docs` current. Changes nothing. |
| The `main` landmark and the skip link  | `SiteShell` (MOTIR-4169)                                           | Nothing. The rail sits INSIDE the landmark's content box.                  |
| The operation SCHEMA and its contents  | `motir-core`'s published OpenAPI document                          | Draws how a schema is READ, never what any operation contains.             |
| The sandbox page's prose               | MOTIR-4392                                                         | Draws its shape in panel 3. Redraws none of its content.                   |
| The three-file asset convention itself | `design/marketing/design-notes.md`                                 | Follows it.                                                                |

---

## The one structural change: a RAIL beside the column

`app/docs/layout.tsx` centres a single `max-w-[46rem]` column, and `DocsNav` renders nine page links
as one wrapped row above it. This asset puts a **264px rail** to the left of that column and moves
the page links into it. **The content column keeps its 46rem measure** — long-form prose is
constrained by the reading measure, not by the container, so widening it to fill the space the rail
left over would make every page harder to read in order to use the space.

| Element             | Primitive         | Colour                                                     | Shape                                                                   |
| ------------------- | ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Rail                | `Sidebar` grammar | `--el-sidebar-bg`, right border `--el-border`              | spans the row, which fills the landmark; `.rail-inner` sticks inside it |
| Find box            | `Input`           | bg `--el-page-bg`, border `--el-border-strong`             | `--radius-input`, `--height-input`, `--spacing-input-x`                 |
| `/` hint            | `<kbd>` chip      | border `--el-border`, text `--el-text-secondary`           | `--radius-kbd`, `--spacing-kbd-x/y`                                     |
| Group heading       | `SectionLabel`    | `--el-text-secondary`                                      | —                                                                       |
| Rail row            | sidebar row       | `--el-text-secondary`; hover `--el-muted`                  | `--radius-control`, `--height-control`, `--spacing-control-x`           |
| Rail row, active    | sidebar row       | bg `--el-muted`, text `--el-text`, 600                     | `--shadow-subtle`                                                       |
| Verb chip (rail)    | `Pill`            | tint background, `--el-text-strong` ink                    | `--radius-badge`                                                        |
| Verb chip (heading) | `Pill`            | tint background, `--el-text-strong` ink, `min-width: 52px` | `--radius-badge`, `--spacing-chip-x/y`                                  |
| Status chip         | `Pill`            | tint background, `--el-text-strong` ink, `min-width: 42px` | `--radius-badge`, `--spacing-chip-x/y`                                  |
| Scope chip          | `Pill`            | `--el-tint-lavender`, `--el-text-strong` ink               | `--radius-badge`, `--spacing-chip-x/y`                                  |
| Spec table          | plain `<table>`   | header `--el-text-secondary`, cells `--el-text-secondary`  | rules `--el-border` / `--el-border-soft`                                |
| Code pane           | `CodeBlock`       | caption on `--el-surface`, body on `--el-page-bg`          | `--radius-card`                                                         |
| Unreachable card    | `Card`            | `--el-surface`, border `--el-border`                       | `--radius-card`                                                         |

**⚠️ THE RAIL SPANS THE ROW, AND ITS STICKY REGION IS A CHILD OF IT — two elements, not one
(MOTIR-4432).** The surface (`--el-sidebar-bg` + the right border) is painted by the rail itself,
which is a grid item at the row's full height; the scrolling, sticking region is `.rail-inner`
inside it, carrying `position: sticky`, the max-height and the padding. **The two jobs cannot share
one element, and this asset drew them sharing one until MOTIR-4432.** `align-items: start` on the
grid is what makes `position: sticky` engage — a sticky element only sticks while it is shorter than
what scrolls past it — and it also shrinks the element to its own rows, so the tint and the border
stopped where the last nav row ended: 648px above the bottom of the reading column on `/docs`, and
85500px above it on `/docs/api`. A sidebar drawn as a floating box. Deleting `align-items: start`
alone trades the defect for the opposite one, a rail that scrolls away. **So the grid states
`align-items: stretch`, and the sticky lives one level down.** The panels below draw the corrected
shape; the shipped components mirror it element for element (`DocsShell.tsx` · `DocsRail.tsx`).

**⚠️ AND THE ROW FILLS THE LANDMARK — THE THIRD ELEMENT, ADDED BECAUSE TWO WAS NOT ENOUGH
(MOTIR-4465).** A rail as tall as its row says nothing about how tall the ROW is, and the row was
sized by its own content: on a page shorter than the viewport (`/docs/mcp` — 359px of grid in a
900px window) the tint and the right border stopped **224px above the footer**, with the page
background under them. The same sidebar-drawn-as-a-floating-box reading MOTIR-4432 removed, reached
by the other axis. So the rule is a chain of three, and each link is a different element:

| what                                        | which element | how                                                |
| ------------------------------------------- | ------------- | -------------------------------------------------- |
| the row fills the landmark                  | the docs grid | `md:grow`, inside a `md:flex md:flex-col` `<main>` |
| the surface fills the row                   | the `<nav>`   | the grid's default `align-items: stretch`          |
| the sticky region is a child of the surface | `.rail-inner` | `position: sticky`, its own `max-height`           |

**The chain is gated at `md`, and that is part of the rule rather than an implementation detail.**
Below the breakpoint the rail is a band ABOVE the content (panel 7), and a grid stretched to the
viewport there distributes its leftover space across the auto rows and inflates that band. Panel 3
is where this is drawn: a SHORT prose page, whose rail reaches the bottom of the frame although its
content does not.

**Why the panels carry `min-height` on `.site` and never on `.docs`.** `.site` is the viewport
stand-in — the landmark column between the bar and the footer — so a height there is a statement
about the WINDOW, which is what a page's shortness is relative to. A height on `.docs` states that
the row is tall, which is the very thing the asset is supposed to be depicting as a CONSEQUENCE. An
asset that props the row up directly draws a full-height rail on every panel and is silent about the
case where the rail has to earn it; that silence is what let MOTIR-4465 through a faithful build.

**Content-column typography.** `h1` is `--font-serif` at 30px (the shipped `/docs` value, unchanged);
an operation summary is 16px semibold; a section eyebrow is 11px uppercase `--el-text-secondary`.
Body copy is 14px / 1.6 at `max-width: 68ch`.

### The three tiers, and what decides them

| Tier  | Heading             | Rows                                                                                | Renders on             |
| ----- | ------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| **1** | `Documentation`     | one per surface — Overview, API reference, MCP server, CLI, Sandbox, Public address | every page in the area |
| **2** | `API reference`     | Getting started · Stability & deprecation                                           | only under `/docs/api` |
| **3** | the resource groups | the operation rows                                                                  | only under `/docs/api` |

**What decides tiers 2 and 3 is the ROUTE PREFIX, not the page.** One fact decides both which
sub-area a page is in and what its rail shows, so the two cannot drift apart — and a page added
anywhere else cannot acquire the operation list by accident. Panel 3 is that rule drawn: a prose page
shows tier 1 alone, **no find box and no count line**, because a filter over an empty set is a
control describing nothing.

---

## THE NAVIGATION ANSWER (panel 4) — a rail that a filter narrows

The card asks this asset to ANSWER rail-versus-index-versus-filter rather than list the options. It
is a **persistent rail, with a filter over the operation tier**, and the alternatives were weighed:

- **An in-page index alone** puts a fiftieth block of links at the top of the page a reader is
  trying to get out of, and it disappears the moment they scroll past it.
- **A filter alone** leaves nothing to read when the box is empty — which is the resting state, and
  therefore the state most readers see.
- **The rail is both**: a table of contents at rest, a filter when you know what you want. It is also
  what the surface HAD before the move (`CatalogueNav.tsx`), so it restores something rather than
  inventing it.

Three details, resolved here rather than left to the implementer — the ① ② ③ of panel 4:

1. **The filter narrows IN PLACE and KEEPS its group headings**, so a reader never loses where they
   are. The **count line reports the narrowed set against the whole** (`6 of 49 operations`). A
   filter that hides its own selectivity is how a reader concludes an operation does not exist.
2. **Two interactions to any operation**, and scrolling is not one of them: filter then click, or
   click a row from the resting rail. **Each row carries the verb chip AND the path**, because the
   same path appears under as many as four verbs and a list of paths alone is ambiguous exactly
   where the reader is looking hardest.
3. **The ACCESS PATH is drawn, not described.** A reader arrives from the site bar's `Docs` item
   (panel 1, marked current), lands on the index (panel 5), and every page from there carries the
   rail — so the reference is one click from any documentation page and two from anywhere on the
   site. The row for the page you are on carries `aria-current="page"` plus the active treatment,
   at every tier.

**Keyboard.** The find box takes `/`. Every rail row is a link and therefore in the tab order. The
active row is programmatically current, not only visually marked — the build card carries that as a
criterion.

---

## The operation, drawn open (panel 2)

**The section order is FIXED: scope → request → body → example → responses → response schema.** This
is a SPEC, not a layout preference: a reader who has read one operation must be able to SKIM the
next, which only works if the next is laid out identically.

- **Both spec tables scroll in their own box**, with the eyebrow above naming the region. Three
  columns of prose do not fit a phone, and dropping a column hides exactly the fact a reader came to
  compare.
- **Required-ness sits under the NAME, not in the type column.** It is the second thing a reader
  looks for and the type column is already carrying enum members.
- **The example carries the REQUIRED fields only.** An example that sends everything teaches nothing
  about what the call needs.
- **The response schema is a table, like the request body** — the status table says WHEN, the schema
  says WHAT, and they are different questions.

### The chips

| Verb     | Token             |
| -------- | ----------------- |
| `GET`    | `--el-tint-sky`   |
| `POST`   | `--el-tint-mint`  |
| `PATCH`  | `--el-tint-peach` |
| `DELETE` | `--el-tint-rose`  |

The hue lives in the **BACKGROUND** with `--el-text-strong` ink — the AA recipe every coloured chip
in both repositories follows. **Status chips reuse the same tints by CLASS, not by code**: 2xx mint,
4xx peach, 5xx rose. A reader learns three colours, not eleven. The **scope chip** is
`--el-tint-lavender`, deliberately a fourth tint, because a scope is a different KIND of fact from a
verb and must not be mistaken for one.

---

## What was KEPT from the prior art, and what was deliberately NOT

The prior art is `motir-core` at `95a2d4468^`: `design/api-docs/design-notes.md`,
`api-docs.mock.html`, `docs-index.mock.html` and the components drawn to them
(`OperationSection.tsx`, `MethodPill.tsx`, `CatalogueNav.tsx`, `DocBlocks.tsx`). **Every reference to
it carries the `motir-core/` prefix, because it is in ANOTHER REPOSITORY** and a bare path here would
resolve to nothing.

**KEPT** — the section order and its reason; the verb-chip tint map and the hue-in-the-background
recipe; the three-tint status rule; the scope chip as a fourth tint; both spec tables scrolling in
their own boxes; the searchable rail with its `/` hint, its group headings and its count line; the
route-prefix rule for what the rail shows.

**NOT KEPT** — that asset's SHELL. It drew a two-tier rail plus a right-hand "on this page" column
inside `motir-core`'s own chrome, at a 264 + flex + 200 three-column layout. This surface wears
`motir.co`'s `SiteShell`, which is a different bar, a different footer and a different content
measure. **The right-hand contents column is dropped**: it duplicated the rail's third tier on the
one page that had one, and on this host it would compete with a 46rem measure for the same
horizontal room.

**NOT KEPT** — the `--el-tint-lavender` scope chip was a DEVIATION over there, recorded in
`motir-core/design/api-docs/design-notes.md`, because the shipped `Pill` had no unclaimed lavender
tone. This repository has no `Pill` primitive with a claimed tone set, so the asset's original
specification is simply buildable here, and panel 2 draws it.

---

## Ink

Every ink in this asset is `--el-text`, `--el-text-secondary`, `--el-text-strong` (on a tint) or
`--el-accent-on-surface`. **`--el-text-muted` and `--el-text-faint` appear nowhere**, in the product
layer or in the board chrome: muted clears AA only on the white page and faint clears it on no
surface at all. `tests/design/inkContrast.test.ts` measures this asset — **and adding it to that
file's `ASSETS` list is part of shipping it**, because the list is literal and an asset that is not
in it is not measured.
