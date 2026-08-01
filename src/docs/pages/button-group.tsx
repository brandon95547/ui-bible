import * as React from 'react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Grid2x2, Italic, List, Underline } from 'lucide-react'
import { Button, ButtonGroup, IconButton } from '@/ui/Button'
import { Segmented } from '@/ui/Toggle'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [variant, setVariant] = React.useState<'outlined' | 'filled' | 'tonal'>('outlined')
  const [icons, setIcons] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={140}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['outlined', 'filled', 'tonal'] as const}
            />
          </Knob>
          <KnobToggle checked={icons} onChange={setIcons} label="Icons" />
        </div>
      }
      code={`<ButtonGroup aria-label="Export format">
  <Button variant="${variant}" size="${size}"${icons ? ' startIcon={<Download />}' : ''}>CSV</Button>
  <Button variant="${variant}" size="${size}">JSON</Button>
  <Button variant="${variant}" size="${size}">Parquet</Button>
</ButtonGroup>`}
    >
      <ButtonGroup aria-label="Export format">
        <Button variant={variant} size={size} startIcon={icons ? <List size={15} /> : undefined}>
          CSV
        </Button>
        <Button variant={variant} size={size} startIcon={icons ? <Grid2x2 size={15} /> : undefined}>
          JSON
        </Button>
        <Button variant={variant} size={size}>
          Parquet
        </Button>
      </ButtonGroup>
    </PreviewStage>
  )
}

function AlignmentDemo() {
  const [align, setAlign] = React.useState<'left' | 'center' | 'right'>('left')
  const [marks, setMarks] = React.useState<string[]>(['bold'])
  const toggle = (m: string) =>
    setMarks((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]))

  return (
    <PreviewStage minHeight={0} allowResize={false}>
      <Stack gap="md" className="w-full max-w-md">
        <Row gap="lg">
          {/* Exclusive: exactly one alignment is true, so it is a radio group
              wearing a button group's clothes — Segmented, not ButtonGroup. */}
          <Segmented
            aria-label="Text alignment"
            value={align}
            onChange={setAlign}
            options={[
              { value: 'left', label: <AlignLeft size={15} /> },
              { value: 'center', label: <AlignCenter size={15} /> },
              { value: 'right', label: <AlignRight size={15} /> },
            ]}
          />
          {/* Independent: any combination of marks is valid, so each button
              carries its own aria-pressed. */}
          <ButtonGroup aria-label="Text style">
            {(
              [
                ['bold', <Bold key="b" size={15} />],
                ['italic', <Italic key="i" size={15} />],
                ['underline', <Underline key="u" size={15} />],
              ] as const
            ).map(([id, icon]) => (
              <Button
                key={id}
                size="sm"
                variant={marks.includes(id) ? 'tonal' : 'outlined'}
                aria-pressed={marks.includes(id)}
                onClick={() => toggle(id)}
                iconOnly
                aria-label={id}
              >
                {icon}
              </Button>
            ))}
          </ButtonGroup>
        </Row>
        <p
          className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-3 text-body-sm text-[var(--ds-fg-secondary)]"
          style={{
            textAlign: align,
            fontWeight: marks.includes('bold') ? 700 : 400,
            fontStyle: marks.includes('italic') ? 'italic' : 'normal',
            textDecoration: marks.includes('underline') ? 'underline' : 'none',
          }}
        >
          Deployment finished in 42 seconds across three regions.
        </p>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'button-group',
    title: 'Button Group',
    tagline:
      'Two to five related buttons rendered as one unit. The shared border is a claim that these actions belong together — if they do not, it is a lie the user has to work around.',
    keywords: ['joined', 'attached', 'segmented', 'role group', 'action group', 'toolbar'],
  },

  overview: {
    purpose:
      'A button group joins a small set of buttons into a single visual object. The seam between them says the actions are alternatives to each other — different formats of the same export, different styles of the same text, different scopes of the same view. It buys density and it buys a grouping signal, and it costs the ability to give any one of those buttons emphasis.',
    whenToUse: [
      'Two to five actions that operate on the same object and differ only in a parameter.',
      'A row of icon-only formatting controls, where the joined border is what makes twelve small squares read as three groups.',
      'A compact toolbar segment where individual buttons would leave the row looking scattered.',
      'Paired actions with a shared consequence — Approve / Reject, Accept / Decline.',
    ],
    whenNotToUse: [
      {
        text: 'Exactly one option can be active and it sets a value.',
        instead: 'a segmented control, which is a radio group',
        to: '#/radio-button',
      },
      {
        text: 'One action is clearly primary and the rest are alternatives.',
        instead: 'a Split Button',
        to: '#/split-button',
      },
      {
        text: 'There are more than five, or they need dividers and overflow.',
        instead: 'a Toolbar',
        to: '#/toolbar',
      },
      {
        text: 'The actions are unrelated and merely adjacent.',
        instead: 'plain Buttons with a gap',
        to: '#/button',
      },
    ],
    reasoning: (
      <>
        <p>
          A button group is a <strong>grouping claim</strong>, and Gestalt does not let you make it
          casually. Joining Save and Delete puts a destructive action one pixel from a routine one
          and removes the gap that would otherwise stop a mis-click. The rule is simple: if the
          buttons do not share an object and a verb family, they do not share a border.
        </p>
        <p>
          The distinction that trips everyone is <strong>group versus segmented control</strong>.
          If the buttons are independent toggles — bold, italic, underline — each gets its own{' '}
          <code>aria-pressed</code> and the container is <code>role="group"</code>. If exactly one
          can be active — left, centre, right — it is a single value, and it belongs in a{' '}
          <code>radiogroup</code>. They look nearly identical and they announce completely
          differently.
        </p>
        <p>
          Every button in a group is the same size and the same variant. The moment one is filled
          and the others are outlined, the group has a primary action, and a group with a primary
          action is a Split Button that has not admitted it yet.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'toggles-vs-value',
        title: 'Independent toggles vs. one value',
        description:
          'Two controls that look almost identical. Alignment is one value, so it is a segmented control with radio semantics. Styling is three independent booleans, so it is a button group of aria-pressed toggles.',
        render: <AlignmentDemo />,
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'Every button in a group shares one size. Mixed sizes break the shared baseline and the joined border stops reading as a single object.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Stack gap="md" className="items-center">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <ButtonGroup key={s} aria-label={`Range ${s}`}>
                  <Button size={s} variant="outlined">
                    Day
                  </Button>
                  <Button size={s} variant="outlined">
                    Week
                  </Button>
                  <Button size={s} variant="outlined">
                    Month
                  </Button>
                </ButtonGroup>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'icon-only',
        title: 'Icon-only groups',
        description:
          'The densest form, and the one that most needs the joined border. Every button still needs an accessible name, and a tooltip is not one.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg">
              <ButtonGroup aria-label="Text style">
                <IconButton variant="outlined" size="sm" label="Bold" icon={<Bold />} />
                <IconButton variant="outlined" size="sm" label="Italic" icon={<Italic />} />
                <IconButton variant="outlined" size="sm" label="Underline" icon={<Underline />} />
              </ButtonGroup>
              <ButtonGroup aria-label="View">
                <IconButton variant="outlined" size="sm" label="List view" icon={<List />} />
                <IconButton variant="outlined" size="sm" label="Grid view" icon={<Grid2x2 />} />
              </ButtonGroup>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'count',
        title: 'Where the ceiling is',
        description:
          'Three is comfortable, five is the ceiling, seven is a toolbar that has not been designed. Past five the group stops reading as a set of alternatives and starts reading as an unlabelled menu.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Grid min="16rem">
              <Cell label="Three" tone="good">
                <ButtonGroup aria-label="Three">
                  <Button variant="outlined" size="sm">
                    Day
                  </Button>
                  <Button variant="outlined" size="sm">
                    Week
                  </Button>
                  <Button variant="outlined" size="sm">
                    Month
                  </Button>
                </ButtonGroup>
              </Cell>
              <Cell label="Seven" tone="bad">
                <ButtonGroup aria-label="Seven">
                  {['1h', '6h', '1d', '3d', '1w', '1m', '1y'].map((l) => (
                    <Button key={l} variant="outlined" size="sm">
                      {l}
                    </Button>
                  ))}
                </ButtonGroup>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Default',
        render: (
          <ButtonGroup aria-label="d">
            <Button variant="outlined" size="sm">
              CSV
            </Button>
            <Button variant="outlined" size="sm">
              JSON
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'One pressed',
        render: (
          <ButtonGroup aria-label="p">
            <Button variant="tonal" size="sm" aria-pressed>
              CSV
            </Button>
            <Button variant="outlined" size="sm">
              JSON
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'Filled',
        render: (
          <ButtonGroup aria-label="f">
            <Button size="sm">Approve</Button>
            <Button size="sm">Defer</Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'One disabled',
        render: (
          <ButtonGroup aria-label="dis">
            <Button variant="outlined" size="sm">
              CSV
            </Button>
            <Button variant="outlined" size="sm" disabled>
              Parquet
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'Loading',
        render: (
          <ButtonGroup aria-label="l">
            <Button variant="outlined" size="sm" loading>
              CSV
            </Button>
            <Button variant="outlined" size="sm">
              JSON
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'Icon only',
        render: (
          <ButtonGroup aria-label="i">
            <IconButton variant="outlined" size="sm" label="Bold" icon={<Bold />} />
            <IconButton variant="outlined" size="sm" label="Italic" icon={<Italic />} />
          </ButtonGroup>
        ),
      },
      {
        label: 'Two members',
        render: (
          <ButtonGroup aria-label="two">
            <Button variant="outlined" size="sm">
              Yes
            </Button>
            <Button variant="outlined" size="sm">
              No
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: 'Large',
        render: (
          <ButtonGroup aria-label="lg">
            <Button variant="outlined" size="lg">
              Day
            </Button>
            <Button variant="outlined" size="lg">
              Week
            </Button>
          </ButtonGroup>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <ButtonGroup aria-label="Anatomy">
        <Button variant="outlined">CSV</Button>
        <Button variant="tonal" aria-pressed>
          JSON
        </Button>
        <Button variant="outlined">Parquet</Button>
      </ButtonGroup>
    ),
    caption:
      'Three members sharing one border. The middle one is pressed, which is carried by fill and text colour rather than by a change in size.',
    parts: [
      {
        n: 1,
        label: 'Shared border',
        value: '1px, collapsed between members',
        kind: 'shape',
        note: 'Adjacent borders overlap rather than stack. Two abutting 1px borders read as a 2px seam, which makes the group look like it has been assembled badly.',
      },
      {
        n: 2,
        label: 'Corner radius',
        value: 'Outer only',
        kind: 'shape',
        note: 'The first member keeps its left corners, the last keeps its right, and everything between is square. Rounded inner corners leave visible notches at the seams.',
      },
      {
        n: 3,
        label: 'Member height',
        value: '32 / 36 / 44px',
        kind: 'size',
        note: 'Identical to a standalone button at the same size, so a group aligns with the inputs and selects beside it.',
      },
      {
        n: 4,
        label: 'Gap',
        value: '0px inside, 12px outside',
        kind: 'space',
        note: 'Zero within the group is what makes it one object. The gap to the next control must be at least 12px or the boundary of the group disappears.',
      },
      {
        n: 5,
        label: 'Pressed state',
        value: 'Tonal fill + accent text',
        kind: 'color',
        note: 'Fill and text change together. A group where the pressed member also changes size or weight reflows the whole row on every press.',
      },
      {
        n: 6,
        label: 'Focus ring',
        value: '2px, offset 2px, above siblings',
        kind: 'color',
        note: 'The focused member is raised in z-order so its ring is not clipped by the neighbour’s border. This is the detail everyone forgets and it looks broken immediately.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-border', usedFor: 'The shared outline' },
    { category: 'color', token: '--ds-surface', usedFor: 'Unpressed fill' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover on a member' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Pressed fill' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Pressed label' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on the active member' },
    { category: 'spacing', token: 'gap', value: '0px', usedFor: 'Between members' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Minimum gap to the next control' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Outer corners only' },
    { category: 'typography', token: '--text-label', value: '13px', usedFor: 'Member labels' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover and press transitions' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px', radius: '6px outer', icon: '15px', type: '12px', use: 'Table toolbars, card headers, anywhere beside a small input.' },
    { name: 'Medium', height: '36px', padding: '0 14px', radius: '8px outer', icon: '16px', type: '13px', use: 'The default. Page-level controls and filter bars.' },
    { name: 'Large', height: '44px', padding: '0 18px', radius: '10px outer', icon: '18px', type: '15px', use: 'Touch-first layouts and marketing surfaces.' },
    { name: 'Icon only', height: 'Matches size', padding: 'Square', touch: '44px on coarse pointers', use: 'Formatting bars. Every member still needs an accessible name.' },
  ],

  do: [
    {
      title: 'Keep every member the same size and variant',
      why: 'The group is one object. A single filled member among outlined ones creates a primary action, and a group with a primary action should have been a split button.',
      render: (
        <ButtonGroup aria-label="Consistent">
          <Button variant="outlined" size="sm">
            Day
          </Button>
          <Button variant="outlined" size="sm">
            Week
          </Button>
          <Button variant="outlined" size="sm">
            Month
          </Button>
        </ButtonGroup>
      ),
    },
    {
      title: 'Label the group, not just the buttons',
      why: '<code>aria-label="Export format"</code> on the container turns three unrelated announcements into one coherent set. Without it a screen-reader user hears "CSV, button" with no idea what CSV applies to.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;div role="group" aria-label="Export format"&gt;
        </code>
      ),
    },
    {
      title: 'Raise the focused member above its neighbours',
      why: 'A focus ring drawn under the adjacent border is clipped on one side and reads as a rendering bug. One line of z-index fixes it permanently.',
      render: (
        <ButtonGroup aria-label="Focus">
          <Button variant="outlined" size="sm">
            CSV
          </Button>
          <Button
            variant="outlined"
            size="sm"
            className="relative z-10 outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]"
          >
            JSON
          </Button>
          <Button variant="outlined" size="sm">
            Parquet
          </Button>
        </ButtonGroup>
      ),
    },
    {
      title: 'Use pressed state, not selected, for independent toggles',
      why: '<code>aria-pressed</code> says "this is on". <code>aria-selected</code> says "this is the chosen one of several", which is a different and usually wrong promise.',
      render: (
        <ButtonGroup aria-label="Marks">
          <Button variant="tonal" size="sm" aria-pressed>
            Bold
          </Button>
          <Button variant="outlined" size="sm" aria-pressed={false}>
            Italic
          </Button>
        </ButtonGroup>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not join unrelated actions',
      why: 'The shared border claims these belong together. Joining Save to Delete removes the gap that stops a mis-click and puts a destructive action inside a routine group.',
      render: (
        <ButtonGroup aria-label="Bad">
          <Button variant="outlined" size="sm">
            Save
          </Button>
          <Button variant="outlined" size="sm">
            Print
          </Button>
          <Button variant="outlined" size="sm">
            Delete
          </Button>
        </ButtonGroup>
      ),
    },
    {
      title: 'Do not give one member emphasis',
      why: 'A filled member inside an outlined group is a primary action, and the joined border then tells the user the alternatives are the same weight as the recommendation. That is a split button.',
      render: (
        <ButtonGroup aria-label="Mixed">
          <Button size="sm">Publish</Button>
          <Button variant="outlined" size="sm">
            Schedule
          </Button>
        </ButtonGroup>
      ),
    },
    {
      title: 'Do not exceed five members',
      why: 'Past five the group stops reading as a set of alternatives. Hick’s law applies: six equally weighted, equally styled options with no headings is a menu without a label.',
      render: (
        <ButtonGroup aria-label="Too many">
          {['1h', '6h', '1d', '3d', '1w', '1m', '1y'].map((l) => (
            <Button key={l} variant="outlined" size="sm">
              {l}
            </Button>
          ))}
        </ButtonGroup>
      ),
    },
    {
      title: 'Do not use a group where only one can be active',
      why: 'Exclusive choice is a value, and values are radios. Announcing "Left, toggle button, pressed" instead of "Left, radio button, selected, 1 of 3" hides the exclusivity from anyone not looking at the screen.',
      render: (
        <ButtonGroup aria-label="Wrong semantics">
          <Button variant="tonal" size="sm" aria-pressed>
            Left
          </Button>
          <Button variant="outlined" size="sm">
            Centre
          </Button>
          <Button variant="outlined" size="sm">
            Right
          </Button>
        </ButtonGroup>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The shared border must reach 3:1 against the surface behind it — it is the only thing showing where one target ends and the next begins.',
      'The pressed member changes fill and text colour together, so the state survives greyscale and Windows High Contrast Mode.',
      'The seam between two members must stay visible on hover. If the hover wash covers the divider the group momentarily reads as one wide button.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the group and stops on each member. A group is not a composite widget, so every button is its own tab stop.' },
      { keys: 'Space / Enter', does: 'Activates or toggles the focused member.' },
      { keys: '← / →', does: 'Only in a segmented control, where the group is a radiogroup. In a plain button group arrows do nothing, and adding them surprises people.' },
      { keys: 'Shift + Tab', does: 'Leaves the group backwards, member by member.' },
    ],
    aria: [
      { attr: 'role="group"', on: 'The container', note: 'Plus aria-label naming what the members have in common. Without it the buttons announce as three unrelated controls.' },
      { attr: 'aria-pressed', on: 'Each independent toggle', note: 'Only on toggles. A group of plain command buttons must not have it — it would claim a state that does not exist.' },
      { attr: 'aria-label', on: 'Icon-only members', note: 'Required. A tooltip is not an accessible name; it is a supplement to one.' },
      { attr: 'aria-disabled', on: 'A member that is temporarily unavailable', note: 'Prefer this to the disabled attribute when the reason is explainable, so the button stays focusable and can announce why.' },
    ],
    focus:
      'The focused member must be raised above its siblings so the ring is drawn complete on all four sides. Focus order follows DOM order, which must follow visual order — never reorder a group with CSS.',
    screenReader: [
      'A labelled group announces as "Export format, group" then "CSV, button, 1 of 3".',
      'A toggle inside the group announces "Bold, toggle button, pressed" — the word "pressed" is the entire payload of aria-pressed.',
      'Never rely on the visual seam to communicate grouping. It is invisible to assistive tech; role and label are what carry it.',
    ],
    touch:
      'Members share edges, so a mis-tap lands on a neighbour rather than on nothing. Keep icon-only members at 44px on coarse pointers, and prefer two or three members on touch — a five-member group on a phone is five 60px targets in a row and the middle three are hard to hit accurately.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Button, ButtonGroup, IconButton } from '@/ui/Button'
import { Segmented } from '@/ui/Toggle'

// Independent toggles: role="group", each member owns aria-pressed
<ButtonGroup aria-label="Text style">
  {MARKS.map((m) => (
    <IconButton
      key={m.id}
      variant={active.includes(m.id) ? 'tonal' : 'outlined'}
      aria-pressed={active.includes(m.id)}
      onClick={() => toggle(m.id)}
      label={m.label}          // required — the icon is not a name
      icon={m.icon}
    />
  ))}
</ButtonGroup>

// Exclusive choice: this is a value, so it is a radiogroup
<Segmented
  aria-label="Text alignment"
  value={align}
  onChange={setAlign}
  options={[
    { value: 'left', label: <AlignLeft size={15} /> },
    { value: 'center', label: <AlignCenter size={15} /> },
    { value: 'right', label: <AlignRight size={15} /> },
  ]}
/>`,
    },
    html: {
      lang: 'html',
      code: `<!-- Independent toggles -->
<div role="group" aria-label="Text style" class="ds-btn-group">
  <button type="button" class="ds-btn" aria-pressed="true" aria-label="Bold">
    <svg aria-hidden="true">…</svg>
  </button>
  <button type="button" class="ds-btn" aria-pressed="false" aria-label="Italic">
    <svg aria-hidden="true">…</svg>
  </button>
</div>

<!-- Exclusive choice is a radiogroup, not a group -->
<div role="radiogroup" aria-label="Text alignment" class="ds-btn-group">
  <button type="button" role="radio" aria-checked="true"  tabindex="0">Left</button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1">Centre</button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1">Right</button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-btn-group {
  display: inline-flex;
  isolation: isolate;              /* contains the z-index bump below */
}

/* Collapse the seam: two abutting 1px borders read as a 2px join. */
.ds-btn-group > * + * {
  margin-inline-start: -1px;
}

/* Outer corners only. Rounded inner corners leave notches at the seams. */
.ds-btn-group > *:not(:first-child):not(:last-child) {
  border-radius: 0;
}
.ds-btn-group > *:first-child {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
}
.ds-btn-group > *:last-child {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

/* The detail everyone forgets: without this the focus ring and the hover
   border are clipped by the next member and the group looks broken. */
.ds-btn-group > *:hover,
.ds-btn-group > *:focus-visible,
.ds-btn-group > *[aria-pressed='true'] {
  z-index: 1;
}

.ds-btn-group + * {
  margin-inline-start: var(--space-3);   /* 12px, or the group loses its edge */
}`,
    },
    api: [
      {
        name: 'ButtonGroup',
        props: [
          { name: 'aria-label', type: 'string', required: true, description: 'Names what the members have in common. Without it the group is three unrelated buttons.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'Two to five Button or IconButton elements, all the same size and variant.' },
          { name: 'className', type: 'string', description: 'Applied to the container.' },
        ],
      },
      {
        name: 'Segmented',
        props: [
          { name: 'value', type: 'T', required: true, description: 'The single selected value. Renders as a radiogroup.' },
          { name: 'onChange', type: '(v: T) => void', required: true, description: 'Fired on click and on arrow-key movement.' },
          { name: 'options', type: '{ value: T; label: ReactNode }[]', required: true, description: 'Two to five options. Past five, use a Select.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Matches the button scale.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches members to equal widths across the container.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order members by frequency, not alphabetically, and never reorder them at runtime. A group whose buttons move is a group nobody can build muscle memory for.',
      'Give members equal widths when the labels are close in length. Ragged widths in a three-member group look like a rendering accident rather than a design.',
      'If one member is used ten times more than the others, that is the signal to convert the group into a split button.',
      'When the group controls a view, echo the current state somewhere in the content — a pressed button in the corner is easy to miss on a full screen.',
    ],
    performance: [
      'Do not animate the width of a member on press. In a joined group every neighbour reflows, and the seam visibly jitters.',
      'For toggles, keep the pressed state in one piece of state and derive each member from it. Per-button state drifts the moment someone adds a "clear all".',
      'Icon-only groups are the one place where rendering an SVG per member per row of a table becomes measurable — hoist the icons out of the map.',
    ],
    mistakes: [
      'Using role="group" for exclusive choice, so screen readers never learn that only one option can be active.',
      'Forgetting the negative margin, leaving a 2px double border between every member.',
      'Rounding every member’s corners, which leaves a visible notch at each seam.',
      'Omitting the container label, so "CSV, button" is announced with no indication of what it applies to.',
      'Letting the focus ring be clipped by the adjacent border because the focused member was not raised.',
      'Putting a destructive action in a group with routine ones, removing the spacing that would otherwise prevent the mis-click.',
    ],
    realWorld: [
      'Two-member groups are the most reliable: Approve / Reject, Yes / No, Accept / Decline. The user reads both options in one fixation and the shared border makes the pairing unmissable.',
      'On mobile, three members is usually the practical maximum for text labels. Beyond that either the labels truncate or the group scrolls, and both are worse than a select.',
      'Instrument which member gets pressed. In most date-range groups one option accounts for 70% of use — that one should be the default, and the rest can often move into a menu.',
      'In a table toolbar, a button group beside a plain button reads as "these three are one decision, that one is separate". That contrast is worth more than the density it buys.',
    ],
  },
})
