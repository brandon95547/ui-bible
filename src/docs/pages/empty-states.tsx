import * as React from 'react'
import { FolderPlus, Inbox, SearchX, ShieldOff, Sparkles, Wifi } from 'lucide-react'
import { EmptyState } from '@/ui/Feedback'
import { Button } from '@/ui/Button'
import { Card } from '@/ui/Surface'
import { Knob, KnobSelect, PreviewStage, Stack, defineDoc } from '../framework/kit'

type Kind = 'first-run' | 'no-results' | 'cleared' | 'no-access' | 'error'

const SPECS: Record<Kind, { icon: React.ReactNode; title: string; description: string; action: string; secondary?: string; tone?: 'neutral' | 'danger' }> = {
  'first-run': {
    icon: <FolderPlus size={22} />,
    title: 'No projects yet',
    description:
      'A project holds your services, environments and deployments. Most teams start with one per repository.',
    action: 'Create a project',
    secondary: 'Import from GitHub',
  },
  'no-results': {
    icon: <SearchX size={22} />,
    title: 'No deployments match “gateway-v3”',
    description: 'Try a shorter search term, or clear the environment filter to widen the results.',
    action: 'Clear filters',
    secondary: 'Clear search',
  },
  cleared: {
    icon: <Inbox size={22} />,
    title: 'Inbox zero',
    description: 'Everything is handled. New incidents will appear here as they are opened.',
    action: 'View resolved',
  },
  'no-access': {
    icon: <ShieldOff size={22} />,
    title: 'You do not have access to this project',
    description:
      'Ask an administrator to add you, or switch to a workspace you are a member of.',
    action: 'Request access',
    secondary: 'Switch workspace',
  },
  error: {
    icon: <Wifi size={22} />,
    title: 'Could not load deployments',
    description: 'The request timed out after 10 seconds. Your connection may be unstable.',
    action: 'Try again',
    tone: 'danger',
  },
}

function Playground() {
  const [kind, setKind] = React.useState<Kind>('first-run')
  const spec = SPECS[kind]

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={280}
      controls={
        <Knob label="Kind">
          <KnobSelect
            value={kind}
            onChange={setKind}
            options={['first-run', 'no-results', 'cleared', 'no-access', 'error'] as const}
          />
        </Knob>
      }
      code={`<EmptyState
  icon={<FolderPlus size={22} />}
  title="${spec.title}"
  description="${spec.description}"
  action={<Button>${spec.action}</Button>}${spec.secondary ? `\n  secondaryAction={<Button variant="text">${spec.secondary}</Button>}` : ''}
/>`}
    >
      <Card className="w-full" padding="none">
        <EmptyState
          icon={spec.icon}
          tone={spec.tone}
          title={spec.title}
          description={spec.description}
          action={<Button>{spec.action}</Button>}
          secondaryAction={
            spec.secondary ? <Button variant="text">{spec.secondary}</Button> : undefined
          }
        />
      </Card>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'empty-states',
    title: 'Empty States',
    tagline:
      'The most expensive screen in a product is the one with nothing on it and no way forward. Four different kinds of empty, four different jobs.',
    keywords: ['zero state', 'blank', 'no data', 'onboarding', 'no results', 'first run'],
  },

  overview: {
    purpose:
      'An empty state explains why a region has no content and offers the single most useful next action. It is the highest-leverage screen in a product for first-time users, because it is the first thing they see and the only guidance they get before they have any data of their own.',
    whenToUse: [
      'First run: the user has not created anything yet and needs to know what to create.',
      'No results: a search or filter matched nothing, and the user needs a way to widen it.',
      'Cleared: the user has finished everything, which is a success worth acknowledging.',
      'No access or error: the content exists but cannot be shown, and the user needs a route out.',
    ],
    whenNotToUse: [
      {
        text: 'The data is still loading.',
        instead: 'a Skeleton',
        to: '#/skeleton',
      },
      {
        text: 'The region is genuinely optional and empty is a normal, unremarkable state.',
        instead: 'nothing — collapse the region entirely',
      },
      {
        text: 'The failure needs a full page and a recovery path.',
        instead: 'an error page',
        to: '#/error-states',
      },
      {
        text: 'You are using it to sell an upgrade.',
        instead: 'an honest empty state; the upsell belongs elsewhere',
      },
    ],
    reasoning: (
      <>
        <p>
          Three parts, always in this order: <strong>what is here</strong> (icon),{' '}
          <strong>what that means</strong> (title and description), <strong>what to do next</strong>{' '}
          (action). Remove the third and you have built a dead end — a screen where the only
          available move is to leave.
        </p>
        <p>
          The four kinds need genuinely different copy.{' '}
          <strong>First run</strong> is an onboarding opportunity and should explain the concept, not
          just the button. <strong>No results</strong> is a filter problem and the action must widen
          rather than create. <strong>Cleared</strong> is a success and should feel like one.{' '}
          <strong>No access</strong> is a permissions problem and needs a route to the person who can
          fix it. Using the same generic "Nothing here" for all four wastes every one of them.
        </p>
        <p>
          Keep the illustration small. A 14px-tall icon in a tinted square does the job; a
          400px marketing illustration pushes the action below the fold on a laptop and makes an
          empty region feel even emptier. The action is the point, not the artwork.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'four-kinds',
        title: 'The four kinds',
        description:
          'Same component, four different jobs. Note how the action changes: create, widen, review, escalate.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-2">
              {(['first-run', 'no-results', 'cleared', 'no-access'] as Kind[]).map((k) => (
                <Card key={k} padding="none">
                  <EmptyState
                    compact
                    icon={SPECS[k].icon}
                    title={SPECS[k].title}
                    description={SPECS[k].description}
                    action={<Button size="sm">{SPECS[k].action}</Button>}
                  />
                </Card>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'inline',
        title: 'Inline and compact',
        description:
          'An empty table body, an empty sidebar section, an empty card. The compact variant halves the vertical padding so it does not dwarf its container.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)]">
                <div className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-4 py-2">
                  <span className="text-label-sm text-[var(--ds-fg-muted)]">Deployments</span>
                </div>
                <EmptyState
                  compact
                  icon={<SearchX size={18} />}
                  title="No results"
                  description="No deployments match the current filters."
                  action={<Button size="sm" variant="outlined">Clear filters</Button>}
                />
              </div>
              <div className="w-full max-w-xs rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-4">
                <p className="mb-2 text-label text-[var(--ds-fg)]">Recent activity</p>
                <p className="text-caption text-[var(--ds-fg-muted)]">
                  Nothing in the last 7 days.
                </p>
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'onboarding',
        title: 'First run as onboarding',
        description:
          'The most valuable empty state in any product. It gets read once, by every new user, at the exact moment they are deciding whether to continue.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Card className="w-full" padding="none">
              <div className="flex flex-col items-center gap-5 px-8 py-14 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-[var(--radius-xl)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] text-[var(--ds-accent-text)]">
                  <Sparkles size={22} />
                </span>
                <div className="flex max-w-md flex-col gap-2">
                  <h3 className="text-h3">Deploy your first service</h3>
                  <p className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
                    Connect a repository and we will build and deploy it on every push. Most teams
                    are live in under four minutes.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button>Connect a repository</Button>
                  <Button variant="outlined">Deploy a sample app</Button>
                </div>
                <a
                  href="#/empty-states"
                  className="text-caption text-[var(--ds-accent-text)] underline-offset-4 hover:underline"
                >
                  Read the two-minute quickstart
                </a>
              </div>
            </Card>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'First run', render: <MiniEmpty kind="first-run" /> },
      { label: 'No results', render: <MiniEmpty kind="no-results" /> },
      { label: 'Cleared', render: <MiniEmpty kind="cleared" /> },
      { label: 'No access', render: <MiniEmpty kind="no-access" /> },
      { label: 'Error', render: <MiniEmpty kind="error" /> },
      { label: 'Compact', render: <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"><EmptyState compact title="Nothing here" /></div> },
      { label: 'No icon', render: <div className="w-40"><EmptyState compact title="Inbox zero" description="Everything handled." /></div> },
      { label: 'No action', note: 'A dead end', render: <div className="w-40"><EmptyState compact icon={<Inbox size={16} />} title="Empty" /></div> },
    ],
  },

  anatomy: {
    render: (
      <Card className="w-full max-w-lg" padding="none">
        <EmptyState
          icon={<FolderPlus size={22} />}
          title="No projects yet"
          description="A project holds your services, environments and deployments."
          action={<Button>Create a project</Button>}
          secondaryAction={<Button variant="text">Import from GitHub</Button>}
        />
      </Card>
    ),
    caption:
      'Icon, title, description, primary action, secondary action. Everything is centred, and the whole block is capped at 24rem so it never spans a wide container.',
    parts: [
      {
        n: 1,
        label: 'Icon container',
        value: '56px, 16px radius',
        kind: 'size',
        note: 'A tinted square, not a large illustration. Big enough to anchor the block, small enough to keep the action above the fold.',
      },
      {
        n: 2,
        label: 'Vertical padding',
        value: '64px, 40px compact',
        kind: 'space',
        note: 'Generous, because the emptiness is the point — a cramped empty state reads as a rendering failure rather than a designed state.',
      },
      {
        n: 3,
        label: 'Title',
        value: '19px · text-h3',
        kind: 'type',
        note: 'A real heading element, so screen-reader users landing in the region understand it immediately.',
      },
      {
        n: 4,
        label: 'Description width',
        value: 'max 24rem',
        kind: 'size',
        note: 'About 45 characters per line. Centred text needs a narrower measure than left-aligned, because every line starts in a different place.',
      },
      {
        n: 5,
        label: 'Action gap',
        value: '16px below the text',
        kind: 'space',
        note: 'Close enough to read as the answer to the description. A large gap makes the action look like a separate, optional thing.',
      },
      {
        n: 6,
        label: 'Secondary action',
        value: 'Text variant, beside',
        kind: 'shape',
        note: 'One primary and at most one secondary. A third action turns guidance into a menu.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Icon container fill' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Icon container border' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Icon and description' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Icon fill on an onboarding state' },
    { category: 'color', token: '--ds-danger-subtle', usedFor: 'Icon fill on an error state' },
    { category: 'spacing', token: 'padding-y', value: '64px, 40px compact', usedFor: 'Vertical breathing room' },
    { category: 'spacing', token: 'gap', value: '16px, 12px compact', usedFor: 'Between icon, text and actions' },
    { category: 'radius', token: '--radius-xl', value: '16px', usedFor: 'Icon container' },
    { category: 'typography', token: '--text-h3', usedFor: 'Title' },
    { category: 'typography', token: '--text-body-sm', usedFor: 'Description' },
  ],

  sizes: [
    { name: 'Compact', padding: '40px 24px', gap: '12px', icon: '44px container', maxWidth: '24rem', use: 'Inside a table body, a card, or a sidebar section.' },
    { name: 'Default', padding: '64px 32px', gap: '16px', icon: '56px container', maxWidth: '24rem', use: 'A full page region — the main content area of a screen.' },
    { name: 'Onboarding', padding: '56px 32px', gap: '20px', icon: '56px container', maxWidth: '28rem', use: 'First run. Room for two actions and a documentation link.' },
    { name: 'Inline', padding: '12px 0', use: 'One line of muted text. No icon, no action, for genuinely unremarkable emptiness.' },
  ],

  do: [
    {
      title: 'Always give one clear next action',
      why: 'An empty state without an action is a dead end. The user came here to do something; tell them what that something is.',
      render: (
        <div className="w-full">
          <EmptyState
            compact
            icon={<FolderPlus size={18} />}
            title="No projects yet"
            action={<Button size="sm">Create a project</Button>}
          />
        </div>
      ),
    },
    {
      title: 'Distinguish "no results" from "no data"',
      why: 'They need opposite actions. No results should widen the filter; no data should create the first item. Showing "Create a project" when a search failed is actively unhelpful.',
      render: (
        <Stack gap="sm" className="w-full text-caption">
          <span className="text-[var(--ds-fg-secondary)]">
            No data → <span className="text-[var(--ds-success-text)]">Create a project</span>
          </span>
          <span className="text-[var(--ds-fg-secondary)]">
            No results → <span className="text-[var(--ds-success-text)]">Clear filters</span>
          </span>
        </Stack>
      ),
    },
    {
      title: 'Echo the search term back',
      why: '"No deployments match gateway-v3" confirms what was searched. "No results" leaves the user wondering whether their query even registered.',
      render: (
        <div className="w-full">
          <EmptyState
            compact
            icon={<SearchX size={18} />}
            title="No deployments match “gateway-v3”"
            description="Try a shorter term, or clear the environment filter."
          />
        </div>
      ),
    },
    {
      title: 'Treat first run as onboarding',
      why: 'It is read once, by every new user, at the moment they decide whether to continue. Explain the concept, not just the button — this is the highest-leverage copy in the product.',
      render: (
        <div className="w-full text-center">
          <p className="text-label text-[var(--ds-fg)]">Deploy your first service</p>
          <p className="mt-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            Connect a repository and we build and deploy on every push.
          </p>
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not leave a dead end',
      why: 'A grey box saying "No data" gives the user nothing. They cannot tell whether something is broken, whether they lack permission, or what they should do.',
      render: (
        <div className="grid h-24 w-full place-items-center rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          <span className="text-caption text-[var(--ds-fg-muted)]">No data</span>
        </div>
      ),
    },
    {
      title: 'Do not use a huge illustration',
      why: 'A 400px graphic pushes the action below the fold on a laptop and makes an already-empty region feel emptier. The action is the point.',
      render: (
        <div className="flex w-full flex-col items-center gap-2">
          <div className="h-28 w-40 rounded-[var(--radius-lg)] bg-[var(--ds-layer-active)]" />
          <span className="text-caption text-[var(--ds-fg-muted)]">…action is somewhere below</span>
        </div>
      ),
    },
    {
      title: 'Do not be cute at the wrong moment',
      why: 'Whimsy is fine on inbox zero. It is grating on a permissions failure, where the user is blocked and wants a route to whoever can unblock them.',
      render: (
        <div className="w-full text-center">
          <p className="text-label text-[var(--ds-fg)]">Oops! Nothing to see here 🙈</p>
          <p className="mt-1 text-caption text-[var(--ds-danger-text)]">
            …the user has been denied access to their own project
          </p>
        </div>
      ),
    },
    {
      title: 'Do not show an empty state while loading',
      why: '"No projects yet" flashing before the data arrives tells the user their work has been deleted. Distinguish loading from empty, always.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          loading → “No projects yet” → 12 projects
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The description uses --ds-fg-muted, the tightest pair in the system at 4.6:1. Do not go lighter for a "softer" empty state.',
      'The icon is decorative and exempt, but if it carries meaning — an error icon — it must reach 3:1.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the primary and secondary actions. The block itself is not focusable.' },
      { keys: 'Enter', does: 'Activates the focused action.' },
    ],
    aria: [
      { attr: '<h2> or <h3>', on: 'The title', note: 'A real heading, so the region has an entry in the document outline.' },
      { attr: 'aria-hidden="true"', on: 'The icon', note: 'Decorative. The title carries the meaning.' },
      { attr: 'role="status"', on: 'A no-results state', note: 'So the change from 12 results to 0 is announced after a filter or search.' },
      { attr: 'aria-live="polite"', on: 'The results region', note: 'Announce the count, not the whole empty state, on every filter change.' },
    ],
    focus:
      'After a search returns nothing, keep focus in the search field. Moving it to the empty state means the user has to tab back to correct their query.',
    screenReader: [
      'A sighted user sees the list is empty at a glance. A screen-reader user needs to be told — announce "No results" through the live region on the results container.',
      'The heading gives the region a name in the landmarks list, which is how screen-reader users navigate between regions.',
      'Do not announce the description as well as the title on every filter change. The title alone is enough.',
    ],
    touch:
      'The primary action must be at least 44px and centred, which puts it in easy reach on mobile. Keep the secondary action below rather than beside it on narrow screens.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { EmptyState } from '@/ui/Feedback'

// Always distinguish the four kinds — they need different actions
function DeploymentList({ items, query, filters, loading, error }) {
  if (loading) return <DeploymentSkeletons />          // never "empty"
  if (error) return <ErrorState error={error} onRetry={refetch} />

  if (items.length === 0) {
    const filtered = query || filters.length > 0

    return filtered ? (
      <EmptyState
        icon={<SearchX size={22} />}
        title={'No deployments match “' + query + '”'}
        description="Try a shorter term, or clear the environment filter."
        action={<Button onClick={clearFilters}>Clear filters</Button>}
      />
    ) : (
      <EmptyState
        icon={<FolderPlus size={22} />}
        title="No deployments yet"
        description="Connect a repository and we will build and deploy on every push."
        action={<Button onClick={connect}>Connect a repository</Button>}
        secondaryAction={<Button variant="text" onClick={demo}>Deploy a sample</Button>}
      />
    )
  }

  return <List items={items} />
}

// Announce the change for screen-reader users
<div aria-live="polite" className="sr-only">
  {items.length === 0 ? 'No results' : items.length + ' results'}
</div>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-empty" role="status">
  <span class="ds-empty__icon" aria-hidden="true">
    <svg>…</svg>
  </span>
  <h3 class="ds-empty__title">No projects yet</h3>
  <p class="ds-empty__desc">
    A project holds your services, environments and deployments.
  </p>
  <div class="ds-empty__actions">
    <button class="ds-btn ds-btn--filled">Create a project</button>
    <button class="ds-btn ds-btn--text">Import from GitHub</button>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 32px;                  /* the emptiness is the point */
  text-align: center;
}
.ds-empty--compact { gap: 12px; padding: 40px 24px; }

.ds-empty__icon {
  display: grid;
  place-items: center;
  inline-size: 56px;
  block-size: 56px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--ds-border-subtle);
  background: var(--ds-surface-inset);
  color: var(--ds-fg-muted);
}

.ds-empty__title { font-size: 1.1875rem; font-weight: 600; }

/* Centred text needs a narrower measure — every line starts somewhere new */
.ds-empty__desc {
  max-inline-size: 24rem;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ds-fg-muted);
}

.ds-empty__actions { display: flex; gap: 8px; margin-block-start: 4px; }

/* Stack the actions on narrow screens rather than shrinking them */
@media (max-width: 480px) {
  .ds-empty__actions { flex-direction: column; inline-size: 100%; }
  .ds-empty__actions > * { inline-size: 100%; }
}`,
    },
    api: [
      {
        name: 'EmptyState',
        props: [
          { name: 'title', type: 'string', required: true, description: 'Rendered as a real heading. Say what is empty and why.' },
          { name: 'description', type: 'ReactNode', description: 'One or two sentences. Capped at 24rem.' },
          { name: 'icon', type: 'ReactNode', description: 'Small and decorative. Not an illustration.' },
          { name: 'action', type: 'ReactNode', description: 'The one thing to do next. Omitting it creates a dead end.' },
          { name: 'secondaryAction', type: 'ReactNode', description: 'At most one. A third turns guidance into a menu.' },
          { name: 'tone', type: "'neutral' | 'danger'", default: "'neutral'", description: 'danger tints the icon container for a failure state.' },
          { name: 'compact', type: 'boolean', default: 'false', description: 'Halves the vertical padding. For use inside a card or table.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the empty state before you write the list. It forces you to articulate what the feature is for, and that sentence is usually the best copy in the product.',
      'For a first-run state, offer a sample or a template alongside the real action. "Deploy a sample app" converts far better than a blank form.',
      'Keep the search term in the title but truncate it at about 40 characters, or a pasted paragraph breaks the layout.',
      'Inbox-zero states are one of the few places where a small piece of personality is genuinely welcome. Use it there and nowhere else.',
    ],
    performance: [
      'Do not fetch anything from an empty state. It is often rendered dozens of times as filters change, and each render should be free.',
      'Preload the destination of the primary action. The user is very likely to press it, and it is usually the heaviest route in the app.',
      'Avoid animating the empty state in. It appears after a load and after every failed filter; animation makes both feel slower.',
    ],
    mistakes: [
      'Rendering the empty state while loading, which tells the user their data is gone.',
      'The same generic copy for "no data" and "no results", so the action is wrong in one of the two cases.',
      'No action at all, leaving the user with nowhere to go.',
      'Moving focus into the empty state after a search, so the user has to tab back to fix their query.',
      'A large illustration that pushes the action below the fold on a laptop.',
    ],
    realWorld: [
      'Empty states are the highest-converting onboarding surface in most products, and usually the least designed. They are worth a dedicated review.',
      'Track how long new accounts sit at the first-run state. A long dwell time means the description is not explaining the concept.',
      'For a no-results state, log the query. A recurring failed search is either a missing feature or a vocabulary mismatch, and both are cheap to fix.',
      'When a filter combination can never return results, say so before the user applies it. Preventing the empty state beats designing it.',
    ],
  },
})

function MiniEmpty({ kind }: { kind: Kind }) {
  const s = SPECS[kind]
  return (
    <div className="w-40 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
      <EmptyState compact icon={s.icon} tone={s.tone} title={s.title.slice(0, 22)} />
    </div>
  )
}
