import * as React from 'react'
import { Home } from 'lucide-react'
import { Breadcrumbs } from '@/ui/Navigation'
import { Knob, KnobSelect, PreviewStage, Stack, defineDoc } from '../framework/kit'

const DEEP = [
  { label: 'Workspaces', href: '#/breadcrumbs' },
  { label: 'Acme Corporation', href: '#/breadcrumbs' },
  { label: 'Production', href: '#/breadcrumbs' },
  { label: 'api-gateway', href: '#/breadcrumbs' },
  { label: 'Deployments', href: '#/breadcrumbs' },
  { label: 'Build 4021' },
]

function Playground() {
  const [depth, setDepth] = React.useState<'2' | '3' | '4' | '6'>('4')
  const [maxItems, setMaxItems] = React.useState<'3' | '4' | '6'>('4')

  const items = DEEP.slice(DEEP.length - Number(depth))

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={120}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Depth">
            <KnobSelect value={depth} onChange={setDepth} options={['2', '3', '4', '6'] as const} />
          </Knob>
          <Knob label="Max items">
            <KnobSelect value={maxItems} onChange={setMaxItems} options={['3', '4', '6'] as const} />
          </Knob>
        </div>
      }
      code={`<Breadcrumbs
  maxItems={${maxItems}}
  items={[
    { label: 'Workspaces', href: '/' },
    { label: 'Acme Corporation', href: '/acme' },
    { label: 'api-gateway', href: '/acme/api-gateway' },
    { label: 'Build 4021' },          // current page — not a link
  ]}
/>`}
    >
      <div className="w-full">
        <Breadcrumbs items={items} maxItems={Number(maxItems)} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    tagline:
      'Location, not history. They answer "where am I in this hierarchy" and give a one-click route back up it — nothing more.',
    keywords: ['path', 'hierarchy', 'trail', 'wayfinding', 'ancestors', 'back'],
  },

  overview: {
    purpose:
      'Breadcrumbs show the user’s position in a hierarchy and make every ancestor reachable in one click. They exist because deep applications lose people: without them, going up one level means the browser back button, and the back button retraces steps rather than climbing a tree.',
    whenToUse: [
      'The content sits in a hierarchy at least three levels deep.',
      'Users arrive on deep pages directly, from search results, links or notifications.',
      'The parent context genuinely matters — which workspace, which project, which environment.',
      'Moving up a level is a common action.',
    ],
    whenNotToUse: [
      {
        text: 'The hierarchy is one or two levels deep.',
        instead: 'a single back link, or nothing at all',
      },
      {
        text: 'The navigation is flat — a set of peer sections.',
        instead: 'Tabs or Sidebar navigation',
        to: '#/tabs',
      },
      {
        text: 'You want to show the path the user took to get here.',
        instead: 'nothing — breadcrumbs are location, and a history trail confuses both',
      },
      {
        text: 'The page is a step in a linear flow.',
        instead: 'a stepper',
        to: '#/form',
      },
    ],
    reasoning: (
      <>
        <p>
          The single most misunderstood thing about breadcrumbs:{' '}
          <strong>they are not history</strong>. A breadcrumb trail describes where the page sits in
          the information architecture, and it is identical for every user who lands on that page.
          A trail that reflects how a particular user arrived is a different pattern, it is not
          shareable, and it does not answer the question users actually have.
        </p>
        <p>
          The <strong>last crumb is the current page and is not a link</strong>. It is full-contrast
          while every ancestor is muted, which is what makes the trail readable as "you are here,
          these are above you". A clickable final crumb that reloads the current page is a small
          broken promise.
        </p>
        <p>
          When the path is too long, collapse the <strong>middle</strong>. The root anchors the user
          and the last two crumbs tell them where they are; the levels in between are the least
          useful part of the path. Wrapping onto a second line is worse than collapsing — a
          wrapped breadcrumb reads as body text and stops functioning as a location indicator.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'depths',
        title: 'At every depth',
        description:
          'Two levels barely justifies the component. Four is the sweet spot. Six collapses the middle and keeps the row on one line.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              {[2, 3, 4, 6].map((n) => (
                <div key={n} className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-3">
                  <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                    {n} levels
                  </p>
                  <Breadcrumbs items={DEEP.slice(DEEP.length - n)} maxItems={4} />
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'with-header',
        title: 'In a page header',
        description:
          'The usual placement: above the page title, muted, on one line. It sets the context before the title names the thing.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-5">
              <Breadcrumbs
                items={[
                  { label: 'Acme Corporation', href: '#/breadcrumbs', icon: <Home size={12} /> },
                  { label: 'Production', href: '#/breadcrumbs' },
                  { label: 'api-gateway', href: '#/breadcrumbs' },
                  { label: 'Build 4021' },
                ]}
              />
              <h2 className="mt-2 text-h2 text-[var(--ds-fg)]">Build 4021</h2>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-muted)]">
                Deployed 4 minutes ago · 42 seconds · 3 regions
              </p>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'collapse',
        title: 'Collapsing',
        description:
          'Press the ellipsis to expand. Keeping the first and the last two is the pattern users recognise from file managers.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full max-w-md">
              <Breadcrumbs items={DEEP} maxItems={4} />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Link', render: <span className="text-caption text-[var(--ds-fg-muted)]">Production</span> },
      { label: 'Hover', render: <span className="text-caption text-[var(--ds-fg)]">Production</span> },
      { label: 'Focus', render: <span className="rounded-[var(--radius-xs)] px-1 text-caption outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">Production</span> },
      { label: 'Current', note: 'Not a link', render: <span className="text-caption font-medium text-[var(--ds-fg)]">Build 4021</span> },
      { label: 'Separator', render: <span className="text-[var(--ds-fg-disabled)]">›</span> },
      { label: 'Collapsed', render: <span className="grid h-5 w-5 place-items-center rounded-[var(--radius-xs)] text-[var(--ds-fg-muted)]">…</span> },
      { label: 'With icon', render: <span className="inline-flex items-center gap-1 text-caption text-[var(--ds-fg-muted)]"><Home size={12} /> Acme</span> },
      { label: 'Truncated', render: <span className="block w-20 truncate text-caption text-[var(--ds-fg-muted)]">A very long project name</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Breadcrumbs items={DEEP} maxItems={4} />
      </div>
    ),
    caption:
      'Root, collapsed middle, the last two levels, and the current page. Six levels rendered on one line in about 340px.',
    parts: [
      {
        n: 1,
        label: 'Type size',
        value: '12px · text-caption',
        kind: 'type',
        note: 'Deliberately small. Breadcrumbs are context, not content — they should be findable but never compete with the page title below them.',
      },
      {
        n: 2,
        label: 'Ancestor colour',
        value: '--ds-fg-muted',
        kind: 'color',
        note: 'Muted and underlined only on hover. A row of six blue underlined links is louder than the page it describes.',
      },
      {
        n: 3,
        label: 'Current page',
        value: '--ds-fg, 500 weight',
        kind: 'color',
        note: 'Full contrast, not a link, and marked aria-current="page". The contrast step is what makes the trail read as a position.',
      },
      {
        n: 4,
        label: 'Separator',
        value: '13px chevron, aria-hidden',
        kind: 'shape',
        note: 'Hidden from assistive tech. Without that, a screen reader announces "greater than" between every level.',
      },
      {
        n: 5,
        label: 'Collapse threshold',
        value: '4 items',
        kind: 'size',
        note: 'Keeps the first and the last two. The middle is the least useful part of a path, and collapsing beats wrapping.',
      },
      {
        n: 6,
        label: 'Gap',
        value: '4px around the separator',
        kind: 'space',
        note: 'Tight, so the whole trail reads as one string. Wide gaps make each crumb look like an independent link.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Ancestor links' },
    { category: 'color', token: '--ds-fg', usedFor: 'Current page' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Separators' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Ellipsis button hover' },
    { category: 'spacing', token: 'gap', value: '4px', usedFor: 'Between crumb and separator' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Every crumb' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Focus ring on a crumb' },
  ],

  sizes: [
    { name: 'Default', height: '20px', type: '12px', gap: '4px', maxWidth: '100%', use: 'Page headers. One line, always.' },
    { name: 'Per-crumb max', maxWidth: '16ch', use: 'Truncate long names with an ellipsis and a title attribute.' },
    { name: 'Collapse at', minWidth: '4 items', use: 'Above four levels, collapse the middle rather than wrapping.' },
    { name: 'Mobile', maxWidth: '100vw − 48px', use: 'Show the parent and the current page only, or a single back link.' },
  ],

  do: [
    {
      title: 'Make the last crumb the current page and not a link',
      why: 'It is the anchor that makes the rest of the trail meaningful. A clickable current page reloads the page the user is already on, which is a small broken promise.',
      render: (
        <Breadcrumbs
          items={[
            { label: 'Production', href: '#/breadcrumbs' },
            { label: 'api-gateway', href: '#/breadcrumbs' },
            { label: 'Build 4021' },
          ]}
        />
      ),
    },
    {
      title: 'Collapse the middle, not the end',
      why: 'The root gives orientation and the last two give position. The levels in between are the ones users least need, so they are the ones to hide.',
      render: <Breadcrumbs items={DEEP} maxItems={4} />,
    },
    {
      title: 'Use the real names, not the route segments',
      why: '"Acme Corporation › Production › api-gateway" is a location. "/w/8f21c/env/prod/svc/4021" is a URL, and it means nothing to the person reading it.',
      render: (
        <Stack gap="xs">
          <span className="text-caption text-[var(--ds-success-text)]">
            Acme Corporation › Production › api-gateway
          </span>
          <span className="font-mono text-[11px] text-[var(--ds-danger-text)]">
            /w/8f21c/env/prod/svc/4021
          </span>
        </Stack>
      ),
    },
    {
      title: 'Truncate individual crumbs, not the trail',
      why: 'One very long project name should shorten with an ellipsis and a title attribute. Dropping levels because one name is long loses structural information.',
      render: (
        <Breadcrumbs
          items={[
            { label: 'Acme', href: '#/breadcrumbs' },
            { label: 'A project with an extremely long name', href: '#/breadcrumbs' },
            { label: 'Build 4021' },
          ]}
        />
      ),
    },
  ],

  dont: [
    {
      title: 'Do not show history',
      why: 'Breadcrumbs describe where the page is, not how the user got here. A history trail differs per visitor, cannot be shared, and answers a question nobody asked.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          Dashboard › Search › Results › Settings › Build 4021
        </span>
      ),
    },
    {
      title: 'Do not wrap onto a second line',
      why: 'A wrapped trail reads as body copy and stops working as a location indicator. Collapse the middle instead — the row must stay on one line.',
      render: (
        <div className="w-44">
          <span className="text-caption leading-relaxed text-[var(--ds-danger-text)]">
            Workspaces › Acme Corporation › Production › api-gateway › Deployments › Build 4021
          </span>
        </div>
      ),
    },
    {
      title: 'Do not use breadcrumbs for a flat structure',
      why: 'If every page is one level deep, the trail is always "Home › Page". That is a title with extra chrome, and it takes up space that the title deserves.',
      render: (
        <Breadcrumbs items={[{ label: 'Home', href: '#/breadcrumbs' }, { label: 'Settings' }]} />
      ),
    },
    {
      title: 'Do not make breadcrumbs the primary navigation',
      why: 'They only go up. A user who wants a sibling — a different project in the same workspace — has to climb and then descend. That is what a sidebar is for.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          No sidebar, no top bar — just a trail
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A' },
      { id: '2.4.8', name: 'Location', level: 'AAA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Ancestor links use --ds-fg-muted at 12px, which sits at 4.6:1 — the floor. Do not go lighter to make them recede further.',
      'The separator is decorative and exempt, but it should still be visible enough to read as a separator rather than a rendering artefact.',
      'Hover must change more than the cursor. Ours moves the label to full foreground contrast.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through each ancestor link. The current page is not focusable.' },
      { keys: 'Enter', does: 'Navigates to the ancestor.' },
      { keys: 'Enter (on ellipsis)', does: 'Expands the collapsed middle in place.' },
    ],
    aria: [
      { attr: 'nav[aria-label="Breadcrumb"]', on: 'The container', note: 'Makes it a landmark, so screen-reader users can jump to it or skip it.' },
      { attr: '<ol> / <li>', on: 'The trail', note: 'An ordered list, because the order is the hierarchy. A row of spans conveys nothing.' },
      { attr: 'aria-current="page"', on: 'The last crumb', note: 'The value is "page", not "true". This is what identifies the current location.' },
      { attr: 'aria-hidden="true"', on: 'Separators', note: 'Otherwise a screen reader announces "greater than" between every level.' },
      { attr: 'aria-label', on: 'The ellipsis button', note: '"Show all breadcrumb levels", not a bare ellipsis.' },
      { attr: 'title', on: 'Truncated crumbs', note: 'Gives the full name on hover when the visible label is clipped.' },
    ],
    focus:
      'Standard focus ring at 4px radius. Because the crumbs are small and close together, the 2px offset matters — a flush ring on 12px text is very hard to see.',
    screenReader: [
      'Announced as "Breadcrumb, navigation, list of 4 items". The list structure is what gives the count and the position.',
      'The current page announces as "Build 4021, current page" thanks to aria-current. Without it, the last item is just another list item.',
      'Do not add "You are here" as visually hidden text. aria-current already says it, and duplicating it is verbose.',
    ],
    touch:
      'Crumbs are 12px text and need padding to reach a 44px target on touch. On narrow screens, prefer a single "‹ Production" back link over a full trail.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Breadcrumbs } from '@/ui/Navigation'

// Location, not history. Derived from the route, not from the visit.
<Breadcrumbs
  maxItems={4}
  items={[
    { label: workspace.name, href: '/w/' + workspace.id },
    { label: env.name,       href: '/w/' + workspace.id + '/' + env.id },
    { label: service.name,   href: serviceHref },
    { label: 'Build ' + build.number },      // no href = current page
  ]}
/>

// Derive from the route so the trail can never disagree with the page
function useBreadcrumbs() {
  const { workspace, env, service, build } = useRouteData()
  return useMemo(
    () =>
      [
        workspace && { label: workspace.name, href: workspaceHref(workspace) },
        env && { label: env.name, href: envHref(env) },
        service && { label: service.name, href: serviceHref(service) },
        build && { label: 'Build ' + build.number },
      ].filter(Boolean),
    [workspace, env, service, build],
  )
}

// Add structured data on public pages — search engines render it
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.label, item: it.href,
    })),
  })}
</script>`,
    },
    html: {
      lang: 'html',
      code: `<nav aria-label="Breadcrumb">
  <ol class="ds-breadcrumbs">
    <li>
      <a href="/w/acme">Acme Corporation</a>
      <svg aria-hidden="true" class="ds-breadcrumbs__sep">…</svg>
    </li>
    <li>
      <a href="/w/acme/prod">Production</a>
      <svg aria-hidden="true" class="ds-breadcrumbs__sep">…</svg>
    </li>
    <li>
      <span aria-current="page">Build 4021</span>
    </li>
  </ol>
</nav>`,
    },
    css: {
      lang: 'css',
      code: `.ds-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 4px;
  min-inline-size: 0;                /* lets children truncate */
  list-style: none;
  font-size: 12px;
}

.ds-breadcrumbs li {
  display: flex;
  align-items: center;
  gap: 4px;
  min-inline-size: 0;
}

.ds-breadcrumbs a {
  color: var(--ds-fg-muted);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-inline-size: 16ch;             /* truncate the crumb, not the trail */
}
.ds-breadcrumbs a:hover { color: var(--ds-fg); }

.ds-breadcrumbs [aria-current='page'] {
  color: var(--ds-fg);
  font-weight: 500;
}

.ds-breadcrumbs__sep {
  flex-shrink: 0;
  color: var(--ds-fg-disabled);
}

/* Separators mirror automatically in RTL when drawn as a chevron */
[dir='rtl'] .ds-breadcrumbs__sep { transform: scaleX(-1); }

/* On narrow screens, a single back link beats a squeezed trail */
@media (max-width: 480px) {
  .ds-breadcrumbs li:not(:nth-last-child(2)):not(:last-child) { display: none; }
}`,
    },
    api: [
      {
        name: 'Breadcrumbs',
        props: [
          { name: 'items', type: 'Crumb[]', required: true, description: '{ label, href?, onClick?, icon? }. The last item should have no href.' },
          { name: 'maxItems', type: 'number', default: '4', description: 'Above this, the middle collapses to an expandable ellipsis.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Derive the trail from the route, never from navigation history. A trail assembled from where the user has been is a different and much less useful component.',
      'On mobile, replace the full trail with a single "‹ Parent" link. It is the same affordance in a tenth of the space.',
      'If a crumb’s name can be very long — user-entered project names usually can — cap it at about 16 characters and put the full name in a title attribute.',
      'Put breadcrumbs above the page title, never below it. They are context for the title, and context comes first.',
    ],
    performance: [
      'Breadcrumbs are cheap, but resolving names for every ancestor can mean several requests. Include the ancestor names in the page payload rather than fetching them separately.',
      'Prefetch the parent route on hover. Going up one level is by far the most common breadcrumb interaction.',
      'Do not animate the collapse expansion. It is a rare, deliberate action and animation just delays it.',
    ],
    mistakes: [
      'Making the current page a link, so clicking it reloads the page the user is already on.',
      'Forgetting aria-hidden on the separators, so a screen reader reads "greater than" between every level.',
      'Using spans instead of an ordered list, which loses the count and the position for assistive tech.',
      'Letting the trail wrap onto two lines instead of collapsing the middle.',
      'Showing route segments instead of human names, which turns a location indicator into a URL.',
    ],
    realWorld: [
      'Breadcrumbs matter most for users who arrive deep from a link or a notification. Test the pattern by opening a deep URL in a fresh tab and asking whether you can tell where you are.',
      'On public pages, breadcrumb structured data is rendered directly in search results and measurably improves click-through. It is a small change with a real return.',
      'If users routinely need siblings rather than ancestors, add a switcher to the relevant crumb — a workspace crumb that opens a workspace picker is one of the highest-value navigation upgrades available.',
      'Track clicks per crumb position. If nobody ever clicks the middle levels, collapsing them by default is clearly correct.',
    ],
  },
})
