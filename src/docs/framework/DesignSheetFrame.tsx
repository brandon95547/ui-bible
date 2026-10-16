import * as React from 'react'

/**
 * A design sheet, framed and sized to its own page.
 *
 * A sheet is a finished product's own document — its stylesheet, its fonts, its
 * script — so it stands in a frame rather than in this app's tree, where its
 * Tailwind build and ours would fight over every utility. It is served from this
 * origin (public/design-sheets/<id>/), so the frame can read its height: it grows
 * to the sheet and the page scrolls as one, rather than a scroller inside a
 * scroller.
 *
 * Production frames it under `frame-ancestors 'self'` (deploy/ui.skylanex.com.conf).
 */
export function DesignSheetFrame({ src, title }: { src: string; title: string }) {
  const ref = React.useRef<HTMLIFrameElement>(null)
  // Until the sheet has loaded and been measured, a screen of it.
  const [height, setHeight] = React.useState<number | null>(null)

  React.useEffect(() => {
    const frame = ref.current
    if (!frame) return
    let observer: ResizeObserver | null = null

    // The body, not the document: the document is at least as tall as the frame,
    // so it could only ever grow. The sheet's embedded rule lets its body shrink
    // to its content.
    const measure = () => {
      const body = frame.contentDocument?.body
      if (!body) return
      const read = () => setHeight(Math.ceil(body.getBoundingClientRect().height))
      read()
      observer?.disconnect()
      observer = new ResizeObserver(read)
      observer.observe(body)
    }

    // A cached sheet can finish loading before this effect runs.
    if (frame.contentDocument?.readyState === 'complete') measure()
    frame.addEventListener('load', measure)
    return () => {
      frame.removeEventListener('load', measure)
      observer?.disconnect()
    }
  }, [])

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className="block w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]"
      style={{ height: height ?? '80vh' }}
    />
  )
}
