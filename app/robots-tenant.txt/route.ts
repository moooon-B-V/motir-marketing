import { currentOrigin, requestPublicHost } from '@/lib/publicHost'

/*
 * `robots.txt` for a TENANT address (MOTIR-4222, split out by MOTIR-8842).
 *
 * `acme.motir.site` and a customer domain each need a `robots.txt` naming their
 * OWN sitemap and host: one pointing at `motir.co/sitemap.xml` would hand a
 * crawler a document listing URLs on a host it did not ask about, which the
 * sitemap protocol refuses outright. Which host asked is only known per
 * request, so this is the part of robots that cannot be built — and it is a
 * route handler on its own so that `app/robots.ts` can be a static file for
 * `motir.co`, which is where the traffic is.
 *
 * Nobody requests `/robots-tenant.txt`: `proxy.ts` rewrites a tenant host's
 * `/robots.txt` here after the host has resolved, with the host headers set.
 * Same body `app/robots.ts` renders, byte for byte, on a different origin.
 */
export const dynamic = 'force-dynamic'

export async function GET(): Promise<Response> {
  const origin = currentOrigin(await requestPublicHost())
  const body = [
    'User-Agent: *',
    'Allow: /',
    '',
    `Host: ${origin}/`,
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
