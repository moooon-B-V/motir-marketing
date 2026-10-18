import { useCopy } from '@/lib/copy'
import { useCanvas } from './canvas'

/*
 * The closed instrument on "How Motir works": the case the rack's modules live
 * in, drawn as a desktop synthesizer with three controls patched in a row —
 * your idea in, Motir plans it, Motir builds it. Scrolling past it opens the
 * case (`RackStage`) and the rack inside takes its place.
 *
 * Same inks and parts as the rack (`.hiw-rack` in globals.css): peach panel
 * and orange cable are you, blue is Motir.
 *
 * Laid out on the 1600-wide grid and spread across a wider canvas
 * (`canvas.ts`): positions and panel widths stretch, while jacks, screws,
 * knobs and LEDs keep their shape.
 */

// Rounded so the server's and the browser's float printing agree on hydration.
const r2 = (v: number) => Math.round(v * 100) / 100

function Jack({ x: gx, y, label }: { x: number; y: number; label: string }) {
  const x = useCanvas().X(gx)
  return (
    <g>
      <circle cx={x} cy={y} r={11} className="jack-ring" />
      <circle cx={x} cy={y} r={4} className="jack-i" />
      <text x={x} y={y + 30} className="klbl" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function Screw({ x: gx, y }: { x: number; y: number }) {
  const x = useCanvas().X(gx)
  return (
    <g>
      <circle cx={x} cy={y} r={7} className="jack-ring" />
      <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} className="tick" />
    </g>
  )
}

/** A big knob with its scale: 11 ticks over 270°, the pointer at `at` (0–1). */
function Knob({
  cx: gx,
  cy,
  r,
  at,
  min,
  max,
  warm = false,
}: {
  cx: number
  cy: number
  r: number
  at: number
  min: string
  max: string
  warm?: boolean
}) {
  const cx = useCanvas().X(gx)
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((135 + i * 27) * Math.PI) / 180
    const big = i % 5 === 0
    return (
      <line
        key={i}
        x1={r2(cx + Math.cos(a) * (r + 10))}
        y1={r2(cy + Math.sin(a) * (r + 10))}
        x2={r2(cx + Math.cos(a) * (r + (big ? 22 : 17)))}
        y2={r2(cy + Math.sin(a) * (r + (big ? 22 : 17)))}
        className="tick"
      />
    )
  })
  const pa = ((135 + at * 270) * Math.PI) / 180
  return (
    <g>
      {ticks}
      <circle cx={cx} cy={cy} r={r} className={warm ? 'knob' : 'knob-c'} />
      <circle cx={cx} cy={cy} r={r * 0.62} className="knob-cap" />
      <line
        x1={r2(cx + Math.cos(pa) * r * 0.2)}
        y1={r2(cy + Math.sin(pa) * r * 0.2)}
        x2={r2(cx + Math.cos(pa) * r * 0.85)}
        y2={r2(cy + Math.sin(pa) * r * 0.85)}
        className="pointer"
      />
      <text
        x={cx - r * 0.78}
        y={cy + r + 40}
        className="klbl"
        textAnchor="middle"
      >
        {min}
      </text>
      <text
        x={cx + r * 0.78}
        y={cy + r + 40}
        className="klbl"
        textAnchor="middle"
      >
        {max}
      </text>
    </g>
  )
}

function cablePath(x1: number, y1: number, x2: number, y2: number, sag = 60) {
  const low = Math.max(y1, y2) + sag
  return `M${x1} ${y1} C${x1 + (x2 - x1) * 0.15} ${low} ${x1 + (x2 - x1) * 0.85} ${low} ${x2} ${y2}`
}

export function ShellPanel() {
  const copy = useCopy()
  const { W, X } = useCanvas()
  const s = copy.howItWorks.shell
  const SECTION_Y = 236
  const SECTION_H = 500
  const JACK_Y = 676

  return (
    <svg
      viewBox={`0 0 ${W} 900`}
      role="img"
      aria-labelledby="hiw-shell-title hiw-shell-desc"
      className="hiw-rack hiw-shell block h-auto w-full"
    >
      <title id="hiw-shell-title">{copy.howItWorks.shellTitle}</title>
      <desc id="hiw-shell-desc">{copy.howItWorks.shellDesc}</desc>

      <rect x={X(0)} y={0} width={W} height={900} className="face" />

      {/* The case: end cheeks, then the front panel between them. */}
      <rect x={X(40)} y={56} width={X(80)} height={800} className="p-dark" />
      <rect x={X(1480)} y={56} width={X(80)} height={800} className="p-dark" />
      <rect x={X(112)} y={56} width={X(1376)} height={800} className="p" />
      <Screw x={140} y={84} />
      <Screw x={1460} y={84} />
      <Screw x={140} y={828} />
      <Screw x={1460} y={828} />

      {/* Name plate and power. */}
      <text x={X(180)} y={168} className="shell-brand">
        {s.brand}
      </text>
      <text x={X(182)} y={198} className="lbl">
        {s.model}
      </text>
      <rect x={X(180)} y={208} width={X(120)} height={6} className="stripe-c" />
      <rect x={X(304)} y={208} width={X(36)} height={6} className="stripe-s" />
      <rect x={X(344)} y={208} width={X(60)} height={6} className="stripe-w" />
      <text x={X(1380)} y={150} className="lbl" textAnchor="end">
        {s.power}
      </text>
      <rect x={X(1396)} y={138} width={14} height={14} className="ledc" />

      {/* [01] Idea input — yours. */}
      <rect
        x={X(180)}
        y={SECTION_Y}
        width={X(400)}
        height={SECTION_H}
        className="p-h"
      />
      <text x={X(204)} y={SECTION_Y + 34} className="lbl-h">
        {s.idea.label}
      </text>
      <rect
        x={X(548)}
        y={SECTION_Y + 22}
        width={10}
        height={10}
        className="ledw"
      />
      <line
        x1={X(204)}
        y1={SECTION_Y + 48}
        x2={X(556)}
        y2={SECTION_Y + 48}
        className="rule-ah"
      />
      <text x={X(204)} y={SECTION_Y + 90} className="ttl shell-ttl">
        {s.idea.title}
      </text>
      <rect
        x={X(204)}
        y={SECTION_Y + 120}
        width={X(352)}
        height={128}
        className="lcd"
      />
      {s.idea.screen.map((row, i) => (
        <text
          key={i}
          x={X(222)}
          y={SECTION_Y + 150 + i * 26}
          className="lcd-w shell-lcd"
          xmlSpace="preserve"
        >
          {row}
        </text>
      ))}
      {Array.from({ length: 22 }, (_, i) => {
        const row = Math.floor(i / 11)
        const col = i % 11
        return (
          <rect
            key={i}
            x={X(204 + row * 14 + col * 31)}
            y={SECTION_Y + 272 + row * 40}
            width={X(26)}
            height={32}
            className={i === 15 ? 'ledw key' : 'key'}
          />
        )
      })}
      <Jack x={520} y={JACK_Y} label={s.idea.out} />

      {/* [02] Motir plan. */}
      <rect
        x={X(600)}
        y={SECTION_Y}
        width={X(400)}
        height={SECTION_H}
        className="p"
      />
      <text x={X(624)} y={SECTION_Y + 34} className="lbl">
        {s.plan.label}
      </text>
      <rect
        x={X(968)}
        y={SECTION_Y + 22}
        width={10}
        height={10}
        className="ledc"
      />
      <line
        x1={X(624)}
        y1={SECTION_Y + 48}
        x2={X(976)}
        y2={SECTION_Y + 48}
        className="rule-a"
      />
      <text x={X(624)} y={SECTION_Y + 90} className="ttl shell-ttl">
        {s.plan.title}
      </text>
      <Knob
        cx={800}
        cy={SECTION_Y + 210}
        r={66}
        at={0.72}
        min={s.plan.min}
        max={s.plan.max}
      />
      <rect
        x={X(680)}
        y={SECTION_Y + 344}
        width={X(240)}
        height={30}
        className="lcd"
      />
      <text
        x={X(800)}
        y={SECTION_Y + 364}
        className="lcd-t shell-lcd"
        textAnchor="middle"
      >
        {s.plan.screen}
      </text>
      <Jack x={660} y={JACK_Y} label={s.plan.in} />
      <Jack x={940} y={JACK_Y} label={s.plan.out} />

      {/* [03] Motir build. */}
      <rect
        x={X(1020)}
        y={SECTION_Y}
        width={X(400)}
        height={SECTION_H}
        className="p"
      />
      <text x={X(1044)} y={SECTION_Y + 34} className="lbl">
        {s.build.label}
      </text>
      <rect
        x={X(1388)}
        y={SECTION_Y + 22}
        width={10}
        height={10}
        className="ledc"
      />
      <line
        x1={X(1044)}
        y1={SECTION_Y + 48}
        x2={X(1396)}
        y2={SECTION_Y + 48}
        className="rule-a"
      />
      <text x={X(1044)} y={SECTION_Y + 90} className="ttl shell-ttl">
        {s.build.title}
      </text>
      <Knob
        cx={1220}
        cy={SECTION_Y + 210}
        r={66}
        at={0.42}
        min={s.build.min}
        max={s.build.max}
      />
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={X(1110 + i * 22)}
          y={SECTION_Y + 330}
          width={12}
          height={12}
          className={i < 6 ? 'ledc' : 'ledoff'}
        />
      ))}
      <rect
        x={X(1100)}
        y={SECTION_Y + 356}
        width={X(240)}
        height={30}
        className="lcd"
      />
      <text
        x={X(1220)}
        y={SECTION_Y + 376}
        className="lcd-t shell-lcd"
        textAnchor="middle"
      >
        {s.build.screen}
      </text>
      <Jack x={1080} y={JACK_Y} label={s.build.in} />
      <Jack x={1360} y={JACK_Y} label={s.build.out} />

      {/* Footer: vents and the one line. */}
      {Array.from({ length: 18 }, (_, i) => (
        <rect
          key={i}
          x={X(180 + i * 20)}
          y={782}
          width={8}
          height={40}
          rx={4}
          className="vent"
        />
      ))}
      <text x={X(1420)} y={808} className="lbl" textAnchor="end">
        {s.foot}
      </text>

      {/* Patch cables, in front of the panels. */}
      <path d={cablePath(X(520), JACK_Y, X(660), JACK_Y)} className="cable-w" />
      <path
        d={cablePath(X(940), JACK_Y, X(1080), JACK_Y)}
        className="cable-c"
      />
      {[
        [520, true],
        [660, true],
        [940, false],
        [1080, false],
      ].map(([x, warm]) => (
        <circle
          key={String(x)}
          cx={X(x as number)}
          cy={JACK_Y}
          r={5}
          className={warm ? 'plug-w' : 'plug-c'}
        />
      ))}
    </svg>
  )
}
