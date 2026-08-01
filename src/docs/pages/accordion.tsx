import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const ITEMS = [
  {
    id: 'rollback',
    title: 'How do rollbacks work?',
    meta: 'Deployments',
    body: 'A rollback re-points the load balancer at the previous healthy build. Nothing is rebuilt, so it completes in about eight seconds regardless of how large the application is.',
  },
  {
    id: 'regions',
    title: 'Which regions can I deploy to?',
    meta: 'Infrastructure',
    body: 'Twenty-four regions across four continents. Adding a region rebuilds the container for that architecture, which takes a few minutes the first time and is cached afterwards.',
  },
  {
    id: 'secrets',
    title: 'Where are secrets stored?',
    meta: 'Security',
    body: 'Encrypted at rest with a per-project key and injected as environment variables at boot. They are never written to the build cache and never appear in logs.',
  },
]

function Accordion({
  multiple,
  size = 'md',
  dividers = true,
}: {
  multiple?: boolean
  size?: 'sm' | 'md'
  dividers?: boolean
}) {
  const [open, setOpen] = React.useState<string[]>(['rollback'])

  const toggle = (id: string) =>
    setOpen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : multiple ? [...prev, id] : [id],
    )

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[var(--radius-lg)]',
        dividers && 'border border-[var(--ds-border-subtle)]',
      )}
    >
      {ITEMS.map((item, i) => {
        const isOpen = open.includes(item.id)
        return (
          <div
            key={item.id}
            className={cn(dividers && i > 0 && 'border-t border-[var(--ds-border-subtle)]')}
          >
            {/* A real button inside a heading: the heading gives the section
                structure, the button gives it the control. */}
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                id={`trigger-${item.id}`}
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 text-left transition-colors',
                  'hover:bg-[var(--ds-layer-hover)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                  size === 'sm' ? 'px-3 py-2.5' : 'px-4 py-3.5',
                )}
              >
                {/* Leading chevron: it stays put as the title wraps, and it is
                    where the eye already is when scanning a list of headings. */}
                <ChevronDown
                  size={15}
                  aria-hidden
                  className={cn(
                    'shrink-0 text-[var(--ds-fg-muted)] transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)]',
                    isOpen && 'rotate-180',
                  )}
                />
                <span
                  className={cn(
                    'flex-1 text-[var(--ds-fg)]',
                    size === 'sm' ? 'text-label-sm' : 'text-label',
                    isOpen && 'font-medium',
                  )}
                >
                  {item.title}
                </span>
                <Badge tone="neutral" size="sm" className="shrink-0">
                  {item.meta}
                </Badge>
              </button>
            </h3>
            <div
              id={`panel-${item.id}`}
              role="region"
              aria-labelledby={`trigger-${item.id}`}
              hidden={!isOpen}
              className={cn(
                'text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]',
                size === 'sm' ? 'px-3 pb-3 pl-[34px]' : 'px-4 pb-4 pl-[43px]',
              )}
            >
              {item.body}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Spoiler() {
  const [open, setOpen] = React.useState(false)
  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <div className="w-full max-w-lg">
        <div className="relative">
          <p
            className={cn(
              'text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]',
              !open && 'line-clamp-3',
            )}
          >
            The health check failed in eu-west-2 at 14:32 after the connection pool saturated. The
            retry budget was exhausted before the circuit opened, so requests queued rather than
            failing fast. The rollback re-pointed the load balancer at build 4019 and completed in
            eight seconds. Error rates returned to baseline within a minute. The underlying cause
            was a migration that held a table lock for longer than the pool timeout, which we have
            since split into two smaller migrations.
          </p>
          {!open && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--ds-canvas)] to-transparent"
            />
          )}
        </div>
        <Button
          size="sm"
          variant="text"
          className="mt-1 px-0"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Show less' : 'Show more'}
        </Button>
      </div>
    </PreviewStage>
  )
}

function Playground() {
  const [multiple, setMultiple] = React.useState(false)
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [dividers, setDividers] = React.useState(true)

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
          <KnobToggle checked={multiple} onChange={setMultiple} label="Multiple open" />
          <KnobToggle checked={dividers} onChange={setDividers} label="Dividers" />
        </div>
      }
      code={`<Accordion${multiple ? ' multiple' : ''} size="${size}">
  {items.map((item) => (
    <AccordionItem key={item.id} title={item.title}>
      {item.body}
    </AccordionItem>
  ))}
</Accordion>`}
    >
      <div className="w-full max-w-lg">
        <Accordion key={String(multiple)} multiple={multiple} size={size} dividers={dividers} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'accordion',
    title: 'Accordion',
    tagline:
      'Progressive disclosure in place — one section open or many, and the content that must never be hidden inside one.',
    keywords: ['collapse', 'disclosure', 'expander', 'spoiler', 'show more', 'details', 'faq'],
  },

  overview: {
    purpose:
      'An accordion hides sections behind their own headings so the user can see the whole shape of a page before deciding what to read. Its real value is the list of headings: a page of six collapsed sections is scannable in a second, where the same content expanded is a scroll. The cost is a click per section and a permanent risk that anything hidden is never found.',
    whenToUse: [
      'FAQ pages and help content, where the questions are the navigation.',
      'Advanced or optional settings that most users never need to open.',
      'Long reference content where the headings are more useful than the prose.',
      'Truncating a long passage behind a "Show more" control.',
    ],
    whenNotToUse: [
      {
        text: 'The content is short enough to show in full.',
        instead: 'nothing — a click to reveal two sentences is a click for nothing',
        to: '#/card',
      },
      {
        text: 'The sections are peer views of one object.',
        instead: 'Tabs, which keep exactly one visible with no scroll',
        to: '#/tabs',
      },
      {
        text: 'Users need to compare sections side by side.',
        instead: 'showing them all, or a Data Table',
        to: '#/data-table',
      },
      {
        text: 'It is a form the user must complete.',
        instead: 'a visible Form — hidden required fields are the classic cause of a submit that fails silently',
        to: '#/form',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Anything hidden will be missed by most people.</strong> That is not a failure of
          the component, it is what it is for — but it means the decision about what goes inside is
          the entire design. Required fields, error messages and anything with a deadline must
          never be behind a collapsed heading.
        </p>
        <p>
          The trigger is a <strong>button inside a heading</strong>, not a heading that happens to
          be clickable. The heading gives the section its place in the document outline so a screen
          reader can jump between sections; the button gives it{' '}
          <code>aria-expanded</code>. Both are needed and neither substitutes for the other.
        </p>
        <p>
          Single-open accordions close the previous section when a new one opens, which means the
          content the user was reading disappears without them asking. Allow{' '}
          <strong>multiple open</strong> unless the sections are genuinely alternatives — the
          "only one at a time" default is inherited from a space constraint most layouts no longer
          have.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'spoiler',
        title: 'Show more',
        description:
          'The same disclosure pattern with one section and no heading. The fade is the affordance — a hard clip looks like a rendering bug rather than an invitation.',
        render: <Spoiler />,
      },
      {
        id: 'single-vs-multiple',
        title: 'Single open or multiple',
        description:
          'Single-open closes what the user was reading without being asked. Reserve it for sections that are genuinely alternatives.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="Multiple" sub="Default" tone="good">
                <Accordion multiple size="sm" />
              </Cell>
              <Cell label="Single" sub="Only for alternatives" tone="bad">
                <Accordion size="sm" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-tabs',
        title: 'Accordion or tabs',
        description:
          'Tabs keep exactly one section visible with no scrolling and no reflow. An accordion trades that for a scannable list of every heading at once.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="Accordion" sub="All headings visible" tone="good">
                <Accordion size="sm" dividers={false} />
              </Cell>
              <Cell label="Tabs" sub="One panel, fixed height" tone="good">
                <Stack gap="sm">
                  <Row gap="sm" className="border-b border-[var(--ds-border-subtle)] pb-1">
                    {['Overview', 'Logs', 'Config'].map((t, i) => (
                      <span
                        key={t}
                        className={cn(
                          'px-2 pb-1 text-label-sm',
                          i === 0
                            ? 'border-b-2 border-[var(--ds-accent)] text-[var(--ds-fg)]'
                            : 'text-[var(--ds-fg-muted)]',
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </Row>
                  <p className="text-body-sm text-[var(--ds-fg-secondary)]">
                    One panel at a time, no reflow.
                  </p>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'never-hide',
        title: 'What must never be inside one',
        description:
          'A required field behind a collapsed heading produces a submit that fails for a reason the user cannot see. Expand any section containing an error, automatically.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-lg">
              <div className="rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/30 px-4 py-3">
                <Row gap="sm" align="center">
                  <ChevronDown size={15} className="text-[var(--ds-danger-text)]" />
                  <span className="flex-1 text-label text-[var(--ds-fg)]">Advanced settings</span>
                  <Badge tone="danger" size="sm">
                    1 error
                  </Badge>
                </Row>
              </div>
              <span className="text-caption text-[var(--ds-fg-muted)]">
                A section holding an error opens itself and says so on the heading.
              </span>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Collapsed',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
            <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Rollbacks</span>
          </span>
        ),
      },
      {
        label: 'Expanded',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label font-medium text-[var(--ds-fg)]">
            <ChevronDown size={15} className="rotate-180 text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Rollbacks</span>
          </span>
        ),
      },
      {
        label: 'Hover',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
            <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Rollbacks</span>
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label text-[var(--ds-fg)] outline-2 outline-offset-[-2px] outline-[var(--ds-focus-ring)]">
            <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Rollbacks</span>
          </span>
        ),
      },
      {
        label: 'With meta',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
            <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Regions</span>
            <Badge tone="neutral" size="sm">
              24
            </Badge>
          </span>
        ),
      },
      {
        label: 'With error',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
            <ChevronDown size={15} className="text-[var(--ds-danger-text)]" />
            <span className="flex-1">Advanced</span>
            <Badge tone="danger" size="sm">
              1 error
            </Badge>
          </span>
        ),
      },
      {
        label: 'Disabled',
        render: (
          <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-label text-[var(--ds-fg-disabled)]">
            <ChevronDown size={15} />
            <span className="flex-1">Unavailable</span>
          </span>
        ),
      },
      { label: 'Show more', render: <Button size="sm" variant="text" className="px-0">Show more</Button> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Accordion multiple />
      </div>
    ),
    caption:
      'Three sections, each a button inside a heading, with the panel indented to the title’s left edge rather than the chevron’s.',
    parts: [
      {
        n: 1,
        label: 'Trigger height',
        value: '52px (44px small)',
        kind: 'size',
        note: 'Comfortably above the touch minimum, because the whole row is the target and it is pressed repeatedly while scanning.',
      },
      {
        n: 2,
        label: 'Chevron',
        value: '15px, leading, rotates 180°',
        kind: 'motion',
        note: 'Leading rather than trailing: it stays in one column as titles wrap, and it is already where the eye lands when scanning a list of headings.',
      },
      {
        n: 3,
        label: 'Title',
        value: '13px, 500 when open',
        kind: 'type',
        note: 'The weight change is the second signal alongside the chevron. It must not change the row height, so the font must have a real medium weight.',
      },
      {
        n: 4,
        label: 'Panel indent',
        value: 'Aligned to the title',
        kind: 'space',
        note: 'The body starts at the title’s left edge, not the chevron’s. That alignment is what makes the panel read as belonging to its heading.',
      },
      {
        n: 5,
        label: 'Divider',
        value: '1px between sections',
        kind: 'shape',
        note: 'Between items only, never above the first or below the last inside a bordered container — doubled lines look like a rendering fault.',
      },
      {
        n: 6,
        label: 'Panel padding',
        value: '0 16px 16px',
        kind: 'space',
        note: 'No top padding: the trigger’s own bottom padding already provides it. Adding both leaves a gap that reads as a missing element.',
      },
      {
        n: 7,
        label: 'Transition',
        value: '180ms, height + opacity',
        kind: 'motion',
        note: 'Short. Anything longer than about 200ms makes an accordion feel sluggish when the user is opening several in a row.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Container background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Container edge and dividers' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Trigger hover' },
    { category: 'color', token: '--ds-fg', usedFor: 'Section titles' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Panel body' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Chevron' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'A section containing an error' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline, inset' },
    { category: 'spacing', token: '--space-4', value: '16px', usedFor: 'Trigger and panel horizontal padding' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Container corners' },
    { category: 'motion', token: '--duration-normal', value: '180ms', usedFor: 'Expand and chevron rotation' },
  ],

  sizes: [
    { name: 'Small', height: '44px trigger', padding: '10px 12px', type: '12px', use: 'Inside a card or a sidebar, where the accordion is secondary to the surrounding content.' },
    { name: 'Medium', height: '52px trigger', padding: '14px 16px', type: '13px', use: 'The default. FAQ pages and settings sections.' },
    { name: 'Panel', padding: '0 16px 16px', use: 'No top padding — the trigger already provides it.' },
    { name: 'Indent', gap: 'Title left edge', use: 'The panel aligns to the title, not the container edge.' },
    { name: 'Measure', maxWidth: '40rem', use: 'About 70 characters. An accordion stretched across a wide page produces unreadable lines when opened.' },
  ],

  do: [
    {
      title: 'Put a button inside a heading',
      why: 'The heading places the section in the document outline so it can be jumped to; the button carries aria-expanded. Neither substitutes for the other.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;h3&gt;&lt;button aria-expanded="true"
          <br />
          &nbsp;&nbsp;aria-controls="panel-1"&gt;…&lt;/button&gt;&lt;/h3&gt;
        </code>
      ),
    },
    {
      title: 'Allow several sections open at once',
      why: 'Single-open closes what the user was reading without being asked. Reserve it for sections that are genuinely alternatives.',
      render: <div className="w-full max-w-xs"><Accordion multiple size="sm" dividers={false} /></div>,
    },
    {
      title: 'Open any section that contains an error',
      why: 'A validation failure inside a collapsed section is a submit that fails for a reason the user cannot see. Expand it and mark the heading.',
      render: (
        <Row gap="sm" align="center" className="w-52">
          <ChevronDown size={15} className="rotate-180 text-[var(--ds-danger-text)]" />
          <span className="flex-1 text-label text-[var(--ds-fg)]">Advanced</span>
          <Badge tone="danger" size="sm">
            1 error
          </Badge>
        </Row>
      ),
    },
    {
      title: 'Make the whole heading row the target',
      why: 'A chevron-only target is a 15px hit area on a 52px row. Users click the title because it looks like the thing to click.',
      render: (
        <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
          <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
          <span className="flex-1">Entire row is the button</span>
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not hide required fields',
      why: 'The user submits, the form fails, and the reason is behind a heading they never opened. This is the single most damaging use of the component.',
      render: (
        <span className="flex w-52 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2.5 text-label text-[var(--ds-fg)]">
          <ChevronDown size={15} className="text-[var(--ds-fg-muted)]" />
          <span className="flex-1">Billing details *</span>
        </span>
      ),
    },
    {
      title: 'Do not collapse two sentences',
      why: 'A click to reveal one short paragraph costs more than showing it. The accordion is for content long enough that the heading list is worth having.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <span className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2 text-label-sm text-[var(--ds-fg)]">
            <ChevronDown size={14} className="text-[var(--ds-fg-muted)]" />
            <span className="flex-1">Region</span>
          </span>
          <span className="pl-8 text-caption text-[var(--ds-fg-muted)]">eu-west-2</span>
        </Stack>
      ),
    },
    {
      title: 'Do not nest accordions',
      why: 'Two levels of disclosure means the user cannot tell what is hidden or how deep it goes, and the indentation eats the content width.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <span className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2 text-label-sm">
            <ChevronDown size={13} /> Settings
          </span>
          <span className="ml-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2 text-label-sm">
            <ChevronDown size={13} /> Advanced
          </span>
          <span className="ml-8 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-3 py-2 text-label-sm">
            <ChevronDown size={13} /> Experimental
          </span>
        </Stack>
      ),
    },
    {
      title: 'Do not animate for longer than about 200ms',
      why: 'A user opening four sections in a row waits for four animations. What reads as smooth once reads as slow the fourth time.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          transition: height 500ms ease-in-out
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The chevron owes 3:1 — it is the affordance, and aria-expanded alone does not help a sighted user.',
      'The expanded state changes both the chevron rotation and the title weight, so it does not depend on either one alone.',
      'Dividers owe 3:1 if they are the only thing separating sections; if each section has its own surface, they are decorative.',
      'A section marked as containing an error must carry a badge as well as a colour.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to each trigger, then into an open panel’s own controls.' },
      { keys: 'Enter / Space', does: 'Toggles the focused section.' },
      { keys: '↑ / ↓', does: 'Optional: moves between triggers, skipping panel content. Valuable in a long FAQ, and it must not be the only way.' },
      { keys: 'Home / End', does: 'Optional: jumps to the first or last trigger.' },
    ],
    aria: [
      { attr: '<h2>–<h4> wrapping a button', on: 'The trigger', note: 'The heading level must match the surrounding outline. A button that is not in a heading cannot be jumped to.' },
      { attr: 'aria-expanded', on: 'The trigger button', note: 'The state. It must track the real value — a hardcoded false is a silent bug.' },
      { attr: 'aria-controls', on: 'The trigger button', note: 'Points at the panel id, associating the two.' },
      { attr: 'role="region"', on: 'The panel', note: 'With aria-labelledby pointing back at the trigger. Only worth it for a handful of sections — twenty regions clutters the landmark list.' },
      { attr: 'hidden', on: 'A closed panel', note: 'Or display:none. A visually collapsed panel that is still in the accessibility tree is announced as available content that cannot be seen.' },
    ],
    focus:
      'Focus stays on the trigger when a section opens, so the user can continue down the list. It must never jump into the panel — that would strand a keyboard user who was only scanning headings. Closing a section that contains the focused element moves focus back to its trigger.',
    screenReader: [
      'Announces as "How do rollbacks work?, button, collapsed" then "expanded".',
      'Heading levels are how a screen-reader user navigates an accordion — they jump by heading, not by tabbing. Getting the level wrong breaks that entirely.',
      'A collapsed panel must be genuinely hidden. Height zero with overflow hidden leaves the content readable by assistive tech while invisible on screen.',
    ],
    touch:
      'The whole heading row is the target, which comfortably clears 44px at the default size. Accordions work well on mobile precisely because they trade horizontal space for vertical, but keep the section count low: a phone screen showing eight collapsed headings and no content looks like a page that failed to load.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Accordion, AccordionItem } from '@/ui/Surface'

<Accordion multiple defaultOpen={['rollback']}>
  {faqs.map((f) => (
    <AccordionItem key={f.id} id={f.id} title={f.title} meta={f.category}>
      {f.body}
    </AccordionItem>
  ))}
</Accordion>

// A collapsed section holding a validation error is a submit that fails for
// a reason the user cannot see. Open it and mark the heading.
React.useEffect(() => {
  const withErrors = sections
    .filter((s) => s.fields.some((f) => errors[f]))
    .map((s) => s.id)
  if (withErrors.length) setOpen((o) => [...new Set([...o, ...withErrors])])
}, [errors])

// Native <details> is a legitimate implementation and gets the semantics,
// the keyboard and the print behaviour for free.
<details>
  <summary>How do rollbacks work?</summary>
  <p>A rollback re-points the load balancer at the previous healthy build.</p>
</details>

// Animating height needs a measured value; 'auto' does not transition.
const [height, setHeight] = React.useState(0)
React.useLayoutEffect(() => {
  setHeight(open ? panelRef.current!.scrollHeight : 0)
}, [open, children])`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-accordion">
  <!-- The heading gives it a place in the outline; the button gives it
       state. Both are required. -->
  <h3>
    <button
      type="button"
      id="trigger-rollback"
      aria-expanded="true"
      aria-controls="panel-rollback"
    >
      <svg aria-hidden="true">…</svg>
      How do rollbacks work?
    </button>
  </h3>

  <div id="panel-rollback" role="region" aria-labelledby="trigger-rollback">
    <p>A rollback re-points the load balancer at the previous healthy build.</p>
  </div>

  <h3>
    <button type="button" id="trigger-regions"
            aria-expanded="false" aria-controls="panel-regions">
      <svg aria-hidden="true">…</svg>
      Which regions can I deploy to?
    </button>
  </h3>

  <!-- hidden, not height:0 — a collapsed panel must be gone from the
       accessibility tree, not merely invisible. -->
  <div id="panel-regions" role="region" aria-labelledby="trigger-regions" hidden>
    <p>Twenty-four regions across four continents.</p>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-accordion {
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Between items only. A rule above the first or below the last doubles the
   container border and reads as a rendering fault. */
.ds-accordion > * + * {
  border-block-start: 1px solid var(--ds-border-subtle);
}

.ds-accordion button {
  display: flex;
  align-items: center;
  gap: 12px;
  inline-size: 100%;
  /* The whole row, not the chevron: a 15px target on a 52px row is a miss
     waiting to happen. */
  padding: 14px 16px;
  text-align: start;
}

.ds-accordion button:hover { background: var(--ds-layer-hover); }

/* Leading, so it stays in one column as titles wrap. */
.ds-accordion svg {
  flex: 0 0 auto;
  transition: rotate 180ms cubic-bezier(0.2, 0, 0, 1);
}
.ds-accordion button[aria-expanded='true'] svg { rotate: 180deg; }

/* Panel aligns to the TITLE's left edge, not the container's — that is what
   makes it read as belonging to its heading. */
.ds-accordion [role='region'] {
  padding: 0 16px 16px calc(16px + 15px + 12px);
}

/* Modern height animation with no JS measurement. */
@supports (interpolate-size: allow-keywords) {
  .ds-accordion [role='region'] {
    interpolate-size: allow-keywords;
    transition: height 180ms, content-visibility 180ms allow-discrete;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-accordion svg,
  .ds-accordion [role='region'] { transition: none; }
}`,
    },
    api: [
      {
        name: 'Accordion',
        props: [
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Allows several sections open at once. Prefer true — single-open closes what the user was reading.' },
          { name: 'defaultOpen', type: 'string[]', description: 'Ids open on mount. Open the section most people need rather than starting fully collapsed.' },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Trigger height and type size.' },
          { name: 'headingLevel', type: '2 | 3 | 4', default: '3', description: 'Must match the surrounding document outline — this is how screen-reader users navigate.' },
        ],
      },
      {
        name: 'AccordionItem',
        props: [
          { name: 'id', type: 'string', required: true, description: 'Stable. Used for open state and for the aria-controls relationship.' },
          { name: 'title', type: 'ReactNode', required: true, description: 'Written as a question or a noun phrase — it is the navigation for the whole component.' },
          { name: 'meta', type: 'ReactNode', description: 'A badge or count at the trailing edge, so the collapsed heading still says something about what is inside.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'A section that cannot be opened yet. Say why on the heading.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write headings as questions or specific noun phrases. "Rollbacks" is scannable; "More information" is a heading that tells the user nothing about whether to open it.',
      'Put a count or a summary badge on the collapsed heading. "Regions (24)" gives the user a reason to open it or not.',
      'Open the section most people need by default. A fully collapsed page makes every user pay a click for the common case.',
      'Deep-link to a section with a URL fragment and open it on load. FAQ links that land on a collapsed heading are a support answer that does not answer.',
      'Native <details> is a perfectly good implementation. It brings the semantics, the keyboard model, and printing with sections expanded, for free.',
    ],
    performance: [
      'Animating height requires a measured pixel value — "auto" does not transition. Modern CSS has interpolate-size: allow-keywords, which removes the JavaScript entirely.',
      'Render panel content lazily for heavy sections, but keep the heading and its state present so the outline is complete before anything loads.',
      'Do not animate more than a couple of sections at once. Opening all with one control should be instant, not a cascade.',
      'Use content-visibility: auto on long collapsed panels to skip their layout until they are opened.',
    ],
    mistakes: [
      'A clickable heading with no button inside, so aria-expanded has nowhere to live.',
      'Wrong heading levels, breaking the jump-by-heading navigation screen-reader users rely on.',
      'A collapsed panel at height zero rather than hidden, leaving invisible content in the accessibility tree.',
      'Required fields or validation errors hidden inside a collapsed section.',
      'A chevron-only click target on a full-width row.',
      'Single-open by default, closing the content the user was reading.',
      'Animations over 200ms, which compound when opening several sections.',
      'Nested accordions, where nobody can tell how deep the content goes.',
    ],
    realWorld: [
      'FAQ accordions work because the questions are the interface. If your headings are not the thing users are scanning for, an accordion is the wrong container.',
      'In settings, "Advanced" sections are the classic legitimate use — but audit what is inside periodically. Features hidden there stay unused, and that is sometimes a finding rather than a design.',
      'Collapsed content is invisible to on-page search in most browsers. If users search your page with ⌘F, expand-all is worth having.',
      'Mobile is where accordions earn the most: they trade horizontal space, which a phone does not have, for vertical scrolling, which it does.',
    ],
  },
})
