---
source: 04e1454b8c46
---

Motir es un conector MCP remoto: Claude Code accede a tu proyecto de Motir mediante una sola URL y actúa como tú, dentro de lo que apruebes. Inicias sesión con tu cuenta de Motir y eliges un espacio de trabajo. No hay ningún token que crear, pegar ni guardar.

Hay dos maneras de añadirlo. Conéctalo una vez en claude.ai y Claude Code lo recoge dondequiera que hayas iniciado sesión con tu cuenta de Claude, o añádelo en el propio Claude Code con un solo comando. ¿Quieres también las skills de Motir? El [{{value:pluginPage}}](/docs/claude-code-plugin) trae consigo este conector.

## Antes de empezar {#before}

Necesitas una cuenta de Motir con acceso al proyecto y Claude Code. Para la vía de claude.ai, Claude Code debe haber iniciado sesión con la misma cuenta de Claude que conectas en claude.ai.

## Conéctalo en claude.ai {#claude-ai}

Un conector que conectas en claude.ai está disponible en tus conversaciones en la web, en la aplicación de escritorio y en el móvil, y en Claude Code cuando ha iniciado sesión con tu cuenta de Claude.

1. Abre Personalizar → Conectores.
2. Haz clic en “+”, luego en Añadir conector personalizado, y pega la URL del servidor que aparece más abajo. En Cliente OAuth, elige Usar la identidad publicada de Claude: claude.ai la marca como Detectada, porque Motir la admite. Deja vacíos el ID y el secreto del cliente OAuth: Motir no necesita ninguno.
3. Haz clic en Añadir y luego en Conectar. Claude te lleva a app.motir.co para iniciar sesión y aprobar.

{{slot:claude-ai}}

En un plan Team o Enterprise, un propietario añade el conector una sola vez, en Configuración de la organización → Conectores → Añadir → Personalizado → Web, y después cada miembro hace clic en Conectar en Personalizar → Conectores con su propia cuenta de Motir. · [Documentación de claude.ai de Anthropic]({{value:claudeAiDocsUrl}}) · pasos comprobados {{value:claudeAiCheckedOn}}

## O añádelo en Claude Code {#claude-code}

Añade el conector directamente a Claude Code, sin pasar por claude.ai.

1. Añade el servidor con el comando de abajo, sin cabecera y sin token.
2. En Claude Code, ejecuta `/mcp`, selecciona `motir` y sigue el inicio de sesión en tu navegador.

{{slot:claude-code}}

Si iniciaste sesión en Claude Code con tu cuenta de Claude, un conector que conectaste en claude.ai ya está disponible ahí. El plugin de Motir para Claude Code trae este servidor consigo, junto a las skills. · [Documentación de Claude Code de Anthropic]({{value:claudeCodeDocsUrl}}) · pasos comprobados {{value:claudeCodeCheckedOn}}

## Comprueba la conexión {#check}

En Claude Code, ejecuta `/mcp`: Motir aparece en la lista de servidores, y un servidor que todavía necesita que inicies sesión lo indica. Después pregunta a Claude por tu proyecto, por ejemplo qué está listo para empezar, y responderá con datos de Motir.

## Qué apruebas y cómo retirarlo {#consent}

La página de inicio de sesión de Motir nombra la aplicación que lo solicita, te hace elegir un espacio de trabajo y enumera los permisos que pide. Claude actúa entonces como tú en ese espacio de trabajo, dentro de lo que aprobaste y nunca más allá de lo que permite tu propio rol. Claude pregunta antes de usar una herramienta que cambie algo, y [{{value:mcpToolsPage}}](/docs/mcp/tools) muestra qué herramientas solo leen, escriben o eliminan.

Cada aplicación que conectas aparece en [Aplicaciones conectadas]({{value:connectedAppsUrl}}), en Configuración → Cuenta → Tokens de Motir, con su espacio de trabajo, sus permisos y cuándo se usó por última vez. Revocar pone fin a su acceso en su siguiente petición. La guía de [{{value:mcpPage}}](/docs/mcp) trae los detalles del servidor y la vía del token para otros clientes y pipelines.
