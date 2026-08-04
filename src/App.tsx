import * as React from 'react'
import { Crosshair, FileQuestion, Menu, Moon, PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useMediaQuery, usePersistentState } from '@/lib/hooks'
import { Button, IconButton } from '@/ui/Button'
import { Tooltip } from '@/ui/Display'
import { EmptyState, ToastProvider } from '@/ui/Feedback'
import { Scrim } from '@/ui/Overlay'
import { Sidebar } from '@/app/Sidebar'
import { CommandPalette } from '@/app/CommandPalette'
import { Home } from '@/app/Home'
import { SectionOverview } from '@/app/SectionOverview'
import { InspectorProvider, useInspector } from '@/app/Inspector'
import { DocPage } from '@/docs/framework/DocPage'
import { DeviceView } from '@/docs/framework/DeviceView'
import { currentSectionId } from '@/docs/framework/anchors'
import { loadPage } from '@/docs/registry'
import { PAGE_BY_ID, neighbours, overviewSection } from '@/docs/nav'
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
    // always start at the top. Pages that arrive as their own chunk reset again
    // once their content mounts — see resetScroll in DocRoute — because this
    // frame still belongs to the loading skeleton.
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

  // A page is a lazy chunk, so the scroll reset fired at navigation time lands
  // while the skeleton is still mounted — short content, nothing to scroll —
  // and the previous offset survives into the real page. Reset once the page is
  // actually on screen, unless the URL asked for a section.
  React.useLayoutEffect(() => {
    if (state === 'loading' || currentSectionId()) return
    document.getElementById('main')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [state, id])

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
  const [route, navigateTo] = useHashRoute()
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  // The lg breakpoint, which is where the Bible itself puts this: a 268px
  // sidebar plus a readable content column needs about 1024px, and below that
  // the sidebar has to stop taking a column of its own. See Breakpoints.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  // Two different states, deliberately. Pinning is a lasting preference and is
  // remembered; the drawer is a momentary thing and is not — a nav panel that
  // restores itself open over the content on a phone is a bug, not a courtesy.
  const [sidebarPinned, setSidebarPinned] = usePersistentState('uib:sidebar-open', true)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('uib:theme', 'dark')
  const [favorites, setFavorites] = usePersistentState<string[]>('uib:favorites', [])
  const [recents, setRecents] = usePersistentState<string[]>('uib:recents', [])
  const { toggle: toggleInspector, enabled: inspecting } = useInspector()

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Growing past lg turns the drawer back into a column. Without this the panel
  // is left behind as a fixed overlay sitting on top of the page it is now
  // beside — a rotated phone or a dragged window is enough to hit it.
  React.useEffect(() => {
    if (isDesktop) setDrawerOpen(false)
  }, [isDesktop])

  const toggleNav = React.useCallback(
    () => (isDesktop ? setSidebarPinned((o) => !o) : setDrawerOpen((o) => !o)),
    [isDesktop, setSidebarPinned],
  )

  // A drawer covers what it navigates to, so choosing a destination has to close
  // it. On desktop this is already false and the call does nothing.
  const navigate = React.useCallback(
    (id: string) => {
      navigateTo(id)
      setDrawerOpen(false)
    },
    [navigateTo],
  )

  // A page change starts at the top. This has to run after the new route has
  // rendered — the frame scheduled inside navigate() belongs to the old one,
  // and React has committed nothing by then. Lazy pages reset a second time in
  // DocRoute, once their chunk has replaced the skeleton.
  React.useLayoutEffect(() => {
    if (currentSectionId()) return
    document.getElementById('main')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

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
        toggleNav()
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
  }, [toggleNav, toggleInspector])

  const toggleFavorite = React.useCallback(
    (id: string) =>
      setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])),
    [setFavorites],
  )

  const isHome = route === 'home'
  const section = overviewSection(route)
  const navOpen = isDesktop ? sidebarPinned : drawerOpen
  const navLabel = isDesktop
    ? sidebarPinned
      ? 'Hide sidebar'
      : 'Show sidebar'
    : navOpen
      ? 'Close navigation'
      : 'Open navigation'

  return (
    <div className="app-ambient flex h-dvh overflow-hidden bg-[var(--ds-canvas)]">
      <a
        href="#main"
        className="sr-only-ds focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--ds-accent)] focus:px-4 focus:py-2 focus:text-label focus:text-white"
      >
        Skip to content
      </a>

      {drawerOpen && !isDesktop && <Scrim onClick={() => setDrawerOpen(false)} />}

      {navOpen && (
        <Sidebar
          variant={isDesktop ? 'inline' : 'drawer'}
          onClose={() => setDrawerOpen(false)}
          currentId={route}
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpenPalette={() => setPaletteOpen(true)}
        />
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]/80 px-3 backdrop-blur-xl">
          {/* One control, two jobs. On desktop it pins and unpins a column; below
              lg it opens and closes an overlay, which is a hamburger and should
              look like one. The shortcut hint is dropped where there is no
              keyboard to press it with. */}
          <Tooltip content={navLabel} shortcut={isDesktop ? '⌘B' : undefined}>
            <IconButton
              label={navLabel}
              icon={
                isDesktop ? sidebarPinned ? <PanelLeftClose /> : <PanelLeftOpen /> : <Menu />
              }
              size="sm"
              aria-expanded={navOpen}
              onClick={toggleNav}
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
          ) : section ? (
            <SectionOverview key={route} section={section} onNavigate={navigate} />
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
  const [route] = useHashRoute()

  // A device window loads the same bundle at its own address and renders one
  // preview, without the shell around it — the whole point is that its viewport
  // belongs to the component and nothing else.
  const device = route === 'device' || route.startsWith('device/')

  return (
    <InspectorProvider>
      <ToastProvider>{device ? <DeviceView route={route} /> : <Shell />}</ToastProvider>
    </InspectorProvider>
  )
}
