---
source: 1c84b9f042c7
---

L’API pubblica di lettura è anonima: ogni endpoint di lettura restituisce i dati del progetto senza accesso, ed è questo che permette alla piazza dei progetti di funzionare per un visitatore non autenticato. Tutto ciò che è legato a un account richiede un token. Qui sotto trovi cinque passi, ognuno dei quali termina con qualcosa che vedi accadere.

Ogni percorso è relativo all’host dell’applicazione a cui punta questa build, mostrato qui sotto. Le richieste sono scritte rispetto a quell’host, quindi puoi copiarne una così com’è.

{{slot:app-host}}

## 1. Crea un token {#mint-a-token}

Crea un token di accesso personale in Impostazioni → Account → Token, scegli l’area di lavoro a cui è associato e concedigli i permessi che gli servono: sono gli stessi nomi `resource:action` che mostra la schermata Ruoli e permessi. Concedi l’insieme più ristretto che basta allo scopo: una concessione restringe il tuo ruolo e non lo amplia mai, quindi un token non può fare ciò che non potresti fare tu.

**Il segreto viene mostrato UNA SOLA VOLTA, quando il token viene creato.** Copialo subito: non c’è modo di leggerlo di nuovo, e un token perso si sostituisce, non si recupera.

## 2. La tua prima chiamata autenticata {#first-call}

Fai questa chiamata per prima. Risponde a chi è il token, a quale area di lavoro è associato e a quali permessi possiede esattamente: così scopri cosa può fare la tua credenziale senza provare gli endpoint e raccogliere rifiuti.

{{slot:first-call-request}}

{{slot:first-call-response}}

Un token mancante, malformato, sconosciuto, revocato o scaduto restituisce sempre lo stesso `401` con lo stesso messaggio. È voluto: distinguerli trasformerebbe l’endpoint in un oracolo che risponde alla domanda «questo segreto esiste?».

## 3. Scorri una raccolta {#paginate}

Le raccolte sono paginate con cursore. Chiedi una dimensione di pagina con `limit` (il valore predefinito è 50 e qualsiasi valore più grande viene ridotto a 100, non rifiutato), poi rimanda il `nextCursor` della risposta precedente come `cursor`. Un `nextCursor` pari a `null` indica l’ultima pagina.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

Il cursore è OPACO e firmato. Non analizzarlo, non costruirne uno e non portarlo da una raccolta a un’altra: un cursore emesso altrove è un `422`, mai una pagina sbagliata senza alcun avviso. Rimanda esattamente ciò che hai ricevuto.

Un’asimmetria sorprende molte persone, quindi conviene conoscerla prima di incontrarla: alcune raccolte riportano anche un `totalCount` e la maggior parte volutamente no. Dove la lettura che sta dietro una raccolta calcola già un totale come aggregato limitato, il campo viene riportato; altrove viene omesso del TUTTO, assente e mai `null` né `0`, così un client può sempre distinguere «nessun totale promesso» da «il totale è zero».

## 4. Leggi un errore {#read-an-error}

Ogni errore restituisce lo stesso corpo: un `code` per le macchine e un `error` per le persone. Ragiona sul `code`: è stabile, e cambiarlo è una modifica incompatibile. Non interpretare mai `error`; è una frase per uno sviluppatore che legge un terminale e viene riformulata liberamente.

{{slot:error-404-response}}

Un `404` significa che la risorsa non esiste **oppure** è fuori dall’area di lavoro a cui è associato il tuo token. La risposta è la stessa di proposito, così l’API non può servire a enumerare i dati di un altro tenant. Un `403` è un tipo di rifiuto opposto: il tuo token è valido e la sua concessione non ha il permesso richiesto da questa operazione, e la risposta ne indica la chiave. Un `422` è una richiesta che puoi correggere, e il suo `code` indica quale parte.

**Un `500` è l’unico errore SENZA `code`.** Un guasto imprevisto non ha un contratto stabile, quindi il corpo contiene un messaggio e nient’altro: non basare nessuna logica su di esso.

## 5. Leggi le intestazioni di risposta {#rate-limits}

Il budget è per TOKEN, e le intestazioni accompagnano OGNI risposta: un successo, un rifiuto, un errore mappato e un guasto allo stesso modo. Non devi mai fare una richiesta per scoprire a che punto sei; l’ultima te l’ha già detto.

{{slot:response-headers}}

Con un `429`, attendi fino a `X-RateLimit-Reset`, un timestamp Unix in SECONDI. Non esiste un’intestazione `Retry-After`, ed è voluto: un istante assoluto non può diventare obsoleto durante il trasporto come invece può una durata relativa.

Anche `X-Request-Id` è presente in ogni risposta. Citalo se ti serve chiederci informazioni su una chiamata specifica: è l’unico identificativo che la trova.

`X-Motir-Api-Version` è la versione del CONTRATTO che ha servito la risposta: lo stesso `MAJOR.MINOR.PATCH` dell’`info.version` della specifica, non il nostro numero di rilascio. Leggila da qualsiasi risposta, anche da un errore, per controllare eventuali discrepanze di versione. Una versione MAJOR che non riconosci significa che esiste un `/api/v2`; una MINOR più alta significa che il contratto è cresciuto, in modo additivo, e il tuo client resta corretto. Se il blocco qui sopra mostra un segnaposto al posto di una versione, la specifica non era raggiungibile quando la pagina è stata generata, e [Riferimento API](/docs/api) legge la versione corrente direttamente dal documento.

## E dopo? {#what-next}

[Riferimento API](/docs/api) elenca ogni operazione con i suoi parametri, il suo corpo e i suoi stati. [Stabilità e deprecazione](/docs/api/stability) è ciò che il contratto promette di non farti. Se stai collegando un agente anziché scrivere un client, il [server MCP](/docs/mcp) è l’altra metà.
