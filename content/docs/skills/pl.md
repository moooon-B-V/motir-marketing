---
source: 38ac3b50e511
---

Umiejętności Motir pozwalają agentowi, którego już używasz, pracować nad Twoim projektem Motir. Powiedz `motir run`, a weźmie następny gotowy element roboczy, zbuduje go i otworzy powiązany pull request. Powiedz `motir log bug`, a sprawdzi usterkę i zarejestruje ją tam, gdzie jej miejsce. Powiedz `motir mark`, a zamknie ręczny element roboczy, gdy już go wykonasz. Powiedz `motir guide`, a przeprowadzi Cię przez ręczny element roboczy krok po kroku.

To zwykłe [Agent Skills](https://agentskills.io): jeden folder na umiejętność, każdy z plikiem `SKILL.md`, opublikowane w repozytorium [{{value:skillsRepo}}]({{value:repoUrl}}). Każde polecenie na tej stronie instaluje wydanie [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Zanim zaczniesz {#before}

Umiejętności komunikują się z Motir przez jego serwer MCP. W Claude Code łączy go za Ciebie plugin: logujesz się kontem Motir w przeglądarce i nie ma żadnego tokenu. Każdy inny agent wymaga wcześniej podłączonego tego serwera — potrzebny jest projekt Motir, osobisty token dostępu i konfiguracja Twojego agenta z przewodnika [{{value:mcpPage}}](/docs/mcp), który opisuje też drogę z tokenem w Claude Code, jeśli nie możesz użyć logowania w przeglądarce. Token z domyślnymi uprawnieniami może wszystko, co robią te umiejętności. Potrzebujesz też `git` oraz GitHub CLI (`gh`) dla umiejętności, które otwierają lub czytają pull requesty.

## Instalacja {#install}

Wybierz swojego agenta. Każda sekcja instaluje wszystkie umiejętności z wydania, dla każdego projektu na Twoim komputerze. Polecenia terminala są dla systemów macOS i Linux: pobierają wydanie, kopiują foldery umiejętności do folderu, z którego czyta ten agent, i usuwają pobrany plik.

### Claude Code {#claude-code}

Repozytorium jest też marketplace’em pluginów Claude Code. Dodaj je w tagu wydania, a potem zainstaluj plugin. Jedna instalacja przynosi umiejętności, serwer Motir MCP i program uruchamiający jego CLI oraz łączy Motir bez tokenu.

- **Siedem umiejętności.** Każda umiejętność z wydania, wymieniona pod nazwą pluginu.
- **Serwer Motir MCP.** Claude Code loguje się do niego w przeglądarce przy pierwszym użyciu: uruchom `/mcp`, wybierz `motir` i wybierz _Authenticate_, potem wskaż obszar roboczy i zatwierdź na ekranie zgody Motir. Nie ma tokenu do utworzenia ani wklejenia. [Dodaj Motir do Claude](/docs/mcp#claude)
- **Program uruchamiający `motir`.** Uruchamia przypięte Motir CLI przez `npx`, więc nic nie jest instalowane globalnie. Wymaga Node.js 22 lub nowszego, a CLI loguje się samodzielnie przez `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Aby to sprawdzić: `/plugin` pokazuje `motir` w wersji `{{value:releaseVersion}}`, a `/mcp` wymienia `motir`. Umiejętności pluginu są wymienione pod jego nazwą, na przykład `/motir:motir-run`. Skopiowanie umiejętności przynosi same umiejętności — serwer MCP podłącz samodzielnie, tak jak inni agenci. Aby zainstalować je tylko dla jednego repozytorium, skopiuj je zamiast tego do `.claude/skills` w tym repozytorium. · [Dokumentacja Claude Code]({{value:claudeCodeDocsUrl}}) · sprawdzono: {{value:checkedOn}}

### Codex {#codex}

Codex czyta umiejętności z `.agents/skills` — w folderze domowym dla każdego repozytorium albo w repozytorium tylko dla niego.

{{slot:codex}}

Codex sam zauważa nowe umiejętności. Jeśli się nie pojawią, uruchom go ponownie. · [Dokumentacja Codex]({{value:codexDocsUrl}}) · sprawdzono: {{value:checkedOn}}

### Cursor {#cursor}

Cursor czyta umiejętności z `~/.cursor/skills` dla każdego projektu oraz z `.cursor/skills` w projekcie.

{{slot:cursor}}

Cursor czyta też `~/.agents/skills` i `~/.claude/skills`, więc umiejętności skopiowane już dla Codex lub Claude Code są odbierane bez drugiej kopii. · [Dokumentacja Cursor]({{value:cursorDocsUrl}}) · sprawdzono: {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI czyta Twoje własne umiejętności z `~/.gemini/skills`, a umiejętności obszaru roboczego z `.gemini/skills`.

{{slot:gemini-cli}}

Uruchom `gemini skills list`, aby sprawdzić, czy zostały znalezione. Gemini CLI czyta też `~/.agents/skills`. · [Dokumentacja Gemini CLI]({{value:geminiCliDocsUrl}}) · sprawdzono: {{value:checkedOn}}

### GitHub Copilot w VS Code {#copilot-vs-code}

Copilot w VS Code czyta Twoje osobiste umiejętności z `~/.copilot/skills`, a umiejętności projektu z `.github/skills`.

{{slot:copilot-vs-code}}

Czyta też `~/.claude/skills` i `~/.agents/skills`. Żadne ustawienie nie wymaga włączenia dla tych folderów. · [Dokumentacja GitHub Copilot w VS Code]({{value:copilotDocsUrl}}) · sprawdzono: {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode czyta Twoje własne umiejętności z `~/.config/opencode/skills`, a umiejętności projektu z `.opencode/skills`.

{{slot:opencode}}

Czyta też `~/.claude/skills` i `~/.agents/skills`. Uruchom `opencode debug skill`, aby zobaczyć, co znalazł. · [Dokumentacja OpenCode]({{value:opencodeDocsUrl}}) · sprawdzono: {{value:checkedOn}}

Potem zapytaj swojego agenta, jakie ma umiejętności. Na liście powinny być: {{value:releaseSkills}}. Inny agent, który czyta umiejętności `SKILL.md`, działa tak samo: skopiuj foldery umiejętności do folderu, z którego czyta on umiejętności.

## Użycie {#use}

Wpisz do swojego agenta to, co jest pod **Powiedz**. Zamień `ACME-12` na klucz elementu roboczego w Twoim własnym projekcie.

### `motir-run` {#motir-run}

**Powiedz**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Co się dzieje**

Bierze następny gotowy element roboczy w Twoim projekcie albo ten, który wskażesz, i go buduje. Najpierw porządkuje po wcześniejszych uruchomieniach, których pull requesty zostały scalone, potem przejmuje element roboczy, buduje go na osobnej gałęzi, otwiera jeden pull request i łączy go z elementem roboczym. Wskaż historię, której elementy podrzędne nie mają własnych elementów podrzędnych, a uruchomi całą historię: jedna gałąź i jeden pull request na repozytorium, z jednym commitem na element podrzędny. `motir next` kończy po przejęciu i wypisuje prompt, który przekażesz agentowi samodzielnie. Jedynym wyjątkiem jest element roboczy będący decyzją: zapisuje stronę decyzji i publikuje ją do Twojego zatwierdzenia, bez gałęzi i bez pull requesta.

**Co widzisz w Motir**

Element roboczy jest przypisany do Ciebie i przechodzi do statusu W toku, a po otwarciu pull requesta do Zaimplementowane. Jego strona pokazuje pull request i sekcję Jak testować. Motir przenosi go do W przeglądzie, gdy CI przejdzie, i do Gotowe, gdy pull request zostanie scalony; umiejętność nigdy nie robi żadnego z tych dwóch kroków.

### `motir-fix` {#motir-fix}

**Powiedz**

- `motir fix ACME-12`

**Co się dzieje**

Naprawia czerwony pull request po zakończeniu uruchomienia, które go otworzyło: jego testy zawiodły, kolejka scalania go odrzuciła albo recenzent odesłał wideo akceptacyjne historii z poleceniem Uruchom ponownie. Najpierw przejmuje naprawę, żeby nikt inny nie nadpisał jej pushem. Potem naprawia każdy pull request elementu roboczego na gałęzi, którą już ma, nigdy na nowej: scala gałąź bazową, naprawia to, co wskazał nieudany test, i wypycha zmiany. Działa, dopóki CI nie zazieleni się albo dopóki nie spróbuje pięć razy, a gdy po Uruchom ponownie CI jest zielone, nagrywa wideo akceptacyjne jeszcze raz. Nigdy nie otwiera pull requesta, nie scala go ani nie zmienia statusu elementu roboczego. To nie to samo co `motir fix bugs`, które przechodzi przez folder Błędy Twojego projektu: `motir fix ACME-12` naprawia pull requesty jednego wskazanego elementu roboczego.

**Co widzisz w Motir**

Gdy naprawa trwa, sekcja Rozwój elementu roboczego mówi, że jest naprawiany, i przez kogo. Te same pull requesty dostają nowe commity, a Motir sam przesuwa element roboczy dalej, gdy ich testy przejdą. Jeśli naprawa się podda, element roboczy mówi o tym i podaje liczbę podjętych prób.

### `motir-continue` {#motir-continue}

**Powiedz**

- `motir continue ACME-12`

**Co się dzieje**

Kontynuuje element roboczy, którego uruchomienie przerwało się w połowie: zamknięto laptopa, utracono piaskownicę albo zabito proces. Element roboczy nadal jest W toku, a jego praca jest na gałęzi, którą zostawiło to uruchomienie. Najpierw przejmuje kontynuację, żeby nikt inny nie pracował na tej samej gałęzi. Potem wyciąga tę gałąź w każdym repozytorium, które obejmuje element roboczy, nigdy nowej i nigdy nie resetując tego, co już tam jest, i prowadzi pracę dalej od miejsca, w którym stanęła. Dostarcza tak, jak świeże uruchomienie: jeden pull request na repozytorium, powiązany z elementem roboczym. Gdy element roboczy ma już pull request, który jest czerwony, użyj zamiast tego `motir fix ACME-12`, a dla elementu roboczego, którego nikt nie zaczął, `motir run ACME-12`.

**Co widzisz w Motir**

Element roboczy, którego uruchomienie przerwano, pokazuje w sekcji Rozwój napis Uruchomienie przerwane wraz z poleceniem `motir continue` do skopiowania. Gdy kontynuacja trwa, ta sekcja mówi, że jest kontynuowana, i przez kogo. Po jej zakończeniu element roboczy przechodzi dalej dokładnie jak po `motir run`: do Zaimplementowane, z powiązanymi pull requestami i sekcją Jak testować.

### `motir-log-bug` {#motir-log-bug}

**Powiedz**

- `motir log bug the export button does nothing on an empty board`

**Co się dzieje**

Traktuje wpisany przez Ciebie tekst jako twierdzenie do sprawdzenia. Najpierw znajduje przyczynę w kodzie, szuka elementu roboczego, który ktoś już założył, i nic nie zakłada, jeśli okaże się, że zachowanie jest poprawne. W przeciwnym razie zakłada jeden błąd: pod historią, którą wstrzymuje, albo w folderze Błędy Twojego projektu, gdy nic nie wstrzymuje.

**Co widzisz w Motir**

Nowy element roboczy typu Błąd z przyczyną, miejscem w kodzie i sposobem odtworzenia, powiązany z elementem roboczym, na którym go znaleziono. Jeśli blokuje element roboczy, który uruchamiasz, ten element roboczy przechodzi do Zablokowane.

### `motir-mark` {#motir-mark}

**Powiedz**

- `motir mark ACME-12 done`

**Co się dzieje**

Zamyka element roboczy, którego nie może zamknąć żaden pull request: ręczny, taki jak założenie konta, ustawienie sekretu czy zmiana ustawienia. Powiedzenie tego jest Twoim potwierdzeniem, że praca jest skończona. Odmawia dla elementu roboczego, który ma pull request, ponieważ zamyka go scalenie tego pull requesta.

**Co widzisz w Motir**

Element roboczy przechodzi do Gotowe, z komentarzem zapisującym Twoje potwierdzenie. Status jego elementu nadrzędnego wynika ze statusów jego elementów podrzędnych.

### `motir-guide` {#motir-guide}

**Powiedz**

- `motir guide ACME-12`
- `motir guide`

**Co się dzieje**

Prowadzi Cię przez ręczny element roboczy krok po kroku. Wskaż jeden albo powiedz samo `motir guide`, a weźmie Twój własny niedokończony, a w przeciwnym razie następny gotowy ręczny element roboczy. Podaje jeden krok, z jego instrukcją i poleceniem do skopiowania, i czeka. Powiedz, że gotowe, a sprawdzi to, co może, niczego nie zmieniając, na przykład pobierze adres albo uruchomi polecenie tylko do odczytu, i powie Ci, co zobaczył. Krok, którego sprawdzenie się nie powiedzie, nie jest odhaczany; dostajesz ten sam krok jeszcze raz. Możesz zatrzymać się na dowolnym kroku, a `motir guide` podejmie od miejsca, w którym skończono. Jeśli element roboczy nie ma jeszcze kroków, proponuje je na podstawie opisu i pyta Cię, zanim zapisze je na elemencie roboczym. Jeśli krok okaże się błędny, proponuje poprawkę i zmienia krok albo tekst elementu roboczego tylko wtedy, gdy się zgodzisz.

**Co widzisz w Motir**

Element roboczy jest przypisany do Ciebie i przechodzi do statusu W toku. Jego Lista zadań do wykonania odhacza każdy krok, gdy go skończysz, z informacją, kto to zrobił. Gdy ostatni krok zostanie odhaczony, element roboczy przechodzi do Gotowe, z komentarzem podsumowującym każdy krok i sposób jego potwierdzenia.

### `motir-fix-bugs` {#motir-fix-bugs}

**Powiedz**

- `motir fix bugs`
- `motir fix bugs 3`

**Co się dzieje**

Przechodzi przez błędy w folderze Błędy Twojego projektu, które są jeszcze Do zrobienia, po jednym, od najstarszego. Błędy w folderach wewnątrz Błędów są pomijane. Dla każdego najpierw sprawdza, czy błąd jest prawdziwy na Twojej domyślnej gałęzi, a potem nadaje mu dokładnie jeden wynik. Błąd, który potrafi naprawić, dostaje jeden pull request naprawiający ten błąd i nic więcej. Błąd, który czeka na inny, jeszcze nieskończony element roboczy, zostaje z nim powiązany i przeniesiony pod tę samą historię. Błąd, którego tu nie potrafi naprawić, dostaje komentarz i zostaje odłożony: już naprawiony, z informacją, co go naprawiło; nie da się odtworzyć, z informacją, co uruchomiono; albo wymaga Twojej decyzji, z pytaniem i rekomendacją. Każdy wynik zabiera błąd z Do zrobienia, więc uruchomienie kończy się samo. Dodaj liczbę, a zatrzyma się po tylu błędach. Kończy raportem, który na początku wymienia błędy czekające na Ciebie.

**Co widzisz w Motir**

Naprawiony błąd przechodzi do Zaimplementowane z powiązanym pull requestem, a do Gotowe, gdy go scalisz. Błąd czekający na inną pracę przechodzi do Zablokowane, z linkiem „zablokowane przez” do tego elementu roboczego. Błąd już naprawiony przechodzi do Gotowe. Taki, którego nie da się odtworzyć, albo wymagający Twojej decyzji, przechodzi do Zablokowane. Każdy z nich ma komentarz z dowodem albo pytaniem. Odpowiedz na pytanie i przenieś błąd z powrotem do Do zrobienia, a następne uruchomienie go podejmie.

## Gdy element roboczy jest błędny {#wrong}

Czasem element roboczy nie może zostać zbudowany tak, jak jest napisany. Może wymagać czegoś, co nie istnieje, potrzebować projektu, którego nikt nie narysował, albo sięgać do dwóch repozytoriów. `motir-run` nie zgaduje, jak to obejść. Przenosi element roboczy do statusu **Planowanie**, żeby żadne inne uruchomienie go nie podjęło, i prosi Planera Motir AI o zaplanowanie poprawki. Potem się zatrzymuje. Plan czeka na Twoją recenzję i zatwierdzenie w Motir, a dopóki tego nie zrobisz, nic nie jest budowane.

Jeśli Twój token nie może używać planowania AI albo skończyły się Twoje kredyty AI, i tak się zatrzymuje. Zostawia na elemencie roboczym komentarz z całą poprawką i wyjaśnia, dlaczego nie mógł jej przekazać.

## Aktualizacja {#updating}

Nowe wydanie ma nowy tag, a ta strona przechodzi na niego. W przypadku instalacji przez kopiowanie uruchom ponownie krok instalacji swojego agenta: nadpisuje on foldery umiejętności na miejscu. W Claude Code marketplace’u nie można dodać ponownie pod innym tagiem, więc usuń go, dodaj w nowym tagu i zainstaluj plugin jeszcze raz:

{{slot:update}}

Uruchom agenta ponownie po wszystkim, żeby odczytał nowe wersje.
