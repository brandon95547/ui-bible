import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Card, CardHeader } from '@/ui/Surface'
import { TextInput } from '@/ui/Input'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function LightSample() {
  return (
    <div
      data-theme="light"
      className="flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-5"
    >
      <Card padding="sm" elevation={1}>
        <CardHeader
          title="Invoice 2026-0431"
          description="Due 26 July · $1,428.00"
          actions={<Badge tone="warning" dot size="sm">Unpaid</Badge>}
        />
      </Card>
      <Alert tone="info" title="Automatic payment is enabled">
        We will charge Visa ···4242 on the due date.
      </Alert>
      <TextInput placeholder="Add a note…" />
      <Row gap="sm">
        <Button size="sm">Pay now</Button>
        <Button size="sm" variant="outlined">Download PDF</Button>
        <Button size="sm" variant="text">Dispute</Button>
      </Row>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'light-theme',
    title: 'Light Theme',
    tagline:
      'The other half of the product. Every surface is white, so lightness cannot express depth — shadows and hairlines do all of the work, and the brand colour has to get darker.',
    keywords: ['light mode', 'theme', 'white', 'shadow', 'hairline', 'print'],
  },

  overview: {
    purpose:
      'The light theme is not a courtesy. It is what most people use in daylight, what every printed or exported artefact looks like, and what a large number of users simply prefer. It carries the same tokens with the same names, and every component works in it without a single conditional.',
    whenToUse: [
      'As the default for content-heavy, consumer-facing and public products.',
      'For anything read for long periods in a bright environment.',
      'For anything that will be printed, exported to PDF, or embedded in a document.',
      'When the OS reports prefers-color-scheme: light and the user has expressed no preference.',
    ],
    whenNotToUse: [
      {
        text: 'For a media-heavy interface where a white frame competes with the content.',
        instead: 'the dark theme',
        to: '#/dark-theme',
      },
      {
        text: 'For sustained use in a dark room.',
        instead: 'the dark theme',
        to: '#/dark-theme',
      },
      {
        text: 'When it is produced by inverting the dark palette.',
        instead: 'a purpose-built light ramp',
      },
    ],
    reasoning: (
      <>
        <p>
          The defining constraint of a light theme is that <strong>every surface is white</strong>.
          Canvas, card, dialog and menu are all <code>#FFFFFF</code>, so the lightness channel that
          carries depth in dark mode is unavailable. Depth has to come from{' '}
          <strong>shadow and hairline</strong> instead — which is why our light shadows are softer,
          wider and lower-alpha than the dark ones, and why the hairline border does more work here
          than anywhere else in the system.
        </p>
        <p>
          Colour moves in the opposite direction. A brand value tuned for near-black is too light
          for white: <code>#7C6CFF</code> gives white text only 3.3:1, which fails. The light theme
          uses <code>#6A55F2</code>, one step darker, for 5.7:1. Status <code>-text</code> tokens go
          further still, using the 700 step, because they sit on a pale tint rather than a solid
          fill.
        </p>
        <p>
          The one thing light themes get wrong most often is the <strong>inset</strong>. In dark
          mode an input is darker than its card; in light mode making it darker produces a muddy
          grey box. Our light inset is <code>#F7F8FA</code> — barely off-white, with the boundary
          carried by the border rather than by the fill.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Light theme" center={false} minHeight={0} allowResize={false}>
        <LightSample />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'depth',
        title: 'Depth without lightness',
        description:
          'Four elevation levels on a single white surface. Remove the shadows and the hierarchy disappears completely — the opposite of dark mode.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div data-theme="light" className="w-full rounded-[var(--radius-lg)] bg-[var(--ds-canvas)] p-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {[1, 2, 3, 5].map((n) => (
                  <div
                    key={n}
                    className="grid h-20 place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] text-h4 text-[var(--ds-fg-secondary)]"
                    style={{ boxShadow: `var(--shadow-e${n})` }}
                  >
                    e{n}
                  </div>
                ))}
              </div>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'colour-shift',
        title: 'Colour has to darken',
        description:
          'Top row is the dark-theme value on white. Bottom row is the light-theme value. Same role, different ramp step, and only one of them passes contrast.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div data-theme="light" className="w-full rounded-[var(--radius-lg)] bg-[var(--ds-canvas)] p-5">
              <Stack gap="md">
                <div>
                  <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                    Dark-theme values on white — too light, white text fails
                  </p>
                  <Row gap="sm">
                    {[
                      ['#7c6cff', 'brand-500'],
                      ['#16b375', 'success-500'],
                      ['#f7b222', 'warning-400'],
                      ['#ee4351', 'danger-500'],
                    ].map(([hex, name]) => (
                      <span
                        key={name}
                        className="grid h-11 w-24 place-items-center rounded-[var(--radius-md)] text-caption text-white"
                        style={{ background: hex }}
                      >
                        {name}
                      </span>
                    ))}
                  </Row>
                </div>
                <div>
                  <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                    Light-theme values — darker, white text passes
                  </p>
                  <Row gap="sm">
                    {[
                      ['#6a55f2', 'brand-600'],
                      ['#0e9260', 'success-600'],
                      ['#e29508', 'warning-500'],
                      ['#d62838', 'danger-600'],
                    ].map(([hex, name]) => (
                      <span
                        key={name}
                        className="grid h-11 w-24 place-items-center rounded-[var(--radius-md)] text-caption text-white"
                        style={{ background: hex }}
                      >
                        {name}
                      </span>
                    ))}
                  </Row>
                </div>
              </Stack>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'inset',
        title: 'The inset trap',
        description:
          'A well in dark mode is darker than its container. Copying that logic into light mode produces a muddy grey box — the border should carry the boundary instead.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div data-theme="light" className="grid w-full gap-4 rounded-[var(--radius-lg)] bg-[var(--ds-canvas)] p-5 sm:grid-cols-2">
              <Cell label="#F7F8FA — barely off-white" tone="good">
                <TextInput placeholder="Search projects…" />
              </Cell>
              <Cell label="#E4E7EC — inverted dark logic" tone="bad">
                <input
                  placeholder="Search projects…"
                  className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--ds-border)] px-3 text-body-sm outline-none"
                  style={{ background: '#e4e7ec' }}
                />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Canvas', note: '#FFFFFF', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]" /> },
      { label: 'Sunken', note: '#F4F6F8', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-sunken)]" /> },
      { label: 'Inset', note: '#F7F8FA', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)]" /> },
      { label: 'Raised', note: 'white + e2', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] shadow-e2" /> },
      { label: 'Overlay', note: 'white + e5', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] shadow-e5" /> },
      { label: 'Hover', note: 'black 4%', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-layer-hover)]" /> },
      { label: 'Border', note: 'black 13%', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)]" /> },
      { label: 'Scrim', note: 'ink 42%', render: <span data-theme="light" className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-layer-scrim)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div data-theme="light" className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--ds-sunken)] p-5">
        <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4 shadow-e2">
          <p className="text-label text-[var(--ds-fg)]">Card on a sunken page</p>
          <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
            The page is grey; the card is white. That is the inverse of dark mode.
          </p>
          <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] px-3 py-2">
            <span className="text-caption text-[var(--ds-fg-muted)]">Inset, barely off-white</span>
          </div>
        </div>
      </div>
    ),
    caption:
      'In light mode the page is often the darkest surface and the card is the lightest. Dark mode does the reverse — same tokens, opposite relationship.',
    parts: [
      {
        n: 1,
        label: 'Sunken page',
        value: '#F4F6F8',
        kind: 'color',
        note: 'A very slightly grey page makes a white card read as elevated with almost no shadow. It is the single cheapest depth trick in light UI.',
      },
      {
        n: 2,
        label: 'White card',
        value: '#FFFFFF + e2',
        kind: 'color',
        note: 'Pure white is correct here — it is the top of the stack, not a text background competing with a light foreground.',
      },
      {
        n: 3,
        label: 'Hairline',
        value: 'ink at 7% alpha',
        kind: 'color',
        note: 'Does far more work than in dark mode. A shadow alone leaves a soft, undefined edge on white; the hairline is what makes it crisp.',
      },
      {
        n: 4,
        label: 'Inset',
        value: '#F7F8FA',
        kind: 'color',
        note: 'Barely off-white. Going darker to mimic the dark theme produces a grey box that reads as disabled.',
      },
      {
        n: 5,
        label: 'Shadow',
        value: 'Softer, wider, lower alpha',
        kind: 'shape',
        note: 'Light shadows spread further and sit at 6–16% rather than 32–66%. A dark-mode shadow on white looks like a hard, dirty smudge.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', value: '#ffffff', usedFor: 'Page background' },
    { category: 'color', token: '--ds-sunken', value: '#f4f6f8', usedFor: 'Page behind cards — makes white read as elevated' },
    { category: 'color', token: '--ds-surface', value: '#ffffff', usedFor: 'Cards, panels, dialogs — all the same white' },
    { category: 'color', token: '--ds-surface-inset', value: '#f7f8fa', usedFor: 'Inputs, code blocks, table headers' },
    { category: 'color', token: '--ds-fg', value: '#171a20', usedFor: 'Primary text — 15.9:1' },
    { category: 'color', token: '--ds-fg-secondary', value: '#545c6b', usedFor: 'Body text — 7.4:1' },
    { category: 'color', token: '--ds-fg-muted', value: '#6e7686', usedFor: 'Captions — 4.9:1' },
    { category: 'color', token: '--ds-border-subtle', value: 'ink 7%', usedFor: 'Hairlines — the primary edge definition' },
    { category: 'color', token: '--ds-accent', value: '#6a55f2', usedFor: 'Brand — one step darker than in dark mode' },
    { category: 'color', token: '--ds-danger-text', value: '#b21c2b', usedFor: 'Error text on a pale tint — the 700 step' },
    { category: 'color', token: '--ds-layer-scrim', value: 'ink 42%', usedFor: 'Behind modals — lighter than the dark-mode scrim' },
    { category: 'shadow', token: '--shadow-e1 … e5', usedFor: 'Softer and wider than their dark counterparts' },
  ],

  do: [
    {
      title: 'Put white cards on a grey page',
      why: 'A card that is lighter than its background reads as elevated before any shadow is applied. It is the light-theme equivalent of the dark-theme surface ramp.',
      render: (
        <div data-theme="light" className="w-full rounded-[var(--radius-md)] bg-[var(--ds-sunken)] p-3">
          <div className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-white p-3 shadow-e1">
            <span className="text-caption text-[var(--ds-fg-secondary)]">white on #F4F6F8</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Darken brand and status colours',
      why: 'White text needs 4.5:1. Most brand colours tuned for dark backgrounds land around 3:1 on white, which is a straightforward failure on the primary button.',
      render: (
        <Row gap="sm">
          <span className="grid h-10 w-28 place-items-center rounded-[var(--radius-md)] text-caption text-white" style={{ background: '#6a55f2' }}>
            5.7:1 ✓
          </span>
          <span className="grid h-10 w-28 place-items-center rounded-[var(--radius-md)] text-caption text-white" style={{ background: '#7c6cff' }}>
            3.3:1 ✗
          </span>
        </Row>
      ),
    },
    {
      title: 'Lean on hairlines',
      why: 'On white, a shadow alone gives a soft, undefined edge. A 7% ink hairline is what makes a card look crisp, and it is the only thing that survives High Contrast Mode.',
      render: (
        <div data-theme="light" className="flex w-full gap-3 rounded-[var(--radius-md)] bg-[var(--ds-sunken)] p-3">
          <div className="flex-1 rounded-[var(--radius-sm)] bg-white p-3 text-caption shadow-e2">shadow only</div>
          <div className="flex-1 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-white p-3 text-caption shadow-e2">
            + hairline
          </div>
        </div>
      ),
    },
    {
      title: 'Use the 700 step for text on tints',
      why: 'A pale 10% tint plus a 500-step text colour lands around 3:1. The 700 step is the pair that clears 4.5:1, which is why -text exists as its own token.',
      render: (
        <div data-theme="light" className="flex w-full flex-col gap-2">
          <span className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-caption" style={{ background: 'rgb(238 67 81 / 0.1)', color: '#b21c2b' }}>
            danger-700 on a 10% tint — passes
          </span>
          <span className="rounded-[var(--radius-sm)] px-2.5 py-1.5 text-caption" style={{ background: 'rgb(238 67 81 / 0.1)', color: '#ee4351' }}>
            danger-500 on a 10% tint — fails
          </span>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not invert the dark theme',
      why: 'Inversion gives you a grey page, grey cards, a washed-out brand colour and shadows that are far too heavy. The two themes share names, not values.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] bg-[var(--ds-surface)] p-3" style={{ filter: 'invert(1)' }}>
          <p className="text-body-sm">Inverted from dark — every surface is now mid-grey.</p>
        </div>
      ),
    },
    {
      title: 'Do not reuse dark-mode shadows',
      why: 'A 60%-alpha shadow on white is a dirty smudge, not depth. Light shadows are 6–16% alpha and spread much further.',
      render: (
        <div data-theme="light" className="w-full rounded-[var(--radius-md)] bg-white p-4">
          <div
            className="h-12 w-32 rounded-[var(--radius-md)] bg-white"
            style={{ boxShadow: '0 4px 8px -4px rgb(0 0 0 / 0.6), 0 12px 20px -6px rgb(0 0 0 / 0.44)' }}
          />
        </div>
      ),
    },
    {
      title: 'Do not make the inset grey',
      why: 'A #E4E7EC input reads as disabled. In light mode the field boundary comes from the border, not from a darker fill.',
      render: (
        <div data-theme="light" className="w-full rounded-[var(--radius-md)] bg-white p-3">
          <input
            placeholder="Looks disabled"
            className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--ds-border)] px-3 text-body-sm outline-none"
            style={{ background: '#e4e7ec' }}
          />
        </div>
      ),
    },
    {
      title: 'Do not use pure black text',
      why: '#000 on #FFF is 21:1 and produces the same halation problem in reverse. #171A20 is 15.9:1 and noticeably more comfortable over a long document.',
      render: (
        <div data-theme="light" className="w-full rounded-[var(--radius-md)] bg-white p-4">
          <p className="text-body-sm leading-relaxed text-black">
            Pure black body text over several paragraphs is harsher than it looks in a single line.
          </p>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'AAA' },
    ],
    contrast: [
      'Light themes fail on the same pairs that dark themes pass, and vice versa. Every pair must be verified independently in each theme.',
      'The usual light-mode failure is a mid-tone brand colour with white text on the primary button. Check that one first.',
      'Hairlines at 7% alpha do not meet 3:1 and do not need to — they are decorative. Any border that is the only boundary of a control must be --ds-border or stronger.',
    ],
    keyboard: [
      { keys: '⌘K → theme', does: 'The theme switch is in the command palette, reachable without a pointer.' },
    ],
    aria: [
      { attr: 'color-scheme: light', on: '[data-theme="light"]', note: 'Keeps native controls, scrollbars and autofill consistent when a light island sits inside a dark app.' },
      { attr: 'prefers-color-scheme', on: 'Media query', note: 'Sets the initial value only. An explicit user choice must win and must persist.' },
      { attr: 'forced-colors', on: 'Media query', note: 'High Contrast Mode discards your palette. The hairline and the semantics are what survive.' },
    ],
    focus:
      'The light focus ring is #6A55F2 — the same value as the accent, because on white it already clears 3:1 against both the button and the page.',
    screenReader: ['Theme is invisible to assistive technology. It must never be a carrier of meaning.'],
    touch:
      'Light interfaces are typically used in bright environments where glare reduces effective contrast. Do not design to the AA minimum here — aim higher on anything read outdoors.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// A light island inside a dark app. Every preview in this Bible uses it.
<div data-theme="light">
  <Card>Renders light regardless of the app theme</Card>
</div>

// Three-way preference: dark, light, or follow the system
type ThemePref = 'dark' | 'light' | 'system'

function resolve(pref: ThemePref): 'dark' | 'light' {
  if (pref !== 'system') return pref
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Follow the OS live, but only while the user is on "system"
useEffect(() => {
  if (pref !== 'system') return
  const mq = matchMedia('(prefers-color-scheme: dark)')
  const on = () => { document.documentElement.dataset.theme = resolve('system') }
  mq.addEventListener('change', on)
  return () => mq.removeEventListener('change', on)
}, [pref])

// Force light for print, regardless of the current theme
// @media print { :root { color-scheme: light } }`,
    },
    css: {
      lang: 'css',
      code: `[data-theme='light'] {
  color-scheme: light;

  /* Every surface is white. The PAGE is what goes grey. */
  --ds-canvas:          #ffffff;
  --ds-sunken:          #f4f6f8;   /* makes white cards read as raised */
  --ds-surface:         #ffffff;
  --ds-surface-raised:  #ffffff;
  --ds-surface-overlay: #ffffff;
  --ds-surface-inset:   #f7f8fa;   /* barely off-white, not grey */

  /* Not pure black — 15.9:1 is plenty and far more comfortable */
  --ds-fg:           #171a20;
  --ds-fg-secondary: #545c6b;
  --ds-fg-muted:     #6e7686;

  /* Ink alpha, so one border token works on every surface */
  --ds-border-subtle: rgb(16 18 22 / 0.07);
  --ds-border:        rgb(16 18 22 / 0.13);
  --ds-layer-hover:   rgb(16 18 22 / 0.04);

  /* Brand darkens: white text needs 4.5:1 */
  --ds-accent:      #6a55f2;   /* dark theme uses #7c6cff */
  --ds-danger-text: #b21c2b;   /* the 700 step, for text on a tint */

  /* Softer, wider, much lower alpha than the dark shadows */
  --ds-shadow-3: 0 4px 8px -4px  rgb(16 18 22 / 0.09),
                 0 12px 24px -6px rgb(16 18 22 / 0.09);
}

/* Printing is always light, whatever the user chose */
@media print {
  :root { color-scheme: light; }
  .no-print { display: none; }
}`,
    },
  },

  notes: {
    tips: [
      'A very slightly grey page is the highest-leverage decision in a light theme. It gives every white card free elevation and costs one token.',
      'Light mode needs more whitespace than dark mode to feel equally calm — bright surfaces read as louder, so the same density feels busier.',
      'Check your light theme on a cheap, uncalibrated laptop screen. Subtle greys that look elegant on a good monitor frequently disappear entirely.',
      'Print styles are light-theme styles with the chrome removed. If the light theme is solid, print is almost free.',
    ],
    performance: [
      'Light themes consume more power on OLED displays. On a mobile-first product, defaulting to dark is a measurable battery decision.',
      'Wide, soft shadows are more expensive to paint than tight ones because cost scales with blur². Light mode uses larger blurs, so avoid putting them on dozens of list rows.',
      'Do not animate the theme transition. A crossfade of every element on the page is one of the most expensive things a browser can be asked to do.',
    ],
    mistakes: [
      'Keeping the dark-theme brand colour, so the primary button fails contrast in the theme most people actually use.',
      'Making the inset grey, which makes every input look disabled.',
      'Reusing dark shadow values, giving every card a heavy grey smudge instead of a lift.',
      'Forgetting color-scheme on a light island inside a dark app, so the native scrollbar and caret stay dark inside a white panel.',
    ],
    realWorld: [
      'Build both themes in the same pull request. A theme added later always ships with a dozen hard-coded colours nobody noticed.',
      'Screenshot both themes side by side for every major screen and review them together. Half of all theme bugs are only visible in comparison.',
      'Ask a support team which theme customers report bugs in. It is usually the one the design team does not use daily.',
      'If you only have budget for one theme, ship light. It is what daylight, printing, screenshots and most documentation assume — but plan the token architecture so dark can arrive without a rewrite.',
    ],
  },
})
