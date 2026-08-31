import Link from 'next/link'
import { copy, format } from '@/lib/copy'
import { listLegalDocuments } from '@/lib/legal/documents'

/**
 * `/legal` — the index of the published legal set (MOTIR-4009), built to
 * `design/legal/` (MOTIR-4005).
 *
 * The rows come from the DIRECTORY — the same `listLegalDocuments()` the
 * document routes use — so this page cannot list a document that does not
 * render, or omit one that does. It exists for the same reason the app host's
 * index does: seven links have no natural home in a four-column footer, and a
 * reader sent a link to one document deserves a way to find the rest.
 */

export default function LegalIndexPage() {
  const documents = listLegalDocuments()

  return (
    <main className="mx-auto w-full max-w-[46rem] px-(--spacing-card-padding) py-10">
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.legal.indexTitle}
      </h1>
      <p className="mt-2 max-w-[34rem] text-[14px] leading-relaxed text-(--el-text-secondary)">
        {copy.legal.indexIntro}
      </p>

      <ul className="mt-8 flex flex-col border-y border-(--el-border)">
        {documents.map((doc) => (
          <li
            key={doc.slug}
            className="border-b border-(--el-border) last:border-b-0"
          >
            <Link
              href={`/legal/${doc.slug}`}
              className="flex flex-col gap-1 py-4 hover:bg-(--el-surface-soft)"
            >
              <span className="text-[14px] font-semibold text-(--el-text)">
                {doc.title}
              </span>
              <span className="text-[13px] text-(--el-text-secondary)">
                {doc.effectiveDate
                  ? format(copy.legal.versionAndEffective, {
                      version: doc.version,
                      date: doc.effectiveDate,
                    })
                  : format(copy.legal.versionNotYetEffective, {
                      version: doc.version,
                    })}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-[13px] text-(--el-text-secondary)">
        {copy.legal.indexContact}
      </p>
    </main>
  )
}
