import {
  AlertTriangle,
  Archive,
  Bell,
  Check,
  ChevronRight,
  Copy,
  Download,
  Ellipsis,
  ExternalLink,
  Filter,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react'
import { Button, IconButton } from '@/ui/Button'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const CORE = [
  { Icon: Plus, name: 'Plus', means: 'Create something new' },
  { Icon: X, name: 'X', means: 'Close or remove' },
  { Icon: Search, name: 'Search', means: 'Find' },
  { Icon: Settings, name: 'Settings', means: 'Configure' },
  { Icon: Ellipsis, name: 'Ellipsis', means: 'More actions' },
  { Icon: Check, name: 'Check', means: 'Done or selected' },
  { Icon: ChevronRight, name: 'ChevronRight', means: 'Navigate forward, expand' },
  { Icon: Trash2, name: 'Trash2', means: 'Delete permanently' },
  { Icon: Pencil, name: 'Pencil', means: 'Edit in place' },
  { Icon: Copy, name: 'Copy', means: 'Duplicate to clipboard' },
  { Icon: Download, name: 'Download', means: 'Save to device' },
  { Icon: Upload, name: 'Upload', means: 'Send from device' },
  { Icon: Filter, name: 'Filter', means: 'Narrow a result set' },
  { Icon: RefreshCw, name: 'RefreshCw', means: 'Reload data' },
  { Icon: Bell, name: 'Bell', means: 'Notifications' },
  { Icon: User, name: 'User', means: 'Account or person' },
  { Icon: Share2, name: 'Share2', means: 'Send elsewhere' },
  { Icon: Archive, name: 'Archive', means: 'Remove without deleting' },
  { Icon: ExternalLink, name: 'ExternalLink', means: 'Opens outside the app' },
  { Icon: Info, name: 'Info', means: 'Supplementary detail' },
]

const SIZES = [
  { px: 13, ctx: 'Inside xs controls and badges' },
  { px: 14, ctx: 'Inside sm controls, table cells' },
  { px: 16, ctx: 'The default. Buttons, nav, inputs' },
  { px: 18, ctx: 'lg controls, section headers' },
  { px: 22, ctx: 'FAB, empty-state accents' },
  { px: 32, ctx: 'Empty states, feature cards' },
]

export default defineDoc({
  meta: {
    id: 'icons',
    title: 'Icons',
    group: 'Foundations',
    tagline:
      'One family, one stroke weight, six sizes. An icon is a mnemonic for something the user already knows — it is not a substitute for telling them.',
    keywords: ['iconography', 'svg', 'lucide', 'glyph', 'pictogram', 'stroke', 'optical alignment'],
  },

  overview: {
    purpose:
      'Icons make a familiar action findable faster than reading would. That is their entire value, and it depends completely on familiarity — an icon the user has not learned is slower than a word, not faster. So we use one consistent family, a small conventional core set, and a label whenever the meaning is not already universal.',
    whenToUse: [
      'Alongside a text label, to speed up repeat recognition of a frequent action.',
      'Alone, only for the handful of universally understood glyphs: close, search, add, more, back.',
      'As a status marker paired with a colour and a word, so meaning survives greyscale.',
      'To make a dense toolbar scannable, where labels would not fit and the actions are used daily.',
    ],
    whenNotToUse: [
      {
        text: 'Alone, for an action with no established convention — share, export, sync, archive.',
        instead: 'an icon plus a label',
      },
      {
        text: 'As decoration next to every heading on a page.',
        instead: 'nothing — decorative icons dilute the ones that carry meaning',
      },
      {
        text: 'To represent an abstract concept like "insights" or "workspace".',
        instead: 'a word',
      },
      {
        text: 'With a tooltip as the only way to learn the meaning, on a touch-first surface.',
        instead: 'a visible label — there is no hover on touch',
      },
    ],
    reasoning: (
      <>
        <p>
          Icons are <strong>recognised, not read</strong>. Recognition is fast and requires prior
          exposure; without it the user is doing visual problem-solving. Research on toolbar
          usability has consistently found that icon-only toolbars are slower for new users and only
          overtake labelled ones after substantial repeated use. Most of your users are not power
          users of the screen they are currently on.
        </p>
        <p>
          Mixing icon families is instantly visible even to people who cannot articulate why —
          different stroke weights, corner radii and optical sizes read as inconsistency. We use one
          family at a fixed 1.75 stroke, and if a glyph is missing we draw it to match rather than
          importing a second set.
        </p>
        <p>
          Icons need <strong>optical</strong> alignment, not mathematical alignment. A 16px icon
          next to 13px text should align on the text's cap height, not its line box; a triangle
          inside a circular button needs to sit about 1px right of centre because its visual mass is
          on the left. These corrections are small and they are the difference between "designed"
          and "assembled".
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Core set" center={false} minHeight={0} allowResize={false}>
        <div className="grid w-full gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))' }}>
          {CORE.map(({ Icon, name, means }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2.5"
            >
              <Icon size={16} className="shrink-0 text-[var(--ds-fg-secondary)]" />
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] text-[var(--ds-fg)]">{name}</p>
                <p className="truncate text-[10px] text-[var(--ds-fg-muted)]">{means}</p>
              </div>
            </div>
          ))}
        </div>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'Six steps. Icons scale sub-linearly with their container — a 1.5× taller button gets a 1.2× larger icon, or the glyph starts to dominate the label.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Row gap="lg" align="end" className="justify-center py-2">
              {SIZES.map((s) => (
                <Stack key={s.px} gap="xs" className="items-center">
                  <Settings size={s.px} className="text-[var(--ds-fg-secondary)]" />
                  <span className="font-mono text-[10px] tabular-nums text-[var(--ds-fg-muted)]">
                    {s.px}px
                  </span>
                  <span className="max-w-[7rem] text-center text-[10px] leading-tight text-[var(--ds-fg-muted)]">
                    {s.ctx}
                  </span>
                </Stack>
              ))}
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'labelling',
        title: 'Labelled vs unlabelled',
        description:
          'The left row is unambiguous to a first-time user. The right row is a quiz. Both are the same four actions.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Labelled" sub="Readable on first encounter" tone="good">
                <Row gap="sm">
                  <Button size="sm" variant="outlined" startIcon={<Share2 />}>Share</Button>
                  <Button size="sm" variant="outlined" startIcon={<Archive />}>Archive</Button>
                  <Button size="sm" variant="outlined" startIcon={<Download />}>Export</Button>
                </Row>
              </Cell>
              <Cell label="Unlabelled" sub="Requires prior learning" tone="bad">
                <Row gap="sm">
                  <IconButton label="Share" icon={<Share2 />} variant="outlined" />
                  <IconButton label="Archive" icon={<Archive />} variant="outlined" />
                  <IconButton label="Export" icon={<Download />} variant="outlined" />
                </Row>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'alignment',
        title: 'Optical alignment',
        description:
          'Icons and text share a baseline, not a box. Centring on the line box drops the glyph roughly 1px too low at every size.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Aligned on cap height" tone="good">
                <span className="inline-flex items-center gap-2 text-body-sm text-[var(--ds-fg)]">
                  <Check size={15} className="shrink-0" />
                  Deployment succeeded
                </span>
              </Cell>
              <Cell label="Aligned on line box" tone="bad">
                <span className="inline-flex gap-2 text-body-sm text-[var(--ds-fg)]">
                  <Check size={15} className="shrink-0 self-start" style={{ marginTop: 4 }} />
                  Deployment succeeded
                </span>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <Bell size={18} className="text-[var(--ds-fg-secondary)]" /> },
      { label: 'Hover', render: <Bell size={18} className="text-[var(--ds-fg)]" /> },
      { label: 'Active', render: <Bell size={18} className="text-[var(--ds-accent-text)]" /> },
      { label: 'Disabled', render: <Bell size={18} className="text-[var(--ds-fg-disabled)]" /> },
      { label: 'Success', render: <Check size={18} className="text-[var(--ds-success-text)]" /> },
      { label: 'Danger', render: <AlertTriangle size={18} className="text-[var(--ds-danger-text)]" /> },
      { label: 'Decorative', note: 'aria-hidden', render: <Info size={18} className="text-[var(--ds-fg-muted)]" /> },
      { label: 'Loading', render: <RefreshCw size={18} className="animate-[spin_720ms_linear_infinite] text-[var(--ds-fg-muted)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="relative grid place-items-center">
        <div className="relative grid h-32 w-32 place-items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--ds-border-strong)]">
          <span className="absolute inset-2 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-accent-border)]" />
          <Settings size={64} strokeWidth={1.75} className="text-[var(--ds-accent)]" />
        </div>
        <div className="mt-3 flex gap-3 font-mono text-[10px] text-[var(--ds-fg-muted)]">
          <span>24×24 viewBox</span>
          <span>·</span>
          <span>1.75 stroke</span>
          <span>·</span>
          <span>2px padding</span>
        </div>
      </div>
    ),
    caption:
      'Every glyph is drawn on a 24×24 grid with 2px of clearance, so icons of different shapes occupy the same optical area.',
    parts: [
      {
        n: 1,
        label: 'Canvas',
        value: '24 × 24',
        kind: 'size',
        note: 'Fixed viewBox regardless of rendered size. Scaling the viewBox instead of the render size is what makes stroke weights drift between icons.',
      },
      {
        n: 2,
        label: 'Live area',
        value: '20 × 20',
        kind: 'space',
        note: '2px of padding on every side so a circle and a square read as the same visual weight. Without it, full-bleed glyphs look larger than inset ones.',
      },
      {
        n: 3,
        label: 'Stroke weight',
        value: '1.75px at 24px',
        kind: 'shape',
        note: 'Scales with the icon, so a 16px icon renders at ~1.17px. Fixing the stroke in absolute pixels makes small icons look heavy and large ones look spindly.',
      },
      {
        n: 4,
        label: 'Corner radius',
        value: '2px, round caps',
        kind: 'shape',
        note: 'Matches the softness of our UI radius scale. Sharp caps in a rounded interface look borrowed from another product.',
      },
      {
        n: 5,
        label: 'Optical centre',
        value: '≈1px right of true centre',
        kind: 'space',
        note: 'Asymmetric glyphs — play triangles, send arrows — need nudging. Mathematical centring makes them look like they are drifting left.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'icon-xs', value: '13px', usedFor: 'xs buttons, badges, inline markers' },
    { category: 'spacing', token: 'icon-sm', value: '14px', usedFor: 'sm buttons, table cells, chips' },
    { category: 'spacing', token: 'icon-md', value: '16px', usedFor: 'Default: buttons, nav, inputs' },
    { category: 'spacing', token: 'icon-lg', value: '18px', usedFor: 'lg buttons, section headers' },
    { category: 'spacing', token: 'icon-xl', value: '22px', usedFor: 'FAB, prominent affordances' },
    { category: 'spacing', token: 'icon-2xl', value: '32px', usedFor: 'Empty states, feature cards' },
    { category: 'spacing', token: 'icon gap', value: '6–8px', usedFor: 'Space between an icon and its label' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Decorative and wayfinding icons' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Interactive icons at rest' },
    { category: 'color', token: '--ds-fg', usedFor: 'Interactive icons on hover' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Active or selected state' },
  ],

  sizes: [
    { name: '13px', icon: '13px', gap: '6px', use: 'Inside 28px controls and badges. The floor — below this, strokes disappear.' },
    { name: '14px', icon: '14px', gap: '6px', use: 'Inside 32px controls, table cells, chips.' },
    { name: '16px', icon: '16px', gap: '8px', use: 'The default. 36px buttons, navigation rows, input adornments.' },
    { name: '18px', icon: '18px', gap: '8px', use: '44px buttons, section headers, list leading icons.' },
    { name: '22px', icon: '22px', gap: '12px', use: 'Floating action buttons, prominent affordances.' },
    { name: '32px+', icon: '32–48px', gap: '16px', use: 'Empty states and feature cards. Never inside a control.' },
  ],

  do: [
    {
      title: 'Pair an icon with a label unless the glyph is universal',
      why: 'Close, search, add, more and back are learned. Everything else is a guess, and a wrong guess on a destructive action is expensive.',
      render: (
        <Row gap="sm">
          <Button size="sm" variant="outlined" startIcon={<Archive />}>Archive</Button>
          <IconButton label="Close" icon={<X />} variant="text" />
        </Row>
      ),
    },
    {
      title: 'Mute decorative icons and brighten interactive ones',
      why: 'Colour separates "this is a signpost" from "this is a button". An icon at full foreground contrast reads as pressable whether it is or not.',
      render: (
        <Row gap="lg">
          <span className="inline-flex items-center gap-2 text-body-sm text-[var(--ds-fg-secondary)]">
            <Info size={15} className="text-[var(--ds-fg-muted)]" /> decorative
          </span>
          <span className="inline-flex items-center gap-2 text-body-sm text-[var(--ds-fg)]">
            <Pencil size={15} /> interactive
          </span>
        </Row>
      ),
    },
    {
      title: 'Keep one icon meaning one thing',
      why: 'If the pencil means "edit" on one screen and "annotate" on another, the user has to check every time. A one-to-one mapping is what makes the vocabulary work.',
      render: (
        <Stack gap="xs" className="text-caption text-[var(--ds-fg-secondary)]">
          <span className="inline-flex items-center gap-2"><Pencil size={13} /> Edit — everywhere</span>
          <span className="inline-flex items-center gap-2"><Trash2 size={13} /> Delete — everywhere</span>
          <span className="inline-flex items-center gap-2"><Archive size={13} /> Archive — everywhere</span>
        </Stack>
      ),
    },
    {
      title: 'Import icons by name',
      why: 'A namespace import of an icon library defeats tree-shaking and adds several hundred kilobytes of unused SVG to the entry bundle. This is the single most common bundle mistake in React apps.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">import {'{'} Save {'}'} from 'lucide-react'</span>
          <span className="text-[var(--ds-danger-text)]">import * as Icons from 'lucide-react'</span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not mix icon families',
      why: 'Different stroke weights and corner treatments sitting side by side read as a bug. Users cannot name it, but they perceive the product as less carefully made.',
      render: (
        <Row gap="md" align="center">
          <Settings size={20} strokeWidth={1.75} />
          <Settings size={20} strokeWidth={3} />
          <Settings size={20} strokeWidth={1} />
        </Row>
      ),
    },
    {
      title: 'Do not rely on a tooltip to explain an icon',
      why: 'Tooltips need hover, and hover does not exist on touch. On a phone an unlabelled ambiguous icon has no way at all to explain itself.',
      render: (
        <Row gap="sm">
          <IconButton label="?" icon={<Share2 />} variant="outlined" />
          <IconButton label="?" icon={<Upload />} variant="outlined" />
          <IconButton label="?" icon={<Download />} variant="outlined" />
        </Row>
      ),
    },
    {
      title: 'Do not scale a small icon up',
      why: 'A 16px glyph rendered at 40px has a stroke that is proportionally too thin and detail that was optimised away. Use the size the family provides.',
      render: (
        <Row gap="lg" align="center">
          <Bell size={40} strokeWidth={0.7} />
          <span className="text-caption text-[var(--ds-fg-muted)]">stroke lost at scale</span>
        </Row>
      ),
    },
    {
      title: 'Do not put an icon on every menu item',
      why: 'When everything has an icon, the icons stop distinguishing anything and the column of glyphs becomes noise. Icon the top three actions, or none.',
      render: (
        <Stack gap="xs" className="w-full text-caption text-[var(--ds-fg-secondary)]">
          {[Info, Bell, User, Settings, Archive].map((Icon, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <Icon size={13} className="text-[var(--ds-fg-muted)]" /> Menu item {i + 1}
            </span>
          ))}
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.5.3', name: 'Label in Name', level: 'A' },
    ],
    contrast: [
      'A meaningful icon must reach 3:1 against its background — it counts as a non-text graphic under WCAG 1.4.11.',
      'Purely decorative icons are exempt, but if you cannot say confidently that removing it loses no information, it is not decorative.',
      'Thin strokes at small sizes effectively reduce contrast. At 13px, use --ds-fg-secondary rather than --ds-fg-muted.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches icon buttons in DOM order. A decorative icon is never focusable.' },
      { keys: 'Enter / Space', does: 'Activates an icon button exactly like any other button.' },
    ],
    aria: [
      { attr: 'aria-hidden="true"', on: 'Decorative icons', note: 'Any icon beside a text label. Without it, screen readers may announce a filename or an unhelpful title.' },
      { attr: 'aria-label', on: 'Icon-only buttons', note: 'Required. The button has no other accessible name and announces as "button".' },
      { attr: 'role="img" + aria-label', on: 'A standalone meaningful icon', note: 'For a status glyph that is not inside a control but does carry information.' },
      { attr: 'focusable="false"', on: '<svg>', note: 'Internet Explorer legacy, still worth setting — some tooling makes inline SVG focusable by default.' },
    ],
    focus:
      'Icon buttons take the standard focus ring. Because they are square and small, the 2px offset matters more than usual — a flush ring on a 32px square is hard to see.',
    screenReader: [
      'The visible label and the accessible name must match. Voice-control users say what they see, so an aria-label of "Remove item" on a button labelled "Delete" is unusable for them.',
      'Never use an emoji as a UI icon. Screen readers read the full Unicode name, which is verbose and often absurd in context.',
      'Icon fonts are announced as random characters when the font fails to load. Use SVG.',
    ],
    touch:
      'A 16px icon inside a 36px button still needs a 44px pointer target. Our IconButton pads the hit area on coarse pointers without changing the visual size.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Named imports only — a namespace import kills tree-shaking
import { Save, Trash2, Search } from 'lucide-react'

// Decorative: hidden from assistive tech
<span className="inline-flex items-center gap-2">
  <Save size={16} aria-hidden />
  Save changes
</span>

// Icon-only: aria-label is mandatory
<IconButton label="Delete project" icon={<Trash2 />} />

// Standalone meaningful icon
<Check size={16} role="img" aria-label="Verified" className="text-success-text" />

// Sizing scales sub-linearly with the control
const ICON_FOR = { xs: 13, sm: 14, md: 16, lg: 18 } as const
<Icon size={ICON_FOR[size]} />

// A custom glyph must match the family: 24 viewBox, 1.75 stroke, round caps
export function Custom({ size = 16, ...props }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden focusable="false" {...props}
    >
      <path d="M4 12h16M12 4v16" />
    </svg>
  )
}`,
    },
    css: {
      lang: 'css',
      code: `/* Icons inherit colour, so one rule themes every glyph */
.icon { stroke: currentColor; fill: none; }

/* Optical alignment: match the cap height, not the line box */
.label-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1;          /* stops the line box dragging the icon down */
}

/* Asymmetric glyphs need a nudge inside a circular button */
.btn--play .icon { transform: translateX(1px); }

/* Never let an icon shrink in a flex row */
.icon { flex-shrink: 0; }

/* Spin at a constant rate — a spinner is mechanical, not organic */
@keyframes spin { to { transform: rotate(360deg) } }
.icon--loading { animation: spin 720ms linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .icon--loading { animation-duration: 2s; }
}`,
    },
  },

  notes: {
    tips: [
      'Keep a single file that maps every icon in the product to its one meaning. It is the cheapest way to stop the pencil from becoming three different actions.',
      'When you need a glyph the family lacks, draw it on the same 24px grid at the same stroke rather than importing a second library for one icon.',
      'Icons in a vertical list should share a fixed-width column, so the labels align even when the glyphs have different widths.',
      'For directional icons, mirror them in RTL locales — but never mirror a clock, a play button, or anything containing text.',
    ],
    performance: [
      'Inline SVG components are tree-shakeable and themeable with currentColor. An SVG sprite is smaller for very large sets but loses per-icon code splitting.',
      'Icon fonts should not be used at all: they block rendering, break in high-contrast mode, and announce as garbage characters if the font fails.',
      'A component library that imports every icon at the top level ships all of them. Verify with a bundle analyser — this mistake is invisible in development.',
      'For a list of 500 rows each with three icons, render the SVG once with <use> references rather than 1,500 inline SVG nodes.',
    ],
    mistakes: [
      'Forgetting aria-hidden on a decorative icon, so a screen reader announces it before every label.',
      'Using the same glyph for "remove from list" and "delete permanently". One is reversible; the user cannot tell which.',
      'Setting stroke-width in absolute pixels, so 13px icons look heavy and 32px icons look weak.',
      'Letting an icon shrink in a flex container because flex-shrink was not set to 0 — the glyph squashes and the whole row looks broken.',
    ],
    realWorld: [
      'Test unfamiliar icons by showing five people the glyph alone and asking what it does. Under four correct answers means it needs a label.',
      'Icon-only toolbars are appropriate for tools used daily for hours. They are wrong for anything used weekly, and they are always wrong for destructive actions.',
      'When adding a new icon, check whether an existing one already carries that meaning. Most icon sprawl comes from not looking first.',
      'In localised products, remember that icon conventions are not universal. A shopping trolley, an envelope and a thumbs-up all vary in meaning by region.',
    ],
  },
})
