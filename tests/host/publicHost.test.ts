import { describe, expect, it, vi } from 'vitest'
import {
  PUBLIC_ADDRESS_KIND_HEADER,
  PUBLIC_HOST_HEADER,
  SITE_HOST,
  normaliseHost,
  publicPathFor,
  publicPathWithQuery,
  readPublicHost,
  type PublicHost,
} from '@/lib/publicHost'

/*
 * THE LINK SHAPE, ON ALL THREE HOST KINDS (MOTIR-4220).
 *
 * The card's third acceptance criterion is that every href emitted on a tenant
 * host is host-relative. That is asserted twice: here, on the helper every link
 * goes through, and in the rendered-page tests beside this file, which is what
 * catches a component that stopped going through it.
 */

const WORKSPACE: PublicHost = { kind: 'workspace', host: 'acme.motir.site' }
const CUSTOM: PublicHost = { kind: 'project', host: 'roadmap.acme.com' }

describe('normaliseHost', () => {
  it('lowercases and drops the port', () => {
    expect(normaliseHost('ACME.Motir.Site:4318')).toBe('acme.motir.site')
  })

  it('trims, and reads an empty value as no host at all', () => {
    expect(normaliseHost('  acme.motir.site  ')).toBe('acme.motir.site')
    expect(normaliseHost('')).toBeNull()
    expect(normaliseHost(null)).toBeNull()
    expect(normaliseHost(undefined)).toBeNull()
    expect(normaliseHost(':4318')).toBeNull()
  })

  it('keeps an IPv6 literal whole and loses only its port', () => {
    // Splitting on the first colon would truncate this to `[` — a host that
    // matches nothing and does not look wrong in a log.
    expect(normaliseHost('[::1]:4318')).toBe('[::1]')
    expect(normaliseHost('[::1]')).toBe('[::1]')
  })
})

describe('publicPathFor — the same page, three addresses', () => {
  it('is /p/<id>/<tab> on the site', () => {
    expect(publicPathFor(SITE_HOST, 'ACME', 'board')).toBe('/p/ACME/board')
    expect(publicPathFor(SITE_HOST, 'ACME')).toBe('/p/ACME')
  })

  it('drops the /p prefix on a workspace subdomain', () => {
    expect(publicPathFor(WORKSPACE, 'ACME', 'board')).toBe('/ACME/board')
    expect(publicPathFor(WORKSPACE, 'ACME')).toBe('/ACME')
  })

  it('drops the identifier too on a customer domain — ONE project at the root', () => {
    expect(publicPathFor(CUSTOM, 'ACME', 'board')).toBe('/board')
    expect(publicPathFor(CUSTOM, 'ACME', 'items/ACME-42')).toBe(
      '/items/ACME-42',
    )
  })

  it('gives the customer domain’s root a slash rather than the empty string', () => {
    // `href=""` is the CURRENT url including its query, not the root — so a
    // "back to the project" link on a paged tab would go nowhere.
    expect(publicPathFor(CUSTOM, 'ACME')).toBe('/')
  })

  it('encodes the identifier where the identifier is a path segment', () => {
    expect(publicPathFor(SITE_HOST, 'A B', 'items')).toBe('/p/A%20B/items')
    expect(publicPathFor(WORKSPACE, 'A B', 'items')).toBe('/A%20B/items')
  })
})

describe('publicPathWithQuery — the no-JS pager, per host', () => {
  it('carries the coordinate on every host kind', () => {
    expect(
      publicPathWithQuery(SITE_HOST, 'ACME', 'items', { cursor: 'w9' }),
    ).toBe('/p/ACME/items?cursor=w9')
    expect(
      publicPathWithQuery(WORKSPACE, 'ACME', 'items', { cursor: 'w9' }),
    ).toBe('/ACME/items?cursor=w9')
    expect(publicPathWithQuery(CUSTOM, 'ACME', 'items', { cursor: 'w9' })).toBe(
      '/items?cursor=w9',
    )
  })

  it('drops undefined parameters rather than emitting empty ones', () => {
    // `?parentId=` reads to the endpoint as the ROOT level, so the pager would
    // silently jump back to the top of the tree.
    expect(
      publicPathWithQuery(WORKSPACE, 'ACME', 'tree', {
        parentId: undefined,
        offset: '3',
      }),
    ).toBe('/ACME/tree?offset=3')
  })
})

describe('readPublicHost — what a page believes about its address', () => {
  const headers = (entries: Record<string, string>) => new Headers(entries)

  it('reads the router’s two headers', () => {
    expect(
      readPublicHost(
        headers({
          [PUBLIC_ADDRESS_KIND_HEADER]: 'workspace',
          [PUBLIC_HOST_HEADER]: 'ACME.motir.site:443',
        }),
      ),
    ).toEqual({ kind: 'workspace', host: 'acme.motir.site' })
  })

  it('is the SITE when the router did not run — the normal case on motir.co', () => {
    expect(readPublicHost(headers({}))).toEqual(SITE_HOST)
  })

  it('refuses a kind it does not know rather than trusting the string', () => {
    // The headers are forgeable: the router OVERWRITES them on every request it
    // handles, but a request it never handled arrives with whatever was sent.
    // An unknown value must read as the site, not as a third behaviour.
    expect(
      readPublicHost(headers({ [PUBLIC_ADDRESS_KIND_HEADER]: 'admin' })),
    ).toEqual(SITE_HOST)
    expect(
      readPublicHost(headers({ [PUBLIC_ADDRESS_KIND_HEADER]: 'site' })),
    ).toEqual(SITE_HOST)
  })
})

describe('requestPublicHost — the one ambient read on the surface', () => {
  it('reads the router’s headers through `next/headers`', async () => {
    // ⚠️ THE IMPORT IS LAZY IN THE MODULE UNDER TEST, and that is not incidental
    // here either: `proxy.ts` imports this module, and `next/headers` does not
    // exist in the proxy runtime — a top-level import would throw there before
    // any routing ran. Mocking the specifier covers the dynamic import too.
    vi.doMock('next/headers', () => ({
      headers: async () =>
        new Headers({
          [PUBLIC_ADDRESS_KIND_HEADER]: 'project',
          [PUBLIC_HOST_HEADER]: 'roadmap.acme.com',
        }),
    }))
    try {
      const { requestPublicHost } = await import('@/lib/publicHost')
      await expect(requestPublicHost()).resolves.toEqual({
        kind: 'project',
        host: 'roadmap.acme.com',
      })
    } finally {
      vi.doUnmock('next/headers')
    }
  })
})
