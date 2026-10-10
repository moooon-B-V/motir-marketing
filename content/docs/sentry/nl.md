---
source: 8e83d53f1b7a
---

Koppel Sentry aan een Motir-project en de fouten die je services al rapporteren, komen op het bord van dat project binnen als bug-werkitems — gepland, toegewezen en tot klaar gebracht zoals elk ander werk. De bug oplossen sluit de cirkel: Motir lost de fout in Sentry voor je op.

## Wat het doet {#what-it-does}

- **Elke nieuwe fout wordt één bug.** Motir controleert de Sentry-projecten die je hebt gekozen volgens een schema. Een fout die het nog niet eerder heeft gezien, wordt aangemaakt als `bug`-werkitem op de bugbestemming van het project, met de oorzaak (‘culprit’) van de fout, zijn niveau en een link terug naar Sentry.
- **Een herhaling werkt dezelfde bug bij.** Als een fout opnieuw optreedt, wordt de bestaande bug bijgewerkt — er wordt geen duplicaat aangemaakt.
- **Klaar in Motir betekent opgelost in Sentry.** Als de bug een klaar-status bereikt, lost Motir zijn fout in Sentry op.
- **De verantwoordelijke in Sentry volgt de fout.** Als een fout in Sentry aan iemand is toegewezen en die persoon lid is van de Motir-werkruimte (gekoppeld op e-mailadres), wordt de bug aan hem of haar toegewezen.

Beide richtingen kunnen per gemonitord project worden uitgezet — zie [Instellingen](#settings).

## Voordat je begint {#before-you-start}

- In Motir heb je het recht nodig om de integraties van het project te beheren. Zonder dat recht zegt de pagina Monitoring aan wie je het kunt vragen.
- In Sentry moet je integraties mogen installeren in je organisatie — meestal een eigenaar of manager.

## Sentry koppelen {#connect-sentry}

1. Open in Motir de instellingen van het project en kies _Monitoring_.
2. Kies _Sentry koppelen_. Je gaat naar Sentry.
3. Kies in Sentry je organisatie en keur de installatie goed. Sentry stuurt je terug naar Motir, dat _Sentry is gekoppeld._ toont.
4. Kies _Sentry-projecten kiezen_, selecteer de projecten waarvan de fouten dit bord moeten bereiken en bevestig. Er komt niets binnen totdat je dat doet.

Je kunt vanuit één Motir-project meerdere Sentry-projecten monitoren en later meer toevoegen met _Een gemonitord project toevoegen_.

## Instellingen {#settings}

Elk gemonitord project heeft zijn eigen instellingen:

- **Minimumniveau** — alleen fouten op dit niveau of hoger worden aangemaakt. De standaard is _Elk niveau_. Een lager niveau kiezen controleert ook eerdere fouten sinds het moment waarop het project voor het eerst werd gemonitord.
- **Oplossen in Sentry als de bug klaar is** — standaard aan. Zet dit uit om fouten in Sentry te laten zoals ze zijn wanneer hun bugs klaar zijn.
- **De verantwoordelijke overnemen uit Sentry** — standaard aan. Zet dit uit om toewijzingen in Sentry te negeren.

## Rechten waar het om vraagt {#permissions-it-asks-for}

Motir vraagt Sentry om de kleinste set rechten die deze functies nodig hebben, en niets breder:

| Sentry-scope   | Waarvoor Motir hem gebruikt                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`     | Lezen welke organisatie is gekoppeld, haar projecten opsommen zodat je kunt kiezen welke je wilt monitoren, en controleren of de koppeling nog werkt.                                                      |
| `project:read` | De projecten lezen die je hebt gekozen om te monitoren.                                                                                                                                                    |
| `event:read`   | Nieuwe fouten in de gemonitorde projecten lezen — hun titel, niveau, oorzaak, hoe vaak ze zijn opgetreden, de laatste stackframes en aan wie ze zijn toegewezen — zodat elke fout als bug kan binnenkomen. |
| `event:write`  | Een fout in Sentry als opgelost markeren wanneer zijn bug klaar is. Er wordt verder niets geschreven.                                                                                                      |

De toegang die Sentry verleent, wordt versleuteld opgeslagen en nooit aan iemand teruggetoond, ook niet aan jou.

## Wanneer de koppeling Verminderd toont {#when-the-connection-shows-degraded}

_Verminderd_ betekent dat Motir de fouten van je organisatie niet meer kan lezen, en dat er niets nieuws op het bord komt totdat het is hersteld. Naast _Sentry zegt:_ toont de pagina de reden in de eigen woorden van Sentry.

- Kies eerst _Opnieuw controleren_ — een tijdelijk probleem aan de kant van Sentry verdwijnt vanzelf.
- Blijft het verminderd, kies dan _Opnieuw koppelen_. Zegt Sentry dat de integratie al is geïnstalleerd, deïnstalleer Motir dan in de integratie-instellingen van je Sentry-organisatie en kies _Opnieuw koppelen_ opnieuw. Je gemonitorde projecten, hun instellingen en de bugs die al zijn aangemaakt blijven behouden.

## Ontkoppelen {#disconnect}

Om te stoppen met het monitoren van een Sentry-project, gebruik je _Stoppen met monitoren_ op zijn rij. Het laatste gemonitorde project verwijderen is _Sentry ontkoppelen_: dat verwijdert ook de opgeslagen toegang van Motir tot je organisatie, en om haar opnieuw te monitoren koppel je opnieuw via Sentry.

Bugs die al zijn aangemaakt, blijven als gewone werkitems op het bord staan. Door te ontkoppelen verandert er niets in Sentry. Om de toegang ook aan de kant van Sentry in te trekken, deïnstalleer je Motir in de integratie-instellingen van je Sentry-organisatie.
