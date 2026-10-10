---
source: 656e3e6e6922
---

La API pública de lectura tiene versiones. La versión del contrato viaja en el campo `info.version` del documento OpenAPI que se sirve, y un cambio que rompe a un cliente es un cambio de versión, no una edición silenciosa.

## Qué garantiza `v1` {#the-guarantee}

Mientras `v1` esté vigente, sus rutas no se mueven, un `code` de error no cambia de significado, una condición existente no cambia de estado y un campo no cambia de tipo ni de nulabilidad. Cualquier cosa que rompa eso es una versión `v2`, no una versión de `v1`.

### Permitido dentro de `v1`, sin aviso {#allowed-inside-v1}

- Un endpoint nuevo.
- Un parámetro de consulta nuevo y OPCIONAL.
- Un campo nuevo en un objeto de respuesta.
- Una cabecera de respuesta nueva.
- Un valor nuevo en un campo documentado como abierto.
- Un presupuesto de límite de peticiones más alto.

### Requiere una versión mayor nueva {#needs-a-new-major}

- Eliminar un campo.
- Cambiar el nombre de un campo.
- Cambiar el tipo o la nulabilidad de un campo.
- Eliminar un `code` de error o darle otro uso.
- Cambiar un estado existente para una condición existente.
- Endurecer un límite.
- Hacer obligatorio un parámetro opcional.

## Tu parte de la promesa {#your-obligation}

**Un cliente DEBE tolerar campos y valores desconocidos, y NO DEBE analizar la frase `error` pensada para personas.** Esta es la otra mitad de la promesa, y sin ella la garantía anterior no se sostiene: un cliente que rechaza un campo que no reconoce se romperá con un cambio que esta página llama seguro, y un cliente que analiza `error` se romperá con una frase reformulada. Ramifica según `code`, ignora lo que no conozcas y todo cambio aditivo te sale gratis.

## Obsolescencia {#deprecation}

Una operación o un campo obsoletos se marcan con `deprecated: true` **en la especificación**, y llevan en su descripción el motivo y su sustituto. La especificación es el canal de anuncio porque es el único artefacto que todos los clientes ya leen, así que un generador de código muestra la obsolescencia sin que nadie tenga que haber visto una entrada de blog.

El comportamiento antiguo sigue funcionando durante el plazo anunciado. Un campo nunca se elimina por sorpresa.

## Cómo llegaría una `v2` {#how-v2-arrives}

Como un SEGUNDO documento en una segunda ruta, servido junto a `v1`, no como una reescritura de ella. `v1` no deja de funcionar el día en que sale `v2`, y declarar obsoleta `v1` es en sí un anuncio sujeto al mismo plazo.

El `info.version` de la especificación es la versión del contrato de la API, no el número de versión de la aplicación: su major es la versión de la ruta, su minor aumenta con un cambio aditivo de la lista anterior y su patch con una corrección que solo afecta a la documentación. Léelo en cualquier respuesta como `X-Motir-Api-Version`; [Primeros pasos](/docs/api/getting-started) muestra dónde.

Esta página es el compromiso publicado. El registro interno a partir del cual está escrita es [el registro de decisiones de la API](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
