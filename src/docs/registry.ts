import type { DocSpec } from './framework/types'

/**
 * Pages are discovered from the filesystem rather than listed by hand, so
 * adding `src/docs/pages/<id>.tsx` is the only step required to publish one.
 * `import.meta.glob` keeps them in separate chunks — the initial load ships
 * the shell, not all 45 pages.
 */
const modules = import.meta.glob<{ default: DocSpec }>('./pages/*.tsx')

export function loadPage(id: string): (() => Promise<{ default: DocSpec }>) | null {
  const key = `./pages/${id}.tsx`
  return modules[key] ?? null
}

export function hasPage(id: string) {
  return `./pages/${id}.tsx` in modules
}

export const IMPLEMENTED = new Set(
  Object.keys(modules).map((k) => k.replace('./pages/', '').replace('.tsx', '')),
)
