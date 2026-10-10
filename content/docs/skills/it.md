---
source: 38ac3b50e511
---

Le skill di Motir permettono all’agente che già usi di lavorare sul tuo progetto Motir. Di’ `motir run` e prende il prossimo elemento di lavoro pronto, lo realizza e apre una pull request collegata. Di’ `motir log bug` e controlla il difetto e lo registra dove deve stare. Di’ `motir mark` e chiude un elemento di lavoro manuale una volta che lo hai svolto. Di’ `motir guide` e ti accompagna passo dopo passo in un elemento di lavoro manuale.

Sono normali [Agent Skills](https://agentskills.io): una cartella per ogni skill, ciascuna con un `SKILL.md`, pubblicate in [{{value:skillsRepo}}]({{value:repoUrl}}). Ogni comando di questa pagina installa il rilascio [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Prima di iniziare {#before}

Le skill parlano con Motir tramite il suo server MCP. In Claude Code il plugin lo collega per te: accedi con il tuo account Motir nel browser, e non c’è nessun token. Ogni altro agente ha bisogno che quel server sia collegato prima: un progetto Motir, un token di accesso personale e la configurazione per il tuo agente nella guida [{{value:mcpPage}}](/docs/mcp), che copre anche la strada del token in Claude Code se non puoi usare l’accesso dal browser. Un token con i permessi predefiniti può fare tutto ciò che fanno queste skill. Ti servono anche `git` e la GitHub CLI (`gh`) per le skill che aprono o leggono pull request.

## Installazione {#install}

Scegli il tuo agente. Ogni sezione installa tutte le skill del rilascio per ogni progetto sulla tua macchina. I comandi da terminale sono per macOS e Linux: scaricano il rilascio, copiano le cartelle delle skill nella cartella che quell’agente legge e rimuovono il download.

### Claude Code {#claude-code}

Il repository è anche un marketplace di plugin per Claude Code. Aggiungilo al tag di rilascio, poi installa il plugin. Una sola installazione porta le skill, il server MCP di Motir e un runner per la sua CLI, e collega Motir senza token.

- **Le sette skill.** Tutte le skill del rilascio, elencate sotto il nome del plugin.
- **Il server MCP di Motir.** Claude Code vi accede nel browser la prima volta che viene usato: esegui `/mcp`, scegli `motir` e seleziona _Authenticate_, poi scegli l’area di lavoro e approva nella schermata di consenso di Motir. Non c’è nessun token da creare o incollare. [Aggiungi Motir a Claude](/docs/mcp#claude)
- **Il runner `motir`.** Esegue la CLI di Motir fissata a una versione con `npx`, quindi non viene installato nulla a livello globale. Richiede Node.js 22 o successivo, e la CLI accede da sola con `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Per verificare: `/plugin` mostra `motir` alla versione `{{value:releaseVersion}}`, e `/mcp` elenca `motir`. Le skill di un plugin sono elencate sotto il nome del plugin, per esempio `/motir:motir-run`. Copiare le skill porta solo le skill: collega tu il server MCP, come fanno gli altri agenti. Per un solo repository, copia invece in `.claude/skills` in quel repository. · [Documentazione di Claude Code]({{value:claudeCodeDocsUrl}}) · verificato il {{value:checkedOn}}

### Codex {#codex}

Codex legge le skill da `.agents/skills`: nella tua cartella home per ogni repository, oppure in un repository solo per quel repository.

{{slot:codex}}

Codex nota da solo le nuove skill. Se non compaiono, riavvialo. · [Documentazione di Codex]({{value:codexDocsUrl}}) · verificato il {{value:checkedOn}}

### Cursor {#cursor}

Cursor legge le skill da `~/.cursor/skills` per ogni progetto, e da `.cursor/skills` in un progetto.

{{slot:cursor}}

Cursor legge anche `~/.agents/skills` e `~/.claude/skills`, quindi le skill che hai già copiato per Codex o Claude Code vengono trovate senza una seconda copia. · [Documentazione di Cursor]({{value:cursorDocsUrl}}) · verificato il {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI legge le tue skill personali da `~/.gemini/skills`, e quelle di un’area di lavoro da `.gemini/skills`.

{{slot:gemini-cli}}

Esegui `gemini skills list` per verificare che siano state trovate. Gemini CLI legge anche `~/.agents/skills`. · [Documentazione di Gemini CLI]({{value:geminiCliDocsUrl}}) · verificato il {{value:checkedOn}}

### GitHub Copilot in VS Code {#copilot-vs-code}

Copilot in VS Code legge le tue skill personali da `~/.copilot/skills`, e quelle di un progetto da `.github/skills`.

{{slot:copilot-vs-code}}

Legge anche `~/.claude/skills` e `~/.agents/skills`. Per queste cartelle non serve attivare nessuna impostazione. · [Documentazione di GitHub Copilot in VS Code]({{value:copilotDocsUrl}}) · verificato il {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode legge le tue skill personali da `~/.config/opencode/skills`, e quelle di un progetto da `.opencode/skills`.

{{slot:opencode}}

Legge anche `~/.claude/skills` e `~/.agents/skills`. Esegui `opencode debug skill` per vedere cosa ha trovato. · [Documentazione di OpenCode]({{value:opencodeDocsUrl}}) · verificato il {{value:checkedOn}}

Poi chiedi al tuo agente quali skill ha. Vengono elencate {{value:releaseSkills}}. Un altro agente che legge skill `SKILL.md` funziona allo stesso modo: copia le cartelle delle skill nella cartella da cui legge le skill.

## Uso {#use}

Scrivi al tuo agente ciò che trovi sotto **Di’**. Sostituisci `ACME-12` con la chiave di un elemento di lavoro del tuo progetto.

### `motir-run` {#motir-run}

**Di’**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Cosa succede**

Prende il prossimo elemento di lavoro pronto del tuo progetto, o quello che indichi, e lo realizza. Prima mette in ordine dopo le esecuzioni precedenti le cui pull request hanno già avuto il merge, poi prende in carico l’elemento di lavoro, lo realizza su un branch tutto suo, apre una pull request e la collega all’elemento di lavoro. Se indichi una Storia i cui figli non hanno figli propri, esegue l’intera Storia: un branch e una pull request per repository, con un commit per ogni figlio. `motir next` si ferma dopo la presa in carico e stampa il prompt, da consegnare tu a un agente. Un elemento di lavoro di tipo decisione è l’unica eccezione: scrive la pagina della decisione e la pubblica per la tua approvazione, senza branch e senza pull request.

**Cosa vedi in Motir**

L’elemento di lavoro ti viene assegnato e passa a In corso, poi a Implementato quando la sua pull request è aperta. La sua pagina mostra la pull request e una sezione Come testare. Motir lo porta a In revisione quando la CI passa e a Completato quando la pull request ha il merge; la skill non fa mai né l’uno né l’altro.

### `motir-fix` {#motir-fix}

**Di’**

- `motir fix ACME-12`

**Cosa succede**

Ripara una pull request rossa dopo che l’esecuzione che l’ha aperta è terminata: i suoi controlli sono falliti, la coda di merge l’ha espulsa, o un revisore ha rimandato indietro il video di accettazione della Storia con Riesegui. Per prima cosa prende in carico la riparazione, così nessun altro ci sovrascrive il lavoro. Poi ripara ciascuna pull request dell’elemento di lavoro sul branch che ha già, mai su uno nuovo: fa il merge del branch di base, corregge ciò che il controllo fallito indicava e invia le modifiche. Continua finché la CI è verde o ha fatto cinque tentativi, e registra di nuovo il video di accettazione quando la CI è verde dopo un Riesegui. Non apre mai una pull request, non ne fa il merge e non cambia lo stato dell’elemento di lavoro. Non è la stessa cosa di `motir fix bugs`, che lavora sulla cartella Bug del tuo progetto: `motir fix ACME-12` ripara le pull request di un solo elemento di lavoro che indichi.

**Cosa vedi in Motir**

Mentre la riparazione è in corso, la sezione Sviluppo dell’elemento di lavoro dice che è in correzione, e da chi. Le stesse pull request ricevono nuovi commit, e Motir fa avanzare l’elemento di lavoro da sé quando i loro controlli passano. Se la riparazione si arrende, l’elemento di lavoro lo dice e indica quanti tentativi ha fatto.

### `motir-continue` {#motir-continue}

**Di’**

- `motir continue ACME-12`

**Cosa succede**

Porta avanti un elemento di lavoro la cui esecuzione è morta a metà: il portatile si è chiuso, la sandbox è andata persa o il processo è stato terminato. L’elemento di lavoro è ancora In corso e il suo lavoro si trova sul branch che quell’esecuzione ha lasciato. Per prima cosa prende in carico la ripresa, così nessun altro lavora sullo stesso branch. Poi esegue il checkout di quel branch in ogni repository che l’elemento di lavoro comprende, mai uno nuovo e senza mai azzerare ciò che c’è già, e porta avanti il lavoro dal punto in cui si era fermato. Consegna come fa una nuova esecuzione: una pull request per repository, collegata all’elemento di lavoro. Usa invece `motir fix ACME-12` quando l’elemento di lavoro ha già una pull request rossa, e `motir run ACME-12` per un elemento di lavoro che nessuno ha iniziato.

**Cosa vedi in Motir**

Un elemento di lavoro la cui esecuzione è morta mostra Esecuzione interrotta nella sua sezione Sviluppo, con il comando `motir continue` da copiare. Mentre la ripresa è in corso, quella sezione dice che è in corso una ripresa, e da chi. Quando termina, l’elemento di lavoro avanza esattamente come dopo `motir run`: a Implementato, con le sue pull request collegate e una sezione Come testare.

### `motir-log-bug` {#motir-log-bug}

**Di’**

- `motir log bug the export button does nothing on an empty board`

**Cosa succede**

Tratta ciò che hai scritto come un’affermazione da verificare. Trova prima la causa nel codice, cerca un elemento di lavoro già registrato da qualcuno e non registra nulla se il comportamento risulta corretto. Altrimenti registra un solo Bug: sotto la Storia che blocca, oppure nella cartella Bug del tuo progetto quando non blocca nulla.

**Cosa vedi in Motir**

Un nuovo elemento di lavoro di tipo Bug con la causa, il punto del codice in cui si trova e come riprodurlo, collegato all’elemento di lavoro su cui è stato trovato. Se blocca l’elemento di lavoro che stai eseguendo, quell’elemento passa a Bloccato.

### `motir-mark` {#motir-mark}

**Di’**

- `motir mark ACME-12 done`

**Cosa succede**

Chiude un elemento di lavoro che nessuna pull request può chiudere: uno manuale, come creare un account, impostare un secret o cambiare un’impostazione. Dirlo è la tua conferma che il lavoro è finito. Rifiuta un elemento di lavoro che ha una pull request, perché è il merge di quella pull request a chiuderlo.

**Cosa vedi in Motir**

L’elemento di lavoro passa a Completato, con un commento che registra che lo hai confermato. Lo stato del suo elemento padre deriva da quello dei suoi figli.

### `motir-guide` {#motir-guide}

**Di’**

- `motir guide ACME-12`
- `motir guide`

**Cosa succede**

Ti accompagna passo dopo passo in un elemento di lavoro manuale. Indicane uno, oppure di’ solo `motir guide` e riprende il tuo non ancora finito, altrimenti il prossimo elemento di lavoro manuale pronto. Ti dà un passo, con le sue istruzioni ed eventuali comandi da copiare, e aspetta. Di’ fatto, e controlla ciò che può senza cambiare nulla, per esempio recuperare l’indirizzo o eseguire un comando di sola lettura, e ti dice cosa ha visto. Un passo il cui controllo fallisce non viene spuntato; ricevi di nuovo lo stesso passo. Puoi fermarti a qualsiasi passo, e `motir guide` riprende da dove avevi lasciato. Se l’elemento di lavoro non ha ancora passi, ne propone alcuni a partire dalla descrizione e te lo chiede prima di scriverli nell’elemento di lavoro. Se un passo risulta sbagliato, offre una correzione e modifica il passo o il testo dell’elemento di lavoro solo quando dici di sì.

**Cosa vedi in Motir**

L’elemento di lavoro ti viene assegnato e passa a In corso. La sua Lista di cose da fare spunta ogni passo man mano che lo completi, con chi l’ha fatto. Quando l’ultimo passo è spuntato, l’elemento di lavoro passa a Completato, con un commento che riassume ogni passo e come è stato confermato.

### `motir-fix-bugs` {#motir-fix-bugs}

**Di’**

- `motir fix bugs`
- `motir fix bugs 3`

**Cosa succede**

Lavora sui bug della cartella Bug del tuo progetto che sono ancora Da fare, uno alla volta, dal più vecchio. I bug nelle cartelle dentro Bug restano intatti. Per ognuno verifica prima che il bug sia reale sul tuo branch predefinito, poi gli dà esattamente un esito. Un bug che sa correggere riceve una pull request che corregge quel bug e nient’altro. Un bug che aspetta un altro elemento di lavoro non ancora finito viene collegato a quell’elemento di lavoro e spostato sotto la stessa Storia. Un bug che non può correggere qui riceve un commento e viene messo da parte: già corretto, con ciò che l’ha corretto; non riproducibile, con ciò che ha eseguito; oppure richiede una tua decisione, con la domanda e la sua raccomandazione. Ogni esito toglie il bug da Da fare, quindi l’esecuzione termina da sé. Aggiungi un numero e si ferma dopo quel numero di bug. Termina con un resoconto che elenca per primi i bug che aspettano te.

**Cosa vedi in Motir**

Un bug corretto passa a Implementato con la sua pull request collegata, e a Completato quando ne fai il merge. Un bug che aspetta altro lavoro passa a Bloccato, con un collegamento bloccato da verso quell’elemento di lavoro. Un bug già corretto passa a Completato. Uno che non riesce a riprodurre, o che richiede una tua decisione, passa a Bloccato. Ognuno di questi ha un commento con la prova o la domanda. Rispondi alla domanda e riporta il bug a Da fare, e l’esecuzione successiva lo riprende.

## Quando un elemento di lavoro è sbagliato {#wrong}

A volte un elemento di lavoro non può essere realizzato così com’è scritto. Può chiedere qualcosa che non esiste, richiedere un design che nessuno ha disegnato o toccare due repository. `motir-run` non cerca di aggirarlo a tentativi. Porta l’elemento di lavoro a **In pianificazione**, così nessun’altra esecuzione lo prende, e chiede al Pianificatore Motir AI di pianificare la correzione. Poi si ferma. Il piano aspetta che tu lo riveda e lo approvi in Motir, e non viene realizzato nulla finché non lo fai.

Se il tuo token non può usare la pianificazione AI, o i tuoi crediti AI sono esauriti, si ferma comunque. Lascia un commento sull’elemento di lavoro con l’intera correzione e spiega perché non ha potuto consegnarla.

## Aggiornamento {#updating}

Un nuovo rilascio ha un nuovo tag, e questa pagina passa a quello. Per un’installazione per copia, esegui di nuovo il passo di installazione del tuo agente: sovrascrive le cartelle delle skill sul posto. In Claude Code un marketplace non può essere aggiunto di nuovo a un tag diverso, quindi rimuovilo, aggiungilo al nuovo tag e installa di nuovo il plugin:

{{slot:update}}

Riavvia il tuo agente dopo, così legge le nuove versioni.
