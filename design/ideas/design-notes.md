# design/ideas — motir.co/ideas, read live from the idea store

**Card:** MOTIR-7686 (Story MOTIR-7665). **Asset:** `design/ideas/ideas.mock.html` (panels A–I).
**Built by:** MOTIR-7687 (the list, the controls, the band, the directions, the empty / error /
pending states) and MOTIR-7688 (the idea open in place). The allocation is per element in
§ _Who builds what_.

**Revision 2 (2026-10-07).** The first version (`2e7bfa5`) grouped the directions into one section
per category. The owner sent it back: _"Ideas can be put together, don't need to show them by
category. If the user is interested in one category, the user will search it."_ So the directions
are now **one list**, each card names its own category, and the category chips in the controls
are how a visitor narrows to one. Nothing else changed.

## What this draws on

- **The page that ships.** The 2026-10 redesign landed in motir-marketing#81 (`27d6bdf`):
  `app/ideas/page.tsx` with `SiteShell`, `HeroBrief`, `HeroWaves` and `ProductPage`'s `Eyebrow`,
  `H2`, `PointGrid`, `GUTTER` and `ProductClose`. The board was drawn after rendering
  motir.co/ideas live at 1440 and 390 px on 2026-10-07. The token block is the computed style of
  that page: `hand-drawn-indie` style, `grotesk` type, the site's default palette, light theme.
- **The data.** motir-core's public idea contract, mirrored in `lib/ideas.ts` (MOTIR-7685). Every
  idea, tag and count on the board is the production store as served on 2026-10-07, recorded in
  `e2e/fixtures/ideas.json`, `ideas-tags.json` and `idea-stop-returns-before-they-happen.json`.
- **The filter controls** compose the shipped `/explore` ones (`app/explore/_components/`
  `SearchForm`, `CategoryFilter`, `ActiveFilters`): a real GET form, chips that are real links with
  `aria-pressed`, pills with a clear link. Same chip classes, same tint roles.

**`noindex` stays.** The page keeps `robots: { index: false, follow: true }` exactly as #81 leaves
it. Lifting it is not this story's; the filtered URLs are crawlable links so that lifting it later
needs no change here.

## The page, top to bottom (panel A)

| #   | Element                                      | Change                                                                                                                                                                                                                                                                                       | Builder |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `SiteShell` header, "Ideas to build" current | unchanged — the access path; the nav entry already exists (`SiteHeader` `copy.nav.ideas`)                                                                                                                                                                                                    | —       |
| 2   | Hero (eyebrow, headline, lede, `HeroBrief`)  | unchanged                                                                                                                                                                                                                                                                                    | —       |
| 3   | Hero promise card (`data-showcase="ground"`) | its jump list is now the store's `motir_buys` ideas, in list order, each `#idea-<slug>` to its band card, labelled by the idea's **category label**. When the current filters leave no `motir_buys` idea, the list is not rendered and the card keeps only its promise text (panels B, C, F) | 7687    |
| 4   | Rules (`PointGrid`)                          | unchanged                                                                                                                                                                                                                                                                                    | —       |
| 5   | **Controls** (new)                           | § _The controls_                                                                                                                                                                                                                                                                             | 7687    |
| 6   | **The Motir would buy band**                 | the shipped tone cards, from the store                                                                                                                                                                                                                                                       | 7687    |
| 7   | **The directions**, one list                 | the shipped direction card, each naming its category                                                                                                                                                                                                                                         | 7687    |
| 8   | `ProductClose`                               | unchanged                                                                                                                                                                                                                                                                                    | —       |
| —   | **The idea open in place** (`?idea=`)        | § _The idea open in place_                                                                                                                                                                                                                                                                   | 7688    |

Sections 6 and 7 are the only data-driven ones. The section headings keep their ids (`list-h`,
`more-h`) so in-page links survive.

## The controls (panels A, B, E, G, H)

One card under the rules (`data-surface="card"`, `--radius-card`, `--el-card`, `--shadow-card`,
padding `--spacing-card-padding` × 1.25). Its heading is an `h2` **"Find an idea"**, with the result
count beside it.

| Control            | Markup                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | URL effect                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search**         | the `SearchForm` shape: `<form method="get" action="/ideas" role="search">`, an input `name="q"`, a submit button **"Search"** (icon-only below 768 px, with an sr-only label), hidden inputs carrying the current `category` and every `tag` so a search composes with them. A clear (×) icon button appears in the field when `q` is set                                                                                                                                                 | submit → `ideasHref(params, { q, idea: null })`; × → `{ q: null, idea: null }`. Submitted on Enter or the button, **never as you type** — each search is a server read |
| **Category**       | a `role="group"` row of chips, `aria-label="Category"`: **"All categories"** first, then every entry of the list response's `categories` in the order the API returns it, each with its `count`. Chips are `next/link`s with `aria-pressed`. Pressed = `--el-tint-lavender` + `--el-text-strong`; resting = `--el-surface` + `--el-text-secondary`, `--el-border-soft` (hover `--el-border-strong`). The pressed category chip shows a × and toggles off; "All categories" never shows one | chip → `{ category: <slug> \| null, idea: null }`                                                                                                                      |
| **Tags**           | a `<details>` disclosure, summary **"Tags"** — or **"Tags · N selected"** — with a tag glyph and a chevron; open on load when any tag is selected. Inside, a `role="group"` `aria-label="Tags"` of chips from `/api/public/ideas/tags` (every tag with at least one active idea, with its count), the same chip shape with a tag glyph. **Several tags at once**; a pressed tag toggles off                                                                                                | chip → `{ tags: <toggled list>, idea: null }`. Tags are ANDed by the API                                                                                               |
| **Active filters** | rendered only when a filter is set: the label **"Filtered by"**, then a pill per filter — **"Category: <label>"** (`--el-tint-sky`), **"Tag: <label>"** per tag (`--el-tint-lavender`), **"“<q>”"** (`--el-tint-mint`) — each a link with a × and an sr-only "Remove", then **"Clear all"** (`--el-link`)                                                                                                                                                                                  | pill → that one filter cleared, `idea: null`; Clear all → `/ideas`                                                                                                     |

**The count** (`aria-live="polite"`, mono, `--el-text-secondary`): "**15 ideas**" with no filter,
"**N ideas match**" / "**1 idea matches**" with one, "**No ideas match**" at zero.

**Category counts are over every filter except the category** (the API's own rule), so a
category stays choosable while another is pressed. With a tag or a search set, a category the
response omits has no match — it is not drawn (panel B).

**Narrow screens (panel H):** the category row does not wrap; it scrolls sideways
(`overflow-x: auto`) and the pressed chip is scrolled into view on load. The count sits under the
heading. Everything else wraps.

`kind` is part of the URL model (`?kind=motir_buys|direction`) but has **no control** on this page:
the band and the directions list already separate the two kinds. A `kind` in the URL is honoured — the
other kind's block simply has nothing to show — and shows as no pill.

## The Motir would buy band (panel A)

- Eyebrow **"Motir would buy · N"** (the highlight square), `h2` **"Products Motir would buy
  today"** — the count moves out of the headline, which was "Six products…" when the six were
  copy.
- The shipped tone card, unchanged in shape: tones cycle **field → ground → wash** by position.
  Per card: mono eyebrow **"NN · <category label>"**, the title (`h3`), the pitch, the
  capabilities as the square-bulleted list, **the tags** as outlined mono tags (new), then the
  `dl` **"Why Motir needs it"** (`whyMotir`) / **"Who else buys it"** (`whoElse`), and a mono
  **"Open the idea →"** affordance at the foot.
- **The whole card opens the idea**: the title is a `next/link` to `ideasHref(params, { idea })`
  whose `::after` stretches over the card. `id="idea-<slug>"` stays, for the hero's jump list.
- **Not rendered at all** when no `motir_buys` idea matches the filters — no empty band, no
  heading.

## The directions — one list (panel A)

- The block keeps its shipped heading: eyebrow **"More directions · N"**, `h2` **"Good products
  to build, beyond what Motir needs"** and its body paragraph.
- **Every matching direction together in ONE list**, in the order the list response returns them
  (motir-core sorts `motir_buys` first, then newest `addedAt` first). **No section per category**
  and no category headings: a visitor who wants one category presses its chip in the controls.
- **The card** is the shipped "more" card (`data-surface="card"`, `--el-card`, `--el-border`),
  three columns at desktop, one below 768 px. Top to bottom: a mono eyebrow with the category's
  colour mark and **its category label** (`--el-text-secondary`; the card now carries the
  category itself, since no heading does), the title (`h4`, the stretched link), pitch, **tags**
  (new: `--el-surface` mono chips, `--el-text-secondary`), then the `dl` **"The evidence"** — the
  FIRST evidence row's claim followed by its source name as a link (`--el-accent-on-surface`,
  new tab, `rel="noopener noreferrer"`, raised above the stretched link) — and **"The gap"**. When
  an idea carries more than one evidence row, a mono line **"+N more sources"** follows; the
  rest are in the detail. Foot: **"Open the idea →"**.

### The category → colour mark (derived, never stored)

The mark is a decorative 9 px square (`aria-hidden`), one of the showcase fills, by the
category's **group** in motir-core's enum, so a new category inherits its group's mark with no
change here and a palette swap re-tints them all:

| Group              | Categories                                                                                                                                | Mark                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Business functions | legal, finance, security_compliance, customer_support, localization, growth_marketing, sales, people_hr, operations, engineering          | `--el-showcase-field`    |
| Verticals          | ecommerce, healthcare, education, financial_services, real_estate, logistics, construction, agriculture, pets, family_care, public_sector | `--el-showcase-decision` |
| Consumer           | personal_growth, personal_finance, health_wellness                                                                                        | `--el-showcase-record`   |
| Platform           | ai_infrastructure                                                                                                                         | `--el-showcase-ground`   |

An unknown future category (one `lib/ideas.ts` does not yet list) takes the platform mark.

## The idea open in place (panels C, D, I)

**Address:** `?idea=<slug>`, added to whatever filters are set. The list underneath renders with
those filters, so the panel opens over the filtered list.

**Desktop and tablet (≥ 768 px):** a **side sheet** on the right, 640 px wide, full height, over a
scrim (`--el-overlay-scrim`). `--el-card`, `--radius-modal` on its open edge, `--shadow-modal`,
`data-surface="modal"`. The sheet scrolls; the page behind does not. **Below 768 px:** the sheet
fills the viewport (no scrim, no radius).

**Semantics:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` the title.

**Content, in order** — a field that is null **or an empty string** is not drawn (the seeded
directions carry `whyMotir: ""`):

1. Mono eyebrow: the category mark, **"<category label> · Motir would buy"** or **"· A
   direction"**; the close control (an icon button, × glyph, `aria-label="Close"`) at the right.
2. Title (`h2`, `tabindex="-1"`), then the pitch (`--el-text-secondary`).
3. Tags as small chips, each a link to `ideasHref(params, { tags: [...tags, slug], idea: null })`
   — "more like this" — which closes the sheet.
4. **"What it would do"** — `capabilities`, square bullets.
5. **"The evidence"** — EVERY evidence row: the claim (`--el-text`), then the source name as a
   link with an external-arrow glyph (new tab, `rel="noopener noreferrer"`), then the date in
   mono as **month and year** ("October 2025"). The store records the day as the 1st when the
   source gives a month only, so the day is never shown. A row with `sourceDate: null` shows no
   date. A `--el-showcase-field` rule on the left of each row.
6. **"The gap"**, **"Why now"**, **"Why Motir needs it"**, **"Who else buys it"** — each a
   ruled section with a mono heading.
7. Desktop only: a quiet foot line, **"Press Esc or Back to return to the list."**

**Open:** from a card (the stretched title link) as a `next/link` push with `scroll: false`, so
it is a history entry and the list keeps its scroll position. The sheet is server-rendered when
the page is loaded with `?idea=`, so a shared link opens it on first paint.

**Close** returns to `ideasHref(params, { idea: null })` — the filters stay:

- **Back** closes it (the open was a push).
- **Escape** and the **close control** close it: `router.back()` when the sheet was opened from
  this list in this session, otherwise `router.replace()` to the URL without `idea` (a sheet
  loaded from a shared link has nothing behind it to go back to). With no JavaScript the close
  control is a plain link to that URL.
- A click on the scrim closes it the same way.

**Focus:** on open, focus moves to the title; Tab is trapped inside the sheet; on close, focus
returns to the card's title link that opened it (`#idea-<slug>`'s link), or to the
"Find an idea" heading when the sheet was loaded from a link.

**Data:** the list response already carries every field, so the sheet renders from the list
item when the slug is in it, and calls `fetchIdea(slug)` only when it is not (an idea outside the
current filters, opened from a shared link).

**Unknown or retired slug:** `fetchIdea` answers `null` (motir-core gives both the same 404), and
the page renders the list with **no sheet and no message** — the URL is left as it is, so Back
still behaves. A slug that is not slug-shaped is dropped by `parseIdeasParams` before any read.

## States

- **Populated** — panel A.
- **Filtered** — panel B. No `motir_buys` match ⇒ no band; no direction match ⇒ no directions
  block.
- **No match** (panel E) — the controls stay (search shows what was asked, the pills show the
  filters); in place of the band and the list, one empty state: `h2` **"No idea matches
  these filters"**, body **"Try fewer tags, another category, or different words. Every idea is
  still here."**, and a ghost button **"Clear all filters"** → `/ideas`. Dashed border,
  `--el-surface-soft` — not a warning.
- **API unreachable** (panel F) — `fetchIdeas` throws `IdeasUnavailableError`. The hero (with its
  promise card but no jump list), the rules and the close still render; **the controls do not**.
  In their place one state: mono eyebrow **"Temporarily unavailable"** (decision mark), `h2`
  **"The ideas could not be loaded right now"**, body **"The list is read live from Motir, and
  Motir did not answer. Nothing is lost; try again in a moment."**, and a ghost button
  **"Try again"** linking to the same URL. A failing tags read alone does not take the page
  down: the Tags disclosure is simply not rendered.
- **Pending** (panel G) — a filter change needs data the browser does not have, so it is a server
  navigation (`router.push`), not a shallow one. While it is in flight the count reads
  **"Updating…"** and the results region carries `aria-busy="true"`; the current list stays as
  it is. **No skeleton, no dim, no spinner, and no `loading.tsx`.** Nothing streams: first paint
  is server-rendered.

## Contrast

Every ink on the board is one the shipped page already pairs: `--el-text` / `--el-text-strong`
for primary ink, `--el-text-secondary` (never `--el-text-muted`) for every caption, count and
chip label on `--el-surface`, `--el-surface-soft` and the tints; the showcase cards keep their
own `-text` / `-ground-muted` inks. The colour marks and the bullet squares are decorative and
`aria-hidden`.

## Copy

New strings, for `messages/en.json` `ideas.*` — the build cards own the keys. `ideas.items` and
`ideas.more.ideas` leave the catalogue (MOTIR-7687); `ideas.listHeadline` changes from "Six
products Motir would buy today" to **"Products Motir would buy today"**.

| Where                           | Copy                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| controls heading                | Find an idea                                                                                                                                                                        |
| search placeholder / aria-label | Search ideas, evidence and gaps / Search the ideas                                                                                                                                  |
| search submit · clear           | Search · Clear the search                                                                                                                                                           |
| category group label · all      | Category · All categories                                                                                                                                                           |
| tags summary                    | Tags · Tags · {n} selected                                                                                                                                                          |
| active label · pills · clear    | Filtered by · Category: {label} · Tag: {label} · “{q}” · Remove · Clear all                                                                                                         |
| count                           | {n} ideas · {n} ideas match · 1 idea matches · No ideas match · Updating…                                                                                                           |
| band eyebrow                    | Motir would buy · {n}                                                                                                                                                               |
| directions eyebrow              | More directions · {n}                                                                                                                                                               |
| card category eyebrow           | {category label}                                                                                                                                                                    |
| card foot · extra sources       | Open the idea · +{n} more sources                                                                                                                                                   |
| detail eyebrow kinds            | Motir would buy · A direction                                                                                                                                                       |
| detail headings                 | What it would do · The evidence · The gap · Why now · Why Motir needs it · Who else buys it                                                                                         |
| detail close · foot             | Close · Press Esc or Back to return to the list.                                                                                                                                    |
| empty                           | No idea matches these filters · Try fewer tags, another category, or different words. Every idea is still here. · Clear all filters                                                 |
| error                           | Temporarily unavailable · The ideas could not be loaded right now · The list is read live from Motir, and Motir did not answer. Nothing is lost; try again in a moment. · Try again |

## Who builds what

- **MOTIR-7687 (the list):** elements 3, 5, 6 and 7 above — the promise card's jump list, the
  controls with their URL behaviour, the count and pending state, the band, the one directions list
  with each card's category mark, the cards with their stretched links to `?idea=`, the empty state and
  the error state; and the copy move out of `messages/en.json`.
- **MOTIR-7688 (the detail):** everything in § _The idea open in place_ — the sheet at both
  widths, its content and field rules, open / close / Escape / Back / scrim, the focus rules, the
  data rule (list item first, `fetchIdea` otherwise) and the unknown-slug fallback.

## Not drawn here

Per-idea routes (`/ideas/<slug>`, out by owner decision), any write from motir.co, translations
(the site is English-only), the operator console (MOTIR-7679), and the hero, rules, close and
footer, which are unchanged.
