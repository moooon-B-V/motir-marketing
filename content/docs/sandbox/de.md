---
source: cdc9936762b4
---

Eine Sandbox ist ein Container, den Sie auf Ihrem eigenen Rechner starten und der Ihren eigenen Agenten, die Motir-CLI und Ihre Checkouts enthält – und sonst nichts. Sie bringen Ihre eigenen Agent-Zugangsdaten mit, schreibgeschützt eingebunden; die Schleife läuft darin, sodass ein fehlerhaft arbeitender Agent Ihren Arbeitsbaum erreicht und nicht den Rest Ihres Rechners.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Bevor Sie beginnen {#before-you-start}

- **Docker, laufend.** Gebaut für `linux/amd64` **und** `linux/arm64`, sodass Apple Silicon ein vollwertiger Rechner ist und nichts emuliert wird. Es gibt keinen Build-Schritt – Sie laden das Image.
- **Die eigene Anmeldung Ihres Agenten, auf diesem Rechner.** Sein Einbindepunkt für Zugangsdaten ist schreibgeschützt, der Container kann also eine Anmeldung nutzen, aber keine erneuern. Claude Code unter macOS ist die Ausnahme, der Sie begegnen werden: Es legt sein Token im Anmelde-Schlüsselbund ab, es gibt also keine Datei zum Einbinden, und Sie melden sich bei `claude` stattdessen **im** Container an – das Image gibt ihm ein beschreibbares Konfigurationsverzeichnis, und dort landet die Anmeldung. (Antigravity ist genauso – Schritt 2 sagt es, wenn Sie es wählen.)
- **Ihr Arbeitsbereich-Stamm – der Ordner, der Ihre Checkouts ENTHÄLT.** Ein Projekt umfasst meist mehrere Repositorys, und die Schleife läuft über alle.

{{slot:workspace}}

{{part:picker-label}}

Welchen Agenten nutzen Sie?

{{part:picker-also-supported}}

ebenfalls unterstützt

{{part:picker-or}}

oder

{{part:picker-base}}

kein Agent (Basis)

{{part:picker-summary}}

Jeder Befehl unten gilt für **{{value:profileLabel}}**. Das Umschalten schreibt den Tag und den Einbindepunkt für die Zugangsdaten in den **Schritten 1, 2 und 2b** um – die drei Stellen, an denen sie vorkommen.

{{part:chip-command}}

Befehl

{{part:chip-editor}}

In Ihrem Editor

{{part:steps-intro}}

## Einrichten {#set-it-up}

Fünf Schritte. Jeder ist eine einzige Sache.

{{part:step-1-intent}}

Das Image für Ihren Agenten laden

{{part:step-1-body}}

Es gibt keinen Build-Schritt – das Image wird pro Agentenprofil veröffentlicht.

{{part:step-2-intent}}

Den Container aus dem Stamm Ihres Arbeitsbereichs starten

{{part:step-2-body}}

Führen Sie ihn aus dem Ordner aus, der Ihre Checkouts **enthält**, nicht aus einem davon.

{{part:step-2-vscode}}

**Stattdessen VS Code verwenden?** Die Schritte 2a–2c unten ersetzen diesen. Alles danach ist in beiden Fällen gleich.

{{part:step-2a-intent}}

Die Erweiterung Dev Containers installieren

{{part:step-2a-body}}

Über die Ansicht „Erweiterungen“ oder die Befehlspalette – ⇧⌘P unter macOS, Strg+Umschalt+P sonst, F1 auf allen dreien – und dann _Extensions: Install Extensions_. Zwei dieser drei Schritte finden in der Palette statt, es lohnt sich also, sie jetzt anzuheften.

{{part:step-2b-intent}}

Die Dev-Container-Konfiguration erstellen

{{part:step-2b-body}}

Führen Sie dies in dem Ordner aus, den Sie einbinden. Ein einziges Einfügen: Es legt den Ordner `.devcontainer` an und schreibt die Datei hinein. Versuchen Sie nicht, sie in einem Dateiauswahldialog anzulegen – der Finder und die meisten grafischen Dialoge lehnen einen Namen ab, der mit einem Punkt beginnt, und tun das, ohne zu sagen, warum.

{{part:step-2b-warning}}

**Ein Dev Container behält das Image, aus dem er erstellt wurde.** `--pull=always` gehört zum Startbefehl in Schritt 2, nicht zu diesem Weg. So wechseln Sie zum aktuellen Image und zur aktuellen `motir`-CLI: **1.** Führen Sie `{{value:dockerPull}}` aus Schritt 1 in einem Terminal auf Ihrem Rechner aus; **2.** _Dev Containers: Open Folder in Container…_ für diesen Ordner, wodurch sich das Fenster verbindet; **3.** _Dev Containers: Rebuild Container_, was den Container aus dem soeben geladenen Image neu erstellt. Rebuild Container erscheint nur in einem Fenster, das mit dem Container verbunden ist, weshalb Schritt 2 zuerst kommt. Ein Neuaufbau behält Ihre Motir-Anmeldung (sie liegt auf dem Volume `{{value:authVolume}}`), aber keine Claude-Code-Anmeldung, die im Container erfolgte – führen Sie `claude` aus und melden Sie sich erneut an.

{{part:step-2c-intent}}

Den Ordner im Container öffnen

{{part:step-2c-body}}

Befehlspalette → _Dev Containers: Open Folder in Container…_, und wählen Sie den Ordner, in den Sie soeben die Datei geschrieben haben. Sein Terminal ist dieselbe Shell, in die Schritt 2 Sie gebracht hätte – machen Sie bei Schritt 3 weiter.

{{part:step-3-intent}}

Im Container anmelden

{{part:step-3-body}}

Ein Code und eine URL werden ausgegeben; genehmigen Sie in einem beliebigen Browser. Die Anmeldung landet auf dem Volume `{{value:authVolume}}`, Sie tun dies also nur einmal.

{{part:step-4-intent}}

Den Ordner mit Ihrem Projekt verknüpfen

{{part:step-4-body}}

Ersetzen Sie `ACME` durch Ihren Projektschlüssel. Hat Ihr Arbeitsbereich genau ein Projekt, lassen Sie den Schalter weg – das ist dann der ganze Schritt.

{{part:step-5-intent}}

Prüfen – alles grün ist das Ende dieser Seite

{{part:step-5-body}}

Anmeldung, Verknüpfung, die Agenten-Binärdatei und ihre Zugangsdaten. Das ist das Einzige, was Ihnen sagt, dass der Container tatsächlich bekommen hat, was Sie ihm übergeben haben.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode legt Konfiguration und Zugangsdaten an zwei Orten ab, es braucht deshalb zwei `-v`-Zeilen. Beide sind nötig.

{{part:note-antigravity}}

Antigravity legt sein Token im Schlüsselbund des Betriebssystems ab, der keine portable Datei zum Einbinden hat – es gibt dafür also keine `-v`-Zeile, und Sie melden sich IM Container an statt vor dem Start. Das ist das eine Profil, für das die zweite Voraussetzung oben nicht gilt.

{{part:note-aider}}

Die Zugangsdaten von Aider sind ein Modell-API-Schlüssel, den es aus der Umgebung liest; dies ist daher das einzige Profil, das eine `-e`-Zeile ergänzt. Die Einbindung ist eine DATEI, die existieren muss – auch leer –, sonst legt Docker an ihrer Stelle ein Verzeichnis an.

{{part:note-base}}

Das Basis-Image enthält die Motir-CLI und gar keinen Agenten – nichts zum Einbinden und nichts, bei dem Sie sich anmelden müssten, außer bei Motir selbst.

{{part:devcontainer-file}}

### Die Datei, die dieser Befehl schreibt {#devcontainer-file}

Referenz, kein Schritt – 2b hat sie bereits geschrieben. Sie steht hier für den Leser, der die Datei lieber von Hand anlegt, und weil die Anführungszeichen um `<<’JSON’` tragend sind: Sie verhindern, dass Ihre Shell `${localWorkspaceFolder}` und `${localEnv:HOME}` ersetzt, bevor sie in die Datei gelangen. Das sind Dev-Containers-Ersetzungen, und der Editor löst sie auf.

{{part:why}}

## Warum es so aussieht {#why}

### Was die Profilauswahl ändert {#profile-picker}

Die Wahl eines Agenten schreibt drei Dinge um und sonst nichts: den **Tag** des Images, die `-v`-Zeile(n) für die Zugangsdaten sowie `image`, `name` und `mounts` des Dev Containers. Es ist ein Bedienelement statt eines Absatzes, der Sie auffordert, sie selbst zu tauschen, weil jeder Befehl hier eine Kopierschaltfläche hat und ein Leser, der kopiert, ein Leser ist, der die Anweisung zum Tauschen nicht gelesen hat.

Nicht jedes Profil hat ein einziges Zugangsdaten-Verzeichnis. `opencode` hat zwei und nimmt zwei `-v`-Zeilen; `antigravity` legt sein Token im Schlüsselbund des Betriebssystems ab, nimmt keine und meldet sich stattdessen im Container an; und `aider` bindet eine Datei ein und liest einen Modellschlüssel aus der Umgebung. Die Schritte sagen es, wenn Sie sie wählen.

### Beim Startbefehl bleibt nichts erhalten, was veralten könnte {#run-command}

`--pull=always` lädt bei jedem Start das aktuelle Image, sodass ein Profil-Tag, der weitergewandert ist, bei Ihnen ankommt, ohne dass Sie es bemerken müssen, und `--rm` bedeutet, dass nichts erhalten bleibt, was veralten könnte. Es gibt keinen eigenen Weg für die Rückkehr – genau das hat früher Leute ein `motir` ausführen lassen, das Monate älter war als die Seite, von der sie es gelesen hatten. Ihre Anmeldung übersteht all das: Sie wird auf das Volume `{{value:authVolume}}` geschrieben, das außerhalb des Containers liegt, sodass Sie sich einmal anmelden und jeder spätere Lauf sie übernimmt – melden Sie sich endgültig ab mit `{{value:signOutCommand}}`. Arbeiten Sie offline? Lassen Sie `--pull=always` weg: Es erreicht bei jedem Start die Registry, sodass der Lauf ohne Netzwerk fehlschlägt, statt auf das bereits vorhandene Image zurückzufallen. All das gilt für den Startbefehl. Ein Dev Container (Schritte 2a–2c) behält das Image, aus dem er erstellt wurde, bis Sie laden, sich mit _Dev Containers: Open Folder in Container…_ verbinden und _Dev Containers: Rebuild Container_ wählen.

### Wie es weitergeht {#what-next}

`motir run` nimmt einen UMFANG – ein Arbeitselement, eine ganze Story oder `sprint` für den aktiven. `motir auto` arbeitet stattdessen die bereite Menge unbeaufsichtigt ab, ein Element nach dem anderen auf einem Sitzungs-Branch. Jeder Schalter, den beide akzeptieren, steht auf der Seite [{{value:cliPage}}](/docs/cli).

## Was sie eingrenzt – und was nicht {#confines}

Es lohnt sich, dies zu lesen, bevor Sie sich darauf verlassen, denn eines dieser drei ist eine Ausnahme und keine Garantie.

- **Dateisystem – eingegrenzt.** Die einzigen Host-Flächen im Container sind ein beschreibbares `/workspace` und die eigenen Zugangsdaten Ihres Agenten, schreibgeschützt eingebunden. Kein Docker-Socket, keine andere Einbindung vom Host.
- **Netzwerk – OFFEN, mit Absicht.** Jeder Agent braucht die API seines Anbieters, und jedes gestartete Arbeitselement braucht Git-Remotes, daher begrenzt das Image den Schadensradius im Dateisystem und nicht den ausgehenden Verkehr. Braucht Ihr Bedrohungsmodell mehr, greifen Sie zu den Netzwerkkontrollen von Docker selbst – der Container hindert einen Agenten nicht daran, mit dem Internet zu sprechen.
- **Rechte – unprivilegiert.** Er läuft als Benutzer `node` (uid 1000), sodass in die Einbindung geschriebene Dateien Ihnen gehören statt root.

## Was die Umgebung Ihnen bietet {#environment}

- **Ihr Ordner, eingebunden.** `$PWD` wird zu `/workspace`, die Checkouts, in denen der Lauf arbeitet, sind also Ihre, und die Commits, die er macht, liegen nach seinem Ende auf Ihrer Festplatte.
- **Ein Checkout pro Arbeitselement, auf einem Git-Worktree.** Ein Lauf bearbeitet nicht den Baum, in dem Sie sitzen; er legt pro Element einen Worktree an, sodass parallele Läufe nicht bei einem Branch-Checkout kollidieren können.
- **Ihre Agent-Zugangsdaten, SCHREIBGESCHÜTZT.** Das Zugangsdaten-Verzeichnis des Profils wird mit `:ro` eingebunden. Nichts im Container kann es überschreiben, und nichts davon wird an Motir gesendet – das ist Bring-your-own-Key, die Rechnung für den Agenten ist also Ihre, und der API-Aufruf läuft nie über uns.
- **Die CLI, vorinstalliert.** Das Image enthält `motir` und die Agenten-Binärdatei, die der Tag nennt, vor dem ersten Lauf ist also nichts zu installieren.
- **Die Ausgabe Ihres Agenten bleibt standardmäßig lokal.** Nur der Lebenszyklus des Laufs erreicht Motir. Mit `--report-log` wird zusätzlich das Ende der Ausgabe gesendet, damit ein fehlgeschlagener Lauf sie auf der Laufseite zeigt; es ist AUS, sofern Sie es nicht verlangen, und Dateiinhalte, Pfade und Diffs werden in beiden Fällen nie gesendet.

## Was das Token darf – und was es verweigert {#token}

Ein von `motir login` ausgestelltes Token trägt eine feste, eingeschränkte Berechtigung. Der Genehmigungsbildschirm zeigt sie und kann sie nicht ändern – weder weiter noch enger, denn eine von Hand eingeschränkte Berechtigung bricht eine unbeaufsichtigte Schleife mittendrin.

{{slot:grant}}

**Die, die es NICHT trägt, ist `ai:view_plan`, und die Ablehnung, die daraus folgt, ist der Entwurf und kein Fehler.** Einen Plan zu öffnen braucht nur `work_item:edit`, ein Sandbox-Lauf KANN also einen öffnen – und wird dann bei seinem ersten Anhängen abgelehnt, denn dieser Schlüssel wird beim Hinzufügen von Vorschlägen verlangt. Ein Lauf, der ein Arbeitselement ausführt, darf den Plan, der ihm übergeben wurde, nicht umgestalten. Begegnet Ihnen diese Ablehnung, hat der Agent das Richtige getan: Er hält die Korrektur als Kommentar fest, lässt das Element blockiert und hält an. Nichts geht verloren, und ein Mensch entscheidet, was der Plan sagen soll.

Zwei Schalter engen es weiter ein, wenn Sie einen ruhigeren Lauf wollen: `--disable-log-bug` hält den Agenten davon ab, für einen anderswo gefundenen Fehler einen Bug anzulegen (er kommentiert stattdessen), und `--disable-replan` hält ihn davon ab, für ein Arbeitselement, das er für falsch hält, eine Neuplanung einzureichen (er kommentiert und hält an). Nur bei `motir auto` geht `--auto-approve-replan` in die andere Richtung: Es genehmigt eine eingereichte Neuplanung und läuft weiter, statt für Sie anzuhalten.

## Was ein Lauf erzeugt und wo Sie es lesen {#produces}

- **Ein Branch und ein Pull Request** in jedem Repository, in dem das Element ausgeliefert wird, aus dem Container mit Ihren Git-Zugangsdaten gepusht.
- **Ein Link am Arbeitselement.** Der Lauf erklärt, welches Element jeder Pull Request liefert, sodass sein Merge das Element weiterbewegt. Dieser Link ist es, was der Bereich „Entwicklung“ der Elementseite zeigt, und er ist es, der das Element beim Merge schließt – nicht der Branch-Name und nicht der Titel.
- **Der Status, während es läuft.** Das Element wechselt auf In Arbeit, wenn der Lauf es beansprucht, und auf Umgesetzt, wenn der Pull Request geöffnet wird. In Prüfung schreibt die CI, wenn die Prüfungen grün werden, und Erledigt der Merge.
- **Das Terminal.** Die eigene Ausgabe des Agenten bleibt in Ihrem Terminal, sofern Sie nicht `--report-log` übergeben haben.

## Wenn es nicht funktioniert {#troubleshooting}

### Die Agenten-Binärdatei wird nicht gefunden {#agent-binary-not-found}

Tag und Agent passen nicht zusammen. Prüfen Sie, welches Profil Sie gestartet haben, oder verweisen Sie den Lauf mit `--agent <cmd>` auf eine andere Binärdatei. `motir doctor` meldet dies, bevor ein Lauf einen Claim daran verschwendet.

### Der Agent startet und ist nicht angemeldet {#agent-not-authenticated}

Der Einbindepunkt für die Zugangsdaten fehlt oder zeigt auf das falsche Verzeichnis – jedes Profil bindet sein eigenes ein. Führen Sie die Zeile `{{value:dockerRun}}` für den Tag, den Sie tatsächlich geladen haben, erneut aus.

### Nichts ist bereit zur Ausführung {#nothing-ready}

Jeder Kandidat hat eine unerfüllte Abhängigkeit. `motir ready` zeigt die Menge; `motir show` bei einem Arbeitselement nennt, was es blockiert. Trotzdem zu starten geht mit `--force`, nur für ein Element.

### Der Lauf hält bei einer eingereichten Neuplanung an {#stopped-on-replan}

Der Agent hat das Arbeitselement für falsch befunden und eine korrigierte Form vorgeschlagen. Das ist der beabsichtigte Halt: Lesen Sie den Plan in Motir und genehmigen oder lehnen Sie ihn ab. Um stattdessen eine unbeaufsichtigte Schleife am Laufen zu halten, führen Sie `motir auto` mit `--auto-approve-replan` aus.

### Ein Lauf hat nach seinem Ende Arbeit zurückgelassen {#work-left-behind}

Die Worktrees und Branches liegen auf Ihrer Festplatte, unter dem Ordner, den Sie eingebunden haben – ein beendeter Container hat sie nicht mitgenommen. `motir done` schließt ein gemergtes Element ab, oder mit `--session <branch>` einen ganzen gemergten Sitzungs-Branch.

## Was diese Seite nicht abdeckt {#not-covered}

Jeden Befehl und jeden Schalter – das ist die Seite [{{value:cliPage}}](/docs/cli), die aus dem eigenen Katalog der CLI erzeugt wird und nicht davon abweichen kann. Einen Agenten direkt mit Motir zu verbinden, ohne die CLI, beschreibt [{{value:mcpPage}}](/docs/mcp). Dieselbe Arbeitsschleife über HTTP statt vom Terminal aus zu steuern beschreibt die [{{value:apiPage}}](/docs/api). Die Sandbox anderswo als auf Ihrem eigenen Rechner zu betreiben, ist hier noch nicht dokumentiert. (Der Weg über VS Code IST dokumentiert, oben – dieser Satz sagte früher etwas anderes und hielt einen gelöschten Abschnitt als Entscheidung fest.)
