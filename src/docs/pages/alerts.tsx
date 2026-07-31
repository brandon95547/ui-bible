import * as React from 'react'
import { CreditCard, ShieldAlert } from 'lucide-react'
import { Alert } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Callout } from '@/ui/Surface'
import type { Tone } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

const TONES: Tone[] = ['info', 'success', 'warning', 'danger', 'accent', 'neutral']

const COPY: Record<string, { title: string; body: string }> = {
  info: { title: 'Scheduled maintenance', body: 'The API will be read-only on Sunday from 02:00 to 04:00 UTC.' },
  success: { title: 'Domain verified', body: 'app.acme.com now points at this project. Certificates issue automatically.' },
  warning: { title: 'Certificate expires in 6 days', body: 'Renewal is automatic, but the DNS challenge record is missing.' },
  danger: { title: 'Payment declined', body: 'Card ending 4242 was refused by the issuer. Services pause in 3 days.' },
  accent: { title: 'New: deployment previews', body: 'Every pull request now gets its own URL. Nothing to configure.' },
  neutral: { title: 'This project is archived', body: 'It is read-only. Restore it to deploy again.' },
}

function Playground() {
  const [tone, setTone] = React.useState<Tone>('warning')
  const [actions, setActions] = React.useState(true)
  const [dismissible, setDismissible] = React.useState(true)
  const [quiet, setQuiet] = React.useState(false)
  const [body, setBody] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={140}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Tone">
            <KnobSelect value={tone} onChange={setTone} options={TONES} />
          </Knob>
          <KnobToggle checked={body} onChange={setBody} label="Body" />
          <KnobToggle checked={actions} onChange={setActions} label="Actions" />
          <KnobToggle checked={dismissible} onChange={setDismissible} label="Dismissible" />
          <KnobToggle checked={quiet} onChange={setQuiet} label="Quiet" />
        </div>
      }
      code={`<Alert
  tone="${tone}"
  title="${COPY[tone].title}"${quiet ? '\n  quiet' : ''}${dismissible ? '\n  onDismiss={dismiss}' : ''}${actions ? '\n  actions={<Button size="sm">Fix it</Button>}' : ''}
>
  ${body ? COPY[tone].body : ''}
</Alert>`}
    >
      <div className="w-full max-w-2xl">
        <Alert
          tone={tone}
          quiet={quiet}
          title={COPY[tone].title}
          onDismiss={dismissible ? () => {} : undefined}
          actions={
            actions ? (
              <>
                <Button size="sm" variant={tone === 'danger' ? 'danger' : 'outlined'}>
                  {tone === 'danger' ? 'Update card' : 'Fix it'}
                </Button>
                <Button size="sm" variant="text">
                  Learn more
                </Button>
              </>
            ) : undefined
          }
        >
          {body ? COPY[tone].body : undefined}
        </Alert>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'alerts',
    title: 'Alerts',
    group: 'Feedback',
    tagline:
      'Persistent, in-flow messages that stay until the situation changes. If it should disappear on its own, it is a toast.',
    keywords: ['banner', 'callout', 'inline message', 'notification', 'warning', 'error', 'info'],
  },

  overview: {
    purpose:
      'An alert states a condition that is currently true and is relevant to what the user is looking at. It sits in the layout rather than floating over it, and it stays until the condition is resolved. That persistence is the whole point — an alert is for things the user needs to be able to come back to.',
    whenToUse: [
      'A condition that persists: an expiring certificate, a failed payment, a read-only project.',
      'Explaining why something on the page is unavailable or behaving unusually.',
      'A form-level error summary after a failed submission.',
      'Important context the user should read before acting on the page they are on.',
    ],
    whenNotToUse: [
      {
        text: 'Confirming that an action the user just took succeeded.',
        instead: 'a Toast',
        to: '#/toasts',
      },
      {
        text: 'A single field failed validation.',
        instead: 'the field’s own error message',
        to: '#/text-inputs',
      },
      {
        text: 'The user must decide something before continuing.',
        instead: 'a Dialog',
        to: '#/dialogs',
      },
      {
        text: 'Marketing or upsell content.',
        instead: 'a Card — alerts are for conditions, not campaigns',
        to: '#/cards',
      },
    ],
    reasoning: (
      <>
        <p>
          The most consequential decision on this page is <strong>role</strong>. A danger alert uses{' '}
          <code>role="alert"</code>, which interrupts a screen reader mid-sentence. Everything else
          uses <code>role="status"</code>, which waits for a natural pause. Getting this backwards
          means your success messages talk over the user while your errors go unnoticed — and no
          visual review will catch it.
        </p>
        <p>
          Alerts are placed <strong>where the condition applies</strong>. A payment failure belongs
          at the top of the billing page, not in a global banner on every screen. A page-level
          banner that follows the user everywhere is read once and then permanently ignored, which
          is exactly what you do not want from a warning.
        </p>
        <p>
          Only <strong>dismissible when dismissing is honest</strong>. If the condition is still
          true after the user closes it, the close button is a lie that hides a real problem. Alerts
          that describe unresolved states should have no dismiss control at all — they disappear
          when the state does.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'tones',
        title: 'The severity ladder',
        description:
          'Four levels, each with a distinct job. If everything is a warning, nothing is — the ladder only works if each level is used sparingly.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full max-w-2xl">
              <Alert tone="info" title="Scheduled maintenance">
                The API will be read-only on Sunday from 02:00 to 04:00 UTC.
              </Alert>
              <Alert tone="success" title="Domain verified">
                app.acme.com now points at this project.
              </Alert>
              <Alert tone="warning" title="Certificate expires in 6 days">
                Renewal is automatic, but the DNS challenge record is missing.
              </Alert>
              <Alert
                tone="danger"
                title="Payment declined"
                icon={<CreditCard size={17} />}
                actions={<Button size="sm" variant="danger">Update card</Button>}
              >
                Card ending 4242 was refused. Services pause in 3 days.
              </Alert>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'placement',
        title: 'Placement',
        description:
          'Page-level at the top of the content column, section-level directly above the thing it describes, and inline for a specific control.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)]">
              <div className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-5 py-3">
                <p className="text-label text-[var(--ds-fg)]">Billing</p>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <Alert tone="danger" title="Payment declined" icon={<CreditCard size={17} />}>
                  Page level — the condition applies to this whole screen.
                </Alert>
                <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-4">
                  <p className="mb-3 text-label text-[var(--ds-fg)]">Payment method</p>
                  <Alert tone="warning" quiet title="Card expires next month">
                    Section level — directly above the thing it describes.
                  </Alert>
                </div>
                <Callout tone="neutral" title="Inline">
                  A callout is the quietest form: editorial emphasis inside prose, with no severity
                  and no dismiss.
                </Callout>
              </div>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'error-summary',
        title: 'Form error summary',
        description:
          'After a failed submit, an alert at the top of the form lists what went wrong and links to each field. Focus moves here, so keyboard and screen-reader users are not left hunting.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-2xl">
              <Alert
                tone="danger"
                title="3 fields need attention"
                icon={<ShieldAlert size={17} />}
              >
                <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
                  <li>
                    <a href="#/alerts" className="text-[var(--ds-danger-text)] underline underline-offset-2">
                      Work email
                    </a>{' '}
                    — must include an @
                  </li>
                  <li>
                    <a href="#/alerts" className="text-[var(--ds-danger-text)] underline underline-offset-2">
                      Password
                    </a>{' '}
                    — at least 12 characters
                  </li>
                  <li>
                    <a href="#/alerts" className="text-[var(--ds-danger-text)] underline underline-offset-2">
                      Terms
                    </a>{' '}
                    — must be accepted
                  </li>
                </ul>
              </Alert>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Info', render: <MiniAlert tone="info" /> },
      { label: 'Success', render: <MiniAlert tone="success" /> },
      { label: 'Warning', render: <MiniAlert tone="warning" /> },
      { label: 'Danger', render: <MiniAlert tone="danger" /> },
      { label: 'Accent', note: 'Announcements', render: <MiniAlert tone="accent" /> },
      { label: 'Neutral', render: <MiniAlert tone="neutral" /> },
      { label: 'Quiet', note: 'No tinted fill', render: <div className="w-48"><Alert tone="warning" quiet title="Quiet" /></div> },
      { label: 'Title only', render: <div className="w-48"><Alert tone="info" title="Read-only project" /></div> },
      { label: 'With actions', render: <div className="w-48"><Alert tone="danger" title="Failed" actions={<Button size="xs" variant="danger">Retry</Button>} /></div> },
      { label: 'Dismissible', render: <div className="w-48"><Alert tone="info" title="Dismissible" onDismiss={() => {}} /></div> },
      { label: 'Greyscale', render: <span style={{ filter: 'grayscale(1)' }}><MiniAlert tone="danger" /></span> },
      { label: 'Stacked', render: <div className="flex w-48 flex-col gap-2"><MiniAlert tone="warning" /><MiniAlert tone="info" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Alert
          tone="danger"
          title="Payment declined"
          icon={<CreditCard size={17} />}
          onDismiss={() => {}}
          actions={
            <>
              <Button size="sm" variant="danger">Update card</Button>
              <Button size="sm" variant="text">Contact support</Button>
            </>
          }
        >
          Card ending 4242 was refused by the issuer. Services pause in 3 days.
        </Alert>
      </div>
    ),
    caption:
      'Icon, title, body, up to two actions, and an optional dismiss. Everything shares a single left edge below the icon gutter.',
    parts: [
      {
        n: 1,
        label: 'Icon',
        value: '17px, tone-coloured',
        kind: 'shape',
        note: 'The redundant encoding for the tone. It is the reason the message still works in greyscale and in high-contrast mode.',
      },
      {
        n: 2,
        label: 'Icon gutter',
        value: '12px',
        kind: 'space',
        note: 'Title, body and actions all align to the same left edge past the icon, so the text block reads as one column.',
      },
      {
        n: 3,
        label: 'Fill',
        value: '14% alpha tint',
        kind: 'color',
        note: 'A tint, not a solid. A solid status colour behind body text cannot reach 4.5:1 in both themes.',
      },
      {
        n: 4,
        label: 'Border',
        value: '1px at 34% alpha',
        kind: 'color',
        note: 'Reaches 3:1 against the surface, which WCAG requires of any meaningful boundary — and it is what survives High Contrast Mode.',
      },
      {
        n: 5,
        label: 'Title and body',
        value: '13px / 540 and 13px / 400',
        kind: 'type',
        note: 'The body is --ds-fg-secondary, not the tone colour. Colouring the whole message red reduces legibility and overstates the severity.',
      },
      {
        n: 6,
        label: 'Actions',
        value: 'Max 2, 6px above',
        kind: 'space',
        note: 'Two actions is the ceiling. A third means the user is making a decision, and decisions belong in a dialog.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-danger-subtle', usedFor: 'Tinted fill' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Border — ≥3:1 against the surface' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Icon, certified against the tint' },
    { category: 'color', token: '--ds-fg', usedFor: 'Title' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Body copy — deliberately neutral' },
    { category: 'color', token: '--ds-surface', usedFor: 'Quiet variant background' },
    { category: 'spacing', token: 'padding', value: '14px', usedFor: 'All sides' },
    { category: 'spacing', token: 'icon gutter', value: '12px', usedFor: 'Icon to text column' },
    { category: 'spacing', token: 'title to body', value: '6px', usedFor: 'Inside the text column' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Corners' },
    { category: 'typography', token: '--text-label', usedFor: 'Title' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Body' },
  ],

  sizes: [
    { name: 'Quiet', padding: '14px', radius: '12px', maxWidth: '68ch', use: 'Dense pages where a tinted block would be too loud. Border only.' },
    { name: 'Default', padding: '14px', radius: '12px', maxWidth: '68ch', use: 'Everything. Tinted fill plus a border.' },
    { name: 'With actions', padding: '14px', gap: '6px above actions', maxWidth: '68ch', use: 'Up to two actions. A third means it should be a dialog.' },
    { name: 'Callout', padding: '12px 16px', radius: '0 8px 8px 0', maxWidth: '68ch', use: 'Editorial emphasis inside prose. Left rule instead of a full border.' },
  ],

  do: [
    {
      title: 'Say what happened and what to do',
      why: 'An alert with no next step is a complaint. "Payment declined" plus "Update card" turns a dead end into a task the user can complete.',
      render: (
        <Alert
          tone="danger"
          title="Payment declined"
          actions={<Button size="sm" variant="danger">Update card</Button>}
        >
          Card ending 4242 was refused by the issuer.
        </Alert>
      ),
    },
    {
      title: 'Put it where the condition applies',
      why: 'A billing warning belongs on the billing page. A global banner on every screen is read once and then filtered out permanently.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-3">
          <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">Billing page</p>
          <Alert tone="warning" quiet title="Card expires next month" />
        </div>
      ),
    },
    {
      title: 'Pair the tone with an icon and a word',
      why: 'Colour alone fails in greyscale, for colour-blind users, and in High Contrast Mode. The icon and the title carry the severity independently.',
      render: (
        <span style={{ filter: 'grayscale(1)' }} className="block w-full">
          <Alert tone="danger" title="Payment declined">
            Still unmistakably an error with no colour at all.
          </Alert>
        </span>
      ),
    },
    {
      title: 'Only allow dismissal when it is honest',
      why: 'If the condition is still true after the alert is closed, the close button hides a real problem. Unresolved states should have no dismiss control.',
      render: (
        <Stack gap="sm" className="w-full">
          <Alert tone="info" title="New feature available" onDismiss={() => {}} />
          <Alert tone="danger" title="Payment declined — no dismiss" />
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not stack four alerts',
      why: 'A wall of banners pushes the actual content below the fold and guarantees none of them is read. Consolidate, or move the low-priority ones somewhere else.',
      render: (
        <Stack gap="sm" className="w-full">
          <MiniAlert tone="info" />
          <MiniAlert tone="warning" />
          <MiniAlert tone="accent" />
          <MiniAlert tone="danger" />
        </Stack>
      ),
    },
    {
      title: 'Do not use danger for something that is merely notable',
      why: 'Red means broken or irreversible. Spending it on "your trial ends in 14 days" means users stop believing red when a service actually fails.',
      render: (
        <Alert tone="danger" title="Your trial ends in 14 days">
          Nothing is broken. Nothing needs doing today.
        </Alert>
      ),
    },
    {
      title: 'Do not put a form inside an alert',
      why: 'An alert states a condition. Once it contains inputs it is a task surface, and it should be a card, a section, or a dialog with proper form semantics.',
      render: (
        <Alert tone="warning" title="Verify your email">
          <div className="mt-2 flex gap-2">
            <input
              className="h-8 flex-1 rounded-[var(--radius-md)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] px-2.5 text-body-sm"
              placeholder="Confirmation code"
            />
            <Button size="sm">Verify</Button>
          </div>
        </Alert>
      ),
    },
    {
      title: 'Do not use role="alert" for non-urgent messages',
      why: 'role="alert" interrupts a screen reader mid-sentence. Using it for a success message makes the product hostile to listen to.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;div role="alert"&gt;Saved successfully&lt;/div&gt;
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'Title and body sit on a tint, so both must be verified against the composited colour, not against the raw surface.',
      'The icon uses the -text token because it sits on the tint. Using the solid tone colour there lands around 3:1 and fails.',
      'The border must reach 3:1 — it is the boundary that makes the alert a distinct region.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the actions and the dismiss button. The alert body itself is not focusable.' },
      { keys: 'Enter / Space', does: 'Activates the focused action.' },
      { keys: 'Esc', does: 'Does nothing. An alert is in-flow, not an overlay — Escape belongs to dialogs.' },
    ],
    aria: [
      { attr: 'role="alert"', on: 'Danger only', note: 'Interrupts immediately. Correct for errors, hostile for anything else.' },
      { attr: 'role="status"', on: 'Info, success, warning', note: 'Waits for a natural pause in the screen reader’s output.' },
      { attr: 'aria-live', on: 'The container', note: 'assertive for danger, polite for everything else. Must be in the DOM before the content changes, or nothing is announced.' },
      { attr: 'aria-labelledby', on: 'The alert', note: 'Points at the title, so the alert has a name in the landmarks list.' },
      { attr: 'aria-label', on: 'The dismiss button', note: '"Dismiss payment warning", not just "Dismiss". A page with three alerts needs three distinct names.' },
    ],
    focus:
      'After a failed form submit, move focus to the error summary alert with tabIndex={-1}. It is the one case where an alert should take focus, and it saves keyboard users from hunting for what went wrong.',
    screenReader: [
      'A live region must exist in the DOM before its content changes. Rendering the whole alert at once means many screen readers announce nothing.',
      'Do not announce a static alert that was present on page load — it is read in normal document order and a live region would duplicate it.',
      'Keep the title short and put it first. Screen-reader users hear the whole alert; front-loading the point matters more than in visual reading.',
    ],
    touch:
      'The dismiss button is 28px visually and padded to 44px on coarse pointers. Keep it clear of the action buttons so a mis-tap does not dismiss instead of acting.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Alert } from '@/ui/Feedback'

// Persistent condition with a next step
<Alert
  tone="danger"
  title="Payment declined"
  actions={<Button size="sm" variant="danger" onClick={updateCard}>Update card</Button>}
>
  Card ending 4242 was refused. Services pause in 3 days.
</Alert>

// Dismissible — only when dismissing is honest
<Alert tone="info" title="New: deployment previews" onDismiss={() => setSeen(true)}>
  Every pull request now gets its own URL.
</Alert>

// Form error summary. Focus it after a failed submit.
const summaryRef = useRef<HTMLDivElement>(null)

async function onSubmit(e) {
  e.preventDefault()
  const errs = validate(values)
  if (Object.keys(errs).length) {
    setErrors(errs)
    summaryRef.current?.focus()      // saves keyboard users from hunting
    return
  }
  await save(values)
}

<div ref={summaryRef} tabIndex={-1}>
  <Alert tone="danger" title={count + ' fields need attention'}>
    <ul>{fields.map((f) => <li key={f.id}><a href={'#' + f.id}>{f.label}</a> — {f.error}</li>)}</ul>
  </Alert>
</div>`,
    },
    html: {
      lang: 'html',
      code: `<!-- Danger: interrupts -->
<div class="ds-alert ds-alert--danger" role="alert" aria-live="assertive">
  <svg class="ds-alert__icon" aria-hidden="true">…</svg>
  <div class="ds-alert__content">
    <p class="ds-alert__title">Payment declined</p>
    <p class="ds-alert__body">Card ending 4242 was refused by the issuer.</p>
    <div class="ds-alert__actions">
      <button class="ds-btn ds-btn--danger ds-btn--sm">Update card</button>
    </div>
  </div>
  <button class="ds-alert__dismiss" aria-label="Dismiss payment warning">
    <svg aria-hidden="true">…</svg>
  </button>
</div>

<!-- Everything else: waits for a pause -->
<div class="ds-alert ds-alert--success" role="status" aria-live="polite">…</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-alert {
  display: flex;
  gap: 12px;                         /* the icon gutter */
  padding: 14px;
  border: 1px solid;
  border-radius: var(--radius-lg);
}

/* A 14% tint, not a solid. Body text cannot reach 4.5:1 on a solid
   status colour in both themes. */
.ds-alert--danger {
  background: var(--ds-danger-subtle);
  border-color: var(--ds-danger-border);
}
.ds-alert--danger .ds-alert__icon { color: var(--ds-danger-text); }

.ds-alert__title { font-size: 13px; font-weight: 540; color: var(--ds-fg); }

/* Body stays neutral — colouring the whole message reduces legibility
   and overstates the severity. */
.ds-alert__body {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ds-fg-secondary);
}

.ds-alert__actions { display: flex; gap: 8px; margin-block-start: 6px; }

/* Quiet: keep the border, drop the fill */
.ds-alert--quiet { background: var(--ds-surface); }

/* High Contrast Mode removes the tint — the border is the fallback */
@media (forced-colors: active) {
  .ds-alert { border: 1px solid CanvasText; }
}`,
    },
    api: [
      {
        name: 'Alert',
        props: [
          { name: 'tone', type: "'info' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral'", default: "'info'", description: 'Also selects the icon and the ARIA role.' },
          { name: 'title', type: 'ReactNode', description: 'Short and first. Screen-reader users hear the whole alert.' },
          { name: 'children', type: 'ReactNode', description: 'Body copy. Rendered in neutral foreground, not the tone colour.' },
          { name: 'actions', type: 'ReactNode', description: 'Up to two. A third means this should be a dialog.' },
          { name: 'onDismiss', type: '() => void', description: 'Adds a close button. Omit when the condition is unresolved.' },
          { name: 'icon', type: 'ReactNode', description: 'Overrides the tone icon. Keep it at 17px.' },
          { name: 'quiet', type: 'boolean', default: 'false', description: 'Removes the tinted fill, keeps the border. For dense pages.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the action label before the message. If you cannot name a next step, the alert probably should not exist.',
      'For an alert that appears after page load, render the live region first and populate it a tick later — otherwise many screen readers announce nothing.',
      'Consolidate related conditions into one alert with a list. Three separate warnings about the same domain is three times the noise for the same information.',
      'Give dismissals a lifetime. "Do not show again" belongs in preferences; a session dismissal that reappears tomorrow is usually the right default.',
    ],
    performance: [
      'An alert inserted at the top of a page shifts everything below it. Reserve the space or animate it in, or you get a large cumulative layout shift score.',
      'Do not poll for conditions on an interval just to keep an alert current. Push the state change and re-render once.',
      'A live region that re-renders on every keystroke floods the screen-reader queue. Debounce anything driven by input.',
    ],
    mistakes: [
      'Using role="alert" for success messages, so the screen reader interrupts the user to say "Saved".',
      'Rendering the live region and its content at the same moment, so nothing is announced at all.',
      'Colouring the entire message body in the tone colour, which reduces legibility and makes every alert feel like an emergency.',
      'Putting a dismiss button on a condition that is still true, so the problem is hidden rather than resolved.',
      'Global banners that appear on every page. They are read once, then permanently filtered out.',
    ],
    realWorld: [
      'Count the alerts on your busiest screen. More than two at once almost always means the information architecture is doing the alerting instead of the design.',
      'Alert fatigue is real and measurable: track dismissal rate versus action rate. An alert dismissed 95% of the time is noise, not information.',
      'For system-wide incidents, use one persistent banner in the app shell with a link to a status page, and keep the page-level alerts for things the user can actually act on.',
      'Error summaries at the top of long forms materially improve completion rates. It is one of the highest-return accessibility patterns there is.',
    ],
  },
})

function MiniAlert({ tone }: { tone: Tone }) {
  return (
    <div className="w-full max-w-[13rem]">
      <Alert tone={tone} title={COPY[tone].title} />
    </div>
  )
}
