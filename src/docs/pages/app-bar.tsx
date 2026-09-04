import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  AlignCenter, AlignLeft, AlignRight, Bell, Box, ChevronDown, HelpCircle, Home, Layers,
  LayoutGrid, Menu, Monitor, MonitorSmartphone, Moon, RotateCcw, Settings, Smartphone, Sun, Tablet,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Avatar } from '@/ui/Display'
import {
  AppBar, LAYOUT_CONTAINER, NavItem, TabPanel, Tabs, appBarGutter,
  type AppBarAlign, type TabSpec,
} from '@/ui/Navigation'
import { Checkbox, Segmented } from '@/ui/Toggle'
import { DEVICE_CONTROLS_SLOT, PreviewContext, devicePath } from '../framework/preview-context'
import { storedViewport } from '../framework/DeviceView'
import { Marker, Row, SubHeading, defineDoc } from '../framework/kit'

/* ===========================================================================
   APP BAR

   One row at the top of a screen: the way into navigation, what you are
   looking at, and the handful of actions that apply everywhere.

   The page documents the bar and nothing the bar OPENS. A drawer, a menu
   and a tab row each have their own contract, their own failure modes and
   their own page; explaining them here would mean two descriptions of
   each, drifting apart from the day they were written.
   ======================================================================== */

/* ===========================================================================
   THE SPECIMEN
   ======================================================================== */

/** The mark. The one thing in the bar allowed to carry the accent. */
const logo = <Box size={22} className="text-[var(--ds-accent-text)]" />

/**
 * Global utilities.
 *
 * Three is the desktop budget. The third is dropped by a container query
 * rather than by the page, so it goes at the same width in a 390px frame and
 * on a 390px phone — the docs and the real thing cannot disagree about where
 * the budget runs out.
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
      className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-[var(--ds-layer-hover)] active:bg-[var(--ds-layer-active)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
    >
      <Avatar name="User" size="md" />
      <ChevronDown size={16} className="text-[var(--ds-fg-muted)]" />
    </button>
  )
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
   PLAYGROUND CONTROLS
   ======================================================================== */

type ViewId = 'desktop' | 'tablet' | 'mobile'

/**
 * Three widths worth looking at, named by the band rather than by a device.
 * `width: null` means "whatever the page gives it" — the desktop case is the
 * fluid one, and pinning it to 1440 inside a 1024px column would be a lie.
 */
const VIEWS: { id: ViewId; name: string; band: string; icon: React.ReactNode; width: number | null }[] = [
  { id: 'desktop', name: 'Desktop', band: '1024px+', icon: <Monitor size={16} />, width: null },
  { id: 'tablet', name: 'Tablet', band: '640 – 1023px', icon: <Tablet size={16} />, width: 834 },
  { id: 'mobile', name: 'Mobile', band: '< 640px', icon: <Smartphone size={16} />, width: 390 },
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
  rtl, onChange, size = 'md',
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

/**
 * The window each variant is shown in.
 *
 * `data-theme` re-themes this subtree only — the tokens are bound with
 * `inline`, so a light island inside the dark docs is just an attribute. It is
 * also the container the bar measures itself against, which is what lets a
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

/** Filler, so a bar is judged as the top of a screen rather than as a strip. */
function Content({ lines = 10 }: { lines?: number }) {
  return (
    <div className="min-w-0 flex-1 space-y-3 overflow-y-auto p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-[var(--ds-layer-active)]"
          style={{ width: `${[92, 78, 88, 64, 84, 72][i % 6]}%` }}
        />
      ))}
    </div>
  )
}

/* ===========================================================================
   WITH NAVIGATION

   The bar's contribution is the trigger and the state it carries — pressed,
   expanded, controlling something. What opens is a Drawer, and the Drawer page
   owns everything about it: widths, scrim, dismissal, focus return. The panel
   below is the smallest one that makes the connection visible.
   ======================================================================== */

const NAV_ITEMS = [
  { icon: <Home size={16} />, label: 'Dashboard' },
  { icon: <Layers size={16} />, label: 'Components' },
  { icon: <LayoutGrid size={16} />, label: 'Patterns' },
  { icon: <Settings size={16} />, label: 'Settings' },
]

const PANEL_W = 240

function NavigatedScreen({ bar, height }: { bar: BarState; height: number }) {
  const [open, setOpen] = React.useState(false)
  const panelId = React.useId()

  return (
    <>
      <Bar
        {...bar}
        sticky={false}
        leading={
          <IconButton
            label={open ? 'Close navigation' : 'Open navigation'}
            // The two attributes that make a trigger a trigger: what state it
            // is in, and what it owns. Without them the button announces
            // "Open navigation, button" and never mentions that it worked.
            aria-expanded={open}
            aria-controls={panelId}
            icon={<Menu />}
            size="md"
            onClick={() => setOpen((o) => !o)}
          />
        }
      />
      <div className="relative flex overflow-hidden" style={{ height }}>
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 z-10 bg-[var(--ds-layer-scrim)] transition-opacity duration-[200ms]',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        />
        <nav
          id={panelId}
          aria-label="Primary"
          aria-hidden={!open}
          style={{ width: PANEL_W, marginInlineStart: open ? 0 : -PANEL_W }}
          className={cn(
            'absolute inset-y-0 start-0 z-20 flex shrink-0 flex-col gap-0.5 overflow-y-auto p-2',
            'border-e border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] shadow-e3',
            'transition-[margin-inline-start] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]',
          )}
        >
          {NAV_ITEMS.map((it) => (
            <NavItem key={it.label} icon={it.icon} label={it.label} active={it.label === 'Dashboard'} />
          ))}
        </nav>
        <Content />
      </div>
    </>
  )
}

/* ===========================================================================
   WITH TABS

   Navigation moves you between screens; tabs move you between views of one
   screen. That is why they are a row UNDER the bar rather than a second row
   inside it: the bar keeps saying where you are while the tabs change what
   you see, and neither has to grow a second job.
   ======================================================================== */

const SECTION_TABS: TabSpec[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity', count: 12 },
  { value: 'members', label: 'Members' },
  { value: 'settings', label: 'Settings' },
]

/**
 * A bar with a tab row under it.
 *
 * The elevated thing is both rows together, not the bar. Left to lift itself,
 * the bar would cast its shadow onto the tabs and draw a seam across the middle
 * of a block that is meant to read as one. So the plane moves out here and the
 * bar inside it is flat.
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
            plane — canvas — and would lay a second colour over the block's
            surface, which is the seam this arrangement exists to avoid. */}
        <Bar {...bar} elevated={false} bordered={false} sticky={false} className="bg-transparent" />

        {/* The same cap and the same gutter the bar uses, off the same two
            exports — so the first tab starts exactly where the bar's first slot
            does, rather than at the edge of the window. */}
        <div
          className={cn('mx-auto w-full', appBarGutter(bar.fullBleed))}
          style={bar.fullBleed ? undefined : { maxWidth: LAYOUT_CONTAINER }}
        >
          {/* Scroll rather than wrap or squeeze: a second row of tabs is a new
              layout, and a row of squeezed labels is unreadable in both. */}
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

/* ===========================================================================
   PLAYGROUND
   ======================================================================== */

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
        align={align} setAlign={setAlign}
        rtl={rtl} setRtl={setRtl}
        elevated={elevated} setElevated={setElevated}
        bordered={bordered} setBordered={setBordered}
        fullBleed={fullBleed} setFullBleed={setFullBleed}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ---- The panel ------------------------------------------------- */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
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
                size="sm" label="Elevated" checked={elevated}
                onChange={(e) => setElevated(e.currentTarget.checked)}
              />
              <Checkbox
                size="sm" label="Border" checked={bordered}
                onChange={(e) => setBordered(e.currentTarget.checked)}
              />
              <Checkbox
                size="sm" label="Full bleed" checked={fullBleed}
                onChange={(e) => setFullBleed(e.currentTarget.checked)}
              />
            </div>
          </Knob>

          <div className="ms-auto flex items-center gap-1.5 self-center">
            {/* A real link under the popup: if the browser refuses a sized
                window, the href still opens the same route in a new tab. */}
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

      {/* ---- The variants ---------------------------------------------- */}
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
              lists the variants, and the id has to sit on the whole block
              rather than on its label, or the sidebar stops tracking the moment
              the label scrolls off. */}
          <div id="default" className="scroll-mt-28">
            <SubHeading description="The bar on its own: a navigation trigger, the brand, two or three global utilities, and the signed-in account. Every control above changes an arrangement or a plane — none of them add a part.">
              Default
            </SubHeading>
            <Frame theme={theme} rtl={rtl} width={device.width}>
              <Bar {...barState} sticky={false} />
            </Frame>
          </div>

          <div id="with-navigation" className="mt-8 scroll-mt-28">
            <SubHeading description="The leading slot holds the trigger; the panel it opens is a Drawer. The bar's whole part in this is the button, its accessible name, and the aria-expanded / aria-controls pair that says what it owns.">
              With navigation
            </SubHeading>
            <Frame theme={theme} rtl={rtl} width={device.width}>
              <NavigatedScreen bar={barState} height={340} />
            </Frame>
            <p className="mt-3 max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
              What opens is a choice this page does not make. See{' '}
              <a href="/drawer" className="text-[var(--ds-accent-text)] underline underline-offset-2">Drawer</a> for
              navigation that slides over the content,{' '}
              <a href="/sidebar" className="text-[var(--ds-accent-text)] underline underline-offset-2">Sidebar</a> for
              a column that stays,{' '}
              <a href="/menu" className="text-[var(--ds-accent-text)] underline underline-offset-2">Menu</a> for a
              short list hung off the trigger, and{' '}
              <a href="/mega-menu" className="text-[var(--ds-accent-text)] underline underline-offset-2">Mega Menu</a>{' '}
              for a wide grouped panel.
            </p>
          </div>

          <div id="with-tabs" className="mt-8 scroll-mt-28">
            <SubHeading description="Tabs switch between views of the screen you are already on, so they sit in a row under the bar and the bar does not change as you move between them. Their own rules — counts, overflow, keyboard model — are on the Tabs page.">
              With tabs
            </SubHeading>
            <Frame theme={theme} rtl={rtl} width={device.width}>
              <TabbedScreen bar={barState} height={300} />
            </Frame>
            <p className="mt-3 max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
              The two rows are one block, so the elevation belongs to the pair rather than to the
              bar, and the tab rail is the bottom edge — which leaves the Border option nothing to
              do here. See{' '}
              <a href="/tabs" className="text-[var(--ds-accent-text)] underline underline-offset-2">Tabs</a>.
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-[72ch] text-caption leading-relaxed text-[var(--ds-fg-muted)]">
          The bar reflows on its own width, not the window's, so a bar inside a 390px panel is
          compact for the same reason one in a 390px window is. Pop it out to see it against a real
          viewport, where <code>100dvh</code>, the safe-area insets and a coarse pointer are all
          true rather than simulated. RTL mirrors the whole bar, so the alignment names describe
          where things sit reading left to right.
        </p>
      </div>
    </div>
  )
}

/* ===========================================================================
   NATIVE VIEW

   What the pop-out window renders. The panel does not come with it: theme and
   device belong to that window's own floating bar, and a simulated width is
   meaningless inside a viewport that already is one.
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

  return (
    <div className="@container relative flex min-h-dvh flex-col">
      <NavigatedScreen
        bar={{ align, elevated, bordered, fullBleed }}
        height={typeof window === 'undefined' ? 600 : window.innerHeight - 64}
      />

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
              size="sm" label="Elevated" checked={elevated}
              onChange={(e) => setElevated(e.currentTarget.checked)}
            />
            <Checkbox
              size="sm" label="Border" checked={bordered}
              onChange={(e) => setBordered(e.currentTarget.checked)}
            />
            <Checkbox
              size="sm" label="Full bleed" checked={fullBleed}
              onChange={(e) => setFullBleed(e.currentTarget.checked)}
            />
          </>,
          slot,
        )}
    </div>
  )
}

/* ===========================================================================
   STATES

   Every state is forced with the same class the real interaction applies, so
   what is drawn here is what ships rather than a picture of it.
   ======================================================================== */

/** One control, held in a state it would normally only pass through. */
function StateSpecimen({ className, disabled }: { className?: string; disabled?: boolean }) {
  return (
    <IconButton
      label="Notifications"
      icon={<Bell />}
      size="md"
      disabled={disabled}
      className={className}
    />
  )
}

/* ===========================================================================
   ANATOMY

   Drawn rather than rendered, and that is a deliberate exception to this
   page's rule of showing the real component. AppBar reflows on its OWN width
   at 640px, and the anatomy layout gives the diagram whatever is left beside a
   20rem parts column — so a real bar dropped in here would render the compact
   variant at every viewport anyone actually uses, and permanently document
   56px while the notes beside it described 64px.
   ======================================================================== */

/** One slot's box, dashed, so the grid is visible rather than implied. */
function Slot({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('relative flex h-11 items-center rounded-md px-1.5', className)}
      style={{
        outline: '1px dashed color-mix(in srgb, var(--ds-accent) 50%, transparent)',
        outlineOffset: -1,
      }}
    >
      {children}
    </div>
  )
}

/** A stand-in for one icon control, at the size the real one occupies. */
function Ghost({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)]">
      {icon}
    </span>
  )
}

function AnatomySpecimen() {
  return (
    // Fixed width inside a scroller, not a fluid box. The diagram sits beside a
    // 20rem parts column, so on anything under a wide monitor a fluid mock runs
    // out of room and squeezes the brand out of a drawing whose whole job is to
    // label the brand. A labelled drawing has one geometry; it scrolls.
    <div className="w-full overflow-x-auto pb-1">
    <div className="relative w-[520px] min-w-[520px] py-6 ps-7">
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ds-surface)] shadow-e2">
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 px-10">
          <Slot>
            <Ghost icon={<Menu size={18} />} />
            <Marker n={2} className="absolute -start-3 -top-3.5" />
          </Slot>

          <Slot className="min-w-0 gap-2.5">
            <Box size={22} className="shrink-0 text-[var(--ds-accent-text)]" />
            <span className="truncate text-h3 text-[var(--ds-fg)]">UI Bible</span>
            <Marker n={3} tone="success" className="absolute -start-3 -top-3.5" />
          </Slot>

          <div className="flex items-center justify-end">
            <Slot className="gap-0.5">
              <Ghost icon={<HelpCircle size={18} />} />
              <Ghost icon={<Bell size={18} />} />
              <Ghost icon={<Settings size={18} />} />
              <Marker n={4} tone="warning" className="absolute -top-3.5 start-2" />
            </Slot>
            <Slot className="ms-1.5 gap-1">
              <span className="h-8 w-8 rounded-full bg-[var(--ds-layer-active)]" />
              <ChevronDown size={16} className="text-[var(--ds-fg-muted)]" />
              <Marker n={5} tone="info" className="absolute -end-3 -top-3.5" />
            </Slot>
          </div>
        </div>
      </div>

      {/* Height guide — 64px, and true here because the mock does not reflow. */}
      <span
        aria-hidden
        className="absolute -start-0 top-6 flex h-16 w-6 flex-col items-center justify-between"
      >
        <span className="h-px w-4 bg-[var(--ds-accent)]" />
        <span className="font-mono text-caption text-[var(--ds-accent-text)]">64</span>
        <span className="h-px w-4 bg-[var(--ds-accent)]" />
      </span>
      <Marker n={1} tone="info" className="absolute -start-2.5 top-4" />

      {/* Gutter guide, drawn on the bar's own inline padding — 40px at this
          width, and the same 40px the page under it uses. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 start-7 top-6 w-10 border-e border-dashed border-[var(--ds-accent)]/50"
      />
      <span className="absolute -bottom-0 start-[2.4rem] font-mono text-caption text-[var(--ds-accent-text)]">
        40
      </span>
      <Marker n={6} className="absolute -bottom-2.5 start-[4.5rem]" />
    </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'app-bar',
    title: 'App Bar',
    tagline:
      'The persistent bar across the top of a screen. It holds three things: the way into navigation, what you are looking at, and the few actions that apply everywhere in the product. Anything belonging to the current screen goes below it.',
    keywords: [
      'app bar', 'top app bar', 'header', 'navbar', 'masthead', 'title bar', 'banner',
      'brand', 'account menu', 'sticky', 'elevation on scroll', 'global actions',
    ],
  },

  preview: {
    render: <Playground />,
    contents: [
      { id: 'default', title: 'Default' },
      { id: 'with-navigation', title: 'With navigation' },
      { id: 'with-tabs', title: 'With tabs' },
    ],
    // Every control in the bar is a button, so these are the button's states
    // shown where they are actually read: on a surface that may be elevated,
    // beside a brand, at the top of a screen.
    states: [
      { label: 'Default', note: 'Idle glyph, no fill', render: <StateSpecimen /> },
      { label: 'Hover', note: '--ds-layer-hover', render: <StateSpecimen className="bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]" /> },
      { label: 'Pressed', note: '--ds-layer-active', render: <StateSpecimen className="bg-[var(--ds-layer-active)] text-[var(--ds-fg)]" /> },
      { label: 'Focus visible', note: '2px ring, 2px offset', render: <StateSpecimen className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]" /> },
      { label: 'Disabled', note: 'Rare — prefer removing', render: <StateSpecimen disabled /> },
      {
        label: 'Trigger, expanded',
        note: 'aria-expanded="true"',
        render: (
          <IconButton
            label="Close navigation"
            icon={<Menu />}
            size="md"
            aria-expanded
            className="bg-[var(--ds-layer-active)] text-[var(--ds-fg)]"
          />
        ),
      },
      {
        label: 'Title, truncated',
        note: 'Never wraps to a second line',
        render: (
          <span className="block w-28 truncate text-h4 text-[var(--ds-fg)]">Acme Analytics Cloud</span>
        ),
      },
      {
        label: 'Account',
        note: 'Avatar and chevron, one target',
        render: <Account />,
      },
    ],
  },

  anatomy: {
    render: <AnatomySpecimen />,
    caption:
      'Four slots on one 64px row, drawn at desktop width. Slot 1 stays in the layout even when it holds nothing, so the brand does not shuffle sideways between a screen with a back arrow and one without. The live bar above is the real component — resize it to watch the row drop to 56px and the third utility leave.',
    parts: [
      {
        n: 1,
        label: 'Row height',
        value: '64px · 56px compact',
        kind: 'size',
        note: 'Drops to 56px below a 640px CONTAINER, not viewport — the bar reflows on its own width, so one inside a 390px panel is compact for the same reason one in a 390px window is. 56px is the smallest row that still holds a 44px target with room around it, which is why it is the near-universal phone height.',
      },
      {
        n: 2,
        label: 'Slot 1 — leading',
        value: '36px control, always present',
        kind: 'space',
        note: 'The way out: a navigation trigger, a back arrow, or nothing. It holds its track when empty, which is what keeps the brand from moving between screens.',
      },
      {
        n: 3,
        label: 'Slot 2 — brand or title',
        value: '--text-h3 · --text-h4 compact',
        kind: 'type',
        note: 'Mark plus product name, or the screen title. The mark is the one thing in the bar allowed to carry the accent. min-w-0 on this track is what makes the title truncate instead of shoving the actions off the end.',
      },
      {
        n: 4,
        label: 'Slot 3 — actions',
        value: '2px gap between controls',
        kind: 'space',
        note: 'Global utilities only. Three fit comfortably at desktop width and two below 640px; past that, move the rest into a menu rather than shrinking the controls.',
      },
      {
        n: 5,
        label: 'Slot 4 — account',
        value: '6px separation',
        kind: 'space',
        note: 'The signed-in person, set apart by a gap wider than the 2px between utilities. That gap is the whole statement: the account is not the fourth action. Avatar and chevron are one button, so the disclosure never becomes a separate 24px target.',
      },
      {
        n: 6,
        label: 'Gutter and content cap',
        value: 'From Grid & Layout',
        kind: 'space',
        note: 'The bar reads --ds-layout-gutter (24px), --ds-layout-gutter-lg (40px) and --ds-layout-container (76rem) — the same three values the page under it uses, which is what lines the brand up with the first column of content. Full-bleed gives both up: right for editor chrome, wrong for a bar heading a document.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', group: 'Layout', token: '--ds-layout-container', value: '76rem', usedFor: 'Content cap. Owned by Grid & Layout — the bar aligns to it rather than declaring one' },
    { category: 'spacing', group: 'Layout', token: '--ds-layout-gutter-lg', value: '40px', usedFor: 'Inline padding at a 640px container and above' },
    { category: 'spacing', group: 'Layout', token: '--ds-layout-gutter', value: '24px', usedFor: 'Inline padding below a 640px container' },
    { category: 'spacing', group: 'Layout', token: 'row height', value: '64 / 56px', usedFor: 'Regular and compact' },

    { category: 'color', group: 'Planes', token: '--ds-canvas', usedFor: 'Bar background when flat — the same plane as the page' },
    { category: 'color', group: 'Planes', token: '--ds-surface', usedFor: 'Bar background when elevated' },
    { category: 'color', group: 'Planes', token: '--ds-border-subtle', usedFor: 'The bordered hairline. Use instead of elevation, never with it' },
    { category: 'shadow', group: 'Planes', token: '--shadow-e2', usedFor: 'Elevation in the light theme; in dark the lift is carried by surface lightness alone' },

    { category: 'typography', group: 'Foreground', token: '--text-h3', value: '19px / 600', usedFor: 'Title at full width' },
    { category: 'typography', group: 'Foreground', token: '--text-h4', value: '16px / 600', usedFor: 'Title below a 640px container' },
    { category: 'color', group: 'Foreground', token: '--ds-fg', usedFor: 'Title' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-muted', usedFor: 'Idle icon glyphs and the account chevron' },
    { category: 'color', group: 'Foreground', token: '--ds-accent-text', usedFor: 'The brand mark — the only accent in the bar' },

    { category: 'color', group: 'Interaction', token: '--ds-layer-hover', usedFor: 'Hover fill on any control in the bar' },
    { category: 'color', group: 'Interaction', token: '--ds-layer-active', usedFor: 'Pressed fill, and a trigger while its panel is open' },
    { category: 'color', group: 'Interaction', token: '--ds-focus-ring', usedFor: 'Focus outline, 2px at 2px offset' },
    { category: 'motion', group: 'Interaction', token: '--ease-standard', value: 'cubic-bezier(0.2, 0, 0, 1)', usedFor: 'The 160ms background and shadow transition when elevation changes' },
  ],

  sizes: [
    {
      name: 'Desktop',
      height: '64px',
      padding: '40px gutter',
      type: '19px title',
      use: 'Container ≥ 640px. Three utilities plus the account. The row caps at 76rem and centres with the content column beneath it.',
    },
    {
      name: 'Tablet',
      height: '64px',
      padding: '40px gutter',
      type: '19px title',
      touch: '44px tall',
      use: 'The same row as desktop — the bar has one breakpoint, not three. What changes is the pointer: coarse input grows the targets, width does not.',
    },
    {
      name: 'Mobile',
      height: '56px',
      padding: '24px gutter',
      type: '16px title',
      touch: '44px tall',
      use: 'Container < 640px. Two utilities plus the account; anything further moves into a menu. Navigation is a trigger, never a visible row of destinations.',
    },
    {
      name: 'Full bleed',
      height: '64 / 56px',
      padding: '8px gutter',
      use: 'No content cap. For editor and tool chrome that owns the whole window — wrong for a bar heading a document column.',
    },
  ],

  do: [
    {
      title: 'Let the title truncate; keep the actions',
      why: 'The brand track is min-w-0 so it gives way first. A title that wraps makes the bar two rows tall and moves every control below the fold; a title that pushes the actions off the end loses them silently. One line, an ellipsis, and the full string in the accessible name.',
      render: (
        <div className="flex w-full max-w-[22rem] items-center gap-2 rounded-[var(--radius-md)] bg-[var(--ds-surface)] px-3 py-2">
          <Box size={18} className="shrink-0 text-[var(--ds-accent-text)]" />
          <span className="min-w-0 flex-1 truncate text-h4 text-[var(--ds-fg)]">
            Acme Analytics Cloud — Production
          </span>
          <Ghost icon={<Bell size={16} />} />
        </div>
      ),
    },
    {
      title: 'Name every icon-only control',
      why: 'An icon with no accessible name is announced as "button" and nothing else. IconButton makes `label` required for exactly this reason, and the name is the words a person would say — "Notifications", not "bell".',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-success)]">{'<IconButton label="Notifications" icon={<Bell />} />'}</span>
          <span className="text-[var(--ds-fg-muted)] line-through">{'<button><Bell /></button>'}</span>
        </div>
      ),
    },
    {
      title: 'Keep it to actions that apply everywhere',
      why: 'Search, notifications, help, account. If an action only makes sense on one screen, it belongs to that screen — in a Toolbar, or beside the thing it acts on. The bar is the one row that does not change, and every screen-specific control put in it takes that away.',
      render: (
        <Row gap="sm" align="center">
          <Ghost icon={<HelpCircle size={16} />} />
          <Ghost icon={<Bell size={16} />} />
          <Ghost icon={<Settings size={16} />} />
          <span className="text-body-sm text-[var(--ds-fg-muted)]">global only</span>
        </Row>
      ),
    },
    {
      title: 'Choose elevation or a border, not both',
      why: 'They answer the same question — where does the bar end and the page begin — and doing both draws a shadow under a line, which reads as a seam. Flat while the page is at the top and elevated once it scrolls is the usual pairing; a hairline is the quieter alternative for a dense tool.',
      render: (
        <div className="flex w-full max-w-[20rem] flex-col gap-3">
          <span className="h-8 rounded-[var(--radius-sm)] bg-[var(--ds-surface)] shadow-e2" />
          <span className="h-8 rounded-[var(--radius-sm)] border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]" />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put page controls in the bar',
      why: 'Filters, sort, save, export, view switches. They belong to one screen, and putting them in the row that is meant to be constant means the constant row changes on every navigation — which is the one thing that made it worth its 64px.',
      render: (
        <Row gap="sm" align="center">
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] px-2.5 py-1 text-label text-[var(--ds-fg-muted)]">Filter</span>
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] px-2.5 py-1 text-label text-[var(--ds-fg-muted)]">Sort</span>
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] px-2.5 py-1 text-label text-[var(--ds-fg-muted)]">Export</span>
          <a href="/toolbar" className="text-body-sm text-[var(--ds-accent-text)] underline underline-offset-2">Toolbar</a>
        </Row>
      ),
    },
    {
      title: 'Do not grow the bar to a second row',
      why: 'A tab row, a breadcrumb trail or a search field stacked inside the bar makes it two rows tall and gives the brand a second job. Those are separate rows under it, each with its own component and its own alignment to the content column.',
      render: (
        <div className="w-full max-w-[20rem] overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface)]">
          <div className="flex h-9 items-center px-3 text-label text-[var(--ds-fg)]">Acme</div>
          <div className="flex h-9 items-center gap-3 border-t border-dashed border-[var(--ds-danger-border)] px-3 text-label text-[var(--ds-fg-muted)]">
            Overview Activity Members
          </div>
        </div>
      ),
    },
    {
      title: 'Do not make the product name the page heading',
      why: 'The bar is a banner landmark, not the document outline. Marking the brand as an h1 gives every screen in the product the same heading and leaves the actual page title one level down, which is what a screen-reader user navigates by.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-fg-muted)] line-through">{'<header><h1>Acme</h1></header>'}</span>
          <span className="text-[var(--ds-success)]">{'<header><span>Acme</span></header>  <main><h1>Deployments</h1>'}</span>
        </div>
      ),
    },
    {
      title: 'Do not shrink controls to fit more in',
      why: 'The fix for a crowded bar is fewer things in it, not smaller ones. Below 36px the glyphs stop being recognisable at a glance and the targets stop clearing the spacing they need — and the utility that got squeezed in was, by definition, the least important one there.',
      render: (
        <Row gap="sm" align="center">
          <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] text-[var(--ds-fg-muted)]"><Bell size={12} /></span>
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--ds-fg-muted)]"><Bell size={14} /></span>
          <Ghost icon={<Bell size={18} />} />
          <span className="text-body-sm text-[var(--ds-fg-muted)]">36px is the floor</span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
    ],
    contrast: [
      'Idle glyphs use --ds-fg-muted, which clears 4.5:1 on both --ds-canvas and --ds-surface. Do not drop them to --ds-fg-disabled to make the bar quieter — that token is 2.66:1 and is exempt from contrast rules precisely because nothing readable may use it.',
      'The focus ring is 2px at 2px offset and must reach 3:1 against both the bar and whatever sits behind it. An elevated bar changes the backdrop, so check the ring in both planes.',
      'Hover fill alone is not a state for anyone who cannot see it. Every control here also carries a name, and a trigger carries aria-expanded.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through the bar in reading order: leading, brand link if it is one, each action, then the account. Every control is a real button or link — nothing in the bar is reachable only by pointer.' },
      { keys: 'Enter / Space', does: 'Activates the focused control. A trigger opens its panel and moves focus into it.' },
      { keys: 'Escape', does: 'Closes a panel opened from the bar and returns focus to the trigger that opened it — not to the top of the document.' },
      { keys: 'Tab (first stop)', does: 'A skip link before the bar jumps past it to the main content. Without one, every keyboard user crosses four to six controls on every page load.' },
    ],
    aria: [
      { attr: 'role="banner"', on: '<header>', note: 'One per page. It is the landmark screen-reader users jump to for the product-level controls, and a second one makes both ambiguous.' },
      { attr: 'aria-label', on: 'Icon-only buttons', note: 'Required. The name is what the control does — "Open navigation", "Notifications", "Account menu, Ada Lovelace".' },
      { attr: 'aria-expanded + aria-controls', on: 'The navigation trigger', note: 'Says whether the panel is open and which element it is. Without the pair the button announces the same thing before and after it works.' },
      { attr: 'aria-haspopup', on: 'The account control', note: '"menu" when it opens a menu. It tells the user a press opens something rather than navigating.' },
      { attr: 'aria-current="page"', on: 'A link in the bar to the current screen', note: 'Only if the bar carries destinations at all. Colour alone does not say "you are here".' },
    ],
    focus:
      'The ring is never removed, only restyled: 2px at 2px offset, on every control including the brand. A sticky bar also hides whatever the browser scrolls a focused element to, so the scroll container needs scroll-padding-top equal to the bar height — without it, tabbing into the page puts focus under the bar.',
    screenReader: [
      'The bar is a banner landmark, so it is announced as a region and can be skipped as one. Keep it that way: a <div> with a class named "app-bar" is invisible to that navigation.',
      'The product name is not the page heading. The screen names itself in <main>, with one h1 per page.',
      'A count on a notification icon must be in the accessible name — "Notifications, 3 unread" — not only in a badge. A badge is a picture of a number.',
    ],
    touch:
      'Controls are 36×36 and the pointer target is extended to 44px tall on coarse pointers, which clears the 24×24 that WCAG 2.5.8 requires at AA with room to spare. The extension is the control\'s own width, so adjacent targets never overlap and the 2px visual gap is safe. For a touch-first product, use the lg size instead — 44×44 in a 64px row — rather than adding margin between smaller controls.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption:
        'The bar is one component in every case. What changes is what its leading slot opens and what sits under it — neither of which is the bar\'s concern.',
      code: `function Header() {
  const [navOpen, setNavOpen] = React.useState(false)

  return (
    <>
      {/* First tabbable thing on the page, so the bar can be skipped. */}
      <a href="#main" className="skip-link">Skip to content</a>

      <AppBar
        title="UI Bible"
        logo={<Box size={22} className="text-accent-text" />}
        align="left"          // 'left' | 'center' | 'right'
        elevated              // surface + shadow. Use INSTEAD of bordered
        // fullBleed          // drop the content cap and the gutters
        leading={
          <IconButton
            label={navOpen ? 'Close navigation' : 'Open navigation'}
            icon={<Menu />}
            aria-expanded={navOpen}
            aria-controls="primary-nav"
            onClick={() => setNavOpen((o) => !o)}
          />
        }
        actions={
          <>
            <IconButton label="Help" icon={<HelpCircle />} />
            <IconButton label="Notifications, 3 unread" icon={<Bell />} />
            {/* The third utility drops on a narrow CONTAINER, not a narrow
                window — the bar reflows on its own width. */}
            <span className="@max-[640px]:hidden">
              <IconButton label="Settings" icon={<Settings />} />
            </span>
          </>
        }
        account={<AccountButton user={user} />}
      />

      {/* What the trigger opens is a Drawer, and it is a sibling of the bar.
          See the Drawer page — none of its rules live here. */}
      <Drawer id="primary-nav" open={navOpen} onClose={() => setNavOpen(false)} side="left">
        <PrimaryNav />
      </Drawer>

      {/* Tabs are a row UNDER the bar, aligned to the same column. */}
      <main id="main">…</main>
    </>
  )
}`,
    },
    css: {
      lang: 'css',
      caption: 'The two rules that are easy to miss: the bar aligns to the page, and a sticky bar has to be accounted for when something is scrolled into view.',
      code: `/* The cap and the gutters are the page's, not the bar's — see Grid & Layout.
   A bar that declares its own numbers agrees with the content column by
   coincidence, and stops agreeing the moment either side is edited. */
.app-bar__row {
  max-inline-size: var(--ds-layout-container); /* 76rem */
  margin-inline: auto;
  padding-inline: var(--ds-layout-gutter);     /* 24px */
  block-size: 3.5rem;                          /* 56px compact */
}

@container (min-width: 640px) {
  .app-bar__row {
    padding-inline: var(--ds-layout-gutter-lg); /* 40px */
    block-size: 4rem;                           /* 64px */
  }
}

/* A sticky bar covers whatever the browser scrolls to. Without this, tabbing
   into the page puts the focused element underneath the bar. */
html {
  scroll-padding-top: 4rem;
}`,
    },
    api: [
      {
        name: 'AppBar',
        props: [
          { name: 'title', type: 'ReactNode', required: true, description: 'The product name or screen title. One line — the bar truncates rather than wraps.' },
          { name: 'logo', type: 'ReactNode', description: 'The mark before the title. Square, and the only thing in the bar that carries the accent.' },
          { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", description: 'Where the brand block sits. Center switches the grid to equal side tracks so it is centred against the bar rather than against whatever the slots happen to weigh.' },
          { name: 'leading', type: 'ReactNode', description: 'Slot 1: a navigation trigger or a back arrow. The slot holds its track even when this is undefined, so the brand does not move between screens.' },
          { name: 'actions', type: 'ReactNode', description: 'Slot 3: global utilities. Three at desktop width, two below a 640px container.' },
          { name: 'account', type: 'ReactNode', description: 'Slot 4: the signed-in person, separated from the actions by a wider gap.' },
          { name: 'elevated', type: 'boolean', default: 'false', description: 'Lifts the bar off the page: --ds-surface plus --shadow-e2. Dark raises by lightness, light by shadow.' },
          { name: 'bordered', type: 'boolean', default: 'false', description: 'A hairline along the bottom edge. Use it INSTEAD of elevation — both together reads as a seam.' },
          { name: 'fullBleed', type: 'boolean', default: 'false', description: 'Runs the contents to the window edges: no content cap, gutter down to 8px. Right for editor chrome, wrong for a bar heading a document column.' },
          { name: 'maxWidth', type: 'string | number', default: 'var(--ds-layout-container)', description: 'The content column the bar aligns to. Defaults to the layout token, so overriding it is how a bar heads a narrower column — not how it invents a width.' },
          { name: 'sticky', type: 'boolean', default: 'true', description: 'Sticks to the top of its scroll container at z-10. Pair with scroll-padding-top so focused elements are not hidden underneath.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Flat at the top of the scroll, elevated once the page moves. It is the cheapest way to say "there is more above" and it costs one scroll listener and a 160ms transition.',
      'Centre the title only when the bar has nothing else to hold. With a trigger on one side and three utilities on the other, a centred title is off-centre against its own slots on every screen where the two sides differ in width.',
      'On a phone, a back arrow and a screen title are usually more useful than the brand. The brand is already established once; where you are is the question the bar is being asked.',
      'Count the controls before adding one. Four global utilities plus an account is where a bar starts reading as a toolbar, and the fourth is almost always a candidate for the account menu.',
    ],
    performance: [
      'Elevation on scroll should be driven by an IntersectionObserver on a sentinel element, not a scroll handler that runs on every frame.',
      'The bar is sticky, not fixed: sticky stays inside the document flow, so nothing below it needs a matching top offset that can drift out of sync with the height.',
      'Transition background-color and box-shadow only. Animating the height reflows every frame and makes the whole page jump as the bar changes size.',
    ],
    mistakes: [
      'Hiding the bar on scroll down and revealing it on scroll up. It saves 64px and costs the user the one row they expected to be constant — and on a short page it can make the bar unreachable without scrolling.',
      'Using a fixed pixel width for the content cap instead of the layout token, so the brand sits a few pixels away from the column it is supposed to head.',
      'Icon-only controls with a `title` and no accessible name. A tooltip is not a name: it never reaches a screen reader and never appears on touch.',
      'A bar that becomes two rows on a phone. That is the width where there is least room for it, and it is usually a sign that screen-level controls got in.',
    ],
    realWorld: [
      'Tab through the page from a cold load. If you cross the whole bar before reaching the content, the skip link is missing — and it is the single highest-value fix on this component.',
      'Open the product on a 1440px monitor and check the brand against the first column of content beneath it. If they are a few pixels apart, something is carrying its own copy of the cap.',
      'Give the product name to a customer with a long company name before shipping. "Acme" fits everything; "Northwestern Mutual Benefits Administration" is what actually arrives.',
    ],
  },
})
