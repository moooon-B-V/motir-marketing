import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * THE PUBLIC-API STUB (MOTIR-4112) — a fixture server standing in for
 * `app.motir.co` while the browser lane runs.
 *
 * ── ⚠️ WHY THIS IS A SERVER AND NOT `page.route()` ────────────────────────
 *
 * The obvious way to stub an API in Playwright is to intercept the BROWSER's
 * requests. It does not work here, and the reason is structural rather than
 * incidental: every surface on this site reads the public API from a SERVER
 * COMPONENT. `lib/explore.ts` is the shipped example — `fetch(..., { next:
 * { revalidate: 0 } })`, executed by Next inside the Node process. Playwright's
 * `page.route()` sees requests the browser makes; it cannot see a request the
 * server made before the browser had a document. A lane built on `page.route()`
 * passes on any page that happens to fetch client-side and silently does nothing
 * on every page that does not — which is all of them, today.
 *
 * So the stub is a real HTTP server, and the app under test is pointed at it.
 *
 * ── ⚠️ AND POINTING THE APP AT IT IS A *BUILD*-TIME ACT ───────────────────
 *
 * `NEXT_PUBLIC_MOTIR_APP_ORIGIN` is a `NEXT_PUBLIC_*` variable, which Next
 * INLINES at build time — `lib/appOrigin.ts` says so at length and throws at
 * import when it is unset, precisely so that the mistake is caught by
 * `next build` rather than by a visitor. The consequence for this lane is easy
 * to get wrong: setting the variable when STARTING the server changes nothing,
 * because the literal is already in the bundle. `playwright.config.ts` therefore
 * BUILDS with it set, and its `webServer` command carries the build.
 *
 * ── ⚠️ THE FIXTURES ARE A FIXTURE, NOT A SECOND SOURCE OF TRUTH ───────────
 *
 * The shapes below are `motir-core`'s. That contract is guarded in the
 * PRODUCING repository — `motir-core/docs/decisions/public-surface-hosts.md` §3
 * and its `tests/api/public/contract-drift.test.ts` — because, as §3 puts it, "a
 * contract test that lives only in the consumer reports that motir-core broke
 * motir.co, after it has shipped". Nothing here asserts the contract; these
 * files only make the site renderable without a database. When a shape changes,
 * the guard that goes red is over there, and these files are updated to follow.
 */

const FIXTURE_DIR = join(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
  'fixtures',
)

/**
 * `GET` paths under `/api/public` → the fixture file that answers them.
 *
 * Keyed by PATHNAME only: a query string selects a page or a facet and every
 * fixture here is the first page, which is what a smoke lane needs. A spec that
 * needs a second page adds a fixture and a key rather than teaching this file to
 * parse parameters.
 */
const ROUTES: Record<string, string> = {
  '/api/public/explore': 'explore.json',
  '/api/public/categories': 'categories.json',
  '/api/public/p/MOTIR': 'project.json',
  '/api/public/p/MOTIR/board': 'board.json',
  '/api/public/p/MOTIR/items': 'items.json',
  '/api/public/p/MOTIR/tree': 'tree.json',
  '/api/public/p/MOTIR/roadmap': 'roadmap.json',
  '/api/public/p/MOTIR/changelog': 'changelog.json',
  '/api/public/p/MOTIR/items/MOTIR-4115': 'item-detail.json',
  '/api/public/p/MOTIR/requests/MOTIR-4051': 'request-detail.json',
  '/api/public/projects': 'projects-index.json',
  // The HOST CONTRACT (MOTIR-4220). `acme.localhost` is the lane's tenant host
  // — `e2e/stub/origin.ts` explains why no `/etc/hosts` edit is needed — and it
  // publishes `MOTIR`, the identifier every other fixture here is keyed by, so
  // a tenant-host walk exercises the SAME pages the `motir.co` specs walk.
  '/api/public/hosts/acme.localhost': 'host-workspace.json',
  // ⚠️ A SECOND PROJECT, WHOSE PRIMARY IS THE TENANT HOST (MOTIR-4222). It has
  // to be a different project from `MOTIR`: the primary is a property of the
  // PROJECT, so one fixture cannot be canonical on two hosts — and a tenant-host
  // spec walking a project whose primary is `motir.co` does not merely fail, it
  // sends the browser to PRODUCTION, which is the cross-repository coupling
  // `e2e/stub/origin.ts` exists to prevent. `MOTIR` stays canonical on the site
  // and `ACME` on `acme.localhost`, so both halves of the lane are self-hosted.
  '/api/public/p/ACME': 'project-acme.json',
  '/api/public/p/ACME/board': 'board-acme.json',
}

/**
 * Paths whose answer is NOT JSON. The changelog feed is the surface's only
 * non-JSON response, and a stub that served it as `application/json` would let
 * a content-type assertion pass on a route that had silently stopped
 * forwarding XML.
 */
const NON_JSON: Record<string, [string, string]> = {
  '/api/public/p/MOTIR/changelog.xml': [
    'changelog.atom',
    'application/atom+xml; charset=utf-8',
  ],
}

/**
 * Paths whose answer depends on a QUERY parameter — the second page of a list,
 * one expanded tree level, one paged roadmap column.
 *
 * ⚠️ THIS IS WHAT MAKES A PAGING SPEC MEAN ANYTHING. A stub that answered the
 * same fixture whatever the cursor would let a broken pager pass: the second
 * page would look exactly like the first, and "Load more" returning the same
 * rows is precisely the bug. Each entry is `[pathname, param, value, fixture]`
 * and is matched BEFORE the table above.
 */
const PARAMETERISED: Array<[string, string, string, string]> = [
  ['/api/public/p/MOTIR/items', 'cursor', 'wi_4', 'items-page2.json'],
  ['/api/public/p/MOTIR/tree', 'parentId', 'wi_1', 'tree-child.json'],
  ['/api/public/p/MOTIR/roadmap', 'bucket', 'submitted', 'roadmap-column.json'],
]

function fixture(name: string): string {
  return readFileSync(join(FIXTURE_DIR, name), 'utf8')
}

function handle(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? '/', 'http://stub.invalid')

  const parameterised = PARAMETERISED.find(
    ([path, param, value]) =>
      url.pathname === path && url.searchParams.get(param) === value,
  )

  // ⚠️ THE ROADMAP HAS TWO ARMS AND THE STUB HAS TO KEEP THEM APART. Falling
  // through to the whole-tab fixture for a request that carried `bucket` would
  // answer a `PublicRoadmap` where the caller asked for a `PublicRoadmapColumn`
  // — two different shapes on one path, 200, and the page renders undefined.
  // The real endpoint refuses instead: an unknown bucket is
  // `INVALID_ROADMAP_BUCKET` and a malformed cursor is `INVALID_ROADMAP_CURSOR`,
  // both 400. A stub that is more permissive than the thing it stands in for
  // lets a spec pass on a path production would refuse.
  if (
    parameterised === undefined &&
    url.pathname.endsWith('/roadmap') &&
    (url.searchParams.has('bucket') || url.searchParams.has('cursor'))
  ) {
    res.writeHead(400, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ code: 'INVALID_ROADMAP_CURSOR' }))
    return
  }

  const nonJson = NON_JSON[url.pathname]
  if (nonJson) {
    const [fixtureName, contentType] = nonJson
    res.writeHead(200, { 'content-type': contentType })
    res.end(fixture(fixtureName))
    return
  }

  const file = parameterised?.[3] ?? ROUTES[url.pathname]

  if (file === undefined) {
    // ⚠️ 404 WITH A `code`, which is the shape `motir-core` answers with — and
    // a LOUD one: the body names the path, so a spec that fails because the
    // stub has no fixture for a route says so instead of rendering an empty
    // state that looks like a product bug.
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ code: 'STUB_NO_FIXTURE', path: url.pathname }))
    return
  }

  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(fixture(file))
}

/** Every fixture this stub can serve — used by the lane's own self-check. */
export function fixtureFiles(): string[] {
  return readdirSync(FIXTURE_DIR).filter((name) => name.endsWith('.json'))
}

/*
 * ⚠️ THE LITERAL BELOW IS A HAND-RUN DEFAULT, NOT THE AUTHORITY.
 *
 * `e2e/stub/origin.ts` owns the port; `playwright.config.ts` passes it in as
 * `MOTIR_PUBLIC_API_STUB_PORT`, so under the lane this fallback is never
 * reached. It cannot simply IMPORT the constant: this file is launched by
 * `node --experimental-strip-types`, which is native ESM and needs an explicit
 * `./origin.ts` specifier — legal only with `allowImportingTsExtensions`, which
 * is not worth turning on repository-wide for one line.
 *
 * `standingRules.test.ts` asserts this literal still equals `STUB_PORT`, so the
 * two cannot drift apart in silence.
 */
const port = Number(process.env['MOTIR_PUBLIC_API_STUB_PORT'] ?? 4319)

createServer(handle).listen(port, '127.0.0.1', () => {
  // Playwright's `webServer` waits on this URL, so the line is also the
  // readiness signal a developer reads when the lane hangs.
  process.stdout.write(
    `public-api stub listening on http://127.0.0.1:${port}\n`,
  )
})
