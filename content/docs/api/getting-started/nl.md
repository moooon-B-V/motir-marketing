---
source: 1c84b9f042c7
---

De openbare lees-API is anoniem — elk lees-endpoint geeft projectgegevens terug zonder dat je inlogt, en dat is wat het projectplein laat werken voor een bezoeker die niet is ingelogd. Alles wat aan een account is gebonden, vraagt een token. Hieronder staan vijf stappen, en elke stap eindigt met iets wat je kunt zien gebeuren.

Elk pad is relatief aan de applicatiehost waarop deze build wijst, hieronder getoond. De requests zijn ertegen geschreven, dus je kunt er een kopiëren zoals hij er staat.

{{slot:app-host}}

## 1. Maak een token aan {#mint-a-token}

Maak een persoonlijk toegangstoken aan bij Instellingen → Account → Tokens, kies de werkruimte waaraan het is gebonden en geef het de rechten die het nodig heeft — dezelfde `resource:action`-namen die het scherm Rollen en rechten toont. Geef de kleinst mogelijke set die het werk doet: een toekenning beperkt je eigen rol en verruimt die nooit, dus een token kan niets wat jij niet zou kunnen.

**Het geheim wordt EENMAAL getoond, op het moment dat het token wordt aangemaakt.** Kopieer het dan; je kunt het daarna niet meer lezen, en een kwijtgeraakt token wordt vervangen en niet hersteld.

## 2. Je eerste geauthenticeerde aanroep {#first-call}

Doe deze aanroep als eerste. Hij antwoordt wie het token is, aan welke werkruimte het is gebonden en precies welke rechten het draagt — zo weet je wat je eigen inloggegevens mogen zonder endpoints uit te proberen en weigeringen te verzamelen.

{{slot:first-call-request}}

{{slot:first-call-response}}

Een ontbrekend, onjuist opgemaakt, onbekend, ingetrokken of verlopen token geeft telkens dezelfde `401` met dezelfde boodschap. Dat is bewust: ze uit elkaar houden zou van het endpoint een orakel maken dat de vraag ‘bestaat dit geheim?’ beantwoordt.

## 3. Blader door een collectie {#paginate}

Collecties worden per cursor gepagineerd. Vraag met `limit` om een paginagrootte (de standaard is 50 en alles wat groter is wordt teruggebracht tot 100, niet geweigerd) en stuur dan de `nextCursor` uit de vorige response terug als `cursor`. Een `nextCursor` van `null` is de laatste pagina.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

De cursor is ONDOORZICHTIG en ondertekend. Parse hem niet, maak er geen zelf en neem er geen mee van de ene collectie naar de andere — een cursor die ergens anders is uitgegeven, geeft een `422` en nooit stilzwijgend een verkeerde pagina. Stuur precies terug wat je hebt gekregen.

Eén asymmetrie verrast mensen, dus het is goed om hem te kennen voordat je hem tegenkomt: sommige collecties melden ook een `totalCount` en de meeste doen dat bewust niet. Waar de lezing achter een collectie al een begrensde aggregatie berekent, wordt die gemeld; elders ontbreekt het veld GEHEEL — afwezig, nooit `null` en nooit `0`, zodat een client altijd kan zien of er ‘geen totaal beloofd is’ of dat ‘het totaal nul is’.

## 4. Lees een fout {#read-an-error}

Elke fout geeft dezelfde body terug: een machinegelezen `code` en een voor mensen bedoelde `error`. Vertak op `code` — hij is stabiel, en hem wijzigen is een brekende wijziging. Parse `error` nooit; het is een zin voor een ontwikkelaar die naar een terminal kijkt en hij wordt zonder waarschuwing herformuleerd.

{{slot:error-404-response}}

Een `404` betekent dat de resource niet bestaat **of** buiten de werkruimte valt waaraan je token is gebonden — bewust hetzelfde antwoord, zodat de API niet kan worden gebruikt om de gegevens van een andere tenant op te sporen. Een `403` is de andere soort weigering: je token is geldig en zijn toekenning mist het recht dat deze operatie vereist, en de response noemt de sleutel. Een `422` is een request dat je kunt herstellen, en zijn `code` zegt welk deel.

**Een `500` is de enige fout ZONDER `code`.** Een onverwachte storing heeft geen stabiel contract, dus de body bevat een boodschap en verder niets — vertak er niet op.

## 5. Lees de responseheaders {#rate-limits}

Het budget geldt per TOKEN, en de headers zitten in ELKE response — een succes, een weigering, een toegewezen fout en een storing. Je hoeft nooit een request te doen om te weten waar je staat; het laatste heeft het al verteld.

{{slot:response-headers}}

Wacht bij een `429` tot `X-RateLimit-Reset` — een Unix-timestamp in SECONDEN. Er is bewust geen `Retry-After`-header: een absoluut tijdstip kan onderweg niet verouderen zoals een relatieve duur dat kan.

`X-Request-Id` staat ook in elke response. Noem hem als je ons ooit over een bepaalde aanroep wilt vragen — het is de ene identifier waarmee hij te vinden is.

`X-Motir-Api-Version` is de versie van het CONTRACT dat de response heeft geleverd — dezelfde `MAJOR.MINOR.PATCH` als de `info.version` van de specificatie, niet ons releasenummer. Lees hem uit elke response, ook uit een fout, om versieverschil te controleren. Een MAJOR die je niet herkent, betekent dat er een `/api/v2` bestaat; een hogere MINOR betekent dat het contract additief is gegroeid en je client nog steeds klopt. Als het blok hierboven een plaatshouder toont in plaats van een versie, was de specificatie niet bereikbaar toen deze pagina werd opgebouwd, en leest [API-referentie](/docs/api) de actuele versie rechtstreeks uit het document.

## Wat nu {#what-next}

[API-referentie](/docs/api) somt elke operatie op met zijn parameters, zijn body en zijn statussen. [Stabiliteit en uitfasering](/docs/api/stability) is wat het contract belooft je niet aan te doen. Als je een agent aansluit in plaats van een client te schrijven, is de [MCP-server](/docs/mcp) de andere helft.
