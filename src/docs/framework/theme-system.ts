import { contrast, grade, hexToRgb, luminance, rgbToHex, type Grade } from './palette'
import type { ButtonStyle, SiteTheme, ThemeToken } from '@/docs/data/site-theme'

/* ===========================================================================
   WHAT A THEME SHEET WORKS OUT FOR ITSELF

   The data file records what was found. Everything on the page that is a
   CONCLUSION — is this site dark, is it monochrome, can this text sit on that
   surface — is computed here from the recorded values, by the same rules for
   every site, so that the sheet cannot be made to say something the values do
   not support.

   The one that matters most is the classification, because it is the one that
   used to be done by eye and done wrong: a stylesheet with nine saturated
   ramps looks like a colorful product, and the product it styles is gray.
   ======================================================================== */

/* -- alpha -----------------------------------------------------------------
   Sites draw borders and hover layers as white at low alpha, and a value like
   that has no color until it is on something. Wherever a number is needed —
   a ratio, a chroma, a hex to copy — it is the composite that is measured. */

/** `hex` at `alpha` laid over an opaque `bg`. Plain sRGB, as a browser does it. */
export function over(hex: string, alpha: number | undefined, bg: string) {
  if (alpha === undefined || alpha >= 1) return hex
  const f = hexToRgb(hex)
  const b = hexToRgb(bg)
  return rgbToHex([
    b[0] + (f[0] - b[0]) * alpha,
    b[1] + (f[1] - b[1]) * alpha,
    b[2] + (f[2] - b[2]) * alpha,
  ])
}

/** The value as CSS: a hex when opaque, `rgb(r g b / a)` when not. */
export function paint(hex: string, alpha?: number) {
  if (alpha === undefined || alpha >= 1) return hex
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${r} ${g} ${b} / ${alpha})`
}

/** How a person would say it: "#F7F4EF", or "White · 10%". */
export function describe(hex: string, alpha?: number) {
  if (alpha === undefined || alpha >= 1) return hex.toUpperCase()
  const pct = `${Math.round(alpha * 100)}%`
  const h = hex.toLowerCase()
  if (h === '#ffffff' || h === '#fff') return `White · ${pct}`
  if (h === '#000000' || h === '#000') return `Black · ${pct}`
  return `${hex.toUpperCase()} · ${pct}`
}

/* -- classification --------------------------------------------------------
   Two questions, both answered from the interface roles and nothing else.

   DARK OR LIGHT is the luminance of the page surface. Not the average of the
   palette, not the color scheme the stylesheet declares — the thing the user
   is looking at most of the time.

   MONOCHROME OR COLORFUL is whether the roles that make up the chrome carry a
   hue: the surfaces, the text, the borders, and the fill and label of each
   button. Those are the pixels that are there on every screen. What is NOT
   asked: status colors (every site has a red), decorative treatments, and the
   contents of the stylesheet. A product is not colorful because it could be.

   "Carries a hue" is channel spread — (max − min) / 255 — over a threshold.
   It is cruder than a chroma in a perceptual space and that is fine here: the
   neutrals of a tinted gray ramp spread by three or four percent, any color
   meant to be seen as a color spreads by forty, and the line between them is
   nowhere near either. */

const CHROMATIC = 0.12

/** 0 for a pure gray, toward 1 for a saturated color. */
export function spread(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255
}

export type Scheme = 'dark' | 'light'
export type Chroma = 'monochrome' | 'accented' | 'colorful'

export interface ThemeClass {
  scheme: Scheme
  chroma: Chroma
  /** How many distinct interface roles were looked at. */
  roles: number
  /** The ones that carry a hue, by name. */
  chromatic: { label: string; hex: string }[]
  /** Relative luminance of the page surface, 0–1. */
  pageLuminance: number
  /** The finding as a sentence, with its numbers. */
  reason: string
}

const SCHEME_LABEL: Record<Scheme, string> = { dark: 'Dark', light: 'Light' }
const CHROMA_LABEL: Record<Chroma, string> = {
  monochrome: 'Monochrome',
  accented: 'Neutral with an accent',
  colorful: 'Colorful',
}

export const classLabel = (c: ThemeClass) => `${SCHEME_LABEL[c.scheme]} · ${CHROMA_LABEL[c.chroma]}`

export function classifyTheme(theme: SiteTheme): ThemeClass {
  const page = theme.elevation[0]?.hex ?? '#000000'
  const pageLuminance = luminance(hexToRgb(page))

  const roles: { label: string; hex: string }[] = []
  const add = (label: string, hex: string) => roles.push({ label, hex })

  // Only what was seen. A step of the ramp nobody was observed using is not
  // part of how the site looks, whatever it would do to the count.
  theme.elevation.filter((l) => l.evidence === 'observed').forEach((l) => add(`${l.label} surface`, l.hex))
  theme.foregrounds.forEach((t) => add(`${t.label} text`, t.hex))
  theme.borders.forEach((t) => add(`${t.label} border`, over(t.hex, t.alpha, page)))
  theme.buttons.forEach((b) => {
    if (b.fill) add(`${b.label} button`, over(b.fill.hex, b.fill.alpha, page))
    add(`${b.label} button label`, b.ink)
  })

  const chromatic = roles.filter((r) => spread(r.hex) > CHROMATIC)
  const primary = theme.buttons[0]
  const primaryHue = Boolean(primary?.fill && spread(primary.fill.hex) > CHROMATIC)

  // The primary button decides more than its share. It is one role out of
  // twenty, and it is also the one thing on the screen designed to be found.
  const chroma: Chroma =
    chromatic.length === 0
      ? 'monochrome'
      : !primaryHue && chromatic.length / roles.length < 0.25
        ? 'accented'
        : 'colorful'
  const scheme: Scheme = pageLuminance < 0.18 ? 'dark' : 'light'

  const counted = `${roles.length} interface roles — surfaces, text, borders and button fills`
  const reason =
    chroma === 'monochrome'
      ? `Classified from ${counted}. None of them carries a hue.`
      : `Classified from ${counted}. ${chromatic.length} carry a hue: ${chromatic
          .map((c) => c.label.toLowerCase())
          .join(', ')}.`

  return { scheme, chroma, roles: roles.length, chromatic, pageLuminance, reason }
}

/* -- lookups the renderers share ------------------------------------------- */

export interface ThemeHandles {
  /** Surface by level, clamped to what the site has. */
  surface: (level: number) => string
  /** The observed surfaces, page first. */
  observed: SiteTheme['elevation']
  fg: (key: string) => string
  border: (key: string) => string
  state: (key: string) => SiteTheme['states'][number] | undefined
  button: (key: string) => ButtonStyle | undefined
  semantic: (key: string) => string | undefined
  page: string
  ink: string
  muted: string
}

export function handles(theme: SiteTheme): ThemeHandles {
  const find = (list: ThemeToken[], key: string) => list.find((t) => t.key === key)
  const first = <T,>(list: T[]) => list[0]
  const page = theme.elevation[0]?.hex ?? '#000000'
  const ink = find(theme.foregrounds, 'fg-primary')?.hex ?? first(theme.foregrounds)?.hex ?? '#ffffff'
  const css = (t?: ThemeToken) => (t ? paint(t.hex, t.alpha) : 'transparent')

  return {
    surface: (level) => theme.elevation[Math.min(level, theme.elevation.length - 1)]?.hex ?? page,
    observed: theme.elevation.filter((l) => l.evidence === 'observed'),
    fg: (key) => find(theme.foregrounds, key)?.hex ?? ink,
    border: (key) => css(find(theme.borders, key) ?? first(theme.borders)),
    state: (key) => theme.states.find((s) => s.key === key),
    button: (key) => theme.buttons.find((b) => b.key === key),
    semantic: (key) => find(theme.semantic, key)?.hex,
    page,
    ink,
    muted: find(theme.foregrounds, 'fg-muted')?.hex ?? ink,
  }
}

/* -- contrast --------------------------------------------------------------
   Text against the surfaces it is actually put on. A ratio against white and
   black bounds what a loose color can do; a theme is not loose, so the only
   ratios worth printing are the pairs the site really makes. */

export interface ContrastRow {
  token: ThemeToken
  cells: { level: number; surface: string; ratio: number; grade: Grade }[]
}

export function contrastRows(theme: SiteTheme): ContrastRow[] {
  const surfaces = theme.elevation.filter((l) => l.evidence === 'observed')
  return theme.foregrounds.map((token) => ({
    token,
    cells: surfaces.map((s) => {
      const ratio = contrast(token.hex, s.hex)
      return { level: s.level, surface: s.hex, ratio, grade: grade(ratio) }
    }),
  }))
}

/** The label on each filled button, measured against its own fill. */
export function buttonContrast(theme: SiteTheme) {
  const page = theme.elevation[0]?.hex ?? '#000000'
  return theme.buttons.map((b) => {
    const ground = b.fill ? over(b.fill.hex, b.fill.alpha, page) : page
    const ratio = contrast(b.ink, ground)
    return { button: b, ground, ratio, grade: grade(ratio) }
  })
}

/* -- the CSS ---------------------------------------------------------------
   Roles point at primitives; primitives hold the values. A hex appears once.
   That is the whole reason to have two tiers, and it is what makes the theme
   re-skinnable from the ramp without touching a role. */

export function themeCss(theme: SiteTheme) {
  const ns = theme.namespace
  const ramp = new Map<string, string>()
  theme.raw.ramps.forEach((r) => r.steps.forEach((s) => ramp.set(`${r.name}-${s.step}`, s.hex)))

  // Only the primitives a role actually points at. The full ramps are on the
  // page for reference; pasting ninety custom properties to use eight of them
  // is how a borrowed theme turns into a borrowed stylesheet.
  const used = new Set<string>()
  const value = (t: { ref?: string; hex: string; alpha?: number }) => {
    if (t.ref && ramp.has(t.ref) && t.alpha === undefined) {
      used.add(t.ref)
      return `var(--${ns}-${t.ref})`
    }
    return paint(t.hex, t.alpha)
  }
  // Declarations first, comments after, in one column: the block is read down
  // the right-hand side as often as down the left.
  type Row = [name: string, value: string, note: string]
  const rows = {
    surfaces: theme.elevation.map(
      (l): Row => [l.key, value(l), `E${l.level} · ${l.components.length ? l.components.join(', ').toLowerCase() : l.evidence}`],
    ),
    text: theme.foregrounds.map((t): Row => [t.key, value(t), t.purpose.split('.')[0].toLowerCase()]),
    borders: theme.borders.map((t): Row => [t.key, value(t), t.purpose.split('.')[0].toLowerCase()]),
    states: theme.states.map(
      (s): Row => [
        s.key,
        value(s),
        s.kind === 'layer' ? 'a layer over the surface' : s.kind === 'ring' ? 'an outline' : 'replaces the fill',
      ],
    ),
    semantic: theme.semantic.map(
      (t): Row => [t.key, value(t), t.evidence === 'inferred' ? 'inferred role' : t.label.toLowerCase()],
    ),
  }
  const decl = ([name, v]: Row) => `  --${ns}-${name}: ${v};`
  const width = Math.max(...Object.values(rows).flat().map((r) => decl(r).length))
  const block = (list: Row[]) => list.map((r) => `${decl(r).padEnd(width)}  /* ${r[2]} */`).join('\n')

  // In ramp order, so the primitives read as the ramp they are steps of.
  const primitives = [...ramp.keys()].filter((name) => used.has(name)).map((name) => `  --${ns}-${name}: ${ramp.get(name)};`)

  return `/* ${theme.title} — ${theme.site}'s interface theme, as read on ${theme.captured}.
   Roles reference primitives; a value is written once. */
:root {
  /* primitives — the steps of ${theme.site}'s ramps this theme uses */
${primitives.join('\n')}

  /* surfaces — the elevation ladder, page first */
${block(rows.surfaces)}

  /* text */
${block(rows.text)}

  /* borders */
${block(rows.borders)}

  /* states — layers and outlines, not surfaces */
${block(rows.states)}

  /* status */
${block(rows.semantic)}
}`
}
