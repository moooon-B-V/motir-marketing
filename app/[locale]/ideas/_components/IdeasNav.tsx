'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createContext,
  useContext,
  useTransition,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { ideasHref, type IdeasParams } from '@/lib/ideas'

/*
 * The client half of /ideas' filters (MOTIR-7687) — and only the half that a
 * server component cannot do.
 *
 * Every filter is a URL the SERVER answers: a category, a tag or a search needs
 * a list the browser does not have, so a filter change is a `router.push`, not
 * a shallow URL write. What the browser adds is the PENDING state the design
 * names (`design/ideas/design-notes.md` § States, panel G): while the server is
 * answering, the count reads "Updating…" and the results region carries
 * `aria-busy`. No skeleton, no dim, no spinner, no `loading.tsx` — the list on
 * screen stays as it is until the new one replaces it.
 *
 * Every control here is still a real link or a real GET form, so with no
 * JavaScript the page navigates the ordinary way and loses nothing but the
 * "Updating…" line.
 */

const PendingContext = createContext<{
  pending: boolean
  navigate: (href: string) => void
}>({ pending: false, navigate: () => {} })

export function IdeasNavProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const navigate = (href: string) =>
    startTransition(() => router.push(href, { scroll: false }))
  return (
    <PendingContext.Provider value={{ pending, navigate }}>
      {children}
    </PendingContext.Provider>
  )
}

/** A plain click with no modifier — the only one we take over. */
function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

/** A filter control: a real link whose navigation shows the pending state. */
export function FilterLink({
  href,
  children,
  ...rest
}: {
  href: string
  children: ReactNode
  className?: string
  'aria-current'?: 'true' | undefined
  'aria-label'?: string
}) {
  const { navigate } = useContext(PendingContext)
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!isPlainClick(event)) return
        event.preventDefault()
        navigate(href)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/**
 * The search form. A real `GET /ideas` form — hidden inputs carry the other
 * filters so a search composes with them — enhanced to navigate through the
 * pending state. Submitted on Enter or the button, never as you type: every
 * search is a server read.
 */
export function SearchForm({
  params,
  children,
  ...rest
}: {
  /** The current view; the search replaces its `q` and closes any idea. */
  params: IdeasParams
  children: ReactNode
  className?: string
  'aria-label'?: string
}) {
  const { navigate } = useContext(PendingContext)
  return (
    <form
      method="get"
      action="/ideas"
      role="search"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const q = new FormData(event.currentTarget).get('q')
        const text = typeof q === 'string' ? q.trim() : ''
        navigate(ideasHref(params, { q: text || null, idea: null }))
      }}
      {...rest}
    >
      {children}
    </form>
  )
}

/** The result count, which reads "Updating…" while a filter is in flight. */
export function CountLine({
  text,
  updating,
  className,
}: {
  text: string
  updating: string
  className?: string
}) {
  const { pending } = useContext(PendingContext)
  return (
    <p aria-live="polite" className={className}>
      {pending ? updating : text}
    </p>
  )
}

/** The results, marked busy while a filter is in flight. */
export function ResultsRegion({ children }: { children: ReactNode }) {
  const { pending } = useContext(PendingContext)
  return <div aria-busy={pending || undefined}>{children}</div>
}

/*
 * ── opening an idea in place (MOTIR-7688) ──────────────────────────────────
 *
 * A card opens its idea with a `next/link` PUSH, so the open is a history entry
 * and Back closes it. The sheet needs to know whether it was opened that way:
 * a sheet loaded from a shared link has nothing behind it, so its close control
 * must REPLACE the URL rather than go back off the site. This flag is that
 * knowledge — set by the click, read and cleared by the sheet.
 */

let openedFromList = false

export function takeOpenedFromList(): boolean {
  const value = openedFromList
  openedFromList = false
  return value
}

export function OpenIdeaLink({
  href,
  slug,
  children,
  className,
}: {
  href: string
  slug: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      scroll={false}
      data-idea-link={slug}
      className={className}
      onClick={() => {
        openedFromList = true
      }}
    >
      {children}
    </Link>
  )
}
