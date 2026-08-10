import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'
import { Badge } from '@/ui/Display'
import { Knob, KnobSelect } from './PreviewStage'
import {
  auditColor,
  byHue,
  byLightness,
  formatColor,
  grade,
  readableOn,
  type Format,
} from './palette'
import type { PaletteColor } from '@/docs/data/flat-ui-colors'

/* ===========================================================================
   THE PALETTE SHEET
   A borrowed palette rendered so that it can be judged rather than admired.
   Twenty pretty rectangles is what every palette site already gives you; what
   it does not give you is which of the twenty can hold text, which can only be
   a background, and what happens to all of them on a dark surface.
   ======================================================================== */

const FORMATS = ['HEX', 'RGB', 'HSL'] as const
const ORDERS = ['Source', 'Hue', 'Lightness'] as const
type Order = (typeof ORDERS)[number]

function order(colors: readonly PaletteColor[], by: Order) {
  if (by === 'Hue') return byHue(colors)
  if (by === 'Lightness') return byLightness(colors)
  return [...colors]
}

export function PaletteSheet({ colors }: { colors: readonly PaletteColor[] }) {
  const [format, setFormat] = React.useState<Format>('HEX')
  const [by, setBy] = React.useState<Order>('Source')
  const rows = React.useMemo(() => order(colors, by), [colors, by])

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Knob label="Format">
          <KnobSelect value={format} onChange={(v) => setFormat(v as Format)} options={FORMATS} />
        </Knob>
        <Knob label="Order">
          <KnobSelect value={by} onChange={(v) => setBy(v as Order)} options={ORDERS} />
        </Knob>
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Click any swatch to copy its value.
        </span>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(9.5rem, 1fr))' }}
      >
        {rows.map((c) => (
          <SwatchCard key={c.slug} color={c} format={format} />
        ))}
      </div>
    </div>
  )
}

/**
 * One colour, labelled in the only text colour that passes on it. The label is
 * not decoration — it is the first honest thing you learn about a swatch, and
 * a palette whose names all come out white is a palette with no text colours
 * in it.
 */
function SwatchCard({ color, format }: { color: PaletteColor; format: Format }) {
  const { copied, copy } = useCopy()
  const value = formatColor(color.hex, format)
  const ink = readableOn(color.hex)
  const audit = auditColor(color.hex)

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      title={`${color.name} — ${value}`}
      aria-label={`Copy ${color.name}, ${value}`}
      className={cn(
        'group relative flex h-[5.5rem] flex-col justify-end overflow-hidden rounded-[var(--radius-md)]',
        'border border-[var(--ds-border-subtle)] p-2.5 text-left transition-transform duration-[140ms]',
        'hover:-translate-y-px hover:shadow-e2',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
      style={{ background: color.hex, color: ink }}
    >
      {/* The ratio the label itself is achieving, revealed on hover. Reading it
          off the thing you are looking at beats reading it off a table. */}
      <span
        aria-hidden
        className="absolute right-2 top-2 font-mono text-[9px] tabular-nums opacity-0 transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70"
      >
        {audit.labelRatio.toFixed(1)}:1
      </span>
      <span className="truncate text-label-sm leading-tight">{color.name}</span>
      <span className="flex items-center gap-1 truncate font-mono text-[10.5px] uppercase opacity-80">
        {copied ? (
          <>
            <Check size={10} /> copied
          </>
        ) : (
          value
        )}
      </span>
    </button>
  )
}

/**
 * The palette with the labels taken away. Useful as an identifier — you
 * recognise a palette by its bar long before you recognise it by its names.
 */
export function PaletteStrip({
  colors,
  className,
  height = 40,
}: {
  colors: readonly { hex: string; name?: string }[]
  className?: string
  height?: number
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]',
        className,
      )}
      style={{ height }}
    >
      {colors.map((c, i) => (
        <span key={`${c.hex}-${i}`} className="flex-1" style={{ background: c.hex }} />
      ))}
    </span>
  )
}

/* ---- the audit ----------------------------------------------------------- */

const INK_COPY = {
  light: { label: 'Light only', tone: 'neutral' },
  dark: { label: 'Dark only', tone: 'neutral' },
  both: { label: 'Light or dark', tone: 'success' },
} as const

/**
 * Every colour against white and against black. Read a row in both directions:
 * 4.86:1 on white is equally "this colour as text on a white page" and "white
 * as a label on this colour as a fill" — it is one relationship, not two.
 *
 * The verdict column answers the question people mean when they ask whether a
 * colour is accessible, which is which surface it can be ink on. It is almost
 * never both; see the identity in palette.ts.
 */
export function ContrastAudit({ colors }: { colors: readonly PaletteColor[] }) {
  const rows = React.useMemo(
    () => byLightness(colors).map((c) => ({ ...c, ...auditColor(c.hex) })),
    [colors],
  )

  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Colour
            </th>
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              On white
            </th>
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              On black
            </th>
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Ink on
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <td className="px-3 py-2">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-6 w-6 shrink-0 rounded-[var(--radius-sm)] ring-1 ring-inset ring-black/10"
                    style={{ background: r.hex }}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[var(--ds-fg-secondary)]">{r.name}</span>
                    <span className="font-mono text-[10.5px] uppercase text-[var(--ds-fg-muted)]">
                      {r.hex}
                    </span>
                  </span>
                </span>
              </td>
              <Cell hex={r.hex} bg="#ffffff" ratio={r.onWhite} />
              <Cell hex={r.hex} bg="#000000" ratio={r.onBlack} />
              <td className="whitespace-nowrap px-3 py-2">
                <Badge tone={INK_COPY[r.ink].tone} size="sm">
                  {INK_COPY[r.ink].label}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Cell({ hex, bg, ratio }: { hex: string; bg: string; ratio: number }) {
  const g = grade(ratio)
  return (
    <td className="whitespace-nowrap px-3 py-2">
      <span className="flex items-center gap-2">
        <span
          className="rounded-[4px] px-1.5 py-0.5 text-caption ring-1 ring-inset ring-black/10"
          style={{ color: hex, background: bg }}
        >
          Aa
        </span>
        <span className="font-mono text-[11px] tabular-nums text-[var(--ds-fg-secondary)]">
          {ratio.toFixed(2)}
        </span>
        <span
          className={cn(
            'text-[10px] uppercase',
            g === 'Fail' ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-muted)]',
          )}
        >
          {g}
        </span>
      </span>
    </td>
  )
}

/* ---- the palette doing a job -------------------------------------------- */

const SERIES = [62, 38, 74, 51, 29, 66]

/**
 * The same six colours on a white card and a near-black one. Almost every
 * palette in this collection was drawn on one of the two, and the pair is the
 * fastest way to find out which — a set tuned for dark surfaces loses its pale
 * end on white, and a set tuned for white loses its dark end on black.
 */
export function PaletteInUse({ colors }: { colors: readonly PaletteColor[] }) {
  const picks = React.useMemo(() => byHue(colors).filter((_, i) => i % 3 === 0).slice(0, 6), [colors])

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {(
        [
          { bg: '#ffffff', fg: '#101114', line: 'rgb(0 0 0 / 0.10)', label: 'On white' },
          { bg: '#14161a', fg: '#eef0f4', line: 'rgb(255 255 255 / 0.12)', label: 'On near-black' },
        ] as const
      ).map((surface) => (
        <div
          key={surface.label}
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-4"
          style={{ background: surface.bg, color: surface.fg }}
        >
          <span className="text-overline uppercase opacity-60">{surface.label}</span>

          {/* bars */}
          <span className="flex h-24 items-end gap-2" aria-hidden>
            {picks.map((c, i) => (
              <span
                key={c.slug}
                className="flex-1 rounded-t-[3px]"
                style={{ background: c.hex, height: `${SERIES[i]}%` }}
              />
            ))}
          </span>
          <span className="h-px w-full" style={{ background: surface.line }} aria-hidden />

          {/* legend, which is where a palette usually fails: the swatch is
              legible and the label beside it is not */}
          <span className="flex flex-wrap gap-x-3 gap-y-1.5">
            {picks.map((c) => (
              <span key={c.slug} className="flex items-center gap-1.5 text-[11px]">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: c.hex }}
                />
                <span className="truncate opacity-80">{c.name}</span>
              </span>
            ))}
          </span>

          {/* the same colours asked to hold text */}
          <span className="flex flex-wrap gap-1.5">
            {picks.slice(0, 4).map((c) => (
              <span
                key={c.slug}
                className="rounded-full px-2 py-0.5 text-[11px]"
                style={{ background: c.hex, color: readableOn(c.hex) }}
              >
                {c.name.split(' ')[0]}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
