import { ImageResponse } from 'next/og'

// The gate every request-time `next/og` card is drawn through.
//
// ⚠️ A CARD'S MEMORY IS NOT ON THE V8 HEAP, AND THAT IS WHY THIS EXISTS.
// satori lays the card out and resvg rasterises it in WebAssembly, and each
// draw in flight holds its own buffers outside the heap — so
// `--max-old-space-size` (`fly.toml`) never fires. Measured on a standalone
// build on 2026-10-18 with the heap capped at 768 MB: 1,500 draws of
// `/en/p/MOTIR/opengraph-image` took the server from 350 MB to 1,189 MB RSS at
// 20 in flight and from 211 MB to 1,454 MB at 100, against ±190 MB for every
// other route. The 1 GB machines allow 150 requests in flight
// (`[http_service.concurrency]`), so a crawl of `/p/*` cards ran both of them
// out of memory — no OOM kill, no heap abort, a machine that stopped answering
// while Fly still called it `started` (motir.co down, 2026-10-18 21:00Z).
//
// So at most OG_DRAWS_IN_FLIGHT cards are drawn at once and the rest wait their
// turn, which costs a queued request a promise rather than a raster.
//
// ⚠️ THE PNG IS DRAWN INSIDE THE GATE. `ImageResponse` draws lazily, as its
// body is read — returning one from inside the gate would release the slot
// before a single pixel existed. So the body is read to bytes here and a plain
// `Response` carries them out.

/** Cards drawn at once. One shared-cpu-1x core gains nothing from more. */
export const OG_DRAWS_IN_FLIGHT = 2

let inFlight = 0
const waiting: (() => void)[] = []

async function acquire(): Promise<void> {
  if (inFlight < OG_DRAWS_IN_FLIGHT) {
    inFlight++
    return
  }
  // The slot is handed over by `release`, so `inFlight` is not incremented.
  await new Promise<void>((resolve) => waiting.push(resolve))
}

function release(): void {
  const next = waiting.shift()
  if (next) next()
  else inFlight--
}

/** Draw a card through the gate and answer it as a PNG. */
export async function drawOgImage(
  ...args: ConstructorParameters<typeof ImageResponse>
): Promise<Response> {
  await acquire()
  try {
    const card = new ImageResponse(...args)
    const png = await card.arrayBuffer()
    return new Response(png, { status: card.status, headers: card.headers })
  } finally {
    release()
  }
}

// ⚠️ AND A CARD IS DRAWN ONCE PER KEY PER WINDOW, NOT ONCE PER REQUEST. The gate
// bounds the memory; it does not bound the work — 150 requests for one card
// would still be 150 draws, queued. `[locale]/p/[identifier]/opengraph-image`
// is a request-time route (its page is), so Next's ISR does not cache it
// (verified on a standalone build: no `x-nextjs-cache`, `max-age=0` on every
// hit). So the bytes are kept here, per machine, for OG_CACHE_SECONDS, and
// requests that arrive while a key is being drawn share that one draw. The
// answer carries the same window as `max-age`, so an unfurler's own cache can
// spare the machine the request entirely.

/** How long a drawn card is served before it is drawn again. */
export const OG_CACHE_SECONDS = 3600

/** Cards kept. A card is ~50 KB, so the cap is a few MB of heap. */
export const OG_CACHE_ENTRIES = 200

interface Drawn {
  png: ArrayBuffer
  headers: [string, string][]
  status: number
  at: number
}

const drawn = new Map<string, Drawn>()
const drawing = new Map<string, Promise<Drawn>>()

function answer({ png, headers, status }: Drawn): Response {
  const out = new Headers(headers)
  out.set('cache-control', `public, max-age=${OG_CACHE_SECONDS}`)
  return new Response(png.slice(0), { status, headers: out })
}

/**
 * Answer the card for `key`, drawing it through the gate only when no fresh
 * copy is kept and no draw of it is already in flight. A draw that throws,
 * answers an error, or says `keep: false` (a fallback drawn because its data
 * could not be read) is not kept, so the next request tries again.
 */
export async function cachedOgImage(
  key: string,
  draw: () => Promise<{ response: Response; keep: boolean }>,
  now: () => number = Date.now,
): Promise<Response> {
  const kept = drawn.get(key)
  if (kept && now() - kept.at < OG_CACHE_SECONDS * 1000) return answer(kept)

  let pending = drawing.get(key)
  if (!pending) {
    pending = (async () => {
      const { response, keep } = await draw()
      const entry: Drawn = {
        png: await response.arrayBuffer(),
        headers: [...response.headers],
        status: response.status,
        at: now(),
      }
      if (keep && response.ok) {
        drawn.delete(key)
        drawn.set(key, entry)
        // A Map iterates in insertion order, so the first key is the oldest.
        if (drawn.size > OG_CACHE_ENTRIES) {
          drawn.delete(drawn.keys().next().value as string)
        }
      }
      return entry
    })().finally(() => drawing.delete(key))
    drawing.set(key, pending)
  }
  return answer(await pending)
}

/** Draws in flight and queued, and cards kept — for tests. */
export function ogGateState(): {
  inFlight: number
  waiting: number
  kept: number
} {
  return { inFlight, waiting: waiting.length, kept: drawn.size }
}
