import * as React from 'react'
import { ChevronRight, MoreHorizontal, ChevronLeft, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { CountBadge } from './Display'

/* ===========================================================================
   TABS
   Peer views of the same object. Never a wizard, never a filter, never
   navigation between unrelated destinations.
   ======================================================================== */

export interface TabSpec {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
}

export function Tabs({
  tabs,
  value,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth,
  className,
  'aria-label': ariaLabel,
}: {
  tabs: TabSpec[]
  value: string
  onChange: (v: string) => void
  variant?: 'underline' | 'pill' | 'enclosed'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
  'aria-label'?: string
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const idx = tabs.findIndex((t) => t.value === value)

  const move = (dir: 1 | -1) => {
    let next = idx
    for (let i = 0; i < tabs.length; i++) {
      next = (next + dir + tabs.length) % tabs.length
      if (!tabs[next].disabled) break
    }
    onChange(tabs[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          move(1)
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          move(-1)
        } else if (e.key === 'Home') {
          e.preventDefault()
          onChange(tabs[0].value)
        } else if (e.key === 'End') {
          e.preventDefault()
          onChange(tabs[tabs.length - 1].value)
        }
      }}
      className={cn(
        'flex items-center',
        variant === 'underline' && 'gap-1 border-b border-[var(--ds-border-subtle)]',
        variant === 'pill' &&
          'gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-1',
        variant === 'enclosed' && 'gap-0.5',
        fullWidth && 'w-full',
        className,
      )}
      {...inspect(`Tabs · ${variant}`, {
        tokens: ['--ds-accent', '--ds-fg-muted', '--text-label', '--ease-emphasized'],
        why: 'The underline is 2px and sits on the container border, so the active tab visually breaks the line — the tab and its panel become one continuous surface. Inactive labels are muted, not merely lighter-weight; weight changes cause the row to reflow as you switch.',
        a11y: 'Roving tabindex: only the active tab is tabbable, arrow keys move between tabs, Tab jumps straight into the panel. Every panel needs aria-labelledby pointing back at its tab.',
      })}
    >
      {tabs.map((t, i) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            ref={(n) => {
              refs.current[i] = n
            }}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`panel-${t.value}`}
            id={`tab-${t.value}`}
            tabIndex={active ? 0 : -1}
            disabled={t.disabled}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
              'transition-colors duration-[140ms] ease-[cubic-bezier(0.2,0,0,1)]',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
              'disabled:pointer-events-none disabled:opacity-40',
              size === 'sm' ? 'h-8 px-2.5 text-label-sm' : 'h-9 px-3 text-label',
              fullWidth && 'flex-1',

              variant === 'underline' &&
                cn(
                  '-mb-px rounded-t-[var(--radius-sm)] border-b-2',
                  active
                    ? 'border-[var(--ds-accent)] text-[var(--ds-fg)]'
                    : 'border-transparent text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg-secondary)]',
                ),

              variant === 'pill' &&
                cn(
                  'rounded-[var(--radius-md)]',
                  active
                    ? 'bg-[var(--ds-surface-raised)] text-[var(--ds-fg)] shadow-e1'
                    : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg-secondary)]',
                ),

              variant === 'enclosed' &&
                cn(
                  'rounded-t-[var(--radius-md)] border border-b-0',
                  active
                    ? 'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg)]'
                    : 'border-transparent text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)]',
                ),
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <CountBadge count={t.count} tone={active ? 'accent' : 'neutral'} />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  value,
  active,
  children,
  className,
}: {
  value: string
  active: boolean
  children: React.ReactNode
  className?: string
}) {
  if (!active) return null
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn('animate-[fade-in_160ms_ease-out_both] focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}

/* ===========================================================================
   BREADCRUMBS
   ======================================================================== */

export interface Crumb {
  label: string
  href?: string
  onClick?: () => void
  icon?: React.ReactNode
}

export function Breadcrumbs({
  items,
  maxItems = 4,
  className,
}: {
  items: Crumb[]
  maxItems?: number
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(false)
  const collapsed = !expanded && items.length > maxItems

  // Always keep the first and the last two — the root anchors you, the tail
  // tells you where you are. The middle is the least useful part of the path.
  const shown: (Crumb | 'ellipsis')[] = collapsed
    ? [items[0], 'ellipsis', ...items.slice(-2)]
    : items

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex min-w-0 items-center', className)}
      {...inspect('Breadcrumbs', {
        tokens: ['--text-caption', '--ds-fg-muted', '--ds-fg'],
        why: 'Every crumb except the last is a link and muted; the last is the current page, full-contrast, and not a link. Collapsing the middle keeps the row on one line — a wrapping breadcrumb reads as body text and stops working as a location indicator.',
        a11y: 'nav[aria-label="Breadcrumb"] > ol. The current page carries aria-current="page". Separators are aria-hidden so they are not read as "greater than" between every level.',
      })}
    >
      <ol className="flex min-w-0 items-center gap-1">
        {shown.map((item, i) => {
          const isLast = i === shown.length - 1
          if (item === 'ellipsis') {
            return (
              <li key="ellipsis" className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-label="Show all breadcrumb levels"
                  className="grid h-5 w-5 place-items-center rounded-[var(--radius-xs)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
                >
                  <MoreHorizontal size={14} />
                </button>
                <ChevronRight size={13} aria-hidden className="text-[var(--ds-fg-disabled)]" />
              </li>
            )
          }
          return (
            <li key={item.label} className="flex min-w-0 items-center gap-1">
              {isLast ? (
                <span
                  aria-current="page"
                  className="truncate text-caption font-medium text-[var(--ds-fg)]"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <a
                    href={item.href ?? '#'}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault()
                        item.onClick()
                      }
                    }}
                    className="flex items-center gap-1 truncate rounded-[var(--radius-xs)] text-caption text-[var(--ds-fg-muted)] transition-colors hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
                  >
                    {item.icon}
                    {item.label}
                  </a>
                  <ChevronRight size={13} aria-hidden className="shrink-0 text-[var(--ds-fg-disabled)]" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ===========================================================================
   PAGINATION
   ======================================================================== */

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  totalItems,
  pageSize,
  className,
}: {
  page: number
  pageCount: number
  onPageChange: (p: number) => void
  siblings?: number
  totalItems?: number
  pageSize?: number
  className?: string
}) {
  const pages = React.useMemo(() => {
    const out: (number | 'gap')[] = []
    const start = Math.max(2, page - siblings)
    const end = Math.min(pageCount - 1, page + siblings)
    out.push(1)
    if (start > 2) out.push('gap')
    for (let i = start; i <= end; i++) out.push(i)
    if (end < pageCount - 1) out.push('gap')
    if (pageCount > 1) out.push(pageCount)
    return out
  }, [page, pageCount, siblings])

  const from = pageSize ? (page - 1) * pageSize + 1 : null
  const to = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : null

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
      {...inspect('Pagination', {
        tokens: ['--radius-md', '--ds-accent', '--ds-fg-muted'],
        why: 'The page-number row never changes width as you move through it: first, last, and a fixed window of siblings, with the gaps held by ellipses. A row that reflows makes the user re-find the Next button on every click.',
        a11y: 'nav[aria-label="Pagination"]; the current page uses aria-current="page". Prev/Next need real labels — an arrow glyph alone announces as “button”.',
      })}
    >
      {totalItems !== null && from && to && (
        <p data-tabular className="text-caption tabular-nums text-[var(--ds-fg-muted)]">
          Showing <span className="text-[var(--ds-fg-secondary)]">{from}–{to}</span> of{' '}
          <span className="text-[var(--ds-fg-secondary)]">{totalItems}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <PageBtn
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          label="Previous page"
        >
          <ChevronLeft size={15} />
        </PageBtn>
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="grid h-8 w-8 place-items-center text-[var(--ds-fg-disabled)]"
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              active={p === page}
              onClick={() => onPageChange(p)}
              label={`Page ${p}`}
              current={p === page}
            >
              {p}
            </PageBtn>
          ),
        )}
        <PageBtn
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          label="Next page"
        >
          <ChevronRight size={15} />
        </PageBtn>
      </div>
    </nav>
  )
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  label,
  current,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  label: string
  current?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'grid h-8 min-w-8 place-items-center rounded-[var(--radius-md)] px-2 text-label tabular-nums',
        'transition-colors duration-[120ms] disabled:pointer-events-none disabled:opacity-35',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        active
          ? 'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)]'
          : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
      )}
    >
      {children}
    </button>
  )
}

/* ===========================================================================
   NAV ITEM — the shared sidebar / bottom-nav row
   ======================================================================== */

export function NavItem({
  icon,
  label,
  active,
  count,
  depth = 0,
  trailing,
  onClick,
  href,
  className,
  compact,
}: {
  icon?: React.ReactNode
  label: React.ReactNode
  active?: boolean
  count?: number
  depth?: number
  trailing?: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  compact?: boolean
}) {
  const Comp = (href ? 'a' : 'button') as React.ElementType
  return (
    <Comp
      href={href}
      type={href ? undefined : 'button'}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{ paddingLeft: `${10 + depth * 14}px` }}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-[var(--radius-md)] pr-2 text-left',
        'transition-[background-color,color] duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
        compact ? 'h-7 text-label-sm' : 'h-8 text-label',
        active
          ? 'bg-[var(--ds-layer-selected)] font-medium text-[var(--ds-fg)]'
          : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
        className,
      )}
    >
      {/* The active marker is a 2px bar, not a full-height border — a border
          would change the row's box and shift every label by a pixel. */}
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-[15px] w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--ds-accent)]"
        />
      )}
      {icon && (
        <span
          className={cn(
            'shrink-0 transition-colors',
            active ? 'text-[var(--ds-accent-text)]' : 'text-[var(--ds-fg-muted)] group-hover:text-[var(--ds-fg-secondary)]',
          )}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <CountBadge count={count} tone="neutral" />}
      {trailing}
    </Comp>
  )
}

/* ===========================================================================
   MEGA MENU — a wide, multi-column panel under a horizontal nav bar.

   The entire design problem is hover intent. Opening on contact flashes
   panels at anyone whose pointer merely crosses the bar; closing on exit
   kills the panel the moment the pointer cuts the corner on its way down
   to the thing it wants. Two asymmetric delays solve both: short to open,
   longer to close, and zero when moving between triggers whose intent has
   already been proven.
   ======================================================================== */

export interface MegaMenuColumn {
  title: string
  href?: string
  items: { label: string; description?: string; icon?: React.ReactNode; href?: string }[]
}

export interface MegaMenuGroup {
  label: string
  columns: MegaMenuColumn[]
  /** Promoted content pinned to the end of the row. */
  featured?: React.ReactNode
}

export function MegaMenu({
  groups,
  openDelay = 120,
  closeDelay = 240,
  className,
  'aria-label': ariaLabel = 'Main',
}: {
  groups: MegaMenuGroup[]
  /** Time the pointer must rest on a trigger before the panel opens. */
  openDelay?: number
  /** Grace period after the pointer leaves, so a diagonal path survives. */
  closeDelay?: number
  className?: string
  'aria-label'?: string
}) {
  const [open, setOpen] = React.useState<number | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggers = React.useRef<(HTMLButtonElement | null)[]>([])

  const clear = React.useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = undefined
  }, [])

  /* Once one panel is open the user has proven their intent, so sliding
     along the bar switches instantly. Re-paying the open delay on every
     sibling makes a menu bar feel broken. */
  const intendOpen = (i: number) => {
    clear()
    if (open !== null) {
      setOpen(i)
      return
    }
    timer.current = window.setTimeout(() => setOpen(i), openDelay)
  }

  const intendClose = () => {
    clear()
    timer.current = window.setTimeout(() => setOpen(null), closeDelay)
  }

  React.useEffect(() => clear, [clear])

  React.useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(null)
      triggers.current[open]?.focus()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      /* Tabbing out of the last link in the panel must close it. Without
         this the panel hangs open behind whatever the user moved on to. */
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null)
      }}
      {...inspect('MegaMenu', {
        tokens: ['--ds-surface-overlay', '--shadow-e4', '--ds-border'],
        why: 'Opens after 120ms of rest and closes after a 240ms grace period. The asymmetry is the whole component: the short delay stops panels flashing at a pointer that is only passing through, and the long one keeps the panel alive while the pointer travels the diagonal from the trigger to the link it wants.',
        a11y: 'Hover is an enhancement, never the only way in — every trigger is a real button that opens on click and on Enter. aria-expanded reports the state, Escape closes and returns focus to the trigger.',
      })}
    >
      <nav aria-label={ariaLabel} className="flex items-center gap-0.5">
        {groups.map((g, i) => (
          <button
            key={g.label}
            ref={(el) => {
              triggers.current[i] = el
            }}
            type="button"
            aria-expanded={open === i}
            aria-haspopup="true"
            onMouseEnter={() => intendOpen(i)}
            onMouseLeave={intendClose}
            onClick={() => setOpen((o) => (o === i ? null : i))}
            /* Focus only follows the pointer once a panel is already open,
               so Tabbing through the bar does not fire panels at a user
               who is on their way somewhere else. */
            onFocus={() => open !== null && setOpen(i)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault()
                const d = e.key === 'ArrowRight' ? 1 : -1
                triggers.current[(i + d + groups.length) % groups.length]?.focus()
              } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setOpen(i)
              }
            }}
            className={cn(
              'flex h-9 items-center gap-1 rounded-[var(--radius-md)] px-3 text-label',
              'transition-colors duration-[120ms]',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
              open === i
                ? 'bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]'
                : 'text-[var(--ds-fg-secondary)] hover:text-[var(--ds-fg)]',
            )}
          >
            {g.label}
            <ChevronDown
              size={13}
              aria-hidden
              className={cn(
                'text-[var(--ds-fg-muted)] transition-transform duration-[160ms]',
                open === i && 'rotate-180',
              )}
            />
          </button>
        ))}
      </nav>

      {open !== null && (
        <div
          /* Keeping the pointer inside the panel cancels the pending close.
             This is what makes the grace period feel like grace rather
             than a timer racing the user. */
          onMouseEnter={clear}
          onMouseLeave={intendClose}
          className={cn(
            'absolute inset-x-0 top-[calc(100%+6px)] z-[60] overflow-hidden',
            'rounded-[var(--radius-xl)] border border-[var(--ds-border)]',
            'bg-[var(--ds-surface-overlay)] p-5 shadow-e4',
            'animate-[fade-in_140ms_ease-out_both]',
          )}
        >
          <div className="flex flex-wrap gap-x-8 gap-y-6">
            {groups[open].columns.map((col) => (
              <div key={col.title} className="flex min-w-[11rem] flex-1 flex-col gap-2">
                <span className="text-overline uppercase text-[var(--ds-fg-muted)]">
                  {col.title}
                </span>
                <ul className="flex flex-col gap-0.5">
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <a
                        href={it.href ?? '#'}
                        className={cn(
                          'flex items-start gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5',
                          'transition-colors duration-[120ms] hover:bg-[var(--ds-layer-hover)]',
                          'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                        )}
                      >
                        {it.icon && (
                          <span className="mt-px shrink-0 text-[var(--ds-fg-muted)]" aria-hidden>
                            {it.icon}
                          </span>
                        )}
                        <span className="flex min-w-0 flex-col">
                          <span className="text-label text-[var(--ds-fg)]">{it.label}</span>
                          {it.description && (
                            <span className="text-caption text-[var(--ds-fg-muted)]">
                              {it.description}
                            </span>
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {groups[open].featured && (
              <div className="min-w-[13rem] flex-1 rounded-[var(--radius-lg)] bg-[var(--ds-surface-inset)] p-4">
                {groups[open].featured}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ===========================================================================
   BOTTOM NAVIGATION — mobile only, 3–5 destinations
   ======================================================================== */

export function BottomNav({
  items,
  value,
  onChange,
  className,
}: {
  items: { value: string; label: string; icon: React.ReactNode; count?: number }[]
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex items-stretch justify-around border-t border-[var(--ds-border-subtle)]',
        'bg-[var(--ds-surface)]/85 backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      {...inspect('BottomNav', {
        tokens: ['--ds-surface', '--ds-accent', '--text-overline'],
        why: '3–5 destinations, never more — a sixth item drops each target below the ~64px width where thumbs stop being accurate. Labels stay visible at all times: an icon-only bottom bar forces recognition to become recall.',
        a11y: 'Each item is 56px tall plus the safe-area inset, so it clears the home indicator on gesture-navigation phones. aria-current="page" marks the active destination.',
      })}
    >
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-w-[64px] flex-1 flex-col items-center justify-center gap-1 py-2',
              'transition-colors duration-[140ms]',
              active ? 'text-[var(--ds-accent-text)]' : 'text-[var(--ds-fg-muted)]',
            )}
          >
            <span className="relative">
              <span
                className={cn(
                  'grid h-7 w-14 place-items-center rounded-full transition-colors duration-[180ms]',
                  active && 'bg-[var(--ds-accent-subtle)]',
                )}
              >
                {it.icon}
              </span>
              {it.count ? (
                <span className="absolute -right-0.5 -top-0.5">
                  <CountBadge count={it.count} tone="danger" />
                </span>
              ) : null}
            </span>
            <span className={cn('text-overline tracking-normal', active && 'font-semibold')}>
              {it.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
