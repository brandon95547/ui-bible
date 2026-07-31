import * as React from 'react'
import { Copy, RefreshCw, ServerCrash, ShieldOff, Unplug, FileQuestion } from 'lucide-react'
import { Alert, EmptyState } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Surface'
import { Field, TextInput } from '@/ui/Input'
import { Cell, Knob, KnobSelect, PreviewStage, Stack, defineDoc } from '../framework/kit'

type Level = 'field' | 'form' | 'section' | 'page' | 'system'

const LEVELS: Record<Level, { title: string; body: string }> = {
  field: { title: 'Field', body: 'One input is wrong. Inline, next to the input, on blur.' },
  form: { title: 'Form', body: 'Submission failed. A summary at the top, focused, linking to each field.' },
  section: { title: 'Section', body: 'One region failed to load. The rest of the page still works.' },
  page: { title: 'Page', body: 'The whole route failed. Full-page state with a route out.' },
  system: { title: 'System', body: 'The service is degraded. Persistent banner plus a status link.' },
}

function Playground() {
  const [level, setLevel] = React.useState<Level>('section')

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={280}
      controls={
        <Knob label="Level">
          <KnobSelect
            value={level}
            onChange={setLevel}
            options={['field', 'form', 'section', 'page', 'system'] as const}
          />
        </Knob>
      }
    >
      <div className="w-full">
        {level === 'field' && (
          <div className="max-w-sm">
            <Field
              label="Work email"
              htmlFor="err-field"
              status="error"
              message="Enter an email that includes an @ — for example, ada@example.com"
            >
              <TextInput id="err-field" status="error" defaultValue="ada.example.com" />
            </Field>
          </div>
        )}

        {level === 'form' && (
          <div className="max-w-lg">
            <Alert tone="danger" title="2 fields need attention">
              <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
                <li>
                  <a href="#/error-states" className="text-[var(--ds-danger-text)] underline underline-offset-2">
                    Work email
                  </a>{' '}
                  — must include an @
                </li>
                <li>
                  <a href="#/error-states" className="text-[var(--ds-danger-text)] underline underline-offset-2">
                    Password
                  </a>{' '}
                  — at least 12 characters
                </li>
              </ul>
            </Alert>
          </div>
        )}

        {level === 'section' && (
          <Card padding="none" className="w-full">
            <div className="border-b border-[var(--ds-border-subtle)] px-5 py-3">
              <p className="text-label text-[var(--ds-fg)]">Recent deployments</p>
            </div>
            <EmptyState
              compact
              tone="danger"
              icon={<Unplug size={20} />}
              title="Could not load deployments"
              description="The request timed out after 10 seconds. The rest of this page is unaffected."
              action={
                <Button size="sm" startIcon={<RefreshCw />}>
                  Try again
                </Button>
              }
            />
          </Card>
        )}

        {level === 'page' && (
          <Card padding="none" className="w-full">
            <EmptyState
              tone="danger"
              icon={<ServerCrash size={22} />}
              title="Something went wrong on our end"
              description="We have logged this and the team has been notified. Nothing you did caused it."
              action={<Button startIcon={<RefreshCw />}>Reload the page</Button>}
              secondaryAction={<Button variant="text">Back to dashboard</Button>}
            />
            <div className="border-t border-[var(--ds-border-subtle)] px-6 py-3 text-center">
              <span className="inline-flex items-center gap-2 font-mono text-caption text-[var(--ds-fg-muted)]">
                Error 4f21c-8821-9de3
                <Button size="xs" variant="text" startIcon={<Copy />}>
                  Copy
                </Button>
              </span>
            </div>
          </Card>
        )}

        {level === 'system' && (
          <div className="w-full">
            <Alert
              tone="danger"
              title="Deployments are degraded"
              actions={
                <>
                  <Button size="sm" variant="danger-outline">
                    View status page
                  </Button>
                  <Button size="sm" variant="text">
                    Subscribe to updates
                  </Button>
                </>
              }
            >
              Builds are queuing rather than failing. Estimated recovery 14:30 UTC.
            </Alert>
          </div>
        )}

        <p className="mt-4 text-caption text-[var(--ds-fg-muted)]">{LEVELS[level].body}</p>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'error-states',
    title: 'Error States',
    group: 'Feedback',
    tagline:
      'Five levels, from a single field to a whole system. Every one of them has to answer the same three questions: what happened, whose fault it is, and what to do now.',
    keywords: ['404', '500', 'failure', 'validation', 'retry', 'recovery', 'offline', 'error boundary'],
  },

  overview: {
    purpose:
      'An error state turns a failure into a decision. The user came here to do something and cannot; the design’s job is to say clearly what went wrong, reassure them where reassurance is honest, and give them the shortest route to trying again or getting help.',
    whenToUse: [
      'A request failed and the user needs to know that the data on screen is stale or missing.',
      'Validation failed and the user must correct something before continuing.',
      'A route, resource, or permission does not resolve.',
      'A service is degraded and the user should know before they start work that will fail.',
    ],
    whenNotToUse: [
      {
        text: 'The operation succeeded but returned nothing.',
        instead: 'an Empty State',
        to: '#/empty-states',
      },
      {
        text: 'The request is still in flight.',
        instead: 'a Loading State',
        to: '#/loading-states',
      },
      {
        text: 'The problem is recoverable silently — a retry that will succeed.',
        instead: 'retrying, and only surfacing the error if it keeps failing',
      },
      {
        text: 'To blame the user for something the interface allowed.',
        instead: 'preventing the invalid state in the first place',
      },
    ],
    reasoning: (
      <>
        <p>
          Match the <strong>scope of the error to the scope of the failure</strong>. One widget
          timing out should not blank the page; one invalid field should not show a page-level
          banner. Over-escalating trains users to ignore your errors, and under-escalating leaves
          them staring at stale data believing it is current.
        </p>
        <p>
          Every message answers three questions. <strong>What happened</strong> in plain language —
          not a stack trace, not "an error occurred". <strong>Whose fault</strong> — if it is ours,
          say so; users are dramatically more patient when they are not being blamed.{' '}
          <strong>What now</strong> — a retry, a route back, or a way to contact support with a
          reference the user can actually copy.
        </p>
        <p>
          Preserve the user’s work. A failed submit must never clear the form; a failed navigation
          must never lose the draft. The single most damaging thing an error state can do is turn a
          recoverable failure into lost input, and it is entirely a design decision.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'levels',
        title: 'The five levels',
        description:
          'Scope the treatment to the failure. Each of these is the right answer at one level and wrong at every other.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              <table className="w-full border-collapse text-body-sm">
                <tbody>
                  {(Object.keys(LEVELS) as Level[]).map((k) => (
                    <tr key={k} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                      <td className="w-24 px-3 py-2.5 text-label text-[var(--ds-fg)]">
                        {LEVELS[k].title}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--ds-fg-muted)]">{LEVELS[k].body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'copy',
        title: 'Writing the message',
        description:
          'The same failure, written two ways. The difference is not tone — it is whether the user knows what to do next.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Useful" tone="good">
                <Alert tone="danger" title="Could not save your changes">
                  The connection dropped after 8 seconds. Your edits are still here — press Save to
                  try again.
                </Alert>
              </Cell>
              <Cell label="Useless" tone="bad">
                <Alert tone="danger" title="Error">
                  An error occurred. Error code: 0x80070005
                </Alert>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'common',
        title: 'The common failures',
        description:
          'Four errors that every product ships. Each one gets a specific message and a specific route out.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              {(
                [
                  [<FileQuestion size={20} key="a" />, 'Page not found', 'This URL does not match anything. It may have been renamed or deleted.', 'Back to dashboard'],
                  [<ServerCrash size={20} key="b" />, 'Something went wrong on our end', 'We have logged this and the team has been notified.', 'Reload the page'],
                  [<ShieldOff size={20} key="c" />, 'You do not have access', 'Ask an administrator to grant you the deploy:read scope.', 'Request access'],
                  [<Unplug size={20} key="d" />, 'You are offline', 'Changes are saved locally and will sync when you reconnect.', 'Retry now'],
                ] as const
              ).map(([icon, title, desc, action]) => (
                <Card key={title as string} padding="none">
                  <EmptyState
                    compact
                    tone="danger"
                    icon={icon}
                    title={title as string}
                    description={desc as string}
                    action={<Button size="sm">{action as string}</Button>}
                  />
                </Card>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'partial',
        title: 'Partial failure',
        description:
          'One widget failed; the rest of the dashboard is fine. Blanking the whole page for one failed request is the most common over-escalation there is.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-3 sm:grid-cols-3">
              {['Requests', 'Error rate', 'p95 latency'].map((label, i) => (
                <Card key={label} padding="sm">
                  <p className="text-caption uppercase tracking-wider text-[var(--ds-fg-muted)]">
                    {label}
                  </p>
                  {i === 1 ? (
                    <div className="mt-2 flex flex-col items-start gap-1.5">
                      <span className="text-body-sm text-[var(--ds-danger-text)]">Unavailable</span>
                      <Button size="xs" variant="text" startIcon={<RefreshCw />}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2 text-h2 tabular-nums text-[var(--ds-fg)]">
                      {i === 0 ? '1.24M' : '184ms'}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Field', render: <div className="w-40"><TextInput status="error" defaultValue="ada.example" /></div> },
      { label: 'Inline message', render: <span className="text-caption text-[var(--ds-danger-text)]">Must include an @</span> },
      { label: 'Form summary', render: <div className="w-44"><Alert tone="danger" title="2 fields need attention" /></div> },
      { label: 'Section', render: <div className="w-44 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"><EmptyState compact tone="danger" icon={<Unplug size={16} />} title="Failed to load" /></div> },
      { label: 'Page', render: <div className="w-44"><EmptyState compact tone="danger" icon={<ServerCrash size={16} />} title="Server error" /></div> },
      { label: 'System banner', render: <div className="w-44"><Alert tone="danger" title="Service degraded" /></div> },
      { label: 'Offline', render: <div className="w-44"><Alert tone="warning" title="You are offline" /></div> },
      { label: 'Retrying', render: <span className="inline-flex items-center gap-1.5 text-caption text-[var(--ds-fg-muted)]"><RefreshCw size={12} className="animate-[spin_720ms_linear_infinite]" /> Retrying…</span> },
      { label: 'Retry failed', render: <span className="text-caption text-[var(--ds-danger-text)]">Failed 3 times</span> },
      { label: 'With reference', render: <span className="font-mono text-caption text-[var(--ds-fg-muted)]">4f21c-8821</span> },
      { label: 'Recovered', render: <span className="text-caption text-[var(--ds-success-text)]">Reconnected</span> },
      { label: 'Degraded data', note: 'Stale, not gone', render: <span className="text-caption text-[var(--ds-warning-text)]">Last updated 4m ago</span> },
    ],
  },

  anatomy: {
    render: (
      <Card padding="none" className="w-full max-w-lg">
        <EmptyState
          tone="danger"
          icon={<ServerCrash size={22} />}
          title="Something went wrong on our end"
          description="We have logged this and the team has been notified. Nothing you did caused it."
          action={<Button startIcon={<RefreshCw />}>Reload the page</Button>}
          secondaryAction={<Button variant="text">Back to dashboard</Button>}
        />
        <div className="border-t border-[var(--ds-border-subtle)] px-6 py-3 text-center">
          <span className="inline-flex items-center gap-2 font-mono text-caption text-[var(--ds-fg-muted)]">
            Error 4f21c-8821-9de3
            <Button size="xs" variant="text" startIcon={<Copy />}>
              Copy
            </Button>
          </span>
        </div>
      </Card>
    ),
    caption:
      'A page-level error. Icon, plain-language title, an explicit statement of fault, a primary recovery action, a route out, and a copyable reference.',
    parts: [
      {
        n: 1,
        label: 'Icon',
        value: 'Danger-tinted container',
        kind: 'color',
        note: 'Tinted, not solid. It signals severity without turning the whole screen into an emergency.',
      },
      {
        n: 2,
        label: 'Title',
        value: 'Plain language, no codes',
        kind: 'type',
        note: '"Something went wrong on our end", not "HTTP 500". The code belongs in the reference line, not the headline.',
      },
      {
        n: 3,
        label: 'Attribution',
        value: '"Nothing you did caused it"',
        kind: 'type',
        note: 'When the fault is ours, saying so measurably reduces frustration and support contact. When it is not, do not imply that it is.',
      },
      {
        n: 4,
        label: 'Primary action',
        value: 'Retry, not "OK"',
        kind: 'shape',
        note: 'The action that has the best chance of resolving it. "OK" acknowledges a failure without doing anything about it.',
      },
      {
        n: 5,
        label: 'Escape route',
        value: 'Secondary, always present',
        kind: 'shape',
        note: 'If the retry keeps failing, the user needs somewhere to go. An error page with one button that does not work is a trap.',
      },
      {
        n: 6,
        label: 'Reference',
        value: 'Monospace, copyable',
        kind: 'type',
        note: 'Selectable and with a copy button. A support reference the user has to transcribe from a screenshot is a reference nobody uses.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-danger-subtle', usedFor: 'Icon container, alert fill' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Alert border' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Icon and inline error text' },
    { category: 'color', token: '--ds-warning-subtle', usedFor: 'Degraded rather than failed' },
    { category: 'color', token: '--ds-fg', usedFor: 'Error title' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Explanation and reference' },
    { category: 'spacing', token: 'padding-y', value: '64px page, 40px section', usedFor: 'Vertical space' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Alert corners' },
    { category: 'typography', token: '--text-h3', usedFor: 'Page error title' },
    { category: 'typography', token: '--text-code', usedFor: 'Reference identifier' },
  ],

  sizes: [
    { name: 'Field', padding: '4px 0', type: '12px', use: 'Inline, below the input, with an icon and aria-describedby.' },
    { name: 'Form summary', padding: '14px', radius: '12px', maxWidth: '68ch', use: 'Top of the form, focusable, one link per invalid field.' },
    { name: 'Section', padding: '40px 24px', maxWidth: '24rem', use: 'Inside the failed region only. The rest of the page keeps working.' },
    { name: 'Page', padding: '64px 32px', maxWidth: '28rem', use: 'Full route failure. Primary retry plus a route out plus a reference.' },
    { name: 'System banner', padding: '14px', maxWidth: 'full', use: 'App shell, above the content, persistent until resolved.' },
  ],

  do: [
    {
      title: 'Say what happened in plain language',
      why: 'A status code is a fact about the protocol, not about the user’s situation. "The connection dropped after 8 seconds" is something a person can act on.',
      render: (
        <Alert tone="danger" title="Could not save your changes">
          The connection dropped after 8 seconds. Your edits are still here.
        </Alert>
      ),
    },
    {
      title: 'Preserve the user’s work',
      why: 'A failed submit that clears the form converts a five-second retry into ten minutes of retyping — and it is the single fastest way to lose a user permanently.',
      render: (
        <Stack gap="sm" className="w-full max-w-sm">
          <Alert tone="danger" quiet title="Save failed — your draft is intact" />
          <TextInput defaultValue="Still exactly what I typed" />
        </Stack>
      ),
    },
    {
      title: 'Give a copyable reference',
      why: 'Support needs the identifier. A reference the user has to transcribe from a screenshot is a reference that arrives wrong, or not at all.',
      render: (
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-2.5 py-1.5 font-mono text-caption text-[var(--ds-fg-secondary)]">
          4f21c-8821-9de3
          <Button size="xs" variant="text" startIcon={<Copy />}>
            Copy
          </Button>
        </span>
      ),
    },
    {
      title: 'Retry automatically before asking',
      why: 'Most transient failures resolve on the second attempt. Two silent retries with backoff removes the error from the user’s experience entirely.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          retry: 2, backoff: 300ms → 900ms
          <br />
          then surface the error
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not show a stack trace',
      why: 'It is unreadable to almost everyone, it leaks implementation detail, and it makes the product look broken rather than resilient. Log it; do not render it.',
      render: (
        <pre className="w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] p-2 font-mono text-[10px] leading-tight text-[var(--ds-danger-text)]">
{`TypeError: Cannot read properties of
  undefined (reading 'map')
  at DeployList (index-8f21c.js:4:19204)
  at renderWithHooks (react-dom.js:12:8813)`}
        </pre>
      ),
    },
    {
      title: 'Do not blame the user',
      why: '"Invalid input" and "You did something wrong" put the user on the defensive for a problem the interface allowed to happen. Describe the requirement instead.',
      render: (
        <Alert tone="danger" title="Invalid input">
          You entered an incorrect value. Please try again.
        </Alert>
      ),
    },
    {
      title: 'Do not blank the page for one failed request',
      why: 'Three of four widgets loaded fine. Replacing the whole dashboard with an error page throws away working content and hides which part actually failed.',
      render: (
        <div className="grid h-24 w-full place-items-center rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]">
          <span className="text-caption text-[var(--ds-danger-text)]">
            Whole page replaced because one chart timed out
          </span>
        </div>
      ),
    },
    {
      title: 'Do not offer a retry that cannot work',
      why: 'A 403 will still be a 403 on the second attempt. Offering Retry for a permissions failure wastes the user’s time and hides the real action, which is to request access.',
      render: (
        <div className="w-full">
          <EmptyState
            compact
            tone="danger"
            icon={<ShieldOff size={18} />}
            title="Access denied"
            action={<Button size="sm" startIcon={<RefreshCw />}>Try again</Button>}
          />
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '3.3.4', name: 'Error Prevention', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
    ],
    contrast: [
      'Error text on a tinted fill uses --ds-danger-text, the pair certified at 4.5:1. The solid danger colour there lands around 3:1 and fails.',
      'Never signal an error with a red border alone. The border plus an icon plus a message is the minimum.',
      'A red field border must reach 3:1 against the surface — it is a meaningful boundary under WCAG 1.4.11.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the retry and escape actions. Error text itself is not focusable.' },
      { keys: 'Enter', does: 'Activates the focused recovery action.' },
      { keys: 'Focus on submit failure', does: 'Move focus to the error summary, or to the first invalid field.' },
    ],
    aria: [
      { attr: 'role="alert"', on: 'Error messages', note: 'Interrupts. Correct here and almost nowhere else.' },
      { attr: 'aria-invalid="true"', on: 'The failing input', note: 'Announced on focus. Remove it as soon as the value becomes valid.' },
      { attr: 'aria-describedby', on: 'The input', note: 'Points at the error message so it is read with the field.' },
      { attr: 'aria-errormessage', on: 'The input', note: 'Newer and more precise than describedby for errors, though support is still uneven — use both.' },
      { attr: 'tabIndex={-1}', on: 'The error summary', note: 'Lets you move focus to it programmatically after a failed submit.' },
      { attr: 'aria-live="assertive"', on: 'A system banner', note: 'For an outage that appears while the user is working.' },
    ],
    focus:
      'On submit failure, move focus to the error summary and announce the count. Leaving focus on the submit button means a keyboard user has no idea anything happened.',
    screenReader: [
      'Announce the number of errors, not just that there was one: "3 fields need attention" tells the user how much work is ahead.',
      'Each field error must be reachable from the summary as a link. Hunting through a twenty-field form for the invalid one is a real barrier.',
      'Do not announce a failure repeatedly on every keystroke while the user is fixing it. Clear the error on input and re-validate on blur.',
    ],
    touch:
      'Recovery actions must be at least 44px and should be the largest thing on an error screen. On mobile, put Retry above the escape route rather than beside it.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// 1. Scope the boundary to the region, not the app
<ErrorBoundary fallback={<SectionError onRetry={refetch} />}>
  <DeploymentList />
</ErrorBoundary>

// 2. Retry transient failures silently before surfacing anything
const { data, error, refetch } = useQuery({
  queryKey: ['deployments'],
  queryFn: fetchDeployments,
  retry: (attempt, err) => err.status >= 500 && attempt < 2,
  retryDelay: (attempt) => 300 * 3 ** attempt,
})

// 3. Map the failure to a specific message and a possible action
function describe(err: ApiError) {
  switch (err.status) {
    case 403: return { title: 'You do not have access',
                       body: 'Ask an administrator for the deploy:read scope.',
                       action: 'request-access' }        // NOT retry
    case 404: return { title: 'This deployment no longer exists',
                       body: 'It may have been deleted.', action: 'back' }
    case 429: return { title: 'Too many requests',
                       body: 'Wait ' + err.retryAfter + 's and try again.', action: 'retry' }
    default:  return { title: 'Something went wrong on our end',
                       body: 'We have logged this.', action: 'retry' }
  }
}

// 4. Never clear the form on failure
async function onSubmit(values: Values) {
  try {
    await save(values)
  } catch (err) {
    setError(describe(err))      // values stay exactly as typed
    summaryRef.current?.focus()
  }
}`,
    },
    html: {
      lang: 'html',
      code: `<!-- Field level -->
<label for="email">Work email</label>
<input id="email" type="email" aria-invalid="true"
       aria-describedby="email-error" value="ada.example.com" />
<p id="email-error" role="alert" class="ds-field__error">
  Enter an email that includes an @ — for example, ada@example.com
</p>

<!-- Form summary: focusable, one link per invalid field -->
<div class="ds-alert ds-alert--danger" role="alert" tabindex="-1" id="summary">
  <p class="ds-alert__title">2 fields need attention</p>
  <ul>
    <li><a href="#email">Work email</a> — must include an @</li>
    <li><a href="#password">Password</a> — at least 12 characters</li>
  </ul>
</div>

<!-- Page level: reference must be selectable -->
<p class="ds-error__ref">
  Error <code>4f21c-8821-9de3</code>
  <button type="button" aria-label="Copy error reference">Copy</button>
</p>`,
    },
    css: {
      lang: 'css',
      code: `/* Field level: border + icon + message. Never colour alone. */
.ds-input[aria-invalid='true'] {
  border-color: var(--ds-danger-border);
}
.ds-input[aria-invalid='true']:focus {
  border-color: var(--ds-danger);
  box-shadow: 0 0 0 3px var(--ds-danger-subtle);
}

.ds-field__error {
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: var(--ds-danger-text);       /* certified against the tint */
}

/* The summary must be focusable but must not show a ring on click */
.ds-alert[tabindex='-1']:focus { outline: none; }
.ds-alert[tabindex='-1']:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* References are selectable by default and monospaced so characters
   like 0/O and 1/l are distinguishable when read aloud. */
.ds-error__ref code {
  font-family: var(--font-mono);
  user-select: all;
}

@media (forced-colors: active) {
  .ds-input[aria-invalid='true'] { border: 2px solid; }
}`,
    },
  },

  notes: {
    tips: [
      'Write the error copy at the same time as the happy path. Errors written afterwards are always generic, because by then nobody remembers what could go wrong.',
      'Include a timestamp on page-level errors. Support can correlate it with logs far faster than they can from a description.',
      'For offline, keep the app usable read-only and queue the writes. "You are offline, changes will sync" is a much better product than a modal that blocks everything.',
      'Distinguish "failed" from "stale". A chart showing four-minute-old data with a warning is more useful than an empty box.',
    ],
    performance: [
      'Error boundaries should wrap regions, not the app. One boundary at the root turns every component failure into a white screen.',
      'Cap retries and use exponential backoff. An aggressive retry loop against a struggling service is how a partial outage becomes a full one.',
      'Do not re-render the whole page on error. Keep the failed region isolated so the rest of the tree is untouched.',
      'Log errors with a sampled rate in production. A failing component in a virtualised list can otherwise emit thousands of identical reports per second.',
    ],
    mistakes: [
      'Clearing the form on submit failure, turning a five-second retry into ten minutes of retyping.',
      'Rendering the raw error message from the API, which is written for developers and often leaks internals.',
      'Offering Retry for a 403 or a 404, neither of which will change on a second attempt.',
      'One root-level error boundary, so any component failure blanks the entire application.',
      'Leaving focus on the submit button after a failed submit, so keyboard users are not told anything happened.',
    ],
    realWorld: [
      'Instrument which errors users actually see, not which ones are thrown. The two lists are very different, and the visible one is where the design effort belongs.',
      'A support reference that the user can copy reduces average resolution time more than almost any other single change to an error screen.',
      'For anything destructive that failed halfway, say explicitly what did and did not happen. "3 of 5 deleted" is far more useful than "Partially failed".',
      'Run a quarterly review of your error copy. It ages badly, and the generic strings written under deadline are still there years later.',
    ],
  },
})
