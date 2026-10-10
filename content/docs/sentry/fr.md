---
source: 8e83d53f1b7a
---

Connectez Sentry à un projet Motir et les erreurs que vos services signalent déjà arrivent sur le tableau de ce projet sous forme d’éléments de travail de type Bug — planifiés, assignés et menés jusqu’à Terminé comme n’importe quel autre travail. Corriger le bug referme la boucle : Motir résout l’erreur dans Sentry à votre place.

## Ce que cela fait {#what-it-does}

- **Chaque nouvelle erreur devient un bug.** Motir examine à intervalles réguliers les projets Sentry que vous avez choisis. Une erreur qu’il n’a pas encore vue est créée comme élément de travail `bug` dans la destination des bugs du projet, avec le culprit de l’erreur, son niveau et un lien vers Sentry.
- **Une récurrence met à jour le même bug.** Lorsqu’une erreur se reproduit, son bug existant est mis à jour — aucun doublon n’est créé.
- **Terminé dans Motir signifie résolu dans Sentry.** Quand le bug atteint un statut terminé, Motir résout son erreur dans Sentry.
- **Le responsable de Sentry suit l’erreur.** Si une erreur est assignée à quelqu’un dans Sentry et que cette personne est membre de l’espace de travail Motir (reconnue par son e-mail), le bug lui est assigné.

Les deux sens peuvent être désactivés, projet surveillé par projet surveillé — voir [Réglages](#settings).

## Avant de commencer {#before-you-start}

- Dans Motir, vous devez avoir la permission de gérer les intégrations du projet. Sans elle, la page Surveillance vous indique à qui vous adresser.
- Dans Sentry, vous devez être autorisé à installer des intégrations dans votre organisation — généralement un propriétaire ou un gestionnaire.

## Connecter Sentry {#connect-sentry}

1. Dans Motir, ouvrez les paramètres du projet et choisissez _Surveillance_.
2. Choisissez _Connecter Sentry_. Vous êtes redirigé vers Sentry.
3. Dans Sentry, sélectionnez votre organisation et approuvez l’installation. Sentry vous renvoie vers Motir, qui affiche _Sentry est connecté._
4. Choisissez _Choisir des projets Sentry_, sélectionnez les projets dont les erreurs doivent arriver sur ce tableau, puis confirmez. Rien n’arrive tant que vous ne l’avez pas fait.

Vous pouvez surveiller plusieurs projets Sentry depuis un même projet Motir, et en ajouter d’autres plus tard avec _Ajouter un projet surveillé_.

## Réglages {#settings}

Chaque projet surveillé a ses propres réglages :

- **Niveau minimal** — seules les erreurs de ce niveau ou d’un niveau supérieur sont créées. La valeur par défaut est _Tous les niveaux_. Choisir un niveau plus bas examine aussi les erreurs antérieures, depuis la première surveillance du projet.
- **Résoudre dans Sentry lorsque le bug est terminé** — activé par défaut. Désactivez-le pour laisser les erreurs dans Sentry telles quelles lorsque leurs bugs sont terminés.
- **Reprendre le responsable depuis Sentry** — activé par défaut. Désactivez-le pour ignorer les assignations faites dans Sentry.

## Permissions réclamées {#permissions-it-asks-for}

Motir réclame à Sentry le plus petit ensemble de permissions dont ces fonctions ont besoin, et rien de plus large :

| Scope Sentry   | À quoi Motir l’utilise                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`     | Lire quelle organisation a été connectée, lister ses projets pour que vous puissiez choisir lesquels surveiller, et vérifier que la connexion fonctionne toujours.                                                                    |
| `project:read` | Lire les projets que vous avez choisi de surveiller.                                                                                                                                                                                  |
| `event:read`   | Lire les nouvelles erreurs des projets surveillés — leur titre, leur niveau, leur culprit, leur fréquence, les dernières frames de pile et les personnes auxquelles elles sont assignées — afin que chacune puisse arriver comme bug. |
| `event:write`  | Marquer une erreur comme résolue dans Sentry lorsque son bug est terminé. Rien d’autre n’est écrit.                                                                                                                                   |

L’accès accordé par Sentry est stocké chiffré et n’est jamais réaffiché à personne, vous compris.

## Quand la connexion affiche Dégradé {#when-the-connection-shows-degraded}

_Dégradé_ signifie que Motir ne peut plus lire les erreurs de votre organisation, et que rien de nouveau n’arrive sur le tableau tant que ce n’est pas réparé. À côté de _Sentry indique :_, la page affiche la raison avec les mots de Sentry.

- Choisissez d’abord _Revérifier_ — un problème passager côté Sentry se résorbe de lui-même.
- Si l’état reste dégradé, choisissez _Reconnecter_. Si Sentry indique que l’intégration est déjà installée, désinstallez Motir dans les paramètres d’intégration de votre organisation Sentry, puis choisissez de nouveau _Reconnecter_. Vos projets surveillés, leurs réglages et les bugs déjà créés sont conservés.

## Déconnecter {#disconnect}

Pour cesser de surveiller un projet Sentry, utilisez _Arrêter la surveillance_ sur sa ligne. Retirer le dernier projet surveillé revient à _Déconnecter Sentry_ : cela supprime aussi l’accès de Motir à votre organisation, et pour la surveiller de nouveau, vous vous reconnectez via Sentry.

Les bugs déjà créés restent sur le tableau comme des éléments de travail ordinaires. Rien n’est modifié dans Sentry par la déconnexion. Pour révoquer aussi l’accès du côté de Sentry, désinstallez Motir dans les paramètres d’intégration de votre organisation Sentry.
