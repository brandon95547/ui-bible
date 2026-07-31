import * as React from 'react'
import {
  Archive,
  Bell,
  ChevronLeft,
  Home,
  RotateCw,
  Search,
  Trash2,
  User,
} from 'lucide-react'
import { BottomNav } from '@/ui/Navigation'
import { Badge } from '@/ui/Display'
import { Button } from '@/ui/Button'
import { Spinner } from '@/ui/Feedback'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   PHONE — every example on this page lives inside one.
   ======================================================================== */

function Phone({
  children,
  title,
  back,
  nav = true,
  safeArea = true,
  width = '15rem',
  height = '20rem',
}: {
  children: React.ReactNode
  title?: string
  back?: boolean
  nav?: boolean
  safeArea?: boolean
  width?: string
  height?: string
}) {
  const [tab, setTab] = React.useState('home')
  return (
    <div
      className="relative flex shrink-0 flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] shadow-e3"
      style={{ width, height }}
    >
      {title && (
        <header className="flex h-10 shrink-0 items-center gap-1.5 border-b border-[var(--ds-border-subtle)] px-2.5">
          {back && <ChevronLeft size={16} className="text-[var(--ds-fg-muted)]" />}
          <span className="truncate text-label text-[var(--ds-fg)]">{title}</span>
        </header>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {nav && (
        <BottomNav
          items={[
            { value: 'home', label: 'Home', icon: <Home size={17} /> },
            { value: 'search', label: 'Search', icon: <Search size={17} /> },
            { value: 'alerts', label: 'Alerts', icon: <Bell size={17} />, count: 2 },
            { value: 'you', label: 'You', icon: <User size={17} /> },
          ]}
          value={tab}
          onChange={setTab}
        />
      )}
      {/* The home indicator. It is not yours, and it is always there. */}
      {safeArea && (
        <div className="flex h-[18px] shrink-0 items-center justify-center bg-[var(--ds-surface)]">
          <span className="h-[3px] w-16 rounded-full bg-[var(--ds-border-strong)]" />
        </div>
      )}
    </div>
  )
}

const ITEMS = [
  'Deployment finished',
  'Billing webhook failed',
  'New comment from Grace',
  'Sprint 14 closed',
  'Invoice #4021 paid',
  'Backup completed',
]

function List({ dense }: { dense?: boolean }) {
  return (
    <ul className="flex flex-col">
      {ITEMS.map((t) => (
        <li
          key={t}
          className={`flex items-center border-b border-[var(--ds-border-subtle)] px-3 text-caption text-[var(--ds-fg)] ${
            dense ? 'h-8' : 'h-11'
          }`}
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

/* -- thumb zone ------------------------------------------------------------ */

function ThumbZone({ labels = true }: { labels?: boolean }) {
  return (
    <div className="relative h-[20rem] w-[11rem] shrink-0 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)]">
      <div className="absolute inset-x-0 top-0 h-[36%] bg-[var(--ds-danger-subtle)] p-2">
        {labels && (
          <span className="text-[10px] text-[var(--ds-danger-text)]">
            Hard to reach — needs a grip change
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 top-[36%] h-[28%] bg-[var(--ds-warning-subtle)] p-2">
        {labels && <span className="text-[10px] text-[var(--ds-warning-text)]">A stretch</span>}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[var(--ds-success-subtle)] p-2">
        {labels && (
          <span className="text-[10px] text-[var(--ds-success-text)]">
            Comfortable — put the actions here
          </span>
        )}
      </div>
      {/* The arc a right thumb sweeps, anchored at the bottom-right. */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 176 320" aria-hidden>
        <path
          d="M 176 320 m -150 0 a 150 150 0 0 1 150 -150"
          fill="none"
          stroke="var(--ds-fg-muted)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
      </svg>
    </div>
  )
}

/* -- swipe actions --------------------------------------------------------- */

function SwipeRow() {
  const [x, setX] = React.useState(0)
  const start = React.useRef<number | null>(null)

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
      <div className="absolute inset-y-0 right-0 flex">
        <span className="flex w-16 items-center justify-center bg-[var(--ds-warning)] text-[var(--ds-fg-inverse)]">
          <Archive size={16} />
        </span>
        <span className="flex w-16 items-center justify-center bg-[var(--ds-danger)] text-white">
          <Trash2 size={16} />
        </span>
      </div>
      <div
        onPointerDown={(e) => {
          start.current = e.clientX
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (start.current === null) return
          setX(Math.max(-128, Math.min(0, e.clientX - start.current)))
        }}
        onPointerUp={() => {
          setX((v) => (v < -64 ? -128 : 0))
          start.current = null
        }}
        style={{ transform: `translateX(${x}px)` }}
        className="relative flex h-11 touch-pan-y items-center bg-[var(--ds-surface)] px-3 text-caption text-[var(--ds-fg)] transition-transform duration-150"
      >
        Billing webhook failed
      </div>
    </div>
  )
}

/* -- pull to refresh ------------------------------------------------------- */

function PullToRefresh() {
  const [pull, setPull] = React.useState(0)
  const [busy, setBusy] = React.useState(false)
  const start = React.useRef<number | null>(null)

  const release = () => {
    if (pull > 56 && !busy) {
      setBusy(true)
      window.setTimeout(() => setBusy(false), 1200)
    }
    setPull(0)
    start.current = null
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-center text-[var(--ds-fg-muted)]"
        style={{ height: Math.max(pull, busy ? 44 : 0) }}
      >
        {busy ? (
          <Spinner size={16} />
        ) : (
          <RotateCw
            size={16}
            style={{ transform: `rotate(${pull * 3}deg)`, opacity: Math.min(1, pull / 56) }}
          />
        )}
      </div>
      <div
        onPointerDown={(e) => {
          start.current = e.clientY
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (start.current === null) return
          setPull(Math.max(0, Math.min(96, e.clientY - start.current)))
        }}
        onPointerUp={release}
        style={{ transform: `translateY(${Math.max(pull, busy ? 44 : 0)}px)` }}
        className="h-full touch-pan-x bg-[var(--ds-canvas)] transition-transform duration-150"
      >
        <List />
      </div>
    </div>
  )
}

/* -- playground ------------------------------------------------------------ */

function Playground() {
  const [target, setTarget] = React.useState<'44' | '32' | '24'>('44')
  const [safeArea, setSafeArea] = React.useState(true)

  const px = Number(target)

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Target size">
            <KnobSelect value={target} onChange={setTarget} options={['44', '32', '24'] as const} />
          </Knob>
          <KnobToggle checked={safeArea} onChange={setSafeArea} label="Safe area" />
        </div>
      }
      code={`/* 44px is the floor, and the padding is part of the target */
.ds-touch-target {
  min-block-size: 44px;
  min-inline-size: 44px;
}

/* The system owns the bottom band. Add to it; never sit under it. */
.ds-bottom-bar {
  padding-block-end: env(safe-area-inset-bottom);
}`}
    >
      <Row gap="lg" align="start" className="justify-center">
        <Phone title="Alerts" nav safeArea={safeArea}>
          <ul className="flex flex-col p-2">
            {ITEMS.slice(0, 5).map((t) => (
              <li key={t}>
                <button
                  type="button"
                  className="flex w-full items-center rounded-[var(--radius-md)] px-2 text-left text-caption text-[var(--ds-fg)] hover:bg-[var(--ds-layer-hover)]"
                  style={{ minHeight: px }}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </Phone>
        <Stack gap="sm" className="max-w-[16rem]">
          <span className="text-label text-[var(--ds-fg)]">{px}px rows</span>
          <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            {px === 44
              ? 'The floor. A fingertip contact patch is roughly 8–10mm, and 44px is what covers it with room for the imprecision of a moving hand.'
              : px === 32
                ? 'Fits more, misses more. This is the size a desktop layout produces when it is shipped to a phone unchanged.'
                : 'Below any usable threshold. Every tap here is a gamble, and the errors land on whichever neighbour is closest.'}
          </p>
          <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            {safeArea
              ? 'Safe area respected: the bar sits above the home indicator.'
              : 'Safe area ignored: the bottom row now shares space with the system swipe that closes the app.'}
          </p>
        </Stack>
      </Row>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'mobile-patterns',
    title: 'Mobile Patterns',
    group: 'Patterns',
    tagline:
      'One hand, one thumb, an unreliable network and a screen the system partly owns. Every mobile rule follows from those four facts.',
    keywords: [
      'touch',
      'gesture',
      'swipe',
      'thumb zone',
      'safe area',
      'responsive',
      'pull to refresh',
      'target size',
      'notch',
      'offline',
    ],
  },

  overview: {
    purpose:
      'Mobile is not a narrow desktop. The pointer is a fingertip with no hover, the screen is partly claimed by the operating system, the user has one hand and half their attention, and the network may vanish mid-tap. This page covers the patterns that follow from those constraints.',
    whenToUse: [
      'Any interface that will be used on a phone — which, for most products, is most of the traffic.',
      'Deciding where an action goes, how big it has to be, and whether a gesture is appropriate.',
      'Adapting a desktop layout: master–detail, tables, hover actions and dense lists all need a specific answer here.',
      'Anywhere the operating system has a claim on the screen — the notch, the home indicator, the keyboard.',
    ],
    whenNotToUse: [
      {
        text: 'The product is used at a desk, on a large screen.',
        instead: 'Desktop Patterns — hover, keyboard and two panes at once',
        to: '#/desktop-patterns',
      },
      {
        text: 'You need one component’s specification.',
        instead: 'that component’s page — Bottom Navigation, Bottom Sheet, Buttons',
        to: '#/bottom-navigation',
      },
      {
        text: 'The screen is a tablet in a stand with a keyboard.',
        instead: 'the desktop patterns. Tablets take whichever set matches how they are actually held',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The thumb is the whole argument.</strong> Held one-handed, a thumb sweeps an arc
          from the bottom corner. The bottom third of the screen is comfortable, the middle is a
          stretch, and the top corners need a grip change — a real risk of dropping the phone. So
          navigation and primary actions go to the bottom, and destructive actions go where the
          thumb does <em>not</em> naturally rest.
        </p>
        <p>
          <strong>44px is not a style preference.</strong> A fingertip contact patch is roughly
          8–10mm across and the hand is usually moving. 44px covers that with margin; 32px is what a
          desktop layout produces when nobody adapted it, and the mis-taps land on whichever
          neighbour is nearest. The padding counts toward the target — the visible mark can be
          small as long as the hit area is not.
        </p>
        <p>
          <strong>Gestures are accelerators with no discoverability.</strong> Swipe-to-delete is
          excellent for the people who know it exists and invisible to everyone else. Every gesture
          needs a visible equivalent, and the ones the system already owns — edge swipes for back
          and home — cannot be taken. WCAG 2.5.1 says the same thing in more formal language.
        </p>
        <p>
          <strong>Part of the screen is not yours.</strong> The notch, the status bar and the home
          indicator belong to the operating system, and their sizes change per device.{' '}
          <code>env(safe-area-inset-*)</code> is the only correct answer; a hardcoded 34px is a
          guess that is wrong on the next handset.
        </p>
        <p>
          <strong>Assume the network will fail mid-action.</strong> Phones move through tunnels and
          lifts. Optimistic updates, queued writes and a plain "no connection" state are not
          polish — on mobile they are the difference between an app that works and one that appears
          to lose data.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'thumb',
        title: 'The thumb zone',
        description:
          'The arc a right thumb sweeps from the bottom corner. Everything a user does often belongs inside it; anything destructive belongs outside it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="justify-center">
              <ThumbZone />
              <Stack gap="sm" className="max-w-[15rem]">
                <span className="text-label text-[var(--ds-fg)]">Consequences</span>
                {[
                  'Navigation goes to the bottom, not the top.',
                  'The primary action is full-width at the bottom of a form.',
                  'Back lives at the top-left because the system put it there — and an edge swipe does the same job in the comfortable zone.',
                  'Destructive actions go where the thumb does not rest by accident.',
                ].map((t) => (
                  <p key={t} className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                    {t}
                  </p>
                ))}
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'swipe',
        title: 'Swipe actions',
        description:
          'Drag the row left. It is fast for people who know it, invisible to everyone else — so the same two actions must also exist somewhere visible.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="mx-auto max-w-[22rem]">
              <SwipeRow />
              <p className="text-caption text-[var(--ds-fg-muted)]">
                Note what it does <em>not</em> do: it never swipes from the screen edge, because
                that gesture belongs to the system’s back navigation.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'pull',
        title: 'Pull to refresh',
        description:
          'Drag the list down. The indicator tracks the finger, so the gesture explains itself before it commits — and it still needs a visible refresh control elsewhere.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Phone title="Activity" nav={false}>
              <PullToRefresh />
            </Phone>
          </PreviewStage>
        ),
      },
      {
        id: 'safe-area',
        title: 'Safe areas',
        description:
          'The home indicator owns the bottom band on a gesture-navigation phone. A bar that ignores it puts its targets under the swipe that closes the app.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="justify-center">
              <Stack gap="xs" className="items-center">
                <Phone title="Respected" safeArea>
                  <List />
                </Phone>
                <span className="text-caption text-[var(--ds-success-text)]">
                  padding-block-end: env(…)
                </span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <Phone title="Ignored" safeArea={false}>
                  <List />
                </Phone>
                <span className="text-caption text-[var(--ds-danger-text)]">
                  bar under the home indicator
                </span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'adapting',
        title: 'Adapting desktop layouts',
        description:
          'Master–detail becomes list-then-page with a back control. Two squeezed columns serve neither.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="justify-center">
              <Stack gap="xs" className="items-center">
                <Phone title="Alerts">
                  <List />
                </Phone>
                <span className="text-caption text-[var(--ds-fg-muted)]">List</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <Phone title="Billing webhook" back>
                  <div className="p-3">
                    <Stack gap="sm">
                      <Badge tone="danger" variant="subtle" dot>
                        Failed
                      </Badge>
                      <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                        Three delivery attempts failed with a 500 from the endpoint. The next retry
                        is in eleven minutes.
                      </p>
                      <Button fullWidth size="lg">
                        Retry now
                      </Button>
                    </Stack>
                  </div>
                </Phone>
                <span className="text-caption text-[var(--ds-fg-muted)]">Then page</span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: '44px target',
        render: (
          <span className="flex h-11 w-24 items-center justify-center rounded-[var(--radius-md)] border border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)] text-caption text-[var(--ds-fg)]">
            44px
          </span>
        ),
      },
      {
        label: '32px target',
        render: (
          <span className="flex h-8 w-24 items-center justify-center rounded-[var(--radius-md)] border border-[var(--ds-warning-border)] bg-[var(--ds-warning-subtle)] text-caption text-[var(--ds-fg)]">
            32px
          </span>
        ),
      },
      {
        label: '24px target',
        render: (
          <span className="flex h-6 w-24 items-center justify-center rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-caption text-[var(--ds-fg)]">
            24px
          </span>
        ),
      },
      {
        label: 'Pressed',
        render: (
          <span className="flex h-11 w-24 scale-[0.97] items-center justify-center rounded-[var(--radius-md)] bg-[var(--ds-accent)] text-caption text-[var(--ds-fg-on-accent)]">
            Retry
          </span>
        ),
      },
      {
        label: 'Swiped',
        render: (
          <span className="flex h-9 w-24 items-center justify-end rounded-[var(--radius-md)] bg-[var(--ds-danger)] pr-2 text-white">
            <Trash2 size={14} />
          </span>
        ),
      },
      {
        label: 'Refreshing',
        render: <Spinner size={16} />,
      },
      {
        label: 'Offline',
        render: (
          <Badge tone="warning" variant="subtle" dot>
            No connection
          </Badge>
        ),
      },
      {
        label: 'Safe area',
        render: (
          <span className="flex h-4 w-24 items-center justify-center rounded-full bg-[var(--ds-surface-inset)]">
            <span className="h-[3px] w-12 rounded-full bg-[var(--ds-border-strong)]" />
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="start" className="justify-center">
        <Phone title="Alerts">
          <List />
        </Phone>
        <ThumbZone labels={false} />
      </Row>
    ),
    caption:
      'A phone screen and the zones it is really divided into. The layout on the left only works because it agrees with the map on the right.',
    parts: [
      {
        n: 1,
        label: 'Status bar / notch',
        value: 'env(safe-area-inset-top)',
        kind: 'space',
        note: 'The system’s. Content underneath it is clipped on some devices and hidden behind a camera on others. Never hardcode its height — it differs per handset.',
      },
      {
        n: 2,
        label: 'Top bar',
        value: '44–56px',
        kind: 'size',
        note: 'Title and at most two actions. It is in the hard-to-reach zone, which is why frequent actions do not live here — only Back does, because the system put it there.',
      },
      {
        n: 3,
        label: 'Content well',
        value: 'the scrolling region',
        kind: 'space',
        note: 'One scroll context. Nested scrolling areas on touch are near-impossible to control with a thumb and should be designed out.',
      },
      {
        n: 4,
        label: 'Row height',
        value: '44px minimum',
        kind: 'size',
        note: 'The floor for anything tappable. Padding counts toward it — the visible mark can be small provided the hit area is not.',
      },
      {
        n: 5,
        label: 'Thumb arc',
        value: 'bottom third',
        kind: 'shape',
        note: 'The comfortable zone for a one-handed grip. Everything used often belongs inside it; anything destructive belongs outside it.',
      },
      {
        n: 6,
        label: 'Bottom navigation',
        value: '56px + inset',
        kind: 'size',
        note: 'Three to five destinations, inside the arc, with labels. The inset is added below the bar, not absorbed into its height.',
      },
      {
        n: 7,
        label: 'Home indicator',
        value: 'env(safe-area-inset-bottom)',
        kind: 'space',
        note: 'Roughly 34px on a gesture-navigation phone, and it is not yours. A target here competes with the swipe that closes the app.',
      },
      {
        n: 8,
        label: 'Edge gutters',
        value: '16px',
        kind: 'space',
        note: 'Content clears the edge because a curved screen distorts the last few pixels — and because the hand wrapping the phone rests there.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'touch target', value: '44px', usedFor: 'The floor for anything tappable' },
    { category: 'spacing', token: 'safe-area-inset-top', value: 'env(…)', usedFor: 'Status bar and notch' },
    { category: 'spacing', token: 'safe-area-inset-bottom', value: 'env(…)', usedFor: 'Home indicator' },
    { category: 'spacing', token: 'edge gutter', value: '16px', usedFor: 'Content inset from the screen edge' },
    { category: 'spacing', token: 'row height', value: '44–56px', usedFor: 'List rows' },
    { category: 'spacing', token: 'bottom bar', value: '56px + inset', usedFor: 'Navigation' },
    { category: 'motion', token: 'duration', value: '200–260ms', usedFor: 'Page transitions' },
    { category: 'motion', token: 'gesture threshold', value: '64–110px', usedFor: 'Swipe and pull commit points' },
    { category: 'typography', token: '--text-body', value: '15px', usedFor: 'Body text. 16px on inputs, to stop iOS zooming' },
  ],

  sizes: [
    { name: 'Touch target', height: '44px', minWidth: '44px', touch: '44px', use: 'The floor. Padding counts.' },
    { name: 'Comfortable target', height: '48px', touch: '48px', use: 'Primary actions and anything used one-handed while walking.' },
    { name: 'List row', height: '44–56px', padding: '0 16px', use: 'Single or two-line rows.' },
    { name: 'Top bar', height: '44–56px', use: 'Plus the top safe-area inset.' },
    { name: 'Bottom nav', height: '56px', use: 'Plus the bottom safe-area inset.' },
    { name: 'Edge gutter', padding: '16px', use: 'Both sides. Never flush to a curved edge.' },
    { name: 'Input font size', type: '16px', use: 'Below 16px, iOS zooms the page on focus and does not zoom back.' },
    { name: 'Swipe threshold', minWidth: '64px', use: 'Past this, the action commits on release.' },
    { name: 'Pull threshold', height: '56px', use: 'Past this, the refresh fires on release.' },
  ],

  do: [
    {
      title: 'Put the primary action in the thumb arc',
      why: 'The bottom third is where a one-handed grip can reach without moving the phone. Everything used often belongs there; the top-right corner is the worst place on the screen.',
      render: <ThumbZone labels={false} />,
    },
    {
      title: 'Make the hit area bigger than the mark',
      why: 'A 16px icon can have a 44px target. Padding counts, so there is no conflict between a clean visual and a forgiving one.',
      render: (
        <span className="relative flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--ds-success-subtle)]">
          <Bell size={16} className="text-[var(--ds-fg)]" />
        </span>
      ),
    },
    {
      title: 'Use env() for every system inset',
      why: 'The notch and the home indicator differ per device and change between generations. A hardcoded 34px is right on one handset and wrong on the next.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          padding-block-end: max(1rem, env(safe-area-inset-bottom))
        </code>
      ),
    },
    {
      title: 'Give every gesture a visible twin',
      why: 'Swipe-to-archive is invisible until someone tries it. The same action must exist in a menu or a detail view, or a large share of users will never have it.',
      render: (
        <Row gap="sm">
          <Archive size={14} className="text-[var(--ds-fg-muted)]" />
          <span className="text-caption text-[var(--ds-fg-muted)]">swipe · and a real button</span>
        </Row>
      ),
    },
    {
      title: 'Set inputs to 16px',
      why: 'iOS zooms the whole page when a field smaller than 16px takes focus, and does not zoom back out. It is the single most common mobile form bug.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          input {'{'} font-size: 16px {'}'}
        </code>
      ),
    },
    {
      title: 'Design the offline state',
      why: 'Phones lose signal in lifts and tunnels mid-action. Queue the write, show what is pending, and never let a failure look like data quietly disappearing.',
      render: (
        <Badge tone="warning" variant="subtle" dot>
          Queued · will send when online
        </Badge>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put frequent actions in the top corners',
      why: 'Reaching the top-left of a large phone one-handed means shifting your grip, and dropping the phone is a real cost. Back lives there only because the system put it there.',
      render: (
        <span className="relative block h-20 w-12 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <span className="absolute right-1 top-1 h-4 w-4 rounded-[3px] bg-[var(--ds-danger-subtle)]" />
        </span>
      ),
    },
    {
      title: 'Do not take the system’s gestures',
      why: 'An edge swipe is back on both platforms and a bottom swipe is home. A carousel that starts at the screen edge is a carousel that navigates away instead.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          edge-swipe carousel → user leaves the app
        </span>
      ),
    },
    {
      title: 'Do not rely on hover',
      why: 'There is none. A tooltip, a hover preview or a reveal-on-hover row action simply does not exist on a phone, and the first tap will fire whatever is underneath.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          title="…" → never seen on touch
        </span>
      ),
    },
    {
      title: 'Do not shrink a desktop table',
      why: 'Six columns at 320px is unreadable and horizontally scrolling tables are painful with a thumb. Turn each row into a card carrying only the fields that matter.',
      render: (
        <span className="block w-24 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--ds-danger-border)]">
          {[0, 1, 2].map((r) => (
            <span key={r} className="flex gap-px border-b border-[var(--ds-border-subtle)]">
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <span key={c} className="h-3 flex-1 bg-[var(--ds-surface-inset)]" />
              ))}
            </span>
          ))}
        </span>
      ),
    },
    {
      title: 'Do not make a gesture the only way',
      why: 'WCAG 2.5.1: any path-based or multi-point gesture needs a single-pointer alternative. It is also plain sense — most users never discover a gesture nobody showed them.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          long-press-only delete → undiscoverable
        </span>
      ),
    },
    {
      title: 'Do not place a destructive action under the thumb',
      why: 'The comfortable zone is where accidental taps land. Delete belongs where the thumb has to travel deliberately, and it belongs behind an Undo.',
      render: (
        <span className="relative block h-20 w-12 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <span className="absolute inset-x-1 bottom-1 h-4 rounded-[3px] bg-[var(--ds-danger)]" />
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.4', name: 'Orientation', level: 'AA' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '2.5.1', name: 'Pointer Gestures', level: 'A' },
      { id: '2.5.2', name: 'Pointer Cancellation', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '1.4.4', name: 'Resize Text', level: 'AA' },
    ],
    contrast: [
      'Mobile screens get used outdoors. Contrast that passes indoors at 4.5:1 can be unreadable in sunlight, so treat the minimum as a minimum rather than a target.',
      'Do not lower contrast to fit more on screen. If it does not fit at readable contrast, it does not fit.',
      'Test with the display at low brightness and with a smudged screen. Both are the normal condition, not an edge case.',
    ],
    keyboard: [
      { keys: 'External keyboard', does: 'Phones and tablets support them. Every control still needs to be reachable and focusable.' },
      { keys: 'Switch control', does: 'Steps through focusable elements one at a time — which is why gesture-only actions exclude people entirely.' },
      { keys: 'Escape / Back', does: 'The system back gesture must dismiss the topmost layer, exactly as Escape does on desktop.' },
    ],
    aria: [
      {
        attr: 'Target size',
        on: 'Every control',
        note: 'WCAG 2.5.8 sets 24px as the AA floor; 44px is the practical one. The spacing exception only helps if the neighbours are genuinely far enough away.',
      },
      {
        attr: 'Pointer cancellation',
        on: 'Every button',
        note: 'WCAG 2.5.2: fire on pointer-up, not pointer-down, so a user can slide off a mis-aimed control to abort. Never act on touch-start.',
      },
      {
        attr: 'Gesture alternative',
        on: 'Swipe and long-press actions',
        note: 'WCAG 2.5.1 requires a single-pointer path to anything a gesture does. A visible button satisfies it.',
      },
      {
        attr: 'Orientation',
        on: 'The app',
        note: 'WCAG 1.3.4: do not lock to portrait. Someone with a mounted device may have no choice about how it is held.',
      },
      {
        attr: 'aria-live',
        on: 'Refresh and offline states',
        note: 'A spinner that means nothing to a screen reader needs "Refreshing" and "Updated" announced politely.',
      },
    ],
    focus:
      'The software keyboard covers up to half the screen. Scroll the focused field into the remaining space, and never let the keyboard hide the submit button — that is the single most common mobile form failure. Use dvh rather than vh so the layout tracks the visible viewport instead of an idealised one.',
    screenReader: [
      'VoiceOver and TalkBack take over the touch gestures entirely. Any custom gesture must have a real control behind it, or it does not exist under a screen reader.',
      'Announce refresh states. A spinner conveys nothing; "Refreshing" and then "Updated, 6 items" conveys the same thing the animation does for everyone else.',
      'Group list rows sensibly. A row read as six separate fragments is exhausting to move through at speed.',
      'Respect the system text size. A user at 200% text has told the operating system something important, and a layout that clips at that size is a reflow failure.',
    ],
    touch:
      'This entire page is the touch section. The short version: 44px targets, act on pointer-up, respect the safe areas, never require a gesture, keep frequent actions in the bottom third, and keep destructive ones out of it.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Adapt the container, not just the width. Master–detail becomes
// list-then-page — two squeezed columns serve neither side.
const isPhone = useMediaQuery('(max-width: 639px)')

return isPhone
  ? selected
    ? <DetailPage item={selected} onBack={() => setSelected(null)} />
    : <List onSelect={setSelected} />
  : <MasterDetail selected={selected} onSelect={setSelected} />

// Every gesture needs a visible twin. The swipe is the accelerator;
// the button is the interface.
<SwipeableRow
  onSwipeLeft={archive}
  actions={<IconButton label="Archive" icon={<Archive />} onClick={archive} />}
/>

// Act on pointer-up so a mis-aimed tap can be slid off and aborted.
// WCAG 2.5.2, and also just how people expect buttons to behave.
<button onPointerUp={submit}>Retry now</button>   // not onPointerDown

// The keyboard covers up to half the screen. dvh tracks the visible
// viewport; vh is an idealised one the user may never actually have.
<div className="h-dvh">…</div>`,
    },
    css: {
      lang: 'css',
      code: `/* The floor. Padding counts toward it, so a 16px icon is fine. */
.ds-touch-target {
  min-block-size: 44px;
  min-inline-size: 44px;
  display: grid;
  place-items: center;
}

/* The system's bands are not yours, and their size differs per
   device. max() keeps a sensible minimum on handsets with no inset. */
.ds-screen {
  padding-block-start: env(safe-area-inset-top);
  padding-inline: max(16px, env(safe-area-inset-left));
}
.ds-bottom-bar {
  padding-block-end: max(12px, env(safe-area-inset-bottom));
}

/* Below 16px, iOS zooms on focus and never zooms back. */
input, select, textarea { font-size: 16px; }

/* Let the browser own the axis it needs; claim only the other one.
   touch-action: none on a scrollable region breaks scrolling. */
.ds-swipe-row  { touch-action: pan-y; }
.ds-pull-list  { touch-action: pan-x; }

/* dvh tracks the visible viewport as the address bar collapses and
   the keyboard opens. vh does not. */
.ds-app { block-size: 100dvh; }

/* Tap highlight is the platform's; ours is a real pressed state. */
.ds-button {
  -webkit-tap-highlight-color: transparent;
  transition: transform 90ms ease-out;
}
.ds-button:active { transform: scale(0.97); }

/* No hover on touch — so anything hidden behind it must come back. */
@media (hover: none) {
  .ds-row__actions { display: flex; }
}`,
    },
    api: [
      {
        name: 'Gesture contract',
        props: [
          { name: 'threshold', type: 'number', default: '64–110px', description: 'Travel before the action commits. Far enough that a scroll never triggers it by accident.' },
          { name: 'touchAction', type: "'pan-x' | 'pan-y'", required: true, description: 'Claim one axis and leave the browser the other. `none` on a scrollable region breaks scrolling.' },
          { name: 'alternative', type: 'ReactNode', required: true, description: 'The visible control that does the same thing. Not optional — WCAG 2.5.1.' },
          { name: 'onCancel', type: '() => void', description: 'Sliding back below the threshold must abort cleanly. Pointer cancellation, WCAG 2.5.2.' },
        ],
      },
      {
        name: 'Safe area',
        props: [
          { name: 'viewport-fit=cover', type: 'meta tag', required: true, description: 'Required before env(safe-area-inset-*) reports anything but zero.' },
          { name: 'env(safe-area-inset-top)', type: 'CSS', description: 'Status bar and notch. Differs per device — never hardcode it.' },
          { name: 'env(safe-area-inset-bottom)', type: 'CSS', description: 'Home indicator, roughly 34px on gesture-navigation phones.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Test one-handed on the largest phone you support. The top-left corner of a 6.7-inch screen is genuinely out of reach, and no amount of desk testing reveals that.',
      'Test with a thumb, not an index finger. Pointing at a screen you are holding flat is a completely different level of precision from how the device is actually used.',
      'Add viewport-fit=cover to the meta tag or env(safe-area-inset-*) reports zero everywhere and the layout looks fine right up until it ships.',
      'Prefer a bottom sheet to a dialog on every mobile surface. It arrives where the thumb is and leaves the same way.',
      'Undo beats confirm. A snackbar with Undo costs one tap when wrong; a confirmation dialog costs one tap every single time.',
      'Keep tap animations under about 100ms. Anything slower reads as lag rather than as feedback, and on touch the feedback is all the user has.',
    ],
    performance: [
      'Mobile CPUs are several times slower than the laptop you are testing on, and the network is worse. Budget accordingly rather than optimistically.',
      'Animate transform and opacity only. Anything else drops frames on a mid-range Android, which is the median device for most products.',
      'Virtualise long lists and keep images sized. Layout shift on a phone moves the thing someone was about to tap.',
      'Use passive scroll listeners. A non-passive touchmove handler blocks scrolling on the main thread and produces the classic sticky-scroll feel.',
      'Serve smaller images to smaller screens. A 2000px hero on a 390px phone is bandwidth spent on a device that has the least of it.',
      'Cache aggressively and render from cache first. On a slow connection, showing yesterday’s list instantly beats showing a spinner for four seconds.',
    ],
    mistakes: [
      'Targets under 44px, inherited straight from the desktop layout.',
      'Ignoring safe areas, so the last row sits under the home indicator.',
      'Gestures with no visible equivalent, invisible to most users and impossible under a screen reader.',
      'Hover-dependent interfaces, where the first tap fires the thing underneath.',
      'Inputs under 16px, causing iOS to zoom and never zoom back.',
      'vh instead of dvh, so the keyboard covers the submit button.',
      'Horizontally scrolling tables that a thumb cannot control.',
      'Destructive actions in the comfortable zone, where accidental taps land.',
      'Acting on pointer-down, so a mis-aimed tap cannot be aborted.',
    ],
    realWorld: [
      'Check the analytics before arguing about this. In most products mobile is the majority of sessions, and it is usually still designed second.',
      'The median device is a mid-range Android two or three years old, not the phone in your pocket. Test on one; the difference is not subtle.',
      'Every gesture you add is a feature for the people who find it and nothing at all for everyone else. Add them freely — just never as the only route.',
      'One-handed use while walking, in sunlight, on a bad connection is the real environment. Any of those alone breaks a design tested at a desk.',
      'The safe-area inset is the most commonly skipped rule on this page, and it is the one users notice immediately — a button they cannot press without closing the app.',
    ],
  },
})
