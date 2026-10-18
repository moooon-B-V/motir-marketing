'use client'

import { useLayoutEffect, useRef, type ReactNode } from 'react'
import type { Copy } from '@/lib/copy'
import { PART_TINT } from './parts'

/*
 * The drawing for each way to use Motir on "How to use Motir": the three parts
 * side by side — planner, project management, agent runner — drawn in the
 * rack's inks (`.hiw-rack` in globals.css). Project management is always
 * Motir's, in the middle. The planner and the runner are Motir's (crisp
 * panels, cool cables) or yours (peach dashed panels, warm cables over MCP),
 * depending on the way. Underneath, what you do at each part: the idea in,
 * the approval, and the work out — code, design, docs, video.
 *
 * Tool names on the yours-panels are MCP tool identifiers and stay in English;
 * every other label comes from the catalogue — handed down by the page, so the
 * namespace stays out of the browser's copy (`CLIENT_COPY_NAMESPACES`) — and
 * is squeezed to its room (`data-fit`) when a translation runs long.
 */

export type Way = 'project-management' | 'planner' | 'all'

const SLOT_X = [40, 440, 840] as const
const SLOT_W = 320
const TOP = 78
const PANEL_H = 270
const BOTTOM = TOP + PANEL_H
const HEIGHT = 500
// Columns inside a panel: the board's lanes and the fleet's machines.
const LANE = 92
const LANE_W = 80

// Rounded so the server's and the browser's float printing agree on hydration.
const r2 = (v: number) => Math.round(v * 100) / 100

function Fit({
  room,
  children,
  ...rest
}: {
  room: number
  children: ReactNode
} & React.SVGProps<SVGTextElement>) {
  return (
    <text data-fit={room} {...rest}>
      {children}
    </text>
  )
}

function Knob({ cx, cy }: { cx: number; cy: number }) {
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = ((135 + i * 27) * Math.PI) / 180
    return (
      <line
        key={i}
        x1={r2(cx + Math.cos(a) * 40)}
        y1={r2(cy + Math.sin(a) * 40)}
        x2={r2(cx + Math.cos(a) * (i % 5 === 0 ? 49 : 45))}
        y2={r2(cy + Math.sin(a) * (i % 5 === 0 ? 49 : 45))}
        className="tick"
      />
    )
  })
  const p = ((135 + 0.7 * 270) * Math.PI) / 180
  return (
    <g>
      {ticks}
      <circle cx={cx} cy={cy} r={34} className="knob-c" />
      <circle cx={cx} cy={cy} r={21} className="knob-cap" />
      <line
        x1={r2(cx + Math.cos(p) * 6)}
        y1={r2(cy + Math.sin(p) * 6)}
        x2={r2(cx + Math.cos(p) * 29)}
        y2={r2(cy + Math.sin(p) * 29)}
        className="pointer"
      />
    </g>
  )
}

/** A part of yours: its name, what it is, and the MCP tools it calls. */
function Yours({
  x,
  title,
  sub,
  prompt,
  tools,
}: {
  x: number
  title: string
  sub: string
  prompt: string
  tools: readonly string[]
}) {
  const y = TOP + 112
  return (
    <g>
      <rect
        x={x}
        y={TOP}
        width={SLOT_W}
        height={PANEL_H}
        className="use-yours"
      />
      <Fit room={SLOT_W - 48} x={x + 24} y={TOP + 48} className="ttl">
        {title}
      </Fit>
      <Fit room={SLOT_W - 48} x={x + 24} y={TOP + 74} className="sm">
        {sub}
      </Fit>
      <rect
        x={x + 24}
        y={y}
        width={SLOT_W - 48}
        height={34 + tools.length * 22}
        className="lcd"
      />
      <Fit
        room={SLOT_W - 76}
        x={x + 38}
        y={y + 23}
        className="lcd-w use-lcd"
        xmlSpace="preserve"
      >
        {prompt}
      </Fit>
      {tools.map((tool, i) => (
        <text
          key={tool}
          x={x + 38}
          y={y + 46 + i * 22}
          className="lcd-t use-lcd"
          xmlSpace="preserve"
        >
          {`  ${tool}`}
        </text>
      ))}
    </g>
  )
}

/** A Motir part: its panel, in its tint, with its number and name. */
function Motir({
  x,
  n,
  name,
  children,
}: {
  x: number
  n: 1 | 2 | 3
  name: string
  children: ReactNode
}) {
  return (
    <g>
      <rect
        x={x}
        y={TOP}
        width={SLOT_W}
        height={PANEL_H}
        className={`p t-${PART_TINT[n - 1]}`}
      />
      <text x={x + 24} y={TOP + 30} className="lbl">
        {`[0${n}] MOTIR`}
      </text>
      <Fit room={SLOT_W - 48} x={x + 24} y={TOP + 62} className="ttl">
        {name}
      </Fit>
      {children}
    </g>
  )
}

/** A small dark screen across the bottom of a Motir part. */
function Screen({ x, text }: { x: number; text: string }) {
  return (
    <g>
      <rect
        x={x + 50}
        y={TOP + 214}
        width={SLOT_W - 100}
        height={30}
        className="lcd"
      />
      <Fit
        room={SLOT_W - 120}
        x={x + SLOT_W / 2}
        y={TOP + 234}
        textAnchor="middle"
        className="lcd-t"
      >
        {text}
      </Fit>
    </g>
  )
}

/**
 * A cable between two panels: a plug at one end, an arrowhead at the other.
 * Over MCP (a part of yours) it is warm and says so above; what it carries is
 * written underneath.
 */
function Cable({
  y,
  from,
  to,
  warm,
  label,
  mcp,
  back,
}: {
  y: number
  from: number
  to: number
  warm: boolean
  label: string
  mcp: string
  back?: boolean
}) {
  const ink = warm ? 'w' : 'c'
  const [a, b] = back ? [to, from] : [from, to]
  const cls = warm ? 'use-wire use-wire-w' : 'use-wire'
  return (
    <g>
      <line x1={from} y1={y} x2={to} y2={y} className={`cable-${ink}`} />
      <circle cx={a} cy={y} r={5} className={`plug-${ink}`} />
      <path
        d={`M${b} ${y}l${back ? 10 : -10} -6v12z`}
        className={`plug-${ink}`}
      />
      {warm ? (
        <text x={(from + to) / 2} y={y - 9} textAnchor="middle" className={cls}>
          {mcp}
        </text>
      ) : null}
      <Fit
        room={to - from - 10}
        x={(from + to) / 2}
        y={y + 19}
        textAnchor="middle"
        className={cls}
      >
        {label}
      </Fit>
    </g>
  )
}

export function StackArt({ way, t }: { way: Way; t: Copy['howToUse']['art'] }) {
  const ref = useRef<SVGSVGElement>(null)
  const ownPlanner = way === 'project-management'
  const ownRunner = way !== 'all'
  const [px, mx, rx] = SLOT_X

  // Squeeze a long translated label into its room, once the fonts are in too.
  useLayoutEffect(() => {
    const svg = ref.current
    if (!svg) return
    const fit = () => {
      for (const el of svg.querySelectorAll<SVGTextElement>('[data-fit]')) {
        if (typeof el.getComputedTextLength !== 'function') return
        el.removeAttribute('textLength')
        const room = Number(el.dataset.fit)
        if (el.getComputedTextLength() > room) {
          el.setAttribute('textLength', String(room))
          el.setAttribute('lengthAdjust', 'spacingAndGlyphs')
        }
      }
    }
    fit()
    let live = true
    document.fonts?.ready.then(() => live && fit())
    return () => {
      live = false
    }
  }, [t, way])

  const slotHead = (x: number, name: string, yours: boolean) => (
    <g>
      <Fit room={SLOT_W - 100} x={x} y={52} className="lbl-h">
        {name}
      </Fit>
      <rect
        x={x + SLOT_W - 76}
        y={43}
        width={10}
        height={10}
        className={yours ? 'ledw' : 'ledc'}
      />
      <Fit
        room={60}
        x={x + SLOT_W - 60}
        y={52}
        className={yours ? 'use-tag use-tag-w' : 'use-tag'}
      >
        {yours ? t.yours : t.motir}
      </Fit>
    </g>
  )

  return (
    <svg
      ref={ref}
      viewBox={`0 0 1200 ${HEIGHT}`}
      aria-hidden="true"
      className="hiw-rack hiw-use block h-auto w-full"
    >
      <rect x={0} y={0} width={1200} height={HEIGHT} className="face" />

      {slotHead(px, t.planner, ownPlanner)}
      {slotHead(mx, t.pm, false)}
      {slotHead(rx, t.runner, ownRunner)}

      {/* The planner: Motir's knob, or your own script. */}
      {ownPlanner ? (
        <Yours
          x={px}
          title={t.yourPlanner}
          sub={t.yourPlannerSub}
          prompt='$ python3 plan.py "…"'
          tools={['create_plan', 'add_plan_items', 'validate_plan']}
        />
      ) : (
        <Motir x={px} n={1} name={t.plannerName}>
          <Knob cx={px + SLOT_W / 2} cy={TOP + 148} />
          <Screen x={px} text={t.plannerLcd} />
        </Motir>
      )}

      {/* Project management: always Motir's — the board in the middle. */}
      <Motir x={mx} n={2} name={t.pmName}>
        {t.columns.map((column, c) => {
          const cx = mx + 24 + c * LANE
          return (
            <g key={column}>
              <Fit room={LANE_W} x={cx} y={TOP + 100} className="lbl">
                {column}
              </Fit>
              <line
                x1={cx}
                y1={TOP + 110}
                x2={cx + LANE_W}
                y2={TOP + 110}
                className="rule-a"
              />
              {Array.from({ length: [3, 2, 1][c] }, (_, k) => {
                const cy = TOP + 120 + k * 38
                return (
                  <g key={k}>
                    <rect
                      x={cx}
                      y={cy}
                      width={LANE_W}
                      height={30}
                      className="key"
                    />
                    <rect
                      x={cx + 8}
                      y={cy + 11}
                      width={8}
                      height={8}
                      className={c === 1 ? 'ledc' : c === 2 ? 'ledoff' : 'ledw'}
                    />
                    <line
                      x1={cx + 22}
                      y1={cy + 15}
                      x2={cx + LANE_W - 10}
                      y2={cy + 15}
                      className="rule-a"
                    />
                  </g>
                )
              })}
            </g>
          )
        })}
        <Fit room={SLOT_W - 48} x={mx + 24} y={TOP + 252} className="sm">
          {t.pmSub}
        </Fit>
      </Motir>

      {/* The agent runner: Motir's fleet, or your own agents. */}
      {ownRunner ? (
        <Yours
          x={rx}
          title={t.yourAgents}
          sub={t.yourAgentsSub}
          prompt={`$ ${t.orchestration}`}
          tools={[
            'claim_next_ready',
            'start_work_item_run',
            'close_work_item_run',
          ]}
        />
      ) : (
        <Motir x={rx} n={3} name={t.fleetName}>
          {Array.from({ length: 6 }, (_, i) => {
            const bx = rx + 24 + (i % 3) * LANE
            const by = TOP + 92 + Math.floor(i / 3) * 58
            return (
              <g key={i}>
                <rect
                  x={bx}
                  y={by}
                  width={LANE_W}
                  height={48}
                  className="key"
                />
                <rect
                  x={bx + 10}
                  y={by + 10}
                  width={8}
                  height={8}
                  className={i < 4 ? 'ledc' : 'ledoff'}
                />
                {[0, 1].map((v) => (
                  <line
                    key={v}
                    x1={bx + 10}
                    y1={by + 28 + v * 9}
                    x2={bx + (v ? 44 : 66)}
                    y2={by + 28 + v * 9}
                    className="rule-a"
                  />
                ))}
              </g>
            )
          })}
          <Screen x={rx} text={t.fleetLcd} />
        </Motir>
      )}

      {/* The plan goes into the middle; tasks go out, results come back. */}
      <Cable
        y={TOP + 148}
        from={px + SLOT_W}
        to={mx}
        warm={ownPlanner}
        mcp={t.mcp}
        label={t.plan}
      />
      <Cable
        y={TOP + 112}
        from={mx + SLOT_W}
        to={rx}
        warm={ownRunner}
        mcp={t.mcp}
        label={t.tasks}
      />
      <Cable
        y={TOP + 190}
        from={mx + SLOT_W}
        to={rx}
        warm={ownRunner}
        mcp={t.mcp}
        label={t.results}
        back
      />

      {/* You, underneath: the idea in, the approval, the work out. */}
      <line x1={40} y1={384} x2={1160} y2={384} className="rule-a" />
      <rect x={40} y={401} width={10} height={10} className="ledw" />
      <Fit room={200} x={58} y={410} className="lbl-h">
        {t.you}
      </Fit>
      {[
        { x: px + SLOT_W / 2, label: t.idea, up: true },
        { x: mx + SLOT_W / 2, label: t.approve, up: true },
        { x: rx + SLOT_W / 2, label: t.outputs, up: false },
      ].map(({ x, label, up }) => (
        <g key={label}>
          <line x1={x} y1={BOTTOM} x2={x} y2={426} className="cable-w" />
          <path
            d={up ? `M${x} ${BOTTOM}l-6 10h12z` : `M${x} 426l-6 -10h12z`}
            className="plug-w"
          />
          <circle cx={x} cy={up ? 426 : BOTTOM} r={5} className="plug-w" />
          <circle cx={x} cy={440} r={11} className="jack-ring" />
          <circle cx={x} cy={440} r={4} className="jack-i" />
          <Fit
            room={SLOT_W - 40}
            x={x}
            y={474}
            textAnchor="middle"
            className="klbl"
          >
            {label}
          </Fit>
        </g>
      ))}
    </svg>
  )
}
