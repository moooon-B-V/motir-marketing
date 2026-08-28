# motir.co landing — three entry doors, one idea box (`design/marketing/`)

**Subtask:** MOTIR-1143 · 8.3.3 (`type: design`) · **Story:** MOTIR-656 (8.3 Marketing site + brand
mark) · **Epic 8 · Launch readiness.** **Repository: `motir-marketing`.**

The public front door at **motir.co**, for **all three** of Motir's genuinely different first-time
visitors. It leads with ONE idea box, keeps _import an existing project_ as a first-class but
secondary row, and adds _Start free — just the tracker_ as a **tertiary** door: a nav entry plus a
single line under the hero.

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

## Mirror grounding — why door 3 is TERTIARY and not a third card

The hierarchy is the load-bearing decision on this page, and the evidence is rung 1, already
gathered and recorded in `motir-core/design/onboarding-entrance/design-notes.md` (2026-07-01) for the
same question one surface downstream. It applies unchanged here and is not re-derived:

- **Idea-first products lead with ONE prompt and demote every other path.** Lovable, Bolt, v0,
  Replit and Firebase Studio all open on a single "describe your app" box and treat "import an
  existing repo" as a secondary affordance; Firebase Studio separates a primary App Prototyping
  agent from a quieter import path.
- **Two co-equal cards is the pattern for SOURCE pickers, not idea entrances.** Vercel and Railway
  show _Import Git Repository_ beside _Deploy a Template_ — but both sides start from an existing
  artifact, and neither asks for a long idea.
- **PM tools put "start free" in the NAV.** Linear and Jira both do; it is the standing convention
  for the no-commitment door, and it is a nav item precisely because it is not the story the page is
  telling.

**Applied here:** Motir's front door is idea-first (Principle #1), so door 1 owns the fold. Door 2
stays a visible first-class row because it is a genuinely different journey for a genuinely
different person. Door 3 gets the two placements the convention gives it — **a nav entry and one
line beneath the hero** — because a third co-equal card would turn an idea entrance into a source
picker, and would tell a visitor that "just the tracker" is one of three equal things Motir is. It
is not: it is the way in for someone who does not want the AI, and it needs to be findable, not
promoted.

**What door 3 fixes.** MOTIR-655 (8.2, the non-AI team first-run) has existed for months and
**nothing anywhere routed into it from the public web**. The landing drew two doors for three
journeys, so a visitor who wanted the PM tool had to already know that the app's sign-up URL exists —
which is the one thing a marketing site exists to spare them.

---

## The three doors — the routing contract

Every door leaves motir.co for `app.motir.co`. **SHIPPED** means the receiving half exists on
motir-core's `origin/main` today; **NOT READ YET** means the parameter is specified here and nothing
in motir-core reads it (see the disposition below the table).

| #     | door                                         | who it is for                       | placement                                   | target                                                                                                                  | lands on                                                                                                                                 |
| ----- | -------------------------------------------- | ----------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Idea hero** (PRIMARY)                      | starting fresh, wants AI planning   | one full-width `Card` in the fold           | POST the idea to the pre-auth draft receiver (MOTIR-1458), then `https://app.motir.co/sign-in?draft=<id>` **· SHIPPED** | the `/onboarding` entrance pre-fills its **carried** panel (MOTIR-1462), which reads the `motir_pending_idea` cookie the receiver plants |
| **2** | **Import an existing project** (SECONDARY)   | already has a codebase or a tracker | a slim full-width row under an `OR` divider | `https://app.motir.co/sign-in?intent=import` **· NOT READ YET**                                                         | the `/onboarding` entrance's EXISTING branch → 7.15 (repo) / 7.17 (Jira · Linear · Plane)                                                |
| **3** | **Start free — just the tracker** (TERTIARY) | wants the PM tool, no AI planning   | a nav entry **and** one line under the hero | `https://app.motir.co/sign-up?intent=tracker` **· NOT READ YET**                                                        | the 8.2 team first-run (MOTIR-655)                                                                                                       |

**Verified on `origin/main`, 2026-08-28:**

- `app/(auth)/sign-in/page.tsx` reads `next` and `draft`, and renders for a signed-in reader **only**
  when `?draft=` is present — the comment on that file explains why (a Server Component cannot set
  the cookie, so bouncing first would drop the idea somebody typed here). Door 1's whole chain is
  real.
- **`?intent` is read nowhere.** `git grep -n "intent" origin/main -- 'app/(auth)' 'lib/onboarding'`
  returns one hit, the word _intentionally_ in a comment. `/sign-up` reads `next` alone and says so.

**Disposition — doors 2 and 3 are specified as the card specifies them, and the gap is FILED, not
absorbed.** The tracker parameter has an owner (**MOTIR-3639**, _8.2.10 Carry the tracker intent
across the auth round trip_); the import parameter has none, which is **MOTIR-3746**. Both doors
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
orchestration MOTIR-931) and by 7.17 for the external trackers. Door 1 draws an idea box, not the
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
- **Door 1 — the idea box.** A `Card` on an `--el-accent` border with `--shadow-elevated`. Mono
  uppercase field label, a 7-row textarea at `min-height: 172px` (room for a long first idea), a
  footer row divided by an `--el-border-soft` hairline carrying the counter on the left and the
  primary CTA on the right. A hint line below the card.
- **`OR` divider**, then **door 2** — the import row: an `--el-tint-sky` icon tile with `GitBranch`,
  a title, a two-line description naming repositories AND Jira / Linear / Plane, and an `Import →`
  affordance at the right.
- **Door 3's second half** — one centred line: _"Just want the tracker? **Start free** — boards,
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
| Idea box                        | `Card` + `textarea`, continuing the entrance                                | `--el-page-bg` on an `--el-accent` border + `--shadow-elevated`; `--radius-card`, transparent input fill                                                                                                            |
| Idea field label                | mono uppercase label                                                        | **`--el-text-muted`** — see the deliberate divergence below                                                                                                                                                         |
| Character counter               | mono inline label                                                           | `--el-text-muted`                                                                                                                                                                                                   |
| `OR` divider                    | hairline rule + mono label                                                  | `--el-border` rule, `--el-text-muted` label                                                                                                                                                                         |
| Import row (door 2)             | `Card` as a clickable option row                                            | `--el-page-bg` on `--el-border` (→ `--el-border-strong` on hover), `--shadow-subtle`, `--radius-card`; the affordance in `--el-accent-on-surface`                                                                   |
| Import icon tile                | tinted square                                                               | `--el-tint-sky`; ink `--el-text-strong`; `--radius-control`                                                                                                                                                         |
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
| brand glyph                               | `--el-accent-on-surface` → `--el-surface-soft`   | 6.29:1               | 4.41:1                | ≥3 ✓ (graphical) |
| door-3 text link                          | `--el-link` → page                               | 4.94:1               | 7.59:1                | ≥4.5 ✓           |
| idea field label, counter                 | `--el-text-muted` → `--el-page-bg`               | 4.54:1               | 6.67:1                | ≥4.5 ✓           |
| error banner ink                          | `--el-danger-on-surface` → `--el-danger-surface` | 5.75:1               | 4.77:1                | ≥4.5 ✓           |
| focus ring                                | `--el-accent-on-surface` → page                  | 6.57:1               | 4.67:1                | ≥3 ✓             |

### ⚠️ The measured constraint this design routes around

**`--el-accent-on-surface` as TEXT on `--el-surface-soft` is 4.41:1 in the dark theme — under AA.**
That is the exact pairing `ExploreTopBar` ships for its `aria-current` nav item at 13.5 px semibold,
which is not WCAG large text.

**So the landing's top bar paints no accent-coloured text at all.** It does not need to: motir.co is
the root, none of its nav items is ever the current page, and there is nothing to mark. The nav is
`--el-text-secondary` (6.94:1 dark) and the CTA is a filled `Button` (white on `--el-accent`,
4.99:1 dark). The brand glyph keeps `--el-accent-on-surface` and is fine there — it is a graphical
object at 3:1, not text.

**The motir-core defect is FILED, not absorbed: MOTIR-3745**, together with the reason nothing caught
it (`tests/theme/inkContrastLint.test.ts` has a faint arm, a muted arm and a danger arm, and no
accent arm — so this ink is unmeasured on every surface in every palette). **MOTIR-1152 must not
re-introduce the pattern** by marking a nav item current in accent ink on the soft bar.

### The rest of the a11y contract

- **Exactly one `<h1>`** per page — the hero headline. Heading order is `h1` → `h2` (the pillars'
  band heading, the footer's column headings) → `h3` (each pillar, the open-core row); no level is
  skipped and none is chosen for its size.
- **The brand lockup's accessible name comes from the visible wordmark**, and the glyph is
  `aria-hidden` — never both, per the brand notes §8. It is a lockup, so it is decorative + visible
  text, not an `aria-label`.
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
| The tracker first-run behind door 3              | MOTIR-655 (8.2) · the intent hand-off, MOTIR-3639                        |
| The brand mark and its lockup CSS                | MOTIR-1139 (design) / MOTIR-1150 (applied) / MOTIR-1456 (`@motir/brand`) |
| The tokens and primitives                        | MOTIR-1524 → `@motir/design-system@0.1.0`                                |
| The directory badges' content                    | MOTIR-1156 (8.3.9)                                                       |
| SEO entity signals, root OG, `robots`, sitemap   | MOTIR-1154 (8.3.7)                                                       |
| The repo, the domain, the Fly app, CI            | MOTIR-1455 (`done`)                                                      |

---

## Open findings this design surfaced (filed, not deferred)

| finding                                                                                                                                             | card                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `motir-marketing` is provisioned but **not connected to Motir**, so `targetRepo` is refused and a merge in this repository moves no card            | **MOTIR-3743** (pre-existing; this card is `relates_to` it) |
| `?intent=import` has **no reader and no owning card**, while its tracker twin got MOTIR-3639                                                        | **MOTIR-3746**                                              |
| `--el-accent-on-surface` is **4.41:1 on `--el-surface-soft` in dark** (`ExploreTopBar`'s current-page nav item), and the ink lint has no accent arm | **MOTIR-3745**                                              |
| This repository runs **no design-result publish lane**, and a `<name>.design-notes.md` basename is invisible to the classifier in either repository | **MOTIR-3750**                                              |

**Consequence of MOTIR-3743 for this repository, worth stating where the next runner will read it:**
until `motir-marketing` is connected, no card in it can carry a `targetRepo` pin, `link_pull_request`
is refused, and the `Motir / work item link` check never runs — so **a merge here closes nothing, and
every card delivered in this repository has to be transitioned by hand.** That is four cards in Story
8.3 today (MOTIR-1143, MOTIR-1144, MOTIR-1152, MOTIR-1154).

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
