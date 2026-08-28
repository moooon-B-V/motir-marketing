import en from '@/messages/en.json'

/**
 * The copy catalogue, wired (MOTIR-1152). `messages/en.json` is MOTIR-1144's
 * artifact and stayed unread until this card — its own README says the wiring
 * "arrives with MOTIR-1152".
 *
 * ⚠️ A PLAIN TYPED IMPORT, NOT `next-intl`, AND THAT IS A DECISION. The
 * catalogue's arrangement mirrors motir-core's so copy can be swept across both
 * in one pass, but motir-core needs `next-intl` for a reason this site does not
 * have: a locale segment, a request-scoped locale and server/client boundaries
 * around `getTranslations`. motir.co ships ONE locale and one page. A static
 * import gives full type inference over the key set for free, adds no runtime,
 * and leaves the arrangement — `messages/<locale>.json`, one namespace per
 * surface — exactly as a later locale would need it. Adding `next-intl` is
 * then a wiring change against an unchanged catalogue, which is the cheap
 * direction; shipping it now would be a routing dependency bought for nothing.
 */
export const copy = en

/**
 * Fill `{name}` placeholders. Two strings carry them — the character counter
 * and the copyright year — and a template literal in the component would put
 * half of each sentence back in the JSX, which is the thing the catalogue
 * exists to prevent.
 */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  )
}
