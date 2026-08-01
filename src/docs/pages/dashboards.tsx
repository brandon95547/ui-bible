import * as React from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Filter,
  Hash,
  Inbox,
  LayoutGrid,
  Plus,
  Send,
  Settings,
  Users,
} from 'lucide-react'
import { Panel, Stat } from '@/ui/Surface'
import { Badge } from '@/ui/Display'
import { Avatar, AvatarStack, Meter } from '@/ui/Display'
import { Button, IconButton } from '@/ui/Button'
import { SearchInput, TextInput } from '@/ui/Input'
import { NavItem } from '@/ui/Navigation'
import { Switch } from '@/ui/Toggle'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   A SHELL, IN THE ABSTRACT
   Every dashboard in this page is the same three regions in a different
   arrangement. Drawing them as one component keeps that honest.
   ======================================================================== */

function Shell({
  nav,
  bar,
  children,
  height = '19rem',
}: {
  nav?: React.ReactNode
  bar?: React.ReactNode
  children: React.ReactNode
  height?: string
}) {
  return (
    <div
      className="flex w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]"
      style={{ height }}
    >
      {nav && (
        <aside className="flex w-[9.5rem] shrink-0 flex-col gap-0.5 border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2">
          {nav}
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {bar && (
          <header className="flex shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2">
            {bar}
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </div>
  )
}

const NAV = [
  { icon: <Activity size={14} />, label: 'Overview' },
  { icon: <Users size={14} />, label: 'Customers' },
  { icon: <Inbox size={14} />, label: 'Inbox' },
  { icon: <LayoutGrid size={14} />, label: 'Projects' },
  { icon: <Settings size={14} />, label: 'Settings' },
]

function Nav({ active = 0 }: { active?: number }) {
  return (
    <>
      {NAV.map((n, i) => (
        <NavItem key={n.label} icon={n.icon} label={n.label} active={i === active} compact />
      ))}
    </>
  )
}

/* -- 1. Analytics ---------------------------------------------------------- */

const KPIS = [
  { label: 'Revenue', value: '$48.2k', delta: 12.4, spark: [4, 6, 5, 8, 7, 11, 13] },
  { label: 'Active users', value: '2,847', delta: 3.1, spark: [8, 7, 9, 9, 11, 10, 12] },
  { label: 'Error rate', value: '0.42%', delta: -18, spark: [9, 8, 8, 6, 5, 4, 3] },
  { label: 'p95 latency', value: '284ms', delta: 5.8, spark: [4, 5, 5, 6, 6, 7, 8] },
  { label: 'Signups', value: '312', delta: 22, spark: [3, 4, 6, 6, 8, 9, 12] },
  { label: 'Churn', value: '1.9%', delta: -4, spark: [7, 7, 6, 6, 5, 5, 4] },
]

function FakeChart({ bars = 14, tone = 'accent' }: { bars?: number; tone?: 'accent' | 'muted' }) {
  const heights = React.useMemo(
    () => Array.from({ length: bars }, (_, i) => 30 + ((i * 37) % 62)),
    [bars],
  )
  return (
    <div className="flex h-full items-end gap-1">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`flex-1 rounded-[2px] ${
            tone === 'accent' ? 'bg-[var(--ds-accent)]' : 'bg-[var(--ds-border-strong)]'
          }`}
          style={{ height: `${h}%`, opacity: tone === 'accent' ? 0.35 + (h / 100) * 0.65 : 1 }}
        />
      ))}
    </div>
  )
}

function AnalyticsShell({ kpis = 4, dense }: { kpis?: number; dense?: boolean }) {
  return (
    <Shell
      nav={<Nav />}
      bar={
        <>
          <span className="text-label text-[var(--ds-fg)]">Overview</span>
          <span className="flex-1" />
          <Badge tone="neutral" variant="subtle">
            Last 7 days
          </Badge>
          <IconButton label="Alerts" icon={<Bell />} size="sm" variant="text" />
        </>
      }
      height="21rem"
    >
      <Stack gap={dense ? 'sm' : 'md'}>
        <div
          className={`grid ${dense ? 'gap-2' : 'gap-3'}`}
          style={{ gridTemplateColumns: `repeat(${Math.min(kpis, 3)}, minmax(0, 1fr))` }}
        >
          {KPIS.slice(0, kpis).map((k) => (
            <Stat
              key={k.label}
              label={k.label}
              value={k.value}
              delta={k.delta}
              spark={k.spark}
              className={dense ? 'p-2.5' : undefined}
            />
          ))}
        </div>
        <Panel title="Requests per minute" description="All regions" bodyClassName="h-24 p-3">
          <FakeChart />
        </Panel>
      </Stack>
    </Shell>
  )
}

/* -- 2. CRM / queue -------------------------------------------------------- */

const LEADS = [
  { name: 'Ada Lovelace', co: 'Analytical Engines', stage: 'Qualified', value: '$12,400' },
  { name: 'Grace Hopper', co: 'Compiler Co', stage: 'Proposal', value: '$48,000' },
  { name: 'Alan Turing', co: 'Bletchley Ltd', stage: 'Negotiation', value: '$31,250' },
  { name: 'Katherine Johnson', co: 'Orbital Systems', stage: 'Qualified', value: '$8,900' },
]

function CrmShell() {
  const [sel, setSel] = React.useState(1)
  return (
    <Shell
      nav={<Nav active={1} />}
      bar={
        <>
          <SearchInput size="sm" placeholder="Search leads…" className="max-w-[12rem]" />
          <Button size="sm" variant="outlined" startIcon={<Filter size={13} />}>
            Filters
          </Button>
          <span className="flex-1" />
          <Button size="sm" startIcon={<Plus size={13} />}>
            New lead
          </Button>
        </>
      }
    >
      <div className="flex h-full min-h-0 gap-3">
        <div className="flex w-1/2 min-w-0 flex-col gap-1 overflow-y-auto">
          {LEADS.map((l, i) => (
            <button
              key={l.name}
              type="button"
              onClick={() => setSel(i)}
              className={`flex items-center gap-2.5 rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition-colors ${
                sel === i
                  ? 'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)]'
                  : 'border-transparent hover:bg-[var(--ds-layer-hover)]'
              }`}
            >
              <Avatar name={l.name} size="sm" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-label text-[var(--ds-fg)]">{l.name}</span>
                <span className="truncate text-caption text-[var(--ds-fg-muted)]">{l.co}</span>
              </span>
              <span className="ml-auto font-mono text-caption tabular-nums text-[var(--ds-fg-secondary)]">
                {l.value}
              </span>
            </button>
          ))}
        </div>
        <div className="flex w-1/2 min-w-0 flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
          <Row gap="sm">
            <Avatar name={LEADS[sel].name} />
            <Stack gap="xs">
              <span className="text-label text-[var(--ds-fg)]">{LEADS[sel].name}</span>
              <span className="text-caption text-[var(--ds-fg-muted)]">{LEADS[sel].co}</span>
            </Stack>
          </Row>
          <Badge tone="accent" variant="subtle">
            {LEADS[sel].stage}
          </Badge>
          <Meter value={sel === 1 ? 72 : 40} label="Deal confidence" />
          <div className="mt-auto flex gap-1.5">
            <Button size="sm" variant="outlined" className="flex-1">
              Log call
            </Button>
            <Button size="sm" className="flex-1">
              Advance
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/* -- 3. Admin -------------------------------------------------------------- */

const ROWS = [
  { id: 'usr_8241', email: 'ada@analytical.co', role: 'Owner', status: 'Active' },
  { id: 'usr_9930', email: 'grace@compiler.co', role: 'Admin', status: 'Active' },
  { id: 'usr_1174', email: 'alan@bletchley.uk', role: 'Member', status: 'Invited' },
  { id: 'usr_5502', email: 'kj@orbital.io', role: 'Member', status: 'Suspended' },
]

function AdminShell() {
  return (
    <Shell
      nav={<Nav active={4} />}
      bar={
        <>
          <span className="text-label text-[var(--ds-fg)]">Users</span>
          <Badge tone="neutral" variant="subtle">
            4
          </Badge>
          <span className="flex-1" />
          <SearchInput size="sm" placeholder="Filter…" className="max-w-[9rem]" />
        </>
      }
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
        <table className="w-full text-left">
          <thead className="bg-[var(--ds-surface-inset)]">
            <tr>
              {['ID', 'Email', 'Role', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-2.5 py-1.5 text-overline uppercase text-[var(--ds-fg-muted)]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id} className="border-t border-[var(--ds-border-subtle)]">
                <td className="px-2.5 py-1.5 font-mono text-caption text-[var(--ds-fg-muted)]">
                  {r.id}
                </td>
                <td className="px-2.5 py-1.5 text-caption text-[var(--ds-fg)]">{r.email}</td>
                <td className="px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]">
                  {r.role}
                </td>
                <td className="px-2.5 py-1.5">
                  <Badge
                    tone={
                      r.status === 'Active'
                        ? 'success'
                        : r.status === 'Invited'
                          ? 'warning'
                          : 'danger'
                    }
                    variant="subtle"
                    dot
                  >
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  )
}

/* -- 4. Kanban ------------------------------------------------------------- */

const COLUMNS = [
  { title: 'Backlog', cards: ['Rate limiting', 'Audit log export', 'SAML'] },
  { title: 'In progress', cards: ['Billing webhooks', 'Search relevance'] },
  { title: 'Review', cards: ['Dark theme audit'] },
  { title: 'Done', cards: ['Session expiry', 'CSV import'] },
]

function KanbanShell() {
  return (
    <Shell
      nav={<Nav active={3} />}
      bar={
        <>
          <span className="text-label text-[var(--ds-fg)]">Sprint 14</span>
          <span className="flex-1" />
          <AvatarStack
            people={[{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }, { name: 'Alan Turing' }]}
          />
        </>
      }
    >
      <div className="flex h-full gap-2 overflow-x-auto">
        {COLUMNS.map((c) => (
          <div
            key={c.title}
            className="flex w-[9rem] shrink-0 flex-col gap-1.5 rounded-[var(--radius-lg)] bg-[var(--ds-surface-inset)] p-2"
          >
            <Row className="justify-between">
              <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{c.title}</span>
              <span className="font-mono text-[10px] text-[var(--ds-fg-disabled)]">
                {c.cards.length}
              </span>
            </Row>
            {c.cards.map((card) => (
              <div
                key={card}
                className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2 text-caption text-[var(--ds-fg)] shadow-e1"
              >
                {card}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Shell>
  )
}

/* -- 5. Chat --------------------------------------------------------------- */

const CHANNELS = ['general', 'incidents', 'deploys', 'design']
const MESSAGES = [
  { who: 'Grace Hopper', text: 'p95 is back under 300ms after the index change.', mine: false },
  { who: 'You', text: 'Confirmed on the dashboard. Closing the incident.', mine: true },
  { who: 'Alan Turing', text: 'I will write the postmortem this afternoon.', mine: false },
]

function ChatShell() {
  return (
    <div className="flex h-[19rem] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      <aside className="flex w-[8.5rem] shrink-0 flex-col gap-0.5 border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2">
        {CHANNELS.map((c, i) => (
          <NavItem key={c} icon={<Hash size={13} />} label={c} active={i === 1} compact />
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2">
          <Hash size={14} className="text-[var(--ds-fg-muted)]" />
          <span className="text-label text-[var(--ds-fg)]">incidents</span>
          <Badge tone="danger" variant="subtle" dot>
            Live
          </Badge>
        </header>
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-y-auto p-3">
          {MESSAGES.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
              {!m.mine && <Avatar name={m.who} size="sm" />}
              <div
                className={`max-w-[75%] rounded-[var(--radius-lg)] px-2.5 py-1.5 text-caption ${
                  m.mine
                    ? 'bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]'
                    : 'bg-[var(--ds-surface)] text-[var(--ds-fg)]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 border-t border-[var(--ds-border-subtle)] p-2">
          <TextInput size="sm" placeholder="Message #incidents" className="flex-1" />
          <IconButton label="Send" icon={<Send />} size="sm" />
        </div>
      </div>
    </div>
  )
}

/* -- 6. Settings ----------------------------------------------------------- */

const SECTIONS = ['Profile', 'Notifications', 'Security', 'Billing', 'API keys']

function SettingsShell() {
  const [sec, setSec] = React.useState(1)
  return (
    <Shell
      nav={
        <>
          <span className="px-2 py-1 text-overline uppercase text-[var(--ds-fg-muted)]">
            Settings
          </span>
          {SECTIONS.map((s, i) => (
            <NavItem key={s} label={s} active={i === sec} compact onClick={() => setSec(i)} />
          ))}
        </>
      }
    >
      <div className="mx-auto max-w-[26rem]">
        <Stack gap="md">
          <Stack gap="xs">
            <span className="text-h4 text-[var(--ds-fg)]">{SECTIONS[sec]}</span>
            <span className="text-caption text-[var(--ds-fg-muted)]">
              Changes save as you make them.
            </span>
          </Stack>
          <Switch checked onCheckedChange={() => {}} align="end" label="Weekly digest" />
          <Switch checked={false} onCheckedChange={() => {}} align="end" label="Mentions" />
          <Switch checked onCheckedChange={() => {}} align="end" label="Deploy failures" />
        </Stack>
      </div>
    </Shell>
  )
}

/* -- playground ------------------------------------------------------------ */

function Playground() {
  const [kpis, setKpis] = React.useState<'3' | '4' | '6' | '9'>('3')
  const [dense, setDense] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={360}
      center={false}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="KPI tiles">
            <KnobSelect value={kpis} onChange={setKpis} options={['3', '4', '6', '9'] as const} />
          </Knob>
          <KnobToggle checked={dense} onChange={setDense} label="Compact" />
        </div>
      }
      code={`<DashboardShell>
  <StatGrid>          {/* 3–6 tiles. Past six, nothing is primary. */}
    <Stat label="Revenue" value="$48.2k" delta={12.4} spark={…} />
    …
  </StatGrid>
  <Panel title="Requests per minute">
    <Chart … />
  </Panel>
</DashboardShell>`}
    >
      <Stack gap="md" className="w-full">
        <p className="text-caption text-[var(--ds-fg-muted)]">
          Push the tile count to nine. Nothing gets bigger, nothing gets smaller — everything simply
          becomes equally unimportant, which is the failure mode of most real dashboards.
        </p>
        <AnalyticsShell kpis={Number(kpis)} dense={dense} />
      </Stack>
    </PreviewStage>
  )
}

/* -- diagrams -------------------------------------------------------------- */

function ZoneDiagram() {
  return (
    <div className="relative h-[10rem] w-full max-w-[20rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {[
          'Primary',
          'Secondary',
          'Tertiary',
          'Secondary',
          'Detail',
          'Detail',
          'Tertiary',
          'Detail',
          'Rarely seen',
        ].map((l, i) => (
          <div
            key={i}
            className="flex items-center justify-center border border-[var(--ds-border-subtle)] text-[9px]"
            style={{
              background: `color-mix(in oklab, var(--ds-accent) ${Math.max(0, 26 - i * 3)}%, transparent)`,
              color: 'var(--ds-fg-secondary)',
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'dashboards',
    title: 'Dashboard Layouts',
    tagline:
      'Six shells that cover almost every product screen. The layout is not the hard part — deciding what deserves the top-left is.',
    keywords: [
      'analytics',
      'crm',
      'admin',
      'kanban',
      'chat',
      'settings',
      'layout',
      'shell',
      'kpi',
      'master detail',
    ],
  },

  overview: {
    purpose:
      'A dashboard answers one question at a glance — is everything all right? — and then supports drilling into whatever the answer turned out to be. This page covers the six shells that serve almost every product screen, and the layout decisions that make each of them readable.',
    whenToUse: [
      'Assembling a screen from components rather than designing a component.',
      'Choosing between a KPI grid, a master–detail queue, a table, a board, a conversation and a settings list — which is nearly always the real decision.',
      'Deciding what earns the top-left, how many tiles are too many, and where the navigation lives.',
    ],
    whenNotToUse: [
      {
        text: 'You need the specification of one part.',
        instead: 'the page for that part — Cards, Tables, Sidebar, Top Bar',
        to: '#/card',
      },
      {
        text: 'The screen has one job and one object.',
        instead: 'a page. Not everything needs a shell around it',
      },
      {
        text: 'The user is doing a task, not monitoring one.',
        instead: 'a form or a wizard. A dashboard is for looking, not for filling in',
        to: '#/form',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Every one of these shells is the same three regions.</strong> Persistent
          navigation, a context bar, and a content well. What changes is only what fills the well —
          tiles, a list beside a detail, a table, columns, a transcript, or a stack of settings.
          Recognising that is what stops a product growing six unrelated layouts.
        </p>
        <p>
          <strong>The top-left is the most expensive real estate you own.</strong> In a
          left-to-right layout the eye lands there first and works down and right, with attention
          falling off sharply. Whatever occupies it is what the product is claiming matters most, so
          it should be the metric someone would act on — not the one that is easiest to compute or
          the one that looks best in a demo.
        </p>
        <p>
          <strong>More tiles do not mean more information.</strong> Six equally sized KPI tiles have
          no primary; nine have no anything. If a number would not change what someone does today,
          it belongs on a detail page, not in the grid. The discipline is deletion, and the tile
          count is where it is most visibly missing.
        </p>
        <p>
          <strong>Density is a per-audience decision, not a global taste.</strong> Someone who lives
          in this screen for six hours a day wants more on it and will learn it; someone visiting
          weekly wants breathing room and labels. Ship a comfortable default and a compact toggle
          rather than arguing about which one is correct — both are, for different people.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'analytics',
        title: 'Analytics — monitoring',
        description:
          'KPI tiles above a chart. The user is asking "is anything wrong?", so the tiles carry a delta and a sparkline: the number alone cannot answer that.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <AnalyticsShell kpis={3} />
          </PreviewStage>
        ),
      },
      {
        id: 'crm',
        title: 'CRM — working a queue',
        description:
          'Master–detail. The list stays put while the detail changes, so the user never loses their place in a queue they are working through one item at a time.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <CrmShell />
          </PreviewStage>
        ),
      },
      {
        id: 'admin',
        title: 'Admin — managing records',
        description:
          'A table and a filter bar, and very little else. Admin screens are found by search and used by people who know exactly what they came for.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <AdminShell />
          </PreviewStage>
        ),
      },
      {
        id: 'kanban',
        title: 'Kanban — moving work through stages',
        description:
          'Columns are the state. The layout is the data model, which is why a board with eight columns is unreadable — nobody holds eight states in mind.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <KanbanShell />
          </PreviewStage>
        ),
      },
      {
        id: 'chat',
        title: 'Chat — conversation',
        description:
          'The only shell anchored to the bottom, because the newest message is the important one. The composer is pinned and the transcript scrolls above it.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ChatShell />
          </PreviewStage>
        ),
      },
      {
        id: 'settings',
        title: 'Settings — configuring',
        description:
          'A narrow column against a section list. No Save button: each control commits on change, because people flip one switch and leave.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <SettingsShell />
          </PreviewStage>
        ),
      },
      {
        id: 'zones',
        title: 'Where attention actually goes',
        description:
          'Attention falls off down and to the right. This is the map you are laying out against, whether or not you designed for it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <ZoneDiagram />
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Loading',
        render: (
          <span className="flex w-28 flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-2">
            <span className="h-2 w-10 rounded-[2px] bg-[var(--ds-surface-inset)]" />
            <span className="h-4 w-16 rounded-[2px] bg-[var(--ds-surface-inset)]" />
          </span>
        ),
      },
      { label: 'Healthy', render: <Stat label="Errors" value="0.42%" delta={-18} /> },
      { label: 'Degraded', render: <Stat label="p95" value="1.4s" delta={62} /> },
      {
        label: 'No data yet',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">Collecting…</span>,
      },
      {
        label: 'Stale',
        render: (
          <Badge tone="warning" variant="subtle" icon={<AlertTriangle size={11} />}>
            4m old
          </Badge>
        ),
      },
      { label: 'Live', render: <Badge tone="success" variant="subtle" dot>Live</Badge> },
      {
        label: 'Empty queue',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">Nothing to review</span>,
      },
      {
        label: 'Compact',
        render: <Stat label="Revenue" value="$48.2k" delta={12.4} className="p-2 w-28" />,
      },
    ],
  },

  anatomy: {
    render: <AnalyticsShell kpis={3} />,
    caption:
      'The analytics shell. Sidebar, context bar, content well — and inside the well, tiles above a chart, in descending order of how quickly someone needs the answer.',
    parts: [
      {
        n: 1,
        label: 'Sidebar',
        value: '240px, or 64px collapsed',
        kind: 'size',
        note: 'Persistent, so position becomes memory. It answers "where am I" as well as "where can I go", which is why a dashboard uses it rather than a top-level menu.',
      },
      {
        n: 2,
        label: 'Context bar',
        value: '52–56px',
        kind: 'size',
        note: 'What this screen is, and the controls that change what it shows — a date range, a filter, a search. Not global navigation, which lives in the sidebar.',
      },
      {
        n: 3,
        label: 'Content gutter',
        value: '20–24px',
        kind: 'space',
        note: 'Matches the panel padding inside, so a card at the edge does not look inset twice.',
      },
      {
        n: 4,
        label: 'KPI grid',
        value: '3–6 tiles, 12px gap',
        kind: 'space',
        note: 'Three to a row reads as a group; six reads as a wall. Past six, delete rather than shrink.',
      },
      {
        n: 5,
        label: 'Tile',
        value: 'label 12px, value 28px',
        kind: 'type',
        note: 'The number is the largest thing and the label the smallest, so the eye lands on the value and only then learns what it measures.',
      },
      {
        n: 6,
        label: 'Delta',
        value: 'sign + arrow + colour',
        kind: 'color',
        note: 'Three signals, because a bare number cannot say whether it is good. Never colour alone — down is good for error rate and bad for revenue.',
      },
      {
        n: 7,
        label: 'Sparkline',
        value: '~32px tall',
        kind: 'size',
        note: 'Shape, not precision. It exists to answer "is this normal?", which a single number cannot, and it needs no axes to do it.',
      },
      {
        n: 8,
        label: 'Panel',
        value: 'header + body',
        kind: 'shape',
        note: 'One idea per panel with a title that says what it is. A panel needing a legend to explain its own contents is two panels.',
      },
      {
        n: 9,
        label: 'Row rhythm',
        value: '16px between blocks',
        kind: 'space',
        note: 'Larger than the gap inside the tile grid, so the grid reads as one block rather than as loose tiles.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'sidebar width', value: '240px / 64px', usedFor: 'Persistent navigation' },
    { category: 'spacing', token: 'bar height', value: '52–56px', usedFor: 'Context bar' },
    { category: 'spacing', token: 'gutter', value: '20–24px', usedFor: 'Content inset' },
    { category: 'spacing', token: 'grid gap', value: '12px', usedFor: 'Between tiles' },
    { category: 'spacing', token: 'block gap', value: '16px', usedFor: 'Between sections' },
    { category: 'color', token: '--ds-canvas', usedFor: 'The well behind the panels' },
    { category: 'color', token: '--ds-surface', usedFor: 'Panels and tiles' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Panel edges and rules' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Positive delta' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Negative delta' },
    { category: 'typography', token: '--text-h2', value: '28px', usedFor: 'KPI values' },
    { category: 'radius', token: '--radius-xl', usedFor: 'Panels and tiles' },
  ],

  sizes: [
    { name: 'Sidebar', minWidth: '240px', use: 'Expanded. Label plus icon.' },
    { name: 'Sidebar, collapsed', minWidth: '64px', use: 'Icon only, with a tooltip. For screens people live in.' },
    { name: 'Context bar', height: '52–56px', padding: '0 20px', use: 'Title, filters, primary action.' },
    { name: 'Content gutter', padding: '20–24px', use: 'Matches panel padding.' },
    { name: 'KPI tile', height: '96–112px', padding: '16px', use: 'Label, value, delta, sparkline.' },
    { name: 'Tile grid', gap: '12px', use: 'Three or four per row. Six is the ceiling.' },
    { name: 'Chart panel', height: '240–320px', use: 'Tall enough to read a trend, short enough to keep the tiles visible.' },
    { name: 'Master list', minWidth: '20rem', maxWidth: '28rem', use: 'Master–detail. Below 20rem the rows truncate.' },
    { name: 'Kanban column', minWidth: '17rem', gap: '12px', use: 'Three to five columns. Eight is unreadable.' },
    { name: 'Settings column', maxWidth: '34rem', use: 'One column, same measure as a form.' },
  ],

  do: [
    {
      title: 'Put the most actionable number top-left',
      why: 'The eye lands there first and attention falls off down and right. Whatever sits there is what the product is claiming matters most.',
      render: <ZoneDiagram />,
    },
    {
      title: 'Give every number a comparison',
      why: 'A value on its own cannot be judged. "$48.2k" means nothing; "$48.2k, up 12.4% on last week" is a fact someone can act on.',
      render: <Stat label="Revenue" value="$48.2k" delta={12.4} deltaLabel="vs last week" />,
    },
    {
      title: 'Keep the navigation in one place',
      why: 'A persistent sidebar makes position into memory. Moving navigation between screens costs the user their map on every one.',
      render: (
        <span className="flex w-28 gap-1 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-1">
          <span className="h-10 w-6 rounded-[2px] bg-[var(--ds-accent-subtle)]" />
          <span className="h-10 flex-1 rounded-[2px] bg-[var(--ds-surface-inset)]" />
        </span>
      ),
    },
    {
      title: 'Offer a density toggle',
      why: 'Daily users want more on screen and will learn it; occasional users want space and labels. Both are right, so ship both rather than picking.',
      render: (
        <Row gap="sm">
          <Stat label="Revenue" value="$48.2k" className="w-24 p-2" />
          <Stat label="Revenue" value="$48.2k" delta={12.4} className="w-28" />
        </Row>
      ),
    },
    {
      title: 'Say when the data is from',
      why: 'A dashboard with no timestamp is trusted until it is silently wrong. "Updated 4m ago" is the difference between a stale number and a lie.',
      render: (
        <Badge tone="warning" variant="subtle" icon={<AlertTriangle size={11} />}>
          Updated 4m ago
        </Badge>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put nine tiles in the grid',
      why: 'Equal size means equal importance. Nine equally important things is the same as none, and the user has to do the prioritising you skipped.',
      render: (
        <span className="grid w-32 grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="h-6 rounded-[2px] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/30"
            />
          ))}
        </span>
      ),
    },
    {
      title: 'Do not make everything a chart',
      why: 'A single number is a chart of one point with more ink. Use a chart when the shape over time is the information, and a number when it is not.',
      render: (
        <span className="block h-12 w-28 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] p-1.5">
          <FakeChart bars={3} tone="muted" />
        </span>
      ),
    },
    {
      title: 'Do not auto-refresh under the cursor',
      why: 'A table that reorders while someone is reaching for a row makes them click the wrong thing. Refresh on a signal they control, or hold the update while they are interacting.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          rows reorder mid-click → wrong record opened
        </span>
      ),
    },
    {
      title: 'Do not show a metric nobody acts on',
      why: 'Total page views since launch is decoration. If no decision changes with the number, it is taking space from one that would.',
      render: (
        <Stat label="Lifetime page views" value="14,382,904" className="w-40 opacity-60" />
      ),
    },
    {
      title: 'Do not scatter navigation across shells',
      why: 'Tabs here, a sidebar there, a menu on the third screen. Each one is defensible alone and together they mean the user has no map.',
      render: (
        <Row gap="sm">
          <span className="h-8 w-10 rounded-[2px] border border-[var(--ds-danger-border)]" />
          <span className="h-8 w-10 rounded-[2px] border border-[var(--ds-danger-border)]" />
          <span className="h-8 w-10 rounded-[2px] border border-[var(--ds-danger-border)]" />
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '2.4.1', name: 'Bypass Blocks', level: 'A' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'Deltas must never rely on colour alone. Ours carries an arrow, a sign and a word, so red-green colour blindness — around one man in twelve — does not lose the meaning.',
      'Sparklines and chart fills are decorative and exempt, but any line carrying meaning on its own needs 3:1 against its background.',
      'Compact density shrinks padding, never type. A 10px label to save four pixels of height fails contrast at a glance even when it passes a ratio check.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through the landmarks in order: navigation, then the bar, then the content.' },
      { keys: 'Skip link', does: 'Jumps past the sidebar to the content. Without it, every screen starts with the same twelve links.' },
      { keys: '↑ ↓', does: 'Moves through a master list. Selection updates the detail without leaving the list.' },
      { keys: '/ or ⌘K', does: 'Focuses search or opens the command palette — the fastest route on a screen this dense.' },
    ],
    aria: [
      {
        attr: '<nav> <main> <aside>',
        on: 'The shell regions',
        note: 'Real landmarks, so a screen reader can jump between them. This is what makes a dense screen navigable at all.',
      },
      {
        attr: 'aria-live="polite"',
        on: 'Metrics that update',
        note: 'On the specific value, never the whole panel — a live region wrapping a grid re-reads all of it on every tick.',
      },
      {
        attr: 'aria-label',
        on: 'Each panel',
        note: 'Panels are sections. Naming them lets a screen-reader user skip to the one they want instead of hearing every tile.',
      },
      {
        attr: 'Sparkline',
        on: 'aria-hidden + text alternative',
        note: 'The shape means nothing read aloud. Hide it and let the value and delta carry the meaning.',
      },
      {
        attr: 'aria-current',
        on: 'The selected row in a master list',
        note: 'Selection drives the whole right-hand pane, so it has to be programmatically obvious which row it is.',
      },
    ],
    focus:
      'Selecting a row in a master–detail layout must not move focus into the detail pane — the user is working down a list and needs the arrow keys to keep working. Focus moves only when they act on the detail deliberately. Never let a background refresh steal or reset focus.',
    screenReader: [
      'A tile announces as "Revenue, $48.2 thousand, up 12.4 percent versus last week". The delta must be in the text, not only in the colour of an arrow.',
      'Give every panel a heading and keep the heading levels in order. A dashboard is where heading structure most often collapses into a dozen unrelated h3s.',
      'Announce refreshes politely and specifically. "Revenue updated" beats re-reading the entire grid on a thirty-second interval.',
      'A skip link past the sidebar is not optional here — the alternative is Tabbing through the same navigation on every screen.',
    ],
    touch:
      'These shells are desktop-first by definition. Below the tablet breakpoint the sidebar becomes a drawer, tiles go to one column, master–detail becomes list-then-page, and a kanban board becomes one column with a stage picker — not a horizontally scrolling board nobody can use one-handed.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Every shell here is the same three regions. Build it once.
function DashboardShell({ nav, bar, children }: ShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <nav aria-label="Primary" className="w-60 shrink-0 border-r">{nav}</nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="h-14 shrink-0 border-b">{bar}</header>
        {/* min-h-0 is what lets the well scroll instead of the page */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

// Analytics: tiles above a chart, in descending order of urgency
<DashboardShell nav={<Nav />} bar={<DateRange />}>
  <section aria-label="Key metrics" className="grid grid-cols-3 gap-3">
    <Stat label="Revenue" value="$48.2k" delta={12.4} spark={revenue} />
    <Stat label="Active users" value="2,847" delta={3.1} spark={users} />
    <Stat label="Error rate" value="0.42%" delta={-18} spark={errors} />
  </section>

  <Panel title="Requests per minute" description="All regions">
    <Chart data={rpm} />
  </Panel>
</DashboardShell>

// Master–detail: selection must NOT move focus into the detail pane,
// or arrow-keying down a queue stops working after the first row.
<div className="flex gap-4">
  <ul role="listbox" aria-label="Leads" onKeyDown={arrowKeys}>
    {leads.map((l) => (
      <li key={l.id} role="option" aria-selected={l.id === selected}>…</li>
    ))}
  </ul>
  <section aria-label="Lead detail">{detail}</section>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-shell {
  display: flex;
  block-size: 100dvh;
  overflow: hidden;          /* the well scrolls, never the page */
}

.ds-shell__nav { inline-size: 240px; flex: none; }
.ds-shell__nav[data-collapsed] { inline-size: 64px; }

.ds-shell__main {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;        /* without this, a wide table pushes the
                                sidebar off screen instead of scrolling */
  flex: 1;
}

.ds-shell__well {
  min-block-size: 0;         /* the flex-child rule that actually makes
                                overflow-y work inside a column */
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Tiles auto-fit, so the grid degrades by wrapping rather than by
   squeezing six tiles into an unreadable row. */
.ds-stat-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

/* Density is a data attribute on the shell, not a separate stylesheet. */
[data-density='compact'] .ds-stat { padding: 10px; }
[data-density='compact'] .ds-table td { padding-block: 4px; }

@media (max-width: 1023px) {
  .ds-shell__nav { display: none; }        /* becomes a drawer */
  .ds-stat-grid { grid-template-columns: 1fr; }
}`,
    },
    api: [
      {
        name: 'Stat',
        props: [
          { name: 'label', type: 'string', required: true, description: 'What the number measures. The smallest text in the tile.' },
          { name: 'value', type: 'ReactNode', required: true, description: 'The number. Largest thing in the tile, tabular figures so digits do not shift on update.' },
          { name: 'delta', type: 'number', description: 'Percentage change. Rendered with a sign, an arrow and a colour — three signals, never colour alone.' },
          { name: 'deltaLabel', type: 'string', description: 'What the delta is against. "vs last week" — without it the number is unjudgeable.' },
          { name: 'spark', type: 'number[]', description: 'Sparkline data. Shape, not precision; it answers "is this normal?".' },
        ],
      },
      {
        name: 'Panel',
        props: [
          { name: 'title', type: 'ReactNode', description: 'One idea per panel. If it needs a legend to explain itself, it is two panels.' },
          { name: 'description', type: 'ReactNode', description: 'One line of context under the title.' },
          { name: 'actions', type: 'ReactNode', description: 'Controls scoped to this panel only. Global controls belong in the context bar.' },
          { name: 'footer', type: 'ReactNode', description: 'A link to the full view, usually. Inset background.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the question each panel answers before you build it. A panel with no question is decoration, and this is the cheapest time to find that out.',
      'Order the tiles by how quickly someone needs the answer, not by category. Errors before revenue on an operations dashboard; the reverse on a business one.',
      'Make every tile a link to its own detail view. A number that raises a question and offers no way to pursue it is a dead end.',
      'Ship an empty state for every panel. New accounts see them all at once, and "No data yet" beats a chart of zeroes.',
      'One primary action per screen, in the context bar. Two competing buttons at the top of a dashboard is a decision nobody asked for.',
      'If the shell needs a horizontal scrollbar on a laptop, the layout has already failed — that is the width most of your users have.',
    ],
    performance: [
      'Virtualise any list past a few hundred rows. A CRM queue and an admin table both reach that quickly, and both feel broken before they look broken.',
      'Stagger polling across panels. Twelve panels refreshing on the same interval produces a synchronised stall every thirty seconds.',
      'Pause background refresh when the tab is hidden. A dashboard left open on a second monitor otherwise polls all day for nobody.',
      'Render tiles from cached values first and reconcile when the fetch lands. Perceived speed on this screen matters more than freshness by a second.',
      'Charts are the heaviest thing here. Load them below the tiles and let the numbers paint first.',
    ],
    mistakes: [
      'Nine equally sized tiles, so nothing is primary.',
      'Numbers with no comparison, which cannot be judged.',
      'Colour-only deltas, invisible to a significant share of users.',
      'Auto-refresh that reorders rows under the cursor.',
      'A different navigation pattern on every screen.',
      'No timestamp, so stale data is trusted until it is embarrassing.',
      'Charts where a single number would do, and single numbers where the trend was the point.',
      'A kanban board with eight columns, which nobody can hold in mind.',
    ],
    realWorld: [
      'Ask which decision each panel supports. The ones with no answer are usually the ones added because the data happened to be available.',
      'Watch what people actually click. Dashboards accumulate panels for years and almost never lose one; the click data is the only honest argument for deletion.',
      'The best dashboards are boring. If it is interesting, it is usually because something is wrong — which is exactly when it should be.',
      'Density complaints are audience complaints in disguise. The people asking for more on screen and the people asking for less are different people, and a toggle settles it.',
      'Master–detail beats a table with a modal almost every time. The user keeps their place in the queue, which is the entire job on a screen someone works through all day.',
    ],
  },
})
