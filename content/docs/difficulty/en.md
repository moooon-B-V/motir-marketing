A task, subtask or bug can carry a **difficulty**: how much reasoning the work demands, not how much of it there is. Story points and estimates measure size. Difficulty says how hard the work is to get right, so a one-line change to lock ordering can be `high` while a large, mechanical rename is `trivial`.

Motir states a work item’s difficulty in the prompt it hands to your agent. Motir does not choose the model for you: use the levels below to decide which model to run each work item on. Epics and stories do not carry a difficulty.

## The four levels {#the-four-levels}

- **`trivial`** — Mechanical work with an unambiguous spec and no judgement calls. The change is fully described by the work item. For example: A rename, a copy change, a config flip, bumping a version.
- **`low`** — Routine work that follows a pattern the codebase already has. Some reading is needed, but the right answer is clear once it is found. For example: A new field through an existing form, an endpoint shaped like its neighbours, a contained bug with a clear reproduction.
- **`medium`** — Work with real design choices: several files or services, trade-offs to weigh, or a spec that leaves room for interpretation. For example: A feature across the API and the interface, a refactor with callers to migrate, a bug whose cause is not yet known.
- **`high`** — Work where a subtle mistake is costly: concurrency, security, data migrations, authentication, or a design with no precedent to follow. For example: Lock ordering, a permission model change, a schema migration on live data, a new subsystem.

When no difficulty is set, treat the work item as `medium`. An unset level means nobody has judged it yet, and that is not a reason to send it to the cheapest model.

## Suggested models for each level {#models}

Each level lists its candidates in order. Take the first one your project is allowed to use. The table shows each model’s price per million tokens (input / output), its score on two coding benchmarks, and what one task cost on SWE-rebench. That benchmark uses fresh tasks a model cannot have trained on, so its cost per task is the closest public figure to what one of your subtasks will cost.

### `trivial` · about {{value:costRangeTrivial}} per task {#level-trivial}

{{slot:trivial}}

### `low` · about {{value:costRangeLow}} per task {#level-low}

{{slot:low}}

### `medium` · about {{value:costRangeMedium}} per task {#level-medium}

{{slot:medium}}

### `high` · about {{value:costRangeHigh}} and up per task {#level-high}

{{slot:high}}

A cost marked ≈ has not been measured. It takes a measured model from the same family and scales it by the difference in token price. A dash means no public score or cost exists yet.

## Reading the numbers {#reading-the-numbers}

- **The two benchmarks disagree, so neither decides alone.** SWE-bench Pro covers more models, but about 30% of its public tasks are known to be broken. SWE-rebench is harder to game, and it is the reason DeepSeek V4 Pro and GPT-5.6 Luna sit in `trivial`: both score 15 to 19 points lower on its fresh tasks.
- **Compare cost per finished task, not price per token.** A cheaper model that fails and has to be run again costs more than a stronger one that succeeds the first time. GPT-5.6 Sol and Claude Sonnet 5 cost the same per token, but Sol finished more tasks at a lower cost per task.
- **Move up one level when a run fails.** If a work item’s checks fail or its review is refused, run it again on the next level up rather than on the same model.
- **Check where your data may go.** Not every provider can be used for every project. See [Model providers](/legal/model-providers) for how each one treats the content it is sent.

## How current this is {#how-current-this-is}

Prices and scores on this page were read on {{value:asOf}}. Token prices come from Motir’s model gateway, which refreshes them from OpenRouter; Claude Opus 5.5 was added from OpenRouter directly because it launched after the gateway’s last refresh. Models change every few months, so treat the candidates as a starting point and keep the ones that finish your own work items.

- [SWE-bench Pro leaderboard (BenchLM, 22 September 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [SWE-rebench leaderboard (tasks from 15 May to 1 July 2026)](https://swe-rebench.com/)
