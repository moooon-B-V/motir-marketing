---
source: 758198e00644
---

Plugin Motir do Claude Code umieszcza Twój projekt Motir w Claude Code jedną instalacją: umiejętności Motir, jego serwer MCP i program uruchamiający jego CLI. Loguje się Twoim kontem Motir w przeglądarce, więc nie ma tokenu. Powiedz `motir run`, a Claude Code weźmie następny gotowy element roboczy, zbuduje go i otworzy powiązany pull request.

Plugin jest publikowany z repozytorium [{{value:skillsRepo}}]({{value:repoUrl}}), które jest także marketplace’em pluginów Claude Code. Każde polecenie na tej stronie instaluje wydanie [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Zanim zaczniesz {#before}

Potrzebujesz Claude Code, konta Motir z dostępem do projektu oraz `git`. Program uruchamiający wymaga Node.js 22 lub nowszego, a umiejętności, które otwierają lub czytają pull requesty, wymagają GitHub CLI (`gh`).

## Instalacja {#install}

Dodaj marketplace w tagu wydania, a potem zainstaluj plugin. Oba kroki wykonaj w Claude Code.

{{slot:install}}

## Co przynosi {#brings}

- **Siedem umiejętności.** Każda umiejętność z wydania, wymieniona pod nazwą pluginu.
- **Serwer Motir MCP.** Claude Code loguje się do niego w przeglądarce przy pierwszym użyciu: uruchom `/mcp`, wybierz `motir` i wybierz _Authenticate_, potem wskaż obszar roboczy i zatwierdź na ekranie zgody Motir. Nie ma tokenu do utworzenia ani wklejenia.
- **Program uruchamiający `motir`.** Uruchamia przypięte Motir CLI przez `npx`, więc nic nie jest instalowane globalnie. Wymaga Node.js 22 lub nowszego, a CLI loguje się samodzielnie przez `motir login`.

## Sprawdź, czy działa {#check}

Aby to sprawdzić: `/plugin` pokazuje `motir` w wersji `{{value:releaseVersion}}`, a `/mcp` wymienia `motir`. Umiejętności pluginu są wymienione pod jego nazwą, na przykład `/motir:motir-run`.

## Użycie {#use}

Powiedz w Claude Code, czego chcesz. Pełne działanie każdej umiejętności i to, co zobaczysz w Motir, opisuje przewodnik [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Aktualizacja {#updating}

Marketplace’u dodanego w jednym wydaniu nie można dodać ponownie w innym, więc najpierw go usuń. Usunięcie odinstalowuje plugin, a ostatnia linia instaluje go ponownie w nowym wydaniu.

{{slot:update}}

Używasz innego agenta albo chcesz tylko konektor? Zobacz przewodnik [{{value:skillsPage}}](/docs/skills), który obejmuje każdego agenta, albo [{{value:connectorPage}}](/docs/claude-code-connector).
