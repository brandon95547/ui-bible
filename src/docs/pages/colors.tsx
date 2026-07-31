import * as React from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { contrastRatio } from '@/app/Inspector'
import { Badge } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Grid, PreviewStage, Row, Stack, Swatch, defineDoc } from '../framework/kit'

/* ---- ramps -------------------------------------------------------------- */

const RAMPS = [
  { name: 'neutral', label: 'Neutral', steps: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975] },
  { name: 'brand', label: 'Brand · Iris', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'success', label: 'Success · Emerald', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'warning', label: 'Warning · Amber', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'danger', label: 'Danger · Rose', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'info', label: 'Info · Blue', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
]

function Ramp({ name, label, steps }: (typeof RAMPS)[number]) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <h4 className="text-label text-[var(--ds-fg)]">{label}</h4>
        <code className="font-mono text-[10px] text-[var(--ds-fg-muted)]">--p-{name}-*</code>
      </div>
      <div className="flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
        {steps.map((s) => (
          <div
            key={s}
            className="group relative h-14 flex-1"
            style={{ background: `var(--p-${name}-${s})` }}
            title={`--p-${name}-${s}`}
          >
            <span
              className={cn(
                'absolute inset-x-0 bottom-1 text-center font-mono text-[9px] tabular-nums opacity-0 transition-opacity group-hover:opacity-100',
                s >= 500 ? 'text-white/90' : 'text-black/70',
              )}
            >
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- live contrast checker ---------------------------------------------- */

const PAIRS = [
  { fg: '--ds-fg', bg: '--ds-canvas', label: 'Body text on page' },
  { fg: '--ds-fg-secondary', bg: '--ds-surface', label: 'Secondary text on card' },
  { fg: '--ds-fg-muted', bg: '--ds-surface', label: 'Caption on card' },
  { fg: '--ds-accent-fg', bg: '--ds-accent', label: 'Label on filled button' },
  { fg: '--ds-accent-text', bg: '--ds-accent-subtle', label: 'Accent text on tonal fill' },
  { fg: '--ds-success-text', bg: '--ds-success-subtle', label: 'Success text on tint' },
  { fg: '--ds-warning-text', bg: '--ds-warning-subtle', label: 'Warning text on tint' },
  { fg: '--ds-danger-text', bg: '--ds-danger-subtle', label: 'Danger text on tint' },
  { fg: '--ds-danger-fg', bg: '--ds-danger', label: 'Label on danger button' },
  { fg: '--ds-fg-disabled', bg: '--ds-surface', label: 'Disabled text (exempt)' },
]

function ContrastMatrix() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [rows, setRows] = React.useState<{ label: string; ratio: number | null; fg: string; bg: string }[]>([])

  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    const cs = getComputedStyle(root)
    const solve = (v: string) => cs.getPropertyValue(v).trim()
    // Alpha tints must be composited against the surface they sit on before
    // the ratio means anything — this is where most contrast audits go wrong.
    const probe = document.createElement('div')
    root.appendChild(probe)
    const out = PAIRS.map((p) => {
      probe.style.color = `var(${p.fg})`
      probe.style.background = `var(${p.bg})`
      const pcs = getComputedStyle(probe)
      const bgParts = pcs.backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]
      const base: [number, number, number, number] = [
        bgParts[0],
        bgParts[1],
        bgParts[2],
        bgParts[3] ?? 1,
      ]
      // composite the tint over the card surface
      const surface = getComputedStyle(root).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [16, 18, 22, 1]
      const a = base[3]
      const composited: [number, number, number, number] = [
        base[0] * a + surface[0] * (1 - a),
        base[1] * a + surface[1] * (1 - a),
        base[2] * a + surface[2] * (1 - a),
        1,
      ]
      return {
        label: p.label,
        ratio: contrastRatio(pcs.color, composited),
        fg: solve(p.fg),
        bg: solve(p.bg),
      }
    })
    probe.remove()
    setRows(out)
  }, [])

  return (
    <div ref={ref} className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Pair</th>
            <th scope="col" className="w-24 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Sample</th>
            <th scope="col" className="w-24 px-3 py-2 text-right text-label-sm font-medium text-[var(--ds-fg-muted)]">Ratio</th>
            <th scope="col" className="w-28 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Grade</th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map((p, i) => {
            const r = rows[i]?.ratio ?? null
            const exempt = p.fg === '--ds-fg-disabled'
            const grade = r === null ? '—' : r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA Large' : 'Fail'
            return (
              <tr key={p.label} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                <td className="px-3 py-2 text-[var(--ds-fg-secondary)]">{p.label}</td>
                <td className="px-3 py-2">
                  <span
                    className="inline-block rounded-[4px] px-2 py-1 text-caption"
                    style={{ color: `var(${p.fg})`, background: `var(${p.bg})` }}
                  >
                    Aa 15px
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-secondary)]">
                  {r ? `${r.toFixed(2)}:1` : '—'}
                </td>
                <td className="px-3 py-2">
                  {exempt ? (
                    <Badge tone="neutral" size="sm">exempt</Badge>
                  ) : (
                    <Badge
                      tone={grade === 'Fail' ? 'danger' : grade === 'AA Large' ? 'warning' : 'success'}
                      size="sm"
                    >
                      {grade}
                    </Badge>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ---- semantic role board ------------------------------------------------ */

const ROLES = ['accent', 'success', 'warning', 'danger', 'info'] as const

function RoleBoard() {
  return (
    <Stack gap="sm" className="w-full">
      {ROLES.map((r) => (
        <div key={r} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] text-caption"
            style={{ background: `var(--ds-${r})`, color: `var(--ds-${r}-fg)` }}
          >
            --ds-{r}
          </div>
          <div
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] text-caption"
            style={{ background: `var(--ds-${r}-subtle)`, color: `var(--ds-${r}-text)` }}
          >
            -subtle
          </div>
          <div
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] border text-caption"
            style={{ borderColor: `var(--ds-${r}-border)`, color: `var(--ds-${r}-text)` }}
          >
            -border
          </div>
          <div
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] text-caption"
            style={{ color: `var(--ds-${r}-text)` }}
          >
            -text
          </div>
          <div
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] text-caption"
            style={{ background: `var(--ds-${r}-hover, var(--ds-${r}))`, color: `var(--ds-${r}-fg)` }}
          >
            -hover
          </div>
        </div>
      ))}
    </Stack>
  )
}

function GreyscaleTest() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['', 'grayscale(1)'] as const).map((filter) => (
        <div key={filter} className="flex flex-col gap-2" style={{ filter: filter || undefined }}>
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">
            {filter ? 'Greyscale' : 'Full colour'}
          </span>
          <Alert tone="success" title="Deployed" icon={<Check size={17} />}>
            Build 4021 is live in three regions.
          </Alert>
          <Alert tone="danger" title="Failed" icon={<X size={17} />}>
            Migration 0043 rolled back after 11s.
          </Alert>
          <Row gap="sm">
            <Badge tone="success" dot>Healthy</Badge>
            <Badge tone="warning" dot>Degraded</Badge>
            <Badge tone="danger" dot>Down</Badge>
          </Row>
        </div>
      ))}
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'colors',
    title: 'Colors',
    group: 'Foundations',
    tagline:
      'Six ramps, five semantic roles, and one rule that outranks all of them: colour is never the only thing carrying the message.',
    keywords: ['palette', 'contrast', 'wcag', 'hue', 'status', 'brand', 'colour blindness'],
  },

  overview: {
    purpose:
      'Colour does three jobs in an interface: it identifies the brand, it separates surfaces from each other, and it signals state. It is very good at the first two and dangerously unreliable at the third, which is why every status colour in this system ships with an icon and a word attached.',
    whenToUse: [
      'To identify the single primary action on a screen.',
      'To separate layered surfaces — canvas, card, overlay — so depth is legible.',
      'To reinforce a status that is already stated in words: error, warning, success, info.',
      'To make categorical data distinguishable in charts, avatars and tags.',
    ],
    whenNotToUse: [
      {
        text: 'As the only signal that a field failed validation.',
        instead: 'a red border plus an icon plus a message',
      },
      {
        text: 'To express order or quantity across more than about five steps.',
        instead: 'position, length or an explicit number',
      },
      {
        text: 'To decorate a surface that has no meaning to convey.',
        instead: 'whitespace and hierarchy',
      },
      {
        text: 'To distinguish two adjacent chart series that a deuteranope would read as identical.',
        instead: 'shape, dash pattern or direct labelling',
      },
    ],
    reasoning: (
      <>
        <p>
          Roughly 300 million people have some form of colour vision deficiency, and the most common
          form makes red and green converge. Add sunlight on a phone screen, a cheap projector, a
          greyscale print-out and a user who has turned on a high-contrast OS theme, and colour
          becomes the least reliable channel available. It is a{' '}
          <strong>reinforcement layer, not an information layer</strong>.
        </p>
        <p>
          The ramps are spaced by perceptual lightness rather than by hex arithmetic, so step 400 to
          500 looks like the same size jump as 700 to 800. That matters because a ramp with uneven
          steps forces designers to skip steps, and skipped steps become the seed of a second,
          unofficial palette.
        </p>
        <p>
          Every status role ships as a family of five —{' '}
          <code>base / -subtle / -border / -text / -fg</code> — because the colour you can put text
          on is never the colour you put text in. Getting this wrong is the single most common
          contrast failure in production interfaces: white text on a tinted background that was
          designed as a background, not as a fill.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Primitive ramps" center={false} minHeight={0} allowResize={false}>
        <Stack gap="md" className="w-full">
          {RAMPS.map((r) => (
            <Ramp key={r.name} {...r} />
          ))}
        </Stack>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'roles',
        title: 'Semantic roles',
        description:
          'Each row is one role in its five certified forms. The -text value is the only one guaranteed to pass on -subtle; the -fg value is the only one guaranteed to pass on the solid base.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <RoleBoard />
          </PreviewStage>
        ),
      },
      {
        id: 'contrast',
        title: 'Live contrast audit',
        description:
          'Computed from the running stylesheet on every render, with alpha tints composited against their surface. Switch the app theme and watch every row recalculate.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ContrastMatrix />
          </PreviewStage>
        ),
      },
      {
        id: 'greyscale',
        title: 'The greyscale test',
        description:
          'Run any status UI through a greyscale filter. If you can still tell success from failure, colour was doing its job as reinforcement. If you cannot, colour was doing the whole job.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <GreyscaleTest />
          </PreviewStage>
        ),
      },
      {
        id: 'viz',
        title: 'Categorical palette',
        description:
          'Eight hues ordered for maximum separation between neighbours, including under deuteranopia. Never used for status — a chart series that happens to be red does not mean an error.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Grid min="7rem" className="w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Swatch key={i} name={`--p-viz-${i}`} value={`var(--p-viz-${i})`} size="sm" />
              ))}
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <Badge tone="neutral" dot>Neutral</Badge> },
      { label: 'Accent', render: <Badge tone="accent" dot>Accent</Badge> },
      { label: 'Success', render: <Badge tone="success" dot>Success</Badge> },
      { label: 'Warning', render: <Badge tone="warning" dot>Warning</Badge> },
      { label: 'Danger', render: <Badge tone="danger" dot>Danger</Badge> },
      { label: 'Info', render: <Badge tone="info" dot>Info</Badge> },
      {
        label: 'Solid',
        note: 'Uses the -fg pair',
        render: <Badge tone="danger" variant="solid">Critical</Badge>,
      },
      {
        label: 'Greyscale',
        note: 'Still legible',
        render: (
          <span style={{ filter: 'grayscale(1)' }}>
            <Badge tone="danger" dot>Danger</Badge>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="flex w-full max-w-lg flex-col gap-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] p-4">
          <div className="flex gap-3">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[var(--ds-danger-text)]" />
            <div>
              <p className="text-label text-[var(--ds-fg)]">Payment declined</p>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">
                Card ending 4242 was refused by the issuer.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
          {[
            ['1 · fill', '--ds-danger-subtle'],
            ['2 · border', '--ds-danger-border'],
            ['3 · icon+label', '--ds-danger-text'],
            ['4 · body', '--ds-fg-secondary'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] p-2">
              <p className="text-[var(--ds-fg-secondary)]">{k}</p>
              <code className="font-mono text-[10px] text-[var(--ds-accent-text)]">{v}</code>
            </div>
          ))}
        </div>
      </div>
    ),
    caption:
      'One status message uses four different tokens from two families. Substituting any one of them for another breaks either contrast or meaning.',
    parts: [
      {
        n: 1,
        label: 'Subtle fill',
        value: '14% alpha of the 400 step',
        kind: 'color',
        note: 'Alpha, not a solid, so the same token works over a card, a table row, or a nested panel. A solid tint only matches one background.',
      },
      {
        n: 2,
        label: 'Border',
        value: '34% alpha',
        kind: 'color',
        note: 'Must reach 3:1 against the surrounding surface — WCAG 1.4.11 covers UI boundaries, not just text.',
      },
      {
        n: 3,
        label: 'Status text and icon',
        value: '--ds-danger-text',
        kind: 'color',
        note: 'A lighter ramp step than the base in dark mode and a darker one in light mode. This is the pair certified against the subtle fill.',
      },
      {
        n: 4,
        label: 'Body copy',
        value: '--ds-fg-secondary',
        kind: 'color',
        note: 'Deliberately neutral. Colouring the entire message red reduces legibility and makes the severity read as louder than it is.',
      },
      {
        n: 5,
        label: 'Redundant encoding',
        value: 'icon + heading text',
        kind: 'shape',
        note: 'The word "declined" and the triangle both carry the meaning. Remove the colour entirely and nothing is lost.',
      },
    ],
  },

  palette: true,

  tokens: [
    /* -- Surfaces: the depth ladder, back to front ------------------------- */
    { category: 'color', group: 'Surfaces', token: '--ds-canvas', usedFor: 'Page background — the furthest-back plane' },
    { category: 'color', group: 'Surfaces', token: '--ds-sunken', usedFor: 'Recessed regions that read as below the canvas' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface', usedFor: 'Cards, panels, the default raised plane' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface-raised', usedFor: 'A surface on a surface' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface-overlay', usedFor: 'Dialogs, menus, popovers' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface-inset', usedFor: 'Wells — inputs, code, table headers' },

    /* -- Interaction layers: always alpha, so they compose over anything --- */
    { category: 'color', group: 'Interaction layers', token: '--ds-layer-hover', usedFor: 'Hover wash over any surface' },
    { category: 'color', group: 'Interaction layers', token: '--ds-layer-active', usedFor: 'Pressed and held states' },
    { category: 'color', group: 'Interaction layers', token: '--ds-layer-selected', usedFor: 'Persistent selection tint — never reuse the hover value' },
    { category: 'color', group: 'Interaction layers', token: '--ds-layer-scrim', usedFor: 'Backdrop behind modals and drawers' },

    /* -- Foreground: four steps, and nothing between them ------------------ */
    { category: 'color', group: 'Foreground', token: '--ds-fg', usedFor: 'Headings and primary text' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-secondary', usedFor: 'Body copy' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-muted', usedFor: 'Captions, metadata, placeholders, icons' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-disabled', usedFor: 'Disabled text — formally exempt from contrast rules' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-on-accent', usedFor: 'Text sitting on a solid brand fill' },
    { category: 'color', group: 'Foreground', token: '--ds-fg-inverse', usedFor: 'Text on an inverted surface — tooltips, toasts' },

    /* -- Borders ----------------------------------------------------------- */
    { category: 'color', group: 'Borders', token: '--ds-border-subtle', usedFor: 'Dividers and card edges' },
    { category: 'color', group: 'Borders', token: '--ds-border', usedFor: 'Default component borders' },
    { category: 'color', group: 'Borders', token: '--ds-border-strong', usedFor: 'Checkbox and radio outlines, scrollbar thumbs' },
    { category: 'color', group: 'Borders', token: '--ds-border-interactive', usedFor: 'The edge of something you can click' },

    /* -- Brand and focus --------------------------------------------------- */
    { category: 'color', group: 'Brand & focus', token: '--ds-accent', usedFor: 'Primary action and selection' },
    { category: 'color', group: 'Brand & focus', token: '--ds-accent-subtle', usedFor: 'Tonal brand fill behind text or an icon' },
    { category: 'color', group: 'Brand & focus', token: '--ds-accent-border', usedFor: 'Brand-tinted edge at ≥3:1' },
    { category: 'color', group: 'Brand & focus', token: '--ds-accent-text', usedFor: 'The pair certified for text on --ds-accent-subtle' },
    { category: 'color', group: 'Brand & focus', token: '--ds-focus-ring', usedFor: 'One ring for the whole system — clears 3:1 on every surface' },

    /* -- Status: each ships as a family of five ---------------------------- */
    { category: 'color', group: 'Status', token: '--ds-success', usedFor: 'Completed, healthy, approved' },
    { category: 'color', group: 'Status', token: '--ds-warning', usedFor: 'Degraded, needs attention, reversible risk' },
    { category: 'color', group: 'Status', token: '--ds-danger', usedFor: 'Failed, destructive, irreversible' },
    { category: 'color', group: 'Status', token: '--ds-info', usedFor: 'Neutral system information' },
    { category: 'color', group: 'Status', token: '--ds-{role}-subtle / -border / -text / -fg', usedFor: 'The four certified companions every role ships with' },

    /* -- Categorical ------------------------------------------------------- */
    { category: 'color', group: 'Data visualisation', token: '--p-viz-1 … --p-viz-8', usedFor: 'Charts, avatars, categorical tags — never status' },
  ],

  do: [
    {
      title: 'Pair every colour with a second signal',
      why: 'Icon, dot, word, or position. The greyscale test above is the check: if the meaning survives, colour is reinforcing. If it does not, colour is load-bearing and the design excludes people.',
      render: (
        <Stack gap="sm">
          <Row gap="sm">
            <Badge tone="success" dot>Healthy</Badge>
            <Badge tone="warning" dot>Degraded</Badge>
            <Badge tone="danger" dot>Down</Badge>
          </Row>
          <span className="text-caption text-[var(--ds-fg-muted)]">dot + word + tone</span>
        </Stack>
      ),
    },
    {
      title: 'Use the certified pair for text on a tint',
      why: '--ds-danger-text on --ds-danger-subtle is measured at ≥4.5:1 in both themes. Using the solid --ds-danger there lands around 3:1 and fails for body copy.',
      render: (
        <div className="rounded-[var(--radius-md)] bg-[var(--ds-danger-subtle)] px-3 py-2">
          <span className="text-body-sm text-[var(--ds-danger-text)]">Card was declined</span>
        </div>
      ),
    },
    {
      title: 'Let the surface ramp carry depth',
      why: 'canvas → surface → raised → overlay is a four-step ladder of lightness. Depth read from surface colour survives greyscale, high-contrast mode, and a phone in direct sunlight; a drop shadow does not.',
      render: (
        <div className="w-full rounded-[var(--radius-lg)] bg-[var(--ds-canvas)] p-3">
          <div className="rounded-[var(--radius-md)] bg-[var(--ds-surface)] p-3">
            <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-raised)] p-3">
              <div className="rounded-[4px] bg-[var(--ds-surface-overlay)] p-2 text-center text-caption">
                overlay
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Reserve the accent for one thing per view',
      why: 'The brand colour is a pointer. If the nav, the badge, the link, the chart and the button are all accent-coloured, it has stopped pointing at anything and the primary action is camouflaged.',
      render: (
        <Stack gap="xs" className="w-full text-body-sm">
          <span className="text-[var(--ds-fg-secondary)]">Projects</span>
          <span className="text-[var(--ds-fg-secondary)]">Deployments</span>
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-accent)] px-2.5 py-1 text-center text-[var(--ds-accent-fg)]">
            New project
          </span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not signal state with colour alone',
      why: 'These three rows are identical to anyone with deuteranopia, anyone reading a greyscale export, and anyone whose monitor is badly calibrated. The information simply is not there.',
      render: (
        <Stack gap="xs" className="w-full">
          {['#35c98a', '#f7b222', '#fa6470'].map((c) => (
            <span key={c} className="h-6 w-full rounded-[var(--radius-sm)]" style={{ background: c }} />
          ))}
          <span className="text-caption text-[var(--ds-fg-muted)]">which one is the error?</span>
        </Stack>
      ),
    },
    {
      title: 'Do not put solid status colour behind body text',
      why: 'Status colours are tuned to be noticeable, not readable. A paragraph on a solid amber block fails contrast in one theme and is uncomfortable in both.',
      render: (
        <div className="rounded-[var(--radius-md)] bg-[var(--ds-warning)] p-3">
          <p className="text-body-sm text-white">
            Your trial ends in three days. Add a payment method to keep your projects online.
          </p>
        </div>
      ),
    },
    {
      title: 'Do not invent a colour outside the ramps',
      why: 'Every off-ramp hex is a value nobody can theme, nobody can audit for contrast, and nobody can find later. It will be copied into three more components before anyone notices.',
      render: (
        <Row gap="sm">
          <span className="h-10 w-10 rounded-[var(--radius-md)]" style={{ background: '#8b5cf6' }} />
          <span className="h-10 w-10 rounded-[var(--radius-md)]" style={{ background: '#7f5af0' }} />
          <span className="h-10 w-10 rounded-[var(--radius-md)]" style={{ background: '#7c6cff' }} />
          <span className="self-center text-caption text-[var(--ds-fg-muted)]">
            three purples, one of them real
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not use pure black or pure white surfaces in dark mode',
      why: 'Maximum contrast causes halation — light text on pure black smears for astigmatic readers, and the eye strains at the boundary. Our canvas is #0A0B0E and our brightest text is #EDEFF4.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] bg-black p-4">
          <p className="text-body-sm text-white">Pure #FFF on pure #000 — 21:1 and unpleasant.</p>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.6', name: 'Contrast (Enhanced)', level: 'AAA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'Body text (under 18.66px regular / 14px bold) needs 4.5:1. Large text needs 3:1. UI boundaries and meaningful graphics need 3:1.',
      'Alpha fills must be composited against their actual background before measuring — a 14% tint measured against transparent is meaningless.',
      'Disabled controls are formally exempt, which is why "just disable it" is a way of hiding an accessibility problem rather than solving one.',
      'AAA (7:1) is the target for long-form reading surfaces. Our body text hits 13.8:1 in dark and 15.9:1 in light.',
    ],
    keyboard: [
      { keys: '⌘I', does: 'Inspector Mode reports the live contrast ratio of anything you hover.' },
    ],
    aria: [
      {
        attr: 'forced-colors: active',
        on: 'Media query',
        note: 'Windows High Contrast Mode replaces your palette wholesale. Test it — anything conveyed only by background colour disappears entirely.',
      },
      {
        attr: 'color-scheme',
        on: ':root',
        note: 'Declares dark or light to the UA so native controls, scrollbars, the caret and autofill match your surface.',
      },
      {
        attr: 'aria-label / visible text',
        on: 'Status elements',
        note: 'The state must be readable. A green dot with no accessible name announces as nothing at all.',
      },
    ],
    focus:
      'The focus ring uses a fixed accent step chosen to clear 3:1 against every surface token in both themes — that is why it is --ds-focus-ring rather than simply reusing --ds-accent.',
    screenReader: [
      'Screen readers do not announce colour. Any meaning encoded in a fill must also exist as text, an accessible name, or an icon with a label.',
      'Charts need direct labels or a data table alternative; a legend that maps colour to series is useless without colour vision.',
    ],
    touch:
      'Colour has no bearing on hit area, but low-contrast controls are measurably harder to acquire — users aim more slowly at targets they can barely see, which compounds Fitts’ Law.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption: 'Prefer the semantic utility. Reach for a raw var() only when no utility exists.',
      code: `// Surfaces
<div className="bg-canvas">
  <div className="bg-surface border border-line-subtle rounded-xl">
    <div className="bg-surface-inset" />
  </div>
</div>

// Text hierarchy
<h2 className="text-fg">Primary</h2>
<p  className="text-fg-secondary">Body copy</p>
<p  className="text-fg-muted">Caption</p>

// A status message — four tokens, two families
<div className="bg-danger-subtle border border-danger-border rounded-lg p-4">
  <AlertTriangle className="text-danger-text" aria-hidden />
  <p className="text-fg">Payment declined</p>
  <p className="text-fg-secondary">Card ending 4242 was refused.</p>
</div>

// Categorical colour for a chart — never a status family
const SERIES = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (i) => 'var(--p-viz-' + i + ')'
)`,
    },
    css: {
      lang: 'css',
      caption: 'How a status family is defined. Note that both themes are always written together.',
      code: `:root, [data-theme='dark'] {
  --ds-danger:        #ee4351;                    /* solid fill    */
  --ds-danger-hover:  #fa5b68;
  --ds-danger-active: #d62838;
  --ds-danger-fg:     #ffffff;                    /* text ON solid */
  --ds-danger-subtle: rgb(250 100 112 / 0.14);    /* tinted fill   */
  --ds-danger-border: rgb(250 100 112 / 0.36);    /* >= 3:1 edge   */
  --ds-danger-text:   #ff929b;                    /* text ON tint  */
}

[data-theme='light'] {
  --ds-danger:        #d62838;   /* darker: needs 4.5:1 with white  */
  --ds-danger-fg:     #ffffff;
  --ds-danger-subtle: rgb(238 67 81 / 0.10);
  --ds-danger-border: rgb(214 40 56 / 0.28);
  --ds-danger-text:   #b21c2b;   /* darker still: sits on a tint    */
}

/* High-contrast mode strips colour entirely — keep the structure */
@media (forced-colors: active) {
  .status { border: 1px solid; }
}`,
    },
  },

  notes: {
    tips: [
      'Design the dark theme first if your product is developer-facing, and the light theme first if it is consumer-facing. Whichever you build second will expose the places where colour was doing structural work.',
      'When you need "one more" colour, try changing lightness before changing hue. A second hue costs the user a new thing to learn; a lighter step of an existing hue costs nothing.',
      'The accent colour should not appear in your empty states, your table borders, or your body text. If it does, it stops meaning "here is the action".',
      'Test on an OLED phone at minimum brightness and on a cheap IPS panel at maximum. Ramps that look smooth on a calibrated monitor often band badly on both.',
    ],
    performance: [
      'color-mix() and relative colour syntax are resolved at computed-value time and are effectively free — you do not need to precompute tints into static hexes.',
      'Avoid animating background-color on large surfaces during scroll; paint cost scales with area. Animate opacity of an overlay instead.',
      'A gradient with many stops is more expensive to paint than a flat fill. On a full-page background, use at most two radial gradients at low alpha.',
    ],
    mistakes: [
      'Measuring contrast against the token value instead of the composited result. A 14% alpha over a dark card is not the colour in the token.',
      'Using the same colour for "selected" and "hover". The user cannot tell whether a row is currently selected or just under the cursor.',
      'Assigning status colours to chart series. A red line in a revenue chart reads as a failure even when it is just Q3.',
      'Reusing the warning amber for a brand highlight. Now every promotional banner in the product looks like a system alert.',
    ],
    realWorld: [
      'Ship a colour-blindness simulator in your review process. Chrome DevTools has one built in under Rendering → Emulate vision deficiencies; use it on every status screen before merge.',
      'When a stakeholder asks to "make it pop", the answer is almost never more saturation. It is usually more contrast between adjacent elements, or more whitespace around the thing that matters.',
      'Keep a single page in your app that renders every semantic pair with its live contrast ratio, exactly like the audit above. It turns an abstract rule into a build-time regression test.',
      'Brand colours from a marketing palette are almost never accessible as UI colours. Take the hue, rebuild the ramp for the screen, and give the marketing value back to marketing.',
    ],
  },

  appendix: [
    {
      id: 'choosing',
      title: 'Choosing a role',
      description: 'A decision table for the question that comes up most often.',
      render: (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
          <table className="w-full border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
                <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Situation</th>
                <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Role</th>
                <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['The action the product wants you to take', 'accent', 'Points. Exactly one per view.'],
                ['Operation finished and cannot be undone by mistake', 'success', 'Confirms. Fades from attention quickly.'],
                ['Something needs attention but nothing is broken yet', 'warning', 'Interrupts without alarming.'],
                ['Failed, blocked, or destructive', 'danger', 'Stops. Never used decoratively.'],
                ['Neutral system fact the user did not ask for', 'info', 'Informs without implying action.'],
                ['A category with no inherent good or bad', 'viz-1…8', 'Distinguishes. Carries no valence.'],
              ].map(([sit, role, why]) => (
                <tr key={sit} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                  <td className="px-3 py-2 text-[var(--ds-fg-secondary)]">{sit}</td>
                  <td className="px-3 py-2">
                    <code className="font-mono text-[11.5px] text-[var(--ds-accent-text)]">{role}</code>
                  </td>
                  <td className="px-3 py-2 text-[var(--ds-fg-muted)]">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
  ],
})
