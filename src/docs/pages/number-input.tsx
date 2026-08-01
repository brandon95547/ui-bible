import * as React from 'react'
import { CurrencyInput, Field, NumberInput } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [value, setValue] = React.useState<number | ''>(3)
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [step, setStep] = React.useState<'1' | '5' | '0.25'>('1')
  const [bounded, setBounded] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={180}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Step">
            <KnobSelect value={step} onChange={setStep} options={['1', '5', '0.25'] as const} />
          </Knob>
          <KnobToggle checked={bounded} onChange={setBounded} label="Min / max" />
        </div>
      }
      code={`<Field label="Replicas" description="Between 1 and 12.">
  <NumberInput
    size="${size}"
    step={${step}}${bounded ? '\n    min={1}\n    max={12}' : ''}
    value={value}
    onValueChange={setValue}
  />
</Field>`}
    >
      <div className="w-full max-w-xs">
        <Field
          label="Replicas"
          description={bounded ? 'Between 1 and 12.' : 'Any whole number.'}
        >
          <NumberInput
            size={size}
            step={Number(step)}
            min={bounded ? 1 : undefined}
            max={bounded ? 12 : undefined}
            value={value}
            onValueChange={setValue}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'number-input',
    title: 'Number Input',
    tagline:
      'Constrained numeric entry with steppers, clamping and locale formatting — and no scroll-wheel surprises.',
    keywords: ['spin button', 'stepper', 'quantity', 'currency', 'min max step', 'inputmode'],
  },

  overview: {
    purpose:
      'A number input collects a value from a bounded numeric range and gives the user two ways to reach it: type the number, or nudge it with the steppers. The steppers are what distinguish it from a text field that happens to hold digits — they make small adjustments cheap, which is what most numeric editing actually is.',
    whenToUse: [
      'A bounded quantity the user adjusts as much as sets: replicas, retries, quantity, timeout.',
      'Values where ±1 is a common operation and typing the whole number is not.',
      'Money, percentages and durations, where formatting matters as much as the digits.',
    ],
    whenNotToUse: [
      {
        text: 'The number is an identifier rather than a quantity — a phone number, a card number, a PIN.',
        instead: 'a Text Field, a Phone Input, or a Pin Input',
        to: '#/phone-input',
      },
      {
        text: 'The approximate position matters more than the exact figure.',
        instead: 'a Slider',
        to: '#/slider',
      },
      {
        text: 'There are fewer than about six valid values.',
        instead: 'a Select or Radio Button — steppers to reach one of four options is work',
        to: '#/select',
      },
      {
        text: 'The range spans many orders of magnitude.',
        instead: 'a Text Field with units, since stepping from 1 to 100,000 is not a nudge',
        to: '#/text-field',
      },
    ],
    reasoning: (
      <>
        <p>
          <code>&lt;input type="number"&gt;</code> is a trap in its default form. It silently
          accepts <code>e</code>, <code>+</code> and <code>-</code> because they are valid in
          scientific notation, it returns an empty string for anything it considers invalid — so
          you cannot tell "empty" from "garbage" — and it steps on scroll, which means a user
          scrolling past a focused field changes a value they never touched. Every one of those
          needs handling explicitly.
        </p>
        <p>
          <strong>Clamp on blur, not on keystroke.</strong> Typing "25" into a field with a maximum
          of 12 means passing through "2", and clamping mid-word turns it into "2" and then fights
          the user for the next character. Let the value be wrong while they type; correct it, with
          a message, when they leave.
        </p>
        <p>
          The steppers are for nudging, not travelling. If reaching a common value takes more than
          about five presses, the step is wrong or the control is — a timeout that steps in
          seconds from 0 to 300 needs a bigger step, a preset, or a different component.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'money',
        title: 'Currency',
        description:
          'The symbol is a prefix, not part of the value. Alignment is right, figures are tabular, and the decimal places are fixed on blur so a column of amounts lines up.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-xs">
              <Field label="Monthly budget" description="Billed in USD.">
                <CurrencyInput value={2400} step={100} min={0} onValueChange={() => {}} />
              </Field>
              <Field label="Spend limit">
                <CurrencyInput value={49.5} step={0.5} min={0} onValueChange={() => {}} />
              </Field>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'clamping',
        title: 'Clamp on blur',
        description:
          'The field accepts an out-of-range value while the user types and corrects it when they leave. Clamping per keystroke makes typing "25" into a max-12 field impossible.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Clamp on blur" tone="good">
                <Field label="Replicas" description="Between 1 and 12." message="Adjusted to the maximum of 12." status="warning">
                  <NumberInput value={12} min={1} max={12} onValueChange={() => {}} />
                </Field>
              </Cell>
              <Cell label="Clamp per keystroke" tone="bad">
                <Field label="Replicas" description="Typing “25” gives you “2”, then fights you.">
                  <NumberInput value={2} min={1} max={12} onValueChange={() => {}} />
                </Field>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'units',
        title: 'Units belong in the field',
        description:
          'A suffix inside the control removes the ambiguity that a label alone leaves. "Timeout: 30" is seconds or milliseconds depending on who is reading.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-xs">
              <Field label="Request timeout">
                <NumberInput value={30} min={1} max={300} step={5} suffix="sec" onValueChange={() => {}} />
              </Field>
              <Field label="Sample rate">
                <NumberInput value={25} min={0} max={100} step={5} suffix="%" onValueChange={() => {}} />
              </Field>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'The steppers keep a fixed width across sizes — they are targets, not glyphs, and shrinking them below 20px makes ±1 a game of accuracy.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-xs">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <NumberInput key={s} size={s} value={3} min={0} max={12} aria-label={`Size ${s}`} onValueChange={() => {}} />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <div className="w-40"><NumberInput value={3} aria-label="d" onValueChange={() => {}} /></div> },
      { label: 'At minimum', render: <div className="w-40"><NumberInput value={0} min={0} max={12} aria-label="min" onValueChange={() => {}} /></div> },
      { label: 'At maximum', render: <div className="w-40"><NumberInput value={12} min={0} max={12} aria-label="max" onValueChange={() => {}} /></div> },
      { label: 'Empty', render: <div className="w-40"><NumberInput value="" aria-label="empty" onValueChange={() => {}} /></div> },
      { label: 'Error', render: <div className="w-40"><NumberInput value={99} min={1} max={12} status="error" aria-label="err" onValueChange={() => {}} /></div> },
      { label: 'Disabled', render: <div className="w-40"><NumberInput value={3} disabled aria-label="dis" onValueChange={() => {}} /></div> },
      { label: 'Read only', render: <div className="w-40"><NumberInput value={3} readOnly aria-label="ro" onValueChange={() => {}} /></div> },
      { label: 'Currency', render: <div className="w-40"><CurrencyInput value={2400} aria-label="cur" onValueChange={() => {}} /></div> },
      { label: 'With unit', render: <div className="w-40"><NumberInput value={30} suffix="sec" aria-label="unit" onValueChange={() => {}} /></div> },
      { label: 'Decimal', render: <div className="w-40"><NumberInput value={0.25} step={0.25} aria-label="dec" onValueChange={() => {}} /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xs">
        <Field label="Replicas" description="Between 1 and 12.">
          <NumberInput value={3} min={1} max={12} suffix="pods" onValueChange={() => {}} />
        </Field>
      </div>
    ),
    caption:
      'A right-aligned tabular value, a unit suffix, and stacked steppers that disable at the bounds rather than disappearing.',
    parts: [
      {
        n: 1,
        label: 'Field width',
        value: '7–10rem',
        kind: 'size',
        note: 'Sized to the widest expected number plus the steppers. A number field stretched to the form width claims a magnitude it will never hold.',
      },
      {
        n: 2,
        label: 'Alignment',
        value: 'Right, tabular figures',
        kind: 'type',
        note: 'Units line up vertically in a column of fields, so magnitude becomes readable as shape. Tabular figures stop the value shifting as digits change.',
      },
      {
        n: 3,
        label: 'Steppers',
        value: '20 × 16px, stacked',
        kind: 'size',
        note: 'Stacked rather than flanking, so the field stays compact and the value keeps its full width. Below 20px, ±1 becomes a test of accuracy.',
      },
      {
        n: 4,
        label: 'Bound behaviour',
        value: 'Disabled, never hidden',
        kind: 'color',
        note: 'A stepper that vanishes at the limit shifts the layout and removes the only signal that a limit exists.',
      },
      {
        n: 5,
        label: 'Unit suffix',
        value: 'Muted, inside the field',
        kind: 'type',
        note: 'Part of the control, not the value. It removes the ambiguity a label alone leaves — 30 seconds or 30 milliseconds.',
      },
      {
        n: 6,
        label: 'Step',
        value: 'Matches how people think',
        kind: 'motion',
        note: '1 for replicas, 5 for percentages, 100 for a budget. If a common value takes more than five presses, the step is wrong.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo' },
    { category: 'color', token: '--ds-fg', usedFor: 'The value' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Unit suffix and stepper glyphs' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'A stepper at its bound' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Out-of-range border' },
    { category: 'spacing', token: 'padding', value: '0 8px 0 12px', usedFor: 'Reduced on the stepper side' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'The value, so digits do not shift width' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Stepper hover and press' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 6px 0 10px', type: '13px', minWidth: '5.5rem', use: 'Table cells and dense filter bars.' },
    { name: 'Medium', height: '36px', padding: '0 8px 0 12px', type: '15px', minWidth: '7rem', use: 'The default.' },
    { name: 'Large', height: '44px', padding: '0 10px 0 14px', type: '16px', minWidth: '8rem', use: 'Touch-first layouts and checkout quantities.' },
    { name: 'Stepper', height: '16px', minWidth: '20px', touch: '44px combined on coarse pointers', use: 'Stacked. Disabled at the bounds, never removed.' },
    { name: 'Currency', minWidth: '9rem', use: 'Extra room for the symbol prefix and two decimal places.' },
  ],

  do: [
    {
      title: 'Clamp on blur, not per keystroke',
      why: 'Typing "25" into a max-12 field passes through "2". Clamp as they type and the field fights every character after the first.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onBlur → clamp(value, min, max)
          <br />
          <span className="text-[var(--ds-danger-text)]">✗ onChange → clamp(…)</span>
        </code>
      ),
    },
    {
      title: 'Disable the steppers at the bounds',
      why: 'It is the only affordance that says a limit exists. Hiding them shifts the layout at exactly the moment the user has reached the edge.',
      render: (
        <Row gap="sm">
          <div className="w-32"><NumberInput value={0} min={0} max={12} aria-label="at min" onValueChange={() => {}} /></div>
          <div className="w-32"><NumberInput value={12} min={0} max={12} aria-label="at max" onValueChange={() => {}} /></div>
        </Row>
      ),
    },
    {
      title: 'Put the unit in the field',
      why: '"Timeout: 30" is seconds or milliseconds depending on who reads it. A suffix inside the control removes the guess for everyone.',
      render: (
        <div className="w-36">
          <NumberInput value={30} suffix="sec" aria-label="unit" onValueChange={() => {}} />
        </div>
      ),
    },
    {
      title: 'Set inputmode, not just type',
      why: 'inputmode="decimal" gives mobile users a numeric keypad without inheriting type="number"’s scroll-stepping and its empty-string-on-invalid behaviour.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          type="text" inputmode="decimal"
          <br />
          pattern="[0-9]*"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not let the scroll wheel change the value',
      why: 'A user scrolling the page past a focused field silently changes a number they never touched, and they find out at submit. Blur on wheel, or prevent it outright.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          focus + scroll page → replicas: 3 → 47
        </span>
      ),
    },
    {
      title: 'Do not use it for identifiers',
      why: 'Phone numbers, card numbers and PINs are digit strings, not quantities. Steppers are meaningless on them, and leading zeros get eaten.',
      render: (
        <div className="w-40">
          <NumberInput value={4111111111111111} aria-label="card" onValueChange={() => {}} />
        </div>
      ),
    },
    {
      title: 'Do not stretch it to the form width',
      why: 'Field width is a hint about magnitude. A full-width field for a value between 1 and 12 reads as a place to type a large number.',
      render: (
        <div className="w-full max-w-sm">
          <NumberInput value={3} min={1} max={12} aria-label="too wide" onValueChange={() => {}} />
        </div>
      ),
    },
    {
      title: 'Do not make the steppers the only way to reach a value',
      why: 'Stepping from 0 to 300 in fives is sixty presses. The field must always accept a typed value, and a big range needs presets rather than patience.',
      render: (
        <Row gap="sm" align="center">
          <div className="w-32"><NumberInput value={0} min={0} max={300} step={5} aria-label="long" onValueChange={() => {}} /></div>
          <span className="text-caption text-[var(--ds-danger-text)]">→ 60 presses to 300</span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Stepper glyphs at 12px owe 4.5:1 — they are small and they are the control.',
      'A stepper disabled at its bound may use the disabled tone, and the bound must also be conveyed by aria-valuemin/max rather than by colour alone.',
      'The unit suffix is content and owes 4.5:1. It is frequently the only thing telling the user what the number means.',
    ],
    keyboard: [
      { keys: '↑ / ↓', does: 'Increments and decrements by step. The native behaviour of a spinbutton, and users expect it.' },
      { keys: 'Page Up / Page Down', does: 'Steps by a larger amount — ten steps by convention. Free to add and invaluable on a wide range.' },
      { keys: 'Home / End', does: 'Jumps to min or max when both are defined.' },
      { keys: 'Tab', does: 'Leaves the field. The steppers are not separate tab stops — arrows already do their job.' },
      { keys: 'Scroll wheel', does: 'Nothing. Must be explicitly suppressed, or a page scroll changes a focused field.' },
    ],
    aria: [
      { attr: 'role="spinbutton"', on: 'The field', note: 'Implicit on input[type=number]; explicit when using type="text" with inputmode.' },
      { attr: 'aria-valuenow / valuemin / valuemax', on: 'The field', note: 'How the range reaches a screen-reader user. Disabled steppers do not communicate bounds on their own.' },
      { attr: 'aria-valuetext', on: 'The field', note: 'For values that need units or formatting: "30 seconds", "$2,400". A bare "30" is ambiguous read aloud.' },
      { attr: 'aria-label', on: 'Each stepper', note: '"Increase replicas" / "Decrease replicas". A bare "+" is not a name.' },
      { attr: 'aria-hidden', on: 'The steppers', note: 'A defensible alternative — arrow keys already provide the function, and hiding them removes two redundant stops from the screen-reader path.' },
      { attr: 'inputmode="decimal"', on: 'The field', note: 'Gives a numeric keypad on mobile without inheriting type="number"’s behaviour.' },
    ],
    focus:
      'Focus stays on the field when a stepper is pressed — the steppers act on the field, they do not take focus from it. The focus halo must be visible around the whole control, including the stepper column.',
    screenReader: [
      'The field announces as "Replicas, spin button, 3, minimum 1, maximum 12". That single announcement is where the range comes from.',
      'Use aria-valuetext whenever units or formatting matter, or "2400" is read as a bare number rather than a budget.',
      'Announce a clamp when it happens: "Adjusted to the maximum of 12". Silently correcting a value the user typed is the most confusing thing this control can do.',
    ],
    touch:
      'Steppers need a 44px combined target on coarse pointers, which usually means widening the column rather than growing the glyphs. Set inputmode so the numeric keypad appears — a full keyboard for a field that only accepts digits is a small insult repeated on every use. Quantity steppers in a cart are one of the few places large flanking +/− buttons beat the stacked layout.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Field, NumberInput } from '@/ui/Input'

<Field label="Replicas" description="Between 1 and 12.">
  <NumberInput
    value={replicas}
    onValueChange={setReplicas}
    min={1}
    max={12}
    step={1}
    suffix="pods"
  />
</Field>

// type="number" is a trap: it accepts 'e', '+' and '-', returns '' for
// anything it dislikes — so you cannot tell empty from garbage — and steps
// on scroll. This is the version that behaves.
function NumberField({ value, onValueChange, min, max, step = 1 }) {
  const [draft, setDraft] = React.useState(String(value ?? ''))

  return (
    <input
      type="text"
      inputMode="decimal"
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}   // no clamping here
      // Clamp on blur. Typing "25" into a max-12 field must pass through "2".
      onBlur={() => {
        const n = Number(draft)
        if (Number.isNaN(n)) return setDraft(String(value ?? ''))
        const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
        onValueChange(clamped)
        setDraft(String(clamped))
        if (clamped !== n) announce(\`Adjusted to \${clamped}\`)
      }}
      // A page scroll must never change a focused value.
      onWheel={(e) => e.currentTarget.blur()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp')   { e.preventDefault(); nudge(+step) }
        if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-step) }
        if (e.key === 'PageUp')    { e.preventDefault(); nudge(+step * 10) }
        if (e.key === 'PageDown')  { e.preventDefault(); nudge(-step * 10) }
      }}
    />
  )
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label for="replicas">Replicas</label>
  <p id="replicas-desc">Between 1 and 12.</p>

  <div class="ds-number">
    <input
      id="replicas"
      type="text"
      inputmode="decimal"
      role="spinbutton"
      aria-valuenow="3"
      aria-valuemin="1"
      aria-valuemax="12"
      aria-valuetext="3 pods"
      aria-describedby="replicas-desc"
      value="3"
    />
    <span class="ds-number__unit" aria-hidden="true">pods</span>

    <span class="ds-number__steppers">
      <!-- Disabled at the bound, never removed: it is the only signal
           that a limit exists. -->
      <button type="button" aria-label="Increase replicas">▲</button>
      <button type="button" aria-label="Decrease replicas" disabled>▼</button>
    </span>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-number {
  display: inline-flex;
  align-items: center;
  inline-size: 7rem;                 /* width hints at magnitude */
  block-size: 36px;
  padding-inline: 12px 8px;          /* reduced on the stepper side */
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

.ds-number input {
  inline-size: 100%;
  text-align: end;                   /* a column of numbers lines up */
  font-variant-numeric: tabular-nums;
  background: none;
  border: 0;
}

/* Kill the native spinners: we draw our own so they can be sized as targets
   and disabled at the bounds. */
.ds-number input::-webkit-outer-spin-button,
.ds-number input::-webkit-inner-spin-button { appearance: none; margin: 0; }
.ds-number input[type='number'] { -moz-appearance: textfield; }

.ds-number__steppers {
  display: grid;
  grid-template-rows: 1fr 1fr;
  inline-size: 20px;
  margin-inline-start: 6px;
}
.ds-number__steppers button { block-size: 16px; color: var(--ds-fg-muted); }
.ds-number__steppers button:disabled { color: var(--ds-fg-disabled); }

@media (pointer: coarse) {
  .ds-number__steppers { inline-size: 44px; }
  .ds-number__steppers button { block-size: 22px; }
}`,
    },
    api: [
      {
        name: 'NumberInput',
        props: [
          { name: 'value', type: "number | ''", required: true, description: 'The empty string is empty, which is distinct from 0 and must stay that way.' },
          { name: 'onValueChange', type: "(v: number | '') => void", required: true, description: 'Fires on blur and on each stepper press — not on every keystroke.' },
          { name: 'min', type: 'number', description: 'Clamped on blur. Also becomes aria-valuemin.' },
          { name: 'max', type: 'number', description: 'Clamped on blur. Also becomes aria-valuemax.' },
          { name: 'step', type: 'number', default: '1', description: 'Should match how people think about the value. If a common target takes more than five presses, it is wrong.' },
          { name: 'suffix', type: 'string', description: 'Units shown inside the field. Not part of the value.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Steppers keep a fixed target width across sizes.' },
        ],
      },
      {
        name: 'CurrencyInput',
        props: [
          { name: 'currency', type: 'string', default: "'USD'", description: 'ISO code. Drives grouping and decimal places via Intl.NumberFormat.' },
          { name: 'symbol', type: 'string', default: "'$'", description: 'Rendered as a prefix. Never part of the value.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Format on blur, edit raw on focus. "$2,400.00" is right for reading and hostile to edit; showing "2400" while focused removes the fight with the cursor.',
      'Offer presets alongside the field for wide ranges — 30s / 1m / 5m beside a timeout is worth more than any step size.',
      'Select the whole value on focus for fields users usually replace rather than adjust. Not for ones they nudge, where it destroys the current value on a stray keypress.',
      'Accept pasted values with symbols and separators — "$1,200" should become 1200 rather than being rejected. People paste from spreadsheets constantly.',
      'Never use 0 as a placeholder. It is indistinguishable from a real value, and users submit it without realising they never chose it.',
    ],
    performance: [
      'Hold the draft as a string in local state and lift the parsed number on blur. Parsing on every keystroke in a large form re-renders everything for a value nobody has finished typing.',
      'Debounce any request the value triggers by about 400ms, or holding the stepper fires one request per repeat.',
      'Add press-and-hold acceleration on the steppers for wide ranges, capped so it never overshoots past the bound.',
    ],
    mistakes: [
      'Scroll-wheel stepping, silently changing a focused field while the user scrolls the page.',
      'Clamping on every keystroke, so an out-of-range number cannot be typed at all.',
      'Using it for phone or card numbers, where steppers are meaningless and leading zeros vanish.',
      'Hiding steppers at the bounds, shifting the layout and removing the only sign a limit exists.',
      'Treating type="number"’s empty string on invalid input as "the user cleared the field".',
      'No inputmode, so mobile users get a full keyboard for a digits-only field.',
      'Steppers with no accessible name, announced as "button, button".',
    ],
    realWorld: [
      'Quantity steppers in a cart are the highest-traffic instance of this control anywhere, and they are the one case where large flanking +/− buttons beat the stacked layout — the whole interaction is thumb-driven.',
      'Currency fields should always allow more precision than they display, then round on submit. Silently truncating a third decimal place is a support ticket that takes an hour to reproduce.',
      'For configuration values, showing the default beside the field ("Default: 3") saves more support time than any amount of validation copy.',
      'If users routinely type rather than step, the steppers are decoration and the range is probably too wide for the control.',
    ],
  },
})
