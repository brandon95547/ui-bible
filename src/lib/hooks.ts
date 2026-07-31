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

/** Tracks which of a set of headings is currently the "active" one. */
export function useScrollSpy(ids: string[], rootMargin = '-88px 0px -70% 0px') {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  useEffect(() => {
    if (ids.length === 0) return
    const seen = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
        const firstVisible = ids.find((id) => seen.get(id))
        if (firstVisible) setActive(firstVisible)
      },
      { rootMargin, threshold: 0 },
    )
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n))
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [ids.join('|'), rootMargin]) // eslint-disable-line react-hooks/exhaustive-deps
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
