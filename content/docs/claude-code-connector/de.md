---
source: 04e1454b8c46
---

Motir ist ein Remote-MCP-Connector: Claude Code erreicht Ihr Motir-Projekt über eine einzige URL und handelt als Sie, im Rahmen dessen, was Sie genehmigen. Sie melden sich mit Ihrem Motir-Konto an und wählen einen Arbeitsbereich. Es gibt kein Token, das Sie erstellen, einfügen oder sicher aufbewahren müssten.

Es gibt zwei Wege, ihn hinzuzufügen. Verbinden Sie ihn einmal auf claude.ai, dann übernimmt Claude Code ihn überall, wo Sie mit Ihrem Claude-Konto angemeldet sind, oder fügen Sie ihn mit einem Befehl direkt in Claude Code hinzu. Möchten Sie auch die Skills von Motir? Das [{{value:pluginPage}}](/docs/claude-code-plugin) bringt diesen Connector mit.

## Bevor Sie beginnen {#before}

Sie brauchen ein Motir-Konto mit Zugriff auf das Projekt und Claude Code. Für den Weg über claude.ai muss Claude Code mit demselben Claude-Konto angemeldet sein, das Sie auf claude.ai verbinden.

## Auf claude.ai verbinden {#claude-ai}

Ein Connector, den Sie auf claude.ai verbinden, steht Ihnen in Ihren Unterhaltungen im Web, in der Desktop-App und auf dem Mobilgerät zur Verfügung sowie in Claude Code, wenn dort Ihr Claude-Konto angemeldet ist.

1. Öffnen Sie Customize → Connectors.
2. Klicken Sie auf „+“, dann auf Add custom connector, und fügen Sie die untenstehende Server-URL ein. Wählen Sie unter OAuth client die Option Use Claude’s published identity – claude.ai kennzeichnet sie als Detected, weil Motir sie unterstützt. Lassen Sie OAuth client ID und Secret leer – Motir braucht keines von beiden.
3. Klicken Sie auf Add, dann auf Connect. Claude leitet Sie zur Anmeldung und Genehmigung zu app.motir.co weiter.

{{slot:claude-ai}}

Bei einem Team- oder Enterprise-Tarif fügt ein Owner den Connector einmal unter Organization settings → Connectors → Add → Custom → Web hinzu, und jedes Mitglied klickt anschließend unter Customize → Connectors mit seinem eigenen Motir-Konto auf Connect. · [Dokumentation von Anthropic zu claude.ai]({{value:claudeAiDocsUrl}}) · Schritte geprüft am {{value:claudeAiCheckedOn}}

## Oder in Claude Code hinzufügen {#claude-code}

Fügen Sie den Connector direkt in Claude Code hinzu, ohne claude.ai.

1. Fügen Sie den Server mit dem untenstehenden Befehl hinzu – ohne Header und ohne Token.
2. Führen Sie in Claude Code `/mcp` aus, wählen Sie `motir` und folgen Sie der Anmeldung in Ihrem Browser.

{{slot:claude-code}}

Wenn Sie Claude Code mit Ihrem Claude-Konto angemeldet haben, steht ein auf claude.ai verbundener Connector dort bereits zur Verfügung. Das Plugin von Motir für Claude Code bringt diesen Server neben den Skills mit. · [Dokumentation von Anthropic zu Claude Code]({{value:claudeCodeDocsUrl}}) · Schritte geprüft am {{value:claudeCodeCheckedOn}}

## Verbindung prüfen {#check}

Führen Sie in Claude Code `/mcp` aus: Motir steht unter den Servern, und ein Server, bei dem Sie sich noch anmelden müssen, sagt das. Fragen Sie Claude dann nach Ihrem Projekt – zum Beispiel, was bereit zum Start ist – und es antwortet aus Motir.

## Was Sie genehmigen und wie Sie es zurücknehmen {#consent}

Die Anmeldeseite von Motir nennt die App, die anfragt, lässt Sie einen Arbeitsbereich wählen und listet die gewünschten Berechtigungen auf. Claude handelt dann als Sie in diesem Arbeitsbereich, im Rahmen dessen, was Sie genehmigt haben, und nie über das hinaus, was Ihre eigene Rolle erlaubt. Claude fragt nach, bevor es ein Tool verwendet, das etwas ändert, und [{{value:mcpToolsPage}}](/docs/mcp/tools) zeigt, welche Tools nur lesen, schreiben oder löschen.

Jede App, die Sie verbinden, steht unter [Verbundene Apps]({{value:connectedAppsUrl}}), in Motir unter Einstellungen → Konto → Tokens, mit ihrem Arbeitsbereich, ihren Berechtigungen und dem Zeitpunkt der letzten Verwendung. Widerrufen beendet den Zugriff bei der nächsten Anfrage. Der Leitfaden [{{value:mcpPage}}](/docs/mcp) enthält die Details des Servers und den Weg über Tokens für andere Clients und Pipelines.
