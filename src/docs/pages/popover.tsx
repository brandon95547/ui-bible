import * as React from 'react'
import { Filter, GitBranch, MapPin, Settings2, Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Avatar, Badge, Tooltip } from '@/ui/Display'
import { Checkbox, Switch } from '@/ui/Toggle'
import { Popover } from '@/ui/Overlay'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [side, setSide] = React.useState<'top' | 'bottom'>('bottom')
  const [align, setAlign] = React.useState<'start' | 'center' | 'end'>('start')
  const [cols, setCols] = React.useState(['status', 'region'])
  const [dense, setDense] = React.useState(false)

  const toggle = (c: string) =>
    setCols((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))

  return (
    <PreviewStage
      label="Playground"
      minHeight={300}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Side">
            <KnobSelect
              value={side}
              onChange={setSide}
              options={['top', 'bottom'] as const}
            />
          </Knob>
          <Knob label="Align">
            <KnobSelect
              value={align}
              onChange={setAlign}
              options={['start', 'center', 'end'] as const}
            />
          </Knob>
          <KnobToggle checked={dense} onChange={setDense} label="Dense" />
        </div>
      }
      code={`<Popover
  side="${side}"
  align="${align}"
  trigger={({ toggle, open }) => (
    <Button
      variant="outlined"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={toggle}
    >
      Display options
    </Button>
  )}
>
  <ColumnSettings />
</Popover>`}
    >
      <Popover
        side={side}
        align={align}
        width="15rem"
        trigger={({ toggle: t, open }) => (
          <Button
            variant="outlined"
            startIcon={<Settings2 size={15} />}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={t}
          >
            Display options
          </Button>
        )}
      >
        <div className={cn('flex flex-col gap-3', dense ? 'p-2.5' : 'p-3.5')}>
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Columns</span>
          <Stack gap="xs">
            {[
              ['status', 'Status'],
              ['region', 'Region'],
              ['duration', 'Duration'],
              ['author', 'Author'],
            ].map(([id, label]) => (
              <Checkbox
                key={id}
                label={label}
                checked={cols.includes(id)}
                onChange={() => toggle(id)}
              />
            ))}
          </Stack>
          <span className="h-px bg-[var(--ds-border-subtle)]" />
          <Switch label="Compact rows" checked={dense} onCheckedChange={setDense} />
        </div>
      </Popover>
    </PreviewStage>
  )
}

function HoverCard() {
  const [open, setOpen] = React.useState(false)
  const enter = React.useRef<number | undefined>(undefined)
  const leave = React.useRef<number | undefined>(undefined)

  // Hover intent: a pointer crossing the link must not open anything, and
  // moving from the link into the card must not close it.
  const onEnter = () => {
    window.clearTimeout(leave.current)
    enter.current = window.setTimeout(() => setOpen(true), 500)
  }
  const onLeave = () => {
    window.clearTimeout(enter.current)
    leave.current = window.setTimeout(() => setOpen(false), 300)
  }

  return (
    <PreviewStage minHeight={260} center={false}>
      <p className="max-w-md text-body text-[var(--ds-fg-secondary)]">
        Rolled back by{' '}
        <span className="relative inline-block">
          <button
            type="button"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            aria-expanded={open}
            aria-haspopup="dialog"
            className="rounded-[var(--radius-xs)] font-medium text-[var(--ds-accent-text)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
          >
            @ada
          </button>
          {open && (
            <span
              role="dialog"
              aria-label="Ada Lovelace"
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
              className="absolute left-0 top-full z-50 mt-1.5 block w-64 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3.5 shadow-e4"
            >
              <Row gap="sm" align="center">
                <Avatar name="Ada Lovelace" size="lg" />
                <Stack gap="xs" className="min-w-0">
                  <span className="truncate text-label text-[var(--ds-fg)]">Ada Lovelace</span>
                  <span className="truncate text-caption text-[var(--ds-fg-muted)]">
                    Platform · Engineering
                  </span>
                </Stack>
              </Row>
              <Row gap="sm" align="center" className="mt-3 text-caption text-[var(--ds-fg-muted)]">
                <MapPin size={12} /> London
                <GitBranch size={12} className="ml-2" /> 214 deploys
              </Row>
              <Button size="sm" variant="outlined" fullWidth className="mt-3">
                View profile
              </Button>
            </span>
          )}
        </span>{' '}
        after the health check failed in eu-west-2.
      </p>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'popover',
    title: 'Popover',
    tagline:
      'Interactive content anchored to a trigger and dismissible with no consequence — including the hover-raised preview card.',
    keywords: ['hover card', 'flyout', 'coach mark', 'anchored', 'placement', 'collision', 'dismiss'],
  },

  overview: {
    purpose:
      'A popover is a small panel anchored to the thing that opened it, holding content the user can interact with. It sits between a tooltip, which is text only and cannot be entered, and a dialog, which blocks the page until answered. A popover is entered freely and dismissed freely — nothing is lost by clicking away, and that is the defining constraint.',
    whenToUse: [
      'Secondary controls that would crowd the page: display options, filters, column pickers.',
      'A rich preview of an entity referenced in the page — a person, a repository, a deployment.',
      'A form short enough that losing it on dismissal costs nothing.',
      'Onboarding coach marks pointing at a specific control.',
    ],
    whenNotToUse: [
      {
        text: 'The content is a list of commands.',
        instead: 'a Menu, which brings the arrow-key contract with it',
        to: '#/menu',
      },
      {
        text: 'The content is plain text.',
        instead: 'a Tooltip',
        to: '#/tooltip',
      },
      {
        text: 'Losing the content on an accidental dismissal would matter.',
        instead: 'a Dialog or a Drawer, which do not close on an outside click',
        to: '#/dialog',
      },
      {
        text: 'The panel would be taller than about half the viewport.',
        instead: 'a Drawer — a popover that fills the screen is a dialog wearing an anchor',
        to: '#/drawer',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Dismissal must be free.</strong> A popover closes on an outside click, on Escape,
          and on scroll away from the anchor. That is what makes it feel light — and it is exactly
          why nothing precious can live inside one. If a half-filled form would be lost, the
          content belongs in something that asks before closing.
        </p>
        <p>
          The difference from a Menu is a <strong>keyboard contract</strong>, not an appearance.{' '}
          <code>role="menu"</code> promises arrow-key navigation between command items; a popover
          promises ordinary Tab order through ordinary controls. Putting a text field in a menu
          breaks the arrows; putting commands in a popover loses the typeahead. Pick by content.
        </p>
        <p>
          A hover card is a popover with an <strong>intent delay</strong>: about 500ms before
          opening so a pointer crossing a link never triggers it, and about 300ms before closing so
          the pointer can travel from the link into the card. Without both, the card is a flicker
          that cannot be reached.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'hover-card',
        title: 'Hover card',
        description:
          'A popover raised by hover instead of click. The 500ms open and 300ms close delays are what make it reachable rather than a flicker.',
        render: <HoverCard />,
      },
      {
        id: 'vs-menu',
        title: 'Popover or menu',
        description:
          'The same shape, two different contracts. Commands with arrow keys are a Menu; mixed controls with Tab order are a Popover.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Menu" sub="Commands · arrow keys" tone="good">
                <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1.5">
                  {['Rename', 'Duplicate', 'Archive'].map((l) => (
                    <span
                      key={l}
                      className="block rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </Cell>
              <Cell label="Popover" sub="Mixed controls · Tab order" tone="good">
                <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3">
                  <Checkbox label="Failed only" defaultChecked />
                  <Checkbox label="Last 24 hours" />
                  <Button size="sm" fullWidth>
                    Apply
                  </Button>
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'filters',
        title: 'A short form',
        description:
          'Filters are the archetypal popover: several controls, an explicit Apply, and nothing lost if the user changes their mind and clicks away.',
        render: (
          <PreviewStage minHeight={280}>
            <Popover
              width="16rem"
              trigger={({ toggle, open }) => (
                <Button
                  variant="outlined"
                  startIcon={<Filter size={15} />}
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  onClick={toggle}
                >
                  Filters
                  <Badge tone="accent" size="sm" className="ml-1.5">
                    2
                  </Badge>
                </Button>
              )}
            >
              <div className="flex flex-col gap-3 p-3.5">
                <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Status</span>
                <Stack gap="xs">
                  <Checkbox label="Failed" defaultChecked />
                  <Checkbox label="Succeeded" />
                  <Checkbox label="Cancelled" defaultChecked />
                </Stack>
                <span className="h-px bg-[var(--ds-border-subtle)]" />
                <Row gap="sm">
                  <Button size="sm" variant="text" className="flex-1">
                    Clear
                  </Button>
                  <Button size="sm" className="flex-1">
                    Apply
                  </Button>
                </Row>
              </div>
            </Popover>
          </PreviewStage>
        ),
      },
      {
        id: 'placement',
        title: 'Placement and collision',
        description:
          'Top or bottom, aligned to either end of the trigger. Near a viewport edge the panel flips to the opposite side rather than being clipped — the anchor relationship survives, the clipping would destroy it.',
        render: (
          <PreviewStage minHeight={280}>
            <Row gap="lg">
              {(['top', 'bottom'] as const).map((s) => (
                <Popover
                  key={s}
                  side={s}
                  width="9rem"
                  trigger={({ toggle, open }) => (
                    <Button
                      size="sm"
                      variant="outlined"
                      aria-haspopup="dialog"
                      aria-expanded={open}
                      onClick={toggle}
                    >
                      {s}
                    </Button>
                  )}
                >
                  <p className="p-3 text-caption text-[var(--ds-fg-secondary)]">
                    Placed {s}, flips near an edge.
                  </p>
                </Popover>
              ))}
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Trigger closed',
        render: <Button variant="outlined" size="sm" startIcon={<Settings2 size={14} />}>Options</Button>,
      },
      {
        label: 'Trigger open',
        render: (
          <Button variant="tonal" size="sm" startIcon={<Settings2 size={14} />} aria-expanded>
            Options
          </Button>
        ),
      },
      {
        label: 'Panel',
        render: (
          <span className="block w-40 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3 text-caption text-[var(--ds-fg-secondary)] shadow-e4">
            Interactive content
          </span>
        ),
      },
      {
        label: 'With header',
        render: (
          <span className="block w-40 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4">
            <span className="block border-b border-[var(--ds-border-subtle)] px-3 py-2 text-label text-[var(--ds-fg)]">
              Display options
            </span>
            <span className="block p-3 text-caption text-[var(--ds-fg-muted)]">Body</span>
          </span>
        ),
      },
      {
        label: 'With footer',
        render: (
          <span className="block w-40 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4">
            <span className="block p-3 text-caption text-[var(--ds-fg-muted)]">Body</span>
            <span className="flex justify-end gap-2 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-2">
              <Button size="sm">Apply</Button>
            </span>
          </span>
        ),
      },
      { label: 'Icon trigger', render: <IconButton variant="outlined" size="sm" label="Filters" icon={<Filter />} /> },
      {
        label: 'Hover card',
        render: (
          <span className="block w-44 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3 shadow-e4">
            <Row gap="sm" align="center">
              <Avatar name="Ada Lovelace" size="md" />
              <span className="text-label text-[var(--ds-fg)]">Ada Lovelace</span>
            </Row>
          </span>
        ),
      },
      {
        label: 'Coach mark',
        render: (
          <span className="block w-44 rounded-[var(--radius-lg)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] p-3 text-caption text-[var(--ds-fg)] shadow-e4">
            <Star size={13} className="mb-1 text-[var(--ds-accent-text)]" />
            Pin the deployments you watch most.
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Popover
        width="15rem"
        trigger={({ toggle, open }) => (
          <Button
            variant="outlined"
            startIcon={<Settings2 size={15} />}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={toggle}
          >
            Display options
          </Button>
        )}
      >
        <div className="flex flex-col gap-3 p-3.5">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Columns</span>
          <Checkbox label="Status" defaultChecked />
          <Checkbox label="Region" />
        </div>
      </Popover>
    ),
    caption:
      'A panel anchored 6px below its trigger, at overlay elevation, sized to its content rather than to the trigger.',
    parts: [
      {
        n: 1,
        label: 'Width',
        value: 'Content-sized, 12–24rem',
        kind: 'size',
        note: 'Not matched to the trigger. A popover from a 32px icon button is still 15rem wide, because the content decides.',
      },
      {
        n: 2,
        label: 'Max height',
        value: '50vh, then scrolls',
        kind: 'size',
        note: 'Past half the viewport it is a dialog wearing an anchor, and the anchor relationship stops meaning anything.',
      },
      {
        n: 3,
        label: 'Offset',
        value: '6px from the trigger',
        kind: 'space',
        note: 'Close enough to read as attached; far enough that the trigger’s focus ring is not clipped by the panel.',
      },
      {
        n: 4,
        label: 'Padding',
        value: '14px',
        kind: 'space',
        note: 'One step below a card. A popover is transient and does not need the breathing room a permanent surface earns.',
      },
      {
        n: 5,
        label: 'Elevation',
        value: '--shadow-e4',
        kind: 'color',
        note: 'Above the page, below a dialog. A dialog opened from a popover must clearly sit above it.',
      },
      {
        n: 6,
        label: 'Collision',
        value: 'Flip, then shift',
        kind: 'motion',
        note: 'Flip to the opposite side first, then slide along the cross-axis. Both preserve the anchor; clipping destroys it.',
      },
      {
        n: 7,
        label: 'Entrance',
        value: 'scale 0.96 → 1, 120ms',
        kind: 'motion',
        note: 'Scaling from the anchor’s edge is what makes the panel read as emerging from the trigger rather than appearing over it.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel surface' },
    { category: 'color', token: '--ds-border', usedFor: 'Panel edge' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Header and footer dividers' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Footer strip' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Section labels inside the panel' },
    { category: 'spacing', token: 'offset', value: '6px', usedFor: 'Gap from the trigger' },
    { category: 'spacing', token: 'padding', value: '14px', usedFor: 'Panel padding' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Panel corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Scale-in entrance' },
    { category: 'motion', token: 'hover intent', value: '500ms open / 300ms close', usedFor: 'Hover-card delays' },
  ],

  sizes: [
    { name: 'Compact', minWidth: '12rem', padding: '10px', use: 'A couple of toggles or a short preview.' },
    { name: 'Default', minWidth: '15rem', maxWidth: '20rem', padding: '14px', use: 'The default. Filters, display options, a short form.' },
    { name: 'Wide', maxWidth: '24rem', padding: '16px', use: 'A hover card with an avatar and metadata, or a two-column set of options.' },
    { name: 'Max height', height: '50vh', use: 'Then the body scrolls with the header and footer pinned.' },
    { name: 'Offset', gap: '6px', use: 'From the trigger, on every side.' },
    { name: 'Viewport margin', gap: '8px', use: 'Minimum distance from any edge before flipping or shifting.' },
  ],

  do: [
    {
      title: 'Return focus to the trigger on close',
      why: 'A keyboard user who presses Escape must land back on the control they opened. Dropping focus to the body sends them to the top of the page.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onClose → triggerRef.current?.focus()
        </code>
      ),
    },
    {
      title: 'Give a hover card both delays',
      why: '500ms before opening so a pointer crossing a link never triggers it; 300ms before closing so the pointer can travel into the card.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>enter → 500ms → open</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>leave → 300ms → close</span>
        </Row>
      ),
    },
    {
      title: 'Flip before you clip',
      why: 'A panel cut off by the viewport edge loses both its content and its anchor. Flipping to the opposite side keeps both.',
      render: (
        <Row gap="sm">
          <Tooltip content="Flips to top near the bottom edge">
            <Button size="sm" variant="outlined">
              Near an edge
            </Button>
          </Tooltip>
        </Row>
      ),
    },
    {
      title: 'Use aria-haspopup="dialog", not "menu"',
      why: 'The role sets the user’s expectation. Announcing a menu and then not providing arrow-key navigation is worse than announcing nothing.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          aria-haspopup="dialog" aria-expanded="true"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put a long form in one',
      why: 'An outside click closes it with no warning. Anything worth confirming before discarding belongs in a Dialog.',
      render: (
        <span className="block w-44 rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-overlay)] p-3">
          <Stack gap="xs">
            {['Name', 'Email', 'Role', 'Team', 'Notes'].map((f) => (
              <span
                key={f}
                className="h-6 rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)]"
              />
            ))}
          </Stack>
        </span>
      ),
    },
    {
      title: 'Do not open a popover from a popover',
      why: 'Two dismiss layers, two escape targets and a pointer path across both. Users cannot tell which click closes what.',
      render: (
        <Row gap="sm" align="start">
          <span className="h-14 w-20 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]" />
          <span className="mt-4 h-14 w-20 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]" />
        </Row>
      ),
    },
    {
      title: 'Do not make it taller than half the viewport',
      why: 'At that size the anchor relationship stops meaning anything and the user is looking at a dialog that closes if they miss.',
      render: (
        <span className="block h-28 w-32 rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-overlay)] p-3 text-caption text-[var(--ds-fg-muted)]">
          …and it keeps going
        </span>
      ),
    },
    {
      title: 'Do not open a hover card with no delay',
      why: 'Every pointer crossing the link fires it, and with no close delay the card cannot be reached before it disappears.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          onMouseEnter → setOpen(true) → flicker
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The panel edge must reach 3:1 against the page behind it. On an overlay surface in dark mode this is the easiest boundary to lose.',
      'A popover is not scrimmed, so its surface must be distinguishable from the content it covers by more than a shadow.',
      'Controls inside inherit their own contrast requirements — being in a transient panel does not exempt them.',
    ],
    keyboard: [
      { keys: 'Enter / Space', does: 'On the trigger, opens the panel and moves focus to its first focusable element.' },
      { keys: 'Tab', does: 'Cycles within the panel while it is open. It is not a full focus trap, but focus must not escape into the page behind unnoticed.' },
      { keys: 'Esc', does: 'Closes and returns focus to the trigger. Always.' },
      { keys: 'Tab out', does: 'From the last element, closes the panel and continues into the page — a popover is not a modal.' },
      { keys: 'Arrow keys', does: 'Nothing at panel level. If the content wants arrows, it is a Menu.' },
    ],
    aria: [
      { attr: 'aria-haspopup="dialog"', on: 'The trigger', note: 'Not "menu" unless it genuinely is one. The announced role sets the keyboard expectation.' },
      { attr: 'aria-expanded', on: 'The trigger', note: 'Must track the real state. A hardcoded false is a silent and very common bug.' },
      { attr: 'role="dialog"', on: 'The panel', note: 'With aria-label or aria-labelledby pointing at its heading. An anonymous panel is announced as an unnamed region.' },
      { attr: 'aria-controls', on: 'The trigger', note: 'Points at the panel id, associating the two for assistive tech.' },
      { attr: 'aria-modal="false"', on: 'The panel', note: 'Explicit: content behind stays reachable. That is the difference from a Dialog.' },
    ],
    focus:
      'Opening moves focus into the panel; Escape returns it to the trigger. A hover card opened by hover must not steal focus — it opens on focus of the trigger too, so keyboard users reach it without the pointer. WCAG 1.4.13 also requires the card to stay open while the pointer is over it and to be dismissible with Escape.',
    screenReader: [
      'The trigger announces as "Display options, button, collapsed" then "expanded" when opened.',
      'The panel announces its own name on entry. A popover with no accessible name is a region the user has to explore to identify.',
      'Do not announce hover cards on hover alone — the same content must be reachable by focusing the trigger, or it does not exist without a mouse.',
    ],
    touch:
      'There is no hover, so a hover card must have a tap behaviour: tap the trigger to open, tap outside to close. Panels near the bottom of a phone screen are covered by nothing but are hard to reach — prefer a Drawer from the bottom edge for anything with more than a couple of controls. Keep the trigger visible when the panel opens, or the anchor relationship is lost.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Popover } from '@/ui/Overlay'

<Popover
  side="bottom"
  align="start"
  width="15rem"
  trigger={({ toggle, open }) => (
    <Button
      variant="outlined"
      // "dialog", not "menu": the announced role sets the keyboard expectation.
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={toggle}
    >
      Display options
    </Button>
  )}
>
  <ColumnSettings />
</Popover>

// Hover card: BOTH delays, or it is a flicker that cannot be reached.
const enter = React.useRef<number>()
const leave = React.useRef<number>()

const onEnter = () => {
  clearTimeout(leave.current)
  enter.current = window.setTimeout(() => setOpen(true), 500)
}
const onLeave = () => {
  clearTimeout(enter.current)
  // The 300ms is the pointer's travel time from the link into the card.
  leave.current = window.setTimeout(() => setOpen(false), 300)
}

// Opening on focus too is what makes the card exist without a mouse.
<a onMouseEnter={onEnter} onMouseLeave={onLeave}
   onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
  @ada
</a>

// Collision: flip to the opposite side first, then shift along the cross-axis.
// Both preserve the anchor; clipping destroys it.
const placement = fits(preferred) ? preferred : opposite(preferred)
const shift = clampToViewport(rect, 8)`,
    },
    html: {
      lang: 'html',
      code: `<button
  type="button"
  id="opts-trigger"
  aria-haspopup="dialog"
  aria-expanded="true"
  aria-controls="opts-panel"
>
  Display options
</button>

<div
  id="opts-panel"
  role="dialog"
  aria-modal="false"
  aria-labelledby="opts-title"
>
  <h2 id="opts-title" class="sr-only">Display options</h2>

  <fieldset>
    <legend>Columns</legend>
    <label><input type="checkbox" checked /> Status</label>
    <label><input type="checkbox" /> Region</label>
  </fieldset>

  <hr />

  <label><input type="checkbox" /> Compact rows</label>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-popover {
  position: absolute;
  z-index: 80;                       /* above the page, below a dialog */
  /* Sized by content, not by the trigger: a popover from a 32px icon
     button is still 15rem wide. */
  inline-size: max-content;
  min-inline-size: 12rem;
  max-inline-size: 20rem;
  /* Past half the viewport this is a dialog wearing an anchor. */
  max-block-size: 50vh;
  overflow-y: auto;
  padding: 14px;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
  /* Scaling from the anchor edge reads as emerging FROM the trigger. */
  transform-origin: var(--popover-origin, top center);
  animation: popover-in 120ms cubic-bezier(0.32, 0.72, 0, 1) both;
}

@keyframes popover-in {
  from { opacity: 0; scale: 0.96; }
  to   { opacity: 1; scale: 1; }
}

/* Header and footer stay put while the body scrolls. */
.ds-popover__head,
.ds-popover__foot { position: sticky; z-index: 1; }
.ds-popover__head { inset-block-start: 0; background: var(--ds-surface-overlay); }
.ds-popover__foot { inset-block-end: 0;  background: var(--ds-surface-inset); }

@media (prefers-reduced-motion: reduce) {
  .ds-popover { animation: none; }
}

/* No hover, and the lower half of a phone screen is hard to reach: past a
   couple of controls this should be a Drawer. */
@media (pointer: coarse) {
  .ds-popover { max-block-size: 40vh; }
}`,
    },
    api: [
      {
        name: 'Popover',
        props: [
          { name: 'trigger', type: '(props: { open: boolean; toggle: () => void }) => ReactNode', required: true, description: 'A render prop, so the trigger owns aria-expanded and aria-haspopup itself.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'Interactive content. Commands with arrow keys belong in a Menu instead.' },
          { name: 'side', type: "'top' | 'bottom'", default: "'bottom'", description: 'Preferred side. Flips automatically when it would be clipped. Left and right are deliberately absent — a horizontally anchored panel has nowhere to go on a narrow viewport.' },
          { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Alignment along the cross-axis, shifted as needed to stay in the viewport.' },
          { name: 'width', type: 'string', default: "'auto'", description: 'Sized by content. Never matched to the trigger.' },
          { name: 'openOn', type: "'click' | 'hover'", default: "'click'", description: 'Hover adds the 500ms and 300ms intent delays and opens on focus too.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show the applied count on the trigger — "Filters (2)" — so the state is visible without opening the panel.',
      'Apply changes live where they are cheap to reverse, and add an explicit Apply only when the change is expensive. An Apply button on a column toggle is friction for nothing.',
      'Keep the trigger visually active while the panel is open. Without it, the user loses track of which control produced the panel.',
      'Close on scroll only when the anchor leaves the viewport. Closing on any scroll makes the panel feel fragile.',
      'For coach marks, allow permanent dismissal and never show more than about three in a sequence.',
    ],
    performance: [
      'Do not mount the panel until it opens. A table row with a popover per row is otherwise dozens of hidden panels of layout work.',
      'Compute placement on open and on resize, not on every scroll frame. Anchoring maths in a scroll listener is the classic cause of jank.',
      'Share one panel instance across a list and re-point it at the active anchor.',
      'Animate transform and opacity only. Animating width or height re-lays-out the content and the controls visibly jump.',
    ],
    mistakes: [
      'aria-haspopup="menu" on a panel with no arrow-key navigation.',
      'aria-expanded hardcoded to false, so the open state is never announced.',
      'Focus dropped to the body on close instead of returning to the trigger.',
      'A long form inside, lost to an accidental outside click.',
      'A hover card with no delays, flickering and unreachable.',
      'A hover card with no focus trigger, invisible to keyboard users.',
      'Nested popovers, with two dismiss layers users cannot tell apart.',
      'Matching the panel width to the trigger, producing a 32px-wide panel from an icon button.',
    ],
    realWorld: [
      'Filter popovers are the highest-traffic instance in most products. Showing the active count on the trigger is worth more than anything inside the panel.',
      'Hover cards work well for people and repositories, and badly for anything the user has to read carefully — the delay tax is only worth paying for a glance.',
      'On touch, most popovers are better as bottom drawers. The interaction is the same, the reach is far better, and dismissal is a familiar gesture.',
      'If a popover is growing a header, a footer and a scroll region, it has become a dialog. Promote it rather than continuing to anchor it.',
    ],
  },
})
