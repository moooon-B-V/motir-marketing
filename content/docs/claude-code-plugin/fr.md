---
source: 758198e00644
---

Le plugin de Motir pour Claude Code place votre projet Motir dans Claude Code en une seule installation : les skills de Motir, son serveur MCP et un lanceur pour sa CLI. Il se connecte avec votre compte Motir dans le navigateur, sans aucun token. Dites `motir run` et Claude Code prend le prochain élément de travail prêt, le réalise et ouvre une pull request liée.

Le plugin est publié depuis [{{value:skillsRepo}}]({{value:repoUrl}}), qui est aussi une place de marché de plugins Claude Code. Chaque commande de cette page installe la version [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Avant de commencer {#before}

Il vous faut Claude Code, un compte Motir ayant accès au projet, et `git`. Le lanceur exige Node.js 22 ou plus récent, et les skills qui ouvrent ou lisent des pull requests exigent la GitHub CLI (`gh`).

## Installer {#install}

Ajoutez la place de marché au tag de la version, puis installez le plugin. Exécutez les deux dans Claude Code.

{{slot:install}}

## Ce qu’il apporte {#brings}

- **Les sept skills.** Chaque skill de la version, listé sous le nom du plugin.
- **Le serveur MCP de Motir.** Claude Code s’y connecte dans le navigateur à la première utilisation : exécutez `/mcp`, choisissez `motir` puis _Authenticate_, puis sélectionnez l’espace de travail et approuvez sur l’écran de consentement de Motir. Il n’y a aucun token à créer ni à coller.
- **Le lanceur `motir`.** Exécute la Motir CLI épinglée avec `npx`, sans rien installer globalement. Il exige Node.js 22 ou plus récent, et la CLI se connecte d’elle-même avec `motir login`.

## Vérifier que ça marche {#check}

Pour vérifier : `/plugin` affiche `motir` à la version `{{value:releaseVersion}}`, et `/mcp` liste `motir`. Les skills d’un plugin sont listés sous le nom du plugin, par exemple `/motir:motir-run`.

## L’utiliser {#use}

Dites ce que vous voulez dans Claude Code. Le comportement complet de chaque skill, et ce que vous verrez dans Motir, figurent dans le guide [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Mettre à jour {#updating}

Une place de marché ajoutée à une version ne peut pas être ajoutée de nouveau à une autre : supprimez-la d’abord. La supprimer désinstalle le plugin, et la dernière ligne l’installe de nouveau à la nouvelle version.

{{slot:update}}

Vous utilisez un autre agent, ou vous ne voulez que le connecteur ? Consultez le guide [{{value:skillsPage}}](/docs/skills) pour tous les agents, ou le [{{value:connectorPage}}](/docs/claude-code-connector).
