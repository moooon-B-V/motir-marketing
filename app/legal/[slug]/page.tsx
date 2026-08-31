import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { copy, format } from '@/lib/copy'
import { getLegalDocument, legalDocumentSlugs } from '@/lib/legal/documents'
import { MarkdownBody } from '../_components/MarkdownBody'

/**
 * One published legal document (MOTIR-4009), built to `design/legal/`
 * (MOTIR-4005). The routes come from the DIRECTORY — `generateStaticParams`
 * globs `content/legal/`, so a document ships by EXISTING and no route table
 * has to be edited to add one.
 *
 * Server-rendered and indexable: no `'use client'`, no gate, no `robots`
 * restriction. A legal page a crawler cannot read is one a customer's
 * procurement review cannot find.
 */

export async function generateStaticParams() {
  return legalDocumentSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = getLegalDocument(slug)
  if (!doc) return {}

  return {
    title: doc.title,
    // The version rides the description so a search result distinguishes two
    // revisions of the same policy.
    description: format(copy.legal.metaDocDescription, {
      title: doc.title,
      version: doc.version,
    }),
  }
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getLegalDocument(slug)

  // An unknown slug is a genuine 404, and it stays one: nothing in this tree
  // renders a `loading.tsx` above this call, so the status code survives.
  if (!doc) notFound()

  return (
    <main className="mx-auto w-full max-w-[46rem] px-(--spacing-card-padding) py-10">
      <nav aria-label={copy.legal.breadcrumbAria} className="mb-6">
        <Link
          href="/legal"
          className="text-[13px] text-(--el-text-secondary) hover:text-(--el-link)"
        >
          {copy.legal.allDocuments}
        </Link>
      </nav>

      <header className="mb-8 border-b border-(--el-border) pb-6">
        <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
          {doc.title}
        </h1>
        <p className="mt-2 text-[13px] text-(--el-text-secondary)">
          {/*
            ⚠️ The effective date is rendered from `doc.effectiveDate`, which is
            `null` while the front matter says `TBD`. The literal string must
            never reach this page: a published policy whose date reads "TBD" is
            indistinguishable from an unfinished draft, whereas "not yet in
            effect" is TRUE, useful, and exactly what a reader should know
            before the service opens. `lib/legal/documents.ts` does the mapping
            so no page has to remember it.
          */}
          {doc.effectiveDate
            ? format(copy.legal.versionAndEffective, {
                version: doc.version,
                date: doc.effectiveDate,
              })
            : format(copy.legal.versionNotYetEffective, {
                version: doc.version,
              })}
        </p>
      </header>

      <MarkdownBody value={doc.body} />
    </main>
  )
}
