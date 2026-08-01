import { PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const LEVELS = [
  { n: 0, token: '--shadow-e0', z: '0', use: 'Flush with the page. Table rows, list items, flat sections.' },
  { n: 1, token: '--shadow-e1', z: '1', use: 'Resting buttons, switch knobs, keyboard hints.' },
  { n: 2, token: '--shadow-e2', z: '10', use: 'Cards that can be picked up, hovered buttons, sticky headers.' },
  { n: 3, token: '--shadow-e3', z: '50', use: 'Popovers, tooltips, dropdown menus, floating action buttons.' },
  { n: 4, token: '--shadow-e4', z: '65–75', use: 'Toasts, drawers, split-button menus.' },
  { n: 5, token: '--shadow-e5', z: '75–96', use: 'Dialogs, bottom sheets, the command palette.' },
]

function LevelBoard() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {LEVELS.map((l) => (
        <Stack key={l.n} gap="xs" className="items-center">
          <div
            className="grid h-20 w-full place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] text-h4 text-[var(--ds-fg-secondary)]"
            style={{ boxShadow: `var(${l.token})` }}
          >
            e{l.n}
          </div>
          <code className="font-mono text-[10px] text-[var(--ds-fg-muted)]">z {l.z}</code>
        </Stack>
      ))}
    </div>
  )
}

function DarkVsLight() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['dark', 'light'] as const).map((t) => (
        <div
          key={t}
          data-theme={t}
          className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-5"
        >
          <p className="mb-3 text-overline uppercase text-[var(--ds-fg-muted)]">{t}</p>
          <div className="flex flex-col gap-3">
            {[
              ['canvas', '--ds-canvas'],
              ['surface', '--ds-surface'],
              ['raised', '--ds-surface-raised'],
              ['overlay', '--ds-surface-overlay'],
            ].map(([label, v], i) => (
              <div
                key={label}
                className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2 text-caption text-[var(--ds-fg-secondary)]"
                style={{ background: `var(${v})`, boxShadow: `var(--shadow-e${i})` }}
              >
                {label}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[var(--ds-fg-muted)]">
            {t === 'dark'
              ? 'Depth comes from the surface getting lighter. The shadow is nearly invisible and only sharpens the edge.'
              : 'Depth comes from the shadow. The surface stays white at every level, so lightness cannot carry it.'}
          </p>
        </div>
      ))}
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'elevation',
    title: 'Elevation',
    tagline:
      'Six levels, each mapped to a z-index band and a purpose. In light themes elevation is a shadow; in dark themes it is a lighter surface — the token name hides the difference.',
    keywords: ['shadow', 'depth', 'z-index', 'layering', 'surface', 'overlay'],
  },

  overview: {
    purpose:
      'Elevation answers one question: what is on top of what? It creates a stacking hierarchy the user can read at a glance, so a dialog obviously interrupts the page and a card obviously sits on it. Six levels is enough to express every relationship in an application, and few enough that each one has a job.',
    whenToUse: [
      'To lift a temporary surface above persistent content: menus, popovers, dialogs, toasts.',
      'To signal that a card can be picked up, dragged, or is currently being dragged.',
      'To keep a sticky header legible once content scrolls beneath it.',
      'To reinforce focus on a modal surface, alongside a scrim.',
    ],
    whenNotToUse: [
      {
        text: 'On a static content card that is not interactive and never moves.',
        instead: 'a 1px border and a different surface colour',
      },
      {
        text: 'On every card in a grid, to make them "pop".',
        instead: 'nothing — twelve floating cards read as visual noise',
      },
      {
        text: 'To create separation between two sections of a page.',
        instead: 'whitespace, or a divider',
      },
      {
        text: 'As decoration on a coloured button in dark mode, where the shadow is invisible anyway.',
        instead: 'a lighter fill on hover',
      },
    ],
    reasoning: (
      <>
        <p>
          A drop shadow only works if there is light. On a near-black canvas a shadow has almost
          nothing to darken, so dark-mode elevation has to be carried by{' '}
          <strong>surface lightness</strong>: canvas → surface → raised → overlay is a four-step
          ladder where each step is measurably lighter than the one below it. The shadow is still
          there, but it is doing edge definition, not depth.
        </p>
        <p>
          Light mode is the reverse. Every surface is white, so lightness cannot express anything;
          the shadow does all the work, and it needs to be softer and larger than a dark-mode shadow
          to read as height rather than as a hard edge. This is why "invert the colours" produces a
          dark theme that looks flat and a light theme that looks harsh.
        </p>
        <p>
          Each level is bound to a <strong>z-index band</strong>, and that binding is what stops the
          z-index arms race. If a menu is e3 it lives at z-50; if a dialog is e5 it lives at z-75.
          Nothing in the codebase should ever need z-index: 9999, and if it does, the component is
          at the wrong elevation level rather than needing a bigger number.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Six levels" center={false} minHeight={0} allowResize={false}>
        <LevelBoard />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'themes',
        title: 'Why dark mode is not an inversion',
        description:
          'The same four levels in both themes. Notice that the dark column changes background colour and the light column changes shadow — the token name is identical in both.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <DarkVsLight />
          </PreviewStage>
        ),
      },
      {
        id: 'motion',
        title: 'Elevation as feedback',
        description:
          'Hovering raises a card by one level and 1px of translation. Pressing drops it below its resting level. The movement is what makes the surface feel physical.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg">
              <div className="w-44 cursor-pointer rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4 shadow-e1 transition-all duration-[180ms] hover:-translate-y-px hover:shadow-e3 active:translate-y-0 active:shadow-e0">
                <p className="text-label text-[var(--ds-fg)]">Hover me</p>
                <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">e1 → e3 → e0</p>
              </div>
              <div className="w-44 rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
                <p className="text-label text-[var(--ds-fg)]">Static card</p>
                <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">No shadow at all</p>
              </div>
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'e0', note: 'Flush', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e0" /> },
      { label: 'e1', note: 'Resting control', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e1" /> },
      { label: 'e2', note: 'Liftable card', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e2" /> },
      { label: 'e3', note: 'Popover', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e3" /> },
      { label: 'e4', note: 'Toast, drawer', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e4" /> },
      { label: 'e5', note: 'Dialog', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] shadow-e5" /> },
      { label: 'Glow', note: 'Focus emphasis', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] shadow-glow" /> },
      { label: 'Inset', note: 'A well, not a lift', render: <span className="block h-12 w-16 rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] shadow-[inset_0_1px_2px_rgb(0_0_0/0.35)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] p-5 shadow-e3">
          <p className="text-label text-[var(--ds-fg)]">Level 3 surface</p>
          <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
            Two shadows: a tight contact shadow and a wide ambient one.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[
            ['1 · contact', '0 4px 8px −4px / 60%'],
            ['2 · ambient', '0 12px 20px −6px / 44%'],
            ['3 · surface lift', 'surface → raised'],
            ['4 · hairline', '1px border-subtle'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] p-2">
              <p className="text-[var(--ds-fg-secondary)]">{k}</p>
              <code className="font-mono text-[10px] text-[var(--ds-accent-text)]">{v}</code>
            </div>
          ))}
        </div>
      </div>
    ),
    caption:
      'Every level is two shadows plus a surface change plus a hairline. Any one of them alone looks wrong.',
    parts: [
      {
        n: 1,
        label: 'Contact shadow',
        value: 'small blur, negative spread',
        kind: 'shape',
        note: 'Tight and dark, directly under the element. This is what says "resting on" rather than "floating above". Without it, surfaces look like stickers.',
      },
      {
        n: 2,
        label: 'Ambient shadow',
        value: 'large blur, larger offset',
        kind: 'shape',
        note: 'Soft and wide. Communicates height. Growing this one alone is what makes an element seem to fly rather than lift.',
      },
      {
        n: 3,
        label: 'Surface step',
        value: '--ds-surface → --ds-surface-raised',
        kind: 'color',
        note: 'In dark mode this carries almost all of the perceived depth. Roughly 4–6% lightness per level is the range that reads as a step without looking like a different colour.',
      },
      {
        n: 4,
        label: 'Hairline border',
        value: '1px --ds-border-subtle',
        kind: 'color',
        note: 'Defines the edge where the shadow is too soft to. Essential in dark mode, where a shadow against near-black is barely visible.',
      },
      {
        n: 5,
        label: 'Z-index band',
        value: 'e3 → z-50',
        kind: 'size',
        note: 'Bound to the level, not chosen per component. This is the discipline that prevents z-index: 9999 from ever appearing in the codebase.',
      },
    ],
  },

  tokens: [
    { category: 'shadow', token: '--shadow-e0', usedFor: 'Flush. Explicit "no elevation".' },
    { category: 'shadow', token: '--shadow-e1', usedFor: 'Resting buttons and small controls' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Interactive cards, sticky headers' },
    { category: 'shadow', token: '--shadow-e3', usedFor: 'Popovers, menus, tooltips, FAB' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Toasts, drawers' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Dialogs, sheets, command palette' },
    { category: 'shadow', token: '--shadow-glow', usedFor: 'Accent emphasis on a focused surface' },
    { category: 'color', token: '--ds-surface', usedFor: 'Level 0–1 background' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Level 2–3 background' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Level 4–5 background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'The hairline that defines every elevated edge' },
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'The dimming layer beneath a modal surface' },
  ],

  sizes: [
    { name: 'Level 0', height: 'z-0', use: 'In-flow content. Table rows, list items, page sections.' },
    { name: 'Level 1', height: 'z-1', use: 'Controls at rest — buttons, switch knobs, kbd.' },
    { name: 'Level 2', height: 'z-10', use: 'Cards that respond to hover, sticky headers, table header rows.' },
    { name: 'Level 3', height: 'z-50', use: 'Popovers, dropdown menus, tooltips, floating action buttons.' },
    { name: 'Level 4', height: 'z-65 – z-75', use: 'Toasts, drawers, split-button menus, scrims.' },
    { name: 'Level 5', height: 'z-75 – z-96', use: 'Dialogs, bottom sheets, the command palette.' },
    { name: 'Inspector', height: 'z-200+', use: 'Development overlays only. Never used by product UI.' },
  ],

  do: [
    {
      title: 'Bind z-index to the elevation level',
      why: 'Six levels, six bands, no arguments. Anyone can work out where a new surface belongs without reading the rest of the codebase or inventing a bigger number.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px] text-[var(--ds-fg-secondary)]">
          <span>e2 → z-10 · sticky header</span>
          <span>e3 → z-50 · popover</span>
          <span>e4 → z-70 · scrim</span>
          <span>e5 → z-75 · dialog</span>
        </Stack>
      ),
    },
    {
      title: 'Change surface colour and shadow together',
      why: 'Both channels carry depth, and which one dominates depends on the theme. Moving them in lockstep means the same component reads correctly in dark and light without a second design.',
      render: (
        <Stack gap="sm" className="w-full">
          <div className="rounded-[var(--radius-md)] bg-[var(--ds-surface)] p-2 text-caption text-[var(--ds-fg-muted)] shadow-e1">surface + e1</div>
          <div className="rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] p-2 text-caption text-[var(--ds-fg-muted)] shadow-e3">raised + e3</div>
          <div className="rounded-[var(--radius-md)] bg-[var(--ds-surface-overlay)] p-2 text-caption text-[var(--ds-fg-muted)] shadow-e5">overlay + e5</div>
        </Stack>
      ),
    },
    {
      title: 'Move one level on hover, not three',
      why: 'e1 → e2 reads as "this responds". e1 → e5 reads as an animation glitch. The size of the change should be proportional to the significance of the interaction.',
      render: (
        <div className="w-40 cursor-pointer rounded-[var(--radius-lg)] bg-[var(--ds-surface-raised)] p-4 text-center text-caption text-[var(--ds-fg-secondary)] shadow-e1 transition-shadow duration-[180ms] hover:shadow-e2">
          hover: e1 → e2
        </div>
      ),
    },
    {
      title: 'Pair every modal elevation with a scrim',
      why: 'The shadow says "above"; the scrim says "the thing underneath is not available". Users need both to understand that the page is paused rather than merely obscured.',
      render: (
        <div className="relative h-24 w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ds-surface-inset)]">
          <div className="absolute inset-0 bg-[var(--ds-layer-scrim)]" />
          <div className="absolute left-1/2 top-1/2 w-32 -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-md)] bg-[var(--ds-surface-overlay)] p-3 text-center text-caption shadow-e5">
            Dialog
          </div>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not elevate everything',
      why: 'If every card floats, none of them do. Elevation is a relative signal — it only means something when most of the page is flat.',
      render: (
        <div className="grid w-full grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] shadow-e4" />
          ))}
        </div>
      ),
    },
    {
      title: 'Do not use a light-mode shadow in dark mode',
      why: 'A soft grey shadow on a near-black surface fogs the edge instead of defining it. Dark shadows are tighter, darker, and paired with a hairline border.',
      render: (
        <div
          className="h-16 w-40 rounded-[var(--radius-lg)] bg-[var(--ds-surface-raised)]"
          style={{ boxShadow: '0 8px 24px rgb(120 120 130 / 0.35)' }}
        />
      ),
    },
    {
      title: 'Do not raise z-index to fix a stacking bug',
      why: 'z-index: 9999 is a symptom of a missing portal or an ancestor with a transform. The fix is to render the surface at the body, not to outbid the last person who had this problem.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          z-index: 999999; /* above the other 99999 */
        </code>
      ),
    },
    {
      title: 'Do not use elevation for emphasis',
      why: 'A raised element reads as temporary and dismissible. Making an important static section float tells the user it will disappear if they click elsewhere.',
      render: (
        <div className="w-full rounded-[var(--radius-lg)] bg-[var(--ds-surface-raised)] p-4 text-caption text-[var(--ds-fg-muted)] shadow-e5">
          Important announcement, apparently floating over the page
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
    ],
    contrast: [
      'A shadow is not a boundary for contrast purposes. Every elevated surface also needs a 1px border or a surface-colour difference that reaches 3:1 against what is behind it.',
      'In Windows High Contrast Mode shadows are removed entirely. If depth was carried only by shadow, the layering disappears — which is why the hairline border is mandatory.',
      'The scrim must be dark enough to make background text clearly inactive, and light enough that the user can still see the context. 72% in dark, 42% in light.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Focus order must match visual stacking. A dialog at e5 traps focus; nothing behind it should be reachable.' },
      { keys: 'Esc', does: 'Dismisses the topmost elevated surface, one level at a time.' },
    ],
    aria: [
      { attr: 'aria-modal="true"', on: 'Dialogs and drawers at e5', note: 'Marks everything beneath as inert to assistive tech. Visual elevation alone conveys nothing to a screen reader.' },
      { attr: 'inert', on: 'Background content', note: 'The modern equivalent of aria-hidden plus a focus trap; removes the subtree from focus and from the accessibility tree.' },
      { attr: 'role="tooltip" / "menu"', on: 'e3 surfaces', note: 'Non-modal elevated surfaces need a role so their relationship to the trigger is expressed structurally.' },
    ],
    focus:
      'Elevated surfaces must receive focus when they open and return it to the trigger when they close. Elevation without focus management is a visual change with no accessibility meaning.',
    screenReader: [
      'Shadows are never announced. Stacking must be expressed through aria-modal, inert, and DOM order.',
      'A popover rendered in a portal is far from its trigger in the DOM — wire it with aria-controls and aria-expanded so the relationship survives.',
    ],
    touch:
      'Elevated surfaces on touch need a larger dismissal area: the scrim itself should be tappable, and a bottom sheet should support drag-to-dismiss as well as a close control.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Elevation is a token, never a literal box-shadow
<Card className="shadow-e2" />
<Popover className="shadow-e3" />
<Dialog className="shadow-e5" />

// Hover moves exactly one level
<div className="shadow-e1 transition-shadow duration-[180ms] hover:shadow-e2" />

// Surface and shadow move together
<div className="bg-overlay shadow-e5 border border-line rounded-2xl" />

// Z-index comes from the level, not from a guess
const Z = {
  base:    0,
  sticky:  10,   // e2
  popover: 50,   // e3
  scrim:   70,   // e4
  modal:   75,   // e5
  toast:   90,
  palette: 96,
} as const

// Modal surfaces render at <body> so no ancestor transform can clip them
createPortal(<Dialog />, document.body)`,
    },
    css: {
      lang: 'css',
      caption:
        'Two shadows per level in both themes. Note how much darker and tighter the dark-mode values are.',
      code: `/* DARK — tight, near-black, paired with a lighter surface */
:root, [data-theme='dark'] {
  --ds-shadow-1: 0 1px 2px -1px rgb(0 0 0 / 0.60),
                 0 1px 1px      rgb(0 0 0 / 0.32);
  --ds-shadow-3: 0 4px 8px -4px rgb(0 0 0 / 0.60),
                 0 12px 20px -6px rgb(0 0 0 / 0.44);
  --ds-shadow-5: 0 16px 32px -8px  rgb(0 0 0 / 0.66),
                 0 40px 72px -16px rgb(0 0 0 / 0.60);
}

/* LIGHT — softer, wider, lower alpha */
[data-theme='light'] {
  --ds-shadow-1: 0 1px 2px rgb(16 18 22 / 0.06),
                 0 1px 3px rgb(16 18 22 / 0.05);
  --ds-shadow-3: 0 4px 8px -4px  rgb(16 18 22 / 0.09),
                 0 12px 24px -6px rgb(16 18 22 / 0.09);
  --ds-shadow-5: 0 16px 32px -8px  rgb(16 18 22 / 0.12),
                 0 40px 80px -16px rgb(16 18 22 / 0.16);
}

/* High Contrast Mode strips shadows — the hairline is the fallback */
@media (forced-colors: active) {
  .elevated { border: 1px solid CanvasText; }
}

/* Animate shadow, never spread. Spread triggers paint on every frame. */
.card {
  transition: box-shadow 180ms var(--ease-standard),
              transform  180ms var(--ease-standard);
}`,
    },
  },

  notes: {
    tips: [
      'If you are unsure which level something needs, ask how the user dismisses it. Nothing to dismiss is e0–e2; click-outside is e3; Escape and a scrim is e4–e5.',
      'A sticky header only needs its shadow once content has scrolled under it. Toggle the class on an IntersectionObserver sentinel rather than showing it permanently.',
      'For drag and drop, jump the dragged item to e4 and drop the placeholder to e0. The gap between them is what makes the drag feel like lifting.',
      'Two shadows always beat one. A single large blur looks like a glow; the tight contact shadow is what sells contact with the surface below.',
    ],
    performance: [
      'box-shadow is painted on the CPU and repaints whenever the element moves. For anything animating position, prefer a pre-rendered shadow on a composited layer, or animate opacity between two stacked shadows.',
      'Large blur radii are expensive in proportion to blur², not to element size. An 80px blur on a full-screen dialog is one of the most costly paints in a typical app.',
      'backdrop-filter combined with a shadow forces two separate compositing passes. It is fine on one dialog and a real problem on fifty list rows.',
      'will-change: transform on a hover-elevating card promotes it to its own layer, but do not leave it on permanently — each layer costs GPU memory.',
    ],
    mistakes: [
      'Elevating a surface without changing its background. In dark mode the shadow is nearly invisible, so the element appears completely flat.',
      'Rendering a popover inside a container that has a transform. The transform creates a containing block and position: fixed silently stops being fixed.',
      'Using the same elevation for a hover state and a dragging state, so users cannot tell whether they have picked something up.',
      'Putting a shadow on a full-width sticky bar. The shadow is only visible at the edges and reads as a rendering artefact.',
    ],
    realWorld: [
      'Export your z-index bands as a TypeScript const and forbid literal z-index values in review. It eliminates an entire category of bug permanently.',
      'Test every elevated surface in Windows High Contrast Mode. Shadows vanish, and any layering that depended on them alone disappears with them.',
      'On mobile, prefer full-screen or edge-anchored surfaces to floating ones. A floating dialog on a 375px screen wastes the margins and puts controls out of thumb reach.',
      'When a designer asks for "more depth", the fix is usually more contrast between adjacent surface colours, not a bigger shadow. Bigger shadows read as blur, not as height.',
    ],
  },
})
