---
source: cdc9936762b4
---

Un entorno aislado es un contenedor que inicias en tu propia máquina, con tu propio agente, la Motir CLI y tus checkouts, y nada más. Aportas tu propia credencial de agente, montada en solo lectura; el bucle se ejecuta dentro, de modo que un agente que se porte mal alcanza tu árbol de trabajo y no el resto de tu máquina.

[//]: # "The page's spine is the step sequence (MOTIR-4993): the explanation moved BELOW it, under 'Why it looks like this', and that includes the confinement list. A reader mid-setup wants the procedure; a reader deciding whether to trust the thing is not in a hurry."

## Antes de empezar {#before-you-start}

- **Docker, en ejecución.** Compilado para `linux/amd64` **y** `linux/arm64`, así que Apple Silicon es una máquina de primera clase y no se emula nada. No hay paso de compilación: descargas la imagen.
- **El inicio de sesión propio de tu agente, en esta máquina.** Su montaje de credenciales es de solo lectura, así que el contenedor puede usar un inicio de sesión pero no renovarlo. Claude Code en macOS es la excepción que encontrarás: guarda su token en el llavero de inicio de sesión, así que no hay ningún archivo que montar, y en su lugar inicias sesión en `claude` **dentro** del contenedor: la imagen le da un directorio de configuración escribible, y ahí es donde queda el inicio de sesión. (Antigravity es igual; el paso 2 lo dice cuando lo eliges.)
- **La raíz de tu espacio de trabajo: la carpeta que CONTIENE tus checkouts.** Un proyecto suele abarcar varios repositorios y el bucle se ejecuta sobre todos ellos.

{{slot:workspace}}

{{part:picker-label}}

¿Qué agente usas?

{{part:picker-also-supported}}

también compatibles

{{part:picker-or}}

o

{{part:picker-base}}

sin agente (base)

{{part:picker-summary}}

Todos los comandos de abajo son para **{{value:profileLabel}}**. Cambiar de agente reescribe la etiqueta y el montaje de credenciales en los **pasos 1, 2 y 2b**, los tres lugares en los que aparecen.

{{part:chip-command}}

Comando

{{part:chip-editor}}

En tu editor

{{part:steps-intro}}

## Configúralo {#set-it-up}

Cinco pasos. Cada uno es una sola cosa que hacer.

{{part:step-1-intent}}

Descarga la imagen de tu agente

{{part:step-1-body}}

No hay paso de compilación: la imagen se publica por perfil de agente.

{{part:step-2-intent}}

Inicia el contenedor desde la raíz de tu espacio de trabajo

{{part:step-2-body}}

Ejecútalo desde la carpeta que **contiene** tus checkouts, no desde ninguno de ellos.

{{part:step-2-vscode}}

**¿Prefieres usar VS Code?** Los pasos 2a–2c de abajo sustituyen a este. Todo lo que viene después es igual en ambos casos.

{{part:step-2a-intent}}

Instala la extensión Dev Containers

{{part:step-2a-body}}

Desde la vista Extensiones, o desde la paleta de comandos (⇧⌘P en macOS, Ctrl+Shift+P en los demás, F1 en los tres) y luego _Extensions: Install Extensions_. Dos de estos tres pasos ocurren en la paleta, así que conviene anclarla ya.

{{part:step-2b-intent}}

Crea la configuración del contenedor de desarrollo

{{part:step-2b-body}}

Ejecútalo en la carpeta que vas a montar. Se pega de una sola vez: crea la carpeta `.devcontainer` y escribe el archivo dentro. No intentes crearlos desde un selector de archivos: Finder y la mayoría de los selectores gráficos rechazan un nombre que empieza por punto, y lo rechazan sin explicar por qué.

{{part:step-2b-warning}}

**Un contenedor de desarrollo conserva la imagen a partir de la cual se creó.** `--pull=always` pertenece al comando de ejecución del paso 2, no a esta vía. Para pasar a la imagen actual y a la CLI `motir` actual: **1.** ejecuta el `{{value:dockerPull}}` del paso 1 en un terminal de tu máquina; **2.** _Dev Containers: Open Folder in Container…_ sobre esta carpeta, que conecta la ventana; **3.** _Dev Containers: Rebuild Container_, que recrea el contenedor a partir de la imagen que acabas de descargar. Rebuild Container solo aparece en una ventana conectada al contenedor, y por eso el paso 2 va primero. Una reconstrucción conserva tu inicio de sesión de Motir (vive en el volumen `{{value:authVolume}}`) pero no un inicio de sesión de Claude Code hecho dentro del contenedor: ejecuta `claude` e inicia sesión de nuevo.

{{part:step-2c-intent}}

Abre la carpeta en el contenedor

{{part:step-2c-body}}

Paleta de comandos → _Dev Containers: Open Folder in Container…_, y elige la carpeta en la que acabas de escribir el archivo. Su terminal es el mismo shell en el que te habría dejado el paso 2; continúa en el paso 3.

{{part:step-3-intent}}

Inicia sesión, dentro del contenedor

{{part:step-3-body}}

Se imprimen un código y una URL; apruébalo en cualquier navegador. El inicio de sesión queda en el volumen `{{value:authVolume}}`, así que lo haces una sola vez.

{{part:step-4-intent}}

Vincula la carpeta a tu proyecto

{{part:step-4-body}}

Sustituye `ACME` por la clave de tu proyecto. Si tu espacio de trabajo tiene exactamente un proyecto, omite la opción: ese es todo el paso.

{{part:step-5-intent}}

Compruébalo: todo en verde es el final de esta página

{{part:step-5-body}}

Autenticación, vínculo, el binario del agente y su credencial. Es lo único que te dice que el contenedor realmente recibió lo que le pasaste.

[//]: # "A profile's own caveat on step 2: one part per profile that has one, named note-<profile id>. A profile with no part has no note."

{{part:note-opencode}}

OpenCode guarda la configuración y las credenciales en dos sitios, así que lleva dos líneas `-v`. Hacen falta las dos.

{{part:note-antigravity}}

Antigravity guarda su token en el llavero del sistema operativo, que no tiene ningún archivo portable que montar; por eso no hay línea `-v` para él, e inicias sesión DENTRO del contenedor en lugar de antes de empezar. Es el único perfil para el que no se aplica la segunda condición previa de arriba.

{{part:note-aider}}

La credencial de Aider es una clave de API de modelo que lee del entorno, así que es el único perfil que añade una línea `-e`. El montaje es de un ARCHIVO, que debe existir (aunque esté vacío) o docker crea un directorio en su lugar.

{{part:note-base}}

La imagen base lleva la Motir CLI y ningún agente: no hay nada que montar ni nada en lo que iniciar sesión aparte de Motir.

{{part:devcontainer-file}}

### El archivo que escribe ese comando {#devcontainer-file}

Es una referencia, no un paso: el 2b ya lo escribió. Está aquí para quien prefiera crear el archivo a mano, y porque las comillas de `<<’JSON’` son imprescindibles: impiden que tu shell expanda `${localWorkspaceFolder}` y `${localEnv:HOME}` antes de que lleguen al archivo. Son sustituciones de Dev Containers y es el editor quien las resuelve.

{{part:why}}

## Por qué es así {#why}

### Qué cambia el selector de perfil {#profile-picker}

Elegir un agente reescribe tres cosas y nada más: la **etiqueta** de la imagen, las líneas `-v` de credenciales y los campos `image`, `name` y `mounts` del contenedor de desarrollo. Es un control y no un párrafo que te diga que los cambies tú, porque cada comando de aquí tiene un botón Copiar, y quien copia es quien no leyó la instrucción de cambio.

No todos los perfiles tienen un único directorio de credenciales. `opencode` guarda dos y lleva dos líneas `-v`; `antigravity` guarda su token en el llavero del sistema operativo y no lleva ninguna, e inicia sesión dentro del contenedor; y `aider` monta un archivo y lee una clave de modelo del entorno. Los pasos lo dicen cuando los eliges.

### En el comando de ejecución no se conserva nada que pueda quedar obsoleto {#run-command}

`--pull=always` descarga la imagen actual en cada inicio, de modo que una etiqueta de perfil que se ha movido te llega sin que tengas que notar que se movió, y `--rm` significa que no se conserva nada que pueda quedar obsoleto. No hay una vía separada para volver a ello, y eso es justo lo que antes dejaba a la gente ejecutando un `motir` meses más antiguo que la página desde la que lo leían. Tu inicio de sesión sobrevive a todo eso: se escribe en el volumen `{{value:authVolume}}`, que vive fuera del contenedor, así que inicias sesión una vez y cada ejecución posterior lo recoge; cierra sesión definitivamente con `{{value:signOutCommand}}`. ¿Trabajas sin conexión? Quita `--pull=always`: llega al registro en cada inicio, así que sin red la ejecución falla en lugar de recurrir a la imagen que ya tienes. Todo esto es del comando de ejecución. Un contenedor de desarrollo (pasos 2a–2c) conserva la imagen a partir de la cual se creó hasta que descargas, te conectas con _Dev Containers: Open Folder in Container…_ y eliges _Dev Containers: Rebuild Container_.

### Siguientes pasos {#what-next}

`motir run` recibe un ALCANCE: un elemento de trabajo, una historia entera o `sprint` para el activo. `motir auto` vacía en cambio el conjunto de elementos listos sin supervisión, de uno en uno, sobre una rama de sesión. Todas las opciones que aceptan ambos están en la página de [{{value:cliPage}}](/docs/cli).

## Qué confina y qué no {#confines}

Conviene leerlo antes de depender de ello, porque una de estas tres es una excepción y no una garantía.

- **Sistema de archivos: confinado.** Las únicas superficies del host dentro del contenedor son un `/workspace` escribible y la credencial propia de tu agente, montada en solo lectura. Sin socket de Docker y sin ningún otro montaje del host.
- **Red: ABIERTA, por diseño.** Todo agente necesita la API de su proveedor y todo elemento de trabajo despachado necesita remotos de git, así que la imagen confina el radio de impacto sobre el sistema de archivos y no la salida de red. Si tu modelo de amenazas necesita más, recurre a los controles de red del propio Docker: el contenedor no impedirá que un agente hable con internet.
- **Privilegios: sin privilegios.** Se ejecuta como el usuario `node` (uid 1000), de modo que los archivos escritos en el montaje siguen siendo tuyos y no de root.

## Qué te da el entorno {#environment}

- **Tu carpeta, montada.** `$PWD` pasa a ser `/workspace`, así que los checkouts en los que trabaja la ejecución son tuyos y los commits que hace están en tu disco cuando termina.
- **Un checkout por elemento de trabajo, en un git worktree.** Una ejecución no edita el árbol en el que estás sentado; añade un worktree por elemento, de modo que las ejecuciones en paralelo no pueden chocar en un checkout de rama.
- **Tu credencial de agente, en SOLO LECTURA.** El directorio de credenciales del perfil se monta con `:ro`. Nada dentro del contenedor puede reescribirlo, y nada de él se envía a Motir: es traer tu propia clave, así que la factura del agente es tuya y la llamada a la API no pasa por nosotros.
- **La CLI, preinstalada.** La imagen lleva `motir` y el binario del agente que nombra la etiqueta, así que no hay nada que instalar antes de la primera ejecución.
- **La salida de tu agente se queda en local por defecto.** Solo el ciclo de vida de la ejecución llega a Motir. Pasar `--report-log` envía además el final de la salida para que una ejecución fallida la muestre en su página de ejecución; está DESACTIVADO salvo que lo pidas, y el contenido de los archivos, las rutas y los diffs nunca se envían en ningún caso.

## Qué puede hacer el token y qué rechaza {#token}

Un token creado por `motir login` lleva una concesión fija y restringida. La pantalla de aprobación la muestra y no puede cambiarla, ni ampliarla ni reducirla, porque una concesión recortada a mano rompe un bucle sin supervisión a mitad de camino.

{{slot:grant}}

**El que NO lleva es `ai:view_plan`, y el rechazo que sigue es el diseño y no un error.** Abrir un plan solo necesita `work_item:edit`, así que una ejecución en un entorno aislado PUEDE abrir uno, y luego se le rechaza en su primera adición, porque esa es la clave que comprueba la incorporación de propuestas. Una ejecución que realiza un elemento de trabajo no puede remodelar el plan que se le entregó. Cuando te encuentres con ese rechazo, el agente ha hecho lo correcto: registra la corrección como comentario, deja el elemento bloqueado y se detiene. No se pierde nada, y una persona decide qué debe decir el plan.

Dos opciones lo restringen aún más cuando quieres una ejecución más silenciosa: `--disable-log-bug` impide que el agente registre un Error por un defecto que encuentra en otro sitio (comenta en su lugar), y `--disable-replan` impide que presente una nueva planificación de un elemento de trabajo que considera incorrecto (comenta y se detiene). Solo en `motir auto`, `--auto-approve-replan` va en el sentido contrario: aprueba una nueva planificación presentada y sigue en el bucle, en lugar de detenerse para que decidas tú.

## Qué produce una ejecución y dónde leerlo {#produces}

- **Una rama y una pull request** en cada repositorio en el que se entrega el elemento, subidas con tus credenciales de git desde dentro del contenedor.
- **Un vínculo en el elemento de trabajo.** La ejecución declara qué elemento entrega cada pull request, de modo que fusionarla hace avanzar el elemento. Ese vínculo es lo que muestra el panel Desarrollo de la página del elemento, y es lo que cierra el elemento al fusionar, no el nombre de la rama ni el título.
- **El estado, sobre la marcha.** El elemento pasa a En curso cuando la ejecución lo reclama y a Implementado cuando se abre la pull request. En revisión lo escribe CI cuando las comprobaciones pasan a verde, y Hecho lo escribe la fusión.
- **El terminal.** La salida del propio agente se queda en tu terminal salvo que pasaras `--report-log`.

## Cuando no funciona {#troubleshooting}

### No se encuentra el binario del agente {#agent-binary-not-found}

La etiqueta y el agente no coinciden. Comprueba qué perfil iniciaste, o apunta la ejecución a otro binario con `--agent <cmd>`. `motir doctor` lo informa antes de que una ejecución gaste una reclamación en ello.

### El agente arranca y no está autenticado {#agent-not-authenticated}

Falta el montaje de credenciales o apunta al directorio equivocado: cada perfil monta el suyo. Vuelve a ejecutar la línea `{{value:dockerRun}}` de la etiqueta que realmente descargaste.

### No hay nada listo para ejecutar {#nothing-ready}

Todos los candidatos tienen una dependencia sin cumplir. `motir ready` muestra el conjunto; `motir show` sobre un elemento de trabajo nombra lo que lo bloquea. Despachar de todos modos es `--force`, solo un elemento.

### La ejecución se detiene por una nueva planificación presentada {#stopped-on-replan}

El agente consideró incorrecto el elemento de trabajo y propuso una forma corregida. Es la detención prevista: lee el plan en Motir y apruébalo o recházalo. Para mantener en marcha un bucle sin supervisión, ejecuta `motir auto` con `--auto-approve-replan`.

### Una ejecución dejó trabajo atrás después de terminar {#work-left-behind}

Los worktrees y las ramas están en tu disco, bajo la carpeta que montaste: un contenedor que se detuvo no se los llevó. `motir done` cierra un elemento fusionado, o una rama de sesión fusionada entera con `--session <branch>`.

## Qué no cubre esta página {#not-covered}

Cada comando y cada opción: eso es la [{{value:cliPage}}](/docs/cli), generada a partir del catálogo de la propia CLI y que no puede desviarse de él. Conectar un agente a Motir directamente, sin la CLI, es [{{value:mcpPage}}](/docs/mcp). Manejar el mismo bucle de trabajo por HTTP en lugar de desde un terminal es la [{{value:apiPage}}](/docs/api). Ejecutar el entorno aislado en un sitio que no sea tu propia máquina todavía no está documentado aquí. (La vía de VS Code SÍ está documentada, arriba: esa cláusula decía lo contrario, y estaba registrando como decisión una sección eliminada.)
