import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge has to be taught our theme, otherwise it treats `text-h1` and
 * `text-fg-muted` as the same conflict group and silently drops one of them.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'title-serif',
            'h1',
            'h2',
            'h3',
            'h4',
            'body-lg',
            'body',
            // Every scale step has to be listed here. `text-ui` was added to the
            // theme and not to this list, so tailwind-merge read it as a text
            // COLOR and dropped it from any cn() that also set one — which is
            // every NavItem, silently leaving navigation labels at the
            // inherited 16px instead of 15px.
            'ui',
            'body-sm',
            // The same, again, for these four: `text-label-lg` read as a color
            // and took the label color off every large Button, which then
            // inherited its parent's — light text on the light primary fill.
            'label-lg',
            'label',
            'label-sm',
            'label-xs',
            'caption',
            'badge',
            'overline',
            'code',
          ],
        },
      ],
      shadow: [{ shadow: ['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'glow'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
