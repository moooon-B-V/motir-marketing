import Link from 'next/link'

import { copy } from '@/lib/copy'
import {
  AGENT_INSTALLS,
  CLAUDE_CODE_UPDATE,
  SKILL_USAGE,
  SKILLS_RELEASE_TAG,
  SKILLS_RELEASE_URL,
  SKILLS_REPO_URL,
} from '@/lib/skillsGuide'
import { CodeBlock } from '../../_components/DocSchema'

/*
 * The CLAUDE CODE PLUGIN guide (2026-10 redesign) — the one install that
 * brings Motir's skills, its MCP server and a runner for its CLI into Claude
 * Code. The Products menu opens it for "Motir Claude Code plugin".
 *
 * ⚠️ NOTHING ABOUT THE PLUGIN OR A RELEASE IS TYPED IN THIS FILE. The tag, the
 * commands, what the install brings, how to check it and how to update it are
 * the Claude Code entry of `AGENT_INSTALLS` and `CLAUDE_CODE_UPDATE` in
 * `lib/skillsGuide.ts` — the same data the skills guide renders — so a release
 * bump updates both pages at once. The skills' usage is `SKILL_USAGE`; this
 * page lists what to say and leaves the detail to the skills guide.
 */

export const metadata = {
  title: copy.docs.metaTitleClaudeCodePlugin,
  description: copy.docs.metaDescriptionClaudeCodePlugin,
}

const linkClass = 'text-(--el-accent-on-surface) underline underline-offset-2'

export default function ClaudeCodePluginDocsPage() {
  const claudeCode = AGENT_INSTALLS.find((agent) => agent.id === 'claude-code')!
  const [install] = claudeCode.blocks
  // The shared note goes on to the copy-only install, which this page does not
  // offer; it keeps the check, the part before that.
  const pluginCheck = claudeCode.note.split(' Copying the skills')[0]

  return (
    <>
      <h1 className="font-(family-name:--font-serif) text-[30px] leading-[1.2] font-bold tracking-[-0.01em] text-(--el-text)">
        {copy.docs.claudeCodePlugin}
      </h1>

      <Prose>
        Motir’s plugin for Claude Code puts your Motir project inside Claude
        Code with one install: Motir’s skills, its MCP server and a runner for
        its CLI. It signs in with your Motir account in the browser, so there is
        no token. Say <Mono>motir run</Mono> and Claude Code takes the next
        ready work item, builds it and opens a linked pull request.
      </Prose>
      <Prose>
        The plugin is published from{' '}
        <a
          className={linkClass}
          href={SKILLS_REPO_URL}
          rel="noreferrer noopener"
          target="_blank"
        >
          moooon-B-V/motir-skills
        </a>
        , which is also a Claude Code plugin marketplace. Every command on this
        page installs release{' '}
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
        You need Claude Code, a Motir account with access to the project, and{' '}
        <Mono>git</Mono>. The runner needs Node.js 22 or newer, and the skills
        that open or read pull requests need the GitHub CLI (<Mono>gh</Mono>).
      </Prose>

      <H2 id="install">Install</H2>
      <Prose>
        Add the marketplace at the release tag, then install the plugin. Run
        both in Claude Code.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption={install.caption}
          code={install.code}
          copyLabel={install.copyLabel}
        />
      </div>

      <H2 id="brings">What it brings</H2>
      <ul className="mt-3 max-w-[68ch] list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-(--el-text)">
        {(claudeCode.brings ?? []).map((item) => (
          <li key={item.title}>
            <strong className="font-semibold">{item.title}.</strong> {item.text}
          </li>
        ))}
      </ul>

      <H2 id="check">Check it worked</H2>
      <Prose>{pluginCheck}</Prose>

      <H2 id="use">Use it</H2>
      <Prose>
        Say what you want in Claude Code. Each skill’s full behaviour, and what
        you will see in Motir, is in the{' '}
        <Link href="/docs/skills#use" className={linkClass}>
          {copy.docs.skills}
        </Link>{' '}
        guide.
      </Prose>
      <ul className="mt-3 max-w-[68ch] space-y-1.5 text-[15px] leading-relaxed text-(--el-text)">
        {SKILL_USAGE.map((skill) => (
          <li key={skill.name}>
            <Link href={`/docs/skills#${skill.name}`} className={linkClass}>
              <Mono>{skill.say[0]}</Mono>
            </Link>
          </li>
        ))}
      </ul>

      <H2 id="updating">Updating</H2>
      <Prose>
        A marketplace added at one release cannot be added again at another, so
        remove it first. Removing it uninstalls the plugin, and the last line
        installs it again at the new release.
      </Prose>
      <div className="mt-3">
        <CodeBlock
          caption={CLAUDE_CODE_UPDATE.caption}
          code={CLAUDE_CODE_UPDATE.code}
          copyLabel={CLAUDE_CODE_UPDATE.copyLabel}
        />
      </div>
      <Prose>
        Using another agent, or only want the connector? See the{' '}
        <Link href="/docs/skills" className={linkClass}>
          {copy.docs.skills}
        </Link>{' '}
        guide for every agent, or the{' '}
        <Link href="/docs/claude-code-connector" className={linkClass}>
          {copy.docs.claudeCodeConnector}
        </Link>
        .
      </Prose>
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

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-(family-name:--font-mono) text-[13px] whitespace-nowrap">
      {children}
    </code>
  )
}
