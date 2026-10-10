---
source: 04e1454b8c46
---

O Motir é um conector MCP remoto: o Claude Code acessa o seu projeto do Motir por uma única URL e age como você, dentro do que você aprovar. Você entra com a sua conta do Motir e escolhe um espaço de trabalho. Não há token para criar, colar ou guardar.

Há duas maneiras de adicioná-lo. Conecte-o uma vez no claude.ai e o Claude Code o reconhece em qualquer lugar em que você esteja conectado com a sua conta do Claude, ou adicione-o no próprio Claude Code com um único comando. Quer também as skills do Motir? O [{{value:pluginPage}}](/docs/claude-code-plugin) traz este conector junto.

## Antes de começar {#before}

Você precisa de uma conta do Motir com acesso ao projeto e do Claude Code. Para o caminho pelo claude.ai, o Claude Code precisa estar conectado com a mesma conta do Claude que você conecta no claude.ai.

## Conecte pelo claude.ai {#claude-ai}

Um conector que você conecta no claude.ai fica disponível nas suas conversas na web, no aplicativo para computador e no celular, e no Claude Code quando ele está conectado com a sua conta do Claude.

1. Abra Customize → Connectors.
2. Clique em “+”, depois em Add custom connector, e cole a URL do servidor abaixo. Em OAuth client, escolha Use Claude’s published identity — o claude.ai a marca como Detected, porque o Motir a oferece. Deixe vazios o ID e o segredo do cliente OAuth — o Motir não precisa de nenhum dos dois.
3. Clique em Add e depois em Connect. O Claude leva você a app.motir.co para entrar e aprovar.

{{slot:claude-ai}}

Em um plano Team ou Enterprise, um Owner adiciona o conector uma única vez, em Organization settings → Connectors → Add → Custom → Web, e cada membro então clica em Connect em Customize → Connectors com a sua própria conta do Motir. · [Documentação do claude.ai da Anthropic]({{value:claudeAiDocsUrl}}) · passos verificados em {{value:claudeAiCheckedOn}}

## Ou adicione no Claude Code {#claude-code}

Adicione o conector diretamente ao Claude Code, sem passar pelo claude.ai.

1. Adicione o servidor com o comando abaixo — sem cabeçalho e sem token.
2. No Claude Code, execute `/mcp`, selecione `motir` e siga o login no seu navegador.

{{slot:claude-code}}

Se você conectou o Claude Code com a sua conta do Claude, um conector que você conectou no claude.ai já está disponível nele. O plugin do Motir para o Claude Code traz este servidor junto, ao lado das skills. · [Documentação do Claude Code da Anthropic]({{value:claudeCodeDocsUrl}}) · passos verificados em {{value:claudeCodeCheckedOn}}

## Verifique a conexão {#check}

No Claude Code, execute `/mcp`: o Motir aparece na lista de servidores, e um servidor que ainda precisa que você entre avisa isso. Em seguida, pergunte ao Claude sobre o seu projeto — por exemplo, o que está pronto para começar — e ele responde com base no Motir.

## O que você aprova e como desfazer {#consent}

A página de login no Motir informa qual app está pedindo, faz você escolher um espaço de trabalho e lista as permissões que ele quer. O Claude então age como você nesse espaço de trabalho, dentro do que você aprovou, e nunca além do que o seu próprio papel permite. O Claude pergunta antes de usar uma ferramenta que altera algo, e [{{value:mcpToolsPage}}](/docs/mcp/tools) mostra quais ferramentas apenas leem, escrevem ou excluem.

Todo app que você conecta aparece em [Apps conectados]({{value:connectedAppsUrl}}), em Configurações da conta → Tokens no Motir, com o espaço de trabalho, as permissões e a data do último uso. Revogar encerra o acesso dele na próxima requisição. O guia [{{value:mcpPage}}](/docs/mcp) traz os detalhes do servidor e o caminho com token para outros clientes e pipelines.
