---
source: 46869c4914a3
---

Een taak, subtaak of bug kan een **moeilijkheidsniveau** hebben: hoeveel redeneren het werk vraagt, niet hoeveel werk het is. Storypoints en schattingen meten de omvang. Moeilijkheid zegt hoe moeilijk het is om het goed te doen, dus een wijziging van één regel aan de lockvolgorde kan `high` zijn, terwijl een grote, mechanische hernoeming `trivial` is.

Motir noemt het moeilijkheidsniveau van een werkitem in de prompt die het aan je agent geeft. Motir kiest het model niet voor je: gebruik de niveaus hieronder om te beslissen op welk model je elk werkitem draait. Epics en stories hebben geen moeilijkheidsniveau.

## De vier niveaus {#the-four-levels}

- **`trivial`** — Mechanisch werk met een ondubbelzinnige specificatie en zonder afwegingen. De wijziging wordt volledig beschreven door het werkitem. Bijvoorbeeld: een hernoeming, een tekstwijziging, een config omzetten, een versie ophogen.
- **`low`** — Routinewerk dat een patroon volgt dat de codebase al heeft. Er moet wat worden gelezen, maar het juiste antwoord is duidelijk zodra het gevonden is. Bijvoorbeeld: een nieuw veld door een bestaand formulier, een endpoint dat lijkt op zijn buren, een afgebakende bug met een duidelijke reproductie.
- **`medium`** — Werk met echte ontwerpkeuzes: meerdere bestanden of services, afwegingen om te wegen, of een specificatie die ruimte laat voor interpretatie. Bijvoorbeeld: een functie door de API en de interface heen, een refactor waarbij aanroepers moeten worden gemigreerd, een bug waarvan de oorzaak nog niet bekend is.
- **`high`** — Werk waarbij een subtiele fout duur is: gelijktijdigheid, beveiliging, datamigraties, authenticatie, of een ontwerp zonder precedent om te volgen. Bijvoorbeeld: lockvolgorde, een wijziging van het rechtenmodel, een schemamigratie op live data, een nieuw subsysteem.

Als er geen moeilijkheidsniveau is ingesteld, behandel het werkitem dan als `medium`. Een niet-ingesteld niveau betekent dat niemand het nog heeft beoordeeld, en dat is geen reden om het naar het goedkoopste model te sturen.

## Voorgestelde modellen per niveau {#models}

Elk niveau noemt zijn kandidaten op volgorde. Neem de eerste die je project mag gebruiken. De tabel toont de prijs per miljoen tokens van elk model (invoer / uitvoer), de score op twee codeerbenchmarks en wat één taak kostte op SWE-rebench. Die benchmark gebruikt verse taken waarop een model niet kan zijn getraind, dus de kosten per taak zijn het dichtste openbare cijfer bij wat één van je subtaken zal kosten.

### `trivial` · ongeveer {{value:costRangeTrivial}} per taak {#level-trivial}

{{slot:trivial}}

### `low` · ongeveer {{value:costRangeLow}} per taak {#level-low}

{{slot:low}}

### `medium` · ongeveer {{value:costRangeMedium}} per taak {#level-medium}

{{slot:medium}}

### `high` · ongeveer {{value:costRangeHigh}} en meer per taak {#level-high}

{{slot:high}}

Een kostenbedrag met ≈ is niet gemeten. Het neemt een gemeten model uit dezelfde familie en schaalt het met het verschil in tokenprijs. Een streepje betekent dat er nog geen openbare score of kosten bestaan.

## De cijfers lezen {#reading-the-numbers}

- **De twee benchmarks zijn het oneens, dus geen van beide beslist alleen.** SWE-bench Pro bestrijkt meer modellen, maar ongeveer 30% van zijn openbare taken is bekend als kapot. SWE-rebench is moeilijker te manipuleren, en het is de reden dat DeepSeek V4 Pro en GPT-5.6 Luna in `trivial` staan: beide scoren 15 tot 19 punten lager op de verse taken ervan.
- **Vergelijk de kosten per afgeronde taak, niet de prijs per token.** Een goedkoper model dat faalt en opnieuw moet worden gedraaid, kost meer dan een sterker model dat de eerste keer slaagt. GPT-5.6 Sol en Claude Sonnet 5 kosten evenveel per token, maar Sol rondde meer taken af tegen lagere kosten per taak.
- **Ga een niveau omhoog wanneer een run faalt.** Als de checks van een werkitem falen of de review wordt geweigerd, draai het dan opnieuw op het volgende niveau omhoog en niet op hetzelfde model.
- **Controleer waar je gegevens naartoe mogen.** Niet elke aanbieder kan voor elk project worden gebruikt. Zie [Modelaanbieders](/legal/model-providers) voor hoe elk van hen omgaat met de inhoud die hem wordt gestuurd.

## Hoe actueel dit is {#how-current-this-is}

De prijzen en scores op deze pagina zijn gelezen op {{value:asOf}}. De tokenprijzen komen van de modelgateway van Motir, die ze vernieuwt vanuit OpenRouter; Claude Opus 5.5 is rechtstreeks vanuit OpenRouter toegevoegd omdat het uitkwam na de laatste vernieuwing van de gateway. Modellen veranderen om de paar maanden, dus beschouw de kandidaten als een startpunt en houd de modellen die je eigen werkitems afronden.

- [SWE-bench Pro-ranglijst (BenchLM, 22 september 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [SWE-rebench-ranglijst (taken van 15 mei tot 1 juli 2026)](https://swe-rebench.com/)
