import * as React from 'react'
import { Check, Download, Star } from 'lucide-react'
import { Button } from '@/ui/Button'
import { Badge, Kbd } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Knob, KnobSelect, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   FITTS'S LAW — measured, not asserted.

   MT = a + b · log2(2D / W)

   The index of difficulty is log2(2D/W): halve the width or double the
   distance and it goes up by one bit. The demo records real acquisition
   times so the reader can watch the prediction hold.
   ======================================================================== */

const FITTS = {
  'large · near': { w: 88, d: 90 },
  'large · far': { w: 88, d: 320 },
  'small · near': { w: 26, d: 90 },
  'small · far': { w: 26, d: 320 },
} as const

type FittsKey = keyof typeof FITTS

function FittsDemo() {
  const [cfg, setCfg] = React.useState<FittsKey>('large · near')
  const [results, setResults] = React.useState<Partial<Record<FittsKey, number[]>>>({})
  const [live, setLive] = React.useState(false)
  const [side, setSide] = React.useState<0 | 1>(0)
  const shownAt = React.useRef(0)

  const { w, d } = FITTS[cfg]
  const id = Math.log2((2 * d) / w) // Fitts's index of difficulty, in bits

  const hit = () => {
    const dt = performance.now() - shownAt.current
    setResults((r) => ({ ...r, [cfg]: [...(r[cfg] ?? []), dt].slice(-8) }))
    setSide((s) => (s === 0 ? 1 : 0))
    shownAt.current = performance.now()
  }

  const start = () => {
    setLive(true)
    setSide(0)
    shownAt.current = performance.now()
  }

  const mean = (a?: number[]) =>
    a && a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null

  const samples = results[cfg]?.length ?? 0

  return (
    <Stack gap="md" className="w-full">
      <Row gap="sm" className="items-center">
        <Knob label="Target">
          <KnobSelect
            value={cfg}
            onChange={(v) => {
              setCfg(v)
              setLive(false)
            }}
            options={Object.keys(FITTS) as FittsKey[]}
          />
        </Knob>
        <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
          W {w}px · D {d}px · ID {id.toFixed(2)} bits
        </span>
      </Row>

      <div className="relative flex h-[7rem] items-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-4">
        {!live ? (
          <Button size="sm" onClick={start} className="mx-auto">
            {samples ? 'Measure again' : 'Start'}
          </Button>
        ) : (
          <button
            type="button"
            onClick={hit}
            aria-label="Target"
            style={{
              width: w,
              height: Math.min(w, 44),
              transform: `translateX(${side === 0 ? 0 : d}px)`,
            }}
            className="rounded-[var(--radius-md)] bg-[var(--ds-accent)] transition-transform duration-100"
          />
        )}
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {(Object.keys(FITTS) as FittsKey[]).map((k) => {
          const m = mean(results[k])
          const bits = Math.log2((2 * FITTS[k].d) / FITTS[k].w)
          return (
            <Row
              key={k}
              className={`justify-between rounded-[var(--radius-md)] px-2.5 py-1.5 ${
                k === cfg ? 'bg-[var(--ds-accent-subtle)]' : 'bg-[var(--ds-surface-inset)]'
              }`}
            >
              <span className="text-caption text-[var(--ds-fg-secondary)]">{k}</span>
              <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">
                {bits.toFixed(1)} bits ·{' '}
                {m ? (
                  <span className="text-[var(--ds-fg)]">{m}ms</span>
                ) : (
                  <span className="text-[var(--ds-fg-disabled)]">—</span>
                )}
              </span>
            </Row>
          )
        })}
      </div>
      <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
        Measure all four. The times track the bits, not the pixels — which is why a small target far
        away is roughly twice the work of a large one nearby, and why screen edges are effectively
        infinite in size.
      </p>
    </Stack>
  )
}

/* ===========================================================================
   HICK'S LAW — RT = a + b · log2(n + 1)
   ======================================================================== */

const SHORT = ['Archive', 'Delete', 'Star', 'Snooze']
const LONG = [
  'Archive',
  'Delete',
  'Star',
  'Snooze',
  'Mark unread',
  'Move to…',
  'Add label',
  'Mute thread',
  'Report spam',
  'Block sender',
  'Print',
  'Forward',
  'Create task',
  'Copy link',
  'Add to calendar',
  'Translate',
]

function HickDemo() {
  const [n, setN] = React.useState<'4' | '16'>('4')
  const [times, setTimes] = React.useState<Record<string, number[]>>({})
  const [live, setLive] = React.useState(false)
  const shownAt = React.useRef(0)
  const target = 'Create task'
  const items = n === '4' ? SHORT : LONG
  const hasTarget = items.includes(target)

  const pick = (label: string) => {
    if (label !== (hasTarget ? target : 'Snooze')) return
    const dt = performance.now() - shownAt.current
    setTimes((t) => ({ ...t, [n]: [...(t[n] ?? []), dt].slice(-6) }))
    setLive(false)
  }

  const mean = (a?: number[]) =>
    a && a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null

  return (
    <Stack gap="md" className="w-full">
      <Row gap="sm">
        <Knob label="Options">
          <KnobSelect
            value={n}
            onChange={(v) => {
              setN(v)
              setLive(false)
            }}
            options={['4', '16'] as const}
          />
        </Knob>
        <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
          log2({n} + 1) = {Math.log2(Number(n) + 1).toFixed(2)} bits
        </span>
      </Row>

      {!live ? (
        <Button
          size="sm"
          onClick={() => {
            setLive(true)
            shownAt.current = performance.now()
          }}
          className="self-start"
        >
          Find “{hasTarget ? target : 'Snooze'}”
        </Button>
      ) : (
        <div className="flex flex-wrap gap-1.5 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-2">
          {items.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => pick(l)}
              className="rounded-[var(--radius-sm)] bg-[var(--ds-surface)] px-2 py-1 text-caption text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]"
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <Row gap="lg">
        {(['4', '16'] as const).map((k) => (
          <span key={k} className="font-mono text-caption text-[var(--ds-fg-muted)]">
            {k} options ·{' '}
            {mean(times[k]) ? (
              <span className="text-[var(--ds-fg)]">{mean(times[k])}ms</span>
            ) : (
              <span className="text-[var(--ds-fg-disabled)]">—</span>
            )}
          </span>
        ))}
      </Row>
      <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">
        The cost is logarithmic, not linear — four times the options is not four times the time. It
        is also why <em>grouping</em> beats <em>deleting</em>: sixteen items in four labelled groups
        is two cheap decisions instead of one expensive one.
      </p>
    </Stack>
  )
}

/* ===========================================================================
   Static demonstrations
   ======================================================================== */

function Chunking() {
  return (
    <Row gap="lg" align="start" className="justify-center">
      <Stack gap="xs" className="items-center">
        <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface)] px-3 py-2 font-mono text-body">
          4539872146730021
        </span>
        <span className="text-caption text-[var(--ds-danger-text)]">16 items</span>
      </Stack>
      <Stack gap="xs" className="items-center">
        <span className="rounded-[var(--radius-md)] border border-[var(--ds-success-border)] bg-[var(--ds-surface)] px-3 py-2 font-mono text-body">
          4539 8721 4673 0021
        </span>
        <span className="text-caption text-[var(--ds-success-text)]">4 chunks</span>
      </Stack>
    </Row>
  )
}

function Proximity() {
  const Row6 = ({ grouped }: { grouped?: boolean }) => (
    <span className={`flex ${grouped ? 'gap-4' : 'gap-2'}`}>
      {[0, 1].map((g) => (
        <span key={g} className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full bg-[var(--ds-fg-muted)]" />
          ))}
        </span>
      ))}
    </span>
  )
  return (
    <Row gap="lg" align="start" className="justify-center">
      <Stack gap="xs" className="items-center">
        <Row6 />
        <span className="text-caption text-[var(--ds-fg-muted)]">Six things</span>
      </Stack>
      <Stack gap="xs" className="items-center">
        <Row6 grouped />
        <span className="text-caption text-[var(--ds-fg-muted)]">Two groups of three</span>
      </Stack>
    </Row>
  )
}

function VisualWeight() {
  return (
    <Row gap="lg" align="start" className="justify-center">
      <Stack gap="sm" className="w-40 rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] p-3">
        <span className="text-caption text-[var(--ds-fg-muted)]">Everything is primary</span>
        <Button size="sm" fullWidth>
          Save
        </Button>
        <Button size="sm" fullWidth>
          Duplicate
        </Button>
        <Button size="sm" fullWidth>
          Delete
        </Button>
      </Stack>
      <Stack gap="sm" className="w-40 rounded-[var(--radius-lg)] border border-[var(--ds-success-border)] p-3">
        <span className="text-caption text-[var(--ds-fg-muted)]">One primary</span>
        <Button size="sm" fullWidth>
          Save
        </Button>
        <Button size="sm" fullWidth variant="outlined">
          Duplicate
        </Button>
        <Button size="sm" fullWidth variant="text">
          Delete
        </Button>
      </Stack>
    </Row>
  )
}

function Isolation() {
  return (
    <Row gap="sm" className="justify-center">
      {['Free', 'Pro', 'Team', 'Scale'].map((p, i) => (
        <span
          key={p}
          className={`flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border text-caption ${
            i === 1
              ? 'border-[var(--ds-accent)] bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)] shadow-e2'
              : 'border-[var(--ds-border-subtle)] text-[var(--ds-fg-muted)]'
          }`}
        >
          {p}
          {i === 1 && (
            <Badge tone="accent" variant="subtle" size="sm">
              Popular
            </Badge>
          )}
        </span>
      ))}
    </Row>
  )
}

function Disclosure() {
  const [open, setOpen] = React.useState(false)
  return (
    <Stack gap="sm" className="w-full max-w-[20rem]">
      <span className="text-caption text-[var(--ds-fg-secondary)]">Export</span>
      <Row gap="sm">
        <Button size="sm" startIcon={<Download size={13} />}>
          Download CSV
        </Button>
        <Button size="sm" variant="text" onClick={() => setOpen((o) => !o)}>
          {open ? 'Fewer options' : 'More options'}
        </Button>
      </Row>
      {open && (
        <Stack gap="xs" className="rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] p-2.5">
          {['Include archived rows', 'Split by month', 'Compress as .zip'].map((o) => (
            <span key={o} className="text-caption text-[var(--ds-fg-muted)]">
              {o}
            </span>
          ))}
        </Stack>
      )}
      <span className="text-caption text-[var(--ds-fg-muted)]">
        The common case is one click. The rare case is two.
      </span>
    </Stack>
  )
}

function Doherty() {
  const [state, setState] = React.useState<'idle' | 'optimistic' | 'slow'>('idle')
  return (
    <Row gap="lg" align="start" className="justify-center">
      <Stack gap="sm" className="items-center">
        <Button
          size="sm"
          startIcon={state === 'optimistic' ? <Check size={13} /> : <Star size={13} />}
          variant={state === 'optimistic' ? 'filled' : 'outlined'}
          onClick={() => {
            setState('optimistic')
            window.setTimeout(() => setState('idle'), 1400)
          }}
        >
          {state === 'optimistic' ? 'Starred' : 'Star'}
        </Button>
        <span className="text-caption text-[var(--ds-success-text)]">Optimistic · 0ms</span>
      </Stack>
      <Stack gap="sm" className="items-center">
        <Button
          size="sm"
          variant="outlined"
          loading={state === 'slow'}
          onClick={() => {
            setState('slow')
            window.setTimeout(() => setState('idle'), 1400)
          }}
        >
          Star
        </Button>
        <span className="text-caption text-[var(--ds-danger-text)]">Round trip · 1400ms</span>
      </Stack>
    </Row>
  )
}

function Playground() {
  const [law, setLaw] = React.useState<'Fitts' | 'Hick'>('Fitts')
  return (
    <PreviewStage
      label="Measure it"
      minHeight={320}
      center={false}
      allowResize={false}
      controls={
        <Knob label="Law">
          <KnobSelect value={law} onChange={setLaw} options={['Fitts', 'Hick'] as const} />
        </Knob>
      }
    >
      <div className="w-full">{law === 'Fitts' ? <FittsDemo /> : <HickDemo />}</div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'ux-rules',
    title: 'UX Rules',
    tagline:
      'The psychology every rule in this Bible derives from. Two of these are equations you can measure in your own browser, on this page.',
    keywords: [
      'fitts law',
      'hicks law',
      'jakobs law',
      'millers law',
      'gestalt',
      'cognitive load',
      'progressive disclosure',
      'recognition over recall',
      'visual hierarchy',
      'psychology',
      'von restorff',
      'doherty threshold',
      'peak end rule',
      'tesler law',
    ],
  },

  overview: {
    purpose:
      'Every number in this Bible — 44px targets, five bottom-nav destinations, 400ms response budgets, five to seven fields per group — comes from something on this page. This is where the reasoning lives, so the rest of the Bible can state a rule once and point here for why.',
    whenToUse: [
      'Deciding between two designs that both look reasonable.',
      'Justifying a constraint to someone who thinks it is arbitrary. Most of them are not.',
      'Reviewing a screen that feels wrong without an obvious reason — the violation is usually on this page.',
      'Setting a number: how big, how many, how fast, how much at once.',
    ],
    whenNotToUse: [
      {
        text: 'You want the specification rather than the reasoning.',
        instead: 'the component page. This one explains; those ones measure',
      },
      {
        text: 'A law contradicts what your users actually do.',
        instead: 'your users. These are strong priors, not physics — with the honourable exception of Fitts’s law, which really is close to physics',
      },
    ],
    reasoning: (
      <>
        <p>
          These are not style opinions. Fitts's law and Hick's law are equations fitted to
          experimental data, and you can reproduce both of them in the playground above with your
          own hand and your own browser. Most of the rest are robust findings from cognitive
          psychology that predate software by decades and survived the transition intact.
        </p>
        <p>
          <strong>They constrain rather than prescribe.</strong> Hick's law says a long undifferentiated
          list is slow to choose from; it does not say what to delete. Fitts's law says small distant
          targets cost time; it does not lay out your toolbar. They rule options out, and what
          remains is still design work.
        </p>
        <p>
          <strong>They conflict, constantly.</strong> Hick's law wants fewer options; Jakob's law
          wants the same options as every competitor. Progressive disclosure wants things hidden;
          discoverability wants them visible. Recognising which law is binding in a given situation
          is most of the skill — knowing the list is the easy part.
        </p>
        <p>
          <strong>Evidence beats the law.</strong> Every one of these is a prior, and priors lose to
          data about your own users. What they buy you is a good starting point and a real argument,
          which is a substantial improvement on taste.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'miller',
        title: 'Miller’s law — chunking',
        description:
          'Working memory holds around four chunks, not seven items. The digits are identical; only the grouping changed.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Chunking />
          </PreviewStage>
        ),
      },
      {
        id: 'gestalt',
        title: 'Gestalt — proximity',
        description:
          'Nothing was added and nothing was coloured. Spacing alone created two groups, which is why a gap is a stronger grouping signal than a border.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Proximity />
          </PreviewStage>
        ),
      },
      {
        id: 'weight',
        title: 'Visual weight',
        description:
          'Emphasis is relative. Three primary buttons are three equal choices, and the user has to do the prioritising the design skipped.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <VisualWeight />
          </PreviewStage>
        ),
      },
      {
        id: 'isolation',
        title: 'Von Restorff — the isolation effect',
        description:
          'The item that differs is the item that is remembered. It works exactly once per screen; two highlights cancel each other out.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Isolation />
          </PreviewStage>
        ),
      },
      {
        id: 'disclosure',
        title: 'Progressive disclosure',
        description:
          'The common case costs one click; the rare case costs two. This is the honest way to satisfy Hick’s law without deleting a feature someone needs.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Disclosure />
          </PreviewStage>
        ),
      },
      {
        id: 'doherty',
        title: 'The Doherty threshold — 400ms',
        description:
          'Below about 400ms, attention holds and the interface feels like an extension of the hand. Press both.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Doherty />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '< 100ms', note: 'instant', render: <Badge tone="success" variant="subtle">Instant</Badge> },
      { label: '< 400ms', note: 'attention holds', render: <Badge tone="success" variant="subtle">Responsive</Badge> },
      { label: '< 1s', note: 'flow intact', render: <Badge tone="warning" variant="subtle">Noticeable</Badge> },
      { label: '< 10s', note: 'needs progress', render: <Badge tone="warning" variant="subtle">Show progress</Badge> },
      { label: '> 10s', note: 'they leave', render: <Badge tone="danger" variant="subtle">Abandoned</Badge> },
      { label: '44px', note: 'Fitts floor', render: <span className="block h-11 w-11 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)]" /> },
      { label: '4 chunks', note: 'Miller', render: <span className="font-mono text-caption">4539 8721</span> },
      { label: '5–7 fields', note: 'per group', render: <span className="text-caption text-[var(--ds-fg-muted)]">then split</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-[26rem] rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-5">
        <Stack gap="lg">
          <Stack gap="xs">
            <span className="text-h3 text-[var(--ds-fg)]">Delete workspace</span>
            <span className="text-body-sm text-[var(--ds-fg-muted)]">
              This removes every project and cannot be undone.
            </span>
          </Stack>
          <Alert tone="warning" quiet title="14 projects will be deleted">
            Their history goes with them.
          </Alert>
          <Row className="justify-end">
            <Button variant="text">Cancel</Button>
            <Button variant="danger">Delete workspace</Button>
          </Row>
        </Stack>
      </div>
    ),
    caption:
      'One small dialog, six laws. Nothing here is decoration — every choice is one of the rules below, applied.',
    parts: [
      {
        n: 1,
        label: 'Title largest',
        value: 'visual hierarchy',
        kind: 'type',
        note: 'Size, weight and colour all point the same way, so the eye lands on the title first without being told to. Emphasis is relative — if everything is emphasised, nothing is.',
      },
      {
        n: 2,
        label: 'Three groups',
        value: 'Gestalt proximity',
        kind: 'space',
        note: 'Title block, warning, actions. Spacing alone did the grouping — no borders, no boxes, no lines.',
      },
      {
        n: 3,
        label: 'Two choices',
        value: 'Hick’s law',
        kind: 'shape',
        note: 'log2(2 + 1) is about 1.6 bits. A dialog with five buttons is not slightly worse, it is a measurably different kind of decision.',
      },
      {
        n: 4,
        label: 'Primary bottom-right',
        value: 'serial position + Fitts',
        kind: 'space',
        note: 'Where the eye finishes reading, and where the cursor already is after scanning the text. The last item in a sequence is also the best remembered.',
      },
      {
        n: 5,
        label: 'Danger styled apart',
        value: 'Von Restorff',
        kind: 'color',
        note: 'The destructive action differs from everything around it, so it cannot be pressed inattentively.',
      },
      {
        n: 6,
        label: 'Consequence stated',
        value: 'error prevention',
        kind: 'type',
        note: '"14 projects" is specific. A generic "this cannot be undone" is read as boilerplate and skipped.',
      },
      {
        n: 7,
        label: 'Cancel is quiet',
        value: 'visual weight',
        kind: 'color',
        note: 'Present and reachable, but not competing. Two equally weighted buttons make a decision out of something that already had one.',
      },
      {
        n: 8,
        label: 'Familiar shape',
        value: 'Jakob’s law',
        kind: 'shape',
        note: 'Title, body, actions bottom-right. Users have seen this dialog a thousand times, and that recognition is free.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'touch target', value: '44px', usedFor: 'Fitts’s law — the acquisition floor' },
    { category: 'spacing', token: 'group gap', value: '24–32px', usedFor: 'Gestalt proximity' },
    { category: 'spacing', token: 'field gap', value: '16px', usedFor: 'Proximity within a group' },
    { category: 'typography', token: 'type scale', value: '1.2 ratio', usedFor: 'Visual hierarchy' },
    { category: 'color', token: '--ds-accent', usedFor: 'Von Restorff — one emphasis per screen' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'De-emphasis, so the primary can win' },
    { category: 'motion', token: 'duration', value: '< 400ms', usedFor: 'The Doherty threshold' },
    { category: 'motion', token: 'feedback', value: '< 100ms', usedFor: 'Perceived as instant' },
  ],

  sizes: [
    { name: 'Touch target', height: '44px', use: 'Fitts. The fingertip contact patch plus margin for a moving hand.' },
    { name: 'Pointer target', height: '32px', use: 'Fitts, with a precise pointer. Still not 16px.' },
    { name: 'Menu items', minWidth: '5–9 items', use: 'Hick. Past nine, group them rather than deleting.' },
    { name: 'Fields per group', minWidth: '5–7', use: 'Miller. Then split into a new fieldset.' },
    { name: 'Nav destinations', minWidth: '3–5', use: 'Hick and the thumb arc agreeing.' },
    { name: 'Chunk size', minWidth: '3–4 characters', use: 'Miller. Card numbers, codes, phone numbers.' },
    { name: 'Response budget', height: '< 400ms', use: 'Doherty. Past it, show progress.' },
    { name: 'Feedback', height: '< 100ms', use: 'Perceived as instant. Every press needs it.' },
  ],

  do: [
    {
      title: 'Make the important target big and close',
      why: 'Fitts’s law is nearly physics. Doubling the width buys back the same time as halving the distance, and screen edges are effectively infinite targets because the pointer stops there.',
      render: (
        <Row gap="sm" align="center">
          <span className="h-11 w-20 rounded-[var(--radius-md)] bg-[var(--ds-accent)]" />
          <span className="h-6 w-8 rounded-[var(--radius-sm)] bg-[var(--ds-border-strong)]" />
        </Row>
      ),
    },
    {
      title: 'Group before you delete',
      why: 'Hick’s law is logarithmic and applies to undifferentiated lists. Sixteen items in four labelled groups is two cheap decisions, and nobody loses a feature.',
      render: (
        <Row gap="lg">
          <Stack gap="xs">
            <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Move</span>
            <span className="text-caption text-[var(--ds-fg-secondary)]">Archive · Delete</span>
          </Stack>
          <Stack gap="xs">
            <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Flag</span>
            <span className="text-caption text-[var(--ds-fg-secondary)]">Star · Snooze</span>
          </Stack>
        </Row>
      ),
    },
    {
      title: 'Be conventional where it does not matter',
      why: 'Jakob’s law: users spend nearly all their time on other products, so their expectations were formed elsewhere. Spend your novelty budget on what makes your product different, not on the logout menu.',
      render: <span className="text-caption text-[var(--ds-fg-muted)]">logo top-left · cart top-right · ⌘K</span>,
    },
    {
      title: 'Answer within 400ms, or show progress',
      why: 'The Doherty threshold: below it attention holds and the tool feels like an extension of the hand. Above it, the mind starts to wander and the return trip is expensive.',
      render: <Doherty />,
    },
    {
      title: 'Emphasise exactly one thing',
      why: 'Von Restorff works by contrast, so it works once. Two highlighted plans on a pricing page is the same as none, plus the noise.',
      render: <Isolation />,
    },
    {
      title: 'Recognition over recall',
      why: 'Showing the options costs screen space; remembering them costs the user working memory they need for the actual task. A visible label beats a memorised shortcut for everyone except the daily user — who gets both.',
      render: (
        <Row gap="sm">
          <span className="text-caption text-[var(--ds-fg)]">Archive</span>
          <Kbd>E</Kbd>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put a small target far away',
      why: 'It is the one combination Fitts’s law punishes twice. A 16px close button in the opposite corner of a large dialog is the canonical example.',
      render: (
        <span className="relative block h-16 w-32 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <span className="absolute right-1 top-1 h-3 w-3 rounded-[2px] bg-[var(--ds-danger-subtle)]" />
        </span>
      ),
    },
    {
      title: 'Do not present twenty flat options',
      why: 'Hick’s law with no grouping, and it is the shape most "advanced settings" pages take. Every choice is paid for by every user, including the ones who wanted the default.',
      render: (
        <span className="flex w-40 flex-wrap gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-8 rounded-[2px] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/30"
            />
          ))}
        </span>
      ),
    },
    {
      title: 'Do not be novel where users are on autopilot',
      why: 'Jakob’s law again. A creative checkout flow, an unconventional scrollbar or a reinvented date picker spends the user’s patience on something that was never the point.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          a “delightful” address form
        </span>
      ),
    },
    {
      title: 'Do not push complexity onto the user',
      why: 'Tesler’s law: every system has a level of complexity that cannot be removed, only moved. The question is who absorbs it — and it should be you, once, rather than every user, every time.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          “Enter your timezone offset in minutes”
        </span>
      ),
    },
    {
      title: 'Do not hide the primary path behind disclosure',
      why: 'Progressive disclosure is for the rare case. Hiding the common one behind "Advanced" trades a small gain in tidiness for a large loss in usability.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          “Save” under More options
        </span>
      ),
    },
    {
      title: 'Do not end on the worst moment',
      why: 'The peak-end rule: an experience is remembered by its most intense point and its ending. A flawless flow that finishes with a raw error message is remembered as a bad flow.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          payment succeeds → “Error: null”
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.2.3', name: 'Consistent Navigation', level: 'AA' },
      { id: '3.2.4', name: 'Consistent Identification', level: 'AA' },
      { id: '3.3.2', name: 'Labels or Instructions', level: 'A' },
    ],
    contrast: [
      'Visual hierarchy is built from contrast, and de-emphasis has a floor. Secondary text still needs 4.5:1 — "quieter" must never mean "harder to read".',
      'Von Restorff by colour alone excludes anyone who cannot see that colour. Pair it with size, weight, a border or a label.',
      'Gestalt grouping by proximity works at any contrast, which is exactly why it is the more robust technique.',
    ],
    keyboard: [
      { keys: 'Tab order', does: 'Must follow the visual hierarchy. If the eye goes title → body → primary action, so should focus.' },
      { keys: 'Shortcuts', does: 'Recognition over recall — show them beside the action rather than expecting them to be memorised.' },
      { keys: 'Escape', does: 'Consistent identification: the same key dismisses the topmost layer everywhere, every time.' },
    ],
    aria: [
      {
        attr: 'Semantic grouping',
        on: 'Visual groups',
        note: 'Gestalt proximity is invisible to a screen reader. A group that exists only as whitespace needs a fieldset, a list or a region to exist at all.',
      },
      {
        attr: 'Heading levels',
        on: 'Hierarchy',
        note: 'The visual hierarchy needs a programmatic twin. Font size is not a heading level.',
      },
      {
        attr: 'Emphasis',
        on: 'The isolated item',
        note: 'Von Restorff must be in the accessible name — "Pro, most popular" — not conveyed only by a border and a shadow.',
      },
      {
        attr: 'aria-live',
        on: 'Anything past 400ms',
        note: 'The Doherty threshold applies to assistive tech too. Silence during a wait is worse than a spinner, because there is not even a spinner.',
      },
    ],
    focus:
      'Focus order is the hierarchy, expressed for people who are not looking. Where the eye is meant to go first, focus goes first. A layout that reads correctly but tabs in a scrambled order has a hierarchy that only exists visually.',
    screenReader: [
      'Every Gestalt grouping needs a semantic equivalent. Whitespace conveys nothing to a screen reader, so proximity alone is a group only sighted users can see.',
      'Miller’s law applies harder without vision: a list of twelve unchunked items read aloud is far heavier than the same list scanned. Group and label.',
      'Recognition over recall matters most here. Announce state — "selected", "expanded", "3 of 12" — rather than expecting it to be tracked in memory.',
      'The peak-end rule holds for audio too. An error announced as a raw exception is the ending a screen-reader user is left with.',
    ],
    touch:
      'Fitts’s law is why 44px exists: a fingertip is roughly 8–10mm and the hand is moving. Hick’s law is why bottom navigation caps at five. The thumb arc is Fitts applied to a hand that cannot reach the whole screen.',
  },

  code: {
    usage: {
      lang: 'ts',
      code: `// Fitts's law — MT = a + b · log2(2D / W)
// Movement time rises with the log of distance over width. Halve the
// width or double the distance and the difficulty goes up one bit.
const indexOfDifficulty = (distance: number, width: number) =>
  Math.log2((2 * distance) / width)

indexOfDifficulty(90, 88)    // 1.03 bits — large and near
indexOfDifficulty(320, 26)   // 4.62 bits — small and far, ~4.5× the work

// Hick's law — RT = a + b · log2(n + 1)
// Logarithmic, so four times the options is not four times the time.
// It also only applies to an UNDIFFERENTIATED list — grouping resets it.
const decisionCost = (options: number) => Math.log2(options + 1)

decisionCost(16)             // 4.09 bits, flat
decisionCost(4) + decisionCost(4)  // 2.32 + 2.32 → but only ONE of each
                                   // is paid: pick a group, then an item

// The Doherty threshold — 400ms
const BUDGET = {
  feedback: 100,   // press → visible response. Below this: instant.
  action:   400,   // attention holds. This is the real budget.
  progress: 1000,  // past this, show determinate progress
  abandon: 10000,  // past this, they are gone
}

// Miller's law — chunk, do not shorten
const chunk = (s: string, size = 4) =>
  s.replace(new RegExp(\`(.{\${size}})\`, 'g'), '$1 ').trim()

chunk('4539872146730021')   // '4539 8721 4673 0021'`,
    },
    api: [
      {
        name: 'The laws, as numbers',
        props: [
          { name: 'Fitts', type: 'MT = a + b·log2(2D/W)', description: 'Produces the 44px touch target and the 32px pointer target. Screen edges are infinite targets.' },
          { name: 'Hick', type: 'RT = a + b·log2(n+1)', description: 'Produces 5–9 menu items and 3–5 navigation destinations. Grouping resets the count.' },
          { name: 'Miller', type: '~4 chunks', description: 'Produces 5–7 fields per group and 3–4 character chunks in codes and card numbers.' },
          { name: 'Doherty', type: '400ms', description: 'Produces the response budget, the 100ms feedback rule and the 1s progress threshold.' },
          { name: 'Von Restorff', type: 'one per screen', description: 'Produces the single-primary-action rule.' },
          { name: 'Serial position', type: 'first and last', description: 'Produces primary-action-last and most-used-destination-first.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'When two designs both seem fine, find the law that distinguishes them. There usually is one, and it turns a taste argument into a decision.',
      'Fitts’s law has a corollary worth remembering: screen edges and corners are infinitely large targets, because the pointer cannot overshoot them. That is why the macOS menu bar sits flush at the top.',
      'Hick’s law applies to undifferentiated lists. Grouping is the cheap fix, and it is almost always better than removing a feature someone depends on.',
      'Miller’s "seven plus or minus two" is widely misquoted. Later work puts working memory nearer four chunks, and chunk size matters more than item count either way.',
      'The peak-end rule means error states deserve disproportionate care. They are the peak, and too often the end.',
      'The aesthetic-usability effect is real but double-edged: a beautiful interface is rated as more usable, and it also hides genuine usability problems from your own testing.',
    ],
    performance: [
      'The Doherty threshold is a performance budget written as psychology. 400ms is not a nice-to-have; it is where attention measurably breaks.',
      'Perceived performance is the one that counts. Optimistic updates, skeletons and prefetching move the perceived number without moving the real one — and the perceived one is what the user has.',
      'Feedback under 100ms is cheap and non-negotiable. Even when the work takes two seconds, the press must acknowledge itself immediately.',
      'Animation eats the same budget. A 300ms transition on a 200ms request produces a 500ms interaction, and the animation was your choice.',
    ],
    mistakes: [
      'Citing Hick’s law to justify removing a feature, when grouping would have solved it without the loss.',
      'Applying "seven plus or minus two" as a hard limit. It was never that, and the number is closer to four.',
      'Emphasising several things at once, which is the same as emphasising none.',
      'Being novel in the places users are on autopilot, and conventional in the place your product is actually different.',
      'Treating these as rules rather than priors, and overriding evidence from your own users with a citation.',
      'Forgetting that visual grouping is invisible to assistive technology unless it is also semantic.',
    ],
    realWorld: [
      'Fitts’s law is the one to reach for in an argument, because it is measurable in ten minutes with the demo on this page. Very few design disputes survive a stopwatch.',
      'Most "the design feels off" reactions are a violation of one of these, usually hierarchy or proximity. Naming it converts a vague objection into a specific fix.',
      'The laws conflict often, and the skill is knowing which one binds. Hick versus Jakob comes up constantly: fewer options, or the options users already expect?',
      'Users cannot tell you which law you broke, only that something felt wrong. That is exactly what this page is for.',
      'Tesler’s law is the most under-used one here. Every "just ask the user to configure it" decision is complexity moved rather than removed, and it is moved onto the people least equipped to absorb it.',
    ],
  },
})
