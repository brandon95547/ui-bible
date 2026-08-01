import * as React from 'react'
import { Clock, CornerDownLeft, Search, TrendingUp } from 'lucide-react'
import { Kbd } from '@/ui/Display'
import { SearchInput } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const CORPUS = [
  'api-gateway',
  'billing-worker',
  'web-frontend',
  'auth-service',
  'search-indexer',
  'notification-relay',
]
const RECENT = ['api-gateway', 'deployment 4021']

function Playground() {
  const [query, setQuery] = React.useState('')
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [suggestions, setSuggestions] = React.useState(true)
  const [shortcut, setShortcut] = React.useState(true)
  const [open, setOpen] = React.useState(false)

  const hits = query
    ? CORPUS.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <PreviewStage
      label="Playground"
      minHeight={260}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <KnobToggle checked={suggestions} onChange={setSuggestions} label="Suggestions" />
          <KnobToggle checked={shortcut} onChange={setShortcut} label="Shortcut hint" />
        </div>
      }
      code={`<SearchInput
  size="${size}"
  placeholder="Search services…"
  aria-label="Search services"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}${shortcut ? '\n  suffix={<Kbd>/</Kbd>}' : ''}
/>`}
    >
      <div className="relative w-full max-w-sm">
        <SearchInput
          size={size}
          placeholder="Search services…"
          aria-label="Search services"
          value={query}
          suffix={shortcut && !query ? <Kbd>/</Kbd> : undefined}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onClear={() => setQuery('')}
        />
        {suggestions && open && (
          <div className="absolute inset-x-0 top-full z-10 mt-1.5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1.5 shadow-e4">
            {query === '' ? (
              <>
                <p className="px-2 pb-1 pt-1 text-overline uppercase text-[var(--ds-fg-muted)]">
                  Recent
                </p>
                {RECENT.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onMouseDown={() => setQuery(r)}
                    className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-label text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]"
                  >
                    <Clock size={13} className="text-[var(--ds-fg-muted)]" /> {r}
                  </button>
                ))}
              </>
            ) : hits.length ? (
              hits.map((h) => (
                <button
                  key={h}
                  type="button"
                  onMouseDown={() => setQuery(h)}
                  className="flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-label text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]"
                >
                  <Search size={13} className="text-[var(--ds-fg-muted)]" />
                  <span className="flex-1 truncate">{h}</span>
                  <CornerDownLeft size={12} className="text-[var(--ds-fg-disabled)]" />
                </button>
              ))
            ) : (
              <p className="px-2 py-4 text-center text-body-sm text-[var(--ds-fg-muted)]">
                Nothing matches “{query}”.
              </p>
            )}
          </div>
        )}
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'search-input',
    title: 'Search Input',
    tagline:
      'Query entry with a clear button, a debounce, suggestions and recent searches. The one field where a placeholder can carry the label.',
    keywords: ['search box', 'query', 'debounce', 'clear', 'suggestions', 'recent', 'searchbox'],
  },

  overview: {
    purpose:
      'A search input takes a query and narrows a result set. Unlike every other field in this section it usually has no visible label, no validation, and no submit step — the user types and the page responds. That makes its affordances unusual: a magnifier that says what the field is for, a clear button that appears only when there is something to clear, and suggestions that turn recall into recognition.',
    whenToUse: [
      'Filtering a list, table or result set the user is already looking at.',
      'Site-wide or app-wide search from a persistent header.',
      'Any field where the user types free text and the answer is a set of things rather than a value.',
    ],
    whenNotToUse: [
      {
        text: 'The user is picking one value from a known list.',
        instead: 'a Combobox — the result is a value, not a result set',
        to: '#/combobox',
      },
      {
        text: 'The user wants to run a command rather than find content.',
        instead: 'a Command Palette',
        to: '#/command-palette',
      },
      {
        text: 'The list has fewer than about ten items visible.',
        instead: 'nothing — a search box over eight rows is chrome that costs more than it saves',
        to: '#/list',
      },
      {
        text: 'The filtering is by facet rather than by text.',
        instead: 'Chips or a filter panel',
        to: '#/chip',
      },
    ],
    reasoning: (
      <>
        <p>
          This is the one control where a <strong>placeholder may act as the label</strong>, and
          only because the magnifier icon carries the meaning permanently. The placeholder still
          disappears on the first keystroke — that is acceptable here because by then the user has
          typed their query and no longer needs to be told what the field does. It is still not
          an accessible name, so <code>aria-label</code> is mandatory.
        </p>
        <p>
          <strong>Debounce the request, never the input.</strong> The typed characters must appear
          instantly; only the fetch waits. Around 300ms is the sweet spot: long enough to collapse
          a burst of typing into one request, short enough that the results feel like they are
          keeping up. And every response must be checked against the current query before it
          renders, or a slow request for "ap" overwrites the results for "api-gateway".
        </p>
        <p>
          The empty state is where the field earns its keep. An empty search box that shows recent
          searches and a few popular queries teaches what is searchable; one that shows nothing
          asks the user to guess the vocabulary of a system they have not learned yet.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'sizes',
        title: 'Three placements',
        description:
          'Small inside a table toolbar, medium in a page header, large as the subject of a search page. The magnifier is always leading — trailing reads as a submit button.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              <SearchInput size="sm" placeholder="Filter rows…" aria-label="Filter rows" />
              <SearchInput size="md" placeholder="Search services…" aria-label="Search services" suffix={<Kbd>/</Kbd>} />
              <SearchInput size="lg" placeholder="Search everything…" aria-label="Search everything" />
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'clear',
        title: 'Clear appears only when there is something to clear',
        description:
          'A permanent × on an empty field is a control that does nothing, and users press it to find out. It also has to restore the full result set, not just blank the text.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Empty" sub="No clear button" tone="good">
                <SearchInput placeholder="Search services…" aria-label="empty" />
              </Cell>
              <Cell label="With a query" sub="Clear appears" tone="good">
                <SearchInput defaultValue="api" aria-label="filled" onClear={() => {}} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'result-count',
        title: 'Always show the result count',
        description:
          'It is the only feedback that the query did anything, and it is what stops a user retyping a search that already worked. It belongs in a live region.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              <SearchInput defaultValue="api" aria-label="counted" onClear={() => {}} />
              <p aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
                3 of 48 services match “api”
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'empty-state',
        title: 'No results',
        description:
          'Name the query, offer the way out. A blank panel makes the user wonder whether the search ran at all.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              <SearchInput defaultValue="zzz" aria-label="none" onClear={() => {}} />
              <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-4 py-6 text-center">
                <p className="text-body-sm text-[var(--ds-fg-secondary)]">
                  No services match “zzz”.
                </p>
                <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
                  Check the spelling, or clear the search to see all 48.
                </p>
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <div className="w-52"><SearchInput placeholder="Search…" aria-label="e" /></div> },
      { label: 'Shortcut hint', render: <div className="w-52"><SearchInput placeholder="Search…" aria-label="s" suffix={<Kbd>/</Kbd>} /></div> },
      { label: 'Focus', render: <div className="w-52"><SearchInput placeholder="Search…" aria-label="f" className="border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]" /></div> },
      { label: 'With query', render: <div className="w-52"><SearchInput defaultValue="api" aria-label="q" onClear={() => {}} /></div> },
      { label: 'Loading', render: <div className="w-52"><SearchInput defaultValue="api" aria-label="l" loading /></div> },
      { label: 'Disabled', render: <div className="w-52"><SearchInput placeholder="Search…" aria-label="d" disabled /></div> },
      { label: 'Small', render: <div className="w-52"><SearchInput size="sm" placeholder="Filter…" aria-label="sm" /></div> },
      { label: 'Large', render: <div className="w-52"><SearchInput size="lg" placeholder="Search…" aria-label="lg" /></div> },
      {
        label: 'Suggestion',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <Clock size={13} className="text-[var(--ds-fg-muted)]" /> api-gateway
          </span>
        ),
      },
      {
        label: 'Popular',
        render: (
          <span className="flex w-52 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <TrendingUp size={13} className="text-[var(--ds-fg-muted)]" /> failed deployments
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <SearchInput
          defaultValue="api"
          aria-label="Search services"
          onClear={() => {}}
        />
      </div>
    ),
    caption:
      'Leading magnifier, the query, and a clear button that exists only while there is a query to clear.',
    parts: [
      {
        n: 1,
        label: 'Magnifier',
        value: '15px, leading, aria-hidden',
        kind: 'size',
        note: 'Leading, always. A trailing magnifier reads as a submit button, and users then expect nothing to happen until they press it.',
      },
      {
        n: 2,
        label: 'Placeholder',
        value: 'Names the scope',
        kind: 'type',
        note: '"Search services…" not "Search". Scope is the single most useful thing the field can say, because it sets expectations before the first query fails.',
      },
      {
        n: 3,
        label: 'Clear button',
        value: '20px, conditional',
        kind: 'size',
        note: 'Present only when there is a query. It must restore the full result set, not just blank the text — clearing the box and leaving filtered results is a bug users cannot diagnose.',
      },
      {
        n: 4,
        label: 'Shortcut hint',
        value: 'Kbd, trailing, when empty',
        kind: 'type',
        note: 'Swaps out for the clear button once typing starts. It is how anyone learns the shortcut exists.',
      },
      {
        n: 5,
        label: 'Debounce',
        value: '300ms on the request',
        kind: 'motion',
        note: 'On the fetch only. The characters appear instantly; a debounced input feels broken within two keystrokes.',
      },
      {
        n: 6,
        label: 'Suggestion panel',
        value: '6px below, full width',
        kind: 'space',
        note: 'Matched to the field width so the two read as one control. Max 8 rows before it scrolls.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Idle border in a header' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Magnifier, placeholder, clear glyph' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Suggestion panel' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Active suggestion row' },
    { category: 'spacing', token: 'padding-left', value: '32px', usedFor: 'Room for the magnifier' },
    { category: 'spacing', token: 'panel offset', value: '6px', usedFor: 'Gap to the suggestion panel' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'motion', token: 'debounce', value: '300ms', usedFor: 'Request delay, never input delay' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 28px 0 28px', icon: '14px', type: '13px', use: 'Table toolbars and filter bars, where it narrows what is already visible.' },
    { name: 'Medium', height: '36px', padding: '0 32px', icon: '15px', type: '15px', minWidth: '16rem', use: 'The default. App headers and page-level search.' },
    { name: 'Large', height: '48px', padding: '0 44px', icon: '18px', type: '16px', use: 'A dedicated search page, where the field is the subject of the screen.' },
    { name: 'Clear button', height: '20px', minWidth: '20px', touch: '44px on coarse pointers', use: 'Appears only when there is a query.' },
    { name: 'Suggestion panel', maxWidth: 'Matches the field', height: 'max 18rem', use: 'About 8 rows before it scrolls. Wider than the field reads as a different component.' },
  ],

  do: [
    {
      title: 'Debounce the request, not the input',
      why: 'Characters must appear the instant they are typed. A debounced value feels broken within two keystrokes, and users start pressing keys harder.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          setQuery(v) <span className="text-[var(--ds-fg-muted)]">// instant</span>
          <br />
          debounce(() =&gt; fetch(v), 300)
        </code>
      ),
    },
    {
      title: 'Name the scope in the placeholder',
      why: '"Search services…" sets expectations before the first query fails. "Search" makes the user find the boundary by hitting it.',
      render: (
        <div className="w-full max-w-xs">
          <SearchInput placeholder="Search services…" aria-label="scoped" />
        </div>
      ),
    },
    {
      title: 'Announce the result count',
      why: 'It is the only confirmation the query did anything. Without it a screen-reader user types and hears nothing at all.',
      render: (
        <span aria-live="polite" className="text-caption text-[var(--ds-fg-secondary)]">
          3 of 48 services match “api”
        </span>
      ),
    },
    {
      title: 'Show recent searches on focus',
      why: 'The empty state is free real estate for teaching what is searchable. Recents also make the second search of a session almost instant.',
      render: (
        <Stack gap="xs" className="w-40">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Recent</span>
          <Row gap="sm" align="center" className="text-label-sm text-[var(--ds-fg-secondary)]">
            <Clock size={12} className="text-[var(--ds-fg-muted)]" /> api-gateway
          </Row>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not require a submit press',
      why: 'Live filtering is the expectation now. If the query genuinely is expensive, debounce longer and show a loading state — do not make the user press a button to find out.',
      render: (
        <Row gap="sm">
          <div className="w-40"><SearchInput placeholder="Search…" aria-label="submit" /></div>
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-1.5 text-label-sm text-[var(--ds-danger-text)]">
            Go
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not render a stale response',
      why: 'A slow request for "ap" landing after a fast one for "api-gateway" replaces correct results with wrong ones, and nothing on screen explains it.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-danger-text)]">
          if (res.query !== currentQuery) return
          <span className="text-[var(--ds-fg-muted)]"> ← missing</span>
        </code>
      ),
    },
    {
      title: 'Do not show a permanent clear button',
      why: 'A × on an empty field is a control that does nothing. Users press it once to find out and then distrust it when it matters.',
      render: (
        <div className="relative w-40">
          <SearchInput placeholder="Search…" aria-label="permanent clear" onClear={() => {}} />
        </div>
      ),
    },
    {
      title: 'Do not put the magnifier at the end',
      why: 'A trailing magnifier is a submit button in every other product the user has used. They will type, wait, and then press it.',
      render: (
        <div className="flex w-40 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] px-3 py-2">
          <span className="flex-1 text-body-sm text-[var(--ds-fg-muted)]">Search…</span>
          <Search size={14} className="text-[var(--ds-fg-muted)]" />
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The placeholder owes 4.5:1. It carries the field’s meaning here, which makes the usual "it is just a hint" excuse even weaker than normal.',
      'The magnifier owes 3:1 as a meaningful icon — it is what identifies the control.',
      'The clear button must reach 3:1 against the field fill. At 14px inside a low-contrast well it is easy to lose.',
      'The active suggestion row must be distinguishable from idle rows without relying on colour alone.',
    ],
    keyboard: [
      { keys: '/ or ⌘K', does: 'Focuses the field from anywhere, when no other input has focus. Advertise it with a Kbd hint in the field.' },
      { keys: '↓', does: 'Moves into the suggestions. Focus stays in the input; aria-activedescendant moves the highlight.' },
      { keys: 'Enter', does: 'Accepts the highlighted suggestion, or runs the typed query when nothing is highlighted.' },
      { keys: 'Esc', does: 'Closes the suggestions on the first press, clears the query on the second. Two presses, two distinct outcomes.' },
      { keys: 'Tab', does: 'Leaves the field and closes the panel without accepting anything.' },
    ],
    aria: [
      { attr: 'type="search"', on: 'The field', note: 'Gives the searchbox role and the platform’s own clear affordance on some browsers.' },
      { attr: 'aria-label', on: 'The field', note: 'Mandatory when there is no visible label. A placeholder is never an accessible name.' },
      { attr: 'role="combobox"', on: 'The field', note: 'Only when suggestions exist, with aria-expanded, aria-controls and aria-activedescendant.' },
      { attr: 'aria-live="polite"', on: 'The result count', note: 'Debounced to about 500ms after typing stops. Announcing per keystroke is unusable.' },
      { attr: 'aria-busy', on: 'The results region', note: 'While the request is in flight, so the user knows the silence is loading rather than nothing.' },
      { attr: 'aria-label', on: 'The clear button', note: '"Clear search". It is a distinct control and needs its own name.' },
    ],
    focus:
      'Clearing returns focus to the field, not to the body — the user almost always wants to type a new query. Accepting a suggestion also returns focus to the field, with the query filled in.',
    screenReader: [
      'Announce the count after typing settles: "3 of 48 services match". This is the only feedback that exists for a non-visual user.',
      'When suggestions open, announce how many: "6 suggestions available".',
      'A zero-result state must be announced, not just rendered. Silence is indistinguishable from a request that never fired.',
    ],
    touch:
      'The clear button needs a 44px target, which usually means growing the field to 44px. Set enterKeyHint="search" so the on-screen keyboard shows a search key. Suggestions on mobile should render inline under the field rather than as a floating panel — the keyboard covers the lower half of the screen and a floating panel lands underneath it.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { SearchInput } from '@/ui/Input'

const [query, setQuery] = React.useState('')
const [results, setResults] = React.useState([])

// Debounce the REQUEST. The input value updates instantly, always.
const debounced = useDebounced(query, 300)

React.useEffect(() => {
  if (!debounced) return setResults(all)
  let cancelled = false
  search(debounced).then((r) => {
    // Without this guard, a slow response for "ap" overwrites the correct
    // results for "api-gateway" and nothing on screen explains why.
    if (!cancelled) setResults(r)
  })
  return () => { cancelled = true }
}, [debounced])

<SearchInput
  value={query}
  placeholder="Search services…"          // names the SCOPE
  aria-label="Search services"            // a placeholder is not a name
  enterKeyHint="search"
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => {
    setQuery('')
    setResults(all)                        // restore, do not just blank the box
    inputRef.current?.focus()
  }}
/>

{/* The only feedback that the query did anything. */}
<p aria-live="polite" className="sr-only">
  {results.length} of {all.length} services match “{debounced}”
</p>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-search">
  <svg class="ds-search__icon" aria-hidden="true">…</svg>

  <input
    type="search"
    role="combobox"
    aria-label="Search services"
    aria-expanded="true"
    aria-controls="search-suggestions"
    aria-activedescendant="sug-2"
    placeholder="Search services…"
    enterkeyhint="search"
    autocomplete="off"
  />

  <!-- Only rendered when there is a query to clear. -->
  <button type="button" class="ds-search__clear" aria-label="Clear search">
    <svg aria-hidden="true">…</svg>
  </button>
</div>

<div id="search-suggestions" role="listbox" aria-label="Suggestions">
  <div id="sug-2" role="option" aria-selected="true">api-gateway</div>
</div>

<p class="sr-only" role="status" aria-live="polite">3 of 48 services match</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-search { position: relative; }

.ds-search input {
  inline-size: 100%;
  block-size: 36px;
  padding-inline: 32px;              /* magnifier leading, clear trailing */
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

/* Leading, always. A trailing magnifier reads as a submit button. */
.ds-search__icon {
  position: absolute;
  inset-inline-start: 10px;
  inset-block-start: 50%;
  translate: 0 -50%;
  color: var(--ds-fg-muted);
  pointer-events: none;
}

/* The browser's own is inconsistent and unstyleable — draw our own. */
.ds-search input::-webkit-search-cancel-button { appearance: none; }

.ds-search__clear {
  position: absolute;
  inset-inline-end: 8px;
  inset-block-start: 50%;
  translate: 0 -50%;
  inline-size: 20px;
  block-size: 20px;
}

/* Matched to the field width, so the two read as one control. */
.ds-search__panel {
  position: absolute;
  inset-inline: 0;
  inset-block-start: calc(100% + 6px);
  max-block-size: 18rem;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
}

@media (pointer: coarse) {
  .ds-search input   { block-size: 44px; }
  .ds-search__clear  { inline-size: 44px; block-size: 44px; }
  /* The keyboard covers the lower half of the screen; a floating panel
     lands underneath it. */
  .ds-search__panel  { position: static; box-shadow: none; }
}`,
    },
    api: [
      {
        name: 'SearchInput',
        props: [
          { name: 'value', type: 'string', description: 'Controlled. Update it on every keystroke — only the request is debounced.' },
          { name: 'onClear', type: '() => void', description: 'Renders the clear button when a value is present. Must restore the full result set and refocus the field.' },
          { name: 'placeholder', type: 'string', description: 'Names the scope: "Search services…". Never a substitute for aria-label.' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Swaps the magnifier for a spinner while a request is in flight.' },
          { name: 'suffix', type: 'ReactNode', description: 'A shortcut hint when empty. Replaced by the clear button once there is a query.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Small filters a visible list; large is the subject of a search page.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Put the query in the URL. A search result that cannot be shared or bookmarked is half a feature, and back should return to the previous query rather than the previous page.',
      'Highlight the matched substring in results. It explains why each row is there and makes a fuzzy match feel intentional rather than random.',
      'Search across synonyms, not just the literal string. Half your users will type "delete" for what you named "remove".',
      'Cache the last few queries in memory. Backspacing through a query should not re-request every intermediate state.',
      'Trim whitespace before searching but not while typing — trimming as they type eats the space before the next word.',
    ],
    performance: [
      'Cancel in-flight requests with an AbortController when the query changes. Without it, a fast typist has six requests racing to render.',
      'Filter client-side under about 1,000 items. A round trip to filter a list already in memory is latency the user pays for nothing.',
      'Index once on mount rather than lowercasing every item on every keystroke — with a few thousand rows that difference is visible.',
      'Debounce the live-region announcement separately and more slowly than the fetch. Around 500ms after typing stops is right.',
    ],
    mistakes: [
      'Debouncing the input value, so typed characters appear late and the field feels broken.',
      'No stale-response guard, so slow results for an earlier query overwrite correct ones.',
      'A placeholder with no aria-label, leaving the field unnamed for assistive tech.',
      'A permanent clear button that does nothing on an empty field.',
      'Clearing the text without restoring the results, leaving a filtered list with an empty search box.',
      'No result count, so nothing confirms the search ran.',
      'A trailing magnifier, which every user reads as a submit button.',
    ],
    realWorld: [
      'Search is often the most-used feature in an internal tool and the least-instrumented. Log queries with zero results — that list is the highest-value backlog you have.',
      'Recent searches consistently outperform popular searches in an authenticated product. What this user did last week beats what everyone did yesterday.',
      'The "/" shortcut is a widespread convention now. Advertising it with a Kbd hint in the field costs nothing and moves keyboard adoption more than any documentation.',
      'A search box over fewer than about ten visible rows is chrome. Users scan ten rows faster than they can type three characters.',
    ],
  },
})
