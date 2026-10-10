---
source: 758198e00644
---

El plugin de Motir para Claude Code pone tu proyecto de Motir dentro de Claude Code con una sola instalación: las skills de Motir, su servidor MCP y un ejecutor para su CLI. Inicia sesión con tu cuenta de Motir en el navegador, así que no hay token. Di `motir run` y Claude Code toma el siguiente elemento de trabajo listo, lo construye y abre una pull request vinculada.

El plugin se publica desde [{{value:skillsRepo}}]({{value:repoUrl}}), que también es un marketplace de plugins de Claude Code. Cada comando de esta página instala la versión [`{{value:releaseTag}}`]({{value:releaseUrl}}).

## Antes de empezar {#before}

Necesitas Claude Code, una cuenta de Motir con acceso al proyecto y `git`. El ejecutor necesita Node.js 22 o posterior, y las skills que abren o leen pull requests necesitan la CLI de GitHub (`gh`).

## Instalación {#install}

Añade el marketplace en la etiqueta de la versión y luego instala el plugin. Ejecuta ambos pasos en Claude Code.

{{slot:install}}

## Qué trae consigo {#brings}

- **Las siete skills.** Todas las skills de la versión, enumeradas bajo el nombre del plugin.
- **El servidor MCP de Motir.** Claude Code inicia sesión en él en el navegador la primera vez que se usa: ejecuta `/mcp`, elige `motir` y selecciona _Authenticate_, luego elige el espacio de trabajo y aprueba en la pantalla de consentimiento de Motir. No hay ningún token que crear ni pegar.
- **El ejecutor `motir`.** Ejecuta la CLI de Motir fijada con `npx`, así que no se instala nada de forma global. Necesita Node.js 22 o posterior, y la CLI inicia sesión por su cuenta con `motir login`.

## Comprueba que funcionó {#check}

Para comprobarlo: `/plugin` muestra `motir` en `{{value:releaseVersion}}`, y `/mcp` enumera `motir`. Las skills de un plugin aparecen bajo el nombre del plugin, por ejemplo `/motir:motir-run`.

## Úsalo {#use}

Di lo que quieres en Claude Code. El comportamiento completo de cada skill, y lo que verás en Motir, está en la guía de [{{value:skillsPage}}](/docs/skills#use).

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## Actualización {#updating}

Un marketplace añadido en una versión no puede añadirse de nuevo en otra, así que quítalo primero. Quitarlo desinstala el plugin, y la última línea lo instala otra vez en la versión nueva.

{{slot:update}}

Si usas otro agente, o solo quieres el conector, consulta la guía de [{{value:skillsPage}}](/docs/skills) para ver todos los agentes, o el [{{value:connectorPage}}](/docs/claude-code-connector).
