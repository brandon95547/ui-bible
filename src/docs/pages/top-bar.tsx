import * as React from 'react'
import { Bell, ChevronDown, Command, Menu, Plus, Search } from 'lucide-react'
import { Button, IconButton } from '@/ui/Button'
import { Avatar, Badge, CountBadge, Kbd } from '@/ui/Display'
import { Breadcrumbs } from '@/ui/Navigation'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

function Bar({
  density = 'md',
  scrolled,
  mobile,
}: {
  density?: 'sm' | 'md'
  scrolled?: boolean
  mobile?: boolean
}) {
  return (
    <div
      className={`flex w-full items-center gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]/85 px-3 backdrop-blur-xl transition-shadow ${
        density === 'sm' ? 'h-12' : 'h-14'
      } ${scrolled ? 'shadow-e2' : ''}`}
    >
      {mobile && <IconButton label="Open navigation" icon={<Menu />} size="sm" />}

      <span className="flex items-center gap-2 pl-1">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--p-brand-400)] to-[var(--p-brand-700)] text-[10px] font-bold text-white"
        >
          A
        </span>
        {!mobile && (
          <button className="inline-flex items-center gap-1 text-label text-[var(--ds-fg)]">
            Acme
            <ChevronDown size={13} className="text-[var(--ds-fg-muted)]" />
          </button>
        )}
      </span>

      {!mobile && (
        <span className="ml-1 hidden md:block">
          <Breadcrumbs
            items={[
              { label: 'Production', href: '#/top-bar' },
              { label: 'api-gateway' },
            ]}
          />
        </span>
      )}

      <button
        type="button"
        className="ml-auto flex h-8 min-w-0 max-w-xs flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2.5 text-caption text-[var(--ds-fg-muted)] md:ml-4"
      >
        <Search size={13} className="shrink-0" />
        <span className="flex-1 truncate text-left">Search…</span>
        {!mobile && <Kbd>⌘K</Kbd>}
      </button>

      <span className="ml-auto flex items-center gap-1">
        {!mobile && (
          <Button size="sm" startIcon={<Plus />}>
            New
          </Button>
        )}
        <span className="relative">
          <IconButton label="Notifications" icon={<Bell />} size="sm" />
          <span className="pointer-events-none absolute -right-0.5 -top-0.5">
            <CountBadge count={3} tone="danger" />
          </span>
        </span>
        <button className="ml-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]">
          <Avatar name="Ada Lovelace" size="sm" />
        </button>
      </span>
    </div>
  )
}

function Playground() {
  const [density, setDensity] = React.useState<'sm' | 'md'>('md')
  const [scrolled, setScrolled] = React.useState(false)
  const [mobile, setMobile] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={140}
      padded={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Height">
            <KnobSelect value={density} onChange={setDensity} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={scrolled} onChange={setScrolled} label="Scrolled" />
          <KnobToggle checked={mobile} onChange={setMobile} label="Mobile" />
        </div>
      }
    >
      <div className="w-full">
        <Bar density={density} scrolled={scrolled} mobile={mobile} />
        <div className="h-24 bg-[var(--ds-canvas)]" />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'top-bar',
    title: 'Top Bar',
    group: 'Navigation',
    tagline:
      'The one region present on every screen. Everything in it is competing for the most valuable 56 pixels in the product, so almost nothing earns a slot.',
    keywords: ['app bar', 'header', 'masthead', 'toolbar', 'global nav', 'command bar'],
  },

  overview: {
    purpose:
      'The top bar is the app’s constant frame: identity, global search, the one universal create action, and the account. Because it appears on every screen, everything in it costs the user attention thousands of times a week — which is why the bar is defined by what it excludes.',
    whenToUse: [
      'Always, in an application shell. It is the anchor that makes navigation feel like one product.',
      'To hold global search or the command palette entry point.',
      'To hold the single most universal create action, if one genuinely exists.',
      'To hold account, notifications and workspace switching.',
    ],
    whenNotToUse: [
      {
        text: 'For page-specific actions.',
        instead: 'a page header inside the content area',
      },
      {
        text: 'As the primary navigation in an app with more than about five destinations.',
        instead: 'a Sidebar',
        to: '#/sidebar-nav',
      },
      {
        text: 'For a filter or a view switcher that belongs to one page.',
        instead: 'a toolbar above the content',
      },
      {
        text: 'To show a marketing banner or an upsell on every screen.',
        instead: 'a dismissible Alert on the relevant page',
        to: '#/alerts',
      },
    ],
    reasoning: (
      <>
        <p>
          56 pixels tall. That is enough for a 36px control with 10px of breathing room above and
          below, and it is the smallest height where a bar reads as a distinct region rather than as
          a border. Every extra pixel is taken from the content on every screen, forever.
        </p>
        <p>
          The bar has <strong>three zones</strong>: identity and location on the left, search in the
          middle, actions and account on the right. That arrangement follows the reading path — you
          see where you are, then what you can look for, then what you can do — and it is stable
          enough that users stop looking and start pointing.
        </p>
        <p>
          The bar is <strong>translucent with a backdrop blur</strong> and gains its shadow only
          once content has scrolled beneath it. A permanent shadow makes the bar look detached on a
          page that has not scrolled; adding it on scroll is what makes the layering legible exactly
          when it matters.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'zones',
        title: 'The three zones',
        description:
          'Left is identity and location, centre is search, right is action and account. Everything else is a candidate for removal.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <div className="w-full">
              <Bar />
              <div className="grid grid-cols-3 border-b border-[var(--ds-border-subtle)] text-center">
                {[
                  ['Left', 'Logo · workspace · breadcrumbs'],
                  ['Centre', 'Search · command palette'],
                  ['Right', 'Create · notifications · account'],
                ].map(([z, what]) => (
                  <div key={z} className="border-r border-[var(--ds-border-subtle)] p-3 last:border-0">
                    <p className="text-overline uppercase text-[var(--ds-fg-muted)]">{z}</p>
                    <p className="mt-1 text-caption text-[var(--ds-fg-secondary)]">{what}</p>
                  </div>
                ))}
              </div>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'scroll',
        title: 'Scroll behaviour',
        description:
          'The bar is sticky and translucent. It gains a shadow only once content passes beneath it — before that, the shadow has nothing to separate.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <ScrollDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'responsive',
        title: 'What survives on mobile',
        description:
          'The menu trigger appears, the workspace name and breadcrumbs collapse, the create button moves into a FAB or the drawer. Search stays — it is the one thing that always earns its place.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <Stack gap="md" className="w-full">
              <div>
                <p className="mb-1.5 px-3 text-overline uppercase text-[var(--ds-fg-muted)]">Desktop</p>
                <Bar />
              </div>
              <div className="mx-auto w-full max-w-[24rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
                <p className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-1.5 text-overline uppercase text-[var(--ds-fg-muted)]">
                  Mobile
                </p>
                <Bar mobile />
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <span className="text-caption text-[var(--ds-fg-muted)]">56px, translucent</span> },
      { label: 'Scrolled', note: 'Gains e2', render: <span className="block h-6 w-20 rounded-[var(--radius-sm)] border-b border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)] shadow-e2" /> },
      { label: 'Compact', note: '48px', render: <span className="block h-6 w-20 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)]" /> },
      { label: 'Search idle', render: <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2 text-caption text-[var(--ds-fg-muted)]"><Search size={12} /> Search</span> },
      { label: 'Search focused', render: <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-accent)] bg-[var(--ds-surface-inset)] px-2 text-caption shadow-[0_0_0_3px_var(--ds-accent-subtle)]"><Search size={12} /> Search</span> },
      { label: 'Notification', render: <span className="relative inline-flex"><IconButton label="Notifications" icon={<Bell />} size="sm" /><span className="absolute -right-0.5 -top-0.5"><CountBadge count={3} tone="danger" /></span></span> },
      { label: 'Account', render: <Avatar name="Ada Lovelace" size="sm" /> },
      { label: 'Environment', note: 'A hard-to-miss cue', render: <Badge tone="danger" size="sm" dot>Production</Badge> },
      { label: 'Mobile', render: <IconButton label="Menu" icon={<Menu />} size="sm" /> },
      { label: 'Command hint', render: <Kbd>⌘K</Kbd> },
      { label: 'Impersonating', render: <Badge tone="warning" size="sm" dot>Viewing as Ada</Badge> },
      { label: 'Offline', render: <Badge tone="neutral" size="sm" dot>Offline</Badge> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
        <Bar />
      </div>
    ),
    caption:
      'Left, centre and right zones in a 56px bar. Every control is 32px, leaving 12px of clearance above and below.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '56px (48px compact)',
        kind: 'size',
        note: 'A 32px control with 12px of clearance. 48px is available for dense internal tools; below that the bar stops reading as a region.',
      },
      {
        n: 2,
        label: 'Background',
        value: 'canvas at 85% + blur',
        kind: 'color',
        note: 'Translucent so content scrolling beneath is faintly visible, which is what makes the bar read as floating above the page rather than clipped to it.',
      },
      {
        n: 3,
        label: 'Control size',
        value: '32px (sm)',
        kind: 'size',
        note: 'One step below the default 36px. The bar is dense by nature and a row of full-size buttons makes it feel crowded.',
      },
      {
        n: 4,
        label: 'Search width',
        value: 'max 28rem, flexes',
        kind: 'size',
        note: 'Capped so it does not dominate on a wide monitor, and flexible so it does not crowd the actions on a narrow one.',
      },
      {
        n: 5,
        label: 'Scroll shadow',
        value: 'e0 → e2 on scroll',
        kind: 'motion',
        note: 'Toggled by an IntersectionObserver sentinel at the top of the scroll container, not by a scroll listener.',
      },
      {
        n: 6,
        label: 'Right gap',
        value: '4px between icon buttons',
        kind: 'space',
        note: 'Tight, because these are one group. The gap before the avatar is 8px, marking it as separate.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', usedFor: 'Bar background at 85% alpha' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Bottom edge' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Search field' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Search placeholder, icon buttons at rest' },
    { category: 'spacing', token: 'height', value: '56px / 48px', usedFor: 'Default and compact' },
    { category: 'spacing', token: 'padding-x', value: '12px', usedFor: 'Bar gutters' },
    { category: 'spacing', token: 'gap', value: '4px / 8px', usedFor: 'Within a group / between groups' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Applied once content scrolls beneath' },
    { category: 'motion', token: 'duration', value: '160ms', usedFor: 'Shadow transition on scroll' },
  ],

  sizes: [
    { name: 'Compact', height: '48px', padding: '0 12px', use: 'Dense internal tools where every pixel of content matters.' },
    { name: 'Default', height: '56px', padding: '0 12px', use: 'Applications. 32px controls with 12px of clearance.' },
    { name: 'Marketing', height: '64–72px', padding: '0 24px', use: 'Public pages, where the bar carries brand weight.' },
    { name: 'Search', maxWidth: '28rem', minWidth: '160px', use: 'Flexes between the two, capped so it never dominates.' },
    { name: 'Controls', height: '32px', touch: '44px (padded)', use: 'One step below the default button size.' },
  ],

  do: [
    {
      title: 'Keep it to one create action',
      why: 'A "New" button with a dropdown beats four separate create buttons. The bar is the most contested space in the product and every additional control makes the others harder to find.',
      render: (
        <Button size="sm" startIcon={<Plus />} endIcon={<ChevronDown />}>
          New
        </Button>
      ),
    },
    {
      title: 'Make search reachable by keyboard',
      why: '⌘K is now a universal convention. Showing the shortcut in the field teaches it to the users who do not know it yet, at zero cost.',
      render: (
        <span className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2.5 text-caption text-[var(--ds-fg-muted)]">
          <Search size={13} /> Search… <Kbd>⌘K</Kbd>
        </span>
      ),
    },
    {
      title: 'Signal a dangerous environment unmistakably',
      why: 'Production and staging must be distinguishable at a glance. A tinted badge in the bar prevents an entire category of expensive mistake.',
      render: (
        <Badge tone="danger" dot>
          Production
        </Badge>
      ),
    },
    {
      title: 'Add the shadow only once content scrolls under it',
      why: 'Before scrolling there is nothing to separate. A permanent shadow makes the bar look detached from a page it is actually attached to.',
      render: (
        <Stack gap="sm" className="w-full">
          <span className="block h-6 w-full rounded-[var(--radius-sm)] border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]" />
          <span className="block h-6 w-full rounded-[var(--radius-sm)] border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] shadow-e2" />
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not fill it with page actions',
      why: 'Actions that only apply to one page belong on that page. In the bar they are present everywhere and correct almost nowhere.',
      render: (
        <div className="flex w-full items-center gap-1.5 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
          {['Export', 'Filter', 'Sort', 'Share', 'Duplicate', 'Archive'].map((a) => (
            <Button key={a} size="xs" variant="text">
              {a}
            </Button>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not hide the bar on scroll',
      why: 'Hide-on-scroll saves 56px and costs the user their anchor. It also makes the bar reappear unpredictably when they scroll up by a few pixels.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          scroll down → bar vanishes → user scrolls up to find it
        </span>
      ),
    },
    {
      title: 'Do not use it as primary navigation for a large app',
      why: 'Horizontal space runs out at about five items, and past that the labels truncate or collapse into an overflow menu nobody opens.',
      render: (
        <div className="flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2 text-caption text-[var(--ds-fg-muted)]">
          {['Dashboard', 'Projects', 'Deployments', 'Monitoring', 'Team', 'Billing', 'Settings'].map(
            (l) => (
              <span key={l} className="whitespace-nowrap">
                {l}
              </span>
            ),
          )}
        </div>
      ),
    },
    {
      title: 'Do not put an unlabelled icon row on the right',
      why: 'Five unlabelled glyphs is a quiz the user takes on every screen. Two or three universals plus the avatar is the ceiling.',
      render: (
        <div className="flex items-center gap-1">
          {[Bell, Search, Command, Plus, Menu].map((Icon, i) => (
            <IconButton key={i} label="?" icon={<Icon />} size="sm" />
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '2.4.5', name: 'Multiple Ways', level: 'AA' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
    ],
    contrast: [
      'The translucent background means text sits over whatever is scrolling beneath. The backdrop blur plus the 85% alpha keeps the effective contrast above 4.5:1, but verify it against your busiest page.',
      'The bottom border must reach 3:1 against both the bar and the content, or the region boundary disappears when the shadow is not present.',
      'An environment badge must not rely on colour alone — ours pairs the tone with a dot and the word "Production".',
    ],
    keyboard: [
      { keys: 'Skip link', does: 'The first focusable element on the page jumps past the bar to the main content.' },
      { keys: 'Tab', does: 'Moves left to right through the bar in DOM order.' },
      { keys: '⌘K / Ctrl K', does: 'Opens the command palette from anywhere.' },
      { keys: '/', does: 'Focuses search when the user is not already typing.' },
    ],
    aria: [
      { attr: '<header> + role="banner"', on: 'The bar', note: 'The banner landmark. There is exactly one per page.' },
      { attr: '<nav aria-label>', on: 'Nav inside the bar', note: 'Distinguishes it from the sidebar nav and the breadcrumbs.' },
      { attr: 'aria-label', on: 'Every icon button', note: 'Notifications, Account, Open navigation. An unlabelled icon announces as "button".' },
      { attr: 'aria-expanded', on: 'The workspace switcher', note: 'Plus aria-haspopup, on the trigger rather than the menu.' },
      { attr: 'aria-live="polite"', on: 'The notification count', note: 'So a change is announced without interrupting.' },
    ],
    focus:
      'The skip link is the first focusable element and must become visible on focus. Without it, every keyboard user tabs through the entire bar on every page.',
    screenReader: [
      'The banner landmark lets users jump straight to or past the bar. It is one of the highest-value landmarks on any page.',
      'The notification count needs a real accessible name — "3 unread notifications", not "3".',
      'Keep the bar’s DOM order identical on every page. WCAG 3.2.3 is about consistency, and inconsistent ordering breaks the muscle memory it exists to protect.',
    ],
    touch:
      'Controls are 32px visually and padded to 44px on coarse pointers. Keep the account avatar at the far right where the thumb naturally lands, and the menu trigger at the far left.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `<header
  role="banner"
  className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b
             border-line-subtle bg-canvas/85 px-3 backdrop-blur-xl"
>
  <a href="#main" className="sr-only-ds focus:not-sr-only">Skip to content</a>

  <WorkspaceSwitcher />
  <Breadcrumbs items={crumbs} className="hidden md:flex" />

  <button
    onClick={openPalette}
    className="ml-auto flex h-8 max-w-md flex-1 items-center gap-2 …"
  >
    <Search size={13} aria-hidden />
    <span className="flex-1 text-left">Search…</span>
    <Kbd>⌘K</Kbd>
  </button>

  <nav aria-label="Account" className="ml-auto flex items-center gap-1">
    <Button size="sm" startIcon={<Plus />}>New</Button>
    <IconButton label="Notifications" icon={<Bell />} size="sm" />
    <AccountMenu />
  </nav>
</header>

// Shadow on scroll — a sentinel, not a scroll listener
const sentinel = useRef<HTMLDivElement>(null)
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const el = sentinel.current
  if (!el) return
  const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
  io.observe(el)
  return () => io.disconnect()
}, [])

<div ref={sentinel} className="h-px" />   // directly under the bar`,
    },
    css: {
      lang: 'css',
      code: `.ds-topbar {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;                        /* the e2 band */
  display: flex;
  align-items: center;
  gap: 8px;
  block-size: 56px;
  padding-inline: 12px;
  border-block-end: 1px solid var(--ds-border-subtle);

  /* Translucent, so content scrolling beneath stays faintly visible.
     That is what makes the bar read as above the page. */
  background: color-mix(in oklab, var(--ds-canvas) 85%, transparent);
  backdrop-filter: blur(16px);

  transition: box-shadow 160ms var(--ease-standard);
}

/* Only once there is something to separate */
.ds-topbar[data-scrolled='true'] { box-shadow: var(--shadow-e2); }

/* Safe area on notched devices in landscape */
@supports (padding: max(0px)) {
  .ds-topbar {
    padding-inline-start: max(12px, env(safe-area-inset-left));
    padding-inline-end: max(12px, env(safe-area-inset-right));
  }
}

/* backdrop-filter is expensive. Drop it where it is not supported
   rather than shipping a transparent bar. */
@supports not (backdrop-filter: blur(1px)) {
  .ds-topbar { background: var(--ds-canvas); }
}

@media (max-width: 768px) {
  .ds-topbar__breadcrumbs,
  .ds-topbar__workspace-name { display: none; }
}`,
    },
  },

  notes: {
    tips: [
      'The bar is the best place to teach keyboard shortcuts. A visible ⌘K in the search field converts more users to the palette than any onboarding tour.',
      'Workspace and environment switchers belong on the left, next to the logo. Users read the bar left to right and expect scope before content.',
      'If you must show an announcement banner, put it above the bar rather than inside it, and make it dismissible. Inside, it deforms the layout on every page.',
      'On a page with its own header, keep the top bar minimal — two headers of similar weight makes it unclear which one owns the page.',
    ],
    performance: [
      'backdrop-filter forces a separate compositing layer and re-composites on every scroll frame. It is worth it for one 56px bar and nowhere else.',
      'Use an IntersectionObserver sentinel rather than a scroll listener for the shadow. A scroll handler running on every frame is a common source of jank.',
      'The bar renders on every route. Memoise it and keep its state out of the route tree, or every navigation re-renders it needlessly.',
      'Lazy-load the command palette. It is behind a keystroke, not on the critical path.',
    ],
    mistakes: [
      'No skip link, so every keyboard user tabs through the whole bar on every page.',
      'Hiding the bar on scroll, removing the user’s anchor to save 56 pixels.',
      'Unlabelled icon buttons, which announce as "button" and are a guess for sighted users too.',
      'Page-specific actions in a global region, so they are present everywhere and correct nowhere.',
      'Forgetting the safe-area inset, so on a notched phone in landscape the leftmost control is under the notch.',
    ],
    realWorld: [
      'Audit the bar quarterly. It accumulates: every team wants a slot, and nothing is ever removed unless someone makes a point of removing it.',
      'Environment colouring in the top bar is the cheapest possible protection against running a destructive command in the wrong place. Every infrastructure product should have it.',
      'Track what users click in the bar. Anything under 1% either needs a better label or belongs in the command palette instead.',
      'Keep the bar identical across the product, including the marketing site if you can. The moment it changes between areas, users stop trusting its position.',
    ],
  },
})

function ScrollDemo() {
  const [scrolled, setScrolled] = React.useState(false)
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
      <div className="sticky top-0 z-10">
        <Bar scrolled={scrolled} />
      </div>
      <div
        className="h-40 overflow-y-auto bg-[var(--ds-canvas)] p-4"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
      >
        <Stack gap="sm">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 text-caption text-[var(--ds-fg-muted)]"
            >
              Row {i + 1} — scroll to see the bar gain its shadow
            </div>
          ))}
        </Stack>
      </div>
    </div>
  )
}
