import { Badge } from '@/ui/Display'
import { Callout } from '@/ui/Surface'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SCALE = [
  { token: 'text-display', px: 44, lh: 1.08, ls: '-0.028em', w: 620, use: 'Marketing hero. One per page, at most.' },
  { token: 'text-h1', px: 32, lh: 1.16, ls: '-0.022em', w: 620, use: 'Page title. Exactly one per screen.' },
  { token: 'text-h2', px: 24, lh: 1.25, ls: '-0.017em', w: 600, use: 'Major section.' },
  { token: 'text-h3', px: 19, lh: 1.35, ls: '-0.012em', w: 600, use: 'Subsection, dialog title.' },
  { token: 'text-h4', px: 16, lh: 1.45, ls: '-0.006em', w: 600, use: 'Card title, group heading.' },
  { token: 'text-body-lg', px: 17, lh: 1.62, ls: '-0.004em', w: 400, use: 'Lead paragraph, long-form reading.' },
  { token: 'text-body', px: 16, lh: 1.6, ls: '-0.002em', w: 400, use: 'Body copy and every input. The workhorse.' },
  { token: 'text-ui', px: 15, lh: 1.4, ls: '-0.001em', w: 470, use: 'Navigation, menus, list rows — text you click.' },
  { token: 'text-body-sm', px: 13, lh: 1.6, ls: '0', w: 400, use: 'Supporting copy: help text, table cells.' },
  { token: 'text-label', px: 13, lh: 1.2, ls: '0.001em', w: 540, use: 'Buttons, form labels, tabs.' },
  { token: 'text-label-sm', px: 12, lh: 1.2, ls: '0.004em', w: 540, use: 'Compact controls, table headers.' },
  { token: 'text-caption', px: 12, lh: 1.45, ls: '0.002em', w: 400, use: 'Metadata, timestamps, hints.' },
  { token: 'text-overline', px: 12, lh: 1.2, ls: '0.09em', w: 600, use: 'Section eyebrows. Always uppercase.' },
  { token: 'text-code', px: 13, lh: 1.65, ls: '-0.005em', w: 400, use: 'Inline and block code.' },
]

/* The four units, and the one question that picks between them. Kept as data
   because it is a lookup table in practice — nobody reads this prose twice,
   they come back to check one row. */
const UNITS = [
  {
    unit: 'rem',
    forWhat: 'Every font size, without exception.',
    why: 'Relative to the root, so a reader who sets their browser text to "large" gets a larger app. A px font size ignores that setting outright — it is the single most common accessibility defect in shipped design systems.',
    example: 'font-size: 1rem;',
  },
  {
    unit: 'unitless',
    forWhat: 'Every line height.',
    why: 'A ratio multiplies against whatever size the element ends up at, so one value stays correct through inheritance and through zoom. `line-height: 24px` freezes the leading and clips descenders the moment the text grows.',
    example: 'line-height: 1.6;',
  },
  {
    unit: 'em',
    forWhat: 'Measurements that are genuinely relative to the current font: letter-spacing, and optical nudges of an inline icon.',
    why: 'Tracking is a proportion of the letterform, not a fixed distance. −0.02em stays right at 15px and at 44px; −0.7px is wrong at both ends of that range.',
    example: 'letter-spacing: -0.017em;',
  },
  {
    unit: 'ch',
    forWhat: 'The width of anything containing readable text.',
    why: 'A measure is counted in characters, so state it in characters. 68ch stays 68 characters through a size change, a zoom, or a locale with wider glyphs; a 640px column silently becomes 90 characters the moment the type grows.',
    example: 'max-inline-size: 68ch;',
  },
]

function UnitTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)]">
            <th scope="col" className="w-24 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Unit
            </th>
            <th scope="col" className="py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Use it for
            </th>
            <th scope="col" className="w-40 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Example
            </th>
          </tr>
        </thead>
        <tbody>
          {UNITS.map((u) => (
            <tr key={u.unit} className="border-b border-[var(--ds-border-subtle)] last:border-0 align-top">
              <td className="py-3 pr-4">
                <code className="font-mono text-code text-[var(--ds-accent-text)]">{u.unit}</code>
              </td>
              <td className="py-3 pr-4">
                <p className="text-body-sm text-[var(--ds-fg)]">{u.forWhat}</p>
                <p className="mt-1 max-w-[62ch] text-caption leading-relaxed text-[var(--ds-fg-muted)]">{u.why}</p>
              </td>
              <td className="py-3">
                <code className="font-mono text-code text-[var(--ds-fg-secondary)]">{u.example}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* Desktop / tablet / phone at the same size, side by side. The point is the
   absence of a difference, which is hard to state and trivial to show. */
function ResponsiveDemo() {
  const viewports = [
    { name: 'Desktop', w: 1440 },
    { name: 'Tablet', w: 834 },
    { name: 'Phone', w: 390 },
  ]
  return (
    <Stack gap="md" className="w-full">
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {viewports.map((v) => (
          <Cell key={v.name} label={v.name} sub={`${v.w}px wide`} tone="good">
            <div className="flex flex-col gap-1.5">
              <span className="text-ui text-[var(--ds-fg)]">Deployments</span>
              <span className="text-body text-[var(--ds-fg-secondary)]">Body copy stays 16px.</span>
              <span className="text-caption text-[var(--ds-fg-muted)]">Updated 4 minutes ago</span>
            </div>
          </Cell>
        ))}
      </div>
      <Cell
        label="What does change"
        sub="Layout, measure and the display sizes — never the reading sizes."
        tone="good"
      >
        <div className="flex flex-col gap-2">
          <span
            className="text-[var(--ds-fg)]"
            style={{ fontSize: 'clamp(1.75rem, 1.25rem + 2.2vw, 2.75rem)', lineHeight: 1.12, letterSpacing: '-0.025em', fontWeight: 620 }}
          >
            A display heading scales
          </span>
          <p className="max-w-[68ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
            One column becomes two. The measure narrows from 68ch to whatever fits. The hero drops
            from 44px to 28px because at 390px it would otherwise be four words per line. The
            paragraph you are reading does not move.
          </p>
        </div>
      </Cell>
    </Stack>
  )
}

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
                <code className="font-mono text-caption text-[var(--ds-accent-text)]">{s.token}</code>
              </td>
              <td className="py-3 align-middle font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
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

/* The normative summary. Everything else on the page argues for these rows;
   this is the version a reviewer quotes back at a pull request. */
const ROLES = [
  {
    size: '16px',
    rem: '1rem',
    token: 'text-body',
    role: 'Body copy, and every input',
    detail: 'Prose, descriptions, and any field the user types into or reads a value back from.',
  },
  {
    size: '15px',
    rem: '0.9375rem',
    token: 'text-ui',
    role: 'Navigation and UI text',
    detail: 'Sidebar rows, menu items, list rows, tabs — text that is clicked rather than read.',
  },
  {
    size: '13px',
    rem: '0.8125rem',
    token: 'text-body-sm',
    role: 'Supporting text',
    detail: 'Help text, table cells, and anything explaining something already on the screen.',
  },
  {
    size: '12px',
    rem: '0.75rem',
    token: 'text-caption',
    role: 'Captions and metadata only',
    detail: 'Timestamps, counts, hints. The floor of the scale — nothing readable is set smaller.',
  },
]

function SizeStandard() {
  return (
    <Stack gap="lg" className="w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--ds-border-subtle)]">
              <th scope="col" className="w-28 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Size
              </th>
              <th scope="col" className="w-32 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                Token
              </th>
              <th scope="col" className="py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
                What it is for
              </th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r.token} className="border-b border-[var(--ds-border-subtle)] align-top last:border-0">
                <td className="py-3 pr-4">
                  <span className="block text-body font-medium text-[var(--ds-fg)]">{r.size}</span>
                  <code className="font-mono text-caption text-[var(--ds-fg-muted)]">{r.rem}</code>
                </td>
                <td className="py-3 pr-4">
                  <code className="font-mono text-code text-[var(--ds-accent-text)]">{r.token}</code>
                </td>
                <td className="py-3">
                  <p className="text-body-sm font-medium text-[var(--ds-fg)]">{r.role}</p>
                  <p className="mt-1 max-w-[68ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
                    {r.detail}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout tone="warning" title="Twelve is the floor, on every screen">
        <p className="mt-1 max-w-[72ch] leading-relaxed">
          No readable text is set below 12px — not a badge, not a legend, not a table header, and
          not "just on desktop, where the screen is bigger". Below that size the letterforms stop
          resolving for a large share of adult readers, and the text is decoration that happens to
          contain information.
        </p>
      </Callout>

      <Callout tone="accent" title="Units, in one line each">
        <ul className="mt-1 flex list-disc flex-col gap-1.5 pl-4">
          <li>
            <code className="font-mono text-code">rem</code> — every font size, so the browser's
            own text-size setting still works.
          </li>
          <li>
            <code className="font-mono text-code">unitless</code> — every line height, so it
            survives inheritance and zoom.
          </li>
          <li>
            <code className="font-mono text-code">em</code> — only what is genuinely relative to
            the current font, which in practice means letter-spacing.
          </li>
          <li>
            <code className="font-mono text-code">ch</code> — the width of anything containing
            readable text, because a measure is counted in characters.
          </li>
        </ul>
      </Callout>

      <Callout tone="neutral" title="What responds, and what does not">
        <p className="mt-1 max-w-[72ch] leading-relaxed">
          Body, UI, supporting and caption text hold their size from 1440px down to 320px.{' '}
          <code className="font-mono text-code">clamp()</code> is reserved for display and large
          headings — h3 and above — where a size chosen for a hero genuinely cannot survive a
          390px screen. What responds instead is the layout: the measure narrows, columns
          collapse, and less fits on the screen.
        </p>
      </Callout>
    </Stack>
  )
}

export default defineDoc({
  meta: {
    id: 'typography',
    title: 'Typography',
    tagline:
      'Fourteen named styles, one variable family, four units, and a floor nothing readable goes under. Typography is ninety-five percent of an interface — everything else is arrangement.',
    keywords: [
      'font', 'type scale', 'line height', 'measure', 'leading', 'tracking', 'inter',
      'rem', 'em', 'ch', 'units', 'font size', 'readable', 'minimum size', 'responsive type', 'clamp',
    ],
  },

  overview: {
    purpose:
      'The type scale is the primary tool for hierarchy. Before colour, before borders, before elevation — size, weight and spacing tell the user what matters, in what order, and where one idea ends and the next begins. A screen with correct typography and no colour is still usable; the reverse is not true.',
    whenToUse: [
      'Always. Every string in the product should be one of the fourteen named styles.',
      'To establish hierarchy: exactly one h1 per screen, then h2 for sections, h3 for subsections.',
      'To signal function: ui for text you click, body for prose and inputs, caption for metadata.',
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
      {
        text: 'A px font size, or a px line height, anywhere.',
        instead: 'rem for the size and a unitless ratio for the leading',
      },
      {
        text: 'clamp() on body, labels or navigation, to "save space" on a phone.',
        instead: 'the same size at every width, and less on the screen',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Four sizes carry a product, and none of them is small.</strong> Body copy and
          every input are 16px. Navigation, menus and list rows — the text you click rather than
          read — are 15px. Supporting copy that explains something already on screen is 13px.
          Metadata is 12px, and 12px is the floor: nothing readable is set smaller, anywhere, on
          any screen. A size chosen below that line is a decision to make part of the product
          unusable for the people who need it most.
        </p>
        <p>
          Body was 15px here for years, on the argument that a dense product interface is not an
          article. The argument was wrong in one specific way: density is bought with{' '}
          <em>layout</em> — fewer columns, tighter rows, less on screen — and paying for it out of
          the type size charges the cost to whoever has the weakest eyes. 16px is also the size
          below which iOS Safari zooms the page when a field takes focus, so a 15px input is not a
          slightly smaller input; it is a screen that jumps sideways when you tap it.
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
        <p>
          <strong>Units are not a style preference.</strong> Sizes are in{' '}
          <code className="font-mono text-code text-[var(--ds-accent-text)]">rem</code> so the
          browser's own text-size setting still works; line heights are unitless so they survive
          inheritance and zoom; <code className="font-mono text-code text-[var(--ds-accent-text)]">em</code>{' '}
          is reserved for the things that really are proportional to the current font, which in
          practice means tracking; and reading widths are in{' '}
          <code className="font-mono text-code text-[var(--ds-accent-text)]">ch</code>, because a
          measure is counted in characters and every other unit is an approximation of that count.
        </p>
        <p>
          And type does not shrink on a phone. Responsive typography is for{' '}
          <strong>display sizes only</strong> — a 44px hero has to come down at 390px or it is four
          words per line. Everything at or below h4 holds its size at every width, because a phone
          is held further from the eye than a laptop, not nearer, and it is the surface most likely
          to be read one-handed on a train. What responds is the layout: the measure narrows,
          columns collapse, and less fits on the screen. That last part is the honest cost, and it
          is the right one to pay.
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
    // The rules are the reason to open this page, so they are listed by name
    // rather than left to be found by scrolling through "Live preview".
    contents: [
      { id: 'measure', title: 'Measure' },
      { id: 'units', title: 'Units' },
      { id: 'responsive', title: 'Across screens' },
      { id: 'hierarchy', title: 'Hierarchy' },
      { id: 'numerals', title: 'Numerals' },
    ],
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
        id: 'units',
        title: 'Units',
        description:
          'rem for size, unitless for leading, em only for what is genuinely font-relative, ch for reading width. Four rules, and every one of them is about surviving a change nobody told you about.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <UnitTable />
          </PreviewStage>
        ),
      },
      {
        id: 'responsive',
        title: 'Across screens',
        description:
          'Navigation stays 15px, body stays 16px, metadata stays 12px — at 1440px, at 834px and at 390px. Only display sizes scale, and only with clamp().',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ResponsiveDemo />
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
        note: 'Negative and proportional to size, which is why it is in em rather than px. Without it, a 24px heading in Inter looks loose next to 16px body text set at its natural spacing.',
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
    { category: 'typography', token: '--text-body-lg', value: '1.0625rem / 1.62', usedFor: 'Lead paragraph, long-form' },
    { category: 'typography', token: '--text-body', value: '1rem / 1.6', usedFor: 'Body copy and every input' },
    { category: 'typography', token: '--text-ui', value: '0.9375rem / 1.4 / 470', usedFor: 'Navigation, menus, list rows' },
    { category: 'typography', token: '--text-body-sm', value: '0.8125rem / 1.6', usedFor: 'Supporting copy, table cells' },
    { category: 'typography', token: '--text-label', value: '0.8125rem / 1.2 / 540', usedFor: 'Buttons, form labels, tabs' },
    { category: 'typography', token: '--text-caption', value: '0.75rem / 1.45', usedFor: 'Metadata — the floor' },
    { category: 'typography', token: '--text-overline', value: '0.75rem / 0.09em / 600', usedFor: 'Eyebrows, uppercase only' },
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
    { name: 'Body', height: '16px', type: '400 weight', maxWidth: '68ch', use: 'Prose, and every field the user types into.' },
    { name: 'UI', height: '15px', type: '470 weight', maxWidth: '40ch', use: 'Navigation, menus, list rows. Never shrinks on a phone.' },
    { name: 'Body small', height: '13px', type: '400 weight', maxWidth: '72ch', use: 'Supporting copy: help text, table cells, dense panels.' },
    { name: 'Caption', height: '12px', type: '400 weight', maxWidth: '60ch', use: 'Timestamps, counts, hints. The floor — nothing readable goes under it.' },
  ],

  do: [
    {
      title: 'Set sizes in rem and leading unitless',
      why: 'rem answers the browser’s own text-size setting, which a px value silently ignores — a WCAG 1.4.4 failure that no amount of testing at 100% zoom will ever surface. A unitless line height multiplies against whatever size the element inherits, so one value stays correct everywhere.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-success)]">font-size: 1rem; line-height: 1.6;</span>
          <span className="text-[var(--ds-fg-muted)] line-through">font-size: 16px; line-height: 26px;</span>
        </div>
      ),
    },
    {
      title: 'Hold the size on small screens',
      why: 'A phone is held further from the eye than a laptop, in worse light, more often one-handed. Shrinking the type there inverts the need. Responsive layout is the lever: narrow the measure, drop a column, show less — the sizes stay put.',
      render: (
        <Row gap="lg" align="baseline">
          <span className="text-ui text-[var(--ds-fg)]">Desktop 15px</span>
          <span className="text-ui text-[var(--ds-fg)]">Phone 15px</span>
          <Badge tone="success" size="sm">same</Badge>
        </Row>
      ),
    },
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
      title: 'Do not clamp() ordinary UI text',
      why: 'clamp() is for display sizes, where a 44px hero genuinely cannot stay 44px at 390px. Applied to body or navigation it produces text that is 15px on the machine you designed on and 13px on the device most people read it on — a shrink nobody asked for, in the one place it hurts.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-fg-muted)] line-through">font-size: clamp(0.8125rem, 2vw, 0.9375rem);</span>
          <span className="text-[var(--ds-success)]">font-size: clamp(1.75rem, 1.25rem + 2.2vw, 2.75rem); /* display only */</span>
        </div>
      ),
    },
    {
      title: 'Do not set anything readable below 12px',
      why: 'Twelve is the floor, and it is reserved for metadata — timestamps, counts, hints. An 11px legend or a 10px badge is text the product needs the reader to have, set at a size a great many adults cannot resolve at arm’s length — near focus starts changing in the mid-forties, and it does not change back.',
      render: (
        <Row gap="lg" align="baseline">
          <span style={{ fontSize: 10 }} className="text-[var(--ds-fg-secondary)]">10px badge</span>
          <span style={{ fontSize: 11 }} className="text-[var(--ds-fg-secondary)]">11px legend</span>
          <span className="text-caption text-[var(--ds-fg)]">12px floor</span>
          <Badge tone="danger" size="sm">first two: no</Badge>
        </Row>
      ),
    },
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

// Text you click is text-ui (15px), not text-caption. Same at every width.
<nav className="flex flex-col gap-px">
  <a className="flex h-8 items-center rounded-md px-2.5 text-ui">Deployments</a>
  <a className="flex h-8 items-center rounded-md px-2.5 text-ui">Monitoring</a>
</nav>

// Fields are text-body (16px) — read back, checked, and below 16px iOS
// zooms the page the moment one takes focus.
<input className="h-9 w-full rounded-md px-3 text-body" />

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

  /* rem, so the browser's own text-size setting still means something.
     A px value here overrides the reader and fails WCAG 1.4.4. */
  font-size: 1rem;           /* 16px at the default root */
  line-height: 1.6;          /* unitless: survives inheritance and zoom */

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

/* Never set a px line-height on body text — it breaks at user zoom.
   ch for the measure, because a measure is counted in characters. */
.prose p { line-height: 1.6; max-inline-size: 68ch; }

/* Headings tighten as they grow. Tracking in em: a proportion of the
   letterform, so one value is right at 19px and at 44px. */
.h1 { font-size: 2rem;      line-height: 1.16; letter-spacing: -0.022em; font-weight: 620; }
.h2 { font-size: 1.5rem;    line-height: 1.25; letter-spacing: -0.017em; font-weight: 600; }
.h3 { font-size: 1.1875rem; line-height: 1.35; letter-spacing: -0.012em; font-weight: 600; }

/* Text you click. 15px at every width — a phone gets the same size a
   desktop does, because it is held further away, not nearer. */
.ui { font-size: 0.9375rem; line-height: 1.4; font-weight: 470; }

/* clamp() is for display type ONLY. The floor is the size the heading is
   allowed to reach on a phone, and it is still bigger than body. */
.display {
  font-size: clamp(1.75rem, 1.25rem + 2.2vw, 2.75rem);
  line-height: 1.1;
  letter-spacing: -0.026em;
}

/* Nothing readable below 12px, and 12px is metadata only. */
.caption { font-size: 0.75rem; line-height: 1.45; }`,
    },
  },

  appendix: [
    {
      id: 'size-standard',
      title: 'The size standard',
      description:
        'Four sizes, a floor, four units, and one rule about screens. Everything above is the argument; this is the part to copy into a review.',
      render: <SizeStandard />,
    },
  ],

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
      'Setting font-size in px. It ignores the reader’s browser text-size setting entirely — the setting they changed precisely because the default was too small for them.',
      'Shrinking body or navigation text at a mobile breakpoint. The layout is what should respond; the type is what should not.',
      'Using em for font sizes. It compounds through nesting, so a list inside a list inside an aside arrives at a size nobody chose.',
      'Using a <p> styled to look like a heading. Sighted users get a heading; screen-reader users get a paragraph and lose the document outline.',
      'Letting a table cell wrap onto three lines because no max-width was set. A table is scanned in columns, and ragged row heights destroy that.',
      'Applying letter-spacing to small text to "make it airier". Below 13px, added tracking reduces legibility — the letters stop forming words.',
    ],
    realWorld: [
      'Ask a colleague to read a screen from two metres away. Whatever they read first is your actual hierarchy, regardless of what you intended.',
      'Set your browser’s default text size to 20px and reload the product. Everything sized in rem grows with it; everything in px stays exactly where it was, and that difference is the audit.',
      'Take the phone outside. Sizes that were fine on a calibrated monitor at arm’s length in a dim room are the first thing to fail in daylight on a moving train.',
      'Set the measure before you set the type size. Once the column width is right, the size that fits comfortably inside it is usually obvious.',
      'For dense enterprise tables, 13px with 1.6 line height is the practical floor for the cell text. Below that, error rates in data entry rise noticeably — and the header row is a label, not a licence to go to 10px.',
      'Localisation adds roughly 30% length going from English to German. Design headings and buttons to survive that without re-wrapping the layout.',
    ],
  },
})
