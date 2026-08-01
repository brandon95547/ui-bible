import * as React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, PasswordInput } from '@/ui/Input'
import { Meter } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const RULES = [
  { id: 'len', label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
  { id: 'case', label: 'Upper and lower case', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'num', label: 'A number or symbol', test: (v: string) => /[\d\W]/.test(v) },
]

function strength(v: string) {
  const passed = RULES.filter((r) => r.test(v)).length
  const long = v.length >= 16 ? 1 : 0
  return Math.min(4, passed + long)
}

const STRENGTH = [
  { label: '', tone: 'neutral' as const },
  { label: 'Weak', tone: 'danger' as const },
  { label: 'Fair', tone: 'warning' as const },
  { label: 'Good', tone: 'accent' as const },
  { label: 'Strong', tone: 'success' as const },
]

function Playground() {
  const [value, setValue] = React.useState('correct horse')
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [meter, setMeter] = React.useState(true)
  const [caps, setCaps] = React.useState(false)

  const s = strength(value)

  return (
    <PreviewStage
      label="Playground"
      minHeight={230}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <KnobToggle checked={meter} onChange={setMeter} label="Strength meter" />
          <KnobToggle checked={caps} onChange={setCaps} label="Caps Lock" />
        </div>
      }
      code={`<Field
  label="New password"
  description="At least 12 characters."${caps ? '\n  status="warning"\n  message="Caps Lock is on."' : ''}
>
  <PasswordInput
    size="${size}"
    autoComplete="new-password"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field
          label="New password"
          description="At least 12 characters, mixed case, and a number or symbol."
          status={caps ? 'warning' : 'default'}
          message={caps ? 'Caps Lock is on.' : undefined}
        >
          <PasswordInput
            size={size}
            autoComplete="new-password"
            value={value}
            status={caps ? 'warning' : 'default'}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
        {meter && value.length > 0 && (
          <div className="mt-2.5">
            <Meter value={(s / 4) * 100} tone={STRENGTH[s].tone} label={`Strength: ${STRENGTH[s].label}`} />
            <ul className="mt-2 flex flex-col gap-1">
              {RULES.map((r) => {
                const ok = r.test(value)
                return (
                  <li
                    key={r.id}
                    className={cn(
                      'flex items-center gap-1.5 text-caption',
                      ok ? 'text-[var(--ds-success-text)]' : 'text-[var(--ds-fg-muted)]',
                    )}
                  >
                    {ok ? <Check size={12} /> : <X size={12} />}
                    {r.label}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'password-input',
    title: 'Password Input',
    tagline:
      'Reveal toggle, Caps Lock warning, a strength meter that shows the rules — and why blocking paste makes accounts less secure, not more.',
    keywords: ['secret', 'passphrase', 'reveal', 'strength', 'autocomplete', 'caps lock', 'credentials'],
  },

  overview: {
    purpose:
      'A password input collects a secret the user cannot see while they type it. Everything the component adds beyond a masked text field exists to compensate for that one constraint: the reveal toggle, so they can check what they typed; the Caps Lock warning, so they know why it will fail; the strength meter, so they learn the rules before the server rejects them.',
    whenToUse: [
      'Signing in, signing up, or changing a password.',
      'Any secret the user types from memory: a passphrase, a recovery phrase, an unlock code.',
      'Re-authentication before a sensitive action.',
    ],
    whenNotToUse: [
      {
        text: 'The value is a short numeric code sent by SMS or an authenticator.',
        instead: 'a Pin Input, which is built for fixed-length codes',
        to: '#/pin-input',
      },
      {
        text: 'The value is a secret you generated and are showing to the user.',
        instead: 'a Code Snippet with a reveal control and a copy button',
        to: '#/code-snippet',
      },
      {
        text: 'You are masking a value simply because it looks sensitive.',
        instead: 'a Text Field — masking a value the user needs to check is friction with no benefit',
        to: '#/text-field',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Blocking paste makes accounts less secure.</strong> It is the clearest example in
          this whole system of security theatre producing the opposite of its intent: users who
          cannot paste stop using password managers and start using passwords they can type from
          memory. Allow paste, everywhere, including on the confirm field.
        </p>
        <p>
          The <code>autocomplete</code> token is functional, not a nicety.{' '}
          <code>current-password</code> tells a manager to fill the saved credential;{' '}
          <code>new-password</code> tells it to offer to generate one. Get it wrong and the manager
          either fills nothing or overwrites the saved entry with a half-typed value.
        </p>
        <p>
          A strength meter that only shows a coloured bar teaches nothing. It has to show{' '}
          <strong>the rules and which ones are met</strong>, live, as the user types. "Weak" with
          no explanation is a rejection; three unticked checkboxes are instructions.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'signin-vs-signup',
        title: 'Sign in vs. sign up',
        description:
          'Two different fields wearing the same mask. Sign-in wants current-password and no meter; sign-up wants new-password, the rules, and no confirm field if a reveal toggle exists.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Sign in" tone="good">
                <Field label="Password">
                  <PasswordInput autoComplete="current-password" defaultValue="hunter2hunter2" />
                </Field>
              </Cell>
              <Cell label="Sign up" tone="good">
                <Field
                  label="New password"
                  description="At least 12 characters."
                >
                  <PasswordInput autoComplete="new-password" defaultValue="correct horse battery" />
                </Field>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'caps',
        title: 'Caps Lock warning',
        description:
          'The single highest-value affordance on a sign-in form. The user cannot see what they typed, so an all-caps password is otherwise an unexplainable failure.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-xs">
              <Field label="Password" status="warning" message="Caps Lock is on.">
                <PasswordInput status="warning" defaultValue="HUNTER2HUNTER2" autoComplete="current-password" />
              </Field>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'meter',
        title: 'The meter must show the rules',
        description:
          'A bar labelled "Weak" is a rejection. The same bar with three live checks is a set of instructions the user can act on without guessing.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Rules shown" tone="good">
                <Stack gap="sm">
                  <Meter value={50} tone="warning" label="Strength: Fair" />
                  <ul className="flex flex-col gap-1">
                    <li className="flex items-center gap-1.5 text-caption text-[var(--ds-success-text)]">
                      <Check size={12} /> At least 12 characters
                    </li>
                    <li className="flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
                      <X size={12} /> Upper and lower case
                    </li>
                    <li className="flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
                      <X size={12} /> A number or symbol
                    </li>
                  </ul>
                </Stack>
              </Cell>
              <Cell label="Bar only" tone="bad">
                <Meter value={25} tone="danger" label="Strength: Weak" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'no-confirm',
        title: 'A reveal toggle replaces the confirm field',
        description:
          'Confirm exists because the user cannot see what they typed. Give them a reveal control and the second field is a second chance to make the same typo twice.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Reveal" tone="good">
                <Field label="New password" description="Use the eye to check it.">
                  <PasswordInput autoComplete="new-password" defaultValue="correct horse battery" />
                </Field>
              </Cell>
              <Cell label="Confirm field" tone="bad">
                <Stack gap="sm">
                  <Field label="New password">
                    <PasswordInput autoComplete="new-password" defaultValue="correct horse" />
                  </Field>
                  <Field label="Confirm password">
                    <PasswordInput autoComplete="new-password" defaultValue="correct horse" />
                  </Field>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <div className="w-44"><PasswordInput placeholder="Password" aria-label="e" /></div> },
      { label: 'Masked', render: <div className="w-44"><PasswordInput defaultValue="hunter2hunter2" aria-label="m" /></div> },
      { label: 'Focus', render: <div className="w-44"><PasswordInput defaultValue="hunter2" className="border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]" aria-label="f" /></div> },
      { label: 'Caps Lock', render: <div className="w-44"><PasswordInput status="warning" defaultValue="HUNTER2" aria-label="c" /></div> },
      { label: 'Error', render: <div className="w-44"><PasswordInput status="error" defaultValue="short" aria-label="er" /></div> },
      { label: 'Disabled', render: <div className="w-44"><PasswordInput disabled defaultValue="locked" aria-label="d" /></div> },
      { label: 'Weak', render: <div className="w-44"><Meter value={25} tone="danger" label="Weak" /></div> },
      { label: 'Fair', render: <div className="w-44"><Meter value={50} tone="warning" label="Fair" /></div> },
      { label: 'Good', render: <div className="w-44"><Meter value={75} tone="accent" label="Good" /></div> },
      { label: 'Strong', render: <div className="w-44"><Meter value={100} tone="success" label="Strong" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Field label="New password" description="At least 12 characters.">
          <PasswordInput autoComplete="new-password" defaultValue="correct horse battery" />
        </Field>
        <div className="mt-2.5">
          <Meter value={75} tone="accent" label="Strength: Good" />
        </div>
      </div>
    ),
    caption:
      'A masked field with a reveal toggle inside it, and a strength meter that appears only once the user has typed something.',
    parts: [
      {
        n: 1,
        label: 'Mask character',
        value: 'Browser default (•)',
        kind: 'type',
        note: 'Never a custom character. The native mask is what password managers and screen readers detect, and replacing it breaks both.',
      },
      {
        n: 2,
        label: 'Reveal toggle',
        value: '28px, inside the field',
        kind: 'size',
        note: 'Inside the border so it reads as part of the control. Its accessible name changes with the state — "Show password" / "Hide password" — and it is a toggle button, not a checkbox.',
      },
      {
        n: 3,
        label: 'Reveal timeout',
        value: 'Optional, 8–15s',
        kind: 'motion',
        note: 'Re-masking after a delay protects a screen left unattended. Only defensible on shared devices; on a personal one it is an interruption.',
      },
      {
        n: 4,
        label: 'Caps Lock warning',
        value: 'Warning tone, on focus',
        kind: 'color',
        note: 'Detected from the keyboard event’s modifier state, shown only while the field has focus. Shouting about Caps Lock on an unfocused field is noise.',
      },
      {
        n: 5,
        label: 'Strength meter',
        value: '4px bar + rule list',
        kind: 'size',
        note: 'Appears after the first character, never before. An empty field showing "Weak" is an accusation.',
      },
      {
        n: 6,
        label: 'Rule list',
        value: '12px, live per rule',
        kind: 'type',
        note: 'Each rule ticks as it is met. This is the part that teaches; the bar alone is a verdict with no appeal.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-warning-border', usedFor: 'Caps Lock border' },
    { category: 'color', token: '--ds-warning-text', usedFor: 'Caps Lock message' },
    { category: 'color', token: '--ds-danger', usedFor: 'Weak strength' },
    { category: 'color', token: '--ds-success', usedFor: 'Strong strength and met rules' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Reveal glyph and unmet rules' },
    { category: 'spacing', token: 'padding-right', value: '40px', usedFor: 'Room for the reveal toggle' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Rule list' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Meter fill transition' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 36px 0 10px', type: '13px', use: 'Re-authentication inside a dialog.' },
    { name: 'Medium', height: '36px', padding: '0 40px 0 12px', type: '15px', use: 'The default.' },
    { name: 'Large', height: '44px', padding: '0 44px 0 14px', type: '16px', use: 'Sign-in and sign-up pages, where the field is the page.' },
    { name: 'Reveal toggle', height: '28px', minWidth: '28px', touch: '44px on coarse pointers', use: 'Inside the field, right-aligned, 6px from the edge.' },
    { name: 'Strength bar', height: '4px', radius: 'full', use: 'Full field width, directly beneath it, with the label beside the value.' },
  ],

  do: [
    {
      title: 'Allow paste',
      why: 'Users who cannot paste abandon password managers and fall back to passwords they can remember. Blocking paste measurably lowers the strength of the passwords you receive.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          <span className="text-[var(--ds-danger-text)]">✗ onPaste=&#123;(e) =&gt; e.preventDefault()&#125;</span>
          <br />
          ✓ nothing — paste is the default
        </code>
      ),
    },
    {
      title: 'Use the right autocomplete token',
      why: 'current-password fills the saved credential; new-password offers to generate one. The wrong token means the manager either does nothing or overwrites a good entry with a half-typed value.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px] text-[var(--ds-success-text)]">
          <span>sign in → autocomplete="current-password"</span>
          <span>sign up → autocomplete="new-password"</span>
        </Stack>
      ),
    },
    {
      title: 'Warn about Caps Lock while focused',
      why: 'The user cannot see what they typed. Without the warning, an all-caps password is a failure with no visible cause — and they will retype it identically.',
      render: (
        <div className="w-full max-w-xs">
          <Field label="Password" status="warning" message="Caps Lock is on.">
            <PasswordInput status="warning" defaultValue="HUNTER2" />
          </Field>
        </div>
      ),
    },
    {
      title: 'Show the rules, not just a verdict',
      why: '"Weak" tells the user they failed. Three live checks tell them what to do next, which is the only thing they actually need.',
      render: (
        <Stack gap="xs">
          <li className="flex list-none items-center gap-1.5 text-caption text-[var(--ds-success-text)]">
            <Check size={12} /> At least 12 characters
          </li>
          <li className="flex list-none items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
            <X size={12} /> A number or symbol
          </li>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not block paste or autofill',
      why: 'It is the clearest case of security theatre in the whole system. The users it inconveniences are exactly the ones using a password manager, and they are the ones with strong passwords.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          onPaste → preventDefault → users type “Summer2024!” instead
        </span>
      ),
    },
    {
      title: 'Do not enforce composition rules on sign-in',
      why: 'The password already exists. Validating its shape at sign-in tells an attacker your rules and tells a legitimate user nothing they can act on.',
      render: (
        <div className="w-full max-w-xs">
          <Field label="Password" status="error" message="Must contain a symbol.">
            <PasswordInput status="error" defaultValue="hunter2hunter2" autoComplete="current-password" />
          </Field>
        </div>
      ),
    },
    {
      title: 'Do not ask for a confirm field when a reveal exists',
      why: 'Confirm compensates for not being able to see. The reveal toggle removes that problem, and the second field mostly collects the same typo twice.',
      render: (
        <Stack gap="sm" className="w-full max-w-xs">
          <Field label="New password">
            <PasswordInput defaultValue="correct horse" />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput defaultValue="correct horse" />
          </Field>
        </Stack>
      ),
    },
    {
      title: 'Do not cap the length',
      why: 'A maximum length signals the password is being stored in a way it should not be, and it breaks the long passphrases a manager generates.',
      render: (
        <div className="w-full max-w-xs">
          <Field label="Password" description="Maximum 16 characters." status="error" message="Too long.">
            <PasswordInput status="error" defaultValue="correct horse battery staple" />
          </Field>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.8', name: 'Accessible Authentication', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The mask dots owe 4.5:1. They are how a user counts what they typed, and browsers often render them lighter than the input colour.',
      'The strength meter must not rely on colour alone — the label ("Weak", "Strong") carries the same information for the 8% who cannot distinguish red from green.',
      'Met and unmet rules differ by icon as well as colour, for the same reason.',
      'The reveal glyph at 16px owes 4.5:1 against the field fill.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the field, then the reveal toggle. The toggle is a real button and must be reachable.' },
      { keys: 'Space / Enter', does: 'Toggles reveal. Focus stays on the toggle; it must not jump back to the field.' },
      { keys: '⌘ / Ctrl + V', does: 'Pastes. Never intercepted.' },
      { keys: 'Enter', does: 'Submits the form from the field, as in any single-line input.' },
    ],
    aria: [
      { attr: 'autocomplete', on: 'The field', note: 'current-password or new-password. This is a functional attribute, and 1.3.5 requires it.' },
      { attr: 'aria-pressed', on: 'The reveal toggle', note: 'It is a toggle button. Its label should also change — "Show password" / "Hide password".' },
      { attr: 'aria-describedby', on: 'The field', note: 'Points at the requirements list, so the rules are read before the user types rather than after they fail.' },
      { attr: 'role="status"', on: 'The Caps Lock warning', note: 'Polite. It must be announced, not merely coloured, or the user who most needs it never learns.' },
      { attr: 'aria-live="polite"', on: 'The strength label', note: 'Debounced to roughly every 500ms. Announcing on every keystroke is unusable.' },
      { attr: 'aria-invalid', on: 'The field', note: 'On a failed sign-in, set on the form rather than the field — you do not know which of the two was wrong, and guessing helps an attacker.' },
    ],
    focus:
      'Toggling reveal must not move focus or reset the caret. The naive implementation swaps the input type and the caret jumps to the end — preserve selectionStart and selectionEnd across the swap.',
    screenReader: [
      'Announce the requirements before the user types, via aria-describedby. Discovering them through failure is the worst possible order.',
      'The reveal toggle must announce its state: "Show password, toggle button, not pressed".',
      'Caps Lock must be announced, not just coloured. It is the one warning where the affected user is least able to see what went wrong.',
      'WCAG 2.2’s Accessible Authentication criterion means no cognitive test may be required to sign in — paste, autofill and a reveal toggle are how you satisfy it.',
    ],
    touch:
      'The reveal toggle needs a 44px target, which usually means growing the field to 44px rather than shrinking the glyph. Set autocomplete correctly so the platform keychain offers to fill — on mobile that is how most people sign in, and a wrong token silently removes the option.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Field, PasswordInput } from '@/ui/Input'

// Sign in: the password already exists, so no meter and no rules.
<Field label="Password">
  <PasswordInput autoComplete="current-password" name="password" />
</Field>

// Sign up: new-password lets the manager offer to generate one.
<Field
  label="New password"
  description="At least 12 characters, mixed case, and a number or symbol."
>
  <PasswordInput autoComplete="new-password" name="new-password" />
</Field>

// Caps Lock: read the modifier state from the event, only while focused.
const [caps, setCaps] = React.useState(false)
<input
  onKeyUp={(e) => setCaps(e.getModifierState('CapsLock'))}
  onKeyDown={(e) => setCaps(e.getModifierState('CapsLock'))}
  onBlur={() => setCaps(false)}
/>

// Preserve the caret across the type swap. The naive version sends the
// cursor to the end every time the user peeks.
function toggleReveal(el: HTMLInputElement) {
  const { selectionStart, selectionEnd } = el
  setRevealed((r) => !r)
  requestAnimationFrame(() => el.setSelectionRange(selectionStart, selectionEnd))
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label for="pw">New password</label>

  <!-- Read BEFORE typing, not discovered through failure. -->
  <ul id="pw-rules">
    <li>At least 12 characters</li>
    <li>Upper and lower case</li>
    <li>A number or symbol</li>
  </ul>

  <div class="ds-password">
    <input
      id="pw"
      type="password"
      name="new-password"
      autocomplete="new-password"
      aria-describedby="pw-rules pw-strength"
    />
    <!-- No maxlength. No onpaste handler. Both are anti-features. -->
    <button type="button" aria-label="Show password" aria-pressed="false">
      <svg aria-hidden="true">…</svg>
    </button>
  </div>

  <p id="pw-strength" role="status" aria-live="polite">Strength: Good</p>
  <p id="pw-caps" role="status" aria-live="polite" hidden>Caps Lock is on.</p>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-password { position: relative; }

.ds-password input {
  inline-size: 100%;
  block-size: 36px;
  padding-inline: 12px 40px;         /* room for the reveal toggle */
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
  /* Never set -webkit-text-security or a custom mask character: it is what
     password managers and screen readers detect. */
}

.ds-password button {
  position: absolute;
  inset-inline-end: 6px;
  inset-block-start: 50%;
  translate: 0 -50%;
  inline-size: 28px;
  block-size: 28px;
  color: var(--ds-fg-muted);         /* 4.5:1 — it is a control */
}

.ds-password input[aria-invalid='true'] { border-color: var(--ds-danger-border); }
.ds-password[data-caps='true'] input   { border-color: var(--ds-warning-border); }

/* Colour is never the only signal: the label says "Weak" or "Strong" too. */
.ds-strength__bar { block-size: 4px; border-radius: 999px; }
.ds-strength__bar[data-level='1'] { background: var(--ds-danger); }
.ds-strength__bar[data-level='4'] { background: var(--ds-success); }

@media (pointer: coarse) {
  .ds-password input  { block-size: 44px; padding-inline-end: 48px; }
  .ds-password button { inline-size: 44px; block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'PasswordInput',
        props: [
          { name: 'autoComplete', type: "'current-password' | 'new-password'", required: true, description: 'Functional, not optional. The wrong value breaks password managers in a way users blame on themselves.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'The reveal toggle keeps a touch-sized target at every size.' },
          { name: 'status', type: "'default' | 'error' | 'success' | 'warning'", default: "'default'", description: 'Warning is the Caps Lock state; error is a failed submission.' },
          { name: 'revealTimeout', type: 'number', description: 'Milliseconds before re-masking. Only worth it on shared devices; elsewhere it is an interruption.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Removes the field from the tab order.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Do not enforce a maximum length. A cap signals the password is not being hashed, and it breaks the long passphrases managers generate.',
      'Check against a breached-password list rather than adding composition rules. "Summer2024!" satisfies every rule most products ship and is in every wordlist.',
      'On a failed sign-in, never say which field was wrong. "Email or password is incorrect" is the correct message, and it is also the kind one.',
      'Offer the reveal toggle on sign-in too, not only sign-up. Typos happen more often on the field where there is no confirm.',
      'Keep the requirements visible after submission fails. Hiding them at the moment of failure is the most common version of losing the instructions.',
    ],
    performance: [
      'Debounce strength calculation by about 150ms. A real strength estimator like zxcvbn is not free on every keystroke.',
      'Load the strength library lazily, only on the sign-up route. It is a few hundred kilobytes that the sign-in page has no use for.',
      'Never send the password anywhere for strength checking. Breach checks use k-anonymity — send the first five characters of the SHA-1 hash and nothing else.',
    ],
    mistakes: [
      'Blocking paste, which pushes users off password managers and onto weaker passwords.',
      'The wrong autocomplete token, so the manager fills nothing or overwrites a good entry.',
      'A maximum length, which suggests the password is being stored rather than hashed.',
      'A strength bar with no rules, which rejects without instructing.',
      'The caret jumping to the end when the user toggles reveal.',
      'Enforcing composition rules at sign-in, where the password already exists.',
      'Custom mask characters, which break password-manager detection and screen-reader announcements.',
      'A Caps Lock warning that is coloured but never announced.',
    ],
    realWorld: [
      'NIST guidance has recommended against composition rules and forced rotation for years. Length and a breach check outperform every symbol requirement ever shipped.',
      'The confirm field is a hangover from before reveal toggles existed. Products that removed it and kept the toggle report fewer failed sign-ups, not more.',
      'Password managers now fill the overwhelming majority of credentials. Every design decision here should be checked against "does this still work when a manager fills it?".',
      'Passkeys are replacing this component. Where you support them, offer the passkey first and keep the password field as the fallback — not the other way round.',
    ],
  },
})
