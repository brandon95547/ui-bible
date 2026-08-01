import * as React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, GripVertical, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Checkbox } from '@/ui/Toggle'
import { TextInput } from '@/ui/Input'
import { Cell, Grid, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const ALL = [
  'deployments.read',
  'deployments.write',
  'deployments.rollback',
  'members.read',
  'members.invite',
  'members.remove',
  'billing.read',
  'billing.write',
  'secrets.read',
  'secrets.rotate',
  'audit.read',
  'webhooks.manage',
]

function Pane({
  title,
  items,
  selected,
  onToggle,
  onToggleAll,
  query,
  onQuery,
  searchable,
  compact,
}: {
  title: string
  items: string[]
  selected: string[]
  onToggle: (id: string) => void
  onToggleAll: () => void
  query: string
  onQuery: (q: string) => void
  searchable: boolean
  compact?: boolean
}) {
  const visible = query ? items.filter((i) => i.includes(query.toLowerCase())) : items
  const allChecked = visible.length > 0 && visible.every((i) => selected.includes(i))
  const someChecked = visible.some((i) => selected.includes(i))

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2">
        <Checkbox
          checked={allChecked}
          indeterminate={!allChecked && someChecked}
          onChange={onToggleAll}
          aria-label={`Select all in ${title}`}
        />
        <span className="flex-1 truncate text-label text-[var(--ds-fg)]">{title}</span>
        {/* The count is what tells the user the move landed. */}
        <span className="shrink-0 font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
          {items.length}
        </span>
      </div>

      {searchable && (
        <div className="border-b border-[var(--ds-border-subtle)] p-2">
          <TextInput
            size="sm"
            startIcon={<Search />}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={`Filter ${title.toLowerCase()}…`}
            aria-label={`Filter ${title}`}
          />
        </div>
      )}

      <ul
        role="listbox"
        aria-multiselectable
        aria-label={title}
        className={cn('min-h-0 flex-1 overflow-y-auto p-1', compact ? 'max-h-40' : 'max-h-56')}
      >
        {visible.length === 0 && (
          <li className="px-2 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
            {query ? `Nothing matches “${query}”` : 'Empty'}
          </li>
        )}
        {visible.map((item) => {
          const on = selected.includes(item)
          return (
            <li key={item}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onToggle(item)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left font-mono text-caption',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                  on
                    ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                    : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border',
                    on
                      ? 'border-[var(--ds-accent)] bg-[var(--ds-accent)]'
                      : 'border-[var(--ds-border-strong)]',
                  )}
                >
                  {on && (
                    <svg width="9" height="9" viewBox="0 0 10 10" className="text-white">
                      <path
                        d="M1.5 5.2 3.9 7.6 8.5 2.6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="truncate">{item}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Transfer({
  searchable = true,
  compact,
}: {
  searchable?: boolean
  compact?: boolean
}) {
  const [assigned, setAssigned] = React.useState(['deployments.read', 'members.read'])
  const [pickedLeft, setPickedLeft] = React.useState<string[]>([])
  const [pickedRight, setPickedRight] = React.useState<string[]>([])
  const [qLeft, setQLeft] = React.useState('')
  const [qRight, setQRight] = React.useState('')

  const available = ALL.filter((i) => !assigned.includes(i))

  const move = (toAssigned: boolean, all = false) => {
    if (toAssigned) {
      const items = all ? available : pickedLeft
      setAssigned((a) => [...a, ...items.filter((i) => !a.includes(i))])
      setPickedLeft([])
    } else {
      const items = all ? assigned : pickedRight
      setAssigned((a) => a.filter((i) => !items.includes(i)))
      setPickedRight([])
    }
  }

  const toggle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
    setter((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className="w-full">
      <div className="flex items-stretch gap-3">
        <Pane
          title="Available"
          items={available}
          selected={pickedLeft}
          onToggle={toggle(setPickedLeft)}
          onToggleAll={() =>
            setPickedLeft((p) => (p.length === available.length ? [] : available))
          }
          query={qLeft}
          onQuery={setQLeft}
          searchable={searchable}
          compact={compact}
        />

        {/* Vertically centred, and every button says what it does and how many. */}
        <div className="flex shrink-0 flex-col justify-center gap-1.5">
          <IconButton
            variant="outlined"
            size="sm"
            label={`Assign ${pickedLeft.length} selected`}
            icon={<ChevronRight />}
            disabled={pickedLeft.length === 0}
            onClick={() => move(true)}
          />
          <IconButton
            variant="text"
            size="sm"
            label="Assign all"
            icon={<ChevronsRight />}
            disabled={available.length === 0}
            onClick={() => move(true, true)}
          />
          <IconButton
            variant="text"
            size="sm"
            label="Remove all"
            icon={<ChevronsLeft />}
            disabled={assigned.length === 0}
            onClick={() => move(false, true)}
          />
          <IconButton
            variant="outlined"
            size="sm"
            label={`Remove ${pickedRight.length} selected`}
            icon={<ChevronLeft />}
            disabled={pickedRight.length === 0}
            onClick={() => move(false)}
          />
        </div>

        <Pane
          title="Assigned"
          items={assigned}
          selected={pickedRight}
          onToggle={toggle(setPickedRight)}
          onToggleAll={() =>
            setPickedRight((p) => (p.length === assigned.length ? [] : assigned))
          }
          query={qRight}
          onQuery={setQRight}
          searchable={searchable}
          compact={compact}
        />
      </div>

      <p aria-live="polite" className="mt-2 text-caption text-[var(--ds-fg-muted)]">
        {assigned.length} of {ALL.length} permissions assigned
      </p>
    </div>
  )
}

function Playground() {
  const [searchable, setSearchable] = React.useState(true)
  const [compact, setCompact] = React.useState(false)
  const [key, setKey] = React.useState(0)

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={searchable} onChange={setSearchable} label="Search" />
          <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
          <Button size="sm" variant="outlined" onClick={() => setKey((k) => k + 1)}>
            Reset
          </Button>
        </div>
      }
      code={`<TransferList
  options={permissions}
  value={assigned}
  onChange={setAssigned}
  searchable={${searchable}}
  labels={{ available: 'Available', selected: 'Assigned' }}
/>`}
    >
      <div className="w-full max-w-2xl">
        <Transfer key={key} searchable={searchable} compact={compact} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'transfer-list',
    title: 'Transfer List',
    tagline:
      'Two panes — available and selected — for assigning from a large fixed set where the result has to be reviewable as a list.',
    keywords: ['dual listbox', 'pick list', 'list builder', 'assign', 'permissions', 'move'],
  },

  overview: {
    purpose:
      'A transfer list splits a fixed set into two panes: what is available and what has been chosen. Its value is that both halves are visible at once, so the user can see what they have picked and what they have not without opening anything. That makes it the right control for a consequential assignment — permissions, roles, feature access — where the omissions matter as much as the inclusions.',
    whenToUse: [
      'Assigning from a large fixed set where the chosen list must be reviewable in full.',
      'Permissions, roles, group membership, column selection for an export.',
      'Selections where what was left out is as important as what was included.',
      'Sets big enough that a multi-select field would overflow into a count.',
    ],
    whenNotToUse: [
      {
        text: 'The selection is small and the field can show it as tokens.',
        instead: 'a Multi-select — far less space for the same job',
        to: '#/multi-select',
      },
      {
        text: 'There are fewer than about ten options.',
        instead: 'Checkboxes — showing everything beats moving anything',
        to: '#/checkbox',
      },
      {
        text: 'The items have several attributes to compare.',
        instead: 'a Data Table with row selection',
        to: '#/data-table',
      },
      {
        text: 'The layout is narrow or the device is touch.',
        instead: 'a Multi-select or a checkbox list — two panes do not fit a phone',
        to: '#/multi-select',
      },
    ],
    reasoning: (
      <>
        <p>
          The whole justification for the extra space is <strong>seeing both halves at once</strong>.
          A multi-select that collapses to "9 selected" hides the assignment; a transfer list makes
          the user look at it. For anything security-adjacent, that visibility is the feature.
        </p>
        <p>
          <strong>The move buttons must never be the only path.</strong> Double-clicking an item
          moves it, and so does Enter on a focused item. Requiring a trip to a 32px button in the
          middle of the control for every single item is the reason this pattern has a reputation
          for being tedious.
        </p>
        <p>
          Selection and assignment are different states, and conflating them is the classic
          implementation bug. Ticking an item in the left pane <em>marks it to be moved</em>; it
          does not move it. Both panes need their own independent selection, and both must clear
          after a transfer.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'search',
        title: 'Both panes get their own filter',
        description:
          'The available pane needs search because it is long. The assigned pane needs it too — reviewing nine permissions out of forty is exactly when you want to check for one.',
        render: (
          <PreviewStage minHeight={320} center={false}>
            <div className="w-full max-w-2xl">
              <Transfer />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-multiselect',
        title: 'Transfer list or multi-select',
        description:
          'The transfer list costs roughly ten times the vertical space. It is worth it only when the user must review the whole assignment rather than just make it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="Review matters" sub="Permissions" tone="good">
                <Transfer searchable={false} compact />
              </Cell>
              <Cell label="Review does not" sub="Labels on a ticket" tone="good">
                <div className="flex flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] p-2">
                  {['bug', 'p1', 'infra'].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[var(--ds-accent-subtle)] px-2 py-0.5 text-caption text-[var(--ds-accent-text)]"
                    >
                      {t} ×
                    </span>
                  ))}
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'bulk',
        title: 'Move all, and move none',
        description:
          'The double chevrons move everything currently visible — including whatever the filter has narrowed to, which is what makes "assign all read permissions" a two-step operation.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="items-center">
              <Row gap="sm">
                <IconButton variant="outlined" size="sm" label="Assign selected" icon={<ChevronRight />} />
                <IconButton variant="text" size="sm" label="Assign all" icon={<ChevronsRight />} />
                <IconButton variant="text" size="sm" label="Remove all" icon={<ChevronsLeft />} />
                <IconButton variant="outlined" size="sm" label="Remove selected" icon={<ChevronLeft />} />
              </Row>
              <span className="text-caption text-[var(--ds-fg-muted)]">
                Single chevron moves the ticked items; double moves everything visible.
              </span>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'ordered',
        title: 'When order matters',
        description:
          'Column pickers and report builders need the assigned pane reorderable. Add up and down controls — never drag alone, which excludes keyboard and touch users.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <ul className="w-full max-w-xs overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              {['Name', 'Status', 'Region', 'Duration'].map((c, i) => (
                <li
                  key={c}
                  className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-2.5 py-2 last:border-0"
                >
                  <GripVertical size={13} aria-hidden className="text-[var(--ds-fg-disabled)]" />
                  <span className="flex-1 text-label-sm text-[var(--ds-fg-secondary)]">{c}</span>
                  <span className="font-mono text-caption text-[var(--ds-fg-muted)]">{i + 1}</span>
                </li>
              ))}
            </ul>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Item idle',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 font-mono text-caption text-[var(--ds-fg-secondary)]">
            <span className="h-3.5 w-3.5 rounded-[3px] border border-[var(--ds-border-strong)]" />
            billing.read
          </span>
        ),
      },
      {
        label: 'Item ticked',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-2 py-1.5 font-mono text-caption text-[var(--ds-fg)]">
            <span className="h-3.5 w-3.5 rounded-[3px] border border-[var(--ds-accent)] bg-[var(--ds-accent)]" />
            billing.read
          </span>
        ),
      },
      { label: 'Move enabled', render: <IconButton variant="outlined" size="sm" label="Assign" icon={<ChevronRight />} /> },
      { label: 'Move disabled', render: <IconButton variant="outlined" size="sm" label="Assign" icon={<ChevronRight />} disabled /> },
      { label: 'Move all', render: <IconButton variant="text" size="sm" label="Assign all" icon={<ChevronsRight />} /> },
      {
        label: 'Empty pane',
        render: (
          <span className="grid h-14 w-40 place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] text-caption text-[var(--ds-fg-muted)]">
            Empty
          </span>
        ),
      },
      {
        label: 'Pane header',
        render: (
          <span className="flex w-40 items-center gap-2 rounded-t-[var(--radius-lg)] border-b border-[var(--ds-border-subtle)] px-3 py-2">
            <span className="flex-1 text-label text-[var(--ds-fg)]">Assigned</span>
            <span className="font-mono text-caption text-[var(--ds-fg-muted)]">9</span>
          </span>
        ),
      },
      {
        label: 'Count',
        render: (
          <span className="text-caption text-[var(--ds-fg-muted)]">9 of 40 assigned</span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-2xl">
        <Transfer />
      </div>
    ),
    caption:
      'Two panes with their own headers, counts, filters and selection, and a vertically centred column of move controls between them.',
    parts: [
      {
        n: 1,
        label: 'Pane width',
        value: 'Equal, min 14rem each',
        kind: 'size',
        note: 'Equal on purpose. An asymmetric pair implies one side matters more, and the whole point is that both do.',
      },
      {
        n: 2,
        label: 'Pane height',
        value: '224px (160px compact)',
        kind: 'size',
        note: 'About eight rows. Both panes share a height even when one is empty, so nothing shifts as items move.',
      },
      {
        n: 3,
        label: 'Header',
        value: 'Select-all + title + count',
        kind: 'space',
        note: 'The count is the feedback. Without it a move of one item out of forty produces no visible change at all.',
      },
      {
        n: 4,
        label: 'Filter',
        value: 'Per pane, optional',
        kind: 'size',
        note: 'Both panes get one. Filtering the assigned pane is how a user checks for a specific permission in a long list.',
      },
      {
        n: 5,
        label: 'Move column',
        value: '4 buttons, vertically centred',
        kind: 'space',
        note: 'Single chevron for the ticked items, double for everything visible. Centred so the direction is unambiguous.',
      },
      {
        n: 6,
        label: 'Row height',
        value: '30px, monospace where technical',
        kind: 'size',
        note: 'Dense, because both panes are scanned as lists. Monospace for identifiers so prefixes line up and groups become visible.',
      },
      {
        n: 7,
        label: 'Live count',
        value: 'Below, aria-live',
        kind: 'type',
        note: '"9 of 40 assigned". The only feedback a non-visual user gets that a transfer happened.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Pane background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Pane edge, header and filter dividers' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Ticked row fill' },
    { category: 'color', token: '--ds-accent', usedFor: 'Ticked checkbox' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Row hover' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Row labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Counts and empty states' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'A move button with nothing to move' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Gap between panes and the move column' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Pane corners' },
    { category: 'typography', token: 'font-mono', usedFor: 'Identifier-style items, so prefixes align' },
  ],

  sizes: [
    { name: 'Compact', height: '160px panes', minWidth: '12rem each', use: 'Inside a dialog, or beside other fields in a settings page.' },
    { name: 'Default', height: '224px panes', minWidth: '14rem each', use: 'The default. About eight visible rows per pane.' },
    { name: 'Tall', height: '320px panes', minWidth: '16rem each', use: 'A dedicated assignment screen where this is the only control.' },
    { name: 'Row', height: '30px', padding: '0 8px', type: '12px', touch: 'Not a touch control', use: 'Dense. Both panes are scanned rather than acted on item by item.' },
    { name: 'Move column', minWidth: '2.5rem', gap: '6px', use: 'Four 32px buttons, vertically centred between the panes.' },
  ],

  do: [
    {
      title: 'Make double-click move an item',
      why: 'The move buttons are for batches. Requiring a trip to a 32px button for every single item is why this pattern is remembered as tedious.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>double-click</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>Enter on a focused item</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>the buttons</span>
        </Row>
      ),
    },
    {
      title: 'Give both panes a count and a filter',
      why: 'The count is the only visible feedback that a move happened when the lists are long. The filter is how a user checks whether one specific item is assigned.',
      render: (
        <Row gap="sm" align="center" className="w-44">
          <span className="flex-1 text-label text-[var(--ds-fg)]">Assigned</span>
          <span className="font-mono text-caption text-[var(--ds-fg-muted)]">9</span>
        </Row>
      ),
    },
    {
      title: 'Clear the tick marks after a transfer',
      why: 'The ticks mean "queued to move". Leaving them set after the move means the next click on a chevron moves things the user thought they were done with.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          move() → setAssigned(...) → setPicked([])
        </code>
      ),
    },
    {
      title: 'Keep both panes the same height, always',
      why: 'A pane that shrinks when it empties moves the move buttons, which is exactly where the pointer is heading.',
      render: (
        <Row gap="sm" align="stretch">
          <span className="h-14 w-20 rounded-[var(--radius-md)] border border-[var(--ds-success-border)]" />
          <span className="h-14 w-20 rounded-[var(--radius-md)] border border-[var(--ds-success-border)]" />
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use one for ten options',
      why: 'Two panes, four buttons and two filters to choose from ten items is more interface than decision. Checkboxes show everything and move nothing.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          10 options · 2 panes · 4 buttons · 2 filters
        </span>
      ),
    },
    {
      title: 'Do not conflate ticking with moving',
      why: 'A tick queues an item; the chevron moves it. Moving on tick removes the ability to batch, which is the only reason the pattern beats checkboxes.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          onCheck → transfer() → no batching possible
        </span>
      ),
    },
    {
      title: 'Do not ship it on mobile',
      why: 'Two panes plus a move column on a 390px screen leaves about 150px per list. It is a desktop control, and the mobile fallback is a checkbox list.',
      render: (
        <div className="flex w-40 gap-1">
          <span className="h-14 flex-1 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]" />
          <span className="w-6 shrink-0" />
          <span className="h-14 flex-1 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]" />
        </div>
      ),
    },
    {
      title: 'Do not make drag the only way to reorder',
      why: 'Drag excludes keyboard users entirely and is unreliable on touch. Up and down controls are the accessible path; drag is the enhancement.',
      render: (
        <Row gap="sm" align="center">
          <GripVertical size={14} className="text-[var(--ds-danger-text)]" />
          <span className="text-caption text-[var(--ds-danger-text)]">drag only</span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'A ticked row must differ from a hovered row by more than a tint — at a 30px row height a faint wash is invisible in daylight.',
      'Move buttons must reach 3:1 when enabled. Disabled ones may use the disabled tone, since their state is also carried by aria-disabled.',
      'Pane counts are content and owe 4.5:1 — they are the primary feedback that a transfer happened.',
      'The empty-pane message owes 4.5:1; it is the only thing distinguishing "nothing assigned" from a rendering failure.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves between the panes and the move column as whole regions, not item by item.' },
      { keys: '↑ / ↓', does: 'Moves within a pane’s listbox.' },
      { keys: 'Space', does: 'Ticks or unticks the focused item.' },
      { keys: 'Enter', does: 'Transfers the focused item immediately — the keyboard equivalent of a double-click.' },
      { keys: 'Shift + ↑ / ↓', does: 'Extends the tick selection, as in any multi-selectable listbox.' },
      { keys: '⌘ / Ctrl + A', does: 'Ticks everything visible in the focused pane, respecting the filter.' },
    ],
    aria: [
      { attr: 'role="listbox" aria-multiselectable', on: 'Each pane', note: 'With aria-label naming the pane. Two anonymous lists side by side are indistinguishable.' },
      { attr: 'role="option" aria-selected', on: 'Each item', note: 'Selected means ticked, not assigned. Which pane it is in carries the assignment.' },
      { attr: 'aria-label', on: 'Each move button', note: '"Assign 3 selected", not "Move right". Direction is meaningless without knowing which pane is which.' },
      { attr: 'aria-live="polite"', on: 'The summary count', note: '"9 of 40 assigned". The only feedback a screen-reader user gets that a transfer landed.' },
      { attr: 'aria-disabled', on: 'A move button with nothing to move', note: 'Kept in the tab order so the column never changes size or position.' },
    ],
    focus:
      'After a transfer, focus stays on the move button so a user can transfer again immediately. If the pane the items came from is now empty, move focus to the other pane rather than leaving it on a control that has become disabled.',
    screenReader: [
      'Announce the result of every transfer: "3 permissions assigned, 9 of 40 assigned".',
      'Each pane announces its size on entry: "Available, listbox, 31 items".',
      'When a filter is applied, announce the new count — otherwise a user arrowing through a filtered pane has no idea items are hidden.',
    ],
    touch:
      'This is a desktop control and should be replaced below about 768px, not squeezed. Two panes and a move column on a phone leave roughly 150px per list, which is unusable. The fallback is a filtered checkbox list with a count — same data, same outcome, one column.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { TransferList } from '@/ui/Input'

<TransferList
  options={permissions}
  value={assigned}
  onChange={setAssigned}
  searchable
  labels={{ available: 'Available', selected: 'Assigned' }}
/>

// Ticking queues; the chevron moves. Conflating them removes batching,
// which is the only reason this beats a checkbox list.
const [ticked, setTicked] = React.useState<string[]>([])

function assign() {
  onChange([...value, ...ticked])
  setTicked([])                     // ticks mean "queued" — clear them
}

// The keyboard equivalent of a double-click. Without it, every single item
// costs a trip to a 32px button.
function onItemKeyDown(e: React.KeyboardEvent, id: string) {
  if (e.key === 'Enter') {
    e.preventDefault()
    transfer([id])
  }
  if (e.key === ' ') {
    e.preventDefault()
    toggleTick(id)
  }
}

// "Move all" respects the filter, which is what makes "assign every read
// permission" a two-step operation instead of thirty clicks.
function assignAllVisible() {
  const visible = available.filter((i) => matches(i, query))
  onChange([...value, ...visible])
}

// Below 768px this control does not fit. Swap it, do not squeeze it.
const narrow = useMediaQuery('(max-width: 768px)')
if (narrow) return <CheckboxList options={options} value={value} onChange={onChange} />`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-transfer">
  <div class="ds-transfer__pane">
    <div class="ds-transfer__head">
      <input type="checkbox" aria-label="Select all in Available" />
      <span>Available</span>
      <span>31</span>
    </div>

    <ul role="listbox" aria-multiselectable="true" aria-label="Available">
      <!-- selected = ticked, NOT assigned. The pane carries the assignment. -->
      <li role="option" aria-selected="true"  tabindex="0">deployments.write</li>
      <li role="option" aria-selected="false" tabindex="-1">billing.read</li>
    </ul>
  </div>

  <!-- Direction is meaningless on its own: name the pane and the count. -->
  <div class="ds-transfer__controls">
    <button type="button" aria-label="Assign 3 selected">›</button>
    <button type="button" aria-label="Assign all">»</button>
    <button type="button" aria-label="Remove all">«</button>
    <button type="button" aria-label="Remove 0 selected" aria-disabled="true">‹</button>
  </div>

  <div class="ds-transfer__pane">…</div>
</div>

<p role="status" aria-live="polite">9 of 40 permissions assigned</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-transfer {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.ds-transfer__pane {
  flex: 1 1 0;
  min-inline-size: 14rem;            /* equal: neither side matters more */
  display: flex;
  flex-direction: column;
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--ds-surface);
  overflow: hidden;
}

/* Both panes share a height even when one is empty, so the move buttons
   never shift under the pointer heading for them. */
.ds-transfer__pane ul {
  flex: 1;
  block-size: 224px;
  overflow-y: auto;
  padding: 4px;
}

.ds-transfer__controls {
  display: flex;
  flex-direction: column;
  justify-content: center;           /* centred: direction stays unambiguous */
  gap: 6px;
  flex: 0 0 auto;
}

[role='option'] {
  display: flex;
  align-items: center;
  gap: 10px;
  block-size: 30px;
  padding-inline: 8px;
  border-radius: var(--radius-md);
  /* Identifiers align on their prefixes, which makes groups visible. */
  font-family: var(--font-mono);
  font-size: 12px;
}

[role='option'][aria-selected='true'] {
  background: var(--ds-accent-subtle);
  color: var(--ds-fg);
}

/* Two panes plus a move column leaves ~150px per list on a phone. Replace
   the control rather than compressing it. */
@media (max-width: 768px) {
  .ds-transfer { display: none; }
  .ds-transfer-fallback { display: block; }
}`,
    },
    api: [
      {
        name: 'TransferList',
        props: [
          { name: 'options', type: 'Option[]', required: true, description: 'The full fixed set. Both panes are derived from this and the value.' },
          { name: 'value', type: 'string[]', required: true, description: 'The assigned ids. Everything else is available.' },
          { name: 'onChange', type: '(v: string[]) => void', required: true, description: 'Fires after a transfer, never on a tick.' },
          { name: 'searchable', type: 'boolean', default: 'true', description: 'A filter per pane. The assigned pane needs one as much as the available pane does.' },
          { name: 'labels', type: '{ available: string; selected: string }', description: 'Name both panes. "Available" and "Assigned" beats "From" and "To".' },
          { name: 'orderable', type: 'boolean', default: 'false', description: 'Adds up and down controls to the assigned pane. Never drag-only.' },
          { name: 'height', type: 'number', default: '224', description: 'Pane height in pixels. Both panes always share it.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Group items with headers in the available pane when the set has natural prefixes. "deployments.*" as a group makes forty permissions read as six decisions.',
      'Sort the assigned pane the same way as the available pane. Reordering by assignment time makes it impossible to check whether something specific is in the list.',
      'Show a diff summary on submit — "adding 3, removing 1" — for anything security-related. It converts a list into a decision the user can confirm.',
      'Persist the filter text while items move. Clearing it after every transfer makes "assign all the read permissions" needlessly painful.',
      'If most users end up with nearly everything assigned, invert the control: start with everything assigned and let them remove.',
    ],
    performance: [
      'Virtualise both panes past roughly 200 items, and add aria-setsize and aria-posinset when you do.',
      'Keep the assigned set in a Set for membership checks. An includes() per item per render is quadratic and shows at a few hundred options.',
      'Derive the available pane rather than storing it. Two arrays that must stay complementary will eventually disagree.',
      'Do not animate items between panes. The lists reflow and the animation lands on the wrong rows the moment a filter is active.',
    ],
    mistakes: [
      'Moving items on tick, which removes the ability to batch.',
      'Leaving ticks set after a transfer, so the next chevron press moves the wrong things.',
      'Panes that resize as they empty, shifting the move buttons under the pointer.',
      'Move buttons labelled "Move right", which means nothing without knowing which pane is which.',
      'No live count, so a screen-reader user has no feedback that anything moved.',
      'A filter on the available pane only, making the assigned list impossible to search.',
      'Shipping it below 768px, where two panes cannot fit.',
      'Drag-only reordering, which excludes keyboard users entirely.',
    ],
    realWorld: [
      'Permission assignment is the pattern’s strongest case: the omissions are as consequential as the inclusions, and both panes visible is exactly what an auditor wants.',
      'Users consistently miss the move buttons on first use. Double-click and Enter are what make the control learnable — instrument them and you will find they carry most of the traffic.',
      'Column pickers for tables and reports are the other durable use, and they are the case that needs ordering in the assigned pane.',
      'If your available pane routinely holds more than a hundred items, the filter is the real interface and the two panes are just presentation. Consider a searchable multi-select with a review step instead.',
    ],
  },
})
