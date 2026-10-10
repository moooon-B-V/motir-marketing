---
source: f11baeff4d7b
---

{{slot:catalogue-summary}}

Cette liste est récupérée auprès de Motir à chaque affichage de la page ; elle reflète donc ce que le serveur fournit à l’instant. Chaque outil indique les arguments qu’il prend (leurs noms, leurs types et lesquels sont obligatoires), lus dans le même registre que celui qui répond à un handshake `tools/list` sur le point de terminaison indiqué plus haut, lequel reste la surface de référence et porte la description complète de chaque outil. Les outils qu’un token donné peut appeler dépendent de l’autorisation qu’il porte : la liste affichée par votre client est donc déjà limitée à ce qui vous concerne.

{{slot:hint-legend}}

Les tableaux d’arguments s’affichent sur un seul niveau : un objet imbriqué ou une liste indique son type, et le handshake fournit la forme qu’il contient.

{{slot:catalogue}}

[Serveur MCP](/docs/mcp) explique comment connecter un agent au point de terminaison et quel token il faut.
