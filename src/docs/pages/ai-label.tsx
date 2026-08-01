import * as React from 'react'
import { Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Popover } from '@/ui/Overlay'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function AiLabel({
  size = 'md',
  text = 'AI',
  explainer = true,
}: {
  size?: 'sm' | 'md'
  text?: string
  explainer?: boolean
}) {
  const chip = (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border font-medium',
        'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
        size === 'sm' ? 'h-[18px] px-1.5 text-[10px]' : 'h-[22px] px-2 text-[11px]',
      )}
    >
      <Sparkles size={size === 'sm' ? 9 : 11} aria-hidden />
      {text}
    </span>
  )

  if (!explainer) return chip

  return (
    <Popover
      align="start"
      width="17rem"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          // The label is the disclosure; the popover is how the user finds out
          // what it means. Both are required — a mark nobody can interrogate
          // tells them a fact they cannot act on.
          aria-label={`${text} generated — what does this mean?`}
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          {chip}
        </button>
      )}
    >
      <div className="flex flex-col gap-2.5 p-3.5">
        <Row gap="sm" align="center">
          <Sparkles size={13} className="text-[var(--ds-accent-text)]" />
          <span className="text-label text-[var(--ds-fg)]">AI-generated summary</span>
        </Row>
        <p className="text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
          Written by a language model from the deployment logs and the linked incident. It has not
          been reviewed by a person and may contain mistakes.
        </p>
        <Row gap="sm" align="center" className="border-t border-[var(--ds-border-subtle)] pt-2.5">
          <span className="flex-1 text-caption text-[var(--ds-fg-muted)]">Was this useful?</span>
          <IconButton size="sm" label="Yes, useful" icon={<ThumbsUp />} />
          <IconButton size="sm" label="No, not useful" icon={<ThumbsDown />} />
        </Row>
      </div>
    </Popover>
  )
}

function SummaryCard({ reviewed }: { reviewed?: boolean }) {
  return (
    <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
      <Row gap="sm" align="center" className="mb-2">
        <span className="flex-1 text-label text-[var(--ds-fg)]">Incident summary</span>
        {reviewed ? (
          <Badge tone="success" size="sm">
            Reviewed by Ada
          </Badge>
        ) : (
          <AiLabel />
        )}
      </Row>
      <p className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
        The health check failed in eu-west-2 at 14:32 after the connection pool saturated. The
        retry budget was exhausted before the circuit opened, so requests queued rather than
        failing fast. Rolling back to build 4019 restored the service in about eight seconds.
      </p>
      <Row gap="sm" align="center" className="mt-3">
        <Button size="sm" variant="outlined">
          View the logs
        </Button>
        {!reviewed && (
          <span className="text-caption text-[var(--ds-fg-muted)]">Check before relying on it</span>
        )}
      </Row>
    </div>
  )
}

function Playground() {
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [explainer, setExplainer] = React.useState(true)
  const [reviewed, setReviewed] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={explainer} onChange={setExplainer} label="Explainer" />
          <KnobToggle checked={reviewed} onChange={setReviewed} label="Human reviewed" />
        </div>
      }
      code={`<AiLabel
  size="${size}"
  provenance="Generated from the deployment logs and the linked incident."
  reviewed={${reviewed}}
  onFeedback={record}
/>`}
    >
      <Stack gap="md" className="w-full max-w-md">
        <Row gap="lg" align="center">
          <AiLabel size={size} explainer={explainer} />
          <span className="text-caption text-[var(--ds-fg-muted)]">
            {explainer ? 'Press it — the explainer is the point' : 'Static mark, no explainer'}
          </span>
        </Row>
        <SummaryCard reviewed={reviewed} />
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'ai-label',
    title: 'AI Label',
    tagline:
      'Disclosing that content was generated or assisted by a model, and giving the reader a way to find out how.',
    keywords: ['ai badge', 'ai slug', 'generated by ai', 'disclosure', 'provenance', 'transparency', 'sparkle'],
  },

  overview: {
    purpose:
      'An AI label marks content a model produced, so the reader can calibrate how much to trust it. It is a disclosure, not a feature badge — the point is not that the product has AI, it is that this particular paragraph, summary or suggestion was not written by a person and may be wrong in ways human writing is not.',
    whenToUse: [
      'Generated prose: summaries, descriptions, draft replies, release notes.',
      'Model-produced structure: extracted fields, suggested tags, categorisations.',
      'Predictions and rankings presented as fact — a risk score, an anomaly flag.',
      'Anywhere a reader might otherwise assume a person wrote or checked it.',
    ],
    whenNotToUse: [
      {
        text: 'A person wrote it, with a model only assisting.',
        instead: 'nothing — the human is the author, and over-labelling dilutes the mark',
        to: '#/badge',
      },
      {
        text: 'It is ordinary automation with deterministic output.',
        instead: 'nothing — a sort, a filter or a template is not AI and labelling it is noise',
        to: '#/badge',
      },
      {
        text: 'You are advertising a feature.',
        instead: 'a Badge or product copy — a disclosure mark used for marketing stops being read as a disclosure',
        to: '#/badge',
      },
      {
        text: 'Everything on the surface is generated.',
        instead: 'one region-level disclosure — a label per paragraph becomes wallpaper',
        to: '#/banner',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The label is the start of the disclosure, not the whole of it.</strong> "AI"
          tells the reader something happened; it does not say what the model saw, whether a person
          checked it, or how confident it is. The explainer behind the mark is what makes the
          disclosure actionable rather than decorative.
        </p>
        <p>
          <strong>Consistency is what makes it mean anything.</strong> One mark, one place, one
          wording, everywhere. The moment a product uses a sparkle for "AI wrote this" in one place
          and "try our new AI feature" in another, the mark stops carrying information and the
          reader stops looking at it.
        </p>
        <p>
          Human review changes the claim entirely, so it changes the mark. "AI-generated" and
          "AI-drafted, reviewed by Ada" are different statements about who is accountable, and
          collapsing them into one badge misrepresents both.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'explainer',
        title: 'The explainer is the point',
        description:
          'The mark says something happened; the popover says what. Provenance, review status, and a way to report that it got something wrong.',
        render: (
          <PreviewStage minHeight={280} center={false}>
            <Stack gap="sm" className="w-full max-w-md">
              <AiLabel />
              <span className="text-caption text-[var(--ds-fg-muted)]">
                Press the label to open the explainer.
              </span>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'review',
        title: 'Review status changes the claim',
        description:
          '"AI-generated" and "AI-drafted, reviewed by Ada" say different things about who is accountable. One badge for both misrepresents each of them.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Unreviewed" tone="good">
                <SummaryCard />
              </Cell>
              <Cell label="Reviewed" tone="good">
                <SummaryCard reviewed />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'placement',
        title: 'Where it goes',
        description:
          'Beside the heading of the region it applies to, not floating in the corner of the page. Its scope should be obvious from its position alone.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Scoped" tone="good">
                <Stack gap="sm">
                  <Row gap="sm" align="center">
                    <span className="flex-1 text-label text-[var(--ds-fg)]">Summary</span>
                    <AiLabel size="sm" explainer={false} />
                  </Row>
                  <p className="text-caption text-[var(--ds-fg-muted)]">Generated paragraph…</p>
                  <Row gap="sm" align="center">
                    <span className="flex-1 text-label text-[var(--ds-fg)]">Logs</span>
                  </Row>
                  <p className="text-caption text-[var(--ds-fg-muted)]">Raw log output…</p>
                </Stack>
              </Cell>
              <Cell label="Unscoped" sub="Which part?" tone="bad">
                <Stack gap="sm">
                  <Row gap="sm" align="center">
                    <span className="flex-1 text-label text-[var(--ds-fg)]">Deployment 4021</span>
                    <AiLabel size="sm" explainer={false} />
                  </Row>
                  <p className="text-caption text-[var(--ds-fg-muted)]">Generated paragraph…</p>
                  <p className="text-caption text-[var(--ds-fg-muted)]">Raw log output…</p>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'density',
        title: 'One per region, not one per sentence',
        description:
          'A label on every generated element becomes wallpaper and stops being read. Disclose at the region level and say so once.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Once" tone="good">
                <Stack gap="xs">
                  <Row gap="sm" align="center">
                    <span className="flex-1 text-label-sm text-[var(--ds-fg)]">Suggested tags</span>
                    <AiLabel size="sm" explainer={false} />
                  </Row>
                  <Row gap="sm">
                    {['infra', 'rollback', 'eu-west-2'].map((t) => (
                      <Badge key={t} tone="neutral" size="sm">
                        {t}
                      </Badge>
                    ))}
                  </Row>
                </Stack>
              </Cell>
              <Cell label="Per item" tone="bad">
                <Row gap="sm">
                  {['infra', 'rollback', 'eu-west-2'].map((t) => (
                    <Row key={t} gap="sm" align="center">
                      <Badge tone="neutral" size="sm">
                        {t}
                      </Badge>
                      <AiLabel size="sm" explainer={false} />
                    </Row>
                  ))}
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <AiLabel explainer={false} /> },
      { label: 'Small', render: <AiLabel size="sm" explainer={false} /> },
      { label: 'Worded', render: <AiLabel text="AI-generated" explainer={false} /> },
      { label: 'Interactive', render: <AiLabel /> },
      {
        label: 'Reviewed',
        render: (
          <Badge tone="success" size="sm">
            Reviewed by Ada
          </Badge>
        ),
      },
      {
        label: 'Draft',
        render: (
          <Badge tone="warning" size="sm">
            AI draft — unreviewed
          </Badge>
        ),
      },
      {
        label: 'Inline',
        render: (
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">
            Summary <AiLabel size="sm" explainer={false} />
          </span>
        ),
      },
      {
        label: 'Explainer',
        render: (
          <span className="block w-44 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-2.5 text-caption text-[var(--ds-fg-secondary)]">
            Written by a model from the deployment logs. Not reviewed by a person.
          </span>
        ),
      },
      {
        label: 'Feedback',
        render: (
          <Row gap="sm">
            <IconButton size="sm" label="Useful" icon={<ThumbsUp />} />
            <IconButton size="sm" label="Not useful" icon={<ThumbsDown />} />
          </Row>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Stack gap="md" className="w-full max-w-md">
        <AiLabel />
        <SummaryCard />
      </Stack>
    ),
    caption:
      'A pill carrying a sparkle and a word, pressable, opening an explainer with provenance, review status and a feedback control.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '22px (18px small)',
        kind: 'size',
        note: 'Badge scale. It sits beside a heading without competing with it — a disclosure should be visible and quiet at the same time.',
      },
      {
        n: 2,
        label: 'Glyph',
        value: '11px sparkle',
        kind: 'shape',
        note: 'The sparkle has become the shared convention across the industry. Inventing a different symbol costs recognition for no gain.',
      },
      {
        n: 3,
        label: 'Word',
        value: '"AI" or "AI-generated"',
        kind: 'type',
        note: 'The glyph alone is not a disclosure. Space permitting, spell it out — "AI-generated" is unambiguous where a sparkle is not.',
      },
      {
        n: 4,
        label: 'Tone',
        value: 'Accent, not status',
        kind: 'color',
        note: 'Accent-tinted. Using a status colour would claim the content is good, bad or risky, which the label is not saying.',
      },
      {
        n: 5,
        label: 'Pressable',
        value: 'Opens the explainer',
        kind: 'motion',
        note: 'What turns a mark into a disclosure. A label that cannot be interrogated tells the reader a fact they cannot act on.',
      },
      {
        n: 6,
        label: 'Explainer',
        value: 'Provenance + review + feedback',
        kind: 'space',
        note: 'What the model saw, whether a person checked it, and a way to report that it got something wrong.',
      },
      {
        n: 7,
        label: 'Placement',
        value: 'Beside the region heading',
        kind: 'space',
        note: 'Its scope should be readable from its position. A mark floating in a page corner labels nothing in particular.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Label fill' },
    { category: 'color', token: '--ds-accent-border', usedFor: 'Label border' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Label text and sparkle' },
    { category: 'color', token: '--ds-success-subtle', usedFor: 'A human-reviewed variant' },
    { category: 'color', token: '--ds-warning-subtle', usedFor: 'An unreviewed draft, where the risk is worth marking' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'The explainer panel' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Explainer body text' },
    { category: 'spacing', token: 'padding-x', value: '8px', usedFor: 'Label padding' },
    { category: 'radius', token: 'full', usedFor: 'Pill shape, shared with Badge' },
    { category: 'typography', token: '11px / 500', usedFor: 'Label text' },
  ],

  sizes: [
    { name: 'Small', height: '18px', padding: '0 6px', icon: '9px', type: '10px', use: 'Inline in a table cell or beside a small heading.' },
    { name: 'Medium', height: '22px', padding: '0 8px', icon: '11px', type: '11px', touch: '44px when pressable', use: 'The default. Beside a section or card heading.' },
    { name: 'Explainer', minWidth: '15rem', maxWidth: '18rem', use: 'Provenance, review status and feedback. Short enough to read in one pass.' },
    { name: 'Region banner', minWidth: '100%', use: 'When a whole view is generated, one Banner at the top beats a label per element.' },
  ],

  do: [
    {
      title: 'Make the label open an explainer',
      why: 'The mark says something happened. The explainer says what the model saw and whether anyone checked it — which is the part the reader can act on.',
      render: <AiLabel />,
    },
    {
      title: 'Spell it out where there is room',
      why: 'A sparkle alone is not a disclosure. "AI-generated" is unambiguous; a glyph relies on the reader already knowing the convention.',
      render: (
        <Row gap="sm">
          <AiLabel text="AI-generated" explainer={false} />
          <AiLabel explainer={false} />
        </Row>
      ),
    },
    {
      title: 'Distinguish reviewed from unreviewed',
      why: 'They are different claims about who is accountable. Collapsing them into one badge overstates the unreviewed case and undersells the reviewed one.',
      render: (
        <Row gap="sm">
          <AiLabel explainer={false} />
          <Badge tone="success" size="sm">
            Reviewed by Ada
          </Badge>
        </Row>
      ),
    },
    {
      title: 'Collect feedback in the explainer',
      why: 'The moment a reader notices something wrong is the moment they will report it. Anywhere else and the report never happens.',
      render: (
        <Row gap="sm" align="center">
          <span className="text-caption text-[var(--ds-fg-muted)]">Was this useful?</span>
          <IconButton size="sm" label="Yes" icon={<ThumbsUp />} />
          <IconButton size="sm" label="No" icon={<ThumbsDown />} />
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use it as a feature badge',
      why: 'A disclosure mark used for marketing stops being read as a disclosure. Once "AI" means "new feature" in one place, it means nothing anywhere.',
      render: (
        <Row gap="sm" align="center">
          <span className="text-label text-[var(--ds-fg)]">Deploy faster</span>
          <span className="rounded-full border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] px-2 py-0.5 text-[11px] text-[var(--ds-danger-text)]">
            ✨ Now with AI
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not label every element',
      why: 'A mark on each of twelve suggested tags is twelve marks nobody reads. Disclose once at the region level and say what it covers.',
      render: (
        <Row gap="sm">
          {['infra', 'rollback', 'eu-west-2'].map((t) => (
            <Row key={t} gap="sm" align="center">
              <Badge tone="neutral" size="sm">
                {t}
              </Badge>
              <AiLabel size="sm" explainer={false} />
            </Row>
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not use a status colour',
      why: 'Green claims the content is good and amber claims it is risky. The label is saying who produced it, not whether it is right.',
      render: (
        <Row gap="sm">
          <span className="rounded-full border border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)] px-2 py-0.5 text-[11px] text-[var(--ds-success-text)]">
            ✨ AI
          </span>
          <span className="rounded-full border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] px-2 py-0.5 text-[11px] text-[var(--ds-danger-text)]">
            ✨ AI
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not hide it in a tooltip',
      why: 'Hover does not exist on touch, and a disclosure that half your users cannot reach is not a disclosure. The mark itself must be visible.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          summary text with a hover-only “generated” hint
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The label text owes 4.5:1 at 11px. It is a disclosure, and small quiet text is exactly where that gets skipped.',
      'The word carries the meaning, never the sparkle or the tint alone — colour-only disclosure fails 1.4.1 outright.',
      'The border owes 3:1: it is what separates the label from the heading beside it.',
      'The reviewed and unreviewed variants must differ by wording as well as colour.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the label when it opens an explainer. A static mark is not focusable.' },
      { keys: 'Enter / Space', does: 'Opens the explainer and moves focus into it.' },
      { keys: 'Esc', does: 'Closes it and returns focus to the label.' },
      { keys: 'Tab', does: 'Reaches the feedback controls inside the explainer.' },
    ],
    aria: [
      { attr: 'aria-label', on: 'The pressable label', note: '"AI generated — what does this mean?". A bare "AI" announces two letters with no context.' },
      { attr: 'aria-hidden', on: 'The sparkle', note: 'Decoration. The word is the disclosure.' },
      { attr: 'aria-haspopup="dialog"', on: 'The label', note: 'With aria-expanded, so the explainer is discoverable rather than a surprise.' },
      { attr: 'aria-describedby', on: 'The labelled region', note: 'Pointing at the disclosure, so the provenance is announced with the content rather than only beside it.' },
      { attr: 'role="note"', on: 'A region-level disclosure', note: 'For a banner covering a whole generated view.' },
    ],
    focus:
      'A static label is not focusable; a pressable one is a real button that returns focus on close. In a list of generated items, the label must not become a tab stop per row — disclose once for the region instead.',
    screenReader: [
      'The disclosure must be announced with the content it applies to, not left as a visual mark beside it. aria-describedby on the region is what does that.',
      'Announce the scope: "AI-generated summary" tells the user which part; "AI" tells them nothing.',
      'Never rely on the sparkle. It is decorative and aria-hidden; the word is the entire disclosure for a non-visual reader.',
    ],
    touch:
      'A pressable label needs a 44px target, which means padding around a 22px pill rather than a larger pill. Hover-only disclosure does not exist on touch, so the mark itself must always be visible — and on a phone the explainer is usually better as a bottom Drawer than as a floating panel.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { AiLabel } from '@/ui/Display'

// The label opens the explainer — that is what makes it a disclosure rather
// than a decoration.
<Row>
  <h3>Incident summary</h3>
  <AiLabel
    provenance="Written from the deployment logs and the linked incident."
    reviewed={summary.reviewedBy}
    onFeedback={(useful) => track('ai_feedback', { id: summary.id, useful })}
  />
</Row>

// The disclosure must be announced WITH the content, not merely beside it.
<section aria-describedby="ai-disclosure">
  <p id="ai-disclosure" className="sr-only">
    This summary was generated by a language model and has not been reviewed.
  </p>
  <p>{summary.text}</p>
</section>

// Review status is a different claim about who is accountable.
{summary.reviewedBy ? (
  <Badge tone="success">Reviewed by {summary.reviewedBy}</Badge>
) : (
  <AiLabel />
)}

// One disclosure per region. Twelve labels on twelve suggested tags is
// twelve marks nobody reads.
<Row>
  <h4>Suggested tags</h4>
  <AiLabel size="sm" />
</Row>
{tags.map((t) => <Badge key={t}>{t}</Badge>)}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-section">
  <h3 id="summary-heading">Incident summary</h3>

  <!-- The sparkle is decoration; the word is the disclosure. -->
  <button
    type="button"
    class="ds-ai-label"
    aria-label="AI generated — what does this mean?"
    aria-haspopup="dialog"
    aria-expanded="false"
  >
    <svg aria-hidden="true">…</svg>
    AI
  </button>

  <!-- Announced WITH the content, not merely beside it. -->
  <p id="ai-disclosure" class="sr-only">
    This summary was generated by a language model and has not been
    reviewed by a person.
  </p>

  <p aria-describedby="ai-disclosure">
    The health check failed in eu-west-2 at 14:32…
  </p>
</div>

<div role="dialog" aria-label="AI-generated summary">
  <p>Written by a language model from the deployment logs.</p>
  <button type="button">Useful</button>
  <button type="button">Not useful</button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-ai-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  block-size: 22px;                  /* badge scale: visible and quiet */
  padding-inline: 8px;
  border: 1px solid var(--ds-accent-border);
  border-radius: 999px;
  /* Accent, never a status colour: green would claim the content is good,
     amber that it is risky. The label says neither. */
  background: var(--ds-accent-subtle);
  color: var(--ds-accent-text);
  font-size: 11px;
  font-weight: 500;
}

.ds-ai-label:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Review status is a different claim, so it gets a different mark. */
.ds-ai-label--reviewed {
  border-color: var(--ds-success-border);
  background: var(--ds-success-subtle);
  color: var(--ds-success-text);
}

/* The tint is gone here, so the word and border must carry it alone. */
@media (forced-colors: active) {
  .ds-ai-label { border: 1px solid; }
}

/* Padding, not a bigger pill. */
@media (pointer: coarse) {
  .ds-ai-label { padding-block: 11px; margin-block: -11px; }
}`,
    },
    api: [
      {
        name: 'AiLabel',
        props: [
          { name: 'provenance', type: 'string', required: true, description: 'What the model was given and what it produced. This is the disclosure; the pill is the entry point.' },
          { name: 'reviewed', type: 'string | false', default: 'false', description: 'The reviewer’s name. A reviewed item is a different claim and gets a different mark.' },
          { name: 'text', type: 'string', default: "'AI'", description: '"AI-generated" wherever there is room. A glyph alone is not a disclosure.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Badge scale. Small for inline use in a table cell.' },
          { name: 'onFeedback', type: '(useful: boolean) => void', description: 'Collected in the explainer, where the reader already is when they notice a problem.' },
          { name: 'describes', type: 'string', description: 'The id of the region it applies to, so the disclosure is announced with the content.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the provenance in plain language. "Written from the deployment logs and the linked incident" is a real answer; "powered by advanced AI" is marketing.',
      'Keep one mark, one wording, one placement across the whole product. Consistency is what turns a badge into a signal.',
      'Link to the sources the model used where you can. Provenance the reader can check is worth far more than provenance they have to take on trust.',
      'Record feedback against the specific generation, not the feature. Aggregate thumbs-down tells you nothing about which output was wrong.',
      'Revisit the label when a human edits generated content. Once a person has changed it, they are the author, and the mark should reflect that.',
    ],
    performance: [
      'Render the label statically and mount the explainer only when it opens. A list of fifty generated rows should not carry fifty hidden popovers.',
      'One shared explainer instance re-pointed at the active label is enough — the content differs only by the provenance string.',
      'Do not animate the sparkle. A permanently shimmering disclosure reads as decoration, which is exactly what it must not be.',
    ],
    mistakes: [
      'Using the mark to advertise a feature, which destroys its meaning as a disclosure.',
      'A sparkle with no word, relying on a convention the reader may not know.',
      'A label per element instead of one per region.',
      'A status colour, claiming the content is good or risky.',
      'Hover-only disclosure, invisible on touch.',
      'No explainer, so the reader learns something happened but not what.',
      'Not distinguishing reviewed from unreviewed content.',
      'The disclosure visible but never announced, leaving screen-reader users unaware.',
    ],
    realWorld: [
      'Disclosure requirements are tightening in several jurisdictions. Building the mark and the provenance record now is far cheaper than retrofitting them across a product later.',
      'Users calibrate quickly once a product is consistent: they learn the mark, learn what it predicts about quality, and adjust their trust accordingly. That is the mechanism working.',
      'Over-labelling is the more common failure. A product that marks every ranked list and every autocomplete has trained its users to ignore the mark by the time it matters.',
      'The feedback control in the explainer is the highest-signal quality data most teams have. It arrives at the moment the reader noticed the problem, attached to the exact output.',
    ],
  },
})
