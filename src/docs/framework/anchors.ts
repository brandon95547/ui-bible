/**
 * In-page anchors have to survive the hash router.
 *
 * `useHashRoute` in App.tsx reads the hash as `#/<pageId>`, splitting anything
 * after a second `#` off as an in-page anchor. A bare `href="#tokens"` replaces
 * the *whole* hash, so the router resolves "tokens" as a page id, finds no such
 * page, and renders "Page not found". Every section link must therefore carry
 * the page segment: `#/colors#tokens`.
 */

/** The page segment of the current hash — 'colors' for `#/colors#tokens`. */
export function currentPageId() {
  return window.location.hash.replace(/^#\/?/, '').split('#')[0]
}

/** The anchor segment of the current hash, or '' when there is none. */
export function currentSectionId() {
  return window.location.hash.replace(/^#\/?/, '').split('#')[1] ?? ''
}

/**
 * Builds `#/colors#tokens` — safe to copy, bookmark, and paste. Read off the
 * live hash rather than passed down, so a section heading nested anywhere in
 * the tree can link to itself without the page threading its id through.
 */
export function sectionHref(sectionId: string) {
  const page = currentPageId()
  return page ? `#/${page}#${sectionId}` : `#${sectionId}`
}

/**
 * A browser cannot resolve a compound fragment — it looks for an element whose
 * id is literally `/colors#tokens` — so the scroll is ours to perform.
 */
export function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(sectionId)
  if (!el) return false
  el.scrollIntoView({ behavior, block: 'start' })
  return true
}
