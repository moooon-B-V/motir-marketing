'use client'

import { useState } from 'react'
import {
  AxisField,
  AxisNote,
  Button,
  Card,
  Combobox,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PALETTE_REGISTRY,
  PalettePicker,
  Pill,
  Popover,
  STYLE_REGISTRY,
  SectionLabel,
  Segmented,
  Spinner,
  StylePicker,
  Switch,
  TYPE_REGISTRY,
  THEME_DEFAULTS,
  Textarea,
  ThemeProvider,
  ThemeSegmentedControl,
  TokensSpecimen,
  Tooltip,
  TypePicker,
  useTheme,
} from '@motir/design-system'
import { RotateCcw } from 'lucide-react'
import { copy } from '@/lib/copy'

/*
 * motir.co/design — the public design showcase (MOTIR-1043 · 8.3.16).
 *
 * Layout from `design/marketing/design-showcase.*` (MOTIR-3861, re-measured by
 * MOTIR-3874); every word from `messages/en.json` `designShowcase.*`
 * (MOTIR-3862); every control, registry and primitive from the PUBLISHED
 * `@motir/design-system` — the copy this repository installs, never
 * motir-core's source.
 *
 * ⚠️ THE PAGE INVENTS NOTHING, AND THAT IS THE ARGUMENT IT MAKES. A showcase
 * that hand-rolled its own chips would be a picture of the design system
 * rather than the design system, so the pickers, the axis rows, the vignette,
 * the token specimen and every primitive below are the package's own exports.
 * `tests/designShowcaseSource.test.ts` asserts it against this file rather
 * than against a habit: no `--el-*` / `--color-*` declaration, no raw
 * `rounded-*` / `p-*` / `h-*` where a shape token exists, and every primitive
 * imported from the package.
 *
 * ⚠️ HOW THE WHOLE DOCUMENT RESTYLES, INCLUDING THE CHROME THIS COMPONENT DOES
 * NOT RENDER. `ThemeProvider` writes `data-theme` / `-style` / `-palette` /
 * `-type` onto `document.documentElement` and persists each to localStorage;
 * `theme.css`'s 23 `[data-palette]`, 112 `[data-style]` and 9 `[data-type]`
 * blocks then re-resolve the token layer for the entire document. So the bar
 * and the footer change with the specimen even though they are rendered by
 * `app/layout.tsx`'s tree, and the choice PERSISTS across motir.co — a
 * visitor who picks Neo-Brutalism here meets the landing in Neo-Brutalism.
 * That is decided, not incidental (`design-notes.md` § *a visitor's choice
 * PERSISTS*): a demo that forgets itself on navigation is a preview. **Reset
 * to default** is what discharges it, and it is present exactly while any axis
 * is off its default.
 */
export function DesignShowcase() {
  return (
    <ThemeProvider>
      <AxisRail />
      <Specimen />
    </ThemeProvider>
  )
}

/*
 * The rail — a full-width band under the bar: a header row carrying the theme
 * control and Reset, then the three registry axes as stacked `AxisField`s.
 *
 * A band rather than a sidebar, and that was measured rather than preferred:
 * Style is ELEVEN chips of real words and Palette is ten with a swatch each,
 * which in a 280px sidebar wraps the Style group alone to nine rows.
 *
 * It deliberately does NOT stick. The page's claim is that the WHOLE document
 * restyles, chrome included, so pinning the controls over a scrolling specimen
 * would hold the one region a visitor most needs to watch — the bar — out of
 * view.
 *
 * ⚠️ THE AXIS STACK SITS IN A `Card`, WHICH THE ASSET DOES NOT DRAW, AND THE
 * REASON IS A MEASUREMENT. `AxisField` renders its `help` line and `AxisNote`
 * at `text-xs text-(--el-text-muted)`, and `theme.css` says of that token in
 * its own words: *"AA-SAFE ONLY ON THE WHITE PAGE/CARD, and by 0.04 (4.54:1).
 * On --el-surface it is 4.17, on --el-muted 4.12, on --el-surface-soft 4.34 —
 * all under AA. A muted caption belongs inside a card, never on a panel."* The
 * asset draws exactly that — muted captions at 12px directly on the
 * `--el-surface-soft` band — because its own AA sweep measured the accent and
 * danger inks and not this pair. `--el-card` resolves to the same
 * `--color-background` as the page, so a `Card` here restores 4.54:1 for all
 * three of the failing inks (`-muted`, `-eyebrow`, `-helper`) while keeping
 * the band the asset's layout is built on. `tests/aaMatrix.test.ts` measures
 * it over all ten palettes in both themes rather than taking this on trust.
 */
function AxisRail() {
  const theme = useTheme()
  const offDefault =
    theme.pattern !== THEME_DEFAULTS.pattern ||
    theme.styleId !== THEME_DEFAULTS.style ||
    theme.palette !== THEME_DEFAULTS.palette ||
    theme.type !== THEME_DEFAULTS.type

  function reset() {
    theme.setPattern(THEME_DEFAULTS.pattern)
    theme.setStyleId(THEME_DEFAULTS.style)
    theme.setPalette(THEME_DEFAULTS.palette)
    theme.setType(THEME_DEFAULTS.type)
  }

  return (
    <section
      aria-label={copy.designShowcase.heading}
      className="border-b border-(--el-border) bg-(--el-surface-soft)"
    >
      <div className="mx-auto max-w-[1080px] px-4 py-3 sm:px-7">
        <Card
          header={
            /*
             * The rail's own header row: the theme axis on the left, the
             * control and Reset right-aligned — the arrangement the asset
             * states in prose and draws in panels 1 and 2. Theme is here
             * rather than a fourth stacked field because it is three fixed
             * segments rather than a registry of chips, and because the three
             * chip axes are what the fold measurement is about.
             *
             * Reset is ABSENT at arrival — a reset with nothing to reset is
             * noise (the asset's state 6a) — and appears the moment any axis
             * moves (6c). The row reserves its height either way, so the
             * first pick does not shift the page under the pointer.
             */
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-sm font-semibold text-(--el-text)">
                  {copy.designShowcase.theme.name}
                </span>
                <span className="text-xs text-(--el-text-muted)">
                  {copy.designShowcase.theme.help}
                </span>
              </div>
              <div className="flex min-h-(--height-btn-sm) flex-wrap items-center gap-2">
                {offDefault ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={reset}
                    leftIcon={
                      <RotateCcw aria-hidden="true" className="size-3.5" />
                    }
                  >
                    {copy.designShowcase.reset}
                  </Button>
                ) : null}
                <ThemeSegmentedControl
                  value={theme.pattern}
                  onChange={theme.setPattern}
                  label={copy.designShowcase.theme.name}
                  labels={{
                    light: copy.designShowcase.theme.light,
                    dark: copy.designShowcase.theme.dark,
                    system: copy.designShowcase.theme.system,
                  }}
                />
              </div>
            </div>
          }
        >
          <AxisRow>
            <AxisField
              name={copy.designShowcase.style.name}
              help={copy.designShowcase.style.help}
              note={
                <AxisNote
                  name={STYLE_REGISTRY[theme.styleId].name}
                  tagline={STYLE_REGISTRY[theme.styleId].tagline}
                />
              }
            >
              <StylePicker
                value={theme.styleId}
                onChange={theme.setStyleId}
                label={copy.designShowcase.style.name}
              />
            </AxisField>
          </AxisRow>

          <AxisRow>
            <AxisField
              name={copy.designShowcase.palette.name}
              help={copy.designShowcase.palette.help}
              note={
                <AxisNote
                  name={PALETTE_REGISTRY[theme.palette].name}
                  tagline={PALETTE_REGISTRY[theme.palette].tagline}
                />
              }
            >
              <PalettePicker
                value={theme.palette}
                onChange={theme.setPalette}
                label={copy.designShowcase.palette.name}
              />
            </AxisField>
          </AxisRow>

          <AxisRow>
            <AxisField
              name={copy.designShowcase.type.name}
              help={copy.designShowcase.type.help}
              note={
                <AxisNote
                  name={TYPE_REGISTRY[theme.type].name}
                  tagline={TYPE_REGISTRY[theme.type].tagline}
                />
              }
            >
              <TypePicker
                value={theme.type}
                onChange={theme.setType}
                label={copy.designShowcase.type.name}
              />
            </AxisField>
          </AxisRow>
        </Card>
      </div>
    </section>
  )
}

/*
 * ⚠️ NARROW VIEWPORTS SCROLL EACH AXIS RATHER THAN WRAPPING IT, and this
 * wrapper is the whole of that. `AxisRadioGroup` is `flex-wrap` and takes no
 * className, so the change is made from OUTSIDE it — eleven style chips wrap
 * to six rows at 390px, which is ~190px of rail for one axis and pushes the
 * specimen off the fold entirely. As one scrolling row an axis is ~31px and
 * all four fit above it. Only the chip row scrolls; the page itself never
 * scrolls horizontally.
 */
function AxisRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-md:overflow-x-auto max-md:[&_[role=radio]]:shrink-0 max-md:[&_[role=radio]]:whitespace-nowrap max-md:[&_[role=radiogroup]]:flex-nowrap">
      {children}
    </div>
  )
}

/*
 * The composed specimen. Two parts, in the asset's own order: the primitives a
 * product is actually built out of, then `TokensSpecimen` — the package's own
 * isolation specimen, which carries the `--el-*` grid AND one `StyleVignette`
 * per style and per palette. Mounting the shipped export is what the asset
 * asks for; it is also the only version that cannot drift from the package.
 */
function Specimen() {
  return (
    <>
      <div className="mx-auto max-w-[1080px] px-4 pt-10 pb-4 sm:px-7">
        <h1 className="mb-3 font-(family-name:--font-serif) text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-(--el-text) sm:text-[40px]">
          {copy.designShowcase.heading}
        </h1>
        <p className="max-w-[62ch] text-[14.5px] leading-relaxed text-(--el-text-secondary) sm:text-[16px]">
          {copy.designShowcase.subline}
        </p>
      </div>

      <div className="mx-auto flex max-w-[1080px] flex-col gap-8 px-4 pb-4 sm:px-7">
        <section className="flex flex-col gap-3">
          <SectionLabel>Composed UI</SectionLabel>
          <ComposedUi />
        </section>
      </div>

      <TokensSpecimen />

      <div className="mx-auto max-w-[1080px] px-4 pb-14 sm:px-7">
        <p className="max-w-[62ch] text-[14.5px] leading-relaxed text-(--el-text-secondary)">
          {copy.designShowcase.closing}
        </p>
      </div>
    </>
  )
}

const ASSIGNEES = [
  { value: 'yue', label: 'Zhu Yue' },
  { value: 'unassigned', label: 'Unassigned' },
] as const

/*
 * The primitives the asset draws that `TokensSpecimen` does not carry —
 * overlays, the two state primitives, the segmented control and the switch.
 *
 * ⚠️ THE LABELS HERE ARE SPECIMEN DATA, NOT COPY, and that is why they are not
 * in `messages/en.json`. `designShowcase.*` is MOTIR-3862's key set and
 * `tests/copy.test.ts` asserts it exactly; a demo work item's title is the
 * same kind of string as `TokensSpecimen`'s own "Ship the billing flow", which
 * the package hard-codes for the same reason. They still obey the register: a
 * work item is never an "issue".
 */
function ComposedUi() {
  const [live, setLive] = useState(true)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [assignee, setAssignee] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Pill>Badge</Pill>
        <Pill status="done">Done</Pill>
        <Pill status="in-progress">In progress</Pill>
        <Tooltip content="A tooltip, drawn from the same tokens.">
          <Button variant="ghost" size="sm">
            Hover me
          </Button>
        </Tooltip>
        <Spinner />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Input
          label="Work item title"
          defaultValue="Ship the billing flow"
          className="min-w-[220px]"
        />
        <Combobox
          label="Assignee"
          placeholder="Select…"
          options={[...ASSIGNEES]}
          value={assignee}
          onChange={setAssignee}
        />
        <Segmented
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'board', label: 'Board' },
            { value: 'list', label: 'List' },
          ]}
        />
        <div className="flex items-center gap-2">
          <Switch
            id="showcase-live"
            checked={live}
            onCheckedChange={setLive}
            aria-label="Live updates"
          />
          <label
            htmlFor="showcase-live"
            className="text-sm text-(--el-text-secondary)"
          >
            Live updates
          </label>
        </div>
      </div>

      <Textarea
        label="Notes"
        rows={2}
        defaultValue="Every control on this card is the shipped primitive."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <Popover.Trigger asChild>
            <Button variant="secondary" size="sm">
              Popover
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <p className="text-sm text-(--el-text-secondary)">
              An overlay drawn from the same tokens.
            </p>
          </Popover.Content>
        </Popover>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          Modal
        </Button>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="Modal"
          description="Dialogs re-shape with the style axis too."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <EmptyState
          title="Nothing here yet"
          description="EmptyState — the shipped primitive."
        />
        <ErrorState
          title="Something broke"
          description="ErrorState — the shipped primitive."
        />
      </div>
    </Card>
  )
}
