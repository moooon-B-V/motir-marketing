---
source: 46869c4914a3
---

Uma tarefa, subtarefa ou bug pode ter uma **dificuldade**: quanto raciocínio o trabalho exige, não quanto trabalho existe. Pontos de história e estimativas medem o tamanho. A dificuldade diz o quanto é difícil fazer o trabalho direito, de modo que uma mudança de uma linha na ordem de bloqueios pode ser `high`, enquanto uma renomeação grande e mecânica é `trivial`.

O Motir informa a dificuldade de um item de trabalho no prompt que entrega ao seu agente. O Motir não escolhe o modelo por você: use os níveis abaixo para decidir em qual modelo executar cada item de trabalho. Épicos e histórias não têm dificuldade.

## Os quatro níveis {#the-four-levels}

- **`trivial`** — Trabalho mecânico, com uma especificação inequívoca e nenhuma decisão de julgamento. A mudança é totalmente descrita pelo item de trabalho. Por exemplo: renomear algo, alterar um texto, virar uma chave de configuração, atualizar uma versão.
- **`low`** — Trabalho de rotina, que segue um padrão que a base de código já tem. É preciso ler um pouco, mas a resposta certa fica clara depois de encontrada. Por exemplo: um novo campo em um formulário existente, um endpoint parecido com os vizinhos, um bug restrito com reprodução clara.
- **`medium`** — Trabalho com escolhas reais de design: vários arquivos ou serviços, compromissos a ponderar ou uma especificação que deixa espaço para interpretação. Por exemplo: um recurso que atravessa a API e a interface, uma refatoração com chamadores a migrar, um bug cuja causa ainda não se conhece.
- **`high`** — Trabalho em que um erro sutil custa caro: concorrência, segurança, migrações de dados, autenticação ou um design sem precedente a seguir. Por exemplo: ordem de bloqueios, uma mudança no modelo de permissões, uma migração de esquema em dados em produção, um novo subsistema.

Quando nenhuma dificuldade está definida, trate o item de trabalho como `medium`. Um nível indefinido significa que ninguém o avaliou ainda, e isso não é motivo para enviá-lo ao modelo mais barato.

## Modelos sugeridos para cada nível {#models}

Cada nível lista seus candidatos em ordem. Use o primeiro que o seu projeto tem permissão para usar. A tabela mostra o preço de cada modelo por milhão de tokens (entrada / saída), sua pontuação em dois benchmarks de programação e quanto custou uma tarefa no SWE-rebench. Esse benchmark usa tarefas novas, com as quais um modelo não pode ter sido treinado, então o custo por tarefa dele é o número público mais próximo do que uma das suas subtarefas vai custar.

### `trivial` · cerca de {{value:costRangeTrivial}} por tarefa {#level-trivial}

{{slot:trivial}}

### `low` · cerca de {{value:costRangeLow}} por tarefa {#level-low}

{{slot:low}}

### `medium` · cerca de {{value:costRangeMedium}} por tarefa {#level-medium}

{{slot:medium}}

### `high` · cerca de {{value:costRangeHigh}} ou mais por tarefa {#level-high}

{{slot:high}}

Um custo marcado com ≈ não foi medido. Ele parte de um modelo medido da mesma família e o escala pela diferença no preço do token. Um traço significa que ainda não existe pontuação nem custo público.

## Como ler os números {#reading-the-numbers}

- **Os dois benchmarks discordam, então nenhum decide sozinho.** O SWE-bench Pro cobre mais modelos, mas cerca de 30% das suas tarefas públicas são conhecidas por estarem quebradas. O SWE-rebench é mais difícil de manipular, e é por isso que o DeepSeek V4 Pro e o GPT-5.6 Luna ficam em `trivial`: ambos pontuam de 15 a 19 pontos a menos nas tarefas novas dele.
- **Compare o custo por tarefa concluída, não o preço por token.** Um modelo mais barato que falha e precisa ser executado de novo custa mais do que um mais forte que acerta de primeira. O GPT-5.6 Sol e o Claude Sonnet 5 custam o mesmo por token, mas o Sol concluiu mais tarefas com um custo menor por tarefa.
- **Suba um nível quando uma execução falhar.** Se as verificações de um item de trabalho falharem ou a revisão for recusada, execute-o de novo no nível seguinte, e não no mesmo modelo.
- **Verifique para onde seus dados podem ir.** Nem todo provedor pode ser usado em todo projeto. Veja [Provedores de modelos](/legal/model-providers) para saber como cada um trata o conteúdo que recebe.

## Quão atual isto é {#how-current-this-is}

Os preços e as pontuações desta página foram lidos em {{value:asOf}}. Os preços dos tokens vêm do gateway de modelos do Motir, que os atualiza a partir do OpenRouter; o Claude Opus 5.5 foi adicionado diretamente do OpenRouter porque foi lançado depois da última atualização do gateway. Os modelos mudam a cada poucos meses, então trate os candidatos como um ponto de partida e fique com os que concluem os seus próprios itens de trabalho.

- [Ranking do SWE-bench Pro (BenchLM, 22 de setembro de 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [Ranking do SWE-rebench (tarefas de 15 de maio a 1º de julho de 2026)](https://swe-rebench.com/)
