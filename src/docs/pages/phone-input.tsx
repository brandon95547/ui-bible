import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const COUNTRIES = [
  { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom', dial: '+44', format: '#### ######', example: '7400 123456' },
  { iso: 'US', flag: '🇺🇸', name: 'United States', dial: '+1', format: '(###) ###-####', example: '(415) 555-0132' },
  { iso: 'DE', flag: '🇩🇪', name: 'Germany', dial: '+49', format: '### #######', example: '151 1234567' },
  { iso: 'IN', flag: '🇮🇳', name: 'India', dial: '+91', format: '##### #####', example: '98765 43210' },
  { iso: 'JP', flag: '🇯🇵', name: 'Japan', dial: '+81', format: '##-####-####', example: '90-1234-5678' },
]

/** Applies the country's mask to the raw digits, stopping when they run out. */
function applyMask(digits: string, mask: string) {
  let out = ''
  let i = 0
  for (const ch of mask) {
    if (i >= digits.length) break
    if (ch === '#') out += digits[i++]
    else out += ch
  }
  return out
}

function PhoneField({
  size = 'md',
  live = true,
  status,
}: {
  size?: 'sm' | 'md' | 'lg'
  live?: boolean
  status?: 'default' | 'error' | 'success'
}) {
  const [country, setCountry] = React.useState(COUNTRIES[0])
  const [digits, setDigits] = React.useState('7400123456')
  const [open, setOpen] = React.useState(false)

  const shown = live ? applyMask(digits, country.format) : digits
  // What actually gets stored, regardless of how it was typed or displayed.
  const e164 = `${country.dial}${digits}`

  const h = { sm: 'h-8', md: 'h-9', lg: 'h-11' }[size]

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative flex items-stretch rounded-[var(--radius-md)] border bg-[var(--ds-surface-inset)]',
          'focus-within:border-[var(--ds-accent)] focus-within:shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
          h,
          status === 'error'
            ? 'border-[var(--ds-danger-border)]'
            : status === 'success'
              ? 'border-[var(--ds-success-border)]'
              : 'border-[var(--ds-border-interactive)]',
        )}
      >
        {/* The country selector is a real button inside the field, not a
            separate control — one field, one value, one focus ring. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Country code: ${country.name} ${country.dial}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1.5 rounded-l-[var(--radius-md)] pl-2.5 pr-2 text-body-sm text-[var(--ds-fg-secondary)] transition-colors hover:bg-[var(--ds-layer-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <span aria-hidden className="text-[15px] leading-none">
            {country.flag}
          </span>
          <span className="font-mono tabular-nums">{country.dial}</span>
          <ChevronDown size={12} aria-hidden className="text-[var(--ds-fg-muted)]" />
        </button>

        <span aria-hidden className="my-1.5 w-px bg-[var(--ds-border-subtle)]" />

        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-label="Phone number"
          value={shown}
          placeholder={country.example}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
          onPaste={(e) => {
            // People paste "+44 7400 123456". Strip it to digits and, if a
            // dial code is present, switch the country rather than rejecting.
            const text = e.clipboardData.getData('text')
            e.preventDefault()
            const match = COUNTRIES.find((c) => text.replace(/\s/g, '').startsWith(c.dial))
            if (match) setCountry(match)
            const raw = text.replace(/\D/g, '')
            setDigits(match ? raw.slice(match.dial.length - 1) : raw)
          }}
          className="min-w-0 flex-1 bg-transparent px-2.5 font-mono text-body-sm tabular-nums text-[var(--ds-fg)] outline-none placeholder:font-sans placeholder:text-[var(--ds-fg-muted)]"
        />
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Country"
          className="mt-1.5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1 shadow-e4"
        >
          {COUNTRIES.map((c) => (
            <button
              key={c.iso}
              type="button"
              role="option"
              aria-selected={c.iso === country.iso}
              onClick={() => {
                setCountry(c)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-label',
                c.iso === country.iso
                  ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                  : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]',
              )}
            >
              <span aria-hidden>{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
                {c.dial}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="mt-1.5 font-mono text-caption text-[var(--ds-fg-muted)]">
        Stored as {e164}
      </p>
    </div>
  )
}

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [live, setLive] = React.useState(true)
  const [status, setStatus] = React.useState<'default' | 'error' | 'success'>('default')

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
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
          <KnobToggle checked={live} onChange={setLive} label="Live formatting" />
        </div>
      }
      code={`<Field label="Mobile number" description="We only use this for delivery updates.">
  <PhoneInput
    size="${size}"
    defaultCountry="GB"
    value={value}          // always E.164: "+447400123456"
    onChange={setValue}
    format={${live}}
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field
          label="Mobile number"
          description="We only use this for delivery updates."
          status={status}
          message={
            status === 'error'
              ? 'That number is too short for the United Kingdom.'
              : status === 'success'
                ? 'Verified'
                : undefined
          }
        >
          <PhoneField size={size} live={live} status={status} />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'phone-input',
    title: 'Phone Input',
    tagline:
      'Country selector, live formatting as the user types, and storing E.164 no matter what shape it arrived in.',
    keywords: ['tel', 'e164', 'dial code', 'country', 'formatting', 'international', 'sms'],
  },

  overview: {
    purpose:
      'A phone input collects a number that must be dialable. That sounds trivial and is not: the same number is written six ways in six countries, users paste from contact cards with spaces and brackets, and the value you store has to be unambiguous enough to send an SMS to. The component absorbs all of that variation and hands the form one canonical string.',
    whenToUse: [
      'Any number you will actually dial or text: verification, delivery updates, account recovery.',
      'International sign-ups, where the country code cannot be assumed from the locale.',
      'Support and CRM forms where a number will be read back by a human.',
    ],
    whenNotToUse: [
      {
        text: 'The number is a one-time code the user is entering.',
        instead: 'a Pin Input',
        to: '#/pin-input',
      },
      {
        text: 'It is an extension, an account number, or any other digit string.',
        instead: 'a Text Field — there is no country and no format to apply',
        to: '#/text-field',
      },
      {
        text: 'The number is optional and never used.',
        instead: 'nothing — do not collect a phone number you will not dial',
        to: '#/form',
      },
      {
        text: 'You need a quantity.',
        instead: 'a Number Input',
        to: '#/number-input',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Display and storage are different things.</strong> Show{' '}
          <code>7400 123456</code> because that is how the user thinks about their number; store{' '}
          <code>+447400123456</code> because that is what a telephony API accepts. A form that
          stores whatever was typed will eventually try to text "0740 0123 456" and fail with no
          useful error.
        </p>
        <p>
          Never use <code>type="number"</code>. It strips leading zeros — fatal for most national
          formats — rejects the plus sign, and offers a spinner on a value that has no order.{' '}
          <code>type="tel"</code> with <code>inputmode="tel"</code> gives the right keypad and no
          silent mangling.
        </p>
        <p>
          The paste case is the one that decides whether the field feels good. People paste{' '}
          <code>+44 7400 123456</code> from a contact card. Detect the dial code, switch the
          country, strip the separators, and keep going — rejecting the paste is the fastest way
          to make someone give up on a sign-up form.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'formats',
        title: 'The format follows the country',
        description:
          'Switching the country re-masks the same digits. The mask is a hint about grouping, never a validation rule — numbering plans change more often than anyone updates a regex.',
        render: (
          <PreviewStage minHeight={240} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              <PhoneField />
              <p className="text-caption text-[var(--ds-fg-muted)]">
                Open the country selector and watch the same digits regroup.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'storage',
        title: 'Display vs. storage',
        description:
          'What the user reads and what the database holds are two different strings, and only one of them is dialable.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Shown" tone="good">
                <span className="font-mono text-body text-[var(--ds-fg)]">🇬🇧 +44 7400 123456</span>
              </Cell>
              <Cell label="Stored" tone="good">
                <span className="font-mono text-body text-[var(--ds-fg)]">+447400123456</span>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'paste',
        title: 'Paste has to work',
        description:
          'Every one of these is a real thing people paste from a contact card. All of them should land as the same stored value.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="xs" className="w-full max-w-sm">
              {['+44 7400 123456', '(0)7400 123456', '07400-123-456', '+44 (0) 7400 123456'].map(
                (s) => (
                  <Row key={s} gap="sm" align="center" className="w-full">
                    <code className="flex-1 font-mono text-caption text-[var(--ds-fg-secondary)]">
                      {s}
                    </code>
                    <span className="text-[var(--ds-fg-disabled)]">→</span>
                    <code className="font-mono text-caption text-[var(--ds-success-text)]">
                      +447400123456
                    </code>
                  </Row>
                ),
              )}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'The country selector keeps a readable dial code at every size. Reducing it to a flag alone removes the one part users actually verify.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <PhoneField key={s} size={s} />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <div className="w-56"><PhoneField /></div> },
      { label: 'Filled', render: <div className="w-56"><PhoneField /></div> },
      { label: 'Error', render: <div className="w-56"><PhoneField status="error" /></div> },
      { label: 'Verified', render: <div className="w-56"><PhoneField status="success" /></div> },
      { label: 'Unformatted', render: <div className="w-56"><PhoneField live={false} /></div> },
      { label: 'Small', render: <div className="w-56"><PhoneField size="sm" /></div> },
      { label: 'Large', render: <div className="w-56"><PhoneField size="lg" /></div> },
      {
        label: 'Country row',
        render: (
          <span className="flex w-48 items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 text-label text-[var(--ds-fg-secondary)]">
            <span aria-hidden>🇩🇪</span>
            <span className="flex-1">Germany</span>
            <span className="font-mono text-caption text-[var(--ds-fg-muted)]">+49</span>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Field label="Mobile number" description="We only use this for delivery updates.">
          <PhoneField />
        </Field>
      </div>
    ),
    caption:
      'One field, two controls: a country button that owns the dial code and a tel input that owns the digits. They share a border and a focus ring.',
    parts: [
      {
        n: 1,
        label: 'Country button',
        value: 'Flag + dial code + chevron',
        kind: 'size',
        note: 'The dial code is the part users verify, so it must stay visible. A flag alone is ambiguous — several countries share +1 and several share a flag at 16px.',
      },
      {
        n: 2,
        label: 'Divider',
        value: '1px, inset 6px',
        kind: 'shape',
        note: 'Separates two targets inside one field. Inset from the top and bottom so it reads as a seam rather than a border.',
      },
      {
        n: 3,
        label: 'Number',
        value: 'Monospace, tabular',
        kind: 'type',
        note: 'Monospace so the groups stay aligned as digits are typed and deleted, and so 1 and l cannot be confused when the number is read back aloud.',
      },
      {
        n: 4,
        label: 'Placeholder',
        value: 'A real example number',
        kind: 'type',
        note: 'The country’s own example, not "Enter phone number". It teaches the expected grouping without a single word of instruction.',
      },
      {
        n: 5,
        label: 'Live mask',
        value: 'Applied on input',
        kind: 'motion',
        note: 'Groups the digits as they are typed. Must never block a character it does not expect — numbering plans change and the mask will be wrong for somebody.',
      },
      {
        n: 6,
        label: 'Shared focus ring',
        value: 'Around the whole field',
        kind: 'color',
        note: 'One value, one field, one ring. Two separate rings makes it look like two questions.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle border' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Seam between the two controls' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo and selected country' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Placeholder, chevron, dial codes in the list' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Invalid number' },
    { category: 'spacing', token: 'country padding', value: '0 8px 0 10px', usedFor: 'Country button' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'typography', token: 'font-mono', usedFor: 'The number, so groups stay aligned' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Country hover and focus transition' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px', type: '13px', minWidth: '13rem', use: 'Dense CRM forms and table filters.' },
    { name: 'Medium', height: '36px', padding: '0 10px', type: '15px', minWidth: '15rem', use: 'The default.' },
    { name: 'Large', height: '44px', padding: '0 12px', type: '16px', minWidth: '16rem', use: 'Sign-up and checkout, especially on touch.' },
    { name: 'Country button', minWidth: '5rem', use: 'Wide enough for a four-character dial code plus a flag and a chevron without truncating.' },
    { name: 'Country list', height: 'max 256px', maxWidth: '18rem', use: 'Searchable past about twenty entries — nobody scrolls to Zimbabwe.' },
  ],

  do: [
    {
      title: 'Store E.164, always',
      why: 'It is the only format a telephony API accepts without guessing. What the user typed is a display concern; what you store has to be dialable.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          display: 7400 123456
          <br />
          stored: +447400123456
        </code>
      ),
    },
    {
      title: 'Default the country from the user, not the browser',
      why: 'A saved profile country beats an IP guess, which beats the browser locale. Getting it right removes an interaction from the most abandoned form in most products.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>profile.country</span>
          <span className="text-[var(--ds-fg-disabled)]">→</span>
          <span>geo-IP</span>
          <span className="text-[var(--ds-fg-disabled)]">→</span>
          <span>navigator.language</span>
        </Row>
      ),
    },
    {
      title: 'Accept any paste and normalise it',
      why: 'Contact cards contain brackets, spaces, dots and a leading zero after the country code. All of them are the same number and all of them should just work.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          "+44 (0) 7400-123-456" → +447400123456
        </code>
      ),
    },
    {
      title: 'Use type="tel" with inputmode="tel"',
      why: 'It gives the numeric keypad with the symbols phone numbers actually use, and it does not strip leading zeros the way type="number" does.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          type="tel" inputmode="tel"
          <br />
          autocomplete="tel-national"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use type="number"',
      why: 'It strips the leading zero most national formats depend on, rejects the plus sign, and puts a spinner on a value that has no order.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          07400123456 → 7400123456 → undialable
        </span>
      ),
    },
    {
      title: 'Do not block characters the mask does not expect',
      why: 'Numbering plans change and your mask is out of date for someone right now. Format loosely, validate on submit, and never swallow a keystroke.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          maxLength on a mask → a valid number that cannot be entered
        </span>
      ),
    },
    {
      title: 'Do not show a flag with no dial code',
      why: 'Several countries share +1, several flags are indistinguishable at 16px, and a flag alone is a political statement in some territories. The dial code is the unambiguous part.',
      render: (
        <span className="flex w-40 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] px-2.5 py-2 text-body-sm text-[var(--ds-fg-muted)]">
          <span aria-hidden>🇺🇸</span>
          <span className="flex-1">7400 123456</span>
        </span>
      ),
    },
    {
      title: 'Do not validate against a regex you wrote',
      why: 'National numbering plans are large, inconsistent and constantly revised. Use a maintained library, or validate only that the number is plausibly long enough.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          /^\d{'{'}10{'}'}$/ → rejects most of the world
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The dial code owes 4.5:1 — it is part of the value, not decoration.',
      'The seam between the country button and the input must reach 3:1: it is the boundary between two separate targets.',
      'Flags are decorative and aria-hidden, because emoji rendering varies wildly and cannot be relied on to convey anything.',
      'The example placeholder owes 4.5:1 like any other text.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the country button, then the number field. Two controls, two stops.' },
      { keys: 'Enter / Space / ↓', does: 'On the country button, opens the list and focuses the current country.' },
      { keys: 'A–Z', does: 'Typeahead in the country list, matching the country name — not the dial code, which nobody remembers.' },
      { keys: 'Esc', does: 'Closes the country list and returns focus to the button.' },
      { keys: '⌘ / Ctrl + V', does: 'Pastes and normalises, including switching the country when a dial code is present.' },
    ],
    aria: [
      { attr: 'autocomplete="tel-national"', on: 'The number field', note: 'With autocomplete="tel-country-code" on the country control. Split tokens are what let a browser fill both halves correctly.' },
      { attr: 'aria-label', on: 'The country button', note: 'Must include the country and the code: "Country code: United Kingdom +44". A flag has no accessible name.' },
      { attr: 'role="listbox" / "option"', on: 'The country list', note: 'With aria-selected on the current country.' },
      { attr: 'aria-describedby', on: 'The number field', note: 'Points at the example format, so the expected shape is read before typing rather than discovered by failing.' },
      { attr: 'aria-invalid', on: 'The number field', note: 'On a validation failure, paired with a message naming the country: "That number is too short for the United Kingdom."' },
    ],
    focus:
      'The two controls share one visible focus ring around the whole field, drawn with focus-within, plus an inner ring on whichever control has focus. Selecting a country returns focus to the country button, not to the number field — the user may want to check what they picked.',
    screenReader: [
      'Announce the selected country and code when it changes: "United Kingdom, plus four four".',
      'Read the example format via aria-describedby before the user types. Discovering the expected shape through an error is the worst possible order.',
      'Do not announce the mask as it applies. A live region firing on every keystroke while a number regroups is unusable.',
    ],
    touch:
      'inputmode="tel" gives the keypad with * and #, which a plain numeric pad lacks. The country list should be a full-screen sheet with a search field on a phone — a floating list of two hundred countries under an on-screen keyboard is unusable. Field height goes to 44px, and the country button needs its own 44px target.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { PhoneInput } from '@/ui/Input'

<Field label="Mobile number" description="We only use this for delivery updates.">
  <PhoneInput
    value={phone}                   // ALWAYS E.164: "+447400123456"
    onChange={setPhone}
    defaultCountry={user.country ?? geo.country ?? 'US'}
  />
</Field>

// Display and storage are different strings. Only one of them is dialable.
function toDisplay(e164: string, country: Country) {
  const national = e164.slice(country.dial.length)
  return applyMask(national, country.format)
}

// Paste is the case that decides whether the field feels good. Detect the
// dial code, switch the country, strip separators, keep going.
function onPaste(e: React.ClipboardEvent) {
  const text = e.clipboardData.getData('text')
  e.preventDefault()
  const match = COUNTRIES.find((c) => text.replace(/\\s/g, '').startsWith(c.dial))
  if (match) setCountry(match)
  setDigits(text.replace(/\\D/g, ''))
}

// Validate with a maintained library, never a hand-written regex. National
// numbering plans are large, inconsistent, and revised more often than any
// regex in your codebase.
import { parsePhoneNumber } from 'libphonenumber-js'
const parsed = parsePhoneNumber(raw, country.iso)
const valid = parsed?.isValid() ?? false
const e164 = parsed?.format('E.164')`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label for="phone">Mobile number</label>
  <p id="phone-hint">For example, 7400 123456</p>

  <div class="ds-phone">
    <!-- A flag has no accessible name. The label carries both parts. -->
    <button
      type="button"
      class="ds-phone__country"
      aria-label="Country code: United Kingdom +44"
      aria-haspopup="listbox"
      aria-expanded="false"
      autocomplete="tel-country-code"
    >
      <span aria-hidden="true">🇬🇧</span>
      <span>+44</span>
      <svg aria-hidden="true">…</svg>
    </button>

    <span class="ds-phone__seam" aria-hidden="true"></span>

    <!-- tel, never number: number strips the leading zero. -->
    <input
      id="phone"
      type="tel"
      inputmode="tel"
      autocomplete="tel-national"
      aria-describedby="phone-hint"
      placeholder="7400 123456"
    />
  </div>

  <!-- What actually gets submitted. -->
  <input type="hidden" name="phone" value="+447400123456" />
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-phone {
  display: flex;
  align-items: stretch;
  block-size: 36px;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

/* One value, one field, one ring. Two rings reads as two questions. */
.ds-phone:focus-within {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
}

.ds-phone__country {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-inline-size: 5rem;             /* fits +XXX plus a flag and a chevron */
  padding-inline: 10px 8px;
  font-variant-numeric: tabular-nums;
}

/* Inset so it reads as a seam between two targets, not as a border. */
.ds-phone__seam {
  inline-size: 1px;
  margin-block: 6px;
  background: var(--ds-border-subtle);
}

.ds-phone input {
  flex: 1;
  min-inline-size: 0;
  padding-inline: 10px;
  border: 0;
  background: none;
  /* Groups stay aligned as digits are typed and deleted. */
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.ds-phone input::placeholder { font-family: var(--font-sans); }

@media (pointer: coarse) {
  .ds-phone { block-size: 44px; }
  /* A floating list of 200 countries under an on-screen keyboard is
     unusable — go full-screen with a search field. */
  .ds-phone__list { position: fixed; inset: 0; }
}`,
    },
    api: [
      {
        name: 'PhoneInput',
        props: [
          { name: 'value', type: 'string', required: true, description: 'E.164 only: "+447400123456". Never the formatted display string.' },
          { name: 'onChange', type: '(e164: string) => void', required: true, description: 'Fires with the canonical value, whatever shape the input was in.' },
          { name: 'defaultCountry', type: 'string', default: "'US'", description: 'ISO 3166-1 alpha-2. Resolve from the user profile first, then geo-IP, then the locale.' },
          { name: 'countries', type: 'string[]', description: 'Restricts the list. Worth doing when you only ship to a few markets.' },
          { name: 'format', type: 'boolean', default: 'true', description: 'Live grouping as the user types. Never blocks a character it does not expect.' },
          { name: 'status', type: "'default' | 'error' | 'success' | 'warning'", default: "'default'", description: 'Success is useful here — a verified number is worth confirming.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Make the country list searchable past about twenty entries. Nobody scrolls to Zimbabwe, and typing "zim" is one second versus fifteen.',
      'Sort your shipping markets to the top of the list with a divider beneath them, then the rest alphabetically.',
      'Show the country’s own example number as the placeholder. It communicates the expected grouping without a word of instruction.',
      'If you verify by SMS, show the number back in E.164 on the confirmation step. Users check the digits, and the grouped display hides a transposition.',
      'Never require a phone number you do not dial. It is the single most abandonment-inducing optional field in most sign-up forms.',
    ],
    performance: [
      'A full numbering-plan library is several hundred kilobytes. Load it lazily on focus, or ship the metadata for only the countries you serve.',
      'Debounce validation until blur. Validating a partial number on every keystroke means showing an error for every number in the world while it is being typed.',
      'Cache the mask per country rather than recomputing it on each render — masking runs on every keystroke.',
    ],
    mistakes: [
      'type="number", which strips the leading zero and makes the number undialable.',
      'Storing the formatted string, so the telephony API is handed brackets and spaces.',
      'A hand-written regex that rejects most of the world’s valid numbers.',
      'maxLength on a mask, making some valid numbers impossible to enter.',
      'A flag with no dial code, which is ambiguous at every size.',
      'Rejecting pasted numbers with separators — which is how most numbers arrive.',
      'A country list with no search, forcing a scroll through two hundred entries.',
    ],
    realWorld: [
      'Phone fields are among the highest-abandonment inputs in any sign-up flow. Every interaction you remove — a correct default country, a paste that works, a keypad that appears — shows up in the completion rate.',
      'Users in countries with a trunk prefix habitually type the leading zero after the country code. Strip it silently rather than erroring; "+44 0 7400" is a person being careful, not a mistake.',
      'For verification flows, keep the number editable on the code-entry screen. A mistyped number otherwise means restarting the whole flow.',
      'If you only ship to two countries, a Select of those two beside a plain field beats a full international picker — but keep E.164 storage regardless.',
    ],
  },
})
