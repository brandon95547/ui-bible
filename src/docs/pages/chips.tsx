import * as React from 'react'
import { Filter, Plus, Search, Tag } from 'lucide-react'
import { Avatar, Badge, Chip } from '@/ui/Display'
import { TextInput } from '@/ui/Input'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const FILTERS = ['Production', 'Staging', 'Preview', 'Failed', 'Last 24h', 'Assigned to me']

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [selected, setSelected] = React.useState(true)
  const [removable, setRemovable] = React.useState(false)
  const [withIcon, setWithIcon] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={140}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={selected} onChange={setSelected} label="Selected" />
          <KnobToggle checked={withIcon} onChange={setWithIcon} label="Icon" />
          <KnobToggle checked={removable} onChange={setRemovable} label="Removable" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
        </div>
      }
      code={`<Chip
  size="${size}"
  selected={${selected}}${withIcon ? '\n  icon={<Filter size={13} />}' : ''}${removable ? '\n  onRemove={() => remove(id)}' : ''}${disabled ? '\n  disabled' : ''}
  onClick={toggle}
>
  Production
</Chip>`}
    >
      <Chip
        size={size}
        selected={selected}
        disabled={disabled}
        icon={withIcon ? <Filter size={13} /> : undefined}
        onRemove={removable ? () => {} : undefined}
        onClick={() => setSelected((s) => !s)}
      >
        Production
      </Chip>
    </PreviewStage>
  )
}

function FilterBar() {
  const [active, setActive] = React.useState<string[]>(['Production', 'Failed'])
  const toggle = (f: string) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <Stack gap="sm" className="w-full">
        <Row gap="sm">
          {FILTERS.map((f) => (
            <Chip key={f} selected={active.includes(f)} onClick={() => toggle(f)}>
              {f}
            </Chip>
          ))}
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => setActive([])}
              className="text-caption text-[var(--ds-accent-text)] underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          )}
        </Row>
        <p aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
          {active.length === 0
            ? 'Showing all 248 deployments'
            : `Showing 31 deployments matching ${active.length} ${active.length === 1 ? 'filter' : 'filters'}`}
        </p>
      </Stack>
    </PreviewStage>
  )
}

function TokenInput() {
  const [tokens, setTokens] = React.useState(['ada@example.com', 'grace@example.com'])
  const [draft, setDraft] = React.useState('')

  const commit = () => {
    const v = draft.trim().replace(/,$/, '')
    if (!v) return
    setTokens((t) => [...t, v])
    setDraft('')
  }

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="w-full max-w-lg">
        <label htmlFor="tok" className="mb-1.5 block text-label text-[var(--ds-fg-secondary)]">
          Invite people
        </label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] p-1.5 focus-within:border-[var(--ds-accent)] focus-within:shadow-[0_0_0_3px_var(--ds-accent-subtle)]">
          {tokens.map((t) => (
            <Chip
              key={t}
              as="span"
              size="sm"
              selected
              avatar={<Avatar name={t.split('@')[0]} size="xs" />}
              onRemove={() => setTokens((prev) => prev.filter((x) => x !== t))}
            >
              {t}
            </Chip>
          ))}
          <input
            id="tok"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                commit()
              }
              // The behaviour every user already knows from email "To" fields.
              if (e.key === 'Backspace' && draft === '') {
                setTokens((prev) => prev.slice(0, -1))
              }
            }}
            onBlur={commit}
            placeholder={tokens.length ? '' : 'name@example.com'}
            className="h-7 min-w-[10rem] flex-1 bg-transparent px-1.5 text-body-sm outline-none placeholder:text-[var(--ds-fg-muted)]"
          />
        </div>
        <p className="mt-1.5 text-caption text-[var(--ds-fg-muted)]">
          Enter or comma to add. Backspace on an empty field removes the last one.
        </p>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'chips',
    title: 'Chips',
    group: 'Data Display',
    tagline:
      'The interactive cousin of the badge. Filter chips toggle, input chips are removable tokens, and both are 28px so they never read as buttons.',
    keywords: ['tag', 'token', 'filter', 'facet', 'pill', 'multi-select', 'input token'],
  },

  overview: {
    purpose:
      'A chip is a compact, interactive object representing a value — a filter that can be toggled, a token that can be removed, a selection that can be cleared. It is the only pill-shaped element in the system that responds to a click, which makes the distinction from a badge the single most important thing to get right.',
    whenToUse: [
      'Toggling filters where several may be active at once and the active set must stay visible.',
      'Representing selected values inside an input: recipients, tags, labels.',
      'Showing the currently applied filters above a result set, each individually removable.',
      'Compact multi-select where the selection needs to be readable without opening anything.',
    ],
    whenNotToUse: [
      {
        text: 'The label is read-only and states a status.',
        instead: 'a Badge',
        to: '#/badges',
      },
      {
        text: 'The element performs an action rather than setting a value.',
        instead: 'a Button',
        to: '#/buttons',
      },
      {
        text: 'Exactly one of a small set may be active.',
        instead: 'a segmented control',
        to: '#/radios',
      },
      {
        text: 'There are more than about a dozen filter options.',
        instead: 'a MultiSelect or a faceted filter panel',
        to: '#/dropdowns',
      },
    ],
    reasoning: (
      <>
        <p>
          Chips are <strong>28px tall</strong>: below a button at 36px, above a badge at 22px. That
          middle position is doing real work — it signals "interactive, but secondary" without
          needing a border style or a colour to say so. A chip that is button-height competes with
          the actual buttons on the page.
        </p>
        <p>
          Filter chips use <code>aria-pressed</code>, not <code>aria-selected</code>. They are
          independent toggles, not options within a listbox, and getting this wrong makes a screen
          reader announce a filter bar as a set of options where only one can be chosen.
        </p>
        <p>
          The most important detail in a chip input is <strong>Backspace on an empty field removes
          the last token</strong>. Every user already knows this from email clients, and
          implementing it costs three lines. Leaving it out makes the control feel subtly wrong in a
          way people rarely articulate.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'filters',
        title: 'Filter chips',
        description:
          'Independent toggles with a live result count. The count is in an aria-live region, so screen-reader users hear the effect of the filter they just applied.',
        render: <FilterBar />,
      },
      {
        id: 'tokens',
        title: 'Input chips',
        description:
          'Values committed into a field. Enter or comma adds, the × removes, and Backspace on an empty field removes the last one.',
        render: <TokenInput />,
      },
      {
        id: 'applied',
        title: 'Applied filters',
        description:
          'When filters live in a panel, echo them above the results as removable chips. Users need to see what is narrowing the list without reopening anything.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <AppliedDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'with-content',
        title: 'Avatars, icons and counts',
        description:
          'A chip can carry a leading avatar or icon and a trailing count. Anything more than that and it should be a row in a list.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="sm">
              <Chip avatar={<Avatar name="Ada Lovelace" size="xs" />} onRemove={() => {}}>
                Ada Lovelace
              </Chip>
              <Chip icon={<Tag size={13} />} selected>
                infrastructure
              </Chip>
              <Chip icon={<Search size={13} />}>
                “timeout”
              </Chip>
              <Chip>
                Region <Badge tone="neutral" size="sm" className="ml-1">3</Badge>
              </Chip>
              <Chip icon={<Plus size={13} />}>Add filter</Chip>
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <Chip>Production</Chip> },
      { label: 'Hover', render: <Chip className="border-[var(--ds-border-strong)] bg-[var(--ds-layer-hover)] text-[var(--ds-fg)]">Production</Chip> },
      { label: 'Selected', render: <Chip selected>Production</Chip> },
      { label: 'Focus', render: <Chip className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">Production</Chip> },
      { label: 'Disabled', render: <Chip disabled>Production</Chip> },
      { label: 'Removable', render: <Chip selected onRemove={() => {}}>Production</Chip> },
      { label: 'With icon', render: <Chip icon={<Filter size={13} />}>Filter</Chip> },
      { label: 'With avatar', render: <Chip avatar={<Avatar name="Ada Lovelace" size="xs" />}>Ada</Chip> },
      { label: 'Small', render: <Chip size="sm" selected>Small</Chip> },
      { label: 'Static', note: 'as="span"', render: <Chip as="span" selected>Read only</Chip> },
      { label: 'Truncated', render: <div className="max-w-[8rem]"><Chip>A very long tag name that wraps</Chip></div> },
      { label: 'Count', render: <Chip>Region <Badge tone="neutral" size="sm" className="ml-1">3</Badge></Chip> },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="center">
        <Chip selected icon={<Filter size={13} />} onRemove={() => {}}>
          Production
        </Chip>
        <Chip>Staging</Chip>
      </Row>
    ),
    caption:
      'Selected with a leading icon and a remove button, next to an unselected chip. Both are 28px tall so a wrapped row stays on a consistent baseline.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '28px (md), 24px (sm)',
        kind: 'size',
        note: 'Between a badge and a button. Interactive but clearly secondary to the page’s actual actions.',
      },
      {
        n: 2,
        label: 'Padding',
        value: '10px, 6px when adorned',
        kind: 'space',
        note: 'Reduced on the side that carries an icon or avatar, so the adornment does not push the label off-centre.',
      },
      {
        n: 3,
        label: 'Selected state',
        value: 'Tint + accent border + accent text',
        kind: 'color',
        note: 'Three changes at once. A tint alone is too subtle in a wrapped row of a dozen chips.',
      },
      {
        n: 4,
        label: 'Remove button',
        value: '18px, its own focus target',
        kind: 'size',
        note: 'A separate focusable element with its own accessible name — "Remove Production", not "Remove". It must stop propagation so removing does not also toggle.',
      },
      {
        n: 5,
        label: 'Row gap',
        value: '8px',
        kind: 'space',
        note: 'Enough that the pills read as separate objects rather than one long bar, and enough that adjacent focus rings do not collide.',
      },
      {
        n: 6,
        label: 'Shape',
        value: 'Fully rounded',
        kind: 'shape',
        note: 'Shared with badges. The height difference and the hover state are what distinguish them, not the silhouette.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Unselected fill' },
    { category: 'color', token: '--ds-border', usedFor: 'Unselected border' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover fill' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Selected fill' },
    { category: 'color', token: '--ds-accent-border', usedFor: 'Selected border' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Selected label' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Unselected label' },
    { category: 'spacing', token: 'padding-x', value: '10px, 6px adorned', usedFor: 'Horizontal padding' },
    { category: 'spacing', token: 'gap', value: '6px', usedFor: 'Icon or avatar to label' },
    { category: 'spacing', token: 'row gap', value: '8px', usedFor: 'Between chips' },
    { category: 'radius', token: 'full', usedFor: 'Pill shape' },
    { category: 'typography', token: '--text-label', value: '13px', usedFor: 'Label' },
    { category: 'motion', token: 'duration', value: '120ms', usedFor: 'Hover and selection transition' },
  ],

  sizes: [
    { name: 'Small', height: '24px', padding: '0 8px', radius: 'full', icon: '12px', type: '12px', touch: '44px (padded)', use: 'Inside inputs as tokens, and in dense table toolbars.' },
    { name: 'Medium', height: '28px', padding: '0 10px', radius: 'full', icon: '13px', type: '13px', touch: '44px (padded)', use: 'The default. Filter bars and applied-filter rows.' },
    { name: 'With remove', height: '28px', padding: '0 4px 0 10px', gap: '6px', use: 'Right padding drops to make room for the 18px remove button.' },
    { name: 'With avatar', height: '28px', padding: '0 10px 0 6px', gap: '6px', use: 'Left padding drops so the 20px avatar sits flush inside the pill.' },
  ],

  do: [
    {
      title: 'Show the effect of the filter',
      why: 'A chip that toggles with no visible consequence leaves the user unsure whether it did anything. A live result count is the cheapest possible feedback.',
      render: (
        <Stack gap="sm" className="items-center">
          <Row gap="sm">
            <Chip selected>Failed</Chip>
            <Chip>Production</Chip>
          </Row>
          <span className="text-caption text-[var(--ds-fg-muted)]">31 of 248 deployments</span>
        </Stack>
      ),
    },
    {
      title: 'Give the remove button its own name',
      why: '"Remove" repeated twelve times is useless to a screen-reader user. "Remove Production" tells them exactly what disappears.',
      render: (
        <Row gap="sm">
          <Chip selected onRemove={() => {}}>Production</Chip>
          <Chip selected onRemove={() => {}}>Failed</Chip>
        </Row>
      ),
    },
    {
      title: 'Support Backspace in chip inputs',
      why: 'Every user has learned this from email "To" fields. It costs three lines and its absence is felt immediately, even by people who cannot say what is wrong.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          if (e.key === 'Backspace' &amp;&amp; draft === '')
          <br />
          &nbsp;&nbsp;removeLast()
        </code>
      ),
    },
    {
      title: 'Offer Clear all once several are active',
      why: 'Removing six filters one at a time is six clicks and six re-renders. The escape hatch should appear as soon as more than one is active.',
      render: (
        <Row gap="sm" align="center">
          <Chip selected onRemove={() => {}}>Production</Chip>
          <Chip selected onRemove={() => {}}>Failed</Chip>
          <button type="button" className="text-caption text-[var(--ds-accent-text)] underline-offset-4 hover:underline">
            Clear all
          </button>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a chip for an action',
      why: 'Chips set values. A chip that deletes something or navigates away breaks the mental model, and it is a small, low-contrast target for a consequential action.',
      render: (
        <Row gap="sm">
          <Chip>Delete project</Chip>
          <Chip>Export CSV</Chip>
        </Row>
      ),
    },
    {
      title: 'Do not let the active set become invisible',
      why: 'Filters applied in a hidden panel with no echo above the results is the classic "why is my list empty?" bug. The user has no way to see what is excluding everything.',
      render: (
        <Stack gap="sm" className="w-full items-center">
          <span className="text-caption text-[var(--ds-fg-muted)]">0 results</span>
          <span className="text-caption text-[var(--ds-danger-text)]">…and no visible filters</span>
        </Stack>
      ),
    },
    {
      title: 'Do not wrap chips onto four lines',
      why: 'A filter bar taller than the results is not a filter bar. Past about eight, collapse into a "+5 more" popover or move to a proper filter panel.',
      render: (
        <Row gap="sm">
          {[...FILTERS, ...FILTERS, ...FILTERS].map((f, i) => (
            <Chip key={i} size="sm">
              {f}
            </Chip>
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not make the remove button the whole chip',
      why: 'If clicking anywhere removes it, the user cannot click the chip to edit or re-select. The × is a separate target for exactly that reason.',
      render: (
        <Chip as="span" selected className="cursor-pointer line-through opacity-70">
          Click anywhere to delete
        </Chip>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The unselected border must reach 3:1 — it is the only thing showing an interactive object is present.',
      'Selected chips change fill, border and text colour together, so the state survives greyscale.',
      'The remove × must reach 3:1 against the chip fill. At 11px it is easy to make it too faint.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to each chip, then to its remove button. Both are focusable.' },
      { keys: 'Space / Enter', does: 'Toggles a filter chip.' },
      { keys: 'Backspace / Delete', does: 'On a focused removable chip, removes it and moves focus to the next one.' },
      { keys: 'Backspace', does: 'In a chip input with an empty field, removes the last token.' },
      { keys: '← / →', does: 'Optional roving focus across a long chip row, so Tab does not stop twenty times.' },
    ],
    aria: [
      { attr: 'aria-pressed', on: 'Filter chips', note: 'They are independent toggles. aria-selected would imply a single-selection listbox.' },
      { attr: 'aria-label', on: 'The remove button', note: 'Must include the value: "Remove Production". A bare "Remove" is useless in a row of twelve.' },
      { attr: 'aria-live="polite"', on: 'The result count', note: 'Announces the effect of the filter. Without it, a screen-reader user toggles a chip and hears nothing.' },
      { attr: 'role="group"', on: 'A filter bar', note: 'With aria-label="Filters", so the whole bar can be skipped or targeted.' },
      { attr: 'aria-describedby', on: 'A chip input', note: 'Points at the "Enter or comma to add" instruction.' },
    ],
    focus:
      'The chip and its remove button are separate focus stops. Removing a chip must move focus to the next chip, or to the input if it was the last one — never to <body>.',
    screenReader: [
      'A filter chip announces as "Production, toggle button, pressed". The word "pressed" is what aria-pressed buys you.',
      'After removing a chip, announce what happened: "Production removed, 2 filters remaining".',
      'In a chip input, announce the token count so the user knows how many recipients they have added without tabbing through all of them.',
    ],
    touch:
      'A 28px chip needs a padded 44px target. In a wrapped row, keep the row gap at 8px so adjacent chips are not mis-tapped, and make the remove button at least 24px on touch.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Chip } from '@/ui/Display'

// Filter chips: independent toggles, aria-pressed
{filters.map((f) => (
  <Chip
    key={f.id}
    selected={active.includes(f.id)}
    onClick={() => toggle(f.id)}
  >
    {f.label}
  </Chip>
))}

// Always announce the effect
<p aria-live="polite" className="sr-only">
  Showing {results.length} of {total} results
</p>

// Input chips: Enter or comma commits, Backspace removes the last
<input
  value={draft}
  onChange={(e) => setDraft(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Backspace' && draft === '') {
      setTokens((t) => t.slice(0, -1))
    }
  }}
  onBlur={commit}          // never lose what they typed
/>

// Removing must move focus somewhere sensible
function remove(id: string, index: number) {
  setTokens((t) => t.filter((x) => x.id !== id))
  const next = chipRefs.current[index + 1] ?? inputRef.current
  next?.focus()
}`,
    },
    html: {
      lang: 'html',
      code: `<div role="group" aria-label="Filters">
  <button type="button" class="ds-chip" aria-pressed="true">Production</button>
  <button type="button" class="ds-chip" aria-pressed="false">Staging</button>
</div>

<!-- Removable token. Two targets, two names. -->
<span class="ds-chip ds-chip--selected">
  <img class="ds-chip__avatar" src="…" alt="" />
  ada@example.com
  <button type="button" class="ds-chip__remove" aria-label="Remove ada@example.com">
    <svg aria-hidden="true">…</svg>
  </button>
</span>

<p class="sr-only" role="status" aria-live="polite">
  Showing 31 of 248 deployments
</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  block-size: 28px;                 /* between a badge (22) and a button (36) */
  padding-inline: 10px;
  border: 1px solid var(--ds-border);
  border-radius: 999px;
  background: var(--ds-surface);
  color: var(--ds-fg-secondary);
  font-size: 13px;
  font-weight: 500;
  transition: all 120ms var(--ease-standard);
}

.ds-chip:hover:not(:disabled) {
  border-color: var(--ds-border-strong);
  background: var(--ds-layer-hover);
  color: var(--ds-fg);
}

/* Three changes at once — a tint alone is too subtle in a row of twelve */
.ds-chip[aria-pressed='true'],
.ds-chip--selected {
  border-color: var(--ds-accent-border);
  background: var(--ds-accent-subtle);
  color: var(--ds-accent-text);
}

.ds-chip:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Adornments reduce padding on their own side only */
.ds-chip:has(.ds-chip__avatar) { padding-inline-start: 4px; }
.ds-chip:has(.ds-chip__remove) { padding-inline-end: 4px; }

.ds-chip__remove {
  inline-size: 18px;
  block-size: 18px;
  border-radius: 999px;
  display: grid;
  place-items: center;
}
.ds-chip__remove:hover { background: var(--ds-layer-active); }

@media (pointer: coarse) {
  .ds-chip__remove { inline-size: 24px; block-size: 24px; }
}`,
    },
    api: [
      {
        name: 'Chip',
        props: [
          { name: 'selected', type: 'boolean', default: 'false', description: 'Sets aria-pressed and the selected skin.' },
          { name: 'onRemove', type: '() => void', description: 'Adds a remove button with its own accessible name and focus stop.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph, 13px.' },
          { name: 'avatar', type: 'ReactNode', description: 'Leading avatar. Reduces the left padding to 6px.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '24px or 28px tall.' },
          { name: 'as', type: "'button' | 'span'", default: "'button'", description: "'span' for a static token that is only removable, not toggleable." },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Only meaningful when as="button".' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order filter chips by usage, not alphabetically. The two or three that everyone uses should be first and never move.',
      'Persist the active filter set in the URL. Filters that vanish on refresh cannot be shared or bookmarked, which is most of what filters are for.',
      'When a filter yields zero results, keep the chips visible and put the "clear filters" action inside the empty state. The user needs the escape hatch where they are looking.',
      'Chip inputs should accept a pasted comma- or newline-separated list and split it into tokens. People paste ten emails at once far more often than they type them.',
    ],
    performance: [
      'Debounce the query that filter chips trigger by about 200ms. Toggling three chips quickly should be one request, not three.',
      'For a very long chip row, use roving tabindex so Tab does not stop twenty times before reaching the results.',
      'Avoid animating chip layout on toggle. A wrapped row reflows when a chip changes width, and animating that reflow is both expensive and disorienting.',
    ],
    mistakes: [
      'Using aria-selected instead of aria-pressed, which makes assistive tech describe a multi-filter bar as a single-choice list.',
      'Letting the remove button’s click bubble to the chip, so removing also toggles the filter.',
      'Losing focus to <body> after removing a chip, which drops a keyboard user back to the top of the page.',
      'Giving every remove button the accessible name "Remove", so a screen-reader user hears twelve identical buttons.',
      'Making a chip look selected on hover, so users cannot tell which filters are actually active while the pointer is in the bar.',
    ],
    realWorld: [
      'Filter chips work up to about eight options. Past that, users stop scanning and start missing filters — move to a panel with grouped facets and echo the applied set as chips.',
      'In an email or invite field, validate tokens as they commit and mark invalid ones in red rather than refusing them. People fix a visible mistake; they get stuck on a field that will not accept input.',
      'Log which filter combinations are used. The top three usually deserve to become saved views, which removes the filtering step entirely.',
      'On mobile, a horizontally scrolling chip row is acceptable if the first chip is partially cut off — that overflow cue is what tells users to scroll.',
    ],
  },
})

function AppliedDemo() {
  const [applied, setApplied] = React.useState([
    { id: 'env', label: 'Environment: Production' },
    { id: 'status', label: 'Status: Failed' },
    { id: 'time', label: 'Last 24 hours' },
  ])

  return (
    <Stack gap="sm" className="w-full">
      <div className="flex items-center gap-3">
        <TextInput
          startIcon={<Search />}
          placeholder="Search deployments…"
          className="max-w-xs"
        />
        <Chip icon={<Filter size={13} />}>Filters</Chip>
      </div>
      {applied.length > 0 && (
        <Row gap="sm" align="center">
          <span className="text-caption text-[var(--ds-fg-muted)]">Applied:</span>
          {applied.map((a) => (
            <Chip
              key={a.id}
              as="span"
              size="sm"
              selected
              onRemove={() => setApplied((prev) => prev.filter((x) => x.id !== a.id))}
            >
              {a.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => setApplied([])}
            className="text-caption text-[var(--ds-accent-text)] underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </Row>
      )}
    </Stack>
  )
}
