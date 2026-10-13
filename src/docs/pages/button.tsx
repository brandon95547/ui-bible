import * as React from 'react'
import {
  ArrowRight,
  ChevronDown,
  Copy,
  Download,
  Ellipsis,
  LibraryBig,
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
  type ButtonProps,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { cn } from '@/lib/cn'
import {
  Cell,
  Grid,
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
  'primary',
  'secondary',
  'tertiary',
  'standard',
  'aura',
  'nav',
  'frosted-glass',
  'smoked-glass',
  'inherit',
]
const SIZES: ButtonSize[] = ['xs', 'sm', 'md', 'lg']
const SHAPES: ButtonShape[] = ['pill', 'rounded', 'rectangle']

const isGlass = (v: ButtonVariant) => v === 'frosted-glass' || v === 'smoked-glass'

/* Something to be glass over. Glass has no look of its own — it is whatever is
   behind it, blurred and tinted — so a glass button on a flat stage is a
   demonstration of nothing. Three soft lights on the floor color, drawn from
   tokens so the picture re-themes with the page. */
function Artwork({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-[var(--radius-lg)] p-5', className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background: [
            'radial-gradient(55% 95% at 10% 0%, var(--ds-accent), transparent 72%)',
            'radial-gradient(45% 85% at 94% 6%, var(--ds-aura-to), transparent 70%)',
            'radial-gradient(70% 80% at 56% 118%, var(--ds-aura-from), transparent 70%)',
            'var(--ds-sunken)',
          ].join(', '),
        }}
      />
      {children}
    </div>
  )
}

function Playground() {
  const [variant, setVariant] = React.useState<ButtonVariant>('primary')
  const [size, setSize] = React.useState<ButtonSize>('md')
  const [shape, setShape] = React.useState<ButtonShape>('pill')
  const [withIcon, setWithIcon] = React.useState(true)
  const [loading, setLoading] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [full, setFull] = React.useState(false)
  const [done, setDone] = React.useState(false)

  const button = (
    <Button
      variant={variant}
      size={size}
      shape={shape}
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
  )

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
          <Knob label="Shape">
            <KnobSelect value={shape} onChange={setShape} options={SHAPES} />
          </Knob>
          <KnobToggle checked={withIcon} onChange={setWithIcon} label="Icon" />
          <KnobToggle checked={loading} onChange={setLoading} label="Loading" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
          <KnobToggle checked={full} onChange={setFull} label="Full width" />
        </div>
      }
      code={`<Button
  variant="${variant}"
  size="${size}"${shape === 'pill' ? '' : `\n  shape="${shape}"`}${withIcon ? '\n  startIcon={<Save />}' : ''}${loading ? '\n  loading' : ''}${disabled ? '\n  disabled' : ''}${full ? '\n  fullWidth' : ''}
>
  Save changes
</Button>`}
    >
      {/* Glass is shown over a picture, and inherit inside colored text: each
          is defined by what is around it, and is nothing on a bare stage. */}
      {isGlass(variant) ? (
        <Artwork className={cn('grid min-h-28 place-items-center', full ? 'w-full' : 'px-14')}>
          {button}
        </Artwork>
      ) : (
        <div className={cn(full && 'w-full', variant === 'inherit' && 'text-[var(--ds-accent-text)]')}>
          {button}
        </div>
      )}
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
        {/* padding visualization */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full anatomy-pad"
        />
        <button
          type="button"
          className="relative inline-flex h-9 items-center justify-center gap-2 rounded-full border-2 border-dashed border-[var(--ds-accent)] bg-[var(--ds-btn-primary)]/85 px-4 text-label text-[var(--ds-btn-primary-fg)]"
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
        className="pointer-events-none absolute left-6 top-[46px] h-11 w-[143px] -translate-y-[3px] rounded-full border border-dashed border-[var(--ds-warning)]/50"
      />
    </div>
  )
}

/* ===========================================================================
   EXAMPLES
   ======================================================================== */

/* Pinned states. A hover you can only see by hovering is a hover nobody
   reviews, so these force the same slots the real state sets. */
const HOVER = 'before:opacity-100'
const FOCUS = 'outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]'

type Specimen = { label: string; text?: string } & Partial<ButtonProps>

const CATALOG: {
  variant: ButtonVariant
  use: string
  /** Glass is drawn over a picture; inherit inside colored text. */
  ground?: 'artwork' | 'text'
  specimens: Specimen[]
}[] = [
  {
    variant: 'primary',
    use: 'The one filled action in a view. It is the strongest neutral on the page, so it inverts with the theme instead of carrying a color.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', startIcon: <Save /> },
      { label: 'Hover', className: HOVER },
      { label: 'Focus', className: FOCUS },
      { label: 'Inactive', inactive: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'secondary',
    use: 'An outline, for a real alternative to the primary action. It takes the primary look when it is the selected option of a set.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', startIcon: <Plus /> },
      { label: 'Hover', className: HOVER },
      { label: 'Active', active: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'tertiary',
    use: 'A ghost: no fill and no edge until hovered. Icon buttons, and the actions the product would rather you did not take — cancel, skip, dismiss.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', startIcon: <Copy /> },
      { label: 'Hover', className: HOVER },
      { label: 'Inactive', inactive: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'standard',
    use: 'A quiet fill, one step up from whatever it stands on. For an action that should read as a button without competing with the primary one.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', startIcon: <Settings2 /> },
      { label: 'Hover', className: HOVER },
      { label: 'Inactive', inactive: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'aura',
    use: 'The signature: pink into orange under a white label. For the one moment a product is asking for something — create, subscribe, the closing call to action.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', startIcon: <Plus /> },
      { label: 'Hover', className: HOVER },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'nav',
    use: 'A navigation pill. The one for the page you are on takes the primary look, from aria-current rather than from a second variant.',
    specimens: [
      { label: 'Default', text: 'Library', startIcon: <LibraryBig /> },
      { label: 'Hover', text: 'Library', startIcon: <LibraryBig />, className: HOVER },
      { label: 'Current page', text: 'Library', startIcon: <LibraryBig />, 'aria-current': 'page' },
      { label: 'Disabled', text: 'Library', startIcon: <LibraryBig />, disabled: true },
    ],
  },
  {
    variant: 'frosted-glass',
    ground: 'artwork',
    use: 'Glass for a control over imagery: a thin tint of the label color and a 16px backdrop blur. Hover thickens the glass; borderless drops the edge.',
    specimens: [
      { label: 'Default' },
      { label: 'Borderless', borderless: true },
      { label: 'Hover', className: '[--btn-bg:var(--ds-fog-dense)]' },
      { label: 'Active', active: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'smoked-glass',
    ground: 'artwork',
    use: 'Glass that pulls the picture toward the page color instead, for a control on bright or busy artwork where frosted glass would lose its label.',
    specimens: [
      { label: 'Default' },
      { label: 'Borderless', borderless: true },
      { label: 'Hover', className: '[--btn-bg:var(--ds-smoke-dense)]' },
      { label: 'Active', active: true },
      { label: 'Disabled', disabled: true },
    ],
  },
  {
    variant: 'inherit',
    ground: 'text',
    use: 'Takes its color from the text around it. For a link in a nav row or a footer that needs a button’s hit area and hover, and nothing else of a button.',
    specimens: [
      { label: 'Default' },
      { label: 'With icon', endIcon: <ChevronDown /> },
      { label: 'Hover', className: HOVER },
      { label: 'Inactive', inactive: true },
    ],
  },
]

/** A specimen with its name under it, the way the Sizes strip is captioned. */
function Named({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap="xs" className="items-center">
      {children}
      <span className="text-caption text-[var(--ds-fg-muted)]">{label}</span>
    </Stack>
  )
}

function Variants() {
  return (
    <PreviewStage center={false} minHeight={0} bodyClassName="flex-col items-stretch">
      <Grid min="21rem">
        {CATALOG.map(({ variant, use, ground, specimens }) => {
          const row = (
            <Row align="start" gap="lg">
              {specimens.map(({ label, text, ...props }) => (
                <Named key={label} label={label}>
                  <Button variant={variant} {...props}>
                    {text ?? 'Button'}
                  </Button>
                </Named>
              ))}
            </Row>
          )
          return (
            <Cell key={variant} label={variant} sub={use}>
              {ground === 'artwork' ? (
                <Artwork className="[&_.text-caption]:text-[var(--ds-fg)]">{row}</Artwork>
              ) : ground === 'text' ? (
                <div className="text-[var(--ds-accent-text)]">{row}</div>
              ) : (
                row
              )}
            </Cell>
          )
        })}
      </Grid>
    </PreviewStage>
  )
}

/** The 6px a label keeps above the row it names. */
function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-overline uppercase text-[var(--ds-fg-muted)]">{label}</p>
      {children}
    </div>
  )
}

function ToneShapeRelatives() {
  return (
    <PreviewStage center={false} minHeight={0} bodyClassName="flex-col items-stretch gap-6">
      <Stack gap="lg">
        <Labeled label="Destructive — a tone on a variant, not a variant of its own">
          <Row>
            <Button tone="danger" startIcon={<Trash2 />}>
              Delete project
            </Button>
            <Button variant="secondary" tone="danger">
              Revoke access
            </Button>
            <Button variant="tertiary" tone="danger">
              Remove
            </Button>
          </Row>
        </Labeled>
        <Labeled label="Shape — pill is the default; the other two are for a row of squarer controls">
          <Row gap="lg">
            {SHAPES.map((shape) => (
              <Named key={shape} label={shape}>
                <Row gap="sm">
                  <Button shape={shape}>Button</Button>
                  <Button shape={shape} variant="secondary">
                    Button
                  </Button>
                  <IconButton shape={shape} variant="standard" label="Add" icon={<Plus />} />
                </Row>
              </Named>
            ))}
          </Row>
        </Labeled>
        <Labeled label="Icon buttons — as wide as they are tall, always with an accessible name">
          <Row>
            <IconButton label="Copy" icon={<Copy />} variant="secondary" />
            <IconButton label="Share" icon={<Share2 />} variant="tertiary" />
            <IconButton label="Download" icon={<Download />} variant="standard" />
            <IconButton label="Settings" icon={<Settings2 />} variant="primary" />
            <IconButton label="More actions" icon={<Ellipsis />} variant="tertiary" />
          </Row>
        </Labeled>
        <Labeled label="Grouped and split">
          <Row>
            <ButtonGroup aria-label="Calendar range">
              <Button variant="secondary" size="sm">
                Day
              </Button>
              <Button variant="secondary" size="sm">
                Week
              </Button>
              <Button variant="secondary" size="sm">
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
        </Labeled>
        <Labeled label="Floating action button — one per screen, never two">
          <Row align="center">
            <Fab icon={<Plus />} label="New project" size="sm" />
            <Fab icon={<Plus />} label="New project" />
            <Fab icon={<Plus />} label="New project" extended />
            <Fab icon={<Plus />} label="New project" tone="surface" size="sm" />
          </Row>
        </Labeled>
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
    id: 'button',
    title: 'Button',
    tagline:
      'The element users press to make something happen. Nine variants, four sizes, three shapes, and one rule: only one of them can be the most important thing on the screen.',
    keywords: ['cta', 'action', 'submit', 'fab', 'split', 'icon button', 'pill', 'glass', 'aura'],
  },

  overview: {
    purpose:
      'A button performs an action. It changes state, submits data, opens a surface, or starts a process. It is the only control in the system that promises "something will happen when you press me" — which is why a link styled as a button is one of the most damaging shortcuts a team can take.',
    whenToUse: [
      'The user is committing to an action: save, delete, deploy, invite, pay.',
      'The action happens in place — no navigation, or navigation that is a side effect of the action.',
      'The action is important enough to deserve a permanent, visible target rather than living in a menu.',
      'You need to communicate relative importance: primary for the one main path, secondary, standard or tertiary for the rest.',
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
        to: '#/switch',
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
        to: '#/chip',
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
          Four of the variants are a <strong>ladder of emphasis</strong>, not a palette. Primary is
          the loudest thing on the page and there is exactly one per view. Secondary and standard
          carry actions a user might reasonably take instead. Tertiary carries the actions the
          product would rather you did not take — cancel, skip, dismiss — because reducing visual
          weight is a legitimate and honest way to steer behavior, while hiding or disabling the
          control is not.
        </p>
        <p>
          The primary fill is deliberately not a color. It is the strongest neutral the theme has,
          so it inverts with the theme, and hue stays free to mean something: the accent selects
          and focuses, red warns, and the button a view is built around is simply the brightest
          thing on it.
        </p>
        <p>
          The other five are <strong>for a place, not for a rank</strong>. Aura is the one
          decorative fill, for the moment a product asks for something. Nav is a navigation pill.
          The two glass variants exist for a control standing on a picture, and inherit for a link
          that needs a button’s hit area. None of them competes on the ladder, because none of
          them appears where the ladder is being read.
        </p>
        <p>
          Underneath, a variant is only a recipe over five slots — fill, label, edge, hover wash
          and blur. That is why every variant works at every size and every shape, and why
          selected, inactive, disabled and destructive are second recipes over the same slots
          rather than new rules. Height is fixed to the 4px grid so a button, an input and a
          select on the same row share a baseline, and the loading state overlays the label
          instead of replacing it, because a button that changes width under a moving cursor is a
          button you miss.
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
          'The first four are the ladder: read them as most to least emphasis. The other five belong to a place. Hover and focus are pinned here so they can be seen without a pointer; every button is also live.',
        render: <Variants />,
      },
      {
        id: 'tone-shape',
        title: 'Tone, shape and relatives',
        description:
          'What changes a button without changing its variant, and the components built out of it.',
        render: <ToneShapeRelatives />,
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
        note: 'A wash fades in over the fill',
        render: <Button className={HOVER}>Save</Button>,
      },
      {
        label: 'Focus',
        note: '2px ring, 2px offset',
        render: <Button className={FOCUS}>Save</Button>,
      },
      {
        label: 'Pressed',
        note: '98.5% scale, wash held',
        render: <Button className={cn(HOVER, 'scale-[0.985]')}>Save</Button>,
      },
      { label: 'Disabled', note: 'Its own fill and label, no pointer', render: <Button disabled>Save</Button> },
      { label: 'Loading', note: 'Width held constant', render: <Button loading>Save</Button> },
      { label: 'Success', note: 'Reverts after ~1.5s', render: <Button success>Save</Button> },
      {
        label: 'Danger',
        note: 'Destructive, irreversible',
        render: (
          <Button tone="danger" startIcon={<Trash2 />}>
            Delete
          </Button>
        ),
      },
    ],
  },

  anatomy: {
    render: <Anatomy />,
    caption:
      'Medium button, primary variant, pill shape. The hatched area is padding; the dashed outline is the pointer target, which is larger than the visual box on touch devices.',
    parts: [
      {
        n: 1,
        label: 'Horizontal padding',
        value: '16px (md, pill)',
        kind: 'space',
        note: 'Twice the 8px icon–label gap. A pill’s ends are round, so it takes 2px more than the squarer shapes do at the same size: the label has to clear the curve, not just the edge.',
      },
      {
        n: 2,
        label: 'Shape',
        value: 'pill · rounded · rectangle',
        kind: 'shape',
        note: 'Pill is the default: a fully rounded end is the one silhouette on a page that is unmistakably pressable. Rounded takes the radius inputs use (8px at md), for a button in a row of fields; rectangle is for a button set flush into an edge.',
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
        label: 'Hover wash',
        value: '--btn-wash, 0 → 100% in 120ms',
        kind: 'shape',
        note: 'One translucent layer over whatever the fill is, so hover is the same small step on a clear button, a filled one and a gradient. There is no shadow: these buttons are flat, and the wash is the whole of the feedback.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-btn-primary', usedFor: 'Primary fill; also a selected secondary, glass or nav button' },
    { category: 'color', token: '--ds-btn-primary-fg', usedFor: 'Label and icon on the primary fill' },
    { category: 'color', token: '--ds-btn-wash-inverse', usedFor: 'Hover wash over the primary fill' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover wash on secondary, tertiary and standard' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Secondary edge' },
    { category: 'color', token: '--ds-btn-quiet', usedFor: 'Standard fill; an inactive primary' },
    { category: 'color', token: '--ds-btn-disabled', usedFor: 'Disabled fill' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Disabled label' },
    { category: 'color', token: '--ds-aura-from', usedFor: 'Aura, first stop' },
    { category: 'color', token: '--ds-aura-to', usedFor: 'Aura, last stop' },
    { category: 'color', token: '--ds-fog-thin', usedFor: 'Nav fill' },
    { category: 'color', token: '--ds-fog-thick', usedFor: 'Frosted glass at rest' },
    { category: 'color', token: '--ds-fog-dense', usedFor: 'Frosted glass on hover' },
    { category: 'color', token: '--ds-smoke-thick', usedFor: 'Smoked glass at rest' },
    { category: 'color', token: '--ds-smoke-dense', usedFor: 'Smoked glass on hover' },
    { category: 'color', token: '--ds-danger', usedFor: 'Primary fill under the danger tone' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Secondary and tertiary label under the danger tone' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: 'padding-x', value: '12 / 14 / 16 / 24px', usedFor: 'xs / sm / md / lg horizontal padding on a pill (10 / 12 / 14 / 20px on the other shapes)' },
    { category: 'spacing', token: 'gap', value: '6 / 6 / 8 / 8px', usedFor: 'Space between icon and label' },
    { category: 'radius', token: 'pill', value: '9999px', usedFor: 'The default shape, at every size' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'xs corners on the rounded shape' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'sm and md corners on the rounded shape' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'lg corners on the rounded shape' },
    { category: 'typography', token: '--text-label', value: '13px / 540', usedFor: 'sm and md labels' },
    { category: 'typography', token: '--text-body-lg', value: '17px', usedFor: 'lg label' },
    { category: 'motion', token: '--ease-standard', value: 'cubic-bezier(0.2, 0, 0, 1)', usedFor: 'Color and wash transitions' },
    { category: 'motion', token: 'duration', value: '120ms', usedFor: 'Hover and press feedback' },
    { category: 'motion', token: 'backdrop blur', value: '16px', usedFor: 'Nav and both glass variants' },
  ],

  sizes: [
    {
      name: 'Extra small',
      height: '28px',
      padding: '0 12px',
      radius: 'pill',
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
      padding: '0 14px',
      radius: 'pill',
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
      padding: '0 16px',
      radius: 'pill',
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
      padding: '0 24px',
      radius: 'pill',
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
      title: 'Give every view exactly one primary button',
      why: 'The primary variant is the answer to "what did you bring me here to do?". Two answers is the same as none — users fall back to reading every label, which is the cost the emphasis ladder exists to avoid.',
      render: (
        <Row>
          <Button variant="tertiary">Cancel</Button>
          <Button variant="secondary">Save draft</Button>
          <Button>Publish</Button>
        </Row>
      ),
    },
    {
      title: 'Label with a verb the user would say out loud',
      why: '"Delete 3 projects" tells the user what will happen and how much of it. "OK" and "Submit" force them to re-read the dialog to reconstruct the consequence.',
      render: (
        <Row>
          <Button tone="danger" startIcon={<Trash2 />}>
            Delete 3 projects
          </Button>
          <Button variant="secondary">Keep them</Button>
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
      title: 'Put destructive actions behind a different color and a confirmation',
      why: 'Red is the only place color alone is allowed to change meaning, and even then it is paired with an explicit verb. Users have learned red = irreversible; borrowing it for "clear filters" spends that trust.',
      render: (
        <Row>
          <Button variant="secondary" tone="danger">
            Revoke all tokens
          </Button>
          <Badge tone="danger" dot size="sm">
            confirmation required
          </Badge>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not stack multiple primary buttons',
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
      why: 'A grayed-out button is a dead end: it fails contrast, it usually cannot receive focus, and it never explains itself. Keep it enabled and explain the problem on submit, or show the blocking reason next to it.',
      render: (
        <Stack gap="sm" className="items-center">
          <Button disabled>Continue</Button>
          <span className="text-caption text-[var(--ds-fg-muted)]">…but why?</span>
        </Stack>
      ),
    },
    {
      title: 'Do not use an icon-only button for an ambiguous action',
      why: 'Icons are recognized, not read. Outside a tiny set of universals (close, search, add, more) an unlabeled glyph is a guessing game, and a tooltip does not help on touch.',
      render: (
        <Row>
          <IconButton label="?" icon={<Share2 />} variant="secondary" />
          <IconButton label="?" icon={<Settings2 />} variant="secondary" />
          <IconButton label="?" icon={<Download />} variant="secondary" />
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
      'Label against the button fill must reach 4.5:1. Primary is #101010 on #E5E4E3 → 15.0:1 in dark, white on #171A20 → 17.4:1 in light. Aura takes a white label at 4.7:1 on both of its stops.',
      'The button’s own edge against the page must reach 3:1 for the secondary and tertiary variants, or the control is invisible to low-vision users until hovered.',
      'Glass has no ground of its own, so it has no fixed ratio: the label sits on whatever is behind it, blurred and tinted. Check a glass button against the actual picture, at its brightest point, and switch from frosted to smoked when it fails.',
      'An inactive button is still pressable, so its label still clears 4.5:1. Only disabled gives contrast up.',
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
        note: 'Only for buttons that stay pressed. A button that fires and returns must not use it. The `active` prop only changes the look — the caller sets this, because only the caller knows whether the button is a toggle.',
      },
      {
        attr: 'aria-current="page"',
        on: 'Nav button',
        note: 'Marks the pill for the page you are on, and is also what gives it the primary look. There is no separate prop, so the look and the announcement cannot disagree.',
      },
    ],
    focus:
      'A 2px solid ring in --ds-focus-ring at 2px offset, applied with :focus-visible so pointer users never see it and keyboard users always do. The ring is never removed — if it clashes with a layout, the layout is wrong.',
    screenReader: [
      'The accessible name comes from the visible label. Do not add an aria-label that differs from it — voice-control users say what they see.',
      'Loading and success states expose a visually hidden "Loading" / "Done" string so the change is announced, not just drawn.',
      'Icons inside buttons are aria-hidden. Announcing "save icon Save changes button" is noise.',
      'Never nest a button inside an anchor or vice versa: the accessibility tree becomes ambiguous and activation behavior differs per browser.',
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

// The rest of the ladder
<Button variant="secondary">Save draft</Button>
<Button variant="standard">Duplicate</Button>
<Button variant="tertiary">Cancel</Button>

// Destructive is a tone on a variant — always paired with a confirmation step
<Button tone="danger" startIcon={<Trash2 />} onClick={confirmDelete}>
  Delete 3 projects
</Button>
<Button variant="secondary" tone="danger">Revoke access</Button>

// The selected option of a set takes the primary look
<Button variant="secondary" active={view === 'week'} aria-pressed={view === 'week'}>
  Week
</Button>

// Navigation: aria-current is the look and the announcement
<Button variant="nav" aria-current={here ? 'page' : undefined}>Library</Button>

// Over a picture
<Button variant="frosted-glass">Play</Button>
<Button variant="smoked-glass" borderless>Share</Button>

// The signature call to action
<Button variant="aura" size="lg">Start for free</Button>

// A squarer shape, for a row of fields
<Button shape="rounded">Apply</Button>

// Icon only — aria-label is required, not optional
<IconButton label="Copy to clipboard" icon={<Copy />} />

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
      code: `<button type="button" class="ds-btn ds-btn--primary ds-btn--md">
  <span class="ds-btn__content">
    <svg class="ds-btn__icon" width="16" height="16" aria-hidden="true">…</svg>
    Save changes
  </span>
</button>

<!-- Loading: label stays in the DOM so the width never changes -->
<button type="button" class="ds-btn ds-btn--primary ds-btn--md" aria-busy="true" disabled>
  <span class="ds-btn__content is-hidden">Save changes</span>
  <span class="ds-btn__spinner" aria-hidden="true"></span>
  <span class="sr-only">Loading</span>
</button>

<!-- A selected option, and the navigation pill for the current page -->
<button type="button" class="ds-btn ds-btn--secondary ds-btn--sm" data-active aria-pressed="true">
  <span class="ds-btn__content">Week</span>
</button>
<a class="ds-btn ds-btn--nav ds-btn--md" href="/library" aria-current="page">
  <span class="ds-btn__content">Library</span>
</a>

<!-- Icon only -->
<button type="button" class="ds-btn ds-btn--tertiary ds-btn--md ds-btn--icon" aria-label="Copy to clipboard">
  <span class="ds-btn__content"><svg width="16" height="16" aria-hidden="true">…</svg></span>
</button>`,
    },
    css: {
      lang: 'css',
      caption:
        'Every color is a token. A variant is two or three lines, because all it does is fill in slots the base class reads.',
      code: `.ds-btn {
  /* The five slots. A variant fills these in and styles nothing else. */
  --btn-bg: transparent;
  --btn-text: currentColor;
  --btn-border: transparent;
  --btn-wash: var(--ds-layer-hover);
  --btn-blur: 0px;

  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  user-select: none;
  font: inherit;
  font-weight: 540;
  border: 0;
  border-radius: 9999px;
  color: var(--btn-text);
  background-color: var(--btn-bg);
  /* The edge is an inset ring, so a button with one is the size of one without. */
  box-shadow: inset 0 0 0 1px var(--btn-border);
  transition:
    background-color 120ms var(--ease-standard),
    color 120ms var(--ease-standard),
    box-shadow 120ms var(--ease-standard),
    transform 120ms var(--ease-standard);
}

/* The hover wash: one layer over whatever the fill is. */
.ds-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--btn-wash);
  opacity: 0;
  transition: opacity 120ms var(--ease-standard);
  pointer-events: none;
}
.ds-btn:enabled:hover::before,
.ds-btn:enabled:active::before { opacity: 1; }
.ds-btn__content { position: relative; display: inline-flex; align-items: center; gap: 8px; }

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

/* --- sizes: the padding is the pill's --- */
.ds-btn--xs { height: 28px; padding-inline: 12px; font-size: 12px; }
.ds-btn--sm { height: 32px; padding-inline: 14px; font-size: 13px; }
.ds-btn--md { height: 36px; padding-inline: 16px; font-size: 13px; }
.ds-btn--lg { height: 44px; padding-inline: 24px; font-size: 17px; }
.ds-btn--icon { padding-inline: 0; aspect-ratio: 1; }

/* --- shapes --- */
.ds-btn--rounded   { border-radius: var(--radius-md); }
.ds-btn--rectangle { border-radius: 0; }

/* --- variants: each one only fills in slots --- */
.ds-btn--primary {
  --btn-bg: var(--ds-btn-primary);
  --btn-text: var(--ds-btn-primary-fg);
  --btn-wash: var(--ds-btn-wash-inverse);
}
.ds-btn--secondary { --btn-text: var(--ds-fg); --btn-border: var(--ds-border-interactive); }
.ds-btn--tertiary  { --btn-text: var(--ds-fg); }
.ds-btn--standard  { --btn-bg: var(--ds-btn-quiet); --btn-text: var(--ds-fg); }
.ds-btn--aura {
  --btn-bg: var(--ds-aura-to);
  --btn-text: var(--ds-aura-fg);
  --btn-wash: var(--ds-aura-wash);
  background-image: var(--ds-aura);
}
.ds-btn--nav {
  --btn-bg: var(--ds-fog-thin);
  --btn-text: var(--ds-fg);
  --btn-wash: color-mix(in srgb, currentColor 10%, transparent);
  --btn-blur: 16px;
}
.ds-btn--frosted-glass {
  --btn-bg: var(--ds-fog-thick);
  --btn-text: var(--ds-fg);
  --btn-border: var(--ds-border);
  --btn-wash: transparent;
  --btn-blur: 16px;
}
.ds-btn--frosted-glass:enabled:hover { --btn-bg: var(--ds-fog-dense); }
.ds-btn--smoked-glass {
  --btn-bg: var(--ds-smoke-thick);
  --btn-text: var(--ds-fg);
  --btn-border: var(--ds-border);
  --btn-wash: transparent;
  --btn-blur: 16px;
}
.ds-btn--smoked-glass:enabled:hover { --btn-bg: var(--ds-smoke-dense); }
.ds-btn--inherit { --btn-wash: color-mix(in srgb, currentColor 10%, transparent); }
.ds-btn--borderless { --btn-border: transparent; }

/* Only the glass variants pay for a backdrop root. */
.ds-btn--nav,
.ds-btn--frosted-glass,
.ds-btn--smoked-glass { backdrop-filter: blur(var(--btn-blur)); }

/* --- states are second recipes over the same slots --- */
.ds-btn[data-active],
.ds-btn--nav[aria-current='page'] {
  --btn-bg: var(--ds-btn-primary);
  --btn-text: var(--ds-btn-primary-fg);
  --btn-border: transparent;
  --btn-wash: var(--ds-btn-wash-inverse);
}
.ds-btn--danger.ds-btn--primary { --btn-bg: var(--ds-danger); --btn-text: var(--ds-danger-fg); }
.ds-btn--danger.ds-btn--secondary,
.ds-btn--danger.ds-btn--tertiary { --btn-text: var(--ds-danger-text); --btn-wash: var(--ds-danger-subtle); }
.ds-btn--danger.ds-btn--secondary { --btn-border: var(--ds-danger-border); }

.ds-btn:disabled {
  --btn-bg: var(--ds-btn-disabled);
  --btn-text: var(--ds-fg-disabled);
  --btn-border: transparent;
  background-image: none;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .ds-btn, .ds-btn::before { transition-duration: 1ms; }
  .ds-btn:active { transform: none; }
}`,
    },
    api: [
      {
        name: 'Button',
        props: [
          {
            name: 'variant',
            type: "'primary' | 'secondary' | 'tertiary' | 'standard' | 'aura' | 'nav' | 'frosted-glass' | 'smoked-glass' | 'inherit'",
            default: "'primary'",
            description:
              'The first four are the emphasis ladder — one primary button per view. The other five belong to a place: a call to action, navigation, a control over a picture, a link in running text.',
          },
          {
            name: 'size',
            type: "'xs' | 'sm' | 'md' | 'lg'",
            default: "'md'",
            description: 'Height and padding preset. Do not override with a className.',
          },
          {
            name: 'shape',
            type: "'pill' | 'rounded' | 'rectangle'",
            default: "'pill'",
            description: 'Rounded takes the radius inputs use, for a button in a row of fields. Rectangle is square.',
          },
          {
            name: 'tone',
            type: "'danger'",
            description: 'Recolors primary, secondary and tertiary for a destructive action. The other variants ignore it.',
          },
          {
            name: 'active',
            type: 'boolean',
            default: 'false',
            description: 'The selected option of a set: takes the primary look. Set aria-pressed yourself if it is a toggle.',
          },
          {
            name: 'inactive',
            type: 'boolean',
            default: 'false',
            description: 'Still pressable, but not the live option. Dimmed, never below 4.5:1.',
          },
          {
            name: 'borderless',
            type: 'boolean',
            default: 'false',
            description: 'Drops the edge of a glass variant.',
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
          { name: 'variant', type: 'ButtonVariant', default: "'tertiary'", description: 'Same variants as Button.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Renders as a square of this height — a circle, on the default pill shape.' },
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
          { name: 'variant', type: "'primary' | 'secondary' | 'standard'", default: "'primary'", description: 'Applied to both halves.' },
        ],
      },
      {
        name: 'Fab',
        props: [
          { name: 'icon', type: 'ReactNode', required: true, description: 'Usually a plus. Keep it universal.' },
          { name: 'label', type: 'string', required: true, description: 'Accessible name, and the visible text when extended.' },
          { name: 'extended', type: 'boolean', default: 'false', description: 'Shows the label. Use when the action is not obvious from the icon.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: '40 / 56 / 64px square.' },
          { name: 'tone', type: "'accent' | 'surface'", default: "'accent'", description: 'Surface tone for FABs over colorful content.' },
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
      'Transition only background-color, color, box-shadow, transform and the wash’s opacity. Adding `all` forces the browser to watch every property and drops frames on hover-heavy toolbars.',
      'Prefer transform: scale() over changing width or padding for the pressed state — transform is composited and never triggers layout.',
      'In long lists, one delegated click handler on the container beats one closure per row; a 500-row table saves 500 function allocations per render.',
      'Icon imports must be named (`import { Save } from "lucide-react"`), never a namespace import — the latter defeats tree-shaking and adds ~600 kB.',
    ],
    mistakes: [
      'Using a <div> with onClick. It is not focusable, it does not fire on Enter or Space, and it announces as nothing. If it presses, it is a <button>.',
      'Forgetting type="button" inside a form. The default is "submit", so an innocuous "Add row" button reloads the page.',
      'Removing outline on :focus instead of restyling it. This is the single most common accessibility regression in production code.',
      'Putting the loading spinner beside the label instead of over it. The button grows, the layout jumps, and the user clicks the wrong thing.',
      'Coloring a non-destructive action red because it "feels important". Red means irreversible; spending it elsewhere means users stop trusting it where it matters.',
    ],
    realWorld: [
      'In a dialog footer, right-align and let the primary sit closest to the corner the eye exits from. In a form, left-align under the fields, on the same axis as the labels.',
      'For dangerous operations, require typing the resource name rather than just a second click. Two clicks is muscle memory; typing "production-db" is a decision.',
      'Rate-limit at the UI layer: after the first click, go straight to loading. Debouncing the handler is not enough — the user still sees a button that appears to do nothing.',
      'If a button triggers work longer than about 10 seconds, do not hold it in a loading state. Return immediately, show progress somewhere persistent, and let the user leave the page.',
      'Audit your product for primary buttons per screen. Any view with more than one is a design bug, and it is the fastest measurable quality metric a team can adopt.',
    ],
  },
})
