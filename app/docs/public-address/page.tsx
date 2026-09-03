import Link from 'next/link'
import { copy } from '@/lib/copy'
import { DocsNav } from '../_components/DocsNav'

/*
 * The PUBLIC ADDRESS guide (Story MOTIR-3878 · MOTIR-4227) — committed prose,
 * for the person editing DNS at their registrar rather than for an engineer.
 *
 * ⚠️ IT DOCUMENTS THE SHIPPED PRODUCT, AND ONE PARAGRAPH SAYS SO OUT LOUD. The
 * card requires every instruction be read off the built product; doing that
 * found that the settings pane shows the ownership TXT and NOT the record that
 * points a domain at us (MOTIR-4278). The pointing records are documented here
 * anyway — a customer at their registrar needs them, and they are public facts
 * about where motir.co is served from — with the discrepancy stated plainly
 * instead of a page that describes a screen nobody will see.
 *
 * ⚠️ NO NUMERIC CAP, and no tier names beyond "paid". `billing-tiering.md` owns
 * those numbers; a docs page that restated one would be the copy that goes stale
 * on the next pricing change, silently, in the place a customer trusts most.
 *
 * The status table's rows and their wording are COPIED FROM the product's own
 * `messages/en.json`, not from memory — a table that drifted from the pane would
 * send a customer looking for a state their screen does not have.
 */

const STATUSES: { label: string; meaning: string; action: string }[] = [
  {
    label: 'Not verified',
    meaning:
      'We have not seen your ownership record yet. Nothing has been requested from the certificate authority.',
    action: 'Create the TXT record below, then choose Check again.',
  },
  {
    label: 'Checking…',
    meaning:
      'We are looking for the ownership record now. DNS changes can take a few minutes to spread.',
    action: 'Wait a moment. It moves on by itself.',
  },
  {
    label: 'Issuing…',
    meaning:
      'Ownership is proven and the certificate has been requested. This usually takes a minute or two.',
    action: 'Nothing. Motir does the rest.',
  },
  {
    label: 'Live',
    meaning:
      'The certificate is issued and your domain serves the project. It renews on its own.',
    action: 'You can make this address the primary one.',
  },
  {
    label: 'Failed',
    meaning:
      'The certificate could not be issued. The reason is shown beside the status — most often a record that is missing or points somewhere else.',
    action:
      'Compare your records with the ones below, then choose Check again.',
  },
  {
    label: 'Expired',
    meaning:
      'The certificate lapsed and renewal did not succeed — almost always because a DNS record changed. The domain is not serving.',
    action: 'Put the records back as they were, then choose Check again.',
  },
  {
    label: 'Revoked',
    meaning: 'The certificate was withdrawn. The domain is not serving.',
    action: 'Choose Request again to start a new certificate.',
  },
]

export default function PublicAddressDocsPage() {
  return (
    <>
      <DocsNav current="/docs/public-address" />
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.publicAddress}
      </h1>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          A public project is reachable at an address you choose. Every
          workspace can claim one address of its own, and a project can
          additionally answer on a domain you already own.
        </p>

        <H2>Your Motir address</H2>
        <p>
          A workspace claims a single subdomain, and every public project in it
          answers underneath — so <Mono>acme</Mono> gives you{' '}
          <Mono>acme.motir.site/ROADMAP</Mono> for a project keyed{' '}
          <Mono>ROADMAP</Mono>. A workspace owner or admin claims it, in Project
          settings under <em>Public address</em>.
        </p>
        <p>
          A label is lowercase letters, digits and hyphens, three to sixty-three
          characters. A small set of names is kept back for Motir&rsquo;s own
          hosts and for names a reader could mistake for one.
        </p>
        <p>
          You can rename it a limited number of times, and the pane shows how
          many renames you have left.{' '}
          <strong>
            The old address keeps working afterwards, and is never released.
          </strong>{' '}
          It redirects to the new one permanently and cannot be claimed by
          anyone else — including you, later. That is deliberate: a link
          somebody has already shared must not one day lead somewhere you did
          not choose.
        </p>

        <H2>Connecting your own domain</H2>
        <p>
          Connecting a domain you own is available on paid plans — see{' '}
          <Link
            href="/"
            className="text-(--el-link) underline underline-offset-2"
          >
            our plans
          </Link>
          . Your workspace subdomain is included on every plan and keeps working
          either way.
        </p>
        <p>
          A connected domain serves <em>one</em> project, at its root:{' '}
          <Mono>roadmap.acme.com/</Mono> is that project&rsquo;s overview and{' '}
          <Mono>roadmap.acme.com/board</Mono> its board.
        </p>
        <p>You create two kinds of record at your registrar.</p>

        <H3>1 · Point the domain at us</H3>
        <p>
          For a <strong>subdomain</strong> such as <Mono>roadmap.acme.com</Mono>
          , one <Mono>CNAME</Mono>:
        </p>
        <Records rows={[['CNAME', 'roadmap', 'motir-marketing.fly.dev']]} />
        <p>
          For a <strong>root domain</strong> such as <Mono>acme.com</Mono>, an{' '}
          <Mono>A</Mono> and an <Mono>AAAA</Mono> instead — a root domain cannot
          take a <Mono>CNAME</Mono>, because it already carries the{' '}
          <Mono>MX</Mono> and <Mono>TXT</Mono> records your mail and your other
          services depend on:
        </p>
        <Records
          rows={[
            ['A', '@', '66.241.125.217'],
            ['AAAA', '@', '2a09:8280:1::17d:93fd:0'],
          ]}
        />
        <p className="rounded-(--radius-card) bg-(--el-tint-yellow) px-4 py-3 text-[14px] text-(--el-text-strong)">
          The settings pane shows you the ownership record below, and does not
          yet show the pointing record above — use the values on this page for
          that step. If your DNS provider offers a &ldquo;proxy&rdquo; or
          &ldquo;cloud&rdquo; toggle on the record, turn it off: a proxy in
          front of the record hides your domain from the check and the
          certificate cannot be issued.
        </p>

        <H3>2 · Prove the domain is yours</H3>
        <p>
          Add the domain in Project settings under <em>Public address</em>. The
          pane then shows one <Mono>TXT</Mono> record with a token in it, of the
          shape:
        </p>
        <Records rows={[['TXT', '_motir-verify.roadmap', 'motir-verify=…']]} />
        <p>
          Copy the value from the pane rather than from here — the token is
          yours alone. Then choose <em>Verify</em>. Once we can see the record
          we request a certificate, which usually completes in a minute or two.
          You can close the page; the status keeps moving on its own, and the
          records stay available under <em>Show DNS records</em>.
        </p>

        <H2>What each status means</H2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="text-[13px] text-(--el-text-secondary)">
                <th className="border-b border-(--el-border) py-2 pr-4 font-medium">
                  Status
                </th>
                <th className="border-b border-(--el-border) py-2 pr-4 font-medium">
                  What it means
                </th>
                <th className="border-b border-(--el-border) py-2 font-medium">
                  What to do
                </th>
              </tr>
            </thead>
            <tbody>
              {STATUSES.map((row) => (
                <tr key={row.label} className="align-top">
                  <td className="border-b border-(--el-border) py-2 pr-4 font-medium whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="border-b border-(--el-border) py-2 pr-4 text-(--el-text-secondary)">
                    {row.meaning}
                  </td>
                  <td className="border-b border-(--el-border) py-2 text-(--el-text-secondary)">
                    {row.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <H2>Which address is the real one</H2>
        <p>
          A project can answer at several addresses, and exactly one of them is
          the <em>primary</em> — the one search engines and social cards are
          told about. Once a connected domain&rsquo;s certificate is live you
          can make it primary; until then the Motir address is.
        </p>
        <p>
          <strong>Every other address redirects to the primary.</strong> That
          includes your <Mono>motir.co</Mono> address once you have promoted a
          domain of your own. Visitors always arrive somewhere that works, and a
          search engine sees one page rather than three copies competing with
          each other.
        </p>

        <H2>Removing a domain</H2>
        <p>
          Removing a connected domain withdraws its certificate and the address
          stops answering — anyone using it will get an error, and links already
          shared to it stop working. Your project stays public at its other
          addresses, so removing a domain never makes a project private.
        </p>

        <H2>If something is not working</H2>
        <p>
          Three mistakes account for almost every failure, and each shows up
          differently in the pane.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>A CNAME on a root domain.</strong> Most registrars accept it
            and it does not work. The symptom is a domain that stays{' '}
            <Mono>Not verified</Mono> or reaches <Mono>Failed</Mono>. Use the{' '}
            <Mono>A</Mono> and <Mono>AAAA</Mono> records above instead.
          </li>
          <li>
            <strong>A proxying DNS provider in front of the record.</strong> If
            your provider offers to proxy or accelerate traffic, that hides the
            real record from us. The symptom is <Mono>Checking…</Mono> that
            never settles. Turn the proxy off for these records.
          </li>
          <li>
            <strong>A stale ownership record.</strong> If you removed and
            re-added a domain, the token changed. The symptom is{' '}
            <Mono>Not verified</Mono> while a <Mono>TXT</Mono> record is plainly
            there. Replace its value with the one the pane shows now.
          </li>
        </ul>
      </div>
    </>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="pt-4 font-(family-name:--font-serif) text-[20px] leading-snug font-bold text-(--el-text-strong)">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-2 text-[15px] font-semibold text-(--el-text-strong)">
      {children}
    </h3>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px]">
      {children}
    </code>
  )
}

function Records({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left font-(family-name:--font-mono) text-[13px]">
        <thead>
          <tr className="font-(family-name:--font-sans) text-[12px] text-(--el-text-secondary)">
            <th className="py-1 pr-4 font-medium">Type</th>
            <th className="py-1 pr-4 font-medium">Name</th>
            <th className="py-1 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([type, name, value]) => (
            <tr key={`${type}-${name}`}>
              <td className="py-1 pr-4">{type}</td>
              <td className="py-1 pr-4">{name}</td>
              <td className="py-1 break-all">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
