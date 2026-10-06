'use client'

import { useEffect, useRef } from 'react'
import { copy } from '@/lib/copy'

/*
 * The workflow drawing on "How Motir works" (2026-10 redesign): one work item,
 * idea to done, drawn as modules on a rack joined by cables.
 *
 * Blue modules and cables are Motir and its agents; orange knobs, switches and
 * peach panels are where a person decides. The learning loop's cables carry a
 * moving pulse (still under `prefers-reduced-motion`).
 *
 * It is built imperatively into the SVG because it is a drawing with a few
 * hundred placed parts, not a component tree. The SVG carries a title and a
 * description for assistive technology; every module is ALSO explained in the
 * "Module by module" section below, which is the readable version.
 *
 * Hovering or focusing a module highlights its explanation below (and the
 * other way round), and clicking it scrolls the explanation into view. The
 * pairing is by `data-step`.
 */

const NS = 'http://www.w3.org/2000/svg'
const r = copy.howItWorks.rack
type Attrs = Record<string, string | number>

export function WorkflowRack() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const still = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const drawn = svg.querySelector('[data-drawn]')
    if (drawn) drawn.remove()
    const root = document.createElementNS(NS, 'g')
    root.setAttribute('data-drawn', '')
    svg.appendChild(root)

    const el = (tag: string, attrs: Attrs, parent: Element = root) => {
      const node = document.createElementNS(NS, tag)
      for (const [k, v] of Object.entries(attrs))
        node.setAttribute(k, String(v))
      parent.appendChild(node)
      return node
    }
    const text = (
      p: Element,
      x: number,
      y: number,
      s: string,
      cls: string,
      anchor = 'start',
    ) => {
      const t = el('text', { x, y, class: cls, 'text-anchor': anchor }, p)
      t.textContent = s
      return t
    }
    const lines = (
      p: Element,
      x: number,
      y: number,
      rows: readonly string[],
      cls: string,
      lh: number,
    ) => rows.forEach((s, i) => text(p, x, y + i * lh, s, cls))
    const jack = (p: Element, x: number, y: number) => {
      el('circle', { cx: x, cy: y, r: 7, class: 'jack-ring' }, p)
      el('circle', { cx: x, cy: y, r: 2.6, class: 'jack-i' }, p)
    }
    const screen = (p: Element, x: number, y: number, w: number, h: number) =>
      el('rect', { x, y, width: w, height: h, rx: 2, class: 'lcd' }, p)
    const lcd = (
      p: Element,
      x: number,
      y: number,
      w: number,
      rows: readonly string[],
      warm = false,
    ) => {
      screen(p, x, y, w, rows.length * 17 + 14)
      lines(p, x + 11, y + 20, rows, warm ? 'lcd-w' : 'lcd-t', 17)
    }
    const led = (p: Element, cx: number, cy: number, warm: boolean, k = 4) =>
      el(
        'rect',
        {
          x: cx - k,
          y: cy - k,
          width: k * 2,
          height: k * 2,
          class: warm ? 'ledw' : 'ledc',
        },
        p,
      )

    const face = el('g', {})
    el(
      'rect',
      { x: 0, y: 0, width: 1600, height: 900, rx: 6, class: 'face' },
      face,
    )
    el(
      'rect',
      {
        x: 0,
        y: 0,
        width: 1600,
        height: 900,
        rx: 6,
        class: 'face-dots',
        fill: 'url(#hiw-dots)',
      },
      face,
    )
    const modules = el('g', {})
    const cables = el('g', { 'pointer-events': 'none' })

    const panel = (
      step: string,
      x: number,
      y: number,
      w: number,
      h: number,
      label: string,
      title: string | null,
      human = false,
    ) => {
      const g = el('g', { 'data-step': step, tabindex: 0 }, modules)
      el(
        'rect',
        { x, y, width: w, height: h, rx: 4, class: human ? 'p-h' : 'p' },
        g,
      )
      text(g, x + 16, y + 28, label, human ? 'lbl-h' : 'lbl')
      led(g, x + w - 26, y + 24, human)
      el(
        'line',
        {
          x1: x + 16,
          y1: y + 39,
          x2: x + w - 16,
          y2: y + 39,
          class: human ? 'rule-ah' : 'rule-a',
        },
        g,
      )
      if (title) text(g, x + 16, y + 68, title, 'ttl')
      return g
    }
    const knob = (
      p: Element,
      cx: number,
      cy: number,
      minL: string,
      maxL: string,
    ) => {
      for (let i = 0; i <= 10; i++) {
        const a = ((135 + i * 27) * Math.PI) / 180
        const big = i % 5 === 0
        el(
          'line',
          {
            x1: cx + Math.cos(a) * 31,
            y1: cy + Math.sin(a) * 31,
            x2: cx + Math.cos(a) * (big ? 38 : 35),
            y2: cy + Math.sin(a) * (big ? 38 : 35),
            class: 'tick',
          },
          p,
        )
      }
      el('circle', { cx, cy, r: 25, class: 'knob' }, p)
      const pa = (30 * Math.PI) / 180
      el(
        'line',
        {
          x1: cx,
          y1: cy,
          x2: cx + Math.cos(pa) * 19,
          y2: cy + Math.sin(pa) * 19,
          class: 'pointer',
        },
        p,
      )
      text(p, cx - 30, cy + 47, minL, 'klbl', 'middle')
      text(p, cx + 30, cy + 47, maxL, 'klbl', 'middle')
    }
    // A cable sags between two sockets; the learning loop's carry a pulse.
    const cable = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      warm: boolean,
      sag = 40,
      pulse = false,
    ) => {
      const low = Math.max(y1, y2) + sag
      const d = `M${x1} ${y1} C${x1 + (x2 - x1) * 0.15} ${low} ${x1 + (x2 - x1) * 0.85} ${low} ${x2} ${y2}`
      el('path', { d, class: warm ? 'cable-w' : 'cable-c' }, cables)
      el(
        'circle',
        { cx: x1, cy: y1, r: 4, class: warm ? 'plug-w' : 'plug-c' },
        cables,
      )
      el(
        'circle',
        { cx: x2, cy: y2, r: 4, class: warm ? 'plug-w' : 'plug-c' },
        cables,
      )
      if (pulse && !still) {
        for (const delay of [0, 1.3]) {
          const c = el('circle', { r: 2.6, class: 'pulse' }, cables)
          el(
            'animateMotion',
            {
              dur: '2.6s',
              repeatCount: 'indefinite',
              begin: `${delay}s`,
              path: d,
            },
            c,
          )
        }
      }
    }

    // Rack title and legend.
    const head = el('g', {}, modules)
    text(head, 40, 74, r.engine, 'lbl')
    text(head, 40, 120, r.engineTitle, 'ttl')
    text(head, 40, 146, r.engineSub, 'sm')
    el(
      'rect',
      { x: 40, y: 160, width: 120, height: 6, class: 'stripe-c' },
      head,
    )
    el(
      'rect',
      { x: 164, y: 160, width: 36, height: 6, class: 'stripe-s' },
      head,
    )
    el(
      'rect',
      { x: 204, y: 160, width: 60, height: 6, class: 'stripe-w' },
      head,
    )
    const legend = el('g', {}, modules)
    text(legend, 1560, 74, r.signal, 'lbl', 'end')
    el(
      'line',
      { x1: 1390, y1: 106, x2: 1440, y2: 106, class: 'cable-c' },
      legend,
    )
    text(legend, 1560, 110, r.signalMotir, 'sm', 'end')
    el(
      'line',
      { x1: 1390, y1: 136, x2: 1440, y2: 136, class: 'cable-w' },
      legend,
    )
    text(legend, 1560, 140, r.signalYou, 'sm', 'end')

    // Row 1: idea → planner → approve → board → run → review → done.
    let g = panel('1', 40, 250, 190, 220, r.idea.label, r.idea.title, true)
    lcd(g, 54, 330, 162, r.idea.screen, true)
    lines(g, 54, 410, r.idea.note, 'sm', 18)
    jack(g, 230, 360)

    g = panel('1', 266, 250, 230, 220, r.planner.label, r.planner.title)
    lcd(g, 280, 330, 202, r.planner.screen)
    jack(g, 266, 360)
    jack(g, 496, 360)
    jack(g, 381, 470)

    g = panel('2', 532, 250, 150, 220, r.approve.label, r.approve.title, true)
    knob(g, 607, 374, r.approve.min, r.approve.max)
    screen(g, 546, 432, 122, 24)
    text(g, 607, 448, r.approve.screen, 'lcd-w', 'middle')
    jack(g, 532, 360)
    jack(g, 682, 360)

    g = panel('3', 718, 250, 230, 220, r.board.label, r.board.title)
    lcd(g, 732, 330, 202, r.board.screen)
    for (let i = 0; i < 6; i++)
      el(
        'rect',
        {
          x: 738 + i * 18,
          y: 428,
          width: 8,
          height: 8,
          class: i < 4 ? 'ledc' : 'ledoff',
        },
        g,
      )
    text(g, 852, 436, r.board.ready, 'lbl')
    jack(g, 718, 360)
    jack(g, 948, 360)
    jack(g, 833, 250)
    jack(g, 926, 250)

    g = panel('4', 984, 250, 230, 220, r.run.label, r.run.title)
    lcd(g, 998, 330, 202, r.run.screen)
    jack(g, 984, 360)
    jack(g, 1214, 360)
    jack(g, 1100, 250)
    jack(g, 1040, 470)
    jack(g, 1160, 470)
    jack(g, 1192, 470)

    g = panel('5', 1250, 250, 150, 220, r.review.label, r.review.title, true)
    knob(g, 1325, 374, r.review.min, r.review.max)
    screen(g, 1264, 432, 122, 24)
    text(g, 1325, 448, r.review.screen, 'lcd-w', 'middle')
    jack(g, 1250, 360)
    jack(g, 1400, 360)

    g = panel('5', 1436, 250, 124, 220, r.done.label, r.done.title, true)
    el('circle', { cx: 1498, cy: 362, r: 22, class: 'ledw' }, g)
    lines(g, 1450, 420, r.done.note, 'sm', 18)
    jack(g, 1436, 360)
    jack(g, 1498, 250)

    // Row 0: the manual task, beside the board.
    g = panel('3', 718, 60, 230, 140, r.manual.label, r.manual.title, true)
    el(
      'rect',
      { x: 736, y: 150, width: 44, height: 22, rx: 3, class: 'sw-track' },
      g,
    )
    el(
      'rect',
      { x: 758, y: 150, width: 22, height: 22, rx: 2, class: 'ledw' },
      g,
    )
    screen(g, 794, 149, 136, 24)
    text(g, 862, 165, r.manual.screen, 'lcd-w', 'middle')
    jack(g, 833, 200)
    jack(g, 948, 110)

    // Row 0, above the run: a bug the agent finds is logged and the run goes on.
    g = el('g', { 'data-step': '4', tabindex: 0 }, modules)
    el(
      'rect',
      { x: 1000, y: 104, width: 200, height: 96, rx: 4, class: 'p' },
      g,
    )
    text(g, 1014, 126, r.bugs.label, 'lbl')
    led(g, 1180, 122, false, 3.5)
    screen(g, 1014, 136, 172, 26)
    text(g, 1024, 153, r.bugs.screen, 'lcd-t')
    text(g, 1014, 184, r.bugs.note, 'sm')
    jack(g, 1100, 200)
    jack(g, 1000, 152)

    // Row 2: the learning loop and repair.
    g = el('g', { 'data-step': '7', tabindex: 0 }, modules)
    el(
      'rect',
      { x: 40, y: 540, width: 190, height: 180, rx: 4, class: 'p-dark' },
      g,
    )
    text(g, 58, 568, r.learning.label, 'lbl-d')
    lines(g, 58, 612, r.learning.title, 'ttl-d', 32)
    lines(g, 58, 676, r.learning.note, 'sm-d', 18)

    g = panel('7', 266, 540, 230, 180, r.lessons.label, r.lessons.title)
    lcd(g, 280, 612, 202, r.lessons.screen)
    jack(g, 381, 540)
    jack(g, 496, 630)

    g = panel('7', 718, 540, 230, 180, r.replan.label, r.replan.title)
    lcd(g, 732, 612, 202, r.replan.screen)
    jack(g, 718, 630)
    jack(g, 948, 630)

    g = panel('7', 984, 540, 230, 180, r.verdict.label, r.verdict.title)
    lcd(g, 998, 612, 202, r.verdict.screen)
    jack(g, 1040, 540)
    jack(g, 984, 630)

    g = panel('6', 1250, 540, 310, 180, r.repair.label, r.repair.title)
    r.repair.rows.forEach(([what, command], i) => {
      const y = 646 + i * 26
      if (i === 0) led(g, 1272, y - 4, true, 3.5)
      else
        el(
          'rect',
          { x: 1268.5, y: y - 7.5, width: 7, height: 7, class: 'ledoff' },
          g,
        )
      text(g, 1286, y, what, 'lbl')
      screen(g, 1380, y - 17, 160, 22)
      text(g, 1390, y - 2, command, 'lcd-t')
    })
    jack(g, 1250, 610)
    jack(g, 1250, 680)

    // Row 3: the memory bank.
    g = panel('8', 40, 760, 1520, 112, r.memory.label, null)
    text(g, 56, 836, r.memory.title, 'ttl')
    r.memory.keys.forEach((key, i) => {
      const x = 392 + i * 164
      const on = i === 3
      text(g, x, 812, key, 'btn-t')
      if (on) led(g, x + 142, 808, true, 3)
      else
        el(
          'rect',
          { x: x + 139, y: 805, width: 6, height: 6, class: 'ledoff' },
          g,
        )
      el(
        'rect',
        {
          x,
          y: 820,
          width: 148,
          height: 32,
          rx: 2,
          class: on ? 'ledw key' : 'key',
        },
        g,
      )
    })

    // Cables, in front of the panels.
    cable(230, 360, 266, 360, true, 18)
    cable(496, 360, 532, 360, false, 18)
    cable(682, 360, 718, 360, true, 18)
    cable(948, 360, 984, 360, false, 18)
    cable(1214, 360, 1250, 360, false, 18)
    cable(1400, 360, 1436, 360, true, 18)
    cable(833, 250, 833, 200, true, 0)
    cable(948, 110, 1498, 250, true, -190)
    // A logged bug: up out of the run, into the Bugs folder on the board.
    cable(1100, 250, 1100, 200, false, 0)
    cable(1000, 152, 926, 250, false, 0)
    cable(1040, 470, 1040, 540, false, 6, true)
    cable(984, 630, 948, 630, false, 22, true)
    cable(718, 630, 496, 630, false, 46, true)
    cable(381, 540, 381, 470, false, 6, true)
    cable(1192, 470, 1250, 610, false, 10)
    cable(1250, 680, 1160, 470, false, 40)

    // Pair each module with its explanation below.
    const explained = (step: string) =>
      document.querySelector<HTMLElement>(`[data-module-step="${step}"]`)
    const light = (step: string, on: boolean) => {
      svg
        .querySelectorAll(`[data-step="${step}"]`)
        .forEach((n) => n.classList.toggle('on', on))
      explained(step)?.classList.toggle('on', on)
    }
    const off: Array<() => void> = []
    const listen = (node: Element, type: string, fn: () => void) => {
      node.addEventListener(type, fn)
      off.push(() => node.removeEventListener(type, fn))
    }
    svg.querySelectorAll('[data-step]').forEach((node) => {
      const step = node.getAttribute('data-step') ?? ''
      listen(node, 'mouseenter', () => light(step, true))
      listen(node, 'focus', () => light(step, true))
      listen(node, 'mouseleave', () => light(step, false))
      listen(node, 'blur', () => light(step, false))
      listen(node, 'click', () =>
        explained(step)?.scrollIntoView({
          behavior: still ? 'auto' : 'smooth',
          block: 'center',
        }),
      )
    })
    document
      .querySelectorAll<HTMLElement>('[data-module-step]')
      .forEach((node) => {
        const step = node.dataset.moduleStep ?? ''
        listen(node, 'mouseenter', () => light(step, true))
        listen(node, 'mouseleave', () => light(step, false))
      })

    return () => {
      off.forEach((fn) => fn())
      root.remove()
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1600 900"
      role="img"
      aria-labelledby="hiw-rack-title hiw-rack-desc"
      className="hiw-rack block h-auto w-full min-w-[1100px]"
    >
      <title id="hiw-rack-title">{copy.howItWorks.rackTitle}</title>
      <desc id="hiw-rack-desc">{copy.howItWorks.rackDesc}</desc>
      <defs>
        <pattern
          id="hiw-dots"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" className="dot" />
        </pattern>
      </defs>
    </svg>
  )
}
