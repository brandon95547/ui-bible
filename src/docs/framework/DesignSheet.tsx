import * as React from 'react'
import { cn } from '@/lib/cn'
import type { SheetColor, SheetInk, SheetLayer, SheetRung, SheetStatus } from '@/docs/data/phansora-sheet'

/* ===========================================================================
   DESIGN SHEET KIT

   The blocks a design sheet is built from: a color as a large swatch with the
   states it takes, the text inks, status pairs, the special cases, the lines
   and layers, and the elevation ladder. Every one reads the product's values
   from its data file and the page's own tokens from --ds-*, so inside a
   product's scope the chrome of the sheet is that product's chrome too.

   Nothing here knows which product it is drawing.
   ======================================================================== */

/** A product's theme, on a wrapper. Every --ds-* component inside takes it. */
export function SheetScope({
  vars,
  className,
  children,
}: {
  vars: Record<`--${string}`, string>
  className?: string
  children: React.ReactNode
}) {
  return (
    <div style={vars as React.CSSProperties} className={cn('text-[var(--ds-fg)]', className)}>
      {children}
    </div>
  )
}

/** "rgb(255 255 255 / 0.115)" reads as "#FFFFFF @ 11.5%"; a hex reads as itself. */
export function formatColor(value: string) {
  const rgb = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[/,]\s*([\d.]+))?\s*\)$/)
  if (!rgb) return value.toUpperCase()
  const hex = '#' + rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
  const alpha = rgb[4] === undefined ? 1 : Number(rgb[4])
  return alpha < 1 ? `${hex} @ ${Math.round(alpha * 1000) / 10}%` : hex
}

const mono = 'font-mono text-caption'

/* -- Colors ------------------------------------------------------------- */

/** One named color: the fill with its ink on it, what it is called and for, and its states. */
export function ColorCard({ color }: { color: SheetColor }) {
  return (
    <figure className="m-0 flex flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
      <div
        className="flex h-32 items-end px-4 py-3.5 text-[1.75rem] font-medium leading-none"
        style={{ backgroundColor: color.value, color: color.ink }}
      >
        Aa
      </div>
      <figcaption className="flex flex-col gap-0.5 px-4 pb-1.5 pt-3.5">
        <span className="text-h4 text-[var(--ds-fg)]">{color.name}</span>
        <span className={cn(mono, 'text-[var(--ds-fg-secondary)]')}>{formatColor(color.value)}</span>
        <code className={cn(mono, 'text-[var(--ds-fg-muted)]')}>{color.token}</code>
        <span className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">{color.use}</span>
      </figcaption>
      <div className="grid auto-cols-fr grid-flow-col gap-2 px-4 pb-4 pt-2.5">
        {color.states.map((s) => (
          <span key={s.label} className="flex min-w-0 flex-col gap-1">
            <span
              className="h-7 rounded-[var(--radius-md)] border border-[var(--ds-border)]"
              style={{ backgroundColor: s.value }}
            />
            <span className="text-caption font-medium text-[var(--ds-fg-secondary)]">{s.label}</span>
            <span className="font-mono text-[11px] text-[var(--ds-fg-muted)]">{formatColor(s.value)}</span>
          </span>
        ))}
      </div>
    </figure>
  )
}

/** The text steps, each written in itself on the card ground it is read on. */
export function InkStrip({ inks }: { inks: SheetInk[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-border)] sm:grid-cols-4">
      {inks.map((ink) => (
        <div key={ink.name} className="flex flex-col gap-1 bg-[var(--ds-surface)] px-4 py-4.5">
          <span className="text-[2rem] font-medium leading-tight" style={{ color: ink.value }}>
            Aa
          </span>
          <span className="text-body-sm" style={{ color: ink.value }}>
            {ink.sample}
          </span>
          <span className="text-caption font-medium text-[var(--ds-fg-secondary)]">
            {ink.name} · {ink.token}
          </span>
          <span className={cn(mono, 'text-[var(--ds-fg-muted)]')}>{formatColor(ink.value)}</span>
        </div>
      ))}
    </div>
  )
}

/** A status: its ink beside the fill it pairs with. */
export function StatusPair({ status }: { status: SheetStatus }) {
  const values = status.text === status.fill ? [status.text] : [status.text, status.fill]
  return (
    <figure className="m-0 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
      <div className="grid h-[72px] grid-cols-2">
        <span className="flex items-center px-3.5 text-label" style={{ color: status.text }}>
          {status.sample}
        </span>
        <span
          className="flex items-center px-3.5 text-label-sm text-[var(--ds-fg-inverse)]"
          style={{ backgroundColor: status.fill }}
        >
          Fill
        </span>
      </div>
      <figcaption className="flex flex-col gap-0.5 border-t border-[var(--ds-border)] px-3.5 pb-3.5 pt-3">
        <span className="text-h4 text-[var(--ds-fg)]">{status.name}</span>
        <span className={cn(mono, 'text-[var(--ds-fg-secondary)]')}>{values.map(formatColor).join(' · ')}</span>
        <code className={cn(mono, 'text-[var(--ds-fg-muted)]')}>{status.token}</code>
      </figcaption>
    </figure>
  )
}

/** One edge or color that means something on its own, drawn live on the page ground. */
export function SpecialCard({
  name,
  token,
  use,
  children,
}: {
  name: string
  token: string
  use: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-rows-[auto_1fr] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
      <div className="grid min-h-[150px] place-items-center bg-[var(--ds-canvas)] px-5 pb-5 pt-7">{children}</div>
      <div className="flex flex-col gap-0.5 border-t border-[var(--ds-border)] px-4 pb-4 pt-3">
        <span className="text-h4 text-[var(--ds-fg)]">{name}</span>
        <code className={cn(mono, 'text-[var(--ds-fg-muted)]')}>{token}</code>
        <span className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">{use}</span>
      </div>
    </div>
  )
}

/** Lines as edges and layers as fills, each over a level-1 card so an alpha reads as it does in use. */
export function LayerChips({ layers }: { layers: SheetLayer[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,170px),1fr))] gap-3">
      {layers.map((l) => (
        <div key={l.name} className="flex flex-col gap-1">
          <div
            className={cn('h-[72px] rounded-[var(--radius-xl)] bg-[var(--ds-surface)]', l.kind === 'line' && 'border-2')}
            style={l.kind === 'line' ? { borderColor: l.value } : undefined}
          >
            {l.kind === 'layer' && <div className="h-full rounded-[var(--radius-xl)]" style={{ backgroundColor: l.value }} />}
          </div>
          <span className="text-caption font-medium text-[var(--ds-fg-secondary)]">{l.name}</span>
          <code className={cn(mono, 'text-[var(--ds-fg-muted)]')}>
            {l.token} · {formatColor(l.value)}
          </code>
        </div>
      ))}
    </div>
  )
}

/* -- Surfaces ----------------------------------------------------------- */

const rungHeight = ['md:min-h-[112px]', 'md:min-h-[148px]', 'md:min-h-[184px]', 'md:min-h-[220px]', 'md:min-h-[256px]']

/** Dark to light, left to right, each rung standing a little taller than the last. */
export function ElevationLadder({ rungs }: { rungs: SheetRung[] }) {
  return (
    <div className="grid items-end gap-2 md:grid-cols-5">
      {rungs.map((r) => (
        <div
          key={r.level}
          className={cn(
            'flex min-h-[112px] flex-col justify-end gap-0.5 rounded-[var(--radius-2xl)] border border-[var(--ds-border)] px-4 py-3.5',
            rungHeight[r.level],
          )}
          style={{ backgroundColor: r.value }}
        >
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Level {r.level}</span>
          <span className="text-h4 text-[var(--ds-fg)]">{r.name}</span>
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">{r.use}</span>
          <code className={cn(mono, 'text-[var(--ds-fg-muted)]')}>
            {r.token} · {formatColor(r.value)}
          </code>
        </div>
      ))}
    </div>
  )
}

/* -- Demos -------------------------------------------------------------- */

/** A component with the role it plays above it and the class it ships as below. */
export function Demo({
  role,
  meta,
  fill,
  className,
  children,
}: {
  role?: string
  meta?: React.ReactNode
  /** Stretch the component to the column instead of leaving it its own width. */
  fill?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2.5', fill ? 'items-stretch' : 'items-start', className)}>
      {role && <p className="text-label-sm text-[var(--ds-fg)]">{role}</p>}
      {children}
      {meta && <code className={cn(mono, 'text-[var(--ds-fg-muted)] [overflow-wrap:anywhere]')}>{meta}</code>}
    </div>
  )
}

/** A panel for demos to stand on: level 1, as a Phansora card. */
export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5', className)}>
      {children}
    </div>
  )
}

/** The scrim an overlay opens over, as a box in the page, so dialogs can sit in place side by side. */
export function Stage({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-layer-scrim)] px-4 py-10',
        className,
      )}
    >
      {children}
    </div>
  )
}
