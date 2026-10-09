import Link from 'next/link'
import { Fragment } from 'react'

import { copy } from '@/lib/copy'
import {
  AGENT_INSTALLS,
  CHECKED_ON,
  CLAUDE_CODE_UPDATE,
  RELEASE_SKILLS,
  SKILL_USAGE,
  SKILLS_RELEASE_TAG,
  SKILLS_RELEASE_URL,
  SKILLS_REPO_URL,
} from '@/lib/skillsGuide'
import { CodeBlock } from '../../_components/DocSchema'
import { enterLocale, type LocalePageProps } from '@/i18n/locale'

/*
 * The SKILLS guide (MOTIR-6717) — how to put Motir's skills into the agent a
 * reader already uses, and what to say to use each one.
 *
 * ⚠️ NOTHING ABOUT AN AGENT OR A RELEASE IS TYPED IN THIS FILE. The tag, the
 * repository, every command, every directory and every documentation link
 * come from `lib/skillsGuide.ts`, where each agent's path is dated and
 * sourced. This file arranges them. `tests/docs/skills.test.tsx` asserts every
 * tag on the rendered page equals the one constant, so a release bump that
 * missed a block fails there rather than shipping two versions on one page.
 *
 * ⚠️ THE USAGE SECTIONS ARE THE SHAPE LATER SKILLS APPEND TO. A new skill adds
 * one entry to `SKILL_USAGE` (`motir-guide` did, MOTIR-6732); nothing in this
 * file changes for it. The install copy names `RELEASE_SKILLS` rather than a
 * count, because a release can carry a skill before its usage section lands.
 *
 * No design card, deliberately: a text guide in the shipped docs template,
 * composing `CodeBlock` and its copy control the way `/docs/mcp` does, and no
 * component of its own.
 */

export const metadata = {
  title: copy.docs.metaTitleSkills,
  description: copy.docs.metaDescriptionSkills,
}

const linkClass = 'text-(--el-accent-on-surface) underline underline-offset-2'

export default async function SkillsDocsPage({ params }: LocalePageProps) {
  await enterLocale(params)
  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.skills}
      </h1>

      <Prose>
        Motir’s skills let the agent you already use work your Motir project.
        Say <Mono>motir run</Mono> and it takes the next ready work item, builds
        it and opens a linked pull request. Say <Mono>motir log bug</Mono> and
        it checks the defect and files it where it belongs. Say{' '}
        <Mono>motir mark</Mono> and it closes a manual work item once you have
        done it. Say <Mono>motir guide</Mono> and it walks you through a manual
        work item one step at a time.
      </Prose>
      <Prose>
        They are ordinary{' '}
        <a
          className={linkClass}
          href="https://agentskills.io"
          rel="noreferrer noopener"
          target="_blank"
        >
          Agent Skills
        </a>
        : one folder per skill, each with a <Mono>SKILL.md</Mono>, published in{' '}
        <a
          className={linkClass}
          href={SKILLS_REPO_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          moooon-B-V/motir-skills
        </a>
        . Every command on this page installs release{' '}
        <a
          className={linkClass}
          href={SKILLS_RELEASE_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          <Mono>{SKILLS_RELEASE_TAG}</Mono>
        </a>
        .
      </Prose>

      <H2 id="before">Before you start</H2>
      <Prose>
        The skills talk to Motir through its MCP server. In Claude Code the
        plugin connects it for you: you sign in with your Motir account in the
        browser, and there is no token. Every other agent needs that server
        connected first — a Motir project, a personal access token, and the
        setup for your agent in the{' '}
        <Link href="/docs/mcp" className={linkClass}>
          {copy.docs.mcp}
        </Link>{' '}
        guide, which also covers the token route in Claude Code if you cannot
        use the browser sign-in. A token with the default permissions can do
        everything these skills do. You also need <Mono>git</Mono>, and the
        GitHub CLI (<Mono>gh</Mono>) for the skills that open or read pull
        requests.
      </Prose>

      <H2 id="install">Install</H2>
      <Prose>
        Pick your agent. Each section installs every skill in the release for
        every project on your machine. The terminal commands are for macOS and
        Linux: they fetch the release, copy the skill folders into the folder
        that agent reads, and remove the download.
      </Prose>

      {AGENT_INSTALLS.map((agent) => (
        <section key={agent.id} className="mt-6">
          <H3 id={agent.id}>{agent.label}</H3>
          <Prose>{agent.intro}</Prose>
          {agent.brings ? (
            <ul className="mt-2 max-w-[68ch] list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-(--el-text-secondary)">
              {agent.brings.map((item) => (
                <li key={item.title}>
                  <strong className="text-(--el-text)">{item.title}.</strong>{' '}
                  {item.text}
                  {item.link ? (
                    <>
                      {' '}
                      <Link href={item.link.href} className={linkClass}>
                        {item.link.label}
                      </Link>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-3">
            {agent.blocks.map((block) => (
              <CodeBlock
                key={block.caption}
                caption={block.caption}
                code={block.code}
                copyLabel={block.copyLabel}
              />
            ))}
          </div>
          <p className="mt-1.5 max-w-[68ch] text-[12px] leading-relaxed text-(--el-text-secondary)">
            {agent.note} ·{' '}
            <a
              className={linkClass}
              href={agent.docsUrl}
              rel="noreferrer noopener"
              target="_blank"
            >
              {agent.label} documentation
            </a>{' '}
            · checked {CHECKED_ON}
          </p>
        </section>
      ))}

      <Prose>
        Then ask your agent which skills it has.{' '}
        {RELEASE_SKILLS.map((name, i) => (
          <Fragment key={name}>
            {i === 0 ? '' : i === RELEASE_SKILLS.length - 1 ? ' and ' : ', '}
            <Mono>{name}</Mono>
          </Fragment>
        ))}{' '}
        are listed. Another agent that reads <Mono>SKILL.md</Mono> skills works
        the same way: copy the skill folders into the folder it reads skills
        from.
      </Prose>

      <H2 id="use">Use</H2>
      <Prose>
        Type what is under <strong className="text-(--el-text)">Say</strong>{' '}
        into your agent. Replace <Mono>ACME-12</Mono> with the key of a work
        item in your own project.
      </Prose>

      {SKILL_USAGE.map((skill) => (
        <section key={skill.name} className="mt-6">
          <H3 id={skill.name}>
            <Mono>{skill.name}</Mono>
          </H3>
          <dl className="mt-2 max-w-[68ch] space-y-3 text-[15px] leading-relaxed text-(--el-text)">
            <div>
              <dt className="font-semibold">Say</dt>
              <dd className="m-0">
                <ul className="mt-1 space-y-1">
                  {skill.say.map((line) => (
                    <li key={line}>
                      <Mono>{line}</Mono>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">What happens</dt>
              <dd className="m-0">{skill.does}</dd>
            </div>
            <div>
              <dt className="font-semibold">What you see in Motir</dt>
              <dd className="m-0">{skill.see}</dd>
            </div>
          </dl>
        </section>
      ))}

      <H2 id="wrong">When a work item is wrong</H2>
      <Prose>
        Sometimes a work item cannot be built as written. It may ask for
        something that does not exist, need a design nobody has drawn, or reach
        into two repositories. <Mono>motir-run</Mono> does not guess its way
        around that. It moves the work item to{' '}
        <strong className="text-(--el-text)">Planning</strong>, so no other run
        picks it up, and asks Motir’s AI planner to plan the correction. Then it
        stops. The plan waits for you to review and approve in Motir, and
        nothing is built until you do.
      </Prose>
      <Prose>
        If your token cannot use AI planning, or your AI credits have run out,
        it stops anyway. It leaves a comment on the work item with the whole
        correction and says why it could not hand it over.
      </Prose>

      <H2 id="updating">Updating</H2>
      <Prose>
        A new release has a new tag, and this page moves to it. For a copy
        install, run your agent’s install step again: it overwrites the skill
        folders in place. In Claude Code, a marketplace cannot be added again at
        a different tag, so remove it, add it at the new tag and install the
        plugin again:
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption={CLAUDE_CODE_UPDATE.caption}
          code={CLAUDE_CODE_UPDATE.code}
          copyLabel={CLAUDE_CODE_UPDATE.copyLabel}
        />
      </div>
      <Prose>Restart your agent afterwards so it reads the new versions.</Prose>
    </>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-(--el-text)">
      {children}
    </p>
  )
}

function H2({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="pt-6 font-(family-name:--font-serif) text-[20px] leading-snug font-bold text-(--el-text-strong)"
    >
      {children}
    </h2>
  )
}

function H3({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h3 id={id} className="text-[16px] font-bold text-(--el-text-strong)">
      {children}
    </h3>
  )
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px] whitespace-nowrap">
      {children}
    </code>
  )
}
