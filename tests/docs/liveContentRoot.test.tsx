import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import {
  DocsDocument,
  renderDocsParts,
} from '@/app/[locale]/docs/_components/DocsDocument'
import { liveDocsContentRoot } from '@/lib/docsDocuments'

/*
 * MOTIR-8072 — the browser lane's live /docs root. With
 * `MOTIR_DOCS_LIVE_CONTENT_ROOT` set, documents are read from that directory and
 * the two renderers call `connection()`, so a build made with it renders /docs
 * per request; unset (production), neither happens and the pages stay
 * prerendered. `i18n:check-prerender` in CI's `build` job is the guard on the
 * unset side over a real build; this file pins the switch itself.
 */

const connection = vi.hoisted(() => vi.fn(async () => undefined))
vi.mock('next/server', () => ({ connection }))

const GOOD = join(process.cwd(), 'tests/docs/fixtures/documents/good')
const values = {
  tag: 'v9.9.9',
  site: 'https://example.test/guide',
  file: 'motir.config.json',
}
const slots = {
  install: createElement('pre', null, 'npm i -g motir'),
}

beforeEach(() => {
  connection.mockClear()
  vi.unstubAllEnvs()
})
afterEach(() => {
  vi.unstubAllEnvs()
})

describe('liveDocsContentRoot', () => {
  it('is unset when the variable is absent or empty', () => {
    expect(liveDocsContentRoot(undefined)).toBeUndefined()
    expect(liveDocsContentRoot('')).toBeUndefined()
  })

  it('returns an absolute directory as given', () => {
    expect(liveDocsContentRoot('/srv/repo/content/docs')).toBe(
      '/srv/repo/content/docs',
    )
  })

  it('throws on a relative path, which would follow the server’s chdir', () => {
    expect(() => liveDocsContentRoot('content/docs')).toThrow(
      /MOTIR_DOCS_LIVE_CONTENT_ROOT must be an absolute path/,
    )
  })

  it('reads the environment when called with no argument', () => {
    vi.stubEnv('MOTIR_DOCS_LIVE_CONTENT_ROOT', GOOD)
    expect(liveDocsContentRoot()).toBe(GOOD)
  })
})

describe('DOCS_CONTENT_ROOT', () => {
  it('is the repository’s content/docs when the variable is unset', async () => {
    vi.resetModules()
    const { DOCS_CONTENT_ROOT } = await import('@/lib/docsDocuments')
    expect(DOCS_CONTENT_ROOT).toBe(join(process.cwd(), 'content', 'docs'))
  })

  it('is the live root when the variable is set', async () => {
    vi.stubEnv('MOTIR_DOCS_LIVE_CONTENT_ROOT', GOOD)
    vi.resetModules()
    const { DOCS_CONTENT_ROOT } = await import('@/lib/docsDocuments')
    expect(DOCS_CONTENT_ROOT).toBe(GOOD)
  })
})

describe('the renderers render per request only under the live root', () => {
  it('DocsDocument does not call connection() when unset', async () => {
    await DocsDocument({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: GOOD,
    })
    expect(connection).not.toHaveBeenCalled()
  })

  it('DocsDocument calls connection() when set', async () => {
    vi.stubEnv('MOTIR_DOCS_LIVE_CONTENT_ROOT', GOOD)
    await DocsDocument({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: GOOD,
    })
    expect(connection).toHaveBeenCalledTimes(1)
  })

  it('renderDocsParts does not call connection() when unset, and does when set', async () => {
    await renderDocsParts({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: GOOD,
    })
    expect(connection).not.toHaveBeenCalled()

    vi.stubEnv('MOTIR_DOCS_LIVE_CONTENT_ROOT', GOOD)
    await renderDocsParts({
      slug: 'sample',
      locale: 'en',
      slots,
      values,
      root: GOOD,
    })
    expect(connection).toHaveBeenCalledTimes(1)
  })
})
