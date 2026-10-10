---
source: 38ac3b50e511
---

Met de skills van Motir laat je de agent die je al gebruikt aan je Motir-project werken. Zeg `motir run` en hij pakt het volgende gereed werkitem, bouwt het en opent een gekoppelde pull request. Zeg `motir log bug` en hij controleert het defect en maakt het aan waar het hoort. Zeg `motir mark` en hij sluit een handmatig werkitem zodra jij het hebt gedaan. Zeg `motir guide` en hij loopt een handmatig werkitem met je door, stap voor stap.

Het zijn gewone [Agent Skills](https://agentskills.io): één map per skill, elk met een `SKILL.md`, gepubliceerd in [{{value:skillsRepo}}]({{value:repoUrl}}). Elk commando op deze pagina installeert release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Voordat je begint {#before}

De skills praten met Motir via zijn MCP-server. In Claude Code verbindt de plugin die voor je: je meldt je aan met je Motir-account in de browser, en er is geen token. Elke andere agent heeft die server eerst verbonden nodig — een Motir-project, een persoonlijk toegangstoken en de configuratie voor je agent in de gids [{{value:mcpPage}}](/docs/mcp), die ook de tokenroute in Claude Code behandelt als je de aanmelding via de browser niet kunt gebruiken. Een token met de standaardrechten kan alles wat deze skills doen. Je hebt ook `git` nodig, en de GitHub CLI (`gh`) voor de skills die pull requests openen of lezen.

## Installeren {#install}

Kies je agent. Elke sectie installeert elke skill in de release voor elk project op je machine. De terminalcommando’s zijn voor macOS en Linux: ze halen de release op, kopiëren de skillmappen naar de map die die agent leest en verwijderen de download.

### Claude Code {#claude-code}

De repository is ook een Claude Code-pluginmarktplaats. Voeg hem toe op de releasetag en installeer dan de plugin. Eén installatie brengt de skills, de MCP-server van Motir en een runner voor zijn CLI mee, en verbindt Motir zonder token.

- **De zeven skills.** Elke skill in de release, vermeld onder de naam van de plugin.
- **De Motir MCP-server.** Claude Code logt er de eerste keer dat hij wordt gebruikt in de browser op in: voer `/mcp` uit, kies `motir` en kies _Authenticate_, kies dan de werkruimte en keur goed op het toestemmingsscherm van Motir. Er is geen token om aan te maken of te plakken. [Voeg Motir toe aan Claude](/docs/mcp#claude)
- **De `motir`-runner.** Draait de vastgezette Motir CLI met `npx`, dus er wordt niets globaal geïnstalleerd. Hij heeft Node.js 22 of nieuwer nodig, en de CLI logt zelf in met `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Om te controleren: `/plugin` toont `motir` op `{{value:releaseVersion}}`, en `/mcp` toont `motir`. De skills van een plugin staan onder de naam van de plugin, bijvoorbeeld `/motir:motir-run`. Het kopiëren van de skills brengt alleen de skills mee — verbind de MCP-server zelf, zoals de andere agents. Voor slechts één repository kopieer je in plaats daarvan naar `.claude/skills` in die repository. · [Documentatie van Claude Code]({{value:claudeCodeDocsUrl}}) · gecontroleerd {{value:checkedOn}}

### Codex {#codex}

Codex leest skills uit `.agents/skills` — in je thuismap voor elke repository, of in een repository voor die repository alleen.

{{slot:codex}}

Codex merkt nieuwe skills zelf op. Verschijnen ze niet, herstart hem dan. · [Documentatie van Codex]({{value:codexDocsUrl}}) · gecontroleerd {{value:checkedOn}}

### Cursor {#cursor}

Cursor leest skills uit `~/.cursor/skills` voor elk project, en uit `.cursor/skills` in een project.

{{slot:cursor}}

Cursor leest ook `~/.agents/skills` en `~/.claude/skills`, dus skills die je al voor Codex of Claude Code hebt gekopieerd, worden opgepikt zonder tweede kopie. · [Documentatie van Cursor]({{value:cursorDocsUrl}}) · gecontroleerd {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI leest je eigen skills uit `~/.gemini/skills`, en die van een werkruimte uit `.gemini/skills`.

{{slot:gemini-cli}}

Voer `gemini skills list` uit om te controleren of ze zijn gevonden. Gemini CLI leest ook `~/.agents/skills`. · [Documentatie van Gemini CLI]({{value:geminiCliDocsUrl}}) · gecontroleerd {{value:checkedOn}}

### GitHub Copilot in VS Code {#copilot-vs-code}

Copilot in VS Code leest je persoonlijke skills uit `~/.copilot/skills`, en die van een project uit `.github/skills`.

{{slot:copilot-vs-code}}

Het leest ook `~/.claude/skills` en `~/.agents/skills`. Voor deze mappen hoeft geen instelling te worden aangezet. · [Documentatie van GitHub Copilot in VS Code]({{value:copilotDocsUrl}}) · gecontroleerd {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode leest je eigen skills uit `~/.config/opencode/skills`, en die van een project uit `.opencode/skills`.

{{slot:opencode}}

Het leest ook `~/.claude/skills` en `~/.agents/skills`. Voer `opencode debug skill` uit om te zien wat het heeft gevonden. · [Documentatie van OpenCode]({{value:opencodeDocsUrl}}) · gecontroleerd {{value:checkedOn}}

Vraag je agent daarna welke skills hij heeft. {{value:releaseSkills}} staan in de lijst. Een andere agent die `SKILL.md`-skills leest, werkt op dezelfde manier: kopieer de skillmappen naar de map waaruit hij skills leest.

## Gebruik {#use}

Typ wat onder **Zeg** staat in je agent. Vervang `ACME-12` door de sleutel van een werkitem in je eigen project.

### `motir-run` {#motir-run}

**Zeg**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Wat er gebeurt**

Pakt het volgende gereed werkitem in je project, of het werkitem dat je noemt, en bouwt het. Eerst ruimt hij op na eerdere runs waarvan de pull requests zijn gemerged, daarna claimt hij het werkitem, bouwt het op een eigen branch, opent één pull request en koppelt die pull request aan het werkitem. Noem je een story waarvan de onderliggende items zelf geen onderliggende items hebben, dan draait hij de hele story: één branch en één pull request per repository, met één commit per onderliggend item. `motir next` stopt na de claim en toont de prompt, zodat je hem zelf aan een agent kunt geven. Een beslissingswerkitem is de enige uitzondering: dat schrijft de beslissingspagina en publiceert die ter goedkeuring door jou, zonder branch en zonder pull request.

**Wat je in Motir ziet**

Het werkitem wordt aan jou toegewezen en gaat naar Bezig, en daarna naar Geïmplementeerd zodra de pull request open is. Zijn pagina toont de pull request en een sectie Zo test je het. Motir zet het op In review wanneer CI slaagt en op Klaar wanneer de pull request wordt gemerged; de skill doet geen van beide.

### `motir-fix` {#motir-fix}

**Zeg**

- `motir fix ACME-12`

**Wat er gebeurt**

Herstelt een rode pull request nadat de run die hem opende is geëindigd: zijn checks faalden, de merge queue gooide hem eruit, of een reviewer stuurde de acceptatievideo van de story terug met Opnieuw draaien. Eerst claimt hij het herstel, zodat niemand anders eroverheen pusht. Daarna herstelt hij elke pull request van het werkitem op de branch die hij al heeft, nooit een nieuwe: hij merget de basisbranch, herstelt wat de falende check noemde en pusht. Hij gaat door tot CI groen is of hij het vijf keer heeft geprobeerd, en hij neemt de acceptatievideo opnieuw op zodra CI groen is na Opnieuw draaien. Hij opent nooit een pull request, merget er geen en wijzigt de status van het werkitem niet. Niet hetzelfde als `motir fix bugs`, dat de map Bugs van je project doorwerkt: `motir fix ACME-12` herstelt de pull requests van één werkitem dat je noemt.

**Wat je in Motir ziet**

Terwijl het herstel loopt, zegt de sectie Ontwikkeling van het werkitem dat het wordt gerepareerd, en door wie. Dezelfde pull requests krijgen nieuwe commits, en Motir zet het werkitem zelf verder zodra hun checks slagen. Geeft het herstel het op, dan zegt het werkitem dat en hoeveel pogingen het deed.

### `motir-continue` {#motir-continue}

**Zeg**

- `motir continue ACME-12`

**Wat er gebeurt**

Zet een werkitem voort waarvan de run halverwege stierf: de laptop ging dicht, de sandbox ging verloren of het proces werd gedood. Het werkitem staat nog op Bezig en zijn werk staat op de branch die die run achterliet. Eerst claimt hij het voortzetten, zodat niemand anders aan dezelfde branch werkt. Daarna checkt hij die branch uit in elke repository waar het werkitem zich over uitstrekt, nooit een nieuwe en zonder te resetten wat er al staat, en zet het werk voort waar het stopte. Hij levert op zoals een nieuwe run: één pull request per repository, gekoppeld aan het werkitem. Gebruik in plaats daarvan `motir fix ACME-12` als het werkitem al een pull request heeft die rood is, en `motir run ACME-12` voor een werkitem dat niemand is begonnen.

**Wat je in Motir ziet**

Een werkitem waarvan de run stierf, zegt Run gestorven in zijn sectie Ontwikkeling, met het commando `motir continue` om te kopiëren. Terwijl het voortzetten loopt, zegt die sectie dat het wordt voortgezet, en door wie. Als het klaar is, gaat het werkitem verder precies als na `motir run`: naar Geïmplementeerd, met zijn pull requests gekoppeld en een sectie Zo test je het.

### `motir-log-bug` {#motir-log-bug}

**Zeg**

- `motir log bug the export button does nothing on an empty board`

**Wat er gebeurt**

Behandelt wat je typte als een bewering die moet worden gecontroleerd. Hij zoekt eerst de oorzaak in de code, kijkt of iemand al een werkitem heeft aangemaakt en maakt niets aan als het gedrag juist blijkt te zijn. Anders maakt hij één bug aan: onder de story die hij ophoudt, of in de map Bugs van je project als hij niets ophoudt.

**Wat je in Motir ziet**

Een nieuw bug-werkitem met de oorzaak, waar die in de code zit en hoe je hem reproduceert, gekoppeld aan het werkitem waarop hij is gevonden. Blokkeert hij het werkitem dat je draait, dan gaat dat werkitem naar Geblokkeerd.

### `motir-mark` {#motir-mark}

**Zeg**

- `motir mark ACME-12 done`

**Wat er gebeurt**

Sluit een werkitem dat geen pull request kan sluiten: een handmatig werkitem, zoals een account aanmaken, een geheim instellen of een instelling wijzigen. Het zeggen is jouw bevestiging dat het werk klaar is. Hij weigert een werkitem dat een pull request heeft, omdat de merge van die pull request het sluit.

**Wat je in Motir ziet**

Het werkitem gaat naar Klaar, met een reactie die vastlegt dat jij het hebt bevestigd. De status van het bovenliggende item volgt uit zijn onderliggende items.

### `motir-guide` {#motir-guide}

**Zeg**

- `motir guide ACME-12`
- `motir guide`

**Wat er gebeurt**

Loopt een handmatig werkitem met je door, stap voor stap. Noem er een, of zeg alleen `motir guide` en hij pakt je eigen onafgemaakte werkitem op, anders het volgende gereedstaande handmatige werkitem. Hij geeft je één stap, met de instructies en eventueel een commando om te kopiëren, en wacht. Zeg klaar, en hij controleert wat hij kan zonder iets te wijzigen, zoals het adres ophalen of een alleen-lezen commando uitvoeren, en vertelt je wat hij zag. Een stap waarvan de controle faalt, wordt niet afgevinkt; je krijgt dezelfde stap opnieuw. Je kunt bij elke stap stoppen, en `motir guide` gaat verder waar je bleef. Heeft het werkitem nog geen stappen, dan stelt hij er een paar voor op basis van de beschrijving en vraagt hij jou vóór hij ze op het werkitem schrijft. Blijkt een stap onjuist, dan biedt hij een correctie aan en wijzigt hij de stap of de tekst van het werkitem alleen als je ja zegt.

**Wat je in Motir ziet**

Het werkitem wordt aan jou toegewezen en gaat naar Bezig. Zijn Takenlijst vinkt elke stap af zodra je hem klaar hebt, met wie het deed. Is de laatste stap afgevinkt, dan gaat het werkitem naar Klaar, met een reactie die elke stap samenvat en hoe die is bevestigd.

### `motir-fix-bugs` {#motir-fix-bugs}

**Zeg**

- `motir fix bugs`
- `motir fix bugs 3`

**Wat er gebeurt**

Werkt de bugs in de map Bugs van je project door die nog op Te doen staan, één bug tegelijk, oudste eerst. Bugs in mappen binnen Bugs blijven met rust. Voor elke bug controleert hij eerst of de bug echt is op je standaardbranch en geeft hem dan precies één uitkomst. Een bug die hij kan herstellen, krijgt één pull request die die bug herstelt en niets anders. Een bug die wacht op een ander werkitem dat nog niet klaar is, wordt aan dat werkitem gekoppeld en onder dezelfde story gezet. Een bug die hij hier niet kan herstellen, krijgt een reactie en wordt terzijde gelegd: al hersteld, met wat het herstelde; niet te reproduceren, met wat hij draaide; of vraagt jouw beslissing, met de vraag en zijn aanbeveling. Elke uitkomst haalt de bug uit Te doen, dus de run eindigt vanzelf. Voeg een getal toe en hij stopt na zoveel bugs. Hij eindigt met een rapport dat de bugs die op jou wachten als eerste noemt.

**Wat je in Motir ziet**

Een herstelde bug gaat naar Geïmplementeerd met zijn pull request gekoppeld, en naar Klaar wanneer jij hem merget. Een bug die op ander werk wacht, gaat naar Geblokkeerd, met een link Geblokkeerd door naar dat werkitem. Een bug die al hersteld is, gaat naar Klaar. Een bug die hij niet kan reproduceren, of die jouw beslissing vraagt, gaat naar Geblokkeerd. Elk van deze heeft een reactie met het bewijs of de vraag. Beantwoord de vraag en zet de bug terug naar Te doen, en de volgende run pakt hem op.

## Wanneer een werkitem onjuist is {#wrong}

Soms kan een werkitem niet worden gebouwd zoals het is geschreven. Het kan iets vragen wat niet bestaat, een ontwerp nodig hebben dat niemand heeft getekend, of in twee repositories reiken. `motir-run` gokt zich daar niet omheen. Hij zet het werkitem op **In planning**, zodat geen andere run het oppakt, en vraagt de Motir AI Planner om de correctie te plannen. Daarna stopt hij. Het plan wacht tot jij het in Motir beoordeelt en goedkeurt, en er wordt niets gebouwd totdat je dat doet.

Kan je token geen AI-planning gebruiken, of zijn je AI-credits op, dan stopt hij toch. Hij laat een reactie achter op het werkitem met de hele correctie en zegt waarom hij die niet kon overdragen.

## Bijwerken {#updating}

Een nieuwe release heeft een nieuwe tag, en deze pagina gaat ernaartoe. Voer voor een kopie-installatie de installatiestap van je agent opnieuw uit: die overschrijft de skillmappen ter plekke. In Claude Code kan een marktplaats niet opnieuw op een andere tag worden toegevoegd, dus verwijder hem, voeg hem toe op de nieuwe tag en installeer de plugin opnieuw:

{{slot:update}}

Herstart je agent daarna zodat hij de nieuwe versies leest.
