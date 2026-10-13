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
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'standard'
  | 'aura'
  | 'nav'
  | 'frosted-glass'
  | 'smoked-glass'
  | 'inherit'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'
export type ButtonShape = 'pill' | 'rounded' | 'rectangle'
/** A recolor of a variant, not a variant. See `tones` below. */
export type ButtonTone = 'danger'

/* A variant never styles the button. It fills in five slots, and the base class
   below is the only thing that reads them:

     --btn-bg      the fill
     --btn-text    the label and the icon
     --btn-border  the edge
     --btn-wash    what fades in over the fill on hover and press
     (blur)        a backdrop blur, on the three variants that are glass

   Which is why every variant works at every size and every shape, and why a
   state — selected, inactive, disabled, destructive — is a second recipe over
   the same slots rather than a new set of rules. */
const base = [
  'relative isolate inline-flex select-none items-center justify-center whitespace-nowrap',
  'font-medium align-middle',
  'bg-[var(--btn-bg,transparent)] text-[var(--btn-text,currentColor)]',
  // The edge is an inset ring, not a border, so a variant with an edge is the
  // same size as one without and nothing in a row shifts when one is swapped.
  'shadow-[inset_0_0_0_1px_var(--btn-border,transparent)]',
  // The hover wash. One translucent layer over whatever the fill is, so hover
  // is the same step on a clear button, a filled one and a gradient.
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-['']",
  'before:bg-[var(--btn-wash,var(--ds-layer-hover))] before:opacity-0',
  'before:transition-opacity before:duration-[120ms]',
  'enabled:hover:before:opacity-100 enabled:active:before:opacity-100',
  'transition-[background-color,color,box-shadow,transform,opacity]',
  'duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
  'active:scale-[0.985]',
  'disabled:pointer-events-none',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
  // Guarantees a 44px pointer target even when the button is visually 32px.
  // Coarse pointers only, so it never eats clicks on desktop.
  "after:pointer-events-none after:absolute after:left-0 after:top-1/2 after:h-11 after:w-full after:-translate-y-1/2 after:content-['']",
].join(' ')

/** The wash for a button whose label is its only color: a tenth of that color. */
const washOfLabel = '[--btn-wash:color-mix(in_srgb,currentColor_10%,transparent)]'

const variants: Record<ButtonVariant, string> = {
  // The one filled action. The strongest neutral on the page, so it inverts
  // with the theme instead of carrying a hue.
  primary:
    '[--btn-bg:var(--ds-btn-primary)] [--btn-text:var(--ds-btn-primary-fg)] [--btn-wash:var(--ds-btn-wash-inverse)]',
  // Outline. Clear until hovered, held by its edge.
  secondary: '[--btn-text:var(--ds-fg)] [--btn-border:var(--ds-border-interactive)]',
  // Ghost. No fill and no edge until hovered.
  tertiary: '[--btn-text:var(--ds-fg)]',
  // Quiet fill: one step up from whatever it is standing on.
  standard: '[--btn-bg:var(--ds-btn-quiet)] [--btn-text:var(--ds-fg)]',
  // The signature. The fill is an image, over its own last stop for the frame
  // before the gradient paints.
  aura: [
    '[--btn-bg:var(--ds-aura-to)] [--btn-text:var(--ds-aura-fg)] [--btn-wash:var(--ds-aura-wash)]',
    'bg-[image:var(--ds-aura)]',
  ].join(' '),
  // A navigation pill. `aria-current="page"` gives it the primary look.
  nav: ['[--btn-bg:var(--ds-fog-thin)] [--btn-text:var(--ds-fg)]', washOfLabel, 'backdrop-blur-[16px]'].join(' '),
  // Glass that lightens what is behind it. Hover thickens the glass itself, so
  // there is no wash.
  'frosted-glass': [
    '[--btn-bg:var(--ds-fog-thick)] [--btn-text:var(--ds-fg)] [--btn-border:var(--ds-border)] [--btn-wash:transparent]',
    'backdrop-blur-[16px] enabled:hover:[--btn-bg:var(--ds-fog-dense)]',
  ].join(' '),
  // Glass that darkens it, for a control standing on bright artwork.
  'smoked-glass': [
    '[--btn-bg:var(--ds-smoke-thick)] [--btn-text:var(--ds-fg)] [--btn-border:var(--ds-border)] [--btn-wash:transparent]',
    'backdrop-blur-[16px] enabled:hover:[--btn-bg:var(--ds-smoke-dense)]',
  ].join(' '),
  // Takes its color from the text around it.
  inherit: washOfLabel,
}

/* Destructive is a recolor of a variant, not a tenth and eleventh variant: the
   same slots, pointed at the danger tokens. Primary takes the fill; the two
   clear variants take the label, and the outline its edge. */
const tones: Record<ButtonTone, Partial<Record<ButtonVariant, string>>> = {
  danger: {
    primary: '[--btn-bg:var(--ds-danger)] [--btn-text:var(--ds-danger-fg)]',
    secondary:
      '[--btn-text:var(--ds-danger-text)] [--btn-border:var(--ds-danger-border)] [--btn-wash:var(--ds-danger-subtle)]',
    tertiary: '[--btn-text:var(--ds-danger-text)] [--btn-wash:var(--ds-danger-subtle)]',
  },
}

/* Inactive: present and pressable, but not the live option — the unselected
   half of a pair. Dimmed, never disabled, so the label still clears 4.5:1. */
const inactiveLooks: Partial<Record<ButtonVariant, string>> = {
  primary: '[--btn-bg:var(--ds-btn-quiet)] [--btn-text:var(--ds-fg)] [--btn-wash:var(--ds-layer-hover)]',
  tertiary: '[--btn-text:var(--ds-fg-muted)]',
  standard: '[--btn-text:var(--ds-fg-muted)]',
  inherit: 'opacity-60',
}

/* Disabled replaces the recipe instead of fading it. A filled button keeps a
   fill and a clear one keeps almost none, so a disabled control still has the
   footprint it had — it has only stopped saying anything. Glass keeps its blur,
   because what is behind it has not gone away. */
const disabledFilled = '[--btn-bg:var(--ds-btn-disabled)] [--btn-text:var(--ds-fg-disabled)]'
const disabledClear =
  '[--btn-bg:color-mix(in_srgb,var(--ds-btn-disabled)_45%,transparent)] [--btn-text:var(--ds-fg-disabled)]'
const disabledGlass = [
  '[--btn-bg:color-mix(in_srgb,var(--ds-surface-raised)_30%,transparent)]',
  '[--btn-text:color-mix(in_srgb,var(--ds-fg)_55%,transparent)] backdrop-blur-[16px]',
].join(' ')
const disabledLooks: Record<ButtonVariant, string> = {
  primary: disabledFilled,
  standard: disabledFilled,
  aura: disabledFilled,
  secondary: disabledClear,
  tertiary: disabledClear,
  inherit: disabledClear,
  nav: disabledGlass,
  'frosted-glass': disabledGlass,
  'smoked-glass': disabledGlass,
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-label-sm gap-1.5',
  sm: 'h-8 px-3 text-label gap-1.5',
  md: 'h-9 px-3.5 text-label gap-2',
  lg: 'h-11 px-5 text-body-lg font-medium gap-2',
}

/* Shape is its own axis. A pill's ends are round, so the label is given a
   little more room before it reaches the curve; the other two shapes keep the
   padding the size sets. */
const shapes: Record<ButtonShape, Record<ButtonSize, string>> = {
  pill: {
    xs: 'rounded-full px-3',
    sm: 'rounded-full px-3.5',
    md: 'rounded-full px-4',
    lg: 'rounded-full px-6',
  },
  rounded: {
    xs: 'rounded-[var(--radius-sm)]',
    sm: 'rounded-[var(--radius-md)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
  },
  rectangle: { xs: 'rounded-none', sm: 'rounded-none', md: 'rounded-none', lg: 'rounded-none' },
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

/** The tokens the Inspector names for each variant. */
const variantTokens: Record<ButtonVariant, string[]> = {
  primary: ['--ds-btn-primary', '--ds-btn-primary-fg', '--ds-btn-wash-inverse'],
  secondary: ['--ds-border-interactive', '--ds-fg', '--ds-layer-hover'],
  tertiary: ['--ds-fg', '--ds-layer-hover'],
  standard: ['--ds-btn-quiet', '--ds-fg', '--ds-layer-hover'],
  aura: ['--ds-aura', '--ds-aura-fg'],
  nav: ['--ds-fog-thin', '--ds-fg', '--ds-btn-primary'],
  'frosted-glass': ['--ds-fog-thick', '--ds-fog-dense', '--ds-border'],
  'smoked-glass': ['--ds-smoke-thick', '--ds-smoke-dense', '--ds-border'],
  inherit: [],
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  /** Recolors primary, secondary and tertiary for a destructive action. */
  tone?: ButtonTone
  /** The selected option of a set: takes the primary look. Secondary and glass. */
  active?: boolean
  /** Pressable but not the live option: dimmed, not disabled. */
  inactive?: boolean
  /** Drops the edge of a glass variant. */
  borderless?: boolean
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
    variant = 'primary',
    size = 'md',
    shape = 'pill',
    tone,
    active = false,
    inactive = false,
    borderless = false,
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
  // A selected option, and the navigation pill for the page you are on, are the
  // primary recipe on another variant's geometry — not a third set of colors.
  const selected = active || (variant === 'nav' && rest['aria-current'] === 'page')
  const look = disabled
    ? disabledLooks[variant]
    : cn(
        variants[selected ? 'primary' : variant],
        !selected && tone && tones[tone][variant],
        !selected && inactive && inactiveLooks[variant],
        borderless && '[--btn-border:transparent]',
      )
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-active={selected || undefined}
      data-inactive={inactive || undefined}
      className={cn(
        base,
        look,
        sizes[size],
        shapes[shape][size],
        isIconOnly && iconOnly[size],
        fullWidth && 'w-full',
        // In flight is not unavailable: a loading button keeps its recipe and
        // only steps back, where a disabled one gives the recipe up.
        loading && !disabled && 'opacity-60',
        className,
      )}
      {...inspect(`Button · ${variant} · ${size}`, {
        tokens: shape === 'rounded' ? [...variantTokens[variant], '--radius-md'] : variantTokens[variant],
        why: 'Height comes from the 4px grid (36px = 9 units) so buttons align with inputs and selects on the same row. A variant only fills five slots — fill, label, edge, hover wash, blur — which is why every variant works at every size and shape.',
        a11y: 'Hit area is padded to 44×44 on coarse pointers. Focus ring is 2px at 2px offset — 3:1 against both the button and the page.',
      })}
      {...rest}
    >
      {/* Content is hidden rather than removed so the button never changes
          width when it enters the loading or success state. A button that
          resizes under the cursor is a button you mis-click. `relative` puts
          it above the hover wash. */}
      <span
        className={cn(
          'relative inline-flex items-center justify-center gap-[inherit]',
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
  function IconButton({ label, icon, variant = 'tertiary', size = 'md', ...rest }, ref) {
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
  variant?: Extract<ButtonVariant, 'primary' | 'secondary' | 'standard'>
  size?: ButtonSize
  startIcon?: React.ReactNode
  disabled?: boolean
}

export function SplitButton({
  label,
  onAction,
  options,
  variant = 'primary',
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
          variant === 'primary' ? 'bg-black/25' : 'bg-[var(--ds-border)]',
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
