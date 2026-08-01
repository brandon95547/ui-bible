import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Avatar, Chip } from '@/ui/Display'
import { Field } from '@/ui/Input'
import { MultiSelect } from '@/ui/Select'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SCOPES = [
  { value: 'read', label: 'Read deployments', description: 'View history and logs' },
  { value: 'write', label: 'Write deployments', description: 'Trigger and roll back' },
  { value: 'admin', label: 'Manage members', description: 'Invite and remove people' },
  { value: 'billing', label: 'Billing', description: 'View and change the plan' },
  { value: 'secrets', label: 'Secrets', description: 'Read and rotate credentials' },
]

function Playground() {
  const [values, setValues] = React.useState(['read', 'write'])
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [maxVisible, setMaxVisible] = React.useState<'2' | '3' | '5'>('3')
  const [descriptions, setDescriptions] = React.useState(true)

  const options = descriptions ? SCOPES : SCOPES.map(({ description: _d, ...o }) => o)

  return (
    <PreviewStage
      label="Playground"
      minHeight={240}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Max visible">
            <KnobSelect value={maxVisible} onChange={setMaxVisible} options={['2', '3', '5'] as const} />
          </Knob>
          <KnobToggle checked={descriptions} onChange={setDescriptions} label="Descriptions" />
        </div>
      }
      code={`<Field label="Permissions" description="Applies to every project in this team.">
  <MultiSelect
    size="${size}"
    maxVisible={${maxVisible}}
    options={scopes}
    values={values}
    onChange={setValues}
    aria-label="Permissions"
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field
          label="Permissions"
          description="Applies to every project in this team."
        >
          <MultiSelect
            size={size}
            maxVisible={Number(maxVisible)}
            options={options}
            values={values}
            onChange={setValues}
            aria-label="Permissions"
          />
        </Field>
        <p aria-live="polite" className="mt-2 text-caption text-[var(--ds-fg-muted)]">
          {values.length} of {SCOPES.length} selected
        </p>
      </div>
    </PreviewStage>
  )
}

function TokenField() {
  const [people, setPeople] = React.useState(['ada@example.com', 'grace@example.com'])
  const [draft, setDraft] = React.useState('')

  const commit = () => {
    const v = draft.trim().replace(/,$/, '')
    if (!v || people.includes(v)) return setDraft('')
    setPeople((p) => [...p, v])
    setDraft('')
  }

  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <div className="w-full max-w-md">
        <label htmlFor="invite" className="mb-1.5 block text-label text-[var(--ds-fg-secondary)]">
          Invite people
        </label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] p-1.5 focus-within:border-[var(--ds-accent)] focus-within:shadow-[0_0_0_3px_var(--ds-accent-subtle)]">
          {people.map((p) => (
            <Chip
              key={p}
              as="span"
              size="sm"
              selected
              avatar={<Avatar name={p.split('@')[0]} size="xs" />}
              onRemove={() => setPeople((prev) => prev.filter((x) => x !== p))}
            >
              {p}
            </Chip>
          ))}
          <input
            id="invite"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                commit()
              }
              // The behaviour every user already knows from email "To" fields.
              if (e.key === 'Backspace' && draft === '') {
                setPeople((prev) => prev.slice(0, -1))
              }
            }}
            onBlur={commit}
            onPaste={(e) => {
              // People paste ten addresses far more often than they type them.
              const text = e.clipboardData.getData('text')
              if (!/[,\n;]/.test(text)) return
              e.preventDefault()
              const parts = text.split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean)
              setPeople((prev) => [...new Set([...prev, ...parts])])
            }}
            placeholder={people.length ? '' : 'name@example.com'}
            className="h-7 min-w-[10rem] flex-1 bg-transparent px-1.5 text-body-sm outline-none placeholder:text-[var(--ds-fg-muted)]"
          />
        </div>
        <p className="mt-1.5 text-caption text-[var(--ds-fg-muted)]">
          Enter or comma to add. Backspace on an empty field removes the last one. Paste a list to
          add several.
        </p>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'multi-select',
    title: 'Multi-select',
    tagline:
      'Pick several. Selections become removable tokens inside the field, so the chosen set stays readable without reopening anything.',
    keywords: ['tag picker', 'token input', 'tags input', 'chips input', 'multiple', 'facets'],
  },

  overview: {
    purpose:
      'A multi-select collects several values into one field and shows them as removable tokens. The tokens are the point: a control that hides the selection behind "3 selected" forces the user to reopen the panel every time they want to check what they chose. Everything else — the panel, the filtering, the checkmarks — is a Select with the single-choice constraint removed.',
    whenToUse: [
      'Several values from a known set: permissions, labels, regions, team members.',
      'Any field where the user needs to see the whole selection while working on something else.',
      'Recipient and tag fields where new values may be created as they are typed.',
    ],
    whenNotToUse: [
      {
        text: 'Exactly one value may be chosen.',
        instead: 'a Select or a Combobox',
        to: '#/select',
      },
      {
        text: 'There are fewer than about six options and space allows.',
        instead: 'Checkboxes — every option visible beats any control that hides them',
        to: '#/checkbox',
      },
      {
        text: 'The selection filters a visible result set.',
        instead: 'Chips, which keep the active filters in the page',
        to: '#/chip',
      },
      {
        text: 'The user must reorder or review a large assignment.',
        instead: 'a Transfer List',
        to: '#/transfer-list',
      },
    ],
    reasoning: (
      <>
        <p>
          The single most important behaviour is <strong>Backspace on an empty field removes the
          last token</strong>. Every user learned it from an email "To" field, it costs three
          lines, and its absence makes the control feel subtly broken in a way people rarely
          articulate.
        </p>
        <p>
          <strong>The panel stays open</strong> while the user picks. Closing after each choice
          means selecting four permissions costs four openings, and it moves the panel out from
          under the pointer between clicks. That is the difference from a Select, where closing on
          choice is correct precisely because there is only one.
        </p>
        <p>
          Tokens have to be capped. Twelve of them wrap the field to four lines and push the rest
          of the form down the page. Show two or three plus a "+9 more" counter, and let the field
          expand on focus so the user can still see and remove everything.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'tokens',
        title: 'Token input with creation',
        description:
          'Recipients, tags, labels. Enter or comma commits, the × removes, Backspace on an empty field removes the last one, and a pasted list becomes several tokens at once.',
        render: <TokenField />,
      },
      {
        id: 'vs-checkboxes',
        title: 'Multi-select or checkboxes',
        description:
          'Below about six options, checkboxes win outright — every choice is visible, nothing is hidden behind a click, and the state is readable at a glance.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="5 options" sub="Checkboxes" tone="good">
                <Stack gap="xs">
                  {SCOPES.slice(0, 3).map((s, i) => (
                    <Row key={s.value} gap="sm" align="center" className="text-label-sm text-[var(--ds-fg-secondary)]">
                      <span
                        className={cn(
                          'grid h-4 w-4 place-items-center rounded-[var(--radius-xs)] border',
                          i < 2
                            ? 'border-[var(--ds-accent)] bg-[var(--ds-accent)] text-white'
                            : 'border-[var(--ds-border-strong)]',
                        )}
                      >
                        {i < 2 && <Check size={11} />}
                      </span>
                      {s.label}
                    </Row>
                  ))}
                </Stack>
              </Cell>
              <Cell label="40 options" sub="Multi-select" tone="good">
                <MultiSelect
                  options={SCOPES}
                  values={['read', 'write']}
                  onChange={() => {}}
                  aria-label="Many options"
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'overflow',
        title: 'Token overflow',
        description:
          'Cap the visible tokens and count the rest. A field that wraps to four lines pushes the whole form down and makes the layout jump on every selection.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Capped" tone="good">
                <MultiSelect
                  options={SCOPES}
                  values={SCOPES.map((s) => s.value)}
                  onChange={() => {}}
                  maxVisible={2}
                  aria-label="Capped"
                />
              </Cell>
              <Cell label="Uncapped" tone="bad">
                <div className="flex flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] p-1.5">
                  {SCOPES.map((s) => (
                    <Chip key={s.value} as="span" size="sm" selected onRemove={() => {}}>
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'select-all',
        title: 'Select all and clear',
        description:
          'Past about ten options, both are worth their space. Selecting nine of ten is one click plus one removal instead of nine clicks.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-xs rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1.5">
              <Row gap="sm" className="justify-between border-b border-[var(--ds-border-subtle)] px-2 pb-1.5">
                <button type="button" className="text-caption text-[var(--ds-accent-text)] hover:underline">
                  Select all
                </button>
                <button type="button" className="text-caption text-[var(--ds-fg-muted)] hover:underline">
                  Clear
                </button>
              </Row>
              {SCOPES.slice(0, 3).map((s, i) => (
                <span
                  key={s.value}
                  className="mt-0.5 flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]"
                >
                  <span className="w-3.5 text-[var(--ds-accent-text)]">{i < 2 && <Check size={13} />}</span>
                  {s.label}
                </span>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <div className="w-52"><MultiSelect options={SCOPES} values={[]} onChange={() => {}} aria-label="a" /></div> },
      { label: 'One', render: <div className="w-52"><MultiSelect options={SCOPES} values={['read']} onChange={() => {}} aria-label="b" /></div> },
      { label: 'Several', render: <div className="w-52"><MultiSelect options={SCOPES} values={['read', 'write']} onChange={() => {}} aria-label="c" /></div> },
      { label: 'Overflowing', render: <div className="w-52"><MultiSelect options={SCOPES} values={SCOPES.map((s) => s.value)} onChange={() => {}} maxVisible={2} aria-label="d" /></div> },
      { label: 'Small', render: <div className="w-52"><MultiSelect size="sm" options={SCOPES} values={['read']} onChange={() => {}} aria-label="e" /></div> },
      { label: 'Large', render: <div className="w-52"><MultiSelect size="lg" options={SCOPES} values={['read']} onChange={() => {}} aria-label="f" /></div> },
      { label: 'Token', render: <Chip as="span" size="sm" selected onRemove={() => {}}>Read deployments</Chip> },
      { label: 'Token with avatar', render: <Chip as="span" size="sm" selected avatar={<Avatar name="Ada Lovelace" size="xs" />} onRemove={() => {}}>ada@example.com</Chip> },
      {
        label: 'Overflow counter',
        render: <span className="rounded-full bg-[var(--ds-layer-active)] px-2 py-0.5 text-caption text-[var(--ds-fg-secondary)]">+9 more</span>,
      },
      {
        label: 'Checked option',
        render: (
          <span className="flex w-44 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg)]">
            <Check size={13} className="text-[var(--ds-accent-text)]" /> Read deployments
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Field label="Permissions" description="Applies to every project in this team.">
          <MultiSelect
            options={SCOPES}
            values={['read', 'write', 'admin', 'billing']}
            onChange={() => {}}
            maxVisible={3}
            aria-label="Anatomy"
          />
        </Field>
      </div>
    ),
    caption:
      'Three tokens, an overflow counter, and a chevron. The panel stays open while the user picks, so choosing four permissions is one opening.',
    parts: [
      {
        n: 1,
        label: 'Field height',
        value: '36px min, grows to 3 lines',
        kind: 'size',
        note: 'Matches a text field when empty so a form row stays aligned. It may grow, but a hard ceiling stops the layout jumping on every selection.',
      },
      {
        n: 2,
        label: 'Token',
        value: '24px, pill, removable',
        kind: 'size',
        note: 'A small Chip. Smaller than the free-standing chip so several fit on one line inside a 36px field.',
      },
      {
        n: 3,
        label: 'Token gap',
        value: '6px',
        kind: 'space',
        note: 'Tight enough that the set reads as one value, wide enough that two adjacent remove buttons are not mis-tapped.',
      },
      {
        n: 4,
        label: 'Overflow counter',
        value: '“+9 more”, not a token',
        kind: 'type',
        note: 'Deliberately not removable and not a chip, so it never reads as a selection that can be deleted.',
      },
      {
        n: 5,
        label: 'Checkmark gutter',
        value: '14px, always reserved',
        kind: 'space',
        note: 'Reserved on every row, selected or not, so labels stay on one left edge and rows do not shift as they are toggled.',
      },
      {
        n: 6,
        label: 'Panel behaviour',
        value: 'Stays open on select',
        kind: 'motion',
        note: 'The defining difference from a Select. Closing after each pick makes four selections cost four openings.',
      },
      {
        n: 7,
        label: 'Count',
        value: 'Live region under the field',
        kind: 'type',
        note: '"4 of 5 selected". The only feedback a non-visual user gets that a toggle landed.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Field border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Token fill' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Token label and checkmark' },
    { category: 'color', token: '--ds-layer-active', usedFor: 'Overflow counter background' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel surface' },
    { category: 'spacing', token: 'token gap', value: '6px', usedFor: 'Between tokens' },
    { category: 'spacing', token: 'field padding', value: '6px', usedFor: 'Reduced from a text field to make room for tokens' },
    { category: 'radius', token: 'full', usedFor: 'Token shape' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
  ],

  sizes: [
    { name: 'Small', height: '32px min', padding: '4px', gap: '4px', type: '13px', use: 'Table filters and dense forms.' },
    { name: 'Medium', height: '36px min', padding: '6px', gap: '6px', type: '15px', minWidth: '14rem', use: 'The default.' },
    { name: 'Large', height: '44px min', padding: '8px', gap: '6px', type: '16px', use: 'Touch layouts and recipient fields.' },
    { name: 'Token', height: '24px', padding: '0 4px 0 8px', radius: 'full', type: '12px', use: 'Smaller than a standalone Chip so several fit inside the field.' },
    { name: 'Field ceiling', height: '3 lines of tokens', use: 'Past this, overflow into a counter. Four lines pushes the rest of the form down the page.' },
  ],

  do: [
    {
      title: 'Support Backspace on an empty field',
      why: 'Every user has learned it from email "To" fields. It costs three lines, and its absence makes the field feel wrong in a way people cannot name.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          if (e.key === 'Backspace' &amp;&amp; draft === '')
          <br />
          &nbsp;&nbsp;removeLast()
        </code>
      ),
    },
    {
      title: 'Keep the panel open while picking',
      why: 'Selecting four permissions should be four clicks, not four clicks plus four reopenings — and the panel moving between clicks causes mis-selections.',
      render: (
        <span className="text-caption text-[var(--ds-fg-secondary)]">
          onSelect → toggle(value) <span className="text-[var(--ds-danger-text)]">✗ close()</span>
        </span>
      ),
    },
    {
      title: 'Split a pasted list into tokens',
      why: 'People paste ten addresses far more often than they type them. Rejecting a pasted list is the fastest way to make a recipient field feel hostile.',
      render: (
        <Row gap="sm" align="center">
          <code className="font-mono text-[11px] text-[var(--ds-fg-muted)]">a@x.com, b@x.com</code>
          <span className="text-[var(--ds-fg-disabled)]">→</span>
          <Chip as="span" size="sm" selected>a@x.com</Chip>
          <Chip as="span" size="sm" selected>b@x.com</Chip>
        </Row>
      ),
    },
    {
      title: 'Give every remove button its own name',
      why: '"Remove" repeated nine times is useless to a screen-reader user. "Remove Read deployments" says exactly what disappears.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          aria-label="Remove Read deployments"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not hide the selection behind a count',
      why: '"3 selected" makes the user reopen the panel every time they want to check what they chose. The tokens are the reason to use this control at all.',
      render: (
        <div className="flex w-52 items-center justify-between rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] px-3 py-2">
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">3 selected</span>
          <span className="text-[var(--ds-fg-muted)]">▾</span>
        </div>
      ),
    },
    {
      title: 'Do not let the field wrap to four lines',
      why: 'Every selection then pushes the rest of the form down the page, and the submit button moves while the user is aiming at it.',
      render: (
        <div className="flex w-52 flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] p-1.5">
          {[...SCOPES, ...SCOPES].map((s, i) => (
            <Chip key={i} as="span" size="sm" selected>
              {s.label}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not use it for five options',
      why: 'Checkboxes show every option and its state at once. A control that hides five options behind a click is strictly worse than showing them.',
      render: (
        <div className="w-52">
          <MultiSelect
            options={SCOPES.slice(0, 3)}
            values={['read']}
            onChange={() => {}}
            aria-label="too few"
          />
        </div>
      ),
    },
    {
      title: 'Do not make the whole token the remove target',
      why: 'The user cannot then click a token to edit or re-open it, and a stray click deletes a selection instead of doing nothing.',
      render: (
        <Chip as="span" size="sm" selected className="cursor-pointer line-through opacity-70">
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
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'Token labels owe 4.5:1 against the token fill — they are the value of the field.',
      'The remove × must reach 3:1 against the token fill. At 11px inside a tint this is the easiest thing on the page to under-contrast.',
      'The checkmark on a selected row must not be the only signal. Pair it with a text change or the row reads identically in greyscale.',
      'The overflow counter is content and owes 4.5:1 — it tells the user something is hidden.',
    ],
    keyboard: [
      { keys: '↓', does: 'Opens the panel and moves the highlight to the first option. Focus stays in the field.' },
      { keys: 'Space / Enter', does: 'Toggles the highlighted option. The panel does not close.' },
      { keys: 'Backspace', does: 'On an empty query, removes the last token. The behaviour everyone expects from an email field.' },
      { keys: '← / →', does: 'Optional roving focus across the tokens, so Tab does not stop nine times.' },
      { keys: 'Delete', does: 'On a focused token, removes it and moves focus to the next one.' },
      { keys: 'Esc', does: 'Closes the panel without changing the selection.' },
      { keys: 'Tab', does: 'Leaves the field entirely. Tokens must not each be a tab stop.' },
    ],
    aria: [
      { attr: 'role="combobox"', on: 'The input', note: 'With aria-multiselectable on the listbox and aria-expanded on the input.' },
      { attr: 'aria-activedescendant', on: 'The input', note: 'Tracks the highlighted option without moving DOM focus, exactly as in a single Combobox.' },
      { attr: 'aria-selected', on: 'Each option', note: 'Not aria-checked. In a multi-selectable listbox, selected is the correct state.' },
      { attr: 'aria-label', on: 'Each remove button', note: 'Must include the value: "Remove Read deployments". Nine buttons called "Remove" is nine identical controls.' },
      { attr: 'aria-live="polite"', on: 'The selection count', note: '"4 of 5 selected". Without it, toggling an option produces no feedback at all.' },
      { attr: 'aria-describedby', on: 'The field', note: 'Points at the instruction — "Enter or comma to add" — which otherwise exists only visually.' },
    ],
    focus:
      'Removing a token must move focus to the next token, or to the input if it was the last — never to the body. Tokens are not individual tab stops; use roving focus across them so Tab crosses the field in one press.',
    screenReader: [
      'Announce the count on every change: "Read deployments removed, 3 of 5 selected".',
      'The field announces its whole value on focus, so a user landing on it hears what is already chosen rather than an empty combobox.',
      'In a token input, announce the instruction via aria-describedby — the Enter-or-comma behaviour is invisible otherwise.',
    ],
    touch:
      'Remove buttons need a 24px minimum inside the token and the field needs 44px overall. On a phone the panel should become a full-screen sheet: a floating panel plus an on-screen keyboard plus a wrapping token field leaves almost no room for the options themselves.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { MultiSelect } from '@/ui/Select'

<Field label="Permissions" description="Applies to every project in this team.">
  <MultiSelect
    options={scopes}
    values={values}
    onChange={setValues}
    maxVisible={3}                 // cap the tokens; count the rest
    aria-label="Permissions"
  />
</Field>

{/* The only feedback a non-visual user gets that a toggle landed. */}
<p aria-live="polite" className="sr-only">
  {values.length} of {scopes.length} selected
</p>

// Token input. Three behaviours, all of them expected, none of them free.
<input
  value={draft}
  onChange={(e) => setDraft(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
    // Learned from every email client ever shipped.
    if (e.key === 'Backspace' && draft === '') removeLast()
  }}
  onBlur={commit}                  // never silently lose what they typed
  onPaste={(e) => {
    const text = e.clipboardData.getData('text')
    if (!/[,\\n;]/.test(text)) return
    e.preventDefault()
    add(text.split(/[,\\n;]+/).map((s) => s.trim()).filter(Boolean))
  }}
/>

// Removing must land focus somewhere sensible, never on <body>.
function remove(id: string, index: number) {
  setValues((v) => v.filter((x) => x !== id))
  ;(tokenRefs.current[index + 1] ?? inputRef.current)?.focus()
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-multiselect">
  <!-- Tokens are not individual tab stops: roving focus across them. -->
  <span class="ds-token">
    Read deployments
    <button type="button" aria-label="Remove Read deployments">
      <svg aria-hidden="true">…</svg>
    </button>
  </span>

  <span class="ds-token__more">+9 more</span>

  <input
    role="combobox"
    aria-expanded="true"
    aria-controls="perm-list"
    aria-activedescendant="perm-2"
    aria-describedby="perm-hint perm-count"
  />
</div>

<ul id="perm-list" role="listbox" aria-multiselectable="true" aria-label="Permissions">
  <!-- aria-selected, not aria-checked: this is a listbox. -->
  <li id="perm-2" role="option" aria-selected="true">
    <svg aria-hidden="true">…</svg> Read deployments
  </li>
</ul>

<p id="perm-hint" class="sr-only">Enter or comma to add.</p>
<p id="perm-count" class="sr-only" role="status" aria-live="polite">4 of 5 selected</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-multiselect {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-block-size: 36px;              /* matches a text field when empty */
  /* Ceiling: past three lines the field pushes the rest of the form down
     the page and the submit button moves while the user is aiming at it. */
  max-block-size: calc(3 * 30px + 12px);
  overflow-y: auto;
  padding: 6px;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

.ds-multiselect:focus-within {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
}

.ds-token {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  block-size: 24px;                  /* smaller than a standalone Chip */
  padding-inline: 8px 4px;
  border-radius: 999px;
  background: var(--ds-accent-subtle);
  color: var(--ds-accent-text);
  font-size: 12px;
}

.ds-token button { inline-size: 16px; block-size: 16px; }

/* Not a token: it must never read as a selection that can be removed. */
.ds-token__more {
  padding-inline: 8px;
  border-radius: 999px;
  background: var(--ds-layer-active);
  color: var(--ds-fg-secondary);
  font-size: 12px;
}

.ds-multiselect input { flex: 1; min-inline-size: 6rem; border: 0; background: none; }

@media (pointer: coarse) {
  .ds-token button { inline-size: 24px; block-size: 24px; }
}`,
    },
    api: [
      {
        name: 'MultiSelect',
        props: [
          { name: 'options', type: 'Option[]', required: true, description: 'The full set. Filtering is applied to this, not to the selection.' },
          { name: 'values', type: 'string[]', required: true, description: 'Selected values, in selection order. Order matters — reordering on every render makes tokens jump.' },
          { name: 'onChange', type: '(v: string[]) => void', required: true, description: 'Fires on toggle, on remove, and on select-all or clear.' },
          { name: 'maxVisible', type: 'number', default: '3', description: 'Tokens shown before the overflow counter takes over.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Matches the shared control scale.' },
          { name: 'creatable', type: 'boolean', default: 'false', description: 'Allows values not in the list. Adds a "Create «query»" row at the end of the panel.' },
          { name: 'max', type: 'number', description: 'A selection ceiling. Disable unselected options at the limit rather than silently ignoring clicks.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep the selection in the order the user chose, not sorted. Re-sorting on every pick makes the tokens jump and destroys the sense that the field is theirs.',
      'Show selected options at the top of the panel when the list is long, so removing does not mean hunting through forty rows.',
      'Offer "Select all" and "Clear" past about ten options. Selecting nine of ten is otherwise nine clicks.',
      'For a creatable field, validate as tokens commit and mark bad ones in red rather than refusing them. People fix a visible mistake and get stuck on a field that will not accept input.',
      'Expand the field on focus to show every token, and collapse back to the capped view on blur. It resolves the overflow tension without a permanent tall field.',
    ],
    performance: [
      'Keep the selection in a Set for membership checks. An includes() per option per render is quadratic and it shows at a few hundred options.',
      'Virtualise the panel past roughly 200 rows, adding aria-setsize and aria-posinset when you do.',
      'Do not animate token layout on add or remove. The field reflows, and animating that reflow is both expensive and disorienting.',
      'Debounce any request the selection triggers by about 300ms — picking four options should be one request, not four.',
    ],
    mistakes: [
      'No Backspace-to-remove, which makes the field feel broken to anyone who has used an email client.',
      'Closing the panel after each selection, so four picks cost four openings.',
      'Hiding the selection behind "3 selected", removing the only reason to use this control.',
      'An uncapped field that wraps to four lines and shifts the rest of the form.',
      'Every remove button named "Remove", leaving assistive tech with nine identical controls.',
      'Losing focus to <body> after a token is removed.',
      'aria-checked instead of aria-selected on listbox options.',
      'Rejecting a pasted comma-separated list, which is how most recipient fields are actually filled.',
    ],
    realWorld: [
      'Recipient fields are the reference implementation everyone has internalised. Any deviation from Enter, comma, Backspace and paste-splits is felt immediately even when users cannot name it.',
      'For permissions and roles, showing a description under each option prevents far more support tickets than any amount of documentation elsewhere.',
      'Selection limits should disable the remaining options at the ceiling, with an explanation. Silently ignoring the eleventh click looks like a broken control.',
      'On mobile, a full-screen sheet beats a floating panel every time: the keyboard, the token field and the option list cannot all share the lower half of a phone screen.',
    ],
  },
})
