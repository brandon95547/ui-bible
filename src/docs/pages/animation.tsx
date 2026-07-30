import * as React from 'react'
import { Bell, Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Cell, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---- named patterns ------------------------------------------------------ */

const PATTERNS = [
  {
    id: 'fade',
    name: 'Fade',
    spec: 'opacity 160ms standard',
    when: 'Content replacing content in the same position. The cheapest transition and the safest under reduced motion.',
  },
  {
    id: 'scale-in',
    name: 'Scale in',
    spec: 'opacity + scale 0.96→1, 180ms emphasized',
    when: 'Anchored surfaces: popovers, menus, tooltips. Set transform-origin to the trigger corner.',
  },
  {
    id: 'slide-up',
    name: 'Slide up',
    spec: 'translateY 8px→0 + fade, 220ms emphasized',
    when: 'Toasts and content arriving from below. The 8px is enough to read as direction without being a journey.',
  },
  {
    id: 'sheet',
    name: 'Edge slide',
    spec: 'translate 100%→0, 260–320ms emphasized',
    when: 'Drawers and bottom sheets. Always from the edge they are anchored to.',
  },
  {
    id: 'collapse',
    name: 'Collapse',
    spec: 'grid-template-rows 0fr→1fr, 220ms standard',
    when: 'Accordions and expanding rows. Animates to auto height with no JavaScript measurement.',
  },
  {
    id: 'attention',
    name: 'Attention',
    spec: 'scale 1→1.04→1, 320ms spring',
    when: 'A value the user did not change just changed. Once, never looping.',
  },
]

function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

function PatternLab() {
  const [key, setKey] = React.useState(0)
  const [open, setOpen] = React.useState(true)
  const [count, setCount] = React.useState(3)

  return (
    <PreviewStage
      label="Patterns"
      center={false}
      minHeight={0}
      controls={
        <Button size="xs" variant="outlined" onClick={() => setKey((k) => k + 1)}>
          Replay all
        </Button>
      }
    >
      <div key={key} className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="Fade" sub="160ms standard">
          <div className="grid h-16 w-full place-items-center rounded-[var(--radius-md)] bg-[var(--ds-surface)] animate-[fade-in_160ms_cubic-bezier(0.2,0,0,1)_both]">
            <span className="text-caption text-[var(--ds-fg-secondary)]">content</span>
          </div>
        </Cell>

        <Cell label="Scale in" sub="180ms emphasized, origin top-left">
          <div className="flex h-16 w-full flex-col items-start justify-center gap-1">
            <span className="rounded-[4px] bg-[var(--ds-accent)] px-1.5 py-0.5 text-[10px] text-[var(--ds-accent-fg)]">
              trigger
            </span>
            <span className="origin-top-left rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-1.5 text-caption shadow-e3 animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both]">
              popover
            </span>
          </div>
        </Cell>

        <Cell label="Slide up" sub="220ms emphasized">
          <div className="grid h-16 w-full place-items-center">
            <span className="rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-2 text-caption shadow-e4 animate-[slide-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]">
              Saved
            </span>
          </div>
        </Cell>

        <Cell label="Edge slide" sub="260ms emphasized">
          <div className="relative h-16 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)]">
            <span className="absolute inset-y-0 right-0 w-24 border-l border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4 animate-[drawer-in-right_260ms_cubic-bezier(0.32,0.72,0,1)_both]" />
          </div>
        </Cell>

        <Cell label="Collapse" sub="grid-template-rows 0fr → 1fr">
          <div className="w-full">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-1 py-1 text-caption text-[var(--ds-fg-secondary)]"
            >
              <ChevronDown
                size={13}
                className={cn('transition-transform duration-[220ms]', !open && '-rotate-90')}
              />
              Details
            </button>
            <Collapse open={open}>
              <p className="px-1 pb-1 pt-1.5 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                No height measurement, no JavaScript, animates to auto.
              </p>
            </Collapse>
          </div>
        </Cell>

        <Cell label="Attention" sub="One pulse, never looping">
          <div className="flex h-16 w-full items-center justify-center gap-3">
            <span
              key={count}
              className="inline-flex animate-[attention_320ms_cubic-bezier(0.34,1.56,0.64,1)_both]"
            >
              <Badge tone="danger" variant="solid">
                {count}
              </Badge>
            </span>
            <Button size="xs" variant="text" onClick={() => setCount((c) => c + 1)}>
              increment
            </Button>
          </div>
        </Cell>
      </div>
    </PreviewStage>
  )
}

function StaggerDemo() {
  const [key, setKey] = React.useState(0)
  return (
    <PreviewStage
      center={false}
      minHeight={0}
      controls={
        <Button size="xs" variant="outlined" onClick={() => setKey((k) => k + 1)}>
          Replay
        </Button>
      }
    >
      <div key={key} className="grid w-full gap-4 sm:grid-cols-2">
        <Cell label="25ms stagger" sub="Reads as one group arriving" tone="good">
          <Stack gap="xs" className="w-full">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-6 rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)]"
                style={{ animation: `slide-up 220ms cubic-bezier(0.32,0.72,0,1) ${i * 25}ms both` }}
              />
            ))}
          </Stack>
        </Cell>
        <Cell label="140ms stagger" sub="700ms before the last row lands" tone="bad">
          <Stack gap="xs" className="w-full">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-6 rounded-[var(--radius-sm)] bg-[var(--ds-danger-subtle)]"
                style={{ animation: `slide-up 220ms cubic-bezier(0.32,0.72,0,1) ${i * 140}ms both` }}
              />
            ))}
          </Stack>
        </Cell>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'animation',
    title: 'Animation',
    group: 'Foundations',
    tagline:
      'Six named patterns built from the motion tokens. If an animation in the product is not one of these, it needs a reason.',
    keywords: ['keyframes', 'micro-interaction', 'choreography', 'stagger', 'enter', 'exit', 'collapse'],
  },

  overview: {
    purpose:
      'Motion defines the vocabulary — durations and curves. Animation defines the sentences: the small set of named patterns that everything in the product is built from. A closed set means an animation is recognisable across screens, and a new engineer does not have to invent one.',
    whenToUse: [
      'When an element enters or leaves the screen and the user needs to know where from and where to.',
      'When something expands or collapses and the surrounding layout has to reflow.',
      'When a value the user did not touch has changed and should be noticed once.',
      'When several items arrive together and a small stagger makes them read as one group.',
    ],
    whenNotToUse: [
      {
        text: 'To decorate a static page on first load.',
        instead: 'rendering it immediately',
      },
      {
        text: 'To draw ongoing attention to something the user has already seen.',
        instead: 'a badge or a colour change',
      },
      {
        text: 'On a list that re-renders on every keystroke.',
        instead: 'no animation — it turns filtering into a strobe',
      },
      {
        text: 'To indicate loading, when the layout of the result is already known.',
        instead: 'a Skeleton',
        to: '#/skeletons',
      },
    ],
    reasoning: (
      <>
        <p>
          The single most useful idea here is <strong>object continuity</strong>. If a surface grows
          out of the button that opened it, the user understands it as the same object in a new
          state. If it fades in at the centre of the screen, they understand it as a new, unrelated
          thing that has interrupted them. Same content, entirely different mental model — and it
          costs one line of <code>transform-origin</code>.
        </p>
        <p>
          Exit animations matter more than entrances and are almost always the ones that get
          skipped. When something disappears instantly the user is left asking whether it was
          dismissed or whether the app crashed. An exit is usually the entrance in reverse, at
          around 75% of the duration — leaving should feel slightly more decisive than arriving.
        </p>
        <p>
          Stagger is a lever with a very narrow useful range. Around <strong>20–30ms</strong> per
          item, the group reads as a single arriving unit with a bit of life. Past 60ms it stops
          being one event and becomes a queue, and a ten-item list takes longer to appear than the
          data took to fetch.
        </p>
      </>
    ),
  },

  preview: {
    render: <PatternLab />,
    examples: [
      {
        id: 'stagger',
        title: 'Stagger',
        description:
          'Same animation, same duration, two different delays per item. The left reads as one thing; the right reads as waiting.',
        render: <StaggerDemo />,
      },
      {
        id: 'micro',
        title: 'Micro-interactions',
        description:
          'The smallest useful animations. Each one confirms an action at the exact place the user is already looking.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="center">
              <Stack gap="xs" className="items-center">
                <IconButton label="Notifications" icon={<Bell />} variant="outlined" className="hover:[&_svg]:animate-[wiggle_400ms_ease-in-out]" />
                <span className="text-[10px] text-[var(--ds-fg-muted)]">hover</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <CopyDemo />
                <span className="text-[10px] text-[var(--ds-fg-muted)]">icon swap</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <IconButton
                  label="Add"
                  icon={<Plus />}
                  variant="tonal"
                  className="[&_svg]:transition-transform [&_svg]:duration-[220ms] hover:[&_svg]:rotate-90"
                />
                <span className="text-[10px] text-[var(--ds-fg-muted)]">rotate</span>
              </Stack>
              <Stack gap="xs" className="items-center">
                <IconButton
                  label="Delete"
                  icon={<Trash2 />}
                  variant="danger-outline"
                  className="transition-transform hover:-translate-y-0.5"
                />
                <span className="text-[10px] text-[var(--ds-fg-muted)]">lift</span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Enter', note: 'scale-in 180ms', render: <span className="block h-9 w-14 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] animate-[scale-in_180ms_cubic-bezier(0.32,0.72,0,1)_both]" /> },
      { label: 'Exit', note: 'Reverse at 75%', render: <span className="block h-9 w-14 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] opacity-40" /> },
      { label: 'Fade', note: '160ms', render: <span className="block h-9 w-14 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] animate-[fade-in_160ms_ease-out_both]" /> },
      { label: 'Slide up', note: '220ms, 8px', render: <span className="block h-9 w-14 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] animate-[slide-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]" /> },
      { label: 'Spin', note: '720ms linear loop', render: <span className="block h-8 w-8 rounded-full border-2 border-[var(--ds-accent)] border-t-transparent animate-[spin_720ms_linear_infinite]" /> },
      { label: 'Pulse ring', note: '1.8s, live status', render: <span className="block h-3 w-3 rounded-full bg-[var(--ds-success)] animate-[pulse-ring_1.8s_cubic-bezier(0.2,0,0,1)_infinite]" /> },
      { label: 'Shimmer', note: '1.6s, skeleton', render: <span className="relative block h-6 w-14 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)] after:absolute after:inset-0 after:animate-[shimmer_1.6s_linear_infinite] after:bg-[linear-gradient(90deg,transparent,var(--ds-layer-hover),transparent)] after:bg-[length:200%_100%]" /> },
      { label: 'Reduced', note: 'Fades only', render: <span className="text-caption text-[var(--ds-fg-muted)]">no translate</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="flex w-full max-w-lg flex-col gap-3">
        {PATTERNS.map((p, i) => (
          <div
            key={p.id}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--ds-accent-subtle)] text-[10px] font-bold text-[var(--ds-accent-text)]">
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-label text-[var(--ds-fg)]">{p.name}</span>
                <code className="font-mono text-[10px] text-[var(--ds-accent-text)]">{p.spec}</code>
              </div>
              <p className="mt-0.5 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                {p.when}
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
    caption: 'The complete vocabulary. Anything not on this list needs a written justification.',
    parts: PATTERNS.map((p, i) => ({
      n: i + 1,
      label: p.name,
      value: p.spec,
      kind: 'motion' as const,
      note: p.when,
    })),
  },

  tokens: [
    { category: 'motion', token: 'fade-in', value: 'opacity 0 → 1', usedFor: 'Content swap in place' },
    { category: 'motion', token: 'scale-in', value: 'scale 0.96 → 1 + fade', usedFor: 'Anchored popovers and menus' },
    { category: 'motion', token: 'slide-up', value: 'translateY 8px → 0 + fade', usedFor: 'Toasts and arriving content' },
    { category: 'motion', token: 'drawer-in-right / -left', value: 'translateX ±100% → 0', usedFor: 'Drawers' },
    { category: 'motion', token: 'sheet-in', value: 'translateY 100% → 0', usedFor: 'Bottom sheets' },
    { category: 'motion', token: 'shimmer', value: 'background-position sweep', usedFor: 'Skeletons' },
    { category: 'motion', token: 'indeterminate', value: 'translateX + scaleX', usedFor: 'Unknown-length progress' },
    { category: 'motion', token: 'pulse-ring', value: 'expanding box-shadow', usedFor: 'Live status dots' },
    { category: 'motion', token: '--ease-emphasized', usedFor: 'Every enter and exit' },
    { category: 'motion', token: '--ease-standard', usedFor: 'Collapse, fade, property transitions' },
  ],

  sizes: [
    { name: 'Fade', height: '160ms', use: 'Content replacing content. No movement, so it is always reduced-motion safe.' },
    { name: 'Scale in', height: '180ms', use: 'Popovers, menus, tooltips. Origin must match the trigger.' },
    { name: 'Slide up', height: '220ms', gap: '8px travel', use: 'Toasts, inline additions, arriving rows.' },
    { name: 'Edge slide', height: '260–320ms', gap: '100% travel', use: 'Drawers and sheets.' },
    { name: 'Collapse', height: '220ms', use: 'Accordions, expanding table rows, disclosure panels.' },
    { name: 'Attention', height: '320ms', use: 'One pulse on an externally-changed value. Never loops.' },
    { name: 'Stagger delay', height: '20–30ms', use: 'Per item, capped at about eight items.' },
  ],

  do: [
    {
      title: 'Animate collapse with grid-template-rows',
      why: 'From 0fr to 1fr animates to intrinsic height with no measurement, no JavaScript, and no jump at the end. It replaced every max-height hack overnight.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          display: grid;
          <br />
          grid-template-rows: 0fr → 1fr;
          <br />
          {'>'} div {'{'} overflow: hidden {'}'}
        </code>
      ),
    },
    {
      title: 'Mirror the exit, slightly faster',
      why: 'Entering is an introduction and can afford to settle. Leaving should feel decisive — about 75% of the enter duration is the ratio that reads as intentional.',
      render: (
        <Row gap="sm" className="text-caption">
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-success-subtle)] px-2 py-1 text-[var(--ds-success-text)]">in 220ms</span>
          <span className="rounded-[var(--radius-sm)] bg-[var(--ds-success-subtle)] px-2 py-1 text-[var(--ds-success-text)]">out 160ms</span>
        </Row>
      ),
    },
    {
      title: 'Cap the stagger at about eight items',
      why: 'Beyond eight the tail is arriving long after the user has started reading the head. Animate the first eight and let the rest appear instantly.',
      render: (
        <Stack gap="xs" className="w-full">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-4 rounded-[3px] bg-[var(--ds-accent-subtle)]"
              style={{ animation: `slide-up 220ms cubic-bezier(0.32,0.72,0,1) ${i * 25}ms both` }}
            />
          ))}
        </Stack>
      ),
    },
    {
      title: 'Keep fades under reduced motion',
      why: 'Opacity does not trigger vestibular symptoms. Removing all animation makes the interface feel broken; removing translation and scale is what the setting is actually asking for.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          @media (prefers-reduced-motion: reduce) {'{'}
          <br />
          &nbsp;&nbsp;.slide-up {'{'} animation-name: fade-in {'}'}
          <br />
          {'}'}
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not loop an attention animation',
      why: 'A pulse that never stops is impossible to ignore and impossible to dismiss. It stops being information and becomes an irritant within about four seconds.',
      render: (
        <Badge tone="danger" variant="solid" className="animate-[attention_600ms_ease-in-out_infinite]">
          9
        </Badge>
      ),
    },
    {
      title: 'Do not animate list re-renders during filtering',
      why: 'Every keystroke restarts every item animation. The list strobes, and the user cannot read the results they are actively narrowing down.',
      render: (
        <Stack gap="xs" className="w-full">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-4 rounded-[3px] bg-[var(--ds-danger-subtle)]"
              style={{ animation: `slide-up 300ms ease-out ${i * 90}ms infinite` }}
            />
          ))}
        </Stack>
      ),
    },
    {
      title: 'Do not scale from the centre for anchored surfaces',
      why: 'A menu that grows from its own centre appears out of nowhere. The user loses the link back to the control they just pressed.',
      render: (
        <div className="flex flex-col items-start gap-1">
          <span className="rounded-[4px] bg-[var(--ds-danger)] px-1.5 py-0.5 text-[10px] text-white">trigger</span>
          <span className="origin-center animate-[scale-in_500ms_ease-out_infinite_alternate] rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] px-3 py-1.5 text-caption shadow-e3">
            menu
          </span>
        </div>
      ),
    },
    {
      title: 'Do not animate an element into a loading state',
      why: 'The skeleton slides in, then the data arrives and fades in on top. The user watches two animations to see one piece of content.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          skeleton 220ms → data 200ms → total 420ms of theatre
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
      { id: '2.3.1', name: 'Three Flashes or Below', level: 'A' },
      { id: '2.3.3', name: 'Animation from Interactions', level: 'AAA' },
    ],
    contrast: [
      'A shimmer must not exceed a 3:1 luminance swing, or it reads as a flash for photosensitive users.',
      'Never animate a colour through a state that fails contrast, even briefly — text is readable at both ends and unreadable in the middle.',
    ],
    keyboard: [
      { keys: 'Esc', does: 'Cancels an in-progress enter animation and dismisses immediately.' },
      { keys: 'Tab', does: 'Focus lands on the destination at 0ms, regardless of how long the animation takes.' },
    ],
    aria: [
      { attr: 'prefers-reduced-motion', on: 'Every pattern', note: 'Translate and scale become a fade. Loops stop. Parallax and auto-advancing carousels are disabled entirely.' },
      { attr: 'aria-live="polite"', on: 'Animated arrivals', note: 'A row that slides in must also be announced; screen-reader users get none of the motion.' },
      { attr: 'animation-play-state', on: 'Loops over 5s', note: 'WCAG 2.2.2 requires a pause mechanism for anything that moves for more than five seconds.' },
    ],
    focus:
      'Never delay focus for an animation. The dialog is focusable the moment it is in the DOM; the animation is decoration running alongside.',
    screenReader: [
      'Animation is invisible to assistive tech. If the animation is the only signal that something arrived, nothing arrived.',
      'Do not stagger DOM insertion to create a stagger effect — use animation-delay, so all content is announced at once.',
    ],
    touch:
      'Touch has no hover, so press feedback must be immediate. Keep any touch-triggered animation at or under 100ms before the visual state changes.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Collapse to auto height, no JavaScript measurement
function Collapse({ open, children }) {
  return (
    <div
      className="grid transition-[grid-template-rows] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]"
      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  )
}

// Stagger, capped so the tail never lags
{items.map((item, i) => (
  <li
    key={item.id}
    style={{ animationDelay: Math.min(i, 8) * 25 + 'ms' }}
    className="animate-[slide-up_220ms_cubic-bezier(0.32,0.72,0,1)_both]"
  >
    {item.label}
  </li>
))}

// Exit animations need the element to stay mounted until they finish
const [leaving, setLeaving] = useState(false)
function close() {
  setLeaving(true)
  setTimeout(onClose, 160)   // matches the exit duration
}

// Anchored surfaces grow out of their trigger
<Popover className="origin-top-left animate-[scale-in_180ms_var(--ease-emphasized)_both]" />`,
    },
    css: {
      lang: 'css',
      code: `@keyframes fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96) }
  to   { opacity: 1; transform: scale(1) }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px) }
  to   { opacity: 1; transform: translateY(0) }
}
@keyframes attention {
  0%   { transform: scale(1) }
  45%  { transform: scale(1.06) }
  100% { transform: scale(1) }
}

/* Exit is the entrance reversed, at ~75% duration */
.leaving {
  animation: scale-in 140ms var(--ease-accelerate) reverse forwards;
}

/* Reduced motion: keep the fade, drop the movement */
@media (prefers-reduced-motion: reduce) {
  .slide-up, .scale-in, .sheet-in {
    animation-name: fade-in !important;
  }
  .shimmer, .pulse-ring { animation: none !important; }
}`,
    },
  },

  notes: {
    tips: [
      'Prototype animations at half speed. Anything that looks wrong at 0.5× is wrong at 1× too — you simply cannot see it yet.',
      'The View Transitions API handles cross-page continuity with far less code than a hand-rolled FLIP implementation. Feature-detect it and fall back to an instant swap.',
      'For exit animations, keep the node mounted for exactly the exit duration. A mismatch of even 40ms produces a visible flicker.',
      'Reuse animation names across components. Six names that everyone recognises beat sixty bespoke keyframes nobody can audit.',
    ],
    performance: [
      'CSS animations on transform and opacity run on the compositor and survive a busy main thread. A requestAnimationFrame loop does not.',
      'animation-delay is free; a setTimeout per item is not. Stagger in CSS.',
      'A shimmer on 50 skeleton elements is 50 simultaneous background-position animations. Animate one overlay across the group instead.',
      'content-visibility: auto on offscreen list items stops their animations from being composited at all.',
    ],
    mistakes: [
      'Unmounting an element before its exit animation runs, so it vanishes instantly and the animation is dead code.',
      'Using animation-fill-mode: forwards on an enter animation and then wondering why the element ignores later style changes.',
      'Animating a skeleton and its replacement content, so the user watches two transitions for one piece of data.',
      'Forgetting that animation restarts on re-render if the key changes — which is why a filtered list strobes.',
    ],
    realWorld: [
      'Record a screen capture at 240fps on a real device. Half the animation problems in a product are only visible in slow motion.',
      'Keep an animation inventory page in the app. When someone adds a seventh pattern, the review conversation happens before it ships, not after it is in forty places.',
      'For anything data-driven, animate the container, not the items. A table that re-sorts should crossfade once, not animate 200 rows individually.',
      'When users say an app "feels slow", check the animation durations before the network waterfall. A 500ms transition on every navigation is a 500ms tax on every action.',
    ],
  },
})

function CopyDemo() {
  const [done, setDone] = React.useState(false)
  return (
    <IconButton
      label={done ? 'Copied' : 'Copy'}
      icon={
        done ? (
          <Check className="animate-[scale-in_180ms_cubic-bezier(0.34,1.56,0.64,1)_both]" />
        ) : (
          <Plus className="rotate-45" />
        )
      }
      variant="outlined"
      onClick={() => {
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
    />
  )
}
