---
source: 656e3e6e6922
---

A API pública de leitura é versionada. A versão do contrato viaja no campo `info.version` do documento OpenAPI servido, e uma mudança que quebra um cliente é um aumento de versão, não uma edição silenciosa.

## O que a `v1` garante {#the-guarantee}

Enquanto a `v1` existir, seus caminhos não mudam, um `code` de erro não muda de significado, uma condição existente não muda de status e um campo não muda de tipo nem de nulidade. Tudo o que quebrasse isso é uma `v2`, não uma versão da `v1`.

### Permitido dentro da `v1`, sem aviso {#allowed-inside-v1}

- Um novo endpoint.
- Um novo parâmetro de consulta OPCIONAL.
- Um novo campo em um objeto de resposta.
- Um novo cabeçalho de resposta.
- Um novo valor em um campo documentado como aberto.
- Um limite de requisições ampliado.

### Exige uma nova versão principal {#needs-a-new-major}

- Remover um campo.
- Renomear um campo.
- Mudar o tipo ou a nulidade de um campo.
- Remover ou dar outro propósito a um `code` de erro.
- Mudar o status existente de uma condição existente.
- Apertar um limite.
- Tornar obrigatório um parâmetro opcional.

## A sua parte da promessa {#your-obligation}

**Um cliente DEVE tolerar campos e valores desconhecidos e NÃO DEVE interpretar a frase legível `error`.** Esta é a outra metade da promessa, e sem ela a garantia acima não se sustenta: um cliente que rejeita um campo que não reconhece vai quebrar com uma mudança que esta página chama de segura, e um cliente que interpreta `error` vai quebrar com uma frase reescrita. Decida com base em `code`, ignore o que você não conhece, e toda mudança aditiva sai de graça para você.

## Descontinuação {#deprecation}

Uma operação ou um campo descontinuado é marcado com `deprecated: true` **na especificação** e traz o motivo e a substituição na sua descrição. A especificação é o canal de aviso porque é o único artefato que todo cliente já lê — assim, um gerador de código exibe a descontinuação sem que ninguém precise ter visto uma publicação de blog.

O comportamento antigo continua funcionando durante o prazo anunciado. Um campo nunca é removido de surpresa.

## Como uma `v2` chegaria {#how-v2-arrives}

Como um SEGUNDO documento em um segundo caminho, servido ao lado da `v1` — não como uma reescrita dela. A `v1` não deixa de funcionar no dia em que a `v2` for lançada, e descontinuar a `v1` é, por si só, um anúncio sujeito ao mesmo prazo.

O `info.version` da especificação é a versão do contrato da API, não o número de lançamento do aplicativo: a versão principal é a versão do caminho, a secundária aumenta a cada mudança aditiva da lista acima e a de correção aumenta a cada ajuste que afeta só a documentação. Leia-o em qualquer resposta como `X-Motir-Api-Version` — [Primeiros passos](/docs/api/getting-started) mostra onde.

Esta página é o compromisso publicado. O registro interno a partir do qual ela foi escrita é [o registro de decisão da API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
