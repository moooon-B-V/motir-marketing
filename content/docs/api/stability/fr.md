---
source: 656e3e6e6922
---

L’API de lecture publique est versionnée. La version du contrat figure dans le champ `info.version` du document OpenAPI servi, et une modification qui casse un client est un changement de version, pas une édition silencieuse.

## Ce que `v1` garantit {#the-guarantee}

Tant que `v1` existe, ses chemins ne bougent pas, un `code` d’erreur ne change pas de sens, une condition existante ne change pas de statut, et un champ ne change ni de type ni de nullabilité. Tout ce qui romprait l’un de ces points relève d’une `v2`, pas d’une publication `v1`.

### Autorisé dans `v1`, sans préavis {#allowed-inside-v1}

- Un nouvel endpoint.
- Un nouveau paramètre de requête FACULTATIF.
- Un nouveau champ dans un objet de réponse.
- Un nouvel en-tête de réponse.
- Une nouvelle valeur pour un champ documenté comme ouvert.
- Un budget de limitation de débit relevé.

### Exige une nouvelle version majeure {#needs-a-new-major}

- Supprimer un champ.
- Renommer un champ.
- Changer le type ou la nullabilité d’un champ.
- Supprimer un `code` d’erreur ou lui donner un autre usage.
- Changer un statut existant pour une condition existante.
- Durcir une limite.
- Rendre obligatoire un paramètre facultatif.

## Votre part de la promesse {#your-obligation}

**Un client DOIT tolérer les champs et les valeurs inconnus, et NE DOIT PAS analyser la phrase `error` destinée aux humains.** C’est l’autre moitié de la promesse, et sans elle la garantie ci-dessus ne tient pas : un client qui rejette un champ qu’il ne reconnaît pas cassera lors d’un changement que cette page déclare sans risque, et un client qui analyse `error` cassera dès qu’une phrase sera reformulée. Raisonnez sur `code`, ignorez ce que vous ne connaissez pas, et chaque changement additif ne vous coûte rien.

## Dépréciation {#deprecation}

Une opération ou un champ déprécié est marqué `deprecated: true` **dans la spécification**, et porte la raison et son remplaçant dans sa description. La spécification est le canal d’annonce parce que c’est le seul artefact que tous les clients lisent déjà : un générateur de code signale ainsi la dépréciation sans que personne ait eu à lire un article de blog.

L’ancien comportement continue de fonctionner pendant la durée annoncée. Un champ n’est jamais supprimé par surprise.

## Comment une `v2` arriverait {#how-v2-arrives}

Sous la forme d’un SECOND document à un second chemin, servi en parallèle de `v1` — et non comme une réécriture de celle-ci. `v1` ne cesse pas de fonctionner le jour où `v2` sort, et déprécier `v1` est lui-même une annonce soumise à la même durée.

Le `info.version` de la spécification est la version du contrat de l’API, et non le numéro de version de l’application : son majeur est la version du chemin, son mineur augmente à chaque changement additif de la liste ci-dessus, et son correctif à chaque correction qui ne touche que la documentation. Lisez-la sur n’importe quelle réponse dans `X-Motir-Api-Version` — [Premiers pas](/docs/api/getting-started) indique où.

Cette page est l’engagement publié. Le document interne dont elle est tirée est [le document de décision de l’API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
