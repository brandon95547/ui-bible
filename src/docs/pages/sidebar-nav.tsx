import * as React from 'react'
import {
  Activity,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Rocket,
  Settings,
  Users,
} from 'lucide-react'
import { NavItem } from '@/ui/Navigation'
import { Avatar } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const GROUPS = [
  {
    title: 'Build',
    items: [
      { id: 'dash', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
      { id: 'deploys', label: 'Deployments', icon: <Rocket size={14} />, count: 3 },
      { id: 'monitor', label: 'Monitoring', icon: <Activity size={14} /> },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'team', label: 'Team', icon: <Users size={14} /> },
      { id: 'billing', label: 'Billing', icon: <CreditCard size={14} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    ],
  },
]

function SidebarDemo({
  width = 240,
  collapsed,
  compact,
  showGroups = true,
}: {
  width?: number
  collapsed?: boolean
  compact?: boolean
  showGroups?: boolean
}) {
  const [active, setActive] = React.useState('deploys')
  const [open, setOpen] = React.useState<string[]>(['Build', 'Workspace'])

  if (collapsed) {
    return (
      <div className="flex w-14 shrink-0 flex-col gap-1 border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2">
        {GROUPS.flatMap((g) => g.items).map((i) => (
          <button
            key={i.id}
            type="button"
            title={i.label}
            aria-label={i.label}
            aria-current={active === i.id ? 'page' : undefined}
            onClick={() => setActive(i.id)}
            className={`grid h-9 w-9 place-items-center rounded-[var(--radius-md)] transition-colors ${
              active === i.id
                ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-accent-text)]'
                : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]'
            }`}
          >
            {i.icon}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      style={{ width }}
      className="flex shrink-0 flex-col border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]"
    >
      <div className="flex h-12 items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3">
        <span
          aria-hidden
          className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-gradient-to-br from-[var(--p-brand-400)] to-[var(--p-brand-700)] text-[10px] font-bold text-white"
        >
          A
        </span>
        <span className="truncate text-label text-[var(--ds-fg)]">Acme</span>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto p-2">
        {GROUPS.map((g) => {
          const isOpen = open.includes(g.title)
          return (
            <div key={g.title} className="mb-1">
              {showGroups && (
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpen((p) =>
                      p.includes(g.title) ? p.filter((x) => x !== g.title) : [...p, g.title],
                    )
                  }
                  className="flex w-full items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-overline uppercase text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)]"
                >
                  <ChevronRight
                    size={11}
                    className={`transition-transform duration-[160ms] ${isOpen ? 'rotate-90' : ''}`}
                  />
                  {g.title}
                </button>
              )}
              {(!showGroups || isOpen) && (
                <div className="mt-0.5 flex flex-col gap-px">
                  {g.items.map((i) => (
                    <NavItem
                      key={i.id}
                      icon={i.icon}
                      label={i.label}
                      count={i.count}
                      compact={compact}
                      active={active === i.id}
                      onClick={() => setActive(i.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex items-center gap-2 border-t border-[var(--ds-border-subtle)] p-2">
        <Avatar name="Ada Lovelace" size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label-sm text-[var(--ds-fg)]">Ada Lovelace</span>
          <span className="block truncate text-[10px] text-[var(--ds-fg-muted)]">Maintainer</span>
        </span>
      </div>
    </div>
  )
}

function Playground() {
  const [width, setWidth] = React.useState<'208' | '240' | '280' | '360'>('240')
  const [collapsed, setCollapsed] = React.useState(false)
  const [compact, setCompact] = React.useState(false)
  const [groups, setGroups] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={340}
      padded={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Width">
            <KnobSelect
              value={width}
              onChange={setWidth}
              options={['208', '240', '280', '360'] as const}
            />
          </Knob>
          <KnobToggle checked={collapsed} onChange={setCollapsed} label="Icon rail" />
          <KnobToggle checked={compact} onChange={setCompact} label="Compact rows" />
          <KnobToggle checked={groups} onChange={setGroups} label="Groups" />
        </div>
      }
    >
      <div className="flex h-[22rem] w-full overflow-hidden">
        <SidebarDemo
          width={Number(width)}
          collapsed={collapsed}
          compact={compact}
          showGroups={groups}
        />
        <div className="flex-1 bg-[var(--ds-canvas)] p-5">
          <p className="text-label text-[var(--ds-fg)]">Content</p>
          <p className="mt-1.5 text-caption text-[var(--ds-fg-muted)]">
            The sidebar is the only fixed track in the shell grid. Everything else is fluid.
          </p>
        </div>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'sidebar-nav',
    title: 'Sidebar',
    group: 'Navigation',
    tagline:
      'Persistent navigation for applications with more destinations than a top bar can hold. Two levels deep, resizable, and never a place to hide the primary action.',
    keywords: ['side nav', 'rail', 'drawer', 'menu', 'tree', 'navigation', 'collapse', 'resize'],
  },

  overview: {
    purpose:
      'A sidebar shows every top-level destination at once, permanently. That permanence is its entire value: users learn the positions rather than the labels, and after a week they are pointing rather than reading. It costs 240px of horizontal space on every screen, which is the price of that certainty.',
    whenToUse: [
      'More than about five top-level destinations — past that a top bar runs out of room.',
      'Users move between sections frequently rather than working in one place.',
      'The hierarchy is two levels deep and stable.',
      'The screen is 1024px or wider. Below that it becomes a drawer.',
    ],
    whenNotToUse: [
      {
        text: 'There are five or fewer destinations.',
        instead: 'a Top Bar',
        to: '#/top-bar',
      },
      {
        text: 'The user is switching between views of one object.',
        instead: 'Tabs',
        to: '#/tabs',
      },
      {
        text: 'The screen is under 1024px wide.',
        instead: 'a Drawer, or Bottom Navigation on a phone',
        to: '#/drawer',
      },
      {
        text: 'The hierarchy is three or more levels deep.',
        instead: 'two levels plus in-page navigation — a nav tree nobody can hold in their head is not navigation',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Two levels, maximum.</strong> Group headings and their items. A third level turns
          the sidebar into a file tree, and a file tree is something users navigate rather than
          something they learn. If you need a third level, it belongs inside the page.
        </p>
        <p>
          The active marker is a <strong>2px bar plus a background tint</strong>, not a border. A
          border would change the row’s box model and shift every label by a pixel when it appears.
          The tint alone is too subtle in a list of twelve rows; the bar alone disappears in
          greyscale. Both together survive everything.
        </p>
        <p>
          Resizable, with bounds and a double-click reset. Users with long project names want more
          room; users on a laptop want less. Unbounded resize always ends with someone dragging it
          to 4px and being unable to find the handle again — hence the 208px floor.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'states',
        title: 'Expanded, compact and rail',
        description:
          'Three densities for three situations. The icon rail keeps the destinations reachable when horizontal space is scarce, at the cost of making labels a hover away.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false} padded={false}>
            <div className="flex h-[20rem] w-full gap-4 overflow-hidden p-4">
              <SidebarDemo width={220} />
              <SidebarDemo width={200} compact />
              <SidebarDemo collapsed />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'resize',
        title: 'Resizing',
        description:
          'The handle is 1px visually and 9px in hit area — Fitts’ Law applied to a genuinely hard target. It has keyboard support and a double-click reset.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full">
              <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-3">
                <p className="text-label text-[var(--ds-fg)]">Try the real one</p>
                <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
                  The sidebar of this Bible is resizable. Drag its right edge, or focus the handle
                  and use the arrow keys. Double-click resets it to 268px.
                </p>
              </div>
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
                <table className="w-full border-collapse text-body-sm">
                  <tbody>
                    {[
                      ['Minimum', '208px', 'Below this, labels truncate and the rail is better.'],
                      ['Default', '268px', 'Holds a two-word label plus an icon and a count.'],
                      ['Maximum', '400px', 'Past this the sidebar competes with the content.'],
                      ['Hit area', '9px', 'Visually 1px. The extra 8px is what makes it grabbable.'],
                    ].map(([k, v, why]) => (
                      <tr key={k} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                        <td className="w-24 px-3 py-2 text-label text-[var(--ds-fg)]">{k}</td>
                        <td className="w-20 px-3 py-2 font-mono text-[11.5px] tabular-nums text-[var(--ds-accent-text)]">{v}</td>
                        <td className="px-3 py-2 text-[var(--ds-fg-muted)]">{why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <div className="w-40"><NavItem icon={<Rocket size={14} />} label="Deployments" /></div> },
      { label: 'Hover', render: <div className="w-40"><NavItem icon={<Rocket size={14} />} label="Deployments" className="bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]" /></div> },
      { label: 'Active', render: <div className="w-40 pl-1"><NavItem icon={<Rocket size={14} />} label="Deployments" active /></div> },
      { label: 'Focus', render: <div className="w-40"><NavItem icon={<Rocket size={14} />} label="Deployments" className="outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]" /></div> },
      { label: 'With count', render: <div className="w-40"><NavItem icon={<Rocket size={14} />} label="Deployments" count={3} /></div> },
      { label: 'Nested', render: <div className="w-40"><NavItem label="us-east-1" depth={1} /></div> },
      { label: 'Compact', note: '28px row', render: <div className="w-40"><NavItem icon={<Rocket size={14} />} label="Deployments" compact /></div> },
      { label: 'Group header', render: <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Workspace</span> },
      { label: 'Collapsed group', render: <span className="inline-flex items-center gap-1.5 text-overline uppercase text-[var(--ds-fg-muted)]"><ChevronRight size={11} /> Workspace</span> },
      { label: 'Rail', render: <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-selected)] text-[var(--ds-accent-text)]"><Rocket size={14} /></span> },
      { label: 'Resize handle', render: <span className="block h-8 w-px bg-[var(--ds-accent)]" /> },
      { label: 'Truncated', render: <div className="w-28"><NavItem icon={<Rocket size={14} />} label="A very long destination name" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="flex h-[18rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
        <SidebarDemo width={240} />
        <div className="w-40 bg-[var(--ds-canvas)]" />
      </div>
    ),
    caption:
      'Brand row, scrollable nav with two collapsible groups, and a pinned account row. Only the nav scrolls.',
    parts: [
      {
        n: 1,
        label: 'Width',
        value: '268px default, 208–400 range',
        kind: 'size',
        note: 'Holds a two-word label, a 14px icon and a count badge without truncating. Below 208px labels start clipping; above 400px it competes with the content.',
      },
      {
        n: 2,
        label: 'Row height',
        value: '32px (28px compact)',
        kind: 'size',
        note: 'Denser than a button, because a sidebar is scanned vertically as a list rather than acted on as a control.',
      },
      {
        n: 3,
        label: 'Active marker',
        value: '2px bar + tint',
        kind: 'color',
        note: 'A bar rather than a border, so the row’s box never changes and no label shifts by a pixel when the active item moves.',
      },
      {
        n: 4,
        label: 'Indentation',
        value: '14px per level',
        kind: 'space',
        note: 'Enough to read as nesting, small enough that a second level does not push the label off the edge. There is no third level.',
      },
      {
        n: 5,
        label: 'Group header',
        value: '11px uppercase, muted',
        kind: 'type',
        note: 'Deliberately quiet. It is a divider with a name, not a destination — and it must not compete with the items beneath it.',
      },
      {
        n: 6,
        label: 'Pinned account row',
        value: 'Bottom, above the fold',
        kind: 'space',
        note: 'Outside the scroll container, so it is always reachable regardless of how long the nav gets.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Sidebar background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Right edge, section dividers' },
    { category: 'color', token: '--ds-layer-selected', usedFor: 'Active row tint' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover' },
    { category: 'color', token: '--ds-accent', usedFor: 'Active marker bar, resize handle on hover' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Inactive labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Icons and group headers' },
    { category: 'spacing', token: 'width', value: '208 / 268 / 400px', usedFor: 'Min, default, max' },
    { category: 'spacing', token: 'row height', value: '32 / 28px', usedFor: 'Default and compact' },
    { category: 'spacing', token: 'indent', value: '14px per level', usedFor: 'Nesting' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Row corners' },
    { category: 'motion', token: 'duration', value: '100–160ms', usedFor: 'Hover and group expand' },
  ],

  sizes: [
    { name: 'Rail', minWidth: '56px', height: '36px rows', use: 'Icon only, with a tooltip. When horizontal space is scarce but destinations must stay visible.' },
    { name: 'Minimum', minWidth: '208px', use: 'The floor. Below this, two-word labels truncate.' },
    { name: 'Default', minWidth: '268px', height: '32px rows', use: 'Icon, label and count with no truncation.' },
    { name: 'Maximum', maxWidth: '400px', use: 'For long user-generated names. Past this it competes with the content.' },
    { name: 'Compact rows', height: '28px', use: 'Twelve or more destinations, or a dense internal tool.' },
    { name: 'Handle', minWidth: '9px hit area', use: '1px visually. The extra 8px is what makes it grabbable.' },
  ],

  do: [
    {
      title: 'Stop at two levels',
      why: 'Group headings and items. A third level makes the sidebar a tree, and a tree is navigated rather than learned — which throws away the positional memory that makes a sidebar worth its 268px.',
      render: (
        <div className="w-44">
          <span className="px-2 text-overline uppercase text-[var(--ds-fg-muted)]">Build</span>
          <NavItem icon={<Rocket size={14} />} label="Deployments" active />
          <NavItem icon={<Activity size={14} />} label="Monitoring" />
        </div>
      ),
    },
    {
      title: 'Persist width and collapse state',
      why: 'A sidebar that resets on every visit makes the resize handle pointless. Store it per user, not per session.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          localStorage: sidebar-width, collapsed-groups
        </code>
      ),
    },
    {
      title: 'Give the handle a real hit area',
      why: 'A 1px target is unhittable. Nine pixels of transparent padding on either side makes it easy without changing how the divider looks — Fitts’ Law for free.',
      render: (
        <div className="flex h-16 items-stretch">
          <div className="w-24 rounded-l-[var(--radius-md)] bg-[var(--ds-surface)]" />
          <div className="group relative w-[9px] cursor-col-resize">
            <span className="absolute inset-y-0 left-1 w-px bg-[var(--ds-border-subtle)] transition-colors group-hover:bg-[var(--ds-accent)]" />
          </div>
          <div className="flex-1 rounded-r-[var(--radius-md)] bg-[var(--ds-canvas)]" />
        </div>
      ),
    },
    {
      title: 'Pin the account row outside the scroll',
      why: 'A sidebar with twenty destinations scrolls. The account and settings must not scroll out of reach — they are the two things users go looking for when everything else has failed.',
      render: (
        <div className="w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <div className="h-16 overflow-y-auto p-1">
            {GROUPS[0].items.map((i) => (
              <NavItem key={i.id} icon={i.icon} label={i.label} compact />
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-[var(--ds-border-subtle)] p-2">
            <Avatar name="Ada Lovelace" size="xs" />
            <span className="truncate text-caption text-[var(--ds-fg-secondary)]">Ada Lovelace</span>
          </div>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not build a three-level tree',
      why: 'By the third level the user is exploring rather than navigating, and the indentation has eaten most of the label width.',
      render: (
        <div className="w-44">
          <NavItem label="Workspace" />
          <NavItem label="Production" depth={1} />
          <NavItem label="api-gateway" depth={2} />
          <NavItem label="us-east-1" depth={3} />
        </div>
      ),
    },
    {
      title: 'Do not hide the primary action in the sidebar',
      why: 'The sidebar is for destinations. A "New project" button buried among navigation rows is discovered late, and it makes every row around it ambiguous.',
      render: (
        <div className="w-44">
          <NavItem icon={<Rocket size={14} />} label="Deployments" />
          <NavItem icon={<Rocket size={14} />} label="+ New deployment" />
          <NavItem icon={<Activity size={14} />} label="Monitoring" />
        </div>
      ),
    },
    {
      title: 'Do not auto-collapse groups the user opened',
      why: 'An accordion that closes one group when another opens fights the user. Their expansion state is a preference, and it should persist.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          open Workspace → Build closes → open Build → Workspace closes
        </span>
      ),
    },
    {
      title: 'Do not use an icon rail with unfamiliar icons',
      why: 'A rail only works when every glyph is already learned. For anything ambiguous it becomes a row of unlabelled buttons and the user hovers each one.',
      render: (
        <div className="flex w-14 flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
          {[Activity, CreditCard, Settings, Users].map((Icon, i) => (
            <span key={i} className="grid h-9 w-9 place-items-center text-[var(--ds-fg-muted)]">
              <Icon size={14} />
            </span>
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Inactive labels use --ds-fg-secondary at 7.6:1. Muted would be too faint for a list this dense.',
      'The active marker must reach 3:1 against the sidebar background — it is the primary indicator of position.',
      'The right edge must reach 3:1 against both surfaces, or the sidebar and the content merge visually.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the nav. Each destination is a stop unless roving focus is implemented.' },
      { keys: '↑ / ↓', does: 'Moves between destinations without leaving the nav.' },
      { keys: 'Enter', does: 'Navigates.' },
      { keys: '← / →', does: 'Collapses and expands a group when focus is on its header.' },
      { keys: '⌘B', does: 'Toggles the whole sidebar.' },
      { keys: 'Arrows on the handle', does: 'Resizes by 16px. Home resets to the default.' },
    ],
    aria: [
      { attr: '<nav aria-label="Main">', on: 'The nav element', note: 'A named landmark. A page with several navs needs several distinct labels.' },
      { attr: 'aria-current="page"', on: 'The active item', note: 'The value is "page". This is what tells a screen reader where the user is.' },
      { attr: 'aria-expanded + aria-controls', on: 'Group headers', note: 'On the header button, pointing at the group container.' },
      { attr: 'role="separator"', on: 'The resize handle', note: 'With aria-orientation="vertical", aria-valuenow, valuemin and valuemax.' },
      { attr: 'aria-label', on: 'Rail buttons', note: 'Required. A rail is a column of icon-only buttons and needs a name on every one.' },
      { attr: 'title', on: 'Truncated labels', note: 'So the full destination name is available on hover.' },
    ],
    focus:
      'The active item must be visible when the sidebar scrolls. Scroll it into view on route change, or a user deep in a long nav loses their position on every navigation.',
    screenReader: [
      'Groups should be real lists so the count is announced: "Build, list of 3 items".',
      'aria-current="page" is what turns a row of links into a location indicator. Without it there is no way to know which one is active.',
      'The skip link in the top bar must jump past the sidebar as well. Tabbing through twenty destinations to reach the content is a real barrier.',
    ],
    touch:
      'Below 1024px the sidebar becomes a drawer. Rows are 32px on pointer and expand to 44px on coarse pointers; the resize handle is hidden entirely on touch, where it is unusable.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `<aside style={{ width }} className="flex h-dvh flex-col border-r border-line-subtle bg-surface">
  <BrandRow />

  <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto p-2">
    {groups.map((g) => (
      <section key={g.id}>
        <button
          aria-expanded={!collapsed.includes(g.id)}
          aria-controls={'group-' + g.id}
          onClick={() => toggleGroup(g.id)}
        >
          <ChevronRight className={!collapsed.includes(g.id) ? 'rotate-90' : ''} />
          {g.title}
        </button>

        <ul id={'group-' + g.id} hidden={collapsed.includes(g.id)}>
          {g.items.map((item) => (
            <li key={item.id}>
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                count={item.count}
                active={item.id === currentId}
              />
            </li>
          ))}
        </ul>
      </section>
    ))}
  </nav>

  <AccountRow />          {/* outside the scroll container */}

  <ResizeHandle
    value={width}
    min={208}
    max={400}
    onChange={setWidth}
    onReset={() => setWidth(268)}
  />
</aside>

// Scroll the active item into view on navigation
useEffect(() => {
  navRef.current
    ?.querySelector('[aria-current="page"]')
    ?.scrollIntoView({ block: 'nearest' })
}, [currentId])`,
    },
    css: {
      lang: 'css',
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
  color: var(--ds-fg-secondary);
  transition: background-color 100ms var(--ease-standard);
}

.ds-nav-item:hover { background: var(--ds-layer-hover); color: var(--ds-fg); }

/* Tint plus a marker. The marker is absolutely positioned so the row's
   box never changes and no label shifts when the active item moves. */
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

/* 1px visually, 9px to grab */
.ds-resize-handle {
  position: absolute;
  inset-block: 0;
  inset-inline-end: -4px;
  inline-size: 9px;
  cursor: col-resize;
  touch-action: none;
}
.ds-resize-handle::after {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline-start: 4px;
  inline-size: 1px;
  background: transparent;
  transition: background 120ms var(--ease-standard);
}
.ds-resize-handle:hover::after { background: var(--ds-accent); }

@media (pointer: coarse) {
  .ds-resize-handle { display: none; }
  .ds-nav-item { block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'NavItem',
        props: [
          { name: 'label', type: 'ReactNode', required: true, description: 'Truncates with an ellipsis. Add a title for the full name.' },
          { name: 'icon', type: 'ReactNode', description: '14px. Muted at rest, accent when active.' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Sets aria-current="page" and shows the marker.' },
          { name: 'count', type: 'number', description: 'Right-aligned count badge.' },
          { name: 'depth', type: 'number', default: '0', description: 'Indent level. 0 or 1 only — there is no third level.' },
          { name: 'compact', type: 'boolean', default: 'false', description: '28px rows for dense navigation.' },
          { name: 'href', type: 'string', description: 'Renders an anchor instead of a button. Prefer it — links support middle-click and open-in-new-tab.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order destinations by frequency, and never reorder them dynamically. Users navigate by position within a week, and a nav that rearranges itself destroys that.',
      'Render nav items as real links with href. A button cannot be middle-clicked, opened in a new tab, or copied — and users do all three constantly.',
      'A count badge should only appear when the count is actionable. "Deployments 1,204" is noise; "Deployments 3" where 3 means "needs review" is a call to action.',
      'If the sidebar needs a search box, it has too many destinations. Fix the information architecture before adding a filter to the navigation.',
    ],
    performance: [
      'The sidebar renders on every route. Memoise it and keep route state out of it, or every navigation re-renders the whole nav.',
      'Resize with a pointermove listener that writes a CSS variable, not React state. State updates on every mousemove drop frames on a large tree.',
      'Prefetch the destination on hover. Sidebar links are the most predictable navigation in the product.',
      'For a very long nav, use content-visibility: auto on collapsed groups so their contents are not laid out at all.',
    ],
    mistakes: [
      'Three or more levels of nesting, which turns navigation into exploration.',
      'Not persisting the width, so the resize handle is decorative.',
      'Using buttons instead of links, breaking middle-click, open-in-new-tab and copy-link.',
      'A border for the active state instead of an absolutely positioned marker, so every label shifts by a pixel when the active item changes.',
      'Forgetting to scroll the active item into view, so a user deep in a long nav loses their place on every navigation.',
    ],
    realWorld: [
      'The sidebar is the clearest statement of what a product is. If the list does not read as a coherent product, the information architecture is the problem, not the component.',
      'Track navigation frequency per destination. Anything under 1% either belongs in a settings page or should not exist.',
      'When teams argue about sidebar ordering, the answer is usage data. It ends the argument in a meeting rather than a redesign.',
      'Resizable sidebars are used by a small minority of users, but that minority is disproportionately your power users — and they notice its absence immediately.',
    ],
  },
})
