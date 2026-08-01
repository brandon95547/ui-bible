import * as React from 'react'
import {
  ArrowRight,
  Clock,
  CornerDownLeft,
  FileText,
  GitBranch,
  Rocket,
  Search,
  Settings,
  Sun,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Kbd } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

interface Cmd {
  id: string
  label: string
  section: string
  icon: React.ReactNode
  hint?: string
  shortcut?: string
  danger?: boolean
}

const COMMANDS: Cmd[] = [
  { id: 'r1', label: 'api-gateway', section: 'Recent', icon: <Clock size={14} />, hint: 'Project' },
  { id: 'r2', label: 'Postmortem — 4021', section: 'Recent', icon: <Clock size={14} />, hint: 'Document' },
  { id: 'a1', label: 'Deploy to production', section: 'Actions', icon: <Rocket size={14} />, shortcut: '⌘⇧D' },
  { id: 'a2', label: 'Create branch', section: 'Actions', icon: <GitBranch size={14} />, shortcut: '⌘B' },
  { id: 'a3', label: 'Invite teammate', section: 'Actions', icon: <UserPlus size={14} /> },
  { id: 'a4', label: 'Delete deployment', section: 'Actions', icon: <Trash2 size={14} />, danger: true },
  { id: 'n1', label: 'Settings', section: 'Go to', icon: <Settings size={14} />, shortcut: '⌘,' },
  { id: 'n2', label: 'Deployment log', section: 'Go to', icon: <FileText size={14} /> },
  { id: 'p1', label: 'Toggle theme', section: 'Preferences', icon: <Sun size={14} /> },
]

/** Subsequence match — "dtp" finds "Deploy to production". */
function fuzzy(q: string, text: string) {
  if (!q) return true
  const t = text.toLowerCase()
  let i = 0
  for (const ch of q.toLowerCase()) {
    i = t.indexOf(ch, i)
    if (i === -1) return false
    i++
  }
  return true
}

function Palette({
  showSections = true,
  showShortcuts = true,
  emptyQuery,
}: {
  showSections?: boolean
  showShortcuts?: boolean
  emptyQuery?: string
}) {
  const [query, setQuery] = React.useState(emptyQuery ?? '')
  const [active, setActive] = React.useState(0)
  const [ran, setRan] = React.useState<string | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const results = React.useMemo(() => COMMANDS.filter((c) => fuzzy(query, c.label)), [query])

  React.useEffect(() => setActive(0), [query])
  React.useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({
      block: 'nearest',
    })
  }, [active])

  let lastSection = ''

  return (
    <div className="w-full max-w-[30rem]">
      <div className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5">
        {/* The input owns the keyboard. Focus never leaves it, which is what
            lets the user keep typing while the selection moves. */}
        <div className="flex items-center gap-2.5 border-b border-[var(--ds-border-subtle)] px-3.5">
          <Search size={15} aria-hidden className="shrink-0 text-[var(--ds-fg-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded
            aria-controls="cp-list"
            aria-activedescendant={results[active] ? `cp-${results[active].id}` : undefined}
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setActive((i) => (i + 1) % Math.max(1, results.length))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setActive((i) => (i - 1 + results.length) % Math.max(1, results.length))
              } else if (e.key === 'Enter' && results[active]) {
                e.preventDefault()
                setRan(results[active].label)
              }
            }}
            className="h-11 w-full bg-transparent text-body text-[var(--ds-fg)] outline-none placeholder:text-[var(--ds-fg-muted)]"
          />
          <Kbd className="shrink-0">Esc</Kbd>
        </div>

        <div ref={listRef} id="cp-list" role="listbox" aria-label="Commands" className="max-h-64 overflow-y-auto p-1.5">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-body-sm text-[var(--ds-fg-muted)]">
              No commands match “{query}”.
            </p>
          )}
          {results.map((c, i) => {
            const header = showSections && c.section !== lastSection ? c.section : null
            lastSection = c.section
            const isActive = i === active
            return (
              <React.Fragment key={c.id}>
                {header && (
                  <p className="px-2 pb-1 pt-2.5 text-overline uppercase text-[var(--ds-fg-muted)] first:pt-1">
                    {header}
                  </p>
                )}
                <div
                  id={`cp-${c.id}`}
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                  onMouseMove={() => setActive(i)}
                  onClick={() => setRan(c.label)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5',
                    isActive
                      ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                      : 'text-[var(--ds-fg-secondary)]',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0',
                      c.danger
                        ? 'text-[var(--ds-danger-text)]'
                        : isActive
                          ? 'text-[var(--ds-accent-text)]'
                          : 'text-[var(--ds-fg-muted)]',
                    )}
                  >
                    {c.icon}
                  </span>
                  <span className={cn('flex-1 truncate text-label', c.danger && 'text-[var(--ds-danger-text)]')}>
                    {c.label}
                  </span>
                  {c.hint && (
                    <span className="shrink-0 text-caption text-[var(--ds-fg-muted)]">{c.hint}</span>
                  )}
                  {showShortcuts && c.shortcut && <Kbd>{c.shortcut}</Kbd>}
                  {isActive && !c.shortcut && (
                    <CornerDownLeft size={13} className="shrink-0 text-[var(--ds-fg-muted)]" />
                  )}
                </div>
              </React.Fragment>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3.5 py-2 text-caption text-[var(--ds-fg-muted)]">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> run
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Kbd>⌘K</Kbd> toggle
          </span>
        </div>
      </div>
      <p aria-live="polite" className="mt-2 text-center text-caption text-[var(--ds-fg-muted)]">
        {ran ? `Ran: ${ran}` : `${results.length} of ${COMMANDS.length} commands`}
      </p>
    </div>
  )
}

function Playground() {
  const [sections, setSections] = React.useState(true)
  const [shortcuts, setShortcuts] = React.useState(true)
  const [state, setState] = React.useState<'empty' | 'typing' | 'no-results'>('empty')

  return (
    <PreviewStage
      label="Playground"
      minHeight={380}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="State">
            <KnobSelect
              value={state}
              onChange={setState}
              options={['empty', 'typing', 'no-results'] as const}
            />
          </Knob>
          <KnobToggle checked={sections} onChange={setSections} label="Sections" />
          <KnobToggle checked={shortcuts} onChange={setShortcuts} label="Shortcuts" />
        </div>
      }
      code={`<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  groups={[
    { id: 'recent',  label: 'Recent',  items: recents },
    { id: 'actions', label: 'Actions', items: actions },
    { id: 'goto',    label: 'Go to',   items: destinations },
  ]}
/>`}
    >
      <Palette
        key={state}
        showSections={sections}
        showShortcuts={shortcuts}
        emptyQuery={state === 'typing' ? 'dep' : state === 'no-results' ? 'zzz' : ''}
      />
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'command-palette',
    title: 'Command Palette',
    tagline:
      'Keyboard-first search across every action and destination in the product. For the people who use it, it stops being a feature and becomes the interface.',
    keywords: ['cmd k', 'quick open', 'spotlight', 'omnibox', 'fuzzy search', 'launcher', 'shortcut'],
  },

  overview: {
    purpose:
      'A command palette collapses the whole product into one input. Instead of remembering where a setting lives, the user types what they want and presses Enter. It is the only control in a system that scales without cost: adding the two-hundredth command makes the palette more useful, whereas adding the twentieth item to a menu makes that menu worse.',
    whenToUse: [
      'The product has more actions and destinations than any menu structure can expose comfortably.',
      'Users are repeat visitors who will build muscle memory — internal tools, editors, dashboards, developer products.',
      'Navigation is deep and a user in one corner regularly needs something from another.',
      'You want to expose keyboard shortcuts without a cheatsheet nobody reads.',
    ],
    whenNotToUse: [
      {
        text: 'The product has a dozen screens and users visit occasionally.',
        instead: 'plain navigation — a palette nobody opens is dead weight',
        to: '#/sidebar',
      },
      {
        text: 'The user is searching content rather than running commands.',
        instead: 'a Search Input with results in the page',
        to: '#/search-input',
      },
      {
        text: 'It would be the only way to reach a feature.',
        instead: 'a real menu item as well — a palette is an accelerator, never the only path',
        to: '#/menu',
      },
      {
        text: 'The action needs parameters or confirmation.',
        instead: 'run the palette entry, then open a Dialog to collect them',
        to: '#/dialog',
      },
    ],
    reasoning: (
      <>
        <p>
          A palette is a <strong>recognition device</strong> that pretends to be a recall device.
          The user does not need to remember the exact command name — they type three letters and
          recognise the right row. That is why fuzzy subsequence matching matters:{' '}
          <code>dtp</code> should find "Deploy to production", because that is how people type when
          they are moving fast.
        </p>
        <p>
          The empty state is the most important screen in the component and the one most often
          wasted. Opening onto a blank list teaches nothing. Opening onto recents, then the
          three or four most common actions, teaches the user what the palette is for and gives
          them something to press before they have typed anything.
        </p>
        <p>
          <strong>Focus never leaves the input.</strong> The list is navigated with{' '}
          <code>aria-activedescendant</code>, not by moving DOM focus, so the user can keep typing
          to refine while the highlight moves. Moving real focus into the list is the single most
          common implementation mistake and it breaks the whole interaction model.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'empty-state',
        title: 'The empty state does the teaching',
        description:
          'Before a keystroke, the palette should already be useful: what you touched recently, then what people do most. A blank list is a wasted first impression.',
        render: (
          <PreviewStage minHeight={320}>
            <Palette />
          </PreviewStage>
        ),
      },
      {
        id: 'fuzzy',
        title: 'Fuzzy matching',
        description:
          'Typing "dep" narrows to everything containing that subsequence. Matching must survive skipped letters — people type the shape of a word, not its spelling.',
        render: (
          <PreviewStage minHeight={320}>
            <Palette emptyQuery="dep" />
          </PreviewStage>
        ),
      },
      {
        id: 'shortcuts',
        title: 'Shortcuts teach themselves',
        description:
          'Showing the shortcut on the row a user just ran is how they learn they never needed the palette. That is the palette working correctly, not losing.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              {COMMANDS.filter((c) => c.shortcut).map((c) => (
                <Row key={c.id} gap="sm" align="center" className="w-full">
                  <span className="text-[var(--ds-fg-muted)]">{c.icon}</span>
                  <span className="flex-1 text-label text-[var(--ds-fg-secondary)]">{c.label}</span>
                  <Kbd>{c.shortcut}</Kbd>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'no-results',
        title: 'No results',
        description:
          'Name the query back and stop. Do not offer "did you mean" guesses — in a command palette a wrong guess one Enter away from running is worse than an honest dead end.',
        render: (
          <PreviewStage minHeight={320}>
            <Palette emptyQuery="zzz" />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Trigger', render: <Button variant="outlined" size="sm" startIcon={<Search size={14} />} endIcon={<Kbd>⌘K</Kbd>}>Search</Button> },
      {
        label: 'Row idle',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--ds-fg-secondary)]">
            <Rocket size={14} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1 text-label">Deploy</span>
          </span>
        ),
      },
      {
        label: 'Row active',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-2 py-1.5 text-[var(--ds-fg)]">
            <Rocket size={14} className="text-[var(--ds-accent-text)]" />
            <span className="flex-1 text-label">Deploy</span>
            <CornerDownLeft size={13} className="text-[var(--ds-fg-muted)]" />
          </span>
        ),
      },
      {
        label: 'Row danger',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5">
            <Trash2 size={14} className="text-[var(--ds-danger-text)]" />
            <span className="flex-1 text-label text-[var(--ds-danger-text)]">Delete</span>
          </span>
        ),
      },
      {
        label: 'With shortcut',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--ds-fg-secondary)]">
            <Settings size={14} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1 text-label">Settings</span>
            <Kbd>⌘,</Kbd>
          </span>
        ),
      },
      { label: 'Section header', render: <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Actions</span> },
      {
        label: 'Empty',
        render: <span className="text-body-sm text-[var(--ds-fg-muted)]">No commands match “zzz”.</span>,
      },
      {
        label: 'Result hint',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[var(--ds-fg-secondary)]">
            <Clock size={14} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1 text-label">api-gateway</span>
            <span className="text-caption text-[var(--ds-fg-muted)]">Project</span>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: <Palette />,
    caption:
      'One input, a grouped list, and a footer that teaches the keyboard model. Focus stays in the input for the entire interaction.',
    parts: [
      {
        n: 1,
        label: 'Panel width',
        value: '36rem, capped to viewport',
        kind: 'size',
        note: 'Wide enough for a command plus a hint plus a shortcut without truncation, narrow enough that the list is scanned in one vertical column rather than swept across.',
      },
      {
        n: 2,
        label: 'Vertical position',
        value: '12vh from the top',
        kind: 'space',
        note: 'Not centred. The list grows downward, and a vertically centred panel jumps as results change — the single most disorienting thing a palette can do.',
      },
      {
        n: 3,
        label: 'Input height',
        value: '48px, body-lg',
        kind: 'size',
        note: 'Larger than a form field. It is the only input on screen and it is the thing the user is looking at when the panel appears.',
      },
      {
        n: 4,
        label: 'List height',
        value: 'max 24rem, ~8 rows',
        kind: 'size',
        note: 'Fixed so the panel never changes height as results narrow. A panel that resizes on every keystroke makes the row under the pointer move.',
      },
      {
        n: 5,
        label: 'Row height',
        value: '32px, 10px padding',
        kind: 'size',
        note: 'Dense, because this list is scanned rather than acted on individually, and because eight visible rows is worth more than six comfortable ones.',
      },
      {
        n: 6,
        label: 'Active row',
        value: 'Accent tint, no border',
        kind: 'color',
        note: 'Only one row is ever active, and it moves with the arrow keys. A hover highlight must set the same active row, never draw a second one.',
      },
      {
        n: 7,
        label: 'Footer',
        value: '32px, caption',
        kind: 'type',
        note: 'The keyboard legend. It looks like decoration and it is the reason people learn the arrow-and-Enter model in the first session.',
      },
      {
        n: 8,
        label: 'Backdrop',
        value: 'Scrim + 2px blur',
        kind: 'color',
        note: 'The page is paused, not gone. The blur is what keeps the palette feeling layered over the work rather than replacing it.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel surface' },
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'Backdrop behind the panel' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Active row fill' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Active row icon' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Idle row labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Section headers, hints, icons' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'A destructive command' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Footer legend strip' },
    { category: 'spacing', token: 'panel top', value: '12vh', usedFor: 'Distance from the viewport top' },
    { category: 'radius', token: '--radius-2xl', value: '20px', usedFor: 'Panel corners' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Panel elevation' },
    { category: 'motion', token: '--duration-normal', value: '180ms', usedFor: 'Scale-in entrance' },
  ],

  sizes: [
    { name: 'Panel', maxWidth: '36rem', radius: '20px', use: 'Capped to the viewport with 16px of margin on small screens.' },
    { name: 'Input', height: '48px', padding: '0 14px', type: '15px', use: 'The only input on screen; sized to be looked at, not filled in carefully.' },
    { name: 'List', height: 'max 24rem', use: 'About eight rows. Fixed height so the panel never resizes as results narrow.' },
    { name: 'Row', height: '32px', padding: '0 8px', gap: '10px', type: '13px', touch: '44px on coarse pointers', use: 'Dense. Two-line rows go to 44px and cut the visible count to five.' },
    { name: 'Section header', height: '24px', type: '11px uppercase', use: 'Quiet. It is a divider with a name, not a destination.' },
    { name: 'Footer', height: '32px', type: '12px', use: 'The keyboard legend. Drop it on touch, where there is no keyboard to legend.' },
  ],

  do: [
    {
      title: 'Keep focus in the input the whole time',
      why: 'The user must be able to keep typing while the highlight moves. Move DOM focus into the list and every keystroke after the first arrow press goes to the wrong element.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;input role="combobox"
          <br />
          &nbsp;&nbsp;aria-activedescendant="cp-a1" /&gt;
        </code>
      ),
    },
    {
      title: 'Open onto recents, not a blank list',
      why: 'The empty state is where users learn what the palette can do. Recents plus the top few actions gives them something to press before they know what to type.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Recent</span>
          <span className="text-label-sm text-[var(--ds-fg-secondary)]">api-gateway</span>
          <span className="text-label-sm text-[var(--ds-fg-secondary)]">Postmortem — 4021</span>
        </Stack>
      ),
    },
    {
      title: 'Match on a subsequence, not a prefix',
      why: '"dtp" should find "Deploy to production". Prefix matching forces the user to remember how the command starts, which is the recall problem the palette exists to remove.',
      render: (
        <Row gap="sm" align="center">
          <code className="font-mono text-[11px] text-[var(--ds-accent-text)]">dtp</code>
          <ArrowRight size={12} className="text-[var(--ds-fg-muted)]" />
          <span className="text-label-sm text-[var(--ds-fg-secondary)]">
            <b className="text-[var(--ds-fg)]">D</b>eploy <b className="text-[var(--ds-fg)]">t</b>o{' '}
            <b className="text-[var(--ds-fg)]">p</b>roduction
          </span>
        </Row>
      ),
    },
    {
      title: 'Show the shortcut next to the command',
      why: 'The palette should teach itself out of a job for frequent actions. A user who learns ⌘⇧D from the row they just ran is a user you made faster.',
      render: (
        <Row gap="sm" align="center">
          <Rocket size={14} className="text-[var(--ds-fg-muted)]" />
          <span className="flex-1 text-label-sm text-[var(--ds-fg-secondary)]">Deploy to production</span>
          <Kbd>⌘⇧D</Kbd>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not run destructive commands on Enter',
      why: 'The palette is used at speed, with the highlight often one row from where the user thinks it is. Anything irreversible must open a confirmation instead of executing.',
      render: (
        <span className="flex w-56 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--ds-danger-subtle)] px-2 py-1.5">
          <Trash2 size={14} className="text-[var(--ds-danger-text)]" />
          <span className="flex-1 text-label text-[var(--ds-danger-text)]">Delete deployment</span>
          <CornerDownLeft size={13} className="text-[var(--ds-danger-text)]" />
        </span>
      ),
    },
    {
      title: 'Do not let the panel resize as results narrow',
      why: 'A panel that shrinks from eight rows to two moves everything under the pointer mid-click. Fix the list height and scroll inside it.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <div className="h-16 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
          <div className="h-6 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
        </Stack>
      ),
    },
    {
      title: 'Do not make the palette the only path',
      why: 'It is an accelerator. A feature reachable only by typing its name is a feature nobody who did not already know about it will ever find.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          “Just press ⌘K and type export” — in a product with no Export button anywhere
        </span>
      ),
    },
    {
      title: 'Do not guess for the user on no results',
      why: '"Did you mean Delete project?" one Enter away from running is a trap. State the failure plainly and let them retype.',
      render: (
        <Stack gap="xs" className="items-center">
          <span className="text-body-sm text-[var(--ds-fg-muted)]">No commands match “delet”.</span>
          <span className="text-caption text-[var(--ds-danger-text)]">
            ✗ Did you mean “Delete project”? ↵
          </span>
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The active row must be distinguishable from idle rows by more than a faint tint — at small row heights a 6% wash is invisible on a laptop screen in daylight.',
      'Section headers may be quiet but are still content and owe 4.5:1.',
      'A destructive row must not rely on red alone. The icon carries the second signal.',
      'The keyboard legend in the footer is content — it is the documentation for the component — and owes full text contrast.',
    ],
    keyboard: [
      { keys: '⌘K / ⌃K', does: 'Opens and closes. Also bind "/" when no input is focused, which is the other convention users arrive with.' },
      { keys: '↑ / ↓', does: 'Moves the active row, wrapping at both ends. Focus does not move.' },
      { keys: 'Enter', does: 'Runs the active command. Destructive commands open a confirmation instead.' },
      { keys: 'Esc', does: 'Closes and returns focus to wherever it was before opening.' },
      { keys: 'Tab', does: 'Nothing inside the palette. There is one focusable element, so there is nowhere to tab to.' },
      { keys: 'Home / End', does: 'Jumps to the first or last result.' },
    ],
    aria: [
      { attr: 'role="combobox"', on: 'The input', note: 'With aria-expanded and aria-controls pointing at the list. This is the pattern; a plain input with a div of results announces nothing.' },
      { attr: 'aria-activedescendant', on: 'The input', note: 'The id of the active row. This is what moves the screen-reader cursor without moving DOM focus.' },
      { attr: 'role="listbox" / "option"', on: 'The list and its rows', note: 'With aria-selected on the active row. Section headers must be outside the option elements or they are announced as results.' },
      { attr: 'role="dialog" aria-modal="true"', on: 'The panel', note: 'It traps interaction with the page behind it, so it owes the modal contract — including inert content behind.' },
      { attr: 'aria-live="polite"', on: 'A result count', note: '"9 of 24 commands" after typing stops. Without it a screen-reader user has no idea whether their query matched anything.' },
    ],
    focus:
      'Focus enters the input on open and never leaves it. On close it returns to the element that was focused before — not to the body, and not to the trigger if the palette was opened by shortcut from somewhere else. Running a command that navigates should move focus to the new view’s heading.',
    screenReader: [
      'Announce the result count after typing settles, debounced by about 300ms. Announcing on every keystroke is unusable.',
      'Each row should announce its section: "Actions, Deploy to production, has shortcut Command Shift D".',
      'The palette is modal, so content behind it must be inert. A screen-reader user who can arrow into the page underneath has no way to tell the palette is still open.',
    ],
    touch:
      'A command palette is a keyboard accelerator, and on touch it is mostly ceremony. If you ship it there, drop the keyboard legend, grow rows to 44px, and accept that the on-screen keyboard will cover half the results — which is the real reason the pattern does not belong on a phone.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { CommandPalette } from '@/ui/CommandPalette'

// One global shortcut, bound once, high in the tree.
React.useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setOpen((o) => !o)
    }
    // "/" is the other convention users arrive with — but only when they are
    // not already typing somewhere.
    if (e.key === '/' && !isTypingTarget(e.target)) {
      e.preventDefault()
      setOpen(true)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])

// Subsequence matching: "dtp" must find "Deploy to production".
function fuzzy(query: string, text: string) {
  const t = text.toLowerCase()
  let i = 0
  for (const ch of query.toLowerCase()) {
    i = t.indexOf(ch, i)
    if (i === -1) return false
    i++
  }
  return true
}

<CommandPalette
  open={open}
  onClose={() => setOpen(false)}
  groups={[
    { id: 'recent',  label: 'Recent',  items: recents },
    { id: 'actions', label: 'Actions', items: actions },
    { id: 'goto',    label: 'Go to',   items: destinations },
  ]}
  onRun={(cmd) => {
    // Never execute something irreversible straight off Enter.
    if (cmd.destructive) return confirmThen(cmd.run)
    cmd.run()
  }}
/>`,
    },
    html: {
      lang: 'html',
      code: `<div role="dialog" aria-modal="true" aria-label="Command palette">
  <!-- One focusable element. The list is driven by aria-activedescendant. -->
  <input
    role="combobox"
    aria-expanded="true"
    aria-controls="cp-list"
    aria-activedescendant="cp-deploy"
    aria-label="Search commands"
    autocomplete="off"
  />

  <div id="cp-list" role="listbox" aria-label="Commands">
    <!-- Headers sit OUTSIDE the options, or they are announced as results. -->
    <p id="cp-h-actions" class="cp-header">Actions</p>

    <div id="cp-deploy" role="option" aria-selected="true">
      <svg aria-hidden="true">…</svg>
      Deploy to production
      <kbd>⌘⇧D</kbd>
    </div>
  </div>

  <p class="sr-only" role="status" aria-live="polite">9 of 24 commands</p>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-palette {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-block-start: 12vh;        /* NOT centred: the list grows downward */
  z-index: 96;
}

.ds-palette__panel {
  inline-size: min(36rem, 100% - 2rem);
  border-radius: var(--radius-2xl);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e5);
  animation: scale-in 180ms cubic-bezier(0.32, 0.72, 0, 1) both;
}

.ds-palette__input { block-size: 48px; font-size: 15px; }

/* Fixed height. A panel that shrinks as results narrow moves the row the
   pointer is aiming at. */
.ds-palette__list {
  max-block-size: 24rem;
  overflow-y: auto;
  padding: 6px;
}

.ds-palette__option[aria-selected='true'] {
  background: var(--ds-accent-subtle);
  color: var(--ds-fg);
}

@media (prefers-reduced-motion: reduce) {
  .ds-palette__panel { animation: none; }
}

/* On touch the legend is describing a keyboard that is not there. */
@media (pointer: coarse) {
  .ds-palette__footer { display: none; }
  .ds-palette__option { min-block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'CommandPalette',
        props: [
          { name: 'open', type: 'boolean', required: true, description: 'Controlled. The shortcut lives in the app shell, not inside the component.' },
          { name: 'onClose', type: '() => void', required: true, description: 'Called on Esc, on backdrop click, and after a command runs.' },
          { name: 'groups', type: 'CommandGroup[]', required: true, description: 'Ordered sections. Recents first, then actions, then destinations.' },
          { name: 'onRun', type: '(cmd: Command) => void', required: true, description: 'Runs the active command. Gate destructive commands behind a confirmation here.' },
          { name: 'placeholder', type: 'string', default: "'Search commands…'", description: 'Should hint at scope: "Search commands, projects and settings…".' },
          { name: 'emptyRender', type: 'ReactNode', description: 'Shown when the query matches nothing. State the query; do not guess.' },
        ],
      },
      {
        name: 'Command',
        props: [
          { name: 'id', type: 'string', required: true, description: 'Stable. Used for the aria-activedescendant target and for recents.' },
          { name: 'label', type: 'string', required: true, description: 'What the user types towards. Lead with the verb: "Deploy to production".' },
          { name: 'keywords', type: 'string[]', description: 'Synonyms the label does not contain — "remove" for a delete command.' },
          { name: 'shortcut', type: 'string', description: 'Displayed on the row. Showing it is how the palette teaches itself out of a job.' },
          { name: 'destructive', type: 'boolean', default: 'false', description: 'Styles the row and forces a confirmation instead of running on Enter.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Lead every command with its verb. Users type the action, and "Deploy to production" sorts and matches far better than "Production deployment".',
      'Give commands hidden keyword synonyms. Half your users will type "remove" for the command you called "Delete".',
      'Weight recents heavily in the ranking. What someone did five minutes ago is the best available predictor of what they want now.',
      'Scope the palette when it is opened from inside a context — a palette opened in a document should offer that document’s commands first.',
      'Advertise the shortcut in the header search box. A palette nobody knows about has no users, and the ⌘K chip in a fake search field is how everyone learns.',
    ],
    performance: [
      'Debounce the announced result count, not the filtering. Filtering must feel instant; announcing on every keystroke is what makes it unusable with a screen reader.',
      'Pre-index commands once at registration rather than lowercasing every label on every keystroke. With 300 commands that difference is visible.',
      'Virtualise past roughly 100 visible rows — though a palette that regularly shows 100 rows needs better ranking, not a virtualiser.',
      'Mount the panel only when open. A permanently mounted palette holding a focus trap and a keydown listener is a subtle source of interference across the app.',
    ],
    mistakes: [
      'Moving DOM focus into the list, so typing after the first arrow key goes nowhere.',
      'Prefix-only matching, which forces the user to recall how the command starts.',
      'A blank empty state that teaches nothing about what the palette can do.',
      'A panel that resizes as results narrow, moving the row under the pointer.',
      'Running destructive commands directly on Enter.',
      'Section headers marked up as options, so the screen reader announces "Actions" as a runnable result.',
      'Vertically centring the panel, so it jumps every time the result count changes.',
    ],
    realWorld: [
      'Adoption follows discoverability, not capability. Products that put a fake search box with a ⌘K chip in the header get several times the usage of ones that only bind the shortcut.',
      'Instrument which commands are run from the palette. Anything in the top ten deserves a real shortcut and probably a real button too.',
      'Editors set the expectation — VS Code, Linear, Raycast. Users arrive knowing ⌘K, arrow keys and Enter, and every deviation from that model costs more than whatever it bought.',
      'A palette works best when it can navigate as well as act. "Go to api-gateway" and "Deploy api-gateway" in the same list is what makes it feel like the whole product is one input.',
    ],
  },
})
