import { copy } from '@/lib/copy'
import type { ProductSlug } from '@/lib/destinations'

/*
 * Motir's products, as the Products menu and the product pages show them
 * (2026-10 redesign): three groups — the AI products, the tooling that brings
 * Motir into the tools people already use, and the infrastructure agents run
 * on — each product with its name, its one line and its mark colour.
 */

export type ProductItem = { slug: ProductSlug; name: string; blurb: string }

const item = (
  slug: ProductSlug,
  key: keyof typeof copy.nav.productItems,
): ProductItem => ({ slug, ...copy.nav.productItems[key] })

export const productGroups: ReadonlyArray<{
  label: string
  items: ReadonlyArray<ProductItem>
}> = [
  {
    label: copy.nav.productGroups.ai,
    items: [
      item('ai-planner', 'aiPlanner'),
      item('project-management', 'projectManagement'),
      item('project-manager', 'projectManager'),
      item('ai-debugging', 'aiDebugging'),
    ],
  },
  {
    label: copy.nav.productGroups.tooling,
    items: [
      item('mcp', 'mcp'),
      item('cli', 'cli'),
      item('claude-code-connector', 'claudeCodeConnector'),
      item('claude-code-plugin', 'claudeCodePlugin'),
    ],
  },
  {
    label: copy.nav.productGroups.infrastructure,
    items: [
      item('agent-fleet', 'agentFleet'),
      item('agent-hosting', 'agentHosting'),
      item('sandbox', 'sandbox'),
    ],
  },
]

export const productItems: ReadonlyArray<ProductItem> = productGroups.flatMap(
  (group) => group.items,
)

/** A product by its slug, with the label of the group it belongs to. */
export function productOf(slug: ProductSlug): ProductItem & { group: string } {
  for (const group of productGroups) {
    const found = group.items.find((product) => product.slug === slug)
    if (found) return { ...found, group: group.label }
  }
  throw new Error(`Unknown product: ${slug}`)
}

/**
 * Each product's mark colour — the small square beside its name in the
 * Products menu and on its own page. One design-system token per product
 * (`--el-product-<slug>`), so a palette re-skins every mark.
 */
export const PRODUCT_MARK: Record<ProductSlug, string> = {
  'ai-planner': 'bg-(--el-product-ai-planner)',
  'project-management': 'bg-(--el-product-project-management)',
  'project-manager': 'bg-(--el-product-project-manager)',
  'ai-debugging': 'bg-(--el-product-ai-debugging)',
  mcp: 'bg-(--el-product-mcp)',
  cli: 'bg-(--el-product-cli)',
  'claude-code-connector': 'bg-(--el-product-claude-code-connector)',
  'claude-code-plugin': 'bg-(--el-product-claude-code-plugin)',
  'agent-fleet': 'bg-(--el-product-agent-fleet)',
  'agent-hosting': 'bg-(--el-product-agent-hosting)',
  sandbox: 'bg-(--el-product-sandbox)',
}
