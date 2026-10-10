---
source: f11baeff4d7b
---

{{slot:catalogue-summary}}

Esta lista se obtiene de Motir cuando se solicita la página, así que es exactamente lo que el servidor ofrece ahora mismo. Cada herramienta muestra los argumentos que admite (sus nombres, sus tipos y cuáles son obligatorios), leídos del mismo registro que responde a un handshake `tools/list` contra el endpoint mostrado arriba, que sigue siendo la superficie de referencia y lleva la descripción completa de cada herramienta. Cuáles de ellas puede invocar un token concreto depende de la concesión que lleve, así que la lista que muestra tu cliente ya está acotada a ti.

{{slot:hint-legend}}

Las tablas de argumentos se muestran a un solo nivel: un objeto anidado o una lista muestran su tipo, y el handshake lleva la forma que hay dentro.

{{slot:catalogue}}

[Servidor MCP](/docs/mcp) explica cómo conectar un agente al endpoint y el token que necesita.
