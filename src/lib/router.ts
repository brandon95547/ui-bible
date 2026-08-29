/* ===========================================================================
   ROUTING
   Path routing — `/button`, not `#/button`.

   This used to be a hash router, chosen so the bundle would survive being
   opened from a static bucket or any host with no rewrite rules. That
   portability was real, but it cost the whole site its search visibility: a
   fragment is never sent to the server, and every crawler since Google retired
   the `#!` scheme in 2015 treats `#/button` as the same URL as `/`. One
   hundred and four pages collapsed into one address.

   Paths cost one line of nginx (`try_files $uri $uri/ =404`, now that every
   page is prerendered to its own directory) and buy back per-page titles,
   descriptions, canonicals and a sitemap. Old `#/x` links are rewritten to
   `/x` on load — see main.tsx — so nothing that was bookmarked breaks.
   ======================================================================== */

import * as React from 'react'

/** The id the router uses for the contents page. Not a path segment. */
export const HOME = 'home'

/** `/` → 'home', `/button` → 'button', `/device/button/anatomy` → 'device/button/anatomy'. */
export function pathToRoute(pathname: string) {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '')
  return trimmed || HOME
}

/** The inverse. The one place a route id becomes a URL — every link uses it. */
export function hrefFor(id: string) {
  return id === HOME ? '/' : `/${id}`
}

/**
 * The URL being rendered, injected during prerendering.
 *
 * On the client this is never provided and the router reads `location`
 * directly. On the server there is no `location`, so `entry-server.tsx` wraps
 * the tree in this provider with the path it is generating.
 */
export const RouteContext = React.createContext<string | null>(null)

/**
 * Current route id, and a navigate that pushes history without a reload.
 *
 * Anchor jumps inside a page are the browser's job; a page *change* should
 * always start at the top. Pages that arrive as their own chunk reset again
 * once their content mounts — see DocRoute — because this frame still belongs
 * to the loading skeleton.
 */
export function useRoute() {
  const ssrPath = React.useContext(RouteContext)
  const read = React.useCallback(
    () => (ssrPath !== null ? pathToRoute(ssrPath) : pathToRoute(window.location.pathname)),
    [ssrPath],
  )
  const [route, setRoute] = React.useState(read)

  React.useEffect(() => {
    // Back and forward. pushState does not fire this, so navigate() sets the
    // state itself.
    const onPop = () => setRoute(pathToRoute(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = React.useCallback((id: string) => {
    const href = hrefFor(id)
    if (window.location.pathname !== href) window.history.pushState(null, '', href)
    setRoute(id)
    requestAnimationFrame(() => {
      document.getElementById('main')?.scrollTo({ top: 0, behavior: 'auto' })
    })
  }, [])

  return [route, navigate] as const
}

/**
 * The onClick every in-app link shares.
 *
 * A link must stay a link: modified clicks and anything that is not a primary
 * button belong to the browser, so cmd-click still opens a new tab and the
 * middle button still works. Everything else is handled in-page.
 */
export function isPlainClick(e: React.MouseEvent) {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
}
