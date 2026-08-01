import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const STEPS = [
  { token: '--radius-xs', px: 4, use: 'Checkbox, tag, code chip, focus ring on inline text.' },
  { token: '--radius-sm', px: 6, use: 'Menu item, extra-small button, nested item inside an 8px parent.' },
  { token: '--radius-md', px: 8, use: 'Buttons, inputs, selects. The interactive default.' },
  { token: '--radius-lg', px: 12, use: 'Popovers, alerts, large buttons, nested cards.' },
  { token: '--radius-xl', px: 16, use: 'Cards, panels, preview surfaces. The container default.' },
  { token: '--radius-2xl', px: 20, use: 'Dialogs, command palette, hero surfaces.' },
  { token: '--radius-3xl', px: 28, use: 'Bottom sheets and anything anchored to a screen edge.' },
  { token: 'full', px: 9999, use: 'Pills, avatars, badges, switches — shapes that are never pressed like a button.' },
]

function NestingDemo() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Cell label="Correct — inner = outer − padding" sub="16px card, 8px padding, 8px inner" tone="good">
        <div className="w-full rounded-[16px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-2">
          <div className="h-16 w-full rounded-[8px] bg-[var(--ds-accent-subtle)]" />
        </div>
      </Cell>
      <Cell label="Wrong — inner matches outer" sub="16px inside 16px with 8px padding" tone="bad">
        <div className="w-full rounded-[16px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-2">
          <div className="h-16 w-full rounded-[16px] bg-[var(--ds-danger-subtle)]" />
        </div>
      </Cell>
    </div>
  )
}

function ShapeLanguageDemo() {
  return (
    <Row gap="lg" align="center" className="justify-center">
      {[
        { r: '8px', label: 'Pressable', sub: 'button, input' },
        { r: '16px', label: 'Container', sub: 'card, panel' },
        { r: '9999px', label: 'Label', sub: 'badge, chip' },
      ].map((s) => (
        <Stack key={s.label} gap="xs" className="items-center">
          <div
            className="grid h-16 w-28 place-items-center border border-[var(--ds-border)] bg-[var(--ds-surface-raised)] text-caption text-[var(--ds-fg-secondary)]"
            style={{ borderRadius: s.r }}
          >
            {s.r}
          </div>
          <span className="text-label-sm text-[var(--ds-fg)]">{s.label}</span>
          <span className="text-[10px] text-[var(--ds-fg-muted)]">{s.sub}</span>
        </Stack>
      ))}
    </Row>
  )
}

export default defineDoc({
  meta: {
    id: 'radius',
    title: 'Radius',
    tagline:
      'Seven steps and one nesting rule. Corner radius is a shape language: it tells the user what a thing is before they read it.',
    keywords: ['corner', 'rounded', 'border radius', 'shape', 'squircle', 'nesting'],
  },

  overview: {
    purpose:
      'Radius carries category. In this system an 8px corner means "you can press this", a 16px corner means "this contains things", and a fully rounded corner means "this is a label, not a control". A user learns that vocabulary in about thirty seconds and then never has to think about it again — which is the whole point of a shape language.',
    whenToUse: [
      'On every surface and control, taken from the seven-step scale.',
      'To distinguish categories: interactive (8px), container (16px), label (full).',
      'To soften a surface that sits on top of another — overlays get more radius than the page.',
      'To signal edge-anchoring: a bottom sheet has a large top radius and square bottom corners.',
    ],
    whenNotToUse: [
      {
        text: 'A radius between two steps because it "looked slightly better".',
        instead: 'the nearest step',
      },
      {
        text: 'Full rounding on a button — it makes it read as a chip or a tag.',
        instead: '--radius-md',
      },
      {
        text: 'Radius on an element that spans the full viewport width.',
        instead: 'square corners; a radius against the screen edge just looks like a rendering bug',
      },
      {
        text: 'Radius on a table cell or a divider.',
        instead: 'no radius — structural lines should not be soft',
      },
    ],
    reasoning: (
      <>
        <p>
          The nesting rule is the part almost everyone gets wrong:{' '}
          <strong>inner radius = outer radius − padding</strong>. A 16px card with 8px of padding
          needs its child at 8px. If the child also uses 16px, the two curves run at different
          distances from each other and the gap between them visibly pinches at the corners. It is a
          small thing that reads unmistakably as "unfinished".
        </p>
        <p>
          Radius also scales with size, but sub-linearly. A 28px button at 8px radius and a 640px
          dialog at 20px radius look like they belong to the same family. If you scaled the radius
          linearly the dialog would need 180px corners and would look like a pill.
        </p>
        <p>
          We use plain <code>border-radius</code> rather than superellipse "squircle" corners. Real
          squircles need an SVG mask or <code>corner-shape</code>, which is not yet reliable
          cross-browser, and the difference is genuinely invisible below about 20px. Above that we
          keep the radius modest enough that the discontinuity never becomes noticeable.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="The scale" center={false} minHeight={0} allowResize={false}>
        <Stack gap="sm" className="w-full">
          {STEPS.map((s) => (
            <div key={s.token} className="flex items-center gap-4">
              <div
                className="h-12 w-20 shrink-0 border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)]"
                style={{ borderRadius: s.px === 9999 ? 9999 : s.px }}
              />
              <code className="w-32 shrink-0 font-mono text-[11.5px] text-[var(--ds-accent-text)]">
                {s.token}
              </code>
              <span className="w-12 shrink-0 font-mono text-[11px] tabular-nums text-[var(--ds-fg-muted)]">
                {s.px === 9999 ? '∞' : `${s.px}px`}
              </span>
              <span className="text-caption text-[var(--ds-fg-muted)]">{s.use}</span>
            </div>
          ))}
        </Stack>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'nesting',
        title: 'The nesting rule',
        description:
          'Inner radius equals outer radius minus the padding between them. Get it wrong and the corners pinch — visible even to people who cannot name what is bothering them.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <NestingDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'language',
        title: 'Shape as category',
        description:
          'Three radii, three meanings. The user never reads a legend — they infer the rule from consistent exposure.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <ShapeLanguageDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'edges',
        title: 'Edge anchoring',
        description:
          'A surface attached to a viewport edge rounds only the corners that are not touching it. Rounding all four makes it look detached and floating.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Bottom sheet — top corners only" tone="good">
                <div className="h-24 w-full rounded-t-[28px] border border-b-0 border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]" />
              </Cell>
              <Cell label="All four corners" tone="bad">
                <div className="h-24 w-full rounded-[28px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]" />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '4px', note: 'xs · checkbox', render: <span className="block h-10 w-10 rounded-[4px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '6px', note: 'sm · menu item', render: <span className="block h-10 w-10 rounded-[6px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '8px', note: 'md · button', render: <span className="block h-10 w-10 rounded-[8px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '12px', note: 'lg · popover', render: <span className="block h-10 w-10 rounded-[12px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '16px', note: 'xl · card', render: <span className="block h-10 w-10 rounded-[16px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '20px', note: '2xl · dialog', render: <span className="block h-10 w-10 rounded-[20px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: '28px', note: '3xl · sheet', render: <span className="block h-10 w-10 rounded-[28px] bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
      { label: 'full', note: 'pill · badge', render: <span className="block h-10 w-10 rounded-full bg-[var(--ds-accent-subtle)] ring-1 ring-[var(--ds-accent-border)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm rounded-[20px] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-4">
        <div className="rounded-[16px] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
          <div className="rounded-[8px] bg-[var(--ds-surface-inset)] p-2">
            <div className="rounded-[4px] bg-[var(--ds-accent-subtle)] px-2 py-1 text-center text-caption text-[var(--ds-accent-text)]">
              4px
            </div>
          </div>
        </div>
      </div>
    ),
    caption:
      'Four levels of nesting: 20 → 16 → 8 → 4, with 16px, 12px and 8px of padding between them. Every inner radius is its parent minus the padding.',
    parts: [
      {
        n: 1,
        label: 'Outermost',
        value: '20px · --radius-2xl',
        kind: 'shape',
        note: 'Dialog level. The largest radius that still reads as a rectangle rather than a lozenge at typical dialog widths.',
      },
      {
        n: 2,
        label: 'First child',
        value: '16px = 20 − 4',
        kind: 'shape',
        note: 'With 4px of padding the curves stay parallel. Any larger and the child’s corner starts crowding the parent’s.',
      },
      {
        n: 3,
        label: 'Second child',
        value: '8px = 16 − 8',
        kind: 'shape',
        note: 'Padding here is 12px, so strictly the child could be 4px. 8px is within tolerance — the rule is a floor, not a formula to two decimal places.',
      },
      {
        n: 4,
        label: 'Innermost',
        value: '4px · --radius-xs',
        kind: 'shape',
        note: 'The floor of the scale. Below 4px a corner reads as square, so there is no reason to have a 2px step.',
      },
      {
        n: 5,
        label: 'Border alignment',
        value: '1px inside the radius',
        kind: 'shape',
        note: 'Borders are drawn inside the radius, so a bordered element’s visible corner is 1px tighter than its declared radius. Ignore it below 12px; compensate above.',
      },
    ],
  },

  tokens: [
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Checkboxes, code chips, inline focus rings' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Menu items, xs buttons, nested rows' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Buttons, inputs, selects' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Popovers, alerts, lg buttons' },
    { category: 'radius', token: '--radius-xl', value: '16px', usedFor: 'Cards and panels' },
    { category: 'radius', token: '--radius-2xl', value: '20px', usedFor: 'Dialogs and the command palette' },
    { category: 'radius', token: '--radius-3xl', value: '28px', usedFor: 'Bottom sheets' },
    { category: 'radius', token: 'rounded-full', value: '9999px', usedFor: 'Badges, chips, avatars, switches' },
  ],

  sizes: [
    { name: 'Extra small', radius: '4px', use: 'Elements under 20px tall: checkboxes, tags, keyboard hints.' },
    { name: 'Small', radius: '6px', use: 'Elements 24–28px tall, and anything nested inside an 8px parent.' },
    { name: 'Medium', radius: '8px', use: 'Elements 32–40px tall. Every standard control.' },
    { name: 'Large', radius: '12px', use: 'Elements 44px+ tall, and floating surfaces under ~320px wide.' },
    { name: 'Extra large', radius: '16px', use: 'Content containers of any size.' },
    { name: '2XL', radius: '20px', use: 'Modal surfaces 400px+ wide.' },
    { name: '3XL', radius: '28px', use: 'Edge-anchored sheets. Applied to two corners only.' },
    { name: 'Full', radius: '9999px', use: 'Any element whose height defines its shape: pills, dots, avatars.' },
  ],

  do: [
    {
      title: 'Shrink the radius as you nest',
      why: 'Concentric curves need to stay parallel. Subtracting the padding from the parent radius is the formula, and it works at every scale.',
      render: (
        <div className="w-full rounded-[16px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-2">
          <div className="rounded-[8px] bg-[var(--ds-accent-subtle)] p-2">
            <div className="rounded-[4px] bg-[var(--ds-accent)] px-2 py-1 text-center text-caption text-[var(--ds-accent-fg)]">
              16 → 8 → 4
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Round only the corners that are not touching an edge',
      why: 'A radius against the viewport edge produces a sliver of background behind it, which reads as a bug rather than a design choice.',
      render: (
        <div className="w-full">
          <div className="h-16 w-full rounded-t-[20px] border border-b-0 border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]" />
        </div>
      ),
    },
    {
      title: 'Use overflow-hidden when content meets a rounded edge',
      why: 'An image or a table inside a rounded card will paint over the corner unless the container clips it. This is the most common radius bug in production.',
      render: (
        <div className="w-full overflow-hidden rounded-[16px] border border-[var(--ds-border)]">
          <div className="h-10 bg-[var(--ds-accent)]" />
          <div className="bg-[var(--ds-surface)] p-3 text-caption text-[var(--ds-fg-muted)]">
            overflow-hidden on the parent
          </div>
        </div>
      ),
    },
    {
      title: 'Keep one radius per category across the whole product',
      why: 'Every button at 8px and every card at 16px is what makes the shape language legible. Two buttons with different radii on one screen destroys the signal completely.',
      render: (
        <Row gap="sm">
          {['8px', '8px', '8px'].map((r, i) => (
            <span
              key={i}
              className="grid h-9 w-20 place-items-center bg-[var(--ds-accent)] text-caption text-[var(--ds-accent-fg)]"
              style={{ borderRadius: r }}
            >
              {r}
            </span>
          ))}
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not match inner and outer radius',
      why: 'The two curves converge at the corner and the padding visually collapses to nothing. It is the tell-tale sign of a layout assembled without a shape rule.',
      render: (
        <div className="w-full rounded-[16px] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-2">
          <div className="h-14 w-full rounded-[16px] bg-[var(--ds-danger-subtle)]" />
        </div>
      ),
    },
    {
      title: 'Do not fully round a button',
      why: 'Pill shapes belong to badges and chips. A fully rounded button reads as a tag, and users hesitate before clicking things they have categorised as labels.',
      render: (
        <Row gap="sm">
          <span className="grid h-9 place-items-center rounded-full bg-[var(--ds-accent)] px-5 text-caption text-[var(--ds-accent-fg)]">
            Save changes
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not use a radius larger than half the height',
      why: 'Past 50% of the shorter dimension the corners merge and you get an accidental pill. A 32px-tall element cannot have a 20px radius and still look rectangular.',
      render: (
        <span className="grid h-8 w-32 place-items-center bg-[var(--ds-danger-subtle)] text-caption text-[var(--ds-danger-text)]" style={{ borderRadius: 20 }}>
          h32 · r20
        </span>
      ),
    },
    {
      title: 'Do not mix radii within one component',
      why: 'A card with a 16px top and an 8px bottom looks like two components glued together. Asymmetric radius is reserved for edge anchoring, where it carries meaning.',
      render: (
        <div className="h-20 w-full border border-[var(--ds-border)] bg-[var(--ds-surface)]" style={{ borderRadius: '16px 4px 20px 8px' }} />
      ),
    },
  ],

  a11y: {
    criteria: [{ id: '1.4.11', name: 'Non-text Contrast', level: 'AA' }],
    contrast: [
      'Radius does not affect contrast, but it does affect how much of a border is visible. At 28px, roughly 12% of the perimeter is curve — a low-contrast border becomes harder to trace.',
      'A focus ring follows the element’s radius. On a fully rounded element the ring is a circle, which needs 3:1 against both the element and the page just like any other.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Focus rings inherit border-radius automatically via outline, so no per-shape work is needed.' },
    ],
    aria: [
      {
        attr: 'forced-colors: active',
        on: 'All surfaces',
        note: 'High Contrast Mode keeps the radius but replaces colours. Shape becomes the primary categorical signal, which is an argument for keeping the language consistent.',
      },
    ],
    focus:
      'outline follows border-radius in every modern browser, which is one more reason to use outline for focus rather than a box-shadow ring.',
    screenReader: ['Radius is purely visual and is never announced. It must never be the only way a category is communicated.'],
    touch:
      'A large radius reduces the effective corner hit area slightly, because the corners are outside the shape. It is negligible below 20px; on a 28px sheet handle, keep interactive targets away from the corners.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Always reference the token, never a literal
<Card className="rounded-[var(--radius-xl)]" />
<Button className="rounded-[var(--radius-md)]" />
<Badge className="rounded-full" />

// Nesting: derive the inner radius from the outer minus padding
const OUTER = 16
const PAD = 8
<div style={{ borderRadius: OUTER, padding: PAD }}>
  <div style={{ borderRadius: OUTER - PAD }} />
</div>

// Or in CSS, so it survives a token change
<div className="rounded-[var(--radius-xl)] p-2">
  <div className="rounded-[calc(var(--radius-xl)-8px)]" />
</div>

// Edge-anchored surfaces round two corners only
<BottomSheet className="rounded-t-[var(--radius-3xl)]" />

// Clip children that reach the edge
<div className="overflow-hidden rounded-[var(--radius-xl)]">
  <img src={cover} alt="" />
</div>`,
    },
    css: {
      lang: 'css',
      code: `:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-3xl: 28px;
}

/* Nesting expressed in CSS so it tracks the token */
.card {
  border-radius: var(--radius-xl);
  padding: 8px;
}
.card > .card__media {
  border-radius: calc(var(--radius-xl) - 8px);
}

/* Clip anything that reaches a rounded edge */
.card--media { overflow: hidden; }

/* Edge-anchored: only the free corners */
.sheet {
  border-start-start-radius: var(--radius-3xl);
  border-start-end-radius: var(--radius-3xl);
}

/* Logical properties, so RTL mirrors correctly without a second rule */
.notice {
  border-start-start-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
}`,
    },
  },

  notes: {
    tips: [
      'When in doubt between two steps, take the smaller one. Under-rounding reads as restrained; over-rounding reads as a toy.',
      'A border is drawn inside the radius, so a bordered element looks marginally tighter than an unbordered one at the same value. Above 16px, bump the bordered version by 1px if they sit side by side.',
      'Radius and elevation should move together. A surface that floats higher usually wants a slightly larger radius — compare our 12px popover with our 20px dialog.',
      'For images inside cards, prefer overflow-hidden on the card to setting a radius on the image. One rule instead of one per child, and it survives content changes.',
    ],
    performance: [
      'border-radius on a scrolling container forces the browser to clip on every frame. On long lists, round the wrapper rather than the scroll area itself.',
      'A rounded element with a shadow and a backdrop-filter is three separate compositing steps. That combination is fine on a dialog and expensive on 200 table rows.',
      'Avoid animating border-radius; it triggers a repaint of the whole element. Cross-fade two elements or animate a transform instead.',
    ],
    mistakes: [
      'Forgetting overflow-hidden on a card with a full-bleed image. The image squares off the corners and nobody notices until a screenshot goes into a deck.',
      'Applying a radius to a full-width mobile banner. On a 360px screen the curve is visible against the edge and looks like a rendering artefact.',
      'Setting a radius on a <table>. The cells ignore it; you must round the wrapper and clip.',
      'Using rounded-full on a variable-height element. The moment the content wraps to two lines the radius follows the height and the shape changes.',
    ],
    realWorld: [
      'Pick the container radius first — it is the most visible surface in the product — then derive the rest of the scale from it. 16px containers imply 8px controls.',
      'If a designer hands over a Figma file with corner radii of 10, 14 and 18, snap them to 8, 12 and 16 before building. The difference is invisible; the consistency is not.',
      'On marketing pages you can afford one step larger everywhere. Marketing surfaces are bigger and softer shapes read as friendlier; product surfaces are dense and need tighter geometry.',
      'Audit for radius drift the same way you audit colour: grep for rounded-[ and border-radius: and check every literal against the scale.',
    ],
  },
})
