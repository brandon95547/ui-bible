import * as React from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Clock, Crosshair, CornerDownLeft, Search, Star, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useFocusTrap, useScrollLock } from '@/lib/hooks'
import { Kbd } from '@/ui/Display'
import { ALL_PAGES, PAGE_BY_ID, searchPages } from '@/docs/nav'

interface Action {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  section: string
  run: () => void
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  favorites,
  recents,
  onToggleTheme,
  onToggleInspector,
  theme,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (id: string) => void
  favorites: string[]
  recents: string[]
  onToggleTheme: () => void
  onToggleInspector: () => void
  theme: 'dark' | 'light'
}) {
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  useScrollLock(open)
  useFocusTrap(open, panelRef)

  React.useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
    }
  }, [open])

  const commands: Action[] = React.useMemo(
    () => [
      {
        id: 'cmd:theme',
        title: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
        section: 'Commands',
        run: onToggleTheme,
      },
      {
        id: 'cmd:inspect',
        title: 'Toggle Inspector Mode',
        subtitle: 'Measure any element and read the tokens behind it',
        icon: <Crosshair size={14} />,
        section: 'Commands',
        run: onToggleInspector,
      },
    ],
    [theme, onToggleTheme, onToggleInspector],
  )

  const results: Action[] = React.useMemo(() => {
    if (!query.trim()) {
      const recentActions: Action[] = recents
        .map((id) => PAGE_BY_ID.get(id))
        .filter(Boolean)
        .slice(0, 5)
        .map((p) => ({
          id: `page:${p!.id}`,
          title: p!.title,
          subtitle: p!.path,
          icon: <Clock size={14} />,
          section: 'Recent',
          run: () => onNavigate(p!.id),
        }))

      const favActions: Action[] = favorites
        .map((id) => PAGE_BY_ID.get(id))
        .filter(Boolean)
        .map((p) => ({
          id: `fav:${p!.id}`,
          title: p!.title,
          subtitle: p!.path,
          icon: <Star size={14} />,
          section: 'Favourites',
          run: () => onNavigate(p!.id),
        }))

      const browse: Action[] = ALL_PAGES.slice(0, 8).map((p) => ({
        id: `browse:${p.id}`,
        title: p.title,
        subtitle: p.path,
        icon: <ArrowRight size={14} />,
        section: 'Jump to',
        run: () => onNavigate(p.id),
      }))

      return [...recentActions, ...favActions, ...commands, ...browse]
    }

    // A hit reached through an alias says so, so the reader learns the
    // canonical name rather than searching "modal" again next week.
    const pageHits: Action[] = searchPages(query).map((h) => ({
      id: `page:${h.page.id}`,
      title: h.page.title,
      subtitle: h.via
        ? `${h.via} is called ${h.page.title} here · ${h.page.path}`
        : `${h.page.path} · ${h.page.blurb}`,
      icon: <ArrowRight size={14} />,
      section: 'Pages',
      run: () => onNavigate(h.page.id),
    }))

    const cmdHits = commands.filter((c) =>
      c.title.toLowerCase().includes(query.trim().toLowerCase()),
    )

    return [...pageHits, ...cmdHits]
  }, [query, recents, favorites, commands, onNavigate])

  React.useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, results.length - 1)))
  }, [results.length])

  React.useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const run = (a: Action) => {
    a.run()
    onClose()
  }

  // Group headings are inserted inline so the flat keyboard index stays simple.
  let lastSection = ''

  return createPortal(
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-[95] bg-[var(--ds-layer-scrim)] backdrop-blur-[2px] animate-[fade-in_120ms_ease-out_both]"
      />
      <div className="fixed inset-0 z-[96] flex items-start justify-center p-4 pt-[12vh]">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(results.length - 1, i + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(0, i - 1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              const a = results[active]
              if (a) run(a)
            } else if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
            }
          }}
          className={cn(
            'flex w-full max-w-[36rem] flex-col overflow-hidden rounded-[var(--radius-2xl)]',
            'border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]/97 shadow-e5 backdrop-blur-2xl',
            'animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both] outline-none',
          )}
        >
          <div className="flex items-center gap-3 border-b border-[var(--ds-border-subtle)] px-4">
            <Search size={16} aria-hidden className="shrink-0 text-[var(--ds-fg-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              placeholder="Search pages or run a command…"
              aria-label="Search pages or run a command"
              className="h-12 w-full bg-transparent text-body-lg text-[var(--ds-fg)] outline-none placeholder:text-[var(--ds-fg-muted)]"
            />
            <Kbd className="shrink-0">Esc</Kbd>
          </div>

          <div ref={listRef} className="max-h-[min(24rem,50vh)] overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-10 text-center text-body-sm text-[var(--ds-fg-muted)]">
                No matches for “{query}”.
              </p>
            )}
            {results.map((a, i) => {
              const header = a.section !== lastSection ? a.section : null
              lastSection = a.section
              const isActive = i === active
              return (
                <React.Fragment key={a.id}>
                  {header && (
                    <p className="px-2.5 pb-1 pt-3 text-overline uppercase text-[var(--ds-fg-muted)] first:pt-1">
                      {header}
                    </p>
                  )}
                  <button
                    type="button"
                    data-active={isActive}
                    onMouseMove={() => setActive(i)}
                    onClick={() => run(a)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-left',
                      'transition-colors duration-75',
                      isActive
                        ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                        : 'text-[var(--ds-fg-secondary)]',
                    )}
                  >
                    <span
                      className={cn(
                        'shrink-0',
                        isActive ? 'text-[var(--ds-accent-text)]' : 'text-[var(--ds-fg-muted)]',
                      )}
                    >
                      {a.icon}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-label">{a.title}</span>
                      {a.subtitle && (
                        <span className="truncate text-caption text-[var(--ds-fg-muted)]">
                          {a.subtitle}
                        </span>
                      )}
                    </span>
                    {isActive && (
                      <CornerDownLeft size={13} className="shrink-0 text-[var(--ds-fg-muted)]" />
                    )}
                  </button>
                </React.Fragment>
              )
            })}
          </div>

          <div className="flex items-center gap-4 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-4 py-2 text-caption text-[var(--ds-fg-muted)]">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd> open
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>⌘K</Kbd> toggle
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
