import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { useId } from '@/lib/hooks'

/* ===========================================================================
   CHECKBOX
   Independent on/off. Zero, one, or many may be selected. Changes are staged
   until submit — that is the whole difference from a Switch.
   ======================================================================== */

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  indeterminate?: boolean
  size?: 'sm' | 'md'
  error?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate, size = 'md', error, className, id: idProp, disabled, ...rest },
  ref,
) {
  const auto = useId('cb')
  const id = idProp ?? auto
  const inner = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = Boolean(indeterminate)
  }, [indeterminate])

  const box = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'
  const glyph = size === 'sm' ? 11 : 13

  return (
    <div
      className={cn('flex items-start gap-2.5', disabled && 'opacity-50', className)}
      {...inspect(`Checkbox · ${size}`, {
        tokens: ['--ds-accent', '--radius-xs', '--ds-border-strong', '--ds-focus-ring'],
        why: '18px is the smallest box where a checkmark still reads as a checkmark rather than a smudge. The label is part of the target, which turns a 18px hit area into a ~200px one — Fitts’ Law, for free.',
        a11y: 'A real <input type=checkbox> — it gets keyboard, form submission and AT semantics with no ARIA at all. Indeterminate is set via the DOM property, which has no HTML attribute.',
      })}
    >
      <span className="relative inline-grid shrink-0 place-items-center" style={{ marginTop: size === 'sm' ? 3 : 2 }}>
        <input
          ref={(n) => {
            inner.current = n
            if (typeof ref === 'function') ref(n)
            else if (ref) ref.current = n
          }}
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error || undefined}
          className={cn(
            'peer appearance-none border bg-[var(--ds-surface-inset)] transition-all',
            'duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
            'rounded-[var(--radius-xs)]',
            box,
            error ? 'border-[var(--ds-danger)]' : 'border-[var(--ds-border-strong)]',
            'hover:border-[var(--ds-accent)] not-disabled:hover:bg-[var(--ds-accent-subtle)]',
            'checked:border-[var(--ds-accent)] checked:bg-[var(--ds-accent)]',
            'indeterminate:border-[var(--ds-accent)] indeterminate:bg-[var(--ds-accent)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
            'disabled:cursor-not-allowed',
          )}
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 grid place-items-center text-[var(--ds-accent-fg)]',
            'scale-50 opacity-0 transition-all duration-[140ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
            'peer-checked:scale-100 peer-checked:opacity-100',
            'peer-indeterminate:scale-100 peer-indeterminate:opacity-100',
          )}
        >
          {indeterminate ? (
            <Minus size={glyph} strokeWidth={3.2} />
          ) : (
            <Check size={glyph} strokeWidth={3.2} />
          )}
        </span>
      </span>

      {(label || description) && (
        <span className="flex min-w-0 flex-col gap-0.5">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-body-sm leading-snug text-[var(--ds-fg)]',
                !disabled && 'cursor-pointer',
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-caption text-[var(--ds-fg-muted)]">{description}</span>
          )}
        </span>
      )}
    </div>
  )
})

/* ===========================================================================
   RADIO
   Exactly one of a known, mutually exclusive set. Never fewer than 2 options,
   never more than ~6 — past that, use a Select.
   ======================================================================== */

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  size?: 'sm' | 'md'
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, size = 'md', className, id: idProp, disabled, ...rest },
  ref,
) {
  const auto = useId('rb')
  const id = idProp ?? auto
  const box = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'

  return (
    <div className={cn('flex items-start gap-2.5', disabled && 'opacity-50', className)}>
      <span className="relative inline-grid shrink-0 place-items-center" style={{ marginTop: size === 'sm' ? 3 : 2 }}>
        <input
          ref={ref}
          id={id}
          type="radio"
          disabled={disabled}
          className={cn(
            'peer appearance-none rounded-full border bg-[var(--ds-surface-inset)]',
            'transition-all duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
            box,
            'border-[var(--ds-border-strong)] hover:border-[var(--ds-accent)]',
            'not-disabled:hover:bg-[var(--ds-accent-subtle)]',
            'checked:border-[5px] checked:border-[var(--ds-accent)] checked:bg-[var(--ds-surface-inset)]',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
            'disabled:cursor-not-allowed',
          )}
          {...rest}
        />
      </span>
      {(label || description) && (
        <span className="flex min-w-0 flex-col gap-0.5">
          {label && (
            <label
              htmlFor={id}
              className={cn('text-body-sm leading-snug text-[var(--ds-fg)]', !disabled && 'cursor-pointer')}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-caption text-[var(--ds-fg-muted)]">{description}</span>
          )}
        </span>
      )}
    </div>
  )
})

export function RadioGroup({
  legend,
  description,
  children,
  orientation = 'vertical',
  className,
}: {
  legend: string
  description?: string
  children: React.ReactNode
  orientation?: 'vertical' | 'horizontal'
  className?: string
}) {
  return (
    <fieldset
      className={cn('m-0 border-0 p-0', className)}
      {...inspect('RadioGroup', {
        tokens: ['--text-label', '--ds-fg-secondary'],
        why: 'Vertical is the default: a stacked list is scanned in one eye movement per item, and the options stay aligned on a single left edge. Go horizontal only for 2–3 very short labels.',
        a11y: 'Arrow keys move between radios in a group and skip disabled ones — this is native behaviour you get for free from <input type=radio> with a shared name.',
      })}
    >
      <legend className="mb-2 text-label text-[var(--ds-fg-secondary)]">{legend}</legend>
      {description && (
        <p className="-mt-1 mb-2.5 text-caption text-[var(--ds-fg-muted)]">{description}</p>
      )}
      <div
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-2.5' : 'flex-row flex-wrap gap-x-6 gap-y-2.5',
        )}
      >
        {children}
      </div>
    </fieldset>
  )
}

/** Radio rendered as a selectable card. For high-stakes, explainable choices. */
export function RadioCard({
  label,
  description,
  icon,
  badge,
  checked,
  size: _size,
  className: _className,
  ...rest
}: RadioProps & { icon?: React.ReactNode; badge?: React.ReactNode }) {
  const auto = useId('rc')
  const id = rest.id ?? auto
  return (
    <label
      htmlFor={id}
      className={cn(
        'group relative flex cursor-pointer gap-3 rounded-[var(--radius-lg)] border p-3.5',
        'transition-all duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]',
        checked
          ? 'border-[var(--ds-accent)] bg-[var(--ds-accent-subtle)] shadow-[0_0_0_1px_var(--ds-accent)]'
          : 'border-[var(--ds-border)] bg-[var(--ds-surface)] hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-layer-hover)]',
        rest.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <input
        {...rest}
        id={id}
        type="radio"
        checked={checked}
        className="peer sr-only-ds"
      />
      <span
        aria-hidden
        className={cn(
          'mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition-all',
          checked ? 'border-[5px] border-[var(--ds-accent)]' : 'border-[var(--ds-border-strong)]',
        )}
      />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-2">
          {icon && <span className="text-[var(--ds-fg-secondary)]">{icon}</span>}
          <span className="text-label text-[var(--ds-fg)]">{label}</span>
          {badge}
        </span>
        {description && (
          <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}

/* ===========================================================================
   SWITCH
   Immediate, self-saving, binary. If the change needs a Save button, it is a
   Checkbox wearing a costume.
   ======================================================================== */

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  label?: React.ReactNode
  description?: React.ReactNode
  size?: 'sm' | 'md'
  disabled?: boolean
  /** Renders the control on the right — the correct layout for settings rows. */
  align?: 'start' | 'end'
  id?: string
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  size = 'md',
  disabled,
  align = 'start',
  id: idProp,
  className,
}: SwitchProps) {
  const auto = useId('sw')
  const id = idProp ?? auto
  const track = size === 'sm' ? 'h-[18px] w-8' : 'h-[22px] w-[38px]'
  const knob = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'
  const travel = size === 'sm' ? 'translate-x-[14px]' : 'translate-x-4'

  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={label ? `${id}-label` : undefined}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent p-0.5',
        'transition-colors duration-[180ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        track,
        checked
          ? 'bg-[var(--ds-accent)]'
          : 'bg-[var(--ds-border-strong)] hover:bg-[var(--ds-fg-disabled)]',
      )}
      {...inspect(`Switch · ${size}`, {
        tokens: ['--ds-accent', '--ds-border-strong', '--ease-emphasized'],
        why: 'The knob travels on an emphasized curve (fast out, settled in) over 180ms — long enough to read as movement, short enough that a rapid toggle never queues up. Track colour, not just knob position, carries the state so it survives greyscale.',
        a11y: 'role="switch" + aria-checked. A screen reader announces “on/off”, not “checked” — which is the correct mental model for something that saves instantly.',
      })}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-e1',
          'transition-transform duration-[180ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          knob,
          checked ? travel : 'translate-x-0',
        )}
      />
    </button>
  )

  if (!label && !description) return <div className={className}>{control}</div>

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        align === 'end' && 'w-full justify-between',
        disabled && 'opacity-60',
        className,
      )}
    >
      {align === 'start' && control}
      <span className="flex min-w-0 flex-col gap-0.5">
        {label && (
          <label
            id={`${id}-label`}
            htmlFor={id}
            className={cn('text-body-sm leading-snug text-[var(--ds-fg)]', !disabled && 'cursor-pointer')}
          >
            {label}
          </label>
        )}
        {description && (
          <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            {description}
          </span>
        )}
      </span>
      {align === 'end' && control}
    </div>
  )
}

/* ===========================================================================
   SEGMENTED CONTROL
   2–5 mutually exclusive views. Instant, no submit. Never for destructive
   choices — there is no confirmation step.
   ======================================================================== */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  fullWidth,
  className,
  'aria-label': ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[]
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const activeIdx = options.findIndex((o) => o.value === value)

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
        e.preventDefault()
        const next =
          (activeIdx + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length
        onChange(options[next].value)
        refs.current[next]?.focus()
      }}
      className={cn(
        'relative inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]',
        'bg-[var(--ds-surface-inset)] p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
      {...inspect('Segmented control', {
        tokens: ['--ds-surface-inset', '--ds-surface-raised', '--radius-md', '--shadow-e1'],
        why: 'The selected segment is *raised* out of an inset track — the same physical metaphor as a real switch. Inner radius is 6px against an 8px outer, so the corners stay concentric.',
        a11y: 'role=radiogroup with roving arrow-key focus. Only one segment is in the tab order, so Tab moves past the whole control rather than through every option.',
      })}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(n) => {
              refs.current[i] = n
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)]',
              'transition-all duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
              size === 'sm' ? 'h-6 px-2.5 text-label-sm' : 'h-7 px-3 text-label',
              fullWidth && 'flex-1',
              selected
                ? 'bg-[var(--ds-surface-raised)] text-[var(--ds-fg)] shadow-e1'
                : 'text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg-secondary)]',
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
