import * as React from 'react'
import { Badge } from '@/ui/Display'
import { Callout } from '@/ui/Surface'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   READABLE TYPE

   Typography owns the scale. This page owns the floor underneath it: which
   sizes are allowed to carry meaning, and what is allowed to change when the
   screen does.

   It exists as its own page because the two questions have different answers
   and get confused constantly. "What size is a caption" is a scale question.
   "May a caption be 10px on a phone to save a line" is this one, and the
   answer is no for a reason that has nothing to do with the scale.
   ======================================================================== */

/** The ladder, with the line drawn on it. */
const LADDER = [
  { px: 16, ok: true, role: 'Body copy and every input', note: 'Prose, and any field typed into or read back. Below 16px, iOS zooms the page on focus.' },
  { px: 15, ok: true, role: 'Navigation and UI text', note: 'Sidebar rows, menus, list rows, tabs. Scanned from the corner of the eye, so it cannot be small.' },
  { px: 13, ok: true, role: 'Supporting text', note: 'Help text and table cells — text explaining something already on the screen.' },
  { px: 12, ok: true, role: 'Captions and metadata', note: 'Timestamps, counts, hints. The floor: correct here, and never used for anything a user must read to proceed.' },
  { px: 11, ok: false, role: 'Nothing', note: 'The size a legend, an axis label or a "beta" pill gets talked into. It is information, set below the size it can be read at.' },
  { px: 10, ok: false, role: 'Nothing', note: 'Illegible to a large share of adult readers at arm’s length. If it fits only at 10px, the layout is the problem.' },
]

function Ladder() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)]">
            <th scope="col" className="w-52 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Specimen
            </th>
            <th scope="col" className="w-16 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Size
            </th>
            <th scope="col" className="py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              What it may carry
            </th>
          </tr>
        </thead>
        <tbody>
          {LADDER.map((r) => (
            <tr
              key={r.px}
              className="border-b border-[var(--ds-border-subtle)] align-top last:border-0"
            >
              <td className="py-3 pr-4">
                <span
                  style={{ fontSize: r.px, lineHeight: 1.5 }}
                  className={`block whitespace-nowrap ${r.ok ? 'text-[var(--ds-fg)]' : 'text-[var(--ds-fg-muted)]'}`}
                >
                  Renews on the 26th
                </span>
              </td>
              <td className="py-3 pr-4">
                <code className="font-mono text-code text-[var(--ds-fg-secondary)]">{r.px}px</code>
              </td>
              <td className="py-3">
                <Row gap="sm" align="center" className="mb-1">
                  <span className={`text-body-sm font-medium ${r.ok ? 'text-[var(--ds-fg)]' : 'text-[var(--ds-fg-muted)]'}`}>
                    {r.role}
                  </span>
                  <Badge tone={r.ok ? 'success' : 'danger'} size="sm">
                    {r.ok ? 'allowed' : 'never'}
                  </Badge>
                </Row>
                <p className="max-w-[64ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
                  {r.note}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * The same panel at the standard sizes and at the sizes it acquires when
 * someone decides a phone needs "a tighter version". Side by side, because
 * the shrunk one looks defensible until it has the correct one beside it.
 */
function ShrinkComparison() {
  const Panel = ({ scale }: { scale: 'standard' | 'shrunk' }) => {
    const s = scale === 'standard'
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-px">
          {['Overview', 'Deployments', 'Monitoring'].map((label, i) => (
            <span
              key={label}
              style={{ fontSize: s ? 15 : 12, lineHeight: s ? '21px' : '16px', fontWeight: i === 1 ? 500 : 470 }}
              className={`flex items-center rounded-[var(--radius-sm)] px-2 ${s ? 'h-8' : 'h-6'} ${
                i === 1
                  ? 'bg-[var(--ds-layer-selected)] text-[var(--ds-fg)]'
                  : 'text-[var(--ds-fg-secondary)]'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 border-t border-[var(--ds-border-subtle)] pt-3">
          <p style={{ fontSize: s ? 16 : 13, lineHeight: 1.6 }} className="max-w-[46ch] text-[var(--ds-fg-secondary)]">
            The last build reached every production region. Nothing is waiting on approval.
          </p>
          <p style={{ fontSize: s ? 12 : 10 }} className="text-[var(--ds-fg-muted)]">
            Updated 4 minutes ago · 3 regions
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      <Cell label="The standard sizes" sub="15 / 16 / 12. The same on a phone." tone="good">
        <Panel scale="standard" />
      </Cell>
      <Cell label="Shrunk “for mobile”" sub="12 / 13 / 10. Two lines saved, one reader lost." tone="bad">
        <Panel scale="shrunk" />
      </Cell>
    </div>
  )
}

/**
 * What a reader's own text-size setting does to px and to rem.
 *
 * The container plays the part of the root element — the real thing is
 * `font-size` on <html>, which is what the browser's setting moves — so the
 * `em` column stands in for `rem` and the `px` column behaves exactly as it
 * does in production: not at all.
 */
function ZoomDemo() {
  const [pct, setPct] = React.useState(100)
  return (
    <Stack gap="md" className="w-full">
      <Row gap="sm" align="center">
        <span className="text-label text-[var(--ds-fg-secondary)]">Reader’s text size</span>
        {[100, 125, 150, 200].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPct(p)}
            aria-pressed={pct === p}
            className={`h-8 rounded-[var(--radius-md)] border px-2.5 text-label transition-colors ${
              pct === p
                ? 'border-[var(--ds-accent)] bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                : 'border-[var(--ds-border-subtle)] text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]'
            }`}
          >
            {p}%
          </button>
        ))}
      </Row>
      <div className="grid w-full gap-4 sm:grid-cols-2" style={{ fontSize: `${pct}%` }}>
        <Cell label="Sized in rem" sub="Follows the reader" tone="good">
          <p style={{ fontSize: '1em', lineHeight: 1.6 }} className="text-[var(--ds-fg)]">
            Your subscription renews on the 26th.
          </p>
        </Cell>
        <Cell label="Sized in px" sub="Ignores the reader" tone="bad">
          <p style={{ fontSize: '16px', lineHeight: 1.6 }} className="text-[var(--ds-fg)]">
            Your subscription renews on the 26th.
          </p>
        </Cell>
      </div>
      <p className="max-w-[72ch] text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
        Every reader who has raised this setting did it because the default was too small for
        them. A px font size is a decision to overrule that, silently, on every screen — and it is
        invisible to anyone testing at 100%.
      </p>
    </Stack>
  )
}

/** What is allowed to change between a desktop, a tablet and a phone. */
const RESPONSIVE = [
  { thing: 'Body, UI, supporting, caption sizes', desktop: '16 / 15 / 13 / 12', tablet: 'Same', mobile: 'Same', changes: false },
  { thing: 'Display and h1–h2', desktop: '44 / 32 / 24', tablet: '36 / 28 / 22', mobile: '28 / 24 / 20', changes: true },
  { thing: 'Measure', desktop: '68ch', tablet: '62ch', mobile: 'Whatever fits', changes: true },
  { thing: 'Columns', desktop: 'Two or three', tablet: 'Two', mobile: 'One', changes: true },
  { thing: 'Row height / touch target', desktop: '32px rows', tablet: '40px', mobile: '44px minimum', changes: true },
  { thing: 'How much is on screen', desktop: 'All of it', tablet: 'Most', mobile: 'The important part', changes: true },
]

function ResponsiveTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)]">
            <th scope="col" className="py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              What
            </th>
            <th scope="col" className="w-36 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Desktop
            </th>
            <th scope="col" className="w-32 py-2 pr-4 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Tablet
            </th>
            <th scope="col" className="w-36 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Phone
            </th>
          </tr>
        </thead>
        <tbody>
          {RESPONSIVE.map((r) => (
            <tr key={r.thing} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <td className="py-2.5 pr-4">
                <Row gap="sm" align="center">
                  <span className="text-body-sm text-[var(--ds-fg)]">{r.thing}</span>
                  {!r.changes && (
                    <Badge tone="success" size="sm">
                      never changes
                    </Badge>
                  )}
                </Row>
              </td>
              {[r.desktop, r.tablet, r.mobile].map((v, i) => (
                <td
                  key={i}
                  className={`py-2.5 pr-4 font-mono text-caption tabular-nums ${
                    r.changes ? 'text-[var(--ds-fg-secondary)]' : 'text-[var(--ds-fg)]'
                  }`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'readable-type',
    title: 'Readable Type',
    tagline:
      'The smallest size a thing is allowed to be, and what may change when the screen does. Sixteen for body and inputs, fifteen for navigation, twelve as the floor — at every width.',
    keywords: [
      'minimum font size',
      'legibility',
      'readability',
      'accessibility',
      'responsive typography',
      'mobile text size',
      'clamp',
      'rem',
      'zoom',
      'resize text',
      'small text',
      '16px input',
      'ios zoom',
    ],
  },

  overview: {
    purpose:
      'Typography sets the scale. This page sets the floor under it: which sizes may carry meaning, and what is allowed to move when the viewport changes. Every rule here exists because the cheapest way to fit more on a screen is to shrink the text, and that cost is always paid by someone other than the person who made the decision.',
    whenToUse: [
      'Whenever a size is being chosen for text a user has to read rather than admire.',
      'At every responsive breakpoint, as the check on what the breakpoint is allowed to change.',
      'In review, as the thing to point at when a design arrives with 11px labels.',
    ],
    whenNotToUse: [
      { text: 'As permission to set everything at 16px.', instead: 'the four roles — size still carries hierarchy' },
      { text: 'For decorative type in marketing surfaces.', instead: 'the display scale, which has its own rules' },
    ],
    reasoning: (
      <>
        <p>
          Small text is not a neutral aesthetic choice. Contrast sensitivity and near focus decline
          measurably from the mid-forties, which means an 11px label is not "compact" — it is a
          quiet decision about who the product is for, made by a team that mostly cannot see the
          problem from where they are sitting.
        </p>
        <p>
          The mobile version of that decision is worse, because it inverts the need. A phone is
          held further from the eye than a laptop, used in worse light, more often in motion and
          more often one-handed. It is the surface that most needs the type held at size, and it is
          the one where "we shrank it to fit" is most often waved through.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Same panel, two size decisions" center={false} minHeight={0} allowResize={false}>
        <ShrinkComparison />
      </PreviewStage>
    ),
    contents: [
      { id: 'floor', title: 'The floor' },
      { id: 'screens', title: 'Desktop, tablet, phone' },
      { id: 'zoom', title: 'The reader’s own setting' },
    ],
    examples: [
      {
        id: 'floor',
        title: 'The floor',
        description:
          'Four sizes carry a product. Twelve is the smallest, it is for metadata, and there is nothing under it — the last two rows are on this table so they can be pointed at, not chosen.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="lg" className="w-full">
              <Ladder />
              <Callout tone="warning" title="The rule, in one sentence">
                <p className="mt-1 max-w-[72ch] leading-relaxed">
                  Nothing a reader has to read is set below 12px, on any screen, in any density
                  mode — and 12px itself is for metadata. Everything a user must read to act
                  correctly is 13px or larger, and everything they read continuously is 16px.
                </p>
              </Callout>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'screens',
        title: 'Desktop, tablet, phone',
        description:
          'One row of this table never changes. Everything else is where a responsive design is supposed to do its work — and the reason it never has to touch the reading sizes.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ResponsiveTable />
          </PreviewStage>
        ),
      },
      {
        id: 'zoom',
        title: 'The reader’s own setting',
        description:
          'The container below stands in for the root element, which is what a browser’s text-size setting actually moves. One column follows it; the other cannot.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ZoomDemo />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Body', note: '16px — prose and inputs', render: <span className="text-body text-[var(--ds-fg)]">Renews on the 26th</span> },
      { label: 'UI', note: '15px — text you click', render: <span className="text-ui text-[var(--ds-fg)]">Deployments</span> },
      { label: 'Supporting', note: '13px — explains what is there', render: <span className="text-body-sm text-[var(--ds-fg-secondary)]">Applies to this workspace</span> },
      { label: 'Caption', note: '12px — the floor', render: <span className="text-caption text-[var(--ds-fg-muted)]">4 minutes ago</span> },
      { label: 'Below the floor', note: '11px — not allowed', render: <span style={{ fontSize: 11 }} className="text-[var(--ds-fg-muted)]">4 minutes ago</span> },
      { label: 'Phone', note: 'Identical to desktop', render: <span className="text-ui text-[var(--ds-fg)]">Deployments</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="relative w-full max-w-md">
        <div className="relative rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-5">
          <div className="flex h-8 items-center rounded-[var(--radius-sm)] bg-[var(--ds-layer-selected)] px-2.5 text-ui text-[var(--ds-fg)]">
            Deployments
          </div>
          <p className="mt-4 max-w-[46ch] text-body leading-relaxed text-[var(--ds-fg-secondary)]">
            The last build reached every production region, and nothing is waiting on approval.
          </p>
          <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">Updated 4 minutes ago</p>
        </div>
      </div>
    ),
    caption:
      'Three sizes, three jobs, and a row tall enough to hold the first one. Nothing here changes on a phone except the width of the paragraph.',
    parts: [
      {
        n: 1,
        label: 'Navigation text',
        value: '15px / 21px / 470',
        kind: 'type',
        note: 'Read from the corner of the eye by someone deciding where to go next, not by someone already looking at it. One step under body, and never under 15px.',
      },
      {
        n: 2,
        label: 'Row height',
        value: '32px',
        kind: 'size',
        note: 'The line box is 21px; the remaining 11px is what stops a list of destinations reading as a wall. On touch the target grows to 44px without the text changing.',
      },
      {
        n: 3,
        label: 'Body',
        value: '16px / 1.6',
        kind: 'type',
        note: 'The default for prose and for every input. Below 16px an input also makes iOS Safari zoom the page on focus, which leaves the reader scrolled sideways.',
      },
      {
        n: 4,
        label: 'Measure',
        value: '46ch',
        kind: 'size',
        note: 'In ch, so it is still a measure after a size change or a zoom. This is the value that narrows on a phone — the size is not.',
      },
      {
        n: 5,
        label: 'Metadata',
        value: '12px',
        kind: 'type',
        note: 'The floor, and the only size allowed to sit on it. If a caption has to go smaller to fit, the caption is too long or the card is too small.',
      },
    ],
  },

  tokens: [
    { category: 'typography', token: '--text-body', value: '1rem / 1.6', usedFor: 'Body copy and every input' },
    { category: 'typography', token: '--text-ui', value: '0.9375rem / 1.4 / 470', usedFor: 'Navigation, menus, list rows' },
    { category: 'typography', token: '--text-body-sm', value: '0.8125rem / 1.6', usedFor: 'Supporting copy' },
    { category: 'typography', token: '--text-caption', value: '0.75rem / 1.45', usedFor: 'Metadata — the floor' },
    { category: 'typography', token: '--text-display', value: 'clamp(1.75rem → 2.75rem)', usedFor: 'The one place responsive sizing belongs' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Body at 4.5:1 or better' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Metadata — verified at 12px, never below' },
    { category: 'spacing', token: 'row height', value: '32px / 44px touch', usedFor: 'Holding a 15px label comfortably' },
  ],

  sizes: [
    { name: 'Body', height: '16px', type: '400 weight', maxWidth: '68ch', touch: 'n/a', use: 'Prose and every input. The size the product is read at.' },
    { name: 'UI', height: '15px', type: '470 weight', maxWidth: '40ch', touch: '44px row on coarse pointers', use: 'Navigation, menus, list rows, tabs.' },
    { name: 'Supporting', height: '13px', type: '400 weight', maxWidth: '72ch', use: 'Help text and table cells. Never the only copy explaining a control.' },
    { name: 'Caption', height: '12px', type: '400 weight', maxWidth: '60ch', use: 'Timestamps, counts, hints. The floor.' },
    { name: 'Below 12px', height: '—', use: 'Not a size. If something only fits at 11px, cut the string or widen the container.' },
  ],

  do: [
    {
      title: 'Hold every reading size across every breakpoint',
      why: 'A phone is further from the eye, in worse light, more often in motion. Shrinking type there inverts the need. Narrow the measure, drop a column, show less — the sizes do not move.',
      render: (
        <Row gap="lg" align="baseline">
          <span className="text-ui text-[var(--ds-fg)]">1440px · 15px</span>
          <span className="text-ui text-[var(--ds-fg)]">390px · 15px</span>
          <Badge tone="success" size="sm">unchanged</Badge>
        </Row>
      ),
    },
    {
      title: 'Set inputs at 16px',
      why: 'Two reasons that happen to agree: a value being typed or checked is read carefully, and any font size under 16px makes iOS Safari zoom the page when the field takes focus — which leaves the reader scrolled sideways in a form they were halfway through.',
      render: (
        <input
          readOnly
          value="ada@example.com"
          aria-label="Example field"
          className="h-9 w-full max-w-[18rem] rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-field)] px-3 text-body text-[var(--ds-fg)]"
        />
      ),
    },
    {
      title: 'Reserve clamp() for display type',
      why: 'A 44px hero genuinely cannot stay 44px at 390px — that is four words a line. Everything at h3 and below already fits at every width, so scaling it can only make it smaller than it was designed to be.',
      render: (
        <span
          className="text-[var(--ds-fg)]"
          style={{ fontSize: 'clamp(1.5rem, 1.1rem + 1.8vw, 2.75rem)', lineHeight: 1.12, fontWeight: 620, letterSpacing: '-0.025em' }}
        >
          Resize the window
        </span>
      ),
    },
    {
      title: 'Give the size somewhere to sit',
      why: 'Raising a label from 12px to 15px inside a 24px row buys nothing: the line box is 21px and the row now reads as packed. Readability is the size and the space around it, and the second half is the one that gets forgotten.',
      render: (
        <Stack gap="xs" className="w-full max-w-[16rem]">
          <span className="flex h-8 items-center rounded-[var(--radius-sm)] bg-[var(--ds-layer-selected)] px-2.5 text-ui text-[var(--ds-fg)]">
            32px row
          </span>
          <span className="flex h-6 items-center rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)] px-2.5 text-ui text-[var(--ds-fg-muted)]">
            24px row
          </span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not shrink text at a mobile breakpoint',
      why: 'It is the most common readability defect in shipped products, and it is invisible in review because reviews happen on desktops. The line that does it is usually one media query written to stop a heading wrapping.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-fg-muted)] line-through">@media (max-width: 640px) &#123; body &#123; font-size: 0.8125rem; &#125; &#125;</span>
          <span className="text-[var(--ds-success)]">@media (max-width: 640px) &#123; .col &#123; max-inline-size: 100%; &#125; &#125;</span>
        </div>
      ),
    },
    {
      title: 'Do not put required information below 12px',
      why: 'A chart legend, a required-field marker, a price qualifier. If the reader needs it to act correctly, it is not metadata — and 11px is the size at which a meaningful share of readers stop being able to resolve it at arm’s length.',
      render: (
        <Row gap="md" align="baseline">
          <span style={{ fontSize: 10 }} className="text-[var(--ds-fg-muted)]">* excludes tax</span>
          <span style={{ fontSize: 11 }} className="text-[var(--ds-fg-muted)]">Free tier only</span>
          <Badge tone="danger" size="sm">both illegible</Badge>
        </Row>
      ),
    },
    {
      title: 'Do not size text in px',
      why: 'It overrides the reader’s own browser setting — the one they changed because the default was too small for them. rem answers that setting; px silently discards it, and nobody testing at 100% will ever see the difference.',
      render: (
        <div className="flex flex-col gap-1 font-mono text-code">
          <span className="text-[var(--ds-fg-muted)] line-through">font-size: 15px;</span>
          <span className="text-[var(--ds-success)]">font-size: 0.9375rem;</span>
        </div>
      ),
    },
    {
      title: 'Do not buy density out of the type size',
      why: 'Density is bought with layout — fewer columns, tighter rows, less on screen. Buying it from the font size charges the whole cost to whoever has the weakest eyes, and saves about two lines.',
      render: (
        <p style={{ fontSize: 11, lineHeight: 1.35 }} className="max-w-[40ch] text-[var(--ds-fg-muted)]">
          Every row in this table was set two steps down so one more row would fit above the fold,
          which is a trade nobody described out loud.
        </p>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.4', name: 'Resize Text', level: 'AA' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.8', name: 'Visual Presentation', level: 'AAA' },
    ],
    contrast: [
      'Small text needs more contrast, not less. 12px metadata on --ds-fg-muted is verified at 4.6:1 on --ds-surface; the same colour one step smaller has no verification and no excuse.',
      'The "large text" exception (18.66px regular, 14px bold, 3:1) exists for headings. Designing ordinary UI text down to it is using an exemption as a target.',
      'Never let a lighter weight stand in for a smaller size. 400 and 600 of one colour measure identically, so weight cannot rescue text that is too small to resolve.',
    ],
    keyboard: [
      { keys: '⌘ / Ctrl +', does: 'Browser zoom to 200%. The page must reflow without horizontal scrolling at 320px CSS width.' },
      { keys: 'Browser text size', does: 'Independent of zoom, and the setting rem answers. Set it to 20px and reload before shipping.' },
    ],
    aria: [
      { attr: 'font-size', on: 'Any text node', note: 'In rem. This is an accessibility property before it is a visual one.' },
      { attr: 'line-height', on: 'Any text block', note: 'Unitless, and at least 1.5 for body copy — WCAG 1.4.12 requires that it survive being overridden.' },
      { attr: 'meta[name=viewport]', on: 'The document', note: 'Never user-scalable=no, and never maximum-scale=1. Both disable pinch zoom, which is the only tool some readers have.' },
    ],
    focus:
      'Nothing here is focusable on its own, but everything here is what a focused control says. A focus ring around an 11px label is a ring around something the reader still cannot read.',
    screenReader: [
      'Text size is invisible to a screen reader and critical to everyone using magnification, which is a much larger group. Do not treat "it is announced correctly" as covering it.',
      'Never render text as an image to keep it small and sharp. It cannot be resized, selected, translated or read aloud.',
      'A 200% zoom is the assistive technology most people actually use, and it is built into every browser they already have.',
    ],
    touch:
      'On a coarse pointer every row is at least 44px, and the text inside it does not change size to pay for that. A 15px label in a 44px row is the correct phone treatment; a 12px label in a 44px row is a big target for something you cannot read.',
  },

  code: {
    css: {
      lang: 'css',
      caption: 'The whole standard, as CSS. Four sizes, four units, one media query that does not touch them.',
      code: `:root {
  /* rem, so the reader's own browser text-size setting still applies. */
  --text-body: 1rem;        /* 16 — prose and every input   */
  --text-ui: 0.9375rem;     /* 15 — navigation and UI text  */
  --text-body-sm: 0.8125rem;/* 13 — supporting copy         */
  --text-caption: 0.75rem;  /* 12 — metadata. The floor.    */
}

/* Line heights are unitless: they multiply against whatever size the
   element ends up at, so they survive inheritance and user zoom. */
body { font-size: var(--text-body); line-height: 1.6; }
.nav-item { font-size: var(--text-ui); line-height: 1.4; font-weight: 470; }

/* em only for what is genuinely relative to the current font. */
h2 { letter-spacing: -0.017em; }

/* ch for reading width, because a measure is counted in characters. */
.prose { max-inline-size: 68ch; }

/* Inputs sit at body size. Under 16px, iOS zooms the page on focus. */
input, textarea, select { font-size: var(--text-body); }

/* clamp() belongs to display type and nothing else. */
.hero { font-size: clamp(1.75rem, 1.25rem + 2.2vw, 2.75rem); line-height: 1.1; }

/* The only thing a breakpoint changes about text is how wide it runs. */
@media (max-width: 640px) {
  .prose { max-inline-size: 100%; }
  /* No font-size here. Not one. */
}`,
    },
    usage: {
      lang: 'tsx',
      code: `// Text you click is text-ui, in a row tall enough to hold it.
<a className="flex h-8 items-center rounded-md px-2.5 text-ui">Deployments</a>

// Text you read, and text you type into, are both text-body.
<p className="max-w-[68ch] text-body text-fg-secondary">{description}</p>
<input className="h-9 w-full rounded-md px-3 text-body" />

// Metadata is text-caption, and there is nothing below it.
<span className="text-caption text-fg-muted">{relativeTime(updatedAt)}</span>

// A phone gets the same sizes. What it gets less of is content.
<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{cards}</div>`,
    },
  },

  notes: {
    tips: [
      'The quickest audit in the codebase: grep for font-size values under 0.75rem, and for any font-size inside a max-width media query. Those two searches find almost every violation of this page.',
      'When a string only fits at 11px, the string is the problem. Shorten the label, widen the column, or wrap — three fixes that cost nothing, against one that costs a reader.',
      'Raising a size usually means raising the box around it too. A 15px label needs a 32px row; dropping it into a 24px row trades one readability problem for another.',
      'Test with the browser text size at 20px, not just at 200% zoom. They are different settings, and only one of them exposes px font sizes.',
    ],
    performance: [
      'Larger type costs nothing to render. It costs layout — fewer rows above the fold — which is a design decision, not a performance one.',
      'Holding sizes constant across breakpoints removes a whole class of media queries, and with them the CSS that goes stale the next time the scale moves.',
      'clamp() is resolved by the browser at layout time with no JavaScript and no resize listener. Where it belongs it is free; the argument against it on body text is never performance.',
    ],
    mistakes: [
      'Shrinking type at a mobile breakpoint to keep a desktop layout intact. The layout was the thing that was supposed to change.',
      'Setting font-size in px, which overrides the reader’s browser setting — the most common accessibility defect in shipped design systems.',
      'Treating 12px as a general small size rather than as the floor for metadata. It is the last step, not a spare one.',
      'Using user-scalable=no in the viewport meta to stop iOS zooming a 14px input. Fix the input size; disabling pinch zoom takes the workaround away from the reader too.',
    ],
    realWorld: [
      'Hold the phone at the distance you actually hold a phone — not the distance you hold it when checking your work — and read the smallest string on the screen. That is the test.',
      'Ask someone over fifty to read the densest screen in the product. It takes two minutes and it will find things no contrast checker reports.',
      'Sizes chosen on a 27-inch display at 100% scaling are chosen roughly 30% larger than they will be seen on a laptop at default scaling. Check on the smaller machine before deciding something can go down a step.',
      'When a stakeholder asks for more on the screen, offer fewer columns or a denser layout first. "We will shrink the text" is the answer that sounds cheapest and is not.',
    ],
  },
})
