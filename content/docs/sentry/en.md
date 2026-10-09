Connect Sentry to a Motir project and the errors your services already report arrive on that project’s board as bug work items — planned, assigned and carried through to done like any other work. Fixing the bug closes the loop: Motir resolves the error in Sentry for you.

## What it does {#what-it-does}

- **Each new error becomes one bug.** Motir checks the Sentry projects you chose on a schedule. An error it has not seen before is filed as a `bug` work item in the project’s bug destination, with the error’s culprit, its level and a link back to Sentry.
- **A recurrence updates the same bug.** When an error happens again, its existing bug is updated — no duplicate is filed.
- **Done in Motir means resolved in Sentry.** When the bug reaches a done status, Motir resolves its error in Sentry.
- **Sentry’s assignee follows the error.** If an error is assigned to someone in Sentry and they are a member of the Motir workspace (matched by email), the bug is assigned to them.

Both directions can be switched off, per monitored project — see [Settings](#settings).

## Before you start {#before-you-start}

- In Motir, you need permission to manage the project’s integrations. Without it the Monitoring page tells you who to ask.
- In Sentry, you need to be allowed to install integrations in your organisation — usually an owner or manager.

## Connect Sentry {#connect-sentry}

1. In Motir, open the project’s settings and choose _Monitoring_.
2. Choose _Connect Sentry_. You are taken to Sentry.
3. In Sentry, pick your organisation and approve the install. Sentry sends you back to Motir, which shows _Sentry is connected._
4. Choose _Choose Sentry projects_, select the projects whose errors should reach this board, and confirm. Nothing arrives until you do.

You can monitor several Sentry projects from one Motir project, and add more later with _Add a monitored project_.

## Settings {#settings}

Each monitored project has its own settings:

- **Minimum level** — only errors at this level or above are filed. The default is _Every level_. Choosing a lower level also checks earlier errors from the time the project was first monitored.
- **Resolve in Sentry when the bug is done** — on by default. Turn it off to leave errors in Sentry as they are when their bugs are done.
- **Take the assignee from Sentry** — on by default. Turn it off to ignore assignments made in Sentry.

## Permissions it asks for {#permissions-it-asks-for}

Motir asks Sentry for the smallest set of permissions these features need, and nothing wider:

| Sentry scope   | What Motir uses it for                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`     | Read which organisation was connected, list its projects so you can choose which to monitor, and check that the connection still works.                                                   |
| `project:read` | Read the projects you chose to monitor.                                                                                                                                                   |
| `event:read`   | Read new errors in the monitored projects — their title, level, culprit, how often they happened, the latest stack frames and who they are assigned to — so each one can arrive as a bug. |
| `event:write`  | Mark an error resolved in Sentry when its bug is done. Nothing else is written.                                                                                                           |

The access Sentry grants is stored encrypted and is never shown back to anyone, including you.

## When the connection shows Degraded {#when-the-connection-shows-degraded}

_Degraded_ means Motir can no longer read your organisation’s errors, and nothing new reaches the board until it is fixed. Next to _Sentry says:_ the page shows the reason in Sentry’s own words.

- Choose _Re-check_ first — a passing problem on Sentry’s side clears on its own.
- If it stays degraded, choose _Reconnect_. If Sentry says the integration is already installed, uninstall Motir in your Sentry organisation’s integration settings, then choose _Reconnect_ again. Your monitored projects, their settings and the bugs already filed are kept.

## Disconnect {#disconnect}

To stop monitoring a Sentry project, use _Stop monitoring_ on its row. Removing the last monitored project is _Disconnect Sentry_: it also removes Motir’s stored access to your organisation, and to monitor it again you connect through Sentry once more.

Bugs that were already filed stay on the board as ordinary work items. Nothing in Sentry is changed by disconnecting. To revoke the access on Sentry’s side as well, uninstall Motir in your Sentry organisation’s integration settings.
