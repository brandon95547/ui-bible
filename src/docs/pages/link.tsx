import * as React from 'react'
import { ArrowRight, ExternalLink, FileDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function A({
  children,
  variant = 'inline',
  external,
  className,
}: {
  children: React.ReactNode
  variant?: 'inline' | 'standalone' | 'quiet'
  external?: boolean
  className?: string
}) {
  return (
    <a
      href="#/link"
      // rel is not optional on target=_blank: without noopener the new page
      // gets a handle on this one.
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'rounded-[var(--radius-xs)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        variant === 'inline' &&
          'text-[var(--ds-accent-text)] underline decoration-[var(--ds-accent-border)] decoration-1 underline-offset-[3px] hover:decoration-[var(--ds-accent-text)]',
        variant === 'standalone' &&
          'inline-flex items-center gap-1 font-medium text-[var(--ds-accent-text)] no-underline hover:underline underline-offset-4',
        variant === 'quiet' &&
          'text-[var(--ds-fg-secondary)] underline decoration-[var(--ds-border-strong)] decoration-1 underline-offset-[3px] hover:text-[var(--ds-fg)] hover:decoration-[var(--ds-fg-muted)]',
        className,
      )}
    >
      {children}
      {external && (
        <>
          <ExternalLink size={12} aria-hidden className="ml-1 inline-block align-[-1px]" />
          <span className="sr-only-ds"> (opens in a new tab)</span>
        </>
      )}
    </a>
  )
}

function Playground() {
  const [variant, setVariant] = React.useState<'inline' | 'standalone' | 'quiet'>('inline')
  const [external, setExternal] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={190}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['inline', 'standalone', 'quiet'] as const}
            />
          </Knob>
          <KnobToggle checked={external} onChange={setExternal} label="External" />
        </div>
      }
      code={`<Link
  href="/deployments/4021"
  variant="${variant}"${external ? '\n  external' : ''}
>
  deployment 4021
</Link>`}
    >
      <p className="max-w-md text-body leading-relaxed text-[var(--ds-fg-secondary)]">
        The rollback returned api-gateway to{' '}
        <A variant={variant} external={external}>
          build 4019
        </A>{' '}
        after the health check failed. The full trace is attached to{' '}
        <A variant={variant} external={external}>
          deployment 4021
        </A>
        , and the postmortem is due on Friday.
      </p>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'link',
    title: 'Link',
    tagline:
      'Inline navigation. Underlines, visited state, external indicators, and never the words "click here".',
    keywords: ['anchor', 'hyperlink', 'text link', 'href', 'external', 'target blank', 'visited'],
  },

  overview: {
    purpose:
      'A link navigates. That single sentence decides almost everything about it: it is an anchor with an href, it works with middle-click and ⌘-click, it appears in the browser history, and it can be copied and shared. A button that navigates breaks all four, and it is the most common markup error in modern products.',
    whenToUse: [
      'Navigating to another page, view or anchor.',
      'Downloading a file — still a navigation, still an anchor.',
      'Referencing something inside prose, where a button would break the sentence.',
      'Any destination the user might reasonably want to open in a new tab.',
    ],
    whenNotToUse: [
      {
        text: 'It performs an action rather than navigating.',
        instead: 'a Button — even a text button looks identical and behaves correctly',
        to: '#/button',
      },
      {
        text: 'It is the primary call to action on the page.',
        instead: 'a Button, so it carries the weight the decision deserves',
        to: '#/button',
      },
      {
        text: 'It toggles or reveals something on the same page.',
        instead: 'a Button — nothing is being navigated to',
        to: '#/accordion',
      },
      {
        text: 'It opens a menu.',
        instead: 'a Button with aria-haspopup',
        to: '#/menu',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Underline inline links.</strong> Colour alone fails 1.4.1 unless it also reaches
          3:1 against the surrounding text, which almost no palette does — and it fails entirely
          for anyone who cannot distinguish it. The underline is the only signal that survives
          greyscale, low vision and a bad monitor.
        </p>
        <p>
          A link with an <code>href</code> gets middle-click, ⌘-click, "copy link address",
          browser history and the status bar for free. A <code>&lt;div onClick&gt;</code> gets
          none of it and is invisible to assistive tech. If it navigates,{' '}
          <strong>it is an anchor</strong> — there is no exception worth the trade.
        </p>
        <p>
          Link text must make sense read on its own, because screen-reader users routinely list
          every link on a page. "Click here", "read more" and "this" produce a list of identical
          entries.{' '}
          <strong>The text should name the destination</strong>, not the act of clicking.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'variants',
        title: 'Three variants',
        description:
          'Inline is underlined and always will be. Standalone drops the underline because its position and weight already mark it. Quiet is for dense metadata where accent colour would be noise.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full max-w-md">
              <p className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
                Inline, inside a sentence: see <A>deployment 4021</A> for the full trace.
              </p>
              <A variant="standalone">
                View all deployments <ArrowRight size={14} />
              </A>
              <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-muted)]">
                <span>api-gateway</span>
                <span>·</span>
                <A variant="quiet" className="text-caption">
                  eu-west-2
                </A>
                <span>·</span>
                <A variant="quiet" className="text-caption">
                  4021ab9
                </A>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'text',
        title: 'Link text names the destination',
        description:
          'Screen-reader users list every link on a page. "Read more" three times is three identical entries with no way to tell them apart.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Named" tone="good">
                <Stack gap="xs" className="text-body-sm text-[var(--ds-fg-secondary)]">
                  <A>Read the rollback postmortem</A>
                  <A>Deployment 4021 logs</A>
                  <A>Region availability</A>
                </Stack>
              </Cell>
              <Cell label="Unnamed" tone="bad">
                <Stack gap="xs" className="text-body-sm text-[var(--ds-fg-secondary)]">
                  <A>Read more</A>
                  <A>Read more</A>
                  <A>Click here</A>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'external',
        title: 'External and download',
        description:
          'An icon plus visually hidden text, because the icon alone is not announced. And rel="noopener noreferrer" is not optional on target="_blank".',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-md text-body-sm text-[var(--ds-fg-secondary)]">
              <p>
                The spec lives in the <A external>WCAG 2.2 recommendation</A>.
              </p>
              <A variant="standalone">
                <FileDown size={14} />
                deployment-log-4021.txt
                <span className="text-caption text-[var(--ds-fg-muted)]">(284 KB)</span>
              </A>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-button',
        title: 'Link or button',
        description:
          'The test is whether the URL changes. If it does, it is a link — and it must survive middle-click, ⌘-click and "copy link address".',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Navigates" sub="Link" tone="good">
                <A variant="standalone">
                  View deployment <ArrowRight size={14} />
                </A>
              </Cell>
              <Cell label="Acts" sub="Button" tone="good">
                <Button variant="text" size="sm">
                  Roll back
                </Button>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Inline', render: <A>deployment 4021</A> },
      {
        label: 'Hover',
        render: (
          <span className="text-[var(--ds-accent-text)] underline decoration-[var(--ds-accent-text)] underline-offset-[3px]">
            deployment 4021
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span className="rounded-[var(--radius-xs)] text-[var(--ds-accent-text)] underline underline-offset-[3px] outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">
            deployment 4021
          </span>
        ),
      },
      {
        label: 'Visited',
        render: (
          <span className="text-[var(--p-brand-300)] underline decoration-1 underline-offset-[3px] opacity-80">
            deployment 4019
          </span>
        ),
      },
      { label: 'Standalone', render: <A variant="standalone">View all <ArrowRight size={14} /></A> },
      { label: 'Quiet', render: <A variant="quiet">eu-west-2</A> },
      { label: 'External', render: <A external>WCAG 2.2</A> },
      { label: 'Download', render: <A variant="standalone"><FileDown size={14} /> log.txt</A> },
      {
        label: 'Disabled',
        render: (
          <span aria-disabled className="cursor-not-allowed text-[var(--ds-fg-disabled)] line-through">
            deployment 4021
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <p className="max-w-md text-body leading-relaxed text-[var(--ds-fg-secondary)]">
        The rollback returned api-gateway to <A>build 4019</A> after the health check failed in{' '}
        <A external>eu-west-2</A>.
      </p>
    ),
    caption:
      'An accent-coloured run of text with an underline offset clear of the descenders, and an external marker that is announced as well as drawn.',
    parts: [
      {
        n: 1,
        label: 'Colour',
        value: '--ds-accent-text',
        kind: 'color',
        note: 'The text-certified accent step, not the fill. The fill colour is tuned for a white foreground and fails as text on the page surface.',
      },
      {
        n: 2,
        label: 'Underline',
        value: '1px, 3px offset',
        kind: 'shape',
        note: 'Offset far enough to clear descenders on g, y and p. A flush underline strikes through them and makes the word harder to read, not easier to see.',
      },
      {
        n: 3,
        label: 'Underline colour',
        value: 'Accent border, → text on hover',
        kind: 'color',
        note: 'Slightly lighter at rest so the underline supports the word rather than competing with it, and darkening on hover confirms the target.',
      },
      {
        n: 4,
        label: 'Hit area',
        value: 'The text box',
        kind: 'size',
        note: 'An inline link is as tall as its line. That is why link-dense paragraphs are hard on touch, and why standalone links get padding.',
      },
      {
        n: 5,
        label: 'Focus ring',
        value: '2px, offset 2px',
        kind: 'color',
        note: 'Offset so the ring does not sit on the underline. A wrapped link gets a ring per line fragment, which is correct and worth expecting.',
      },
      {
        n: 6,
        label: 'External marker',
        value: '12px icon + hidden text',
        kind: 'size',
        note: 'The icon is aria-hidden and paired with "(opens in a new tab)". An icon alone is announced as nothing at all.',
      },
      {
        n: 7,
        label: 'Visited',
        value: 'Dimmed accent',
        kind: 'color',
        note: 'Worth having in documentation and search results, where "have I read this?" is a real question. Pointless in an app, where every link is visited.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent-text', usedFor: 'Link text — the text-certified step' },
    { category: 'color', token: '--ds-accent-border', usedFor: 'The underline at rest' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'A quiet link’s text' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'A quiet link’s underline' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'An unavailable link — rendered as a span, not an anchor' },
    { category: 'spacing', token: 'underline-offset', value: '3px', usedFor: 'Clearing descenders' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Focus ring corners' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Underline colour transition' },
  ],

  sizes: [
    { name: 'Inline', height: 'Line height', type: 'Inherits', use: 'Inside prose. Always underlined — colour alone is not a signal.' },
    { name: 'Standalone', height: '20px', type: '13–15px', touch: '44px with padding', use: 'On its own line, usually with a trailing arrow. Underline appears on hover.' },
    { name: 'Quiet', height: 'Line height', type: '12px', use: 'Dense metadata rows, where accent colour on every value would be noise.' },
    { name: 'External icon', icon: '12px', gap: '4px', use: 'Sized to the surrounding text so it does not disturb the line.' },
    { name: 'Touch target', touch: '44px', use: 'Standalone links get padding. Inline links inside prose cannot, which is why link-dense paragraphs are hard on a phone.' },
  ],

  do: [
    {
      title: 'Underline inline links',
      why: 'Colour alone fails for anyone who cannot distinguish it, and almost no accent reaches 3:1 against body text. The underline survives greyscale and low vision.',
      render: (
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          The full trace is in <A>deployment 4021</A>.
        </p>
      ),
    },
    {
      title: 'Name the destination in the text',
      why: 'Screen-reader users list every link on a page. "Read more" three times is three identical entries with no way to tell them apart.',
      render: (
        <Stack gap="xs" className="text-body-sm">
          <A>Read the rollback postmortem</A>
          <span className="text-caption text-[var(--ds-danger-text)]">not “read more”</span>
        </Stack>
      ),
    },
    {
      title: 'Announce a new tab, do not just draw it',
      why: 'The icon is aria-hidden and conveys nothing. Visually hidden text is what tells a screen-reader user the context is about to change.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;svg aria-hidden /&gt;
          <br />
          &lt;span class="sr-only"&gt; (opens in a new tab)&lt;/span&gt;
        </code>
      ),
    },
    {
      title: 'Always pair target="_blank" with rel',
      why: 'Without noopener, the opened page gets a handle on yours through window.opener. noreferrer also stops the referrer leaking.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          rel="noopener noreferrer"
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a div or a button to navigate',
      why: 'It loses middle-click, ⌘-click, "copy link address", browser history and the status bar — and it is invisible to assistive tech.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;div onClick={'{'}() =&gt; router.push('/x'){'}'}&gt;
        </code>
      ),
    },
    {
      title: 'Do not open new tabs by default',
      why: 'It takes the back button away from the user. They can open a new tab themselves; they cannot easily undo one you opened for them.',
      render: (
        <Stack gap="xs" className="text-body-sm">
          <A external>Every link on the page</A>
          <A external>opens a new tab</A>
          <span className="text-caption text-[var(--ds-danger-text)]">back button gone</span>
        </Stack>
      ),
    },
    {
      title: 'Do not remove the underline from inline links',
      why: 'Colour alone fails 1.4.1 unless it also reaches 3:1 against the surrounding text, which almost no palette does. In a dense paragraph the links become invisible.',
      render: (
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          The rollback returned api-gateway to{' '}
          <span className="text-[var(--ds-accent-text)] no-underline">build 4019</span> after the{' '}
          <span className="text-[var(--ds-accent-text)] no-underline">health check</span> failed.
        </p>
      ),
    },
    {
      title: 'Do not style a link as a filled button unless it is the primary action',
      why: 'A page of link-buttons has no hierarchy, and users cannot tell which one is the recommendation. Inline and standalone links exist for a reason.',
      render: (
        <Row gap="sm">
          <Button size="sm">Docs</Button>
          <Button size="sm">Pricing</Button>
          <Button size="sm">Blog</Button>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '2.4.4', name: 'Link Purpose (In Context)', level: 'A' },
      { id: '2.4.9', name: 'Link Purpose (Link Only)', level: 'AAA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.2.5', name: 'Change on Request', level: 'AAA' },
    ],
    contrast: [
      'Link text owes 4.5:1 against the page like any other text.',
      'If the link is not underlined, it must reach 3:1 against the surrounding text as well as 4.5:1 against the background. Almost no palette manages both — which is why the underline is the rule.',
      'The underline itself owes 3:1: it is the thing carrying the signal.',
      'Hover must change more than the cursor. A colour or decoration change confirms the target for anyone not watching the pointer.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves to the link. Any element with an href is focusable for free.' },
      { keys: 'Enter', does: 'Follows the link. Space does not — that is the difference from a button, and it is why the element choice matters.' },
      { keys: '⌘ / Ctrl + Enter', does: 'Opens in a new tab. Only works on a real anchor with an href.' },
      { keys: 'Middle-click', does: 'Opens in a new tab. Also only works on a real anchor.' },
    ],
    aria: [
      { attr: 'href', on: 'The anchor', note: 'Without it the element is not focusable and not announced as a link. href="#" with a click handler is the same bug in a different shape.' },
      { attr: 'rel="noopener noreferrer"', on: 'target="_blank" links', note: 'Not optional. Without noopener the opened page can reach back through window.opener.' },
      { attr: 'aria-label', on: 'A link whose text is not self-describing', note: 'Last resort. Rewriting the visible text is better for everyone, including the people who can see it.' },
      { attr: 'aria-current="page"', on: 'The link to the current view', note: 'In navigation, this is what says "you are here".' },
      { attr: 'download', on: 'A file link', note: 'Plus the file type and size in the visible text, so nobody clicks blind on a 40 MB download.' },
    ],
    focus:
      'The focus ring is offset so it does not sit on the underline. A link wrapping across lines gets a ring per fragment — that is correct behaviour and should not be "fixed" with a box-decoration hack that clips it.',
    screenReader: [
      'Users routinely list every link on a page. Each one must make sense on its own, which is what 2.4.9 is asking for.',
      'Announce a new tab in the link text via visually hidden content. An icon is aria-hidden and conveys nothing.',
      'For a download, put the type and size in the visible text: "deployment-log.txt (284 KB)" tells everyone what they are about to get.',
    ],
    touch:
      'Inline links inside prose cannot be padded without breaking the line rhythm, which makes a link-dense paragraph genuinely hard to tap. Prefer fewer, longer link phrases over many short ones. Standalone links should be padded to 44px, and adjacent links need at least 8px between them so a thumb cannot hit both.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Link } from '@/ui/Display'

<p>
  The full trace is attached to <Link href="/d/4021">deployment 4021</Link>.
</p>

<Link href="/deployments" variant="standalone">
  View all deployments <ArrowRight />
</Link>

// External: the icon is decoration, the hidden text is the announcement,
// and rel is not optional.
<a href={url} target="_blank" rel="noopener noreferrer">
  WCAG 2.2 recommendation
  <ExternalLink aria-hidden />
  <span className="sr-only"> (opens in a new tab)</span>
</a>

// The test: does the URL change? Then it is an anchor, and it must survive
// middle-click, ⌘-click and "copy link address".
<a href="/d/4021">View deployment</a>          {/* navigates */}
<button onClick={rollback}>Roll back</button>  {/* acts */}

// A disabled link is not a thing. Render a span — an anchor with no href is
// still announced as a link and still focusable in some browsers.
{canView ? (
  <Link href={href}>{label}</Link>
) : (
  <span aria-disabled className="text-[var(--ds-fg-disabled)]">{label}</span>
)}

// In a router, keep the href real so the browser affordances survive.
<a href={to} onClick={(e) => {
  if (e.metaKey || e.ctrlKey || e.button !== 0) return   // let the browser win
  e.preventDefault()
  navigate(to)
}}>{children}</a>`,
    },
    html: {
      lang: 'html',
      code: `<!-- Inline: underlined, because colour alone is not a signal. -->
<p>
  The rollback returned api-gateway to
  <a href="/builds/4019" class="ds-link">build 4019</a>.
</p>

<!-- Standalone: position and weight mark it, so the underline waits for hover. -->
<a href="/deployments" class="ds-link ds-link--standalone">
  View all deployments
  <svg aria-hidden="true">…</svg>
</a>

<!-- External: icon hidden, announcement in text, rel not optional. -->
<a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer">
  WCAG 2.2 recommendation
  <svg aria-hidden="true">…</svg>
  <span class="sr-only"> (opens in a new tab)</span>
</a>

<!-- Download: type and size visible, so nobody clicks blind. -->
<a href="/logs/4021.txt" download>
  deployment-log-4021.txt <span>(284 KB)</span>
</a>

<!-- Navigation: aria-current is what says "you are here". -->
<a href="/settings" aria-current="page">Settings</a>`,
    },
    css: {
      lang: 'css',
      code: `.ds-link {
  color: var(--ds-accent-text);      /* the text-certified step, not the fill */
  text-decoration: underline;
  text-decoration-thickness: 1px;
  /* Clears descenders on g, y and p. A flush underline strikes through them
     and makes the word harder to read, not easier to see. */
  text-underline-offset: 3px;
  /* Lighter at rest so it supports the word rather than competing with it. */
  text-decoration-color: var(--ds-accent-border);
  border-radius: var(--radius-xs);
  transition: text-decoration-color 120ms;
}

.ds-link:hover { text-decoration-color: var(--ds-accent-text); }

/* Offset so the ring does not sit on the underline. */
.ds-link:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* Position and weight already mark it, so the underline waits for hover. */
.ds-link--standalone {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  text-decoration: none;
}
.ds-link--standalone:hover { text-decoration: underline; text-underline-offset: 4px; }

/* Worth having in docs and search results; pointless in an app where every
   link is visited within a week. */
.ds-prose .ds-link:visited { color: var(--p-brand-300); }

/* Fewer, longer link phrases beat many short ones on touch — an inline link
   cannot be padded without breaking the line rhythm. */
@media (pointer: coarse) {
  .ds-link--standalone { padding-block: 10px; }
}

@media (forced-colors: active) {
  .ds-link { text-decoration: underline; }   /* colour is overridden here */
}`,
    },
    api: [
      {
        name: 'Link',
        props: [
          { name: 'href', type: 'string', required: true, description: 'Real, always. A router link that removes the href loses middle-click, ⌘-click and "copy link address".' },
          { name: 'variant', type: "'inline' | 'standalone' | 'quiet'", default: "'inline'", description: 'Inline is underlined at rest; standalone underlines on hover; quiet is for dense metadata.' },
          { name: 'external', type: 'boolean', default: 'false', description: 'Adds the icon, the hidden announcement, and rel="noopener noreferrer".' },
          { name: 'download', type: 'boolean | string', description: 'Pair it with the file type and size in the visible text.' },
          { name: 'aria-current', type: "'page' | 'step' | 'location'", description: 'On the link to the current view. This is what says "you are here".' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep link text to a meaningful phrase rather than a whole sentence. A three-line link is a large blue block that is hard to read and awkward to tap.',
      'Do not link the same phrase to two different destinations on one page. It reads as a duplicate in a link list and as a mistake to everyone else.',
      'For file downloads, put the type and size in the visible text. Nobody wants to discover a 40 MB PDF after tapping on a phone.',
      'Visited styling belongs in documentation, search results and long reference content. In an application it is noise, because everything is visited within a week.',
      'In a router, keep the real href and let ⌘-click and middle-click fall through to the browser. That is three lines of guard and it removes a whole class of complaint.',
    ],
    performance: [
      'Prefetch on hover or on viewport entry for likely destinations, with a short delay so a pointer crossing the page does not fetch everything.',
      'Do not attach a listener per link. One delegated handler on the container scales to a page of hundreds.',
      'Use native anchors so the browser can apply its own optimisations — speculative loading rules only work on real links.',
      'Avoid animating text-decoration; it forces a repaint of the text run. Transition the decoration colour instead.',
    ],
    mistakes: [
      'A div or button used to navigate, losing every browser affordance.',
      'Removing the underline from inline links, failing 1.4.1 in most palettes.',
      'target="_blank" without rel="noopener noreferrer".',
      '"Click here" and "read more", which are indistinguishable in a link list.',
      'Opening new tabs by default, taking the back button away.',
      'An external icon with no announcement, conveying nothing to a screen reader.',
      'An anchor with no href for a "disabled" link, which is still announced as a link.',
      'A flush underline that strikes through descenders.',
    ],
    realWorld: [
      'Removing underlines is the most common accessibility regression in redesigns, and it is always argued for on aesthetic grounds. The underline is doing real work.',
      'Users open their own new tabs. Products that force target="_blank" get complaints about the back button, not gratitude for the tab.',
      'Link-purpose failures are the most frequent finding in any audit of a content site, and the fix is nearly always editorial rather than technical.',
      'In single-page apps, the router link is where browser behaviour quietly disappears. Test middle-click and ⌘-click on a real link before shipping the abstraction.',
    ],
  },
})
