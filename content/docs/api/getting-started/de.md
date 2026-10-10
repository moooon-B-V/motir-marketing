---
source: 1c84b9f042c7
---

Die öffentliche Lese-API ist anonym – jeder Lese-Endpunkt liefert Projektdaten ohne Anmeldung, wodurch das Projektplatz auch für abgemeldete Besucher funktioniert. Alles, was an ein Konto gebunden ist, erfordert ein Token. Unten folgen fünf Schritte, die jeweils mit etwas enden, das Sie geschehen sehen.

Jeder Pfad ist relativ zum Anwendungs-Host, auf den dieser Build zeigt und der unten angezeigt wird. Die Anfragen sind darauf geschrieben, sodass Sie eine unverändert kopieren können.

{{slot:app-host}}

## 1. Ein Token erstellen {#mint-a-token}

Erstellen Sie ein persönliches Zugriffstoken unter Einstellungen → Konto → Tokens, wählen Sie den Arbeitsbereich, an den es gebunden ist, und erteilen Sie ihm die Berechtigungen, die es braucht – dieselben Namen im Format `resource:action`, die der Bildschirm „Rollen & Berechtigungen“ zeigt. Erteilen Sie die kleinste Menge, die den Zweck erfüllt: Eine Berechtigung schränkt Ihre eigene Rolle ein und erweitert sie nie, sodass ein Token nichts tun kann, was Sie nicht tun könnten.

**Das Geheimnis wird nur EINMAL angezeigt, beim Erstellen des Tokens.** Kopieren Sie es dann; es gibt keine Möglichkeit, es erneut zu lesen, und ein verlorenes Token wird ersetzt statt wiederhergestellt.

## 2. Ihr erster authentifizierter Aufruf {#first-call}

Setzen Sie zuerst diesen Aufruf ab. Er beantwortet, wer das Token ist, an welchen Arbeitsbereich es gebunden ist und genau welche Berechtigungen es trägt – so erfahren Sie, was Ihre eigenen Zugangsdaten dürfen, ohne Endpunkte auszuprobieren und Ablehnungen zu sammeln.

{{slot:first-call-request}}

{{slot:first-call-response}}

Ein fehlendes, fehlerhaftes, unbekanntes, widerrufenes oder abgelaufenes Token liefert jeweils dasselbe `401` mit derselben Meldung. Das ist Absicht: Würde man sie unterscheiden, würde der Endpunkt zu einem Orakel, das die Frage „Existiert dieses Geheimnis?“ beantwortet.

## 3. Eine Sammlung seitenweise abrufen {#paginate}

Sammlungen werden per Cursor seitenweise geliefert. Fordern Sie mit `limit` eine Seitengröße an (der Standard ist 50, und größere Werte werden auf 100 gekürzt, nicht abgelehnt) und senden Sie dann das `nextCursor` der vorherigen Antwort als `cursor` zurück. Ein `nextCursor` von `null` ist die letzte Seite.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

Der Cursor ist OPAK und signiert. Werten Sie ihn nicht aus, konstruieren Sie keinen und übertragen Sie ihn nicht zwischen Sammlungen – ein Cursor, der anderswo ausgestellt wurde, ergibt ein `422` und nie eine stillschweigend falsche Seite. Senden Sie genau das zurück, was Sie erhalten haben.

Eine Asymmetrie überrascht viele, deshalb sollten Sie sie kennen, bevor sie Ihnen begegnet: Einige Sammlungen melden zusätzlich ein `totalCount`, die meisten bewusst nicht. Wo die Abfrage hinter einer Sammlung bereits eine begrenzte Aggregation berechnet, wird es gemeldet; sonst fehlt das Feld VOLLSTÄNDIG – abwesend, nie `null` und nie `0`, sodass ein Client stets unterscheiden kann, ob „keine Gesamtzahl zugesagt wurde“ oder „die Gesamtzahl null ist“.

## 4. Einen Fehler lesen {#read-an-error}

Jeder Fehler liefert denselben Body: einen maschinenlesbaren `code` und einen menschenlesbaren `error`. Verzweigen Sie anhand von `code` – er ist stabil, und ihn zu ändern ist eine inkompatible Änderung. Werten Sie `error` nie aus; es ist ein Satz für eine Entwicklerin oder einen Entwickler am Terminal und wird jederzeit umformuliert.

{{slot:error-404-response}}

Ein `404` bedeutet, dass die Ressource nicht existiert **oder** außerhalb des Arbeitsbereichs liegt, an den Ihr Token gebunden ist – absichtlich dieselbe Antwort, damit die API nicht dazu dienen kann, die Daten eines anderen Mandanten aufzuzählen. Ein `403` ist die entgegengesetzte Art der Ablehnung: Ihr Token ist gültig, und seiner Berechtigung fehlt, was diese Operation verlangt; die Antwort nennt den Schlüssel. Ein `422` ist eine Anfrage, die Sie korrigieren können, und ihr `code` benennt, welcher Teil.

**Ein `500` ist der einzige Fehler OHNE `code`.** Ein unerwarteter Fehler hat keinen stabilen Vertrag, daher enthält der Body eine Meldung und sonst nichts – verzweigen Sie nicht darauf.

## 5. Die Antwort-Header lesen {#rate-limits}

Das Kontingent gilt pro TOKEN, und die Header begleiten JEDE Antwort – einen Erfolg, eine Ablehnung, einen abgebildeten Fehler und einen Ausfall gleichermaßen. Sie müssen keine Anfrage stellen, um zu erfahren, wo Sie stehen; die letzte hat es Ihnen schon gesagt.

{{slot:response-headers}}

Warten Sie bei einem `429` bis `X-RateLimit-Reset` – ein Unix-Zeitstempel in SEKUNDEN. Es gibt bewusst keinen `Retry-After`-Header: Ein absoluter Zeitpunkt kann auf dem Transportweg nicht veralten, eine relative Dauer schon.

`X-Request-Id` steht ebenfalls in jeder Antwort. Nennen Sie sie, wenn Sie uns einmal zu einem bestimmten Aufruf fragen müssen – sie ist die eine Kennung, über die wir ihn finden.

`X-Motir-Api-Version` ist die Version des VERTRAGS, der die Antwort geliefert hat – dasselbe `MAJOR.MINOR.PATCH` wie die `info.version` der Spezifikation, nicht unsere Release-Nummer. Lesen Sie sie aus jeder Antwort aus, auch aus einem Fehler, um Versionsabweichungen zu erkennen. Eine MAJOR-Version, die Sie nicht kennen, bedeutet, dass es ein `/api/v2` gibt; eine höhere MINOR-Version bedeutet, dass der Vertrag additiv gewachsen ist und Ihr Client weiterhin korrekt ist. Zeigt der Block oben statt einer Version einen Platzhalter, war die Spezifikation beim Rendern dieser Seite nicht erreichbar, und die [API-Referenz](/docs/api) liest die aktuelle Version direkt aus dem Dokument.

## Wie es weitergeht {#what-next}

Die [API-Referenz](/docs/api) listet jede Operation mit ihren Parametern, ihrem Body und ihren Status auf. [Stabilität & Veralten](/docs/api/stability) beschreibt, was der Vertrag Ihnen gegenüber zu unterlassen verspricht. Wenn Sie einen Agenten anbinden, statt einen Client zu schreiben, ist der [MCP-Server](/docs/mcp) die andere Hälfte.
