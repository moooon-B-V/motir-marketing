// @vitest-environment node
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'

/*
 * The `next/og` draw gate (`app/_brand/ogRenderGate.ts`) and the per-project
 * card that draws through it. A card drawn per request, without a limit, ran
 * both 1 GB machines out of memory on 2026-10-18.
 */

const PNG_MAGIC = '89504e470d0a1a0a'

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('next/og')
  vi.doUnmock('@/lib/publicProject')
  vi.resetModules()
})

describe('the gate', () => {
  it('draws at most OG_DRAWS_IN_FLIGHT cards at once, and every one finishes', async () => {
    let drawing = 0
    let peak = 0
    const finish: (() => void)[] = []
    vi.doMock('next/og', () => ({
      ImageResponse: class {
        status = 200
        headers = new Headers({ 'content-type': 'image/png' })
        async arrayBuffer() {
          drawing++
          peak = Math.max(peak, drawing)
          await new Promise<void>((resolve) => finish.push(resolve))
          drawing--
          return new ArrayBuffer(8)
        }
      },
    }))
    const { drawOgImage, ogGateState, OG_DRAWS_IN_FLIGHT } =
      await import('@/app/_brand/ogRenderGate')

    const draws = Array.from({ length: 10 }, () => drawOgImage(null as never))
    // Let every request reach the gate.
    for (let i = 0; i < 5; i++) await Promise.resolve()
    expect(ogGateState()).toMatchObject({
      inFlight: OG_DRAWS_IN_FLIGHT,
      waiting: 8,
    })

    while (finish.length || ogGateState().inFlight) {
      finish.shift()?.()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
    const responses = await Promise.all(draws)
    expect(peak).toBe(OG_DRAWS_IN_FLIGHT)
    expect(responses.map((r) => r.status)).toEqual(Array(10).fill(200))
    expect(ogGateState()).toMatchObject({ inFlight: 0, waiting: 0 })
  })

  it('frees the slot when a draw throws', async () => {
    vi.doMock('next/og', () => ({
      ImageResponse: class {
        async arrayBuffer(): Promise<ArrayBuffer> {
          throw new Error('resvg failed')
        }
      },
    }))
    const { drawOgImage, ogGateState } =
      await import('@/app/_brand/ogRenderGate')
    await expect(drawOgImage(null as never)).rejects.toThrow('resvg failed')
    expect(ogGateState()).toMatchObject({ inFlight: 0, waiting: 0 })
  })
})

describe('the card cache', () => {
  const png = (byte: number) =>
    new Response(new Uint8Array([byte]), {
      headers: { 'content-type': 'image/png' },
    })

  it('draws a key once, shares a draw in flight, and answers with max-age', async () => {
    const { cachedOgImage, OG_CACHE_SECONDS } =
      await import('@/app/_brand/ogRenderGate')
    const draw = vi.fn(async () => ({ response: png(1), keep: true }))
    const answers = await Promise.all(
      Array.from({ length: 50 }, () => cachedOgImage('p/MOTIR', draw)),
    )
    await cachedOgImage('p/MOTIR', draw)
    expect(draw).toHaveBeenCalledTimes(1)
    for (const answer of answers) {
      expect(answer.headers.get('cache-control')).toBe(
        `public, max-age=${OG_CACHE_SECONDS}`,
      )
      expect(answer.headers.get('content-type')).toBe('image/png')
      expect([...new Uint8Array(await answer.arrayBuffer())]).toEqual([1])
    }
  })

  it('draws again once the window has passed', async () => {
    const { cachedOgImage, OG_CACHE_SECONDS } =
      await import('@/app/_brand/ogRenderGate')
    let t = 0
    const now = () => t
    const draw = vi.fn(async () => ({ response: png(1), keep: true }))
    await cachedOgImage('p/MOTIR', draw, now)
    t = OG_CACHE_SECONDS * 1000 - 1
    await cachedOgImage('p/MOTIR', draw, now)
    expect(draw).toHaveBeenCalledTimes(1)
    t = OG_CACHE_SECONDS * 1000
    await cachedOgImage('p/MOTIR', draw, now)
    expect(draw).toHaveBeenCalledTimes(2)
  })

  it('does not keep a fallback, an error answer or a throw', async () => {
    const { cachedOgImage, ogGateState } =
      await import('@/app/_brand/ogRenderGate')
    const fallback = vi.fn(async () => ({ response: png(2), keep: false }))
    await cachedOgImage('p/DOWN', fallback)
    await cachedOgImage('p/DOWN', fallback)
    expect(fallback).toHaveBeenCalledTimes(2)

    const error = vi.fn(async () => ({
      response: new Response('', { status: 500 }),
      keep: true,
    }))
    await cachedOgImage('p/ERR', error)
    await cachedOgImage('p/ERR', error)
    expect(error).toHaveBeenCalledTimes(2)

    await expect(
      cachedOgImage('p/THROW', async () => {
        throw new Error('resvg failed')
      }),
    ).rejects.toThrow('resvg failed')
    const retry = vi.fn(async () => ({ response: png(3), keep: true }))
    await cachedOgImage('p/THROW', retry)
    expect(retry).toHaveBeenCalledTimes(1)
    expect(ogGateState().kept).toBe(1)
  })

  it('keeps at most OG_CACHE_ENTRIES cards, dropping the oldest', async () => {
    const { cachedOgImage, ogGateState, OG_CACHE_ENTRIES } =
      await import('@/app/_brand/ogRenderGate')
    const draw = vi.fn(async () => ({ response: png(1), keep: true }))
    for (let i = 0; i <= OG_CACHE_ENTRIES; i++) {
      await cachedOgImage(`p/K${i}`, draw)
    }
    expect(ogGateState().kept).toBe(OG_CACHE_ENTRIES)
    await cachedOgImage(`p/K${OG_CACHE_ENTRIES}`, draw)
    expect(draw).toHaveBeenCalledTimes(OG_CACHE_ENTRIES + 1)
    await cachedOgImage('p/K0', draw)
    expect(draw).toHaveBeenCalledTimes(OG_CACHE_ENTRIES + 2)
  })
})

describe('the per-project card', () => {
  const ROUTE = 'app/[locale]/p/[identifier]/opengraph-image.tsx'

  it('awaits its params, reads on the cache window, and draws once per project', async () => {
    const loadProject = vi.fn(async () => ({
      status: 'ok' as const,
      data: {
        name: 'Motir',
        publicTagline: 'Built in public',
        workspaceName: 'moooon',
      },
    }))
    vi.doMock('@/lib/publicProject', () => ({ loadProject }))
    const { OG_CACHE_SECONDS } = await import('@/app/_brand/ogRenderGate')
    const { default: route } =
      await import('@/app/[locale]/p/[identifier]/opengraph-image')
    const response = await route({
      params: Promise.resolve({ identifier: 'MOTIR' }),
    })
    const bytes = Buffer.from(await response.arrayBuffer())
    expect(bytes.subarray(0, 8).toString('hex')).toBe(PNG_MAGIC)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(loadProject).toHaveBeenCalledWith('MOTIR', OG_CACHE_SECONDS)

    await route({ params: Promise.resolve({ identifier: 'MOTIR' }) })
    expect(loadProject).toHaveBeenCalledTimes(1)
  }, 30_000)

  it('does not keep the fallback card drawn when the read failed', async () => {
    const loadProject = vi.fn(async () => ({ status: 'failed' as const }))
    vi.doMock('@/lib/publicProject', () => ({ loadProject }))
    const { default: route } =
      await import('@/app/[locale]/p/[identifier]/opengraph-image')
    await route({ params: Promise.resolve({ identifier: 'DOWN' }) })
    await route({ params: Promise.resolve({ identifier: 'DOWN' }) })
    expect(loadProject).toHaveBeenCalledTimes(2)
  }, 30_000)

  it('draws through the gate, never with a bare ImageResponse', () => {
    const source = readFileSync(ROUTE, 'utf8')
    expect(source).toMatch(/cachedOgImage\(/)
    expect(source).not.toMatch(/new ImageResponse/)
  })
})
