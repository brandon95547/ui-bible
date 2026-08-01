import * as React from 'react'
import { Archive, Rocket, Save, Send, Trash2 } from 'lucide-react'
import { Button, SplitButton } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const DEPLOY_OPTIONS = [
  { label: 'Deploy to staging', description: 'Safe. Rebuilt from main.', onSelect: () => {} },
  { label: 'Deploy and watch logs', description: 'Streams stdout until the health check passes.', onSelect: () => {} },
  { label: 'Schedule for 02:00', description: 'Runs in the low-traffic window.', onSelect: () => {} },
]

function Playground() {
  const [variant, setVariant] = React.useState<'filled' | 'outlined' | 'elevated'>('filled')
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [icon, setIcon] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
  const [last, setLast] = React.useState('—')

  return (
    <PreviewStage
      label="Playground"
      minHeight={160}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['filled', 'outlined', 'elevated'] as const}
            />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <KnobToggle checked={icon} onChange={setIcon} label="Icon" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
        </div>
      }
      code={`<SplitButton
  label="Deploy to production"
  variant="${variant}"
  size="${size}"${icon ? '\n  startIcon={<Rocket />}' : ''}${disabled ? '\n  disabled' : ''}
  onAction={deployToProduction}
  options={[
    { label: 'Deploy to staging',      onSelect: deployStaging },
    { label: 'Deploy and watch logs',  onSelect: deployVerbose },
    { label: 'Schedule for 02:00',     onSelect: schedule },
  ]}
/>`}
    >
      <Stack gap="sm" className="items-center">
        <SplitButton
          label="Deploy to production"
          variant={variant}
          size={size}
          disabled={disabled}
          startIcon={icon ? <Rocket /> : undefined}
          onAction={() => setLast('Deploy to production')}
          options={DEPLOY_OPTIONS.map((o) => ({ ...o, onSelect: () => setLast(o.label) }))}
        />
        <span aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
          Last run: {last}
        </span>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'split-button',
    title: 'Split Button',
    tagline:
      'One obvious default plus a menu of alternatives, in a single control. It exists because the fifth button in a toolbar is always the one nobody uses.',
    keywords: ['menu button', 'dropdown button', 'default action', 'chevron', 'save as'],
  },

  overview: {
    purpose:
      'A split button is two targets in one control: a primary half that runs the action almost everyone wants, and a narrow chevron half that opens a menu of the variants. It is the answer to a specific problem — one action dominates, three related ones matter enough to keep reachable, and putting all four in the toolbar would give equal weight to a 90/10 split.',
    whenToUse: [
      'One action accounts for the clear majority of use and two to six variants share its verb.',
      'Save / Save as / Save a copy, Deploy / Deploy to staging / Schedule, Send / Send later.',
      'A toolbar that would otherwise grow past its useful width because of near-duplicate actions.',
      'When the default is safe to run in one click and getting it wrong is cheap to undo.',
    ],
    whenNotToUse: [
      {
        text: 'No single option is obviously the default.',
        instead: 'a Menu with a neutral trigger — do not invent a default',
        to: '#/menu',
      },
      {
        text: 'The alternatives are peers rather than variants of one verb.',
        instead: 'a Button Group',
        to: '#/button-group',
      },
      {
        text: 'The default is destructive or expensive to undo.',
        instead: 'a plain Button with a confirmation Dialog',
        to: '#/dialog',
      },
      {
        text: 'There are more than about six alternatives.',
        instead: 'a Toolbar with an overflow Menu',
        to: '#/toolbar',
      },
    ],
    reasoning: (
      <>
        <p>
          The whole value of a split button is the <strong>one-click default</strong>. If the
          primary half does not do the thing the user came to do most of the time, you have built a
          menu with an extra, misleading target attached — and a user who clicks the wide half
          expecting a menu gets an action instead. That is the single most damaging failure mode
          this control has, which is why the default must never be destructive.
        </p>
        <p>
          It is <strong>two buttons, not one</strong>, in every sense that matters: two tab stops,
          two accessible names, two hit areas. The chevron half needs a name of its own — "More
          deploy options", not "Toggle" — because a screen-reader user hears it immediately after
          the primary and needs to know the two are related.
        </p>
        <p>
          The chevron half is deliberately narrow, around 32px, and that is already at the edge of
          comfortable. On touch it must widen to 44px or it becomes the most mis-tapped control in
          the product — and every mis-tap runs the primary action.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'shapes',
        title: 'The three shapes it takes',
        description:
          'Filled for a page-level primary, outlined for a secondary, elevated where the control sits on a busy surface and needs its own edge. The variant is the same decision as for any other button — hierarchy first, the split second.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg">
              <SplitButton
                label="Deploy"
                startIcon={<Rocket />}
                onAction={() => {}}
                options={DEPLOY_OPTIONS}
              />
              <SplitButton
                label="Save"
                variant="outlined"
                startIcon={<Save />}
                onAction={() => {}}
                options={[
                  { label: 'Save as…', onSelect: () => {} },
                  { label: 'Save a copy', onSelect: () => {} },
                ]}
              />
              <SplitButton
                label="Send"
                variant="elevated"
                size="sm"
                startIcon={<Send />}
                onAction={() => {}}
                options={[
                  { label: 'Send later', onSelect: () => {} },
                  { label: 'Save to drafts', onSelect: () => {} },
                ]}
              />
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-menu',
        title: 'Split button vs. plain menu',
        description:
          'The test is whether a default exists. If one option is chosen 90% of the time, the split saves a click on almost every interaction. If usage is evenly spread, the split invents a default and makes four of five users click twice.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Grid min="17rem">
              <Cell label="Split button" sub="Deploy to production: 91% of runs" tone="good">
                <SplitButton
                  label="Deploy to production"
                  onAction={() => {}}
                  options={DEPLOY_OPTIONS}
                />
              </Cell>
              <Cell label="Split button" sub="No option above 30% of runs" tone="bad">
                <SplitButton
                  label="Export as CSV"
                  variant="outlined"
                  onAction={() => {}}
                  options={[
                    { label: 'Export as JSON', onSelect: () => {} },
                    { label: 'Export as Parquet', onSelect: () => {} },
                    { label: 'Export as XLSX', onSelect: () => {} },
                  ]}
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'destructive',
        title: 'Never split a destructive default',
        description:
          'The chevron is a 32px target sitting flush against the primary. Every mis-tap runs the default. If the default deletes something, the control is a trap regardless of how careful the user is.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Grid min="17rem">
              <Cell label="Wrong" sub="A mis-tap deletes the project" tone="bad">
                <SplitButton
                  label="Delete project"
                  variant="outlined"
                  startIcon={<Trash2 />}
                  onAction={() => {}}
                  options={[
                    { label: 'Delete and purge backups', danger: true, onSelect: () => {} },
                    { label: 'Archive instead', onSelect: () => {} },
                  ]}
                />
              </Cell>
              <Cell label="Right" sub="Destructive actions live in a menu behind a confirm" tone="good">
                <Row gap="sm">
                  <Button variant="outlined" startIcon={<Archive />}>
                    Archive project
                  </Button>
                  <Button variant="text" className="text-[var(--ds-danger-text)]">
                    Delete…
                  </Button>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'The chevron half keeps its width across sizes — it is sized by the touch target, not by the label beside it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Stack gap="md" className="items-center">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <SplitButton
                  key={s}
                  label="Deploy to production"
                  size={s}
                  startIcon={<Rocket />}
                  onAction={() => {}}
                  options={DEPLOY_OPTIONS}
                />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <SplitButton label="Deploy" size="sm" onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'With icon', render: <SplitButton label="Deploy" size="sm" startIcon={<Rocket />} onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'Outlined', render: <SplitButton label="Save" variant="outlined" size="sm" onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'Tonal', render: <SplitButton label="Send" variant="elevated" size="sm" onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'Disabled', render: <SplitButton label="Deploy" size="sm" disabled onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'Large', render: <SplitButton label="Deploy" size="lg" onAction={() => {}} options={DEPLOY_OPTIONS} /> },
      { label: 'Two options', render: <SplitButton label="Save" variant="outlined" size="sm" onAction={() => {}} options={[{ label: 'Save as…', onSelect: () => {} }, { label: 'Save a copy', onSelect: () => {} }]} /> },
      { label: 'Danger item', render: <SplitButton label="Archive" variant="outlined" size="sm" onAction={() => {}} options={[{ label: 'Archive', onSelect: () => {} }, { label: 'Delete permanently', danger: true, onSelect: () => {} }]} /> },
    ],
  },

  anatomy: {
    render: (
      <SplitButton
        label="Deploy to production"
        startIcon={<Rocket />}
        onAction={() => {}}
        options={DEPLOY_OPTIONS}
      />
    ),
    caption:
      'The wide primary half runs the default action; the narrow half opens the menu. They share a height and a fill but never a click handler.',
    parts: [
      {
        n: 1,
        label: 'Primary half',
        value: 'Sized by its label',
        kind: 'size',
        note: 'Runs the default immediately. Its label must name that specific action — "Deploy to production", not "Deploy" — because the menu underneath contains the other deploys.',
      },
      {
        n: 2,
        label: 'Divider',
        value: '1px at 24% alpha',
        kind: 'color',
        note: 'Full height, inset by 6px top and bottom on filled variants. It is the only thing telling the user there are two targets here, so it must never be decorative-only contrast.',
      },
      {
        n: 3,
        label: 'Chevron half',
        value: '32px (44px on touch)',
        kind: 'size',
        note: 'Sized by the touch target rather than by the icon. This is the narrowest target in the system that still triggers something consequential next to it.',
      },
      {
        n: 4,
        label: 'Chevron',
        value: '14px, rotates 180°',
        kind: 'motion',
        note: 'Rotation on open is what confirms the click landed on the menu half rather than the action half. Without it a slow menu feels like a missed click.',
      },
      {
        n: 5,
        label: 'Menu offset',
        value: '6px below, right-aligned',
        kind: 'space',
        note: 'Aligned to the control’s right edge rather than the chevron’s, so a wide menu does not hang off the layout. Far enough down that the focus ring is not clipped.',
      },
      {
        n: 6,
        label: 'Radius',
        value: 'Outer corners only',
        kind: 'shape',
        note: 'Left corners on the primary, right corners on the chevron, square at the seam — exactly the button-group rule, for exactly the same reason.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent', usedFor: 'Filled background, both halves' },
    { category: 'color', token: '--ds-fg-on-accent', usedFor: 'Label and chevron on a filled control' },
    { category: 'color', token: '--ds-border', usedFor: 'Outlined variant’s edge' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover on either half, independently' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Menu surface' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'A destructive item inside the menu' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on whichever half has focus' },
    { category: 'spacing', token: 'divider inset', value: '6px', usedFor: 'Top and bottom inset of the seam' },
    { category: 'spacing', token: 'menu offset', value: '6px', usedFor: 'Gap between control and menu' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Outer corners only' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Menu elevation' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Chevron rotation and menu entrance' },
  ],

  sizes: [
    { name: 'Small', height: '32px', padding: '0 10px primary', icon: '15px', type: '12px', minWidth: '28px chevron', use: 'Table toolbars and card headers.' },
    { name: 'Medium', height: '36px', padding: '0 14px primary', icon: '16px', type: '13px', minWidth: '32px chevron', use: 'The default. Page-level primary actions.' },
    { name: 'Large', height: '44px', padding: '0 18px primary', icon: '18px', type: '15px', minWidth: '40px chevron', use: 'Touch-first layouts and empty-state calls to action.' },
    { name: 'Menu', minWidth: '13rem', maxWidth: '20rem', use: 'Wide enough for the longest option without truncation; capped so a long label wraps instead of stretching the panel.' },
    { name: 'Menu row', height: '30px', padding: '0 10px', use: '44px on coarse pointers. Two-line rows go to 44px everywhere.' },
  ],

  do: [
    {
      title: 'Make the primary label name the exact default',
      why: '"Deploy" beside a menu containing three deploys tells the user nothing about what the wide half will do. "Deploy to production" removes the guess entirely.',
      render: (
        <SplitButton
          label="Deploy to production"
          size="sm"
          onAction={() => {}}
          options={DEPLOY_OPTIONS}
        />
      ),
    },
    {
      title: 'Give the chevron half its own accessible name',
      why: '"More deploy options" ties the two halves together for a screen-reader user. A bare "Toggle" or an unnamed button leaves them with an unexplained control immediately after the action.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          aria-label="More deploy options"
          <br />
          aria-haspopup="menu" aria-expanded="false"
        </code>
      ),
    },
    {
      title: 'Promote the last-used option to the default',
      why: 'If someone deploys to staging three times running, the fourth click should not need the menu. Persist the choice per user and per surface, and label the primary with whatever it now runs.',
      render: (
        <Stack gap="sm" className="items-center">
          <SplitButton
            label="Deploy to staging"
            variant="outlined"
            size="sm"
            onAction={() => {}}
            options={DEPLOY_OPTIONS}
          />
          <span className="text-caption text-[var(--ds-fg-muted)]">Remembered from last time</span>
        </Stack>
      ),
    },
    {
      title: 'Keep destructive items inside the menu, marked',
      why: 'A danger item in the menu is fine — it takes two deliberate actions to reach. The same item as the default is one mis-tap away.',
      render: (
        <SplitButton
          label="Archive project"
          variant="outlined"
          size="sm"
          onAction={() => {}}
          options={[
            { label: 'Archive project', onSelect: () => {} },
            { label: 'Delete permanently', danger: true, onSelect: () => {} },
          ]}
        />
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use one when there is no real default',
      why: 'The control invents a winner. If four export formats are used evenly, three users out of four now click twice and the fourth exports the wrong format by accident.',
      render: (
        <SplitButton
          label="Export as CSV"
          variant="outlined"
          size="sm"
          onAction={() => {}}
          options={[
            { label: 'Export as JSON', onSelect: () => {} },
            { label: 'Export as XLSX', onSelect: () => {} },
          ]}
        />
      ),
    },
    {
      title: 'Do not make the default destructive',
      why: 'The chevron is 32px wide and flush against the primary. Every mis-aimed tap on a phone runs the default, and "Delete" is not something to run on a mis-aim.',
      render: (
        <SplitButton
          label="Delete project"
          variant="outlined"
          size="sm"
          startIcon={<Trash2 />}
          onAction={() => {}}
          options={[{ label: 'Archive instead', onSelect: () => {} }]}
        />
      ),
    },
    {
      title: 'Do not open the menu from the primary half',
      why: 'Then it is a menu button with a decorative label, and a user who wanted the default action gets a menu they have to read. The two halves must do two different things.',
      render: (
        <div className="text-center">
          <Button variant="outlined" size="sm" endIcon={<span aria-hidden>▾</span>}>
            Deploy to production
          </Button>
          <p className="mt-2 text-caption text-[var(--ds-danger-text)]">
            Whole control opens a menu — this is a Menu, not a split button
          </p>
        </div>
      ),
    },
    {
      title: 'Do not put unrelated actions in the menu',
      why: 'The menu holds variants of the primary verb. "Deploy" next to "Delete branch" and "Invite teammate" is a kebab menu that has been welded onto an action for no reason.',
      render: (
        <SplitButton
          label="Deploy"
          variant="outlined"
          size="sm"
          onAction={() => {}}
          options={[
            { label: 'Delete branch', danger: true, onSelect: () => {} },
            { label: 'Invite teammate', onSelect: () => {} },
          ]}
        />
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The seam between the halves must reach 3:1 against the fill. It is the only visual signal that two targets exist, so it is a meaningful boundary under 1.4.11.',
      'The chevron must reach 3:1 against the fill it sits on. At 14px inside a saturated filled button this is easy to get wrong with a low-alpha white.',
      'Hover must affect only the half under the pointer. A wash across both halves erases the seam at the exact moment the user is deciding which one to hit.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Stops on the primary half, then on the chevron half. Two controls, two stops — never collapse them into one.' },
      { keys: 'Enter / Space', does: 'On the primary, runs the default. On the chevron, opens the menu and focuses its first item.' },
      { keys: '↓', does: 'On the chevron, opens the menu and moves to the first item. On the primary, does nothing.' },
      { keys: '↑ / ↓', does: 'Moves between menu items, wrapping at the ends.' },
      { keys: 'Esc', does: 'Closes the menu and returns focus to the chevron half — never to the body, and never to the primary.' },
      { keys: 'Home / End', does: 'Jumps to the first or last menu item.' },
    ],
    aria: [
      { attr: 'aria-haspopup="menu"', on: 'The chevron half', note: 'Announces that this half opens something rather than doing something.' },
      { attr: 'aria-expanded', on: 'The chevron half', note: 'Tracks the menu’s open state. Static "false" is a common and silent bug.' },
      { attr: 'aria-label', on: 'The chevron half', note: 'Must reference the primary: "More deploy options". Without it the second control is anonymous.' },
      { attr: 'role="menu" / "menuitem"', on: 'The panel and its rows', note: 'Only if arrow keys move focus between items. If the panel holds arbitrary interactive content, it is a Popover, not a menu.' },
      { attr: 'aria-controls', on: 'The chevron half', note: 'Points at the menu’s id, so assistive tech can associate the two.' },
    ],
    focus:
      'Opening the menu moves focus into it. Closing returns focus to the chevron half. Selecting an item closes the menu, runs the action, and returns focus to the chevron — from where Tab continues naturally rather than restarting at the top of the page.',
    screenReader: [
      'The pair announces as "Deploy to production, button" then "More deploy options, menu button, collapsed".',
      'When the menu opens, announce the item count: "menu, 3 items". Without it a user has to arrow to the end to learn how long the list is.',
      'If the default is remembered from last time, say so in the accessible name or a nearby live region — a label that silently changed between visits is disorienting.',
    ],
    touch:
      'The chevron half must be at least 44px wide on coarse pointers, which usually means the whole control grows rather than the primary shrinking. On narrow phones, prefer a full-width primary button with a separate "More options" row underneath — a 32px chevron beside a destructive-adjacent action is the worst target in any mobile layout.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { SplitButton } from '@/ui/Button'

<SplitButton
  label="Deploy to production"      // names the DEFAULT, not the family
  startIcon={<Rocket />}
  onAction={deployToProduction}     // the wide half — one click, no menu
  options={[
    { label: 'Deploy to staging',     icon: <GitBranch />, onSelect: deployStaging },
    { label: 'Deploy and watch logs', icon: <Rocket />,    onSelect: deployVerbose },
    { label: 'Schedule for 02:00',    icon: <Clock />,     onSelect: schedule },
  ]}
/>

// Remembering the last choice is what makes the control pay for itself.
const [preferred, setPreferred] = usePersistentState('deploy:default', 'production')
const target = TARGETS.find((t) => t.id === preferred)!

<SplitButton
  label={\`Deploy to \${target.name}\`}
  onAction={() => deploy(target.id)}
  options={TARGETS.filter((t) => t.id !== preferred).map((t) => ({
    label: \`Deploy to \${t.name}\`,
    onSelect: () => {
      setPreferred(t.id)      // promote it, so the next click needs no menu
      deploy(t.id)
    },
  }))}
/>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-split">
  <!-- Two buttons. Two names. Two tab stops. -->
  <button type="button" class="ds-split__action">
    <svg aria-hidden="true">…</svg>
    Deploy to production
  </button>

  <button
    type="button"
    class="ds-split__toggle"
    aria-label="More deploy options"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="deploy-menu"
  >
    <svg aria-hidden="true">…</svg>
  </button>

  <div id="deploy-menu" role="menu" aria-label="More deploy options" hidden>
    <button type="button" role="menuitem">Deploy to staging</button>
    <button type="button" role="menuitem">Deploy and watch logs</button>
    <button type="button" role="menuitem">Schedule for 02:00</button>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-split {
  display: inline-flex;
  isolation: isolate;
}

.ds-split__action {
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  padding-inline: 14px;
}

.ds-split__toggle {
  inline-size: 32px;                    /* sized by the target, not the icon */
  border-start-start-radius: 0;
  border-end-start-radius: 0;
  display: grid;
  place-items: center;
}

/* The seam is the only signal that there are two targets here, so it is a
   meaningful boundary and owes 3:1 — not a decorative hairline. */
.ds-split__toggle::before {
  content: '';
  position: absolute;
  inset-block: 6px;
  inset-inline-start: 0;
  inline-size: 1px;
  background: color-mix(in oklab, currentColor 24%, transparent);
}

/* Hover only the half under the pointer. A wash across both erases the seam
   at the exact moment the user is choosing which side to hit. */
.ds-split__action:hover,
.ds-split__toggle:hover { background: var(--ds-layer-hover); }

.ds-split__action:focus-visible,
.ds-split__toggle:focus-visible { z-index: 1; }

.ds-split__toggle[aria-expanded='true'] svg { transform: rotate(180deg); }

@media (pointer: coarse) {
  .ds-split__toggle { inline-size: 44px; }
}`,
    },
    api: [
      {
        name: 'SplitButton',
        props: [
          { name: 'label', type: 'string', required: true, description: 'The default action’s own name — not the family name. Shown on the primary half.' },
          { name: 'onAction', type: '() => void', required: true, description: 'Runs on the primary half. Must never be destructive.' },
          { name: 'options', type: 'MenuItemSpec[]', required: true, description: 'Two to six variants of the same verb. Each may carry an icon, a shortcut, and a danger flag.' },
          { name: 'variant', type: "'filled' | 'outlined' | 'elevated'", default: "'filled'", description: 'Hierarchy, decided exactly as for a plain Button.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'The chevron half keeps a touch-sized width at every size.' },
          { name: 'startIcon', type: 'ReactNode', description: 'Leading glyph on the primary half only.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables both halves. Disabling only one is always a bug.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Cap the menu at six items. Past that the control is a toolbar overflow wearing a default, and the default is usually wrong for most of the list.',
      'Show the keyboard shortcut for the default in the menu row that matches it, so the user learns they never needed the control at all.',
      'If the primary half is disabled for a reason, put the reason in a tooltip on the wrapper. A disabled split button with no explanation is two dead targets.',
      'Do not animate the primary label when the remembered default changes — swap it on open, not while the pointer is over it, or the user clicks something they did not read.',
    ],
    performance: [
      'Render the menu only when open. A page with twenty split buttons in a table that each mount a hidden panel is twenty popovers of layout work nobody sees.',
      'Compute the menu’s placement on open, not on every scroll frame. Anchoring math in a scroll handler is the classic cause of jank in dense toolbars.',
      'Keep the chevron rotation on transform. Animating anything that affects layout inside a joined control makes the seam visibly shift.',
    ],
    mistakes: [
      'Labelling the primary with the family verb ("Deploy") so nobody can tell what the wide half will actually do.',
      'Leaving aria-expanded hardcoded to false, so assistive tech never learns the menu opened.',
      'Giving the chevron half no accessible name, producing an anonymous button immediately after the action.',
      'Making the whole control open the menu, which turns a split button into a mislabelled Menu.',
      'Returning focus to the body after the menu closes, dropping a keyboard user back at the top of the page.',
      'A 32px chevron on touch, where every miss runs the primary action.',
    ],
    realWorld: [
      'The pattern earns its keep when the default is above roughly 70% of use. Below that, measure again — you will usually find a plain button plus a separate menu tests better.',
      'IDEs and CI tools are where this control is strongest: run configurations are a textbook 90/10 split, and the saved default matches how people actually work.',
      'Email clients get it wrong constantly. "Send" with a "Send later" chevron is fine; "Send" with "Discard draft" in the menu means a stray click can lose work.',
      'On mobile, most teams end up replacing the split with a full-width primary and a text link. It is less elegant and measurably less error-prone.',
    ],
  },
})
