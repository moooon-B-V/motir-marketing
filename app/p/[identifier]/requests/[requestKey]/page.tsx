import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { siteUrl } from '@/lib/siteOrigin'
import {
  actHref,
  deriveDescription,
  loadProject,
  loadRequest,
} from '@/lib/publicProject'
import { publicPathFor, requestPublicHost, SITE_HOST } from '@/lib/publicHost'
import { MarkdownBody } from '@/app/legal/_components/MarkdownBody'
import { ProjectHeader } from '../../_components/ProjectHeader'
import { ErrorState } from '../../_components/States'
import { StatusPill } from '../../_components/Rows'

export const dynamic = 'force-dynamic'

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string; requestKey: string }>
}): Promise<Metadata> {
  const { identifier, requestKey } = await params
  const read = await loadRequest(identifier, requestKey)
  if (read.status !== 'ok') return {}

  const request = read.data
  const url = siteUrl(
    `/p/${encodeURIComponent(identifier)}/requests/${encodeURIComponent(request.identifier)}`,
  )
  return {
    title: `${request.title} · ${identifier}`,
    description: deriveDescription(request.descriptionMd, request.title),
    alternates: { canonical: url },
    openGraph: { type: 'article', url, siteName: 'Motir' },
  }
}

/**
 * ONE FEATURE REQUEST (MOTIR-4117) — body, public thread, vote count.
 *
 * ⚠️ THE UPVOTE AND THE COMMENT ARE HAND-OFFS, added by MOTIR-4119
 * (`public-surface-hosts.md` AMENDMENT 4 rows 4 and 5). Each is a LINK to
 * `app.motir.co/act` carrying this page as its return, never a button that
 * posts: `sameSite: 'lax'` means a cross-origin write from here carries no
 * credential, so there is nothing to post to.
 *
 * ⚠️ `voted` IS ALWAYS FALSE HERE, and the count is rendered without a voted
 * state on purpose. `actorUserId` is structurally null for every read this host
 * makes (AMENDMENT 4 row 8), so the page cannot know — and drawing a voted state
 * it can never reach would be a picture of a page this architecture does not
 * serve.
 */
export default async function PublicRequestPage({
  params,
}: {
  params: Promise<{ identifier: string; requestKey: string }>
}) {
  const { identifier, requestKey } = await params
  const host = await requestPublicHost()
  const [project, request] = await Promise.all([
    loadProject(identifier),
    loadRequest(identifier, requestKey),
  ])

  if (project.status === 'not-found' || request.status === 'not-found')
    notFound()
  if (project.status === 'failed')
    return <ErrorState what="this project" host={host} />

  // ⚠️ `SITE_HOST`, on every host: the hand-off prefixes this with
  // `SITE_ORIGIN`, so a host-relative return is a URL that does not exist.
  // `actHref`'s note carries the reasoning and the consequence.
  const returnPath =
    request.status === 'ok'
      ? publicPathFor(
          SITE_HOST,
          identifier,
          `requests/${encodeURIComponent(request.data.identifier)}`,
        )
      : publicPathFor(SITE_HOST, identifier, 'roadmap')

  return (
    <>
      <ProjectHeader project={project.data} current="roadmap" host={host} />

      {request.status === 'failed' ? (
        <ErrorState
          what="this feature request"
          identifier={identifier}
          host={host}
        />
      ) : (
        <article className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div>
            <p className="mb-5 text-[13px]">
              <Link
                href={publicPathFor(host, identifier, 'roadmap')}
                className="text-(--el-text-secondary) hover:text-(--el-link)"
              >
                ← {project.data.name} · Roadmap
              </Link>
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-(family-name:--font-mono) text-[12px] text-(--el-text-secondary)">
                {request.data.identifier}
              </span>
              <StatusPill
                status={request.data.statusLabel}
                category={request.data.statusCategory}
              />
            </div>
            <h2 className="mt-1.5 font-(family-name:--font-serif) text-[24px] leading-tight font-bold text-(--el-text)">
              {request.data.title}
            </h2>
            <p className="mt-2 text-[13px] text-(--el-text-secondary)">
              Opened by {request.data.openedByName} ·{' '}
              <time dateTime={request.data.createdAt}>
                {DATE.format(new Date(request.data.createdAt))}
              </time>
            </p>

            {request.data.descriptionMd ? (
              <div className="mt-5">
                <MarkdownBody value={request.data.descriptionMd} />
              </div>
            ) : null}

            <h3 className="mt-8 text-[12px] font-bold tracking-wider text-(--el-text-secondary) uppercase">
              Discussion
            </h3>
            {request.data.comments.length === 0 ? (
              <p className="mt-3 text-[13px] text-(--el-text-secondary)">
                No comments yet.
              </p>
            ) : (
              <ul className="mt-3">
                {request.data.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="flex gap-2.5 border-t border-(--el-border) py-3.5"
                  >
                    <span
                      aria-hidden
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-(--radius-badge) bg-(--el-tint-lavender) text-[11px] font-semibold text-(--el-text-strong)"
                    >
                      {initials(comment.author.name)}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold text-(--el-text)">
                        {comment.author.name}
                      </span>
                      <time
                        dateTime={comment.createdAt}
                        className="ml-1.5 text-[12px] text-(--el-text-secondary)"
                      >
                        {DATE.format(new Date(comment.createdAt))}
                      </time>
                      <div className="mt-1 text-[13px] leading-[1.6] text-(--el-text-secondary)">
                        <MarkdownBody value={comment.bodyMd} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* The composer's PLACE, per this card's boundary. MOTIR-4119 turns
                the sentence into the hand-off link AMENDMENT 4 row 5 specifies. */}
            {/* Row 5 — the COMMENT hand-off (MOTIR-4119). */}
            <div className="mt-5 rounded-(--radius-card) border border-dashed border-(--el-border-strong) bg-(--el-surface-soft) p-4">
              <p className="text-[13px] text-(--el-text-secondary)">
                Adding to this discussion signs you in on{' '}
                <strong className="text-(--el-text)">app.motir.co</strong> and
                brings you back to this request.
              </p>
              <p className="mt-2.5">
                <Link
                  href={actHref('comment', identifier, returnPath)}
                  className="inline-flex h-(--height-btn-sm) items-center rounded-(--radius-btn) border border-(--el-border-strong) bg-(--el-page-bg) px-3 text-[13px] font-medium text-(--el-text) hover:bg-(--el-surface)"
                >
                  Add a comment&nbsp;<span aria-hidden>↗</span>
                </Link>
              </p>
            </div>
          </div>

          <aside className="text-[13px] text-(--el-text-secondary)">
            <div>
              <h3 className="mb-2 text-[12px] font-bold tracking-wider uppercase">
                Demand
              </h3>
              <p className="text-[14px] text-(--el-text)">
                {request.data.voteCount.toLocaleString('en')} upvotes
              </p>
              {/* Row 4 — the UPVOTE hand-off (MOTIR-4119). */}
              <p className="mt-2">
                <Link
                  href={actHref('upvote', identifier, returnPath)}
                  className="inline-flex items-center gap-1.5 rounded-(--radius-badge) border border-(--el-border-strong) bg-(--el-page-bg) px-2.5 py-1 text-[12px] text-(--el-text-secondary) hover:border-(--el-accent) hover:text-(--el-text)"
                >
                  <span aria-hidden className="text-[10px]">
                    ▲
                  </span>
                  Upvote&nbsp;<span aria-hidden>↗</span>
                </Link>
              </p>
              <p className="mt-1.5 text-[12px]">
                Upvoting happens on app.motir.co and returns you here.
              </p>
            </div>
            <div className="mt-5">
              <h3 className="mb-2 text-[12px] font-bold tracking-wider uppercase">
                Ask for something
              </h3>
              <p>
                <Link
                  href={actHref('request', identifier, returnPath)}
                  className="text-(--el-link) hover:underline"
                >
                  Request a feature ↗
                </Link>
              </p>
            </div>
          </aside>
        </article>
      )}
    </>
  )
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}
