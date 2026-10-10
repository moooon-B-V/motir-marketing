---
source: 38ac3b50e511
---

Las skills de Motir permiten que el agente que ya usas trabaje en tu proyecto de Motir. Di `motir run` y toma el siguiente elemento de trabajo listo, lo construye y abre una pull request vinculada. Di `motir log bug` y comprueba el defecto y lo registra donde corresponde. Di `motir mark` y cierra un elemento de trabajo manual cuando ya lo has hecho. Di `motir guide` y te guía por un elemento de trabajo manual paso a paso.

Son [Agent Skills](https://agentskills.io) corrientes: una carpeta por skill, cada una con un `SKILL.md`, publicadas en [{{value:skillsRepo}}]({{value:repoUrl}}). Cada comando de esta página instala la versión [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Antes de empezar {#before}

Las skills hablan con Motir a través de su servidor MCP. En Claude Code, el plugin lo conecta por ti: inicias sesión con tu cuenta de Motir en el navegador y no hay token. Cualquier otro agente necesita que ese servidor esté conectado primero: un proyecto de Motir, un token de acceso personal y la configuración de tu agente en la guía de [{{value:mcpPage}}](/docs/mcp), que también explica la vía del token en Claude Code si no puedes usar el inicio de sesión en el navegador. Un token con los permisos por defecto puede hacer todo lo que hacen estas skills. También necesitas `git` y la CLI de GitHub (`gh`) para las skills que abren o leen pull requests.

## Instalación {#install}

Elige tu agente. Cada sección instala todas las skills de la versión para todos los proyectos de tu máquina. Los comandos de terminal son para macOS y Linux: descargan la versión, copian las carpetas de las skills en la carpeta que lee ese agente y eliminan la descarga.

### Claude Code {#claude-code}

El repositorio es también un marketplace de plugins de Claude Code. Añádelo en la etiqueta de la versión y luego instala el plugin. Una sola instalación trae las skills, el servidor MCP de Motir y un ejecutor para su CLI, y conecta Motir sin token.

- **Las siete skills.** Todas las skills de la versión, enumeradas bajo el nombre del plugin.
- **El servidor MCP de Motir.** Claude Code inicia sesión en él en el navegador la primera vez que se usa: ejecuta `/mcp`, elige `motir` y selecciona _Authenticate_, luego elige el espacio de trabajo y aprueba en la pantalla de consentimiento de Motir. No hay ningún token que crear ni pegar. [Añade Motir a Claude](/docs/mcp#claude)
- **El ejecutor `motir`.** Ejecuta la CLI de Motir fijada con `npx`, así que no se instala nada de forma global. Necesita Node.js 22 o posterior, y la CLI inicia sesión por su cuenta con `motir login`.

{{slot:claude-code-plugin}}

{{slot:claude-code-copy}}

Para comprobarlo: `/plugin` muestra `motir` en `{{value:releaseVersion}}`, y `/mcp` enumera `motir`. Las skills de un plugin aparecen bajo el nombre del plugin, por ejemplo `/motir:motir-run`. Copiar las skills trae solo las skills: conecta tú mismo el servidor MCP, como hacen los demás agentes. Para un solo repositorio, copia en cambio en `.claude/skills` de ese repositorio. · [Documentación de Claude Code]({{value:claudeCodeDocsUrl}}) · comprobado {{value:checkedOn}}

### Codex {#codex}

Codex lee las skills de `.agents/skills`: en tu carpeta personal para todos los repositorios, o en un repositorio solo para ese repositorio.

{{slot:codex}}

Codex detecta las skills nuevas por sí solo. Si no aparecen, reinícialo. · [Documentación de Codex]({{value:codexDocsUrl}}) · comprobado {{value:checkedOn}}

### Cursor {#cursor}

Cursor lee las skills de `~/.cursor/skills` para todos los proyectos, y de `.cursor/skills` en un proyecto.

{{slot:cursor}}

Cursor también lee `~/.agents/skills` y `~/.claude/skills`, así que las skills que ya copiaste para Codex o Claude Code se recogen sin una segunda copia. · [Documentación de Cursor]({{value:cursorDocsUrl}}) · comprobado {{value:checkedOn}}

### Gemini CLI {#gemini-cli}

Gemini CLI lee tus propias skills de `~/.gemini/skills`, y las de un espacio de trabajo de `.gemini/skills`.

{{slot:gemini-cli}}

Ejecuta `gemini skills list` para comprobar que se encontraron. Gemini CLI también lee `~/.agents/skills`. · [Documentación de Gemini CLI]({{value:geminiCliDocsUrl}}) · comprobado {{value:checkedOn}}

### GitHub Copilot en VS Code {#copilot-vs-code}

Copilot en VS Code lee tus skills personales de `~/.copilot/skills`, y las de un proyecto de `.github/skills`.

{{slot:copilot-vs-code}}

También lee `~/.claude/skills` y `~/.agents/skills`. No hace falta activar ningún ajuste para estas carpetas. · [Documentación de GitHub Copilot en VS Code]({{value:copilotDocsUrl}}) · comprobado {{value:checkedOn}}

### OpenCode {#opencode}

OpenCode lee tus propias skills de `~/.config/opencode/skills`, y las de un proyecto de `.opencode/skills`.

{{slot:opencode}}

También lee `~/.claude/skills` y `~/.agents/skills`. Ejecuta `opencode debug skill` para ver lo que encontró. · [Documentación de OpenCode]({{value:opencodeDocsUrl}}) · comprobado {{value:checkedOn}}

Después pregunta a tu agente qué skills tiene. Aparecen {{value:releaseSkills}}. Otro agente que lea skills `SKILL.md` funciona igual: copia las carpetas de las skills en la carpeta de la que lee sus skills.

## Uso {#use}

Escribe en tu agente lo que figura bajo **Di**. Sustituye `ACME-12` por la clave de un elemento de trabajo de tu propio proyecto.

### `motir-run` {#motir-run}

**Di**

- `motir run`
- `motir run ACME-12`
- `motir next`

**Qué ocurre**

Toma el siguiente elemento de trabajo listo de tu proyecto, o el que nombres, y lo construye. Primero ordena lo que dejaron las ejecuciones anteriores cuyas pull requests ya se fusionaron; luego reclama el elemento de trabajo, lo construye en una rama propia, abre una pull request y la vincula al elemento de trabajo. Si nombras una historia cuyos hijos no tienen hijos propios, ejecuta la historia entera: una rama y una pull request por repositorio, con un commit por cada hijo. `motir next` se detiene tras la reclamación e imprime el prompt, para que se lo entregues tú mismo a un agente. Un elemento de trabajo de decisión es la única excepción: escribe la página de decisión y la publica para que la apruebes, sin rama y sin pull request.

**Qué ves en Motir**

El elemento de trabajo se te asigna y pasa a En curso, y luego a Implementado cuando su pull request está abierta. Su página muestra la pull request y una sección Cómo probar. Motir lo pasa a En revisión cuando CI pasa y a Hecho cuando se fusiona la pull request; la skill nunca hace ninguna de las dos cosas.

### `motir-fix` {#motir-fix}

**Di**

- `motir fix ACME-12`

**Qué ocurre**

Repara una pull request en rojo después de que haya terminado la ejecución que la abrió: sus comprobaciones fallaron, la cola de fusión la expulsó o un revisor devolvió el video de aceptación de la historia con Volver a ejecutar. Primero reclama la reparación, para que nadie más suba cambios encima. Después arregla cada pull request del elemento de trabajo en la rama que ya tiene, nunca en una nueva: fusiona la rama base, corrige lo que nombró la comprobación fallida y sube los cambios. Sigue hasta que CI esté en verde o lo haya intentado cinco veces, y vuelve a grabar el video de aceptación cuando CI está en verde tras un Volver a ejecutar. Nunca abre una pull request, ni fusiona una, ni cambia el estado del elemento de trabajo. No es lo mismo que `motir fix bugs`, que recorre la carpeta Errores de tu proyecto: `motir fix ACME-12` repara las pull requests de un solo elemento de trabajo que nombras.

**Qué ves en Motir**

Mientras se ejecuta la reparación, la sección Desarrollo del elemento de trabajo dice que se está reparando, y quién lo hace. Las mismas pull requests reciben commits nuevos, y Motir hace avanzar el elemento de trabajo por sí solo en cuanto pasan sus comprobaciones. Si la reparación se rinde, el elemento de trabajo lo dice e indica cuántos intentos hizo.

### `motir-continue` {#motir-continue}

**Di**

- `motir continue ACME-12`

**Qué ocurre**

Continúa un elemento de trabajo cuya ejecución murió a medias: se cerró el portátil, se perdió el entorno aislado o se mató el proceso. El elemento de trabajo sigue En curso y su trabajo está en la rama que dejó esa ejecución. Primero reclama la continuación, para que nadie más trabaje la misma rama. Después prepara esa rama en cada repositorio que abarca el elemento de trabajo, nunca una nueva y sin restablecer lo que ya hay, y continúa el trabajo desde donde se detuvo. Entrega como lo hace una ejecución nueva: una pull request por repositorio, vinculada al elemento de trabajo. Usa en cambio `motir fix ACME-12` cuando el elemento de trabajo ya tiene una pull request en rojo, y `motir run ACME-12` para un elemento de trabajo que nadie ha empezado.

**Qué ves en Motir**

Un elemento de trabajo cuya ejecución murió dice La Ejecución murió en su sección Desarrollo, con el comando `motir continue` para copiar. Mientras se ejecuta la continuación, esa sección dice que se está continuando, y quién lo hace. Cuando termina, el elemento de trabajo avanza exactamente como tras `motir run`: a Implementado, con sus pull requests vinculadas y una sección Cómo probar.

### `motir-log-bug` {#motir-log-bug}

**Di**

- `motir log bug the export button does nothing on an empty board`

**Qué ocurre**

Trata lo que escribiste como una afirmación que hay que comprobar. Primero encuentra la causa en el código, busca un elemento de trabajo que alguien ya haya registrado y no registra nada si resulta que el comportamiento es correcto. En caso contrario, registra un Error: bajo la historia a la que retiene o, si no retiene nada, en la carpeta Errores de tu proyecto.

**Qué ves en Motir**

Un nuevo elemento de trabajo de tipo Error con la causa, el lugar del código donde vive y cómo reproducirlo, vinculado al elemento de trabajo en el que se encontró. Si bloquea el elemento de trabajo que estás ejecutando, ese elemento de trabajo pasa a Bloqueado.

### `motir-mark` {#motir-mark}

**Di**

- `motir mark ACME-12 done`

**Qué ocurre**

Cierra un elemento de trabajo que ninguna pull request puede cerrar: uno manual, como crear una cuenta, definir un secreto o cambiar un ajuste. Decirlo es tu confirmación de que el trabajo está terminado. Rechaza un elemento de trabajo que tiene una pull request, porque la fusión de esa pull request lo cierra.

**Qué ves en Motir**

El elemento de trabajo pasa a Hecho, con un comentario que registra que lo confirmaste. El estado de su elemento padre se deduce del de sus hijos.

### `motir-guide` {#motir-guide}

**Di**

- `motir guide ACME-12`
- `motir guide`

**Qué ocurre**

Te guía por un elemento de trabajo manual paso a paso. Nombra uno, o di solo `motir guide` y retoma el tuyo sin terminar o, si no hay, el siguiente elemento de trabajo manual listo. Te da un paso, con sus instrucciones y cualquier comando para copiar, y espera. Di que está hecho y comprueba lo que puede sin cambiar nada, como obtener la dirección o ejecutar un comando de solo lectura, y te cuenta lo que vio. Un paso cuya comprobación falla no se marca; recibes el mismo paso otra vez. Puedes parar en cualquier paso, y `motir guide` retoma donde lo dejaste. Si el elemento de trabajo aún no tiene pasos, propone algunos a partir de la descripción y te pregunta antes de escribirlos en el elemento de trabajo. Si un paso resulta ser incorrecto, ofrece una corrección y cambia el paso o el texto del elemento de trabajo solo cuando dices que sí.

**Qué ves en Motir**

El elemento de trabajo se te asigna y pasa a En curso. Su lista de tareas pendientes marca cada paso cuando lo terminas, con quién lo hizo. Cuando se marca el último paso, el elemento de trabajo pasa a Hecho, con un comentario que resume cada paso y cómo se confirmó.

### `motir-fix-bugs` {#motir-fix-bugs}

**Di**

- `motir fix bugs`
- `motir fix bugs 3`

**Qué ocurre**

Recorre los Errores de la carpeta Errores de tu proyecto que siguen en Por hacer, uno a uno, empezando por el más antiguo. Los Errores de las carpetas dentro de Errores se dejan en paz. Para cada uno, primero comprueba que el Error es real en tu rama por defecto y luego le da exactamente un desenlace. Un Error que puede corregir recibe una pull request que corrige ese Error y nada más. Un Error que espera a otro elemento de trabajo que aún no está terminado se vincula a ese elemento de trabajo y se mueve bajo la misma historia. Un Error que no puede corregir aquí recibe un comentario y se aparta: ya corregido, con lo que lo corrigió; no reproducible, con lo que ejecutó; o necesita tu decisión, con la pregunta y su recomendación. Cada desenlace saca al Error de Por hacer, así que la ejecución termina por sí sola. Añade un número y se detiene tras esa cantidad de Errores. Termina con un informe que enumera primero los Errores que te esperan a ti.

**Qué ves en Motir**

Un Error corregido pasa a Implementado con su pull request vinculada, y a Hecho cuando la fusionas. Un Error que espera otro trabajo pasa a Bloqueado, con un vínculo bloqueado por ese elemento de trabajo. Un Error ya corregido pasa a Hecho. Uno que no puede reproducir, o que necesita tu decisión, pasa a Bloqueado. Cada uno de estos tiene un comentario con las pruebas o la pregunta. Responde a la pregunta y devuelve el Error a Por hacer, y la siguiente ejecución lo retoma.

## Cuando un elemento de trabajo es incorrecto {#wrong}

A veces un elemento de trabajo no se puede construir tal como está escrito. Puede pedir algo que no existe, necesitar un diseño que nadie ha dibujado o alcanzar dos repositorios. `motir-run` no intenta adivinar cómo sortearlo. Mueve el elemento de trabajo a **En planificación**, para que ninguna otra ejecución lo tome, y pide al planificador Motir AI que planifique la corrección. Luego se detiene. El plan espera a que lo revises y lo apruebes en Motir, y no se construye nada hasta que lo hagas.

Si tu token no puede usar la planificación con IA, o se han agotado tus créditos de IA, se detiene de todos modos. Deja un comentario en el elemento de trabajo con la corrección completa y explica por qué no pudo entregarla.

## Actualización {#updating}

Una versión nueva tiene una etiqueta nueva, y esta página pasa a ella. En una instalación por copia, vuelve a ejecutar el paso de instalación de tu agente: sobrescribe las carpetas de las skills en su sitio. En Claude Code, un marketplace no se puede añadir de nuevo en otra etiqueta, así que quítalo, añádelo en la etiqueta nueva e instala el plugin otra vez:

{{slot:update}}

Reinicia tu agente después para que lea las versiones nuevas.
