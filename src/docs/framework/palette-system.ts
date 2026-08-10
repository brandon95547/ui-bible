import {
  contrast,
  darken,
  hueDistance,
  hexToRgb,
  hslToHex,
  luminance,
  mix,
  mixToContrast,
  toHsl,
} from './palette'
import type { Palette, PaletteColor } from '@/docs/data/flat-ui-colors'

/* ===========================================================================
   FROM TWENTY COLOURS TO A DESIGN SYSTEM

   A palette gives you hues. A system needs surfaces, a text ramp, hover and
   active steps, borders, disabled states and a categorical set — roughly forty
   values, of which a palette ships twenty and none of the boring ones.

   Everything here derives the missing thirty from the twenty, by the same
   rules for all fourteen palettes, and records where each value came from.
   Two kinds of provenance, and the distinction is the whole point:

     · TAKEN   — a literal palette colour, cited by its position and its name
     · DERIVED — computed, with the arithmetic stated

   The derivation is deliberately dull. It is not trying to be a better
   designer than the person who drew the palette; it is trying to be a
   consistent one, so that comparing two palettes compares the palettes rather
   than two different sets of judgement calls. Where a real product would make
   a decision by eye, this makes it by rule and tells you it did.
   ======================================================================== */

export interface SystemToken {
  key: string
  label: string
  /** The one-line job, shown under the label. */
  sub: string
  hex: string
  /** Where the value came from — a citation or the arithmetic. */
  origin: string
  taken: boolean
  /** Measured against the surface this token is meant to sit on. */
  ratio?: number
  /** What that ratio has to clear for the token to be doing its job. */
  target?: number
}

export interface PaletteSystem {
  palette: Palette
  text: SystemToken[]
  surfaces: SystemToken[]
  semantic: SemanticRole[]
  chart: PaletteColor[]
  /** Convenience handles used by the component previews. */
  page: string
  surface: string
  elevated: string
  border: string
  borderStrong: string
  hover: string
  ink: string
  inkSecondary: string
  inkMuted: string
  inkDisabled: string
}

export interface SemanticRole {
  key: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'accent'
  label: string
  base: SystemToken
  hover: SystemToken
  active: SystemToken
  /** Text to put on the solid fill — measured, never assumed. */
  on: string
}

/** The 5×4 grid the palette is published in, so a citation is checkable. */
function cite(colors: readonly PaletteColor[], c: PaletteColor) {
  const i = colors.indexOf(c)
  return `Row ${Math.floor(i / 5) + 1}, Col ${(i % 5) + 1} · ${c.name}`
}

const sat = (hex: string) => toHsl(hex)[1]
const light = (hex: string) => toHsl(hex)[2]
const hue = (hex: string) => toHsl(hex)[0]
/**
 * Relative luminance, not HSL lightness, wherever "brighter" is being decided.
 * The two disagree exactly where it matters: Sun Flower and Orange are 50.2%
 * and 51.2% lightness — HSL calls the orange brighter — while their luminances
 * are 0.58 and 0.41, because HSL has no idea that yellow carries more light
 * than orange. Every "which of these two is the base" question below is an
 * eye question, so it gets the eye's answer.
 */
const lum = (hex: string) => luminance(hexToRgb(hex))

export function derivePaletteSystem(palette: Palette): PaletteSystem {
  const colors = palette.colors

  /* -- surfaces ----------------------------------------------------------
     Anchored on the palette's darkest member. Every one of the fourteen has
     one, because a palette with no dark value is unusable as a strip and the
     designers all knew it. The ladder below it is derived: a page has to be
     darker than the cards on it, and no palette ships two greys that happen to
     be 15% apart. */

  const darkest = [...colors].sort((a, b) => luminance(hexToRgb(a.hex)) - luminance(hexToRgb(b.hex)))[0]
  const elevated = darkest.hex
  const surface = darken(elevated, 0.16)
  const page = darken(elevated, 0.32)
  const hover = mix(elevated, '#ffffff', 0.07)

  /* -- ink ---------------------------------------------------------------- */

  const paleNeutral = [...colors]
    .filter((c) => sat(c.hex) < 30)
    .sort((a, b) => light(b.hex) - light(a.hex))[0]
  const palest = [...colors].sort((a, b) => light(b.hex) - light(a.hex))[0]
  const inkSource = paleNeutral ?? palest

  /* A palette can only supply its own body text if it ships a neutral that is
     both pale and genuinely unsaturated. Two failure modes, both real:

     · No neutral at all — the Dutch set has none. Mixing its palest colour
       toward white does NOT desaturate it: white has no hue to dilute with, so
       Lavender Rose at 55% white is still 95% saturated and body copy comes
       out pink. The ink has to be *constructed* — the hue kept as a whisper,
       the saturation clamped to 8%.

     · Pure white — the Chinese set ships #FFFFFF. Maximum contrast on a
       near-black page haloes for astigmatic readers, so it is softened to 96%
       lightness for the same reason our own canvas is not #000. */
  const inkTaken =
    paleNeutral !== undefined && sat(inkSource.hex) <= 24 && light(inkSource.hex) >= 88 && light(inkSource.hex) <= 97
  const ink = inkTaken ? inkSource.hex : hslToHex(hue(inkSource.hex), Math.min(sat(inkSource.hex), 8), 96)
  const inkOrigin = inkTaken
    ? cite(colors, inkSource)
    : light(inkSource.hex) > 97
      ? `Derived · ${inkSource.name} softened to 96% lightness — pure white on a page this dark haloes`
      : `Derived · near-white holding 8% of ${inkSource.name}'s hue — this palette ships no neutral pale enough for body copy`

  /* Borders are solved, not mixed. A fixed 26%-toward-white step clears 3:1
     against the surface on some palettes and not others, and a border-strong
     that misses 3:1 is an input nobody can find — WCAG 1.4.11 covers the edge
     of a control exactly as it covers its label. */
  const border = mixToContrast(ink, surface, 1.5)
  const borderStrong = mixToContrast(ink, surface, 3)

  const surfaces: SystemToken[] = [
    {
      key: 'page',
      label: 'Page background',
      sub: 'The furthest-back plane',
      hex: page,
      origin: `Derived · 32% toward black from ${darkest.name}`,
      taken: false,
    },
    {
      key: 'surface',
      label: 'Surface',
      sub: 'Cards, panels, the default plane',
      hex: surface,
      origin: `Derived · 16% toward black from ${darkest.name}`,
      taken: false,
    },
    {
      key: 'elevated',
      label: 'Surface elevated',
      sub: 'Menus, dialogs, anything raised',
      hex: elevated,
      origin: cite(colors, darkest),
      taken: true,
    },
    {
      key: 'hover',
      label: 'Surface hover',
      sub: 'Pointer over a row or a card',
      hex: hover,
      origin: 'Derived · 7% toward white from the elevated surface',
      taken: false,
    },
    {
      key: 'border',
      label: 'Border',
      sub: 'Dividers and default edges',
      hex: border,
      origin: 'Derived · solved to 1.5:1 on the surface — visible, not loud',
      taken: false,
      ratio: contrast(border, surface),
      target: 1.5,
    },
    {
      key: 'border-strong',
      label: 'Border strong',
      sub: 'Inputs, checkboxes, anything you can click',
      hex: borderStrong,
      origin: 'Derived · solved to 3:1 — the floor for a control boundary',
      taken: false,
      ratio: contrast(borderStrong, surface),
      target: 3,
    },
  ]

  /* -- text --------------------------------------------------------------
     Solved for contrast rather than mixed by percentage. A fixed 22%-toward-
     the-background step gives a different ramp on every palette and a failing
     one on the darkest; solving means "secondary text" means 8:1 everywhere,
     which is what makes the fourteen pages comparable. */

  const inkSecondary = mixToContrast(ink, page, 8)
  const inkTertiary = mixToContrast(ink, page, 5.5)
  const inkMuted = mixToContrast(ink, page, 4.5)
  const inkDisabled = mixToContrast(ink, page, 2.6)

  const text: SystemToken[] = [
    {
      key: 'text',
      label: 'Primary',
      sub: 'Headings and high emphasis',
      hex: ink,
      origin: inkOrigin,
      taken: inkTaken,
      ratio: contrast(ink, page),
      target: 12,
    },
    {
      key: 'text-secondary',
      label: 'Secondary',
      sub: 'Body copy',
      hex: inkSecondary,
      origin: 'Derived · solved to 8:1 on the page',
      taken: false,
      ratio: contrast(inkSecondary, page),
      target: 8,
    },
    {
      key: 'text-tertiary',
      label: 'Tertiary',
      sub: 'Supporting detail',
      hex: inkTertiary,
      origin: 'Derived · solved to 5.5:1',
      taken: false,
      ratio: contrast(inkTertiary, page),
      target: 5.5,
    },
    {
      key: 'text-muted',
      label: 'Muted',
      sub: 'Captions, metadata, placeholders',
      hex: inkMuted,
      origin: 'Derived · solved to 4.5:1 — the floor for body text',
      taken: false,
      ratio: contrast(inkMuted, page),
      target: 4.5,
    },
    {
      key: 'text-disabled',
      label: 'Disabled',
      sub: 'Inactive — formally exempt from contrast',
      hex: inkDisabled,
      origin: 'Derived · solved to 2.6:1, deliberately below the floor',
      taken: false,
      ratio: contrast(inkDisabled, page),
    },
  ]

  /* -- semantic roles ----------------------------------------------------
     Primary is the palette's first chromatic colour: designers lead with their
     signature, and every one of these fourteen does. The status roles are the
     nearest hue to each target, which is the honest version of a decision that
     is usually made by eye and then rationalised. Where the nearest hue is not
     close, the page says so rather than pretending. */

  /* The lightness and saturation floors are load-bearing, not tidiness. Flat
     UI v1's nearest hue to 210° is Wet Asphalt — a 29%-saturation blue-grey
     drawn to be a *surface* — which beats Peter River by six degrees and
     produces an "Info" button the colour of the page it sits on. A status
     colour has to be chromatic and mid-light before it is the right hue.
     Excluding the surface anchor matters for the same reason: it already has
     a job in section 02. */
  const chromatic = colors.filter(
    (c) => c !== darkest && sat(c.hex) >= 35 && light(c.hex) >= 25 && light(c.hex) <= 80,
  )
  const pool = chromatic.length >= 6 ? chromatic : colors.filter((c) => c !== darkest && sat(c.hex) >= 22)
  const used = new Set<PaletteColor>()

  /**
   * Nearest hue, then brightest — and the second half is not a tie-break, it
   * is the rule.
   *
   * Palettes are drawn in pairs: Emerald and Nephritis are the same hue to
   * within 0.12°, and so are Turquoise/Green Sea, Peter River/Belize Hole,
   * Alizarin/Pomegranate. Sorting by hue alone lets floating-point noise
   * decide which of a pair becomes the base, and when it picks the darker one
   * the lighter twin is orphaned and the hover step has to be invented —
   * discarding the exact pair the designer drew for this.
   *
   * So: collect everything within 15° of the closest candidate and take the
   * one with the highest relative luminance. On a dark theme the brighter twin
   * is the resting state and the darker one is what pressing it should do.
   */
  const take = (target: number) => {
    const free = pool.filter((c) => !used.has(c))
    const closest = Math.min(...free.map((c) => hueDistance(hue(c.hex), target)))
    const best = free
      .filter((c) => hueDistance(hue(c.hex), target) <= closest + 15)
      .sort((a, b) => lum(b.hex) - lum(a.hex))[0]
    used.add(best)
    return best
  }

  const primaryPick = pool[0]
  used.add(primaryPick)

  const ROLES: { key: SemanticRole['key']; label: string; hue: number | null }[] = [
    { key: 'primary', label: 'Primary', hue: null },
    { key: 'success', label: 'Success', hue: 135 },
    { key: 'info', label: 'Info', hue: 210 },
    { key: 'warning', label: 'Warning', hue: 42 },
    { key: 'danger', label: 'Danger', hue: 5 },
    { key: 'accent', label: 'Accent', hue: 288 },
  ]

  const semantic: SemanticRole[] = ROLES.map((role) => {
    const pick = role.hue === null ? primaryPick : take(role.hue)
    const drift = role.hue === null ? 0 : Math.round(hueDistance(hue(pick.hex), role.hue))

    // A darker member of the same hue is a better hover than anything computed
    // — it is a colour the designer actually chose. Only fall back to
    // arithmetic when the palette does not carry one.
    // Same hue, meaningfully darker, and still chromatic — the last clause is
    // what stops Peter River's hover becoming Wet Asphalt, which is six
    // degrees away in hue and a surface grey in every other respect. Of the
    // candidates, the brightest: a hover is a step, not a plunge.
    const sibling = colors
      .filter(
        (c) =>
          c !== pick &&
          !used.has(c) &&
          hueDistance(hue(c.hex), hue(pick.hex)) < 14 &&
          sat(c.hex) >= sat(pick.hex) * 0.5 &&
          lum(c.hex) < lum(pick.hex) * 0.8,
      )
      .sort((a, b) => lum(b.hex) - lum(a.hex))[0]
    if (sibling) used.add(sibling)

    const hoverHex = sibling ? sibling.hex : darken(pick.hex, 0.12)
    const activeHex = darken(pick.hex, sibling ? 0.24 : 0.24)
    const on = contrast(pick.hex, '#ffffff') >= contrast(pick.hex, page) ? '#ffffff' : page

    return {
      key: role.key,
      label: role.label,
      on,
      base: {
        key: role.key,
        label: role.label,
        sub: role.key === 'primary' ? 'The brand action' : `${role.label} state`,
        hex: pick.hex,
        origin:
          role.hue === null
            ? `${cite(colors, pick)} — the palette's opening colour`
            : `${cite(colors, pick)}${drift > 45 ? ` — ${drift}° off the ideal ${role.label.toLowerCase()} hue, the nearest this palette carries` : ''}`,
        taken: true,
        ratio: contrast(pick.hex, on),
        target: 4.5,
      },
      hover: {
        key: `${role.key}-hover`,
        label: `${role.label} hover`,
        sub: 'Pointer over the fill',
        hex: hoverHex,
        origin: sibling ? cite(colors, sibling) : 'Derived · 12% toward black',
        taken: Boolean(sibling),
      },
      active: {
        key: `${role.key}-active`,
        label: `${role.label} active`,
        sub: 'Pressed and held',
        hex: activeHex,
        origin: 'Derived · 24% toward black',
        taken: false,
      },
    }
  })

  /* -- categorical -------------------------------------------------------
     Eight, spread around the hue circle, and every one of them required to
     clear 3:1 on the page — a chart mark is a meaningful graphic under WCAG
     1.4.11, so a series nobody can see is not a design choice. */

  const visible = colors.filter((c) => sat(c.hex) >= 20 && contrast(c.hex, page) >= 3)
  const ranked = (visible.length >= 8 ? visible : colors.filter((c) => contrast(c.hex, page) >= 3))
    .slice()
    .sort((a, b) => hue(a.hex) - hue(b.hex))
  const chart: PaletteColor[] = []
  if (ranked.length) {
    for (let i = 0; i < 8; i++) chart.push(ranked[Math.round((i * (ranked.length - 1)) / 7)])
  }

  return {
    palette,
    text,
    surfaces,
    semantic,
    chart: chart.filter((c, i) => chart.indexOf(c) === i),
    page,
    surface,
    elevated,
    border,
    borderStrong,
    hover,
    ink,
    inkSecondary,
    inkMuted,
    inkDisabled,
  }
}

/* -- elevation -------------------------------------------------------------
   Not derived from the palette, and it never should be. A shadow is the
   absence of light, so it is black at low alpha on every palette on earth —
   tinting it with the brand hue is the most common way a dark theme starts
   looking like a bruise.
   ------------------------------------------------------------------------ */

export const ELEVATION = [
  { level: 0, label: 'Flat', shadow: 'none', use: 'Page, and anything not raised' },
  { level: 1, label: 'Raised', shadow: '0 1px 3px rgb(0 0 0 / 0.12)', use: 'Cards at rest' },
  { level: 2, label: 'Hover', shadow: '0 4px 6px rgb(0 0 0 / 0.16)', use: 'A card under the pointer' },
  { level: 3, label: 'Overlay', shadow: '0 10px 20px rgb(0 0 0 / 0.20)', use: 'Menus and popovers' },
  { level: 4, label: 'Modal', shadow: '0 16px 32px rgb(0 0 0 / 0.24)', use: 'Dialogs and drawers' },
]

/** The derived system as the CSS a product would actually paste. */
export function systemCss(sys: PaletteSystem) {
  const p = sys.palette
  const line = (k: string, v: string, note: string) =>
    `  --${p.id}-${k}: ${v};`.padEnd(42) + `/* ${note} */`

  return `/* ${p.title} — a dark theme derived from the twenty.
   ${p.author}, Flat UI Colors 2. Values marked "taken" are the palette's own;
   everything else is computed from them by the rules on this page. */
:root {
  /* surfaces */
${sys.surfaces.map((t) => line(t.key, t.hex, t.taken ? 'taken' : 'derived')).join('\n')}

  /* text */
${sys.text.map((t) => line(t.key, t.hex, t.ratio ? `${t.ratio.toFixed(1)}:1 on the page` : 'derived')).join('\n')}

  /* semantic */
${sys.semantic
  .flatMap((r) => [
    line(r.key, r.base.hex, r.base.taken ? 'taken' : 'derived'),
    line(`${r.key}-hover`, r.hover.hex, r.hover.taken ? 'taken' : 'derived'),
    line(`${r.key}-active`, r.active.hex, 'derived'),
    line(`${r.key}-on`, r.on, `${r.base.ratio?.toFixed(1)}:1 on the fill`),
  ])
  .join('\n')}

  /* categorical — never status */
${sys.chart.map((c, i) => line(`chart-${i + 1}`, c.hex, c.name)).join('\n')}

  /* elevation — black, never the brand hue */
${ELEVATION.filter((e) => e.level > 0)
  .map((e) => line(`elevation-${e.level}`, e.shadow, e.label.toLowerCase()))
  .join('\n')}
}`
}
