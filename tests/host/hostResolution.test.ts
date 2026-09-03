import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isSiteAssetPath,
  maxAgeMs,
  resetHostResolutionCache,
  resolveHost,
  routeForHost,
  type PublicHostResolution,
} from '@/lib/hostResolution'
import { APP_ORIGIN } from '@/lib/appOrigin'

/*
 * THE ROUTER'S READ AND THE ROUTER'S DECISION (MOTIR-4220).
 *
 * Split from `proxy.ts` on purpose: the decision is pure, so every arm is a
 * unit test here rather than four `NextRequest` fixtures over there.
 */

const WORKSPACE: PublicHostResolution = {
  kind: 'workspace',
  workspace: { name: 'Acme' },
  projects: [
    { identifier: 'PROD', name: 'Prod' },
    { identifier: 'DOCS', name: 'Docs' },
  ],
}
const ALIAS: PublicHostResolution = {
  kind: 'alias',
  redirectTo: 'acme.motir.site',
}
const CUSTOM: PublicHostResolution = {
  kind: 'project',
  project: { identifier: 'PROD', name: 'Prod' },
  primary: true,
}

/* ── the read ─────────────────────────────────────────────────────────────── */

function answer(
  body: unknown,
  init: { status?: number; cacheControl?: string } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      ...(init.cacheControl ? { 'cache-control': init.cacheControl } : {}),
    },
  })
}

describe('resolveHost', () => {
  beforeEach(() => {
    // ⚠️ THE CACHE IS MODULE STATE AND OUTLIVES A TEST FILE. Without this the
    // suite inherits verdicts from whichever file ran first — the coupling
    // `tests/publicProject/` met once already, on `allowedOrigins`.
    resetHostResolutionCache()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('calls the contract on the APP origin, host-encoded', async () => {
    const fetchMock = vi.fn((url: string) => {
      expect(url).toBe(`${APP_ORIGIN}/api/public/hosts/acme.motir.site`)
      return Promise.resolve(answer(WORKSPACE))
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(resolveHost('acme.motir.site')).resolves.toEqual({
      status: 'ok',
      data: WORKSPACE,
    })
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${APP_ORIGIN}/api/public/hosts/acme.motir.site`,
    )
  })

  it('maps a 404 to not-found and anything else unreadable to failed', async () => {
    vi.stubGlobal('fetch', async () =>
      answer({ code: 'NOT_FOUND' }, { status: 404 }),
    )
    await expect(resolveHost('nope.example')).resolves.toEqual({
      status: 'not-found',
    })

    resetHostResolutionCache()
    vi.stubGlobal('fetch', async () => answer({}, { status: 500 }))
    await expect(resolveHost('nope.example')).resolves.toEqual({
      status: 'failed',
    })

    resetHostResolutionCache()
    vi.stubGlobal('fetch', async () => {
      throw new Error('ECONNREFUSED')
    })
    await expect(resolveHost('nope.example')).resolves.toEqual({
      status: 'failed',
    })
  })

  it('reads a 200 that is not JSON as an outage, not as a 404', async () => {
    // A proxy's own error page, most likely. It is not the contract SAYING the
    // host is unknown, so it must not become a 404 a crawler acts on.
    vi.stubGlobal(
      'fetch',
      async () => new Response('<html>502</html>', { status: 200 }),
    )
    await expect(resolveHost('acme.motir.site')).resolves.toEqual({
      status: 'failed',
    })
  })

  it('CACHES an answer for the contract’s own max-age', async () => {
    const fetchMock = vi.fn(async () =>
      answer(WORKSPACE, {
        cacheControl: 'public, max-age=60, stale-while-revalidate=300',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    vi.useFakeTimers()
    try {
      await resolveHost('acme.motir.site')
      await resolveHost('acme.motir.site')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(59_000)
      await resolveHost('acme.motir.site')
      expect(fetchMock).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(2_000)
      await resolveHost('acme.motir.site')
      expect(fetchMock).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('caches a 404 too — a pointed-at hostname must not cost a hop per request', async () => {
    const fetchMock = vi.fn(async () => answer({}, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)

    await resolveHost('nope.example')
    await resolveHost('nope.example')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does NOT cache an outage — a restart must not become a minute of it', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('ECONNREFUSED')
    })
    vi.stubGlobal('fetch', fetchMock)

    await resolveHost('acme.motir.site')
    await resolveHost('acme.motir.site')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('normalises the key, so a port or a capital is not a second cache entry', async () => {
    const fetchMock = vi.fn(async () => answer(WORKSPACE))
    vi.stubGlobal('fetch', fetchMock)

    await resolveHost('ACME.motir.site:443')
    await resolveHost('acme.motir.site')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('answers not-found for an empty host without calling anything', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(resolveHost('')).resolves.toEqual({ status: 'not-found' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('is BOUNDED — the key is attacker-supplied', async () => {
    // 1000 entries is the bound. Filling past it must evict rather than grow:
    // a script pointing distinct hostnames at this app would otherwise be an
    // unbounded Map in a 512 MB machine.
    const fetchMock = vi.fn(async () => answer({}, { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)

    for (let i = 0; i < 1001; i += 1) await resolveHost(`h${i}.example`)
    expect(fetchMock).toHaveBeenCalledTimes(1001)

    // The FIRST key was evicted and is re-fetched; a recent one is still held.
    await resolveHost('h0.example')
    expect(fetchMock).toHaveBeenCalledTimes(1002)
    await resolveHost('h1000.example')
    expect(fetchMock).toHaveBeenCalledTimes(1002)
  })
})

describe('maxAgeMs', () => {
  it('reads the contract’s directive', () => {
    expect(maxAgeMs('public, max-age=60, stale-while-revalidate=300')).toBe(
      60_000,
    )
    expect(maxAgeMs('max-age=5')).toBe(5_000)
  })

  it('falls back to the producing route’s own number when there is none', () => {
    expect(maxAgeMs(null)).toBe(60_000)
    expect(maxAgeMs('no-store')).toBe(60_000)
  })

  it('does not mistake s-maxage for max-age', () => {
    expect(maxAgeMs('s-maxage=1')).toBe(60_000)
  })
})

/* ── the decision ─────────────────────────────────────────────────────────── */

describe('routeForHost — a workspace subdomain', () => {
  it('serves the workspace’s project list at the root', () => {
    expect(routeForHost(WORKSPACE, '/')).toEqual({ action: 'workspace-root' })
  })

  it('rewrites a known project onto the shipped /p/* tree, path and all', () => {
    expect(routeForHost(WORKSPACE, '/PROD/board')).toEqual({
      action: 'rewrite',
      path: '/p/PROD/board',
    })
    expect(routeForHost(WORKSPACE, '/PROD')).toEqual({
      action: 'rewrite',
      path: '/p/PROD',
    })
    expect(routeForHost(WORKSPACE, '/PROD/items/PROD-42')).toEqual({
      action: 'rewrite',
      path: '/p/PROD/items/PROD-42',
    })
  })

  it('404s a project this workspace does not publish', () => {
    // Not "the project does not exist" — it is not THIS workspace's, and a
    // subdomain that served another tenant's project would be the whole point
    // of the address undone.
    expect(routeForHost(WORKSPACE, '/OTHER/board')).toEqual({
      action: 'not-found',
    })
  })

  it('lets a site asset through — the chrome’s logo is at the ROOT', () => {
    expect(routeForHost(WORKSPACE, '/motir-mark.svg')).toEqual({
      action: 'forward',
    })
    expect(routeForHost(WORKSPACE, '/favicon.ico')).toEqual({
      action: 'forward',
    })
  })

  it('and the CRAWL SURFACE takes that arm too, with the host attached', () => {
    // ⚠️ `forward`, NOT `pass`, and the difference is a whole card. Both are
    // "serve this path unchanged", but `/sitemap.xml` and `/robots.txt` are
    // site-asset-SHAPED and must still know which host asked: a sitemap may only
    // list URLs on its own (MOTIR-4222). Forwarding nothing made both answer as
    // `motir.co` on every tenant host.
    expect(routeForHost(WORKSPACE, '/sitemap.xml')).toEqual({
      action: 'forward',
    })
    expect(routeForHost(CUSTOM, '/robots.txt')).toEqual({ action: 'forward' })
  })

  it('and the ATOM FEED is not mistaken for one', () => {
    // ⚠️ THE TRAP THIS ROUTER IS SHAPED AROUND. `changelog.xml` has an
    // extension, so the idiomatic "skip anything with a dot" matcher would
    // leave the feed unrouted — in people's feed readers — on every tenant
    // host. A project path is never ONE segment, which is what tells them apart.
    expect(routeForHost(WORKSPACE, '/PROD/changelog.xml')).toEqual({
      action: 'rewrite',
      path: '/p/PROD/changelog.xml',
    })
  })
})

describe('routeForHost — a customer domain', () => {
  it('puts the project at the host’s root (ADR Q3)', () => {
    expect(routeForHost(CUSTOM, '/')).toEqual({
      action: 'rewrite',
      path: '/p/PROD',
    })
    expect(routeForHost(CUSTOM, '/board')).toEqual({
      action: 'rewrite',
      path: '/p/PROD/board',
    })
    expect(routeForHost(CUSTOM, '/items/PROD-42')).toEqual({
      action: 'rewrite',
      path: '/p/PROD/items/PROD-42',
    })
  })

  it('lets a site asset through here too', () => {
    expect(routeForHost(CUSTOM, '/motir-mark.svg')).toEqual({
      action: 'forward',
    })
  })
})

describe('routeForHost — a retired subdomain', () => {
  it('redirects to the live host, whatever the path', () => {
    expect(routeForHost(ALIAS, '/OLD/board')).toEqual({
      action: 'redirect',
      host: 'acme.motir.site',
    })
    expect(routeForHost(ALIAS, '/')).toEqual({
      action: 'redirect',
      host: 'acme.motir.site',
    })
  })
})

describe('routeForHost is IDEMPOTENT — Next re-enters on its own rewrite', () => {
  /*
   * ⚠️ THE FINDING THIS SUITE EXISTS FOR, and it was found in the browser lane
   * rather than here. Next 16 dispatches an internal `NextResponse.rewrite`
   * back through the proxy, so `/MOTIR/board` arrives, becomes `/p/MOTIR/board`
   * — and then arrives AGAIN as `/p/MOTIR/board`. Before this branch the second
   * pass read `p` as a project the workspace does not publish and answered 404,
   * so EVERY tenant page 404'd while every single-pass unit test stayed green.
   */
  it('forwards a rewrite it could have produced, on both host kinds', () => {
    expect(routeForHost(WORKSPACE, '/p/PROD/board')).toEqual({
      action: 'forward',
    })
    expect(routeForHost(CUSTOM, '/p/PROD/items/PROD-1')).toEqual({
      action: 'forward',
    })
  })

  it('and REFUSES one it could not — the address boundary holds', () => {
    // The recognition is by SHAPE, not by a marker header: a header saying "the
    // router already ran" would be settable by any caller, and trusting it
    // would serve any project at any tenant address. There is nothing to forge
    // here, because the identifier must be one the contract just named.
    expect(routeForHost(WORKSPACE, '/p/OTHER/board')).toEqual({
      action: 'not-found',
    })
    expect(routeForHost(CUSTOM, '/p/OTHER')).toEqual({ action: 'not-found' })
    expect(routeForHost(WORKSPACE, '/p/')).toEqual({ action: 'not-found' })
  })

  it('forwards the workspace root back to itself, and refuses it elsewhere', () => {
    expect(routeForHost(WORKSPACE, '/w')).toEqual({ action: 'forward' })
    // A customer domain has no workspace list — the page would 404 anyway, but
    // the router must not tell it to try.
    expect(routeForHost(CUSTOM, '/w')).toEqual({ action: 'not-found' })
  })

  it('passes its own two landing pads through untouched', () => {
    // Anything else here is a redirect loop.
    expect(routeForHost(WORKSPACE, '/_host-unknown')).toEqual({
      action: 'forward',
    })
    expect(routeForHost(CUSTOM, '/host-unavailable')).toEqual({
      action: 'forward',
    })
  })
})

describe('isSiteAssetPath', () => {
  it('is ONE segment with a dot, and nothing else', () => {
    expect(isSiteAssetPath('/robots.txt')).toBe(true)
    expect(isSiteAssetPath('/sitemap.xml')).toBe(true)
    expect(isSiteAssetPath('/PROD')).toBe(false)
    expect(isSiteAssetPath('/')).toBe(false)
    expect(isSiteAssetPath('/PROD/changelog.xml')).toBe(false)
  })
})
