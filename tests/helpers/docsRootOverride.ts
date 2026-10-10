/*
 * Where `resolveDocsDocument` reads from, for a test that renders the shipped
 * pages over a TEMPORARY copy of `content/docs/` (MOTIR-8051). No imports on
 * purpose: the test's `vi.mock('@/lib/docsDocuments', …)` factory reads this
 * module, and a helper that itself imported the mocked module would be a cycle.
 */
let override: string | undefined

export const docsRootOverride = (): string | undefined => override
export const setDocsRootOverride = (root: string | undefined): void => {
  override = root
}
