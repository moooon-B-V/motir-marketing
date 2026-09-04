import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { HostRead } from '@/lib/hostResolution'

/*
 * THE ROUTER ITSELF (MOTIR-4220) — `proxy.ts`, over a stubbed contract.
 *
 * `tests/host/hostResolution.test.ts` covers the DECISION, which is pure. This
 * file covers the three things only the proxy can be asked: which host it reads,
 * what it does before it reads anything at all, and what a `NextResponse`
 * actually carries.
 *
 * ⚠️ THE ASSERTIONS NAME NEXT'S INTERNAL HEADERS, and that is unavoidable
 * rather than sloppy. A middleware response is not a document — a rewrite is
 * `x-middleware-rewrite`, a forwarded request header is
 * `x-middleware-request-<name>`, and a pass-through is `x-middleware-next`.
 * Read off `next@16.2.6` and pinned here so a version bump that changed them
 * turns THIS red rather than turning the router silently inert. The behavioural
 * half is `e2e/specs/tenant-host.spec.ts`, which walks a real tenant host.
 */

const resolveHost = vi.fn<(host: string) => Promise<HostRead>>()

// ⚠️ THE BASE DOMAIN IS STUBBED, because the default outside production is
// `localhost` — which the router already steps aside for as a LOCAL host, so
// the base-domain branch would be unreachable here and the test that covers it
// would be passing on the branch above. `motir.site` is the production value.
vi.mock('@/lib/tenantDomain', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/tenantDomain')>()),
  TENANT_DOMAIN: 'motir.site',
}))

vi.mock('@/lib/hostResolution', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/hostResolution')>()),
  resolveHost,
}))

const { proxy } = await import('@/proxy')
const { NextRequest } = await import('next/server')
type NextRequestType = InstanceType<typeof NextRequest>

const WORKSPACE: HostRead = {
  status: 'ok',
  data: {
    kind: 'workspace',
    workspace: { name: 'Acme' },
    projects: [{ identifier: 'PROD', name: 'Prod' }],
  },
}
const CUSTOM: HostRead = {
  status: 'ok',
  data: {
    kind: 'project',
    project: { identifier: 'PROD', name: 'Prod' },
    primary: true,
  },
}
const ALIAS: HostRead = {
  status: 'ok',
  data: { kind: 'alias', redirectTo: 'acme.localhost' },
}

function request(
  url: string,
  headers: Record<string, string> = {},
): NextRequestType {
  const host = new URL(url).host
  return new NextRequest(url, { headers: { host, ...headers } })
}

const rewriteOf = (res: Response) =>
  res.headers.get('x-middleware-rewrite')
    ? new URL(res.headers.get('x-middleware-rewrite')!).pathname
    : null

const forwarded = (res: Response, name: string) =>
  res.headers.get(`x-middleware-request-${name}`)

beforeEach(() => resolveHost.mockReset())

describe('the site’s own host', () => {
  it('is untouched, and NEVER calls the contract', async () => {
    // The landing, /explore, /docs and /legal would otherwise pay a round trip
    // to app.motir.co on every request, to be told they are not a tenant — on
    // the host whose whole job is to be fast and crawlable. Asserted with the
    // spy rather than trusted to the branch staying first.
    for (const url of [
      'https://motir.co/',
      'https://motir.co/explore',
      'http://localhost:4318/docs',
      'http://127.0.0.1:4318/p/MOTIR/board',
    ]) {
      const res = await proxy(request(url))
      expect(res.headers.get('x-middleware-next'), url).toBe('1')
    }
    expect(resolveHost).not.toHaveBeenCalled()
  })

  it('reads the FORWARDED host, which is what Fly sets', async () => {
    // Fly terminates TLS and proxies to the machine, so `Host` is the internal
    // address. Reading it first would make every tenant request look like the
    // same internal host — and the site branch above would swallow all of them.
    resolveHost.mockResolvedValue(WORKSPACE)
    const res = await proxy(
      request('https://motir.co/PROD/board', {
        'x-forwarded-host': 'ACME.motir.site',
      }),
    )
    expect(resolveHost).toHaveBeenCalledWith('acme.motir.site')
    expect(rewriteOf(res)).toBe('/p/PROD/board')
  })
})

describe('the base domain itself', () => {
  it('is not a tenant address, and is answered without a hop', async () => {
    // It has no row, so the contract would 404 it anyway — but answering here
    // means the answer does not depend on the ABSENCE of a row somebody could
    // create. `motir-core`'s own `resolveHost` refuses it for the same reason.
    const res = await proxy(request('https://motir.site/'))
    expect(resolveHost).not.toHaveBeenCalled()
    expect(rewriteOf(res)).toBe('/_host-unknown')
  })
})

/*
 * ⚠️ THE THREE BRANCHES THAT HOLD NO RESOLUTION (MOTIR-4430).
 *
 * They are asserted TOGETHER because the thing they share is the whole content
 * of the fourth `PublicAddressKind`: none of them can say WHICH tenant this is,
 * and all three know the one fact every link depends on — the visitor is not on
 * `motir.co`. Before this card each took a `rewriteTo` helper that forwarded
 * nothing, so the two landing pads were the only surfaces in the app told they
 * were on the site when they were not.
 *
 * ⚠️ AND THE KIND IS ASSERTED, NOT ONLY THE HOST. A test that checked
 * `x-motir-public-host` alone would pass on a router that forwarded the host
 * under `site`, which is exactly the answer the chrome must not be given:
 * `siteLinkFor` branches on the KIND.
 */
describe('a host with NO resolution is `unresolved`, not silent', () => {
  const UNRESOLVED = [
    [
      'the base domain itself',
      'https://motir.site/',
      'motir.site',
      '/_host-unknown',
      null,
    ],
    [
      'a host the contract does not know',
      'https://nope.example/',
      'nope.example',
      '/_host-unknown',
      { status: 'not-found' } as HostRead,
    ],
    [
      'a host the contract did not answer for',
      'https://roadmap.acme.com/board',
      'roadmap.acme.com',
      '/host-unavailable',
      { status: 'failed' } as HostRead,
    ],
  ] as const

  for (const [label, url, host, path, read] of UNRESOLVED) {
    it(`${label} — forwards ${host} as \`unresolved\` onto ${path}`, async () => {
      if (read) resolveHost.mockResolvedValue(read)
      const res = await proxy(request(url))

      expect(rewriteOf(res)).toBe(path)
      expect(forwarded(res, 'x-motir-address-kind')).toBe('unresolved')
      expect(forwarded(res, 'x-motir-public-host')).toBe(host)
      expect(forwarded(res, 'x-motir-public-origin')).toBe(`https://${host}`)
    })
  }

  it('OVERWRITES a client-supplied kind here too', async () => {
    // The same rule the resolved branches keep: a caller cannot talk the 404
    // room into spelling another host's links by sending its own header.
    resolveHost.mockResolvedValue({ status: 'not-found' })
    const res = await proxy(
      request('https://nope.example/', {
        'x-motir-address-kind': 'site',
        'x-motir-public-host': 'evil.example',
      }),
    )
    expect(forwarded(res, 'x-motir-address-kind')).toBe('unresolved')
    expect(forwarded(res, 'x-motir-public-host')).toBe('nope.example')
  })
})

describe('a workspace subdomain', () => {
  beforeEach(() => resolveHost.mockResolvedValue(WORKSPACE))

  it('rewrites a project path onto the shipped tree, carrying host and kind', async () => {
    const res = await proxy(request('https://acme.motir.site/PROD/board'))

    expect(rewriteOf(res)).toBe('/p/PROD/board')
    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
    expect(forwarded(res, 'x-motir-public-host')).toBe('acme.motir.site')
    // Scheme AND port, from what the proxy in front of us said — the crawl
    // surface builds absolute URLs from it (MOTIR-4222).
    expect(forwarded(res, 'x-motir-public-origin')).toBe(
      'https://acme.motir.site',
    )
  })

  it('carries the FORWARDED scheme and port, not the socket’s', async () => {
    // Fly terminates TLS, so the request reaching the machine is http on an
    // internal port. A robots.txt built from that would advertise an address
    // no visitor can reach.
    resolveHost.mockResolvedValue(WORKSPACE)
    const res = await proxy(
      request('http://internal.fly.dev:8080/PROD', {
        'x-forwarded-host': 'acme.motir.site',
        'x-forwarded-proto': 'https',
      }),
    )
    expect(forwarded(res, 'x-motir-public-origin')).toBe(
      'https://acme.motir.site',
    )
  })

  it('serves the workspace’s project list at the root', async () => {
    const res = await proxy(request('https://acme.motir.site/'))
    expect(rewriteOf(res)).toBe('/w')
    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
  })

  it('OVERWRITES a client-supplied kind rather than honouring it', async () => {
    const res = await proxy(
      request('https://acme.motir.site/PROD', {
        'x-motir-address-kind': 'project',
        'x-motir-public-host': 'evil.example',
      }),
    )
    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
    expect(forwarded(res, 'x-motir-public-host')).toBe('acme.motir.site')
  })

  it('404s a path that is not one of this workspace’s projects', async () => {
    const res = await proxy(request('https://acme.motir.site/OTHER'))
    expect(rewriteOf(res)).toBe('/_host-unknown')
  })

  it('CARRIES the host into the 404 room, because it HOLDS the resolution', async () => {
    /*
     * MOTIR-4430, and the branch its reproduction takes:
     * `hey.motir.site/explore` is a workspace address serving a path that is
     * not one of its projects. The host is known and only the PATH is not, so
     * the room is told the real kind rather than `unresolved` — and it is told
     * anything at all, which is the defect. Until this card the branch went
     * through a header-less `rewriteTo`, so the room rendered `motir.co`'s
     * chrome and offered a lost visitor six doors that 404 where they stand.
     */
    const res = await proxy(request('https://acme.motir.site/OTHER'))

    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
    expect(forwarded(res, 'x-motir-public-host')).toBe('acme.motir.site')
    expect(forwarded(res, 'x-motir-public-origin')).toBe(
      'https://acme.motir.site',
    )
  })
})

describe('the router’s own rewrite, coming back around', () => {
  it('is forwarded WITH the headers rather than routed again', async () => {
    // Next re-enters the proxy with the rewritten path. The headers are set
    // again rather than assumed to have survived, so the page reads them
    // whichever pass produced the request it renders.
    resolveHost.mockResolvedValue(WORKSPACE)
    const res = await proxy(request('https://acme.motir.site/p/PROD/board'))

    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
    expect(forwarded(res, 'x-motir-public-host')).toBe('acme.motir.site')
  })
})

describe('a customer domain', () => {
  it('puts the project at the root and keeps the query', async () => {
    resolveHost.mockResolvedValue(CUSTOM)
    const res = await proxy(request('https://roadmap.acme.com/items?cursor=w9'))
    expect(rewriteOf(res)).toBe('/p/PROD/items')
    expect(
      new URL(res.headers.get('x-middleware-rewrite')!).search,
      'the pager coordinate must survive the rewrite',
    ).toBe('?cursor=w9')
    expect(forwarded(res, 'x-motir-address-kind')).toBe('project')
  })
})

describe('a retired subdomain', () => {
  it('301s to the live host with the path AND query preserved', async () => {
    // ADR §8's never-released promise, made observable to a visitor. A link
    // somebody published to a deep page must land on that page.
    resolveHost.mockResolvedValue(ALIAS)
    const res = await proxy(
      request('https://old.motir.site/PROD/items?cursor=w9'),
    )

    expect(res.status).toBe(301)
    const location = new URL(res.headers.get('location')!)
    expect(location.host).toBe('acme.localhost')
    expect(location.pathname).toBe('/PROD/items')
    expect(location.search).toBe('?cursor=w9')
  })

  it('takes the scheme and port from the VISITOR, in both environments', async () => {
    // ⚠️ ONE TABLE, ONE FUNCTION, TWO ENVIRONMENTS (MOTIR-4447), and that is
    // the point rather than a style choice: the two rows are the two readings
    // of "the port the visitor reached us on", and the defect was that they
    // disagree while `request.nextUrl` answers only one of them. Split into two
    // tests, either could be made green by breaking the other — which is
    // exactly what shipped, because the browser lane covers only the second row
    // and covers it BECAUSE the app really is on that port there.
    //
    // Live counterfactual, 2026-09-04, before this fix:
    //   curl -sI https://tak.motir.site/MOTIR
    //   → 301, location: https://hey.motir.site:8080/MOTIR   (chain dead, 1 hop)
    const cases: {
      what: string
      url: string
      headers: Record<string, string>
      expected: string
    }[] = [
      {
        what: 'behind a proxy that terminates TLS (Fly: 443 in, 8080 on)',
        // What the machine actually receives: the internal address, on the
        // internal port, over http — with the visitor's own address forwarded.
        url: 'http://motir-marketing.internal:8080/PROD/items?cursor=w9',
        headers: {
          'x-forwarded-host': 'old.motir.site',
          'x-forwarded-proto': 'https',
        },
        expected: 'https://acme.localhost/PROD/items?cursor=w9',
      },
      {
        what: 'a local run or the browser lane, where nothing is forwarded',
        // `e2e/stub/origin.ts`'s ALIAS_ORIGIN shape: the app really IS on 4318,
        // so the port must survive or the browser is sent to :80.
        url: 'http://old.localhost:4318/PROD/items?cursor=w9',
        headers: {},
        expected: 'http://acme.localhost:4318/PROD/items?cursor=w9',
      },
    ]

    for (const { what, url, headers, expected } of cases) {
      resolveHost.mockResolvedValue(ALIAS)
      const res = await proxy(request(url, headers))
      expect(res.status, what).toBe(301)
      expect(res.headers.get('location'), what).toBe(expected)
    }
  })
})

describe('the two failures stay apart', () => {
  it('an unknown host is the site’s not-found page', async () => {
    resolveHost.mockResolvedValue({ status: 'not-found' })
    const res = await proxy(request('https://nope.example/'))
    expect(rewriteOf(res)).toBe('/_host-unknown')
  })

  it('an UNREACHABLE contract is the error state, NEVER a 404', async () => {
    // A crawler acts on a 404. Answering one while app.motir.co restarts would
    // tell it every customer domain had been deleted.
    resolveHost.mockResolvedValue({ status: 'failed' })
    const res = await proxy(request('https://roadmap.acme.com/board'))
    expect(rewriteOf(res)).toBe('/host-unavailable')
  })
})
