/* ===========================================================================
   PHANSORA — DESIGN SHEETS, SECOND EDITION (October 2026)

   Two sheets, the dashboard and the public website, each as Phansora's own
   design sheets compute it (phansora/styleguide/dashboard.html and
   index.html). Every literal on the two Phansora pages comes from here and
   nowhere else: the sheets draw their swatches from these, and re-theme this
   system's own components with them (see `scope` below).

   The dashboard is this Bible's dark theme with Sonora's surfaces and a
   neutral accent. The website is navy, brand blue and gold, and stands on
   three grounds: navy product pages, black articles, the grey home page.
   ======================================================================== */

export type SheetId = 'dashboard' | 'website'

/** A swatch. `fill` is a chip of the color; the rest are drawn over a level-1 card, as they are used. */
export interface Swatch {
  name: string
  value: string
  kind?: 'fill' | 'line' | 'layer' | 'ring'
}

export interface SwatchRow {
  label: string
  swatches: Swatch[]
}

/** One step of the type scale, at the size it ships. */
export interface TypeStep {
  name: string
  size: number
  line: number
  weight: number
  /** CSS letter-spacing, when the step sets one. */
  tracking?: string
  upper?: boolean
  serif?: boolean
  color: string
  sample: string
}

/** What a button's fill, label and edge are. */
export interface ButtonLook {
  bg: string
  fg: string
  border: string
}

/**
 * One of Phansora's buttons: Suno's pill, in Phansora's fills. Hover lays `wash` over the
 * fill and a press holds `press`; neither changes the fill itself. Disabled gives the
 * recipe up for a flat look of its own.
 */
export interface ButtonVariant {
  label: string
  rest: ButtonLook
  wash: string
  press: string
  /** The label under the pointer, for the quiet variants that brighten into it. */
  hoverFg?: string
  disabled: ButtonLook
  /** The ground the variant is used on, when it is not the page. */
  band?: string
}

export interface Level {
  name: string
  value: string
  use: string
  /** The shadow a surface at this level wears, by name. */
  shadow?: string
}

/** dialog.js's alert and confirm, per status: the icon's ring, the icon, the action's fill and label. */
export interface AlertTone {
  ring: string
  icon: string
  button: string
  label: string
}

export interface SheetData {
  id: SheetId
  title: string
  tagline: string
  /** The sheet's own accent: the numbers, the page's two lights, the scale. */
  accent: string
  colors: SwatchRow[]
  type: TypeStep[]
  buttons: Record<string, ButtonVariant>
  levels: Level[]
  shadows: { name: string; value: string }[]
  radii: number[]
  alerts: Partial<Record<'info' | 'success' | 'warning' | 'error', AlertTone>>
  /** Body and secondary text, and the surface they are measured on. */
  contrast: { body: string; muted: string; on: string; label: [string, string] }
}

/** Tailwind's 4px step, as both products use it. */
export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64]
/** Tailwind's breakpoints, as both products use them. */
export const BREAKPOINTS = [
  { name: 'sm', px: 640 },
  { name: 'md', px: 768 },
  { name: 'lg', px: 1024 },
  { name: 'xl', px: 1280 },
  { name: '2xl', px: 1536 },
]
/** The same 13px floor on both sides. */
export const TYPE_FLOOR = 13

const clear = 'rgb(0 0 0 / 0)'

/* The washes, Suno's: white over a clear or dark button, black over a filled one. */
const onClear = { wash: 'rgb(255 255 255 / 0.04)', press: 'rgb(255 255 255 / 0.08)' }
const onFill = { wash: 'rgb(0 0 0 / 0.04)', press: 'rgb(0 0 0 / 0.08)' }
const onDanger = { wash: 'rgb(217 111 111 / 0.14)', press: 'rgb(217 111 111 / 0.14)' }

/* Disabled: a filled button keeps the control-disabled fill (--elev-2), a clear one almost
   none; both labels go to the inactive grey (--color-surface-500). */
const dashOff = { filled: { bg: '#252529', fg: '#7a7a7a', border: clear }, clear: { bg: 'rgb(37 37 41 / 0.1)', fg: '#7a7a7a', border: clear } }
const siteOff = { filled: { bg: '#191f2e', fg: '#7e7a6d', border: clear }, clear: { bg: 'rgb(25 31 46 / 0.1)', fg: '#7e7a6d', border: clear } }

/* -- The dashboard -------------------------------------------------------- */

export const DASHBOARD: SheetData = {
  id: 'dashboard',
  title: 'Dashboard Design System',
  tagline: 'The shared components of every dashboard page: monochrome, with one brand hue.',
  accent: '#8b6eeb',

  colors: [
    {
      label: 'Surfaces',
      swatches: [
        { name: 'Background', value: '#101012' },
        { name: 'Surface 1', value: '#1c1c1f' },
        { name: 'Surface 2', value: '#252529' },
        { name: 'Surface 3', value: '#2e2e33' },
        { name: 'Field', value: '#38383e' },
        { name: 'Well', value: '#181818' },
      ],
    },
    {
      label: 'Brand',
      swatches: [
        { name: 'Primary', value: '#e5e4e3' },
        { name: 'Secondary', value: '#4fbf9f' },
        { name: 'Brand', value: '#8b6eeb' },
      ],
    },
    {
      label: 'Status',
      swatches: [
        { name: 'Success', value: '#6fd6b8' },
        { name: 'Warning', value: '#e6c76a' },
        { name: 'Error', value: '#e98787' },
        { name: 'Info', value: '#8fb8d8' },
        { name: 'Credits', value: '#d5b653' },
        { name: 'Destructive', value: '#e98787', kind: 'ring' },
      ],
    },
    {
      label: 'Text',
      swatches: [
        { name: 'Text primary', value: '#e5e4e3' },
        { name: 'Text secondary', value: '#b6b6b6' },
        { name: 'Text muted', value: '#aaaaaa' },
        { name: 'Disabled', value: '#7a7a7a' },
        { name: 'Focus ring', value: '#e5e4e3', kind: 'ring' },
      ],
    },
    {
      label: 'Lines & layers',
      swatches: [
        { name: 'Border', value: 'rgb(255 255 255 / 0.115)', kind: 'line' },
        { name: 'Strong border', value: 'rgb(255 255 255 / 0.19)', kind: 'line' },
        { name: 'Hover', value: 'rgb(255 255 255 / 0.045)', kind: 'layer' },
        { name: 'Selected', value: 'rgb(255 255 255 / 0.1)', kind: 'layer' },
        { name: 'Scrim', value: 'rgb(0 0 0 / 0.72)', kind: 'layer' },
      ],
    },
  ],

  type: [
    { name: 'H1', size: 40, line: 56, weight: 300, color: '#e5e4e3', sample: 'Atlas' },
    { name: 'H2', size: 24, line: 32, weight: 500, tracking: '-0.6px', color: '#e5e4e3', sample: 'Upgrade your plan' },
    { name: 'H3', size: 18, line: 24, weight: 600, color: '#e5e4e3', sample: 'Recent Activity' },
    { name: 'H4', size: 16, line: 24, weight: 500, color: '#e5e4e3', sample: 'Text to Speech' },
    { name: 'Body', size: 16, line: 24, weight: 400, color: '#e5e4e3', sample: 'Paste your text, pick a voice and generate.' },
    { name: 'Interface', size: 15, line: 21, weight: 400, color: '#e5e4e3', sample: 'Narrava Studio' },
    { name: 'Label', size: 15, line: 24, weight: 500, color: '#e5e4e3', sample: 'Story title' },
    { name: 'Small', size: 14, line: 20, weight: 400, color: '#b6b6b6', sample: 'Your latest generations across all products.' },
    { name: 'Eyebrow', size: 13, line: 16, weight: 500, tracking: '1.17px', upper: true, color: '#b6b6b6', sample: 'Credits remaining' },
    { name: 'Caption', size: 13, line: 16, weight: 400, color: '#aaaaaa', sample: 'Shown in the header and on exports.' },
  ],

  buttons: {
    primary: { label: 'Primary', rest: { bg: '#e5e4e3', fg: '#101012', border: clear }, ...onFill, disabled: dashOff.filled },
    secondary: { label: 'Secondary', rest: { bg: '#4fbf9f', fg: '#101012', border: clear }, ...onFill, disabled: dashOff.filled },
    neutral: { label: 'Neutral', rest: { bg: clear, fg: '#e5e4e3', border: 'rgb(255 255 255 / 0.19)' }, ...onClear, disabled: dashOff.clear },
    quiet: { label: 'Quiet', rest: { bg: clear, fg: '#aaaaaa', border: clear }, ...onClear, hoverFg: '#ffffff', disabled: dashOff.clear },
    success: { label: 'Success', rest: { bg: '#4fbf9f', fg: '#101012', border: clear }, ...onFill, disabled: dashOff.filled },
    danger: { label: 'Danger', rest: { bg: clear, fg: '#e98787', border: 'rgb(217 111 111 / 0.36)' }, ...onDanger, disabled: dashOff.clear },
    dangerText: { label: 'Danger text', rest: { bg: clear, fg: '#aaaaaa', border: clear }, ...onDanger, hoverFg: '#e98787', disabled: dashOff.clear },
    brand: { label: 'Brand', rest: { bg: '#8b6eeb', fg: '#ffffff', border: clear }, ...onFill, disabled: dashOff.filled },
  },

  levels: [
    { name: 'Base 0', value: '#101012', use: 'The page, the sidebar' },
    { name: 'Level 1', value: '#1c1c1f', use: 'Cards and panels', shadow: 'shadow-e1' },
    { name: 'Level 2', value: '#252529', use: 'Lifted cards, dialogs', shadow: 'shadow-e2' },
    { name: 'Level 3', value: '#2e2e33', use: 'Menus, boxes on a dialog', shadow: 'shadow-2xl' },
    { name: 'Level 4', value: '#38383e', use: 'Fields, above every surface' },
    { name: 'Well', value: '#181818', use: 'A track cut into a surface' },
  ],
  shadows: [
    { name: 'shadow-e1', value: '0 1px 2px rgb(0 0 0 / 0.40), 0 4px 10px rgb(0 0 0 / 0.28)' },
    { name: 'shadow-e2', value: '0 2px 4px rgb(0 0 0 / 0.45), 0 8px 20px rgb(0 0 0 / 0.34)' },
    { name: 'shadow-2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
  ],
  radii: [4, 6, 8, 12, 16, 9999],

  alerts: {
    info: { ring: 'rgb(143 184 216 / 0.25)', icon: '#8fb8d8', button: '#8fb8d8', label: '#101012' },
    success: { ring: 'rgb(79 191 159 / 0.25)', icon: '#6fd6b8', button: '#4fbf9f', label: '#101012' },
    warning: { ring: 'rgb(213 182 83 / 0.25)', icon: '#e6c76a', button: '#d5b653', label: '#101012' },
    error: { ring: 'rgb(217 111 111 / 0.25)', icon: '#e98787', button: '#d96f6f', label: '#101012' },
  },

  contrast: { body: '#e5e4e3', muted: '#b6b6b6', on: '#1c1c1f', label: ['Text', 'secondary'] },
}

/* -- The website ---------------------------------------------------------- */

export const WEBSITE: SheetData = {
  id: 'website',
  title: 'Website Design System',
  tagline: 'What the public site ships: brand blue for the action, gold for signing in, cream on navy.',
  accent: '#b3c0ff',

  colors: [
    {
      label: 'Surfaces',
      swatches: [
        { name: 'Background', value: '#050b1a' },
        { name: 'Surface 1', value: '#121826' },
        { name: 'Surface 2', value: '#191f2e' },
        { name: 'Surface 3', value: '#202636' },
        { name: 'Header & footer', value: '#2b3566' },
      ],
    },
    {
      label: 'Brand',
      swatches: [
        { name: 'Primary', value: '#4b4ef0' },
        { name: 'Brand', value: '#5b62e0' },
        { name: 'Gold', value: '#e3bf6e' },
        { name: 'Light', value: '#f4f0e8' },
      ],
    },
    {
      label: 'Status',
      swatches: [
        { name: 'Success', value: '#00d492' },
        { name: 'Warning', value: '#ecd190' },
        { name: 'Error', value: '#ffa1ad' },
        { name: 'Info', value: '#9eace8' },
      ],
    },
    {
      label: 'Text',
      swatches: [
        { name: 'Text primary', value: '#f4f0e8' },
        { name: 'Text body', value: '#c7c1b2' },
        { name: 'Text muted', value: '#b9b3a3' },
        { name: 'Link', value: '#9eace8' },
        { name: 'Focus ring', value: '#b3c0ff', kind: 'ring' },
      ],
    },
    {
      label: 'Lines & layers',
      swatches: [
        { name: 'Border', value: 'rgb(255 255 255 / 0.102)', kind: 'line' },
        { name: 'Strong border', value: 'rgb(255 255 255 / 0.18)', kind: 'line' },
        { name: 'Hover', value: 'rgb(255 255 255 / 0.051)', kind: 'layer' },
        { name: 'Selected', value: 'rgb(91 98 224 / 0.2)', kind: 'layer' },
        { name: 'Scrim', value: 'rgb(6 8 15 / 0.702)', kind: 'layer' },
      ],
    },
  ],

  type: [
    { name: 'Display', size: 72, line: 72, weight: 500, tracking: '-0.96px', color: '#f4f0e8', sample: 'Atlas' },
    { name: 'Serif', size: 48, line: 48, weight: 300, tracking: '-1.2px', serif: true, color: '#f4f0e8', sample: 'Origin' },
    { name: 'H1', size: 40, line: 56, weight: 300, color: '#f4f0e8', sample: 'Welcome' },
    { name: 'H2', size: 24, line: 32, weight: 500, tracking: '-0.6px', color: '#f4f0e8', sample: 'Built for research' },
    { name: 'H3', size: 18, line: 24, weight: 600, color: '#f4f0e8', sample: 'Research Atlas' },
    { name: 'H4', size: 16, line: 24, weight: 500, color: '#f4f0e8', sample: 'Add every source' },
    { name: 'Lead', size: 17, line: 26, weight: 400, color: '#c7c1b2', sample: 'Many sources, one dossier.' },
    { name: 'Body', size: 16, line: 24, weight: 400, color: '#c7c1b2', sample: 'No more switching tabs or losing a quote.' },
    { name: 'Small', size: 14, line: 20, weight: 400, color: '#b9b3a3', sample: 'Upload PDFs, DOCX and audio.' },
    { name: 'Eyebrow', size: 13, line: 16, weight: 500, tracking: '1.17px', upper: true, color: '#9eace8', sample: 'How it works' },
    { name: 'Caption', size: 13, line: 16, weight: 400, color: '#b9b3a3', sample: 'Free to try · Source-attributed' },
  ],

  buttons: {
    primary: { label: 'Primary', rest: { bg: '#4b4ef0', fg: '#ffffff', border: clear }, ...onFill, disabled: siteOff.filled },
    gold: { label: 'Gold', rest: { bg: '#e3bf6e', fg: '#050b1a', border: clear }, ...onFill, disabled: siteOff.filled },
    light: { label: 'Light', rest: { bg: '#f4f0e8', fg: '#050b1a', border: clear }, ...onFill, disabled: siteOff.filled },
    neutral: { label: 'Neutral', rest: { bg: clear, fg: '#f4f0e8', border: '#3a4150' }, ...onClear, disabled: siteOff.clear },
    band: {
      label: 'On a band',
      rest: { bg: clear, fg: '#ffffff', border: 'rgb(255 255 255 / 0.3)' },
      ...onClear,
      disabled: siteOff.clear,
      band: 'linear-gradient(to right, #2b3566, #313d7d)',
    },
  },

  levels: [
    { name: 'Base 0', value: '#050b1a', use: 'Page background' },
    { name: 'Level 1', value: '#121826', use: 'Cards, the sign-in panel', shadow: 'shadow-e1' },
    { name: 'Level 2', value: '#191f2e', use: 'Fields, striped rows' },
    { name: 'Level 3', value: '#202636', use: 'A row under the pointer' },
  ],
  shadows: [{ name: 'shadow-e1', value: '0 1px 2px rgb(0 0 0 / 0.4), 0 4px 10px rgb(0 0 0 / 0.28)' }],
  radii: [4, 8, 12, 16, 24, 9999],

  alerts: {
    success: { ring: 'rgb(0 212 146 / 0.25)', icon: '#00d492', button: '#008358', label: '#ffffff' },
    warning: { ring: 'rgb(227 191 110 / 0.25)', icon: '#e8c87e', button: '#cfa754', label: '#050b1a' },
    error: { ring: 'rgb(255 161 173 / 0.25)', icon: '#ffa1ad', button: '#a0626a', label: '#ffffff' },
  },

  contrast: { body: '#c7c1b2', muted: '#b9b3a3', on: '#050b1a', label: ['Body text', 'muted'] },
}

export const SHEETS: Record<SheetId, SheetData> = { dashboard: DASHBOARD, website: WEBSITE }

/* ---------------------------------------------------------------------------
   The scopes. Set on a wrapper, these re-theme every --ds-* component inside
   it as Phansora. Each sets every token the Bible's components read, so a
   sheet looks the same whichever theme the Bible itself is in. A token here
   must be set to a literal — a var() written at :root was resolved there, so
   overriding what it pointed at changes nothing below it.
   ------------------------------------------------------------------------ */

type Scope = Record<`--${string}`, string>

interface ScopeValues {
  canvas: string
  surface: string
  raised: string
  overlay: string
  inset: string
  field: string
  fieldHover: string
  hover: string
  active: string
  selected: string
  scrim: string
  borderSubtle: string
  border: string
  borderStrong: string
  borderInteractive: string
  fg: string
  fgSecondary: string
  fgMuted: string
  fgDisabled: string
  fgInverse: string
  primary: string
  primaryFg: string
  accent: string
  accentHover: string
  accentActive: string
  accentFg: string
  accentText: string
  accentSubtle: string
  accentBorder: string
  focusRing: string
  status: Record<'success' | 'warning' | 'danger' | 'info', { fill: string; text: string; fg: string; rgb: string }>
}

function buildScope(v: ScopeValues): Scope {
  const out: Scope = {
    '--ds-canvas': v.canvas,
    '--ds-surface': v.surface,
    '--ds-surface-raised': v.raised,
    '--ds-surface-overlay': v.overlay,
    '--ds-surface-inset': v.inset,
    '--ds-field': v.field,
    '--ds-field-hover': v.fieldHover,
    '--ds-layer-hover': v.hover,
    '--ds-layer-active': v.active,
    '--ds-layer-selected': v.selected,
    '--ds-layer-scrim': v.scrim,
    '--ds-border-subtle': v.borderSubtle,
    '--ds-border': v.border,
    '--ds-border-strong': v.borderStrong,
    '--ds-border-interactive': v.borderInteractive,
    '--ds-fg': v.fg,
    '--ds-fg-secondary': v.fgSecondary,
    '--ds-fg-muted': v.fgMuted,
    '--ds-fg-disabled': v.fgDisabled,
    '--ds-fg-inverse': v.fgInverse,
    '--ds-btn-primary': v.primary,
    '--ds-btn-primary-fg': v.primaryFg,
    '--ds-btn-wash-inverse': 'rgb(0 0 0 / 0.08)',
    '--ds-btn-quiet': 'rgb(255 255 255 / 0.09)',
    '--ds-btn-disabled': 'rgb(255 255 255 / 0.065)',
    '--ds-accent': v.accent,
    '--ds-accent-hover': v.accentHover,
    '--ds-accent-active': v.accentActive,
    '--ds-accent-fg': v.accentFg,
    '--ds-accent-text': v.accentText,
    '--ds-accent-subtle': v.accentSubtle,
    '--ds-accent-border': v.accentBorder,
    '--ds-focus-ring': v.focusRing,
    '--ds-focus-ring-offset': v.canvas,
  }
  for (const [tone, s] of Object.entries(v.status)) {
    out[`--ds-${tone}`] = s.fill
    out[`--ds-${tone}-hover`] = s.text
    out[`--ds-${tone}-fg`] = s.fg
    out[`--ds-${tone}-text`] = s.text
    out[`--ds-${tone}-subtle`] = `rgb(${s.rgb} / 0.14)`
    out[`--ds-${tone}-border`] = `rgb(${s.rgb} / 0.34)`
  }
  return out
}

export const dashboardScope: Scope = buildScope({
  canvas: '#101012',
  surface: '#1c1c1f',
  raised: '#252529',
  // A dashboard dialog is level 2, like a lifted card; its menus are level 3.
  overlay: '#252529',
  inset: '#181818',
  field: '#38383e',
  fieldHover: '#3d3d43',
  hover: 'rgb(255 255 255 / 0.045)',
  active: 'rgb(255 255 255 / 0.075)',
  selected: 'rgb(255 255 255 / 0.1)',
  scrim: 'rgb(0 0 0 / 0.72)',
  borderSubtle: 'rgb(255 255 255 / 0.063)',
  border: 'rgb(255 255 255 / 0.115)',
  borderStrong: 'rgb(255 255 255 / 0.19)',
  borderInteractive: 'rgb(255 255 255 / 0.19)',
  fg: '#e5e4e3',
  fgSecondary: '#b6b6b6',
  fgMuted: '#aaaaaa',
  fgDisabled: '#7a7a7a',
  fgInverse: '#101012',
  primary: '#e5e4e3',
  primaryFg: '#101012',
  // The accent, made neutral: the same light grey as the primary button.
  accent: '#e5e4e3',
  accentHover: '#ffffff',
  accentActive: '#c8c8c8',
  accentFg: '#101012',
  accentText: '#e5e4e3',
  accentSubtle: 'rgb(255 255 255 / 0.1)',
  accentBorder: 'rgb(255 255 255 / 0.19)',
  focusRing: '#e5e4e3',
  status: {
    success: { fill: '#4fbf9f', text: '#6fd6b8', fg: '#101012', rgb: '79 191 159' },
    warning: { fill: '#d5b653', text: '#e6c76a', fg: '#101012', rgb: '213 182 83' },
    danger: { fill: '#d96f6f', text: '#e98787', fg: '#101012', rgb: '217 111 111' },
    info: { fill: '#8fb8d8', text: '#8fb8d8', fg: '#101012', rgb: '143 184 216' },
  },
})

export const websiteScope: Scope = buildScope({
  canvas: '#050b1a',
  surface: '#121826',
  raised: '#191f2e',
  overlay: '#191f2e',
  inset: '#050b1a',
  field: '#191f2e',
  fieldHover: '#202636',
  hover: 'rgb(255 255 255 / 0.051)',
  active: 'rgb(255 255 255 / 0.08)',
  selected: 'rgb(91 98 224 / 0.2)',
  scrim: 'rgb(6 8 15 / 0.702)',
  borderSubtle: 'rgb(255 255 255 / 0.06)',
  border: 'rgb(255 255 255 / 0.102)',
  borderStrong: 'rgb(255 255 255 / 0.18)',
  borderInteractive: '#3a4150',
  fg: '#f4f0e8',
  fgSecondary: '#c7c1b2',
  fgMuted: '#b9b3a3',
  fgDisabled: '#7e7a6d',
  fgInverse: '#050b1a',
  primary: '#4b4ef0',
  primaryFg: '#ffffff',
  accent: '#5b62e0',
  accentHover: '#4b4ef0',
  accentActive: '#383da8',
  accentFg: '#ffffff',
  accentText: '#9eace8',
  accentSubtle: 'rgb(91 98 224 / 0.15)',
  accentBorder: '#5b62e0',
  focusRing: '#b3c0ff',
  status: {
    success: { fill: '#008358', text: '#00d492', fg: '#ffffff', rgb: '0 212 146' },
    warning: { fill: '#cfa754', text: '#ecd190', fg: '#050b1a', rgb: '236 209 144' },
    danger: { fill: '#a0626a', text: '#ffa1ad', fg: '#ffffff', rgb: '255 161 173' },
    info: { fill: '#9eace8', text: '#9eace8', fg: '#050b1a', rgb: '158 172 232' },
  },
})

/** The site's two other grounds, set over the navy one: one class on <body> rebinds the ladder and the type. */
export const interiorScope: Scope = {
  '--ds-canvas': '#000000',
  '--ds-surface': '#101315',
  '--ds-surface-raised': '#161819',
  '--ds-field': '#161819',
  '--ds-fg': '#f1f1f1',
  '--ds-fg-secondary': '#b8bcc0',
  '--ds-fg-muted': '#959ba1',
}

export const homeScope: Scope = {
  '--ds-canvas': '#101012',
  '--ds-surface': '#19191b',
  '--ds-surface-raised': '#202023',
  '--ds-field': '#19191b',
  '--ds-fg': '#f1f1f1',
  '--ds-fg-secondary': '#b8bcc0',
  '--ds-fg-muted': '#959ba1',
  '--ds-accent': '#f4f4f5',
  '--ds-accent-text': '#f4f4f5',
}

/** The home page wears grey: blue and gold both become this one light fill. */
export const HOME_FILL: ButtonVariant = {
  label: 'Home',
  rest: { bg: '#f4f4f5', fg: '#0a0a0b', border: clear },
  ...onFill,
  disabled: { bg: '#202023', fg: '#7f868c', border: clear },
}

/** One accent for one demo: the switch's Secondary, the tab's Brand. */
export const accentScope = (fill: string, text = fill): Scope => ({
  '--ds-accent': fill,
  '--ds-accent-text': text,
})

/** The values a page reads that are Phansora's own rather than a --ds-* slot. */
export const PH = {
  dashboard: {
    secondary: '#4fbf9f',
    onFill: '#101012',
    /** primary-700, where the sidebar's call to action starts its gradient. */
    ctaFrom: '#c8c8c8',
    brand: '#8b6eeb',
    brandText: '#b9a7f5',
    credit: '#d5b653',
    elev3: '#2e2e33',
    selectedEdge: 'rgb(139 110 235 / 0.85)',
    selectedWash: 'rgb(139 110 235 / 0.14)',
    premiumEdge: '#e5e4e3',
    premiumRing: 'rgb(229 228 227 / 0.4)',
  },
  website: {
    header: '#2b3566',
    band: 'linear-gradient(to right, #2b3566, #313d7d)',
    gold: '#e3bf6e',
    goldHover: '#e8c87e',
    link: '#9eace8',
    brand: '#5b62e0',
    emerald: '#00d492',
    error: '#ffa1ad',
    errorEdge: '#ff637e',
    chipEdge: '#3a4150',
    chipCheckedEdge: '#c2cbf0',
  },
}
