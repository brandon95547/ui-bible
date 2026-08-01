import { Badge } from '@/ui/Display'
import { Button } from '@/ui/Button'
import { Cell, PreviewStage, Row, SpaceBar, Stack, defineDoc } from '../framework/kit'

const SCALE = [
  { name: 'space-0.5', px: 2, use: 'Hairline nudges. Icon optical alignment only.' },
  { name: 'space-1', px: 4, use: 'The atom. Gap between a label and its required asterisk.' },
  { name: 'space-1.5', px: 6, use: 'Icon-to-label inside a small control.' },
  { name: 'space-2', px: 8, use: 'Icon-to-label, chip gaps, tight inline groups.' },
  { name: 'space-2.5', px: 10, use: 'Compact button padding.' },
  { name: 'space-3', px: 12, use: 'Input padding, table cell padding, list row gaps.' },
  { name: 'space-4', px: 16, use: 'Default gap between related elements. The workhorse.' },
  { name: 'space-5', px: 20, use: 'Card padding, gap between stacked form fields.' },
  { name: 'space-6', px: 24, use: 'Gap between subsections, dialog padding.' },
  { name: 'space-8', px: 32, use: 'Gap between distinct content blocks.' },
  { name: 'space-10', px: 40, use: 'Page gutters on tablet.' },
  { name: 'space-12', px: 48, use: 'Gap between page sections.' },
  { name: 'space-14', px: 56, use: 'Major section separation on a documentation page.' },
  { name: 'space-16', px: 64, use: 'Hero padding, empty-state vertical rhythm.' },
  { name: 'space-24', px: 96, use: 'Page bottom padding, large landing sections.' },
]

function ProximityDemo() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Cell label="Correct — gaps encode grouping" tone="good">
        <div className="flex w-full flex-col gap-6">
          {[
            ['Account', ['Email address', 'Password']],
            ['Notifications', ['Product updates', 'Security alerts']],
          ].map(([group, fields]) => (
            <div key={group as string} className="flex flex-col gap-2">
              <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{group}</span>
              {(fields as string[]).map((f) => (
                <div
                  key={f}
                  className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]"
                >
                  {f}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Cell>
      <Cell label="Wrong — one uniform gap" tone="bad">
        <div className="flex w-full flex-col gap-3">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Account</span>
          <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]">Email address</div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]">Password</div>
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Notifications</span>
          <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]">Product updates</div>
          <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-secondary)]">Security alerts</div>
        </div>
      </Cell>
    </div>
  )
}

function DensityDemo() {
  const rows = ['api-gateway', 'auth-service', 'billing-worker']
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {(
        [
          ['Compact', 'py-1.5', '36px row'],
          ['Default', 'py-2.5', '44px row'],
          ['Relaxed', 'py-4', '56px row'],
        ] as const
      ).map(([label, pad, note]) => (
        <Cell key={label} label={label} sub={note}>
          <div className="w-full divide-y divide-[var(--ds-border-subtle)] rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
            {rows.map((r) => (
              <div key={r} className={`flex items-center px-3 ${pad} text-caption text-[var(--ds-fg-secondary)]`}>
                {r}
              </div>
            ))}
          </div>
        </Cell>
      ))}
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'spacing',
    title: 'Spacing',
    tagline:
      'A 4px grid, fifteen steps, and one job: make the relationship between two things visible before either of them is read.',
    keywords: ['padding', 'margin', 'gap', 'whitespace', '8pt grid', 'rhythm', 'proximity', 'density'],
  },

  overview: {
    purpose:
      'Spacing is how an interface communicates structure without drawing anything. The distance between two elements tells the user whether they belong together, and it does so pre-attentively — before a single word is read. Getting the gaps right removes the need for most of the boxes, dividers and background colours a cluttered interface reaches for.',
    whenToUse: [
      'To group related items: elements that belong together get a smaller gap than elements that do not.',
      'To create breathing room inside a container: padding is what stops content feeling trapped.',
      'To establish rhythm down a page, so scrolling feels regular rather than lumpy.',
      'To separate sections — as a replacement for a divider, not in addition to one.',
    ],
    whenNotToUse: [
      {
        text: 'To vertically centre something with an eyeballed margin.',
        instead: 'flexbox or grid alignment',
      },
      {
        text: 'To force alignment by nudging a single element by 3px.',
        instead: 'fixing the container that made it misaligned',
      },
      {
        text: 'To create hierarchy that should come from type size or weight.',
        instead: 'the type scale',
      },
      {
        text: 'As a substitute for a scroll container when content genuinely overflows.',
        instead: 'overflow with a fade mask',
      },
    ],
    reasoning: (
      <>
        <p>
          The Gestalt principle of proximity is the strongest grouping cue humans have — stronger
          than similarity, stronger than a shared border, stronger than colour. Two labels 8px apart
          are one group. The same two labels 32px apart are two groups. No amount of boxing will
          override that impression, which is why so many interfaces are full of cards that do not
          help: the boxes are fighting the gaps.
        </p>
        <p>
          The base unit is <strong>4px</strong>, not 8. An 8px grid is too coarse for the small
          end — icon-to-label spacing genuinely wants 6px, and forcing it to 8 makes every button
          feel slightly loose. Above 16px we skip to multiples of 8 anyway, so we get the alignment
          benefits of an 8pt grid where they matter and the precision of a 4pt grid where it counts.
        </p>
        <p>
          The most useful rule in practice: <strong>the gap between groups must be at least twice
          the gap within a group</strong>. If fields inside a section are 16px apart, sections are
          at least 32px apart. When a layout feels muddled and you cannot say why, this ratio is
          almost always the thing that is wrong.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="The scale" center={false} minHeight={0} allowResize={false}>
        <Stack gap="sm" className="w-full">
          {SCALE.map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <SpaceBar px={s.px} name={s.name} />
              <span className="hidden text-caption text-[var(--ds-fg-muted)] sm:block">{s.use}</span>
            </div>
          ))}
        </Stack>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'proximity',
        title: 'Proximity',
        description:
          'Both panels contain identical content. The left one uses two gap values; the right uses one. Only the left is scannable.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ProximityDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'density',
        title: 'Density',
        description:
          'Three densities, one component. Compact is for power users on a large screen; relaxed is for touch and for first-time users.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <DensityDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'optical',
        title: 'Optical vs mathematical',
        description:
          'Equal padding on all four sides of a text block looks bottom-heavy, because descenders and line-height already add space below. Trim 1–2px off the bottom for optical balance.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Mathematically equal" sub="16px on all sides">
                <div className="rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4 text-body-sm">
                  Deploy to production
                </div>
              </Cell>
              <Cell label="Optically equal" sub="16px top, 14px bottom" tone="good">
                <div
                  className="rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface)] text-body-sm"
                  style={{ padding: '16px 16px 14px' }}
                >
                  Deploy to production
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '4px', note: 'Atomic nudge', render: <span className="block h-4 w-1 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '8px', note: 'Inline gap', render: <span className="block h-4 w-2 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '12px', note: 'Control padding', render: <span className="block h-4 w-3 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '16px', note: 'Default gap', render: <span className="block h-4 w-4 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '24px', note: 'Subsection', render: <span className="block h-4 w-6 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '32px', note: 'Block', render: <span className="block h-4 w-8 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '48px', note: 'Section', render: <span className="block h-4 w-12 rounded-[2px] bg-[var(--ds-accent)]" /> },
      { label: '64px', note: 'Page rhythm', render: <span className="block h-4 w-16 rounded-[2px] bg-[var(--ds-accent)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <div className="relative rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[var(--radius-xl)] anatomy-pad" />
          <div className="relative p-5">
            <div className="flex flex-col gap-1">
              <h4 className="text-h4 text-[var(--ds-fg)]">Production</h4>
              <p className="text-caption text-[var(--ds-fg-muted)]">3 regions · 12 instances</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {['us-east-1', 'eu-west-2'].map((r) => (
                <div
                  key={r}
                  className="rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] px-3 py-2 text-caption text-[var(--ds-fg-secondary)]"
                >
                  {r}
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2 border-t border-[var(--ds-border-subtle)] pt-4">
              <Button size="sm" variant="outlined">
                Logs
              </Button>
              <Button size="sm">Deploy</Button>
            </div>
          </div>
        </div>
      </div>
    ),
    caption:
      'One card, five distinct spacing decisions. The hatched region is the card’s own padding.',
    parts: [
      {
        n: 1,
        label: 'Container padding',
        value: '20px',
        kind: 'space',
        note: 'Larger than any internal gap, so the content reads as sitting inside the card rather than being clipped by it. 20px is the sweet spot for a 16px-radius card.',
      },
      {
        n: 2,
        label: 'Title → subtitle',
        value: '4px',
        kind: 'space',
        note: 'The tightest gap in the card, because these two strings are one unit. Anything larger and the subtitle starts to read as separate metadata.',
      },
      {
        n: 3,
        label: 'Header → list',
        value: '16px',
        kind: 'space',
        note: '4× the title gap. That ratio is what makes the header a header rather than the first list item.',
      },
      {
        n: 4,
        label: 'Between list rows',
        value: '8px',
        kind: 'space',
        note: 'Half the header gap. Rows are more related to each other than they are to the header, and the spacing says so.',
      },
      {
        n: 5,
        label: 'Footer separation',
        value: '20px + 1px rule + 16px',
        kind: 'space',
        note: 'The divider gets more space above than below because the eye reads the rule as belonging to the content beneath it.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'gap-1', value: '4px', usedFor: 'Label to required marker' },
    { category: 'spacing', token: 'gap-1.5', value: '6px', usedFor: 'Icon to label in small controls' },
    { category: 'spacing', token: 'gap-2', value: '8px', usedFor: 'Icon to label, chip rows, button rows' },
    { category: 'spacing', token: 'gap-3', value: '12px', usedFor: 'Input padding, table cells' },
    { category: 'spacing', token: 'gap-4', value: '16px', usedFor: 'Default gap between related elements' },
    { category: 'spacing', token: 'gap-5', value: '20px', usedFor: 'Card padding, stacked form fields' },
    { category: 'spacing', token: 'gap-6', value: '24px', usedFor: 'Subsections, dialog padding' },
    { category: 'spacing', token: 'gap-8', value: '32px', usedFor: 'Distinct content blocks' },
    { category: 'spacing', token: 'gap-12', value: '48px', usedFor: 'Page sections' },
    { category: 'spacing', token: 'gap-14', value: '56px', usedFor: 'Documentation section rhythm' },
    { category: 'spacing', token: 'px-6 / px-10', value: '24 / 40px', usedFor: 'Page gutters, mobile and desktop' },
    { category: 'radius', token: '--radius-xl', value: '16px', usedFor: 'Card corners — pairs with 20px padding' },
  ],

  sizes: [
    { name: 'Inline (xs)', gap: '4–6px', use: 'Inside a single control: icon to label, label to badge.' },
    { name: 'Tight (sm)', gap: '8px', use: 'Between siblings that form one visual object — a row of chips or buttons.' },
    { name: 'Related (md)', gap: '12–16px', use: 'Between elements in the same group. The default.' },
    { name: 'Grouped (lg)', gap: '20–24px', use: 'Between groups inside one section. Also standard card padding.' },
    { name: 'Section (xl)', gap: '32–48px', use: 'Between distinct sections of a page.' },
    { name: 'Page (2xl)', gap: '56–96px', use: 'Between major page regions, and above the footer.' },
  ],

  do: [
    {
      title: 'Keep the group gap at least 2× the item gap',
      why: 'This single ratio is what makes grouping unambiguous. At 1.5× the eye hesitates; at 2× or more it does not have to think about it at all.',
      render: (
        <Stack gap="sm" className="w-full">
          <div className="flex flex-col gap-2">
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
          </div>
          <div className="h-4" />
          <div className="flex flex-col gap-2">
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
          </div>
        </Stack>
      ),
    },
    {
      title: 'Use gap, not margins on children',
      why: 'gap belongs to the container, so it cannot collapse, cannot leak past the last child, and cannot be accidentally doubled by a sibling’s margin. It also survives reordering.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-success-text)]">
          .list {'{'} display: flex; flex-direction: column; gap: 12px; {'}'}
        </code>
      ),
    },
    {
      title: 'Give the container more padding than its contents have gap',
      why: 'If a card has 16px padding and 16px internal gaps, the content looks like it is trying to escape. Padding one step above the largest internal gap reads as deliberate containment.',
      render: (
        <div className="w-full rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-5">
          <div className="flex flex-col gap-3">
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
            <span className="h-3 w-2/3 rounded-[3px] bg-[var(--ds-layer-active)]" />
          </div>
        </div>
      ),
    },
    {
      title: 'Offer density as a user preference in data-heavy products',
      why: 'An analyst on a 32-inch monitor and a manager on a laptop want different row heights. One toggle that swaps a padding token satisfies both without a second design.',
      render: (
        <Row gap="sm">
          <Badge tone="accent" size="sm">Compact</Badge>
          <Badge tone="neutral" size="sm">Default</Badge>
          <Badge tone="neutral" size="sm">Relaxed</Badge>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use one gap for everything',
      why: 'Uniform spacing means no grouping information at all. The user has to read every label to work out the structure, which is exactly the work spacing exists to remove.',
      render: (
        <Stack gap="sm" className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
          ))}
        </Stack>
      ),
    },
    {
      title: 'Do not fix alignment with a one-off negative margin',
      why: 'A −3px nudge is a symptom: something upstream has the wrong padding or the wrong line-height. The nudge will break the moment the font size, the icon or the container changes.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          margin-top: -3px; /* looks right on my screen */
        </code>
      ),
    },
    {
      title: 'Do not stack margin and gap on the same axis',
      why: 'The two add up and you get 28px where you designed 16px. Worse, it only shows up between certain siblings, so it reads as a random inconsistency.',
      render: (
        <div className="flex w-full flex-col gap-4">
          <span className="h-3 rounded-[3px] bg-[var(--ds-danger-subtle)]" />
          <span className="mt-3 h-3 rounded-[3px] bg-[var(--ds-danger-subtle)]" />
          <span className="h-3 rounded-[3px] bg-[var(--ds-danger-subtle)]" />
        </div>
      ),
    },
    {
      title: 'Do not remove whitespace to fit more in',
      why: 'Cramming raises the perceived complexity of a screen far faster than it raises the amount of information on it. If everything must be visible at once, the answer is a different layout, not smaller gaps.',
      render: (
        <div className="flex w-full flex-col gap-px">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span key={i} className="h-3 rounded-[2px] bg-[var(--ds-danger-subtle)]" />
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
    ],
    contrast: [
      'Whitespace is not subject to contrast rules, but it is the cheapest way to improve legibility for low-vision users — more space around a block raises comprehension more than raising contrast past AA does.',
      'Where a divider would need to meet 3:1, extra spacing achieves the same separation with no contrast obligation at all.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Spacing does not affect focus order, but visual grouping must match DOM order or keyboard users get a different structure than sighted users.' },
    ],
    aria: [
      {
        attr: 'Text spacing override',
        on: 'User stylesheet',
        note: 'WCAG 1.4.12 requires the layout to survive line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em and word-spacing 0.16em. Fixed-height containers are the usual failure.',
      },
      {
        attr: 'role="group" + aria-labelledby',
        on: 'Visual groups',
        note: 'Spacing conveys grouping visually. Assistive tech needs the grouping expressed structurally as well — a fieldset, a list, or a labelled group.',
      },
    ],
    focus:
      'Focus rings sit at 2px offset, so any element needs at least 4px of clear space around it or the ring is clipped by a neighbour. This is a real constraint on tight layouts.',
    screenReader: [
      'Spacing is invisible to screen readers. Every group the eye sees must also exist as a list, a fieldset, a section, or a labelled region.',
      'Do not use empty elements or non-breaking spaces to create space — they are announced and they pollute the reading experience.',
    ],
    touch:
      'Adjacent touch targets need at least 8px of clear space between them, and 44 × 44 each. Two 36px buttons 4px apart is the most common target-size failure in real products.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Gap on the container, never margins on the children
<div className="flex flex-col gap-3">
  <Field label="Email" />
  <Field label="Password" />
</div>

// Group gap is 2x the item gap
<form className="flex flex-col gap-8">        {/* between groups  */}
  <fieldset className="flex flex-col gap-4">  {/* within a group  */}
    <Field label="First name" />
    <Field label="Last name" />
  </fieldset>
  <fieldset className="flex flex-col gap-4">
    <Field label="Company" />
    <Field label="Role" />
  </fieldset>
</form>

// Container padding one step above the largest internal gap
<Card className="p-5">
  <div className="flex flex-col gap-4">…</div>
</Card>

// Density as a token swap, not a second component
const pad = { compact: 'px-3 py-1.5', normal: 'px-3.5 py-2.5', relaxed: 'px-4 py-4' }
<td className={pad[density]}>{value}</td>`,
    },
    css: {
      lang: 'css',
      code: `/* The scale is Tailwind's default 0.25rem base — every step is a
   multiple of 4px, so nothing can land off-grid by accident. */

.stack        { display: flex; flex-direction: column; gap: 1rem; }   /* 16 */
.stack--tight { gap: 0.5rem; }                                        /*  8 */
.stack--loose { gap: 2rem; }                                          /* 32 */

/* Optical padding: trim the bottom, because line-height already
   contributes space below the last baseline. */
.card {
  padding: 1.25rem 1.25rem 1.125rem;   /* 20 20 18 */
  border-radius: var(--radius-xl);
}

/* Page gutters scale with the viewport, content width does not */
.page {
  padding-inline: 1.5rem;              /* 24 on mobile  */
  margin-inline: auto;
  max-inline-size: 76rem;
}
@media (min-width: 640px) {
  .page { padding-inline: 2.5rem; }    /* 40 on desktop */
}

/* Survive the WCAG 1.4.12 text-spacing override: no fixed heights
   on anything that contains text. */
.callout { min-block-size: 3rem; block-size: auto; }`,
    },
  },

  notes: {
    tips: [
      'When a layout feels wrong but you cannot name why, measure the gaps. Nine times out of ten two things that belong together are further apart than two things that do not.',
      'Squint at the screen. Whitespace should resolve into clean rectangular groups. If you see one undifferentiated grey field, the gaps are uniform and the structure is invisible.',
      'Space is cheaper than borders. Before adding a divider, try doubling the gap — you usually get the same separation with less visual noise.',
      'Vertical rhythm matters more than horizontal. Users scroll, so an irregular vertical cadence is felt on every screen; an irregular horizontal one is often never noticed.',
    ],
    performance: [
      'gap on flex and grid is resolved during layout with no extra boxes. Spacer divs cost DOM nodes, layout time, and are announced by screen readers.',
      'Avoid animating padding or margin — both trigger layout on every frame. Animate transform: translate() instead, which stays on the compositor.',
      'In a virtualised list, put the gap in the item height calculation rather than as a CSS gap, or the virtualiser will mis-measure and rows will jitter during fast scroll.',
    ],
    mistakes: [
      'Using margin-bottom on list items, then fighting the extra space after the last one with :last-child. gap solves this by construction.',
      'Setting a fixed height on a container with text inside. It fails WCAG 1.4.12 the moment a user increases line-height, and it fails localisation immediately.',
      'Collapsing margins between adjacent block elements producing a gap that is neither value. Flex and grid containers do not collapse margins, which is another reason to prefer gap.',
      'Treating padding as a way to hit a target size. Padding that only exists to reach 44px is invisible and inconsistent — use a pseudo-element overlay instead.',
    ],
    realWorld: [
      'Adopt the 2× rule as a review checklist item. It is objective, it takes five seconds to check, and it catches most layout problems before they ship.',
      'For dense enterprise tables, ship compact as a preference but never as the default. New users need the relaxed version to learn the structure; power users will find the toggle.',
      'When a stakeholder says a page "looks empty", resist filling it. The usual fix is a narrower measure and a clearer hierarchy — the same content, better organised.',
      'Design the mobile gutters first. 16px is too tight on a modern phone and 32px wastes a third of a 360px screen; 24px is the value that survives contact with real content.',
    ],
  },
})
