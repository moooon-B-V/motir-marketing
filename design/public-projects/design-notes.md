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

| #   | screen                                                  | route                                                           | endpoint that feeds it                                                                                                       | panel |
| --- | ------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | **Overview** — hero, act rail, tab bar, authored README | `/p/<identifier>`                                               | `GET /api/public/p/{identifier}` (`getPublicProject`, MOTIR-3945)                                                            | 1     |
| 2   | **Board**                                               | `/p/<identifier>/board`                                         | `GET …/board` (`getPublicProjectBoard`, **MOTIR-4109 — new**)                                                                | 2     |
| 3   | **Items**                                               | `/p/<identifier>/items`                                         | `GET …/items` (`listPublicProjectWorkItems`)                                                                                 | 3     |
| 4   | **Tree**                                                | `/p/<identifier>/tree`                                          | `GET …/tree` (`getPublicProjectTreeLevel`)                                                                                   | 4     |
| 5   | **Roadmap**                                             | `/p/<identifier>/roadmap`                                       | `GET …/roadmap` — **both arms**: no parameters for the tab, `bucket`+`cursor` for a column page (**MOTIR-4109 extended it**) | 5     |
| 6   | **Changelog**                                           | `/p/<identifier>/changelog`                                     | `GET …/changelog`, and `…/changelog.xml` for the feed (**MOTIR-4111 — new**)                                                 | 6     |
| 7   | **Work-item detail**                                    | `/p/<identifier>/items/<key>`                                   | `GET …/items/{key}` (`getPublicProjectWorkItem`, **MOTIR-4110 — new**)                                                       | 7     |
| 8   | **Feature-request detail**                              | `/p/<identifier>/requests/<requestKey>`                         | `GET …/requests/{requestKey}` (`getPublicProjectRequest`, **MOTIR-4110 — new**)                                              | 8     |
| 9   | **Request intake**                                      | ⚠️ **a HAND-OFF, not a form** — corrected 2026-09-02, see below | none on this host; the whole intake, duplicate step included, is on `app.motir.co`                                           | 9     |

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
binding one. `motir-core/lib/auth/index.ts` sets **`sameSite: 'lax'`**, so a `fetch` from `motir.co` with
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

~~So panel 9 draws the form as far as a visitor gets **without** an account — the title field, the
real duplicate-suggestion step, the body — and the submit is the hand-off.~~

**⚠️ CORRECTED 2026-09-02, WHILE MOTIR-4117 WAS BUILT TO THIS ASSET — THE PANEL WAS HALF RIGHT AND
THE HALF IT GOT WRONG IS THE ONE IT DREW.** The submit is a hand-off, and so is everything before it:
`GET /api/public/projects/{projectId}/requests/duplicates` carries **the same
`requireCompliantSession()` gate as the submit** and 401s a logged-out caller. A visitor on this host
cannot run the duplicate check either.

So a partial form is not a reduced version of the right screen — it is a worse one. A visitor would
type a title, get no candidates (401), type a body, press submit, be sent to sign in, and lose the
draft. **Canny, the mirror row 6 follows, identifies the visitor FIRST for exactly this reason.**

**What ships instead, and what panel 9 should be read as specifying:** `/p/<id>/requests/new` is a
DOORWAY — it says what is about to happen, that requests are public, and that similar requests will
be offered for upvoting on the other side, then hands off with the return trip carried. No field a
visitor can fill in on this host. The route exists rather than being deleted because `/explore`, the
roadmap and the request detail all need somewhere to point, and a doorway that explains is better
than a bare cross-origin link nobody can preview.

**Why the asset said otherwise:** AMENDMENT 4 §A corrected _"submit a feature request … already
anonymous"_ and this note repeated the correction accurately for the SUBMIT — then drew the
duplicate step as though only the submit were gated. One endpoint was re-measured and its sibling was
not. Filed under the same planning bug, **MOTIR-4166**, whose takeaway is exactly this shape: a
re-measurement inherits the corrected claim's scope unless it restates the predicate.

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
  is drawn here only so the journey is legible in one place. `motir-core/app/act/route.ts` (MOTIR-4114) ships
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
- `motir-core/design/public-projects/` · `motir-core/design/public-site/` — prior art, READ while drawing; not
  deliverables of this card
- `motir-marketing/design/legal/design-notes.md` — the precedent: a room inside this chrome
- `motir-marketing/design/marketing/design-notes.md` — the area-wide AA rule
- `motir-marketing/app/explore/` — the shipped unreachable-API treatment this asset follows
- MOTIR-4115 · MOTIR-4116 · MOTIR-4117 · MOTIR-4118 · MOTIR-4119 — the cards that build to this

---

## MOTIR-6742 — the project page once the read tabs leave (`public-projects--watch-live.mock.html`)

**Subtask:** MOTIR-6742 (`type: design`) · **Story:** MOTIR-6171 (motir.co's public read pages move into
the app). **A delta:** `public-projects--watch-live.mock.html` holds only the panels that change. The
base mock above is a record of MOTIR-4113 and is not edited.

**What changed underneath it.** motir.co's Board, Items, Tree and Roadmap pages, and every work-item
page, answer a **permanent redirect (308)** to the same path in the app, where a signed-in, consented
Visitor reads the live project (MOTIR-6743; motir-core `public-surface-hosts.md` AMENDMENT 8). The
Roadmap tab was the public **feature-request board**, and it is **retired**, not moved
(motir-core `docs/decisions/public-request-board-retired.md`, MOTIR-6744). What stays on this host,
anonymous, is the project page, follow, subscribe, the changelog and its feed, the request doorway, and
each request's page with its upvote and comment hand-offs.

**How it was checked against shipped reality.** `/p/MOTIR`, `/p/MOTIR/requests/new` and
`/p/MOTIR/requests/MOTIR-4051` were rendered from the real build against the browser lane's stub on
this story's branch (after MOTIR-6743), and the delta composes the base mock's markup and classes
verbatim: `.topbar`, `.hero`, `.acts`, `.tabs`, `.btn.handoff`, `.crumb`, `.state`, `.foot`.

### Panels

| panel | draws                                                                               | amends                                                 |
| ----- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **A** | the Overview: the tab bar split, and the **Watch it being built** entry             | base 1                                                 |
| **B** | the request doorway: back to the project page; the closing line redrawn true        | base 9 (as shipped: the doorway, not the retired form) |
| **C** | one request: back to the project page; upvote and comment hand-offs unchanged       | base 8                                                 |
| **D** | the EMPTY overview, pointing at the app                                             | base 10                                                |
| **E** | ERROR: the overview read fails and the Watch entry still renders                    | base 12                                                |
| **F** | a TENANT HOST (`acme.motir.site/ACME`): site tabs host-relative, app links absolute | base 1 on a tenant                                     |
| **G** | narrow (390 × 844) and dark                                                         | base 16, 17                                            |

### The tab bar, split

**Overview** and **Changelog** stay tabs on this host and keep their current-page underline.
**Board, Items, Tree, Roadmap** follow a thin divider and a small **"In the app"** label, and each
carries the **↗ affix**, the same mark the act rail's hand-offs (Follow, Request a feature) already use
for a door that leaves this host (base panels 13–14). The affix was chosen over a lock or an "App" pill
because a visitor on this surface has already learned what ↗ means on this page, and nothing else is.
Each link's accessible name adds _"— opens in the Motir app; needs an account"_. They point at
`app.motir.co/p/<identifier>/<view>` on EVERY host.

**Roadmap now means the in-app roadmap canvas.** The demand-ordered request board it used to be is
retired, and its pending requests are the Visitor's **Requested features** view in the app. That view
gets **no link from motir.co** (the story's scope boundary): a reader reaches it inside the app.

### The Watch entry

**Placement:** between the act rail and the tab bar, full width. Next to the hero it would read as a
stat. Inside the act rail it would be one more button among Follow and Subscribe, with no room for the
sentence that is its whole point. Above the tab bar it is the last thing a reader passes before the
links it explains.

| part   | copy                                                                                                                                                       | token                         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| title  | Watch **{project}** being built                                                                                                                            | 14 px 600, `--el-text-strong` |
| what   | The live board, the plans as they are drafted and the agent runs as they happen — in the Motir app.                                                        | 13 px `--el-text-strong`      |
| cost   | You’ll need a Motir account. If you continue, your **name and email** will be visible to **this project’s workspace Managers**, along with when you visit. | 13 px `--el-text-strong`      |
| action | **Watch live ↗** → `app.motir.co/p/<identifier>/board`                                                                                                     | `.btn.primary.sm.handoff`     |
| strip  | `Eye` glyph in `--el-info` on `--el-tint-sky`, `--radius-card`                                                                                             | —                             |

**The sentence is checked against the consent screen it leads to.** motir-core `messages/en.json`
`visitor.consent.body` reads: _"If you continue, your <b>name and email</b> will be visible to <b>this
project’s workspace Managers</b>, along with when you visit."_ The cost line here repeats that clause
word for word, adding only _"You’ll need a Motir account."_ before it. The reader is told on motir.co
exactly what the consent screen then asks, and nothing it doesn't. It also agrees with
`settings.publicPage.visitorLink.subtitle` (_"after they sign in and agree to share their name and email
with this project’s Managers"_).

**Why the board.** It is the Visitor tree's default view, the one the consent screen returns to
(`VISITOR_DEFAULT_VIEW`), and the one view that shows a project moving at a glance. The in-app rail
then offers items, tree, roadmap, plans, approvals, runs and Requested features.

**Ink.** Every line of text on the tint is `--el-text-strong`, never `--el-text-muted` or
`--el-text-secondary`: the area AA rule above, applied before it could fail.

### The request doorway and the request page

- **The back-link** was _"← {Project} · Roadmap"_ to the board. It is now **"← {Project}"** to
  `/p/<identifier>`, on both pages.
- **The doorway's closing line**, _"Reading this project needs no account at all — the roadmap and every
  tab above are open to everyone"_, is false after this story. It is redrawn true: **"The project page,
  its changelog and every request’s own page are open to everyone, no account needed."** It is not
  dropped: a visitor about to be sent to sign in should still learn what they can read without it.
- **The hand-off's return** (`actHref`'s `return`) is the project page, `motir.co/p/<identifier>`,
  instead of the retired roadmap. This is a build note for MOTIR-6745; the mock's hrefs show it.
- The request page's **upvote** and **comment** hand-offs are unchanged, drawn as context.

### States

- **Empty overview (D):** _"This project has not written an overview yet"_, then _"Its live board, work
  items and roadmap are in the Motir app — watch it being built, above."_ The old body pointed at "the
  tabs above", which now leave the site.
- **Error (E):** when the overview read fails, the page renders the shipped `ErrorState` and **the Watch
  entry still renders below it**, titled _"Watch this project being built"_ because the name came from
  the failed read. It needs only the identifier, and it is the one way forward the visitor still has.
- **Tenant host (F):** Overview and Changelog are host-relative (`acme.motir.site/ACME`,
  `acme.motir.site/ACME/changelog`; the mock spells them absolute so the frame is unambiguous). The app
  links and the Watch entry are absolute on `app.motir.co`, never on the tenant host. A custom domain is
  the same at `roadmap.acme.com/` and `roadmap.acme.com/changelog`.
- **Narrow (G):** the Watch strip wraps, with glyph and text first and the button full width below. The
  tab bar scrolls sideways as it always has. **Dark (G):** the dark `--el-tint-sky` fill with
  `--el-text-strong` ink; nothing else changes.
- **No loading state:** the entry is static and reads nothing.

### SUPERSEDED in the base mock

The base is a record and is not edited. These of its panels no longer describe the product:

- **Panels 2–5** (Board, Items, Tree, Roadmap tabs) and **panel 7** (work-item detail): the paths
  redirect into the app (MOTIR-6743).
- **Panel 5's roadmap-card vote row** (AMENDMENT 4 row 4's _roadmap vote_ hand-off): retired with the
  request board. The request page's _upvote_ hand-off stands.
- **Panel 11** (LOADING, drawn over the Items tab): no read tab is left for it to load. The changelog
  keeps the grammar.

### The access path, updated (base panel 15)

The doors in are unchanged: `/explore`'s squares, a shared link, a changelog feed item, and the
`app.motir.co/p/<id>` → `motir.co/p/<id>` 308 for the bare path. **What changed is where the read doors
lead.** `motir.co/p/<id>/board | items | tree | roadmap | items/<KEY>` now 308 into the app, on every
host. Inside this site, the only doors into the app are the four tab links and the Watch entry, and
both say before the click that an account is needed.

### ⚠️ Planning flags

- **MOTIR-6745:** `PROJECT_TABS[].served` (MOTIR-6743) splits the bar, and `visitorViewUrl` builds each
  app link. The Watch entry reuses `visitorViewUrl(identifier, 'board')`. `actHref`'s return path and
  the two back-links move to the project page. The changelog's work-item links point at the app
  (`visitorViewUrl(identifier, 'items', KEY)`), because `/p/<id>/items/<KEY>` on this host is a redirect
  now. The meta description's _"free to read with no sign-up"_ is corrected.
- **Nothing else is owed.** The in-app consent screen and Visitor chrome are MOTIR-6641's, drawn and
  shipped.
