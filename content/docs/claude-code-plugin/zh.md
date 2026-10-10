---
source: 758198e00644
---

Motir 的 Claude Code 插件，一次安装就把你的 Motir 项目放进 Claude Code：Motir 的技能、它的 MCP 服务器，以及 CLI 的运行器。它在浏览器中用你的 Motir 账户登录，因此无需令牌。说 `motir run`，Claude Code 就会领取下一个就绪的工作项，构建它，并打开一个关联的拉取请求。

该插件发布自 [{{value:skillsRepo}}]({{value:repoUrl}})，这个仓库同时也是一个 Claude Code 插件市场。本页的每条命令安装的都是版本 [`{{value:releaseTag}}`]({{value:releaseUrl}})。

## 开始之前 {#before}

你需要 Claude Code、一个能访问该项目的 Motir 账户，以及 `git`。运行器需要 Node.js 22 或更高版本，用于打开或读取拉取请求的技能需要 GitHub CLI（`gh`）。

## 安装 {#install}

按版本标签添加市场，然后安装插件。两条命令都在 Claude Code 中运行。

{{slot:install}}

## 它带来什么 {#brings}

- **七个技能。** 该版本中的每个技能，都列在插件名称之下。
- **Motir MCP 服务器。** Claude Code 会在首次使用时于浏览器中登录它：运行 `/mcp`，选择 `motir` 并选择 _Authenticate_，然后选择工作区，并在 Motir 的授权页面上批准。无需创建或粘贴令牌。
- **`motir` 运行器。** 用 `npx` 运行固定版本的 Motir CLI，因此不会全局安装任何东西。它需要 Node.js 22 或更高版本，CLI 会通过 `motir login` 自行登录。

## 检查是否成功 {#check}

检查方式：`/plugin` 会显示 `motir` 位于 `{{value:releaseVersion}}`，`/mcp` 会列出 `motir`。插件的技能列在插件名称之下，例如 `/motir:motir-run`。

## 使用 {#use}

在 Claude Code 中说出你想要的。每个技能的完整行为，以及你会在 Motir 中看到什么，见 [{{value:skillsPage}}](/docs/skills#use) 指南。

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## 更新 {#updating}

以某个版本添加的市场无法再以另一个版本添加，所以请先移除它。移除它会卸载插件，最后一行则会在新版本上重新安装插件。

{{slot:update}}

使用其他智能体，或者只想要连接器？请参阅 [{{value:skillsPage}}](/docs/skills) 指南了解每一种智能体，或参阅 [{{value:connectorPage}}](/docs/claude-code-connector)。
