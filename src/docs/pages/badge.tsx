import * as React from 'react'
import { Check, Clock, GitBranch, Sparkles, X } from 'lucide-react'
import { Badge, CountBadge, type Tone } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const TONES: Tone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'info']

function Playground() {
  const [tone, setTone] = React.useState<Tone>('success')
  const [variant, setVariant] = React.useState<'subtle' | 'solid' | 'outline'>('subtle')
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [dot, setDot] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={140}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Tone">
            <KnobSelect value={tone} onChange={setTone} options={TONES} />
          </Knob>
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['subtle', 'solid', 'outline'] as const}
            />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={dot} onChange={setDot} label="Dot" />
        </div>
      }
      code={`<Badge tone="${tone}" variant="${variant}" size="${size}"${dot ? ' dot' : ''}>
  Healthy
</Badge>`}
    >
      <Badge tone={tone} variant={variant} size={size} dot={dot}>
        Healthy
      </Badge>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'badge',
    title: 'Badge',
    tagline:
      'A read-only label that states a status. Never clickable, never the only carrier of meaning, and always paired with a word.',
    keywords: ['tag', 'pill', 'label', 'status', 'count', 'notification dot', 'chip'],
  },

  overview: {
    purpose:
      'A badge attaches a short piece of status to something else. It is a label, not a control — the user reads it and moves on. That read-only nature is exactly what separates it from a chip, and confusing the two is the most common mistake with this component.',
    whenToUse: [
      'Stating the status of a row, card or record: Live, Failed, Draft, Pending.',
      'Showing an unread or pending count on a navigation item or tab.',
      'Marking something as new, beta, deprecated or recommended.',
      'Categorising a list item where the category is informational rather than filterable.',
    ],
    whenNotToUse: [
      {
        text: 'The label is clickable, removable, or toggles a filter.',
        instead: 'a Chip',
        to: '#/chip',
      },
      {
        text: 'The message needs more than about three words.',
        instead: 'an Alert',
        to: '#/banner',
      },
      {
        text: 'The status applies to the whole page rather than to one item.',
        instead: 'an Alert or a banner',
        to: '#/banner',
      },
      {
        text: 'You want to draw attention to a primary action.',
        instead: 'a Button — a badge is not an affordance',
        to: '#/button',
      },
    ],
    reasoning: (
      <>
        <p>
          Badges are fully rounded, and that is deliberate. Our interactive controls live at 8px
          radius; a pill shape says "this is a label, not a button" before a single word is read.
          Shape is the fastest categorical signal available and it costs nothing.
        </p>
        <p>
          The rule that matters most: <strong>colour is never the only signal</strong>. A green
          badge and a red badge are identical to a large number of readers, in greyscale, and in
          high-contrast mode. Every status badge carries a word, and most carry a dot as well. If
          removing the colour loses information, the badge is broken.
        </p>
        <p>
          The <code>subtle</code> variant is the default because a page usually has several badges
          at once, and solid fills at that density become a distracting mosaic. Reserve{' '}
          <code>solid</code> for the one badge on a page that genuinely needs to interrupt — an
          unread count, a critical failure.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'tones',
        title: 'Tones and variants',
        description:
          'Subtle is the default. Solid is for the one badge that must interrupt. Outline is for dense surfaces where even a tint is too much.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              {(['subtle', 'solid', 'outline'] as const).map((variant) => (
                <div key={variant}>
                  <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">{variant}</p>
                  <Row gap="sm">
                    {TONES.map((t) => (
                      <Badge key={t} tone={t} variant={variant} dot={variant !== 'solid'}>
                        {t}
                      </Badge>
                    ))}
                  </Row>
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'in-context',
        title: 'In context',
        description:
          'Badges earn their space by removing a sentence. "Live · 3 regions" as a badge and a caption beats a paragraph explaining the same thing.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-lg divide-y divide-[var(--ds-border-subtle)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
              {(
                [
                  ['api-gateway', 'success', 'Live', <Check size={11} key="c" />],
                  ['billing-worker', 'warning', 'Degraded', <Clock size={11} key="w" />],
                  ['legacy-sync', 'danger', 'Failed', <X size={11} key="x" />],
                  ['edge-cache', 'neutral', 'Draft', <GitBranch size={11} key="g" />],
                ] as const
              ).map(([name, tone, label, icon]) => (
                <div key={name} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-body-sm text-[var(--ds-fg)]">{name}</span>
                  <Badge tone={tone as Tone} icon={icon}>
                    {label}
                  </Badge>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'counts',
        title: 'Counts',
        description:
          'Tabular figures so the badge does not jitter as the number changes, and a cap at 99+ so it cannot grow the row it sits in.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="center">
              {[1, 12, 99, 250].map((n) => (
                <Stack key={n} gap="xs" className="items-center">
                  <CountBadge count={n} />
                  <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">{n}</span>
                </Stack>
              ))}
              <Stack gap="xs" className="items-center">
                <span className="relative inline-flex">
                  <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] border border-[var(--ds-border)] text-[var(--ds-fg-secondary)]">
                    <Sparkles size={16} />
                  </span>
                  <span className="absolute -right-1.5 -top-1.5">
                    <CountBadge count={3} tone="danger" />
                  </span>
                </span>
                <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">overlay</span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'greyscale',
        title: 'The greyscale test',
        description:
          'Run any badge row through a greyscale filter. If you can still tell the states apart, the colour was reinforcing. If not, it was load-bearing.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Colour</span>
                <Row gap="sm">
                  <Badge tone="success" dot>Live</Badge>
                  <Badge tone="warning" dot>Degraded</Badge>
                  <Badge tone="danger" dot>Failed</Badge>
                </Row>
              </div>
              <div className="flex flex-col gap-2" style={{ filter: 'grayscale(1)' }}>
                <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Greyscale</span>
                <Row gap="sm">
                  <Badge tone="success" dot>Live</Badge>
                  <Badge tone="warning" dot>Degraded</Badge>
                  <Badge tone="danger" dot>Failed</Badge>
                </Row>
              </div>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Neutral', render: <Badge dot>Draft</Badge> },
      { label: 'Accent', render: <Badge tone="accent" dot>Beta</Badge> },
      { label: 'Success', render: <Badge tone="success" dot>Live</Badge> },
      { label: 'Warning', render: <Badge tone="warning" dot>Degraded</Badge> },
      { label: 'Danger', render: <Badge tone="danger" dot>Failed</Badge> },
      { label: 'Info', render: <Badge tone="info" dot>Queued</Badge> },
      { label: 'Solid', note: 'One per page', render: <Badge tone="danger" variant="solid">Critical</Badge> },
      { label: 'Outline', render: <Badge tone="accent" variant="outline">Preview</Badge> },
      { label: 'With icon', render: <Badge tone="success" icon={<Check size={11} />}>Verified</Badge> },
      { label: 'Small', render: <Badge tone="accent" size="sm">New</Badge> },
      { label: 'Count', render: <CountBadge count={12} /> },
      { label: 'Overflow', render: <CountBadge count={250} /> },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="center">
        <Badge tone="success" dot size="md">
          Live
        </Badge>
        <Badge tone="danger" variant="solid" size="md">
          Failed
        </Badge>
        <CountBadge count={12} />
      </Row>
    ),
    caption:
      'Subtle, solid, and count. All three share a height and a fully rounded shape so they align in any row.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '22px (md), 18px (sm)',
        kind: 'size',
        note: 'Below a chip (28px) and well below a button (36px). The size difference is itself a signal that this is not pressable.',
      },
      {
        n: 2,
        label: 'Shape',
        value: 'Fully rounded',
        kind: 'shape',
        note: 'Pills are labels; 8px radius is interactive. Users read the shape before the word.',
      },
      {
        n: 3,
        label: 'Padding',
        value: '8px horizontal',
        kind: 'space',
        note: 'Roughly 0.36× the height. Tighter and the text touches the curve; looser and short labels float in an oversized pill.',
      },
      {
        n: 4,
        label: 'Status dot',
        value: '6px, 6px gap',
        kind: 'shape',
        note: 'The redundant encoding. It carries the tone at full saturation while the text stays legible against a soft tint.',
      },
      {
        n: 5,
        label: 'Fill and ring',
        value: '14% tint + 1px inset ring',
        kind: 'color',
        note: 'An inset ring rather than a border, so the badge does not grow by 2px and break the alignment of a row of them.',
      },
      {
        n: 6,
        label: 'Type',
        value: '12px / 500, tabular',
        kind: 'type',
        note: 'Tabular figures so a count badge does not change width as the number changes.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-success-subtle', usedFor: 'Subtle fill' },
    { category: 'color', token: '--ds-success-border', usedFor: 'Inset ring' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Label — certified against the subtle fill' },
    { category: 'color', token: '--ds-success', usedFor: 'Solid fill and the status dot' },
    { category: 'color', token: '--ds-success-fg', usedFor: 'Label on the solid fill' },
    { category: 'color', token: '--ds-layer-active', usedFor: 'Neutral fill' },
    { category: 'spacing', token: 'padding-x', value: '8px (md), 6px (sm)', usedFor: 'Horizontal padding' },
    { category: 'spacing', token: 'gap', value: '6px', usedFor: 'Dot or icon to label' },
    { category: 'radius', token: 'full', usedFor: 'Pill shape' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Medium label' },
    { category: 'typography', token: '--text-overline', value: '11px', usedFor: 'Small label' },
  ],

  sizes: [
    { name: 'Small', height: '18px', padding: '0 6px', radius: 'full', type: '11px / 500', minWidth: '18px', use: 'Inside table cells, next to a title, in dense toolbars.' },
    { name: 'Medium', height: '22px', padding: '0 8px', radius: 'full', type: '12px / 500', minWidth: '22px', use: 'The default. List rows, cards, page headers.' },
    { name: 'Count', height: '18px', padding: '0 4px', radius: 'full', type: '11px tabular', minWidth: '18px', use: 'Navigation items and tabs. Caps at 99+.' },
    { name: 'Dot only', height: '8px', radius: 'full', use: 'A presence indicator with no number. Needs an accessible name.' },
  ],

  do: [
    {
      title: 'Pair the tone with a word',
      why: 'The word is what survives greyscale, colour blindness and high-contrast mode. The colour makes it faster to find; it should never be what makes it understandable.',
      render: (
        <Row gap="sm">
          <Badge tone="success" dot>Live</Badge>
          <Badge tone="warning" dot>Degraded</Badge>
          <Badge tone="danger" dot>Failed</Badge>
        </Row>
      ),
    },
    {
      title: 'Keep the vocabulary closed',
      why: 'Live, Degraded, Failed, Draft, Queued. Five words used consistently across the whole product beat twenty synonyms that all mean roughly the same thing.',
      render: (
        <Stack gap="xs" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>Live · Degraded · Failed · Draft · Queued</span>
          <span className="text-[var(--ds-fg-muted)]">not: Online, Up, Running, Active, Healthy…</span>
        </Stack>
      ),
    },
    {
      title: 'Cap counts and use tabular figures',
      why: 'A badge that grows from 9 to 100 pushes the layout around. Capping at 99+ fixes the width, and tabular figures stop the digits jittering as the value updates.',
      render: (
        <Row gap="sm" align="center">
          <CountBadge count={9} />
          <CountBadge count={99} />
          <CountBadge count={1204} />
        </Row>
      ),
    },
    {
      title: 'Prefer subtle when several badges share a screen',
      why: 'A table with fifty solid badges is a mosaic. Subtle keeps the row readable and lets the one solid badge on the page actually mean something.',
      render: (
        <Stack gap="xs" className="w-full">
          {['Live', 'Live', 'Degraded', 'Live'].map((s, i) => (
            <div key={i} className="flex items-center justify-between text-caption text-[var(--ds-fg-muted)]">
              <span className="font-mono">service-{i + 1}</span>
              <Badge tone={s === 'Live' ? 'success' : 'warning'} size="sm" dot>
                {s}
              </Badge>
            </div>
          ))}
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not make a badge clickable',
      why: 'The pill shape and the small size say "label". A badge that navigates or filters is a chip, and pretending otherwise means users never discover the interaction.',
      render: (
        <button type="button" className="cursor-pointer">
          <Badge tone="accent">Click me?</Badge>
        </button>
      ),
    },
    {
      title: 'Do not rely on colour alone',
      why: 'These three are indistinguishable in greyscale, to a deuteranope, and in Windows High Contrast Mode. There is simply no information present.',
      render: (
        <Row gap="sm">
          <span className="h-[22px] w-14 rounded-full" style={{ background: '#35c98a' }} />
          <span className="h-[22px] w-14 rounded-full" style={{ background: '#f7b222' }} />
          <span className="h-[22px] w-14 rounded-full" style={{ background: '#fa6470' }} />
        </Row>
      ),
    },
    {
      title: 'Do not put a sentence in a badge',
      why: 'Past about three words the pill stops being scannable and starts being a paragraph with rounded corners. Long status messages belong in an alert.',
      render: (
        <Badge tone="warning">
          Certificate expires in six days and renewal is currently blocked
        </Badge>
      ),
    },
    {
      title: 'Do not stack more than two badges on one item',
      why: 'Three or more competing labels means none of them is read. Pick the one that changes what the user does next.',
      render: (
        <Row gap="sm">
          <span className="text-body-sm text-[var(--ds-fg)]">api-gateway</span>
          <Badge tone="success" size="sm">Live</Badge>
          <Badge tone="accent" size="sm">Beta</Badge>
          <Badge tone="info" size="sm">v4</Badge>
          <Badge tone="warning" size="sm">Migrating</Badge>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'The label must reach 4.5:1 against the fill. That is why -text exists as a separate token from the base colour.',
      'The status dot is a meaningful graphic and must reach 3:1 against the fill it sits on.',
      'Solid badges use the -fg token, which is verified against the solid fill. Using -text there would fail.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Skips badges entirely — they are not interactive and must never be focusable.' },
    ],
    aria: [
      { attr: 'No role', on: 'Static badges', note: 'A badge is text. Adding role="status" to a static label makes screen readers announce it on every re-render.' },
      { attr: 'aria-label', on: 'CountBadge', note: '"3 unread notifications" rather than the bare number, which announces as a meaningless "3".' },
      { attr: 'aria-live="polite"', on: 'A badge that changes', note: 'Only when the change is important and the user did not cause it — a build going from Queued to Failed.' },
      { attr: 'sr-only text', on: 'Dot-only indicators', note: 'A coloured dot with no text is invisible to assistive tech. Add a visually hidden word.' },
    ],
    focus: 'Badges are never focusable. If it needs focus, it is a chip or a button.',
    screenReader: [
      'A badge is read as part of its surrounding content: "api-gateway, Live". That is why the word matters more than the colour.',
      'Do not put a badge before the thing it describes in the DOM — it will be announced before the user knows what it applies to.',
      'For a count badge, the accessible name should include the noun. "12" alone is meaningless out of context.',
    ],
    touch: 'Badges are not touch targets. If a badge is inside a clickable row, the row is the target and the badge must not intercept the tap.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Badge, CountBadge } from '@/ui/Display'

// Status: tone plus a word, and usually a dot
<Badge tone="success" dot>Live</Badge>
<Badge tone="danger" dot>Failed</Badge>

// A closed vocabulary, mapped in one place
const STATUS = {
  live:     { tone: 'success', label: 'Live' },
  degraded: { tone: 'warning', label: 'Degraded' },
  failed:   { tone: 'danger',  label: 'Failed' },
  draft:    { tone: 'neutral', label: 'Draft' },
} as const

<Badge tone={STATUS[s].tone} dot>{STATUS[s].label}</Badge>

// Counts: capped, tabular, with a real accessible name
<CountBadge count={unread} max={99} />

// Overlaid on an icon button
<span className="relative inline-flex">
  <IconButton label="Notifications" icon={<Bell />} />
  <span className="absolute -right-1 -top-1">
    <CountBadge count={unread} tone="danger" />
  </span>
</span>

// Dot only — the word is still required, just hidden
<span className="inline-flex items-center gap-1.5">
  <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
  <span className="sr-only">Online</span>
</span>`,
    },
    html: {
      lang: 'html',
      code: `<span class="ds-badge ds-badge--success">
  <span class="ds-badge__dot" aria-hidden="true"></span>
  Live
</span>

<span class="ds-badge ds-badge--danger ds-badge--solid">Critical</span>

<!-- A count needs a noun, not just a number -->
<span class="ds-badge ds-badge--count" aria-label="12 unread notifications">12</span>

<!-- Dot only: the word still has to exist somewhere -->
<span class="ds-status">
  <span class="ds-status__dot" aria-hidden="true"></span>
  <span class="sr-only">Online</span>
</span>`,
    },
    css: {
      lang: 'css',
      code: `.ds-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  block-size: 22px;
  padding-inline: 8px;
  border-radius: 999px;            /* pill = label, 8px = interactive */
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Inset ring rather than a border, so the badge does not grow by 2px
   and break the alignment of a row of them. */
.ds-badge--success {
  background: var(--ds-success-subtle);
  color: var(--ds-success-text);
  box-shadow: inset 0 0 0 1px var(--ds-success-border);
}

.ds-badge--solid.ds-badge--danger {
  background: var(--ds-danger);
  color: var(--ds-danger-fg);
  box-shadow: none;
}

.ds-badge__dot {
  inline-size: 6px;
  block-size: 6px;
  border-radius: 999px;
  background: currentColor;
  flex-shrink: 0;
}

.ds-badge--count {
  min-inline-size: 18px;
  block-size: 18px;
  padding-inline: 4px;
  justify-content: center;
}

/* High contrast mode strips the fill — keep the outline */
@media (forced-colors: active) {
  .ds-badge { border: 1px solid CanvasText; }
}`,
    },
    api: [
      {
        name: 'Badge',
        props: [
          { name: 'tone', type: "'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'", default: "'neutral'", description: 'Semantic role. Never chosen for aesthetics.' },
          { name: 'variant', type: "'subtle' | 'solid' | 'outline'", default: "'subtle'", description: 'Subtle by default. Solid for the one badge that must interrupt.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: '18px or 22px tall.' },
          { name: 'dot', type: 'boolean', default: 'false', description: 'Adds a 6px status dot. The redundant encoding for colour.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph, 11px. Use instead of a dot when the icon adds meaning.' },
        ],
      },
      {
        name: 'CountBadge',
        props: [
          { name: 'count', type: 'number', required: true, description: 'Renders nothing when zero — no empty badge.' },
          { name: 'max', type: 'number', default: '99', description: 'Values above this render as "99+".' },
          { name: 'tone', type: 'Tone', default: "'accent'", description: 'Use danger only for genuinely urgent counts.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Define the status vocabulary in one file and map it to tones there. The alternative is discovering that three teams have three different words for "broken".',
      'A count of zero should render nothing, not a badge with a 0 in it. An empty badge is visual noise that says "no news".',
      'When a badge appears in a list, put it at the end of the row with a shared right edge. A ragged column of badges is much harder to scan.',
      'For "New" and "Beta" markers, add an expiry. A badge that says New for eight months is worse than no badge at all.',
    ],
    performance: [
      'Badges are cheap, but a table with a thousand of them is a thousand extra DOM nodes. In a virtualised list, that cost only applies to visible rows — make sure the virtualiser knows about them.',
      'Avoid animating badge appearance in a list. Fifty badges animating in on filter change is a strobe.',
      'A count badge that updates from a websocket should batch. One re-render per event on a busy stream is a common source of dropped frames.',
    ],
    mistakes: [
      'Making a badge clickable, so the only people who discover the interaction are the ones who click everything.',
      'Using tone="danger" for a category that just happens to be red in the brand palette. Red means failed.',
      'Announcing every badge change with aria-live, so a table of statuses reads itself aloud continuously.',
      'Placing a badge before its subject in the DOM, so screen readers announce "Live, api-gateway".',
      'Letting a count badge grow unbounded, so a four-digit number pushes the navigation label out of the sidebar.',
    ],
    realWorld: [
      'Status badges are the most-read element in an operations product. Spend the time on the vocabulary — it matters more than the styling.',
      'When a status has a cause, make the row expandable rather than putting the cause in the badge. "Failed" plus a reason on click beats a 60-character pill.',
      'Audit for badge inflation quarterly. Products accumulate New, Beta, Preview, Early Access and Labs badges until none of them means anything.',
      'In a table, a badge column should be sortable by severity, not alphabetically. Users scanning for problems want the failures first.',
    ],
  },
})
