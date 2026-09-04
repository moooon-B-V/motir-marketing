import type { Metadata } from 'next'
import { SiteShell } from '@/app/_components/SiteShell'
import { requestPublicHost } from '@/lib/publicHost'
import { ErrorState } from '@/app/p/[identifier]/_components/States'

/**
 * WHERE AN UNREACHABLE CONTRACT LANDS (Story MOTIR-3878 · MOTIR-4220).
 *
 * `proxy.ts` must decide what a tenant host is for BEFORE any page renders, and
 * that decision is a network call to `app.motir.co`. When the call does not
 * answer, the router has no identifier to rewrite to — so it rewrites here, and
 * this renders the design's ERROR state (`design/public-projects/` panel 12) in
 * the site chrome.
 *
 * ── ⚠️ IT IS NOT A 404, AND THAT IS THE WHOLE POINT ──────────────────────
 *
 * `lib/publicProject.ts`'s three-outcome rule, one layer earlier: "a 404 is a
 * statement about the world, an error is a statement about us". Answering 404
 * when the API is restarting would tell a crawler that a customer's domain is
 * gone — and a crawler acts on a 404, while a customer's own visitors would be
 * told their project was deleted every time `app.motir.co` deploys.
 *
 * ⚠️ AND IT ANSWERS 200, like every other error state on this surface. Every
 * `/p/*` screen renders `ErrorState` inside a 200 document rather than a 5xx,
 * because the SITE is fine and one data source is not. A second convention for
 * the same condition, on the same surface, would be the inconsistency — and the
 * `noindex` below is what keeps a crawler from taking a transient failure for
 * content. `MOTIR-4222` owns the canonical decisions; this is the one robots
 * value the router's own landing pad cannot do without.
 */

export const metadata: Metadata = {
  title: 'Temporarily unavailable',
  robots: { index: false, follow: false },
}

/*
 * ⚠️ IT READS THE HOST, UNDER THE `unresolved` KIND (MOTIR-4430).
 *
 * This page used to pass `SITE_HOST` because it genuinely could not know
 * better: the router reached it through a `rewriteTo` helper that forwarded no
 * headers, so `requestPublicHost()` would have answered `SITE_HOST` anyway.
 * That helper is deleted and the `failed` branch now forwards the host as
 * `unresolved` — "not this site, and not a tenant we could resolve" — which is
 * exactly enough for the chrome to spell every `motir.co` path absolutely.
 *
 * ⚠️ AND THIS IS THE BRANCH THAT DECIDED THE FOURTH KIND. The three
 * no-resolution branches could defensibly have kept the site's own chrome:
 * `motir.site` itself is arguably ours to speak for. This one is not. It
 * renders precisely when a REAL CUSTOMER'S DOMAIN is up and `app.motir.co` is
 * restarting, so the visitor is standing on `roadmap.acme.com` while we hand
 * them six root-relative doors that host has never served. A fourth union
 * member cost one line; the alternative cost the case the page exists for.
 *
 * ⚠️ AND UNLIKE THE 404 ROOM, THIS PAGE MAY ASK. It is an ordinary route, so
 * the `headers()` read is charged to it alone: `pnpm build` moves
 * `/host-unavailable` from `○ (Static)` to `ƒ (Dynamic)` and nothing else in
 * the route table changes. `app/not-found.tsx` is the global not-found
 * boundary and cannot — it carries the measurement. That asymmetry is why one
 * of these two surfaces reads the request and the other takes `UNKNOWN_HOST`.
 *
 * The prerender is a real cost and a small one: this page is `noindex`, it
 * renders only during an outage, and it is the one document whose whole job is
 * to be honest about a request rather than fast.
 */
export default async function HostUnavailablePage() {
  const host = await requestPublicHost()

  return (
    <SiteShell
      host={host}
      contentClassName="mx-auto flex w-full max-w-[46rem] flex-col justify-center px-(--spacing-card-padding) py-16"
    >
      <ErrorState what="this address" />
    </SiteShell>
  )
}
