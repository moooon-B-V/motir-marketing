/*
 * WHAT DOES THIS SITE ACTUALLY PAINT? — the reader that turns a rendered
 * component tree into the set of ink/surface pairs it puts on screen
 * (MOTIR-3984).
 *
 * ⚠️ WHY THIS EXISTS BESIDE `tests/aaMatrix.test.ts` RATHER THAN INSIDE IT. The
 * matrix rules on a LIST of pairs, and a list has to be written by somebody who
 * already knows which pairs to write — so it certifies the question that
 * prompted it and stays silent about everything else, while reading as a clean
 * bill of health for the whole surface. That has now failed three times in three
 * days on this repository (MOTIR-3874, MOTIR-3931, MOTIR-3984), each time on a
 * pair the assets or the components genuinely drew. The only reader that cannot
 * make that mistake is one that starts from the ELEMENTS.
 *
 * ⚠️ SCOPE, STATED RATHER THAN IMPLIED — the same discipline `themeTokens.ts`
 * applies to `@media`. This reads the DEFAULT state: an unprefixed
 * `text-(--el-*)` / `bg-(--el-*)`, plus `placeholder:text-(--el-*)` because a
 * placeholder is body text a reader has to read. A variant-scoped ink or
 * surface (`hover:`, `focus-visible:`, `dark:`) is NOT resolved, because
 * pairing them correctly means knowing which variants are live together and
 * that is a second mechanism. The default state is the strict reading for
 * everything this site currently paints; a variant pair is a widening to make
 * deliberately, not one to infer from silence.
 *
 * ⚠️ IT READS CLASSES, NOT COMPUTED STYLE, and that is a requirement rather
 * than a shortcut: jsdom computes no `var()` and resolves no Tailwind, so
 * `getComputedStyle` here returns nothing about the design layer. Reading the
 * class list is exact for this site because every colour it paints is a Tier-3
 * `--el-*` reference through Tailwind's arbitrary-property syntax —
 * `tests/designShowcaseSource.test.ts` is the test that keeps that true — and
 * because `tailwind-merge` collapses conflicting `bg-` utilities before render,
 * so the class list carries the WINNING surface and not the overridden one.
 * That is what makes a `<Card className="bg-(--el-page-bg)">` read as
 * `--el-page-bg` rather than as the `--el-card` its variant declares.
 */

const INK = /^text-\((--el-[a-z0-9-]+)\)$/
const PLACEHOLDER_INK = /^placeholder:text-\((--el-[a-z0-9-]+)\)$/
const SURFACE = /^bg-\((--el-[a-z0-9-]+)\)$/

export interface PaintedPair {
  /** The `--el-*` colour token the text resolves to. */
  ink: string
  /** The `--el-*` token of the nearest ancestor that paints an opaque fill. */
  surface: string
  /** A short DOM path, so a failure names the element rather than a number. */
  where: string
  /** The first few words on screen — the thing a reader would look for. */
  text: string
}

function tokenOn(el: Element, pattern: RegExp): string | null {
  for (const name of el.classList) {
    const m = pattern.exec(name)
    if (m) return m[1]
  }
  return null
}

/** The nearest self-or-ancestor value, or `null` when nothing declares one. */
function inherited(
  el: Element,
  root: Element,
  pattern: RegExp,
): { token: string; node: Element } | null {
  let node: Element | null = el
  while (node) {
    const token = tokenOn(node, pattern)
    if (token) return { token, node }
    if (node === root) break
    node = node.parentElement
  }
  return null
}

function path(el: Element, root: Element): string {
  const parts: string[] = []
  let node: Element | null = el
  while (node) {
    const cls = [...node.classList]
      .filter((c) => INK.test(c) || SURFACE.test(c) || /^[a-z-]+$/.test(c))
      .slice(0, 2)
    parts.unshift(node.tagName.toLowerCase() + (cls.length ? `.${cls[0]}` : ''))
    if (node === root) break
    node = node.parentElement
  }
  return parts.slice(-4).join(' > ')
}

/** Does this element own a text node of its own, rather than only children? */
function ownsText(el: Element): boolean {
  for (const child of el.childNodes) {
    if (child.nodeType === 3 && (child.textContent ?? '').trim()) return true
  }
  return false
}

/**
 * Every ink/surface pair the tree under `root` paints, one entry per
 * text-bearing element.
 *
 * `rootSurface` / `rootInk` are what the document itself carries —
 * `--el-page-bg` and `--el-text` for both of this site's pages, which each open
 * with exactly those two on one `<div>`. They are parameters rather than
 * constants so that rendering a FRAGMENT (one component on its own) still has
 * to state what it was mounted on, instead of quietly measuring against white.
 */
export function paintedPairs(
  root: Element,
  { rootSurface = '--el-page-bg', rootInk = '--el-text' } = {},
): PaintedPair[] {
  const out: PaintedPair[] = []
  const scan = (el: Element, asPlaceholder: boolean) => {
    const ink = asPlaceholder
      ? inherited(el, root, PLACEHOLDER_INK)
      : (inherited(el, root, INK) ?? { token: rootInk, node: root })
    if (!ink) return
    const surface = inherited(el, root, SURFACE)
    out.push({
      ink: ink.token,
      surface: surface ? surface.token : rootSurface,
      where: path(el, root),
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 48),
    })
  }
  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (ownsText(el)) scan(el, false)
    if (tokenOn(el, PLACEHOLDER_INK) && 'placeholder' in el) scan(el, true)
  }
  return out
}

/** The distinct ink/surface pairs, each with one element as its witness. */
export function distinctPairs(pairs: PaintedPair[]): PaintedPair[] {
  const seen = new Map<string, PaintedPair>()
  for (const pair of pairs) {
    const key = `${pair.ink} on ${pair.surface}`
    if (!seen.has(key)) seen.set(key, pair)
  }
  return [...seen.values()]
}
