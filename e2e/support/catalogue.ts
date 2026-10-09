import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/*
 * THE CATALOGUES, READ FROM DISK (MOTIR-7968) — so every string a spec
 * expects comes from `messages/<locale>.json` and none is typed into the spec.
 * A translation that changes moves the expectation with it.
 */

type Node = string | number | boolean | null | Node[] | { [key: string]: Node }

const cache = new Map<string, Node>()

/** The whole catalogue of one locale. */
export function catalogue(locale: string): Node {
  let found = cache.get(locale)
  if (found === undefined) {
    found = JSON.parse(
      readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8'),
    ) as Node
    cache.set(locale, found)
  }
  return found
}

/** One string by its dotted key path; throws if it is not a string. */
export function t(locale: string, keyPath: string): string {
  const value = keyPath
    .split('.')
    .reduce<Node | undefined>(
      (node, part) =>
        node && typeof node === 'object'
          ? (node as Record<string, Node>)[part]
          : undefined,
      catalogue(locale),
    )
  if (typeof value !== 'string')
    throw new Error(`messages/${locale}.json has no string at ${keyPath}`)
  return value
}

/** Every string leaf, by dotted key path (array cells by their index). */
export function leaves(locale: string): Map<string, string> {
  const out = new Map<string, string>()
  const walk = (node: Node, prefix: string) => {
    if (typeof node === 'string') out.set(prefix, node)
    else if (node && typeof node === 'object')
      for (const [key, child] of Object.entries(node))
        walk(child, prefix ? `${prefix}.${key}` : key)
  }
  walk(catalogue(locale), '')
  return out
}
