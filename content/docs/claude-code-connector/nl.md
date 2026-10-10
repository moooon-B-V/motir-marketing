---
source: 04e1454b8c46
---

Motir is een externe MCP-connector: Claude Code bereikt je Motir-project via één URL en handelt als jij, binnen wat je goedkeurt. Je meldt je aan met je Motir-account en kiest één werkruimte. Er is geen token om aan te maken, te plakken of veilig te bewaren.

Er zijn twee manieren om hem toe te voegen. Verbind hem één keer op claude.ai en Claude Code pikt hem op overal waar je met je Claude-account bent ingelogd, of voeg hem met één commando toe in Claude Code zelf. Wil je ook de skills van Motir? De [{{value:pluginPage}}](/docs/claude-code-plugin) brengt deze connector mee.

## Voordat je begint {#before}

Je hebt een Motir-account met toegang tot het project nodig, en Claude Code. Voor de route via claude.ai moet Claude Code zijn ingelogd met hetzelfde Claude-account als waarmee je op claude.ai verbindt.

## Verbind hem op claude.ai {#claude-ai}

Een connector die je op claude.ai verbindt, is beschikbaar in je gesprekken op het web, in de desktop-app en op mobiel, en in Claude Code als die is ingelogd met je Claude-account.

1. Open Customize → Connectors.
2. Klik op ‘+’, dan op Add custom connector, en plak de server-URL hieronder. Kies onder OAuth client de optie Use Claude’s published identity — claude.ai markeert die als Detected, omdat Motir dit ondersteunt. Laat de OAuth client ID en het secret leeg — Motir heeft geen van beide nodig.
3. Klik op Add en dan op Connect. Claude stuurt je naar app.motir.co om in te loggen en goed te keuren.

{{slot:claude-ai}}

Bij een Team- of Enterprise-abonnement voegt een Owner de connector één keer toe, onder Organization settings → Connectors → Add → Custom → Web, en elk lid klikt daarna onder Customize → Connectors op Connect met zijn eigen Motir-account. · [Documentatie van Anthropic over claude.ai]({{value:claudeAiDocsUrl}}) · stappen gecontroleerd {{value:claudeAiCheckedOn}}

## Of voeg hem toe in Claude Code {#claude-code}

Voeg de connector rechtstreeks aan Claude Code toe, zonder claude.ai.

1. Voeg de server toe met het commando hieronder — zonder header en zonder token.
2. Voer in Claude Code `/mcp` uit, selecteer `motir` en volg het inloggen in je browser.

{{slot:claude-code}}

Heb je Claude Code met je Claude-account ingelogd, dan is een connector die je op claude.ai hebt verbonden daar al beschikbaar. De Motir-plugin voor Claude Code brengt deze server mee, naast de skills. · [Documentatie van Anthropic over Claude Code]({{value:claudeCodeDocsUrl}}) · stappen gecontroleerd {{value:claudeCodeCheckedOn}}

## Controleer de verbinding {#check}

Voer in Claude Code `/mcp` uit: Motir staat tussen de servers, en een server waarvoor je nog moet inloggen, zegt dat. Vraag Claude dan naar je project — bijvoorbeeld wat klaarstaat om te beginnen — en het antwoordt vanuit Motir.

## Wat je goedkeurt en hoe je het intrekt {#consent}

De aanmeldpagina van Motir noemt de app die het vraagt, laat je één werkruimte kiezen en toont de rechten die hij wil. Claude handelt daarna als jij in die werkruimte, binnen wat je hebt goedgekeurd en nooit verder dan je eigen rol toestaat. Claude vraagt het eerst voordat het een tool gebruikt die iets wijzigt, en [{{value:mcpToolsPage}}](/docs/mcp/tools) laat zien welke tools alleen lezen, schrijven of verwijderen.

Elke app die je verbindt, staat onder [Gekoppelde apps]({{value:connectedAppsUrl}}), bij Instellingen → Account → Tokens in Motir, met zijn werkruimte, rechten en het moment waarop hij voor het laatst is gebruikt. Intrekken beëindigt zijn toegang bij het eerstvolgende request. De gids [{{value:mcpPage}}](/docs/mcp) bevat de details van de server en de tokenroute voor andere clients en pipelines.
