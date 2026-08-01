import * as React from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/ui/Button'
import { NativeSelect } from '@/ui/Select'
import { Pagination } from '@/ui/Navigation'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [page, setPage] = React.useState(4)
  const [pageSize, setPageSize] = React.useState('25')
  const [siblings, setSiblings] = React.useState<'0' | '1' | '2'>('1')
  const [showTotal, setShowTotal] = React.useState(true)
  const total = 1284
  const pageCount = Math.ceil(total / Number(pageSize))

  return (
    <PreviewStage
      label="Playground"
      minHeight={150}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Siblings">
            <KnobSelect value={siblings} onChange={setSiblings} options={['0', '1', '2'] as const} />
          </Knob>
          <Knob label="Page size">
            <KnobSelect
              value={pageSize}
              onChange={(v) => {
                // Keep the user near the same records rather than resetting to 1.
                const firstRecord = (page - 1) * Number(pageSize)
                setPageSize(v)
                setPage(Math.floor(firstRecord / Number(v)) + 1)
              }}
              options={['10', '25', '50', '100'] as const}
            />
          </Knob>
          <KnobToggle checked={showTotal} onChange={setShowTotal} label="Show total" />
        </div>
      }
      code={`<Pagination
  page={${page}}
  pageCount={${pageCount}}
  siblings={${siblings}}
  onPageChange={setPage}${showTotal ? `\n  totalItems={${total}}\n  pageSize={${pageSize}}` : ''}
/>`}
    >
      <Pagination
        page={Math.min(page, pageCount)}
        pageCount={pageCount}
        siblings={Number(siblings)}
        onPageChange={setPage}
        totalItems={showTotal ? total : undefined}
        pageSize={showTotal ? Number(pageSize) : undefined}
      />
    </PreviewStage>
  )
}

function LoadMore() {
  const [loaded, setLoaded] = React.useState(20)
  const [busy, setBusy] = React.useState(false)
  const total = 68

  const more = () => {
    setBusy(true)
    window.setTimeout(() => {
      setLoaded((n) => Math.min(total, n + 20))
      setBusy(false)
    }, 500)
  }

  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <Stack gap="sm" className="w-full items-center">
        <div className="flex w-full flex-wrap gap-1.5">
          {Array.from({ length: loaded }, (_, i) => (
            <span
              key={i}
              className="h-7 flex-1 basis-16 rounded-[var(--radius-sm)] bg-[var(--ds-layer-active)]"
            />
          ))}
        </div>
        {loaded < total ? (
          <Button variant="outlined" onClick={more} loading={busy}>
            Load 20 more
          </Button>
        ) : (
          <span className="text-caption text-[var(--ds-fg-muted)]">All {total} loaded</span>
        )}
        {/* Position is what infinite scroll destroys and this keeps. */}
        <p aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
          Showing {loaded} of {total}
        </p>
      </Stack>
    </PreviewStage>
  )
}

function CursorDemo() {
  const [cursor, setCursor] = React.useState(0)
  const pages = ['evt_8fK…', 'evt_2Lm…', 'evt_9Qx…']

  return (
    <PreviewStage minHeight={0} allowResize={false}>
      <Stack gap="sm" className="items-center">
        <Row gap="sm" align="center">
          <Button
            variant="outlined"
            size="sm"
            startIcon={<ChevronLeft size={14} />}
            disabled={cursor === 0}
            onClick={() => setCursor((c) => c - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="sm"
            endIcon={<ChevronRight size={14} />}
            disabled={cursor >= pages.length - 1}
            onClick={() => setCursor((c) => c + 1)}
          >
            Next
          </Button>
        </Row>
        <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
          after={pages[cursor]}
        </span>
        <p className="max-w-sm text-center text-caption text-[var(--ds-fg-muted)]">
          No page numbers, because there is no stable page 7 in a feed that gains rows while you
          read it. Cursors trade the ability to jump for never showing a duplicate or skipping a
          record.
        </p>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'pagination',
    title: 'Pagination',
    tagline:
      'Splitting a long result set into pages a user can return to. The real question is never "how many per page" — it is whether the user needs to get back to where they were.',
    keywords: ['pager', 'load more', 'infinite scroll', 'cursor', 'offset', 'page size', 'results'],
  },

  overview: {
    purpose:
      'Pagination breaks a result set into addressable chunks. Its underrated job is not performance — it is position. A page number is a place the user can bookmark, share, return to after a browser back, and describe to a colleague. Infinite scroll trades all of that away for smoothness, and the trade is only worth it when nobody ever needs to go back.',
    whenToUse: [
      'Result sets a user searches, filters and returns to — tables, admin lists, search results.',
      'Anywhere the user might need to say "it is on page 3" or bookmark their position.',
      'Lists long enough that loading everything is slow, but bounded enough that a total is knowable.',
      'When the URL should encode where the user is, so back and refresh do the right thing.',
    ],
    whenNotToUse: [
      {
        text: 'The list is under about 50 items and fits in one scroll.',
        instead: 'no pagination — a pager under a short list is pure chrome',
        to: '#/list',
      },
      {
        text: 'It is a chronological feed nobody returns to a specific position in.',
        instead: 'load-more or infinite scroll, with the count still visible',
        to: '#/list',
      },
      {
        text: 'The dataset changes constantly and page 7 is not stable.',
        instead: 'cursor pagination — Previous / Next with no page numbers',
        to: '#/data-table',
      },
      {
        text: 'The user is stepping through a process rather than a result set.',
        instead: 'a multi-step Form',
        to: '#/form',
      },
    ],
    reasoning: (
      <>
        <p>
          The decision is <strong>offset versus cursor</strong>, and it is a data question that
          shows up in the UI. Offset pagination gives you page numbers and a total, and it
          silently duplicates or skips rows whenever the underlying set changes between requests.
          Cursor pagination is correct under change and cannot offer a "jump to page 40". Pick the
          one that matches the data, then design the control to match — page numbers on a cursor
          API is a lie the user will eventually catch.
        </p>
        <p>
          <strong>Infinite scroll costs more than it looks.</strong> It breaks the footer, breaks
          browser back, breaks the ability to bookmark a position, and makes the list impossible to
          describe to someone else. It is right for a feed and wrong for anything a user works
          through. Load-more is the honest middle: the user controls the fetch, the position
          survives, and the footer stays reachable.
        </p>
        <p>
          Ellipses are not decoration — they are how the control stays a fixed width. Without
          truncation, page 400 of 500 renders five hundred targets. First, last, current, and one
          or two neighbours is enough for every real navigation, and the width never changes as the
          user moves through the set.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'load-more',
        title: 'Load more',
        description:
          'The honest middle ground. The user decides when to fetch, the footer stays reachable, and the count tells them how much is left — which is exactly what infinite scroll hides.',
        render: <LoadMore />,
      },
      {
        id: 'cursor',
        title: 'Cursor pagination',
        description:
          'For sets that change while you read them. There are no page numbers because there is no stable page 7 — offering one would be a promise the API cannot keep.',
        render: <CursorDemo />,
      },
      {
        id: 'truncation',
        title: 'Truncation keeps the width fixed',
        description:
          'First, last, current and its neighbours. The control is the same width on page 2 and page 47, so the Next button never moves out from under the pointer.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Stack gap="md" className="items-center">
              {[1, 8, 47].map((p) => (
                <Pagination key={p} page={p} pageCount={47} onPageChange={() => {}} />
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'context',
        title: 'Always state the range',
        description:
          '"1–25 of 1,284" answers three questions a page number cannot: how big the set is, how far in you are, and whether the filter did anything.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="With context" tone="good">
                <Stack gap="sm" className="items-center">
                  <span className="text-caption text-[var(--ds-fg-secondary)]">
                    Showing 76–100 of 1,284
                  </span>
                  <Pagination page={4} pageCount={52} onPageChange={() => {}} />
                </Stack>
              </Cell>
              <Cell label="Without" tone="bad">
                <Pagination page={4} pageCount={52} onPageChange={() => {}} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'First page', render: <Pagination page={1} pageCount={12} onPageChange={() => {}} /> },
      { label: 'Middle', render: <Pagination page={6} pageCount={12} onPageChange={() => {}} /> },
      { label: 'Last page', render: <Pagination page={12} pageCount={12} onPageChange={() => {}} /> },
      { label: 'Few pages', render: <Pagination page={2} pageCount={3} onPageChange={() => {}} /> },
      { label: 'Single page', render: <Pagination page={1} pageCount={1} onPageChange={() => {}} /> },
      { label: 'With total', render: <Pagination page={2} pageCount={12} totalItems={284} pageSize={25} onPageChange={() => {}} /> },
      {
        label: 'Load more',
        render: (
          <Button variant="outlined" size="sm">
            Load 20 more
          </Button>
        ),
      },
      {
        label: 'Loading',
        render: (
          <Button variant="outlined" size="sm" startIcon={<Loader2 size={14} className="animate-spin" />}>
            Loading…
          </Button>
        ),
      },
      {
        label: 'Page size',
        render: (
          <NativeSelect
            size="sm"
            aria-label="Rows per page"
            options={[
              { value: '25', label: '25 / page' },
              { value: '50', label: '50 / page' },
            ]}
            defaultValue="25"
          />
        ),
      },
      { label: 'Cursor', render: <Row gap="sm"><Button variant="outlined" size="sm" disabled>Previous</Button><Button variant="outlined" size="sm">Next</Button></Row> },
    ],
  },

  anatomy: {
    render: <Pagination page={4} pageCount={52} totalItems={1284} pageSize={25} onPageChange={() => {}} />,
    caption:
      'Range summary, previous, truncated page numbers with the current one marked, and next. The width does not change as the page does.',
    parts: [
      {
        n: 1,
        label: 'Range summary',
        value: '"76–100 of 1,284"',
        kind: 'type',
        note: 'Placed before the controls, because it is the answer to "did my filter work?" and that question comes before "where do I go next?".',
      },
      {
        n: 2,
        label: 'Target size',
        value: '32 × 32px',
        kind: 'size',
        note: 'Square, so a one-digit and a three-digit page are the same target. Ragged widths make the row jitter as the numbers grow.',
      },
      {
        n: 3,
        label: 'Current page',
        value: 'Accent fill + aria-current',
        kind: 'color',
        note: 'Not a link. It is where you already are, so it is not a target — and aria-current="page" is what tells a screen reader that.',
      },
      {
        n: 4,
        label: 'Ellipsis',
        value: 'Static, aria-hidden',
        kind: 'shape',
        note: 'Not a button. Making it clickable to expand hidden pages is a target that behaves differently from every one beside it.',
      },
      {
        n: 5,
        label: 'Siblings',
        value: '1 either side',
        kind: 'space',
        note: 'One neighbour covers "the next one" and "the one I just left". Two is defensible on wide tables; zero makes the control read as broken.',
      },
      {
        n: 6,
        label: 'Prev / Next',
        value: '32px, disabled at the ends',
        kind: 'size',
        note: 'Disabled rather than removed. Removing them shifts every number sideways at exactly the moment the user reaches the first or last page.',
      },
      {
        n: 7,
        label: 'Gap',
        value: '2px between numbers',
        kind: 'space',
        note: 'Tight, so the run of numbers reads as one control. The gap to Prev and Next is 8px, marking them as a different kind of action.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Idle page numbers' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Hover fill on a page' },
    { category: 'color', token: '--ds-accent', usedFor: 'Current page fill' },
    { category: 'color', token: '--ds-fg-on-accent', usedFor: 'Current page number' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Ellipsis and disabled arrows — both non-targets' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'spacing', token: '--space-0-5', value: '2px', usedFor: 'Gap between page numbers' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Gap to Prev and Next' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Page target corners' },
    { category: 'typography', token: '--text-label-sm', value: '12px', usedFor: 'Page numbers, tabular figures' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover transition' },
  ],

  sizes: [
    { name: 'Small', height: '28px', minWidth: '28px', type: '12px', gap: '2px', use: 'Inside a card or a compact table footer.' },
    { name: 'Medium', height: '32px', minWidth: '32px', type: '12px', gap: '2px', touch: '44px on coarse pointers', use: 'The default.' },
    { name: 'Range summary', type: '12px', use: 'Left of the controls on desktop, above them on mobile.' },
    { name: 'Page size select', height: '32px', minWidth: '7rem', use: '10 / 25 / 50 / 100. Persist the choice — it is a preference, not a per-visit decision.' },
    { name: 'Load more', height: '36px', minWidth: '10rem', use: 'Centred under the list, with the loaded-of-total count beneath it.' },
  ],

  do: [
    {
      title: 'Put the page in the URL',
      why: 'A page number that vanishes on refresh is not a position. Bookmarking, sharing and browser back are most of what pagination is for over infinite scroll.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          /deployments?page=4&amp;size=25
        </code>
      ),
    },
    {
      title: 'Show the range, not just the page',
      why: '"76–100 of 1,284" tells the user how big the set is and whether their filter did anything. "Page 4" tells them almost nothing.',
      render: (
        <span className="text-caption text-[var(--ds-fg-secondary)]">Showing 76–100 of 1,284</span>
      ),
    },
    {
      title: 'Keep the user near the same records when the page size changes',
      why: 'Jumping to page 1 because they switched from 25 to 50 loses their place. Recompute the page from the first visible record instead.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const first = (page − 1) × oldSize
          <br />
          setPage(⌊first / newSize⌋ + 1)
        </code>
      ),
    },
    {
      title: 'Move focus to the results, not the pager',
      why: 'After a page change the user wants the new rows. Focus the results region and announce the range, or a keyboard user is left at the bottom with no idea anything happened.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          results.focus()
          <br />
          announce(`Showing 76–100 of 1,284`)
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not render every page number',
      why: 'Five hundred targets is not navigation. Truncation keeps the control a fixed width, so Next stays where the pointer expects it on every page.',
      render: (
        <div className="flex max-w-xs flex-wrap gap-0.5">
          {Array.from({ length: 40 }, (_, i) => (
            <span
              key={i}
              className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] text-[10px] text-[var(--ds-fg-muted)]"
            >
              {i + 1}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: 'Do not use infinite scroll for a working list',
      why: 'It breaks the footer, breaks browser back, and makes a position impossible to bookmark or describe. Fine for a feed; wrong for anything a user works through.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <div className="h-5 rounded bg-[var(--ds-layer-active)]" />
          <div className="h-5 rounded bg-[var(--ds-layer-active)]" />
          <div className="h-5 rounded bg-[var(--ds-layer-active)] opacity-60" />
          <div className="h-5 rounded bg-[var(--ds-layer-active)] opacity-30" />
          <span className="text-caption text-[var(--ds-danger-text)]">…footer unreachable</span>
        </Stack>
      ),
    },
    {
      title: 'Do not remove Prev and Next at the ends',
      why: 'Removing them re-flows every number sideways at exactly the moment the user has arrived at page 1 or the last page. Disable them in place.',
      render: (
        <Row gap="sm" align="center">
          <span className="text-caption text-[var(--ds-fg-muted)]">1 2 3 →</span>
          <span className="text-caption text-[var(--ds-danger-text)]">vs</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">← 1 2 3 →</span>
        </Row>
      ),
    },
    {
      title: 'Do not offer page numbers over a cursor API',
      why: 'The control promises a jump to page 40 that the backend cannot deliver, and the first time someone tries it the product looks broken rather than the API.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          Page 40 → “after=?” → there is no cursor for page 40
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.8', name: 'Location', level: 'AAA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The current page must be distinguishable from the rest by more than a tint — it carries a fill and an inverted label, so the state survives greyscale.',
      'Disabled arrows may use the disabled tone; they are not targets. Idle page numbers are targets and owe 4.5:1.',
      'The ellipsis is decorative and aria-hidden, so it is exempt — which is only true because it is genuinely not interactive.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Stops on Prev, each rendered page, then Next. Truncation is what keeps that from being fifty stops.' },
      { keys: 'Enter / Space', does: 'Navigates to that page.' },
      { keys: '← / →', does: 'Optional shortcut for previous and next when focus is inside the results region — a genuine accelerator for scanning a long set.' },
      { keys: 'Home / End', does: 'On a focused pager, jumps to the first or last page.' },
    ],
    aria: [
      { attr: 'role="navigation"', on: 'The container', note: 'With aria-label="Pagination". It is a landmark, so it can be jumped to and skipped.' },
      { attr: 'aria-current="page"', on: 'The current page', note: 'The current page is not a link. This is what announces "you are here" rather than "go here".' },
      { attr: 'aria-label', on: 'Each page target', note: '"Go to page 4". A bare "4" announces as a number with no indication of what it does.' },
      { attr: 'aria-live="polite"', on: 'The range summary', note: 'Announces "Showing 76 to 100 of 1,284" after a page change, which is the only feedback a screen-reader user gets.' },
      { attr: 'aria-disabled', on: 'Prev on page 1, Next on the last', note: 'Keeps them in the tab order and in place, so nothing shifts at the ends of the set.' },
    ],
    focus:
      'After a page change, move focus to the results region — with tabindex="-1" — not back to the pager. The user asked for new rows, so put them at the top of the reading order. Never leave focus on a button that has just become disabled.',
    screenReader: [
      'The landmark announces as "Pagination, navigation", so it can be skipped in one gesture.',
      'The live region must fire after the new results land, not when the request starts, or the announced range is the old one.',
      'For load-more, announce the delta as well as the total: "20 more loaded, 40 of 68 showing".',
    ],
    touch:
      'Page targets grow to 44px on coarse pointers, which usually means dropping to zero siblings and showing only Prev, the current page, and Next. Numeric pagination is a desktop pattern; on a phone, load-more with a visible count is almost always the better control.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Pagination } from '@/ui/Navigation'

// The page lives in the URL. That is what makes it a position rather than
// a piece of component state that dies on refresh.
const [params, setParams] = useSearchParams()
const page = Number(params.get('page') ?? 1)
const size = Number(params.get('size') ?? 25)

<Pagination
  page={page}
  pageCount={Math.ceil(total / size)}
  totalItems={total}
  pageSize={size}
  onPageChange={(p) => {
    setParams({ page: String(p), size: String(size) })
    // The user asked for rows, not for the pager. Send them to the rows.
    resultsRef.current?.focus()
  }}
/>

// Changing page size must not lose the user's place.
function onPageSizeChange(next: number) {
  const firstRecord = (page - 1) * size
  setParams({ page: String(Math.floor(firstRecord / next) + 1), size: String(next) })
}

// Cursor pagination: no page numbers, because there is no stable page 7.
<Row>
  <Button disabled={!before} onClick={() => fetchPage({ before })}>Previous</Button>
  <Button disabled={!after}  onClick={() => fetchPage({ after })}>Next</Button>
</Row>`,
    },
    html: {
      lang: 'html',
      code: `<nav role="navigation" aria-label="Pagination">
  <p class="ds-pager__summary">Showing 76–100 of 1,284</p>

  <a href="?page=3" aria-label="Go to previous page" rel="prev">
    <svg aria-hidden="true">…</svg>
  </a>

  <a href="?page=1" aria-label="Go to page 1">1</a>
  <span aria-hidden="true">…</span>
  <a href="?page=3" aria-label="Go to page 3">3</a>

  <!-- Where you are is not somewhere to go. -->
  <span aria-current="page">4</span>

  <a href="?page=5" aria-label="Go to page 5">5</a>
  <span aria-hidden="true">…</span>
  <a href="?page=52" aria-label="Go to page 52">52</a>

  <a href="?page=5" aria-label="Go to next page" rel="next">
    <svg aria-hidden="true">…</svg>
  </a>
</nav>

<p class="sr-only" role="status" aria-live="polite">Showing 76 to 100 of 1,284</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-pager {
  display: flex;
  align-items: center;
  gap: 2px;                        /* the run of numbers is one control */
}

.ds-pager__nav {
  margin-inline: 6px;              /* 8px total — Prev/Next are a different job */
}

/* Square, so a 1 and a 400 are the same target and the row never jitters. */
.ds-pager a,
.ds-pager [aria-current] {
  min-inline-size: 32px;
  block-size: 32px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--ds-fg-secondary);
}

.ds-pager a:hover { background: var(--ds-layer-hover); color: var(--ds-fg); }

.ds-pager [aria-current='page'] {
  background: var(--ds-accent);
  color: var(--ds-fg-on-accent);
  cursor: default;                 /* it is not a destination */
}

/* Disabled, never removed — removing shifts every number at the set's ends. */
.ds-pager [aria-disabled='true'] {
  color: var(--ds-fg-disabled);
  pointer-events: none;
}

@media (pointer: coarse) {
  .ds-pager a,
  .ds-pager [aria-current] { min-inline-size: 44px; block-size: 44px; }
  /* Numeric paging is a desktop pattern. Drop to Prev / current / Next. */
  .ds-pager__sibling { display: none; }
}`,
    },
    api: [
      {
        name: 'Pagination',
        props: [
          { name: 'page', type: 'number', required: true, description: '1-indexed current page. Should be read from the URL, not from local state.' },
          { name: 'pageCount', type: 'number', required: true, description: 'Total pages. Renders nothing when this is 1.' },
          { name: 'onPageChange', type: '(page: number) => void', required: true, description: 'Update the URL here, and move focus to the results.' },
          { name: 'siblings', type: 'number', default: '1', description: 'Pages shown either side of the current one. 0 on mobile, 2 on wide tables.' },
          { name: 'totalItems', type: 'number', description: 'Enables the "76–100 of 1,284" summary. Supply it whenever the count is knowable.' },
          { name: 'pageSize', type: 'number', description: 'Needed with totalItems to compute the displayed range.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Default to 25 rows. It fills a laptop viewport without scrolling and keeps the response small enough to feel instant.',
      'Persist the page-size choice per user, not per visit. It is a preference about how someone likes to work.',
      'Prefetch the next page on hover over Next. It is a cheap request and it makes the most common navigation feel instant.',
      'Show a skeleton in the existing rows rather than emptying the table. A table that goes blank between pages reads as an error.',
      'Reset to page 1 when a filter changes — but say so, because silently jumping is disorienting when the user was on page 12.',
    ],
    performance: [
      'Offset pagination gets slower as the offset grows: OFFSET 100000 makes the database walk 100,000 rows. Cursors are constant-time, which is the real reason large systems use them.',
      'Cache the total count separately and refresh it less often. COUNT(*) over a filtered set is frequently more expensive than the page query itself.',
      'Prefetch exactly one page ahead. Prefetching five is a lot of wasted work for a user who was going to stop at page 2.',
      'Keep the previous page rendered while the next loads, and swap in one commit. A blank frame between pages is perceived as slower than the same wait with stale rows.',
    ],
    mistakes: [
      'Page state in the component rather than the URL, so refresh and back both lose the position.',
      'Rendering every page number, producing hundreds of tab stops and a control whose width changes constantly.',
      'Resetting to page 1 on a page-size change, losing the user’s place for no reason.',
      'Leaving focus on Next after it becomes disabled on the last page.',
      'Page numbers over a cursor API, promising a jump the backend cannot perform.',
      'No live region, so a screen-reader user presses Next and hears nothing at all.',
      'Infinite scroll on a list with a footer, making the footer permanently unreachable.',
    ],
    realWorld: [
      'Most users never leave page 1. If yours do routinely, the problem is ranking or filtering, not pagination — fix the thing that made page 4 necessary.',
      'Search results are the one place where jumping deep is common, which is why they are the strongest case for numbered pages and a visible total.',
      'Feeds are the one place infinite scroll is genuinely right, and even there a "back to top" control after a few screens is worth more than it costs.',
      'Load-more consistently outperforms both in usability testing for working lists: the user controls the fetch, the position survives, and the footer stays reachable.',
    ],
  },
})
