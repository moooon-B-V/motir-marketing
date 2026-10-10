---
source: 656e3e6e6922
---

L’API pubblica di sola lettura è versionata. La versione del contratto è indicata nel campo `info.version` del documento OpenAPI servito, e una modifica che rompe un client è un cambio di versione, non una modifica silenziosa.

## Cosa garantisce `v1` {#the-guarantee}

Finché `v1` è attiva, i suoi percorsi non cambiano, un `code` di errore non cambia significato, una condizione esistente non cambia stato e un campo non cambia tipo né nullabilità. Qualunque modifica che violi queste regole è una `v2`, non un rilascio di `v1`.

### Consentito dentro `v1`, senza preavviso {#allowed-inside-v1}

- Un nuovo endpoint.
- Un nuovo parametro di query OPZIONALE.
- Un nuovo campo in un oggetto di risposta.
- Una nuova intestazione di risposta.
- Un nuovo valore in un campo documentato come aperto.
- Un budget di rate limit più alto.

### Richiede una nuova versione maggiore {#needs-a-new-major}

- Rimuovere un campo.
- Rinominare un campo.
- Cambiare il tipo o la nullabilità di un campo.
- Rimuovere o riassegnare un `code` di errore.
- Cambiare lo stato esistente per una condizione esistente.
- Rendere più restrittivo un limite.
- Rendere obbligatorio un parametro opzionale.

## La tua parte della promessa {#your-obligation}

**Un client DEVE tollerare campi e valori sconosciuti e NON DEVE interpretare la frase leggibile `error`.** È l’altra metà della promessa, e senza di essa la garanzia qui sopra non regge: un client che rifiuta un campo che non riconosce si romperà con una modifica che questa pagina definisce sicura, e un client che interpreta `error` si romperà non appena la frase viene riformulata. Ragiona sul `code`, ignora ciò che non conosci, e ogni modifica additiva non ti costerà nulla.

## Deprecazione {#deprecation}

Un’operazione o un campo deprecato è contrassegnato con `deprecated: true` **nella specifica**, e nella sua descrizione riporta il motivo e il sostituto. La specifica è il canale degli annunci perché è l’unico documento che ogni client legge già: così un generatore di codice mette in evidenza la deprecazione senza che nessuno debba aver letto un post di blog.

Il vecchio comportamento continua a funzionare per tutta la finestra annunciata. Un campo non viene mai rimosso di sorpresa.

## Come arriverebbe una `v2` {#how-v2-arrives}

Come SECONDO documento a un secondo percorso, servito accanto a `v1` e non come sua riscrittura. `v1` non smette di funzionare il giorno in cui esce `v2`, e deprecare `v1` è a sua volta un annuncio soggetto alla stessa finestra.

L’`info.version` della specifica è la versione del contratto dell’API, non il numero di rilascio dell’app: la versione maggiore coincide con quella nel percorso, la minore aumenta a ogni modifica additiva tra quelle dell’elenco sopra, e la patch a ogni correzione che riguarda solo la documentazione. Leggila da qualsiasi risposta come `X-Motir-Api-Version`: [Per iniziare](/docs/api/getting-started) mostra dove.

Questa pagina è l’impegno pubblicato. Il documento interno da cui è tratta è [il registro delle decisioni sull’API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
