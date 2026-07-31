import * as React from 'react'
import {
  Archive,
  CornerDownLeft,
  FileText,
  Forward,
  MoreHorizontal,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { Avatar, Kbd } from '@/ui/Display'
import { IconButton } from '@/ui/Button'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   MASTER–DETAIL
   The desktop pattern. The list keeps its place while the detail changes.
   ======================================================================== */

const MAIL = [
  {
    from: 'Grace Hopper',
    subject: 'p95 back under 300ms',
    preview: 'The index change landed at 14:02 and the graph settled within a minute…',
    time: '14:20',
    unread: true,
  },
  {
    from: 'Alan Turing',
    subject: 'Postmortem draft',
    preview: 'First pass attached. I have left the timeline section for you…',
    time: '13:04',
    unread: true,
  },
  {
    from: 'Katherine Johnson',
    subject: 'Orbital Systems renewal',
    preview: 'They want to move to annual billing before the end of the quarter…',
    time: '11:47',
  },
  {
    from: 'Ada Lovelace',
    subject: 'Re: Analytical Engines pilot',
    preview: 'Confirmed for Thursday. Two of their engineers will join…',
    time: 'Yesterday',
  },
]

function MasterDetail({
  density = 'comfortable',
  hoverActions = true,
}: {
  density?: 'comfortable' | 'compact'
  hoverActions?: boolean
}) {
  const [sel, setSel] = React.useState(0)
  const listRef = React.useRef<HTMLUListElement>(null)
  const compact = density === 'compact'

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    setSel((s) => Math.max(0, Math.min(MAIL.length - 1, s + (e.key === 'ArrowDown' ? 1 : -1))))
  }

  return (
    <div className="flex h-[17rem] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      <ul
        ref={listRef}
        role="listbox"
        aria-label="Messages"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex w-[16rem] shrink-0 flex-col overflow-y-auto border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
      >
        {MAIL.map((m, i) => (
          <li
            key={m.subject}
            role="option"
            aria-selected={i === sel}
            onClick={() => setSel(i)}
            className={`group relative cursor-pointer border-b border-[var(--ds-border-subtle)] ${
              compact ? 'px-2.5 py-1.5' : 'px-3 py-2.5'
            } ${
              i === sel
                ? 'bg-[var(--ds-accent-subtle)]'
                : 'hover:bg-[var(--ds-layer-hover)]'
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span
                className={`min-w-0 flex-1 truncate text-label ${
                  m.unread ? 'font-semibold text-[var(--ds-fg)]' : 'text-[var(--ds-fg-secondary)]'
                }`}
              >
                {m.from}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-[var(--ds-fg-muted)]">
                {m.time}
              </span>
            </div>
            <div className="truncate text-caption text-[var(--ds-fg)]">{m.subject}</div>
            {!compact && (
              <div className="truncate text-caption text-[var(--ds-fg-muted)]">{m.preview}</div>
            )}
            {hoverActions && (
              /* Revealed on hover AND on focus-within — hover alone would
                 make these unreachable by keyboard. */
              <span className="absolute right-2 top-1.5 hidden gap-0.5 rounded-[var(--radius-sm)] bg-[var(--ds-surface-overlay)] p-0.5 shadow-e2 group-hover:flex group-focus-within:flex">
                <IconButton label="Archive" icon={<Archive />} size="xs" variant="text" />
                <IconButton label="Delete" icon={<Trash2 />} size="xs" variant="text" />
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2">
          <Avatar name={MAIL[sel].from} size="sm" />
          <Stack gap="xs" className="min-w-0 flex-1">
            <span className="truncate text-label text-[var(--ds-fg)]">{MAIL[sel].subject}</span>
            <span className="truncate text-caption text-[var(--ds-fg-muted)]">
              {MAIL[sel].from}
            </span>
          </Stack>
          <IconButton label="Star" icon={<Star />} size="sm" variant="text" />
          <IconButton label="Forward" icon={<Forward />} size="sm" variant="text" />
          <IconButton label="More" icon={<MoreHorizontal />} size="sm" variant="text" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
            {MAIL[sel].preview} The list on the left has not moved and has not lost its selection,
            which is the whole reason this layout exists. Arrow keys walk the queue without focus
            ever leaving it.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ===========================================================================
   SPLIT VIEW — a real draggable divider
   ======================================================================== */

function SplitView() {
  const [pct, setPct] = React.useState(46)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const move = (clientX: number) => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPct(Math.max(22, Math.min(78, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={wrapRef}
      className="flex h-[13rem] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]"
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <div
        className="flex min-w-0 flex-col gap-1.5 overflow-hidden bg-[var(--ds-surface)] p-3"
        style={{ width: `${pct}%` }}
      >
        <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Editor</span>
        {['# Postmortem', '', '## Timeline', '14:02 — index deployed', '14:03 — p95 recovered'].map(
          (l, i) => (
            <span key={i} className="font-mono text-[11px] text-[var(--ds-fg-secondary)]">
              {l || ' '}
            </span>
          ),
        )}
      </div>

      {/* A real separator: draggable, focusable, and arrow-key operable. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={22}
        aria-valuemax={78}
        aria-label="Resize panes"
        tabIndex={0}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setPct((p) => Math.max(22, p - 4))
          if (e.key === 'ArrowRight') setPct((p) => Math.min(78, p + 4))
        }}
        className="group relative w-px shrink-0 cursor-col-resize bg-[var(--ds-border)] outline-none"
      >
        {/* 1px line, 9px hit area — the target is not the same as the mark. */}
        <span className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-[var(--ds-accent)]/20 group-focus-visible:bg-[var(--ds-accent)]/30" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Preview</span>
        <span className="text-label text-[var(--ds-fg)]">Postmortem</span>
        <span className="text-caption font-semibold text-[var(--ds-fg-secondary)]">Timeline</span>
        <span className="text-caption text-[var(--ds-fg-muted)]">14:02 — index deployed</span>
        <span className="text-caption text-[var(--ds-fg-muted)]">14:03 — p95 recovered</span>
      </div>
    </div>
  )
}

/* ===========================================================================
   COMMAND PALETTE
   ======================================================================== */

const COMMANDS = [
  { group: 'Navigate', icon: <FileText size={14} />, label: 'Go to Postmortem draft', key: '' },
  { group: 'Navigate', icon: <FileText size={14} />, label: 'Go to Sprint 14', key: '' },
  { group: 'Actions', icon: <Archive size={14} />, label: 'Archive conversation', key: 'E' },
  { group: 'Actions', icon: <Star size={14} />, label: 'Star conversation', key: 'S' },
  { group: 'Actions', icon: <Trash2 size={14} />, label: 'Delete conversation', key: '⌫' },
]

function Palette({ query = '' }: { query?: string }) {
  const [active, setActive] = React.useState(0)
  const shown = COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
  let lastGroup = ''

  return (
    <div className="w-full max-w-[24rem] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5">
      <div className="flex items-center gap-2 border-b border-[var(--ds-border-subtle)] px-3 py-2.5">
        <Search size={15} className="text-[var(--ds-fg-muted)]" />
        <span className="flex-1 text-body-sm text-[var(--ds-fg)]">
          {query || <span className="text-[var(--ds-fg-disabled)]">Type a command or search…</span>}
        </span>
        <Kbd>esc</Kbd>
      </div>
      <div className="max-h-[11rem] overflow-y-auto p-1.5">
        {shown.map((c, i) => {
          const header = c.group !== lastGroup ? c.group : null
          lastGroup = c.group
          return (
            <React.Fragment key={c.label}>
              {header && (
                <div className="px-2 pb-1 pt-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                  {header}
                </div>
              )}
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left ${
                  i === active ? 'bg-[var(--ds-layer-hover)]' : ''
                }`}
              >
                <span className="text-[var(--ds-fg-muted)]">{c.icon}</span>
                <span className="flex-1 text-label text-[var(--ds-fg)]">{c.label}</span>
                {c.key && <Kbd>{c.key}</Kbd>}
              </button>
            </React.Fragment>
          )
        })}
        {shown.length === 0 && (
          <div className="px-2 py-6 text-center text-caption text-[var(--ds-fg-muted)]">
            No matching commands
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-1.5">
        <span className="flex items-center gap-1 text-caption text-[var(--ds-fg-muted)]">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navigate
        </span>
        <span className="flex items-center gap-1 text-caption text-[var(--ds-fg-muted)]">
          <Kbd>
            <CornerDownLeft size={10} />
          </Kbd>{' '}
          run
        </span>
      </div>
    </div>
  )
}

/* -- shortcut sheet -------------------------------------------------------- */

const SHORTCUTS: { keys: string[]; does: string }[] = [
  { keys: ['⌘', 'K'], does: 'Command palette' },
  { keys: ['/'], does: 'Focus search' },
  { keys: ['J'], does: 'Next item' },
  { keys: ['K'], does: 'Previous item' },
  { keys: ['E'], does: 'Archive' },
  { keys: ['⌘', '↵'], does: 'Send' },
  { keys: ['?'], does: 'This list' },
]

function ShortcutSheet() {
  return (
    <div className="w-full max-w-[20rem] rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4">
      <Stack gap="sm">
        <span className="text-label text-[var(--ds-fg)]">Keyboard shortcuts</span>
        {SHORTCUTS.map((s) => (
          <Row key={s.does} className="justify-between">
            <span className="text-caption text-[var(--ds-fg-secondary)]">{s.does}</span>
            <span className="flex gap-1">
              {s.keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
          </Row>
        ))}
      </Stack>
    </div>
  )
}

function Playground() {
  const [density, setDensity] = React.useState<'comfortable' | 'compact'>('comfortable')
  const [hoverActions, setHoverActions] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={320}
      center={false}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Density">
            <KnobSelect
              value={density}
              onChange={setDensity}
              options={['comfortable', 'compact'] as const}
            />
          </Knob>
          <KnobToggle checked={hoverActions} onChange={setHoverActions} label="Hover actions" />
        </div>
      }
      code={`<div className="flex">
  <ul role="listbox" aria-label="Messages" tabIndex={0} onKeyDown={arrowKeys}>
    {items.map((m, i) => (
      <li role="option" aria-selected={i === sel} key={m.id}>…</li>
    ))}
  </ul>
  <section aria-label="Message">{detail}</section>
</div>`}
    >
      <Stack gap="md" className="w-full">
        <p className="text-caption text-[var(--ds-fg-muted)]">
          Click the list, then use <Kbd>↑</Kbd> <Kbd>↓</Kbd>. Selection moves and the detail
          follows, but focus never leaves the list — that is what makes a queue workable at speed.
        </p>
        <MasterDetail density={density} hoverActions={hoverActions} />
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'desktop-patterns',
    title: 'Desktop Patterns',
    group: 'Patterns',
    tagline:
      'What a large screen, a precise pointer and a keyboard make possible — and the accessibility debt each of them quietly runs up.',
    keywords: [
      'master detail',
      'split view',
      'command palette',
      'keyboard shortcut',
      'power user',
      'density',
      'hover',
      'context menu',
      'resizable',
    ],
  },

  overview: {
    purpose:
      'Desktop is not "mobile with more room". It adds three affordances a phone does not have — a precise pointer that can hover, a keyboard that can carry commands, and enough space to show two things at once — and each one enables patterns that are impossible or pointless on touch.',
    whenToUse: [
      'Screens people work in for hours: queues, inboxes, editors, consoles, admin tools.',
      'Any list where the user acts on item after item and must not lose their place.',
      'Products with enough surface area that navigating by menu has become slower than typing what you want.',
      'Anywhere a second pane would remove a round trip — an editor and its preview, a list and its detail.',
    ],
    whenNotToUse: [
      {
        text: 'The primary device is a phone.',
        instead: 'Mobile Patterns. Master–detail becomes list-then-page, not two squeezed columns',
        to: '#/mobile-patterns',
      },
      {
        text: 'The screen is used once a month.',
        instead: 'obvious, labelled controls. Shortcuts and density reward practice nobody will get',
      },
      {
        text: 'The product has fewer than about twenty destinations.',
        instead: 'plain navigation. A command palette over a small app is ceremony',
      },
      {
        text: 'The second pane would only show what the first already says.',
        instead: 'one pane. Splitting for symmetry halves both',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Design for the affordance, not the width.</strong> A 1440px touchscreen has no
          hover and a 320px window on a laptop has a keyboard. Media queries are a rough proxy;
          <code> pointer: fine</code> and <code>hover: hover</code> are the honest questions, and
          they are the ones that determine whether a hover-reveal or a right-click menu makes any
          sense at all.
        </p>
        <p>
          <strong>Master–detail is the pattern desktop exists for.</strong> Working through a queue
          means the list must not move, must not lose its selection, and must not steal focus when
          the detail changes. Get those three right and someone can process a hundred items with
          arrow keys; get any one wrong and they are back to clicking, going back, and finding their
          place again.
        </p>
        <p>
          <strong>Hover is an accelerator and never a mechanism.</strong> Revealing row actions on
          hover keeps a list calm, but if hovering is the only way to find them, they do not exist
          for keyboard users, touch users, or anyone who never thought to try. Reveal on{' '}
          <code>:hover</code> and <code>:focus-within</code> together, and make sure every action
          also lives somewhere permanent.
        </p>
        <p>
          <strong>The command palette is recognition beating recall, at scale.</strong> Shortcuts
          demand memory; menus demand hunting. A palette asks the user to remember only that{' '}
          <Kbd>⌘K</Kbd> exists and then lets them search by name — which is why it has become the
          standard escape hatch for products that outgrew their own navigation. It is a supplement
          to navigation, though, not a replacement for it.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'split',
        title: 'Split view',
        description:
          'Two panes and a divider that can be dragged, double-clicked to reset, and moved with arrow keys when focused. The 1px line has a 9px hit area.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <SplitView />
          </PreviewStage>
        ),
      },
      {
        id: 'palette',
        title: 'Command palette',
        description:
          'One shortcut to remember, everything else searchable by name. Grouped results, keyboard hints in the footer, and the shortcut for each command shown beside it — so the palette teaches the shortcuts it replaces.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="justify-center">
              <Palette />
              <Palette query="arch" />
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'shortcuts',
        title: 'A discoverable shortcut sheet',
        description:
          'Bound to ? — the convention every keyboard-first product shares. Shortcuts nobody can find are shortcuts nobody uses.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <ShortcutSheet />
          </PreviewStage>
        ),
      },
      {
        id: 'density',
        title: 'Density',
        description:
          'Compact removes padding, never type size or contrast. The comfortable default is for everyone; compact is for the person who has this screen open all day.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              <MasterDetail density="comfortable" hoverActions={false} />
              <MasterDetail density="compact" hoverActions={false} />
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Row default',
        render: (
          <span className="block w-32 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] px-2 py-1 text-caption text-[var(--ds-fg-secondary)]">
            Grace Hopper
          </span>
        ),
      },
      {
        label: 'Row hover',
        render: (
          <span className="block w-32 rounded-[var(--radius-sm)] bg-[var(--ds-layer-hover)] px-2 py-1 text-caption text-[var(--ds-fg)]">
            Grace Hopper
          </span>
        ),
      },
      {
        label: 'Row selected',
        render: (
          <span className="block w-32 rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] px-2 py-1 text-caption text-[var(--ds-fg)]">
            Grace Hopper
          </span>
        ),
      },
      {
        label: 'Row focused',
        render: (
          <span className="block w-32 rounded-[var(--radius-sm)] px-2 py-1 text-caption text-[var(--ds-fg)] outline-2 -outline-offset-2 outline-[var(--ds-focus-ring)]">
            Grace Hopper
          </span>
        ),
      },
      {
        label: 'Hover actions',
        render: (
          <Row gap="sm">
            <IconButton label="Archive" icon={<Archive />} size="xs" variant="text" />
            <IconButton label="Delete" icon={<Trash2 />} size="xs" variant="text" />
          </Row>
        ),
      },
      { label: 'Divider idle', render: <span className="block h-8 w-px bg-[var(--ds-border)]" /> },
      {
        label: 'Divider active',
        render: <span className="block h-8 w-px bg-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]" />,
      },
      {
        label: 'Shortcut hint',
        render: (
          <Row gap="sm">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </Row>
        ),
      },
    ],
  },

  anatomy: {
    render: <MasterDetail />,
    caption:
      'Master–detail. The list owns focus and the selection; the detail is a consequence. Nothing on the right can move the left-hand pane.',
    parts: [
      {
        n: 1,
        label: 'Master pane',
        value: '20–28rem',
        kind: 'size',
        note: 'Below 20rem the rows truncate into uselessness; above 28rem the detail starts to suffer. It is a fixed width, not a fraction, so it does not move when the window resizes.',
      },
      {
        n: 2,
        label: 'Row',
        value: '56px comfortable / 36px compact',
        kind: 'size',
        note: 'Compact removes the preview line and the padding. It never shrinks the type — that is how density becomes an accessibility failure.',
      },
      {
        n: 3,
        label: 'Selection',
        value: 'tinted row, not a border',
        kind: 'color',
        note: 'A background carries further in peripheral vision than an outline, which matters when the eye is on the detail pane and the list is only being tracked.',
      },
      {
        n: 4,
        label: 'Focus ring',
        value: 'on the list, not the row',
        kind: 'shape',
        note: 'The list is one tab stop with roving selection inside it. Fifty rows as fifty tab stops is what makes a queue unusable by keyboard.',
      },
      {
        n: 5,
        label: 'Hover actions',
        value: 'revealed on hover and focus-within',
        kind: 'motion',
        note: 'Both, always. Hover alone hides them from every keyboard user and from touch entirely.',
      },
      {
        n: 6,
        label: 'Divider',
        value: '1px mark, 9px target',
        kind: 'size',
        note: 'The visible line and the hit area are different sizes. A 1px grab target is a Fitts’s law problem you can fix for free.',
      },
      {
        n: 7,
        label: 'Detail header',
        value: 'sticky, 48px',
        kind: 'space',
        note: 'The actions for the selected item stay visible while its body scrolls. They are also the permanent home of whatever the hover actions duplicate.',
      },
      {
        n: 8,
        label: 'Detail well',
        value: 'independent scroll',
        kind: 'space',
        note: 'Two scroll contexts, not one. Scrolling the detail must never move the list — losing your place in the queue is the failure this layout exists to prevent.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'master width', value: '20–28rem', usedFor: 'The list pane' },
    { category: 'spacing', token: 'row height', value: '56px / 36px', usedFor: 'Comfortable / compact' },
    { category: 'spacing', token: 'divider target', value: '9px', usedFor: 'Resize hit area' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Selected row' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hovered row' },
    { category: 'color', token: '--ds-border', usedFor: 'The divider mark' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Command palette' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Palette elevation' },
    { category: 'motion', token: 'duration', value: '0ms', usedFor: 'Selection change — never animated' },
    { category: 'typography', token: '--text-label', value: '13px', usedFor: 'Row titles at both densities' },
  ],

  sizes: [
    { name: 'Master pane', minWidth: '20rem', maxWidth: '28rem', use: 'Fixed. Does not flex with the window.' },
    { name: 'Row, comfortable', height: '56px', padding: '10px 12px', use: 'Sender, subject, preview.' },
    { name: 'Row, compact', height: '36px', padding: '6px 10px', use: 'Sender and subject. Same type size.' },
    { name: 'Divider', minWidth: '1px', touch: '9px', use: 'Mark and target are different.' },
    { name: 'Palette', maxWidth: '36rem', height: 'max 60vh', use: 'Centred, ~20% from the top.' },
    { name: 'Palette row', height: '36px', padding: '6px 8px', use: 'Icon, label, shortcut.' },
    { name: 'Split minimum', minWidth: '22%', maxWidth: '78%', use: 'Clamp the drag. A 3% pane is a bug the user cannot undo.' },
    { name: 'Icon button', height: '24px (xs)', touch: '32px', use: 'Hover actions. Smaller than touch, because it is not touch.' },
  ],

  do: [
    {
      title: 'Keep focus in the list while selection moves',
      why: 'Arrow-keying a queue only works if focus stays put. Moving focus into the detail on every selection means the user must Tab back for every single item.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          ↓ → selection moves · focus stays on the list
        </span>
      ),
    },
    {
      title: 'Reveal on hover and focus-within',
      why: 'Hover-only actions do not exist for keyboard users. One extra selector makes the same row work for everyone.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          .row:hover .actions, .row:focus-within .actions
        </code>
      ),
    },
    {
      title: 'Give the 1px divider a 9px target',
      why: 'Fitts’s law: a one-pixel target costs real time to acquire and misses often. The mark should be thin; the thing you have to hit should not be.',
      render: (
        <span className="relative flex h-8 w-16 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)]">
          <span className="h-full w-px bg-[var(--ds-border)]" />
          <span className="absolute inset-y-0 left-1/2 w-[9px] -translate-x-1/2 bg-[var(--ds-accent)]/20" />
        </span>
      ),
    },
    {
      title: 'Show the shortcut next to the command',
      why: 'The palette is where people go before they know the shortcut. Printing it beside the result turns every use into a lesson, and users graduate to the faster path on their own.',
      render: (
        <Row className="w-40 justify-between">
          <span className="text-caption text-[var(--ds-fg)]">Archive</span>
          <Kbd>E</Kbd>
        </Row>
      ),
    },
    {
      title: 'Bind the shortcut sheet to ?',
      why: 'It is the shared convention, and it is the only way most people discover that shortcuts exist at all.',
      render: (
        <Row gap="sm">
          <Kbd>?</Kbd>
          <span className="text-caption text-[var(--ds-fg-muted)]">→ all shortcuts</span>
        </Row>
      ),
    },
    {
      title: 'Remember the pane size',
      why: 'Someone who dragged the divider meant it. Resetting on reload asks them to do it again every session, which reads as the product forgetting.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          drag → persisted per user, per view
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not hide actions behind hover alone',
      why: 'A keyboard user cannot hover, a touch user cannot hover, and nobody discovers a control they have never seen. It is a WCAG failure as well as a usability one.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          :hover only → invisible to Tab, invisible to touch
        </span>
      ),
    },
    {
      title: 'Do not make the palette the only way to do something',
      why: 'It is an accelerator layered over navigation, not a replacement for it. A command reachable only by typing its name is a command most users will never find.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          "Export CSV" exists only in ⌘K
        </span>
      ),
    },
    {
      title: 'Do not shrink type for density',
      why: 'Compact is about padding. Dropping to 11px body text to fit two more rows fails contrast at a glance and hurts precisely the people who use the screen most.',
      render: (
        <span className="block w-32 rounded-[var(--radius-sm)] border border-[var(--ds-danger-border)] px-2 py-1 text-[10px] text-[var(--ds-fg-muted)]">
          Grace Hopper · 10px
        </span>
      ),
    },
    {
      title: 'Do not let the detail pane move the list',
      why: 'Scrolling, loading or acting in the detail must leave the queue untouched. Losing your place is the exact failure master–detail exists to prevent.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          detail loads → list scrolls to top
        </span>
      ),
    },
    {
      title: 'Do not override browser shortcuts',
      why: '⌘W, ⌘T, ⌘L and ⌘F belong to the browser. Taking ⌘F for your own search is the most common version, and it breaks a reflex nobody will unlearn for you.',
      render: (
        <Row gap="sm">
          <Kbd>⌘</Kbd>
          <Kbd>F</Kbd>
          <span className="text-caption text-[var(--ds-danger-text)]">is the browser’s</span>
        </Row>
      ),
    },
    {
      title: 'Do not split a pane below about 22%',
      why: 'A pane dragged to nothing is a state users reach by accident and cannot easily undo. Clamp the range, and offer a double-click reset.',
      render: (
        <span className="flex h-8 w-24 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--ds-danger-border)]">
          <span className="w-[6%] bg-[var(--ds-danger-subtle)]" />
          <span className="flex-1 bg-[var(--ds-surface-inset)]" />
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.4', name: 'Character Key Shortcuts', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'A selected row must be distinguishable from a hovered one, and both from neither. Three background steps that survive a greyscale screenshot.',
      'The divider needs 3:1 against both panes, which is harder than it sounds when one pane is a surface and the other is the canvas.',
      'Compact density must not reduce contrast. Smaller padding is fine; lighter text to "balance" it is the failure that follows.',
    ],
    keyboard: [
      { keys: '↑ ↓ or J K', does: 'Moves selection within the list. The list is one tab stop, not one per row.' },
      { keys: 'Enter', does: 'Acts on the selection — opens it, or moves focus into the detail deliberately.' },
      { keys: 'Tab', does: 'Leaves the list for the next region. It does not walk the rows.' },
      { keys: '⌘K or /', does: 'Opens the palette or focuses search. One of these should always work.' },
      { keys: '?', does: 'Shows the shortcut sheet.' },
      { keys: '← → on the divider', does: 'Resizes in steps once the separator has focus.' },
      { keys: 'Escape', does: 'Closes the palette and returns focus where it was.' },
    ],
    aria: [
      {
        attr: 'role="listbox" / role="option"',
        on: 'The master list',
        note: 'With aria-selected and roving tabindex. This is what makes fifty rows a single tab stop with an internal cursor.',
      },
      {
        attr: 'aria-activedescendant',
        on: 'The list',
        note: 'Lets the list keep DOM focus while the selection moves — the mechanism behind "selection moves, focus does not".',
      },
      {
        attr: 'role="separator"',
        on: 'The divider',
        note: 'With aria-orientation, aria-valuenow, aria-valuemin and aria-valuemax, plus tabindex so it can actually be reached.',
      },
      {
        attr: 'role="dialog"',
        on: 'The command palette',
        note: 'Modal, labelled, focus-trapped. The input is a combobox with aria-controls pointing at the results list.',
      },
      {
        attr: 'aria-live="polite"',
        on: 'The palette result count',
        note: '"6 results" as the query narrows. Without it a screen-reader user is typing into silence.',
      },
      {
        attr: 'Single-key shortcuts',
        on: 'J, K, E, S',
        note: 'WCAG 2.1.4: they must be disableable, remappable, or active only on focus — and they must never fire while a text field has focus.',
      },
    ],
    focus:
      'The list holds focus while selection moves through it via aria-activedescendant. Focus enters the detail only on a deliberate act. The palette traps focus while open and returns it exactly where it was on close. Nothing here may remove a focus ring — on a keyboard-first screen the ring is the cursor.',
    screenReader: [
      'A row announces as "Grace Hopper, p95 back under 300ms, unread, selected, 1 of 4". Position in the set matters when someone is working a queue.',
      'Announce the detail change politely when selection moves, or a screen-reader user gets no confirmation that anything happened.',
      'Hover-revealed actions must be in the tab order when the row has focus. If they only appear on :hover they are unreachable, which is a plain 2.1.1 failure.',
      'The palette needs its result count in a live region, and each result needs its shortcut in its accessible name — not only in a visual Kbd.',
      'Single-key shortcuts must not fire while a text input has focus. Typing "e" into a search box must never archive anything.',
    ],
    touch:
      'These patterns assume a precise pointer. Under `(hover: none)`, hover-revealed actions must be permanently visible or moved into a menu, the divider becomes a fixed layout, and master–detail becomes list-then-page. Do not ship a 9px drag target to a touchscreen — check the pointer, not the width.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Master–detail: one tab stop, roving selection, focus stays in the list.
<ul
  role="listbox"
  aria-label="Messages"
  aria-activedescendant={\`row-\${selected}\`}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(+1) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); move(-1) }
    if (e.key === 'Enter')     detailRef.current?.focus()   // deliberate only
  }}
>
  {items.map((m, i) => (
    <li id={\`row-\${i}\`} key={m.id} role="option" aria-selected={i === selected}>
      {m.subject}
      {/* Hover AND focus-within — hover alone excludes the keyboard */}
      <span className="hidden group-hover:flex group-focus-within:flex">
        <IconButton label="Archive" icon={<Archive />} />
      </span>
    </li>
  ))}
</ul>

// Ask about the affordance, not the width. A 1440px touchscreen
// has no hover; a narrow laptop window still has a keyboard.
const finePointer = useMediaQuery('(pointer: fine)')
const canHover    = useMediaQuery('(hover: hover)')

// Single-key shortcuts must never fire from inside a text field.
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    const el = document.activeElement
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return
    if (el instanceof HTMLElement && el.isContentEditable) return
    if (e.key === 'j') move(+1)
    if (e.key === 'e') archive()
    if (e.key === '?') setShortcutsOpen(true)
  }
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [])`,
    },
    css: {
      lang: 'css',
      code: `/* The mark is 1px. The target is not — Fitts's law is free to fix. */
.ds-split__divider {
  position: relative;
  inline-size: 1px;
  background: var(--ds-border);
  cursor: col-resize;
}
.ds-split__divider::before {
  content: '';
  position: absolute;
  inset-block: 0;
  inset-inline: -4px;          /* 9px total hit area */
}
.ds-split__divider:hover::before,
.ds-split__divider:focus-visible::before {
  background: color-mix(in oklab, var(--ds-accent) 20%, transparent);
}

/* Both selectors, always. Hover alone hides these from the keyboard. */
.ds-row__actions { display: none; }
.ds-row:hover .ds-row__actions,
.ds-row:focus-within .ds-row__actions { display: flex; }

/* Density is padding. Type size and contrast do not move. */
[data-density='compact'] .ds-row { padding-block: 6px; }
[data-density='compact'] .ds-row__preview { display: none; }

/* Selection reads further in peripheral vision than an outline does. */
.ds-row[aria-selected='true'] { background: var(--ds-accent-subtle); }

/* Ask about the pointer, not the width. */
@media (hover: none) {
  .ds-row__actions { display: flex; }   /* nothing to reveal on */
  .ds-split__divider { display: none; } /* no dragging without a pointer */
}`,
    },
    api: [
      {
        name: 'Kbd',
        props: [
          { name: 'children', type: 'ReactNode', required: true, description: 'One key. Compose several for a chord — each key gets its own element.' },
        ],
      },
      {
        name: 'Split view contract',
        props: [
          { name: 'role', type: '"separator"', required: true, description: 'On the divider, with aria-orientation.' },
          { name: 'aria-valuenow / min / max', type: 'number', required: true, description: 'The current split as a percentage, and the clamped range.' },
          { name: 'tabIndex', type: '0', required: true, description: 'The divider must be reachable, and arrow keys must resize it.' },
          { name: 'onDoubleClick', type: '() => void', description: 'Resets to the default ratio. The cheapest possible undo for a drag.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Pick one shortcut scheme and hold it. J/K from Vim and arrow keys can coexist; two conflicting schemes in one product cannot.',
      'Show the shortcut everywhere the action appears — in the menu, in the tooltip, in the palette. Repetition is how people learn them without reading anything.',
      'Persist density and pane sizes per user, per view. A setting that resets is worse than no setting, because the user has to keep re-making the decision.',
      'Right-click menus are a genuine desktop affordance, but never the only route. Every item in one belongs somewhere clickable too.',
      'Let the palette search content as well as commands. "Go to Postmortem draft" is what people actually want, more often than any verb.',
      'Preserve selection across a refresh. Coming back to a queue and finding the cursor at the top is a small betrayal that happens every day.',
    ],
    performance: [
      'Virtualise the master list past a few hundred rows, and keep the selected row rendered even when it scrolls out — otherwise the detail flickers as the list moves.',
      'Debounce the detail fetch on rapid arrow-keying. Someone holding ↓ should not fire forty requests on the way past.',
      'Prefetch the next and previous items in the queue. In a triage workflow the user goes one way, and it is nearly free to be ready.',
      'Drive the split drag with a CSS custom property and update it in a pointermove handler, not React state. Re-rendering both panes per frame is what makes a divider feel gluey.',
      'Build the palette index once and search it in memory. Anything that hits the network on every keystroke feels slower than the menu it replaced.',
    ],
    mistakes: [
      'Focus jumping into the detail on every selection change, so arrow-keying a queue is impossible.',
      'Hover-only row actions, invisible to keyboard and touch alike.',
      'Type shrunk in the name of density.',
      'A command palette holding actions that exist nowhere else.',
      'Overriding ⌘F, ⌘W or ⌘T and breaking a browser reflex.',
      'Single-key shortcuts firing while the user types in a search box.',
      'Pane sizes and density resetting on every reload.',
      'A 1px drag target with no larger hit area.',
    ],
    realWorld: [
      'Watch a heavy user for ten minutes. The patterns worth building are the ones they have invented a workaround for — a saved filter they re-apply, a tab they keep open.',
      'Keyboard support is not a power-user luxury; it is the same code path a screen-reader user depends on. Products with real shortcut support are usually the accessible ones by accident.',
      'The palette works because it needs one memorised fact instead of thirty. Any feature you can reduce to "one thing to remember, then search" is worth the same treatment.',
      'Density arguments are audience arguments. Ship both and log which one people pick — the answer is usually split down the middle, which is why picking one always upsets half the users.',
      'Master–detail is worth building even when a table with a modal would ship sooner. The queue-keeping-its-place property is the entire value, and a modal cannot have it.',
    ],
  },
})
