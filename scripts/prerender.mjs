/* ===========================================================================
   PRERENDER
   Turns the SSR bundle into one static HTML file per page.

   Vite has no SSG of its own — it is a bundler. So the build runs twice: once
   for the browser (`dist/`), once for Node (`dist-server/`), and this script
   walks the route list calling render() and writing the result into the client
   template. What lands on disk is an ordinary static site that happens to
   hydrate into the same SPA it was before.

   Run via `npm run build`. The output directory follows OUT_DIR so the deploy
   can build into a staging directory and swap it in atomically — see
   deploy/rebuild.sh.
   ======================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.resolve(ROOT, process.env.OUT_DIR || 'dist')
const SERVER_OUT = path.resolve(ROOT, process.env.SSR_OUT_DIR || 'dist-server')
const ORIGIN = (process.env.SITE_ORIGIN || 'https://ui.skylanex.com').replace(/\/$/, '')

const { routes, loadSpec, render } = await import(
  path.join(SERVER_OUT, 'entry-server.js')
)

/** Attribute-safe. Blurbs are prose and contain quotes and ampersands. */
const attr = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const template = await readFile(path.join(OUT, 'index.html'), 'utf8')

if (!template.includes('<div id="root"></div>')) {
  throw new Error('index.html has no empty #root to render into — did the client build run?')
}

/**
 * The template carries the home page's title and description. Strip both and
 * write the route's own, plus the tags that only make sense per-page: a
 * canonical (so `/button` and `/button/` are not two pages) and the Open Graph
 * pair that decides what a pasted link looks like.
 */
function documentFor(route, body) {
  const url = `${ORIGIN}${route.path}`
  const head = [
    `<title>${attr(route.title)}</title>`,
    `<meta name="description" content="${attr(route.description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="UI Bible" />`,
    `<meta property="og:title" content="${attr(route.title)}" />`,
    `<meta property="og:description" content="${attr(route.description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    route.index ? '' : `<meta name="robots" content="noindex, follow" />`,
  ]
    .filter(Boolean)
    .join('\n    ')

  return template
    .replace(/<meta\s+name="description"[\s\S]*?\/>\s*/, '')
    .replace(/<title>[\s\S]*?<\/title>/, head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

async function writePage(route, body) {
  // '/' becomes dist/index.html; '/button' becomes dist/button/index.html, so
  // nginx resolves it with try_files and no rewrite rule is involved.
  const dir = route.path === '/' ? OUT : path.join(OUT, route.path)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), documentFor(route, body), 'utf8')
}

const all = routes()
let written = 0
const failures = []

for (const route of all) {
  try {
    // Never undefined: that would tell DocRoute to load the page itself in an
    // effect, which is exactly what cannot happen here. null is the resolved
    // "no such page" answer, and it is also what home and the section
    // overviews get — neither renders a DocRoute at all.
    const spec = await loadSpec(route.id)
    await writePage(route, render(route.path, spec))
    written++
  } catch (err) {
    failures.push({ id: route.id, err })
  }
}

/* ---- 404 ------------------------------------------------------------------
   A real document for nginx's error_page, so an unknown address gets the app's
   own "not found" instead of a bare nginx page. */
const notFound = {
  id: '404',
  path: '/404',
  title: 'Page not found — UI Bible',
  description: 'That address does not match any page in the Bible.',
  index: false,
}
await writeFile(
  path.join(OUT, '404.html'),
  documentFor(notFound, render('/__not_found__', null)),
  'utf8',
)

/* ---- sitemap + robots -----------------------------------------------------
   Both generated from the same route list that produced the HTML, so they
   cannot drift from what actually exists on disk. */
const indexable = all.filter((r) => r.index)
await writeFile(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((r) => `  <url><loc>${ORIGIN}${r.path}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
  'utf8',
)
await writeFile(
  path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
  'utf8',
)

if (failures.length) {
  for (const f of failures) console.error(`  ✗ ${f.id}: ${f.err?.message ?? f.err}`)
  console.error(`\nprerender: ${failures.length} route(s) failed`)
  process.exit(1)
}

console.log(
  `prerender: ${written} pages (${indexable.length} indexable, ${written - indexable.length} noindex), sitemap + robots`,
)
