---
source: 1c84b9f042c7
---

Publiczne API odczytu jest anonimowe — każdy endpoint odczytu zwraca dane projektu bez logowania, co sprawia, że plac projektów działa dla niezalogowanego odwiedzającego. Wszystko, co jest powiązane z kontem, wymaga tokenu. Poniżej pięć kroków, a każdy kończy się czymś, co możesz zobaczyć.

Każda ścieżka jest względna wobec hosta aplikacji, na który wskazuje ta wersja, pokazanego poniżej. Żądania są napisane względem niego, więc możesz skopiować każde w takiej postaci, w jakiej jest.

{{slot:app-host}}

## 1. Utwórz token {#mint-a-token}

Utwórz osobisty token dostępu w Ustawienia → Konto → Tokeny, wybierz obszar roboczy, do którego jest przypisany, i nadaj mu potrzebne uprawnienia — te same nazwy `resource:action`, które pokazuje ekran Role i uprawnienia. Nadaj najwęższy zestaw, który wystarcza: nadanie zawęża Twoją własną rolę i nigdy jej nie rozszerza, więc token nie zrobi czegoś, czego nie mogłaby zrobić Twoja własna rola.

**Sekret jest pokazywany RAZ, w chwili utworzenia tokenu.** Skopiuj go wtedy; nie ma sposobu, by odczytać go ponownie, a zgubiony token się zastępuje, a nie odzyskuje.

## 2. Twoje pierwsze uwierzytelnione wywołanie {#first-call}

Wykonaj najpierw to wywołanie. Odpowiada, kim jest token, do którego obszaru roboczego jest przypisany i dokładnie jakie uprawnienia niesie — więc dowiadujesz się, co może Twoje własne poświadczenie, bez sondowania endpointów i zbierania odmów.

{{slot:first-call-request}}

{{slot:first-call-response}}

Brakujący, błędnie zbudowany, nieznany, unieważniony i wygasły token zwracają ten sam `401` z tym samym komunikatem. To celowe: ich rozróżnianie zmieniłoby endpoint w wyrocznię, która odpowiada na pytanie „czy ten sekret istnieje?”.

## 3. Stronicuj kolekcję {#paginate}

Kolekcje są stronicowane kursorem. Poproś o rozmiar strony przez `limit` (domyślnie 50, a wszystko większe jest przycinane do 100, a nie odrzucane), a potem odeślij `nextCursor` z poprzedniej odpowiedzi jako `cursor`. `nextCursor` równy `null` oznacza ostatnią stronę.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

Kursor jest NIEPRZEZROCZYSTY i podpisany. Nie parsuj go, nie konstruuj własnego i nie przenoś go między kolekcjami — kursor wydany gdzie indziej to `422`, a nigdy po cichu błędna strona. Odsyłaj dokładnie to, co otrzymano.

Jedna asymetria zaskakuje ludzi, więc warto ją znać, zanim na nią trafisz: niektóre kolekcje zwracają też `totalCount`, a większość celowo tego nie robi. Tam, gdzie odczyt za kolekcją już i tak liczy go jako ograniczoną agregację, jest zwracany; w pozostałych przypadkach pole jest pomijane CAŁKOWICIE — nieobecne, nigdy `null` i nigdy `0`, więc klient zawsze odróżni „nie obiecano sumy” od „suma wynosi zero”.

## 4. Odczytaj błąd {#read-an-error}

Każda porażka zwraca to samo ciało: maszynowy `code` i ludzki `error`. Rozgałęziaj się po `code` — jest stabilny, a jego zmiana jest zmianą niezgodną wstecz. Nigdy nie parsuj `error`; to zdanie dla programisty czytającego terminal i jest dowolnie przeformułowywane.

{{slot:error-404-response}}

`404` oznacza, że zasób nie istnieje **albo** leży poza obszarem roboczym, do którego jest przypisany Twój token — celowo ta sama odpowiedź, żeby API nie dało się użyć do wyliczania danych innego najemcy. `403` to odmowa przeciwnego rodzaju: Twój token jest ważny, a jego nadanie nie ma uprawnienia wymaganego przez tę operację, i odpowiedź podaje jego klucz. `422` to żądanie, które możesz poprawić, a jego `code` mówi, która część.

**`500` to jedyna porażka BEZ `code`.** Nieoczekiwana usterka nie ma stabilnego kontraktu, więc ciało niesie komunikat i nic poza nim — nie rozgałęziaj się po nim.

## 5. Odczytaj nagłówki odpowiedzi {#rate-limits}

Budżet jest liczony na TOKEN, a nagłówki towarzyszą KAŻDEJ odpowiedzi — sukcesowi, odmowie, zmapowanemu błędowi i usterce tak samo. Nie musisz wykonywać żądania, by dowiedzieć się, na czym stoisz; poprzednie już Ci to powiedziało.

{{slot:response-headers}}

Przy `429` wstrzymaj się do `X-RateLimit-Reset` — uniksowego znacznika czasu w SEKUNDACH. Nie ma nagłówka `Retry-After`, celowo: bezwzględny moment nie może się zestarzeć w drodze, tak jak względny czas trwania.

`X-Request-Id` jest też w każdej odpowiedzi. Podaj go, jeśli kiedykolwiek zechcesz zapytać nas o konkretne wywołanie — to jedyny identyfikator, który je odnajduje.

`X-Motir-Api-Version` to wersja KONTRAKTU, który obsłużył odpowiedź — to samo `MAJOR.MINOR.PATCH` co `info.version` specyfikacji, a nie numer naszego wydania. Odczytaj go z dowolnej odpowiedzi, także z porażki, by sprawdzić rozbieżność wersji. MAJOR, którego nie rozpoznajesz, oznacza, że istnieje `/api/v2`; wyższy MINOR oznacza, że kontrakt się rozrósł, przyrostowo, a Twój klient nadal jest poprawny. Jeśli blok powyżej pokazuje symbol zastępczy zamiast wersji, specyfikacja była niedostępna, gdy strona była renderowana, a [Dokumentacja API](/docs/api) odczytuje bieżącą wersję prosto z dokumentu.

## Co dalej {#what-next}

[Dokumentacja API](/docs/api) wymienia każdą operację z jej parametrami, treścią i statusami. [Stabilność i wycofywanie](/docs/api/stability) to to, czego kontrakt obiecuje Ci nie robić. Jeśli podłączasz agenta, a nie piszesz klienta, drugą połową jest [Serwer MCP](/docs/mcp).
