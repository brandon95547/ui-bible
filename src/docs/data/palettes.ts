import { FLAT_UI_PALETTES, type Palette } from './flat-ui-colors'
import { SONORA } from './sonora-colors'

/** Every palette in the Color section, in the order the section lists them.
 *  Only a page that compares them all should import this — a palette page
 *  imports its own and nothing else. */
export const PALETTES: Palette[] = [...FLAT_UI_PALETTES, SONORA]
