import * as React from 'react'
import { ChevronDown, ChevronUp, Moon, RotateCw, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePersistentState, useViewportSize } from '@/lib/hooks'
import { loadPage } from '@/docs/registry'
import { PAGE_BY_ID } from '@/docs/nav'
import { DEVICE_CONTROLS_SLOT, PreviewContext } from './preview-context'
import type { DocSpec } from './types'

/* ===========================================================================
   THE DEVICE WINDOW

   A second browser window holding one preview and nothing else, sized so its
   viewport is exactly a device's.

   Why a window rather than a box on the page: a 390px-wide <div> is 390px of
   layout inside a 1440px viewport, and a viewport is what everything
   responsive actually reads. Media queries, 100dvh, safe-area insets, the
   scrollbar, position: fixed and every portal all resolve against the window.
   Shrinking a container tells you how the component reflows; it cannot tell
   you what a phone renders. This window can, because it really is that size.

   What it still cannot fake is the pointer. A 390px window on a desktop is
   `pointer: fine`, so rules keyed to `pointer: coarse` — 44px targets — stay
   off. That is the correct behaviour rather than a gap: the Bible keys touch
   sizing to the input device precisely because window width was never a
   reliable proxy for a finger.
   ======================================================================== */

interface Device {
  id: string
  name: string
  w: number
  h: number
  note?: string
}

/**
 * Devices worth checking, not breakpoints. Breakpoints names this distinction
 * outright — you do not write a media query at 393px because a Pixel is 393px
 * — so these exist to be looked at, and the readout below names the breakpoint
 * band each one lands in rather than pretending the device is the boundary.
 */
const DEVICES: Device[] = [
  { id: 'reflow', name: 'Reflow minimum', w: 320, h: 568, note: 'WCAG 1.4.10 — the narrowest anything must survive' },
  { id: 'iphone-se', name: 'iPhone SE', w: 375, h: 667 },
  { id: 'iphone', name: 'iPhone 15', w: 390, h: 844 },
  { id: 'pixel', name: 'Pixel 8', w: 412, h: 915 },
  { id: 'iphone-max', name: 'iPhone 15 Pro Max', w: 430, h: 932 },
  { id: 'ipad-mini', name: 'iPad mini', w: 768, h: 1024 },
  { id: 'ipad-air', name: 'iPad Air', w: 820, h: 1180 },
  { id: 'ipad-pro', name: 'iPad Pro 12.9', w: 1024, h: 1366 },
  { id: 'laptop', name: 'Laptop', w: 1280, h: 800 },
]

const DEFAULT_DEVICE = 'iphone'

export const deviceById = (id: string) => DEVICES.find((d) => d.id === id) ?? DEVICES[2]

/**
 * The device the last window was left on, so a new one opens at that size
 * immediately rather than opening wrong and correcting itself in view.
 */
export function storedViewport() {
  const read = <T,>(key: string, fallback: T): T => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  }
  const device = deviceById(read('uib:device', DEFAULT_DEVICE))
  const landscape = read('uib:device-landscape', false)
  return landscape ? { w: device.h, h: device.w } : { w: device.w, h: device.h }
}

/** The band a width falls in, so the readout speaks the system's own language. */
const BANDS = [
  { name: '2xl', min: 1536 },
  { name: 'xl', min: 1280 },
  { name: 'lg', min: 1024 },
  { name: 'md', min: 768 },
  { name: 'sm', min: 640 },
  { name: 'base', min: 0 },
]
const bandFor = (width: number) => BANDS.find((b) => width >= b.min)!.name

/**
 * The size a window has to be for its *viewport* to be w × h. Everything the
 * browser puts around the page — title bar, address bar, borders — has to be
 * added on top, and it differs per browser and per platform, so it is measured
 * rather than assumed.
 */
export function fitViewport(w: number, h: number) {
  const chromeW = window.outerWidth - window.innerWidth
  const chromeH = window.outerHeight - window.innerHeight
  window.resizeTo(w + chromeW, h + chromeH)
}

/** The theme the docs window was last in. Read once; never written back — a
 *  preview window is a place to look at something, not to change a setting. */
function initialTheme(): 'dark' | 'light' {
  try {
    const raw = window.localStorage.getItem('uib:theme')
    return raw === null ? 'dark' : (JSON.parse(raw) as 'dark' | 'light')
  } catch {
    return 'dark'
  }
}

export function DeviceView({ route }: { route: string }) {
  // 'device/<pageId>' or 'device/<pageId>/<blockId>'
  const [, pageId = '', blockId = ''] = route.split('/')

  const [spec, setSpec] = React.useState<DocSpec | null>(null)
  const [state, setState] = React.useState<'loading' | 'ready' | 'missing'>('loading')
  const [theme, setTheme] = React.useState<'dark' | 'light'>(initialTheme)
  const [deviceId, setDeviceId] = usePersistentState('uib:device', DEFAULT_DEVICE)
  const [landscape, setLandscape] = usePersistentState('uib:device-landscape', false)

  const device = deviceById(deviceId)
  const meta = PAGE_BY_ID.get(pageId)

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  React.useEffect(() => {
    let cancelled = false
    setState('loading')
    const loader = loadPage(pageId)
    if (!loader) {
      setState('missing')
      return
    }
    loader()
      .then((m) => {
        if (cancelled) return
        setSpec(m.default)
        setState('ready')
      })
      .catch(() => !cancelled && setState('missing'))
    return () => {
      cancelled = true
    }
  }, [pageId])

  // Named so the window is identifiable in a taskbar full of browser windows.
  React.useEffect(() => {
    const title = meta?.title ?? pageId
    document.title = `${title} · ${device.name} — UI Bible`
  }, [meta, pageId, device])

  // Size the window to the remembered device, but only when we opened it
  // ourselves. Someone who pasted this URL into an ordinary tab gets left
  // alone — resizing a window a person did not ask to have resized is rude,
  // and the readout tells the truth either way.
  const sized = React.useRef(false)
  React.useEffect(() => {
    if (sized.current || !window.opener) return
    sized.current = true
    fitViewport(landscape ? device.h : device.w, landscape ? device.w : device.h)
  }, [device, landscape])

  const applyDevice = (next: Device, nextLandscape: boolean) => {
    setDeviceId(next.id)
    setLandscape(nextLandscape)
    fitViewport(
      nextLandscape ? next.h : next.w,
      nextLandscape ? next.w : next.h,
    )
  }

  const block =
    state !== 'ready' || !spec?.preview
      ? null
      : blockId
        ? spec.preview.examples?.find((e) => e.id === blockId)?.render
        : spec.preview.render

  return (
    <PreviewContext.Provider value={{ pageId, blockId, bare: true }}>
      <div className="min-h-dvh bg-[var(--ds-canvas)] text-[var(--ds-fg)]">
        {state === 'loading' && (
          <div className="flex min-h-dvh items-center justify-center p-6">
            <div className="h-24 w-full max-w-sm animate-pulse rounded-[var(--radius-xl)] bg-[var(--ds-layer-active)]" />
          </div>
        )}
        {state === 'ready' && !block && (
          <p className="p-6 text-body-sm text-[var(--ds-fg-muted)]">
            {blockId
              ? `“${blockId}” is not an example on this page.`
              : 'This page has no live preview to show.'}
          </p>
        )}
        {state === 'missing' && (
          <p className="p-6 text-body-sm text-[var(--ds-fg-muted)]">
            No page called “{pageId}”.
          </p>
        )}
        {block}
      </div>

      <DeviceBar
        device={device}
        landscape={landscape}
        theme={theme}
        onDevice={(d) => applyDevice(d, landscape)}
        onRotate={() => applyDevice(device, !landscape)}
        onTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
    </PreviewContext.Provider>
  )
}

/**
 * The floating control bar.
 *
 * Fixed, and therefore weightless: it paints over the preview instead of
 * taking a strip of it, so the viewport stays exactly the device's. It also
 * sits above every scrim in the system, because a preview that opens a modal
 * must not be able to trap the only way back out.
 */
function DeviceBar({
  device,
  landscape,
  theme,
  onDevice,
  onRotate,
  onTheme,
}: {
  device: Device
  landscape: boolean
  theme: 'dark' | 'light'
  onDevice: (d: Device) => void
  onRotate: () => void
  onTheme: () => void
}) {
  const [open, setOpen] = React.useState(true)
  const { width, height } = useViewportSize()

  // The measured viewport, not the preset. They part company the moment the
  // window is dragged — and also when the screen is simply too short for the
  // device, since a browser cannot open a 932px-tall window on an 800px
  // display. Either way the measured number is the only one worth trusting, so
  // it is the one shown, and a mismatch is said out loud rather than left for
  // someone to discover after trusting the label.
  const matches =
    width === (landscape ? device.h : device.w) && height === (landscape ? device.w : device.h)

  return (
    <div className="fixed inset-x-0 bottom-3 z-[200] flex justify-center px-3">
      {open ? (
        <div className="flex max-w-full flex-col gap-1.5 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]/95 p-1.5 shadow-e4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={device.id}
            onChange={(e) => onDevice(deviceById(e.target.value))}
            aria-label="Device"
            title={device.note}
            className="h-6 cursor-pointer rounded-[var(--radius-xs)] border border-[var(--ds-border)] bg-[var(--ds-surface)] px-1.5 text-caption text-[var(--ds-fg)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
          >
            {DEVICES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <BarBtn label={landscape ? 'Portrait' : 'Landscape'} onClick={onRotate} active={landscape}>
            <RotateCw size={13} />
          </BarBtn>

          <span
            className={cn(
              'flex items-baseline gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px] tabular-nums',
              matches ? 'text-[var(--ds-fg-secondary)]' : 'bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)]',
            )}
            title={
              matches
                ? `The viewport is exactly a ${device.name}`
                : `Not a ${device.name}: the window was resized, or the screen is too small to hold one. This is the real viewport.`
            }
          >
            {width} × {height}
            <span className="text-[10px] uppercase text-[var(--ds-fg-muted)]">{bandFor(width)}</span>
          </span>

          <BarBtn label={theme === 'dark' ? 'Light theme' : 'Dark theme'} onClick={onTheme}>
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          </BarBtn>

          <BarBtn label="Hide these controls" onClick={() => setOpen(false)}>
            <ChevronDown size={13} />
          </BarBtn>
        </div>

        {/* The preview's own knobs land here — see PreviewStage. Collapses to
            nothing when the preview has none, which is most of them. */}
        <div
          id={DEVICE_CONTROLS_SLOT}
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[var(--ds-border-subtle)] px-0.5 pt-1.5 empty:hidden"
        />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]/80 px-2.5 py-1 font-mono text-[11px] tabular-nums text-[var(--ds-fg-muted)] shadow-e2 backdrop-blur-xl hover:text-[var(--ds-fg)]"
        >
          {width} × {height}
          <ChevronUp size={12} />
        </button>
      )}
    </div>
  )
}

function BarBtn({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'grid h-6 w-6 shrink-0 place-items-center rounded-[var(--radius-xs)] transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
        active
          ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
          : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
      )}
    >
      {children}
    </button>
  )
}
