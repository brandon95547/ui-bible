/* ===========================================================================
   PHANSORA — DESIGN SHEET, FIRST EDITION (October 2026)

   The dashboard's values, as phansora/assets/css/dashboard-theme.css defines
   them. Every literal on the Phansora page comes from here and nowhere else:
   the sheet draws its swatches from these, and re-themes this system's own
   components with them (see `scope` below).

   Phansora's dashboard theme is this Bible's dark theme with two changes —
   Sonora's surfaces, and a neutral accent in place of the purple — so most of
   it maps onto --ds-* one to one. What does not map is Phansora's own: the
   emerald secondary, the brand violet, the credit amber, the premium edge.
   ======================================================================== */

export interface SheetState {
  label: string
  value: string
}

export interface SheetColor {
  name: string
  /** The fill. */
  value: string
  /** What is written on the fill. */
  ink: string
  /** The product's own names for it, as a reader of its code would search. */
  token: string
  use: string
  states: SheetState[]
}

export interface SheetInk {
  name: string
  value: string
  token: string
  sample: string
}

export interface SheetStatus {
  name: string
  sample: string
  text: string
  fill: string
  token: string
}

export interface SheetLayer {
  name: string
  value: string
  token: string
  /** A line is drawn as an edge; a layer as a fill over a level-1 card. */
  kind: 'line' | 'layer'
}

export interface SheetRung {
  level: number
  name: string
  use: string
  value: string
  token: string
}

/** dialog.js's alert and confirm, per status: the icon's ring, the icon, the action's fill. */
export interface SheetAlertTone {
  ring: string
  icon: string
  button: string
}

export interface SheetPlan {
  name: string
  price: number
  credits: number
  recommended: boolean
  perks: string[]
}

export interface DesignSheetData {
  name: string
  edition: string
  core: SheetColor[]
  text: SheetInk[]
  status: SheetStatus[]
  lines: SheetLayer[]
  elevation: SheetRung[]
  well: { value: string; token: string }
  fieldHover: string
  special: {
    premiumEdge: string
    premiumRing: string
    selectedEdge: string
    selectedWash: string
    creditMark: string
    dangerEdge: string
    dangerWash: string
    dangerText: string
  }
  alerts: Record<'info' | 'success' | 'warning' | 'error', SheetAlertTone>
  plans: SheetPlan[]
  planFeatures: string[]
}

export const PHANSORA: DesignSheetData = {
  name: 'Phansora',
  edition: 'First edition · October 2026',

  core: [
    {
      name: 'Primary',
      value: '#e5e4e3',
      ink: '#101012',
      token: '--mono-accent · primary-500',
      use: "The primary button, the selected pill, the sidebar's call to action. One per view.",
      states: [
        { label: 'Hover', value: '#ffffff' },
        { label: 'Pressed', value: '#c8c8c8' },
        { label: 'On primary', value: '#101012' },
      ],
    },
    {
      name: 'Secondary',
      value: '#4fbf9f',
      ink: '#101012',
      token: '--ui-fill-success · emerald-400',
      use: 'The secondary button (Recharge), a switch that is on, a finished state.',
      states: [
        { label: 'Hover', value: '#6fd6b8' },
        { label: 'On secondary', value: '#101012' },
      ],
    },
    {
      name: 'Brand',
      value: '#8b6eeb',
      ink: '#ffffff',
      token: '--color-violet-500',
      use: "The current tab's underline, a selected card in the studios, the home page's glow.",
      states: [
        { label: 'Hover', value: '#9d85ef' },
        { label: 'Pressed', value: '#7b5fe2' },
        { label: 'As text', value: '#b9a7f5' },
      ],
    },
    {
      name: 'Background',
      value: '#101012',
      ink: '#e5e4e3',
      token: '--elev-0 · surface-950',
      use: 'The page and the sidebar. Everything else stands on it — see Surfaces.',
      states: [{ label: 'On background', value: '#e5e4e3' }],
    },
  ],

  text: [
    { name: 'Primary', value: '#e5e4e3', token: 'text-surface-100', sample: 'Headings and body' },
    { name: 'Secondary', value: '#b6b6b6', token: 'text-surface-200', sample: 'Descriptions, labels' },
    { name: 'Muted', value: '#aaaaaa', token: 'text-surface-400', sample: 'Captions, placeholders' },
    { name: 'Disabled', value: '#7a7a7a', token: 'text-surface-500', sample: 'Disabled, separators' },
  ],

  status: [
    { name: 'Success', sample: 'Saved', text: '#6fd6b8', fill: '#4fbf9f', token: '--ui-color-success · --ui-fill-success' },
    { name: 'Warning', sample: 'Running low', text: '#e6c76a', fill: '#d5b653', token: '--ui-color-warning · --ui-fill-warning' },
    { name: 'Error', sample: 'Failed', text: '#e98787', fill: '#d96f6f', token: '--ui-color-error · --ui-fill-error' },
    { name: 'Info', sample: 'Processing', text: '#8fb8d8', fill: '#8fb8d8', token: '--ui-color-info' },
  ],

  lines: [
    { name: 'Border', value: 'rgb(255 255 255 / 0.115)', token: '--ui-border', kind: 'line' },
    { name: 'Strong border', value: 'rgb(255 255 255 / 0.19)', token: '--ui-border-strong', kind: 'line' },
    { name: 'Hover', value: 'rgb(255 255 255 / 0.045)', token: '--ui-layer-hover', kind: 'layer' },
    { name: 'Selected', value: 'rgb(255 255 255 / 0.10)', token: '--ui-layer-selected', kind: 'layer' },
    { name: 'Scrim', value: 'rgb(0 0 0 / 0.72)', token: '--ui-scrim', kind: 'layer' },
  ],

  elevation: [
    { level: 0, name: 'Page', use: 'The ground, and the sidebar', value: '#101012', token: '--elev-0' },
    { level: 1, name: 'Card', use: 'Panels and cards on the page', value: '#1c1c1f', token: '--elev-1' },
    { level: 2, name: 'Raised', use: 'Lifted cards, dialogs, drawers', value: '#252529', token: '--elev-2' },
    { level: 3, name: 'Overlay', use: 'Boxes on a dialog, menus', value: '#2e2e33', token: '--elev-3' },
    { level: 4, name: 'Field', use: 'Inputs and selects, above every surface', value: '#38383e', token: '--elev-4' },
  ],

  /** Outside the ladder: a track cut into a surface. */
  well: { value: '#181818', token: '--ui-well' },
  fieldHover: '#3d3d43',

  special: {
    /** The recommended plan's edge: primary-500 at full strength, and a 2px ring of it at 40%. */
    premiumEdge: '#e5e4e3',
    premiumRing: 'rgb(229 228 227 / 0.4)',
    selectedEdge: 'rgb(139 110 235 / 0.85)',
    selectedWash: 'rgb(139 110 235 / 0.14)',
    creditMark: '#d5b653',
    dangerEdge: 'rgb(217 111 111 / 0.36)',
    dangerWash: 'rgb(217 111 111 / 0.14)',
    dangerText: '#e98787',
  },

  alerts: {
    info: { ring: 'rgb(143 184 216 / 0.25)', icon: '#8fb8d8', button: '#8fb8d8' },
    success: { ring: 'rgb(79 191 159 / 0.25)', icon: '#6fd6b8', button: '#4fbf9f' },
    warning: { ring: 'rgb(213 182 83 / 0.25)', icon: '#e6c76a', button: '#d5b653' },
    error: { ring: 'rgb(217 111 111 / 0.25)', icon: '#e98787', button: '#d96f6f' },
  },

  /** As src/billing/plans.js defines them, for the upgrade dialog. */
  plans: [
    { name: 'Plus', price: 10, credits: 2000, recommended: false, perks: [] },
    { name: 'Pro', price: 30, credits: 12000, recommended: true, perks: ['5,000-character TTS input'] },
    { name: 'Enterprise', price: 65, credits: 26000, recommended: false, perks: ['5,000-character TTS input'] },
  ],
  planFeatures: ['Priority generation on our latest models', 'Commercial usage rights'],
}

/* ---------------------------------------------------------------------------
   The scope. Set on a wrapper, these re-theme every --ds-* component inside
   it as Phansora: its surfaces, its inks, its neutral accent and its softer
   status colors. A token here must be set to a literal — a var() written at
   :root was resolved there, so overriding what it pointed at changes nothing
   below it.

   Where one Phansora component takes a different accent from the rest — the
   switch is on in Secondary, the current tab is underlined in Brand — the
   sheet sets it again on that demo alone (accentScope).
   ------------------------------------------------------------------------ */

const P = PHANSORA

export const phansoraScope: Record<`--${string}`, string> = {
  '--ds-canvas': P.elevation[0].value,
  '--ds-surface': P.elevation[1].value,
  '--ds-surface-raised': P.elevation[2].value,
  // A Phansora dialog is level 2, like a lifted card; its menus are level 3.
  '--ds-surface-overlay': P.elevation[2].value,
  '--ds-surface-inset': P.well.value,
  '--ds-field': P.elevation[4].value,
  '--ds-field-hover': P.fieldHover,

  '--ds-layer-hover': P.lines[2].value,
  '--ds-layer-selected': P.lines[3].value,
  '--ds-layer-scrim': P.lines[4].value,
  '--ds-border': P.lines[0].value,
  '--ds-border-strong': P.lines[1].value,

  '--ds-fg': P.text[0].value,
  '--ds-fg-secondary': P.text[1].value,
  '--ds-fg-muted': P.text[2].value,
  '--ds-fg-disabled': P.text[3].value,
  '--ds-fg-inverse': P.core[0].ink,

  '--ds-btn-primary': P.core[0].value,
  '--ds-btn-primary-fg': P.core[0].ink,

  // The accent, made neutral: the same light grey as the primary button.
  '--ds-accent': P.core[0].value,
  '--ds-accent-hover': P.core[0].states[0].value,
  '--ds-accent-active': P.core[0].states[1].value,
  '--ds-accent-fg': P.core[0].ink,
  '--ds-accent-text': P.core[0].value,
  '--ds-accent-subtle': P.lines[3].value,
  '--ds-accent-border': P.lines[1].value,
  '--ds-focus-ring': P.core[0].value,
  '--ds-focus-ring-offset': P.elevation[0].value,

  '--ds-success': P.status[0].fill,
  '--ds-success-hover': P.status[0].text,
  '--ds-success-fg': P.core[0].ink,
  '--ds-success-text': P.status[0].text,
  '--ds-success-subtle': 'rgb(79 191 159 / 0.14)',
  '--ds-success-border': 'rgb(79 191 159 / 0.34)',

  '--ds-warning': P.status[1].fill,
  '--ds-warning-hover': P.status[1].text,
  '--ds-warning-fg': P.core[0].ink,
  '--ds-warning-text': P.status[1].text,
  '--ds-warning-subtle': 'rgb(213 182 83 / 0.14)',
  '--ds-warning-border': 'rgb(213 182 83 / 0.34)',

  '--ds-danger': P.status[2].fill,
  '--ds-danger-hover': '#e17b7b',
  '--ds-danger-fg': P.core[0].ink,
  '--ds-danger-text': P.status[2].text,
  '--ds-danger-subtle': P.special.dangerWash,
  '--ds-danger-border': P.special.dangerEdge,

  '--ds-info': P.status[3].fill,
  '--ds-info-hover': P.status[3].fill,
  '--ds-info-fg': P.core[0].ink,
  '--ds-info-text': P.status[3].text,
  '--ds-info-subtle': 'rgb(143 184 216 / 0.14)',
  '--ds-info-border': 'rgb(143 184 216 / 0.34)',

  // Phansora's own, read by the sheet's demos.
  '--ph-secondary': P.core[1].value,
  '--ph-secondary-hover': P.core[1].states[0].value,
  '--ph-on-fill': P.core[0].ink,
  '--ph-brand': P.core[2].value,
  '--ph-brand-text': P.core[2].states[2].value,
  '--ph-credit': P.special.creditMark,
  '--ph-elev-3': P.elevation[3].value,
}

/** One accent for one demo: the switch's Secondary, the tab's Brand. */
export const accentScope = (fill: string, text = fill): Record<`--${string}`, string> => ({
  '--ds-accent': fill,
  '--ds-accent-text': text,
})
