---
source: 04e1454b8c46
---

Motir はリモート MCP コネクターです。Claude Code は 1 つの URL であなたの Motir プロジェクトに接続し、承認した範囲内で、あなたとして動作します。Motir アカウントでサインインし、ワークスペースを 1 つ選びます。作成したり、貼り付けたり、安全に保管したりするトークンはありません。

追加の方法は 2 つあります。claude.ai で一度接続すれば、Claude アカウントでサインインしているどこでも Claude Code が自動的に利用します。あるいは、Claude Code の中で 1 つのコマンドで追加することもできます。Motir のスキルも使いたい場合は、[{{value:pluginPage}}](/docs/claude-code-plugin)にこのコネクターが含まれています。

## 始める前に {#before}

そのプロジェクトにアクセスできる Motir アカウントと、Claude Code が必要です。claude.ai を使う方法では、claude.ai で接続するのと同じ Claude アカウントで Claude Code にサインインしている必要があります。

## claude.ai で接続する {#claude-ai}

claude.ai で接続したコネクターは、ウェブ、デスクトップアプリ、モバイルでの会話で利用でき、Claude アカウントでサインインしている Claude Code でも利用できます。

1. _Customize_ → _Connectors_ を開きます。
2. 「+」をクリックし、_Add custom connector_ をクリックして、下のサーバー URL を貼り付けます。_OAuth client_ では、_Use Claude’s published identity_ を選びます。Motir が対応しているため、claude.ai はこれを _Detected_ と表示します。OAuth クライアント ID とシークレットは空のままにしてください。Motir はどちらも必要としません。
3. _Add_ をクリックし、続けて _Connect_ をクリックします。Claude が app.motir.co に移動するので、サインインして承認します。

{{slot:claude-ai}}

Team プランまたは Enterprise プランでは、オーナーが _Organization settings_ → _Connectors_ → _Add_ → _Custom_ → _Web_ でコネクターを一度追加し、その後、各メンバーが自分の Motir アカウントで _Customize_ → _Connectors_ から _Connect_ をクリックします。 · [Anthropic の claude.ai のドキュメント]({{value:claudeAiDocsUrl}}) · 手順の確認日 {{value:claudeAiCheckedOn}}

## または Claude Code で追加する {#claude-code}

claude.ai を使わず、コネクターを Claude Code に直接追加します。

1. 下のコマンドでサーバーを追加します。ヘッダーもトークンも不要です。
2. Claude Code で `/mcp` を実行し、`motir` を選んで、ブラウザーでのサインインに従います。

{{slot:claude-code}}

Claude アカウントで Claude Code にサインインしている場合、claude.ai で接続したコネクターはすでに利用できます。Claude Code 用の Motir プラグインには、スキルと並んでこのサーバーが含まれています。 · [Anthropic の Claude Code のドキュメント]({{value:claudeCodeDocsUrl}}) · 手順の確認日 {{value:claudeCodeCheckedOn}}

## 接続を確認する {#check}

Claude Code で `/mcp` を実行します。サーバーの一覧に Motir が表示され、まだサインインが必要なサーバーにはその旨が表示されます。続いて、プロジェクトについて、たとえば着手できるものは何かを Claude に尋ねてください。Motir から取得した内容で答えます。

## 承認する内容と、取り消す方法 {#consent}

Motir のサインインページには、要求しているアプリの名前が表示され、ワークスペースを 1 つ選び、要求する権限が一覧表示されます。Claude はそのワークスペースで、承認された範囲内で、あなたとして動作します。あなた自身のロールで許されている範囲を超えることはありません。Claude は、何かを変更するツールを使う前に確認を求めます。どのツールが読み取りだけを行い、書き込みを行い、削除を行うかは、[{{value:mcpToolsPage}}](/docs/mcp/tools)で確認できます。

接続したすべてのアプリは、Motir の「設定 → アカウント → トークン」にある[接続済みアプリ]({{value:connectedAppsUrl}})に一覧表示され、ワークスペース、権限、最後に使われた時刻が示されます。取り消すと、次のリクエストからそのアクセスは終了します。サーバーの詳細と、他のクライアントやパイプライン向けのトークンを使う方法は、[{{value:mcpPage}}](/docs/mcp)のガイドにあります。
