import * as React from 'react'
import {
  Activity,
  BookImage,
  BookOpen,
  Braces,
  CircleCheck,
  CircleX,
  Clapperboard,
  Contrast,
  FilePlus2,
  FileText,
  Library,
  LifeBuoy,
  Link,
  LogOut,
  Pointer,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  SquareDashed,
  Info,
  Sun,
  TriangleAlert,
  Type,
  User,
  X,
  Zap,
} from 'lucide-react'
import { Badge, Chip, Meter } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Field, TextInput, Textarea } from '@/ui/Input'
import { NavItem, Tabs } from '@/ui/Navigation'
import { MenuList } from '@/ui/Overlay'
import { NativeSelect } from '@/ui/Select'
import { Stat } from '@/ui/Surface'
import { DataTable, type Column } from '@/ui/Table'
import { Checkbox, Switch } from '@/ui/Toggle'
import {
  BarScale,
  BoardCard,
  BoardColumn,
  Group,
  Groups,
  Ground,
  LevelTable,
  LevelTiles,
  Note,
  RadiusScale,
  SheetScope,
  SpacingScale,
  StateMatrix,
  Stage,
  Swatches,
  Tiles,
  TypeSpecimen,
  contrast,
} from '../framework/DesignSheet'
import { defineDoc } from '../framework/types'
import { BREAKPOINTS, DASHBOARD as D, PH, SPACING, TYPE_FLOOR, accentScope } from '../data/phansora-sheet'
import { AlertDialog, CostTag, PhButton, PhansoraSheet, stateCells } from './_phansora/parts'

/* ===========================================================================
   DESIGN SHEETS · PHANSORA DASHBOARD, SECOND EDITION

   The dashboard on one board, card by card as Phansora's own design sheet
   lays it out: colors, type and buttons; forms, spacing and navigation;
   elevation, surfaces, feedback and accessibility; then its dialogs and the
   panels a studio works in.

   Every component here is this Bible's own, inside the dashboard's scope
   (data/phansora-sheet.ts). Where Phansora draws a part the Bible has no
   component for — the credit bar, the drop zone, the plans — it is built here
   from the same tokens, as Phansora builds it.
   ======================================================================== */

const P = PH.dashboard
const B = D.buttons

/* -- Small live parts ------------------------------------------------------ */

function PageTabs() {
  const [tab, setTab] = React.useState('sources')
  return (
    <Tabs
      aria-label="Page tabs example"
      value={tab}
      onChange={setTab}
      tabs={[
        { value: 'sources', label: 'Sources' },
        { value: 'dossiers', label: 'Dossiers' },
        { value: 'settings', label: 'Settings' },
      ]}
    />
  )
}

function PillTabs() {
  const [tab, setTab] = React.useState('upload')
  return (
    <Tabs
      variant="pill"
      aria-label="Tabs in a card example"
      value={tab}
      onChange={setTab}
      tabs={[
        { value: 'upload', label: 'Upload' },
        { value: 'url', label: 'URL' },
        { value: 'paste', label: 'Paste' },
      ]}
    />
  )
}

function SwitchDemo({ label, initial, accent }: { label: string; initial: boolean; accent: string }) {
  const [on, setOn] = React.useState(initial)
  return (
    <SheetScope vars={accentScope(accent)}>
      <Switch checked={on} onCheckedChange={setOn} label={label} />
    </SheetScope>
  )
}

/** The dashboard home's "what to create": radios, drawn as chips. */
function CreateChips() {
  const [kind, setKind] = React.useState('video')
  const kinds = [
    { value: 'video', label: 'Video', icon: <Clapperboard /> },
    { value: 'book', label: 'Book', icon: <BookOpen /> },
    { value: 'research', label: 'Research', icon: <Library /> },
  ]
  return (
    <div role="radiogroup" aria-label="What to create" className="flex flex-wrap gap-2.5">
      {kinds.map((k) => (
        <Chip
          key={k.value}
          role="radio"
          aria-checked={kind === k.value}
          selected={kind === k.value}
          icon={k.icon}
          onClick={() => setKind(k.value)}
        >
          {k.label}
        </Chip>
      ))}
    </div>
  )
}

/** Text to Speech's speed: the browser's own range, in the primary. */
function SpeedSlider() {
  const [speed, setSpeed] = React.useState(1)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-caption text-[var(--ds-fg-secondary)]">
        <label htmlFor="ph-speed" className="font-medium">
          Slider
        </label>
        <span className="tabular-nums">{speed.toFixed(2)}×</span>
      </div>
      <input
        id="ph-speed"
        type="range"
        min={0.5}
        max={2}
        step={0.05}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: D.buttons.primary.rest.bg }}
      />
      <div className="flex items-center justify-between text-caption text-[var(--ds-fg-secondary)]">
        <span>Slower</span>
        <span>Faster</span>
      </div>
    </div>
  )
}

/** The current tab is underlined in the brand violet, where the Bible's would be neutral. */
const brandScope = accentScope(P.brand, P.brandText)

/* -- The usage table ------------------------------------------------------- */

interface UsageRow {
  title: string
  status: { label: string; tone: 'success' | 'warning' | 'danger' }
  credits: number
}

const ACTIVITY: UsageRow[] = [
  { title: 'Pier Nine', status: { label: 'Complete', tone: 'success' }, credits: 1200 },
  { title: 'chapter-04', status: { label: 'Queued', tone: 'warning' }, credits: 300 },
  { title: 'Ancient', status: { label: 'Failed', tone: 'danger' }, credits: 0 },
]

const ACTIVITY_COLUMNS: Column<UsageRow>[] = [
  { id: 'title', header: 'Title', cell: (r) => <span className="font-medium text-[var(--ds-fg)]">{r.title}</span> },
  {
    id: 'status',
    header: 'Status',
    cell: (r) => (
      <Badge tone={r.status.tone} dot>
        {r.status.label}
      </Badge>
    ),
  },
  { id: 'credits', header: 'Credits', align: 'right', numeric: true, cell: (r) => r.credits.toLocaleString('en-US') },
]

/* -- A plan in the upgrade dialog -------------------------------------------- */

function Plan({
  name,
  price,
  credits,
  perk,
  recommended,
}: {
  name: string
  price: number
  credits: number
  perk?: string
  recommended?: boolean
}) {
  const edge = recommended
    ? { borderColor: P.premiumEdge, boxShadow: `0 0 0 2px ${P.premiumRing}` }
    : { borderColor: D.levels[2].value }
  return (
    <div className="relative flex flex-col rounded-2xl border bg-[rgb(16_16_18/0.4)] p-5" style={edge}>
      {recommended && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-overline uppercase"
          style={{ backgroundColor: P.premiumEdge, color: P.onFill }}
        >
          Recommended
        </span>
      )}
      <p className="text-h3 text-[var(--ds-fg)]">{name}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-h1 text-[var(--ds-fg)]">${price}</span>
        <span className="text-body-sm font-medium text-[var(--ds-fg-secondary)]">/month</span>
      </div>
      <ul className="mt-5 flex flex-col gap-3 text-body-sm">
        <li className="text-[var(--ds-fg-secondary)]">
          <span className="font-medium text-[var(--ds-fg)]">{credits.toLocaleString('en-US')}</span> monthly credits
        </li>
        {perk && (
          <li className="flex items-start gap-2">
            <Sparkles size={16} className="mt-0.5 shrink-0" style={{ color: '#d5b653' }} aria-hidden />
            <span className="font-medium text-[var(--ds-fg)]">{perk}</span>
          </li>
        )}
      </ul>
      <PhButton v={recommended ? B.primary : B.neutral} fullWidth className="mt-6">
        Subscribe to {name}
      </PhButton>
    </div>
  )
}

/* -- The board -------------------------------------------------------------- */

const ratio = (fg: string) => `${contrast(fg, D.contrast.on).toFixed(1)}:1`

const DashboardBoard = ({ onNavigate }: { onNavigate: (id: string) => void }) => (
  <PhansoraSheet sheet="dashboard" onNavigate={onNavigate}>
    {/* 01 ─ Colors */}
    <BoardCard
      id="colors"
      n={1}
      title="Color System"
      lede="A monochrome interface with one brand hue. Status keeps its color because the color is the message."
      span={5}
      wide
    >
      {D.colors.map((row) => (
        <Swatches key={row.label} row={row} />
      ))}
    </BoardCard>

    {/* 02 ─ Typography */}
    <BoardCard id="type" n={2} title="Typography" lede={`Inter, one scale shared with the site. Nothing under ${TYPE_FLOOR}px.`} span={3}>
      <TypeSpecimen steps={D.type} />
    </BoardCard>

    {/* 03 ─ Buttons */}
    <BoardCard
      id="buttons"
      n={3}
      title="Buttons"
      lede="Suno's pill, in the dashboard's fills: hover lays a 4% wash over any of them. One primary per view."
      span={4}
    >
      <StateMatrix
        rows={[
          ...Object.values(B).map((v) => ({
            label: v.label,
            cells: stateCells((p) => (
              <PhButton v={v} {...p}>
                Button
              </PhButton>
            )),
          })),
          {
            label: 'Icon only',
            cells: stateCells((p) => (
              <PhButton v={B.neutral} iconOnly aria-label="Add" startIcon={<Plus />} {...p} />
            )),
          },
        ]}
      />
      <Groups>
        <Group label="Sizes">
          <div className="flex flex-wrap items-center gap-2.5">
            <PhButton v={B.neutral} size="xs">28</PhButton>
            <PhButton v={B.neutral} size="sm">32</PhButton>
            <PhButton v={B.neutral}>36</PhButton>
            <PhButton v={B.neutral} size="lg">44</PhButton>
          </div>
        </Group>
        <Group label="Working">
          <div className="flex flex-wrap items-center gap-2.5">
            <PhButton v={B.primary} loading>
              Generate
            </PhButton>
            <PhButton v={B.success} success>
              Saved
            </PhButton>
          </div>
        </Group>
      </Groups>
      <Group label="With a price">
        <div className="flex flex-wrap items-center gap-2.5">
          <CostTag color={P.credit}>1,200</CostTag>
          <PhButton v={B.primary} size="lg" startIcon={<Sparkles />}>
            Build Audio Course
          </PhButton>
        </div>
      </Group>
    </BoardCard>

    {/* 04 ─ Form controls */}
    <BoardCard
      id="forms"
      n={4}
      title="Form Controls"
      lede="Fields sit above every surface, so they read the same on a panel, a card or a dialog."
      span={4}
    >
      <Groups>
        <Field label="Text input" description="Shown in the header and on exports." htmlFor="ph-name">
          <TextInput id="ph-name" defaultValue="Ancient Knowledge" />
        </Field>
        <Field label="With an icon" htmlFor="ph-url">
          <TextInput id="ph-url" type="url" placeholder="https://example.com/article" startIcon={<Link />} />
        </Field>
        <Field label="Select" htmlFor="ph-voice">
          <NativeSelect
            id="ph-voice"
            options={[
              { value: 'warm', label: 'Narrator — warm' },
              { value: 'bright', label: 'Narrator — bright' },
            ]}
          />
        </Field>
        <Field label="Validation / error" status="error" message="That address does not look right." htmlFor="ph-email">
          <TextInput id="ph-email" type="email" defaultValue="you@example" status="error" />
        </Field>
      </Groups>
      <Field label="Textarea" optional counter={{ value: 0, max: 5000 }} htmlFor="ph-message">
        <Textarea id="ph-message" rows={2} placeholder="Describe the problem and what you expected." />
      </Field>
      <Groups>
        <Group label="Checkbox">
          <Checkbox label="Published" defaultChecked />
          <Checkbox label="Featured" />
        </Group>
        <Group label="Toggle switch">
          {/* On is Secondary: a switch that is on is a state, not another light-grey control. */}
          <SwitchDemo label="Enabled" initial accent={P.secondary} />
          <SwitchDemo label="Off" initial={false} accent={P.secondary} />
          <SwitchDemo label="Accent" initial accent={P.secondary} />
        </Group>
      </Groups>
      <Group label="Radio chips">
        <CreateChips />
      </Group>
      <SpeedSlider />
    </BoardCard>

    {/* 05 ─ Layout & spacing */}
    <BoardCard id="layout" n={5} title="Layout & Spacing" lede="Tailwind's 4px step, the corners in use, and the shell." span={3}>
      <Group label="Spacing scale (px)">
        <SpacingScale steps={SPACING} accent={D.accent} />
      </Group>
      <Group label="Corner radius">
        <RadiusScale radii={D.radii} />
        <Note>Menu rows 6 · buttons and fields 8 · boxes 12 · cards and dialogs 16 · pills full.</Note>
      </Group>
      <Group label="Sidebar">
        <BarScale
          accent={D.accent}
          rows={[
            { name: 'open', value: 256 },
            { name: 'fold', value: 80 },
            { name: 'drawer', value: 288 },
          ]}
        />
      </Group>
      <Group label="Breakpoints">
        <BarScale accent={D.accent} rows={BREAKPOINTS.slice(0, 4).map((b) => ({ name: b.name, value: b.px }))} />
        <Note>Tailwind's own. Below lg the sidebar becomes a drawer and columns stack.</Note>
      </Group>
    </BoardCard>

    {/* 06 ─ Navigation */}
    <BoardCard
      id="navigation"
      n={6}
      title="Navigation"
      lede="The current item is never marked by color alone: a filled row, an underline or a raised chip."
      span={5}
      wide
    >
      <div className="grid gap-[18px] sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <Group label="Sidebar">
          {/* The sidebar's current row is a filled capsule and carries no hue, so the
              accent bar and the accent icon the Bible's NavItem draws are neutral here. */}
          <SheetScope vars={accentScope('transparent', D.colors[3].swatches[0].value)}>
            <nav
              aria-label="Sidebar example"
              className="flex flex-col gap-3 rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-3 text-[var(--ds-fg-secondary)]"
            >
              {[
                {
                  group: 'Creative Studio',
                  items: [
                    { icon: <BookImage />, label: 'Talari Book Studio' },
                    { icon: <Clapperboard />, label: 'Narrava Studio' },
                  ],
                },
                {
                  group: 'Research & Discovery',
                  items: [
                    { icon: <Library />, label: 'Research Atlas', active: true },
                    { icon: <Sun />, label: 'Chrono Origin' },
                  ],
                },
                {
                  group: 'Platform',
                  items: [
                    { icon: <FileText />, label: 'Usage' },
                    { icon: <LifeBuoy />, label: 'Help & Support', count: 3 },
                  ],
                },
              ].map((g) => (
                <div key={g.group} className="flex flex-col gap-1.5">
                  <p className="px-2 text-overline uppercase">{g.group}</p>
                  <div className="flex flex-col gap-0.5">
                    {g.items.map((it) => (
                      <NavItem key={it.label} href="#navigation" {...it} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 border-t border-[var(--ds-border)] pt-3">
                {/* The sidebar's one call to action: primary-700 into primary-600, the dark label. */}
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-label font-semibold shadow-e3 transition-[filter] hover:brightness-110"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${P.ctaFrom}, ${B.primary.rest.bg})`,
                    color: P.onFill,
                  }}
                >
                  <span aria-hidden>★</span>
                  Upgrade Plan
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left hover:bg-[var(--ds-layer-hover)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-surface-raised)]">
                    <User size={16} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption font-medium text-[var(--ds-fg)]">Account</span>
                    <span className="block truncate text-caption">you@example.com</span>
                  </span>
                </button>
              </div>
            </nav>
          </SheetScope>
        </Group>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <Group label="Page tabs">
            <SheetScope vars={brandScope}>
              <PageTabs />
            </SheetScope>
          </Group>
          <Group label="Tabs in a card">
            {/* Phansora's selected pill is the primary fill with the dark label. */}
            <SheetScope vars={{ '--ds-surface-raised': B.primary.rest.bg, '--ds-fg': P.onFill }}>
              <PillTabs />
            </SheetScope>
          </Group>
          <Group label="Profile menu">
            <div
              role="menu"
              aria-label="Profile menu example"
              className="overflow-hidden rounded-2xl border border-[var(--ds-border)] py-2 shadow-[0_25px_50px_-12px_rgb(0_0_0/0.25)]"
              style={{ backgroundColor: P.elev3 }}
            >
              <a role="menuitem" href="#navigation" className="flex items-center gap-3 px-3 py-2 text-ui hover:bg-[var(--ds-layer-hover)]">
                <Settings size={16} className="text-[var(--ds-fg-secondary)]" aria-hidden />
                Settings
              </a>
              <a role="menuitem" href="#navigation" className="flex items-center gap-3 px-3 py-2 text-ui hover:bg-[var(--ds-layer-hover)]">
                <LogOut size={16} className="text-[var(--ds-fg-secondary)]" aria-hidden />
                Log out
              </a>
            </div>
          </Group>
          <Group label="Action menu">
            <div className="rounded-[var(--radius-md)] border border-[var(--ds-border)] p-1" style={{ backgroundColor: P.elev3 }}>
              <p className="px-3 pb-1 pt-1.5 text-caption font-medium text-[var(--ds-fg-secondary)]" aria-hidden>
                Download as
              </p>
              <MenuList
                label="Download as"
                items={[
                  { label: 'PDF report', icon: <FileText /> },
                  { label: 'Research data', icon: <Braces /> },
                ]}
              />
            </div>
          </Group>
        </div>
      </div>
    </BoardCard>

    {/* 07 ─ Surface elevation */}
    <BoardCard
      id="elevation"
      n={7}
      title="Surface Elevation"
      lede="Depth is lightness: whatever rests on a surface is one step lighter than it."
      span={5}
      wide
    >
      <LevelTiles levels={D.levels} />
      <Groups min={260}>
        <Group label="Elevation in practice">
          <div className="rounded-2xl border border-[var(--ds-border)] p-4" style={{ backgroundColor: D.levels[1].value }}>
            <p className="text-label-sm text-[var(--ds-fg)]">Card — level 1</p>
            <div className="mt-3 rounded-2xl border border-[var(--ds-border)] p-4" style={{ backgroundColor: D.levels[2].value }}>
              <p className="text-label-sm text-[var(--ds-fg)]">Lifted card — level 2</p>
              <div className="mt-3 rounded-xl border border-[var(--ds-border)] p-4" style={{ backgroundColor: D.levels[3].value }}>
                <p className="text-label-sm text-[var(--ds-fg)]">A box on it — level 3</p>
                <TextInput aria-label="Field" placeholder="A field — level 4" className="mt-3" />
              </div>
            </div>
          </div>
        </Group>
        <Group label="Elevation tokens">
          <LevelTable levels={D.levels.slice(0, 5)} shadows={D.shadows.slice(0, 2)} />
        </Group>
      </Groups>
      <Group label="Shadows">
        <Groups min={140}>
          {[
            { name: 'Card', note: 'shadow-e1 · a panel', level: 1, shadow: D.shadows[0].value },
            { name: 'Raised', note: 'shadow-e2 · lifted', level: 2, shadow: D.shadows[1].value },
            { name: 'Menu', note: 'shadow-2xl · overlay', level: 3, shadow: D.shadows[2].value },
          ].map((s) => (
            <div
              key={s.name}
              className="rounded-2xl border border-[var(--ds-border)] p-5"
              style={{ backgroundColor: D.levels[s.level].value, boxShadow: s.shadow }}
            >
              <p className="text-label-sm text-[var(--ds-fg)]">{s.name}</p>
              <Note>{s.note}</Note>
            </div>
          ))}
        </Groups>
      </Group>
    </BoardCard>

    {/* 08 ─ Surfaces & cards */}
    <BoardCard id="cards" n={8} title="Surfaces & Cards" lede="Panels, the tiles on them, a decision, a table and its labels." span={3}>
      <Group label="Card">
        <Ground>
          <div className="rounded-2xl border border-[var(--ds-border)] p-5" style={{ backgroundColor: D.levels[2].value, boxShadow: D.shadows[1].value }}>
            <Stat layout="leading" label="Total generations" value="1,284" icon={<Activity />} />
          </div>
        </Ground>
      </Group>
      <Group label="Modal">
        <Stage>
          <AlertDialog
            tone={D.alerts.error!}
            icon={<CircleX size={24} />}
            title="Delete project"
            message="This cannot be undone."
            cancel="Cancel"
            action="Delete"
          />
        </Stage>
      </Group>
      <Group label="Table">
        <div className="overflow-hidden rounded-2xl border border-[var(--ds-border)]" style={{ backgroundColor: D.levels[1].value }}>
          <DataTable columns={ACTIVITY_COLUMNS} rows={ACTIVITY} rowKey={(r) => r.title} caption="Recent activity example" />
        </div>
      </Group>
      <Group label="Status labels">
        <div className="flex flex-wrap gap-2">
          <Badge tone="success" dot>Complete</Badge>
          <Badge tone="warning" dot>Queued</Badge>
          <Badge tone="danger" dot>Failed</Badge>
          <Badge tone="info" dot>Info</Badge>
          <Badge size="sm">Small</Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-body-sm">
          <span className="text-[var(--ds-success-text)]">Saved</span>
          <span className="text-[var(--ds-warning-text)]">Running low</span>
          <span className="text-[var(--ds-danger-text)]">Upload failed</span>
          <span className="text-[var(--ds-info-text)]">Processing</span>
          <span className="text-[var(--ds-fg-muted)]">Draft</span>
        </div>
      </Group>
    </BoardCard>

    <BoardColumn span={4}>
      {/* 09 ─ Feedback & status */}
      <BoardCard id="status" n={9} title="Feedback & Status" lede="What a page says about money and work in progress.">
        <Group label="Banner">
          <Alert
            tone="warning"
            title="Not enough credits to generate"
            actions={
              <>
                <PhButton v={B.primary} size="sm" startIcon={<Zap />}>
                  Recharge
                </PhButton>
                <PhButton v={B.quiet} size="sm">
                  View usage
                </PhButton>
              </>
            }
          >
            This costs <strong className="font-medium">1,200</strong> and you have <strong className="font-medium">340</strong>.
          </Alert>
        </Group>
        <Group label="Progress & credits">
          <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--ds-border)] p-3.5">
            <div className="flex items-baseline justify-between gap-3 text-caption text-[var(--ds-fg-secondary)]">
              <span>Credits remaining</span>
              <span className="tabular-nums">17,600 of 26,000</span>
            </div>
            <Meter value={17600} max={26000} />
          </div>
          <Meter value={12} tone="warning" />
          <Note>Running low</Note>
        </Group>
      </BoardCard>

      {/* 10 ─ Accessibility & interaction */}
      <BoardCard id="accessibility" n={10} title="Accessibility & Interaction" lede="What every page gets without asking for it.">
        <Tiles
          tiles={[
            {
              icon: <Contrast />,
              title: 'Color contrast',
              text: `Text ${ratio(D.contrast.body)}, secondary ${ratio(D.contrast.muted)} on a card. AA asks 4.5:1.`,
            },
            { icon: <SquareDashed />, title: 'Focus states', text: 'A 2px ring at 2px offset on buttons, and a ring on fields, from the keyboard only.' },
            { icon: <Pointer />, title: 'Touch targets', text: 'On a touch screen every button answers across 44px, a 28px toolbar button too.' },
            { icon: <Activity />, title: 'Reduced motion', text: 'The hover wash stops fading in and switches stop sliding.' },
            { icon: <Type />, title: 'Type floor', text: `No text under ${TYPE_FLOOR}px — the caption, the scale's smallest step.` },
          ]}
        />
      </BoardCard>
    </BoardColumn>

    {/* 11 ─ Dialogs */}
    <BoardCard
      id="dialogs"
      n={11}
      title="Dialogs"
      lede="One component for every yes or no — the last button is the action — and one for anything you fill in."
      span={7}
    >
      <Groups>
        <Group label="Alert · info">
          <Stage>
            <AlertDialog tone={D.alerts.info!} icon={<Info size={24} />} title="Heads up" message="Your export is still rendering." action="OK" />
          </Stage>
        </Group>
        <Group label="Alert · success">
          <Stage>
            <AlertDialog tone={D.alerts.success!} icon={<CircleCheck size={24} />} title="Course ready" message="All 8 sessions are saved." action="Done" />
          </Stage>
        </Group>
        <Group label="Confirm · warning">
          <Stage>
            <AlertDialog
              tone={D.alerts.warning!}
              icon={<TriangleAlert size={24} />}
              title="Leave without saving?"
              message="Your changes have not been saved."
              cancel="Stay"
              action="Leave"
            />
          </Stage>
        </Group>
      </Groups>
      <Group label="Form dialog">
        <Stage>
          <div
            role="dialog"
            aria-label="New text"
            className="flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-[0_25px_60px_rgb(0_0_0/0.5)]"
          >
            <div className="flex items-center gap-3 border-b border-[var(--ds-border)] px-6 pb-4 pt-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(229_228_227/0.15)] text-[var(--ds-fg)]">
                <Type size={16} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-medium text-[var(--ds-fg)]">New text</p>
                <p className="truncate text-caption text-[var(--ds-fg-secondary)]">It lands on the Text track</p>
              </div>
              <PhButton v={B.quiet} size="xs" iconOnly aria-label="Close" startIcon={<X />} />
            </div>
            <div className="px-6 py-5">
              <Field label="Words" htmlFor="ph-fd-words">
                <Textarea id="ph-fd-words" rows={2} defaultValue="The Hidden Path" />
              </Field>
            </div>
            <div className="flex items-center justify-end gap-2.5 border-t border-[var(--ds-border)] bg-[var(--ds-layer-hover)] px-6 py-4">
              <PhButton v={B.neutral}>Cancel</PhButton>
              <PhButton v={B.primary}>Add text</PhButton>
            </div>
          </div>
        </Stage>
      </Group>
    </BoardCard>

    {/* 12 ─ Workspace & plans */}
    <BoardCard
      id="workspace"
      n={12}
      title="Workspace & Plans"
      lede="The panels a studio works in, where a project starts, and the plan that pays for it."
      span={5}
    >
      <Group label="Workspace modal">
        <Stage>
          <div
            role="dialog"
            aria-label="Mixer"
            className="flex w-full max-w-[400px] flex-col rounded-[14px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-[0_25px_60px_rgb(0_0_0/0.5)]"
          >
            <div className="flex items-center gap-2 px-6 pb-4 pt-5">
              <p className="min-w-0 flex-1 text-h2 text-[var(--ds-fg)]">Mixer</p>
              <PhButton v={B.quiet} size="sm" iconOnly aria-label="Reset levels" startIcon={<RotateCcw />} />
              <PhButton v={B.quiet} size="sm" iconOnly aria-label="Close" startIcon={<X />} />
            </div>
            <div className="flex flex-col gap-4 px-6 pb-5">
              <Meter label="Narration" value={80} />
              <Meter label="Music" value={45} />
            </div>
          </div>
        </Stage>
      </Group>
      <Group label="Drop zone">
        <button
          type="button"
          className="flex min-h-[112px] w-full items-center gap-[18px] rounded-xl border border-dashed border-[var(--ds-border-strong)] bg-[var(--ds-surface-raised)] px-6 py-5 text-left transition-colors hover:border-[var(--ds-accent)] hover:bg-[var(--ds-layer-hover)]"
        >
          <span
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[var(--radius-md)]"
            style={{ backgroundColor: B.primary.rest.bg, color: P.onFill }}
            aria-hidden
          >
            <FilePlus2 size={24} />
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-label text-[var(--ds-fg)]">
              <span className="font-normal">Drop your file here, </span>or click to browse
            </span>
            <span className="text-caption text-[var(--ds-fg-muted)]">PDF, EPUB, DOCX, TXT, Markdown, HTML, MOBI, AZW</span>
          </span>
        </button>
      </Group>
      <Groups min={200}>
        <Group label="Plan">
          <Plan name="Plus" price={10} credits={2000} />
        </Group>
        <Group label="Recommended">
          <Plan name="Pro" price={30} credits={12000} perk="5,000-character TTS input" recommended />
        </Group>
      </Groups>
      <Group label="Selected option">
        <div
          className="rounded-xl border-2 p-3 text-label text-[var(--ds-fg)]"
          style={{ borderColor: P.selectedEdge, backgroundColor: P.selectedWash }}
        >
          Illustrated story
        </div>
        <Note>A chosen option in a studio: a violet edge, a wash of it behind.</Note>
      </Group>
    </BoardCard>
  </PhansoraSheet>
)

export default defineDoc({
  meta: {
    id: 'phansora',
    title: 'Phansora Dashboard',
    tagline:
      'Second edition · October 2026. The Phansora dashboard on one board: its palette, type and buttons, its forms and navigation, its surfaces from the page up, and the dialogs its screens share.',
    keywords: ['design sheet', 'style guide', 'phansora', 'dashboard', 'second edition'],
  },
  board: ({ onNavigate }) => <DashboardBoard onNavigate={onNavigate} />,
})
