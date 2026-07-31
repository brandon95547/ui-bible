import * as React from 'react'
import { Building2, CircleDot, Globe, Server, Shield } from 'lucide-react'
import { Combobox, MultiSelect, NativeSelect, Select, type Option } from '@/ui/Select'
import { Field } from '@/ui/Input'
import { Knob, KnobSelect, KnobToggle, PreviewStage, defineDoc } from '../framework/kit'

const REGIONS: Option[] = [
  { value: 'us-east-1', label: 'US East (N. Virginia)', description: '18ms · 4 zones', group: 'Americas', icon: <Server size={14} /> },
  { value: 'us-west-2', label: 'US West (Oregon)', description: '64ms · 4 zones', group: 'Americas', icon: <Server size={14} /> },
  { value: 'sa-east-1', label: 'South America (São Paulo)', description: '148ms · 3 zones', group: 'Americas', icon: <Server size={14} /> },
  { value: 'eu-west-2', label: 'Europe (London)', description: '11ms · 3 zones', group: 'Europe', icon: <Globe size={14} /> },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)', description: '22ms · 3 zones', group: 'Europe', icon: <Globe size={14} /> },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)', description: '119ms · 3 zones', group: 'Asia Pacific', icon: <Globe size={14} /> },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', description: '186ms · 4 zones', group: 'Asia Pacific', icon: <Globe size={14} /> },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)', description: '241ms · 3 zones', group: 'Asia Pacific', disabled: true, icon: <Globe size={14} /> },
]

const ROLES: Option[] = [
  { value: 'admin', label: 'Administrator', description: 'Full access, including billing', icon: <Shield size={14} /> },
  { value: 'maintainer', label: 'Maintainer', description: 'Deploy and manage services', icon: <CircleDot size={14} /> },
  { value: 'viewer', label: 'Viewer', description: 'Read-only across the workspace', icon: <Building2 size={14} /> },
]

function Playground() {
  const [kind, setKind] = React.useState<'native' | 'listbox' | 'multi' | 'combobox'>('listbox')
  const [searchable, setSearchable] = React.useState(true)
  const [value, setValue] = React.useState<string | null>('eu-west-2')
  const [values, setValues] = React.useState<string[]>(['us-east-1', 'eu-west-2'])

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Kind">
            <KnobSelect
              value={kind}
              onChange={setKind}
              options={['native', 'listbox', 'multi', 'combobox'] as const}
            />
          </Knob>
          {kind === 'listbox' && (
            <KnobToggle checked={searchable} onChange={setSearchable} label="Searchable" />
          )}
        </div>
      }
    >
      <div className="w-full max-w-sm">
        <Field
          label="Deployment region"
          htmlFor="pg-select"
          description="Latency is measured from your current location."
        >
          {kind === 'native' && (
            <NativeSelect
              id="pg-select"
              options={REGIONS}
              value={value ?? ''}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          {kind === 'listbox' && (
            <Select
              options={REGIONS}
              value={value}
              onChange={setValue}
              searchable={searchable}
              aria-label="Deployment region"
            />
          )}
          {kind === 'multi' && (
            <MultiSelect
              options={REGIONS}
              values={values}
              onChange={setValues}
              aria-label="Deployment regions"
            />
          )}
          {kind === 'combobox' && (
            <Combobox
              options={REGIONS}
              value={value}
              onChange={setValue}
              aria-label="Deployment region"
            />
          )}
        </Field>
      </div>
    </PreviewStage>
  )
}

function AsyncDemo() {
  const [query, setQuery] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<Option[]>([])
  const [value, setValue] = React.useState<string | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const search = (q: string) => {
    setQuery(q)
    clearTimeout(timer.current)
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    // Debounced by 320ms. Without it, every keystroke is a request and the
    // responses race each other back.
    timer.current = setTimeout(() => {
      setResults(
        REGIONS.filter((r) => r.label.toLowerCase().includes(q.toLowerCase())).map((r) => ({
          ...r,
          description: 'from the server',
        })),
      )
      setLoading(false)
    }, 320)
  }

  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="w-full max-w-sm">
        <Field
          label="Search regions"
          htmlFor="async"
          description={
            loading ? 'Searching…' : query ? `${results.length} results` : 'Type at least one character.'
          }
        >
          <Combobox
            options={results}
            value={value}
            onChange={setValue}
            onQueryChange={search}
            loading={loading}
            emptyText={query ? 'No regions match' : 'Start typing to search'}
            aria-label="Search regions"
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'dropdowns',
    title: 'Dropdowns',
    group: 'Inputs & Forms',
    tagline:
      'Four different controls that all look like a box with a chevron. Picking the wrong one is the most common form mistake there is.',
    keywords: ['select', 'combobox', 'listbox', 'picker', 'autocomplete', 'typeahead', 'multi-select', 'async'],
  },

  overview: {
    purpose:
      'A dropdown trades screen space for a hidden list. That trade is only worth making when the options are too numerous to show, too well known to need showing, or too unimportant to deserve the space. Every dropdown is a small act of hiding, and it should be justified.',
    whenToUse: [
      'There are more than about six known options and the user recognises them by name.',
      'The choice is secondary to the task and does not deserve permanent screen space.',
      'The option set is large or dynamic and needs filtering or server-side search.',
      'Multiple values may be selected from a long list, and the chosen ones need to stay visible.',
    ],
    whenNotToUse: [
      {
        text: 'There are two to five options and the labels are short.',
        instead: 'Radio buttons or a segmented control',
        to: '#/radios',
      },
      {
        text: 'The choice is binary.',
        instead: 'a Switch or a Checkbox',
        to: '#/switches',
      },
      {
        text: 'The user is choosing between views rather than setting a value.',
        instead: 'Tabs',
        to: '#/tabs',
      },
      {
        text: 'The options are actions rather than values.',
        instead: 'a Menu or a Split Button',
        to: '#/buttons',
      },
    ],
    reasoning: (
      <>
        <p>
          Start with the <strong>native select</strong> and only leave it when you must. It ships
          with keyboard support, type-ahead, form participation, a native wheel picker on iOS and
          Android, and correct behaviour with every assistive technology — for free, forever. A
          custom listbox has to reimplement every one of those, and in practice most
          implementations get type-ahead and <code>aria-activedescendant</code> wrong.
        </p>
        <p>
          Leave native when you genuinely need rich rows (icons, two-line descriptions, live
          statuses), inline search, multiple selection with visible tokens, or asynchronous loading.
          Those are real reasons. "It does not match the design system" is not — style the native
          one instead.
        </p>
        <p>
          The distinction users care about is <strong>select versus combobox</strong>. A select says
          "choose from this list". A combobox says "type and I will help you find it". If the list
          is long enough that scanning it is work, the combobox is faster; if it is short, the
          combobox adds a typing step to a choice that could have been one click.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'four-kinds',
        title: 'The four kinds',
        description:
          'Same data, four controls. The right choice depends on list size, whether rows need structure, and whether more than one value is allowed.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-5 sm:grid-cols-2">
              <Field label="Native select" htmlFor="k-native" description="Under ~15 flat options. Always the first choice.">
                <NativeSelect id="k-native" options={ROLES} defaultValue="maintainer" />
              </Field>
              <Field label="Listbox" htmlFor="k-list" description="Rich rows: icons, descriptions, groups.">
                <SelectDemo />
              </Field>
              <Field label="Multi-select" htmlFor="k-multi" description="Selections stay visible as removable chips.">
                <MultiDemo />
              </Field>
              <Field label="Combobox" htmlFor="k-combo" description="Type to filter. Best past ~20 options.">
                <ComboDemo />
              </Field>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'async',
        title: 'Asynchronous options',
        description:
          'Debounced at 320ms, previous results stay visible while loading, and the result count is announced. Blanking the list on every keystroke is what makes async pickers feel broken.',
        render: <AsyncDemo />,
      },
      {
        id: 'grouped',
        title: 'Grouped and searchable',
        description:
          'Group headings are presentational — they are not selectable and are skipped by arrow keys. Search filters across the label and the description.',
        render: (
          <PreviewStage center={false} minHeight={240} allowResize={false}>
            <div className="w-full max-w-sm">
              <SelectDemo searchable />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Closed', render: <MiniSelect /> },
      { label: 'Placeholder', render: <MiniSelect empty /> },
      { label: 'Focus', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-accent)] bg-[var(--ds-surface-inset)] px-3 py-2 text-body-sm shadow-[0_0_0_3px_var(--ds-accent-subtle)]">Maintainer</div> },
      { label: 'Disabled', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-layer-hover)] px-3 py-2 text-body-sm opacity-50">Maintainer</div> },
      { label: 'Error', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] px-3 py-2 text-body-sm">Choose a role</div> },
      { label: 'Multi', render: <MultiDemo compact /> },
      { label: 'Loading', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] px-3 py-2 text-body-sm text-[var(--ds-fg-muted)]">Searching…</div> },
      { label: 'Empty', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-4 text-center text-caption text-[var(--ds-fg-muted)]">No results</div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <SelectDemo open />
      </div>
    ),
    caption:
      'Trigger and popover. The popover matches the trigger width so the eye does not have to re-anchor when it opens.',
    parts: [
      {
        n: 1,
        label: 'Trigger height',
        value: '36px',
        kind: 'size',
        note: 'Identical to a text input, so a select and an input on the same row share a baseline. This is the whole reason the control scale is shared.',
      },
      {
        n: 2,
        label: 'Chevron gutter',
        value: '36px right padding',
        kind: 'space',
        note: 'A 16px chevron plus a 12px gutter on each side. Less than this and long option labels collide with the icon.',
      },
      {
        n: 3,
        label: 'Popover offset',
        value: '6px below the trigger',
        kind: 'space',
        note: 'Close enough to read as attached, far enough that the trigger’s focus ring is not clipped by the panel.',
      },
      {
        n: 4,
        label: 'Option row',
        value: '30px, 10px padding',
        kind: 'size',
        note: 'Denser than a form control because it is transient and scanned as a list. Two-line rows go to 44px.',
      },
      {
        n: 5,
        label: 'Max height',
        value: '256px, ~8 rows',
        kind: 'size',
        note: 'Enough to establish that the list scrolls, short enough that the popover does not cover the field it belongs to.',
      },
      {
        n: 6,
        label: 'Selected marker',
        value: 'Check, right aligned',
        kind: 'shape',
        note: 'A check, not just a highlight — highlight is used for the keyboard-active row, and the two states must be distinguishable.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Trigger background' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Popover background' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Active option row' },
    { category: 'color', token: '--ds-accent', usedFor: 'Selected check, focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo, selected chip fill' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Placeholder, chevron, descriptions' },
    { category: 'spacing', token: 'option padding', value: '10px 10px', usedFor: 'Option rows' },
    { category: 'spacing', token: 'popover offset', value: '6px', usedFor: 'Gap between trigger and panel' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Trigger corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Popover corners' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Option row corners — inner radius rule' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Popover elevation' },
    { category: 'motion', token: 'scale-in', value: '140ms emphasized', usedFor: 'Popover entrance, origin top' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px', radius: '8px', icon: '14px', type: '13px', minWidth: '120px', use: 'Table filters, toolbars, inline controls.' },
    { name: 'Medium', height: '36px', padding: '0 12px', radius: '8px', icon: '15px', type: '15px', minWidth: '160px', maxWidth: '32rem', use: 'The default for every form.' },
    { name: 'Large', height: '44px', padding: '0 14px', radius: '12px', icon: '17px', type: '17px', minWidth: '200px', use: 'Mobile and touch-first forms.' },
    { name: 'Popover', height: '256px max', padding: '4px', radius: '12px', use: 'About eight single-line rows before it scrolls.' },
    { name: 'Option row', height: '30px / 44px', padding: '6px 10px', radius: '6px', use: '30px for a single line, 44px when a description is present.' },
  ],

  do: [
    {
      title: 'Start native, upgrade only when you need to',
      why: 'The native select gets keyboard, type-ahead, mobile wheel pickers and form participation for free. Every one of those is something a custom listbox has to earn back.',
      render: <NativeSelect options={ROLES} defaultValue="viewer" className="max-w-[15rem]" />,
    },
    {
      title: 'Add search once the list passes about twelve options',
      why: 'Scanning is fast up to roughly ten items and slow after that. A filter input turns a linear scan into a single recognition step.',
      render: (
        <div className="w-full max-w-[15rem]">
          <SelectDemo searchable />
        </div>
      ),
    },
    {
      title: 'Keep multi-select choices visible',
      why: 'Chips inside the control mean the current state is readable without opening anything, and each one is individually removable. A "3 selected" summary makes the user open the list to find out which three.',
      render: <MultiDemo />,
    },
    {
      title: 'Match the popover width to the trigger',
      why: 'The eye is already anchored to the trigger’s left edge. A popover that is wider or narrower forces a re-anchor on every open, which is a small cost paid many times.',
      render: (
        <div className="flex w-full max-w-[15rem] flex-col gap-1.5">
          <div className="h-9 rounded-[var(--radius-md)] border border-[var(--ds-accent)] bg-[var(--ds-surface-inset)]" />
          <div className="h-16 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4" />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a dropdown for three options',
      why: 'A select hides two options behind a click to save about 60px. Radios show everything, are one click instead of two, and are scannable at a glance.',
      render: (
        <div className="w-full max-w-[15rem]">
          <NativeSelect options={ROLES} defaultValue="admin" />
          <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">Three options, hidden.</p>
        </div>
      ),
    },
    {
      title: 'Do not put actions in a select',
      why: 'A select sets a value; a menu performs an action. Choosing "Delete" from a dropdown that then stays showing "Delete" is genuinely confusing.',
      render: (
        <div className="w-full max-w-[15rem]">
          <NativeSelect
            options={[
              { value: 'e', label: 'Edit' },
              { value: 'd', label: 'Duplicate' },
              { value: 'x', label: 'Delete' },
            ]}
            defaultValue="e"
          />
        </div>
      ),
    },
    {
      title: 'Do not clear the list while loading',
      why: 'Blanking the results on every keystroke makes the control flicker and feel broken on a slow connection. Keep the previous results and dim them.',
      render: (
        <div className="w-full max-w-[15rem] rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-6 text-center text-caption text-[var(--ds-fg-muted)]">
          Loading…
        </div>
      ),
    },
    {
      title: 'Do not open a listbox with 400 unfiltered rows',
      why: 'A scroll list of hundreds is not a choice, it is a haystack. Past about twenty options the control must have search, and past a few hundred it must be server-side.',
      render: (
        <div className="w-full max-w-[15rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-b border-[var(--ds-border-subtle)] px-3 py-1.5 text-caption text-[var(--ds-fg-muted)] last:border-0">
              Option {i + 1} of 412
            </div>
          ))}
        </div>
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
      'The trigger border must reach 3:1 against the page — it is the boundary of a control.',
      'The active-row highlight must be distinguishable from the selected-row check. Two rows in different states that look identical is a real usability failure, not a nitpick.',
      'Disabled options at 40% opacity are exempt from contrast, but they must still be visually distinct from enabled ones.',
    ],
    keyboard: [
      { keys: 'Space / Enter / ↓', does: 'Opens the list from the closed trigger.' },
      { keys: '↑ / ↓', does: 'Moves the active option. Skips disabled options and group headings.' },
      { keys: 'Home / End', does: 'First and last option.' },
      { keys: 'Enter', does: 'Selects the active option, closes, and returns focus to the trigger.' },
      { keys: 'Esc', does: 'Closes without changing the value.' },
      { keys: 'Tab', does: 'Closes the list and moves on. It never traps.' },
      { keys: 'a–z', does: 'Type-ahead. Native selects do this for free; a custom listbox must implement it.' },
      { keys: 'Backspace', does: 'On a multi-select with an empty query, removes the last chip.' },
    ],
    aria: [
      { attr: 'role="combobox"', on: 'The trigger', note: 'Plus aria-expanded, aria-haspopup="listbox" and aria-controls pointing at the panel.' },
      { attr: 'role="listbox"', on: 'The panel', note: 'aria-multiselectable when more than one value is allowed.' },
      { attr: 'role="option" + aria-selected', on: 'Each row', note: 'aria-selected is the selection state, not the keyboard-active state.' },
      { attr: 'aria-activedescendant', on: 'The trigger or input', note: 'Points at the highlighted row id. Focus stays on the input, which is what keeps type-ahead working.' },
      { attr: 'aria-autocomplete="list"', on: 'A combobox input', note: 'Tells assistive tech that suggestions appear as the user types.' },
      { attr: 'aria-live="polite"', on: 'A result-count region', note: 'Announces "12 results" after filtering. Without it a screen-reader user has no idea the list changed.' },
    ],
    focus:
      'Focus stays on the trigger or the input for the entire interaction. Moving focus into the list breaks type-ahead and makes Escape ambiguous.',
    screenReader: [
      'Group headings must be presentational, not options. A screen reader that announces "Europe, option 4 of 9" when Europe is a heading is a broken experience.',
      'Announce the result count after filtering, debounced. Announcing on every keystroke floods the queue.',
      'A native select announces its value, role and position in the set automatically. That is a lot of behaviour to give up.',
    ],
    touch:
      'Option rows are 44px on coarse pointers. Native selects should be preferred on mobile wherever possible — the OS picker is faster and more familiar than any custom sheet.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { NativeSelect, Select, MultiSelect, Combobox } from '@/ui/Select'

// 1. Default. Under ~15 flat options.
<NativeSelect
  options={roles}
  value={role}
  onChange={(e) => setRole(e.target.value)}
  placeholder="Choose a role"
/>

// 2. Rich rows — icons, descriptions, groups
<Select
  options={regions}          // { value, label, description?, icon?, group? }
  value={region}
  onChange={setRegion}
  searchable={regions.length > 12}
  aria-label="Deployment region"
/>

// 3. Multiple values, visible as removable chips
<MultiSelect options={tags} values={selected} onChange={setSelected} maxVisible={3} />

// 4. Async. Debounce, and keep the old results while loading.
const [results, setResults] = useState<Option[]>([])
const [loading, setLoading] = useState(false)

const search = useMemo(
  () =>
    debounce(async (q: string) => {
      if (!q) return setResults([])
      setLoading(true)
      try {
        setResults(await api.search(q))   // do NOT clear results first
      } finally {
        setLoading(false)
      }
    }, 320),
  [],
)

<Combobox
  options={results}
  value={value}
  onChange={setValue}
  onQueryChange={search}
  loading={loading}
/>`,
    },
    html: {
      lang: 'html',
      caption: 'The native version. Styleable, and everything below works with no JavaScript.',
      code: `<label class="ds-field__label" for="region">Deployment region</label>

<div class="ds-select">
  <select class="ds-select__control" id="region" name="region">
    <option value="" disabled selected>Choose a region</option>
    <optgroup label="Europe">
      <option value="eu-west-2">Europe (London)</option>
      <option value="eu-central-1">Europe (Frankfurt)</option>
    </optgroup>
    <optgroup label="Americas">
      <option value="us-east-1">US East (N. Virginia)</option>
    </optgroup>
  </select>
  <svg class="ds-select__chevron" aria-hidden="true">…</svg>
</div>

<!-- Custom listbox, if you genuinely need one -->
<button
  role="combobox"
  aria-expanded="false"
  aria-haspopup="listbox"
  aria-controls="region-list"
  aria-activedescendant="region-opt-2"
>Europe (London)</button>

<div role="listbox" id="region-list">
  <div role="option" id="region-opt-2" aria-selected="true">Europe (London)</div>
</div>`,
    },
    api: [
      {
        name: 'Select',
        props: [
          { name: 'options', type: 'Option[]', required: true, description: '{ value, label, description?, icon?, group?, disabled? }' },
          { name: 'value', type: 'string | null', required: true, description: 'Controlled value. null renders the placeholder.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fired on selection.' },
          { name: 'searchable', type: 'boolean', default: 'false', description: 'Adds a filter input. Turn it on past ~12 options.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Matches the Input and Button scale.' },
          { name: 'emptyText', type: 'string', default: "'No results'", description: 'Shown when the filter matches nothing.' },
        ],
      },
      {
        name: 'MultiSelect',
        props: [
          { name: 'values', type: 'string[]', required: true, description: 'Controlled selection.' },
          { name: 'maxVisible', type: 'number', default: '3', description: 'Chips shown before collapsing to "+N more".' },
        ],
      },
      {
        name: 'Combobox',
        props: [
          { name: 'onQueryChange', type: '(q: string) => void', description: 'Enables async mode: the component stops filtering locally.' },
          { name: 'loading', type: 'boolean', description: 'Swaps the chevron for a spinner in place, so nothing reflows.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Sort by likelihood, not alphabetically, when there is an obvious front-runner. "United States" at the top of a country list saves far more time than strict A–Z costs.',
      'A dropdown near the bottom of the viewport should open upward. Flipping is table stakes; a popover that opens off-screen is a dead control.',
      'For a country or timezone picker, always use a combobox. Nobody scrolls to Zimbabwe.',
      'Set a sensible default rather than a placeholder wherever one exists. A pre-filled correct answer is faster than any picker.',
    ],
    performance: [
      'Virtualise past about 200 options. Rendering 5,000 DOM nodes into a popover blocks the main thread for hundreds of milliseconds on a mid-range device.',
      'Debounce async search by 300–500ms and cancel in-flight requests with an AbortController — otherwise a slow early response can overwrite a fast later one.',
      'Memoise the filtered list. Recomputing a filter over thousands of options on every keystroke is a common source of input lag.',
      'Render the popover only when open. Keeping a hidden list of 500 rows mounted costs memory and slows every parent re-render.',
    ],
    mistakes: [
      'Rebuilding a native select purely for visual consistency, then shipping something with no type-ahead and broken arrow keys.',
      'Making group headings selectable, so arrow keys stop on them and screen readers announce them as options.',
      'Closing the popover on scroll instead of repositioning it. The user scrolls slightly to see the list and it vanishes.',
      'Forgetting to reset the search query when the popover reopens, so the user sees a stale filtered list.',
      'Not announcing the result count. Sighted users see the list shrink; screen-reader users get silence.',
    ],
    realWorld: [
      'Measure how often each option is selected. A long tail with one dominant answer means the default is wrong, not that the list needs better search.',
      'On mobile, the native select opens the OS picker, which is faster and more familiar than any custom sheet. Do not replace it without a genuine reason.',
      'For a multi-select that regularly exceeds ten values, consider a different pattern entirely — a two-pane transfer list or a dedicated management screen.',
      'When a dropdown consistently causes support tickets, the fix is usually clearer option labels rather than a better dropdown.',
    ],
  },
})

/* ---- local demo components --------------------------------------------- */

function SelectDemo({ searchable, open }: { searchable?: boolean; open?: boolean }) {
  const [value, setValue] = React.useState<string | null>(open ? 'eu-west-2' : 'us-east-1')
  return (
    <Select
      options={REGIONS}
      value={value}
      onChange={setValue}
      searchable={searchable}
      aria-label="Region"
    />
  )
}

function MultiDemo({ compact }: { compact?: boolean }) {
  const [values, setValues] = React.useState<string[]>(
    compact ? ['us-east-1'] : ['us-east-1', 'eu-west-2'],
  )
  return (
    <div className={compact ? 'w-40' : undefined}>
      <MultiSelect options={REGIONS} values={values} onChange={setValues} aria-label="Regions" />
    </div>
  )
}

function ComboDemo() {
  const [value, setValue] = React.useState<string | null>(null)
  return <Combobox options={REGIONS} value={value} onChange={setValue} aria-label="Region" />
}

function MiniSelect({ empty }: { empty?: boolean }) {
  return (
    <div className="flex w-40 items-center justify-between rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] px-3 py-2 text-body-sm">
      <span className={empty ? 'text-[var(--ds-fg-muted)]' : undefined}>
        {empty ? 'Choose a role' : 'Maintainer'}
      </span>
      <span className="text-[var(--ds-fg-muted)]">▾</span>
    </div>
  )
}
