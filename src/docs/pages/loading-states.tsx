import * as React from 'react'
import { Check, RefreshCw, Send } from 'lucide-react'
import { Progress, Skeleton, Spinner } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Surface'
import { Badge } from '@/ui/Display'
import { Cell, Knob, KnobSelect, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

type Strategy = 'none' | 'inline' | 'skeleton' | 'optimistic' | 'streaming' | 'progress'

const STRATEGIES: Record<Strategy, { when: string; why: string }> = {
  none: { when: '< 100ms', why: 'Reads as instant. An indicator would flash and look like a bug.' },
  inline: { when: '100ms – 1s, small region', why: 'A spinner inside the control that triggered it. Nothing else moves.' },
  skeleton: { when: '300ms – 3s, known layout', why: 'Reserves the exact space, so nothing shifts when the data lands.' },
  optimistic: { when: 'Any duration, likely to succeed', why: 'Show the result immediately, reconcile or roll back after.' },
  streaming: { when: 'Long, incremental results', why: 'Render each chunk as it arrives. The first result is the loading state.' },
  progress: { when: '> 1s, measurable', why: 'A real percentage turns waiting into progress.' },
}

function Playground() {
  const [strategy, setStrategy] = React.useState<Strategy>('skeleton')
  const [busy, setBusy] = React.useState(false)

  const run = () => {
    setBusy(true)
    setTimeout(() => setBusy(false), 1800)
  }

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Strategy">
            <KnobSelect
              value={strategy}
              onChange={setStrategy}
              options={['none', 'inline', 'skeleton', 'optimistic', 'streaming', 'progress'] as const}
            />
          </Knob>
          <Button size="xs" variant="outlined" onClick={run}>
            Run
          </Button>
        </div>
      }
    >
      <Stack gap="md" className="w-full">
        <StrategyDemo strategy={strategy} busy={busy} />
        <p className="text-caption text-[var(--ds-fg-muted)]">
          <span className="text-[var(--ds-fg-secondary)]">{STRATEGIES[strategy].when}</span> —{' '}
          {STRATEGIES[strategy].why}
        </p>
      </Stack>
    </PreviewStage>
  )
}

function StrategyDemo({ strategy, busy }: { strategy: Strategy; busy: boolean }) {
  const [pct, setPct] = React.useState(0)
  React.useEffect(() => {
    if (strategy !== 'progress' || !busy) return setPct(0)
    const t = setInterval(() => setPct((p) => Math.min(100, p + 7)), 120)
    return () => clearInterval(t)
  }, [strategy, busy])

  if (strategy === 'none')
    return (
      <Card padding="sm" className="w-full">
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          Content renders immediately. No indicator at all.
        </p>
      </Card>
    )

  if (strategy === 'inline')
    return (
      <Row gap="sm">
        <Button loading={busy} startIcon={<Send />}>
          Send invite
        </Button>
        <Button variant="outlined" startIcon={busy ? <Spinner size={14} /> : <RefreshCw />}>
          Refresh
        </Button>
      </Row>
    )

  if (strategy === 'skeleton')
    return (
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} padding="sm">
            {busy ? (
              <>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-3 h-3 w-16" />
              </>
            ) : (
              <>
                <p className="font-mono text-label text-[var(--ds-fg)]">service-{i + 1}</p>
                <p className="mt-3 text-caption text-[var(--ds-fg-muted)]">main · 4m ago</p>
              </>
            )}
          </Card>
        ))}
      </div>
    )

  if (strategy === 'optimistic')
    return <OptimisticDemo />

  if (strategy === 'streaming')
    return <StreamingDemo busy={busy} />

  return (
    <div className="w-full max-w-md">
      <Progress value={pct} label="Uploading build artefacts" showValue />
    </div>
  )
}

function OptimisticDemo() {
  const [items, setItems] = React.useState([
    { id: 1, name: 'api-gateway', pending: false },
    { id: 2, name: 'billing-worker', pending: false },
  ])
  const [n, setN] = React.useState(3)

  const add = () => {
    const id = Date.now()
    setItems((prev) => [...prev, { id, name: `service-${n}`, pending: true }])
    setN((x) => x + 1)
    setTimeout(() => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, pending: false } : i)))
    }, 1400)
  }

  return (
    <Stack gap="sm" className="w-full max-w-md">
      {items.map((i) => (
        <div
          key={i.id}
          className={`flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 transition-opacity ${
            i.pending ? 'opacity-55' : ''
          }`}
        >
          <span className="font-mono text-body-sm text-[var(--ds-fg-secondary)]">{i.name}</span>
          {i.pending ? (
            <span className="inline-flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]">
              <Spinner size={12} /> Saving
            </span>
          ) : (
            <Badge tone="success" size="sm" dot>
              Live
            </Badge>
          )}
        </div>
      ))}
      <Button size="sm" variant="outlined" onClick={add} className="self-start">
        Add service
      </Button>
    </Stack>
  )
}

function StreamingDemo({ busy }: { busy: boolean }) {
  const [rows, setRows] = React.useState<string[]>([])
  React.useEffect(() => {
    if (!busy) return setRows([])
    let i = 0
    const t = setInterval(() => {
      i += 1
      setRows((r) => [...r, `result-${i}`])
      if (i >= 5) clearInterval(t)
    }, 320)
    return () => clearInterval(t)
  }, [busy])

  return (
    <Stack gap="sm" className="w-full max-w-md">
      {rows.map((r) => (
        <div
          key={r}
          className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 font-mono text-body-sm text-[var(--ds-fg-secondary)] animate-[slide-up_180ms_cubic-bezier(0.32,0.72,0,1)_both]"
        >
          {r}
        </div>
      ))}
      {busy && rows.length < 5 && (
        <span className="inline-flex items-center gap-2 text-caption text-[var(--ds-fg-muted)]">
          <Spinner size={12} /> {rows.length} results so far…
        </span>
      )}
      {!busy && rows.length === 0 && (
        <p className="text-caption text-[var(--ds-fg-muted)]">Press Run to stream results.</p>
      )}
    </Stack>
  )
}

export default defineDoc({
  meta: {
    id: 'loading-states',
    title: 'Loading States',
    tagline:
      'Six strategies, chosen by duration and by how much of the screen is changing. The best loading state is the one the user never sees.',
    keywords: ['spinner', 'suspense', 'optimistic ui', 'latency', 'perceived performance', 'streaming'],
  },

  overview: {
    purpose:
      'A loading state manages the gap between an action and its result. The goal is not to decorate the wait — it is to keep the interface stable, keep the user oriented, and where possible remove the perception of waiting altogether. Which technique to use is a function of duration and scope, not of preference.',
    whenToUse: [
      'Any operation that takes longer than roughly 200ms and changes what is on screen.',
      'A first page load where content areas would otherwise be empty.',
      'A background refresh, where the existing content should stay visible and readable.',
      'A user-initiated action that needs immediate acknowledgement in the control they pressed.',
    ],
    whenNotToUse: [
      {
        text: 'The operation completes in under about 100ms.',
        instead: 'nothing — an indicator that flashes looks like a bug',
      },
      {
        text: 'The result is almost certain and cheap to reverse.',
        instead: 'an optimistic update',
      },
      {
        text: 'Cached data is available and only slightly stale.',
        instead: 'showing the cached data and refreshing in the background',
      },
      {
        text: 'The operation takes minutes and the user should be free to leave.',
        instead: 'a persistent job surface plus a notification on completion',
      },
    ],
    reasoning: (
      <>
        <p>
          Start from the <strong>perception thresholds</strong>. Under 100ms is instantaneous. Up to
          about a second the user stays focused and needs only a small acknowledgement. Past a
          second attention drifts and the interface must show progress. Past ten seconds people
          leave the tab, and holding the page hostage stops being a loading state and becomes a
          usability failure.
        </p>
        <p>
          The second axis is <strong>scope</strong>. A whole page changing wants a skeleton; a
          single button wants an inline spinner; a list that is being appended to wants the new rows
          streamed in. Applying a full-page loader to a small change is the most common mistake, and
          it makes a fast application feel slow.
        </p>
        <p>
          The strongest technique is <strong>not loading at all</strong>. Optimistic updates,
          stale-while-revalidate caching, prefetching on hover, and streaming partial results all
          remove the wait rather than illustrating it. A product that uses them well shows loading
          states rarely, and that rarity is what makes it feel fast.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'matrix',
        title: 'Choosing a strategy',
        description:
          'Duration down, scope across. Almost every loading decision in a product is one of these six cells.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              <table className="w-full border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
                    <th scope="col" className="w-32 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Duration</th>
                    <th scope="col" className="w-44 px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Small region</th>
                    <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">Large region</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['< 100ms', 'Nothing', 'Nothing'],
                    ['100ms – 1s', 'Inline spinner (after 200ms)', 'Skeleton'],
                    ['1s – 10s', 'Inline spinner + disable', 'Skeleton, or determinate progress'],
                    ['> 10s', 'Background job + notification', 'Progress surface, let the user leave'],
                  ].map(([d, small, large]) => (
                    <tr key={d} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                      <td className="px-3 py-2.5 font-mono text-[11.5px] tabular-nums text-[var(--ds-accent-text)]">{d}</td>
                      <td className="px-3 py-2.5 text-[var(--ds-fg-secondary)]">{small}</td>
                      <td className="px-3 py-2.5 text-[var(--ds-fg-muted)]">{large}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'stale',
        title: 'Stale while revalidating',
        description:
          'The strongest pattern for a returning user. Show what you already have, refresh quietly, and mark the data as being updated rather than removing it.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Stale content stays readable" tone="good">
                <Card padding="sm" className="w-full">
                  <div className="flex items-center justify-between">
                    <p className="text-h4 tabular-nums text-[var(--ds-fg)]">1.24M</p>
                    <Spinner size={13} />
                  </div>
                  <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
                    Updated 4 minutes ago · refreshing
                  </p>
                </Card>
              </Cell>
              <Cell label="Content replaced by a spinner" tone="bad">
                <Card padding="sm" className="grid h-[76px] w-full place-items-center">
                  <Spinner size={18} />
                </Card>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'button',
        title: 'In-place acknowledgement',
        description:
          'The clearest feedback appears in the control the user just pressed. The button keeps its width, shows a spinner, and blocks a second submission.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <ButtonStates />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Idle', render: <Button size="sm">Save</Button> },
      { label: 'Pending', note: 'Width held', render: <Button size="sm" loading>Save</Button> },
      { label: 'Success', render: <Button size="sm" success>Save</Button> },
      { label: 'Inline spinner', render: <Spinner size={16} /> },
      { label: 'Skeleton', render: <Skeleton className="h-3 w-20" /> },
      { label: 'Determinate', render: <div className="w-20"><Progress value={62} size="sm" /></div> },
      { label: 'Indeterminate', render: <div className="w-20"><Progress indeterminate size="sm" /></div> },
      { label: 'Optimistic', note: 'Dimmed until confirmed', render: <span className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] px-2 py-1 text-caption opacity-55">service-3</span> },
      { label: 'Streaming', render: <span className="text-caption text-[var(--ds-fg-muted)]">3 results so far…</span> },
      { label: 'Stale', render: <span className="text-caption text-[var(--ds-warning-text)]">Updated 4m ago</span> },
      { label: 'Refreshing', render: <span className="inline-flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]"><RefreshCw size={11} className="animate-[spin_720ms_linear_infinite]" /> Refreshing</span> },
      { label: 'Complete', render: <span className="inline-flex items-center gap-1.5 text-caption text-[var(--ds-success-text)]"><Check size={12} /> Up to date</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Card padding="sm">
          <div className="flex items-center justify-between">
            <p className="text-label text-[var(--ds-fg)]">Requests</p>
            <Spinner size={13} />
          </div>
          <p className="mt-2 text-h2 tabular-nums text-[var(--ds-fg)]">1.24M</p>
          <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
            Updated 4 minutes ago · refreshing
          </p>
        </Card>
      </div>
    ),
    caption:
      'A background refresh. The value stays readable, the spinner is small and peripheral, and the staleness is stated in words.',
    parts: [
      {
        n: 1,
        label: 'Delay before showing',
        value: '200ms',
        kind: 'motion',
        note: 'Most requests finish faster. Without the delay, every fast response produces a flash that reads as instability.',
      },
      {
        n: 2,
        label: 'Indicator size',
        value: '13px, peripheral',
        kind: 'size',
        note: 'Proportional to the region being updated. A 40px spinner over a single stat is louder than the change it describes.',
      },
      {
        n: 3,
        label: 'Content opacity',
        value: '100%, not dimmed',
        kind: 'color',
        note: 'Stale data is still useful data. Dimming it to 50% makes it unreadable while offering nothing in return.',
      },
      {
        n: 4,
        label: 'Staleness label',
        value: '"Updated 4 minutes ago"',
        kind: 'type',
        note: 'The honest version of a loading state: the user knows exactly how much to trust what they are reading.',
      },
      {
        n: 5,
        label: 'Layout stability',
        value: 'No dimension change',
        kind: 'space',
        note: 'Nothing resizes between loading and loaded. Every pixel of shift is a chance the user clicks the wrong thing.',
      },
      {
        n: 6,
        label: 'Minimum visible time',
        value: '~400ms once shown',
        kind: 'motion',
        note: 'If the indicator has appeared, hold it briefly. An indicator that vanishes in 50ms is a flicker.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-active', usedFor: 'Skeleton fill' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Spinner and staleness label' },
    { category: 'color', token: '--ds-accent', usedFor: 'Progress fill' },
    { category: 'color', token: '--ds-warning-text', usedFor: 'Stale-data notice' },
    { category: 'spacing', token: 'indicator size', value: '12 / 16 / 20px', usedFor: 'Inline, control, region' },
    { category: 'motion', token: 'delay', value: '200ms', usedFor: 'Before any indicator appears' },
    { category: 'motion', token: 'minimum', value: '400ms', usedFor: 'Once shown, before it may disappear' },
    { category: 'motion', token: 'spin', value: '720ms linear', usedFor: 'Spinner rotation' },
    { category: 'motion', token: 'shimmer', value: '1.6s linear', usedFor: 'Skeleton sweep' },
  ],

  sizes: [
    { name: 'Inline', icon: '12–14px', use: 'Inside a control, a table cell, or beside a label.' },
    { name: 'Control', icon: '16px', use: 'Inside a button, replacing the label without changing the width.' },
    { name: 'Region', icon: '20–24px', use: 'Centred in a card or a panel that has no known layout.' },
    { name: 'Page', height: 'Skeleton', use: 'Never a centred spinner on a full page — use a skeleton of the real layout.' },
    { name: 'Bar', height: '2px', use: 'Pinned to the top of a table or the page during a background refresh.' },
  ],

  do: [
    {
      title: 'Delay the indicator by 200ms',
      why: 'Most requests resolve faster than that. The delay costs nothing on slow responses and removes the flash on fast ones, which is what makes an app feel stable.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const t = setTimeout(() =&gt; setBusy(true), 200)
          <br />
          return () =&gt; clearTimeout(t)
        </code>
      ),
    },
    {
      title: 'Keep stale content on screen',
      why: 'Four-minute-old numbers are far more useful than a spinner. Refresh underneath and say when the data was last updated.',
      render: (
        <Card padding="sm" className="w-full">
          <p className="text-h4 tabular-nums text-[var(--ds-fg)]">1.24M</p>
          <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">Updated 4 minutes ago</p>
        </Card>
      ),
    },
    {
      title: 'Acknowledge in the control that was pressed',
      why: 'The user is looking at the button. Feedback anywhere else costs a saccade, and feedback that changes the button’s width costs a mis-click.',
      render: (
        <Row gap="sm">
          <Button size="sm" startIcon={<Send />}>Send invite</Button>
          <Button size="sm" loading startIcon={<Send />}>Send invite</Button>
        </Row>
      ),
    },
    {
      title: 'Be optimistic when success is likely and cheap to undo',
      why: 'Adding a tag, toggling a favourite, sending a message — show it immediately and reconcile after. The interface stops having a latency at all.',
      render: <OptimisticDemo />,
    },
  ],

  dont: [
    {
      title: 'Do not put a full-page spinner over a small change',
      why: 'A modal loader for a 300ms filter change makes a fast application feel slow, and it removes the content the user was reading.',
      render: (
        <div className="grid h-24 w-full place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-scrim)]">
          <Spinner size={24} />
        </div>
      ),
    },
    {
      title: 'Do not replace content with a spinner on refresh',
      why: 'The user loses their place and their data for the duration of a request that will almost certainly return the same thing.',
      render: (
        <Card padding="sm" className="grid h-[76px] w-full place-items-center">
          <Spinner size={18} />
        </Card>
      ),
    },
    {
      title: 'Do not stack multiple indicators',
      why: 'A page spinner, three card skeletons and a top progress bar for one request is three answers to one question, and it looks broken.',
      render: (
        <div className="w-full">
          <Progress indeterminate size="xs" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Skeleton className="h-12 w-full" rounded="lg" />
            <div className="grid place-items-center rounded-[var(--radius-lg)] bg-[var(--ds-layer-active)]">
              <Spinner size={16} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Do not let an indicator flicker',
      why: 'A spinner that appears for 40ms is a visual glitch. Once shown, hold it for at least 400ms even if the response has already arrived.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          show at 0ms → hide at 40ms → the user sees a flash
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A' },
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
    ],
    contrast: [
      'A spinner is a meaningful graphic and must reach 3:1 against its background.',
      'Do not reduce content opacity below about 55% while loading — text at 40% opacity fails contrast and becomes genuinely unreadable.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Must still work during loading. Disabling the whole page traps the user.' },
      { keys: 'Enter', does: 'A pending button must not re-submit. Disable it or guard the handler.' },
      { keys: 'Esc', does: 'Should cancel a cancellable request, where one exists.' },
    ],
    aria: [
      { attr: 'aria-busy="true"', on: 'The loading region', note: 'One flag on the container. Not on every skeleton block inside it.' },
      { attr: 'aria-live="polite"', on: 'A status region', note: 'Announce the transition once: "Loading projects", then "12 projects loaded".' },
      { attr: 'aria-disabled', on: 'A pending button', note: 'Prefer over disabled when the button must stay focusable and explain itself.' },
      { attr: 'role="status"', on: 'An inline spinner', note: 'With a visually hidden label. A bare spinning icon announces as nothing.' },
      { attr: 'aria-hidden="true"', on: 'Skeleton blocks', note: 'They are decorative placeholders, not content.' },
    ],
    focus:
      'Never move focus because something started or finished loading. If focus was in a filter field, it must still be there when results arrive — otherwise the user is thrown back to the top of the page mid-task.',
    screenReader: [
      'Announce the state change once at each end, not continuously. A live region that fires on every progress tick is unusable.',
      'A spinner with no text is silent. Pair it with a visually hidden "Loading" or an aria-label naming what is loading.',
      'Optimistic updates should be announced as provisional if they can fail: "Sending", then "Sent" or "Could not send".',
    ],
    touch:
      'Do not block the whole screen with an overlay for a short wait. On mobile that removes scrolling entirely, and users interpret an unresponsive page as a crash.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// 1. Delay in, minimum out — the two rules that remove flicker
function useLoadingIndicator(active: boolean, delay = 200, min = 400) {
  const [show, setShow] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => {
        shownAt.current = Date.now()
        setShow(true)
      }, delay)
      return () => clearTimeout(t)
    }
    if (!show) return
    const held = Date.now() - shownAt.current
    const t = setTimeout(() => setShow(false), Math.max(0, min - held))
    return () => clearTimeout(t)
  }, [active, delay, min, show])

  return show
}

// 2. Stale while revalidating — keep the content, mark it stale
const { data, isFetching, dataUpdatedAt } = useQuery({
  queryKey: ['metrics'],
  queryFn: fetchMetrics,
  staleTime: 30_000,
  placeholderData: (prev) => prev,      // never blank on refetch
})

<Stat value={data.requests} />
<p className="text-caption text-fg-muted">
  Updated {formatRelative(dataUpdatedAt)}{isFetching && ' · refreshing'}
</p>

// 3. Optimistic — show it now, reconcile after
async function addTag(tag: string) {
  const optimistic = { id: 'tmp-' + tag, name: tag, pending: true }
  setTags((t) => [...t, optimistic])
  try {
    const saved = await api.addTag(tag)
    setTags((t) => t.map((x) => (x.id === optimistic.id ? saved : x)))
  } catch {
    setTags((t) => t.filter((x) => x.id !== optimistic.id))
    toast({ tone: 'danger', title: 'Could not add ' + tag })
  }
}

// 4. Prefetch on intent — the wait disappears entirely
<Link onMouseEnter={() => prefetch(href)} onFocus={() => prefetch(href)} />`,
    },
    css: {
      lang: 'css',
      code: `/* Stale content stays readable. 55% is the floor. */
.is-refetching { opacity: 0.55; transition: opacity 160ms var(--ease-standard); }

/* A 2px bar at the top of the region being refreshed. Least
   intrusive indicator there is — it changes nothing below it. */
.region { position: relative; }
.region__loading-bar {
  position: absolute;
  inset-inline: 0;
  inset-block-start: 0;
  block-size: 2px;
  overflow: hidden;
}

/* A pending button keeps its width — the label stays in the DOM */
.ds-btn[aria-busy='true'] .ds-btn__label { visibility: hidden; }
.ds-btn[aria-busy='true'] .ds-btn__spinner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

/* Do not block the page. If you must overlay, keep it scoped
   to the region and keep the scrim light. */
.region--blocking::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in oklab, var(--ds-canvas) 60%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .ds-spinner { animation-duration: 2s; }
}`,
    },
  },

  notes: {
    tips: [
      'Prefetch on hover and on focus. For a link the user is about to click, the data is often already there by the time they click — no loading state needed at all.',
      'Measure p95, not the average. The loading state you think is rare is usually showing on a meaningful share of requests.',
      'For a slow endpoint you cannot fix, render the page shell and the navigation immediately and load only the data region. Perceived speed is mostly about the first paint.',
      'When a request exceeds about eight seconds, change the message rather than the indicator: "Still working — this is taking longer than usual" is far better than the same spinner.',
    ],
    performance: [
      'React Suspense with streaming SSR sends the shell first and the data as it resolves. It converts one long wait into several short ones.',
      'Do not render the loading tree and the content tree at once. Conditional rendering keeps the DOM small; hiding one with CSS pays for both.',
      'Debounce search-driven loading by 300ms and cancel in-flight requests with AbortController, or a slow early response can overwrite a fast later one.',
      'Cache aggressively with a short stale time. Most navigations in an application are back to somewhere the user has already been.',
    ],
    mistakes: [
      'Showing the indicator immediately, so every fast response flashes.',
      'Hiding it the instant the response lands, so the indicator flickers.',
      'Replacing content with a spinner on background refresh, losing the user’s place for no benefit.',
      'A full-page overlay for a small change, which makes a fast app feel slow.',
      'Moving focus when loading completes, throwing the user out of whatever they were typing.',
    ],
    realWorld: [
      'Optimistic updates are the single biggest perceived-performance win available, and they are mostly a state-management decision rather than a design one. Budget for them early.',
      'Instrument how often each loading state is actually seen. States that appear on 40% of interactions deserve real design attention; ones that appear on 0.1% do not.',
      'Users tolerate a slow operation far better than an unpredictable one. Consistent 800ms beats a range of 200ms to 3s, even though the average is worse.',
      'For anything over ten seconds, send a notification on completion and let the user leave. Holding the tab open is not a safety measure, it is a design failure.',
    ],
  },
})

function ButtonStates() {
  const [state, setState] = React.useState<'idle' | 'busy' | 'done'>('idle')
  return (
    <Row gap="sm" align="center">
      <Button
        loading={state === 'busy'}
        success={state === 'done'}
        startIcon={<Send />}
        onClick={() => {
          setState('busy')
          setTimeout(() => setState('done'), 1200)
          setTimeout(() => setState('idle'), 2800)
        }}
      >
        Send invite
      </Button>
      <span className="text-caption text-[var(--ds-fg-muted)]">
        idle → loading → success → idle
      </span>
    </Row>
  )
}
