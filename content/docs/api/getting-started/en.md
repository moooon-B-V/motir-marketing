The public read API is anonymous — every read endpoint returns project data without a sign-in, which is what lets the project square work for a logged-out visitor. Everything account-bound carries a token. Five steps below, each ending in something you can see happen.

Every path is relative to the application host this build points at, shown below. The requests are written against it, so you can copy one as it stands.

{{slot:app-host}}

## 1. Mint a token {#mint-a-token}

Mint a personal access token in Settings → Account → Tokens, choose the workspace it is bound to, and grant it the permissions it needs — the same `resource:action` names the Roles & permissions screen shows. Grant the narrowest set that does the job: a grant narrows your own role and never widens it, so a token cannot do something you could not.

**The secret is shown ONCE, when the token is created.** Copy it then; there is no way to read it again, and a lost token is replaced rather than recovered.

## 2. Your first authenticated call {#first-call}

Make this call first. It answers who the token is, which workspace it is bound to, and exactly which permissions it carries — so you learn what your own credential may do without probing endpoints and collecting refusals.

{{slot:first-call-request}}

{{slot:first-call-response}}

A missing, malformed, unknown, revoked or expired token all return the same `401` with the same message. That is deliberate: distinguishing them would turn the endpoint into an oracle that answers “does this secret exist?”.

## 3. Paginate a collection {#paginate}

Collections are cursor-paged. Ask for a page size with `limit` (the default is 50 and anything larger is clamped to 100, not rejected), then send the previous response’s `nextCursor` back as `cursor`. A `nextCursor` of `null` is the last page.

{{slot:paginate-first-request}}

{{slot:paginate-first-response}}

{{slot:paginate-next-request}}

The cursor is OPAQUE and signed. Do not parse it, construct one, or carry it between collections — a cursor issued elsewhere is a `422`, never a silently wrong page. Send back exactly what you were given.

One asymmetry surprises people, so it is worth knowing before you meet it: some collections also report a `totalCount` and most deliberately do not. Where the read behind a collection already computes one as a bounded aggregate, it is reported; elsewhere the field is omitted ENTIRELY — absent, never `null` and never `0`, so a client can always tell “no total was promised” from “the total is zero”.

## 4. Read an error {#read-an-error}

Every failure returns the same body: a machine `code` and a human `error`. Branch on `code` — it is stable, and changing one is a breaking change. Never parse `error`; it is a sentence for a developer reading a terminal and is reworded freely.

{{slot:error-404-response}}

A `404` means the resource does not exist **or** is outside the workspace your token is bound to — the same answer on purpose, so the API cannot be used to enumerate another tenant’s data. A `403` is the opposite kind of refusal: your token is valid and its grant lacks the permission this operation requires, and the response names the key. A `422` is a request you can fix, and its `code` names which part.

**A `500` is the one failure with NO `code`.** An unexpected fault has no stable contract, so the body carries a message and nothing else — do not branch on it.

## 5. Read the response headers {#rate-limits}

The budget is per TOKEN, and the headers ride EVERY response — a success, a refusal, a mapped error and a fault alike. You never have to make a request to find out where you stand; the last one already told you.

{{slot:response-headers}}

On a `429`, back off until `X-RateLimit-Reset` — a Unix timestamp in SECONDS. There is no `Retry-After` header, deliberately: an absolute instant cannot go stale in transit the way a relative duration can.

`X-Request-Id` is on every response too. Quote it if you ever need to ask us about a specific call — it is the one identifier that finds it.

`X-Motir-Api-Version` is the version of the CONTRACT that served the response — the same `MAJOR.MINOR.PATCH` as the specification’s `info.version`, not our release number. Read it off any response, including a failure, to check for version skew. A MAJOR you do not recognise means a `/api/v2` exists; a higher MINOR means the contract grew, additively, and your client is still correct. If the block above shows a placeholder instead of a version, the specification was unreachable when this page was rendered, and [API reference](/docs/api) reads the current version straight off the document.

## What next {#what-next}

[API reference](/docs/api) lists every operation with its parameters, its body and its statuses. [Stability & deprecation](/docs/api/stability) is what the contract promises not to do to you. If you are wiring an agent rather than writing a client, the [MCP server](/docs/mcp) is the other half.
