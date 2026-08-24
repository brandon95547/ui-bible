import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/** SSR-safe layout effect. */
export const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * localStorage-backed state. Reads once on mount; writes are debounced by the
 * browser's own microtask batching, which is enough for our write volume.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* quota or private mode — the feature degrades, it does not break */
    }
  }, [key, value])

  return [value, setValue] as const
}

/** Stable callback identity without stale closures. */
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R) {
  const ref = useRef(fn)
  useIsoLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: A) => ref.current(...args), [])
}

/** Media query subscription. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** The window's own viewport, tracked across resizes. */
export function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }))
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

/** Fires when a click or focus lands outside every referenced element. */
export function useDismissable(
  active: boolean,
  onDismiss: () => void,
  refs: React.RefObject<HTMLElement | null>[],
) {
  const dismiss = useEvent(onDismiss)
  useEffect(() => {
    if (!active) return
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (refs.some((r) => r.current?.contains(t))) return
      dismiss()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        dismiss()
      }
    }
    document.addEventListener('pointerdown', onPointer, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, dismiss])
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab inside a container and restores focus to the trigger on unmount.
 * Required for any modal surface — without it a keyboard user tabs straight
 * out of the dialog and into a page they cannot see.
 */
export function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return
    const node = ref.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    const first = focusables()[0]
    ;(first ?? node).focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    node.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [active, ref])
}

/** Locks body scroll without the layout shift caused by the scrollbar leaving. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const { body, documentElement: html } = document
    const gap = window.innerWidth - html.clientWidth
    const prevOverflow = body.style.overflow
    const prevPad = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPad
    }
  }, [active])
}

/** The nearest ancestor that actually scrolls, or null when the page does. */
function scrollParent(el: HTMLElement | null) {
  for (let n = el; n; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY
    if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n
  }
  return null
}

/**
 * Which anchor owns the top of the reading area.
 *
 * Geometry, not intersection. An observer reports WHETHER an element is on
 * screen, and once anchors nest — a section, and the blocks inside it — several
 * are on screen at once, so "the first visible one" is decided by whichever the
 * list happens to name first rather than by where the reader is. What a table
 * of contents actually asks is "what have I most recently scrolled into", and
 * that is the last anchor whose top has crossed the reading line.
 *
 * `ids` must be in document order. The line sits just below the app bar, and an
 * anchor scrolled to by a link lands above it — so following a link and reading
 * your way to the same place give the same answer.
 *
 * The exception is the end of the scroll, where the last anchor can never reach
 * the line no matter how hard the reader scrolls. There, everything left is on
 * screen, so the bottom-most anchor that has started is the one they are in.
 */
export function useScrollSpy(ids: string[], line = 200) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  useEffect(() => {
    if (ids.length === 0) return
    let frame = 0
    const pick = () => {
      frame = 0
      const box = scrollParent(document.getElementById(ids[0]))
      const atEnd = box
        ? box.scrollHeight - box.clientHeight - box.scrollTop <= 2
        : window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const limit = atEnd ? (box ? box.getBoundingClientRect().bottom : window.innerHeight) : line
      let found = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= limit) found = id
      }
      setActive(found)
    }
    // One read per frame: scroll fires far faster than anything can be painted,
    // and every read in here forces a layout.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }
    pick()
    // Capture, because scroll does not bubble. The docs body scrolls inside a
    // container, and a listener bound to the window hears about it no other way.
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
    }
  }, [ids.join('|'), line]) // eslint-disable-line react-hooks/exhaustive-deps
  return active
}

/**
 * Resolves CSS custom properties off the document, re-reading whenever the
 * theme flips. Without the observer a token table renders dark-theme values
 * and then quietly lies after the reader switches to light.
 */
export function useResolvedTokens(names: string[]) {
  const key = names.join('|')
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const next: Record<string, string> = {}
      names.forEach((n) => {
        const v = cs.getPropertyValue(n).trim()
        if (v) next[n] = v
      })
      setValues(next)
    }
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return values
}

/** Copy-to-clipboard with a self-resetting "copied" flag. */
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), timeout)
    },
    [timeout],
  )
  useEffect(() => () => clearTimeout(timer.current), [])
  return { copied, copy }
}

/** Element size, via ResizeObserver. */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useIsoLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.contentRect
      setSize({ width: Math.round(r.width), height: Math.round(r.height) })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return { ref, ...size }
}

let idSeq = 0
/** Deterministic-enough unique id for aria wiring in demo components. */
export function useId(prefix = 'ds') {
  const [id] = useState(() => `${prefix}-${++idSeq}`)
  return id
}
