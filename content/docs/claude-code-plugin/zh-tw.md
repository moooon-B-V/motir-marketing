---
source: 758198e00644
---

Motir 的 Claude Code 外掛，一次安裝就把你的 Motir 專案放進 Claude Code：Motir 的技能、它的 MCP 伺服器，以及 CLI 的執行器。它在瀏覽器中用你的 Motir 帳戶登入，因此無需權杖。說 `motir run`，Claude Code 就會領取下一個就緒的工作項目，建置它，並開啟一個關聯的提取要求。

該外掛釋出自 [{{value:skillsRepo}}]({{value:repoUrl}})，這個儲存庫同時也是一個 Claude Code 外掛市場。本頁的每條指令安裝的都是版本 [`{{value:releaseTag}}`]({{value:releaseUrl}})。

## 開始之前 {#before}

你需要 Claude Code、一個能存取該專案的 Motir 帳戶，以及 `git`。執行器需要 Node.js 22 或更高版本，用於開啟或讀取提取要求的技能需要 GitHub CLI（`gh`）。

## 安裝 {#install}

按版本標籤新增市場，然後安裝外掛。兩條指令都在 Claude Code 中執行。

{{slot:install}}

## 它帶來什麼 {#brings}

- **七個技能。** 該版本中的每個技能，都列在外掛名稱之下。
- **Motir MCP 伺服器。** Claude Code 會在首次使用時於瀏覽器中登入它：執行 `/mcp`，選擇 `motir` 並選擇 _Authenticate_，然後選擇工作區，並在 Motir 的授權頁面上核准。無需建立或貼上權杖。
- **`motir` 執行器。** 用 `npx` 執行固定版本的 Motir CLI，因此不會全域安裝任何東西。它需要 Node.js 22 或更高版本，CLI 會透過 `motir login` 自行登入。

## 檢查是否成功 {#check}

檢查方式：`/plugin` 會顯示 `motir` 位於 `{{value:releaseVersion}}`，`/mcp` 會列出 `motir`。外掛的技能列在外掛名稱之下，例如 `/motir:motir-run`。

## 使用 {#use}

在 Claude Code 中說出你想要的。每個技能的完整行為，以及你會在 Motir 中看到什麼，見 [{{value:skillsPage}}](/docs/skills#use) 指南。

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## 更新 {#updating}

以某個版本新增的市場無法再以另一個版本新增，所以請先移除它。移除它會解除安裝外掛，最後一行則會在新版本上重新安裝外掛。

{{slot:update}}

使用其他代理程式，或者只想要連接器？請參閱 [{{value:skillsPage}}](/docs/skills) 指南了解每一種代理程式，或參閱 [{{value:connectorPage}}](/docs/claude-code-connector)。
