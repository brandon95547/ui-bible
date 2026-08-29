/* ===========================================================================
   PAGE METADATA
   The title and description for a route id.

   Shared, because two things need the same answer and must not drift: the
   prerenderer writes it into the static <head> of every file, and the running
   app rewrites document.title as the reader navigates. Derive both from NAV
   and there is only ever one answer.
   ======================================================================== */

import { NAV, PAGE_BY_ID } from './nav'

export const SITE_TITLE = 'UI Bible'

export const HOME_DESCRIPTION =
  'The permanent design system standard. Components, tokens, patterns, and the reasoning behind every decision.'

export function metaFor(id: string): { title: string; description: string } {
  if (id === 'home') return { title: SITE_TITLE, description: HOME_DESCRIPTION }

  const section = NAV.find((s) => s.id === id && s.overview)
  if (section) {
    return { title: `${section.title} — ${SITE_TITLE}`, description: section.description }
  }

  const page = PAGE_BY_ID.get(id)
  if (page) return { title: `${page.title} — ${SITE_TITLE}`, description: page.blurb }

  return {
    title: `Page not found — ${SITE_TITLE}`,
    description: 'That address does not match any page in the Bible.',
  }
}
