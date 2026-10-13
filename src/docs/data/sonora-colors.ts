import type { Palette } from './flat-ui-colors'

/* ===========================================================================
   SONORA — 20 colors
   The palette of Suno's interface, read out of the stylesheet at suno.com on
   2026-10-13 and set in the 5×4 shape every palette in this section has.

   Suno ships ramps, not twenty swatches: one neutral ("dumbo", nineteen steps)
   and nine hues of nine or more. So unlike the Flat UI sets, these twenty were
   chosen — by one rule, stated here so the choice can be checked:

     · Eight hues. For each, the step Suno's own dark theme binds an accent
       token to (accent-brand is strawberry-600, accent-error is vermilion-500,
       and so on), with the step below it in the same ramp as its pair. That is
       the light-over-dark column a Flat UI palette is drawn in. The ninth hue,
       brown, is bound to no accent and is left out.
     · Four neutrals. The two palest their light theme stands on, a mid gray,
       and the surface their dark theme raises a control to.

   The names are theirs, step numbers included. A palette is a citation, and
   "Strawberry 600" can be looked up in their stylesheet where "pink" cannot.
   Note the ramps run dark to light: 600 is LIGHTER than 500.
   ======================================================================== */

export const SONORA: Palette = {
  id: 'sonora',
  title: 'Sonora Palette',
  author: 'Suno',
  source: 'https://suno.com',
  character:
    'Eight saturated hues, each over the step below it, on a warm cream and a cool near-black. It was drawn for a dark product — every accent is bright enough to sit on black, which is exactly why so few of them can carry text on white.',
  origin: {
    page: 'sonora',
    namespace: 'sonora',
    credit: 'Drawn from the palette of Suno’s interface, as its stylesheet had it on 2026-10-13.',
  },
  colors: [
    { name: 'Strawberry 600', hex: '#fd429c', slug: 'strawberry-600' },
    { name: 'Vermilion 500', hex: '#f8441b', slug: 'vermilion-500' },
    { name: 'Pumpkin 500', hex: '#ff6a00', slug: 'pumpkin-500' },
    { name: 'Dandelion 700', hex: '#f5d907', slug: 'dandelion-700' },
    { name: 'Grass 500', hex: '#4aab04', slug: 'grass-500' },
    { name: 'Strawberry 500', hex: '#de1677', slug: 'strawberry-500' },
    { name: 'Vermilion 400', hex: '#c32906', slug: 'vermilion-400' },
    { name: 'Pumpkin 400', hex: '#bc4e00', slug: 'pumpkin-400' },
    { name: 'Dandelion 600', hex: '#d4bb06', slug: 'dandelion-600' },
    { name: 'Grass 400', hex: '#3d8d03', slug: 'grass-400' },
    { name: 'Slime 600', hex: '#02d95c', slug: 'slime-600' },
    { name: 'Dodger Blue 600', hex: '#1f8bff', slug: 'dodger-blue-600' },
    { name: 'Amethyst 600', hex: '#8b6efe', slug: 'amethyst-600' },
    { name: 'Dumbo 900', hex: '#f7f4ef', slug: 'dumbo-900' },
    { name: 'Dumbo 600', hex: '#a3a3a3', slug: 'dumbo-600' },
    { name: 'Slime 500', hex: '#02af4a', slug: 'slime-500' },
    { name: 'Dodger Blue 500', hex: '#0071ea', slug: 'dodger-blue-500' },
    { name: 'Amethyst 500', hex: '#7251f7', slug: 'amethyst-500' },
    { name: 'Dumbo 850', hex: '#edeae4', slug: 'dumbo-850' },
    { name: 'Dumbo 150', hex: '#252529', slug: 'dumbo-150' },
  ],
}
