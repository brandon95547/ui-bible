import * as React from 'react'
import {
  AlertTriangle,
  Check,
  Ear,
  Gauge,
  Hand,
  Keyboard,
  Lightbulb,
  Link2,
  Palette,
  Ruler,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/ui/Display'
import { CodeBlock } from './CodeBlock'
import type {
  A11ySpec,
  AnatomySpec,
  ApiProp,
  Guidance,
  NotesSpec,
  SizeRow,
  TokenCategory,
  TokenUse,
} from './types'

/* ===========================================================================
   SECTION
   ======================================================================== */

export function Section({
  id,
  index,
  title,
  description,
  children,
  className,
}: {
  id: string
  index?: number
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn('scroll-mt-28', className)}>
      <header className="mb-5 flex flex-col gap-2">
        <div className="group flex items-baseline gap-3">
          {index !== undefined && (
            <span
              aria-hidden
              className="select-none font-mono text-caption tabular-nums text-[var(--ds-fg-disabled)]"
            >
              {String(index).padStart(2, '0')}
            </span>
          )}
          <h2 className="text-h2 text-[var(--ds-fg)]">{title}</h2>
          <a
            href={`#${id}`}
            aria-label={`Link to ${title}`}
            className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Link2 size={14} className="text-[var(--ds-fg-muted)]" />
          </a>
        </div>
        {description && (
          <p className="max-w-[62ch] text-body text-[var(--ds-fg-muted)]">{description}</p>
        )}
      </header>
      {children}
    </section>
  )
}

export function SubHeading({
  children,
  description,
}: {
  children: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div className="mb-3 mt-8 flex flex-col gap-1 first:mt-0">
      <h3 className="text-h4 text-[var(--ds-fg)]">{children}</h3>
      {description && (
        <p className="max-w-[62ch] text-body-sm text-[var(--ds-fg-muted)]">{description}</p>
      )}
    </div>
  )
}

/* ===========================================================================
   OVERVIEW BLOCKS
   ======================================================================== */

export function UseList({
  items,
  tone,
}: {
  items: { text: string; instead?: string; to?: string }[]
  tone: 'do' | 'dont'
}) {
  const good = tone === 'do'
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((it) => (
        <li key={it.text} className="flex gap-2.5">
          <span
            aria-hidden
            className={cn(
              'mt-[3px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full',
              good
                ? 'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]'
                : 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
            )}
          >
            {good ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
          </span>
          <span className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
            {it.text}
            {it.instead && (
              <>
                {' '}
                <span className="text-[var(--ds-fg-muted)]">
                  Use{' '}
                  {it.to ? (
                    <a
                      href={it.to}
                      className="text-[var(--ds-accent-text)] underline-offset-2 hover:underline"
                    >
                      {it.instead}
                    </a>
                  ) : (
                    <span className="text-[var(--ds-fg-secondary)]">{it.instead}</span>
                  )}{' '}
                  instead.
                </span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ===========================================================================
   ANATOMY
   ======================================================================== */

const kindColor: Record<NonNullable<AnatomySpec['parts'][number]['kind']>, string> = {
  space: 'var(--p-brand-400)',
  size: 'var(--p-info-400)',
  color: 'var(--p-viz-5)',
  type: 'var(--p-success-400)',
  shape: 'var(--p-warning-400)',
  motion: 'var(--p-viz-6)',
}

export function AnatomyView({ spec }: { spec: AnatomySpec }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-3">
        <div className="flex min-h-[13rem] items-center justify-center overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-8">
          {spec.render}
        </div>
        {spec.caption && (
          <p className="text-caption text-[var(--ds-fg-muted)]">{spec.caption}</p>
        )}
      </div>

      <ol className="flex flex-col gap-0">
        {spec.parts.map((p, i) => (
          <li
            key={p.n}
            className={cn(
              'flex gap-3 py-2.5',
              i !== spec.parts.length - 1 && 'border-b border-[var(--ds-border-subtle)]',
            )}
          >
            <span
              aria-hidden
              className="mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[10px] font-bold text-[var(--ds-canvas)]"
              style={{ background: kindColor[p.kind ?? 'space'] }}
            >
              {p.n}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-label text-[var(--ds-fg)]">{p.label}</span>
                {p.value && (
                  <span className="font-mono text-[11px] text-[var(--ds-accent-text)]">
                    {p.value}
                  </span>
                )}
              </div>
              <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">{p.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** A dimension arrow with a label. Used inside anatomy diagrams. */
export function Dim({
  size,
  label,
  axis = 'x',
  className,
}: {
  size: number | string
  label: string
  axis?: 'x' | 'y'
  className?: string
}) {
  const style = axis === 'x' ? { width: size } : { height: size }
  return (
    <span
      className={cn(
        'relative flex items-center justify-center',
        axis === 'x' ? 'h-4' : 'w-4 flex-col',
        className,
      )}
      style={style}
    >
      <span
        aria-hidden
        className={cn(
          'absolute bg-[var(--ds-accent)]',
          axis === 'x' ? 'inset-x-0 h-px' : 'inset-y-0 w-px',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute bg-[var(--ds-accent)]',
          axis === 'x' ? 'left-0 h-2 w-px' : 'top-0 h-px w-2',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'absolute bg-[var(--ds-accent)]',
          axis === 'x' ? 'right-0 h-2 w-px' : 'bottom-0 h-px w-2',
        )}
      />
      <span
        className={cn(
          'relative z-10 rounded-[3px] bg-[var(--ds-surface-inset)] px-1 font-mono text-[10px] text-[var(--ds-accent-text)]',
          axis === 'y' && 'rotate-0',
        )}
      >
        {label}
      </span>
    </span>
  )
}

/* ===========================================================================
   TOKEN TABLE
   ======================================================================== */

const catMeta: Record<TokenCategory, { label: string; icon: React.ReactNode }> = {
  color: { label: 'Color', icon: <Palette size={13} /> },
  spacing: { label: 'Spacing', icon: <Ruler size={13} /> },
  radius: { label: 'Radius', icon: <Sparkles size={13} /> },
  shadow: { label: 'Shadow', icon: <Gauge size={13} /> },
  typography: { label: 'Typography', icon: <Target size={13} /> },
  motion: { label: 'Motion', icon: <Sparkles size={13} /> },
}

const CAT_ORDER: TokenCategory[] = ['color', 'spacing', 'radius', 'shadow', 'typography', 'motion']

export function TokenTable({ tokens }: { tokens: TokenUse[] }) {
  const [live, setLive] = React.useState<Record<string, string>>({})

  // Resolve each token's computed value from the live document, so the table
  // can never drift from the CSS the way a hand-written value would.
  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const next: Record<string, string> = {}
    tokens.forEach((t) => {
      const name = t.token.startsWith('--') ? t.token.split(/\s/)[0] : null
      if (name) {
        const v = cs.getPropertyValue(name).trim()
        if (v) next[t.token] = v
      }
    })
    setLive(next)
  }, [tokens])

  const grouped = CAT_ORDER.map((c) => [c, tokens.filter((t) => t.category === c)] as const).filter(
    ([, list]) => list.length > 0,
  )

  // Sub-headings within a category, in first-appearance order. Tokens with no
  // `group` collect under '' and render as a plain run of rows, so any page
  // that has not opted in looks exactly as it did before.
  const subGroups = (list: TokenUse[]) => {
    const order: string[] = []
    const byGroup = new Map<string, TokenUse[]>()
    list.forEach((t) => {
      const key = t.group ?? ''
      if (!byGroup.has(key)) {
        order.push(key)
        byGroup.set(key, [])
      }
      byGroup.get(key)!.push(t)
    })
    return order.map((k) => [k, byGroup.get(k)!] as const)
  }

  return (
    <div className="flex flex-col gap-5">
      {grouped.map(([cat, list]) => (
        <div key={cat}>
          <div className="mb-2 flex items-center gap-2 text-[var(--ds-fg-muted)]">
            {catMeta[cat].icon}
            <h3 className="text-overline uppercase">{catMeta[cat].label}</h3>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
                  <th scope="col" className="w-[16rem] px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                    Token
                  </th>
                  <th scope="col" className="w-[13rem] px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                    Value
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                    Used for
                  </th>
                </tr>
              </thead>
              <tbody>
                {subGroups(list).map(([groupName, rows]) => (
                  <React.Fragment key={groupName || '__ungrouped'}>
                    {groupName && (
                      <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-layer-hover)]">
                        <th
                          scope="colgroup"
                          colSpan={3}
                          className="px-3 py-1.5 text-left text-overline uppercase text-[var(--ds-fg-secondary)]"
                        >
                          {groupName}
                        </th>
                      </tr>
                    )}
                    {rows.map((t) => {
                  const value = t.value ?? live[t.token] ?? '—'
                  const isColor =
                    cat === 'color' && /^(#|rgb|hsl|oklch|color-mix)/i.test(value.trim())
                  return (
                    <tr
                      key={t.token + t.usedFor}
                      className="border-b border-[var(--ds-border-subtle)] last:border-0"
                    >
                      <td className="px-3 py-2 align-top">
                        <span className="font-mono text-[12px] text-[var(--ds-accent-text)]">
                          {t.token}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="flex items-center gap-2">
                          {isColor && (
                            <span
                              className="h-3.5 w-3.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-[var(--ds-border)]"
                              style={{ background: value }}
                            />
                          )}
                          <span className="font-mono text-[11.5px] text-[var(--ds-fg-secondary)]">
                            {value}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top text-[var(--ds-fg-muted)]">{t.usedFor}</td>
                    </tr>
                  )
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===========================================================================
   SIZE TABLE
   ======================================================================== */

const SIZE_COLS: { key: keyof SizeRow; label: string }[] = [
  { key: 'height', label: 'Height' },
  { key: 'padding', label: 'Padding' },
  { key: 'radius', label: 'Radius' },
  { key: 'icon', label: 'Icon' },
  { key: 'gap', label: 'Label gap' },
  { key: 'type', label: 'Type' },
  { key: 'minWidth', label: 'Min width' },
  { key: 'maxWidth', label: 'Max width' },
  { key: 'touch', label: 'Touch target' },
]

export function SizeTable({ rows }: { rows: SizeRow[] }) {
  const cols = SIZE_COLS.filter((c) => rows.some((r) => r[c.key]))
  return (
    <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
            <th scope="col" className="whitespace-nowrap px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Size
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]"
              >
                {c.label}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              When to use
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <th scope="row" className="whitespace-nowrap px-3 py-2 text-left text-label text-[var(--ds-fg)]">
                {r.name}
              </th>
              {cols.map((c) => (
                <td
                  key={c.key}
                  className="whitespace-nowrap px-3 py-2 font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-secondary)]"
                >
                  {r[c.key] ?? '—'}
                </td>
              ))}
              <td className="px-3 py-2 text-[var(--ds-fg-muted)]">{r.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ===========================================================================
   DO / DON'T
   ======================================================================== */

export function GuidanceGrid({ items, tone }: { items: Guidance[]; tone: 'do' | 'dont' }) {
  const good = tone === 'do'
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((g) => (
        <figure
          key={g.title}
          className={cn(
            'flex flex-col overflow-hidden rounded-[var(--radius-xl)] border',
            good ? 'border-[var(--ds-success-border)]' : 'border-[var(--ds-danger-border)]',
          )}
        >
          {g.render && (
            <div
              className={cn(
                'flex min-h-[8.5rem] flex-1 flex-wrap items-center justify-center gap-3 p-6',
                good ? 'bg-[var(--ds-success-subtle)]' : 'bg-[var(--ds-danger-subtle)]',
              )}
            >
              {g.render}
            </div>
          )}
          <figcaption
            className={cn(
              'flex gap-2.5 border-t bg-[var(--ds-surface)] p-3.5',
              good ? 'border-[var(--ds-success-border)]' : 'border-[var(--ds-danger-border)]',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full',
                good
                  ? 'bg-[var(--ds-success)] text-[var(--ds-success-fg)]'
                  : 'bg-[var(--ds-danger)] text-[var(--ds-danger-fg)]',
              )}
            >
              {good ? <Check size={11} strokeWidth={3.2} /> : <X size={11} strokeWidth={3.2} />}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-label text-[var(--ds-fg)]">{g.title}</span>
              <span className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                {g.why}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/* ===========================================================================
   ACCESSIBILITY PANEL
   ======================================================================== */

export function A11yPanel({ spec }: { spec: A11ySpec }) {
  return (
    <div className="flex flex-col gap-5">
      {spec.criteria && spec.criteria.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {spec.criteria.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] py-1 pl-2.5 pr-1.5 text-caption text-[var(--ds-fg-secondary)]"
            >
              <span className="font-mono text-[11px] text-[var(--ds-fg-muted)]">{c.id}</span>
              {c.name}
              <Badge tone={c.level === 'AAA' ? 'accent' : 'success'} size="sm">
                {c.level}
              </Badge>
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <A11yCard icon={<ShieldCheck size={14} />} title="Contrast">
          <ul className="flex flex-col gap-1.5">
            {spec.contrast.map((c) => (
              <Bullet key={c}>{c}</Bullet>
            ))}
          </ul>
        </A11yCard>

        <A11yCard icon={<Keyboard size={14} />} title="Keyboard">
          <table className="w-full border-collapse">
            <tbody>
              {spec.keyboard.map((k) => (
                <tr key={k.keys} className="align-top">
                  <td className="py-1 pr-3 whitespace-nowrap">
                    <kbd className="inline-block rounded-[5px] border border-b-2 border-[var(--ds-border)] bg-[var(--ds-surface-raised)] px-1.5 py-px font-sans text-[11px] font-medium text-[var(--ds-fg-secondary)]">
                      {k.keys}
                    </kbd>
                  </td>
                  <td className="py-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                    {k.does}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </A11yCard>

        <A11yCard icon={<Ear size={14} />} title="Screen readers">
          <ul className="flex flex-col gap-1.5">
            {spec.screenReader.map((s) => (
              <Bullet key={s}>{s}</Bullet>
            ))}
          </ul>
        </A11yCard>

        <A11yCard icon={<Target size={14} />} title="Focus & touch">
          <ul className="flex flex-col gap-1.5">
            <Bullet>{spec.focus}</Bullet>
            <Bullet>{spec.touch}</Bullet>
          </ul>
        </A11yCard>
      </div>

      {spec.aria.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
                <th scope="col" className="w-56 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                  Attribute
                </th>
                <th scope="col" className="w-44 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                  Applied to
                </th>
                <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {spec.aria.map((a) => (
                <tr key={a.attr + a.on} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                  <td className="px-3 py-2 align-top font-mono text-[12px] text-[var(--ds-accent-text)]">
                    {a.attr}
                  </td>
                  <td className="px-3 py-2 align-top font-mono text-[11.5px] text-[var(--ds-fg-secondary)]">
                    {a.on}
                  </td>
                  <td className="px-3 py-2 align-top text-[var(--ds-fg-muted)]">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function A11yCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
      <div className="mb-2.5 flex items-center gap-2 text-[var(--ds-fg-secondary)]">
        {icon}
        <h3 className="text-label">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
      <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--ds-fg-disabled)]" />
      <span>{children}</span>
    </li>
  )
}

/* ===========================================================================
   API TABLE
   ======================================================================== */

export function PropsTable({ name, props }: { name: string; props: ApiProp[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-label text-[var(--ds-fg)]">{name}</h3>
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
              <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Prop
              </th>
              <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Type
              </th>
              <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Default
              </th>
              <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                <td className="whitespace-nowrap px-3 py-2 align-top">
                  <span className="font-mono text-[12px] text-[var(--ds-fg)]">{p.name}</span>
                  {p.required && (
                    <span className="ml-1 text-[var(--ds-danger-text)]" title="Required">
                      *
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <span className="font-mono text-[11.5px] leading-relaxed text-[var(--ds-accent-text)]">
                    {p.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-[11.5px] text-[var(--ds-fg-muted)]">
                  {p.default ?? '—'}
                </td>
                <td className="px-3 py-2 align-top text-[var(--ds-fg-muted)]">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ===========================================================================
   NOTES
   ======================================================================== */

const noteMeta = {
  tips: { title: 'Professional tips', icon: <Lightbulb size={14} />, tone: 'accent' },
  performance: { title: 'Performance', icon: <Gauge size={14} />, tone: 'info' },
  mistakes: { title: 'Common mistakes', icon: <AlertTriangle size={14} />, tone: 'warning' },
  realWorld: { title: 'Real-world recommendations', icon: <Hand size={14} />, tone: 'success' },
} as const

export function NotesGrid({ notes }: { notes: NotesSpec }) {
  const keys = (Object.keys(noteMeta) as (keyof typeof noteMeta)[]).filter(
    (k) => (notes[k]?.length ?? 0) > 0,
  )
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {keys.map((k) => {
        const meta = noteMeta[k]
        return (
          <div
            key={k}
            className="rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4"
          >
            <div
              className={cn(
                'mb-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1',
                meta.tone === 'accent' && 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
                meta.tone === 'info' && 'bg-[var(--ds-info-subtle)] text-[var(--ds-info-text)]',
                meta.tone === 'warning' &&
                  'bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)]',
                meta.tone === 'success' &&
                  'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]',
              )}
            >
              {meta.icon}
              <h3 className="text-label-sm uppercase tracking-wide">{meta.title}</h3>
            </div>
            <ul className="flex flex-col gap-2">
              {notes[k]!.map((n) => (
                <li
                  key={n}
                  className="flex gap-2 text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]"
                >
                  <span
                    aria-hidden
                    className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--ds-fg-disabled)]"
                  />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

/* ===========================================================================
   MISC SHARED
   ======================================================================== */

export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-[68ch] text-body leading-relaxed text-[var(--ds-fg-secondary)]',
        '[&_p+p]:mt-3.5 [&_strong]:font-semibold [&_strong]:text-[var(--ds-fg)]',
        '[&_a]:text-[var(--ds-accent-text)] [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_ul]:mt-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_li]:pl-4 [&_li]:relative',
        "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:h-1 [&_li]:before:w-1 [&_li]:before:rounded-full [&_li]:before:bg-[var(--ds-fg-disabled)] [&_li]:before:content-['']",
        className,
      )}
    >
      {children}
    </div>
  )
}

export { CodeBlock }
