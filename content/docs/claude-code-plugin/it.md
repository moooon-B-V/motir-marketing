---
source: 758198e00644
---

Il plugin di Motir per Claude Code porta il tuo progetto Motir dentro Claude Code con una sola installazione: le skill di Motir, il suo server MCP e un runner per la sua CLI. Accede con il tuo account Motir nel browser, quindi non serve alcun token. Di’ `motir run` e Claude Code prende il prossimo elemento di lavoro pronto, lo realizza e apre una pull request collegata.

Il plugin è pubblicato da [{{value:skillsRepo}}]({{value:repoUrl}}), che è anche un marketplace di plugin per Claude Code. Ogni comando di questa pagina installa il rilascio [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Prima di iniziare {#before}

Ti servono Claude Code, un account Motir con accesso al progetto e `git`. Il runner richiede Node.js 22 o successivo, e le skill che aprono o leggono pull request richiedono la GitHub CLI (`gh`).

## Installazione {#install}

Aggiungi il marketplace al tag di rilascio, poi installa il plugin. Esegui entrambi i passaggi in Claude Code.

{{slot:install}}

## Cosa porta con sé {#brings}

- **Le sette skill.** Tutte le skill del rilascio, elencate sotto il nome del plugin.
- **Il server MCP di Motir.** Claude Code vi accede nel browser la prima volta che viene usato: esegui `/mcp`, scegli `motir` e seleziona _Authenticate_, poi scegli l’area di lavoro e approva nella schermata di consenso di Motir. Non c’è nessun token da creare o incollare.
- **Il runner `motir`.** Esegue la CLI di Motir fissata a una versione con `npx`, quindi non viene installato nulla a livello globale. Richiede Node.js 22 o successivo, e la CLI accede da sola con `motir login`.

## Verifica che funzioni {#check}

Per verificare: `/plugin` mostra `motir` alla versione `{{value:releaseVersion}}`, e `/mcp` elenca `motir`. Le skill di un plugin sono elencate sotto il nome del plugin, per esempio `/motir:motir-run`.

## Usalo {#use}

Di’ a Claude Code cosa vuoi. Il comportamento completo di ogni skill, e cosa vedrai in Motir, è nella guida [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Aggiornamento {#updating}

Un marketplace aggiunto a un rilascio non può essere aggiunto di nuovo a un altro, quindi rimuovilo prima. Rimuoverlo disinstalla il plugin, e l’ultima riga lo installa di nuovo al nuovo rilascio.

{{slot:update}}

Se usi un altro agente, o ti serve solo il connettore, consulta la guida [{{value:skillsPage}}](/docs/skills) per tutti gli agenti, oppure il [{{value:connectorPage}}](/docs/claude-code-connector).
