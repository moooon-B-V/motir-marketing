/*
 * MOTIR-4001 — the design-asset INK CONTRAST scan for `design/marketing/**`.
 *
 * ── Why this is not motir-core's scanner ────────────────────────────────────
 * `motir-core/tests/theme/inkContrastMockScan.ts` is the obvious thing to copy
 * and it is STRUCTURALLY BLIND to this repository's defect. Its muted arm
 * resolves a surface with `ownSurface`, which returns a token NAME (a
 * `bg-(--el-*)` utility, an inline or stylesheet `background: var(--el-*)`) and
 * `null` for anything else, then rules that name against a list of `--el-*`
 * surfaces. Both mocks here paint their annotation board on
 * `body { background: #f4f3f1 }` — a raw scaffold colour the assets own
 * outright — so the walk resolves `null` at every site and abstains. Measured
 * against the 54 sites MOTIR-3985 swept, that port reports ZERO. Two of those
 * sites were not an `--el-*` INK either (`#1aae39`, `#e03131`), which no arm of
 * it rules on.
 *
 * A guard whose blind spot is exactly the population it was installed for
 * reads as a verdict. So this scan is TOTAL BY CONSTRUCTION: it starts from the
 * ELEMENTS the document actually paints, not from a list of token pairs, and a
 * raw hex is measured exactly like a token.
 *
 * ── Why a browser, and why not jsdom ────────────────────────────────────────
 * jsdom is already a devDependency and the root suite already runs on it, so it
 * is the first thing to reach for. Probed against `design-showcase.mock.html`
 * it applies the class cascade for `color` and then drops two things this scan
 * cannot do without: it does not expand a `font:` SHORTHAND (`.rule`'s
 * `font: 600 10px …` reads back as `16px`/`normal`, so every 1.4.3 large-text
 * call is wrong) and it does not apply `background: var(--el-page-bg)`
 * (`.frame` reads back `rgba(0,0,0,0)`, so the surface walk resolves the sheet
 * where the asset paints white). Both failures are silent and both under-report.
 *
 * ── What it rules on, and what it does not ──────────────────────────────────
 * RULES ON: every element carrying its own text node, AND `::before` /
 * `::after` generated content — which `document.querySelectorAll('*')` cannot
 * reach, and which is where `design-showcase.mock.html` draws its fold line
 * (`.fold::after`, a raw `#e03131` clearing 1.4.3 by 0.01).
 *
 * MODELS: `opacity` on the element and every ancestor, as a cumulative factor
 * on the ink AND on each background layer. This is not decoration —
 * `landing.mock.html` paints one `.btn[disabled] { opacity: 0.72 }`, and
 * ignoring it under-reports that site by 1.3:1. The direction matters: an
 * unmodelled fade always reads BETTER than it paints.
 *
 * DOES NOT RULE ON, stated rather than discovered:
 *   - background IMAGES and gradients — a fill this scan cannot read a colour
 *     out of. Neither asset paints text over one.
 *   - 1.4.11 non-text contrast, and 1.4.1 use-of-colour. Both are authoring
 *     obligations held by `design/marketing/design-notes.md`.
 *
 * ── The STATE arm (MOTIR-5448) ──────────────────────────────────────────────
 * Everything above measures the document AS IT RESTS, and nobody reads a mock
 * at rest: a `:hover` rule repaints an ink or the surface under it, and it
 * paints a pair the resting walk never sees — onto exactly the tinted surfaces
 * (`--el-muted`, `--el-surface-soft`) this repository's contrast defects were
 * found on. motir-core's MOTIR-453 was a HOVERED row at 4.37:1.
 *
 * So after the resting walk, every `:hover` / `:focus-visible` / `:focus` /
 * `:active` rule that sets `color`, `background` or `opacity` is REWRITTEN in
 * place to an attribute selector (`[data-motir-state~="hover"]`) — same
 * specificity, same sheet, same position in the cascade — and each element the
 * rule can put into that state is switched into it ONE AT A TIME and its own
 * text and its descendants' text re-measured by the same walk.
 *
 * Why a rewrite and not `page.hover()`: a real pointer hovers whatever is on
 * top at that coordinate, needs the element scrolled into a viewport and
 * un-overlapped, and cannot hold `:active`. The rewrite is exact about WHICH
 * element is in the state, and it is what the browser's own cascade then paints.
 * `:hover` and `:active` also match every ANCESTOR of the hovered element, so the
 * attribute is set up the chain for those two; the focus states are the
 * element's alone.
 *
 * The population is read from `document.styleSheets`, never listed: a state
 * rule added to any mock is measured by the next run. A sheet this scan cannot
 * read (a cross-origin `<link>`) or a selector the browser refuses to rewrite is
 * REPORTED, not skipped, because either one is a rule silently unmeasured.
 */
import { chromium, type Browser, type Page } from 'playwright'
import { pathToFileURL } from 'node:url'

/** One text site the document paints, with the verdict for it. */
export type InkSite = {
  /** The asset the site was found in, as its basename. */
  file: string
  /** `tag.class.class`, plus the pseudo-element when the site is one. */
  selector: string
  /** `'::before'` / `'::after'`, or `null` for an element's own text node. */
  pseudo: string | null
  /** The first 40 characters of the text, for a report a human can locate. */
  text: string
  fontPx: number
  fontWeight: number
  /** Resolved ink and effective background, `#rrggbb`. */
  color: string
  background: string
  /** Contrast ratio, rounded to 2dp — the number the verdict is taken on. */
  ratio: number
  /** 3 for WCAG large text, 4.5 otherwise. */
  threshold: number
}

/**
 * The in-page walk. Self-contained on purpose: it is serialised into the page,
 * so it may not close over an import, a helper or a type from this module.
 */
/* c8 ignore start -- runs inside the browser, not under this process */
function collectSites(scopeAttribute: string | null): Omit<InkSite, 'file'>[] {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TITLE', 'NOSCRIPT', 'TEMPLATE'])

  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
  }) as CanvasRenderingContext2D

  /*
   * Resolve ANY CSS colour the browser understands to sRGB bytes by painting
   * it — `rgb()`, `rgba()`, `color(srgb …)`, `color-mix()`, `oklch()`. Parsing
   * the computed string by regex covers the first two and silently mis-reads
   * the rest, and these mocks use `color-mix()` for product tints.
   * `globalCompositeOperation = 'copy'` makes the fill REPLACE the pixel, so
   * the alpha survives instead of compositing onto what was there.
   */
  const paint = (css: string) => {
    ctx.globalCompositeOperation = 'copy'
    ctx.fillStyle = '#000000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }
  }

  type Rgba = { r: number; g: number; b: number; a: number }

  const over = (top: Rgba, bottom: Rgba): Rgba => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  })

  const hex = (c: Rgba) =>
    '#' +
    [c.r, c.g, c.b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')

  const luminance = (c: Rgba) => {
    const lin = (v: number) => {
      const s = v / 255
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  }

  const contrast = (a: Rgba, b: Rgba) => {
    const la = luminance(a)
    const lb = luminance(b)
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
    return (hi + 0.05) / (lo + 0.05)
  }

  /*
   * The effective background: the pseudo-element's own fill, then the element's
   * and its ancestors', compositing every translucent layer down onto the next
   * until an opaque one is met. The base is the canvas, which is white when
   * nothing in the chain is opaque.
   */
  /*
   * `opacity` composites a whole element — its text and its own fill — onto
   * what is behind it, and it MULTIPLIES down the tree. So a layer's effective
   * alpha is its own alpha times the opacity of every element from its owner up
   * to the root, and the walk stops only when that PRODUCT is opaque.
   */
  const cumulativeOpacity = (el: Element) => {
    let factor = 1
    let node: Element | null = el
    while (node) {
      const own = parseFloat(getComputedStyle(node).opacity)
      if (!Number.isNaN(own)) factor *= own
      node = node.parentElement
    }
    return factor
  }

  const effectiveBackground = (el: Element, pseudo: string | null) => {
    const layers: Rgba[] = []
    if (pseudo) {
      const style = getComputedStyle(el, pseudo)
      const own = paint(style.backgroundColor)
      const alpha = own.a * cumulativeOpacity(el)
      if (alpha > 0) layers.push({ ...own, a: alpha })
      if (alpha >= 1) return layers
    }
    let node: Element | null = el
    while (node) {
      const bg = paint(getComputedStyle(node).backgroundColor)
      const alpha = bg.a * cumulativeOpacity(node)
      if (alpha > 0) layers.push({ ...bg, a: alpha })
      if (alpha >= 1) break
      node = node.parentElement
    }
    return layers
  }

  const flatten = (layers: Rgba[]) => {
    let out: Rgba = { r: 255, g: 255, b: 255, a: 1 }
    for (let i = layers.length - 1; i >= 0; i -= 1) out = over(layers[i], out)
    return out
  }

  const selectorFor = (el: Element, pseudo: string | null) => {
    const classes = Array.from(el.classList)
      .slice(0, 3)
      .map((c) => `.${c}`)
      .join('')
    return `${el.tagName.toLowerCase()}${classes}${pseudo ?? ''}`
  }

  const sites: Omit<InkSite, 'file'>[] = []

  const record = (
    el: Element,
    pseudo: string | null,
    style: CSSStyleDeclaration,
    text: string,
  ) => {
    const declared = paint(style.color)
    const ink = { ...declared, a: declared.a * cumulativeOpacity(el) }
    const layers = effectiveBackground(el, pseudo)
    const background = flatten(layers)
    // A translucent ink sits ON its own background before it is measured.
    const composited = ink.a >= 1 ? ink : over(ink, background)
    const fontPx = parseFloat(style.fontSize)
    const weight = parseInt(style.fontWeight, 10) || 400
    const large = fontPx >= 24 || (fontPx >= 18.66 && weight >= 700)
    sites.push({
      selector: selectorFor(el, pseudo),
      pseudo,
      text: text.trim().replace(/\s+/g, ' ').slice(0, 40),
      fontPx: Math.round(fontPx * 100) / 100,
      fontWeight: weight,
      color: hex(composited),
      background: hex(background),
      ratio: Math.round(contrast(composited, background) * 100) / 100,
      threshold: large ? 3 : 4.5,
    })
  }

  // With a scope, only the element carrying the attribute and its subtree — the
  // state arm's "this element is hovered, re-measure what it paints".
  const elements = scopeAttribute
    ? document.querySelectorAll(`[${scopeAttribute}], [${scopeAttribute}] *`)
    : document.querySelectorAll('*')

  for (const el of Array.from(elements)) {
    if (SKIP.has(el.tagName)) continue
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue

    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? '')
      .join('')
    if (ownText.trim() !== '') record(el, null, style, ownText)

    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(el, pseudo)
      if (ps.display === 'none' || ps.visibility === 'hidden') continue
      // `content` comes back quoted; `none` / `normal` mean there is no box.
      const raw = ps.content
      if (!raw || raw === 'none' || raw === 'normal') continue
      const literal = raw.replace(/^"|"$/g, '')
      if (literal === raw || literal.trim() === '') continue
      record(el, pseudo, ps, literal)
    }
  }

  return sites
}

/** One state rule the document declares, as `prepareStateRules` found it. */
type PreparedRule = {
  /** The rule's selector as AUTHORED, before the rewrite. */
  selector: string
  /** `:hover` / `:focus-visible` / `:focus` / `:active`. */
  state: string
  /** How many elements the rule can put into that state. */
  hosts: number
}

type PreparedStates = {
  rules: PreparedRule[]
  /** One entry per (element, state): the element is tagged `data-motir-host`. */
  hosts: { id: number; state: string; rules: number[] }[]
  /** Sheets whose rules could not be read — each a population silently lost. */
  unreadableSheets: string[]
  /** State selectors the browser refused to rewrite. */
  unrewritten: string[]
}

/**
 * Find every state rule that repaints, rewrite it to an attribute selector, and
 * tag every element it can put into that state. In-page and self-contained, for
 * the same reason `collectSites` is.
 */
function prepareStateRules(): PreparedStates {
  // `:focus` must not also match `:focus-visible` / `:focus-within`.
  const STATE = /:(hover|focus-visible|focus|active)(?![\w-])/g
  const PAINTS = ['color', 'background', 'background-color', 'opacity']

  // A rewritten selector that flips mid-`transition` would be measured between
  // its two paints. Nothing below should animate.
  const still = document.createElement('style')
  still.textContent =
    '*, *::before, *::after { transition: none !important; animation: none !important; }'
  document.head.appendChild(still)

  const out: PreparedStates = {
    rules: [],
    hosts: [],
    unreadableSheets: [],
    unrewritten: [],
  }
  const hostIds = new Map<Element, number>()
  const hostByKey = new Map<string, PreparedStates['hosts'][number]>()

  /** Split a selector list on its TOP-LEVEL commas only (`:is(a, b)` stays whole). */
  const splitList = (list: string) => {
    const parts: string[] = []
    let depth = 0
    let start = 0
    for (let i = 0; i < list.length; i += 1) {
      const ch = list[i]
      if (ch === '(' || ch === '[') depth += 1
      else if (ch === ')' || ch === ']') depth -= 1
      else if (ch === ',' && depth === 0) {
        parts.push(list.slice(start, i).trim())
        start = i + 1
      }
    }
    parts.push(list.slice(start).trim())
    return parts
  }

  const visit = (rule: CSSStyleRule) => {
    const authored = rule.selectorText
    if (!new RegExp(STATE.source).test(authored)) return
    if (!PAINTS.some((p) => rule.style.getPropertyValue(p) !== '')) return

    const found: { index: number; state: string; host: string }[] = []
    for (const selector of splitList(authored)) {
      for (const match of selector.matchAll(STATE)) {
        // The element IN the state is the compound the pseudo-class sits on:
        // `.row:hover .name` hovers `.row`; `.btn.primary:hover` hovers the button.
        const before = selector.slice(0, match.index)
        const tail = selector
          .slice((match.index ?? 0) + match[0].length)
          .match(/^[^\s>+~]*/)?.[0]
        const host = (before + (tail ?? '')).replace(STATE, '').trim()
        const state = `:${match[1]}`
        let index = out.rules.findIndex(
          (r) => r.selector === authored && r.state === state,
        )
        if (index === -1) {
          index = out.rules.push({ selector: authored, state, hosts: 0 }) - 1
        }
        found.push({ index, state, host: host === '' ? '*' : host })
      }
    }

    const rewritten = authored.replace(
      STATE,
      (_, name: string) => `[data-motir-state~="${name}"]`,
    )
    rule.selectorText = rewritten
    if (rule.selectorText === authored) {
      out.unrewritten.push(authored)
      return
    }

    for (const { index, state, host } of found) {
      for (const el of Array.from(document.querySelectorAll(host))) {
        let id = hostIds.get(el)
        if (id === undefined) {
          id = hostIds.size
          hostIds.set(el, id)
          el.setAttribute('data-motir-host', String(id))
        }
        const key = `${id}|${state}`
        let entry = hostByKey.get(key)
        if (!entry) {
          entry = { id, state, rules: [] }
          hostByKey.set(key, entry)
          out.hosts.push(entry)
        }
        if (!entry.rules.includes(index)) {
          entry.rules.push(index)
          out.rules[index].hosts += 1
        }
      }
    }
  }

  const walk = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) visit(rule)
      // `@media`, `@supports`, `@layer` blocks — and a nested style rule's own
      // children — hold rules of their own.
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) walk(nested)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      out.unreadableSheets.push(sheet.href ?? '<inline>')
      continue
    }
    walk(rules)
  }
  return out
}

/** Put one tagged element into (or out of) one state, and scope the walk to it. */
function setState(arg: { id: number; state: string; on: boolean }) {
  const el = document.querySelector(`[data-motir-host="${arg.id}"]`)
  if (!el) return
  const name = arg.state.slice(1)
  // A hovered or pressed element makes every ancestor `:hover` / `:active` too.
  const chain: Element[] = []
  let node: Element | null = el
  while (node) {
    chain.push(node)
    if (name !== 'hover' && name !== 'active') break
    node = node.parentElement
  }
  for (const target of chain) {
    if (arg.on) target.setAttribute('data-motir-state', name)
    else target.removeAttribute('data-motir-state')
  }
  if (arg.on) el.setAttribute('data-motir-scope', '')
  else el.removeAttribute('data-motir-scope')
}
/* c8 ignore stop */

/** A text site measured while an element is in a state. */
export type StateSite = InkSite & {
  /** `:hover` / `:focus-visible` / `:focus` / `:active`. */
  state: string
  /** The authored selectors of the state rules that element matched. */
  rules: string[]
}

export type StateScan = {
  /** Every state rule that repaints, with the elements and sites it produced. */
  rules: (PreparedRule & { sites: number })[]
  /** Distinct state sites — one row per distinct measured pair. */
  sites: StateSite[]
  violations: StateSite[]
  unreadableSheets: string[]
  unrewritten: string[]
}

export type MockScan = {
  file: string
  /** Every text site the document paints — the denominator of the verdict. */
  sites: InkSite[]
  /** The sites below their 1.4.3 threshold. */
  violations: InkSite[]
  /** The same verdict for the pairs only a `:hover` / focus / active state paints. */
  states: StateScan
}

/**
 * Load each mock in headless chromium and rule every text site it paints.
 * One browser for the whole set — launching is the expensive part.
 */
export async function scanMocks(absolutePaths: string[]): Promise<MockScan[]> {
  const browser: Browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    const scans: MockScan[] = []
    for (const absolutePath of absolutePaths) {
      const file = absolutePath.split('/').pop() ?? absolutePath
      await page.goto(pathToFileURL(absolutePath).href, { waitUntil: 'load' })
      const collected = await page.evaluate(collectSites, null)
      const sites = collected.map((s) => ({ ...s, file }))
      scans.push({
        file,
        sites,
        violations: sites.filter((s) => s.ratio < s.threshold),
        states: await scanStates(page, file),
      })
    }
    return scans
  } finally {
    await browser.close()
  }
}

/**
 * The state arm, run on a page whose resting walk is already done — it rewrites
 * the page's stylesheets, so it must come last.
 */
async function scanStates(page: Page, file: string): Promise<StateScan> {
  const prepared = await page.evaluate(prepareStateRules)
  const counts = prepared.rules.map(() => 0)
  const distinct = new Map<string, StateSite>()

  for (const host of prepared.hosts) {
    await page.evaluate(setState, { id: host.id, state: host.state, on: true })
    const collected = await page.evaluate(collectSites, 'data-motir-scope')
    await page.evaluate(setState, { id: host.id, state: host.state, on: false })

    for (const index of host.rules) counts[index] += collected.length
    const rules = host.rules.map((i) => prepared.rules[i].selector)
    for (const site of collected) {
      const row: StateSite = { ...site, file, state: host.state, rules }
      // Thirty footer links hovered one by one measure one pair thirty times.
      const key = [
        row.state,
        row.selector,
        row.text,
        row.color,
        row.background,
        row.fontPx,
        row.fontWeight,
      ].join('|')
      if (!distinct.has(key)) distinct.set(key, row)
    }
  }

  const sites = [...distinct.values()]
  return {
    rules: prepared.rules.map((rule, i) => ({ ...rule, sites: counts[i] })),
    sites,
    violations: sites.filter((s) => s.ratio < s.threshold),
    unreadableSheets: prepared.unreadableSheets,
    unrewritten: prepared.unrewritten,
  }
}

/** A one-line-per-violation report for the state arm, naming each site's state. */
export function formatStateViolations(scans: MockScan[]): string {
  const rows = scans.flatMap((scan) => scan.states.violations)
  const scanned = scans.reduce((n, scan) => n + scan.states.sites.length, 0)
  const lines = rows.map(
    (v) =>
      `  ${v.ratio.toFixed(2)} (needs ${v.threshold.toFixed(1)})  ${v.file}  ` +
      `${v.selector} ${v.state}  ${v.fontPx}px/${v.fontWeight}  ` +
      `${v.color} on ${v.background}  — "${v.text}"  [${v.rules.join(' | ')}]`,
  )
  return [
    `scanned ${scanned} state text sites; ${rows.length} below WCAG 1.4.3`,
    ...lines,
  ].join('\n')
}

/** A one-line-per-violation report, for a failure message a reader can act on. */
export function formatViolations(scans: MockScan[]): string {
  const rows = scans.flatMap((scan) => scan.violations)
  const scanned = scans.reduce((n, scan) => n + scan.sites.length, 0)
  const lines = rows.map(
    (v) =>
      `  ${v.ratio.toFixed(2)} (needs ${v.threshold.toFixed(1)})  ${v.file}  ` +
      `${v.selector}  ${v.fontPx}px/${v.fontWeight}  ` +
      `${v.color} on ${v.background}  — "${v.text}"`,
  )
  return [
    `scanned ${scanned} text-bearing sites; ${rows.length} below WCAG 1.4.3`,
    ...lines,
  ].join('\n')
}
