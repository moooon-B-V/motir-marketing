---
source: cdc9936762b4
---

Een sandbox is een container die je op je eigen machine start, met je eigen agent, de Motir CLI en je checkouts — en verder niets. Je brengt je eigen agentinloggegevens mee, alleen-lezen gekoppeld; de lus draait binnenin, zodat een agent die zich misdraagt je werkmap bereikt en de rest van je machine niet.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Voordat je begint {#before-you-start}

- **Docker, draaiend.** Gebouwd voor `linux/amd64` **en** `linux/arm64`, dus Apple Silicon is een volwaardige machine en er wordt niets geëmuleerd. Er is geen buildstap — je pulled de image.
- **De eigen aanmelding van je agent, op deze machine.** De mount voor de inloggegevens is alleen-lezen, dus de container kan een aanmelding gebruiken en niet vernieuwen. Claude Code op macOS is de uitzondering die je tegenkomt: het bewaart zijn token in de Keychain van de login, dus er is geen bestand om te koppelen, en je meldt je voor `claude` **in** de container aan — de image geeft het een beschrijfbare configuratiemap, en daar komt de aanmelding terecht. (Antigravity werkt hetzelfde — stap 2 zegt dat wanneer je het kiest.)
- **De root van je werkruimte — de map die je checkouts BEVAT.** Een project omvat meestal meerdere repositories en de lus draait over alle repositories heen.

{{slot:workspace}}

{{part:picker-label}}

Welke agent gebruik je?

{{part:picker-also-supported}}

ook ondersteund

{{part:picker-or}}

of

{{part:picker-base}}

geen agent (basis)

{{part:picker-summary}}

Elk commando hieronder is voor **{{value:profileLabel}}**. Omschakelen herschrijft de tag en de mount voor de inloggegevens in **stap 1, 2 en 2b** — de drie plaatsen waar ze voorkomen.

{{part:chip-command}}

Commando

{{part:chip-editor}}

In je editor

{{part:steps-intro}}

## Zet hem op {#set-it-up}

Vijf stappen. Elke stap is één ding om te doen.

{{part:step-1-intent}}

Pull de image voor je agent

{{part:step-1-body}}

Er is geen buildstap — de image wordt per agentprofiel gepubliceerd.

{{part:step-2-intent}}

Start de container vanuit de root van je werkruimte

{{part:step-2-body}}

Voer het uit vanuit de map die je checkouts **bevat**, niet vanuit één ervan.

{{part:step-2-vscode}}

**Gebruik je liever VS Code?** Stap 2a–2c hieronder vervangen deze stap. Alles daarna is in beide gevallen hetzelfde.

{{part:step-2a-intent}}

Installeer de extensie Dev Containers

{{part:step-2a-body}}

Vanuit de weergave Extensions, of het opdrachtenpalet — ⇧⌘P op macOS, Ctrl+Shift+P elders, F1 op alle drie — en dan _Extensions: Install Extensions_. Twee van deze drie stappen gebeuren in het palet, dus het is handig om het nu vast te zetten.

{{part:step-2b-intent}}

Maak de dev container-configuratie aan

{{part:step-2b-body}}

Voer dit uit in de map die je koppelt. Eén keer plakken: het maakt de map `.devcontainer` aan en schrijft het bestand erin. Probeer ze niet aan te maken vanuit een bestandskiezer — Finder en de meeste grafische kiezers weigeren een naam die met een punt begint, en weigeren zonder te zeggen waarom.

{{part:step-2b-warning}}

**Een dev container behoudt de image waarmee hij is aangemaakt.** `--pull=always` hoort bij het runcommando in stap 2, niet bij deze route. Om over te stappen op de huidige image en de `motir` CLI: **1.** voer het `{{value:dockerPull}}` van stap 1 uit in een terminal op je machine; **2.** _Dev Containers: Open Folder in Container…_ op deze map, waarmee het venster wordt gekoppeld; **3.** _Dev Containers: Rebuild Container_, waarmee de container opnieuw wordt aangemaakt vanuit de image die je zojuist hebt gepulld. Rebuild Container verschijnt alleen in een venster dat aan de container is gekoppeld, en daarom komt stap 2 eerst. Een rebuild behoudt je Motir-aanmelding (die staat op het volume `{{value:authVolume}}`), maar niet een aanmelding bij Claude Code die je in de container hebt gedaan — voer `claude` uit en meld je opnieuw aan.

{{part:step-2c-intent}}

Open de map in de container

{{part:step-2c-body}}

Opdrachtenpalet → _Dev Containers: Open Folder in Container…_, en kies de map waarin je het bestand zojuist hebt geschreven. De terminal ervan is dezelfde shell als waarin stap 2 je zou hebben gezet — ga verder bij stap 3.

{{part:step-3-intent}}

Meld je aan, in de container

{{part:step-3-body}}

Er wordt een code en een URL getoond; keur het goed in een willekeurige browser. De aanmelding komt terecht op het volume `{{value:authVolume}}`, dus dit doe je één keer.

{{part:step-4-intent}}

Koppel de map aan je project

{{part:step-4-body}}

Vervang `ACME` door de sleutel van je project. Heeft je werkruimte precies één project, laat de vlag dan weg — dat is de hele stap.

{{part:step-5-intent}}

Controleer het — alles groen is het einde van deze pagina

{{part:step-5-body}}

Auth, koppeling, de agent-binary en zijn inloggegevens. Dit is het enige wat je vertelt dat de container echt heeft gekregen wat je hem hebt meegegeven.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode bewaart configuratie en inloggegevens op twee plaatsen, dus het heeft twee `-v`-regels nodig. Beide zijn nodig.

{{part:note-antigravity}}

Antigravity bewaart zijn token in de sleutelhanger van het besturingssysteem, die geen draagbaar bestand heeft om te koppelen — dus er is geen `-v`-regel voor, en je meldt je aan IN de container en niet voordat je begint. Dit is het enige profiel waarvoor de tweede voorwaarde hierboven niet geldt.

{{part:note-aider}}

De inloggegevens van Aider zijn een API-sleutel van een model die het uit de omgeving leest, dus dit is het enige profiel dat een `-e`-regel toevoegt. De koppeling is een BESTAND, dat moet bestaan — al is het leeg — anders maakt docker er een map voor in de plaats.

{{part:note-base}}

De basisimage bevat de Motir CLI en helemaal geen agent — niets om te koppelen en nergens bij aan te melden behalve Motir zelf.

{{part:devcontainer-file}}

### Het bestand dat dat commando schrijft {#devcontainer-file}

Naslag, geen stap — 2b heeft het al geschreven. Het staat hier voor de lezer die het bestand liever met de hand aanmaakt, en omdat de aanhalingstekens rond `<<’JSON’` essentieel zijn: ze voorkomen dat je shell `${localWorkspaceFolder}` en `${localEnv:HOME}` uitbreidt voordat ze het bestand bereiken. Dat zijn Dev Containers-substituties en de editor lost ze op.

{{part:why}}

## Waarom het eruitziet zoals het eruitziet {#why}

### Wat de profielkeuze verandert {#profile-picker}

Een agent kiezen herschrijft drie dingen en niets anders: de image-**tag**, de `-v`-regel(s) voor de inloggegevens, en `image`, `name` en `mounts` van de dev container. Het is een bediening en geen alinea die je zegt ze zelf te verwisselen, omdat elk commando hier een knop Kopiëren heeft en een lezer die kopieert een lezer is die de instructie om te wisselen niet heeft gelezen.

Niet elk profiel heeft één map met inloggegevens. `opencode` heeft er twee en gebruikt twee `-v`-regels; `antigravity` bewaart zijn token in de sleutelhanger van het besturingssysteem en gebruikt er geen, en meldt zich in plaats daarvan aan in de container; en `aider` koppelt een bestand en leest een modelsleutel uit de omgeving. De stappen zeggen dat wanneer je ze kiest.

### Bij het runcommando wordt niets bewaard dat kan verouderen {#run-command}

`--pull=always` haalt de huidige image op bij elke start, zodat een profieltag die is opgeschoven je bereikt zonder dat je hoeft te merken dat hij is opgeschoven, en `--rm` betekent dat er niets wordt bewaard dat kan verouderen. Er is geen apart pad voor terugkomen — en dat liet mensen precies een `motir` draaien die maanden ouder was dan de pagina waarvan ze het lazen. Je aanmelding overleeft dat alles: ze wordt geschreven naar het volume `{{value:authVolume}}`, dat buiten de container leeft, dus je meldt je één keer aan en elke latere run pakt haar op — voorgoed afmelden doe je met `{{value:signOutCommand}}`. Werk je offline? Laat `--pull=always` weg: het bereikt het register bij elke start, dus zonder netwerk mislukt de run in plaats van terug te vallen op de image die je al hebt. Dit alles geldt voor het runcommando. Een dev container (stap 2a–2c) behoudt de image waarmee hij is aangemaakt totdat je pullt, koppelt met _Dev Containers: Open Folder in Container…_ en _Dev Containers: Rebuild Container_ kiest.

### Wat nu {#what-next}

`motir run` neemt een SCOPE — één werkitem, een hele story, of `sprint` voor de actieve. `motir auto` leegt in plaats daarvan de gereedstaande set zonder toezicht, één item tegelijk op een sessiebranch. Elke vlag die beide accepteren staat op de pagina [{{value:cliPage}}](/docs/cli).

## Wat hij afbakent — en wat niet {#confines}

Het loont om dit te lezen voordat je erop vertrouwt, omdat één van deze drie een uitzondering is en geen garantie.

- **Bestandssysteem — afgebakend.** De enige host-oppervlakken in de container zijn een beschrijfbare `/workspace` en de eigen inloggegevens van je agent, alleen-lezen gekoppeld. Geen Docker-socket, geen andere host-bind.
- **Netwerk — OPEN, bewust.** Elke agent heeft de API van zijn aanbieder nodig en elk aangestuurd werkitem heeft git-remotes nodig, dus de image beperkt de impact op het bestandssysteem en niet het uitgaande verkeer. Als je dreigingsmodel meer vraagt, grijp dan naar de eigen netwerkbesturing van Docker — de container houdt een agent niet tegen om met het internet te praten.
- **Privileges — zonder privileges.** Hij draait als de gebruiker `node` (uid 1000), zodat bestanden die in de mount worden geschreven van jou blijven en niet van root worden.

## Wat de omgeving je geeft {#environment}

- **Je map, gekoppeld.** `$PWD` wordt `/workspace`, zodat de checkouts waarin de run werkt de jouwe zijn en de commits die hij maakt op je schijf staan wanneer hij stopt.
- **Eén checkout per werkitem, op een git-worktree.** Een run bewerkt niet de boom waarin jij zit; hij voegt per item een worktree toe, zodat parallelle runs niet kunnen botsen op een branch-checkout.
- **Je agentinloggegevens, ALLEEN-LEZEN.** De map met inloggegevens van het profiel wordt met `:ro` gebind. Niets in de container kan haar herschrijven, en niets ervan wordt naar Motir gestuurd — dit is bring-your-own-key, dus de agentrekening is de jouwe en de API-aanroep gaat nooit via ons.
- **De CLI, vooraf geïnstalleerd.** De image bevat `motir` en de agent-binary die de tag noemt, dus er is niets te installeren voor de eerste run.
- **De uitvoer van je agent blijft standaard lokaal.** Alleen de levenscyclus van de run bereikt Motir. Met `--report-log` wordt bovendien het einde van de uitvoer gestuurd, zodat een mislukte run het op de runpagina toont; het staat UIT tenzij je erom vraagt, en bestandsinhoud, paden en diffs worden in beide gevallen nooit gestuurd.

## Wat het token mag — en wat het weigert {#token}

Een token dat door `motir login` wordt aangemaakt, draagt een vaste, beperkte toekenning. Het goedkeuringsscherm toont haar en kan haar niet wijzigen — niet ruimer en niet smaller, omdat een met de hand beperkte toekenning een lus zonder toezicht halverwege breekt.

{{slot:grant}}

**Degene die het NIET draagt is `ai:view_plan`, en de weigering die daarop volgt is het ontwerp en geen bug.** Een plan openen vereist alleen `work_item:edit`, dus een run in een sandbox KAN er een openen — en wordt dan geweigerd bij zijn eerste toevoeging, omdat dat de sleutel is die het toevoegen van voorstellen toetst. Een run die een werkitem uitvoert, mag het plan dat hem is gegeven niet hervormen. Wanneer je die weigering tegenkomt, heeft de agent het juiste gedaan: hij legt de correctie vast als reactie, laat het item geblokkeerd en stopt. Er gaat niets verloren, en een mens beslist wat het plan moet zeggen.

Twee vlaggen beperken dit verder als je een rustiger run wilt: `--disable-log-bug` houdt de agent tegen om een bug aan te maken voor een defect dat hij elders vindt (hij plaatst in plaats daarvan een reactie), en `--disable-replan` houdt hem tegen om een herplanning in te dienen voor een werkitem dat hij onjuist vindt (hij plaatst een reactie en stopt). Alleen bij `motir auto` gaat `--auto-approve-replan` de andere kant op: hij keurt een ingediende herplanning goed en blijft herhalen, in plaats van voor jou te stoppen.

## Wat een run oplevert en waar je het leest {#produces}

- **Een branch en een pull request** in elke repository waarin het item wordt opgeleverd, gepusht met je git-inloggegevens vanuit de container.
- **Een link op het werkitem.** De run geeft aan welk item elke pull request oplevert, zodat de merge het item verder zet. Die link is wat het paneel Ontwikkeling op de itempagina toont, en het is wat het item bij de merge sluit — niet de branchnaam en niet de titel.
- **Status, terwijl hij loopt.** Het item gaat naar Bezig wanneer de run het claimt en naar Geïmplementeerd wanneer de pull request opent. In review wordt door CI geschreven wanneer de checks groen worden, en Klaar door de merge.
- **De terminal.** De eigen uitvoer van de agent blijft in je terminal tenzij je `--report-log` hebt meegegeven.

## Als het niet werkt {#troubleshooting}

### De agent-binary wordt niet gevonden {#agent-binary-not-found}

De tag en de agent komen niet overeen. Controleer welk profiel je hebt gestart, of wijs de run naar een andere binary met `--agent <cmd>`. `motir doctor` meldt dit voordat een run er een claim aan verspilt.

### De agent start en is niet geauthenticeerd {#agent-not-authenticated}

De mount voor de inloggegevens ontbreekt of wijst naar de verkeerde map — elk profiel koppelt zijn eigen map. Voer de regel `{{value:dockerRun}}` opnieuw uit voor de tag die je echt hebt gepulld.

### Er is niets gereed om te draaien {#nothing-ready}

Elke kandidaat heeft een niet-vervulde afhankelijkheid. `motir ready` toont de set; `motir show` op een werkitem noemt wat het blokkeert. Toch aansturen kan met `--force`, voor slechts één item.

### De run stopt bij een ingediende herplanning {#stopped-on-replan}

De agent vond het werkitem onjuist en stelde een gecorrigeerde vorm voor. Dat is de bedoelde stop: lees het plan in Motir en keur het goed of wijs het af. Om een lus zonder toezicht toch door te laten gaan, voer je `motir auto` uit met `--auto-approve-replan`.

### Een run liet werk achter nadat hij was gestopt {#work-left-behind}

De worktrees en branches staan op je schijf, onder de map die je hebt gekoppeld — een container die is gestopt, nam ze niet mee. `motir done` sluit een gemergd item af, of een hele gemergde sessiebranch met `--session <branch>`.

## Wat deze pagina niet behandelt {#not-covered}

Elk commando en elke vlag — dat is [{{value:cliPage}}](/docs/cli), dat is gegenereerd uit de eigen catalogus van de CLI en er niet van kan afwijken. Een agent rechtstreeks aan Motir koppelen, zonder de CLI, staat bij [{{value:mcpPage}}](/docs/mcp). Dezelfde werklus via HTTP aansturen in plaats van vanuit een terminal staat bij de [{{value:apiPage}}](/docs/api). De sandbox ergens anders draaien dan op je eigen machine is hier nog niet gedocumenteerd. (Het VS Code-pad IS hierboven gedocumenteerd — die bijzin zei vroeger iets anders, en legde een verwijderd onderdeel vast als een besluit.)
