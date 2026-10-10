---
source: 04e1454b8c46
---

Motir est un connecteur MCP distant : Claude Code accède à votre projet Motir par une seule URL et agit en votre nom, dans les limites de ce que vous approuvez. Vous vous connectez avec votre compte Motir et choisissez un espace de travail. Il n’y a aucun token à créer, à coller ni à protéger.

Il y a deux façons de l’ajouter. Connectez-le une fois sur claude.ai et Claude Code le reprend partout où vous êtes connecté avec votre compte Claude, ou ajoutez-le directement dans Claude Code avec une seule commande. Vous voulez aussi les skills de Motir ? Le [{{value:pluginPage}}](/docs/claude-code-plugin) apporte ce connecteur avec lui.

## Avant de commencer {#before}

Il vous faut un compte Motir ayant accès au projet, et Claude Code. Pour passer par claude.ai, Claude Code doit être connecté avec le même compte Claude que celui que vous connectez sur claude.ai.

## Le connecter sur claude.ai {#claude-ai}

Un connecteur que vous connectez sur claude.ai est disponible dans vos conversations sur le web, dans l’application de bureau et sur mobile, ainsi que dans Claude Code lorsqu’il est connecté avec votre compte Claude.

1. Ouvrez Customize → Connectors.
2. Cliquez sur « + », puis sur Add custom connector, et collez l’URL du serveur ci-dessous. Sous OAuth client, choisissez Use Claude’s published identity — claude.ai l’indique comme Detected, car Motir la prend en charge. Laissez vides l’ID client et le secret OAuth — Motir n’a besoin ni de l’un ni de l’autre.
3. Cliquez sur Add, puis sur Connect. Claude vous envoie vers app.motir.co pour vous connecter et approuver.

{{slot:claude-ai}}

Avec une offre Team ou Enterprise, un Owner ajoute le connecteur une seule fois, sous Organization settings → Connectors → Add → Custom → Web, puis chaque membre clique sur Connect sous Customize → Connectors avec son propre compte Motir. · [Documentation de claude.ai d’Anthropic]({{value:claudeAiDocsUrl}}) · étapes vérifiées le {{value:claudeAiCheckedOn}}

## Ou l’ajouter dans Claude Code {#claude-code}

Ajoutez le connecteur directement à Claude Code, sans passer par claude.ai.

1. Ajoutez le serveur avec la commande ci-dessous — sans en-tête et sans token.
2. Dans Claude Code, exécutez `/mcp`, sélectionnez `motir` et suivez la connexion dans votre navigateur.

{{slot:claude-code}}

Si vous avez connecté Claude Code avec votre compte Claude, un connecteur que vous avez connecté sur claude.ai y est déjà disponible. Le plugin Motir pour Claude Code apporte ce serveur avec lui, en plus des skills. · [Documentation de Claude Code d’Anthropic]({{value:claudeCodeDocsUrl}}) · étapes vérifiées le {{value:claudeCodeCheckedOn}}

## Vérifier la connexion {#check}

Dans Claude Code, exécutez `/mcp` : Motir figure parmi les serveurs, et un serveur qui attend encore votre connexion l’indique. Interrogez ensuite Claude sur votre projet — par exemple sur ce qui est prêt à démarrer — et il répond à partir de Motir.

## Ce que vous approuvez, et comment le retirer {#consent}

La page de connexion de Motir nomme l’application qui fait la requête, vous fait choisir un espace de travail et liste les permissions souhaitées. Claude agit ensuite en votre nom dans cet espace de travail, dans les limites de ce que vous avez approuvé, et jamais au-delà de ce que permet votre propre rôle. Claude vous consulte avant d’utiliser un outil qui modifie quoi que ce soit, et [{{value:mcpToolsPage}}](/docs/mcp/tools) indique quels outils se limitent à lire, à écrire ou à supprimer.

Chaque application que vous connectez est listée sous [Applications connectées]({{value:connectedAppsUrl}}), dans Paramètres → Compte → Jetons de Motir, avec son espace de travail, ses permissions et la date de sa dernière utilisation. Révoquer met fin à son accès dès sa requête suivante. Le guide [{{value:mcpPage}}](/docs/mcp) détaille le serveur, ainsi que la voie par token pour les autres clients et les pipelines.
