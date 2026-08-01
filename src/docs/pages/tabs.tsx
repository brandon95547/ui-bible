import * as React from 'react'
import { Activity, FileText, Settings, Shield } from 'lucide-react'
import { TabPanel, Tabs, type TabSpec } from '@/ui/Navigation'
import { Card } from '@/ui/Surface'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const TABS: TabSpec[] = [
  { value: 'overview', label: 'Overview', icon: <Activity size={14} /> },
  { value: 'logs', label: 'Logs', icon: <FileText size={14} />, count: 12 },
  { value: 'security', label: 'Security', icon: <Shield size={14} />, count: 2 },
  { value: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  { value: 'billing', label: 'Billing', disabled: true },
]

function Playground() {
  const [variant, setVariant] = React.useState<'underline' | 'pill' | 'enclosed'>('underline')
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [icons, setIcons] = React.useState(true)
  const [counts, setCounts] = React.useState(true)
  const [fullWidth, setFullWidth] = React.useState(false)
  const [value, setValue] = React.useState('overview')

  const tabs = TABS.map((t) => ({
    ...t,
    icon: icons ? t.icon : undefined,
    count: counts ? t.count : undefined,
  }))

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['underline', 'pill', 'enclosed'] as const}
            />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={icons} onChange={setIcons} label="Icons" />
          <KnobToggle checked={counts} onChange={setCounts} label="Counts" />
          <KnobToggle checked={fullWidth} onChange={setFullWidth} label="Full width" />
        </div>
      }
      code={`<Tabs
  tabs={tabs}
  value={value}
  onChange={setValue}
  variant="${variant}"
  size="${size}"${fullWidth ? '\n  fullWidth' : ''}
  aria-label="Project sections"
/>
<TabPanel value="${value}" active>…</TabPanel>`}
    >
      <div className="w-full">
        <Tabs
          tabs={tabs}
          value={value}
          onChange={setValue}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          aria-label="Project sections"
        />
        <div className="pt-5">
          {tabs.map((t) => (
            <TabPanel key={t.value} value={t.value} active={t.value === value}>
              <Card padding="md">
                <p className="text-label text-[var(--ds-fg)]">{t.label}</p>
                <p className="mt-1.5 text-body-sm text-[var(--ds-fg-muted)]">
                  Panel content for {t.label.toLowerCase()}. Tab moves focus straight in here — it
                  does not step through the remaining tabs.
                </p>
              </Card>
            </TabPanel>
          ))}
        </div>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'tabs',
    title: 'Tabs',
    tagline:
      'Peer views of one object. Not a wizard, not a filter, and not navigation between unrelated destinations — those are the three things tabs are constantly misused for.',
    keywords: ['tabbed', 'segmented', 'panel', 'switcher', 'sections'],
  },

  overview: {
    purpose:
      'Tabs let a user switch between alternative views of the same subject without leaving the page. The subject stays constant; only the lens changes. That constraint is what makes them comprehensible — the moment the subject changes between tabs, the pattern stops working.',
    whenToUse: [
      'Several views of one object: a project’s overview, logs, security and settings.',
      'The views are peers — no order, no prerequisite, no progression.',
      'The user will switch back and forth rather than moving through once.',
      'Each view is substantial enough to deserve the whole content area.',
    ],
    whenNotToUse: [
      {
        text: 'The steps must be completed in order.',
        instead: 'a wizard or a stepper',
        to: '#/form',
      },
      {
        text: 'The control narrows a list rather than changing the view.',
        instead: 'filter Chips',
        to: '#/chip',
      },
      {
        text: 'The destinations are separate pages with their own URLs and titles.',
        instead: 'Sidebar or Top Bar navigation',
        to: '#/sidebar',
      },
      {
        text: 'There are more than about seven, or the labels are long.',
        instead: 'a Select or a sidebar — tabs that scroll are tabs nobody finds',
      },
      {
        text: 'Only two short options that toggle a display mode.',
        instead: 'a segmented control',
        to: '#/radio-button',
      },
    ],
    reasoning: (
      <>
        <p>
          The keyboard contract is what makes tabs a distinct component rather than a row of
          buttons. <strong>Tab enters the tablist once</strong>, arrow keys move between tabs, and
          Tab again moves into the panel. A row of five buttons costs five tab stops before the user
          reaches the content; a real tablist costs one. This is the roving tabindex pattern, and it
          is not optional.
        </p>
        <p>
          The active underline is 2px and sits <strong>on the container border</strong>, so the
          selected tab visually breaks the line and merges with the panel below it. That connection
          is the whole visual argument for why the content underneath belongs to this tab and not
          the others.
        </p>
        <p>
          Never change the label weight between states. Bold on active and regular on inactive
          causes the whole row to reflow every time the user switches, and neighbouring labels shift
          under the cursor. Change colour instead — it costs no layout.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'variants',
        title: 'Three variants',
        description:
          'Underline for page-level sections, pill for switching a view inside a card, enclosed when the panel needs a visible container of its own.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="lg" className="w-full">
              {(['underline', 'pill', 'enclosed'] as const).map((v) => (
                <div key={v}>
                  <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">{v}</p>
                  <VariantDemo variant={v} />
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'misuse',
        title: 'The three misuses',
        description:
          'Each of these is a real pattern seen in production, and each has a component that does the job better.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-3">
              {[
                ['As a wizard', 'Step 1 · Step 2 · Step 3', 'Tabs imply free movement. A wizard has prerequisites and a direction.'],
                ['As a filter', 'All · Active · Archived', 'The subject changes between tabs. That is a filter, and filters should be chips.'],
                ['As navigation', 'Dashboard · Billing · Team', 'Separate destinations need URLs, titles and browser history.'],
              ].map(([title, labels, why]) => (
                <div
                  key={title}
                  className="rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/40 p-4"
                >
                  <p className="text-label text-[var(--ds-fg)]">{title}</p>
                  <p className="mt-2 font-mono text-[11px] text-[var(--ds-fg-secondary)]">{labels}</p>
                  <p className="mt-2 text-caption leading-relaxed text-[var(--ds-fg-muted)]">{why}</p>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'overflow',
        title: 'Too many tabs',
        description:
          'Past about seven, tabs stop being scannable. Scrolling hides destinations; a sidebar or a select shows them all.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-lg overflow-x-auto">
              <div className="w-[46rem]">
                <Tabs
                  aria-label="Too many"
                  value="a"
                  onChange={() => {}}
                  tabs={[
                    'Overview',
                    'Logs',
                    'Metrics',
                    'Traces',
                    'Security',
                    'Networking',
                    'Storage',
                    'Environment',
                    'Integrations',
                    'Billing',
                  ].map((l, i) => ({ value: i === 0 ? 'a' : l, label: l }))}
                />
              </div>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Active', render: <MiniTabs active /> },
      { label: 'Inactive', render: <MiniTabs /> },
      { label: 'Hover', render: <span className="text-label text-[var(--ds-fg-secondary)]">Logs</span> },
      { label: 'Focus', render: <span className="rounded-[var(--radius-sm)] px-2 py-1 text-label outline-2 outline-offset-[-2px] outline-[var(--ds-focus-ring)]">Logs</span> },
      { label: 'Disabled', render: <span className="text-label text-[var(--ds-fg-disabled)]">Billing</span> },
      { label: 'With count', render: <MiniTabs active count /> },
      { label: 'With icon', render: <span className="inline-flex items-center gap-1.5 text-label text-[var(--ds-fg)]"><FileText size={14} /> Logs</span> },
      { label: 'Pill', render: <span className="rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] px-3 py-1.5 text-label shadow-e1">Logs</span> },
      { label: 'Enclosed', render: <span className="rounded-t-[var(--radius-md)] border border-b-0 border-[var(--ds-border)] bg-[var(--ds-surface)] px-3 py-1.5 text-label">Logs</span> },
      { label: 'Full width', render: <div className="w-32"><Tabs aria-label="fw" fullWidth value="a" onChange={() => {}} tabs={[{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }]} /></div> },
      { label: 'Panel', render: <span className="text-caption text-[var(--ds-fg-muted)]">role="tabpanel"</span> },
      { label: 'Roving', note: 'One tab stop', render: <span className="text-caption text-[var(--ds-fg-muted)]">tabindex 0 / −1</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Tabs
          aria-label="Anatomy"
          value="logs"
          onChange={() => {}}
          tabs={TABS.slice(0, 3)}
        />
        <div className="rounded-b-[var(--radius-lg)] border border-t-0 border-[var(--ds-border-subtle)] p-4">
          <p className="text-body-sm text-[var(--ds-fg-muted)]">
            The active underline breaks the container border, connecting the tab to its panel.
          </p>
        </div>
      </div>
    ),
    caption:
      'Underline variant. The 2px indicator sits on the 1px container border, so the active tab and the panel below read as one surface.',
    parts: [
      {
        n: 1,
        label: 'Tab height',
        value: '36px (md), 32px (sm)',
        kind: 'size',
        note: 'The same as a button, so a tab row aligns with any controls sitting beside it.',
      },
      {
        n: 2,
        label: 'Indicator',
        value: '2px, on the border line',
        kind: 'shape',
        note: 'The tab is pulled down 1px so the indicator overlaps the container border. That overlap is what visually joins the tab to its panel.',
      },
      {
        n: 3,
        label: 'Label colour',
        value: 'muted → fg',
        kind: 'color',
        note: 'Colour changes, weight does not. Changing the weight reflows the whole row on every switch.',
      },
      {
        n: 4,
        label: 'Gap',
        value: '4px between tabs',
        kind: 'space',
        note: 'Tight, because the tabs are one group. The padding inside each tab does the separating.',
      },
      {
        n: 5,
        label: 'Count badge',
        value: '18px, neutral or accent',
        kind: 'shape',
        note: 'Accent on the active tab, neutral elsewhere. A count on every tab in bright accent is a row of competing signals.',
      },
      {
        n: 6,
        label: 'Panel gap',
        value: '20px below the tabs',
        kind: 'space',
        note: 'Enough that the panel is clearly separate content, close enough that it is clearly the tab’s content.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent', usedFor: 'Active underline' },
    { category: 'color', token: '--ds-fg', usedFor: 'Active label' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Inactive label' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'The container line the indicator sits on' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Active pill background' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover wash on pill and enclosed variants' },
    { category: 'spacing', token: 'tab padding', value: '0 12px', usedFor: 'Horizontal padding' },
    { category: 'spacing', token: 'gap', value: '4px', usedFor: 'Between tabs' },
    { category: 'spacing', token: 'panel gap', value: '20px', usedFor: 'Tabs to panel' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Focus ring and pill corners' },
    { category: 'shadow', token: '--shadow-e1', usedFor: 'Active pill lift' },
    { category: 'motion', token: 'duration', value: '140ms standard', usedFor: 'Colour transition' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px', type: '12px', gap: '4px', touch: '44px (padded)', use: 'Inside a card or a panel header.' },
    { name: 'Medium', height: '36px', padding: '0 12px', type: '13px', gap: '4px', touch: '44px (padded)', use: 'Page-level sections. The default.' },
    { name: 'Full width', height: '36px', minWidth: '96px per tab', use: 'Two to four tabs on mobile, distributed evenly.' },
    { name: 'Count badge', height: '18px', use: 'Accent on the active tab, neutral on the rest.' },
  ],

  do: [
    {
      title: 'Keep the subject constant across tabs',
      why: 'All of these are views of one project. The moment a tab shows a different object, the user loses the thread and the pattern stops being tabs.',
      render: (
        <Stack gap="xs" className="w-full">
          <span className="text-caption text-[var(--ds-fg-muted)]">Project: api-gateway</span>
          <Tabs
            aria-label="Do"
            value="logs"
            onChange={() => {}}
            tabs={TABS.slice(0, 4).map((t) => ({ ...t, count: undefined }))}
          />
        </Stack>
      ),
    },
    {
      title: 'Put the tab in the URL',
      why: 'A tab is a view worth linking to. Without a URL, a user cannot share "the logs tab" and the browser back button skips the whole page instead of the tab.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          /projects/api-gateway?tab=logs
        </code>
      ),
    },
    {
      title: 'Change colour, not weight',
      why: 'A bold active label is wider than a regular one, so every switch reflows the row and neighbouring tabs move under the cursor.',
      render: (
        <MiniTabs active />
      ),
    },
    {
      title: 'Order by frequency, and never reorder',
      why: 'Users navigate by position after the first few visits. A tab row that reorders itself based on state destroys that muscle memory completely.',
      render: (
        <Tabs
          aria-label="Order"
          value="overview"
          onChange={() => {}}
          tabs={TABS.slice(0, 4).map((t) => ({ ...t, icon: undefined, count: undefined }))}
        />
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use tabs for a sequence',
      why: 'Tabs imply free movement between peers. A checkout with Cart, Shipping and Payment tabs lets the user jump to Payment before entering an address.',
      render: (
        <Tabs
          aria-label="Wizard misuse"
          value="a"
          onChange={() => {}}
          tabs={[
            { value: 'a', label: '1. Cart' },
            { value: 'b', label: '2. Shipping' },
            { value: 'c', label: '3. Payment' },
          ]}
        />
      ),
    },
    {
      title: 'Do not scroll a tab row',
      why: 'Tabs off-screen are tabs nobody knows exist. Horizontal scroll inside a vertically scrolling page is also a constant gesture conflict on touch.',
      render: (
        <div className="w-full overflow-x-auto">
          <div className="w-[36rem]">
            <Tabs
              aria-label="Overflow misuse"
              value="a"
              onChange={() => {}}
              tabs={['Overview', 'Logs', 'Metrics', 'Traces', 'Security', 'Networking', 'Storage', 'Billing'].map(
                (l, i) => ({ value: i === 0 ? 'a' : l, label: l }),
              )}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Do not nest tab rows',
      why: 'Two levels of tabs makes it impossible to tell which row owns the content. If you need a second level, the first level is really navigation.',
      render: (
        <Stack gap="sm" className="w-full">
          <Tabs
            aria-label="Outer"
            value="a"
            onChange={() => {}}
            tabs={[
              { value: 'a', label: 'Monitoring' },
              { value: 'b', label: 'Settings' },
            ]}
          />
          <div className="pl-4">
            <Tabs
              aria-label="Inner"
              size="sm"
              value="x"
              onChange={() => {}}
              tabs={[
                { value: 'x', label: 'Logs' },
                { value: 'y', label: 'Metrics' },
                { value: 'z', label: 'Traces' },
              ]}
            />
          </div>
        </Stack>
      ),
    },
    {
      title: 'Do not hide critical actions in a tab',
      why: 'Anything behind a tab is invisible until the user goes looking. A "Danger zone" tab means the delete action is discovered by accident, or not at all.',
      render: (
        <Tabs
          aria-label="Hidden"
          value="a"
          onChange={() => {}}
          tabs={[
            { value: 'a', label: 'General' },
            { value: 'b', label: 'Danger zone' },
          ]}
        />
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The inactive label must reach 4.5:1 — it is real text, not decoration, and it is the most commonly failed part of a tab row.',
      'The 2px indicator must reach 3:1 against the container. It is the only visual carrier of which tab is active.',
      'Never rely on the indicator alone. The active label also changes colour, so the state survives greyscale.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the tablist at the active tab. One stop for the whole row.' },
      { keys: '← / →', does: 'Moves between tabs and activates them. Skips disabled tabs and wraps at the ends.' },
      { keys: 'Home / End', does: 'First and last tab.' },
      { keys: 'Tab (again)', does: 'Moves into the panel, not to the next tab.' },
      { keys: 'Enter / Space', does: 'Activates in manual-activation mode. Not needed with automatic activation.' },
    ],
    aria: [
      { attr: 'role="tablist" + aria-label', on: 'The container', note: 'Names the group. Two tab rows on a page need two distinct labels.' },
      { attr: 'role="tab" + aria-selected', on: 'Each tab', note: 'Exactly one tab has aria-selected="true" at a time.' },
      { attr: 'aria-controls', on: 'Each tab', note: 'Points at its panel id, so the relationship is explicit.' },
      { attr: 'role="tabpanel" + aria-labelledby', on: 'Each panel', note: 'Points back at its tab, giving the panel a name.' },
      { attr: 'tabindex', on: 'The tabs', note: '0 on the active tab, −1 on the rest. This is what makes the row one tab stop.' },
      { attr: 'tabindex={0}', on: 'The panel', note: 'So a panel with no focusable content can still be reached and scrolled by keyboard.' },
    ],
    focus:
      'Automatic activation — arrowing selects — is correct when panels are cheap to render. If switching triggers a network request, use manual activation so arrowing moves focus and Enter commits.',
    screenReader: [
      'Announced as "Logs, tab, 2 of 5, selected". The position comes from the tablist, which is why a row of plain buttons is not equivalent.',
      'Do not render inactive panels. Keeping them in the DOM means their content is reachable by screen reader and by Ctrl+F when it should not be.',
      'A tab with a count badge should include it in the accessible name: "Logs, 12 items" rather than "Logs 12".',
    ],
    touch:
      'Tabs are padded to a 44px target on coarse pointers. Full-width tabs are the better mobile pattern for two to four options; more than that belongs in a select or a drawer.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Tabs, TabPanel } from '@/ui/Navigation'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'logs',     label: 'Logs', count: 12 },
  { value: 'security', label: 'Security' },
]

// Keep the tab in the URL — it is a view worth linking to
const [params, setParams] = useSearchParams()
const tab = params.get('tab') ?? 'overview'

<Tabs
  tabs={TABS}
  value={tab}
  onChange={(v) => setParams({ tab: v }, { replace: true })}
  aria-label="Project sections"
/>

{TABS.map((t) => (
  <TabPanel key={t.value} value={t.value} active={t.value === tab}>
    <PanelFor id={t.value} />
  </TabPanel>
))}

// Only render the active panel. Keeping the others mounted makes their
// content reachable by screen reader and by Ctrl+F.
// Lazy-load anything heavy behind a tab:
const Metrics = lazy(() => import('./Metrics'))`,
    },
    html: {
      lang: 'html',
      code: `<div role="tablist" aria-label="Project sections">
  <button role="tab" id="tab-overview"
          aria-selected="true" aria-controls="panel-overview" tabindex="0">
    Overview
  </button>
  <button role="tab" id="tab-logs"
          aria-selected="false" aria-controls="panel-logs" tabindex="-1">
    Logs
    <span class="ds-badge" aria-label="12 items">12</span>
  </button>
</div>

<div role="tabpanel" id="panel-overview"
     aria-labelledby="tab-overview" tabindex="0">
  …
</div>

<!-- The inactive panel is NOT rendered, not just hidden -->`,
    },
    css: {
      lang: 'css',
      code: `.ds-tablist {
  display: flex;
  gap: 4px;
  border-block-end: 1px solid var(--ds-border-subtle);
}

.ds-tab {
  block-size: 36px;
  padding-inline: 12px;
  color: var(--ds-fg-muted);
  font-weight: 500;                  /* the SAME in every state */
  border-block-end: 2px solid transparent;
  margin-block-end: -1px;            /* overlap the container border */
  transition: color 140ms var(--ease-standard),
              border-color 140ms var(--ease-standard);
}

.ds-tab:hover { color: var(--ds-fg-secondary); }

/* Colour and the indicator change. Weight never does — a bold active
   label is wider and reflows the whole row on every switch. */
.ds-tab[aria-selected='true'] {
  color: var(--ds-fg);
  border-block-end-color: var(--ds-accent);
}

.ds-tab:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: -2px;              /* inset, so it is not clipped */
  border-radius: var(--radius-sm);
}

.ds-tab:disabled { opacity: 0.4; pointer-events: none; }

/* The panel is a focus stop even with no focusable content inside */
.ds-tabpanel:focus-visible { outline: none; }
.ds-tabpanel { padding-block-start: 20px; }

@media (pointer: coarse) {
  .ds-tab { min-block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'Tabs',
        props: [
          { name: 'tabs', type: 'TabSpec[]', required: true, description: '{ value, label, icon?, count?, disabled? }. Two to seven.' },
          { name: 'value', type: 'string', required: true, description: 'Controlled active tab.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fired on click and on arrow-key movement.' },
          { name: 'variant', type: "'underline' | 'pill' | 'enclosed'", default: "'underline'", description: 'Underline for page sections, pill inside cards, enclosed when the panel needs a container.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '32px or 36px.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Distributes tabs evenly. Two to four only.' },
          { name: 'aria-label', type: 'string', required: true, description: 'Names the tablist. Required when there is more than one on a page.' },
        ],
      },
      {
        name: 'TabPanel',
        props: [
          { name: 'value', type: 'string', required: true, description: 'Must match its tab’s value — it wires aria-labelledby and the id.' },
          { name: 'active', type: 'boolean', required: true, description: 'Renders nothing when false. Do not hide with CSS.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Two to seven tabs. Below two it is not a choice; above seven the row stops being scannable and the labels start truncating.',
      'Lazy-load heavy panels but prefetch the adjacent ones on hover. Switching should feel instant even when the panel is a chart.',
      'A count badge should only appear when the count is actionable. "Logs 4,281" is noise; "Security 2" is a call to action.',
      'If a tab is empty for a given object, keep it visible and show an empty state. Removing tabs conditionally makes the row a different shape on every record.',
    ],
    performance: [
      'Render only the active panel. Mounting all of them multiplies the initial render cost and puts hidden content into Ctrl+F and the accessibility tree.',
      'Preserve scroll position per tab. Returning to a tab and finding it scrolled to the top is a small, repeated frustration.',
      'For panels with expensive charts, keep the data cached but unmount the DOM. Re-fetching on every switch is the more common and more visible mistake.',
      'Do not animate the panel transition. A crossfade delays content the user has explicitly asked for.',
    ],
    mistakes: [
      'Using buttons instead of a real tablist, which costs one tab stop per tab and loses the "2 of 5" announcement.',
      'Changing the label weight on the active tab, which reflows the entire row on every switch.',
      'Keeping inactive panels in the DOM, so hidden content is found by Ctrl+F and read by screen readers.',
      'No URL for the active tab, so a tab cannot be shared and the back button skips the whole page.',
      'Nesting tab rows, making it impossible to tell which row owns the content below.',
    ],
    realWorld: [
      'When a tab row grows past seven, the page is usually doing too much. Splitting it into two pages almost always reads better than adding a scroll.',
      'Log which tabs are opened. A tab used by under 2% of sessions is a candidate for removal or for a link somewhere less prominent.',
      'On mobile, three or fewer full-width tabs work well. More than that and a select or a drawer is genuinely easier to use than a scrolling row.',
      'Keep the first tab the one people want most often. The default view is the one the majority of users will ever see.',
    ],
  },
})

/* ---- demos --------------------------------------------------------------- */

function VariantDemo({ variant }: { variant: 'underline' | 'pill' | 'enclosed' }) {
  const [v, setV] = React.useState('overview')
  return (
    <div>
      <Tabs
        aria-label={variant}
        variant={variant}
        value={v}
        onChange={setV}
        tabs={TABS.slice(0, 4).map((t) => ({ ...t, count: undefined }))}
      />
      <div
        className={
          variant === 'enclosed'
            ? 'rounded-b-[var(--radius-lg)] rounded-tr-[var(--radius-lg)] border border-t-0 border-[var(--ds-border)] p-4'
            : 'pt-4'
        }
      >
        <p className="text-body-sm text-[var(--ds-fg-muted)]">Panel for {v}.</p>
      </div>
    </div>
  )
}

function MiniTabs({ active, count }: { active?: boolean; count?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 border-b-2 px-2 py-1.5 text-label ${
        active
          ? 'border-[var(--ds-accent)] text-[var(--ds-fg)]'
          : 'border-transparent text-[var(--ds-fg-muted)]'
      }`}
    >
      Logs
      {count && (
        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[var(--ds-accent)] px-1 text-[10px] text-[var(--ds-accent-fg)]">
          12
        </span>
      )}
    </span>
  )
}
