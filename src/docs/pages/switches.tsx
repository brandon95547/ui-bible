import * as React from 'react'
import { Switch, Checkbox } from '@/ui/Toggle'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Cell, Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [align, setAlign] = React.useState<'start' | 'end'>('end')
  const [checked, setChecked] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
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
          <Knob label="Control">
            <KnobSelect value={align} onChange={setAlign} options={['start', 'end'] as const} />
          </Knob>
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
          <KnobToggle checked={description} onChange={setDescription} label="Description" />
        </div>
      }
      code={`<Switch
  checked={${checked}}
  onCheckedChange={setEnabled}
  label="Require two-factor authentication"${description ? '\n  description="Everyone in the workspace will be prompted at next sign-in."' : ''}
  align="${align}"
  size="${size}"${disabled ? '\n  disabled' : ''}
/>`}
    >
      <div className="w-full max-w-md">
        <Switch
          size={size}
          align={align}
          checked={checked}
          onCheckedChange={setChecked}
          disabled={disabled}
          label="Require two-factor authentication"
          description={
            description
              ? 'Everyone in the workspace will be prompted at next sign-in.'
              : undefined
          }
        />
      </div>
    </PreviewStage>
  )
}

function SettingsDemo() {
  const [state, setState] = React.useState({
    alerts: true,
    digest: false,
    telemetry: true,
    beta: false,
  })
  const set = (k: keyof typeof state) => (v: boolean) => setState((s) => ({ ...s, [k]: v }))

  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <div className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
        <div className="border-b border-[var(--ds-border-subtle)] px-5 py-3.5">
          <h4 className="text-label text-[var(--ds-fg)]">Notifications</h4>
          <p className="mt-0.5 text-caption text-[var(--ds-fg-muted)]">
            Changes save immediately.
          </p>
        </div>
        <div className="divide-y divide-[var(--ds-border-subtle)]">
          {(
            [
              ['alerts', 'Incident alerts', 'Paged immediately when a service goes down.'],
              ['digest', 'Daily digest', 'One summary email at 09:00 in your timezone.'],
              ['telemetry', 'Usage telemetry', 'Anonymous performance data. No request contents.'],
              ['beta', 'Beta features', 'Early access. Things may break.'],
            ] as const
          ).map(([key, label, desc]) => (
            <div key={key} className="px-5 py-3.5">
              <Switch
                align="end"
                checked={state[key]}
                onCheckedChange={set(key)}
                label={label}
                description={desc}
              />
            </div>
          ))}
        </div>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'switches',
    title: 'Switches',
    group: 'Inputs & Forms',
    tagline:
      'A binary setting that saves the instant it is flipped. If it needs a Save button, it is a checkbox wearing a costume.',
    keywords: ['toggle', 'on off', 'setting', 'preference', 'instant', 'feature flag'],
  },

  overview: {
    purpose:
      'A switch turns something on or off, immediately. The mental model is a physical light switch: you flip it, the light changes, there is nothing to confirm. That immediacy is the entire reason the control exists — and the reason it is wrong for anything that needs to be reviewed before it takes effect.',
    whenToUse: [
      'A setting that applies the moment it changes, with no submit step.',
      'A preference the user may toggle repeatedly: dark mode, notifications, a feature flag.',
      'A row in a settings list where the label describes the enabled state.',
      'Enabling or disabling a whole section of a form that follows it.',
    ],
    whenNotToUse: [
      {
        text: 'The change is staged and applied by a Save button.',
        instead: 'a Checkbox',
        to: '#/checkboxes',
      },
      {
        text: 'The choice is between two named alternatives rather than on and off.',
        instead: 'a segmented control',
        to: '#/radios',
      },
      {
        text: 'Accepting terms or giving consent.',
        instead: 'a Checkbox — consent is a form field, not a preference',
      },
      {
        text: 'Toggling a filter that narrows a list.',
        instead: 'a filter Chip',
        to: '#/chips',
      },
    ],
    reasoning: (
      <>
        <p>
          The distinction from a checkbox is not cosmetic, it is a promise about{' '}
          <strong>when the change takes effect</strong>. A checkbox inside a form says "this will
          happen when you submit". A switch says "this has already happened". Mixing them up
          produces the two worst outcomes in settings design: a user who thinks they saved something
          and did not, and a user who changes something irreversibly while they were still deciding.
        </p>
        <p>
          Because a switch applies instantly, <strong>it needs to handle failure visibly</strong>.
          Flip optimistically so the interface feels immediate, then revert with an explanation if
          the request fails. A switch that silently snaps back is worse than one that never moved.
        </p>
        <p>
          In a settings list the control belongs on the <strong>right</strong>. The label is what
          the user reads first and the state is what they check second, so left-to-right reading
          order puts the switch last. It also gives every row a shared right edge, which makes a
          column of ten settings scannable in one pass.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'settings',
        title: 'A settings list',
        description:
          'Control on the right, one shared right edge, dividers rather than gaps. The header states explicitly that changes save immediately — that sentence removes an entire class of support ticket.',
        render: <SettingsDemo />,
      },
      {
        id: 'vs-checkbox',
        title: 'Switch or checkbox?',
        description: 'The only question that matters: is there a Save button?',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Switch — saves instantly" tone="good">
                <Stack gap="sm" className="w-full">
                  <SwitchDemo label="Dark mode" description="Applies to this browser only." />
                  <SwitchDemo label="Email alerts" description="Sent as incidents happen." />
                </Stack>
              </Cell>
              <Cell label="Checkbox — staged until submit" tone="good">
                <Stack gap="sm" className="w-full">
                  <Checkbox defaultChecked label="Email me about security alerts" />
                  <Checkbox label="Email me about product updates" />
                  <Button size="sm" className="mt-1 self-start">
                    Save changes
                  </Button>
                </Stack>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'async',
        title: 'Optimistic with rollback',
        description:
          'The switch moves immediately, then reverts with an explanation if the request fails. Try the failing one — it flips, waits, and comes back with a reason.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Succeeds">
                <AsyncSwitch />
              </Cell>
              <Cell label="Fails and rolls back">
                <AsyncSwitch fail />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Off', render: <Switch checked={false} onCheckedChange={() => {}} /> },
      { label: 'On', render: <Switch checked onCheckedChange={() => {}} /> },
      { label: 'Hover (off)', render: <div className="[&_button]:bg-[var(--ds-fg-disabled)]"><Switch checked={false} onCheckedChange={() => {}} /></div> },
      { label: 'Focus', render: <div className="[&_button]:outline-2 [&_button]:outline-offset-2 [&_button]:outline-[var(--ds-focus-ring)]"><Switch checked onCheckedChange={() => {}} /></div> },
      { label: 'Disabled off', render: <Switch checked={false} disabled onCheckedChange={() => {}} /> },
      { label: 'Disabled on', render: <Switch checked disabled onCheckedChange={() => {}} /> },
      { label: 'Small', note: '18 × 32', render: <Switch size="sm" checked onCheckedChange={() => {}} /> },
      { label: 'Medium', note: '22 × 38', render: <Switch checked onCheckedChange={() => {}} /> },
      { label: 'With label', render: <div className="max-w-[12rem]"><Switch checked onCheckedChange={() => {}} label="Dark mode" /></div> },
      { label: 'Two-line', render: <div className="max-w-[13rem]"><Switch checked onCheckedChange={() => {}} label="Alerts" description="Immediate." /></div> },
      { label: 'Saving', render: <span className="text-caption text-[var(--ds-fg-muted)]">Saving…</span> },
      { label: 'Failed', render: <Badge tone="danger" size="sm" dot>Could not save</Badge> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Switch
          checked
          onCheckedChange={() => {}}
          align="end"
          label="Require two-factor authentication"
          description="Everyone in the workspace will be prompted at next sign-in."
        />
      </div>
    ),
    caption:
      'Label and description on the left, control on the right. The whole row is a settings row; only the switch is the control.',
    parts: [
      {
        n: 1,
        label: 'Track',
        value: '38 × 22px',
        kind: 'size',
        note: 'Roughly a 1.7:1 ratio. Narrower and the knob has nowhere to travel; wider and it stops reading as a switch and starts reading as a slider.',
      },
      {
        n: 2,
        label: 'Knob',
        value: '18px, 2px inset',
        kind: 'size',
        note: 'Always white, in both themes, with a small shadow. It is a physical object sitting in a track — that metaphor is the whole affordance.',
      },
      {
        n: 3,
        label: 'Travel',
        value: '16px',
        kind: 'motion',
        note: 'Track width minus knob width minus the insets. Animated on transform so it never triggers layout.',
      },
      {
        n: 4,
        label: 'Track colour',
        value: 'border-strong → accent',
        kind: 'color',
        note: 'The state is carried by colour and position together, so it survives greyscale and does not depend on the user noticing a 16px shift.',
      },
      {
        n: 5,
        label: 'Duration',
        value: '180ms emphasized',
        kind: 'motion',
        note: 'Long enough to read as movement, short enough that rapid toggling never queues up. A spring here would overshoot the track edge.',
      },
      {
        n: 6,
        label: 'Row alignment',
        value: 'Control right, 12px gap',
        kind: 'space',
        note: 'A shared right edge across every row is what makes a settings list scannable in a single pass down the column.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-border-strong', usedFor: 'Off track' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Off track, hovered' },
    { category: 'color', token: '--ds-accent', usedFor: 'On track' },
    { category: 'color', token: '#ffffff', usedFor: 'Knob — the same in both themes' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: 'track', value: '38 × 22px', usedFor: 'Medium switch' },
    { category: 'spacing', token: 'gap', value: '12px', usedFor: 'Control to label in a settings row' },
    { category: 'radius', token: 'full', usedFor: 'Track and knob' },
    { category: 'shadow', token: '--shadow-e1', usedFor: 'Knob elevation' },
    { category: 'motion', token: '--ease-emphasized', value: '180ms', usedFor: 'Knob travel and track colour' },
  ],

  sizes: [
    { name: 'Small', height: '18px', minWidth: '32px', gap: '10px', touch: '44px (row)', use: 'Dense settings tables and inline toolbar toggles.' },
    { name: 'Medium', height: '22px', minWidth: '38px', gap: '12px', touch: '44px (row)', use: 'The default. Every settings list.' },
    { name: 'Row', height: '56px', padding: '14px 20px', use: 'A settings row with a label and a one-line description.' },
  ],

  do: [
    {
      title: 'Put the control on the right in settings lists',
      why: 'The label is read first and the state is checked second. A shared right edge across every row lets the eye run down a single column to audit ten settings at once.',
      render: (
        <Stack gap="sm" className="w-full">
          <SwitchDemo label="Incident alerts" align="end" />
          <SwitchDemo label="Daily digest" align="end" />
          <SwitchDemo label="Usage telemetry" align="end" />
        </Stack>
      ),
    },
    {
      title: 'Label the setting, not the state',
      why: '"Dark mode" is a thing that is on or off. "Enable dark mode" describes the action of turning it on, which becomes nonsense once it already is on.',
      render: (
        <Stack gap="sm" className="w-full">
          <SwitchDemo label="Dark mode" />
          <span className="text-caption text-[var(--ds-fg-muted)]">not "Enable dark mode"</span>
        </Stack>
      ),
    },
    {
      title: 'Say that changes save immediately',
      why: 'One sentence at the top of a settings panel removes an entire class of support ticket from people looking for a Save button that does not exist.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3 py-2">
          <p className="text-caption text-[var(--ds-fg-muted)]">Changes save immediately.</p>
        </div>
      ),
    },
    {
      title: 'Flip optimistically, roll back visibly',
      why: 'The switch should move at 0ms because that is what makes it feel instant. If the request fails, revert it and say why — silently snapping back looks like a bug.',
      render: <AsyncSwitch fail />,
    },
  ],

  dont: [
    {
      title: 'Do not put switches in a form with a Save button',
      why: 'Two contradictory promises on one screen. Does the switch apply now, or on save? The user cannot tell, and neither can the next engineer.',
      render: (
        <Stack gap="sm" className="w-full">
          <SwitchDemo label="Public project" />
          <SwitchDemo label="Allow forks" />
          <Button size="sm" className="self-start">
            Save changes
          </Button>
        </Stack>
      ),
    },
    {
      title: 'Do not use a switch for two named alternatives',
      why: 'On/off is not the same as metric/imperial. If both states have names, both names must be visible — that is a segmented control.',
      render: (
        <div className="flex items-center gap-3">
          <span className="text-caption text-[var(--ds-fg-muted)]">Metric</span>
          <Switch checked onCheckedChange={() => {}} />
          <span className="text-caption text-[var(--ds-fg-muted)]">Imperial</span>
        </div>
      ),
    },
    {
      title: 'Do not use a switch for consent',
      why: 'Consent is a deliberate form action that gets submitted and recorded. A switch implies a preference you can flip back and forth, which is exactly the wrong framing.',
      render: <SwitchDemo label="I accept the terms of service" />,
    },
    {
      title: 'Do not add On/Off text beside the switch',
      why: 'The track colour and the knob position already say it. The label then changes meaning as you toggle, which makes the row impossible to scan.',
      render: (
        <div className="flex items-center gap-2">
          <Switch checked onCheckedChange={() => {}} />
          <span className="text-caption text-[var(--ds-fg-muted)]">ON</span>
        </div>
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
      'The off track must reach 3:1 against the surface, or the control is invisible until someone hovers it.',
      'The on track must be distinguishable from the off track in greyscale. Knob position is the redundant signal here, and it is why the knob travels the full width.',
      'The knob stays white in both themes. A knob that matches the surface disappears against the off track.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to the switch. Every switch is individually tabbable.' },
      { keys: 'Space', does: 'Toggles. This is the primary binding.' },
      { keys: 'Enter', does: 'Also toggles, because role="switch" is a button — unlike a native checkbox.' },
    ],
    aria: [
      { attr: 'role="switch"', on: 'The control', note: 'Announces as "on/off" rather than "checked/unchecked", which is the correct mental model for an instant setting.' },
      { attr: 'aria-checked', on: 'The control', note: 'true or false. Never "mixed" — a switch has no indeterminate state.' },
      { attr: 'aria-labelledby', on: 'The control', note: 'Points at the visible label. The label is not a <label> because the control is a button, not an input.' },
      { attr: 'aria-describedby', on: 'The control', note: 'Points at the description line.' },
      { attr: 'aria-busy', on: 'The control', note: 'While an optimistic update is in flight, so assistive tech knows the state is provisional.' },
      { attr: 'aria-live="polite"', on: 'A status region', note: 'Announces a rollback: "Could not save. Two-factor authentication is still off."' },
    ],
    focus:
      'The ring is on the switch itself, not the whole row. A ring around the entire settings row makes it ambiguous which of several stacked switches has focus.',
    screenReader: [
      'Announced as "Require two-factor authentication, switch, on". The word "on" is why role="switch" is worth using over a styled checkbox.',
      'If a toggle triggers an asynchronous save, announce the outcome. Silence after a failure means the user believes the change took effect.',
      'Never rely on the visual position of the knob. aria-checked is the only thing assistive tech reads.',
    ],
    touch:
      'The switch is 38 × 22, so the row provides the 44px target. In a list, make the whole row activate the switch — but only if nothing else in the row is interactive.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Switch } from '@/ui/Toggle'

// Settings row: control on the right
<Switch
  checked={twoFactor}
  onCheckedChange={setTwoFactor}
  align="end"
  label="Require two-factor authentication"
  description="Everyone will be prompted at next sign-in."
/>

// Optimistic update with rollback — the pattern every switch needs
async function toggle(next: boolean) {
  const previous = enabled
  setEnabled(next)              // move immediately
  setSaving(true)
  try {
    await api.updateSetting('two_factor', next)
  } catch (err) {
    setEnabled(previous)        // revert
    toast({
      tone: 'danger',
      title: 'Could not save',
      description: 'Two-factor authentication is still ' + (previous ? 'on' : 'off') + '.',
    })
  } finally {
    setSaving(false)
  }
}

// A switch that gates a section below it
<Switch checked={custom} onCheckedChange={setCustom} label="Custom domain" />
{custom && (
  <div className="mt-3 animate-[slide-up_180ms_var(--ease-emphasized)_both]">
    <TextField label="Domain" placeholder="app.acme.com" />
  </div>
)}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-switch-row">
  <div>
    <span class="ds-switch-row__label" id="tfa-label">
      Require two-factor authentication
    </span>
    <p class="ds-switch-row__desc" id="tfa-desc">
      Everyone will be prompted at next sign-in.
    </p>
  </div>

  <button
    type="button"
    class="ds-switch"
    role="switch"
    aria-checked="true"
    aria-labelledby="tfa-label"
    aria-describedby="tfa-desc"
  >
    <span class="ds-switch__knob" aria-hidden="true"></span>
  </button>
</div>

<div class="sr-only" role="status" aria-live="polite" id="tfa-status"></div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  inline-size: 38px;
  block-size: 22px;
  padding: 2px;
  border: 2px solid transparent;   /* keeps the focus ring off the track */
  border-radius: 999px;
  background: var(--ds-border-strong);
  transition: background-color 180ms var(--ease-emphasized);
}

.ds-switch[aria-checked='true'] { background: var(--ds-accent); }
.ds-switch:hover:not(:disabled)[aria-checked='false'] {
  background: var(--ds-fg-disabled);
}

.ds-switch:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Knob is white in BOTH themes — it is a physical object in a track */
.ds-switch__knob {
  inline-size: 18px;
  block-size: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-e1);
  transition: transform 180ms var(--ease-emphasized);
}
.ds-switch[aria-checked='true'] .ds-switch__knob {
  transform: translateX(16px);     /* transform only — never left/margin */
}

.ds-switch:disabled { opacity: 0.5; cursor: not-allowed; }

@media (prefers-reduced-motion: reduce) {
  .ds-switch, .ds-switch__knob { transition-duration: 0.01ms; }
}`,
    },
    api: [
      {
        name: 'Switch',
        props: [
          { name: 'checked', type: 'boolean', required: true, description: 'Controlled. A switch has no uncontrolled mode by design — the value lives on the server.' },
          { name: 'onCheckedChange', type: '(v: boolean) => void', required: true, description: 'Fired on click, Space and Enter.' },
          { name: 'label', type: 'ReactNode', description: 'Wired with aria-labelledby. Name the setting, not the action.' },
          { name: 'description', type: 'ReactNode', description: 'Second line, wired with aria-describedby.' },
          { name: 'align', type: "'start' | 'end'", default: "'start'", description: "'end' puts the control on the right and stretches the row — the settings-list layout." },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '32×18 or 38×22.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Explain why nearby — a disabled switch with no reason is a dead end.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Group related switches under a heading and separate groups with a divider. Ten ungrouped switches is a wall; three groups of three is a list.',
      'A switch that reveals more settings should animate them in below it, not open a dialog. The user is already in the right place.',
      'For destructive settings — "Allow public access", "Delete after 30 days" — keep the switch but add a confirmation dialog on the way to on. Off should never need confirming.',
      'Do not disable a switch while saving. Freeze the value optimistically and let the user carry on; blocking the control for a 200ms request feels broken.',
    ],
    performance: [
      'Animate transform, never left or margin-left. On a settings page with twenty switches, layout-triggering toggles are visible as jank.',
      'Debounce the network call, not the visual state. The switch must move at 0ms; the request can wait 300ms and coalesce rapid flips.',
      'Persist the whole settings object in one request when several switches change quickly, rather than one request per toggle.',
    ],
    mistakes: [
      'Using a checkbox styled as a switch. role="switch" announces "on/off"; a checkbox announces "checked", which is the wrong model.',
      'Reverting on failure without telling the user, so the switch appears to have a mind of its own.',
      'Putting a switch inside a form with a Save button, making it ambiguous when anything applies.',
      'Adding On/Off text next to the switch, which duplicates the state and makes the row harder to scan.',
      'Making the knob match the theme surface, so at rest it is invisible against the off track.',
    ],
    realWorld: [
      'Settings screens are audited, not browsed. Optimise for scanning a column of states, not for the beauty of any single row.',
      'For feature flags, show who last changed the value and when. A team-wide toggle with no history is a support conversation waiting to happen.',
      'When a switch controls something with a cost — a paid feature, extra storage — show the consequence before it applies, not after.',
      'Track toggles that get flipped back within a minute. That pattern almost always means the label did not describe what the switch actually did.',
    ],
  },
})

/* ---- demos --------------------------------------------------------------- */

function SwitchDemo({
  label,
  description,
  align,
}: {
  label: string
  description?: string
  align?: 'start' | 'end'
}) {
  const [on, setOn] = React.useState(true)
  return (
    <Switch
      checked={on}
      onCheckedChange={setOn}
      label={label}
      description={description}
      align={align}
      className="w-full"
    />
  )
}

function AsyncSwitch({ fail }: { fail?: boolean }) {
  const [on, setOn] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)

  const toggle = (next: boolean) => {
    const previous = on
    setOn(next)
    setStatus('Saving…')
    setTimeout(() => {
      if (fail) {
        setOn(previous)
        setStatus(`Could not save. Still ${previous ? 'on' : 'off'}.`)
      } else {
        setStatus('Saved')
        setTimeout(() => setStatus(null), 1200)
      }
    }, 900)
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <Switch checked={on} onCheckedChange={toggle} align="end" label="Public access" />
      <span
        role="status"
        aria-live="polite"
        className={`text-caption ${
          status?.startsWith('Could not')
            ? 'text-[var(--ds-danger-text)]'
            : 'text-[var(--ds-fg-muted)]'
        }`}
      >
        {status ?? ' '}
      </span>
    </div>
  )
}
