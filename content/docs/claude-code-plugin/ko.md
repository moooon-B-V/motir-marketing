---
source: 758198e00644
---

Claude Code용 Motir 플러그인은 한 번의 설치로 Motir 프로젝트를 Claude Code 안으로 가져옵니다. Motir의 스킬, MCP 서버, 그리고 CLI 실행기가 함께 설치됩니다. 브라우저에서 Motir 계정으로 로그인하므로 토큰이 필요 없습니다. `motir run`이라고 말하면 Claude Code가 준비된 다음 작업 항목을 가져와 구현하고, 연결된 풀 리퀘스트를 엽니다.

플러그인은 [{{value:skillsRepo}}]({{value:repoUrl}})에서 게시되며, 이 저장소는 Claude Code 플러그인 마켓플레이스이기도 합니다. 이 페이지의 모든 명령은 릴리스 [`{{value:releaseTag}}`]({{value:releaseUrl}})를 설치합니다.

## 시작하기 전에 {#before}

Claude Code, 해당 프로젝트에 접근할 수 있는 Motir 계정, 그리고 `git`이 필요합니다. 실행기에는 Node.js 22 이상이 필요하고, 풀 리퀘스트를 열거나 읽는 스킬에는 GitHub CLI(`gh`)가 필요합니다.

## 설치 {#install}

릴리스 태그로 마켓플레이스를 추가한 다음 플러그인을 설치합니다. 두 명령 모두 Claude Code에서 실행하세요.

{{slot:install}}

## 함께 제공되는 것 {#brings}

- **일곱 가지 스킬.** 릴리스에 포함된 모든 스킬이 플러그인 이름 아래에 표시됩니다.
- **Motir MCP 서버.** Claude Code는 처음 사용할 때 브라우저에서 로그인합니다. `/mcp`를 실행하고 `motir`를 선택한 뒤 _Authenticate_를 선택하고, 워크스페이스를 고른 다음 Motir의 동의 화면에서 승인하세요. 만들거나 붙여 넣어야 할 토큰은 없습니다.
- **`motir` 실행기.** 고정된 버전의 Motir CLI를 `npx`로 실행하므로 전역으로 설치되는 것은 없습니다. Node.js 22 이상이 필요하며, CLI는 `motir login`으로 스스로 로그인합니다.

## 설치 확인 {#check}

확인하려면 `/plugin`에서 `motir`가 `{{value:releaseVersion}}` 버전으로 표시되는지, `/mcp`에 `motir`가 나열되는지 보세요. 플러그인의 스킬은 플러그인 이름 아래에 나열되며, 예를 들어 `/motir:motir-run`처럼 표시됩니다.

## 사용하기 {#use}

원하는 것을 Claude Code에 말하세요. 각 스킬의 전체 동작과 Motir에서 보게 될 내용은 [{{value:skillsPage}}](/docs/skills#use) 가이드에 있습니다.

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## 업데이트 {#updating}

한 릴리스로 추가한 마켓플레이스는 다른 릴리스로 다시 추가할 수 없으므로 먼저 제거해야 합니다. 제거하면 플러그인도 함께 삭제되므로, 마지막 줄에서 새 릴리스로 다시 설치합니다.

{{slot:update}}

다른 에이전트를 사용하거나 커넥터만 필요하신가요? 모든 에이전트에 대해서는 [{{value:skillsPage}}](/docs/skills) 가이드를, 커넥터에 대해서는 [{{value:connectorPage}}](/docs/claude-code-connector)를 참고하세요.
