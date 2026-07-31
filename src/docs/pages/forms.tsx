import * as React from 'react'
import { Check, CreditCard, Lock } from 'lucide-react'
import { Field, FieldRow, Fieldset, TextInput, Textarea } from '@/ui/Input'
import { Select } from '@/ui/Select'
import { Checkbox, RadioCard, Switch } from '@/ui/Toggle'
import { Button } from '@/ui/Button'
import { Alert } from '@/ui/Feedback'
import { Progress } from '@/ui/Feedback'
import { Knob, KnobSelect, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   PLAYGROUND — the same four fields, with the three decisions that actually
   change the completion rate exposed as knobs.
   ======================================================================== */

type Timing = 'submit' | 'blur' | 'keystroke'
type Marking = 'required' | 'optional'

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

function Playground() {
  const [cols, setCols] = React.useState<'1' | '2'>('1')
  const [timing, setTiming] = React.useState<Timing>('blur')
  const [marking, setMarking] = React.useState<Marking>('optional')

  const [values, setValues] = React.useState({ name: '', email: '', company: '', role: '' })
  const [touched, setTouched] = React.useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = React.useState(false)

  const errors: Record<string, string> = {}
  if (!values.name) errors.name = 'Enter your full name.'
  if (!values.email) errors.email = 'Enter your email address.'
  else if (!isEmail(values.email)) errors.email = 'That does not look like an email address.'

  /** The entire argument of this page, in one function. */
  const showError = (k: string) => {
    if (!errors[k]) return false
    if (timing === 'keystroke') return !!values[k as keyof typeof values] || submitted
    if (timing === 'blur') return !!touched[k] || submitted
    return submitted
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }))
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }))

  const req = marking === 'required'
  const fieldFlags = (k: string, optional?: boolean) => ({
    required: req && !optional,
    optional: !req && optional,
    status: showError(k) ? ('error' as const) : ('default' as const),
    message: showError(k) ? errors[k] : undefined,
  })

  return (
    <PreviewStage
      label="Playground"
      minHeight={320}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Columns">
            <KnobSelect value={cols} onChange={setCols} options={['1', '2'] as const} />
          </Knob>
          <Knob label="Validate on">
            <KnobSelect
              value={timing}
              onChange={setTiming}
              options={['submit', 'blur', 'keystroke'] as const}
            />
          </Knob>
          <Knob label="Mark">
            <KnobSelect
              value={marking}
              onChange={setMarking}
              options={['required', 'optional'] as const}
            />
          </Knob>
        </div>
      }
      code={`<form onSubmit={handleSubmit} noValidate>
  <Field
    label="Full name"
    ${marking === 'required' ? 'required' : ''}
    status={showError('name') ? 'error' : 'default'}
    message={showError('name') ? errors.name : undefined}
  >
    <TextInput
      autoComplete="name"
      value={values.name}
      onChange={set('name')}
      onBlur={blur('name')}
    />
  </Field>
  …
</form>`}
    >
      <div className="mx-auto w-full max-w-[34rem]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <Stack gap="lg">
            <p className="text-caption text-[var(--ds-fg-muted)]">
              Type one character into Email. On <strong>keystroke</strong> it is wrong before you
              have finished; on <strong>blur</strong> it waits until you have; on{' '}
              <strong>submit</strong> it makes you find the problem yourself.
            </p>

            <FieldRow cols={cols === '2' ? 2 : 1}>
              <Field label="Full name" {...fieldFlags('name')}>
                <TextInput
                  autoComplete="name"
                  value={values.name}
                  onChange={set('name')}
                  onBlur={blur('name')}
                  status={showError('name') ? 'error' : 'default'}
                />
              </Field>
              <Field label="Email" {...fieldFlags('email')}>
                <TextInput
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={set('email')}
                  onBlur={blur('email')}
                  status={showError('email') ? 'error' : 'default'}
                />
              </Field>
            </FieldRow>

            <FieldRow cols={cols === '2' ? 2 : 1}>
              <Field label="Company" {...fieldFlags('company', true)}>
                <TextInput
                  autoComplete="organization"
                  value={values.company}
                  onChange={set('company')}
                />
              </Field>
              <Field
                label="Role"
                description="Helps us skip the parts you already know."
                {...fieldFlags('role', true)}
              >
                <TextInput value={values.role} onChange={set('role')} />
              </Field>
            </FieldRow>

            <Row className="justify-end">
              <Button type="button" variant="text">
                Cancel
              </Button>
              <Button type="submit">Create account</Button>
            </Row>
          </Stack>
        </form>
      </div>
    </PreviewStage>
  )
}

/* ===========================================================================
   EXAMPLES
   ======================================================================== */

const STEPS = ['Account', 'Workspace', 'Team', 'Billing']

function Wizard() {
  const [step, setStep] = React.useState(1)
  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <Stack gap="lg">
        <Stack gap="sm">
          <Row className="justify-between">
            <span className="text-label text-[var(--ds-fg)]">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </span>
            <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
              about {(STEPS.length - step) * 30}s left
            </span>
          </Row>
          <Progress value={((step + 1) / STEPS.length) * 100} size="sm" />
          <Row gap="sm">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`flex items-center gap-1 text-caption ${
                  i < step
                    ? 'text-[var(--ds-success-text)]'
                    : i === step
                      ? 'text-[var(--ds-fg)]'
                      : 'text-[var(--ds-fg-disabled)]'
                }`}
              >
                {i < step && <Check size={12} />}
                {s}
              </span>
            ))}
          </Row>
        </Stack>

        <Fieldset legend={STEPS[step]} description="Four short steps beats one long form.">
          <FieldRow cols={2}>
            <Field label="Workspace name">
              <TextInput defaultValue="Northwind" />
            </Field>
            <Field label="URL" description="You can change this later.">
              <TextInput prefix="app.co/" defaultValue="northwind" />
            </Field>
          </FieldRow>
          <Field label="What will you use it for?" optional>
            <Textarea rows={2} />
          </Field>
        </Fieldset>

        <Row className="justify-between">
          <Button variant="text" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          <Button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
          >
            {step === STEPS.length - 2 ? 'Finish' : 'Continue'}
          </Button>
        </Row>
      </Stack>
    </div>
  )
}

function SettingsForm() {
  const [saved, setSaved] = React.useState<string | null>(null)
  const [digest, setDigest] = React.useState(true)
  const [mentions, setMentions] = React.useState(true)

  const save = (what: string) => {
    setSaved(what)
    window.setTimeout(() => setSaved(null), 1600)
  }

  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <Stack gap="lg">
        <Row className="justify-between">
          <span className="text-h4 text-[var(--ds-fg)]">Notifications</span>
          <span
            className={`text-caption transition-opacity ${
              saved ? 'opacity-100 text-[var(--ds-success-text)]' : 'opacity-0'
            }`}
          >
            Saved
          </span>
        </Row>
        <Switch
          checked={digest}
          onCheckedChange={(v) => {
            setDigest(v)
            save('digest')
          }}
          align="end"
          label="Weekly digest"
          description="A summary of everything that changed, on Monday morning."
        />
        <Switch
          checked={mentions}
          onCheckedChange={(v) => {
            setMentions(v)
            save('mentions')
          }}
          align="end"
          label="Mentions"
          description="Email me when someone @-mentions me."
        />
        <p className="text-caption text-[var(--ds-fg-muted)]">
          No Save button. Each control commits on change and confirms in place — a settings page
          with a Save button at the bottom is a page people leave without pressing it.
        </p>
      </Stack>
    </div>
  )
}

function CheckoutForm() {
  const [plan, setPlan] = React.useState('team')
  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <Stack gap="lg">
        <Fieldset legend="Plan">
          <Stack gap="sm">
            {[
              { v: 'solo', t: 'Solo', d: '$12 / month · one seat' },
              { v: 'team', t: 'Team', d: '$40 / month · up to ten seats' },
            ].map((o) => (
              <RadioCard
                key={o.v}
                name="plan"
                value={o.v}
                checked={plan === o.v}
                onChange={() => setPlan(o.v)}
                label={o.t}
                description={o.d}
              />
            ))}
          </Stack>
        </Fieldset>

        <Fieldset legend="Payment">
          <Field label="Card number">
            <TextInput
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              startIcon={<CreditCard size={15} />}
            />
          </Field>
          <FieldRow cols={2}>
            <Field label="Expiry">
              <TextInput inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" />
            </Field>
            <Field label="CVC" description="Three digits on the back.">
              <TextInput inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
            </Field>
          </FieldRow>
          <FieldRow cols={2}>
            <Field label="Country">
              <Select
                options={[
                  { value: 'gb', label: 'United Kingdom' },
                  { value: 'us', label: 'United States' },
                ]}
                value="gb"
                onChange={() => {}}
                aria-label="Country"
              />
            </Field>
            <Field label="Postcode">
              <TextInput autoComplete="postal-code" />
            </Field>
          </FieldRow>
        </Fieldset>

        <Button fullWidth size="lg" startIcon={<Lock size={15} />}>
          Pay $40
        </Button>
        <p className="text-center text-caption text-[var(--ds-fg-muted)]">
          The button says what it costs. “Submit” at the end of a checkout is where people stop.
        </p>
      </Stack>
    </div>
  )
}

function ErrorSummary() {
  return (
    <div className="mx-auto w-full max-w-[34rem]">
      <Stack gap="md">
        <Alert tone="danger" title="Two fields need attention">
          <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-4">
            <li>
              <a href="#es-email" className="underline">
                Email — that does not look like an email address
              </a>
            </li>
            <li>
              <a href="#es-card" className="underline">
                Card number — we could not read this card
              </a>
            </li>
          </ul>
        </Alert>
        <Field label="Email" status="error" message="That does not look like an email address.">
          <TextInput id="es-email" status="error" defaultValue="ada@" />
        </Field>
        <Field label="Card number" status="error" message="We could not read this card.">
          <TextInput id="es-card" status="error" defaultValue="4242 4242" />
        </Field>
      </Stack>
    </div>
  )
}

/* -- little diagrams ------------------------------------------------------- */

function LayoutDiagram({ cols, tone }: { cols: 1 | 2; tone?: 'good' | 'bad' }) {
  const border =
    tone === 'good'
      ? 'border-[var(--ds-success-border)]'
      : tone === 'bad'
        ? 'border-[var(--ds-danger-border)]'
        : 'border-[var(--ds-border-subtle)]'
  return (
    <span
      className={`block w-36 rounded-[var(--radius-md)] border bg-[var(--ds-surface-inset)] p-2 ${border}`}
    >
      <span className={`grid gap-1.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {Array.from({ length: cols === 2 ? 6 : 3 }).map((_, i) => (
          <span key={i} className="flex flex-col gap-1">
            <span className="h-1 w-8 rounded-[1px] bg-[var(--ds-border-strong)]" />
            <span className="h-4 rounded-[2px] border border-[var(--ds-border)] bg-[var(--ds-surface)]" />
          </span>
        ))}
      </span>
    </span>
  )
}

export default defineDoc({
  meta: {
    id: 'forms',
    title: 'Forms',
    group: 'Inputs & Forms',
    tagline:
      'Fields are solved. Forms are not — the layout, the validation timing and the number of questions are what decide whether anyone finishes.',
    keywords: [
      'validation',
      'wizard',
      'multi-step',
      'checkout',
      'signup',
      'login',
      'settings',
      'autocomplete',
      'error summary',
      'form layout',
    ],
  },

  overview: {
    purpose:
      'This page is about assembling fields, not about the fields themselves. Grouping, order, width, validation timing, error recovery and the shape of the submit — the decisions that sit above the individual control and determine whether the form gets completed.',
    whenToUse: [
      'Any time you are collecting more than one piece of information at once.',
      'Sign-up, sign-in, checkout, settings, profile, onboarding — every one of them is the same handful of decisions in a different order.',
      'When you need to decide between one long form, a multi-step wizard, and a settings page that saves as it goes.',
    ],
    whenNotToUse: [
      {
        text: 'You need the specification of one control.',
        instead: 'the page for that control — Text Inputs, Dropdowns, Checkboxes, Radios, Switches',
        to: '#/text-inputs',
      },
      {
        text: 'It is a single field with a single action.',
        instead: 'an input and a button. A search box is not a form in this sense',
      },
      {
        text: 'The user is choosing rather than entering.',
        instead: 'a list, a picker or a menu. A form is for data you do not already have',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The strongest lever is the number of fields.</strong> Every question is a chance
          to abandon, and no amount of styling recovers what an unnecessary field costs. Before
          designing the layout, delete: anything you can derive, anything you can ask for later,
          anything only one team wanted. A five-field form that looks plain beats a nine-field form
          that looks beautiful, every time.
        </p>
        <p>
          <strong>Validation timing is the second lever, and the most commonly got wrong.</strong>{' '}
          Validating on every keystroke means telling someone their email is invalid when they have
          typed <code>a</code> — the form is wrong more often than the user is. Validating only on
          submit makes them hunt. The answer is asymmetric: validate on blur, when the user has
          finished with a field, and then, once a field has been marked invalid, re-validate on
          keystroke so the error clears the moment it is fixed. Strict on the way in, forgiving on
          the way out.
        </p>
        <p>
          <strong>One column.</strong> A single column has one unambiguous path through it. Two
          columns force the eye to decide at every row whether to go right or down, and the field
          people skip is almost always the one on the right. The exception is fields that are
          genuinely one thing — expiry and CVC, first and last name, city and postcode — where
          pairing them is what tells the user they belong together.
        </p>
        <p>
          <strong>Labels go above the field.</strong> Above means the label and the input share a
          vertical eye path, the label never truncates in any language, and there is room for a hint
          and an error without moving anything. Placeholder-as-label is the worst option available:
          it disappears exactly when it is needed — at the moment of typing — and it fails contrast
          before it fails usability.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'columns',
        title: 'One column, with deliberate exceptions',
        description:
          'A single column has one path through it. Pair fields only when they are one piece of information — expiry and CVC, city and postcode.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="start" className="justify-center">
              <Stack gap="xs" className="items-center">
                <LayoutDiagram cols={1} tone="good" />
                <span className="text-caption text-[var(--ds-fg-muted)]">One path down</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <LayoutDiagram cols={2} tone="bad" />
                <span className="text-caption text-[var(--ds-fg-muted)]">
                  A decision at every row
                </span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'wizard',
        title: 'Multi-step',
        description:
          'Split when the form has natural chapters, not to hide its length. Show where the user is, how much is left, and let them go back without losing anything.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Wizard />
          </PreviewStage>
        ),
      },
      {
        id: 'settings',
        title: 'Settings — no submit button',
        description:
          'Settings are independent switches, not a transaction. Each one commits on change and confirms in place.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <SettingsForm />
          </PreviewStage>
        ),
      },
      {
        id: 'checkout',
        title: 'Checkout',
        description:
          'The highest-stakes form there is. Every field has an autocomplete attribute, the numeric fields raise a numeric keypad, and the button says what it will cost.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <CheckoutForm />
          </PreviewStage>
        ),
      },
      {
        id: 'error-summary',
        title: 'The error summary',
        description:
          'On submit failure, a summary at the top linking to each bad field. It is the only pattern that works when the errors are below the fold, and it is what a screen reader needs.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ErrorSummary />
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Empty',
        render: (
          <span className="block h-8 w-32 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface)]" />
        ),
      },
      {
        label: 'Focused',
        render: (
          <span className="block h-8 w-32 rounded-[var(--radius-md)] border border-[var(--ds-accent)] bg-[var(--ds-surface)] outline-2 outline-offset-1 outline-[var(--ds-focus-ring)]" />
        ),
      },
      {
        label: 'Error',
        render: (
          <span className="block h-8 w-32 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface)]" />
        ),
      },
      {
        label: 'Success',
        render: (
          <span className="block h-8 w-32 rounded-[var(--radius-md)] border border-[var(--ds-success-border)] bg-[var(--ds-surface)]" />
        ),
      },
      {
        label: 'Disabled',
        render: (
          <span className="block h-8 w-32 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]" />
        ),
      },
      {
        label: 'Submitting',
        render: (
          <Button loading size="sm">
            Saving
          </Button>
        ),
      },
      {
        label: 'Submitted',
        render: (
          <Button success size="sm">
            Saved
          </Button>
        ),
      },
      {
        label: 'Form error',
        render: <span className="text-caption text-[var(--ds-danger-text)]">2 fields to fix</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-[30rem] rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-5">
        <Stack gap="lg">
          <Fieldset legend="Your details" description="We only ask for what we need to bill you.">
            <Field label="Full name" required>
              <TextInput autoComplete="name" defaultValue="Ada Lovelace" />
            </Field>
            <Field
              label="Email"
              description="Receipts and password resets go here."
              status="error"
              message="That does not look like an email address."
              required
            >
              <TextInput status="error" defaultValue="ada@" />
            </Field>
            <FieldRow cols={2}>
              <Field label="City" optional>
                <TextInput autoComplete="address-level2" />
              </Field>
              <Field label="Postcode" optional>
                <TextInput autoComplete="postal-code" />
              </Field>
            </FieldRow>
          </Fieldset>
          <Checkbox label="Email me about product changes" />
          <Row className="justify-end">
            <Button variant="text">Cancel</Button>
            <Button>Save details</Button>
          </Row>
        </Stack>
      </div>
    ),
    caption:
      'One group, one column, one exception. The paired city/postcode row is the only place the eye is asked to go sideways, and those two fields are one address.',
    parts: [
      {
        n: 1,
        label: 'Form width',
        value: '30–36rem',
        kind: 'size',
        note: 'Wide enough for a real value, narrow enough that the label, the field and the error stay in one eye span. A field stretched across a 1440px window is harder to use, not easier.',
      },
      {
        n: 2,
        label: 'Legend',
        value: '--text-h4',
        kind: 'type',
        note: 'A real <legend> in a real <fieldset>. It is announced before every control in the group, which is how each field inherits its context for free.',
      },
      {
        n: 3,
        label: 'Field gap',
        value: '16px',
        kind: 'space',
        note: 'The rhythm inside a group. It has to be clearly larger than the 6px label-to-input gap, or the labels start looking attached to the field above.',
      },
      {
        n: 4,
        label: 'Group gap',
        value: '24–32px',
        kind: 'space',
        note: 'Roughly double the field gap. Proximity is the only grouping signal that works without a border, and it works better than one.',
      },
      {
        n: 5,
        label: 'Label',
        value: '13px, 6px above',
        kind: 'type',
        note: 'Above the field, always. Never inside it — a placeholder disappears at the exact moment the user needs it.',
      },
      {
        n: 6,
        label: 'Description',
        value: '12px, muted, under the label',
        kind: 'type',
        note: 'Static guidance, always visible. It must not vanish when an error appears; the error stacks under it rather than replacing it.',
      },
      {
        n: 7,
        label: 'Error message',
        value: '12px danger, aria-live',
        kind: 'color',
        note: 'Says what is wrong and what to do. "Invalid input" is an error message that helps nobody.',
      },
      {
        n: 8,
        label: 'Optional marker',
        value: '“Optional”, not “*”',
        kind: 'type',
        note: 'Mark whichever set is smaller. Most forms are mostly required, so marking the optional ones is less ink and less ambiguity — an asterisk means nothing without a legend.',
      },
      {
        n: 9,
        label: 'Actions',
        value: 'Right-aligned, primary last',
        kind: 'space',
        note: 'Primary in the bottom right, where the eye finishes. Cancel is a text button — giving it equal weight makes abandoning the form look like an equally good idea.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'label gap', value: '6px', usedFor: 'Label to control' },
    { category: 'spacing', token: 'field gap', value: '16px', usedFor: 'Between fields' },
    { category: 'spacing', token: 'group gap', value: '24–32px', usedFor: 'Between fieldsets' },
    { category: 'spacing', token: 'max-width', value: '30–36rem', usedFor: 'Form measure' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Descriptions and counters' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Error messages' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Invalid control border' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Save confirmation' },
    { category: 'typography', token: '--text-label', value: '13px', usedFor: 'Field labels' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Hints and errors' },
  ],

  sizes: [
    { name: 'Form width', maxWidth: '30–36rem', use: 'One column. The whole field stays in one eye span.' },
    { name: 'Wide form', maxWidth: '48rem', use: 'Only when paired rows genuinely need it — address, card details.' },
    { name: 'Label → control', gap: '6px', use: 'Close enough to be owned by the field.' },
    { name: 'Field → field', gap: '16px', use: 'Must be clearly larger than the label gap.' },
    { name: 'Group → group', gap: '24–32px', use: 'Roughly double the field gap.' },
    { name: 'Control height', height: '36px (md) / 44px (lg)', touch: '44px', use: 'lg on touch and for the primary action.' },
    { name: 'Actions row', height: '40px', gap: '10px', use: 'Right-aligned, primary last.' },
    { name: 'Inline pair', minWidth: '9rem each', use: 'Below this, stack them — a 5rem field looks broken.' },
  ],

  do: [
    {
      title: 'Validate on blur, then re-validate on keystroke',
      why: 'Waiting until the user leaves a field means never being wrong before they have finished. Clearing the error as they fix it means the correction is confirmed the instant it happens.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          blur → show · then every keystroke → clear when valid
        </span>
      ),
    },
    {
      title: 'Set autocomplete on every field',
      why: 'It is the single highest-leverage attribute in a form. A browser filling six fields in one tap converts better than any redesign, and it is one attribute per field.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          autocomplete="email" · "cc-number" · "postal-code"
        </code>
      ),
    },
    {
      title: 'Say what the button does',
      why: '"Pay $40" and "Create account" tell the user what happens next. "Submit" tells them nothing at the exact moment they are deciding whether to trust you.',
      render: (
        <Row gap="sm">
          <Button size="sm">Pay $40</Button>
          <span className="text-caption text-[var(--ds-fg-muted)]">not “Submit”</span>
        </Row>
      ),
    },
    {
      title: 'Mark the smaller set',
      why: 'If most fields are required, mark the optional ones. An asterisk is a convention that needs a legend to explain it; the word "Optional" needs nothing.',
      render: (
        <Row gap="sm">
          <span className="text-caption text-[var(--ds-fg-muted)]">Company · Optional</span>
        </Row>
      ),
    },
    {
      title: 'Move focus to the first error on submit',
      why: 'Otherwise the user presses the button and nothing appears to happen — the errors are above them, off screen. Focus the first bad field and announce the summary.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          submit → summary announced → focus first invalid field
        </span>
      ),
    },
    {
      title: 'Keep the input type honest',
      why: 'inputMode="numeric" raises a keypad instead of a keyboard on a phone. On a card form that is the difference between four taps and forty.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          inputMode="numeric" autoComplete="cc-number"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not validate on every keystroke',
      why: 'The user types "a" and the form says their email is invalid. It is technically correct and completely useless — the form is wrong more often than they are.',
      render: (
        <Stack gap="xs" className="w-44">
          <TextInput size="sm" status="error" defaultValue="a" />
          <span className="text-caption text-[var(--ds-danger-text)]">Enter a valid email</span>
        </Stack>
      ),
    },
    {
      title: 'Do not disable the submit button',
      why: 'A greyed-out button with no explanation is a dead end: nothing says which field is the problem. Leave it enabled, and let pressing it produce the answer.',
      render: (
        <Row gap="sm">
          <Button size="sm" disabled>
            Create account
          </Button>
          <span className="text-caption text-[var(--ds-danger-text)]">why?</span>
        </Row>
      ),
    },
    {
      title: 'Do not use the placeholder as the label',
      why: 'It vanishes the moment the user starts typing — precisely when they need to check what they were asked. It also fails contrast in almost every implementation.',
      render: (
        <span className="block w-40 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-disabled)]">
          Email address
        </span>
      ),
    },
    {
      title: 'Do not clear the form on error',
      why: 'Wiping a password, a card number or a long message because one field failed is the fastest way to lose someone who was ready to finish.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          one bad postcode → whole form empty
        </span>
      ),
    },
    {
      title: 'Do not split a short form into steps',
      why: 'A wizard adds ceremony, state and a back button. Six fields do not need any of it — steps are for chapters, not for hiding length.',
      render: (
        <Row gap="sm">
          {['1', '2', '3'].map((n) => (
            <span
              key={n}
              className="grid h-6 w-6 place-items-center rounded-full border border-[var(--ds-danger-border)] text-[10px] text-[var(--ds-danger-text)]"
            >
              {n}
            </span>
          ))}
          <span className="text-caption text-[var(--ds-danger-text)]">for six fields</span>
        </Row>
      ),
    },
    {
      title: 'Do not put a Save button on a settings page',
      why: 'Settings are independent switches, not a transaction. Users flip one and leave, and a page that needed a Save discards their change silently.',
      render: (
        <Row gap="sm">
          <Switch checked onCheckedChange={() => {}} label="Weekly digest" />
          <span className="text-caption text-[var(--ds-fg-muted)]">saves itself</span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.2', name: 'Labels or Instructions', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '3.3.4', name: 'Error Prevention', level: 'AA' },
    ],
    contrast: [
      'Error text at 12px must reach 4.5:1. Red on white is a common failure — --ds-danger-text is the corrected value, not the raw ramp colour.',
      'The invalid state must not be carried by the border colour alone. Ours changes the border and adds a message with an icon, so it survives greyscale and colour blindness.',
      'Placeholder text is exempt from contrast rules only because it is not content. That is an argument for never putting content in it.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to the next control in DOM order. That order must match the visual order — a two-column layout is the usual place this breaks.' },
      { keys: 'Enter', does: 'Submits, from any single-line input. A form that only submits from the button breaks a reflex everyone has.' },
      { keys: 'Space', does: 'Toggles checkboxes, radios and switches.' },
      { keys: '↑ ↓', does: 'Moves within a radio group — the group is one tab stop, not one per option.' },
      { keys: 'Escape', does: 'Closes an open dropdown without leaving the field.' },
    ],
    aria: [
      {
        attr: '<label for>',
        on: 'Every control',
        note: 'A real label, not a styled span. It also makes the label a click target, which doubles the size of every checkbox.',
      },
      {
        attr: 'aria-describedby',
        on: 'Controls with a hint or error',
        note: 'Points at both the description and the message. Announced after the label, so the user hears the field, then the guidance, then the problem.',
      },
      {
        attr: 'aria-invalid',
        on: 'Failing controls',
        note: 'The programmatic half of the error state. The red border is the other half, and neither is sufficient alone.',
      },
      {
        attr: 'role="alert"',
        on: 'The error summary',
        note: 'Announces the summary on submit failure without moving focus. Then move focus deliberately to the first invalid field.',
      },
      {
        attr: '<fieldset> / <legend>',
        on: 'Each group',
        note: 'The legend is announced before every control in the group. This is how a radio group gets a name, and there is no ARIA substitute worth using.',
      },
      {
        attr: 'autocomplete',
        on: 'Every field with a standard purpose',
        note: 'WCAG 1.3.5 requires it. It is also the single biggest completion-rate win available.',
      },
    ],
    focus:
      'Focus is visible on every control, never removed, and never moved while the user is typing. On submit failure it goes to the first invalid field — one deliberate move, after the summary has been announced. Auto-focusing the first field on page load is acceptable on a dedicated form page and hostile anywhere else, because it scrolls the page for anyone who arrived to read.',
    screenReader: [
      'Each field announces as "Email, edit text, required, receipts and password resets go here" — label, role, state, then description.',
      'The error must be in the accessibility tree, not only in colour. aria-describedby plus aria-invalid does this; a red border alone does not.',
      'Announce the summary on submit failure with role="alert", then move focus. Doing both at once means the announcement is cut off by the focus change.',
      'Do not use aria-live on a field that validates per keystroke — it produces a stream of interruptions as the user types.',
      'Group related controls in a real fieldset. Without it, a screen-reader user hears eight unrelated radio buttons.',
    ],
    touch:
      'Controls are 44px tall on touch. Labels are click targets, which matters most for checkboxes and radios. inputMode raises the right keyboard — numeric for cards and codes, email for addresses — and the submit button is full-width, because a right-aligned button on a phone is in the corner the thumb reaches last.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Field, FieldRow, Fieldset, TextInput } from '@/ui/Input'

<form onSubmit={handleSubmit} noValidate>
  <Fieldset legend="Your details" description="We only ask for what we need to bill you.">
    <Field label="Full name" required>
      <TextInput autoComplete="name" {...register('name')} />
    </Field>

    <Field
      label="Email"
      description="Receipts and password resets go here."
      status={showError('email') ? 'error' : 'default'}
      message={showError('email') ? errors.email : undefined}
      required
    >
      <TextInput type="email" inputMode="email" autoComplete="email" {...register('email')} />
    </Field>

    {/* Pair only what is genuinely one piece of information */}
    <FieldRow cols={2}>
      <Field label="City" optional>
        <TextInput autoComplete="address-level2" {...register('city')} />
      </Field>
      <Field label="Postcode" optional>
        <TextInput autoComplete="postal-code" {...register('postcode')} />
      </Field>
    </FieldRow>
  </Fieldset>

  <Button type="submit">Save details</Button>
</form>

// Strict on the way in, forgiving on the way out.
// Show an error once the user has left the field; from then on,
// re-check every keystroke so the fix is confirmed immediately.
const showError = (k: string) =>
  !!errors[k] && (touched[k] || submitted)

// On failure: announce, then move. Doing both at once cuts the
// announcement off mid-sentence.
function handleSubmit(e: FormEvent) {
  e.preventDefault()
  setSubmitted(true)
  const first = Object.keys(errors)[0]
  if (!first) return save()
  setSummaryVisible(true)
  requestAnimationFrame(() => document.getElementById(first)?.focus())
}`,
    },
    html: {
      lang: 'html',
      caption: 'Framework-free. Every relationship here is a real HTML relationship.',
      code: `<form novalidate>
  <fieldset>
    <legend>Your details</legend>

    <div class="ds-field">
      <label for="email">Email <span class="ds-field__req">*</span></label>
      <p id="email-desc" class="ds-field__desc">Receipts and password resets go here.</p>
      <input
        id="email"
        name="email"
        type="email"
        inputmode="email"
        autocomplete="email"
        required
        aria-describedby="email-desc email-err"
        aria-invalid="true"
      />
      <!-- Stacks under the description; it never replaces it -->
      <p id="email-err" class="ds-field__err">
        That does not look like an email address.
      </p>
    </div>
  </fieldset>

  <!-- Announced on submit failure, before focus moves -->
  <div role="alert" class="ds-form__summary">
    <h2>Two fields need attention</h2>
    <ul><li><a href="#email">Email — that does not look like an email address</a></li></ul>
  </div>

  <button type="submit">Save details</button>
</form>`,
    },
    css: {
      lang: 'css',
      code: `.ds-form {
  /* One eye span. A field stretched across 1440px is harder to
     use, not easier. */
  max-inline-size: 34rem;
  display: flex;
  flex-direction: column;
  gap: 32px;              /* between groups */
}

.ds-form fieldset {
  display: flex;
  flex-direction: column;
  gap: 16px;              /* between fields — must clearly beat the 6px
                             label gap, or labels look attached upward */
  border: 0;
  padding: 0;
  margin: 0;
}

.ds-field { display: flex; flex-direction: column; gap: 6px; }

.ds-field__desc { font: var(--text-caption); color: var(--ds-fg-muted); }
.ds-field__err  { font: var(--text-caption); color: var(--ds-danger-text); }

/* Two signals, so the state survives greyscale */
.ds-field input[aria-invalid='true'] {
  border-color: var(--ds-danger-border);
}

/* Paired fields, and only where they are one piece of information.
   Below 9rem each they stack — a 5rem field looks broken. */
.ds-field-row {
  display: grid;
  gap: 16px;
}
@media (min-width: 40rem) {
  .ds-field-row { grid-template-columns: repeat(2, 1fr); }
}

/* On a phone the primary action is full width — a right-aligned
   button is in the corner the thumb reaches last. */
.ds-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
@media (max-width: 39.99rem) {
  .ds-form__actions { flex-direction: column-reverse; }
  .ds-form__actions button { inline-size: 100%; }
}`,
    },
    api: [
      {
        name: 'Field',
        props: [
          { name: 'label', type: 'string', description: 'Rendered above the control and wired to it with a real <label for>.' },
          { name: 'description', type: 'string', description: 'Static guidance. Always visible — it is not replaced by an error.' },
          { name: 'message', type: 'string', description: 'Validation message. Stacks under the description.' },
          { name: 'status', type: "'default' | 'error' | 'success' | 'warning'", default: "'default'", description: 'Colours the message and drives aria-invalid.' },
          { name: 'required', type: 'boolean', description: 'Marks the field required. Use this or `optional`, whichever set is smaller.' },
          { name: 'optional', type: 'boolean', description: 'Renders “Optional” instead of an asterisk — the better choice when most fields are required.' },
          { name: 'counter', type: '{ value, max }', description: 'Character count for a length-limited field.' },
          { name: 'hideLabel', type: 'boolean', description: 'Visually hides the label but keeps it for assistive tech. Never simply omit the label.' },
        ],
      },
      {
        name: 'FieldRow',
        props: [
          { name: 'cols', type: '1 | 2 | 3', default: '2', description: 'Fields per row above the small breakpoint. Stacks below it.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'The fields to pair. Pair only what is genuinely one piece of information.' },
        ],
      },
      {
        name: 'Fieldset',
        props: [
          { name: 'legend', type: 'string', required: true, description: 'Announced before every control in the group. This is how a radio group gets its name.' },
          { name: 'description', type: 'string', description: 'One line under the legend.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'Five to seven fields. Past that, split the group.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Count the fields, then remove one. The question you cannot justify is costing you completions, and no styling recovers it.',
      'Order fields by how easy they are to answer. Name and email first builds momentum; asking for a VAT number first loses people who would have finished.',
      'Save drafts on any form longer than about six fields. Recovering a half-finished form after a lost connection converts far better than starting again.',
      'Show what the format should be before it fails: "MM / YY" as a placeholder beats "Invalid date" as an error.',
      'Never reject a phone number, postcode or name for its format alone. Normalise what you can, and accept the rest — those validators reject real people constantly.',
      'One primary action per form. Two buttons of equal weight at the bottom is a decision the user should not have to make.',
    ],
    performance: [
      'Keep field state uncontrolled where you can. Re-rendering a thirty-field form on every keystroke is the usual cause of typing lag in a checkout.',
      'Debounce anything that hits the network — username availability, address lookup — at around 300ms, and never block typing on it.',
      'Do not validate the whole form on every change. Validate the field that changed, and the whole form only on submit.',
      'Autofill fires change events for many fields at once. Batch the resulting validation, or the form flashes errors during a browser fill.',
    ],
    mistakes: [
      'Validating on keystroke, so the form is wrong before the user is.',
      'A disabled submit button with no indication of what is missing.',
      'Placeholder text used as the label.',
      'Two columns for fields that are not related, splitting the eye path and orphaning the right-hand column.',
      'Clearing entered data — especially passwords and card numbers — after a failed submit.',
      'A settings page with a Save button nobody presses.',
      'Missing autocomplete attributes, which is both a WCAG failure and a measurable conversion loss.',
      'Error messages that say what is wrong but not what to do about it.',
    ],
    realWorld: [
      'Instrument per-field drop-off, not just form-level completion. The abandonment is nearly always concentrated on one or two fields, and you cannot see which without the data.',
      'Watch how long each field takes to fill. A field that takes noticeably longer than its neighbours is usually asking for something the user has to go and look up.',
      'Test with autofill on. A form that looks correct empty and breaks when the browser fills it is a bug most teams never see, because they always type.',
      'The best form change is usually a deletion. Removing one field beats redesigning the other eight.',
      'On a settings page, the confirmation matters more than the mechanism. Users need to see that the change stuck — an inline "Saved" beats a toast, which they may be looking away from.',
    ],
  },
})
