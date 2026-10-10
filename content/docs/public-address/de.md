---
source: b6adcdeabaad
---

Ein öffentliches Projekt ist unter einer Adresse erreichbar, die Sie selbst wählen. Jeder Arbeitsbereich kann eine eigene Adresse beanspruchen, und ein Projekt kann zusätzlich unter einer Domain antworten, die Ihnen bereits gehört.

## Ihre Motir-Adresse {#your-motir-address}

Ein Arbeitsbereich beansprucht eine einzige Subdomain, und jedes öffentliche Projekt darin antwortet darunter – aus `acme` wird also `acme.motir.site/ROADMAP` für ein Projekt mit dem Schlüssel `ROADMAP`. Ein Inhaber oder Administrator des Arbeitsbereichs beansprucht sie, in den Projekteinstellungen unter _Öffentliche Adresse_.

Ein Label besteht aus Kleinbuchstaben, Ziffern und Bindestrichen und ist drei bis dreiundsechzig Zeichen lang. Eine kleine Menge von Namen ist für die eigenen Hosts von Motir reserviert, ebenso Namen, die ein Leser damit verwechseln könnte.

Sie können sie begrenzt oft umbenennen, und der Bereich zeigt an, wie viele Umbenennungen Ihnen bleiben. **Die alte Adresse funktioniert danach weiter und wird nie freigegeben.** Sie leitet dauerhaft auf die neue weiter und kann von niemand anderem beansprucht werden – auch später nicht von Ihnen. Das ist Absicht: Ein Link, den jemand bereits weitergegeben hat, darf nicht eines Tages an einen Ort führen, den Sie nicht gewählt haben.

## Eigene Domain verbinden {#connecting-your-own-domain}

Eine eigene Domain zu verbinden ist in den kostenpflichtigen Plänen möglich – siehe [unsere Pläne](/). Die Subdomain Ihres Arbeitsbereichs ist in jedem Plan enthalten und funktioniert in beiden Fällen weiter.

Eine verbundene Domain stellt _ein_ Projekt unter ihrem Stamm bereit: `roadmap.acme.com/` ist die Seite dieses Projekts und `roadmap.acme.com/changelog` sein Changelog. Das Live-Board, die Arbeitselemente und die Roadmap befinden sich in der Motir-App, und die dortigen Links führen hierher.

Bei Ihrem Registrar legen Sie zwei Arten von Einträgen an. **Fügen Sie zuerst die Domain hinzu**, in den Projekteinstellungen unter _Öffentliche Adresse_: Der Bereich listet dann jeden Eintrag auf, den diese Domain braucht, mit seinem genauen Wert und einer Kopierschaltfläche. Die unten gezeigten Formen sind das, was Sie erwarten können – lesen Sie sie, um zu prüfen, ob Ihr Registrar sie anlegen kann, und entnehmen Sie die Werte dem Bereich.

### 1 · Die Domain auf uns verweisen {#point-the-domain-at-us}

Für eine **Subdomain** wie `roadmap.acme.com` genügt ein `CNAME`:

| Typ     | Name      | Wert                 |
| ------- | --------- | -------------------- |
| `CNAME` | `roadmap` | im Bereich angezeigt |

Für eine **Stammdomain** wie `acme.com` stattdessen ein `A` und ein `AAAA` – eine Stammdomain kann keinen `CNAME` tragen, weil sie bereits die Einträge `MX` und `TXT` führt, auf die Ihre E-Mail und Ihre anderen Dienste angewiesen sind:

| Typ    | Name | Wert                 |
| ------ | ---- | -------------------- |
| `A`    | `@`  | im Bereich angezeigt |
| `AAAA` | `@`  | im Bereich angezeigt |

Kopieren Sie jeden Wert aus dem Bereich und von nirgendwo sonst. Dies sind die Adressen, unter denen Motir ausgeliefert wird, gelesen von der Plattform, auf der wir laufen, und sie können sich ändern – der Bereich ändert sich mit ihnen, eine Seite wie diese nicht.

> Bietet Ihr DNS-Anbieter am Eintrag einen Schalter „Proxy“ oder „Cloud“ an, schalten Sie ihn aus: Ein Proxy vor dem Eintrag verbirgt Ihre Domain vor der Prüfung, und das Zertifikat kann nicht ausgestellt werden.

### 2 · Nachweisen, dass die Domain Ihnen gehört {#prove-the-domain-is-yours}

Neben dem Verweis-Eintrag listet der Bereich einen `TXT`-Eintrag mit einem Token auf, in dieser Form:

| Typ   | Name                    | Wert             |
| ----- | ----------------------- | ---------------- |
| `TXT` | `_motir-verify.roadmap` | `motir-verify=…` |

Kopieren Sie den Wert aus dem Bereich und nicht von hier – das Token gehört nur Ihnen. Wählen Sie dann _Verifizieren_. Sobald wir den Eintrag sehen, fordern wir ein Zertifikat an, was meist ein bis zwei Minuten dauert. Sie können die Seite schließen; der Status schreitet von selbst voran, und die Einträge bleiben unter _DNS-Einträge anzeigen_ verfügbar.

## Was jeder Status bedeutet {#what-each-status-means}

[//]: # "Translator: the Status column names states the product itself shows. Use the label the app's own messages file for your locale gives each state, not a fresh translation, so this table matches the screen."

| Status            | Was er bedeutet                                                                                                                                                | Was zu tun ist                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Nicht verifiziert | Wir haben Ihren Eigentumsnachweis noch nicht gesehen. Bei der Zertifizierungsstelle wurde noch nichts angefordert.                                             | Legen Sie den TXT-Eintrag unten an und wählen Sie dann Erneut prüfen.                     |
| Wird geprüft…     | Wir suchen gerade nach dem Eigentumsnachweis. DNS-Änderungen können einige Minuten brauchen, bis sie sich verbreiten.                                          | Warten Sie einen Moment. Er rückt von selbst weiter.                                      |
| Wird ausgestellt… | Das Eigentum ist nachgewiesen und das Zertifikat angefordert. Das dauert meist ein bis zwei Minuten.                                                           | Nichts. Motir erledigt den Rest.                                                          |
| Live              | Das Zertifikat ist ausgestellt, und Ihre Domain stellt das Projekt bereit. Es wird automatisch erneuert.                                                       | Sie können diese Adresse zur primären machen.                                             |
| Fehlgeschlagen    | Das Zertifikat konnte nicht ausgestellt werden. Der Grund steht neben dem Status – meist ein fehlender Eintrag oder einer, der woandershin verweist.           | Vergleichen Sie Ihre Einträge mit den unten genannten und wählen Sie dann Erneut prüfen.  |
| Abgelaufen        | Das Zertifikat ist abgelaufen, und die Erneuerung ist fehlgeschlagen – fast immer, weil sich ein DNS-Eintrag geändert hat. Die Domain wird nicht ausgeliefert. | Stellen Sie die Einträge wieder so her, wie sie waren, und wählen Sie dann Erneut prüfen. |
| Widerrufen        | Das Zertifikat wurde zurückgezogen. Die Domain wird nicht ausgeliefert.                                                                                        | Wählen Sie Erneut anfordern, um ein neues Zertifikat zu starten.                          |

## Welche Adresse die maßgebliche ist {#which-address-is-the-real-one}

Ein Projekt kann unter mehreren Adressen antworten, und genau eine davon ist die _primäre_ – die, die Suchmaschinen und Link-Vorschauen in sozialen Netzwerken mitgeteilt wird. Sobald das Zertifikat einer verbundenen Domain live ist, können Sie sie zur primären machen; bis dahin ist es die Motir-Adresse.

**Jede andere Adresse leitet auf die primäre weiter.** Das schließt Ihre `motir.co`-Adresse ein, sobald Sie eine eigene Domain hochgestuft haben. Besucher landen immer an einem Ort, der funktioniert, und eine Suchmaschine sieht eine Seite statt dreier Kopien, die miteinander konkurrieren.

## Eine Domain entfernen {#removing-a-domain}

Das Entfernen einer verbundenen Domain zieht ihr Zertifikat zurück, und die Adresse antwortet nicht mehr – wer sie verwendet, erhält einen Fehler, und bereits weitergegebene Links dorthin funktionieren nicht mehr. Ihr Projekt bleibt unter seinen anderen Adressen öffentlich, das Entfernen einer Domain macht ein Projekt also nie privat.

## Wenn etwas nicht funktioniert {#if-something-is-not-working}

Drei Fehler erklären fast jeden Ausfall, und jeder zeigt sich im Bereich anders.

- **Ein CNAME auf einer Stammdomain.** Die meisten Registrare akzeptieren ihn, und er funktioniert nicht. Das Symptom ist eine Domain, die auf `Not verified` bleibt oder `Failed` erreicht. Verwenden Sie stattdessen die oben genannten Einträge `A` und `AAAA`.
- **Ein Proxy-DNS-Anbieter vor dem Eintrag.** Bietet Ihr Anbieter an, den Datenverkehr zu proxen oder zu beschleunigen, verbirgt das den echten Eintrag vor uns. Das Symptom ist `Checking…`, das sich nie auflöst. Schalten Sie den Proxy für diese Einträge aus.
- **Ein veralteter Eigentumsnachweis.** Wenn Sie eine Domain entfernt und erneut hinzugefügt haben, hat sich das Token geändert. Das Symptom ist `Not verified`, obwohl ein `TXT`-Eintrag offensichtlich vorhanden ist. Ersetzen Sie seinen Wert durch den, den der Bereich jetzt anzeigt.
