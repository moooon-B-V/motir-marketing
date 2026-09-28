/*
 * The link-preview (OG) cards' non-brand colours — motir-core
 * `design/brand/design-notes.md` §10, "§6 amended — OG template" (MOTIR-6473).
 *
 * ⚠️ WHY THESE ARE LITERALS HERE AND NOT IN `@motir/brand`. The design table
 * names exactly one brand constant on an OG card, the glyph's
 * `BRAND_GLYPH_HEX`, and that one arrives from the package. The wash and the
 * three text inks are ordinary palette values the card happens to need as
 * literals, because `ImageResponse` renders outside the CSS tree and cannot read
 * a custom property. Each names the Motir-light token it resolves.
 *
 * They live in ONE module rather than inline in both routes so the two cards
 * cannot drift apart, and so `tests/brand/ogColours.test.ts` can hold every ink
 * to its contrast bar against the wash it sits on.
 */

/** `--color-tint-lavender` → `--color-tint-sky`, the 135° canvas wash. */
export const OG_WASH_FROM_HEX = '#e4e6f3'
export const OG_WASH_TO_HEX = '#dde9f6'
export const OG_WASH = `linear-gradient(135deg, ${OG_WASH_FROM_HEX} 0%, ${OG_WASH_TO_HEX} 100%)`

/** `--el-text` — the wordmark and the headline. */
export const OG_TEXT_HEX = '#16191d'

/** `--el-text-secondary` — the lede, and the project card's eyebrow. */
export const OG_TEXT_SECONDARY_HEX = '#565c64'
