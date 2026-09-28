import { visitorViewUrl } from '@/lib/publicProject'

/**
 * "WATCH IT BEING BUILT" (MOTIR-6745; design MOTIR-6742 panel A, the
 * `public-projects--watch-live` delta). The one door from this page into the
 * live project in the app — and it states the COST before the click: a Motir
 * account, and the reader's name and email becoming visible to the project's
 * workspace Managers.
 *
 * ⚠️ THE COST LINE IS THE CONSENT SCREEN'S OWN CLAUSE. motir-core's
 * `visitor.consent.body` reads "If you continue, your name and email will be
 * visible to this project’s workspace Managers, along with when you visit." —
 * repeated here word for word, so motir.co promises exactly what the consent
 * screen then asks and nothing it doesn't. Change one, change both.
 *
 * ⚠️ A PLAIN `<a>`, NOT `next/link`: the destination is another origin, and a
 * `next/link` would be RSC-prefetched on render (MOTIR-4372). It targets the
 * BOARD — the Visitor tree's default view, the one the consent screen returns
 * to. It needs only the identifier, so the page renders it even when the
 * overview read failed (design panel E), titled with `name` absent.
 */
export function WatchLive({
  identifier,
  name,
}: {
  identifier: string
  /** The project's name, or null when the overview could not be read. */
  name: string | null
}) {
  const titleId = `watch-${identifier}`
  return (
    <section
      aria-labelledby={titleId}
      className="mt-5 flex flex-wrap items-center gap-3.5 rounded-(--radius-card) bg-(--el-tint-sky) px-4 py-3.5 text-(--el-text-strong) sm:flex-nowrap"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-5 w-5 flex-none text-(--el-info)"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="text-[14px] font-semibold text-(--el-text-strong)"
        >
          Watch {name ?? 'this project'} being built
        </h2>
        <p className="mt-0.5 text-[13px] leading-[1.55]">
          The live board, the plans as they are drafted and the agent runs as
          they happen — in the Motir app.
        </p>
        <p className="mt-0.5 text-[13px] leading-[1.55]">
          You’ll need a Motir account. If you continue, your{' '}
          <strong className="font-semibold">name and email</strong> will be
          visible to{' '}
          <strong className="font-semibold">
            this project’s workspace Managers
          </strong>
          , along with when you visit.
        </p>
      </div>
      <a
        href={visitorViewUrl(identifier, 'board')}
        className="inline-flex h-(--height-btn-sm) w-full flex-none items-center justify-center rounded-(--radius-btn) bg-(--el-accent) px-3 text-[13px] font-medium text-(--el-accent-text) hover:bg-(--el-accent-pressed) sm:w-auto"
      >
        Watch live&nbsp;<span aria-hidden>↗</span>
        <span className="sr-only"> — opens in the Motir app</span>
      </a>
    </section>
  )
}
