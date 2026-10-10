---
source: 656e3e6e6922
---

Die öffentliche Lese-API ist versioniert. Die Version des Vertrags steht im Feld `info.version` des ausgelieferten OpenAPI-Dokuments, und eine Änderung, die einen Client bricht, ist eine neue Version und keine stille Bearbeitung.

## Was `v1` garantiert {#the-guarantee}

Solange `v1` besteht, ändern sich seine Pfade nicht, ein Fehler-`code` ändert nicht seine Bedeutung, eine bestehende Bedingung ändert nicht ihren Status, und ein Feld ändert weder Typ noch Nullbarkeit. Alles, was dagegen verstößt, ist ein Release `v2` und keines von `v1`.

### Innerhalb von `v1` ohne Ankündigung erlaubt {#allowed-inside-v1}

- Ein neuer Endpunkt.
- Ein neuer OPTIONALER Query-Parameter.
- Ein neues Feld in einem Antwortobjekt.
- Ein neuer Antwort-Header.
- Ein neuer Wert in einem Feld, das als offen dokumentiert ist.
- Ein erhöhtes Ratenlimit.

### Erfordert eine neue Hauptversion {#needs-a-new-major}

- Ein Feld entfernen.
- Ein Feld umbenennen.
- Typ oder Nullbarkeit eines Felds ändern.
- Einen Fehler-`code` entfernen oder umwidmen.
- Einen bestehenden Status für eine bestehende Bedingung ändern.
- Ein Limit verschärfen.
- Einen optionalen Parameter zur Pflicht machen.

## Ihre Seite des Versprechens {#your-obligation}

**Ein Client MUSS unbekannte Felder und unbekannte Werte tolerieren und DARF den menschenlesbaren Satz in `error` NICHT auswerten.** Das ist die andere Hälfte des Versprechens, ohne die die obige Garantie nicht gilt: Ein Client, der ein Feld ablehnt, das er nicht kennt, bricht bei einer Änderung, die diese Seite als unkritisch bezeichnet, und ein Client, der `error` auswertet, bricht bei einem umformulierten Satz. Verzweigen Sie anhand von `code` und ignorieren Sie, was Sie nicht kennen, dann kosten Sie alle additiven Änderungen nichts.

## Veralten von Funktionen {#deprecation}

Eine veraltete Operation oder ein veraltetes Feld ist **in der Spezifikation** mit `deprecated: true` markiert und nennt den Grund und den Ersatz in seiner Beschreibung. Die Spezifikation ist der Ankündigungskanal, weil sie das eine Artefakt ist, das jeder Client ohnehin liest – ein Codegenerator zeigt das Veralten also an, ohne dass jemand einen Blogbeitrag gesehen haben muss.

Das alte Verhalten funktioniert für den angekündigten Zeitraum weiter. Ein Feld wird nie überraschend entfernt.

## Wie `v2` erscheinen würde {#how-v2-arrives}

Als ZWEITES Dokument unter einem zweiten Pfad, das neben `v1` ausgeliefert wird – nicht als dessen Neufassung. `v1` funktioniert an dem Tag, an dem `v2` erscheint, weiter, und das Veralten von `v1` ist selbst eine Ankündigung mit demselben Zeitraum.

Die `info.version` der Spezifikation ist die Version des API-Vertrags und nicht die Release-Nummer der App: Ihre Hauptversion ist die Pfadversion, die Nebenversion steigt bei einer additiven Änderung aus der obigen Liste, und die Patch-Version bei einer rein dokumentarischen Korrektur. Lesen Sie sie aus jeder Antwort als `X-Motir-Api-Version` aus – [Erste Schritte](/docs/api/getting-started) zeigt, wo.

Diese Seite ist die veröffentlichte Zusage. Die interne Aufzeichnung, aus der sie entstanden ist, ist [das Entscheidungsprotokoll zur API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
