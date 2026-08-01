/* ===========================================================================
   THE MAP
   One declaration of every page in the Bible. The sidebar, the command
   palette, the search index, and prev/next navigation are all derived from
   this — there is no second list to keep in sync.

   Two levels, and only two. A SECTION is the top-level heading in the
   sidebar; it either owns pages directly (Foundations, Patterns, Principles)
   or it owns GROUPS that own pages (Components). Three levels of nesting is
   where a sidebar stops being scannable, so the structure makes a third
   level impossible rather than discouraged.

   ---------------------------------------------------------------------------
   THE ONE-PURPOSE RULE
   Every component in here does exactly one job that no other component does.
   The industry ships four names for the same box — modal, dialog, popup,
   lightbox — and a developer choosing between them is doing archaeology
   instead of work. So each component has one canonical name, and every other
   name for it is recorded in `aliases`. Aliases are searchable and shown on
   the page, which means looking up "snackbar" finds Toast and *tells you*
   that we call it Toast. The vocabulary converges instead of forking.

   Two entries collapse into one when they differ only by:
     · placement   — a bottom app bar is an App Bar; a bottom sheet is a Drawer
     · trigger     — a hover card is a Popover raised on hover
     · size        — a navigation rail is a Sidebar at its collapsed width
     · vendor      — a snackbar is a Toast with a Material accent
   They stay separate when the behaviour, the failure modes and the
   accessibility contract differ. Not before.
   ======================================================================== */

export interface NavPage {
  id: string
  title: string
  /** Shown under the title in search results. */
  blurb: string
  /**
   * Other systems' names for this exact component. Searchable, and surfaced
   * in the UI so the reader learns the canonical name instead of guessing.
   * If a name appears here it must not appear as a page anywhere else.
   */
  aliases?: string[]
  /** Extra search terms — concepts, not synonyms. */
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
}

export interface NavSection {
  id: string
  title: string
  icon: string
  description: string
  /** A section that owns pages directly. Mutually exclusive with `groups`. */
  pages?: NavPage[]
  /** A section that owns groups, each owning pages. */
  groups?: NavGroup[]
  /** Collapsed by default when the sidebar first loads. */
  collapsed?: boolean
}

/* ===========================================================================
   FOUNDATIONS
   ======================================================================== */

const FOUNDATIONS: NavPage[] = [
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
    aliases: ['Text', 'Heading', 'Type Scale'],
    keywords: ['font', 'line height', 'measure', 'leading', 'tracking'],
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
    aliases: ['Container', 'Stack', 'Flex'],
    keywords: ['columns', 'gutter', 'layout', 'css grid'],
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
    aliases: ['Icon', 'Glyph', 'Pictogram'],
    keywords: ['iconography', 'svg', 'lucide'],
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
]

/* ===========================================================================
   COMPONENTS · NAVIGATION
   ======================================================================== */

const NAVIGATION: NavPage[] = [
  {
    id: 'app-bar',
    title: 'App Bar',
    blurb:
      'The persistent bar that names the current screen and carries its top-level actions. Top by default, bottom within thumb reach on touch.',
    aliases: ['Top App Bar', 'Bottom App Bar', 'Navbar', 'Header', 'Masthead', 'Title Bar'],
    keywords: ['scroll behaviour', 'sticky', 'elevation on scroll', 'brand', 'account menu'],
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    blurb:
      'Persistent vertical navigation. Expanded, rail, or overlay — one component at three widths, not three components.',
    aliases: ['Navigation Drawer', 'Navigation Rail', 'Side Nav', 'Rail'],
    keywords: ['groups', 'collapse', 'resize', 'depth limit', 'active indicator', 'persistent'],
  },
  {
    id: 'bottom-navigation',
    title: 'Bottom Navigation',
    blurb:
      'Three to five destinations inside the thumb zone. The phone’s answer to a sidebar, and the only navigation allowed to occupy the bottom edge.',
    aliases: ['Tab Bar', 'Navigation Bar', 'Mobile Nav'],
    keywords: ['thumb zone', 'safe area', 'destinations', 'mobile'],
  },
  {
    id: 'tabs',
    title: 'Tabs',
    blurb:
      'Peer views of one object, switched in place — and the three things tabs are constantly misused for.',
    aliases: ['Tab List', 'Tab Panel', 'Tabbed Interface'],
    keywords: ['panel', 'switcher', 'scrollable tabs', 'roving tabindex'],
  },
  {
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    blurb: 'Location, not history. Truncation, separators, and the current-page rule.',
    aliases: ['Breadcrumb Trail', 'Path'],
    keywords: ['hierarchy', 'wayfinding', 'ancestors'],
  },
  {
    id: 'pagination',
    title: 'Pagination',
    blurb:
      'Splitting a long result set into pages a user can return to. Numbers, cursors, load-more, and when infinite scroll quietly loses people.',
    aliases: ['Pager', 'Load More', 'Infinite Scroll'],
    keywords: ['page size', 'cursor', 'offset', 'results', 'next previous'],
  },
  {
    id: 'menu',
    title: 'Menu',
    blurb:
      'A transient list of commands raised by a trigger. Everything the industry calls a "dropdown" that runs an action rather than setting a value is this.',
    // "Dropdown" belongs to Select, which is the far commoner meaning. A menu
    // is a "dropdown menu" — a longer string, but an unambiguous one.
    aliases: [
      'Dropdown Menu',
      'Overflow Menu',
      'Kebab Menu',
      'Context Menu',
      'Action Menu',
      'More Menu',
    ],
    keywords: ['menuitem', 'submenu', 'checkable', 'shortcut', 'right click', 'popup menu'],
  },
  {
    id: 'mega-menu',
    title: 'Mega Menu',
    blurb: 'Wide multi-column navigation, hover intent, and the diagonal problem.',
    aliases: ['Flyout', 'Navigation Menu', 'Mega Nav', 'Drop-down Nav'],
    keywords: ['multi-column', 'hover intent', 'safe triangle', 'marketing nav'],
  },
  {
    id: 'tree-view',
    title: 'Tree View',
    blurb:
      'Nested, expandable hierarchy with roving focus — files, org charts, category trees and anything else that is genuinely a tree.',
    aliases: ['File Tree', 'Hierarchy', 'Nested List', 'Explorer'],
    keywords: ['expand', 'collapse', 'branch', 'leaf', 'aria-expanded', 'virtualisation'],
  },
]

/* ===========================================================================
   COMPONENTS · ACTIONS
   ======================================================================== */

const ACTIONS: NavPage[] = [
  {
    id: 'button',
    title: 'Button',
    blurb:
      'Eight variants, four sizes, and the rule that governs all of them: one filled button per view.',
    aliases: ['CTA', 'Icon Button', 'FAB', 'Floating Action Button', 'Link Button'],
    keywords: ['submit', 'action', 'loading', 'destructive', 'variant', 'hierarchy'],
  },
  {
    id: 'button-group',
    title: 'Button Group',
    blurb:
      'Two to five related buttons rendered as one unit — shared border, shared purpose, one focus model.',
    aliases: ['Joined Buttons', 'Segmented Button', 'Action Group'],
    keywords: ['grouped', 'attached', 'toolbar', 'role group'],
  },
  {
    id: 'split-button',
    title: 'Split Button',
    blurb:
      'One obvious default action plus a menu of alternatives, in a single control. The compromise that stops a toolbar growing a sixth button.',
    aliases: ['Menu Button', 'Dropdown Button'],
    keywords: ['default action', 'chevron', 'secondary actions', 'save as'],
  },
  {
    id: 'toolbar',
    title: 'Toolbar',
    blurb:
      'The action strip for a region — roving focus, dividers, and overflow that degrades in a predictable order.',
    aliases: ['Action Bar', 'Bulk Action Bar', 'Editor Toolbar', 'Formatting Bar'],
    keywords: ['role toolbar', 'roving tabindex', 'overflow', 'bulk actions', 'selection'],
  },
  {
    id: 'code-snippet',
    title: 'Code Snippet',
    blurb:
      'Read-only code with a copy affordance that confirms it actually copied. Inline, single-line and multi-line, plus the copy button everywhere else it appears.',
    aliases: ['Copy to Clipboard', 'Copy Button', 'Code Block', 'Pre'],
    keywords: ['syntax highlighting', 'clipboard', 'terminal', 'command', 'api key'],
  },
  {
    id: 'command-palette',
    title: 'Command Palette',
    blurb:
      'Keyboard-first search across every action and destination in the product. For power users it becomes the entire interface.',
    aliases: ['Quick Open', 'Spotlight', 'Omnibox', 'Launcher', 'Cmd+K'],
    keywords: ['fuzzy search', 'shortcut', 'recents', 'run command', 'keyboard first'],
  },
]

/* ===========================================================================
   COMPONENTS · INPUTS
   ======================================================================== */

const INPUTS: NavPage[] = [
  {
    id: 'text-field',
    title: 'Text Field',
    blurb:
      'Single-line free text. Label, helper, error, adornments and counters — the anatomy every other field in this section inherits.',
    aliases: ['Text Input', 'Input', 'Textbox', 'Email Field', 'URL Field'],
    keywords: ['form control', 'placeholder', 'helper text', 'validation', 'prefix', 'suffix'],
  },
  {
    id: 'textarea',
    title: 'Textarea',
    blurb:
      'Multi-line free text — autosize, character counters, resize affordances, and an Enter key that must not submit the form.',
    aliases: ['Multiline Input', 'Comment Box', 'Text Area'],
    keywords: ['autosize', 'rows', 'counter', 'resize', 'long form'],
  },
  {
    id: 'number-input',
    title: 'Number Input',
    blurb:
      'Constrained numeric entry with steppers, clamping, locale formatting, and no scroll-wheel surprises.',
    // Not "Spinner" — that word belongs to Progress Indicator everywhere except
    // the HTML spec. "Spin Button" is the ARIA role and reads unambiguously.
    aliases: ['Spin Button', 'Numeric Stepper', 'Quantity Input', 'Currency Input'],
    keywords: ['min max step', 'increment', 'decimal', 'inputmode numeric'],
  },
  {
    id: 'password-input',
    title: 'Password Input',
    blurb:
      'Reveal toggle, caps-lock warning, strength meter, correct autocomplete tokens — and why blocking paste makes accounts less secure, not more.',
    aliases: ['Secret Field', 'Passphrase Input'],
    keywords: ['reveal', 'strength', 'autocomplete new-password', 'caps lock', 'credentials'],
  },
  {
    id: 'search-input',
    title: 'Search Input',
    blurb:
      'Query entry with a clear button, a debounce, suggestions, and recent searches. The only field where a placeholder can replace a label.',
    aliases: ['Search Box', 'Search Bar', 'Query Field'],
    keywords: ['debounce', 'clear', 'suggestions', 'recent', 'submit on enter', 'role searchbox'],
  },
  {
    id: 'phone-input',
    title: 'Phone Input',
    blurb:
      'Country selector, live formatting as the user types, and storing E.164 no matter what shape it was entered in.',
    aliases: ['Tel Input', 'Country Code Input'],
    keywords: ['e164', 'dial code', 'flag', 'formatting', 'international'],
  },
  {
    id: 'json-input',
    title: 'JSON Input',
    blurb:
      'Structured-data entry with syntax highlighting, live validation, and an error message that says which line broke.',
    aliases: ['Code Editor', 'YAML Editor', 'Config Field'],
    keywords: ['schema', 'linting', 'monospace', 'format', 'parse error'],
  },
  {
    id: 'select',
    title: 'Select',
    blurb: 'Pick one from a closed list you can see. No typing, no free values, no surprises.',
    aliases: ['Dropdown', 'Listbox', 'Picker', 'Native Select'],
    keywords: ['option', 'optgroup', 'single choice', 'closed list'],
  },
  {
    id: 'combobox',
    title: 'Combobox',
    blurb:
      'Type to filter a list — and, when the field allows it, commit a value that was never in the list.',
    aliases: ['Autocomplete', 'Typeahead', 'Autosuggest', 'Searchable Select'],
    keywords: ['filter', 'async options', 'aria-activedescendant', 'free solo', 'suggestions'],
  },
  {
    id: 'multi-select',
    title: 'Multi-select',
    blurb:
      'Pick several. Selections become removable tokens inside the field so the chosen set stays readable without reopening anything.',
    aliases: ['Tag Picker', 'Token Input', 'Tags Input', 'Chips Input'],
    keywords: ['multiple', 'tokens', 'create option', 'max selections', 'backspace'],
  },
  {
    id: 'transfer-list',
    title: 'Transfer List',
    blurb:
      'Two panes — available and selected — for assigning from a large fixed set where the result must be reviewable as a list.',
    aliases: ['Dual Listbox', 'Pick List', 'List Builder'],
    keywords: ['move', 'assign', 'permissions', 'bulk', 'reorder'],
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    blurb: 'Independent choices, indeterminate parents, and checkbox groups.',
    aliases: ['Tickbox', 'Check Input'],
    keywords: ['multi-select', 'indeterminate', 'consent', 'select all'],
  },
  {
    id: 'radio-button',
    title: 'Radio Button',
    blurb:
      'Mutually exclusive choices — as a plain list, as cards for high-stakes decisions, or as a segmented control when there are two or three.',
    aliases: ['Radio Group', 'Segmented Control', 'Content Switcher', 'Option Button'],
    keywords: ['single choice', 'exclusive', 'default selection', 'card radio'],
  },
  {
    id: 'switch',
    title: 'Switch',
    blurb: 'Instant, self-saving binary settings — and how to tell when it should be a checkbox.',
    aliases: ['Toggle', 'On/Off', 'Toggle Switch'],
    keywords: ['setting', 'preference', 'immediate', 'optimistic'],
  },
  {
    id: 'slider',
    title: 'Slider',
    blurb:
      'A value on a continuum, for when the approximate position matters more than the exact number.',
    aliases: ['Range', 'Scrubber', 'Track'],
    keywords: ['range', 'two thumb', 'ticks', 'step', 'volume', 'zoom'],
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    blurb: 'Swatches first, spectrum second, hex field always. Alpha only when it is really needed.',
    aliases: ['Swatch Picker', 'Eyedropper', 'Hex Input'],
    keywords: ['hsl', 'rgb', 'alpha', 'palette', 'contrast check'],
  },
  {
    id: 'date-picker',
    title: 'Date Picker',
    blurb:
      'A calendar you can also type into. Ranges, presets, disabled dates, and the time-zone question you must answer before building it.',
    aliases: ['Calendar', 'Date Range Picker', 'Datetime Picker'],
    keywords: ['range', 'presets', 'timezone', 'locale', 'min max date'],
  },
  {
    id: 'time-picker',
    title: 'Time Picker',
    blurb:
      'Discrete time entry. A stepped list beats a clock face on every device that has a keyboard.',
    aliases: ['Clock Picker', 'Duration Input'],
    keywords: ['12 hour', '24 hour', 'interval', 'timezone', 'meridiem'],
  },
  {
    id: 'file-upload',
    title: 'File Upload',
    blurb:
      'Drop zone, file list, per-file progress, retry — and the validation that has to happen before a byte is sent.',
    aliases: ['Dropzone', 'File Input', 'Attachment', 'Drag and Drop'],
    keywords: ['multipart', 'accept', 'max size', 'preview', 'progress', 'resumable'],
  },
  {
    id: 'pin-input',
    title: 'Pin Input',
    blurb:
      'Fixed-length codes in per-digit boxes, with paste that fills every box and SMS autofill that actually fires.',
    aliases: ['OTP Input', 'Verification Code', '2FA Code'],
    keywords: ['one time password', 'autocomplete one-time-code', 'paste', 'auto advance'],
  },
  {
    id: 'rating',
    title: 'Rating',
    blurb:
      'Collecting or displaying a score. Read-only and interactive share one anatomy, and half-stars need a real reason.',
    aliases: ['Stars', 'Score', 'NPS'],
    keywords: ['review', 'feedback', 'five star', 'half star', 'aggregate'],
  },
  {
    id: 'form',
    title: 'Form',
    blurb:
      'Layout, grouping, validation timing and submission — the container everything above lives inside.',
    aliases: ['Fieldset', 'Wizard', 'Multi-step Form'],
    keywords: ['validation', 'checkout', 'signup', 'login', 'settings', 'error summary'],
  },
]

/* ===========================================================================
   COMPONENTS · FEEDBACK
   ======================================================================== */

const FEEDBACK: NavPage[] = [
  {
    id: 'dialog',
    title: 'Dialog',
    blurb:
      'A modal surface that blocks the page until it is answered. Confirmation, wizard, fullscreen, scrollable and destructive.',
    aliases: ['Modal', 'Popup', 'Alert Dialog', 'Confirm', 'Lightbox'],
    keywords: ['focus trap', 'scrim', 'escape', 'blocking', 'confirmation'],
  },
  {
    id: 'toast',
    title: 'Toast',
    blurb:
      'A transient, self-dismissing confirmation carrying at most one action. Undo belongs here; errors do not.',
    aliases: ['Notification', 'Snackbar', 'Flash Message', 'Growl'],
    keywords: ['transient', 'undo', 'auto dismiss', 'stacking', 'aria-live', 'duration'],
  },
  {
    id: 'banner',
    title: 'Banner',
    blurb:
      'A persistent, in-flow message tied to a region or a page. Four severity levels, and the one that is allowed to be dismissed.',
    aliases: ['Alert', 'Inline Notification', 'Callout', 'Message Bar', 'Notice'],
    keywords: ['severity', 'info warning error success', 'persistent', 'inline', 'system status'],
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    blurb:
      'A short label on hover or focus. Text only, never interactive, and never the only place information exists.',
    aliases: ['Hint', 'Title Tip', 'Label Tip'],
    keywords: ['delay', 'placement', 'aria-describedby', 'touch', 'icon button label'],
  },
  {
    id: 'popover',
    title: 'Popover',
    blurb:
      'Interactive content anchored to a trigger and dismissible with no consequence — including the hover-raised preview card.',
    aliases: ['Hover Card', 'Coach Mark', 'Detail Popup', 'Anchored Overlay'],
    keywords: ['anchor', 'placement', 'collision', 'hover intent', 'dismiss', 'arrow'],
  },
  {
    id: 'progress-indicator',
    title: 'Progress Indicator',
    blurb:
      'Linear, circular, determinate, indeterminate — and the perception thresholds that decide which one you owe the user.',
    aliases: ['Spinner', 'Loader', 'Progress Bar', 'Meter', 'Activity Indicator', 'Loading'],
    keywords: ['percent', 'indeterminate', 'steps', '100ms 1s 10s', 'aria-busy'],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    blurb: 'Shape-matched placeholders, and the 200ms rule that stops them flashing.',
    aliases: ['Shimmer', 'Placeholder', 'Ghost Loading'],
    keywords: ['loading', 'layout shift', 'perceived performance', 'pulse'],
  },
]

/* ===========================================================================
   COMPONENTS · SURFACES
   ======================================================================== */

const SURFACES: NavPage[] = [
  {
    id: 'card',
    title: 'Card',
    blurb:
      'A bounded container for one object. Elevation, interactive cards, and the cases where a card is the wrong container.',
    aliases: ['Tile', 'Panel', 'Media Card'],
    keywords: ['grouping', 'surface', 'clickable card', 'card grid', 'header footer'],
  },
  {
    id: 'accordion',
    title: 'Accordion',
    blurb:
      'Progressive disclosure in place — one section open or many, and the content that must never be hidden inside one.',
    aliases: ['Collapse', 'Disclosure', 'Expander', 'Spoiler', 'Show More', 'Details'],
    keywords: ['expand', 'faq', 'aria-expanded', 'single open', 'chevron'],
  },
  {
    id: 'drawer',
    title: 'Drawer',
    blurb:
      'An edge-anchored panel over the page — right, left, or bottom with drag detents on touch. Modal and non-modal.',
    aliases: ['Bottom Sheet', 'Side Sheet', 'Side Panel', 'Off-canvas', 'Slide-over', 'Action Sheet'],
    keywords: ['edge', 'detent', 'drag to dismiss', 'detail panel', 'non-modal', 'thumb zone'],
  },
  {
    id: 'backdrop',
    title: 'Backdrop',
    blurb:
      'The scrim beneath every overlay. Opacity, blur, click-through, scroll locking, and stacking when two overlays collide.',
    aliases: ['Scrim', 'Overlay', 'Dim Layer'],
    keywords: ['z-index', 'scroll lock', 'click outside', 'inert', 'stacking context'],
  },
  {
    id: 'divider',
    title: 'Divider',
    blurb:
      'A hairline that separates — and the far more common case where spacing already did the job and a line is just noise.',
    aliases: ['Separator', 'Rule', 'HR'],
    keywords: ['hairline', 'role separator', 'section break', 'inset', 'vertical divider'],
  },
  {
    id: 'carousel',
    title: 'Carousel',
    blurb:
      'Sequential content shown one frame at a time, with the accessibility and engagement debt that always comes attached.',
    // Not "Slider" — that is a form control in Inputs, and one word cannot be
    // both a value picker and a content rotator.
    aliases: ['Slideshow', 'Content Slider', 'Coverflow'],
    keywords: ['autoplay', 'dots', 'swipe', 'snap', 'peek', 'pause'],
  },
  {
    id: 'jumbotron',
    title: 'Jumbotron',
    blurb:
      'The full-width opening statement of a page: one heading, one sentence, one action, and nothing else competing.',
    aliases: ['Hero', 'Hero Banner', 'Splash', 'Page Header'],
    keywords: ['landing', 'above the fold', 'marketing', 'headline', 'background image'],
  },
]

/* ===========================================================================
   COMPONENTS · DATA DISPLAY
   ======================================================================== */

const DATA_DISPLAY: NavPage[] = [
  {
    id: 'avatar',
    title: 'Avatar',
    blurb:
      'A person or entity reduced to one glyph. Image, initials, fallback order, presence, and stacked groups.',
    aliases: ['Profile Picture', 'User Image', 'Gravatar', 'Avatar Group'],
    keywords: ['initials', 'fallback', 'presence', 'stack', 'alt text'],
  },
  {
    id: 'badge',
    title: 'Badge',
    blurb: 'Read-only status labels and counts — and the colour-alone trap that makes them fail.',
    aliases: ['Tag', 'Pill', 'Label', 'Status Indicator', 'Counter', 'Dot'],
    keywords: ['status', 'count', 'notification dot', 'severity', 'read only'],
  },
  {
    id: 'chip',
    title: 'Chip',
    blurb:
      'The interactive cousin of the badge — filters that toggle and tokens that remove, at a height that never reads as a button.',
    aliases: ['Filter Chip', 'Token', 'Facet', 'Removable Tag'],
    keywords: ['filter', 'aria-pressed', 'remove', 'applied filters', 'multi-select'],
  },
  {
    id: 'list',
    title: 'List',
    blurb:
      'Vertical rows of items — single-line, two-line, with leading and trailing content, or as key–value pairs.',
    aliases: ['Structured List', 'Description List', 'Definition List', 'Item List'],
    keywords: ['list item', 'dividers', 'dense', 'key value', 'summary', 'ordered'],
  },
  {
    id: 'data-table',
    title: 'Data Table',
    blurb:
      'Sorting, filtering, search, selection, pagination, sticky headers, and the responsive collapse that keeps it usable on a phone.',
    aliases: ['Table', 'Data Grid', 'Grid'],
    keywords: ['rows', 'columns', 'sort', 'bulk select', 'column resize', 'virtualisation'],
  },
  {
    id: 'timeline',
    title: 'Timeline',
    blurb:
      'Ordered events on an axis — activity feeds, audit trails, release histories and delivery tracking.',
    aliases: ['Activity Feed', 'Event Log', 'History', 'Stepper', 'Step Indicator'],
    keywords: ['chronological', 'milestone', 'audit', 'progress steps', 'connector'],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    blurb:
      'A grid of media with a lightbox. Aspect ratios, gutters, lazy loading and keyboard traversal.',
    aliases: ['Image List', 'Image Grid', 'Masonry', 'Photo Grid'],
    keywords: ['lightbox', 'thumbnail', 'aspect ratio', 'lazy load', 'zoom'],
  },
  {
    id: 'chart',
    title: 'Chart',
    blurb:
      'Encoding data as position, length and colour — and the four chart types that honestly cover ninety per cent of cases.',
    aliases: ['Graph', 'Plot', 'Sparkline', 'Data Visualisation'],
    keywords: ['axis', 'legend', 'tooltip', 'series', 'categorical palette', 'accessible data'],
  },
  {
    id: 'qr-code',
    title: 'QR Code',
    blurb:
      'Size, quiet zone, error correction level — and always printing the destination as text beside it.',
    aliases: ['2D Barcode', 'Scan Code'],
    keywords: ['scan', 'error correction', 'quiet zone', 'contrast', 'pairing'],
  },
  {
    id: 'ai-label',
    title: 'AI Label',
    blurb:
      'Disclosing that content was generated or assisted by a model, and giving the reader a way to find out how.',
    aliases: ['AI Badge', 'AI Slug', 'Generated by AI'],
    keywords: ['disclosure', 'provenance', 'explainability', 'transparency', 'sparkle'],
  },
  {
    id: 'kbd',
    title: 'KBD',
    blurb:
      'Rendering a physical key. Platform-correct glyphs, chord ordering, and never inventing a symbol.',
    aliases: ['Keycap', 'Shortcut', 'Hotkey', 'Key'],
    keywords: ['keyboard', 'chord', 'modifier', 'meta', 'shortcut hint'],
  },
]

/* ===========================================================================
   COMPONENTS · MEDIA
   ======================================================================== */

const MEDIA: NavPage[] = [
  {
    id: 'image',
    title: 'Image',
    blurb:
      'Aspect-ratio boxes, srcset, lazy loading, placeholders, and alt text that earns the space it takes up.',
    aliases: ['Picture', 'Figure', 'Thumbnail'],
    keywords: ['srcset', 'object-fit', 'lazy', 'blur up', 'cls', 'alt'],
  },
  {
    id: 'video',
    title: 'Video',
    blurb:
      'Player controls, poster frames, captions, and the autoplay rules that keep it legal and quiet.',
    aliases: ['Player', 'Media Player', 'Audio'],
    keywords: ['captions', 'poster', 'autoplay', 'muted', 'transcript', 'controls'],
  },
  {
    id: 'link',
    title: 'Link',
    blurb:
      'Inline navigation. Underlines, visited state, external indicators, and never the words "click here".',
    aliases: ['Anchor', 'Hyperlink', 'Text Link'],
    keywords: ['href', 'external', 'target blank', 'visited', 'focus', 'link text'],
  },
]

/* ===========================================================================
   PATTERNS & PRINCIPLES
   ======================================================================== */

const PATTERNS: NavPage[] = [
  {
    id: 'dashboards',
    title: 'Dashboard Layouts',
    blurb: 'Analytics, CRM, admin, kanban, chat and settings — six proven shells.',
    keywords: ['analytics', 'crm', 'admin', 'kanban', 'chat', 'settings', 'layout'],
  },
  {
    id: 'desktop-patterns',
    title: 'Desktop Patterns',
    blurb: 'Master–detail, split view, keyboard-first interaction and density.',
    keywords: ['master detail', 'split view', 'shortcut', 'power user', 'density'],
  },
  {
    id: 'mobile-patterns',
    title: 'Mobile Patterns',
    blurb: 'Thumb zones, gestures, safe areas, pull to refresh, and touch targets.',
    keywords: ['touch', 'gesture', 'swipe', 'thumb zone', 'safe area', 'responsive'],
  },
  {
    id: 'empty-states',
    title: 'Empty States',
    blurb: 'First run, no results, cleared, and error — four states doing four different jobs.',
    aliases: ['Zero State', 'Blank Slate', 'No Data'],
    keywords: ['onboarding', 'no results', 'first run'],
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
    keywords: ['suspense', 'optimistic ui', 'latency', 'perceived performance'],
  },
]

const PRINCIPLES: NavPage[] = [
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
]

/* ===========================================================================
   THE TREE
   ======================================================================== */

export const NAV: NavSection[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    icon: 'Layers',
    description: 'The decisions everything else is built on.',
    pages: FOUNDATIONS,
  },
  {
    id: 'components',
    title: 'Components',
    icon: 'Component',
    description: 'Every part we ship. One job each, one name each.',
    groups: [
      {
        id: 'navigation',
        title: 'Navigation',
        icon: 'Compass',
        description: 'Where am I, where can I go, how do I get back.',
        pages: NAVIGATION,
      },
      {
        id: 'actions',
        title: 'Actions',
        icon: 'MousePointerClick',
        description: 'Everything a user can press to make something happen.',
        pages: ACTIONS,
      },
      {
        id: 'inputs',
        title: 'Inputs',
        icon: 'TextCursorInput',
        description: 'Getting data out of a human without annoying them.',
        pages: INPUTS,
      },
      {
        id: 'feedback',
        title: 'Feedback',
        icon: 'MessageSquareWarning',
        description: 'Telling the user what just happened, or what is about to.',
        pages: FEEDBACK,
      },
      {
        id: 'surfaces',
        title: 'Surfaces',
        icon: 'SquareStack',
        description: 'The containers everything else sits on, in and under.',
        pages: SURFACES,
      },
      {
        id: 'data-display',
        title: 'Data Display',
        icon: 'LayoutGrid',
        description: 'Showing information without burying it.',
        pages: DATA_DISPLAY,
      },
      {
        id: 'media',
        title: 'Media',
        icon: 'Image',
        description: 'Content we render but did not author.',
        pages: MEDIA,
      },
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    icon: 'Blocks',
    description: 'Whole screens and whole states, assembled from the components above.',
    pages: PATTERNS,
  },
  {
    id: 'principles',
    title: 'Principles',
    icon: 'BrainCircuit',
    description: 'The psychology underneath every rule in this Bible.',
    pages: PRINCIPLES,
  },
]

/* -- derived indices ------------------------------------------------------ */

export interface ResolvedPage extends NavPage {
  /** The immediate parent group's title — "Inputs", or the section for flat ones. */
  group: string
  groupId: string
  /** The top-level section — "Components". */
  section: string
  sectionId: string
  /** "Components · Inputs", or just "Foundations" for a flat section. */
  path: string
}

/**
 * A flat section behaves as a section containing exactly one group named
 * after itself. Collapsing the two shapes here means every consumer below —
 * search, the palette, prev/next — sees one uniform list.
 */
export interface ResolvedGroup extends NavGroup {
  section: string
  sectionId: string
  flat: boolean
}

export const NAV_GROUPS: ResolvedGroup[] = NAV.flatMap((s): ResolvedGroup[] =>
  s.groups
    ? s.groups.map((g) => ({ ...g, section: s.title, sectionId: s.id, flat: false }))
    : [
        {
          id: s.id,
          title: s.title,
          icon: s.icon,
          description: s.description,
          pages: s.pages ?? [],
          section: s.title,
          sectionId: s.id,
          flat: true,
        },
      ],
)

export const ALL_PAGES: ResolvedPage[] = NAV_GROUPS.flatMap((g) =>
  g.pages.map((p) => ({
    ...p,
    group: g.title,
    groupId: g.id,
    section: g.section,
    sectionId: g.sectionId,
    path: g.flat ? g.section : `${g.section} · ${g.title}`,
  })),
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

/* -- alias index ---------------------------------------------------------- */

/**
 * Every name we have deliberately *not* shipped as its own component, mapped
 * to the one we did. This is what lets a developer search "modal" and be told,
 * in one line, that the thing they want is called Dialog here.
 */
export const ALIAS_TO_PAGE = new Map<string, ResolvedPage>()
for (const page of ALL_PAGES) {
  for (const alias of page.aliases ?? []) {
    const key = alias.toLowerCase()
    if (!ALIAS_TO_PAGE.has(key)) ALIAS_TO_PAGE.set(key, page)
  }
}

/**
 * The one-purpose rule is only worth anything if it is enforced. An alias
 * claimed by two components, or an alias that is also somebody's canonical
 * name, means a developer searching that word gets an answer that depends on
 * iteration order — which is the exact ambiguity the aliases exist to remove.
 *
 * Dev-only and loud. Shipping a build with a broken vocabulary is worse than
 * a red console on the machine of the person who broke it.
 */
if (import.meta.env.DEV) {
  const owners = new Map<string, string[]>()
  for (const page of ALL_PAGES) {
    for (const alias of page.aliases ?? []) {
      const key = alias.toLowerCase()
      owners.set(key, [...(owners.get(key) ?? []), page.title])
    }
  }
  const titles = new Map(ALL_PAGES.map((p) => [p.title.toLowerCase(), p.title]))
  const problems: string[] = []
  for (const [key, claimed] of owners) {
    if (claimed.length > 1) {
      problems.push(`"${key}" is claimed by ${claimed.join(' and ')} — it can only mean one.`)
    }
    if (titles.has(key)) {
      problems.push(`"${titles.get(key)}" is a component in its own right, so ${claimed.join(
        ' and ',
      )} must not alias it.`)
    }
  }
  const ids = ALL_PAGES.map((p) => p.id)
  const dupeIds = ids.filter((id, i) => ids.indexOf(id) !== i)
  for (const id of new Set(dupeIds)) problems.push(`Duplicate page id "${id}".`)

  if (problems.length) {
    console.error(
      `[nav] ${problems.length} vocabulary collision(s):\n` + problems.map((p) => `  · ${p}`).join('\n'),
    )
  }
}

/** Resolves either a canonical title or any known alias to its page. */
export function resolveComponent(name: string): ResolvedPage | undefined {
  const n = name.trim().toLowerCase()
  return ALL_PAGES.find((p) => p.title.toLowerCase() === n) ?? ALIAS_TO_PAGE.get(n)
}

/* -- fuzzy-ish search ----------------------------------------------------- */

export interface SearchHit {
  page: ResolvedPage
  score: number
  matched: 'title' | 'alias' | 'keyword' | 'blurb'
  /** The alias that matched, so the UI can say "Snackbar → Toast". */
  via?: string
}

/**
 * Scoring is deliberately blunt: an exact prefix on the title beats
 * everything, then an exact alias — searching "modal" should land on Dialog
 * ahead of any page that merely mentions modals — then substring in title,
 * then keywords, then the blurb. Anything cleverer (Levenshtein, trigram)
 * surfaces surprising results, and in a reference tool a surprising result is
 * worse than no result.
 */
export function searchPages(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)

  return ALL_PAGES.map((page): SearchHit | null => {
    const title = page.title.toLowerCase()
    const blurb = page.blurb.toLowerCase()
    const aliases = (page.aliases ?? []).map((a) => a.toLowerCase())
    const keys = (page.keywords ?? []).join(' ').toLowerCase()

    let score = 0
    let matched: SearchHit['matched'] = 'blurb'
    let via: string | undefined

    for (const t of terms) {
      const exactAlias = aliases.findIndex((a) => a === t)
      const partialAlias = exactAlias === -1 ? aliases.findIndex((a) => a.includes(t)) : -1

      if (title === t) score += 120
      else if (exactAlias !== -1) {
        score += 100
        via ??= page.aliases![exactAlias]
      } else if (title.startsWith(t)) score += 80
      else if (title.includes(t)) score += 50
      else if (partialAlias !== -1) {
        score += 34
        via ??= page.aliases![partialAlias]
      } else if (keys.includes(t)) score += 26
      else if (blurb.includes(t)) score += 10
      else if (page.path.toLowerCase().includes(t)) score += 6
      else return null // every term must match something
    }

    if (title.includes(terms[0])) matched = 'title'
    else if (via) matched = 'alias'
    else if (keys.includes(terms[0])) matched = 'keyword'

    return { page, score, matched, via }
  })
    .filter((h): h is SearchHit => h !== null)
    .sort((a, b) => b.score - a.score || a.page.title.localeCompare(b.page.title))
}
