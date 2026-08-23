import * as React from 'react'
import {
  AlignCenter, AlignLeft, AlignRight, Bell, Box, ChevronDown, HelpCircle, Menu, Monitor,
  Moon, RotateCcw, Settings, Smartphone, Sun, Tablet,
} from 'lucide-react'
import { Button, IconButton } from '@/ui/Button'
import { Avatar } from '@/ui/Display'
import { AppBar, type AppBarAlign } from '@/ui/Navigation'
import { Select } from '@/ui/Select'
import { Checkbox, Segmented } from '@/ui/Toggle'
import { defineDoc } from '../framework/kit'

/* ===========================================================================
   THE BASIC BAR

   One row, four slots, nothing else. Every knob in the playground changes an
   arrangement or a plane — none of them add a part — because the argument of
   this page is that the bar is defined by what it refuses to hold.
   ======================================================================== */

/** The mark. The one thing in the bar allowed to carry the accent. */
const logo = <Box size={22} className="text-[var(--ds-accent-text)]" />

/** Global utilities. Three is the desktop budget; a phone gets two. */
const utilities = (compact: boolean) => (
  <>
    <IconButton label="Help" icon={<HelpCircle />} size="md" />
    <IconButton label="Notifications" icon={<Bell />} size="md" />
    {!compact && <IconButton label="Settings" icon={<Settings />} size="md" />}
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
  elevated: true,
  bordered: false,
  fullBleed: false,
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

function Playground() {
  const [align, setAlign] = React.useState(DEFAULTS.align)
  const [theme, setTheme] = React.useState(DEFAULTS.theme)
  const [view, setView] = React.useState(DEFAULTS.view)
  const [elevated, setElevated] = React.useState(DEFAULTS.elevated)
  const [bordered, setBordered] = React.useState(DEFAULTS.bordered)
  const [fullBleed, setFullBleed] = React.useState(DEFAULTS.fullBleed)

  const reset = () => {
    setAlign(DEFAULTS.align)
    setTheme(DEFAULTS.theme)
    setView(DEFAULTS.view)
    setElevated(DEFAULTS.elevated)
    setBordered(DEFAULTS.bordered)
    setFullBleed(DEFAULTS.fullBleed)
  }

  const device = VIEWS.find((v) => v.id === view)!

  return (
    <div className="flex flex-col gap-8">
      {/* ---- The panel ------------------------------------------------- */}
      <div className="rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
        {/* The section above already says this is the live preview, so the
            panel is knobs and nothing else. */}
        <div className="flex flex-wrap items-start gap-x-8 gap-y-6 p-5">
          <Knob label="Title alignment">
            <Select
              aria-label="Title alignment"
              options={ALIGN_OPTIONS}
              value={align}
              onChange={(v) => setAlign(v as AppBarAlign)}
              className="w-[11.5rem]"
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
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

          <div className="ms-auto self-center">
            <Button variant="outlined" size="md" startIcon={<RotateCcw />} onClick={reset}>
              Reset
            </Button>
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
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]"
              style={device.width ? { maxWidth: device.width } : undefined}
            >
              <AppBar
                title="UI Bible"
                logo={logo}
                align={align}
                leading={<IconButton label="Open navigation" icon={<Menu />} size="md" />}
                actions={utilities(view === 'mobile')}
                account={<Account />}
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
          and sheds the third utility — the same reflow a phone gets, for the same reason.
        </p>
      </div>
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
  },
})
