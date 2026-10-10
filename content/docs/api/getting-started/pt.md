---
source: 1c84b9f042c7
---

A API pública de leitura é anônima — todo endpoint de leitura devolve dados do projeto sem exigir login, e é isso que permite que a praça de projetos funcione para um visitante sem sessão. Tudo o que está vinculado a uma conta exige um token. A seguir, cinco passos, cada um terminando em algo que você pode ver acontecer.

Todo caminho é relativo ao host da aplicação para o qual esta versão aponta, mostrado abaixo. As requisições foram escritas em relação a ele, então você pode copiar qualquer uma como está.

{{slot:app-host}}

## 1. Gere um token {#mint-a-token}

Gere um token de acesso pessoal em Configurações da conta → Tokens, escolha o espaço de trabalho ao qual ele fica vinculado e conceda as permissões de que ele precisa — os mesmos nomes `resource:action` que a tela Funções e permissões mostra. Conceda o menor conjunto que resolve o trabalho: uma concessão restringe o seu próprio papel e nunca o amplia, então um token não pode fazer algo que você não poderia.

**O segredo é mostrado UMA ÚNICA vez, quando o token é criado.** Copie-o nesse momento; não há como lê-lo de novo, e um token perdido é substituído, não recuperado.

## 2. Sua primeira chamada autenticada {#first-call}

Faça esta chamada primeiro. Ela responde quem é o token, a qual espaço de trabalho ele está vinculado e exatamente quais permissões ele carrega — assim você descobre o que a sua própria credencial pode fazer sem testar endpoints e coletar recusas.

{{slot:first-call-request}}

{{slot:first-call-response}}

Um token ausente, malformado, desconhecido, revogado ou expirado devolve sempre o mesmo `401`, com a mesma mensagem. Isso é proposital: distingui-los transformaria o endpoint em um oráculo que responde “este segredo existe?”.

## 3. Percorra uma coleção {#paginate}

As coleções são paginadas por cursor. Peça um tamanho de página com `limit` (o padrão é 50 e qualquer valor maior é limitado a 100, não rejeitado) e depois envie o `nextCursor` da resposta anterior de volta como `cursor`. Um `nextCursor` igual a `null` indica a última página.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

O cursor é OPACO e assinado. Não o interprete, não construa um nem o leve de uma coleção para outra — um cursor emitido em outro lugar resulta em um `422`, nunca em uma página errada sem aviso. Devolva exatamente o que você recebeu.

Uma assimetria surpreende as pessoas, então vale conhecê-la antes de encontrá-la: algumas coleções também informam um `totalCount` e a maioria deliberadamente não informa. Quando a leitura por trás de uma coleção já calcula um total como agregado limitado, ele é informado; nos demais casos o campo é omitido POR COMPLETO — ausente, nunca `null` e nunca `0`, para que um cliente sempre consiga distinguir “nenhum total foi prometido” de “o total é zero”.

## 4. Leia um erro {#read-an-error}

Toda falha devolve o mesmo corpo: um `code` legível por máquina e um `error` legível por pessoas. Decida com base em `code` — ele é estável, e alterá-lo é uma mudança incompatível. Nunca interprete `error`; é uma frase para quem desenvolve e lê um terminal, e pode ser reescrita à vontade.

{{slot:error-404-response}}

Um `404` significa que o recurso não existe **ou** está fora do espaço de trabalho ao qual o seu token está vinculado — a mesma resposta de propósito, para que a API não possa ser usada para enumerar os dados de outro tenant. Um `403` é o tipo oposto de recusa: o seu token é válido e a concessão dele não tem a permissão que esta operação exige, e a resposta informa a chave. Um `422` é uma requisição que você pode corrigir, e o `code` dele indica qual parte.

**Um `500` é a única falha SEM `code`.** Uma falha inesperada não tem contrato estável, então o corpo traz uma mensagem e nada além disso — não tome decisões com base nela.

## 5. Leia os cabeçalhos da resposta {#rate-limits}

O limite vale por TOKEN, e os cabeçalhos acompanham TODA resposta — seja um sucesso, uma recusa, um erro mapeado ou uma falha. Você nunca precisa fazer uma requisição para saber em que ponto está; a última já informou.

{{slot:response-headers}}

Em um `429`, espere até `X-RateLimit-Reset` — um timestamp Unix em SEGUNDOS. Não existe um cabeçalho `Retry-After`, de propósito: um instante absoluto não fica desatualizado em trânsito como uma duração relativa.

`X-Request-Id` também vem em toda resposta. Cite-o se precisar nos perguntar sobre uma chamada específica — é o único identificador que a encontra.

`X-Motir-Api-Version` é a versão do CONTRATO que atendeu à resposta — o mesmo `MAJOR.MINOR.PATCH` do `info.version` da especificação, não o número da nossa versão de lançamento. Leia-o em qualquer resposta, inclusive em uma falha, para verificar se há descompasso de versão. Um MAJOR que você não reconhece significa que existe uma `/api/v2`; um MINOR mais alto significa que o contrato cresceu, de forma aditiva, e o seu cliente continua correto. Se o bloco acima mostrar um marcador no lugar de uma versão, a especificação estava inacessível quando esta página foi renderizada, e a [Referência da API](/docs/api) lê a versão atual direto do documento.

## O que vem a seguir {#what-next}

A [Referência da API](/docs/api) lista todas as operações com seus parâmetros, seu corpo e seus status. [Estabilidade e descontinuação](/docs/api/stability) é o que o contrato promete não fazer com você. Se você está conectando um agente em vez de escrever um cliente, o [servidor MCP](/docs/mcp) é a outra metade.
