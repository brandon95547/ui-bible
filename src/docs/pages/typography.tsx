import { Badge } from '@/ui/Display'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SCALE = [
  { token: 'text-display', px: 44, lh: 1.08, ls: '-0.028em', w: 620, use: 'Marketing hero. One per page, at most.' },
  { token: 'text-h1', px: 32, lh: 1.16, ls: '-0.022em', w: 620, use: 'Page title. Exactly one per screen.' },
  { token: 'text-h2', px: 24, lh: 1.25, ls: '-0.017em', w: 600, use: 'Major section.' },
  { token: 'text-h3', px: 19, lh: 1.35, ls: '-0.012em', w: 600, use: 'Subsection, dialog title.' },
  { token: 'text-h4', px: 16, lh: 1.45, ls: '-0.006em', w: 600, use: 'Card title, group heading.' },
  { token: 'text-body-lg', px: 17, lh: 1.62, ls: '-0.004em', w: 400, use: 'Lead paragraph, long-form reading.' },
  { token: 'text-body', px: 15, lh: 1.66, ls: '-0.002em', w: 400, use: 'Default body copy. The workhorse.' },
  { token: 'text-body-sm', px: 13, lh: 1.6, ls: '0', w: 400, use: 'Dense UI copy, table cells, help text.' },
  { token: 'text-label', px: 13, lh: 1.2, ls: '0.001em', w: 540, use: 'Buttons, form labels, tabs, nav.' },
  { token: 'text-label-sm', px: 12, lh: 1.2, ls: '0.004em', w: 540, use: 'Compact controls, table headers.' },
  { token: 'text-caption', px: 12, lh: 1.45, ls: '0.002em', w: 400, use: 'Metadata, timestamps, hints.' },
  { token: 'text-overline', px: 11, lh: 1.2, ls: '0.09em', w: 600, use: 'Section eyebrows. Always uppercase.' },
  { token: 'text-code', px: 13, lh: 1.65, ls: '-0.005em', w: 400, use: 'Inline and block code.' },
]

function ScaleSpecimen() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)]">
            <th scope="col" className="py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Specimen
            </th>
            <th scope="col" className="w-32 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Token
            </th>
            <th scope="col" className="w-44 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Size / LH / Tracking
            </th>
          </tr>
        </thead>
        <tbody>
          {SCALE.map((s) => (
            <tr key={s.token} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <td className="py-3 pr-4">
                <span
                  className={s.token === 'text-code' ? 'font-mono' : undefined}
                  style={{
                    fontSize: s.px,
                    lineHeight: s.lh,
                    letterSpacing: s.ls,
                    fontWeight: s.w,
                    textTransform: s.token === 'text-overline' ? 'uppercase' : undefined,
                    display: 'block',
                  }}
                >
                  {s.token === 'text-overline' ? 'Section label' : 'The quick brown fox'}
                </span>
              </td>
              <td className="py-3 pr-4 align-middle">
                <code className="font-mono text-[11.5px] text-[var(--ds-accent-text)]">{s.token}</code>
              </td>
              <td className="py-3 align-middle font-mono text-[11px] tabular-nums text-[var(--ds-fg-muted)]">
                {s.px}px / {s.lh} / {s.ls}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MeasureDemo() {
  const text =
    'A line that runs too long forces the eye to travel back across the page and re-find the start of the next line. Somewhere around forty-five characters the return sweep becomes reliable, and somewhere past eighty it stops being.'
  return (
    <Stack gap="md" className="w-full">
      {[
        { w: '110ch', label: '110 characters', tone: 'bad' as const, note: 'The eye loses its place on the return sweep.' },
        { w: '68ch', label: '68 characters', tone: 'good' as const, note: 'Comfortable for sustained reading.' },
        { w: '28ch', label: '28 characters', tone: 'bad' as const, note: 'Too many returns; rhythm breaks up.' },
      ].map((m) => (
        <Cell key={m.label} label={m.label} sub={m.note} tone={m.tone}>
          <p className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]" style={{ maxWidth: m.w }}>
            {text}
          </p>
        </Cell>
      ))}
    </Stack>
  )
}

function HierarchyDemo() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Cell label="Hierarchy by size + weight + colour" tone="good">
        <div className="flex flex-col gap-1">
          <span className="text-overline uppercase text-[var(--ds-accent-text)]">Billing</span>
          <h3 className="text-h3 text-[var(--ds-fg)]">Invoice 2026-0431</h3>
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">
            Issued 12 July · Due 26 July
          </p>
          <p className="text-caption text-[var(--ds-fg-muted)]">Auto-charged to Visa ···4242</p>
        </div>
      </Cell>
      <Cell label="Hierarchy by size alone" tone="bad">
        <div className="flex flex-col gap-1 text-[var(--ds-fg)]">
          <span className="text-[11px]">BILLING</span>
          <span className="text-[19px]">Invoice 2026-0431</span>
          <span className="text-[13px]">Issued 12 July · Due 26 July</span>
          <span className="text-[12px]">Auto-charged to Visa ···4242</span>
        </div>
      </Cell>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'typography',
    title: 'Typography',
    group: 'Foundations',
    tagline:
      'Thirteen named styles, one variable family, and a measure that keeps the eye from getting lost. Typography is ninety-five percent of an interface — everything else is arrangement.',
    keywords: ['font', 'type scale', 'line height', 'measure', 'leading', 'tracking', 'inter'],
  },

  overview: {
    purpose:
      'The type scale is the primary tool for hierarchy. Before colour, before borders, before elevation — size, weight and spacing tell the user what matters, in what order, and where one idea ends and the next begins. A screen with correct typography and no colour is still usable; the reverse is not true.',
    whenToUse: [
      'Always. Every string in the product should be one of the thirteen named styles.',
      'To establish hierarchy: exactly one h1 per screen, then h2 for sections, h3 for subsections.',
      'To signal function: label for interactive text, caption for metadata, body for prose.',
      'To constrain reading width — measure is a typographic decision, not a layout one.',
    ],
    whenNotToUse: [
      {
        text: 'A size between two scale steps because the heading "looked a bit big".',
        instead: 'the nearest step, or more whitespace around it',
      },
      {
        text: 'A second typeface for emphasis.',
        instead: 'weight, size or colour within the same family',
      },
      {
        text: 'Uppercase for anything longer than three words.',
        instead: 'sentence case with a heavier weight',
      },
      {
        text: 'Italics for UI labels — Inter’s italic is optically lighter and hurts scanning.',
        instead: 'a muted colour or a smaller size',
      },
    ],
    reasoning: (
      <>
        <p>
          Body copy is 15px rather than the 16px default. That is a deliberate trade: this is a
          dense product interface, not an article, and at 15px with a 1.66 line height the text
          block is comfortable while leaving room for the metadata and controls that surround it.
          Long-form reading surfaces step up to 17px, where the extra size actually earns itself.
        </p>
        <p>
          Every heading has negative tracking, and the larger it is the more negative it gets.
          Letterforms designed for body sizes have spacing built in for small text; at 32px that
          spacing reads as gaps. Tightening display sizes and leaving small sizes alone —{' '}
          <strong>optical sizing by hand</strong> — is what separates typography that looks
          designed from typography that looks defaulted.
        </p>
        <p>
          Line height is inversely related to size. A 44px display line at 1.08 and a 13px caption
          at 1.6 are the same optical rhythm: as type gets smaller, the eye needs proportionally
          more vertical room to find the next line. Applying a single line-height to everything is
          the most common reason a page "feels cramped" without anyone being able to say why.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Type scale" center={false} minHeight={0} allowResize={false}>
        <ScaleSpecimen />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'measure',
        title: 'Measure',
        description:
          'Line length is the single biggest lever on reading comfort. 45–75 characters is the usable band; 60–70 is the target.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <MeasureDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'hierarchy',
        title: 'Hierarchy',
        description:
          'The left block varies size, weight and colour together. The right varies only size. Both have the same information; only one of them can be scanned.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <HierarchyDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'numerals',
        title: 'Numerals',
        description:
          'Tabular figures are mandatory anywhere a number can change or be compared vertically. Proportional figures are for prose.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Tabular — table, metric, timer" tone="good">
                <div className="flex flex-col gap-1 font-mono text-body tabular-nums text-[var(--ds-fg)]">
                  <span>1,428.00</span>
                  <span>9,911.15</span>
                  <span>111.11</span>
                </div>
              </Cell>
              <Cell label="Proportional — prose only" tone="bad">
                <div className="flex flex-col gap-1 text-body text-[var(--ds-fg)]" style={{ fontVariantNumeric: 'proportional-nums' }}>
                  <span>1,428.00</span>
                  <span>9,911.15</span>
                  <span>111.11</span>
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Primary', note: '--ds-fg', render: <span className="text-body text-[var(--ds-fg)]">Heading text</span> },
      { label: 'Secondary', note: '--ds-fg-secondary', render: <span className="text-body text-[var(--ds-fg-secondary)]">Body copy</span> },
      { label: 'Muted', note: '--ds-fg-muted', render: <span className="text-body text-[var(--ds-fg-muted)]">Caption</span> },
      { label: 'Disabled', note: '--ds-fg-disabled', render: <span className="text-body text-[var(--ds-fg-disabled)]">Unavailable</span> },
      { label: 'Link', render: <a href="#/typography" className="text-body text-[var(--ds-accent-text)] underline underline-offset-2">Read more</a> },
      { label: 'Code', render: <code className="rounded-[5px] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-1.5 py-px font-mono text-code text-[var(--ds-accent-text)]">useId()</code> },
      { label: 'Truncated', note: 'One line, ellipsis', render: <span className="block w-24 truncate text-body text-[var(--ds-fg-secondary)]">A very long project name</span> },
      { label: 'Selection', render: <span className="text-body text-[var(--ds-fg)]"><mark className="bg-[rgb(124_108_255/0.32)] text-[var(--ds-fg)]">selected</mark> text</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="relative w-full max-w-md">
        <div className="relative rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-6">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-6 h-[46px] rounded-[3px] bg-[rgb(124_108_255/0.10)]"
          />
          <h3 className="relative text-h2 text-[var(--ds-fg)]">Deployment history</h3>
          <p className="relative mt-2 max-w-[62ch] text-body leading-relaxed text-[var(--ds-fg-secondary)]">
            Every build that reached a production region in the last thirty days, newest first.
          </p>
          <p className="relative mt-3 text-caption text-[var(--ds-fg-muted)]">Updated 4 minutes ago</p>
        </div>
      </div>
    ),
    caption:
      'A heading, its supporting paragraph, and its metadata. Three styles, three colours, three spacing values — none of them chosen by eye.',
    parts: [
      {
        n: 1,
        label: 'Heading size',
        value: '24px · text-h2',
        kind: 'type',
        note: 'Roughly 1.6× the body size. Steps smaller than 1.25× do not read as a different level; steps larger than 2× read as a different page.',
      },
      {
        n: 2,
        label: 'Heading tracking',
        value: '−0.017em',
        kind: 'type',
        note: 'Negative and proportional to size. Without it, a 24px heading in Inter looks loose next to 15px body text set at its natural spacing.',
      },
      {
        n: 3,
        label: 'Heading → body gap',
        value: '8px',
        kind: 'space',
        note: 'Smaller than the line height of either. Proximity binds them into one unit; a 24px gap would make the paragraph look unrelated.',
      },
      {
        n: 4,
        label: 'Measure',
        value: '62ch',
        kind: 'size',
        note: 'Set in ch so it tracks the font size. A pixel max-width silently becomes the wrong measure the moment the type scale changes.',
      },
      {
        n: 5,
        label: 'Metadata',
        value: '12px, --ds-fg-muted',
        kind: 'type',
        note: 'Two steps down and two colour steps back. Both together, because size alone in a dense UI is not enough separation.',
      },
    ],
  },

  tokens: [
    { category: 'typography', token: '--font-sans', value: 'Inter Variable', usedFor: 'All interface text' },
    { category: 'typography', token: '--font-mono', value: 'JetBrains Mono Variable', usedFor: 'Code, tokens, IDs, tabular data' },
    { category: 'typography', token: '--text-display', value: '44px / 1.08 / −0.028em', usedFor: 'Marketing hero' },
    { category: 'typography', token: '--text-h1', value: '32px / 1.16 / −0.022em', usedFor: 'Page title' },
    { category: 'typography', token: '--text-h2', value: '24px / 1.25 / −0.017em', usedFor: 'Section heading' },
    { category: 'typography', token: '--text-h3', value: '19px / 1.35 / −0.012em', usedFor: 'Subsection, dialog title' },
    { category: 'typography', token: '--text-h4', value: '16px / 1.45 / −0.006em', usedFor: 'Card title' },
    { category: 'typography', token: '--text-body-lg', value: '17px / 1.62', usedFor: 'Lead paragraph' },
    { category: 'typography', token: '--text-body', value: '15px / 1.66', usedFor: 'Default body' },
    { category: 'typography', token: '--text-body-sm', value: '13px / 1.6', usedFor: 'Dense copy, table cells' },
    { category: 'typography', token: '--text-label', value: '13px / 1.2 / 540', usedFor: 'Buttons, labels, tabs' },
    { category: 'typography', token: '--text-caption', value: '12px / 1.45', usedFor: 'Metadata' },
    { category: 'typography', token: '--text-overline', value: '11px / 0.09em / 600', usedFor: 'Eyebrows, uppercase only' },
    { category: 'color', token: '--ds-fg', usedFor: 'Headings' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Body' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Captions and metadata' },
    { category: 'spacing', token: 'heading → body', value: '8px', usedFor: 'Binding a heading to its paragraph' },
    { category: 'spacing', token: 'section gap', value: '56px', usedFor: 'Separating major sections' },
  ],

  sizes: [
    { name: 'Display', height: '44px', type: '620 weight', maxWidth: '18ch', use: 'Marketing hero only. Never inside the product UI.' },
    { name: 'H1', height: '32px', type: '620 weight', maxWidth: '28ch', use: 'One per screen, in the page header.' },
    { name: 'H2', height: '24px', type: '600 weight', maxWidth: '40ch', use: 'Major sections within a page.' },
    { name: 'H3', height: '19px', type: '600 weight', maxWidth: '48ch', use: 'Subsections and dialog titles.' },
    { name: 'H4', height: '16px', type: '600 weight', maxWidth: '56ch', use: 'Card titles and group headings.' },
    { name: 'Body large', height: '17px', type: '400 weight', maxWidth: '68ch', use: 'Documentation and long-form reading.' },
    { name: 'Body', height: '15px', type: '400 weight', maxWidth: '68ch', use: 'The default for everything else.' },
    { name: 'Body small', height: '13px', type: '400 weight', maxWidth: '72ch', use: 'Tables, help text, dense panels.' },
    { name: 'Caption', height: '12px', type: '400 weight', maxWidth: '60ch', use: 'Timestamps, counts, hints.' },
  ],

  do: [
    {
      title: 'Cap the measure in ch, not px',
      why: 'A max-width of 68ch stays correct if the font size changes, if the user zooms, or if a locale swaps to a wider script. A pixel width silently becomes the wrong measure.',
      render: (
        <p className="max-w-[68ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
          Sixty-eight characters is roughly eleven words per line, which is close to the span the eye
          can track without a conscious return sweep.
        </p>
      ),
    },
    {
      title: 'Bind headings to their content with proximity',
      why: 'Gestalt proximity: the gap above a heading must be visibly larger than the gap below it. Equal gaps make the heading float between two blocks and belong to neither.',
      render: (
        <Stack gap="xs" className="w-full">
          <div className="h-6 rounded-[3px] bg-[var(--ds-layer-active)]" />
          <div className="pt-5">
            <p className="text-label text-[var(--ds-fg)]">Section heading</p>
            <p className="mt-1.5 text-caption text-[var(--ds-fg-muted)]">Its paragraph, close beneath.</p>
          </div>
        </Stack>
      ),
    },
    {
      title: 'Use tabular figures for anything comparable',
      why: 'Proportional digits have different widths, so a column of numbers will not align on the decimal and the digits jitter as values update. font-variant-numeric: tabular-nums fixes both.',
      render: (
        <div className="flex flex-col gap-0.5 text-right font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">
          <span>$ 1,428.00</span>
          <span>$ 9,911.15</span>
          <span>$ 111.11</span>
        </div>
      ),
    },
    {
      title: 'Set an explicit weight on every heading style',
      why: 'Variable fonts interpolate. Relying on a browser default gives you 700 in some contexts and 400 in others, and the difference is visible when two headings sit side by side.',
      render: (
        <Row gap="lg" align="baseline">
          <span className="text-h3" style={{ fontWeight: 600 }}>600</span>
          <span className="text-h3" style={{ fontWeight: 620 }}>620</span>
          <span className="text-h3" style={{ fontWeight: 700 }}>700</span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not set long text in uppercase',
      why: 'Uppercase removes ascenders and descenders, which is what the eye uses to recognise word shapes. Reading speed drops measurably past about three words.',
      render: (
        <p className="text-body-sm uppercase tracking-wide text-[var(--ds-fg-secondary)]">
          Your subscription will renew automatically on the 26th unless cancelled beforehand
        </p>
      ),
    },
    {
      title: 'Do not use more than two weights in one block',
      why: 'Weight is a hierarchy signal. Three weights in a paragraph means three levels of importance in a place where there should be one, and the eye stops trusting the signal.',
      render: (
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          Your <span className="font-medium">plan</span> renews on the{' '}
          <span className="font-semibold">26th</span> and will be{' '}
          <span className="font-bold">charged</span> to your <span className="font-black">card</span>.
        </p>
      ),
    },
    {
      title: 'Do not centre body copy',
      why: 'Centred text gives every line a different starting x-position, so the return sweep has to search for the start of each line. Acceptable for one or two lines; punishing for four.',
      render: (
        <p className="max-w-[38ch] text-center text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
          Every line begins somewhere new, so the eye has to hunt for the start of each one, which is
          why this feels slower to read than it should.
        </p>
      ),
    },
    {
      title: 'Do not invent a size between steps',
      why: 'A 17.5px heading is not meaningfully different from 17px, but it is one more value in the codebase, one more thing to be inconsistent about, and it will be copied.',
      render: (
        <Row gap="sm" align="baseline">
          <span style={{ fontSize: 17 }}>17</span>
          <span style={{ fontSize: 17.5 }}>17.5</span>
          <span style={{ fontSize: 18 }}>18</span>
          <span style={{ fontSize: 19 }}>19</span>
          <Badge tone="danger" size="sm">pick one</Badge>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.4', name: 'Resize Text', level: 'AA' },
      { id: '1.4.8', name: 'Visual Presentation', level: 'AAA' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
    ],
    contrast: [
      'Body text must reach 4.5:1. Text at 18.66px regular or 14px bold counts as "large" and needs only 3:1 — but do not design to the exception.',
      '--ds-fg-muted at 12px is the tightest pair in the system. It is verified at 4.6:1 on --ds-surface in both themes; do not use it on --ds-surface-inset without rechecking.',
      'Never rely on font weight alone to create contrast. A 400-weight and a 600-weight of the same colour measure identically.',
    ],
    keyboard: [
      { keys: '⌘ / Ctrl +', does: 'Browser zoom. The layout must survive 200% without horizontal scrolling.' },
      { keys: 'Tab', does: 'Headings are not focusable, but heading order determines screen-reader navigation order.' },
    ],
    aria: [
      { attr: '<h1> … <h6>', on: 'Headings', note: 'Use real heading elements. Screen-reader users navigate by heading more than by any other method.' },
      { attr: 'aria-level', on: 'role="heading"', note: 'Only when a real heading element is impossible. It almost always is possible.' },
      { attr: 'lang', on: '<html> and inline spans', note: 'Drives hyphenation, quotation marks and pronunciation. A French phrase inside English copy needs its own lang.' },
    ],
    focus:
      'Text itself is not focusable, but links inside prose are. Keep the underline: colour alone fails WCAG 1.4.1 for inline links inside body text.',
    screenReader: [
      'Do not skip heading levels. An h2 followed by an h4 tells a screen-reader user that they missed a section.',
      'Visual size is not semantic level. Styling a <p> to look like a heading gives sighted users a heading and everyone else nothing.',
      'Avoid text in images. If you must, the alt text carries the full string verbatim.',
    ],
    touch:
      'Text must reflow at 320px CSS width and at 200% zoom without horizontal scrolling. Setting a min-width in px on a text container is the usual cause of failure.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Every string uses a named style. No arbitrary sizes.
<article className="flex flex-col gap-2">
  <span className="text-overline uppercase text-accent-text">Billing</span>
  <h2 className="text-h2 text-fg">Invoice 2026-0431</h2>
  <p className="max-w-[68ch] text-body text-fg-secondary">
    Issued 12 July, due 26 July. Payment is collected automatically.
  </p>
  <p className="text-caption text-fg-muted">Updated 4 minutes ago</p>
</article>

// Numbers that change or stack must be tabular
<span className="tabular-nums">{formatCurrency(total)}</span>

// Truncation: one line
<span className="block truncate">{project.name}</span>

// Truncation: multiple lines
<p className="line-clamp-3">{description}</p>

// Balance short headings so the last line is not an orphan
<h1 className="text-balance-ds">{title}</h1>`,
    },
    css: {
      lang: 'css',
      caption: 'The base layer. Feature settings matter more than most teams realise.',
      code: `body {
  font-family: var(--font-sans);
  font-size: 0.9375rem;      /* 15px */
  line-height: 1.66;

  /* Inter stylistic sets: disambiguated l/1/I, single-storey a in caps,
     and a rounder zero. Materially improves scanning in dense UI. */
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'ss03';
  font-variant-ligatures: contextual;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Numbers in any comparable context */
table, code, kbd, pre, [data-tabular] {
  font-variant-numeric: tabular-nums;
}

/* Never set a px line-height on body text — it breaks at user zoom */
.prose p { line-height: 1.66; max-inline-size: 68ch; }

/* Headings tighten as they grow */
.h1 { font-size: 2rem;    line-height: 1.16; letter-spacing: -0.022em; font-weight: 620; }
.h2 { font-size: 1.5rem;  line-height: 1.25; letter-spacing: -0.017em; font-weight: 600; }
.h3 { font-size: 1.1875rem; line-height: 1.35; letter-spacing: -0.012em; font-weight: 600; }`,
    },
  },

  notes: {
    tips: [
      'Inter’s cv02/cv03/cv04/cv11 stylistic sets disambiguate l, 1, I and the single-storey a. In a product full of IDs and tokens this is a real usability gain, not a flourish.',
      'text-wrap: balance on headings prevents a single-word last line. Use it on headings only — it is O(n²) on long paragraphs and browsers cap it around six lines anyway.',
      'When a label and its value sit on one row, align them on the baseline rather than the box. Different font sizes have different box heights but share a baseline.',
      'If a heading needs to be smaller to fit, the container is too narrow or the heading is too long. Shrinking the type is the last resort, not the first.',
    ],
    performance: [
      'Ship one variable font per family. Four static weights of Inter is roughly 340 kB; the variable file is 48 kB for the Latin subset and covers every weight.',
      'Self-host with font-display: swap. A blocking webfont request from a third-party CDN is a guaranteed layout shift and a privacy liability.',
      'Subset aggressively. Latin plus Latin-Extended covers the overwhelming majority of Western products; Cyrillic and Greek subsets load only when the browser needs them.',
      'Preload only the one font file used above the fold. Preloading all of them competes with your JavaScript for bandwidth.',
    ],
    mistakes: [
      'Setting line-height in px. It stops scaling with the font at user zoom, which is a direct WCAG 1.4.4 failure.',
      'Using a <p> styled to look like a heading. Sighted users get a heading; screen-reader users get a paragraph and lose the document outline.',
      'Letting a table cell wrap onto three lines because no max-width was set. A table is scanned in columns, and ragged row heights destroy that.',
      'Applying letter-spacing to small text to "make it airier". Below 13px, added tracking reduces legibility — the letters stop forming words.',
    ],
    realWorld: [
      'Ask a colleague to read a screen from two metres away. Whatever they read first is your actual hierarchy, regardless of what you intended.',
      'Set the measure before you set the type size. Once the column width is right, the size that fits comfortably inside it is usually obvious.',
      'For dense enterprise tables, 13px body with 1.6 line height is the practical floor. Below that, error rates in data entry rise noticeably.',
      'Localisation adds roughly 30% length going from English to German. Design headings and buttons to survive that without re-wrapping the layout.',
    ],
  },
})
