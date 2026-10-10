---
source: 656e3e6e6922
---

De openbare lees-API heeft versies. De versie van het contract staat in het veld `info.version` van het geleverde OpenAPI-document, en een wijziging die een client breekt is een versieverhoging, geen stille aanpassing.

## Wat `v1` garandeert {#the-guarantee}

Zolang `v1` leeft, verhuizen de paden niet, verandert een foutcode (`code`) niet van betekenis, verandert een bestaande voorwaarde niet van status en verandert een veld niet van type of nullability. Alles wat dat zou breken, is een `v2` en geen `v1`-release.

### Toegestaan binnen `v1`, zonder aankondiging {#allowed-inside-v1}

- Een nieuw endpoint.
- Een nieuwe OPTIONELE queryparameter.
- Een nieuw veld op een responseobject.
- Een nieuwe responseheader.
- Een nieuwe waarde voor een veld waarvan de documentatie zegt dat de lijst met waarden kan groeien.
- Een verhoogd rate-limitbudget.

### Vraagt een nieuwe major {#needs-a-new-major}

- Een veld verwijderen.
- Een veld hernoemen.
- Het type of de nullability van een veld wijzigen.
- Een foutcode (`code`) verwijderen of een andere betekenis geven.
- Een bestaande status voor een bestaande voorwaarde wijzigen.
- Een limiet aanscherpen.
- Een optionele parameter verplicht maken.

## Jouw kant van de belofte {#your-obligation}

**Een client MOET onbekende velden en onbekende waarden tolereren en MAG de zin in `error` die voor mensen is bedoeld NIET parsen.** Dit is de andere helft van de belofte, en zonder die helft houdt de garantie hierboven geen stand: een client die een veld afwijst dat hij niet kent, gaat stuk op een wijziging die deze pagina veilig noemt, en een client die `error` parset, gaat stuk op een herformuleerde zin. Vertak op `code`, negeer wat je niet kent, en elke additieve wijziging kost je niets.

## Uitfasering {#deprecation}

Een uitgefaseerde operatie of een uitgefaseerd veld is **in de specificatie** gemarkeerd met `deprecated: true` en draagt de reden en de vervanger in zijn beschrijving. De specificatie is het aankondigingskanaal, omdat het het ene artefact is dat elke client al leest — zo laat een codegenerator de uitfasering zien zonder dat iemand een blogpost gezien hoeft te hebben.

Het oude gedrag blijft werken gedurende de aangekondigde periode. Een veld verdwijnt nooit als verrassing.

## Hoe een `v2` zou verschijnen {#how-v2-arrives}

Als een TWEEDE document op een tweede pad, naast `v1` geleverd — niet als herschrijving ervan. `v1` stopt niet met werken op de dag dat `v2` uitkomt, en het uitfaseren van `v1` is zelf een aankondiging met dezelfde periode.

De `info.version` in de specificatie is de versie van het API-contract, niet het releasenummer van de app: de major is de padversie, de minor loopt op bij een additieve wijziging uit de lijst hierboven en de patch bij een correctie die alleen de documentatie raakt. Lees hem uit elke response als `X-Motir-Api-Version` — [Aan de slag](/docs/api/getting-started) laat zien waar.

Deze pagina is de gepubliceerde toezegging. Het interne document waaruit ze is geschreven, is [het beslisdocument over de API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
