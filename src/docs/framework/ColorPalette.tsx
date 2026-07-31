import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy, useResolvedTokens } from '@/lib/hooks'

/* ---------------------------------------------------------------------------
   THE WHOLE PALETTE, READ OFF THE LIVE DOCUMENT

   Nothing here is hand-transcribed. Every value comes from getComputedStyle,
   so the board cannot drift from tokens.css, and flipping the theme re-reads
   the semantic half in place — which is the only honest way to show that the
   token *names* are the stable thing and the values are not.
   ------------------------------------------------------------------------ */

const RAMPS: { name: string; label: string; steps: number[] }[] = [
  {
    name: 'neutral',
    label: 'Neutral',
    steps: [0, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975, 1000],
  },
  { name: 'brand', label: 'Brand · Iris', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'success', label: 'Success · Emerald', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'warning', label: 'Warning · Amber', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'danger', label: 'Danger · Rose', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'info', label: 'Info · Blue', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
]

const VIZ = [1, 2, 3, 4, 5, 6, 7, 8]

const SEMANTIC_GROUPS: { label: string; tokens: string[] }[] = [
  {
    label: 'Surfaces',
    tokens: [
      '--ds-canvas',
      '--ds-sunken',
      '--ds-surface',
      '--ds-surface-raised',
      '--ds-surface-overlay',
      '--ds-surface-inset',
    ],
  },
  {
    label: 'Interaction layers',
    tokens: ['--ds-layer-hover', '--ds-layer-active', '--ds-layer-selected', '--ds-layer-scrim'],
  },
  {
    label: 'Foreground',
    tokens: [
      '--ds-fg',
      '--ds-fg-secondary',
      '--ds-fg-muted',
      '--ds-fg-disabled',
      '--ds-fg-on-accent',
      '--ds-fg-inverse',
    ],
  },
  {
    label: 'Borders',
    tokens: [
      '--ds-border-subtle',
      '--ds-border',
      '--ds-border-strong',
      '--ds-border-interactive',
    ],
  },
  {
    label: 'Brand & focus',
    tokens: [
      '--ds-accent',
      '--ds-accent-hover',
      '--ds-accent-active',
      '--ds-accent-fg',
      '--ds-accent-subtle',
      '--ds-accent-subtle-hover',
      '--ds-accent-border',
      '--ds-accent-text',
      '--ds-focus-ring',
      '--ds-focus-ring-offset',
    ],
  },
  ...(['success', 'warning', 'danger', 'info'] as const).map((role) => ({
    label: role[0].toUpperCase() + role.slice(1),
    tokens: [
      `--ds-${role}`,
      `--ds-${role}-hover`,
      `--ds-${role}-fg`,
      `--ds-${role}-subtle`,
      `--ds-${role}-border`,
      `--ds-${role}-text`,
    ],
  })),
]

const ALL_NAMES = [
  ...RAMPS.flatMap((r) => r.steps.map((s) => `--p-${r.name}-${s}`)),
  ...VIZ.map((i) => `--p-viz-${i}`),
  ...SEMANTIC_GROUPS.flatMap((g) => g.tokens),
]

export function ColorPalette() {
  const values = useResolvedTokens(ALL_NAMES)
  const { copy } = useCopy()
  const [copied, setCopied] = React.useState<string | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  // One shared "just copied" marker rather than a hook per chip — this board
  // renders about 150 of them.
  const onCopy = (token: string) => {
    const value = values[token]
    if (!value) return
    copy(value)
    setCopied(token)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---- TIER 1 ------------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-label text-[var(--ds-fg)]">Primitives</h3>
          <code className="font-mono text-[10px] text-[var(--ds-fg-muted)]">--p-*</code>
          <span className="text-caption text-[var(--ds-fg-muted)]">
            Raw values. Identical in both themes — never reference these from a component.
          </span>
        </div>

        {RAMPS.map((ramp) => (
          <div key={ramp.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <h4 className="text-label-sm text-[var(--ds-fg-secondary)]">{ramp.label}</h4>
              <code className="font-mono text-[10px] text-[var(--ds-fg-disabled)]">
                --p-{ramp.name}-*
              </code>
            </div>
            <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
              {ramp.steps.map((step) => {
                const token = `--p-${ramp.name}-${step}`
                return (
                  <Chip
                    key={token}
                    token={token}
                    value={values[token]}
                    caption={String(step)}
                    dark={step >= 500}
                    copied={copied === token}
                    onCopy={onCopy}
                  />
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <h4 className="text-label-sm text-[var(--ds-fg-secondary)]">Categorical</h4>
            <code className="font-mono text-[10px] text-[var(--ds-fg-disabled)]">--p-viz-*</code>
          </div>
          <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
            {VIZ.map((i) => {
              const token = `--p-viz-${i}`
              return (
                <Chip
                  key={token}
                  token={token}
                  value={values[token]}
                  caption={String(i)}
                  dark
                  copied={copied === token}
                  onCopy={onCopy}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* ---- TIER 2 ------------------------------------------------------- */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-label text-[var(--ds-fg)]">Semantics</h3>
          <code className="font-mono text-[10px] text-[var(--ds-fg-muted)]">--ds-*</code>
          <span className="text-caption text-[var(--ds-fg-muted)]">
            What components actually use. Switch the theme and every value below re-reads.
          </span>
        </div>

        {SEMANTIC_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <h4 className="text-overline uppercase text-[var(--ds-fg-secondary)]">{group.label}</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {group.tokens.map((token) => (
                <SemanticSwatch
                  key={token}
                  token={token}
                  value={values[token]}
                  copied={copied === token}
                  onCopy={onCopy}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

/** One step of a primitive ramp. The hex only appears on hover — seventeen
 *  permanent labels would drown the ramp they are describing. */
function Chip({
  token,
  value,
  caption,
  dark,
  copied,
  onCopy,
}: {
  token: string
  value?: string
  caption: string
  dark: boolean
  copied: boolean
  onCopy: (token: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(token)}
      title={`${token} — ${value ?? ''}`}
      aria-label={`Copy ${token}, ${value ?? 'unresolved'}`}
      className="group relative h-14 flex-1 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
      style={{ background: value }}
    >
      <span
        className={cn(
          'absolute inset-x-0 bottom-1 truncate px-0.5 text-center font-mono text-[9px] tabular-nums',
          'opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
          dark ? 'text-white/90' : 'text-black/70',
        )}
      >
        {copied ? 'copied' : caption}
      </span>
    </button>
  )
}

/** One semantic token: swatch, name, resolved value. */
function SemanticSwatch({
  token,
  value,
  copied,
  onCopy,
}: {
  token: string
  value?: string
  copied: boolean
  onCopy: (token: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(token)}
      title={`Copy ${value ?? token}`}
      className={cn(
        'flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]',
        'bg-[var(--ds-surface)] px-2.5 py-2 text-left transition-colors',
        'hover:border-[var(--ds-border-strong)]',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
    >
      {/* Backed by the canvas so alpha layers composite against something real
          instead of vanishing into the card they sit on. */}
      <span className="h-8 w-8 shrink-0 rounded-[var(--radius-sm)] bg-[var(--ds-canvas)]">
        <span
          className="block h-full w-full rounded-[var(--radius-sm)] ring-1 ring-inset ring-[var(--ds-border)]"
          style={{ background: value }}
        />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-mono text-[11px] text-[var(--ds-fg)]">{token}</span>
        <span className="flex items-center gap-1 truncate font-mono text-[10px] uppercase text-[var(--ds-fg-muted)]">
          {copied ? (
            <>
              <Check size={10} className="text-[var(--ds-success-text)]" /> copied
            </>
          ) : (
            (value ?? '—')
          )}
        </span>
      </span>
    </button>
  )
}
