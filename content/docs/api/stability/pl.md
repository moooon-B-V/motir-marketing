---
source: 656e3e6e6922
---

Publiczne API odczytu jest wersjonowane. Wersja kontraktu jest przekazywana w polu `info.version` udostępnianego dokumentu OpenAPI, a zmiana, która psuje klienta, to podniesienie wersji, a nie cicha edycja.

## Co gwarantuje `v1` {#the-guarantee}

Dopóki `v1` żyje, jego ścieżki się nie przesuwają, `code` błędu nie zmienia znaczenia, istniejący warunek nie zmienia statusu, a pole nie zmienia typu ani dopuszczalności null. Wszystko, co by to złamało, jest wydaniem `v2`, a nie `v1`.

### Dozwolone w `v1`, bez uprzedzenia {#allowed-inside-v1}

- Nowy endpoint.
- Nowy OPCJONALNY parametr zapytania.
- Nowe pole w obiekcie odpowiedzi.
- Nowy nagłówek odpowiedzi.
- Nowa wartość w polu udokumentowanym jako otwarte.
- Podniesiony budżet limitu żądań.

### Wymaga nowej wersji głównej {#needs-a-new-major}

- Usunięcie pola.
- Zmiana nazwy pola.
- Zmiana typu pola lub jego dopuszczalności null.
- Usunięcie `code` błędu lub nadanie mu nowego znaczenia.
- Zmiana istniejącego statusu dla istniejącego warunku.
- Zaostrzenie limitu.
- Uczynienie opcjonalnego parametru wymaganym.

## Twoja część obietnicy {#your-obligation}

**Klient MUSI tolerować nieznane pola i nieznane wartości oraz NIE WOLNO mu parsować ludzkiego zdania `error`.** To druga połowa obietnicy, a bez niej powyższa gwarancja nie obowiązuje: klient, który odrzuca nierozpoznane pole, zepsuje się przy zmianie, którą ta strona nazywa bezpieczną, a klient, który parsuje `error`, zepsuje się przy przeformułowanym zdaniu. Rozgałęziaj się po `code`, ignoruj to, czego nie znasz, a każda zmiana przyrostowa nic Cię nie kosztuje.

## Wycofywanie {#deprecation}

Wycofana operacja lub pole jest oznaczone `deprecated: true` **w specyfikacji** i niesie powód oraz swój zamiennik w opisie. Specyfikacja jest kanałem ogłoszeń, ponieważ to jedyny artefakt, który czyta każdy klient — więc generator kodu pokazuje wycofanie, bez konieczności, by ktokolwiek widział wpis na blogu.

Stare zachowanie działa dalej przez ogłoszone okno. Pole nigdy nie jest usuwane niespodziewanie.

## Jak pojawiłoby się `v2` {#how-v2-arrives}

Jako DRUGI dokument pod drugą ścieżką, serwowany obok `v1` — a nie jako jego przepisanie. `v1` nie przestaje działać w dniu wydania `v2`, a wycofanie `v1` jest samo ogłoszeniem w tym samym oknie.

`info.version` w specyfikacji to wersja kontraktu API, a nie numer wydania aplikacji: jej wersja główna to wersja ścieżki, wersja podrzędna rośnie przy zmianie przyrostowej z powyższej listy, a poprawka przy korekcie dotyczącej wyłącznie dokumentacji. Odczytaj ją z dowolnej odpowiedzi jako `X-Motir-Api-Version` — [Pierwsze kroki](/docs/api/getting-started) pokazują gdzie.

Ta strona jest opublikowanym zobowiązaniem. Wewnętrzny zapis, z którego powstała, to [dokument decyzji o API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
