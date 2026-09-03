import type { Metadata } from 'next'
import { SiteShell } from '@/app/_components/SiteShell'
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

export default function HostUnavailablePage() {
  return (
    <SiteShell contentClassName="mx-auto flex w-full max-w-[46rem] flex-col justify-center px-(--spacing-card-padding) py-16">
      <ErrorState what="this address" />
    </SiteShell>
  )
}
