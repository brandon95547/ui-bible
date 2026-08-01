import * as React from 'react'
import { Bell, Home, Plus, Search, Settings, User } from 'lucide-react'
import { BottomNav } from '@/ui/Navigation'
import { Fab } from '@/ui/Button'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const ALL = [
  { value: 'home', label: 'Home', icon: <Home size={18} /> },
  { value: 'search', label: 'Search', icon: <Search size={18} /> },
  { value: 'alerts', label: 'Alerts', icon: <Bell size={18} />, count: 3 },
  { value: 'account', label: 'Account', icon: <User size={18} /> },
  { value: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

function Phone({
  count = 4,
  fab,
  labels = true,
}: {
  count?: number
  fab?: boolean
  labels?: boolean
}) {
  const [value, setValue] = React.useState('home')
  const items = ALL.slice(0, count).map((i) => ({
    ...i,
    label: labels ? i.label : '',
  }))

  return (
    <div className="relative mx-auto flex h-[19rem] w-[16rem] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] shadow-e3">
      <div className="flex h-11 shrink-0 items-center border-b border-[var(--ds-border-subtle)] px-4">
        <span className="text-label text-[var(--ds-fg)]">{ALL.find((i) => i.value === value)?.label}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <Stack gap="sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2.5 text-caption text-[var(--ds-fg-muted)]"
            >
              Item {i + 1}
            </div>
          ))}
        </Stack>
      </div>
      {fab && (
        <div className="pointer-events-none absolute bottom-[4.75rem] right-3">
          <Fab icon={<Plus />} label="New" size="sm" />
        </div>
      )}
      <BottomNav items={items} value={value} onChange={setValue} />
    </div>
  )
}

function Playground() {
  const [count, setCount] = React.useState<'3' | '4' | '5' | '6'>('4')
  const [fab, setFab] = React.useState(false)
  const [labels, setLabels] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Destinations">
            <KnobSelect value={count} onChange={setCount} options={['3', '4', '5', '6'] as const} />
          </Knob>
          <KnobToggle checked={labels} onChange={setLabels} label="Labels" />
          <KnobToggle checked={fab} onChange={setFab} label="FAB" />
        </div>
      }
      code={`<BottomNav
  items={[
    { value: 'home',   label: 'Home',   icon: <Home /> },
    { value: 'search', label: 'Search', icon: <Search /> },
    { value: 'alerts', label: 'Alerts', icon: <Bell />, count: 3 },
    { value: 'account',label: 'Account',icon: <User /> },
  ]}
  value={tab}
  onChange={setTab}
/>`}
    >
      <Phone count={Number(count)} fab={fab} labels={labels} />
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'bottom-navigation',
    title: 'Bottom Navigation',
    tagline:
      'Three to five destinations in the thumb zone. A sixth item drops each target below the width where thumbs stop being accurate.',
    keywords: ['tab bar', 'mobile nav', 'thumb zone', 'ios', 'android', 'bottom tabs'],
  },

  overview: {
    purpose:
      'Bottom navigation puts the top-level destinations of a mobile app permanently within thumb reach. It is the mobile equivalent of a sidebar: always visible, always in the same place, and learned by position rather than by label after the first few sessions.',
    whenToUse: [
      'A mobile or touch-first application with three to five top-level destinations.',
      'The destinations are peers with no hierarchy between them.',
      'Users switch between them frequently rather than moving through them once.',
      'Each destination has its own navigation stack that should be preserved.',
    ],
    whenNotToUse: [
      {
        text: 'There are more than five destinations.',
        instead: 'a Drawer, or a rethink of the information architecture',
        to: '#/drawer',
      },
      {
        text: 'The screen is a desktop browser.',
        instead: 'a Sidebar or a Top Bar',
        to: '#/sidebar',
      },
      {
        text: 'The items are views of one object rather than destinations.',
        instead: 'Tabs',
        to: '#/tabs',
      },
      {
        text: 'The app is a single-purpose tool with one screen.',
        instead: 'nothing — a bar with two items is a segmented control',
      },
    ],
    reasoning: (
      <>
        <p>
          The count limit is physical. On a 360px screen, five items give each one about 72px of
          width; six gives 60px, and below roughly 64px thumb accuracy drops off measurably. That is
          the whole argument — not aesthetics, not clutter, but the width of a thumb.
        </p>
        <p>
          <strong>Labels stay visible.</strong> An icon-only bottom bar turns recognition into
          recall on the surface where the user has the least patience and the least screen. The
          labels are 11px, which is small, but a small label that is always present beats a tooltip
          that touch cannot summon.
        </p>
        <p>
          The bar sits above the <strong>safe-area inset</strong>. On a gesture-navigation phone the
          bottom ~34px belongs to the system home indicator, and a bar that ignores it puts its
          targets underneath a swipe gesture that will dismiss the app instead.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'counts',
        title: 'Three, four, five',
        description:
          'Five is the ceiling. At six, each target is under 64px on a standard phone and mis-taps become common.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="flex w-full flex-wrap items-start justify-center gap-4">
              {[3, 4, 5].map((n) => (
                <div key={n} className="flex flex-col items-center gap-2">
                  <div className="w-[15rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
                    <BottomNav
                      items={ALL.slice(0, n)}
                      value="home"
                      onChange={() => {}}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">
                    {n} items · ~{Math.floor(360 / n)}px each
                  </span>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'with-fab',
        title: 'With a floating action button',
        description:
          'The FAB sits above the bar rather than inside it. Putting the create action in the bar makes it look like a destination, and it is not one.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Phone fab />
          </PreviewStage>
        ),
      },
      {
        id: 'thumb',
        title: 'The thumb zone',
        description:
          'On a phone held one-handed, the bottom third of the screen is comfortable, the middle is a stretch, and the top corners require a grip change. Navigation belongs at the bottom for the same reason.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <div className="relative h-[18rem] w-[11rem] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)]">
              <div className="absolute inset-x-0 top-0 h-[38%] bg-[var(--ds-danger-subtle)] p-2">
                <span className="text-[10px] text-[var(--ds-danger-text)]">Hard to reach</span>
              </div>
              <div className="absolute inset-x-0 top-[38%] h-[28%] bg-[var(--ds-warning-subtle)] p-2">
                <span className="text-[10px] text-[var(--ds-warning-text)]">A stretch</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[var(--ds-success-subtle)] p-2">
                <span className="text-[10px] text-[var(--ds-success-text)]">Comfortable</span>
              </div>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Active', render: <MiniItem active /> },
      { label: 'Inactive', render: <MiniItem /> },
      { label: 'With count', render: <MiniItem count /> },
      { label: 'Pressed', render: <MiniItem active className="scale-95" /> },
      { label: 'Focus', render: <MiniItem className="outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]" /> },
      { label: 'Three items', render: <div className="w-32 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"><BottomNav items={ALL.slice(0, 3)} value="home" onChange={() => {}} /></div> },
      { label: 'Five items', render: <div className="w-32 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"><BottomNav items={ALL} value="home" onChange={() => {}} /></div> },
      { label: 'Safe area', render: <span className="text-caption text-[var(--ds-fg-muted)]">+34px inset</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-[20rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
        <BottomNav items={ALL.slice(0, 4)} value="alerts" onChange={() => {}} />
      </div>
    ),
    caption:
      'Four destinations, one active. The active item gets a pill behind its icon plus a colour change plus a heavier label — three signals, so it survives greyscale.',
    parts: [
      {
        n: 1,
        label: 'Bar height',
        value: '56px + safe area',
        kind: 'size',
        note: 'The safe-area inset is added, not included. On a gesture-navigation phone that is another ~34px that belongs to the system.',
      },
      {
        n: 2,
        label: 'Item width',
        value: 'min 64px, flexes',
        kind: 'size',
        note: 'Below 64px thumb accuracy drops measurably. That is what caps the bar at five destinations.',
      },
      {
        n: 3,
        label: 'Icon',
        value: '18px in a 56 × 28 pill',
        kind: 'size',
        note: 'The pill appears only on the active item. It is wider than the icon so the highlight reads as a target rather than as a badge.',
      },
      {
        n: 4,
        label: 'Label',
        value: '11px, always visible',
        kind: 'type',
        note: 'Small, but present. An icon-only bar turns recognition into recall on the surface with the least patience.',
      },
      {
        n: 5,
        label: 'Count badge',
        value: 'Top-right of the icon',
        kind: 'shape',
        note: 'Overlapping the icon rather than beside the label, so it does not change the item width when the count appears.',
      },
      {
        n: 6,
        label: 'Background',
        value: 'surface at 85% + blur',
        kind: 'color',
        note: 'Translucent, so content scrolling underneath is faintly visible and the bar reads as floating above the list.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Bar background at 85% alpha' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Top edge' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Active pill' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Active icon and label' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Inactive items' },
    { category: 'spacing', token: 'height', value: '56px + inset', usedFor: 'Bar height' },
    { category: 'spacing', token: 'item min-width', value: '64px', usedFor: 'Thumb accuracy floor' },
    { category: 'spacing', token: 'gap', value: '4px', usedFor: 'Icon to label' },
    { category: 'typography', token: '--text-overline', value: '11px', usedFor: 'Labels' },
    { category: 'motion', token: 'duration', value: '140–180ms', usedFor: 'Pill and colour transition' },
  ],

  sizes: [
    { name: 'Three items', minWidth: '120px each', height: '56px', touch: '56px', use: 'Simple apps. Generous targets.' },
    { name: 'Four items', minWidth: '90px each', height: '56px', touch: '56px', use: 'The most common. Comfortable on any phone.' },
    { name: 'Five items', minWidth: '72px each', height: '56px', touch: '56px', use: 'The ceiling. Fine on a 360px screen, tight below it.' },
    { name: 'Safe area', height: '+ env(safe-area-inset-bottom)', use: 'Added below the bar. Typically 34px on gesture-navigation phones.' },
    { name: 'FAB clearance', height: '16px above the bar', use: 'When a FAB is present, it floats above rather than sitting inside.' },
  ],

  do: [
    {
      title: 'Keep the labels',
      why: 'Eleven pixels is small, but it is always there. An icon-only bar makes the user remember what a glyph means on the device where they have the least attention.',
      render: (
        <div className="w-40 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <BottomNav items={ALL.slice(0, 3)} value="home" onChange={() => {}} />
        </div>
      ),
    },
    {
      title: 'Respect the safe-area inset',
      why: 'On a gesture-navigation phone the bottom band belongs to the system. A bar that ignores it puts its targets under a swipe that dismisses the app.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          padding-block-end: env(safe-area-inset-bottom)
        </code>
      ),
    },
    {
      title: 'Preserve each destination’s stack',
      why: 'Returning to a tab should return the user where they were, not to its root. This is the behaviour every native app has, and its absence is felt immediately.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Home › Project › Deploy → switch to Alerts → back to Home ›{' '}
          <span className="text-[var(--ds-success-text)]">Deploy</span>
        </span>
      ),
    },
    {
      title: 'Tap the active item to scroll to top',
      why: 'A convention borrowed from iOS that costs nothing and saves a long scroll. Users try it on every app; it should work on yours.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          active item tapped → scrollTo({'{'} top: 0, behavior: 'smooth' {'}'})
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not exceed five destinations',
      why: 'At six, each target is under 64px on a standard phone. Mis-taps rise, and the labels start truncating to two characters.',
      render: (
        <div className="w-40 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <BottomNav
            items={[...ALL, { value: 'more', label: 'More', icon: <Plus size={18} /> }]}
            value="home"
            onChange={() => {}}
          />
        </div>
      ),
    },
    {
      title: 'Do not put an action in the bar',
      why: 'The bar is destinations. A create button among them looks like a place to go, and tapping it produces a surface the back button cannot dismiss the way users expect.',
      render: (
        <div className="w-40 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <BottomNav
            items={[
              ALL[0],
              { value: 'new', label: 'New', icon: <Plus size={18} /> },
              ALL[3],
            ]}
            value="home"
            onChange={() => {}}
          />
        </div>
      ),
    },
    {
      title: 'Do not hide the bar on scroll',
      why: 'It saves 56px and costs the user their anchor. It also reappears unpredictably on a small upward scroll, which is worse than never hiding at all.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          scroll down → bar gone → user scrolls up to find it
        </span>
      ),
    },
    {
      title: 'Do not use it on desktop',
      why: 'A bar pinned to the bottom of a 1440px window is a long way from the content and a long way from the cursor. Desktop navigation belongs at the top or the side.',
      render: (
        <div className="w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <BottomNav items={ALL.slice(0, 4)} value="home" onChange={() => {}} />
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.8', name: 'Location', level: 'AAA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
    ],
    contrast: [
      'The active item must be distinguishable from the inactive ones by more than colour. Ours changes the fill, the icon colour and the label weight together.',
      'The inactive label at 11px must still reach 4.5:1. Small text has no contrast exemption.',
      'The top edge of the bar must reach 3:1 against the content, or the bar merges into the list behind it.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches each destination. Bottom navigation is usually touch, but it must still be keyboard reachable.' },
      { keys: 'Enter', does: 'Navigates.' },
      { keys: '↑ from content', does: 'Nothing special — the bar is in DOM order after the main content, which is correct.' },
    ],
    aria: [
      { attr: '<nav aria-label="Primary">', on: 'The bar', note: 'A named landmark, distinct from any other nav on the page.' },
      { attr: 'aria-current="page"', on: 'The active item', note: 'The only reliable way for a screen reader to convey which destination is active.' },
      { attr: 'aria-label', on: 'The count badge', note: '"3 unread alerts", not "3".' },
      { attr: 'DOM order', on: 'The bar', note: 'Render it after the main content so screen-reader users reach the content first.' },
    ],
    focus:
      'The focus ring is inset, because the bar sits at the very bottom edge of the viewport and an outset ring would be clipped by the screen.',
    screenReader: [
      'Announced as "Alerts, 3 unread alerts, link, current page". The count needs its own accessible name.',
      'Keep the bar after the main content in the DOM. Navigation before content means every screen starts with four links.',
      'Do not change the bar between screens. WCAG 3.2.3 is about consistency, and a bar that varies destroys the positional memory it exists to build.',
    ],
    touch:
      '56px tall plus the safe-area inset, with each item at least 64px wide. The whole item — icon, pill and label — is one target; never make only the icon tappable.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { BottomNav } from '@/ui/Navigation'

// Render AFTER the main content in the DOM
<main className="flex-1 overflow-y-auto pb-[calc(56px+env(safe-area-inset-bottom))]">
  {children}
</main>

<BottomNav
  items={[
    { value: 'home',    label: 'Home',    icon: <Home size={18} /> },
    { value: 'search',  label: 'Search',  icon: <Search size={18} /> },
    { value: 'alerts',  label: 'Alerts',  icon: <Bell size={18} />, count: unread },
    { value: 'account', label: 'Account', icon: <User size={18} /> },
  ]}
  value={tab}
  onChange={handleChange}
/>

// Preserve each destination's stack, and scroll to top on re-tap
function handleChange(next: string) {
  if (next === tab) {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  stacks.current[tab] = window.scrollY      // remember where we were
  setTab(next)
  requestAnimationFrame(() => window.scrollTo(0, stacks.current[next] ?? 0))
}

// Only render it where it belongs
const isMobile = useMediaQuery('(max-width: 767px)')
{isMobile ? <BottomNav … /> : <Sidebar … />}`,
    },
    css: {
      lang: 'css',
      code: `.ds-bottom-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  border-block-start: 1px solid var(--ds-border-subtle);

  /* Translucent so the list scrolling beneath stays faintly visible */
  background: color-mix(in oklab, var(--ds-surface) 85%, transparent);
  backdrop-filter: blur(16px);

  /* The inset is ADDED below the bar, not included in its height */
  padding-block-end: env(safe-area-inset-bottom);
}

.ds-bottom-nav__item {
  flex: 1;
  min-inline-size: 64px;             /* the thumb-accuracy floor */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-block: 8px;
  color: var(--ds-fg-muted);
}

/* Three signals at once, so the state survives greyscale */
.ds-bottom-nav__item[aria-current='page'] { color: var(--ds-accent-text); }
.ds-bottom-nav__item[aria-current='page'] .ds-bottom-nav__pill {
  background: var(--ds-accent-subtle);
}
.ds-bottom-nav__item[aria-current='page'] .ds-bottom-nav__label {
  font-weight: 600;
}

.ds-bottom-nav__pill {
  display: grid;
  place-items: center;
  inline-size: 56px;
  block-size: 28px;
  border-radius: 999px;
  transition: background-color 180ms var(--ease-emphasized);
}

/* Inset, because an outset ring at the screen edge is clipped */
.ds-bottom-nav__item:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: -2px;
}

/* Desktop navigation belongs at the top or the side */
@media (min-width: 768px) { .ds-bottom-nav { display: none; } }`,
    },
    api: [
      {
        name: 'BottomNav',
        props: [
          { name: 'items', type: '{ value, label, icon, count? }[]', required: true, description: 'Three to five. Never six.' },
          { name: 'value', type: 'string', required: true, description: 'The active destination.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fires on tap, including a tap on the already-active item.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Put the most-used destination first, on the left. It is where the thumb rests and where users look first.',
      'A badge on the bar should mean "something needs you", not "something happened". A permanent unread count on Alerts becomes invisible within a week.',
      'When a destination needs sub-navigation, use tabs inside it. Never a second bottom bar.',
      'Match the platform. iOS users expect a tap on the active tab to scroll to top; Android users expect the back button to return to the first destination.',
    ],
    performance: [
      'Keep all destination stacks mounted but only the active one visible if memory allows — remounting on every switch loses scroll position and refetches data.',
      'backdrop-filter on the bar re-composites on every scroll frame. It is worth it for one bar; do not add a second blurred surface.',
      'Prefetch the adjacent destinations on first render. Switching should be instant, and there are only ever four of them.',
    ],
    mistakes: [
      'Six or more destinations, dropping each target below the thumb-accuracy floor.',
      'Icon-only items, turning recognition into recall on the least forgiving surface.',
      'Ignoring the safe-area inset, putting targets under the home-indicator swipe.',
      'Rendering the bar before the main content in the DOM, so screen-reader users hear the navigation first on every screen.',
      'Hiding the bar on scroll, removing the anchor to save 56 pixels.',
    ],
    realWorld: [
      'If you cannot fit the product into five destinations, the problem is the information architecture. A "More" tab is a symptom, not a solution.',
      'Track taps per destination. A tab under 5% is usually a settings page that has been promoted beyond its usefulness.',
      'Test one-handed on the largest phone you support. The top-left corner of a 6.7-inch screen is genuinely unreachable, and that is what bottom navigation exists to avoid.',
      'Bottom navigation and a FAB together is the standard Material arrangement, but only when the create action is genuinely global. Otherwise the FAB belongs on the destination that owns it.',
    ],
  },
})

function MiniItem({
  active,
  count,
  className,
}: {
  active?: boolean
  count?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-flex flex-col items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 transition-transform ${
        active ? 'text-[var(--ds-accent-text)]' : 'text-[var(--ds-fg-muted)]'
      } ${className ?? ''}`}
    >
      <span className="relative">
        <span
          className={`grid h-6 w-12 place-items-center rounded-full ${
            active ? 'bg-[var(--ds-accent-subtle)]' : ''
          }`}
        >
          <Bell size={16} />
        </span>
        {count && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-[var(--ds-danger)] px-1 text-[9px] font-bold text-white">
            3
          </span>
        )}
      </span>
      <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>Alerts</span>
    </span>
  )
}
