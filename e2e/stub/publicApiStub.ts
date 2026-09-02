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
}

function fixture(name: string): string {
  return readFileSync(join(FIXTURE_DIR, name), 'utf8')
}

function handle(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? '/', 'http://stub.invalid')
  const file = ROUTES[url.pathname]

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

const port = Number(process.env['MOTIR_PUBLIC_API_STUB_PORT'] ?? 4319)

createServer(handle).listen(port, '127.0.0.1', () => {
  // Playwright's `webServer` waits on this URL, so the line is also the
  // readiness signal a developer reads when the lane hangs.
  process.stdout.write(
    `public-api stub listening on http://127.0.0.1:${port}\n`,
  )
})
