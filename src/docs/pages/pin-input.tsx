import * as React from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Field } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function PinInput({
  length = 6,
  value,
  onChange,
  status = 'default',
  mask,
  size = 'md',
  groupAfter,
  disabled,
}: {
  length?: number
  value: string
  onChange: (v: string) => void
  status?: 'default' | 'error' | 'success'
  mask?: boolean
  size?: 'sm' | 'md' | 'lg'
  groupAfter?: number
  disabled?: boolean
}) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([])
  const box = { sm: 'h-9 w-8 text-body', md: 'h-11 w-10 text-body-lg', lg: 'h-14 w-12 text-h4' }[size]

  const setAt = (i: number, ch: string) => {
    const next = (value.padEnd(length, ' ').slice(0, i) + ch + value.padEnd(length, ' ').slice(i + 1))
      .trimEnd()
      .slice(0, length)
    onChange(next)
  }

  return (
    <div
      // One group, one label. Six inputs each announcing "edit text, blank"
      // is the single worst thing this component can do.
      role="group"
      aria-label={`Verification code, ${length} digits`}
      className="flex items-center gap-2"
    >
      {Array.from({ length }, (_, i) => (
        <React.Fragment key={i}>
          {groupAfter && i === groupAfter && (
            <span aria-hidden className="mx-1 h-px w-3 bg-[var(--ds-border-strong)]" />
          )}
          <input
            ref={(el) => {
              refs.current[i] = el
            }}
            type={mask ? 'password' : 'text'}
            inputMode="numeric"
            // Only the first box carries it, or the browser fills every box
            // with the whole code.
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1} of ${length}`}
            maxLength={1}
            disabled={disabled}
            value={value[i] ?? ''}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, '').slice(-1)
              if (!ch) return
              setAt(i, ch)
              refs.current[Math.min(length - 1, i + 1)]?.focus()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault()
                if (value[i]) setAt(i, '')
                else if (i > 0) {
                  // Backspace on an empty box clears the previous one and
                  // moves there — one press, one deletion.
                  onChange(value.slice(0, i - 1))
                  refs.current[i - 1]?.focus()
                }
              } else if (e.key === 'ArrowLeft' && i > 0) {
                e.preventDefault()
                refs.current[i - 1]?.focus()
              } else if (e.key === 'ArrowRight' && i < length - 1) {
                e.preventDefault()
                refs.current[i + 1]?.focus()
              }
            }}
            onPaste={(e) => {
              // A code arrives as one string from SMS or a clipboard. It has
              // to fill every box, not just the one under the caret.
              e.preventDefault()
              const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
              if (!digits) return
              onChange(digits)
              refs.current[Math.min(length - 1, digits.length)]?.focus()
            }}
            onFocus={(e) => e.target.select()}
            className={cn(
              'rounded-[var(--radius-md)] border bg-[var(--ds-surface-inset)] text-center font-mono tabular-nums text-[var(--ds-fg)]',
              'transition-[border-color,box-shadow] duration-[120ms]',
              'focus:border-[var(--ds-accent)] focus:shadow-[0_0_0_3px_var(--ds-accent-subtle)] focus:outline-none',
              'disabled:text-[var(--ds-fg-disabled)]',
              box,
              status === 'error'
                ? 'border-[var(--ds-danger-border)]'
                : status === 'success'
                  ? 'border-[var(--ds-success-border)]'
                  : 'border-[var(--ds-border-interactive)]',
            )}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState('4021')
  const [length, setLength] = React.useState<'4' | '6' | '8'>('6')
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [mask, setMask] = React.useState(false)
  const [status, setStatus] = React.useState<'default' | 'error' | 'success'>('default')

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Length">
            <KnobSelect value={length} onChange={setLength} options={['4', '6', '8'] as const} />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Status">
            <KnobSelect
              value={status}
              onChange={setStatus}
              options={['default', 'error', 'success'] as const}
            />
          </Knob>
          <KnobToggle checked={mask} onChange={setMask} label="Mask" />
        </div>
      }
      code={`<Field
  label="Verification code"
  description="We sent a ${length}-digit code to ada@example.com."
>
  <PinInput
    length={${length}}
    size="${size}"${mask ? '\n    mask' : ''}
    value={code}
    onChange={setCode}
    onComplete={verify}
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field
          label="Verification code"
          description={`We sent a ${length}-digit code to ada@example.com.`}
          status={status}
          message={
            status === 'error'
              ? 'That code is incorrect or has expired.'
              : status === 'success'
                ? 'Verified'
                : undefined
          }
        >
          <PinInput
            length={Number(length)}
            size={size}
            mask={mask}
            status={status}
            value={value}
            onChange={setValue}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'pin-input',
    title: 'Pin Input',
    tagline:
      'Fixed-length codes in per-digit boxes, with paste that fills every box and SMS autofill that actually fires.',
    keywords: ['otp', 'one time password', 'verification code', '2fa', 'autocomplete', 'paste'],
  },

  overview: {
    purpose:
      'A pin input collects a short code of known length: an SMS verification code, an authenticator token, a device pairing PIN. Splitting it into boxes does one useful thing — it shows how many digits are expected before the user starts, which removes the "is that all of it?" hesitation a single field creates. Everything else about the component is compensating for having split one value across several inputs.',
    whenToUse: [
      'A fixed-length numeric code the user is transcribing from somewhere else.',
      'Two-factor authentication, email or SMS verification, device pairing.',
      'Any code short enough that per-digit boxes fit without wrapping — up to about eight.',
    ],
    whenNotToUse: [
      {
        text: 'The value is a secret the user knows.',
        instead: 'a Password Input',
        to: '#/password-input',
      },
      {
        text: 'The length varies or exceeds about eight characters.',
        instead: 'a Text Field — nine boxes wrap on a phone and lose the whole benefit',
        to: '#/text-field',
      },
      {
        text: 'The code is alphanumeric and case-sensitive.',
        instead: 'a Text Field with a monospace font and a format hint',
        to: '#/text-field',
      },
      {
        text: 'It is a quantity or an identifier.',
        instead: 'a Number Input or a Text Field',
        to: '#/number-input',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Paste is not an edge case, it is the primary path.</strong> Users copy the code
          from an SMS, an email or an authenticator app. A component where pasting fills only the
          focused box is broken for the way it is actually used — and it fails silently, so the
          user retypes six digits one at a time.
        </p>
        <p>
          <code>autocomplete="one-time-code"</code> goes on the <strong>first box only</strong>.
          It is what makes iOS and Android offer the code above the keyboard, which is the single
          highest-value affordance here. Put it on every box and the platform fills each one with
          the entire code.
        </p>
        <p>
          Backspace on an empty box must clear the previous box <em>and</em> move there. One press,
          one deletion. Requiring two presses — one to move, one to clear — is the detail that
          makes an otherwise fine implementation feel wrong.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'flow',
        title: 'The whole verification step',
        description:
          'Code, resend with a cooldown, and a way back to change the destination. The number stays editable — a mistyped email otherwise means restarting the flow.',
        render: <VerifyFlow />,
      },
      {
        id: 'grouping',
        title: 'Grouping long codes',
        description:
          'Six digits read fine as one run. Eight benefit from a separator, which chunks them the way people say them aloud.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="items-center">
              <PinInput length={6} value="402193" onChange={() => {}} />
              <PinInput length={8} value="40219371" onChange={() => {}} groupAfter={4} size="sm" />
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'states',
        title: 'Error and success',
        description:
          'The whole group changes state, never one box. A wrong code is wrong as a value; marking a single digit red implies you know which one.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Incorrect" tone="bad">
                <Stack gap="sm">
                  <PinInput length={6} value="402193" onChange={() => {}} status="error" size="sm" />
                  <span className="text-caption text-[var(--ds-danger-text)]">
                    That code is incorrect or has expired.
                  </span>
                </Stack>
              </Cell>
              <Cell label="Verified" tone="good">
                <Stack gap="sm">
                  <PinInput length={6} value="402193" onChange={() => {}} status="success" size="sm" />
                  <span className="text-caption text-[var(--ds-success-text)]">Verified</span>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-field',
        title: 'Boxes or one field',
        description:
          'Boxes communicate the length before the user starts. Past about eight they wrap on a phone and a plain monospace field is better.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="6 digits" sub="Boxes" tone="good">
                <PinInput length={6} value="4021" onChange={() => {}} size="sm" />
              </Cell>
              <Cell label="12 characters" sub="One field" tone="good">
                <input
                  readOnly
                  value="A4B9-2F71-KD03"
                  aria-label="Recovery code"
                  className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] px-3 text-center font-mono tabular-nums text-body text-[var(--ds-fg)]"
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <PinInput length={4} value="" onChange={() => {}} size="sm" /> },
      { label: 'Partial', render: <PinInput length={4} value="40" onChange={() => {}} size="sm" /> },
      { label: 'Complete', render: <PinInput length={4} value="4021" onChange={() => {}} size="sm" /> },
      { label: 'Error', render: <PinInput length={4} value="4021" onChange={() => {}} status="error" size="sm" /> },
      { label: 'Verified', render: <PinInput length={4} value="4021" onChange={() => {}} status="success" size="sm" /> },
      { label: 'Masked', render: <PinInput length={4} value="4021" onChange={() => {}} mask size="sm" /> },
      { label: 'Disabled', render: <PinInput length={4} value="4021" onChange={() => {}} disabled size="sm" /> },
      { label: 'Grouped', render: <PinInput length={6} value="402193" onChange={() => {}} groupAfter={3} size="sm" /> },
      { label: 'Large', render: <PinInput length={3} value="402" onChange={() => {}} size="lg" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Field label="Verification code" description="We sent a 6-digit code to ada@example.com.">
          <PinInput length={6} value="4021" onChange={() => {}} />
        </Field>
      </div>
    ),
    caption:
      'Six boxes in one labelled group. The caret sits in the next empty box, and the count of boxes is the instruction.',
    parts: [
      {
        n: 1,
        label: 'Box size',
        value: '40 × 44px (md)',
        kind: 'size',
        note: 'Taller than wide, so a single character sits in a portrait slot rather than a square. 44px tall clears the touch minimum without padding.',
      },
      {
        n: 2,
        label: 'Gap',
        value: '8px, 16px at a group break',
        kind: 'space',
        note: 'Even spacing reads as one value. The double gap at a break is what chunks eight digits into two fours.',
      },
      {
        n: 3,
        label: 'Type',
        value: '17px monospace, centred',
        kind: 'type',
        note: 'Monospace so every digit sits identically in its box, and larger than body text because these characters are being checked against another screen.',
      },
      {
        n: 4,
        label: 'Focus',
        value: 'Border + 3px halo, one box',
        kind: 'color',
        note: 'Only the active box is focused. The group border never changes on focus, or six boxes appear active at once.',
      },
      {
        n: 5,
        label: 'Status',
        value: 'Applied to every box',
        kind: 'color',
        note: 'A wrong code is wrong as a whole. Marking one box red claims you know which digit was mistyped.',
      },
      {
        n: 6,
        label: 'Autofill anchor',
        value: 'First box only',
        kind: 'motion',
        note: 'autocomplete="one-time-code" on box one. On every box, the platform fills each with the entire code.',
      },
      {
        n: 7,
        label: 'Group label',
        value: 'One for all boxes',
        kind: 'type',
        note: 'role="group" with a name. Six unlabelled inputs announcing "edit text, blank" is the worst outcome available here.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Box fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle box border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focused box border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Incorrect code — every box' },
    { category: 'color', token: '--ds-success-border', usedFor: 'Verified — every box' },
    { category: 'color', token: '--ds-fg', usedFor: 'The digits' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'The group separator dash' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Gap between boxes' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Box corners' },
    { category: 'typography', token: 'font-mono', usedFor: 'Digits, so each sits identically in its box' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Border and halo transition' },
  ],

  sizes: [
    { name: 'Small', height: '36px', minWidth: '32px', type: '15px', gap: '6px', use: 'Inside a dialog, or when eight boxes must fit a narrow column.' },
    { name: 'Medium', height: '44px', minWidth: '40px', type: '17px', gap: '8px', use: 'The default. Clears the touch minimum with no extra padding.' },
    { name: 'Large', height: '56px', minWidth: '48px', type: '21px', gap: '10px', use: 'A dedicated verification screen where the code is the only thing on it.' },
    { name: 'Group separator', gap: '16px', use: 'Double the standard gap, with a short dash. Only worth it past six digits.' },
    { name: 'Max length', minWidth: '8 boxes', use: 'Past eight, boxes wrap on a phone and a single monospace field is better.' },
  ],

  do: [
    {
      title: 'Make paste fill every box',
      why: 'Users copy the code from an SMS or an email. Filling only the focused box breaks the primary path and fails silently.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onPaste → digits.slice(0, length) → fill all
        </code>
      ),
    },
    {
      title: 'Put autocomplete="one-time-code" on the first box only',
      why: 'It is what makes iOS and Android offer the code above the keyboard. On every box, the platform fills each one with the whole code.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">box[0] → one-time-code</span>
          <span className="text-[var(--ds-fg-muted)]">box[1..n] → off</span>
        </Stack>
      ),
    },
    {
      title: 'Backspace on an empty box clears the previous one',
      why: 'One press, one deletion. Requiring a move then a delete is the detail that makes an otherwise fine implementation feel wrong.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>⌫ on empty</span>
          <span className="text-[var(--ds-fg-disabled)]">→</span>
          <span>clear previous + focus it</span>
        </Row>
      ),
    },
    {
      title: 'Submit automatically when the last digit lands',
      why: 'The user has nothing left to decide. A Verify button after the sixth digit is a click that exists only because the form was not paying attention.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          if (code.length === length) verify(code)
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not leave the boxes unlabelled',
      why: 'Six inputs each announcing "edit text, blank" gives a screen-reader user no idea what is being asked or how many digits are left.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          “edit text, blank” × 6
        </span>
      ),
    },
    {
      title: 'Do not mark a single box as wrong',
      why: 'You do not know which digit was mistyped — the server rejected the whole code. Colouring box three implies knowledge you do not have.',
      render: (
        <Row gap="sm">
          {['4', '0', '2', '1'].map((d, i) => (
            <span
              key={i}
              className={cn(
                'grid h-9 w-8 place-items-center rounded-[var(--radius-md)] border bg-[var(--ds-surface-inset)] font-mono',
                i === 2
                  ? 'border-[var(--ds-danger-border)] text-[var(--ds-danger-text)]'
                  : 'border-[var(--ds-border-interactive)] text-[var(--ds-fg)]',
              )}
            >
              {d}
            </span>
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not use it for long or alphanumeric codes',
      why: 'Twelve boxes wrap to two rows on a phone and the grouping benefit disappears. A monospace field with a format hint is better.',
      render: (
        <div className="flex max-w-[15rem] flex-wrap gap-1.5">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="h-8 w-7 rounded-[var(--radius-sm)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)]"
            />
          ))}
        </div>
      ),
    },
    {
      title: 'Do not clear the code on a failed attempt',
      why: 'Usually one digit was mistyped. Wiping all six means transcribing the whole code again, and the code may have expired by then.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          verify() fails → setCode('') → user retypes six digits
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.8', name: 'Accessible Authentication', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Box borders owe 3:1 — they are the only thing showing how many digits are expected.',
      'The digits owe 4.5:1. They are being checked against another screen, so legibility matters more here than almost anywhere.',
      'The error state changes every border plus the message, so it survives greyscale.',
      'A masked box must still show that it contains something — an empty box and a masked one cannot look alike.',
    ],
    keyboard: [
      { keys: '0–9', does: 'Enters a digit and advances to the next box.' },
      { keys: 'Backspace', does: 'Clears the current box, or clears the previous one and moves there if the current box is empty.' },
      { keys: '← / →', does: 'Moves between boxes without changing anything.' },
      { keys: '⌘ / Ctrl + V', does: 'Fills every box from the pasted string, ignoring separators.' },
      { keys: 'Tab', does: 'Leaves the whole group. Boxes are not individual tab stops — Tab six times to leave a code field is punishing.' },
    ],
    aria: [
      { attr: 'role="group"', on: 'The container', note: 'With aria-label: "Verification code, 6 digits". This is what makes the boxes one question.' },
      { attr: 'aria-label', on: 'Each box', note: '"Digit 1 of 6". Never bare — an unlabelled box announces as "edit text, blank".' },
      { attr: 'autocomplete="one-time-code"', on: 'The first box only', note: 'Triggers platform autofill. On every box it fills each one with the entire code.' },
      { attr: 'inputmode="numeric"', on: 'Each box', note: 'Numeric keypad on mobile. With type="text", so leading zeros survive.' },
      { attr: 'aria-invalid', on: 'Every box', note: 'The whole code is wrong, not one digit.' },
      { attr: 'role="status"', on: 'The result message', note: 'Announces success or failure. A silent failure leaves the user staring at an unchanged screen.' },
    ],
    focus:
      'Focus moves automatically as digits are entered, and selects the box content on focus so typing replaces rather than appends. On a failed attempt, focus returns to the first box with the code intact — ready to correct, not to retype.',
    screenReader: [
      'The group announces once: "Verification code, 6 digits, group". Each box then announces its position.',
      'Announce completion: "Code complete, verifying". Auto-submit with no announcement leaves the user unsure anything happened.',
      'WCAG 2.2’s Accessible Authentication criterion is why paste must work — requiring a user to transcribe a code by memory is exactly the cognitive test it prohibits.',
    ],
    touch:
      'inputmode="numeric" with type="text" gives the keypad without stripping leading zeros. Boxes at 44px tall clear the target minimum without padding. Keep the whole group above the on-screen keyboard — a code field that scrolls under the keyboard while autofill offers the code above it is the worst possible arrangement.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { PinInput } from '@/ui/Input'

<Field
  label="Verification code"
  description="We sent a 6-digit code to ada@example.com."
  status={error ? 'error' : 'default'}
  message={error}
>
  <PinInput
    length={6}
    value={code}
    onChange={setCode}
    // Nothing left to decide once the last digit lands.
    onComplete={verify}
  />
</Field>

// Paste is the PRIMARY path, not an edge case. Users copy from an SMS.
function onPaste(e: React.ClipboardEvent) {
  e.preventDefault()
  const digits = e.clipboardData.getData('text').replace(/\\D/g, '').slice(0, length)
  if (!digits) return
  onChange(digits)
  refs.current[Math.min(length - 1, digits.length)]?.focus()
}

// One press, one deletion.
function onKeyDown(e: React.KeyboardEvent, i: number) {
  if (e.key !== 'Backspace') return
  e.preventDefault()
  if (value[i]) return setAt(i, '')
  if (i > 0) {
    onChange(value.slice(0, i - 1))
    refs.current[i - 1]?.focus()
  }
}

// On failure, keep the code and return to the first box. Usually one digit
// was mistyped, and the code may expire before they can retype all six.
async function verify(code: string) {
  const ok = await api.verify(code)
  if (!ok) {
    setError('That code is incorrect or has expired.')
    refs.current[0]?.focus()
  }
}`,
    },
    html: {
      lang: 'html',
      code: `<div role="group" aria-label="Verification code, 6 digits">
  <!-- one-time-code on the FIRST box only, or the platform fills every box
       with the entire code. -->
  <input
    type="text"
    inputmode="numeric"
    autocomplete="one-time-code"
    maxlength="1"
    aria-label="Digit 1 of 6"
  />
  <input type="text" inputmode="numeric" autocomplete="off"
         maxlength="1" aria-label="Digit 2 of 6" />
  <input type="text" inputmode="numeric" autocomplete="off"
         maxlength="1" aria-label="Digit 3 of 6" />
  …
</div>

<p role="status" aria-live="polite">Code complete, verifying</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-pin {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ds-pin input {
  inline-size: 40px;
  block-size: 44px;                  /* clears the touch minimum unpadded */
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
  text-align: center;
  /* Every digit sits identically in its box. */
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: 17px;
}

/* Only the active box. The group border never changes, or six boxes look
   focused at once. */
.ds-pin input:focus-visible {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
  outline: none;
}

/* The whole code is wrong, not one digit. */
.ds-pin[data-status='error'] input   { border-color: var(--ds-danger-border); }
.ds-pin[data-status='success'] input { border-color: var(--ds-success-border); }

/* Double gap at a chunk break, past six digits. */
.ds-pin__separator {
  inline-size: 12px;
  block-size: 1px;
  margin-inline: 4px;
  background: var(--ds-border-strong);
}

/* Native spinners have no business here. */
.ds-pin input::-webkit-inner-spin-button { appearance: none; }`,
    },
    api: [
      {
        name: 'PinInput',
        props: [
          { name: 'length', type: 'number', default: '6', description: 'Number of boxes. Past eight, use a Text Field instead.' },
          { name: 'value', type: 'string', required: true, description: 'The whole code as one string. Never an array — paste and autofill both arrive as one value.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fires with the complete current value on every change.' },
          { name: 'onComplete', type: '(v: string) => void', description: 'Fires once the last box is filled. Submit here rather than adding a button.' },
          { name: 'mask', type: 'boolean', default: 'false', description: 'For codes shown on a shared screen. A masked box must still look different from an empty one.' },
          { name: 'groupAfter', type: 'number', description: 'Inserts a separator after this many boxes. Only worth it past six digits.' },
          { name: 'status', type: "'default' | 'error' | 'success'", default: "'default'", description: 'Applied to every box — the code is a single value.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep the destination editable on this screen. A mistyped email otherwise means restarting the entire flow, and that is where verification funnels lose people.',
      'Put a cooldown on Resend and show the countdown. Without it users press it repeatedly and receive three codes, only the last of which works.',
      'Say how long the code lasts. "Expires in 10 minutes" prevents the confused retry after someone comes back from another tab.',
      'Accept the code with spaces or dashes when pasted. Some clients format the code in the message body.',
      'Focus the first box on mount, so a user who is already holding the code can start typing immediately.',
    ],
    performance: [
      'Keep one string in state, not an array of characters. Paste and platform autofill both arrive as one value, and an array turns that into a merge problem.',
      'Debounce nothing here. The code is six characters and every keystroke should be instant.',
      'Do not re-render the whole form on each digit. Keep the code local and lift it on completion.',
    ],
    mistakes: [
      'Paste filling only the focused box, breaking the primary path silently.',
      'autocomplete="one-time-code" on every box, so autofill puts the whole code in each one.',
      'Unlabelled boxes announcing "edit text, blank" six times.',
      'Backspace needing two presses to delete the previous digit.',
      'Clearing the whole code on a failed attempt, forcing a full retype.',
      'Marking one box as the wrong digit, when the server only rejected the whole code.',
      'type="number", which strips leading zeros and adds a spinner.',
      'Boxes as individual tab stops, so leaving the field takes six Tab presses.',
    ],
    realWorld: [
      'Verification is one of the highest-drop-off steps in any sign-up. Autofill, paste and an editable destination are worth more than any visual refinement here.',
      'Six digits is the de facto standard because it is what most authenticator apps emit. Four feels insecure to users even when it is not; eight is where boxes stop fitting comfortably.',
      'Codes arriving by SMS are frequently read aloud from another device. Keep the digits large and monospaced — this is one of the few places where type size is a functional requirement.',
      'If a meaningful share of users fail on the first attempt, check whether the code is being wrapped or truncated in the message before blaming the input.',
    ],
  },
})

function VerifyFlow() {
  const [code, setCode] = React.useState('')
  const [state, setState] = React.useState<'idle' | 'error' | 'ok'>('idle')
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  React.useEffect(() => {
    // Nothing left to decide once the last digit lands.
    if (code.length !== 6) return setState('idle')
    setState(code === '402193' ? 'ok' : 'error')
  }, [code])

  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <Stack gap="md" className="w-full max-w-sm">
        <Field
          label="Verification code"
          description="We sent a 6-digit code to ada@example.com."
          status={state === 'error' ? 'error' : state === 'ok' ? 'success' : 'default'}
          message={
            state === 'error'
              ? 'That code is incorrect or has expired.'
              : state === 'ok'
                ? 'Verified'
                : undefined
          }
        >
          <PinInput
            length={6}
            value={code}
            onChange={setCode}
            status={state === 'error' ? 'error' : state === 'ok' ? 'success' : 'default'}
          />
        </Field>
        <Row gap="sm" align="center">
          <Button
            size="sm"
            variant="text"
            disabled={cooldown > 0}
            onClick={() => setCooldown(30)}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </Button>
          <Button size="sm" variant="text">
            Use a different email
          </Button>
        </Row>
        <p className="text-caption text-[var(--ds-fg-muted)]">
          Try 402193. The code expires in 10 minutes.
        </p>
      </Stack>
    </PreviewStage>
  )
}
