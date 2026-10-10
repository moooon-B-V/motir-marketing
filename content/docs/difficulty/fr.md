---
source: 46869c4914a3
---

Une tâche, une sous-tâche ou un bug peut porter une **difficulté** : la quantité de réflexion que le travail exige, et non sa quantité. Les story points et les estimations mesurent la taille. La difficulté dit à quel point le travail est difficile à bien faire : une modification d’une seule ligne sur l’ordre des verrous peut donc être `high`, alors qu’un grand renommage mécanique est `trivial`.

Motir indique la difficulté d’un élément de travail dans le prompt qu’il remet à votre agent. Motir ne choisit pas le modèle à votre place : servez-vous des niveaux ci-dessous pour décider sur quel modèle exécuter chaque élément de travail. Les Epics et les Stories ne portent pas de difficulté.

## Les quatre niveaux {#the-four-levels}

- **`trivial`** — Un travail mécanique, à la spécification sans ambiguïté et sans jugement à porter. Le changement est entièrement décrit par l’élément de travail. Par exemple : un renommage, une modification de texte, un changement de configuration, une montée de version.
- **`low`** — Un travail courant qui suit un schéma que la base de code possède déjà. Il faut un peu de lecture, mais la bonne réponse est claire une fois trouvée. Par exemple : un nouveau champ dans un formulaire existant, un endpoint construit comme ses voisins, un bug circonscrit avec une reproduction claire.
- **`medium`** — Un travail qui comporte de vrais choix de conception : plusieurs fichiers ou services, des compromis à peser, ou une spécification qui laisse place à l’interprétation. Par exemple : une fonctionnalité qui traverse l’API et l’interface, un refactoring avec des appelants à migrer, un bug dont la cause n’est pas encore connue.
- **`high`** — Un travail où une erreur subtile coûte cher : concurrence, sécurité, migrations de données, authentification, ou une conception sans précédent à suivre. Par exemple : l’ordre des verrous, un changement du modèle de permissions, une migration de schéma sur des données en production, un nouveau sous-système.

Quand aucune difficulté n’est définie, traitez l’élément de travail comme `medium`. Un niveau non défini signifie que personne ne l’a encore évalué, et ce n’est pas une raison de l’envoyer au modèle le moins cher.

## Modèles suggérés pour chaque niveau {#models}

Chaque niveau liste ses candidats par ordre. Prenez le premier que votre projet est autorisé à utiliser. Le tableau indique le prix de chaque modèle par million de tokens (entrée / sortie), son score sur deux benchmarks de code, et ce qu’a coûté une tâche sur SWE-rebench. Ce benchmark utilise des tâches récentes sur lesquelles un modèle n’a pas pu s’entraîner, de sorte que son coût par tâche est le chiffre public le plus proche de ce que coûtera l’une de vos sous-tâches.

### `trivial` · environ {{value:costRangeTrivial}} par tâche {#level-trivial}

{{slot:trivial}}

### `low` · environ {{value:costRangeLow}} par tâche {#level-low}

{{slot:low}}

### `medium` · environ {{value:costRangeMedium}} par tâche {#level-medium}

{{slot:medium}}

### `high` · environ {{value:costRangeHigh}} et plus par tâche {#level-high}

{{slot:high}}

Un coût marqué ≈ n’a pas été mesuré. Il part d’un modèle mesuré de la même famille et le met à l’échelle selon la différence de prix du token. Un tiret signifie qu’aucun score ni coût public n’existe encore.

## Lire les chiffres {#reading-the-numbers}

- **Les deux benchmarks ne s’accordent pas, donc aucun ne tranche seul.** SWE-bench Pro couvre plus de modèles, mais on sait qu’environ 30 % de ses tâches publiques sont défectueuses. SWE-rebench est plus difficile à contourner, et c’est la raison pour laquelle DeepSeek V4 Pro et GPT-5.6 Luna figurent dans `trivial` : tous deux obtiennent de 15 à 19 points de moins sur ses tâches récentes.
- **Comparez le coût par tâche terminée, pas le prix par token.** Un modèle moins cher qui échoue et doit être relancé coûte plus qu’un modèle plus fort qui réussit du premier coup. GPT-5.6 Sol et Claude Sonnet 5 coûtent la même chose par token, mais Sol a terminé plus de tâches pour un coût par tâche plus faible.
- **Montez d’un niveau quand une exécution échoue.** Si les vérifications d’un élément de travail échouent ou si sa revue est refusée, relancez-le au niveau supérieur plutôt que sur le même modèle.
- **Vérifiez où vos données peuvent aller.** Tous les fournisseurs ne peuvent pas être utilisés pour tous les projets. Consultez [Fournisseurs de modèles](/legal/model-providers) pour savoir comment chacun traite le contenu qui lui est envoyé.

## Actualité de ces données {#how-current-this-is}

Les prix et les scores de cette page ont été relevés le {{value:asOf}}. Les prix des tokens proviennent de la passerelle de modèles de Motir, qui les actualise depuis OpenRouter ; Claude Opus 5.5 a été ajouté directement depuis OpenRouter parce qu’il est sorti après la dernière actualisation de la passerelle. Les modèles changent tous les quelques mois : considérez les candidats comme un point de départ et gardez ceux qui terminent vos propres éléments de travail.

- [Classement SWE-bench Pro (BenchLM, 22 septembre 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [Classement SWE-rebench (tâches du 15 mai au 1er juillet 2026)](https://swe-rebench.com/)
