import * as React from 'react'
import { Button } from '@/ui/Button'
import { Cell, Knob, KnobSelect, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const DURATIONS = [
  { token: '--duration-instant', ms: 75, use: 'Colour change on a control the pointer is already over.' },
  { token: '--duration-fast', ms: 120, use: 'Hover, press, focus. The default for feedback.' },
  { token: '--duration-quick', ms: 160, use: 'Tooltips, small fades, icon rotation.' },
  { token: '--duration-normal', ms: 220, use: 'Popovers, dropdowns, accordions, tab panels.' },
  { token: '--duration-slow', ms: 320, use: 'Dialogs, drawers, anything crossing a large distance.' },
  { token: '--duration-slower', ms: 480, use: 'Full-screen transitions, onboarding sequences.' },
  { token: '--duration-deliberate', ms: 640, use: 'Deliberate emphasis. One per flow, at most.' },
]

const EASINGS = [
  { token: '--ease-standard', curve: 'cubic-bezier(0.2, 0, 0, 1)', use: 'Almost everything. Fast start, long settle.' },
  { token: '--ease-emphasized', curve: 'cubic-bezier(0.32, 0.72, 0, 1)', use: 'Surfaces that enter or leave the screen.' },
  { token: '--ease-decelerate', curve: 'cubic-bezier(0.05, 0.7, 0.1, 1)', use: 'Elements entering the viewport.' },
  { token: '--ease-accelerate', curve: 'cubic-bezier(0.3, 0, 0.8, 0.15)', use: 'Elements leaving the viewport.' },
  { token: '--ease-spring', curve: 'cubic-bezier(0.34, 1.56, 0.64, 1)', use: 'One playful overshoot. Toggles and success ticks only.' },
]

function bezierPath(curve: string) {
  const m = curve.match(/cubic-bezier\(([^)]+)\)/)
  if (!m) return ''
  const [x1, y1, x2, y2] = m[1].split(',').map((n) => parseFloat(n))
  const X = (v: number) => 8 + v * 84
  const Y = (v: number) => 92 - v * 84
  return `M ${X(0)} ${Y(0)} C ${X(x1)} ${Y(y1)}, ${X(x2)} ${Y(y2)}, ${X(1)} ${Y(1)}`
}

function EasingCard({ token, curve, use }: (typeof EASINGS)[number]) {
  const [tick, setTick] = React.useState(0)
  return (
    <button
      type="button"
      onClick={() => setTick((t) => t + 1)}
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3.5 text-left transition-colors hover:border-[var(--ds-border)]"
    >
      <svg viewBox="0 0 100 100" className="h-24 w-full">
        <line x1="8" y1="92" x2="92" y2="92" stroke="var(--ds-border)" strokeWidth="1" />
        <line x1="8" y1="8" x2="8" y2="92" stroke="var(--ds-border)" strokeWidth="1" />
        <path d={bezierPath(curve)} fill="none" stroke="var(--ds-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {/* container-type lets the keyframe express travel as 100cqw − 100%,
          so it stays a pure transform animation at any card width. */}
      <div
        className="h-6 overflow-hidden rounded-full bg-[var(--ds-surface-inset)]"
        style={{ containerType: 'inline-size' }}
      >
        <span
          key={tick}
          className="block h-6 w-6 rounded-full bg-[var(--ds-accent)]"
          style={{
            animation: `slide-x 900ms ${curve} both`,
          }}
        />
      </div>
      <div>
        <code className="font-mono text-[11px] text-[var(--ds-accent-text)]">{token}</code>
        <p className="mt-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">{use}</p>
      </div>
    </button>
  )
}

function DurationLab() {
  const [ms, setMs] = React.useState<string>('220')
  const [ease, setEase] = React.useState<string>('--ease-standard')
  const [on, setOn] = React.useState(false)
  // Measured rather than guessed, so the demo animates transform only —
  // which is the rule this page is about.
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [travel, setTravel] = React.useState(0)
  React.useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setTravel(Math.max(0, e.contentRect.width - 40)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <PreviewStage
      label="Feel it"
      minHeight={160}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Duration">
            <KnobSelect
              value={ms}
              onChange={setMs}
              options={['75', '120', '160', '220', '320', '480', '640', '1200']}
            />
          </Knob>
          <Knob label="Easing">
            <KnobSelect
              value={ease}
              onChange={setEase}
              options={EASINGS.map((e) => e.token)}
            />
          </Knob>
        </div>
      }
    >
      <Stack gap="md" className="w-full max-w-md items-center">
        <div
          ref={trackRef}
          className="h-12 w-full overflow-hidden rounded-full bg-[var(--ds-surface-inset)] p-1"
        >
          <span
            className="block h-10 w-10 rounded-full bg-[var(--ds-accent)] shadow-e2"
            style={{
              transform: `translateX(${on ? travel : 0}px)`,
              transitionProperty: 'transform',
              transitionDuration: `${ms}ms`,
              transitionTimingFunction: `var(${ease})`,
            }}
          />
        </div>
        <Button onClick={() => setOn((o) => !o)} variant="outlined">
          Play · {ms}ms · {ease.replace('--ease-', '')}
        </Button>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'motion',
    title: 'Motion',
    group: 'Foundations',
    tagline:
      'Seven durations, five curves. Motion exists to explain what changed and where it went — never to prove that the team can animate.',
    keywords: ['transition', 'easing', 'duration', 'curve', 'timing', 'animation', 'reduced motion'],
  },

  overview: {
    purpose:
      'Motion is the connective tissue between two states. When something appears, moves, or disappears, animation tells the user where it came from and where it went, so the change is understood instead of merely noticed. Done well, nobody sees it. Done badly, it is the first thing everyone complains about.',
    whenToUse: [
      'To show causality: this panel opened because you pressed that button, and it grew out of it.',
      'To preserve object continuity when an element changes position or size.',
      'To acknowledge input within 100ms, so the interface never feels unresponsive.',
      'To direct attention to a change the user did not initiate — a new row, a status flip.',
    ],
    whenNotToUse: [
      {
        text: 'On a state change the user cannot perceive as movement, like a colour swap under the cursor.',
        instead: 'a 75ms transition, or none at all',
      },
      {
        text: 'On page load, to reveal content the user is already waiting for.',
        instead: 'rendering it immediately',
      },
      {
        text: 'On anything that repeats more than a few times per session.',
        instead: 'an instant change — repeated animation becomes a tax',
      },
      {
        text: 'To fill a loading gap with decoration.',
        instead: 'a skeleton that matches the incoming layout',
      },
    ],
    reasoning: (
      <>
        <p>
          The numbers are perceptual, not arbitrary. Under about <strong>100ms</strong> a change is
          read as instantaneous — the user perceives cause and effect as a single event. Between 100
          and 300ms it reads as motion, which is the band where animation does its explanatory work.
          Past <strong>400ms</strong> the interface starts to feel like it is deciding whether to
          obey, and past 700ms people begin clicking again.
        </p>
        <p>
          Duration also has to scale with distance. A tooltip travelling 6px and a drawer travelling
          420px cannot share a duration: at 220ms the tooltip crawls and the drawer snaps. The rule
          of thumb is roughly <strong>1ms per 2px of travel</strong>, clamped to the token scale.
        </p>
        <p>
          Every curve in the system is asymmetric — fast out of the gate, slow into the destination.
          That is how physical objects behave, and it also front-loads the information: the user
          sees the direction of travel immediately and the settle is just polish. A linear curve is
          reserved for genuinely mechanical things like spinners and progress bars, where constant
          speed is the honest representation.
        </p>
      </>
    ),
  },

  preview: {
    render: <DurationLab />,
    examples: [
      {
        id: 'easings',
        title: 'The five curves',
        description: 'Click any card to replay. The graph is the curve; the track underneath is what it feels like.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {EASINGS.map((e) => (
                <EasingCard key={e.token} {...e} />
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'durations',
        title: 'The duration scale',
        description: 'Pick by what is moving and how far, not by what feels nice in isolation.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full">
              {DURATIONS.map((d) => (
                <div key={d.token} className="flex items-center gap-4">
                  <code className="w-52 shrink-0 font-mono text-[11.5px] text-[var(--ds-accent-text)]">
                    {d.token}
                  </code>
                  <span className="w-14 shrink-0 font-mono text-[11px] tabular-nums text-[var(--ds-fg-muted)]">
                    {d.ms}ms
                  </span>
                  <span
                    className="h-1.5 shrink-0 rounded-full bg-[var(--ds-accent)]"
                    style={{ width: d.ms / 4 }}
                    aria-hidden
                  />
                  <span className="text-caption text-[var(--ds-fg-muted)]">{d.use}</span>
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'distance',
        title: 'Duration scales with distance',
        description:
          'Both boxes use the same easing. The short one takes 160ms and the long one 320ms, and they arrive feeling like the same speed.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="6px travel · 160ms" tone="good">
                <div className="group h-12 w-full rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] p-1">
                  <span className="block h-10 w-10 rounded-[var(--radius-sm)] bg-[var(--ds-accent)] transition-transform duration-[160ms] ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-1.5" />
                </div>
              </Cell>
              <Cell label="200px travel · 320ms" tone="good">
                <div className="group h-12 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] p-1">
                  <span className="block h-10 w-10 rounded-[var(--radius-sm)] bg-[var(--ds-accent)] transition-transform duration-[320ms] ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-[200px]" />
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Hover', note: '120ms standard', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-surface-raised)] transition-colors duration-[120ms] hover:bg-[var(--ds-accent)]" /> },
      { label: 'Press', note: '120ms, scale 0.985', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-accent)] transition-transform active:scale-[0.985]" /> },
      { label: 'Enter', note: '180ms scale-in', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both]" /> },
      { label: 'Slide up', note: '220ms emphasized', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] animate-[slide-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]" /> },
      { label: 'Spin', note: '720ms linear', render: <span className="block h-8 w-8 rounded-full border-2 border-[var(--ds-accent)] border-t-transparent animate-[spin_720ms_linear_infinite]" /> },
      { label: 'Shimmer', note: '1.6s linear loop', render: <span className="block h-6 w-16 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)] after:block after:h-full after:w-full after:animate-[shimmer_1.6s_linear_infinite] after:bg-[linear-gradient(90deg,transparent,var(--ds-layer-hover),transparent)] after:bg-[length:200%_100%]" /> },
      { label: 'Indeterminate', note: '1.4s standard', render: <span className="block h-1.5 w-16 overflow-hidden rounded-full bg-[var(--ds-layer-active)]"><span className="block h-full w-full origin-left rounded-full bg-[var(--ds-accent)] animate-[indeterminate_1.4s_cubic-bezier(0.2,0,0,1)_infinite]" /></span> },
      { label: 'Reduced', note: 'Collapses to ~1ms', render: <span className="text-caption text-[var(--ds-fg-muted)]">respects OS setting</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <svg viewBox="0 0 320 140" className="w-full">
          <line x1="24" y1="116" x2="300" y2="116" stroke="var(--ds-border)" />
          <line x1="24" y1="20" x2="24" y2="116" stroke="var(--ds-border)" />
          <path
            d="M 24 116 C 79 116, 79 24, 300 24"
            fill="none"
            stroke="var(--ds-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="79" cy="116" r="3.5" fill="var(--p-warning-400)" />
          <circle cx="79" cy="24" r="3.5" fill="var(--p-warning-400)" />
          <line x1="24" y1="116" x2="79" y2="116" stroke="var(--p-warning-400)" strokeDasharray="3 3" />
          <line x1="79" y1="24" x2="300" y2="24" stroke="var(--p-warning-400)" strokeDasharray="3 3" />
          <text x="24" y="132" fill="var(--ds-fg-muted)" fontSize="9" fontFamily="monospace">0ms</text>
          <text x="272" y="132" fill="var(--ds-fg-muted)" fontSize="9" fontFamily="monospace">220ms</text>
          <text x="4" y="120" fill="var(--ds-fg-muted)" fontSize="9" fontFamily="monospace">0</text>
          <text x="4" y="28" fill="var(--ds-fg-muted)" fontSize="9" fontFamily="monospace">1</text>
        </svg>
      </div>
    ),
    caption:
      'cubic-bezier(0.2, 0, 0, 1) — our standard curve. Both control points are pulled hard toward the end, which is what produces the fast departure and long settle.',
    parts: [
      {
        n: 1,
        label: 'Duration',
        value: '220ms',
        kind: 'motion',
        note: 'The total time. Chosen from the distance travelled, not from taste. 1ms per 2px of movement is the working heuristic.',
      },
      {
        n: 2,
        label: 'First control point',
        value: '0.2, 0',
        kind: 'motion',
        note: 'Low y value means the animation leaves the start position immediately. This is what makes an interface feel responsive rather than laggy.',
      },
      {
        n: 3,
        label: 'Second control point',
        value: '0, 1',
        kind: 'motion',
        note: 'Pulled to the top-left, so the last 20% of the distance takes 40% of the time. The settle is what reads as "physical".',
      },
      {
        n: 4,
        label: 'Animated property',
        value: 'transform / opacity',
        kind: 'motion',
        note: 'Only these two are composited. Animating width, height, top or margin runs layout on every frame and drops below 60fps on a mid-range phone.',
      },
      {
        n: 5,
        label: 'Reduced-motion fallback',
        value: '~1ms, not 0',
        kind: 'motion',
        note: 'Collapsed rather than removed, so transitionend still fires. Setting it to 0 breaks any state machine that waits for the event.',
      },
    ],
  },

  tokens: [
    { category: 'motion', token: '--duration-instant', value: '75ms', usedFor: 'Colour change under an already-hovering pointer' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover, press, focus feedback' },
    { category: 'motion', token: '--duration-quick', value: '160ms', usedFor: 'Tooltips, small fades, chevron rotation' },
    { category: 'motion', token: '--duration-normal', value: '220ms', usedFor: 'Popovers, dropdowns, accordions' },
    { category: 'motion', token: '--duration-slow', value: '320ms', usedFor: 'Dialogs, drawers, long travel' },
    { category: 'motion', token: '--duration-slower', value: '480ms', usedFor: 'Full-screen transitions' },
    { category: 'motion', token: '--ease-standard', value: 'cubic-bezier(0.2, 0, 0, 1)', usedFor: 'The default for everything' },
    { category: 'motion', token: '--ease-emphasized', value: 'cubic-bezier(0.32, 0.72, 0, 1)', usedFor: 'Surfaces entering or leaving' },
    { category: 'motion', token: '--ease-decelerate', value: 'cubic-bezier(0.05, 0.7, 0.1, 1)', usedFor: 'Entering the viewport' },
    { category: 'motion', token: '--ease-accelerate', value: 'cubic-bezier(0.3, 0, 0.8, 0.15)', usedFor: 'Leaving the viewport' },
    { category: 'motion', token: '--ease-spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', usedFor: 'Overshoot on toggles and success states' },
  ],

  sizes: [
    { name: 'Micro', height: '75–120ms', use: 'State change on an element already under the pointer. Colour, opacity, border.' },
    { name: 'Small', height: '160ms', use: 'Travel under ~20px, or a fade with no movement. Tooltips, icon rotation.' },
    { name: 'Medium', height: '220ms', use: 'Travel of 20–150px. Popovers, dropdowns, accordion panels.' },
    { name: 'Large', height: '320ms', use: 'Travel of 150–400px. Dialogs, drawers, bottom sheets.' },
    { name: 'Extra large', height: '480ms', use: 'Full-viewport travel. Page transitions, fullscreen dialogs.' },
    { name: 'Looping', height: '720ms – 1.6s', use: 'Spinners at 720ms, shimmer at 1.6s, indeterminate bars at 1.4s.' },
  ],

  do: [
    {
      title: 'Animate only transform and opacity',
      why: 'Both are handled by the compositor and never trigger layout or paint. Everything else runs on the main thread and competes with your JavaScript for frame budget.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">transform: translateY(8px)</span>
          <span className="text-[var(--ds-success-text)]">opacity: 0 → 1</span>
          <span className="text-[var(--ds-danger-text)]">height: 0 → auto</span>
          <span className="text-[var(--ds-danger-text)]">margin-top: −8px → 0</span>
        </Stack>
      ),
    },
    {
      title: 'Match the exit animation to the entrance',
      why: 'A panel that grows out of a button should shrink back into it. Reversing the same transform is what makes the surface feel like one persistent object rather than two unrelated events.',
      render: (
        <Row gap="sm" className="text-caption text-[var(--ds-fg-muted)]">
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-success-subtle)] px-2 py-1 text-[var(--ds-success-text)]">
            in: scale 0.96 → 1
          </span>
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-success-subtle)] px-2 py-1 text-[var(--ds-success-text)]">
            out: 1 → 0.96
          </span>
        </Row>
      ),
    },
    {
      title: 'Respect prefers-reduced-motion',
      why: 'Vestibular disorders make large movement genuinely nauseating. Collapse durations to ~1ms rather than removing transitions, so any code awaiting transitionend still works.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          @media (prefers-reduced-motion: reduce) {'{'}
          <br />
          &nbsp;&nbsp;* {'{'} transition-duration: 0.01ms !important; {'}'}
          <br />
          {'}'}
        </code>
      ),
    },
    {
      title: 'Set the transform-origin to the trigger',
      why: 'A menu that scales from its top-left corner appears to grow out of the button that opened it. The same animation from centre reads as a surface that materialised out of nowhere.',
      render: (
        <div className="flex flex-col items-start gap-1">
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-accent)] px-2 py-1 text-caption text-[var(--ds-accent-fg)]">
            Trigger
          </span>
          <span className="origin-top-left animate-[scale-in_400ms_cubic-bezier(0.32,0.72,0,1)_infinite_alternate] rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-2 text-caption shadow-e3">
            Menu
          </span>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not animate anything over 400ms that the user initiated',
      why: 'The user pressed a button and is waiting. Past ~400ms the animation stops being an explanation and becomes a delay, and people start pressing again.',
      render: (
        <div className="group h-10 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] p-1">
          <span className="block h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--ds-danger)] transition-transform duration-[1200ms] group-hover:translate-x-[180px]" />
        </div>
      ),
    },
    {
      title: 'Do not animate layout properties',
      why: 'height, width, top, left, margin and padding all force a layout recalculation of the subtree on every frame. On a mid-range phone this is the difference between 60fps and 22fps.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          transition: height 300ms, margin-top 300ms;
        </code>
      ),
    },
    {
      title: 'Do not use spring overshoot as a default',
      why: 'An overshoot is a small surprise. One per flow is delightful; on every hover it reads as an interface that cannot sit still, and it makes precise pointing harder.',
      render: (
        <Row gap="sm">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-9 w-9 rounded-[var(--radius-md)] bg-[var(--ds-danger-subtle)]"
              style={{ animation: `scale-in 700ms cubic-bezier(0.34,1.56,0.64,1) ${i * 120}ms infinite alternate` }}
            />
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not animate content that is already late',
      why: 'Data arrives after a 900ms request and then fades in over 300ms. The user has now waited 1.2 seconds. Late content should appear instantly — the wait was the animation.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          request 900ms + fade 300ms = 1200ms of nothing
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.3.3', name: 'Animation from Interactions', level: 'AAA' },
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
      { id: '2.3.1', name: 'Three Flashes or Below', level: 'A' },
    ],
    contrast: [
      'Motion must not be the only way a state change is communicated. If a row slides in to indicate "new", it also needs a label or a colour.',
      'Never flash anything more than three times per second. Beyond that it is a documented seizure trigger.',
    ],
    keyboard: [
      { keys: 'Esc', does: 'Must interrupt an in-progress enter animation and dismiss immediately — never wait for the animation to finish.' },
      { keys: 'Tab', does: 'Focus must land on the destination even if the animation is still running; do not gate focus on animationend.' },
    ],
    aria: [
      {
        attr: 'prefers-reduced-motion: reduce',
        on: 'Global media query',
        note: 'Set by the OS. Roughly 5–10% of users have it on. Collapse durations, remove parallax and auto-play, keep opacity fades — they do not trigger vestibular symptoms.',
      },
      {
        attr: 'aria-live',
        on: 'Animated status changes',
        note: 'A screen-reader user gets none of the animation. Any meaning it carries must also be announced.',
      },
      {
        attr: 'animation-play-state',
        on: 'Looping decoration',
        note: 'Anything that loops for more than five seconds needs a mechanism to pause it — WCAG 2.2.2.',
      },
    ],
    focus:
      'Focus must never be trapped by an animation. If a dialog animates in over 320ms, focus moves at 0ms — the user should be able to type before the animation finishes.',
    screenReader: [
      'Screen readers announce DOM changes immediately, ignoring animation. Content that fades in over 300ms is announced at 0ms, so make sure the DOM state is correct from the start.',
      'Do not delay adding content to the DOM in order to sequence an animation; use CSS animation-delay instead.',
    ],
    touch:
      'Touch interactions need faster feedback than pointer ones — there is no hover state to pre-signal the press. Keep touch feedback at or under 100ms.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Transitions: name the properties explicitly, never "all"
<button className="transition-[background-color,box-shadow,transform] duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)]" />

// Enter animations come from the keyframe tokens
<div className="animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both] origin-top-left" />

// Duration derived from distance
function durationFor(px: number) {
  return Math.round(Math.min(480, Math.max(120, px / 2)))
}

// Reading the user's preference in JS, for canvas or WebGL
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The View Transitions API for cross-view continuity
if (document.startViewTransition) {
  document.startViewTransition(() => setRoute(next))
} else {
  setRoute(next)
}`,
    },
    css: {
      lang: 'css',
      code: `:root {
  --duration-instant: 75ms;
  --duration-fast: 120ms;
  --duration-quick: 160ms;
  --duration-normal: 220ms;
  --duration-slow: 320ms;

  --ease-standard:   cubic-bezier(0.2, 0, 0, 1);
  --ease-emphasized: cubic-bezier(0.32, 0.72, 0, 1);
  --ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --ease-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Name the properties. "all" makes the browser watch everything. */
.control {
  transition:
    background-color var(--duration-fast) var(--ease-standard),
    box-shadow       var(--duration-fast) var(--ease-standard),
    transform        var(--duration-fast) var(--ease-standard);
}

/* Enter and exit are mirror images */
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes scale-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.96); }
}

/* Collapse, do not remove — transitionend must still fire */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
    },
  },

  notes: {
    tips: [
      'If you cannot articulate what an animation explains, delete it. "It looks nice" is not a reason that survives the fiftieth viewing.',
      'Test every animation at 4× CPU throttling in DevTools. Anything that stutters there stutters on a real mid-range Android.',
      'Stagger list items by 20–30ms, not 100ms. Ten items at 100ms is a full second before the last one lands.',
      'For accordions, animate grid-template-rows from 0fr to 1fr instead of height auto. It is a single property, it is animatable, and it needs no JavaScript measurement.',
    ],
    performance: [
      'Composited properties are transform, opacity and filter. Everything else touches layout or paint on the main thread.',
      'will-change promotes an element to its own GPU layer. Add it just before the animation and remove it after — leaving it on permanently consumes GPU memory for no benefit.',
      'The Web Animations API runs off the main thread for transform and opacity, which makes it a better choice than requestAnimationFrame loops for anything continuous.',
      'One 300ms animation on a 1200px-wide element costs less than fifty 300ms animations on 24px elements. Batch where you can.',
    ],
    mistakes: [
      'Using transition: all. The browser watches every animatable property, and an unrelated class change causes an unexpected animation.',
      'Forgetting a transform-origin, so a scale-in appears to come from the centre of the screen instead of from its trigger.',
      'Animating an element into view while its content is still loading. The user watches an empty box slide in and then fill.',
      'Setting reduced-motion durations to 0 instead of 0.01ms. transitionend never fires and any state machine waiting on it hangs forever.',
    ],
    realWorld: [
      'Instrument your slowest animation with the Long Animation Frames API in production. Local performance on a dev machine tells you almost nothing.',
      'When a stakeholder asks for "more animation", the productive response is usually better loading states — that is the moment where motion genuinely helps.',
      'Match your platform. Native iOS uses a spring; Material uses emphasized-decelerate. A web app that borrows the wrong one feels subtly foreign on that device.',
      'Keep a single page that renders every animation in the system side by side. It is the fastest way to spot the one that drifted to 500ms during a rush.',
    ],
  },
})
