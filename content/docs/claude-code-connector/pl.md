---
source: 04e1454b8c46
---

Motir to zdalny konektor MCP: Claude Code łączy się z Twoim projektem Motir pod jednym adresem URL i działa jako Ty, w granicach tego, co zatwierdzisz. Logujesz się kontem Motir i wybierasz jeden obszar roboczy. Nie ma tokenu do utworzenia, wklejenia ani przechowywania.

Można go dodać na dwa sposoby. Połącz go raz w claude.ai, a Claude Code przejmie go wszędzie tam, gdzie jesteś zalogowany kontem Claude, albo dodaj go w samym Claude Code jednym poleceniem. Chcesz też umiejętności Motir? [{{value:pluginPage}}](/docs/claude-code-plugin) przynosi ten konektor ze sobą.

## Zanim zaczniesz {#before}

Potrzebujesz konta Motir z dostępem do projektu oraz Claude Code. W przypadku drogi przez claude.ai Claude Code musi być zalogowany tym samym kontem Claude, które łączysz w claude.ai.

## Połącz go w claude.ai {#claude-ai}

Konektor połączony w claude.ai jest dostępny w Twoich rozmowach w sieci, w aplikacji na komputer i na telefonie oraz w Claude Code, gdy jest zalogowany Twoim kontem Claude.

1. Otwórz _Customize → Connectors_.
2. Kliknij „+”, potem _Add custom connector_ i wklej poniższy adres URL serwera. W polu _OAuth client_ wybierz _Use Claude’s published identity_ — claude.ai oznacza to jako _Detected_, ponieważ Motir to obsługuje. Pola _OAuth client ID_ i _secret_ zostaw puste — Motir nie potrzebuje żadnego z nich.
3. Kliknij _Add_, potem _Connect_. Claude przeniesie Cię do app.motir.co, gdzie się zalogujesz i zatwierdzisz.

{{slot:claude-ai}}

W planie Team lub Enterprise właściciel (_Owner_) dodaje konektor jednorazowo w _Organization settings → Connectors → Add → Custom → Web_, a następnie każdy członek klika _Connect_ w _Customize → Connectors_ ze swoim własnym kontem Motir. · [Dokumentacja claude.ai od Anthropic]({{value:claudeAiDocsUrl}}) · kroki sprawdzono: {{value:claudeAiCheckedOn}}

## Albo dodaj go w Claude Code {#claude-code}

Dodaj konektor bezpośrednio do Claude Code, bez claude.ai.

1. Dodaj serwer poleceniem poniżej — bez nagłówka i bez tokenu.
2. W Claude Code uruchom `/mcp`, wybierz `motir` i dokończ logowanie w przeglądarce.

{{slot:claude-code}}

Jeśli zalogowano Claude Code kontem Claude, konektor połączony w claude.ai jest tam już dostępny. Plugin Motir do Claude Code przynosi ten serwer ze sobą, obok umiejętności. · [Dokumentacja Claude Code od Anthropic]({{value:claudeCodeDocsUrl}}) · kroki sprawdzono: {{value:claudeCodeCheckedOn}}

## Sprawdź połączenie {#check}

W Claude Code uruchom `/mcp`: Motir jest na liście serwerów, a serwer, który wciąż wymaga logowania, mówi o tym. Potem zapytaj Claude o swój projekt — na przykład co jest gotowe do startu — a odpowie na podstawie Motir.

## Co zatwierdzasz i jak to cofnąć {#consent}

Strona logowania w Motir podaje nazwę aplikacji, która o to prosi, pozwala wybrać jeden obszar roboczy i wymienia uprawnienia, o które aplikacja prosi. Claude działa wtedy jako Ty w tym obszarze roboczym, w granicach tego, co zatwierdzisz, i nigdy poza tym, na co pozwala Twoja własna rola. Claude pyta, zanim użyje narzędzia, które cokolwiek zmienia, a strona [{{value:mcpToolsPage}}](/docs/mcp/tools) pokazuje, które narzędzia tylko czytają, zapisują albo usuwają.

Każda połączona aplikacja jest wymieniona w sekcji [Połączone aplikacje]({{value:connectedAppsUrl}}), w Ustawienia → Konto → Tokeny w Motir, razem z jej obszarem roboczym, uprawnieniami i czasem ostatniego użycia. Cofnięcie kończy jej dostęp przy następnym żądaniu. Przewodnik [{{value:mcpPage}}](/docs/mcp) zawiera szczegóły serwera oraz drogę z tokenem dla innych klientów i potoków.
