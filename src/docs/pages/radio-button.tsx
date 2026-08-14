import * as React from 'react'
import { Building2, Rocket, Zap } from 'lucide-react'
import { Radio, RadioCard, RadioGroup, Segmented } from '@/ui/Toggle'
import { Badge } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const PLANS = [
  {
    value: 'hobby',
    label: 'Hobby',
    description: 'One project, community support, 100k requests a month.',
    icon: <Zap size={15} />,
  },
  {
    value: 'team',
    label: 'Team',
    description: 'Unlimited projects, 8-hour support SLA, 10M requests a month.',
    icon: <Rocket size={15} />,
    badge: <Badge tone="accent" size="sm">Recommended</Badge>,
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Dedicated infrastructure, SSO, contractual SLA.',
    icon: <Building2 size={15} />,
  },
]

function Playground() {
  const [layout, setLayout] = React.useState<'vertical' | 'horizontal' | 'cards' | 'segmented'>('vertical')
  const [value, setValue] = React.useState('team')
  const [description, setDescription] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Layout">
            <KnobSelect
              value={layout}
              onChange={setLayout}
              options={['vertical', 'horizontal', 'cards', 'segmented'] as const}
            />
          </Knob>
          <KnobToggle checked={description} onChange={setDescription} label="Descriptions" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disable last" />
        </div>
      }
    >
      <div className="w-full max-w-lg">
        {layout === 'segmented' ? (
          <Segmented
            value={value}
            onChange={setValue}
            aria-label="Plan"
            options={PLANS.map((p) => ({ value: p.value, label: p.label }))}
          />
        ) : layout === 'cards' ? (
          <Stack gap="sm">
            {PLANS.map((p, i) => (
              <RadioCard
                key={p.value}
                name="pg-plan"
                value={p.value}
                checked={value === p.value}
                onChange={() => setValue(p.value)}
                label={p.label}
                description={description ? p.description : undefined}
                icon={p.icon}
                badge={p.badge}
                disabled={disabled && i === PLANS.length - 1}
              />
            ))}
          </Stack>
        ) : (
          <RadioGroup legend="Plan" orientation={layout}>
            {PLANS.map((p, i) => (
              <Radio
                key={p.value}
                name="pg-plan-r"
                value={p.value}
                checked={value === p.value}
                onChange={() => setValue(p.value)}
                label={p.label}
                description={description ? p.description : undefined}
                disabled={disabled && i === PLANS.length - 1}
              />
            ))}
          </RadioGroup>
        )}
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'radio-button',
    title: 'Radio Button',
    tagline:
      'Exactly one of a known set. Never fewer than two, rarely more than six — and the card variant for choices the user needs help making.',
    keywords: ['radio group', 'option', 'single choice', 'segmented', 'plan picker', 'mutually exclusive'],
  },

  overview: {
    purpose:
      'A radio group makes a mutually exclusive choice visible. Every option is on screen, the trade-offs can be compared side by side, and selecting one deselects the others without the user having to work out that rule for themselves. It is the highest-transparency choice control there is, and it costs the most vertical space.',
    whenToUse: [
      'Two to six mutually exclusive options that the user should compare.',
      'The choice matters enough that seeing all the options is worth the space.',
      'The options need descriptions, prices, or badges to be understood.',
      'A default already exists and you want the user to see what they are changing from.',
    ],
    whenNotToUse: [
      {
        text: 'More than about six options, or a list that grows.',
        instead: 'a Select',
        to: '#/select',
      },
      {
        text: 'Multiple options may be selected.',
        instead: 'Checkboxes',
        to: '#/checkbox',
      },
      {
        text: 'The choice is binary and saves instantly.',
        instead: 'a Switch',
        to: '#/switch',
      },
      {
        text: 'Two or three short options that switch a view rather than set a value.',
        instead: 'a segmented control or Tabs',
        to: '#/tabs',
      },
    ],
    reasoning: (
      <>
        <p>
          A radio group is <strong>never valid with one option</strong> — an option that cannot be
          deselected is not a choice, it is a statement. And unlike a checkbox, a radio cannot be
          unset once chosen, which means the initial state carries real weight: either pre-select a
          sensible default, or accept that the user must choose before they can proceed.
        </p>
        <p>
          The round shape is doing work. Round means "one of these"; square means "any of these".
          Users learned this from physical radio buttons in car dashboards decades ago and it
          remains one of the most reliably understood conventions in interface design. Never round a
          checkbox or square a radio.
        </p>
        <p>
          Arrow keys move between radios and <strong>Tab skips the whole group</strong>. That is
          native behaviour: a group is one stop in the tab order, not five. It is also why radios
          need a shared <code>name</code> — without it the browser treats them as unrelated and both
          the exclusivity and the keyboard behaviour quietly stop working.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'cards',
        title: 'Radio cards',
        description:
          'For high-stakes choices where each option needs explaining. The whole card is the target, and the selected state uses a border plus a tint rather than just the dot.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-lg">
              <CardDemo />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'segmented',
        title: 'Segmented control',
        description:
          'The same semantics in a fraction of the space. Two to five very short labels, no descriptions, and never for anything destructive — there is no confirmation step.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <SegmentedDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'layouts',
        title: 'Vertical vs horizontal',
        description:
          'Vertical is the default: one left edge, one fixation per option. Horizontal only works when the labels are short enough that the box–label pairing stays unambiguous.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-6 sm:grid-cols-2">
              <RadioGroup legend="Vertical — the default">
                <Radio name="l-v" defaultChecked label="Automatic" />
                <Radio name="l-v" label="Manual approval required" />
                <Radio name="l-v" label="Scheduled window only" />
              </RadioGroup>
              <RadioGroup legend="Horizontal — short labels only" orientation="horizontal">
                <Radio name="l-h" defaultChecked label="Yes" />
                <Radio name="l-h" label="No" />
                <Radio name="l-h" label="Maybe" />
              </RadioGroup>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Unselected', render: <Radio name="st1" aria-label="Unselected" /> },
      { label: 'Selected', render: <Radio name="st2" defaultChecked aria-label="Selected" /> },
      { label: 'Hover', render: <Radio name="st3" aria-label="Hover" className="[&_input]:border-[var(--ds-accent)] [&_input]:bg-[var(--ds-accent-subtle)]" /> },
      { label: 'Focus', render: <Radio name="st4" aria-label="Focus" className="[&_input]:outline-2 [&_input]:outline-offset-2 [&_input]:outline-[var(--ds-focus-ring)]" /> },
      { label: 'Disabled', render: <Radio name="st5" disabled aria-label="Disabled" /> },
      { label: 'Disabled + on', render: <Radio name="st6" disabled defaultChecked aria-label="Disabled selected" /> },
      { label: 'With label', render: <Radio name="st7" defaultChecked label="Automatic" /> },
      { label: 'Two-line', render: <div className="max-w-[12rem]"><Radio name="st8" defaultChecked label="Automatic" description="Deploy on every merge." /></div> },
      { label: 'Card', render: <div className="w-44"><RadioCard name="st9" checked label="Team" description="Recommended" /></div> },
      { label: 'Segmented', render: <MiniSegmented /> },
      { label: 'Small', render: <Radio name="st10" size="sm" defaultChecked aria-label="Small" /> },
      { label: 'Error', render: <span className="text-caption text-[var(--ds-danger-text)]">Choose one to continue</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <RadioGroup legend="Deployment" description="Applies to every branch in this project.">
          <Radio name="anat" defaultChecked label="Automatic" description="Deploy on every merge to main." />
          <Radio name="anat" label="Manual" description="Someone presses Deploy." />
        </RadioGroup>
      </div>
    ),
    caption:
      'A legend, an optional group description, then the options. The legend is announced before every option, which is why a styled div is not a substitute for a fieldset.',
    parts: [
      {
        n: 1,
        label: 'Legend',
        value: '13px / 540, 10px above',
        kind: 'type',
        note: 'A real <legend>. It gives the group a name and is read before each option, so "Automatic" becomes "Deployment, Automatic".',
      },
      {
        n: 2,
        label: 'Dot size',
        value: '18px outer, 8px inner',
        kind: 'size',
        note: 'The selected state is a 5px border rather than a nested circle, so there is no extra element to keep aligned and no sub-pixel seam between ring and fill.',
      },
      {
        n: 3,
        label: 'Shape',
        value: 'Fully round',
        kind: 'shape',
        note: 'Round means "one of these". This is the strongest shape convention in forms and it should never be broken for visual consistency.',
      },
      {
        n: 4,
        label: 'Option spacing',
        value: '10px between rows',
        kind: 'space',
        note: 'Tight enough that the options read as one group. The gap to the next group is 32px — more than 3× — so the boundary is unambiguous.',
      },
      {
        n: 5,
        label: 'Tab behaviour',
        value: 'One stop for the group',
        kind: 'motion',
        note: 'Only the selected radio is tabbable; arrow keys move within. Native gives you this automatically as long as the options share a name.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-field', usedFor: 'Unselected fill — a control goes above its container, never below it' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Unselected border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Selected ring' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Hover fill, selected card background' },
    { category: 'color', token: '--ds-accent-border', usedFor: 'Selected card border' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: 'gap', value: '10px', usedFor: 'Dot to label' },
    { category: 'spacing', token: 'row gap', value: '10px', usedFor: 'Between options' },
    { category: 'spacing', token: 'card padding', value: '14px', usedFor: 'RadioCard' },
    { category: 'radius', token: 'full', usedFor: 'Dot' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'RadioCard corners' },
    { category: 'motion', token: 'duration', value: '120–140ms', usedFor: 'Border-width and colour transition' },
  ],

  sizes: [
    { name: 'Small', height: '16px', gap: '10px', type: '13px', touch: '44px (row)', use: 'Dense filter panels and table toolbars.' },
    { name: 'Medium', height: '18px', gap: '10px', type: '13px', touch: '44px (row)', use: 'The default in every form.' },
    { name: 'With description', height: '18px', gap: '10px', type: '13px / 12px', maxWidth: '60ch', use: 'When an option needs a sentence of explanation.' },
    { name: 'Card', height: 'auto', padding: '14px', radius: '12px', minWidth: '200px', use: 'Plans, billing intervals, anything with a real trade-off.' },
    { name: 'Segmented', height: '32px', padding: '2px track', radius: '8px / 6px', use: '2–5 short labels where space is tight and the change is instant.' },
  ],

  do: [
    {
      title: 'Always pre-select a sensible default',
      why: 'A radio cannot be deselected, so an empty group forces a decision before the user knows the consequences. Pick the safest or most common option and let them change it.',
      render: (
        <RadioGroup legend="Visibility">
          <Radio name="d-def" defaultChecked label="Private" description="Only invited members." />
          <Radio name="d-def" label="Public" description="Anyone with the link." />
        </RadioGroup>
      ),
    },
    {
      title: 'Use cards when the options need explaining',
      why: 'A plan picker is not a form field, it is a decision. Cards give room for the price, the limits and a recommendation badge, and they make the whole option a target.',
      render: <CardDemo compact />,
    },
    {
      title: 'Order by magnitude or by convention',
      why: 'Smallest to largest, cheapest to most expensive, safest to riskiest. An arbitrary order forces the user to read all of them before they can compare any two.',
      render: (
        <RadioGroup legend="Retention" orientation="horizontal">
          <Radio name="d-ord" label="7 days" />
          <Radio name="d-ord" defaultChecked label="30 days" />
          <Radio name="d-ord" label="1 year" />
        </RadioGroup>
      ),
    },
    {
      title: 'Give every group a real legend',
      why: 'Without it the options have no context. A screen reader announces "Automatic, radio button, 1 of 2" and the user has no idea what is automatic.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;fieldset&gt;&lt;legend&gt;Deployment&lt;/legend&gt;…
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a radio group with one option',
      why: 'It cannot be deselected, so it is not a choice. If it is an opt-in, it is a checkbox; if it is information, it is text.',
      render: (
        <RadioGroup legend="Plan">
          <Radio name="dn-one" defaultChecked label="Team — $20/month" />
        </RadioGroup>
      ),
    },
    {
      title: 'Do not use radios for more than about six options',
      why: 'Past six the group dominates the form, scanning gets slow, and the vertical space would be better spent on a select with search.',
      render: (
        <RadioGroup legend="Timezone" className="max-h-32 overflow-hidden">
          {['UTC', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'Asia/Tokyo', 'Australia/Sydney'].map((t) => (
            <Radio key={t} name="dn-many" label={t} />
          ))}
        </RadioGroup>
      ),
    },
    {
      title: 'Do not put destructive choices in a segmented control',
      why: 'A segment applies instantly with no confirmation. A mis-click on "Delete everything" is unrecoverable, and segments are small targets close together.',
      render: (
        <Segmented
          value="keep"
          onChange={() => {}}
          aria-label="Danger"
          options={[
            { value: 'keep', label: 'Keep' },
            { value: 'archive', label: 'Archive' },
            { value: 'delete', label: 'Delete all' },
          ]}
        />
      ),
    },
    {
      title: 'Do not omit the shared name attribute',
      why: 'Without a shared name the browser treats each radio as its own group. Exclusivity stops working, arrow keys stop working, and both bugs are invisible in a visual review.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;input type="radio" /&gt; × 3 — three groups of one
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The unselected border must reach 3:1 against the surface. It is the only thing indicating the control exists.',
      'The selected ring must be distinguishable from the unselected border by more than colour — ours changes from a 1px border to a 5px ring, which survives greyscale.',
      'A selected RadioCard uses a border, a tint and the dot together. Any one alone is too subtle at a glance.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the group at the selected option, or the first if none is selected. One stop for the whole group.' },
      { keys: '↑ / ←', does: 'Moves to the previous option and selects it. Wraps to the end.' },
      { keys: '↓ / →', does: 'Moves to the next option and selects it. Wraps to the start.' },
      { keys: 'Space', does: 'Selects the focused option if it is not already selected.' },
      { keys: 'Tab (again)', does: 'Leaves the group entirely. It does not step through the remaining options.' },
    ],
    aria: [
      { attr: 'name', on: 'Every input in the group', note: 'The shared name is what creates the group. Without it, nothing else works.' },
      { attr: '<fieldset> + <legend>', on: 'The group', note: 'Provides the group name. The legend is announced before every option.' },
      { attr: 'role="radiogroup"', on: 'A custom implementation', note: 'Only needed when not using native inputs — for example a segmented control built from buttons.' },
      { attr: 'aria-checked', on: 'Custom radios', note: 'Native inputs handle this. A segmented control built from buttons must set it explicitly.' },
      { attr: 'aria-describedby', on: 'The input', note: 'Points at the per-option description.' },
      { attr: 'tabindex', on: 'A roving implementation', note: '0 on the selected option, −1 on the rest. Native does this for you.' },
    ],
    focus:
      'The ring sits on the dot for standard radios and around the whole card for RadioCards, because on a card the entire surface is the target.',
    screenReader: [
      'Announced as "Automatic, radio button, selected, 1 of 3". The position in the set comes from the shared name.',
      'Selecting a radio with arrow keys changes the value immediately. If that triggers an expensive action, use Space-to-confirm semantics instead — or reconsider radios.',
      'A segmented control built from buttons must announce as a radiogroup, or it reads as three unrelated buttons.',
    ],
    touch:
      'The clickable row is at least 44px on coarse pointers. RadioCards are naturally larger and are the better mobile pattern when the choice matters.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Radio, RadioGroup, RadioCard, Segmented } from '@/ui/Toggle'

// Standard group. The shared name is what makes it a group.
<RadioGroup legend="Deployment" description="Applies to every branch.">
  {options.map((o) => (
    <Radio
      key={o.value}
      name="deployment"           // identical across the group
      value={o.value}
      checked={value === o.value}
      onChange={() => setValue(o.value)}
      label={o.label}
      description={o.description}
    />
  ))}
</RadioGroup>

// Cards, for choices that need explaining
<Stack gap="sm">
  {plans.map((p) => (
    <RadioCard
      key={p.value}
      name="plan"
      value={p.value}
      checked={plan === p.value}
      onChange={() => setPlan(p.value)}
      label={p.label}
      description={p.description}
      icon={p.icon}
      badge={p.recommended && <Badge tone="accent" size="sm">Recommended</Badge>}
    />
  ))}
</Stack>

// Segmented: same semantics, a fraction of the space
<Segmented
  value={range}
  onChange={setRange}
  aria-label="Date range"
  options={[
    { value: 'day',   label: 'Day' },
    { value: 'week',  label: 'Week' },
    { value: 'month', label: 'Month' },
  ]}
/>`,
    },
    html: {
      lang: 'html',
      code: `<fieldset class="ds-radio-group">
  <legend class="ds-radio-group__legend">Deployment</legend>

  <div class="ds-radio">
    <input class="ds-radio__input" type="radio" id="auto"
           name="deployment" value="auto" checked
           aria-describedby="auto-desc" />
    <label class="ds-radio__label" for="auto">Automatic</label>
    <p class="ds-radio__desc" id="auto-desc">Deploy on every merge to main.</p>
  </div>

  <div class="ds-radio">
    <input class="ds-radio__input" type="radio" id="manual"
           name="deployment" value="manual" />
    <label class="ds-radio__label" for="manual">Manual</label>
  </div>
</fieldset>`,
    },
    css: {
      lang: 'css',
      code: `.ds-radio__input {
  appearance: none;
  inline-size: 18px;
  block-size: 18px;
  border: 1px solid var(--ds-border-strong);
  border-radius: 999px;                 /* round means "one of these" */
  background: var(--ds-field);
  transition: border 120ms var(--ease-standard),
              background-color 120ms var(--ease-standard);
}

.ds-radio__input:hover:not(:disabled) {
  border-color: var(--ds-accent);
  background: var(--ds-accent-subtle);
}

/* The dot is a thick border, not a nested element — nothing to align,
   and no sub-pixel seam between the ring and the fill. */
.ds-radio__input:checked {
  border: 5px solid var(--ds-accent);
  background: var(--ds-field);
}

.ds-radio__input:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Card variant: the whole surface is the target */
.ds-radio-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
}
.ds-radio-card:has(:checked) {
  border-color: var(--ds-accent);
  background: var(--ds-accent-subtle);
  box-shadow: 0 0 0 1px var(--ds-accent);   /* 2px edge without reflow */
}`,
    },
    api: [
      {
        name: 'Radio',
        props: [
          { name: 'name', type: 'string', required: true, description: 'Must be identical across the group. This is what creates the group.' },
          { name: 'label', type: 'ReactNode', description: 'Real <label for>. Extends the hit area.' },
          { name: 'description', type: 'ReactNode', description: 'Second line, wired with aria-describedby.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '16px or 18px dot.' },
        ],
      },
      {
        name: 'RadioGroup',
        props: [
          { name: 'legend', type: 'string', required: true, description: 'Rendered as a real <legend>. Announced before every option.' },
          { name: 'description', type: 'string', description: 'Group-level help, below the legend.' },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Horizontal only for two or three short labels.' },
        ],
      },
      {
        name: 'RadioCard',
        props: [
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph, aligned with the label.' },
          { name: 'badge', type: 'ReactNode', description: 'Inline badge — "Recommended", "Most popular".' },
          { name: 'checked', type: 'boolean', required: true, description: 'Drives the border, tint and dot together.' },
        ],
      },
      {
        name: 'Segmented',
        props: [
          { name: 'options', type: '{ value, label, icon? }[]', required: true, description: 'Two to five. Keep the labels short.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Distributes segments evenly across the container.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'If you catch yourself adding a seventh radio, switch to a select. The threshold is about scanning cost, not screen space.',
      'For pricing, put the recommended option in the middle and badge it. Users anchor on the middle option, and the badge makes an implicit recommendation explicit.',
      'An "Other" radio that reveals a text field should reveal it inline, directly beneath, and focus it automatically on selection.',
      'When a radio changes something expensive — a plan, a region, a data source — do not apply it on selection. Selection sets intent; a Save button applies it.',
    ],
    performance: [
      'Radio groups are cheap. The only real cost is re-rendering the whole group on every change — memoise the option rows if the group is large or the descriptions are complex.',
      'RadioCards with images should lazy-load them; a plan picker with four screenshots is otherwise four blocking requests above the fold.',
      'A segmented control animating its active pill should animate transform, not left or width, or it drops frames on every switch.',
    ],
    mistakes: [
      'Forgetting the shared name, which silently breaks exclusivity and arrow-key navigation.',
      'Using a div with a click handler, which loses arrow keys, group semantics and form submission.',
      'Making a radio deselectable "for convenience". It breaks the mental model — if a value can be absent, that is a checkbox or an explicit "None" option.',
      'Putting a radio group inside a checkbox-styled container, so the shape says "many" and the behaviour says "one".',
      'Selecting on arrow key while also firing a network request, so arrowing through five options fires five requests.',
    ],
    realWorld: [
      'For plan and pricing pickers, cards convert measurably better than plain radios. The extra space buys room for the reason to choose.',
      'On mobile, three or more radios with descriptions become a long scroll. Consider a bottom sheet with the same semantics instead.',
      'Track which default users change most often. A default that is overridden 70% of the time is the wrong default.',
      'Segmented controls should hold their choice across sessions when they represent a view preference. Resetting to the first tab on every visit is a small, daily annoyance.',
    ],
  },
})

/* ---- demos --------------------------------------------------------------- */

function CardDemo({ compact }: { compact?: boolean }) {
  const [plan, setPlan] = React.useState('team')
  const list = compact ? PLANS.slice(0, 2) : PLANS
  return (
    <Stack gap="sm" className="w-full">
      {list.map((p) => (
        <RadioCard
          key={p.value}
          name={compact ? 'card-compact' : 'card-demo'}
          value={p.value}
          checked={plan === p.value}
          onChange={() => setPlan(p.value)}
          label={p.label}
          description={p.description}
          icon={p.icon}
          badge={p.badge}
        />
      ))}
    </Stack>
  )
}

function SegmentedDemo() {
  const [v, setV] = React.useState('week')
  return (
    <Stack gap="md" className="items-center">
      <Segmented
        value={v}
        onChange={setV}
        aria-label="Range"
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />
      <Segmented
        value={v}
        onChange={setV}
        size="sm"
        aria-label="Range small"
        options={[
          { value: 'day', label: 'D' },
          { value: 'week', label: 'W' },
          { value: 'month', label: 'M' },
          { value: 'year', label: 'Y' },
        ]}
      />
    </Stack>
  )
}

function MiniSegmented() {
  const [v, setV] = React.useState('a')
  return (
    <Segmented
      value={v}
      onChange={setV}
      size="sm"
      aria-label="Mini"
      options={[
        { value: 'a', label: 'On' },
        { value: 'b', label: 'Off' },
      ]}
    />
  )
}
