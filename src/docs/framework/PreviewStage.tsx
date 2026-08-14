import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  Code2, Crosshair, Grid3x3, Monitor, MonitorSmartphone, Moon, RotateCcw, Smartphone, Sun, Tablet,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useInspector } from '@/app/Inspector'
import { CodeBlock } from './CodeBlock'
import { DEVICE_CONTROLS_SLOT, PreviewContext, devicePath } from './preview-context'
import { storedViewport } from './DeviceView'
import type { Lang } from './highlight'

type StageTheme = 'inherit' | 'dark' | 'light'
type StageWidth = 'full' | 'tablet' | 'phone'

const widthPx: Record<StageWidth, string> = {
  full: '100%',
  tablet: '768px',
  phone: '390px',
}

export function PreviewStage({
  children,
  code,
  lang = 'tsx',
  className,
  bodyClassName,
  /** Vertically centres a single small specimen. Off for full layouts. */
  center = true,
  minHeight = 180,
  padded = true,
  toolbar = true,
  /** Extra controls rendered on the left of the toolbar (a playground panel). */
  controls,
  label,
  allowResize = true,
  /**
   * Whether the stage clips what it contains. On by default, which is right for a
   * specimen that sits inside the frame.
   *
   * Turn it OFF for anything that floats out of its own bounds — a menu, a dropdown, a
   * tooltip. A popover taller than the space under its trigger is cut in half by the
   * frame otherwise, and the page whose job is to SHOW the menu is the one page where a
   * half-drawn menu is worst. Note it takes both edges: the frame's own overflow-hidden
   * and the body's overflow-x-auto, which computes overflow-y to auto and clips
   * vertically even though only the x axis is named.
   */
  clip = true,
}: {
  children: React.ReactNode
  code?: string
  lang?: Lang
  className?: string
  bodyClassName?: string
  center?: boolean
  minHeight?: number
  padded?: boolean
  toolbar?: boolean
  controls?: React.ReactNode
  label?: string
  allowResize?: boolean
  clip?: boolean
}) {
  const [theme, setTheme] = React.useState<StageTheme>('inherit')
  const [grid, setGrid] = React.useState(false)
  const [width, setWidth] = React.useState<StageWidth>('full')
  const [showCode, setShowCode] = React.useState(false)
  const [nonce, setNonce] = React.useState(0)
  const { enabled: inspecting, toggle: toggleInspect } = useInspector()
  const target = React.useContext(PreviewContext)

  if (target?.bare) {
    return (
      <BareStage center={center} padded={padded} bodyClassName={bodyClassName} controls={controls}>
        {children}
      </BareStage>
    )
  }

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        clip && 'overflow-hidden',
        className,
      )}
    >
      {toolbar && (
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2 py-1.5">
          {label && (
            <span className="mr-1 pl-1.5 text-overline uppercase text-[var(--ds-fg-muted)]">
              {label}
            </span>
          )}
          {controls}
          <span className="ml-auto flex items-center gap-0.5">
            {allowResize && (
              <>
                <StageBtn
                  active={width === 'full'}
                  onClick={() => setWidth('full')}
                  label="Full width"
                >
                  <Monitor size={13} />
                </StageBtn>
                <StageBtn
                  active={width === 'tablet'}
                  onClick={() => setWidth('tablet')}
                  label="Tablet width, 768px"
                >
                  <Tablet size={13} />
                </StageBtn>
                <StageBtn
                  active={width === 'phone'}
                  onClick={() => setWidth('phone')}
                  label="Phone width, 390px"
                >
                  <Smartphone size={13} />
                </StageBtn>
                <Sep />
              </>
            )}
            {/* The three buttons above narrow a container inside this page; the
                viewport stays whatever the desktop is, so a media query never
                fires and 100dvh is still the desktop's. This one opens a real
                window at a real device size, where all of that is true. */}
            {target && (
              <>
                {/* A real link underneath the popup. If a blocker refuses the
                    sized window, the browser follows the href and the preview
                    opens in an ordinary tab — same route, same bare render,
                    just no automatic sizing. Silently doing nothing is the one
                    outcome this must not have. */}
                <StageBtn
                  href={devicePath(target.pageId, target.blockId)}
                  onClick={(e) => {
                    if (openDeviceWindow(target.pageId, target.blockId)) e.preventDefault()
                  }}
                  label="Open in a device window"
                >
                  <MonitorSmartphone size={13} />
                </StageBtn>
                <Sep />
              </>
            )}
            <StageBtn
              active={theme === 'light'}
              onClick={() => setTheme((t) => (t === 'light' ? 'inherit' : 'light'))}
              label="Preview in light theme"
            >
              {theme === 'light' ? <Sun size={13} /> : <Moon size={13} />}
            </StageBtn>
            <StageBtn active={grid} onClick={() => setGrid((g) => !g)} label="Toggle 8px grid">
              <Grid3x3 size={13} />
            </StageBtn>
            <StageBtn
              active={inspecting}
              onClick={toggleInspect}
              label="Toggle inspector mode"
            >
              <Crosshair size={13} />
            </StageBtn>
            <StageBtn onClick={() => setNonce((n) => n + 1)} label="Reset this example">
              <RotateCcw size={13} />
            </StageBtn>
            {code && (
              <>
                <Sep />
                <StageBtn
                  active={showCode}
                  onClick={() => setShowCode((s) => !s)}
                  label="Show code"
                >
                  <Code2 size={13} />
                </StageBtn>
              </>
            )}
          </span>
        </div>
      )}

      <div
        className={cn(
          'relative flex justify-center',
          clip && 'overflow-x-auto',
          grid && 'preview-grid',
          width !== 'full' && 'bg-[var(--ds-sunken)] py-6',
        )}
      >
        <div
          key={nonce}
          data-theme={theme === 'inherit' ? undefined : theme}
          style={{ width: widthPx[width], maxWidth: '100%' }}
          className={cn(
            'transition-[width] duration-[240ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
            width !== 'full' &&
              'overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] shadow-e2',
            theme !== 'inherit' && 'bg-[var(--ds-canvas)] text-[var(--ds-fg)]',
            center && 'flex flex-wrap items-center justify-center gap-4',
            padded && 'p-6 sm:p-8',
            bodyClassName,
          )}
        >
          {children}
        </div>
        <span className="pointer-events-none absolute inset-0" style={{ minHeight }} aria-hidden />
      </div>

      {code && showCode && (
        <div className="border-t border-[var(--ds-border-subtle)] p-3">
          <CodeBlock code={code} lang={lang} maxHeight={380} />
        </div>
      )}
    </div>
  )
}

/**
 * The same preview with the stage taken away.
 *
 * Everything the toolbar offered is either meaningless here (a simulated width,
 * inside a window that already is one) or has moved to the device window's own
 * bar (theme). What survives is the specimen and its knobs — and the knobs go
 * into the floating bar rather than the page, so the viewport under test keeps
 * every pixel of the device's height.
 */
function BareStage({
  children,
  controls,
  center,
  padded,
  bodyClassName,
}: {
  children: React.ReactNode
  controls?: React.ReactNode
  center: boolean
  padded: boolean
  bodyClassName?: string
}) {
  // The slot lives in a sibling that commits at the same time as this one, so
  // it cannot be found during the first render. One extra pass, then it sticks.
  const [slot, setSlot] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => setSlot(document.getElementById(DEVICE_CONTROLS_SLOT)), [])

  return (
    <>
      <div
        className={cn(
          center && 'flex flex-wrap items-center justify-center gap-4',
          padded && 'p-6',
          bodyClassName,
        )}
      >
        {children}
      </div>
      {controls && slot && createPortal(controls, slot)}
    </>
  )
}

/**
 * Opens the preview in its own window, sized so the viewport is the device.
 *
 * Named per preview, so pressing the button again raises the window that is
 * already open instead of scattering copies across the desktop. Returns false
 * when the browser refused, which is the caller's cue to let the link through.
 */
function openDeviceWindow(pageId: string, blockId: string) {
  const { w, h } = storedViewport()
  const url = `${window.location.pathname}${window.location.search}${devicePath(pageId, blockId)}`
  const win = window.open(
    url,
    `uib-device-${pageId}-${blockId || 'playground'}`,
    `popup=yes,width=${w},height=${h}`,
  )
  if (!win) return false
  win.focus()
  return true
}

function StageBtn({
  children,
  onClick,
  active,
  label,
  href,
}: {
  children: React.ReactNode
  onClick: (e: React.MouseEvent) => void
  active?: boolean
  label: string
  /** Renders an anchor instead. For controls that go somewhere. */
  href?: string
}) {
  const className = cn(
    'grid h-6 w-6 place-items-center rounded-[var(--radius-xs)] transition-colors duration-[100ms]',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
    active
      ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
      : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={className}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-[var(--ds-border-subtle)]" />
}

/* ===========================================================================
   PLAYGROUND CONTROL RAIL
   The knobs that sit above a live preview. Kept deliberately plain so they
   never compete with the specimen they are configuring.
   ======================================================================== */

export function Knob({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
      <span className="whitespace-nowrap">{label}</span>
      {children}
    </label>
  )
}

export function KnobSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: readonly T[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-6 cursor-pointer rounded-[var(--radius-xs)] border border-[var(--ds-border)] bg-[var(--ds-surface)] px-1.5 text-caption text-[var(--ds-fg)] outline-none focus-visible:outline-2 focus-visible:outline-[var(--ds-focus-ring)]"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

export function KnobToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-[var(--radius-xs)] border px-2 text-caption transition-colors',
        checked
          ? 'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
          : 'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors',
          checked ? 'bg-[var(--ds-accent)]' : 'bg-[var(--ds-border-strong)]',
        )}
      />
      {label}
    </button>
  )
}

/** A single labelled specimen cell — used by the state matrix and examples. */
export function Specimen({
  label,
  note,
  children,
  className,
}: {
  label: string
  note?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-[6.5rem] flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)]',
        'border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-4 text-center',
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">{label}</span>
        {note && <span className="text-[10px] leading-tight text-[var(--ds-fg-muted)]">{note}</span>}
      </div>
    </div>
  )
}
