import * as React from 'react'
import { Code2, Crosshair, Grid3x3, Monitor, Moon, RotateCcw, Smartphone, Sun, Tablet } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useInspector } from '@/app/Inspector'
import { CodeBlock } from './CodeBlock'
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
}) {
  const [theme, setTheme] = React.useState<StageTheme>('inherit')
  const [grid, setGrid] = React.useState(false)
  const [width, setWidth] = React.useState<StageWidth>('full')
  const [showCode, setShowCode] = React.useState(false)
  const [nonce, setNonce] = React.useState(0)
  const { enabled: inspecting, toggle: toggleInspect } = useInspector()

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
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
          'relative flex justify-center overflow-x-auto',
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

function StageBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'grid h-6 w-6 place-items-center rounded-[var(--radius-xs)] transition-colors duration-[100ms]',
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
