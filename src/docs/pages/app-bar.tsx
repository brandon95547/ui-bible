import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  Accessibility, AlignCenter, AlignLeft, AlignRight, Bell, BookOpen, Box, ChevronDown, Download,
  Folder, HelpCircle, History, Home, Layers, LayoutGrid, LayoutTemplate, LifeBuoy, LogOut, Menu,
  Monitor, MonitorSmartphone, Moon, Palette, RotateCcw, Settings, Shapes, Smartphone, Sun, Tablet,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useDismissable } from '@/lib/hooks'
import { Button, IconButton } from '@/ui/Button'
import { Avatar } from '@/ui/Display'
import {
  APP_BAR_MAX_WIDTH, AppBar, MegaPanel, NavItem, TabPanel, Tabs, appBarGutter,
  type AppBarAlign, type MegaMenuColumn, type TabSpec,
} from '@/ui/Navigation'
import { Checkbox, Segmented } from '@/ui/Toggle'
import { DEVICE_CONTROLS_SLOT, PreviewContext, devicePath } from '../framework/preview-context'
import { storedViewport } from '../framework/DeviceView'
import { SubHeading, defineDoc } from '../framework/kit'

/* ===========================================================================
   THE BASIC BAR

   One row, four slots, nothing else. Every knob in the playground changes an
   arrangement or a plane — none of them add a part — because the argument of
   this page is that the bar is defined by what it refuses to hold.
   ======================================================================== */

/** The mark. The one thing in the bar allowed to carry the accent. */
const logo = <Box size={22} className="text-[var(--ds-accent-text)]" />

/**
 * Global utilities. Three is the desktop budget; a phone gets two.
 *
 * The third one is dropped by a container query rather than by the page, so it
 * goes at the same width in a 390px frame and on a 390px phone — the docs and
 * the real thing cannot disagree about where the budget runs out.
 */
const utilities = (
  <>
    <IconButton label="Help" icon={<HelpCircle />} size="md" />
    <IconButton label="Notifications" icon={<Bell />} size="md" />
    <span className="@max-[640px]:hidden">
      <IconButton label="Settings" icon={<Settings />} size="md" />
    </span>
  </>
)

/**
 * The account control. One button, not two: the avatar and the chevron are a
 * single target, so the disclosure never becomes a separate 24px thing to hit.
 */
function Account() {
  return (
    <button
      type="button"
      aria-label="Account menu, Ada Lovelace"
      aria-haspopup="menu"
      className="flex items-center gap-1 rounded-full py-1 pe-1 ps-1 transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
    >
      <Avatar name="User" size="md" />
      <ChevronDown size={16} className="text-[var(--ds-fg-muted)]" />
    </button>
  )
}

/* ===========================================================================
   PLAYGROUND
   ======================================================================== */

type ViewId = 'desktop' | 'tablet' | 'mobile'

/**
 * Three widths worth looking at, named by the band rather than by a device.
 * `width: null` means "whatever the page gives it" — the desktop case is the
 * fluid one, and pinning it to 1440 inside a 1024px column would be a lie.
 */
const VIEWS: { id: ViewId; name: string; band: string; icon: React.ReactNode; width: number | null }[] = [
  { id: 'desktop', name: 'Desktop', band: '1440px+', icon: <Monitor size={16} />, width: null },
  { id: 'tablet', name: 'Tablet', band: '768px – 1199px', icon: <Tablet size={16} />, width: 834 },
  { id: 'mobile', name: 'Mobile', band: '< 768px', icon: <Smartphone size={16} />, width: 390 },
]

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: <AlignLeft size={16} /> },
  { value: 'center', label: 'Center', icon: <AlignCenter size={16} /> },
  { value: 'right', label: 'Right', icon: <AlignRight size={16} /> },
]

const DEFAULTS = {
  align: 'left' as AppBarAlign,
  theme: 'dark' as 'dark' | 'light',
  view: 'desktop' as ViewId,
  rtl: false,
  elevated: true,
  bordered: false,
  fullBleed: false,
}

/**
 * The direction toggle.
 *
 * The bar is built out of logical properties — inline-start, inline-end,
 * justify-start — so `dir` is the whole implementation. Nothing here is
 * mirrored by hand, and that is the test: if a bar needs a special case to
 * survive RTL, it was using a physical edge where it should not have been.
 */
function RtlToggle({
  rtl,
  onChange,
  size = 'md',
}: {
  rtl: boolean
  onChange: (v: boolean) => void
  size?: 'sm' | 'md'
}) {
  return (
    <Button
      size={size === 'sm' ? 'xs' : 'md'}
      variant={rtl ? 'tonal' : 'outlined'}
      aria-pressed={rtl}
      onClick={() => onChange(!rtl)}
      title={rtl ? 'Right to left — click for left to right' : 'Preview right to left'}
    >
      RTL
    </Button>
  )
}

/** A labelled control group in the panel. */
function Knob({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label text-[var(--ds-fg-secondary)]">{label}</span>
      {children}
    </div>
  )
}

/**
 * Opens the bar in its own window, sized so the viewport really is a device's.
 *
 * A phone ignores the size and simply opens a tab, which is the whole point:
 * on a phone the viewport is already the thing under test. Returns false when
 * the browser refuses, so the caller can fall back rather than do nothing.
 */
function openNative() {
  const { w, h } = storedViewport()
  const url = `${window.location.pathname}${window.location.search}${devicePath('app-bar')}`
  const win = window.open(url, 'uib-device-app-bar', `popup=yes,width=${w},height=${h}`)
  if (!win) return false
  win.focus()
  return true
}

interface BarState {
  align: AppBarAlign
  elevated: boolean
  bordered: boolean
  fullBleed: boolean
}

/** The specimen. Identical in the page and in the popped-out window. */
function Bar({
  align, elevated, bordered, fullBleed, sticky, leading, className,
}: BarState & { sticky?: boolean; leading?: React.ReactNode; className?: string }) {
  return (
    <AppBar
      className={className}
      title="UI Bible"
      logo={logo}
      align={align}
      leading={leading ?? <IconButton label="Open navigation" icon={<Menu />} size="md" />}
      actions={utilities}
      account={<Account />}
      elevated={elevated}
      bordered={bordered}
      fullBleed={fullBleed}
      sticky={sticky}
    />
  )
}

/* ===========================================================================
   VERSION 2 — WITH NAVIGATION

   The same bar, now doing the job its first slot exists for. Everything about
   the bar is unchanged; what the drawer trigger opens is the whole addition.
   ======================================================================== */

const NAV_PRIMARY = [
  { icon: <Home size={16} />, label: 'Dashboard' },
  { icon: <Layers size={16} />, label: 'Components' },
  { icon: <LayoutGrid size={16} />, label: 'Patterns' },
  { icon: <LayoutTemplate size={16} />, label: 'Templates' },
  { icon: <BookOpen size={16} />, label: 'Guidelines' },
  { icon: <Folder size={16} />, label: 'Resources' },
]

const NAV_SECONDARY = [
  { icon: <Settings size={16} />, label: 'Settings' },
  { icon: <HelpCircle size={16} />, label: 'Help & Support' },
  { icon: <LogOut size={16} />, label: 'Sign Out' },
]

const NAV_W = 260

/**
 * The drawer, in its two variations.
 *
 * `responsive` — the Navigation Drawer. A persistent column where there is
 * room beside the content, an overlay over it where there is not. The switch
 * is at 768px, because that is where 260px of navigation stops being a fifth
 * of the screen and starts being two thirds of it.
 *
 * `overlay` — the Overlay Drawer. Over the content at every width, always with
 * a scrim, always closed until asked for. It never takes a column, so the
 * content is full width on a 27" monitor and on a phone alike.
 *
 * Both move on `margin-inline-start`, not a transform, so RTL costs nothing:
 * the logical property already knows which edge it is leaving from.
 */
type DrawerMode = 'responsive' | 'overlay'

function NavDrawer({
  open, onDismiss, current, mode,
}: {
  open: boolean
  onDismiss: () => void
  current: string
  mode: DrawerMode
}) {
  return (
    <>
      {/* The scrim goes with the overlay behaviour. A persistent column has
          nothing to dim — the content beside it is still usable — so the
          responsive drawer drops the scrim at the width where it becomes
          one. */}
      <div
        aria-hidden
        onClick={onDismiss}
        className={cn(
          'absolute inset-0 z-10 bg-[var(--ds-layer-scrim)] transition-opacity duration-[200ms]',
          mode === 'responsive' && '@min-[768px]:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <nav
        aria-label="Primary"
        aria-hidden={!open}
        style={{ width: NAV_W, marginInlineStart: open ? 0 : -NAV_W }}
        className={cn(
          // inset-y, not inset-block: the block axis is vertical in both
          // directions here, and Tailwind has no inset-block utility.
          'absolute inset-y-0 start-0 z-20 flex shrink-0 flex-col overflow-y-auto',
          'border-e border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2',
          'transition-[margin-inline-start] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]',
          // The whole difference between the two variations: one is allowed to
          // become a column, the other never is.
          mode === 'responsive' && '@min-[768px]:static @min-[768px]:z-auto',
          // An overlay floats, so it carries the shadow a column does not need.
          mode === 'overlay' && 'shadow-e3',
        )}
      >
        <div className="flex flex-col gap-0.5">
          {NAV_PRIMARY.map((it) => (
            <NavItem key={it.label} icon={it.icon} label={it.label} active={it.label === current} />
          ))}
        </div>

        {/* The rule is a divider, not a heading: the group below is "about you
            and the app", which does not need naming to be understood. */}
        <div className="my-3 h-px shrink-0 bg-[var(--ds-border-subtle)]" />

        <div className="flex flex-col gap-0.5">
          {NAV_SECONDARY.map((it) => (
            <NavItem key={it.label} icon={it.icon} label={it.label} />
          ))}
        </div>
      </nav>
    </>
  )
}

/* ---------------------------------------------------------------------------
   The floating variations. Neither is a drawer, so neither shares one: they
   hang off the button rather than off an edge of the screen, and the only
   thing they disagree about is how much they can afford to say.
   --------------------------------------------------------------------------- */

const MENU_W = '232px'
// A cap, then whatever the bar can afford. `cqw` is the bar's own width — the
// same input every other decision on this page is made from — so the panel is
// never wider than the frame it is opening inside.
const MEGA_W = 'min(680px, calc(100cqw - 24px))'

/**
 * The shell both floating variations share: the hamburger, and a surface
 * anchored to it.
 *
 * The trigger ships in here because the anchoring is the whole idea — the
 * surface is positioned against the button's box, so it stays under the
 * hamburger at 390px and at 1440px without anyone measuring the bar. The
 * offset is `start-0` on the wrapper, so RTL costs nothing here either: the
 * surface hangs from whichever edge the reading order started at.
 *
 * It is a disclosure, not a `role="menu"`. These are destinations, and the
 * menu role would promise arrow-key semantics that site navigation should not
 * be asking a keyboard user to learn. `aria-expanded` on the trigger says what
 * is true, and Tab reaches the items because they are the next thing in the
 * DOM — which is also why focus does not jump on open.
 *
 * `open` is the screen's state, not this component's: on a phone the mega
 * panel is a drawer instead, and one hamburger cannot open two things from two
 * different pieces of state.
 */
function AnchoredNav({
  open, setOpen, width, surface, children,
}: {
  open: boolean
  setOpen: (fn: (o: boolean) => boolean) => void
  width: string
  surface: string
  children: (close: () => void) => React.ReactNode
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelId = React.useId()

  // Closing has to put focus back where it came from: Escape out of the panel
  // must not drop a keyboard user at the top of the document. A dismissal that
  // did not come from inside it — a click on the content — leaves the focus
  // that click chose alone.
  const close = () => {
    if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus()
    setOpen(() => false)
  }
  useDismissable(open, close, [wrapRef, panelRef])

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <IconButton
        ref={triggerRef}
        label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls={panelId}
        icon={<Menu />}
        size="md"
        onClick={() => setOpen((o) => !o)}
      />
      <div
        ref={panelRef}
        id={panelId}
        style={{ width }}
        className={cn(
          'absolute start-0 z-30 flex flex-col',
          // The gap is measured from the bar's bottom edge, not the button's:
          // a 36px button in a 64px row leaves 14px of bar below it, and 10px
          // once the bar reflows to 56px. Eight more on top of that — near
          // enough to read as attached to the trigger, far enough that its
          // focus ring is not clipped by this.
          'top-[calc(100%+22px)] @max-[640px]:top-[calc(100%+18px)]',
          'border border-[var(--ds-border)]',
          // An overlay surface and the shadow to match: this floats over the
          // content with nothing dimmed behind it, so the plane has to do the
          // separating on its own.
          'bg-[var(--ds-surface-overlay)] shadow-e4',
          // The origin is the corner it is anchored to, so it appears to come
          // out of the hamburger rather than to arrive over it.
          'origin-top-left rtl:origin-top-right',
          'transition-[opacity,transform,visibility] duration-[160ms] ease-[cubic-bezier(0.2,0,0,1)]',
          // `visibility`, not `aria-hidden`: it takes the closed surface out of
          // the tab order and the accessibility tree at the same time, and it
          // still transitions, so it can fade on the way out.
          open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
          surface,
        )}
      >
        {children(close)}
      </div>
    </div>
  )
}

/**
 * The Dropdown. A small menu, one column, the same list the drawer carries.
 */
function NavMenu({ current, close }: { current: string; close: () => void }) {
  return (
    <>
      <nav aria-label="Primary" className="flex flex-col gap-0.5">
        {NAV_PRIMARY.map((it) => (
          <NavItem
            key={it.label}
            icon={it.icon}
            label={it.label}
            active={it.label === current}
            onClick={close}
          />
        ))}
      </nav>

      <div className="my-1.5 h-px shrink-0 bg-[var(--ds-border-subtle)]" />

      <div className="flex flex-col gap-0.5">
        {NAV_SECONDARY.map((it) => (
          <NavItem key={it.label} icon={it.icon} label={it.label} onClick={close} />
        ))}
      </div>
    </>
  )
}

const MEGA_ICON = { size: 15 } as const

/**
 * What the mega panel carries. The extra width is only worth taking if it buys
 * something a single column could not: headings that group the destinations,
 * and a line of description under each one. A wide panel of bare labels is a
 * dropdown that has been stretched.
 */
const MEGA_COLUMNS: MegaMenuColumn[] = [
  {
    title: 'Build',
    items: [
      { label: 'Dashboard', description: 'Your work at a glance', icon: <Home {...MEGA_ICON} /> },
      { label: 'Components', description: '48 in the library', icon: <Layers {...MEGA_ICON} /> },
      { label: 'Patterns', description: 'Compositions that recur', icon: <LayoutGrid {...MEGA_ICON} /> },
      { label: 'Templates', description: 'Screens, ready to fork', icon: <LayoutTemplate {...MEGA_ICON} /> },
    ],
  },
  {
    title: 'Learn',
    items: [
      { label: 'Guidelines', description: 'Why, not just what', icon: <BookOpen {...MEGA_ICON} /> },
      { label: 'Foundations', description: 'Colour, type, space', icon: <Palette {...MEGA_ICON} /> },
      { label: 'Accessibility', description: 'What we test, and how', icon: <Accessibility {...MEGA_ICON} /> },
      { label: 'Changelog', description: 'What moved, and when', icon: <History {...MEGA_ICON} /> },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Kits & assets', description: 'Figma, fonts, logos', icon: <Folder {...MEGA_ICON} /> },
      { label: 'Icons', description: '1,200, one grid', icon: <Shapes {...MEGA_ICON} /> },
      { label: 'Downloads', description: 'Tokens as JSON and CSS', icon: <Download {...MEGA_ICON} /> },
      { label: 'Support', description: 'Ask a maintainer', icon: <LifeBuoy {...MEGA_ICON} /> },
    ],
  },
]

/**
 * The Mega Menu. The same anchored surface as the dropdown, given enough width
 * to group what it holds.
 *
 * The columns come from the Bible's own MegaMenu, so a panel opened from a
 * hamburger and one opened from a menu bar are the same panel — only the thing
 * that opens them differs.
 */
function NavMega({ close }: { close: () => void }) {
  return (
    <nav
      aria-label="Primary"
      // Delegation, so the close does not have to be threaded through every
      // link in the panel. `closest` is what keeps a click on a column heading
      // from counting as a destination.
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('a')) return
        // Nowhere to go in a doc, and a hash jump would throw the page to the
        // top of the article the reader is in the middle of.
        e.preventDefault()
        close()
      }}
    >
      <MegaPanel columns={MEGA_COLUMNS} />

      {/* The same "about you and the app" group the drawers put under a rule.
          It is a row rather than a fourth column, because it is not a peer of
          the three — it is what you do when you are done navigating. */}
      <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-[var(--ds-border-subtle)] pt-3">
        {NAV_SECONDARY.map((it) => (
          <a
            key={it.label}
            href="#"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)] transition-colors duration-[120ms] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
          >
            <span className="text-[var(--ds-fg-muted)]" aria-hidden>
              {it.icon}
            </span>
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

/**
 * The window each version is shown in.
 *
 * `data-theme` re-themes this subtree only — the tokens are bound with
 * `inline`, so a light island inside the dark docs is just an attribute. It is
 * also the container the drawer measures itself against, which is what lets a
 * 390px frame behave like a 390px phone.
 */
function Frame({
  theme, rtl, width, children,
}: {
  theme: 'dark' | 'light'
  rtl: boolean
  width: number | null
  children: React.ReactNode
}) {
  return (
    <div
      data-theme={theme}
      dir={rtl ? 'rtl' : 'ltr'}
      className="@container overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]"
      style={width ? { maxWidth: width } : undefined}
    >
      {children}
    </div>
  )
}

/** Every way the bar's first slot is allowed to open navigation. */
type NavMode = DrawerMode | 'dropdown' | 'mega'

/**
 * A bar over a screen that has navigation. What the variations disagree about
 * is only whether navigation may become a column, and whether it hangs off the
 * screen's edge or off the button — so everything else lives here once.
 */
function NavigatedScreen({
  bar, mode, defaultOpen, height,
}: {
  bar: BarState
  mode: NavMode
  defaultOpen: boolean
  height: number
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  // The floating variations own their trigger — the button is the anchor, so
  // the two cannot be separated the way a drawer and its hamburger can.
  const anchored = mode === 'dropdown' || mode === 'mega'
  return (
    <>
      <Bar
        {...bar}
        sticky={false}
        leading={
          anchored ? (
            <AnchoredNav
              open={open}
              setOpen={setOpen}
              width={mode === 'mega' ? MEGA_W : MENU_W}
              surface={cn(
                mode === 'mega'
                  ? 'rounded-[var(--radius-xl)] p-5'
                  : 'rounded-[var(--radius-lg)] p-1.5',
                // Below 768px there is no room for columns, so the panel is
                // not offered at all — the drawer below takes over. Same
                // width the Navigation Drawer gives up its column at, for the
                // same reason: that is where the layout stops fitting.
                mode === 'mega' && '@max-[767px]:hidden',
              )}
            >
              {(close) =>
                mode === 'mega' ? <NavMega close={close} /> : <NavMenu current="Dashboard" close={close} />
              }
            </AnchoredNav>
          ) : (
            <IconButton
              label={open ? 'Close navigation' : 'Open navigation'}
              aria-expanded={open}
              icon={<Menu />}
              size="md"
              onClick={() => setOpen((o) => !o)}
            />
          )
        }
      />
      <div className="relative flex overflow-hidden" style={{ height }}>
        {!anchored && (
          <NavDrawer open={open} onDismiss={() => setOpen(false)} current="Dashboard" mode={mode} />
        )}
        {/* A phone gets the drawer instead. The wrapper is static, so the
            drawer's own absolute positioning still resolves against the row —
            all this div does is carry the query that switches them. */}
        {mode === 'mega' && (
          <div className="@min-[768px]:hidden">
            <NavDrawer
              open={open}
              onDismiss={() => setOpen(false)}
              current="Dashboard"
              mode="overlay"
            />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-3 overflow-y-auto p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-[var(--ds-layer-active)]"
              style={{ width: `${[92, 78, 88, 64, 84, 72][i % 6]}%` }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

/* ===========================================================================
   VERSION 3 — WITH TABS

   The second row. Navigation moves you between screens; tabs move you between
   views OF one screen — which is why they are under the bar rather than in it,
   and why the bar above them does not change as you switch.
   ======================================================================== */

const SECTION_TABS: TabSpec[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', count: 12 },
  { value: 'members', label: 'Members' },
  { value: 'integrations', label: 'Integrations' },
  { value: 'settings', label: 'Settings' },
]

/**
 * A bar with a tab row under it.
 *
 * The elevated thing is the masthead — both rows together — not the bar. Left
 * to lift itself, the bar would cast its shadow onto the tabs and draw a seam
 * across the middle of a block that is meant to read as one. So the plane
 * moves out here and the bar inside it is flat.
 *
 * The tab row is not given a bottom border either: the underline variant
 * already carries the rail the active tab breaks, and it is the same hairline
 * token the bar's own border uses. Two of them stacked is a 2px line nobody
 * asked for — which is why the Border knob has nothing to do in this version.
 */
function TabbedScreen({ bar, height }: { bar: BarState; height: number }) {
  const [tab, setTab] = React.useState(SECTION_TABS[0].value)
  const seed = SECTION_TABS.findIndex((t) => t.value === tab)

  return (
    <>
      <div
        className={cn(
          '@container',
          bar.elevated ? 'bg-[var(--ds-surface)] shadow-e2' : 'bg-[var(--ds-canvas)]',
        )}
      >
        {/* Transparent, not unelevated: an unelevated bar still paints its own
            plane — canvas — and would lay a second colour over the masthead's
            surface, which is the seam this whole arrangement exists to avoid.
            The block below it owns the plane; the bar is a row in it. */}
        <Bar
          {...bar}
          elevated={false}
          bordered={false}
          sticky={false}
          className="bg-transparent"
        />

        {/* The same cap and the same gutter the bar uses, off the same two
            exports — the tabs line up with the brand above them, not with the
            edge of the window. */}
        <div
          className={cn('mx-auto w-full', appBarGutter(bar.fullBleed))}
          style={bar.fullBleed ? undefined : { maxWidth: APP_BAR_MAX_WIDTH }}
        >
          {/* Scroll rather than wrap or squeeze: a second row of tabs is a new
              layout, and a row of squeezed labels is unreadable in both. The
              list is `w-max` so the rail runs the full scrollable width, and
              `min-w-full` so it still spans the row when the tabs do not. */}
          <div className="scrollbar-none overflow-x-auto">
            <Tabs
              tabs={SECTION_TABS}
              value={tab}
              onChange={setTab}
              aria-label="Workspace views"
              className="w-max min-w-full"
            />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto p-4" style={{ height }}>
        <TabPanel value={tab} active className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-[var(--ds-layer-active)]"
              style={{ width: `${[92, 78, 88, 64, 84, 72][(i + seed) % 6]}%` }}
            />
          ))}
        </TabPanel>
      </div>
    </>
  )
}

/** The label above one variation inside a family. */
function Variation({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-2.5 mt-6 flex flex-col gap-0.5">
      <span className="text-label text-[var(--ds-fg)]">{title}</span>
      <span className="max-w-[62ch] text-caption text-[var(--ds-fg-muted)]">{note}</span>
    </div>
  )
}

function Playground() {
  const [align, setAlign] = React.useState(DEFAULTS.align)
  const [theme, setTheme] = React.useState(DEFAULTS.theme)
  const [view, setView] = React.useState(DEFAULTS.view)
  const [rtl, setRtl] = React.useState(DEFAULTS.rtl)
  const [elevated, setElevated] = React.useState(DEFAULTS.elevated)
  const [bordered, setBordered] = React.useState(DEFAULTS.bordered)
  const [fullBleed, setFullBleed] = React.useState(DEFAULTS.fullBleed)

  const reset = () => {
    setAlign(DEFAULTS.align)
    setTheme(DEFAULTS.theme)
    setView(DEFAULTS.view)
    setRtl(DEFAULTS.rtl)
    setElevated(DEFAULTS.elevated)
    setBordered(DEFAULTS.bordered)
    setFullBleed(DEFAULTS.fullBleed)
  }

  const device = VIEWS.find((v) => v.id === view)!
  const bare = React.useContext(PreviewContext)?.bare
  const barState: BarState = { align, elevated, bordered, fullBleed }

  if (bare) {
    return (
      <NativeView
        align={align}
        setAlign={setAlign}
        rtl={rtl}
        setRtl={setRtl}
        elevated={elevated}
        setElevated={setElevated}
        bordered={bordered}
        setBordered={setBordered}
        fullBleed={fullBleed}
        setFullBleed={setFullBleed}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---- The panel ------------------------------------------------- */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
        {/* The section above already says this is the live preview, so the
            panel is knobs and nothing else. */}
        <div className="flex flex-wrap items-start gap-x-4 gap-y-5 p-4">
          <Knob label="Alignment">
            <Segmented
              aria-label="Title alignment"
              value={align}
              onChange={setAlign}
              options={ALIGN_OPTIONS.map((o) => ({
                value: o.value as AppBarAlign,
                // The icon already says left/centre/right. Spelling it out
                // again costs 70px of a row that has none to spare.
                label: <span className="sr-only">{o.label}</span>,
                icon: o.icon,
              }))}
            />
          </Knob>

          <Knob label="Theme">
            <IconButton
              label={theme === 'dark' ? 'Switch the preview to light' : 'Switch the preview to dark'}
              icon={theme === 'dark' ? <Moon /> : <Sun />}
              variant="outlined"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            />
          </Knob>

          <Knob label="Dir">
            <RtlToggle rtl={rtl} onChange={setRtl} />
          </Knob>

          <Knob label="View">
            <Segmented
              aria-label="Preview width"
              value={view}
              onChange={setView}
              options={VIEWS.map((v) => ({
                value: v.id,
                // Icon-only segments still need a name — visually hidden, not absent.
                label: <span className="sr-only">{v.name}</span>,
                icon: v.icon,
              }))}
            />
          </Knob>

          <Knob label="Options">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <Checkbox
                size="sm"
                label="Elevated"
                checked={elevated}
                onChange={(e) => setElevated(e.currentTarget.checked)}
              />
              <Checkbox
                size="sm"
                label="Border"
                checked={bordered}
                onChange={(e) => setBordered(e.currentTarget.checked)}
              />
              <Checkbox
                size="sm"
                label="Full bleed"
                checked={fullBleed}
                onChange={(e) => setFullBleed(e.currentTarget.checked)}
              />
            </div>
          </Knob>

          <div className="ms-auto flex items-center gap-1.5 self-center">
            {/* A real link under the popup: if the browser refuses a sized
                window, the href still opens the same route in a new tab.
                Doing nothing is the one outcome this must not have. */}
            {/* Glyphs, not labels: the same two controls the Bible's own
                preview toolbar carries, and the row has no width to spend on
                spelling them out. Both keep a name for the screen reader and
                a tooltip for everyone else. */}
            <a
              href={devicePath('app-bar')}
              target="_blank"
              rel="noreferrer"
              aria-label="Pop out into a real viewport"
              title="Pop out into a real viewport"
              onClick={(e) => {
                if (openNative()) e.preventDefault()
              }}
              className="relative grid h-9 w-9 select-none place-items-center rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] text-[var(--ds-fg)] transition-colors duration-[120ms] hover:border-[var(--ds-border-strong)] hover:bg-[var(--ds-layer-hover)] active:bg-[var(--ds-layer-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
            >
              <MonitorSmartphone size={16} />
            </a>
            <IconButton
              label="Reset the playground"
              title="Reset the playground"
              icon={<RotateCcw />}
              variant="outlined"
              size="md"
              onClick={reset}
            />
          </div>
        </div>
      </div>

      {/* ---- The preview ----------------------------------------------- */}
      <div>
        {/* The band rides the heading rather than a column beside the frame:
            the bar's whole argument is what it does with the width it is
            given, so nothing takes width away from it. */}
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-h4 text-[var(--ds-fg)]">Preview</h3>
          <span className="flex items-center gap-2 text-caption text-[var(--ds-fg-muted)]">
            <span className="text-[var(--ds-fg-muted)]">{device.icon}</span>
            {device.name} · {device.band}
          </span>
        </div>

        <div className="mt-5">
          {/* Each block below is an anchor as well as a specimen: "On this page"
              lists the variations, and the id has to sit on the whole block
              rather than on its label, or the sidebar stops tracking the moment
              the label scrolls off. */}
          <div id="basic" className="scroll-mt-28">
            <SubHeading description="The bar on its own: the way out, the brand, the utilities, the person. Every knob above changes an arrangement or a plane — none of them add a part.">
              Basic
            </SubHeading>
            <Frame theme={theme} rtl={rtl} width={device.width}>
              <Bar {...barState} sticky={false} />
            </Frame>
          </div>

          <div id="with-navigation" className="mt-8 scroll-mt-28">
            <SubHeading description="The same bar, now doing the job its first slot exists for. The bar does not change between these; what the drawer trigger opens is the whole difference.">
              With navigation
            </SubHeading>

            <div id="navigation-drawer" className="scroll-mt-28">
              <Variation
                title="Navigation Drawer"
                note="A column where there is room beside the content, an overlay where there is not — decided by the container's width, not the window's. The default for a product whose navigation is the spine of the screen: on a desktop it is always in view and costs no gesture, and it gets out of the way by itself on a phone."
              />
              <Frame theme={theme} rtl={rtl} width={device.width}>
                <NavigatedScreen bar={barState} mode="responsive" defaultOpen height={400} />
              </Frame>
            </div>

            <div id="overlay-drawer" className="scroll-mt-28">
              <Variation
                title="Overlay Drawer"
                note="Over the content at every width, always with a scrim, always closed until asked for. Choose it when the content deserves the full width on every screen, or when the navigation is deep enough to be visited rather than scanned — the cost is a gesture on every trip, paid even on a monitor with room to spare."
              />
              <Frame theme={theme} rtl={rtl} width={device.width}>
                <NavigatedScreen bar={barState} mode="overlay" defaultOpen={false} height={400} />
              </Frame>
            </div>

            <div id="dropdown" className="scroll-mt-28">
              <Variation
                title="Dropdown"
                note="A small menu hung off the hamburger rather than a panel hung off the edge of the screen. It opens where the finger already is, covers a corner of the content instead of a third of it, and carries no scrim because nothing behind it is blocked. Choose it when the navigation is short enough to take in at a glance — past seven or eight destinations it becomes a list scrolling inside a floating box, which is a drawer that has forgotten it is one. Spend the width and group it, or take the drawer."
              />
              <Frame theme={theme} rtl={rtl} width={device.width}>
                <NavigatedScreen bar={barState} mode="dropdown" defaultOpen={false} height={400} />
              </Frame>
            </div>

            <div id="mega-menu" className="scroll-mt-28">
              <Variation
                title="Mega Menu"
                note="The same anchored surface, given enough width to group what it holds: columns with headings, and a line under each destination saying what it is. Choose it when the navigation is broad rather than deep — thirty places that fall into four groups, where the grouping is half the answer. It is the one variation with a floor as well as a ceiling: below 768px there is no room for columns, so the panel is not offered at all and the same hamburger opens the Overlay Drawer instead."
              />
              <Frame theme={theme} rtl={rtl} width={device.width}>
                <NavigatedScreen bar={barState} mode="mega" defaultOpen={false} height={400} />
              </Frame>
            </div>
          </div>

          <div id="with-tabs" className="mt-8 scroll-mt-28">
            <SubHeading
              description="A second row under the bar. Navigation moves you between screens; tabs move you between views of one screen — so the bar above them does not change as you switch, and neither does the URL's first segment. Five is about the ceiling: past that the row is a menu that has been unrolled. The two rows are one block, so the elevation belongs to the pair rather than to the bar, and the tab rail is the bottom edge — which leaves the Border knob nothing to do here."
            >
              With tabs
            </SubHeading>
            <Frame theme={theme} rtl={rtl} width={device.width}>
              <TabbedScreen bar={barState} height={360} />
            </Frame>
          </div>
        </div>

        <p className="mt-6 text-caption text-[var(--ds-fg-muted)]">
          The bar reflows on its own width, not the window's. At the mobile frame it drops to 56px
          and sheds the third utility — the same reflow a phone gets, for the same reason. Pop it out
          to see it against a real viewport, where <code>100dvh</code>, the safe-area insets and a
          coarse pointer are all true rather than simulated. RTL mirrors the whole bar, so the
          alignment names describe where things sit reading left to right — in Arabic or Hebrew,
          “Left” is the right-hand edge, because that is where the line starts.
        </p>
      </div>
    </div>
  )
}

/* ===========================================================================
   NATIVE VIEW

   What the pop-out window renders. The panel does not come with it: theme and
   device belong to that window's own floating bar, and a simulated width is
   meaningless inside a viewport that already is one. What survives — alignment
   and the three container options — goes into that bar, so the viewport under
   test keeps every pixel.
   ======================================================================== */

function NativeView({
  align, setAlign, rtl, setRtl, elevated, setElevated, bordered, setBordered, fullBleed, setFullBleed,
}: {
  align: AppBarAlign
  setAlign: (v: AppBarAlign) => void
  rtl: boolean
  setRtl: (v: boolean) => void
  elevated: boolean
  setElevated: (v: boolean) => void
  bordered: boolean
  setBordered: (v: boolean) => void
  fullBleed: boolean
  setFullBleed: (v: boolean) => void
}) {
  // Closed is the resting state on a phone: an overlay that covers the screen
  // the moment the page loads is showing the drawer, not the screen.
  const [navOpen, setNavOpen] = React.useState(false)

  // The slot is a sibling that commits alongside this render, so it cannot be
  // found on the first pass. One extra pass, then it sticks.
  const [slot, setSlot] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => setSlot(document.getElementById(DEVICE_CONTROLS_SLOT)), [])

  // The whole window flips, not a box inside it: on a real device RTL is the
  // document's direction, and a bar mirrored inside an LTR page would be
  // answering an easier question than the one being asked.
  React.useEffect(() => {
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
    return () => {
      document.documentElement.dir = 'ltr'
    }
  }, [rtl])

  // The navigation version, because it is the superset: the basic bar is in
  // it, and the drawer is the part that most needs a real viewport — an
  // overlay, a scrim and a thumb reaching the trigger.
  return (
    <div className="@container relative flex min-h-dvh flex-col">
      <Bar
        align={align}
        elevated={elevated}
        bordered={bordered}
        fullBleed={fullBleed}
        sticky
        leading={
          <IconButton
            label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            icon={<Menu />}
            size="md"
            onClick={() => setNavOpen((o) => !o)}
          />
        }
      />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* The responsive one: the popped-out window is a real viewport, so
            768px is the real switch rather than a simulated one. */}
        <NavDrawer
          open={navOpen}
          onDismiss={() => setNavOpen(false)}
          current="Dashboard"
          mode="responsive"
        />
        {/* Something under the bar, so it is judged as the top of a screen
            rather than as a strip floating in an empty viewport. */}
        <div className="min-w-0 flex-1 space-y-3 overflow-y-auto p-4 pb-32">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-[var(--ds-layer-active)]"
              style={{ width: `${[92, 78, 88, 64, 84, 72][i % 6]}%` }}
            />
          ))}
        </div>
      </div>

      {slot &&
        createPortal(
          <>
            <Segmented
              size="sm"
              aria-label="Title alignment"
              value={align}
              onChange={setAlign}
              options={ALIGN_OPTIONS.map((o) => ({
                value: o.value as AppBarAlign,
                label: <span className="sr-only">{o.label}</span>,
                icon: o.icon,
              }))}
            />
            <RtlToggle rtl={rtl} onChange={setRtl} size="sm" />
            <Checkbox
              size="sm"
              label="Elevated"
              checked={elevated}
              onChange={(e) => setElevated(e.currentTarget.checked)}
            />
            <Checkbox
              size="sm"
              label="Border"
              checked={bordered}
              onChange={(e) => setBordered(e.currentTarget.checked)}
            />
            <Checkbox
              size="sm"
              label="Full bleed"
              checked={fullBleed}
              onChange={(e) => setFullBleed(e.currentTarget.checked)}
            />
          </>,
          slot,
        )}
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'app-bar',
    title: 'App Bar',
    tagline:
      'The top edge of the product: the way out, the brand, two or three global utilities, and the person signed in. Nothing else belongs in it.',
    keywords: ['app bar', 'top app bar', 'header', 'masthead', 'navbar', 'title bar', 'brand'],
  },

  preview: {
    render: <Playground />,
    // The page is one comparison from top to bottom, so the sidebar lists the
    // things being compared. Arriving at "Mega Menu" from a link should not
    // mean scrolling past three other variations to find it.
    contents: [
      { id: 'basic', title: 'Basic' },
      { id: 'with-navigation', title: 'With navigation' },
      { id: 'navigation-drawer', title: 'Navigation Drawer', depth: 2 },
      { id: 'overlay-drawer', title: 'Overlay Drawer', depth: 2 },
      { id: 'dropdown', title: 'Dropdown', depth: 2 },
      { id: 'mega-menu', title: 'Mega Menu', depth: 2 },
      { id: 'with-tabs', title: 'With tabs' },
    ],
  },
})
