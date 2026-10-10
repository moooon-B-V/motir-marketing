---
source: 46869c4914a3
---

Eine Aufgabe, Unteraufgabe oder ein Bug kann eine **Schwierigkeit** tragen: wie viel Überlegung die Arbeit verlangt, nicht wie viel Arbeit es ist. Story Points und Schätzungen messen den Umfang. Die Schwierigkeit sagt, wie schwer es ist, die Arbeit richtig zu erledigen – eine einzeilige Änderung an der Sperrreihenfolge kann also `high` sein, während eine große, mechanische Umbenennung `trivial` ist.

Motir nennt die Schwierigkeit eines Arbeitselements in dem Prompt, den es an Ihren Agenten übergibt. Motir wählt das Modell nicht für Sie aus: Nutzen Sie die folgenden Stufen, um zu entscheiden, mit welchem Modell Sie jedes Arbeitselement ausführen. Epics und Storys tragen keine Schwierigkeit.

## Die vier Stufen {#the-four-levels}

- **`trivial`** – Mechanische Arbeit mit eindeutiger Vorgabe und ohne Ermessensentscheidungen. Die Änderung wird vollständig durch das Arbeitselement beschrieben. Zum Beispiel: eine Umbenennung, eine Textänderung, ein Konfigurationsschalter, ein Versions-Update.
- **`low`** – Routinearbeit nach einem Muster, das die Codebasis bereits kennt. Etwas Lesen ist nötig, aber die richtige Antwort ist klar, sobald man sie gefunden hat. Zum Beispiel: ein neues Feld durch ein bestehendes Formular, ein Endpunkt nach dem Vorbild seiner Nachbarn, ein abgegrenzter Bug mit klarer Reproduktion.
- **`medium`** – Arbeit mit echten Entwurfsentscheidungen: mehrere Dateien oder Dienste, abzuwägende Zielkonflikte oder eine Vorgabe, die Raum für Interpretation lässt. Zum Beispiel: ein Feature über die API und die Oberfläche hinweg, ein Refactoring mit zu migrierenden Aufrufern, ein Bug, dessen Ursache noch unbekannt ist.
- **`high`** – Arbeit, bei der ein subtiler Fehler teuer wird: Nebenläufigkeit, Sicherheit, Datenmigrationen, Authentifizierung oder ein Entwurf ohne Vorbild. Zum Beispiel: Sperrreihenfolge, eine Änderung des Berechtigungsmodells, eine Schemamigration auf Live-Daten, ein neues Subsystem.

Ist keine Schwierigkeit gesetzt, behandeln Sie das Arbeitselement als `medium`. Eine nicht gesetzte Stufe bedeutet, dass noch niemand es beurteilt hat, und das ist kein Grund, es an das günstigste Modell zu schicken.

## Empfohlene Modelle je Stufe {#models}

Jede Stufe nennt ihre Kandidaten in einer Reihenfolge. Nehmen Sie den ersten, den Ihr Projekt verwenden darf. Die Tabelle zeigt den Preis jedes Modells pro Million Tokens (Eingabe / Ausgabe), sein Ergebnis in zwei Coding-Benchmarks und was eine Aufgabe in SWE-rebench gekostet hat. Dieser Benchmark nutzt frische Aufgaben, mit denen ein Modell nicht trainiert worden sein kann; seine Kosten pro Aufgabe sind daher die öffentliche Zahl, die den Kosten einer Ihrer Unteraufgaben am nächsten kommt.

### `trivial` · etwa {{value:costRangeTrivial}} pro Aufgabe {#level-trivial}

{{slot:trivial}}

### `low` · etwa {{value:costRangeLow}} pro Aufgabe {#level-low}

{{slot:low}}

### `medium` · etwa {{value:costRangeMedium}} pro Aufgabe {#level-medium}

{{slot:medium}}

### `high` · etwa {{value:costRangeHigh}} und mehr pro Aufgabe {#level-high}

{{slot:high}}

Ein mit ≈ markierter Preis wurde nicht gemessen. Er nimmt ein gemessenes Modell derselben Familie und skaliert es mit dem Unterschied im Tokenpreis. Ein Gedankenstrich bedeutet, dass es noch kein öffentliches Ergebnis und keine öffentlichen Kosten gibt.

## Die Zahlen lesen {#reading-the-numbers}

- **Die beiden Benchmarks widersprechen sich, deshalb entscheidet keiner allein.** SWE-bench Pro deckt mehr Modelle ab, aber etwa 30 % seiner öffentlichen Aufgaben sind bekanntermaßen fehlerhaft. SWE-rebench lässt sich schwerer austricksen, und es ist der Grund, warum DeepSeek V4 Pro und GPT-5.6 Luna in `trivial` stehen: Beide erreichen bei dessen frischen Aufgaben 15 bis 19 Punkte weniger.
- **Vergleichen Sie die Kosten pro erledigter Aufgabe, nicht den Preis pro Token.** Ein günstigeres Modell, das scheitert und erneut ausgeführt werden muss, kostet mehr als ein stärkeres, das beim ersten Mal gelingt. GPT-5.6 Sol und Claude Sonnet 5 kosten pro Token gleich viel, aber Sol hat mehr Aufgaben zu geringeren Kosten pro Aufgabe erledigt.
- **Gehen Sie eine Stufe höher, wenn ein Lauf fehlschlägt.** Wenn die Prüfungen eines Arbeitselements fehlschlagen oder seine Review abgelehnt wird, führen Sie es erneut mit der nächsthöheren Stufe aus statt mit demselben Modell.
- **Prüfen Sie, wohin Ihre Daten gehen dürfen.** Nicht jeder Anbieter kann für jedes Projekt verwendet werden. Unter [Modellanbieter](/legal/model-providers) steht, wie jeder von ihnen die gesendeten Inhalte behandelt.

## Wie aktuell das ist {#how-current-this-is}

Preise und Ergebnisse auf dieser Seite wurden am {{value:asOf}} abgelesen. Die Tokenpreise stammen vom Modell-Gateway von Motir, das sie von OpenRouter aktualisiert; Claude Opus 5.5 wurde direkt von OpenRouter ergänzt, weil es nach der letzten Aktualisierung des Gateways erschienen ist. Modelle ändern sich alle paar Monate, betrachten Sie die Kandidaten also als Ausgangspunkt und behalten Sie die, die Ihre eigenen Arbeitselemente erledigen.

- [SWE-bench-Pro-Bestenliste (BenchLM, 22. September 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [SWE-rebench-Bestenliste (Aufgaben vom 15. Mai bis 1. Juli 2026)](https://swe-rebench.com/)
