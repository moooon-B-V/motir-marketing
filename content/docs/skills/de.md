---
source: 38ac3b50e511
---

Die Skills von Motir lassen den Agenten, den Sie ohnehin nutzen, an Ihrem Motir-Projekt arbeiten. Sagen Sie `motir run`, und er nimmt das nächste bereite Arbeitselement, setzt es um und öffnet einen verknüpften Pull Request. Sagen Sie `motir log bug`, und er prüft den Fehler und legt ihn dort ab, wo er hingehört. Sagen Sie `motir mark`, und er schließt ein manuelles Arbeitselement, sobald Sie es erledigt haben. Sagen Sie `motir guide`, und er führt Sie Schritt für Schritt durch ein manuelles Arbeitselement.

Es sind gewöhnliche [Agent Skills](https://agentskills.io): ein Ordner pro Skill, jeweils mit einer `SKILL.md`, veröffentlicht in [{{value:skillsRepo}}]({{value:repoUrl}}). Jeder Befehl auf dieser Seite installiert das Release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Bevor Sie beginnen {#before}

Die Skills sprechen über den MCP-Server mit Motir. In Claude Code verbindet das Plugin ihn für Sie: Sie melden sich mit Ihrem Motir-Konto im Browser an, ein Token gibt es nicht. Jeder andere Agent braucht diesen Server zuerst verbunden – ein Motir-Projekt, ein persönliches Zugriffstoken und die Einrichtung für Ihren Agenten im Leitfaden [{{value:mcpPage}}](/docs/mcp), der auch den Weg über ein Token in Claude Code beschreibt, falls Sie die Anmeldung im Browser nicht nutzen können. Ein Token mit den Standardberechtigungen kann alles, was diese Skills tun. Außerdem brauchen Sie `git` und die GitHub CLI (`gh`) für die Skills, die Pull Requests öffnen oder lesen.

## Installation {#install}

Wählen Sie Ihren Agenten. Jeder Abschnitt installiert jeden Skill des Releases für jedes Projekt auf Ihrem Rechner. Die Terminalbefehle gelten für macOS und Linux: Sie laden das Release herunter, kopieren die Skill-Ordner in den Ordner, den dieser Agent liest, und entfernen den Download.

### Claude Code {#claude-code}

Das Repository ist zugleich ein Marketplace für Claude-Code-Plugins. Fügen Sie ihn beim Release-Tag hinzu und installieren Sie dann das Plugin. Eine Installation bringt die Skills, den MCP-Server von Motir und einen Runner für dessen CLI mit und verbindet Motir ohne Token.

- **Die sieben Skills.** Jeder Skill des Releases, aufgeführt unter dem Namen des Plugins.
- **Der Motir-MCP-Server.** Claude Code meldet sich bei der ersten Verwendung im Browser an: Führen Sie `/mcp` aus, wählen Sie `motir` und dann _Authenticate_, wählen Sie anschließend den Arbeitsbereich und genehmigen Sie auf dem Zustimmungsbildschirm von Motir. Es gibt kein Token, das Sie erstellen oder einfügen müssten. [Motir zu Claude hinzufügen](/docs/mcp#claude)
- **Der Runner `motir`.** Führt die festgelegte Motir-CLI mit `npx` aus, sodass nichts global installiert wird. Er benötigt Node.js 22 oder neuer, und die CLI meldet sich selbst mit `motir login` an.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

So prüfen Sie es: `/plugin` zeigt `motir` in der Version `{{value:releaseVersion}}`, und `/mcp` listet `motir` auf. Die Skills eines Plugins werden unter dem Namen des Plugins aufgeführt, zum Beispiel `/motir:motir-run`. Das Kopieren der Skills bringt nur die Skills mit – verbinden Sie den MCP-Server selbst, wie es die anderen Agenten tun. Kopieren Sie für nur ein Repository stattdessen nach `.claude/skills` in diesem Repository. · [Dokumentation zu Claude Code]({{value:claudeCodeDocsUrl}}) · geprüft am {{value:checkedOn}}

### Codex {#codex}

Codex liest Skills aus `.agents/skills` – in Ihrem Home-Verzeichnis für jedes Repository oder in einem Repository nur für dieses.

{{slot:codex}}

Codex bemerkt neue Skills von selbst. Erscheinen sie nicht, starten Sie es neu. · [Dokumentation zu Codex]({{value:codexDocsUrl}}) · geprüft am {{value:checkedOn}}

### Cursor {#cursor}

Cursor liest Skills aus `~/.cursor/skills` für jedes Projekt und aus `.cursor/skills` in einem Projekt.

{{slot:cursor}}

Cursor liest außerdem `~/.agents/skills` und `~/.claude/skills`, sodass Skills, die Sie bereits für Codex oder Claude Code kopiert haben, ohne zweite Kopie erkannt werden. · [Dokumentation zu Cursor]({{value:cursorDocsUrl}}) · geprüft am {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI liest Ihre eigenen Skills aus `~/.gemini/skills` und die eines Arbeitsbereichs aus `.gemini/skills`.

{{slot:gemini-cli}}

Führen Sie `gemini skills list` aus, um zu prüfen, ob sie gefunden wurden. Gemini CLI liest außerdem `~/.agents/skills`. · [Dokumentation zu Gemini CLI]({{value:geminiCliDocsUrl}}) · geprüft am {{value:checkedOn}}

### GitHub Copilot in VS Code {#copilot-vs-code}

Copilot in VS Code liest Ihre persönlichen Skills aus `~/.copilot/skills` und die eines Projekts aus `.github/skills`.

{{slot:copilot-vs-code}}

Es liest außerdem `~/.claude/skills` und `~/.agents/skills`. Für diese Ordner muss keine Einstellung aktiviert werden. · [Dokumentation zu GitHub Copilot in VS Code]({{value:copilotDocsUrl}}) · geprüft am {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode liest Ihre eigenen Skills aus `~/.config/opencode/skills` und die eines Projekts aus `.opencode/skills`.

{{slot:opencode}}

Es liest außerdem `~/.claude/skills` und `~/.agents/skills`. Führen Sie `opencode debug skill` aus, um zu sehen, was gefunden wurde. · [Dokumentation zu OpenCode]({{value:opencodeDocsUrl}}) · geprüft am {{value:checkedOn}}

Fragen Sie dann Ihren Agenten, welche Skills er hat. {{value:releaseSkills}} werden aufgeführt. Ein anderer Agent, der `SKILL.md`-Skills liest, funktioniert genauso: Kopieren Sie die Skill-Ordner in den Ordner, aus dem er Skills liest.

## Verwenden {#use}

Geben Sie in Ihren Agenten ein, was unter **Sagen Sie** steht. Ersetzen Sie `ACME-12` durch den Schlüssel eines Arbeitselements in Ihrem eigenen Projekt.

### `motir-run` {#motir-run}

**Sagen Sie**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Was geschieht**

Nimmt das nächste bereite Arbeitselement in Ihrem Projekt oder das, das Sie nennen, und setzt es um. Zuerst räumt es nach früheren Läufen auf, deren Pull Requests gemergt wurden, beansprucht dann das Arbeitselement, setzt es auf einem eigenen Branch um, öffnet einen Pull Request und verknüpft diesen mit dem Arbeitselement. Nennen Sie eine Story, deren Kinder keine eigenen Kinder haben, und es führt die ganze Story aus: ein Branch und ein Pull Request pro Repository, mit einem Commit pro Kind. `motir next` hält nach dem Beanspruchen an und gibt den Prompt aus, den Sie selbst an einen Agenten übergeben. Eine Ausnahme ist ein Entscheidungs-Arbeitselement: Es schreibt die Entscheidungsseite und veröffentlicht sie zu Ihrer Genehmigung, ohne Branch und ohne Pull Request.

**Was Sie in Motir sehen**

Das Arbeitselement wird Ihnen zugewiesen und wechselt auf In Arbeit, danach auf Umgesetzt, sobald sein Pull Request geöffnet ist. Seine Seite zeigt den Pull Request und einen Abschnitt „So wird getestet“. Motir setzt es auf In Prüfung, wenn die CI besteht, und auf Erledigt, wenn der Pull Request gemergt wird; der Skill tut keines von beidem.

### `motir-fix` {#motir-fix}

**Sagen Sie**

- `motir fix ACME-12`

**Was geschieht**

Repariert einen roten Pull Request, nachdem der Lauf, der ihn geöffnet hat, beendet ist: Seine Prüfungen sind fehlgeschlagen, die Merge-Queue hat ihn hinausgeworfen, oder ein Reviewer hat das Abnahmevideo der Story mit „Neuer Lauf“ zurückgegeben. Zuerst beansprucht es die Reparatur, damit niemand sonst darüber hinwegpusht. Dann repariert es jeden Pull Request des Arbeitselements auf dem Branch, den er schon hat, nie auf einem neuen: Es mergt den Basis-Branch ein, behebt, was die fehlgeschlagene Prüfung benannt hat, und pusht. Es macht weiter, bis die CI grün ist oder es fünfmal versucht hat, und es nimmt das Abnahmevideo erneut auf, sobald die CI nach einem „Neuer Lauf“ grün ist. Es öffnet nie einen Pull Request, mergt keinen und ändert den Status des Arbeitselements nicht. Nicht dasselbe wie `motir fix bugs`, das den Bugs-Ordner Ihres Projekts abarbeitet: `motir fix ACME-12` repariert die Pull Requests eines einzelnen, von Ihnen benannten Arbeitselements.

**Was Sie in Motir sehen**

Solange die Reparatur läuft, sagt der Abschnitt „Entwicklung“ des Arbeitselements, dass es repariert wird und von wem. Dieselben Pull Requests erhalten neue Commits, und Motir setzt das Arbeitselement von selbst weiter, sobald ihre Prüfungen bestehen. Gibt die Reparatur auf, sagt das Arbeitselement das und wie viele Versuche sie unternommen hat.

### `motir-continue` {#motir-continue}

**Sagen Sie**

- `motir continue ACME-12`

**Was geschieht**

Führt ein Arbeitselement fort, dessen Lauf unterwegs abgestürzt ist: Der Laptop wurde geschlossen, die Sandbox ging verloren oder der Prozess wurde beendet. Das Arbeitselement steht noch auf In Arbeit, und seine Arbeit liegt auf dem Branch, den dieser Lauf hinterlassen hat. Zuerst beansprucht es das Fortsetzen, damit niemand sonst am selben Branch arbeitet. Dann checkt es diesen Branch in jedem Repository aus, das das Arbeitselement umfasst, nie einen neuen und ohne zurückzusetzen, was dort schon liegt, und führt die Arbeit von der Stelle an fort, an der sie aufgehört hat. Es liefert so aus wie ein neuer Lauf: ein Pull Request pro Repository, verknüpft mit dem Arbeitselement. Verwenden Sie stattdessen `motir fix ACME-12`, wenn das Arbeitselement bereits einen roten Pull Request hat, und `motir run ACME-12` für ein Arbeitselement, das niemand begonnen hat.

**Was Sie in Motir sehen**

Ein Arbeitselement, dessen Lauf abgestürzt ist, zeigt in seinem Abschnitt „Entwicklung“ „Lauf abgebrochen“, mit dem Befehl `motir continue` zum Kopieren. Während das Fortsetzen läuft, sagt dieser Abschnitt, dass es fortgesetzt wird und von wem. Wenn es fertig ist, geht das Arbeitselement genau wie nach `motir run` weiter: auf Umgesetzt, mit verknüpften Pull Requests und einem Abschnitt „So wird getestet“.

### `motir-log-bug` {#motir-log-bug}

**Sagen Sie**

- `motir log bug the export button does nothing on an empty board`

**Was geschieht**

Behandelt das, was Sie eingegeben haben, als Behauptung, die zu prüfen ist. Es findet zuerst die Ursache im Code, sucht nach einem Arbeitselement, das jemand schon angelegt hat, und legt nichts an, wenn sich das Verhalten als korrekt herausstellt. Andernfalls legt es einen Bug an: unter der Story, die er aufhält, oder im Bugs-Ordner Ihres Projekts, wenn er nichts aufhält.

**Was Sie in Motir sehen**

Ein neues Bug-Arbeitselement mit der Ursache, der Stelle im Code und der Anleitung zur Reproduktion, verknüpft mit dem Arbeitselement, bei dem er gefunden wurde. Blockiert er das Arbeitselement, das Sie gerade ausführen, wechselt dieses auf Blockiert.

### `motir-mark` {#motir-mark}

**Sagen Sie**

- `motir mark ACME-12 done`

**Was geschieht**

Schließt ein Arbeitselement, das kein Pull Request schließen kann: ein manuelles, etwa ein Konto anlegen, ein Geheimnis setzen oder eine Einstellung ändern. Dass Sie es sagen, ist Ihre Bestätigung, dass die Arbeit erledigt ist. Es lehnt ein Arbeitselement mit Pull Request ab, weil dessen Merge es schließt.

**Was Sie in Motir sehen**

Das Arbeitselement wechselt auf Erledigt, mit einem Kommentar, der festhält, dass Sie es bestätigt haben. Der Status des übergeordneten Elements folgt aus seinen Kindern.

### `motir-guide` {#motir-guide}

**Sagen Sie**

- `motir guide ACME-12`
- `motir guide`

**Was geschieht**

Führt Sie Schritt für Schritt durch ein manuelles Arbeitselement. Nennen Sie eines, oder sagen Sie nur `motir guide`, dann nimmt es Ihr eigenes unfertiges, sonst das nächste bereite manuelle Arbeitselement. Es gibt Ihnen einen Schritt mit seiner Anleitung und gegebenenfalls einem Befehl zum Kopieren und wartet. Sagen Sie „erledigt“, dann prüft es, was es ohne Änderungen prüfen kann, etwa eine Adresse abrufen oder einen schreibgeschützten Befehl ausführen, und sagt Ihnen, was es gesehen hat. Ein Schritt, dessen Prüfung fehlschlägt, wird nicht abgehakt; Sie erhalten denselben Schritt erneut. Sie können bei jedem Schritt aufhören, und `motir guide` macht dort weiter, wo Sie aufgehört haben. Hat das Arbeitselement noch keine Schritte, schlägt es aus der Beschreibung welche vor und fragt Sie, bevor es sie auf das Arbeitselement schreibt. Erweist sich ein Schritt als falsch, bietet es eine Korrektur an und ändert den Schritt oder den Text des Arbeitselements nur, wenn Sie zustimmen.

**Was Sie in Motir sehen**

Das Arbeitselement wird Ihnen zugewiesen und wechselt auf In Arbeit. Seine To-do-Liste hakt jeden Schritt ab, sobald Sie ihn erledigt haben, mit der Angabe, wer es war. Ist der letzte Schritt abgehakt, wechselt das Arbeitselement auf Erledigt, mit einem Kommentar, der jeden Schritt und seine Bestätigung zusammenfasst.

### `motir-fix-bugs` {#motir-fix-bugs}

**Sagen Sie**

- `motir fix bugs`
- `motir fix bugs 3`

**Was geschieht**

Arbeitet die Bugs im Bugs-Ordner Ihres Projekts ab, die noch auf Zu erledigen stehen, einen nach dem anderen, den ältesten zuerst. Bugs in Ordnern innerhalb von Bugs bleiben unberührt. Bei jedem prüft es zuerst, ob der Bug auf Ihrem Standard-Branch real ist, und gibt ihm dann genau ein Ergebnis. Ein Bug, den es beheben kann, erhält einen Pull Request, der diesen Bug und sonst nichts behebt. Ein Bug, der auf ein anderes, noch nicht abgeschlossenes Arbeitselement wartet, wird mit diesem verknüpft und unter dieselbe Story verschoben. Ein Bug, den es hier nicht beheben kann, erhält einen Kommentar und wird beiseitegelegt: bereits behoben, mit dem, was ihn behoben hat; nicht reproduzierbar, mit dem, was es ausgeführt hat; oder braucht Ihre Entscheidung, mit der Frage und seiner Empfehlung. Jedes Ergebnis nimmt den Bug aus Zu erledigen, sodass der Lauf von selbst endet. Fügen Sie eine Zahl hinzu, hält er nach so vielen Bugs an. Er endet mit einem Bericht, der die Bugs, die auf Sie warten, zuerst aufführt.

**Was Sie in Motir sehen**

Ein behobener Bug wechselt mit verknüpftem Pull Request auf Umgesetzt und auf Erledigt, wenn Sie ihn mergen. Ein Bug, der auf andere Arbeit wartet, wechselt auf Blockiert, mit einem Link „blockiert durch“ auf dieses Arbeitselement. Ein bereits behobener Bug wechselt auf Erledigt. Einer, den es nicht reproduzieren kann, oder einer, der Ihre Entscheidung braucht, wechselt auf Blockiert. Jeder davon hat einen Kommentar mit dem Beleg oder der Frage. Beantworten Sie die Frage und setzen Sie den Bug zurück auf Zu erledigen, dann nimmt ihn der nächste Lauf auf.

## Wenn ein Arbeitselement falsch ist {#wrong}

Manchmal lässt sich ein Arbeitselement nicht wie geschrieben umsetzen. Es verlangt vielleicht etwas, das nicht existiert, braucht einen Entwurf, den niemand gezeichnet hat, oder greift in zwei Repositorys. `motir-run` rät sich nicht um das Problem herum. Es setzt das Arbeitselement auf **In Planung**, damit kein anderer Lauf es aufnimmt, und bittet den Motir AI Planer, die Korrektur zu planen. Dann hält es an. Der Plan wartet darauf, dass Sie ihn in Motir prüfen und genehmigen, und bis dahin wird nichts umgesetzt.

Kann Ihr Token die KI-Planung nicht nutzen oder sind Ihre KI-Guthaben aufgebraucht, hält es trotzdem an. Es hinterlässt am Arbeitselement einen Kommentar mit der gesamten Korrektur und nennt den Grund, warum es sie nicht übergeben konnte.

## Aktualisieren {#updating}

Ein neues Release hat einen neuen Tag, und diese Seite zieht mit. Führen Sie bei einer Kopier-Installation den Installationsschritt Ihres Agenten erneut aus: Er überschreibt die Skill-Ordner an Ort und Stelle. In Claude Code lässt sich ein Marketplace nicht erneut bei einem anderen Tag hinzufügen, entfernen Sie ihn also, fügen Sie ihn beim neuen Tag hinzu und installieren Sie das Plugin erneut:

{{slot:update}}

Starten Sie Ihren Agenten danach neu, damit er die neuen Versionen liest.
