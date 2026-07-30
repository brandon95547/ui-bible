import * as React from 'react'
import { BookMarked, ChevronRight, Command, Search, SearchX, Star, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePersistentState } from '@/lib/hooks'
import { Kbd } from '@/ui/Display'
import { iconByName } from '@/app/icons'
import { NAV, PAGE_BY_ID, searchPages } from '@/docs/nav'
import { IMPLEMENTED } from '@/docs/registry'

const MIN_W = 208
const MAX_W = 400
const DEFAULT_W = 268

function GroupIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Cmp = iconByName(name)
  return <Cmp size={size} />
}

export function Sidebar({
  currentId,
  onNavigate,
  favorites,
  onToggleFavorite,
  onOpenPalette,
}: {
  currentId: string
  onNavigate: (id: string) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onOpenPalette: () => void
}) {
  const [width, setWidth] = usePersistentState('uib:sidebar-width', DEFAULT_W)
  const [collapsedGroups, setCollapsedGroups] = usePersistentState<string[]>(
    'uib:collapsed-groups',
    [],
  )
  const [query, setQuery] = React.useState('')
  const [dragging, setDragging] = React.useState(false)
  const navRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  /* ---- resize ---------------------------------------------------------- */
  React.useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      setWidth(Math.min(MAX_W, Math.max(MIN_W, e.clientX)))
    }
    const onUp = () => setDragging(false)
    document.body.classList.add('is-resizing')
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      document.body.classList.remove('is-resizing')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, setWidth])

  /* ---- filtering ------------------------------------------------------- */
  const hits = React.useMemo(() => (query ? searchPages(query) : null), [query])
  const matchedIds = React.useMemo(
    () => (hits ? new Set(hits.map((h) => h.page.id)) : null),
    [hits],
  )

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    )

  /* ---- roving keyboard navigation -------------------------------------- */
  const onNavKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const items = Array.from(
      navRef.current?.querySelectorAll<HTMLElement>('[data-nav-item]') ?? [],
    )
    const idx = items.indexOf(document.activeElement as HTMLElement)
    if (idx === -1) return
    e.preventDefault()
    const next = e.key === 'ArrowDown' ? Math.min(items.length - 1, idx + 1) : Math.max(0, idx - 1)
    items[next]?.focus()
  }

  const favPages = favorites.map((id) => PAGE_BY_ID.get(id)).filter(Boolean)

  return (
    <aside
      style={{ width }}
      className="relative z-40 flex h-dvh shrink-0 flex-col border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]"
    >
      {/* ---- BRAND --------------------------------------------------------- */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--ds-border-subtle)] px-4">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex min-w-0 items-center gap-2.5 rounded-[var(--radius-md)] py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--p-brand-400)] to-[var(--p-brand-700)] text-white shadow-e1"
          >
            <BookMarked size={15} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-label font-semibold leading-tight text-[var(--ds-fg)]">
              UI Bible
            </span>
            <span className="truncate text-[10px] leading-tight text-[var(--ds-fg-muted)]">
              v1.0 · Design System
            </span>
          </span>
        </button>
      </div>

      {/* ---- SEARCH -------------------------------------------------------- */}
      <div className="shrink-0 p-2.5">
        <div className="group relative">
          <Search
            size={14}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ds-fg-muted)]"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('')
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                navRef.current?.querySelector<HTMLElement>('[data-nav-item]')?.focus()
              }
              if (e.key === 'Enter' && hits?.length) onNavigate(hits[0].page.id)
            }}
            placeholder="Search components…"
            aria-label="Search components"
            className={cn(
              'h-8 w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]',
              'pl-8 pr-14 text-body-sm text-[var(--ds-fg)] placeholder:text-[var(--ds-fg-muted)]',
              'transition-[border-color,box-shadow] duration-[120ms]',
              'focus:border-[var(--ds-accent)] focus:shadow-[0_0_0_3px_var(--ds-accent-subtle)] focus:outline-none',
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
            >
              <X size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenPalette}
              aria-label="Open command palette"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <Kbd className="pointer-events-none">⌘K</Kbd>
            </button>
          )}
        </div>
      </div>

      {/* ---- NAV ----------------------------------------------------------- */}
      <nav
        ref={navRef}
        onKeyDown={onNavKeyDown}
        aria-label="Documentation"
        className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4"
      >
        {hits && (
          <p className="px-2 py-2 text-caption text-[var(--ds-fg-muted)]">
            {hits.length} {hits.length === 1 ? 'result' : 'results'}
          </p>
        )}

        {!hits && favPages.length > 0 && (
          <NavGroupBlock
            title="Favourites"
            icon="Star"
            collapsed={collapsedGroups.includes('__fav')}
            onToggle={() => toggleGroup('__fav')}
            count={favPages.length}
          >
            {favPages.map((p) => (
              <NavRow
                key={p!.id}
                page={p!}
                active={currentId === p!.id}
                onNavigate={onNavigate}
                favorite
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </NavGroupBlock>
        )}

        {NAV.map((group) => {
          const pages = matchedIds
            ? group.pages.filter((p) => matchedIds.has(p.id))
            : group.pages
          if (pages.length === 0) return null
          const collapsed = !hits && collapsedGroups.includes(group.id)
          return (
            <NavGroupBlock
              key={group.id}
              title={group.title}
              icon={group.icon}
              collapsed={collapsed}
              onToggle={() => toggleGroup(group.id)}
              count={group.pages.length}
            >
              {pages.map((p) => (
                <NavRow
                  key={p.id}
                  page={p}
                  active={currentId === p.id}
                  onNavigate={onNavigate}
                  favorite={favorites.includes(p.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </NavGroupBlock>
          )
        })}

        {hits?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <SearchX size={20} className="text-[var(--ds-fg-disabled)]" />
            <p className="text-caption text-[var(--ds-fg-muted)]">
              Nothing matches “{query}”.
            </p>
          </div>
        )}
      </nav>

      {/* ---- FOOTER --------------------------------------------------------- */}
      <div className="shrink-0 border-t border-[var(--ds-border-subtle)] px-2.5 py-2">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-caption text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
        >
          <Command size={13} />
          <span className="flex-1 text-left">Command palette</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      {/* ---- RESIZE HANDLE --------------------------------------------------- */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuenow={width}
        aria-valuemin={MIN_W}
        aria-valuemax={MAX_W}
        tabIndex={0}
        data-dragging={dragging}
        onPointerDown={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDoubleClick={() => setWidth(DEFAULT_W)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setWidth((w) => Math.max(MIN_W, w - 16))
          if (e.key === 'ArrowRight') setWidth((w) => Math.min(MAX_W, w + 16))
          if (e.key === 'Home') setWidth(DEFAULT_W)
        }}
        className="resize-handle"
      />
    </aside>
  )
}

function NavGroupBlock({
  title,
  icon,
  collapsed,
  onToggle,
  count,
  children,
}: {
  title: string
  icon: string
  collapsed: boolean
  onToggle: () => void
  count: number
  children: React.ReactNode
}) {
  const id = `group-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={id}
        className="group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
      >
        <ChevronRight
          size={12}
          aria-hidden
          className={cn(
            'shrink-0 text-[var(--ds-fg-disabled)] transition-transform duration-[160ms] ease-[cubic-bezier(0.2,0,0,1)]',
            !collapsed && 'rotate-90',
          )}
        />
        <span className="shrink-0 text-[var(--ds-fg-muted)]">
          <GroupIcon name={icon} size={13} />
        </span>
        <span className="flex-1 truncate text-overline uppercase text-[var(--ds-fg-secondary)]">
          {title}
        </span>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--ds-fg-disabled)]">
          {count}
        </span>
      </button>
      <div
        id={id}
        hidden={collapsed}
        className="mt-0.5 flex flex-col gap-px pl-[13px]"
        style={{ borderLeft: '1px solid var(--ds-border-subtle)', marginLeft: '13px' }}
      >
        {children}
      </div>
    </div>
  )
}

function NavRow({
  page,
  active,
  onNavigate,
  favorite,
  onToggleFavorite,
}: {
  page: { id: string; title: string }
  active: boolean
  onNavigate: (id: string) => void
  favorite: boolean
  onToggleFavorite: (id: string) => void
}) {
  const implemented = IMPLEMENTED.has(page.id)
  return (
    <div className="group/row relative flex items-center">
      <button
        data-nav-item
        type="button"
        onClick={() => onNavigate(page.id)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex h-7 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] pl-2.5 pr-7 text-left',
          'transition-[background-color,color] duration-[100ms]',
          'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
          active
            ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-fg)]'
            : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute -left-[14px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--ds-accent)]"
          />
        )}
        <span className={cn('truncate text-label-sm', active && 'font-medium')}>{page.title}</span>
        {!implemented && (
          <span
            title="Not yet written"
            className="ml-auto shrink-0 rounded-full bg-[var(--ds-layer-active)] px-1.5 text-[9px] uppercase text-[var(--ds-fg-muted)]"
          >
            soon
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onToggleFavorite(page.id)}
        aria-label={favorite ? `Unfavourite ${page.title}` : `Favourite ${page.title}`}
        aria-pressed={favorite}
        className={cn(
          'absolute right-1 grid h-5 w-5 place-items-center rounded-[var(--radius-xs)] transition-all',
          favorite
            ? 'text-[var(--ds-warning)] opacity-100'
            : 'text-[var(--ds-fg-muted)] opacity-0 hover:bg-[var(--ds-layer-active)] hover:text-[var(--ds-fg)] focus-visible:opacity-100 group-hover/row:opacity-100',
        )}
      >
        <Star size={11} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
