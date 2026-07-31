import * as React from 'react'
import { Toast, useToast, type ToastItem } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import type { Tone } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SAMPLES: Record<string, Omit<ToastItem, 'id'>> = {
  success: { tone: 'success', title: 'Deployment queued', description: 'api-gateway will be live in about 40 seconds.' },
  danger: { tone: 'danger', title: 'Deployment failed', description: 'Build step exited with code 1.', action: { label: 'View logs', onClick: () => {} } },
  info: { tone: 'info', title: 'Copied to clipboard' },
  warning: { tone: 'warning', title: 'Rate limit approaching', description: '92% of your hourly quota used.' },
}

function Playground() {
  const { toast } = useToast()
  const [tone, setTone] = React.useState<'success' | 'danger' | 'info' | 'warning'>('success')
  const [action, setAction] = React.useState(true)
  const [persistent, setPersistent] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Tone">
            <KnobSelect
              value={tone}
              onChange={setTone}
              options={['success', 'danger', 'info', 'warning'] as const}
            />
          </Knob>
          <KnobToggle checked={action} onChange={setAction} label="Action" />
          <KnobToggle checked={persistent} onChange={setPersistent} label="Persistent" />
        </div>
      }
      code={`const { toast } = useToast()

toast({
  tone: '${tone}',
  title: '${SAMPLES[tone].title}',
  description: '…',${action ? "\n  action: { label: 'Undo', onClick: undo }," : ''}${persistent ? '\n  persistent: true,' : ''}
})`}
    >
      <Stack gap="md" className="items-center">
        <Button
          onClick={() =>
            toast({
              ...SAMPLES[tone],
              persistent,
              action: action
                ? { label: tone === 'danger' ? 'View logs' : 'Undo', onClick: () => {} }
                : undefined,
            })
          }
        >
          Show toast
        </Button>
        <p className="max-w-sm text-center text-caption text-[var(--ds-fg-muted)]">
          Appears bottom-right. Duration scales with the length of the text and caps at nine
          seconds.
        </p>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'toasts',
    title: 'Toasts',
    group: 'Feedback',
    tagline:
      'Transient confirmation that something happened. It disappears on its own, which means it must never carry the only copy of anything important.',
    keywords: ['notification', 'popup', 'transient', 'temporary', 'undo', 'snack'],
  },

  overview: {
    purpose:
      'A toast confirms an outcome without interrupting the task. It appears out of the flow, states what happened in one line, optionally offers an undo, and removes itself. Its value is that it costs the user nothing; its limitation is that it is easy to miss entirely.',
    whenToUse: [
      'Confirming an action completed away from where the user is looking: saved, sent, deleted, queued.',
      'Offering Undo immediately after a destructive action, instead of a confirmation dialog beforehand.',
      'Reporting the result of a background job the user started earlier.',
      'A brief, non-blocking system message the user does not need to act on.',
    ],
    whenNotToUse: [
      {
        text: 'The message describes a condition that persists.',
        instead: 'an Alert',
        to: '#/alerts',
      },
      {
        text: 'The user must respond before continuing.',
        instead: 'a Dialog',
        to: '#/dialogs',
      },
      {
        text: 'The result is visible on screen anyway — a row that just appeared.',
        instead: 'nothing; the change is its own confirmation',
      },
      {
        text: 'It contains information the user may need to copy, such as an error ID.',
        instead: 'a persistent toast, or an Alert',
        to: '#/alerts',
      },
    ],
    reasoning: (
      <>
        <p>
          A toast has one fatal property: <strong>it goes away</strong>. Anything in it that the
          user needed and missed is simply gone. That single fact drives every rule here — no
          critical information, no long text, no forms, and a persistent variant for anything the
          user might want to copy.
        </p>
        <p>
          Duration is <strong>computed, not fixed</strong>. A blanket three seconds is unreadable
          for anything longer than "Saved". Ours is 4 seconds plus reading time at roughly 18
          characters per second, capped at 9. A toast the user cannot finish reading is worse than
          no toast at all.
        </p>
        <p>
          Bottom-right is deliberate: out of the reading path, away from the primary action, and
          away from the top-centre position where operating systems put their own notifications.
          Toasts stack upward with the newest closest to the corner, and we cap the stack at four —
          past that the user is watching a log, not reading a message.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'anatomy-variants',
        title: 'Tones',
        description:
          'Four tones, same structure. The danger toast is the only one that uses role="alert" and interrupts a screen reader.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full max-w-md">
              {(Object.keys(SAMPLES) as (keyof typeof SAMPLES)[]).map((k) => (
                <Toast
                  key={k}
                  item={{ id: k, ...SAMPLES[k] }}
                  onDismiss={() => {}}
                />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'undo',
        title: 'Undo instead of confirm',
        description:
          'Deleting immediately with an Undo toast is faster than a confirmation dialog and recovers just as well. The dialog interrupts everyone to protect against a rare mistake.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <UndoDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'stacking',
        title: 'Stacking and duration',
        description:
          'Newest nearest the corner, capped at four. Fire several quickly to see the cap — and note that longer messages stay longer.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <StackDemo />
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Success', render: <MiniToast tone="success" title="Saved" /> },
      { label: 'Danger', note: 'role="alert"', render: <MiniToast tone="danger" title="Failed" /> },
      { label: 'Info', render: <MiniToast tone="info" title="Copied" /> },
      { label: 'Warning', render: <MiniToast tone="warning" title="Quota at 92%" /> },
      { label: 'With action', render: <MiniToast tone="success" title="Deleted" action /> },
      { label: 'Two-line', render: <MiniToast tone="info" title="Queued" description="Live in ~40s." /> },
      { label: 'Persistent', note: 'No auto-dismiss', render: <MiniToast tone="danger" title="Error ID 4f21c" /> },
      { label: 'Entering', note: 'slide-up 220ms', render: <span className="text-caption text-[var(--ds-fg-muted)]">translateY 8px → 0</span> },
      { label: 'Stacked', render: <div className="flex flex-col gap-1.5"><MiniToast tone="info" title="First" /><MiniToast tone="success" title="Second" /></div> },
      { label: 'Capped', render: <span className="text-caption text-[var(--ds-fg-muted)]">max 4 visible</span> },
      { label: 'Duration', render: <span className="text-caption tabular-nums text-[var(--ds-fg-muted)]">4s + reading</span> },
      { label: 'Reduced motion', render: <span className="text-caption text-[var(--ds-fg-muted)]">fade only</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Toast
          item={{
            id: 'anat',
            tone: 'danger',
            title: 'Deployment failed',
            description: 'Build step exited with code 1 after 11 seconds.',
            action: { label: 'View logs', onClick: () => {} },
          }}
          onDismiss={() => {}}
        />
      </div>
    ),
    caption:
      'Icon, title, one line of description, one action, one dismiss. Anything more than this belongs somewhere permanent.',
    parts: [
      {
        n: 1,
        label: 'Width',
        value: '384px, capped to the viewport',
        kind: 'size',
        note: 'About 55 characters per line — narrow enough to read in one glance, wide enough for a real sentence.',
      },
      {
        n: 2,
        label: 'Surface',
        value: '--ds-surface-overlay + e4',
        kind: 'color',
        note: 'Overlay-level elevation, because it floats above everything including dialogs’ scrims in some flows.',
      },
      {
        n: 3,
        label: 'Position',
        value: 'Bottom-right, 20px inset',
        kind: 'space',
        note: 'Out of the reading path and away from the primary action. Top-centre collides with OS notifications.',
      },
      {
        n: 4,
        label: 'Duration',
        value: '4s + chars ÷ 18, max 9s',
        kind: 'motion',
        note: 'Computed from the text length. A fixed three seconds is unreadable for anything longer than one word.',
      },
      {
        n: 5,
        label: 'Action',
        value: 'Exactly one, text style',
        kind: 'shape',
        note: 'A second action turns an announcement into a decision, and decisions must not disappear on a timer.',
      },
      {
        n: 6,
        label: 'Entrance',
        value: 'slide-up 220ms emphasized',
        kind: 'motion',
        note: '8px of travel plus a fade. Enough to catch peripheral vision without pulling the eye off the task.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Toast background' },
    { category: 'color', token: '--ds-border', usedFor: 'Edge definition' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Tone icon' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Action label' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Description' },
    { category: 'spacing', token: 'padding', value: '14px', usedFor: 'All sides' },
    { category: 'spacing', token: 'stack gap', value: '10px', usedFor: 'Between stacked toasts' },
    { category: 'spacing', token: 'viewport inset', value: '20px', usedFor: 'Distance from the corner' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Elevation' },
    { category: 'motion', token: 'slide-up', value: '220ms emphasized', usedFor: 'Entrance' },
  ],

  sizes: [
    { name: 'Single line', height: '52px', maxWidth: '384px', padding: '14px', use: '“Copied to clipboard.” No description, no action.' },
    { name: 'Two line', height: '76px', maxWidth: '384px', padding: '14px', use: 'Title plus one line of detail. The common case.' },
    { name: 'With action', height: '104px', maxWidth: '384px', padding: '14px', use: 'Adds an Undo or a View link below the description.' },
    { name: 'Stack', maxWidth: '384px', gap: '10px', use: 'Four visible maximum. Older toasts are dropped, not queued.' },
    { name: 'Mobile', maxWidth: 'calc(100vw − 40px)', use: 'Full width minus the gutters, anchored bottom above the safe area.' },
  ],

  do: [
    {
      title: 'Scale the duration to the text',
      why: 'Four seconds plus reading time. A fixed three seconds means a two-line message is gone before it is finished, and users learn to ignore toasts entirely.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px] text-[var(--ds-success-text)]">
          <span>4000 + (chars / 18) * 1000</span>
          <span className="text-[var(--ds-fg-muted)]">capped at 9000ms</span>
        </Stack>
      ),
    },
    {
      title: 'Offer Undo instead of a confirmation dialog',
      why: 'A dialog interrupts everyone to protect against a mistake most people never make. Undo lets the common case be fast and still makes the rare case recoverable.',
      render: <UndoDemo compact />,
    },
    {
      title: 'Make anything copyable persistent',
      why: 'An error ID or a support reference disappearing after six seconds is a guaranteed support ticket. Persistent toasts wait for a deliberate dismiss.',
      render: <MiniToast tone="danger" title="Error 4f21c-8821" description="Persistent — dismiss manually." />,
    },
    {
      title: 'Pause the timer on hover and focus',
      why: 'A user who has moved the pointer onto the toast is reading it. Continuing to count down is actively hostile.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          onMouseEnter={'{'}pause{'}'} onFocusCapture={'{'}pause{'}'}
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put critical information in a toast',
      why: 'It disappears. If the user looked away, the information is gone with no way to retrieve it — and there is no history to scroll back through.',
      render: (
        <MiniToast
          tone="danger"
          title="Your API key: sk_live_4f21c88"
          description="This is the only time it will be shown."
        />
      ),
    },
    {
      title: 'Do not queue a backlog',
      why: 'Twelve toasts appearing one after another for eleven seconds is a log file with animation. Cap the stack and collapse repeats into a count.',
      render: (
        <Stack gap="xs" className="w-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <MiniToast key={i} tone="info" title={`Row ${i} saved`} />
          ))}
        </Stack>
      ),
    },
    {
      title: 'Do not toast something already visible',
      why: 'If the row appeared in the table, the user saw it. A toast saying "Row added" is redundant motion competing with the change it is describing.',
      render: (
        <Stack gap="sm" className="w-full">
          <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 text-caption">
            new-service · just added
          </div>
          <MiniToast tone="success" title="Row added" />
        </Stack>
      ),
    },
    {
      title: 'Do not put a form or two actions in a toast',
      why: 'A decision cannot have a timeout. Anything requiring more than one tap is a dialog or an inline surface, not something that vanishes.',
      render: (
        <div className="w-full max-w-[20rem] rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3.5 shadow-e4">
          <p className="text-label text-[var(--ds-fg)]">Reassign this task?</p>
          <Row gap="sm" className="mt-2">
            <Button size="xs">Reassign</Button>
            <Button size="xs" variant="outlined">Cancel</Button>
            <Button size="xs" variant="text">Later</Button>
          </Row>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
    ],
    contrast: [
      'The overlay surface is lighter than the page in dark mode and white with a shadow in light mode, so both need their own contrast check against the toast text.',
      'The action link must reach 4.5:1 against the toast background and must not rely on colour alone — ours underlines on hover and focus.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the action and the dismiss button once a toast is present.' },
      { keys: 'Esc', does: 'Dismisses the most recent toast when focus is inside the toast region.' },
      { keys: 'F6', does: 'Some screen readers use this to jump to the notification region. Keeping the region labelled makes that work.' },
    ],
    aria: [
      { attr: 'role="region" + aria-label', on: 'The toast container', note: '"Notifications". Lets a screen-reader user navigate back to it deliberately.' },
      { attr: 'role="status"', on: 'Non-error toasts', note: 'Announced at the next pause. The container must exist before the toast is added.' },
      { attr: 'role="alert"', on: 'Danger toasts', note: 'Interrupts. Reserved for failures the user needs to know about immediately.' },
      { attr: 'aria-live', on: 'The container', note: 'polite or assertive to match. Setting it on the toast itself is too late — the region has to pre-exist.' },
      { attr: 'aria-label', on: 'The dismiss button', note: '"Dismiss notification". Never a bare ×.' },
    ],
    focus:
      'A toast must never steal focus. It appears, it is announced, and the user carries on typing. Focus only moves into it if the user tabs there deliberately.',
    screenReader: [
      'The live region must be in the DOM on page load. Mounting the container and the toast together means many screen readers announce nothing.',
      'Keep the announcement short — the title alone is usually enough. Screen-reader users cannot skim a toast the way sighted users can.',
      'WCAG 2.2.1 means auto-dismiss must be adjustable or avoidable. Pausing on hover and focus, plus a persistent option, satisfies it.',
    ],
    touch:
      'On mobile, anchor to the bottom above the safe-area inset and make the whole toast swipeable to dismiss. Keep it clear of any bottom navigation — a toast covering the tab bar is a trap.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { ToastProvider, useToast } from '@/ui/Feedback'

// Mount the provider once, high in the tree. The live region must
// exist before any toast is added, or nothing is announced.
<ToastProvider position="bottom-right" max={4}>
  <App />
</ToastProvider>

// Anywhere below it
const { toast, dismiss } = useToast()

toast({ tone: 'success', title: 'Deployment queued',
        description: 'api-gateway will be live in about 40 seconds.' })

// Undo instead of a confirmation dialog
async function deleteProject(p: Project) {
  const snapshot = p
  remove(p.id)                       // optimistic
  const id = toast({
    tone: 'neutral',
    title: p.name + ' deleted',
    action: { label: 'Undo', onClick: () => restore(snapshot) },
  })
  try {
    await api.delete(p.id)
  } catch {
    restore(snapshot)
    dismiss(id)
    toast({ tone: 'danger', title: 'Could not delete ' + p.name })
  }
}

// Persistent: anything the user may need to copy
toast({
  tone: 'danger',
  title: 'Deployment failed',
  description: 'Error 4f21c-8821',
  persistent: true,
})`,
    },
    html: {
      lang: 'html',
      code: `<!-- The region is rendered on page load and stays empty -->
<div class="ds-toasts" role="region" aria-label="Notifications">
  <div class="ds-toast" role="status" aria-live="polite">
    <svg class="ds-toast__icon" aria-hidden="true">…</svg>
    <div class="ds-toast__content">
      <p class="ds-toast__title">Deployment queued</p>
      <p class="ds-toast__desc">api-gateway will be live in about 40 seconds.</p>
      <button class="ds-toast__action">Undo</button>
    </div>
    <button class="ds-toast__dismiss" aria-label="Dismiss notification">
      <svg aria-hidden="true">…</svg>
    </button>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-toasts {
  position: fixed;
  inset-block-end: 0;
  inset-inline-end: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  pointer-events: none;              /* the stack never blocks the page */
}
.ds-toast { pointer-events: auto; }

.ds-toast {
  inline-size: min(24rem, calc(100vw - 2.5rem));
  display: flex;
  gap: 12px;
  padding: 14px;
  background: var(--ds-surface-overlay);
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-e4);
  animation: slide-up 220ms var(--ease-emphasized) both;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px) }
  to   { opacity: 1; transform: translateY(0) }
}

/* Mobile: full width above the safe area, clear of any bottom nav */
@media (max-width: 640px) {
  .ds-toasts {
    inset-inline: 0;
    padding: 12px;
    padding-block-end: max(12px, env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-toast { animation-name: fade-in; }
}`,
    },
    api: [
      {
        name: 'useToast()',
        props: [
          { name: 'toast(item)', type: '(t: Omit<ToastItem,"id">) => string', description: 'Shows a toast and returns its id.' },
          { name: 'dismiss(id)', type: '(id: string) => void', description: 'Removes a toast early — useful when an optimistic action resolves.' },
          { name: 'items', type: 'ToastItem[]', description: 'The current stack. Rarely needed outside the provider.' },
        ],
      },
      {
        name: 'ToastItem',
        props: [
          { name: 'title', type: 'string', required: true, description: 'One short line. This is what gets announced.' },
          { name: 'description', type: 'string', description: 'One line of detail. Two lines maximum.' },
          { name: 'tone', type: 'Tone', default: "'neutral'", description: 'danger switches the role to "alert".' },
          { name: 'action', type: '{ label, onClick }', description: 'Exactly one. Dismisses the toast after firing.' },
          { name: 'duration', type: 'number', description: 'Override the computed duration. Rarely correct.' },
          { name: 'persistent', type: 'boolean', default: 'false', description: 'No auto-dismiss. Use for anything copyable.' },
        ],
      },
      {
        name: 'ToastProvider',
        props: [
          { name: 'position', type: "'bottom-right' | 'bottom-center' | 'top-right' | 'top-center'", default: "'bottom-right'", description: 'Bottom-right on desktop, bottom-center on mobile.' },
          { name: 'max', type: 'number', default: '4', description: 'Older toasts are dropped rather than queued.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Collapse repeats: "3 rows deleted" instead of three separate toasts. Group by action type within a short window.',
      'Undo should remain available for the full toast duration, and the action must be genuinely reversible — a fake Undo that fails is worse than no Undo.',
      'On mobile, support swipe-to-dismiss. It is the gesture users already expect and it removes the need for a small × target.',
      'If a background job takes minutes, do not toast at the start and the end. Toast at the end only, or use a persistent progress surface.',
    ],
    performance: [
      'Render toasts in a portal at the body. Inside a transformed ancestor, position: fixed silently stops being fixed.',
      'Clear timers on unmount. A dangling setTimeout that calls setState after the provider unmounts is a classic React warning and a real leak.',
      'Cap the array rather than queueing. An unbounded queue during a burst of events keeps animating long after the burst is over.',
      'Animate transform and opacity only. A stack of four toasts animating layout properties drops frames on low-end devices.',
    ],
    mistakes: [
      'Mounting the live region at the same moment as the toast, so screen readers announce nothing at all.',
      'Using a fixed three-second duration, which makes any two-line message unreadable.',
      'Putting the only copy of an API key, error ID or confirmation number in a toast.',
      'Stealing focus when a toast appears, which throws a keyboard user out of the field they were typing in.',
      'Placing toasts top-centre on mobile, where they collide with the OS notification shade.',
    ],
    realWorld: [
      'Toast frequency is the metric that matters. If a user sees more than a handful per session, the product is narrating itself instead of just working.',
      'Undo-with-toast is measurably faster than confirm-then-delete for the overwhelming majority of users, and it is the pattern Gmail made standard twenty years ago.',
      'Keep a notification centre for anything that would otherwise need a persistent toast. Then toasts can stay genuinely transient.',
      'Log every toast with tone and title. A spike in danger toasts is usually the first signal of an incident, ahead of your error tracker.',
    ],
  },
})

/* ---- demos --------------------------------------------------------------- */

function UndoDemo({ compact }: { compact?: boolean }) {
  const { toast } = useToast()
  const [items, setItems] = React.useState(['api-gateway', 'billing-worker', 'edge-cache'])

  const remove = (name: string) => {
    const index = items.indexOf(name)
    setItems((prev) => prev.filter((x) => x !== name))
    toast({
      tone: 'neutral',
      title: `${name} deleted`,
      action: {
        label: 'Undo',
        onClick: () =>
          setItems((prev) => {
            const next = [...prev]
            next.splice(index, 0, name)
            return next
          }),
      },
    })
  }

  return (
    <Stack gap="sm" className={compact ? 'w-full' : 'w-full max-w-sm'}>
      {items.length === 0 && (
        <p className="text-caption text-[var(--ds-fg-muted)]">All deleted. Use Undo to restore.</p>
      )}
      {items.map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2"
        >
          <span className="font-mono text-body-sm text-[var(--ds-fg-secondary)]">{i}</span>
          <Button size="xs" variant="danger-outline" onClick={() => remove(i)}>
            Delete
          </Button>
        </div>
      ))}
    </Stack>
  )
}

function StackDemo() {
  const { toast } = useToast()
  const [n, setN] = React.useState(0)
  return (
    <Row gap="sm">
      <Button
        variant="outlined"
        onClick={() => {
          setN((x) => x + 1)
          toast({ tone: 'info', title: `Event ${n + 1}` })
        }}
      >
        Fire one
      </Button>
      <Button
        variant="outlined"
        onClick={() => {
          for (let i = 1; i <= 6; i++) {
            toast({ tone: i % 2 ? 'success' : 'info', title: `Burst event ${i}` })
          }
        }}
      >
        Fire six
      </Button>
    </Row>
  )
}

function MiniToast({
  tone,
  title,
  description,
  action,
}: {
  tone: Tone
  title: string
  description?: string
  action?: boolean
}) {
  return (
    <div className="w-full max-w-[15rem]">
      <Toast
        item={{
          id: title,
          tone,
          title,
          description,
          action: action ? { label: 'Undo', onClick: () => {} } : undefined,
        }}
        onDismiss={() => {}}
      />
    </div>
  )
}
