import {
  fetchOpenApiSpec,
  listOperations,
  railOperations,
  type RailOperation,
} from '@/lib/docs'
import { DocsShell } from '../_components/DocsShell'

/*
 * The API sub-area (MOTIR-4396) — `/docs/api`, `/docs/api/getting-started` and
 * `/docs/api/stability`. The one place the rail carries the operation tier.
 *
 * ⚠️ THIS LAYOUT IS THE ROUTE-PREFIX RULE. The design asset says tiers 2 and 3
 * render if and only if the route is `/docs/api` or below; a server layout
 * cannot read a pathname, so the rule is the file's LOCATION rather than a
 * condition. Next renders this layout for exactly those routes, so exactly
 * those routes get operations — including the two prose pages under the prefix,
 * which is what the asset draws.
 *
 * ⚠️ THE FETCH IS SHARED WITH THE PAGE, NOT DUPLICATED. `fetchOpenApiSpec` is
 * memoized with React `cache` (MOTIR-4396), so this layout and
 * `app/docs/api/page.tsx` read ONE 720 KB document per request and see the same
 * bytes — which is also what guarantees the rail's anchors match the sections
 * the page renders.
 *
 * ⚠️ AND IT DEGRADES THE WAY THE ASSET DRAWS IT. When the document is
 * unreachable the rail still renders its page links — panel 6 — because those
 * are this repository's own and are always renderable. Blanking the whole rail
 * would strand a reader on the one page that failed; the page itself says what
 * went wrong.
 */
export default async function DocsApiLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let operations: { group: string; operations: RailOperation[] }[]
  try {
    operations = railOperations(listOperations(await fetchOpenApiSpec()))
  } catch {
    operations = []
  }
  return <DocsShell operations={operations}>{children}</DocsShell>
}
