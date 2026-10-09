import { visitorViewRedirect } from '@/lib/publicProject'

/**
 * `/p/<identifier>/roadmap` — a retired read page (MOTIR-6743). It answers a
 * permanent redirect to the same path on the app, where the Visitor's live view
 * lives; `lib/publicProject.ts`'s `visitorViewRedirect` carries the rules. The
 * host router rewrites a customer-owned address onto this same tree, so one
 * handler answers motir.co, a workspace subdomain and a custom domain alike.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ identifier: string }> },
): Promise<Response> {
  const { identifier } = await params
  return visitorViewRedirect(identifier, 'roadmap')
}

export const HEAD = GET
