import { PreviewStage, Stack, defineDoc } from '../framework/kit'

function ColumnGrid({ cols = 12 }: { cols?: number }) {
  return (
    <div className="relative w-full">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] ring-1 ring-inset ring-[var(--ds-accent-border)]"
          />
        ))}
      </div>
      <p className="mt-2 text-center font-mono text-[10px] text-[var(--ds-fg-muted)]">
        {cols} columns · 16px gutter
      </p>
    </div>
  )
}

function AppShell() {
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
      <div className="grid" style={{ gridTemplateColumns: '200px 1fr 180px', height: 220 }}>
        <div className="border-r border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
          <p className="text-overline uppercase text-[var(--ds-fg-muted)]">Sidebar</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--ds-fg-muted)]">fixed 200–400px</p>
        </div>
        <div className="flex flex-col">
          <div className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-3">
            <p className="text-overline uppercase text-[var(--ds-fg-muted)]">Top bar · 56px</p>
          </div>
          <div className="flex-1 bg-[var(--ds-canvas)] p-3">
            <p className="text-overline uppercase text-[var(--ds-fg-muted)]">Content</p>
            <p className="mt-1 font-mono text-[10px] text-[var(--ds-fg-muted)]">
              fluid, max-inline-size 76rem
            </p>
          </div>
        </div>
        <div className="border-l border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
          <p className="text-overline uppercase text-[var(--ds-fg-muted)]">Rail</p>
          <p className="mt-1 font-mono text-[10px] text-[var(--ds-fg-muted)]">hidden {'<'} 1280px</p>
        </div>
      </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'grid',
    title: 'Grid & Layout',
    tagline:
      'A 12-column fluid grid, a 16–24px gutter, and hard caps on how wide content is allowed to get. Layout is the frame; everything else hangs off it.',
    keywords: ['columns', 'gutter', 'container', 'layout', 'flex', 'css grid', 'measure', 'shell'],
  },

  overview: {
    purpose:
      'The grid is the shared coordinate system that makes independently-built screens look like one product. It decides where things start, how wide they get, and what happens to them when the viewport changes — so that those decisions are made once rather than re-litigated on every page.',
    whenToUse: [
      'For any page-level arrangement of regions: shell, content, rails, footers.',
      'For card and tile collections that should reflow predictably as the viewport changes.',
      'Whenever two elements need to align across a gap they do not share a parent with.',
      'To cap content width so text stays readable on a 2560px monitor.',
    ],
    whenNotToUse: [
      {
        text: 'For a single row of items that only needs to sit side by side.',
        instead: 'flexbox with a gap',
      },
      {
        text: 'For arrangement inside a small component like a button or a chip.',
        instead: 'inline-flex',
      },
      {
        text: 'To force a card collection into exactly three columns at every size.',
        instead: 'auto-fill with a minmax track',
      },
      {
        text: 'To centre a single element.',
        instead: 'place-items or margin-inline auto',
      },
    ],
    reasoning: (
      <>
        <p>
          Twelve columns because twelve divides cleanly by 2, 3, 4 and 6 — every common layout
          (halves, thirds, quarters, sixths) lands on whole columns. Sixteen would be more flexible
          and would also mean nobody could hold the fractions in their head.
        </p>
        <p>
          Content width is capped at <strong>76rem</strong> for full-bleed layouts and{' '}
          <strong>68ch</strong> for prose. Those are different units on purpose: layout scales with
          the root font size, prose scales with its own font size. A pixel max-width silently
          becomes the wrong measure the moment either changes.
        </p>
        <p>
          The application shell is <strong>grid</strong>, not flex. A grid can declare
          <code> 200px 1fr 180px</code> in one place, so the sidebar cannot push the content around
          and the rail cannot collapse unexpectedly. Nested flex containers negotiate; a grid
          decides.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="12-column grid" center={false} minHeight={0} allowResize>
        <ColumnGrid />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'shell',
        title: 'Application shell',
        description:
          'Three fixed decisions in one declaration. The sidebar is resizable but bounded; the rail disappears below 1280px; the content is the only fluid track.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <AppShell />
          </PreviewStage>
        ),
      },
      {
        id: 'autofit',
        title: 'Self-arranging collections',
        description:
          'auto-fill with minmax reflows without a single media query. Resize the stage to watch the column count change on its own.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize>
            <div
              className="grid w-full gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-20 items-center justify-center rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] text-caption text-[var(--ds-fg-muted)]"
                >
                  Card {i + 1}
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'measure',
        title: 'Width caps',
        description:
          'Three different maximums for three different jobs. Applying one number to all three is what makes a wide monitor uncomfortable.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full">
              {[
                ['68ch', 'Prose. Roughly 11 words per line.', 'max-w-[68ch]'],
                ['48rem', 'Forms and settings. Wide enough for two columns.', 'max-w-3xl'],
                ['76rem', 'Dashboards and tables. The outer container.', 'max-w-[76rem]'],
              ].map(([w, why, cls]) => (
                <div key={w as string} className="w-full">
                  <div
                    className="h-8 rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] ring-1 ring-inset ring-[var(--ds-accent-border)]"
                    style={{ maxWidth: w as string }}
                  />
                  <p className="mt-1 font-mono text-[10px] text-[var(--ds-fg-muted)]">
                    {cls} — {why}
                  </p>
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '12 col', note: '≥1024px', render: <span className="grid w-24 grid-cols-12 gap-px">{Array.from({ length: 12 }).map((_, i) => <span key={i} className="h-8 bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: '8 col', note: '640–1023px', render: <span className="grid w-24 grid-cols-8 gap-px">{Array.from({ length: 8 }).map((_, i) => <span key={i} className="h-8 bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: '4 col', note: '<640px', render: <span className="grid w-24 grid-cols-4 gap-px">{Array.from({ length: 4 }).map((_, i) => <span key={i} className="h-8 bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: 'Halves', render: <span className="grid w-24 grid-cols-2 gap-1">{[0, 1].map((i) => <span key={i} className="h-8 rounded-[3px] bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: 'Thirds', render: <span className="grid w-24 grid-cols-3 gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-8 rounded-[3px] bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: 'Sidebar', note: '200px 1fr', render: <span className="grid w-24 gap-1" style={{ gridTemplateColumns: '30% 1fr' }}>{[0, 1].map((i) => <span key={i} className="h-8 rounded-[3px] bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: 'Asymmetric', note: '2fr 1fr', render: <span className="grid w-24 gap-1" style={{ gridTemplateColumns: '2fr 1fr' }}>{[0, 1].map((i) => <span key={i} className="h-8 rounded-[3px] bg-[var(--ds-accent-subtle)]" />)}</span> },
      { label: 'Auto-fill', note: 'minmax(4rem,1fr)', render: <span className="grid w-24 gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(2rem,1fr))' }}>{[0, 1, 2].map((i) => <span key={i} className="h-8 rounded-[3px] bg-[var(--ds-accent-subtle)]" />)}</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xl">
        <div className="relative rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] p-6">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 anatomy-margin" />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 anatomy-margin" />
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-[3px] bg-[var(--ds-accent-subtle)]" />
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--ds-fg-muted)]">
          <span>gutter 24px</span>
          <span>column 1fr</span>
          <span>gap 16px</span>
        </div>
      </div>
    ),
    caption:
      'Gutter is the space outside the grid; gap is the space between its columns. Confusing the two is why content sometimes touches the viewport edge on mobile.',
    parts: [
      {
        n: 1,
        label: 'Gutter',
        value: '24px mobile · 40px desktop',
        kind: 'space',
        note: 'The page’s outer padding. 16px is too tight on a modern phone and 32px wastes a fifth of a 360px screen; 24px is the value that survives real content.',
      },
      {
        n: 2,
        label: 'Column',
        value: '1fr',
        kind: 'size',
        note: 'Fluid, never fixed. A fixed column width means a fixed breakpoint set, and the layout breaks at every size you did not test.',
      },
      {
        n: 3,
        label: 'Gap',
        value: '16px · 24px on wide',
        kind: 'space',
        note: 'Must be smaller than the gutter, or the outer columns look detached from the page and the grid stops reading as a unit.',
      },
      {
        n: 4,
        label: 'Container max',
        value: '76rem',
        kind: 'size',
        note: 'In rem, so it scales with the root font size. Past about 1216px, extra width adds eye travel without adding information.',
      },
      {
        n: 5,
        label: 'Prose max',
        value: '68ch',
        kind: 'size',
        note: 'A separate cap, in ch, applied to text blocks inside a wide container. Layout width and reading width are different problems.',
      },
    ],
  },

  tokens: [
    { category: 'spacing', token: '--ds-layout-gutter', value: '24px', usedFor: 'Page padding below 640px' },
    { category: 'spacing', token: '--ds-layout-gutter-lg', value: '40px', usedFor: 'Page padding at 640px and above' },
    { category: 'spacing', token: 'gap-4', value: '16px', usedFor: 'Default grid gap' },
    { category: 'spacing', token: 'gap-6', value: '24px', usedFor: 'Grid gap on wide layouts' },
    { category: 'spacing', token: '--ds-layout-container', value: '76rem', usedFor: 'Maximum content width. The App Bar reads this token rather than carrying its own cap' },
    { category: 'spacing', token: 'sidebar', value: '208–400px', usedFor: 'Resizable navigation rail' },
    { category: 'spacing', token: 'topbar', value: '56px', usedFor: 'Application header height' },
    { category: 'spacing', token: 'toc-rail', value: '208px', usedFor: 'On-this-page rail, hidden below 1280px' },
  ],

  sizes: [
    { name: 'Mobile', maxWidth: '<640px', gap: '16px', padding: '24px', use: '4 columns. Single column content, stacked cards, bottom navigation.' },
    { name: 'Tablet', maxWidth: '640–1023px', gap: '16px', padding: '32px', use: '8 columns. Two-up cards, collapsible sidebar.' },
    { name: 'Laptop', maxWidth: '1024–1279px', gap: '24px', padding: '40px', use: '12 columns. Persistent sidebar, three-up cards.' },
    { name: 'Desktop', maxWidth: '1280–1535px', gap: '24px', padding: '40px', use: '12 columns plus the right rail.' },
    { name: 'Wide', maxWidth: '≥1536px', gap: '24px', padding: '40px', use: 'Container caps at 76rem and centres. Do not keep stretching.' },
  ],

  do: [
    {
      title: 'Cap the container and centre it',
      why: 'On a 2560px monitor an uncapped layout puts the navigation and the primary action a foot apart. Capping is not wasted space; it is a reading distance.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] p-2">
          <div className="mx-auto h-12 max-w-[60%] rounded-[var(--radius-sm)] bg-[var(--ds-accent-subtle)] ring-1 ring-inset ring-[var(--ds-accent-border)]" />
        </div>
      ),
    },
    {
      title: 'Let collections reflow with auto-fill',
      why: 'One declaration replaces four media queries and stays correct at sizes you never tested — including inside a resized panel, where media queries do not apply at all.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
        </code>
      ),
    },
    {
      title: 'Use container queries for reusable components',
      why: 'A card in a 300px sidebar and the same card in a 900px main column need different layouts. Media queries only know the viewport; container queries know the space the component is actually in.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          @container (min-width: 24rem) {'{'} … {'}'}
        </code>
      ),
    },
    {
      title: 'Use logical properties',
      why: 'padding-inline and margin-block mirror automatically in RTL locales. padding-left does not, and you find out when someone opens the Arabic build.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px]">
          <span className="text-[var(--ds-success-text)]">padding-inline: 1.5rem</span>
          <span className="text-[var(--ds-danger-text)]">padding-left: 1.5rem</span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not nest grids more than two deep',
      why: 'Every level makes the final position of an element harder to predict and harder to debug. Past two, use flex inside the cell.',
      render: (
        <div className="grid w-full grid-cols-2 gap-2 rounded-[var(--radius-sm)] bg-[var(--ds-danger-subtle)] p-2">
          <div className="grid grid-cols-2 gap-2 rounded-[3px] bg-[var(--ds-danger-subtle)] p-2">
            <div className="grid grid-cols-2 gap-1 rounded-[3px] bg-[var(--ds-danger-subtle)] p-1">
              <span className="h-4 rounded-[2px] bg-[var(--ds-danger)]/40" />
              <span className="h-4 rounded-[2px] bg-[var(--ds-danger)]/40" />
            </div>
          </div>
          <span className="rounded-[3px] bg-[var(--ds-danger)]/20" />
        </div>
      ),
    },
    {
      title: 'Do not set fixed heights on content containers',
      why: 'It fails the WCAG text-spacing override, it fails localisation, and it fails the moment a string is longer than the one you designed with.',
      render: (
        <div className="h-10 w-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--ds-danger-subtle)] p-2 text-caption text-[var(--ds-danger-text)]">
          This sentence is longer than the box that was designed to hold it, so it is now clipped.
        </div>
      ),
    },
    {
      title: 'Do not use absolute positioning for layout',
      why: 'Absolutely positioned elements are removed from flow, so nothing around them can respond. It works at exactly one viewport size and breaks at every other.',
      render: (
        <div className="relative h-16 w-full rounded-[var(--radius-sm)] bg-[var(--ds-danger-subtle)]">
          <span className="absolute left-[42px] top-[18px] text-caption text-[var(--ds-danger-text)]">
            left: 42px; top: 18px
          </span>
        </div>
      ),
    },
    {
      title: 'Do not let prose fill a wide container',
      why: 'A 1200px-wide paragraph is roughly 190 characters per line. The eye loses its place on almost every return sweep.',
      render: (
        <p className="text-caption leading-relaxed text-[var(--ds-danger-text)]">
          A line this long forces a return sweep across the entire width of the screen, and after two
          or three of them most readers give up and start skimming instead, which defeats the purpose
          of writing the paragraph in the first place.
        </p>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.2', name: 'Meaningful Sequence', level: 'A' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '1.3.4', name: 'Orientation', level: 'AA' },
    ],
    contrast: [
      'Layout does not carry contrast requirements, but any visible boundary between regions must reach 3:1 if it is the only thing separating them.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Follows DOM order, not visual order. CSS Grid can reorder visually — if it does, the keyboard path no longer matches what is on screen.' },
      { keys: 'Skip link', does: 'The first focusable element must jump past the navigation to the main content.' },
    ],
    aria: [
      { attr: '<main>, <nav>, <aside>', on: 'Grid regions', note: 'Landmarks let screen-reader users jump between regions the same way sighted users jump with their eyes.' },
      { attr: 'aria-label', on: 'Multiple <nav> elements', note: 'A page with a sidebar and breadcrumbs has two navs; each needs a distinguishing label.' },
      { attr: 'order / grid-area', on: 'Any reordering', note: 'Visual reordering that does not match DOM order is a WCAG 1.3.2 failure. Change the DOM instead.' },
    ],
    focus:
      'Focus must remain visible inside scrollable grid areas. A sticky header can cover a focused element — scroll-padding-top on the scroll container fixes it.',
    screenReader: [
      'Landmarks are the primary navigation mechanism for screen-reader users. A page built entirely from divs offers no way to skip anything.',
      'display: contents on a grid item removes it from the accessibility tree in some browser and AT combinations. Avoid it on anything semantic.',
    ],
    touch:
      'Content must reflow at 320px CSS width with no horizontal scrolling. Test at 320 × 256, which is 1280 × 1024 at 400% zoom — the actual WCAG requirement.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Application shell: one grid declares every region
<div className="grid h-dvh" style={{ gridTemplateColumns: 'var(--sidebar) 1fr' }}>
  <Sidebar />
  <div className="grid grid-rows-[56px_1fr] min-w-0">
    <TopBar />
    <main className="overflow-y-auto">{children}</main>
  </div>
</div>

// Page container: capped and centred
<div className="mx-auto w-full max-w-[76rem] px-6 sm:px-10">{children}</div>

// Prose gets its own, narrower cap
<article className="max-w-[68ch]">{body}</article>

// Collections reflow with no media queries
<div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(16rem,1fr))]">
  {items.map((i) => <Card key={i.id} {...i} />)}
</div>

// min-w-0 is mandatory on any grid child that contains text.
// Without it the child's min-content width prevents the track
// from shrinking and the whole layout overflows.
<div className="grid grid-cols-[200px_1fr]">
  <aside />
  <main className="min-w-0">{longContent}</main>
</div>`,
    },
    css: {
      lang: 'css',
      code: `:root {
  --gutter: 1.5rem;          /* 24px */
  --container: 76rem;
  --sidebar: 268px;
  --topbar: 56px;
}
@media (min-width: 640px) {
  :root { --gutter: 2.5rem; }   /* 40px */
}

.page {
  inline-size: 100%;
  max-inline-size: var(--container);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

/* The shell. One declaration, no negotiation between children. */
.shell {
  display: grid;
  grid-template-columns: var(--sidebar) minmax(0, 1fr);
  block-size: 100dvh;
}

/* Collections that arrange themselves */
.collection {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
}

/* Container queries: the component adapts to its slot, not the viewport */
.card-host { container-type: inline-size; }
@container (min-width: 24rem) {
  .card { grid-template-columns: 6rem 1fr; }
}

/* dvh, not vh — vh ignores the mobile browser chrome and overflows */
.full-height { block-size: 100dvh; }`,
    },
  },

  notes: {
    tips: [
      'min-w-0 on grid and flex children that contain text. The default min-width: auto prevents shrinking below content size and is responsible for most mystery overflows.',
      'Use dvh instead of vh for full-height layouts. vh does not account for the collapsing browser chrome on mobile, so the page is always slightly too tall.',
      'Prefer subgrid for aligning content across sibling cards. It is the only way to make three cards with different-length titles align their footers.',
      'Design the 320px and the 1920px cases first. Everything in between is interpolation; the extremes are where layouts actually break.',
    ],
    performance: [
      'CSS Grid layout is fast, but a grid with thousands of implicit rows is not. Virtualise long lists rather than letting the grid create 10,000 tracks.',
      'Container queries require container-type, which creates a containment context and a new layout boundary. That is usually a performance win, but it disables percentage-based heights inside.',
      'Avoid layouts that depend on JavaScript measurement. Every measure-then-style cycle is a forced synchronous layout, and they compound during resize.',
      'content-visibility: auto on long sections skips layout and paint for offscreen content — often the single biggest win on a long documentation page.',
    ],
    mistakes: [
      'Forgetting min-w-0, so a long unbroken string makes a grid track overflow its container and produces a horizontal scrollbar on the whole page.',
      'Using vh for the app shell, so on iOS the bottom of the layout sits under the browser toolbar.',
      'Reordering with CSS so the visual order and the tab order disagree. It is a real accessibility failure, not a nitpick.',
      'Setting overflow: hidden on a grid parent to hide an overflow bug instead of fixing the track sizing. The content is still there, just unreachable.',
    ],
    realWorld: [
      'Resize the browser slowly from 320px to 2560px on every new page. Most layout bugs live in the ranges nobody designs for, between the breakpoints.',
      'A resizable sidebar needs min and max bounds and a double-click reset. Unbounded resize always ends with someone dragging it to 4px and being unable to find it again.',
      'For dashboards, prefer a fixed set of layout templates over a free-form drag-and-drop grid. Users almost never rearrange, and the templates stay consistent and testable.',
      'When a layout needs "just one more breakpoint", the component usually wants a container query instead. Viewport breakpoints multiply; container queries do not.',
    ],
  },
})
