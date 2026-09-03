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

describe('a workspace subdomain', () => {
  beforeEach(() => resolveHost.mockResolvedValue(WORKSPACE))

  it('rewrites a project path onto the shipped tree, carrying host and kind', async () => {
    const res = await proxy(request('https://acme.motir.site/PROD/board'))

    expect(rewriteOf(res)).toBe('/p/PROD/board')
    expect(forwarded(res, 'x-motir-address-kind')).toBe('workspace')
    expect(forwarded(res, 'x-motir-public-host')).toBe('acme.motir.site')
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
