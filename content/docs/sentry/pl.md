---
source: 8e83d53f1b7a
---

Połącz Sentry z projektem Motir, a błędy, które Twoje usługi już raportują, trafią na tablicę tego projektu jako elementy robocze typu Błąd — planowane, przypisywane i prowadzone do statusu Gotowe jak każda inna praca. Naprawa błędu domyka pętlę: Motir rozwiązuje za Ciebie problem w Sentry.

## Co robi {#what-it-does}

- **Każdy nowy problem staje się jednym błędem.** Motir według harmonogramu sprawdza wybrane przez Ciebie projekty Sentry. Problem, którego jeszcze nie widział, jest rejestrowany jako element roboczy typu `bug` w miejscu docelowym błędów projektu, razem ze sprawcą problemu, jego poziomem i linkiem z powrotem do Sentry.
- **Ponowne wystąpienie aktualizuje ten sam błąd.** Gdy problem wystąpi ponownie, aktualizowany jest jego istniejący błąd — nie powstaje duplikat.
- **Gotowe w Motir oznacza rozwiązane w Sentry.** Gdy błąd osiągnie status Gotowe, Motir rozwiązuje jego problem w Sentry.
- **Osoba odpowiedzialna z Sentry podąża za problemem.** Jeśli problem jest w Sentry przypisany do kogoś, kto jest członkiem obszaru roboczego Motir (dopasowanie po adresie e-mail), błąd zostaje przypisany do tej osoby.

Oba kierunki można wyłączyć osobno dla każdego monitorowanego projektu — zobacz [Ustawienia](#settings).

## Zanim zaczniesz {#before-you-start}

- W Motir potrzebujesz uprawnienia do zarządzania integracjami projektu. Bez niego strona Monitorowanie podpowiada, kogo poprosić.
- W Sentry musisz mieć prawo instalowania integracji w swojej organizacji — zwykle ma je właściciel lub menedżer.

## Połącz Sentry {#connect-sentry}

1. W Motir otwórz ustawienia projektu i wybierz _Monitorowanie_.
2. Wybierz _Połącz Sentry_. Zostaniesz przeniesiony do Sentry.
3. W Sentry wybierz swoją organizację i zatwierdź instalację. Sentry odeśle Cię z powrotem do Motir, który pokaże _Sentry jest połączone._
4. Wybierz _Wybierz projekty Sentry_, zaznacz projekty, których problemy mają trafiać na tę tablicę, i potwierdź. Dopóki tego nie zrobisz, nic nie przychodzi.

Z jednego projektu Motir możesz monitorować kilka projektów Sentry, a kolejne dodać później przez _Dodaj monitorowany projekt_.

## Ustawienia {#settings}

Każdy monitorowany projekt ma własne ustawienia:

- **Minimalny poziom** — rejestrowane są tylko problemy na tym poziomie lub wyższym. Domyślnie jest to _Każdy poziom_. Wybór niższego poziomu sprawdza też wcześniejsze problemy od pierwszego monitorowania projektu.
- **Rozwiązuj w Sentry, gdy błąd jest gotowy** — domyślnie włączone. Wyłącz, aby problemy w Sentry zostawały bez zmian, gdy ich błędy są gotowe.
- **Pobieraj osobę odpowiedzialną z Sentry** — domyślnie włączone. Wyłącz, aby ignorować przypisania wykonane w Sentry.

## O jakie uprawnienia prosi {#permissions-it-asks-for}

Motir prosi Sentry o najmniejszy zestaw uprawnień, jakiego potrzebują te funkcje, i o nic szerszego:

| Zakres Sentry  | Do czego Motir go używa                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`     | Odczytanie, która organizacja została połączona, wypisanie jej projektów, aby można było wybrać, które monitorować, i sprawdzenie, czy połączenie nadal działa.                                       |
| `project:read` | Odczytanie projektów, które wybrano do monitorowania.                                                                                                                                                 |
| `event:read`   | Odczytanie nowych problemów w monitorowanych projektach — ich tytułu, poziomu, sprawcy, liczby wystąpień, najnowszych ramek stosu i osoby, do której są przypisane — aby każdy mógł trafić jako błąd. |
| `event:write`  | Oznaczenie problemu jako rozwiązanego w Sentry, gdy jego błąd jest gotowy. Nic więcej nie jest zapisywane.                                                                                            |

Dostęp przyznany przez Sentry jest przechowywany w postaci zaszyfrowanej i nikomu nie jest pokazywany z powrotem, także Tobie.

## Gdy połączenie pokazuje Pogorszone {#when-the-connection-shows-degraded}

_Pogorszone_ oznacza, że Motir nie może już odczytywać problemów Twojej organizacji, a dopóki tego nie naprawisz, nic nowego nie trafia na tablicę. Obok _Sentry informuje:_ strona pokazuje powód, własnymi słowami Sentry.

- Najpierw wybierz _Sprawdź ponownie_ — chwilowy problem po stronie Sentry mija sam.
- Jeśli stan nie wraca do normy, wybierz _Połącz ponownie_. Jeśli Sentry mówi, że integracja jest już zainstalowana, odinstaluj Motir w ustawieniach integracji swojej organizacji w Sentry, a potem ponownie wybierz _Połącz ponownie_. Twoje monitorowane projekty, ich ustawienia i już zarejestrowane błędy zostają zachowane.

## Odłączanie {#disconnect}

Aby przestać monitorować projekt Sentry, użyj _Przestań monitorować_ w jego wierszu. Usunięcie ostatniego monitorowanego projektu to _Odłącz Sentry_: usuwa też zapisany dostęp Motir do Twojej organizacji, a aby monitorować ją ponownie, trzeba połączyć się jeszcze raz przez Sentry.

Błędy, które już zarejestrowano, zostają na tablicy jako zwykłe elementy robocze. Odłączenie niczego w Sentry nie zmienia. Aby cofnąć dostęp także po stronie Sentry, odinstaluj Motir w ustawieniach integracji swojej organizacji w Sentry.
