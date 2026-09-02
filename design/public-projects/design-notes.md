# motir.co/p/\* — the project page, its five tabs and its two detail pages (`public-projects.*`)

**Subtask:** MOTIR-4113 · (`type: design`) · **Story:** MOTIR-3877 (Public project pages move to
motir.co) · **Epic MOTIR-3875 · Motir's public web presence.** **Repository: `motir-marketing`.**

`motir.co` is about to serve every public project page, and **nothing draws that surface on this
host.** `motir-core/design/public-projects/` draws it as it WAS — inside the application's chrome,
with an account menu and a sign-in modal that work because the page and the session share an origin.
`motir-core/design/public-site/` (MOTIR-3880) draws `motir.co`'s chrome and names `/explore`,
`/docs` and `/legal` among its nav states. **A chrome asset naming a surface is a DOOR, not the
room** — the reasoning `design/legal/design-notes.md` records for `/legal`. This asset is the room,
on the new host, with the affordances `public-surface-hosts.md` **AMENDMENT 4** decided.

**Asset files (three):** this `design-notes.md` (the AREA's note) · `public-projects.mock.html` (the
source of truth — standalone, re-stating the shipped `--el-*` values) · `public-projects.png`
(full-page Playwright chromium export, `deviceScaleFactor: 2`, re-exported with
`pnpm design:render --width 1440 design/public-projects/public-projects.mock.html`).

---

## The surface table

Nine screens. Each row names the route and the endpoint that feeds it — every one of those endpoints
is in `motir-core`'s published public contract, and four of them are MOTIR-3877's own work.

| #   | screen                                                  | route                                   | endpoint that feeds it                                                                                                       | panel |
| --- | ------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | **Overview** — hero, act rail, tab bar, authored README | `/p/<identifier>`                       | `GET /api/public/p/{identifier}` (`getPublicProject`, MOTIR-3945)                                                            | 1     |
| 2   | **Board**                                               | `/p/<identifier>/board`                 | `GET …/board` (`getPublicProjectBoard`, **MOTIR-4109 — new**)                                                                | 2     |
| 3   | **Items**                                               | `/p/<identifier>/items`                 | `GET …/items` (`listPublicProjectWorkItems`)                                                                                 | 3     |
| 4   | **Tree**                                                | `/p/<identifier>/tree`                  | `GET …/tree` (`getPublicProjectTreeLevel`)                                                                                   | 4     |
| 5   | **Roadmap**                                             | `/p/<identifier>/roadmap`               | `GET …/roadmap` — **both arms**: no parameters for the tab, `bucket`+`cursor` for a column page (**MOTIR-4109 extended it**) | 5     |
| 6   | **Changelog**                                           | `/p/<identifier>/changelog`             | `GET …/changelog`, and `…/changelog.xml` for the feed (**MOTIR-4111 — new**)                                                 | 6     |
| 7   | **Work-item detail**                                    | `/p/<identifier>/items/<key>`           | `GET …/items/{key}` (`getPublicProjectWorkItem`, **MOTIR-4110 — new**)                                                       | 7     |
| 8   | **Feature-request detail**                              | `/p/<identifier>/requests/<requestKey>` | `GET …/requests/{requestKey}` (`getPublicProjectRequest`, **MOTIR-4110 — new**)                                              | 8     |
| 9   | **Request intake**                                      | the submit form + its duplicate step    | `GET …/requests/duplicates` for the pre-check; the SUBMIT is a hand-off (below)                                              | 9     |

**The identifier `<key>` takes is the FULL work-item identifier** — `MOTIR-42`, not the bare number.
The segment is called `key` because that is the address the public URL has always used, and the
`key` FIELD in the response is the number; they are not the same thing. MOTIR-4110's routes pass the
segment through verbatim, and a renderer that rebuilds `${identifier}-${key}` breaks on a project key
containing a dash.

## Panels (inspect every one)

| panel   | what it shows                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------- |
| **1**   | `/p/MOTIR` Overview, anonymous, desktop 1280 — the default state, and what a shared link lands on |
| **2–6** | the five tabs, each with its own shape, its pager and its counts                                  |
| **7**   | one work item, with parent and children in the sidebar                                            |
| **8**   | one feature request: body, public thread, vote control                                            |
| **9**   | the intake, drawn as far as a visitor gets without an account                                     |
| **10**  | **EMPTY** — a public project with no public work items                                            |
| **11**  | **LOADING** — skeleton rows in the shape of the list                                              |
| **12**  | **ERROR** — the public API is unreachable                                                         |
| **13**  | the affordance table: AMENDMENT 4 §D row by row, and where each is drawn                          |
| **14**  | the HAND-OFF as three moments — the control, the destination, the return                          |
| **15**  | the ACCESS PATH — the doors in, and the one that deliberately is not one                          |
| **16**  | narrow (390 × 844)                                                                                |
| **17**  | dark theme                                                                                        |

## The act affordances — AMENDMENT 4 §D, per row

The amendment settles what happens to every session-aware affordance once the page is cross-origin
from the session. **Nothing here is invented and nothing is softened**; panel 13 is the table, with
the panel each row is drawn in. The three mechanisms:

- **ANONYMOUS-DIRECT** — works here, no account. The browser calls `app.motir.co` with CORS
  allow-listing this origin and **no** `Access-Control-Allow-Credentials`.
- **HAND-OFF** — the control is a **link** (drawn with the `↗` affix the chrome already uses for a
  door that leaves this host). It goes to `app.motir.co/act`, the act happens there under the
  application's own session and CSRF posture, and a **validated** `next` returns the visitor.
- **ABSENT** — the affordance does not appear here at all.

| row | affordance                    | mechanism                                                     | mirror it follows                                          |
| --- | ----------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | account menu / sign-in dialog | **ABSENT** — one plain `Sign in` link, identical for everyone | Notion: a published page's chrome is the publisher's       |
| 2   | follow                        | **HAND-OFF**                                                  | Canny's SSO redirect                                       |
| 3   | subscribe                     | **ANONYMOUS-DIRECT**                                          | Statuspage: subscribe from the page, no account            |
| 4   | roadmap vote · request upvote | **HAND-OFF**                                                  | Canny                                                      |
| 5   | request comment               | **HAND-OFF**                                                  | Canny                                                      |
| 6   | submit a feature request      | **HAND-OFF**                                                  | Canny                                                      |
| 7   | in-place overview editing     | **ABSENT**                                                    | Notion: you edit in Notion, the page is the output         |
| 8   | viewer-awareness on the reads | **ALWAYS ANONYMOUS**                                          | Statuspage / GitHub Pages: one page, the same for everyone |

### The mechanical reason, because it is not the one everybody names

§4 forbids widening the session cookie's `Domain`, and that is the famous constraint. It is not the
binding one. `lib/auth/index.ts` sets **`sameSite: 'lax'`**, so a `fetch` from `motir.co` with
`credentials: 'include'` sends no cookie at all. **The hand-off is not a preference — a direct
credentialed call does not work**, and making it work would mean `sameSite: 'none'`, a second
widening. AMENDMENT 4 §B carries this.

### ⚠️ Row 8 is drawn honestly, and panel 14 is where that is visible

`actorUserId` is structurally `null` for every read this host makes. So **the Follow button reads
`Follow` even after you have followed**, and every vote control reads its count without a voted
state. Panel 14's third moment draws exactly that, with the callout saying so. The temptation is to
draw the return with a satisfying `Following ✓`, which would be a picture of a page this
architecture cannot serve.

What it buys: every `/p/*` response is identical for every visitor, so the surface is cacheable at
the edge with no `Vary: Cookie` — which is most of what repays §8 cost 1's network hop.

### ⚠️ Row 6 is drawn against a CORRECTED premise

MOTIR-4113's own card, MOTIR-3877's body, and MOTIR-4108's affordance table all said the feature-
request intake was **already anonymous**. It is not, and never has been:
`POST /api/public/projects/{projectId}/requests` calls `requireCompliantSession()` and its own
comment says _"a LOGGED-OUT caller is rejected 401 (sign-in-to-act)"_; the duplicate pre-check
carries the same gate. Re-measured in AMENDMENT 4 §A and filed as **MOTIR-4166**.

So panel 9 draws the form as far as a visitor gets **without** an account — the title field, the real
duplicate-suggestion step, the body — and the submit is the hand-off. Drawing an anonymous submit
would have produced a screen that 401s every visitor who used it.

## The ERROR state is the one that earns its panel

`public-surface-hosts.md` §8 cost 1: _"a network hop replaces a Prisma read … the API can be slow, or
down, and the renderer is in a different application with a different deploy."_ This is the first
Motir surface where that is true, so **an unreachable API is a real state of this page, not a
degenerate one**, and panel 12 draws it specifically rather than generically:

- it **keeps the chrome** — the site is up; one tab's data source is not;
- it **names the other host**, because "something went wrong" on a page that looks fine is the least
  actionable message a visitor can be given;
- it offers **the changelog feed**, which is the one route on this surface that does not depend on
  the failing hop.

`motir-marketing/app/explore/` already ships this treatment for the same reason (`loadSquare`'s
`failed` arm), and this asset follows it rather than inventing a second one.

## The chrome

Composed from `motir-core/design/public-site/` (MOTIR-3880) **class for class**, exactly as
`design/legal/legal.mock.html` composes it — this asset draws only what sits between the header and
the footer.

**The `/p/*` state of the nav: NO ITEM IS CURRENT, in any panel.** `/p/*` is a tenant's page, not a
section of this site, so it takes no nav entry — panel 15 records that as a deliberate non-door. The
one chrome value this asset changes is the MEASURE: `.room.wide` (72rem) for a board, `.room.mid`
(58rem) for a detail page, added as variants rather than by editing `.room`.

## AA — the area rule, and what it caught here

`design/marketing/design-notes.md` § _"A design board's CHROME owes AA"_ (MOTIR-3985, adopting
motir-core's MOTIR-3054) is area-wide and this asset is held to it. **It went red on the first run,
on eleven sites**, all the same pair: `--el-text-muted` (`#787671`) on `--el-surface-soft` /
`--el-surface` — 4.34:1 and 4.17:1 against a 4.5:1 floor. That is MOTIR-3984's pair, swept once
already on this site's footer.

**Fixed at the INK, never at the surface and never with a new hue**: the board column counts, the
card keys and the epic-privacy note move to `--el-text-secondary` (`#5d5b54`). The card key takes one
ink everywhere rather than two that differ by which card they land on — a `.card` on `--el-page-bg`
clears the floor with muted and the `.hidden-epic` card on `--el-surface` does not, and an ink that
depends on its container is an ink somebody will get wrong.

**The asset is registered in `tests/design/inkContrast.test.ts`'s `ASSETS`.** That list is literal:
an asset not in it is not measured, so adding it is part of shipping it rather than a follow-up.

## The access path

Panel 15 draws it. Three doors lead in — `/explore`'s project squares (which link `/p/<identifier>`
**today**, in production), a shared link, and a changelog feed item pointing at an item detail — plus
the `app.motir.co/p/*` → `motir.co/p/*` 308 that MOTIR-3884 already shipped, path preserved,
including `changelog.xml`, which is in people's feed readers.

**The window this story closes:** `/explore` is live and every square on it links here, and both
hosts answer 404 today.

## ⚠️ Planning flags

- **The hand-off's DESTINATION screen (panel 14, moment 2) is `motir-core`'s, not this asset's.** It
  is drawn here only so the journey is legible in one place. `app/act/route.ts` (MOTIR-4114) ships
  the redirect; the application's sign-in screen already exists. **No card is owed** — nothing about
  that screen changes.
- **Row 7 (in-place overview editing) is ABSENT here and its door is an APPLICATION surface.**
  MOTIR-4114 shipped `PATCH /api/projects/{key}/public-overview`; **the application-side UI that
  calls it is not drawn by this asset and is not MOTIR-3877's** — this story re-hosts the public
  page, it does not build an authoring screen on `app.motir.co`. Filed as **MOTIR-4171**.
- **No other deferral.** Every screen this story ships is drawn, in every state the card names.

## Context refs

- `motir-core/docs/decisions/public-surface-hosts.md` — §2 (the host), §4 (the cookie), §8 (the
  costs), and **AMENDMENT 4** (the affordance table this asset draws)
- `motir-core/design/public-projects/` · `design/public-site/` — prior art, READ while drawing; not
  deliverables of this card
- `motir-marketing/design/legal/design-notes.md` — the precedent: a room inside this chrome
- `motir-marketing/design/marketing/design-notes.md` — the area-wide AA rule
- `motir-marketing/app/explore/` — the shipped unreachable-API treatment this asset follows
- MOTIR-4115 · MOTIR-4116 · MOTIR-4117 · MOTIR-4118 · MOTIR-4119 — the cards that build to this
