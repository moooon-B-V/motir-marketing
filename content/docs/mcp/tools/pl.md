---
source: f11baeff4d7b
---

{{slot:catalogue-summary}}

Ta lista jest pobierana z Motir w chwili żądania strony, więc to jest to, co serwer wydaje w tej chwili. Każde narzędzie pokazuje przyjmowane argumenty — ich nazwy, typy i informację, które są wymagane — odczytane z tego samego rejestru, który odpowiada na handshake `tools/list` względem endpointu pokazanego wyżej; to on nadal jest autorytatywną powierzchnią i niesie pełny opis każdego narzędzia. To, które z nich może wywołać dany token, zależy od nadania, które niesie, więc lista pokazywana przez Twojego klienta jest już ograniczona do Ciebie.

{{slot:hint-legend}}

Tabele argumentów są renderowane na jednym poziomie: zagnieżdżony obiekt lub lista pokazuje swój typ, a kształt wewnątrz niesie handshake.

{{slot:catalogue}}

[Serwer MCP](/docs/mcp) opisuje podłączanie agenta do endpointu i potrzebny do tego token.
