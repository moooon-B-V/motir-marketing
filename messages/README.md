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
- **No locale is wired yet.** Nothing in this repository reads these files today —
  `next-intl` (or a plain import) arrives with `MOTIR-1152`. That is deliberate:
  this card owns the words, that card owns the wiring.

## Where each namespace lands on the page

| namespace              | the block it fills                                                           |
| ---------------------- | ---------------------------------------------------------------------------- |
| `meta`                 | the root `<title>` and meta description for motir.co                         |
| `nav`                  | the top bar — Explore · Docs · Sign in · **Start free**                      |
| `landing.hero`         | door 1 (PRIMARY) — the idea box, its CTA, and its submitting / failed states |
| `landing.doors.import` | door 2 (SECONDARY) — "Import an existing project"                            |
| `landing.doors.free`   | door 3 (TERTIARY) — the non-AI, project-management-only entrance             |
| `landing.pillars`      | the three-pillar descriptive blocks                                          |
| `landing.openCore`     | the open-core line                                                           |
| `footer`               | the footer and its legal microcopy                                           |

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

## Deliberately not here

- **Social proof / directory badges** — fed by 8.3.9, which owns both the listings and
  their wording.
- **`robots` / `sitemap` / JSON-LD copy** — `MOTIR-1154` (8.3.7) owns the entity signal.
- **Anything `motir-core` renders.** The sign-in, onboarding and legal surfaces keep
  their own catalogue; this card touches no file in that repository.
