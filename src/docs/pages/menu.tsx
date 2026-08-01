import * as React from 'react'
import {
  Archive,
  Check,
  ChevronRight,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Kbd } from '@/ui/Display'
import { MenuList, Popover } from '@/ui/Overlay'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const ROW_ITEMS = [
  { label: 'Rename', icon: <Pencil size={14} />, shortcut: '⌘E', onSelect: () => {} },
  { label: 'Duplicate', icon: <Copy size={14} />, shortcut: '⌘D', onSelect: () => {} },
  { label: 'Share…', icon: <Share2 size={14} />, onSelect: () => {} },
  'separator' as const,
  { label: 'Download', icon: <Download size={14} />, onSelect: () => {} },
  { label: 'Archive', icon: <Archive size={14} />, onSelect: () => {} },
  'separator' as const,
  { label: 'Delete', icon: <Trash2 size={14} />, danger: true, onSelect: () => {} },
]

function Playground() {
  const [icons, setIcons] = React.useState(true)
  const [shortcuts, setShortcuts] = React.useState(true)
  const [align, setAlign] = React.useState<'start' | 'end'>('start')
  const [chosen, setChosen] = React.useState('—')

  const items = ROW_ITEMS.map((i) =>
    i === 'separator'
      ? i
      : {
          ...i,
          icon: icons ? i.icon : undefined,
          shortcut: shortcuts ? i.shortcut : undefined,
          onSelect: () => setChosen(i.label),
        },
  )

  return (
    <PreviewStage
      label="Playground"
      minHeight={260}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Align">
            <KnobSelect value={align} onChange={setAlign} options={['start', 'end'] as const} />
          </Knob>
          <KnobToggle checked={icons} onChange={setIcons} label="Icons" />
          <KnobToggle checked={shortcuts} onChange={setShortcuts} label="Shortcuts" />
        </div>
      }
      code={`<Popover
  align="${align}"
  trigger={({ toggle, open }) => (
    <IconButton
      label="More actions for api-gateway"
      icon={<MoreHorizontal />}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
    />
  )}
>
  <MenuList label="Actions" items={items} />
</Popover>`}
    >
      <Stack gap="sm" className="items-center">
        <Popover
          align={align}
          trigger={({ toggle, open }) => (
            <IconButton
              label="More actions for api-gateway"
              icon={<MoreHorizontal />}
              variant="outlined"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={toggle}
            />
          )}
        >
          <MenuList label="Actions for api-gateway" items={items} />
        </Popover>
        <span aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
          Chosen: {chosen}
        </span>
      </Stack>
    </PreviewStage>
  )
}

function CheckableDemo() {
  const [cols, setCols] = React.useState(['status', 'region'])
  const toggle = (c: string) =>
    setCols((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  const COLUMNS = [
    ['status', 'Status'],
    ['region', 'Region'],
    ['duration', 'Duration'],
    ['author', 'Author'],
  ]

  return (
    <PreviewStage minHeight={230}>
      <Popover
        trigger={({ toggle: t, open }) => (
          <Button variant="outlined" size="sm" aria-haspopup="menu" aria-expanded={open} onClick={t}>
            Columns ({cols.length})
          </Button>
        )}
      >
        <div role="menu" aria-label="Visible columns" className="min-w-[12rem] p-1">
          {COLUMNS.map(([id, label]) => {
            const on = cols.includes(id)
            return (
              <button
                key={id}
                type="button"
                role="menuitemcheckbox"
                aria-checked={on}
                // The menu stays open: toggling four columns should not cost
                // four round trips through the trigger.
                onClick={() => toggle(id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-label',
                  'transition-colors hover:bg-[var(--ds-layer-hover)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                  on ? 'text-[var(--ds-fg)]' : 'text-[var(--ds-fg-secondary)]',
                )}
              >
                <span className="w-3.5 shrink-0 text-[var(--ds-accent-text)]">
                  {on && <Check size={14} />}
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </Popover>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'menu',
    title: 'Menu',
    tagline:
      'A transient list of commands raised by a trigger. Everything the industry calls a "dropdown" that runs an action rather than setting a value is this component.',
    keywords: ['dropdown menu', 'overflow', 'kebab', 'context menu', 'menuitem', 'submenu', 'more'],
  },

  overview: {
    purpose:
      'A menu holds commands that would otherwise crowd the interface: the row actions on a table, the overflow past a toolbar’s useful width, the right-click options on a canvas. It appears on demand, dismisses without consequence, and every item in it does something. That last part is the whole distinction — a menu runs actions, a select sets a value, and confusing the two is why "dropdown" means four different components across the industry.',
    whenToUse: [
      'Row-level actions in a table or list, behind a "⋯" trigger.',
      'Overflow from a toolbar, holding the controls that did not fit in a published order.',
      'Three or more actions on one object that do not deserve permanent space.',
      'Right-click context actions on a canvas, tree or editor.',
    ],
    whenNotToUse: [
      {
        text: 'The list sets a value rather than running an action.',
        instead: 'a Select',
        to: '#/select',
      },
      {
        text: 'One action dominates and the rest are variants of it.',
        instead: 'a Split Button',
        to: '#/split-button',
      },
      {
        text: 'The panel holds arbitrary interactive content — inputs, sliders, links.',
        instead: 'a Popover, which has no menu keyboard contract to break',
        to: '#/popover',
      },
      {
        text: 'The items are destinations across a wide site.',
        instead: 'a Mega Menu',
        to: '#/mega-menu',
      },
    ],
    reasoning: (
      <>
        <p>
          <code>role="menu"</code> is a <strong>contract, not a label</strong>. It promises that
          arrow keys move between items, that Tab leaves the menu entirely, that typing a letter
          jumps to a matching item, and that everything inside is a command. Put a text input or a
          link inside and you have broken all four — which is why a panel with mixed content is a
          Popover instead.
        </p>
        <p>
          The trigger is half the component. It needs{' '}
          <code>aria-haspopup="menu"</code>, a live <code>aria-expanded</code>, and an accessible
          name that says <em>what</em> the menu acts on. A table with forty rows of "More options"
          buttons is forty identical announcements; "More actions for api-gateway" is navigable.
        </p>
        <p>
          Destructive items go last, past a separator, and carry the danger tone. That position is
          not politeness — it means the pointer never crosses Delete on the way to something safe,
          and the separator gives the eye a stop before the most consequential row on the panel.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'row-actions',
        title: 'Row actions',
        description:
          'The commonest menu in any product. Each trigger names its row, so forty menus are forty distinct controls rather than forty buttons called "More".',
        render: (
          <PreviewStage minHeight={220} center={false}>
            <Stack gap="xs" className="w-full">
              {['api-gateway', 'billing-worker', 'web-frontend'].map((name) => (
                <Row
                  key={name}
                  gap="sm"
                  align="center"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2"
                >
                  <span className="flex-1 text-label text-[var(--ds-fg)]">{name}</span>
                  <Popover
                    align="end"
                    trigger={({ toggle, open }) => (
                      <IconButton
                        size="sm"
                        label={`More actions for ${name}`}
                        icon={<MoreHorizontal />}
                        aria-haspopup="menu"
                        aria-expanded={open}
                        onClick={toggle}
                      />
                    )}
                  >
                    <MenuList label={`Actions for ${name}`} items={ROW_ITEMS} />
                  </Popover>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'checkable',
        title: 'Checkable items',
        description:
          'A column picker uses menuitemcheckbox and stays open while the user toggles. Closing after each choice would cost four round trips to configure four columns.',
        render: <CheckableDemo />,
      },
      {
        id: 'grouping',
        title: 'Separators do the grouping',
        description:
          'Edit actions, then export actions, then the destructive one at the end. Eight ungrouped rows is a list to read; three groups is a decision to make.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="Grouped" tone="good">
                <MenuList label="Grouped" items={ROW_ITEMS} />
              </Cell>
              <Cell label="Flat" tone="bad">
                <MenuList
                  label="Flat"
                  items={ROW_ITEMS.filter((i) => i !== 'separator').map((i) => ({
                    ...(i as { label: string }),
                  }))}
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'shortcuts',
        title: 'Shortcuts belong on the row',
        description:
          'The menu is where users discover the keyboard. Right-aligned, muted, and never the only place the shortcut is documented.',
        render: (
          <PreviewStage minHeight={200}>
            <MenuList
              label="With shortcuts"
              items={[
                { label: 'Rename', icon: <Pencil size={14} />, shortcut: '⌘E', onSelect: () => {} },
                { label: 'Duplicate', icon: <Copy size={14} />, shortcut: '⌘D', onSelect: () => {} },
                { label: 'Download', icon: <Download size={14} />, shortcut: '⌘⇧S', onSelect: () => {} },
                'separator',
                { label: 'Delete', icon: <Trash2 size={14} />, shortcut: '⌫', danger: true, onSelect: () => {} },
              ]}
            />
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Trigger idle',
        render: <IconButton size="sm" variant="outlined" label="More actions" icon={<MoreHorizontal />} />,
      },
      {
        label: 'Trigger open',
        render: (
          <IconButton
            size="sm"
            variant="tonal"
            label="More actions"
            icon={<MoreHorizontal />}
            aria-expanded
          />
        ),
      },
      {
        label: 'Item idle',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <Pencil size={14} className="text-[var(--ds-fg-muted)]" /> Rename
          </span>
        ),
      },
      {
        label: 'Item active',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-2 py-1.5 text-label text-[var(--ds-fg)]">
            <Pencil size={14} /> Rename
          </span>
        ),
      },
      {
        label: 'Item danger',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-danger-text)]">
            <Trash2 size={14} /> Delete
          </span>
        ),
      },
      {
        label: 'Item disabled',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-disabled)]">
            <Archive size={14} /> Archive
          </span>
        ),
      },
      {
        label: 'Checked',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg)]">
            <Check size={14} className="text-[var(--ds-accent-text)]" /> Status
          </span>
        ),
      },
      {
        label: 'With shortcut',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <span className="flex-1">Rename</span>
            <Kbd>⌘E</Kbd>
          </span>
        ),
      },
      {
        label: 'Submenu',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <span className="flex-1">Move to</span>
            <ChevronRight size={13} className="text-[var(--ds-fg-muted)]" />
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: <MenuList label="Anatomy" items={ROW_ITEMS} />,
    caption:
      'Three groups separated by hairlines, with the destructive action last. Icons align in a fixed gutter so the labels form one column.',
    parts: [
      {
        n: 1,
        label: 'Panel width',
        value: 'min 11rem, max 18rem',
        kind: 'size',
        note: 'Sized to the longest label. Capped so a stray long item wraps rather than stretching the panel across the viewport.',
      },
      {
        n: 2,
        label: 'Row height',
        value: '30px (44px on touch)',
        kind: 'size',
        note: 'Dense, because the panel is transient and scanned as a list. Two-line rows with descriptions go to 44px everywhere.',
      },
      {
        n: 3,
        label: 'Icon gutter',
        value: '14px icon, fixed column',
        kind: 'space',
        note: 'The gutter is reserved even for items with no icon, so labels stay on one left edge. A ragged label column is the fastest way to make a menu feel unfinished.',
      },
      {
        n: 4,
        label: 'Separator',
        value: '1px, 4px margins',
        kind: 'shape',
        note: 'role="separator". It is the grouping, and it is what puts a stop in front of the destructive row.',
      },
      {
        n: 5,
        label: 'Shortcut',
        value: 'Right-aligned, muted',
        kind: 'type',
        note: 'Never the only documentation of the shortcut, but the place most people learn it.',
      },
      {
        n: 6,
        label: 'Offset',
        value: '6px from the trigger',
        kind: 'space',
        note: 'Close enough to read as attached; far enough that the trigger’s focus ring is not clipped by the panel.',
      },
      {
        n: 7,
        label: 'Elevation',
        value: '--shadow-e4',
        kind: 'color',
        note: 'Above the page, below a dialog. A menu is transient, and a dialog opened from one must clearly sit above it.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel surface' },
    { category: 'color', token: '--ds-border', usedFor: 'Panel edge' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Separators' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Item labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Icons and shortcuts' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Active row fill' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Destructive item label and icon' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Check mark on a checkable item' },
    { category: 'spacing', token: '--space-1', value: '4px', usedFor: 'Panel padding and separator margins' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Panel corners' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Row corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Entrance and chevron rotation' },
  ],

  sizes: [
    { name: 'Panel', minWidth: '11rem', maxWidth: '18rem', radius: '12px', padding: '4px', use: 'Sized to the longest label, capped so nothing stretches the layout.' },
    { name: 'Row', height: '30px', padding: '0 8px', gap: '10px', type: '13px', touch: '44px on coarse pointers', use: 'The default.' },
    { name: 'Row with description', height: '44px', padding: '6px 8px', use: 'Two lines. Use sparingly — a menu of descriptions is a list, not a menu.' },
    { name: 'Icon', icon: '14px', use: 'One step below body. Reserved as a gutter even on items without one.' },
    { name: 'Separator', height: '1px', gap: '4px', use: 'Full panel width, inside the padding.' },
    { name: 'Submenu', minWidth: '10rem', use: 'Opens on the trigger’s inline edge, flipping when it would leave the viewport.' },
  ],

  do: [
    {
      title: 'Name the trigger after what it acts on',
      why: '"More actions for api-gateway" is navigable in a forty-row table. Forty buttons called "More options" are forty identical announcements with no way to tell them apart.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          aria-label="More actions for api-gateway"
        </code>
      ),
    },
    {
      title: 'Put the destructive item last, past a separator',
      why: 'The pointer never crosses Delete on the way to something safe, and the separator gives the eye a stop before the most consequential row.',
      render: (
        <MenuList
          label="Do danger last"
          items={[
            { label: 'Rename', onSelect: () => {} },
            { label: 'Duplicate', onSelect: () => {} },
            'separator',
            { label: 'Delete', danger: true, onSelect: () => {} },
          ]}
        />
      ),
    },
    {
      title: 'Keep the menu open for checkable items',
      why: 'Configuring four columns should cost four clicks, not four clicks plus four reopenings. Closing on select is right for commands and wrong for toggles.',
      render: (
        <Stack gap="xs" className="w-40">
          {['Status', 'Region', 'Duration'].map((c, i) => (
            <span
              key={c}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1 text-label text-[var(--ds-fg-secondary)]"
            >
              <span className="w-3.5 text-[var(--ds-accent-text)]">{i < 2 && <Check size={13} />}</span>
              {c}
            </span>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Return focus to the trigger on close',
      why: 'A keyboard user who presses Esc must land back on the button they opened. Dropping focus to the body sends them to the top of the page.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onClose → triggerRef.current?.focus()
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put inputs or links in a role="menu"',
      why: 'The role promises arrow-key navigation and command items. A text field inside it swallows the arrow keys and a link changes what Enter means. That panel is a Popover.',
      render: (
        <div className="w-44 rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-overlay)] p-1.5">
          <input
            readOnly
            value="Filter…"
            className="mb-1 h-7 w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2 text-body-sm"
          />
          <span className="block px-2 py-1 text-label text-[var(--ds-fg-secondary)]">Rename</span>
        </div>
      ),
    },
    {
      title: 'Do not nest more than one level',
      why: 'A second-level submenu is a diagonal pointer path across two panels. It fails on touch entirely and it fails on a trackpad often enough to be a running joke.',
      render: (
        <Row gap="sm" align="start">
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-2 py-1 text-caption text-[var(--ds-fg-muted)]">
            Move to ›
          </span>
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-2 py-1 text-caption text-[var(--ds-fg-muted)]">
            Team ›
          </span>
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-2 py-1 text-caption text-[var(--ds-fg-muted)]">
            Project ›
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not hide the only path to an action',
      why: 'A menu is an accelerator for actions that already have a home. If deleting a project is only possible behind a "⋯", most users will never find it.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          Settings → (nothing) → the only Delete lives in a kebab on a table row
        </span>
      ),
    },
    {
      title: 'Do not mix commands and values',
      why: '"Rename" and "Sort by date" in one panel asks the user to hold two mental models at once. One runs something, the other changes a setting they cannot see the state of.',
      render: (
        <MenuList
          label="Mixed"
          items={[
            { label: 'Rename', onSelect: () => {} },
            { label: 'Sort by date', onSelect: () => {} },
            { label: 'Delete', danger: true, onSelect: () => {} },
          ]}
        />
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Item labels owe 4.5:1 — the label is the content. Icons and shortcuts are supplementary and may sit lower, but not below 3:1.',
      'The active row must be distinguishable from idle rows without relying on colour alone at a 30px row height, where a faint wash disappears in daylight.',
      'The destructive item carries both the danger colour and its own icon, so the severity survives greyscale.',
      'The panel edge must reach 3:1 against the page behind it. On an overlay surface in dark mode this is easy to lose.',
    ],
    keyboard: [
      { keys: 'Enter / Space / ↓', does: 'On the trigger, opens the menu and focuses the first item.' },
      { keys: '↑', does: 'On the trigger, opens the menu and focuses the last item.' },
      { keys: '↑ / ↓', does: 'Moves between items, wrapping at both ends. Disabled items are skipped.' },
      { keys: 'Home / End', does: 'Jumps to the first or last item.' },
      { keys: 'A–Z', does: 'Typeahead — jumps to the next item starting with that letter. Free with role="menu" and worth wiring up.' },
      { keys: '→', does: 'Opens a submenu and focuses its first item. ← closes it and returns.' },
      { keys: 'Enter', does: 'Runs the item. Commands close the menu; checkable items leave it open.' },
      { keys: 'Esc', does: 'Closes and returns focus to the trigger.' },
      { keys: 'Tab', does: 'Closes the menu and moves on. A menu is never tabbed through — that is what the arrows are for.' },
    ],
    aria: [
      { attr: 'aria-haspopup="menu"', on: 'The trigger', note: 'Announces that this button opens something rather than doing something.' },
      { attr: 'aria-expanded', on: 'The trigger', note: 'Must track the real state. Hardcoded false is a silent, common bug.' },
      { attr: 'role="menu"', on: 'The panel', note: 'A contract: arrow navigation, Tab exits, commands only. Do not use it for a panel with mixed content.' },
      { attr: 'role="menuitem"', on: 'Command rows', note: 'menuitemcheckbox with aria-checked for toggles; menuitemradio for a single-choice group.' },
      { attr: 'role="separator"', on: 'Dividers', note: 'So the grouping reaches anyone who cannot see the hairline.' },
      { attr: 'aria-label', on: 'The panel', note: 'Names its scope: "Actions for api-gateway". Otherwise the panel is anonymous.' },
    ],
    focus:
      'Opening moves focus into the menu; closing returns it to the trigger, always. Focus is managed with roving tabindex rather than by making every item tabbable — Tab must exit the menu entirely, not walk through it.',
    screenReader: [
      'The trigger announces as "More actions for api-gateway, menu button, collapsed".',
      'Announce the item count when the menu opens: "menu, 7 items". Without it a user has to arrow to the end to learn the length.',
      'A checkable item announces its state: "Status, menu item checkbox, checked". If the check mark is the only signal, that state does not exist for a screen-reader user.',
    ],
    touch:
      'Rows grow to 44px and submenus are replaced entirely — nest nothing on touch, because there is no hover and no diagonal path. On a phone, a menu with more than about six items should become a Drawer from the bottom edge, which is reachable and scrollable in a way a floating panel is not.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { MenuList, Popover } from '@/ui/Overlay'

<Popover
  align="end"
  trigger={({ toggle, open }) => (
    <IconButton
      // Names the ROW, not the control. Forty "More options" buttons are
      // forty identical announcements.
      label={\`More actions for \${project.name}\`}
      icon={<MoreHorizontal />}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
    />
  )}
>
  <MenuList
    label={\`Actions for \${project.name}\`}
    items={[
      { label: 'Rename',    icon: <Pencil />, shortcut: '⌘E', onSelect: rename },
      { label: 'Duplicate', icon: <Copy />,   shortcut: '⌘D', onSelect: duplicate },
      'separator',
      // Last, past a separator, so the pointer never crosses it on the way
      // to something safe. And it confirms rather than running.
      { label: 'Delete', icon: <Trash2 />, danger: true, onSelect: confirmDelete },
    ]}
  />
</Popover>

// Checkable items keep the menu open — four columns should cost four clicks,
// not four clicks plus four reopenings.
<div role="menu" aria-label="Visible columns">
  {columns.map((c) => (
    <button
      key={c.id}
      role="menuitemcheckbox"
      aria-checked={visible.includes(c.id)}
      onClick={() => toggle(c.id)}   // no close
    >
      {c.label}
    </button>
  ))}
</div>`,
    },
    html: {
      lang: 'html',
      code: `<button
  type="button"
  id="row-trigger"
  aria-label="More actions for api-gateway"
  aria-haspopup="menu"
  aria-expanded="false"
  aria-controls="row-menu"
>
  <svg aria-hidden="true">…</svg>
</button>

<div id="row-menu" role="menu" aria-label="Actions for api-gateway" hidden>
  <!-- Roving tabindex: Tab EXITS a menu, it never walks through it. -->
  <button type="button" role="menuitem" tabindex="0">
    <svg aria-hidden="true">…</svg>
    Rename
    <kbd>⌘E</kbd>
  </button>
  <button type="button" role="menuitem" tabindex="-1">Duplicate</button>

  <div role="separator"></div>

  <button type="button" role="menuitem" tabindex="-1" class="is-danger">
    Delete
  </button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `[role='menu'] {
  min-inline-size: 11rem;
  max-inline-size: 18rem;            /* a long label wraps, never stretches */
  padding: 4px;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);       /* above the page, below a dialog */
}

[role='menuitem'],
[role='menuitemcheckbox'] {
  display: flex;
  align-items: center;
  gap: 10px;
  inline-size: 100%;
  block-size: 30px;
  padding-inline: 8px;
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--ds-fg-secondary);
}

/* The gutter is reserved even when there is no icon, so the labels form one
   column. A ragged label edge is what makes a menu look unfinished. */
[role='menuitem'] > .ds-menu__icon {
  inline-size: 14px;
  flex: 0 0 auto;
  color: var(--ds-fg-muted);
}

[role='menuitem']:hover,
[role='menuitem'][data-active='true'] {
  background: var(--ds-layer-hover);
  color: var(--ds-fg);
}

.is-danger,
.is-danger .ds-menu__icon { color: var(--ds-danger-text); }

[role='separator'] {
  block-size: 1px;
  margin-block: 4px;
  background: var(--ds-border-subtle);
}

@media (pointer: coarse) {
  [role='menuitem'] { block-size: 44px; }
  /* No hover, no diagonal path: submenus do not work here at all. */
  .ds-menu__submenu { display: none; }
}`,
    },
    api: [
      {
        name: 'MenuList',
        props: [
          { name: 'items', type: "(MenuItemSpec | 'separator')[]", required: true, description: 'Commands in order, grouped by separators, destructive last.' },
          { name: 'label', type: 'string', required: true, description: 'Names the menu’s scope. Becomes aria-label on the panel.' },
          { name: 'onClose', type: '() => void', description: 'Called after a command runs. Omit for checkable menus that must stay open.' },
        ],
      },
      {
        name: 'MenuItemSpec',
        props: [
          { name: 'label', type: 'string', required: true, description: 'Lead with the verb: "Delete project", not "Project deletion".' },
          { name: 'icon', type: 'ReactNode', description: '14px. Optional per item; the gutter is reserved regardless.' },
          { name: 'shortcut', type: 'string', description: 'Right-aligned hint. Never the only place the shortcut is documented.' },
          { name: 'danger', type: 'boolean', default: 'false', description: 'Danger tone. Should be paired with a confirmation rather than running immediately.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Skipped by arrow keys but kept in place, so nothing shifts when it becomes available.' },
          { name: 'onSelect', type: '() => void', description: 'Runs the command. Commands close the menu; checkable items should not.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Cap a menu at about eight items. Past that it is a list that needs search, or a panel that needs sections with headings.',
      'Lead every label with a verb. "Delete project" scans and sorts better than "Project deletion", and it reads correctly when announced.',
      'Keep the item order stable across rows and states. Users learn "Delete is at the bottom" in one session and rely on it forever.',
      'Disable rather than remove unavailable items, and explain why in the row. An item that vanishes moves everything below it while the pointer is in flight.',
      'On mobile, promote a long menu into a bottom Drawer. A floating panel near the top of a phone screen is outside the thumb zone entirely.',
    ],
    performance: [
      'Do not mount a menu until it opens. A table of two hundred rows each holding a hidden panel is two hundred popovers of layout work nobody sees.',
      'Compute placement on open, not on every scroll frame. Anchoring math in a scroll listener is the classic cause of jank in long tables.',
      'Share one menu instance across a table and re-point it at the active row. Two hundred identical panels is two hundred times the memory for one visible thing.',
      'Animate the panel with transform and opacity only. Animating height re-lays-out the panel and the rows visibly jump.',
    ],
    mistakes: [
      'role="menu" on a panel containing inputs or links, breaking arrow navigation and the meaning of Enter.',
      'A trigger named "More options" repeated on every row, leaving assistive tech with dozens of identical controls.',
      'aria-expanded hardcoded to false, so the open state is never announced.',
      'Focus dropped to the body on close instead of returning to the trigger.',
      'Closing on every click in a checkable menu, so configuring four columns takes eight interactions.',
      'Destructive items in the middle of the list, directly on the pointer’s path to something safe.',
      'Two levels of submenu, which fails on touch and on trackpads with acceleration.',
    ],
    realWorld: [
      'The "⋯" trigger is now universally understood, but only in a row or card context. Floating on its own with nothing to scope it, users do not know what it will act on.',
      'Right-click context menus are worth adding only where the surrounding product already has them — an editor, a file tree, a canvas. In a form-based app, nobody tries.',
      'Menus are where power users learn shortcuts. Products that show them see measurably higher keyboard adoption, which is the cheapest performance win available.',
      'If a menu item is used constantly, that is the signal to promote it to a real button. The menu is the staging area, not the destination.',
    ],
  },
})
