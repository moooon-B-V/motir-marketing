/*
 * The two published lists of the stability policy (MOTIR-4429), beside the
 * page that renders them. They live in their own module because a Next page
 * file may export only Next's own fields: the webpack build's type check
 * refuses any other named export (MOTIR-7952 moved the build to webpack).
 * `tests/docs/apiGuide.test.tsx` pins their membership.
 */

/**
 * Allowed inside `v1`, without notice — the published list, in the deleted
 * page's own order and wording.
 */
export const POLICY_ADDITIVE: readonly string[] = [
  'A new endpoint.',
  'A new OPTIONAL query parameter.',
  'A new field on a response object.',
  'A new response header.',
  'A new value on a field documented as open-ended.',
  'A raised rate-limit budget.',
]

/** Forbidden inside `v1` — each of these needs a new major. */
export const POLICY_FORBIDDEN: readonly string[] = [
  'Removing a field.',
  'Renaming a field.',
  'Changing a field’s type or nullability.',
  'Removing or re-purposing an error `code`.',
  'Changing an existing status for an existing condition.',
  'Tightening a limit.',
  'Making an optional parameter required.',
]
