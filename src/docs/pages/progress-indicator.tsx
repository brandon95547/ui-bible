import * as React from 'react'
import { Progress, ProgressRing, Spinner } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Meter, type Tone } from '@/ui/Display'
import { Cell, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [tone, setTone] = React.useState<Tone>('accent')
  const [size, setSize] = React.useState<'xs' | 'sm' | 'md'>('md')
  const [indeterminate, setIndeterminate] = React.useState(false)
  const [showValue, setShowValue] = React.useState(true)
  const [value, setValue] = React.useState(38)

  React.useEffect(() => {
    if (indeterminate) return
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 3)), 240)
    return () => clearInterval(t)
  }, [indeterminate])

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={140}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Tone">
            <KnobSelect
              value={tone}
              onChange={setTone}
              options={['accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const}
            />
          </Knob>
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['xs', 'sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={indeterminate} onChange={setIndeterminate} label="Indeterminate" />
          <KnobToggle checked={showValue} onChange={setShowValue} label="Show value" />
        </div>
      }
      code={`<Progress
  ${indeterminate ? 'indeterminate' : `value={${Math.round(value)}}`}
  tone="${tone}"
  size="${size}"
  label="Uploading build artefacts"${showValue ? '\n  showValue' : ''}
/>`}
    >
      <div className="w-full max-w-md">
        <Progress
          value={value}
          tone={tone}
          size={size}
          indeterminate={indeterminate}
          label="Uploading build artefacts"
          showValue={showValue}
        />
      </div>
    </PreviewStage>
  )
}

function StepsDemo() {
  const [step, setStep] = React.useState(1)
  const steps = ['Build', 'Test', 'Deploy', 'Verify']
  return (
    <PreviewStage center={false} minHeight={0} allowResize={false}>
      <Stack gap="md" className="w-full max-w-lg">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-label-sm transition-colors ${
                    i < step
                      ? 'bg-[var(--ds-success)] text-[var(--ds-success-fg)]'
                      : i === step
                        ? 'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)]'
                        : 'bg-[var(--ds-layer-active)] text-[var(--ds-fg-muted)]'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="text-[10px] text-[var(--ds-fg-muted)]">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <span className="mb-4 h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--ds-layer-active)]">
                  <span
                    className="block h-full bg-[var(--ds-success)] transition-[width] duration-[420ms]"
                    style={{ width: i < step ? '100%' : '0%' }}
                  />
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <Row gap="sm">
          <Button size="sm" variant="outlined" onClick={() => setStep((s) => Math.max(0, s - 1))}>
            Back
          </Button>
          <Button size="sm" onClick={() => setStep((s) => Math.min(steps.length, s + 1))}>
            Advance
          </Button>
        </Row>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'progress-indicator',
    title: 'Progress Indicator',
    tagline:
      'Determinate whenever you can compute a percentage. A real number turns waiting into progress; a spinner just says "still here".',
    keywords: ['loading', 'spinner', 'bar', 'percent', 'meter', 'indeterminate', 'upload', 'steps'],
  },

  overview: {
    purpose:
      'A progress indicator answers two questions: is anything happening, and how much longer. A spinner answers the first. A determinate bar answers both, and the difference in perceived speed is substantial — the same wait feels shorter when the user can see it shrinking.',
    whenToUse: [
      'An operation with a computable percentage: an upload, a multi-file import, a batch job.',
      'A wait longer than about one second where the user has to stay on the page.',
      'A multi-step flow, where the bar shows position rather than time.',
      'A usage meter — storage, quota, seats — where the value is a state rather than a process.',
    ],
    whenNotToUse: [
      {
        text: 'The wait is under about 300ms.',
        instead: 'nothing — a flash of a spinner is worse than a brief pause',
      },
      {
        text: 'The layout of the result is already known.',
        instead: 'a Skeleton',
        to: '#/skeleton',
      },
      {
        text: 'The operation continues in the background and the user can leave.',
        instead: 'a persistent status surface, not a blocking bar',
      },
      {
        text: 'You are faking a percentage because it looks better.',
        instead: 'an indeterminate bar — a fake number that stalls at 90% destroys trust',
      },
    ],
    reasoning: (
      <>
        <p>
          The perception thresholds are the whole design here. Under <strong>100ms</strong> a
          response reads as instantaneous and needs no indicator at all. Between 100ms and{' '}
          <strong>1 second</strong> the user notices but stays focused — show an inline spinner at
          most. Past 1 second attention starts to drift, and past{' '}
          <strong>10 seconds</strong> people leave the tab. That last threshold is why long jobs
          need a persistent surface rather than a modal bar.
        </p>
        <p>
          <strong>Never fake a percentage.</strong> A bar that races to 90% and sits there is worse
          than an honest indeterminate one, because it makes a promise and then breaks it. If you
          genuinely cannot measure the work, say so with an indeterminate bar and, where possible, a
          count: "42 of 310 files".
        </p>
        <p>
          Indeterminate progress omits <code>aria-valuenow</code> entirely rather than reporting 0.
          Reporting 0% tells a screen-reader user that nothing has happened, which is a different
          and worse statement than "this is running and I do not know how far along it is".
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'kinds',
        title: 'Every kind',
        description:
          'Linear, circular, spinner and meter. The first three describe a process; the meter describes a state.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-5 sm:grid-cols-2">
              <Cell label="Linear determinate" sub="The default for any measurable job">
                <Progress value={64} label="Uploading" showValue />
              </Cell>
              <Cell label="Linear indeterminate" sub="Running, duration unknown">
                <Progress indeterminate label="Connecting" />
              </Cell>
              <Cell label="Circular" sub="Compact, inside a card or a button">
                <Row gap="lg" align="center">
                  <ProgressRing value={64}>64</ProgressRing>
                  <ProgressRing value={100} tone="success" size={32} thickness={3} />
                  <ProgressRing indeterminate size={28} />
                </Row>
              </Cell>
              <Cell label="Meter" sub="A state, not a process">
                <Stack gap="sm" className="w-full">
                  <Meter label="Storage" value={72} />
                  <Meter label="Seats" value={94} tone="warning" />
                </Stack>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'steps',
        title: 'Step progress',
        description:
          'For a wizard, the bar shows position rather than time. Completed steps get a check, the current step is accented, and future steps are muted.',
        render: <StepsDemo />,
      },
      {
        id: 'thresholds',
        title: 'Perception thresholds',
        description:
          'Which indicator to use is a function of duration, not of taste.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              <table className="w-full border-collapse text-body-sm">
                <tbody>
                  {[
                    ['< 100ms', 'Nothing', 'Reads as instant. An indicator would flash and look like a glitch.'],
                    ['100ms – 1s', 'Inline spinner, after a 200ms delay', 'Noticeable but the user stays focused.'],
                    ['1s – 10s', 'Determinate bar, or a skeleton', 'Attention drifts. Show how much is left.'],
                    ['> 10s', 'Persistent surface, let them leave', 'People switch tabs. Do not hold the page hostage.'],
                  ].map(([t, what, why]) => (
                    <tr key={t} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                      <td className="w-28 px-3 py-2.5 font-mono text-[11.5px] tabular-nums text-[var(--ds-accent-text)]">{t}</td>
                      <td className="w-56 px-3 py-2.5 text-[var(--ds-fg)]">{what}</td>
                      <td className="px-3 py-2.5 text-[var(--ds-fg-muted)]">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '0%', render: <div className="w-24"><Progress value={0} /></div> },
      { label: '38%', render: <div className="w-24"><Progress value={38} /></div> },
      { label: '100%', render: <div className="w-24"><Progress value={100} tone="success" /></div> },
      { label: 'Indeterminate', render: <div className="w-24"><Progress indeterminate /></div> },
      { label: 'Error', note: 'Stops where it failed', render: <div className="w-24"><Progress value={61} tone="danger" /></div> },
      { label: 'Ring', render: <ProgressRing value={64} size={36}>64</ProgressRing> },
      { label: 'Ring done', render: <ProgressRing value={100} tone="success" size={36} /> },
      { label: 'Spinner', render: <Spinner size={20} /> },
      { label: 'Meter safe', render: <div className="w-24"><Meter value={32} /></div> },
      { label: 'Meter warning', render: <div className="w-24"><Meter value={88} tone="warning" /></div> },
      { label: 'Meter full', render: <div className="w-24"><Meter value={100} tone="danger" /></div> },
      { label: 'xs bar', note: 'Top of a container', render: <div className="w-24"><Progress value={45} size="xs" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Progress value={64} label="Uploading build artefacts" showValue />
        <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">
          128 MB of 200 MB · about 40 seconds remaining
        </p>
      </div>
    ),
    caption:
      'Label, percentage, track, fill, and a line of concrete detail. The percentage alone is abstract; "128 MB of 200 MB" is what the user actually understands.',
    parts: [
      {
        n: 1,
        label: 'Track height',
        value: '2 / 4 / 6px',
        kind: 'size',
        note: 'xs at the top edge of a container, sm inline, md as a standalone indicator. Anything thicker starts reading as a chart.',
      },
      {
        n: 2,
        label: 'Track colour',
        value: '--ds-layer-active',
        kind: 'color',
        note: 'An alpha layer, so the same track works on a card, a dialog, or a coloured banner.',
      },
      {
        n: 3,
        label: 'Fill transition',
        value: 'width, 420ms standard',
        kind: 'motion',
        note: 'Long enough that a jump from 20% to 80% reads as movement rather than a teleport. Width is a layout property, but on a 4px bar the cost is negligible.',
      },
      {
        n: 4,
        label: 'Percentage',
        value: '12px, tabular',
        kind: 'type',
        note: 'Tabular figures so the number does not shift the label as it counts up.',
      },
      {
        n: 5,
        label: 'Concrete detail',
        value: 'Below the bar',
        kind: 'type',
        note: '"128 MB of 200 MB" is more useful than "64%". Give both — the percentage for the glance, the units for the judgement.',
      },
      {
        n: 6,
        label: 'Radius',
        value: 'Fully rounded',
        kind: 'shape',
        note: 'Both the track and the fill. A square fill inside a rounded track leaves a visible notch at low percentages.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-active', usedFor: 'Track' },
    { category: 'color', token: '--ds-accent', usedFor: 'Fill, default tone' },
    { category: 'color', token: '--ds-success', usedFor: 'Completed fill' },
    { category: 'color', token: '--ds-danger', usedFor: 'Failed fill' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Label' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Percentage and detail line' },
    { category: 'spacing', token: 'track height', value: '2 / 4 / 6px', usedFor: 'xs / sm / md' },
    { category: 'spacing', token: 'label gap', value: '8px', usedFor: 'Label row to track' },
    { category: 'radius', token: 'full', usedFor: 'Track and fill' },
    { category: 'motion', token: 'width transition', value: '420ms standard', usedFor: 'Determinate fill' },
    { category: 'motion', token: 'indeterminate', value: '1.4s standard, infinite', usedFor: 'Unknown-duration sweep' },
    { category: 'motion', token: 'spin', value: '720ms linear', usedFor: 'Spinner. Linear because it is mechanical.' },
  ],

  sizes: [
    { name: 'Extra small', height: '2px', radius: 'full', maxWidth: '100%', use: 'Pinned to the top edge of a table, card or page during a refresh.' },
    { name: 'Small', height: '4px', radius: 'full', maxWidth: '480px', use: 'Inline within a list row or a compact card.' },
    { name: 'Medium', height: '6px', radius: 'full', maxWidth: '480px', use: 'Standalone, with a label and a percentage.' },
    { name: 'Ring', height: '28–48px', use: 'Compact circular. Inside buttons, avatars, or a stat tile.' },
    { name: 'Spinner', height: '14 / 16 / 20 / 24px', use: 'Indeterminate only. Match the icon size of its context.' },
    { name: 'Meter', height: '6px', maxWidth: '320px', use: 'A state such as storage or quota, not a running process.' },
  ],

  do: [
    {
      title: 'Give a concrete unit as well as a percentage',
      why: '"64%" is abstract. "128 MB of 200 MB, about 40 seconds remaining" lets the user decide whether to wait or go and do something else.',
      render: (
        <Stack gap="xs" className="w-full">
          <Progress value={64} label="Uploading" showValue />
          <span className="text-caption text-[var(--ds-fg-muted)]">128 MB of 200 MB · ~40s left</span>
        </Stack>
      ),
    },
    {
      title: 'Delay the indicator by about 200ms',
      why: 'Most requests finish faster than that. Showing a spinner immediately means a flash on every fast response, which reads as instability rather than speed.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const t = setTimeout(() =&gt; setBusy(true), 200)
          <br />
          return () =&gt; clearTimeout(t)
        </code>
      ),
    },
    {
      title: 'Let the bar finish before it disappears',
      why: 'A bar that vanishes at 80% because the request returned leaves the user unsure whether it completed. Animate to 100%, hold briefly, then remove.',
      render: (
        <Stack gap="xs" className="w-full">
          <Progress value={100} tone="success" label="Complete" showValue />
        </Stack>
      ),
    },
    {
      title: 'Use a meter for a state, a bar for a process',
      why: 'Storage at 72% is not loading. role="meter" tells assistive tech it is a measurement, not something that will finish on its own.',
      render: (
        <Stack gap="sm" className="w-full">
          <Meter label="Storage used" value={72} />
          <Meter label="Seats" value={94} tone="warning" />
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not fake the percentage',
      why: 'A bar that sprints to 90% and stalls makes a promise and breaks it. Users learn to distrust every progress bar in the product after one experience of this.',
      render: (
        <Stack gap="xs" className="w-full">
          <Progress value={92} label="Almost done…" showValue />
          <span className="text-caption text-[var(--ds-danger-text)]">…for the last four minutes</span>
        </Stack>
      ),
    },
    {
      title: 'Do not use a spinner for a measurable job',
      why: 'If you know the byte count, show it. A spinner for a two-minute upload tells the user nothing except that the page has not crashed.',
      render: (
        <Row gap="sm" align="center">
          <Spinner size={20} />
          <span className="text-caption text-[var(--ds-fg-muted)]">Uploading 200 MB…</span>
        </Row>
      ),
    },
    {
      title: 'Do not block the page for a long job',
      why: 'Past about ten seconds people switch tabs. A modal progress bar means they come back to a stale page instead of a finished one.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] p-4 text-center">
          <Spinner size={20} className="mx-auto" />
          <p className="mt-2 text-caption text-[var(--ds-danger-text)]">
            Please do not close this window (4 min remaining)
          </p>
        </div>
      ),
    },
    {
      title: 'Do not report 0% for indeterminate progress',
      why: 'aria-valuenow="0" tells a screen-reader user that nothing has happened. Omitting it entirely says "running, duration unknown", which is the truth.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;div role="progressbar" aria-valuenow="0"&gt;
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'The fill must reach 3:1 against the track — it is a meaningful graphic under WCAG 1.4.11.',
      'The track itself does not need to meet contrast against the page, but if it is invisible the user cannot see how much is left.',
      'Never signal completion with colour alone. Pair the green fill with a check, the word "Complete", or 100%.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Progress indicators are not focusable. Any cancel button next to one is.' },
      { keys: 'Esc', does: 'Should cancel a cancellable operation, if a cancel affordance exists.' },
    ],
    aria: [
      { attr: 'role="progressbar"', on: 'The track', note: 'For a process that will finish.' },
      { attr: 'role="meter"', on: 'A usage bar', note: 'For a measurement that is simply true right now.' },
      { attr: 'aria-valuenow', on: 'Determinate only', note: 'Omit entirely when indeterminate. Never send 0 as a stand-in.' },
      { attr: 'aria-valuemin / -valuemax', on: 'The track', note: '0 and 100 unless you are reporting raw units.' },
      { attr: 'aria-label / aria-labelledby', on: 'The track', note: 'Name what is progressing: "Uploading build artefacts", not "Progress".' },
      { attr: 'aria-live="polite"', on: 'A status region', note: 'Announce milestones — 25, 50, 75, 100 — not every percent.' },
      { attr: 'aria-busy', on: 'The affected region', note: 'On the container being loaded, so assistive tech knows its contents are provisional.' },
    ],
    focus:
      'Progress never takes focus. If focus was inside a region that is now loading, leave it there — moving it to a spinner strands the user when the spinner disappears.',
    screenReader: [
      'Announce milestones, not every update. A live region firing on every percent is unusable.',
      'Say what is progressing. "Progress, 64%" is far less useful than "Uploading build artefacts, 64%".',
      'On completion, announce the outcome rather than 100%: "Upload complete, 200 MB".',
    ],
    touch:
      'Progress bars are not interactive, so touch targets do not apply — but any cancel control beside one must still be 44px, and it must not be so close that a mis-tap cancels a long job.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Progress, ProgressRing, Spinner } from '@/ui/Feedback'
import { Meter } from '@/ui/Display'

// Determinate, with a concrete unit alongside the percentage
<Progress value={pct} label="Uploading build artefacts" showValue />
<p className="text-caption text-fg-muted">
  {formatBytes(sent)} of {formatBytes(total)} · {eta} remaining
</p>

// Indeterminate: no aria-valuenow at all
<Progress indeterminate label="Connecting to the cluster" />

// Delay by 200ms so fast responses never flash a spinner
function useDelayedBusy(active: boolean, delay = 200) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!active) return setShow(false)
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [active, delay])
  return show
}

// Announce milestones, not every percent
const milestone = Math.floor(pct / 25) * 25
<div aria-live="polite" className="sr-only">
  {milestone > 0 && milestone + '% uploaded'}
</div>

// Let it finish before it disappears
async function upload() {
  await send()
  setPct(100)
  await wait(400)      // let the bar land
  setDone(true)
}`,
    },
    html: {
      lang: 'html',
      code: `<!-- Determinate -->
<div class="ds-progress">
  <div class="ds-progress__header">
    <span id="up-label">Uploading build artefacts</span>
    <span class="ds-progress__value">64%</span>
  </div>
  <div class="ds-progress__track"
       role="progressbar"
       aria-labelledby="up-label"
       aria-valuenow="64" aria-valuemin="0" aria-valuemax="100">
    <div class="ds-progress__fill" style="width: 64%"></div>
  </div>
</div>

<!-- Indeterminate: aria-valuenow is ABSENT, not zero -->
<div class="ds-progress__track" role="progressbar" aria-label="Connecting">
  <div class="ds-progress__fill ds-progress__fill--indeterminate"></div>
</div>

<!-- A state, not a process -->
<div role="meter" aria-label="Storage used"
     aria-valuenow="72" aria-valuemin="0" aria-valuemax="100">…</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-progress__track {
  block-size: 6px;
  inline-size: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: var(--ds-layer-active);
}

.ds-progress__fill {
  block-size: 100%;
  border-radius: 999px;              /* rounded, or low values show a notch */
  background: var(--ds-accent);
  transition: width 420ms var(--ease-standard);
}

/* Indeterminate: a sweep, on transform only */
.ds-progress__fill--indeterminate {
  inline-size: 100%;
  transform-origin: left;
  animation: indeterminate 1.4s var(--ease-standard) infinite;
}
@keyframes indeterminate {
  0%   { transform: translateX(-100%) scaleX(0.35) }
  50%  { transform: translateX(20%)   scaleX(0.60) }
  100% { transform: translateX(150%)  scaleX(0.35) }
}

/* A spinner is mechanical — linear, not eased */
@keyframes spin { to { transform: rotate(360deg) } }
.ds-spinner { animation: spin 720ms linear infinite; }

/* Reduced motion: slow the loop rather than removing it, so the user
   can still tell that something is running. */
@media (prefers-reduced-motion: reduce) {
  .ds-progress__fill--indeterminate { animation-duration: 3s; }
  .ds-spinner { animation-duration: 2s; }
}`,
    },
    api: [
      {
        name: 'Progress',
        props: [
          { name: 'value', type: 'number', description: '0–100. Omit when indeterminate.' },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Drops aria-valuenow entirely rather than reporting 0.' },
          { name: 'label', type: 'string', description: 'Names what is progressing. Also becomes the accessible name.' },
          { name: 'showValue', type: 'boolean', default: 'false', description: 'Right-aligned percentage in tabular figures.' },
          { name: 'tone', type: 'Tone', default: "'accent'", description: 'success on completion, danger on failure.' },
          { name: 'size', type: "'xs' | 'sm' | 'md'", default: "'md'", description: '2 / 4 / 6px track.' },
        ],
      },
      {
        name: 'ProgressRing',
        props: [
          { name: 'value', type: 'number', description: '0–100.' },
          { name: 'size', type: 'number', default: '40', description: 'Outer diameter in px.' },
          { name: 'thickness', type: 'number', default: '3', description: 'Stroke width.' },
          { name: 'children', type: 'ReactNode', description: 'Centred content — usually the number.' },
        ],
      },
      {
        name: 'Meter',
        props: [
          { name: 'value', type: 'number', required: true, description: 'Current amount.' },
          { name: 'max', type: 'number', default: '100', description: 'Upper bound.' },
          { name: 'label', type: 'string', description: 'Shown above with the percentage.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'For multi-file uploads, show one bar for the batch and a count underneath. Twelve individual bars is a progress wall nobody reads.',
      'If the operation can be cancelled, put the cancel button next to the bar, not in a menu. Users look for it exactly where they are already looking.',
      'When progress genuinely stalls, say so. "Waiting for the build server" after fifteen seconds of no movement is far better than a bar that has simply stopped.',
      'Reserve the space for the bar before it appears, or its arrival shifts everything below it and the user loses their place.',
    ],
    performance: [
      'Do not update the bar more than about twenty times a second. Throttle progress events — a fast upload can otherwise fire hundreds of state updates per second.',
      'Animate transform for indeterminate sweeps and width only for determinate fills. On a 4px bar the layout cost of width is negligible; on anything larger, use transform: scaleX.',
      'A page with many simultaneous spinners is many simultaneous animations. Use one indeterminate bar at the top of the region instead.',
    ],
    mistakes: [
      'Reporting aria-valuenow="0" for indeterminate progress, which announces as "0 percent" — the opposite of the intended meaning.',
      'Showing a spinner instantly, so every fast request produces a flash that reads as a glitch.',
      'Removing the bar the moment the request resolves, leaving the user unsure whether it finished.',
      'Announcing every percentage change in a live region, which floods the screen-reader queue.',
      'Using role="progressbar" for a storage meter, so assistive tech tells the user their disk usage is "loading".',
    ],
    realWorld: [
      'An honest indeterminate bar beats a dishonest determinate one every time. Users forgive not knowing; they do not forgive being misled.',
      'For jobs over ten seconds, send an email or a notification on completion and let the user leave. Holding the page is a design failure, not a safety measure.',
      'Progress that includes a time estimate should round generously and never revise upward twice. "About a minute" that becomes "about three minutes" destroys confidence.',
      'Instrument how long your "fast" operations actually take at p95. Most teams discover that the spinner they thought was rare is showing on a third of requests.',
    ],
  },
})
