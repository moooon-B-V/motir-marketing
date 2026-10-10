---
source: 38ac3b50e511
---

Les skills de Motir permettent à l’agent que vous utilisez déjà de travailler sur votre projet Motir. Dites `motir run` et il prend le prochain élément de travail prêt, le réalise et ouvre une pull request liée. Dites `motir log bug` et il vérifie le défaut et le consigne là où il doit l’être. Dites `motir mark` et il clôt un élément de travail manuel une fois que vous l’avez accompli. Dites `motir guide` et il vous guide à travers un élément de travail manuel, une étape à la fois.

Ce sont des [Agent Skills](https://agentskills.io) ordinaires : un dossier par skill, chacun avec un `SKILL.md`, publiés dans [{{value:skillsRepo}}]({{value:repoUrl}}). Chaque commande de cette page installe la version [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Avant de commencer {#before}

Les skills dialoguent avec Motir par son serveur MCP. Dans Claude Code, le plugin le connecte pour vous : vous vous connectez avec votre compte Motir dans le navigateur, sans aucun token. Tout autre agent a besoin que ce serveur soit d’abord connecté — un projet Motir, un token d’accès personnel, et la configuration de votre agent décrite dans le guide [{{value:mcpPage}}](/docs/mcp), qui couvre aussi la voie par token dans Claude Code si vous ne pouvez pas utiliser la connexion par le navigateur. Un token avec les permissions par défaut peut tout faire de ce que font ces skills. Il vous faut aussi `git`, et la GitHub CLI (`gh`) pour les skills qui ouvrent ou lisent des pull requests.

## Installer {#install}

Choisissez votre agent. Chaque section installe tous les skills de la version pour chaque projet de votre machine. Les commandes de terminal sont prévues pour macOS et Linux : elles récupèrent la version, copient les dossiers des skills dans le dossier que lit cet agent, et suppriment le téléchargement.

### Claude Code {#claude-code}

Le dépôt est aussi une place de marché de plugins Claude Code. Ajoutez-la au tag de la version, puis installez le plugin. Une seule installation apporte les skills, le serveur MCP de Motir et un lanceur pour sa CLI, et connecte Motir sans token.

- **Les sept skills.** Chaque skill de la version, listé sous le nom du plugin.
- **Le serveur MCP de Motir.** Claude Code s’y connecte dans le navigateur à la première utilisation : exécutez `/mcp`, choisissez `motir` puis _Authenticate_, puis sélectionnez l’espace de travail et approuvez sur l’écran de consentement de Motir. Il n’y a aucun token à créer ni à coller. [Ajouter Motir à Claude](/docs/mcp#claude)
- **Le lanceur `motir`.** Exécute la Motir CLI épinglée avec `npx`, sans rien installer globalement. Il exige Node.js 22 ou plus récent, et la CLI se connecte d’elle-même avec `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Pour vérifier : `/plugin` affiche `motir` à la version `{{value:releaseVersion}}`, et `/mcp` liste `motir`. Les skills d’un plugin sont listés sous le nom du plugin, par exemple `/motir:motir-run`. Copier les skills n’apporte que les skills — connectez vous-même le serveur MCP, comme pour les autres agents. Pour un seul dépôt, copiez plutôt dans `.claude/skills` de ce dépôt. · [Documentation de Claude Code]({{value:claudeCodeDocsUrl}}) · vérifié le {{value:checkedOn}}

### Codex {#codex}

Codex lit les skills dans `.agents/skills` — dans votre dossier personnel pour tous les dépôts, ou dans un dépôt pour ce dépôt seul.

{{slot:codex}}

Codex remarque seul les nouveaux skills. S’ils n’apparaissent pas, redémarrez-le. · [Documentation de Codex]({{value:codexDocsUrl}}) · vérifié le {{value:checkedOn}}

### Cursor {#cursor}

Cursor lit les skills dans `~/.cursor/skills` pour tous les projets, et dans `.cursor/skills` au sein d’un projet.

{{slot:cursor}}

Cursor lit aussi `~/.agents/skills` et `~/.claude/skills` : les skills que vous avez déjà copiés pour Codex ou Claude Code sont donc repris sans seconde copie. · [Documentation de Cursor]({{value:cursorDocsUrl}}) · vérifié le {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI lit vos propres skills dans `~/.gemini/skills`, et ceux d’un espace de travail dans `.gemini/skills`.

{{slot:gemini-cli}}

Exécutez `gemini skills list` pour vérifier qu’ils ont été trouvés. Gemini CLI lit aussi `~/.agents/skills`. · [Documentation de Gemini CLI]({{value:geminiCliDocsUrl}}) · vérifié le {{value:checkedOn}}

### GitHub Copilot dans VS Code {#copilot-vs-code}

Copilot dans VS Code lit vos skills personnels dans `~/.copilot/skills`, et ceux d’un projet dans `.github/skills`.

{{slot:copilot-vs-code}}

Il lit aussi `~/.claude/skills` et `~/.agents/skills`. Aucun réglage n’est à activer pour ces dossiers. · [Documentation de GitHub Copilot dans VS Code]({{value:copilotDocsUrl}}) · vérifié le {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode lit vos propres skills dans `~/.config/opencode/skills`, et ceux d’un projet dans `.opencode/skills`.

{{slot:opencode}}

Il lit aussi `~/.claude/skills` et `~/.agents/skills`. Exécutez `opencode debug skill` pour voir ce qu’il a trouvé. · [Documentation d’OpenCode]({{value:opencodeDocsUrl}}) · vérifié le {{value:checkedOn}}

Interrogez ensuite votre agent sur les skills qu’il possède. {{value:releaseSkills}} sont listés. Tout autre agent qui lit des skills `SKILL.md` fonctionne de la même façon : copiez les dossiers des skills dans le dossier où il lit ses skills.

## Utiliser {#use}

Saisissez dans votre agent ce qui figure sous **Dites**. Remplacez `ACME-12` par la clé d’un élément de travail de votre propre projet.

### `motir-run` {#motir-run}

**Dites**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Ce qui se passe**

Prend le prochain élément de travail prêt de votre projet, ou celui que vous nommez, et le réalise. Il commence par faire le ménage après les exécutions précédentes dont les pull requests ont été fusionnées, puis prend l’élément de travail, le réalise sur une branche à lui, ouvre une pull request et la lie à l’élément de travail. Nommez une Story dont les enfants n’ont pas d’enfants, et il exécute toute la Story : une branche et une pull request par dépôt, avec un commit par enfant. `motir next` s’arrête après la prise en charge et affiche le prompt, que vous remettez vous-même à un agent. Un élément de travail de décision est la seule exception : il écrit la page de décision et la publie pour votre approbation, sans branche et sans pull request.

**Ce que vous voyez dans Motir**

L’élément de travail vous est assigné et passe à En cours, puis à Implémenté une fois sa pull request ouverte. Sa page affiche la pull request et une section Comment tester. Motir le passe à En revue quand la CI réussit et à Terminé quand la pull request est fusionnée ; le skill ne fait jamais ni l’un ni l’autre.

### `motir-fix` {#motir-fix}

**Dites**

- `motir fix ACME-12`

**Ce qui se passe**

Répare une pull request en échec après la fin de l’exécution qui l’a ouverte : ses vérifications ont échoué, la file de fusion l’a rejetée, ou un relecteur a renvoyé la vidéo de recette de la Story avec Réexécuter. Il commence par prendre en charge la réparation, afin que personne d’autre ne pousse par-dessus. Il corrige ensuite chaque pull request de l’élément de travail sur la branche qu’elle a déjà, jamais sur une nouvelle : il fusionne la branche de base, corrige ce que la vérification en échec a désigné, et pousse. Il continue jusqu’à ce que la CI soit au vert ou qu’il ait essayé cinq fois, et il enregistre de nouveau la vidéo de recette une fois la CI au vert après un Réexécuter. Il n’ouvre jamais de pull request, n’en fusionne jamais et ne change jamais le statut de l’élément de travail. À ne pas confondre avec `motir fix bugs`, qui parcourt le dossier Bugs de votre projet : `motir fix ACME-12` répare les pull requests d’un seul élément de travail que vous nommez.

**Ce que vous voyez dans Motir**

Pendant la réparation, la section Développement de l’élément de travail indique qu’il est en cours de correction, et par qui. Les mêmes pull requests reçoivent de nouveaux commits, et Motir fait avancer l’élément de travail de lui-même une fois leurs vérifications réussies. Si la réparation abandonne, l’élément de travail le dit, ainsi que le nombre de tentatives faites.

### `motir-continue` {#motir-continue}

**Dites**

- `motir continue ACME-12`

**Ce qui se passe**

Poursuit un élément de travail dont l’exécution s’est interrompue en cours de route : l’ordinateur portable s’est fermé, le bac à sable a été perdu ou le processus a été tué. L’élément de travail est toujours En cours et son travail se trouve sur la branche laissée par cette exécution. Il commence par prendre en charge la poursuite, afin que personne d’autre ne travaille sur la même branche. Il extrait ensuite cette branche dans chaque dépôt que l’élément de travail couvre, jamais une nouvelle et sans jamais réinitialiser ce qui s’y trouve déjà, et reprend le travail là où il s’était arrêté. Il livre comme le fait une nouvelle exécution : une pull request par dépôt, liée à l’élément de travail. Utilisez plutôt `motir fix ACME-12` quand l’élément de travail a déjà une pull request en échec, et `motir run ACME-12` pour un élément de travail que personne n’a commencé.

**Ce que vous voyez dans Motir**

Un élément de travail dont l’exécution s’est interrompue affiche Exécution interrompue dans sa section Développement, avec la commande `motir continue` à copier. Pendant que la poursuite s’exécute, cette section indique qu’elle est en cours de poursuite, et par qui. Quand elle se termine, l’élément de travail avance exactement comme après `motir run` : vers Implémenté, avec ses pull requests liées et une section Comment tester.

### `motir-log-bug` {#motir-log-bug}

**Dites**

- `motir log bug the export button does nothing on an empty board`

**Ce qui se passe**

Traite ce que vous avez saisi comme une affirmation à vérifier. Il trouve d’abord la cause dans le code, cherche un élément de travail déjà créé par quelqu’un, et ne crée rien si le comportement s’avère correct. Sinon il crée un seul bug : sous la Story qu’il bloque, ou dans le dossier Bugs de votre projet quand il ne bloque rien.

**Ce que vous voyez dans Motir**

Un nouvel élément de travail de type Bug avec la cause, l’endroit du code où elle se trouve et la façon de la reproduire, lié à l’élément de travail sur lequel il a été trouvé. S’il bloque l’élément de travail que vous exécutez, celui-ci passe à Bloqué.

### `motir-mark` {#motir-mark}

**Dites**

- `motir mark ACME-12 done`

**Ce qui se passe**

Clôt un élément de travail qu’aucune pull request ne peut clore : un élément manuel, comme créer un compte, définir un secret ou modifier un réglage. Le dire vaut confirmation de votre part que le travail est terminé. Il refuse un élément de travail qui a une pull request, car c’est la fusion de cette pull request qui le clôt.

**Ce que vous voyez dans Motir**

L’élément de travail passe à Terminé, avec un commentaire indiquant que vous l’avez confirmé. Le statut de son parent découle de ses enfants.

### `motir-guide` {#motir-guide}

**Dites**

- `motir guide ACME-12`
- `motir guide`

**Ce qui se passe**

Vous guide à travers un élément de travail manuel, une étape à la fois. Nommez-en un, ou dites `motir guide` seul et il reprend le vôtre qui n’est pas terminé, sinon le prochain élément de travail manuel prêt. Il vous donne une étape, avec ses instructions et toute commande à copier, et attend. Dites que c’est fait, et il vérifie ce qu’il peut sans rien modifier, par exemple récupérer l’adresse ou exécuter une commande en lecture seule, et vous dit ce qu’il a constaté. Une étape dont la vérification échoue n’est pas cochée ; vous obtenez de nouveau la même étape. Vous pouvez vous arrêter à n’importe quelle étape, et `motir guide` reprend là où vous en étiez. Si l’élément de travail n’a pas encore d’étapes, il en propose à partir de la description et vous consulte avant de les écrire sur l’élément de travail. Si une étape se révèle erronée, il propose une correction et ne modifie l’étape ou le texte de l’élément de travail que si vous acceptez.

**Ce que vous voyez dans Motir**

L’élément de travail vous est assigné et passe à En cours. Sa Liste de tâches coche chaque étape au fur et à mesure que vous la terminez, avec le nom de la personne qui l’a faite. Quand la dernière étape est cochée, l’élément de travail passe à Terminé, avec un commentaire résumant chaque étape et la façon dont elle a été confirmée.

### `motir-fix-bugs` {#motir-fix-bugs}

**Dites**

- `motir fix bugs`
- `motir fix bugs 3`

**Ce qui se passe**

Parcourt les bugs du dossier Bugs de votre projet qui sont encore À faire, un bug à la fois, du plus ancien au plus récent. Les bugs situés dans des dossiers à l’intérieur de Bugs sont laissés de côté. Pour chacun, il vérifie d’abord que le bug est réel sur votre branche par défaut, puis lui donne exactement un résultat. Un bug qu’il sait corriger reçoit une pull request qui corrige ce bug et rien d’autre. Un bug qui attend un autre élément de travail non terminé est lié à cet élément de travail et déplacé sous la même Story. Un bug qu’il ne peut pas corriger ici reçoit un commentaire et est mis de côté : déjà corrigé, avec ce qui l’a corrigé ; impossible à reproduire, avec ce qu’il a exécuté ; ou nécessite votre décision, avec la question et sa recommandation. Chaque résultat sort le bug de À faire, si bien que l’exécution se termine d’elle-même. Ajoutez un nombre et il s’arrête après ce nombre de bugs. Il se termine par un rapport qui liste d’abord les bugs qui vous attendent.

**Ce que vous voyez dans Motir**

Un bug corrigé passe à Implémenté avec sa pull request liée, et à Terminé quand vous la fusionnez. Un bug qui attend un autre travail passe à Bloqué, avec un lien « bloqué par » vers cet élément de travail. Un bug déjà corrigé passe à Terminé. Un bug qu’il ne peut pas reproduire, ou qui nécessite votre décision, passe à Bloqué. Chacun de ces cas a un commentaire avec la preuve ou la question. Répondez à la question et remettez le bug à À faire, et l’exécution suivante le reprend.

## Quand un élément de travail est erroné {#wrong}

Il arrive qu’un élément de travail ne puisse pas être réalisé tel qu’il est écrit. Il peut réclamer quelque chose qui n’existe pas, nécessiter un design que personne n’a dessiné, ou toucher deux dépôts. `motir-run` ne devine pas comment contourner cela. Il passe l’élément de travail à **En planification**, pour qu’aucune autre exécution ne le prenne, et confie au planificateur Motir AI la planification de la correction. Puis il s’arrête. Le plan attend que vous le relisiez et l’approuviez dans Motir, et rien n’est réalisé tant que vous ne l’avez pas fait.

Si votre token ne peut pas utiliser la planification par l’IA, ou si vos crédits d’IA sont épuisés, il s’arrête quand même. Il laisse un commentaire sur l’élément de travail avec toute la correction et explique pourquoi il n’a pas pu la transmettre.

## Mettre à jour {#updating}

Une nouvelle version a un nouveau tag, et cette page passe à celui-ci. Pour une installation par copie, relancez l’étape d’installation de votre agent : elle écrase les dossiers des skills sur place. Dans Claude Code, une place de marché ne peut pas être ajoutée de nouveau à un autre tag : supprimez-la, ajoutez-la au nouveau tag et installez de nouveau le plugin :

{{slot:update}}

Redémarrez ensuite votre agent pour qu’il lise les nouvelles versions.
