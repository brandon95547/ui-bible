/* ===========================================================================
   PALETTE ARITHMETIC
   Everything the Color section needs to say something true about a hex value:
   what it converts to, what it contrasts with, and where it sits in hue space.

   None of this reads the DOM. A borrowed palette is not in our stylesheet and
   never will be — these are literal values from someone else's file, so they
   are measured as literals rather than resolved through getComputedStyle the
   way `useResolvedTokens` handles our own tokens.
   ======================================================================== */

export type RGB = [number, number, number]

/** #rgb, #rrggbb, with or without the hash. */
export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgbToHex([r, g, b]: RGB) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

/** WCAG 2.x relative luminance. The sRGB transfer curve, not a naive average. */
export function luminance(rgb: RGB) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two opaque colours. 1 to 21. */
export function contrast(a: string, b: string) {
  const l1 = luminance(hexToRgb(a))
  const l2 = luminance(hexToRgb(b))
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * The label colour to put *on* a swatch. Pure black beats white on far more
 * mid-tones than designers expect, so this is measured rather than guessed
 * from a lightness threshold.
 */
export function readableOn(hex: string) {
  return contrast(hex, '#ffffff') >= contrast(hex, '#000000') ? '#ffffff' : '#000000'
}

export type Grade = 'AAA' | 'AA' | 'AA Large' | 'Fail'

/** WCAG grade for text of a normal weight and size. */
export function grade(ratio: number): Grade {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

/* -- conversions the copy menu offers -------------------------------------- */

export function toRgbString(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${r} ${g} ${b})`
}

export function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s * 100, l * 100]
}

export function toHslString(hex: string) {
  const [h, s, l] = toHsl(hex)
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`
}

export type Format = 'HEX' | 'RGB' | 'HSL'

export function formatColor(hex: string, format: Format) {
  if (format === 'RGB') return toRgbString(hex)
  if (format === 'HSL') return toHslString(hex)
  return hex.toUpperCase()
}

/* -- ordering -------------------------------------------------------------- */

/**
 * Sorted by hue, then by lightness within a hue. Greys have no meaningful hue,
 * so anything under 12% saturation is collected at the end rather than being
 * scattered through the spectrum by a hue value that is essentially noise.
 */
export function byHue<T extends { hex: string }>(colors: readonly T[]): T[] {
  const key = (c: T) => {
    const [h, s, l] = toHsl(c.hex)
    return s < 12 ? [1, 0, l] : [0, h, l]
  }
  return [...colors].sort((a, b) => {
    const ka = key(a)
    const kb = key(b)
    return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2]
  })
}

/** Darkest first. The order you want when you are hunting for a text colour. */
export function byLightness<T extends { hex: string }>(colors: readonly T[]): T[] {
  return [...colors].sort((a, b) => luminance(hexToRgb(a.hex)) - luminance(hexToRgb(b.hex)))
}

/* -- the audit ------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
   THE ONLY QUESTION WORTH ASKING OF A LOOSE COLOUR

   Not "is this colour accessible" — a colour on its own has no ratio. The
   useful question is which surface it can be ink on, and the answer is
   constrained by an identity worth knowing:

       contrast(c, white) × contrast(c, black) = 21,   for every c

   because the two ratios are (1.05 / L+0.05) and (L+0.05 / 0.05). So a colour
   that fails 4.5:1 on white necessarily clears 4.67:1 on black. Every colour
   is ink somewhere. Almost none is ink on both — that needs both factors above
   4.5 out of a product of 21, which is a sliver around L ≈ 0.18.

   This is why "make the palette accessible" is not a task. Choosing the
   surface is the task.
   ------------------------------------------------------------------------ */

export interface ColorAudit {
  /** Contrast against #ffffff — this colour as ink on white, and white as a label on it. */
  onWhite: number
  /** Contrast against #000000 — the same relationship, inverted. */
  onBlack: number
  /** The ratio the swatch's own label achieves, which is the better of the two. */
  labelRatio: number
  /** Which surface this colour can carry body text on. */
  ink: 'light' | 'dark' | 'both'
}

export function auditColor(hex: string): ColorAudit {
  const onWhite = contrast(hex, '#ffffff')
  const onBlack = contrast(hex, '#000000')
  const light = onWhite >= 4.5
  const dark = onBlack >= 4.5
  return {
    onWhite,
    onBlack,
    labelRatio: Math.max(onWhite, onBlack),
    ink: light && dark ? 'both' : light ? 'light' : 'dark',
  }
}

export interface PaletteAudit {
  /** Clears 4.5:1 on white — usable as text on a light page. */
  onWhite: number
  /** Clears 4.5:1 on black. */
  onBlack: number
  /** Clears both. Expect zero or one. */
  both: number
  /** Reaches 3:1 on white — headings, icons, borders and chart marks. */
  largeOnWhite: number
  total: number
}

export function auditPalette(colors: readonly { hex: string }[]): PaletteAudit {
  const rows = colors.map((c) => auditColor(c.hex))
  return {
    onWhite: rows.filter((r) => r.onWhite >= 4.5).length,
    onBlack: rows.filter((r) => r.onBlack >= 4.5).length,
    both: rows.filter((r) => r.ink === 'both').length,
    largeOnWhite: rows.filter((r) => r.onWhite >= 3).length,
    total: rows.length,
  }
}
