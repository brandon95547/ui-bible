import * as React from 'react'
import { Archive, Bold, HelpCircle, Info, Italic, Trash2 } from 'lucide-react'
import { Button, IconButton } from '@/ui/Button'
import { Kbd, Tooltip } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [side, setSide] = React.useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [delay, setDelay] = React.useState<'0' | '400' | '700'>('400')
  const [shortcut, setShortcut] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Side">
            <KnobSelect
              value={side}
              onChange={setSide}
              options={['top', 'bottom', 'left', 'right'] as const}
            />
          </Knob>
          <Knob label="Delay">
            <KnobSelect value={delay} onChange={setDelay} options={['0', '400', '700'] as const} />
          </Knob>
          <KnobToggle checked={shortcut} onChange={setShortcut} label="Shortcut" />
        </div>
      }
      code={`<Tooltip
  content="Archive deployment"
  side="${side}"
  delay={${delay}}${shortcut ? '\n  shortcut="E"' : ''}
>
  <IconButton label="Archive deployment" icon={<Archive />} />
</Tooltip>`}
    >
      <Tooltip
        content="Archive deployment"
        side={side}
        delay={Number(delay)}
        shortcut={shortcut ? 'E' : undefined}
      >
        {/* The label is on the button, not the tooltip. The tooltip repeats it
            for sighted pointer users; the label is what everyone else gets. */}
        <IconButton variant="outlined" label="Archive deployment" icon={<Archive />} />
      </Tooltip>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'tooltip',
    title: 'Tooltip',
    tagline:
      'A short label on hover or focus. Text only, never interactive, and never the only place information exists.',
    keywords: ['hint', 'title', 'label tip', 'delay', 'placement', 'icon button', 'aria-describedby'],
  },

  overview: {
    purpose:
      'A tooltip names or briefly explains the thing under the pointer. It is the cheapest way to make an icon-only control legible without spending horizontal space on a label. Its entire discipline comes from one constraint: it appears on hover, so it does not exist for touch users, and it must never carry information they cannot get another way.',
    whenToUse: [
      'Naming an icon-only control in a toolbar or a dense table row.',
      'Showing the keyboard shortcut for an action the user has just found.',
      'Revealing a truncated label in full.',
      'Adding a brief clarification that is genuinely optional to read.',
    ],
    whenNotToUse: [
      {
        text: 'The content is interactive — a link, a button, a field.',
        instead: 'a Popover, which is built for interactive content',
        to: '#/popover',
      },
      {
        text: 'The information is required to complete the task.',
        instead: 'a field description or helper text, always visible',
        to: '#/text-field',
      },
      {
        text: 'The explanation runs longer than about two lines.',
        instead: 'a Popover behind a help control',
        to: '#/popover',
      },
      {
        text: 'The user needs to compare or read at length.',
        instead: 'put it in the page — a tooltip vanishes the moment the pointer moves',
        to: '#/card',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>A tooltip is not an accessible name.</strong> This is the single most common
          mistake with the component. An icon button needs <code>aria-label</code> whether or not
          it has a tooltip; the tooltip repeats that name for sighted pointer users. Relying on the
          tooltip alone leaves the control anonymous for every screen-reader and touch user.
        </p>
        <p>
          The delay is doing real work. Around <strong>400ms</strong> is long enough that a pointer
          crossing a toolbar on its way elsewhere never triggers anything, and short enough that a
          deliberate hover feels responsive. Once one tooltip is open, the next should appear
          instantly — that grace period is what makes scanning a toolbar bearable.
        </p>
        <p>
          Because it appears on hover, it <strong>does not exist on touch</strong>. Anything a user
          must know to proceed cannot live here. The rule is simple: if removing every tooltip
          would break the product, the tooltips were carrying content that belonged in the page.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'toolbar',
        title: 'Naming icon-only controls',
        description:
          'The primary use. Every button still carries its own aria-label — the tooltip is the sighted-pointer version of the same information, not a replacement for it.',
        render: (
          <PreviewStage minHeight={140}>
            <Row gap="sm">
              <Tooltip content="Bold" shortcut="⌘B">
                <IconButton variant="outlined" label="Bold" icon={<Bold />} />
              </Tooltip>
              <Tooltip content="Italic" shortcut="⌘I">
                <IconButton variant="outlined" label="Italic" icon={<Italic />} />
              </Tooltip>
              <Tooltip content="Archive deployment" shortcut="E">
                <IconButton variant="outlined" label="Archive deployment" icon={<Archive />} />
              </Tooltip>
              <Tooltip content="Delete permanently">
                <IconButton variant="outlined" label="Delete permanently" icon={<Trash2 />} />
              </Tooltip>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'placement',
        title: 'Placement and collision',
        description:
          'Top by default because it is out of the pointer’s path. Near a viewport edge it flips to the opposite side rather than being clipped.',
        render: (
          <PreviewStage minHeight={200}>
            <Row gap="lg">
              {(['top', 'bottom', 'left', 'right'] as const).map((s) => (
                <Tooltip key={s} content={`Placed ${s}`} side={s}>
                  <Button variant="outlined" size="sm">
                    {s}
                  </Button>
                </Tooltip>
              ))}
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'shortcut',
        title: 'Shortcuts belong here',
        description:
          'The tooltip is where most people discover a keyboard shortcut, because it appears exactly when they are about to use the mouse instead.',
        render: (
          <PreviewStage minHeight={140}>
            <Row gap="sm" align="center">
              <span className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-inverse)]">
                Archive deployment
                <Kbd className="border-white/25 bg-white/10 text-[var(--ds-fg-inverse)]">E</Kbd>
              </span>
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'not-required',
        title: 'Never for required information',
        description:
          'The left version hides the constraint behind a hover that does not exist on a phone. The right one states it where everyone can read it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Wrong" sub="Hidden behind hover" tone="bad">
                <Row gap="sm" align="center">
                  <span className="text-label text-[var(--ds-fg-secondary)]">Password</span>
                  <Tooltip content="Must be at least 12 characters">
                    <span className="text-[var(--ds-fg-muted)]">
                      <HelpCircle size={14} />
                    </span>
                  </Tooltip>
                </Row>
              </Cell>
              <Cell label="Right" sub="Always visible" tone="good">
                <Stack gap="xs">
                  <span className="text-label text-[var(--ds-fg-secondary)]">Password</span>
                  <span className="text-caption text-[var(--ds-fg-muted)]">
                    At least 12 characters.
                  </span>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Default',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-inverse)]">
            Archive
          </span>
        ),
      },
      {
        label: 'With shortcut',
        render: (
          <span className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-inverse)]">
            Archive
            <Kbd className="border-white/25 bg-white/10 text-[var(--ds-fg-inverse)]">E</Kbd>
          </span>
        ),
      },
      {
        label: 'Two lines',
        render: (
          <span className="block max-w-[12rem] rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption leading-snug text-[var(--ds-fg-inverse)]">
            Archived deployments are kept for 90 days
          </span>
        ),
      },
      { label: 'On a button', render: <Tooltip content="Archive"><IconButton variant="outlined" label="Archive" icon={<Archive />} /></Tooltip> },
      { label: 'On text', render: <Tooltip content="Deployment identifier"><span className="cursor-help border-b border-dotted border-[var(--ds-border-strong)] text-body-sm text-[var(--ds-fg-secondary)]">dpl_7Hq3</span></Tooltip> },
      { label: 'On a help icon', render: <Tooltip content="Optional clarification"><span className="text-[var(--ds-fg-muted)]"><Info size={15} /></span></Tooltip> },
      {
        label: 'Disabled trigger',
        render: (
          <Tooltip content="You need write access to deploy">
            <span className="inline-flex">
              <Button variant="outlined" size="sm" disabled>
                Deploy
              </Button>
            </span>
          </Tooltip>
        ),
      },
      { label: 'Truncated label', render: <Tooltip content="api-gateway-production-eu-west-2"><span className="block w-24 truncate text-body-sm text-[var(--ds-fg-secondary)]">api-gateway-production-eu-west-2</span></Tooltip> },
    ],
  },

  anatomy: {
    render: (
      <Tooltip content="Archive deployment" shortcut="E">
        <IconButton variant="outlined" label="Archive deployment" icon={<Archive />} />
      </Tooltip>
    ),
    caption:
      'An inverted surface, one line of text, an optional shortcut, and a 6px gap that keeps it clear of the trigger’s focus ring.',
    parts: [
      {
        n: 1,
        label: 'Surface',
        value: 'Inverted, --ds-fg',
        kind: 'color',
        note: 'Inverted rather than another elevated panel, so it never reads as a menu or a popover the user could click into.',
      },
      {
        n: 2,
        label: 'Padding',
        value: '6px 10px',
        kind: 'space',
        note: 'Tight. A tooltip that looks roomy looks clickable, and it is not.',
      },
      {
        n: 3,
        label: 'Type',
        value: '12px, 1.4 leading',
        kind: 'type',
        note: 'One step below body. It is supplementary information and should not compete with the content behind it.',
      },
      {
        n: 4,
        label: 'Max width',
        value: '16rem, ~2 lines',
        kind: 'size',
        note: 'The ceiling is the point. Anything needing three lines is a Popover, and forcing the limit keeps the content honest.',
      },
      {
        n: 5,
        label: 'Offset',
        value: '6px from the trigger',
        kind: 'space',
        note: 'Enough to clear the trigger’s focus ring, close enough that the association is unambiguous.',
      },
      {
        n: 6,
        label: 'Delay',
        value: '400ms, 0 once warm',
        kind: 'motion',
        note: 'The pointer crossing a toolbar must not trigger anything. Once one tooltip is open, the next appears instantly.',
      },
      {
        n: 7,
        label: 'Shortcut',
        value: 'Kbd, inverted, trailing',
        kind: 'type',
        note: 'The most valuable optional content a tooltip can carry: it appears exactly when the user is reaching for the mouse instead.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-fg', usedFor: 'Tooltip surface — deliberately inverted' },
    { category: 'color', token: '--ds-fg-inverse', usedFor: 'Tooltip text' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'The dotted underline on a text trigger' },
    { category: 'spacing', token: 'padding', value: '6px 10px', usedFor: 'Tooltip padding' },
    { category: 'spacing', token: 'offset', value: '6px', usedFor: 'Gap from the trigger' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Tooltip corners' },
    { category: 'typography', token: '--text-caption', value: '12px / 1.4', usedFor: 'Tooltip text' },
    { category: 'shadow', token: '--shadow-e3', usedFor: 'Lifts it clear of the surface behind' },
    { category: 'motion', token: 'open delay', value: '400ms', usedFor: 'Hover intent' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Fade and 2px rise on enter' },
  ],

  sizes: [
    { name: 'Tooltip', height: '26px single line', padding: '6px 10px', radius: '8px', type: '12px', maxWidth: '16rem', use: 'One or two lines. Three means it should be a Popover.' },
    { name: 'Offset', gap: '6px', use: 'From the trigger, on every side. Clears the focus ring.' },
    { name: 'Viewport margin', gap: '8px', use: 'Minimum distance from any viewport edge before flipping.' },
    { name: 'Shortcut', height: '18px', use: 'A Kbd on the inverted surface, at the trailing edge.' },
  ],

  do: [
    {
      title: 'Give the trigger its own accessible name',
      why: 'A tooltip is not a name. The button needs aria-label regardless — the tooltip is the sighted-pointer version of that same information.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;button aria-label="Archive deployment"&gt;
          <br />
          + tooltip content="Archive deployment"
        </code>
      ),
    },
    {
      title: 'Show on focus as well as hover',
      why: 'Otherwise the tooltip does not exist for keyboard users, who are exactly the audience for the shortcut it usually contains.',
      render: (
        <Tooltip content="Appears on focus too" shortcut="E">
          <IconButton variant="outlined" label="Focus demo" icon={<Archive />} />
        </Tooltip>
      ),
    },
    {
      title: 'Put the keyboard shortcut in it',
      why: 'The tooltip appears at the exact moment someone is about to use the mouse. That is the best possible time to tell them there is a faster way.',
      render: (
        <span className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-inverse)]">
          Bold
          <Kbd className="border-white/25 bg-white/10 text-[var(--ds-fg-inverse)]">⌘B</Kbd>
        </span>
      ),
    },
    {
      title: 'Explain a disabled control',
      why: 'A disabled button with no reason is a dead end. Wrap it in a focusable span so the tooltip can still be reached, and say what would enable it.',
      render: (
        <Tooltip content="You need write access to deploy">
          <span className="inline-flex" tabIndex={0}>
            <Button variant="outlined" size="sm" disabled>
              Deploy
            </Button>
          </span>
        </Tooltip>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put interactive content in one',
      why: 'A tooltip disappears when the pointer leaves the trigger, so the link inside it can never be reached. That panel is a Popover.',
      render: (
        <span className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-inverse)]">
          Learn more
          <span className="underline">Read the docs →</span>
        </span>
      ),
    },
    {
      title: 'Do not hide required information',
      why: 'Hover does not exist on touch. A constraint that only appears on hover is a constraint half your users will never see.',
      render: (
        <Row gap="sm" align="center">
          <span className="text-label text-[var(--ds-fg-secondary)]">Password</span>
          <HelpCircle size={14} className="text-[var(--ds-danger-text)]" />
        </Row>
      ),
    },
    {
      title: 'Do not write a paragraph',
      why: 'It obscures the content behind it, it cannot be read at leisure because it vanishes, and it cannot be selected or copied.',
      render: (
        <span className="block max-w-[14rem] rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-fg)] px-2.5 py-1.5 text-caption leading-snug text-[var(--ds-fg-inverse)]">
          Archived deployments are retained for 90 days, after which they are permanently removed
          along with their logs, artefacts and any associated build caches, unless a legal hold
          applies.
        </span>
      ),
    },
    {
      title: 'Do not repeat a visible label',
      why: 'A tooltip that says "Deploy" on a button labelled "Deploy" is pure noise, and it trains users that tooltips are not worth reading.',
      render: (
        <Tooltip content="Deploy">
          <Button variant="outlined" size="sm">
            Deploy
          </Button>
        </Tooltip>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Inverted text on the tooltip surface must reach 4.5:1. The inverted pair is chosen for exactly this, in both themes.',
      'A Kbd inside a tooltip sits on an already-inverted surface — its own border and text must be re-derived, not reused from the light-surface version.',
      'A dotted underline on a text trigger owes 3:1; it is the only signal that the text has a tooltip at all.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Focuses the trigger and shows the tooltip. Hover-only tooltips do not exist for keyboard users.' },
      { keys: 'Esc', does: 'Dismisses the tooltip while leaving focus on the trigger. Required by 1.4.13.' },
      { keys: 'Shift + Tab', does: 'Moves away and hides it. The tooltip is never itself focusable.' },
    ],
    aria: [
      { attr: 'role="tooltip"', on: 'The tooltip element', note: 'With an id referenced by the trigger.' },
      { attr: 'aria-describedby', on: 'The trigger', note: 'When the tooltip supplements an existing label. This is the normal case.' },
      { attr: 'aria-labelledby', on: 'The trigger', note: 'Only if the tooltip genuinely is the name — and even then, prefer a real aria-label so touch users get it too.' },
      { attr: 'aria-hidden', on: 'The tooltip when closed', note: 'Or remove it from the DOM. A hidden tooltip left in the accessibility tree is announced with no context.' },
      { attr: 'tabindex="0"', on: 'A wrapper around a disabled control', note: 'Disabled elements do not fire pointer or focus events, so the tooltip needs a reachable host.' },
    ],
    focus:
      'The tooltip never takes focus — it is a description, not a destination. WCAG 1.4.13 additionally requires it to be dismissible with Escape, to stay visible while the pointer moves onto it, and not to obscure the trigger.',
    screenReader: [
      'A tooltip is announced as part of the trigger’s description, not as a separate region. It should never interrupt.',
      'Never rely on a tooltip for the trigger’s name. An icon button with only a tooltip announces as "button" with no indication of what it does.',
      'Keep the content short. It is read out in full every time the trigger receives focus, so a paragraph becomes a paragraph re-read on every tab pass.',
    ],
    touch:
      'Tooltips do not exist on touch — there is no hover. Do not attempt a long-press substitute: it conflicts with the platform’s own text-selection and context-menu gestures. Instead, ensure every tooltip’s content is available another way: a visible label, a description under the field, or a Popover behind an explicit help control.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Tooltip } from '@/ui/Display'

// The label is on the BUTTON. The tooltip repeats it for sighted pointer
// users — it is never the accessible name.
<Tooltip content="Archive deployment" shortcut="E">
  <IconButton label="Archive deployment" icon={<Archive />} />
</Tooltip>

// A disabled control fires no pointer or focus events, so the tooltip needs
// a reachable host — and the reason is exactly what makes the dead end useful.
<Tooltip content="You need write access to deploy">
  <span tabIndex={0} className="inline-flex">
    <Button disabled>Deploy</Button>
  </span>
</Tooltip>

// The delay is doing real work: a pointer crossing a toolbar must not trigger
// anything, but once one tooltip is open the next should be instant.
const warm = React.useRef(false)
const show = () => {
  const delay = warm.current ? 0 : 400
  timer.current = window.setTimeout(() => {
    setOpen(true)
    warm.current = true
  }, delay)
}
const hide = () => {
  window.clearTimeout(timer.current)
  setOpen(false)
  // Grace period: scanning a toolbar stays instant for a moment.
  window.setTimeout(() => { warm.current = false }, 300)
}

// WCAG 1.4.13: dismissible without moving the pointer or focus.
React.useEffect(() => {
  if (!open) return
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
  document.addEventListener('keydown', onKey)
  return () => document.removeEventListener('keydown', onKey)
}, [open])`,
    },
    html: {
      lang: 'html',
      code: `<!-- aria-label is the name. The tooltip DESCRIBES; it does not name. -->
<button
  type="button"
  aria-label="Archive deployment"
  aria-describedby="tip-archive"
>
  <svg aria-hidden="true">…</svg>
</button>

<div id="tip-archive" role="tooltip">
  Archive deployment
  <kbd>E</kbd>
</div>

<!-- A disabled control fires no events: give the tooltip a reachable host. -->
<span tabindex="0" aria-describedby="tip-deploy">
  <button type="button" disabled>Deploy</button>
</span>
<div id="tip-deploy" role="tooltip">You need write access to deploy</div>`,
    },
    css: {
      lang: 'css',
      code: `[role='tooltip'] {
  position: absolute;
  z-index: 90;
  /* Inverted, so it never reads as a panel you could click into. */
  background: var(--ds-fg);
  color: var(--ds-fg-inverse);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: 12px;
  line-height: 1.4;
  /* The ceiling is the point: three lines means it should be a Popover. */
  max-inline-size: 16rem;
  box-shadow: var(--shadow-e3);
  /* Never intercepts the pointer — a tooltip must not block what it labels. */
  pointer-events: none;
  animation: tooltip-in 120ms ease-out both;
}

@keyframes tooltip-in {
  from { opacity: 0; translate: 0 2px; }
  to   { opacity: 1; translate: 0 0; }
}

/* A Kbd on an already-inverted surface needs its own colours, not the ones
   tuned for a light panel. */
[role='tooltip'] kbd {
  border-color: rgb(255 255 255 / 0.25);
  background: rgb(255 255 255 / 0.1);
  color: inherit;
}

/* The only signal that a run of text has a tooltip at all. */
[data-tooltip-trigger='text'] {
  border-block-end: 1px dotted var(--ds-border-strong);
  cursor: help;
}

@media (prefers-reduced-motion: reduce) {
  [role='tooltip'] { animation: none; }
}

/* There is no hover here, and long-press belongs to the platform. */
@media (pointer: coarse) {
  [role='tooltip'] { display: none; }
}`,
    },
    api: [
      {
        name: 'Tooltip',
        props: [
          { name: 'content', type: 'ReactNode', required: true, description: 'Text only. Anything interactive belongs in a Popover.' },
          { name: 'children', type: 'ReactElement', required: true, description: 'A single focusable element. Wrap a disabled control in a focusable span.' },
          { name: 'side', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Top is out of the pointer’s path. Flips automatically near a viewport edge.' },
          { name: 'delay', type: 'number', default: '400', description: 'Open delay in ms. Drops to 0 once another tooltip has recently been open.' },
          { name: 'shortcut', type: 'string', description: 'Rendered as a Kbd at the trailing edge. The most valuable thing a tooltip can carry.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Use sentence case and no full stop. A tooltip is a label, not a sentence, and the full stop makes it read as truncated prose.',
      'Show the truncated text in full when a label is clipped — it is the one case where the tooltip and the label are legitimately the same string.',
      'Keep the tooltip out of the pointer’s path. Top placement is the default because bottom placement sits exactly where the cursor is heading.',
      'Do not animate position, only opacity and a 2px rise. A tooltip that slides between triggers draws far more attention than it deserves.',
      'Audit your tooltips periodically: if removing all of them would break the product, some of them were carrying content that belongs in the page.',
    ],
    performance: [
      'Render one tooltip element and re-point it, rather than mounting one per trigger. A table with two hundred icon buttons should not have two hundred hidden tooltips.',
      'Compute placement on open, not on every scroll frame. Anchoring maths in a scroll listener is the usual cause of jank in dense tables.',
      'Clear the open timer on unmount. A tooltip that appears after its trigger has gone is a small but memorable bug.',
      'Skip the component entirely on coarse pointers — do not ship the listeners, the timers or the markup where hover does not exist.',
    ],
    mistakes: [
      'Using the tooltip as the accessible name, leaving icon buttons anonymous for screen-reader and touch users.',
      'Hover-only, so keyboard users never see the shortcut it contains.',
      'Interactive content inside, which can never be reached before the tooltip closes.',
      'Required information hidden behind hover, which does not exist on touch.',
      'No Escape dismissal, failing WCAG 1.4.13.',
      'pointer-events left enabled, so the tooltip blocks the control it describes.',
      'Repeating a visible label, training users that tooltips are noise.',
      'A paragraph of text that cannot be selected, copied, or read at leisure.',
    ],
    realWorld: [
      'Tooltips are where keyboard shortcuts get discovered. Products that put them there see measurably higher shortcut adoption than products that document them on a help page.',
      'In dense tables, tooltips on truncated cells are worth more than any amount of column-width tuning — the user gets the full value without leaving the row.',
      'The 400ms delay is worth testing on your own product. Toolbars with tightly packed controls often want longer; a single isolated icon can afford shorter.',
      'If a designer asks for a tooltip with a link in it, the answer is a Popover. It is the most common request that this component cannot fulfil.',
    ],
  },
})
