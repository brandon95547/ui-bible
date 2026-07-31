import * as React from 'react'
import { Snackbar } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Cell, PreviewStage, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [open, setOpen] = React.useState(true)
  return (
    <PreviewStage label="Playground" center={false} minHeight={140}>
      <Stack gap="md" className="w-full items-center">
        {open ? (
          <Snackbar
            message="Message archived"
            action={{ label: 'Undo', onClick: () => setOpen(false) }}
            onDismiss={() => setOpen(false)}
          />
        ) : (
          <Button variant="outlined" onClick={() => setOpen(true)}>
            Show snackbar
          </Button>
        )}
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'snackbars',
    title: 'Snackbars',
    group: 'Feedback',
    tagline:
      'One line, one action, bottom centre, inverted surface. The Material lineage of the toast, and still the right shape when the message is a single sentence with an Undo.',
    keywords: ['undo', 'material', 'bottom', 'notification', 'transient', 'inverse'],
  },

  overview: {
    purpose:
      'A snackbar is a system utterance: a short statement of fact with at most one action, rendered on an inverted surface so it clearly does not belong to the page. It is the tightest possible confirmation, and the inversion is what makes it readable at a glance without any tone colour at all.',
    whenToUse: [
      'A one-line confirmation with a single Undo: archived, deleted, moved, sent.',
      'A brief offline or connectivity notice at the bottom of a mobile screen.',
      'Confirming a bulk operation where the count is the whole message.',
      'Any case where you want the toast pattern but the message genuinely fits in one line.',
    ],
    whenNotToUse: [
      {
        text: 'The message needs a title and a description.',
        instead: 'a Toast',
        to: '#/toasts',
      },
      {
        text: 'The condition persists and the user may need to come back to it.',
        instead: 'an Alert',
        to: '#/alerts',
      },
      {
        text: 'There is more than one thing the user might do about it.',
        instead: 'a Dialog — a decision cannot have a timeout',
        to: '#/dialogs',
      },
      {
        text: 'The app already uses toasts for confirmations.',
        instead: 'toasts — pick one pattern and stay with it',
      },
    ],
    reasoning: (
      <>
        <p>
          The defining feature is the <strong>inverted surface</strong>. In a dark app it is light;
          in a light app it is dark. That flip is doing real work: it says "this is the system
          speaking, not part of the page", instantly and without spending a status colour. It is
          also why a snackbar needs no icon and no tone.
        </p>
        <p>
          <strong>Exactly one action.</strong> A second one turns an announcement into a decision,
          and decisions must not disappear on a timer. If you find yourself wanting two, the message
          belongs in a dialog or an inline surface.
        </p>
        <p>
          Bottom-centre is the historical Material position and it remains correct on mobile, where
          it sits in the thumb zone directly above the bottom navigation. On desktop, prefer toasts
          bottom-right — a centred bar on a 2560px monitor is a long way from where the user is
          looking.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'variants',
        title: 'Shapes',
        description:
          'Message only, message plus action, and message plus action plus dismiss. That is the complete range.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full items-center">
              <Snackbar message="Draft saved" />
              <Snackbar message="Message archived" action={{ label: 'Undo', onClick: () => {} }} />
              <Snackbar
                message="You are offline. Changes will sync when you reconnect."
                action={{ label: 'Retry', onClick: () => {} }}
                onDismiss={() => {}}
              />
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'inversion',
        title: 'The inversion',
        description:
          'The same snackbar in both themes. It is always the opposite of its surroundings, which is what makes it read as a system message rather than page content.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              {(['dark', 'light'] as const).map((t) => (
                <div
                  key={t}
                  data-theme={t}
                  className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-5"
                >
                  <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{t}</span>
                  <Snackbar message="Message archived" action={{ label: 'Undo', onClick: () => {} }} />
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-toast',
        title: 'Snackbar or toast?',
        description:
          'Both are transient confirmations. Pick one for the whole product — using both makes the difference look arbitrary, because to the user it is.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Snackbar" sub="One line, one action, bottom centre">
                <Snackbar message="Message archived" action={{ label: 'Undo', onClick: () => {} }} />
              </Cell>
              <Cell label="Toast" sub="Title, description, tone, bottom right">
                <div className="w-full rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3.5 shadow-e4">
                  <p className="text-label text-[var(--ds-fg)]">Deployment queued</p>
                  <p className="mt-1 text-caption text-[var(--ds-fg-secondary)]">
                    api-gateway will be live in about 40 seconds.
                  </p>
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Message only', render: <div className="w-52"><Snackbar message="Draft saved" /></div> },
      { label: 'With action', render: <div className="w-52"><Snackbar message="Archived" action={{ label: 'Undo', onClick: () => {} }} /></div> },
      { label: 'With dismiss', render: <div className="w-52"><Snackbar message="Offline" onDismiss={() => {}} /></div> },
      { label: 'Long message', render: <div className="w-52"><Snackbar message="Changes will sync when you reconnect to the network." /></div> },
      { label: 'Dark app', render: <div data-theme="dark" className="w-52 rounded-[var(--radius-md)] bg-[var(--ds-canvas)] p-2"><Snackbar message="Archived" /></div> },
      { label: 'Light app', render: <div data-theme="light" className="w-52 rounded-[var(--radius-md)] bg-[var(--ds-canvas)] p-2"><Snackbar message="Archived" /></div> },
      { label: 'Entering', note: 'slide-up 220ms', render: <span className="text-caption text-[var(--ds-fg-muted)]">translateY 8px → 0</span> },
      { label: 'Duration', render: <span className="text-caption tabular-nums text-[var(--ds-fg-muted)]">4s + reading</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Snackbar
          message="Message archived"
          action={{ label: 'Undo', onClick: () => {} }}
          onDismiss={() => {}}
        />
      </div>
    ),
    caption:
      'Message, one action, one dismiss. The bar is the inverse of the app surface and carries no tone colour.',
    parts: [
      {
        n: 1,
        label: 'Surface',
        value: '--ds-fg as background',
        kind: 'color',
        note: 'The foreground colour used as a background. It inverts automatically with the theme, with no second token needed.',
      },
      {
        n: 2,
        label: 'Height',
        value: '46px minimum',
        kind: 'size',
        note: 'One line of 13px text with 12px of vertical padding. Grows to two lines and no further.',
      },
      {
        n: 3,
        label: 'Max width',
        value: '576px',
        kind: 'size',
        note: 'About 90 characters. Wide enough for a real sentence, narrow enough to read in one fixation from a centred position.',
      },
      {
        n: 4,
        label: 'Action',
        value: 'Uppercase, accent, 16px gap',
        kind: 'type',
        note: 'Uppercase is the one place we use it — it separates the action from the message without needing a border or a background.',
      },
      {
        n: 5,
        label: 'Radius',
        value: '8px · --radius-md',
        kind: 'shape',
        note: 'Smaller than a dialog or a toast. A snackbar is a bar, not a card, and the tighter radius says so.',
      },
      {
        n: 6,
        label: 'Position',
        value: 'Bottom centre, 20px inset',
        kind: 'space',
        note: 'On mobile, above the safe-area inset and clear of any bottom navigation. A snackbar covering the tab bar is a trap.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-fg', usedFor: 'Background — the inversion' },
    { category: 'color', token: '--ds-fg-inverse', usedFor: 'Message text' },
    { category: 'color', token: '--ds-accent', usedFor: 'Action label' },
    { category: 'spacing', token: 'padding', value: '10px 16px', usedFor: 'Bar padding' },
    { category: 'spacing', token: 'gap', value: '16px', usedFor: 'Message to action' },
    { category: 'spacing', token: 'inset', value: '20px', usedFor: 'Distance from the viewport edge' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Corners' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Elevation' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Message' },
    { category: 'typography', token: '--text-label', usedFor: 'Action, uppercase' },
    { category: 'motion', token: 'slide-up', value: '220ms emphasized', usedFor: 'Entrance' },
  ],

  sizes: [
    { name: 'Single line', height: '46px', padding: '10px 16px', radius: '8px', maxWidth: '576px', use: 'The standard. One sentence, one optional action.' },
    { name: 'Two line', height: '68px', padding: '12px 16px', radius: '8px', maxWidth: '576px', use: 'The ceiling. Past this, use a toast or an alert.' },
    { name: 'Mobile', maxWidth: 'calc(100vw − 24px)', padding: '10px 16px', use: 'Full width minus gutters, above the safe area and any bottom nav.' },
  ],

  do: [
    {
      title: 'Keep it to one line and one action',
      why: 'The snackbar exists because it is the smallest possible confirmation. Adding a second line or a second action turns it into a worse toast.',
      render: <Snackbar message="Message archived" action={{ label: 'Undo', onClick: () => {} }} />,
    },
    {
      title: 'Use Undo rather than a confirmation dialog',
      why: 'A dialog interrupts everyone to guard against a mistake few people make. Undo keeps the common path fast and still makes the rare case recoverable.',
      render: (
        <Stack gap="sm" className="w-full">
          <Snackbar message="3 messages deleted" action={{ label: 'Undo', onClick: () => {} }} />
        </Stack>
      ),
    },
    {
      title: 'Clear the bottom navigation on mobile',
      why: 'A snackbar sitting on top of the tab bar blocks navigation for its whole duration. Offset it by the nav height plus the safe-area inset.',
      render: (
        <div className="w-full max-w-[16rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
          <div className="p-3">
            <Snackbar message="Archived" />
          </div>
          <div className="flex justify-around border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] py-2 text-[10px] text-[var(--ds-fg-muted)]">
            <span>Home</span>
            <span>Inbox</span>
            <span>Me</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Pick one transient pattern for the product',
      why: 'Snackbars and toasts solve the same problem. Using both means users have to learn two visual languages for one concept, and the choice looks arbitrary because it is.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Snackbars everywhere, or toasts everywhere. Not both.
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put two actions in a snackbar',
      why: 'That is a decision, and a decision cannot have a timeout. The user who looks away has silently chosen neither.',
      render: (
        <div className="inline-flex min-h-[46px] w-full max-w-md items-center gap-4 rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-4 py-2.5 text-[var(--ds-fg-inverse)] shadow-e4">
          <span className="flex-1 text-body-sm">Discard this draft?</span>
          <span className="text-label uppercase text-[var(--ds-accent)]">Discard</span>
          <span className="text-label uppercase text-[var(--ds-accent)]">Keep</span>
        </div>
      ),
    },
    {
      title: 'Do not stack snackbars',
      why: 'Unlike toasts, snackbars are designed to be singular. Two at once means the second is covering the first, and the bottom-centre position has no room to stack cleanly.',
      render: (
        <Stack gap="xs" className="w-full">
          <Snackbar message="First message" />
          <Snackbar message="Second message" />
          <Snackbar message="Third message" />
        </Stack>
      ),
    },
    {
      title: 'Do not use tone colour on a snackbar',
      why: 'The inversion is the signal. A red snackbar competes with the inversion and ends up reading as neither a system message nor an error.',
      render: (
        <div className="inline-flex min-h-[46px] w-full max-w-md items-center gap-4 rounded-[var(--radius-md)] bg-[var(--ds-danger)] px-4 py-2.5 text-white shadow-e4">
          <span className="flex-1 text-body-sm">Something went wrong</span>
        </div>
      ),
    },
    {
      title: 'Do not use a snackbar for something persistent',
      why: 'It disappears. A billing failure or an expiring certificate needs to still be there when the user comes back to the page.',
      render: <Snackbar message="Your payment method has expired" />,
    },
  ],

  a11y: {
    criteria: [
      { id: '2.2.1', name: 'Timing Adjustable', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
    ],
    contrast: [
      'The inverted surface gives very high contrast for the message — around 15:1 in both themes — which is one of the pattern’s advantages.',
      'The action colour must be checked against the inverted background, not the page. Our accent reaches 4.9:1 on the dark bar and 5.4:1 on the light one.',
      'Never rely on the inversion alone to signal severity. A snackbar has no tone; if severity matters, it is the wrong component.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the action and the dismiss once the snackbar is present.' },
      { keys: 'Esc', does: 'Dismisses when focus is inside the snackbar.' },
      { keys: '⌘/Ctrl + Z', does: 'Should perform the same Undo as the action, for users who never look at the bar.' },
    ],
    aria: [
      { attr: 'role="status"', on: 'The snackbar', note: 'Polite. A snackbar is never urgent enough to interrupt — if it were, it would be an alert.' },
      { attr: 'aria-live="polite"', on: 'The container', note: 'Must exist in the DOM before the message appears.' },
      { attr: 'aria-label', on: 'The dismiss button', note: '"Dismiss message". Never a bare ×.' },
      { attr: 'aria-keyshortcuts', on: 'The Undo action', note: 'When Undo is also bound to a keyboard shortcut, declare it.' },
    ],
    focus:
      'A snackbar never takes focus. It appears, it is announced politely, and the user carries on. Focus only enters if the user tabs there.',
    screenReader: [
      'Announce the message only — the action label is reachable by tab and does not need to be in the announcement.',
      'Auto-dismiss must pause on hover and focus to satisfy WCAG 2.2.1, and Undo should also be available as a keyboard shortcut for anyone who misses the window.',
      'The container must pre-exist. Mounting it together with the message means nothing is announced.',
    ],
    touch:
      'The action is the primary target and must be at least 44px tall including padding. Support swipe-to-dismiss, and always clear the safe-area inset and any bottom navigation.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Snackbar } from '@/ui/Feedback'

// The canonical use: destructive action plus Undo
function archive(message: Message) {
  const snapshot = message
  remove(message.id)                       // optimistic
  setSnack({
    message: 'Message archived',
    action: { label: 'Undo', onClick: () => restore(snapshot) },
  })
}

<Snackbar
  message="Message archived"
  action={{ label: 'Undo', onClick: undo }}
  onDismiss={() => setSnack(null)}
/>

// Bind the same Undo to a keyboard shortcut — many users never
// look at the bar at all.
useEffect(() => {
  if (!snack?.action) return
  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault()
      snack.action.onClick()
      setSnack(null)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [snack])`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-snackbar-region" role="status" aria-live="polite">
  <div class="ds-snackbar">
    <span class="ds-snackbar__message">Message archived</span>
    <button class="ds-snackbar__action" type="button">Undo</button>
    <button class="ds-snackbar__dismiss" type="button" aria-label="Dismiss message">
      <svg aria-hidden="true">…</svg>
    </button>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-snackbar-region {
  position: fixed;
  inset-block-end: 20px;
  inset-inline: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 90;
}

.ds-snackbar {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  min-block-size: 46px;
  max-inline-size: 36rem;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-e4);

  /* The inversion. One token, both themes, no second definition. */
  background: var(--ds-fg);
  color: var(--ds-fg-inverse);

  animation: slide-up 220ms var(--ease-emphasized) both;
}

.ds-snackbar__message { font-size: 13px; }

/* Uppercase is used here and nowhere else — it separates the action
   from the message without a border or a background. */
.ds-snackbar__action {
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-size: 13px;
  font-weight: 540;
  color: var(--ds-accent);
}

/* Mobile: clear the safe area and any bottom navigation */
@media (max-width: 640px) {
  .ds-snackbar-region {
    inset-inline: 12px;
    inset-block-end: calc(env(safe-area-inset-bottom) + var(--bottom-nav, 0px) + 12px);
  }
  .ds-snackbar { inline-size: 100%; }
}`,
    },
    api: [
      {
        name: 'Snackbar',
        props: [
          { name: 'message', type: 'ReactNode', required: true, description: 'One line. Two at the absolute maximum.' },
          { name: 'action', type: '{ label, onClick }', description: 'Exactly one. A second turns it into a decision.' },
          { name: 'onDismiss', type: '() => void', description: 'Adds a close button. Optional when the bar auto-dismisses.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Undo should restore position as well as existence. Putting a deleted row back at the bottom of the list is technically an undo and practically a new bug.',
      'Bind Undo to ⌘Z as well as the button. Many users never look at the bottom of the screen.',
      'Collapse bulk operations into one snackbar with a count: "3 messages archived", not three snackbars.',
      'Give the Undo window the full snackbar duration, and only commit the destructive operation to the server when it closes.',
    ],
    performance: [
      'Render in a portal at the body so no transformed ancestor can break position: fixed.',
      'Optimistic removal plus a deferred server call means the Undo path never has to make a second request. Commit on dismiss, not on action.',
      'Only ever one snackbar in the DOM. Replacing the message is cheaper and clearer than mounting a second bar.',
    ],
    mistakes: [
      'Two actions, which makes the timeout into a silent default choice.',
      'Stacking snackbars, which the bottom-centre position cannot accommodate.',
      'Covering the bottom navigation on mobile, blocking it for the whole duration.',
      'Offering Undo for something that cannot actually be undone. A failing Undo is worse than none.',
      'Using both snackbars and toasts in the same product, so the distinction looks arbitrary.',
    ],
    realWorld: [
      'Gmail made Undo-with-snackbar the default expectation for destructive actions twenty years ago. Users now look for it, and its absence reads as an unfinished product.',
      'Measure Undo usage. Above about 5% means the action is too easy to trigger by mistake and probably needs a larger target or more separation.',
      'On desktop, most teams end up with toasts because messages grow past one line. Choose deliberately at the start rather than drifting.',
      'For offline notices, a snackbar is the right pattern — but it should persist while offline rather than auto-dismissing, because the condition is still true.',
    ],
  },
})
