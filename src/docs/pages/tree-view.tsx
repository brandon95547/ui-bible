import * as React from 'react'
import { ChevronRight, File, FileCode, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

interface Node {
  id: string
  label: string
  children?: Node[]
}

const TREE: Node[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'ui',
        label: 'ui',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
          { id: 'overlay', label: 'Overlay.tsx' },
        ],
      },
      {
        id: 'docs',
        label: 'docs',
        children: [
          { id: 'nav', label: 'nav.ts' },
          { id: 'registry', label: 'registry.ts' },
        ],
      },
      { id: 'main', label: 'main.tsx' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [{ id: 'icons', label: 'icons.svg' }],
  },
  { id: 'readme', label: 'README.md' },
]

/** Depth-first list of every node currently visible, which is what the arrow
    keys traverse — a tree is navigated as the flat list it renders as. */
function flatten(nodes: Node[], expanded: Set<string>, depth = 0): { node: Node; depth: number }[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children && expanded.has(node.id) ? flatten(node.children, expanded, depth + 1) : []),
  ])
}

function TreeView({
  guides = true,
  density = 'default',
}: {
  guides?: boolean
  density?: 'compact' | 'default'
}) {
  const [expanded, setExpanded] = React.useState(new Set(['src', 'ui']))
  const [selected, setSelected] = React.useState('button')
  const [focused, setFocused] = React.useState('src')
  const ref = React.useRef<HTMLDivElement>(null)

  const rows = flatten(TREE, expanded)
  const rowH = density === 'compact' ? 'h-6' : 'h-7'

  const setOpen = (id: string, open: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (open) next.add(id)
      else next.delete(id)
      return next
    })

  const focus = (id: string) => {
    setFocused(id)
    ref.current?.querySelector<HTMLElement>(`[data-node="${id}"]`)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = rows.findIndex((r) => r.node.id === focused)
    const cur = rows[i]
    if (!cur) return
    const isOpen = expanded.has(cur.node.id)
    const isParent = !!cur.node.children

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focus(rows[Math.min(rows.length - 1, i + 1)].node.id)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focus(rows[Math.max(0, i - 1)].node.id)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      // Right on a closed folder opens it; on an open one it descends. That
      // two-step behaviour is what makes a tree navigable without a mouse.
      if (isParent && !isOpen) setOpen(cur.node.id, true)
      else if (isParent && isOpen) focus(rows[i + 1].node.id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (isParent && isOpen) setOpen(cur.node.id, false)
      else {
        const parent = [...rows.slice(0, i)].reverse().find((r) => r.depth === cur.depth - 1)
        if (parent) focus(parent.node.id)
      }
    } else if (e.key === 'Home') {
      e.preventDefault()
      focus(rows[0].node.id)
    } else if (e.key === 'End') {
      e.preventDefault()
      focus(rows[rows.length - 1].node.id)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (isParent) setOpen(cur.node.id, !isOpen)
      else setSelected(cur.node.id)
    } else if (/^[a-z0-9.]$/i.test(e.key)) {
      // Typeahead. In a 400-node tree this is the difference between usable
      // and theoretical.
      const from = rows.slice(i + 1).concat(rows.slice(0, i + 1))
      const hit = from.find((r) => r.node.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (hit) focus(hit.node.id)
    }
  }

  return (
    <div
      ref={ref}
      role="tree"
      aria-label="Project files"
      aria-multiselectable={false}
      onKeyDown={onKeyDown}
      className="w-full max-w-xs select-none py-1"
    >
      {rows.map(({ node, depth }) => {
        const isParent = !!node.children
        const isOpen = expanded.has(node.id)
        const isSelected = selected === node.id
        return (
          <div
            key={node.id}
            data-node={node.id}
            role="treeitem"
            aria-level={depth + 1}
            aria-selected={isSelected}
            aria-expanded={isParent ? isOpen : undefined}
            // Roving tabindex: one stop for the whole tree, arrows inside.
            tabIndex={focused === node.id ? 0 : -1}
            onFocus={() => setFocused(node.id)}
            onClick={() => (isParent ? setOpen(node.id, !isOpen) : setSelected(node.id))}
            style={{ paddingInlineStart: 8 + depth * 14 }}
            className={cn(
              'relative flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] pr-2',
              rowH,
              'transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
              isSelected
                ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-fg)]'
                : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
            )}
          >
            {guides && depth > 0 && (
              <span
                aria-hidden
                className="absolute inset-y-0 w-px bg-[var(--ds-border-subtle)]"
                style={{ insetInlineStart: 8 + (depth - 1) * 14 + 7 }}
              />
            )}
            <span className="grid w-3.5 shrink-0 place-items-center text-[var(--ds-fg-disabled)]">
              {isParent && (
                <ChevronRight
                  size={12}
                  aria-hidden
                  className={cn('transition-transform duration-[140ms]', isOpen && 'rotate-90')}
                />
              )}
            </span>
            <span className="shrink-0 text-[var(--ds-fg-muted)]">
              {isParent ? (
                isOpen ? (
                  <FolderOpen size={13} />
                ) : (
                  <Folder size={13} />
                )
              ) : node.label.endsWith('.tsx') || node.label.endsWith('.ts') ? (
                <FileCode size={13} />
              ) : (
                <File size={13} />
              )}
            </span>
            <span className="truncate text-label-sm">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Playground() {
  const [guides, setGuides] = React.useState(true)
  const [density, setDensity] = React.useState<'compact' | 'default'>('default')

  return (
    <PreviewStage
      label="Playground"
      minHeight={300}
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
          <KnobToggle checked={guides} onChange={setGuides} label="Indent guides" />
        </div>
      }
      code={`<div role="tree" aria-label="Project files">
  <div role="treeitem" aria-level="1" aria-expanded="true" tabIndex={0}>src</div>
  <div role="treeitem" aria-level="2" aria-expanded="true" tabIndex={-1}>ui</div>
  <div role="treeitem" aria-level="3" aria-selected="true" tabIndex={-1}>Button.tsx</div>
</div>`}
    >
      <TreeView guides={guides} density={density} />
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'tree-view',
    title: 'Tree View',
    tagline:
      'Nested, expandable hierarchy with roving focus — for data that genuinely is a tree, which is far less data than the pattern gets used for.',
    keywords: ['file tree', 'hierarchy', 'nested', 'expand', 'aria-expanded', 'explorer', 'roving'],
  },

  overview: {
    purpose:
      'A tree view shows a parent–child hierarchy where the structure itself is information the user needs. A file explorer, an org chart, a category taxonomy, a JSON inspector. The expand state is the interface: the user prunes the display to the branch they care about and everything else stays collapsed and out of the way.',
    whenToUse: [
      'The data is genuinely hierarchical and the nesting is meaningful, not incidental.',
      'The user needs to see where an item sits relative to its siblings and ancestors.',
      'Branches are large enough that showing everything at once would bury the part that matters.',
      'The hierarchy is stable enough that a user can build spatial memory of it.',
    ],
    whenNotToUse: [
      {
        text: 'It is navigation with grouped sections rather than a real hierarchy.',
        instead: 'a Sidebar, which caps at two levels for good reasons',
        to: '#/sidebar',
      },
      {
        text: 'The items are flat and only look grouped.',
        instead: 'a List with headers',
        to: '#/list',
      },
      {
        text: 'The user is picking one value from a nested set.',
        instead: 'a Combobox over flattened paths — searching beats expanding',
        to: '#/combobox',
      },
      {
        text: 'Rows carry several columns of data.',
        instead: 'a Data Table with expandable rows',
        to: '#/data-table',
      },
    ],
    reasoning: (
      <>
        <p>
          A tree is <strong>navigated as the flat list it renders as</strong>. Down moves to the
          next visible row regardless of depth; Right opens a closed node and descends an open one;
          Left closes an open node and jumps to the parent of a leaf. That two-step behaviour of
          the horizontal arrows is what lets someone traverse a deep tree without a mouse, and it
          is the part most implementations get wrong.
        </p>
        <p>
          <strong>Expanding is not selecting.</strong> Clicking a folder’s chevron opens it;
          clicking its label may open it too, but neither should select it if selecting means
          "load this into the panel on the right". Conflating the two is why file trees so often
          feel like they are fighting the user.
        </p>
        <p>
          Indentation is the only thing communicating depth, and it is fragile. Fourteen pixels per
          level is enough to read and cheap enough that six levels still leave room for a label.
          Past about four levels, users lose track regardless of how you draw it — which is a
          signal the data wants search, not a deeper tree.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'keyboard',
        title: 'The keyboard model',
        description:
          'One tab stop for the whole tree. Try ↓ ↑ to move, → to open and descend, ← to close and climb, and any letter for typeahead.',
        render: (
          <PreviewStage minHeight={280} center={false}>
            <Stack gap="sm" className="w-full">
              <TreeView />
              <p className="text-caption text-[var(--ds-fg-muted)]">
                → on a closed folder opens it; → again descends into it. ← closes, then climbs.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'guides',
        title: 'Indent guides',
        description:
          'A hairline per level makes it possible to trace a deep child back to its parent across a tall tree. Without them, depth 4 and depth 5 are a 14px judgement.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="With guides" tone="good">
                <TreeView guides />
              </Cell>
              <Cell label="Without" tone="bad">
                <TreeView guides={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'depth',
        title: 'Depth is the real limit',
        description:
          'Four levels is the practical ceiling. Past that the indent eats the label, and users lose the thread regardless of how the guides are drawn — the answer is search, not a wider panel.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-xs">
              {['Organisation', 'Region', 'Team', 'Project', 'Environment', 'Deployment'].map(
                (l, i) => (
                  <div
                    key={l}
                    style={{ paddingInlineStart: 8 + i * 14 }}
                    className={cn(
                      'flex h-7 items-center gap-1.5 text-label-sm',
                      i > 3 ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-secondary)]',
                    )}
                  >
                    <Folder size={13} className="shrink-0 opacity-60" />
                    <span className="truncate">{l}</span>
                  </div>
                ),
              )}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Collapsed',
        render: (
          <span className="flex w-40 items-center gap-1.5 px-2 text-label-sm text-[var(--ds-fg-secondary)]">
            <ChevronRight size={12} className="text-[var(--ds-fg-disabled)]" />
            <Folder size={13} className="text-[var(--ds-fg-muted)]" /> src
          </span>
        ),
      },
      {
        label: 'Expanded',
        render: (
          <span className="flex w-40 items-center gap-1.5 px-2 text-label-sm text-[var(--ds-fg-secondary)]">
            <ChevronRight size={12} className="rotate-90 text-[var(--ds-fg-disabled)]" />
            <FolderOpen size={13} className="text-[var(--ds-fg-muted)]" /> src
          </span>
        ),
      },
      {
        label: 'Leaf',
        render: (
          <span className="flex w-40 items-center gap-1.5 pl-6 pr-2 text-label-sm text-[var(--ds-fg-secondary)]">
            <FileCode size={13} className="text-[var(--ds-fg-muted)]" /> Button.tsx
          </span>
        ),
      },
      {
        label: 'Selected',
        render: (
          <span className="flex w-40 items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--ds-layer-selected)] pl-6 pr-2 text-label-sm text-[var(--ds-fg)]">
            <FileCode size={13} /> Button.tsx
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span className="flex w-40 items-center gap-1.5 rounded-[var(--radius-sm)] pl-6 pr-2 text-label-sm text-[var(--ds-fg-secondary)] outline-2 outline-offset-[-2px] outline-[var(--ds-focus-ring)]">
            <FileCode size={13} /> Input.tsx
          </span>
        ),
      },
      {
        label: 'Nested',
        render: (
          <span className="flex w-40 items-center gap-1.5 pl-10 pr-2 text-label-sm text-[var(--ds-fg-secondary)]">
            <File size={13} className="text-[var(--ds-fg-muted)]" /> nav.ts
          </span>
        ),
      },
      {
        label: 'Loading branch',
        render: (
          <span className="flex w-40 items-center gap-1.5 pl-6 pr-2 text-label-sm text-[var(--ds-fg-muted)]">
            <span className="h-3 w-20 animate-pulse rounded bg-[var(--ds-layer-active)]" />
          </span>
        ),
      },
      {
        label: 'Empty branch',
        render: (
          <span className="flex w-40 items-center gap-1.5 pl-6 pr-2 text-caption italic text-[var(--ds-fg-muted)]">
            No files
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: <TreeView />,
    caption:
      'One tab stop, roving focus, and a chevron that only appears on nodes that actually have children.',
    parts: [
      {
        n: 1,
        label: 'Row height',
        value: '28px (24px compact)',
        kind: 'size',
        note: 'Denser than a sidebar row, because a tree is scanned vertically at length. On touch it grows to 36px, which is below the 44px minimum only because the whole row is the target.',
      },
      {
        n: 2,
        label: 'Indent per level',
        value: '14px',
        kind: 'space',
        note: 'Enough to read as nesting, small enough that six levels still leave room for a filename. This single number is what caps the useful depth.',
      },
      {
        n: 3,
        label: 'Chevron',
        value: '12px, rotates 90°',
        kind: 'motion',
        note: 'Present only on nodes with children. A chevron on a leaf teaches users the affordance is meaningless, and then they stop trusting it on real parents.',
      },
      {
        n: 4,
        label: 'Indent guide',
        value: '1px at the parent’s chevron centre',
        kind: 'shape',
        note: 'Aligned to the chevron, not the label, so the line traces the actual branch. Without it, tracing a deep child to its parent across a tall tree is guesswork.',
      },
      {
        n: 5,
        label: 'Icon',
        value: '13px, muted',
        kind: 'size',
        note: 'Type, not decoration: open folder, closed folder, file kind. It is the second signal that a node is expanded.',
      },
      {
        n: 6,
        label: 'Selection',
        value: 'Layer tint, full row',
        kind: 'color',
        note: 'The whole row including the indent, so the selected item is unmissable in a tall tree. Distinct from the hover wash, which must never look like selection.',
      },
      {
        n: 7,
        label: 'Roving tabindex',
        value: 'One 0, rest −1',
        kind: 'motion',
        note: 'A 400-node tree is one tab stop. Anything else makes the tree a wall between the user and whatever follows it.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Idle row labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Type icons' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Chevron — an affordance, not content' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover wash' },
    { category: 'color', token: '--ds-layer-selected', usedFor: 'Selected row — never the hover value' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Indent guides' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on the roving node' },
    { category: 'spacing', token: 'indent', value: '14px per level', usedFor: 'Depth' },
    { category: 'spacing', token: 'gap', value: '6px', usedFor: 'Chevron to icon to label' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Row corners' },
    { category: 'typography', token: '--text-label-sm', value: '12px', usedFor: 'Row labels' },
    { category: 'motion', token: '--duration-fast', value: '140ms', usedFor: 'Chevron rotation' },
  ],

  sizes: [
    { name: 'Compact', height: '24px', gap: '6px', icon: '12px', type: '12px', use: 'File explorers and inspectors, where vertical density is the point.' },
    { name: 'Default', height: '28px', gap: '6px', icon: '13px', type: '12px', use: 'The default. Category pickers and taxonomies.' },
    { name: 'Touch', height: '36px', touch: 'Full-row target', use: 'The row is the target, so 36px is acceptable where a 36px button would not be.' },
    { name: 'Indent', gap: '14px per level', use: 'Fixed. Four levels is the practical ceiling before the label loses its room.' },
    { name: 'Chevron hit area', minWidth: '20px', use: 'Larger than the 12px glyph, so expanding does not require pixel accuracy.' },
  ],

  do: [
    {
      title: 'Give the whole tree one tab stop',
      why: 'Roving tabindex is what makes a 400-node tree passable. Without it the tree is a wall a keyboard user has to tab through to reach anything after it.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="tree" · focused.tabIndex = 0
          <br />
          everything else = −1
        </code>
      ),
    },
    {
      title: 'Make → open, then descend',
      why: 'Two presses of the same key to open a folder and enter it is the model every file explorer has taught. ← closes, then climbs to the parent.',
      render: (
        <Stack gap="xs" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>→ on closed folder → opens it</span>
          <span>→ on open folder → moves to first child</span>
          <span>← on open folder → closes it</span>
          <span>← on a leaf → moves to its parent</span>
        </Stack>
      ),
    },
    {
      title: 'Support typeahead',
      why: 'Typing "b" jumping to Button.tsx is the difference between a usable tree and a theoretical one. It comes almost free with the roving focus you already built.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          key “b” → next node starting with b
        </code>
      ),
    },
    {
      title: 'Persist the expanded set',
      why: 'A tree that collapses on every navigation makes the user rebuild their context each time. Store the open node ids, not the whole tree.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          usePersistentState('tree:open', ['src', 'ui'])
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put a chevron on a leaf',
      why: 'It promises children that do not exist. After two dead chevrons users stop trusting the affordance on real parents, and the whole tree becomes trial and error.',
      render: (
        <Stack gap="xs" className="w-40">
          <span className="flex items-center gap-1.5 text-label-sm text-[var(--ds-danger-text)]">
            <ChevronRight size={12} />
            <File size={13} /> README.md
          </span>
        </Stack>
      ),
    },
    {
      title: 'Do not use a tree for flat navigation',
      why: 'Grouped sidebar links are not a hierarchy. Wrapping them in tree semantics promises arrow-key traversal and depth that the data does not have.',
      render: (
        <Stack gap="xs" className="w-40 text-label-sm text-[var(--ds-fg-muted)]">
          <span>▸ Dashboard</span>
          <span>▸ Settings</span>
          <span>▸ Billing</span>
        </Stack>
      ),
    },
    {
      title: 'Do not nest past four levels',
      why: 'The indent eats the label and users lose the thread. Deep data needs search over full paths, not a wider panel.',
      render: (
        <div className="w-40">
          <span
            style={{ paddingInlineStart: 8 + 5 * 14 }}
            className="block truncate text-label-sm text-[var(--ds-danger-text)]"
          >
            deployment-4021.json
          </span>
        </div>
      ),
    },
    {
      title: 'Do not make expanding and selecting the same event',
      why: 'Opening a folder to see inside is not choosing it. If expanding also loads the folder into the detail panel, every exploration triggers work the user did not ask for.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          click folder → expand + select + fetch contents + navigate
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Row labels owe 4.5:1 — they are the content of the component.',
      'Indent guides are decorative and may sit low, because depth is also carried by aria-level.',
      'The selected row must be distinguishable from the hover row. Reusing one token for both means a user cannot tell what is selected while the pointer is in the tree.',
      'Chevrons are affordances, not content, and may use the disabled tone — provided aria-expanded carries the same information.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the tree once, on the last-focused node, and leaves it once.' },
      { keys: '↓ / ↑', does: 'Moves to the next or previous visible node, regardless of depth.' },
      { keys: '→', does: 'Opens a closed parent; on an open parent, moves to its first child.' },
      { keys: '←', does: 'Closes an open parent; on a leaf or closed node, moves to its parent.' },
      { keys: 'Home / End', does: 'Jumps to the first or last visible node.' },
      { keys: 'Enter', does: 'Activates a leaf, or toggles a parent.' },
      { keys: 'A–Z', does: 'Typeahead to the next node beginning with that character, wrapping.' },
      { keys: '*', does: 'Optionally expands every sibling at the current level. Cheap to add and beloved by power users.' },
    ],
    aria: [
      { attr: 'role="tree"', on: 'The container', note: 'With aria-label. Promises the full arrow-key model above — do not use it without implementing that.' },
      { attr: 'role="treeitem"', on: 'Every node', note: 'Both parents and leaves. The distinction is aria-expanded, not the role.' },
      { attr: 'aria-expanded', on: 'Parents only', note: 'Its absence is what tells assistive tech a node is a leaf. Never set it to false on something with no children.' },
      { attr: 'aria-level', on: 'Every node', note: 'One-indexed depth. This is how depth reaches a screen-reader user, since indentation does not.' },
      { attr: 'aria-selected', on: 'Every node', note: 'With aria-multiselectable on the tree when more than one can be selected.' },
      { attr: 'aria-setsize / aria-posinset', on: 'Nodes in a virtualised tree', note: 'Required once rows are windowed, or "3 of 400" becomes "3 of 20".' },
    ],
    focus:
      'One roving tab stop. The tree remembers the last-focused node and returns there on re-entry. When a node is removed, focus moves to its nearest sibling and then to its parent — never to the body. Collapsing a parent that contains the focused node must move focus to that parent.',
    screenReader: [
      'A node announces as "ui, tree item, level 2, expanded, 3 of 4".',
      'Announce asynchronous loading. A branch that opens into silence for two seconds reads as an empty folder.',
      'An empty branch must say so explicitly — an expanded node with no announced children is indistinguishable from a broken one.',
    ],
    touch:
      'Rows grow to 36px and the chevron gets a 44px hit area of its own, so expanding does not require hitting a 12px glyph. There is no hover, so selection and expansion must be visually distinct at rest. Deep trees on a phone are usually the wrong pattern — a drill-down list that replaces the view one level at a time is easier to use and easier to go back from.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// A tree is navigated as the flat list it renders as. Build that list once
// per render and every key handler becomes an index calculation.
function flatten(nodes, expanded, depth = 0) {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children && expanded.has(node.id)
      ? flatten(node.children, expanded, depth + 1)
      : []),
  ])
}

const rows = flatten(tree, expanded)

function onKeyDown(e) {
  const i = rows.findIndex((r) => r.node.id === focused)
  const { node, depth } = rows[i]
  const isParent = !!node.children
  const isOpen = expanded.has(node.id)

  switch (e.key) {
    case 'ArrowDown': return focus(rows[i + 1])
    case 'ArrowUp':   return focus(rows[i - 1])

    // Two-step: open, then descend. This is the model every file explorer
    // has taught, and the part most implementations get wrong.
    case 'ArrowRight':
      if (isParent && !isOpen) return setOpen(node.id, true)
      if (isParent && isOpen)  return focus(rows[i + 1])
      return

    case 'ArrowLeft':
      if (isParent && isOpen) return setOpen(node.id, false)
      return focus(rows.slice(0, i).reverse().find((r) => r.depth === depth - 1))
  }
}

// Persist the open set, not the tree. A tree that collapses on every
// navigation makes the user rebuild their context each time.
const [expanded, setExpanded] = usePersistentState('tree:open', ['src'])`,
    },
    html: {
      lang: 'html',
      code: `<div role="tree" aria-label="Project files">
  <!-- aria-expanded ONLY on parents. Its absence is what marks a leaf. -->
  <div role="treeitem" aria-level="1" aria-expanded="true"
       aria-setsize="3" aria-posinset="1" tabindex="0">
    <svg aria-hidden="true">…</svg> src
  </div>

  <div role="treeitem" aria-level="2" aria-expanded="false"
       aria-setsize="3" aria-posinset="1" tabindex="-1">
    <svg aria-hidden="true">…</svg> docs
  </div>

  <!-- A leaf: no aria-expanded, no chevron. -->
  <div role="treeitem" aria-level="2" aria-selected="true"
       aria-setsize="3" aria-posinset="3" tabindex="-1">
    <svg aria-hidden="true">…</svg> main.tsx
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `[role='tree'] { user-select: none; }

[role='treeitem'] {
  display: flex;
  align-items: center;
  gap: 6px;
  block-size: 28px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--ds-fg-secondary);
  /* Depth comes from a custom property so one rule covers every level. */
  padding-inline-start: calc(8px + var(--depth, 0) * 14px);
}

[role='treeitem']:hover        { background: var(--ds-layer-hover); }

/* Must differ from hover, or the user cannot tell what is selected while
   the pointer is anywhere in the tree. */
[role='treeitem'][aria-selected='true'] {
  background: var(--ds-layer-selected);
  color: var(--ds-fg);
}

[role='treeitem'][aria-expanded='true'] > .ds-tree__chevron {
  transform: rotate(90deg);
}

/* Aligned to the parent's chevron centre, so the line traces the branch
   rather than the text. */
.ds-tree__guide {
  position: absolute;
  inset-block: 0;
  inline-size: 1px;
  background: var(--ds-border-subtle);
  inset-inline-start: calc(8px + (var(--depth) - 1) * 14px + 7px);
}

@media (pointer: coarse) {
  [role='treeitem'] { block-size: 36px; }
  .ds-tree__chevron { padding: 12px; margin: -12px; }  /* 44px without moving it */
}`,
    },
    api: [
      {
        name: 'TreeView',
        props: [
          { name: 'nodes', type: 'TreeNode[]', required: true, description: 'The hierarchy. Children may be undefined (a leaf) or an empty array (a parent with nothing in it) — the two must render differently.' },
          { name: 'expanded', type: 'Set<string>', required: true, description: 'Open node ids. Controlled, so it can be persisted.' },
          { name: 'onExpandedChange', type: '(next: Set<string>) => void', required: true, description: 'Fired by the chevron, by Enter on a parent, and by the arrow keys.' },
          { name: 'selected', type: 'string | string[]', description: 'An array turns on aria-multiselectable and Shift-range selection.' },
          { name: 'onSelect', type: '(id: string) => void', required: true, description: 'Separate from expansion. Expanding a folder must not select it.' },
          { name: 'guides', type: 'boolean', default: 'true', description: 'Indent guides. Turn them off only for trees that never exceed two levels.' },
          { name: 'loadChildren', type: '(id: string) => Promise<TreeNode[]>', description: 'Lazy branches. Must render a loading row, and announce it.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Expand the path to the selected node on load, and nothing else. A tree that opens fully collapsed hides where the user already is.',
      'Add a filter box above the tree that matches on the full path and auto-expands the matches. In any tree past about fifty nodes this becomes the primary interaction.',
      'Distinguish "no children" from "children not loaded yet". A parent that expands into silence is indistinguishable from a broken request.',
      'Support Shift-click for a contiguous range when multi-select is on — it is what users expect from every file manager they have used.',
      'Give the chevron its own hit area of at least 20px. Expanding and selecting are different intents, and hitting a 12px glyph to separate them is unreasonable.',
    ],
    performance: [
      'Virtualise past roughly 200 visible rows, and add aria-setsize and aria-posinset when you do — without them a windowed tree reports "3 of 20" for a 400-node level.',
      'Keep expansion state in a Set of ids, not as a flag on each node. Toggling a flag deep in a nested object forces a rebuild of the whole tree on every click.',
      'Memoise the flattened list on the node data and the expanded set. Re-flattening on every render is the usual cause of a tree that feels sluggish to arrow through.',
      'Load branches lazily past a few hundred nodes, and prefetch on hover over a chevron — the fetch usually finishes before the click lands.',
    ],
    mistakes: [
      'Making every node a tab stop, so a 400-node tree is 400 tab presses.',
      'aria-expanded="false" on leaves, which makes screen readers announce empty folders that do not exist.',
      'Right arrow that only descends and never opens, so a closed branch cannot be entered from the keyboard.',
      'Reusing the hover token for selection, so nothing is distinguishable while the pointer is over the tree.',
      'Chevrons on leaves, which trains users to distrust the affordance everywhere.',
      'Collapsing the whole tree on navigation, forcing the user to rebuild their context each time.',
      'Expanding and selecting on one event, so browsing a folder fetches and navigates.',
    ],
    realWorld: [
      'File explorers are the pattern’s home ground and set every expectation your users arrive with. Deviating from the VS Code keyboard model costs more than any improvement it buys.',
      'Once a tree exceeds roughly fifty nodes, search overtakes expansion as the primary interaction. Build the filter before you polish the indent guides.',
      'Category pickers are usually better as a Combobox over flattened paths — "Electronics › Audio › Headphones" is one search away instead of three expansions.',
      'On mobile, a drill-down list that replaces the view one level at a time consistently beats an indented tree: back is a familiar gesture, and horizontal space is not spent on depth.',
    ],
  },
})
