import { defineDoc } from '../framework/types'
import { DesignSheetFrame } from '../framework/DesignSheetFrame'

/* Design Sheets · Phansora, first edition.
   The sheet itself is public/design-sheets/phansora/ — a frozen copy of
   phansora/styleguide/dashboard.html and the files it loads. This page frames it. */
export default defineDoc({
  meta: {
    id: 'phansora',
    title: 'Phansora',
    tagline:
      'First edition. The Phansora dashboard set down on one page — its palette, its surfaces from the page up, its type, and the components and dialogs its screens share.',
    keywords: ['design sheet', 'style guide', 'phansora', 'dashboard', 'first edition'],
  },
  sheet: [
    {
      id: 'sheet',
      title: 'Design sheet',
      description:
        "Drawn by the dashboard's own stylesheet as it shipped in October 2026, and frozen at that: a new edition is a new copy, not an edit to this one.",
      render: <DesignSheetFrame src="/design-sheets/phansora/index.html" title="Phansora design sheet" />,
    },
  ],
})
