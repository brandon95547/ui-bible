import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'

/* ===========================================================================
   BADGE — a read-only status label. Never clickable.
   ======================================================================== */

export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

const toneSubtle: Record<Tone, string> = {
  neutral:
    'bg-[var(--ds-layer-active)] text-[var(--ds-fg-secondary)] ring-[var(--ds-border)]',
  accent: 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)] ring-[var(--ds-accent-border)]',
  success:
    'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)] ring-[var(--ds-success-border)]',
  warning:
    'bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)] ring-[var(--ds-warning-border)]',
  danger: 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)] ring-[var(--ds-danger-border)]',
  info: 'bg-[var(--ds-info-subtle)] text-[var(--ds-info-text)] ring-[var(--ds-info-border)]',
}

const toneSolid: Record<Tone, string> = {
  neutral: 'bg-[var(--ds-fg-muted)] text-[var(--ds-canvas)]',
  accent: 'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)]',
  success: 'bg-[var(--ds-success)] text-[var(--ds-success-fg)]',
  warning: 'bg-[var(--ds-warning)] text-[var(--ds-warning-fg)]',
  danger: 'bg-[var(--ds-danger)] text-[var(--ds-danger-fg)]',
  info: 'bg-[var(--ds-info)] text-[var(--ds-info-fg)]',
}

const toneDot: Record<Tone, string> = {
  neutral: 'bg-[var(--ds-fg-muted)]',
  accent: 'bg-[var(--ds-accent)]',
  success: 'bg-[var(--ds-success)]',
  warning: 'bg-[var(--ds-warning)]',
  danger: 'bg-[var(--ds-danger)]',
  info: 'bg-[var(--ds-info)]',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  variant?: 'subtle' | 'solid' | 'outline'
  size?: 'sm' | 'md'
  /** A 6px status dot. Carries meaning that colour alone cannot in greyscale. */
  dot?: boolean
  icon?: React.ReactNode
}

export function Badge({
  tone = 'neutral',
  variant = 'subtle',
  size = 'md',
  dot,
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'h-[18px] px-1.5 text-overline tracking-normal' : 'h-[22px] px-2 text-caption',
        variant === 'subtle' && cn('ring-1 ring-inset', toneSubtle[tone]),
        variant === 'solid' && toneSolid[tone],
        variant === 'outline' &&
          cn('ring-1 ring-inset bg-transparent', toneSubtle[tone].replace(/bg-\[[^\]]+\]/, '')),
        className,
      )}
      {...inspect(`Badge · ${tone} · ${variant}`, {
        tokens: [`--ds-${tone === 'neutral' ? 'layer-active' : tone + '-subtle'}`, '--text-caption'],
        why: 'Fully rounded (pill) so it never competes with the 8px-radius language of interactive controls — a shape difference tells the user “this is a label, not a button” before they read a word.',
        a11y: 'Colour is never the only signal: pair a tone with a dot, an icon, or a word. 8% of men cannot separate the red and green tones.',
      })}
      {...rest}
    >
      {dot && <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', toneDot[tone])} />}
      {icon}
      {children}
    </span>
  )
}

/** A tiny count badge for nav items and tabs. Caps at 99+. */
export function CountBadge({
  count,
  max = 99,
  tone = 'accent',
  className,
}: {
  count: number
  max?: number
  tone?: Tone
  className?: string
}) {
  if (count <= 0) return null
  return (
    <span
      data-tabular
      className={cn(
        'inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-overline tabular-nums tracking-normal',
        toneSolid[tone],
        className,
      )}
      aria-label={`${count} items`}
    >
      {count > max ? `${max}+` : count}
    </span>
  )
}

/* ===========================================================================
   CHIP — interactive. Filter, selection, or removable input token.
   ======================================================================== */

export interface ChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  selected?: boolean
  onRemove?: () => void
  icon?: React.ReactNode
  avatar?: React.ReactNode
  size?: 'sm' | 'md'
  disabled?: boolean
  as?: 'button' | 'span'
  tone?: Tone
}

export function Chip({
  selected,
  onRemove,
  icon,
  avatar,
  size = 'md',
  disabled,
  as = 'button',
  tone = 'neutral',
  className,
  children,
  ...rest
}: ChipProps) {
  const Comp = (as === 'button' ? 'button' : 'span') as React.ElementType
  return (
    <Comp
      {...(as === 'button' ? { type: 'button', 'aria-pressed': selected, disabled } : {})}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full border font-medium',
        'transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        size === 'sm' ? 'h-6 pl-2 pr-2 text-caption' : 'h-7 pl-2.5 pr-2.5 text-label',
        (icon || avatar) && (size === 'sm' ? 'pl-1.5' : 'pl-1.5'),
        onRemove && (size === 'sm' ? 'pr-1' : 'pr-1'),
        selected
          ? 'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
          : cn(
              'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-secondary)]',
              as === 'button' &&
                !disabled &&
                'hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
            ),
        tone !== 'neutral' && !selected && toneSubtle[tone],
        disabled && 'pointer-events-none opacity-45',
        className,
      )}
      {...inspect(`Chip · ${size}`, {
        tokens: ['--radius-full', '--ds-accent-subtle', '--ds-border'],
        why: 'A chip is 28px tall — under a button (36px) because it is a secondary, high-density control, but still above the 24px floor where a pill starts to read as a static badge.',
        a11y: 'Filter chips use aria-pressed, not aria-selected — they toggle independently. The remove button is a separate focusable element with its own accessible name.',
      })}
      {...rest}
    >
      {avatar}
      {icon && (
        <span aria-hidden style={{ lineHeight: 0 }} className="shrink-0">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Remove ${typeof children === 'string' ? children : 'item'}`}
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }
          }}
          className="grid h-[18px] w-[18px] shrink-0 cursor-pointer place-items-center rounded-full text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-active)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <X size={11} strokeWidth={2.5} />
        </span>
      )}
    </Comp>
  )
}

/* ===========================================================================
   AVATAR
   ======================================================================== */

const avatarSizes = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-[11px]',
  lg: 'h-10 w-10 text-[13px]',
  xl: 'h-14 w-14 text-[18px]',
} as const

export function Avatar({
  name,
  src,
  size = 'md',
  status,
  square,
  className,
}: {
  name: string
  src?: string
  size?: keyof typeof avatarSizes
  status?: 'online' | 'away' | 'busy' | 'offline'
  square?: boolean
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  // Deterministic hue from the name — same person, same colour, every time.
  const hue = React.useMemo(() => {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 8
    return h + 1
  }, [name])

  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      <span
        className={cn(
          'inline-grid place-items-center overflow-hidden font-semibold uppercase tracking-wide',
          'ring-1 ring-inset ring-[var(--ds-border-subtle)]',
          square ? 'rounded-[var(--radius-md)]' : 'rounded-full',
          avatarSizes[size],
        )}
        style={
          src
            ? undefined
            : {
                background: `color-mix(in oklab, var(--p-viz-${hue}) 22%, var(--ds-surface))`,
                color: `var(--p-viz-${hue})`,
              }
        }
        {...inspect(`Avatar · ${size}`, {
          tokens: ['--p-viz-1…8', '--radius-full', '--ds-border-subtle'],
          why: 'Initials are tinted from a deterministic hash of the name, so the same person is always the same colour and users start recognising them by shape before reading. A 1px inset ring keeps a light photo from bleeding into a light surface.',
          a11y: 'The image carries alt=""; the accessible name comes from the surrounding link or the adjacent text. An avatar alone is decorative.',
        })}
      >
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          initials
        )}
      </span>
      {status && (
        <span
          aria-label={status}
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[var(--ds-surface)]',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            status === 'online' && 'bg-[var(--ds-success)]',
            status === 'away' && 'bg-[var(--ds-warning)]',
            status === 'busy' && 'bg-[var(--ds-danger)]',
            status === 'offline' && 'bg-[var(--ds-fg-disabled)]',
          )}
        />
      )}
    </span>
  )
}

export function AvatarStack({
  people,
  max = 4,
  size = 'sm',
}: {
  people: { name: string; src?: string }[]
  max?: number
  size?: keyof typeof avatarSizes
}) {
  const shown = people.slice(0, max)
  const rest = people.length - shown.length
  return (
    <span className="flex items-center">
      {shown.map((p) => (
        <span key={p.name} className="-ml-1.5 first:ml-0 ring-2 ring-[var(--ds-surface)] rounded-full">
          <Avatar {...p} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className={cn(
            '-ml-1.5 inline-grid place-items-center rounded-full bg-[var(--ds-layer-active)] font-semibold text-[var(--ds-fg-secondary)] ring-2 ring-[var(--ds-surface)]',
            avatarSizes[size],
          )}
        >
          +{rest}
        </span>
      )}
    </span>
  )
}

/* ===========================================================================
   KBD
   ======================================================================== */

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-grid h-[19px] min-w-[19px] place-items-center rounded-[5px] px-1.5',
        'border border-b-2 border-[var(--ds-border)] bg-[var(--ds-surface-raised)]',
        'font-sans text-[11px] font-medium leading-none text-[var(--ds-fg-secondary)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

/* ===========================================================================
   DIVIDER
   ======================================================================== */

export function Divider({
  label,
  orientation = 'horizontal',
  className,
}: {
  label?: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}) {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn('inline-block w-px self-stretch bg-[var(--ds-border-subtle)]', className)}
      />
    )
  }
  if (!label) {
    return (
      <hr
        className={cn('h-px w-full border-0 bg-[var(--ds-border-subtle)]', className)}
        {...inspect('Divider', {
          tokens: ['--ds-border-subtle'],
          why: 'A divider at 6% opacity is enough to separate without becoming a visual element in its own right. If you need a stronger line, you probably need more whitespace instead.',
          a11y: 'Decorative dividers should be <hr> or role="separator" — never an empty div, which is invisible to structure navigation.',
        })}
      />
    )
  }
  return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-[var(--ds-border-subtle)]" />
      <span className="text-caption uppercase tracking-wider text-[var(--ds-fg-muted)]">
        {label}
      </span>
      <span className="h-px flex-1 bg-[var(--ds-border-subtle)]" />
    </div>
  )
}

/* ===========================================================================
   TOOLTIP
   Supplementary only. If the user *needs* the text to act, it does not belong
   in a tooltip — it belongs on the screen.
   ======================================================================== */

export function Tooltip({
  content,
  children,
  side = 'top',
  shortcut,
  delay = 400,
}: {
  content: React.ReactNode
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  shortcut?: string
  delay?: number
}) {
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = React.useId()

  const show = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const pos = {
    top: 'bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2',
    bottom: 'top-[calc(100%+7px)] left-1/2 -translate-x-1/2',
    left: 'right-[calc(100%+7px)] top-1/2 -translate-y-1/2',
    right: 'left-[calc(100%+7px)] top-1/2 -translate-y-1/2',
  }[side]

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={hide}
    >
      {React.cloneElement(children as React.ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': open ? id : undefined,
      })}
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-[80] flex items-center gap-2 whitespace-nowrap',
            'rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]',
            'px-2.5 py-1.5 text-caption text-[var(--ds-fg)] shadow-e3',
            'animate-[scale-in_120ms_cubic-bezier(0.2,0,0,1)_both]',
            pos,
          )}
          {...inspect('Tooltip', {
            tokens: ['--ds-surface-overlay', '--shadow-e3', '--radius-md', '--text-caption'],
            why: '400ms open delay stops tooltips firing while the pointer merely crosses the toolbar; 0ms close keeps them from trailing the cursor. 7px offset clears the focus ring without breaking the visual link.',
            a11y: 'Wired with aria-describedby and shown on focus as well as hover. Never put an action, a link, or the element’s only name inside one.',
          })}
        >
          {content}
          {shortcut && <Kbd className="h-4 min-w-4 text-[10px]">{shortcut}</Kbd>}
        </span>
      )}
    </span>
  )
}

/* ===========================================================================
   PROGRESS RING / METER — small inline stat visuals
   ======================================================================== */

export function Meter({
  value,
  max = 100,
  tone = 'accent',
  label,
  className,
}: {
  value: number
  max?: number
  tone?: Tone
  label?: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between">
          <span className="text-caption text-[var(--ds-fg-secondary)]">{label}</span>
          <span data-tabular className="text-caption tabular-nums text-[var(--ds-fg-muted)]">
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ds-layer-active)]"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-[420ms] ease-[cubic-bezier(0.2,0,0,1)]', toneDot[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
