import * as React from 'react'
import { AtSign, Calendar, Link2 } from 'lucide-react'
import {
  CurrencyInput,
  Field,
  Fieldset,
  FieldRow,
  NumberInput,
  PasswordInput,
  SearchInput,
  TextInput,
  Textarea,
  type ControlSize,
  type FieldStatus,
} from '@/ui/Input'
import {
  Cell,
  Knob,
  KnobSelect,
  KnobToggle,
  PreviewStage,
  Stack,
  defineDoc,
} from '../framework/kit'

const SIZES: ControlSize[] = ['sm', 'md', 'lg']
const STATUSES: FieldStatus[] = ['default', 'error', 'success', 'warning']

function Playground() {
  const [size, setSize] = React.useState<ControlSize>('md')
  const [status, setStatus] = React.useState<FieldStatus>('default')
  const [value, setValue] = React.useState('')
  const [required, setRequired] = React.useState(true)
  const [description, setDescription] = React.useState(true)
  const [counter, setCounter] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  const message =
    status === 'error'
      ? 'Enter an email that includes an @ — for example, ada@example.com'
      : status === 'success'
        ? 'This address is verified.'
        : status === 'warning'
          ? 'This looks like a personal address. Billing receipts go here.'
          : undefined

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={SIZES} />
          </Knob>
          <Knob label="Status">
            <KnobSelect value={status} onChange={setStatus} options={STATUSES} />
          </Knob>
          <KnobToggle checked={required} onChange={setRequired} label="Required" />
          <KnobToggle checked={description} onChange={setDescription} label="Help text" />
          <KnobToggle checked={counter} onChange={setCounter} label="Counter" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
        </div>
      }
      code={`<Field
  label="Work email"${required ? '\n  required' : ''}${description ? '\n  description="We only use this for billing receipts."' : ''}${status !== 'default' ? `\n  status="${status}"\n  message="…"` : ''}
  htmlFor="email"
>
  <TextInput id="email" size="${size}" type="email" status="${status}" />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field
          label="Work email"
          htmlFor="pg-email"
          required={required}
          status={status}
          message={message}
          description={description ? 'We only use this for billing receipts.' : undefined}
          counter={counter ? { value: value.length, max: 64 } : undefined}
        >
          <TextInput
            id="pg-email"
            type="email"
            size={size}
            status={status}
            disabled={disabled}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ada@example.com"
            startIcon={<AtSign />}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

function Types() {
  const [n, setN] = React.useState<number | ''>(3)
  const [amount, setAmount] = React.useState<number | ''>(1428)
  const [q, setQ] = React.useState('')
  const [bio, setBio] = React.useState('')

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="grid w-full gap-5 sm:grid-cols-2">
        <Field label="Text" htmlFor="t-text">
          <TextInput id="t-text" placeholder="Project name" />
        </Field>

        <Field label="Password" htmlFor="t-pass" description="At least 12 characters.">
          <PasswordInput id="t-pass" placeholder="••••••••••••" />
        </Field>

        <Field label="Search" htmlFor="t-search">
          <SearchInput
            id="t-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onClear={() => setQ('')}
            placeholder="Search deployments…"
          />
        </Field>

        <Field label="Email" htmlFor="t-email">
          <TextInput id="t-email" type="email" inputMode="email" autoComplete="email" startIcon={<AtSign />} placeholder="ada@example.com" />
        </Field>

        <Field label="Number" htmlFor="t-num" description="Arrow keys step by 1.">
          <NumberInput id="t-num" value={n} onValueChange={setN} min={0} max={99} />
        </Field>

        <Field label="Currency" htmlFor="t-cur">
          <CurrencyInput id="t-cur" value={amount} onValueChange={setAmount} min={0} />
        </Field>

        <Field label="URL" htmlFor="t-url">
          <TextInput id="t-url" prefix="https://" suffix=".dev" placeholder="acme" startIcon={<Link2 />} />
        </Field>

        <Field label="Date" htmlFor="t-date">
          <TextInput id="t-date" type="date" endIcon={<Calendar />} />
        </Field>

        <Field
          label="Bio"
          htmlFor="t-area"
          className="sm:col-span-2"
          counter={{ value: bio.length, max: 280 }}
          description="Auto-grows to twelve lines, then scrolls."
        >
          <Textarea
            id="t-area"
            autoResize
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What does this service do?"
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

function Validation() {
  const [email, setEmail] = React.useState('ada.example.com')
  const [touched, setTouched] = React.useState(false)
  const invalid = touched && !email.includes('@')

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Cell label="Validate on blur, clear on input" tone="good">
          <Field
            label="Work email"
            htmlFor="v-good"
            status={invalid ? 'error' : 'default'}
            message={invalid ? 'Enter an email that includes an @ — for example, ada@example.com' : undefined}
          >
            <TextInput
              id="v-good"
              value={email}
              status={invalid ? 'error' : 'default'}
              onChange={(e) => {
                setEmail(e.target.value)
                if (e.target.value.includes('@')) setTouched(false)
              }}
              onBlur={() => setTouched(true)}
            />
          </Field>
        </Cell>
        <Cell label="Validate on every keystroke" tone="bad">
          <Field
            label="Work email"
            htmlFor="v-bad"
            status="error"
            message="Invalid email"
          >
            <TextInput id="v-bad" defaultValue="a" status="error" />
          </Field>
          <p className="text-caption text-[var(--ds-fg-muted)]">
            Shouting at someone one character into typing.
          </p>
        </Cell>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'text-field',
    title: 'Text Field',
    tagline:
      'The control that asks a human to type something. Every decision here — label position, validation timing, helper text — is about reducing the chance they get it wrong.',
    keywords: ['field', 'textbox', 'form', 'placeholder', 'helper text', 'validation', 'textarea', 'password', 'currency'],
  },

  overview: {
    purpose:
      'A text input collects free-form data that cannot be picked from a list. It is the highest-friction control in any interface — every one you add is a request for effort — so the job of the design is to make the expected answer obvious before the user starts typing, and to make a wrong answer easy to fix.',
    whenToUse: [
      'The value is open-ended: a name, an email, a URL, a description.',
      'The set of valid answers is too large or too unknown to enumerate.',
      'The user already knows the answer and typing is faster than choosing.',
      'You need a searchable entry point into a large dataset.',
    ],
    whenNotToUse: [
      {
        text: 'There are fewer than about fifteen known options.',
        instead: 'a Select',
        to: '#/select',
      },
      {
        text: 'The answer is one of two states.',
        instead: 'a Switch or a Checkbox',
        to: '#/switch',
      },
      {
        text: 'The value is a date, and format ambiguity matters.',
        instead: 'a date picker with a typed fallback',
      },
      {
        text: 'You are asking for something you could derive or already know.',
        instead: 'not asking — the best field is the one you removed',
      },
    ],
    reasoning: (
      <>
        <p>
          Labels go <strong>above</strong> the field, not inside it and not beside it. Above gives
          the shortest eye path from label to input, survives translation into longer languages,
          works at any width, and — critically — stays visible while the user types. A placeholder
          used as a label vanishes at the exact moment the user might need to check what was being
          asked.
        </p>
        <p>
          Validation timing is the other decision that matters more than it looks.{' '}
          <strong>Validate on blur, clear on input.</strong> Validating while someone types means
          telling them they are wrong before they have finished being right — an email is invalid
          for every character until the last one. Clearing the error as soon as they start fixing it
          is what makes the correction feel cooperative rather than adversarial.
        </p>
        <p>
          The control is <em>inset</em> — darker than its surface in dark mode, and bounded by a
          border in light mode. That reads as a hole you can pour text into, as opposed to a raised
          button you press. It is a small metaphor and it does a lot of work: users almost never
          click a button expecting to type into it.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'types',
        title: 'Every type',
        description:
          'Nine variations on the same control. The differences that matter are the keyboard on mobile, the autofill behaviour, and the adornments — not the visual style.',
        render: <Types />,
      },
      {
        id: 'validation',
        title: 'Validation timing',
        description:
          'Both fields have the same rule. Only the left one waits until the user has finished before judging them.',
        render: <Validation />,
      },
      {
        id: 'grouping',
        title: 'Grouping and layout',
        description:
          'A fieldset with a real legend, fields paired only where the values are genuinely related, and a 20px gap between rows against a 32px gap between groups.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <div className="w-full max-w-lg">
              <Stack gap="lg">
                <Fieldset legend="Contact" description="Where we send billing and incident mail.">
                  <FieldRow>
                    <Field label="First name" htmlFor="g-first">
                      <TextInput id="g-first" autoComplete="given-name" />
                    </Field>
                    <Field label="Last name" htmlFor="g-last">
                      <TextInput id="g-last" autoComplete="family-name" />
                    </Field>
                  </FieldRow>
                  <Field label="Work email" htmlFor="g-email" required>
                    <TextInput id="g-email" type="email" autoComplete="email" startIcon={<AtSign />} />
                  </Field>
                </Fieldset>

                <Fieldset legend="Organisation">
                  <Field label="Company" htmlFor="g-co" optional>
                    <TextInput id="g-co" autoComplete="organization" />
                  </Field>
                  <Field label="Website" htmlFor="g-web" optional>
                    <TextInput id="g-web" prefix="https://" placeholder="acme.com" />
                  </Field>
                </Fieldset>
              </Stack>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <TextInput placeholder="Placeholder" className="w-40" /> },
      { label: 'Filled', render: <TextInput defaultValue="ada@example.com" className="w-40" /> },
      { label: 'Focus', note: 'Border + 3px halo', render: <TextInput defaultValue="Focused" className="w-40 border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]" /> },
      { label: 'Error', note: 'aria-invalid', render: <TextInput defaultValue="ada.example" status="error" className="w-40" /> },
      { label: 'Success', render: <TextInput defaultValue="ada@example.com" status="success" className="w-40" /> },
      { label: 'Warning', render: <TextInput defaultValue="ada@gmail.com" status="warning" className="w-40" /> },
      { label: 'Disabled', render: <TextInput defaultValue="Locked" disabled className="w-40" /> },
      { label: 'Read-only', note: 'Dashed, copyable', render: <TextInput defaultValue="prj_8f21c" readOnly className="w-40" /> },
      { label: 'Loading', render: <TextInput defaultValue="checking…" loading className="w-40" /> },
      { label: 'Clearable', render: <ClearableDemo /> },
      { label: 'With prefix', render: <TextInput prefix="https://" defaultValue="acme" className="w-44" /> },
      { label: 'Search', render: <SearchInput className="w-40" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <div className="relative">
          <Field
            label="Work email"
            htmlFor="anat"
            required
            description="We only use this for billing receipts."
            counter={{ value: 15, max: 64 }}
          >
            <TextInput id="anat" defaultValue="ada@example.com" startIcon={<AtSign />} />
          </Field>
        </div>
      </div>
    ),
    caption:
      'Label, optional counter, control with an adornment, and static help text. The message slot sits below the description and never replaces it.',
    parts: [
      {
        n: 1,
        label: 'Label',
        value: '13px / 540, 6px above',
        kind: 'type',
        note: 'Above the field for the shortest eye path and the most robust behaviour under translation. Muted weight so it never competes with the value the user typed.',
      },
      {
        n: 2,
        label: 'Required marker',
        value: 'Asterisk + sr-only text',
        kind: 'type',
        note: 'The asterisk is aria-hidden and paired with a visually hidden "(required)". A red star alone is meaningless to a screen reader and to anyone who has not learned the convention.',
      },
      {
        n: 3,
        label: 'Control height',
        value: '36px (md)',
        kind: 'size',
        note: 'Identical to a button and a select, so a row of mixed controls shares a baseline with no per-component nudging.',
      },
      {
        n: 4,
        label: 'Horizontal padding',
        value: '12px',
        kind: 'space',
        note: 'Gives the caret room at the left edge. Below 10px the first character looks like it is touching the border.',
      },
      {
        n: 5,
        label: 'Focus treatment',
        value: 'Border + 3px halo',
        kind: 'color',
        note: 'The halo is what makes focus visible at a glance; the border change is what makes it precise. A 1px border change alone is not enough for low-vision users.',
      },
      {
        n: 6,
        label: 'Help text',
        value: '12px, muted, always present',
        kind: 'type',
        note: 'Static guidance that never disappears. Validation messages stack below it rather than replacing it — losing the instructions at the moment of failure is exactly backwards.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field background — darker than the surface' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Resting border' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Hover border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focused border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Error border' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Placeholder, adornments, help text' },
    { category: 'spacing', token: 'padding-x', value: '10 / 12 / 14px', usedFor: 'sm / md / lg' },
    { category: 'spacing', token: 'label gap', value: '6px', usedFor: 'Label to control' },
    { category: 'spacing', token: 'field gap', value: '20px', usedFor: 'Between stacked fields' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'sm and md corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'lg corners' },
    { category: 'typography', token: '--text-label', usedFor: 'Field label' },
    { category: 'typography', token: '--text-body', usedFor: 'Typed value' },
    { category: 'typography', token: '--text-caption', usedFor: 'Help text, counter, validation' },
    { category: 'motion', token: 'duration', value: '120ms', usedFor: 'Border and halo transition' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px', radius: '8px', icon: '14px', type: '13px', minWidth: '120px', touch: '44px (padded)', use: 'Toolbars, table filters, inline editing.' },
    { name: 'Medium', height: '36px', padding: '0 12px', radius: '8px', icon: '15px', type: '15px', minWidth: '160px', maxWidth: '40ch', touch: '44px (padded)', use: 'The default for every form.' },
    { name: 'Large', height: '44px', padding: '0 14px', radius: '12px', icon: '17px', type: '17px', minWidth: '200px', maxWidth: '40ch', touch: '44px (native)', use: 'Mobile forms, authentication, checkout.' },
    { name: 'Textarea', height: '88px min', padding: '10px 12px', radius: '8px', type: '15px', maxWidth: '68ch', use: 'Roughly four lines by default. Auto-grows to twelve, then scrolls.' },
  ],

  do: [
    {
      title: 'Size the field to the expected answer',
      why: 'A three-character CVC field 400px wide tells the user they have got the format wrong. Field width is a legitimate and free affordance.',
      render: (
        <div className="flex items-end gap-2">
          <Field label="Card number" htmlFor="d-card">
            <TextInput id="d-card" className="w-44" placeholder="4242 4242 4242 4242" />
          </Field>
          <Field label="CVC" htmlFor="d-cvc">
            <TextInput id="d-cvc" className="w-16" placeholder="123" />
          </Field>
        </div>
      ),
    },
    {
      title: 'Use the right type and inputmode',
      why: 'On mobile this changes the keyboard. type="email" gets an @ key; inputMode="decimal" gets a numeric pad. It is a one-attribute usability win that almost nobody bothers with.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          type="email" inputMode="email"
          <br />
          inputMode="decimal" autoComplete="cc-number"
        </code>
      ),
    },
    {
      title: 'Keep help text visible at all times',
      why: 'Instructions are needed most at the moment of failure. Replacing the help text with the error removes the guidance exactly when the user needs it.',
      render: (
        <Field
          label="Password"
          htmlFor="d-help"
          description="At least 12 characters, including a number."
          status="error"
          message="This password is too short."
        >
          <TextInput id="d-help" type="password" status="error" defaultValue="short" />
        </Field>
      ),
    },
    {
      title: 'Mark whichever set is smaller',
      why: 'If most fields are required, mark the optional ones. Marking every field with an asterisk is the same as marking none — it stops being information.',
      render: (
        <Stack gap="sm" className="w-full">
          <Field label="Email" htmlFor="d-req" required>
            <TextInput id="d-req" />
          </Field>
          <Field label="Company" htmlFor="d-opt" optional>
            <TextInput id="d-opt" />
          </Field>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a placeholder as a label',
      why: 'It disappears when the user types, it usually fails contrast, screen-reader support for it is inconsistent, and anyone who gets interrupted mid-form loses the question entirely.',
      render: (
        <Stack gap="sm" className="w-full">
          <TextInput placeholder="First name" />
          <TextInput placeholder="Last name" />
          <TextInput placeholder="Email" />
        </Stack>
      ),
    },
    {
      title: 'Do not validate on every keystroke',
      why: 'An email address is invalid for every character except the last. Telling the user they are wrong while they are still typing trains them to ignore your error messages.',
      render: (
        <Field label="Email" htmlFor="dn-live" status="error" message="Please enter a valid email">
          <TextInput id="dn-live" defaultValue="a" status="error" />
        </Field>
      ),
    },
    {
      title: 'Do not block characters silently',
      why: 'A field that refuses keystrokes with no explanation looks broken. Accept the input, then explain why it is not valid — and strip formatting yourself rather than demanding the user does.',
      render: (
        <Field label="Phone" htmlFor="dn-strip" description="Rejects spaces with no feedback">
          <TextInput id="dn-strip" defaultValue="+441632960" />
        </Field>
      ),
    },
    {
      title: 'Do not stretch every field to the container',
      why: 'A row of identical full-width fields gives no clue what any of them expects. It also produces a 900px-wide postcode field on a desktop layout.',
      render: (
        <Stack gap="sm" className="w-full">
          <TextInput placeholder="Country" className="w-full" />
          <TextInput placeholder="Postcode" className="w-full" />
          <TextInput placeholder="House number" className="w-full" />
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.2', name: 'Labels or Instructions', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The typed value must reach 4.5:1. Placeholder text also counts as text — ours is --ds-fg-muted at 4.6:1, which is the floor, not a target.',
      'The field border is the boundary of a control and must reach 3:1 against the surrounding surface, per WCAG 1.4.11.',
      'Error state is never colour alone: the border changes, an icon appears, and the message is text.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves between fields in DOM order.' },
      { keys: 'Enter', does: 'Submits the form when the field is inside one — expected behaviour on single-field forms.' },
      { keys: '↑ / ↓', does: 'Steps a number input by its step value.' },
      { keys: 'Esc', does: 'Clears a search input that has a clear affordance.' },
      { keys: '⌘/Ctrl + A', does: 'Selects the field contents, not the page.' },
    ],
    aria: [
      { attr: '<label for>', on: 'Every field', note: 'A real label element. Clicking it focuses the input, which also enlarges the effective target considerably.' },
      { attr: 'aria-describedby', on: 'input', note: 'Points at the help text and the error message. Multiple ids are allowed and are announced in order.' },
      { attr: 'aria-invalid', on: 'input', note: 'Set on error, removed when it clears. Screen readers announce "invalid entry" on focus.' },
      { attr: 'role="alert"', on: 'The error message', note: 'Announces the message without moving focus. Do not use aria-live="assertive" on the field itself.' },
      { attr: 'autocomplete', on: 'input', note: 'Required by WCAG 1.3.5 for personal data. It is also the single biggest completion-rate win in any form.' },
      { attr: 'inputmode', on: 'input', note: 'Chooses the mobile keyboard. Independent of type, which controls validation and autofill.' },
    ],
    focus:
      'A 2px accent border plus a 3px halo. The halo is deliberately larger than the standard focus ring because the field already has a border — a 2px ring at 2px offset would read as a double border rather than as focus.',
    screenReader: [
      'Never rely on placeholder text for the accessible name. Support is inconsistent and it disappears on input.',
      'Announce the character counter with aria-live only when the user is close to the limit — announcing every keystroke floods the queue.',
      'On submit failure, move focus to the first invalid field and announce a summary of how many errors there are.',
    ],
    touch:
      '44px targets on coarse pointers. Set autocapitalize and autocorrect appropriately — an email field that capitalises the first letter is a real source of failed logins.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Field, TextInput, PasswordInput, Textarea } from '@/ui/Input'

// The standard shape: label above, help text below, error stacked under it
<Field
  label="Work email"
  htmlFor="email"
  required
  description="We only use this for billing receipts."
  status={error ? 'error' : 'default'}
  message={error}
>
  <TextInput
    id="email"
    type="email"
    inputMode="email"
    autoComplete="email"
    aria-describedby="email-help"
    status={error ? 'error' : 'default'}
    value={value}
    onChange={(e) => {
      setValue(e.target.value)
      if (error) setError(undefined)     // clear as they fix it
    }}
    onBlur={() => setError(validate(value))}   // judge only when done
  />
</Field>

// Character counter
<Field label="Bio" counter={{ value: bio.length, max: 280 }}>
  <Textarea autoResize maxRows={12} value={bio} onChange={onBio} />
</Field>

// Autofill tokens that matter most
// name · email · tel · organization · street-address · postal-code
// cc-number · cc-exp · cc-csc · new-password · current-password`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label class="ds-field__label" for="email">
    Work email
    <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>

  <input
    class="ds-input"
    id="email"
    name="email"
    type="email"
    inputmode="email"
    autocomplete="email"
    required
    aria-describedby="email-help email-error"
    aria-invalid="true"
  />

  <p class="ds-field__help" id="email-help">
    We only use this for billing receipts.
  </p>
  <p class="ds-field__error" id="email-error" role="alert">
    Enter an email that includes an @ — for example, ada@example.com
  </p>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-input {
  inline-size: 100%;
  block-size: 36px;
  padding-inline: 12px;
  background: var(--ds-surface-inset);   /* a well, not a button */
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  color: var(--ds-fg);
  transition:
    border-color 120ms var(--ease-standard),
    box-shadow   120ms var(--ease-standard);
}

.ds-input::placeholder { color: var(--ds-fg-muted); }
.ds-input:hover { border-color: var(--ds-border-strong); }

/* Border change for precision, halo for visibility */
.ds-input:focus {
  outline: none;
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
}

.ds-input[aria-invalid='true'] { border-color: var(--ds-danger-border); }
.ds-input[aria-invalid='true']:focus {
  border-color: var(--ds-danger);
  box-shadow: 0 0 0 3px var(--ds-danger-subtle);
}

.ds-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--ds-layer-hover);
}

/* Autofill: browsers force their own background. Paint over it. */
.ds-input:-webkit-autofill {
  -webkit-text-fill-color: var(--ds-fg);
  box-shadow: 0 0 0 1000px var(--ds-surface-inset) inset;
}

/* iOS zooms in on focus when the font is under 16px */
@media (pointer: coarse) {
  .ds-input { font-size: max(16px, 1em); }
}`,
    },
    api: [
      {
        name: 'Field',
        props: [
          { name: 'label', type: 'string', description: 'Rendered as a real <label for>.' },
          { name: 'htmlFor', type: 'string', required: true, description: 'Must match the control id, or the label does nothing.' },
          { name: 'description', type: 'string', description: 'Static help. Always visible, never replaced by the error.' },
          { name: 'message', type: 'string', description: 'Validation message. Stacks below the description.' },
          { name: 'status', type: "'default' | 'error' | 'success' | 'warning'", default: "'default'", description: 'Drives the message colour, the icon and the control border.' },
          { name: 'required', type: 'boolean', description: 'Renders an asterisk plus a visually hidden "(required)".' },
          { name: 'optional', type: 'boolean', description: 'Renders "Optional" instead. Use when most fields are required.' },
          { name: 'counter', type: '{ value: number; max: number }', description: 'Right-aligned character count. Turns red past the limit.' },
        ],
      },
      {
        name: 'TextInput',
        props: [
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Matches the Button and Select scale.' },
          { name: 'status', type: 'FieldStatus', default: "'default'", description: 'Also sets aria-invalid on error.' },
          { name: 'prefix / suffix', type: 'ReactNode', description: 'Static text inside the border — "https://", "USD".' },
          { name: 'startIcon / endIcon', type: 'ReactNode', description: 'Muted, auto-sized adornments.' },
          { name: 'loading', type: 'boolean', description: 'Replaces the end adornment with a spinner in place, so nothing reflows.' },
          { name: 'onClear', type: '() => void', description: 'Adds a clear button once the field has a value.' },
        ],
      },
      {
        name: 'Textarea',
        props: [
          { name: 'autoResize', type: 'boolean', default: 'false', description: 'Grows with content up to maxRows, then scrolls.' },
          { name: 'maxRows', type: 'number', default: '12', description: 'Ceiling for auto-resize.' },
          { name: 'rows', type: 'number', default: '4', description: 'Initial height when auto-resize is off.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Set font-size to at least 16px on touch devices. iOS Safari zooms the viewport on focus for anything smaller, and the user has to pinch back out.',
      'Strip formatting yourself. Accept "4242 4242 4242 4242" and "+44 1632 960" — refusing spaces is the interface being lazy at the user’s expense.',
      'For a single-field form, Enter should submit. For a multi-field form, Enter should submit only from the last field or a designated one.',
      'A read-only field that holds an ID or a key should be selectable and have a copy button. Disabled is wrong: the user needs the value.',
    ],
    performance: [
      'Debounce async validation by 300–500ms. Validating on every keystroke means one request per character and a race between responses.',
      'Controlled inputs re-render the whole form on every keystroke. For large forms, keep state local to the field or use an uncontrolled form library.',
      'Auto-resizing a textarea reads scrollHeight, which forces a synchronous layout. Do it on input rather than on every render.',
      'Never run a regex with catastrophic backtracking on every keystroke — email validation regexes are a classic source of this.',
    ],
    mistakes: [
      'Omitting autocomplete. It fails WCAG 1.3.5 and it measurably reduces form completion.',
      'Using type="number" for phone numbers, card numbers and postcodes. It strips leading zeros, allows exponent notation, and shows spinners nobody wants.',
      'Putting the error message above the field. Screen readers announce it before the label, and sighted users read it before they know which field it belongs to.',
      'Disabling paste on password or confirmation fields. It breaks password managers and makes people choose weaker passwords.',
      'Trimming whitespace on blur without telling the user, so the value they see is not the value they typed.',
    ],
    realWorld: [
      'Every field you remove increases completion more than any field you improve. Audit the form before styling it.',
      'Ask for one thing per field, but do not split things users think of as one — a single "Full name" field beats first/middle/last for most of the world.',
      'On submit failure, move focus to the first invalid field and announce the total count. Users should never have to hunt for what went wrong.',
      'Log which fields cause the most correction events in production. It is the fastest way to find the label that is unclear.',
    ],
  },
})

function ClearableDemo() {
  const [v, setV] = React.useState('draft')
  return (
    <TextInput
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClear={() => setV('')}
      className="w-40"
    />
  )
}
