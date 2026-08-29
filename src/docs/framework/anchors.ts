/**
 * In-page anchors.
 *
 * These used to carry the page segment — `#/colors#tokens` — because the hash
 * router owned the fragment, and a bare `href="#tokens"` would replace the
 * whole hash and navigate to a page called "tokens". With path routing the
 * fragment belongs to the document again, so an anchor is just an anchor and
 * the browser resolves it natively.
 */

/** The anchor segment of the current URL, or '' when there is none. */
export function currentSectionId() {
  if (typeof window === 'undefined') return ''
  return window.location.hash.replace(/^#/, '')
}

/** Safe to copy, bookmark and paste, and resolvable without JavaScript. */
export function sectionHref(sectionId: string) {
  return `#${sectionId}`
}

/**
 * Still ours to perform: the reading area is a scroll container, not the
 * document, so the browser's own fragment scroll lands in the wrong box.
 */
export function scrollToSection(sectionId: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(sectionId)
  if (!el) return false
  el.scrollIntoView({ behavior, block: 'start' })
  return true
}
