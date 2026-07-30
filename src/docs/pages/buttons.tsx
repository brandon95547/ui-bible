import * as React from 'react'
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Ellipsis,
  Plus,
  Save,
  Settings2,
  Share2,
  Trash2,
} from 'lucide-react'
import {
  Button,
  ButtonGroup,
  Fab,
  IconButton,
  SplitButton,
  type ButtonSize,
  type ButtonVariant,
} from '@/ui/Button'
import { Badge } from '@/ui/Display'
import {
  Knob,
  KnobSelect,
  KnobToggle,
  Marker,
  PreviewStage,
  Row,
  Stack,
  defineDoc,
} from '../framework/kit'

/* ===========================================================================
   PLAYGROUND
   ======================================================================== */

const VARIANTS: ButtonVariant[] = [
  'filled',
  'tonal',
  'outlined',
  'text',
  'elevated',
  'danger',
  'danger-outline',
  'success',
]
const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg']

function Playground() {
  const [variant, setVariant] = React.useState<ButtonVariant>('filled')
  const [size, setSize] = React.useState<ButtonSize>('md')
  const [withIcon, setWithIcon] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [full, setFull] = React.useState(false)
  const [done, setDone] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect value={variant} onChange={setVariant} options={VARIANTS} />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={SIZES} />
          </Knob>
          <KnobToggle checked={withIcon} onChange={setWithIcon} label="Icon" />
          <KnobToggle checked={loading} onChange={setLoading} label="Loading" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
          <KnobToggle checked={full} onChange={setFull} label="Full width" />
        </div>
      }
      code={`<Button
  variant="${variant}"
  size="${size}"${withIcon ? '\n  startIcon={<Save />}' : ''}${loading ? '\n  loading' : ''}${disabled ? '\n  disabled' : ''}${full ? '\n  fullWidth' : ''}
>
  Save changes
</Button>`}
    >
      <div className={full ? 'w-full' : undefined}>
        <Button
          variant={variant}
          size={size}
          loading={loading}
          disabled={disabled}
          fullWidth={full}
          success={done}
          startIcon={withIcon ? <Save /> : undefined}
          onClick={() => {
            setDone(true)
            setTimeout(() => setDone(false), 1500)
          }}
        >
          Save changes
        </Button>
      </div>
    </PreviewStage>
  )
}

/* ===========================================================================
   ANATOMY DIAGRAM
   ======================================================================== */

function Anatomy() {
  return (
    <div className="relative py-14 pl-6 pr-16">
      {/* the specimen */}
      <div className="relative inline-flex">
        {/* padding visualisation */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-md)] anatomy-pad"
        />
        <button
          type="button"
          className="relative inline-flex h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--ds-accent)] bg-[var(--ds-accent)]/85 px-3.5 text-label text-white"
        >
          <Save size={16} aria-hidden />
          Save changes
        </button>

        {/* markers */}
        <Marker n={1} className="absolute -left-2.5 -top-2.5" />
        <Marker n={2} className="absolute -right-2.5 -top-2.5" tone="warning" />
        <Marker n={3} className="absolute -bottom-2.5 left-9" tone="info" />
        <Marker n={4} className="absolute -bottom-2.5 -left-2.5" tone="success" />
        <Marker n={5} className="absolute -right-2.5 -bottom-2.5" />
      </div>

      {/* dimension guides */}
      <span
        aria-hidden
        className="absolute left-0 top-14 flex h-9 w-4 flex-col items-center justify-between"
      >
        <span className="h-px w-3 bg-[var(--ds-accent)]" />
        <span className="font-mono text-[10px] text-[var(--ds-accent-text)]">36</span>
        <span className="h-px w-3 bg-[var(--ds-accent)]" />
      </span>

      <span
        aria-hidden
        className="absolute -bottom-1 left-6 flex items-center gap-1 font-mono text-[10px] text-[var(--ds-fg-muted)]"
      >
        touch target 44 × 44 (coarse pointers)
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute left-6 top-[46px] h-11 w-[139px] -translate-y-[3px] rounded-[var(--radius-md)] border border-dashed border-[var(--ds-warning)]/50"
      />
    </div>
  )
}

/* ===========================================================================
   EXAMPLES
   ======================================================================== */

function Variants() {
  return (
    <PreviewStage center={false} minHeight={0} bodyClassName="flex-col items-stretch gap-6">
      <Stack gap="lg">
        <div>
          <p className="mb-2.5 text-overline uppercase text-[var(--ds-fg-muted)]">
            Emphasis ladder — exactly one filled button per view
          </p>
          <Row>
            <Button variant="filled">Filled</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="elevated">Elevated</Button>
            <Button variant="text">Text</Button>
          </Row>
        </div>
        <div>
          <p className="mb-2.5 text-overline uppercase text-[var(--ds-fg-muted)]">
            Semantic — colour only when the outcome is genuinely different
          </p>
          <Row>
            <Button variant="danger" startIcon={<Trash2 />}>
              Delete project
            </Button>
            <Button variant="danger-outline">Revoke access</Button>
            <Button variant="success" startIcon={<Check />}>
              Approve
            </Button>
          </Row>
        </div>
        <div>
          <p className="mb-2.5 text-overline uppercase text-[var(--ds-fg-muted)]">
            Icon buttons — square, always with an accessible name
          </p>
          <Row>
            <IconButton label="Copy" icon={<Copy />} variant="outlined" />
            <IconButton label="Share" icon={<Share2 />} variant="text" />
            <IconButton label="Download" icon={<Download />} variant="tonal" />
            <IconButton label="Settings" icon={<Settings2 />} variant="elevated" />
            <IconButton label="More actions" icon={<Ellipsis />} variant="text" />
          </Row>
        </div>
        <div>
          <p className="mb-2.5 text-overline uppercase text-[var(--ds-fg-muted)]">
            Grouped and split
          </p>
          <Row>
            <ButtonGroup aria-label="Text alignment">
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
            <SplitButton
              label="Deploy"
              startIcon={<ArrowRight />}
              options={[
                { label: 'Deploy to staging', description: 'Rebuilds and promotes automatically' },
                { label: 'Deploy to production', description: 'Requires two approvals' },
                { label: 'Cancel queued deploy', danger: true },
              ]}
            />
          </Row>
        </div>
        <div>
          <p className="mb-2.5 text-overline uppercase text-[var(--ds-fg-muted)]">
            Floating action button — one per screen, never two
          </p>
          <Row align="center">
            <Fab icon={<Plus />} label="New project" size="sm" />
            <Fab icon={<Plus />} label="New project" />
            <Fab icon={<Plus />} label="New project" extended />
            <Fab icon={<Plus />} label="New project" tone="surface" size="sm" />
          </Row>
        </div>
      </Stack>
    </PreviewStage>
  )
}

function Sizes() {
  return (
    <PreviewStage minHeight={0}>
      <Row align="center" gap="lg">
        {SIZES.map((s) => (
          <Stack key={s} gap="xs" className="items-center">
            <Button size={s} startIcon={<Save />}>
              Save
            </Button>
            <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">
              {s} · {{ xs: 28, sm: 32, md: 36, lg: 44 }[s]}px
            </span>
          </Stack>
        ))}
      </Row>
    </PreviewStage>
  )
}

/* ===========================================================================
   SPEC
   ======================================================================== */

export default defineDoc({
  meta: {
    id: 'buttons',
    title: 'Buttons',
    group: 'Actions',
    tagline:
      'The element users press to make something happen. Eight variants, four sizes, and one rule: only one of them can be the most important thing on the screen.',
    keywords: ['cta', 'action', 'submit', 'fab', 'split', 'icon button'],
  },

  overview: {
    purpose:
      'A button performs an action. It changes state, submits data, opens a surface, or starts a process. It is the only control in the system that promises "something will happen when you press me" — which is why a link styled as a button is one of the most damaging shortcuts a team can take.',
    whenToUse: [
      'The user is committing to an action: save, delete, deploy, invite, pay.',
      'The action happens in place — no navigation, or navigation that is a side effect of the action.',
      'The action is important enough to deserve a permanent, visible target rather than living in a menu.',
      'You need to communicate relative importance: filled for the one primary path, outlined or text for the rest.',
    ],
    whenNotToUse: [
      {
        text: 'The control navigates to a different page or an external URL.',
        instead: 'a link',
        to: '#/typography',
      },
      {
        text: 'The control toggles a setting that saves immediately.',
        instead: 'a Switch',
        to: '#/switches',
      },
      {
        text: 'The user is choosing between mutually exclusive views of the same data.',
        instead: 'Tabs or a segmented control',
        to: '#/tabs',
      },
      {
        text: 'You have more than three actions competing in the same region.',
        instead: 'a Split Button or an overflow menu',
      },
      {
        text: 'The element is a filter or a removable token.',
        instead: 'a Chip',
        to: '#/chips',
      },
    ],
    reasoning: (
      <>
        <p>
          A screen with five equally weighted buttons has no primary action — it has five
          suggestions. Users resolve that ambiguity by picking the first one, the biggest one, or
          nothing at all, and the design has quietly handed a product decision to chance.
        </p>
        <p>
          Our variants are a <strong>ladder of emphasis</strong>, not a palette. Filled is the
          loudest thing on the page and there is exactly one per view. Tonal and outlined carry
          secondary actions that a user might reasonably take. Text buttons carry actions the
          product would rather you did not take — cancel, skip, dismiss — because reducing visual
          weight is a legitimate and honest way to steer behaviour, while hiding or disabling the
          control is not.
        </p>
        <p>
          Height is fixed to the 4px grid so a button, an input and a select on the same row share
          a baseline. Horizontal padding is roughly twice the icon–label gap, which is what makes
          the label look optically centred rather than mathematically centred. And the loading
          state overlays the label instead of replacing it, because a button that changes width
          under a moving cursor is a button you miss.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'variants',
        title: 'Variants',
        description:
          'Read top to bottom as a ladder. If two buttons in a view have the same variant, they should genuinely be of the same importance.',
        render: <Variants />,
      },
      {
        id: 'sizes-demo',
        title: 'Sizes',
        description:
          'Four heights, all multiples of 4. Medium is the default and should cover roughly 90% of usage.',
        render: <Sizes />,
      },
    ],
    states: [
      { label: 'Default', render: <Button>Save</Button> },
      {
        label: 'Hover',
        note: 'Lighter fill, one elevation step up',
        render: (
          <Button className="!bg-[var(--ds-accent-hover)] !shadow-e2">Save</Button>
        ),
      },
      {
        label: 'Focus',
        note: '2px ring, 2px offset',
        render: <Button className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">Save</Button>,
      },
      {
        label: 'Pressed',
        note: '98.5% scale, shadow removed',
        render: (
          <Button className="!bg-[var(--ds-accent-active)] scale-[0.985] !shadow-e0">Save</Button>
        ),
      },
      { label: 'Disabled', note: '45% opacity, no pointer', render: <Button disabled>Save</Button> },
      { label: 'Loading', note: 'Width held constant', render: <Button loading>Save</Button> },
      { label: 'Success', note: 'Reverts after ~1.5s', render: <Button success>Save</Button> },
      {
        label: 'Danger',
        note: 'Destructive, irreversible',
        render: (
          <Button variant="danger" startIcon={<Trash2 />}>
            Delete
          </Button>
        ),
      },
    ],
  },

  anatomy: {
    render: <Anatomy />,
    caption:
      'Medium button, filled variant. The hatched area is padding; the dashed outline is the pointer target, which is larger than the visual box on touch devices.',
    parts: [
      {
        n: 1,
        label: 'Horizontal padding',
        value: '14px (md)',
        kind: 'space',
        note: 'Roughly 2× the 8px icon–label gap. Less than 12px and the label looks glued to the edge; more than 20px and short labels float in the middle of an oversized slab.',
      },
      {
        n: 2,
        label: 'Corner radius',
        value: '8px · --radius-md',
        kind: 'shape',
        note: 'Matches inputs and selects so controls on the same row share a silhouette. Pills (fully rounded) are reserved for chips and badges, which are not pressable in the same way.',
      },
      {
        n: 3,
        label: 'Icon',
        value: '16px, 1.75 stroke',
        kind: 'size',
        note: 'Sub-linear scaling: a 1.5× taller button gets a 1.2× larger icon. Matching the icon to the cap height rather than the line height keeps it optically aligned with the text.',
      },
      {
        n: 4,
        label: 'Height',
        value: '36px = 9 × 4px',
        kind: 'size',
        note: 'On the 4px grid, so a button aligns with an input, a select and a segmented control without any per-component nudging.',
      },
      {
        n: 5,
        label: 'Elevation',
        value: '--shadow-e1 → e2 on hover',
        kind: 'shape',
        note: 'One step, not three. The shadow says "this is above the page"; a bigger jump says "this is flying", which is a different and mostly unwanted message.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent', usedFor: 'Filled background' },
    { category: 'color', token: '--ds-accent-hover', usedFor: 'Filled hover background' },
    { category: 'color', token: '--ds-accent-active', usedFor: 'Filled pressed background' },
    { category: 'color', token: '--ds-accent-fg', usedFor: 'Label and icon on filled' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Tonal background' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Outlined border' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Text and outlined hover wash' },
    { category: 'color', token: '--ds-danger', usedFor: 'Destructive background' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: 'padding-x', value: '10 / 12 / 14 / 20px', usedFor: 'xs / sm / md / lg horizontal padding' },
    { category: 'spacing', token: 'gap', value: '6 / 6 / 8 / 8px', usedFor: 'Space between icon and label' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'xs button corners' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'sm and md button corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'lg button corners' },
    { category: 'shadow', token: '--shadow-e1', usedFor: 'Filled and danger resting elevation' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Hover elevation, elevated variant resting' },
    { category: 'typography', token: '--text-label', value: '13px / 540', usedFor: 'sm and md labels' },
    { category: 'typography', token: '--text-body-lg', value: '17px', usedFor: 'lg label' },
    { category: 'motion', token: '--ease-standard', value: 'cubic-bezier(0.2, 0, 0, 1)', usedFor: 'Colour and shadow transitions' },
    { category: 'motion', token: 'duration', value: '120ms', usedFor: 'Hover and press feedback' },
  ],

  sizes: [
    {
      name: 'Extra small',
      height: '28px',
      padding: '0 10px',
      radius: '6px',
      icon: '13px',
      gap: '6px',
      type: '12px / 540',
      minWidth: '56px',
      touch: '44px (padded)',
      use: 'Inside table rows, chips and dense toolbars. Never as a form’s primary action.',
    },
    {
      name: 'Small',
      height: '32px',
      padding: '0 12px',
      radius: '8px',
      icon: '14px',
      gap: '6px',
      type: '13px / 540',
      minWidth: '64px',
      touch: '44px (padded)',
      use: 'Card footers, panel headers, secondary toolbars, filter bars.',
    },
    {
      name: 'Medium',
      height: '36px',
      padding: '0 14px',
      radius: '8px',
      icon: '16px',
      gap: '8px',
      type: '13px / 540',
      minWidth: '72px',
      maxWidth: '20rem',
      touch: '44px (padded)',
      use: 'The default. Forms, dialogs, page headers — reach for anything else only with a reason.',
    },
    {
      name: 'Large',
      height: '44px',
      padding: '0 20px',
      radius: '12px',
      icon: '18px',
      gap: '8px',
      type: '17px / 500',
      minWidth: '96px',
      maxWidth: '24rem',
      touch: '44px (native)',
      use: 'Marketing pages, mobile primary actions, checkout. One per screen at most.',
    },
  ],

  do: [
    {
      title: 'Give every view exactly one filled button',
      why: 'The filled variant is the answer to "what did you bring me here to do?". Two answers is the same as none — users fall back to reading every label, which is the cost the emphasis ladder exists to avoid.',
      render: (
        <Row>
          <Button variant="text">Cancel</Button>
          <Button variant="outlined">Save draft</Button>
          <Button>Publish</Button>
        </Row>
      ),
    },
    {
      title: 'Label with a verb the user would say out loud',
      why: '"Delete 3 projects" tells the user what will happen and how much of it. "OK" and "Submit" force them to re-read the dialog to reconstruct the consequence.',
      render: (
        <Row>
          <Button variant="danger" startIcon={<Trash2 />}>
            Delete 3 projects
          </Button>
          <Button variant="outlined">Keep them</Button>
        </Row>
      ),
    },
    {
      title: 'Keep the width fixed while loading',
      why: 'The spinner is overlaid and the label is hidden, not removed. A button that shrinks mid-click moves the target out from under the pointer and invites a second, accidental click elsewhere.',
      render: (
        <Row>
          <Button startIcon={<Save />}>Save changes</Button>
          <Button loading startIcon={<Save />}>
            Save changes
          </Button>
        </Row>
      ),
    },
    {
      title: 'Put destructive actions behind a different colour and a confirmation',
      why: 'Red is the only place colour alone is allowed to change meaning, and even then it is paired with an explicit verb. Users have learned red = irreversible; borrowing it for "clear filters" spends that trust.',
      render: (
        <Row>
          <Button variant="danger-outline">Revoke all tokens</Button>
          <Badge tone="danger" dot size="sm">
            confirmation required
          </Badge>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not stack multiple filled buttons',
      why: 'Every button becomes the primary button, so none of them is. This is the single most common cause of "the app feels cluttered" feedback that gets misdiagnosed as a spacing problem.',
      render: (
        <Row>
          <Button>Cancel</Button>
          <Button>Save draft</Button>
          <Button>Publish</Button>
        </Row>
      ),
    },
    {
      title: 'Do not disable a button without saying why',
      why: 'A greyed-out button is a dead end: it fails contrast, it usually cannot receive focus, and it never explains itself. Keep it enabled and explain the problem on submit, or show the blocking reason next to it.',
      render: (
        <Stack gap="sm" className="items-center">
          <Button disabled>Continue</Button>
          <span className="text-caption text-[var(--ds-fg-muted)]">…but why?</span>
        </Stack>
      ),
    },
    {
      title: 'Do not use an icon-only button for an ambiguous action',
      why: 'Icons are recognised, not read. Outside a tiny set of universals (close, search, add, more) an unlabelled glyph is a guessing game, and a tooltip does not help on touch.',
      render: (
        <Row>
          <IconButton label="?" icon={<Share2 />} variant="outlined" />
          <IconButton label="?" icon={<Settings2 />} variant="outlined" />
          <IconButton label="?" icon={<Download />} variant="outlined" />
        </Row>
      ),
    },
    {
      title: 'Do not invent a height',
      why: 'A 38px button next to a 36px input is not "close enough" — the misalignment is visible even to people who cannot name it, and it multiplies across every screen that copies the pattern.',
      render: (
        <Row align="center">
          <Button style={{ height: 38 }}>38px</Button>
          <input
            readOnly
            value="36px input"
            className="h-9 rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] bg-[var(--ds-surface-inset)] px-3 text-body-sm"
          />
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Label against the button fill must reach 4.5:1. Our filled variant is white on #7C6CFF → 4.63:1 in dark, white on #6A55F2 → 5.71:1 in light.',
      'The button’s own edge against the page must reach 3:1 for outlined and text variants, or the control is invisible to low-vision users until hovered.',
      'The focus ring must reach 3:1 against both the button and the surrounding surface — this is why the ring sits at 2px offset rather than flush.',
      'Disabled controls are exempt from contrast requirements, which is exactly why "disable it" is not an accessibility solution.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves focus to the button in DOM order.' },
      { keys: 'Enter', does: 'Activates. On a <button type="submit"> also submits the form.' },
      { keys: 'Space', does: 'Activates on key-up, so the user can slide off to cancel.' },
      { keys: '↓ / Alt+↓', does: 'On a split button, opens the options menu.' },
      { keys: 'Esc', does: 'Closes an open split-button menu and returns focus to the trigger.' },
    ],
    aria: [
      {
        attr: 'aria-label',
        on: 'IconButton',
        note: 'Required. Without it the button announces as "button" and is unusable by name.',
      },
      {
        attr: 'aria-busy="true"',
        on: 'button',
        note: 'Set while loading so assistive tech knows the action is in flight rather than ignored.',
      },
      {
        attr: 'aria-disabled',
        on: 'button',
        note: 'Prefer over the disabled attribute when the button must stay focusable and explain itself.',
      },
      {
        attr: 'aria-expanded / aria-haspopup',
        on: 'Split button trigger',
        note: 'On the disclosure half only. The primary half stays a plain button.',
      },
      {
        attr: 'aria-pressed',
        on: 'Toggle buttons',
        note: 'Only for buttons that stay pressed. A button that fires and returns must not use it.',
      },
    ],
    focus:
      'A 2px solid ring in --ds-focus-ring at 2px offset, applied with :focus-visible so pointer users never see it and keyboard users always do. The ring is never removed — if it clashes with a layout, the layout is wrong.',
    screenReader: [
      'The accessible name comes from the visible label. Do not add an aria-label that differs from it — voice-control users say what they see.',
      'Loading and success states expose a visually hidden "Loading" / "Done" string so the change is announced, not just drawn.',
      'Icons inside buttons are aria-hidden. Announcing "save icon Save changes button" is noise.',
      'Never nest a button inside an anchor or vice versa: the accessibility tree becomes ambiguous and activation behaviour differs per browser.',
    ],
    touch:
      'Every size renders a 44 × 44 pointer target via an ::after overlay applied on coarse pointers, so a 28px toolbar button is still thumb-safe on a tablet without inflating the desktop layout. Adjacent targets keep at least 8px of clear space.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption: 'The common cases. Everything else is a combination of these props.',
      code: `import { Button, IconButton, SplitButton, Fab } from '@/ui/Button'
import { Save, Trash2, Plus, Copy } from 'lucide-react'

// Primary action — one per view
<Button onClick={save}>Save changes</Button>

// With an icon and a loading state that holds its width
<Button startIcon={<Save />} loading={isSaving}>
  Save changes
</Button>

// Secondary and tertiary
<Button variant="outlined">Save draft</Button>
<Button variant="text">Cancel</Button>

// Destructive — always paired with a confirmation step
<Button variant="danger" startIcon={<Trash2 />} onClick={confirmDelete}>
  Delete 3 projects
</Button>

// Icon only — aria-label is required, not optional
<IconButton label="Copy to clipboard" icon={<Copy />} variant="text" />

// Default action plus its variants
<SplitButton
  label="Deploy"
  onAction={deployToStaging}
  options={[
    { label: 'Deploy to production', description: 'Requires two approvals' },
    { label: 'Cancel queued deploy', danger: true },
  ]}
/>

// One FAB per screen, maximum
<Fab icon={<Plus />} label="New project" extended />`,
    },
    html: {
      lang: 'html',
      caption:
        'No framework required. The classes below map 1:1 to the tokens, so this snippet behaves identically inside the design system.',
      code: `<button type="button" class="ds-btn ds-btn--filled ds-btn--md">
  <svg class="ds-btn__icon" width="16" height="16" aria-hidden="true">…</svg>
  <span>Save changes</span>
</button>

<!-- Loading: label stays in the DOM so the width never changes -->
<button type="button" class="ds-btn ds-btn--filled ds-btn--md" aria-busy="true" disabled>
  <span class="ds-btn__content is-hidden">Save changes</span>
  <span class="ds-btn__spinner" aria-hidden="true"></span>
  <span class="sr-only">Loading</span>
</button>

<!-- Icon only -->
<button type="button" class="ds-btn ds-btn--text ds-btn--md ds-btn--icon" aria-label="Copy to clipboard">
  <svg width="16" height="16" aria-hidden="true">…</svg>
</button>`,
    },
    css: {
      lang: 'css',
      caption: 'Every value is a token reference. There is not a single literal colour here.',
      code: `.ds-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  user-select: none;
  font: inherit;
  font-weight: 540;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  transition:
    background-color 120ms var(--ease-standard),
    border-color 120ms var(--ease-standard),
    box-shadow 120ms var(--ease-standard),
    transform 120ms var(--ease-standard);
}

/* Guarantees a 44px target on touch without changing desktop layout */
@media (pointer: coarse) {
  .ds-btn::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: 44px;
    transform: translateY(-50%);
  }
}

.ds-btn:active { transform: scale(0.985); }
.ds-btn:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}
.ds-btn:disabled {
  opacity: 0.45;
  filter: saturate(0.5);
  pointer-events: none;
}

/* --- sizes --- */
.ds-btn--xs { height: 28px; padding-inline: 10px; font-size: 12px; border-radius: var(--radius-sm); }
.ds-btn--sm { height: 32px; padding-inline: 12px; font-size: 13px; }
.ds-btn--md { height: 36px; padding-inline: 14px; font-size: 13px; }
.ds-btn--lg { height: 44px; padding-inline: 20px; font-size: 17px; border-radius: var(--radius-lg); }
.ds-btn--icon { padding-inline: 0; aspect-ratio: 1; }

/* --- variants --- */
.ds-btn--filled {
  background: var(--ds-accent);
  color: var(--ds-accent-fg);
  box-shadow: var(--shadow-e1);
}
.ds-btn--filled:hover { background: var(--ds-accent-hover); box-shadow: var(--shadow-e2); }
.ds-btn--filled:active { background: var(--ds-accent-active); box-shadow: none; }

.ds-btn--outlined {
  border-color: var(--ds-border-interactive);
  color: var(--ds-fg);
}
.ds-btn--outlined:hover {
  border-color: var(--ds-border-strong);
  background: var(--ds-layer-hover);
}

.ds-btn--text { color: var(--ds-fg-secondary); }
.ds-btn--text:hover { background: var(--ds-layer-hover); color: var(--ds-fg); }

.ds-btn--danger {
  background: var(--ds-danger);
  color: var(--ds-danger-fg);
  box-shadow: var(--shadow-e1);
}

@media (prefers-reduced-motion: reduce) {
  .ds-btn { transition-duration: 1ms; }
  .ds-btn:active { transform: none; }
}`,
    },
    api: [
      {
        name: 'Button',
        props: [
          {
            name: 'variant',
            type: "'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'danger' | 'danger-outline' | 'success'",
            default: "'filled'",
            description: 'Position on the emphasis ladder. One filled button per view.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Height and padding preset. Do not override with a className.',
          },
          {
            name: 'loading',
            type: 'boolean',
            default: 'false',
            description:
              'Overlays a spinner, hides the label without unmounting it, sets aria-busy and disables interaction.',
          },
          {
            name: 'success',
            type: 'boolean',
            default: 'false',
            description: 'Shows a check for confirmation. Reset it yourself after ~1.5s.',
          },
          { name: 'startIcon', type: 'ReactNode', description: 'Leading icon. Sized automatically.' },
          { name: 'endIcon', type: 'ReactNode', description: 'Trailing icon, for disclosure or direction.' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretches to the container. Mobile and dialog footers only.' },
          { name: 'iconOnly', type: 'boolean', default: 'false', description: 'Renders square. Prefer <IconButton>, which forces a label.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Use sparingly — see Don’t #2.' },
        ],
      },
      {
        name: 'IconButton',
        props: [
          { name: 'label', type: 'string', required: true, description: 'Accessible name. There is no fallback.' },
          { name: 'icon', type: 'ReactNode', required: true, description: 'The glyph. Sized from the button size.' },
          { name: 'variant', type: 'ButtonVariant', default: "'text'", description: 'Same ladder as Button.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Renders as a square of this height.' },
        ],
      },
      {
        name: 'SplitButton',
        props: [
          { name: 'label', type: 'string', required: true, description: 'The default action’s label.' },
          { name: 'onAction', type: '() => void', description: 'Fired by the primary half.' },
          {
            name: 'options',
            type: '{ label, description?, onSelect?, danger? }[]',
            required: true,
            description: 'Menu contents. Put the most common variant first.',
          },
          { name: 'variant', type: "'filled' | 'outlined' | 'elevated'", default: "'filled'", description: 'Applied to both halves.' },
        ],
      },
      {
        name: 'Fab',
        props: [
          { name: 'icon', type: 'ReactNode', required: true, description: 'Usually a plus. Keep it universal.' },
          { name: 'label', type: 'string', required: true, description: 'Accessible name, and the visible text when extended.' },
          { name: 'extended', type: 'boolean', default: 'false', description: 'Shows the label. Use when the action is not obvious from the icon.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '40 / 56 / 64px square.' },
          { name: 'tone', type: "'accent' | 'surface'", default: "'accent'", description: 'Surface tone for FABs over colourful content.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Order actions as Cancel → Secondary → Primary on desktop (left to right, primary last, matching the F-pattern exit point). On mobile, stack them with the primary on top and full width.',
      'Sentence case, not Title Case. "Save changes" reads faster than "Save Changes" because lowercase word shapes are more distinctive.',
      'Cap a label at three words. If you need more, the button is doing a job that belongs to a heading or an inline description.',
      'For "Copy", swap the icon to a check for 1.5s instead of firing a toast. The feedback should appear where the user is looking.',
      'A button that opens a dialog should end its label with an ellipsis ("Invite people…") — an old macOS convention that still reliably signals "more input required".',
    ],
    performance: [
      'Transition only background-color, border-color, box-shadow and transform. Adding `all` forces the browser to watch every property and drops frames on hover-heavy toolbars.',
      'Prefer transform: scale() over changing width or padding for the pressed state — transform is composited and never triggers layout.',
      'In long lists, one delegated click handler on the container beats one closure per row; a 500-row table saves 500 function allocations per render.',
      'Icon imports must be named (`import { Save } from "lucide-react"`), never a namespace import — the latter defeats tree-shaking and adds ~600 kB.',
    ],
    mistakes: [
      'Using a <div> with onClick. It is not focusable, it does not fire on Enter or Space, and it announces as nothing. If it presses, it is a <button>.',
      'Forgetting type="button" inside a form. The default is "submit", so an innocuous "Add row" button reloads the page.',
      'Removing outline on :focus instead of restyling it. This is the single most common accessibility regression in production code.',
      'Putting the loading spinner beside the label instead of over it. The button grows, the layout jumps, and the user clicks the wrong thing.',
      'Colouring a non-destructive action red because it "feels important". Red means irreversible; spending it elsewhere means users stop trusting it where it matters.',
    ],
    realWorld: [
      'In a dialog footer, right-align and let the primary sit closest to the corner the eye exits from. In a form, left-align under the fields, on the same axis as the labels.',
      'For dangerous operations, require typing the resource name rather than just a second click. Two clicks is muscle memory; typing "production-db" is a decision.',
      'Rate-limit at the UI layer: after the first click, go straight to loading. Debouncing the handler is not enough — the user still sees a button that appears to do nothing.',
      'If a button triggers work longer than about 10 seconds, do not hold it in a loading state. Return immediately, show progress somewhere persistent, and let the user leave the page.',
      'Audit your product for filled buttons per screen. Any view with more than one is a design bug, and it is the fastest measurable quality metric a team can adopt.',
    ],
  },
})
