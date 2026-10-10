---
source: 04e1454b8c46
---

Motir 是一个远程 MCP 连接器：Claude Code 通过一个 URL 访问你的 Motir 项目，并在你批准的范围内以你的身份行事。你用 Motir 账户登录并选择一个工作区。没有需要创建、粘贴或妥善保管的令牌。

有两种添加方式。在 claude.ai 上连接一次，Claude Code 在你用 Claude 账户登录的任何地方都会自动获得它；或者在 Claude Code 中用一条命令直接添加。还想要 Motir 的技能吗？[{{value:pluginPage}}](/docs/claude-code-plugin) 会连同这个连接器一起带上。

## 开始之前 {#before}

你需要一个能访问该项目的 Motir 账户，以及 Claude Code。若走 claude.ai 路线，Claude Code 登录的必须是你在 claude.ai 上进行连接时所用的同一个 Claude 账户。

## 在 claude.ai 上连接 {#claude-ai}

在 claude.ai 上连接的连接器，可以在网页、桌面应用和手机上的对话中使用；当 Claude Code 用你的 Claude 账户登录时，也可以在 Claude Code 中使用。

1. 打开“自定义”→“连接器”。
2. 点击“+”，再点击“添加自定义连接器”，并粘贴下面的服务器 URL。在“OAuth 客户端”下，选择“使用 Claude 公开发布的身份”——claude.ai 会将其标记为“已检测到”，因为 Motir 支持它。“OAuth 客户端 ID”和密钥请留空——Motir 两者都不需要。
3. 点击“添加”，再点击“连接”。Claude 会把你带到 app.motir.co 登录并批准。

{{slot:claude-ai}}

在 Team 或 Enterprise 套餐中，由所有者在“组织设置”→“连接器”→“添加”→“自定义”→“Web”下添加一次连接器，之后每位成员在“自定义”→“连接器”下点击“连接”，使用各自的 Motir 账户。 · [Anthropic 的 claude.ai 文档]({{value:claudeAiDocsUrl}}) · 步骤核对于 {{value:claudeAiCheckedOn}}

## 或者在 Claude Code 中添加 {#claude-code}

不经过 claude.ai，直接把连接器添加到 Claude Code。

1. 用下面的命令添加服务器——不带请求头，也不带令牌。
2. 在 Claude Code 中运行 `/mcp`，选择 `motir`，并在浏览器中完成登录。

{{slot:claude-code}}

如果你是用 Claude 账户登录的 Claude Code，那么你在 claude.ai 上连接过的连接器在这里已经可用。Claude Code 的 Motir 插件会连同技能一起带上这个服务器。 · [Anthropic 的 Claude Code 文档]({{value:claudeCodeDocsUrl}}) · 步骤核对于 {{value:claudeCodeCheckedOn}}

## 检查连接 {#check}

在 Claude Code 中运行 `/mcp`：服务器列表中会有 Motir，仍需要你登录的服务器会注明这一点。然后向 Claude 询问你的项目——例如，有什么可以开始做——它会根据 Motir 来回答。

## 你批准了什么，以及如何收回 {#consent}

Motir 上的登录页面会写明是哪个应用在发出请求，让你选择一个工作区，并列出它想要的权限。随后 Claude 在该工作区内以你的身份行事，不超出你批准的范围，也永远不会超出你自己的角色所允许的范围。在使用任何会更改内容的工具之前，Claude 会先询问，[{{value:mcpToolsPage}}](/docs/mcp/tools) 则显示了哪些工具只读取、写入或删除。

你连接的每个应用都列在 Motir 中“设置”→“账户”→“令牌”下的[已连接的应用]({{value:connectedAppsUrl}})里，并附有它的工作区、权限以及上次使用的时间。选择“撤销”后，它的访问权限在下一次请求时结束。[{{value:mcpPage}}](/docs/mcp) 指南介绍了服务器的详细信息，以及适用于其他客户端和流水线的令牌路线。
