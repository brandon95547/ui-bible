import * as React from 'react'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageLink } from '@/app/PageLink'
import { Button, type ButtonProps } from '@/ui/Button'
import { Board, Masthead, Poster, SheetSwitch } from '../../framework/DesignSheet'
import {
  SHEETS,
  dashboardScope,
  websiteScope,
  type AlertTone,
  type ButtonVariant,
  type SheetId,
} from '../../data/phansora-sheet'

/* ===========================================================================
   PHANSORA · THE PARTS BOTH SHEETS SHARE

   The two Phansora pages (phansora.tsx, the dashboard; phansora-website.tsx)
   are drawn from these: the poster with its masthead and the pill between the
   two sheets, Phansora's buttons, and dialog.js's alert.
   ======================================================================== */

export const ASSETS = '/design-sheets/phansora'

const PAGE: Record<SheetId, string> = { dashboard: 'phansora', website: 'phansora-website' }

/** A Phansora sheet: its own ground, the masthead, then the board of cards. */
export function PhansoraSheet({
  sheet,
  onNavigate,
  children,
}: {
  sheet: SheetId
  onNavigate: (id: string) => void
  children: React.ReactNode
}) {
  const s = SHEETS[sheet]
  const link = (to: SheetId, label: string) => ({
    label,
    current: sheet === to,
    render: (className: string) => (
      <PageLink to={PAGE[to]} onNavigate={onNavigate} className={className}>
        {label}
      </PageLink>
    ),
  })
  return (
    <Poster vars={sheet === 'dashboard' ? dashboardScope : websiteScope} accent={s.accent}>
      <Masthead
        mark={<img src={`${ASSETS}/mark.svg`} alt="" width={30} height={30} className="h-auto w-[30px]" />}
        accent={s.accent}
        title={s.title}
        subtitle="Foundations, components, and patterns in use."
        tagline={s.tagline}
        switcher={<SheetSwitch accent={s.accent} items={[link('website', 'Website'), link('dashboard', 'Dashboard')]} />}
      />
      <Board>{children}</Board>
    </Poster>
  )
}

/* -- Buttons ------------------------------------------------------------------ */

/* Phansora's button is Suno's pill, which is the Bible's too: the same five slots and
   the same move on hover — a wash laid over the fill, never a new fill. Phansora sets
   the slots to its own colors and its own washes (black over a filled button, white
   over a clear one, red over a destructive one), holds a stronger wash on a press in
   place of Suno's ripple, and does not shrink under the press. `pin` holds a button in
   one state, for the state matrix; an unpinned one answers the pointer as the real one
   does. Disabled gives the recipe up for a flat look of its own. */
const slots = [
  '[--btn-bg:var(--ph-bg)] [--btn-text:var(--ph-fg)] [--btn-border:var(--ph-border)] [--btn-wash:var(--ph-wash)]',
  'enabled:hover:[--btn-text:var(--ph-hover-fg)] enabled:active:[--btn-wash:var(--ph-press)] active:scale-100',
].join(' ')

/** Suno's padding at Phansora's heights: 12 / 14 / 16, and 32 on the wide 44px pill. */
const lgPad = 'px-8'

export function PhButton({
  v,
  pin,
  disabled,
  size,
  className,
  style,
  ...rest
}: { v: ButtonVariant; pin?: 'hover' | 'pressed' } & Omit<ButtonProps, 'variant' | 'tone'>) {
  const look = disabled ? v.disabled : v.rest
  const hoverFg = v.hoverFg ?? v.rest.fg
  const vars = {
    '--ph-bg': look.bg,
    '--ph-fg': pin ? hoverFg : look.fg,
    '--ph-border': look.border,
    '--ph-wash': pin === 'pressed' ? v.press : v.wash,
    '--ph-hover-fg': hoverFg,
    '--ph-press': v.press,
  } as React.CSSProperties
  return (
    <Button
      shape="pill"
      size={size}
      disabled={disabled}
      className={cn(slots, pin && 'before:opacity-100', size === 'lg' && lgPad, className)}
      style={{ ...vars, ...style }}
      {...rest}
    />
  )
}

/** The four states of one row of the state matrix: at rest, held in hover, held pressed, disabled. */
export function stateCells(render: (props: { pin?: 'hover' | 'pressed'; disabled?: boolean }) => React.ReactNode) {
  return [render({}), render({ pin: 'hover' }), render({ pin: 'pressed' }), render({ disabled: true })]
}

/** The bolt beside a price: the mark takes the credit color, the number stays grey. */
export function CostTag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-caption font-medium tabular-nums text-[var(--ds-fg-secondary)]">
      <Zap size={14} style={{ color }} fill="currentColor" aria-hidden />
      {children}
    </span>
  )
}

/* -- Dialogs ------------------------------------------------------------------ */

/** dialog.js's alert and confirm: an icon on its ring, a title, a message, the action last. */
export function AlertDialog({
  tone,
  icon,
  title,
  message,
  cancel,
  action,
}: {
  tone: AlertTone
  icon: React.ReactNode
  title?: string
  message: string
  cancel?: string
  action: string
}) {
  const btn = 'rounded-[var(--radius-md)] px-5 py-2 text-label transition-[filter] hover:brightness-110'
  return (
    <div
      role="dialog"
      aria-label={title ?? message}
      className="w-[92%] max-w-[400px] rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-6 text-center shadow-[0_25px_60px_rgb(0_0_0/0.5)]"
    >
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.ring, color: tone.icon }}
      >
        {icon}
      </div>
      {title && <p className="mb-1.5 text-h3 text-[var(--ds-fg)]">{title}</p>}
      <p className="mb-6 text-body text-[var(--ds-fg-secondary)]">{message}</p>
      <div className="flex justify-center gap-2.5">
        {cancel && (
          <button
            type="button"
            className={cn(btn, 'border border-[var(--ds-border)] bg-[rgb(255_255_255/0.08)] text-[var(--ds-fg-secondary)]')}
          >
            {cancel}
          </button>
        )}
        <button type="button" className={btn} style={{ backgroundColor: tone.button, color: tone.label }}>
          {action}
        </button>
      </div>
    </div>
  )
}
