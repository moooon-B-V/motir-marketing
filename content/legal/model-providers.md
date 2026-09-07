---
title: Model providers
version: 1.0.1
effectiveDate: TBD
status: approved
---

# Model providers

**This page lists every model provider that can serve a Motir AI request, and links to
each one's own data practices.** It is referenced by the
[subprocessor list](/legal/subprocessors), and it exists as a separate page for a
reason: the provider set changes when a channel is enabled, and a list that changes
should not be welded into a document that is versioned and re-approved.

**This page is informational and is updated whenever the provider set changes.** It does
not vary the [Terms of Service](/legal/terms), the [Privacy Policy](/legal/privacy) or a
signed [DPA](/legal/dpa), and no notice period attaches to an edit here. The
contractual commitments about model providers live in those documents; this page tells
you who the providers currently are.

**Last reviewed: 2026-08-27**, against the routing table of the running gateway.
**Retention and training re-read per vendor on 2026-09-06** — the four rows that carried
_not confirmed_ are closed below, from each vendor's own published documents.

---

## Where this sits: three products, one company

moooon B.V. builds three things, and a reader of this page benefits from knowing which
one is doing what — particularly because two of them are usable without the others.

| Product           | What it is                                                                            | Can be used on its own?                                                       |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **motir-core**    | The planning and project-management application — the board, roadmap and work items   | **Yes.** It is open source and can be self-hosted as standalone PM software   |
| **motir-ai**      | The planning intelligence — it drafts and revises plans                               | **Yes.** It can plan into other project-management tools, not only into Motir |
| **motir-gateway** | The LLM routing layer — one interface in front of many model providers, with metering | **Yes**, and it is intended to be offered to other companies                  |

**None of the three is a subprocessor of the others.** A subprocessor is a _third party_
a processor engages. All three are moooon B.V., so naming them on a subprocessor list
would list a company to itself. What they run **on** — Fly.io — is a subprocessor, and
it is named on the [subprocessor list](/legal/subprocessors).

### What motir-gateway does with your prompt

For the hosted Motir service the path is:

```
motir-core  →  motir-ai  →  motir-gateway  →  the model provider you selected
```

**motir-gateway is a relay, not a model.** It holds no model of its own and produces no
answers. Its job is to accept an OpenAI-compatible request, decide which upstream
_channel_ can serve the model that was asked for, forward the request, meter what it
cost, and return the response. It is the same shape as a public routing service such as
OpenRouter, and it is built to be one.

Three consequences worth stating plainly, because they are what a reader actually wants
to know:

- **It does not train on your content, and neither does motir-ai.** Nothing you send is
  used to train, fine-tune or evaluate a model of ours.
- **It stores what it must meter, and that is a usage record, not a transcript.** Token
  counts, the model name, the channel and a timestamp — the fields a bill is computed
  from.
- **It cannot make a provider behave differently from its own terms.** Once a request
  reaches a provider, that provider's published data practices govern what happens to
  it. That is exactly why they are linked below rather than summarised.

---

## The providers

One row per provider, with the two facts that decide whether you want your content going
there: **how long it is kept**, and **whether it trains a model**. There is no ranking
here and no grouping — the providers differ along these axes and you choose against them,
which is the only honest way to present a set a customer selects from.

The **transfer basis** of each — adequacy, Standard Contractual Clauses, or none on offer
— is a separate question with its own table, in
[_Transfer bases_ on the subprocessor list](/legal/subprocessors).

| Provider          | Models              | Region                      | Prompt retention                                                                                                                                         | Trains on your prompts?                                                                                                                                                  | Its data practices                                                                                                                                                                                                                                               |
| ----------------- | ------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OpenAI**        | GPT, and embeddings | USA                         | Up to 30 days for abuse monitoring, then deleted                                                                                                         | **No** — not on API content                                                                                                                                              | [Sub-processor list](https://openai.com/policies/sub-processor-list/) · published DPA                                                                                                                                                                            |
| **Anthropic**     | Claude              | USA                         | Zero Data Retention available                                                                                                                            | **No** — not on commercial API content                                                                                                                                   | Published Data Processing Addendum, incorporated automatically on its commercial terms                                                                                                                                                                           |
| **Alibaba Cloud** | Qwen                | **Frankfurt, Germany (EU)** | **Not stated as a period** — no Model Studio document states one, and its EEA DPA commits only to delete or return Data on termination (read 2026-09-06) | **No** — "will never use your data for model training" (read 2026-09-06)                                                                                                 | [EEA Data Processing Addendum](https://www.alibabacloud.com/help/en/legal/latest/ae8upq) · [GDPR trust centre](https://www.alibabacloud.com/trust-center/gdpr) · [Model Studio privacy notice](https://www.alibabacloud.com/help/en/model-studio/privacy-notice) |
| **DeepSeek**      | DeepSeek            | People's Republic of China  | **Not stated as a period** — "as long as necessary to provide our Services" (read 2026-09-06)                                                            | **Yes** — "to train and improve our technology, such as our machine learning models and algorithms"; an opt-out is offered to users in certain regions (read 2026-09-06) | [Privacy policy](https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html) · [Open-platform terms](https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html)                                                             |
| **Zhipu AI**      | GLM                 | People's Republic of China  | **Not stated as a period** — "the shortest necessary period" to meet the policy's purposes (read 2026-09-06)                                             | **Yes, on anonymised data** — machine learning and model-algorithm training on anonymised data; no opt-out stated (read 2026-09-06)                                      | [Privacy policy](https://docs.bigmodel.cn/cn/terms/privacy-policy) · [Service agreement](https://docs.bigmodel.cn/cn/terms/service-agreement)                                                                                                                    |
| **Moonshot AI**   | Kimi                | People's Republic of China  | **Not stated** — the platform agreement puts storage on the customer and stores customer data only as law or the service requires (read 2026-09-06)      | **Yes** — you grant "a free right to use your inputs, outputs and feedback for model service optimisation"; no opt-out stated (read 2026-09-06)                          | [Kimi Open Platform terms](https://platform.kimi.com/docs/agreement/modeluse) · [privacy policy](https://platform.kimi.com/docs/agreement/privacy-policy)                                                                                                        |
| **Brave**         | Search, not a model | USA                         | Up to 90 days for query records                                                                                                                          | Not applicable                                                                                                                                                           | Brave Search API Data Processing Addendum                                                                                                                                                                                                                        |

**⚠️ NO CELL READS _not confirmed_ ANY MORE — the four that did were read on 2026-09-06
and are recorded above.** A cell reading _not confirmed_ used to mean _we have not looked_,
and the page said so rather than implying a favourable answer. Every cell now carries
either a stated fact or an explicit **"not stated"**, which is a different thing and is
described next.

**⚠️ "Not stated" IS NOT A PASS EITHER — it is the vendor's silence, reported as silence.**
Four of the rows above say _not stated as a period_ for retention. That does not mean the
vendor keeps nothing, and it does not mean it keeps your prompt for ever. It means we read
that vendor's own published documents and **they do not commit to a period**, so there is
nothing for a customer to rely on. Writing a number in that we had inferred rather than
read would be worse than leaving it open, because the cell is what a customer relies on.
**A workspace that needs a retention guarantee should select a provider whose row states
one** — OpenAI and Anthropic do; Brave states one for search queries.

**Neither moooon B.V. nor its gateway trains on your content**, whichever provider you
select. The rows above describe what the _provider_ does once a request reaches it.

### How each of the four answers was read

Recorded so a reader can repeat the read rather than trust it. Each is that vendor's own
published document, in the **international / EU-facing** edition where a vendor publishes
more than one, and each was read on **2026-09-06**.

| Provider          | Retention read from                                                                                                                                                                                                                                                                                    | Training read from                                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alibaba Cloud** | Model Studio's _Security certifications and privacy notice_ and its _regions_ documentation state no retention period; the **EEA Data Processing Addendum** commits only to "delete or return all Data in Alibaba Cloud's possession or control following the termination of the Membership Agreement" | Model Studio's _Security certifications and privacy notice_: **"Alibaba Cloud strictly protects your data privacy and will never use your data for model training."**                                                                                                              |
| **DeepSeek**      | Privacy policy: **"We retain Personal Data for as long as necessary to provide our Services and for the other purposes set out in this Privacy Policy."** The open-platform terms of service state no period at all                                                                                    | Privacy policy: personal data is used **"to train and improve our technology, such as our machine learning models and algorithms"**, with a right for users in certain regions **"to opt-out of using your Personal Data for training our models or optimizing our technologies"** |
| **Zhipu AI**      | Privacy policy: 只会在…**"所需的最短必要期限内保留您的个人信息"** — retained only for the shortest necessary period. Service agreement: data stored **"在为您提供服务和满足合规要求所需的最小必要范围内"** — the minimum necessary scope. Neither states a figure                                      | Privacy policy permits **"使用匿名数据进行机器学习或模型算法训练"** — machine learning and model-algorithm training **on anonymised data**. No opt-out is described                                                                                                                |
| **Moonshot AI**   | Kimi Open Platform terms §五.5: **"您应根据自身需求自行对客户数据进行存储，我们仅依据相关法律法规要求或基于本服务的需要存储客户数据"** — you store your own data; Moonshot stores customer data only as law or the service requires. No period is stated                                               | Kimi Open Platform terms §六.3: **"您授予我们一项免费的使用权，以在法律允许的范围内将您输入输出之内容及反馈用于模型服务优化。"** — you grant a free right to use your inputs, outputs and feedback for model-service optimisation. No opt-out is described                         |

⚠️ **The Alibaba Cloud row is the one to be careful with, and it was read accordingly.**
Model Studio publishes separate documentation for its mainland-China and international
editions, and the answers can differ. Every document cited above is the **international**
edition on `alibabacloud.com`, which is what serves the **Germany (Frankfurt)** region our
workspace uses; that documentation states that request data is stored in the selected
region. Nothing here was read from `help.aliyun.com`.

⚠️ **Three of these four answers are about the vendor's PUBLISHED position, not about a
negotiated one.** Where a vendor offers no commitment in public, a customer with a signed
agreement may have a different answer than this page reports. This page reports what
anyone can read.

---

## Restricting where your requests go

The table exists so it can be acted on, not only read.

- **Choose the model per project.** That choice determines the provider.
  **⚠️ Updated 2026-09-06.** This bullet used to promise that the general-availability
  default would be "a provider whose retention and training rows are stated rather than
  open". Now that all six rows are recorded, that condition is met by every provider and
  no longer distinguishes between them — **the answers themselves do**. Three of the six
  state that they use API content to train or optimise models; two state that they do not.
  What the GA default should be is therefore a live question rather than a settled one,
  and it is not decided on this page.
- **Hosted agents choose their own model**, which need not be the planner's — so a
  workspace can plan on one provider and execute on another.
- **The constraint is enforced where the request leaves.** The gateway routes on a
  residency group, and a provider without a recorded transfer basis cannot enter the
  group that serves EU traffic. A request that would breach it **fails rather than
  routing** — the correct failure, because a job that errors can be retried and a
  transfer that has happened cannot be undone.

---

## How this list is kept accurate

It is read from the gateway's own routing table, which is the thing that actually
decides where a request goes. It is **not** compiled from anyone's memory of which
integrations exist — that method failed four times in a single day on the subprocessor
list, which is why that page now carries a test and why this one records its method.

⚠️ **The read is currently manual, and that is a known weakness.** The routing table
lives in the gateway's database rather than in a repository, so no test in `motir-core`
can see it. Until this page is generated from that table, a provider enabled without a
corresponding edit here would go unlisted, and only a human re-run of this method would
find it.

Questions about anything on this page: **[legal@motir.co](mailto:legal@motir.co)**.
