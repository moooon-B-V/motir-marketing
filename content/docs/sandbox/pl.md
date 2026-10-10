---
source: cdc9936762b4
---

Piaskownica to kontener uruchamiany na Twoim własnym komputerze, w którym są Twój własny agent, Motir CLI i Twoje checkouty — i nic więcej. Przynosisz własne poświadczenie agenta, zamontowane tylko do odczytu; pętla działa w środku, więc agent, który zachowuje się źle, sięga do Twojego drzewa roboczego, a nie do reszty komputera.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Zanim zaczniesz {#before-you-start}

- **Docker, uruchomiony.** Zbudowany dla `linux/amd64` **oraz** `linux/arm64`, więc Apple Silicon jest pełnoprawnym komputerem i nic nie jest emulowane. Nie ma kroku budowania — pobierasz obraz.
- **Logowanie własnego agenta, na tym komputerze.** Jego montowanie poświadczeń jest tylko do odczytu, więc kontener może użyć logowania, ale nie może go odnowić. Wyjątkiem, na który trafisz, jest Claude Code w systemie macOS: trzyma token w pęku kluczy logowania, więc nie ma pliku do zamontowania, a logujesz się do `claude` **wewnątrz** kontenera — obraz daje mu katalog konfiguracji z możliwością zapisu i tam trafia logowanie. (Antigravity jest takie samo — krok 2 mówi o tym, gdy go wybierzesz.)
- **Katalog główny obszaru roboczego — folder, który ZAWIERA Twoje checkouty.** Projekt zwykle obejmuje kilka repozytoriów, a pętla działa we wszystkich.

{{slot:workspace}}

{{part:picker-label}}

Z którego agenta korzystasz?

{{part:picker-also-supported}}

obsługiwani także

{{part:picker-or}}

lub

{{part:picker-base}}

bez agenta (baza)

{{part:picker-summary}}

Każde poniższe polecenie dotyczy profilu **{{value:profileLabel}}**. Przełączenie przepisuje tag i montowanie poświadczeń w **krokach 1, 2 i 2b** — trzech miejscach, w których występują.

{{part:chip-command}}

Polecenie

{{part:chip-editor}}

W edytorze

{{part:steps-intro}}

## Konfiguracja {#set-it-up}

Pięć kroków. W każdym robisz jedną rzecz.

{{part:step-1-intent}}

Pobierz obraz dla swojego agenta

{{part:step-1-body}}

Nie ma kroku budowania — obraz jest publikowany dla każdego profilu agenta.

{{part:step-2-intent}}

Uruchom kontener z katalogu głównego obszaru roboczego

{{part:step-2-body}}

Uruchom go z folderu, który **zawiera** Twoje checkouty, a nie z żadnego z nich.

{{part:step-2-vscode}}

**Wolisz VS Code?** Poniższe kroki 2a–2c zastępują ten krok. Wszystko po nim jest takie samo w obu przypadkach.

{{part:step-2a-intent}}

Zainstaluj rozszerzenie Dev Containers

{{part:step-2a-body}}

Z widoku rozszerzeń albo z palety poleceń — ⇧⌘P w systemie macOS, Ctrl+Shift+P gdzie indziej, F1 wszędzie — a potem _Extensions: Install Extensions_. Dwa z tych trzech kroków wykonujesz w palecie, więc warto ją teraz przypiąć.

{{part:step-2b-intent}}

Utwórz konfigurację dev containera

{{part:step-2b-body}}

Uruchom to w folderze, który montujesz. Jedno wklejenie: tworzy folder `.devcontainer` i zapisuje w nim plik. Nie próbuj tworzyć ich z okna wyboru plików — Finder i większość graficznych okien wyboru odrzuca nazwę zaczynającą się od kropki, i robi to bez wyjaśnienia.

{{part:step-2b-warning}}

**Dev container zachowuje obraz, z którego został utworzony.** `--pull=always` należy do polecenia uruchomienia w kroku 2, a nie do tej drogi. Aby przejść na bieżący obraz i CLI `motir`: **1.** uruchom `{{value:dockerPull}}` z kroku 1 w terminalu na swoim komputerze; **2.** wybierz _Dev Containers: Open Folder in Container…_ dla tego folderu, co dołącza okno; **3.** wybierz _Dev Containers: Rebuild Container_, co odtwarza kontener z właśnie pobranego obrazu. Rebuild Container pojawia się tylko w oknie dołączonym do kontenera, dlatego krok 2 jest pierwszy. Przebudowanie zachowuje logowanie do Motir (leży na woluminie `{{value:authVolume}}`), ale nie logowanie do Claude Code wykonane wewnątrz kontenera — uruchom `claude` i zaloguj się ponownie.

{{part:step-2c-intent}}

Otwórz folder w kontenerze

{{part:step-2c-body}}

Paleta poleceń → _Dev Containers: Open Folder in Container…_ i wybierz folder, do którego zapisano plik. Jego terminal to ta sama powłoka, w której znalazłbyś się po kroku 2 — kontynuuj od kroku 3.

{{part:step-3-intent}}

Zaloguj się wewnątrz kontenera

{{part:step-3-body}}

Wypisywane są kod i adres URL; zatwierdź go w dowolnej przeglądarce. Logowanie trafia na wolumin `{{value:authVolume}}`, więc robisz to raz.

{{part:step-4-intent}}

Powiąż folder ze swoim projektem

{{part:step-4-body}}

Zamień `ACME` na klucz swojego projektu. Jeśli Twój obszar roboczy ma dokładnie jeden projekt, pomiń flagę — to cały krok.

{{part:step-5-intent}}

Sprawdź — wszystko na zielono kończy tę stronę

{{part:step-5-body}}

Uwierzytelnianie, powiązanie, plik binarny agenta i jego poświadczenie. To jedyna rzecz, która mówi, że kontener faktycznie dostał to, co mu przekazano.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode trzyma konfigurację i poświadczenia w dwóch miejscach, więc wymaga dwóch linii `-v`. Potrzebne są obie.

{{part:note-antigravity}}

Antigravity trzyma token w systemowym pęku kluczy, który nie ma przenośnego pliku do zamontowania — więc nie ma dla niego linii `-v`, a logujesz się WEWNĄTRZ kontenera, a nie przed jego uruchomieniem. To jedyny profil, którego nie dotyczy drugi warunek wstępny powyżej.

{{part:note-aider}}

Poświadczeniem Aider jest klucz API modelu, który odczytuje ze środowiska, więc to jedyny profil, który dodaje linię `-e`. Montowany jest PLIK, który musi istnieć — choćby pusty — inaczej docker utworzy w jego miejscu katalog.

{{part:note-base}}

Obraz bazowy zawiera Motir CLI i w ogóle żadnego agenta — nie ma niczego do zamontowania ani niczego, do czego trzeba się zalogować poza samym Motir.

{{part:devcontainer-file}}

### Plik, który zapisuje to polecenie {#devcontainer-file}

To materiał referencyjny, a nie krok — 2b już go zapisał. Jest tu dla czytelnika, który woli utworzyć plik ręcznie, i dlatego, że cudzysłowy wokół `<<’JSON’` mają znaczenie: powstrzymują Twoją powłokę przed rozwinięciem `${localWorkspaceFolder}` i `${localEnv:HOME}`, zanim trafią do pliku. To podstawienia Dev Containers i rozwiązuje je edytor.

{{part:why}}

## Dlaczego tak to wygląda {#why}

### Co zmienia wybór profilu {#profile-picker}

Wybór agenta przepisuje trzy rzeczy i nic poza nimi: **tag** obrazu, linie `-v` poświadczeń oraz `image`, `name` i `mounts` dev containera. To kontrolka, a nie akapit mówiący, byś sam je podmienił, ponieważ każde polecenie tutaj ma przycisk Kopiuj, a kto kopiuje, ten nie czytał instrukcji podmiany.

Nie każdy profil ma jeden katalog poświadczeń. `opencode` trzyma dwa i przyjmuje dwie linie `-v`; `antigravity` trzyma token w systemowym pęku kluczy i nie przyjmuje żadnej, logując się wewnątrz kontenera; a `aider` montuje plik i odczytuje klucz modelu ze środowiska. Kroki mówią o tym, gdy je wybierzesz.

### W poleceniu uruchomienia nic się nie zachowuje, co mogłoby się zestarzeć {#run-command}

`--pull=always` pobiera bieżący obraz przy każdym starcie, więc tag profilu, który się przesunął, dociera do Ciebie bez konieczności zauważenia, że się przesunął, a `--rm` oznacza, że nic się nie zachowuje, co mogłoby się zestarzeć. Nie ma osobnej ścieżki powrotu do pracy — a to właśnie sprawiało, że ludzie uruchamiali `motir` starszy o miesiące niż strona, z której go czytali. Twoje logowanie to przetrwa: jest zapisane na woluminie `{{value:authVolume}}`, który leży poza kontenerem, więc logujesz się raz, a każde kolejne uruchomienie je odbiera — wylogujesz się na dobre poleceniem `{{value:signOutCommand}}`. Pracujesz offline? Pomiń `--pull=always`: sięga do rejestru przy każdym starcie, więc bez sieci uruchomienie się nie powiedzie zamiast wrócić do obrazu, który już masz. Wszystko to dotyczy polecenia uruchomienia. Dev container (kroki 2a–2c) zachowuje obraz, z którego został utworzony, dopóki go nie pobierzesz, nie dołączysz przez _Dev Containers: Open Folder in Container…_ i nie wybierzesz _Dev Containers: Rebuild Container_.

### Co dalej {#what-next}

`motir run` przyjmuje ZAKRES — jeden element roboczy, całą historię albo `sprint` dla aktywnego. `motir auto` zamiast tego opróżnia zbiór gotowych elementów bez nadzoru, jeden po drugim na gałąź sesji. Każda flaga, którą przyjmują oba, jest na stronie [{{value:cliPage}}](/docs/cli).

## Co ogranicza — i czego nie {#confines}

Warto to przeczytać, zanim na tym polegasz, ponieważ jedno z tych trzech jest wyjątkiem, a nie gwarancją.

- **System plików — ograniczony.** Jedyne powierzchnie hosta wewnątrz kontenera to katalog `/workspace` z możliwością zapisu i własne poświadczenie agenta, zamontowane tylko do odczytu. Brak gniazda Dockera, brak innych powiązań z hostem.
- **Sieć — OTWARTA, z założenia.** Każdy agent potrzebuje API swojego dostawcy, a każdy przekazany element roboczy potrzebuje zdalnych repozytoriów git, więc obraz ogranicza zasięg szkód w systemie plików, a nie ruch wychodzący. Jeśli Twój model zagrożeń wymaga więcej, sięgnij po własne mechanizmy sieciowe Dockera — kontener nie powstrzyma agenta przed rozmową z internetem.
- **Uprawnienia — bez uprzywilejowania.** Działa jako użytkownik `node` (uid 1000), więc pliki zapisane w montowanym katalogu pozostają Twoje, a nie roota.

## Co daje środowisko {#environment}

- **Twój folder, zamontowany.** `$PWD` staje się `/workspace`, więc checkouty, w których pracuje uruchomienie, są Twoje, a commity, które tworzy, są na Twoim dysku po jego zakończeniu.
- **Jeden checkout na element roboczy, na worktree gita.** Uruchomienie nie edytuje drzewa, w którym siedzisz; dodaje worktree dla każdego elementu, więc równoległe uruchomienia nie kolidują ze sobą przy checkoucie gałęzi.
- **Twoje poświadczenie agenta, TYLKO DO ODCZYTU.** Katalog poświadczeń profilu jest zamontowany z `:ro`. Nic w kontenerze nie może go przepisać i nic z niego nie jest wysyłane do Motir — to model, w którym przynosisz własny klucz, więc rachunek za agenta jest Twój, a wywołanie API nigdy nie przechodzi przez nas.
- **CLI, zainstalowane z góry.** Obraz zawiera `motir` i plik binarny agenta wskazany przez tag, więc przed pierwszym uruchomieniem nie ma nic do zainstalowania.
- **Wynik Twojego agenta domyślnie zostaje lokalnie.** Do Motir trafia tylko cykl życia uruchomienia. Przekazanie `--report-log` dodatkowo wysyła końcówkę wyniku, by nieudane uruchomienie pokazywało ją na stronie uruchomienia; jest WYŁĄCZONE, dopóki o to nie poprosisz, a zawartość plików, ścieżki i diffy nie są wysyłane w żadnym z przypadków.

## Co może token — i czego odmawia {#token}

Token utworzony przez `motir login` niesie stałe, zawężone nadanie. Ekran zatwierdzenia je pokazuje i nie może go zmienić — ani poszerzyć, ani zawęzić, ponieważ ręcznie zawężone nadanie psuje pętlę bez nadzoru w połowie.

{{slot:grant}}

**Tego, którego NIE niesie, jest `ai:view_plan`, a odmowa, która z tego wynika, jest zamierzona, a nie błędem.** Otwarcie planu wymaga tylko `work_item:edit`, więc uruchomienie w piaskownicy MOŻE go otworzyć — i zostaje odrzucone przy pierwszym dopisaniu, bo ten klucz weryfikuje dodawanie propozycji. Uruchomienie wykonujące element roboczy nie przekształca planu, który dostało. Gdy trafisz na tę odmowę, agent zrobił to, co należy: zapisuje korektę jako komentarz, zostawia element jako zablokowany i zatrzymuje się. Nic nie przepada, a o treści planu decyduje człowiek.

Dwie flagi zawężają to jeszcze bardziej, gdy chcesz spokojniejszego uruchomienia: `--disable-log-bug` powstrzymuje agenta przed zakładaniem błędu dla usterki znalezionej gdzie indziej (zamiast tego komentuje), a `--disable-replan` powstrzymuje go przed przesyłaniem ponownego planowania dla elementu roboczego, który uzna za błędny (komentuje i się zatrzymuje). Tylko w `motir auto` `--auto-approve-replan` działa w drugą stronę: zatwierdza przesłane ponowne planowanie i pętla trwa dalej, zamiast zatrzymać się dla Ciebie.

## Co tworzy uruchomienie i gdzie to przeczytać {#produces}

- **Gałąź i pull request** w każdym repozytorium, w którym element jest dostarczany, wypchnięte Twoimi poświadczeniami gita z wnętrza kontenera.
- **Powiązanie na elemencie roboczym.** Uruchomienie deklaruje, który element dostarcza każdy pull request, więc scalenie go przesuwa element. To powiązanie pokazuje sekcja Rozwój na stronie elementu i to ono zamyka element przy scaleniu — a nie nazwa gałęzi ani tytuł.
- **Status, na bieżąco.** Element przechodzi do statusu _W toku_, gdy uruchomienie go przejmuje, i do _Zaimplementowane_, gdy otwiera się pull request. Status _W przeglądzie_ ustawia CI, gdy testy zazielenieją, a _Gotowe_ — scalenie.
- **Terminal.** Wynik samego agenta zostaje w Twoim terminalu, chyba że przekazano `--report-log`.

## Gdy to nie działa {#troubleshooting}

### Nie znaleziono pliku binarnego agenta {#agent-binary-not-found}

Tag i agent się nie zgadzają. Sprawdź, który profil uruchomiono, albo wskaż uruchomieniu inny plik binarny przez `--agent <cmd>`. `motir doctor` sygnalizuje to, zanim uruchomienie zmarnuje na to przejęcie.

### Agent startuje i nie jest uwierzytelniony {#agent-not-authenticated}

Montowanie poświadczeń brakuje albo wskazuje zły katalog — każdy profil montuje własny. Uruchom ponownie linię `{{value:dockerRun}}` dla tagu, który faktycznie pobrano.

### Nic nie jest gotowe do uruchomienia {#nothing-ready}

Każdy kandydat ma niespełnioną zależność. `motir ready` pokazuje ten zbiór; `motir show` dla elementu roboczego wskazuje, co go blokuje. Przekazanie mimo to to `--force`, tylko jeden element.

### Uruchomienie zatrzymuje się na przesłanym ponownym planowaniu {#stopped-on-replan}

Agent uznał element roboczy za błędny i zaproponował poprawiony kształt. To zamierzone zatrzymanie: przeczytaj plan w Motir i zatwierdź go albo odrzuć. Aby zamiast tego utrzymać pętlę bez nadzoru, uruchom `motir auto` z `--auto-approve-replan`.

### Uruchomienie zostawiło pracę po zakończeniu {#work-left-behind}

Worktree i gałęzie są na Twoim dysku, w folderze, który zamontowano — zatrzymany kontener ich nie zabrał. `motir done` zamyka scalony element albo całą scaloną gałąź sesji z `--session <branch>`.

## Czego ta strona nie obejmuje {#not-covered}

Każde polecenie i każdą flagę — to opisuje strona [{{value:cliPage}}](/docs/cli), generowana z własnego katalogu CLI, więc nie może się z nim rozjechać. Podłączenie agenta do Motir bezpośrednio, bez CLI, opisuje strona [{{value:mcpPage}}](/docs/mcp). Obsługę tej samej pętli pracy przez HTTP zamiast z terminala opisuje strona [{{value:apiPage}}](/docs/api). Uruchamianie piaskownicy gdziekolwiek poza Twoim własnym komputerem nie jest tu jeszcze udokumentowane. (Droga przez VS Code JEST udokumentowana, powyżej — ta uwaga mówiła kiedyś inaczej i zapisywała usuniętą sekcję jako decyzję.)
