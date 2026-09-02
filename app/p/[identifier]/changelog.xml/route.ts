import { PUBLIC_API_BASE } from '@/lib/publicProject'

/**
 * `motir.co/p/<identifier>/changelog.xml` — the project's Atom feed
 * (MOTIR-4118).
 *
 * ── ⚠️ THIS EXACT PATH IS NOT A CHOICE ────────────────────────────────────
 *
 * `motir-core`'s `proxy.ts` matches `/p/:path*` with `p` in
 * `PUBLIC_REDIRECT_SEGMENTS` and 308s to the SAME PATH on the public origin. So
 * the address existing subscribers hold — `app.motir.co/p/<id>/changelog.xml` —
 * lands here or lands nowhere. A feed URL is copied into a reader and outlives
 * every redirect anyone would later regret, which is why there is exactly one of
 * them and why it is not `/feed` or `/changelog.atom`.
 *
 * ── ⚠️ IT PROXIES THE DOCUMENT, IT DOES NOT REBUILD IT ────────────────────
 *
 * The Atom document is built by `motir-core`'s `lib/publicProjects/atomFeed.ts`
 * and served by its own endpoint (MOTIR-4111). This route forwards that body
 * unchanged. Re-serialising the JSON changelog into a second Atom builder here
 * would put the escaping — the one thing in that module that must be right,
 * because an unescaped ampersand makes a reader reject the WHOLE feed rather
 * than one entry — in two places, in two repositories, guarded once.
 * `public-surface-hosts.md` §2 alternative E is the same reasoning at the level
 * of the whole surface: this repository consumes, it does not re-implement.
 *
 * The `<link>` elements inside the document already name the public origin,
 * because the producing service builds them from its own `publicSiteOrigin()`.
 * So a byte-for-byte forward is also the CORRECT document, not merely the cheap
 * one — and a test asserts the bytes match rather than trusting that.
 */

export const dynamic = 'force-dynamic'

/** Cached as the producing endpoint caches it — a reader polls on its own clock. */
const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=600'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ identifier: string }> },
) {
  const { identifier } = await params

  let upstream: Response
  try {
    upstream = await fetch(
      `${PUBLIC_API_BASE}/p/${encodeURIComponent(identifier)}/changelog.xml`,
      { next: { revalidate: 0 }, headers: { accept: 'application/atom+xml' } },
    )
  } catch {
    // ⚠️ 503, NOT 404. A feed reader that receives a 404 unsubscribes; one that
    // receives a 503 retries. Telling every subscriber the project is gone
    // because motir-core restarted is the one failure this route must not have.
    return new Response('The changelog feed is temporarily unavailable.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  if (upstream.status === 404) {
    // A real 404 — no public project carries this key. The reader SHOULD stop.
    return new Response('No public project carries this key.', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }
  if (!upstream.ok) {
    return new Response('The changelog feed is temporarily unavailable.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(await upstream.text(), {
    headers: {
      'content-type': 'application/atom+xml; charset=utf-8',
      'cache-control': CACHE_CONTROL,
    },
  })
}
