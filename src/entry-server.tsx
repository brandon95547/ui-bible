// oxlint-disable react/only-export-components -- This module is loaded by Node
// during the build and never by a browser, so it takes no part in fast refresh;
// exporting the route list and loader alongside render() is the point of it.

/* ===========================================================================
   SERVER ENTRY
   Built separately (`vite build --ssr`) and imported by scripts/prerender.mjs.

   Nothing here runs in a browser and nothing here ships to one. Its whole job
   is to turn a route id into a string of HTML at build time, so that a crawler
   — and a reader on a slow connection — gets the page's actual words instead
   of an empty <div id="root">.
   ======================================================================== */

import { renderToString } from 'react-dom/server'
import App from './App'
import { RouteContext, hrefFor } from './lib/router'
import { ALL_PAGES, NAV, PAGE_BY_ID } from './docs/nav'
import { metaFor } from './docs/meta'
import { IMPLEMENTED, loadPage } from './docs/registry'
import type { DocSpec } from './docs/framework/types'

export interface PrerenderRoute {
  /** Route id — 'home', 'components', 'button'. */
  id: string
  /** Path the file is written to and the canonical URL. */
  path: string
  title: string
  description: string
  /**
   * Pages in the sidebar that have no file yet still get a document, so the
   * link graph has no dead ends — but they are kept out of the index, because
   * "has not been written yet" is not a search result anyone wants.
   */
  index: boolean
}

/** Every route worth writing to disk, derived from the same NAV the app uses. */
export function routes(): PrerenderRoute[] {
  const out: PrerenderRoute[] = [{ id: 'home', path: '/', ...metaFor('home'), index: true }]

  for (const section of NAV) {
    if (!section.overview) continue
    out.push({ id: section.id, path: hrefFor(section.id), ...metaFor(section.id), index: true })
  }

  for (const page of ALL_PAGES) {
    out.push({
      id: page.id,
      path: hrefFor(page.id),
      ...metaFor(page.id),
      index: IMPLEMENTED.has(page.id),
    })
  }

  return out
}

/**
 * The spec for a page id, or null when there is no file for it.
 *
 * DocRoute loads this in an effect, and effects do not run during
 * renderToString — so the prerenderer resolves it here and hands it in.
 */
export async function loadSpec(id: string): Promise<DocSpec | null> {
  const loader = loadPage(id)
  if (!loader) return null
  try {
    return (await loader()).default
  } catch {
    return null
  }
}

export function render(path: string, initialSpec: DocSpec | null | undefined) {
  return renderToString(
    <RouteContext.Provider value={path}>
      <App initialSpec={initialSpec} />
    </RouteContext.Provider>,
  )
}

/** Exposed so the prerenderer can label pages without re-reading nav.ts. */
export { PAGE_BY_ID }
