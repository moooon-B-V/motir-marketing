import { publicPathFor, SITE_HOST, type PublicHost } from '@/lib/publicHost'
import { formatRich, useCopy } from '@/lib/copy'

/**
 * The three states every `/p/*` screen can be in (MOTIR-4115) — panels 10, 11
 * and 12 of `design/public-projects/`.
 *
 * ⚠️ THE ERROR STATE IS THE ONE THAT EARNS ITS PLACE, and it is not generic.
 * `public-surface-hosts.md` §8 cost 1: "a network hop replaces a Prisma read …
 * the API can be slow, or down, and the renderer is in a different application
 * with a different deploy." This is the first Motir surface where that is true,
 * so an unreachable API is a REAL state of this page. It therefore:
 *
 *   • keeps the chrome — the site is up; one screen's data source is not;
 *   • NAMES the other host, because "something went wrong" on a page that looks
 *     fine is the least actionable message a visitor can be given;
 *   • offers the route that does NOT depend on the failing hop.
 */

export function EmptyState({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-(--radius-card) border border-(--el-border) bg-(--el-surface-soft) px-6 py-8 text-center">
      <h3 className="text-[15px] font-medium text-(--el-text)">{title}</h3>
      {children ? (
        <p className="mx-auto mt-1.5 max-w-[34rem] text-[13px] leading-[1.6] text-(--el-text-secondary)">
          {children}
        </p>
      ) : null}
    </div>
  )
}

export function ErrorState({
  title,
  identifier,
  host = SITE_HOST,
}: {
  /**
   * The WHOLE sentence — a `publicProject.states.error.*` key, "We could not
   * load this project's changelog" (MOTIR-7954). It took an English `what` that
   * was spliced into an English sentence, which no translation can reach.
   */
  title: string
  identifier?: string
  /**
   * The address this request arrived on, for the feed link below.
   *
   * ⚠️ DEFAULTED, and it is the only host prop on this surface that is. The
   * two callers that pass no `identifier` render no link at all, so there is
   * nothing for the host to shape — and one of them is
   * `app/host-unavailable/page.tsx`, which is reached precisely when the router
   * could NOT resolve the host. Requiring a value there would mean inventing one.
   */
  host?: PublicHost
}) {
  const error = useCopy().publicProject.states.error
  const appHost = useCopy().publicProject.appHost
  return (
    <div
      role="alert"
      className="mt-6 rounded-(--radius-card) bg-(--el-tint-peach) px-6 py-8 text-center"
    >
      <h3 className="text-[15px] font-medium text-(--el-text)">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[34rem] text-[13px] leading-[1.6] text-(--el-text-secondary)">
        {formatRich(identifier ? error.bodyWithFeed : error.body, {
          host: <strong>{appHost}</strong>,
        })}
      </p>
      {identifier ? (
        <p className="mt-3.5 text-[13px]">
          {/* A plain `<a>` — `changelog.xml` is a route handler, so a
              `next/link` prefetches it and takes a 404 (MOTIR-4372, and see
              `ActRail`). */}
          <a
            href={publicPathFor(host, identifier, 'changelog.xml')}
            className="text-(--el-link) underline underline-offset-2"
          >
            {error.feed}
          </a>
        </p>
      ) : null}
    </div>
  )
}

/**
 * The LOADING skeleton — rows in the shape of the list that is coming, so the
 * page does not jump when the data lands. Never a spinner over an empty frame.
 */
export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div aria-hidden className="mt-6 flex flex-col gap-3.5">
      {Array.from({ length: rows }, (_unused, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border-b border-(--el-border-soft) py-3"
        >
          <span className="h-3 w-24 rounded-(--radius-control) bg-(--el-muted)" />
          <span className="h-3 flex-1 rounded-(--radius-control) bg-(--el-muted)" />
          <span className="h-3 w-16 rounded-(--radius-control) bg-(--el-muted)" />
        </div>
      ))}
    </div>
  )
}
