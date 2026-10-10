---
source: 8e83d53f1b7a
---

Collega Sentry a un progetto Motir e gli errori che i tuoi servizi già segnalano arrivano sulla Bacheca di quel progetto come elementi di lavoro di tipo Bug: pianificati, assegnati e portati a termine come qualsiasi altro lavoro. Correggere il Bug chiude il cerchio: Motir risolve l’errore in Sentry al posto tuo.

## Cosa fa {#what-it-does}

- **Ogni nuovo errore diventa un Bug.** Motir controlla a intervalli regolari i progetti Sentry che hai scelto. Un errore che non ha mai visto prima viene registrato come elemento di lavoro `bug` nella destinazione dei bug del progetto, con il culprit dell’errore, il suo livello e un link che porta a Sentry.
- **Una ricorrenza aggiorna lo stesso Bug.** Quando un errore si ripete, il Bug esistente viene aggiornato: non viene registrato alcun duplicato.
- **Completato in Motir significa risolto in Sentry.** Quando il Bug raggiunge uno stato completato, Motir risolve il suo errore in Sentry.
- **Il responsabile in Sentry segue l’errore.** Se un errore è assegnato a una persona in Sentry e questa è membro dell’area di lavoro Motir (verificato tramite l’email), il Bug viene assegnato a lei.

Entrambe le direzioni si possono disattivare, per ogni progetto monitorato: vedi [Impostazioni](#settings).

## Prima di iniziare {#before-you-start}

- In Motir ti serve il permesso di gestire le integrazioni del progetto. Senza di esso, la pagina Monitoraggio ti dice a chi chiedere.
- In Sentry devi avere il permesso di installare integrazioni nella tua organizzazione: di solito è un proprietario o un manager.

## Collega Sentry {#connect-sentry}

1. In Motir apri le impostazioni del progetto e scegli _Monitoraggio_.
2. Scegli _Collega Sentry_. Vieni portato su Sentry.
3. In Sentry scegli la tua organizzazione e approva l’installazione. Sentry ti riporta su Motir, che mostra _Sentry è collegato._
4. Scegli _Scegli i progetti Sentry_, seleziona i progetti i cui errori devono arrivare su questa Bacheca e conferma. Non arriva nulla finché non lo fai.

Puoi monitorare più progetti Sentry da un solo progetto Motir, e aggiungerne altri in seguito con _Aggiungi un progetto monitorato_.

## Impostazioni {#settings}

Ogni progetto monitorato ha le proprie impostazioni:

- **Livello minimo** — vengono registrati solo gli errori di questo livello o superiore. Il valore predefinito è _Tutti i livelli_. Scegliendo un livello più basso vengono controllati anche gli errori precedenti, dal momento in cui il progetto è stato monitorato per la prima volta.
- **Risolvi in Sentry quando il Bug è completato** — attivo per impostazione predefinita. Disattivalo per lasciare gli errori in Sentry così come sono quando i loro Bug sono completati.
- **Prendi il Responsabile da Sentry** — attivo per impostazione predefinita. Disattivalo per ignorare le assegnazioni fatte in Sentry.

## Permessi richiesti {#permissions-it-asks-for}

Motir chiede a Sentry l’insieme più ristretto di permessi che queste funzioni richiedono, e niente di più ampio:

| Scope di Sentry | A cosa serve a Motir                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`      | Leggere quale organizzazione è stata collegata, elencarne i progetti per farti scegliere quali monitorare e verificare che la connessione funzioni ancora.                                           |
| `project:read`  | Leggere i progetti che hai scelto di monitorare.                                                                                                                                                     |
| `event:read`    | Leggere i nuovi errori nei progetti monitorati (titolo, livello, culprit, quante volte si sono verificati, gli ultimi stack frame e a chi sono assegnati) così che ciascuno possa arrivare come Bug. |
| `event:write`   | Contrassegnare un errore come risolto in Sentry quando il suo Bug è completato. Non viene scritto nient’altro.                                                                                       |

L’accesso che Sentry concede viene memorizzato cifrato e non viene mai mostrato a nessuno, nemmeno a te.

## Quando la connessione risulta Degradato {#when-the-connection-shows-degraded}

_Degradato_ significa che Motir non riesce più a leggere gli errori della tua organizzazione, e finché non lo risolvi non arriva nulla di nuovo sulla Bacheca. Accanto a _Sentry dice:_ la pagina mostra il motivo con le parole di Sentry.

- Scegli prima _Verifica di nuovo_: un problema passeggero dal lato di Sentry si risolve da solo.
- Se resta degradato, scegli _Ricollega_. Se Sentry dice che l’integrazione è già installata, disinstalla Motir dalle impostazioni delle integrazioni della tua organizzazione Sentry, poi scegli di nuovo _Ricollega_. I tuoi progetti monitorati, le loro impostazioni e i Bug già registrati vengono conservati.

## Scollega {#disconnect}

Per smettere di monitorare un progetto Sentry, usa _Smetti di monitorare_ sulla sua riga. Rimuovere l’ultimo progetto monitorato equivale a _Scollega Sentry_: elimina anche l’accesso memorizzato da Motir alla tua organizzazione, e per monitorarla di nuovo ti colleghi di nuovo tramite Sentry.

I Bug già registrati restano sulla Bacheca come normali elementi di lavoro. Scollegare non modifica nulla in Sentry. Per revocare l’accesso anche dal lato di Sentry, disinstalla Motir dalle impostazioni delle integrazioni della tua organizzazione Sentry.
