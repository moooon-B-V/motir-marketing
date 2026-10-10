---
source: 04e1454b8c46
---

Motir è un connettore MCP remoto: Claude Code raggiunge il tuo progetto Motir con un solo URL e agisce a tuo nome, entro i limiti che approvi. Accedi con il tuo account Motir e scegli un’area di lavoro. Non c’è nessun token da creare, incollare o custodire.

Ci sono due modi per aggiungerlo. Collegalo una volta su claude.ai e Claude Code lo trova ovunque tu abbia effettuato l’accesso con il tuo account Claude, oppure aggiungilo direttamente in Claude Code con un solo comando. Vuoi anche le skill di Motir? Il [{{value:pluginPage}}](/docs/claude-code-plugin) porta con sé questo connettore.

## Prima di iniziare {#before}

Ti servono un account Motir con accesso al progetto e Claude Code. Per la strada di claude.ai, Claude Code deve aver effettuato l’accesso con lo stesso account Claude che colleghi su claude.ai.

## Collegalo su claude.ai {#claude-ai}

Un connettore collegato su claude.ai è disponibile nelle tue conversazioni sul web, nell’app desktop e su dispositivo mobile, e in Claude Code quando ha effettuato l’accesso con il tuo account Claude.

1. Apri Customize → Connectors.
2. Fai clic su «+», poi su Add custom connector, e incolla l’URL del server qui sotto. In OAuth client scegli Use Claude’s published identity: claude.ai lo contrassegna come Detected, perché Motir lo supporta. Lascia vuoti OAuth client ID e secret: Motir non ne ha bisogno.
3. Fai clic su Add, poi su Connect. Claude ti porta su app.motir.co per accedere e approvare.

{{slot:claude-ai}}

Con un piano Team o Enterprise, un Owner aggiunge il connettore una sola volta, in Organization settings → Connectors → Add → Custom → Web, e poi ogni membro fa clic su Connect in Customize → Connectors con il proprio account Motir. · [Documentazione di claude.ai di Anthropic]({{value:claudeAiDocsUrl}}) · passaggi verificati il {{value:claudeAiCheckedOn}}

## Oppure aggiungilo in Claude Code {#claude-code}

Aggiungi il connettore direttamente a Claude Code, senza passare da claude.ai.

1. Aggiungi il server con il comando qui sotto, senza intestazione e senza token.
2. In Claude Code esegui `/mcp`, seleziona `motir` e segui l’accesso nel browser.

{{slot:claude-code}}

Se hai effettuato l’accesso a Claude Code con il tuo account Claude, un connettore che hai collegato su claude.ai è già disponibile lì. Il plugin Motir per Claude Code porta con sé questo server, insieme alle skill. · [Documentazione di Claude Code di Anthropic]({{value:claudeCodeDocsUrl}}) · passaggi verificati il {{value:claudeCodeCheckedOn}}

## Verifica la connessione {#check}

In Claude Code esegui `/mcp`: Motir compare tra i server, e un server che richiede ancora l’accesso lo indica. Poi fai a Claude una domanda sul tuo progetto, per esempio cosa è pronto per iniziare, e Claude risponde a partire da Motir.

## Cosa approvi e come revocarlo {#consent}

La pagina di accesso di Motir indica l’app che sta facendo la richiesta, ti fa scegliere un’area di lavoro ed elenca i permessi che chiede. Claude poi agisce a tuo nome in quell’area di lavoro, entro ciò che hai approvato e mai oltre quanto consente il tuo ruolo. Claude chiede conferma prima di usare uno strumento che modifica qualcosa, e [{{value:mcpToolsPage}}](/docs/mcp/tools) mostra quali strumenti si limitano a leggere, a scrivere o a eliminare.

Ogni app che colleghi è elencata in [App collegate]({{value:connectedAppsUrl}}), in Impostazioni → Account → Token di Motir, con la sua area di lavoro, i suoi permessi e l’ultimo utilizzo. Revoca interrompe il suo accesso alla richiesta successiva. La guida [{{value:mcpPage}}](/docs/mcp) contiene i dettagli del server e la strada del token per altri client e pipeline.
