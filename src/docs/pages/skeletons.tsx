import * as React from 'react'
import { Skeleton, SkeletonText, Spinner } from '@/ui/Feedback'
import { Card } from '@/ui/Surface'
import { Avatar, Badge } from '@/ui/Display'
import { Cell, KnobToggle, PreviewStage, Stack, defineDoc } from '../framework/kit'

function ProjectCard({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <Card padding="sm" className="w-full" aria-busy>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-[18px] w-14" rounded="full" />
        </div>
        <Skeleton className="mt-3 h-3 w-20" />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            <Skeleton className="h-5 w-5" rounded="full" />
            <Skeleton className="h-5 w-5" rounded="full" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      </Card>
    )
  }
  return (
    <Card padding="sm" className="w-full">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-label text-[var(--ds-fg)]">api-gateway</span>
        <Badge tone="success" size="sm" dot>
          Live
        </Badge>
      </div>
      <p className="mt-3 text-caption text-[var(--ds-fg-muted)]">main · 4m ago</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          <Avatar name="Ada Lovelace" size="xs" />
          <Avatar name="Grace Hopper" size="xs" />
        </div>
        <span className="text-caption tabular-nums text-[var(--ds-fg-muted)]">18ms</span>
      </div>
    </Card>
  )
}

function Playground() {
  const [loading, setLoading] = React.useState(true)
  const [animate, setAnimate] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      center={false}
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={loading} onChange={setLoading} label="Loading" />
          <KnobToggle checked={animate} onChange={setAnimate} label="Shimmer" />
        </div>
      }
      code={`{loading ? <ProjectCardSkeleton /> : <ProjectCard {...data} />}

// The skeleton must match the real layout exactly, or the page
// visibly jumps when the data lands.`}
    >
      <div className="grid w-full gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={animate ? undefined : '[&_span]:after:hidden'}>
            <ProjectCard loading={loading} />
          </div>
        ))}
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'skeletons',
    title: 'Skeleton Loading',
    group: 'Feedback',
    tagline:
      'A placeholder shaped like the content that is coming. It only works if it matches — a skeleton that is the wrong shape makes the page jump exactly when the user starts reading.',
    keywords: ['placeholder', 'shimmer', 'ghost', 'loading state', 'layout shift', 'suspense'],
  },

  overview: {
    purpose:
      'A skeleton reserves the exact space the incoming content will occupy and hints at its shape. It removes the layout shift that makes a page feel unstable, and it gives the eye somewhere to settle while waiting. Its value is entirely in the match: a skeleton that is not the same shape as the result is worse than a spinner.',
    whenToUse: [
      'The layout of the result is known before the data arrives.',
      'The wait is roughly 300ms to a few seconds — long enough to notice, short enough to stay.',
      'Content-heavy surfaces: lists, cards, tables, profile headers, dashboards.',
      'Any first load where a spinner would leave a large empty region.',
    ],
    whenNotToUse: [
      {
        text: 'The shape of the result is unknown — a search that may return anything.',
        instead: 'an indeterminate Progress bar',
        to: '#/progress',
      },
      {
        text: 'The wait is under about 200ms.',
        instead: 'nothing — a skeleton that flashes reads as a glitch',
      },
      {
        text: 'Only a small part of the page is updating.',
        instead: 'an inline spinner or an optimistic update',
        to: '#/loading-states',
      },
      {
        text: 'The operation has a measurable percentage.',
        instead: 'a determinate Progress bar',
        to: '#/progress',
      },
    ],
    reasoning: (
      <>
        <p>
          The rule that makes or breaks this component: <strong>match the shape and the
          position</strong>. If the skeleton is a 20px-tall bar and the real title is 24px, the page
          shifts by 4px on every card at the moment the user starts reading. That shift is a
          measurable cumulative-layout-shift score and an unmeasurable feeling that the product is
          flimsy.
        </p>
        <p>
          Show it after about <strong>200ms</strong>, not immediately. Most requests resolve faster
          than that, and a skeleton that appears and disappears within 80ms is a flash — the same
          visual event as a rendering bug. Delaying costs nothing on slow requests and removes the
          flash on fast ones.
        </p>
        <p>
          Skeletons are <strong>aria-hidden</strong> and the region carries a single{' '}
          <code>aria-busy</code>. Announcing twelve grey rectangles is noise; announcing "loading"
          once and then the content when it arrives is the whole story a screen-reader user needs.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'match',
        title: 'Matching the shape',
        description:
          'Toggle between the skeleton and the real content in the playground above and watch for movement. If anything shifts, the skeleton is wrong.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Matched — nothing moves" tone="good">
                <Stack gap="sm" className="w-full">
                  <ProjectCard loading />
                  <ProjectCard loading={false} />
                </Stack>
              </Cell>
              <Cell label="Mismatched — the page jumps" tone="bad">
                <Stack gap="sm" className="w-full">
                  <Card padding="sm" className="w-full">
                    <Skeleton className="h-8 w-full" />
                  </Card>
                  <ProjectCard loading={false} />
                </Stack>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'shapes',
        title: 'Common shapes',
        description:
          'Text lines end short because real paragraphs do not end flush. Avatars are circles. Buttons keep their radius. The closer the silhouette, the less the arrival is noticed.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Cell label="Text block">
                <SkeletonText lines={4} className="w-full" />
              </Cell>
              <Cell label="Media object">
                <div className="flex w-full gap-3">
                  <Skeleton className="h-10 w-10 shrink-0" rounded="full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-2 h-3 w-full" />
                  </div>
                </div>
              </Cell>
              <Cell label="Table rows">
                <div className="w-full">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 border-b border-[var(--ds-border-subtle)] py-2.5 last:border-0">
                      <Skeleton className="h-3 flex-1" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))}
                </div>
              </Cell>
              <Cell label="Stat tile">
                <div className="w-full">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="mt-3 h-6 w-24" />
                  <Skeleton className="mt-3 h-8 w-full" />
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-spinner',
        title: 'Skeleton or spinner?',
        description:
          'Skeleton when the layout is known. Spinner when it is not, or when the loading region is smaller than a couple of lines.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="Known layout → skeleton" tone="good">
                <ProjectCard loading />
              </Cell>
              <Cell label="Unknown result → spinner" tone="good">
                <div className="flex h-24 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
                  <Spinner size={16} />
                  <span className="text-caption text-[var(--ds-fg-muted)]">Searching…</span>
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Line', render: <Skeleton className="h-3 w-24" /> },
      { label: 'Heading', render: <Skeleton className="h-5 w-28" /> },
      { label: 'Paragraph', render: <SkeletonText lines={3} className="w-28" /> },
      { label: 'Avatar', render: <Skeleton className="h-9 w-9" rounded="full" /> },
      { label: 'Badge', render: <Skeleton className="h-[18px] w-14" rounded="full" /> },
      { label: 'Button', render: <Skeleton className="h-9 w-20" rounded="lg" /> },
      { label: 'Thumbnail', render: <Skeleton className="h-14 w-20" rounded="lg" /> },
      { label: 'No shimmer', note: 'Reduced motion', render: <Skeleton className="h-3 w-24" animate={false} /> },
      { label: 'Card', render: <div className="w-28"><ProjectCard loading /></div> },
      { label: 'Table row', render: <div className="flex w-28 gap-2"><Skeleton className="h-3 flex-1" /><Skeleton className="h-3 w-6" /></div> },
      { label: 'Delayed', note: 'After 200ms', render: <span className="text-caption text-[var(--ds-fg-muted)]">nothing yet</span> },
      { label: 'Loaded', render: <span className="font-mono text-caption text-[var(--ds-fg)]">api-gateway</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xs">
        <ProjectCard loading />
      </div>
    ),
    caption:
      'Each block maps to a real element: the title bar is the width of a plausible title, the badge keeps the pill radius, the avatars stay circular.',
    parts: [
      {
        n: 1,
        label: 'Block height',
        value: 'Matches the line box',
        kind: 'size',
        note: 'A 13px line with 1.6 line-height occupies about 21px. Use 12px for the bar so it reads as text without inflating the row.',
      },
      {
        n: 2,
        label: 'Block width',
        value: '60–90% of plausible',
        kind: 'size',
        note: 'Vary the widths. A stack of identical full-width bars reads as a chart, not as text.',
      },
      {
        n: 3,
        label: 'Radius',
        value: 'Matches the real element',
        kind: 'shape',
        note: '4px for text, full for avatars and badges, 8px for buttons. The silhouette is most of what sells it.',
      },
      {
        n: 4,
        label: 'Fill',
        value: '--ds-layer-active',
        kind: 'color',
        note: 'An alpha layer, so the same skeleton works on a card, a dialog and the page canvas without a second token.',
      },
      {
        n: 5,
        label: 'Shimmer',
        value: '1.6s linear, 200% sweep',
        kind: 'motion',
        note: 'Slow and low-contrast. A fast, high-contrast shimmer is a photosensitivity risk and reads as urgency where none exists.',
      },
      {
        n: 6,
        label: 'Delay',
        value: '200ms before showing',
        kind: 'motion',
        note: 'Below this the skeleton appears and vanishes within a frame or two, which looks like a rendering bug.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-active', usedFor: 'Skeleton fill' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Shimmer highlight' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Text bars' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Default blocks' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Buttons and thumbnails' },
    { category: 'radius', token: 'full', usedFor: 'Avatars and badges' },
    { category: 'spacing', token: 'line gap', value: '8px', usedFor: 'Between skeleton text lines' },
    { category: 'motion', token: 'shimmer', value: '1.6s linear infinite', usedFor: 'The sweep' },
    { category: 'motion', token: 'delay', value: '200ms', usedFor: 'Before the skeleton is shown at all' },
  ],

  sizes: [
    { name: 'Caption line', height: '10px', radius: '4px', maxWidth: '60%', use: 'Metadata and timestamps.' },
    { name: 'Body line', height: '12px', radius: '4px', maxWidth: '100%', use: 'Paragraph text. Last line at ~62%.' },
    { name: 'Heading', height: '20px', radius: '4px', maxWidth: '70%', use: 'Card and section titles.' },
    { name: 'Avatar', height: '20–40px', radius: 'full', use: 'Matches the real avatar size exactly.' },
    { name: 'Button', height: '36px', radius: '8px', minWidth: '72px', use: 'Keeps the control radius so the shape is recognisable.' },
    { name: 'Thumbnail', height: '56–96px', radius: '8px', use: 'Match the aspect ratio, not just the height.' },
  ],

  do: [
    {
      title: 'Vary the line widths',
      why: 'Real paragraphs do not end flush. A last line at about 62% is what makes a block of bars read as text rather than as a bar chart.',
      render: <SkeletonText lines={4} className="w-full" />,
    },
    {
      title: 'Delay by 200ms',
      why: 'Most requests finish faster. Without the delay, every fast response produces a flash of grey that users read as a bug rather than as speed.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const t = setTimeout(() =&gt; setShow(true), 200)
          <br />
          return () =&gt; clearTimeout(t)
        </code>
      ),
    },
    {
      title: 'Render the same number of items you expect',
      why: 'Three skeleton cards then eight real ones is a jump. Use the last known count, or the page size, so the container height barely changes.',
      render: (
        <div className="grid w-full grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full" rounded="lg" />
          ))}
        </div>
      ),
    },
    {
      title: 'Put aria-busy on the region, not each block',
      why: 'One announcement — "loading" — then the content. Twelve aria-labelled rectangles is noise that tells the user nothing they can act on.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;section aria-busy={'{'}loading{'}'}&gt;
          <br />
          &nbsp;&nbsp;&lt;span aria-hidden className="skeleton" /&gt;
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a generic grey box',
      why: 'A single rectangle where a structured card will appear gives no shape information and guarantees a jump. It is a spinner with extra layout shift.',
      render: <Skeleton className="h-20 w-full" rounded="lg" />,
    },
    {
      title: 'Do not shimmer aggressively',
      why: 'A fast, high-contrast sweep is visually noisy, reads as urgency, and is a photosensitivity concern. 1.6s and a low-contrast highlight is the ceiling.',
      render: (
        <span className="relative block h-6 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)] after:absolute after:inset-0 after:animate-[shimmer_0.4s_linear_infinite] after:bg-[linear-gradient(90deg,transparent,var(--ds-fg-muted),transparent)] after:bg-[length:200%_100%]" />
      ),
    },
    {
      title: 'Do not skeleton the whole page',
      why: 'The header, the navigation and the page title are already known. Skeletoning them makes the entire application appear to reload on every navigation.',
      render: (
        <div className="w-full">
          <Skeleton className="h-8 w-full" rounded="md" />
          <Skeleton className="mt-2 h-4 w-32" />
          <Skeleton className="mt-4 h-24 w-full" rounded="lg" />
        </div>
      ),
    },
    {
      title: 'Do not animate the skeleton in',
      why: 'The skeleton slides in, then the content fades in on top. That is two animations to show one piece of data, and it adds delay to something already late.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          skeleton 220ms → data 200ms → 420ms of theatre
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
      { id: '2.3.1', name: 'Three Flashes or Below', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
    ],
    contrast: [
      'Skeletons carry no information, so they are exempt from text contrast. They should still be visible — an invisible skeleton is an empty page.',
      'The shimmer must not exceed a 3:1 luminance swing, or it counts as a flash for photosensitive users.',
      'Keep the fill distinguishable from both the surface and the eventual content, so the transition to real data is obvious.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Skips skeletons entirely — they are never focusable.' },
      { keys: 'Tab (after load)', does: 'Focus must not be lost when the skeleton is replaced. Keep it on a stable ancestor.' },
    ],
    aria: [
      { attr: 'aria-hidden="true"', on: 'Each skeleton block', note: 'They are decorative. Individually announcing them is pure noise.' },
      { attr: 'aria-busy="true"', on: 'The loading region', note: 'One flag for the whole region, removed when the content lands.' },
      { attr: 'aria-live="polite"', on: 'A status region', note: 'Optional. "Loading projects" then "12 projects loaded" is the useful pair.' },
      { attr: 'role="status"', on: 'The wrapper', note: 'Only when you want an announcement. A silent aria-busy region is usually enough.' },
    ],
    focus:
      'Never move focus when the skeleton is replaced. If focus was on a filter input, it must still be there when the results arrive — otherwise the user is thrown back to the top of the page mid-task.',
    screenReader: [
      'A screen-reader user gets nothing from a skeleton. Announce the state change once: "Loading" on entry, and the result count on completion.',
      'Do not put text inside a skeleton. "Loading…" written into a grey bar is announced along with everything else and adds nothing.',
      'Keep the DOM structure stable. Replacing the whole subtree can move the screen reader’s virtual cursor back to the top of the page.',
    ],
    touch:
      'Skeletons are not interactive. Make sure the real content does not become tappable before it is fully rendered — a card that gains a link mid-animation causes mis-taps.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Skeleton, SkeletonText } from '@/ui/Feedback'

// The skeleton lives next to the component it mirrors, in the same file.
// That is the only reliable way to keep them in sync.
export function ProjectCard({ project }: { project?: Project }) {
  if (!project) return <ProjectCardSkeleton />
  return <Card>…</Card>
}

function ProjectCardSkeleton() {
  return (
    <Card padding="sm" aria-busy>
      <Skeleton className="h-3.5 w-28" />          {/* title  */}
      <Skeleton className="mt-3 h-3 w-20" />       {/* meta   */}
      <Skeleton className="mt-4 h-5 w-5" rounded="full" />
    </Card>
  )
}

// Delay so fast responses never flash
function useDelayed(active: boolean, ms = 200) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!active) return setOn(false)
    const t = setTimeout(() => setOn(true), ms)
    return () => clearTimeout(t)
  }, [active, ms])
  return on
}

// Render the count you expect, not an arbitrary three
<section aria-busy={loading}>
  {loading
    ? Array.from({ length: lastCount ?? pageSize }, (_, i) => <ProjectCardSkeleton key={i} />)
    : projects.map((p) => <ProjectCard key={p.id} project={p} />)}
</section>`,
    },
    css: {
      lang: 'css',
      code: `.ds-skeleton {
  display: block;
  background: var(--ds-layer-active);   /* alpha — works on any surface */
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

/* A slow, low-contrast sweep. Fast or high-contrast shimmer is a
   photosensitivity concern and reads as urgency. */
.ds-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ds-layer-hover) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
}

@keyframes shimmer {
  from { background-position: -180% 0 }
  to   { background-position:  180% 0 }
}

/* Text lines: vary the widths, and end short */
.ds-skeleton--text { block-size: 12px; border-radius: var(--radius-xs); }
.ds-skeleton--text:last-child { inline-size: 62%; }

@media (prefers-reduced-motion: reduce) {
  .ds-skeleton::after { animation: none; }
}`,
    },
    api: [
      {
        name: 'Skeleton',
        props: [
          { name: 'className', type: 'string', description: 'Size it with utilities. Match the real element’s box exactly.' },
          { name: 'rounded', type: "'sm' | 'md' | 'lg' | 'full'", default: "'md'", description: 'Match the radius of what it stands in for.' },
          { name: 'animate', type: 'boolean', default: 'true', description: 'Disable for very large grids where fifty shimmers is too much.' },
        ],
      },
      {
        name: 'SkeletonText',
        props: [
          { name: 'lines', type: 'number', default: '3', description: 'Number of bars. The last one renders at 62% width.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep the skeleton in the same file as the component it mirrors and export both. Skeletons in a separate file drift out of sync within a month.',
      'Cache the last known item count and render that many skeletons. It is the difference between a stable container and one that resizes twice per load.',
      'For infinite scroll, render two or three skeleton rows at the bottom rather than a spinner. It doubles as an affordance that more is coming.',
      'A skeleton for a chart should be the chart’s bounding box with faint axis lines, not a solid block. The silhouette is the information.',
    ],
    performance: [
      'Fifty shimmering skeletons is fifty simultaneous background-position animations. Above about twenty, animate a single overlay across the group or disable the shimmer.',
      'Skeletons must not trigger the same data fetch as the real component. Keep them purely presentational with no hooks.',
      'Reserve space with aspect-ratio rather than a fixed height where the content is responsive, so the reservation stays correct at every width.',
      'content-visibility: auto on offscreen skeleton rows skips their layout and their animation entirely.',
    ],
    mistakes: [
      'Rendering the skeleton immediately, so every fast request produces a flash of grey.',
      'A skeleton whose dimensions do not match the content, which turns a loading state into a layout shift.',
      'Leaving the shimmer running under prefers-reduced-motion.',
      'Announcing each skeleton block to screen readers instead of putting one aria-busy on the region.',
      'Replacing the whole subtree on load, which resets scroll position and moves the screen reader’s cursor.',
    ],
    realWorld: [
      'Measure cumulative layout shift before and after adding skeletons. If CLS did not improve, the skeletons are the wrong size and are adding work for nothing.',
      'Skeletons make a page feel faster than a spinner at the same latency, but they cannot rescue a genuinely slow endpoint. Fix the p95 first.',
      'For a returning user, cached data plus a background refresh beats any skeleton. Show the stale content immediately and update it in place.',
      'Screenshot the skeleton and the loaded state and flip between them. Anything that moves is a bug you can fix in a minute and would otherwise never notice.',
    ],
  },
})
