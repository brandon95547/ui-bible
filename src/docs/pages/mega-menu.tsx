import * as React from 'react'
import {
  BarChart3,
  BookOpen,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  LifeBuoy,
  Lock,
  Radio,
  Users,
} from 'lucide-react'
import { MegaMenu, type MegaMenuGroup } from '@/ui/Navigation'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Knob, KnobSelect, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const ICON = { size: 15 }

const GROUPS: MegaMenuGroup[] = [
  {
    label: 'Products',
    columns: [
      {
        title: 'Compute',
        items: [
          { label: 'Containers', description: 'Run images anywhere', icon: <Boxes {...ICON} /> },
          { label: 'Functions', description: 'Per-request billing', icon: <Cpu {...ICON} /> },
          { label: 'Edge', description: '38 regions', icon: <Radio {...ICON} /> },
        ],
      },
      {
        title: 'Data',
        items: [
          { label: 'Postgres', description: 'Managed, with branching', icon: <Database {...ICON} /> },
          { label: 'Object storage', description: 'S3-compatible', icon: <Cloud {...ICON} /> },
          { label: 'Analytics', description: 'Columnar, sub-second', icon: <BarChart3 {...ICON} /> },
        ],
      },
      {
        title: 'Platform',
        items: [
          { label: 'Identity', description: 'SSO and SCIM', icon: <Lock {...ICON} /> },
          { label: 'Observability', description: 'Traces and logs', icon: <Radio {...ICON} /> },
        ],
      },
    ],
    featured: (
      <Stack gap="sm">
        <Badge tone="accent" variant="subtle">
          New
        </Badge>
        <span className="text-label text-[var(--ds-fg)]">Postgres branching</span>
        <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
          Fork a production database in about two seconds and throw it away when the pull request
          merges.
        </p>
        <Button size="sm" variant="outlined">
          Read the post
        </Button>
      </Stack>
    ),
  },
  {
    label: 'Solutions',
    columns: [
      {
        title: 'By team',
        items: [
          { label: 'Engineering', icon: <Code2 {...ICON} /> },
          { label: 'Data', icon: <Database {...ICON} /> },
          { label: 'Security', icon: <Lock {...ICON} /> },
        ],
      },
      {
        title: 'By size',
        items: [
          { label: 'Startups', icon: <Users {...ICON} /> },
          { label: 'Enterprise', icon: <Users {...ICON} /> },
        ],
      },
    ],
  },
  {
    label: 'Developers',
    columns: [
      {
        title: 'Learn',
        items: [
          { label: 'Documentation', description: 'Guides and reference', icon: <BookOpen {...ICON} /> },
          { label: 'Tutorials', description: 'Build something in an hour', icon: <GraduationCap {...ICON} /> },
        ],
      },
      {
        title: 'Build',
        items: [
          { label: 'API reference', icon: <Code2 {...ICON} /> },
          { label: 'SDKs', icon: <Boxes {...ICON} /> },
          { label: 'Support', icon: <LifeBuoy {...ICON} /> },
        ],
      },
    ],
  },
  { label: 'Pricing', columns: [] },
]

const NAVIGABLE = GROUPS.filter((g) => g.columns.length > 0)

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-visible rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      <div className="flex items-center gap-4 border-b border-[var(--ds-border-subtle)] px-4 py-2.5">
        <span className="text-label font-semibold text-[var(--ds-fg)]">Northwind</span>
        <div className="flex-1">{children}</div>
        <Row gap="sm">
          <Button size="sm" variant="text">
            Sign in
          </Button>
          <Button size="sm">Start free</Button>
        </Row>
      </div>
      <div className="flex flex-col gap-2 p-4 pb-6">
        {[80, 62, 45].map((w) => (
          <span
            key={w}
            className="h-4 rounded-[3px] bg-[var(--ds-surface-inset)]"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function Playground() {
  const [openDelay, setOpenDelay] = React.useState<'0' | '120' | '400'>('120')
  const [closeDelay, setCloseDelay] = React.useState<'0' | '240' | '700'>('240')

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Open delay">
            <KnobSelect
              value={openDelay}
              onChange={setOpenDelay}
              options={['0', '120', '400'] as const}
            />
          </Knob>
          <Knob label="Close delay">
            <KnobSelect
              value={closeDelay}
              onChange={setCloseDelay}
              options={['0', '240', '700'] as const}
            />
          </Knob>
        </div>
      }
      code={`<MegaMenu
  groups={groups}
  openDelay={${openDelay}}
  closeDelay={${closeDelay}}
/>`}
    >
      <Stack gap="md" className="w-full">
        <p className="text-caption text-[var(--ds-fg-muted)]">
          Sweep the pointer across the bar, then take the diagonal down to a link in the far column.
          At <code className="font-mono">0 / 0</code> the menu flickers on the way in and dies on the
          way out; at <code className="font-mono">400 / 700</code> it feels stuck. The default sits
          where neither happens.
        </p>
        <Chrome>
          <MegaMenu
            key={`${openDelay}-${closeDelay}`}
            groups={GROUPS}
            openDelay={Number(openDelay)}
            closeDelay={Number(closeDelay)}
          />
        </Chrome>
      </Stack>
    </PreviewStage>
  )
}

/** The path a pointer takes from a trigger to a link, and what it crosses. */
function DiagonalDiagram({ safe }: { safe?: boolean }) {
  return (
    <div className="relative h-[9rem] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      <div className="flex gap-1 border-b border-[var(--ds-border-subtle)] p-2">
        {['Products', 'Solutions', 'Developers'].map((l, i) => (
          <span
            key={l}
            className={`rounded-[var(--radius-sm)] px-2 py-1 text-[10px] ${
              i === 0
                ? 'bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]'
                : 'text-[var(--ds-fg-muted)]'
            }`}
          >
            {l}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-2 bottom-2 top-[3.1rem] rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e3" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 240 144"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M 28 20 L 190 96"
          fill="none"
          strokeWidth="2"
          strokeDasharray="4 3"
          stroke={
            safe ? 'var(--ds-success-text)' : 'var(--ds-danger-text)'
          }
        />
        <circle cx="28" cy="20" r="3.5" fill={safe ? 'var(--ds-success-text)' : 'var(--ds-danger-text)'} />
        <circle cx="190" cy="96" r="3.5" fill={safe ? 'var(--ds-success-text)' : 'var(--ds-danger-text)'} />
      </svg>
      <span
        className={`absolute bottom-1.5 left-2.5 text-[10px] ${
          safe ? 'text-[var(--ds-success-text)]' : 'text-[var(--ds-danger-text)]'
        }`}
      >
        {safe ? 'Grace period → panel survives' : 'Close on exit → panel dies mid-path'}
      </span>
    </div>
  )
}

function MiniBar({ open, label }: { open?: boolean; label?: string }) {
  return (
    <span className="relative block h-16 w-32 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]">
      <span className="flex gap-1 border-b border-[var(--ds-border-subtle)] p-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-2.5 w-6 rounded-[2px] ${
              open && i === 0 ? 'bg-[var(--ds-accent-subtle)]' : 'bg-[var(--ds-surface-inset)]'
            }`}
          />
        ))}
      </span>
      {open && (
        <span className="absolute inset-x-1 top-[1.4rem] bottom-1 rounded-[3px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e2" />
      )}
      {label && (
        <span className="absolute bottom-0.5 left-1.5 z-10 text-[9px] text-[var(--ds-fg-muted)]">
          {label}
        </span>
      )}
    </span>
  )
}

export default defineDoc({
  meta: {
    id: 'mega-menu',
    title: 'Mega Menu',
    group: 'Navigation',
    tagline:
      'A wide, multi-column panel that exposes a whole section of a deep site at once. The engineering is entirely in the timing.',
    keywords: [
      'dropdown menu',
      'navigation menu',
      'flyout',
      'hover intent',
      'diagonal problem',
      'marketing nav',
      'site navigation',
    ],
  },

  overview: {
    purpose:
      'A mega menu drops a wide panel beneath a top-level nav item and shows that section’s second and third level in labelled columns. It trades one large, scannable reveal for the three or four hops a nested dropdown would have cost.',
    whenToUse: [
      'A broad site — a catalogue, a marketing site, a documentation portal — with roughly 20 to 80 destinations under a handful of top-level headings.',
      'The destinations group into obvious, nameable categories. The column headings are what make the panel scannable rather than merely large.',
      'Users are choosing where to go, not performing a task. Discovery is the job.',
      'Showing breadth is itself valuable — a visitor who cannot see that you sell the thing they came for will leave.',
    ],
    whenNotToUse: [
      {
        text: 'It is an application rather than a site.',
        instead: 'a Sidebar — persistent, and it shows where you are as well as where you can go',
        to: '#/sidebar-nav',
      },
      {
        text: 'A section has fewer than about eight links.',
        instead: 'a plain dropdown menu. A three-item mega menu is a lot of panel for very little',
      },
      {
        text: 'The viewport is a phone.',
        instead: 'a Drawer with an accordion. There is no hover on touch, and no room for columns',
        to: '#/drawer',
      },
      {
        text: 'The panel would only repeat the links already on the page below it.',
        instead: 'nothing. Duplicated navigation splits attention and doubles the maintenance',
      },
      {
        text: 'The items are actions rather than destinations.',
        instead: 'a Popover with a menu',
      },
    ],
    reasoning: (
      <>
        <p>
          The usual objection is Hick's law — more visible choices, slower decisions. It does not
          apply cleanly here, because Hick's law describes an <em>undifferentiated</em> list.
          Sixty links in three labelled columns are not scanned as sixty items; the user reads three
          headings, discards two, and scans a dozen. Grouping is what converts a paralysing list
          into a fast one, and it is also what a mega menu is for. Remove the headings and the
          objection becomes correct.
        </p>
        <p>
          <strong>The diagonal problem is the real engineering.</strong> A user aims at the panel's
          far column and moves in a straight line to get there — a diagonal that leaves the trigger
          and crosses one or two siblings on the way. Close-on-exit kills the panel halfway. Open-on-
          contact opens the wrong one. The fix is two asymmetric delays: a short one before opening,
          a longer grace period before closing, and no delay at all when moving between triggers
          while a panel is already open, because that intent has already been proven.
        </p>
        <p>
          <strong>Hover is an enhancement, never the mechanism.</strong> Touch has no hover, and a
          keyboard has no pointer. Every trigger is a real button that opens on click and on Enter;
          the delays exist only to make the pointer path pleasant for the people who have one.
        </p>
        <p>
          <strong>A mega menu is a symptom worth reading.</strong> Needing one means the site has
          more destinations than a bar can hold. That is legitimate for a catalogue and a warning
          sign for a product — if an application needs sixty top-level links, the navigation is
          standing in for an information architecture that was never decided.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'diagonal',
        title: 'The diagonal problem',
        description:
          'The pointer leaves the trigger before it reaches the panel. Whether the menu survives that gap is decided entirely by the close delay.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Stack gap="sm">
                <DiagonalDiagram />
                <p className="text-caption text-[var(--ds-fg-muted)]">
                  Closing the instant the pointer leaves the trigger punishes the most natural path
                  there is — a straight line to the target.
                </p>
              </Stack>
              <Stack gap="sm">
                <DiagonalDiagram safe />
                <p className="text-caption text-[var(--ds-fg-muted)]">
                  A 240ms grace period covers the crossing. Entering the panel cancels the pending
                  close outright, so the timer never races a user who has arrived.
                </p>
              </Stack>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'featured',
        title: 'The featured slot',
        description:
          'One promoted item at the end of the row. It earns its place by being the thing you would otherwise buy an ad for — and it must never push the actual navigation below the fold.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Chrome>
              <MegaMenu groups={[GROUPS[0]]} />
            </Chrome>
          </PreviewStage>
        ),
      },
      {
        id: 'no-panel',
        title: 'Not every item needs a panel',
        description:
          'Pricing is one page. Giving it a panel for the sake of symmetry teaches users that the chevron means nothing.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="w-full">
              <Stack gap="xs" className="items-center">
                <MiniBar open label="has children" />
                <span className="text-caption text-[var(--ds-fg-muted)]">Chevron, panel</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <MiniBar label="one page" />
                <span className="text-caption text-[var(--ds-fg-muted)]">Plain link, no chevron</span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'mobile',
        title: 'On mobile it is not a mega menu',
        description:
          'No hover, no room for columns. The same information architecture becomes a drawer with one accordion section per top-level group.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <div className="w-[15rem] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)]">
              <div className="border-b border-[var(--ds-border-subtle)] px-3 py-2.5 text-label">
                Menu
              </div>
              {NAVIGABLE.map((g, i) => (
                <div key={g.label} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                  <div className="flex items-center justify-between px-3 py-2.5 text-label text-[var(--ds-fg)]">
                    {g.label}
                    <span className="text-[var(--ds-fg-muted)]">{i === 0 ? '−' : '+'}</span>
                  </div>
                  {i === 0 && (
                    <div className="flex flex-col gap-1 bg-[var(--ds-surface-inset)] px-3 pb-3 pt-1">
                      {g.columns[0].items.map((it) => (
                        <span key={it.label} className="text-caption text-[var(--ds-fg-secondary)]">
                          {it.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Closed', render: <MiniBar /> },
      { label: 'Open', render: <MiniBar open /> },
      { label: 'Opening', note: 'after 120ms', render: <MiniBar open /> },
      {
        label: 'Trigger hover',
        render: (
          <span className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 text-label text-[var(--ds-fg)]">
            Products <span className="text-[var(--ds-fg-muted)]">▾</span>
          </span>
        ),
      },
      {
        label: 'Trigger focus',
        render: (
          <span className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] px-3 text-label text-[var(--ds-fg)] outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]">
            Products <span className="text-[var(--ds-fg-muted)]">▾</span>
          </span>
        ),
      },
      {
        label: 'Expanded',
        note: 'chevron rotated',
        render: (
          <span className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 text-label text-[var(--ds-fg)]">
            Products <span className="text-[var(--ds-fg-muted)]">▴</span>
          </span>
        ),
      },
      {
        label: 'No children',
        render: (
          <span className="inline-flex h-9 items-center rounded-[var(--radius-md)] px-3 text-label text-[var(--ds-fg-secondary)]">
            Pricing
          </span>
        ),
      },
      {
        label: 'Touch',
        note: 'tap to open',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">no hover path</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-[38rem]">
        <Chrome>
          <MegaMenu groups={GROUPS} />
        </Chrome>
      </div>
    ),
    caption:
      'Hover “Products”. Four triggers, three labelled columns, and one featured slot — everything below the bar is one panel, not four stacked menus.',
    parts: [
      {
        n: 1,
        label: 'Trigger',
        value: '36px tall, 12px inline padding',
        kind: 'size',
        note: 'A real button, not a hover target. It opens on click and on Enter, which is the only reason the component works on touch and on a keyboard.',
      },
      {
        n: 2,
        label: 'Chevron',
        value: '13px, rotates 180°',
        kind: 'motion',
        note: 'Present only on triggers that actually have a panel. A chevron on a plain link teaches users the affordance means nothing.',
      },
      {
        n: 3,
        label: 'Open delay',
        value: '120ms',
        kind: 'motion',
        note: 'Long enough that a pointer crossing the bar on its way elsewhere never triggers a panel; short enough that a deliberate hover feels immediate. Zero when a panel is already open.',
      },
      {
        n: 4,
        label: 'Close delay',
        value: '240ms',
        kind: 'motion',
        note: 'The grace period that covers the diagonal from the trigger to the far column. Entering the panel cancels it outright.',
      },
      {
        n: 5,
        label: 'Panel offset',
        value: '6px below the bar',
        kind: 'space',
        note: 'Close enough to read as attached; far enough that the trigger’s focus ring is not clipped. The pointer crosses the gap faster than the close delay.',
      },
      {
        n: 6,
        label: 'Column',
        value: 'min 11rem, 32px gutter',
        kind: 'size',
        note: 'The gutter is wider than the row gap inside a column, so the eye reads down each column rather than across the panel.',
      },
      {
        n: 7,
        label: 'Column heading',
        value: '11px overline, muted',
        kind: 'type',
        note: 'This is the component. Headings are what turn sixty links into three decisions; without them the panel really is the wall of choice Hick’s law warns about.',
      },
      {
        n: 8,
        label: 'Item description',
        value: '12px, one line',
        kind: 'type',
        note: 'Optional, and it should stay optional. Descriptions on every item double the panel height and stop it being scannable.',
      },
      {
        n: 9,
        label: 'Featured slot',
        value: 'inset surface, 16px',
        kind: 'color',
        note: 'A different background so it reads as promotion rather than as another category. Last in the row, so it never delays the navigation it sits beside.',
      },
      {
        n: 10,
        label: 'Panel elevation',
        value: '--shadow-e4',
        kind: 'shape',
        note: 'Above the page, below a dialog. The panel is transient navigation, not a surface the user is meant to settle into.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel background' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Featured slot' },
    { category: 'color', token: '--ds-border', usedFor: 'Panel edge' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Active trigger and item hover' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Column headings and descriptions' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
    { category: 'radius', token: '--radius-xl', usedFor: 'Panel corners' },
    { category: 'spacing', token: 'padding', value: '20px', usedFor: 'Panel inset' },
    { category: 'spacing', token: 'column gap', value: '32px', usedFor: 'Between columns' },
    { category: 'typography', token: '--text-overline', value: '11px', usedFor: 'Column headings' },
    { category: 'motion', token: 'openDelay', value: '120ms', usedFor: 'Hover intent in' },
    { category: 'motion', token: 'closeDelay', value: '240ms', usedFor: 'Grace period out' },
  ],

  sizes: [
    {
      name: 'Trigger',
      height: '36px',
      padding: '0 12px',
      gap: '4px',
      use: 'Label plus chevron. Sits inside a 56–64px bar.',
    },
    {
      name: 'Panel',
      padding: '20px',
      radius: '--radius-xl',
      maxWidth: 'the content container',
      use: 'Full container width. Never wider than the bar it hangs from.',
    },
    { name: 'Column', minWidth: '11rem', gap: '32px', use: 'Two to four columns. Five is a wall.' },
    { name: 'Item', height: '32px', padding: '6px 8px', use: 'Label only.' },
    { name: 'Item with description', height: '48px', padding: '6px 8px', use: 'Two lines. Use sparingly.' },
    { name: 'Featured', minWidth: '13rem', padding: '16px', use: 'One promoted item, last in the row.' },
    { name: 'Panel height', height: 'max 70vh', use: 'Past this the panel needs a scrollbar, which is the point at which it has too much in it.' },
  ],

  do: [
    {
      title: 'Label every column',
      why: 'The headings are what make a large panel scannable. Three headings turn sixty links into three decisions and then a dozen; without them it is genuinely a wall.',
      render: (
        <Stack gap="xs">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Compute</span>
          <span className="text-caption text-[var(--ds-fg-secondary)]">Containers</span>
          <span className="text-caption text-[var(--ds-fg-secondary)]">Functions</span>
        </Stack>
      ),
    },
    {
      title: 'Open on click as well as hover',
      why: 'Touch has no hover and a keyboard has no pointer. Hover is the accelerator for people with a mouse; the button underneath is the actual mechanism.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          click · Enter · Space · hover
        </span>
      ),
    },
    {
      title: 'Keep the grace period asymmetric',
      why: 'Opening is a commitment and should cost a moment; closing is recoverable and should be forgiving. Equal delays make one of the two feel wrong.',
      render: (
        <span className="font-mono text-[11px] text-[var(--ds-fg-muted)]">
          in 120ms · out 240ms · switch 0ms
        </span>
      ),
    },
    {
      title: 'Switch panels instantly once one is open',
      why: 'The user has already proven intent by opening the first panel. Charging the open delay again for every sibling makes the whole bar feel sticky.',
      render: <MiniBar open label="slide along the bar" />,
    },
    {
      title: 'Give the chevron to items that have a panel',
      why: 'It is the only signal that a trigger holds more. Putting it on every item, including the ones that are just a link, makes it meaningless.',
      render: (
        <Row gap="sm">
          <span className="text-caption text-[var(--ds-fg)]">Products ▾</span>
          <span className="text-caption text-[var(--ds-fg-secondary)]">Pricing</span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not open on contact',
      why: 'A pointer travelling to the search box crosses the bar and detonates a panel over the page. It also makes the bar unusable for anyone who moves the mouse while reading.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          openDelay: 0 → panels flash at every pass
        </span>
      ),
    },
    {
      title: 'Do not close the moment the pointer leaves',
      why: 'The straight line from the trigger to the far column leaves the trigger almost immediately. Closing there punishes the most natural gesture a user can make.',
      render: <DiagonalDiagram />,
    },
    {
      title: 'Do not nest a menu inside the panel',
      why: 'A flyout off a mega menu compounds the diagonal problem in two directions at once and gives the keyboard a level it cannot reason about. If the section needs a third level, it needs a page.',
      render: (
        <span className="relative block h-16 w-32 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-canvas)]">
          <span className="absolute inset-x-1 top-4 bottom-1 rounded-[3px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]" />
          <span className="absolute right-1 top-8 h-6 w-16 rounded-[3px] border border-[var(--ds-border)] bg-[var(--ds-surface-raised)] shadow-e3" />
        </span>
      ),
    },
    {
      title: 'Do not put a form in it',
      why: 'A panel that vanishes on a 240ms timer is not a place to type. Search, sign-in and newsletter fields belong in the bar itself or on a page.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          email field inside a panel that closes on pointer-out
        </span>
      ),
    },
    {
      title: 'Do not exceed about five columns',
      why: 'Past five the panel spans the full width of a desktop monitor and the eye has nowhere to start. That is the point where the grouping stops rescuing it.',
      render: (
        <span className="flex w-40 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="h-10 flex-1 rounded-[2px] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/30"
            />
          ))}
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.5', name: 'Multiple Ways', level: 'AA' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Column headings are 11px muted text and still need 4.5:1. They are the most important text in the panel — being small is not an exemption.',
      'The panel must reach 3:1 against the page behind it. Its own border does that job in dark themes, where the shadow does almost nothing.',
      'The open trigger must be distinguishable from its siblings by more than the chevron rotation, which is invisible to anyone not watching for it.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through the triggers, then into the open panel’s links.' },
      { keys: 'Enter / Space', does: 'Opens or closes the panel for the focused trigger.' },
      { keys: '↓', does: 'Opens the panel and moves into it.' },
      { keys: '← →', does: 'Moves between triggers along the bar.' },
      { keys: 'Escape', does: 'Closes the panel and returns focus to its trigger.' },
      { keys: 'Tab past the last link', does: 'Closes the panel. Leaving it open behind the next focused element is disorienting.' },
    ],
    aria: [
      {
        attr: 'aria-expanded',
        on: 'Each trigger',
        note: 'The state of the panel it controls. Without it a screen-reader user has no idea anything opened.',
      },
      {
        attr: 'aria-haspopup',
        on: 'Triggers with a panel',
        note: 'Only on the ones that have one. On a plain link it announces something that is not there.',
      },
      {
        attr: '<nav aria-label="Main">',
        on: 'The bar',
        note: 'A named landmark, so it can be skipped and distinguished from a footer nav.',
      },
      {
        attr: '<ul> / <li>',
        on: 'Each column',
        note: 'Real lists, so the screen reader announces "list, 3 items" and the user can decide whether to hear them.',
      },
      {
        attr: 'Column heading',
        on: 'Each column',
        note: 'A real heading element, or the grouping exists only visually and the panel becomes one undifferentiated list of sixty links.',
      },
    ],
    focus:
      'Focus never moves on hover — only on click, Enter or ↓. A panel that steals focus because a pointer drifted across the bar is far worse than one that opens a moment late. Escape returns focus to the trigger, and Tabbing out of the last link closes the panel.',
    screenReader: [
      'Announced as "Products, button, collapsed", then on open the panel’s headings and lists in order.',
      'The column headings must be real headings. To a screen reader the visual grouping does not exist, and without them the panel is sixty links in a row.',
      'Do not render the panel’s contents when it is closed. Sixty hidden links are still in the tab order and the accessibility tree unless they are properly removed.',
      'Keep the panel immediately after its trigger in the DOM, so the reading order matches the visual one.',
    ],
    touch:
      'On touch the first tap opens the panel and the second follows the link — which means the trigger itself must not navigate on the first tap. Below the tablet breakpoint, replace the whole thing with a drawer and accordions; a hover-driven panel has no touch equivalent worth building.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { MegaMenu, type MegaMenuGroup } from '@/ui/Navigation'

const groups: MegaMenuGroup[] = [
  {
    label: 'Products',
    columns: [
      {
        title: 'Compute',                    // headings are not decoration —
        items: [                             // they are what makes it scannable
          { label: 'Containers', description: 'Run images anywhere', href: '/containers' },
          { label: 'Functions',  description: 'Per-request billing', href: '/functions' },
        ],
      },
      { title: 'Data', items: [{ label: 'Postgres', href: '/postgres' }] },
    ],
    featured: <ReleaseCard post={latest} />,
  },
  // No columns → renders as a plain link, with no chevron
  { label: 'Pricing', columns: [] },
]

<MegaMenu groups={groups} />

// Defaults are the measured ones. Override only with a reason.
<MegaMenu groups={groups} openDelay={120} closeDelay={240} />

// There is no touch equivalent — swap the component, not the timings
const isDesktop = useMediaQuery('(min-width: 1024px)')
{isDesktop ? <MegaMenu groups={groups} /> : <MobileNavDrawer groups={groups} />}`,
    },
    html: {
      lang: 'html',
      caption:
        'The markup is a button plus a list of lists. Everything else is timing.',
      code: `<nav aria-label="Main" class="ds-mega">
  <button
    type="button"
    class="ds-mega__trigger"
    aria-expanded="true"
    aria-haspopup="true"
  >
    Products
    <svg aria-hidden="true"><!-- chevron --></svg>
  </button>

  <!-- Immediately after its trigger, so reading order matches the eye -->
  <div class="ds-mega__panel">
    <div class="ds-mega__column">
      <h3 class="ds-mega__heading">Compute</h3>
      <ul>
        <li><a href="/containers">Containers <span>Run images anywhere</span></a></li>
        <li><a href="/functions">Functions <span>Per-request billing</span></a></li>
      </ul>
    </div>
    <div class="ds-mega__column">
      <h3 class="ds-mega__heading">Data</h3>
      <ul><li><a href="/postgres">Postgres</a></li></ul>
    </div>
  </div>
</nav>

<!-- No panel, so no chevron and no aria-haspopup -->
<a class="ds-mega__trigger" href="/pricing">Pricing</a>`,
    },
    css: {
      lang: 'css',
      code: `.ds-mega { position: relative; }

.ds-mega__panel {
  position: absolute;
  inset-inline: 0;

  /* 6px: reads as attached, but clears the trigger's focus ring.
     The pointer crosses this gap far faster than the close delay. */
  inset-block-start: calc(100% + 6px);
  z-index: 60;

  display: flex;
  flex-wrap: wrap;
  gap: 24px 32px;          /* column gutter wider than the row gap, so the
                              eye reads down a column, not across the panel */
  padding: 20px;

  border: 1px solid var(--ds-border);
  border-radius: var(--radius-xl);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
  animation: fade-in 140ms ease-out both;
}

.ds-mega__column { flex: 1; min-inline-size: 11rem; }

.ds-mega__heading {
  font: var(--text-overline);
  text-transform: uppercase;
  color: var(--ds-fg-muted);
}

.ds-mega__trigger[aria-expanded='true'] {
  background: var(--ds-layer-hover);
  color: var(--ds-fg);
}
.ds-mega__trigger[aria-expanded='true'] svg { transform: rotate(180deg); }

/* No hover on touch, and no room for columns. Do not try to
   make the same component work — swap it for a drawer. */
@media (max-width: 1023px) { .ds-mega { display: none; } }`,
    },
    api: [
      {
        name: 'MegaMenu',
        props: [
          { name: 'groups', type: 'MegaMenuGroup[]', required: true, description: 'The bar. A group with an empty columns array renders as a plain link with no chevron.' },
          { name: 'openDelay', type: 'number', default: '120', description: 'Milliseconds the pointer must rest on a trigger before the panel opens. Ignored when a panel is already open.' },
          { name: 'closeDelay', type: 'number', default: '240', description: 'Grace period after the pointer leaves. Entering the panel cancels it.' },
          { name: 'aria-label', type: 'string', default: "'Main'", description: 'Names the nav landmark.' },
        ],
      },
      {
        name: 'MegaMenuGroup',
        props: [
          { name: 'label', type: 'string', required: true, description: 'The trigger text.' },
          { name: 'columns', type: 'MegaMenuColumn[]', required: true, description: 'Two to four. Five is a wall.' },
          { name: 'featured', type: 'ReactNode', description: 'Promoted content, last in the row, on an inset surface.' },
        ],
      },
      {
        name: 'MegaMenuColumn',
        props: [
          { name: 'title', type: 'string', required: true, description: 'The heading. Not optional — it is what makes the panel scannable.' },
          { name: 'items', type: '{ label, description?, icon?, href? }[]', required: true, description: 'Descriptions are optional and should stay that way; one on every item doubles the panel height.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order the columns by traffic, not by the org chart. The leftmost column is read first, and it should be the one most people came for.',
      'Cap it at about seven items per column. Longer than that and the panel starts to scroll, which is the signal the section wants its own landing page.',
      'Preload the destination on hover-intent. The 120ms delay is already a commitment signal, and it buys the fetch a head start for free.',
      'Close the panel on route change. A panel still hanging open over the page the user just navigated to is a bug people report as "the menu is stuck".',
      'If two sections have almost the same columns, that is a merge waiting to happen — the duplication is in the information architecture, not the menu.',
    ],
    performance: [
      'Render the panel only when open. Four panels of sixty links each is 240 anchors mounted on every page of the site.',
      'Animate opacity, not height. Height animation lays out the whole panel every frame, and on a menu that is the first thing a visitor touches.',
      'Do not fetch the menu contents. Navigation is not dynamic data; ship it in the document so it works before hydration.',
      'Set a fixed panel height per group if the contents are known, so opening does not reflow the page underneath.',
    ],
    mistakes: [
      'Opening on contact, so panels flash at anyone whose pointer crosses the bar.',
      'Closing on pointer-out, so the diagonal path to the far column kills the panel halfway.',
      'Columns without headings, which is the version of a mega menu that Hick’s law really does describe.',
      'A chevron on every item, including the ones that are only a link.',
      'Sixty links left in the DOM and the tab order while the panel is closed.',
      'Trying to make the same component work on touch instead of swapping it for a drawer.',
    ],
    realWorld: [
      'Measure the bounce rate from the panel itself. A panel that opens often and is clicked rarely is being opened by accident — raise the open delay before you redesign anything.',
      'The featured slot is where marketing will ask for a banner. Hold the line on one item: the moment it becomes two, the navigation moves below the fold on a laptop.',
      'A mega menu on an application is almost always a sidebar that lost an argument. Sites navigate by category; applications navigate by object, and those want different components.',
      'Keep the panel contents identical on every page. WCAG 3.2.3 asks for it, and it is also the only reason positional memory ever forms.',
      'If you find yourself adding a search box to the menu, the site has outgrown browsing. Put search in the bar, at full size, and let the menu handle the top of the funnel.',
    ],
  },
})
