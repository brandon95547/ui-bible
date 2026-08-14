import * as React from 'react'
import { BookMarked, ChevronRight, Command, LayoutList, Search, SearchX, Star, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useFocusTrap, usePersistentState } from '@/lib/hooks'
import { IconButton } from '@/ui/Button'
import { Kbd } from '@/ui/Display'
import { iconByName } from '@/app/icons'
import { NAV, PAGE_BY_ID, searchPages, type NavPage } from '@/docs/nav'
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
  variant = 'inline',
  onClose,
}: {
  currentId: string
  onNavigate: (id: string) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onOpenPalette: () => void
  /**
   * `inline` is the permanent column. `drawer` is what it becomes below lg,
   * where there is no room for a column: the same tree, lifted out of the
   * layout onto a scrim, modal for as long as it is open.
   */
  variant?: 'inline' | 'drawer'
  onClose?: () => void
}) {
  const isDrawer = variant === 'drawer'
  const panelRef = React.useRef<HTMLElement>(null)
  const [width, setWidth] = usePersistentState('uib:sidebar-width', DEFAULT_W)
  // Section and group ids share one store but are namespaced, so a group named
  // "actions" can never open the section that happens to share its id.
  //
  // Storing what is *open* rather than what is closed is what makes the tree
  // start collapsed: sixty rows unfurled on first paint is a wall, not a menu.
  // Search still forces everything open, so nothing is ever hidden from a hit.
  const [expanded, setExpanded] = usePersistentState<string[]>('uib:expanded-nodes', [])
  const [query, setQuery] = React.useState('')
  const [dragging, setDragging] = React.useState(false)
  const navRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  // A modal panel keeps the keyboard inside it and hands focus back on close.
  useFocusTrap(isDrawer, panelRef)

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

  const isOpen = (key: string) => expanded.includes(key)
  const toggle = (key: string) =>
    setExpanded((prev) => (prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]))

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

  /** A group renders only the pages that survived the current search. */
  const visible = (pages: NavPage[]) =>
    matchedIds ? pages.filter((p) => matchedIds.has(p.id)) : pages

  const renderRows = (pages: NavPage[]) =>
    pages.map((p) => (
      <NavRow
        key={p.id}
        page={p}
        active={currentId === p.id}
        onNavigate={onNavigate}
        favorite={favorites.includes(p.id)}
        onToggleFavorite={onToggleFavorite}
      />
    ))

  return (
    <aside
      ref={panelRef}
      // Width is a desktop affordance. As a drawer it is sized to the viewport
      // instead, always leaving a strip of the page visible so it reads as a
      // panel over the content rather than as a new screen.
      style={isDrawer ? undefined : { width }}
      role={isDrawer ? 'dialog' : undefined}
      aria-modal={isDrawer || undefined}
      aria-label={isDrawer ? 'Documentation navigation' : undefined}
      tabIndex={isDrawer ? -1 : undefined}
      onKeyDown={(e) => {
        // Only after the search box has had its turn — see the input below.
        if (isDrawer && e.key === 'Escape') onClose?.()
      }}
      className={cn(
        'relative z-40 flex h-dvh shrink-0 flex-col border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        isDrawer &&
          'fixed inset-y-0 left-0 z-[75] w-[min(19rem,calc(100vw-3rem))] shadow-e5 outline-none animate-[drawer-in-left_260ms_cubic-bezier(0.32,0.72,0,1)_both]',
      )}
    >
      {/* ---- BRAND --------------------------------------------------------- */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--ds-border-subtle)] px-2.5">
        {/* A real anchor, not a button: the brand is navigation, so ⌘-click and
            middle-click have to open home in a new tab like any other link. */}
        <a
          href="#"
          aria-label="UI Bible — home"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('home')
          }}
          className="flex min-w-0 items-center gap-2.5 rounded-[var(--radius-md)] px-1.5 py-1 text-left transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
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
        </a>

        {/* A modal surface needs a visible way out that is not a gesture. The
            header's own toggle is behind the scrim once the drawer is open. */}
        {isDrawer && (
          <IconButton
            label="Close navigation"
            icon={<X />}
            size="sm"
            variant="text"
            onClick={onClose}
            className="ml-auto"
          />
        )}
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
              if (e.key === 'Escape' && query) {
                // Clearing a filter and closing the panel are two different
                // intentions, and Escape means the nearer one first.
                e.stopPropagation()
                setQuery('')
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                navRef.current?.querySelector<HTMLElement>('[data-nav-item]')?.focus()
              }
              if (e.key === 'Enter' && hits?.length) onNavigate(hits[0].page.id)
            }}
            placeholder="Search components…"
            aria-label="Search components"
            className={cn(
              // A field, not a well. This input sits on the nav column's own
              // --ds-surface; on the well token it was darker than the panel
              // holding it and read as switched off.
              'h-8 w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-field)]',
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
          <TreeNode
            title="Favourites"
            icon="Star"
            depth={0}
            open={isOpen('sec:__fav')}
            onToggle={() => toggle('sec:__fav')}
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
          </TreeNode>
        )}

        {NAV.map((section) => {
          const total = section.groups
            ? section.groups.reduce((n, g) => n + g.pages.length, 0)
            : (section.pages?.length ?? 0)

          // Search collapses the two levels: only groups with surviving pages
          // render, and every section is forced open so hits are never hidden.
          const groups = section.groups
            ? section.groups
                .map((g) => ({ ...g, pages: visible(g.pages) }))
                .filter((g) => g.pages.length > 0)
            : []
          const pages = section.pages ? visible(section.pages) : []
          if (groups.length === 0 && pages.length === 0) return null

          return (
            <TreeNode
              key={section.id}
              title={section.title}
              icon={section.icon}
              depth={0}
              open={hits ? true : isOpen(`sec:${section.id}`)}
              onToggle={() => toggle(`sec:${section.id}`)}
              count={total}
            >
              {/* Hidden while searching: it is a way in, not a result. */}
              {!hits && section.overview && (
                <OverviewRow
                  section={section.title}
                  active={currentId === section.id}
                  onClick={() => onNavigate(section.id)}
                />
              )}
              {section.groups
                ? groups.map((g) => (
                    <TreeNode
                      key={g.id}
                      title={g.title}
                      icon={g.icon}
                      depth={1}
                      open={hits ? true : isOpen(`grp:${g.id}`)}
                      onToggle={() => toggle(`grp:${g.id}`)}
                      count={
                        section.groups!.find((s) => s.id === g.id)?.pages.length ?? g.pages.length
                      }
                    >
                      {renderRows(g.pages)}
                    </TreeNode>
                  ))
                : renderRows(pages)}
            </TreeNode>
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
      {/* Nothing to resize as a drawer: its width comes from the viewport. The
          same handle is hidden on coarse pointers in CSS, where a 9px
          col-resize target is not a target at all. */}
      {!isDrawer && (
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
      )}
    </aside>
  )
}

/**
 * One node for both levels. A section (depth 0) shouts in overline caps; a
 * group (depth 1) speaks in sentence case at label size. Two levels is the
 * limit — a third would need a third visual weight, and there is no third
 * weight left before the rows themselves.
 */
function TreeNode({
  title,
  icon,
  depth,
  open,
  onToggle,
  count,
  children,
}: {
  title: string
  icon: string
  depth: 0 | 1
  open: boolean
  onToggle: () => void
  count: number
  children: React.ReactNode
}) {
  const id = `node-${depth}-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className={depth === 0 ? 'mb-1' : 'mb-0.5'}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={cn(
          'nav-row group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 text-left transition-colors',
          'hover:bg-[var(--ds-layer-hover)]',
          'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
          depth === 0 ? 'py-1.5' : 'py-1',
        )}
      >
        <ChevronRight
          size={12}
          aria-hidden
          className={cn(
            'shrink-0 text-[var(--ds-fg-disabled)] transition-transform duration-[160ms] ease-[cubic-bezier(0.2,0,0,1)]',
            open && 'rotate-90',
          )}
        />
        <span className="shrink-0 text-[var(--ds-fg-muted)]">
          <GroupIcon name={icon} size={depth === 0 ? 13 : 12} />
        </span>
        <span
          className={cn(
            'flex-1 truncate',
            depth === 0
              ? 'text-overline uppercase text-[var(--ds-fg)]'
              : 'text-label-sm text-[var(--ds-fg-secondary)]',
          )}
        >
          {title}
        </span>
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-[var(--ds-fg-disabled)]">
          {count}
        </span>
      </button>
      <div
        id={id}
        hidden={!open}
        className="mt-0.5 flex flex-col gap-px pl-[13px]"
        style={{ borderLeft: '1px solid var(--ds-border-subtle)', marginLeft: '13px' }}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * The section's own index, pinned above its first page. Shares NavRow's height
 * and active treatment so the section reads as one list, but is italicised and
 * carries no favourite star — it is a destination, not a page of the standard.
 */
function OverviewRow({
  section,
  active,
  onClick,
}: {
  section: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      data-nav-item
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={`${section} overview`}
      className={cn(
        'nav-row relative flex h-7 min-w-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 text-left',
        'transition-[background-color,color] duration-[100ms]',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
        active
          ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-fg)]'
          : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-[14px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-[var(--ds-accent)]"
        />
      )}
      <LayoutList size={11} aria-hidden className="shrink-0" />
      <span className={cn('truncate text-label-sm italic', active && 'font-medium')}>Overview</span>
    </button>
  )
}

function NavRow({
  page,
  active,
  onNavigate,
  favorite,
  onToggleFavorite,
}: {
  page: NavPage
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
        title={page.aliases?.length ? `Also called ${page.aliases.join(', ')}` : undefined}
        className={cn(
          'nav-row relative flex h-7 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-sm)] pl-2.5 pr-7 text-left',
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
