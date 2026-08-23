import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  AlignCenter, AlignLeft, AlignRight, Bell, Box, ChevronDown, HelpCircle, Menu, Monitor,
  MonitorSmartphone, Moon, RotateCcw, Settings, Smartphone, Sun, Tablet,
} from 'lucide-react'
import { Button, IconButton } from '@/ui/Button'
import { Avatar } from '@/ui/Display'
import { AppBar, type AppBarAlign } from '@/ui/Navigation'
import { Checkbox, Segmented } from '@/ui/Toggle'
import { DEVICE_CONTROLS_SLOT, PreviewContext, devicePath } from '../framework/preview-context'
import { storedViewport } from '../framework/DeviceView'
import { defineDoc } from '../framework/kit'

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
function Bar({ align, elevated, bordered, fullBleed, sticky }: BarState & { sticky?: boolean }) {
  return (
    <AppBar
      title="UI Bible"
      logo={logo}
      align={align}
      leading={<IconButton label="Open navigation" icon={<Menu />} size="md" />}
      actions={utilities}
      account={<Account />}
      elevated={elevated}
      bordered={bordered}
      fullBleed={fullBleed}
      sticky={sticky}
    />
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

        <div className="mt-4">
          <div className="min-w-0">
            {/* data-theme re-themes this subtree only — the tokens are bound
                with `inline`, so a light island inside the dark docs is just
                an attribute. See tokens.css. */}
            <div
              data-theme={theme}
              dir={rtl ? 'rtl' : 'ltr'}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]"
              style={device.width ? { maxWidth: device.width } : undefined}
            >
              <Bar
                align={align}
                elevated={elevated}
                bordered={bordered}
                fullBleed={fullBleed}
                sticky={false}
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-caption text-[var(--ds-fg-muted)]">
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
    <>
      <Bar align={align} elevated={elevated} bordered={bordered} fullBleed={fullBleed} sticky />
      {/* Something under the bar, so it is judged as the top of a screen
          rather than as a strip floating in an empty viewport. */}
      <div className="space-y-3 p-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-[var(--ds-layer-active)]"
            style={{ width: `${[92, 78, 88, 64, 84, 72][i % 6]}%` }}
          />
        ))}
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
    </>
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
  },
})
