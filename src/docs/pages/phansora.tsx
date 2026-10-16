import * as React from 'react'
import {
  Activity,
  ArrowRight,
  Braces,
  Check,
  ChevronUp,
  CircleCheck,
  CircleX,
  Clapperboard,
  Clock,
  Copy,
  Crown,
  Download,
  Ellipsis,
  FilePlus2,
  FileText,
  Info,
  Library,
  LifeBuoy,
  Link,
  LogOut,
  Mic,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  TriangleAlert,
  Type,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Badge, Meter } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Field, TextInput, Textarea } from '@/ui/Input'
import { NavItem, Tabs } from '@/ui/Navigation'
import { MenuList } from '@/ui/Overlay'
import { NativeSelect } from '@/ui/Select'
import { Card, CardFooter, CardHeader, Stat } from '@/ui/Surface'
import { DataTable, type Column } from '@/ui/Table'
import { Segmented, Switch } from '@/ui/Toggle'
import { SubHeading } from '../framework/blocks'
import {
  ColorCard,
  Demo,
  ElevationLadder,
  InkStrip,
  LayerChips,
  Panel,
  SheetScope,
  SpecialCard,
  Stage,
  StatusPair,
  formatColor,
} from '../framework/DesignSheet'
import { defineDoc } from '../framework/types'
import { PHANSORA as P, accentScope, phansoraScope, type SheetAlertTone, type SheetPlan } from '../data/phansora-sheet'

/* ===========================================================================
   DESIGN SHEETS · PHANSORA, FIRST EDITION

   The Phansora dashboard set down on one page, in the order its own design
   sheet uses: color, surfaces, type, then the components its screens share
   and the dialogs they open.

   Every component here is this Bible's own, inside <SheetScope> with
   Phansora's values (data/phansora-sheet.ts). Where Phansora draws a part the
   Bible has no component for — the credit bar, the drop zone, the upgrade
   dialog — it is built here from the same tokens, as Phansora builds it.
   ======================================================================== */

/** Each section stands in Phansora's theme. */
const Scoped = ({ children }: { children: React.ReactNode }) => <SheetScope vars={phansoraScope}>{children}</SheetScope>

const grid = {
  cards: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-4',
  roles: 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,140px),1fr))] gap-x-4 gap-y-6',
  two: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4',
  pairs: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4',
  three: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4',
}

/* Phansora's buttons are the Bible's, rounded rather than pill. Its secondary
   is the success fill with the dark label, set over the same slots a variant
   fills (see ui/Button.tsx). */
const secondaryFill =
  '[--btn-bg:var(--ph-secondary)] [--btn-text:var(--ph-on-fill)] [--btn-wash:var(--ds-btn-wash-inverse)]'

const neutral = (value: string) => ({ color: value })

/* -- Small live parts ----------------------------------------------------- */

/** The bolt beside a price: the mark takes the credit color, the number stays grey. */
function CostTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-caption font-medium tabular-nums text-[var(--ds-fg-secondary)]">
      <Zap size={14} style={neutral('var(--ph-credit)')} fill="currentColor" aria-hidden />
      {children}
    </span>
  )
}

function SwitchDemo({ label, initial, disabled }: { label: string; initial: boolean; disabled?: boolean }) {
  const [on, setOn] = React.useState(initial)
  return <Switch checked={on} onCheckedChange={setOn} label={label} disabled={disabled} />
}

function PageTabs() {
  const [tab, setTab] = React.useState('sources')
  return (
    <Tabs
      aria-label="Page tabs example"
      value={tab}
      onChange={setTab}
      tabs={[
        { value: 'sources', label: 'Sources' },
        { value: 'dossiers', label: 'My Dossiers' },
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
        { value: 'upload', label: 'Upload file' },
        { value: 'url', label: 'From URL' },
        { value: 'paste', label: 'Paste text' },
      ]}
    />
  )
}

function AspectPicker() {
  const [ratio, setRatio] = React.useState('9:16')
  return (
    <Segmented
      aria-label="Aspect ratio example"
      value={ratio}
      onChange={setRatio}
      options={[
        { value: '9:16', label: '9:16' },
        { value: '1:1', label: '1:1' },
        { value: '16:9', label: '16:9' },
      ]}
    />
  )
}

/** dialog.js's alert and confirm: an icon on its ring, a title, a message, the action last. */
function AlertDialog({
  tone,
  icon,
  title,
  message,
  cancel,
  action,
}: {
  tone: SheetAlertTone
  icon: React.ReactNode
  title: string
  message: string
  cancel?: string
  action: string
}) {
  const btn = 'rounded-[var(--radius-lg)] px-5 py-2 text-label transition-[filter] hover:brightness-110'
  return (
    <div
      role="dialog"
      aria-label={title}
      className="w-[92%] max-w-[400px] rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-6 text-center shadow-e5"
    >
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: tone.ring, color: tone.icon }}
      >
        {icon}
      </div>
      <p className="mb-1.5 text-h2 text-[var(--ds-fg)]">{title}</p>
      <p className="mb-6 text-body text-[var(--ds-fg-secondary)]">{message}</p>
      <div className="flex justify-center gap-2.5">
        {cancel && (
          <button
            type="button"
            className={cn(btn, 'border border-[var(--ds-border)] bg-[rgb(255_255_255/0.08)] text-[var(--ds-fg-secondary)]')}
          >
            {cancel}
          </button>
        )}
        <button
          type="button"
          className={btn}
          style={{ backgroundColor: tone.button, color: 'var(--ph-on-fill)' }}
        >
          {action}
        </button>
      </div>
    </div>
  )
}

/** One plan in the upgrade dialog. The recommended one carries the premium edge and nothing else does. */
function PlanCard({ plan, compact }: { plan: SheetPlan; compact?: boolean }) {
  const edge = plan.recommended
    ? { borderColor: P.special.premiumEdge, boxShadow: `0 0 0 2px ${P.special.premiumRing}` }
    : { borderColor: P.elevation[2].value }
  return (
    <div className="relative flex flex-col rounded-[var(--radius-2xl)] border bg-[rgb(16_16_18/0.4)] p-5" style={edge}>
      {plan.recommended && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-overline uppercase"
          style={{ backgroundColor: P.special.premiumEdge, color: P.core[0].ink }}
        >
          Recommended
        </span>
      )}
      <p className="text-h3 text-[var(--ds-fg)]">{plan.name}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-h1 text-[var(--ds-fg)]">${plan.price}</span>
        <span className="text-body-sm font-medium text-[var(--ds-fg-secondary)]">/month</span>
      </div>
      {!compact && (
        <>
          <ul className="mt-5 flex flex-col gap-3 text-body-sm">
            <li className="flex items-start gap-2">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--ds-fg)]" aria-hidden />
              <span className="text-[var(--ds-fg-secondary)]">
                <span className="font-medium text-[var(--ds-fg)]">{plan.credits.toLocaleString('en-US')}</span> monthly credits
              </span>
            </li>
            {P.planFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-[var(--ds-fg)]" aria-hidden />
                <span className="text-[var(--ds-fg-secondary)]">{f}</span>
              </li>
            ))}
            {plan.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--ds-fg)]" aria-hidden />
                <span className="font-medium text-[var(--ds-fg)]">{perk}</span>
              </li>
            ))}
          </ul>
          <Button
            variant={plan.recommended ? 'primary' : 'secondary'}
            shape="rounded"
            fullWidth
            className="mt-6"
          >
            Subscribe to {plan.name}
          </Button>
        </>
      )}
    </div>
  )
}

/* -- The usage table ------------------------------------------------------ */

interface UsageRow {
  type: string
  title: string
  status: { label: string; tone: 'success' | 'warning' | 'danger' }
  credits: number
}

const ACTIVITY: UsageRow[] = [
  { type: 'Research Atlas', title: 'Pier Nine — three filings', status: { label: 'Complete', tone: 'success' }, credits: 1200 },
  { type: 'Text-to-Speech', title: 'chapter-04.txt', status: { label: 'Queued', tone: 'warning' }, credits: 300 },
  { type: 'Narrava Studio', title: 'Ancient Knowledge', status: { label: 'Failed', tone: 'danger' }, credits: 0 },
]

const ACTIVITY_COLUMNS: Column<UsageRow>[] = [
  { id: 'type', header: 'Type', cell: (r) => r.type },
  { id: 'title', header: 'Title / File', cell: (r) => <span className="font-medium text-[var(--ds-fg)]">{r.title}</span> },
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

/* -- Sections ------------------------------------------------------------- */

const Colors = () => (
  <Scoped>
    <SubHeading description="Each with the states it takes.">Core</SubHeading>
    <div className={grid.cards}>
      {P.core.map((c) => (
        <ColorCard key={c.name} color={c} />
      ))}
    </div>

    <SubHeading>Text</SubHeading>
    <InkStrip inks={P.text} />

    <SubHeading description="Status keeps its color, because the color is the message. Ink on the left, the fill it pairs with on the right.">
      Status
    </SubHeading>
    <div className={grid.cards}>
      {P.status.map((s) => (
        <StatusPair key={s.name} status={s} />
      ))}
    </div>

    <SubHeading description="The few places an edge or a color means something on its own, each drawn as it ships.">
      Special cases
    </SubHeading>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
      <SpecialCard
        name="Premium · recommended"
        token="border-primary-500 ring-2 ring-primary-500/40"
        use="The recommended plan, and only that. Every other plan takes border-surface-800."
      >
        <PlanCard plan={P.plans.find((p) => p.recommended) ?? P.plans[0]} compact />
      </SpecialCard>
      <SpecialCard
        name="Selected card"
        token="--studio-accent-edge · --studio-accent-wash"
        use="A chosen option in a studio: violet edge, a wash of it behind."
      >
        <div
          className="w-full max-w-[200px] rounded-[var(--radius-xl)] border-2 px-4 py-3.5 text-label-sm text-[var(--ds-fg)]"
          style={{ borderColor: P.special.selectedEdge, backgroundColor: P.special.selectedWash }}
        >
          Illustrated story
        </div>
      </SpecialCard>
      <SpecialCard
        name="Credits"
        token=".cost-tag · amber-400"
        use="The bolt beside a price. The mark carries the color; the number stays grey."
      >
        <div className="flex flex-wrap items-center gap-3">
          <CostTag>1,200</CostTag>
          <Button size="sm" shape="rounded" startIcon={<Sparkles />}>
            Generate
          </Button>
        </div>
      </SpecialCard>
      <SpecialCard
        name="Destructive"
        token="--ui-fill-danger-edge · -wash · -text"
        use="Around an action that cannot be undone, and an invalid field's edge."
      >
        <div
          className="w-full max-w-[200px] rounded-[var(--radius-xl)] border px-4 py-3.5 text-label-sm"
          style={{ borderColor: P.special.dangerEdge, backgroundColor: P.special.dangerWash, color: P.special.dangerText }}
        >
          Delete this project
        </div>
      </SpecialCard>
    </div>

    <SubHeading description="White at low strength, so one value works on every surface.">Lines &amp; layers</SubHeading>
    <LayerChips layers={P.lines} />
  </Scoped>
)

const Surfaces = () => (
  <Scoped>
    <SubHeading>Elevation, dark to light</SubHeading>
    <ElevationLadder rungs={P.elevation} />
    <p className="mt-4 max-w-[68ch] text-body-sm text-[var(--ds-fg-secondary)]">
      One surface sits outside the ladder: the <strong className="font-medium text-[var(--ds-fg)]">well</strong> (
      <code className="font-mono text-caption">{P.well.token}</code>, {formatColor(P.well.value)}), a track cut into a
      surface — a meter, a segmented control, a fader rail. Inside a dialog it also stands in for level 0.
    </p>

    <SubHeading>Stacking</SubHeading>
    <Panel>
      <p className="text-h4">Card — level 1</p>
      <p className="text-body-sm text-[var(--ds-fg-secondary)]">On a dashboard page a card is a panel on the ground.</p>
      <div className="mt-4 rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-raised)] p-5">
        <p className="text-h4">Lifted card — level 2</p>
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">The usage tiles, the Chrono Origin trace form.</p>
        <div
          className="mt-4 rounded-[var(--radius-xl)] border border-[var(--ds-border)] p-5"
          style={{ backgroundColor: 'var(--ph-elev-3)' }}
        >
          <p className="text-h4">A box on a lifted card — level 3</p>
          <Field label="A field — level 4, above every surface" htmlFor="ph-stack-field" className="mt-4">
            <TextInput id="ph-stack-field" placeholder="Type here" />
          </Field>
        </div>
      </div>
    </Panel>
  </Scoped>
)

const TYPE_ROWS: [string, string, string, string][] = [
  ['Page title', 'text-h1', 'Research Atlas', '40/56 · 300'],
  ['Dialog / major section', 'text-h2', 'Upgrade your plan', '24/32 · 500 · −0.025em'],
  ['Section heading', 'text-h3', 'Recent Activity', '18/24 · 600'],
  ['Card title', 'text-h4', 'Text to Speech', '16/24 · 500'],
  ['Body', 'text-body', 'Paste your text, pick a voice and generate.', '16/24 · 400'],
  ['Interface', 'text-ui', 'Narrava Studio', '15/21 · 400 — nav, menus, rows, tabs'],
  ['Form label', 'text-label', 'Story title', '15/24 · 500'],
  ['Supporting', 'text-body-sm', 'Your latest generations across all products.', '14/20 · 400'],
  ['Eyebrow', 'text-overline', 'Credits remaining', '12 · 500 · 0.09em, uppercase'],
  ['Caption', 'text-caption', 'Shown in the header and on exports.', '12/16 · 400 — the floor'],
]

const Typography = () => (
  <Scoped>
    <Panel className="divide-y divide-[var(--ds-border)] py-1">
      {TYPE_ROWS.map(([role, cls, sample, spec]) => (
        <div key={role} className="grid gap-1.5 py-3.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-baseline sm:gap-6">
          <p className="text-label-sm text-[var(--ds-fg-secondary)]">{role}</p>
          <div className="flex min-w-0 flex-col gap-1">
            <p className={cn(cls, cls === 'text-overline' && 'uppercase', cls === 'text-caption' ? 'text-[var(--ds-fg-muted)]' : 'text-[var(--ds-fg)]')}>
              {sample}
            </p>
            <code className="font-mono text-caption text-[var(--ds-fg-muted)]">
              {cls} — {spec}
            </code>
          </div>
        </div>
      ))}
    </Panel>
  </Scoped>
)

const Buttons = () => (
  <Scoped>
    <SubHeading description="One primary button per view.">Roles</SubHeading>
    <Panel className={grid.roles}>
      <Demo role="Primary" meta="btn--filled">
        <Button shape="rounded">Generate</Button>
      </Demo>
      <Demo role="Secondary" meta="btn--tonal">
        <Button shape="rounded" className={secondaryFill}>
          Recharge
        </Button>
      </Demo>
      <Demo role="Neutral" meta="btn--outlined">
        <Button variant="secondary" shape="rounded">
          Cancel
        </Button>
      </Demo>
      <Demo role="Quiet" meta="btn--text">
        <Button variant="tertiary" shape="rounded">
          View usage
        </Button>
      </Demo>
      <Demo role="Success" meta="btn--success">
        <Button shape="rounded" className={secondaryFill}>
          Save
        </Button>
      </Demo>
      <Demo role="Destructive" meta="btn--danger-outline">
        <Button variant="secondary" tone="danger" shape="rounded">
          Remove
        </Button>
      </Demo>
      <Demo role="Destructive, quiet" meta="btn--danger-text">
        <Button variant="tertiary" tone="danger" shape="rounded">
          Discard
        </Button>
      </Demo>
    </Panel>

    <SubHeading>With icons</SubHeading>
    <Panel className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button shape="rounded" startIcon={<Sparkles />}>
          Generate
        </Button>
        <Button shape="rounded" className={secondaryFill} startIcon={<Zap />}>
          Recharge
        </Button>
        <Button variant="secondary" shape="rounded" startIcon={<Upload />}>
          Upload
        </Button>
        <Button variant="tertiary" shape="rounded" startIcon={<Download />}>
          Download
        </Button>
        <Button variant="secondary" tone="danger" shape="rounded" startIcon={<Trash2 />}>
          Delete
        </Button>
        <Button variant="secondary" shape="rounded" endIcon={<ArrowRight />}>
          Next
        </Button>
      </div>
      <Demo role="Icon only" meta="btn--icon · icons size with the button: 13 / 14 / 16 / 18px">
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Add" icon={<Plus />} variant="primary" shape="rounded" />
          <IconButton label="Recharge" icon={<Zap />} variant="primary" shape="rounded" className={secondaryFill} />
          <IconButton label="Edit" icon={<Pencil />} variant="secondary" shape="rounded" />
          <IconButton label="Copy" icon={<Copy />} shape="rounded" />
          <IconButton label="Delete" icon={<Trash2 />} tone="danger" shape="rounded" />
        </div>
      </Demo>
    </Panel>

    <SubHeading>Sizes</SubHeading>
    <Panel className="flex flex-wrap items-center gap-3">
      <Button size="xs" shape="rounded">xs · 28</Button>
      <Button size="sm" shape="rounded">sm · 32</Button>
      <Button size="md" shape="rounded">md · 36</Button>
      <Button size="lg" shape="rounded">lg · 44</Button>
      <IconButton label="Add" icon={<Plus />} variant="secondary" shape="rounded" />
      <IconButton label="More" icon={<Ellipsis />} size="sm" shape="rounded" />
    </Panel>

    <SubHeading>States</SubHeading>
    <Panel className="flex flex-col gap-6">
      <div className={grid.roles}>
        <Demo role="Disabled" meta=":disabled">
          <Button shape="rounded" disabled>
            Generate
          </Button>
        </Demo>
        <Demo role="Loading" meta="data-loading">
          <Button shape="rounded" loading>
            Generate
          </Button>
        </Demo>
        <Demo role="Loading, secondary" meta="data-loading">
          <Button shape="rounded" className={secondaryFill} loading>
            Recharge
          </Button>
        </Demo>
        <Demo role="Done" meta="data-success">
          <Button shape="rounded" className={secondaryFill} success>
            Saved
          </Button>
        </Demo>
      </div>
      <Demo role="With a price" meta="cost-tag · btn--cta">
        <div className="flex flex-wrap items-center gap-3">
          <CostTag>300</CostTag>
          <CostTag>1,200</CostTag>
          <Button size="lg" shape="rounded" startIcon={<Sparkles />}>
            Build Audio Course
          </Button>
        </div>
      </Demo>
    </Panel>
  </Scoped>
)

/** The same three fields on each surface a field can land on. */
function FieldSet({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Project name" description="Shown in the header and on exports." htmlFor={`${id}-name`}>
        <TextInput id={`${id}-name`} defaultValue="Ancient Knowledge" />
      </Field>
      <Field label="Voice" htmlFor={`${id}-voice`}>
        <NativeSelect
          id={`${id}-voice`}
          options={[
            { value: 'warm', label: 'Narrator — warm' },
            { value: 'bright', label: 'Narrator — bright' },
          ]}
        />
      </Field>
      <Field label="Notes" optional htmlFor={`${id}-notes`}>
        <TextInput id={`${id}-notes`} placeholder="Anything the narrator should know" />
      </Field>
    </div>
  )
}

const Forms = () => (
  <Scoped>
    <SubHeading description="Fields look the same on a panel, a lifted card and in a dialog: a field sits above every surface.">
      On every surface
    </SubHeading>
    <div className={grid.three}>
      <Panel>
        <p className="mb-4 text-caption font-medium text-[var(--ds-fg-secondary)]">On a panel · level 1</p>
        <FieldSet id="ph-f1" />
      </Panel>
      <Panel className="bg-[var(--ds-surface-raised)]">
        <p className="mb-4 text-caption font-medium text-[var(--ds-fg-secondary)]">On a lifted card · level 2</p>
        <FieldSet id="ph-f2" />
      </Panel>
      <Panel className="bg-[var(--ds-surface-overlay)] shadow-e4">
        <p className="mb-4 text-caption font-medium text-[var(--ds-fg-secondary)]">In a dialog · level 2</p>
        <FieldSet id="ph-f3" />
      </Panel>
    </div>

    <SubHeading>States</SubHeading>
    <Panel className={grid.two}>
      <Demo fill meta="[readonly]">
        <Field label="Read-only" htmlFor="ph-s-readonly">
          <TextInput id="ph-s-readonly" defaultValue="usr_2f9c41" readOnly />
        </Field>
      </Demo>
      <Demo fill meta=":disabled">
        <Field label="Disabled" htmlFor="ph-s-disabled">
          <TextInput id="ph-s-disabled" defaultValue="Locked while rendering" disabled />
        </Field>
      </Demo>
      <Demo fill meta='aria-invalid="true"'>
        <Field label="Email" status="error" message="That address does not look right." htmlFor="ph-s-invalid">
          <TextInput id="ph-s-invalid" type="email" defaultValue="you@example" status="error" />
        </Field>
      </Demo>
      <Demo fill meta="field--icon">
        <Field label="Article or book URL" htmlFor="ph-s-icon">
          <TextInput id="ph-s-icon" type="url" placeholder="https://example.com/long-form-article" endIcon={<Link />} />
        </Field>
      </Demo>
      <Demo fill meta="input--sm · input--lg">
        <Field label="Small" htmlFor="ph-s-sm">
          <TextInput id="ph-s-sm" size="sm" placeholder="Dense rows" />
        </Field>
        <Field label="Large" htmlFor="ph-s-lg">
          <TextInput id="ph-s-lg" size="lg" placeholder="The main entry" />
        </Field>
      </Demo>
      <Demo fill meta="textarea · field-count">
        <Field label="Message" counter={{ value: 0, max: 5000 }} htmlFor="ph-s-message">
          <Textarea
            id="ph-s-message"
            rows={3}
            placeholder="Describe the problem, what you expected, and any steps to reproduce it."
          />
        </Field>
      </Demo>
    </Panel>

    <SubHeading description="On is Secondary: a switch that is on is a state, not another light-grey control.">
      Switches
    </SubHeading>
    <SheetScope vars={accentScope(P.core[1].value)}>
      <Panel className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <SwitchDemo label="Enabled" initial />
        <SwitchDemo label="Off" initial={false} />
        <SwitchDemo label="Disabled" initial={false} disabled />
      </Panel>
    </SheetScope>
  </Scoped>
)

const Navigation = () => (
  <Scoped>
    <p className="max-w-[68ch] text-body-sm text-[var(--ds-fg-secondary)]">
      The current item is never marked by color alone: a filled row, an underline or a raised chip.
    </p>
    <div className={cn(grid.two, 'mt-4 items-start')}>
      <Demo fill meta='Sidebar · partials/admin/sidebar.ejs · .nav-item[aria-current="page"] · .nav-cta'>
        {/* The sidebar's current row is a filled capsule and carries no hue, so the
            accent bar and the accent icon the Bible's NavItem draws are neutral here. */}
        <SheetScope vars={accentScope('transparent', P.text[0].value)}>
          <nav
            aria-label="Sidebar example"
            className="flex flex-col rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] text-[var(--ds-fg-secondary)]"
          >
            <div className="border-b border-[var(--ds-border)] px-4 py-4">
              <p className="text-h2 text-[var(--ds-fg)]">{P.name}</p>
            </div>
            <div className="flex flex-col gap-1.5 px-3 py-3">
              <p className="px-2 text-overline uppercase text-[var(--ds-fg-secondary)]">Products</p>
              <div className="flex flex-col gap-0.5">
                <NavItem icon={<Mic />} label="Text-to-Speech" href="#navigation" />
                <NavItem icon={<Library />} label="Research Atlas" href="#navigation" active />
                <NavItem icon={<Clapperboard />} label="Narrava Studio" href="#navigation" />
                <NavItem icon={<LifeBuoy />} label="Support" href="#navigation" count={3} />
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[var(--ds-border)] p-3">
              {/* The sidebar's one call to action: primary-700 into primary-600, the dark label. */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-label font-semibold shadow-e3 transition-[filter] hover:brightness-110"
                style={{
                  backgroundImage: `linear-gradient(to right, ${P.core[0].states[1].value}, ${P.core[0].value})`,
                  color: P.core[0].ink,
                }}
              >
                <span aria-hidden>★</span>
                Upgrade Plan
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2 text-left hover:bg-[var(--ds-layer-hover)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ds-surface-raised)]">
                  <User size={16} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-caption font-medium text-[var(--ds-fg)]">Account</span>
                  <span className="block truncate text-caption">you@example.com</span>
                </span>
                <ChevronUp size={12} aria-hidden />
              </button>
            </div>
          </nav>
        </SheetScope>
      </Demo>

      <div className="flex flex-col gap-4">
        <Demo fill meta="Page tabs · .tabs .tab — the brand underline marks the current one">
          <SheetScope vars={accentScope(P.core[2].value)}>
            <PageTabs />
          </SheetScope>
        </Demo>
        <Panel className="flex flex-col gap-6">
          <Demo meta="Tabs in a card · .tabs.tabs--pill — the selected pill takes the primary fill">
            {/* Phansora's selected pill is the primary fill with the dark label,
                where the Bible raises it a rung. */}
            <SheetScope vars={{ '--ds-surface-raised': P.core[0].value, '--ds-fg': P.core[0].ink }}>
              <PillTabs />
            </SheetScope>
          </Demo>
          <Demo meta="Pick a value · .segmented">
            <AspectPicker />
          </Demo>
        </Panel>
      </div>
    </div>
  </Scoped>
)

const CardsAndData = () => (
  <Scoped>
    <SubHeading>Cards</SubHeading>
    <div className={grid.cards}>
      <Card>
        <CardHeader title="Card" description="A panel on the page." />
      </Card>
      <Card elevation={3}>
        <CardHeader title="Raised" description="A deeper shadow, for emphasis." />
      </Card>
      <Card interactive tabIndex={0}>
        <CardHeader title="Interactive" description="Only for cards that are pressable." />
      </Card>
      <Card variant="elevated">
        <CardHeader title="Level 2" description="Lifted off a panel." />
      </Card>
      <Card className="border-[var(--ds-border)]" style={{ backgroundColor: 'var(--ph-elev-3)' }}>
        <CardHeader title="Level 3" description="Two steps up." />
        <CardFooter>
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">With a footer</span>
        </CardFooter>
      </Card>
    </div>

    <SubHeading>Summary tiles</SubHeading>
    <div className={grid.three}>
      <Demo fill meta="Usage tile · card card--raised elev-2">
        <Stat label="Generations, all time" value="1,284" icon={<Activity />} />
      </Demo>
      <Demo fill meta=".stat-tile · stat-tile--success">
        <Card variant="elevated" className="flex flex-col gap-3">
          <Stat layout="leading" label="Duration" value="25:42" icon={<Clock />} />
          <Stat layout="leading" tone="success" label="Status" value="Ready" icon={<Check />} />
        </Card>
      </Demo>
      <Demo fill meta="stat-tile--warning · --error · --info">
        <Card variant="elevated" className="flex flex-col gap-3">
          <Stat layout="leading" tone="warning" label="Source check" value="Some content flagged" icon={<TriangleAlert />} />
          <Stat layout="leading" tone="danger" label="Render" value="Failed" icon={<X />} />
          <Stat layout="leading" tone="info" label="Sessions" value="12" icon={<Info />} />
        </Card>
      </Demo>
    </div>

    <SubHeading>Tables</SubHeading>
    <Demo fill meta="card card--flush card--raised › .data-table">
      <Card padding="none" className="overflow-hidden">
        <CardHeader
          title="Recent Activity"
          description="Your latest generations across all products"
          divided
          className="px-6 py-5"
        />
        <DataTable columns={ACTIVITY_COLUMNS} rows={ACTIVITY} rowKey={(r) => r.title} caption="Recent activity example" />
      </Card>
    </Demo>
  </Scoped>
)

const Status = () => (
  <Scoped>
    <div className={grid.two}>
      <Panel>
        <p className="mb-3 text-caption font-medium text-[var(--ds-fg-secondary)]">Text · .ui-text-*</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-body-sm">
          <span className="text-[var(--ds-success-text)]">Saved</span>
          <span className="text-[var(--ds-warning-text)]">Running low</span>
          <span className="text-[var(--ds-danger-text)]">Upload failed</span>
          <span className="text-[var(--ds-info-text)]">Processing</span>
          <span className="text-[var(--ds-fg-muted)]">Draft</span>
        </div>
      </Panel>
      <Panel>
        <p className="mb-3 text-caption font-medium text-[var(--ds-fg-secondary)]">Badges · .badge</p>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="success" dot>Complete</Badge>
          <Badge tone="warning" dot>Queued</Badge>
          <Badge tone="danger" dot>Failed</Badge>
          <Badge tone="info" dot>Info</Badge>
          <Badge size="sm">Small</Badge>
        </div>
      </Panel>
    </div>

    <SubHeading description="What a generation costs, beside what is left. As partials/admin/credit-meter.ejs renders it.">
      Credits
    </SubHeading>
    <Panel>
      <div className="mx-auto flex max-w-[32rem] flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3 text-caption text-[var(--ds-fg-secondary)]">
          <span>Credits remaining</span>
          <span className="tabular-nums">17,600 of 26,000</span>
        </div>
        <Meter value={17600} max={26000} />
        <div className="flex items-center justify-between gap-4">
          <p className="flex min-w-0 items-center gap-2 text-body-sm text-[var(--ds-fg-secondary)]">
            <span>
              <span className="font-medium text-[var(--ds-fg)]">300</span> per generation
            </span>
            <span aria-hidden>·</span>
            <span>
              about <span className="font-medium text-[var(--ds-fg)]">58</span> more
            </span>
          </p>
          <Button size="sm" shape="rounded" className={secondaryFill} startIcon={<Zap />}>
            Recharge
          </Button>
        </div>
      </div>
    </Panel>

    <div className={cn(grid.two, 'mt-4')}>
      <Panel className="flex flex-col gap-3 bg-[var(--ds-surface-raised)]">
        <p className="text-caption font-medium text-[var(--ds-fg-secondary)]">Running low · meter__fill--low</p>
        <Meter value={68} />
        <Meter value={12} tone="warning" />
      </Panel>
      <Panel>
        <p className="mb-3 text-caption font-medium text-[var(--ds-fg-secondary)]">Out of credits · .banner--warning</p>
        <Alert
          tone="warning"
          title="Not enough credits to generate"
          actions={
            <>
              <Button size="sm" shape="rounded" startIcon={<Zap />}>
                Recharge
              </Button>
              <Button size="sm" variant="tertiary" shape="rounded">
                View usage
              </Button>
            </>
          }
        >
          This generation costs <strong className="font-medium">1,200</strong> and you have{' '}
          <strong className="font-medium">340</strong>. Add credits to continue.
        </Alert>
      </Panel>
    </div>

    <SubHeading description="The whole zone is the control. As dashboard-book-alchemy.ejs renders it.">Drop zone</SubHeading>
    <Panel>
      <button
        type="button"
        className="flex min-h-[112px] w-full items-center gap-[18px] rounded-[var(--radius-xl)] border border-dashed border-[var(--ds-border-strong)] bg-[var(--ds-surface-raised)] px-6 py-5 text-left transition-colors hover:border-[var(--ds-accent)] hover:bg-[var(--ph-elev-3)]"
      >
        <span
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
          style={{ backgroundColor: P.core[0].value, color: P.core[0].ink }}
          aria-hidden
        >
          <FilePlus2 size={24} />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-label text-[var(--ds-fg)]">
            <span className="font-normal">Drop your file here, </span>or click to browse
          </span>
          <span className="text-caption text-[var(--ds-fg-muted)]">PDF, EPUB, DOCX, TXT, Markdown, HTML, MOBI, AZW</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">Best results with clean, well-structured content.</span>
        </span>
      </button>
    </Panel>
  </Scoped>
)

const DialogsAndMenus = () => (
  <Scoped>
    <p className="max-w-[68ch] text-body-sm text-[var(--ds-fg-secondary)]">
      A dialog is a level-2 panel over the scrim; what sits on it is level 3. A menu is level 3, so it can open over a
      dialog.
    </p>

    <SubHeading description="One component for every yes/no in the product: assets/js/dialog.js. The last button is the action.">
      Alerts &amp; confirms
    </SubHeading>
    <div className={grid.pairs}>
      <Demo fill meta="showAlert(message) · info">
        <Stage>
          <AlertDialog
            tone={P.alerts.info}
            icon={<Info size={24} />}
            title="Heads up"
            message="Your export is still rendering. We will email you when it is ready."
            action="OK"
          />
        </Stage>
      </Demo>
      <Demo fill meta="showAlert(message, 'success')">
        <Stage>
          <AlertDialog
            tone={P.alerts.success}
            icon={<CircleCheck size={24} />}
            title="Course ready"
            message="All 8 sessions are narrated and saved to My Courses."
            action="Done"
          />
        </Stage>
      </Demo>
      <Demo fill meta="showConfirm(message, { type: 'warning' })">
        <Stage>
          <AlertDialog
            tone={P.alerts.warning}
            icon={<TriangleAlert size={24} />}
            title="Leave without saving?"
            message="Your changes to this script have not been saved."
            cancel="Stay"
            action="Leave"
          />
        </Stage>
      </Demo>
      <Demo fill meta="showConfirm(message, { type: 'error' })">
        <Stage>
          <AlertDialog
            tone={P.alerts.error}
            icon={<CircleX size={24} />}
            title="Delete project"
            message="This cannot be undone."
            cancel="Cancel"
            action="Delete"
          />
        </Stage>
      </Demo>
    </div>

    <SubHeading description="For anything you fill in: studio/components/FormDialog.js. Icon and title over a divider, a scrolling body, the action in the footer. Full screen on a phone.">
      Form dialog
    </SubHeading>
    <Stage>
      <div
        role="dialog"
        aria-label="New text"
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5"
      >
        <div className="flex items-center gap-3 border-b border-[var(--ds-border)] px-6 pb-4 pt-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[rgb(229_228_227/0.15)] text-[var(--ds-fg)]">
            <Type size={16} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-[var(--ds-fg)]">New text</p>
            <p className="truncate text-caption text-[var(--ds-fg-secondary)]">It lands on the Text track at the playhead</p>
          </div>
          <IconButton label="Close" icon={<X />} size="xs" shape="rounded" />
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <Field label="Words" htmlFor="ph-fd-words">
            <Textarea id="ph-fd-words" rows={2} defaultValue="The Hidden Path" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Font" htmlFor="ph-fd-font">
              <NativeSelect
                id="ph-fd-font"
                options={[
                  { value: 'inter', label: 'Inter' },
                  { value: 'playfair', label: 'Playfair Display' },
                ]}
              />
            </Field>
            <Field label="Size" htmlFor="ph-fd-size">
              <NativeSelect
                id="ph-fd-size"
                options={[
                  { value: 'large', label: 'Large' },
                  { value: 'medium', label: 'Medium' },
                ]}
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 border-t border-[var(--ds-border)] bg-[var(--ds-layer-hover)] px-6 py-4">
          <Button variant="secondary" shape="rounded">
            Cancel
          </Button>
          <Button shape="rounded">Add text</Button>
        </div>
      </div>
    </Stage>

    <SubHeading description="On every dashboard page, opened from Recharge or the sidebar's Upgrade Plan: partials/admin/upgrade-dialog.ejs. The recommended plan carries the premium edge.">
      Upgrade plan
    </SubHeading>
    <Stage>
      <div
        role="dialog"
        aria-label="Upgrade your plan"
        className="relative w-full max-w-[960px] rounded-[var(--radius-2xl)] border border-[var(--ds-border-strong)] bg-[var(--ds-surface)] p-6 shadow-e5 sm:p-8"
      >
        <IconButton label="Close" icon={<X />} size="sm" shape="rounded" className="absolute right-4 top-4" />
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <Crown size={20} aria-hidden />
            <p className="text-h3 text-[var(--ds-fg)]">Upgrade your plan</p>
          </div>
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">
            Choose a plan and keep creating — credits refresh every month.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {P.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
        <p className="mt-6 text-center text-body-sm text-[var(--ds-fg-secondary)]">
          Want to buy credits only?{' '}
          <a href="#dialogs" className="font-medium text-[var(--ds-fg)] hover:underline">
            Click here
          </a>
        </p>
      </div>
    </Stage>

    <SubHeading description="A panel you work in rather than a decision you make: studio/components/Modal.js. Sized by its content.">
      Workspace modal
    </SubHeading>
    <Stage>
      <div
        role="dialog"
        aria-label="Mixer"
        className="flex w-full max-w-[460px] flex-col rounded-[14px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5"
      >
        <div className="flex items-center gap-4 px-6 pb-4 pt-5">
          <p className="min-w-0 flex-1 text-h2 text-[var(--ds-fg)]">Mixer</p>
          <IconButton label="Reset levels" icon={<RotateCcw />} size="sm" shape="rounded" />
          <IconButton label="Close" icon={<X />} size="sm" shape="rounded" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-5">
          <Meter label="Narration" value={80} />
          <Meter label="Music" value={45} />
          <Meter label="Sound effects" value={30} />
        </div>
      </div>
    </Stage>

    <SubHeading>Menus</SubHeading>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
      <SpecialCard name="Action menu" token=".ui-menu — level 3" use="Opened from a button; rows take the hover layer.">
        {/* MenuList is the list; the panel is the popover's, here drawn in place.
            Phansora's menus stand a rung above its dialogs. */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] p-1 shadow-e4"
          style={{ backgroundColor: P.elevation[3].value }}
        >
          <p className="px-3 pb-1 pt-1.5 text-caption font-medium text-[var(--ds-fg-secondary)]" aria-hidden>
            Download as
          </p>
          <MenuList
            label="Download as"
            items={[
              { label: 'PDF report', icon: <FileText /> },
              { label: 'Research data (JSON)', icon: <Braces /> },
            ]}
          />
        </div>
      </SpecialCard>
      <SpecialCard name="Profile menu" token="elev-3 · border --ui-border" use="From the account row at the foot of the sidebar.">
        <div
          role="menu"
          aria-label="Profile menu example"
          className="w-56 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] py-2 shadow-e4"
          style={{ backgroundColor: P.elevation[3].value }}
        >
          <a role="menuitem" href="#dialogs" className="flex items-center gap-3 px-3 py-2 text-ui hover:bg-[var(--ds-layer-hover)]">
            <Settings size={16} className="text-[var(--ds-fg-secondary)]" aria-hidden />
            Settings
          </a>
          <a role="menuitem" href="#dialogs" className="flex items-center gap-3 px-3 py-2 text-ui hover:bg-[var(--ds-layer-hover)]">
            <LogOut size={16} className="text-[var(--ds-fg-secondary)]" aria-hidden />
            Log out
          </a>
        </div>
      </SpecialCard>
    </div>
  </Scoped>
)

export default defineDoc({
  meta: {
    id: 'phansora',
    title: P.name,
    tagline: `${P.edition}. The Phansora dashboard set down on one page — its palette, its surfaces from the page up, its type, and the components and dialogs its screens share.`,
    keywords: ['design sheet', 'style guide', 'phansora', 'dashboard', 'first edition'],
  },
  sheet: [
    {
      id: 'colors',
      title: 'Colors',
      description:
        'A monochrome interface with one brand hue. Grey carries the interface, violet marks the brand, and status keeps its color because the color is the message.',
      render: <Colors />,
    },
    {
      id: 'surfaces',
      title: 'Surfaces',
      description: 'Depth is lightness: whatever rests on a surface is one step lighter than it.',
      render: <Surfaces />,
    },
    {
      id: 'typography',
      title: 'Typography',
      description: "One scale for the site and the dashboard — this Bible's. Nothing readable under 12px.",
      render: <Typography />,
    },
    { id: 'buttons', title: 'Buttons', render: <Buttons /> },
    { id: 'forms', title: 'Forms', render: <Forms /> },
    { id: 'navigation', title: 'Navigation', render: <Navigation /> },
    { id: 'cards', title: 'Cards & data', render: <CardsAndData /> },
    { id: 'status', title: 'Status', description: 'Status keeps its color; everything else is grey.', render: <Status /> },
    { id: 'dialogs', title: 'Dialogs & menus', render: <DialogsAndMenus /> },
  ],
})
