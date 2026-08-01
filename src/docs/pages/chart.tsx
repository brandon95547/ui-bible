import * as React from 'react'
import { cn } from '@/lib/cn'
import { Sparkline, Stat } from '@/ui/Surface'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   Deterministic data. No Date.now(), no Math.random() — the page must render
   identically everywhere, and a chart that changes on refresh cannot be
   reviewed.
   ------------------------------------------------------------------------ */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const SERIES = [
  { id: 'prod', label: 'Production', color: 'var(--p-viz-1)', data: [312, 340, 388, 402, 461, 498, 542] },
  { id: 'stage', label: 'Staging', color: 'var(--p-viz-2)', data: [180, 210, 196, 240, 268, 251, 290] },
  { id: 'dev', label: 'Development', color: 'var(--p-viz-3)', data: [90, 120, 140, 132, 165, 190, 205] },
]

const W = 420
const H = 140
const PAD = { t: 8, r: 8, b: 22, l: 34 }
const MAX = 600

const x = (i: number) => PAD.l + (i / (MONTHS.length - 1)) * (W - PAD.l - PAD.r)
const y = (v: number) => PAD.t + (1 - v / MAX) * (H - PAD.t - PAD.b)

function Axes({ ticks = [0, 200, 400, 600] }: { ticks?: number[] }) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          {/* Recessive: the grid supports the marks, it does not compete. */}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--ds-border-subtle)"
            strokeWidth={1}
          />
          <text
            x={PAD.l - 6}
            y={y(t)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-[var(--ds-fg-muted)] text-[9px] tabular-nums"
          >
            {t}
          </text>
        </g>
      ))}
      {MONTHS.map((m, i) => (
        <text
          key={m}
          x={x(i)}
          y={H - 6}
          textAnchor="middle"
          className="fill-[var(--ds-fg-muted)] text-[9px]"
        >
          {m}
        </text>
      ))}
    </g>
  )
}

function LineChart({ count = 3, labelled = true }: { count?: number; labelled?: boolean }) {
  const series = SERIES.slice(0, count)
  return (
    <figure className="w-full">
      <figcaption className="mb-1 text-label text-[var(--ds-fg)]">
        Deployments per month
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Line chart. Deployments per month, January to July. ${series
          .map((s) => `${s.label} rises from ${s.data[0]} to ${s.data[s.data.length - 1]}`)
          .join('. ')}.`}
        className="w-full"
      >
        <Axes />
        {series.map((s) => (
          <g key={s.id}>
            <path
              d={s.data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')}
              fill="none"
              stroke={s.color}
              // 2px lines: thin enough to overlap legibly, thick enough to see.
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* A 2px surface ring so overlapping marks stay separable. */}
            <circle
              cx={x(s.data.length - 1)}
              cy={y(s.data[s.data.length - 1])}
              r={4}
              fill={s.color}
              stroke="var(--ds-surface)"
              strokeWidth={2}
            />
            {labelled && (
              // Direct labels: identity is never colour alone.
              <text
                x={x(s.data.length - 1) - 8}
                y={y(s.data[s.data.length - 1]) - 8}
                textAnchor="end"
                className="fill-[var(--ds-fg-secondary)] text-[9px] font-medium"
              >
                {s.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {/* A legend is always present for two or more series. */}
      {series.length > 1 && (
        <Row gap="md" className="mt-1.5">
          {series.map((s) => (
            <Row key={s.id} gap="sm" align="center">
              <span
                aria-hidden
                className="block h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              <span className="text-caption text-[var(--ds-fg-secondary)]">{s.label}</span>
            </Row>
          ))}
        </Row>
      )}
    </figure>
  )
}

function BarChart({ stacked }: { stacked?: boolean }) {
  const bw = 22
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Bar chart of deployments per month" className="w-full">
      <Axes />
      {MONTHS.map((m, i) => {
        if (!stacked) {
          return (
            <rect
              key={m}
              x={x(i) - bw / 2}
              y={y(SERIES[0].data[i])}
              width={bw}
              height={y(0) - y(SERIES[0].data[i])}
              // 4px rounded data-end, anchored to the baseline.
              rx={4}
              fill={SERIES[0].color}
            />
          )
        }
        let acc = 0
        return (
          <g key={m}>
            {SERIES.map((s, si) => {
              const h = y(0) - y(s.data[i])
              const yy = y(0) - acc - h
              acc += h + 2 // 2px surface gap between stacked segments
              return (
                <rect
                  key={s.id}
                  x={x(i) - bw / 2}
                  y={yy}
                  width={bw}
                  height={Math.max(0, h)}
                  rx={si === SERIES.length - 1 ? 4 : 0}
                  fill={s.color}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function Playground() {
  const [form, setForm] = React.useState<'line' | 'bar' | 'stacked'>('line')
  const [count, setCount] = React.useState<'1' | '2' | '3'>('3')
  const [labels, setLabels] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Form">
            <KnobSelect
              value={form}
              onChange={setForm}
              options={['line', 'bar', 'stacked'] as const}
            />
          </Knob>
          <Knob label="Series">
            <KnobSelect value={count} onChange={setCount} options={['1', '2', '3'] as const} />
          </Knob>
          <KnobToggle checked={labels} onChange={setLabels} label="Direct labels" />
        </div>
      }
      code={`<Chart
  type="${form === 'stacked' ? 'bar' : form}"${form === 'stacked' ? '\n  stacked' : ''}
  data={deployments}
  series={SERIES.slice(0, ${count})}
  xKey="month"
  directLabels={${labels}}
/>`}
    >
      <div className="w-full max-w-xl">
        {form === 'line' ? (
          <LineChart count={Number(count)} labelled={labels} />
        ) : (
          <BarChart stacked={form === 'stacked'} />
        )}
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'chart',
    title: 'Chart',
    tagline:
      'Encoding data as position, length and colour — and the four chart types that honestly cover ninety per cent of cases.',
    keywords: ['graph', 'plot', 'sparkline', 'data visualisation', 'axis', 'legend', 'series', 'categorical'],
  },

  overview: {
    purpose:
      'A chart turns numbers into a shape the eye can read faster than a table. Which shape depends entirely on the question: magnitude wants length, change over time wants position, and a single headline number wants no chart at all. Getting the form right is most of the work; colour is the last decision, not the first.',
    whenToUse: [
      'Comparing magnitudes across a handful of categories.',
      'Showing change over time, where the shape of the trend is the point.',
      'Showing composition, when the parts genuinely sum to a meaningful whole.',
      'Giving a number context — a sparkline beside a stat answers "is this normal?".',
    ],
    whenNotToUse: [
      {
        text: 'There is one number.',
        instead: 'a stat tile — a chart of one value is decoration around a figure',
        to: '#/card',
      },
      {
        text: 'The user needs exact values or wants to sort them.',
        instead: 'a Data Table',
        to: '#/data-table',
      },
      {
        text: 'It shows progress towards a known total.',
        instead: 'a Progress Indicator',
        to: '#/progress-indicator',
      },
      {
        text: 'There are more than about eight series.',
        instead: 'small multiples, or an "Other" bucket — a nine-hue legend is unreadable',
        to: '#/grid',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Pick the form from the job, then colour last.</strong> Magnitude across
          categories is bars; change over time is a line; composition is stacked bars, and almost
          never a pie. Most bad charts are bad because the colour decision was made first and the
          form was whatever the library defaulted to.
        </p>
        <p>
          <strong>One axis, always.</strong> A dual-axis chart lets whoever drew it choose the
          scales, which means it can be made to show almost any relationship. Two measures of
          different magnitude become two charts, small multiples, or both indexed to a common
          base.
        </p>
        <p>
          Colour is assigned by <strong>the job it does</strong>: categorical for identity in a
          fixed order that never cycles, sequential for magnitude as one hue light to dark,
          diverging for polarity with a neutral midpoint. Status colours are reserved and never
          become "series four".
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'forms',
        title: 'Four forms cover almost everything',
        description:
          'Bars for magnitude, lines for change over time, stacked bars for composition, and a sparkline where the trend is context for a number rather than the subject.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Magnitude" sub="Bars" tone="good">
                <BarChart />
              </Cell>
              <Cell label="Over time" sub="Line" tone="good">
                <LineChart count={2} labelled={false} />
              </Cell>
              <Cell label="Composition" sub="Stacked bars" tone="good">
                <BarChart stacked />
              </Cell>
              <Cell label="Context for a number" sub="Sparkline" tone="good">
                <Stat
                  label="Deployments"
                  value="542"
                  delta={8.6}
                  deltaLabel="vs last month"
                  spark={SERIES[0].data}
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'palette',
        title: 'The categorical palette, measured',
        description:
          'The eight viz tokens in order. Running the CVD validator against them gives a specific, non-negotiable ceiling — and it is lower than eight.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-lg">
              <Row gap="sm">
                {Array.from({ length: 8 }, (_, i) => (
                  <Stack key={i} gap="xs" className="items-center">
                    <span
                      className="block h-8 w-8 rounded-[var(--radius-sm)]"
                      style={{ background: `var(--p-viz-${i + 1})` }}
                    />
                    <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">{i + 1}</span>
                  </Stack>
                ))}
              </Row>
              <p className="text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
                Slots 1–4 separate cleanly for every form of colour vision deficiency (worst
                adjacent pair ΔE 9.2, protanopia). Slots 5 and 6 — the pink and the teal —
                collapse to ΔE 2.7 under deuteranopia, which is indistinguishable. Past four
                series, identity must not rest on colour: use direct labels, a texture, or split
                into small multiples.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'dual-axis',
        title: 'Never a second y-axis',
        description:
          'Two scales let whoever drew the chart choose where the lines cross, which means the chart can be made to show almost any relationship. Two charts, or index both to a common base.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Two charts" tone="good">
                <Stack gap="sm">
                  <LineChart count={1} labelled={false} />
                  <BarChart />
                </Stack>
              </Cell>
              <Cell label="Two axes" sub="Shows whatever you scale it to" tone="bad">
                <div className="relative">
                  <LineChart count={2} labelled={false} />
                  <span className="absolute inset-y-0 right-0 w-8 border-l border-dashed border-[var(--ds-danger-border)]" />
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'labels',
        title: 'Direct labels beat a legend lookup',
        description:
          'Up to four series, label the lines where they end. The legend stays for identification, but the eye should not have to travel to it on every glance.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-lg">
              <LineChart count={3} labelled />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Line', render: <div className="w-40"><LineChart count={1} labelled={false} /></div> },
      { label: 'Bar', render: <div className="w-40"><BarChart /></div> },
      { label: 'Stacked', render: <div className="w-40"><BarChart stacked /></div> },
      { label: 'Sparkline', render: <div className="w-24"><Sparkline data={SERIES[0].data} /></div> },
      {
        label: 'Sparkline down',
        render: <div className="w-24"><Sparkline data={[...SERIES[0].data].reverse()} up={false} /></div>,
      },
      {
        label: 'Stat + spark',
        render: <div className="w-40"><Stat label="Deployments" value="542" delta={8.6} spark={SERIES[0].data} /></div>,
      },
      {
        label: 'Legend swatch',
        render: (
          <Row gap="sm" align="center">
            <span className="block h-2 w-2 rounded-full" style={{ background: 'var(--p-viz-1)' }} />
            <span className="text-caption text-[var(--ds-fg-secondary)]">Production</span>
          </Row>
        ),
      },
      {
        label: 'Empty',
        render: (
          <span className="grid h-16 w-40 place-items-center rounded-[var(--radius-md)] border border-dashed border-[var(--ds-border-subtle)] text-caption text-[var(--ds-fg-muted)]">
            No data for this range
          </span>
        ),
      },
      {
        label: 'Loading',
        render: <span className="block h-16 w-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xl">
        <LineChart count={3} labelled />
      </div>
    ),
    caption:
      'A title that states what is measured, a recessive grid, 2px marks with surface-ringed endpoints, direct labels, and a legend that is always present for two or more series.',
    parts: [
      {
        n: 1,
        label: 'Title',
        value: 'What is measured, in units',
        kind: 'type',
        note: '"Deployments per month", not "Deployments". A chart whose title omits the unit is a chart the reader has to infer.',
      },
      {
        n: 2,
        label: 'Grid',
        value: '1px, --ds-border-subtle',
        kind: 'color',
        note: 'Recessive. The grid supports the marks; a grid the same weight as the data competes with it.',
      },
      {
        n: 3,
        label: 'Axis labels',
        value: '9–11px, muted, tabular',
        kind: 'type',
        note: 'Tabular figures so the tick column does not jitter, and few enough ticks that none of them collide.',
      },
      {
        n: 4,
        label: 'Line weight',
        value: '2px',
        kind: 'size',
        note: 'Thin enough that two overlapping lines stay readable, thick enough to follow across a busy grid.',
      },
      {
        n: 5,
        label: 'Endpoint',
        value: '4px dot, 2px surface ring',
        kind: 'shape',
        note: 'The ring is what keeps overlapping marks separable where two series end at the same value.',
      },
      {
        n: 6,
        label: 'Bar radius',
        value: '4px on the data end only',
        kind: 'shape',
        note: 'Rounded at the value, square at the baseline. Rounding both ends detaches the bar from the axis it is measured against.',
      },
      {
        n: 7,
        label: 'Stacked gap',
        value: '2px of surface',
        kind: 'space',
        note: 'Between segments, so the boundary is a gap rather than a colour change the eye has to resolve.',
      },
      {
        n: 8,
        label: 'Legend',
        value: 'Always for ≥ 2 series',
        kind: 'space',
        note: 'A single series needs none — the title names it. Two or more always need one, even with direct labels.',
      },
    ],
  },

  tokens: [
    { category: 'color', group: 'Categorical', token: '--p-viz-1 … --p-viz-8', usedFor: 'Series identity, assigned in fixed order and never cycled' },
    { category: 'color', group: 'Categorical', token: '--p-viz-1', value: '#7c6cff', usedFor: 'First series, always' },
    { category: 'color', group: 'Chrome', token: '--ds-border-subtle', usedFor: 'Grid lines' },
    { category: 'color', group: 'Chrome', token: '--ds-fg-muted', usedFor: 'Axis labels and tick values' },
    { category: 'color', group: 'Chrome', token: '--ds-fg-secondary', usedFor: 'Direct labels and legend text — never the series colour' },
    { category: 'color', group: 'Chrome', token: '--ds-surface', usedFor: 'The ring around overlapping marks and the gap in a stack' },
    { category: 'color', group: 'Reserved', token: '--ds-success / --ds-danger', usedFor: 'Status only. Never "series 4".' },
    { category: 'spacing', token: 'stack gap', value: '2px', usedFor: 'Between stacked segments' },
    { category: 'radius', token: 'data end', value: '4px', usedFor: 'Bar tips, square at the baseline' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Every number in a chart' },
  ],

  sizes: [
    { name: 'Sparkline', height: '32px', minWidth: '60px', use: 'Context beside a number. No axes, no labels — shape only.' },
    { name: 'Card chart', height: '140px', use: 'Inside a dashboard tile. Two or three ticks per axis at most.' },
    { name: 'Section chart', height: '240px', use: 'The default for a chart that is the subject of its section.' },
    { name: 'Full analysis', height: '360px+', use: 'A dedicated view with filters, a legend and a table alternative.' },
    { name: 'Bar width', minWidth: '16px', gap: '≥ 2px', use: 'Below 16px a bar stops reading as a magnitude and becomes a tick.' },
    { name: 'Series ceiling', maxWidth: '4 by colour', use: 'Four separate cleanly for every form of CVD. Past four, identity needs a second encoding.' },
  ],

  do: [
    {
      title: 'Validate the palette rather than eyeballing it',
      why: 'Colour-vision separation is computable. Running the check on this system’s own tokens produced a hard ceiling that no amount of looking would have revealed.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">viz 1–4 · worst ΔE 9.2 · passes</span>
          <span className="text-[var(--ds-danger-text)]">viz 5↔6 · ΔE 2.7 deutan · fails</span>
        </Stack>
      ),
    },
    {
      title: 'Label directly up to four series',
      why: 'A legend makes the eye leave the data to decode it. A label at the end of the line answers the question where the question is asked.',
      render: <div className="w-44"><LineChart count={2} labelled /></div>,
    },
    {
      title: 'Start bar axes at zero',
      why: 'A bar encodes magnitude by length. Truncating the axis makes a 4% difference look like a 40% one, which is the most effective way to mislead with a chart.',
      render: (
        <Row gap="sm" align="end">
          <span className="block w-6 rounded-t-[4px] bg-[var(--p-viz-1)]" style={{ height: 40 }} />
          <span className="block w-6 rounded-t-[4px] bg-[var(--p-viz-1)]" style={{ height: 44 }} />
          <span className="ml-2 text-caption text-[var(--ds-fg-muted)]">4% is 4%</span>
        </Row>
      ),
    },
    {
      title: 'Offer the numbers as well as the picture',
      why: 'A table view is the accessible alternative, the print fallback and the way anyone copies the values. It costs a toggle.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          Chart · Table ← one toggle
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use two y-axes',
      why: 'The person drawing the chart chooses both scales, which means they choose where the lines cross. It can be made to show almost any relationship.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          revenue (£) and error rate (%) on one plot → any correlation you like
        </span>
      ),
    },
    {
      title: 'Do not use a pie for more than about three slices',
      why: 'People compare angles badly. Anything past three slices is read more accurately as a bar chart, and a pie with a legend is two lookups per slice.',
      render: (
        <span
          aria-hidden
          className="block h-16 w-16 rounded-full border border-[var(--ds-danger-border)]"
          style={{
            background:
              'conic-gradient(var(--p-viz-1) 0 22%, var(--p-viz-2) 0 39%, var(--p-viz-3) 0 53%, var(--p-viz-4) 0 66%, var(--p-viz-5) 0 78%, var(--p-viz-6) 0 88%, var(--p-viz-7) 0 100%)',
          }}
        />
      ),
    },
    {
      title: 'Do not cycle the palette past eight series',
      why: 'A ninth series repeating the first colour makes two different things look identical. Bucket the tail into "Other" or use small multiples.',
      render: (
        <Row gap="sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 1, 2].map((n, i) => (
            <span
              key={i}
              className={cn('block h-6 w-4 rounded-[3px]', i >= 8 && 'ring-1 ring-[var(--ds-danger-border)]')}
              style={{ background: `var(--p-viz-${n})` }}
            />
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not label every point',
      why: 'A number on every mark is a table drawn as a chart. Label the first, the last, and any point the surrounding text refers to.',
      render: (
        <Row gap="sm" align="end" className="text-[9px] text-[var(--ds-danger-text)]">
          {SERIES[0].data.map((v, i) => (
            <Stack key={i} gap="xs" className="items-center">
              <span>{v}</span>
              <span className="block w-3 rounded-t-[3px] bg-[var(--p-viz-1)]" style={{ height: v / 12 }} />
            </Stack>
          ))}
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.5', name: 'Images of Text', level: 'AA' },
    ],
    contrast: [
      'Every series colour must reach 3:1 against the chart surface. All eight viz tokens pass on this system’s dark canvas.',
      'Adjacent series must separate under colour-vision deficiency. Slots 1–4 reach ΔE 9.2 at worst; slots 5 and 6 collapse to 2.7 under deuteranopia and must not be relied on alone.',
      'Grid lines are deliberately below text contrast — they are chrome, not content, and a grid at 4.5:1 competes with the data.',
      'Labels and legend text use ink tokens, never the series colour. Coloured text at 9px rarely reaches its ratio and reads as decoration.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the chart region when it is interactive, then the table toggle and any filters.' },
      { keys: '← / →', does: 'Moves between data points in an interactive chart, announcing each value.' },
      { keys: 'Tab', does: 'Reaches the legend when legend items toggle series visibility — they are buttons, not swatches.' },
    ],
    aria: [
      { attr: 'role="img"', on: 'A static chart', note: 'With an aria-label summarising the shape and the endpoints. "Chart" alone conveys nothing.' },
      { attr: 'aria-label', on: 'The chart', note: 'State the trend, not the pixels: "Production rises from 312 to 542 between January and July".' },
      { attr: '<figure> / <figcaption>', on: 'The wrapper', note: 'The caption is the title and is read by everyone.' },
      { attr: 'A table alternative', on: 'Beside the chart', note: 'The most useful accessibility feature a chart can have, and it also serves print, copy and export.' },
      { attr: 'aria-hidden', on: 'Grid lines and decorative marks', note: 'They are chrome. Announcing every tick is noise.' },
    ],
    focus:
      'A static chart is not focusable. An interactive one is a single tab stop with arrow-key traversal inside, announcing each point as it moves — never one tab stop per data point.',
    screenReader: [
      'The label should describe the shape and the endpoints, which is what a sighted reader takes away in one glance.',
      'Provide the table view. A screen-reader user reading a summary is getting your interpretation; the table gives them the data.',
      'Never rely on colour alone for identity — direct labels, patterns or a table are what make a multi-series chart readable without it.',
    ],
    touch:
      'Hit targets must be larger than the marks — a 4px dot needs a 24px invisible target. Tap to pin a tooltip rather than relying on hover, which does not exist. On a narrow screen, reduce the tick count rather than rotating labels: rotated axis labels are hard to read at any size.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Chart } from '@/ui/Chart'

<Chart
  type="line"
  title="Deployments per month"        // states the unit
  data={rows}
  xKey="month"
  series={[
    { key: 'production',  label: 'Production',  color: 'var(--p-viz-1)' },
    { key: 'staging',     label: 'Staging',     color: 'var(--p-viz-2)' },
  ]}
  directLabels                         // up to 4 series
  tableToggle                          // the accessible alternative
/>

// Colour follows the ENTITY, never its rank. A filter that removes a series
// must not repaint the survivors.
const COLOR_BY_ENV = {
  production:  'var(--p-viz-1)',
  staging:     'var(--p-viz-2)',
  development: 'var(--p-viz-3)',
} as const

// Past four series colour alone is not enough — this system's own palette
// collapses at slots 5 and 6 under deuteranopia (ΔE 2.7).
if (series.length > 4) {
  // direct labels, a texture fill, or small multiples — pick one
}

// Never two y-scales. Index both measures to a common base instead.
const indexed = rows.map((r) => ({
  month: r.month,
  revenue:   (r.revenue   / rows[0].revenue)   * 100,
  errorRate: (r.errorRate / rows[0].errorRate) * 100,
}))`,
    },
    html: {
      lang: 'html',
      code: `<figure class="ds-chart">
  <figcaption>Deployments per month</figcaption>

  <!-- The label describes the SHAPE, which is what a sighted reader takes
       away in one glance. -->
  <svg
    viewBox="0 0 420 140"
    role="img"
    aria-label="Line chart. Deployments per month, January to July.
                Production rises from 312 to 542. Staging rises from 180 to 290."
  >
    <g aria-hidden="true"><!-- grid and axes: chrome, not content --></g>
    <path d="M34,96 L98,88 …" fill="none" stroke="var(--p-viz-1)" stroke-width="2" />
  </svg>

  <!-- Always present for two or more series. -->
  <ul class="ds-chart__legend">
    <li><span style="--swatch: var(--p-viz-1)"></span> Production</li>
    <li><span style="--swatch: var(--p-viz-2)"></span> Staging</li>
  </ul>

  <!-- The most useful accessibility feature a chart has — and it serves
       print, copy and export too. -->
  <button type="button" aria-expanded="false" aria-controls="chart-table">
    View as table
  </button>
  <table id="chart-table" hidden>…</table>
</figure>`,
    },
    css: {
      lang: 'css',
      code: `.ds-chart figcaption {
  font-size: 13px;
  color: var(--ds-fg);
  margin-block-end: 4px;
}

/* Recessive. A grid at text contrast competes with the data it supports. */
.ds-chart .grid line { stroke: var(--ds-border-subtle); stroke-width: 1; }

.ds-chart .axis text {
  fill: var(--ds-fg-muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;   /* so the tick column never jitters */
}

/* Thin enough that two overlapping lines stay readable. */
.ds-chart .line { fill: none; stroke-width: 2; stroke-linejoin: round; }

/* The ring keeps overlapping marks separable where two series meet. */
.ds-chart .point { stroke: var(--ds-surface); stroke-width: 2; }

/* Rounded at the value, square at the baseline: rounding both ends detaches
   the bar from the axis it is measured against. */
.ds-chart .bar { rx: 4; }

/* Text wears ink tokens, never the series colour — coloured text at 9px
   rarely reaches its ratio. */
.ds-chart .label,
.ds-chart__legend { color: var(--ds-fg-secondary); font-size: 12px; }

.ds-chart__legend span {
  inline-size: 8px;
  block-size: 8px;
  border-radius: 999px;
  background: var(--swatch);
}

/* Colour is gone here: identity must already be carried by labels or
   patterns. */
@media (forced-colors: active) {
  .ds-chart .line { stroke: CanvasText; }
}`,
    },
    api: [
      {
        name: 'Chart',
        props: [
          { name: 'type', type: "'line' | 'bar' | 'area'", required: true, description: 'Chosen from the job: magnitude is bars, change over time is a line.' },
          { name: 'title', type: 'string', required: true, description: 'States what is measured and in what unit.' },
          { name: 'series', type: '{ key: string; label: string; color: string }[]', required: true, description: 'Colour bound to the entity, not its rank, so filtering never repaints the survivors.' },
          { name: 'stacked', type: 'boolean', default: 'false', description: 'Only when the parts sum to a meaningful whole, with a 2px surface gap between segments.' },
          { name: 'directLabels', type: 'boolean', default: 'true', description: 'Up to four series. Past that, labels collide and small multiples are the answer.' },
          { name: 'tableToggle', type: 'boolean', default: 'true', description: 'The accessible alternative, and the way anyone copies the numbers.' },
          { name: 'baseline', type: "'zero' | 'auto'", default: "'zero'", description: 'Zero for bars, always. Truncating a length encoding is how charts mislead.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the sentence the chart is meant to support before drawing it. If you cannot, the chart has no job and probably should not exist.',
      'Sort bar charts by value rather than alphabetically, unless the categories have their own natural order. Sorting is most of what makes a bar chart readable.',
      'Put the units in the title, not on every tick. "Deployments per month" once beats "/mo" seven times.',
      'For time series, show the current value as a number beside the chart. People want the figure; the chart is there to say whether it is normal.',
      'Keep the data deterministic in documentation and tests. A chart that changes on refresh cannot be reviewed or screenshot-compared.',
    ],
    performance: [
      'Render as inline SVG under a few hundred points; move to canvas past a few thousand. The crossover is lower than most people expect.',
      'Downsample before rendering rather than drawing ten thousand points into six hundred pixels. Largest-triangle-three-buckets preserves the visible shape.',
      'Memoise scales and path strings on the data. Recomputing a path on every hover event is the usual cause of a laggy tooltip.',
      'Do not animate on every data update in a live chart. Transition on mount only; a chart animating every five seconds is unreadable.',
    ],
    mistakes: [
      'Two y-axes, which lets the author choose the relationship the chart appears to show.',
      'A truncated baseline on a bar chart, exaggerating small differences.',
      'A cycled palette, so series nine and series one look identical.',
      'Relying on colour alone past four series, where this system’s own palette collapses under deuteranopia.',
      'A pie chart with seven slices, which nobody can compare by angle.',
      'A number on every data point, which is a table drawn as a chart.',
      'Grid lines at data weight, competing with the marks.',
      'No table alternative, leaving the values unreachable.',
    ],
    realWorld: [
      'The most common chart in a product is a single number with a sparkline. It answers "what is it" and "is that normal" in one glance, and it needs no axes at all.',
      'Dual-axis charts survive because they look sophisticated. They are the single most misleading form in common use, and the fix — two charts — is always easier than the argument.',
      'Colour-vision deficiency affects roughly one in twelve men. Running the validator takes seconds and, on this system’s own palette, revealed a collision at four series that no review had caught.',
      'The table toggle gets used far more than anyone expects — by everyone, not only screen-reader users. People want to copy the numbers.',
    ],
  },
})
