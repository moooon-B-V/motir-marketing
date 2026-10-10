---
source: 1c84b9f042c7
---

L’API de lecture publique est anonyme : chaque endpoint de lecture renvoie les données d’un projet sans connexion, ce qui permet à la place publique des projets de fonctionner pour un visiteur déconnecté. Tout ce qui est lié à un compte exige un token. Cinq étapes ci-dessous, chacune se terminant par quelque chose que vous voyez se produire.

Chaque chemin est relatif à l’hôte d’application vers lequel pointe cette version, indiqué ci-dessous. Les requêtes sont écrites par rapport à lui, vous pouvez donc en copier une telle quelle.

{{slot:app-host}}

## 1. Créer un token {#mint-a-token}

Créez un token d’accès personnel dans Paramètres → Compte → Jetons, choisissez l’espace de travail auquel il est lié et accordez-lui les permissions dont il a besoin — les mêmes noms `resource:action` que ceux qu’affiche l’écran Rôles et permissions. Accordez l’ensemble le plus restreint qui suffit : une autorisation restreint votre propre rôle et ne l’élargit jamais, de sorte qu’un token ne peut pas faire ce que vous ne pourriez pas faire.

**Le secret n’est affiché qu’UNE SEULE FOIS, à la création du token.** Copiez-le à ce moment-là ; il est impossible de le relire ensuite, et un token perdu se remplace au lieu de se récupérer.

## 2. Votre premier appel authentifié {#first-call}

Faites cet appel en premier. Il indique à qui appartient le token, à quel espace de travail il est lié et exactement quelles permissions il porte — vous apprenez ainsi ce que votre propre identifiant peut faire sans sonder les endpoints ni collecter des refus.

{{slot:first-call-request}}

{{slot:first-call-response}}

Un token absent, mal formé, inconnu, révoqué ou expiré renvoie toujours la même erreur `401` avec le même message. C’est voulu : les distinguer ferait de l’endpoint un oracle qui répondrait à la question « ce secret existe-t-il ? ».

## 3. Parcourir une collection {#paginate}

Les collections sont paginées par curseur. Choisissez une taille de page avec `limit` (la valeur par défaut est 50, et toute valeur supérieure est ramenée à 100 au lieu d’être rejetée), puis renvoyez le `nextCursor` de la réponse précédente sous le nom `cursor`. Un `nextCursor` égal à `null` marque la dernière page.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

Le curseur est OPAQUE et signé. Ne l’analysez pas, n’en construisez pas et ne le transportez pas d’une collection à l’autre — un curseur émis ailleurs donne une erreur `422`, jamais une page silencieusement fausse. Renvoyez exactement ce qui vous a été donné.

Une asymétrie surprend souvent, mieux vaut donc la connaître avant de la rencontrer : certaines collections indiquent aussi un `totalCount`, et la plupart ne le font volontairement pas. Lorsque la lecture qui sous-tend une collection calcule déjà un total sous forme d’agrégat borné, il est indiqué ; sinon le champ est omis ENTIÈREMENT — absent, jamais `null` et jamais `0`, afin qu’un client puisse toujours distinguer « aucun total n’a été promis » de « le total est zéro ».

## 4. Lire une erreur {#read-an-error}

Chaque échec renvoie le même corps : un `code` lisible par une machine et un `error` lisible par un humain. Raisonnez sur `code` — il est stable, et en changer un est un changement incompatible. N’analysez jamais `error` : c’est une phrase pour un développeur qui lit un terminal, et elle est reformulée librement.

{{slot:error-404-response}}

Une erreur `404` signifie que la ressource n’existe pas **ou** se trouve en dehors de l’espace de travail auquel votre token est lié — c’est la même réponse à dessein, afin que l’API ne puisse pas servir à énumérer les données d’un autre locataire. Une erreur `403` est un refus d’une autre nature : votre token est valide et son autorisation n’inclut pas la permission que cette opération exige, et la réponse nomme la clé. Une erreur `422` est une requête que vous pouvez corriger, et son `code` indique quelle partie.

**Une erreur `500` est le seul échec SANS `code`.** Une défaillance inattendue n’a pas de contrat stable : le corps contient donc un message et rien d’autre — ne raisonnez pas dessus.

## 5. Lire les en-têtes de réponse {#rate-limits}

Le budget est calculé par TOKEN, et les en-têtes accompagnent CHAQUE réponse — un succès, un refus, une erreur interprétée et une défaillance. Vous n’avez jamais besoin d’envoyer une requête pour savoir où vous en êtes : la dernière vous l’a déjà dit.

{{slot:response-headers}}

Après une erreur `429`, patientez jusqu’à `X-RateLimit-Reset` — un horodatage Unix en SECONDES. Il n’existe volontairement pas d’en-tête `Retry-After` : un instant absolu ne peut pas se périmer en route comme le peut une durée relative.

`X-Request-Id` figure aussi sur chaque réponse. Citez-le si vous devez un jour nous interroger sur un appel précis — c’est le seul identifiant qui permet de le retrouver.

`X-Motir-Api-Version` est la version du CONTRAT qui a servi la réponse — le même `MAJOR.MINOR.PATCH` que le `info.version` de la spécification, et non notre numéro de version. Lisez-la sur n’importe quelle réponse, y compris un échec, pour détecter un décalage de version. Un MAJOR que vous ne reconnaissez pas signifie qu’un `/api/v2` existe ; un MINOR plus élevé signifie que le contrat s’est enrichi, de façon additive, et que votre client reste correct. Si le bloc ci-dessus affiche un espace réservé à la place d’une version, la spécification était inaccessible lorsque cette page a été produite, et [Référence de l’API](/docs/api) lit la version actuelle directement dans le document.

## La suite {#what-next}

[Référence de l’API](/docs/api) liste chaque opération avec ses paramètres, son corps et ses statuts. [Stabilité et dépréciation](/docs/api/stability) décrit ce que le contrat s’engage à ne pas vous faire subir. Si vous connectez un agent plutôt que d’écrire un client, le [serveur MCP](/docs/mcp) est l’autre moitié.
