import * as React from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import type { Tone } from './Display'
import { ProgressRing } from './Feedback'

/* ===========================================================================
   CARD
   A card groups content that belongs together AND can be acted on as a unit.
   If neither is true, you want a section with a heading, not a card.
   ======================================================================== */

export type CardElevation = 0 | 1 | 2 | 3
export type CardVariant = 'outlined' | 'filled' | 'elevated'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  elevation?: CardElevation
  /** Adds hover lift + pointer. Requires the whole card to be a single target. */
  interactive?: boolean
  selected?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: React.ElementType
}

const cardPad = { none: '', sm: 'p-3.5', md: 'p-5', lg: 'p-6' }
const elev = ['shadow-e0', 'shadow-e1', 'shadow-e2', 'shadow-e3'] as const

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'outlined',
    elevation = 0,
    interactive,
    selected,
    padding = 'md',
    className,
    as,
    children,
    ...rest
  },
  ref,
) {
  const Comp = (as ?? 'div') as React.ElementType
  return (
    <Comp
      ref={ref}
      data-selected={selected || undefined}
      className={cn(
        'relative rounded-[var(--radius-xl)] transition-all duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)]',
        variant === 'outlined' &&
          'border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        variant === 'filled' && 'bg-[var(--ds-surface-inset)]',
        variant === 'elevated' &&
          'border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)]',
        elev[elevation],
        interactive &&
          'cursor-pointer hover:-translate-y-px hover:border-[var(--ds-border)] hover:shadow-e3 active:translate-y-0 active:shadow-e1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        selected && 'border-[var(--ds-accent)] shadow-[0_0_0_1px_var(--ds-accent)]',
        cardPad[padding],
        className,
      )}
      {...inspect(`Card · ${variant}`, {
        tokens: ['--ds-surface', '--ds-border-subtle', '--radius-xl', '--shadow-e1'],
        why: '20px padding with a 16px outer radius: the inner content radius should be outer minus padding, so anything rounded inside the card is capped at ~8px or the corners look pinched. In dark UI the card is lighter than the canvas — that is the elevation, the shadow only reinforces it.',
        a11y: 'An interactive card must be a single <a> or <button>, or expose one clear primary link. Nested interactive elements inside a clickable card create an unreachable keyboard trap.',
      })}
      {...rest}
    >
      {children}
    </Comp>
  )
})

export function CardHeader({
  title,
  description,
  actions,
  icon,
  className,
  divided,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  divided?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4',
        divided && 'border-b border-[var(--ds-border-subtle)] pb-4 mb-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-h4 text-[var(--ds-fg)]">{title}</h3>
          {description && (
            <p className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  divided = true,
}: {
  children: React.ReactNode
  className?: string
  divided?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2',
        divided && 'mt-5 border-t border-[var(--ds-border-subtle)] pt-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ===========================================================================
   PANEL — a card without the card. Section container for dense layouts.
   ======================================================================== */

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  footer,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  footer?: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-4 border-b border-[var(--ds-border-subtle)] px-5 py-3.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title && <h3 className="text-label text-[var(--ds-fg)]">{title}</h3>}
            {description && (
              <p className="text-caption text-[var(--ds-fg-muted)]">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
      {footer && (
        <footer className="border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  )
}

/* ===========================================================================
   STAT — the dashboard atom
   ======================================================================== */

/** Tone drives the leading chip only — fill plus the icon colour certified against it. */
const statChip: Record<Tone, string> = {
  neutral: 'bg-[var(--ds-layer-active)] text-[var(--ds-fg-secondary)]',
  accent: 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
  success: 'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]',
  warning: 'bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)]',
  danger: 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
  info: 'bg-[var(--ds-info-subtle)] text-[var(--ds-info-text)]',
}

export function Stat({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  spark,
  layout = 'stacked',
  tone = 'neutral',
  progress,
  className,
}: {
  label: string
  value: React.ReactNode
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  spark?: number[]
  /**
   * `stacked` leads with the number — a measurement you are tracking over time.
   * `leading` puts the icon in a tinted chip at the front and drops the value to
   * 16px, so the value can be a word ("Complete") rather than a figure.
   */
  layout?: 'stacked' | 'leading'
  /** Colours the leading chip. The stacked layout has no chip and ignores it. */
  tone?: Tone
  /** Renders a ring in the chip in place of the icon. `leading` only. */
  progress?: number
  className?: string
}) {
  const up = (delta ?? 0) >= 0

  const deltaEl = delta !== undefined && (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-caption font-medium tabular-nums',
        up ? 'text-[var(--ds-success-text)]' : 'text-[var(--ds-danger-text)]',
      )}
    >
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {up ? '+' : ''}
      {delta}%<span className="sr-only-ds">{up ? ' increase' : ' decrease'}</span>
    </span>
  )

  if (layout === 'leading') {
    const hasChip = icon !== undefined || progress !== undefined
    return (
      <div
        className={cn(
          'flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4',
          className,
        )}
        {...inspect('Stat', {
          tokens: [
            '--text-overline',
            '--text-h4',
            tone === 'neutral' ? '--ds-layer-active' : `--ds-${tone}-subtle`,
            '--ds-fg-muted',
          ],
          why: 'The chip carries the tone, which frees the value to be a plain word rather than a figure. The label sits at 11px overline above a 16px value — a quarter of the stacked layout’s emphasis, because this tile reports a fact you read once, not a number you watch.',
          a11y: 'The chip icon is decorative and hidden: the label names the field and the value states it, so the tone is never the only thing carrying the meaning.',
        })}
      >
        {hasChip && (
          <span
            aria-hidden={progress === undefined || undefined}
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-full',
              statChip[tone],
            )}
          >
            {progress !== undefined ? (
              <ProgressRing value={progress} size={28} thickness={3} tone={tone} />
            ) : (
              icon
            )}
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{label}</span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span data-tabular className="text-h4 tabular-nums text-[var(--ds-fg)] [overflow-wrap:anywhere]">
              {value}
            </span>
            {deltaEl}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4',
        className,
      )}
      {...inspect('Stat', {
        tokens: ['--text-h2', '--ds-fg', '--ds-fg-muted', '--ds-success-text'],
        why: 'The number is the largest thing in the tile and the label is the smallest — the eye should land on the value first and only then find out what it measures. Tabular figures stop the digits shifting as the value updates.',
        a11y: 'The delta arrow is paired with a sign and a word, never colour alone. Screen readers get “up 12.4 percent versus last week”, not “green”.',
      })}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-caption uppercase tracking-wider text-[var(--ds-fg-muted)]">
          {label}
        </span>
        {icon && <span className="text-[var(--ds-fg-muted)]">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span data-tabular className="text-h2 tabular-nums text-[var(--ds-fg)]">
          {value}
        </span>
        {deltaEl}
      </div>
      {spark && <Sparkline data={spark} up={up} />}
      {deltaLabel && <span className="text-caption text-[var(--ds-fg-muted)]">{deltaLabel}</span>}
    </div>
  )
}

export function Sparkline({
  data,
  up = true,
  height = 32,
}: {
  data: number[]
  up?: boolean
  height?: number
}) {
  const w = 100
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = height - ((d - min) / span) * (height - 4) - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const stroke = up ? 'var(--ds-success)' : 'var(--ds-danger)'
  const id = React.useId()
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${pts.join(' ')} ${w},${height}`} fill={`url(#${id})`} />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ===========================================================================
   CALLOUT — inline editorial emphasis inside documentation
   ======================================================================== */

export function Callout({
  icon,
  title,
  children,
  tone = 'accent',
  className,
}: {
  icon?: React.ReactNode
  title?: string
  children: React.ReactNode
  tone?: 'accent' | 'neutral' | 'warning' | 'danger' | 'success'
  className?: string
}) {
  const skin = {
    accent: 'border-l-[var(--ds-accent)] bg-[var(--ds-accent-subtle)]',
    neutral: 'border-l-[var(--ds-border-strong)] bg-[var(--ds-surface-inset)]',
    warning: 'border-l-[var(--ds-warning)] bg-[var(--ds-warning-subtle)]',
    danger: 'border-l-[var(--ds-danger)] bg-[var(--ds-danger-subtle)]',
    success: 'border-l-[var(--ds-success)] bg-[var(--ds-success-subtle)]',
  }[tone]
  return (
    <aside
      className={cn(
        'flex gap-3 rounded-r-[var(--radius-md)] border-l-2 py-3 pl-4 pr-4',
        skin,
        className,
      )}
    >
      {icon && <span className="mt-0.5 shrink-0 text-[var(--ds-fg-secondary)]">{icon}</span>}
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="text-label text-[var(--ds-fg)]">{title}</p>}
        <div className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">{children}</div>
      </div>
    </aside>
  )
}
