---
source: cdc9936762b4
---

Una sandbox è un container che avvii sulla tua macchina, con il tuo agente, la Motir CLI e i tuoi checkout, e nient’altro. Porti la tua credenziale dell’agente, montata in sola lettura; il ciclo gira all’interno, così un agente che si comporta male raggiunge il tuo albero di lavoro e non il resto della tua macchina.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Prima di iniziare {#before-you-start}

- **Docker, in esecuzione.** Compilato per `linux/amd64` **e** `linux/arm64`, quindi Apple Silicon è una macchina di prima classe e nulla viene emulato. Non c’è nessun passaggio di build: si scarica l’immagine.
- **L’accesso del tuo agente, su questa macchina.** Il suo montaggio delle credenziali è in sola lettura, quindi il container può usare un accesso ma non rinnovarlo. Claude Code su macOS è l’eccezione che incontrerai: conserva il suo token nel Portachiavi di accesso, quindi non c’è nessun file da montare, e accedi a `claude` **dentro** il container: l’immagine gli dà una cartella di configurazione scrivibile, ed è lì che finisce l’accesso. (Antigravity è uguale: il passo 2 lo dice quando lo scegli.)
- **La radice della tua area di lavoro, cioè la cartella che CONTIENE i tuoi checkout.** Un progetto di solito si estende su più repository e il ciclo gira su tutti.

{{slot:workspace}}

{{part:picker-label}}

Quale agente usi?

{{part:picker-also-supported}}

supportati anche

{{part:picker-or}}

oppure

{{part:picker-base}}

nessun agente (base)

{{part:picker-summary}}

Ogni comando qui sotto è per **{{value:profileLabel}}**. Cambiare scelta riscrive il tag e il montaggio delle credenziali nei **passi 1, 2 e 2b**, i tre punti in cui compaiono.

{{part:chip-command}}

Comando

{{part:chip-editor}}

Nel tuo editor

{{part:steps-intro}}

## Configurala {#set-it-up}

Cinque passi. Ognuno è una cosa sola da fare.

{{part:step-1-intent}}

Scarica l’immagine per il tuo agente

{{part:step-1-body}}

Non c’è nessun passaggio di build: l’immagine viene pubblicata per ogni profilo di agente.

{{part:step-2-intent}}

Avvia il container dalla radice della tua area di lavoro

{{part:step-2-body}}

Eseguilo dalla cartella che **contiene** i tuoi checkout, non da uno di essi.

{{part:step-2-vscode}}

**Preferisci usare VS Code?** I passi 2a–2c qui sotto sostituiscono questo. Tutto ciò che segue è uguale in entrambi i casi.

{{part:step-2a-intent}}

Installa l’estensione Dev Containers

{{part:step-2a-body}}

Dalla vista Estensioni, oppure dalla tavolozza dei comandi (⇧⌘P su macOS, Ctrl+Maiusc+P altrove, F1 su tutte e tre), poi _Extensions: Install Extensions_. Due di questi tre passi si fanno nella tavolozza, quindi conviene fissarla subito.

{{part:step-2b-intent}}

Crea la configurazione del dev container

{{part:step-2b-body}}

Eseguilo nella cartella che stai montando. Basta un solo incolla: crea la cartella `.devcontainer` e vi scrive dentro il file. Non provare a crearli da un selettore di file: Finder e la maggior parte dei selettori grafici rifiutano un nome che inizia con un punto, e lo rifiutano senza dire perché.

{{part:step-2b-warning}}

**Un dev container conserva l’immagine da cui è stato creato.** `--pull=always` appartiene al comando di esecuzione del passo 2, non a questa strada. Per passare all’immagine e alla CLI `motir` correnti: **1.** esegui `{{value:dockerPull}}` del passo 1 in un terminale sulla tua macchina; **2.** _Dev Containers: Open Folder in Container…_ su questa cartella, che collega la finestra; **3.** _Dev Containers: Rebuild Container_, che ricrea il container dall’immagine appena scaricata. Rebuild Container compare solo in una finestra collegata al container, ed è per questo che il passo 2 viene prima. Una ricostruzione conserva il tuo accesso a Motir (si trova nel volume `{{value:authVolume}}`) ma non un accesso a Claude Code fatto dentro il container: esegui `claude` e accedi di nuovo.

{{part:step-2c-intent}}

Apri la cartella nel container

{{part:step-2c-body}}

Tavolozza dei comandi → _Dev Containers: Open Folder in Container…_, e scegli la cartella in cui hai appena scritto il file. Il suo terminale è la stessa shell in cui ti avrebbe portato il passo 2: continua dal passo 3.

{{part:step-3-intent}}

Accedi, dentro il container

{{part:step-3-body}}

Vengono stampati un codice e un URL; approva in un browser qualsiasi. L’accesso finisce nel volume `{{value:authVolume}}`, quindi lo fai una volta sola.

{{part:step-4-intent}}

Collega la cartella al tuo progetto

{{part:step-4-body}}

Sostituisci `ACME` con la chiave del tuo progetto. Se la tua area di lavoro ha un solo progetto, ometti il flag: è tutto il passo.

{{part:step-5-intent}}

Controlla: tutto verde è la fine di questa pagina

{{part:step-5-body}}

Accesso, collegamento, il binario dell’agente e la sua credenziale. È l’unica cosa che ti dice che il container ha davvero ricevuto ciò che gli hai passato.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode conserva configurazione e credenziali in due posti, quindi servono due righe `-v`. Servono entrambe.

{{part:note-antigravity}}

Antigravity conserva il suo token nel portachiavi del sistema operativo, che non ha un file portabile da montare: quindi per lui non c’è nessuna riga `-v`, e accedi DENTRO il container anziché prima di iniziare. È l’unico profilo per cui la seconda condizione preliminare qui sopra non vale.

{{part:note-aider}}

La credenziale di Aider è una chiave API del modello che legge dall’ambiente, quindi è l’unico profilo che aggiunge una riga `-e`. Il montaggio riguarda un FILE, che deve esistere, anche vuoto, altrimenti docker crea al suo posto una cartella.

{{part:note-base}}

L’immagine di base contiene la Motir CLI e nessun agente: nulla da montare e nulla a cui accedere oltre a Motir stesso.

{{part:devcontainer-file}}

### Il file che quel comando scrive {#devcontainer-file}

È un riferimento, non un passo: il 2b l’ha già scritto. Sta qui per chi preferisce creare il file a mano, e perché le virgolette intorno a `<<’JSON’` sono essenziali: impediscono alla tua shell di espandere `${localWorkspaceFolder}` e `${localEnv:HOME}` prima che arrivino nel file. Sono sostituzioni di Dev Containers, e a risolverle è l’editor.

{{part:why}}

## Perché è fatta così {#why}

### Cosa cambia il selettore del profilo {#profile-picker}

Scegliere un agente riscrive tre cose e nient’altro: il **tag** dell’immagine, le righe `-v` della credenziale e `image`, `name` e `mounts` del dev container. È un controllo e non un paragrafo che ti dice di sostituirle tu, perché ogni comando qui ha un pulsante Copia, e chi copia è chi non ha letto l’istruzione di sostituzione.

Non ogni profilo ha una sola cartella di credenziali. `opencode` ne ha due e usa due righe `-v`; `antigravity` conserva il suo token nel portachiavi del sistema operativo e non ne usa nessuna, accedendo invece dentro il container; e `aider` monta un file e legge una chiave del modello dall’ambiente. I passi lo dicono quando li scegli.

### Nel comando di esecuzione non resta nulla che possa diventare obsoleto {#run-command}

`--pull=always` scarica l’immagine corrente a ogni avvio, così un tag di profilo che si è spostato ti raggiunge senza che tu debba accorgertene, e `--rm` significa che non resta nulla che possa diventare obsoleto. Non esiste una strada separata per riprendere il lavoro, ed è proprio ciò che un tempo lasciava le persone con un `motir` vecchio di mesi rispetto alla pagina da cui lo leggevano. Il tuo accesso sopravvive a tutto questo: è scritto nel volume `{{value:authVolume}}`, che vive fuori dal container, quindi accedi una volta sola e ogni esecuzione successiva lo ritrova; per uscire definitivamente usa `{{value:signOutCommand}}`. Lavori offline? Elimina `--pull=always`: contatta il registro a ogni avvio, quindi senza rete l’esecuzione fallisce invece di ripiegare sull’immagine che hai già. Tutto questo riguarda il comando di esecuzione. Un dev container (passi 2a–2c) conserva l’immagine da cui è stato creato finché non la scarichi, ti colleghi con _Dev Containers: Open Folder in Container…_ e scegli _Dev Containers: Rebuild Container_.

### E dopo? {#what-next}

`motir run` accetta un AMBITO: un elemento di lavoro, un’intera Storia, oppure `sprint` per quello attivo. `motir auto` invece svuota senza supervisione l’insieme degli elementi pronti, uno alla volta, su un branch di sessione. Tutti i flag che entrambi accettano sono nella pagina [{{value:cliPage}}](/docs/cli).

## Cosa confina e cosa no {#confines}

Vale la pena leggerlo prima di fidarti, perché una di queste tre è un’eccezione e non una garanzia.

- **File system: confinato.** Le uniche superfici dell’host dentro il container sono un `/workspace` scrivibile e la credenziale del tuo agente, montata in sola lettura. Nessun socket Docker, nessun altro montaggio dell’host.
- **Rete: APERTA, per scelta.** Ogni agente ha bisogno dell’API del suo provider e ogni elemento di lavoro avviato ha bisogno dei remoti git, quindi l’immagine limita il raggio d’azione sul file system e non il traffico in uscita. Se il tuo modello di minaccia richiede di più, usa i controlli di rete di Docker: il container non impedirà a un agente di parlare con internet.
- **Privilegi: senza privilegi.** Gira come utente `node` (uid 1000), quindi i file scritti nel montaggio restano di tua proprietà e non di root.

## Cosa ti offre l’ambiente {#environment}

- **La tua cartella, montata.** `$PWD` diventa `/workspace`, quindi i checkout su cui lavora l’esecuzione sono i tuoi e i commit che crea si trovano sul tuo disco quando termina.
- **Un checkout per elemento di lavoro, su un worktree git.** Un’esecuzione non modifica l’albero in cui ti trovi; aggiunge un worktree per ogni elemento, così esecuzioni parallele non possono entrare in conflitto su un checkout di branch.
- **La tua credenziale dell’agente, in SOLA LETTURA.** La cartella delle credenziali del profilo è montata con `:ro`. Nulla nel container può riscriverla, e nulla di essa viene inviato a Motir: la chiave dell’agente la porti tu, quindi il conto dell’agente è tuo e la chiamata API non passa mai da noi.
- **La CLI, preinstallata.** L’immagine contiene `motir` e il binario dell’agente indicato dal tag, quindi non c’è nulla da installare prima della prima esecuzione.
- **L’output del tuo agente resta in locale per impostazione predefinita.** A Motir arriva solo il ciclo di vita dell’esecuzione. Passando `--report-log` viene inviata in più anche la coda dell’output, così un’esecuzione fallita la mostra nella pagina dell’esecuzione; è DISATTIVATO a meno che tu non lo chieda, e il contenuto dei file, i percorsi e i diff non vengono mai inviati in nessun caso.

## Cosa può fare il token e cosa rifiuta {#token}

Un token creato da `motir login` ha una concessione fissa e ristretta. La schermata di approvazione la mostra e non può cambiarla, né ampliarla né restringerla, perché una concessione ristretta a mano interrompe a metà un ciclo senza supervisione.

{{slot:grant}}

**Quella che NON possiede è `ai:view_plan`, e il rifiuto che ne deriva è il progetto, non un errore.** Aprire un piano richiede solo `work_item:edit`, quindi un’esecuzione in sandbox PUÒ aprirne uno, e viene poi rifiutata alla prima aggiunta, perché è questa la chiave che l’aggiunta di proposte verifica. Un’esecuzione che porta avanti un elemento di lavoro non può rimodellare il piano che le è stato consegnato. Quando incontri quel rifiuto, l’agente ha fatto la cosa giusta: registra la correzione come commento, lascia l’elemento bloccato e si ferma. Non si perde nulla, e una persona decide cosa deve dire il piano.

Due flag restringono ulteriormente la concessione quando vuoi un’esecuzione più silenziosa: `--disable-log-bug` impedisce all’agente di registrare un bug per un difetto che trova altrove (commenta invece), e `--disable-replan` gli impedisce di inviare una ripianificazione per un elemento di lavoro che giudica sbagliato (commenta e si ferma). Solo con `motir auto`, `--auto-approve-replan` fa l’opposto: approva una ripianificazione inviata e continua il ciclo, invece di fermarsi ad aspettarti.

## Cosa produce un’esecuzione e dove leggerlo {#produces}

- **Un branch e una pull request** in ogni repository in cui l’elemento viene consegnato, inviati con le tue credenziali git dall’interno del container.
- **Un collegamento sull’elemento di lavoro.** L’esecuzione dichiara quale elemento ciascuna pull request consegna, quindi il merge lo fa avanzare. Quel collegamento è ciò che mostra la sezione Sviluppo della pagina dell’elemento, ed è ciò che chiude l’elemento al merge: non il nome del branch e non il titolo.
- **Lo stato, mentre procede.** L’elemento passa a In corso quando l’esecuzione lo prende in carico e a Implementato quando la pull request viene aperta. In revisione viene scritto dalla CI quando i controlli diventano verdi, e Completato dal merge.
- **Il terminale.** L’output dell’agente resta nel tuo terminale a meno che tu non abbia passato `--report-log`.

## Quando non funziona {#troubleshooting}

### Il binario dell’agente non viene trovato {#agent-binary-not-found}

Il tag e l’agente non coincidono. Controlla quale profilo hai avviato, oppure indirizza l’esecuzione a un altro binario con `--agent <cmd>`. `motir doctor` lo segnala prima che un’esecuzione sprechi un incarico su di esso.

### L’agente si avvia e non è autenticato {#agent-not-authenticated}

Il montaggio delle credenziali manca o punta alla cartella sbagliata: ogni profilo monta la propria. Esegui di nuovo la riga `{{value:dockerRun}}` per il tag che hai effettivamente scaricato.

### Non c’è nulla di pronto da eseguire {#nothing-ready}

Ogni candidato ha una dipendenza non soddisfatta. `motir ready` mostra l’insieme; `motir show` su un elemento di lavoro indica cosa lo blocca. Avviarlo comunque è `--force`, per un solo elemento.

### L’esecuzione si ferma su una ripianificazione inviata {#stopped-on-replan}

L’agente ha giudicato sbagliato l’elemento di lavoro e ha proposto una forma corretta. È l’arresto previsto: leggi il piano in Motir e approvalo o rifiutalo. Per far proseguire invece un ciclo senza supervisione, esegui `motir auto` con `--auto-approve-replan`.

### Un’esecuzione ha lasciato del lavoro dopo essere terminata {#work-left-behind}

I worktree e i branch sono sul tuo disco, sotto la cartella che hai montato: un container che si è fermato non li ha portati via con sé. `motir done` chiude un elemento di cui è stato fatto il merge, o un intero branch di sessione di cui è stato fatto il merge con `--session <branch>`.

## Cosa non copre questa pagina {#not-covered}

Ogni comando e ogni flag: sono nella pagina [{{value:cliPage}}](/docs/cli), generata dal catalogo della CLI stessa e che quindi non può discostarsene. Collegare un agente a Motir direttamente, senza la CLI, è [{{value:mcpPage}}](/docs/mcp). Far girare lo stesso ciclo di lavoro via HTTP invece che da un terminale è l’[{{value:apiPage}}](/docs/api). Eseguire la sandbox su una macchina diversa dalla tua non è ancora documentato qui. (La strada con VS Code È documentata, qui sopra: quella frase diceva il contrario, e registrava come decisione una sezione eliminata.)
