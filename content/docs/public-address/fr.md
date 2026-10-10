---
source: b6adcdeabaad
---

Un projet public est accessible à l’adresse de votre choix. Chaque espace de travail peut réserver une adresse qui lui est propre, et un projet peut en plus répondre sur un domaine que vous possédez déjà.

## Votre adresse Motir {#your-motir-address}

Un espace de travail réserve un seul sous-domaine, et chaque projet public qu’il contient répond en dessous — ainsi `acme` vous donne `acme.motir.site/ROADMAP` pour un projet dont la clé est `ROADMAP`. Un propriétaire ou un administrateur de l’espace de travail la réserve, dans les paramètres du projet, sous _Adresse publique_.

Un libellé se compose de lettres minuscules, de chiffres et de tirets, de trois à soixante-trois caractères. Un petit ensemble de noms est mis de côté pour les hôtes de Motir et pour les noms qu’un lecteur pourrait prendre pour l’un d’eux.

Vous pouvez la renommer un nombre limité de fois, et le volet indique combien de renommages il vous reste. **L’ancienne adresse continue de fonctionner ensuite, et n’est jamais libérée.** Elle redirige définitivement vers la nouvelle et ne peut être réservée par personne d’autre — vous compris, plus tard. C’est voulu : un lien que quelqu’un a déjà partagé ne doit pas mener un jour ailleurs que là où vous l’avez choisi.

## Connecter votre propre domaine {#connecting-your-own-domain}

Connecter un domaine que vous possédez est disponible avec les offres payantes — voir [nos offres](/). Le sous-domaine de votre espace de travail est inclus dans toutes les offres et continue de fonctionner dans tous les cas.

Un domaine connecté sert _un_ projet, à sa racine : `roadmap.acme.com/` est la page de ce projet et `roadmap.acme.com/changelog` son journal des modifications. Le tableau en direct, les éléments de travail et la roadmap se trouvent dans l’application Motir, et leurs liens y mènent.

Vous créez deux types d’enregistrements chez votre registrar. **Ajoutez d’abord le domaine**, dans les paramètres du projet, sous _Adresse publique_ : le volet liste alors chaque enregistrement dont ce domaine a besoin, avec sa valeur exacte et un bouton de copie sur chacun. Les formes ci-dessous sont ce à quoi vous attendre — lisez-les pour vérifier que votre registrar peut les créer, et reprenez les valeurs du volet.

### 1 · Faire pointer le domaine vers nous {#point-the-domain-at-us}

Pour un **sous-domaine** tel que `roadmap.acme.com`, un seul `CNAME` :

| Type    | Nom       | Valeur                 |
| ------- | --------- | ---------------------- |
| `CNAME` | `roadmap` | indiquée dans le volet |

Pour un **domaine racine** tel que `acme.com`, un `A` et un `AAAA` à la place — un domaine racine ne peut pas recevoir de `CNAME`, car il porte déjà les enregistrements `MX` et `TXT` dont dépendent votre messagerie et vos autres services :

| Type   | Nom | Valeur                 |
| ------ | --- | ---------------------- |
| `A`    | `@` | indiquée dans le volet |
| `AAAA` | `@` | indiquée dans le volet |

Copiez chaque valeur depuis le volet plutôt que depuis ailleurs. Ce sont les adresses sur lesquelles Motir est servi, lues sur la plateforme que nous utilisons, et elles peuvent changer — le volet change avec elles, pas une page comme celle-ci.

> Si votre fournisseur DNS propose un interrupteur « proxy » ou « cloud » sur l’enregistrement, désactivez-le : un proxy placé devant l’enregistrement masque votre domaine à la vérification et le certificat ne peut pas être émis.

### 2 · Prouver que le domaine est le vôtre {#prove-the-domain-is-yours}

En plus de l’enregistrement de redirection, le volet liste un enregistrement `TXT` contenant un jeton, de la forme :

| Type  | Nom                     | Valeur           |
| ----- | ----------------------- | ---------------- |
| `TXT` | `_motir-verify.roadmap` | `motir-verify=…` |

Copiez la valeur depuis le volet plutôt que d’ici — le jeton n’est qu’à vous. Choisissez ensuite _Vérifier_. Dès que nous voyons l’enregistrement, nous sollicitons un certificat, ce qui prend généralement une minute ou deux. Vous pouvez fermer la page ; le statut continue d’évoluer de lui-même, et les enregistrements restent disponibles sous _Afficher les enregistrements DNS_.

## Ce que signifie chaque statut {#what-each-status-means}

[//]: # "Translator: the Status column names states the product itself shows. Use the label the app's own messages file for your locale gives each state, not a fresh translation, so this table matches the screen."

| Statut        | Ce que cela signifie                                                                                                                             | Que faire                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Non vérifié   | Nous n’avons pas encore vu votre enregistrement de propriété. Rien n’a été sollicité auprès de l’autorité de certification.                      | Créez l’enregistrement TXT ci-dessous, puis choisissez Vérifier de nouveau.             |
| Vérification… | Nous recherchons l’enregistrement de propriété en ce moment. Les changements DNS peuvent mettre quelques minutes à se propager.                  | Patientez un instant. Le statut évolue de lui-même.                                     |
| Émission…     | La propriété est prouvée et le certificat a été sollicité. Cela prend généralement une minute ou deux.                                           | Rien. Motir fait le reste.                                                              |
| En ligne      | Le certificat est émis et votre domaine sert le projet. Il se renouvelle de lui-même.                                                            | Vous pouvez faire de cette adresse l’adresse principale.                                |
| Échec         | Le certificat n’a pas pu être émis. La raison est affichée à côté du statut — le plus souvent un enregistrement manquant ou qui pointe ailleurs. | Comparez vos enregistrements avec ceux ci-dessous, puis choisissez Vérifier de nouveau. |
| Expiré        | Le certificat a expiré et le renouvellement a échoué — presque toujours parce qu’un enregistrement DNS a changé. Le domaine ne sert plus rien.   | Remettez les enregistrements comme ils étaient, puis choisissez Vérifier de nouveau.    |
| Révoqué       | Le certificat a été retiré. Le domaine ne sert plus rien.                                                                                        | Choisissez Relancer la requête pour obtenir un nouveau certificat.                      |

## Quelle adresse fait foi {#which-address-is-the-real-one}

Un projet peut répondre à plusieurs adresses, et exactement l’une d’elles est la _principale_ — celle dont les moteurs de recherche et les aperçus sociaux sont informés. Une fois le certificat d’un domaine connecté en ligne, vous pouvez en faire l’adresse principale ; d’ici là, c’est l’adresse Motir.

**Toute autre adresse redirige vers l’adresse principale.** Cela inclut votre adresse `motir.co` dès que vous avez promu un domaine qui vous appartient. Les visiteurs arrivent toujours à un endroit qui fonctionne, et un moteur de recherche voit une seule page plutôt que trois copies en concurrence.

## Retirer un domaine {#removing-a-domain}

Retirer un domaine connecté retire son certificat et l’adresse cesse de répondre — quiconque l’utilise obtiendra une erreur, et les liens déjà partagés vers elle cessent de fonctionner. Votre projet reste public à ses autres adresses : retirer un domaine ne rend donc jamais un projet privé.

## Si quelque chose ne fonctionne pas {#if-something-is-not-working}

Trois erreurs expliquent presque tous les échecs, et chacune se manifeste différemment dans le volet.

- **Un CNAME sur un domaine racine.** La plupart des registrars l’acceptent et cela ne fonctionne pas. Le symptôme est un domaine qui reste « Non vérifié » (`Not verified`) ou qui passe à « Échec » (`Failed`). Utilisez plutôt les enregistrements `A` et `AAAA` ci-dessus.
- **Un fournisseur DNS en proxy devant l’enregistrement.** Si votre fournisseur propose de relayer ou d’accélérer le trafic, cela nous masque le véritable enregistrement. Le symptôme est un « Vérification… » (`Checking…`) qui ne se stabilise jamais. Désactivez le proxy pour ces enregistrements.
- **Un enregistrement de propriété périmé.** Si vous avez retiré puis rajouté un domaine, le jeton a changé. Le symptôme est « Non vérifié » (`Not verified`) alors qu’un enregistrement `TXT` est bien présent. Remplacez sa valeur par celle qu’affiche le volet à présent.
