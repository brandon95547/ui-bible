
/* ===========================================================================
   A WEBSITE'S THEME, AS IT WAS FOUND

   A theme sheet answers one question: "what does this website actually look
   like, and how would I build something that looks like it". That is not the
   same data as a list of the colors a stylesheet offers.
   A stylesheet carries every color anyone on the team ever needed once — nine
   ramps, a promotional gradient, other companies' brand colors — and a sheet
   that lists them all describes the stylesheet, not the interface.

   So this shape is organized by JOB rather than by hue, and it has no slot for
   "the palette". There is a ladder of surfaces, the text and borders that go on
   them, the handful of status colors, the buttons — and then, separately and
   last, everything else the stylesheet contains.

   THREE RULES FOR FILLING ONE IN

   1. A value earns a role by being USED in it, not by existing. `accent-brand`
      being a pink does not make pink the primary color; the primary color is
      whatever the primary button is painted with. Every token therefore says
      what it was read from (`basis`).

   2. Say whether you saw it or decided it. `observed` means the value was read
      off a rendered component, or out of the component rule that paints one.
      `inferred` means the value is real but the role is our reading of it — the
      site has no "info" color, and we are calling its blue one. The sheet
      prints the difference on every row.

   3. Leave out what is not there. A site with three surface levels gets three.
      No field here is required to be full, and the page renders what it is
      given: a missing role is information, an invented one is a lie that looks
      like data.

   WHAT TO READ, IN ORDER

     · The rendered page, signed out if need be: body background and text, the
       navigation, a card, a button of each kind, a field, an open menu, an
       open dialog. `getComputedStyle` on each, pseudo-elements included —
       hover and selected layers usually live on `::after`.
     · The rules that paint those components, for the states you cannot hold
       (disabled, focus) and for the names of the tokens behind the values.
     · The token definitions, last, and only to name what you already found
       and to fill the raw section.

   Imagery is content. A hero photograph, cover art and user avatars say
   nothing about a theme, however much of the screen they fill.
   ======================================================================== */

/** Read off the interface, or our classification of something that was. */
export type Evidence = 'observed' | 'inferred'

export interface ThemeToken {
  /** Our name for the role — the same on every sheet, so sheets compare. */
  key: string
  /** The role in a word or two: "Primary", "Subtle". */
  label: string
  /** The site's own name for it, where it has one. */
  source?: string
  /** The primitive the site binds that name to: a step in one of its ramps. */
  ref?: string
  hex: string
  /** 0–1. Absent means opaque. Sites draw borders and layers in alpha. */
  alpha?: number
  /** What it is for, in a sentence a developer can act on. */
  purpose: string
  evidence: Evidence
  /** What it was read from: a component on a page, or the rule that paints one. */
  basis: string
}

/**
 * One rung of the surface ladder. `level` is its position from the page up.
 *
 * Levels are assigned by what sits on what in the running product — a menu
 * opens over a panel, so it is above it — and not by sorting grays. On more
 * sites than not, the dialog is NOT the lightest surface.
 */
export interface ElevationLevel extends ThemeToken {
  level: number
  /** The components painted with it. Empty when the use was not observed. */
  components: string[]
}

/** Where one kind of component sits: which level, and how it is set off. */
export interface Placement {
  component: string
  /** Index into `elevation`. Null when the component has no surface of its own. */
  level: number | null
  /** Border, radius, shadow, scrim — whatever separates it from what is under it. */
  treatment: string
  evidence: Evidence
  basis: string
}

/**
 * Hover, selected, focus, disabled. Kept apart from elevation because they are
 * not places a thing can BE — they are things that happen to it where it is.
 */
export interface StateToken extends ThemeToken {
  /** A translucent layer over the surface, a ring around it, or a replacement fill. */
  kind: 'layer' | 'ring' | 'fill'
  /** For `fill`: the text that goes with it. */
  ink?: string
}

export interface ButtonStyle {
  key: string
  label: string
  /** The site's class or variant name. */
  source?: string
  /** Null for a button with no fill. */
  fill: { hex: string; alpha?: number } | null
  ink: string
  border?: { hex: string; alpha?: number }
  /** A CSS length: '9999px' for a pill. */
  radius: string
  purpose: string
  evidence: Evidence
  basis: string
}

/** A measured shape: the radius of a menu, the outline of a dialog. */
export interface ShapeNote {
  label: string
  value: string
  basis: string
}

/**
 * The few measurements the rendered examples need as numbers rather than as
 * sentences. All optional: an example falls back to a plain 8px corner and no
 * shadow, which is a neutral drawing rather than a claim about the site.
 */
export interface ThemeMetrics {
  radius?: { field?: string; menu?: string; card?: string; dialog?: string }
  /** The layer a dialog dims the page with. */
  scrim?: { hex: string; alpha: number }
  /** The shadow under a menu, as CSS. */
  menuShadow?: string
  /** The outline around a dialog. */
  dialogOutline?: { hex: string; alpha?: number }
  /** How far a placeholder is faded from the text color it is set in. */
  placeholderAlpha?: number
}

export interface DecorativeItem {
  label: string
  source?: string
  /** Any CSS `background` value: a hex, an rgb() with alpha, a gradient. */
  css: string
  /** Shown beside it. Omit for something that has no single value. */
  value?: string
  usage: string
  evidence: Evidence
}

/**
 * Color the interface uses now and then, grouped by what it is used FOR.
 * Never by hue: "the oranges" is a fact about a color wheel, "the promotional
 * button" is a fact about the product.
 */
export interface DecorativeGroup {
  purpose: string
  note?: string
  items: DecorativeItem[]
}

/** One swatch of a swatch grid. */
export interface PaletteColor {
  name: string
  hex: string
  /** kebab-case name, used for the generated CSS custom property. */
  slug: string
}

/** Where a swatch grid came from. */
export interface PaletteOrigin {
  /** Its page id and filename. */
  page: string
  /** The namespace of its custom properties: `--<namespace>-<slug>`. */
  namespace: string
  /** One sentence saying where the values came from. */
  credit: string
}

/** The same stylesheet read as a 5×4 swatch grid, shown under Raw tokens. */
export interface Palette {
  id: string
  title: string
  author: string
  source?: string
  /** One sentence on what the grid is, in this system's voice. */
  character: string
  origin?: PaletteOrigin
  colors: PaletteColor[]
}

/** One of the site's own ramps, verbatim, for the collapsed reference. */
export interface RawRamp {
  name: string
  note?: string
  steps: { step: string; hex: string; alpha?: number }[]
}

export interface SiteTheme {
  /** Page id and filename. */
  id: string
  title: string
  /* Where the values came from. A record for whoever maintains the file, and a
     search keyword; the page does not print it. */
  site: string
  source: string
  /** ISO date the values were read. */
  captured: string
  /** Namespace of the generated custom properties: `--<namespace>-…`. */
  namespace: string
  /** One line on what the theme is, in this system's voice. */
  summary: string

  elevation: ElevationLevel[]
  /** A sentence for anything the ladder deliberately leaves out. */
  elevationNote?: string
  placements: Placement[]
  states: StateToken[]

  foregrounds: ThemeToken[]
  borders: ThemeToken[]
  semantic: ThemeToken[]

  buttons: ButtonStyle[]
  shapes?: ShapeNote[]
  metrics?: ThemeMetrics

  decorative: DecorativeGroup[]
  raw: {
    ramps: RawRamp[]
    alpha?: RawRamp[]
    /** A swatch-grid reading of the same stylesheet, if one was made. */
    palette?: Palette
    /** What else is in the stylesheet and was left out on purpose. */
    omitted?: string
  }
}
