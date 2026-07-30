import * as React from 'react'
import { AlertCircle, Check, Eye, EyeOff, Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { useId } from '@/lib/hooks'

/* ===========================================================================
   FIELD — the shell every input shares
   Label, description, control, message, counter. Getting this wrapper right
   once means no form in the product can drift.
   ======================================================================== */

export type FieldStatus = 'default' | 'error' | 'success' | 'warning'
export type ControlSize = 'sm' | 'md' | 'lg'

export interface FieldProps {
  label?: string
  /** Static guidance. Always visible. Never disappears on error. */
  description?: string
  /** Validation message. Replaces nothing — it stacks under the description. */
  message?: string
  status?: FieldStatus
  required?: boolean
  /** Renders “Optional” instead of an asterisk when most fields are required. */
  optional?: boolean
  counter?: { value: number; max: number }
  htmlFor?: string
  children: React.ReactNode
  className?: string
  hideLabel?: boolean
}

const statusText: Record<FieldStatus, string> = {
  default: 'text-[var(--ds-fg-muted)]',
  error: 'text-[var(--ds-danger-text)]',
  success: 'text-[var(--ds-success-text)]',
  warning: 'text-[var(--ds-warning-text)]',
}

const StatusIcon = ({ status }: { status: FieldStatus }) => {
  if (status === 'error') return <AlertCircle size={13} className="shrink-0 mt-px" aria-hidden />
  if (status === 'success') return <Check size={13} className="shrink-0 mt-px" aria-hidden />
  if (status === 'warning') return <AlertCircle size={13} className="shrink-0 mt-px" aria-hidden />
  return null
}

export function Field({
  label,
  description,
  message,
  status = 'default',
  required,
  optional,
  counter,
  htmlFor,
  children,
  className,
  hideLabel,
}: FieldProps) {
  const overCount = counter ? counter.value > counter.max : false
  return (
    <div
      className={cn('flex flex-col gap-1.5', className)}
      {...inspect('Field', {
        tokens: ['--text-label', '--ds-fg-secondary', '--ds-fg-muted', '--text-caption'],
        why: 'Label sits 6px above the control — close enough to be owned by it, far enough not to crowd it. The gap between two stacked fields is 20px, more than 3× the label gap, so grouping is unambiguous.',
        a11y: 'Label is a real <label for>. The message is wired via aria-describedby and marked aria-live so a screen reader announces validation without moving focus.',
      })}
    >
      {label && (
        <div className={cn('flex items-baseline justify-between gap-3', hideLabel && 'sr-only-ds')}>
          <label
            htmlFor={htmlFor}
            className="text-label text-[var(--ds-fg-secondary)] cursor-default"
          >
            {label}
            {required && (
              <span className="text-[var(--ds-danger-text)] ml-0.5" aria-hidden>
                *
              </span>
            )}
            {required && <span className="sr-only-ds"> (required)</span>}
            {optional && (
              <span className="ml-1.5 text-caption font-normal text-[var(--ds-fg-muted)]">
                Optional
              </span>
            )}
          </label>
          {counter && (
            <span
              data-tabular
              className={cn(
                'text-caption tabular-nums',
                overCount ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-muted)]',
              )}
            >
              {counter.value}/{counter.max}
            </span>
          )}
        </div>
      )}

      {children}

      {(description || message) && (
        <div className="flex flex-col gap-1">
          {description && (
            <p className="text-caption text-[var(--ds-fg-muted)]">{description}</p>
          )}
          {message && (
            <p
              role={status === 'error' ? 'alert' : undefined}
              aria-live={status === 'error' ? 'polite' : undefined}
              className={cn('flex items-start gap-1.5 text-caption', statusText[status])}
            >
              <StatusIcon status={status} />
              <span>{message}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ===========================================================================
   CONTROL SHELL — shared visual container for every text-ish control
   ======================================================================== */

export const controlSizes: Record<ControlSize, string> = {
  sm: 'h-8 text-body-sm rounded-[var(--radius-md)]',
  md: 'h-9 text-body rounded-[var(--radius-md)]',
  lg: 'h-11 text-body-lg rounded-[var(--radius-lg)]',
}
const padX: Record<ControlSize, string> = { sm: 'px-2.5', md: 'px-3', lg: 'px-3.5' }

export function controlShell(status: FieldStatus, disabled?: boolean, readOnly?: boolean) {
  return cn(
    'w-full bg-[var(--ds-surface-inset)] border transition-[border-color,box-shadow,background-color]',
    'duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
    'placeholder:text-[var(--ds-fg-muted)]',
    status === 'default' && 'border-[var(--ds-border-interactive)] hover:border-[var(--ds-border-strong)]',
    status === 'error' && 'border-[var(--ds-danger-border)] hover:border-[var(--ds-danger)]',
    status === 'success' && 'border-[var(--ds-success-border)]',
    status === 'warning' && 'border-[var(--ds-warning-border)]',
    // Focus is a border colour change plus a 3px halo. The halo is what makes
    // it visible at a glance; the border change is what makes it precise.
    'focus:outline-none focus-visible:outline-none',
    status === 'error'
      ? 'focus:border-[var(--ds-danger)] focus:shadow-[0_0_0_3px_var(--ds-danger-subtle)]'
      : 'focus:border-[var(--ds-accent)] focus:shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
    disabled && 'cursor-not-allowed opacity-50 bg-[var(--ds-layer-hover)]',
    readOnly && 'bg-transparent border-dashed',
  )
}

/* ===========================================================================
   TEXT INPUT
   ======================================================================== */

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: ControlSize
  status?: FieldStatus
  /** Static text glued to the left, inside the border. e.g. “https://” */
  prefix?: React.ReactNode
  /** Static text glued to the right, inside the border. e.g. “.com” or “USD” */
  suffix?: React.ReactNode
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  loading?: boolean
  onClear?: () => void
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className,
    size = 'md',
    status = 'default',
    prefix,
    suffix,
    startIcon,
    endIcon,
    loading,
    onClear,
    disabled,
    readOnly,
    value,
    ...rest
  },
  ref,
) {
  const iconPx = size === 'lg' ? 17 : size === 'sm' ? 14 : 15
  const hasAdorn = Boolean(prefix || suffix || startIcon || endIcon || loading || onClear)
  const showClear = Boolean(onClear) && String(value ?? '').length > 0

  const inputEl = (
    <input
      ref={ref}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      aria-invalid={status === 'error' || undefined}
      className={cn(
        hasAdorn
          ? 'h-full w-full min-w-0 bg-transparent border-0 outline-none placeholder:text-[var(--ds-fg-muted)] disabled:cursor-not-allowed'
          : cn(controlShell(status, disabled, readOnly), controlSizes[size], padX[size]),
        className,
      )}
      {...rest}
    />
  )

  if (!hasAdorn) {
    return (
      <span
        className="block"
        {...inspect(`TextInput · ${size}`, {
          tokens: ['--ds-surface-inset', '--ds-border-interactive', '--ds-accent', '--radius-md'],
          why: 'The control is inset (darker than the surface) so it reads as a hole you can pour text into, not a raised button you press. 12px horizontal padding gives the caret breathing room at the left edge.',
          a11y: 'aria-invalid flips on error. Focus adds a 3px halo — the border colour alone is a 1px cue and fails for low-vision users.',
        })}
      >
        {inputEl}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'group inline-flex items-center gap-2 overflow-hidden',
        controlShell(status, disabled, readOnly),
        controlSizes[size],
        padX[size],
        // The wrapper owns focus styling because the real input is borderless.
        'focus-within:border-[var(--ds-accent)] focus-within:shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
        status === 'error' &&
          'focus-within:border-[var(--ds-danger)] focus-within:shadow-[0_0_0_3px_var(--ds-danger-subtle)]',
        className,
      )}
      {...inspect(`TextInput · ${size} · adorned`, {
        tokens: ['--ds-surface-inset', '--ds-border-interactive', '--radius-md', '--ds-fg-muted'],
        why: 'Adornments live inside the border so the whole thing reads as one control. Icons are muted, not full-contrast — they are wayfinding, not content.',
        a11y: 'The wrapper carries :focus-within styling; the inner input keeps a real focus event so screen readers still fire correctly.',
      })}
    >
      {prefix && (
        <span className="shrink-0 select-none text-[var(--ds-fg-muted)]">{prefix}</span>
      )}
      {startIcon && (
        <span className="shrink-0 text-[var(--ds-fg-muted)]" aria-hidden style={{ lineHeight: 0 }}>
          {React.isValidElement(startIcon)
            ? React.cloneElement(startIcon as React.ReactElement<{ size?: number }>, {
                size: iconPx,
              })
            : startIcon}
        </span>
      )}
      {inputEl}
      {loading && (
        <Loader2
          size={iconPx}
          className="shrink-0 animate-[spin_720ms_linear_infinite] text-[var(--ds-fg-muted)]"
          aria-hidden
        />
      )}
      {showClear && !loading && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear"
          className="shrink-0 grid h-5 w-5 place-items-center rounded-full text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
        >
          <X size={13} />
        </button>
      )}
      {endIcon && (
        <span className="shrink-0 text-[var(--ds-fg-muted)]" aria-hidden style={{ lineHeight: 0 }}>
          {React.isValidElement(endIcon)
            ? React.cloneElement(endIcon as React.ReactElement<{ size?: number }>, {
                size: iconPx,
              })
            : endIcon}
        </span>
      )}
      {suffix && <span className="shrink-0 select-none text-[var(--ds-fg-muted)]">{suffix}</span>}
    </div>
  )
})

/* ===========================================================================
   PASSWORD
   ======================================================================== */

export function PasswordInput({
  size = 'md',
  status = 'default',
  ...rest
}: Omit<TextInputProps, 'type' | 'endIcon'>) {
  const [shown, setShown] = React.useState(false)
  return (
    <TextInput
      {...rest}
      size={size}
      status={status}
      type={shown ? 'text' : 'password'}
      autoComplete="current-password"
      endIcon={
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="grid h-6 w-6 place-items-center rounded-[var(--radius-xs)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          {shown ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  )
}

/* ===========================================================================
   SEARCH
   ======================================================================== */

export function SearchInput({
  size = 'md',
  ...rest
}: Omit<TextInputProps, 'type' | 'startIcon'>) {
  return (
    <TextInput
      {...rest}
      size={size}
      type="search"
      role="searchbox"
      startIcon={<Search />}
      placeholder={rest.placeholder ?? 'Search…'}
    />
  )
}

/* ===========================================================================
   TEXTAREA
   ======================================================================== */

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: ControlSize
  status?: FieldStatus
  /** Grows with content up to maxRows, then scrolls. */
  autoResize?: boolean
  maxRows?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, size = 'md', status = 'default', autoResize, maxRows = 12, rows = 4, onChange, disabled, readOnly, ...rest },
  ref,
) {
  const inner = React.useRef<HTMLTextAreaElement | null>(null)

  const resize = React.useCallback(() => {
    const el = inner.current
    if (!el || !autoResize) return
    el.style.height = 'auto'
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22
    const max = lineHeight * maxRows
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [autoResize, maxRows])

  React.useEffect(resize, [resize])

  return (
    <textarea
      ref={(node) => {
        inner.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={status === 'error' || undefined}
      onChange={(e) => {
        resize()
        onChange?.(e)
      }}
      className={cn(
        controlShell(status, disabled, readOnly),
        'h-auto min-h-[5.5rem] py-2.5 px-3 leading-relaxed',
        size === 'sm' ? 'text-body-sm' : size === 'lg' ? 'text-body-lg' : 'text-body',
        'rounded-[var(--radius-md)]',
        autoResize ? 'resize-none' : 'resize-y',
        className,
      )}
      {...inspect('Textarea', {
        tokens: ['--ds-surface-inset', '--radius-md', '--ds-border-interactive'],
        why: 'Default height shows ~4 lines. Two lines makes users feel they should be brief; ten makes an empty box feel like homework. Resize is vertical-only — horizontal resize breaks the form grid.',
        a11y: 'Never disable resize entirely unless auto-resize replaces it; users with low vision enlarge the box to read their own text.',
      })}
      {...rest}
    />
  )
})

/* ===========================================================================
   NUMBER + CURRENCY
   ======================================================================== */

export interface NumberInputProps extends Omit<TextInputProps, 'type' | 'value' | 'onChange'> {
  value: number | ''
  onValueChange: (v: number | '') => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  size = 'md',
  ...rest
}: NumberInputProps) {
  const clamp = (n: number) => {
    let out = n
    if (min !== undefined) out = Math.max(min, out)
    if (max !== undefined) out = Math.min(max, out)
    return out
  }
  const bump = (dir: 1 | -1) => {
    const current = value === '' ? 0 : value
    onValueChange(clamp(Number((current + dir * step).toFixed(10))))
  }
  return (
    <TextInput
      {...rest}
      size={size}
      inputMode="decimal"
      type="text"
      value={value}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^\d.\-]/g, '')
        onValueChange(raw === '' ? '' : Number(raw))
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          bump(1)
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          bump(-1)
        }
      }}
      className="tabular-nums text-right"
      endIcon={
        <span className="flex flex-col -my-0.5">
          {([1, -1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => bump(dir)}
              className="grid h-3.5 w-5 place-items-center rounded-[3px] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
            >
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none" aria-hidden>
                <path
                  d={dir === 1 ? 'M1 4L4 1L7 4' : 'M1 1L4 4L7 1'}
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </span>
      }
    />
  )
}

export function CurrencyInput({
  currency = 'USD',
  symbol = '$',
  ...rest
}: NumberInputProps & { currency?: string; symbol?: string }) {
  return <NumberInput {...rest} prefix={symbol} suffix={<span className="text-caption">{currency}</span>} />
}

/* ===========================================================================
   FORM ROW HELPERS
   ======================================================================== */

export function FieldRow({
  children,
  className,
  cols = 2,
}: {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 2 && 'sm:grid-cols-2',
        cols === 3 && 'sm:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Fieldset({
  legend,
  description,
  children,
  className,
}: {
  legend: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <fieldset
      className={cn('flex flex-col gap-4 border-0 p-0 m-0', className)}
      {...inspect('Fieldset', {
        tokens: ['--text-h4', '--ds-fg', '--ds-fg-muted'],
        why: 'A visual group needs a real <fieldset>/<legend>, not a styled div. Miller’s Law: keep each group to 5–7 fields so it can be held in working memory as one chunk.',
        a11y: '<legend> is announced before every control in the group, giving each field its context automatically.',
      })}
    >
      <legend className="contents">
        <span className="block text-h4 text-[var(--ds-fg)]">{legend}</span>
        {description && (
          <span className="block -mt-2.5 text-body-sm text-[var(--ds-fg-muted)]">
            {description}
          </span>
        )}
      </legend>
      {children}
    </fieldset>
  )
}

/** Convenience: a Field + TextInput wired together with a generated id. */
export function TextField({
  label,
  description,
  message,
  status,
  required,
  optional,
  counter,
  className,
  hideLabel,
  ...input
}: FieldProps extends never ? never : Omit<FieldProps, 'children' | 'htmlFor'> & TextInputProps) {
  const id = useId('field')
  const descId = `${id}-desc`
  return (
    <Field
      label={label}
      description={description}
      message={message}
      status={status}
      required={required}
      optional={optional}
      counter={counter}
      htmlFor={id}
      className={className}
      hideLabel={hideLabel}
    >
      <TextInput
        id={id}
        status={status}
        required={required}
        aria-describedby={description || message ? descId : undefined}
        {...input}
      />
    </Field>
  )
}
