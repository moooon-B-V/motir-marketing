---
source: 758198e00644
---

De plugin van Motir voor Claude Code zet je Motir-project in Claude Code met één installatie: de skills van Motir, zijn MCP-server en een runner voor zijn CLI. Hij logt in met je Motir-account in de browser, dus er is geen token. Zeg `motir run` en Claude Code pakt het volgende gereed werkitem, bouwt het en opent een gekoppelde pull request.

De plugin wordt gepubliceerd vanuit [{{value:skillsRepo}}]({{value:repoUrl}}), dat ook een Claude Code-pluginmarktplaats is. Elk commando op deze pagina installeert release [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Voordat je begint {#before}

Je hebt Claude Code nodig, een Motir-account met toegang tot het project en `git`. De runner heeft Node.js 22 of nieuwer nodig, en de skills die pull requests openen of lezen hebben de GitHub CLI (`gh`) nodig.

## Installeren {#install}

Voeg de marktplaats toe op de releasetag en installeer dan de plugin. Voer beide uit in Claude Code.

{{slot:install}}

## Wat hij meebrengt {#brings}

- **De zeven skills.** Elke skill in de release, vermeld onder de naam van de plugin.
- **De Motir MCP-server.** Claude Code logt er de eerste keer dat hij wordt gebruikt in de browser op in: voer `/mcp` uit, kies `motir` en kies _Authenticate_, kies dan de werkruimte en keur goed op het toestemmingsscherm van Motir. Er is geen token om aan te maken of te plakken.
- **De `motir`-runner.** Draait de vastgezette Motir CLI met `npx`, dus er wordt niets globaal geïnstalleerd. Hij heeft Node.js 22 of nieuwer nodig, en de CLI logt zelf in met `motir login`.

## Controleer of het gelukt is {#check}

Om te controleren: `/plugin` toont `motir` op `{{value:releaseVersion}}`, en `/mcp` toont `motir`. De skills van een plugin staan onder de naam van de plugin, bijvoorbeeld `/motir:motir-run`.

## Gebruik hem {#use}

Zeg wat je wilt in Claude Code. Het volledige gedrag van elke skill, en wat je in Motir ziet, staat in de gids [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Bijwerken {#updating}

Een marktplaats die op één release is toegevoegd, kan niet opnieuw op een andere worden toegevoegd, dus verwijder hem eerst. Door hem te verwijderen wordt de plugin gedeïnstalleerd, en de laatste regel installeert hem opnieuw op de nieuwe release.

{{slot:update}}

Gebruik je een andere agent, of wil je alleen de connector? Zie de gids [{{value:skillsPage}}](/docs/skills) voor elke agent, of de [{{value:connectorPage}}](/docs/claude-code-connector).
