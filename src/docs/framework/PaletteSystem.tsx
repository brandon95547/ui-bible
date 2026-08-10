import * as React from 'react'
import { AlertTriangle, Check, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'
import { contrast, withAlpha } from './palette'
import { ELEVATION, type PaletteSystem, type SystemToken } from './palette-system'

/* ===========================================================================
   THE DERIVED SYSTEM, RENDERED ON ITS OWN SURFACE

   Every block below paints the palette's own derived page colour and puts real
   controls on it. That is not decoration: a palette judged as twenty
   rectangles on a white documentation page has been judged on the one surface
   it will never be used on. The only honest preview of a dark theme is a dark
   theme.

   Nothing here reads a --ds-* token. Inside these boards our own system does
   not exist — if it leaked in, the preview would flatter every palette
   equally.
   ======================================================================== */

/** The dark canvas each section is demonstrated on. */
function Board({
  sys,
  children,
  className,
}: {
  sys: PaletteSystem
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('w-full rounded-[var(--radius-lg)] p-4 sm:p-5', className)}
      style={{ background: sys.page, color: sys.ink, border: `1px solid ${sys.border}` }}
    >
      {children}
    </div>
  )
}

function Label({ children, sys }: { children: React.ReactNode; sys: PaletteSystem }) {
  return (
    <p className="text-overline uppercase" style={{ color: sys.inkMuted }}>
      {children}
    </p>
  )
}

/* ---- 01 / 02 / 03 · the token tables ------------------------------------ */

/**
 * One derived token per row: the value, where it came from, and what it
 * measures. The provenance column is the part that matters — "Row 1, Col 1 ·
 * Turquoise" is checkable against the sheet above, and "Derived · solved to
 * 8:1" is checkable against the ratio beside it. A spec you cannot check is a
 * picture of a spec.
 */
export function TokenRows({ sys, tokens }: { sys: PaletteSystem; tokens: SystemToken[] }) {
  const { copy } = useCopy()
  const [copied, setCopied] = React.useState<string | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = (t: SystemToken) => {
    copy(t.hex)
    setCopied(t.key)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1400)
  }

  return (
    <Board sys={sys}>
      <div className="flex flex-col">
        {tokens.map((t, i) => (
          <div
            key={t.key}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5"
            style={{ borderTop: i === 0 ? undefined : `1px solid ${sys.border}` }}
          >
            <button
              type="button"
              onClick={() => onCopy(t)}
              title={`Copy ${t.hex}`}
              aria-label={`Copy ${t.label}, ${t.hex}`}
              className="h-9 w-14 shrink-0 rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: t.hex, border: `1px solid ${sys.borderStrong}` }}
            />
            <span className="flex w-36 shrink-0 flex-col">
              <span className="text-label-sm" style={{ color: sys.ink }}>
                {t.label}
              </span>
              <span className="text-[11px] leading-tight" style={{ color: sys.inkMuted }}>
                {t.sub}
              </span>
            </span>
            <code
              className="w-24 shrink-0 font-mono text-[11.5px] uppercase"
              style={{ color: sys.inkSecondary }}
            >
              {copied === t.key ? 'copied' : t.hex}
            </code>
            <span className="min-w-0 flex-1 text-[11px] leading-snug" style={{ color: sys.inkMuted }}>
              {t.origin}
            </span>
            {t.ratio !== undefined && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 font-mono text-[10.5px] tabular-nums"
                style={{
                  color: t.target && t.ratio < t.target ? '#ffffff' : sys.inkSecondary,
                  background:
                    t.target && t.ratio < t.target
                      ? sys.semantic.find((r) => r.key === 'danger')?.base.hex
                      : withAlpha(sys.ink, 0.08),
                }}
              >
                {t.ratio.toFixed(2)}:1
              </span>
            )}
          </div>
        ))}
      </div>
    </Board>
  )
}

/** Semantic roles as base / hover / active triplets, plus the measured label. */
export function SemanticRows({ sys }: { sys: PaletteSystem }) {
  return (
    <Board sys={sys}>
      <div className="flex flex-col gap-3">
        {sys.semantic.map((role) => (
          <div key={role.key} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="text-label-sm" style={{ color: sys.ink }}>
                {role.label}
              </span>
              <span className="text-[11px]" style={{ color: sys.inkMuted }}>
                {role.base.origin}
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[role.base, role.hover, role.active].map((t) => (
                <div
                  key={t.key}
                  className="flex h-14 flex-col justify-center rounded-[var(--radius-sm)] px-3"
                  style={{ background: t.hex, color: role.on }}
                >
                  <span className="text-[11px] leading-tight opacity-90">
                    {t.key.includes('-') ? t.key.split('-').slice(1).join(' ') : 'base'}
                  </span>
                  <span className="font-mono text-[11px] uppercase">{t.hex}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: sys.inkMuted }}>
              Label on the fill: {role.on === '#ffffff' ? 'white' : 'the page colour'} at{' '}
              {contrast(role.base.hex, role.on).toFixed(2)}:1
              {contrast(role.base.hex, role.on) < 4.5 &&
                ' — under 4.5:1, so this fill can only carry large text.'}
              {' · '}
              Hover {role.hover.taken ? 'is a palette colour' : 'is derived'}.
            </p>
          </div>
        ))}
      </div>
    </Board>
  )
}

/* ---- 04 · components ----------------------------------------------------- */

const BTN_ROLES = ['primary', 'success', 'info', 'warning', 'danger'] as const

/**
 * The moment a palette stops being a picture. A colour that read as confident
 * in a swatch grid frequently cannot hold a five-character label, and there is
 * no way to find that out except by putting the label on it.
 */
export function ComponentExamples({ sys }: { sys: PaletteSystem }) {
  const roles = BTN_ROLES.map((k) => sys.semantic.find((r) => r.key === k)!).filter(Boolean)

  return (
    <Board sys={sys}>
      <div className="flex flex-col gap-6">
        {/* buttons */}
        <div className="flex flex-col gap-2.5">
          <Label sys={sys}>Buttons</Label>
          <div className="flex flex-col gap-2">
            {(['filled', 'outlined', 'text'] as const).map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-2">
                <span className="w-16 shrink-0 text-[11px]" style={{ color: sys.inkMuted }}>
                  {variant}
                </span>
                {roles.map((role) => (
                  <span
                    key={role.key}
                    className="inline-flex h-9 items-center rounded-[var(--radius-sm)] px-3.5 text-label-sm"
                    style={
                      variant === 'filled'
                        ? { background: role.base.hex, color: role.on }
                        : variant === 'outlined'
                          ? {
                              border: `1px solid ${role.base.hex}`,
                              color: role.base.hex,
                              background: 'transparent',
                            }
                          : { color: role.base.hex }
                    }
                  >
                    {role.label}
                  </span>
                ))}
                <span
                  className="inline-flex h-9 items-center rounded-[var(--radius-sm)] px-3.5 text-label-sm"
                  style={
                    variant === 'filled'
                      ? { background: sys.hover, color: sys.inkDisabled }
                      : variant === 'outlined'
                        ? { border: `1px solid ${sys.border}`, color: sys.inkDisabled }
                        : { color: sys.inkDisabled }
                  }
                >
                  Disabled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* inputs */}
        <div className="flex flex-col gap-2.5">
          <Label sys={sys}>Input fields</Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { label: 'Default', text: 'Input text', muted: true, focus: false, disabled: false },
                { label: 'Focus', text: 'Input text', muted: false, focus: true, disabled: false },
                { label: 'Filled', text: 'Input text', muted: false, focus: false, disabled: false },
                { label: 'Disabled', text: 'Input text', muted: true, focus: false, disabled: true },
              ] as const
            ).map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <span className="text-[11px]" style={{ color: sys.inkMuted }}>
                  {f.label}
                </span>
                <span
                  className="flex h-10 items-center rounded-[var(--radius-sm)] px-3 text-body-sm"
                  style={{
                    background: f.disabled ? sys.surface : sys.elevated,
                    color: f.disabled ? sys.inkDisabled : f.muted ? sys.inkMuted : sys.ink,
                    border: `1px solid ${
                      f.focus ? sys.semantic[0].base.hex : f.disabled ? sys.border : sys.borderStrong
                    }`,
                    boxShadow: f.focus ? `0 0 0 3px ${withAlpha(sys.semantic[0].base.hex, 0.3)}` : undefined,
                  }}
                >
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* selection controls */}
        <div className="flex flex-col gap-2.5">
          <Label sys={sys}>Checkbox, radio and switch</Label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {(
              [
                { checked: true, disabled: false, label: 'Checked' },
                { checked: false, disabled: false, label: 'Unchecked' },
                { checked: true, disabled: true, label: 'Disabled' },
              ] as const
            ).map((c) => (
              <span key={c.label} className="inline-flex items-center gap-2 text-body-sm">
                <span
                  className="grid h-[18px] w-[18px] place-items-center rounded-[4px]"
                  style={{
                    background: c.checked
                      ? c.disabled
                        ? sys.hover
                        : sys.semantic[0].base.hex
                      : 'transparent',
                    border: `1px solid ${c.checked && !c.disabled ? sys.semantic[0].base.hex : sys.borderStrong}`,
                  }}
                >
                  {c.checked && (
                    <Check size={12} strokeWidth={3} color={c.disabled ? sys.inkDisabled : sys.semantic[0].on} />
                  )}
                </span>
                <span style={{ color: c.disabled ? sys.inkDisabled : sys.inkSecondary }}>{c.label}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {(
              [
                { on: true, disabled: false, label: 'Selected' },
                { on: false, disabled: false, label: 'Unselected' },
                { on: false, disabled: true, label: 'Disabled' },
              ] as const
            ).map((r) => (
              <span key={r.label} className="inline-flex items-center gap-2 text-body-sm">
                <span
                  className="grid h-[18px] w-[18px] place-items-center rounded-full"
                  style={{
                    border: `1px solid ${r.on && !r.disabled ? sys.semantic[0].base.hex : sys.borderStrong}`,
                  }}
                >
                  {r.on && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: r.disabled ? sys.inkDisabled : sys.semantic[0].base.hex }}
                    />
                  )}
                </span>
                <span style={{ color: r.disabled ? sys.inkDisabled : sys.inkSecondary }}>{r.label}</span>
              </span>
            ))}
            {([true, false] as const).map((on) => (
              <span key={String(on)} className="inline-flex items-center gap-2 text-body-sm">
                <span
                  className="flex h-5 w-9 items-center rounded-full px-[3px]"
                  style={{
                    background: on ? sys.semantic[0].base.hex : sys.borderStrong,
                    justifyContent: on ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: on ? sys.semantic[0].on : sys.inkMuted }} />
                </span>
                <span style={{ color: sys.inkSecondary }}>{on ? 'On' : 'Off'}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Board>
  )
}

/* ---- 05 · categorical ---------------------------------------------------- */

const SLICES = [24, 18, 14, 12, 10, 9, 8, 5]
const SLICE_LABELS = ['Direct', 'Organic', 'Social', 'Referral', 'Email', 'Paid search', 'Affiliate', 'Other']

export function ChartColors({ sys }: { sys: PaletteSystem }) {
  const picks = sys.chart
  const R = 42
  const C = 2 * Math.PI * R
  let offset = 0

  return (
    <Board sys={sys}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {picks.map((c) => (
            <span key={c.slug} className="flex flex-col items-center gap-1">
              <span
                className="h-10 w-16 rounded-[var(--radius-sm)]"
                style={{ background: c.hex, border: `1px solid ${sys.borderStrong}` }}
              />
              <span className="font-mono text-[10px] uppercase" style={{ color: sys.inkMuted }}>
                {c.hex}
              </span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <svg width="132" height="132" viewBox="0 0 120 120" role="img" aria-label="Example donut chart">
            {picks.map((c, i) => {
              const len = (SLICES[i] / 100) * C
              const dash = `${len} ${C - len}`
              const el = (
                <circle
                  key={c.slug}
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={c.hex}
                  strokeWidth="17"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                />
              )
              offset += len
              return el
            })}
          </svg>
          <div className="grid flex-1 grid-cols-2 gap-x-5 gap-y-1">
            {picks.map((c, i) => (
              <span key={c.slug} className="flex items-center gap-2 text-[11.5px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.hex }} />
                <span className="flex-1 truncate" style={{ color: sys.inkSecondary }}>
                  {SLICE_LABELS[i]}
                </span>
                <span className="font-mono tabular-nums" style={{ color: sys.inkMuted }}>
                  {SLICES[i]}%
                </span>
              </span>
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: sys.inkMuted }}>
          Eight hues spread around the circle, every one of them measured at 3:1 or better against
          this page — a chart mark is a meaningful graphic, not decoration. None of them carries a
          status meaning, which is the entire reason this set is separate from the one above.
        </p>
      </div>
    </Board>
  )
}

/* ---- 06 · alerts --------------------------------------------------------- */

const ALERTS = [
  { key: 'success', icon: Check, text: 'Success. Your changes have been saved.' },
  { key: 'info', icon: Info, text: 'Info. This is an informational message.' },
  { key: 'warning', icon: AlertTriangle, text: 'Warning. Please check your input carefully.' },
  { key: 'danger', icon: XCircle, text: 'Error. Something went wrong. Try again.' },
] as const

export function AlertExamples({ sys }: { sys: PaletteSystem }) {
  return (
    <Board sys={sys}>
      <div className="flex flex-col gap-2.5">
        {ALERTS.map((a) => {
          const role = sys.semantic.find((r) => r.key === a.key)!
          const Icon = a.icon
          return (
            <div
              key={a.key}
              className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5"
              style={{ background: role.base.hex, color: role.on }}
            >
              <Icon size={16} aria-hidden />
              <span className="flex-1 text-body-sm">{a.text}</span>
              <X size={14} aria-hidden className="opacity-70" />
            </div>
          )
        })}
        <p className="mt-1 text-[11px] leading-relaxed" style={{ color: sys.inkMuted }}>
          Every one of these carries an icon and a word as well as a fill. Remove the colour and the
          four are still distinguishable — which is the test, because for a good number of readers
          the colour was never there.
        </p>
      </div>
    </Board>
  )
}

/* ---- 07 · elevation ------------------------------------------------------ */

export function ElevationScale({ sys }: { sys: PaletteSystem }) {
  return (
    <Board sys={sys}>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ELEVATION.map((e) => (
            <div
              key={e.level}
              className="flex flex-col gap-1 rounded-[var(--radius-sm)] p-3"
              style={{
                background: e.level === 0 ? sys.surface : sys.elevated,
                boxShadow: e.shadow === 'none' ? undefined : e.shadow,
                border: `1px solid ${sys.border}`,
              }}
            >
              <span className="text-label-sm" style={{ color: sys.ink }}>
                Level {e.level}
              </span>
              <span className="text-[11px]" style={{ color: sys.inkSecondary }}>
                {e.label}
              </span>
              <span className="text-[10px] leading-tight" style={{ color: sys.inkMuted }}>
                {e.use}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: sys.inkMuted }}>
          Black at rising alpha, on every palette. A shadow is the absence of light, so tinting it
          with the brand hue is how a dark theme starts looking bruised. On very dark pages the
          shadow does almost nothing and the surface ladder above is what carries depth.
        </p>
      </div>
    </Board>
  )
}
