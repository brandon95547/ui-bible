import * as React from 'react'
import { Download, Filter, Search, Trash2 } from 'lucide-react'
import {
  DataTable,
  TableCardList,
  TableToolbar,
  type Column,
  type SortState,
} from '@/ui/Table'
import { Button } from '@/ui/Button'
import { Avatar, Badge, Chip } from '@/ui/Display'
import { SearchInput } from '@/ui/Input'
import { EmptyState } from '@/ui/Feedback'
import { Pagination } from '@/ui/Navigation'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

interface Deploy {
  id: string
  service: string
  env: 'production' | 'staging' | 'preview'
  status: 'live' | 'building' | 'failed'
  author: string
  duration: number
  requests: number
}

const DATA: Deploy[] = [
  { id: 'd1', service: 'api-gateway', env: 'production', status: 'live', author: 'Ada Lovelace', duration: 42, requests: 1_240_331 },
  { id: 'd2', service: 'billing-worker', env: 'production', status: 'failed', author: 'Grace Hopper', duration: 11, requests: 84_112 },
  { id: 'd3', service: 'edge-cache', env: 'staging', status: 'live', author: 'Alan Turing', duration: 68, requests: 412_005 },
  { id: 'd4', service: 'search-index', env: 'preview', status: 'building', author: 'Katherine Johnson', duration: 130, requests: 9_820 },
  { id: 'd5', service: 'auth-service', env: 'production', status: 'live', author: 'Ada Lovelace', duration: 37, requests: 2_004_918 },
  { id: 'd6', service: 'webhook-relay', env: 'staging', status: 'live', author: 'Grace Hopper', duration: 24, requests: 55_301 },
]

const STATUS_TONE = { live: 'success', building: 'info', failed: 'danger' } as const
const nf = new Intl.NumberFormat('en-US')

function useColumns(): Column<Deploy>[] {
  return React.useMemo(
    () => [
      {
        id: 'service',
        header: 'Service',
        sortBy: (r) => r.service,
        sticky: true,
        cell: (r) => (
          <span className="font-mono text-[var(--ds-fg)]">{r.service}</span>
        ),
      },
      {
        id: 'env',
        header: 'Environment',
        sortBy: (r) => r.env,
        hideBelow: 'md',
        cell: (r) => <span className="capitalize">{r.env}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        sortBy: (r) => r.status,
        cell: (r) => (
          <Badge tone={STATUS_TONE[r.status]} size="sm" dot>
            {r.status}
          </Badge>
        ),
      },
      {
        id: 'author',
        header: 'Deployed by',
        sortBy: (r) => r.author,
        hideBelow: 'lg',
        cell: (r) => (
          <span className="inline-flex items-center gap-2">
            <Avatar name={r.author} size="xs" />
            {r.author}
          </span>
        ),
      },
      {
        id: 'duration',
        header: 'Build',
        align: 'right',
        numeric: true,
        sortBy: (r) => r.duration,
        hideBelow: 'sm',
        cell: (r) => <span>{r.duration}s</span>,
      },
      {
        id: 'requests',
        header: 'Requests',
        align: 'right',
        numeric: true,
        sortBy: (r) => r.requests,
        cell: (r) => <span>{nf.format(r.requests)}</span>,
      },
    ],
    [],
  )
}

function Playground() {
  const columns = useColumns()
  const [density, setDensity] = React.useState<'compact' | 'normal' | 'relaxed'>('normal')
  const [sort, setSort] = React.useState<SortState>({ id: 'requests', dir: 'desc' })
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [selectable, setSelectable] = React.useState(true)
  const [sticky, setSticky] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const rows = React.useMemo(
    () =>
      query
        ? DATA.filter((d) =>
            (d.service + d.env + d.author).toLowerCase().includes(query.toLowerCase()),
          )
        : DATA,
    [query],
  )

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={0}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Density">
            <KnobSelect
              value={density}
              onChange={setDensity}
              options={['compact', 'normal', 'relaxed'] as const}
            />
          </Knob>
          <KnobToggle checked={selectable} onChange={setSelectable} label="Selectable" />
          <KnobToggle checked={sticky} onChange={setSticky} label="Sticky header" />
          <KnobToggle checked={loading} onChange={setLoading} label="Loading" />
        </div>
      }
    >
      <Stack gap="sm" className="w-full">
        <TableToolbar
          selectedCount={selected.size}
          bulkActions={
            <>
              <Button size="xs" variant="text" startIcon={<Download />}>
                Export
              </Button>
              <Button size="xs" variant="danger-outline" startIcon={<Trash2 />}>
                Delete
              </Button>
            </>
          }
        >
          <SearchInput
            size="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery('')}
            placeholder="Search deployments…"
            className="max-w-xs"
          />
          <Chip size="sm" icon={<Filter size={12} />}>
            Filters
          </Chip>
        </TableToolbar>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={setSort}
          selectable={selectable}
          selected={selected}
          onSelectedChange={setSelected}
          density={density}
          stickyHeader={sticky}
          loading={loading}
          caption="Recent deployments"
          emptyState={
            <EmptyState
              compact
              icon={<Search size={18} />}
              title="No deployments match"
              description={`Nothing matches “${query}”. Try a different service name.`}
              action={
                <Button size="sm" variant="outlined" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          }
        />

        <Pagination page={1} pageCount={7} onPageChange={() => {}} totalItems={248} pageSize={6} />
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'data-table',
    title: 'Data Table',
    tagline:
      'For comparing rows against each other. If the user is not comparing, a list of cards reads better and survives mobile.',
    keywords: ['data grid', 'datatable', 'rows', 'columns', 'sort', 'filter', 'pagination', 'selection', 'sticky'],
  },

  overview: {
    purpose:
      'A table exists so that the same field can be compared across many records. The columns are the point: they align values into a vertical strip the eye can scan without reading. Any interface where the user is looking at one record at a time does not need a table.',
    whenToUse: [
      'The user compares the same fields across many records — the defining case.',
      'The data is naturally tabular: numbers, dates, statuses, identifiers.',
      'Bulk operations apply to a selection of rows.',
      'Sorting or filtering by column is genuinely part of the task.',
    ],
    whenNotToUse: [
      {
        text: 'Each item is looked at individually rather than compared.',
        instead: 'a list of Cards',
        to: '#/card',
      },
      {
        text: 'There are fewer than about four rows.',
        instead: 'a definition list',
      },
      {
        text: 'Rows have wildly different shapes or optional fields.',
        instead: 'Cards, where a missing field can simply be absent',
      },
      {
        text: 'The primary surface is a phone.',
        instead: 'a card list, with the table above md',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Horizontal rules only.</strong> Vertical rules turn a scannable grid into a
          spreadsheet and add twenty-odd lines of visual noise per screen. Column alignment does the
          separating; the ruling is only there to keep the eye on one row during a long horizontal
          traverse.
        </p>
        <p>
          Numbers are <strong>right-aligned with tabular figures</strong>, always. Right alignment
          puts the units column in the same place on every row, so orders of magnitude become
          visible as shape rather than requiring the digits to be read. Left-aligned numbers in a
          table are the single most common formatting mistake in enterprise software.
        </p>
        <p>
          Row height at normal density is <strong>44px</strong>: two lines of 13px metadata fit, and
          it clears the touch minimum for a whole-row target. Compact goes to 36px for power users
          on large screens, relaxed to 56px when rows carry avatars. Density should be a user
          preference, not a decision made once by a designer.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'responsive',
        title: 'Responsive fallback',
        description:
          'Below md the table becomes a card list carrying the same fields as a definition list. Horizontal scrolling a table on a phone is the pattern this replaces.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <ResponsiveDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'states',
        title: 'Empty, loading, error',
        description:
          'Three states that every table needs and most tables forget. Note that the empty state distinguishes "no data yet" from "no results for this filter" — they need different actions.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <TableStates />
          </PreviewStage>
        ),
      },
      {
        id: 'density',
        title: 'Density',
        description:
          'The same table at three row heights. Ship compact as a preference, never as the default — new users need the relaxed version to learn the structure.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <DensityDemo />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default row', render: <MiniRow /> },
      { label: 'Hover', render: <MiniRow className="bg-[var(--ds-layer-hover)]" /> },
      { label: 'Selected', render: <MiniRow className="bg-[var(--ds-layer-selected)]" /> },
      { label: 'Focus', render: <MiniRow className="outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]" /> },
      { label: 'Sorted asc', render: <span className="inline-flex items-center gap-1 text-label-sm text-[var(--ds-fg)]">Requests ↑</span> },
      { label: 'Sorted desc', render: <span className="inline-flex items-center gap-1 text-label-sm text-[var(--ds-fg)]">Requests ↓</span> },
      { label: 'Unsorted', render: <span className="inline-flex items-center gap-1 text-label-sm text-[var(--ds-fg-muted)]">Requests ⇅</span> },
      { label: 'Loading', render: <span className="block h-0.5 w-20 overflow-hidden rounded-full bg-[var(--ds-layer-active)]"><span className="block h-full w-full origin-left animate-[indeterminate_1.4s_cubic-bezier(0.2,0,0,1)_infinite] bg-[var(--ds-accent)]" /></span> },
      { label: 'Empty', render: <span className="text-caption text-[var(--ds-fg-muted)]">No rows</span> },
      { label: 'Bulk bar', render: <span className="rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] px-2 py-1 text-caption text-[var(--ds-accent-text)]">3 selected</span> },
      { label: 'Sticky header', render: <span className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2 py-1 text-label-sm text-[var(--ds-fg-muted)]">Header pinned</span> },
      { label: 'Numeric', note: 'Right, tabular', render: <span className="block w-20 text-right font-mono text-body-sm tabular-nums">1,240,331</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-2xl">
        <AnatomyTable />
      </div>
    ),
    caption:
      'Header, rows, and the alignment rules. The only vertical structure comes from the columns themselves.',
    parts: [
      {
        n: 1,
        label: 'Header height',
        value: '36px',
        kind: 'size',
        note: 'Shorter than a row, on an inset background. It is a label strip, not a row of data, and the height difference says so.',
      },
      {
        n: 2,
        label: 'Row height',
        value: '36 / 44 / 56px',
        kind: 'size',
        note: 'Compact, normal, relaxed. 44px is the default because it holds two lines of metadata and clears the touch minimum.',
      },
      {
        n: 3,
        label: 'Cell padding',
        value: '14px horizontal',
        kind: 'space',
        note: 'The same on both sides so a right-aligned number and a left-aligned label are optically equidistant from the column edge.',
      },
      {
        n: 4,
        label: 'Ruling',
        value: '1px horizontal only',
        kind: 'color',
        note: 'At 6% alpha. Vertical rules add roughly twenty lines per screen and turn a table into a spreadsheet.',
      },
      {
        n: 5,
        label: 'Numeric alignment',
        value: 'Right, tabular-nums',
        kind: 'type',
        note: 'Units line up in a vertical strip, so magnitude is readable as shape. This is the highest-value formatting rule in any table.',
      },
      {
        n: 6,
        label: 'Sort affordance',
        value: 'Hidden until hover',
        kind: 'motion',
        note: 'A permanent ⇅ on every sortable column is twelve pieces of chrome nobody is looking at. It appears on hover and stays once sorted.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Table background' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Header row' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Row rules and the outer edge' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Row hover' },
    { category: 'color', token: '--ds-layer-selected', usedFor: 'Selected row' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Bulk-action bar' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Header labels' },
    { category: 'spacing', token: 'cell padding', value: '12 / 14 / 16px', usedFor: 'compact / normal / relaxed' },
    { category: 'spacing', token: 'row height', value: '36 / 44 / 56px', usedFor: 'The three densities' },
    { category: 'radius', token: '--radius-xl', value: '16px', usedFor: 'Table wrapper corners' },
    { category: 'typography', token: '--text-body-sm', value: '13px', usedFor: 'Cell content' },
    { category: 'typography', token: '--text-label-sm', value: '12px', usedFor: 'Header labels' },
  ],

  sizes: [
    { name: 'Compact', height: '36px', padding: '0 12px', type: '13px', touch: 'pointer only', use: 'Power users on large screens. Offer it; never default to it.' },
    { name: 'Normal', height: '44px', padding: '0 14px', type: '13px', touch: '44px', use: 'The default. Holds two lines of metadata and clears the touch minimum.' },
    { name: 'Relaxed', height: '56px', padding: '0 16px', type: '13px', touch: '56px', use: 'Rows with avatars, thumbnails, or two-line cells.' },
    { name: 'Header', height: '36px', padding: '0 14px', type: '12px / 500', use: 'Always shorter than a data row.' },
    { name: 'Selection column', minWidth: '40px', use: 'Fixed width. Never let it flex.' },
    { name: 'Numeric column', maxWidth: '10ch', use: 'Right-aligned, tabular. Wide enough for the largest plausible value.' },
  ],

  do: [
    {
      title: 'Right-align numbers with tabular figures',
      why: 'Units land in the same column on every row, so orders of magnitude are visible as shape. Left-aligned numbers force the reader to count digits.',
      render: (
        <div className="w-full font-mono text-body-sm tabular-nums">
          {[1240331, 84112, 2004918].map((n) => (
            <div key={n} className="border-b border-[var(--ds-border-subtle)] py-1 text-right last:border-0">
              {nf.format(n)}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Keep the header visible while scrolling',
      why: 'Past about fifteen rows the user has forgotten which column is which. A sticky header at e2 costs nothing and removes constant scrolling back to the top.',
      render: (
        <div className="h-24 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <div className="sticky top-0 bg-[var(--ds-surface-inset)] px-3 py-1.5 text-label-sm text-[var(--ds-fg-muted)]">
            Service
          </div>
          {DATA.map((d) => (
            <div key={d.id} className="border-b border-[var(--ds-border-subtle)] px-3 py-2 font-mono text-caption last:border-0">
              {d.service}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Replace the filter row with bulk actions in place',
      why: 'Pushing the table down when a row is selected moves the row you just clicked out from under the cursor. Swap the toolbar contents instead.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-3 py-1.5">
          <span className="text-caption text-[var(--ds-accent-text)]">3 selected · Export · Delete</span>
        </div>
      ),
    },
    {
      title: 'Drop the least decision-relevant columns first',
      why: 'Responsive tables should shed columns in a deliberate order, not scroll horizontally. The identifier and the status survive to the smallest size.',
      render: (
        <Stack gap="xs" className="w-full font-mono text-[10px] text-[var(--ds-fg-muted)]">
          <span>lg — service · env · status · author · build · requests</span>
          <span>md — service · env · status · requests</span>
          <span>sm — service · status · requests</span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not add vertical rules',
      why: 'A twelve-column table gains eleven vertical lines on every screen. Alignment already separates the columns; the rules only add noise.',
      render: (
        <div className="w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border)]">
          {DATA.slice(0, 3).map((d) => (
            <div key={d.id} className="grid grid-cols-3 divide-x divide-[var(--ds-border)] border-b border-[var(--ds-border)] text-caption last:border-0">
              <span className="px-2 py-1.5 font-mono">{d.service}</span>
              <span className="px-2 py-1.5">{d.env}</span>
              <span className="px-2 py-1.5 text-right tabular-nums">{d.duration}s</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not scroll a table horizontally on mobile',
      why: 'Columns off-screen are columns nobody reads, and horizontal scroll inside a vertically scrolling page is a constant gesture conflict.',
      render: (
        <div className="w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <div className="flex w-[640px] gap-6 px-3 py-2 text-caption text-[var(--ds-fg-muted)]">
            {['Service', 'Environment', 'Status', 'Author', 'Build', 'Requests', 'Region'].map((h) => (
              <span key={h} className="whitespace-nowrap">{h}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Do not zebra-stripe',
      why: 'Striping was a fix for tables with no row rules. With a 1px rule and adequate row height it just adds a second competing pattern and makes hover harder to see.',
      render: (
        <div className="w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          {DATA.slice(0, 4).map((d, i) => (
            <div
              key={d.id}
              className={`px-3 py-2 font-mono text-caption ${i % 2 ? 'bg-[var(--ds-layer-hover)]' : ''}`}
            >
              {d.service}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not make the whole row clickable and also selectable',
      why: 'Clicking a row navigates; clicking the checkbox selects. If the checkbox does not stop propagation, selecting a row navigates away from it.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          click checkbox → row navigates → selection lost
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.3.2', name: 'Meaningful Sequence', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.11', name: 'Focus Not Obscured', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Header labels are muted but must still reach 4.5:1 — they are text, not decoration.',
      'Row hover and row selected must be distinguishable from each other and from the default row. Three states, three distinct values.',
      'Status badges inside cells follow the badge rules: colour plus a word, never colour alone.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through interactive elements in the table: sort buttons, checkboxes, row actions.' },
      { keys: 'Space', does: 'Toggles a focused row checkbox.' },
      { keys: 'Enter', does: 'Activates a sort header or a row link.' },
      { keys: 'Shift + click', does: 'Range-selects between the last selected row and this one.' },
      { keys: '⌘/Ctrl + A', does: 'Selects all rows when focus is inside the table.' },
      { keys: '↑ / ↓', does: 'Optional row-level focus in a grid-style table. Requires role="grid".' },
    ],
    aria: [
      { attr: '<table> + <th scope>', on: 'Structure', note: 'Real table semantics. A grid of divs with role="table" is possible but almost always implemented incompletely.' },
      { attr: 'aria-sort', on: 'The sorted <th>', note: '"ascending", "descending" or absent. Only one header carries it at a time.' },
      { attr: '<caption>', on: 'The table', note: 'Names the table for screen-reader users. Visually hidden is fine.' },
      { attr: 'aria-label', on: 'Row checkboxes', note: '"Select api-gateway", not "Select row". A column of identical names is useless.' },
      { attr: 'aria-live="polite"', on: 'The selection count', note: 'Announces "3 selected" without moving focus.' },
      { attr: 'aria-busy', on: '<tbody> while loading', note: 'On the container, so the update is not announced row by row.' },
      { attr: 'aria-rowcount', on: 'A virtualised table', note: 'The total, not the rendered count — otherwise it announces "row 12 of 20" in a table of 5,000.' },
    ],
    focus:
      'With a sticky header, set scroll-padding-top on the scroll container so a focused row is never hidden underneath it. This is WCAG 2.4.11 and it is very easy to miss.',
    screenReader: [
      'Header cells must use <th scope="col">. Without scope, cells are announced with no column context and the table is unusable.',
      'Announce the result count after filtering or sorting: "Sorted by requests, descending. 248 rows."',
      'Do not put essential information in a column that is hidden at small widths — hidden means gone for assistive tech too.',
    ],
    touch:
      'Rows are 44px at normal density. Keep the checkbox column at least 40px wide so the tap target does not overlap the first data column, and never put two adjacent icon buttons in a row without 8px between them.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { DataTable, TableToolbar, type Column } from '@/ui/Table'

const columns: Column<Deploy>[] = [
  {
    id: 'service',
    header: 'Service',
    sortBy: (r) => r.service,       // omit to make the column unsortable
    sticky: true,                   // pins during horizontal scroll
    cell: (r) => <span className="font-mono">{r.service}</span>,
  },
  {
    id: 'requests',
    header: 'Requests',
    align: 'right',
    numeric: true,                  // right-aligned + tabular figures
    sortBy: (r) => r.requests,
    cell: (r) => nf.format(r.requests),
  },
  {
    id: 'author',
    header: 'Deployed by',
    hideBelow: 'lg',                // shed the least decision-relevant first
    cell: (r) => <Author name={r.author} />,
  },
]

<DataTable
  columns={columns}
  rows={rows}
  rowKey={(r) => r.id}
  sort={sort}
  onSortChange={setSort}
  selectable
  selected={selected}
  onSelectedChange={setSelected}
  density={density}
  stickyHeader
  caption="Recent deployments"
  emptyState={<EmptyState … />}
/>

// Responsive: a card list below md, the table above it
<div className="md:hidden"><TableCardList … /></div>
<div className="hidden md:block"><DataTable … /></div>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-table-wrap">
  <table class="ds-table">
    <caption class="sr-only">Recent deployments</caption>

    <thead>
      <tr>
        <th scope="col" class="ds-table__select">
          <input type="checkbox" aria-label="Select all rows" />
        </th>
        <th scope="col">Service</th>
        <th scope="col" aria-sort="descending">
          <button type="button">Requests <span aria-hidden="true">↓</span></button>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td><input type="checkbox" aria-label="Select api-gateway" /></td>
        <th scope="row">api-gateway</th>
        <td class="ds-table__num">1,240,331</td>
      </tr>
    </tbody>
  </table>
</div>

<p class="sr-only" role="status" aria-live="polite">3 rows selected</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-table { inline-size: 100%; border-collapse: collapse; font-size: 13px; }

/* Horizontal rules only. Vertical rules turn this into a spreadsheet. */
.ds-table tbody tr { border-block-end: 1px solid var(--ds-border-subtle); }
.ds-table tbody tr:last-child { border-block-end: 0; }

.ds-table th {
  block-size: 36px;                    /* shorter than a data row */
  padding-inline: 14px;
  text-align: start;
  font-size: 12px;
  font-weight: 500;
  color: var(--ds-fg-muted);
  background: var(--ds-surface-inset);
  white-space: nowrap;
}

.ds-table td { block-size: 44px; padding-inline: 14px; }

/* The single highest-value rule in any table */
.ds-table__num {
  text-align: end;
  font-variant-numeric: tabular-nums;
}

.ds-table tbody tr:hover { background: var(--ds-layer-hover); }
.ds-table tbody tr[data-selected] { background: var(--ds-layer-selected); }

/* Sticky header. scroll-padding stops it covering a focused row. */
.ds-table-wrap { overflow: auto; scroll-padding-block-start: 36px; }
.ds-table thead { position: sticky; inset-block-start: 0; z-index: 1; }

/* Sticky first column during horizontal scroll */
.ds-table__sticky {
  position: sticky;
  inset-inline-start: 0;
  background: var(--ds-surface);
}

/* The sort affordance appears on hover and stays once sorted */
.ds-table th .sort-icon { opacity: 0; transition: opacity 120ms; }
.ds-table th:hover .sort-icon,
.ds-table th[aria-sort] .sort-icon { opacity: 1; }`,
    },
    api: [
      {
        name: 'DataTable',
        props: [
          { name: 'columns', type: 'Column<T>[]', required: true, description: 'Column definitions. Memoise them — they run per row per render.' },
          { name: 'rows', type: 'T[]', required: true, description: 'The current page of data. Sorting is applied internally when sortBy is present.' },
          { name: 'rowKey', type: '(row: T) => string', required: true, description: 'Stable identity. Never use the array index.' },
          { name: 'sort', type: '{ id, dir } | null', description: 'Controlled sort state. Cycles asc → desc → none.' },
          { name: 'selectable', type: 'boolean', default: 'false', description: 'Adds a checkbox column with a header select-all.' },
          { name: 'density', type: "'compact' | 'normal' | 'relaxed'", default: "'normal'", description: '36 / 44 / 56px rows.' },
          { name: 'stickyHeader', type: 'boolean', default: 'false', description: 'Pins the header. Set scroll-padding on the container too.' },
          { name: 'emptyState', type: 'ReactNode', description: 'Rendered in a full-width cell when there are no rows.' },
          { name: 'caption', type: 'string', description: 'Visually hidden table name for screen readers.' },
        ],
      },
      {
        name: 'Column<T>',
        props: [
          { name: 'cell', type: '(row: T) => ReactNode', required: true, description: 'Keep it pure — it runs for every row on every render.' },
          { name: 'sortBy', type: '(row: T) => string | number', description: 'Presence makes the column sortable.' },
          { name: 'align', type: "'left' | 'right' | 'center'", default: "'left'", description: "'right' for every numeric column." },
          { name: 'numeric', type: 'boolean', default: 'false', description: 'Applies tabular figures.' },
          { name: 'hideBelow', type: "'sm' | 'md' | 'lg'", description: 'Responsive shedding. Drop the least decision-relevant first.' },
          { name: 'sticky', type: 'boolean', default: 'false', description: 'Pins the column during horizontal scroll. First column only.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Sort by the column users care about most, descending, by default. An unsorted table makes every visit start with a click.',
      'Show the total row count near the pagination. "1–20 of 248" answers a question users ask on every table.',
      'Keep the row action column to one icon button plus an overflow menu. Four inline actions per row multiplied by twenty rows is eighty targets.',
      'Persist sort, filters and density in the URL. A table state that vanishes on refresh cannot be shared with a colleague.',
    ],
    performance: [
      'Virtualise past about 200 rows. Below that the DOM cost is negligible and virtualisation adds real complexity — including breaking Ctrl+F.',
      'Memoise the column definitions. Recreating them each render invalidates every memoised row.',
      'Sort and filter on the server once the dataset passes a few thousand rows. Client-side sorting of 50,000 rows blocks the main thread for seconds.',
      'Store selection in a Set keyed by id. An array with .includes() is O(n) per row and turns selection into an O(n²) render.',
    ],
    mistakes: [
      'Left-aligning numbers, so magnitudes cannot be compared at a glance.',
      'Forgetting scope on header cells, which leaves screen-reader users with no column context.',
      'Using the array index as the row key, so sorting scrambles React state and selection follows the wrong rows.',
      'A sticky header without scroll-padding, so tabbing to a row scrolls it underneath the header.',
      'Announcing every row as it loads instead of setting aria-busy on the tbody.',
    ],
    realWorld: [
      'Watch a real user with a real dataset before designing the table. The column they scan first should be leftmost, and it is often not the one that was designed to be.',
      'Bulk selection needs an explicit "select all 1,432 matching" separate from "select all 20 on this page". Conflating them causes genuinely destructive accidents.',
      'Column resizing and reordering are expensive to build and rarely used. Column visibility toggles deliver most of the value for a fraction of the cost.',
      'Export is not optional in an enterprise table. Someone will paste this into a spreadsheet regardless — make it a button instead of a copy-paste job.',
    ],
  },
})

/* ---- demos --------------------------------------------------------------- */

function ResponsiveDemo() {
  const columns = useColumns()
  const compact = columns.filter((c) => c.id !== 'author' && c.id !== 'service')
  return (
    <div className="w-full">
      <div className="md:hidden">
        <TableCardList
          rows={DATA.slice(0, 3)}
          rowKey={(r) => r.id}
          columns={compact}
          primary={(r) => <span className="font-mono">{r.service}</span>}
        />
      </div>
      <div className="hidden md:block">
        <DataTable columns={columns} rows={DATA.slice(0, 3)} rowKey={(r) => r.id} />
      </div>
      <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">
        Use the phone and tablet width controls above to switch between them.
      </p>
    </div>
  )
}

function TableStates() {
  const columns = useColumns().slice(0, 3)
  return (
    <div className="grid w-full gap-4">
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(r) => r.id}
        emptyState={
          <EmptyState
            compact
            icon={<Search size={18} />}
            title="No results"
            description="No deployments match the current filters."
            action={<Button size="sm" variant="outlined">Clear filters</Button>}
          />
        }
      />
      <DataTable
        columns={columns}
        rows={DATA.slice(0, 2)}
        rowKey={(r) => r.id}
        loading
      />
    </div>
  )
}

function DensityDemo() {
  const columns = useColumns().slice(0, 3)
  return (
    <div className="grid w-full gap-4">
      {(['compact', 'normal', 'relaxed'] as const).map((d) => (
        <div key={d}>
          <p className="mb-1.5 text-overline uppercase text-[var(--ds-fg-muted)]">{d}</p>
          <DataTable columns={columns} rows={DATA.slice(0, 3)} rowKey={(r) => r.id} density={d} />
        </div>
      ))}
    </div>
  )
}

function AnatomyTable() {
  const columns = useColumns().filter((c) => ['service', 'status', 'requests'].includes(c.id))
  return <DataTable columns={columns} rows={DATA.slice(0, 3)} rowKey={(r) => r.id} sort={{ id: 'requests', dir: 'desc' }} onSortChange={() => {}} />
}

function MiniRow({ className }: { className?: string }) {
  return (
    <span
      className={`flex w-40 items-center justify-between rounded-[4px] px-2 py-2 font-mono text-caption ${className ?? ''}`}
    >
      api-gateway
      <span className="tabular-nums text-[var(--ds-fg-muted)]">42s</span>
    </span>
  )
}
