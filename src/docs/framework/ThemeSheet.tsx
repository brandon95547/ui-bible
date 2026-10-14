import * as React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'
import { Badge } from '@/ui/Display'
import { contrast, withAlpha } from './palette'
import {
  buttonContrast,
  classLabel,
  contrastRows,
  describe,
  handles,
  over,
  paint,
  type ThemeClass,
  type ThemeHandles,
} from './theme-system'
import type {
  ButtonStyle,
  DecorativeItem,
  Evidence,
  RawRamp,
  SiteTheme,
  ThemeToken,
} from '@/docs/data/site-theme'

/* ===========================================================================
   A THEME SHEET, DRAWN IN THE THEME

   Every board below is painted with the site's own page color and puts the
   site's own controls on it. Nothing inside one reads a --ds-* token: in here
   our system does not exist, and if it leaked in, every site would come out
   looking a little like us.

   The order is the order a developer needs it in. What it looks like; what to
   stand things on; what to write and rule with; what a button is. Everything
   else the stylesheet contains is at the bottom, shut.

   Nothing here knows which site it is drawing. Roles are looked up by key, and
   a role the site does not have is simply not drawn.
   ======================================================================== */

/* ---- small shared parts -------------------------------------------------- */

/**
 * The canvas: the site's page, with the site's text color and edge.
 *
 * It is also a size container, and every multi-column layout inside one is
 * written against it (`@2xl:`) rather than against the window. A board sits in
 * a documentation column between a sidebar and a table of contents, so the
 * window being 1400px wide says nothing about whether three columns fit.
 */
function Board({
  theme,
  children,
  className,
  flush,
}: {
  theme: SiteTheme
  children: React.ReactNode
  className?: string
  /** No padding — for a specimen that runs to the board's edge. */
  flush?: boolean
}) {
  const h = handles(theme)
  return (
    <div
      className={cn('@container w-full overflow-hidden rounded-[var(--radius-lg)]', !flush && 'p-4 sm:p-5', className)}
      style={{ background: h.page, color: h.ink, border: `1px solid ${h.border('border-default')}` }}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <p className="text-overline uppercase" style={{ color }}>
      {children}
    </p>
  )
}

/**
 * Seen, or decided. A filled dot and a hollow one, so the difference survives
 * grayscale and does not depend on reading the word — though the word is there.
 */
function EvidenceMark({ evidence, color }: { evidence: Evidence; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-caption"
      style={{ color }}
      title={
        evidence === 'observed'
          ? 'Read off a rendered component, or the rule that paints one'
          : 'A real value; the role is our reading of it'
      }
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={evidence === 'observed' ? { background: color } : { boxShadow: `inset 0 0 0 1px ${color}` }}
      />
      {evidence === 'observed' ? 'Observed' : 'Inferred'}
    </span>
  )
}

/** A value you can click to copy. The text IS the button, so there is no icon to aim for. */
function CopyValue({
  value,
  display,
  color,
  className,
}: {
  value: string
  display?: string
  color: string
  className?: string
}) {
  const { copied, copy } = useCopy(1200)
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      title={`Copy ${value}`}
      aria-label={`Copy ${value}`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-[4px] font-mono text-caption',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
      style={{ color, outlineColor: color }}
    >
      {copied ? (
        <>
          <Check size={12} aria-hidden /> Copied
        </>
      ) : (
        (display ?? value)
      )}
    </button>
  )
}

/** The site's name for a token, and the step of its ramp behind it. */
function Source({ token, color }: { token: { source?: string; ref?: string }; color: string }) {
  if (!token.source && !token.ref) return null
  return (
    <span className="font-mono text-caption" style={{ color }}>
      {[token.source, token.ref].filter(Boolean).join(' → ')}
    </span>
  )
}

function buttonCss(b: ButtonStyle): React.CSSProperties {
  return {
    background: b.fill ? paint(b.fill.hex, b.fill.alpha) : 'transparent',
    color: b.ink,
    border: `1px solid ${b.border ? paint(b.border.hex, b.border.alpha) : 'transparent'}`,
    borderRadius: b.radius,
  }
}

/** A button as the site draws it. A span: these are pictures of buttons. */
function ButtonSample({
  button,
  children,
  className,
  style,
}: {
  button: ButtonStyle
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn('inline-flex h-9 items-center justify-center whitespace-nowrap px-4 text-label', className)}
      style={{ ...buttonCss(button), ...style }}
    >
      {children}
    </span>
  )
}

/* ---- 00 · the overview --------------------------------------------------- */

/**
 * The first thing on the page, and the point of it: a screen of the site,
 * drawn from the tokens below and nothing else. If this does not look like the
 * website, the tokens are wrong — which is a better test than any table.
 *
 * Artwork is drawn as blank tiles on purpose. On a media product the covers
 * are most of the color on the screen and none of the theme.
 */
function Specimen({ theme, h }: { theme: SiteTheme; h: ThemeHandles }) {
  const sp = theme.specimen
  const primary = h.button('button-primary')
  const secondary = h.button('button-secondary')
  const selected = h.state('state-selected')
  const hairline = h.border('border-subtle')

  return (
    <div
      role="img"
      aria-label={`A screen of ${theme.site}’s interface, drawn from the tokens on this page`}
      className="grid @xl:grid-cols-[10.5rem_minmax(0,1fr)]"
    >
      {/* navigation */}
      <div
        aria-hidden
        className="hidden flex-col gap-1 p-3 @xl:flex"
        style={{ borderRight: `1px solid ${h.border('border-default')}` }}
      >
        <span className="px-3 pb-3 pt-1 text-label font-semibold uppercase tracking-[0.18em]">{theme.site}</span>
        {sp.nav.map((item, i) => {
          const current = i === sp.current
          return (
            <span
              key={item}
              className="flex h-9 items-center gap-2.5 rounded-full px-3 text-label"
              style={{
                color: current ? h.ink : h.muted,
                background: current && selected ? paint(selected.hex, selected.alpha) : 'transparent',
              }}
            >
              <span className="h-3.5 w-3.5 rounded-[4px]" style={{ boxShadow: 'inset 0 0 0 1.5px currentColor' }} />
              {item}
            </span>
          )
        })}
        {primary && (
          <ButtonSample button={primary} className="mt-1 w-full">
            {sp.action}
          </ButtonSample>
        )}
      </div>

      {/* content */}
      <div aria-hidden className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-4 p-4">
          <span
            className="flex h-10 items-center truncate rounded-full px-4 text-body-sm"
            style={{
              background: h.surface(1),
              color: withAlpha(h.fg('fg-secondary'), theme.metrics?.placeholderAlpha ?? 0.6),
            }}
          >
            {sp.search}
          </span>
          <div className="flex items-center justify-between gap-3">
            <span className="text-h4">{sp.heading}</span>
            {secondary && (
              <ButtonSample button={secondary} className="h-7 px-3 text-label-sm">
                {sp.more}
              </ButtonSample>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {sp.cards.map((card) => (
              <span key={card.title} className="flex min-w-0 flex-col gap-1.5">
                <span
                  className="aspect-[4/3] w-full rounded-[var(--radius-md)]"
                  style={{
                    background: `linear-gradient(135deg, ${h.surface(2)}, ${h.surface(1)})`,
                    boxShadow: `inset 0 0 0 1px ${hairline}`,
                  }}
                />
                <span className="truncate text-label">{card.title}</span>
                <span className="truncate text-caption" style={{ color: h.muted }}>
                  {card.meta}
                </span>
              </span>
            ))}
          </div>
        </div>
        {/* the bar that stays put */}
        <div
          className="mt-auto flex h-12 items-center justify-center gap-4 px-4"
          style={{ background: h.surface(1), borderTop: `1px solid ${hairline}`, color: h.muted }}
        >
          <span className="h-0 w-0 border-y-[5px] border-r-[8px] border-y-transparent" style={{ borderRightColor: 'currentColor' }} />
          <span className="h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent" style={{ borderLeftColor: h.ink }} />
          <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: 'currentColor' }} />
          <span className="ml-2 hidden h-0.5 w-40 rounded-full @xl:block" style={{ background: hairline }} />
        </div>
      </div>
    </div>
  )
}

/** One cell of the identity strip: a role, drawn, with its value under it. */
function Identity({
  label,
  muted,
  children,
  value,
}: {
  label: string
  muted: string
  children: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Eyebrow color={muted}>{label}</Eyebrow>
      <div className="flex min-h-9 items-center gap-2">{children}</div>
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-caption" style={{ color: muted }}>
        {value}
      </div>
    </div>
  )
}

export function ThemeOverview({ theme, cls }: { theme: SiteTheme; cls: ThemeClass }) {
  const h = handles(theme)
  const levels = h.observed
  const primary = h.button('button-primary')
  const secondary = h.button('button-secondary')
  const edge = h.border('border-default')

  return (
    <div className="flex w-full flex-col gap-4">
      {/* what kind of interface this is, and how that was decided */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {classLabel(cls)
            .split(' · ')
            .map((word) => (
              <Badge key={word} tone="neutral">
                {word}
              </Badge>
            ))}
          <span className="text-caption text-[var(--ds-fg-muted)]">
            {theme.site} · read {theme.captured}
          </span>
        </div>
        <p className="max-w-[70ch] text-body-sm text-[var(--ds-fg-muted)]">
          {cls.reason} Artwork, status colors and promotional treatments are not counted.
        </p>
      </div>

      <Board theme={theme} flush>
        <Specimen theme={theme} h={h} />
        <div
          className="grid grid-cols-2 gap-x-5 gap-y-5 p-4 @xl:grid-cols-3 @xl:p-5 @5xl:grid-cols-6"
          style={{ borderTop: `1px solid ${edge}` }}
        >
          <Identity label="Background" muted={h.muted} value={<span>{h.page.toUpperCase()}</span>}>
            <span className="h-9 w-full rounded-[var(--radius-sm)]" style={{ background: h.page, boxShadow: `inset 0 0 0 1px ${edge}` }} />
          </Identity>

          <Identity
            label="Surfaces"
            muted={h.muted}
            value={levels.slice(1).map((l) => <span key={l.key}>{l.hex.toUpperCase()}</span>)}
          >
            {levels.slice(1).map((l) => (
              <span
                key={l.key}
                className="h-9 flex-1 rounded-[var(--radius-sm)]"
                style={{ background: l.hex, boxShadow: `inset 0 0 0 1px ${h.border('border-subtle')}` }}
              />
            ))}
          </Identity>

          <Identity
            label="Text"
            muted={h.muted}
            value={theme.foregrounds.map((t) => <span key={t.key}>{t.hex.toUpperCase()}</span>)}
          >
            {theme.foregrounds.map((t) => (
              <span key={t.key} className="text-h4" style={{ color: t.hex }} title={`${t.label} · ${t.hex}`}>
                Aa
              </span>
            ))}
          </Identity>

          <Identity
            label="Borders"
            muted={h.muted}
            value={theme.borders
              .filter((b) => b.key !== 'border-focus')
              .map((b) => <span key={b.key}>{b.alpha !== undefined ? `${Math.round(b.alpha * 100)}%` : b.hex.toUpperCase()}</span>)}
          >
            {theme.borders
              .filter((b) => b.key !== 'border-focus')
              .map((b) => (
                <span
                  key={b.key}
                  className="h-9 flex-1 rounded-[var(--radius-sm)]"
                  style={{ border: `1px solid ${paint(b.hex, b.alpha)}` }}
                  title={`${b.label} · ${describe(b.hex, b.alpha)}`}
                />
              ))}
          </Identity>

          {primary && (
            <Identity
              label="Primary button"
              muted={h.muted}
              value={
                <>
                  <span>{primary.fill ? `${describe(primary.fill.hex, primary.fill.alpha)} fill` : 'No fill'}</span>
                  <span>{primary.ink.toUpperCase()} label</span>
                </>
              }
            >
              <ButtonSample button={primary}>{theme.specimen.action}</ButtonSample>
            </Identity>
          )}

          {secondary && (
            <Identity
              label="Secondary button"
              muted={h.muted}
              value={
                <>
                  <span>{secondary.fill ? `${describe(secondary.fill.hex, secondary.fill.alpha)} fill` : 'No fill'}</span>
                  {secondary.border && <span>{describe(secondary.border.hex, secondary.border.alpha)} edge</span>}
                </>
              }
            >
              <ButtonSample button={secondary}>{theme.specimen.more}</ButtonSample>
            </Identity>
          )}
        </div>
      </Board>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-[var(--ds-fg-muted)]">
        <span>Every row below says which it is:</span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          Observed — read off a rendered component, or the rule that paints one.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full ring-1 ring-inset ring-current" />
          Inferred — a real value whose role is our reading.
        </span>
      </p>
    </div>
  )
}

/* ---- 01 · surfaces and elevation ----------------------------------------- */

/**
 * The ladder, page first. Each rung is one row: what it is called, what it is,
 * what is painted with it. A rung nobody was seen using is drawn with a dashed
 * edge and says so — it is the next step of the ramp, not a decision the site
 * was observed making.
 */
function Ladder({ theme, h }: { theme: SiteTheme; h: ThemeHandles }) {
  return (
    <ol className="flex flex-col">
      {theme.elevation.map((l, i) => {
        const inferred = l.evidence === 'inferred'
        return (
          <li
            key={l.key}
            className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3"
            style={{ borderTop: i === 0 ? undefined : `1px solid ${h.border('border-subtle')}` }}
          >
            <span
              className="grid h-11 w-14 shrink-0 place-items-center rounded-[var(--radius-sm)] font-mono text-label"
              style={{
                background: l.hex,
                border: `1px ${inferred ? 'dashed' : 'solid'} ${h.border(inferred ? 'border-strong' : 'border-default')}`,
                color: h.ink,
              }}
            >
              E{l.level}
            </span>
            <span className="flex min-w-[9rem] flex-1 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="text-label">{l.label}</span>
                <CopyValue value={l.hex} display={l.hex.toUpperCase()} color={h.fg('fg-secondary')} />
              </span>
              <Source token={l} color={h.muted} />
            </span>
            <span className="flex min-w-[14rem] flex-[2] flex-col gap-1.5">
              <span className="text-caption" style={{ color: h.fg('fg-secondary') }}>
                {l.purpose}
              </span>
              {l.components.length > 0 && (
                <span className="flex flex-wrap gap-1.5">
                  {l.components.map((c) => (
                    <span
                      key={c}
                      className="rounded-full px-2 py-0.5 text-caption"
                      style={{ background: h.surface(Math.min(l.level + 1, 2)), color: h.ink }}
                    >
                      {c}
                    </span>
                  ))}
                </span>
              )}
            </span>
            <EvidenceMark evidence={l.evidence} color={h.muted} />
          </li>
        )
      })}
    </ol>
  )
}

/** The same rungs, one inside the next — the only way to see that they separate. */
function Nest({ theme, h }: { theme: SiteTheme; h: ThemeHandles }) {
  const build = (index: number): React.ReactNode => {
    const l = theme.elevation[index]
    if (!l) return null
    const inferred = l.evidence === 'inferred'
    return (
      <div
        className="flex flex-col gap-2 rounded-[var(--radius-md)] p-2.5"
        style={{
          background: l.hex,
          border: `1px ${inferred ? 'dashed' : 'solid'} ${h.border(inferred ? 'border-strong' : 'border-subtle')}`,
        }}
      >
        <span className="flex items-baseline justify-between gap-2 px-0.5">
          <span className="font-mono text-caption" style={{ color: h.ink }}>
            E{l.level} · {l.label}
          </span>
          <span className="font-mono text-caption" style={{ color: h.muted }}>
            {l.hex.toUpperCase()}
          </span>
        </span>
        {build(index + 1)}
      </div>
    )
  }
  return <div aria-label="The surfaces nested, page outermost">{build(0)}</div>
}

function levelName(theme: SiteTheme, level: number | null) {
  if (level === null) return 'None'
  return `E${theme.elevation[level]?.level ?? level}`
}

function Placements({ theme, h }: { theme: SiteTheme; h: ThemeHandles }) {
  return (
    <div className="flex flex-col">
      {theme.placements.map((p, i) => (
        <div
          key={p.component}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5"
          style={{ borderTop: i === 0 ? undefined : `1px solid ${h.border('border-subtle')}` }}
        >
          <span className="w-28 shrink-0 text-label">{p.component}</span>
          <span
            className="w-14 shrink-0 rounded-[4px] py-0.5 text-center font-mono text-caption"
            style={{
              background: p.level === null ? 'transparent' : h.surface(p.level),
              boxShadow: `inset 0 0 0 1px ${h.border('border-default')}`,
              color: p.level === null ? h.muted : h.ink,
            }}
          >
            {levelName(theme, p.level)}
          </span>
          <span className="min-w-[12rem] flex-1 text-caption" style={{ color: h.fg('fg-secondary') }}>
            {p.treatment}
          </span>
          <EvidenceMark evidence={p.evidence} color={h.muted} />
        </div>
      ))}
    </div>
  )
}

/**
 * Hover, selected, focus, disabled — each drawn ON a surface, because that is
 * what they are. None of them is a place in the ladder: a hovered row has not
 * moved up a level, it has had a layer put on it.
 */
function States({ theme, h }: { theme: SiteTheme; h: ThemeHandles }) {
  return (
    <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
      {theme.states.map((s) => {
        const sample: React.CSSProperties =
          s.kind === 'layer'
            ? { background: paint(s.hex, s.alpha), color: s.key === 'state-selected' ? h.ink : h.muted }
            : s.kind === 'ring'
              ? { outline: `2px solid ${s.hex}`, outlineOffset: 2, color: h.ink }
              : { background: s.hex, color: s.ink ?? h.muted }
        return (
          <div key={s.key} className="flex flex-col gap-2">
            <div className="flex h-14 items-center justify-center rounded-[var(--radius-md)]" style={{ background: h.page, boxShadow: `inset 0 0 0 1px ${h.border('border-subtle')}` }}>
              <span className="flex h-9 w-32 items-center justify-center rounded-full text-label" style={sample}>
                {s.label}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-label">{s.label}</span>
              <CopyValue
                value={paint(s.hex, s.alpha)}
                display={describe(s.hex, s.alpha)}
                color={h.fg('fg-secondary')}
              />
            </div>
            <span className="text-caption" style={{ color: h.muted }}>
              {s.purpose}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ElevationSection({ theme }: { theme: SiteTheme }) {
  const h = handles(theme)
  return (
    <Board theme={theme}>
      <div className="flex flex-col gap-7">
        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_17rem]">
          <Ladder theme={theme} h={h} />
          <Nest theme={theme} h={h} />
        </div>
        {theme.elevationNote && (
          <p className="text-caption" style={{ color: h.muted }}>
            {theme.elevationNote}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Eyebrow color={h.muted}>Where components sit</Eyebrow>
          <Placements theme={theme} h={h} />
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow color={h.muted}>States are layers, not levels</Eyebrow>
          <States theme={theme} h={h} />
        </div>
      </div>
    </Board>
  )
}

/* ---- 02 · the core palette ----------------------------------------------- */

function TokenList({
  title,
  tokens,
  h,
  sample,
  extra,
}: {
  title: string
  tokens: ThemeToken[]
  h: ThemeHandles
  sample: (t: ThemeToken) => React.ReactNode
  extra?: (t: ThemeToken) => React.ReactNode
}) {
  if (!tokens.length) return null
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Eyebrow color={h.muted}>{title}</Eyebrow>
      {tokens.map((t, i) => (
        <div
          key={t.key}
          className="flex flex-col gap-1 py-2.5"
          style={{ borderTop: i === 0 ? undefined : `1px solid ${h.border('border-subtle')}` }}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-9 shrink-0 place-items-center">{sample(t)}</span>
            <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
              <span className="text-label">{t.label}</span>
              <span className="font-mono text-caption" style={{ color: h.muted }}>
                {t.key}
              </span>
            </span>
            <CopyValue value={paint(t.hex, t.alpha)} display={describe(t.hex, t.alpha)} color={h.fg('fg-secondary')} />
          </div>
          <span className="text-caption" style={{ color: h.fg('fg-secondary') }}>
            {t.purpose}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <Source token={t} color={h.muted} />
            {extra?.(t)}
            <EvidenceMark evidence={t.evidence} color={h.muted} />
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Three groups and no more: what you write with, what you rule with, and what
 * means something. Surfaces are not here — they are the ladder above, and a
 * value listed in two places is a value that will be changed in one.
 */
export function CoreSection({ theme }: { theme: SiteTheme }) {
  const h = handles(theme)
  return (
    <Board theme={theme}>
      <div className="grid gap-x-8 gap-y-7 @2xl:grid-cols-2 @5xl:grid-cols-3">
        <TokenList
          title="Foregrounds"
          tokens={theme.foregrounds}
          h={h}
          sample={(t) => (
            <span className="text-h4" style={{ color: t.hex }}>
              Aa
            </span>
          )}
          extra={(t) => (
            <span className="font-mono text-caption" style={{ color: h.muted }}>
              {contrast(t.hex, h.page).toFixed(1)}:1 on E0
            </span>
          )}
        />
        <TokenList
          title="Borders"
          tokens={theme.borders}
          h={h}
          sample={(t) => (
            <span
              className="h-6 w-9 rounded-[var(--radius-sm)]"
              style={{ border: `${t.key === 'border-focus' ? 2 : 1}px solid ${paint(t.hex, t.alpha)}` }}
            />
          )}
          extra={(t) =>
            t.alpha !== undefined ? (
              <span className="font-mono text-caption" style={{ color: h.muted }}>
                {over(t.hex, t.alpha, h.page).toUpperCase()} on E0
              </span>
            ) : null
          }
        />
        <TokenList
          title="Semantic colors"
          tokens={theme.semantic}
          h={h}
          sample={(t) => <span className="h-4 w-4 rounded-full" style={{ background: t.hex }} />}
          extra={(t) => (
            <span className="font-mono text-caption" style={{ color: h.muted }}>
              {contrast(t.hex, h.page).toFixed(1)}:1 on E0
            </span>
          )}
        />
      </div>
    </Board>
  )
}

/* ---- 03 · interface elements --------------------------------------------- */

function Group({ title, h, children }: { title: string; h: ThemeHandles; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <Eyebrow color={h.muted}>{title}</Eyebrow>
      {children}
    </div>
  )
}

function Caption({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className="text-caption" style={{ color }}>
      {children}
    </span>
  )
}

/**
 * The standard controls, built from the roles above and from nothing else. If
 * a role is missing the control that needs it is left out, rather than drawn
 * with a guess.
 */
export function ElementsSection({ theme }: { theme: SiteTheme }) {
  const h = handles(theme)
  const m = theme.metrics ?? {}
  const hover = h.state('state-hover')
  const selected = h.state('state-selected')
  const focus = h.state('state-focus')
  const disabled = h.state('state-disabled')
  const neutral = h.button('button-neutral')
  const primary = h.button('button-primary')
  const error = h.semantic('error')
  const subtle = h.border('border-subtle')
  const menu = theme.placements.find((p) => p.component === 'Dropdowns')
  const modal = theme.placements.find((p) => p.component === 'Modals')

  return (
    <Board theme={theme}>
      <div className="flex flex-col gap-7">
        <Group title="Buttons" h={h}>
          <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
            {theme.buttons.map((b) => (
              <span key={b.key} className="flex flex-col items-start gap-1.5">
                <ButtonSample button={b}>{b.label}</ButtonSample>
                <Caption color={h.muted}>
                  {b.fill ? describe(b.fill.hex, b.fill.alpha) : 'No fill'}
                  {b.border ? ` · ${describe(b.border.hex, b.border.alpha).toLowerCase()} edge` : ''}
                </Caption>
              </span>
            ))}
            {disabled && (
              <span className="flex flex-col items-start gap-1.5">
                <span
                  className="inline-flex h-9 items-center rounded-full px-4 text-label"
                  style={{ background: disabled.hex, color: disabled.ink ?? h.muted }}
                >
                  Disabled
                </span>
                <Caption color={h.muted}>
                  {disabled.hex.toUpperCase()} · {(disabled.ink ?? h.muted).toUpperCase()}
                </Caption>
              </span>
            )}
          </div>
        </Group>

        <div className="grid gap-x-8 gap-y-7 @2xl:grid-cols-2">
          <Group title="Fields" h={h}>
            <div className="flex flex-col gap-2.5">
              <span
                className="flex h-10 items-center rounded-full px-4 text-body-sm"
                style={{ background: h.surface(1), color: withAlpha(h.fg('fg-secondary'), m.placeholderAlpha ?? 0.6) }}
              >
                Search
              </span>
              <span
                className="flex h-10 items-center px-4 text-body-sm"
                style={{
                  border: `1px solid ${h.border('border-strong')}`,
                  borderRadius: m.radius?.field ?? '8px',
                  color: withAlpha(h.ink, m.placeholderAlpha ?? 0.6),
                }}
              >
                Placeholder
              </span>
              {focus && (
                <span
                  className="flex h-10 items-center px-4 text-body-sm"
                  style={{
                    border: `1px solid ${h.border('border-strong')}`,
                    borderRadius: m.radius?.field ?? '8px',
                    outline: `2px solid ${focus.hex}`,
                    outlineOffset: 2,
                  }}
                >
                  Focused
                </span>
              )}
            </div>
            <Caption color={h.muted}>
              A search field is a filled pill on E1. A form field is an outline in the strong border, and focus
              is the outline around it.
            </Caption>
          </Group>

          <Group title="Navigation rows" h={h}>
            <div className="flex flex-col gap-1">
              {[
                { label: 'At rest', bg: 'transparent', color: h.muted },
                { label: 'Under the pointer', bg: hover ? paint(hover.hex, hover.alpha) : 'transparent', color: h.muted },
                { label: 'Current page', bg: selected ? paint(selected.hex, selected.alpha) : 'transparent', color: h.ink },
              ].map((row) => (
                <span
                  key={row.label}
                  className="flex h-9 items-center gap-2.5 rounded-full px-3 text-label"
                  style={{ background: row.bg, color: row.color }}
                >
                  <span className="h-3.5 w-3.5 rounded-[4px]" style={{ boxShadow: 'inset 0 0 0 1.5px currentColor' }} />
                  {row.label}
                </span>
              ))}
            </div>
            <Caption color={h.muted}>
              The current row changes twice — a layer under it and a brighter label — so it does not rest on
              a faint difference in gray alone.
            </Caption>
          </Group>

          {menu && menu.level !== null && (
            <Group title={`Menu · ${levelName(theme, menu.level)}`} h={h}>
              <div
                className="flex w-56 max-w-full flex-col py-1.5"
                style={{
                  background: h.surface(menu.level),
                  borderRadius: m.radius?.menu ?? '8px',
                  boxShadow: m.menuShadow,
                }}
              >
                {['Help', 'About'].map((item, i) => (
                  <span
                    key={item}
                    className="flex h-9 items-center px-3.5 text-label"
                    style={{ background: i === 0 && hover ? paint(hover.hex, hover.alpha) : undefined }}
                  >
                    {item}
                  </span>
                ))}
                <span className="my-1 h-px" style={{ background: subtle }} />
                {error && (
                  <span className="flex h-9 items-center px-3.5 text-label" style={{ color: error }}>
                    Delete
                  </span>
                )}
              </div>
              <Caption color={h.muted}>{menu.treatment}</Caption>
            </Group>
          )}

          {modal && modal.level !== null && (
            <Group title={`Dialog · ${levelName(theme, modal.level)}`} h={h}>
              <div
                className="flex items-center justify-center rounded-[var(--radius-md)] p-5"
                style={{ background: m.scrim ? paint(m.scrim.hex, m.scrim.alpha) : undefined, boxShadow: `inset 0 0 0 1px ${subtle}` }}
              >
                <div
                  className="flex w-56 max-w-full flex-col gap-2.5 p-4"
                  style={{
                    background: h.surface(modal.level),
                    borderRadius: m.radius?.dialog ? `min(${m.radius.dialog}, 1.5rem)` : '12px',
                    border: m.dialogOutline ? `1px solid ${paint(m.dialogOutline.hex, m.dialogOutline.alpha)}` : undefined,
                  }}
                >
                  <span className="text-center text-label">Title</span>
                  {neutral && (
                    <ButtonSample button={neutral} className="w-full" style={{ borderRadius: '12px' }}>
                      A choice
                    </ButtonSample>
                  )}
                  {primary && (
                    <ButtonSample button={primary} className="w-full">
                      Confirm
                    </ButtonSample>
                  )}
                </div>
              </div>
              <Caption color={h.muted}>{modal.treatment}</Caption>
            </Group>
          )}
        </div>

        {theme.shapes && theme.shapes.length > 0 && (
          <Group title="Corners" h={h}>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {theme.shapes.map((s) => (
                <span key={s.label} className="flex items-baseline gap-2" title={s.basis}>
                  <span className="text-label">{s.label}</span>
                  <span className="font-mono text-caption" style={{ color: h.fg('fg-secondary') }}>
                    {s.value}
                  </span>
                </span>
              ))}
            </div>
          </Group>
        )}
      </div>
    </Board>
  )
}

/* ---- 04 · contrast ------------------------------------------------------- */

const cellHead = 'px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]'

/**
 * Text on the surfaces it is really put on. Not every color against white and
 * black — a theme has already chosen its surfaces, so those are the only
 * ratios that describe anything a user will see.
 */
export function ContrastSection({ theme }: { theme: SiteTheme }) {
  const rows = contrastRows(theme)
  const buttons = buttonContrast(theme).filter((b) => b.button.fill)
  const surfaces = theme.elevation.filter((l) => l.evidence === 'observed')

  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
            <th scope="col" className={cellHead}>
              Text
            </th>
            {surfaces.map((s) => (
              <th key={s.key} scope="col" className={cellHead}>
                On E{s.level} · {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.token.key} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <th scope="row" className="px-3 py-2 text-left font-normal">
                <span className="flex flex-col">
                  <span className="text-[var(--ds-fg-secondary)]">{r.token.label}</span>
                  <span className="font-mono text-caption uppercase text-[var(--ds-fg-muted)]">{r.token.hex}</span>
                </span>
              </th>
              {r.cells.map((c) => (
                <RatioCell key={c.level} ink={r.token.hex} ground={c.surface} ratio={c.ratio} grade={c.grade} exempt={r.token.key === 'fg-disabled'} />
              ))}
            </tr>
          ))}
          {buttons.map((b) => (
            <tr key={b.button.key} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <th scope="row" className="px-3 py-2 text-left font-normal">
                <span className="flex flex-col">
                  <span className="text-[var(--ds-fg-secondary)]">{b.button.label} button label</span>
                  <span className="font-mono text-caption uppercase text-[var(--ds-fg-muted)]">
                    {b.button.ink} on {b.ground}
                  </span>
                </span>
              </th>
              <RatioCell ink={b.button.ink} ground={b.ground} ratio={b.ratio} grade={b.grade} span={surfaces.length} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RatioCell({
  ink,
  ground,
  ratio,
  grade,
  exempt,
  span,
}: {
  ink: string
  ground: string
  ratio: number
  grade: string
  /** Disabled text is the one role WCAG excuses; say so instead of flagging it. */
  exempt?: boolean
  span?: number
}) {
  const failing = grade === 'Fail' && !exempt
  return (
    <td colSpan={span} className="whitespace-nowrap px-3 py-2">
      <span className="flex items-center gap-2">
        <span className="rounded-[4px] px-1.5 py-0.5 text-caption ring-1 ring-inset ring-white/10" style={{ color: ink, background: ground }}>
          Aa
        </span>
        <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-secondary)]">{ratio.toFixed(2)}</span>
        <span className={cn('text-caption', failing ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-muted)]')}>
          {exempt && grade === 'Fail' ? 'Exempt' : grade}
        </span>
      </span>
    </td>
  )
}

/* ---- collapsed sections -------------------------------------------------- */

/**
 * Shut until asked for. What is inside is real and occasionally needed, and
 * the reason it is shut is the whole argument of the page: open by default, a
 * list of every color in a stylesheet reads as the theme.
 *
 * A native <details>, so it works before any script runs and is found by
 * in-page search in browsers that open it to show a match.
 */
function Disclosure({ summary, hint, children }: { summary: string; hint: string; children: React.ReactNode }) {
  return (
    <details className="group w-full rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
          '[&::-webkit-details-marker]:hidden',
        )}
      >
        <ChevronRight
          size={16}
          aria-hidden
          className="shrink-0 text-[var(--ds-fg-muted)] transition-transform duration-[140ms] group-open:rotate-90"
        />
        <span className="text-label text-[var(--ds-fg)]">{summary}</span>
        <span className="ml-auto text-caption text-[var(--ds-fg-muted)]">{hint}</span>
      </summary>
      <div className="@container border-t border-[var(--ds-border-subtle)] p-3 sm:p-4">{children}</div>
    </details>
  )
}

/* ---- 05 · decorative ------------------------------------------------------ */

/** A translucent value needs something behind it, or it is a swatch of nothing. */
function EffectSwatch({ item, h }: { item: DecorativeItem; h: ThemeHandles }) {
  const translucent = /\/\s*0?\.\d|rgba|transparent/.test(item.css)
  return (
    <span
      className="relative h-9 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)]"
      style={{
        background: translucent ? `linear-gradient(135deg, ${h.fg('fg-disabled')}, ${h.page} 70%)` : undefined,
        boxShadow: `inset 0 0 0 1px ${h.border('border-subtle')}`,
      }}
    >
      <span className="absolute inset-0" style={{ background: item.css }} />
    </span>
  )
}

export function DecorativeSection({ theme }: { theme: SiteTheme }) {
  const h = handles(theme)
  const count = theme.decorative.reduce((n, g) => n + g.items.length, 0)
  if (!count) return null

  return (
    <Disclosure
      summary="Decorative colors and special effects"
      hint={`${count} ${count === 1 ? 'entry' : 'entries'} · not the theme`}
    >
      <Board theme={theme}>
        <div className="grid gap-x-8 gap-y-6 @2xl:grid-cols-2">
          {theme.decorative.map((group) => (
            <div key={group.purpose} className="flex min-w-0 flex-col gap-2">
              <Eyebrow color={h.muted}>{group.purpose}</Eyebrow>
              {group.note && (
                <span className="text-caption" style={{ color: h.fg('fg-secondary') }}>
                  {group.note}
                </span>
              )}
              {group.items.map((item) => (
                <div key={item.label} className="flex items-start gap-3 py-1.5">
                  <EffectSwatch item={item} h={h} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-label">{item.label}</span>
                      {item.value && (
                        <span className="font-mono text-caption" style={{ color: h.fg('fg-secondary') }}>
                          {item.value}
                        </span>
                      )}
                    </span>
                    <span className="text-caption" style={{ color: h.muted }}>
                      {item.usage}
                    </span>
                    {item.source && (
                      <span className="font-mono text-caption" style={{ color: h.muted }}>
                        {item.source}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Board>
    </Disclosure>
  )
}

/* ---- 06 · raw tokens ------------------------------------------------------ */

function RampStrip({ ramp, checker }: { ramp: RawRamp; checker?: boolean }) {
  const { copy } = useCopy()
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-mono text-label-sm text-[var(--ds-fg)]">{ramp.name}</span>
        <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
          {ramp.steps[0]?.step}–{ramp.steps[ramp.steps.length - 1]?.step}
        </span>
        {ramp.note && <span className="text-caption text-[var(--ds-fg-muted)]">{ramp.note}</span>}
      </div>
      <div
        className="flex h-7 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)]"
        style={
          checker
            ? { backgroundImage: 'linear-gradient(90deg, #101012 50%, #f7f4ef 50%)' }
            : undefined
        }
      >
        {ramp.steps.map((s) => {
          const value = paint(s.hex, s.alpha)
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => copy(value)}
              title={`${ramp.name}-${s.step} · ${value}`}
              aria-label={`Copy ${ramp.name} ${s.step}, ${value}`}
              className="h-full flex-1 focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
              style={{ background: value }}
            />
          )
        })}
      </div>
    </div>
  )
}

/**
 * The stylesheet, for the day someone needs a step that is not a role. Every
 * ramp the site ships, as a strip you can copy from — and nothing here is
 * guidance. A value is in this section because it exists.
 */
export function RawSection({ theme }: { theme: SiteTheme }) {
  const { ramps, alpha, palette, omitted } = theme.raw
  const steps = [...ramps, ...(alpha ?? [])].reduce((n, r) => n + r.steps.length, 0)

  return (
    <Disclosure summary="Raw tokens" hint={`${ramps.length + (alpha?.length ?? 0)} ramps · ${steps} values`}>
      <div className="flex flex-col gap-6">
        <p className="max-w-[70ch] text-body-sm text-[var(--ds-fg-muted)]">
          {theme.site}’s ramps as its stylesheet has them. Click a step to copy it. This is reference, not
          guidance: a color being here says only that it exists.
        </p>
        <div className="grid gap-x-8 gap-y-4 @2xl:grid-cols-2">
          {ramps.map((r) => (
            <RampStrip key={r.name} ramp={r} />
          ))}
        </div>
        {alpha && alpha.length > 0 && (
          <div className="grid gap-x-8 gap-y-4 @2xl:grid-cols-2">
            {alpha.map((r) => (
              <RampStrip key={r.name} ramp={r} checker />
            ))}
          </div>
        )}
        {palette && (
          <div className="flex flex-col gap-2">
            <span className="text-label text-[var(--ds-fg)]">The twenty-swatch reading</span>
            <p className="max-w-[70ch] text-caption text-[var(--ds-fg-muted)]">
              An earlier pass set this stylesheet in the shape of a palette: {palette.colors.length} swatches,
              hues in pairs. It is kept because the values are right. It is down here because the picture was
              wrong — these are colors the stylesheet offers, not colors the interface is made of.
            </p>
            <div className="grid gap-x-4 gap-y-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}>
              {palette.colors.map((c) => (
                <span key={c.slug} className="flex items-center gap-2">
                  <span aria-hidden className="h-4 w-4 shrink-0 rounded-[4px] ring-1 ring-inset ring-white/10" style={{ background: c.hex }} />
                  <span className="truncate text-caption text-[var(--ds-fg-secondary)]">{c.name}</span>
                  <span className="ml-auto font-mono text-caption uppercase text-[var(--ds-fg-muted)]">{c.hex}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {omitted && <p className="max-w-[70ch] text-caption text-[var(--ds-fg-muted)]">{omitted}</p>}
      </div>
    </Disclosure>
  )
}

/* ---- do / don't specimens ------------------------------------------------- */

/** A filled primary beside an accent-colored one: the page's argument in two buttons. */
export function PrimarySpecimen({ theme, accent }: { theme: SiteTheme; accent?: string }) {
  const h = handles(theme)
  const primary = h.button('button-primary')
  if (!primary) return null
  return (
    <span className="flex items-center justify-center rounded-[var(--radius-md)] p-3" style={{ background: h.page }}>
      <ButtonSample
        button={primary}
        style={accent ? { background: accent, color: contrast(accent, '#ffffff') >= 4.5 ? '#ffffff' : h.page } : undefined}
      >
        {theme.specimen.action}
      </ButtonSample>
    </span>
  )
}

/** One row lifted a level, one given a layer. The second is what the site does. */
export function StateSpecimen({ theme, wrong }: { theme: SiteTheme; wrong?: boolean }) {
  const h = handles(theme)
  const hover = h.state('state-hover')
  return (
    <span className="flex items-center justify-center rounded-[var(--radius-md)] p-3" style={{ background: h.page }}>
      <span
        className="flex h-9 w-40 items-center rounded-full px-3 text-label"
        style={{
          background: wrong ? h.surface(2) : hover ? paint(hover.hex, hover.alpha) : undefined,
          color: h.muted,
        }}
      >
        Under the pointer
      </span>
    </span>
  )
}
