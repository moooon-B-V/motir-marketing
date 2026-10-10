---
source: 758198e00644
---

O plugin do Motir para o Claude Code coloca o seu projeto do Motir dentro do Claude Code com uma única instalação: as skills do Motir, o servidor MCP e um executor para a CLI. Ele entra com a sua conta do Motir no navegador, então não há token. Diga `motir run` e o Claude Code pega o próximo item de trabalho pronto, o constrói e abre um pull request vinculado.

O plugin é publicado em [{{value:skillsRepo}}]({{value:repoUrl}}), que também é um marketplace de plugins do Claude Code. Todos os comandos desta página instalam a versão [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Antes de começar {#before}

Você precisa do Claude Code, de uma conta do Motir com acesso ao projeto e do `git`. O executor precisa do Node.js 22 ou mais recente, e as skills que abrem ou leem pull requests precisam da CLI do GitHub (`gh`).

## Instalação {#install}

Adicione o marketplace na tag da versão e depois instale o plugin. Execute os dois no Claude Code.

{{slot:install}}

## O que ele traz {#brings}

- **As sete skills.** Todas as skills da versão, listadas sob o nome do plugin.
- **O servidor MCP do Motir.** O Claude Code entra nele pelo navegador na primeira vez que ele é usado: execute `/mcp`, escolha `motir` e selecione _Authenticate_, depois escolha o espaço de trabalho e aprove na tela de consentimento do Motir. Não há token para criar nem colar.
- **O executor `motir`.** Executa a Motir CLI fixada com `npx`, então nada é instalado globalmente. Ele precisa do Node.js 22 ou mais recente, e a CLI entra por conta própria com `motir login`.

## Confirme que funcionou {#check}

Para confirmar: `/plugin` mostra `motir` em `{{value:releaseVersion}}`, e `/mcp` lista `motir`. As skills de um plugin aparecem sob o nome do plugin, por exemplo `/motir:motir-run`.

## Use {#use}

Diga o que você quer no Claude Code. O comportamento completo de cada skill, e o que você verá no Motir, está no guia [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Atualização {#updating}

Um marketplace adicionado em uma versão não pode ser adicionado de novo em outra, então remova-o primeiro. Removê-lo desinstala o plugin, e a última linha o instala de novo na nova versão.

{{slot:update}}

Usa outro agente, ou quer apenas o conector? Veja o guia [{{value:skillsPage}}](/docs/skills) para todos os agentes, ou o [{{value:connectorPage}}](/docs/claude-code-connector).
