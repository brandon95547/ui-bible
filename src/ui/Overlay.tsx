import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { inspect } from '@/lib/inspect'
import { useDismissable, useFocusTrap, useScrollLock } from '@/lib/hooks'
import { IconButton } from './Button'

/* ===========================================================================
   PORTAL
   Overlays render at <body> so no ancestor's overflow, transform or z-index
   can clip them. This is not optional — a transform on any ancestor creates a
   new containing block and `position: fixed` silently stops being fixed.
   ======================================================================== */

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

/* ===========================================================================
   SCRIM
   ======================================================================== */

export function Scrim({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <div
      aria-hidden
      onClick={onClick}
      className={cn(
        'fixed inset-0 z-[70] bg-[var(--ds-layer-scrim)] backdrop-blur-[2px]',
        'animate-[fade-in_160ms_cubic-bezier(0.2,0,0,1)_both]',
        className,
      )}
    />
  )
}

/* ===========================================================================
   DIALOG
   ======================================================================== */

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'

const dialogWidths: Record<DialogSize, string> = {
  sm: 'max-w-[24rem]',
  md: 'max-w-[32rem]',
  lg: 'max-w-[44rem]',
  xl: 'max-w-[60rem]',
  fullscreen: 'max-w-none w-screen h-screen rounded-none',
}

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: DialogSize
  /** Blocks scrim-click and Escape. Use only when data loss is possible. */
  dismissible?: boolean
  tone?: 'neutral' | 'danger' | 'success'
  icon?: React.ReactNode
  /** Content scrolls; header and footer stay put. */
  scrollable?: boolean
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
  tone = 'neutral',
  icon,
  scrollable,
  className,
}: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const descId = React.useId()

  useScrollLock(open)
  useFocusTrap(open, panelRef)
  useDismissable(open && dismissible, onClose, [panelRef])

  if (!open) return null

  return (
    <Portal>
      <Scrim onClick={dismissible ? onClose : undefined} />
      <div
        className={cn(
          'fixed inset-0 z-[75] grid place-items-center overflow-y-auto',
          size === 'fullscreen' ? 'p-0' : 'p-4 sm:p-6',
        )}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          className={cn(
            'relative flex w-full flex-col overflow-hidden bg-[var(--ds-surface-overlay)]',
            'border border-[var(--ds-border)] shadow-e5 outline-none',
            size === 'fullscreen'
              ? 'rounded-none'
              : 'rounded-[var(--radius-2xl)] max-h-[min(44rem,calc(100dvh-3rem))]',
            dialogWidths[size],
            'animate-[scale-in_200ms_cubic-bezier(0.32,0.72,0,1)_both]',
            className,
          )}
          {...inspect(`Dialog · ${size}`, {
            tokens: ['--ds-surface-overlay', '--shadow-e5', '--radius-2xl', '--ds-layer-scrim'],
            why: 'Max width 32rem for a decision, 44rem for a form. Wider than ~60rem and the eye has to travel too far between the title and the confirm button. The scrim is 72% black plus a 2px blur so the page behind reads as “paused”, not “gone”.',
            a11y: 'role=dialog + aria-modal, focus trapped on open and restored to the trigger on close, Escape closes unless data would be lost. Body scroll is locked with scrollbar-width compensation so the page never shifts.',
          })}
        >
          <header
            className={cn(
              'flex items-start gap-3 px-6 pt-5',
              scrollable || footer ? 'pb-4' : 'pb-3',
              scrollable && 'border-b border-[var(--ds-border-subtle)]',
            )}
          >
            {icon && (
              <span
                className={cn(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full',
                  tone === 'danger'
                    ? 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]'
                    : tone === 'success'
                      ? 'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]'
                      : 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
                )}
                aria-hidden
              >
                {icon}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 id={titleId} className="text-h3 text-balance-ds">
                {title}
              </h2>
              {description && (
                <p id={descId} className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                  {description}
                </p>
              )}
            </div>
            {dismissible && (
              <IconButton
                label="Close dialog"
                icon={<X />}
                size="sm"
                variant="text"
                onClick={onClose}
                className="-mr-2 -mt-1"
              />
            )}
          </header>

          {children && (
            <div
              className={cn(
                'px-6',
                scrollable ? 'flex-1 overflow-y-auto py-5' : 'pb-1 pt-1',
                !footer && !scrollable && 'pb-5',
              )}
            >
              {children}
            </div>
          )}

          {footer && (
            <footer
              className={cn(
                // The border does the separating, not a fill. An opaque surface
                // token inside an overlay is an absolute value in a container
                // one rung above it: --ds-surface here reads as a hole in the
                // panel rather than as a bar attached to it. The hairline is
                // alpha, so it composes correctly at any level.
                'flex items-center justify-end gap-2.5 px-6 py-4',
                scrollable ? 'border-t border-[var(--ds-border-subtle)]' : 'pt-5',
              )}
            >
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  )
}

/* ===========================================================================
   DRAWER — edge-anchored panel. Keeps page context visible.
   ======================================================================== */

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  width = '26rem',
  className,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  side?: 'left' | 'right'
  width?: string
  className?: string
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  useScrollLock(open)
  useFocusTrap(open, panelRef)
  useDismissable(open, onClose, [panelRef])

  if (!open) return null

  return (
    <Portal>
      <Scrim onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={{ width: `min(${width}, calc(100vw - 2rem))` }}
        className={cn(
          // Overlay, not surface. A drawer is a modal panel over a scrim, which
          // the Role → level table puts at the top of the ramp alongside the
          // dialog and the menu. It was a rung low — the only modal surface in
          // the system that was — and on a black ground that read as the page
          // rather than as something lifted off it.
          'fixed inset-y-0 z-[75] flex flex-col bg-[var(--ds-surface-overlay)] shadow-e5 outline-none',
          side === 'right'
            ? 'right-0 border-l border-[var(--ds-border)]'
            : 'left-0 border-r border-[var(--ds-border)]',
          side === 'right'
            ? 'animate-[drawer-in-right_260ms_cubic-bezier(0.32,0.72,0,1)_both]'
            : 'animate-[drawer-in-left_260ms_cubic-bezier(0.32,0.72,0,1)_both]',
          className,
        )}
        {...inspect(`Drawer · ${side}`, {
          tokens: ['--ds-surface-overlay', '--shadow-e5', '--ease-emphasized'],
          why: 'Enters from the edge it is anchored to, so the motion tells you where it came from and where it will go back to. 26rem is wide enough for a form, narrow enough that the list behind stays readable — that visible context is the reason to pick a drawer over a dialog.',
          a11y: 'Still a modal: focus is trapped and the background is inert. If the background must stay interactive, it is a sidebar, not a drawer, and it should not have a scrim.',
        })}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-3 border-b border-[var(--ds-border-subtle)] px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              {title && (
                <h2 id={titleId} className="text-h4">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-caption text-[var(--ds-fg-muted)]">{description}</p>
              )}
            </div>
            <IconButton
              label="Close panel"
              icon={<X />}
              size="sm"
              variant="text"
              onClick={onClose}
              className="-mr-2"
            />
          </header>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          // Border only, matching the dialog and the sheet: a well token inside
          // an overlay is two rungs below its own container.
          <footer className="flex items-center justify-end gap-2.5 border-t border-[var(--ds-border-subtle)] px-5 py-3.5">
            {footer}
          </footer>
        )}
      </div>
    </Portal>
  )
}

/* ===========================================================================
   BOTTOM SHEET — the mobile drawer. Thumb-reachable, drag-dismissible.
   ======================================================================== */

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  /**
   * Heights the sheet is allowed to rest at, as fractions of the viewport,
   * ascending. It opens at the smallest — the least intrusive size that
   * still answers the question — and the user pulls it up if they want more.
   * Omit it and the sheet is sized by its content, which is right for a
   * short list of actions and wrong for anything scrollable.
   */
  detents,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  detents?: number[]
  className?: string
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = React.useState(0)
  const [detent, setDetent] = React.useState(0)
  const startY = React.useRef<number | null>(null)
  const rawDy = React.useRef(0)
  const titleId = React.useId()

  useScrollLock(open)
  useFocusTrap(open, panelRef)
  useDismissable(open, onClose, [panelRef])

  /* Re-opening should not inherit the height the user left it at — the
     sheet is a transient answer, not a window with remembered geometry. */
  React.useEffect(() => {
    if (open) setDetent(0)
  }, [open])

  if (!open) return null

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return
    rawDy.current = e.clientY - startY.current
    /* Only downward travel moves the sheet. Dragging up past the current
       detent would lift it off the bottom edge and open a gap under it. */
    setDragY(Math.max(0, rawDy.current))
  }
  const onPointerUp = () => {
    const dy = rawDy.current
    const last = detents ? detents.length - 1 : 0
    if (dy < -60 && detent < last) {
      setDetent(detent + 1) // pulled up: expand to the next resting height
    } else if (dragY > 110) {
      if (detent > 0) setDetent(detent - 1) // pulled down: collapse a step
      else onClose() // already at the smallest: this is a dismissal
    }
    setDragY(0)
    rawDy.current = 0
    startY.current = null
  }

  return (
    <Portal>
      <Scrim onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        style={{
          /* Without detents the sheet is sized by its content, capped at
             85dvh. With them it rests at an explicit fraction. */
          height: detents ? `${detents[detent] * 100}dvh` : undefined,
          transform: dragY ? `translateY(${dragY}px)` : undefined,
        }}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[75] flex max-h-[85dvh] flex-col outline-none',
          'rounded-t-[var(--radius-3xl)] border-t border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5',
          !dragY && 'animate-[sheet-in_280ms_cubic-bezier(0.32,0.72,0,1)_both]',
          !dragY && 'transition-[transform,height] duration-[240ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
          className,
        )}
        {...inspect('BottomSheet', {
          tokens: ['--radius-3xl', '--ds-surface-overlay', '--shadow-e5'],
          why: 'Anchored to the bottom because that is where the thumb already is. The 28px top radius and the grab handle are the entire affordance: they say “this slides” without a word of instruction. Dismiss threshold is 110px so a scroll gesture never closes it by accident, and with more than one detent a downward drag collapses a step before it ever dismisses.',
          a11y: 'Drag is a convenience, never the only exit — the scrim, Escape, and a real close control all work. Cap the height at 85dvh so the user can always see they are on top of something.',
        })}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
        >
          <span aria-hidden className="h-1 w-9 rounded-full bg-[var(--ds-border-strong)]" />
        </div>
        {title && (
          <header className="px-5 pb-3 pt-1">
            <h2 id={titleId} className="text-h4">
              {title}
            </h2>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && (
          <footer className="flex items-center gap-2.5 border-t border-[var(--ds-border-subtle)] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </Portal>
  )
}

/* ===========================================================================
   POPOVER — non-modal, anchored. Background stays live.
   ======================================================================== */

export function Popover({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  width = 'auto',
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void; ref: React.Ref<HTMLButtonElement> }) => React.ReactNode
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom'
  width?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  // The wrapper, not the trigger ref: callers routinely render the trigger
  // without forwarding `ref`, and an unattached triggerRef makes an
  // outside-pointerdown close the panel a beat before the trigger's own click
  // reopens it — so clicking the trigger again never closes the menu.
  const wrapRef = React.useRef<HTMLSpanElement>(null)
  useDismissable(open, () => setOpen(false), [wrapRef, panelRef])

  return (
    <span ref={wrapRef} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o), ref: triggerRef })}
      {open && (
        <div
          ref={panelRef}
          className={cn(
            'absolute z-[65] rounded-[var(--radius-lg)] border border-[var(--ds-border)]',
            'bg-[var(--ds-surface-overlay)] p-1 shadow-e4',
            side === 'bottom' ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]',
            align === 'start' && 'left-0 origin-top-left',
            align === 'center' && 'left-1/2 -translate-x-1/2 origin-top',
            align === 'end' && 'right-0 origin-top-right',
            'animate-[scale-in_150ms_cubic-bezier(0.32,0.72,0,1)_both]',
            className,
          )}
          style={{ width: width === 'auto' ? undefined : width }}
          {...inspect('Popover', {
            tokens: ['--ds-surface-overlay', '--shadow-e4', '--radius-lg'],
            why: '6px offset from the trigger: close enough to read as attached, far enough that the focus ring is not clipped. Transform origin matches the anchor corner so the open animation appears to grow *out of* the button.',
            a11y: 'Non-modal — focus is not trapped and the page behind stays usable. Escape closes and returns focus to the trigger. If the user must respond before continuing, it should be a Dialog.',
          })}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </span>
  )
}

/* ===========================================================================
   MENU
   ======================================================================== */

export interface MenuItemSpec {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  onSelect?: () => void
}

export function MenuList({
  items,
  onClose,
  label,
}: {
  items: (MenuItemSpec | 'separator')[]
  onClose?: () => void
  label?: string
}) {
  const real = items.filter((i): i is MenuItemSpec => i !== 'separator' && !i.disabled)
  const [active, setActive] = React.useState(0)

  return (
    <div
      role="menu"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActive((i) => (i + 1) % real.length)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActive((i) => (i - 1 + real.length) % real.length)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          real[active]?.onSelect?.()
          onClose?.()
        }
      }}
      className="flex min-w-[13rem] flex-col"
    >
      {items.map((item, i) =>
        item === 'separator' ? (
          <span key={`sep-${i}`} aria-hidden className="my-1 h-px bg-[var(--ds-border-subtle)]" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onMouseEnter={() => setActive(real.indexOf(item))}
            onClick={() => {
              item.onSelect?.()
              onClose?.()
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left',
              'transition-colors duration-75 disabled:pointer-events-none disabled:opacity-40',
              real[active] === item && 'bg-[var(--ds-layer-hover)]',
              item.danger ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-secondary)]',
              'hover:text-[var(--ds-fg)]',
            )}
          >
            {item.icon && (
              <span className="shrink-0 opacity-70" aria-hidden>
                {item.icon}
              </span>
            )}
            <span className="flex-1 text-label">{item.label}</span>
            {item.shortcut && (
              <span className="shrink-0 text-caption text-[var(--ds-fg-muted)]">
                {item.shortcut}
              </span>
            )}
          </button>
        ),
      )}
    </div>
  )
}
