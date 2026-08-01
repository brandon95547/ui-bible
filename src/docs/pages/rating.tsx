import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

function Rating({
  value,
  onChange,
  max = 5,
  size = 'md',
  label,
  readOnly,
  precision = 1,
}: {
  value: number
  onChange?: (v: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  label: string
  readOnly?: boolean
  precision?: 0.5 | 1
}) {
  const [hover, setHover] = React.useState<number | null>(null)
  const px = { sm: 14, md: 20, lg: 28 }[size]
  const shown = hover ?? value

  // Read-only ratings are output, not input: no focus stops, no radios, and
  // the whole thing announces as one string.
  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1" role="img" aria-label={`${label}: ${value} out of ${max}`}>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(1, Math.max(0, value - i))
          return (
            <span key={i} aria-hidden className="relative inline-block" style={{ width: px, height: px }}>
              <Star size={px} className="absolute inset-0 text-[var(--ds-border-strong)]" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={px} className="text-[var(--ds-warning)]" fill="currentColor" />
              </span>
            </span>
          )
        })}
      </span>
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(null)}
      className="inline-flex items-center gap-1"
    >
      {Array.from({ length: max }, (_, i) => {
        const v = i + 1
        const active = shown >= v
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            // Never a bare number: "3" tells a screen-reader user nothing.
            aria-label={`${v} of ${max}${LABELS[v] ? ` — ${LABELS[v]}` : ''}`}
            // One tab stop for the whole group; arrows move within it.
            tabIndex={value === v || (value === 0 && v === 1) ? 0 : -1}
            onMouseEnter={() => setHover(v)}
            onFocus={() => setHover(v)}
            onBlur={() => setHover(null)}
            onClick={() => onChange?.(value === v ? 0 : v)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                onChange?.(Math.min(max, value + precision))
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                onChange?.(Math.max(0, value - precision))
              } else if (e.key === 'Home') {
                e.preventDefault()
                onChange?.(precision)
              } else if (e.key === 'End') {
                e.preventDefault()
                onChange?.(max)
              }
            }}
            className={cn(
              'rounded-[var(--radius-xs)] p-0.5 transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
              active ? 'text-[var(--ds-warning)]' : 'text-[var(--ds-border-strong)]',
            )}
          >
            <Star size={px} fill={active ? 'currentColor' : 'none'} />
          </button>
        )
      })}
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState(4)
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [readOnly, setReadOnly] = React.useState(false)
  const [showLabel, setShowLabel] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={180}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <KnobToggle checked={readOnly} onChange={setReadOnly} label="Read only" />
          <KnobToggle checked={showLabel} onChange={setShowLabel} label="Text label" />
        </div>
      }
      code={`<Field label="How was your deployment experience?">
  <Rating
    size="${size}"
    value={value}
    onChange={setValue}${readOnly ? '\n    readOnly' : ''}
    label="Deployment experience"
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <Field label="How was your deployment experience?">
          <Row gap="sm" align="center">
            <Rating
              label="Deployment experience"
              value={value}
              onChange={setValue}
              size={size}
              readOnly={readOnly}
            />
            {showLabel && (
              // The word is not decoration: it is what makes the score mean
              // the same thing to everyone.
              <span aria-live="polite" className="text-body-sm text-[var(--ds-fg-secondary)]">
                {value ? LABELS[Math.round(value)] : 'Not rated'}
              </span>
            )}
          </Row>
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'rating',
    title: 'Rating',
    tagline:
      'Collecting or displaying a score. Read-only and interactive share an anatomy and almost nothing else — one is an input, the other is output.',
    keywords: ['stars', 'score', 'nps', 'review', 'five star', 'half star', 'aggregate'],
  },

  overview: {
    purpose:
      'A rating turns a subjective judgement into a number small enough to aggregate. It exists in two forms that look identical and behave nothing alike: an interactive control that collects one person’s score, and a read-only display that summarises everyone’s. The second is far more common, and treating it as an input is the most frequent mistake made with this component.',
    whenToUse: [
      'Collecting a quick subjective score where a free-text review would be too much to ask.',
      'Displaying an aggregate score beside a product, article or service.',
      'Post-interaction feedback — a support conversation, a deployment, a delivery.',
    ],
    whenNotToUse: [
      {
        text: 'The judgement has more than one dimension.',
        instead: 'several ratings with their own labels, or a short Form',
        to: '#/form',
      },
      {
        text: 'You need to know why.',
        instead: 'a Textarea after the rating — the score tells you nothing actionable on its own',
        to: '#/textarea',
      },
      {
        text: 'The value is a measured quantity rather than an opinion.',
        instead: 'a Progress Indicator or a Chart',
        to: '#/progress-indicator',
      },
      {
        text: 'The answer is binary.',
        instead: 'thumbs up/down as two Buttons — five stars for a yes/no question is noise',
        to: '#/button',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Read-only ratings are not controls.</strong> A five-star display beside a product
          title should be one image with one label — "4.2 out of 5" — not five focusable buttons.
          Making it interactive puts five tab stops in a card that has one real action, and
          screen-reader users hear a form control that does nothing.
        </p>
        <p>
          The interactive form is a <strong>radio group</strong>: one value, mutually exclusive
          options, one tab stop with arrow keys inside. Five independent buttons is the wrong
          model and it announces wrongly — "3 stars, button" instead of "3 of 5, selected".
        </p>
        <p>
          Every star needs a <strong>word beside it</strong>. Your "3" and mine differ by half a
          point, but "Good" is the same for both of us. The label also makes the score
          comprehensible to anyone who cannot see how many stars are filled.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'input-vs-output',
        title: 'Input and output are different components',
        description:
          'The same shape doing two jobs. One is a radiogroup with a tab stop; the other is an image with a label and no focus at all.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Interactive" sub="radiogroup · 1 tab stop" tone="good">
                <Rating label="Rate this" value={4} onChange={() => {}} />
              </Cell>
              <Cell label="Read only" sub="role=img · no tab stops" tone="good">
                <Row gap="sm" align="center">
                  <Rating label="Average rating" value={4.2} readOnly />
                  <span className="text-body-sm text-[var(--ds-fg-secondary)]">
                    4.2 <span className="text-[var(--ds-fg-muted)]">(1,284)</span>
                  </span>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'labels',
        title: 'Words make the scale mean something',
        description:
          'Without the label, your 3 and mine are different scores. With it, both of us mean “Good” — and the meaning survives for anyone not counting filled stars.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm">
              {[1, 2, 3, 4, 5].map((v) => (
                <Row key={v} gap="sm" align="center">
                  <Rating label={`Example ${v}`} value={v} readOnly size="sm" />
                  <span className="text-body-sm text-[var(--ds-fg-secondary)]">{LABELS[v]}</span>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'aggregate',
        title: 'Aggregates need the count',
        description:
          'A 5.0 from one person and a 4.6 from nine hundred are not comparable. The count is what makes an average mean anything.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="With count" tone="good">
                <Row gap="sm" align="center">
                  <Rating label="Rating" value={4.6} readOnly size="sm" />
                  <span className="text-body-sm text-[var(--ds-fg)]">4.6</span>
                  <span className="text-caption text-[var(--ds-fg-muted)]">from 912 reviews</span>
                </Row>
              </Cell>
              <Cell label="Without" tone="bad">
                <Row gap="sm" align="center">
                  <Rating label="Rating" value={5} readOnly size="sm" />
                  <span className="text-body-sm text-[var(--ds-fg)]">5.0</span>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'Small for a table row or a card, medium for a form, large when the rating is the question the page is asking.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="items-start">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <Rating key={s} label={`Size ${s}`} value={4} readOnly size={s} />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Empty', render: <Rating label="a" value={0} onChange={() => {}} size="sm" /> },
      { label: 'Rated', render: <Rating label="b" value={4} onChange={() => {}} size="sm" /> },
      { label: 'Full', render: <Rating label="c" value={5} onChange={() => {}} size="sm" /> },
      { label: 'Fractional', render: <Rating label="d" value={4.2} readOnly size="sm" /> },
      { label: 'Read only', render: <Rating label="e" value={3} readOnly size="sm" /> },
      { label: 'Small', render: <Rating label="f" value={4} readOnly size="sm" /> },
      { label: 'Large', render: <Rating label="g" value={4} readOnly size="lg" /> },
      {
        label: 'Focus',
        render: (
          <span className="inline-flex rounded-[var(--radius-xs)] p-0.5 text-[var(--ds-warning)] outline-2 outline-offset-1 outline-[var(--ds-focus-ring)]">
            <Star size={20} fill="currentColor" />
          </span>
        ),
      },
      {
        label: 'With label',
        render: (
          <Row gap="sm" align="center">
            <Rating label="h" value={4} readOnly size="sm" />
            <span className="text-body-sm text-[var(--ds-fg-secondary)]">Very good</span>
          </Row>
        ),
      },
      {
        label: 'Not rated',
        render: (
          <Row gap="sm" align="center">
            <Rating label="i" value={0} readOnly size="sm" />
            <span className="text-caption text-[var(--ds-fg-muted)]">No ratings yet</span>
          </Row>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Row gap="sm" align="center">
        <Rating label="Anatomy" value={4} onChange={() => {}} />
        <span className="text-body-sm text-[var(--ds-fg-secondary)]">Very good</span>
      </Row>
    ),
    caption:
      'Five symbols in one radiogroup, a filled colour that is not the accent, and the word that fixes the meaning of the number.',
    parts: [
      {
        n: 1,
        label: 'Symbol size',
        value: '14 / 20 / 28px',
        kind: 'size',
        note: 'Below 14px the fill state stops being legible at a glance, which is the only thing the symbol has to communicate.',
      },
      {
        n: 2,
        label: 'Gap',
        value: '4px',
        kind: 'space',
        note: 'Tight enough that five stars read as one value, wide enough that adjacent targets are not mis-tapped.',
      },
      {
        n: 3,
        label: 'Filled colour',
        value: '--ds-warning',
        kind: 'color',
        note: 'Deliberately not the accent. A rating is not a primary action, and amber is the colour users already associate with a score.',
      },
      {
        n: 4,
        label: 'Empty colour',
        value: '--ds-border-strong',
        kind: 'color',
        note: 'Outlined, not hidden. The unfilled stars are what make "4 of 5" readable rather than "4 stars".',
      },
      {
        n: 5,
        label: 'Text label',
        value: 'Beside, body-sm',
        kind: 'type',
        note: 'The part that makes the score portable between people. It updates live as the user hovers or arrows.',
      },
      {
        n: 6,
        label: 'Hit area',
        value: '44px on touch',
        kind: 'space',
        note: 'Padding, not a bigger symbol. On a phone, five 20px targets 4px apart is a coin flip between two scores.',
      },
      {
        n: 7,
        label: 'Fractional fill',
        value: 'Clipped overlay',
        kind: 'shape',
        note: 'Read-only only. A user cannot deliberately choose 4.2, so fractional fills belong to aggregates and never to input.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-warning', usedFor: 'Filled symbol' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Empty symbol outline' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'The text label' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Review count and the not-rated state' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on the active symbol' },
    { category: 'spacing', token: '--space-1', value: '4px', usedFor: 'Gap between symbols' },
    { category: 'spacing', token: 'touch padding', value: '12px', usedFor: 'Grows each target to 44px on coarse pointers' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Focus target corners' },
    { category: 'typography', token: '--text-body-sm', value: '13px', usedFor: 'The label beside the symbols' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover fill transition' },
  ],

  sizes: [
    { name: 'Small', icon: '14px', gap: '4px', use: 'Table rows, card metadata, search results. Read-only in practice.' },
    { name: 'Medium', icon: '20px', gap: '4px', touch: '44px padded', use: 'The default for collecting a rating in a form.' },
    { name: 'Large', icon: '28px', gap: '6px', touch: '44px padded', use: 'When the rating is the question the page is asking.' },
    { name: 'Label', type: '13px', gap: '8px from the symbols', use: 'Always present in the interactive form.' },
    { name: 'Count', type: '12px', use: 'Beside the average. An aggregate without a count is not comparable to anything.' },
  ],

  do: [
    {
      title: 'Make the read-only version a single image',
      why: 'Five buttons in a product card is five tab stops for something nobody can click. role="img" with one label is the whole component.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="img" aria-label="4.2 out of 5"
        </code>
      ),
    },
    {
      title: 'Use a radiogroup for the interactive version',
      why: 'One value, mutually exclusive, one tab stop with arrows inside. Five independent buttons announce as five unrelated controls.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="radiogroup" → role="radio" aria-checked
        </code>
      ),
    },
    {
      title: 'Put a word beside the number',
      why: 'Your 3 and mine differ by half a point. "Good" is the same for both of us, and it works for anyone not counting filled shapes.',
      render: (
        <Row gap="sm" align="center">
          <Rating label="labelled" value={3} readOnly size="sm" />
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">Good</span>
        </Row>
      ),
    },
    {
      title: 'Show the count with any average',
      why: 'A 5.0 from one person and a 4.6 from nine hundred are not the same claim, and the stars alone cannot tell them apart.',
      render: (
        <Row gap="sm" align="center">
          <Rating label="counted" value={4.6} readOnly size="sm" />
          <span className="text-caption text-[var(--ds-fg-muted)]">4.6 from 912 reviews</span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not make a display rating focusable',
      why: 'Five tab stops in a card with one real action, and a screen reader announcing a form control that does nothing when activated.',
      render: (
        <Row gap="sm">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className="rounded-[var(--radius-xs)] p-0.5 text-[var(--ds-warning)] outline-1 outline-dashed outline-[var(--ds-danger-border)]"
            >
              <Star size={14} fill={v <= 4 ? 'currentColor' : 'none'} />
            </span>
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not allow half stars on input',
      why: 'Nobody deliberately means 3.5 rather than 3 or 4, and hitting a 10px half-target on a phone is chance. Fractions belong to aggregates.',
      render: (
        <Row gap="sm" align="center">
          <Rating label="half" value={3.5} readOnly />
          <span className="text-caption text-[var(--ds-danger-text)]">10px targets</span>
        </Row>
      ),
    },
    {
      title: 'Do not use five stars for a yes/no question',
      why: 'It asks for precision the user does not have and cannot express. Two buttons collect the same signal with no ambiguity.',
      render: (
        <Stack gap="xs" className="items-start">
          <span className="text-caption text-[var(--ds-fg-muted)]">Was this article helpful?</span>
          <Rating label="binary" value={0} onChange={() => {}} size="sm" />
        </Stack>
      ),
    },
    {
      title: 'Do not collect a score with no way to explain it',
      why: 'A wall of 2s tells you something is wrong and nothing about what. One optional text field after the rating is where the actual information is.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          ★★☆☆☆ → submitted → no follow-up field
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Filled and empty symbols must differ by more than colour. The fill itself is the second signal, which is why empty stars are outlined rather than a paler amber.',
      'The empty outline owes 3:1 against the background — it defines the scale’s length.',
      'The text label owes 4.5:1, and it is what carries the meaning when the symbols cannot be seen at all.',
      'In forced-colors mode the fill collapses. Provide a border or shape difference so filled and empty stay distinguishable.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Enters the group once, on the current value. One stop for the whole rating.' },
      { keys: '← / ↓', does: 'Decreases by one. → / ↑ increases.' },
      { keys: 'Home / End', does: 'Jumps to the lowest or highest rating.' },
      { keys: 'Space / Enter', does: 'Selects the focused rating. Pressing the current value again clears it, which is the only way to undo a mis-click.' },
      { keys: '1–5', does: 'Optional direct entry. Cheap to add and the fastest path for anyone who knows their answer.' },
    ],
    aria: [
      { attr: 'role="radiogroup"', on: 'The interactive container', note: 'With aria-label naming what is being rated. Five buttons is the wrong model and announces wrongly.' },
      { attr: 'role="radio" + aria-checked', on: 'Each symbol', note: 'With a label like "3 of 5 — Good". A bare "3" is meaningless read aloud.' },
      { attr: 'role="img"', on: 'The read-only version', note: 'With one aria-label — "4.2 out of 5, from 912 reviews" — and the symbols aria-hidden.' },
      { attr: 'aria-live="polite"', on: 'The text label', note: 'So the word updates audibly as the user arrows through the scale.' },
      { attr: 'aria-hidden', on: 'The individual symbols in read-only mode', note: 'They are decoration once the group carries the label.' },
    ],
    focus:
      'Roving tabindex across the group: only the current value is tabbable. After selection focus stays on the chosen symbol so the user can immediately adjust — moving focus to the next field on selection removes the chance to correct.',
    screenReader: [
      'The interactive group announces as "Deployment experience, radio group" then "4 of 5 — Very good, selected".',
      'The read-only version announces as one string: "4.2 out of 5, from 912 reviews". Never as five separate images.',
      'Announce the word, not just the number, when the value changes. "Very good" is more informative than "4" and takes no longer to say.',
    ],
    touch:
      'Five 20px targets 4px apart is a coin flip on a phone. Add padding to reach 44px per symbol — the symbols stay the same size, the targets grow and overlap the gaps. Do not implement drag-across-to-rate: it conflicts with page scrolling and gives no way to confirm the value before releasing.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Rating } from '@/ui/Input'

// Interactive: a radiogroup, with the word that fixes the meaning.
<Field label="How was your deployment experience?">
  <Row>
    <Rating
      label="Deployment experience"
      value={score}
      onChange={setScore}
    />
    <span aria-live="polite">{LABELS[score] ?? 'Not rated'}</span>
  </Row>
</Field>

{/* The score alone tells you something is wrong and nothing about what. */}
{score > 0 && score <= 3 && (
  <Field label="What went wrong?" optional>
    <Textarea rows={3} />
  </Field>
)}

// Read-only: one image, one label, zero tab stops.
<span role="img" aria-label={\`\${avg} out of 5, from \${count} reviews\`}>
  {Array.from({ length: 5 }, (_, i) => (
    <Star key={i} aria-hidden fill={fillFor(avg, i)} />
  ))}
</span>

// Fractional fill for aggregates: clip an overlay rather than swapping icons.
function PartialStar({ fill }: { fill: number }) {
  return (
    <span className="relative">
      <Star className="text-[var(--ds-border-strong)]" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: \`\${fill * 100}%\` }}>
        <Star className="text-[var(--ds-warning)]" fill="currentColor" />
      </span>
    </span>
  )
}`,
    },
    html: {
      lang: 'html',
      code: `<!-- Interactive: one value, one tab stop, arrows inside. -->
<div role="radiogroup" aria-label="Deployment experience">
  <button type="button" role="radio" aria-checked="false" tabindex="-1"
          aria-label="1 of 5 — Poor">★</button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1"
          aria-label="2 of 5 — Fair">★</button>
  <button type="button" role="radio" aria-checked="true"  tabindex="0"
          aria-label="3 of 5 — Good">★</button>
</div>
<p role="status" aria-live="polite">Good</p>

<!-- Read-only: NOT five buttons. One image, one label. -->
<span role="img" aria-label="4.2 out of 5, from 912 reviews">
  <svg aria-hidden="true">…</svg>
  <svg aria-hidden="true">…</svg>
  <svg aria-hidden="true">…</svg>
  <svg aria-hidden="true">…</svg>
  <svg aria-hidden="true">…</svg>
</span>`,
    },
    css: {
      lang: 'css',
      code: `.ds-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ds-rating button {
  padding: 2px;
  border-radius: var(--radius-xs);
  color: var(--ds-border-strong);    /* empty: outlined, 3:1, still visible */
  transition: color 120ms;
}

.ds-rating button[aria-checked='true'],
.ds-rating button[data-active='true'] {
  color: var(--ds-warning);          /* not the accent: this is not an action */
}

/* Fill is the second signal, so filled/empty survives greyscale. */
.ds-rating svg[data-filled='true'] { fill: currentColor; }

/* The symbols stay 20px; the TARGETS grow to 44px and swallow the gaps. */
@media (pointer: coarse) {
  .ds-rating button { padding: 12px; margin: -12px; }
  .ds-rating { gap: 28px; }
}

/* Colour collapses in forced-colors: keep a shape difference. */
@media (forced-colors: active) {
  .ds-rating button[aria-checked='true'] { forced-color-adjust: none; }
}

.ds-rating__partial { position: relative; display: inline-block; }
.ds-rating__partial > .fill {
  position: absolute;
  inset: 0;
  overflow: hidden;                  /* clip to the fraction */
  color: var(--ds-warning);
}`,
    },
    api: [
      {
        name: 'Rating',
        props: [
          { name: 'value', type: 'number', required: true, description: '0 means not rated, which must be distinguishable from 1.' },
          { name: 'onChange', type: '(v: number) => void', description: 'Omit for the read-only form, which renders as one image with no tab stops.' },
          { name: 'label', type: 'string', required: true, description: 'Names what is being rated. Becomes the group label or the image label.' },
          { name: 'max', type: 'number', default: '5', description: 'Five is the convention. Ten gives an illusion of precision nobody has.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Switches to role="img", removes every tab stop, and enables fractional fills.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Small is read-only in practice; its targets are too tight for input.' },
          { name: 'labels', type: 'string[]', description: 'The word per value. Strongly recommended — it is what makes the score portable.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Follow a low rating with an optional text field, shown conditionally. The score tells you something is wrong; the sentence tells you what.',
      'Let a user clear their rating by pressing the current value again. Without it, a mis-click is permanent and they will abandon the form.',
      'Round displayed averages to one decimal place. Two implies a precision that a five-point scale does not have.',
      'Show the distribution, not just the average, wherever there is room. A 3.0 made of 1s and 5s is a completely different product from a 3.0 made of 3s.',
      'Never pre-select a default. A pre-filled rating collects the default from everyone who does not notice it.',
    ],
    performance: [
      'Render read-only ratings as inline SVG rather than an icon component per star. In a list of two hundred products that is a thousand components for something that never changes.',
      'Memoise the fill calculation on the value. It runs once per symbol per render and is trivially cacheable.',
      'Submit optimistically and reconcile. A rating is low-stakes, and waiting for a round trip to show the star filled makes the control feel broken.',
    ],
    mistakes: [
      'Focusable stars in a read-only display, adding five tab stops per card.',
      'Five independent buttons instead of a radiogroup, announcing as unrelated controls.',
      'Half-star input, where a 10px target is chance rather than choice.',
      'No text label, so the number means something different to every person.',
      'An average with no count, which cannot be compared to anything.',
      'No way to clear a rating, making a mis-click permanent.',
      'Colour as the only difference between filled and empty, which disappears in greyscale and in forced-colors mode.',
    ],
    realWorld: [
      'Star ratings skew high almost everywhere — most distributions are bimodal at 5 and 1. Treat anything below 4 as a strong negative signal rather than a middling one.',
      'Response rates fall sharply as the scale grows. Five options collect more answers than ten, and the extra resolution is noise anyway.',
      'Asking immediately after an interaction gets several times the response rate of asking later. The rating belongs at the end of the flow, not in an email.',
      'For internal tools, thumbs up/down usually beats stars outright: the question is almost always "did this work?", which has two answers.',
    ],
  },
})
