import Link from 'next/link'
import { copy } from '@/lib/copy'
import { DocsNav } from './_components/DocsNav'

/*
 * The docs index (MOTIR-4046) — the landing page for the eight surfaces,
 * matching motir-core's published grouping.
 */

export default function DocsIndexPage() {
  const groups = [
    {
      heading: copy.docs.api,
      items: [
        {
          href: '/docs/api',
          title: copy.docs.api,
          body: 'The public read API — every endpoint, parameter and status, generated from the served OpenAPI document.',
        },
        {
          href: '/docs/api/getting-started',
          title: copy.docs.apiGettingStarted,
          body: 'The five-step path from a token to your first request.',
        },
        {
          href: '/docs/api/stability',
          title: copy.docs.apiStability,
          body: 'Versioning, deprecation and what a breaking change is.',
        },
      ],
    },
    {
      heading: copy.docs.mcp,
      items: [
        {
          href: '/docs/mcp',
          title: copy.docs.mcp,
          body: 'The Model Context Protocol server agents and the CLI call.',
        },
        {
          href: '/docs/mcp/tools',
          title: copy.docs.mcpTools,
          body: 'Every tool the server exposes, with its scope and grant.',
        },
      ],
    },
    {
      heading: copy.docs.cli,
      items: [
        {
          href: '/docs/cli',
          title: copy.docs.cli,
          body: 'The command-line client and what it automates.',
        },
        {
          href: '/docs/sandbox',
          title: copy.docs.sandbox,
          body: 'The hosted sandbox an agent runs work in.',
        },
      ],
    },
  ]

  return (
    <>
      <DocsNav />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.indexTitle}
      </h1>
      <p className="mt-2 max-w-[40rem] text-[14px] leading-relaxed text-(--el-text-secondary)">
        {copy.docs.indexIntro}
      </p>

      {groups.map((group) => (
        <section key={group.heading} className="mt-8">
          <h2 className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text)">
            {group.heading}
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-(--el-border) border-y border-(--el-border)">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 py-4 hover:bg-(--el-surface-soft)"
                >
                  <span className="text-[14px] font-semibold text-(--el-text)">
                    {item.title}
                  </span>
                  <span className="text-[13px] text-(--el-text-secondary)">
                    {item.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
