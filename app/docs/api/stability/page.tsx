import Link from 'next/link'
import { copy } from '@/lib/copy'

/*
 * The stability & deprecation policy (MOTIR-4046, RESTORED by MOTIR-4429).
 *
 * ⚠️ WHAT THIS CARD FIXED. The page was three bullets — additive, breaking,
 * deprecation — and `v2` appeared ZERO times on it. The deleted `motir-core`
 * page at `95a2d4468^` (`lib/apiDocs/guide.ts`, `POLICY_SECTIONS`) carried
 * FOUR sections, and the two that went missing are the two that ask something
 * of the reader: **Your side of the promise** (what a client must tolerate for
 * the guarantee to hold) and **How a `v2` would arrive** (the migration story).
 * A promise with only the vendor's half written down is not a contract.
 * MOTIR-4397's parity ledger measured the loss; this is the restore, and the
 * three bullets the page had are kept — as the two explicit lists they were
 * summarising.
 *
 * ── ONE PROMISE IN TWO PLACES, and this is the PUBLISHED half ──────────────
 * `motir-core`'s `docs/decisions/public-api-conventions.md` §8 is the INTERNAL
 * record and this page is the public commitment. Over there the two were held
 * together by `adrPhrase` on every item plus a test that reads §8. That guard
 * CANNOT be reproduced here: the ADR is in another repository and this lane
 * never reaches it, so a phrase-matching structure copied across would be a
 * check that cannot go red — worse than no check, because it looks like one.
 *
 * What is here instead is honest about which half it is: the lists below are
 * the PUBLISHED sentences, and `tests/docs/apiGuide.test.tsx` pins their
 * MEMBERSHIP, so a silent edit that quietly widens what may change fails a
 * test. Holding them against §8 itself belongs in `tests/seam/`, the one lane
 * licensed to reach motir-core — and it needs §8 published as an artifact
 * first, which it is not. That is stated here rather than left as a gap
 * somebody rediscovers.
 */

export const metadata = {
  title: copy.docs.metaTitleStability,
  description: copy.docs.metaDescriptionStability,
}

/** Where the promise is DECIDED, as against this page, where it is published. */
const ADR_URL =
  'https://github.com/moooon-B-V/motir-core/blob/main/docs/decisions/public-api-conventions.md'

/**
 * Allowed inside `v1`, without notice — the published list, in the deleted
 * page's own order and wording.
 */
export const POLICY_ADDITIVE: readonly string[] = [
  'A new endpoint.',
  'A new OPTIONAL query parameter.',
  'A new field on a response object.',
  'A new response header.',
  'A new value on a field documented as open-ended.',
  'A raised rate-limit budget.',
]

/** Forbidden inside `v1` — each of these needs a new major. */
export const POLICY_FORBIDDEN: readonly string[] = [
  'Removing a field.',
  'Renaming a field.',
  'Changing a field’s type or nullability.',
  'Removing or re-purposing an error `code`.',
  'Changing an existing status for an existing condition.',
  'Tightening a limit.',
  'Making an optional parameter required.',
]

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="mt-9 scroll-mt-6 font-(family-name:--font-serif) text-[20px] font-semibold text-(--el-text)"
    >
      {children}
    </h2>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-(--el-text-secondary)">
      {children}
    </p>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[12.5px] text-(--el-text)">
      {children}
    </code>
  )
}

/**
 * A policy item, rendered with its `code` spans. The stored sentences carry
 * backticks so the two lists stay comparable as plain strings — which is what
 * the membership test reads — and this is where they become markup.
 */
function PolicyItem({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g)
  return (
    <li>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Mono key={index}>{part}</Mono>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </li>
  )
}

export default function StabilityPage() {
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.apiStability}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        The public read API is versioned. The contract version travels in the
        served OpenAPI document’s <Mono>info.version</Mono> field, and a change
        that breaks a client is a version bump, not a silent edit.
      </p>

      <H2 id="the-guarantee">
        What <Mono>v1</Mono> guarantees
      </H2>
      <Prose>
        While <Mono>v1</Mono> lives, its paths do not move, an error{' '}
        <Mono>code</Mono> does not change meaning, an existing condition does
        not change status, and a field does not change type or nullability.
        Anything that would break those is a <Mono>v2</Mono>, not a{' '}
        <Mono>v1</Mono> release.
      </Prose>

      <h3 className="mt-6 text-[11px] font-semibold tracking-wide text-(--el-text-secondary) uppercase">
        Allowed inside <Mono>v1</Mono>, without notice
      </h3>
      <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        {POLICY_ADDITIVE.map((text) => (
          <PolicyItem key={text} text={text} />
        ))}
      </ul>

      <h3 className="mt-6 text-[11px] font-semibold tracking-wide text-(--el-text-secondary) uppercase">
        Needs a new major
      </h3>
      <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
        {POLICY_FORBIDDEN.map((text) => (
          <PolicyItem key={text} text={text} />
        ))}
      </ul>

      <H2 id="your-obligation">Your side of the promise</H2>
      <Prose>
        <strong className="text-(--el-text)">
          A client MUST tolerate unknown fields and unknown values, and MUST NOT
          parse the human <Mono>error</Mono> sentence.
        </strong>{' '}
        This is the other half of the promise, and without it the guarantee
        above does not hold: a client that rejects a field it does not recognise
        will break on a change this page calls safe, and a client that parses{' '}
        <Mono>error</Mono> will break on a reworded sentence. Branch on{' '}
        <Mono>code</Mono>, ignore what you do not know, and every additive
        change is free for you.
      </Prose>

      <H2 id="deprecation">Deprecation</H2>
      <Prose>
        A deprecated operation or field is marked <Mono>deprecated: true</Mono>{' '}
        <strong className="text-(--el-text)">in the specification</strong>, and
        carries the reason and its replacement in its description. The
        specification is the announcement channel because it is the one artifact
        every client already reads — so a code generator surfaces the
        deprecation without anyone having to have seen a blog post.
      </Prose>
      <Prose>
        The old behaviour keeps working for the announced window. A field is
        never removed as a surprise.
      </Prose>

      <H2 id="how-v2-arrives">
        How a <Mono>v2</Mono> would arrive
      </H2>
      <Prose>
        As a SECOND document at a second path, served alongside <Mono>v1</Mono>{' '}
        — not as a rewrite of it. <Mono>v1</Mono> does not stop working the day{' '}
        <Mono>v2</Mono> ships, and deprecating <Mono>v1</Mono> is itself an
        announcement under the same window.
      </Prose>
      <Prose>
        The <Mono>info.version</Mono> in the specification is the API contract’s
        version, not the app’s release number: its major is the path version,
        its minor increments on an additive change from the list above, and its
        patch on a documentation-only correction. Read it off any response as{' '}
        <Mono>X-Motir-Api-Version</Mono> —{' '}
        <Link
          href="/docs/api/getting-started"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.apiGettingStarted}
        </Link>{' '}
        shows where.
      </Prose>
      <Prose>
        {/* The deleted page named the ADR as a PATH in prose, because it sat in
            the repository that holds it. From here it is a link, which is the
            same information a reader can actually follow — motir-core is open
            source, and §8 is where this promise is decided rather than
            published. */}
        This page is the published commitment. The internal record it is written
        from is{' '}
        <a
          href={ADR_URL}
          rel="noreferrer noopener"
          target="_blank"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          the API decision record
        </a>
        , §8.
      </Prose>
    </>
  )
}
