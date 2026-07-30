import * as React from 'react'
import { Crosshair, FileQuestion, Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePersistentState } from '@/lib/hooks'
import { Button, IconButton } from '@/ui/Button'
import { Tooltip } from '@/ui/Display'
import { EmptyState, ToastProvider } from '@/ui/Feedback'
import { Sidebar } from '@/app/Sidebar'
import { CommandPalette } from '@/app/CommandPalette'
import { Home } from '@/app/Home'
import { InspectorProvider, useInspector } from '@/app/Inspector'
import { DocPage } from '@/docs/framework/DocPage'
import { loadPage } from '@/docs/registry'
import { PAGE_BY_ID, neighbours } from '@/docs/nav'
import type { DocSpec } from '@/docs/framework/types'

/* ===========================================================================
   ROUTING
   Hash routing, deliberately. It survives being opened from a static bucket,
   an intranet path, or any host with no rewrite rules — which is every place
   an internal design system actually gets deployed.
   ======================================================================== */

function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('#')[0] || 'home'
  const [route, setRoute] = React.useState(read)

  React.useEffect(() => {
    const onHash = () => setRoute(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = React.useCallback((id: string) => {
    window.location.hash = id === 'home' ? '' : `/${id}`
    // Anchor jumps inside a page are the browser's job; a page *change* should
    // always start at the top.
    requestAnimationFrame(() => {
      document.getElementById('main')?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }, [])

  return [route, navigate] as const
}

/* ===========================================================================
   PAGE LOADER
   ======================================================================== */

function DocRoute({
  id,
  onNavigate,
  favorites,
  onToggleFavorite,
}: {
  id: string
  onNavigate: (id: string) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
}) {
  const [spec, setSpec] = React.useState<DocSpec | null>(null)
  const [state, setState] = React.useState<'loading' | 'ready' | 'missing'>('loading')

  React.useEffect(() => {
    let cancelled = false
    setState('loading')
    setSpec(null)
    const loader = loadPage(id)
    if (!loader) {
      setState('missing')
      return
    }
    loader()
      .then((m) => {
        if (cancelled) return
        setSpec(m.default)
        setState('ready')
      })
      .catch((err) => {
        console.error(`Failed to load page "${id}"`, err)
        if (!cancelled) setState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const meta = PAGE_BY_ID.get(id)
  const { prev, next } = neighbours(id)

  if (state === 'loading') {
    return (
      <div className="mx-auto flex max-w-[64rem] flex-col gap-6 px-6 pt-10 sm:px-10">
        <div className="h-3 w-40 animate-pulse rounded-full bg-[var(--ds-layer-active)]" />
        <div className="h-9 w-80 max-w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />
        <div className="h-4 w-[34rem] max-w-full animate-pulse rounded-full bg-[var(--ds-layer-active)]" />
        <div className="mt-6 h-56 animate-pulse rounded-[var(--radius-xl)] bg-[var(--ds-layer-active)]" />
        <div className="h-40 animate-pulse rounded-[var(--radius-xl)] bg-[var(--ds-layer-active)]" />
      </div>
    )
  }

  if (state === 'missing' || !spec) {
    return (
      <div className="mx-auto max-w-[48rem] px-6 pt-20 sm:px-10">
        <EmptyState
          icon={<FileQuestion size={22} />}
          title={meta ? `“${meta.title}” has not been written yet` : 'Page not found'}
          description={
            meta
              ? `${meta.blurb} Every entry in the sidebar is part of the standard; the ones marked “soon” are queued rather than abandoned.`
              : 'That address does not match any page in the Bible.'
          }
          action={<Button onClick={() => onNavigate('home')}>Back to contents</Button>}
          secondaryAction={
            next ? (
              <Button variant="text" onClick={() => onNavigate(next.id)}>
                Go to {next.title}
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="px-6 sm:px-10">
      <DocPage
        spec={spec}
        onNavigate={onNavigate}
        isFavorite={favorites.includes(id)}
        onToggleFavorite={() => onToggleFavorite(id)}
        prev={prev ? { id: prev.id, title: prev.title } : undefined}
        next={next ? { id: next.id, title: next.title } : undefined}
      />
    </div>
  )
}

/* ===========================================================================
   SHELL
   ======================================================================== */

function Shell() {
  const [route, navigate] = useHashRoute()
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = usePersistentState('uib:sidebar-open', true)
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('uib:theme', 'dark')
  const [favorites, setFavorites] = usePersistentState<string[]>('uib:favorites', [])
  const [recents, setRecents] = usePersistentState<string[]>('uib:recents', [])
  const { toggle: toggleInspector, enabled: inspecting } = useInspector()

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  React.useEffect(() => {
    if (route === 'home' || !PAGE_BY_ID.has(route)) return
    setRecents((prev) => [route, ...prev.filter((r) => r !== route)].slice(0, 8))
  }, [route, setRecents])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      } else if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarOpen((o) => !o)
      } else if (mod && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        toggleInspector()
      } else if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSidebarOpen, toggleInspector])

  const toggleFavorite = React.useCallback(
    (id: string) =>
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    [setFavorites],
  )

  const isHome = route === 'home'

  return (
    <div className="app-ambient flex h-dvh overflow-hidden bg-[var(--ds-canvas)]">
      <a
        href="#main"
        className="sr-only-ds focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--ds-accent)] focus:px-4 focus:py-2 focus:text-label focus:text-white"
      >
        Skip to content
      </a>

      {sidebarOpen && (
        <Sidebar
          currentId={route}
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]/80 px-3 backdrop-blur-xl">
          <Tooltip content={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'} shortcut="⌘B">
            <IconButton
              label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              icon={sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
              size="sm"
              onClick={() => setSidebarOpen((o) => !o)}
            />
          </Tooltip>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              'ml-1 flex h-8 min-w-0 max-w-md flex-1 items-center gap-2 rounded-[var(--radius-md)]',
              'border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2.5',
              'text-caption text-[var(--ds-fg-muted)] transition-colors',
              'hover:border-[var(--ds-border)] hover:text-[var(--ds-fg-secondary)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
            )}
          >
            <span className="flex-1 truncate text-left">Search pages, tokens and rules…</span>
            <span className="shrink-0 rounded-[5px] border border-b-2 border-[var(--ds-border)] bg-[var(--ds-surface-raised)] px-1.5 text-[11px] leading-[17px] text-[var(--ds-fg-secondary)]">
              ⌘K
            </span>
          </button>

          <span className="ml-auto flex items-center gap-1">
            <Tooltip content="Inspector Mode" shortcut="⌘I">
              <IconButton
                label="Toggle inspector mode"
                icon={<Crosshair />}
                size="sm"
                variant={inspecting ? 'tonal' : 'text'}
                onClick={toggleInspector}
              />
            </Tooltip>
            <Tooltip content={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
              <IconButton
                label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                icon={theme === 'dark' ? <Sun /> : <Moon />}
                size="sm"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              />
            </Tooltip>
          </span>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto focus-visible:outline-none"
        >
          {isHome ? (
            <Home onNavigate={navigate} onOpenPalette={() => setPaletteOpen(true)} />
          ) : (
            <DocRoute
              key={route}
              id={route}
              onNavigate={navigate}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={navigate}
        favorites={favorites}
        recents={recents}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onToggleInspector={toggleInspector}
      />
    </div>
  )
}

function isTypingTarget(t: EventTarget | null) {
  const el = t as HTMLElement | null
  if (!el) return false
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.tagName === 'SELECT' ||
    el.isContentEditable
  )
}

export default function App() {
  return (
    <InspectorProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </InspectorProvider>
  )
}
