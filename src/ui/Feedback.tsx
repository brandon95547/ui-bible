import * as React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import type { Tone } from './Display'

/* ===========================================================================
   ALERT — persistent, in-flow, contextual. Does not auto-dismiss.
   ======================================================================== */

const alertIcon: Record<Tone, LucideIcon> = {
  neutral: Info,
  accent: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
}

const alertSkin: Record<Tone, { bg: string; border: string; icon: string; title: string }> = {
  neutral: {
    bg: 'bg-[var(--ds-surface-raised)]',
    border: 'border-[var(--ds-border)]',
    icon: 'text-[var(--ds-fg-muted)]',
    title: 'text-[var(--ds-fg)]',
  },
  accent: {
    bg: 'bg-[var(--ds-accent-subtle)]',
    border: 'border-[var(--ds-accent-border)]',
    icon: 'text-[var(--ds-accent-text)]',
    title: 'text-[var(--ds-fg)]',
  },
  info: {
    bg: 'bg-[var(--ds-info-subtle)]',
    border: 'border-[var(--ds-info-border)]',
    icon: 'text-[var(--ds-info-text)]',
    title: 'text-[var(--ds-fg)]',
  },
  success: {
    bg: 'bg-[var(--ds-success-subtle)]',
    border: 'border-[var(--ds-success-border)]',
    icon: 'text-[var(--ds-success-text)]',
    title: 'text-[var(--ds-fg)]',
  },
  warning: {
    bg: 'bg-[var(--ds-warning-subtle)]',
    border: 'border-[var(--ds-warning-border)]',
    icon: 'text-[var(--ds-warning-text)]',
    title: 'text-[var(--ds-fg)]',
  },
  danger: {
    bg: 'bg-[var(--ds-danger-subtle)]',
    border: 'border-[var(--ds-danger-border)]',
    icon: 'text-[var(--ds-danger-text)]',
    title: 'text-[var(--ds-fg)]',
  },
}

export interface AlertProps {
  tone?: Tone
  title?: React.ReactNode
  children?: React.ReactNode
  /** Up to two. More than two and it is a dialog, not an alert. */
  actions?: React.ReactNode
  onDismiss?: () => void
  icon?: React.ReactNode
  /** Removes the tinted fill; keeps the border. For dense pages. */
  quiet?: boolean
  className?: string
}

export function Alert({
  tone = 'info',
  title,
  children,
  actions,
  onDismiss,
  icon,
  quiet,
  className,
}: AlertProps) {
  const Icon = alertIcon[tone]
  const skin = alertSkin[tone]
  const assertive = tone === 'danger'

  return (
    <div
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      className={cn(
        'flex gap-3 rounded-[var(--radius-lg)] border p-3.5',
        quiet ? 'bg-[var(--ds-surface)]' : skin.bg,
        skin.border,
        className,
      )}
      {...inspect(`Alert · ${tone}`, {
        tokens: [`--ds-${tone}-subtle`, `--ds-${tone}-border`, '--radius-lg', '--text-body-sm'],
        why: 'Icon, title and body share one 12px gutter so the text block has a single left edge. The fill is a 14%-alpha tint, not a solid — a solid status colour behind body text never reaches 4.5:1 in both themes.',
        a11y: 'Danger uses role="alert" (interrupts); everything else uses role="status" (waits for a pause). Getting this backwards makes screen readers talk over the user.',
      })}
    >
      <span className={cn('mt-0.5 shrink-0', skin.icon)} aria-hidden>
        {icon ?? <Icon size={17} strokeWidth={2} />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {title && <p className={cn('text-label', skin.title)}>{title}</p>}
        {children && (
          <div className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
            {children}
          </div>
        )}
        {actions && <div className="mt-1.5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

/* ===========================================================================
   TOAST — transient, out-of-flow, system-initiated.
   ======================================================================== */

export interface ToastItem {
  id: string
  tone?: Tone
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
  /** A toast the user must dismiss. Use for anything they may need to copy. */
  persistent?: boolean
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
  items: ToastItem[]
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

let toastSeq = 0

export function ToastProvider({
  children,
  position = 'bottom-right',
  max = 4,
}: {
  children: React.ReactNode
  position?: 'bottom-right' | 'bottom-center' | 'top-right' | 'top-center'
  max?: number
}) {
  const [items, setItems] = React.useState<ToastItem[]>([])
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = React.useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
  }, [])

  const toast = React.useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = `toast-${++toastSeq}`
      setItems((prev) => [...prev.slice(-(max - 1)), { ...t, id }])
      if (!t.persistent) {
        // Base 4s, plus reading time at ~18 chars/second. A toast the user
        // cannot finish reading is worse than no toast.
        const chars = t.title.length + (t.description?.length ?? 0)
        const dur = t.duration ?? Math.min(9000, 4000 + (chars / 18) * 1000)
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), dur),
        )
      }
      return id
    },
    [dismiss, max],
  )

  React.useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  const pos = {
    'bottom-right': 'bottom-0 right-0 items-end',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-0 right-0 items-end',
    'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  }[position]

  return (
    <ToastContext.Provider value={{ toast, dismiss, items }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className={cn('pointer-events-none fixed z-[90] flex flex-col gap-2.5 p-5', pos)}
      >
        {items.map((t) => (
          <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = alertIcon[item.tone ?? 'neutral']
  const skin = alertSkin[item.tone ?? 'neutral']
  return (
    <div
      role={item.tone === 'danger' ? 'alert' : 'status'}
      aria-live={item.tone === 'danger' ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto flex w-[min(24rem,calc(100vw-2.5rem))] gap-3 rounded-[var(--radius-lg)]',
        'border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3.5 shadow-e4',
        'animate-[slide-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]',
      )}
      {...inspect('Toast', {
        tokens: ['--ds-surface-overlay', '--shadow-e4', '--radius-lg'],
        why: 'Bottom-right is out of the reading path and out of the way of the primary action. Duration scales with text length (4s + reading time) and caps at 9s — a fixed 3s is unreadable for anything but “Saved”.',
        a11y: 'Never put the only copy of critical information in a toast. It disappears, it is easy to miss, and a screen-reader user may be mid-sentence elsewhere.',
      })}
    >
      <span className={cn('mt-0.5 shrink-0', skin.icon)} aria-hidden>
        <Icon size={17} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-label text-[var(--ds-fg)]">{item.title}</p>
        {item.description && (
          <p className="text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick()
              onDismiss()
            }}
            className="mt-1 self-start text-label text-[var(--ds-accent-text)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
      >
        <X size={14} />
      </button>
    </div>
  )
}

/* ===========================================================================
   SNACKBAR — one line, one action, bottom-centre. The Material lineage.
   ======================================================================== */

export function Snackbar({
  message,
  action,
  onDismiss,
  className,
}: {
  message: React.ReactNode
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
  className?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex min-h-[46px] w-full max-w-[36rem] items-center gap-4 rounded-[var(--radius-md)]',
        'bg-[var(--ds-fg)] px-4 py-2.5 text-[var(--ds-fg-inverse)] shadow-e4',
        className,
      )}
      {...inspect('Snackbar', {
        tokens: ['--ds-fg (as background)', '--ds-fg-inverse', '--shadow-e4', '--radius-md'],
        why: 'Inverted surface — it is a system utterance, not part of the page, and the contrast flip says so instantly. Exactly one action, because a second one turns an announcement into a decision.',
        a11y: 'aria-live="polite" so it never interrupts. Anything undoable should offer Undo here rather than a confirmation dialog beforehand.',
      })}
    >
      <span className="flex-1 text-body-sm">{message}</span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 rounded-[var(--radius-xs)] px-1 text-label uppercase tracking-wide text-[var(--ds-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full opacity-60 transition-opacity hover:opacity-100"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

/* ===========================================================================
   PROGRESS
   ======================================================================== */

const progressTone: Record<Tone, string> = {
  neutral: 'bg-[var(--ds-fg-muted)]',
  accent: 'bg-[var(--ds-accent)]',
  success: 'bg-[var(--ds-success)]',
  warning: 'bg-[var(--ds-warning)]',
  danger: 'bg-[var(--ds-danger)]',
  info: 'bg-[var(--ds-info)]',
}

export function Progress({
  value,
  tone = 'accent',
  size = 'md',
  label,
  showValue,
  indeterminate,
  className,
}: {
  value?: number
  tone?: Tone
  size?: 'xs' | 'sm' | 'md'
  label?: string
  showValue?: boolean
  indeterminate?: boolean
  className?: string
}) {
  const h = { xs: 'h-0.5', sm: 'h-1', md: 'h-1.5' }[size]
  const pct = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-4">
          {label && <span className="text-label text-[var(--ds-fg-secondary)]">{label}</span>}
          {showValue && !indeterminate && (
            <span data-tabular className="text-caption tabular-nums text-[var(--ds-fg-muted)]">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn('w-full overflow-hidden rounded-full bg-[var(--ds-layer-active)]', h)}
        {...inspect('Progress · linear', {
          tokens: ['--ds-accent', '--ds-layer-active', '--radius-full'],
          why: 'Determinate whenever you can compute a percentage — a real number converts waiting into progress. The fill animates over 420ms so a jump from 20% to 80% reads as movement, not a teleport.',
          a11y: 'role="progressbar" with aria-valuenow. Indeterminate omits aria-valuenow entirely rather than sending 0 — 0 tells the user nothing is happening.',
        })}
      >
        {indeterminate ? (
          <div
            className={cn('h-full w-full origin-left rounded-full animate-[indeterminate_1.4s_cubic-bezier(0.2,0,0,1)_infinite]', progressTone[tone])}
          />
        ) : (
          <div
            className={cn('h-full rounded-full transition-[width] duration-[420ms] ease-[cubic-bezier(0.2,0,0,1)]', progressTone[tone])}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  )
}

export function ProgressRing({
  value,
  size = 40,
  thickness = 3,
  tone = 'accent',
  indeterminate,
  children,
}: {
  value?: number
  size?: number
  thickness?: number
  tone?: Tone
  indeterminate?: boolean
  children?: React.ReactNode
}) {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value ?? 0))
  const toneVar = {
    neutral: 'var(--ds-fg-muted)',
    accent: 'var(--ds-accent)',
    success: 'var(--ds-success)',
    warning: 'var(--ds-warning)',
    danger: 'var(--ds-danger)',
    info: 'var(--ds-info)',
  }[tone]

  if (indeterminate) {
    return (
      <Loader2
        size={size}
        strokeWidth={(thickness / size) * 24}
        className="animate-[spin_720ms_linear_infinite]"
        style={{ color: toneVar }}
        aria-label="Loading"
        role="progressbar"
      />
    )
  }

  return (
    <span className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          stroke="var(--ds-layer-active)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          stroke={toneVar}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: 'stroke-dashoffset 420ms cubic-bezier(0.2,0,0,1)' }}
        />
      </svg>
      {children && <span className="absolute text-overline tabular-nums">{children}</span>}
    </span>
  )
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-[spin_720ms_linear_infinite] text-[var(--ds-fg-muted)]', className)}
      aria-hidden
    />
  )
}

/* ===========================================================================
   SKELETON
   ======================================================================== */

export function Skeleton({
  className,
  rounded = 'md',
  animate = true,
}: {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  animate?: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'block bg-[var(--ds-layer-active)]',
        {
          sm: 'rounded-[var(--radius-xs)]',
          md: 'rounded-[var(--radius-sm)]',
          lg: 'rounded-[var(--radius-md)]',
          full: 'rounded-full',
        }[rounded],
        animate &&
          'relative overflow-hidden after:absolute after:inset-0 after:animate-[shimmer_1.6s_linear_infinite] after:bg-[linear-gradient(90deg,transparent_0%,var(--ds-layer-hover)_50%,transparent_100%)] after:bg-[length:200%_100%]',
        className,
      )}
      {...inspect('Skeleton', {
        tokens: ['--ds-layer-active', '--ds-layer-hover', '--radius-sm'],
        why: 'A skeleton must match the *shape and position* of the real content, not just occupy space — otherwise the page visibly jumps when data lands and the user loses their place. Show it only after ~200ms; below that it flashes.',
        a11y: 'aria-hidden, with a single aria-busy region wrapping the whole block. Announcing twelve grey rectangles is noise.',
      })}
    />
  )
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <span className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        // The last line is short. Real paragraphs do not end flush, and a
        // block of identical bars reads as a chart, not as text.
        <Skeleton key={i} className={cn('h-3', i === lines - 1 && 'w-[62%]')} />
      ))}
    </span>
  )
}

/* ===========================================================================
   EMPTY / ERROR STATES
   ======================================================================== */

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = 'neutral',
  compact,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  tone?: 'neutral' | 'danger'
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-3 px-6 py-10' : 'gap-4 px-8 py-16',
        className,
      )}
      {...inspect('EmptyState', {
        tokens: ['--ds-fg-muted', '--text-h3', '--text-body-sm', '--ds-surface-inset'],
        why: 'Three parts, always in this order: what is here (icon), what it means (title), what to do next (action). An empty state without an action is a dead end — the most expensive screen in a product.',
        a11y: 'The icon is decorative (aria-hidden). The heading is a real heading so screen-reader users landing here understand the region immediately.',
      })}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            'grid place-items-center rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)]',
            compact ? 'h-11 w-11' : 'h-14 w-14',
            tone === 'danger'
              ? 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]'
              : 'bg-[var(--ds-surface-inset)] text-[var(--ds-fg-muted)]',
          )}
        >
          {icon}
        </span>
      )}
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className={compact ? 'text-h4' : 'text-h3'}>{title}</h3>
        {description && (
          <p className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">{description}</p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
