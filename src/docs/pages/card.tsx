import * as React from 'react'
import { ArrowUpRight, GitBranch, MoreHorizontal, Rocket } from 'lucide-react'
import { Card, CardFooter, CardHeader, Panel, Stat } from '@/ui/Surface'
import { Button, IconButton } from '@/ui/Button'
import { Avatar, AvatarStack, Badge } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [variant, setVariant] = React.useState<'outlined' | 'filled' | 'elevated'>('outlined')
  const [padding, setPadding] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [elevation, setElevation] = React.useState<'0' | '1' | '2' | '3'>('0')
  const [interactive, setInteractive] = React.useState(false)
  const [selected, setSelected] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['outlined', 'filled', 'elevated'] as const}
            />
          </Knob>
          <Knob label="Padding">
            <KnobSelect value={padding} onChange={setPadding} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Elevation">
            <KnobSelect value={elevation} onChange={setElevation} options={['0', '1', '2', '3'] as const} />
          </Knob>
          <KnobToggle checked={interactive} onChange={setInteractive} label="Interactive" />
          <KnobToggle checked={selected} onChange={setSelected} label="Selected" />
        </div>
      }
      code={`<Card variant="${variant}" padding="${padding}" elevation={${elevation}}${interactive ? ' interactive' : ''}${selected ? ' selected' : ''}>
  <CardHeader title="api-gateway" description="Deployed 4 minutes ago" />
  …
</Card>`}
    >
      <div className="w-full max-w-sm">
        <Card
          variant={variant}
          padding={padding}
          elevation={Number(elevation) as 0 | 1 | 2 | 3}
          interactive={interactive}
          selected={selected}
        >
          <CardHeader
            icon={<Rocket size={16} />}
            title="api-gateway"
            description="Deployed 4 minutes ago by Ada"
            actions={<Badge tone="success" size="sm" dot>Live</Badge>}
          />
          <p className="mt-3 text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
            Three regions, twelve instances. Median response 18ms over the last hour.
          </p>
          <CardFooter>
            <Button size="sm" variant="text">Logs</Button>
            <Button size="sm" variant="outlined">Rollback</Button>
          </CardFooter>
        </Card>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'card',
    title: 'Card',
    tagline:
      'A container for content that belongs together and can be acted on as a unit. If neither is true, you want a section with a heading.',
    keywords: ['panel', 'tile', 'container', 'surface', 'stat', 'grid'],
  },

  overview: {
    purpose:
      'A card groups related content into an object the user can perceive as one thing — and, usually, act on as one thing. That second half is what most card usage gets wrong: a page divided into six cards that nobody can click is just six boxes competing for attention with the content inside them.',
    whenToUse: [
      'Repeating items in a collection: projects, deployments, invoices, teammates.',
      'A self-contained summary that links somewhere: a stat tile, a preview, a search result.',
      'Grouping form fields or settings that genuinely belong together as a unit.',
      'A drag target, a selectable item, or anything with an object-level state.',
    ],
    whenNotToUse: [
      {
        text: 'Sectioning a page that has no repeating items.',
        instead: 'a heading and whitespace',
        to: '#/spacing',
      },
      {
        text: 'Rows of comparable data with the same fields.',
        instead: 'a Table',
        to: '#/data-table',
      },
      {
        text: 'A single piece of information with no actions.',
        instead: 'plain text',
      },
      {
        text: 'Wrapping every element on the page so it "looks structured".',
        instead: 'spacing — nested cards are almost always a mistake',
      },
    ],
    reasoning: (
      <>
        <p>
          The most useful test: <strong>could this card be a link?</strong> If yes, it is a card. If
          it would never make sense to click it as a whole, it is probably a section, and the border
          you are about to add is competing with the content rather than framing it.
        </p>
        <p>
          Padding is <strong>20px against a 16px radius</strong>. That combination is not arbitrary:
          the nesting rule says anything rounded inside the card caps at about 8px, and 20px of
          padding is what keeps the content clear of the corner curve. Cards with 12px padding and a
          16px radius always look slightly wrong at the corners.
        </p>
        <p>
          In dark mode the card is <em>lighter</em> than the canvas and the shadow barely
          participates; in light mode the card is white and the page goes grey. Same token names,
          opposite mechanics. That is why a card should never hard-code a background.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'collection',
        title: 'A collection',
        description:
          'Interactive cards in an auto-filling grid. The whole card is one link, hover lifts by one elevation step and 1px, and nothing inside is separately clickable.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <div
              className="grid w-full gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))' }}
            >
              {[
                ['api-gateway', 'main', 'success', 'Live'],
                ['billing-worker', 'fix/retry', 'warning', 'Degraded'],
                ['edge-cache', 'main', 'success', 'Live'],
              ].map(([name, branch, tone, label]) => (
                <Card key={name} interactive as="a" padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-label text-[var(--ds-fg)]">{name}</span>
                    <Badge tone={tone as 'success'} size="sm" dot>
                      {label}
                    </Badge>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
                    <GitBranch size={12} /> {branch}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <AvatarStack
                      people={[{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }]}
                      size="xs"
                    />
                    <ArrowUpRight size={14} className="text-[var(--ds-fg-disabled)]" />
                  </div>
                </Card>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'stats',
        title: 'Stat tiles',
        description:
          'The dashboard atom. The number is the largest thing, the label is the smallest, and the delta is paired with an arrow and a sign so it survives greyscale.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Requests" value="1.24M" delta={12.4} deltaLabel="vs last week" spark={[3, 5, 4, 8, 7, 11, 14]} />
              <Stat label="Error rate" value="0.41%" delta={-8.1} deltaLabel="vs last week" spark={[9, 8, 8, 6, 5, 5, 4]} />
              <Stat label="p95 latency" value="184ms" delta={3.2} deltaLabel="vs last week" spark={[4, 5, 5, 6, 6, 7, 8]} />
              <Stat label="Uptime" value="99.98%" delta={0.01} deltaLabel="30-day rolling" />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'panel',
        title: 'Panels',
        description:
          'A card with a divided header and footer. Use when the card contains a list or a table and the header needs to hold controls.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-xl">
              <Panel
                title="Recent deployments"
                description="Last 24 hours"
                actions={
                  <>
                    <Button size="xs" variant="text">View all</Button>
                    <IconButton label="More" icon={<MoreHorizontal />} size="xs" />
                  </>
                }
                bodyClassName="p-0"
                footer={
                  <p className="text-caption text-[var(--ds-fg-muted)]">Updated 4 minutes ago</p>
                }
              >
                <div className="divide-y divide-[var(--ds-border-subtle)]">
                  {['api-gateway', 'billing-worker', 'edge-cache'].map((n) => (
                    <div key={n} className="flex items-center justify-between px-5 py-2.5">
                      <span className="font-mono text-body-sm text-[var(--ds-fg-secondary)]">{n}</span>
                      <span className="flex items-center gap-2">
                        <Avatar name="Ada Lovelace" size="xs" />
                        <Badge tone="success" size="sm">Live</Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'variants',
        title: 'Variants',
        description:
          'Outlined is the default and covers almost everything. Filled recedes into the page; elevated lifts out of it. Pick one per surface and stay with it.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-3 sm:grid-cols-3">
              {(['outlined', 'filled', 'elevated'] as const).map((v) => (
                <Card key={v} variant={v} padding="sm" elevation={v === 'elevated' ? 2 : 0}>
                  <p className="text-label text-[var(--ds-fg)]">{v}</p>
                  <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
                    {v === 'outlined'
                      ? 'The default. A hairline and a surface.'
                      : v === 'filled'
                        ? 'Recedes. For secondary groupings.'
                        : 'Lifts. For draggable or floating items.'}
                  </p>
                </Card>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <MiniCard /> },
      { label: 'Hover', note: '−1px, e3', render: <MiniCard className="-translate-y-px border-[var(--ds-border)] shadow-e3" /> },
      { label: 'Pressed', render: <MiniCard className="translate-y-0 shadow-e1" /> },
      { label: 'Focus', render: <MiniCard className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]" /> },
      { label: 'Selected', render: <MiniCard className="border-[var(--ds-accent)] shadow-[0_0_0_1px_var(--ds-accent)]" /> },
      { label: 'Filled', render: <MiniCard className="border-transparent bg-[var(--ds-surface-inset)]" /> },
      { label: 'Elevated', render: <MiniCard className="bg-[var(--ds-surface-raised)] shadow-e2" /> },
      { label: 'Disabled', render: <MiniCard className="opacity-45" /> },
      { label: 'Loading', render: <div className="h-[76px] w-40 animate-pulse rounded-[var(--radius-xl)] bg-[var(--ds-layer-active)]" /> },
      { label: 'Dragging', note: 'e4, 2° tilt', render: <MiniCard className="rotate-2 shadow-e4" /> },
      { label: 'Drop target', render: <div className="h-[76px] w-40 rounded-[var(--radius-xl)] border-2 border-dashed border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)]" /> },
      { label: 'Error', render: <MiniCard className="border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader
            icon={<Rocket size={16} />}
            title="api-gateway"
            description="Deployed 4 minutes ago"
            actions={<Badge tone="success" size="sm" dot>Live</Badge>}
          />
          <p className="mt-3 text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
            Three regions, twelve instances.
          </p>
          <CardFooter>
            <Button size="sm" variant="text">Logs</Button>
            <Button size="sm" variant="outlined">Rollback</Button>
          </CardFooter>
        </Card>
      </div>
    ),
    caption:
      'Header with an icon slot and an action slot, body, and a divided footer. The divider gets more space above than below.',
    parts: [
      {
        n: 1,
        label: 'Padding',
        value: '20px (md)',
        kind: 'space',
        note: 'One step larger than any internal gap, so content reads as contained rather than clipped. 14px for sm, 24px for lg.',
      },
      {
        n: 2,
        label: 'Radius',
        value: '16px · --radius-xl',
        kind: 'shape',
        note: 'The container radius. Anything rounded inside caps at about 8px, or the corners visually pinch.',
      },
      {
        n: 3,
        label: 'Border',
        value: '1px --ds-border-subtle',
        kind: 'color',
        note: 'The hairline does most of the edge definition, especially in light mode where the surface and the page are both white.',
      },
      {
        n: 4,
        label: 'Header gap',
        value: '12px icon, 4px title/desc',
        kind: 'space',
        note: 'Title and description are 4px apart because they are one unit; the gap to the body is 12px, three times larger.',
      },
      {
        n: 5,
        label: 'Footer divider',
        value: '20px above, 16px below',
        kind: 'space',
        note: 'Asymmetric on purpose. The eye reads a rule as belonging to the content beneath it, so it needs more air above.',
      },
      {
        n: 6,
        label: 'Hover lift',
        value: '−1px, e0 → e3',
        kind: 'motion',
        note: 'One pixel and one elevation step. Any more and the card appears to jump, which makes it harder to click.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Outlined and elevated background' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Filled background' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Elevated background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Card edge, header and footer dividers' },
    { category: 'color', token: '--ds-accent', usedFor: 'Selected border' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover wash on filled cards' },
    { category: 'spacing', token: 'padding', value: '14 / 20 / 24px', usedFor: 'sm / md / lg' },
    { category: 'spacing', token: 'grid gap', value: '12–16px', usedFor: 'Between cards in a collection' },
    { category: 'radius', token: '--radius-xl', value: '16px', usedFor: 'Card corners' },
    { category: 'shadow', token: '--shadow-e1 … e3', usedFor: 'Resting and hover elevation' },
    { category: 'typography', token: '--text-h4', usedFor: 'Card title' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Card body' },
    { category: 'motion', token: 'duration', value: '180ms standard', usedFor: 'Hover lift and shadow' },
  ],

  sizes: [
    { name: 'Compact', padding: '14px', radius: '16px', gap: '8px', minWidth: '200px', use: 'Dense grids, sidebar cards, list items.' },
    { name: 'Default', padding: '20px', radius: '16px', gap: '12px', minWidth: '240px', maxWidth: '640px', use: 'The standard. Collections, forms, panels.' },
    { name: 'Comfortable', padding: '24px', radius: '16px', gap: '16px', minWidth: '320px', maxWidth: '760px', use: 'Marketing surfaces and single-card pages.' },
    { name: 'Stat tile', padding: '16px', radius: '16px', minWidth: '160px', use: 'Dashboard metrics. Four across at 1024px.' },
    { name: 'Grid track', minWidth: '15rem', gap: '12px', use: 'auto-fill minmax(15rem, 1fr) — reflows with no media queries.' },
  ],

  do: [
    {
      title: 'Make an interactive card a single target',
      why: 'One <a> or <button> wrapping the whole card gives one focus stop, one hover state and one obvious action. Three nested links inside a clickable card is a keyboard trap and an ambiguous click.',
      render: (
        <Card interactive as="a" padding="sm" className="w-48">
          <p className="text-label text-[var(--ds-fg)]">api-gateway</p>
          <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">One link, one target</p>
        </Card>
      ),
    },
    {
      title: 'Let the grid reflow itself',
      why: 'auto-fill with minmax means the card count per row adapts to any container — including a resized panel, where media queries know nothing.',
      render: (
        <div
          className="grid w-full gap-2"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(7rem, 1fr))' }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]" />
          ))}
        </div>
      ),
    },
    {
      title: 'Keep the padding larger than the internal gaps',
      why: 'If a card has 16px padding and 16px gaps, the content looks like it is trying to escape. One step of difference reads as deliberate containment.',
      render: (
        <Card padding="md" className="w-48">
          <Stack gap="sm">
            <span className="h-3 rounded-[3px] bg-[var(--ds-layer-active)]" />
            <span className="h-3 w-2/3 rounded-[3px] bg-[var(--ds-layer-active)]" />
          </Stack>
        </Card>
      ),
    },
    {
      title: 'Match the skeleton to the card',
      why: 'A loading placeholder that is the same size and shape as the real card means no layout shift when data lands, and the user keeps their place.',
      render: (
        <Row gap="sm">
          <div className="w-24 rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] p-3">
            <div className="h-3 w-full animate-pulse rounded-[3px] bg-[var(--ds-layer-active)]" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-[3px] bg-[var(--ds-layer-active)]" />
          </div>
          <MiniCard className="w-24" />
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not nest cards',
      why: 'Two borders and two shadows one inside the other is visual noise with no added meaning. The inner grouping should be spacing, or at most a filled block with no border.',
      render: (
        <Card padding="sm" className="w-52">
          <Card padding="sm" variant="outlined">
            <Card padding="sm" variant="outlined">
              <p className="text-caption text-[var(--ds-fg-muted)]">Three borders deep</p>
            </Card>
          </Card>
        </Card>
      ),
    },
    {
      title: 'Do not put multiple links inside a clickable card',
      why: 'Nested interactive elements inside a link are invalid HTML, produce unpredictable activation, and leave keyboard users unable to reach the inner controls reliably.',
      render: (
        <Card interactive as="a" padding="sm" className="w-52">
          <p className="text-label text-[var(--ds-fg)]">Project</p>
          <Row gap="sm" className="mt-2">
            <a href="#/card" className="text-caption text-[var(--ds-accent-text)] underline">Settings</a>
            <a href="#/card" className="text-caption text-[var(--ds-accent-text)] underline">Logs</a>
          </Row>
        </Card>
      ),
    },
    {
      title: 'Do not use cards for comparable rows',
      why: 'Six cards each with the same four fields is a table drawn badly. A table aligns the fields into columns, which is what makes them comparable.',
      render: (
        <Stack gap="sm" className="w-full">
          {['api-gateway', 'billing-worker'].map((n) => (
            <Card key={n} padding="sm">
              <div className="flex justify-between text-caption">
                <span className="font-mono">{n}</span>
                <span className="text-[var(--ds-fg-muted)]">Live · 3 regions · 18ms</span>
              </div>
            </Card>
          ))}
          <span className="text-caption text-[var(--ds-danger-text)]">…this wants to be a table</span>
        </Stack>
      ),
    },
    {
      title: 'Do not elevate every card in a grid',
      why: 'Elevation is relative. Twelve floating cards read as visual noise and none of them stands out — which was the reason for the shadow in the first place.',
      render: (
        <div className="grid w-full grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] shadow-e4" />
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A' },
      { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The card border must reach 3:1 against the page if it is the only thing separating the card from the background.',
      'In dark mode the surface itself carries the separation, so the hairline can be softer. In light mode both surfaces are white and the hairline is doing all the work.',
      'A selected card uses a border plus a 1px ring so the state survives greyscale and high-contrast mode.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches an interactive card as one stop. A static card is not focusable.' },
      { keys: 'Enter', does: 'Activates a card rendered as a link.' },
      { keys: 'Space', does: 'Activates a card rendered as a button. Links do not respond to Space.' },
      { keys: '↑ ↓ ← →', does: 'Optional roving focus in a card grid, so Tab does not stop on all forty.' },
    ],
    aria: [
      { attr: '<a> or <button>', on: 'The card root', note: 'A div with onClick is not focusable, does not respond to Enter, and announces as nothing.' },
      { attr: 'aria-labelledby', on: 'The card', note: 'Points at the card title, so the link announces as "api-gateway, link" rather than reading the whole card.' },
      { attr: 'aria-selected / aria-pressed', on: 'Selectable cards', note: 'aria-selected inside a listbox-like grid, aria-pressed for an independent toggle.' },
      { attr: '<article> or <li>', on: 'The card element', note: 'A collection of cards is a list. Marking it up as one gives screen-reader users the count for free.' },
      { attr: 'aria-busy', on: 'A loading card', note: 'On the container, not on each skeleton line. Announcing twelve grey rectangles is noise.' },
    ],
    focus:
      'A 2px ring at 2px offset around the whole card. Because the card already has a border and a radius, the offset matters — a flush ring reads as a thicker border rather than as focus.',
    screenReader: [
      'A card collection should be a real list, so it announces as "list, 12 items". A pile of divs announces as nothing.',
      'The accessible name of an interactive card should be the title, not the entire contents. Without aria-labelledby, the whole card is read as the link text.',
      'Do not hide the primary action behind hover. A "View" button that only appears on hover is unreachable by keyboard and invisible on touch.',
    ],
    touch:
      'A whole-card target is comfortably above 44px, which is one of the reasons cards work well on mobile. Keep any secondary action inside a card at least 44px and separated by 8px from the card edge.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Card, CardHeader, CardFooter, Panel, Stat } from '@/ui/Surface'

// Static card
<Card>
  <CardHeader title="api-gateway" description="Deployed 4 minutes ago" />
  <p className="mt-3 text-body-sm text-fg-muted">Three regions, twelve instances.</p>
  <CardFooter>
    <Button size="sm" variant="text">Logs</Button>
    <Button size="sm" variant="outlined">Rollback</Button>
  </CardFooter>
</Card>

// Interactive: ONE target for the whole card
<Card as="a" href={'/projects/' + id} interactive aria-labelledby={titleId}>
  <h3 id={titleId}>{project.name}</h3>
  <p>{project.summary}</p>
</Card>

// A collection is a real list
<ul className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(15rem,1fr))]">
  {projects.map((p) => (
    <li key={p.id}>
      <Card as="a" href={p.href} interactive>…</Card>
    </li>
  ))}
</ul>

// Panel: a card whose header holds controls
<Panel title="Recent deployments" actions={<Button size="xs">View all</Button>} bodyClassName="p-0">
  <DeploymentList />
</Panel>

// Stat tile
<Stat label="Requests" value="1.24M" delta={12.4} deltaLabel="vs last week" spark={series} />`,
    },
    html: {
      lang: 'html',
      code: `<article class="ds-card">
  <header class="ds-card__header">
    <h3 class="ds-card__title" id="card-1-title">api-gateway</h3>
    <p class="ds-card__desc">Deployed 4 minutes ago</p>
  </header>

  <div class="ds-card__body">Three regions, twelve instances.</div>

  <footer class="ds-card__footer">
    <button class="ds-btn ds-btn--text ds-btn--sm">Logs</button>
    <button class="ds-btn ds-btn--outlined ds-btn--sm">Rollback</button>
  </footer>
</article>

<!-- Interactive: the anchor IS the card, and it names itself -->
<a class="ds-card ds-card--interactive" href="/projects/1" aria-labelledby="card-1-title">
  <h3 id="card-1-title">api-gateway</h3>
  <p>Three regions, twelve instances.</p>
</a>`,
    },
    css: {
      lang: 'css',
      code: `.ds-card {
  position: relative;
  padding: 20px;                          /* one step above any inner gap */
  background: var(--ds-surface);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-xl);        /* 16 — inner radii cap at ~8 */
  transition:
    transform  180ms var(--ease-standard),
    box-shadow 180ms var(--ease-standard),
    border-color 180ms var(--ease-standard);
}

.ds-card--interactive {
  cursor: pointer;
  display: block;
  color: inherit;
  text-decoration: none;
}
.ds-card--interactive:hover {
  transform: translateY(-1px);            /* one pixel, not four */
  border-color: var(--ds-border);
  box-shadow: var(--shadow-e3);
}
.ds-card--interactive:active {
  transform: none;
  box-shadow: var(--shadow-e1);
}
.ds-card--interactive:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Selected: border plus a ring, so the edge reads as 2px without reflow */
.ds-card[data-selected] {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 1px var(--ds-accent);
}

/* Footer divider gets more air above than below */
.ds-card__footer {
  margin-block-start: 20px;
  padding-block-start: 16px;
  border-block-start: 1px solid var(--ds-border-subtle);
}

/* Clip anything that reaches the rounded edge */
.ds-card--media { overflow: hidden; padding: 0; }

@media (prefers-reduced-motion: reduce) {
  .ds-card--interactive:hover { transform: none; }
}`,
    },
    api: [
      {
        name: 'Card',
        props: [
          { name: 'variant', type: "'outlined' | 'filled' | 'elevated'", default: "'outlined'", description: 'Outlined covers almost everything.' },
          { name: 'elevation', type: '0 | 1 | 2 | 3', default: '0', description: 'Resting shadow. Interactive cards go to e3 on hover regardless.' },
          { name: 'interactive', type: 'boolean', default: 'false', description: 'Adds hover lift, pointer and a focus ring. Pair with as="a" or as="button".' },
          { name: 'selected', type: 'boolean', default: 'false', description: 'Accent border plus a 1px ring.' },
          { name: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'none for full-bleed media; pad the inner content instead.' },
          { name: 'as', type: 'ElementType', default: "'div'", description: "'a' or 'button' when the card is one target." },
        ],
      },
      {
        name: 'CardHeader',
        props: [
          { name: 'title', type: 'ReactNode', required: true, description: 'Rendered as an h3.' },
          { name: 'description', type: 'ReactNode', description: 'One line under the title, 4px gap.' },
          { name: 'icon', type: 'ReactNode', description: 'Leading glyph in a 32px tinted square.' },
          { name: 'actions', type: 'ReactNode', description: 'Right-aligned. Omit on interactive cards.' },
          { name: 'divided', type: 'boolean', default: 'false', description: 'Adds a rule and 16px of space below.' },
        ],
      },
      {
        name: 'Stat',
        props: [
          { name: 'value', type: 'ReactNode', required: true, description: 'The number. Rendered at h2 with tabular figures.' },
          { name: 'delta', type: 'number', description: 'Percentage change. Paired with an arrow, a sign and hidden text.' },
          { name: 'spark', type: 'number[]', description: 'Sparkline series. Decorative, aria-hidden.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Ask "could this be a link?" before adding a card. If the answer is no, a heading and whitespace will read better and weigh less.',
      'For a card with a full-bleed image, set padding="none" and pad the text block instead — and put overflow-hidden on the card so the image does not square off the corners.',
      'In a grid, give every card the same height with align-items: stretch and push the footer down with margin-top: auto. Ragged card bottoms make a grid look broken.',
      'A card that contains a form should not also be clickable. Pick one: container or target.',
    ],
    performance: [
      'content-visibility: auto on offscreen cards skips their layout and paint entirely. On a page with two hundred cards this is often the single biggest win.',
      'Virtualise past about a hundred cards. Cards are heavier than table rows because each one is a small layout of its own.',
      'Do not animate box-shadow on a grid of cards during scroll. Shadow is painted on the CPU; use a pre-composited layer or animate opacity between two stacked shadows.',
      'Lazy-load card images with loading="lazy" and an explicit width and height, or the grid reflows as each one arrives.',
    ],
    mistakes: [
      'A div with onClick as the card root — not focusable, no Enter, announces as nothing.',
      'Nested interactive elements inside a card that is itself a link. Invalid HTML and unpredictable behaviour.',
      'Forgetting overflow-hidden on a card with an image, so the image squares off the rounded corners.',
      'Using a card to section a page, then wondering why the page looks busy. Sections want headings, not borders.',
      'Hover-only actions inside a card. Invisible on touch, unreachable by keyboard.',
    ],
    realWorld: [
      'Cards are the right default for mobile and the wrong default for dense desktop data. Many products need both: a card list under md and a table above it.',
      'In a dashboard, keep stat tiles to one row of four. A second row of metrics is almost never read, and it pushes the actual content below the fold.',
      'When a card grid regularly holds more than about fifty items, users are searching rather than browsing. Add search and filtering before adding pagination.',
      'Give every card exactly one primary action and hide the rest behind an overflow menu. Three visible buttons per card multiplied by twelve cards is thirty-six competing targets.',
    ],
  },
})

function MiniCard({ className }: { className?: string }) {
  return (
    <div
      className={`w-40 rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3 transition-all ${className ?? ''}`}
    >
      <p className="text-label-sm text-[var(--ds-fg)]">api-gateway</p>
      <p className="mt-1 text-[10px] text-[var(--ds-fg-muted)]">3 regions · 18ms</p>
    </div>
  )
}
