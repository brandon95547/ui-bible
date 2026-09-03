import * as React from 'react'
import {
  Activity, ChevronRight, CreditCard, LayoutDashboard, Menu, Rocket, Settings, Users,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { NavItem } from '@/ui/Navigation'
import { Avatar } from '@/ui/Display'
import { Cell, Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   SIDEBAR

   Persistent navigation beside the content, for screens wide enough to spare
   the column. This page documents the column and its densities; what the
   navigation becomes when the column will not fit — a Drawer, a bottom bar —
   is documented where those components live.
   ======================================================================== */

/** Where a reader goes for the neighbours this page deliberately does not teach. */
const RELATED = [
  { id: 'drawer', name: 'Drawer', why: 'Temporary navigation over the content, dismissed after use. What a sidebar most often becomes on a small screen.' },
  { id: 'app-bar', name: 'App Bar', why: 'The top row, and the trigger that opens navigation once the sidebar has given up its column.' },
  { id: 'tree-view', name: 'Tree View', why: 'Genuinely hierarchical data — files, org charts, category trees. Built for arbitrary depth, which navigation is not.' },
  { id: 'bottom-navigation', name: 'Bottom Navigation', why: 'Three to five top-level destinations within thumb reach on touch.' },
  { id: 'menu', name: 'Menu', why: 'A short list of destinations or commands hung off a trigger rather than pinned to the layout.' },
  { id: 'tabs', name: 'Tabs', why: 'Moving between views of one screen. A sidebar moves between screens.' },
  { id: 'command-palette', name: 'Command Palette', why: 'Keyboard-first jumping to any destination. Complements a sidebar in a large product; does not replace it.' },
  { id: 'grid', name: 'Grid & Layout', why: 'The shell the sidebar is one track in — breakpoints, content width and gutters.' },
]

/**
 * The orientation card, in the shape the App Bar page established.
 *
 * Several patterns put navigation down the side of a screen and the names get
 * used interchangeably. Naming the neighbours, and where each is documented,
 * is what keeps this page about the persistent column.
 */
function RelatedComponents() {
  return (
    <section
      aria-label="Related components"
      className="rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-5"
    >
      <h3 className="text-h4 text-[var(--ds-fg)]">Related components</h3>
      <p className="mt-1 max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
        A Sidebar hands over to, or sits beside, these. Each is its own component with its own
        rules — this page covers the persistent column and links out for the rest.
      </p>
      <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {RELATED.map((r) => (
          <li key={r.id} className="flex flex-col">
            <a
              href={`/${r.id}`}
              className="w-fit text-ui text-[var(--ds-accent-text)] underline decoration-[var(--ds-accent-border)] underline-offset-[3px] hover:decoration-[var(--ds-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
            >
              {r.name}
            </a>
            <span className="max-w-[52ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
              {r.why}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
        A <span className="text-[var(--ds-fg-secondary)]">navigation drawer</span> is a Drawer
        holding navigation, and it is documented there. A{' '}
        <span className="text-[var(--ds-fg-secondary)]">navigation rail</span> is this component at
        its collapsed width — the Rail variant below — rather than a separate one.
      </p>
    </section>
  )
}

/* ===========================================================================
   THE SPECIMEN
   ======================================================================== */

const GROUPS = [
  {
    title: 'Build',
    items: [
      { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
      { id: 'deploys', label: 'Deployments', icon: <Rocket size={16} />, count: 3 },
      { id: 'monitor', label: 'Monitoring', icon: <Activity size={16} /> },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'team', label: 'Team', icon: <Users size={16} /> },
      { id: 'billing', label: 'Billing', icon: <CreditCard size={16} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    ],
  },
]

type Density = 'expanded' | 'compact' | 'rail'

/**
 * The specimen, at all three densities.
 *
 * Interactive state is local, so the rows are buttons here. In a product they
 * are links — see the Do section and the code below; a destination that cannot
 * be middle-clicked or copied is a destination the browser cannot help with.
 */
function SidebarDemo({
  width = 268,
  density = 'expanded',
  showGroups = true,
  className,
}: {
  width?: number
  density?: Density
  showGroups?: boolean
  className?: string
}) {
  const [active, setActive] = React.useState('deploys')
  const [open, setOpen] = React.useState<string[]>(['Build', 'Workspace'])

  if (density === 'rail') {
    return (
      <div
        className={cn(
          'flex w-[72px] shrink-0 flex-col items-center gap-1 border-e border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2',
          className,
        )}
      >
        <nav aria-label="Main" className="flex w-full flex-col items-center gap-1">
          {GROUPS.flatMap((g) => g.items).map((i) => (
            <button
              key={i.id}
              type="button"
              // Both, and neither is optional: the name is what a screen reader
              // reads, the tooltip is what a sighted user needs when the label
              // is not on screen.
              title={i.label}
              aria-label={i.label}
              aria-current={active === i.id ? 'page' : undefined}
              onClick={() => setActive(i.id)}
              className={cn(
                'grid h-11 w-11 place-items-center rounded-[var(--radius-md)] transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                active === i.id
                  ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-accent-text)]'
                  : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
              )}
            >
              {i.icon}
            </button>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div
      style={{ width }}
      className={cn(
        'flex shrink-0 flex-col border-e border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        className,
      )}
    >
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--p-brand-400)] to-[var(--p-brand-700)] text-caption font-bold text-white"
        >
          A
        </span>
        <span className="truncate text-ui font-medium text-[var(--ds-fg)]">Acme</span>
      </div>

      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto p-2">
        {GROUPS.map((g) => {
          const isOpen = open.includes(g.title)
          const id = `group-${g.title}`
          return (
            <div key={g.title} className="mb-1">
              {showGroups && (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() =>
                    setOpen((p) =>
                      p.includes(g.title) ? p.filter((x) => x !== g.title) : [...p, g.title],
                    )
                  }
                  className="flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-overline uppercase text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg-secondary)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
                >
                  <ChevronRight
                    size={12}
                    aria-hidden
                    className={cn('transition-transform duration-[160ms]', isOpen && 'rotate-90')}
                  />
                  {g.title}
                </button>
              )}
              <div id={id} hidden={showGroups && !isOpen} className="mt-0.5 flex flex-col gap-px">
                {g.items.map((i) => (
                  <NavItem
                    key={i.id}
                    icon={i.icon}
                    label={i.label}
                    count={i.count}
                    compact={density === 'compact'}
                    active={active === i.id}
                    onClick={() => setActive(i.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Outside the scroll container, so it stays reachable however long the
          navigation gets. */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--ds-border-subtle)] p-2">
        <Avatar name="Ada Lovelace" size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm text-[var(--ds-fg)]">Ada Lovelace</span>
          <span className="block truncate text-caption text-[var(--ds-fg-muted)]">Maintainer</span>
        </span>
      </div>
    </div>
  )
}

/** Filler, so a sidebar is judged beside content rather than in isolation. */
function Content({ lines = 6 }: { lines?: number }) {
  return (
    <div className="min-w-0 flex-1 space-y-3 overflow-hidden bg-[var(--ds-canvas)] p-4">
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

const DENSITIES: readonly Density[] = ['expanded', 'compact', 'rail']

function Playground() {
  const [width, setWidth] = React.useState<'208' | '240' | '268' | '320'>('268')
  const [density, setDensity] = React.useState<Density>('expanded')
  const [groups, setGroups] = React.useState(true)

  return (
    <div className="flex flex-col gap-8">
      <RelatedComponents />

      <PreviewStage
        label="Playground"
        center={false}
        minHeight={340}
        padded={false}
        controls={
          <div className="flex flex-wrap items-center gap-2.5">
            <Knob label="Density">
              <KnobSelect value={density} onChange={setDensity} options={DENSITIES} />
            </Knob>
            <Knob label="Width">
              <KnobSelect
                value={width}
                onChange={setWidth}
                options={['208', '240', '268', '320'] as const}
              />
            </Knob>
            <KnobToggle checked={groups} onChange={setGroups} label="Groups" />
          </div>
        }
      >
        <div className="flex h-[22rem] w-full overflow-hidden">
          <SidebarDemo width={Number(width)} density={density} showGroups={groups} />
          <Content lines={8} />
        </div>
      </PreviewStage>
    </div>
  )
}

/* ===========================================================================
   VARIANTS
   ======================================================================== */

function Variants() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-3">
      <Cell label="Expanded" sub="Icon, label and count. The default.">
        <div className="h-[17rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <SidebarDemo width={228} className="h-full border-e-0" />
        </div>
      </Cell>
      <Cell label="Compact" sub="Same content, denser rows. Long navigation, dense tools.">
        <div className="h-[17rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <SidebarDemo width={228} density="compact" className="h-full border-e-0" />
        </div>
      </Cell>
      <Cell label="Rail" sub="Icons only, labels on hover and focus. Space is scarce.">
        <div className="flex h-[17rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <SidebarDemo density="rail" className="border-e-0" />
          <Content lines={5} />
        </div>
      </Cell>
    </div>
  )
}

/* ===========================================================================
   RESPONSIVE

   Side by side rather than described, because the point is the swap: the same
   destinations, reached two different ways, decided by whether the column fits.
   ======================================================================== */

function Responsive() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <Cell label="Wide" sub="The column fits, so it stays — no gesture to reach any destination.">
        <div className="flex h-[15rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <SidebarDemo width={200} className="border-e" />
          <Content lines={5} />
        </div>
      </Cell>
      <Cell label="Narrow" sub="The column would take most of the screen, so navigation moves into a Drawer behind a trigger.">
        <div className="mx-auto flex h-[15rem] w-[240px] flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3">
            <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)]">
              <Menu size={18} aria-hidden />
            </span>
            <span className="truncate text-ui font-medium text-[var(--ds-fg)]">Acme</span>
          </div>
          <Content lines={4} />
        </div>
      </Cell>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'sidebar',
    title: 'Sidebar',
    tagline:
      'Persistent navigation beside the content: a product’s top-level destinations, always visible and always in the same place. It is a large-screen layout — where the column will not fit, the same destinations move into a Drawer or another mobile pattern.',
    keywords: [
      'side nav', 'sidebar', 'navigation rail', 'rail', 'side navigation', 'left nav',
      'groups', 'collapse', 'resize', 'active indicator', 'persistent', 'shell',
    ],
  },

  preview: {
    render: <Playground />,
    contents: [
      { id: 'variants', title: 'Variants' },
      { id: 'small-screens', title: 'Small screens' },
      { id: 'resizing', title: 'Resizing (optional)' },
    ],
    examples: [
      {
        id: 'variants',
        title: 'Variants',
        description:
          'Three densities for three situations, all showing the same destinations. Expanded is the default; compact buys rows at the cost of breathing room; the rail buys width at the cost of labels.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              <Variants />
              <p className="max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                A rail only works when its icons are already familiar. Every button needs an
                accessible name and a tooltip, and anything ambiguous should stay expanded — see{' '}
                <a href="/icons" className="text-[var(--ds-accent-text)] underline underline-offset-2">Icons</a>.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'small-screens',
        title: 'Small screens',
        description:
          'A persistent column needs a screen wide enough to spare it. Below roughly 1024px it usually gives way: the same destinations move into a temporary Drawer opened from the App Bar, or — for three to five of them — into Bottom Navigation.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              <Responsive />
              <p className="max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                The switch is a layout decision, so it belongs to the shell rather than to this
                component — see{' '}
                <a href="/grid" className="text-[var(--ds-accent-text)] underline underline-offset-2">Grid &amp; Layout</a>{' '}
                for the breakpoints,{' '}
                <a href="/drawer" className="text-[var(--ds-accent-text)] underline underline-offset-2">Drawer</a>{' '}
                for the panel it becomes, and{' '}
                <a href="/bottom-navigation" className="text-[var(--ds-accent-text)] underline underline-offset-2">Bottom Navigation</a>{' '}
                for the touch alternative. Keep the destinations and their order identical across
                the swap; only the container changes.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'resizing',
        title: 'Resizing (optional)',
        description:
          'Worth adding where names are user-generated and vary in length — repositories, customers, file paths. Plenty of products do without it, and a fixed width is not a defect.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full">
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
                <table className="w-full border-collapse text-body-sm">
                  <tbody>
                    {[
                      ['Bounds', '208–400px', 'Somewhere to stop. Unbounded dragging ends at a width the handle cannot be found in.'],
                      ['Reset', 'Double-click', 'One gesture back to the default, so experimenting is free.'],
                      ['Keyboard', 'Arrow keys', 'The handle takes focus and moves in steps. Without this it is pointer-only.'],
                      ['Persistence', 'Per user', 'A width that resets on every visit makes the handle decorative.'],
                      ['Touch', 'Hidden', 'A drag target this thin is not usable with a finger.'],
                    ].map(([k, v, why]) => (
                      <tr key={k} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                        <td className="w-28 px-3 py-2 text-body-sm font-medium text-[var(--ds-fg)]">{k}</td>
                        <td className="w-28 px-3 py-2 font-mono text-caption tabular-nums text-[var(--ds-accent-text)]">{v}</td>
                        <td className="px-3 py-2 text-[var(--ds-fg-secondary)]">{why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                This Bible’s own sidebar is resizable — drag its right edge, or focus the handle and
                use the arrow keys.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', note: '15px label, 32px row', render: <div className="w-40"><NavItem icon={<Rocket size={16} />} label="Deployments" /></div> },
      { label: 'Hover', note: '--ds-layer-hover', render: <div className="w-40"><NavItem icon={<Rocket size={16} />} label="Deployments" className="bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]" /></div> },
      { label: 'Current', note: 'aria-current="page"', render: <div className="w-40 pl-1"><NavItem icon={<Rocket size={16} />} label="Deployments" active /></div> },
      { label: 'Focus visible', note: '2px ring, inset', render: <div className="w-40"><NavItem icon={<Rocket size={16} />} label="Deployments" className="outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]" /></div> },
      { label: 'With count', note: 'Only when actionable', render: <div className="w-40"><NavItem icon={<Rocket size={16} />} label="Deployments" count={3} /></div> },
      { label: 'Nested', note: 'One level in, 14px', render: <div className="w-40"><NavItem label="us-east-1" depth={1} /></div> },
      { label: 'Compact', note: '28px row, 13px label', render: <div className="w-40"><NavItem icon={<Rocket size={16} />} label="Deployments" compact /></div> },
      { label: 'Truncated', note: 'Ellipsis plus a title', render: <div className="w-28"><NavItem icon={<Rocket size={16} />} label="A very long destination name" /></div> },
      { label: 'Group heading', note: '12px / 600, muted', render: <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Workspace</span> },
      { label: 'Group collapsed', note: 'aria-expanded="false"', render: <span className="inline-flex items-center gap-1.5 text-overline uppercase text-[var(--ds-fg-muted)]"><ChevronRight size={12} aria-hidden /> Workspace</span> },
      { label: 'Rail item', note: 'Named and tooltipped', render: <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-selected)] text-[var(--ds-accent-text)]"><Rocket size={16} /></span> },
      { label: 'Resize handle', note: 'Optional. 1px, 9px target', render: <span className="block h-8 w-px bg-[var(--ds-accent)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="flex h-[18rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
        <SidebarDemo width={240} />
        <Content lines={5} />
      </div>
    ),
    caption:
      'A brand row, a scrolling navigation region with two collapsible groups, and a pinned account row. Only the middle region scrolls.',
    parts: [
      {
        n: 1,
        label: 'Width',
        value: '268px default',
        kind: 'size',
        note: 'A system default, not a universal number: it holds a two-word label, an icon and a count without truncating. 208–400px is the range worth designing within — narrower and labels clip, wider and the column starts competing with the content.',
      },
      {
        n: 2,
        label: 'Row height',
        value: '32px · 28px compact',
        kind: 'size',
        note: 'Denser than a button, because a list of destinations is scanned vertically rather than acted on one at a time. Rows grow to 44px on coarse pointers.',
      },
      {
        n: 3,
        label: 'Label',
        value: '--text-ui · 15px / 21px',
        kind: 'type',
        note: 'The same size every navigation surface uses, and it does not shrink to fit more rows in. Compact steps to 13px; nothing in the sidebar goes below that. See Typography.',
      },
      {
        n: 4,
        label: 'Current destination',
        value: 'Tint + 2px marker',
        kind: 'color',
        note: 'The requirement is aria-current plus a cue that survives greyscale. This system spends a background tint and a 2px marker, absolutely positioned so the row’s box never changes; a left border or a heavier weight would meet the same requirement.',
      },
      {
        n: 5,
        label: 'Group heading',
        value: '12px / 600, uppercase',
        kind: 'type',
        note: 'Visually secondary to the destinations under it, but still readable text: 12px is the floor of the scale, and the muted foreground it uses clears 4.5:1.',
      },
      {
        n: 6,
        label: 'Indentation',
        value: '14px per level',
        kind: 'space',
        note: 'Enough to read as nesting without eating the label. Every level costs width, which is the practical limit on how deep navigation can usefully go.',
      },
      {
        n: 7,
        label: 'Pinned footer',
        value: 'Outside the scroll',
        kind: 'space',
        note: 'Account and settings stay reachable however long the list gets. They are what people look for when everything else has failed.',
      },
    ],
  },

  tokens: [
    { category: 'color', group: 'Planes', token: '--ds-surface', usedFor: 'Sidebar background' },
    { category: 'color', group: 'Planes', token: '--ds-border-subtle', usedFor: 'Inline-end edge, section dividers' },
    { category: 'color', group: 'Interaction', token: '--ds-layer-hover', usedFor: 'Hover fill' },
    { category: 'color', group: 'Interaction', token: '--ds-layer-selected', usedFor: 'Current-destination tint' },
    { category: 'color', group: 'Interaction', token: '--ds-accent', usedFor: 'Current marker, and the resize handle on hover' },
    { category: 'color', group: 'Interaction', token: '--ds-focus-ring', usedFor: 'Focus outline, 2px inset' },
    { category: 'color', group: 'Foreground', token: '--ds-fg', usedFor: 'Current destination, brand' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-secondary', usedFor: 'Inactive labels' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-muted', usedFor: 'Icons, group headings, footer metadata' },
    { category: 'typography', group: 'Foreground', token: '--text-ui', value: '15px / 21px / 470', usedFor: 'Destination labels' },
    { category: 'typography', group: 'Foreground', token: '--text-label', value: '13px', usedFor: 'Labels in the compact density' },
    { category: 'typography', group: 'Foreground', token: '--text-overline', value: '12px / 600', usedFor: 'Group headings' },
    { category: 'spacing', group: 'Layout', token: 'width', value: '268px default', usedFor: '208–400px is the useful range' },
    { category: 'spacing', group: 'Layout', token: 'row height', value: '32 / 28px', usedFor: 'Default and compact; 44px on coarse pointers' },
    { category: 'spacing', group: 'Layout', token: 'indent', value: '14px per level', usedFor: 'Nesting' },
    { category: 'radius', group: 'Layout', token: '--radius-sm', value: '6px', usedFor: 'Row corners' },
    { category: 'motion', group: 'Interaction', token: '--ease-standard', value: '100–160ms', usedFor: 'Hover, and group expand' },
  ],

  sizes: [
    { name: 'Expanded', minWidth: '268px', height: '32px rows', type: '15px label', use: 'The default. Icon, label and count with no truncation.' },
    { name: 'Compact', minWidth: '240px', height: '28px rows', type: '13px label', use: 'Twelve or more destinations, or a dense internal tool. 13px is as low as a destination label goes.' },
    { name: 'Rail', minWidth: '56–80px', height: '44px targets', use: 'Icons only, each with a name and a tooltip. Only for icons the audience already knows.' },
    { name: 'Range', minWidth: '208px', maxWidth: '400px', use: 'The band worth designing within. Below it labels clip; above it the column competes with the content.' },
    { name: 'Touch', height: '44px rows', touch: '44px', use: 'Coarse pointers, wherever the sidebar survives as a column — usually a tablet.' },
  ],

  do: [
    {
      title: 'Render destinations as links',
      why: 'A link can be middle-clicked, opened in a new tab, copied and prefetched; a button can do none of those, and people do all of them in navigation. Reserve buttons for controls that act rather than navigate.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-success)]">{'<a href="/deployments" aria-current="page">'}</span>
          <span className="text-[var(--ds-fg-muted)] line-through">{'<button onClick={() => go("/deployments")}>'}</span>
        </div>
      ),
    },
    {
      title: 'Mark the current destination in more than colour',
      why: 'aria-current="page" is what tells assistive technology where the user is, and a cue that survives greyscale is what tells everyone else. A tint plus a marker, a border, or a heavier weight all qualify.',
      render: (
        <div className="w-44 pl-1">
          <NavItem icon={<Rocket size={16} />} label="Deployments" active />
          <NavItem icon={<Activity size={16} />} label="Monitoring" />
        </div>
      ),
    },
    {
      title: 'Keep the footer out of the scroll region',
      why: 'Long navigation scrolls. Account and settings are what people reach for when they are lost, so they should not be at the bottom of a list that has scrolled away.',
      render: (
        <div className="w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <div className="h-20 overflow-y-auto p-1">
            {GROUPS[0].items.map((i) => (
              <NavItem key={i.id} icon={i.icon} label={i.label} compact />
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--ds-border-subtle)] p-2">
            <Avatar name="Ada Lovelace" size="xs" />
            <span className="truncate text-body-sm text-[var(--ds-fg-secondary)]">Ada Lovelace</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Prefer a shallow structure, and know when it is really a tree',
      why: 'Groups plus destinations is what most products need, and it is what people learn by position. Some professional tools genuinely navigate a hierarchy — an org chart, a file system, a category tree — and once nesting is unbounded, Tree View is the component built for it: roving focus, arbitrary depth, virtualisation.',
      render: (
        <div className="w-44">
          <span className="block px-2 py-1 text-overline uppercase text-[var(--ds-fg-muted)]">Build</span>
          <NavItem icon={<Rocket size={16} />} label="Deployments" active />
          <NavItem label="us-east-1" depth={1} />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not signal the current destination with colour alone',
      why: 'It fails for anyone with a colour-vision deficiency, in greyscale, and in bright sunlight — and on its own it gives assistive technology nothing at all. Add aria-current, and a second visual cue.',
      render: (
        <div className="w-44">
          <NavItem icon={<Rocket size={16} />} label="Deployments" className="text-[var(--ds-accent-text)]" />
          <NavItem icon={<Activity size={16} />} label="Monitoring" />
        </div>
      ),
    },
    {
      title: 'Do not ship a rail without names',
      why: 'A column of unlabelled icons turns recognition into guesswork and hovering. Every rail button needs an accessible name and a tooltip; if the icons are not already familiar to the audience, stay expanded.',
      render: (
        <div className="flex w-16 flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
          {[Activity, CreditCard, Settings, Users].map((Icon, i) => (
            <span key={i} className="grid h-11 w-11 place-items-center text-[var(--ds-fg-muted)]">
              <Icon size={16} />
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not reorder destinations between visits',
      why: 'Within a week people navigate by position rather than by reading. A list that sorts itself by recency or usage takes that away, and every trip becomes a search.',
      render: (
        <div className="flex w-44 flex-col gap-1 text-body-sm text-[var(--ds-fg-muted)]">
          <span>Monday: Dashboard · Deployments · Team</span>
          <span>Friday: Team · Dashboard · Deployments</span>
        </div>
      ),
    },
    {
      title: 'Do not shrink the labels to fit more rows',
      why: 'Density is bought with row height and grouping, not with type size. Navigation labels are read from the corner of the eye by someone deciding where to go, which is the worst possible place to save a pixel.',
      render: (
        <div className="w-44">
          <span className="flex h-6 items-center px-2.5 text-[11px] text-[var(--ds-fg-muted)]">Deployments</span>
          <span className="flex h-6 items-center px-2.5 text-[11px] text-[var(--ds-fg-muted)]">Monitoring</span>
          <span className="mt-1 block px-2.5 text-body-sm text-[var(--ds-fg-secondary)]">11px — see Readable Type</span>
        </div>
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
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
    ],
    contrast: [
      'Inactive labels use --ds-fg-secondary. Muted is reserved for icons, group headings and metadata, and even there it must clear 4.5:1 — a group heading is readable text, not decoration.',
      'The current-destination marker must reach 3:1 against the sidebar background: it is a non-text indicator carrying meaning.',
      'The edge between the sidebar and the content needs enough contrast to read as a boundary in both themes, or the two planes merge.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the navigation and moves through the destinations. Every row is reachable — nothing in the sidebar is pointer-only.' },
      { keys: 'Enter', does: 'Follows the focused destination. Space also activates a group header, which is a button rather than a link.' },
      { keys: '↑ / ↓', does: 'Optional: with roving focus, moves between destinations while the nav holds one tab stop. Useful once the list is long; not required.' },
      { keys: '← / →', does: 'Collapses and expands a group when focus is on its header, matching the disclosure pattern.' },
      { keys: 'Arrows on the handle', does: 'Where resizing exists, the handle takes focus and resizes in steps. Home returns to the default.' },
      { keys: 'Skip link', does: 'The first tab stop on the page jumps past the navigation. Without it, every keyboard user crosses the whole list to reach the content.' },
    ],
    aria: [
      { attr: '<nav aria-label="Main">', on: 'The navigation region', note: 'A named landmark. A page with more than one nav needs a distinct label on each.' },
      { attr: 'aria-current="page"', on: 'The current destination', note: 'The value is "page". This is what tells assistive technology where the user is; styling alone does not.' },
      { attr: 'aria-expanded + aria-controls', on: 'Group headings', note: 'On the header button, pointing at the container it shows and hides.' },
      { attr: 'aria-label', on: 'Rail buttons', note: 'Required in the collapsed density — the visible label is gone, so the accessible name is all that is left.' },
      { attr: 'title', on: 'Truncated labels', note: 'So the full destination name is available on hover. Not a substitute for an accessible name.' },
      { attr: 'role="separator"', on: 'The resize handle, if present', note: 'With aria-orientation="vertical", aria-valuenow, aria-valuemin and aria-valuemax, so its position is announced as it moves.' },
    ],
    focus:
      'The focus ring is never removed, only restyled — 2px, inset, so it is not clipped by the sidebar’s own edge. Scroll the current destination into view on navigation, or someone deep in a long list loses their place on every trip.',
    screenReader: [
      'Mark groups up as lists so their size is announced: "Build, list of 3 items".',
      'The skip link must clear the sidebar as well as the app bar. Twenty destinations is a real barrier between a keyboard user and the page.',
      'In the rail density nothing is visible but glyphs, so the accessible name carries the whole meaning. Check it reads as a destination — "Deployments", not "rocket".',
    ],
    touch:
      'Rows grow to 44px on coarse pointers, which clears the 24×24 that WCAG 2.5.8 asks for at AA with room to spare, and the resize handle is hidden entirely — a drag target that thin cannot be used with a finger. Below the layout breakpoint the column usually gives way to a Drawer, where the same rules apply.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption:
        'Real links, a named landmark, groups as disclosures, and a footer outside the scroll region. Resizing is bolted on, not built in — leave it out and nothing else changes.',
      code: `<aside
  style={{ inlineSize: width }}
  className="flex h-dvh flex-col border-e border-line-subtle bg-surface"
>
  <BrandRow />

  {/* Only this region scrolls. */}
  <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto p-2">
    {groups.map((g) => (
      <section key={g.id}>
        <button
          aria-expanded={!collapsed.includes(g.id)}
          aria-controls={\`group-\${g.id}\`}
          onClick={() => toggleGroup(g.id)}
          className="text-overline uppercase text-fg-muted"
        >
          <ChevronRight aria-hidden />
          {g.title}
        </button>

        {/* A list, so the number of destinations is announced. */}
        <ul id={\`group-\${g.id}\`} hidden={collapsed.includes(g.id)}>
          {g.items.map((item) => (
            <li key={item.id}>
              <NavItem
                href={item.href}                    {/* a link, not a button */}
                icon={item.icon}
                label={item.label}
                count={item.count}
                active={item.id === currentId}      {/* sets aria-current */}
              />
            </li>
          ))}
        </ul>
      </section>
    ))}
  </nav>

  <AccountRow />   {/* outside the scroll container, so it never scrolls away */}
</aside>

// Keep the current destination visible when the list is long.
useEffect(() => {
  navRef.current
    ?.querySelector('[aria-current="page"]')
    ?.scrollIntoView({ block: 'nearest' })
}, [currentId])`,
    },
    css: {
      lang: 'css',
      caption: 'The row, the current state, and the two responsive rules. Every value is a token.',
      code: `.ds-sidebar {
  display: flex;
  flex-direction: column;
  block-size: 100dvh;
  inline-size: var(--sidebar-width, 268px);
  border-inline-end: 1px solid var(--ds-border-subtle);
  background: var(--ds-surface);
}

.ds-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  block-size: 32px;
  padding-inline: 10px;
  border-radius: var(--radius-sm);
  /* Navigation text, same as every other nav surface — see Typography. */
  font: var(--text-ui);
  color: var(--ds-fg-secondary);
  transition: background-color 100ms var(--ease-standard);
}

.ds-nav-item:hover { background: var(--ds-layer-hover); color: var(--ds-fg); }

.ds-nav-item:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: -2px;   /* inset, so the sidebar's edge cannot clip it */
}

/* Current destination: a tint plus a marker, so it survives greyscale. The
   marker is absolutely positioned, which keeps the row's box unchanged and
   stops labels shifting when the current item moves. */
.ds-nav-item[aria-current='page'] {
  background: var(--ds-layer-selected);
  color: var(--ds-fg);
  font-weight: 500;
}
.ds-nav-item[aria-current='page']::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 50%;
  translate: 0 -50%;
  inline-size: 2px;
  block-size: 15px;
  border-start-end-radius: 999px;
  border-end-end-radius: 999px;
  background: var(--ds-accent);
}

/* Touch: bigger rows, and no drag handle. */
@media (pointer: coarse) {
  .ds-nav-item { block-size: 44px; }
  .ds-resize-handle { display: none; }
}

/* Narrow: the column gives way, and the same destinations open in a Drawer. */
@media (max-width: 1023px) {
  .ds-sidebar { display: none; }
}`,
    },
    api: [
      {
        name: 'NavItem',
        props: [
          { name: 'label', type: 'ReactNode', required: true, description: 'Truncates with an ellipsis. Pass a title so the full name is available on hover.' },
          { name: 'href', type: 'string', description: 'Renders an anchor instead of a button. Prefer it for destinations — links support middle-click, open-in-new-tab and copy.' },
          { name: 'icon', type: 'ReactNode', description: '16px. Muted at rest, accent when current.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Sets aria-current="page" and applies the current-destination treatment.' },
          { name: 'count', type: 'number', description: 'Trailing count. Use it when the number is actionable rather than merely large.' },
          { name: 'depth', type: 'number', default: '0', description: 'Indent level, 14px each. Prefer shallow structures; for genuinely deep hierarchies use Tree View.' },
          { name: 'compact', type: 'boolean', default: 'false', description: '28px rows with a 13px label, for the compact density.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order destinations by how often they are used, and then leave the order alone — position is what people learn first.',
      'Show a count when the number is actionable. "Deployments 3" where 3 means "needs review" is useful; a running total is decoration.',
      'A large product may benefit from search or a command palette alongside the sidebar. That is a convenience for power users, not evidence that the navigation is broken.',
      'Persist width and collapsed groups per user. State that resets on every visit makes the controls that set it pointless.',
    ],
    performance: [
      'The sidebar renders on every route. Keep route-specific state out of it and memoise it, or each navigation re-renders the whole list.',
      'Drive a resize with a pointermove listener writing a CSS variable rather than React state — a state update per mousemove drops frames on a long list.',
      'Prefetch on hover. Sidebar links are the most predictable navigation in a product, which makes them the cheapest to guess right.',
      'For very long navigation, content-visibility: auto on collapsed groups skips laying out what is not shown.',
    ],
    mistakes: [
      'Buttons instead of links, which breaks middle-click, open-in-new-tab and copy-link.',
      'A border for the current state instead of a positioned marker, so every label shifts by a pixel when the current item changes.',
      'No aria-current, leaving the current destination visible to sighted users only.',
      'Forgetting to scroll the current destination into view, so a long list loses the user’s place on every navigation.',
      'A rail whose icons are not familiar, which converts a navigation column into a row of quizzes.',
    ],
    realWorld: [
      'Watch someone use the product for a week. If they still read the labels rather than pointing, either the order is unstable or the names are not distinct.',
      'Usage data settles ordering arguments faster than opinion does, and it is the honest way to decide what belongs at the top.',
      'Resizing is used by a minority, but that minority skews heavily towards the people who live in the product all day.',
      'Check the sidebar at 200% browser zoom. It is the surface most likely to squeeze the content column to nothing.',
    ],
  },
})
