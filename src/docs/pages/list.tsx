import * as React from 'react'
import { ChevronRight, GitBranch, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from '@/ui/Button'
import { Avatar, Badge } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const ROWS = [
  { id: '1', name: 'api-gateway', meta: 'Deployed 4 minutes ago', tone: 'success' as const, status: 'Live' },
  { id: '2', name: 'billing-worker', meta: 'Deployed 2 hours ago', tone: 'success' as const, status: 'Live' },
  { id: '3', name: 'search-indexer', meta: 'Failed 20 minutes ago', tone: 'danger' as const, status: 'Failed' },
  { id: '4', name: 'web-frontend', meta: 'Building…', tone: 'warning' as const, status: 'Building' },
]

function List({
  lines = 2,
  dividers = true,
  interactive,
  leading = 'icon',
  compact,
}: {
  lines?: 1 | 2
  dividers?: boolean
  interactive?: boolean
  leading?: 'none' | 'icon' | 'avatar'
  compact?: boolean
}) {
  const Row_ = interactive ? 'button' : 'div'
  return (
    <ul
      className={cn(
        'w-full overflow-hidden rounded-[var(--radius-lg)]',
        dividers && 'border border-[var(--ds-border-subtle)]',
      )}
    >
      {ROWS.map((r, i) => (
        <li key={r.id} className={cn(dividers && i > 0 && 'border-t border-[var(--ds-border-subtle)]')}>
          <Row_
            {...(interactive ? { type: 'button' as const } : {})}
            className={cn(
              'flex w-full items-center gap-3 text-left',
              compact ? 'px-3 py-2' : 'px-3.5 py-2.5',
              lines === 1 && !compact && 'py-2',
              interactive &&
                'transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
            )}
          >
            {leading === 'icon' && (
              <span className="shrink-0 text-[var(--ds-fg-muted)]">
                <GitBranch size={16} />
              </span>
            )}
            {leading === 'avatar' && <Avatar name={r.name} size="md" square />}

            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-label text-[var(--ds-fg)]">{r.name}</span>
              {/* The second line is metadata, not a second title — one step
                  down in size and two in colour. */}
              {lines === 2 && (
                <span className="truncate text-caption text-[var(--ds-fg-muted)]">{r.meta}</span>
              )}
            </span>

            <Badge tone={r.tone} size="sm" className="shrink-0">
              {r.status}
            </Badge>

            {interactive ? (
              <ChevronRight size={15} aria-hidden className="shrink-0 text-[var(--ds-fg-disabled)]" />
            ) : (
              <IconButton size="sm" label={`More actions for ${r.name}`} icon={<MoreHorizontal />} />
            )}
          </Row_>
        </li>
      ))}
    </ul>
  )
}

function KeyValue() {
  const PAIRS: [string, React.ReactNode][] = [
    ['Deployment', <span key="a" className="font-mono">dpl_7Hq3nR8vTx</span>],
    ['Region', 'Europe (London) · eu-west-2'],
    ['Duration', '42 seconds'],
    ['Triggered by', 'Ada Lovelace'],
    ['Commit', <span key="b" className="font-mono">4021ab9</span>],
  ]
  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      {/* A description list, because these are genuinely term/definition
          pairs — not a table with the headers hidden. */}
      <dl className="grid w-full max-w-md grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2.5">
        {PAIRS.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-caption text-[var(--ds-fg-muted)]">{k}</dt>
            <dd className="min-w-0 truncate text-body-sm text-[var(--ds-fg-secondary)]">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </PreviewStage>
  )
}

function Playground() {
  const [lines, setLines] = React.useState<'1' | '2'>('2')
  const [leading, setLeading] = React.useState<'none' | 'icon' | 'avatar'>('icon')
  const [dividers, setDividers] = React.useState(true)
  const [interactive, setInteractive] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Lines">
            <KnobSelect value={lines} onChange={setLines} options={['1', '2'] as const} />
          </Knob>
          <Knob label="Leading">
            <KnobSelect
              value={leading}
              onChange={setLeading}
              options={['none', 'icon', 'avatar'] as const}
            />
          </Knob>
          <KnobToggle checked={dividers} onChange={setDividers} label="Dividers" />
          <KnobToggle checked={interactive} onChange={setInteractive} label="Interactive" />
        </div>
      }
      code={`<List>
  {items.map((item) => (
    <ListItem
      key={item.id}
      leading={<GitBranch />}
      title={item.name}${lines === '2' ? '\n      description={item.meta}' : ''}
      trailing={<Badge tone={item.tone}>{item.status}</Badge>}${interactive ? '\n      onClick={() => open(item)}' : ''}
    />
  ))}
</List>`}
    >
      <div className="w-full max-w-lg">
        <List
          lines={Number(lines) as 1 | 2}
          leading={leading}
          dividers={dividers}
          interactive={interactive}
        />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'list',
    title: 'List',
    tagline:
      'Vertical rows of items — single-line, two-line, with leading and trailing content, or as key–value pairs.',
    keywords: ['structured list', 'description list', 'definition list', 'item list', 'rows', 'dense'],
  },

  overview: {
    purpose:
      'A list presents a set of items in one vertical column, each row carrying a primary label and whatever supporting content it needs. It is the default container for anything countable that does not need columns — and the point at which it does need columns is the point it becomes a Data Table.',
    whenToUse: [
      'A set of items with one primary label and at most one line of supporting text.',
      'Navigable rows that lead somewhere: projects, conversations, files, notifications.',
      'Key–value details about one object, as a description list.',
      'Settings rows, where each row is a label and one control.',
    ],
    whenNotToUse: [
      {
        text: 'Rows need several aligned, sortable columns.',
        instead: 'a Data Table',
        to: '#/data-table',
      },
      {
        text: 'Each item needs an image, a description and its own actions.',
        instead: 'a Card grid, which gives each item room',
        to: '#/card',
      },
      {
        text: 'The items are commands raised from a trigger.',
        instead: 'a Menu',
        to: '#/menu',
      },
      {
        text: 'The structure is nested more than one level.',
        instead: 'a Tree View',
        to: '#/tree-view',
      },
    ],
    reasoning: (
      <>
        <p>
          A list is a <strong>single column of alignment</strong>. Every row shares one left edge
          for the leading element, one for the label, and one right edge for the trailing content.
          The moment a second column needs to align across rows, the eye starts doing a table's
          work without a table's affordances — that is the signal to switch.
        </p>
        <p>
          <strong>Use the right element.</strong> An ordered set is <code>&lt;ol&gt;</code>, an
          unordered one <code>&lt;ul&gt;</code>, and term/definition pairs are{' '}
          <code>&lt;dl&gt;</code>. A screen reader announces "list, 12 items" from the markup
          alone, which is information no amount of styling on a stack of divs can provide.
        </p>
        <p>
          The second line is <strong>metadata, not a second title</strong>. One step down in size
          and two in colour. If the two lines look like siblings, the row has no primary label and
          the list stops being scannable.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'key-value',
        title: 'Key–value pairs',
        description:
          'A description list, not a table with hidden headers. The term column is fixed-width so every value starts on the same edge.',
        render: <KeyValue />,
      },
      {
        id: 'density',
        title: 'One line or two',
        description:
          'One line for scanning a long set; two when the metadata is what tells items apart. Never three — that is a Card.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="One line" sub="Scanning" tone="good">
                <List lines={1} leading="none" compact />
              </Cell>
              <Cell label="Two lines" sub="Distinguishing" tone="good">
                <List lines={2} leading="icon" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-table',
        title: 'List or table',
        description:
          'Once a second value has to align across rows, the reader is doing a table’s work without a table’s sorting, alignment or headers.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="List" sub="One label, one status" tone="good">
                <List lines={1} leading="none" dividers={false} compact />
              </Cell>
              <Cell label="Faux table" sub="Two aligned columns, no headers" tone="bad">
                <Stack gap="xs" className="w-full">
                  {ROWS.map((r) => (
                    <Row key={r.id} gap="sm" className="w-full text-caption">
                      <span className="w-28 shrink-0 truncate text-[var(--ds-fg)]">{r.name}</span>
                      <span className="w-16 shrink-0 text-[var(--ds-fg-muted)]">42s</span>
                      <span className="w-20 shrink-0 text-[var(--ds-fg-muted)]">eu-west-2</span>
                      <span className="flex-1 text-[var(--ds-fg-muted)]">{r.status}</span>
                    </Row>
                  ))}
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'interactive',
        title: 'When the whole row is the target',
        description:
          'If the row navigates, the row is the button — not a link on the label. A trailing chevron says so, and any secondary action needs to stop propagation.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-lg">
              <List interactive leading="avatar" />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'One line',
        render: (
          <span className="flex w-56 items-center gap-3 px-3 py-2 text-label text-[var(--ds-fg)]">
            <GitBranch size={15} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">api-gateway</span>
          </span>
        ),
      },
      {
        label: 'Two lines',
        render: (
          <span className="flex w-56 items-center gap-3 px-3 py-2.5">
            <GitBranch size={16} className="text-[var(--ds-fg-muted)]" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-label text-[var(--ds-fg)]">api-gateway</span>
              <span className="truncate text-caption text-[var(--ds-fg-muted)]">4 minutes ago</span>
            </span>
          </span>
        ),
      },
      {
        label: 'Hover',
        render: (
          <span className="flex w-56 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 py-2 text-label text-[var(--ds-fg)]">
            <span className="flex-1">api-gateway</span>
            <ChevronRight size={14} className="text-[var(--ds-fg-disabled)]" />
          </span>
        ),
      },
      {
        label: 'Selected',
        render: (
          <span className="flex w-56 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-layer-selected)] px-3 py-2 text-label text-[var(--ds-fg)]">
            <span className="flex-1">api-gateway</span>
          </span>
        ),
      },
      {
        label: 'With avatar',
        render: (
          <span className="flex w-56 items-center gap-3 px-3 py-2">
            <Avatar name="Ada Lovelace" size="md" />
            <span className="flex-1 text-label text-[var(--ds-fg)]">Ada Lovelace</span>
          </span>
        ),
      },
      {
        label: 'With badge',
        render: (
          <span className="flex w-56 items-center gap-3 px-3 py-2">
            <span className="flex-1 text-label text-[var(--ds-fg)]">search-indexer</span>
            <Badge tone="danger" size="sm">
              Failed
            </Badge>
          </span>
        ),
      },
      {
        label: 'Key–value',
        render: (
          <span className="grid w-56 grid-cols-[5rem_1fr] gap-x-3 text-caption">
            <span className="text-[var(--ds-fg-muted)]">Region</span>
            <span className="text-[var(--ds-fg-secondary)]">eu-west-2</span>
          </span>
        ),
      },
      {
        label: 'Empty',
        render: (
          <span className="grid h-16 w-56 place-items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--ds-border-subtle)] text-caption text-[var(--ds-fg-muted)]">
            No deployments yet
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <List interactive />
      </div>
    ),
    caption:
      'Leading icon, a title and one line of metadata, a trailing status, and a chevron saying the whole row goes somewhere.',
    parts: [
      {
        n: 1,
        label: 'Row height',
        value: '40px one line, 52px two',
        kind: 'size',
        note: 'Both comfortably above the touch minimum. Two-line rows earn their extra height only when the metadata is what tells items apart.',
      },
      {
        n: 2,
        label: 'Horizontal padding',
        value: '14px',
        kind: 'space',
        note: 'Matches the container’s own padding, so a list inside a card does not look inset twice.',
      },
      {
        n: 3,
        label: 'Leading gap',
        value: '12px',
        kind: 'space',
        note: 'Fixed regardless of what is in the slot, so an icon row and an avatar row share a text edge.',
      },
      {
        n: 4,
        label: 'Title',
        value: '13px, --ds-fg',
        kind: 'type',
        note: 'The only full-contrast text in the row. Everything else is metadata and steps down.',
      },
      {
        n: 5,
        label: 'Metadata',
        value: '12px, --ds-fg-muted',
        kind: 'type',
        note: 'One step down in size, two in colour. Equal weight makes the row read as two titles and the list stops being scannable.',
      },
      {
        n: 6,
        label: 'Trailing',
        value: 'Right-aligned, shrink-0',
        kind: 'space',
        note: 'A badge, a count, a chevron or an action. It never shrinks — the title truncates instead.',
      },
      {
        n: 7,
        label: 'Divider inset',
        value: 'Aligned to the title',
        kind: 'shape',
        note: 'When there is a leading element, the rule starts at the text. Full-width rules make the list read as a table.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'List background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Container edge and row dividers' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Row hover on an interactive list' },
    { category: 'color', token: '--ds-layer-selected', usedFor: 'Selected row — never the hover value' },
    { category: 'color', token: '--ds-fg', usedFor: 'Row titles' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Metadata, leading icons, key column' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'The trailing chevron' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Leading gap' },
    { category: 'spacing', token: '--space-3-5', value: '14px', usedFor: 'Row horizontal padding' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Container corners' },
    { category: 'typography', token: '--text-label', value: '13px', usedFor: 'Row titles' },
  ],

  sizes: [
    { name: 'Compact', height: '32px', padding: '4px 12px', type: '12px', use: 'Dense sets a user scans rather than reads — a file list, a log.' },
    { name: 'One line', height: '40px', padding: '8px 14px', type: '13px', touch: '44px on coarse pointers', use: 'The default for a scannable set.' },
    { name: 'Two lines', height: '52px', padding: '10px 14px', use: 'When the metadata is what distinguishes items.' },
    { name: 'With avatar', height: '56px', gap: '12px', use: 'A 32px avatar plus padding. Larger avatars belong in a Card.' },
    { name: 'Key column', minWidth: '7rem', maxWidth: '12rem', use: 'Fixed, so every value starts on the same edge.' },
    { name: 'Measure', maxWidth: '40rem', use: 'A list stretched across a wide page leaves the trailing content marooned from the title.' },
  ],

  do: [
    {
      title: 'Use real list markup',
      why: 'A screen reader announces "list, 12 items" from ul and li alone. No amount of styling on a stack of divs provides that.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;ul&gt;&lt;li&gt;…&lt;/li&gt;&lt;/ul&gt;
          <br />
          &lt;dl&gt; for term / definition pairs
        </code>
      ),
    },
    {
      title: 'Make the whole row the target when it navigates',
      why: 'A link on the label alone leaves most of the row inert, and users click the row. The chevron is what says the whole thing is pressable.',
      render: (
        <span className="flex w-56 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 py-2 text-label text-[var(--ds-fg)]">
          <span className="flex-1">api-gateway</span>
          <ChevronRight size={14} className="text-[var(--ds-fg-disabled)]" />
        </span>
      ),
    },
    {
      title: 'Step the metadata down twice',
      why: 'One step in size and two in colour. Equal weight makes the row read as two titles, and the list stops being scannable.',
      render: (
        <Stack gap="xs" className="w-52">
          <span className="text-label text-[var(--ds-fg)]">api-gateway</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">Deployed 4 minutes ago</span>
        </Stack>
      ),
    },
    {
      title: 'Inset dividers to the text',
      why: 'With a leading avatar or icon, a full-width rule makes the list read as a table. Starting the rule at the title separates rows without implying columns.',
      render: (
        <div className="w-52">
          <Row gap="sm" align="center" className="py-1.5">
            <Avatar name="Ada Lovelace" size="sm" />
            <span className="text-label-sm text-[var(--ds-fg-secondary)]">Ada Lovelace</span>
          </Row>
          <div className="ml-9 h-px bg-[var(--ds-border-subtle)]" />
          <Row gap="sm" align="center" className="py-1.5">
            <Avatar name="Grace Hopper" size="sm" />
            <span className="text-label-sm text-[var(--ds-fg-secondary)]">Grace Hopper</span>
          </Row>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not build a table out of a list',
      why: 'Once a second value aligns across rows, the reader is doing a table’s work with none of its sorting, alignment or headers.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          {ROWS.slice(0, 3).map((r) => (
            <Row key={r.id} gap="sm" className="w-full text-caption text-[var(--ds-danger-text)]">
              <span className="w-24 shrink-0 truncate">{r.name}</span>
              <span className="w-12 shrink-0">42s</span>
              <span className="w-16 shrink-0">eu-west-2</span>
              <span className="flex-1">{r.status}</span>
            </Row>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Do not give a row three lines',
      why: 'At three lines the row stops being scannable and each item wants its own container. That container is a Card.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] p-3">
          <span className="text-label text-[var(--ds-fg)]">api-gateway</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">Deployed 4 minutes ago</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">
            Rolled back from 4021 after the health check failed in eu-west-2.
          </span>
        </Stack>
      ),
    },
    {
      title: 'Do not nest an action inside a pressable row without stopping propagation',
      why: 'The user aims at the overflow menu, hits the row, and navigates away from what they were about to act on.',
      render: (
        <span className="flex w-56 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2 text-label text-[var(--ds-fg)]">
          <span className="flex-1">api-gateway</span>
          <MoreHorizontal size={15} className="text-[var(--ds-danger-text)]" />
        </span>
      ),
    },
    {
      title: 'Do not let the title push the trailing content off',
      why: 'The status is often the reason the user is scanning. The title truncates; the trailing content never shrinks.',
      render: (
        <span className="flex w-48 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2">
          <span className="text-label text-[var(--ds-fg)]">
            api-gateway-production-eu-west-2-primary
          </span>
          <Badge tone="danger" size="sm">
            Failed
          </Badge>
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
    ],
    contrast: [
      'Row titles owe 4.5:1. Metadata is content too and owes the same — "secondary" does not mean exempt.',
      'The selected row must be distinguishable from the hovered row, or nothing is legible while the pointer is in the list.',
      'Dividers owe 3:1 only if they are the sole separation. If rows have their own hover surface, the rules are decorative.',
      'A trailing chevron may use the disabled tone — it is an affordance, and the row is also pressable as a whole.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Stops on each interactive row, then on any secondary action inside it.' },
      { keys: 'Enter', does: 'Activates the row. Space too, when the row is a button rather than a link.' },
      { keys: '↑ / ↓', does: 'Optional roving focus for a long list, so Tab does not stop fifty times. If you add it, the list is a listbox and needs those roles.' },
      { keys: 'Home / End', does: 'With roving focus, jumps to the first or last row.' },
    ],
    aria: [
      { attr: '<ul> / <ol> / <li>', on: 'The list', note: 'The item count comes from the markup. A stack of divs announces nothing.' },
      { attr: '<dl> / <dt> / <dd>', on: 'Key–value pairs', note: 'The term/definition relationship is what a description list is for, and it is announced.' },
      { attr: 'role="listbox" / "option"', on: 'A selectable list', note: 'Only when the list holds a selection. A navigable list stays as links or buttons.' },
      { attr: 'aria-current="page"', on: 'The row matching the current view', note: 'Distinct from selection — it means "you are here".' },
      { attr: 'aria-label', on: 'A secondary action', note: 'Must name the row: "More actions for api-gateway". Forty identical buttons otherwise.' },
      { attr: 'list-style: none', on: 'Styled lists', note: 'Safari removes list semantics when list-style is none. Add role="list" back explicitly.' },
    ],
    focus:
      'Focus order follows DOM order, which must follow visual order. When a row is removed, focus moves to the next row or to the list container — never to the body. A secondary action inside a pressable row must stop propagation on both click and keydown.',
    screenReader: [
      'The list announces its size: "list, 12 items". That is the single most useful thing the markup provides.',
      'Each row should read as one coherent phrase: "api-gateway, deployed 4 minutes ago, Live".',
      'An empty list needs an explicit message. A silent empty container is indistinguishable from one that failed to load.',
    ],
    touch:
      'Rows go to 44px, which one-line rows already nearly meet. A secondary action inside a pressable row needs its own 44px target and enough separation that a thumb aiming at one does not hit the other — in practice that means moving the action to a swipe or an overflow menu on small screens.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { List, ListItem } from '@/ui/Display'

<List aria-label="Deployments">
  {deployments.map((d) => (
    <ListItem
      key={d.id}
      leading={<GitBranch />}
      title={d.name}
      description={d.meta}          // metadata, not a second title
      trailing={<Badge tone={d.tone}>{d.status}</Badge>}
      onClick={() => open(d)}       // the WHOLE row is the target
    />
  ))}
</List>

// A secondary action inside a pressable row must stop propagation on both
// click and keydown, or the user aims at the menu and navigates away.
<button
  aria-label={\`More actions for \${d.name}\`}
  onClick={(e) => { e.stopPropagation(); openMenu() }}
  onKeyDown={(e) => e.stopPropagation()}
>
  <MoreHorizontal />
</button>

// Key–value pairs are a description list, not a table with hidden headers.
<dl className="grid grid-cols-[minmax(7rem,auto)_1fr] gap-x-4 gap-y-2.5">
  {pairs.map(([term, value]) => (
    <React.Fragment key={term}>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </React.Fragment>
  ))}
</dl>

// Safari drops list semantics when list-style is none. Add the role back.
<ul role="list" className="list-none">…</ul>`,
    },
    html: {
      lang: 'html',
      code: `<!-- role="list" because Safari removes list semantics when list-style
     is none, which every styled list sets. -->
<ul role="list" class="ds-list" aria-label="Deployments">
  <li>
    <a href="/d/4021" class="ds-list__row">
      <svg aria-hidden="true">…</svg>
      <span class="ds-list__text">
        <span class="ds-list__title">api-gateway</span>
        <span class="ds-list__meta">Deployed 4 minutes ago</span>
      </span>
      <span class="ds-badge">Live</span>
      <svg aria-hidden="true">…</svg>
    </a>
  </li>
</ul>

<!-- Term / definition pairs. The relationship is announced. -->
<dl class="ds-kv">
  <dt>Region</dt>
  <dd>Europe (London) · eu-west-2</dd>
  <dt>Duration</dt>
  <dd>42 seconds</dd>
</dl>

<!-- An empty list needs to say so. Silence reads as a failed load. -->
<p class="ds-list__empty">No deployments yet</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-list { list-style: none; margin: 0; padding: 0; }

.ds-list__row {
  display: flex;
  align-items: center;
  gap: 12px;                         /* fixed, so icon rows and avatar rows
                                        share one text edge */
  min-block-size: 40px;
  padding-inline: 14px;
  padding-block: 8px;
}

.ds-list__row:hover { background: var(--ds-layer-hover); }

/* Must differ from hover, or nothing is legible while the pointer is in
   the list. */
.ds-list__row[aria-current='page'] {
  background: var(--ds-layer-selected);
}

.ds-list__text { display: flex; flex-direction: column; min-inline-size: 0; }
.ds-list__title { color: var(--ds-fg); font-size: 13px; }

/* One step down in size, two in colour. Equal weight makes the row read as
   two titles. */
.ds-list__meta  { color: var(--ds-fg-muted); font-size: 12px; }
.ds-list__title,
.ds-list__meta { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* The title truncates; the trailing content never shrinks — it is often the
   reason the user is scanning. */
.ds-list__row > .ds-badge { flex: 0 0 auto; }

/* Inset to the text: a full-width rule makes the list read as a table. */
.ds-list > li + li > .ds-list__row::before {
  content: '';
  position: absolute;
  inset-inline: 14px 0;
  inset-block-start: 0;
  block-size: 1px;
  margin-inline-start: calc(16px + 12px);
  background: var(--ds-border-subtle);
}

.ds-kv {
  display: grid;
  /* Fixed term column, so every value starts on the same edge. */
  grid-template-columns: minmax(7rem, auto) 1fr;
  gap: 10px 16px;
}

@media (pointer: coarse) {
  .ds-list__row { min-block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'List',
        props: [
          { name: 'as', type: "'ul' | 'ol' | 'dl'", default: "'ul'", description: 'ol when the order is meaningful, dl for term/definition pairs. The element carries the semantics.' },
          { name: 'aria-label', type: 'string', description: 'Names the set. A list of twelve rows with no label is twelve announcements with no context.' },
          { name: 'dividers', type: 'boolean', default: 'true', description: 'Inset to the text when there is a leading element.' },
          { name: 'density', type: "'compact' | 'default'", default: "'default'", description: 'Compact for sets that are scanned rather than read.' },
        ],
      },
      {
        name: 'ListItem',
        props: [
          { name: 'title', type: 'ReactNode', required: true, description: 'The only full-contrast text in the row.' },
          { name: 'description', type: 'ReactNode', description: 'One line of metadata. Two lines means this should be a Card.' },
          { name: 'leading', type: 'ReactNode', description: 'An icon or an avatar. The gap is fixed regardless of which.' },
          { name: 'trailing', type: 'ReactNode', description: 'A badge, a count or an action. Never shrinks — the title truncates instead.' },
          { name: 'onClick', type: '() => void', description: 'Makes the whole row a button. Secondary actions inside must stop propagation.' },
          { name: 'href', type: 'string', description: 'Makes the whole row a link. Prefer this over onClick when it navigates.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Give an empty list an explicit message. A blank container is indistinguishable from one that failed to load, and users refresh.',
      'Truncate the title from the end but keep the trailing content pinned. The status is frequently the reason the user is scanning at all.',
      'Add a sticky header with a count for long lists. "48 deployments" answers a question the user would otherwise scroll to guess at.',
      'For selectable lists, put the checkbox in the leading slot and keep the row clickable for navigation. Two behaviours, two targets, no ambiguity.',
      'If every row has an overflow menu, consider whether the actions belong at the top of the list instead — one toolbar beats fifty menus.',
    ],
    performance: [
      'Virtualise past roughly 200 rows, and add aria-setsize and aria-posinset when you do — otherwise a windowed list reports "3 of 20" for 400 items.',
      'Give rows a fixed height where you can. Variable heights force a measurement pass per row and make virtualisation far harder.',
      'Memoise the row component on its item id. A list re-rendering every row on every keystroke elsewhere is the usual cause of a sluggish page.',
      'Use content-visibility: auto on long non-virtualised lists to skip off-screen layout for free.',
    ],
    mistakes: [
      'Divs instead of ul and li, so the item count is never announced.',
      'list-style: none with no role="list", which silently removes semantics in Safari.',
      'Building a table out of a list, with columns the reader has to align by eye.',
      'Metadata at the same weight as the title, so the row has no primary label.',
      'A nested action that does not stop propagation, navigating away when the user aimed at the menu.',
      'The title pushing the status off the row.',
      'Three-line rows that should have been Cards.',
      'A silent empty state.',
    ],
    realWorld: [
      'Lists are the most-used container in most products and the least designed. The two-step from title to metadata does more for scannability than any amount of spacing work.',
      'Users click rows, not labels. If the row navigates, make the row the target — the alternative is a permanent stream of "the link doesn’t work" reports.',
      'The moment a designer asks for a fourth column in a list, the answer is a table. Resisting that once saves rebuilding it later.',
      'On mobile, swipe actions are expected on list rows in native apps and rarely discoverable on the web. An overflow menu is less elegant and far more likely to be found.',
    ],
  },
})
