import * as React from 'react'
import { ArrowLeft, Bell, CalendarDays, Menu, MoreVertical, Search } from 'lucide-react'
import { IconButton } from '@/ui/Button'
import { Avatar, CountBadge } from '@/ui/Display'
import { AppBar, type AppBarAlign, type AppBarSize } from '@/ui/Navigation'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

/* The two controls every example in this page uses, so the arrangements are
   compared on their arrangement and not on their contents. */
const back = <IconButton label="Back" icon={<ArrowLeft />} size="md" />
const drawer = <IconButton label="Open navigation" icon={<Menu />} size="md" />
const actions = (
  <>
    <IconButton label="Search" icon={<Search />} size="md" />
    <IconButton label="Calendar" icon={<CalendarDays />} size="md" />
  </>
)

/** A screen under the bar, so a bar is never judged floating in space. */
function Screen({ children, lines = 5 }: { children: React.ReactNode; lines?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      {children}
      <div className="space-y-2 p-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-[var(--ds-layer-active)]"
            style={{ width: `${[92, 78, 88, 64, 84, 72][i % 6]}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function Playground() {
  const [size, setSize] = React.useState<AppBarSize>('small')
  const [align, setAlign] = React.useState<AppBarAlign>('start')
  const [subtitle, setSubtitle] = React.useState(true)
  const [leading, setLeading] = React.useState(true)
  const [scrolled, setScrolled] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={220}
      padded={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['small', 'medium', 'large'] as const} />
          </Knob>
          <Knob label="Align">
            <KnobSelect value={align} onChange={setAlign} options={['start', 'center'] as const} />
          </Knob>
          <KnobToggle checked={subtitle} onChange={setSubtitle} label="Subtitle" />
          <KnobToggle checked={leading} onChange={setLeading} label="Leading" />
          <KnobToggle checked={scrolled} onChange={setScrolled} label="Scrolled" />
        </div>
      }
    >
      <div className="w-full">
        <Screen>
          <AppBar
            size={size}
            align={align}
            title="Headline"
            subtitle={subtitle ? 'Subtitle' : undefined}
            leading={leading ? back : undefined}
            actions={actions}
            scrolled={scrolled}
            sticky={false}
          />
        </Screen>
        {align === 'center' && size !== 'small' && (
          <p className="px-1 pt-2 text-caption text-[var(--ds-fg-muted)]">
            Centring applies to <code>small</code> only — in a two-row bar the title owns its own
            line, and centring it would break the left edge the rest of the screen aligns to.
          </p>
        )}
      </div>
    </PreviewStage>
  )
}

/* The search variant. When a screen's whole job is finding something, the
   search field takes the bar's place rather than sitting inside it. */
function SearchAppBar() {
  return (
    <header
      role="banner"
      className="flex h-16 w-full items-center gap-2 bg-[var(--ds-canvas)] px-1 pe-1.5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center">{drawer}</span>
      <button
        type="button"
        className="flex h-12 min-w-0 flex-1 items-center rounded-full bg-[var(--ds-surface-inset)] px-5 text-body-lg text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
      >
        <span className="truncate">Search</span>
      </button>
      <button className="ms-1 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]">
        <Avatar name="Ada Lovelace" size="sm" />
      </button>
    </header>
  )
}

/** Medium collapsing to small as the content scrolls under it. */
function CollapseDemo() {
  const [scrolled, setScrolled] = React.useState(false)
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
      <AppBar
        size={scrolled ? 'small' : 'medium'}
        title="Headline"
        subtitle="Subtitle"
        leading={back}
        actions={actions}
        scrolled={scrolled}
        sticky={false}
      />
      <div
        className="h-44 overflow-y-auto bg-[var(--ds-canvas)] p-4"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
      >
        <Stack gap="sm">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 text-caption text-[var(--ds-fg-muted)]"
            >
              Row {i + 1} — scroll to collapse the bar
            </div>
          ))}
        </Stack>
      </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'app-bar',
    title: 'App Bar',
    tagline:
      'The top of the screen: where you are, the way back, and the two or three things you can do here. Its height is a statement about the title, and nothing else belongs in it.',
    keywords: ['app bar', 'top app bar', 'header', 'masthead', 'toolbar', 'title bar', 'navigation bar'],
  },

  overview: {
    purpose:
      'The app bar names the screen and holds the way out of it. Everything else in it is competing for the most valuable 64 pixels in the product — pixels the user pays for on every screen, forever — which is why the bar is defined by what it excludes.',
    whenToUse: [
      'On every screen that has a name. The title is the answer to "where am I", and it is worth a row on its own.',
      'To hold the way back or the drawer trigger, at the far left, in the same place on every screen.',
      'To hold the two or three actions that apply to this whole screen.',
      'At medium or large, to give a section its heading — the first screen of a flow, a detail page, a document.',
    ],
    whenNotToUse: [
      {
        text: 'For actions that apply to a selection rather than the screen.',
        instead: 'a contextual action bar that replaces the app bar while the selection lasts',
      },
      {
        text: 'As the primary navigation between destinations.',
        instead: 'a Bottom Nav on phones, a Sidebar on desktop',
        to: '#/sidebar',
      },
      {
        text: 'For a filter row or a view switcher belonging to one screen.',
        instead: 'a toolbar directly above the content',
        to: '#/toolbar',
      },
      {
        text: 'To carry a banner, an upsell or a status message on every screen.',
        instead: 'a dismissible Alert on the screen it concerns',
        to: '#/banner',
      },
    ],
    reasoning: (
      <>
        <p>
          The bar comes in <strong>three heights, and the height is a decision about the title</strong>.
          At 64px the title shares a row with the icons, so it has to stay short and it reads as a
          label. At 112px it drops to its own line, where it reads as a heading. At 152px it is the
          content of the header rather than a caption on it. Start at 64 and go taller only when the
          title has earned it — every extra pixel is taken from the content on every screen.
        </p>
        <p>
          <strong>The title can be centred, but only in the one-row bar.</strong> A centred title is
          what tells a phone user this is a page rather than a document, and it is the arrangement
          they already know. It costs something real: a centred title is centred in the BAR, so it
          survives one leading and at most one trailing icon before it starts looking off-centre
          against a crowded right side. In the two-row bars the title owns its line and aligns to the
          same left edge as everything under it, which is why centring is not offered there.
        </p>
        <p>
          <strong>A subtitle is a qualifier, not a sentence.</strong> "12 unread", "Draft", the parent
          folder — the thing that tells you which Headline this is. If it needs a verb, it belongs in
          the content.
        </p>
        <p>
          On scroll the bar <strong>changes container colour rather than growing a shadow</strong>.
          Both separate the two planes; only one of them survives dark mode, a busy page and a
          screenshot without looking like a mistake. A tall bar can also collapse to the small one as
          the content comes up, which returns the pixels exactly when the user has shown they want
          content rather than context.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'arrangements',
        title: 'The four arrangements',
        description:
          'One component, four configurations. Centred title; title beside the back button; title under it at medium; the same at large. Everything else — the leading control, the actions, the subtitle — is the same in all four.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <Stack gap="lg" className="w-full">
              {(
                [
                  ['Small · centred', { size: 'small', align: 'center' }],
                  ['Small · start, with subtitle', { size: 'small', align: 'start', subtitle: 'Subtitle' }],
                  ['Medium', { size: 'medium', subtitle: 'Subtitle' }],
                  ['Large', { size: 'large', subtitle: 'Subtitle' }],
                ] as const
              ).map(([label, props], i) => (
                <div key={label}>
                  <p className="mb-1.5 flex items-center gap-2 px-1 text-overline uppercase text-[var(--ds-fg-muted)]">
                    <span className="grid h-4 w-4 place-items-center rounded-full border border-[var(--ds-border)] text-[10px]">
                      {i + 1}
                    </span>
                    {label}
                  </p>
                  <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
                    <AppBar
                      title="Headline"
                      leading={back}
                      actions={actions}
                      sticky={false}
                      {...props}
                    />
                  </div>
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'search',
        title: 'When the screen is search',
        description:
          'A search field does not go inside the app bar — at 64px there is no room for a field and a title that both mean something. On a screen whose job is finding, the field takes the bar’s place: drawer, field, account.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <Screen lines={4}>
              <SearchAppBar />
            </Screen>
          </PreviewStage>
        ),
      },
      {
        id: 'collapse',
        title: 'Collapsing on scroll',
        description:
          'A medium bar collapses to a small one once content passes under it, and the container colour changes with it. The title never disappears — it moves up into the row it shares with the icons.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <CollapseDemo />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Small', note: '64px', render: <span className="text-caption text-[var(--ds-fg-muted)]">title on the icon row</span> },
      { label: 'Medium', note: '112px', render: <span className="text-caption text-[var(--ds-fg-muted)]">title on its own line</span> },
      { label: 'Large', note: '152px', render: <span className="text-caption text-[var(--ds-fg-muted)]">title at display size</span> },
      { label: 'Centred', note: 'small only', render: <span className="block h-6 w-24 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] text-center text-[10px] leading-6 text-[var(--ds-fg-muted)]">Headline</span> },
      { label: 'With subtitle', render: <span className="flex flex-col leading-tight"><span className="text-label text-[var(--ds-fg)]">Headline</span><span className="text-caption text-[var(--ds-fg-secondary)]">Subtitle</span></span> },
      { label: 'At rest', render: <span className="block h-6 w-20 rounded-[var(--radius-sm)] bg-[var(--ds-canvas)] ring-1 ring-[var(--ds-border-subtle)]" /> },
      { label: 'Scrolled', note: 'container colour changes', render: <span className="block h-6 w-20 rounded-[var(--radius-sm)] bg-[var(--ds-surface-raised)] ring-1 ring-[var(--ds-border-subtle)]" /> },
      { label: 'Leading', render: <IconButton label="Back" icon={<ArrowLeft />} size="md" /> },
      { label: 'Drawer', render: <IconButton label="Open navigation" icon={<Menu />} size="md" /> },
      { label: 'Overflow', note: 'the third action, not the fourth', render: <IconButton label="More" icon={<MoreVertical />} size="md" /> },
      { label: 'Notification', render: <span className="relative inline-flex"><IconButton label="Notifications" icon={<Bell />} size="md" /><span className="absolute right-0 top-0"><CountBadge count={3} tone="danger" /></span></span> },
      { label: 'Account', render: <Avatar name="Ada Lovelace" size="sm" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
        <AppBar size="medium" title="Headline" subtitle="Subtitle" leading={back} actions={actions} sticky={false} />
      </div>
    ),
    caption:
      'The medium bar: a 64px icon row, then the title bottom-aligned in the remaining 48px. The small bar is the first row alone; the large bar is the same with 88px under it.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '64 / 112 / 152px',
        kind: 'size',
        note: 'One row; one row plus a title line; one row plus a display-size title line. Nothing between them — three heights are learnable, a slider of heights is not.',
      },
      {
        n: 2,
        label: 'Icon row',
        value: '64px',
        kind: 'size',
        note: 'The same first row in all three sizes, so the back button never moves when the size changes. That constancy is the whole reason the collapse animation is legible.',
      },
      {
        n: 3,
        label: 'Touch target',
        value: '48px',
        kind: 'size',
        note: 'The leading and trailing controls are 48px targets around a 24px glyph. This is the one region of the product where a user reaches without looking.',
      },
      {
        n: 4,
        label: 'Title',
        value: 'h3 / h2 / h1',
        kind: 'type',
        note: 'Grows with the bar: 19px on the icon row, 24px on its own line, 32px when the title is the point of the header. Always one line — it truncates rather than wrapping.',
      },
      {
        n: 5,
        label: 'Subtitle',
        value: 'body-sm, fg-secondary',
        kind: 'type',
        note: 'Half the weight of the title and directly under it. A qualifier — a count, a state, a parent — never a sentence.',
      },
      {
        n: 6,
        label: 'Title inset',
        value: '56px with a leading control',
        kind: 'space',
        note: 'The 48px target plus the 8px gutter. Without a leading control the title starts at 16px, and the two must not be mixed within one app.',
      },
      {
        n: 7,
        label: 'Container',
        value: 'canvas → surface-raised',
        kind: 'color',
        note: 'The scrolled state is a colour change, not a shadow. It reads the same in dark mode and does not add a plane to a flat design.',
      },
      {
        n: 8,
        label: 'Bottom padding',
        value: '16px under the title',
        kind: 'space',
        note: 'The title is bottom-aligned in the tall bars so it sits with the content it heads, rather than floating in the middle of the bar.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', usedFor: 'Container at rest' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Container once content scrolls beneath' },
    { category: 'color', token: '--ds-fg', usedFor: 'Title' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Subtitle' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Icon controls at rest' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'The search field, in the search variant' },
    { category: 'typography', token: '--text-h3', usedFor: 'Title, small' },
    { category: 'typography', token: '--text-h2', usedFor: 'Title, medium' },
    { category: 'typography', token: '--text-h1', usedFor: 'Title, large' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Subtitle' },
    { category: 'spacing', token: 'height', value: '64 / 112 / 152px', usedFor: 'small / medium / large' },
    { category: 'spacing', token: 'padding-inline', value: '4px (controls) / 16px (title)', usedFor: 'Gutters — the control padding makes up the rest' },
    { category: 'radius', token: '--radius-full', usedFor: 'Search field, avatar' },
    { category: 'motion', token: 'duration', value: '160ms', usedFor: 'Container colour and the collapse' },
  ],

  sizes: [
    { name: 'Small', height: '64px', type: 'h3 (19px)', touch: '48px', use: 'The default. The title shares the icon row, so keep it to two or three words.' },
    { name: 'Small · centred', height: '64px', type: 'h3 (19px)', use: 'Phone screens, and only with one leading and at most one trailing control.' },
    { name: 'Medium', height: '112px', type: 'h2 (24px)', use: 'When the title is a heading rather than a label — a detail screen, a document.' },
    { name: 'Large', height: '152px', type: 'h1 (32px)', use: 'The first screen of a section, where the title is the content of the header.' },
    { name: 'Search variant', height: '64px', minWidth: '160px', use: 'Replaces the bar on a screen whose primary job is finding something.' },
    { name: 'Controls', height: '48px', icon: '24px', touch: '48px', use: 'Leading and trailing. Full size, not the compact button — this row is reached without looking.' },
  ],

  do: [
    {
      title: 'Keep the leading control in the same place on every screen',
      why: 'Back is the most-used control in any app. Its value comes entirely from being where it was last time, which means it outranks anything else competing for the left edge.',
      render: <IconButton label="Back" icon={<ArrowLeft />} size="md" />,
    },
    {
      title: 'Let the title truncate, never wrap',
      why: 'A wrapping title changes the height of the bar, which moves everything on the screen. Truncation loses the end of a long name; wrapping loses the layout.',
      render: (
        <div className="w-48 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
          <p className="truncate text-h3 text-[var(--ds-fg)]">Quarterly revenue reconciliation</p>
        </div>
      ),
    },
    {
      title: 'Make the third action an overflow menu',
      why: 'Two glyphs are recognised; five are a quiz taken on every screen. Everything past the second goes behind one predictable button.',
      render: (
        <div className="flex items-center gap-0.5">
          <IconButton label="Search" icon={<Search />} size="md" />
          <IconButton label="Calendar" icon={<CalendarDays />} size="md" />
          <IconButton label="More" icon={<MoreVertical />} size="md" />
        </div>
      ),
    },
    {
      title: 'Collapse a tall bar instead of hiding it',
      why: 'Scrolling means the user wants content, and 152px of title is a lot to spend on context they have read. Collapsing to 64px returns most of it while keeping the title and the way back on screen.',
      render: (
        <Stack gap="sm" className="w-full">
          <span className="block h-8 w-full rounded-[var(--radius-sm)] bg-[var(--ds-canvas)] ring-1 ring-[var(--ds-border-subtle)]" />
          <span className="block h-4 w-full rounded-[var(--radius-sm)] bg-[var(--ds-surface-raised)] ring-1 ring-[var(--ds-border-subtle)]" />
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not centre a title with a crowded right side',
      why: 'A centred title is centred in the bar, not between the icons. With one leading and three trailing controls it is mathematically centred and visibly wrong, and users read that as a bug.',
      render: (
        <div className="w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <AppBar
            size="small"
            align="center"
            title="Headline"
            leading={back}
            actions={
              <>
                <IconButton label="Search" icon={<Search />} size="md" />
                <IconButton label="Calendar" icon={<CalendarDays />} size="md" />
                <IconButton label="Notifications" icon={<Bell />} size="md" />
                <IconButton label="More" icon={<MoreVertical />} size="md" />
              </>
            }
            sticky={false}
          />
        </div>
      ),
    },
    {
      title: 'Do not put a sentence in the subtitle',
      why: 'The subtitle is a qualifier at 13px. A sentence there is body content in a region that cannot wrap, so it truncates mid-thought on every phone.',
      render: (
        <div className="w-64 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
          <p className="text-h3 text-[var(--ds-fg)]">Headline</p>
          <p className="truncate text-body-sm text-[var(--ds-danger-text)]">
            This report was generated last night and includes all…
          </p>
        </div>
      ),
    },
    {
      title: 'Do not hide the bar on scroll',
      why: 'Hide-on-scroll saves 64px and costs the user their anchor and their way back. It also reappears unpredictably when they scroll up by a few pixels. Collapse instead.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          scroll down → bar vanishes → user scrolls up to find it
        </span>
      ),
    },
    {
      title: 'Do not mix arrangements within one app',
      why: 'Centred on one screen and start-aligned on the next makes the title look like it moved, and every screen change costs a re-read. Pick one and change size, not alignment.',
      render: (
        <Stack gap="sm" className="w-full">
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
            <AppBar size="small" align="center" title="Headline" leading={back} sticky={false} />
          </div>
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
            <AppBar size="small" title="Headline" leading={back} sticky={false} />
          </div>
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '2.5.5', name: 'Target Size', level: 'AAA' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
    ],
    contrast: [
      'The title carries the screen’s name and must reach 4.5:1 against the container in both the rest and the scrolled colour — they are different backgrounds, so check both.',
      'The subtitle is 13px, which is not large text: it needs the same 4.5:1, which is why it uses fg-secondary and not fg-muted.',
      'Icon glyphs need 3:1 as non-text content. A muted glyph on the scrolled container is the case that usually fails.',
    ],
    keyboard: [
      { keys: 'Skip link', does: 'The first focusable element on the page jumps past the bar to the main content.' },
      { keys: 'Tab', does: 'Leading control, then the title if it is a link, then the actions left to right.' },
      { keys: 'Enter / Space', does: 'Activates the focused control. The bar itself is never focusable.' },
      { keys: 'Escape', does: 'Closes the overflow menu and returns focus to the button that opened it.' },
    ],
    aria: [
      { attr: '<header role="banner">', on: 'The bar', note: 'The banner landmark, one per page, so a screen reader user can jump to or past it.' },
      { attr: '<h1>', on: 'The title', note: 'The bar names the screen, so its title is the page heading. If the content has its own h1, the bar’s title is an h2 or a plain span — never two h1s.' },
      { attr: 'aria-label', on: 'Every icon control', note: '"Back", "Open navigation", "More options". An unlabelled glyph announces as "button".' },
      { attr: 'aria-expanded + aria-haspopup', on: 'The overflow trigger', note: 'On the button, not on the menu.' },
      { attr: 'aria-live="polite"', on: 'A count in the bar', note: 'So a change is announced without interrupting what is being read.' },
    ],
    focus:
      'The skip link is the first focusable element and must become visible on focus — without it every keyboard user tabs the whole bar on every screen. Focus rings must clear the container: the controls sit at the very top of the viewport, so an outside ring is clipped unless the bar reserves for it.',
    screenReader: [
      'The title is the first thing announced on the screen. Make it the screen’s real name, not the app’s — "Invoices", not "Acme".',
      'A subtitle is read straight after the title, as one phrase. "Invoices, 12 unread" works; "Invoices, Updated 3 minutes ago by Ada" does not.',
      'Keep the bar’s DOM order identical on every screen. WCAG 3.2.3 is about consistency, and reordering breaks exactly the muscle memory the bar exists to build.',
    ],
    touch:
      'Leading and trailing controls are 48px targets around a 24px glyph, with at least 8px between them. The leading control sits in the top-left, which is the hardest place to reach one-handed — which is why back is also a system gesture, and why a tall bar must never rely on its icons alone.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Small, start-aligned. The default, and the one most screens want.
<AppBar
  title="Headline"
  leading={<IconButton label="Back" icon={<ArrowLeft />} onClick={goBack} />}
  actions={<IconButton label="Search" icon={<Search />} />}
/>

// Centred — small only, one leading and at most one trailing control.
<AppBar align="center" title="Headline" leading={backButton} actions={oneAction} />

// The title on its own line, with a qualifier under it.
<AppBar size="medium" title="Headline" subtitle="12 unread" leading={backButton} />

// Collapse on scroll: swap the size, the height transition does the rest.
const [scrolled, setScrolled] = useState(false)

<AppBar
  size={scrolled ? 'small' : 'large'}
  scrolled={scrolled}
  title="Headline"
  subtitle="Subtitle"
  leading={backButton}
  actions={actions}
/>

// The sentinel that drives it — not a scroll listener
const sentinel = useRef<HTMLDivElement>(null)
useEffect(() => {
  const el = sentinel.current
  if (!el) return
  const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
  io.observe(el)
  return () => io.disconnect()
}, [])

<div ref={sentinel} className="h-px" />   // directly under the bar`,
    },
    api: [
      {
        name: 'AppBar',
        props: [
          { name: 'title', type: 'ReactNode', required: true, description: 'The screen’s name. One line — it truncates rather than wrapping.' },
          { name: 'subtitle', type: 'ReactNode', description: 'A qualifier under the title: a count, a state, a parent. Never a sentence.' },
          { name: 'size', type: "'small' | 'medium' | 'large'", default: "'small'", description: '64px with the title on the icon row, 112px with it on its own line, 152px with it at display size.' },
          { name: 'align', type: "'start' | 'center'", default: "'start'", description: 'Centres the title. Applies to size="small" only; the taller bars always start-align.' },
          { name: 'leading', type: 'ReactNode', description: 'The back arrow or the drawer trigger, in a 48px target at the far left. Omit on a root screen with no drawer.' },
          { name: 'actions', type: 'ReactNode', description: 'Up to three trailing controls. The third one is the overflow menu, not a fourth glyph.' },
          { name: 'scrolled', type: 'boolean', default: 'false', description: 'Content has passed beneath the bar: the container colour changes. Drive it from an IntersectionObserver sentinel.' },
          { name: 'sticky', type: 'boolean', default: 'true', description: 'Sticks to the top of its scroll container at z-10.' },
          { name: 'className', type: 'string', description: 'Merged onto the container. For layout only — the bar owns its own height and colour.' },
        ],
      },
    ],
    css: {
      lang: 'css',
      code: `.ds-app-bar {
  position: sticky;
  inset-block-start: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  block-size: 64px;                    /* small */
  padding-inline: 4px 6px;             /* the controls' own padding makes the rest */

  /* The container colour IS the elevation. Material dropped the shadow here,
     and the colour change survives dark mode and a busy page better. */
  background: var(--ds-canvas);
  transition:
    background-color 160ms var(--ease-standard),
    block-size 160ms var(--ease-standard);
}
.ds-app-bar[data-scrolled='true'] { background: var(--ds-surface-raised); }

.ds-app-bar[data-size='medium'] { block-size: 112px; }
.ds-app-bar[data-size='large']  { block-size: 152px; }

/* The icon row is 64px in every size, so the back button never moves when
   the bar grows or collapses. */
.ds-app-bar__row { display: flex; align-items: center; gap: 4px; block-size: 64px; }
.ds-app-bar__control { inline-size: 48px; block-size: 48px; }

/* Title: on the row at small, on its own line — bottom-aligned — above it. */
.ds-app-bar__title { font: var(--text-h3); color: var(--ds-fg); }
.ds-app-bar[data-size='medium'] .ds-app-bar__title { font: var(--text-h2); }
.ds-app-bar[data-size='large']  .ds-app-bar__title { font: var(--text-h1); }
.ds-app-bar__subtitle { font: var(--text-body-sm); color: var(--ds-fg-secondary); }
.ds-app-bar__title,
.ds-app-bar__subtitle { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.ds-app-bar__headline { display: flex; flex: 1; align-items: flex-end; padding: 0 12px 16px; }

/* Centred: absolute, so an extra trailing icon moves the icons and never the
   title, and capped so it truncates before it can collide with either side. */
.ds-app-bar[data-align='center'] .ds-app-bar__title-block {
  position: absolute;
  inset-inline: 0;
  margin-inline: auto;
  max-inline-size: 60%;
  text-align: center;
  pointer-events: none;
}

/* Notched devices in landscape */
@supports (padding: max(0px)) {
  .ds-app-bar {
    padding-inline-start: max(4px, env(safe-area-inset-left));
    padding-inline-end: max(6px, env(safe-area-inset-right));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-app-bar { transition: background-color 160ms var(--ease-standard); }
}`,
    },
  },

  notes: {
    tips: [
      'Pick one alignment for the whole app and vary the size instead. Alignment is the thing users notice moving; size reads as emphasis.',
      'A large bar on the first screen of a section and a small bar everywhere inside it is the pattern that makes a hierarchy legible without a breadcrumb.',
      'If the title needs more than three words, the screen probably needs a shorter name — not a taller bar.',
      'On desktop the same component still works, but the actions migrate to the content area: a 1440px-wide bar with two glyphs on the right is mostly empty space.',
    ],
    performance: [
      'Drive the scrolled state from an IntersectionObserver sentinel, not a scroll handler. A handler on every frame is a common source of jank, and the bar is on every screen.',
      'Animate the height, not the layout inside it. Cross-fading the title between two positions costs a layout per frame and looks worse than moving it.',
      'The bar renders on every route. Memoise it and keep its state out of the route tree, or every navigation re-renders it.',
      'A translucent bar with a backdrop blur forces a compositing layer that re-composites on every scroll frame. The colour change costs nothing and reads as clearly.',
    ],
    mistakes: [
      'No skip link, so every keyboard user tabs through the bar on every screen.',
      'Two h1s — one in the bar and one in the content — which makes the heading outline meaningless.',
      'A centred title with three trailing icons, which is centred in the bar and visibly off-centre on the screen.',
      'Hiding the bar on scroll, removing the user’s anchor and their way back to save 64px.',
      'A subtitle that changes on every render (a relative timestamp), which a screen reader re-announces each time.',
    ],
    realWorld: [
      'Audit the bar quarterly. It accumulates: every team wants a glyph in it, and nothing leaves unless someone makes a point of removing it.',
      'Track what gets tapped. Anything under 1% belongs in the overflow menu, and the overflow menu is where you find out what the screen is really for.',
      'The title is the screen’s name in analytics, in the back stack, in search, and in the user’s head. Choose it once and use the same string everywhere.',
      'Test the collapse on a slow device before shipping it. A height animation that drops frames is more distracting than a bar that simply stays tall.',
    ],
  },
})
