import * as React from 'react'
import { AlertCircle, Check, GitCommit, Rocket, RotateCcw, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Avatar, Badge } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

interface Event {
  id: string
  title: string
  meta: string
  detail?: string
  tone: 'neutral' | 'success' | 'danger' | 'accent'
  icon: React.ReactNode
}

const EVENTS: Event[] = [
  {
    id: '5',
    title: 'Rolled back to 4019',
    meta: 'Ada Lovelace · 14:34',
    detail: 'Health check failed in eu-west-2 after the connection pool saturated.',
    tone: 'danger',
    icon: <RotateCcw size={13} />,
  },
  {
    id: '4',
    title: 'Health check failed',
    meta: 'System · 14:32',
    tone: 'danger',
    icon: <AlertCircle size={13} />,
  },
  {
    id: '3',
    title: 'Deployed 4021 to production',
    meta: 'Ada Lovelace · 14:28',
    tone: 'success',
    icon: <Rocket size={13} />,
  },
  {
    id: '2',
    title: 'Build succeeded',
    meta: 'System · 14:26',
    tone: 'neutral',
    icon: <Check size={13} />,
  },
  {
    id: '1',
    title: 'Pushed 4021ab9 to main',
    meta: 'Grace Hopper · 14:24',
    tone: 'neutral',
    icon: <GitCommit size={13} />,
  },
]

const TONE = {
  neutral: 'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)]',
  success: 'border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]',
  danger: 'border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
  accent: 'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]',
} as const

function Timeline({
  events = EVENTS,
  compact,
  details = true,
  avatars,
}: {
  events?: Event[]
  compact?: boolean
  details?: boolean
  avatars?: boolean
}) {
  return (
    // An ordered list, because the order is the information. A stack of divs
    // announces nothing about sequence or count.
    <ol className="w-full">
      {events.map((e, i) => {
        const last = i === events.length - 1
        return (
          <li key={e.id} className="relative flex gap-3">
            {/* The connector is drawn behind the marker and stops at the last
                event — a line running past the end implies more to come. */}
            {!last && (
              <span
                aria-hidden
                className="absolute left-[11px] top-6 w-px bg-[var(--ds-border-subtle)]"
                style={{ bottom: 0 }}
              />
            )}

            <span
              aria-hidden
              className={cn(
                'relative z-10 grid h-[23px] w-[23px] shrink-0 place-items-center rounded-full border',
                TONE[e.tone],
              )}
            >
              {avatars && e.meta.startsWith('Ada') ? (
                <Avatar name="Ada Lovelace" size="xs" />
              ) : (
                e.icon
              )}
            </span>

            <span className={cn('flex min-w-0 flex-1 flex-col gap-0.5', compact ? 'pb-3' : 'pb-5')}>
              <span className="text-label text-[var(--ds-fg)]">{e.title}</span>
              <span className="text-caption text-[var(--ds-fg-muted)]">{e.meta}</span>
              {details && e.detail && (
                <span className="mt-1 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2.5 py-2 text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
                  {e.detail}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Stepper() {
  const STEPS = [
    { label: 'Build', state: 'done' as const },
    { label: 'Test', state: 'done' as const },
    { label: 'Deploy', state: 'current' as const },
    { label: 'Verify', state: 'todo' as const },
  ]
  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <ol className="flex w-full max-w-lg items-start">
        {STEPS.map((s, i) => (
          <li key={s.label} className="relative flex flex-1 flex-col items-center gap-2">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  'absolute right-1/2 top-[11px] h-px w-full',
                  s.state === 'todo' ? 'bg-[var(--ds-border-subtle)]' : 'bg-[var(--ds-accent)]',
                )}
              />
            )}
            <span
              aria-hidden
              className={cn(
                'relative z-10 grid h-[23px] w-[23px] place-items-center rounded-full border text-[11px] font-semibold',
                s.state === 'done'
                  ? 'border-[var(--ds-accent)] bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]'
                  : s.state === 'current'
                    ? 'border-[var(--ds-accent)] bg-[var(--ds-surface)] text-[var(--ds-accent-text)]'
                    : 'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)]',
              )}
            >
              {s.state === 'done' ? <Check size={13} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-caption',
                s.state === 'todo' ? 'text-[var(--ds-fg-muted)]' : 'text-[var(--ds-fg)]',
              )}
            >
              {s.label}
            </span>
            {s.state === 'current' && (
              <span className="sr-only-ds" aria-current="step">
                Current step
              </span>
            )}
          </li>
        ))}
      </ol>
    </PreviewStage>
  )
}

function Playground() {
  const [order, setOrder] = React.useState<'newest' | 'oldest'>('newest')
  const [details, setDetails] = React.useState(true)
  const [avatars, setAvatars] = React.useState(false)
  const [compact, setCompact] = React.useState(false)

  const events = order === 'newest' ? EVENTS : [...EVENTS].reverse()

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Order">
            <KnobSelect
              value={order}
              onChange={setOrder}
              options={['newest', 'oldest'] as const}
            />
          </Knob>
          <KnobToggle checked={details} onChange={setDetails} label="Details" />
          <KnobToggle checked={avatars} onChange={setAvatars} label="Avatars" />
          <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
        </div>
      }
      code={`<Timeline>
  {events.map((e) => (
    <TimelineItem
      key={e.id}
      icon={e.icon}
      tone={e.tone}
      title={e.title}
      meta={\`\${e.actor} · \${e.time}\`}${details ? '\n      detail={e.detail}' : ''}
    />
  ))}
</Timeline>`}
    >
      <div className="w-full max-w-md">
        <Timeline events={events} details={details} avatars={avatars} compact={compact} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'timeline',
    title: 'Timeline',
    tagline:
      'Ordered events on an axis — activity feeds, audit trails, release histories and step progress.',
    keywords: ['activity feed', 'event log', 'history', 'stepper', 'step indicator', 'audit', 'connector'],
  },

  overview: {
    purpose:
      'A timeline shows a sequence where the order is the point. The vertical line is not decoration — it is the claim that these events belong to one thread and happened in this order. That makes it the right container for an audit trail, a deployment history or a conversation, and the wrong one for anything the user might want to sort by something else.',
    whenToUse: [
      'Audit trails and activity feeds, where who did what when is the whole content.',
      'A deployment, order or delivery history attached to one object.',
      'Step progress through a known sequence — a stepper is a horizontal timeline.',
      'Release notes and changelogs, where chronology carries meaning.',
    ],
    whenNotToUse: [
      {
        text: 'The order does not matter or the user may re-sort.',
        instead: 'a List or a Data Table',
        to: '#/data-table',
      },
      {
        text: 'Events have several attributes to compare.',
        instead: 'a Data Table with a timestamp column',
        to: '#/data-table',
      },
      {
        text: 'It is a multi-step form.',
        instead: 'a Form with a step indicator — the timeline is the indicator, not the container',
        to: '#/form',
      },
      {
        text: 'There are only two or three events.',
        instead: 'a List — a connector between two items claims a sequence nobody needed',
        to: '#/list',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The connector is a claim.</strong> It says these events are one thread in one
          order. Drawing it between unrelated items — or past the last event, implying more to come
          — is a factual error the reader will believe. It stops at the final marker, always.
        </p>
        <p>
          Order is a decision you must make and state. Newest-first suits monitoring, where the
          user wants what just happened; oldest-first suits a story, where they want to follow it
          through. <strong>Never mix the two in one product</strong>, and never leave it ambiguous
          — a relative timestamp like "2 hours ago" does not reveal which way the list runs.
        </p>
        <p>
          Timestamps need <strong>both forms</strong>. "4 minutes ago" is what the user wants at a
          glance; the absolute time is what they need when comparing against a log or a
          screenshot. Put the relative form in the text and the absolute in a{' '}
          <code>title</code> and a <code>datetime</code> attribute.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'stepper',
        title: 'A stepper is a horizontal timeline',
        description:
          'The same anatomy rotated: markers, connectors and labels. Completed steps fill, the current one is ringed, and future steps stay outlined.',
        render: <Stepper />,
      },
      {
        id: 'tone',
        title: 'Markers carry the outcome',
        description:
          'The marker is where the status lives, so a failure is visible while scanning without reading a single line of text.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-sm">
              <Timeline compact details={false} />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'order',
        title: 'Pick an order and state it',
        description:
          'Newest-first for monitoring, oldest-first for a story. Ambiguity is the failure mode — relative timestamps alone do not reveal which way the list runs.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Newest first" sub="Monitoring" tone="good">
                <Timeline events={EVENTS.slice(0, 3)} compact details={false} />
              </Cell>
              <Cell label="Oldest first" sub="A story" tone="good">
                <Timeline events={[...EVENTS].reverse().slice(0, 3)} compact details={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'detail',
        title: 'Detail belongs in the event, not beside it',
        description:
          'An inset panel under the title keeps the explanation attached to the event that produced it. A second column would break the single axis.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-md">
              <Timeline events={EVENTS.slice(0, 2)} />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Neutral',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)]">
            <GitCommit size={13} />
          </span>
        ),
      },
      {
        label: 'Success',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]">
            <Check size={13} />
          </span>
        ),
      },
      {
        label: 'Failure',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]">
            <AlertCircle size={13} />
          </span>
        ),
      },
      {
        label: 'Current',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border-2 border-[var(--ds-accent)] bg-[var(--ds-surface)] text-[11px] font-semibold text-[var(--ds-accent-text)]">
            3
          </span>
        ),
      },
      {
        label: 'Done step',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-accent)] bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]">
            <Check size={13} />
          </span>
        ),
      },
      {
        label: 'Future step',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)] text-[11px] font-semibold text-[var(--ds-fg-muted)]">
            4
          </span>
        ),
      },
      {
        label: 'With avatar',
        render: (
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-border)] bg-[var(--ds-surface)]">
            <Avatar name="Ada Lovelace" size="xs" />
          </span>
        ),
      },
      {
        label: 'Connector',
        render: <span className="block h-8 w-px bg-[var(--ds-border-subtle)]" />,
      },
      {
        label: 'Group header',
        render: (
          <Badge tone="neutral" size="sm">
            Today
          </Badge>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Timeline events={EVENTS.slice(0, 3)} />
      </div>
    ),
    caption:
      'A marker per event carrying its outcome, a connector that stops at the last one, and a title with metadata beneath it.',
    parts: [
      {
        n: 1,
        label: 'Marker',
        value: '23px, 13px icon',
        kind: 'size',
        note: 'Odd-numbered so the 1px connector lands exactly on its centre. At 24px the line sits half a pixel off and looks bent.',
      },
      {
        n: 2,
        label: 'Connector',
        value: '1px, behind the marker',
        kind: 'shape',
        note: 'Drawn behind so it never crosses the marker’s fill. It stops at the last event — a line running past the end implies more to come.',
      },
      {
        n: 3,
        label: 'Gutter',
        value: '12px marker to text',
        kind: 'space',
        note: 'Fixed regardless of marker content, so an icon row and an avatar row share one text edge.',
      },
      {
        n: 4,
        label: 'Event gap',
        value: '20px (12px compact)',
        kind: 'space',
        note: 'Enough that events read as separate; tight enough that the connector still reads as continuous rather than as a series of dashes.',
      },
      {
        n: 5,
        label: 'Title',
        value: '13px, --ds-fg',
        kind: 'type',
        note: 'Past tense and specific: "Rolled back to 4019", not "Rollback". The timeline is a record of what happened.',
      },
      {
        n: 6,
        label: 'Metadata',
        value: 'Actor · time',
        kind: 'type',
        note: 'Who and when, in that order — the actor is what people scan for in an audit trail.',
      },
      {
        n: 7,
        label: 'Detail panel',
        value: 'Inset surface under the title',
        kind: 'space',
        note: 'Optional. Inside the event block, so the explanation stays attached to the event rather than becoming a second column.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-border-subtle', usedFor: 'The connector' },
    { category: 'color', token: '--ds-surface', usedFor: 'Marker fill for a neutral event' },
    { category: 'color', token: '--ds-success-subtle', usedFor: 'Marker fill for a success' },
    { category: 'color', token: '--ds-danger-subtle', usedFor: 'Marker fill for a failure' },
    { category: 'color', token: '--ds-accent', usedFor: 'A completed step and the connector behind it' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'The detail panel' },
    { category: 'color', token: '--ds-fg', usedFor: 'Event titles' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Actor and timestamp' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Marker to text gutter' },
    { category: 'spacing', token: '--space-5', value: '20px', usedFor: 'Gap between events' },
    { category: 'radius', token: 'full', usedFor: 'Markers' },
  ],

  sizes: [
    { name: 'Marker', height: '23px', icon: '13px', use: 'Odd-numbered, so a 1px connector lands on its exact centre.' },
    { name: 'Compact', gap: '12px between events', use: 'Long feeds and audit logs, where density beats breathing room.' },
    { name: 'Default', gap: '20px between events', use: 'The default. Enough separation to read events as distinct.' },
    { name: 'Gutter', gap: '12px', use: 'Marker to text. Fixed regardless of what the marker contains.' },
    { name: 'Detail panel', padding: '8px 10px', radius: '8px', use: 'Inside the event block, never as a second column.' },
    { name: 'Measure', maxWidth: '40rem', use: 'About 70 characters. A timeline stretched wide leaves the markers marooned from the text.' },
  ],

  do: [
    {
      title: 'Use an ordered list',
      why: 'The order is the information. An ol announces "list, 12 items" and preserves the sequence; a stack of divs conveys neither.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;ol&gt;&lt;li&gt;…&lt;/li&gt;&lt;/ol&gt;
        </code>
      ),
    },
    {
      title: 'Stop the connector at the last event',
      why: 'A line continuing past the final marker says there is more below. That is a factual claim, and if it is false the user keeps scrolling.',
      render: (
        <div className="w-40">
          <Timeline events={EVENTS.slice(0, 2)} compact details={false} />
        </div>
      ),
    },
    {
      title: 'Give both relative and absolute times',
      why: '"4 minutes ago" is what the user wants at a glance; the absolute time is what they need when comparing against a log or a screenshot.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;time datetime="2026-07-21T14:28:00Z"
          <br />
          &nbsp;&nbsp;title="21 July 2026, 14:28 UTC"&gt;4 minutes ago&lt;/time&gt;
        </code>
      ),
    },
    {
      title: 'Put the outcome in the marker',
      why: 'A failed event should be visible while scanning, before any text is read. The marker is the only element with a consistent position for that.',
      render: (
        <Row gap="sm">
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]">
            <Check size={13} />
          </span>
          <span className="grid h-[23px] w-[23px] place-items-center rounded-full border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]">
            <AlertCircle size={13} />
          </span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not draw the connector past the end',
      why: 'It claims there are more events below. The user scrolls, finds nothing, and trusts the component slightly less next time.',
      render: (
        <div className="relative w-40">
          <Timeline events={EVENTS.slice(0, 2)} compact details={false} />
          <span
            aria-hidden
            className="absolute bottom-0 left-[11px] h-6 w-px bg-[var(--ds-danger-border)]"
          />
        </div>
      ),
    },
    {
      title: 'Do not alternate sides',
      why: 'The zig-zag layout doubles the eye’s travel, breaks completely below about 600px, and makes the reading order ambiguous for assistive tech.',
      render: (
        <div className="relative w-full max-w-xs">
          <span aria-hidden className="absolute left-1/2 top-0 h-full w-px bg-[var(--ds-danger-border)]" />
          <Stack gap="sm">
            <span className="w-1/2 pr-6 text-right text-caption text-[var(--ds-fg-muted)]">
              Deployed
            </span>
            <span className="ml-auto w-1/2 pl-6 text-caption text-[var(--ds-fg-muted)]">Failed</span>
            <span className="w-1/2 pr-6 text-right text-caption text-[var(--ds-fg-muted)]">
              Rolled back
            </span>
          </Stack>
        </div>
      ),
    },
    {
      title: 'Do not leave the order ambiguous',
      why: 'Relative timestamps alone do not say which way the list runs. A user reading a rollback before the failure that caused it draws the wrong conclusion.',
      render: (
        <Stack gap="xs" className="text-caption text-[var(--ds-danger-text)]">
          <span>2 hours ago — Rolled back</span>
          <span>3 hours ago — Deployed</span>
          <span>1 hour ago — Health check failed</span>
        </Stack>
      ),
    },
    {
      title: 'Do not use one for three unrelated items',
      why: 'The connector claims a sequence. Between three things that merely happen to be listed together, that claim is simply wrong.',
      render: (
        <div className="w-40">
          <Timeline
            events={[
              { id: 'a', title: 'Billing', meta: 'Settings', tone: 'neutral', icon: <User size={13} /> },
              { id: 'b', title: 'Members', meta: 'Settings', tone: 'neutral', icon: <User size={13} /> },
            ]}
            compact
            details={false}
          />
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
    ],
    contrast: [
      'Marker tones must not rely on colour alone. Each carries its own icon — a tick, a warning triangle — so the outcome survives greyscale.',
      'The connector is decorative when the ordered list already conveys sequence, and may sit at subtle contrast.',
      'Timestamps are content and owe 4.5:1, even though they read as secondary.',
      'In a stepper, the completed and future states must differ by fill as well as colour.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches only genuinely interactive events. A read-only timeline has no tab stops at all.' },
      { keys: 'Enter', does: 'Opens an event that links to a detail view.' },
      { keys: 'Tab', does: 'Reaches a "Load more" control at the end of a paginated feed.' },
    ],
    aria: [
      { attr: '<ol> / <li>', on: 'The timeline', note: 'The order is the information. An ordered list conveys both sequence and count.' },
      { attr: '<time datetime>', on: 'Each timestamp', note: 'Machine-readable, and it lets assistive tech and translation tools handle the value properly.' },
      { attr: 'aria-hidden', on: 'Markers and connectors', note: 'Decoration. The outcome must also be in the text, or a colour-only marker conveys nothing.' },
      { attr: 'aria-current="step"', on: 'The active step in a stepper', note: 'The only way "you are here" reaches a screen-reader user.' },
      { attr: 'aria-live="polite"', on: 'A live feed', note: 'Announces new events as they arrive. Throttle it — a busy feed will otherwise talk continuously.' },
    ],
    focus:
      'A read-only timeline has no focus stops. When events are links, focus order follows the visual order, which is why alternating sides is a problem — the DOM order and the visual order cannot both be right.',
    screenReader: [
      'Each event should read as one phrase: "Deployed 4021 to production, Ada Lovelace, 14:28".',
      'State the sort order once at the top: "Newest first". Otherwise the sequence is guessable but not knowable.',
      'For a live feed, throttle announcements. A deployment log announcing every line is unusable.',
    ],
    touch:
      'Timelines work well on mobile precisely because they are a single column — the layout that fails there is the alternating one. Keep the gutter narrow, let detail panels wrap, and make whole events tappable rather than putting small targets inside them.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Timeline, TimelineItem } from '@/ui/Display'

<Timeline aria-label="Deployment history">
  {events.map((e) => (
    <TimelineItem
      key={e.id}
      icon={ICONS[e.type]}
      tone={e.failed ? 'danger' : 'success'}
      title={e.title}                     // past tense, specific
      meta={<>{e.actor} · <RelativeTime value={e.at} /></>}
      detail={e.detail}
    />
  ))}
</Timeline>

// Both forms: relative for the glance, absolute for comparing against a log.
function RelativeTime({ value }: { value: string }) {
  const d = new Date(value)
  return (
    <time dateTime={value} title={d.toLocaleString(undefined, { timeZoneName: 'short' })}>
      {formatRelative(d)}
    </time>
  )
}

// The connector stops at the last event. A line past the end claims there
// is more below, and the user scrolls to find nothing.
<li className="relative">
  {!isLast && <span aria-hidden className="ds-timeline__line" />}
  …
</li>

// Group by day for long feeds — a hundred undifferentiated events is a wall.
const byDay = groupBy(events, (e) => startOfDay(e.at).toISOString())`,
    },
    html: {
      lang: 'html',
      code: `<!-- An ordered list: the sequence IS the content. -->
<ol class="ds-timeline" aria-label="Deployment history, newest first">
  <li class="ds-timeline__event">
    <!-- Decoration. The outcome must also be in the text. -->
    <span class="ds-timeline__line" aria-hidden="true"></span>
    <span class="ds-timeline__marker" data-tone="danger" aria-hidden="true">
      <svg>…</svg>
    </span>

    <div class="ds-timeline__body">
      <p class="ds-timeline__title">Rolled back to 4019</p>
      <p class="ds-timeline__meta">
        Ada Lovelace ·
        <time datetime="2026-07-21T14:34:00Z"
              title="21 July 2026, 14:34 UTC">4 minutes ago</time>
      </p>
      <p class="ds-timeline__detail">
        Health check failed in eu-west-2 after the connection pool saturated.
      </p>
    </div>
  </li>

  <!-- No connector on the last event. -->
  <li class="ds-timeline__event ds-timeline__event--last">…</li>
</ol>`,
    },
    css: {
      lang: 'css',
      code: `.ds-timeline { list-style: none; margin: 0; padding: 0; }

.ds-timeline__event {
  position: relative;
  display: flex;
  gap: 12px;                         /* fixed, so icon and avatar markers
                                        share one text edge */
  padding-block-end: 20px;
}

.ds-timeline__marker {
  position: relative;
  z-index: 1;                        /* above the line, so it is never crossed */
  /* Odd, so the 1px connector lands on its exact centre. At 24px the line
     sits half a pixel off and looks bent. */
  inline-size: 23px;
  block-size: 23px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
}

.ds-timeline__marker[data-tone='success'] {
  border-color: var(--ds-success-border);
  background: var(--ds-success-subtle);
  color: var(--ds-success-text);
}
.ds-timeline__marker[data-tone='danger'] {
  border-color: var(--ds-danger-border);
  background: var(--ds-danger-subtle);
  color: var(--ds-danger-text);
}

.ds-timeline__line {
  position: absolute;
  inset-block: 23px 0;
  inset-inline-start: 11px;          /* (23 − 1) / 2 */
  inline-size: 1px;
  background: var(--ds-border-subtle);
}

/* The connector stops here. Anything else claims more events below. */
.ds-timeline__event--last .ds-timeline__line { display: none; }
.ds-timeline__event--last { padding-block-end: 0; }

.ds-timeline__detail {
  margin-block-start: 4px;
  padding: 8px 10px;
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}`,
    },
    api: [
      {
        name: 'Timeline',
        props: [
          { name: 'aria-label', type: 'string', required: true, description: 'Names the sequence and states the order: "Deployment history, newest first".' },
          { name: 'density', type: "'compact' | 'default'", default: "'default'", description: 'Compact for long audit logs where density beats breathing room.' },
          { name: 'orientation', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Horizontal is a stepper. Never alternating — the reading order becomes ambiguous.' },
        ],
      },
      {
        name: 'TimelineItem',
        props: [
          { name: 'title', type: 'ReactNode', required: true, description: 'Past tense and specific: "Rolled back to 4019", not "Rollback".' },
          { name: 'meta', type: 'ReactNode', description: 'Actor then time, in that order — the actor is what people scan an audit trail for.' },
          { name: 'icon', type: 'ReactNode', description: '13px inside the marker. Carries the outcome alongside the tone.' },
          { name: 'tone', type: "'neutral' | 'success' | 'danger' | 'accent'", default: "'neutral'", description: 'Colours the marker. Always paired with an icon so it survives greyscale.' },
          { name: 'detail', type: 'ReactNode', description: 'An inset panel under the title. Inside the event block, never a second column.' },
          { name: 'href', type: 'string', description: 'Makes the whole event a link to its detail view.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Group long feeds by day with a sticky header. A hundred undifferentiated events is a wall; "Today", "Yesterday" turns it into chapters.',
      'Collapse runs of identical events — "12 health checks passed" beats twelve identical rows and makes the exceptions visible.',
      'Write titles in the past tense with the object named. "Deployed 4021 to production" is a record; "Deploy" is a button label in the wrong place.',
      'For live feeds, insert new events with no animation at the top and leave the scroll position alone. Auto-scrolling a feed the user is reading is the fastest way to lose them.',
      'Link each event to its own detail view rather than expanding in place. Expansion moves everything below the event the user just clicked.',
    ],
    performance: [
      'Paginate or virtualise past a few hundred events. Audit trails grow without limit and a naive render eventually locks the page.',
      'Format timestamps with a shared Intl formatter rather than constructing one per row.',
      'Update relative times on an interval, not on every render — one tick per minute is enough and avoids re-rendering the whole feed on unrelated state changes.',
      'Draw the connector with a pseudo-element rather than an extra node. In a thousand-event feed that is a thousand elements saved.',
    ],
    mistakes: [
      'A connector running past the last event, claiming more below.',
      'Alternating sides, which breaks on mobile and makes the reading order ambiguous.',
      'Relative timestamps only, so the order and the exact moment are both unknowable.',
      'Divs instead of an ordered list, conveying neither sequence nor count.',
      'Colour-only markers, so the outcome disappears in greyscale.',
      'An even-numbered marker size, leaving the connector visibly off-centre.',
      'Detail as a second column, breaking the single axis the timeline is built on.',
      'A live feed announcing every event to screen readers with no throttle.',
    ],
    realWorld: [
      'Audit trails are the strongest case: the order is legally meaningful, the actor matters, and nobody wants to sort them by anything else.',
      'Activity feeds go stale fast. Collapsing repetitive events and grouping by day is what keeps them readable past a few dozen items.',
      'Steppers are timelines that have been rotated, and they inherit the same rules — the connector still claims a sequence, and the current step still needs aria-current.',
      'The alternating-sides layout appears in almost every design inspiration gallery and almost never in a shipped product. There is a reason for that.',
    ],
  },
})
