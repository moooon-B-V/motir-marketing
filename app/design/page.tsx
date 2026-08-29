import type { Metadata } from 'next'
import { copy } from '@/lib/copy'
import { siteUrl } from '@/lib/siteOrigin'
import { DesignShowcase } from '../_components/DesignShowcase'
import { SiteFooter } from '../_components/SiteFooter'
import { SiteHeader } from '../_components/SiteHeader'

/*
 * motir.co/design — the public design showcase (MOTIR-1043 · 8.3.16).
 *
 * The site's SECOND page and its first internal second route. It is a
 * marketing / credibility surface rather than a token reference: the argument
 * it makes is "the design system Motir gives you is the one Motir wears", and
 * it makes it by letting a visitor move three controls and watch this page —
 * bar and footer included — become a different-looking product.
 *
 * ⚠️ NOT `/tokens`, and that is a collision rather than a preference.
 * motir-core has a `/tokens` route of its own — the internal, dev-only living
 * specimen, which stays exactly where it is and is not being migrated — and on
 * a marketing host the word reads as API tokens, which `app.motir.co/settings/
 * account/tokens` genuinely is.
 *
 * PUBLIC by construction: `motir-marketing` has no auth of any kind, so there
 * is no gate to remove here. Server-rendered chrome around ONE client island
 * (the showcase), the same shape as the landing.
 */
export const metadata: Metadata = {
  title: copy.designShowcase.heading,
  description: copy.designShowcase.subline,
  alternates: { canonical: '/design' },
  openGraph: {
    type: 'website',
    url: siteUrl('/design'),
    siteName: 'Motir',
    title: copy.designShowcase.heading,
    description: copy.designShowcase.subline,
    locale: 'en',
  },
}

export default function DesignPage() {
  return (
    <div className="bg-(--el-page-bg) text-(--el-text)">
      <SiteHeader />
      <main>
        <DesignShowcase />
      </main>
      <SiteFooter />
    </div>
  )
}
