import Link from 'next/link'
import { APP_ORIGIN } from '@/lib/appOrigin'
import { copy } from '@/lib/copy'
import { fetchOpenApiSpec } from '@/lib/docs'
import { CodeBlock } from '../../_components/DocSchema'

/*
 * The getting-started guide (MOTIR-4046, RESTORED by MOTIR-4429).
 *
 * ⚠️ WHAT THIS CARD FIXED. The page was five prose bullets — `0 <pre>` blocks
 * and ZERO occurrences of `curl`. A page titled *Getting started* that contains
 * no request a reader can run has exactly the defect MOTIR-4391 removed from
 * the reference beside it. The deleted `motir-core` page at `95a2d4468^`
 * (`lib/apiDocs/guide.ts`) was a hands-on walkthrough: a first call and its
 * `200` body, two paginated calls and both bodies, a `404` body, and the
 * response headers read back. MOTIR-4397's parity ledger measured the loss;
 * this is the restore, and the five steps it was reduced to are kept as the
 * spine rather than replaced.
 *
 * ⚠️ EVERY REQUEST IS BUILT FROM THE CONFIGURED ORIGIN, never from a literal.
 * `lib/appOrigin.ts` is the one place the motir-core origin lives, so a preview
 * build prints requests against the preview it is part of.
 * `tests/docs/apiGuide.test.tsx` asserts every rendered `curl` carries it — a
 * hard-coded `https://app.motir.co` fails there rather than silently pointing a
 * reader at production from a preview.
 *
 * ── What the RESPONSE bodies are, said plainly ─────────────────────────────
 * Authored illustrations of the documented shapes, elided with `…` where a real
 * body is long — the same treatment the deleted page used. They are not fetched
 * and they are not generated: nothing in this repository can make an
 * authenticated call, and the SHAPES are what a reader needs. What IS derived is
 * the operation set beside them — `/docs/api` renders the served OpenAPI
 * document — so the contract itself is never described from memory here.
 *
 * ⚠️ AND THE ONE NUMBER IN THE HEADER BLOCK IS DERIVED TOO. The deleted page
 * interpolated motir-core's `V1_CONTRACT_VERSION`, which this repository cannot
 * import — so the version comes from the served document's `info.version`, read
 * through the SAME memoized fetch `app/docs/api/layout.tsx` already makes for
 * the rail. That is one document per request, not two, and it is why a typed
 * literal was not the cheaper option: a committed version is stale exactly when
 * it is displayed, which is the copy MOTIR-4180 removed from this repository.
 * Unreachable ⇒ the block shows a PLACEHOLDER and the surrounding paragraph
 * says how to read the real one; it never shows a number that might be wrong.
 */

export const metadata = {
  title: copy.docs.metaTitleGuide,
  description: copy.docs.metaDescriptionGuide,
}

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

function StepHeading({
  index,
  title,
  id,
}: {
  index: number
  title: string
  id: string
}) {
  return (
    <H2 id={id}>
      <span className="mr-2 font-(family-name:--font-mono) text-(--el-text-secondary)">
        {index}
      </span>
      {title}
    </H2>
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
    <code className="font-(family-name:--font-mono) text-[12.5px] break-all text-(--el-text)">
      {children}
    </code>
  )
}

export default async function GettingStartedPage() {
  const origin = APP_ORIGIN

  /*
   * The contract version, from the document motir-core serves. The fetch is
   * memoized per request and the layout above has already made it, so this
   * costs nothing; an unreachable document leaves a placeholder rather than a
   * number this repository invented.
   */
  let contractVersion: string | null = null
  try {
    contractVersion = (await fetchOpenApiSpec()).info.version
  } catch {
    contractVersion = null
  }

  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.apiGettingStarted}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
        The public read API is anonymous — every read endpoint returns project
        data without a sign-in, which is what lets the project square work for a
        logged-out visitor. Everything account-bound carries a token. Five steps
        below, each ending in something you can see happen.
      </p>
      <Prose>
        Every path is relative to the application host, which for this build is{' '}
        <Mono>{origin}</Mono>. The requests below are written against it, so you
        can copy one as it stands.
      </Prose>

      <StepHeading index={1} id="mint-a-token" title="Mint a token" />
      <Prose>
        Mint a personal access token in Settings → Account → Tokens, choose the
        workspace it is bound to, and grant it the permissions it needs — the
        same <Mono>resource:action</Mono> names the Roles & permissions screen
        shows. Grant the narrowest set that does the job: a grant narrows your
        own role and never widens it, so a token cannot do something you could
        not.
      </Prose>
      <Prose>
        <strong className="text-(--el-text)">
          The secret is shown ONCE, when the token is created.
        </strong>{' '}
        Copy it then; there is no way to read it again, and a lost token is
        replaced rather than recovered.
      </Prose>

      <StepHeading
        index={2}
        id="first-call"
        title="Your first authenticated call"
      />
      <Prose>
        Make this call first. It answers who the token is, which workspace it is
        bound to, and exactly which permissions it carries — so you learn what
        your own credential may do without probing endpoints and collecting
        refusals.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption="curl"
          code={`curl ${origin}/api/v1/me \\
  -H "Authorization: Bearer $MOTIR_TOKEN"`}
        />
        <CodeBlock
          caption="200 · application/json"
          code={`{
  "user": { "id": "usr_…", "name": "Ada", "email": "ada@example.com" },
  "workspaceId": "wsp_…",
  "permissions": ["project:browse"]
}`}
        />
      </div>
      <Prose>
        A missing, malformed, unknown, revoked or expired token all return the
        same <Mono>401</Mono> with the same message. That is deliberate:
        distinguishing them would turn the endpoint into an oracle that answers
        “does this secret exist?”.
      </Prose>

      <StepHeading index={3} id="paginate" title="Paginate a collection" />
      <Prose>
        Collections are cursor-paged. Ask for a page size with{' '}
        <Mono>limit</Mono> (the default is 50 and anything larger is clamped to
        100, not rejected), then send the previous response’s{' '}
        <Mono>nextCursor</Mono> back as <Mono>cursor</Mono>. A{' '}
        <Mono>nextCursor</Mono> of <Mono>null</Mono> is the last page.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption="curl · the first page"
          code={`curl "${origin}/api/v1/projects/MOTIR/work-items?limit=2" \\
  -H "Authorization: Bearer $MOTIR_TOKEN"`}
        />
        <CodeBlock
          caption="200 · application/json"
          code={`{
  "items": [ { "key": "MOTIR-1", … }, { "key": "MOTIR-2", … } ],
  "nextCursor": "eyJjIjoid29ya0l0ZW1zIiwicCI6…"
}`}
        />
        <CodeBlock
          caption="curl · the next page"
          code={`curl "${origin}/api/v1/projects/MOTIR/work-items?limit=2&cursor=$CURSOR" \\
  -H "Authorization: Bearer $MOTIR_TOKEN"`}
        />
      </div>
      <Prose>
        The cursor is OPAQUE and signed. Do not parse it, construct one, or
        carry it between collections — a cursor issued elsewhere is a{' '}
        <Mono>422</Mono>, never a silently wrong page. Send back exactly what
        you were given.
      </Prose>
      <Prose>
        One asymmetry surprises people, so it is worth knowing before you meet
        it: some collections also report a <Mono>totalCount</Mono> and most
        deliberately do not. Where the read behind a collection already computes
        one as a bounded aggregate, it is reported; elsewhere the field is
        omitted ENTIRELY — absent, never <Mono>null</Mono> and never{' '}
        <Mono>0</Mono>, so a client can always tell “no total was promised” from
        “the total is zero”.
      </Prose>

      <StepHeading index={4} id="read-an-error" title="Read an error" />
      <Prose>
        Every failure returns the same body: a machine <Mono>code</Mono> and a
        human <Mono>error</Mono>. Branch on <Mono>code</Mono> — it is stable,
        and changing one is a breaking change. Never parse <Mono>error</Mono>;
        it is a sentence for a developer reading a terminal and is reworded
        freely.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption="404 · application/json"
          code={`{ "code": "WORK_ITEM_NOT_FOUND", "error": "Work item not found." }`}
        />
      </div>
      <Prose>
        A <Mono>404</Mono> means the resource does not exist{' '}
        <strong className="text-(--el-text)">or</strong> is outside the
        workspace your token is bound to — the same answer on purpose, so the
        API cannot be used to enumerate another tenant’s data. A{' '}
        <Mono>403</Mono> is the opposite kind of refusal: your token is valid
        and its grant lacks the permission this operation requires, and the
        response names the key. A <Mono>422</Mono> is a request you can fix, and
        its <Mono>code</Mono> names which part.
      </Prose>
      <Prose>
        <strong className="text-(--el-text)">
          A <Mono>500</Mono> is the one failure with NO <Mono>code</Mono>.
        </strong>{' '}
        An unexpected fault has no stable contract, so the body carries a
        message and nothing else — do not branch on it.
      </Prose>

      <StepHeading
        index={5}
        id="rate-limits"
        title="Read the response headers"
      />
      <Prose>
        The budget is per TOKEN, and the headers ride EVERY response — a
        success, a refusal, a mapped error and a fault alike. You never have to
        make a request to find out where you stand; the last one already told
        you.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption="response headers"
          code={`X-RateLimit-Limit:     600
X-RateLimit-Remaining: 594
X-RateLimit-Reset:     1785312000
X-Request-Id:          c7771231-e18c-48bc-90c9-c1a9720436a4
X-Motir-Api-Version:   ${contractVersion ?? '<the contract version>'}`}
        />
      </div>
      <Prose>
        On a <Mono>429</Mono>, back off until <Mono>X-RateLimit-Reset</Mono> — a
        Unix timestamp in SECONDS. There is no <Mono>Retry-After</Mono> header,
        deliberately: an absolute instant cannot go stale in transit the way a
        relative duration can.
      </Prose>
      <Prose>
        <Mono>X-Request-Id</Mono> is on every response too. Quote it if you ever
        need to ask us about a specific call — it is the one identifier that
        finds it.
      </Prose>
      <Prose>
        <Mono>X-Motir-Api-Version</Mono> is the version of the CONTRACT that
        served the response — the same <Mono>MAJOR.MINOR.PATCH</Mono> as the
        specification’s <Mono>info.version</Mono>, not our release number. Read
        it off any response, including a failure, to check for version skew. A
        MAJOR you do not recognise means a <Mono>/api/v2</Mono> exists; a higher
        MINOR means the contract grew, additively, and your client is still
        correct.{' '}
        {contractVersion === null ? (
          <>
            The specification was unreachable when this page was rendered, so
            the block above leaves that line as a placeholder —{' '}
            <Link
              href="/docs/api"
              className="text-(--el-accent-on-surface) underline underline-offset-2"
            >
              {copy.docs.api}
            </Link>{' '}
            reads the current version straight off the document.
          </>
        ) : (
          <>
            The value above is the one the server is serving right now, read
            from the specification when this page was requested.
          </>
        )}
      </Prose>

      <H2 id="what-next">What next</H2>
      <Prose>
        <Link
          href="/docs/api"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.api}
        </Link>{' '}
        lists every operation with its parameters, its body and its statuses.{' '}
        <Link
          href="/docs/api/stability"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.apiStability}
        </Link>{' '}
        is what the contract promises not to do to you. If you are wiring an
        agent rather than writing a client, the{' '}
        <Link
          href="/docs/mcp"
          className="text-(--el-accent-on-surface) underline underline-offset-2"
        >
          {copy.docs.mcp}
        </Link>{' '}
        is the other half.
      </Prose>
    </>
  )
}
