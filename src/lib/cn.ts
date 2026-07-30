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
            'h1',
            'h2',
            'h3',
            'h4',
            'body-lg',
            'body',
            'body-sm',
            'label',
            'label-sm',
            'caption',
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
