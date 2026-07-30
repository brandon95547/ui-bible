import * as React from 'react'
import { Loader2, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { useDismissable } from '@/lib/hooks'

/* ===========================================================================
   BUTTON
   The most-used interactive element in any product. Everything about it is a
   deliberate trade-off between visual weight and click confidence.
   ======================================================================== */

export type ButtonVariant =
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text'
  | 'elevated'
  | 'danger'
  | 'danger-outline'
  | 'success'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

const base = [
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap',
  'font-medium align-middle',
  'transition-[background-color,border-color,color,box-shadow,transform,opacity]',
  'duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
  'active:scale-[0.985]',
  'disabled:pointer-events-none disabled:opacity-45 disabled:saturate-50',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
  // Guarantees a 44px pointer target even when the button is visually 32px.
  // Coarse pointers only, so it never eats clicks on desktop.
  "after:pointer-events-none after:absolute after:left-0 after:top-1/2 after:h-11 after:w-full after:-translate-y-1/2 after:content-['']",
].join(' ')

const variants: Record<ButtonVariant, string> = {
  filled: [
    'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)] shadow-e1',
    'hover:bg-[var(--ds-accent-hover)] hover:shadow-e2',
    'active:bg-[var(--ds-accent-active)] active:shadow-e0',
  ].join(' '),
  tonal: [
    'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
    'hover:bg-[var(--ds-accent-subtle-hover)]',
    'active:bg-[var(--ds-accent-subtle-hover)] active:brightness-95',
  ].join(' '),
  outlined: [
    'border border-[var(--ds-border-interactive)] bg-transparent text-[var(--ds-fg)]',
    'hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-layer-hover)]',
    'active:bg-[var(--ds-layer-active)]',
  ].join(' '),
  text: [
    'bg-transparent text-[var(--ds-fg-secondary)]',
    'hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
    'active:bg-[var(--ds-layer-active)]',
  ].join(' '),
  elevated: [
    'bg-[var(--ds-surface-raised)] text-[var(--ds-fg)] border border-[var(--ds-border-subtle)] shadow-e2',
    'hover:shadow-e3 hover:bg-[var(--ds-surface-overlay)]',
    'active:shadow-e1',
  ].join(' '),
  danger: [
    'bg-[var(--ds-danger)] text-[var(--ds-danger-fg)] shadow-e1',
    'hover:bg-[var(--ds-danger-hover)] hover:shadow-e2',
    'active:bg-[var(--ds-danger-active)] active:shadow-e0',
  ].join(' '),
  'danger-outline': [
    'border border-[var(--ds-danger-border)] bg-transparent text-[var(--ds-danger-text)]',
    'hover:bg-[var(--ds-danger-subtle)]',
    'active:bg-[var(--ds-danger-subtle)] active:brightness-95',
  ].join(' '),
  success: [
    'bg-[var(--ds-success)] text-[var(--ds-success-fg)] shadow-e1',
    'hover:bg-[var(--ds-success-hover)] hover:shadow-e2',
    'active:shadow-e0',
  ].join(' '),
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 rounded-[var(--radius-sm)] px-2.5 text-label-sm gap-1.5',
  sm: 'h-8 rounded-[var(--radius-md)] px-3 text-label gap-1.5',
  md: 'h-9 rounded-[var(--radius-md)] px-3.5 text-label',
  lg: 'h-11 rounded-[var(--radius-lg)] px-5 text-body-lg font-medium',
}

/** Icons scale sub-linearly with the button — a 1.5× button gets a 1.2× icon. */
export const buttonIconSize: Record<ButtonSize, number> = { xs: 13, sm: 14, md: 16, lg: 18 }

/** Icon-only buttons are square: the horizontal padding becomes the vertical. */
const iconOnly: Record<ButtonSize, string> = {
  xs: 'w-7 px-0',
  sm: 'w-8 px-0',
  md: 'w-9 px-0',
  lg: 'w-11 px-0',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Replaces the label with a check for ~1.6s after a successful action. */
  success?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  fullWidth?: boolean
  /** Renders square. Requires `aria-label`. */
  iconOnly?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'filled',
    size = 'md',
    loading = false,
    success = false,
    startIcon,
    endIcon,
    fullWidth,
    iconOnly: isIconOnly,
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const px = buttonIconSize[size]
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      data-variant={variant}
      data-size={size}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        isIconOnly && iconOnly[size],
        fullWidth && 'w-full',
        className,
      )}
      {...inspect(`Button · ${variant} · ${size}`, {
        tokens:
          variant === 'filled'
            ? ['--ds-accent', '--ds-accent-fg', '--radius-md', '--shadow-e1']
            : ['--ds-border-interactive', '--ds-fg', '--radius-md'],
        why: 'Height comes from the 4px grid (36px = 9 units) so buttons align with inputs and selects on the same row. Horizontal padding is ~2× the gap between icon and label, which keeps the label optically centred.',
        a11y: 'Hit area is padded to 44×44 on coarse pointers. Focus ring is 2px at 2px offset — 3:1 against both the button and the page.',
      })}
      {...rest}
    >
      {/* Content is hidden rather than removed so the button never changes
          width when it enters the loading or success state. A button that
          resizes under the cursor is a button you mis-click. */}
      <span
        className={cn(
          'inline-flex items-center justify-center gap-[inherit]',
          (loading || success) && 'invisible',
        )}
      >
        {startIcon ? (
          <span className="shrink-0" style={{ lineHeight: 0 }} aria-hidden>
            {sizeIcon(startIcon, px)}
          </span>
        ) : null}
        {children}
        {endIcon ? (
          <span className="shrink-0" style={{ lineHeight: 0 }} aria-hidden>
            {sizeIcon(endIcon, px)}
          </span>
        ) : null}
      </span>

      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Loader2 size={px + 2} className="animate-[spin_720ms_linear_infinite]" aria-hidden />
        </span>
      )}
      {!loading && success && (
        <span className="absolute inset-0 grid place-items-center animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both]">
          <Check size={px + 2} aria-hidden />
        </span>
      )}

      {loading && <span className="sr-only-ds">Loading</span>}
      {success && <span className="sr-only-ds">Done</span>}
    </button>
  )
})

function sizeIcon(node: React.ReactNode, size: number) {
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ size?: number }>
    if (el.props.size === undefined) return React.cloneElement(el, { size })
  }
  return node
}

/* ===========================================================================
   ICON BUTTON
   ======================================================================== */

export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children'> {
  /** Required. An icon with no name is invisible to a screen reader. */
  label: string
  icon: React.ReactNode
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ label, icon, variant = 'text', size = 'md', ...rest }, ref) {
    return (
      <Button ref={ref} iconOnly variant={variant} size={size} aria-label={label} {...rest}>
        {sizeIcon(icon, buttonIconSize[size])}
      </Button>
    )
  },
)

/* ===========================================================================
   FAB — Floating Action Button
   One per screen, maximum. Two FABs means neither is *the* action.
   ======================================================================== */

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  /** Extended FABs show the label. Use when the action is not universally known. */
  extended?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'accent' | 'surface'
}

export function Fab({
  icon,
  label,
  extended,
  size = 'md',
  tone = 'accent',
  className,
  ...rest
}: FabProps) {
  const dims = {
    sm: extended ? 'h-10 px-4 gap-2' : 'h-10 w-10',
    md: extended ? 'h-14 px-5 gap-3' : 'h-14 w-14',
    lg: extended ? 'h-16 px-6 gap-3' : 'h-16 w-16',
  }[size]
  const radius = { sm: 'rounded-[var(--radius-lg)]', md: 'rounded-[var(--radius-xl)]', lg: 'rounded-[var(--radius-2xl)]' }[size]
  const iconPx = { sm: 18, md: 22, lg: 26 }[size]

  return (
    <button
      type="button"
      aria-label={extended ? undefined : label}
      className={cn(
        'inline-flex items-center justify-center font-medium shadow-e3',
        'transition-all duration-[160ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        'hover:shadow-e4 hover:-translate-y-0.5 active:translate-y-0 active:shadow-e2',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        tone === 'accent'
          ? 'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)] hover:bg-[var(--ds-accent-hover)]'
          : 'bg-[var(--ds-surface-overlay)] text-[var(--ds-fg)] border border-[var(--ds-border)]',
        dims,
        radius,
        className,
      )}
      {...inspect(`FAB · ${size}${extended ? ' · extended' : ''}`, {
        tokens: ['--ds-accent', '--shadow-e3', '--radius-xl'],
        why: '56px is the smallest square that still reads as a primary surface-level action at arm’s length, and it clears the 44px minimum with margin for thumb reach at the screen edge.',
        a11y: 'Must not overlap content at the bottom of a scroll container — pad the scroll region by the FAB height plus its margin.',
      })}
      {...rest}
    >
      <span aria-hidden style={{ lineHeight: 0 }}>
        {sizeIcon(icon, iconPx)}
      </span>
      {extended && <span className="text-label pr-0.5">{label}</span>}
    </button>
  )
}

/* ===========================================================================
   BUTTON GROUP — segmented, shared borders
   ======================================================================== */

export function ButtonGroup({
  children,
  className,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center',
        // Collapse the shared border and square off the inner corners.
        '[&>*]:rounded-none [&>*:first-child]:rounded-l-[var(--radius-md)]',
        '[&>*:last-child]:rounded-r-[var(--radius-md)]',
        '[&>*+*]:-ml-px [&>*:hover]:z-10 [&>*:focus-visible]:z-10',
        className,
      )}
      {...inspect('ButtonGroup', {
        tokens: ['--radius-md', '--ds-border-interactive'],
        why: 'Members share a single 1px border via a −1px margin, so the seam stays 1px instead of doubling to 2px. Only the outer corners are rounded.',
      })}
    >
      {children}
    </div>
  )
}

/* ===========================================================================
   SPLIT BUTTON — a default action plus its variants
   ======================================================================== */

export interface SplitButtonProps {
  label: string
  onAction?: () => void
  options: { label: string; description?: string; onSelect?: () => void; danger?: boolean }[]
  variant?: Extract<ButtonVariant, 'filled' | 'outlined' | 'elevated'>
  size?: ButtonSize
  startIcon?: React.ReactNode
  disabled?: boolean
}

export function SplitButton({
  label,
  onAction,
  options,
  variant = 'filled',
  size = 'md',
  startIcon,
  disabled,
}: SplitButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  useDismissable(open, () => setOpen(false), [wrapRef, menuRef])

  React.useEffect(() => {
    if (open) setActiveIndex(0)
  }, [open])

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % options.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      options[activeIndex]?.onSelect?.()
      setOpen(false)
    }
  }

  return (
    <div
      ref={wrapRef}
      className="relative inline-flex"
      {...inspect('SplitButton', {
        tokens: ['--ds-accent', '--radius-md', '--shadow-e4'],
        why: 'The 1px divider between the action and the disclosure must be a translucent white/black overlay, not a border colour — on a filled button a solid border reads as a crack.',
        a11y: 'The disclosure half owns aria-haspopup + aria-expanded. The primary half is a plain button so Enter always fires the default action.',
      })}
    >
      <Button
        variant={variant}
        size={size}
        startIcon={startIcon}
        onClick={onAction}
        disabled={disabled}
        className="rounded-r-none pr-3"
      >
        {label}
      </Button>
      <span
        aria-hidden
        className={cn(
          'w-px self-stretch my-1',
          variant === 'filled' ? 'bg-black/25' : 'bg-[var(--ds-border)]',
        )}
      />
      <Button
        variant={variant}
        size={size}
        iconOnly
        disabled={disabled}
        aria-label={`More ${label.toLowerCase()} options`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="rounded-l-none"
      >
        <ChevronDown
          size={buttonIconSize[size]}
          className={cn('transition-transform duration-[160ms]', open && 'rotate-180')}
        />
      </Button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKey}
          className={cn(
            'absolute right-0 top-[calc(100%+6px)] z-50 min-w-60 overflow-hidden p-1',
            'rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4',
            'animate-[scale-in_140ms_cubic-bezier(0.32,0.72,0,1)_both] origin-top-right',
          )}
        >
          {options.map((opt, i) => (
            <button
              key={opt.label}
              role="menuitem"
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => {
                opt.onSelect?.()
                setOpen(false)
              }}
              className={cn(
                'flex w-full flex-col items-start gap-0.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left',
                'transition-colors duration-75',
                i === activeIndex && 'bg-[var(--ds-layer-hover)]',
                opt.danger ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg)]',
              )}
            >
              <span className="text-label">{opt.label}</span>
              {opt.description && (
                <span className="text-caption text-[var(--ds-fg-muted)]">{opt.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
