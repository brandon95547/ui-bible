import * as React from 'react'
import { createPortal } from 'react-dom'
import { Crosshair, Lock, LockOpen, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePersistentState } from '@/lib/hooks'

/* ===========================================================================
   INSPECTOR MODE
   Chrome DevTools answers "what is this element?". A designer needs the next
   question answered too: "which token produced that value, and why is it that
   value?". Geometry comes from the DOM; intent comes from the data-* metadata
   each primitive tags itself with.
   ======================================================================== */

interface Measurement {
  rect: DOMRect
  tag: string
  name: string | null
  width: number
  height: number
  padding: [number, number, number, number]
  margin: [number, number, number, number]
  radius: string
  shadow: string
  font: string
  lineHeight: string
  letterSpacing: string
  weight: string
  color: string
  background: string
  border: string
  gap: string
  tokens: string[]
  why: string | null
  a11yNote: string | null
  contrast: number | null
}

interface InspectorCtx {
  enabled: boolean
  setEnabled: (v: boolean) => void
  toggle: () => void
}

const Ctx = React.createContext<InspectorCtx>({
  enabled: false,
  setEnabled: () => {},
  toggle: () => {},
})

export const useInspector = () => React.useContext(Ctx)

export function InspectorProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = usePersistentState('uib:inspector', false)
  const toggle = React.useCallback(() => setEnabled((e) => !e), [setEnabled])

  React.useEffect(() => {
    document.body.classList.toggle('inspect-armed', enabled)
    return () => document.body.classList.remove('inspect-armed')
  }, [enabled])

  const value = React.useMemo(() => ({ enabled, setEnabled, toggle }), [enabled, setEnabled, toggle])

  return (
    <Ctx.Provider value={value}>
      {children}
      {enabled && <InspectorOverlay onClose={() => setEnabled(false)} />}
    </Ctx.Provider>
  )
}

/* -- colour maths for the live contrast readout --------------------------- */

function parseRGB(input: string): [number, number, number, number] | null {
  const m = input.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  return [parts[0], parts[1], parts[2], parts[3] ?? 1]
}

function relLuminance([r, g, b]: [number, number, number, number]) {
  const f = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function composite(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number, number] {
  const a = fg[3]
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ]
}

/** Walks up until it finds a non-transparent background to composite against. */
function effectiveBackground(el: Element): [number, number, number, number] {
  let node: Element | null = el
  let acc: [number, number, number, number] | null = null
  while (node) {
    const bg = parseRGB(getComputedStyle(node).backgroundColor)
    if (bg && bg[3] > 0) {
      acc = acc ? composite(acc, bg) : bg
      if (acc[3] >= 0.999) return acc
    }
    node = node.parentElement
  }
  return acc ?? [10, 11, 14, 1]
}

export function contrastRatio(fgStr: string, bg: [number, number, number, number]) {
  const fg = parseRGB(fgStr)
  if (!fg) return null
  const solid = fg[3] < 1 ? composite(fg, bg) : fg
  const l1 = relLuminance(solid)
  const l2 = relLuminance(bg)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/* -- measurement ---------------------------------------------------------- */

function px(v: string) {
  const n = parseFloat(v)
  return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100
}

function measure(el: HTMLElement): Measurement {
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  const meta = el.closest<HTMLElement>('[data-inspect]')
  const bg = effectiveBackground(el)

  return {
    rect,
    tag: el.tagName.toLowerCase(),
    name: meta?.dataset.inspect ?? null,
    width: Math.round(rect.width * 100) / 100,
    height: Math.round(rect.height * 100) / 100,
    padding: [
      px(cs.paddingTop),
      px(cs.paddingRight),
      px(cs.paddingBottom),
      px(cs.paddingLeft),
    ],
    margin: [px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)],
    radius: cs.borderRadius,
    shadow: cs.boxShadow === 'none' ? 'none' : cs.boxShadow,
    font: `${px(cs.fontSize)}px ${cs.fontFamily.split(',')[0].replace(/["']/g, '')}`,
    lineHeight: cs.lineHeight === 'normal' ? 'normal' : `${px(cs.lineHeight)}px`,
    letterSpacing: cs.letterSpacing === 'normal' ? '0' : cs.letterSpacing,
    weight: cs.fontWeight,
    color: cs.color,
    background: cs.backgroundColor,
    border:
      px(cs.borderTopWidth) === 0
        ? 'none'
        : `${px(cs.borderTopWidth)}px ${cs.borderTopStyle} ${cs.borderTopColor}`,
    gap: cs.gap && cs.gap !== 'normal' ? cs.gap : '—',
    tokens: meta?.dataset.tokens?.split('|').filter(Boolean) ?? [],
    why: meta?.dataset.why ?? null,
    a11yNote: meta?.dataset.a11y ?? null,
    contrast: contrastRatio(cs.color, bg),
  }
}

/* -- overlay -------------------------------------------------------------- */

function InspectorOverlay({ onClose }: { onClose: () => void }) {
  const [m, setM] = React.useState<Measurement | null>(null)
  const [frozen, setFrozen] = React.useState(false)
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 })
  const raf = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (frozen) return
      setCursor({ x: e.clientX, y: e.clientY })
      cancelAnimationFrame(raf.current!)
      raf.current = requestAnimationFrame(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        if (!el || el.closest('[data-inspector-ui]')) return
        setM(measure(el))
      })
    }
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-inspector-ui]')) return
      e.preventDefault()
      e.stopPropagation()
      setFrozen((f) => !f)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (frozen) setFrozen(false)
        else onClose()
      }
    }
    window.addEventListener('mousemove', onMove, true)
    window.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey)
      cancelAnimationFrame(raf.current!)
    }
  }, [frozen, onClose])

  if (typeof document === 'undefined') return null

  const r = m?.rect
  // Panel flips to the other side of the cursor when it would run off-screen —
  // the reading position must never leave the viewport.
  const PANEL_W = 320
  const PANEL_H = 460
  const left = cursor.x + PANEL_W + 24 > window.innerWidth ? cursor.x - PANEL_W - 16 : cursor.x + 16
  const top = Math.min(
    Math.max(12, cursor.y - 40),
    Math.max(12, window.innerHeight - PANEL_H - 12),
  )

  return createPortal(
    <>
      {/* --- geometry overlay --- */}
      {r && (
        <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden>
          {/* margin box */}
          {m!.margin.some((v) => v > 0) && (
            <div
              className="absolute anatomy-margin"
              style={{
                left: r.left - m!.margin[3],
                top: r.top - m!.margin[0],
                width: r.width + m!.margin[1] + m!.margin[3],
                height: r.height + m!.margin[0] + m!.margin[2],
              }}
            />
          )}
          {/* border box */}
          <div
            className="absolute outline outline-2 outline-[var(--ds-accent)]"
            style={{ left: r.left, top: r.top, width: r.width, height: r.height }}
          />
          {/* padding box */}
          {m!.padding.some((v) => v > 0) && (
            <div
              className="absolute anatomy-pad"
              style={{
                left: r.left,
                top: r.top,
                width: r.width,
                height: r.height,
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${m!.padding[3]}px ${m!.padding[0]}px, ${m!.padding[3]}px calc(100% - ${m!.padding[2]}px), calc(100% - ${m!.padding[1]}px) calc(100% - ${m!.padding[2]}px), calc(100% - ${m!.padding[1]}px) ${m!.padding[0]}px, ${m!.padding[3]}px ${m!.padding[0]}px)`,
              }}
            />
          )}
          {/* dimension pill */}
          <div
            className="absolute rounded-[4px] bg-[var(--ds-accent)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white shadow-e2 tabular-nums"
            style={{
              left: r.left,
              top: r.top > 26 ? r.top - 22 : r.bottom + 6,
              whiteSpace: 'nowrap',
            }}
          >
            {m!.width} × {m!.height}
          </div>
        </div>
      )}

      {/* --- readout panel --- */}
      <div
        data-inspector-ui
        style={{ left, top, width: PANEL_W }}
        className={cn(
          'fixed z-[210] flex max-h-[min(28rem,calc(100vh-2rem))] flex-col overflow-hidden',
          'rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]/97',
          'shadow-e5 backdrop-blur-xl',
        )}
      >
        <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2">
          <Crosshair size={13} className="text-[var(--ds-accent)]" />
          <span className="flex-1 truncate font-mono text-[11px] font-medium text-[var(--ds-fg)]">
            {m?.name ?? `<${m?.tag ?? '—'}>`}
          </span>
          <button
            data-inspector-ui
            type="button"
            onClick={() => setFrozen((f) => !f)}
            aria-pressed={frozen}
            aria-label={frozen ? 'Unfreeze inspector' : 'Freeze inspector'}
            className={cn(
              'grid h-5 w-5 place-items-center rounded-[4px] transition-colors',
              frozen
                ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
                : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)]',
            )}
          >
            {frozen ? <Lock size={11} /> : <LockOpen size={11} />}
          </button>
          <button
            data-inspector-ui
            type="button"
            onClick={onClose}
            aria-label="Exit inspector mode"
            className="grid h-5 w-5 place-items-center rounded-[4px] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]"
          >
            <X size={11} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!m ? (
            <p className="p-4 text-caption text-[var(--ds-fg-muted)]">
              Move the pointer over any element. Click to freeze the readout, Escape to exit.
            </p>
          ) : (
            <>
              <Group title="Box">
                <Row k="Size" v={`${m.width} × ${m.height}`} />
                <Row k="Padding" v={quad(m.padding)} />
                <Row k="Margin" v={quad(m.margin)} />
                <Row k="Gap" v={m.gap} />
                <Row k="Radius" v={m.radius} />
                <Row k="Border" v={m.border} />
                <Row k="Shadow" v={m.shadow === 'none' ? 'none' : shortShadow(m.shadow)} />
              </Group>

              <Group title="Typography">
                <Row k="Font" v={m.font} />
                <Row k="Weight" v={m.weight} />
                <Row k="Line height" v={m.lineHeight} />
                <Row k="Tracking" v={m.letterSpacing} />
              </Group>

              <Group title="Colour">
                <Row k="Text" v={m.color} swatch={m.color} />
                <Row k="Background" v={m.background} swatch={m.background} />
                {m.contrast !== null && (
                  <Row
                    k="Contrast"
                    v={`${m.contrast.toFixed(2)}:1`}
                    badge={
                      m.contrast >= 7
                        ? { text: 'AAA', tone: 'success' }
                        : m.contrast >= 4.5
                          ? { text: 'AA', tone: 'success' }
                          : m.contrast >= 3
                            ? { text: 'AA Large', tone: 'warning' }
                            : { text: 'Fail', tone: 'danger' }
                    }
                  />
                )}
              </Group>

              {m.tokens.length > 0 && (
                <Group title="Tokens">
                  <div className="flex flex-wrap gap-1 px-3 pb-2">
                    {m.tokens.map((t) => (
                      <span
                        key={t}
                        className="rounded-[4px] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ds-accent-text)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </Group>
              )}

              {m.why && (
                <Group title="Why this value">
                  <p className="px-3 pb-2.5 text-[11px] leading-relaxed text-[var(--ds-fg-secondary)]">
                    {m.why}
                  </p>
                </Group>
              )}

              {m.a11yNote && (
                <Group title="Accessibility">
                  <p className="px-3 pb-2.5 text-[11px] leading-relaxed text-[var(--ds-fg-secondary)]">
                    {m.a11yNote}
                  </p>
                </Group>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-1.5 text-[10px] text-[var(--ds-fg-muted)]">
          <span>Click = freeze</span>
          <span aria-hidden>·</span>
          <span>Esc = exit</span>
        </div>
      </div>
    </>,
    document.body,
  )
}

function quad([t, r, b, l]: [number, number, number, number]) {
  if (t === r && r === b && b === l) return `${t}px`
  if (t === b && l === r) return `${t}px ${r}px`
  return `${t} ${r} ${b} ${l}`
}

function shortShadow(s: string) {
  return s.split(',')[0].trim() + (s.includes(',') ? ' …' : '')
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[var(--ds-border-subtle)] last:border-0">
      <h4 className="px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--ds-fg-muted)]">
        {title}
      </h4>
      {children}
    </section>
  )
}

function Row({
  k,
  v,
  swatch,
  badge,
}: {
  k: string
  v: string
  swatch?: string
  badge?: { text: string; tone: 'success' | 'warning' | 'danger' }
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-[3px]">
      <span className="w-[74px] shrink-0 text-[11px] text-[var(--ds-fg-muted)]">{k}</span>
      {swatch && (
        <span
          className="h-3 w-3 shrink-0 rounded-[3px] ring-1 ring-inset ring-[var(--ds-border)]"
          style={{ background: swatch }}
        />
      )}
      <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--ds-fg-secondary)]">
        {v}
      </span>
      {badge && (
        <span
          className={cn(
            'shrink-0 rounded-[3px] px-1 py-px text-[9px] font-semibold uppercase',
            badge.tone === 'success' &&
              'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]',
            badge.tone === 'warning' &&
              'bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)]',
            badge.tone === 'danger' && 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
          )}
        >
          {badge.text}
        </span>
      )}
    </div>
  )
}
