---
source: 8e83d53f1b7a
---

Conecta Sentry a un proyecto de Motir y los errores que tus servicios ya reportan llegan al tablero de ese proyecto como elementos de trabajo de tipo Error, planificados, asignados y llevados hasta Hecho como cualquier otro trabajo. Corregir el Error cierra el ciclo: Motir resuelve por ti el error en Sentry.

## Qué hace {#what-it-does}

- **Cada error nuevo se convierte en un Error.** Motir revisa con una cadencia programada los proyectos de Sentry que elegiste. Un error que no ha visto antes se registra como un elemento de trabajo `bug` en el destino de errores del proyecto, con el culpable del error, su nivel y un enlace de vuelta a Sentry.
- **Una repetición actualiza el mismo Error.** Cuando un error vuelve a ocurrir, se actualiza su Error existente: no se registra un duplicado.
- **Hecho en Motir significa resuelto en Sentry.** Cuando el Error llega a un estado de hecho, Motir resuelve su error en Sentry.
- **El responsable de Sentry acompaña al error.** Si un error está asignado a alguien en Sentry y esa persona es miembro del espacio de trabajo de Motir (se compara por correo electrónico), el Error se le asigna.

Ambos sentidos se pueden desactivar, por proyecto monitorizado; consulta [Configuración](#settings).

## Antes de empezar {#before-you-start}

- En Motir, necesitas permiso para gestionar las integraciones del proyecto. Sin él, la página Monitorización te dice a quién pedírselo.
- En Sentry, necesitas permiso para instalar integraciones en tu organización, normalmente un propietario o un gestor.

## Conecta Sentry {#connect-sentry}

1. En Motir, abre la configuración del proyecto y elige _Monitorización_.
2. Elige _Conectar Sentry_. Te lleva a Sentry.
3. En Sentry, elige tu organización y aprueba la instalación. Sentry te devuelve a Motir, que muestra _Sentry está conectado._
4. Elige _Elegir proyectos de Sentry_, selecciona los proyectos cuyos errores deben llegar a este tablero y confirma. No llega nada hasta que lo hagas.

Puedes monitorizar varios proyectos de Sentry desde un mismo proyecto de Motir, y añadir más después con _Añadir un proyecto monitorizado_.

## Configuración {#settings}

Cada proyecto monitorizado tiene su propia configuración:

- **Nivel mínimo**: solo se registran los errores de este nivel o superior. El valor por defecto es _Todos los niveles_. Elegir un nivel más bajo también revisa los errores anteriores desde el momento en que se empezó a monitorizar el proyecto.
- **Resolver en Sentry cuando el Error esté hecho**: activado por defecto. Desactívalo para dejar los errores en Sentry tal como están cuando sus Errores están hechos.
- **Tomar el Responsable de Sentry**: activado por defecto. Desactívalo para ignorar las asignaciones hechas en Sentry.

## Permisos que solicita {#permissions-it-asks-for}

Motir pide a Sentry el conjunto más pequeño de permisos que necesitan estas funciones, y nada más amplio:

| Alcance de Sentry | Para qué lo usa Motir                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org:read`        | Leer qué organización se conectó, enumerar sus proyectos para que puedas elegir cuáles monitorizar y comprobar que la conexión sigue funcionando.                                                                             |
| `project:read`    | Leer los proyectos que elegiste monitorizar.                                                                                                                                                                                  |
| `event:read`      | Leer los errores nuevos de los proyectos monitorizados (su título, nivel, culpable, cuántas veces ocurrieron, los últimos marcos de la traza de pila y a quién están asignados) para que cada uno pueda llegar como un Error. |
| `event:write`     | Marcar un error como resuelto en Sentry cuando su Error está hecho. No se escribe nada más.                                                                                                                                   |

El acceso que concede Sentry se guarda cifrado y no se muestra de vuelta a nadie, tampoco a ti.

## Cuando la conexión muestra Degradado {#when-the-connection-shows-degraded}

_Degradado_ significa que Motir ya no puede leer los errores de tu organización, y no llega nada nuevo al tablero hasta que se arregle. Junto a _Sentry dice:_ la página muestra el motivo con las propias palabras de Sentry.

- Elige primero _Volver a comprobar_: un problema pasajero del lado de Sentry se resuelve solo.
- Si sigue degradada, elige _Volver a conectar_. Si Sentry dice que la integración ya está instalada, desinstala Motir en la configuración de integraciones de tu organización de Sentry y luego elige _Volver a conectar_ otra vez. Se conservan tus proyectos monitorizados, su configuración y los Errores ya registrados.

## Desconectar {#disconnect}

Para dejar de monitorizar un proyecto de Sentry, usa _Dejar de monitorizar_ en su fila. Quitar el último proyecto monitorizado es _Desconectar Sentry_: también elimina el acceso guardado de Motir a tu organización, y para volver a monitorizarla te conectas a través de Sentry de nuevo.

Los Errores ya registrados permanecen en el tablero como elementos de trabajo normales. Desconectar no cambia nada en Sentry. Para revocar también el acceso en el lado de Sentry, desinstala Motir en la configuración de integraciones de tu organización de Sentry.
