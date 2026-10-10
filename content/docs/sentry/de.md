---
source: 8e83d53f1b7a
---

Verbinden Sie Sentry mit einem Motir-Projekt, und die Fehler, die Ihre Dienste ohnehin melden, erscheinen auf dem Board dieses Projekts als Bug-Arbeitselemente – geplant, zugewiesen und bis zum Abschluss geführt wie jede andere Arbeit. Das Beheben des Bugs schließt den Kreis: Motir löst den Fehler in Sentry für Sie auf.

## Was es tut {#what-it-does}

- **Jeder neue Fehler wird zu einem Bug.** Motir prüft die von Ihnen gewählten Sentry-Projekte nach einem Zeitplan. Ein Fehler, den es noch nicht kannte, wird als `bug`-Arbeitselement am Bug-Ziel des Projekts angelegt, mit dem Verursacher des Fehlers, seiner Stufe und einem Link zurück zu Sentry.
- **Ein erneutes Auftreten aktualisiert denselben Bug.** Tritt ein Fehler erneut auf, wird sein vorhandener Bug aktualisiert – es wird kein Duplikat angelegt.
- **Erledigt in Motir heißt aufgelöst in Sentry.** Erreicht der Bug einen Status der Kategorie „Erledigt“, löst Motir seinen Fehler in Sentry auf.
- **Der Verantwortliche aus Sentry folgt dem Fehler.** Ist ein Fehler in Sentry jemandem zugewiesen und ist diese Person Mitglied des Motir-Arbeitsbereichs (abgeglichen über die E-Mail-Adresse), wird der Bug ihr zugewiesen.

Beide Richtungen lassen sich pro überwachtem Projekt abschalten – siehe [Einstellungen](#settings).

## Bevor Sie beginnen {#before-you-start}

- In Motir brauchen Sie die Berechtigung, die Integrationen des Projekts zu verwalten. Ohne sie nennt Ihnen die Seite „Monitoring“, wen Sie fragen können.
- In Sentry müssen Sie in Ihrer Organisation Integrationen installieren dürfen – in der Regel ein Owner oder Manager.

## Sentry verbinden {#connect-sentry}

1. Öffnen Sie in Motir die Einstellungen des Projekts und wählen Sie _Monitoring_.
2. Wählen Sie _Sentry verbinden_. Sie werden zu Sentry weitergeleitet.
3. Wählen Sie in Sentry Ihre Organisation und genehmigen Sie die Installation. Sentry leitet Sie zurück zu Motir, das _Sentry ist verbunden._ anzeigt.
4. Wählen Sie _Sentry-Projekte wählen_, markieren Sie die Projekte, deren Fehler auf dieses Board gelangen sollen, und bestätigen Sie. Bis dahin kommt nichts an.

Sie können mehrere Sentry-Projekte von einem Motir-Projekt aus überwachen und später mit _Überwachtes Projekt hinzufügen_ weitere ergänzen.

## Einstellungen {#settings}

Jedes überwachte Projekt hat eigene Einstellungen:

- **Mindeststufe** – nur Fehler ab dieser Stufe werden angelegt. Der Standard ist _Jede Stufe_. Wählen Sie eine niedrigere Stufe, werden auch frühere Fehler ab dem Zeitpunkt geprüft, an dem das Projekt erstmals überwacht wurde.
- **In Sentry auflösen, wenn der Bug erledigt ist** – standardmäßig aktiviert. Schalten Sie es ab, wenn Fehler in Sentry unverändert bleiben sollen, sobald ihre Bugs erledigt sind.
- **Verantwortlichen aus Sentry übernehmen** – standardmäßig aktiviert. Schalten Sie es ab, um Zuweisungen in Sentry zu ignorieren.

## Berechtigungen, die angefragt werden {#permissions-it-asks-for}

Motir fragt Sentry nach der kleinstmöglichen Menge an Berechtigungen, die diese Funktionen brauchen, und nach nichts Weitergehendem:

| Sentry-Scope   | Wofür Motir ihn verwendet                                                                                                                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`     | Lesen, welche Organisation verbunden wurde, ihre Projekte auflisten, damit Sie wählen können, welche überwacht werden sollen, und prüfen, ob die Verbindung noch funktioniert.                                       |
| `project:read` | Die Projekte lesen, die Sie zur Überwachung gewählt haben.                                                                                                                                                           |
| `event:read`   | Neue Fehler in den überwachten Projekten lesen – ihren Titel, ihre Stufe, den Verursacher, wie oft sie aufgetreten sind, die jüngsten Stack-Frames und wem sie zugewiesen sind –, damit jeder als Bug ankommen kann. |
| `event:write`  | Einen Fehler in Sentry als aufgelöst markieren, wenn sein Bug erledigt ist. Sonst wird nichts geschrieben.                                                                                                           |

Der von Sentry gewährte Zugriff wird verschlüsselt gespeichert und niemandem wieder angezeigt, auch Ihnen nicht.

## Wenn die Verbindung „Beeinträchtigt“ anzeigt {#when-the-connection-shows-degraded}

_Beeinträchtigt_ bedeutet, dass Motir die Fehler Ihrer Organisation nicht mehr lesen kann und nichts Neues auf das Board gelangt, bis das behoben ist. Neben _Sentry meldet:_ zeigt die Seite den Grund in den eigenen Worten von Sentry.

- Wählen Sie zuerst _Erneut prüfen_ – ein vorübergehendes Problem auf Seiten von Sentry löst sich von selbst.
- Bleibt der Zustand beeinträchtigt, wählen Sie _Erneut verbinden_. Meldet Sentry, die Integration sei bereits installiert, deinstallieren Sie Motir in den Integrationseinstellungen Ihrer Sentry-Organisation und wählen Sie dann erneut _Erneut verbinden_. Ihre überwachten Projekte, ihre Einstellungen und die bereits angelegten Bugs bleiben erhalten.

## Trennen {#disconnect}

Um die Überwachung eines Sentry-Projekts zu beenden, verwenden Sie _Überwachung beenden_ in seiner Zeile. Das letzte überwachte Projekt zu entfernen heißt _Sentry trennen_: Dabei wird auch der gespeicherte Zugriff von Motir auf Ihre Organisation entfernt, und um sie erneut zu überwachen, verbinden Sie sich noch einmal über Sentry.

Bugs, die bereits angelegt wurden, bleiben als gewöhnliche Arbeitselemente auf dem Board. Durch das Trennen wird in Sentry nichts verändert. Um den Zugriff auch auf Seiten von Sentry zu widerrufen, deinstallieren Sie Motir in den Integrationseinstellungen Ihrer Sentry-Organisation.
