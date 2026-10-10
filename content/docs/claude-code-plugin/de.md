---
source: 758198e00644
---

Das Plugin von Motir für Claude Code bringt Ihr Motir-Projekt mit einer einzigen Installation in Claude Code: die Skills von Motir, den MCP-Server und einen Runner für die CLI. Die Anmeldung erfolgt mit Ihrem Motir-Konto im Browser, ein Token ist also nicht nötig. Sagen Sie `motir run`, und Claude Code nimmt das nächste bereite Arbeitselement, setzt es um und öffnet einen verknüpften Pull Request.

Das Plugin wird aus [{{value:skillsRepo}}]({{value:repoUrl}}) veröffentlicht, das zugleich ein Marketplace für Claude-Code-Plugins ist. Jeder Befehl auf dieser Seite installiert das Release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Bevor Sie beginnen {#before}

Sie brauchen Claude Code, ein Motir-Konto mit Zugriff auf das Projekt und `git`. Der Runner benötigt Node.js 22 oder neuer, und die Skills, die Pull Requests öffnen oder lesen, benötigen die GitHub CLI (`gh`).

## Installation {#install}

Fügen Sie den Marketplace beim Release-Tag hinzu und installieren Sie dann das Plugin. Führen Sie beides in Claude Code aus.

{{slot:install}}

## Was es mitbringt {#brings}

- **Die sieben Skills.** Jeder Skill des Releases, aufgeführt unter dem Namen des Plugins.
- **Der Motir-MCP-Server.** Claude Code meldet sich bei der ersten Verwendung im Browser an: Führen Sie `/mcp` aus, wählen Sie `motir` und dann _Authenticate_, wählen Sie anschließend den Arbeitsbereich und genehmigen Sie auf dem Zustimmungsbildschirm von Motir. Es gibt kein Token, das Sie erstellen oder einfügen müssten.
- **Der Runner `motir`.** Führt die festgelegte Motir-CLI mit `npx` aus, sodass nichts global installiert wird. Er benötigt Node.js 22 oder neuer, und die CLI meldet sich selbst mit `motir login` an.

## Prüfen, ob es funktioniert hat {#check}

So prüfen Sie es: `/plugin` zeigt `motir` in der Version `{{value:releaseVersion}}`, und `/mcp` listet `motir` auf. Die Skills eines Plugins werden unter dem Namen des Plugins aufgeführt, zum Beispiel `/motir:motir-run`.

## Verwenden {#use}

Sagen Sie in Claude Code, was Sie möchten. Das vollständige Verhalten jedes Skills und was Sie dabei in Motir sehen, steht im Leitfaden [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Aktualisieren {#updating}

Ein Marketplace, der bei einem Release hinzugefügt wurde, lässt sich nicht noch einmal bei einem anderen hinzufügen. Entfernen Sie ihn deshalb zuerst. Das Entfernen deinstalliert das Plugin, und die letzte Zeile installiert es beim neuen Release erneut.

{{slot:update}}

Sie nutzen einen anderen Agenten oder möchten nur den Connector? Im Leitfaden [{{value:skillsPage}}](/docs/skills) finden Sie alle Agenten, und der [{{value:connectorPage}}](/docs/claude-code-connector) beschreibt den Connector.
