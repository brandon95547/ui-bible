import * as React from 'react'
import { Archive, Settings2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Divider } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Playground() {
  const [orientation, setOrientation] = React.useState<'horizontal' | 'vertical'>('horizontal')
  const [label, setLabel] = React.useState(false)
  const [inset, setInset] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={180}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Orientation">
            <KnobSelect
              value={orientation}
              onChange={setOrientation}
              options={['horizontal', 'vertical'] as const}
            />
          </Knob>
          <KnobToggle checked={label} onChange={setLabel} label="Label" />
          <KnobToggle checked={inset} onChange={setInset} label="Inset" />
        </div>
      }
      code={`<Divider${orientation === 'vertical' ? '\n  orientation="vertical"' : ''}${label ? '\n  label="or"' : ''} />`}
    >
      {orientation === 'horizontal' ? (
        <div className="w-full max-w-sm">
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">Deployment 4021</p>
          <div className={cn('my-4', inset && 'mx-6')}>
            <Divider label={label ? 'or' : undefined} />
          </div>
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">Deployment 4019</p>
        </div>
      ) : (
        <Row gap="md" align="center">
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">eu-west-2</span>
          <Divider orientation="vertical" className="h-5" />
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">42s</span>
          <Divider orientation="vertical" className="h-5" />
          <span className="text-body-sm text-[var(--ds-fg-secondary)]">Ada</span>
        </Row>
      )}
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'divider',
    title: 'Divider',
    tagline:
      'A hairline that separates — and the far more common case where spacing already did the job and a line is just noise.',
    keywords: ['separator', 'rule', 'hr', 'hairline', 'inset', 'section break', 'vertical'],
  },

  overview: {
    purpose:
      'A divider marks a boundary between two groups. It is the smallest component in the system and the most over-used, because it is the reflex answer to "these two things feel too close together" when the real answer is usually more space. Its legitimate job is separating content of the same visual weight where proximity alone would be ambiguous.',
    whenToUse: [
      'Between groups of items in a menu, a list or a toolbar, where a gap would break the rhythm.',
      'Between metadata items on one line, where a bullet would read as list content.',
      'Between a card’s body and its footer, where the footer holds actions rather than content.',
      'Around an "or" between two alternative paths, such as social sign-in and email.',
    ],
    whenNotToUse: [
      {
        text: 'Spacing already makes the grouping obvious.',
        instead: 'nothing — a divider beside adequate whitespace is ink with no meaning',
        to: '#/spacing',
      },
      {
        text: 'The sections have headings.',
        instead: 'nothing — the heading is the boundary, and the line duplicates it',
        to: '#/typography',
      },
      {
        text: 'Each item already has its own surface or border.',
        instead: 'nothing — you would be drawing a third edge between two existing ones',
        to: '#/card',
      },
      {
        text: 'The content is a table.',
        instead: 'the table’s own ruling, which follows different rules',
        to: '#/data-table',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Spacing is the better separator almost every time.</strong> Gestalt proximity
          groups without adding anything to look at; a divider adds a line the eye has to process
          before it can ignore it. The test is simple: increase the gap first. If the grouping
          becomes clear, the divider was never needed.
        </p>
        <p>
          A divider is <strong>usually decorative</strong>, and should be{' '}
          <code>aria-hidden</code> when it is. Use <code>role="separator"</code> only where the
          line carries grouping information that nothing else provides — between groups in a menu,
          for instance, where a screen-reader user would otherwise hear twelve undifferentiated
          items.
        </p>
        <p>
          The <strong>asymmetry rule</strong>: the eye reads a rule as belonging to the content
          beneath it, so a divider needs more space above than below. Equal margins make it float
          between two blocks belonging to neither.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'spacing-first',
        title: 'Try spacing first',
        description:
          'The same two groups, separated by a line and by air. The gap groups just as clearly and adds nothing to look at.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Spacing" tone="good">
                <Stack gap="md">
                  <Stack gap="xs">
                    <span className="text-label text-[var(--ds-fg)]">Notifications</span>
                    <span className="text-caption text-[var(--ds-fg-muted)]">Email, Slack</span>
                  </Stack>
                  <Stack gap="xs">
                    <span className="text-label text-[var(--ds-fg)]">Security</span>
                    <span className="text-caption text-[var(--ds-fg-muted)]">2FA, sessions</span>
                  </Stack>
                </Stack>
              </Cell>
              <Cell label="Divider" sub="Same grouping, more ink" tone="bad">
                <Stack gap="sm">
                  <Stack gap="xs">
                    <span className="text-label text-[var(--ds-fg)]">Notifications</span>
                    <span className="text-caption text-[var(--ds-fg-muted)]">Email, Slack</span>
                  </Stack>
                  <Divider />
                  <Stack gap="xs">
                    <span className="text-label text-[var(--ds-fg)]">Security</span>
                    <span className="text-caption text-[var(--ds-fg-muted)]">2FA, sessions</span>
                  </Stack>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'vertical',
        title: 'Vertical dividers',
        description:
          'Between metadata on one line and between groups in a toolbar. Always shorter than the row, so they separate rather than enclose.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="items-center">
              <Row gap="md" align="center">
                <span className="text-body-sm text-[var(--ds-fg-secondary)]">eu-west-2</span>
                <Divider orientation="vertical" className="h-4" />
                <span className="text-body-sm text-[var(--ds-fg-secondary)]">42 seconds</span>
                <Divider orientation="vertical" className="h-4" />
                <span className="text-body-sm text-[var(--ds-fg-secondary)]">Ada Lovelace</span>
              </Row>
              <Row gap="sm" align="center" className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-1.5">
                <IconButton size="sm" label="Settings" icon={<Settings2 />} />
                <Divider orientation="vertical" className="mx-1 h-5" />
                <IconButton size="sm" label="Archive" icon={<Archive />} />
                <IconButton size="sm" label="Delete" icon={<Trash2 />} />
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'labelled',
        title: 'Labelled dividers',
        description:
          'An "or" between two alternative paths. It is the one case where the divider is genuinely carrying meaning rather than just separating.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full max-w-xs">
              <Button variant="outlined" fullWidth>
                Continue with Google
              </Button>
              <Divider label="or" />
              <Button fullWidth>Continue with email</Button>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'inset',
        title: 'Inset dividers in a list',
        description:
          'In a list with leading avatars, the divider starts at the text rather than the container edge — it separates the rows, not the whole panel.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-sm overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              {['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((n, i) => (
                <div key={n}>
                  {i > 0 && (
                    <div className="ml-[52px]">
                      <Divider />
                    </div>
                  )}
                  <Row gap="sm" align="center" className="px-3 py-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--ds-layer-active)] text-caption text-[var(--ds-fg-secondary)]">
                      {n[0]}
                    </span>
                    <span className="text-label text-[var(--ds-fg)]">{n}</span>
                  </Row>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Horizontal', render: <div className="w-40"><Divider /></div> },
      { label: 'Vertical', render: <Divider orientation="vertical" className="h-8" /> },
      { label: 'Labelled', render: <div className="w-40"><Divider label="or" /></div> },
      {
        label: 'Inset',
        render: (
          <div className="w-40 pl-8">
            <Divider />
          </div>
        ),
      },
      {
        label: 'In a toolbar',
        render: (
          <Row gap="sm" align="center">
            <IconButton size="sm" variant="outlined" label="a" icon={<Settings2 />} />
            <Divider orientation="vertical" className="mx-1 h-5" />
            <IconButton size="sm" variant="outlined" label="b" icon={<Archive />} />
          </Row>
        ),
      },
      {
        label: 'Between metadata',
        render: (
          <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-muted)]">
            <span>42s</span>
            <Divider orientation="vertical" className="h-3" />
            <span>eu-west-2</span>
          </Row>
        ),
      },
      {
        label: 'Card footer',
        render: (
          <span className="block w-40 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
            <span className="block px-3 py-2 text-caption text-[var(--ds-fg-muted)]">Body</span>
            <Divider />
            <span className="block px-3 py-2 text-caption text-[var(--ds-fg-secondary)]">Footer</span>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm">
        <p className="pb-5 text-body-sm text-[var(--ds-fg-secondary)]">Content above</p>
        <Divider label="or" />
        <p className="pt-4 text-body-sm text-[var(--ds-fg-secondary)]">Content below</p>
      </div>
    ),
    caption:
      'A one-pixel rule with more space above than below, and an optional label that interrupts the line rather than sitting on it.',
    parts: [
      {
        n: 1,
        label: 'Thickness',
        value: '1px, never more',
        kind: 'shape',
        note: 'A 2px divider is a border, and a border implies a container. One pixel is enough at every density — the contrast does the work, not the weight.',
      },
      {
        n: 2,
        label: 'Colour',
        value: '--ds-border-subtle',
        kind: 'color',
        note: 'The lightest border token. A divider drawn in the default border colour competes with the edges of the components around it.',
      },
      {
        n: 3,
        label: 'Margin above',
        value: '20px',
        kind: 'space',
        note: 'More than below. The eye reads a rule as belonging to the content beneath it, so equal margins make it float between two blocks belonging to neither.',
      },
      {
        n: 4,
        label: 'Margin below',
        value: '16px',
        kind: 'space',
        note: 'The asymmetry is the whole rule. Roughly a 5:4 ratio is enough to feel deliberate without looking like a mistake.',
      },
      {
        n: 5,
        label: 'Label',
        value: '12px, muted, centred',
        kind: 'type',
        note: 'The line breaks around the label rather than running behind it. A label sitting on top of an unbroken rule reads as struck through.',
      },
      {
        n: 6,
        label: 'Inset',
        value: 'Aligned to the content',
        kind: 'space',
        note: 'In a list with leading avatars the rule starts at the text, so it separates the rows rather than cutting the whole panel in half.',
      },
      {
        n: 7,
        label: 'Vertical height',
        value: 'Shorter than its row',
        kind: 'size',
        note: '16–20px in a 44px toolbar. A full-height vertical rule reads as a container edge and the toolbar looks like two panels.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-border-subtle', usedFor: 'The rule itself' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'The optional label' },
    { category: 'spacing', token: '--space-5', value: '20px', usedFor: 'Margin above' },
    { category: 'spacing', token: '--space-4', value: '16px', usedFor: 'Margin below — deliberately less' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Vertical divider inline margins' },
    { category: 'spacing', token: 'label gap', value: '12px', usedFor: 'Break in the rule either side of a label' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Label' },
    { category: 'radius', token: 'thickness', value: '1px', usedFor: 'Every divider, at every density — 2px is a border' },
  ],

  sizes: [
    { name: 'Horizontal', height: '1px', gap: '20px above, 16px below', use: 'Between sections of equal weight. The asymmetry is not optional.' },
    { name: 'Vertical', height: '16–20px', gap: '8px inline', use: 'In a toolbar or a metadata row. Always shorter than the row it sits in.' },
    { name: 'Inset', gap: 'Aligned to content', use: 'In a list with leading content, starting at the text rather than the container edge.' },
    { name: 'Labelled', height: '1px', gap: '12px either side of the label', use: 'The line breaks around the label, never runs behind it.' },
    { name: 'Card footer', gap: '0 — the padding provides it', use: 'Full-bleed to the card edge, with the footer’s own padding doing the spacing.' },
  ],

  do: [
    {
      title: 'Increase the gap before adding a line',
      why: 'Proximity groups without adding anything to look at. If more space makes the grouping clear, the divider was never needed.',
      render: (
        <Stack gap="lg" className="w-full max-w-xs">
          <span className="text-label text-[var(--ds-fg)]">Notifications</span>
          <span className="text-label text-[var(--ds-fg)]">Security</span>
        </Stack>
      ),
    },
    {
      title: 'Give it more space above than below',
      why: 'The eye reads a rule as belonging to the content beneath it. Equal margins make it float between two blocks, belonging to neither.',
      render: (
        <div className="w-full max-w-xs">
          <span className="block pb-5 text-caption text-[var(--ds-fg-muted)]">20px above</span>
          <Divider />
          <span className="block pt-4 text-caption text-[var(--ds-fg-muted)]">16px below</span>
        </div>
      ),
    },
    {
      title: 'Hide it from assistive tech when it is decorative',
      why: 'Most dividers convey nothing that spacing does not. Announcing "separator" a dozen times down a page is noise.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;hr aria-hidden="true" /&gt;
          <br />
          <span className="text-[var(--ds-fg-muted)]">role="separator" only when it groups</span>
        </code>
      ),
    },
    {
      title: 'Keep vertical dividers shorter than the row',
      why: 'A full-height rule reads as a container edge, and a toolbar with one looks like two panels pushed together.',
      render: (
        <Row gap="sm" align="center" className="h-11 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3">
          <span className="text-caption text-[var(--ds-fg-secondary)]">One</span>
          <Divider orientation="vertical" className="mx-1 h-5" />
          <span className="text-caption text-[var(--ds-fg-secondary)]">Two</span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not add one under a heading',
      why: 'The heading is already the boundary. The line duplicates it, and the pair reads as a document from 2004.',
      render: (
        <div className="w-full max-w-xs">
          <h3 className="text-h4 text-[var(--ds-fg)]">Security</h3>
          <div className="mt-2">
            <Divider />
          </div>
        </div>
      ),
    },
    {
      title: 'Do not divide items that already have edges',
      why: 'Two card borders plus a divider is three lines in the same 20px. The gap between the cards is the separation.',
      render: (
        <Stack gap="sm" className="w-full max-w-xs">
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2 text-caption text-[var(--ds-fg-secondary)]">
            Card
          </span>
          <Divider />
          <span className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2 text-caption text-[var(--ds-fg-secondary)]">
            Card
          </span>
        </Stack>
      ),
    },
    {
      title: 'Do not use one thicker than 1px',
      why: 'At 2px it is a border, and a border implies a container the user then looks for. If it needs emphasis, use space instead.',
      render: (
        <div className="w-40">
          <span className="block h-[3px] rounded-full bg-[var(--ds-border-strong)]" />
        </div>
      ),
    },
    {
      title: 'Do not stack dividers with padding',
      why: 'A rule at the bottom of a padded section and another at the top of the next produces a double line with a gap — the classic sign of two components not talking to each other.',
      render: (
        <Stack gap="xs" className="w-40">
          <Divider />
          <span className="block h-3" />
          <Divider />
        </Stack>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'A decorative divider has no contrast requirement — it is aria-hidden and carries nothing.',
      'A divider that is the only grouping signal is meaningful non-text content and owes 3:1 under 1.4.11.',
      'In forced-colors mode, a divider drawn as a background disappears. Use a border or set forced-color-adjust so the boundary survives.',
      'A labelled divider’s text is content and owes 4.5:1.',
    ],
    keyboard: [
      { keys: '—', does: 'A divider is never focusable and never interactive.' },
      { keys: 'Tab', does: 'Passes straight over it. A separator with a tabindex is always a bug.' },
    ],
    aria: [
      { attr: 'aria-hidden="true"', on: 'A decorative divider', note: 'The default. Most dividers convey nothing that spacing does not already convey.' },
      { attr: 'role="separator"', on: 'A grouping divider', note: 'Only where the line is the sole grouping signal — between menu groups, for example.' },
      { attr: 'aria-orientation="vertical"', on: 'A vertical separator', note: 'Horizontal is the default and does not need stating.' },
      { attr: '<hr>', on: 'A thematic break in prose', note: 'The native element already has role="separator". Reach for it before a styled div.' },
    ],
    focus:
      'A divider is never in the focus order. If it needs to be — as a resize handle, for instance — it is a different component with role="separator", tabindex and aria-valuenow, not a divider with extra behaviour.',
    screenReader: [
      'A decorative divider should be silent. Twelve "separator" announcements down a settings page is noise that obscures the content.',
      'Where a divider genuinely groups, the group should also carry a label — role="group" with aria-label conveys far more than a bare separator.',
      'A labelled divider announces its label. "or" between two sign-in options is meaningful and should be heard.',
    ],
    touch:
      'Dividers are not targets and need no touch consideration of their own — but they do compete for vertical space. On a phone, prefer spacing: a settings page with eight rules is eight pixels of ink and eight interruptions in a column that is already narrow.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Divider } from '@/ui/Display'

// Decorative by default: aria-hidden, no role.
<Divider />

// Vertical, in a toolbar. Always shorter than the row.
<Divider orientation="vertical" className="h-5" />

// Labelled — the one case where the divider carries meaning.
<Divider label="or" />

// Meaningful: between groups in a menu, where the line is the ONLY grouping
// signal a sighted user gets.
<div role="menu">
  <button role="menuitem">Rename</button>
  <div role="separator" />
  <button role="menuitem">Delete</button>
</div>

// The asymmetry, as a token pair. The eye reads a rule as belonging to the
// content BENEATH it.
.section-break {
  margin-block: var(--space-5) var(--space-4);   /* 20px / 16px */
}

// Before reaching for this component at all, try:
<Stack gap="lg">…</Stack>`,
    },
    html: {
      lang: 'html',
      code: `<!-- Decorative. Silent to assistive tech. -->
<hr aria-hidden="true" class="ds-divider" />

<!-- Thematic break in prose. <hr> already has role="separator". -->
<p>The rollback completed in eight seconds.</p>
<hr />
<p>A postmortem was filed the following morning.</p>

<!-- Meaningful: the line is the only grouping signal here. -->
<div role="menu" aria-label="Actions">
  <button type="button" role="menuitem">Rename</button>
  <button type="button" role="menuitem">Duplicate</button>
  <div role="separator"></div>
  <button type="button" role="menuitem">Delete</button>
</div>

<!-- Vertical, in a toolbar. -->
<div role="toolbar" aria-label="Formatting">
  <button type="button">…</button>
  <span role="separator" aria-orientation="vertical"></span>
  <button type="button">…</button>
</div>

<!-- Labelled: the rule breaks around the word rather than running behind it. -->
<div class="ds-divider ds-divider--labelled">
  <span>or</span>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-divider {
  border: 0;
  block-size: 1px;                   /* never 2: that is a border */
  background: var(--ds-border-subtle);
  /* More above than below. The eye reads a rule as belonging to the content
     beneath it, so equal margins leave it belonging to neither. */
  margin-block: var(--space-5) var(--space-4);
}

.ds-divider[aria-orientation='vertical'],
.ds-divider--vertical {
  inline-size: 1px;
  /* Shorter than the row: a full-height rule reads as a container edge. */
  block-size: 20px;
  margin-block: 0;
  margin-inline: var(--space-2);
}

/* The line breaks AROUND the label. A label on an unbroken rule reads as
   struck through. */
.ds-divider--labelled {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  block-size: auto;
  color: var(--ds-fg-muted);
  font-size: 12px;
}
.ds-divider--labelled::before,
.ds-divider--labelled::after {
  content: '';
  flex: 1;
  block-size: 1px;
  background: var(--ds-border-subtle);
}

/* In a list with leading avatars, separate the ROWS, not the panel. */
.ds-list > * + *::before {
  content: '';
  display: block;
  block-size: 1px;
  margin-inline-start: 52px;         /* aligned to the text */
  background: var(--ds-border-subtle);
}

/* A background-drawn rule vanishes in forced colors. */
@media (forced-colors: active) {
  .ds-divider { border-block-start: 1px solid; block-size: 0; }
}`,
    },
    api: [
      {
        name: 'Divider',
        props: [
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Vertical dividers are always shorter than the row they sit in.' },
          { name: 'label', type: 'ReactNode', description: 'Breaks the rule around a centred label. The one case where a divider carries meaning.' },
          { name: 'decorative', type: 'boolean', default: 'true', description: 'aria-hidden by default. Set false only where the line is the sole grouping signal.' },
          { name: 'className', type: 'string', description: 'Where the inset and the vertical height are applied — both are context, not variants.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Count the dividers on a screen. More than three or four usually means the layout is relying on lines where it should be relying on space.',
      'In a list, put the divider on the item rather than between items — a first-child or last-child rule is easier to reason about than a separate element per gap.',
      'Full-bleed dividers in a card should extend to the card edge, ignoring its padding. A rule that stops short of the border looks like a rendering error.',
      'For metadata rows, a vertical divider reads more cleanly than a bullet, which users mistake for list content.',
      'Do not animate a divider. It is a boundary, not an event, and a line that fades in draws attention it does not deserve.',
    ],
    performance: [
      'Prefer a border or a pseudo-element over an extra DOM node in long lists. A thousand-row list with a divider element per row is a thousand nodes for a thousand pixels.',
      'Use a single background-image with a linear-gradient for repeated dividers in a virtualised list rather than an element per gap.',
      'A 1px background can render at 0.5px or 1.5px on fractional device pixel ratios. Use a border where crispness matters, or accept the softness — it is usually invisible.',
    ],
    mistakes: [
      'Reaching for a divider when the real fix was more spacing.',
      'Equal margins above and below, so the rule belongs to neither block.',
      'A rule under every heading, duplicating a boundary the heading already made.',
      'Full-height vertical dividers, which read as container edges.',
      'role="separator" on decorative dividers, producing a dozen pointless announcements.',
      'A 2px divider, which is a border and implies a container.',
      'Background-drawn rules that vanish in forced-colors mode.',
      'A divider between items that already have their own borders.',
    ],
    realWorld: [
      'Dividers proliferate during design reviews because they are the easiest thing to ask for when something "feels cramped". Audit them a week later and most can go.',
      'In dense data UIs — tables, logs, terminals — dividers earn their place, because the spacing budget genuinely does not exist.',
      'Menus are the strongest case: separators between groups measurably reduce mis-selection, and they are one of the few places the line carries real information.',
      'If a page looks better with the dividers removed, remove them. That test takes ten seconds and is right more often than not.',
    ],
  },
})
