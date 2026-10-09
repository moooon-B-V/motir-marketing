The public read API is versioned. The contract version travels in the served OpenAPI document’s `info.version` field, and a change that breaks a client is a version bump, not a silent edit.

## What `v1` guarantees {#the-guarantee}

While `v1` lives, its paths do not move, an error `code` does not change meaning, an existing condition does not change status, and a field does not change type or nullability. Anything that would break those is a `v2`, not a `v1` release.

### Allowed inside `v1`, without notice {#allowed-inside-v1}

- A new endpoint.
- A new OPTIONAL query parameter.
- A new field on a response object.
- A new response header.
- A new value on a field documented as open-ended.
- A raised rate-limit budget.

### Needs a new major {#needs-a-new-major}

- Removing a field.
- Renaming a field.
- Changing a field’s type or nullability.
- Removing or re-purposing an error `code`.
- Changing an existing status for an existing condition.
- Tightening a limit.
- Making an optional parameter required.

## Your side of the promise {#your-obligation}

**A client MUST tolerate unknown fields and unknown values, and MUST NOT parse the human `error` sentence.** This is the other half of the promise, and without it the guarantee above does not hold: a client that rejects a field it does not recognise will break on a change this page calls safe, and a client that parses `error` will break on a reworded sentence. Branch on `code`, ignore what you do not know, and every additive change is free for you.

## Deprecation {#deprecation}

A deprecated operation or field is marked `deprecated: true` **in the specification**, and carries the reason and its replacement in its description. The specification is the announcement channel because it is the one artifact every client already reads — so a code generator surfaces the deprecation without anyone having to have seen a blog post.

The old behaviour keeps working for the announced window. A field is never removed as a surprise.

## How a `v2` would arrive {#how-v2-arrives}

As a SECOND document at a second path, served alongside `v1` — not as a rewrite of it. `v1` does not stop working the day `v2` ships, and deprecating `v1` is itself an announcement under the same window.

The `info.version` in the specification is the API contract’s version, not the app’s release number: its major is the path version, its minor increments on an additive change from the list above, and its patch on a documentation-only correction. Read it off any response as `X-Motir-Api-Version` — [Getting started](/docs/api/getting-started) shows where.

This page is the published commitment. The internal record it is written from is [the API decision record](https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md), §8.
