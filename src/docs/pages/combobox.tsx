import * as React from 'react'
import { Globe, Server } from 'lucide-react'
import { Field } from '@/ui/Input'
import { Combobox, Select } from '@/ui/Select'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)', description: '18ms · 4 zones', group: 'Americas', icon: <Server size={14} /> },
  { value: 'us-west-2', label: 'US West (Oregon)', description: '64ms · 4 zones', group: 'Americas', icon: <Server size={14} /> },
  { value: 'eu-west-2', label: 'Europe (London)', description: '11ms · 3 zones', group: 'Europe', icon: <Globe size={14} /> },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)', description: '22ms · 3 zones', group: 'Europe', icon: <Globe size={14} /> },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)', description: '119ms · 3 zones', group: 'Asia Pacific', icon: <Globe size={14} /> },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', description: '186ms · 4 zones', group: 'Asia Pacific', icon: <Globe size={14} /> },
]

function Playground() {
  const [value, setValue] = React.useState<string | null>('eu-west-2')
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [loading, setLoading] = React.useState(false)
  const [descriptions, setDescriptions] = React.useState(true)

  const options = descriptions ? REGIONS : REGIONS.map(({ description: _d, ...o }) => o)

  return (
    <PreviewStage
      label="Playground"
      minHeight={240}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <KnobToggle checked={descriptions} onChange={setDescriptions} label="Descriptions" />
          <KnobToggle checked={loading} onChange={setLoading} label="Loading" />
        </div>
      }
      code={`<Field label="Region" description="Type to filter 24 regions.">
  <Combobox
    size="${size}"
    options={regions}
    value={value}
    onChange={setValue}
    onQueryChange={fetchRegions}${loading ? '\n    loading' : ''}
    aria-label="Region"
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field label="Region" description="Type to filter. 24 regions available.">
          <Combobox
            size={size}
            options={options}
            value={value}
            onChange={setValue}
            loading={loading}
            aria-label="Region"
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'combobox',
    title: 'Combobox',
    tagline:
      'Type to filter a list — and, when the field allows it, commit a value that was never in the list. The control that turns a hundred options into three keystrokes.',
    keywords: ['autocomplete', 'typeahead', 'autosuggest', 'searchable select', 'filter', 'async'],
  },

  overview: {
    purpose:
      'A combobox is a text field joined to a list. The user types, the list narrows, and they pick from what is left — turning a scroll through a hundred options into three keystrokes and a press of Enter. It is the right control the moment a Select stops being scannable, which happens somewhere around fifteen options.',
    whenToUse: [
      'More than about fifteen options, where scrolling a Select stops being faster than typing.',
      'Options the user already knows the name of — a country, a repository, a person.',
      'Server-driven option sets that are too large to send at once.',
      'Fields that may accept a value not yet in the list, such as a new tag.',
    ],
    whenNotToUse: [
      {
        text: 'There are fewer than about fifteen options.',
        instead: 'a Select — typing is slower than scanning a short visible list',
        to: '#/select',
      },
      {
        text: 'The user may pick several.',
        instead: 'a Multi-select',
        to: '#/multi-select',
      },
      {
        text: 'The result is a set of things rather than one value.',
        instead: 'a Search Input',
        to: '#/search-input',
      },
      {
        text: 'The user is running a command.',
        instead: 'a Command Palette',
        to: '#/command-palette',
      },
    ],
    reasoning: (
      <>
        <p>
          The defining rule is that <strong>focus never leaves the input</strong>. The highlighted
          option is tracked with <code>aria-activedescendant</code>, not by moving DOM focus, so
          the user can keep typing to refine while the highlight moves. Moving real focus into the
          list is the single most common implementation mistake, and it makes the arrow keys and
          the keyboard fight each other.
        </p>
        <p>
          Decide early whether the field is <strong>closed or open</strong>. A closed combobox
          accepts only values from the list and must clear or restore on blur when the text does
          not match one. An open combobox commits whatever was typed. Silently keeping unmatched
          text in a closed field is how a form submits a region that does not exist.
        </p>
        <p>
          Filter on a substring, not a prefix, and highlight the match. "york" should find "New
          York"; showing <em>why</em> each row matched is what makes a fuzzy result feel deliberate
          rather than random.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'vs-select',
        title: 'Combobox or Select',
        description:
          'The crossover is around fifteen options. Below it, scanning a visible list beats typing; above it, the user is scrolling to find something they could have named in three letters.',
        render: (
          <PreviewStage minHeight={220} center={false}>
            <Grid min="17rem">
              <Cell label="6 options" sub="Select" tone="good">
                <Field label="Environment">
                  <Select
                    options={[
                      { value: 'prod', label: 'Production' },
                      { value: 'stage', label: 'Staging' },
                      { value: 'dev', label: 'Development' },
                    ]}
                    value="prod"
                    onChange={() => {}}
                    aria-label="Environment"
                  />
                </Field>
              </Cell>
              <Cell label="24 options" sub="Combobox" tone="good">
                <Field label="Region">
                  <Combobox
                    options={REGIONS}
                    value="eu-west-2"
                    onChange={() => {}}
                    aria-label="Region"
                  />
                </Field>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'async',
        title: 'Async options',
        description:
          'While a request is in flight, the field says so. An empty panel during a fetch is indistinguishable from a query that matched nothing, and the user retypes.',
        render: (
          <PreviewStage minHeight={200} center={false}>
            <div className="w-full max-w-sm">
              <Field label="Repository" description="Searching GitHub…">
                <Combobox options={[]} value={null} onChange={() => {}} loading aria-label="Repository" />
              </Field>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'grouped',
        title: 'Grouped options',
        description:
          'Group headers survive filtering — a group with no remaining matches disappears entirely rather than sitting empty above a gap.',
        render: (
          <PreviewStage minHeight={240} center={false}>
            <div className="w-full max-w-sm">
              <Field label="Region" description="Grouped by continent.">
                <Combobox options={REGIONS} value="ap-south-1" onChange={() => {}} aria-label="Grouped region" />
              </Field>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'empty',
        title: 'No matches',
        description:
          'Name the query and offer the way forward. For an open combobox that means "Create «query»"; for a closed one it means saying plainly that nothing matched.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Closed" tone="good">
                <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-4 text-center">
                  <p className="text-body-sm text-[var(--ds-fg-muted)]">No regions match “zzz”.</p>
                </div>
              </Cell>
              <Cell label="Open" tone="good">
                <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1.5">
                  <span className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-2 py-1.5 text-label text-[var(--ds-accent-text)]">
                    Create “infrastructure”
                  </span>
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <div className="w-52"><Combobox options={REGIONS} value={null} onChange={() => {}} aria-label="a" /></div> },
      { label: 'Selected', render: <div className="w-52"><Combobox options={REGIONS} value="eu-west-2" onChange={() => {}} aria-label="b" /></div> },
      { label: 'Loading', render: <div className="w-52"><Combobox options={[]} value={null} onChange={() => {}} loading aria-label="c" /></div> },
      { label: 'No matches', render: <div className="w-52"><Combobox options={[]} value={null} onChange={() => {}} emptyText="No regions match" aria-label="d" /></div> },
      { label: 'Small', render: <div className="w-52"><Combobox size="sm" options={REGIONS} value="us-east-1" onChange={() => {}} aria-label="e" /></div> },
      { label: 'Large', render: <div className="w-52"><Combobox size="lg" options={REGIONS} value="us-east-1" onChange={() => {}} aria-label="f" /></div> },
      {
        label: 'Option idle',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <Globe size={14} className="text-[var(--ds-fg-muted)]" /> Europe (London)
          </span>
        ),
      },
      {
        label: 'Option active',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-2 py-1.5 text-label text-[var(--ds-fg)]">
            <Globe size={14} className="text-[var(--ds-accent-text)]" /> Europe (London)
          </span>
        ),
      },
      {
        label: 'Match highlight',
        render: (
          <span className="w-52 text-label text-[var(--ds-fg-secondary)]">
            Europe (<b className="bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">Lon</b>don)
          </span>
        ),
      },
      { label: 'Group header', render: <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Europe</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Field label="Region" description="Type to filter. 24 regions available.">
          <Combobox options={REGIONS} value="eu-west-2" onChange={() => {}} aria-label="Anatomy" />
        </Field>
      </div>
    ),
    caption:
      'A text field that owns the keyboard, a panel that never takes focus, and a highlight tracked by aria-activedescendant.',
    parts: [
      {
        n: 1,
        label: 'Input',
        value: '36px, identical to a text field',
        kind: 'size',
        note: 'It is a real text input, which is why it can hold a caret and a partial query. That is the entire difference from a Select.',
      },
      {
        n: 2,
        label: 'Chevron',
        value: '16px, trailing',
        kind: 'shape',
        note: 'Distinguishes it from a plain text field. Without it, users do not know a list exists until they type something.',
      },
      {
        n: 3,
        label: 'Panel offset',
        value: '6px below',
        kind: 'space',
        note: 'Close enough to read as attached, far enough that the input’s focus halo is not clipped.',
      },
      {
        n: 4,
        label: 'Panel height',
        value: 'max 256px, ~8 rows',
        kind: 'size',
        note: 'Fixed, so the panel does not resize as the query narrows and move the row under the pointer.',
      },
      {
        n: 5,
        label: 'Option row',
        value: '30px, 44px with a description',
        kind: 'size',
        note: 'Dense, because the list is transient and scanned rather than acted on individually.',
      },
      {
        n: 6,
        label: 'Match highlight',
        value: 'Accent tint on the substring',
        kind: 'color',
        note: 'Explains why a row is in the list. Without it a fuzzy match reads as a random result.',
      },
      {
        n: 7,
        label: 'Active row',
        value: 'Accent fill, no focus',
        kind: 'color',
        note: 'Tracked by aria-activedescendant. DOM focus stays in the input for the entire interaction.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Input fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Input border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Active row fill and match highlight' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Highlighted substring' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel surface' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Descriptions, group headers, chevron' },
    { category: 'spacing', token: 'panel offset', value: '6px', usedFor: 'Gap between input and panel' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Input corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Panel corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
    { category: 'motion', token: 'debounce', value: '300ms', usedFor: 'Async option requests' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 30px 0 10px', type: '13px', use: 'Table filters and dense forms.' },
    { name: 'Medium', height: '36px', padding: '0 34px 0 12px', type: '15px', minWidth: '12rem', use: 'The default.' },
    { name: 'Large', height: '44px', padding: '0 38px 0 14px', type: '16px', use: 'Touch layouts and single-field pages.' },
    { name: 'Panel', height: 'max 256px', maxWidth: 'Matches the input', use: 'About 8 rows. Fixed height so it never resizes as the query narrows.' },
    { name: 'Option', height: '30px', padding: '0 8px', touch: '44px on coarse pointers', use: '44px when a description is present, at every pointer type.' },
  ],

  do: [
    {
      title: 'Keep focus in the input',
      why: 'The user must be able to keep typing while the highlight moves. Move DOM focus into the list and the next keystroke goes to an option instead of the query.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="combobox" aria-activedescendant="opt-3"
        </code>
      ),
    },
    {
      title: 'Filter on a substring and show the match',
      why: '"york" should find "New York". Highlighting the matched characters explains why each row is there, which is what makes the result feel intentional.',
      render: (
        <span className="text-label text-[var(--ds-fg-secondary)]">
          New <b className="bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">York</b>
        </span>
      ),
    },
    {
      title: 'Restore the last valid value on blur',
      why: 'In a closed combobox, half-typed text that stays in the field looks like a selection. Restore the previous value, or clear it and say so.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onBlur → matched ? commit() : restore(lastValid)
        </code>
      ),
    },
    {
      title: 'Say when a request is in flight',
      why: 'An empty panel during a fetch is indistinguishable from a query that matched nothing. The user retypes the thing that was already working.',
      render: (
        <div className="w-full max-w-xs">
          <Combobox options={[]} value={null} onChange={() => {}} loading aria-label="loading" />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not move focus into the list',
      why: 'The user is mid-query. Once focus leaves the input, the next character they type goes nowhere useful and the interaction model breaks.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          ArrowDown → option.focus() → typing stops working
        </span>
      ),
    },
    {
      title: 'Do not use one for six options',
      why: 'Typing is slower than scanning a visible list. A combobox over a short set adds a keyboard step to a decision that could have been made by eye.',
      render: (
        <div className="w-full max-w-xs">
          <Combobox
            options={[
              { value: 'a', label: 'Small' },
              { value: 'b', label: 'Medium' },
              { value: 'c', label: 'Large' },
            ]}
            value="b"
            onChange={() => {}}
            aria-label="too few"
          />
        </div>
      ),
    },
    {
      title: 'Do not leave unmatched text in a closed field',
      why: 'It looks like a selection and submits as nothing. The user finds out at validation, several fields later, with no idea which one is wrong.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          value = null · field shows “Eur” · submit → “Region is required”
        </span>
      ),
    },
    {
      title: 'Do not resize the panel as results narrow',
      why: 'A panel that shrinks from eight rows to two moves everything under the pointer mid-click. Fix the height and scroll inside it.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <div className="h-20 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
          <div className="h-7 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The match highlight must reach 4.5:1 as text on its tint — it is the part of the row the user is reading.',
      'The active row must be distinguishable from idle rows without relying on colour alone, since it is the only indication of what Enter will select.',
      'Option descriptions are content and owe 4.5:1, even though they read as secondary.',
      'The chevron owes 3:1 — it is the only signal that a list exists behind a field that otherwise looks like plain text input.',
    ],
    keyboard: [
      { keys: '↓', does: 'Opens the panel and moves the highlight to the first option. Never moves DOM focus.' },
      { keys: '↑ / ↓', does: 'Moves the highlight, wrapping at both ends.' },
      { keys: 'Enter', does: 'Commits the highlighted option. With nothing highlighted, commits the typed text in an open combobox and does nothing in a closed one.' },
      { keys: 'Esc', does: 'Closes the panel on the first press and clears the query on the second.' },
      { keys: 'Tab', does: 'Commits the highlighted option and moves on. Tab must never leave a half-typed query behind.' },
      { keys: 'Home / End', does: 'Moves the caret within the query, not the highlight — this is a text field first.' },
      { keys: 'Alt + ↓', does: 'Opens the panel without moving the highlight, so the full list can be reviewed.' },
    ],
    aria: [
      { attr: 'role="combobox"', on: 'The input', note: 'With aria-expanded and aria-controls. This is the pattern; an input beside a div of results announces nothing.' },
      { attr: 'aria-activedescendant', on: 'The input', note: 'The id of the highlighted option. This is what moves the screen-reader cursor without moving DOM focus.' },
      { attr: 'aria-autocomplete="list"', on: 'The input', note: '"both" only if you also inline-complete the text, which most fields should not.' },
      { attr: 'role="listbox" / "option"', on: 'The panel and rows', note: 'With aria-selected on the highlighted row. Group headers must sit outside the options.' },
      { attr: 'aria-live="polite"', on: 'A result count', note: '"6 regions available". Without it a screen-reader user types and hears nothing.' },
      { attr: 'aria-busy', on: 'The panel', note: 'While a request is in flight, so silence reads as loading rather than as no results.' },
    ],
    focus:
      'DOM focus stays on the input from open to close. Committing an option keeps focus in the input with the value filled; Tab commits and moves on. Closing the panel must never send focus to the body.',
    screenReader: [
      'Announce the option count after typing settles, debounced by about 300ms: "6 regions available".',
      'Each option announces its position: "Europe (London), 3 of 6". Group headers must not be announced as options.',
      'A no-match state must be announced. Silence is indistinguishable from a request that never fired.',
    ],
    touch:
      'The on-screen keyboard covers the lower half of the screen, so the panel must render above the field when there is not room below — or, better, become a full-screen sheet on small viewports. Option rows go to 44px. Set inputmode appropriately: a numeric combobox should not open a full keyboard.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Combobox } from '@/ui/Select'

<Field label="Region" description="Type to filter. 24 regions available.">
  <Combobox
    options={regions}
    value={region}
    onChange={setRegion}
    onQueryChange={(q) => search(q)}   // debounced inside
    loading={isFetching}
    aria-label="Region"
  />
</Field>

// Async, with the two guards that matter: debounce the request, and drop
// responses that no longer match what the user has typed.
const [query, setQuery] = React.useState('')
const debounced = useDebounced(query, 300)

React.useEffect(() => {
  if (!debounced) return
  const ac = new AbortController()
  fetchOptions(debounced, ac.signal).then(setOptions).catch(ignoreAbort)
  return () => ac.abort()
}, [debounced])

// Closed combobox: unmatched text must not survive blur. Leaving it in the
// field looks like a selection and submits as nothing.
function onBlur() {
  const match = options.find((o) => o.label.toLowerCase() === query.toLowerCase())
  if (match) return onChange(match.value)
  setQuery(labelOf(value) ?? '')       // restore the last valid selection
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-combobox">
  <input
    id="region"
    role="combobox"
    aria-expanded="true"
    aria-controls="region-list"
    aria-activedescendant="region-opt-3"
    aria-autocomplete="list"
    aria-describedby="region-count"
    autocomplete="off"
  />
  <svg class="ds-combobox__chevron" aria-hidden="true">…</svg>
</div>

<ul id="region-list" role="listbox" aria-label="Regions">
  <!-- Group headers sit OUTSIDE the options or they are announced as results. -->
  <li role="presentation" class="ds-combobox__group">Europe</li>

  <li id="region-opt-3" role="option" aria-selected="true">
    Europe (<mark>Lon</mark>don)
    <span class="ds-combobox__desc">11ms · 3 zones</span>
  </li>
</ul>

<p id="region-count" class="sr-only" role="status" aria-live="polite">
  6 regions available
</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-combobox { position: relative; }

.ds-combobox input {
  inline-size: 100%;
  block-size: 36px;                  /* identical to a text field: it is one */
  padding-inline: 12px 34px;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

/* Without this the field looks like plain text input and nobody discovers
   the list until they happen to type. */
.ds-combobox__chevron {
  position: absolute;
  inset-inline-end: 10px;
  inset-block-start: 50%;
  translate: 0 -50%;
  pointer-events: none;
  color: var(--ds-fg-muted);
}

.ds-combobox__panel {
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(100% + 6px);
  /* Fixed. A panel that shrinks as results narrow moves the row the pointer
     is aiming at. */
  max-block-size: 256px;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
}

[role='option'][aria-selected='true'] {
  background: var(--ds-accent-subtle);
  color: var(--ds-fg);
}

/* The highlight explains WHY the row matched. */
[role='option'] mark {
  background: var(--ds-accent-subtle);
  color: var(--ds-accent-text);
}

@media (pointer: coarse) {
  [role='option'] { min-block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'Combobox',
        props: [
          { name: 'options', type: 'Option[]', required: true, description: 'The currently filtered set. For async fields this is whatever the last settled request returned.' },
          { name: 'value', type: 'string | null', required: true, description: 'The committed value. Null means nothing is selected, which is distinct from an empty query.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fires on commit — Enter, click, or Tab on a highlighted option.' },
          { name: 'onQueryChange', type: '(q: string) => void', description: 'For async option sets. Debounce inside, and drop stale responses.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a loading row. Never leave the panel silently empty during a fetch.' },
          { name: 'emptyText', type: 'string', default: "'No matches'", description: 'Should name the query. An open combobox shows "Create «query»" here instead.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Matches the shared control scale.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Sort exact prefix matches above substring matches. Typing "us" should put "US East" above "Australia" even though both contain the letters.',
      'Show the full list on focus before anything is typed. It tells the user what kind of thing goes in the field, which a blank panel does not.',
      'Cache results per query string. Backspacing through a query should not re-request every intermediate state.',
      'For an open combobox, put "Create «query»" as the last row rather than the first — the user is looking for an existing value first.',
      'Preserve the caret when you programmatically set the input value. Naive implementations jump it to the end on every keystroke.',
    ],
    performance: [
      'Debounce async requests by about 300ms and cancel in-flight ones with an AbortController. Without cancellation a fast typist has six requests racing to render.',
      'Filter client-side under about 1,000 options. A round trip to filter a list already in memory is latency for nothing.',
      'Virtualise past roughly 200 visible rows, and add aria-setsize and aria-posinset when you do.',
      'Memoise the filtered list on the query and the option array. Re-filtering on every render is the usual cause of a laggy combobox.',
    ],
    mistakes: [
      'Moving DOM focus into the list, so typing after the first arrow key goes nowhere.',
      'Leaving unmatched text in a closed field, which looks selected and submits as nothing.',
      'No loading state, so a slow fetch is indistinguishable from no results.',
      'A panel that resizes as results narrow, moving the row under the pointer.',
      'Prefix-only matching, which fails on "york" for "New York".',
      'Group headers marked up as options, so they are announced as selectable results.',
      'No result count in a live region, leaving screen-reader users with no feedback at all.',
    ],
    realWorld: [
      'The crossover from Select to Combobox is around fifteen options, but it depends on familiarity — users know country names and will type them; they do not know your internal region codes and will scroll.',
      'Country and timezone pickers are the canonical case, and both need synonym matching: "USA", "United States" and "US" must all find the same row.',
      'For async fields, show the last successful results while a new request is in flight rather than emptying the panel. Perceived speed comes from never showing nothing.',
      'If users routinely type a value that is not in your list, that is data telling you the list is incomplete — not that you need an open combobox.',
    ],
  },
})
