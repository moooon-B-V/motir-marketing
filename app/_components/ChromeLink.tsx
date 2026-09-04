import Link from 'next/link'

/**
 * One link to a MOTIR.CO page, rendered as what it IS on this host: a
 * `next/link` when the destination is same-origin, a plain `<a>` when it is
 * not.
 *
 * ⚠️ IT EXISTS BECAUSE THE ANSWER IS PER-HOST AND THE MARKUP IS NOT
 * (MOTIR-4372). Before that card `internal` was a per-item CONSTANT — three nav
 * items hard-coded `true` — which is correct on `motir.co` and wrong on every
 * tenant host, where the same three destinations are a different origin.
 *
 * ⚠️ AND THE `<a>` ARM IS THE WHOLE POINT, NOT A FALLBACK. Next RSC-PREFETCHES
 * a same-origin `next/link` ON RENDER, so a merely-absolute href on a
 * `next/link` would still cost a prefetch per chrome item per page load —
 * `e2e/specs/tenant-chrome.spec.ts` asserts the page makes NO request off its
 * own host, which is that assertion written as a host test. `siteLinkFor` in
 * `lib/publicHost.ts` spells the href; this decides the element, and neither
 * half works without the other.
 *
 * ⚠️ IT LIVES HERE RATHER THAN IN `SiteHeader` (MOTIR-4430). It was that
 * component's private helper, and the 404 room's own two doors — `Explore
 * projects` and `Go to the homepage`, inside `<main>` rather than in the
 * chrome — need exactly the same answer for exactly the same reason. Moving it
 * out is what stops a third hand-rolled `host.kind === 'site' ? … : …` from
 * being written; it is deliberately NOT a client component, so a server page
 * can use it without paying for one.
 */
export function ChromeLink({
  href,
  internal,
  children,
  ...rest
}: Readonly<
  {
    href: string
    internal: boolean
    children: React.ReactNode
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>) {
  return internal ? (
    <Link href={href} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
