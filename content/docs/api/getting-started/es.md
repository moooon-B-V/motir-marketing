---
source: 1c84b9f042c7
---

La API pública de lectura es anónima: cada endpoint de lectura devuelve datos del proyecto sin iniciar sesión, y eso es lo que permite que la plaza de proyectos funcione para un visitante sin sesión. Todo lo que está ligado a una cuenta lleva un token. A continuación hay cinco pasos, y cada uno termina con algo que puedes ver ocurrir.

Cada ruta es relativa al host de la aplicación al que apunta esta compilación, que se muestra más abajo. Las peticiones están escritas contra él, así que puedes copiar cualquiera tal cual.

{{slot:app-host}}

## 1. Crea un token {#mint-a-token}

Crea un token de acceso personal en Configuración → Cuenta → Tokens, elige el espacio de trabajo al que queda ligado y concédele los permisos que necesita: los mismos nombres `resource:action` que muestra la pantalla Roles y permisos. Concede el conjunto más reducido que baste para el trabajo: una concesión restringe tu propio rol y nunca lo amplía, así que un token no puede hacer algo que tú no podrías.

**El secreto se muestra UNA sola vez, cuando se crea el token.** Cópialo entonces; no hay forma de volver a leerlo, y un token perdido se sustituye en lugar de recuperarse.

## 2. Tu primera llamada autenticada {#first-call}

Haz esta llamada primero. Responde quién es el token, a qué espacio de trabajo está ligado y exactamente qué permisos lleva, de modo que sabes qué puede hacer tu propia credencial sin probar endpoints ni acumular rechazos.

{{slot:first-call-request}}

{{slot:first-call-response}}

Un token ausente, mal formado, desconocido, revocado o caducado devuelve el mismo `401` con el mismo mensaje. Es deliberado: distinguirlos convertiría el endpoint en un oráculo que responde a “¿existe este secreto?”.

## 3. Pagina una colección {#paginate}

Las colecciones se paginan con cursor. Pide un tamaño de página con `limit` (el valor por defecto es 50 y cualquier valor mayor se limita a 100, no se rechaza) y luego envía el `nextCursor` de la respuesta anterior como `cursor`. Un `nextCursor` igual a `null` indica la última página.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

El cursor es OPACO y está firmado. No lo analices, no construyas uno ni lo lleves de una colección a otra: un cursor emitido en otro sitio produce un `422`, nunca una página incorrecta sin avisar. Devuelve exactamente lo que se te dio.

Hay una asimetría que sorprende a la gente, así que conviene conocerla antes de encontrarla: algunas colecciones informan además de un `totalCount` y la mayoría deliberadamente no lo hacen. Cuando la lectura que hay detrás de una colección ya calcula uno como agregado acotado, se informa; en los demás casos el campo se omite POR COMPLETO, ausente, nunca `null` y nunca `0`, de modo que un cliente siempre puede distinguir “no se prometió ningún total” de “el total es cero”.

## 4. Lee un error {#read-an-error}

Todo fallo devuelve el mismo cuerpo: un `code` para máquinas y un `error` para personas. Ramifica según `code`: es estable, y cambiar uno es un cambio incompatible. Nunca analices `error`; es una frase para un desarrollador que lee un terminal y se reformula libremente.

{{slot:error-404-response}}

Un `404` significa que el recurso no existe **o** está fuera del espacio de trabajo al que está ligado tu token. La respuesta es la misma a propósito, para que la API no pueda usarse para enumerar los datos de otro inquilino. Un `403` es el tipo de rechazo contrario: tu token es válido y su concesión carece del permiso que exige esta operación, y la respuesta nombra la clave. Un `422` es una petición que puedes corregir, y su `code` indica qué parte.

**Un `500` es el único fallo SIN `code`.** Un fallo inesperado no tiene un contrato estable, así que el cuerpo lleva un mensaje y nada más: no ramifiques según él.

## 5. Lee las cabeceras de respuesta {#rate-limits}

El presupuesto es por TOKEN, y las cabeceras acompañan a TODAS las respuestas: un éxito, un rechazo, un error controlado y un fallo por igual. Nunca tienes que hacer una petición para saber en qué punto estás; la última ya te lo dijo.

{{slot:response-headers}}

Con un `429`, espera hasta `X-RateLimit-Reset`, una marca de tiempo Unix en SEGUNDOS. No hay cabecera `Retry-After`, deliberadamente: un instante absoluto no puede quedar obsoleto en tránsito como sí puede una duración relativa.

`X-Request-Id` también va en todas las respuestas. Cítalo si alguna vez necesitas preguntarnos por una llamada concreta: es el único identificador que la localiza.

`X-Motir-Api-Version` es la versión del CONTRATO que sirvió la respuesta: la misma `MAJOR.MINOR.PATCH` que el `info.version` de la especificación, no nuestro número de versión de la aplicación. Léela en cualquier respuesta, incluido un fallo, para detectar desajustes de versión. Un MAJOR que no reconozcas significa que existe un `/api/v2`; un MINOR más alto significa que el contrato creció, de forma aditiva, y tu cliente sigue siendo correcto. Si el bloque anterior muestra un marcador de posición en lugar de una versión, la especificación no estaba disponible cuando se generó esta página, y [Referencia de la API](/docs/api) lee la versión actual directamente del documento.

## Siguientes pasos {#what-next}

[Referencia de la API](/docs/api) enumera cada operación con sus parámetros, su cuerpo y sus estados. [Estabilidad y obsolescencia](/docs/api/stability) es lo que el contrato promete no hacerte. Si estás conectando un agente en lugar de escribir un cliente, el [servidor MCP](/docs/mcp) es la otra mitad.
