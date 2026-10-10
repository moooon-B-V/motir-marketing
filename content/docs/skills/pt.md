---
source: 38ac3b50e511
---

As skills do Motir fazem o agente que você já usa trabalhar o seu projeto do Motir. Diga `motir run` e ele pega o próximo item de trabalho pronto, o constrói e abre um pull request vinculado. Diga `motir log bug` e ele confere o defeito e o registra onde ele pertence. Diga `motir mark` e ele conclui um item de trabalho manual depois que você o fez. Diga `motir guide` e ele conduz você por um item de trabalho manual, um passo por vez.

São [Agent Skills](https://agentskills.io) comuns: uma pasta por skill, cada uma com um `SKILL.md`, publicadas em [{{value:skillsRepo}}]({{value:repoUrl}}). Todos os comandos desta página instalam a versão [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Antes de começar {#before}

As skills falam com o Motir pelo servidor MCP dele. No Claude Code, o plugin o conecta para você: você entra com a sua conta do Motir no navegador, e não há token. Todo outro agente precisa que esse servidor seja conectado antes — um projeto do Motir, um token de acesso pessoal e a configuração do seu agente no guia [{{value:mcpPage}}](/docs/mcp), que também cobre o caminho com token no Claude Code, caso você não possa usar o login pelo navegador. Um token com as permissões padrão pode fazer tudo o que estas skills fazem. Você também precisa do `git` e da CLI do GitHub (`gh`) para as skills que abrem ou leem pull requests.

## Instalação {#install}

Escolha o seu agente. Cada seção instala todas as skills da versão para todos os projetos da sua máquina. Os comandos de terminal são para macOS e Linux: eles baixam a versão, copiam as pastas das skills para a pasta que esse agente lê e removem o download.

### Claude Code {#claude-code}

O repositório também é um marketplace de plugins do Claude Code. Adicione-o na tag da versão e depois instale o plugin. Uma instalação traz as skills, o servidor MCP do Motir e um executor para a CLI dele, e conecta o Motir sem token.

- **As sete skills.** Todas as skills da versão, listadas sob o nome do plugin.
- **O servidor MCP do Motir.** O Claude Code entra nele pelo navegador na primeira vez que ele é usado: execute `/mcp`, escolha `motir` e selecione _Authenticate_, depois escolha o espaço de trabalho e aprove na tela de consentimento do Motir. Não há token para criar nem colar. [Adicione o Motir ao Claude](/docs/mcp#claude)
- **O executor `motir`.** Executa a Motir CLI fixada com `npx`, então nada é instalado globalmente. Ele precisa do Node.js 22 ou mais recente, e a CLI entra por conta própria com `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Para confirmar: `/plugin` mostra `motir` em `{{value:releaseVersion}}`, e `/mcp` lista `motir`. As skills de um plugin aparecem sob o nome do plugin, por exemplo `/motir:motir-run`. Copiar as skills traz só as skills — conecte o servidor MCP por conta própria, como fazem os outros agentes. Para apenas um repositório, copie para `.claude/skills` nesse repositório. · [Documentação do Claude Code]({{value:claudeCodeDocsUrl}}) · verificado em {{value:checkedOn}}

### Codex {#codex}

O Codex lê skills de `.agents/skills` — na sua pasta pessoal, para todos os repositórios, ou em um repositório, só para ele.

{{slot:codex}}

O Codex percebe novas skills sozinho. Se elas não aparecerem, reinicie-o. · [Documentação do Codex]({{value:codexDocsUrl}}) · verificado em {{value:checkedOn}}

### Cursor {#cursor}

O Cursor lê skills de `~/.cursor/skills` para todos os projetos, e de `.cursor/skills` em um projeto.

{{slot:cursor}}

O Cursor também lê `~/.agents/skills` e `~/.claude/skills`, então as skills que você já copiou para o Codex ou o Claude Code são reconhecidas sem uma segunda cópia. · [Documentação do Cursor]({{value:cursorDocsUrl}}) · verificado em {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

O Gemini CLI lê as suas próprias skills de `~/.gemini/skills`, e as de um espaço de trabalho de `.gemini/skills`.

{{slot:gemini-cli}}

Execute `gemini skills list` para conferir se foram encontradas. O Gemini CLI também lê `~/.agents/skills`. · [Documentação do Gemini CLI]({{value:geminiCliDocsUrl}}) · verificado em {{value:checkedOn}}

### GitHub Copilot no VS Code {#copilot-vs-code}

O Copilot no VS Code lê as suas skills pessoais de `~/.copilot/skills`, e as de um projeto de `.github/skills`.

{{slot:copilot-vs-code}}

Ele também lê `~/.claude/skills` e `~/.agents/skills`. Nenhuma configuração precisa ser ativada para essas pastas. · [Documentação do GitHub Copilot no VS Code]({{value:copilotDocsUrl}}) · verificado em {{value:checkedOn}}

### OpenCode {#opencode}

O OpenCode lê as suas próprias skills de `~/.config/opencode/skills`, e as de um projeto de `.opencode/skills`.

{{slot:opencode}}

Ele também lê `~/.claude/skills` e `~/.agents/skills`. Execute `opencode debug skill` para ver o que ele encontrou. · [Documentação do OpenCode]({{value:opencodeDocsUrl}}) · verificado em {{value:checkedOn}}

Depois, pergunte ao seu agente quais skills ele tem. {{value:releaseSkills}} aparecem na lista. Outro agente que lê skills `SKILL.md` funciona do mesmo modo: copie as pastas das skills para a pasta de onde ele lê skills.

## Uso {#use}

Digite no seu agente o que está em **Diga**. Troque `ACME-12` pela chave de um item de trabalho do seu próprio projeto.

### `motir-run` {#motir-run}

**Diga**

- `motir run`
- `motir run ACME-12`
- `motir next`

**O que acontece**

Pega o próximo item de trabalho pronto do seu projeto, ou o que você nomear, e o constrói. Primeiro ele arruma o que ficou de execuções anteriores cujos pull requests já foram mesclados, depois reivindica o item de trabalho, o constrói em um branch próprio, abre um pull request e vincula esse pull request ao item de trabalho. Nomeie uma história cujos filhos não tenham filhos próprios e ele executa a história inteira: um branch e um pull request por repositório, com um commit por filho. O `motir next` para depois da reivindicação e imprime o prompt, para você entregá-lo a um agente por conta própria. Um item de trabalho de decisão é a única exceção: ele escreve a página de decisão e a publica para a sua aprovação, sem branch e sem pull request.

**O que você vê no Motir**

O item de trabalho é atribuído a você e passa para Em andamento, depois para Implementado quando o pull request é aberto. A página dele mostra o pull request e uma seção Como testar. O Motir o passa para Em revisão quando o CI passa e para Concluído quando o pull request é mesclado; a skill nunca faz nenhuma das duas coisas.

### `motir-fix` {#motir-fix}

**Diga**

- `motir fix ACME-12`

**O que acontece**

Repara um pull request vermelho depois que a execução que o abriu terminou: as verificações dele falharam, a fila de mesclagem o expulsou ou uma pessoa revisora devolveu o vídeo de aceitação da história com Reexecutar. Primeiro ele reivindica o reparo, para que ninguém mais envie alterações por cima. Depois corrige cada pull request do item de trabalho no branch que ele já tem, nunca em um novo: mescla o branch base, corrige o que a verificação com falha apontou e envia. Ele continua até o CI ficar verde ou até tentar cinco vezes, e grava o vídeo de aceitação de novo quando o CI fica verde depois de um Reexecutar. Ele nunca abre um pull request, nunca mescla um nem muda o status do item de trabalho. Não é o mesmo que `motir fix bugs`, que percorre a pasta Bugs do seu projeto: `motir fix ACME-12` repara os pull requests de um item de trabalho que você nomeia.

**O que você vê no Motir**

Enquanto o reparo roda, a seção Desenvolvimento do item de trabalho diz que ele está sendo corrigido, e por quem. Os mesmos pull requests recebem novos commits, e o Motir avança o item de trabalho sozinho quando as verificações deles passam. Se o reparo desiste, o item de trabalho diz isso e quantas tentativas ele fez.

### `motir-continue` {#motir-continue}

**Diga**

- `motir continue ACME-12`

**O que acontece**

Continua um item de trabalho cuja execução morreu no meio: o notebook foi fechado, o sandbox foi perdido ou o processo foi encerrado. O item de trabalho ainda está Em andamento e o trabalho dele está no branch que essa execução deixou. Primeiro ele reivindica a continuação, para que ninguém mais trabalhe no mesmo branch. Depois faz o checkout desse branch em cada repositório que o item de trabalho abrange, nunca em um novo e nunca redefinindo o que já está lá, e leva o trabalho adiante do ponto em que parou. Ele entrega como uma execução nova: um pull request por repositório, vinculado ao item de trabalho. Use `motir fix ACME-12` quando o item de trabalho já tem um pull request vermelho, e `motir run ACME-12` para um item de trabalho que ninguém começou.

**O que você vê no Motir**

Um item de trabalho cuja execução morreu mostra Execução morreu na seção Desenvolvimento, com o comando `motir continue` para copiar. Enquanto a continuação roda, essa seção diz que ele está sendo continuado, e por quem. Quando ela termina, o item de trabalho avança exatamente como depois de `motir run`: para Implementado, com os pull requests vinculados e uma seção Como testar.

### `motir-log-bug` {#motir-log-bug}

**Diga**

- `motir log bug the export button does nothing on an empty board`

**O que acontece**

Trata o que você digitou como uma afirmação a verificar. Primeiro ele encontra a causa no código, procura um item de trabalho que alguém já tenha registrado e não registra nada se o comportamento se mostrar correto. Caso contrário, registra um bug: sob a história que ele bloqueia, ou na pasta Bugs do seu projeto quando não bloqueia nada.

**O que você vê no Motir**

Um novo item de trabalho do tipo bug, com a causa, o lugar do código em que ela está e como reproduzi-la, vinculado ao item de trabalho em que foi encontrado. Se ele bloqueia o item de trabalho que você está executando, esse item de trabalho passa para Bloqueado.

### `motir-mark` {#motir-mark}

**Diga**

- `motir mark ACME-12 done`

**O que acontece**

Conclui um item de trabalho que nenhum pull request pode concluir: um manual, como criar uma conta, definir um segredo ou mudar uma configuração. Dizê-lo é a sua confirmação de que o trabalho terminou. Ele recusa um item de trabalho que tem um pull request, porque é a mesclagem desse pull request que o conclui.

**O que você vê no Motir**

O item de trabalho passa para Concluído, com um comentário registrando que você o confirmou. O status do item pai decorre dos filhos dele.

### `motir-guide` {#motir-guide}

**Diga**

- `motir guide ACME-12`
- `motir guide`

**O que acontece**

Conduz você por um item de trabalho manual, um passo por vez. Nomeie um, ou diga apenas `motir guide` e ele retoma o seu próprio item inacabado, ou então o próximo item de trabalho manual pronto. Ele dá um passo, com as instruções e qualquer comando para copiar, e espera. Diga que terminou, e ele verifica o que consegue sem alterar nada, como buscar o endereço ou executar um comando somente de leitura, e conta o que viu. Um passo cuja verificação falha não é marcado; você recebe o mesmo passo de novo. Você pode parar em qualquer passo, e `motir guide` retoma de onde você parou. Se o item de trabalho ainda não tem passos, ele propõe alguns a partir da descrição e pergunta a você antes de gravá-los no item de trabalho. Se um passo se mostra errado, ele oferece uma correção e só altera o passo, ou o texto do item de trabalho, quando você diz que sim.

**O que você vê no Motir**

O item de trabalho é atribuído a você e passa para Em andamento. A Lista de tarefas dele marca cada passo quando você o termina, com quem o fez. Quando o último passo é marcado, o item de trabalho passa para Concluído, com um comentário que resume cada passo e como foi confirmado.

### `motir-fix-bugs` {#motir-fix-bugs}

**Diga**

- `motir fix bugs`
- `motir fix bugs 3`

**O que acontece**

Percorre os bugs da pasta Bugs do seu projeto que ainda estão A fazer, um bug por vez, do mais antigo ao mais novo. Os bugs em pastas dentro de Bugs são deixados de lado. Para cada um, ele primeiro confere se o bug é real no seu branch padrão e depois dá a ele exatamente um desfecho. Um bug que ele consegue corrigir recebe um pull request que corrige esse bug e nada além dele. Um bug que espera outro item de trabalho ainda não concluído é vinculado a esse item de trabalho e movido para a mesma história. Um bug que ele não consegue corrigir aqui recebe um comentário e é posto de lado: já corrigido, com o que o corrigiu; impossível de reproduzir, com o que ele executou; ou precisa da sua decisão, com a pergunta e a recomendação. Todo desfecho tira o bug de A fazer, então a execução termina sozinha. Acrescente um número e ele para depois de tantos bugs. Termina com um relatório que lista primeiro os bugs que esperam por você.

**O que você vê no Motir**

Um bug corrigido passa para Implementado com o pull request vinculado, e para Concluído quando você o mescla. Um bug que espera outro trabalho passa para Bloqueado, com um vínculo bloqueado por esse item de trabalho. Um bug já corrigido passa para Concluído. Um que ele não consegue reproduzir, ou que precisa da sua decisão, passa para Bloqueado. Cada um desses tem um comentário com a evidência ou a pergunta. Responda à pergunta e mova o bug de volta para A fazer, e a próxima execução o retoma.

## Quando um item de trabalho está errado {#wrong}

Às vezes um item de trabalho não pode ser construído como foi escrito. Ele pode pedir algo que não existe, precisar de um design que ninguém desenhou ou alcançar dois repositórios. O `motir-run` não tenta adivinhar um jeito de contornar isso. Ele passa o item de trabalho para **Em planejamento**, para que nenhuma outra execução o pegue, e pede ao planejador de IA do Motir que planeje a correção. Depois para. O plano espera que você o revise e aprove no Motir, e nada é construído até que você o faça.

Se o seu token não pode usar o planejamento com IA, ou os seus créditos de IA acabaram, ele para do mesmo jeito. Deixa um comentário no item de trabalho com a correção inteira e diz por que não pôde entregá-la.

## Atualização {#updating}

Uma nova versão tem uma nova tag, e esta página passa para ela. Para uma instalação por cópia, execute de novo o passo de instalação do seu agente: ele sobrescreve as pastas das skills no lugar. No Claude Code, um marketplace não pode ser adicionado de novo em outra tag, então remova-o, adicione-o na nova tag e instale o plugin de novo:

{{slot:update}}

Reinicie o seu agente depois, para que ele leia as novas versões.
