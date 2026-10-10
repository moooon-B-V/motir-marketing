---
source: f11baeff4d7b
---

{{slot:catalogue-summary}}

Esta lista é buscada no Motir quando a página é solicitada, portanto é o que o servidor entrega neste momento. Cada ferramenta mostra os argumentos que recebe — seus nomes, seus tipos e quais são obrigatórios — lidos do mesmo registro que responde a um handshake `tools/list` no endpoint mostrado acima, que continua sendo a superfície de referência e traz a descrição completa de cada ferramenta. Quais delas um determinado token pode chamar depende da concessão que ele carrega, então a lista que o seu cliente mostra já é restrita a você.

{{slot:hint-legend}}

As tabelas de argumentos mostram um nível: um objeto aninhado ou uma lista mostra seu tipo, e o handshake traz a estrutura interna.

{{slot:catalogue}}

O [servidor MCP](/docs/mcp) explica como conectar um agente ao endpoint e qual token ele precisa.
