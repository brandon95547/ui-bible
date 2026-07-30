/* ===========================================================================
   THE MAP
   One flat declaration of every page in the Bible. The sidebar, the command
   palette, the search index, and prev/next navigation are all derived from
   this — there is no second list to keep in sync.
   ======================================================================== */

export interface NavPage {
  id: string
  title: string
  /** Shown under the title in search results. */
  blurb: string
  /** Extra search terms — synonyms and the names other systems use. */
  keywords?: string[]
  status?: 'stable' | 'beta' | 'draft'
}

export interface NavGroup {
  id: string
  title: string
  /** Lucide icon name, resolved in the sidebar. */
  icon: string
  description: string
  pages: NavPage[]
  /** Collapsed by default when the sidebar first loads. */
  collapsed?: boolean
}

export const NAV: NavGroup[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    icon: 'Layers',
    description: 'The decisions everything else is built on.',
    pages: [
      {
        id: 'design-tokens',
        title: 'Design Tokens',
        blurb: 'The three-tier token architecture and the rules for extending it.',
        keywords: ['variables', 'theming', 'css custom properties', 'primitives', 'semantic'],
      },
      {
        id: 'colors',
        title: 'Colors',
        blurb: 'Ramps, semantic roles, contrast, and when colour is allowed to mean something.',
        keywords: ['palette', 'hue', 'contrast', 'wcag', 'status', 'brand'],
      },
      {
        id: 'typography',
        title: 'Typography',
        blurb: 'The type scale, measure, rhythm, and why 15px body text.',
        keywords: ['font', 'type scale', 'line height', 'measure', 'leading', 'tracking'],
      },
      {
        id: 'spacing',
        title: 'Spacing',
        blurb: 'The 4px grid, proximity, and how to space things so groups are obvious.',
        keywords: ['padding', 'margin', 'gap', 'rhythm', '8pt grid', 'whitespace'],
      },
      {
        id: 'grid',
        title: 'Grid & Layout',
        blurb: 'Columns, gutters, containers, and the widths that keep text readable.',
        keywords: ['columns', 'gutter', 'container', 'layout', 'flex', 'css grid'],
      },
      {
        id: 'radius',
        title: 'Radius',
        blurb: 'The radius scale and the nesting rule that stops corners pinching.',
        keywords: ['corner', 'rounded', 'border radius', 'shape'],
      },
      {
        id: 'elevation',
        title: 'Elevation',
        blurb: 'Six levels, what each one means, and why dark mode lightens instead of shadows.',
        keywords: ['shadow', 'depth', 'z-index', 'layering', 'surface'],
      },
      {
        id: 'icons',
        title: 'Icons',
        blurb: 'Sizes, stroke weight, optical alignment, and labelling.',
        keywords: ['iconography', 'svg', 'lucide', 'glyph', 'pictogram'],
      },
      {
        id: 'motion',
        title: 'Motion',
        blurb: 'Duration and easing tokens, and the physics they are imitating.',
        keywords: ['transition', 'easing', 'duration', 'curve', 'timing'],
      },
      {
        id: 'animation',
        title: 'Animation',
        blurb: 'Named animation patterns — enter, exit, attention, and continuity.',
        keywords: ['keyframes', 'transitions', 'micro-interaction', 'choreography'],
      },
      {
        id: 'breakpoints',
        title: 'Breakpoints',
        blurb: 'Where the layout changes and why those numbers.',
        keywords: ['responsive', 'media query', 'mobile', 'viewport', 'adaptive'],
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        blurb: 'The non-negotiables: contrast, focus, keyboard, semantics, motion.',
        keywords: ['a11y', 'wcag', 'aria', 'screen reader', 'keyboard', 'contrast'],
      },
      {
        id: 'dark-theme',
        title: 'Dark Theme',
        blurb: 'Why dark mode is not an inversion, and the rules that make it work.',
        keywords: ['dark mode', 'night', 'theme'],
      },
      {
        id: 'light-theme',
        title: 'Light Theme',
        blurb: 'Elevation by shadow, hairlines, and keeping brand colour legible on white.',
        keywords: ['light mode', 'theme', 'white'],
      },
    ],
  },

  {
    id: 'actions',
    title: 'Actions',
    icon: 'MousePointerClick',
    description: 'Everything a user can press.',
    pages: [
      {
        id: 'buttons',
        title: 'Buttons',
        blurb: 'Filled, outlined, text, elevated, tonal, danger, loading, split, FAB and icon.',
        keywords: ['cta', 'submit', 'action', 'fab', 'split button', 'icon button', 'loading'],
      },
    ],
  },

  {
    id: 'inputs',
    title: 'Inputs & Forms',
    icon: 'TextCursorInput',
    description: 'Getting data out of a human without annoying them.',
    pages: [
      {
        id: 'text-inputs',
        title: 'Text Inputs',
        blurb: 'Text, password, search, email, number, currency, textarea, prefixes and counters.',
        keywords: ['field', 'textbox', 'form control', 'placeholder', 'helper text', 'validation'],
      },
      {
        id: 'dropdowns',
        title: 'Dropdowns',
        blurb: 'Native select, listbox, multi-select, autocomplete, grouped and async.',
        keywords: ['select', 'combobox', 'listbox', 'picker', 'autocomplete', 'typeahead'],
      },
      {
        id: 'checkboxes',
        title: 'Checkboxes',
        blurb: 'Independent choices, indeterminate parents, and checkbox groups.',
        keywords: ['tickbox', 'multi-select', 'indeterminate', 'form'],
      },
      {
        id: 'radios',
        title: 'Radio Buttons',
        blurb: 'Mutually exclusive choices, and the card variant for high-stakes decisions.',
        keywords: ['radio group', 'option', 'single choice', 'segmented'],
      },
      {
        id: 'switches',
        title: 'Switches',
        blurb: 'Instant, self-saving binary settings — and when it should be a checkbox.',
        keywords: ['toggle', 'on off', 'setting', 'preference'],
      },
      {
        id: 'forms',
        title: 'Forms',
        blurb: 'Simple, multi-step, wizard, settings, profile, auth and checkout patterns.',
        keywords: ['validation', 'wizard', 'multi-step', 'checkout', 'signup', 'login', 'settings'],
      },
    ],
  },

  {
    id: 'data-display',
    title: 'Data Display',
    icon: 'LayoutGrid',
    description: 'Showing information without burying it.',
    pages: [
      {
        id: 'cards',
        title: 'Cards',
        blurb: 'Grouping, elevation, interactive cards, and when a card is the wrong container.',
        keywords: ['panel', 'tile', 'container', 'surface'],
      },
      {
        id: 'tables',
        title: 'Tables',
        blurb: 'Sorting, filtering, search, pagination, selection, sticky headers, responsive.',
        keywords: ['data grid', 'datatable', 'rows', 'columns', 'sort', 'pagination'],
      },
      {
        id: 'badges',
        title: 'Badges',
        blurb: 'Read-only status labels, counts, and the colour-alone trap.',
        keywords: ['tag', 'pill', 'label', 'status', 'count', 'notification dot'],
      },
      {
        id: 'chips',
        title: 'Chips',
        blurb: 'Filter chips, input tokens, and removable selections.',
        keywords: ['tag', 'token', 'filter', 'facet', 'pill'],
      },
    ],
  },

  {
    id: 'feedback',
    title: 'Feedback',
    icon: 'MessageSquareWarning',
    description: 'Telling the user what just happened.',
    pages: [
      {
        id: 'alerts',
        title: 'Alerts',
        blurb: 'Persistent, in-flow messages and the four severity levels.',
        keywords: ['banner', 'callout', 'inline message', 'notification', 'warning'],
      },
      {
        id: 'toasts',
        title: 'Toasts',
        blurb: 'Transient confirmations, duration maths, and what never belongs in one.',
        keywords: ['notification', 'popup', 'transient', 'temporary'],
      },
      {
        id: 'snackbars',
        title: 'Snackbars',
        blurb: 'One line, one action, bottom centre — and Undo instead of "Are you sure?".',
        keywords: ['undo', 'material', 'bottom', 'notification'],
      },
      {
        id: 'progress',
        title: 'Progress',
        blurb: 'Linear, circular, determinate, indeterminate, and the perception thresholds.',
        keywords: ['loading', 'spinner', 'bar', 'percent', 'meter'],
      },
      {
        id: 'skeletons',
        title: 'Skeleton Loading',
        blurb: 'Shape-matched placeholders, and the 200ms rule that stops them flashing.',
        keywords: ['placeholder', 'shimmer', 'ghost', 'loading state'],
      },
      {
        id: 'empty-states',
        title: 'Empty States',
        blurb: 'First run, no results, cleared, and error — four states, four different jobs.',
        keywords: ['zero state', 'blank', 'no data', 'onboarding'],
      },
      {
        id: 'error-states',
        title: 'Error States',
        blurb: 'Field, form, page and system errors — and how to write the message.',
        keywords: ['404', '500', 'failure', 'validation', 'retry', 'recovery'],
      },
      {
        id: 'loading-states',
        title: 'Loading States',
        blurb: 'Choosing between spinner, skeleton, optimistic and streaming.',
        keywords: ['spinner', 'suspense', 'optimistic ui', 'latency', 'perceived performance'],
      },
    ],
  },

  {
    id: 'navigation',
    title: 'Navigation',
    icon: 'Compass',
    description: 'Where am I, where can I go, how do I get back.',
    pages: [
      {
        id: 'top-bar',
        title: 'Top Bar',
        blurb: 'App bar anatomy, scroll behaviour, and what earns a slot.',
        keywords: ['app bar', 'header', 'masthead', 'toolbar'],
      },
      {
        id: 'sidebar-nav',
        title: 'Sidebar',
        blurb: 'Persistent navigation, groups, collapse, resize, and depth limits.',
        keywords: ['side nav', 'rail', 'drawer', 'menu', 'tree'],
      },
      {
        id: 'tabs',
        title: 'Tabs',
        blurb: 'Peer views of one object — and the three things tabs are constantly misused for.',
        keywords: ['tabbed', 'segmented', 'panel', 'switcher'],
      },
      {
        id: 'breadcrumbs',
        title: 'Breadcrumbs',
        blurb: 'Location, not history. Truncation, separators, and the current page rule.',
        keywords: ['path', 'hierarchy', 'trail', 'wayfinding'],
      },
      {
        id: 'bottom-navigation',
        title: 'Bottom Navigation',
        blurb: 'Three to five destinations inside the thumb zone.',
        keywords: ['tab bar', 'mobile nav', 'thumb zone'],
      },
      {
        id: 'drawer',
        title: 'Drawer',
        blurb: 'Edge-anchored panels, modal vs non-modal, and keeping context visible.',
        keywords: ['side panel', 'off canvas', 'slide over', 'detail panel'],
      },
      {
        id: 'mega-menu',
        title: 'Mega Menu',
        blurb: 'Wide multi-column menus, hover intent, and the diagonal problem.',
        keywords: ['dropdown menu', 'navigation menu', 'flyout', 'hover intent'],
      },
    ],
  },

  {
    id: 'overlays',
    title: 'Overlays',
    icon: 'SquareStack',
    description: 'Surfaces that sit on top and demand attention.',
    pages: [
      {
        id: 'dialogs',
        title: 'Dialogs',
        blurb: 'Confirmation, wizard, fullscreen, scrollable, error, success and delete.',
        keywords: ['modal', 'popup', 'confirm', 'alert dialog', 'overlay'],
      },
      {
        id: 'bottom-sheet',
        title: 'Bottom Sheet',
        blurb: 'The mobile dialog: thumb-reachable, drag-dismissible, detented.',
        keywords: ['sheet', 'mobile modal', 'action sheet', 'drag'],
      },
    ],
  },

  {
    id: 'patterns',
    title: 'Patterns',
    icon: 'Blocks',
    description: 'Whole screens, assembled from the parts above.',
    pages: [
      {
        id: 'dashboards',
        title: 'Dashboard Layouts',
        blurb: 'Analytics, CRM, admin, kanban, chat and settings — six proven shells.',
        keywords: ['analytics', 'crm', 'admin', 'kanban', 'chat', 'settings', 'layout'],
      },
      {
        id: 'desktop-patterns',
        title: 'Desktop Patterns',
        blurb: 'Master–detail, split view, command palette, keyboard-first, density.',
        keywords: ['master detail', 'split view', 'shortcut', 'power user', 'density'],
      },
      {
        id: 'mobile-patterns',
        title: 'Mobile Patterns',
        blurb: 'Thumb zones, gestures, safe areas, pull to refresh, and touch targets.',
        keywords: ['touch', 'gesture', 'swipe', 'thumb zone', 'safe area', 'responsive'],
      },
    ],
  },

  {
    id: 'principles',
    title: 'Principles',
    icon: 'BrainCircuit',
    description: 'The psychology underneath every rule in this Bible.',
    pages: [
      {
        id: 'ux-rules',
        title: 'UX Rules',
        blurb:
          "Fitts', Hick's, Jakob's, Miller's, Gestalt, progressive disclosure, visual weight and more.",
        keywords: [
          'fitts law',
          'hicks law',
          'jakobs law',
          'millers law',
          'gestalt',
          'cognitive load',
          'progressive disclosure',
          'recognition over recall',
          'eye tracking',
          'visual hierarchy',
          'psychology',
        ],
      },
    ],
  },
]

/* -- derived indices ------------------------------------------------------ */

export const ALL_PAGES: (NavPage & { group: string; groupId: string })[] = NAV.flatMap((g) =>
  g.pages.map((p) => ({ ...p, group: g.title, groupId: g.id })),
)

export const PAGE_BY_ID = new Map(ALL_PAGES.map((p) => [p.id, p]))

export const PAGE_ORDER = ALL_PAGES.map((p) => p.id)

export function neighbours(id: string) {
  const i = PAGE_ORDER.indexOf(id)
  return {
    prev: i > 0 ? PAGE_BY_ID.get(PAGE_ORDER[i - 1]) : undefined,
    next: i >= 0 && i < PAGE_ORDER.length - 1 ? PAGE_BY_ID.get(PAGE_ORDER[i + 1]) : undefined,
  }
}

/* -- fuzzy-ish search ----------------------------------------------------- */

export interface SearchHit {
  page: NavPage & { group: string; groupId: string }
  score: number
  matched: 'title' | 'keyword' | 'blurb'
}

/**
 * Scoring is deliberately blunt: an exact prefix on the title beats everything,
 * then substring in title, then a keyword hit, then the blurb. Anything cleverer
 * (Levenshtein, trigram) surfaces surprising results, and in a reference tool a
 * surprising result is worse than no result.
 */
export function searchPages(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)

  return ALL_PAGES.map((page): SearchHit | null => {
    const title = page.title.toLowerCase()
    const blurb = page.blurb.toLowerCase()
    const keys = (page.keywords ?? []).join(' ').toLowerCase()

    let score = 0
    let matched: SearchHit['matched'] = 'blurb'

    for (const t of terms) {
      if (title === t) score += 120
      else if (title.startsWith(t)) score += 80
      else if (title.includes(t)) score += 50
      else if (keys.includes(t)) score += 26
      else if (blurb.includes(t)) score += 10
      else if (page.group.toLowerCase().includes(t)) score += 6
      else return null // every term must match something
    }

    if (title.includes(terms[0])) matched = 'title'
    else if (keys.includes(terms[0])) matched = 'keyword'

    return { page, score, matched }
  })
    .filter((h): h is SearchHit => h !== null)
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
}
