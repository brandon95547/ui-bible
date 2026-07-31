import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'

/* ===========================================================================
   AUTHORING KIT
   Everything a page module needs, in one import. Pages should read like
   content, not like layout code.
   ======================================================================== */

export { defineDoc } from './types'
export type { DocSpec } from './types'
export { PreviewStage, Specimen, Knob, KnobSelect, KnobToggle } from './PreviewStage'
export { CodeBlock, Code, dedent } from './CodeBlock'
export { Section, SubHeading, Prose, Dim, TokenTable, SizeTable, PropsTable } from './blocks'

/** Horizontal row of specimens. The default arrangement for variant strips. */
export function Row({
  children,
  className,
  align = 'center',
  gap = 'md',
}: {
  children: React.ReactNode
  className?: string
  align?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  gap?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap',
        { center: 'items-center', start: 'items-start', end: 'items-end', baseline: 'items-baseline', stretch: 'items-stretch' }[align],
        { sm: 'gap-2', md: 'gap-3', lg: 'gap-5' }[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Stack({
  children,
  className,
  gap = 'md',
}: {
  children: React.ReactNode
  className?: string
  gap?: 'xs' | 'sm' | 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        { xs: 'gap-1.5', sm: 'gap-2.5', md: 'gap-4', lg: 'gap-6' }[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}

/** A labelled cell in a comparison grid. */
export function Cell({
  label,
  sub,
  children,
  className,
  tone,
}: {
  label?: string
  sub?: string
  children: React.ReactNode
  className?: string
  tone?: 'good' | 'bad'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-lg)] border p-4',
        tone === 'good'
          ? 'border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)]/40'
          : tone === 'bad'
            ? 'border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/40'
            : 'border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]',
        className,
      )}
    >
      {(label || sub) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">{label}</span>
          )}
          {sub && <span className="text-[10px] text-[var(--ds-fg-muted)]">{sub}</span>}
        </div>
      )}
      {children}
    </div>
  )
}

/** Auto-fitting grid for specimen cells. */
export function Grid({
  children,
  min = '14rem',
  className,
}: {
  children: React.ReactNode
  min?: string
  className?: string
}) {
  return (
    <div
      className={cn('grid gap-3', className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${min}, 1fr))` }}
    >
      {children}
    </div>
  )
}

/* ---- token visualisers --------------------------------------------------- */

export function Swatch({
  name,
  value,
  note,
  size = 'md',
  onCopy,
}: {
  name: string
  value: string
  note?: string
  size?: 'sm' | 'md' | 'lg'
  onCopy?: (v: string) => void
}) {
  const h = { sm: 'h-9', md: 'h-14', lg: 'h-20' }[size]
  const { copied, copy } = useCopy()
  return (
    <button
      type="button"
      // Copying is the default because a swatch that looks clickable and does
      // nothing is worse than one that is not a button at all.
      onClick={() => (onCopy ? onCopy(value) : copy(value))}
      title={`Copy ${value}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] text-left transition-colors hover:border-[var(--ds-border-strong)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
    >
      <span className={cn('block w-full', h)} style={{ background: value }} />
      <span className="flex flex-col gap-0.5 bg-[var(--ds-surface)] px-2.5 py-2">
        <span className="font-mono text-[11px] text-[var(--ds-fg)]">{name}</span>
        <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-[var(--ds-fg-muted)]">
          {copied ? (
            <>
              <Check size={10} className="text-[var(--ds-success-text)]" /> copied
            </>
          ) : (
            value
          )}
        </span>
        {note && <span className="text-[10px] text-[var(--ds-fg-muted)]">{note}</span>}
      </span>
    </button>
  )
}

/** A vertical spacing bar with its value. */
export function SpaceBar({ px, name }: { px: number; name: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 font-mono text-[11px] text-[var(--ds-fg-secondary)]">
        {name}
      </span>
      <span className="w-12 shrink-0 font-mono text-[11px] tabular-nums text-[var(--ds-fg-muted)]">
        {px}px
      </span>
      <span
        className="h-4 rounded-[3px] bg-[var(--ds-accent)]"
        style={{ width: px }}
        aria-hidden
      />
    </div>
  )
}

/** Boxed label used to annotate anatomy diagrams. */
export function Marker({
  n,
  className,
  tone = 'accent',
}: {
  n: number
  className?: string
  tone?: 'accent' | 'warning' | 'info' | 'success'
}) {
  const bg = {
    accent: 'bg-[var(--p-brand-400)]',
    warning: 'bg-[var(--p-warning-400)]',
    info: 'bg-[var(--p-info-400)]',
    success: 'bg-[var(--p-success-400)]',
  }[tone]
  return (
    <span
      aria-hidden
      className={cn(
        'grid h-[18px] w-[18px] place-items-center rounded-full text-[10px] font-bold text-[var(--ds-canvas)] shadow-e1',
        bg,
        className,
      )}
    >
      {n}
    </span>
  )
}

/** Muted body copy used inside preview surfaces to stand in for real content. */
export function Lorem({ lines = 2, className }: { lines?: number; className?: string }) {
  const text = [
    'Deployment finished in 42 seconds across three regions.',
    'Every request is retried twice before the circuit opens.',
    'Rollback is one click and takes about eight seconds.',
  ]
  return (
    <p className={cn('text-body-sm leading-relaxed text-[var(--ds-fg-muted)]', className)}>
      {text.slice(0, lines).join(' ')}
    </p>
  )
}
