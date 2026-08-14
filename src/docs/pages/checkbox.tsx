import * as React from 'react'
import { Checkbox } from '@/ui/Toggle'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const SCOPES = ['repo:read', 'repo:write', 'deploy:staging', 'deploy:production', 'billing:read']

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [checked, setChecked] = React.useState(true)
  const [indeterminate, setIndeterminate] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [description, setDescription] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={160}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={checked} onChange={setChecked} label="Checked" />
          <KnobToggle checked={indeterminate} onChange={setIndeterminate} label="Indeterminate" />
          <KnobToggle checked={error} onChange={setError} label="Error" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
          <KnobToggle checked={description} onChange={setDescription} label="Description" />
        </div>
      }
      code={`<Checkbox
  label="Email me about security alerts"${description ? '\n  description="Sent immediately, never batched."' : ''}
  size="${size}"
  checked={${checked}}${indeterminate ? '\n  indeterminate' : ''}${error ? '\n  error' : ''}${disabled ? '\n  disabled' : ''}
  onChange={…}
/>`}
    >
      <div className="w-full max-w-sm">
        <Checkbox
          size={size}
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          error={error}
          onChange={(e) => setChecked(e.target.checked)}
          label="Email me about security alerts"
          description={description ? 'Sent immediately, never batched.' : undefined}
        />
      </div>
    </PreviewStage>
  )
}

function TreeDemo() {
  const [selected, setSelected] = React.useState<string[]>(['repo:read', 'deploy:staging'])
  const all = selected.length === SCOPES.length
  const some = selected.length > 0 && !all

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="w-full max-w-sm">
        <Stack gap="sm">
          <Checkbox
            checked={all}
            indeterminate={some}
            onChange={() => setSelected(all ? [] : [...SCOPES])}
            label={<span className="font-medium">All scopes</span>}
            description={`${selected.length} of ${SCOPES.length} selected`}
          />
          <div className="ml-[29px] flex flex-col gap-2.5 border-l border-[var(--ds-border-subtle)] pl-4">
            {SCOPES.map((s) => (
              <Checkbox
                key={s}
                size="sm"
                checked={selected.includes(s)}
                onChange={() =>
                  setSelected((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                  )
                }
                label={<span className="font-mono text-[12px]">{s}</span>}
              />
            ))}
          </div>
        </Stack>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'checkbox',
    title: 'Checkbox',
    tagline:
      'Independent on/off choices, staged until submit. The indeterminate state is what makes a parent checkbox honest about a partial selection.',
    keywords: ['tickbox', 'multi-select', 'indeterminate', 'form', 'consent', 'terms'],
  },

  overview: {
    purpose:
      'A checkbox represents one independent boolean. Zero, one or many may be selected, they do not affect each other, and the change is staged until the form is submitted. That last part is the entire difference from a switch — if there is no Save button, you probably want a switch.',
    whenToUse: [
      'Several independent options where any combination is valid.',
      'A single opt-in that is part of a form: terms, marketing consent, "remember me".',
      'Row selection in a table, where a parent checkbox controls the whole page.',
      'A permission or scope tree with a parent that can be partially selected.',
    ],
    whenNotToUse: [
      {
        text: 'The change saves immediately with no submit step.',
        instead: 'a Switch',
        to: '#/switch',
      },
      {
        text: 'Exactly one option must be chosen from a set.',
        instead: 'Radio buttons',
        to: '#/radio-button',
      },
      {
        text: 'There are more than about eight options.',
        instead: 'a MultiSelect',
        to: '#/select',
      },
      {
        text: 'The option is a filter that applies instantly.',
        instead: 'a filter Chip',
        to: '#/chip',
      },
    ],
    reasoning: (
      <>
        <p>
          The box is <strong>18px</strong>. That is the smallest square where a checkmark still
          reads as a checkmark rather than a smudge, and it lands cleanly on the 4px grid at 4.5
          units. The real target, though, is the label: making the label part of the control turns
          an 18px hit area into a 200px one. That is Fitts' Law applied for free, and it is why the
          label is always wrapped in the same clickable region.
        </p>
        <p>
          <strong>Indeterminate is not a third value.</strong> It is a display state on a parent
          that says "some of my children are checked". It cannot be reached by clicking — clicking a
          partially-selected parent selects all — and it must be set through the DOM property,
          because there is no HTML attribute for it. That single detail is why so many
          implementations get it wrong.
        </p>
        <p>
          Vertical stacking is the default. A stacked list has one left edge, so the eye scans down
          a single column and each option costs one fixation. Horizontal only works for two or three
          very short labels, and even then it is worse for scanning.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'tree',
        title: 'Parent and children',
        description:
          'The parent is checked when all children are, indeterminate when some are, and unchecked when none are. Clicking it selects all or clears all — never sets indeterminate.',
        render: <TreeDemo />,
      },
      {
        id: 'group',
        title: 'A checkbox group',
        description:
          'A real fieldset with a legend, so the group name is announced before every option. Descriptions sit under their label, not beside it.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <fieldset className="m-0 w-full max-w-sm border-0 p-0">
              <legend className="mb-2.5 text-label text-[var(--ds-fg-secondary)]">
                Notify me when
              </legend>
              <Stack gap="sm">
                <Checkbox
                  defaultChecked
                  label="A deployment fails"
                  description="Immediate, to email and Slack."
                />
                <Checkbox
                  defaultChecked
                  label="A certificate is expiring"
                  description="Seven days before expiry."
                />
                <Checkbox
                  label="Someone joins the workspace"
                  description="Digest, once per day."
                />
                <Checkbox
                  disabled
                  label="Billing thresholds"
                  description="Requires the Team plan."
                />
              </Stack>
            </fieldset>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Unchecked', render: <Checkbox aria-label="Unchecked" /> },
      { label: 'Checked', render: <Checkbox defaultChecked aria-label="Checked" /> },
      { label: 'Indeterminate', note: 'Parent, partial', render: <Checkbox indeterminate aria-label="Indeterminate" /> },
      { label: 'Hover', render: <Checkbox aria-label="Hover" className="[&_input]:border-[var(--ds-accent)] [&_input]:bg-[var(--ds-accent-subtle)]" /> },
      { label: 'Focus', render: <Checkbox aria-label="Focus" className="[&_input]:outline-2 [&_input]:outline-offset-2 [&_input]:outline-[var(--ds-focus-ring)]" /> },
      { label: 'Error', note: 'aria-invalid', render: <Checkbox error aria-label="Error" /> },
      { label: 'Disabled', render: <Checkbox disabled aria-label="Disabled" /> },
      { label: 'Disabled + checked', render: <Checkbox disabled defaultChecked aria-label="Disabled checked" /> },
      { label: 'Small', note: '16px box', render: <Checkbox size="sm" defaultChecked aria-label="Small" /> },
      { label: 'With label', render: <Checkbox defaultChecked label="Remember me" /> },
      { label: 'Two-line', render: <div className="max-w-[12rem]"><Checkbox defaultChecked label="Security alerts" description="Sent immediately." /></div> },
      { label: 'Required', render: <Checkbox label={<>I accept the terms <span className="text-[var(--ds-danger-text)]">*</span></>} /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Checkbox
          defaultChecked
          label="Email me about security alerts"
          description="Sent immediately, never batched."
        />
      </div>
    ),
    caption:
      'The label and description are inside the clickable region, which is what turns an 18px target into a comfortable one.',
    parts: [
      {
        n: 1,
        label: 'Box size',
        value: '18 × 18px',
        kind: 'size',
        note: 'The smallest square where a checkmark reads as a checkmark. 16px is available as the small size for dense tables and nowhere else.',
      },
      {
        n: 2,
        label: 'Corner radius',
        value: '4px · --radius-xs',
        kind: 'shape',
        note: 'Square-ish on purpose. A round checkbox reads as a radio, and users answer the wrong question.',
      },
      {
        n: 3,
        label: 'Box to label gap',
        value: '10px',
        kind: 'space',
        note: 'Wide enough that the checkmark and the first letter do not visually merge; narrow enough that they stay one unit.',
      },
      {
        n: 4,
        label: 'Optical offset',
        value: '2px from the top',
        kind: 'space',
        note: 'The box aligns with the cap height of the first line, not the line box. Centring on the line box drops it visibly low.',
      },
      {
        n: 5,
        label: 'Checkmark',
        value: '13px, 3.2 stroke',
        kind: 'shape',
        note: 'Heavier stroke than a normal icon. At 13px a 1.75 stroke disappears against a saturated fill.',
      },
      {
        n: 6,
        label: 'Check animation',
        value: 'scale 0.5 → 1, 140ms',
        kind: 'motion',
        note: 'The mark scales up from the centre as the fill lands. It reads as the box accepting the input rather than the mark being pasted on.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-field', usedFor: 'Unchecked box fill — a control goes above its container, never below it' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Unchecked box border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Checked fill and border' },
    { category: 'color', token: '--ds-accent-fg', usedFor: 'The checkmark' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Hover fill' },
    { category: 'color', token: '--ds-danger', usedFor: 'Error border' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: 'gap', value: '10px', usedFor: 'Box to label' },
    { category: 'spacing', token: 'stack gap', value: '10px', usedFor: 'Between checkboxes in a group' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Box corners' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Label' },
    { category: 'typography', token: '--text-caption', usedFor: 'Description' },
    { category: 'motion', token: 'duration', value: '120 / 140ms', usedFor: 'Fill transition, checkmark scale' },
  ],

  sizes: [
    { name: 'Small', height: '16px', gap: '10px', radius: '4px', icon: '11px', type: '13px', touch: '44px (row)', use: 'Table row selection and dense lists only.' },
    { name: 'Medium', height: '18px', gap: '10px', radius: '4px', icon: '13px', type: '13px', touch: '44px (row)', use: 'The default everywhere else.' },
    { name: 'With description', height: '18px', gap: '10px', type: '13px / 12px', maxWidth: '60ch', use: 'Adds a second line. Keep the description to one line where possible.' },
  ],

  do: [
    {
      title: 'Make the label part of the target',
      why: 'A real <label for> means clicking the text toggles the box. It turns an 18px target into a 200px one at no cost, and it is the single biggest usability difference between a good and a bad checkbox.',
      render: <Checkbox defaultChecked label="Click anywhere on this text" />,
    },
    {
      title: 'Write labels as positive statements',
      why: '"Do not send me email" checked means no email — a double negative the user has to unpick. Always phrase the checked state as the thing that happens.',
      render: (
        <Stack gap="sm">
          <Checkbox defaultChecked label="Send me product updates" />
          <span className="text-caption text-[var(--ds-fg-muted)]">not "Unsubscribe from updates"</span>
        </Stack>
      ),
    },
    {
      title: 'Use indeterminate for a partial parent',
      why: 'A parent that shows unchecked when three of five children are selected is lying. Indeterminate is the only honest representation, and users understand it immediately.',
      render: (
        <Stack gap="sm">
          <Checkbox indeterminate label="All permissions" description="3 of 5 selected" />
        </Stack>
      ),
    },
    {
      title: 'Stack vertically',
      why: 'One left edge means one fixation per option. A horizontal row forces the eye to jump between differing label widths and makes it ambiguous which label belongs to which box.',
      render: (
        <Stack gap="sm">
          <Checkbox defaultChecked label="Staging" />
          <Checkbox label="Production" />
          <Checkbox label="Preview" />
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a checkbox for an instant setting',
      why: 'A checkbox implies a pending change. If the value saves the moment it is clicked, a switch communicates that correctly and a checkbox does not.',
      render: (
        <Stack gap="sm">
          <Checkbox defaultChecked label="Dark mode" />
          <span className="text-caption text-[var(--ds-fg-muted)]">…saved instantly? Then it is a switch.</span>
        </Stack>
      ),
    },
    {
      title: 'Do not use checkboxes for a single choice',
      why: 'Multiple checkboxes where only one may be selected forces the user to discover the rule by trying it. Radio buttons express it in the shape of the control.',
      render: (
        <Stack gap="sm">
          <Checkbox label="Monthly" />
          <Checkbox defaultChecked label="Annual" />
          <span className="text-caption text-[var(--ds-danger-text)]">only one is valid — so use radios</span>
        </Stack>
      ),
    },
    {
      title: 'Do not pre-check a consent box',
      why: 'Pre-ticked marketing consent is unlawful under GDPR and, more simply, it is not consent. Any box that grants a permission starts unchecked.',
      render: (
        <Checkbox defaultChecked label="Share my data with partners" />
      ),
    },
    {
      title: 'Do not hide the box and style a div',
      why: 'A styled div loses keyboard support, form participation, indeterminate, and the native accessibility tree. Keep the real input and style it with appearance: none.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;div className="checkbox" onClick={'{'}toggle{'}'} /&gt;
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The unchecked border must reach 3:1 against the surface — it is the only thing showing the control exists.',
      'The checkmark must reach 3:1 against the checked fill. White on our accent is 4.6:1 in dark and 5.7:1 in light.',
      'Never signal a checked state with fill colour alone. The checkmark is the redundant encoding.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to each checkbox. Unlike radios, every checkbox in a group is tabbable.' },
      { keys: 'Space', does: 'Toggles. Enter does not activate a checkbox — that is native behaviour, not a bug.' },
    ],
    aria: [
      { attr: '<input type="checkbox">', on: 'The control', note: 'Native gives role, state, keyboard and form participation with zero ARIA.' },
      { attr: '<label for>', on: 'The label', note: 'Provides the accessible name and extends the hit area. Not optional.' },
      { attr: 'indeterminate', on: 'The DOM property', note: 'There is no HTML attribute. It must be set in JavaScript, and it maps to aria-checked="mixed".' },
      { attr: 'aria-describedby', on: 'The input', note: 'Points at the description, so it is announced after the label.' },
      { attr: 'aria-invalid', on: 'The input', note: 'For a required consent box that was not ticked.' },
      { attr: '<fieldset> + <legend>', on: 'A group', note: 'The legend is announced before every option, giving each one its context.' },
    ],
    focus:
      'The ring is on the box, not the whole row. A ring around the full label block makes it ambiguous which of several stacked options is focused.',
    screenReader: [
      'Announced as "checkbox, checked" or "checkbox, not checked". Indeterminate announces as "mixed".',
      'The description must be wired with aria-describedby — visual proximity means nothing to a screen reader.',
      'For a parent/child tree, announce the count in the parent’s description: "3 of 5 selected".',
    ],
    touch:
      'The clickable row is at least 44px tall on coarse pointers even though the box is 18px. Adjacent checkboxes need 8px of clear space between their rows.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Checkbox } from '@/ui/Toggle'

// Basic
<Checkbox
  label="Email me about security alerts"
  description="Sent immediately, never batched."
  checked={value}
  onChange={(e) => setValue(e.target.checked)}
/>

// Parent / child. Indeterminate is derived, never stored.
const all  = selected.length === options.length
const some = selected.length > 0 && !all

<Checkbox
  checked={all}
  indeterminate={some}
  onChange={() => setSelected(all ? [] : options.map((o) => o.id))}
  label="All permissions"
  description={selected.length + ' of ' + options.length + ' selected'}
/>

// Group: a real fieldset, so the legend is announced with every option
<fieldset>
  <legend>Notify me when</legend>
  {options.map((o) => (
    <Checkbox
      key={o.id}
      label={o.label}
      checked={selected.includes(o.id)}
      onChange={() => toggle(o.id)}
    />
  ))}
</fieldset>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-checkbox">
  <input class="ds-checkbox__input" type="checkbox" id="alerts"
         name="alerts" aria-describedby="alerts-desc" checked />
  <span class="ds-checkbox__mark" aria-hidden="true">
    <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
  </span>
  <label class="ds-checkbox__label" for="alerts">
    Email me about security alerts
  </label>
  <p class="ds-checkbox__desc" id="alerts-desc">Sent immediately, never batched.</p>
</div>

<!-- Indeterminate has no attribute. It must be set in JavaScript: -->
<script>
  document.getElementById('all').indeterminate = true
</script>`,
    },
    css: {
      lang: 'css',
      code: `.ds-checkbox__input {
  appearance: none;               /* keep the element, drop the paint */
  inline-size: 18px;
  block-size: 18px;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--radius-xs);

  /* The control rung, not the well one. On --ds-surface-inset an unchecked
     box sits below the card holding it and reads as switched off. */
  background: var(--ds-field);
  transition:
    background-color 120ms var(--ease-standard),
    border-color     120ms var(--ease-standard);
}

.ds-checkbox__input:hover:not(:disabled) {
  border-color: var(--ds-accent);
  background: var(--ds-accent-subtle);
}

.ds-checkbox__input:checked,
.ds-checkbox__input:indeterminate {
  background: var(--ds-accent);
  border-color: var(--ds-accent);
}

.ds-checkbox__input:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* The mark scales in as the fill lands */
.ds-checkbox__mark {
  opacity: 0;
  transform: scale(0.5);
  transition: all 140ms var(--ease-emphasized);
  color: var(--ds-accent-fg);
}
.ds-checkbox__input:checked + .ds-checkbox__mark,
.ds-checkbox__input:indeterminate + .ds-checkbox__mark {
  opacity: 1;
  transform: scale(1);
}

/* Align the box to the cap height, not the line box */
.ds-checkbox__input { margin-block-start: 2px; }`,
    },
    api: [
      {
        name: 'Checkbox',
        props: [
          { name: 'label', type: 'ReactNode', description: 'Rendered as a real <label for>. Extends the hit area.' },
          { name: 'description', type: 'ReactNode', description: 'Second line, wired with aria-describedby.' },
          { name: 'checked', type: 'boolean', description: 'Controlled. Omit for uncontrolled with defaultChecked.' },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Sets the DOM property. Derive it; never store it as a third value.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '16px or 18px box.' },
          { name: 'error', type: 'boolean', default: 'false', description: 'Red border plus aria-invalid.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Dims the whole row, including the label.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order options by likelihood or by an existing convention, not alphabetically. Alphabetical order is only correct when the user already knows exactly what they are looking for.',
      'For a "select all" that spans pages, say what it selects: "All 25 on this page" and "All 1,432 matching" are different actions and must be separate controls.',
      'A required consent checkbox should be validated on submit, not on blur. Blurring a checkbox the user has not decided about yet is not a mistake.',
      'Keep descriptions to one line. A checkbox with a paragraph attached is a decision that deserves a RadioCard or its own section.',
    ],
    performance: [
      'For a table with thousands of selectable rows, store selection in a Set and virtualise. Rendering ten thousand inputs blocks the main thread for hundreds of milliseconds.',
      'Derive indeterminate during render rather than storing it. A stored third state inevitably drifts out of sync with the children.',
      'Avoid a state update per checkbox in a large group — batch into one array update so the group re-renders once.',
    ],
    mistakes: [
      'Trying to set indeterminate as a JSX attribute. React passes unknown attributes through to the DOM as strings; it must be assigned as a property in an effect.',
      'Using Enter to toggle. Native checkboxes respond to Space only, and overriding that surprises keyboard users.',
      'Putting the label before the box in the DOM to get a right-aligned layout. Use flex ordering instead, so the reading order stays correct.',
      'Making the entire row a click target including a nested link, so clicking the link also toggles the checkbox.',
    ],
    realWorld: [
      'In permission and scope UIs, show the effective result of the selection as plain text underneath. Users routinely misjudge what a combination of scopes actually grants.',
      'For terms and conditions, put the checkbox after the text and keep the link opening in a new tab. Navigating away mid-form loses everything the user typed.',
      'Log which options in a group are never selected. An option nobody chooses is either badly labelled or should not exist.',
      'When a table has both row selection and row navigation, keep the checkbox column separate and stop propagation on it. Otherwise selecting a row navigates away from it.',
    ],
  },
})
