import { Children, cloneElement, isValidElement, type ReactNode } from 'react'

/*
 * Resolve the async Server Components inside an element tree, so a page that
 * returns `<DocsDocument …/>` (an async component RTL cannot render) can be
 * rendered with `render(await resolveAsync(await Page(props)))`.
 */
export async function resolveAsync(node: ReactNode): Promise<ReactNode> {
  if (Array.isArray(node)) {
    return Promise.all(node.map((child) => resolveAsync(child)))
  }
  if (!isValidElement(node)) return node
  const element = node as React.ReactElement<{ children?: ReactNode }>
  if (typeof element.type === 'function') {
    const out = (element.type as (props: unknown) => unknown)(element.props)
    if (out instanceof Promise) return resolveAsync((await out) as ReactNode)
    return element
  }
  const children = element.props.children
  if (children === undefined) return element
  const resolved = await Promise.all(
    Children.toArray(children).map((child) => resolveAsync(child)),
  )
  return cloneElement(element, undefined, ...resolved)
}
