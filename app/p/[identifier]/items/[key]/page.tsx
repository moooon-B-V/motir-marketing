import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  deriveDescription,
  loadProject,
  loadWorkItem,
} from '@/lib/publicProject'
import {
  publicPathFor,
  publicUrlFor,
  redirectIfNotPrimary,
  requestPublicHost,
} from '@/lib/publicHost'
import { MarkdownBody } from '@/app/legal/_components/MarkdownBody'
import { ProjectHeader } from '../../_components/ProjectHeader'
import { ErrorState } from '../../_components/States'
import { StatusPill } from '../../_components/Rows'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ identifier: string; key: string }>
}): Promise<Metadata> {
  const { identifier, key } = await params
  // ⚠️ THE PROJECT IS READ HERE TOO, because the canonical is a property of the
  // PROJECT (its primary address) and this route's own read returns an item.
  // Next memoises identical `fetch`es within one render, so the page's own
  // `loadProject` below is the same request rather than a second one.
  const [project, read] = await Promise.all([
    loadProject(identifier),
    loadWorkItem(identifier, key),
  ])
  if (read.status !== 'ok' || project.status !== 'ok') return {}

  const item = read.data
  const url = publicUrlFor(
    project.data,
    `items/${encodeURIComponent(item.identifier)}`,
  )
  return {
    title: `${item.identifier} · ${item.title}`,
    description: deriveDescription(item.descriptionMd, item.title),
    alternates: { canonical: url },
    openGraph: { type: 'article', url, siteName: 'Motir' },
  }
}

/**
 * ONE WORK ITEM (MOTIR-4117) — the deep link a changelog entry, a roadmap card
 * and an items row all point at.
 *
 * ⚠️ THE 404 AND THE OUTAGE STAY APART, as everywhere on this surface. A missing
 * item, a cross-project one, an archived one, a triage one and a private epic's
 * hidden descendant all arrive as the same `not-found` — deliberately
 * indistinguishable, because telling them apart is an existence oracle — and all
 * of them are a real 404 a crawler must see. An unreachable API is the error
 * state instead.
 */
export default async function PublicWorkItemPage({
  params,
}: {
  params: Promise<{ identifier: string; key: string }>
}) {
  const { identifier, key } = await params
  // Read once, at the top of the route — `lib/publicHost.ts` carries why.
  const host = await requestPublicHost()
  const [project, item] = await Promise.all([
    loadProject(identifier),
    loadWorkItem(identifier, key),
  ])

  if (project.status === 'not-found' || item.status === 'not-found') notFound()
  if (project.status === 'failed')
    return <ErrorState what="this project" host={host} />

  await redirectIfNotPrimary(
    project.data,
    host,
    `items/${encodeURIComponent(key)}`,
  )

  return (
    <>
      <ProjectHeader project={project.data} current="items" host={host} />

      {item.status === 'failed' ? (
        <ErrorState what="this work item" identifier={identifier} host={host} />
      ) : (
        <article className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div>
            <p className="mb-5 text-[13px]">
              <Link
                href={publicPathFor(host, identifier, 'items')}
                className="text-(--el-text-secondary) hover:text-(--el-link)"
              >
                ← {project.data.name} · Work items
              </Link>
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-(family-name:--font-mono) text-[12px] text-(--el-text-secondary)">
                {item.data.identifier}
              </span>
              <StatusPill
                status={item.data.statusLabel}
                category={item.data.statusCategory}
              />
            </div>
            <h2 className="mt-1.5 font-(family-name:--font-serif) text-[24px] leading-tight font-bold text-(--el-text)">
              {item.data.title}
            </h2>

            {item.data.descriptionMd ? (
              <div className="mt-5">
                <MarkdownBody value={item.data.descriptionMd} />
              </div>
            ) : (
              <p className="mt-5 text-[14px] text-(--el-text-secondary)">
                This item has no public description.
              </p>
            )}
          </div>

          <aside className="text-[13px] text-(--el-text-secondary)">
            <Side title="Parent">
              {item.data.parent ? (
                <Link
                  href={publicPathFor(
                    host,
                    identifier,
                    `items/${encodeURIComponent(item.data.parent.identifier)}`,
                  )}
                  className="text-(--el-link) hover:underline"
                >
                  {item.data.parent.identifier} · {item.data.parent.title}
                </Link>
              ) : (
                'None — this is a root.'
              )}
            </Side>

            <Side title="Children">
              {item.data.childrenHidden ? (
                'Hidden — this epic is not public.'
              ) : item.data.childCount === 0 ? (
                'None'
              ) : (
                <>
                  <ul>
                    {item.data.children.map((child) => (
                      <li key={child.id} className="py-1">
                        <Link
                          href={publicPathFor(
                            host,
                            identifier,
                            `items/${encodeURIComponent(child.identifier)}`,
                          )}
                          className="hover:text-(--el-link)"
                        >
                          {child.identifier} · {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {/* ⚠️ `children` is a PAGE, not the child set. Saying so, and
                      pointing at the tree, is what keeps a truncated list from
                      reading as a complete one. */}
                  {item.data.childrenHasMore ? (
                    <p className="mt-1.5">
                      <Link
                        href={`${publicPathFor(host, identifier, 'tree')}?parentId=${encodeURIComponent(item.data.id)}`}
                        className="text-(--el-link) hover:underline"
                      >
                        All {item.data.childCount} in the tree
                      </Link>
                    </p>
                  ) : null}
                </>
              )}
            </Side>

            <Side title="Kind">{item.data.kind}</Side>
          </aside>
        </article>
      )}
    </>
  )
}

function Side({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-5 first:mt-0">
      <h3 className="mb-2 text-[12px] font-bold tracking-wider text-(--el-text-secondary) uppercase">
        {title}
      </h3>
      <div className="leading-[1.6]">{children}</div>
    </div>
  )
}
