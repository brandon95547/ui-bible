import { Laptop, Monitor, Smartphone, Tablet, Tv } from 'lucide-react'
import { PreviewStage, Stack, defineDoc } from '../framework/kit'

const BPS = [
  { name: 'base', min: 0, label: 'Phone', Icon: Smartphone, cols: 4, gutter: 24, what: 'Single column. Bottom navigation. Sidebar becomes a drawer. Tables become cards.' },
  { name: 'sm', min: 640, label: 'Large phone / small tablet', Icon: Smartphone, cols: 8, gutter: 32, what: 'Two-up cards. Form fields can pair up. Dialogs stop being full-screen.' },
  { name: 'md', min: 768, label: 'Tablet', Icon: Tablet, cols: 8, gutter: 32, what: 'Persistent secondary navigation. Tables regain their columns.' },
  { name: 'lg', min: 1024, label: 'Laptop', Icon: Laptop, cols: 12, gutter: 40, what: 'Full application shell. Sidebar is permanent. Three-up card grids.' },
  { name: 'xl', min: 1280, label: 'Desktop', Icon: Monitor, cols: 12, gutter: 40, what: 'The right-hand rail appears. Master–detail becomes viable.' },
  { name: '2xl', min: 1536, label: 'Wide', Icon: Tv, cols: 12, gutter: 40, what: 'Container caps at 76rem and centres. Nothing else changes.' },
]

function Ladder() {
  return (
    <Stack gap="sm" className="w-full">
      {BPS.map((b) => (
        <div
          key={b.name}
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3"
        >
          <span className="mt-0.5 shrink-0 text-[var(--ds-fg-muted)]">
            <b.Icon size={16} />
          </span>
          <div className="w-20 shrink-0">
            <code className="font-mono text-[11.5px] text-[var(--ds-accent-text)]">{b.name}</code>
            <p className="font-mono text-[10px] tabular-nums text-[var(--ds-fg-muted)]">
              ≥{b.min}px
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-label text-[var(--ds-fg)]">{b.label}</p>
            <p className="mt-0.5 text-caption leading-relaxed text-[var(--ds-fg-muted)]">{b.what}</p>
          </div>
          <div className="hidden w-24 shrink-0 text-right font-mono text-[10px] text-[var(--ds-fg-muted)] sm:block">
            {b.cols} col · {b.gutter}px
          </div>
        </div>
      ))}
    </Stack>
  )
}

function AdaptiveCard() {
  return (
    <div
      className="w-full rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface)] p-4"
      style={{ containerType: 'inline-size' }}
    >
      <div className="flex flex-col gap-3 @[22rem]:flex-row @[22rem]:items-center">
        <div className="h-16 w-full shrink-0 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] @[22rem]:w-24" />
        <div className="min-w-0">
          <p className="text-label text-[var(--ds-fg)]">Container query, not media query</p>
          <p className="mt-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
            This card rearranges based on its own width. Drag the stage narrower — the viewport has
            not changed, but the card has.
          </p>
        </div>
      </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'breakpoints',
    title: 'Breakpoints',
    tagline:
      'Five thresholds, chosen from where layouts actually break rather than from a list of phone models. Plus the rule that most components should not use them at all.',
    keywords: ['responsive', 'media query', 'container query', 'mobile', 'viewport', 'adaptive'],
  },

  overview: {
    purpose:
      'A breakpoint is a point at which a layout stops working and needs to be rearranged. Ours are derived from content — where a two-column form stops fitting, where a table stops being readable — not from device dimensions, which change every year and never matched the real distribution anyway.',
    whenToUse: [
      'To change page-level structure: single column to multi-column, drawer to permanent sidebar.',
      'To switch navigation patterns: bottom navigation on phones, a sidebar on laptops.',
      'To show or hide a whole region, like the right-hand rail on this page.',
      'To change density and touch-target sizing between pointer types.',
    ],
    whenNotToUse: [
      {
        text: 'To rearrange a reusable component that can appear in slots of different widths.',
        instead: 'a container query',
      },
      {
        text: 'To make a card grid change column count.',
        instead: 'auto-fill with minmax',
      },
      {
        text: 'To nudge a font size at one specific width.',
        instead: 'clamp()',
      },
      {
        text: 'To detect touch capability.',
        instead: 'the pointer: coarse media query — screen width is not an input method',
      },
    ],
    reasoning: (
      <>
        <p>
          The most important thing on this page is the negative rule:{' '}
          <strong>most components should not contain a media query at all</strong>. A card does not
          care how wide the window is; it cares how wide its slot is. A sidebar card at 280px and
          the same card in a 900px main column need different layouts, and a viewport media query
          gets that wrong in both directions. Container queries are the correct tool and they have
          been baseline-available since 2023.
        </p>
        <p>
          Where breakpoints do apply — the shell — they are <strong>min-width only</strong>. Mobile
          styles are the unqualified base, and each breakpoint adds capability. Mixing min and max
          queries produces overlapping ranges and a class of bug that only appears at exactly one
          width, which nobody ever tests.
        </p>
        <p>
          Note that 640px is not "phone" and 1024px is not "laptop". A phone in landscape is 844px
          wide; a laptop with a split screen is 700px. Breakpoints describe{' '}
          <strong>available space</strong> and nothing else. Anything that genuinely depends on
          input method should query <code>pointer</code> and <code>hover</code> instead.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="The ladder" center={false} minHeight={0} allowResize={false}>
        <Ladder />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'container',
        title: 'Container queries',
        description:
          'Use the width controls in the toolbar. The card below responds to its own box, so it stays correct inside a sidebar, a modal, or a full-width page.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <AdaptiveCard />
          </PreviewStage>
        ),
      },
      {
        id: 'fluid',
        title: 'Fluid instead of stepped',
        description:
          'clamp() interpolates continuously between a minimum and a maximum. No breakpoint, no jump, correct at every width including the ones you did not test.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <div className="w-full">
              <p
                className="font-semibold leading-tight tracking-[-0.02em] text-[var(--ds-fg)]"
                style={{ fontSize: 'clamp(1.25rem, 4cqw + 0.5rem, 2.5rem)' }}
              >
                This heading scales continuously
              </p>
              <code className="mt-2 block font-mono text-[11px] text-[var(--ds-accent-text)]">
                clamp(1.25rem, 4cqw + 0.5rem, 2.5rem)
              </code>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'capability',
        title: 'Capability, not size',
        description:
          'Touch targets and hover affordances should depend on the pointer, not the viewport. A 1024px-wide tablet is touch; a 700px-wide split-screen laptop is not.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-3 sm:grid-cols-2">
              {[
                ['(pointer: coarse)', 'Touch. Targets grow to 44px, hover affordances are removed.'],
                ['(hover: hover)', 'A real pointer exists. Tooltips and hover previews are safe.'],
                ['(prefers-reduced-motion)', 'Collapse animation durations.'],
                ['(prefers-color-scheme)', 'The initial theme, before the user overrides it.'],
              ].map(([q, why]) => (
                <div
                  key={q}
                  className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-3"
                >
                  <code className="font-mono text-[11px] text-[var(--ds-accent-text)]">{q}</code>
                  <p className="mt-1 text-caption leading-relaxed text-[var(--ds-fg-muted)]">{why}</p>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: BPS.map((b) => ({
      label: b.name,
      note: `≥${b.min}px`,
      render: (
        <span className="flex flex-col items-center gap-1 text-[var(--ds-fg-muted)]">
          <b.Icon size={20} />
          <span className="font-mono text-[10px]">{b.cols} col</span>
        </span>
      ),
    })).concat([
      {
        label: 'container',
        note: 'component-scoped',
        render: (
          <span className="font-mono text-[10px] text-[var(--ds-accent-text)]">@container</span>
        ),
      },
      {
        label: 'coarse',
        note: 'pointer type',
        render: <span className="font-mono text-[10px] text-[var(--ds-accent-text)]">44px</span>,
      },
    ]),
  },

  anatomy: {
    render: (
      <div className="w-full max-w-2xl">
        <div className="relative h-14 w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)]">
          {BPS.map((b, i) => (
            <div
              key={b.name}
              className="absolute inset-y-0 border-l border-[var(--ds-accent-border)]"
              style={{ left: `${(b.min / 1920) * 100}%`, right: 0 }}
            >
              <span
                className="absolute left-1 top-1 font-mono text-[10px] text-[var(--ds-accent-text)]"
                style={{ opacity: 1 - i * 0.12 }}
              >
                {b.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--ds-fg-muted)]">
          <span>0</span>
          <span>640</span>
          <span>1024</span>
          <span>1536</span>
          <span>1920</span>
        </div>
      </div>
    ),
    caption:
      'Min-width only, so each range inherits everything from the one below it. There is no max-width query anywhere in the system.',
    parts: [
      {
        n: 1,
        label: 'Base',
        value: '0px, unqualified',
        kind: 'size',
        note: 'Mobile is not a breakpoint — it is the default. Everything else is progressive enhancement on top of a layout that already works.',
      },
      {
        n: 2,
        label: 'sm — 640px',
        value: '40rem',
        kind: 'size',
        note: 'Where two form fields can sit side by side at a comfortable measure, and where a dialog can stop being full-screen.',
      },
      {
        n: 3,
        label: 'lg — 1024px',
        value: '64rem',
        kind: 'size',
        note: 'The most consequential one. A 268px sidebar plus a 68ch content column plus gutters needs about 1024px; below it, the sidebar must collapse.',
      },
      {
        n: 4,
        label: 'xl — 1280px',
        value: '80rem',
        kind: 'size',
        note: 'Enough room for a third region. The on-this-page rail in this Bible appears here and not before.',
      },
      {
        n: 5,
        label: 'Container queries',
        value: '@container (min-width: …)',
        kind: 'size',
        note: 'The default tool for components. Viewport breakpoints are reserved for the shell, which is the only thing that genuinely knows about the viewport.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: 'sm', value: '640px', usedFor: 'Two-up layouts, non-fullscreen dialogs' },
    { category: 'spacing', token: 'md', value: '768px', usedFor: 'Tables regain columns, secondary nav appears' },
    { category: 'spacing', token: 'lg', value: '1024px', usedFor: 'Permanent sidebar, full application shell' },
    { category: 'spacing', token: 'xl', value: '1280px', usedFor: 'Right-hand rail, master–detail' },
    { category: 'spacing', token: '2xl', value: '1536px', usedFor: 'Container reaches its cap and centres' },
    { category: 'spacing', token: 'gutter', value: '24 → 40px', usedFor: 'Page padding, steps at sm' },
    { category: 'spacing', token: 'touch-target', value: '44px', usedFor: 'Minimum on pointer: coarse' },
  ],

  sizes: [
    { name: 'base', minWidth: '0px', padding: '24px', use: 'One column. Bottom nav. Full-screen dialogs. Tables as cards.' },
    { name: 'sm', minWidth: '640px', padding: '32px', use: 'Two-up cards. Paired form fields. Centred dialogs.' },
    { name: 'md', minWidth: '768px', padding: '32px', use: 'Real tables. Persistent secondary navigation.' },
    { name: 'lg', minWidth: '1024px', padding: '40px', use: 'Permanent sidebar. Three-up grids. Desktop density available.' },
    { name: 'xl', minWidth: '1280px', padding: '40px', use: 'Right rail. Master–detail. Four-up grids.' },
    { name: '2xl', minWidth: '1536px', padding: '40px', use: 'Content caps at 76rem. Nothing new appears.' },
  ],

  do: [
    {
      title: 'Write min-width queries only',
      why: 'Mobile-first means every rule adds rather than overrides. Mixing min and max produces overlapping ranges and bugs that exist at exactly one width.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">@media (min-width: 1024px)</span>
          <span className="text-[var(--ds-danger-text)]">@media (max-width: 1023px)</span>
        </Stack>
      ),
    },
    {
      title: 'Reach for container queries first',
      why: 'A component that adapts to its own slot works in a sidebar, in a modal, in a two-column layout and in a full-width page — with one rule instead of four.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          .host {'{'} container-type: inline-size {'}'}
          <br />
          @container (min-width: 24rem) {'{'} … {'}'}
        </code>
      ),
    },
    {
      title: 'Use clamp() instead of stepped type',
      why: 'Continuous interpolation has no jump and no gaps. Three breakpoints for a heading size means three sizes and infinitely many widths where none of them is right.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          font-size: clamp(1.5rem, 2vw + 1rem, 2.5rem)
        </code>
      ),
    },
    {
      title: 'Query capability for capability',
      why: 'Touch targets depend on the pointer, not the window. A 1024px tablet needs 44px targets; a 700px browser window on a desktop does not.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          @media (pointer: coarse) {'{'} .btn {'{'} min-block-size: 44px {'}'} {'}'}
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not add a breakpoint per device',
      why: 'Device dimensions change every year and never covered the real distribution anyway. Add a breakpoint when the content breaks, and only then.',
      render: (
        <Stack gap="xs" className="font-mono text-[10px] text-[var(--ds-danger-text)]">
          <span>@media (min-width: 375px) /* iPhone SE */</span>
          <span>@media (min-width: 390px) /* iPhone 14 */</span>
          <span>@media (min-width: 393px) /* Pixel 7 */</span>
          <span>@media (min-width: 430px) /* 14 Pro Max */</span>
        </Stack>
      ),
    },
    {
      title: 'Do not hide content on small screens',
      why: 'If it matters on desktop it matters on a phone. Hiding it says the mobile user deserves less product — and it is the most common cause of "I can only do this on my laptop".',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          .advanced-filters {'{'} display: none {'}'} — the feature no longer exists on mobile
        </span>
      ),
    },
    {
      title: 'Do not put media queries inside reusable components',
      why: 'The component now depends on where the page thinks it is rather than on the space it actually has. Drop it into a sidebar and it lays out for a viewport it cannot see.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          .card {'{'} @media (min-width: 1024px) {'{'} flex-direction: row {'}'} {'}'}
        </code>
      ),
    },
    {
      title: 'Do not equate small screen with touch',
      why: 'A 900px browser window on a desktop is a mouse. A 1180px iPad is a finger. Screen width has never been a reliable proxy for input method.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          if (width {'<'} 768) enableTouchMode() — wrong on every tablet ever made
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '1.3.4', name: 'Orientation', level: 'AA' },
      { id: '1.4.4', name: 'Resize Text', level: 'AA' },
    ],
    contrast: [
      'Contrast requirements do not change with viewport, but text often gets smaller on mobile — verify at the smallest size you actually ship.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Focus order must stay sensible at every breakpoint. If a layout reorders visually, the DOM must reorder with it.' },
      { keys: '⌘ / Ctrl +', does: 'At 400% zoom a 1280px window behaves like a 320px one. That is the actual WCAG reflow test.' },
    ],
    aria: [
      { attr: 'meta viewport', on: '<head>', note: 'width=device-width, initial-scale=1. Never add maximum-scale or user-scalable=no — both block pinch zoom and fail WCAG 1.4.4.' },
      { attr: 'orientation', on: 'Media query', note: 'Content must work in both orientations. Locking to one fails WCAG 1.3.4 unless the orientation is essential, which it almost never is.' },
      { attr: 'hidden vs display:none', on: 'Responsive hiding', note: 'Both remove content from assistive tech. If it should stay available, move it rather than hiding it.' },
    ],
    focus:
      'Focus must stay visible after a breakpoint change. If the focused element moves into a collapsed region, move focus explicitly rather than letting it fall to <body>.',
    screenReader: [
      'Screen-reader users on a desktop may be at a large viewport with 400% zoom. Do not assume "large viewport" means "everything fits".',
      'Content hidden with display: none at one breakpoint is gone for everyone at that breakpoint, including assistive tech.',
    ],
    touch:
      'Reflow must work at 320 CSS pixels wide with no horizontal scrolling — equivalent to 1280px at 400% zoom. That is the requirement, not "looks fine on my phone".',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Mobile-first: the base case has no prefix
<div className="flex flex-col gap-4 lg:flex-row lg:gap-6">

// Reveal a region only when there is room for it
<aside className="hidden xl:block w-52">
  <TableOfContents />
</aside>

// Container queries for anything reusable
<div style={{ containerType: 'inline-size' }}>
  <article className="flex flex-col @[24rem]:flex-row">…</article>
</div>

// Reading a breakpoint in JS — only when layout cannot express it
const isDesktop = useMediaQuery('(min-width: 1024px)')
return isDesktop ? <DataTable /> : <CardList />

// Capability, not size
const coarse = useMediaQuery('(pointer: coarse)')

// The single most important line in a responsive app
<meta name="viewport" content="width=device-width, initial-scale=1" />`,
    },
    css: {
      lang: 'css',
      code: `/* Min-width only. Each step adds; none of them override. */
@media (min-width: 40rem)  { /* sm  640 */ }
@media (min-width: 48rem)  { /* md  768 */ }
@media (min-width: 64rem)  { /* lg 1024 */ }
@media (min-width: 80rem)  { /* xl 1280 */ }
@media (min-width: 96rem)  { /* 2xl 1536 */ }

/* Breakpoints in rem, so they respect the user's font size.
   A user at 24px root font hits "lg" at a smaller pixel width —
   which is correct, because their content is bigger. */

/* Components query themselves */
.card-host { container-type: inline-size; container-name: card; }
@container card (min-width: 24rem) {
  .card { grid-template-columns: 6rem 1fr; }
}

/* Fluid beats stepped wherever the property is continuous */
.hero { font-size: clamp(2rem, 5vw + 1rem, 4rem); }
.page { padding-inline: clamp(1.5rem, 4vw, 2.5rem); }

/* Capability queries */
@media (pointer: coarse) {
  .btn { min-block-size: 44px; }
}
@media (hover: hover) {
  .row:hover { background: var(--ds-layer-hover); }
}`,
    },
  },

  notes: {
    tips: [
      'Define breakpoints in rem rather than px. A user with a 24px root font hits each threshold at a smaller pixel width, which is exactly right — their content is physically larger.',
      'Test at 320px. It is the narrowest viewport WCAG requires and the width a 1280px window becomes at 400% zoom.',
      'When you find yourself wanting a sixth breakpoint, you almost certainly want a container query on the component that is misbehaving.',
      'Landscape phones are wider than portrait tablets. Never assume a wide viewport means a large device.',
    ],
    performance: [
      'Media queries are free — they are evaluated during style resolution with no JavaScript involved. matchMedia in React costs a listener and a re-render per change.',
      'Do not render both a mobile and a desktop tree and hide one. You pay for both in DOM size, both in data fetching, and both in hydration.',
      'container-type: inline-size creates a containment context, which usually improves layout performance by bounding the recalculation.',
      'Responsive images with srcset and sizes prevent a phone downloading a 2400px hero. This is typically the single largest mobile performance win available.',
    ],
    mistakes: [
      'Adding maximum-scale=1 or user-scalable=no to the viewport meta tag. It blocks pinch zoom and is a direct WCAG failure.',
      'Using vh for full-height layouts on mobile, where the browser chrome collapses and the value is wrong for most of the scroll.',
      'Hiding the primary navigation on desktop behind a hamburger. Space exists; use it.',
      'Testing only at the exact breakpoint values. Bugs live between them, at 900px and 1150px.',
    ],
    realWorld: [
      'Check your analytics before choosing thresholds. Most products discover a large cluster around 1366×768 that their 1440px-first designs never considered.',
      'Build the 320px layout first. Everything is a decision at that width, and the desktop layout falls out of it almost for free. The reverse never works.',
      'A resizable panel in a desktop app is a viewport that media queries know nothing about. Any component that can live inside one needs container queries.',
      'Keep a page in the app that renders your key components at every breakpoint simultaneously in iframes. It catches regressions no single-width review ever will.',
    ],
  },
})
