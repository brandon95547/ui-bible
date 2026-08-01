import type { ReactNode } from 'react'
import type { Lang } from './highlight'

/* ===========================================================================
   THE PAGE CONTRACT
   Every page in this Bible is the same ten sections in the same order. That
   is not a stylistic choice — it is what makes the reference usable. Once a
   developer learns where "when not to use" lives, they know it for all 60
   pages, and looking something up stops costing attention.

   A section is omitted only when it is genuinely inapplicable (a colour ramp
   has no "recommended sizes"). Never omit one because it was hard to write.
   ======================================================================== */

export interface DocMeta {
  id: string
  title: string
  /**
   * @deprecated The breadcrumb is derived from `nav.ts`, which is the single
   * source of truth for where a page lives. Kept only so existing pages keep
   * compiling; it is used solely as a fallback for a page missing from NAV.
   */
  group?: string
  /** One line, shown under the title and in search results. */
  tagline: string
  status?: 'stable' | 'beta' | 'draft' | 'deprecated'
  /** Extra terms the search should match on. */
  keywords?: string[]
  /** Sidebar sub-entries that jump to an anchor inside this page. */
  jumps?: { id: string; label: string }[]
}

/* -- 1. Overview ---------------------------------------------------------- */
export interface Overview {
  purpose: string
  whenToUse: string[]
  whenNotToUse: { text: string; instead?: string; to?: string }[]
  /** The UX argument. Why this component exists at all. */
  reasoning: ReactNode
}

/* -- 2. Live preview ------------------------------------------------------ */
export interface PreviewSpec {
  /** The interactive playground. Real controls, real state. */
  render: ReactNode
  /** Named example blocks shown under the playground. */
  examples?: { id: string; title: string; description?: string; render: ReactNode }[]
  /** The interaction-state matrix. Each cell shows one state, rendered live. */
  states?: { label: string; note?: string; render: ReactNode }[]
}

/* -- 3. Anatomy ----------------------------------------------------------- */
export interface AnatomyPart {
  n: number
  label: string
  value?: string
  note: string
  /** Which measurement family this part belongs to. Colours the marker. */
  kind?: 'space' | 'size' | 'color' | 'type' | 'shape' | 'motion'
}
export interface AnatomySpec {
  render: ReactNode
  parts: AnatomyPart[]
  caption?: string
}

/* -- 4. Design tokens ----------------------------------------------------- */
export type TokenCategory = 'color' | 'spacing' | 'radius' | 'shadow' | 'typography' | 'motion'
export interface TokenUse {
  category: TokenCategory
  token: string
  value?: string
  usedFor: string
  /**
   * Optional sub-heading within the category — "Surfaces", "Interaction layers",
   * "Foreground". Long colour lists are unreadable as one flat table; short ones
   * are fine, so this is opt-in and pages that omit it render unchanged.
   */
  group?: string
}

/* -- 5. Recommended sizes ------------------------------------------------- */
export interface SizeRow {
  name: string
  height?: string
  padding?: string
  radius?: string
  icon?: string
  gap?: string
  type?: string
  minWidth?: string
  maxWidth?: string
  touch?: string
  use: string
}

/* -- 6 & 7. Do / Don't ---------------------------------------------------- */
export interface Guidance {
  title: string
  why: string
  render?: ReactNode
}

/* -- 8. Accessibility ----------------------------------------------------- */
export interface A11ySpec {
  contrast: string[]
  keyboard: { keys: string; does: string }[]
  aria: { attr: string; on: string; note: string }[]
  focus: string
  screenReader: string[]
  touch: string
  /** WCAG success criteria this component is responsible for. */
  criteria?: { id: string; name: string; level: 'A' | 'AA' | 'AAA' }[]
}

/* -- 9. Code -------------------------------------------------------------- */
export interface ApiProp {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}
export interface CodeSpec {
  usage?: { lang: Lang; code: string; caption?: string }
  html?: { lang: Lang; code: string; caption?: string }
  css?: { lang: Lang; code: string; caption?: string }
  api?: { name: string; props: ApiProp[] }[]
}

/* -- 10. Notes ------------------------------------------------------------ */
export interface NotesSpec {
  tips?: string[]
  performance?: string[]
  mistakes?: string[]
  realWorld?: string[]
}

export interface DocSpec {
  meta: DocMeta
  overview: Overview
  preview?: PreviewSpec
  anatomy?: AnatomySpec
  /**
   * Renders the complete theme palette — every primitive ramp and every
   * semantic token — above the page's own token table. Opt-in: it belongs on
   * the foundation pages that own the palette, not on every component page.
   */
  palette?: boolean
  tokens?: TokenUse[]
  sizes?: SizeRow[]
  do?: Guidance[]
  dont?: Guidance[]
  a11y?: A11ySpec
  code?: CodeSpec
  notes?: NotesSpec
  /** Free-form sections appended after Notes. Used by Foundations pages. */
  appendix?: { id: string; title: string; description?: string; render: ReactNode }[]
}

export function defineDoc(spec: DocSpec): DocSpec {
  return spec
}
