# `messages/` — the motir.co copy catalogue

Every word the marketing site renders lives here. `en.json` is the source of truth;
it is the artifact of **MOTIR-1144 (8.3.4)**, laid out by **MOTIR-1143 (8.3.3)** and
wired into the page by **MOTIR-1152 (8.3.6)**.

## The arrangement, and why it is this one

`MOTIR-1455`'s scaffold established the repository, the image, the pipeline and the
domain — and **no catalogue at all**. This card establishes one, and it mirrors
`motir-core`'s shipped arrangement rather than inventing a second convention:
a `messages/<locale>.json` per locale, nested namespaces, one namespace per surface.
The two sites are one product and a reader moves between them mid-journey; a shared
shape is what lets copy be swept across both in one pass.

- **`en.json` is the baseline and stays byte-identical when locales are added.**
  A later locale is a sibling file with the exact same key set — never an edit to the
  English values to make them easier to translate.
- **Keys are stable; values are not.** `MOTIR-1152` renders from these keys, so
  rewording is free and re-keying is a code change.
- **WIRED by `MOTIR-1152`, as a PLAIN TYPED IMPORT — not `next-intl`.**
  `lib/copy.ts` imports `en.json` directly and re-exports it, plus a two-line
  `format()` for the two strings carrying `{placeholders}`. motir-core needs
  `next-intl` for something this site does not have — a locale segment, a
  request-scoped locale, and server/client boundaries around
  `getTranslations`. motir.co ships ONE locale and one page, so a static import
  buys full type inference over the key set for free and adds no runtime, while
  leaving the ARRANGEMENT (`messages/<locale>.json`, one namespace per surface)
  exactly as a second locale would need it. Adding `next-intl` later is then a
  wiring change against an unchanged catalogue.

## Where each namespace lands on the page

| namespace              | the block it fills                                                              |
| ---------------------- | ------------------------------------------------------------------------------- |
| `meta`                 | the root `<title>` and meta description for motir.co                            |
| `nav`                  | the top bar — Explore · Docs · Sign in · **Start free**                         |
| `landing.hero`         | door 1 — the idea box, its CTA, its counter, and its submitting / failed states |
| `landing.doors.new`    | door 1's HEAD — the tinted tile's heading and its one line                      |
| `landing.doors.import` | door 2 — "I have an existing project", and its three source rows                |
| `landing.doors.hint`   | the one line under both doors                                                   |
| `landing.doors.free`   | door 3 (TERTIARY) — the non-AI, project-management-only entrance                |
| `landing.proof`        | the directory-badge band's caption and its four slot labels                     |
| `landing.pillars`      | the three-pillar descriptive blocks                                             |
| `landing.openCore`     | the open-core line                                                              |
| `footer`               | the footer and its legal microcopy                                              |

> **⚠️ `landing.doors` GAINED KEYS AND `free` CHANGED SHAPE — `MOTIR-1152`, on
> the record.** This card renders the layout `MOTIR-1143` draws, and that asset
> composes elements the first catalogue had no strings for: door 1's own head,
> door 2's three source rows and their label, the character counter's format,
> the menu button's label, and the badge band's caption and slots. Those were
> ADDED here, in the register this file pins, rather than hardcoded in JSX.
>
> Two edits are not additions and are worth naming:
>
> - **`landing.doors.or` was REMOVED.** Yue's 2026-08-28 revision made doors 1
>   and 2 CO-EQUAL and deleted the `OR` divider — "a divider is precisely what
>   makes one side an alternative to the other". A stranded `or` string is how
>   a later edit puts it back, so `tests/copy.test.ts` asserts the key is gone.
> - **`landing.doors.free` is now `{ lead, cta, tail }`**, not
>   `{ title, description, cta }`. Door 3 is ONE SENTENCE with `Start free` as
>   a link inside it — an aside, not a pitch — and a card-shaped
>   title/description pair cannot compose into one. The words are Yue's own,
>   from the 2026-08-28 comment on `MOTIR-1152`: _"Just want project
>   management? **Start free** — boards, sprints and a backlog, with no AI in
>   the way."_
>
> The doors are described here as door 1 / door 2 / door 3 rather than
> PRIMARY / SECONDARY / TERTIARY for the same reason: 1 and 2 are co-equal.

The three doors are three different first-time visitors, and the copy addresses each
one by name: someone with an idea and no code, someone who already has a codebase or
work items elsewhere, and someone who wants the project-management tool without the AI.
`MOTIR-1143` owns where they sit; this file owns what they say.

## Rules a future edit must not break

1. **The tagline is the three pillars, intact:** _"the AI planning, project-management
   and agent orchestration platform."_ Dropping agent orchestration describes a
   different, smaller product. It appears whole in `landing.hero.lede`,
   `footer.tagline` and `meta.description`.
2. **Agents take over _the work_** — design, decisions, content, tests and code.
   Never "coding agent" in customer-facing copy, and never scoped to Motir-hosted
   agents: a visitor may run their own.
3. **"work item", never "issue".**
4. **There are exactly two customer-facing product names: "Motir" and "Motir AI".**
   The project-management half gets no nickname of its own — call it "Motir", or
   "the project-management tool". A seat of it is a "Motir seat".
5. **No developer jargon on the idea path.** `landing.hero.*` and
   `landing.doors.free.*` are read by people who do not know what a repository is.
   Repository / code / Jira / Linear / Plane language belongs only in
   `landing.doors.import.*`, whose audience self-selects as technical.
6. **Open core is positioning, not a footnote** — say that the project-management
   core is open source, and say it above the fold of the footer.

## Continuity with the app

The hero hands off across origins to `motir-core`'s `/onboarding` entrance, so the two
surfaces must not read as two products. `landing.hero.eyebrow` ("Build with AI"),
`ideaLabel` ("Your idea") and `cta` ("Start planning") are the entrance's own strings
(`motir-core` `messages/en.json` → `onboarding.entrance.*`), carried deliberately.

⚠️ **One seam is not yet aligned, and it is a copy decision somebody owns.** The
shipped entrance labels its second path **"I have an existing project — migrate it"**
with the CTA **"Migrate"**; door 2 here says **"Import an existing project"** / **"Import"**,
which is what `MOTIR-1143` and `MOTIR-1144` both specify. A visitor crossing that seam
meets two verbs for one journey. Settle it on the two cards, not by editing one side.

## Open dependency — 8.6 positioning is NOT final

**`MOTIR-1105` (8.6.1 — Decide positioning + ICP statement) is `todo` as of 2026-08-28.**
8.6 owns the canonical positioning and ICP statement for the idea-first audience, so
this copy is drafted to the standing three-pillar framing (Yue, 2026-07-07) and not to
a settled 8.6 artifact. **When `MOTIR-1105` lands, re-read `landing.hero.lede`,
`landing.pillars.*` and `meta.*` against it** — those are the strings an ICP decision
moves.

## Guarded by a test, not by a habit

`tests/copy.test.ts` asserts the rules above mechanically rather than leaving
them to a reader: no rendered "tracker" or "issue" anywhere in the catalogue,
no "coding agent", the three-pillar tagline intact in all three of its homes,
the pillar titles exact, no developer jargon in `landing.hero.*` /
`landing.doors.free.*` / `landing.doors.new.*`, and the key SHAPE the page
reads. Rule 1 and rule 3 above are one `pnpm test` away from a red check.

## Deliberately not here

- **Social proof / directory badges** — fed by 8.3.9, which owns both the listings and
  their wording.
- **`robots` / `sitemap` / JSON-LD copy** — `MOTIR-1154` (8.3.7) owns the entity signal.
- **Anything `motir-core` renders.** The sign-in, onboarding and legal surfaces keep
  their own catalogue; this card touches no file in that repository.
