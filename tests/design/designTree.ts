import { readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'

/*
 * MOTIR-4990 — the ONE walk of `design/**` this lane's specs read.
 *
 * Every guard here rules on "the design tree", and each used to decide for
 * itself what that meant. The ink guard decided it with a LITERAL list of five
 * paths, which made every new asset opt-in: an asset missing from the list was
 * never opened, and the lane read green whether it was right or wrong. A walk
 * cannot forget a file, so the population is defined here, once, and a spec
 * that needs "every mock" asks for it rather than restating it.
 */

export const ROOT = resolve(import.meta.dirname, '../..')
export const DESIGN_DIR = join(ROOT, 'design')
export const MOCK_SUFFIX = '.mock.html'

/** Every file under `dir`, as a repo-relative POSIX path, sorted. */
export function filesUnder(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) filesUnder(path, out)
    else out.push(relative(ROOT, path).split(sep).join('/'))
  }
  return out.sort()
}

/** Every file under `design/`. */
export const designTree = (): string[] => filesUnder(DESIGN_DIR)

/** Every `*.mock.html` under `design/` — the population a mock guard owes. */
export const designMocks = (): string[] =>
  designTree().filter((path) => path.endsWith(MOCK_SUFFIX))
