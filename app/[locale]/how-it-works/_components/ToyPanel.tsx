import { useLayoutEffect, useRef } from 'react'
import { useCopy } from '@/lib/copy'
import { useCanvas } from './canvas'

/*
 * The first drawing on "How Motir works": vibe coding as a toy. One knob, a
 * prompt in — and out of it a heap of files: scattered, tangled in imports,
 * one circular import among them, and a single changed line in one file that
 * breaks seven others. No plan, no board, no review, no memory. Scrolling
 * past it swaps it for the full instrument (`RackStage`), so the page opens
 * on the difference between the two.
 *
 * Unlike the other drawings it does NOT spread across a wider canvas: it
 * stays the same size in the middle of the frame. Same inks as the rack
 * (`.hiw-rack` in globals.css); the breakage uses the danger ink. Its ground is
 * deliberately NOT Motir's: a hatch instead of the dot grid, a faint warning
 * tint, a dashed frame (globals.css) and a "not part of Motir" tag.
 */

// Rounded so the server's and the browser's float printing agree on hydration.
const r2 = (v: number) => Math.round(v * 100) / 100

const FOOT_ROOM = 520
const FW = 64
const FH = 80

// File names are code identifiers, the same in every language.
const FILES: ReadonlyArray<{
  name: string
  x: number
  y: number
  tilt: number
}> = [
  { name: 'app.tsx', x: 760, y: 330, tilt: -7 },
  { name: 'utils.ts', x: 880, y: 175, tilt: 6 },
  { name: 'api.ts', x: 1010, y: 300, tilt: -4 },
  { name: 'auth.ts', x: 900, y: 470, tilt: 3 },
  { name: 'db.ts', x: 1140, y: 160, tilt: 9 },
  { name: 'types.ts', x: 1180, y: 430, tilt: -10 },
  { name: 'index.ts', x: 1050, y: 575, tilt: 5 },
  { name: 'helpers.ts', x: 790, y: 610, tilt: -12 },
  { name: 'store.ts', x: 1310, y: 285, tilt: 4 },
  { name: 'config.ts', x: 1330, y: 560, tilt: -6 },
  { name: 'utils2.ts', x: 1235, y: 680, tilt: 11 },
  { name: 'final_v3.ts', x: 945, y: 700, tilt: -3 },
  { name: '???', x: 1390, y: 120, tilt: 14 },
  { name: 'temp.js', x: 690, y: 150, tilt: 18 },
  { name: 'api_copy.ts', x: 1395, y: 410, tilt: -15 },
  { name: 'fix.ts', x: 690, y: 720, tilt: 9 },
  { name: 'test_old.ts', x: 1110, y: 760, tilt: -8 },
]
const EDITED = 3
const CYCLE = [2, 8, 4] as const // api.ts → store.ts → db.ts → api.ts
const BROKEN = new Set([0, 1, 2, 5, 6, 7, 11])
const IMPORTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 4],
  [2, 5],
  [5, 6],
  [5, 9],
  [6, 9],
  [7, 11],
  [6, 11],
  [9, 10],
  [0, 7],
  [12, 4],
  [8, 9],
  [11, 10],
  [5, 8],
  [12, 8],
  [7, 6],
  [13, 1],
  [13, 0],
  [14, 8],
  [14, 2],
  [15, 7],
  [15, 3],
  [16, 10],
  [16, 6],
]

const centre = (i: number) => [FILES[i].x + FW / 2, FILES[i].y + FH / 2]

/** A wobbly import line between two files' centres. */
function curve(a: number, b: number, bend: number) {
  const [x1, y1] = centre(a)
  const [x2, y2] = centre(b)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const cx = mx + (-(y2 - y1) / len) * bend
  const cy = my + ((x2 - x1) / len) * bend
  return `M${r2(x1)} ${r2(y1)} Q${r2(cx)} ${r2(cy)} ${r2(x2)} ${r2(y2)}`
}

function File({ i, label }: { i: number; label: string }) {
  const { x, y, tilt, name } = FILES[i]
  const broken = BROKEN.has(i)
  const edited = i === EDITED
  return (
    <g transform={`rotate(${tilt} ${x + FW / 2} ${y + FH / 2})`}>
      <path
        d={`M${x} ${y}H${x + FW - 18}L${x + FW} ${y + 18}V${y + FH}H${x}Z`}
        className={
          edited
            ? 'toy-file toy-edited'
            : broken
              ? 'toy-file toy-broken'
              : 'toy-file'
        }
      />
      <path
        d={`M${x + FW - 18} ${y}V${y + 18}H${x + FW}`}
        className="toy-fold"
      />
      {[0, 1, 2].map((k) => (
        <line
          key={k}
          x1={x + 10}
          y1={y + 32 + k * 11}
          x2={x + (k === 2 ? 34 : 52)}
          y2={y + 32 + k * 11}
          className={edited && k === 1 ? 'toy-changed' : 'rule-a'}
        />
      ))}
      <text x={x + FW / 2} y={y + FH + 18} className="klbl" textAnchor="middle">
        {name}
      </text>
      {broken ? (
        <g>
          <circle cx={x + FW - 4} cy={y + 6} r={11} className="toy-x" />
          <path
            d={`M${x + FW - 9} ${y + 1}l10 10M${x + FW + 1} ${y + 1}l-10 10`}
            className="toy-x-mark"
          />
        </g>
      ) : null}
      {edited ? (
        <text
          x={x + FW / 2}
          y={y - 12}
          className="toy-edit-lbl"
          textAnchor="middle"
        >
          {label}
        </text>
      ) : null}
    </g>
  )
}

export function ToyPanel() {
  const copy = useCopy()
  const t = copy.howItWorks.toy
  const { W } = useCanvas()
  const footRef = useRef<SVGTextElement>(null)
  // The closing line has the room under the toy, left of the files; a longer
  // translation is squeezed to it (once the web fonts are in, too).
  useLayoutEffect(() => {
    const foot = footRef.current
    if (!foot || typeof foot.getComputedTextLength !== 'function') return
    const fit = () => {
      foot.removeAttribute('textLength')
      if (foot.getComputedTextLength() > FOOT_ROOM) {
        foot.setAttribute('textLength', String(FOOT_ROOM))
        foot.setAttribute('lengthAdjust', 'spacingAndGlyphs')
      }
    }
    fit()
    let live = true
    document.fonts?.ready.then(() => live && fit())
    return () => {
      live = false
    }
  }, [t.foot])
  const KX = 540
  const KY = 452
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((135 + i * 27) * Math.PI) / 180
    return (
      <line
        key={i}
        x1={r2(KX + Math.cos(a) * 62)}
        y1={r2(KY + Math.sin(a) * 62)}
        x2={r2(KX + Math.cos(a) * (i % 5 === 0 ? 74 : 69))}
        y2={r2(KY + Math.sin(a) * (i % 5 === 0 ? 74 : 69))}
        className="tick"
      />
    )
  })
  const pa = ((135 + 0.9 * 270) * Math.PI) / 180
  const [cx0, cy0] = centre(CYCLE[0])
  const [cx1, cy1] = centre(CYCLE[1])
  const [cx2, cy2] = centre(CYCLE[2])

  return (
    <svg
      viewBox={`0 0 ${W} 900`}
      role="img"
      aria-labelledby="hiw-toy-title hiw-toy-desc"
      className="hiw-rack hiw-toy block h-auto w-full"
    >
      <title id="hiw-toy-title">{copy.howItWorks.toyTitle}</title>
      <desc id="hiw-toy-desc">{copy.howItWorks.toyDesc}</desc>
      <defs>
        <pattern
          id="hiw-toy-hatch"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="14" className="toy-hatch" />
        </pattern>
        <marker
          id="hiw-toy-arr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10z" className="toy-arr" />
        </marker>
      </defs>
      <rect x={0} y={0} width={W} height={900} className="toy-face" />
      <rect
        x={0}
        y={0}
        width={W}
        height={900}
        className="face-dots"
        fill="url(#hiw-toy-hatch)"
      />
      <g>
        <rect x={32} y={30} width={14} height={14} className="toy-x" />
        <text x={56} y={42} className="toy-outside">
          {t.outside}
        </text>
      </g>

      {/* Drawn on the 1600 grid and kept centred, whatever the width. */}
      <g transform={`translate(${(W - 1600) / 2} 0)`}>
        {/* The toy: a rounded plastic box with one knob. */}
        <rect
          x={150}
          y={260}
          width={500}
          height={330}
          rx={44}
          className="toy-body"
        />
        <text x={196} y={328} className="toy-brand">
          {t.brand}
        </text>
        <text x={198} y={356} className="lbl">
          {t.model}
        </text>
        <rect x={602} y={300} width={12} height={12} className="ledw" />
        <rect x={196} y={392} width={230} height={44} className="lcd" />
        <text x={212} y={420} className="lcd-w toy-lcd" xmlSpace="preserve">
          {t.screen[0]}
        </text>
        {Array.from({ length: 24 }, (_, i) => (
          <circle
            key={i}
            cx={210 + (i % 8) * 22}
            cy={486 + Math.floor(i / 8) * 22}
            r={5}
            className="vent"
          />
        ))}
        {ticks}
        <circle cx={KX} cy={KY} r={54} className="knob" />
        <circle cx={KX} cy={KY} r={33} className="knob-cap" />
        <line
          x1={r2(KX + Math.cos(pa) * 10)}
          y1={r2(KY + Math.sin(pa) * 10)}
          x2={r2(KX + Math.cos(pa) * 46)}
          y2={r2(KY + Math.sin(pa) * 46)}
          className="pointer"
        />
        <text x={KX} y={KY + 100} className="klbl" textAnchor="middle">
          {t.knob}
        </text>

        {/* Out comes code — a heap of it. */}
        <circle cx={650} cy={420} r={11} className="jack-ring" />
        <circle cx={650} cy={420} r={4} className="jack-i" />
        <text x={650} y={398} className="klbl" textAnchor="middle">
          {t.out}
        </text>
        <path d="M650 420 C700 470 730 400 772 380" className="cable-w" />
        <circle cx={650} cy={420} r={5} className="plug-w" />

        {/* Imports, every which way. */}
        {IMPORTS.map(([a, b], k) => (
          <path
            key={k}
            d={curve(a, b, k % 2 ? 34 : -28)}
            className="toy-import"
          />
        ))}
        {/* The circular import. */}
        {CYCLE.map((from, k) => (
          <path
            key={from}
            d={curve(from, CYCLE[(k + 1) % CYCLE.length], -36)}
            className="toy-cycle"
            markerEnd="url(#hiw-toy-arr)"
          />
        ))}
        <text
          x={r2((cx0 + cx1 + cx2) / 3)}
          y={r2((cy0 + cy1 + cy2) / 3) + 4}
          className="toy-cycle-lbl"
          textAnchor="middle"
        >
          {t.cycle}
        </text>
        {/* One changed line, and the breakage spreading from it. */}
        {[...BROKEN].map((b) => (
          <path key={b} d={curve(EDITED, b, 18)} className="toy-ripple" />
        ))}

        {FILES.map((_, i) => (
          <File key={i} i={i} label={t.edited} />
        ))}

        <g>
          <circle cx={1262} cy={872} r={11} className="toy-x" />
          <path d="M1257 867l10 10M1267 867l-10 10" className="toy-x-mark" />
          <text x={1282} y={877} className="toy-broke-lbl">
            {t.broken}
          </text>
        </g>

        <text
          ref={footRef}
          x={400}
          y={700}
          className="toy-foot"
          textAnchor="middle"
        >
          {t.foot}
        </text>
      </g>
    </svg>
  )
}
