import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/app.css'
import App from './App.tsx'
import { pathToRoute } from './lib/router.ts'
import { loadPage } from './docs/registry.ts'
import type { DocSpec } from './docs/framework/types.ts'

/* ---------------------------------------------------------------------------
   Old hash links.

   The Bible shipped as a hash-routed SPA, so anything bookmarked, pasted into
   a doc, or linked from another product points at `#/button`. Rewrite those to
   `/button` before React looks at the URL — replaceState rather than pushState,
   so the dead address does not become a back-button stop.
   ------------------------------------------------------------------------ */
const legacy = window.location.hash.match(/^#\/(.+)$/)
if (legacy) {
  const [id, section] = legacy[1].split('#')
  window.history.replaceState(null, '', `/${id}${section ? `#${section}` : ''}`)
}

const container = document.getElementById('root')!

/**
 * A prerendered document already contains the page. Resolving its chunk before
 * hydrating is what keeps it on screen: hydrate first and DocRoute would mount
 * with no spec, render its loading skeleton, and blank the very content the
 * prerender existed to put there.
 */
async function start() {
  if (!container.hasChildNodes()) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    return
  }

  const id = pathToRoute(window.location.pathname)
  let initialSpec: DocSpec | null | undefined
  if (!id.startsWith('device')) {
    const loader = loadPage(id)
    initialSpec = loader ? await loader().then((m) => m.default, () => null) : null
  }

  hydrateRoot(
    container,
    <StrictMode>
      <App initialSpec={initialSpec} />
    </StrictMode>,
  )
}

void start()
