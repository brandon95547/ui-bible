import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, defineDoc } from '../framework/kit'

/** A self-contained stage so the scrim can be shown without taking over the
    whole documentation page. */
function Stage({
  open,
  onClose,
  opacity,
  blur,
  children,
  height = 200,
}: {
  open: boolean
  onClose: () => void
  opacity: number
  blur: number
  children?: React.ReactNode
  height?: number
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]"
      style={{ height }}
    >
      {/* The content the scrim is dimming. Its legibility through the scrim
          is the entire design decision. */}
      <div className="p-4">
        <p className="text-label text-[var(--ds-fg)]">api-gateway</p>
        <p className="mt-1 text-body-sm text-[var(--ds-fg-secondary)]">
          Deployment 4021 finished in 42 seconds across three regions.
        </p>
        <Row gap="sm" className="mt-3">
          <span className="h-7 w-20 rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />
          <span className="h-7 w-16 rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />
        </Row>
      </div>

      {open && (
        <>
          <div
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 animate-[fade-in_180ms_ease-out_both]"
            style={{
              background: `rgb(0 0 0 / ${opacity})`,
              backdropFilter: blur ? `blur(${blur}px)` : undefined,
            }}
          />
          <div className="absolute inset-0 grid place-items-center p-4">{children}</div>
        </>
      )}
    </div>
  )
}

function Playground() {
  const [open, setOpen] = React.useState(true)
  const [opacity, setOpacity] = React.useState<'0.42' | '0.6' | '0.72'>('0.72')
  const [blur, setBlur] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Opacity">
            <KnobSelect
              value={opacity}
              onChange={setOpacity}
              options={['0.42', '0.6', '0.72'] as const}
            />
          </Knob>
          <KnobToggle checked={blur} onChange={setBlur} label="Blur" />
          <Button size="sm" variant="outlined" onClick={() => setOpen((o) => !o)}>
            {open ? 'Dismiss' : 'Show'}
          </Button>
        </div>
      }
      code={`<Backdrop
  open={open}
  onClose={close}
  opacity={${opacity}}${blur ? '\n  blur={2}' : ''}
/>`}
    >
      <div className="w-full max-w-lg">
        <Stage open={open} onClose={() => setOpen(false)} opacity={Number(opacity)} blur={blur ? 2 : 0}>
          <div className="w-56 rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-4 shadow-e5">
            <Row gap="sm" align="center" className="justify-between">
              <span className="text-label text-[var(--ds-fg)]">Roll back?</span>
              <IconButton size="sm" label="Close" icon={<X />} onClick={() => setOpen(false)} />
            </Row>
            <p className="mt-2 text-caption text-[var(--ds-fg-secondary)]">
              This returns api-gateway to build 4019.
            </p>
          </div>
        </Stage>
        <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">
          The page behind should read as <em>paused</em>, not gone. Try 0.42 and 0.72.
        </p>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'backdrop',
    title: 'Backdrop',
    tagline:
      'The scrim beneath every overlay. Opacity, blur, click-through, scroll locking, and what happens when two overlays collide.',
    keywords: ['scrim', 'overlay', 'dim', 'z-index', 'scroll lock', 'inert', 'stacking context'],
  },

  overview: {
    purpose:
      'A backdrop is the layer between an overlay and the page it covers. It does three jobs at once: it dims the content so the overlay is unmistakably the subject, it absorbs the click that dismisses, and it marks everything behind as temporarily unavailable. It is the only component in the system that is invisible when it works and catastrophic when it does not.',
    whenToUse: [
      'Behind any modal surface: a Dialog, a modal Drawer, a bottom sheet.',
      'Behind a full-screen menu or a mobile navigation panel.',
      'Wherever the page behind must be visibly paused rather than merely covered.',
    ],
    whenNotToUse: [
      {
        text: 'The overlay is non-modal and the page stays usable.',
        instead: 'no backdrop — a Popover or a Menu dismisses on outside click without dimming',
        to: '#/popover',
      },
      {
        text: 'You want to draw attention to something in the page itself.',
        instead: 'a Popover coach mark; dimming the whole page to highlight one control is heavy-handed',
        to: '#/popover',
      },
      {
        text: 'The surface is inline rather than layered.',
        instead: 'nothing — a Card does not need the page dimmed behind it',
        to: '#/card',
      },
    ],
    reasoning: (
      <>
        <p>
          The opacity is <strong>theme-dependent, not a constant</strong>. A white page needs far
          less dimming than a dark one to read as inactive — around 42% in light and 72% in dark.
          Using one value for both leaves the light theme looking like nothing happened, or the
          dark theme looking like the page was deleted.
        </p>
        <p>
          <strong>The scrim is not the accessibility mechanism.</strong> Dimming is visual; what
          actually removes the page behind from the tab order and the accessibility tree is{' '}
          <code>inert</code> or <code>aria-hidden</code> on the background. A backdrop with no
          inert background is a modal a keyboard user can tab straight out of, invisibly.
        </p>
        <p>
          Scroll locking has to preserve the scroll position and compensate for the scrollbar
          width, or the page jumps sideways the moment a dialog opens. That jump is the single
          most noticeable bug this component produces, and it is entirely avoidable.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'themes',
        title: 'The opacity is theme-dependent',
        description:
          'A white page needs far less dimming to read as inactive. One value for both themes leaves one of them wrong.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Dark · 72%" tone="good">
                <ScrimSample dark opacity={0.72} />
              </Cell>
              <Cell label="Light · 42%" tone="good">
                <ScrimSample opacity={0.42} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'too-much',
        title: 'Paused, not gone',
        description:
          'At 90% the context that told the user what they were confirming is unreadable. At 20% the overlay does not read as the subject at all.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="20%" sub="Overlay is not the subject" tone="bad">
                <ScrimSample dark opacity={0.2} />
              </Cell>
              <Cell label="72%" sub="Right" tone="good">
                <ScrimSample dark opacity={0.72} />
              </Cell>
              <Cell label="92%" sub="Context destroyed" tone="bad">
                <ScrimSample dark opacity={0.92} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'blur',
        title: 'Blur is separate from opacity',
        description:
          'A small blur lets you use less dimming for the same sense of separation — the page reads as out of focus rather than darkened.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="No blur · 72%" tone="good">
                <ScrimSample dark opacity={0.72} />
              </Cell>
              <Cell label="2px blur · 60%" tone="good">
                <ScrimSample dark opacity={0.6} blur={2} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'stacking',
        title: 'When two overlays stack',
        description:
          'A dialog opened from a drawer gets its own scrim, and the result is double-dimmed. Either reuse one backdrop or accept that the second overlay is the only readable thing on screen.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="relative h-32 w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-canvas)]">
              <div className="p-3 text-caption text-[var(--ds-fg-secondary)]">Page content</div>
              <div aria-hidden className="absolute inset-0 bg-black/72" />
              <div className="absolute inset-x-4 top-4 rounded-[var(--radius-md)] bg-[var(--ds-surface-overlay)] p-2 text-caption text-[var(--ds-fg-secondary)]">
                Drawer
              </div>
              <div aria-hidden className="absolute inset-0 bg-black/72" />
              <div className="absolute inset-x-8 bottom-4 rounded-[var(--radius-md)] bg-[var(--ds-surface-overlay)] p-2 text-caption text-[var(--ds-fg)] shadow-e5">
                Dialog — everything else is now 92% dark
              </div>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Dark 72%', render: <ScrimSample dark opacity={0.72} small /> },
      { label: 'Light 42%', render: <ScrimSample opacity={0.42} small /> },
      { label: 'With blur', render: <ScrimSample dark opacity={0.6} blur={2} small /> },
      { label: 'Too light', render: <ScrimSample dark opacity={0.2} small /> },
      { label: 'Too dark', render: <ScrimSample dark opacity={0.92} small /> },
      { label: 'None', render: <ScrimSample dark opacity={0} small /> },
      {
        label: 'Entering',
        render: (
          <span className="block h-14 w-20 animate-[fade-in_180ms_ease-out_both] rounded-[var(--radius-md)] bg-black/72" />
        ),
      },
      {
        label: 'Over an overlay',
        render: (
          <span className="relative block h-14 w-20 overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)]">
            <span className="absolute inset-0 bg-black/72" />
            <span className="absolute inset-0 bg-black/72" />
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <Stage open opacity={0.72} blur={2} onClose={() => {}} height={160}>
          <div className="w-44 rounded-[var(--radius-xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3 shadow-e5">
            <span className="text-label text-[var(--ds-fg)]">Dialog</span>
          </div>
        </Stage>
      </div>
    ),
    caption:
      'A full-viewport layer beneath the overlay, dimming and blurring the page and absorbing the dismissing click.',
    parts: [
      {
        n: 1,
        label: 'Coverage',
        value: 'position: fixed; inset: 0',
        kind: 'size',
        note: 'The whole viewport, including under a fixed header. A scrim that stops at the header leaves an interactive strip the user can still reach.',
      },
      {
        n: 2,
        label: 'Opacity',
        value: '72% dark, 42% light',
        kind: 'color',
        note: 'Theme-dependent, not a constant. A white page reads as inactive at far less dimming than a dark one.',
      },
      {
        n: 3,
        label: 'Blur',
        value: '2px, optional',
        kind: 'color',
        note: 'Separate from opacity. A little blur buys the same separation with less dimming, so the context stays readable.',
      },
      {
        n: 4,
        label: 'Z-index',
        value: 'One below its overlay',
        kind: 'motion',
        note: 'The pair moves together. A scrim and an overlay in different stacking contexts is how you get a dialog behind its own backdrop.',
      },
      {
        n: 5,
        label: 'Entrance',
        value: 'Fade, 180ms',
        kind: 'motion',
        note: 'Slightly slower than the overlay’s own entrance, so the dimming reads as settling behind rather than arriving with it.',
      },
      {
        n: 6,
        label: 'Click target',
        value: 'The whole layer',
        kind: 'space',
        note: 'Dismisses by default. Suppress it only where dismissal would lose work — and then the user needs another obvious way out.',
      },
      {
        n: 7,
        label: 'Inert background',
        value: 'Not visual at all',
        kind: 'shape',
        note: 'The scrim dims; inert is what actually removes the page from the tab order. Without it the modal is one Tab press from being escaped invisibly.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'The scrim fill — theme-aware by definition' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'The surface that sits on top of it' },
    { category: 'motion', token: '--duration-normal', value: '180ms', usedFor: 'Fade in and out' },
    { category: 'motion', token: '--ease-standard', usedFor: 'Fade curve' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'The overlay above the scrim' },
  ],

  sizes: [
    { name: 'Coverage', height: '100dvh', minWidth: '100vw', use: 'Fixed to the viewport, dvh so a mobile URL bar collapsing does not reveal a strip.' },
    { name: 'Dark opacity', height: '72%', use: 'Enough that a dark page reads as paused rather than merely tinted.' },
    { name: 'Light opacity', height: '42%', use: 'A white page needs far less. The same value as dark looks like a rendering fault.' },
    { name: 'Blur', height: '2px', use: 'Optional. Buys separation without extra dimming, at a real compositing cost.' },
    { name: 'Fade', height: '180ms', use: 'Slightly slower than the overlay it sits behind.' },
  ],

  do: [
    {
      title: 'Make the page behind inert',
      why: 'The scrim is visual only. Without inert or aria-hidden, a keyboard user tabs straight into the dimmed page and cannot tell where they are.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          appRoot.inert = true
          <br />
          <span className="text-[var(--ds-fg-muted)]">// not just opacity</span>
        </code>
      ),
    },
    {
      title: 'Compensate for the scrollbar when locking scroll',
      why: 'Setting overflow: hidden removes the scrollbar and the page jumps sideways by its width. Pad the body by exactly that amount.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const w = innerWidth − documentElement.clientWidth
          <br />
          body.style.paddingRight = `${'{'}w{'}'}px`
        </code>
      ),
    },
    {
      title: 'Use different opacity per theme',
      why: 'A white page reads as inactive at 42%; a dark one needs 72%. One constant leaves whichever theme you did not test looking wrong.',
      render: (
        <Row gap="sm">
          <ScrimSample dark opacity={0.72} small />
          <ScrimSample opacity={0.42} small />
        </Row>
      ),
    },
    {
      title: 'Keep the scrim and its overlay in one stacking context',
      why: 'Split across two, and a z-index anywhere else in the app can slide between them — producing a dialog rendered behind its own backdrop.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;Portal&gt;
          <br />
          &nbsp;&nbsp;&lt;Scrim /&gt; &lt;Dialog /&gt;
          <br />
          &lt;/Portal&gt;
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not dim past about 80%',
      why: 'The page behind is the context that told the user what they are confirming. Erase it and the dialog is a question with no subject.',
      render: <ScrimSample dark opacity={0.92} />,
    },
    {
      title: 'Do not stack two scrims',
      why: 'A dialog opened from a drawer double-dims the page to about 92%. Reuse one backdrop, or accept that the lower overlay is now unreadable.',
      render: (
        <span className="relative block h-16 w-32 overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)]">
          <span className="absolute inset-0 bg-black/72" />
          <span className="absolute inset-0 bg-black/72" />
          <span className="absolute inset-x-3 bottom-2 rounded-[var(--radius-sm)] bg-[var(--ds-surface-overlay)] px-2 py-1 text-[10px] text-[var(--ds-fg)]">
            Dialog
          </span>
        </span>
      ),
    },
    {
      title: 'Do not stop short of the viewport edges',
      why: 'A scrim that misses a fixed header leaves an interactive strip above a supposedly modal surface, and users find it immediately.',
      render: (
        <span className="relative block h-16 w-32 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)]">
          <span className="absolute inset-x-0 top-0 h-4 bg-[var(--ds-surface)] px-1 text-[9px] leading-4 text-[var(--ds-danger-text)]">
            still clickable
          </span>
          <span className="absolute inset-x-0 bottom-0 top-4 bg-black/72" />
        </span>
      ),
    },
    {
      title: 'Do not animate the blur',
      why: 'backdrop-filter is expensive to composite, and animating it drops frames on exactly the mid-range devices where the dialog needs to feel instant.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          transition: backdrop-filter 300ms
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The scrim itself has no contrast requirement — it is decoration. What matters is that the overlay above it still reaches its own ratios, which a very dark scrim can quietly help with and a very light one cannot.',
      'Text remaining visible through the scrim is not required to meet contrast, because it is explicitly unavailable. It must not look available either.',
      'In forced-colors mode the scrim is typically removed entirely, so the overlay must be distinguishable by its border alone.',
    ],
    keyboard: [
      { keys: 'Esc', does: 'Dismisses, matching an outside click. If clicking away closes it, Escape must too.' },
      { keys: 'Tab', does: 'Cycles within the overlay only. The scrim is never focusable and the background is inert.' },
      { keys: 'Click', does: 'On the scrim, dismisses. Suppress only where work would be lost, and then provide an obvious alternative.' },
    ],
    aria: [
      { attr: 'aria-hidden="true"', on: 'The scrim element', note: 'It is pure decoration and must never be announced.' },
      { attr: 'inert', on: 'The application root', note: 'The real mechanism. Removes the background from the tab order and the accessibility tree in one attribute.' },
      { attr: 'aria-hidden="true"', on: 'The application root', note: 'The fallback where inert is unsupported. It hides from screen readers but does not remove tab stops — you still need a focus trap.' },
      { attr: 'aria-modal="true"', on: 'The overlay', note: 'On the dialog, not the scrim. It tells assistive tech the background is unavailable.' },
    ],
    focus:
      'The scrim is never focusable. Focus moves into the overlay on open and returns to the trigger on close. The background being inert is what makes the focus trap reliable — a trap implemented purely in JavaScript will eventually be escaped by a browser-specific tab order.',
    screenReader: [
      'A scrim should be entirely silent. If a screen reader announces anything about it, it has a role or a label it should not have.',
      'The background must be genuinely removed, not merely dimmed. A user who can still arrow into the page behind has no way to know the dialog is open.',
      'Restore the background when the overlay closes, including on an error path. A page left permanently inert is unusable and looks like a crash.',
    ],
    touch:
      'Use 100dvh rather than 100vh, or a collapsing mobile URL bar reveals an undimmed strip at the bottom. Scroll locking on iOS needs position: fixed with the scroll offset restored on close — overflow: hidden alone does not hold. Backdrop blur is expensive on mid-range phones; measure before shipping it as a default.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Backdrop } from '@/ui/Overlay'

// The scrim and its overlay live in ONE portal, so nothing in the app can
// slide a z-index between them.
<Portal>
  <Backdrop open={open} onClose={close} />
  <Dialog open={open} onClose={close} />
</Portal>

// The scrim is visual. This is what actually makes the page unavailable.
React.useEffect(() => {
  if (!open) return
  const root = document.getElementById('app')!
  root.inert = true
  return () => { root.inert = false }   // including on an error path
}, [open])

// Scroll lock without the sideways jump. Removing the scrollbar shifts the
// page by its width — pad the body by exactly that amount.
function useScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (!locked) return
    const width = window.innerWidth - document.documentElement.clientWidth
    const prev = {
      overflow: document.body.style.overflow,
      padding: document.body.style.paddingRight,
    }
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = \`\${width}px\`
    return () => {
      document.body.style.overflow = prev.overflow
      document.body.style.paddingRight = prev.padding
    }
  }, [locked])
}

// Two overlays: reuse one scrim rather than stacking two to 92%.
const scrimVisible = dialogOpen || drawerOpen`,
    },
    html: {
      lang: 'html',
      code: `<!-- The page. inert is the mechanism; the scrim is the appearance. -->
<div id="app" inert>
  <h1>api-gateway</h1>
  <button type="button">Deploy</button>
</div>

<!-- Both in one stacking context. -->
<div class="ds-overlay-root">
  <!-- Pure decoration: never announced, never focusable. -->
  <div class="ds-backdrop" aria-hidden="true"></div>

  <div role="dialog" aria-modal="true" aria-labelledby="t">
    <h2 id="t">Roll back?</h2>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-backdrop {
  position: fixed;
  /* dvh, not vh: a collapsing mobile URL bar otherwise reveals an
     undimmed strip at the bottom. */
  inset: 0;
  block-size: 100dvh;
  z-index: 95;                       /* exactly one below its overlay */
  background: var(--ds-layer-scrim);
  animation: fade-in 180ms var(--ease-standard) both;
}

/* Theme-dependent, not a constant. A white page reads as inactive at far
   less dimming than a dark one. */
[data-theme='dark']  { --ds-layer-scrim: rgb(0 0 0 / 0.72); }
[data-theme='light'] { --ds-layer-scrim: rgb(0 0 0 / 0.42); }

/* Buys separation without extra dimming — at a real compositing cost.
   Never animate it. */
.ds-backdrop--blur { backdrop-filter: blur(2px); }

/* The scrim and the overlay must share one stacking context, or a z-index
   elsewhere in the app can slide between them. */
.ds-overlay-root { position: fixed; inset: 0; z-index: 95; }

@media (prefers-reduced-motion: reduce) {
  .ds-backdrop { animation: none; }
}

/* Scrims are typically removed here, so the overlay must stand on its
   border alone. */
@media (forced-colors: active) {
  .ds-backdrop { background: transparent; }
  [role='dialog'] { border: 1px solid; }
}`,
    },
    api: [
      {
        name: 'Backdrop',
        props: [
          { name: 'open', type: 'boolean', required: true, description: 'Controlled. Mount only while open — a permanently mounted scrim at opacity 0 still composites.' },
          { name: 'onClose', type: '() => void', description: 'Called on click. Omit only where dismissal would lose work, and then provide an obvious alternative.' },
          { name: 'opacity', type: 'number', default: 'theme token', description: 'Overrides the theme value. Rarely correct — the token already accounts for light and dark.' },
          { name: 'blur', type: 'number', default: '0', description: 'Pixels of backdrop blur. Expensive on mid-range devices; measure before defaulting it on.' },
          { name: 'lockScroll', type: 'boolean', default: 'true', description: 'Locks body scroll and compensates for the scrollbar width so the page does not jump.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Reuse one backdrop instance across every overlay in the app. Two stacked scrims is the most common way this component goes wrong.',
      'Fade the scrim slightly slower than the overlay it sits behind, so the dimming reads as settling rather than arriving.',
      'If clicking the scrim would lose unsaved work, do not silently suppress it — confirm instead. A dialog that ignores an outside click with no feedback reads as frozen.',
      'Match Escape to outside-click behaviour exactly. If one dismisses, both must.',
      'Test with the page scrolled halfway down. Scroll-lock bugs are invisible at the top of the page and obvious anywhere else.',
    ],
    performance: [
      'backdrop-filter forces a new compositing layer over everything beneath it. On a complex page and a mid-range phone this is measurable, and it is why blur is opt-in here.',
      'Animate opacity only. Animating the blur radius re-composites the whole layer on every frame.',
      'Unmount the scrim when closed. A permanently mounted element at opacity 0 still participates in compositing.',
      'On iOS, overflow: hidden on the body does not reliably lock scroll — position: fixed with the offset restored on close is the version that works.',
    ],
    mistakes: [
      'Relying on the scrim for accessibility, leaving the background reachable by Tab.',
      'Scroll lock with no scrollbar compensation, so the page jumps sideways on open.',
      'One opacity for both themes, leaving the light theme looking untouched.',
      'Two stacked scrims when a dialog opens from a drawer.',
      '100vh instead of 100dvh, leaving an undimmed strip on mobile.',
      'The scrim and overlay in different stacking contexts, producing a dialog behind its own backdrop.',
      'Animating backdrop-filter, dropping frames on the devices that can least afford it.',
      'Leaving the background inert after an error closes the overlay.',
    ],
    realWorld: [
      'Users click the scrim to dismiss constantly — it is the most-used dismissal path in most products, ahead of both Escape and the close button. Suppressing it needs a real reason.',
      'The scroll-position jump on open is the bug users notice most and report least, because it is hard to describe. Fix it once in the shared component.',
      'Blur looks excellent in a design review on a fast laptop and costs real frames on a three-year-old Android. Measure on the hardware your users actually have.',
      'If a product has several overlay types, one shared backdrop with a reference count is worth building early. Retrofitting it after four components have their own is far harder.',
    ],
  },
})

function ScrimSample({
  dark,
  opacity,
  blur = 0,
  small,
}: {
  dark?: boolean
  opacity: number
  blur?: number
  small?: boolean
}) {
  return (
    <span
      data-theme={dark ? 'dark' : 'light'}
      className={cn(
        'relative block overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]',
        dark ? 'bg-[#0a0b0e]' : 'bg-white',
        small ? 'h-14 w-20' : 'h-24 w-full',
      )}
    >
      <span className={cn('block p-2', small && 'p-1.5')}>
        <span
          className={cn(
            'block truncate font-medium',
            small ? 'text-[9px]' : 'text-caption',
            dark ? 'text-[#e8eaf0]' : 'text-[#0a0b0e]',
          )}
        >
          api-gateway
        </span>
        <span
          className={cn(
            'mt-0.5 block truncate',
            small ? 'text-[8px]' : 'text-caption',
            dark ? 'text-[#a8b0c0]' : 'text-[#4e5665]',
          )}
        >
          Deployment 4021 · 42s
        </span>
      </span>
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `rgb(0 0 0 / ${opacity})`,
          backdropFilter: blur ? `blur(${blur}px)` : undefined,
        }}
      />
      <span
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-sm)] bg-[var(--ds-surface-overlay)] shadow-e4',
          small ? 'px-2 py-1 text-[9px]' : 'px-3 py-1.5 text-caption',
        )}
      >
        <span className="text-[var(--ds-fg)]">Roll back?</span>
      </span>
    </span>
  )
}
