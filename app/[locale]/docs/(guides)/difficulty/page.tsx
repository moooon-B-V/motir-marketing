import Link from 'next/link'

import { englishCopy, getCopy } from '@/lib/copy'
import { enterLocale, type LocalePageProps } from '@/i18n/locale'

/*
 * The DIFFICULTY guide — what each of a leaf's four difficulty levels means,
 * and which models we suggest running each level on, with what a task costs.
 *
 * ⚠️ THIS PAGE CARRIES NUMBERS THAT LIVE ELSEWHERE, deliberately and dated.
 * The Sentry guide's rule is "no numbers that live elsewhere"; a model guide
 * cannot follow it, because the price and the measured score ARE the advice.
 * So every number is pinned to its source and date in `AS_OF` and `SOURCES`,
 * and the page says so to the reader. When the gateway catalog or the
 * leaderboards move, this file is re-read and re-dated — never half-edited.
 *
 * Sources for the numbers:
 * - token prices: motir-gateway `motir/catalog/upstream-prices.json` (the
 *   OpenRouter snapshot of 2026-09-21); Claude Opus 5.5 is not in that snapshot
 *   yet and is read from OpenRouter's live list on 2026-09-23 ($4 / $20).
 * - scores: SWE-bench Pro (BenchLM, 2026-09-22) and SWE-rebench (fresh GitHub
 *   tasks, 2026-05-15 → 2026-07-01), whose per-problem cost is the measured
 *   cost per task below. A cost marked "≈" is NOT measured: it scales a
 *   measured sibling by the token price, and says which.
 *
 * ⚠️ THE LEVEL NAMES ARE motir-core's: `trivial · low · medium · high`
 * (`lib/issues/difficulty.ts`). Motir states a leaf's difficulty in the
 * dispatch prompt; it does NOT pick the model — the reader does, and the page
 * says that rather than implying a router that has not shipped.
 */

export const metadata = {
  title: englishCopy.docs.metaTitleDifficulty,
  description: englishCopy.docs.metaDescriptionDifficulty,
}

const AS_OF = '23 September 2026'

type Candidate = {
  model: string
  price: string
  sweBenchPro: string
  sweRebench: string
  costPerTask: string
}

type Level = {
  level: string
  means: string
  examples: string
  costRange: string
  candidates: Candidate[]
}

const LEVELS: Level[] = [
  {
    level: 'trivial',
    means:
      'Mechanical work with an unambiguous spec and no judgement calls. The change is fully described by the work item.',
    examples: 'A rename, a copy change, a config flip, bumping a version.',
    costRange: 'about $0.05–0.15',
    candidates: [
      {
        model: 'DeepSeek V4 Pro',
        price: '$0.435 / $0.87',
        sweBenchPro: '55.4',
        sweRebench: '40.2',
        costPerTask: '$0.15',
      },
      {
        model: 'GPT-5.6 Luna',
        price: '$0.20 / $1.20',
        sweBenchPro: '62.7',
        sweRebench: '43.6',
        costPerTask: '$0.11',
      },
      {
        model: 'DeepSeek V4 Flash',
        price: '$0.14 / $0.28',
        sweBenchPro: '52.6',
        sweRebench: '—',
        costPerTask: '≈ $0.05 (V4 Pro, by price)',
      },
    ],
  },
  {
    level: 'low',
    means:
      'Routine work that follows a pattern the codebase already has. Some reading is needed, but the right answer is clear once it is found.',
    examples:
      'A new field through an existing form, an endpoint shaped like its neighbours, a contained bug with a clear reproduction.',
    costRange: 'about $0.85–1.45',
    candidates: [
      {
        model: 'GPT-5.6 Sol',
        price: '$2 / $10',
        sweBenchPro: '64.6',
        sweRebench: '62.3',
        costPerTask: '$0.85',
      },
      {
        model: 'GLM-5.2',
        price: '$0.65 / $2.04',
        sweBenchPro: '62.1',
        sweRebench: '62.9',
        costPerTask: '$1.40',
      },
      {
        model: 'Claude Sonnet 5',
        price: '$2 / $10',
        sweBenchPro: '63.2',
        sweRebench: '56.8',
        costPerTask: '$1.43',
      },
    ],
  },
  {
    level: 'medium',
    means:
      'Work with real design choices: several files or services, trade-offs to weigh, or a spec that leaves room for interpretation.',
    examples:
      'A feature across the API and the interface, a refactor with callers to migrate, a bug whose cause is not yet known.',
    costRange: 'about $2.80–3.50',
    candidates: [
      {
        model: 'Claude Opus 5.5',
        price: '$4 / $20',
        sweBenchPro: '89.9',
        sweRebench: '—',
        costPerTask: '≈ $2.80 (Opus 5, by price)',
      },
      {
        model: 'Claude Opus 5',
        price: '$5 / $25',
        sweBenchPro: '79.2',
        sweRebench: '63.4',
        costPerTask: '$3.47',
      },
    ],
  },
  {
    level: 'high',
    means:
      'Work where a subtle mistake is costly: concurrency, security, data migrations, authentication, or a design with no precedent to follow.',
    examples:
      'Lock ordering, a permission model change, a schema migration on live data, a new subsystem.',
    costRange: 'about $4.40 and up',
    candidates: [
      {
        model: 'Claude Fable 5.1',
        price: '$10 / $50',
        sweBenchPro: '81.2',
        sweRebench: '—',
        costPerTask: '≈ $4.40 (Fable 5, same price)',
      },
      {
        model: 'GPT-6 Astra',
        price: '$10 / $50',
        sweBenchPro: '—',
        sweRebench: '—',
        costPerTask: '—',
      },
    ],
  },
]

const SOURCES: { label: string; href: string }[] = [
  {
    label: 'SWE-bench Pro leaderboard (BenchLM, 22 September 2026)',
    href: 'https://benchlm.ai/benchmarks/swe-bench-pro',
  },
  {
    label: 'SWE-rebench leaderboard (tasks from 15 May to 1 July 2026)',
    href: 'https://swe-rebench.com/',
  },
]

export default async function DifficultyDocsPage({ params }: LocalePageProps) {
  const locale = await enterLocale(params)
  const copy = await getCopy(locale)
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.difficulty}
      </h1>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-(--el-text)">
        <p>
          A task, subtask or bug can carry a <strong>difficulty</strong>: how
          much reasoning the work demands, not how much of it there is. Story
          points and estimates measure size. Difficulty says how hard the work
          is to get right, so a one-line change to lock ordering can be{' '}
          <Mono>high</Mono> while a large, mechanical rename is{' '}
          <Mono>trivial</Mono>.
        </p>
        <p>
          Motir states a work item’s difficulty in the prompt it hands to your
          agent. Motir does not choose the model for you: use the levels below
          to decide which model to run each work item on. Epics and stories do
          not carry a difficulty.
        </p>

        <H2>The four levels</H2>
        <ul className="list-disc space-y-2 pl-6">
          {LEVELS.map((l) => (
            <li key={l.level}>
              <strong>
                <Mono>{l.level}</Mono>
              </strong>{' '}
              — {l.means}{' '}
              <span className="text-(--el-text-secondary)">
                For example: {l.examples}
              </span>
            </li>
          ))}
        </ul>
        <p>
          When no difficulty is set, treat the work item as <Mono>medium</Mono>.
          An unset level means nobody has judged it yet, and that is not a
          reason to send it to the cheapest model.
        </p>

        <H2 id="models">Suggested models for each level</H2>
        <p>
          Each level lists its candidates in order. Take the first one your
          project is allowed to use. The table shows each model’s price per
          million tokens (input / output), its score on two coding benchmarks,
          and what one task cost on SWE-rebench. That benchmark uses fresh tasks
          a model cannot have trained on, so its cost per task is the closest
          public figure to what one of your subtasks will cost.
        </p>

        {LEVELS.map((l) => (
          <div key={l.level} className="pt-2">
            <h3 className="text-[16px] font-bold text-(--el-text-strong)">
              <Mono>{l.level}</Mono>{' '}
              <span className="font-normal text-(--el-text-secondary)">
                · {l.costRange} per task
              </span>
            </h3>
            <div className="overflow-x-auto">
              <table className="mt-2 w-full border-collapse text-left text-[14px]">
                <thead>
                  <tr className="text-[13px] text-(--el-text-secondary)">
                    <Th>Model</Th>
                    <Th>Price per 1M tokens</Th>
                    <Th>SWE-bench Pro</Th>
                    <Th>SWE-rebench</Th>
                    <Th last>Cost per task</Th>
                  </tr>
                </thead>
                <tbody>
                  {l.candidates.map((c) => (
                    <tr key={c.model} className="align-top">
                      <Td>{c.model}</Td>
                      <Td>{c.price}</Td>
                      <Td>{c.sweBenchPro}</Td>
                      <Td>{c.sweRebench}</Td>
                      <Td last>{c.costPerTask}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <p className="text-[14px] text-(--el-text-secondary)">
          A cost marked ≈ has not been measured. It takes a measured model from
          the same family and scales it by the difference in token price. A dash
          means no public score or cost exists yet.
        </p>

        <H2>Reading the numbers</H2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>
              The two benchmarks disagree, so neither decides alone.
            </strong>{' '}
            SWE-bench Pro covers more models, but about 30% of its public tasks
            are known to be broken. SWE-rebench is harder to game, and it is the
            reason DeepSeek V4 Pro and GPT-5.6 Luna sit in <Mono>trivial</Mono>:
            both score 15 to 19 points lower on its fresh tasks.
          </li>
          <li>
            <strong>
              Compare cost per finished task, not price per token.
            </strong>{' '}
            A cheaper model that fails and has to be run again costs more than a
            stronger one that succeeds the first time. GPT-5.6 Sol and Claude
            Sonnet 5 cost the same per token, but Sol finished more tasks at a
            lower cost per task.
          </li>
          <li>
            <strong>Move up one level when a run fails.</strong> If a work
            item’s checks fail or its review is refused, run it again on the
            next level up rather than on the same model.
          </li>
          <li>
            <strong>Check where your data may go.</strong> Not every provider
            can be used for every project. See{' '}
            <Link
              href="/legal/model-providers"
              className="text-(--el-link) underline underline-offset-2"
            >
              Model providers
            </Link>{' '}
            for how each one treats the content it is sent.
          </li>
        </ul>

        <H2>How current this is</H2>
        <p>
          Prices and scores on this page were read on {AS_OF}. Token prices come
          from Motir’s model gateway, which refreshes them from OpenRouter;
          Claude Opus 5.5 was added from OpenRouter directly because it launched
          after the gateway’s last refresh. Models change every few months, so
          treat the candidates as a starting point and keep the ones that finish
          your own work items.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          {SOURCES.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="text-(--el-link) underline underline-offset-2"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="pt-4 font-(family-name:--font-serif) text-[20px] leading-snug font-bold text-(--el-text-strong)"
    >
      {children}
    </h2>
  )
}

function Th({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <th
      className={`border-b border-(--el-border) py-2 font-medium ${last ? '' : 'pr-4'}`}
    >
      {children}
    </th>
  )
}

function Td({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <td
      className={`border-b border-(--el-border) py-2 ${last ? 'text-(--el-text-secondary)' : 'pr-4 whitespace-nowrap'}`}
    >
      {children}
    </td>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px] whitespace-nowrap">
      {children}
    </code>
  )
}
