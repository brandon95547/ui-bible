import * as React from 'react'
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { useDismissable } from '@/lib/hooks'
import { controlSizes, controlShell, type ControlSize, type FieldStatus } from './Input'
import { Chip } from './Display'

export interface Option {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  group?: string
  disabled?: boolean
}

/* ===========================================================================
   NATIVE SELECT
   Under ~15 known options with no search need, the native control wins:
   free keyboard support, free mobile wheel picker, zero bundle cost.
   ======================================================================== */

export function NativeSelect({
  options,
  size = 'md',
  status = 'default',
  placeholder,
  className,
  ...rest
}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: Option[]
  size?: ControlSize
  status?: FieldStatus
  placeholder?: string
}) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Option[]>()
    options.forEach((o) => {
      const k = o.group ?? ''
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(o)
    })
    return map
  }, [options])

  return (
    <div className="relative">
      <select
        className={cn(
          controlShell(status, rest.disabled),
          controlSizes[size],
          'cursor-pointer appearance-none pl-3 pr-9',
          className,
        )}
        {...inspect('Select · native', {
          tokens: ['--ds-surface-inset', '--radius-md', '--ds-border-interactive'],
          why: 'Right padding is 36px, not 12px — the chevron needs 16px plus its own 12px gutter, or long option labels collide with it.',
          a11y: 'A native <select> is keyboard-, screen-reader- and mobile-complete on day one. A custom listbox has to re-implement all of it and usually gets type-ahead wrong.',
        })}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {[...groups.entries()].map(([group, opts]) =>
          group ? (
            <optgroup key={group} label={group}>
              {opts.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : (
            opts.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          ),
        )}
      </select>
      <ChevronDown
        size={15}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-fg-muted)]"
      />
    </div>
  )
}

/* ===========================================================================
   LISTBOX — custom single select with rich rows
   ======================================================================== */

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  size = 'md',
  status = 'default',
  disabled,
  searchable,
  className,
  emptyText = 'No results',
  'aria-label': ariaLabel,
}: {
  options: Option[]
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
  size?: ControlSize
  status?: FieldStatus
  disabled?: boolean
  searchable?: boolean
  className?: string
  emptyText?: string
  'aria-label'?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIdx, setActiveIdx] = React.useState(0)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()

  useDismissable(open, () => setOpen(false), [btnRef, popRef])

  const filtered = React.useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    )
  }, [options, query])

  const grouped = React.useMemo(() => {
    const map = new Map<string, Option[]>()
    filtered.forEach((o) => {
      const k = o.group ?? ''
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(o)
    })
    return [...map.entries()]
  }, [filtered])

  const flat = filtered.filter((o) => !o.disabled)
  const selected = options.find((o) => o.value === value)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(Math.max(0, flat.findIndex((o) => o.value === value)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  React.useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIdx(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIdx(flat.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = flat[activeIdx]
      if (opt) {
        onChange(opt.value)
        setOpen(false)
        btnRef.current?.focus()
      }
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)} onKeyDown={onKeyDown}>
      <button
        ref={btnRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          controlShell(status, disabled),
          controlSizes[size],
          'flex cursor-pointer items-center gap-2 pl-3 pr-2.5 text-left',
          open && 'border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
        )}
        {...inspect(`Select · listbox · ${size}`, {
          tokens: ['--ds-surface-inset', '--ds-surface-overlay', '--shadow-e4', '--radius-md'],
          why: 'The trigger is exactly as tall as a text input (36px) so a Select and an Input sitting side by side share a baseline. The popover matches the trigger width so the eye does not have to re-anchor when it opens.',
          a11y: 'role=combobox on the trigger, role=listbox on the panel, aria-activedescendant for the highlighted row. Focus stays on the trigger — moving it into the list breaks type-ahead.',
        })}
      >
        {selected?.icon && <span className="shrink-0 text-[var(--ds-fg-muted)]">{selected.icon}</span>}
        <span
          className={cn(
            'flex-1 truncate',
            selected ? 'text-[var(--ds-fg)]' : 'text-[var(--ds-fg-muted)]',
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={15}
          aria-hidden
          className={cn(
            'shrink-0 text-[var(--ds-fg-muted)] transition-transform duration-[160ms]',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          ref={popRef}
          className={cn(
            'absolute left-0 right-0 top-[calc(100%+6px)] z-[65] overflow-hidden',
            'rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4',
            'animate-[scale-in_140ms_cubic-bezier(0.32,0.72,0,1)_both] origin-top',
          )}
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3">
              <Search size={14} className="shrink-0 text-[var(--ds-fg-muted)]" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActiveIdx(0)
                }}
                placeholder="Filter…"
                aria-label="Filter options"
                className="h-9 w-full bg-transparent text-body-sm outline-none placeholder:text-[var(--ds-fg-muted)]"
              />
            </div>
          )}
          <div
            ref={listRef}
            id={`${id}-listbox`}
            role="listbox"
            className="max-h-64 overflow-y-auto p-1"
          >
            {flat.length === 0 && (
              <p className="px-3 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
                {emptyText}
              </p>
            )}
            {grouped.map(([group, opts]) => (
              <React.Fragment key={group || '_'}>
                {group && (
                  <p
                    role="presentation"
                    className="px-2.5 pb-1 pt-2.5 text-overline uppercase text-[var(--ds-fg-muted)]"
                  >
                    {group}
                  </p>
                )}
                {opts.map((o) => {
                  const idx = flat.indexOf(o)
                  const isActive = idx === activeIdx
                  const isSelected = o.value === value
                  return (
                    <div
                      key={o.value}
                      role="option"
                      aria-selected={isSelected}
                      data-active={isActive}
                      onMouseEnter={() => !o.disabled && setActiveIdx(idx)}
                      onClick={() => {
                        if (o.disabled) return
                        onChange(o.value)
                        setOpen(false)
                        btnRef.current?.focus()
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5',
                        'transition-colors duration-75',
                        isActive && 'bg-[var(--ds-layer-hover)]',
                        o.disabled && 'pointer-events-none opacity-40',
                      )}
                    >
                      {o.icon && <span className="shrink-0 text-[var(--ds-fg-muted)]">{o.icon}</span>}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-label text-[var(--ds-fg)]">{o.label}</span>
                        {o.description && (
                          <span className="truncate text-caption text-[var(--ds-fg-muted)]">
                            {o.description}
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <Check size={15} className="shrink-0 text-[var(--ds-accent)]" aria-hidden />
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===========================================================================
   MULTI SELECT
   ======================================================================== */

export function MultiSelect({
  options,
  values,
  onChange,
  placeholder = 'Select…',
  size = 'md',
  maxVisible = 3,
  className,
  'aria-label': ariaLabel,
}: {
  options: Option[]
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  size?: ControlSize
  maxVisible?: number
  className?: string
  'aria-label'?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const btnRef = React.useRef<HTMLDivElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  useDismissable(open, () => setOpen(false), [btnRef, popRef])

  const selected = options.filter((o) => values.includes(o.value))
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={btnRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={cn(
          controlShell('default'),
          'flex min-h-9 cursor-pointer flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] py-1 pl-2 pr-2.5',
          size === 'lg' && 'min-h-11',
          open && 'border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
        )}
        {...inspect('MultiSelect', {
          tokens: ['--ds-accent-subtle', '--radius-full', '--ds-surface-inset'],
          why: 'Selections become removable chips inside the control, so the current state is visible without opening anything. Past ~3 chips it collapses to “+N more” — an unbounded chip list makes the field grow and shoves the rest of the form down the page.',
          a11y: 'Backspace on an empty field removes the last chip — the behaviour every user has already learned from email “To” fields. Each chip’s remove button has its own accessible name.',
        })}
      >
        {selected.length === 0 && (
          <span className="px-1 text-[var(--ds-fg-muted)]">{placeholder}</span>
        )}
        {selected.slice(0, maxVisible).map((o) => (
          <Chip
            key={o.value}
            as="span"
            size="sm"
            selected
            onRemove={() => toggle(o.value)}
          >
            {o.label}
          </Chip>
        ))}
        {selected.length > maxVisible && (
          <span className="px-1 text-caption text-[var(--ds-fg-muted)]">
            +{selected.length - maxVisible} more
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 pl-1">
          {selected.length > 0 && (
            <button
              type="button"
              aria-label="Clear all"
              onClick={(e) => {
                e.stopPropagation()
                onChange([])
              }}
              className="grid h-5 w-5 place-items-center rounded-full text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={15}
            aria-hidden
            className={cn('text-[var(--ds-fg-muted)] transition-transform', open && 'rotate-180')}
          />
        </span>
      </div>

      {open && (
        <div
          ref={popRef}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[65] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4 animate-[scale-in_140ms_cubic-bezier(0.32,0.72,0,1)_both] origin-top"
        >
          <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3">
            <Search size={14} className="shrink-0 text-[var(--ds-fg-muted)]" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              aria-label="Filter options"
              className="h-9 w-full bg-transparent text-body-sm outline-none placeholder:text-[var(--ds-fg-muted)]"
            />
          </div>
          <div role="listbox" aria-multiselectable className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
                No results
              </p>
            )}
            {filtered.map((o) => {
              const isSel = values.includes(o.value)
              return (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={isSel}
                  onClick={() => toggle(o.value)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 transition-colors hover:bg-[var(--ds-layer-hover)]"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'grid h-[16px] w-[16px] shrink-0 place-items-center rounded-[var(--radius-xs)] border transition-colors',
                      isSel
                        ? 'border-[var(--ds-accent)] bg-[var(--ds-accent)] text-[var(--ds-accent-fg)]'
                        : 'border-[var(--ds-border-strong)]',
                    )}
                  >
                    {isSel && <Check size={11} strokeWidth={3.2} />}
                  </span>
                  <span className="flex-1 truncate text-label text-[var(--ds-fg)]">{o.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===========================================================================
   COMBOBOX / AUTOCOMPLETE — free text that suggests, with async support
   ======================================================================== */

export function Combobox({
  options,
  value,
  onChange,
  onQueryChange,
  loading,
  placeholder = 'Start typing…',
  size = 'md',
  emptyText = 'No matches',
  className,
  'aria-label': ariaLabel,
}: {
  options: Option[]
  value: string | null
  onChange: (v: string) => void
  onQueryChange?: (q: string) => void
  loading?: boolean
  placeholder?: string
  size?: ControlSize
  emptyText?: string
  className?: string
  'aria-label'?: string
}) {
  const selected = options.find((o) => o.value === value)
  const [query, setQuery] = React.useState(selected?.label ?? '')
  const [open, setOpen] = React.useState(false)
  const [activeIdx, setActiveIdx] = React.useState(0)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const popRef = React.useRef<HTMLDivElement>(null)
  const id = React.useId()
  useDismissable(open, () => setOpen(false), [wrapRef, popRef])

  React.useEffect(() => {
    setQuery(selected?.label ?? '')
  }, [selected?.label])

  const results = onQueryChange
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div
        className={cn(
          controlShell('default'),
          controlSizes[size],
          'flex items-center gap-2 pl-3 pr-2.5',
          open && 'border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
        )}
      >
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${id}-opt-${activeIdx}` : undefined}
          aria-label={ariaLabel}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            onQueryChange?.(e.target.value)
            setOpen(true)
            setActiveIdx(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActiveIdx((i) => Math.min(results.length - 1, i + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIdx((i) => Math.max(0, i - 1))
            } else if (e.key === 'Enter' && open) {
              e.preventDefault()
              const opt = results[activeIdx]
              if (opt) {
                onChange(opt.value)
                setQuery(opt.label)
                setOpen(false)
              }
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className="w-full bg-transparent outline-none placeholder:text-[var(--ds-fg-muted)]"
        />
        {loading ? (
          <Loader2 size={14} className="shrink-0 animate-[spin_720ms_linear_infinite] text-[var(--ds-fg-muted)]" />
        ) : (
          <ChevronDown size={15} aria-hidden className="shrink-0 text-[var(--ds-fg-muted)]" />
        )}
      </div>

      {open && (
        <div
          ref={popRef}
          id={`${id}-list`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[65] max-h-64 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1 shadow-e4 animate-[scale-in_140ms_cubic-bezier(0.32,0.72,0,1)_both] origin-top"
          {...inspect('Combobox · async', {
            tokens: ['--ds-surface-overlay', '--shadow-e4'],
            why: 'The spinner replaces the chevron in place rather than appearing beside it, so the control never reflows mid-typing. Keep the previous results visible while loading — blanking the list on every keystroke makes the UI feel broken on a slow connection.',
            a11y: 'aria-autocomplete="list" plus aria-activedescendant: focus never leaves the input, so the user can keep typing while arrowing through suggestions. Result count belongs in an aria-live region.',
          })}
        >
          {loading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
              Searching…
            </p>
          )}
          {!loading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
              {emptyText}
            </p>
          )}
          {results.map((o, i) => (
            <div
              key={o.value}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={o.value === value}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => {
                onChange(o.value)
                setQuery(o.label)
                setOpen(false)
              }}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5',
                i === activeIdx && 'bg-[var(--ds-layer-hover)]',
              )}
            >
              {o.icon && <span className="shrink-0 text-[var(--ds-fg-muted)]">{o.icon}</span>}
              <span className="flex min-w-0 flex-1 flex-col">
                <Highlight text={o.label} query={query} />
                {o.description && (
                  <span className="truncate text-caption text-[var(--ds-fg-muted)]">
                    {o.description}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Bolds the matched substring — turns scanning into recognition. */
export function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <span className="truncate text-label text-[var(--ds-fg)]">{text}</span>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span className="truncate text-label text-[var(--ds-fg)]">{text}</span>
  return (
    <span className="truncate text-label text-[var(--ds-fg-secondary)]">
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-[var(--ds-fg)]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  )
}
