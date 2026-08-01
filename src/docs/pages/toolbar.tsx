import * as React from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Download,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  Redo2,
  Tag,
  Trash2,
  Underline,
  Undo2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Divider, Tooltip } from '@/ui/Display'
import { Popover, MenuList } from '@/ui/Overlay'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   A toolbar is a composite widget: one tab stop, arrows move inside. Every
   demo on this page shares this implementation so the keyboard model is
   identical everywhere the reader tries it.
   ------------------------------------------------------------------------ */
function Toolbar({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  const items = () =>
    Array.from(ref.current?.querySelectorAll<HTMLElement>('[data-tb-item]:not(:disabled)') ?? [])

  // Roving tabindex: exactly one item is tabbable, so Tab crosses the whole
  // toolbar in one press instead of stopping twelve times.
  React.useEffect(() => {
    const all = items()
    all.forEach((el, i) => el.setAttribute('tabindex', i === 0 ? '0' : '-1'))
  }, [children])

  const move = (dir: 1 | -1 | 'home' | 'end') => {
    const all = items()
    const from = all.indexOf(document.activeElement as HTMLElement)
    const next =
      dir === 'home'
        ? 0
        : dir === 'end'
          ? all.length - 1
          : (from + dir + all.length) % all.length
    all.forEach((el, i) => el.setAttribute('tabindex', i === next ? '0' : '-1'))
    all[next]?.focus()
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') (e.preventDefault(), move(1))
        else if (e.key === 'ArrowLeft') (e.preventDefault(), move(-1))
        else if (e.key === 'Home') (e.preventDefault(), move('home'))
        else if (e.key === 'End') (e.preventDefault(), move('end'))
      }}
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-1.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

function TbButton({
  label,
  icon,
  pressed,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ReactNode
  pressed?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <Tooltip content={label}>
      <button
        data-tb-item
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-[var(--radius-md)] transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
          disabled
            ? 'text-[var(--ds-fg-disabled)]'
            : pressed
              ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]'
              : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
        )}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

function Playground() {
  const [density, setDensity] = React.useState<'compact' | 'default'>('default')
  const [dividers, setDividers] = React.useState(true)
  const [overflow, setOverflow] = React.useState(true)
  const [marks, setMarks] = React.useState<string[]>(['bold'])
  const toggle = (m: string) =>
    setMarks((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))

  return (
    <PreviewStage
      label="Playground"
      minHeight={150}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Density">
            <KnobSelect
              value={density}
              onChange={setDensity}
              options={['compact', 'default'] as const}
            />
          </Knob>
          <KnobToggle checked={dividers} onChange={setDividers} label="Dividers" />
          <KnobToggle checked={overflow} onChange={setOverflow} label="Overflow" />
        </div>
      }
      code={`<div role="toolbar" aria-label="Formatting" aria-orientation="horizontal">
  <button aria-label="Bold"   aria-pressed={marks.has('bold')}   tabIndex={0}>…</button>
  <button aria-label="Italic" aria-pressed={marks.has('italic')} tabIndex={-1}>…</button>
  ${dividers ? '<span role="separator" aria-orientation="vertical" />' : ''}
  …
</div>`}
    >
      <Toolbar label="Formatting" className={density === 'compact' ? 'gap-0.5 p-1' : undefined}>
        <TbButton label="Undo" icon={<Undo2 size={15} />} />
        <TbButton label="Redo" icon={<Redo2 size={15} />} disabled />
        {dividers && <Divider orientation="vertical" className="mx-1 h-5" />}
        <TbButton
          label="Bold"
          icon={<Bold size={15} />}
          pressed={marks.includes('bold')}
          onClick={() => toggle('bold')}
        />
        <TbButton
          label="Italic"
          icon={<Italic size={15} />}
          pressed={marks.includes('italic')}
          onClick={() => toggle('italic')}
        />
        <TbButton
          label="Underline"
          icon={<Underline size={15} />}
          pressed={marks.includes('underline')}
          onClick={() => toggle('underline')}
        />
        {dividers && <Divider orientation="vertical" className="mx-1 h-5" />}
        <TbButton label="Bulleted list" icon={<List size={15} />} />
        <TbButton label="Numbered list" icon={<ListOrdered size={15} />} />
        <TbButton label="Insert link" icon={<Link2 size={15} />} />
        {overflow && (
          <>
            {dividers && <Divider orientation="vertical" className="mx-1 h-5" />}
            <Popover
              align="end"
              trigger={({ toggle: t, open }) => (
                <button
                  data-tb-item
                  type="button"
                  onClick={t}
                  aria-label="More formatting options"
                  aria-haspopup="menu"
                  aria-expanded={open}
                  className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-secondary)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
                >
                  <MoreHorizontal size={15} />
                </button>
              )}
            >
              <MenuList
                label="More formatting options"
                items={[
                  { label: 'Quote', onSelect: () => {} },
                  { label: 'Code block', onSelect: () => {} },
                  { label: 'Horizontal rule', onSelect: () => {} },
                  'separator',
                  { label: 'Clear formatting', onSelect: () => {} },
                ]}
              />
            </Popover>
          </>
        )}
      </Toolbar>
    </PreviewStage>
  )
}

function BulkBar() {
  const [selected, setSelected] = React.useState(4)

  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <Stack gap="sm" className="w-full">
        {selected > 0 ? (
          <div
            role="toolbar"
            aria-label={`Actions for ${selected} selected deployments`}
            className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] px-3 py-2"
          >
            <span className="text-label-sm text-[var(--ds-accent-text)]">
              {selected} selected
            </span>
            <Divider orientation="vertical" className="mx-1 h-5" />
            <Button size="sm" variant="text" startIcon={<Tag size={14} />}>
              Tag
            </Button>
            <Button size="sm" variant="text" startIcon={<Download size={14} />}>
              Export
            </Button>
            {/* Destructive actions sit at the far end, past a divider, so the
                pointer never passes over them on the way to something safe. */}
            <Divider orientation="vertical" className="mx-1 h-5" />
            <Button size="sm" variant="text" startIcon={<Trash2 size={14} />} className="text-[var(--ds-danger-text)]">
              Delete
            </Button>
            <IconButton
              size="sm"
              label="Clear selection"
              icon={<X />}
              className="ml-auto"
              onClick={() => setSelected(0)}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--ds-border-subtle)] px-3 py-2">
            <span className="text-caption text-[var(--ds-fg-muted)]">Nothing selected</span>
            <Button size="sm" variant="text" onClick={() => setSelected(4)}>
              Select 4 rows
            </Button>
          </div>
        )}
        <p className="text-caption text-[var(--ds-fg-muted)]">
          The bar replaces the normal toolbar in place rather than appearing above it, so the table
          below never shifts down by 44px at the moment the user is aiming at a row.
        </p>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'toolbar',
    title: 'Toolbar',
    tagline:
      'The action strip for a region. One tab stop, arrow keys inside, dividers that group, and overflow that degrades in a published order.',
    keywords: ['role toolbar', 'roving tabindex', 'overflow', 'bulk actions', 'editor', 'action bar'],
  },

  overview: {
    purpose:
      'A toolbar collects the actions that operate on one region — an editor, a table, a canvas — into a persistent strip. What makes it a toolbar rather than a row of buttons is the keyboard contract: the whole strip is a single tab stop and arrow keys move between the controls inside it. That is the entire reason the pattern exists. Twelve buttons in a row without it means twelve Tab presses between the content and whatever comes next.',
    whenToUse: [
      'Six or more controls acting on the same region, where tabbing through each one would be punishing.',
      'A text or drawing editor, where the controls are used repeatedly and must stay visible.',
      'A bulk-action bar that appears when rows are selected in a table.',
      'Any strip that needs dividers, mixed control types, and an overflow menu.',
    ],
    whenNotToUse: [
      {
        text: 'There are two to five related buttons and no dividers.',
        instead: 'a Button Group',
        to: '#/button-group',
      },
      {
        text: 'The controls navigate rather than act.',
        instead: 'an App Bar or Tabs',
        to: '#/app-bar',
      },
      {
        text: 'One action dominates and the rest are variants of it.',
        instead: 'a Split Button',
        to: '#/split-button',
      },
      {
        text: 'The actions belong to a single row or card rather than a region.',
        instead: 'an overflow Menu on that row',
        to: '#/menu',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Roving tabindex is not optional.</strong> A toolbar without it is a row of
          buttons with extra styling. Exactly one control carries{' '}
          <code>tabindex="0"</code>; the rest carry <code>-1</code> and are reached with arrow
          keys. Tab enters the toolbar once and leaves it once — which is what a keyboard user
          expects from anything announced as a toolbar.
        </p>
        <p>
          Overflow is a design decision made in advance, not a flexbox accident. Decide the
          order in which controls collapse into the "⋯" menu before you build it, and keep that
          order fixed. A toolbar whose buttons rearrange as the window resizes destroys the
          spatial memory that makes a toolbar fast in the first place.
        </p>
        <p>
          Dividers are the cheapest thing on the strip and the most load-bearing. Four groups of
          three read as four decisions; twelve ungrouped icons read as a wall. Use{' '}
          <code>role="separator"</code> so the grouping survives for someone who cannot see the
          line.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'bulk',
        title: 'Bulk-action bar',
        description:
          'The most common toolbar in an admin product. It appears when a selection exists, states the count first, and puts the destructive action past a divider at the far end.',
        render: <BulkBar />,
      },
      {
        id: 'grouping',
        title: 'What dividers buy',
        description:
          'The same twelve controls, grouped and ungrouped. Nothing changed but four hairlines, and the strip went from a wall to four decisions.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full">
              <Cell label="Grouped" tone="good">
                <Toolbar label="Grouped example" className="border-0 bg-transparent p-0">
                  <TbButton label="Undo" icon={<Undo2 size={15} />} />
                  <TbButton label="Redo" icon={<Redo2 size={15} />} />
                  <Divider orientation="vertical" className="mx-1 h-5" />
                  <TbButton label="Bold" icon={<Bold size={15} />} pressed />
                  <TbButton label="Italic" icon={<Italic size={15} />} />
                  <TbButton label="Underline" icon={<Underline size={15} />} />
                  <Divider orientation="vertical" className="mx-1 h-5" />
                  <TbButton label="Align left" icon={<AlignLeft size={15} />} pressed />
                  <TbButton label="Align centre" icon={<AlignCenter size={15} />} />
                  <TbButton label="Align right" icon={<AlignRight size={15} />} />
                  <Divider orientation="vertical" className="mx-1 h-5" />
                  <TbButton label="Bulleted list" icon={<List size={15} />} />
                  <TbButton label="Numbered list" icon={<ListOrdered size={15} />} />
                  <TbButton label="Insert link" icon={<Link2 size={15} />} />
                </Toolbar>
              </Cell>
              <Cell label="Ungrouped" tone="bad">
                <Toolbar label="Ungrouped example" className="border-0 bg-transparent p-0">
                  {[Undo2, Redo2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2].map(
                    (Icon, i) => (
                      <TbButton key={i} label={`Action ${i + 1}`} icon={<Icon size={15} />} />
                    ),
                  )}
                </Toolbar>
              </Cell>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'labelled',
        title: 'Labelled controls',
        description:
          'When the toolbar has room and the actions are infrequent, text labels beat icons. Recognition beats recall, and an unfamiliar glyph is recall.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Toolbar label="Deployment actions">
              <Button size="sm" variant="text" startIcon={<Download size={14} />}>
                Export
              </Button>
              <Button size="sm" variant="text" startIcon={<Tag size={14} />}>
                Add tag
              </Button>
              <Divider orientation="vertical" className="mx-1 h-5" />
              <Button size="sm" variant="text">
                Re-run
              </Button>
              <Button size="sm" variant="text">
                Roll back
              </Button>
            </Toolbar>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <TbButton label="Bold" icon={<Bold size={15} />} /> },
      { label: 'Pressed', render: <TbButton label="Bold" icon={<Bold size={15} />} pressed /> },
      { label: 'Disabled', render: <TbButton label="Redo" icon={<Redo2 size={15} />} disabled /> },
      {
        label: 'Focus',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-secondary)] outline-2 outline-offset-1 outline-[var(--ds-focus-ring)]">
            <Bold size={15} />
          </span>
        ),
      },
      { label: 'Divider', render: <Divider orientation="vertical" className="h-5" /> },
      {
        label: 'Overflow',
        render: <TbButton label="More options" icon={<MoreHorizontal size={15} />} />,
      },
      { label: 'Text control', render: <Button size="sm" variant="text">Re-run</Button> },
      {
        label: 'Danger',
        render: (
          <Button size="sm" variant="text" className="text-[var(--ds-danger-text)]" startIcon={<Trash2 size={14} />}>
            Delete
          </Button>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Toolbar label="Anatomy">
        <TbButton label="Undo" icon={<Undo2 size={15} />} />
        <TbButton label="Redo" icon={<Redo2 size={15} />} disabled />
        <Divider orientation="vertical" className="mx-1 h-5" />
        <TbButton label="Bold" icon={<Bold size={15} />} pressed />
        <TbButton label="Italic" icon={<Italic size={15} />} />
        <Divider orientation="vertical" className="mx-1 h-5" />
        <TbButton label="More options" icon={<MoreHorizontal size={15} />} />
      </Toolbar>
    ),
    caption:
      'Two groups and an overflow trigger. The strip is one tab stop; arrow keys move between the seven controls inside it.',
    parts: [
      {
        n: 1,
        label: 'Strip height',
        value: '44px (36px compact)',
        kind: 'size',
        note: '32px controls plus 6px of padding. Compact drops the padding, not the control, so the touch target never falls below its minimum.',
      },
      {
        n: 2,
        label: 'Control size',
        value: '32 × 32px',
        kind: 'size',
        note: 'One step below the default button. A toolbar is dense by nature and full-size buttons make the strip dominate the region it belongs to.',
      },
      {
        n: 3,
        label: 'Gap',
        value: '4px inside a group',
        kind: 'space',
        note: 'Tight enough that a group reads as one unit, wide enough that two adjacent focus rings never touch.',
      },
      {
        n: 4,
        label: 'Divider',
        value: '1px × 20px, 8px margins',
        kind: 'shape',
        note: 'Shorter than the strip so it reads as a separator rather than a border. The 8px margins are double the intra-group gap — that ratio is what makes the grouping legible.',
      },
      {
        n: 5,
        label: 'Overflow trigger',
        value: 'Last position, always',
        kind: 'space',
        note: 'Fixed at the end. If it moves as the window resizes, the one control users need to find under pressure is the one that will not stay still.',
      },
      {
        n: 6,
        label: 'Roving tabindex',
        value: 'One 0, rest −1',
        kind: 'motion',
        note: 'The defining property. Tab enters once and leaves once; arrows move inside. It also remembers the last-focused control, so returning to the toolbar does not reset to the start.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Strip background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Strip edge and dividers' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Idle control glyphs' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover fill on a control' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Pressed control fill' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Pressed control glyph' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'A destructive control, placed last' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on the roving item' },
    { category: 'spacing', token: '--space-1', value: '4px', usedFor: 'Gap inside a group' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Divider margins — double the intra-group gap' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Control corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Strip corners' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover and press transitions' },
  ],

  sizes: [
    { name: 'Compact', height: '36px', padding: '4px', gap: '2px', icon: '15px', use: 'Inside a card header or a table header, where the strip must not out-weigh the content.' },
    { name: 'Default', height: '44px', padding: '6px', gap: '4px', icon: '15px', use: 'Editors and page-level regions.' },
    { name: 'Touch', height: '52px', padding: '4px', gap: '4px', icon: '18px', touch: '44px per control', use: 'Coarse pointers. Controls grow to 44px; the strip scrolls horizontally rather than wrapping.' },
    { name: 'Divider', height: '20px', use: '1px wide, 8px margins. Shorter than the strip so it separates rather than encloses.' },
    { name: 'Overflow menu', minWidth: '12rem', maxWidth: '18rem', use: 'Holds the collapsed controls in their original order, with their labels spelled out.' },
  ],

  do: [
    {
      title: 'Give the strip one tab stop',
      why: 'This is the whole pattern. Roving tabindex means Tab crosses twelve controls in one press; without it a keyboard user pays twelve presses every time they pass the toolbar.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="toolbar" aria-orientation="horizontal"
          <br />
          first.tabIndex = 0 · rest.tabIndex = −1
        </code>
      ),
    },
    {
      title: 'Group with dividers, and use role="separator"',
      why: 'The line does the work for sighted users; the role does it for everyone else. Four groups of three is four decisions, and twelve loose icons is a wall.',
      render: (
        <Toolbar label="Do group" className="border-0 bg-transparent p-0">
          <TbButton label="Bold" icon={<Bold size={15} />} pressed />
          <TbButton label="Italic" icon={<Italic size={15} />} />
          <Divider orientation="vertical" className="mx-1 h-5" />
          <TbButton label="Bulleted list" icon={<List size={15} />} />
          <TbButton label="Numbered list" icon={<ListOrdered size={15} />} />
        </Toolbar>
      ),
    },
    {
      title: 'Decide the overflow order before you build it',
      why: 'Controls must collapse into "⋯" in a published order, least-used first. A flex-wrap accident rearranges the strip on every resize and destroys spatial memory.',
      render: (
        <Toolbar label="Do overflow" className="border-0 bg-transparent p-0">
          <TbButton label="Bold" icon={<Bold size={15} />} />
          <TbButton label="Italic" icon={<Italic size={15} />} />
          <Divider orientation="vertical" className="mx-1 h-5" />
          <TbButton label="More options" icon={<MoreHorizontal size={15} />} />
        </Toolbar>
      ),
    },
    {
      title: 'Name every icon-only control',
      why: 'A tooltip is a supplement to an accessible name, not a substitute. It never appears for a screen reader and it never appears on touch.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;button aria-label="Bold" aria-pressed="true"&gt;
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not make every control a tab stop',
      why: 'Then it is a row of buttons that announces itself as a toolbar — the worst combination, because the user is told to expect arrow keys and does not get them.',
      render: (
        <div className="flex gap-1">
          {[Bold, Italic, Underline, List, ListOrdered, Link2].map((Icon, i) => (
            <span
              key={i}
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] outline-1 outline-dashed outline-[var(--ds-danger-border)]"
            >
              <Icon size={15} />
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not put a destructive action mid-strip',
      why: 'The pointer travels across the whole strip. Delete belongs at the far end past a divider, where nothing safe sits beyond it to travel towards.',
      render: (
        <Toolbar label="Bad order" className="border-0 bg-transparent p-0">
          <TbButton label="Export" icon={<Download size={15} />} />
          <TbButton label="Delete" icon={<Trash2 size={15} />} />
          <TbButton label="Tag" icon={<Tag size={15} />} />
        </Toolbar>
      ),
    },
    {
      title: 'Do not let controls reorder on resize',
      why: 'A toolbar is used by muscle memory. If Bold is third at 1440px and fifth at 1100px, that memory is worthless and every action becomes a visual search.',
      render: (
        <Stack gap="xs" className="w-full">
          <Row gap="sm">
            <TbButton label="Bold" icon={<Bold size={15} />} />
            <TbButton label="Italic" icon={<Italic size={15} />} />
            <TbButton label="Link" icon={<Link2 size={15} />} />
          </Row>
          <Row gap="sm">
            <TbButton label="Link" icon={<Link2 size={15} />} />
            <TbButton label="Bold" icon={<Bold size={15} />} />
            <TbButton label="Italic" icon={<Italic size={15} />} />
          </Row>
        </Stack>
      ),
    },
    {
      title: 'Do not hide the only copy of an action in overflow',
      why: 'Anything used more than occasionally must be visible at the default width. Overflow is for the tail, not for whatever happened not to fit.',
      render: (
        <Grid min="12rem">
          <Cell label="Visible" tone="good">
            <Row gap="sm">
              <TbButton label="Bold" icon={<Bold size={15} />} />
              <TbButton label="Italic" icon={<Italic size={15} />} />
              <TbButton label="More" icon={<MoreHorizontal size={15} />} />
            </Row>
          </Cell>
          <Cell label="All hidden" tone="bad">
            <TbButton label="More" icon={<MoreHorizontal size={15} />} />
          </Cell>
        </Grid>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Idle glyphs must reach 4.5:1 — they are the label. A toolbar of 3:1 icons is unreadable for anyone in bright light.',
      'The pressed state changes fill and glyph colour together, so which controls are active survives greyscale.',
      'Dividers are decorative only if the grouping is also carried by role="separator". If the line is the only grouping signal, it owes 3:1.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the toolbar once, landing on the last-focused control, and leaves it once.' },
      { keys: '← / →', does: 'Moves between controls, wrapping at both ends. This is what makes it a toolbar.' },
      { keys: 'Home / End', does: 'Jumps to the first or last control.' },
      { keys: 'Space / Enter', does: 'Activates or toggles the focused control.' },
      { keys: '↓', does: 'On the overflow trigger, opens the menu and focuses its first item.' },
      { keys: 'Esc', does: 'Closes the overflow menu and returns focus to its trigger.' },
    ],
    aria: [
      { attr: 'role="toolbar"', on: 'The container', note: 'Promises arrow-key navigation. Do not use it unless roving tabindex is actually implemented.' },
      { attr: 'aria-label', on: 'The container', note: 'Names what the strip acts on: "Formatting", "Actions for 4 selected deployments".' },
      { attr: 'aria-orientation', on: 'The container', note: 'Horizontal by default. A vertical toolbar must say so, or arrow keys are announced wrongly.' },
      { attr: 'aria-pressed', on: 'Toggle controls', note: 'For state. Command buttons — Undo, Export — must not have it.' },
      { attr: 'role="separator"', on: 'Dividers', note: 'With aria-orientation="vertical". This is how the grouping reaches anyone not looking at the line.' },
      { attr: 'aria-disabled', on: 'Temporarily unavailable controls', note: 'Preferred over the disabled attribute, so the control stays in the roving order and its position never shifts.' },
    ],
    focus:
      'The toolbar remembers which control had focus and returns there on re-entry — resetting to the first control every time makes the pattern slower than plain tab stops. Disabled controls are skipped by the arrow keys but keep their position, so nothing moves when a control becomes available.',
    screenReader: [
      'Announces as "Formatting, toolbar" then the focused control: "Bold, toggle button, pressed".',
      'A bulk-action bar should name its scope in the toolbar label — "Actions for 4 selected deployments" — so the count is heard before any action.',
      'When controls collapse into overflow, they must keep their full text labels in the menu. An icon-only overflow menu is unusable.',
    ],
    touch:
      'Controls grow to 44px on coarse pointers and the strip scrolls horizontally rather than wrapping — a toolbar that wraps to three rows takes over the screen. Keep the first control flush to the edge and let the last one be partially cut off; that overflow cue is what tells a touch user the strip scrolls.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Roving tabindex is the whole pattern. Everything else is styling.
function Toolbar({ label, children }) {
  const ref = React.useRef(null)
  const items = () =>
    [...ref.current.querySelectorAll('[data-tb-item]:not(:disabled)')]

  const move = (dir) => {
    const all = items()
    const from = all.indexOf(document.activeElement)
    const next = (from + dir + all.length) % all.length
    all.forEach((el, i) => el.tabIndex = i === next ? 0 : -1)
    all[next].focus()
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1) }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1) }
      }}
    >
      {children}
    </div>
  )
}

// Overflow order is data, not a flexbox accident. Least-used collapses first.
const CONTROLS = [
  { id: 'bold',   priority: 1 },
  { id: 'italic', priority: 1 },
  { id: 'quote',  priority: 3 },   // first to go
]
const visible  = CONTROLS.filter((c) => c.priority <= level)
const overflow = CONTROLS.filter((c) => c.priority > level)`,
    },
    html: {
      lang: 'html',
      code: `<div role="toolbar" aria-label="Formatting" aria-orientation="horizontal">
  <!-- Exactly one tabindex="0". Arrows move it. -->
  <button type="button" aria-label="Undo" tabindex="0">…</button>
  <button type="button" aria-label="Redo" tabindex="-1" aria-disabled="true">…</button>

  <span role="separator" aria-orientation="vertical"></span>

  <button type="button" aria-label="Bold"   aria-pressed="true"  tabindex="-1">…</button>
  <button type="button" aria-label="Italic" aria-pressed="false" tabindex="-1">…</button>

  <span role="separator" aria-orientation="vertical"></span>

  <button
    type="button"
    aria-label="More formatting options"
    aria-haspopup="menu"
    aria-expanded="false"
    tabindex="-1"
  >…</button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `[role='toolbar'] {
  display: flex;
  align-items: center;
  gap: 4px;                          /* inside a group */
  padding: 6px;
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--ds-surface);
}

[role='toolbar'] > [role='separator'] {
  inline-size: 1px;
  block-size: 20px;                  /* shorter than the strip: separates, not encloses */
  margin-inline: 8px;                /* double the intra-group gap — that ratio is the grouping */
  background: var(--ds-border-subtle);
}

[role='toolbar'] button {
  inline-size: 32px;
  block-size: 32px;
  border-radius: var(--radius-md);
  color: var(--ds-fg-secondary);     /* 4.5:1 — the glyph IS the label */
}
[role='toolbar'] button:hover  { background: var(--ds-layer-hover); color: var(--ds-fg); }
[role='toolbar'] button[aria-pressed='true'] {
  background: var(--ds-accent-subtle);
  color: var(--ds-accent-text);
}

/* Scroll rather than wrap. A toolbar three rows tall has taken over the page. */
@media (pointer: coarse) {
  [role='toolbar'] {
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
  }
  [role='toolbar'] button { inline-size: 44px; block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'Toolbar',
        props: [
          { name: 'label', type: 'string', required: true, description: 'Names what the strip acts on. Becomes aria-label.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Decides which arrow keys move focus and what is announced.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'Controls marked data-tb-item, plus Divider elements between groups.' },
          { name: 'density', type: "'compact' | 'default'", default: "'default'", description: 'Reduces padding and gap. Never reduces the control below its touch minimum.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show the keyboard shortcut in each control’s tooltip. A toolbar is used by people who repeat actions, and repetition is exactly who shortcuts are for.',
      'Keep the overflow trigger in a fixed final position at every width. It is the control people reach for when they cannot find something, so it must never be the thing that moved.',
      'A bulk-action bar should state its count first and clear its selection last, with the destructive action past a divider between them.',
      'Vertical toolbars are legitimate for canvas tools, but flip aria-orientation and the arrow keys together — one without the other is worse than neither.',
    ],
    performance: [
      'Query the toolbar’s items once per render, not per keystroke. A querySelectorAll in a keydown handler on a twenty-control strip is measurable during key repeat.',
      'Use a ResizeObserver on the strip to drive overflow, not a window resize listener — the toolbar can narrow when a side panel opens without the window changing at all.',
      'Do not mount the overflow menu until it opens. Twenty toolbars in a table each holding a hidden popover is twenty panels of layout nobody sees.',
    ],
    mistakes: [
      'Using role="toolbar" without roving tabindex, promising arrow keys that do nothing.',
      'Resetting focus to the first control every time the toolbar is re-entered, which makes the pattern slower than plain tab stops.',
      'Removing a disabled control from the DOM, so everything after it shifts position while the user is aiming.',
      'Relying on tooltips as accessible names for icon-only controls.',
      'Letting flex-wrap decide the overflow, so controls reorder at every breakpoint.',
      'Placing Delete in the middle of the strip, directly on the path to something safe.',
    ],
    realWorld: [
      'Editor toolbars are the pattern’s home ground, and the honest finding is that most users touch five controls. Instrument it, keep those five visible, and let the rest live in overflow permanently.',
      'Bulk-action bars work best when they replace the existing toolbar in place. Sliding a new bar in above the table shifts every row down at the exact moment the user is aiming at one.',
      'On mobile, a horizontally scrolling toolbar with the last control partially cut off is the clearest affordance. A wrapped toolbar reads as a broken layout.',
      'Anything used more than roughly once a session deserves a shortcut, and the toolbar is where users discover it. The tooltip is doing double duty as documentation.',
    ],
  },
})
