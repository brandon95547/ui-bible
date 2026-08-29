import * as React from 'react'
import { hrefFor, isPlainClick } from '@/lib/router'

/* ===========================================================================
   PAGE LINK
   Every control that moves between pages of the Bible.

   These were buttons. They worked for a person with a mouse and for nobody
   else: a crawler reads `href` and never fires a click, so a site whose entire
   navigation is `onClick` has no link graph at all — the sidebar listed 104
   pages and exposed none of them. Cmd-click, middle-click, "copy link
   address" and "open in new tab" were all dead too, which is the same bug
   wearing a different hat.

   So it renders an anchor with a real href and intercepts only the plain
   left-click. The Bible's own Link rule says a control that navigates is a
   link and a control that acts is a button; this is that rule applied to the
   app documenting it.
   ======================================================================== */

export interface PageLinkProps
  extends Omit<React.ComponentPropsWithoutRef<'a'>, 'href' | 'onClick'> {
  /** Route id — 'home', 'button', 'components'. Not a path. */
  to: string
  onNavigate: (id: string) => void
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

export const PageLink = React.forwardRef<HTMLAnchorElement, PageLinkProps>(
  function PageLink({ to, onNavigate, onClick, ...rest }, ref) {
    return (
      <a
        {...rest}
        ref={ref}
        href={hrefFor(to)}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented || !isPlainClick(e)) return
          e.preventDefault()
          onNavigate(to)
        }}
      />
    )
  },
)
