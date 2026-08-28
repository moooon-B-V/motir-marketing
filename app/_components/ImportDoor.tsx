import { ArrowRight, GitBranch } from 'lucide-react'
import { buttonVariants, cn } from '@motir/design-system'
import { copy } from '@/lib/copy'
import { IMPORT_DOOR } from '@/lib/destinations'
import { DoorFoot, DoorHead, DoorLabel } from './DoorCard'

/*
 * DOOR 2 — "I have an existing project". CO-EQUAL with door 1 since Yue's
 * 2026-08-28 reversal, and it EARNS the weight rather than being padded to
 * fill it: a card holding one line of prose beside a card holding a text area
 * reads as secondary however it is styled.
 *
 * So the three real sources are drawn as three FOCUSABLE ROWS rather than
 * compressed into a sentence. That is the same information at the weight the
 * decision asks for, it enumerates the products the import-copy rule requires
 * enumerated, and it makes the door co-equal in the TAB ORDER too — one big
 * click target beside a rich form is not co-equal for a keyboard reader.
 *
 * This is also the ONE place on the page where repository / code / vendor
 * language is allowed: this door's audience self-selects as having a codebase.
 * The idea path must not meet the word "repository" on the way in.
 */

const sources = [
  copy.landing.doors.import.sources.codebase,
  copy.landing.doors.import.sources.jira,
  copy.landing.doors.import.sources.linearPlane,
]

export function ImportDoor() {
  return (
    <>
      <DoorHead
        tint="sky"
        icon={<GitBranch className="size-[19px]" />}
        title={copy.landing.doors.import.title}
        description={copy.landing.doors.import.description}
      />
      <DoorLabel>{copy.landing.doors.import.sourcesLabel}</DoorLabel>
      <ul className="flex flex-1 list-none flex-col gap-2 p-0">
        {sources.map((source) => (
          <li key={source.title}>
            <a
              href={IMPORT_DOOR}
              className="block rounded-(--radius-input) border border-(--el-border) bg-(--el-page-bg) px-3 py-2.5 hover:border-(--el-border-strong) hover:bg-(--el-surface-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--el-accent-on-surface)"
            >
              <span className="block text-[13.5px] font-semibold text-(--el-text)">
                {source.title}
              </span>
              <span className="mt-[3px] block text-[12.5px] leading-[1.45] text-(--el-text-secondary)">
                {source.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <DoorFoot>
        {/* The counter's slot, empty here: the footer rows of the two doors
            bottom on the same line and the primary action sits at the same
            optical position in both. */}
        <span aria-hidden="true" />
        <a
          href={IMPORT_DOOR}
          className={cn(buttonVariants(), 'whitespace-nowrap')}
        >
          {copy.landing.doors.import.cta}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </DoorFoot>
    </>
  )
}
