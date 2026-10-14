import { SONORA } from './sonora-colors'
import type { SiteTheme } from './site-theme'

/* ===========================================================================
   SONORA — the theme of Suno's interface

   Read off suno.com on 2026-10-13, signed out: the landing page, the app shell
   at /explore (sidebar, search, cards, player bar, an open menu, the log-in
   dialog) and the sign-in page. The signed-in product was not read, and where
   that limits what can be said, the entry says so.

   The earlier reading of the same stylesheet is in sonora-colors.ts and is
   still here, under `raw.palette`. It chose twenty swatches the way a palette
   site would — eight hues in pairs and four neutrals — and it is an accurate
   account of what Suno's stylesheet OFFERS. It was a misleading account of
   what Suno LOOKS like, because sixteen of its twenty are colors the interface
   touches a few pixels at a time. Hot pink was "primary" on that page. On the
   site, pink is a notification dot.

   What the interface is actually made of is one neutral ramp ("dumbo",
   nineteen steps from #101012 to #fcfbf9) used at both ends: three near-blacks
   for surfaces, a cream for text and for the one filled button, and white at
   4–15% for every border and every hover. That is what this file records.

   Names in `source` are Suno's, verbatim. Names in `key` are ours.
   ======================================================================== */

const WHITE = '#ffffff'

export const SONORA_THEME: SiteTheme = {
  id: 'sonora',
  title: 'Sonora Palette',
  site: 'Suno',
  source: 'https://suno.com',
  captured: '2026-10-13',
  pages: ['suno.com/home', 'suno.com/explore', 'suno.com/sign-in'],
  namespace: 'sonora',
  credit: 'Read off Suno’s interface, signed out, as it rendered on 2026-10-13.',
  summary:
    'Near-black surfaces three steps deep, cream text, and one cream button. Every border and every hover is white at low alpha, and the only color in the frame is whatever the artwork brings.',
  type: { ui: 'Neue Montreal', display: 'Editorial New' },
  specimen: {
    nav: ['Home', 'Explore', 'Create', 'Library'],
    current: 1,
    search: 'Search for songs, playlists, creators, or genres',
    heading: 'Staff Picks',
    more: 'See all',
    action: 'Log in',
    cards: [
      { title: 'Dead Nights', meta: '164K plays' },
      { title: 'Shades and Styles', meta: '82K plays' },
      { title: 'How it feels', meta: '61K plays' },
    ],
  },

  /* -- surfaces ------------------------------------------------------------
     Three are named and painted. The ramp goes on above them and the
     stylesheet does paint backgrounds with the next two steps, so they are
     listed — as the continuation of the ladder, not as levels anyone was seen
     using. */
  elevation: [
    {
      level: 0,
      key: 'surface-0',
      label: 'Page',
      source: 'background-primary',
      ref: 'dumbo-50',
      hex: '#101012',
      purpose: 'The ground everything stands on. Navigation shares it rather than sitting above it.',
      components: ['Page', 'Sidebar', 'Sticky header'],
      evidence: 'observed',
      basis: '<body> and the sidebar on /explore',
    },
    {
      level: 1,
      key: 'surface-1',
      label: 'Panel',
      source: 'background-secondary',
      ref: 'dumbo-100',
      hex: '#1c1c1f',
      purpose: 'A region that stays put while the page moves, or that takes the page over.',
      components: ['Player bar', 'Search field', 'Dialog'],
      evidence: 'observed',
      basis: 'Player bar, search field and log-in dialog on /explore',
    },
    {
      level: 2,
      key: 'surface-2',
      label: 'Raised',
      source: 'background-tertiary',
      ref: 'dumbo-150',
      hex: '#252529',
      purpose: 'Whatever opens over a panel, and any control that needs a body of its own.',
      components: ['Menu', 'Neutral button', 'Controls in a dialog'],
      evidence: 'observed',
      basis: 'The More menu, carousel arrows and the dialog’s provider buttons',
    },
    {
      level: 3,
      key: 'surface-3',
      label: 'Step above',
      ref: 'dumbo-200',
      hex: '#2e2e33',
      purpose:
        'The next step of the same ramp. The stylesheet paints backgrounds with it, but it has no name and was on none of the pages read.',
      components: [],
      evidence: 'inferred',
      basis: 'A bg-dumbo-200 utility in the stylesheet; no rendered use seen',
    },
    {
      level: 4,
      key: 'surface-4',
      label: 'Step above',
      ref: 'dumbo-250',
      hex: '#38383e',
      purpose: 'The step after that, on the same terms. Reach for these two only for something that must sit on a menu.',
      components: [],
      evidence: 'inferred',
      basis: 'A bg-dumbo-250 utility in the stylesheet; no rendered use seen',
    },
  ],
  elevationNote:
    'The stylesheet also names a background-base, pure black. Nothing on the pages read was painted with it, so it has no level here.',

  placements: [
    {
      component: 'Navigation',
      level: 0,
      treatment: 'Same color as the page. A 1px line at white 15% is the only thing that separates it.',
      evidence: 'observed',
      basis: 'Sidebar on /explore',
    },
    {
      component: 'Cards',
      level: null,
      treatment:
        'No surface. A song is its artwork with two lines of text under it, straight on the page. Marketing cards are a 4% white wash with a 10% white outline, 24px radius.',
      evidence: 'observed',
      basis: 'Song cards on /explore; feature cards on /home',
    },
    {
      component: 'Panels',
      level: 1,
      treatment: 'Flat, edge to edge, a hairline on top. The search field is the same color at 85% with an 8px blur.',
      evidence: 'observed',
      basis: 'Player bar and search field on /explore',
    },
    {
      component: 'Dropdowns',
      level: 2,
      treatment: '8px radius, shadow 0 8px 16px at black 15%, separators at white 10%.',
      evidence: 'observed',
      basis: 'The More menu on /explore',
    },
    {
      component: 'Modals',
      level: 1,
      treatment: '32px radius, a 1px outline at white 8%, no shadow, over a scrim of black at 60%.',
      evidence: 'observed',
      basis: 'The log-in dialog on /explore',
    },
  ],

  states: [
    {
      key: 'state-hover',
      label: 'Hover',
      kind: 'layer',
      source: 'overlay-on-primary',
      ref: 'opacity-white-4',
      hex: WHITE,
      alpha: 0.04,
      purpose: 'One layer for every hover, on any surface. On the cream button it is black at 4% instead.',
      evidence: 'observed',
      basis: '::after on buttons, navigation rows and menu items',
    },
    {
      key: 'state-selected',
      label: 'Selected',
      kind: 'layer',
      hex: WHITE,
      alpha: 0.1,
      purpose: 'The current navigation row. The label also steps up from muted to primary — two signals, not one.',
      evidence: 'observed',
      basis: 'The Explore row on /explore: white 20% at half opacity',
    },
    {
      key: 'state-focus',
      label: 'Focus',
      kind: 'ring',
      source: 'border-focus',
      ref: 'dumbo-900',
      hex: '#f7f4ef',
      purpose: 'A 2px outline in the text color, on anything that takes keyboard focus.',
      evidence: 'observed',
      basis: 'The :focus-visible rule on buttons, tabs and menu items',
    },
    {
      key: 'state-disabled',
      label: 'Disabled',
      kind: 'fill',
      source: 'background-button-inactive',
      ref: 'dumbo-150',
      hex: '#252529',
      ink: '#6a6a72',
      purpose: 'The raised surface with the dimmest text. It reads as present and unavailable rather than as missing.',
      evidence: 'observed',
      basis: 'The [data-disabled] rule on buttons',
    },
  ],

  foregrounds: [
    {
      key: 'fg-primary',
      label: 'Primary',
      source: 'foreground-primary',
      ref: 'dumbo-900',
      hex: '#f7f4ef',
      purpose: 'Body text, headings, the current navigation row. Cream, not white — and #fcfbf9, one step lighter, on menus and dialogs.',
      evidence: 'observed',
      basis: 'Body text on every page read',
    },
    {
      key: 'fg-secondary',
      label: 'Secondary',
      source: 'foreground-secondary',
      ref: 'dumbo-700',
      hex: '#c2c2c1',
      purpose: 'Tab labels at rest and supporting copy. Placeholders are this at 40%.',
      evidence: 'observed',
      basis: 'The tab-list rule; the search field’s placeholder',
    },
    {
      key: 'fg-muted',
      label: 'Muted',
      source: 'foreground-tertiary',
      ref: 'dumbo-600',
      hex: '#a3a3a3',
      purpose: 'Navigation rows that are not current, artist names, play counts.',
      evidence: 'observed',
      basis: 'Sidebar rows and card metadata on /explore',
    },
    {
      key: 'fg-disabled',
      label: 'Disabled',
      source: 'foreground-inactive',
      ref: 'dumbo-450',
      hex: '#6a6a72',
      purpose: 'Text on a control that cannot be used.',
      evidence: 'observed',
      basis: 'The [data-disabled] rule on buttons',
    },
  ],

  borders: [
    {
      key: 'border-subtle',
      label: 'Subtle',
      source: 'border-primary',
      ref: 'opacity-white-10',
      hex: WHITE,
      alpha: 0.1,
      purpose: 'Separators inside a menu, the outline of a secondary button, the edge of a card.',
      evidence: 'observed',
      basis: 'Menu separator, the See all button, marketing cards',
    },
    {
      key: 'border-default',
      label: 'Default',
      source: 'border-secondary',
      ref: 'opacity-white-15',
      hex: WHITE,
      alpha: 0.15,
      purpose: 'A line between two regions of the page.',
      evidence: 'observed',
      basis: 'The sidebar’s right edge on /explore',
    },
    {
      key: 'border-strong',
      label: 'Strong',
      hex: WHITE,
      alpha: 0.3,
      purpose: 'The outline of a text field — the one border that has to be found before it can be used.',
      evidence: 'observed',
      basis: 'The phone field on /sign-in. A utility, not a named token',
    },
    {
      key: 'border-focus',
      label: 'Focus',
      source: 'border-focus',
      ref: 'dumbo-900',
      hex: '#f7f4ef',
      purpose: 'The focus outline. The same value as primary text.',
      evidence: 'observed',
      basis: 'The :focus-visible rule on buttons, tabs and menu items',
    },
  ],

  semantic: [
    {
      key: 'success',
      label: 'Success',
      source: 'accent-success',
      ref: 'grass-500',
      hex: '#4aab04',
      purpose: 'A progress bar that finished.',
      evidence: 'observed',
      basis: 'The progress component’s success variant',
    },
    {
      key: 'warning',
      label: 'Warning',
      source: 'accent-warning',
      ref: 'dandelion-700',
      hex: '#f5d907',
      purpose: 'A progress bar running out of room.',
      evidence: 'observed',
      basis: 'The progress component’s warning variant',
    },
    {
      key: 'error',
      label: 'Error',
      source: 'accent-error',
      ref: 'vermilion-500',
      hex: '#f8441b',
      purpose: 'Destructive menu items, an error count, a failed progress bar.',
      evidence: 'observed',
      basis: 'The destructive menu-item rule and the error count badge',
    },
    {
      key: 'info',
      label: 'Information',
      source: 'accent-blue',
      ref: 'dodger-blue-600',
      hex: '#1f8bff',
      purpose: 'Suno names no information role. This is the blue it tints notices with, at 10–20%.',
      evidence: 'inferred',
      basis: 'bg-accent-blue/10 and border-accent-blue utilities; no "info" token exists',
    },
  ],

  buttons: [
    {
      key: 'button-primary',
      label: 'Primary',
      source: 'variant-primary',
      fill: { hex: '#f7f4ef' },
      ink: '#101012',
      radius: '9999px',
      purpose: 'The one filled action on a screen: Log in, Join, Subscribe.',
      evidence: 'observed',
      basis: 'Log in in the sidebar; Join Suno for free in the header',
    },
    {
      key: 'button-secondary',
      label: 'Secondary',
      source: 'variant-secondary-legacy',
      fill: null,
      ink: '#fcfbf9',
      border: { hex: WHITE, alpha: 0.1 },
      radius: '9999px',
      purpose: 'An action beside a heading, or the quieter of a pair.',
      evidence: 'observed',
      basis: 'See all on /explore; Log in in the header',
    },
    {
      key: 'button-neutral',
      label: 'Neutral',
      source: 'variant-standard-legacy',
      fill: { hex: '#252529' },
      ink: '#f7f4ef',
      radius: '9999px',
      purpose: 'Icon buttons, carousel arrows, a row of equal choices.',
      evidence: 'observed',
      basis: 'Carousel arrows; the provider buttons in the log-in dialog (12px radius there)',
    },
    {
      key: 'button-ghost',
      label: 'Ghost',
      source: 'variant-tertiary-legacy',
      fill: null,
      ink: '#f7f4ef',
      radius: '9999px',
      purpose: 'Navigation rows and anything that should be a label until the pointer finds it.',
      evidence: 'observed',
      basis: 'Sidebar rows on /explore',
    },
  ],

  shapes: [
    { label: 'Button', value: 'Pill, or 6px', basis: 'Header and sidebar buttons' },
    { label: 'Field', value: '10px; search is a pill', basis: 'Phone field on /sign-in; search on /explore' },
    { label: 'Menu', value: '8px', basis: 'The More menu' },
    { label: 'Card', value: '24px', basis: 'Feature cards on /home' },
    { label: 'Dialog', value: '32px', basis: 'The log-in dialog' },
  ],

  metrics: {
    radius: { field: '10px', menu: '8px', card: '24px', dialog: '32px' },
    scrim: { hex: '#000000', alpha: 0.6 },
    menuShadow: '0 8px 16px rgb(0 0 0 / 0.15)',
    dialogOutline: { hex: WHITE, alpha: 0.08 },
    placeholderAlpha: 0.4,
  },

  /* -- everything else -----------------------------------------------------
     Real, used, and none of it the theme. Grouped by the job it does. */
  decorative: [
    {
      purpose: 'The promotional button',
      note: 'The one control that is not neutral. It appears where the product is asking for something: Create, Subscribe, Continue.',
      items: [
        {
          label: 'Aura',
          source: 'variant-aura',
          css: 'linear-gradient(90deg, #ff6a00 0%, #fd429c 52%, #f8441b 100%)',
          value: 'An image, white label',
          usage:
            'The site paints a photograph of a gradient, not a CSS one. It is drawn here from Suno’s own orange, pink and red as a stand-in.',
          evidence: 'observed',
        },
      ],
    },
    {
      purpose: 'Indicators',
      note: 'The brand accent, used a few pixels at a time.',
      items: [
        {
          label: 'Brand accent',
          source: 'accent-brand → strawberry-600',
          css: '#fd429c',
          value: '#fd429c',
          usage: 'A notification dot, a count badge, the fill of a progress bar at rest.',
          evidence: 'observed',
        },
      ],
    },
    {
      purpose: 'Category tints',
      note: 'Behind a label or a badge at 10–20%, never as a fill. The four status colors and the brand pink are used the same way.',
      items: [
        {
          label: 'Orange',
          source: 'accent-orange → pumpkin-500',
          css: '#ff6a00',
          value: '#ff6a00',
          usage: 'A tint behind a tag.',
          evidence: 'observed',
        },
        {
          label: 'Green',
          source: 'accent-green → slime-600',
          css: '#02d95c',
          value: '#02d95c',
          usage: 'A tint behind a tag. Not the success color, which is the duller grass.',
          evidence: 'observed',
        },
        {
          label: 'Purple',
          source: 'accent-purple → amethyst-600',
          css: '#8b6efe',
          value: '#8b6efe',
          usage: 'A tint behind a tag.',
          evidence: 'observed',
        },
      ],
    },
    {
      purpose: 'Glass',
      note: 'Surfaces that sit on artwork instead of on the page. Each is a translucent fill with a blur behind it.',
      items: [
        {
          label: 'Sticky header',
          css: 'rgb(16 16 18 / 0.6)',
          value: 'Page at 60%, blur 24px',
          usage: 'The landing page’s header once content scrolls under it.',
          evidence: 'observed',
        },
        {
          label: 'Frosted',
          source: 'background-fog-thick',
          css: 'rgb(255 255 255 / 0.1)',
          value: 'White 10%, blur 16px',
          usage: 'A control on a photograph. White 30% under the pointer.',
          evidence: 'observed',
        },
        {
          label: 'Smoked',
          source: 'background-smoke-thick',
          css: 'rgb(28 28 31 / 0.4)',
          value: 'Panel at 40%, blur 16px',
          usage: 'The same, where the photograph is light. 60% under the pointer.',
          evidence: 'observed',
        },
        {
          label: 'Chip on artwork',
          css: 'rgb(16 16 18 / 0.25)',
          value: 'Page at 25%, blur 15px',
          usage: 'Play and like counts laid over a cover, with a white 10% outline.',
          evidence: 'observed',
        },
      ],
    },
  ],

  raw: {
    ramps: [
      {
        name: 'dumbo',
        note: 'The neutral. Every surface, every text color and the primary button come from this one ramp.',
        steps: [
          ['50', '#101012'], ['100', '#1c1c1f'], ['150', '#252529'], ['200', '#2e2e33'], ['250', '#38383e'],
          ['300', '#424249'], ['350', '#4e4d55'], ['400', '#5b5b62'], ['450', '#6a6a72'], ['500', '#7d7c83'],
          ['550', '#919093'], ['600', '#a3a3a3'], ['650', '#b3b3b2'], ['700', '#c2c2c1'], ['750', '#d2d0ce'],
          ['800', '#e0deda'], ['850', '#edeae4'], ['900', '#f7f4ef'], ['950', '#fcfbf9'],
        ].map(([step, hex]) => ({ step, hex })),
      },
      ...(
        [
          ['strawberry', ['#2e0c1d', '#4f1330', '#701943', '#981e59', '#de1677', '#fd429c', '#ff78b9', '#ffa4d0', '#ffcfe6']],
          ['vermilion', ['#3b0c02', '#661503', '#901e04', '#c32906', '#f8441b', '#fa7658', '#fb9b85', '#fcbaab', '#fedad2']],
          ['pumpkin', ['#3b1900', '#652a00', '#8d3b00', '#bc4e00', '#ff6a00', '#ff9448', '#ffb27b', '#ffcba6', '#ffe4d1']],
          ['dandelion', ['#2b2201', '#504102', '#725f03', '#947d04', '#b49c05', '#d4bb06', '#f5d907', '#f9e54f', '#fbf4ba']],
          ['grass', ['#173501', '#255602', '#317203', '#3d8d03', '#4aab04', '#5bd205', '#7afa1f', '#aefc76', '#ddfec5']],
          ['slime', ['#003516', '#015725', '#017431', '#01903d', '#02af4a', '#02d95c', '#23fd7e', '#7afeb1', '#c6fedd']],
          ['dodger-blue', ['#002041', '#003671', '#004a98', '#005cbe', '#0071ea', '#1f8bff', '#58a8ff', '#91c6ff', '#cae3ff']],
          ['amethyst', ['#251b51', '#3d2a87', '#4d33b7', '#6244d7', '#7251f7', '#8b6efe', '#9e86ff', '#b7a4ff', '#d7cdff']],
          ['brown', ['#1a1111', '#2e1c1c', '#473131', '#564646', '#665454', '#756565', '#948787', '#a39898', '#b3aaaa']],
        ] as [string, string[]][]
      ).map(([name, hexes]) => ({
        name,
        steps: hexes.map((hex, i) => ({ step: String((i + 1) * 100), hex })),
      })),
    ],
    alpha: [
      {
        name: 'opacity-white',
        note: 'Borders, hovers and frosted glass.',
        steps: [4, 10, 15, 20, 30, 50, 60, 75, 90].map((n) => ({ step: String(n), hex: WHITE, alpha: n / 100 })),
      },
      {
        name: 'opacity-black',
        note: 'Scrims and shadows.',
        steps: [4, 8, 10, 15, 20, 30, 40, 50, 60, 75, 90].map((n) => ({ step: String(n), hex: '#000000', alpha: n / 100 })),
      },
      {
        name: 'opacity-gray',
        note: 'Smoked glass: the panel color, thinned.',
        steps: [4, 8, 10, 15, 20, 30, 40, 60, 90].map((n) => ({ step: String(n), hex: '#1c1c1f', alpha: n / 100 })),
      },
    ],
    palette: SONORA,
    omitted:
      'Left out on purpose: Tailwind’s stock palette, which the stylesheet carries alongside Suno’s own ramps, two extra steps of dandelion (850 and 950), and ten brand colors belonging to other companies for its share buttons. None of them is Suno’s theme.',
  },
}
