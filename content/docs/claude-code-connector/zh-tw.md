---
source: 04e1454b8c46
---

Motir 是一個遠端 MCP 連接器：Claude Code 透過一個 URL 存取你的 Motir 專案，並在你核准的範圍內以你的身份行事。你用 Motir 帳戶登入並選擇一個工作區。沒有需要建立、貼上或妥善保管的權杖。

有兩種新增方式。在 claude.ai 上連線一次，Claude Code 在你用 Claude 帳戶登入的任何地方都會自動獲得它；或者在 Claude Code 中用一條指令直接新增。還想要 Motir 的技能嗎？[{{value:pluginPage}}](/docs/claude-code-plugin) 會連同這個連接器一起帶上。

## 開始之前 {#before}

你需要一個能存取該專案的 Motir 帳戶，以及 Claude Code。若走 claude.ai 路線，Claude Code 登入的必須是你在 claude.ai 上進行連線時所用的同一個 Claude 帳戶。

## 在 claude.ai 上連線 {#claude-ai}

在 claude.ai 上連線的連接器，可以在網頁、桌面應用程式和手機上的對話中使用；當 Claude Code 用你的 Claude 帳戶登入時，也可以在 Claude Code 中使用。

1. 開啟「自訂」→「連接器」。
2. 點選「+」，再點選「新增自訂連接器」，並貼上下面的伺服器 URL。在「OAuth 用戶端」下，選擇「使用 Claude 公開發布的身份」——claude.ai 會將其標記為「已偵測到」，因為 Motir 支援它。「OAuth 用戶端 ID」和金鑰請留空——Motir 兩者都不需要。
3. 點選「新增」，再點選「連線」。Claude 會把你帶到 app.motir.co 登入並核准。

{{slot:claude-ai}}

在 Team 或 Enterprise 方案中，由擁有者在「組織設定」→「連接器」→「新增」→「自訂」→「Web」下新增一次連接器，之後每位成員在「自訂」→「連接器」下點選「連線」，使用各自的 Motir 帳戶。 · [Anthropic 的 claude.ai 文件]({{value:claudeAiDocsUrl}}) · 步驟核對於 {{value:claudeAiCheckedOn}}

## 或者在 Claude Code 中新增 {#claude-code}

不經過 claude.ai，直接把連接器新增到 Claude Code。

1. 用下面的指令新增伺服器——不帶請求標頭，也不帶權杖。
2. 在 Claude Code 中執行 `/mcp`，選擇 `motir`，並在瀏覽器中完成登入。

{{slot:claude-code}}

如果你是用 Claude 帳戶登入的 Claude Code，那麼你在 claude.ai 上連線過的連接器在這裡已經可用。Claude Code 的 Motir 外掛會連同技能一起帶上這個伺服器。 · [Anthropic 的 Claude Code 文件]({{value:claudeCodeDocsUrl}}) · 步驟核對於 {{value:claudeCodeCheckedOn}}

## 檢查連線 {#check}

在 Claude Code 中執行 `/mcp`：伺服器清單中會有 Motir，仍需要你登入的伺服器會註明這一點。然後向 Claude 詢問你的專案——例如，有什麼可以開始做——它會根據 Motir 來回答。

## 你核准了什麼，以及如何收回 {#consent}

Motir 上的登入頁面會寫明是哪個應用程式在發出請求，讓你選擇一個工作區，並列出它想要的權限。隨後 Claude 在該工作區內以你的身份行事，不超出你核准的範圍，也永遠不會超出你自己的角色所允許的範圍。在使用任何會更改內容的工具之前，Claude 會先詢問，[{{value:mcpToolsPage}}](/docs/mcp/tools) 則顯示了哪些工具唯讀取、寫入或刪除。

你連線的每個應用程式都列在 Motir 中「設定」→「帳戶」→「權杖」下的[已連線的應用程式]({{value:connectedAppsUrl}})裡，並附有它的工作區、權限以及上次使用的時間。選擇「撤銷」後，它的存取權限在下一次請求時結束。[{{value:mcpPage}}](/docs/mcp) 指南介紹了伺服器的詳細資訊，以及適用於其他用戶端和管線的權杖路線。
