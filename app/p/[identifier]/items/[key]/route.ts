import { visitorViewRedirect } from '@/lib/publicProject'

/**
 * `/p/<identifier>/items/<KEY>` — a retired read page (MOTIR-6743). It answers a
 * permanent redirect to the same work item in the app, where the Visitor reads
 * it; `lib/publicProject.ts`'s `visitorViewRedirect` carries the rules.
 *
 * ⚠️ `key` IS THE FULL IDENTIFIER (`MOTIR-42`), passed through verbatim — the
 * app's Visitor route takes the same segment.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ identifier: string; key: string }> },
): Promise<Response> {
  const { identifier, key } = await params
  return visitorViewRedirect(identifier, 'items', key)
}

export const HEAD = GET
