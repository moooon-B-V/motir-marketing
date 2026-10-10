---
source: 46869c4914a3
---

Zadanie, podzadanie lub błąd może mieć **trudność**: ile rozumowania wymaga praca, a nie ile jej jest. Punkty historii i oszacowania mierzą rozmiar. Trudność mówi, jak trudno zrobić to dobrze, więc zmiana jednej linii w kolejności blokad może być `high`, a duża, mechaniczna zmiana nazwy — `trivial`.

Motir podaje trudność elementu roboczego w prompcie, który przekazuje Twojemu agentowi. Motir nie wybiera za Ciebie modelu: użyj poniższych poziomów, by zdecydować, na którym modelu uruchomić każdy element roboczy. Epiki i historie nie mają trudności.

## Cztery poziomy {#the-four-levels}

- **`trivial`** — Praca mechaniczna, z jednoznaczną specyfikacją i bez decyzji wymagających osądu. Zmiana jest w pełni opisana przez element roboczy. Na przykład: zmiana nazwy, zmiana tekstu, przełączenie konfiguracji, podniesienie wersji.
- **`low`** — Praca rutynowa, zgodna ze wzorcem, który baza kodu już ma. Trzeba trochę poczytać, ale gdy odpowiedź zostanie znaleziona, jest jasna. Na przykład: nowe pole w istniejącym formularzu, endpoint zbudowany jak sąsiednie, ograniczony błąd z jasnym sposobem odtworzenia.
- **`medium`** — Praca z prawdziwymi wyborami projektowymi: kilka plików lub usług, kompromisy do rozważenia albo specyfikacja, która zostawia miejsce na interpretację. Na przykład: funkcja obejmująca API i interfejs, refaktoryzacja z wywołującymi do zmigrowania, błąd o jeszcze nieznanej przyczynie.
- **`high`** — Praca, w której subtelny błąd jest kosztowny: współbieżność, bezpieczeństwo, migracje danych, uwierzytelnianie albo projekt bez precedensu, na którym można się wzorować. Na przykład: kolejność blokad, zmiana modelu uprawnień, migracja schematu na żywych danych, nowy podsystem.

Gdy trudność nie jest ustawiona, traktuj element roboczy jako `medium`. Nieustawiony poziom oznacza, że nikt jeszcze go nie ocenił, a to nie powód, by wysyłać go do najtańszego modelu.

## Sugerowane modele dla każdego poziomu {#models}

Każdy poziom wymienia swoich kandydatów w kolejności. Weź pierwszego, którego Twój projekt może używać. Tabela pokazuje cenę każdego modelu za milion tokenów (wejście / wyjście), jego wynik w dwóch testach kodowania i to, ile kosztowało jedno zadanie w SWE-rebench. Ten test używa świeżych zadań, na których model nie mógł się uczyć, więc jego koszt na zadanie jest najbliższą publiczną liczbą do tego, ile będzie kosztować jedno z Twoich podzadań.

### `trivial` · około {{value:costRangeTrivial}} za zadanie {#level-trivial}

{{slot:trivial}}

### `low` · około {{value:costRangeLow}} za zadanie {#level-low}

{{slot:low}}

### `medium` · około {{value:costRangeMedium}} za zadanie {#level-medium}

{{slot:medium}}

### `high` · około {{value:costRangeHigh}} i więcej za zadanie {#level-high}

{{slot:high}}

Koszt oznaczony ≈ nie został zmierzony. Bierze zmierzony model z tej samej rodziny i skaluje go o różnicę w cenie tokenów. Kreska oznacza, że publiczny wynik lub koszt jeszcze nie istnieje.

## Jak czytać liczby {#reading-the-numbers}

- **Dwa testy się nie zgadzają, więc żaden nie rozstrzyga sam.** SWE-bench Pro obejmuje więcej modeli, ale wiadomo, że około 30% jego publicznych zadań jest zepsutych. SWE-rebench trudniej oszukać i to dlatego DeepSeek V4 Pro i GPT-5.6 Luna są w `trivial`: oba mają na jego świeżych zadaniach wyniki niższe o 15 do 19 punktów.
- **Porównuj koszt ukończonego zadania, a nie cenę za token.** Tańszy model, który zawodzi i trzeba go uruchomić ponownie, kosztuje więcej niż mocniejszy, który odnosi sukces za pierwszym razem. GPT-5.6 Sol i Claude Sonnet 5 kosztują tyle samo za token, ale Sol ukończył więcej zadań przy niższym koszcie na zadanie.
- **Przejdź o jeden poziom wyżej, gdy uruchomienie zawiedzie.** Jeśli testy elementu roboczego zawiodą albo jego recenzja zostanie odrzucona, uruchom go ponownie na następnym poziomie wyżej, a nie na tym samym modelu.
- **Sprawdź, dokąd mogą trafić Twoje dane.** Nie każdego dostawcy można używać w każdym projekcie. Zobacz [Dostawcy modeli](/legal/model-providers) — opisuje, jak każdy z nich traktuje przesyłane mu treści.

## Jak aktualne to jest {#how-current-this-is}

Ceny i wyniki na tej stronie odczytano: {{value:asOf}}. Ceny tokenów pochodzą z bramki modeli Motir, która odświeża je z OpenRouter; Claude Opus 5.5 dodano bezpośrednio z OpenRouter, ponieważ pojawił się po ostatnim odświeżeniu bramki. Modele zmieniają się co kilka miesięcy, więc traktuj kandydatów jako punkt wyjścia i zostaw tych, którzy kończą Twoje własne elementy robocze.

- [Ranking SWE-bench Pro (BenchLM, 22 września 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [Ranking SWE-rebench (zadania od 15 maja do 1 lipca 2026)](https://swe-rebench.com/)
