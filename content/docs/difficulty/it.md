---
source: 46869c4914a3
---

Un’attività, una sottoattività o un bug può avere una **difficoltà**: quanto ragionamento richiede il lavoro, non quanto lavoro c’è da fare. Gli story point e le stime misurano la dimensione. La difficoltà dice quanto è difficile farlo bene, quindi una modifica di una sola riga all’ordine dei lock può essere `high`, mentre una rinomina estesa e meccanica è `trivial`.

Motir indica la difficoltà di un elemento di lavoro nel prompt che consegna al tuo agente. Motir non sceglie il modello al posto tuo: usa i livelli qui sotto per decidere su quale modello eseguire ogni elemento di lavoro. Le Epic e le Storie non hanno una difficoltà.

## I quattro livelli {#the-four-levels}

- **`trivial`** — Lavoro meccanico con una specifica non ambigua e nessuna scelta da valutare. La modifica è descritta per intero dall’elemento di lavoro. Per esempio: una rinomina, una modifica di testo, un cambio di configurazione, l’aggiornamento di una versione.
- **`low`** — Lavoro di routine che segue uno schema già presente nel codice. Serve un po’ di lettura, ma la risposta giusta è chiara una volta trovata. Per esempio: un nuovo campo in un modulo esistente, un endpoint simile a quelli vicini, un bug circoscritto con una riproduzione chiara.
- **`medium`** — Lavoro con vere scelte di progettazione: più file o servizi, compromessi da valutare, o una specifica che lascia spazio all’interpretazione. Per esempio: una funzionalità che attraversa l’API e l’interfaccia, un refactoring con chiamanti da migrare, un bug di cui la causa non è ancora nota.
- **`high`** — Lavoro in cui un errore sottile costa caro: concorrenza, sicurezza, migrazioni di dati, autenticazione, o una progettazione senza precedenti da seguire. Per esempio: l’ordine dei lock, la modifica di un modello di permessi, una migrazione di schema su dati in produzione, un nuovo sottosistema.

Quando non è impostata alcuna difficoltà, tratta l’elemento di lavoro come `medium`. Un livello non impostato significa che nessuno l’ha ancora valutato, e non è un motivo per mandarlo al modello più economico.

## Modelli suggeriti per ogni livello {#models}

Ogni livello elenca i suoi candidati in ordine. Prendi il primo che il tuo progetto può usare. La tabella mostra il prezzo di ogni modello per milione di token (input / output), il suo punteggio su due benchmark di programmazione e quanto è costata un’attività su SWE-rebench. Quel benchmark usa attività nuove su cui un modello non può essersi addestrato, quindi il suo costo per attività è la cifra pubblica più vicina a quanto costerà una delle tue sottoattività.

### `trivial` · circa {{value:costRangeTrivial}} per attività {#level-trivial}

{{slot:trivial}}

### `low` · circa {{value:costRangeLow}} per attività {#level-low}

{{slot:low}}

### `medium` · circa {{value:costRangeMedium}} per attività {#level-medium}

{{slot:medium}}

### `high` · circa {{value:costRangeHigh}} e oltre per attività {#level-high}

{{slot:high}}

Un costo contrassegnato con ≈ non è stato misurato. Si ottiene prendendo un modello misurato della stessa famiglia e scalandolo in base alla differenza di prezzo dei token. Un trattino significa che non esiste ancora un punteggio o un costo pubblico.

## Come leggere i numeri {#reading-the-numbers}

- **I due benchmark non concordano, quindi nessuno dei due decide da solo.** SWE-bench Pro copre più modelli, ma è noto che circa il 30% delle sue attività pubbliche è difettoso. SWE-rebench è più difficile da aggirare, ed è il motivo per cui DeepSeek V4 Pro e GPT-5.6 Luna sono in `trivial`: entrambi ottengono sulle sue attività nuove un punteggio più basso di 15–19 punti.
- **Confronta il costo per attività completata, non il prezzo per token.** Un modello più economico che fallisce e deve essere rieseguito costa più di uno più forte che riesce al primo tentativo. GPT-5.6 Sol e Claude Sonnet 5 costano lo stesso per token, ma Sol ha completato più attività con un costo per attività inferiore.
- **Sali di un livello quando un’esecuzione fallisce.** Se i controlli di un elemento di lavoro falliscono o la sua revisione viene rifiutata, eseguilo di nuovo sul livello successivo anziché sullo stesso modello.
- **Controlla dove possono andare i tuoi dati.** Non tutti i provider possono essere usati per ogni progetto. Consulta [Provider di modelli](/legal/model-providers) per sapere come ciascuno tratta i contenuti che riceve.

## Quanto è aggiornato {#how-current-this-is}

I prezzi e i punteggi di questa pagina sono stati letti il {{value:asOf}}. I prezzi dei token provengono dal gateway dei modelli di Motir, che li aggiorna da OpenRouter; Claude Opus 5.5 è stato aggiunto direttamente da OpenRouter perché è stato lanciato dopo l’ultimo aggiornamento del gateway. I modelli cambiano ogni pochi mesi, quindi considera i candidati un punto di partenza e tieni quelli che portano a termine i tuoi elementi di lavoro.

- [Classifica SWE-bench Pro (BenchLM, 22 settembre 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [Classifica SWE-rebench (attività dal 15 maggio al 1° luglio 2026)](https://swe-rebench.com/)
