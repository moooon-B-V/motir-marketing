# motir.co landing — three entry doors, one idea box (`design/marketing/`)

**Subtask:** MOTIR-1143 · 8.3.3 (`type: design`) · **Story:** MOTIR-656 (8.3 Marketing site + brand
mark) · **Epic 8 · Launch readiness.** **Repository: `motir-marketing`.**

The public front door at **motir.co**, for **all three** of Motir's genuinely different first-time
visitors. It opens on a **symmetric fork** — _start something new_ and _I have an existing project_
as two **co-equal** doors, side by side — and adds _Start free — project management only_ as a
**tertiary** door: a nav entry plus a single line under the hero.

**This asset is the ROUTING CONTRACT MOTIR-1152 builds to.** Every door is a cross-origin hand-off
into `app.motir.co`; the marketing site draws **no** connect, import-source, index, generate or chat
UI of its own. Those live downstream in 7.15 / 7.17 / 7.3 and are owned by their own designs.

**Asset files (three):** `design-notes.md` (this file, the AREA's note) · `landing.mock.html` (the
source of truth — standalone, re-stating the shipped `--el-*` values so it paints without a Tailwind
build, exactly as `motir-core/design/onboarding-entrance/*.mock.html` does) · `landing.png`
(full-page Playwright chromium export, light theme, `deviceScaleFactor: 2`).

> **⚠️ The note is `design-notes.md`, NOT `landing.design-notes.md` — and this is a mechanism, not a
> style preference.** MOTIR-1143's acceptance criterion asked for three files "sharing a basename";
> the design-result publisher cannot see a note named that way. `classifyDesignPath` in
> `motir-core/scripts/upload-design-assets.mjs` matches the mock and the export on SUFFIX
> (`.mock.html`, `.png`) but the note on **exact basename** — `path.basename(filePath) === 'design-notes.md'`
> — so `landing.design-notes.md` classifies as `null`, lands in `ignored`, and is never published,
> while its two siblings publish normally. The card would get the pictures and none of the words.
>
> It is also the convention 44 of motir-core's 45 areas already follow: ONE `design-notes.md` per
> AREA, with the mock and the export sharing a per-surface basename. The criterion was amended on the
> record; the defect in the classifier and the one non-conforming file it strands are **MOTIR-3750**.

---

## Designed against shipped reality

Nothing on this page ships yet — `motir-marketing`'s `app/page.tsx` is a deliberate one-paragraph
scaffold (MOTIR-1455) with `robots: disallow: /`, and its own comment says _"Do not grow this file
into the landing; replace it there."_ But almost everything the page COMPOSES from already ships, so
the mock is built from those real sources rather than from a mental model of them:

| what                  | read from                                                                                                                                                                 | how it is used here                                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The hero's vocabulary | `motir-core/design/onboarding-entrance/onboarding-entrance.mock.html` + its `.png`, **rendered and read**, not summarised                                                 | The idea Card, its accent border + `--shadow-elevated`, the mono field label, the 7-row textarea, the footer row with the ArrowRight primary Button, and the `OR` divider are the entrance's, element for element |
| The eyebrow chip      | the same asset's _Build with AI_ chip                                                                                                                                     | Same tint, same size, same `Sparkles` glyph — **and this page is the propagation target** the entrance's notes name (below)                                                                                       |
| The brand lockup      | `motir-core/design/brand/design-notes.md` §3 (the reference `.brand-lockup` CSS, copied verbatim) + `design/brand/wave-band-24.svg` (the generated path, copied verbatim) | The top bar and the footer. `--brand-size` 26 px in the bar, 22 px in the footer                                                                                                                                  |
| The public chrome     | `motir-core/app/(public)/explore/_components/ExploreTopBar.tsx` and `ExploreFooter.tsx`                                                                                   | The bar's `--el-surface-soft` fill + hairline + `py-3` rhythm; the footer's four-column grid, its uppercase column headings and its legal rows                                                                    |
| The nav's own items   | `ExploreTopBar`'s shipped set                                                                                                                                             | `Explore · Docs · Sign in · Start free` — the card's requested nav IS this bar's set minus the two non-resolving labels (`Product`, `Pricing`), which render as dead text there and are simply absent here        |
| The tokens            | `motir-core/packages/design-system/theme.css` on `origin/main` (Tier 0 · Tier 1 dark · Tier 3 `--el-*`)                                                                   | Every colour and every radius in the mock, light AND dark, restated at its resolved value                                                                                                                         |
| The icons             | `lucide-react@1.16.0` `dist/esm/icons/*.mjs`                                                                                                                              | `Sparkles`, `ArrowRight`, `GitBranch`, `LayoutGrid`, `Bot`, `GitFork`, `CircleAlert`, `LoaderCircle`, `Menu` — the CURRENT paths, at `viewBox="0 0 24 24"`, stroke 2, round caps                                  |
| The idea's own bound  | `motir-core/lib/onboarding/pendingIdea.ts`                                                                                                                                | `MAX_PENDING_IDEA_LENGTH = 2000`, and `normalizePendingIdea()` **truncates** past it — which is why the box draws a counter (see _Door 1's states_)                                                               |

**The two things the page will render from are already distributable.** `@motir/design-system@0.1.0`
is on public npm (tokens + `Button` / `Card` / `Pill` / `SectionLabel`), and `@motir/brand` ships the
lockup's `.brand-*` presentation (MOTIR-1456, `done`). MOTIR-1152 installs both; it does not re-cut
either.

**⚠️ What is drawn here is NOT the copy.** MOTIR-1144 owns the landing's words and was running
concurrently with this pass. Everything in the mock is placeholder **at the specified register** —
"agents", never "hosted coding agents"; no `repo` jargon outside the import row, whose audience
self-selects as having a codebase; the three-pillar name used in full. Treat the mock as the layout
and the hierarchy; take the words from 1144.

---

## Hierarchy — TWO co-equal doors, then one tertiary

### ⚠️ REVISED 2026-08-28 (Yue). Doors 1 and 2 are CO-EQUAL. The prior reasoning is kept below.

> _"'I have an existing project' should be first-class, it should be as important as the 'I have a
> new idea' — new project."_

This reverses the hierarchy the first draft of this asset shipped, which made the idea box primary
and import a secondary row under an `OR`. **It is a decision, not a finding** — it sits above the
rung-1 evidence below, which argued the other way and is preserved rather than deleted, because a
future reader who finds that research and does not know it was overruled will quietly re-demote
door 2.

**What "co-equal" is expressed as, so it cannot erode one attribute at a time.** The two doors share
every treatment that carries weight: the same grid track and width, the same `--el-accent` border,
the same `--shadow-elevated`, the same `<h2>`, the same tinted icon tile, the same primary `Button`.
**The `OR` divider is GONE** — a divider is precisely what makes one side an alternative to the
other. Neither door is "the fold"; a visitor arrives already belonging to one of them, and the page
must not tell them which is the real way in.

**Door 2 EARNS the weight rather than being padded to fill it.** A card holding one line of prose
beside a card holding a text area reads as secondary however it is styled. So the existing-project
door draws its three real sources — **your codebase · Jira · Linear or Plane** — as three focusable
rows, which is the same information the old row compressed into a sentence, at the weight the
decision asks for. That also enumerates the products, which the import-copy rule requires anyway.

**⚠️ THE SEAM THIS OPENS, and it is not resolved here.** The shipped `/onboarding` entrance
(MOTIR-1461) is **idea-first with import demoted to a secondary row** — Yue's own call on 2026-07-01,
after the research below. A visitor now meets a symmetric fork on motir.co and, one click later, a
demoted import row inside the app. Visual continuity between the two properties is one of this
card's stated constraints, so **either the entrance takes the same revision or the asymmetry needs a
reason on the record**. Flagged for MOTIR-1461; this asset cannot decide another surface's design.

### The rung-1 evidence, kept — it argued for idea-first and was OVERRULED

Gathered and recorded in `motir-core/design/onboarding-entrance/design-notes.md` (2026-07-01) for the
same question one surface downstream:

- **Idea-first products lead with ONE prompt and demote every other path.** Lovable, Bolt, v0,
  Replit and Firebase Studio all open on a single "describe your app" box and treat "import an
  existing repo" as a secondary affordance; Firebase Studio separates a primary App Prototyping
  agent from a quieter import path.
- **Two co-equal cards is the pattern for SOURCE pickers, not idea entrances.** Vercel and Railway
  show _Import Git Repository_ beside _Deploy a Template_ — but both sides start from an existing
  artifact, and neither asks for a long idea.
- **PM tools put "start free" in the NAV.** Linear and Jira both do.

**Only the first two are overruled, and only for THIS surface.** Motir is not only an idea-first
builder — it is also the destination for a team that already has a codebase, or work items in Jira,
Linear or Plane, and that is a different business than Lovable's. The mirror is evidence about
idea-first BUILDERS; the decision is that motir.co is not only one.

**The third point still stands and is why door 3 is unchanged.** A third co-equal card would make
"project management only" one of three equal things Motir is. It is not: it is the way in for
somebody who wants neither AI door, and it needs to be findable, not promoted — a nav entry plus one
line, which is the convention Linear and Jira already use.

**One objection the entrance raised does NOT carry over.** It rejected a two-up fork partly because
"a half-width column can't hold a long first idea" — true of its own 660px centred column (~310px a
side). This page's fork sits in a **1080px** container, so each door is ~510px, wider than the
entrance's own full-width box. The constraint was about width, and this surface has it.

**What door 3 fixes.** MOTIR-655 (8.2, the non-AI team first-run) has existed for months and
**nothing anywhere routed into it from the public web**. The landing drew two doors for three
journeys, so a visitor who wanted the PM tool had to already know that the app's sign-up URL exists —
which is the one thing a marketing site exists to spare them.

---

## The three doors — the routing contract

Every door leaves motir.co for `app.motir.co`. **SHIPPED** means the receiving half exists on
motir-core's `origin/main` today; **NOT READ YET** means the parameter is specified here and nothing
in motir-core reads it (see the disposition below the table).

| #     | door                                                | who it is for                                                  | placement                                             | target                                                                                                                  | lands on                                                                                                                                 |
| ----- | --------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Start something new** (CO-EQUAL)                  | starting fresh, wants AI planning                              | the LEFT door of the fork                             | POST the idea to the pre-auth draft receiver (MOTIR-1458), then `https://app.motir.co/sign-in?draft=<id>` **· SHIPPED** | the `/onboarding` entrance pre-fills its **carried** panel (MOTIR-1462), which reads the `motir_pending_idea` cookie the receiver plants |
| **2** | **I have an existing project** (CO-EQUAL)           | already has a codebase, or work items in Jira, Linear or Plane | the RIGHT door of the fork, drawing its three sources | `https://app.motir.co/sign-in?intent=import` **· NOT READ YET** (owner: **MOTIR-3846**)                                 | the `/onboarding` entrance's EXISTING branch → 7.15 (repo) / 7.17 (Jira · Linear · Plane)                                                |
| **3** | **Start free — project management only** (TERTIARY) | wants the PM tool, no AI planning                              | a nav entry **and** one line under the hero           | `https://app.motir.co/sign-up?intent=tracker` **· NOT READ YET** (owner: **MOTIR-3639**)                                | the 8.2 team first-run (MOTIR-655)                                                                                                       |

**Verified on `origin/main`, 2026-08-28:**

- `app/(auth)/sign-in/page.tsx` reads `next` and `draft`, and renders for a signed-in reader **only**
  when `?draft=` is present — the comment on that file explains why (a Server Component cannot set
  the cookie, so bouncing first would drop the idea somebody typed here). Door 1's whole chain is
  real.
- **`?intent` is read nowhere.** `git grep -n "intent" origin/main -- 'app/(auth)' 'lib/onboarding'`
  returns one hit, the word _intentionally_ in a comment. `/sign-up` reads `next` alone and says so.

**The ownership sweep, PER ROW rather than per table (MOTIR-3746's own criterion — one row having an
owner is what makes the others invisible):**

| #   | parameter         | read on motir-core `origin/main`?          | owning card                      |
| --- | ----------------- | ------------------------------------------ | -------------------------------- |
| 1   | `?draft=<id>`     | **YES** — `sign-in/page.tsx` reads `draft` | MOTIR-1458 (`done`) · MOTIR-1462 |
| 2   | `?intent=import`  | no                                         | **MOTIR-3846**                   |
| 3   | `?intent=tracker` | no                                         | **MOTIR-3639**                   |

Every row now has an owner. **When MOTIR-3846 and MOTIR-3639 ship, flip their `NOT READ YET` markers
to `SHIPPED` here** — the marker is this document's own claim about motir-core, and a claim nobody
re-reads is how the gap this table records got made in the first place.

**Disposition — doors 2 and 3 are specified as the card specifies them, and the gap is FILED, not
absorbed.** The `?intent=tracker` parameter has an owner (**MOTIR-3639**, _8.2.10 Carry the tracker intent
across the auth round trip_); the import parameter had none, which is **MOTIR-3746** — and now has **MOTIR-3846**, the import twin of 3639, carved on 2026-08-28. Both doors
DEGRADE gracefully in the meantime and MOTIR-1152 should ship them that way: without the parameter a
visitor lands on the `/onboarding` entrance's default panel, which already draws the import row, or
on `/sign-up`, which already creates the account. So the link is never dead — it just skips one
click less than it should. **Do not "fix" this by silently rewriting the doors to `?next=`**: the
parameter is the contract, and the card that reads it is scheduled work.

---

## ACCESS PATH — every entrance to this page, and every exit from it

### INBOUND (how a person reaches motir.co)

- **The address bar / a search result / a directory listing.** motir.co is the apex; there is no
  in-product door to it, and the site is the first Motir surface most visitors ever see. The SEO
  entity signals that make the search arrival work — `Organization` + `WebSite` JSON-LD, the root OG
  image, `robots`, the sitemap — are **MOTIR-1154**'s, not drawn here.
- **The `robots.txt` on the scaffold today says `disallow: /`** and flipping it is MOTIR-1154's
  explicitly. Until it flips, the only inbound path is a typed URL or a shared link.
- **From inside the app:** nothing. `app.motir.co` never links back to the marketing root — the
  brand lockup in motir-core's own chrome goes to `/`, which is the app's session-aware redirect
  (MOTIR-3367), not to motir.co.

### OUTBOUND (what this page can send you to — the point of the card)

| affordance                                | goes to                                                 | owner                                                              |
| ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Door 1 — **Start planning**               | pre-auth draft POST → `app.motir.co/sign-in?draft=<id>` | MOTIR-1458 (receiver, `done`) · MOTIR-1462 (carried panel, `done`) |
| Door 2 — **Import**                       | `app.motir.co/sign-in?intent=import`                    | 7.15 / MOTIR-930 (wizard design) · 7.17 (Jira / Linear / Plane)    |
| Door 3 — **Start free** (nav + hero line) | `app.motir.co/sign-up?intent=tracker`                   | MOTIR-655 (8.2 team first-run) · MOTIR-3639 (the intent hand-off)  |
| Nav — **Sign in**                         | `app.motir.co/sign-in`                                  | shipped                                                            |
| Nav — **Explore**                         | `app.motir.co/explore`                                  | Story 6.13 (the project square), shipped                           |
| Nav — **Docs**                            | `app.motir.co/docs`                                     | Story 11.4, shipped                                                |
| Open-core block — **Read the source**     | `github.com/moooon-B-V/motir-core`                      | —                                                                  |
| Footer — Privacy · Terms · All legal      | `app.motir.co/legal/*`                                  | MOTIR-1134, shipped                                                |
| Directory badges                          | outbound to Product Hunt / G2 / GitHub / AlternativeTo  | **MOTIR-1156** (8.3.9) fills the slots; this asset draws them      |

### ⚠️ What this page explicitly does NOT draw

**No connect UI. No import-source picker. No index or generate step. No chat.** Door 2 is a
marketing entry point and nothing more: the repository connection, the source selection, the code
read and the generate step are all owned by the 7.15 migrate wizard (design **MOTIR-930**,
orchestration MOTIR-931) and by 7.17 for Jira, Linear and Plane. Door 1 draws an idea box, not the
discovery chat — the conversation is 7.3's surface and begins after auth. Re-drawing any of it here
would duplicate a design that already exists and would drift from it the day it changes.

**And no pricing page, no product page, no blog.** The footer names them as plain labels, exactly as
`ExploreFooter` already does for the pages that do not resolve — never as dead links a crawler would
follow into a 404.

---

## Surfaces / panels (inspect every panel)

### Panel 1 — the landing, desktop, light (1280)

- **Top bar.** The 26 px horizontal brand lockup at the extreme left (glyph
  `--el-accent-on-surface`, wordmark `--el-text`, the §3 proportions: `0.72 ×` and `0.33 ×` the
  glyph box). Nav — `Explore`, `Docs` — as `--el-text-secondary`. Right cluster: `Sign in` as a
  ghost `Button`, `Start free` as a primary `Button` with `ArrowRight`. `--el-surface-soft` fill on
  an `--el-border` hairline, matching `ExploreTopBar`.
- **Hero, centred, 720 px column.** The _Build with AI_ eyebrow chip on `--el-tint-lavender`; a
  serif `<h1>` at 46 px / 1.1 / `-0.02em`; a 16 px lede in `--el-text-secondary` naming the three
  pillars in one sentence.
- **The FORK — doors 1 and 2, co-equal.** A two-column grid at equal width. Each door is a `Card`
  on an `--el-accent` border with `--shadow-elevated`, opening with a tinted icon tile + `<h2>` +
  one line, and closing on a footer row divided by an `--el-border-soft` hairline with a primary
  `Button`. **Door 1** carries the mono field label and the textarea; **door 2** carries its three
  source rows. They stretch to equal height. One hint line, centred, sits under both.
- **Door 3's second half** — one centred line: _"Just want project management? **Start free** — boards,
  sprints and a backlog, with no AI in the way."_ `Start free` is an `--el-link` text link.
- **The three pillars**, on an `--el-surface-soft` band: a 3-column grid of `Card`s, each with a
  tinted 40 px icon tile (lavender / sky / mint), an ordinal, an `<h3>` and two lines of body. The
  three are named exactly: **AI planning · project management · agent orchestration.**
- **Open-core framing**, a full-width row under the pillars: a peach `GitFork` tile, the GPL-3.0
  statement, and a link to the source. It is not a fourth pillar and is not drawn as one.
- **Social proof / directory badges**, a quiet centred band: a mono caption and four dashed **slots**.
  The slots are drawn; what goes in them is MOTIR-1156's.
- **Footer**, four columns on `--el-surface-soft`, mirroring `ExploreFooter`: brand + tagline ·
  Product · Explore · Company (with the three legal rows), then a legal strip naming **moooon B.V.**
  and the GPL-3.0 split.

### Panel 2 — the landing, mobile (390)

Everything reflows to one column. The nav collapses behind the menu button and **the two things that
survive into the bar are the brand and `Start free`** — door 3's nav half is the last thing to go,
not the first, because it is the only door in the bar. The doors keep their order and their
weighting: the idea box is still the fold, the import row still sits under the `OR`, the tertiary
line still reads as a line. The pillars stack; the badge band drops to three slots.

### Panel 3 — door 1's four states

| state             | what it draws                                                                                                                                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **empty (rest)**  | The textarea holds focus on load; the visible focus ring is a 2 px `--el-accent-on-surface` outline at 2 px offset. **Submit is ENABLED on an empty idea** — the box is a head-start, not a gate, exactly as the `/onboarding` entrance decided. The counter is present but `visibility: hidden`, so revealing it later never reflows the footer row. |
| **typing**        | The counter appears on the first keystroke, reading `<n> / 2000`.                                                                                                                                                                                                                                                                                     |
| **submitting**    | The button LABEL changes to _Starting…_ beside a spinning `LoaderCircle`, the control takes `aria-busy`, and the textarea is disabled so a second submit cannot double-POST the draft.                                                                                                                                                                |
| **submit-failed** | A `role="alert"` banner between the textarea and the footer: an `--el-danger` hairline over `--el-danger-surface` with `--el-danger-on-surface` ink and a `CircleAlert` glyph. **The typed idea is never cleared** — the banner says so. Two exits: _Try again_, and _Continue without it_ → `app.motir.co/sign-up`.                                  |

**Why the 2000-character counter is not decoration.** `motir-core/lib/onboarding/pendingIdea.ts`
sets `MAX_PENDING_IDEA_LENGTH = 2000` and `normalizePendingIdea()` **truncates** rather than rejects.
A visitor who pastes four thousand characters silently loses half of them somewhere between this box
and the discovery chat, and the only place that can be made visible is here. The `textarea` also
carries `maxlength="2000"` so the browser enforces the same bound the server will.

**Why the failure state is drawn at all.** Door 1's submit is a **cross-origin POST between two
different origins on two different Fly apps**. It can fail for reasons that have nothing to do with
the visitor — CORS, a cold machine, a network blip — and a hero that draws only the happy path
leaves that moment to be improvised by whoever implements it, at the exact instant a first-time
visitor has just typed the most valuable thing they will type all session.

### Panel 4 — dark theme

The same surface with no second design: every colour is the same token resolving to its Tier-1 dark
value. The panel exists because one measured constraint only shows up there (below).

### Panel 5 — the routing map

The three doors as rows, each with its exact target URL and its landing surface, and each stamped
`SHIPPED` or `NOT READ YET`. This panel is the routing contract in one picture; the table above is
the same thing in prose.

---

## Primitives composed (no hand-rolling)

| Element                         | Shipped primitive / pattern                                                 | Token role                                                                                                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand lockup (bar, footer)      | `BrandMark` / `@motir/brand` `.brand-lockup` — the §3 reference CSS, copied | glyph `--el-accent-on-surface`; wordmark `--el-text` on `var(--font-sans-source)`, the raw FACE variable, **never `--font-sans`** (three `[data-type]` blocks re-point the role token and would re-letter the mark) |
| Top bar                         | the `ExploreTopBar` header pattern                                          | `--el-surface-soft` fill, `--el-border` bottom hairline, `--spacing-card-padding` inline                                                                                                                            |
| `Start free` / `Start planning` | `Button` `variant="primary"`, `rightIcon={<ArrowRight/>}`                   | `--el-accent` / `--el-accent-text`; `--radius-btn`, `--height-btn-md` (`--height-btn-sm` in the bar)                                                                                                                |
| `Sign in`                       | `Button` `variant="ghost"`                                                  | `--el-text`; `--el-muted` hover fill                                                                                                                                                                                |
| The two fork doors              | `Card`, one grid track each                                                 | `--el-page-bg` on an `--el-accent` border + `--shadow-elevated`; `--radius-card`. **Identical on both — that identity IS the co-equality**                                                                          |
| Idea box (door 1)               | `Card` + `textarea`, continuing the entrance                                | transparent input fill; `--el-border-soft` footer hairline                                                                                                                                                          |
| Source rows (door 2)            | option rows, as the entrance's import row                                   | `--el-page-bg` on `--el-border` (→ `--el-border-strong` + `--el-surface-soft` on hover), `--radius-input`                                                                                                           |
| Idea field label                | mono uppercase label                                                        | **`--el-text-muted`** — see the deliberate divergence below                                                                                                                                                         |
| Character counter               | mono inline label                                                           | `--el-text-muted`                                                                                                                                                                                                   |
| Door icon tiles                 | tinted squares                                                              | `--el-tint-lavender` (door 1) / `--el-tint-sky` (door 2); ink `--el-text-strong`; `--radius-control`                                                                                                                |
| `Build with AI` eyebrow         | badge chip (as on the entrance)                                             | `--el-tint-lavender` bg, `--el-text-strong` ink, `--radius-badge`, `--spacing-chip-x/y`                                                                                                                             |
| Door-3 line                     | inline text link in body copy                                               | `--el-link`; underline on hover                                                                                                                                                                                     |
| Pillar cards                    | `Card`                                                                      | `--el-page-bg` on `--el-border`, `--shadow-subtle`, `--spacing-card-padding`                                                                                                                                        |
| Pillar icon tiles               | tinted squares                                                              | `--el-tint-lavender` / `--el-tint-sky` / `--el-tint-mint`; ink `--el-text-strong`; `--radius-control`                                                                                                               |
| Open-core row                   | `Card` + tinted tile                                                        | `--el-tint-peach` tile; `--el-link` on the source link                                                                                                                                                              |
| Directory badge slots           | dashed placeholder chips                                                    | `--el-surface` fill, `--el-border-strong` dashed edge, `--radius-control`                                                                                                                                           |
| Footer                          | the `ExploreFooter` grid                                                    | `--el-surface-soft` band, `--el-border` top hairline, uppercase `--el-text-secondary` headings                                                                                                                      |
| Error banner (state D)          | callout box + `CircleAlert`                                                 | `--el-danger-surface` fill, `--el-danger` hairline, `--el-danger-on-surface` ink, `--radius-input`                                                                                                                  |

Icons are **lucide** at `viewBox="0 0 24 24"`, stroke 2, round caps, matching every shipped surface.

### Colour + shape rules (mock === component)

- Every product colour resolves to an `--el-*` token, or to a `color-mix()` whose inputs are both
  tokens (`--el-danger-on-surface`). **No invented hues.** The only raw values in the file are the
  non-semantic elevation shadows and the doc-annotation scaffold (the sheet, panel captions, ref
  chips, viewport rulers), which are not product UI.
- Shape flows through element-semantic tokens — `--radius-card` / `-btn` / `-input` / `-control` /
  `-badge` / `-kbd`, `--spacing-card-padding` / `-chip-x` / `-chip-y`, `--height-btn-md` /
  `-btn-sm` — never a raw `rounded-md` / `p-2` / `h-9`, so a `data-style` swap re-shapes the page.
- The mock declares the `--el-*` layer TWICE, once at `:root` for light and once on a `.dark` class
  for dark, because `--el-*` are declared with `var(--color-*)` in the real stylesheet and `var()`
  substitutes at the DECLARING element — a nested `data-theme="dark"` alone flips nothing (the
  MOTIR-3592 shape). Restating the resolved values is what lets Panel 4 sit beside Panel 1 in one
  static file.

### One deliberate divergence from the entrance, on the record

The `/onboarding` entrance paints its `YOUR IDEA` field label `--el-text-faint`. **This asset uses
`--el-text-muted` instead.** `theme.css`'s own comment on `--el-text-faint` is unambiguous: it
_"NEVER CARRIES TEXT WCAG MEASURES — 2.37–2.82:1 on every surface in BOTH themes"_, and it is for
decorative glyphs and disabled text, both of which WCAG exempts. A field label is active
informational text and is neither. `--el-text-muted` is 4.54:1 on the white card, which is the token
the same comment names for exactly this case. The visual difference is a half-step of grey; the
difference in kind is that one of them is measurable.

---

## Accessibility

Measured from the literal token values in `packages/design-system/theme.css` (`motir` palette), both
themes. Text takes WCAG 1.4.3's **4.5:1**; a focus indicator and a graphical object take 1.4.11's
**3:1**.

| element                                   | ink → surface                                    | light                | dark                  | bar              |
| ----------------------------------------- | ------------------------------------------------ | -------------------- | --------------------- | ---------------- |
| `<h1>`, pillar headings, import-row title | `--el-text` → page                               | 17.40:1              | 17.42:1               | ≥4.5 ✓           |
| lede, hints, nav, footer body             | `--el-text-secondary` → page                     | 6.80:1               | 7.35:1                | ≥4.5 ✓           |
| pillar body, nav on the bar               | `--el-text-secondary` → `--el-surface-soft`      | 6.51:1               | 6.94:1                | ≥4.5 ✓           |
| eyebrow chip ink                          | `--el-text-strong` → `--el-tint-lavender`        | 9.54:1               | 11.71:1               | ≥4.5 ✓           |
| icon-tile glyphs (sky / mint / lavender)  | `--el-text-strong` → the tint                    | 10.17 / 10.43 / 9.54 | 11.61 / 11.29 / 11.71 | ≥3 ✓             |
| primary Button label                      | `--el-accent-text` → `--el-accent`               | 6.57:1               | 4.99:1                | ≥4.5 ✓           |
| brand glyph                               | `--el-accent-on-surface` → `--el-surface-soft`   | 6.29:1               | **5.76:1**            | ≥3 ✓ (graphical) |
| door-3 text link                          | `--el-link` → page                               | 4.94:1               | 7.59:1                | ≥4.5 ✓           |
| idea field label, counter                 | `--el-text-muted` → `--el-page-bg`               | 4.54:1               | **7.35:1** [^muted]   | ≥4.5 ✓           |
| error banner ink                          | `--el-danger-on-surface` → `--el-danger-surface` | **5.77:1**           | **4.75:1**            | ≥4.5 ✓           |
| focus ring                                | `--el-accent-on-surface` → page                  | 6.57:1               | **6.11:1**            | ≥3 ✓             |

[^muted]:
    **CORRECTED 2026-08-29 (MOTIR-3874), and it is not a version move — the row's two cells were
    measured on two different surfaces.** `--el-text-muted` → `--el-page-bg` is **4.54:1 light /
    7.35:1 dark**; the **6.67:1** that stood here is that ink on **`--el-surface`**, whose own light
    arm is **4.17:1 — under AA**. `.idea` is `background: var(--el-page-bg)`, so `--el-page-bg` is
    the surface this row is about and the corrected numbers both pass. Identical on 0.1.0 and 0.1.1,
    so nothing about the pin caused it; it surfaced because MOTIR-3874 re-ran every row of this
    table against the installed package rather than only the rows it expected to have moved. **The
    4.17 is worth carrying forward**: `--el-text-muted` on a raised surface is the class motir-core
    swept and guarded in MOTIR-2477, and nothing in this repository guards it.

### ⚠️ The measured constraint this design routed around — RETIRED 2026-08-29 (MOTIR-3874)

> **The three rows above marked in bold moved because the PACKAGE moved, not because anything was
> re-measured more carefully.** ~~`--el-accent-on-surface` as TEXT on `--el-surface-soft` is 4.41:1
> in the dark theme — under AA. That is the exact pairing `ExploreTopBar` ships for its
> `aria-current` nav item at 13.5 px semibold, which is not WCAG large text. So the landing's top bar
> paints no accent-coloured text at all.~~ **On the pinned `@motir/design-system@0.1.1` that pair is
> `5.76:1` and passes AA** — MOTIR-3745's `color-mix()` lift, published by MOTIR-3872. The
> prohibition is gone with its premise; see _The nav entry_ below for what replaced the treatment it
> shaped.

**Nothing on THIS page changes, and that is a property of the page rather than of the number.**
motir.co is the root: none of its nav items is ever the current page, so there was nothing to mark
here either way. The nav is `--el-text-secondary` (6.94:1 dark), the CTA is a filled `Button` (white
on `--el-accent`, 4.99:1 dark), and the brand glyph keeps `--el-accent-on-surface` — which is now
5.76:1 rather than 4.41:1, and was never at risk anyway as a graphical object at 3:1.

**The motir-core defect was FILED, not absorbed: MOTIR-3745** — `done` — together with the reason
nothing caught it (`tests/theme/inkContrastLint.test.ts` had a faint arm, a muted arm and a danger
arm, and no accent arm, so this ink was unmeasured on every surface in every palette). The publish +
pin that carried the fix here is **MOTIR-3872**, and the correction to this asset is **MOTIR-3874**.
**MOTIR-1152 may now use the accent ink for a current nav item** — and on this page still has no
item to mark.

### The rest of the a11y contract

- **Exactly one `<h1>`** per page — the hero headline. Heading order is `h1` → `h2` (**each of the
  two fork doors**, the pillars' band heading, the footer's column headings) → `h3` (each pillar, the
  open-core row); no level is skipped and none is chosen for its size. **The two doors take the SAME
  level, and that is a co-equality requirement rather than a formatting one** — a screen-reader user
  navigating by heading meets two peers, which is the whole decision expressed in the one channel
  where the visual treatment does not reach.
- **The brand lockup's accessible name comes from the visible wordmark**, and the glyph is
  `aria-hidden` — never both, per the brand notes §8. It is a lockup, so it is decorative + visible
  text, not an `aria-label`.
- **Door 2's three sources are real links, each its own focusable row** with a visible ring, not one
  card with a single target — a co-equal door that is one big click target while its peer is a rich
  form is not co-equal in the tab order either.
- **Every icon in the page is `aria-hidden`**: each one sits beside text that carries the meaning.
  The mobile menu button, which has no visible label, takes `aria-label="Menu"`.
- **The idea textarea has a real `<label for>`**, not a placeholder standing in for one — the
  placeholder is an example, and it disappears the moment somebody types.
- **Focus is always visible**: a 2 px `--el-accent-on-surface` outline at 2 px offset on every
  interactive element, including the import row (a link styled as a card) and the two links inside
  the error banner.
- **No state is carried by colour alone.** Submitting changes the button's LABEL as well as its
  glyph; the error banner carries an icon and a sentence as well as a red edge; the badge slots are
  dashed and captioned rather than merely tinted.
- **Reduced motion:** the only animation in the page is the submit spinner, and it is disabled under
  `prefers-reduced-motion: reduce`, leaving the static glyph and the changed label — which is why
  the label change is not optional.
- **Dark parity holds** — every row of the table above passes in both themes, and Panel 4 renders
  the dark theme so the claim is looked at rather than asserted.
- **Images:** the page draws no photography or logos of its own. The directory badges (MOTIR-1156)
  will each be an image and each owes real `alt` text naming the directory — recorded here because
  the slots are drawn here and the images are not.

---

## Which card owns each destination (connect, don't duplicate)

| Destination / element shown                      | Owner (design → build)                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| This layout, its three doors, its states         | **MOTIR-1143 (this asset) → MOTIR-1152 (build)**                         |
| The words on it                                  | MOTIR-1144 (8.3.4)                                                       |
| The pre-auth idea hand-off                       | MOTIR-1458 (`done`) → the entrance's carried panel, MOTIR-1462 (`done`)  |
| The `/onboarding` entrance the hero hands off to | MOTIR-1461 (design) / MOTIR-1462 (router)                                |
| The import wizard behind door 2                  | 7.15 / MOTIR-815, design MOTIR-930 · 7.17 / MOTIR-817                    |
| The no-AI first-run behind door 3                | MOTIR-655 (8.2) · the intent hand-off, MOTIR-3639                        |
| The brand mark and its lockup CSS                | MOTIR-1139 (design) / MOTIR-1150 (applied) / MOTIR-1456 (`@motir/brand`) |
| The tokens and primitives                        | MOTIR-1524 → `@motir/design-system@0.1.0`                                |
| The directory badges' content                    | MOTIR-1156 (8.3.9)                                                       |
| SEO entity signals, root OG, `robots`, sitemap   | MOTIR-1154 (8.3.7)                                                       |
| The repo, the domain, the Fly app, CI            | MOTIR-1455 (`done`)                                                      |

---

## Open findings this design surfaced (filed, not deferred)

| finding                                                                                                                                                                                                                                                  | card                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ~~`motir-marketing` is provisioned but **not connected to Motir**, so `targetRepo` is refused and a merge in this repository moves no card~~ — **CLOSED: 3743 `done`; pins and `link_pull_request` both work here, see below**                           | **MOTIR-3743** (pre-existing; this card is `relates_to` it) |
| ~~`?intent=import` has **no reader and no owning card**~~ — **CORRECTED 2026-08-28: it has an owner, MOTIR-3846**, carved from this finding; the twin's is MOTIR-3639. Still NOT READ on `origin/main` until 3846 ships                                  | **MOTIR-3746** → **MOTIR-3846**                             |
| ~~`--el-accent-on-surface` is **4.41:1 on `--el-surface-soft` in dark** (`ExploreTopBar`'s current-page nav item), and the ink lint has no accent arm~~ — **CLOSED: 3745 `done`, published as 0.1.1 by 3872, pinned here; 5.76:1 on the pinned version** | **MOTIR-3745** → **MOTIR-3872** → **MOTIR-3874**            |
| This repository runs **no design-result publish lane**, and a `<name>.design-notes.md` basename is invisible to the classifier in either repository                                                                                                      | **MOTIR-3750**                                              |

**⚠️ CORRECTED 2026-08-29 (MOTIR-3874) — MOTIR-3743 IS `done`, AND THE PARAGRAPH BELOW NOW READS
BACKWARDS FOR THE ONE RUNNER IT WAS WRITTEN FOR.** ~~Consequence of MOTIR-3743 for this repository,
worth stating where the next runner will read it: until `motir-marketing` is connected, no card in it
can carry a `targetRepo` pin, `link_pull_request` is refused, and the `Motir / work item link` check
never runs — so **a merge here closes nothing, and every card delivered in this repository has to be
transitioned by hand.** That is four cards in Story 8.3 today (MOTIR-1143, MOTIR-1144, MOTIR-1152,
MOTIR-1154).~~

**`motir-marketing` is connected. `targetRepo` pins are accepted and `link_pull_request` WORKS
here** — measured, not assumed: MOTIR-3872 pins `targetRepo: motir-marketing`, and its card carries a
delivery row for `moooon-B-V/motir-marketing#13` (`linkedManually: true`), which merged at
`10:33:36Z` and took the card to `done` at `10:33:38Z` — the status sync, two seconds later, with
nobody transitioning anything. **So a run in this repository MUST call `link_pull_request` after
`gh pr create`**, exactly as in motir-core; the stale paragraph above told it the opposite, and a
skipped link is the one omission nothing recovers from (the title/branch parse was retired by
MOTIR-3674). A card here still has to be transitioned by hand only if its pull request was never
linked.

---

## Notes for MOTIR-1152 (the build)

1. **Install, do not re-cut.** `@motir/design-system@0.1.0` (tokens, `Button`, `Card`, `Pill`,
   `SectionLabel`) and `@motir/brand` (the lockup + `.brand-*`). Replace
   `motir-marketing/app/globals.css` entirely — its own comment says _"Nothing here should be carried
   forward."_
2. **Replace `app/page.tsx`, do not grow it.** The scaffold says so in its first line.
3. **The 2000-character bound is a contract, not a nicety** — `maxlength` on the control and the
   counter in the footer row, both matching `MAX_PENDING_IDEA_LENGTH`.
4. **Draw all four idea-box states.** The failure state is the one that gets dropped, and it is the
   one a cross-origin POST guarantees you will meet.
5. **Ship doors 2 and 3 with their specified `?intent` parameters** and let them degrade — see the
   disposition above. Do not rewrite them to `?next=` on your own authority.
6. **Do not mark a nav item current in accent ink on the soft bar** (MOTIR-3745).
7. **`robots: disallow: /` stays** until MOTIR-1154 flips it. The landing shipping is not the same
   event as the landing being indexable.
8. **The output target is `output: 'standalone'` + the `Dockerfile`**, not a static export — the Fly
   host implies it (`docs/decisions/marketing-site-hosting.md`), and that constraint belongs to this
   card rather than to MOTIR-1455.
9. **Copy comes from MOTIR-1144**, not from this mock.

## Notes for MOTIR-1144 (the copy)

The layout fixes the shape of what the words have to do, and it is worth having in hand:

- **One `<h1>`, ~6 words**, serif, at 46 px — it wraps to two lines on mobile at ~30 px.
- **A lede of ~2 lines / 56 ch max**, which is where the three-pillar name lands in full.
- **A textarea placeholder that is a worked EXAMPLE**, long enough to show what a good first idea
  looks like — the entrance's is the register to match, and it ends by promising follow-up
  questions.
- **One hint line under the idea box**, ~1 line.
- **Door 2:** a title of ~6 words and a description of ~2 lines that names repositories _and_ Jira /
  Linear / Plane. This is the ONE place `repo` / code / GitHub language is allowed.
- **Door 3:** a single sentence, ~14 words, with `Start free` as the link inside it. It must read as
  an aside, not as a pitch.
- **Three pillar bodies of ~2 lines each**, headed exactly _AI planning_ · _Project management_ ·
  _Agent orchestration_.
- **One open-core paragraph**, ~2 lines, naming GPL-3.0.
- **Terminology:** _agents_, never _hosted coding agents_ — a person can run their own. And agents do
  **all kinds** of work (design, decisions, content, tests, code), so _"takes over the work"_, never
  _"coding agent"_. Outside the import row, no developer jargon at all: a non-technical founder must
  not meet the word _repo_ on the way in.

### ⚠️ Two BANNED words, and this asset shipped both before they were caught

Both are standing rules that predate this card, and both were violated in the first draft of this
mock. They are recorded here because MOTIR-1144 writes the final copy and MOTIR-1152 renders it, and
either can reintroduce them.

- **"tracker" — never customer-facing.** The two customer-facing product names are **Motir** (the
  project-management product) and **Motir AI** (planning + agents). Door 3 is
  _"Start free — project management only"_, and its hero line reads _"Just want project
  management?"_. **The word survives ONLY as a code identifier** — the `?intent=tracker` query
  parameter in the routing table below, the `scaled-tracker` org flag, the
  `tracker_monthly` / `tracker_annual` Stripe price keys. Never as a rendered label.
  ⚠️ **MOTIR-1143's own card body still calls door 3 _"Start free — just the tracker"_** — the card
  is wrong, not this asset; it is flagged for amendment.
- **"issue" — say "work item".** The open-core block originally read _"issues, boards, sprints"_ and
  now reads _"work items, boards, sprints"_.
- **And when copy describes importing, ENUMERATE the products** — _"work items from Jira, Linear or
  Plane"_ — never _"import your tracker"_ or _"a codebase or a tracker"_.

**The check is mechanical, so run it rather than reading for it:**

```
grep -niE 'tracker|\bissues?\b' design/marketing/*
```

Every surviving hit must be a code identifier (`?intent=tracker`) or prose about the rule itself. A
hit in rendered copy, in a mock's markup or in this file's own prose is a defect.

---

# motir.co/design — the public design showcase (`design-showcase.*`)

**Subtask:** MOTIR-3861 · 8.3.14 (`type: design`) · **Story:** MOTIR-656 (8.3 Marketing site + brand
mark) · **Epic 8 · Launch readiness.** **Repository: `motir-marketing`.**

The public page at **motir.co/design** where a visitor switches Motir's three design axes and
watches the whole site restyle. It is a **marketing / credibility surface**, not a token reference:
the argument it makes is _"the design system Motir gives you is the one Motir wears."_

**Asset files (three):** this section of `design-notes.md` (the AREA's note) ·
`design-showcase.mock.html` (the source of truth — standalone, re-stating the shipped `--el-*`
values so it paints without a Tailwind build, exactly as `landing.mock.html` does) ·
`design-showcase.png` (full-page Playwright chromium export, `deviceScaleFactor: 2`).

> **⚠️ The note is a SECTION of `design-notes.md`, not `design-showcase.design-notes.md`** — the
> convention this area already states above, ONE `design-notes.md` per AREA with the mock and the
> export sharing a per-surface basename.
>
> **⚠️ MOTIR-3861's criterion 1 justifies that basename by citing `classifyDesignPath` in
> `motir-core/scripts/upload-design-assets.mjs`. That file no longer exists** —
> `git ls-tree -r origin/main -- scripts/upload-design-assets.mjs` in motir-core returns empty; it
> was deleted by MOTIR-3797 on 2026-08-29 at 02:44, about forty minutes after this card was
> authored, as part of MOTIR-3780 retiring the CI publisher in favour of the agent calling
> `publish_design_result`. **The requirement is unchanged and the reason for it has changed**: the
> basename no longer decides whether a note publishes (the agent declares `kind: 'note_file'`
> explicitly), so what now enforces it is the area convention alone. The criterion was satisfied as
> written; only its citation is stale.

---

## How this asset was measured

**Nothing in this section was read off a file.** The surface this page composes into already ships,
and so does every control it draws, so this pass followed _design-against-shipped-reality_ by
rendering the real thing first and drawing to that:

1. **The real components were server-rendered.** `StylePicker`, `PalettePicker`, `TypePicker`,
   `ThemeSegmentedControl`, `AxisField`, `StyleVignette` and the primitives were imported from the
   INSTALLED `@motir/design-system` and put through `renderToStaticMarkup`, so the mock's markup is
   the package's own, class for class.
2. **The real CSS was compiled.** `app/globals.css` — the actual file, with its two `@import`s and
   two `@source` lines — was compiled with this repository's own `@tailwindcss/postcss`.
3. **Both were loaded in headless chromium**, and every token value in the mock's token block was
   read with `getComputedStyle(document.documentElement).getPropertyValue()` under each
   `data-theme`. The contrast figures below are computed from those resolved values.

**The measurement pipeline has a control**: on `@motir/design-system@0.1.0` — the version this asset
was drawn against — `--el-accent-on-surface` on `--el-surface-soft`, dark, `motir` returns
**4.41:1**, MOTIR-3745's own independently recorded number, to the digit. A second control: the light
`--el-tint-lavender` arm fails on exactly **four** palettes, which is MOTIR-3774's title. Numbers
here are trustworthy to the extent those two reproduce. **Both still reproduce on 0.1.0 — and both
are answers about a version this repository no longer installs**; the re-measurement against the
pinned 0.1.1 is the section directly below.

### ⚠️ Re-measured against the PINNED `@motir/design-system@0.1.1` (MOTIR-3874, 2026-08-29)

Everything above was measured against **0.1.0**. MOTIR-3872 published **0.1.1** and re-pinned this
repository to it, so every number this asset states about `--el-accent-on-surface` — and, for a
different reason, `--el-danger-on-surface` — was a measurement of a version the site no longer
serves. **They were re-taken, not re-reasoned.** This is the command, in full, so the numbers are
checkable rather than merely quoted:

```js
// measure-3874.mjs — run from a checkout that has @playwright/test:
//   node measure-3874.mjs "$(node -p "require.resolve('@motir/design-system/theme.css')")"
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'

const PAIRS = [
  [
    '--el-accent-on-surface',
    '--el-surface-soft',
    'nav current item / brand glyph',
  ],
  ['--el-accent-on-surface', '--el-surface', 'menu current item (panel 4)'],
  ['--el-accent-on-surface', '--el-page-bg', 'focus ring'],
  ['--el-accent-on-surface', '--el-tint-lavender', 'selected chip'],
  ['--el-danger-on-surface', '--el-danger-surface', 'error banner ink'],
]
const PALETTES = [
  null,
  'cobalt',
  'graphite',
  'evergreen',
  'spectrum',
  'amber',
  'sienna',
  'garnet',
  'citrine',
  'candy',
]

// ⚠️ color-mix() computes to `color(srgb <0-1> …)`. Reading those floats as
// 0-255 reports a FIXED theme as catastrophically broken (see the harness note).
const parse = (s) => {
  const rgb = s.match(/^rgba?\(([^)]+)\)/)
  if (rgb)
    return rgb[1]
      .split(/[,\s/]+/)
      .slice(0, 3)
      .map((n) => parseFloat(n) / 255)
  const srgb = s.match(/^color\(srgb ([^)]+)\)/)
  if (srgb)
    return srgb[1]
      .trim()
      .split(/[\s/]+/)
      .slice(0, 3)
      .map(parseFloat)
  throw new Error('unparsed colour: ' + s)
}
const lum = (c) => {
  const [r, g, b] = c.map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(parse(a)), lum(parse(b))].sort((p, q) => q - p)
  return +((x + 0.05) / (y + 0.05)).toFixed(2)
}

// Tailwind v4's `@theme` declares its custom properties on :root; a browser
// skips the unknown at-rule, so rename it. Nothing else is touched.
const css = readFileSync(process.argv[2], 'utf8').replace('@theme {', ':root {')
const tokens = [...new Set(PAIRS.flat().filter((t) => t.startsWith('--')))]
const file = new URL('./_measure-3874.html', import.meta.url)
writeFileSync(
  file,
  `<!doctype html><html><head><style>${css}</style></head><body>${tokens.map((t) => `<div data-t="${t}" style="color:var(${t})"></div>`).join('')}</body></html>`,
)

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto(file.href)
for (const theme of ['light', 'dark']) {
  for (const pal of PALETTES) {
    // Read the RESOLVED ink off a real element's `color` — never the var() chain.
    const v = await page.evaluate(
      ({ theme, pal }) => {
        const h = document.documentElement
        h.setAttribute('data-theme', theme)
        pal
          ? h.setAttribute('data-palette', pal)
          : h.removeAttribute('data-palette')
        return Object.fromEntries(
          [...document.querySelectorAll('[data-t]')].map((el) => [
            el.dataset.t,
            getComputedStyle(el).color,
          ]),
        )
      },
      { theme, pal },
    )
    for (const [ink, surf, label] of PAIRS) {
      const r = ratio(v[ink], v[surf])
      console.log(
        `${theme.padEnd(5)} ${(pal ?? 'motir').padEnd(9)} ${label.padEnd(30)} ${ink} on ${surf} = ${r}${r < 4.5 ? '  ✗ AA' : ''}`,
      )
    }
  }
}
await browser.close()
```

**What it returns on the two versions, `motir` palette** (the full run covers all ten):

| pair                                                    | 0.1.0     | 0.1.1 (pinned) |
| ------------------------------------------------------- | --------- | -------------- |
| `--el-accent-on-surface` → `--el-surface-soft`, dark    | 4.41 ✗ AA | **5.76** ✓     |
| `--el-accent-on-surface` → `--el-surface-soft`, light   | 6.29      | 6.29           |
| `--el-accent-on-surface` → `--el-surface`, dark         | 4.24 ✗ AA | **5.54** ✓     |
| `--el-accent-on-surface` → `--el-page-bg`, dark         | 4.67      | **6.11**       |
| `--el-accent-on-surface` → `--el-tint-lavender`, dark   | 3.59 ✗ AA | **4.70** ✓     |
| `--el-danger-on-surface` → `--el-danger-surface`, dark  | —         | **4.75** ✓     |
| `--el-danger-on-surface` → `--el-danger-surface`, light | —         | **5.77** ✓     |

**The ten-palette sweep, both arms, reproduces MOTIR-3872's own result exactly** — which is this
section's third control: `--el-accent-on-surface` on `--el-tint-lavender` goes **light 4/10 → 0/10**
(evergreen 4.19 → 4.72, amber 4.00 → 4.67, sienna 4.13 → 4.69, candy 4.29 → 4.73) and **dark 1/10 →
0/10** (`motir` 3.59 → 4.70); on `--el-surface-soft`, **dark 1/10 → 0/10** (`motir` 4.41 → 5.76) and
light was already 0/10.

**`--el-danger-on-surface` has an em dash, not a number, in the 0.1.0 column because the token did
not exist there** — `grep -c 'el-danger-on-surface' theme.css` returns **0** on 0.1.0 and names the
`color-mix(in srgb, var(--el-danger) 70%, var(--el-text))` declaration on 0.1.1. `landing.mock.html`
declared it anyway (copied from motir-core `main`, ahead of the publish), which is why the row
appeared in the table at all. A harness run against 0.1.0 answers **17.05 / 14.90** for it — the
contrast of an UNDEFINED custom property, i.e. of the initial ink against the surface. **That pair of
plausible, AA-passing numbers is what an unresolved token looks like from inside a green run**, and
it is the reason this section reports the absence rather than the measurement.

**And the mock's own copy of that token was wrong in DARK for a third reason, neither staleness nor
absence:** `--el-danger-on-surface` is a `color-mix()` over `var(--el-text)`, and `--el-*` are
substituted where they are **declared**, so the single `:root` declaration kept its LIGHT resolution
inside the `.dark` subtree. The fix is to restate the mix in the dark block — the same pairing the
package documents for `[data-theme='light']` + `data-appearance-scope`. **A self-contained mock
inherits that trap along with the values it copies.**

> **⚠️ A contrast harness must parse `color()`.** A first run of the palette sweep reported the
> current motir-core theme as 10/10 failing in dark. That was the harness: the fixed inks are
> `color-mix()`, which computes to `color(srgb 0.567 0.519 0.910)`, and the parser read those 0–1
> floats as 0–255. **A fixed theme and a catastrophically broken one are one parser bug apart**, so
> whoever writes MOTIR-1043's AA matrix should assert the harness against a known pair before
> trusting a red cell.

---

## Designed against shipped reality

| what                  | read from                                                                                      | how it is used here                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| The bar               | `app/_components/SiteHeader.tsx`, **rendered**, not summarised                                 | The mock's bar is that component's structure plus exactly ONE new `<a>`; nothing else in the bar moves                                 |
| The four controls     | `@motir/design-system` `dist/components/theme/AppearancePickers.js`, SSR-rendered + screenshot | The rail's chips, their selected treatment, the `role="radiogroup"` / `role="radio"` shape and the segmented control are the package's |
| The per-style preview | the package's `StyleVignette`, SSR-rendered                                                    | The Style previews row. It is a substantial mini-app preview, not a swatch — drawn as what it really is                                |
| The token grid        | the package's `TokensSpecimen`                                                                 | The `--el-*` grid. The real export is ~170 KB of markup; the mock draws a representative slice and NAMES the export the build mounts   |
| The tokens            | `@motir/design-system@0.1.1` `theme.css`, **as installed here** (0.1.0 until MOTIR-3874)       | Every colour and radius, light AND dark, restated at its resolved value                                                                |
| The axis membership   | the package's own `STYLE_IDS` / `PALETTE_IDS` / `TYPE_IDS` at runtime                          | **11 / 10 / 6** — counted from the modules, not from a card. Re-measured on the pinned 0.1.1 (MOTIR-3874): unchanged                   |

**⚠️ Read the INSTALLED package, never motir-core's `packages/design-system/`.** ~~The two have
diverged, and the divergence is a filed defect — see _Planning flags_.~~ **AMENDED 2026-08-29
(MOTIR-3872): they no longer diverge** — `@motir/design-system@0.1.1` is published, this repository
pins it, and its `theme.css` is byte-identical to motir-core `origin/main`. **The instruction is
unchanged and is not a consequence of the divergence:** read the INSTALLED package, because a
version that is published and a version that is merged are different things, and the next merge into
motir-core re-opens the gap with nothing to announce it. Restating motir-core's values here would
have drawn a site that does not exist.

---

## ACCESS PATH — how a visitor reaches this page

**This page is the site's first internal second route, and that is the fact that generates its one
new pattern.** Until now motir.co had exactly one page.

- **INBOUND:** the **`Design` entry in `SiteHeader`'s nav**, beside `Explore` and `Docs` — drawn in
  panels 1, 2, 3 and 4. It is the ONLY door; there is no in-product link to it and the landing does
  not otherwise change.
- It is also the site's first `next/link` to somewhere other than `/` (every other destination in
  the bar is a different ORIGIN and stays a plain `<a>`).
- **OUTBOUND:** nothing new. The page's own controls change attributes; they navigate nowhere.

---

## The nav entry, and the current-page treatment — RE-DECIDED 2026-08-29 (MOTIR-3874)

`SiteHeader.tsx` carries a load-bearing comment: _"motir.co is the root, so no nav item here is ever
the current page and there is nothing to mark … Do not reintroduce the pattern by marking an item
current."_ **It states TWO things, and this page has now ended both of them, one card apart.** The
premise — that no item is ever current — is what a second route ends. The prohibition — no
accent-coloured text — rested on MOTIR-3745: that ink measured **4.41:1** on the bar in dark, under
AA. **MOTIR-3872 published the fix as `@motir/design-system@0.1.1` and pinned this repository to it,
and the same probe on the same pair now returns 5.76:1.**

**So the treatment is the SHIPPED one**, byte for byte what `ExploreTopBar` renders for its
`aria-current` item — `text-[13.5px] font-semibold text-(--el-accent-on-surface)`:

| element             | token                                 | dark on `--el-surface-soft` | light  | bar        |
| ------------------- | ------------------------------------- | --------------------------- | ------ | ---------- |
| current item        | `--el-accent-on-surface` + `font-600` | **5.76:1**                  | 6.29:1 | AA 4.5:1 ✓ |
| the other items     | `--el-text-secondary`                 | 6.94:1                      | 6.51:1 | AA 4.5:1 ✓ |
| menu panel (narrow) | the same pair, on `--el-surface`      | **5.54:1**                  | 6.03:1 | AA 4.5:1 ✓ |

**Why the invented treatment goes rather than stays alongside.** ~~`--el-text` + `font-600` (16.44:1
dark) plus a 2 px `--el-accent` rule under it (3.63:1, WCAG 1.4.11's 3:1 for a graphical object)~~
was **not a taste call and never claimed to be** — it existed only because the accent ink failed AA,
and it said so in its own comment. Its premise is gone, and a pattern that outlives its reason is
just a pattern the app does not have: motir.co's public bar and app.motir.co's public bar would
differ, for a reason no reader could reconstruct. **`font-weight: 600` is retained and is the whole
of WCAG 1.4.1 here** — a non-colour channel carries the state, exactly as the shipped bar relies on.

**What this costs, stated rather than glossed:** the dark contrast drops from 16.44:1 to 5.76:1. That
is 1.28× AA rather than 3.7×, and it is the number the app itself ships at. **The margin was never
the goal — matching the product was**, and the asset's own governing rule is that the public chrome
is read from `ExploreTopBar` rather than invented beside it.

**⚠️ AND THE LESSON IS THE CARD'S, NOT THE COLOUR'S.** This asset did not merely show 0.1.0's ink; it
**reasoned from it**, and a rationale reads exactly the same after its number has flipped. The tell
was in the writing all along — _"a MEASUREMENT, not a taste call"_ names its own expiry condition. A
self-contained mock copies the token layer to buy independence, and a copy has no mechanism that
tells it the original moved; **publishing a package is precisely the event that moves the original.**

**It is drawn in BOTH places** the nav exists: the desktop bar and the `md:hidden` menu panel
(panel 4). The panel is easy to miss — it is rendered by a separate branch in the same component —
and a current-page treatment that exists only on desktop is a bug the build card would have to be
told about, so it is drawn rather than described.

**`aria-current="page"` carries it to assistive technology**, which is the half the visual treatment
cannot do.

---

## Surfaces / panels (inspect every panel)

- **Panel 1 — desktop, light (1440 × 900).** The arrival state: bar → axis rail → composed
  specimen → footer. Carries the measured fold line.
- **Panel 2 — desktop, dark (1440).** The same document under `data-theme="dark"`, with a
  non-default style selected so the **Reset to default** control is present.
- **Panel 3 — the nav entry**, both themes, with the contrast measured under each.
- **Panel 4 — narrow (390 × 844).** Two frames: the `md:hidden` menu panel carrying the current-page
  treatment, and the rail in its narrow form.
- **Panel 5 — the grammar.** Three deliberately distant cells.
- **Panel 6 — the states the page actually has.** Arrival · an axis mid-change · off-default.

---

## The axis rail

**Layout — a full-width band under the bar, on `--el-surface-soft`, four fields stacked.** It is
composed from the package's own `AxisField` (`border-b border-(--el-border-soft) py-4`), one per
axis, each holding an `AxisRadioGroup` of chips; the theme control and Reset sit on the rail's own
header row, right-aligned.

**Why a full-width band and not a sidebar:** measured, not preferred. The Style axis is **11** chips
of real words (`Swiss / Minimal-Flat`, `Hand-Drawn / Indie`) and Palette is **10** with a swatch
each. At 1440 the three groups occupy 2 + 2 + 1 wrapped rows; in a 280px sidebar the Style group
alone wraps to nine rows and the rail stops fitting any viewport.

**Scroll behaviour: the rail does NOT stick.** The page's argument is that the WHOLE document
restyles — bar and footer included — so pinning the controls over a scrolling specimen would keep
the one region a visitor most needs to see changing (the chrome) out of view. The rail is short
enough to return to, and the page is not long.

**Narrow (< `md`): each axis becomes ONE horizontally scrolling row** (`flex-nowrap` +
`overflow-x-auto`), rather than wrapping. This is forced by measurement: 11 style chips WRAP to six
rows at 390px, which is ~190px of rail for one axis and pushes the specimen off the fold. As one
scrolling row the axis is **31px** and all four fit. Measured in isolation at a true 390 viewport:
`document.scrollWidth === 390`, so the page itself never scrolls horizontally — only the chip rows do.

### The measured fold

Both taken by rendering the frame at the true viewport and reading `getBoundingClientRect()`
offsets from the frame's top edge.

| viewport       | bar    | axis rail    | page lede | first composed section | fold |
| -------------- | ------ | ------------ | --------- | ---------------------- | ---- |
| **1440 × 900** | 0 → 57 | 57 → **378** | 406 → 521 | 547 → **820**          | 900  |
| **390 × 844**  | 0 → 53 | 53 → **407** | 425 → 483 | 509 → **575**          | 844  |

**Above the fold in both: the whole rail AND a whole composed section**, which is the criterion.
At 1440 there is 80px of headroom; at 390, 269px.

---

## Decision — a visitor's choice PERSISTS across motir.co, and Reset discharges it

`ThemeProvider` writes `data-theme` / `-style` / `-palette` / `-type` onto `document.documentElement`
and persists each to `localStorage` under `motir.theme.*`; `themeInitScript` — already blocking in
this site's `<head>` — re-applies them on every motir.co page load. **So a visitor who picks
Neo-Brutalism here sees the LANDING in Neo-Brutalism afterwards.**

**DECIDED: keep it.** Reverting on navigation would contradict the page's own claim. The page says
_this is the system your product wears_; a demo that forgets the moment you leave it is a preview,
and the argument it makes is weaker than the one the persistence makes for free — the visitor
returns to the landing and finds their choice already applied to a page they had already seen.

**What discharges the surprise is the affordance, not a warning.** A **Reset to default** control
sits in the rail header and is **present whenever any of the four axes is off its default** (panels
2 and 6c); absent at arrival (panel 6a), because a reset with nothing to reset is noise. Defaults
are `warm-editorial` / `motir` / `motir` / `system`, from the package's own `THEME_DEFAULTS`.

---

## The matrix, honestly

**11 styles × 10 palettes × 6 pairings × 2 themes = 1,320 cells.** Not drawable, and drawing forty
of them would still not be a proof.

What panel 5 draws is the **grammar** — that the three axes are independent and each changes a
different property:

- **`neo-brutalism`** — a distant STYLE: 0px radii, heavy border, hard-offset shadow. Shape moves;
  colour does not.
- **`graphite`** — a distant PALETTE: colour moves; shape does not.
- **`mono-technical`** — a pairing that re-types the entire UI, headlines included.

Plus the default in **light** (panel 1) and **dark** (panel 2). **The remaining cells are generated
by the same three attributes and are asserted by MOTIR-1043's AA-matrix criterion, not by more
panels** — which is the right division: a machine can check 1,320 cells and a reader cannot.

---

## The states this page actually has

**It fetches nothing.** There is no loading state and no error state, and this asset says so rather
than leaving it unasked. `EmptyState` and `ErrorState` appear in the composed specimen as
_specimens of the primitives_, never as states of this page.

Three real states, drawn in panel 6: **arrival** (every axis default, no Reset) · **mid-change** (the
pressed chip, with selection and focus as separate signals — `aria-checked` and the focus ring) ·
**off-default** (Reset present). Plus the narrow rail (panel 4).

---

## Primitives composed — every element, and the export it maps to

Checked against `@motir/design-system`'s own barrel **as installed in this repository**
(`node_modules/@motir/design-system/dist/index.js`), never against motir-core's source.
**Re-measured on the pinned 0.1.1, 2026-08-29 (MOTIR-3874): 70 exports** — it was **68** on 0.1.0,
when this section was written. Command:
`node -e "import('@motir/design-system').then((m) => console.log(Object.keys(m).length))"`. Every
export the table below names is present on 0.1.1; the count is stated for both versions rather than
renumbered, because a count with no version beside it is a measurement of nothing.

| drawn element                    | export it maps to                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| the four rail fields             | `AxisField` (+ `AxisNote` for the per-axis line MOTIR-3862 writes)                                                                 |
| the Style / Palette / Type chips | `StylePicker` · `PalettePicker` · `TypePicker`, each over `AxisRadioGroup`                                                         |
| light / dark / system            | `ThemeSegmentedControl`                                                                                                            |
| Reset to default                 | `Button` (`variant="outline"`, `size="sm"`)                                                                                        |
| the attribute writer             | `ThemeProvider` + `useTheme`; `themeInitScript` already in `app/layout.tsx`                                                        |
| the axis membership + defaults   | `STYLE_IDS` · `PALETTE_IDS` · `TYPE_IDS` · `STYLE_REGISTRY` · `PALETTE_REGISTRY` · `TYPE_REGISTRY` · `THEME_DEFAULTS`              |
| per-style previews               | `StyleVignette`                                                                                                                    |
| the `--el-*` grid                | `TokensSpecimen`                                                                                                                   |
| specimen controls                | `Button` · `Card` · `Pill` · `Input` · `Textarea` · `FormField` · `Segmented` · `Switch` · `SectionLabel` · `Combobox` · `Spinner` |
| specimen overlays                | `Tooltip` · `Popover` · `Modal`                                                                                                    |
| the toast specimen               | **`ToastProvider` + `useToast`** — see below                                                                                       |
| class merging                    | `cn` · `buttonVariants`                                                                                                            |

**Three corrections to the card's own list, each verified against the barrel:**

1. **There is no `Toast` export.** The card names one; the package exports **`ToastProvider`** and
   the **`useToast`** hook (the component is internal). A build that writes `import { Toast }` fails.
2. **The registries are `STYLE_REGISTRY` / `PALETTE_REGISTRY` / `TYPE_REGISTRY`** (plus the
   `*_IDS` arrays), not `STYLES` / `PALETTES` / `TYPOGRAPHY` as the card's context refs say.
3. **`StylePicker` renders 11 chips, not 9** — see _Planning flags_.

**Named and deliberately NOT drawn:** `Sidebar`, `CommandPalette`, the charts and `IssueTypeIcon`
live only in motir-core and are unreachable here, exactly as the card says.

> **⚠️ For whoever builds this: `Tooltip`, `Popover` and `Modal` render nothing under SSR** — 45, 21
> and 0 bytes respectively, because each is state- or portal-driven. Their OPEN state in this mock is
> drawn from their source rather than captured from a render, and is the one place in this asset
> where the _render, don't read_ rule could not be followed. Verify those three in a browser.

---

## Planning flags

1. **✅ RESOLVED 2026-08-29 by MOTIR-3872 — kept as a record, because the paragraph below is what
   the mock's dark inks and its rejected-treatment note were drawn against.**
   `@motir/design-system@0.1.1` is published and this repository now pins it; the same sweep over the
   INSTALLED package returns **0/10 on both arms**, and the control on `--el-surface-soft` (dark,
   `motir`) moved **4.41 → 5.76**. The published `theme.css` is byte-identical to motir-core
   `origin/main`, so the divergence this section describes no longer exists.
   **✅ AND MOTIR-3874 CLOSED THE TWO THINGS THAT STILL PREDATED THE PUBLISH — 2026-08-29.** They
   were: the mocks inlining `--el-accent-on-surface: #7b6ce5` for dark (0.1.0's value), and the
   current-page nav treatment being justified by _"NEVER `--el-accent-on-surface` as TEXT here:
   4.41:1 in dark, under AA"_. **What was decided:**
   1. **Both mocks now carry `color(srgb 0.567059 0.519529 0.910039)`** — 0.1.1's lifted ink,
      measured off the installed package, not converted from a hex. Every `--el-*` either mock
      declares was checked against the installed 0.1.1 the same way: **0 mismatches** across
      `landing.mock.html` and `design-showcase.mock.html`, light and dark. Two further corrections
      fell out of that sweep and are recorded in _Re-measured against the PINNED …_ above:
      `--focus-ring-color` did **not** move and stays `#7b6ce5` (the two tokens were one colour on
      0.1.0 and are two now), and `landing.mock.html`'s `--el-danger-on-surface` is re-declared
      inside `.dark` because a `color-mix()` over `var(--el-text)` keeps its light resolution in a
      nested subtree.
   2. **The current-page treatment is now `--el-accent-on-surface` at `font-weight: 600`** — the
      pairing `ExploreTopBar` ships — replacing the `--el-text` + 2 px `--el-accent` rule the retired
      4.41 forced. 5.76:1 dark, 6.29:1 light; `font-weight` remains the non-colour channel for WCAG
      1.4.1. The reasoning, its cost, and what MOTIR-1043 must now do to `SiteHeader.tsx`'s comment
      are in _The nav entry_.
      **This flag is closed. Build to the asset as it stands.**

   ~~**⚠️ `motir.co` serves a design system that fails AA in five cells — filed as MOTIR-3872, and it
   BLOCKS MOTIR-1043.** `@motir/design-system@0.1.0`, which this repository pins, predates **both**
   accent-ink fixes (MOTIR-3745, MOTIR-3774). Measured over all 10 palettes: **light 4/10 fail**
   (evergreen 4.19, amber 4.00, sienna 4.13, candy 4.29) and **dark 1/10 fail** (`motir`, the
   DEFAULT palette, 3.59) for `--el-accent-on-surface` on `--el-tint-lavender` — which is the
   package's own SELECTED-CHIP treatment, i.e. the rail on this very page. The same sweep over
   motir-core `origin/main` returns **0/10 on both arms**: the fixes exist and were never published
   to npm. MOTIR-1043's criterion _"AA holds … for every style × palette pair … reported as a
   matrix"_ is **unsatisfiable until the package is republished and the pin bumped.**
   **The mock draws the selected chip as it really is**, low contrast included, rather than quietly
   repainting it — an asset that hides the defect would let the build card ship it.~~

2. **The style count is 9 in two cards and 11 in the package.** MOTIR-3861 says _"`StylePicker` (9
   styles)"_ and MOTIR-1043 says _"9 styles · 10 palettes · 6 type pairings — the same membership as
   motir-core `origin/main`"_. Measured from the installed module, `STYLE_IDS.length === 11`:
   `warm-editorial`, `soft-playful`, `swiss-minimal-flat`, `neo-brutalism`, `glassmorphism`,
   `cybercore-y2k`, `aurora`, `3d-immersive`, `neumorphism`, `hand-drawn-indie`, `retrofuturism`.
   Palette (10) and Type (6) are correct. **It is a layout input, not a trivium** — two extra chips
   are what make the Style axis wrap to a second row at 1440 and what forced the narrow-viewport
   scrolling row — so a rail drawn to "9" would have been wrong at both viewports.
3. **The `theme.css` block counts in MOTIR-1043 are wrong for every version.** It says 35
   `[data-palette]`, 109 `[data-style]`, 9 `[data-type]`. Measured on 0.1.0 (the version installed
   when this was written): **23 / 107 / 9**. **Re-measured on the pinned 0.1.1, 2026-08-29
   (MOTIR-3874): 23 / 112 / 9** — which is what motir-core `origin/main` returned then and returns
   now, the two having been byte-identical since the publish. Command, so the set is checkable rather
   than the number: `grep -o "\[data-palette=[^]]*\]" theme.css | wc -l`. Only `[data-type]` matches
   the card. Nothing in this asset depends on those numbers; the build card should not either.
4. **MOTIR-1043 also needs the three missing typefaces before its Type axis is honest** — its own
   body says so, and this asset assumes it: panel 5's `mono-technical` cell cannot render truthfully
   until IBM Plex Mono is loaded. Not a new finding, restated because this asset draws the cell.

---

## Out of scope — who owns what

- **The words are MOTIR-3862's.** Every string in the mock is placeholder at the specified register:
  never _tracker_, never _issue_ for a work item, the three pillars in full where positioning is
  stated. The nav LABEL (`Design` here) is that card's too — the mock's is a placeholder that
  happens to be the obvious one.
- **The build is MOTIR-1043's.** This card ships three files and no code: no route, no component,
  no font loader, no `sitemap.ts` line.
- **The landing is not redrawn.** The only change this asset specifies to an existing surface is the
  single nav entry and the current-page treatment it forces.
- **The package fix was MOTIR-3872's**, in motir-core and then this repository's pin — `done`
  2026-08-29. **Bringing THIS asset back onto the pinned version is MOTIR-3874's**, which is the
  card that re-measured the numbers above and re-decided the current-page treatment.

---

## Notes for MOTIR-1043 (the build)

- The bar gains **one** `<a>`, as a `next/link`, with `aria-current="page"` when active. **Rewrite
  the component's ⚠️ comment — do not merely delete it, and do not keep it.** ~~Its prohibition (no
  accent-coloured text) survives; only its premise (nothing is ever current) does not.~~ **AMENDED
  2026-08-29 (MOTIR-3874): BOTH halves are now retired** — the premise by this page, the prohibition
  by 0.1.1's ink (4.41:1 → 5.76:1). The replacement comment should record what the pin buys, so the
  next reader does not re-derive the old rule from the old number: the current item is
  `--el-accent-on-surface` at `font-weight: 600`, which is `ExploreTopBar`'s own pairing.
- **The current-page treatment changed after this asset's first export.** Build to _The nav entry_
  section and to `design-showcase.mock.html` as they stand now — weight + accent ink, no rule. A
  `--el-text` + 2 px `--el-accent` rule anywhere in a diff for this card is the retired treatment.
- The rail is four `AxisField`s; do not hand-roll the chips — `StylePicker` / `PalettePicker` /
  `TypePicker` already render them, keyboard behaviour included (arrow keys move within the
  radiogroup, and only the selected chip is in the tab order).
- **Reset** sets all four axes back to `THEME_DEFAULTS` and is conditional on any being off default.
- `app/sitemap.ts` gains its `/design` line in the same change — the file's own comment asks for it.
- **Before the AA matrix can pass, MOTIR-3872 must land.** Assert the contrast harness against a
  known pair first (see _How this asset was measured_).
