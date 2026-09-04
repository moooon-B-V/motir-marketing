import Link from 'next/link'
import { actHref } from '@/lib/publicProject'
import { publicPathFor, type PublicHost } from '@/lib/publicHost'
import { SubscribeForm } from './SubscribeForm'

/**
 * The ACT RAIL (MOTIR-4119) — `public-surface-hosts.md` AMENDMENT 4 §D, rows 2,
 * 3 and 6, on the surface they belong to.
 *
 * ⚠️ EVERY ACT THAT NEEDS IDENTITY IS A LINK, NOT A BUTTON, and that is
 * mechanical rather than stylistic. `lib/auth/index.ts` sets the session cookie
 * `sameSite: 'lax'`, so a `fetch` from this origin carries no credential at all
 * — there is nothing to call. Making one work would need `sameSite: 'none'`,
 * which is a widening §4 rejects. AMENDMENT 4 §B is the reasoning; this rail is
 * where it becomes pixels.
 *
 * The `↗` affix is the chrome's own mark for a door that leaves this host, so a
 * visitor can tell before clicking which controls stay and which travel.
 *
 * ⚠️ AND `Follow` NEVER READS `Following`. `actorUserId` is structurally null for
 * every read this host makes (row 8), so the page cannot know whether you already
 * follow. Drawing a followed state would be a picture of a page this
 * architecture cannot serve. The state exists, and it is visible in the
 * application.
 */
export function ActRail({
  identifier,
  returnPath,
  host,
}: {
  identifier: string
  /** ⚠️ A path on the SITE, on every host — `actHref`'s note says why. */
  returnPath: string
  host: PublicHost
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {/* Row 2 — FOLLOW, a hand-off. */}
      <Link
        href={actHref('follow', identifier, returnPath)}
        className="inline-flex h-(--height-btn-sm) items-center rounded-(--radius-btn) bg-(--el-accent) px-3 text-[13px] font-medium text-(--el-accent-text) hover:bg-(--el-accent-pressed)"
      >
        Follow&nbsp;<span aria-hidden>↗</span>
        <span className="sr-only"> — continues on app.motir.co</span>
      </Link>

      {/* Row 3 — SUBSCRIBE, the one write that stays on this host. */}
      <SubscribeForm identifier={identifier} />

      {/* Row 6 — REQUEST A FEATURE, a hand-off through the doorway page. */}
      <Link
        href={publicPathFor(host, identifier, 'requests/new')}
        className="inline-flex h-(--height-btn-sm) items-center rounded-(--radius-btn) border border-(--el-border-strong) px-3 text-[13px] font-medium text-(--el-text) hover:bg-(--el-surface-soft)"
      >
        Request a feature
      </Link>

      {/* ⚠️ A PLAIN `<a>`, NOT `next/link` (MOTIR-4372). `changelog.xml` is a
          ROUTE HANDLER, not a page: there is no RSC payload to prefetch and no
          client navigation to perform. Next prefetched it anyway, because the
          href is same-origin — and the prefetch answered **404**, once per
          render of every project page, on every host. It was invisible until a
          spec counted responses instead of reading markup
          (`e2e/specs/tenant-chrome.spec.ts`). */}
      <a
        href={publicPathFor(host, identifier, 'changelog.xml')}
        className="inline-flex h-(--height-btn-sm) items-center px-2 text-[13px] text-(--el-text-secondary) hover:text-(--el-link)"
      >
        Atom feed
      </a>
    </div>
  )
}
