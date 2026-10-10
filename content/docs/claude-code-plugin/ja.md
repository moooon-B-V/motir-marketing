---
source: 758198e00644
---

Claude Code 用の Motir プラグインを使うと、1 回のインストールで Motir のプロジェクトを Claude Code の中に取り込めます。Motir のスキル、MCP サーバー、CLI を実行するランナーが入ります。ブラウザーで Motir アカウントにサインインするため、トークンは不要です。`motir run` と言えば、Claude Code が次に着手できる作業項目を取り上げて実装し、リンクされたプルリクエストを開きます。

このプラグインは [{{value:skillsRepo}}]({{value:repoUrl}}) から公開されており、このリポジトリは Claude Code のプラグインマーケットプレイスでもあります。このページのコマンドはすべて、リリース [`{{value:releaseTag}}`]({{value:releaseUrl}}) をインストールします。

## 始める前に {#before}

Claude Code、そのプロジェクトにアクセスできる Motir アカウント、`git` が必要です。ランナーには Node.js 22 以降が必要で、プルリクエストを開いたり読み取ったりするスキルには GitHub CLI（`gh`）が必要です。

## インストール {#install}

リリースタグを指定してマーケットプレイスを追加し、プラグインをインストールします。どちらも Claude Code で実行してください。

{{slot:install}}

## 含まれるもの {#brings}

- **7 つのスキル。** リリースに含まれるすべてのスキルが、プラグイン名の下に一覧表示されます。
- **Motir MCP サーバー。** Claude Code は、初めて使うときにブラウザーでサインインします。`/mcp` を実行して `motir` を選び、_Authenticate_ を選んでから、ワークスペースを選び、Motir の同意画面で承認します。作成したり貼り付けたりするトークンはありません。
- **`motir` ランナー。** `npx` で、バージョンを固定した Motir CLI を実行するため、グローバルには何もインストールされません。Node.js 22 以降が必要で、CLI は `motir login` で自動的にサインインします。

## 動作の確認 {#check}

確認方法は次のとおりです。`/plugin` に `motir` が `{{value:releaseVersion}}` として表示され、`/mcp` に `motir` が一覧表示されます。プラグインのスキルはプラグイン名の下に一覧表示されます。たとえば `/motir:motir-run` です。

## 使い方 {#use}

Claude Code に、してほしいことを伝えてください。各スキルの動作の詳細と、Motir での見え方は、[{{value:skillsPage}}](/docs/skills#use)のガイドにあります。

- [`motir run`](/docs/skills#motir-run)
- [`motir fix ACME-12`](/docs/skills#motir-fix)
- [`motir continue ACME-12`](/docs/skills#motir-continue)
- [`motir log bug the export button does nothing on an empty board`](/docs/skills#motir-log-bug)
- [`motir mark ACME-12 done`](/docs/skills#motir-mark)
- [`motir guide ACME-12`](/docs/skills#motir-guide)
- [`motir fix bugs`](/docs/skills#motir-fix-bugs)

## 更新 {#updating}

あるリリースで追加したマーケットプレイスを、別のリリースで追加し直すことはできないため、先に削除してください。削除するとプラグインもアンインストールされ、最後の行で新しいリリースのプラグインをもう一度インストールします。

{{slot:update}}

別のエージェントを使う場合や、コネクターだけが必要な場合は、すべてのエージェントについては[{{value:skillsPage}}](/docs/skills)のガイドを、コネクターについては[{{value:connectorPage}}](/docs/claude-code-connector)をご覧ください。
