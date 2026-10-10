---
source: f11baeff4d7b
---

{{slot:catalogue-summary}}

Diese Liste wird beim Aufruf der Seite von Motir abgerufen und entspricht daher dem, was der Server gerade ausliefert. Zu jedem Tool werden die Argumente angezeigt, die es entgegennimmt – ihre Namen, ihre Typen und welche davon erforderlich sind. Sie stammen aus derselben Registry, die auch einen `tools/list`-Handshake gegen den oben angezeigten Endpunkt beantwortet; dieser bleibt die maßgebliche Quelle und enthält die vollständige Beschreibung jedes Tools. Welche dieser Tools ein bestimmtes Token aufrufen darf, hängt von seiner Berechtigung ab. Die Liste, die Ihr Client anzeigt, ist also bereits auf Sie zugeschnitten.

{{slot:hint-legend}}

Argumenttabellen zeigen eine Ebene: Ein verschachteltes Objekt oder eine Liste zeigt ihren Typ, und der Handshake liefert die Struktur darin.

{{slot:catalogue}}

[MCP-Server](/docs/mcp) beschreibt, wie Sie einen Agenten mit dem Endpunkt verbinden und welches Token er dafür braucht.
