import { localePageMetadata } from '@/lib/localeMetadata'
import type { Metadata } from 'next'
import { getCopy } from '@/lib/copy'
import { enterLocale, type LocalePageProps } from '@/i18n/locale'

/*
 * The SENTRY guide (MOTIR-6007) — committed prose, for the person connecting
 * their team's Sentry organisation to a Motir project, and for Sentry's own
 * reviewers, who read it during publication review (MOTIR-6004).
 *
 * ⚠️ EVERY LABEL IS COPIED FROM THE PRODUCT, NOT FROM MEMORY. The button,
 * switch and status names below are motir-core's shipped `monitoring.*` strings
 * (`messages/en.json`). A guide naming a control the screen does not have sends
 * a reader looking for it; when the product's wording changes, this page does.
 *
 * ⚠️ SENTRY'S "ISSUES" ARE CALLED ERRORS HERE, ON PURPOSE. `issue` is a banned
 * word on every docs page (`tests/docs/terminology.test.tsx`): in Motir the unit
 * of work is a work item, and the rule has no exemption for another product's
 * vocabulary. So a Sentry issue is "an error" throughout, and the permissions
 * are named by Sentry's own scope identifiers rather than by the label Sentry
 * groups them under.
 *
 * ⚠️ NO NUMBERS THAT LIVE ELSEWHERE. The check interval and Sentry's token
 * lifetime are the product's and Sentry's to change; the page says what happens,
 * not how often.
 */

export function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  return localePageMetadata(params, '/docs/sentry', (copy) => ({
    title: copy.docs.metaTitleSentry,
    description: copy.docs.metaDescriptionSentry,
  }))
}

const SCOPES: { scope: string; why: string }[] = [
  {
    scope: 'org:read',
    why: 'Read which organisation was connected, list its projects so you can choose which to monitor, and check that the connection still works.',
  },
  {
    scope: 'project:read',
    why: 'Read the projects you chose to monitor.',
  },
  {
    scope: 'event:read',
    why: 'Read new errors in the monitored projects — their title, level, culprit, how often they happened, the latest stack frames and who they are assigned to — so each one can arrive as a bug.',
  },
  {
    scope: 'event:write',
    why: 'Mark an error resolved in Sentry when its bug is done. Nothing else is written.',
  },
]

export default async function SentryDocsPage({ params }: LocalePageProps) {
  const locale = await enterLocale(params)
  const copy = await getCopy(locale)
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.sentry}
      </h1>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          Connect Sentry to a Motir project and the errors your services already
          report arrive on that project’s board as bug work items — planned,
          assigned and carried through to done like any other work. Fixing the
          bug closes the loop: Motir resolves the error in Sentry for you.
        </p>

        <H2>What it does</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Each new error becomes one bug.</strong> Motir checks the
            Sentry projects you chose on a schedule. An error it has not seen
            before is filed as a <Mono>bug</Mono> work item in the project’s bug
            destination, with the error’s culprit, its level and a link back to
            Sentry.
          </li>
          <li>
            <strong>A recurrence updates the same bug.</strong> When an error
            happens again, its existing bug is updated — no duplicate is filed.
          </li>
          <li>
            <strong>Done in Motir means resolved in Sentry.</strong> When the
            bug reaches a done status, Motir resolves its error in Sentry.
          </li>
          <li>
            <strong>Sentry’s assignee follows the error.</strong> If an error is
            assigned to someone in Sentry and they are a member of the Motir
            workspace (matched by email), the bug is assigned to them.
          </li>
        </ul>
        <p>
          Both directions can be switched off, per monitored project — see{' '}
          <a
            href="#settings"
            className="text-(--el-link) underline underline-offset-2"
          >
            Settings
          </a>
          .
        </p>

        <H2>Before you start</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            In Motir, you need permission to manage the project’s integrations.
            Without it the Monitoring page tells you who to ask.
          </li>
          <li>
            In Sentry, you need to be allowed to install integrations in your
            organisation — usually an owner or manager.
          </li>
        </ul>

        <H2>Connect Sentry</H2>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            In Motir, open the project’s settings and choose <em>Monitoring</em>
            .
          </li>
          <li>
            Choose <em>Connect Sentry</em>. You are taken to Sentry.
          </li>
          <li>
            In Sentry, pick your organisation and approve the install. Sentry
            sends you back to Motir, which shows <em>Sentry is connected.</em>
          </li>
          <li>
            Choose <em>Choose Sentry projects</em>, select the projects whose
            errors should reach this board, and confirm. Nothing arrives until
            you do.
          </li>
        </ol>
        <p>
          You can monitor several Sentry projects from one Motir project, and
          add more later with <em>Add a monitored project</em>.
        </p>

        <H2 id="settings">Settings</H2>
        <p>Each monitored project has its own settings:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Minimum level</strong> — only errors at this level or above
            are filed. The default is <em>Every level</em>. Choosing a lower
            level also checks earlier errors from the time the project was first
            monitored.
          </li>
          <li>
            <strong>Resolve in Sentry when the bug is done</strong> — on by
            default. Turn it off to leave errors in Sentry as they are when
            their bugs are done.
          </li>
          <li>
            <strong>Take the assignee from Sentry</strong> — on by default. Turn
            it off to ignore assignments made in Sentry.
          </li>
        </ul>

        <H2>Permissions it asks for</H2>
        <p>
          Motir asks Sentry for the smallest set of permissions these features
          need, and nothing wider:
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="text-[13px] text-(--el-text-secondary)">
                <th className="border-b border-(--el-border) py-2 pr-4 font-medium">
                  Sentry scope
                </th>
                <th className="border-b border-(--el-border) py-2 font-medium">
                  What Motir uses it for
                </th>
              </tr>
            </thead>
            <tbody>
              {SCOPES.map((row) => (
                <tr key={row.scope} className="align-top">
                  <td className="border-b border-(--el-border) py-2 pr-4 whitespace-nowrap">
                    <Mono>{row.scope}</Mono>
                  </td>
                  <td className="border-b border-(--el-border) py-2 text-(--el-text-secondary)">
                    {row.why}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The access Sentry grants is stored encrypted and is never shown back
          to anyone, including you.
        </p>

        <H2>When the connection shows Degraded</H2>
        <p>
          <em>Degraded</em> means Motir can no longer read your organisation’s
          errors, and nothing new reaches the board until it is fixed. Next to{' '}
          <em>Sentry says:</em> the page shows the reason in Sentry’s own words.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Choose <em>Re-check</em> first — a passing problem on Sentry’s side
            clears on its own.
          </li>
          <li>
            If it stays degraded, choose <em>Reconnect</em>. If Sentry says the
            integration is already installed, uninstall Motir in your Sentry
            organisation’s integration settings, then choose <em>Reconnect</em>{' '}
            again. Your monitored projects, their settings and the bugs already
            filed are kept.
          </li>
        </ul>

        <H2>Disconnect</H2>
        <p>
          To stop monitoring a Sentry project, use <em>Stop monitoring</em> on
          its row. Removing the last monitored project is{' '}
          <em>Disconnect Sentry</em>: it also removes Motir’s stored access to
          your organisation, and to monitor it again you connect through Sentry
          once more.
        </p>
        <p>
          Bugs that were already filed stay on the board as ordinary work items.
          Nothing in Sentry is changed by disconnecting. To revoke the access on
          Sentry’s side as well, uninstall Motir in your Sentry organisation’s
          integration settings.
        </p>
      </div>
    </>
  )
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="pt-4 font-(family-name:--font-serif) text-[20px] leading-snug font-bold text-(--el-text-strong)"
    >
      {children}
    </h2>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px] whitespace-nowrap">
      {children}
    </code>
  )
}
