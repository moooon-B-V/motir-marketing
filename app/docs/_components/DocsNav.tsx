import Link from 'next/link'
import { copy } from '@/lib/copy'

/*
 * The docs sub-navigation (MOTIR-4046) — the crawlable links between the eight
 * surfaces, matching motir-core's published grouping (API reference · MCP ·
 * CLI · Sandbox).
 */

const GROUPS: { heading: string; items: { href: string; label: string }[] }[] =
  [
    {
      heading: copy.docs.api,
      items: [
        { href: '/docs/api', label: copy.docs.api },
        {
          href: '/docs/api/getting-started',
          label: copy.docs.apiGettingStarted,
        },
        { href: '/docs/api/stability', label: copy.docs.apiStability },
      ],
    },
    {
      heading: copy.docs.mcp,
      items: [
        { href: '/docs/mcp', label: copy.docs.mcp },
        { href: '/docs/mcp/tools', label: copy.docs.mcpTools },
      ],
    },
    {
      heading: copy.docs.cli,
      items: [
        { href: '/docs/cli', label: copy.docs.cli },
        { href: '/docs/sandbox', label: copy.docs.sandbox },
      ],
    },
    {
      // MOTIR-4227 — the only guide written for a CUSTOMER at their registrar
      // rather than for someone integrating with Motir, which is why it takes a
      // heading of its own instead of joining a group whose siblings are all
      // developer surfaces.
      heading: copy.docs.publicAddress,
      items: [{ href: '/docs/public-address', label: copy.docs.publicAddress }],
    },
  ]

export function DocsNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Docs" className="mb-8 flex flex-wrap gap-x-5 gap-y-1">
      <Link
        href="/docs"
        className={
          current === undefined
            ? 'text-[13.5px] font-semibold text-(--el-accent-on-surface)'
            : 'text-[13.5px] text-(--el-text-secondary) hover:text-(--el-text)'
        }
      >
        {copy.docs.indexTitle}
      </Link>
      {GROUPS.flatMap((group) => group.items).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={current === item.href ? 'page' : undefined}
          className={
            current === item.href
              ? 'text-[13.5px] font-semibold text-(--el-accent-on-surface)'
              : 'text-[13.5px] text-(--el-text-secondary) hover:text-(--el-text)'
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
