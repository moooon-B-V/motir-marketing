'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useCopy } from '@/lib/copy'
import { BASE_WIDTH, CanvasWidth } from './canvas'
import { Schematic } from './Schematic'
import { ShellPanel } from './ShellPanel'
import { ToyPanel } from './ToyPanel'
import { WorkflowRack } from './WorkflowRack'

/*
 * The drawings at the top of "How Motir works": vibe coding as a one-knob toy,
 * then Motir one level at a time — the closed instrument (three controls),
 * the rack of modules inside it, and the components and signal lines inside
 * the modules.
 *
 * The toy is not part of the scroll effect: it is a plain frame above the
 * stage, and scrolling down past it brings Motir up. On a wide screen that
 * allows motion, Motir's three drawings share one frame pinned to the
 * viewport while the page scrolls past it: the case's front panel swings up
 * and away to show the rack, then the view zooms into the rack until the
 * schematic takes its place. The frame fills the screen's height and the
 * page's width: the canvas widens to the frame's shape (`CanvasWidth`) and
 * each drawing spreads its layout across it, its text and parts at the size
 * the height gives them. Scroll position drives two numbers, `--open`
 * and `--zoom` (0–1), and globals.css turns them into the transforms, so
 * the first paint is already right before this script runs.
 *
 * Everywhere else — narrow screens, `prefers-reduced-motion` — the same three
 * drawings simply stack under the toy, each in its own frame, with nothing pinned or moving.
 * On a phone or small tablet (`SMALL`) each drawing gets a full-screen
 * section of its own; held upright, the frame is turned 90° so the whole
 * drawing fills the portrait screen, as if the phone were held sideways. The
 * script measures the room a section leaves (`--turn-w` / `--turn-h`) and
 * widens the canvas to that shape.
 * Both layouts come from the same markup; the media query that picks one lives
 * in globals.css and is repeated here as `ANIMATED`.
 *
 * Each drawing has an anchor a link can share: `#vibe-coding`, `#instrument`,
 * `#modules`, `#components`. Stacked, and for the toy always, they are plain
 * ids on the drawings. Pinned, Motir's three share one frame, so the script turns a hash into the scroll position
 * where that drawing is fully shown (`AT`), and writes the hash of the drawing
 * on screen back into the address bar while the page scrolls through the
 * stage. The captions are the links.
 */

const ANIMATED =
  '(min-width: 1100px) and (prefers-reduced-motion: no-preference)'
const SMALL = '(max-width: 1099px)'

// The pinned scroll, in viewport heights: rest on the case, open it, rest on
// the rack, zoom in, rest on the schematic. globals.css sizes the stage to
// 100vh plus their sum.
const REST_SHELL = 0.35
const OPEN = 1
const REST_RACK = 1.25
const ZOOM = 1
const REST_SCHEMATIC = 0.4
const RUN = REST_SHELL + OPEN + REST_RACK + ZOOM + REST_SCHEMATIC

type LayerName = 'toy' | 'shell' | 'rack' | 'schematic'
type StageLayer = Exclude<LayerName, 'toy'>
const STAGE_LAYERS: readonly StageLayer[] = ['shell', 'rack', 'schematic']
const ANCHOR: Record<LayerName, string> = {
  toy: 'vibe-coding',
  shell: 'instrument',
  rack: 'modules',
  schematic: 'components',
}
// Where each pinned drawing is fully shown, in viewport heights into the
// stage. The toy's anchor is a plain id: it sits above the stage.
const AT: Record<StageLayer, number> = {
  shell: 0,
  rack: REST_SHELL + OPEN + REST_RACK * 0.25,
  schematic: RUN - REST_SCHEMATIC / 2,
}
const layerOf = (hash: string) =>
  STAGE_LAYERS.find((name) => `#${ANCHOR[name]}` === hash)

// The widest canvas a drawing spreads across, so an ultra-wide screen does
// not pull its parts apart into a sparse line.
const MAX_WIDTH = BASE_WIDTH * 1.75

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (v: number) => v * v * (3 - 2 * v)

function Layer({
  name,
  caption,
  children,
}: {
  name: LayerName
  caption: string
  children: ReactNode
}) {
  return (
    <div className="hiw-layer" data-layer={name} id={ANCHOR[name]}>
      <p className="hiw-cap">
        <a href={`#${ANCHOR[name]}`}>{caption}</a>
      </p>
      <div className="hiw-room">
        <div className="hiw-turn">
          {/* A card surface, so the style axis reaches each drawing the way it
          reaches every other panel. The scroll lives INSIDE the frame: a style
          that draws past the frame's edge (hand-drawn's roughened overlay)
          must not become content of the scroll container. */}
          <div
            data-surface="card"
            data-tilt=""
            className="hiw-frame rounded-(--radius-card) border border-(--el-border) bg-(--el-page-bg) shadow-(--shadow-card)"
          >
            <div className="hiw-scroll overflow-x-auto overflow-y-hidden rounded-(--radius-card)">
              <div className="hiw-art min-w-[1100px]">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RackStage() {
  const h = useCopy().howItWorks
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState(BASE_WIDTH)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    const frameBox = stage.querySelector<HTMLElement>('.hiw-layers')!
    const mq = window.matchMedia(ANIMATED)
    const small = window.matchMedia(SMALL)
    const room = root.querySelector<HTMLElement>('.hiw-room')!
    let frame = 0
    const update = () => {
      frame = 0
      if (!mq.matches) {
        for (const name of ['--open', '--zoom'])
          stage.style.removeProperty(name)
        stage.dataset.phase = 'shell'
        if (!small.matches) {
          delete root.dataset.turn
          setCanvas(BASE_WIDTH)
          return
        }
        // A full-screen section per drawing: turned when the room is upright.
        const { width, height } = room.getBoundingClientRect()
        const upright = height > width
        const long = Math.max(width, height)
        const short = Math.max(1, Math.min(width, height))
        root.dataset.turn = upright ? 'upright' : 'flat'
        root.style.setProperty('--turn-w', `${long}px`)
        root.style.setProperty('--turn-h', `${short}px`)
        setCanvas(
          Math.min(
            MAX_WIDTH,
            Math.max(BASE_WIDTH, Math.round((900 * long) / short / 10) * 10),
          ),
        )
        return
      }
      const vh = window.innerHeight
      const shape = frameBox.clientWidth / Math.max(1, frameBox.clientHeight)
      // In steps of 10 so a scroll never re-lays the drawings out.
      setCanvas(
        Math.min(
          MAX_WIDTH,
          Math.max(BASE_WIDTH, Math.round((900 * shape) / 10) * 10),
        ),
      )
      const box = stage.getBoundingClientRect()
      const scrolled = Math.max(0, -box.top) / vh
      const open = ease(clamp((scrolled - REST_SHELL) / OPEN))
      const zoom = ease(
        clamp((scrolled - REST_SHELL - OPEN - REST_RACK) / ZOOM),
      )
      stage.style.setProperty('--open', open.toFixed(4))
      stage.style.setProperty('--zoom', zoom.toFixed(4))
      const phase: StageLayer =
        zoom > 0.5 ? 'schematic' : open > 0.5 ? 'rack' : 'shell'
      stage.dataset.phase = phase
      // Keep the address bar on the drawing in view, inside the stage only;
      // past it, drop our hash so a shared link is not stale.
      const inside = box.top <= 1 && scrolled <= RUN + 0.5
      const want = inside ? `#${ANCHOR[phase]}` : ''
      const ours = layerOf(window.location.hash)
      if (want ? window.location.hash !== want : ours) {
        const url = new URL(window.location.href)
        url.hash = want
        window.history.replaceState(window.history.state, '', url)
      }
    }
    // Pinned, a hash is a scroll position in the stage, not an element.
    const goToHash = (smooth: boolean) => {
      const name = layerOf(window.location.hash)
      if (!name || !mq.matches) return false
      const top =
        stage.getBoundingClientRect().top +
        window.scrollY +
        AT[name] * window.innerHeight
      window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
      return true
    }
    const onHash = () => goToHash(true)
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href^="#"]')
      if (!link || !stage.contains(link)) return
      const hash = link.getAttribute('href') ?? ''
      if (!layerOf(hash) || !mq.matches) return
      event.preventDefault()
      const url = new URL(window.location.href)
      url.hash = hash
      window.history.replaceState(window.history.state, '', url)
      goToHash(true)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    // A shared link: wait a frame for layout, then land on the drawing.
    const landing = requestAnimationFrame(() => {
      goToHash(false)
      update()
    })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('hashchange', onHash)
    stage.addEventListener('click', onClick)
    window.addEventListener('resize', schedule)
    mq.addEventListener('change', schedule)
    small.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(landing)
      window.removeEventListener('hashchange', onHash)
      stage.removeEventListener('click', onClick)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mq.removeEventListener('change', schedule)
      small.removeEventListener('change', schedule)
    }
  }, [])

  return (
    <CanvasWidth.Provider value={canvas}>
      <div ref={rootRef} className="hiw-drawings">
        {/* Vibe coding stands apart, above the stage: scroll past it to Motir. */}
        <div className="hiw-solo">
          <Layer name="toy" caption={h.stage.toyCaption}>
            <ToyPanel />
          </Layer>
        </div>
        <div
          ref={stageRef}
          className="hiw-stage"
          data-phase="shell"
          style={{ ['--run' as string]: RUN }}
        >
          <div className="hiw-pin">
            <p className="hiw-caps" aria-hidden="true">
              {STAGE_LAYERS.map((name) => (
                <a
                  key={name}
                  data-for={name}
                  href={`#${ANCHOR[name]}`}
                  tabIndex={-1}
                >
                  {
                    {
                      shell: h.stage.shellCaption,
                      rack: h.stage.rackCaption,
                      schematic: h.stage.schematicCaption,
                    }[name]
                  }
                </a>
              ))}
            </p>
            <div className="hiw-layers">
              <Layer name="shell" caption={h.stage.shellCaption}>
                <ShellPanel />
              </Layer>
              <Layer name="rack" caption={h.stage.rackCaption}>
                <WorkflowRack />
              </Layer>
              <Layer name="schematic" caption={h.stage.schematicCaption}>
                <Schematic />
              </Layer>
            </div>
            <p className="hiw-hint" aria-hidden="true">
              {h.stage.scrollHint}
            </p>
          </div>
        </div>
      </div>
    </CanvasWidth.Provider>
  )
}
