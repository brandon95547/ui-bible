import * as React from 'react'
import { cn } from '@/lib/cn'
import type { Level, Swatch, SwatchRow, TypeStep } from '@/docs/data/phansora-sheet'

/* ===========================================================================
   DESIGN SHEET KIT

   A design sheet is a board: a masthead, then numbered cards three across —
   colors, type and buttons; forms, spacing and navigation; elevation,
   surfaces, feedback and accessibility; then what is particular to the
   product. Every block here reads the product's values from its data file and
   the page's own tokens from --ds-*, so inside a product's scope the chrome
   of the sheet is that product's chrome too.

   The board is a container: three across from 1240px of its own width, two
   from 720px, one below — so it answers to the room the page gives it, with
   the sidebar open or closed, not to the window.

   Nothing here knows which product it is drawing.
   ======================================================================== */

/** A product's theme, on a wrapper. Every --ds-* component inside takes it. */
export function SheetScope({
  vars,
  className,
  style,
  children,
}: {
  vars: Record<`--${string}`, string>
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div style={{ ...(vars as React.CSSProperties), ...style }} className={cn('text-[var(--ds-fg)]', className)}>
      {children}
    </div>
  )
}

/** "rgb(255 255 255 / 0.115)" reads as "#FFFFFF 11.5%"; a hex reads as itself. */
export function formatColor(value: string) {
  const rgb = value.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[/,]\s*([\d.]+))?\s*\)$/)
  if (!rgb) return value.toUpperCase()
  const hex = '#' + rgb.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
  const alpha = rgb[4] === undefined ? 1 : Number(rgb[4])
  return alpha < 1 ? `${hex} ${Math.round(alpha * 1000) / 10}%` : hex
}

/** WCAG 2 contrast between two opaque hex colors. */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const c = hex.replace('#', '').match(/../g)!.map((h) => parseInt(h, 16) / 255)
    const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/* -- The poster ------------------------------------------------------------ */

/** The sheet's own ground: the product's page, lit from two corners in its accent. */
export function Poster({
  vars,
  accent,
  children,
}: {
  vars: Record<`--${string}`, string>
  accent: string
  children: React.ReactNode
}) {
  return (
    <SheetScope
      vars={vars}
      className="@container overflow-hidden rounded-[28px] border border-[var(--ds-border)] p-4 sm:p-6"
      style={{
        ['--sheet-accent' as string]: accent,
        backgroundColor: 'var(--ds-canvas)',
        backgroundImage: [
          `radial-gradient(70rem 42rem at 0% 0%, color-mix(in srgb, ${accent} 14%, transparent), transparent 70%)`,
          `radial-gradient(60rem 40rem at 100% 100%, color-mix(in srgb, ${accent} 9%, transparent), transparent 70%)`,
        ].join(', '),
      }}
    >
      {children}
    </SheetScope>
  )
}

/** Mark and title, a rule, what the sheet is, and the pill that switches between a product's sheets. */
export function Masthead({
  mark,
  accent,
  title,
  subtitle,
  tagline,
  switcher,
}: {
  mark: React.ReactNode
  accent: string
  title: string
  subtitle: string
  tagline: string
  switcher?: React.ReactNode
}) {
  return (
    <header className="flex flex-wrap items-center gap-x-7 gap-y-4 px-1 pb-6 pt-2">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 35%, var(--ds-canvas)))`,
            boxShadow: `0 0 28px color-mix(in srgb, ${accent} 45%, transparent)`,
          }}
          aria-hidden
        >
          {mark}
        </span>
        <div className="min-w-0">
          <h1
            className="bg-clip-text text-[clamp(1.6rem,1.2rem+1.4cqw,2.125rem)] font-bold leading-tight tracking-[-0.015em] text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, var(--ds-fg), color-mix(in srgb, ${accent} 60%, var(--ds-fg)))`,
            }}
          >
            {title}
          </h1>
          <p className="mt-1 text-body-sm tracking-[0.1em] text-[var(--ds-fg-muted)]">{subtitle}</p>
        </div>
      </div>
      <p className="max-w-[26rem] flex-[1_1_16rem] text-body-sm text-[var(--ds-fg-secondary)] @min-[1024px]:border-l @min-[1024px]:border-[var(--ds-border-strong)] @min-[1024px]:pl-7">
        {tagline}
      </p>
      {switcher}
    </header>
  )
}

/** The pill that moves between a product's sheets. The current one is not a link. */
export function SheetSwitch({
  accent,
  items,
}: {
  accent: string
  items: { label: string; current?: boolean; render: (className: string) => React.ReactNode }[]
}) {
  return (
    <nav
      aria-label="Design sheets"
      className="ml-auto inline-flex items-center gap-3 rounded-full border border-[var(--ds-border-strong)] bg-[color-mix(in_srgb,var(--ds-surface)_70%,transparent)] px-[18px] py-2.5 text-body-sm text-[var(--ds-fg-muted)]"
    >
      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 14px ${accent}` }} aria-hidden />
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span aria-hidden>•</span>}
          {item.current ? (
            <span aria-current="page" className="font-medium text-[var(--ds-fg)]">
              {item.label}
            </span>
          ) : (
            item.render('transition-colors hover:text-[var(--ds-fg)]')
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

/* -- The board ------------------------------------------------------------- */

/** A card's width when the board is three across, out of twelve. */
export type Span = 3 | 4 | 5 | 7 | 8 | 12

const spanClass: Record<Span, string> = {
  3: '@min-[1240px]:col-span-3',
  4: '@min-[1240px]:col-span-4',
  5: '@min-[1240px]:col-span-5',
  7: '@min-[1240px]:col-span-7',
  8: '@min-[1240px]:col-span-8',
  12: '@min-[1240px]:col-span-12',
}

export function Board({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 @min-[720px]:grid-cols-2 @min-[1240px]:grid-cols-12">{children}</div>
  )
}

/**
 * One numbered card. `wide` takes the whole row when the board is two across,
 * for a card whose content needs the room (the palette, the forms).
 */
export function BoardCard({
  id,
  n,
  title,
  lede,
  span,
  wide,
  className,
  children,
}: {
  id: string
  n: number
  title: string
  lede: string
  span?: Span
  wide?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        'flex min-w-0 scroll-mt-24 flex-col gap-[18px] rounded-2xl border border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-surface)_70%,transparent)] p-5',
        wide && '@min-[720px]:col-span-2',
        span && spanClass[span],
        className,
      )}
    >
      <div>
        <h2 id={`${id}-title`} className="flex items-baseline gap-2.5 text-[18px] font-semibold leading-snug text-[var(--ds-fg)]">
          <span className="text-[var(--sheet-accent)]">{String(n).padStart(2, '0')}.</span>
          {title}
        </h2>
        <p className="mt-1 text-body-sm text-[var(--ds-fg-muted)]">{lede}</p>
      </div>
      {children}
    </section>
  )
}

/** Two cards stacked in one cell; the last stretches so the column ends with its row. */
export function BoardColumn({ span, children }: { span?: Span; children: React.ReactNode }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-3.5 [&>:last-child]:flex-1', span && spanClass[span])}>{children}</div>
  )
}

/** A group inside a card: its name, then the thing. */
export function Group({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  const Label = htmlFor ? 'label' : 'p'
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <Label htmlFor={htmlFor} className="text-label-sm text-[var(--ds-fg-secondary)]">
        {label}
      </Label>
      {children}
    </div>
  )
}

/** Groups side by side, as many as fit at `min` each. */
export function Groups({ min = 180, className, children }: { min?: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn('grid gap-x-4 gap-y-[18px]', className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}
    >
      {children}
    </div>
  )
}

/** The page's own ground inside a card, for a component whose look depends on what it stands on. */
export function Ground({ className, style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div
      className={cn('flex min-w-0 flex-col gap-3 rounded-xl border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-4', className)}
      style={style}
    >
      {children}
    </div>
  )
}

/** The scrim an overlay opens over, as a box in the card, so a dialog can sit in place. */
export function Stage({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--ds-border)] bg-[var(--ds-layer-scrim)] px-3.5 py-5',
        className,
      )}
    >
      {children}
    </div>
  )
}

const note = 'text-caption text-[var(--ds-fg-muted)]'
const mono = 'font-mono text-caption text-[var(--ds-fg-muted)] [overflow-wrap:anywhere]'

export function Note({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn(note, className)}>{children}</p>
}

/* -- 01 · Colors ------------------------------------------------------------ */

function chipStyle(s: Swatch): React.CSSProperties {
  switch (s.kind) {
    case 'line':
      return { backgroundColor: 'var(--ds-surface)', border: `2px solid ${s.value}` }
    case 'layer':
      return { backgroundColor: 'var(--ds-surface)', backgroundImage: `linear-gradient(${s.value}, ${s.value})` }
    case 'ring':
      return { backgroundColor: 'var(--ds-surface)', outline: `2px solid ${s.value}`, outlineOffset: 2 }
    default:
      return { backgroundColor: s.value }
  }
}

/** A row of chips, each with its name and its value. */
export function Swatches({ row }: { row: SwatchRow }) {
  return (
    <Group label={row.label}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-x-2.5 gap-y-3.5">
        {row.swatches.map((s) => (
          <figure key={s.name} className="m-0 flex min-w-0 flex-col gap-1.5">
            <span className="block h-12 rounded-[10px] border border-[var(--ds-border)]" style={chipStyle(s)} />
            <figcaption>
              <span className="block text-label-xs leading-snug text-[var(--ds-fg)]">{s.name}</span>
              <span className={cn('block leading-snug', note, '[overflow-wrap:anywhere]')}>{formatColor(s.value)}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Group>
  )
}

/* -- 02 · Typography ---------------------------------------------------------- */

/** Role and size on the left, the sample at the size it ships on the right. */
export function TypeSpecimen({ steps }: { steps: TypeStep[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((t) => (
        <div key={t.name} className="grid grid-cols-[78px_minmax(0,1fr)] items-baseline gap-3.5">
          <span className="flex flex-col gap-0.5">
            <span className="text-label-xs text-[var(--ds-fg)]">{t.name}</span>
            <span className={cn(note, 'whitespace-nowrap')}>
              {t.size} / {t.line}
            </span>
          </span>
          <p
            className="min-w-0"
            style={{
              fontSize: t.size,
              lineHeight: `${t.line}px`,
              fontWeight: t.weight,
              letterSpacing: t.tracking,
              textTransform: t.upper ? 'uppercase' : undefined,
              fontFamily: t.serif ? 'ui-serif, Georgia, Cambria, "Times New Roman", serif' : undefined,
              color: t.color,
            }}
          >
            {t.sample}
          </p>
        </div>
      ))}
    </div>
  )
}

/* -- 03 · Buttons ------------------------------------------------------------- */

/** Variants down, states across. A row's label is the first cell; its four states follow. */
export function StateMatrix({
  columns = ['Default', 'Hover', 'Pressed', 'Disabled'],
  rows,
}: {
  columns?: string[]
  rows: { label: string; cellStyle?: React.CSSProperties; cells: React.ReactNode[] }[]
}) {
  return (
    // A column is never narrower than its button, so a pill never runs into its neighbor;
    // in a narrow card the grid scrolls inside it rather than squeezing them together.
    <div className="grid grid-cols-[minmax(64px,auto)_repeat(4,minmax(max-content,1fr))] items-center gap-x-1.5 gap-y-2.5 overflow-x-auto py-0.5">
      <span />
      {columns.map((c) => (
        <span key={c} className={cn(note, 'text-center')}>
          {c}
        </span>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <span className="text-label-xs text-[var(--ds-fg)]">{row.label}</span>
          {row.cells.map((cell, i) => (
            <span key={i} className="flex min-w-0 justify-center rounded-xl" style={row.cellStyle}>
              {cell}
            </span>
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

/* -- 05 · Layout -------------------------------------------------------------- */

export function SpacingScale({ steps, accent }: { steps: number[]; accent: string }) {
  return (
    <div className="flex flex-wrap items-end gap-x-2.5 gap-y-3">
      {steps.map((px) => (
        <span key={px} className="flex flex-col items-center gap-2">
          <span className="block rounded-[3px]" style={{ width: px, height: px, backgroundColor: accent }} />
          <span className={note}>{px}</span>
        </span>
      ))}
    </div>
  )
}

export function RadiusScale({ radii }: { radii: number[] }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-3">
      {radii.map((r) => (
        <span key={r} className="flex flex-col items-center gap-2">
          <span
            className="block h-[38px] w-[38px] border border-[var(--ds-border-strong)] bg-[var(--ds-surface-raised)]"
            style={{ borderRadius: r }}
          />
          <span className={note}>{r >= 9999 ? 'full' : r}</span>
        </span>
      ))}
    </div>
  )
}

/** Bars, each as long as its share of the largest. */
export function BarScale({ rows, accent }: { rows: { name: string; value: number }[]; accent: string }) {
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => (
        <span key={r.name} className="grid grid-cols-[44px_minmax(0,1fr)_38px] items-center gap-2">
          <span className="font-mono text-caption text-[var(--ds-fg-secondary)]">{r.name}</span>
          <span className="block">
            <span
              className="block h-2.5 rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: `color-mix(in srgb, ${accent} 60%, transparent)` }}
            />
          </span>
          <span className={note}>{r.value}</span>
        </span>
      ))}
    </div>
  )
}

/* -- 07 · Elevation ------------------------------------------------------------ */

export function LevelTiles({ levels }: { levels: Level[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,76px),1fr))] gap-2.5">
      {levels.map((l) => (
        <div key={l.name} className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--ds-border)] p-3" style={{ backgroundColor: l.value }}>
            <span className="text-label-xs text-[var(--ds-fg)]">{l.name}</span>
            <span className={note}>{formatColor(l.value)}</span>
            <span className="mt-2 block h-[34px] rounded-lg border border-[var(--ds-border)]" style={{ backgroundColor: l.value }} />
          </div>
          <span className="text-caption text-[var(--ds-fg-secondary)]">{l.use}</span>
        </div>
      ))}
    </div>
  )
}

export function LevelTable({ levels, shadows }: { levels: Level[]; shadows: { name: string; value: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <table className="w-full border-collapse text-caption">
        <thead>
          <tr className="text-left text-[var(--ds-fg-muted)]">
            <th scope="col" className="px-2.5 py-2 font-medium">
              <span className="sr-only">Swatch</span>
            </th>
            <th scope="col" className="px-2.5 py-2 font-medium">Level</th>
            <th scope="col" className="px-2.5 py-2 font-medium">Value</th>
            <th scope="col" className="px-2.5 py-2 font-medium">Shadow</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((l) => (
            <tr key={l.name} className="border-t border-[var(--ds-border)] text-[var(--ds-fg-secondary)]">
              <td className="px-2.5 py-2">
                <span className="block h-[22px] w-[22px] rounded-md border border-[var(--ds-border-strong)]" style={{ backgroundColor: l.value }} />
              </td>
              <td className="whitespace-nowrap px-2.5 py-2">{l.name}</td>
              <td className="whitespace-nowrap px-2.5 py-2">{formatColor(l.value)}</td>
              <td className="whitespace-nowrap px-2.5 py-2">{l.shadow ?? 'None'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shadows.map((s) => (
        <p key={s.name} className={note}>
          {s.name} · <span className={mono}>{s.value}</span>
        </p>
      ))}
    </div>
  )
}

/* -- 10 · Accessibility --------------------------------------------------------- */

export function Tiles({ tiles }: { tiles: { icon: React.ReactNode; title: string; text: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-2.5">
      {tiles.map((t) => (
        <div
          key={t.title}
          className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-canvas)_50%,transparent)] p-3"
        >
          <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[var(--ds-surface-raised)] text-[var(--sheet-accent)] [&_svg]:h-[22px] [&_svg]:w-[22px]">
            {t.icon}
          </span>
          <div>
            <p className="text-label-xs text-[var(--ds-fg)]">{t.title}</p>
            <p className="mt-0.5 text-caption text-[var(--ds-fg-secondary)]">{t.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
