import { copy } from '@/lib/copy'
import { DocsNav } from '../../_components/DocsNav'

/*
 * The MCP tool catalogue (MOTIR-4046) — committed, reproduced from motir-core's
 * published docs. The AUTHORITATIVE list is the live `tools/list` on the MCP
 * server; this page names the groups and the key tools, and points readers at
 * the live surface for the complete set.
 */

const GROUPS: { name: string; tools: string[] }[] = [
  {
    name: 'Work items',
    tools: [
      'get_work_item',
      'create_work_item',
      'update_work_item',
      'transition_status',
      'search_work_items',
      'archive_work_item',
    ],
  },
  {
    name: 'Planning',
    tools: [
      'create_plan',
      'add_plan_items',
      'update_plan_item',
      'validate_plan',
      'expand_item',
    ],
  },
  {
    name: 'Dispatch & runs',
    tools: [
      'next_ready',
      'claim_work_item',
      'dispatch_prompt',
      'link_pull_request',
      'mark_integrated',
    ],
  },
  {
    name: 'Sprints',
    tools: [
      'list_sprints',
      'create_sprint',
      'move_to_sprint',
      'start_sprint',
      'complete_sprint',
    ],
  },
  {
    name: 'Lessons & designs',
    tools: ['search_lessons', 'add_lesson', 'publish_design_result'],
  },
]

export default function McpToolsPage() {
  return (
    <>
      <DocsNav current="/docs/mcp/tools" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.mcpTools}
      </h1>
      <p className="mt-2 text-[13px] text-(--el-text-secondary)">
        The authoritative, complete list is the server&apos;s live{' '}
        <code className="font-(family-name:--font-mono) text-[13px]">
          tools/list
        </code>
        ; this page names the groups and the tools you will reach for most.
      </p>
      {GROUPS.map((group) => (
        <section key={group.name} className="mt-8">
          <h2 className="font-(family-name:--font-serif) text-lg font-semibold text-(--el-text)">
            {group.name}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {group.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-(--radius-badge) border border-(--el-border-soft) bg-(--el-surface) px-(--spacing-chip-x) py-(--spacing-chip-y) font-(family-name:--font-mono) text-[12px] text-(--el-text-secondary)"
              >
                {tool}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
