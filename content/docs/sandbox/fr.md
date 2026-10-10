---
source: cdc9936762b4
---

Un bac à sable est un conteneur que vous démarrez sur votre propre machine, qui contient votre propre agent, la Motir CLI et vos copies de travail — et rien d’autre. Vous apportez votre propre identifiant d’agent, monté en lecture seule ; la boucle s’exécute à l’intérieur, de sorte qu’un agent qui se comporte mal atteint votre arborescence de travail et non le reste de votre machine.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Avant de commencer {#before-you-start}

- **Docker, en cours d’exécution.** Construit pour `linux/amd64` **et** `linux/arm64` : Apple Silicon est donc une machine de plein droit et rien n’est émulé. Il n’y a pas d’étape de construction — vous téléchargez l’image.
- **La connexion propre à votre agent, sur cette machine.** Le montage de son identifiant est en lecture seule : le conteneur peut donc utiliser une connexion, mais ne peut pas la renouveler. Claude Code sous macOS est l’exception que vous rencontrerez : il garde son token dans le trousseau de connexion, il n’y a donc aucun fichier à monter, et vous vous connectez à `claude` **dans** le conteneur à la place — l’image lui fournit un répertoire de configuration accessible en écriture, et c’est là que la connexion est enregistrée. (Antigravity fonctionne de la même façon — l’étape 2 le précise quand vous le choisissez.)
- **La racine de votre espace de travail — le dossier qui CONTIENT vos copies de travail.** Un projet s’étend généralement sur plusieurs dépôts et la boucle s’exécute sur tous.

{{slot:workspace}}

{{part:picker-label}}

Quel agent utilisez-vous ?

{{part:picker-also-supported}}

également pris en charge

{{part:picker-or}}

ou

{{part:picker-base}}

aucun agent (base)

{{part:picker-summary}}

Chaque commande ci-dessous est destinée à **{{value:profileLabel}}**. Changer d’agent réécrit le tag et le montage de l’identifiant dans les **étapes 1, 2 et 2b** — les trois endroits où ils apparaissent.

{{part:chip-command}}

Commande

{{part:chip-editor}}

Dans votre éditeur

{{part:steps-intro}}

## Mise en place {#set-it-up}

Cinq étapes. Chacune consiste en une seule chose à faire.

{{part:step-1-intent}}

Télécharger l’image de votre agent

{{part:step-1-body}}

Il n’y a pas d’étape de construction — l’image est publiée par profil d’agent.

{{part:step-2-intent}}

Démarrer le conteneur depuis la racine de votre espace de travail

{{part:step-2-body}}

Lancez-le depuis le dossier qui **contient** vos copies de travail, et non depuis l’une d’elles.

{{part:step-2-vscode}}

**Vous préférez VS Code ?** Les étapes 2a à 2c ci-dessous remplacent celle-ci. Tout ce qui suit est identique dans les deux cas.

{{part:step-2a-intent}}

Installer l’extension Dev Containers

{{part:step-2a-body}}

Depuis la vue Extensions, ou la palette de commandes — ⇧⌘P sous macOS, Ctrl+Shift+P ailleurs, F1 sur les trois — puis _Extensions: Install Extensions_. Deux de ces trois étapes se déroulent dans la palette : autant l’épingler dès maintenant.

{{part:step-2b-intent}}

Créer la configuration du dev container

{{part:step-2b-body}}

Exécutez ceci dans le dossier que vous montez. Un seul collage : il crée le dossier `.devcontainer` et y écrit le fichier. N’essayez pas de les créer depuis un sélecteur de fichiers — le Finder et la plupart des sélecteurs graphiques refusent un nom commençant par un point, et le refusent sans dire pourquoi.

{{part:step-2b-warning}}

**Un dev container conserve l’image à partir de laquelle il a été créé.** `--pull=always` appartient à la commande d’exécution de l’étape 2, pas à cette voie. Pour passer à l’image actuelle et à la CLI `motir` : **1.** exécutez `{{value:dockerPull}}` de l’étape 1 dans un terminal de votre machine ; **2.** _Dev Containers: Open Folder in Container…_ sur ce dossier, ce qui rattache la fenêtre ; **3.** _Dev Containers: Rebuild Container_, qui recrée le conteneur à partir de l’image que vous venez de télécharger. Rebuild Container n’apparaît que dans une fenêtre rattachée au conteneur, c’est pourquoi l’étape 2 vient en premier. Une reconstruction conserve votre connexion à Motir (elle réside sur le volume `{{value:authVolume}}`) mais pas une connexion à Claude Code faite dans le conteneur — exécutez `claude` et connectez-vous de nouveau.

{{part:step-2c-intent}}

Ouvrir le dossier dans le conteneur

{{part:step-2c-body}}

Palette de commandes → _Dev Containers: Open Folder in Container…_, puis choisissez le dossier dans lequel vous venez d’écrire le fichier. Son terminal est le même shell que celui où l’étape 2 vous aurait déposé — poursuivez à l’étape 3.

{{part:step-3-intent}}

Se connecter, dans le conteneur

{{part:step-3-body}}

Un code et une URL s’affichent ; approuvez dans n’importe quel navigateur. La connexion est enregistrée sur le volume `{{value:authVolume}}`, vous ne la faites donc qu’une fois.

{{part:step-4-intent}}

Lier le dossier à votre projet

{{part:step-4-body}}

Remplacez `ACME` par la clé de votre projet. Si votre espace de travail ne contient qu’un seul projet, supprimez l’option — c’est toute l’étape.

{{part:step-5-intent}}

Vérifier — tout au vert, c’est la fin de cette page

{{part:step-5-body}}

L’authentification, le lien, le binaire de l’agent et son identifiant. C’est la seule vérification qui vous dit que le conteneur a réellement reçu ce que vous lui avez passé.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode conserve sa configuration et ses identifiants à deux endroits, il faut donc deux lignes `-v`. Les deux sont nécessaires.

{{part:note-antigravity}}

Antigravity conserve son token dans le trousseau du système, qui n’a aucun fichier portable à monter — il n’y a donc aucune ligne `-v` pour lui, et vous vous connectez DANS le conteneur plutôt qu’avant de commencer. C’est le seul profil pour lequel la deuxième condition préalable ci-dessus ne s’applique pas.

{{part:note-aider}}

L’identifiant d’Aider est une clé d’API de modèle qu’il lit dans l’environnement : c’est donc le seul profil qui ajoute une ligne `-e`. Le montage porte sur un FICHIER, qui doit exister — même vide — faute de quoi docker crée un dossier à sa place.

{{part:note-base}}

L’image de base contient la Motir CLI et aucun agent — rien à monter, et rien où se connecter en dehors de Motir lui-même.

{{part:devcontainer-file}}

### Le fichier que cette commande écrit {#devcontainer-file}

Référence, pas une étape — 2b l’a déjà écrit. Il est ici pour le lecteur qui préfère créer le fichier à la main, et parce que les guillemets autour de `<<’JSON’` sont essentiels : ils empêchent votre shell de développer `${localWorkspaceFolder}` et `${localEnv:HOME}` avant qu’ils n’atteignent le fichier. Ce sont des substitutions de Dev Containers, et c’est l’éditeur qui les résout.

{{part:why}}

## Pourquoi c’est fait ainsi {#why}

### Ce que change le sélecteur de profil {#profile-picker}

Choisir un agent réécrit trois choses et rien d’autre : le **tag** de l’image, la ou les lignes `-v` de l’identifiant, et les champs `image`, `name` et `mounts` du dev container. C’est un contrôle plutôt qu’un paragraphe vous disant de les remplacer vous-même, parce que chaque commande ici a un bouton Copier et qu’un lecteur qui copie est un lecteur qui n’a pas lu la consigne de remplacement.

Tous les profils n’ont pas un seul répertoire d’identifiants. `opencode` en garde deux et prend deux lignes `-v` ; `antigravity` garde son token dans le trousseau du système et n’en prend aucune, en se connectant plutôt dans le conteneur ; et `aider` monte un fichier et lit une clé de modèle dans l’environnement. Les étapes le précisent quand vous les choisissez.

### Avec la commande d’exécution, rien n’est conservé qui puisse devenir périmé {#run-command}

`--pull=always` récupère l’image actuelle à chaque démarrage : un tag de profil qui a bougé vous parvient donc sans que vous ayez à remarquer qu’il a bougé, et `--rm` signifie que rien n’est conservé qui puisse devenir périmé. Il n’existe pas de chemin distinct pour y revenir — ce qui est exactement ce qui laissait des gens exécuter un `motir` plus ancien de plusieurs mois que la page qu’ils lisaient. Votre connexion survit à tout cela : elle est écrite sur le volume `{{value:authVolume}}`, qui vit en dehors du conteneur ; vous vous connectez donc une fois et chaque exécution suivante la reprend — déconnectez-vous définitivement avec `{{value:signOutCommand}}`. Vous travaillez hors ligne ? Retirez `--pull=always` : il contacte le registre à chaque démarrage, si bien que sans réseau l’exécution échoue au lieu de se rabattre sur l’image que vous avez déjà. Tout cela concerne la commande d’exécution. Un dev container (étapes 2a à 2c) conserve l’image à partir de laquelle il a été créé jusqu’à ce que vous la téléchargiez, que vous le rattachiez avec _Dev Containers: Open Folder in Container…_ et que vous choisissiez _Dev Containers: Rebuild Container_.

### La suite {#what-next}

`motir run` prend un PÉRIMÈTRE — un élément de travail, une Story entière, ou `sprint` pour le Sprint actif. `motir auto` vide plutôt l’ensemble prêt sans surveillance, un élément à la fois sur une branche de session. Chaque option que les deux acceptent figure sur la page [{{value:cliPage}}](/docs/cli).

## Ce qu’il confine — et ce qu’il ne confine pas {#confines}

À lire avant de vous y fier, car l’une de ces trois propriétés est une exception et non une garantie.

- **Système de fichiers — confiné.** Les seules surfaces de l’hôte à l’intérieur du conteneur sont un `/workspace` accessible en écriture et l’identifiant propre à votre agent, monté en lecture seule. Aucun socket Docker, aucun autre montage de l’hôte.
- **Réseau — OUVERT, à dessein.** Chaque agent a besoin de l’API de son fournisseur et chaque élément de travail lancé a besoin de dépôts git distants : l’image limite donc l’étendue des dégâts sur le système de fichiers, mais pas le trafic sortant. Si votre modèle de menace exige davantage, recourez aux contrôles réseau propres à Docker — le conteneur n’empêchera pas un agent de parler à Internet.
- **Privilèges — non privilégié.** Il s’exécute sous l’utilisateur `node` (uid 1000), de sorte que les fichiers écrits dans le montage vous appartiennent plutôt qu’à root.

## Ce que l’environnement vous apporte {#environment}

- **Votre dossier, monté.** `$PWD` devient `/workspace` : les copies de travail dans lesquelles l’exécution opère sont donc les vôtres, et les commits qu’elle fait sont sur votre disque à sa fin.
- **Une copie de travail par élément de travail, sur un worktree git.** Une exécution ne modifie pas l’arborescence où vous vous trouvez ; elle ajoute un worktree par élément, de sorte que des exécutions en parallèle ne peuvent pas entrer en collision lors de l’extraction d’une branche.
- **Votre identifiant d’agent, en LECTURE SEULE.** Le répertoire d’identifiants du profil est monté avec `:ro`. Rien dans le conteneur ne peut le réécrire, et rien à son sujet n’est envoyé à Motir — c’est le principe « apportez votre propre clé » : la facture de l’agent est la vôtre et l’appel d’API ne passe jamais par nous.
- **La CLI, préinstallée.** L’image contient `motir` et le binaire d’agent que nomme le tag : il n’y a donc rien à installer avant la première exécution.
- **La sortie de votre agent reste locale par défaut.** Seul le cycle de vie de l’exécution parvient à Motir. Passer `--report-log` envoie en plus la fin de la sortie afin qu’une exécution en échec l’affiche sur la page de l’exécution ; c’est DÉSACTIVÉ sauf si vous le choisissez, et le contenu des fichiers, les chemins et les diffs ne sont jamais envoyés, dans aucun cas.

## Ce que le token peut faire — et ce qu’il refuse {#token}

Un token créé par `motir login` porte une autorisation fixe et restreinte. L’écran d’approbation l’affiche et ne peut pas la changer — ni l’élargir ni la restreindre, car une autorisation restreinte à la main interrompt une boucle sans surveillance en plein milieu.

{{slot:grant}}

**Celle qu’il ne porte PAS est `ai:view_plan`, et le refus qui en découle est voulu, ce n’est pas un bug.** Ouvrir un plan exige seulement `work_item:edit` : une exécution en bac à sable PEUT donc en ouvrir un — et se voit refuser son premier ajout, car c’est la clé qu’exige l’ajout de propositions. Une exécution qui réalise un élément de travail n’a pas le droit de remodeler le plan qu’on lui a confié. Quand vous rencontrez ce refus, l’agent a fait ce qu’il fallait : il consigne la correction dans un commentaire, laisse l’élément bloqué et s’arrête. Rien n’est perdu, et c’est une personne qui décide de ce que le plan doit dire.

Deux options restreignent encore davantage lorsque vous voulez une exécution plus discrète : `--disable-log-bug` empêche l’agent de créer un bug pour un défaut qu’il trouve ailleurs (il commente à la place), et `--disable-replan` l’empêche de soumettre un nouveau plan pour un élément de travail qu’il juge erroné (il commente et s’arrête). Sur `motir auto` uniquement, `--auto-approve-replan` va dans l’autre sens : il approuve un nouveau plan soumis et continue la boucle, au lieu de s’arrêter pour vous.

## Ce qu’une exécution produit, et où le lire {#produces}

- **Une branche et une pull request** dans chaque dépôt où l’élément est livré, poussées avec vos identifiants git depuis l’intérieur du conteneur.
- **Un lien sur l’élément de travail.** L’exécution déclare quel élément chaque pull request livre, si bien que la fusionner fait avancer l’élément. Ce lien est ce qu’affiche le panneau Développement de la page de l’élément, et c’est lui qui clôt l’élément à la fusion — ni le nom de la branche, ni le titre.
- **Le statut, au fil de l’eau.** L’élément passe à En cours quand l’exécution le prend et à Implémenté quand la pull request s’ouvre. En revue est écrit par la CI quand les vérifications passent au vert, et Terminé par la fusion.
- **Le terminal.** La sortie propre à l’agent reste dans votre terminal, sauf si vous avez passé `--report-log`.

## Quand ça ne marche pas {#troubleshooting}

### Le binaire de l’agent est introuvable {#agent-binary-not-found}

Le tag et l’agent ne correspondent pas. Vérifiez quel profil vous avez démarré, ou dirigez l’exécution vers un autre binaire avec `--agent <cmd>`. `motir doctor` le signale avant qu’une exécution ne réserve un élément pour rien.

### L’agent démarre et n’est pas authentifié {#agent-not-authenticated}

Le montage de l’identifiant est absent ou pointe vers le mauvais répertoire — chaque profil monte le sien. Relancez la ligne `{{value:dockerRun}}` pour le tag que vous avez réellement téléchargé.

### Rien n’est prêt à être exécuté {#nothing-ready}

Chaque candidat a une dépendance non satisfaite. `motir ready` affiche l’ensemble ; `motir show` sur un élément de travail nomme ce qui le bloque. Le lancer quand même se fait avec `--force`, pour un seul élément.

### L’exécution s’arrête sur un nouveau plan soumis {#stopped-on-replan}

L’agent a jugé l’élément de travail erroné et a proposé une forme corrigée. C’est l’arrêt voulu : lisez le plan dans Motir et approuvez-le ou refusez-le. Pour laisser plutôt une boucle sans surveillance continuer, lancez `motir auto` avec `--auto-approve-replan`.

### Une exécution a laissé du travail derrière elle après sa fin {#work-left-behind}

Les worktrees et les branches sont sur votre disque, sous le dossier que vous avez monté — un conteneur arrêté ne les a pas emportés. `motir done` clôt un élément fusionné, ou toute une branche de session fusionnée avec `--session <branch>`.

## Ce que cette page ne couvre pas {#not-covered}

Chaque commande et chaque option — c’est la page [{{value:cliPage}}](/docs/cli), générée à partir du catalogue propre à la CLI et qui ne peut pas s’en éloigner. Connecter un agent à Motir directement, sans la CLI, est l’objet de [{{value:mcpPage}}](/docs/mcp). Piloter la même boucle de travail en HTTP plutôt que depuis un terminal est l’objet de l’[{{value:apiPage}}](/docs/api). Exécuter le bac à sable ailleurs que sur votre propre machine n’est pas encore documenté ici. (Le parcours VS Code, lui, EST documenté, plus haut — cette phrase disait autrefois le contraire, et elle enregistrait comme une décision une section supprimée.)
