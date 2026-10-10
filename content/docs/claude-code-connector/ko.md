---
source: 04e1454b8c46
---

Motir는 원격 MCP 커넥터입니다. Claude Code는 하나의 URL로 Motir 프로젝트에 접속하며, 사용자가 승인한 범위 안에서 사용자 권한으로 동작합니다. Motir 계정으로 로그인하고 워크스페이스를 하나 선택합니다. 만들거나 붙여 넣거나 안전하게 보관해야 할 토큰은 없습니다.

추가하는 방법은 두 가지입니다. claude.ai에서 한 번 연결하면 Claude 계정으로 로그인한 어디서든 Claude Code가 이를 가져옵니다. 또는 명령 하나로 Claude Code에서 직접 추가할 수도 있습니다. Motir의 스킬도 함께 쓰고 싶으신가요? [{{value:pluginPage}}](/docs/claude-code-plugin)에 이 커넥터가 함께 포함되어 있습니다.

## 시작하기 전에 {#before}

해당 프로젝트에 접근할 수 있는 Motir 계정과 Claude Code가 필요합니다. claude.ai 방식에서는 Claude Code가 claude.ai에서 연결한 것과 같은 Claude 계정으로 로그인되어 있어야 합니다.

## claude.ai에서 연결하기 {#claude-ai}

claude.ai에서 연결한 커넥터는 웹, 데스크톱 앱, 모바일의 대화에서 사용할 수 있고, Claude 계정으로 로그인한 Claude Code에서도 사용할 수 있습니다.

1. Customize → Connectors를 엽니다.
2. “+”를 클릭한 다음 Add custom connector를 클릭하고, 아래의 서버 URL을 붙여 넣습니다. OAuth client에서는 Use Claude’s published identity를 선택하세요. Motir가 이를 지원하므로 claude.ai에 Detected로 표시됩니다. OAuth client ID와 secret은 비워 두세요. Motir는 둘 다 필요하지 않습니다.
3. Add를 클릭한 다음 Connect를 클릭합니다. Claude가 로그인과 승인을 위해 app.motir.co로 이동시킵니다.

{{slot:claude-ai}}

Team 또는 Enterprise 요금제에서는 Owner가 Organization settings → Connectors → Add → Custom → Web에서 커넥터를 한 번 추가하고, 이후 각 멤버가 자신의 Motir 계정으로 Customize → Connectors에서 Connect를 클릭합니다. · [Anthropic의 claude.ai 문서]({{value:claudeAiDocsUrl}}) · 단계 확인일 {{value:claudeAiCheckedOn}}

## 또는 Claude Code에서 추가하기 {#claude-code}

claude.ai를 거치지 않고 Claude Code에 커넥터를 직접 추가합니다.

1. 아래 명령으로 서버를 추가합니다. 헤더도 토큰도 필요 없습니다.
2. Claude Code에서 `/mcp`를 실행하고 `motir`를 선택한 다음, 브라우저에서 로그인을 진행합니다.

{{slot:claude-code}}

Claude 계정으로 Claude Code에 로그인했다면, claude.ai에서 연결한 커넥터는 이미 그곳에서 사용할 수 있습니다. Claude Code용 Motir 플러그인에는 스킬과 함께 이 서버가 포함되어 있습니다. · [Anthropic의 Claude Code 문서]({{value:claudeCodeDocsUrl}}) · 단계 확인일 {{value:claudeCodeCheckedOn}}

## 연결 확인 {#check}

Claude Code에서 `/mcp`를 실행하세요. 서버 목록에 Motir가 표시되며, 아직 로그인이 필요한 서버는 그렇게 표시됩니다. 그런 다음 프로젝트에 대해, 예를 들어 바로 시작할 수 있는 것이 무엇인지 Claude에게 물으면 Motir의 데이터로 답합니다.

## 승인하는 내용과 철회 방법 {#consent}

Motir의 로그인 페이지에는 요청하는 앱의 이름이 표시되고, 워크스페이스를 하나 선택하게 하며, 앱이 원하는 권한이 나열됩니다. 이후 Claude는 해당 워크스페이스에서 승인한 범위 안에서 사용자 권한으로 동작하며, 사용자의 역할이 허용하는 범위를 넘지 않습니다. Claude는 무언가를 변경하는 도구를 사용하기 전에 먼저 묻습니다. 어떤 도구가 읽기만 하고, 쓰고, 삭제하는지는 [{{value:mcpToolsPage}}](/docs/mcp/tools)에서 확인할 수 있습니다.

연결한 모든 앱은 Motir의 설정 → 계정 → 토큰에 있는 [연결된 앱]({{value:connectedAppsUrl}})에 워크스페이스, 권한, 마지막 사용 시점과 함께 나열됩니다. 액세스 취소는 다음 요청부터 해당 앱의 액세스를 끝냅니다. 서버의 자세한 내용과 다른 클라이언트 및 파이프라인을 위한 토큰 방식은 [{{value:mcpPage}}](/docs/mcp) 가이드에 있습니다.
