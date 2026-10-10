---
source: cdc9936762b4
---

Um sandbox é um contêiner que você inicia na sua própria máquina, com o seu próprio agente, a Motir CLI e os seus checkouts — e nada mais. Você traz a sua própria credencial de agente, montada como somente leitura; o ciclo roda lá dentro, então um agente que se comporta mal alcança a sua árvore de trabalho e não o resto da sua máquina.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Antes de começar {#before-you-start}

- **Docker, em execução.** Compilado para `linux/amd64` **e** `linux/arm64`, então o Apple Silicon é uma máquina de primeira classe e nada é emulado. Não há etapa de build — você faz o pull.
- **O login do seu próprio agente, nesta máquina.** O ponto de montagem da credencial dele é somente leitura, então o contêiner pode usar um login, mas não pode renová-lo. O Claude Code no macOS é a exceção que você vai encontrar: ele guarda o token no Keychain de login, então não há arquivo para montar, e você entra no `claude` **dentro** do contêiner — a imagem dá a ele um diretório de configuração gravável, e é ali que o login fica. (O Antigravity é igual — o passo 2 avisa quando você o escolhe.)
- **A raiz do seu espaço de trabalho — a pasta que CONTÉM os seus checkouts.** Um projeto costuma abranger vários repositórios, e o ciclo roda em todos eles.

{{slot:workspace}}

{{part:picker-label}}

Qual agente você usa?

{{part:picker-also-supported}}

também compatíveis

{{part:picker-or}}

ou

{{part:picker-base}}

nenhum agente (base)

{{part:picker-summary}}

Todos os comandos abaixo são para **{{value:profileLabel}}**. Trocar reescreve a tag e o ponto de montagem da credencial nos **passos 1, 2 e 2b** — os três lugares em que eles aparecem.

{{part:chip-command}}

Comando

{{part:chip-editor}}

No seu editor

{{part:steps-intro}}

## Configure {#set-it-up}

Cinco passos. Cada um é uma única coisa a fazer.

{{part:step-1-intent}}

Faça o pull da imagem do seu agente

{{part:step-1-body}}

Não há etapa de build — a imagem é publicada por perfil de agente.

{{part:step-2-intent}}

Inicie o contêiner a partir da raiz do seu espaço de trabalho

{{part:step-2-body}}

Execute a partir da pasta que **contém** os seus checkouts, não de um deles.

{{part:step-2-vscode}}

**Prefere usar o VS Code?** Os passos 2a a 2c abaixo substituem este. Tudo o que vem depois é igual nos dois casos.

{{part:step-2a-intent}}

Instale a extensão Dev Containers

{{part:step-2a-body}}

Pela visualização Extensions ou pela paleta de comandos — ⇧⌘P no macOS, Ctrl+Shift+P nos outros sistemas, F1 nos três — e depois _Extensions: Install Extensions_. Dois destes três passos acontecem na paleta, então vale a pena fixá-la agora.

{{part:step-2b-intent}}

Crie a configuração do contêiner de desenvolvimento

{{part:step-2b-body}}

Execute isto na pasta que você está montando. Uma única colagem: ela cria a pasta `.devcontainer` e grava o arquivo dentro dela. Não tente criá-los por um seletor de arquivos — o Finder e a maioria dos seletores gráficos recusam um nome que começa com ponto, e o recusam sem dizer por quê.

{{part:step-2b-warning}}

**Um contêiner de desenvolvimento mantém a imagem a partir da qual foi criado.** O `--pull=always` pertence ao comando de execução do passo 2, não a este caminho. Para passar à imagem e à CLI `motir` atuais: **1.** execute o `{{value:dockerPull}}` do passo 1 em um terminal na sua máquina; **2.** _Dev Containers: Open Folder in Container…_ nesta pasta, o que anexa a janela; **3.** _Dev Containers: Rebuild Container_, que recria o contêiner a partir da imagem que você acabou de baixar. O Rebuild Container só aparece em uma janela anexada ao contêiner, e é por isso que o passo 2 vem primeiro. Uma reconstrução mantém o seu login no Motir (ele fica no volume `{{value:authVolume}}`), mas não um login no Claude Code feito dentro do contêiner — execute `claude` e entre de novo.

{{part:step-2c-intent}}

Abra a pasta no contêiner

{{part:step-2c-body}}

Paleta de comandos → _Dev Containers: Open Folder in Container…_, e escolha a pasta em que você acabou de gravar o arquivo. O terminal dele é o mesmo shell em que o passo 2 teria deixado você — continue no passo 3.

{{part:step-3-intent}}

Entre, dentro do contêiner

{{part:step-3-body}}

Um código e uma URL são impressos; aprove em qualquer navegador. O login fica no volume `{{value:authVolume}}`, então você faz isso uma única vez.

{{part:step-4-intent}}

Vincule a pasta ao seu projeto

{{part:step-4-body}}

Troque `ACME` pela chave do seu projeto. Se o seu espaço de trabalho tem exatamente um projeto, omita a flag — esse é o passo inteiro.

{{part:step-5-intent}}

Verifique — tudo verde é o fim desta página

{{part:step-5-body}}

Autenticação, vínculo, o binário do agente e a credencial dele. Esta é a única coisa que diz se o contêiner realmente recebeu o que você passou a ele.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

O OpenCode guarda configuração e credenciais em dois lugares, então usa duas linhas `-v`. As duas são necessárias.

{{part:note-antigravity}}

O Antigravity guarda o token no chaveiro do sistema operacional, que não tem um arquivo portátil para montar — então não há linha `-v` para ele, e você entra DENTRO do contêiner em vez de antes de começar. Este é o único perfil para o qual a segunda condição prévia acima não se aplica.

{{part:note-aider}}

A credencial do Aider é uma chave de API de modelo que ele lê do ambiente, então este é o único perfil que acrescenta uma linha `-e`. O ponto de montagem é um ARQUIVO, que precisa existir — mesmo vazio — ou o docker cria um diretório no lugar dele.

{{part:note-base}}

A imagem base traz a Motir CLI e nenhum agente — nada para montar e nada em que entrar além do próprio Motir.

{{part:devcontainer-file}}

### O arquivo que esse comando grava {#devcontainer-file}

Referência, não um passo — o 2b já o gravou. Ele está aqui para quem prefere criar o arquivo à mão, e porque as aspas em volta de `<<’JSON’` são essenciais: elas impedem que o seu shell expanda `${localWorkspaceFolder}` e `${localEnv:HOME}` antes de chegarem ao arquivo. Essas são substituições do Dev Containers, e é o editor que as resolve.

{{part:why}}

## Por que ele é assim {#why}

### O que o seletor de perfil muda {#profile-picker}

Escolher um agente reescreve três coisas e nada além delas: a **tag** da imagem, a(s) linha(s) `-v` da credencial e os campos `image`, `name` e `mounts` do contêiner de desenvolvimento. É um controle, e não um parágrafo mandando você trocá-las por conta própria, porque todo comando aqui tem um botão Copiar e quem copia é quem não leu a instrução de troca.

Nem todo perfil tem um único diretório de credencial. O `opencode` guarda dois e usa duas linhas `-v`; o `antigravity` guarda o token no chaveiro do sistema operacional e não usa nenhuma, entrando dentro do contêiner; e o `aider` monta um arquivo e lê uma chave de modelo do ambiente. Os passos avisam quando você escolhe esses perfis.

### No comando de execução, nada é mantido que possa ficar desatualizado {#run-command}

O `--pull=always` busca a imagem atual a cada início, então uma tag de perfil que mudou chega até você sem que você precise notar que ela mudou, e o `--rm` faz com que nada seja mantido que possa ficar desatualizado. Não existe um caminho separado de voltar a ele depois — que é exatamente o que antes deixava as pessoas rodando um `motir` meses mais velho que a página de onde o liam. O seu login sobrevive a tudo isso: ele é gravado no volume `{{value:authVolume}}`, que fica fora do contêiner, então você entra uma vez e toda execução seguinte o reaproveita — saia de vez com `{{value:signOutCommand}}`. Trabalhando offline? Remova o `--pull=always`: ele acessa o registro a cada início, então, sem rede, a execução falha em vez de recorrer à imagem que você já tem. Tudo isso vale para o comando de execução. Um contêiner de desenvolvimento (passos 2a a 2c) mantém a imagem a partir da qual foi criado até você fazer o pull, anexar com _Dev Containers: Open Folder in Container…_ e escolher _Dev Containers: Rebuild Container_.

### O que vem a seguir {#what-next}

O `motir run` recebe um ESCOPO — um item de trabalho, uma história inteira ou `sprint` para o ativo. O `motir auto`, em vez disso, esvazia o conjunto de itens prontos sem supervisão, um item por vez em um branch de sessão. Todas as flags que os dois aceitam estão na página [{{value:cliPage}}](/docs/cli).

## O que ele confina — e o que não confina {#confines}

Vale ler antes de depender dele, porque um destes três é uma exceção, não uma garantia.

- **Sistema de arquivos — confinado.** As únicas superfícies do host dentro do contêiner são um `/workspace` gravável e a credencial do seu agente, montada como somente leitura. Nenhum socket do Docker, nenhum outro bind do host.
- **Rede — ABERTA, de propósito.** Todo agente precisa da API do seu provedor e todo item de trabalho despachado precisa de remotes do git, então a imagem confina o raio de alcance do sistema de arquivos, e não a saída de rede. Se o seu modelo de ameaças exige mais, use os controles de rede do próprio Docker — o contêiner não impedirá um agente de falar com a internet.
- **Privilégios — sem privilégios.** Ele roda como o usuário `node` (uid 1000), então os arquivos gravados no ponto de montagem continuam pertencendo a você, e não ao root.

## O que o ambiente oferece {#environment}

- **Sua pasta, montada.** `$PWD` vira `/workspace`, então os checkouts em que a execução trabalha são seus e os commits que ela faz estão no seu disco quando ela termina.
- **Um checkout por item de trabalho, em um git worktree.** Uma execução não edita a árvore em que você está; ela adiciona um worktree por item, de modo que execuções paralelas não colidem no checkout de um branch.
- **A sua credencial de agente, SOMENTE LEITURA.** O diretório de credencial do perfil é montado por bind com `:ro`. Nada no contêiner pode reescrevê-lo, e nada sobre ele é enviado ao Motir — isto é traga-sua-própria-chave, então a conta do agente é sua e a chamada de API nunca passa por nós.
- **A CLI, pré-instalada.** A imagem traz o `motir` e o binário do agente que a tag nomeia, então não há nada a instalar antes da primeira execução.
- **A saída do seu agente fica local por padrão.** Apenas o ciclo de vida da execução chega ao Motir. Passar `--report-log` envia, além disso, o final da saída, para que uma execução com falha a mostre na página da execução; isso fica DESLIGADO a menos que você peça, e o conteúdo dos arquivos, os caminhos e os diffs nunca são enviados, em nenhum dos casos.

## O que o token pode fazer — e o que ele recusa {#token}

Um token gerado por `motir login` carrega uma concessão fixa e restrita. A tela de aprovação a mostra e não pode alterá-la — nem para mais, nem para menos, porque uma concessão restringida à mão quebra um ciclo sem supervisão no meio do caminho.

{{slot:grant}}

**A que ele NÃO carrega é `ai:view_plan`, e a recusa que se segue é o design, não um defeito.** Abrir um plano exige apenas `work_item:edit`, então uma execução em sandbox PODE abrir um — e é recusada no primeiro acréscimo, porque essa é a chave que o acréscimo de propostas verifica. Uma execução que realiza um item de trabalho não pode remodelar o plano que recebeu. Quando você encontrar essa recusa, o agente fez a coisa certa: ele registra a correção como um comentário, deixa o item bloqueado e para. Nada se perde, e uma pessoa decide o que o plano deve dizer.

Duas flags restringem isso ainda mais quando você quer uma execução mais silenciosa: `--disable-log-bug` impede o agente de registrar um bug para um defeito que encontra em outro lugar (ele comenta em vez disso), e `--disable-replan` impede que ele envie um novo planejamento para um item de trabalho que considera errado (ele comenta e para). Apenas no `motir auto`, `--auto-approve-replan` vai no sentido oposto: ele aprova um novo planejamento enviado e continua o ciclo, em vez de parar para você.

## O que uma execução produz e onde lê-lo {#produces}

- **Um branch e um pull request** em cada repositório em que o item é entregue, enviados com as suas credenciais do git de dentro do contêiner.
- **Um vínculo no item de trabalho.** A execução declara qual item cada pull request entrega, então mesclá-lo move o item. Esse vínculo é o que o painel Desenvolvimento da página do item mostra, e é o que conclui o item na mesclagem — não o nome do branch nem o título.
- **O status, conforme avança.** O item passa para Em andamento quando a execução o reivindica e para Implementado quando o pull request é aberto. Em revisão é gravado pelo CI quando as verificações ficam verdes, e Concluído, pela mesclagem.
- **O terminal.** A saída do próprio agente fica no seu terminal, a menos que você tenha passado `--report-log`.

## Quando não funciona {#troubleshooting}

### O binário do agente não é encontrado {#agent-binary-not-found}

A tag e o agente não combinam. Confira qual perfil você iniciou, ou aponte a execução para outro binário com `--agent <cmd>`. O `motir doctor` informa isso antes que uma execução gaste uma reivindicação com ele.

### O agente inicia e não está autenticado {#agent-not-authenticated}

O ponto de montagem da credencial está faltando ou aponta para o diretório errado — cada perfil monta o seu. Execute de novo a linha `{{value:dockerRun}}` para a tag que você realmente baixou.

### Nada está pronto para executar {#nothing-ready}

Todo candidato tem uma dependência não atendida. O `motir ready` mostra o conjunto; o `motir show` em um item de trabalho informa o que o bloqueia. Despachar mesmo assim é `--force`, apenas um item.

### A execução para em um novo planejamento enviado {#stopped-on-replan}

O agente julgou o item de trabalho errado e propôs uma forma corrigida. Essa é a parada prevista: leia o plano no Motir e aprove ou recuse. Para manter um ciclo sem supervisão em andamento, execute o `motir auto` com `--auto-approve-replan`.

### Uma execução deixou trabalho para trás depois de terminar {#work-left-behind}

Os worktrees e branches estão no seu disco, na pasta que você montou — um contêiner que parou não os levou com ele. O `motir done` conclui um item mesclado, ou todo um branch de sessão mesclado com `--session <branch>`.

## O que esta página não cobre {#not-covered}

Todos os comandos e todas as flags — isso é a [{{value:cliPage}}](/docs/cli), que é gerada a partir do catálogo da própria CLI e não pode se afastar dele. Conectar um agente ao Motir diretamente, sem a CLI, é o [{{value:mcpPage}}](/docs/mcp). Conduzir o mesmo ciclo de trabalho por HTTP, em vez de um terminal, é a [{{value:apiPage}}](/docs/api). Executar o sandbox em qualquer lugar que não seja a sua própria máquina ainda não está documentado aqui. (O caminho do VS Code ESTÁ documentado, acima — esta cláusula dizia o contrário, e registrava como decisão uma seção que havia sido excluída.)
