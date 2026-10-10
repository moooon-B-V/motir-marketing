---
source: 8e83d53f1b7a
---

Conecte o Sentry a um projeto do Motir e os erros que os seus serviços já reportam chegam ao quadro desse projeto como itens de trabalho do tipo bug — planejados, atribuídos e levados até a conclusão como qualquer outro trabalho. Corrigir o bug fecha o ciclo: o Motir resolve o erro no Sentry por você.

## O que ele faz {#what-it-does}

- **Cada novo erro vira um bug.** O Motir verifica, em um intervalo agendado, os projetos do Sentry que você escolheu. Um erro que ele ainda não viu é registrado como um item de trabalho `bug` no destino de bugs do projeto, com a origem do erro, seu nível e um link de volta para o Sentry.
- **Uma recorrência atualiza o mesmo bug.** Quando um erro acontece de novo, o bug existente dele é atualizado — nenhum duplicado é registrado.
- **Concluído no Motir significa resolvido no Sentry.** Quando o bug chega a um status de concluído, o Motir resolve o erro dele no Sentry.
- **O responsável no Sentry acompanha o erro.** Se um erro está atribuído a alguém no Sentry e essa pessoa é membro do espaço de trabalho do Motir (identificada pelo e-mail), o bug é atribuído a ela.

As duas direções podem ser desativadas, por projeto monitorado — veja [Configurações](#settings).

## Antes de começar {#before-you-start}

- No Motir, você precisa de permissão para gerenciar as integrações do projeto. Sem ela, a página Monitoramento diz a quem pedir.
- No Sentry, você precisa ter permissão para instalar integrações na sua organização — em geral, um proprietário ou gerente.

## Conecte o Sentry {#connect-sentry}

1. No Motir, abra as configurações do projeto e escolha _Monitoramento_.
2. Escolha _Conectar o Sentry_. Você é levado ao Sentry.
3. No Sentry, escolha a sua organização e aprove a instalação. O Sentry traz você de volta ao Motir, que mostra _O Sentry está conectado._
4. Escolha _Escolher projetos do Sentry_, selecione os projetos cujos erros devem chegar a este quadro e confirme. Nada chega até que você faça isso.

Você pode monitorar vários projetos do Sentry a partir de um projeto do Motir e adicionar mais depois com _Adicionar um projeto monitorado_.

## Configurações {#settings}

Cada projeto monitorado tem as suas próprias configurações:

- **Nível mínimo** — só os erros neste nível ou acima dele são registrados. O padrão é _Todos os níveis_. Escolher um nível mais baixo também verifica erros anteriores, desde o momento em que o projeto começou a ser monitorado.
- **Resolver no Sentry quando o bug for concluído** — ativado por padrão. Desative para deixar os erros no Sentry como estão quando os bugs deles forem concluídos.
- **Usar o responsável definido no Sentry** — ativado por padrão. Desative para ignorar as atribuições feitas no Sentry.

## Permissões que ele pede {#permissions-it-asks-for}

O Motir pede ao Sentry o menor conjunto de permissões de que estes recursos precisam, e nada além disso:

| Escopo do Sentry | Para que o Motir o usa                                                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `org:read`       | Ler qual organização foi conectada, listar os projetos dela para que você escolha quais monitorar e verificar se a conexão ainda funciona.                                                             |
| `project:read`   | Ler os projetos que você escolheu monitorar.                                                                                                                                                           |
| `event:read`     | Ler os novos erros dos projetos monitorados — título, nível, origem, quantas vezes ocorreram, os quadros de pilha mais recentes e a quem estão atribuídos — para que cada um possa chegar como um bug. |
| `event:write`    | Marcar um erro como resolvido no Sentry quando o bug dele é concluído. Nada mais é gravado.                                                                                                            |

O acesso que o Sentry concede é armazenado criptografado e nunca é mostrado de volta a ninguém, incluindo você.

## Quando a conexão mostra Degradado {#when-the-connection-shows-degraded}

_Degradado_ significa que o Motir não consegue mais ler os erros da sua organização, e nada de novo chega ao quadro até que isso seja corrigido. Ao lado de _O Sentry diz:_, a página mostra o motivo nas palavras do próprio Sentry.

- Escolha _Verificar novamente_ primeiro — um problema passageiro do lado do Sentry se resolve sozinho.
- Se continuar degradado, escolha _Reconectar_. Se o Sentry disser que a integração já está instalada, desinstale o Motir nas configurações de integração da sua organização no Sentry e depois escolha _Reconectar_ de novo. Os seus projetos monitorados, as configurações deles e os bugs já registrados são mantidos.

## Desconectar {#disconnect}

Para parar de monitorar um projeto do Sentry, use _Parar de monitorar_ na linha dele. Remover o último projeto monitorado é _Desconectar o Sentry_: isso também remove o acesso armazenado do Motir à sua organização, e para monitorá-la de novo você se conecta pelo Sentry mais uma vez.

Os bugs que já foram registrados permanecem no quadro como itens de trabalho comuns. Nada no Sentry é alterado ao desconectar. Para revogar o acesso também do lado do Sentry, desinstale o Motir nas configurações de integração da sua organização no Sentry.
