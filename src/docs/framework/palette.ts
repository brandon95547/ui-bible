/* ===========================================================================
   COLOR ARITHMETIC
   What the theme sheet needs to say something true about a hex value: what it
   converts to and what it contrasts with.

   None of this reads the DOM. A theme sheet's values are not in our
   stylesheet and never will be — they are literal values from someone else's
   file, so they are measured as literals rather than resolved through
   getComputedStyle the way `useResolvedTokens` handles our own tokens.
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

/** WCAG contrast ratio between two opaque colors. 1 to 21. */
export function contrast(a: string, b: string) {
  const l1 = luminance(hexToRgb(a))
  const l2 = luminance(hexToRgb(b))
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export type Grade = 'AAA' | 'AA' | 'AA Large' | 'Fail'

/** WCAG grade for text of a normal weight and size. */
export function grade(ratio: number): Grade {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA Large'
  return 'Fail'
}

export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${r} ${g} ${b} / ${alpha})`
}
