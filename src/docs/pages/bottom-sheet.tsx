import * as React from 'react'
import { Copy, Link2, Pencil, Share2, Star, Trash2 } from 'lucide-react'
import { BottomSheet } from '@/ui/Overlay'
import { Button } from '@/ui/Button'
import { Field, TextInput } from '@/ui/Input'
import { Switch } from '@/ui/Toggle'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const DETENTS = {
  none: undefined,
  '50 / 90': [0.5, 0.9],
  '30 / 60 / 90': [0.3, 0.6, 0.9],
} as const

type DetentKey = keyof typeof DETENTS

const ACTIONS = [
  { label: 'Share', icon: <Share2 size={17} /> },
  { label: 'Copy link', icon: <Link2 size={17} /> },
  { label: 'Duplicate', icon: <Copy size={17} /> },
  { label: 'Rename', icon: <Pencil size={17} /> },
  { label: 'Add to favourites', icon: <Star size={17} /> },
]

function ActionList({ long }: { long?: boolean }) {
  const items = long ? [...ACTIONS, ...ACTIONS, ...ACTIONS] : ACTIONS
  return (
    <Stack gap="xs">
      {items.map((a, i) => (
        <button
          key={`${a.label}-${i}`}
          type="button"
          className="flex h-11 items-center gap-3 rounded-[var(--radius-md)] px-2 text-left text-label text-[var(--ds-fg)] transition-colors hover:bg-[var(--ds-layer-hover)]"
        >
          <span className="text-[var(--ds-fg-muted)]" aria-hidden>
            {a.icon}
          </span>
          {a.label}
        </button>
      ))}
      <button
        type="button"
        className="flex h-11 items-center gap-3 rounded-[var(--radius-md)] px-2 text-left text-label text-[var(--ds-danger-text)] transition-colors hover:bg-[var(--ds-danger-subtle)]"
      >
        <Trash2 size={17} aria-hidden />
        Delete
      </button>
    </Stack>
  )
}

function Playground() {
  const [open, setOpen] = React.useState(false)
  const [detentKey, setDetentKey] = React.useState<DetentKey>('none')
  const [footer, setFooter] = React.useState(false)
  const detents = DETENTS[detentKey]

  return (
    <PreviewStage
      label="Playground"
      minHeight={200}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Detents">
            <KnobSelect
              value={detentKey}
              onChange={setDetentKey}
              options={['none', '50 / 90', '30 / 60 / 90'] as const}
            />
          </Knob>
          <KnobToggle checked={footer} onChange={setFooter} label="Footer" />
        </div>
      }
      code={`<BottomSheet
  open={open}
  onClose={() => setOpen(false)}
  title="Deployment"${detents ? `\n  detents={[${detents.join(', ')}]}` : ''}${
    footer ? '\n  footer={<Button fullWidth>Done</Button>}' : ''
  }
>
  <ActionList />
</BottomSheet>`}
    >
      <Stack gap="md" className="items-center">
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <p className="max-w-[46ch] text-center text-caption text-[var(--ds-fg-muted)]">
          Drag the handle. With no detents the sheet is sized by its content and one pull down
          dismisses it. With detents it collapses a step at a time and only dismisses from the
          smallest.
        </p>
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Deployment"
          detents={detents ? [...detents] : undefined}
          footer={
            footer ? (
              <Button fullWidth onClick={() => setOpen(false)}>
                Done
              </Button>
            ) : undefined
          }
        >
          <ActionList long={!!detents} />
        </BottomSheet>
      </Stack>
    </PreviewStage>
  )
}

function FormSheet() {
  const [open, setOpen] = React.useState(false)
  const [restart, setRestart] = React.useState(true)
  return (
    <Stack gap="md" className="items-center">
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Edit deployment
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Edit deployment"
        footer={
          <>
            <Button variant="text" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)} className="flex-1">
              Save
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <Field label="Name">
            <TextInput defaultValue="api-gateway" />
          </Field>
          <Field label="Instances">
            <TextInput defaultValue="4" inputMode="numeric" />
          </Field>
          <Switch
            checked={restart}
            onCheckedChange={setRestart}
            align="end"
            label="Restart on change"
          />
        </Stack>
      </BottomSheet>
    </Stack>
  )
}

/** A phone silhouette with the sheet drawn at a given resting height. */
function SheetDiagram({
  fraction = 0.5,
  label,
  tone = 'neutral',
  handle = true,
}: {
  fraction?: number
  label?: string
  tone?: 'neutral' | 'good' | 'bad'
  handle?: boolean
}) {
  const border =
    tone === 'good'
      ? 'border-[var(--ds-success-border)]'
      : tone === 'bad'
        ? 'border-[var(--ds-danger-border)]'
        : 'border-[var(--ds-border)]'
  return (
    <Stack gap="xs" className="items-center">
      <span
        className={`relative block h-[9.5rem] w-[5.5rem] overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--ds-canvas)] ${border}`}
      >
        <span className="absolute inset-0 flex flex-col gap-1 p-1.5">
          {[70, 55, 62].map((w, i) => (
            <span
              key={i}
              className="h-2 rounded-[2px] bg-[var(--ds-surface-inset)]"
              style={{ width: `${w}%` }}
            />
          ))}
        </span>
        <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />
        <span
          className="absolute inset-x-0 bottom-0 rounded-t-[10px] border-t border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4"
          style={{ height: `${fraction * 100}%` }}
        >
          {handle && (
            <span className="mx-auto mt-1.5 block h-[3px] w-6 rounded-full bg-[var(--ds-border-strong)]" />
          )}
        </span>
      </span>
      {label && (
        <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">{label}</span>
      )}
    </Stack>
  )
}

export default defineDoc({
  meta: {
    id: 'bottom-sheet',
    title: 'Bottom Sheet',
    group: 'Overlays',
    tagline:
      'The mobile dialog. It opens where the thumb already is, it can be thrown away with a flick, and it rests at heights you choose.',
    keywords: [
      'sheet',
      'mobile modal',
      'action sheet',
      'drag',
      'detent',
      'snap point',
      'half sheet',
      'modal bottom sheet',
    ],
  },

  overview: {
    purpose:
      'A bottom sheet is a panel anchored to the bottom edge of a touch screen. It carries the same jobs a dialog carries on desktop — a short list of actions, a focused form, a picker — but it arrives inside the thumb zone and leaves by being pushed back where it came from.',
    whenToUse: [
      'Any modal surface on a phone. On touch, this is the dialog.',
      'A menu of actions for something the user has just long-pressed or tapped a "more" control on.',
      'A picker — date, quantity, address — where the content behind gives the choice its meaning.',
      'A short form. Two or three fields and a save, without spending a route on it.',
      'Progressive disclosure: a summary at half height that the user can pull up for the detail.',
    ],
    whenNotToUse: [
      {
        text: 'The viewport is a desktop browser.',
        instead: 'a Dialog, or a Drawer if the page behind matters',
        to: '#/dialogs',
      },
      {
        text: 'It is a destructive confirmation.',
        instead: 'a Dialog. A surface that can be flicked away by accident is the wrong place to confirm a deletion',
        to: '#/dialogs',
      },
      {
        text: 'The content is a whole workflow.',
        instead: 'a page. A sheet at 90% height is a page that cannot be linked to or refreshed',
      },
      {
        text: 'It is transient feedback about something that already happened.',
        instead: 'a Snackbar — it does not need dismissing',
        to: '#/snackbars',
      },
      {
        text: 'The sheet would be permanently on screen.',
        instead: 'a panel in the layout. A modal surface that never closes is furniture pretending to be an overlay',
      },
    ],
    reasoning: (
      <>
        <p>
          A centred dialog on a phone is a surface the thumb cannot comfortably reach, dismissed by
          a control in the far corner. The sheet solves both by moving to the bottom: its actions
          land in the comfortable third of the screen, and its dismissal is a push in the direction
          it came from rather than a stretch to a 24px ✕.
        </p>
        <p>
          <strong>The handle and the corner radius are the entire instruction manual.</strong> A
          28px top radius over a squared-off page says this is a separate sheet lying on top; a 4px
          bar says it moves. Nobody reads a tooltip explaining a gesture, and with these two signals
          nobody has to.
        </p>
        <p>
          <strong>Detents are what make it more than a dialog.</strong> Resting heights let one
          surface answer two different questions: half height shows the summary while the map or the
          list behind stays visible, and a pull up commits to the detail. That progressive reveal is
          not available to a dialog at all, and it is the reason to reach for a sheet even where a
          dialog would technically fit.
        </p>
        <p>
          <strong>The dismissal threshold is a scroll-safety number.</strong> 110px is far enough
          that flicking a scrollable list inside the sheet never throws the sheet away, and near
          enough that a deliberate push always works. With more than one detent a downward drag
          collapses a step first, so the gesture that shrinks and the gesture that dismisses are the
          same motion at different depths — which is exactly how users expect it to behave.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'detents',
        title: 'Resting heights',
        description:
          'The sheet opens at the smallest detent — the least intrusive height that still answers the question — and the user pulls it up if they want more.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="end" className="justify-center">
              <SheetDiagram fraction={0.3} label="0.3 · summary" />
              <SheetDiagram fraction={0.6} label="0.6 · detail" />
              <SheetDiagram fraction={0.9} label="0.9 · full" />
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'form',
        title: 'A short form',
        description:
          'Two or three fields with the actions pinned to the bottom, padded past the home indicator. Any longer and it wants a page.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <FormSheet />
          </PreviewStage>
        ),
      },
      {
        id: 'never-full',
        title: 'Never the whole screen',
        description:
          'The strip of scrimmed page at the top is what tells the user they are on top of something rather than somewhere new. Take it away and the back gesture becomes a guess.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <Row gap="lg" align="end" className="justify-center">
              <SheetDiagram fraction={0.85} tone="good" label="85% · still an overlay" />
              <SheetDiagram fraction={1} tone="bad" handle={false} label="100% · a page now" />
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Content height', render: <SheetDiagram fraction={0.35} /> },
      { label: 'Half detent', render: <SheetDiagram fraction={0.5} /> },
      { label: 'Full detent', render: <SheetDiagram fraction={0.85} /> },
      { label: 'Dragging', note: 'follows the finger', render: <SheetDiagram fraction={0.42} /> },
      { label: 'No handle', note: 'no gesture affordance', render: <SheetDiagram fraction={0.5} handle={false} tone="bad" /> },
      { label: 'Full screen', note: 'that is a page', render: <SheetDiagram fraction={1} handle={false} tone="bad" /> },
      {
        label: 'Handle',
        render: <span className="block h-1 w-9 rounded-full bg-[var(--ds-border-strong)]" />,
      },
      {
        label: 'Dismiss threshold',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">110px</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="relative mx-auto h-[19rem] w-[16rem] overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] shadow-e3">
        <div className="flex flex-col gap-2 p-3">
          {[76, 60, 68, 52].map((w, i) => (
            <span
              key={i}
              className="h-4 rounded-[3px] bg-[var(--ds-surface-inset)]"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 flex h-[62%] flex-col rounded-t-[var(--radius-3xl)] border-t border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5">
          <div className="flex justify-center pb-1 pt-3">
            <span className="h-1 w-9 rounded-full bg-[var(--ds-border-strong)]" />
          </div>
          <div className="px-5 pb-3 pt-1">
            <span className="text-label font-semibold text-[var(--ds-fg)]">Deployment</span>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 overflow-hidden px-5">
            {['Share', 'Copy link', 'Duplicate'].map((l) => (
              <span key={l} className="text-caption text-[var(--ds-fg-secondary)]">
                {l}
              </span>
            ))}
          </div>
          <div className="border-t border-[var(--ds-border-subtle)] px-5 py-3 pb-5">
            <span className="block h-8 rounded-[var(--radius-md)] bg-[var(--ds-accent)]" />
          </div>
        </div>
      </div>
    ),
    caption:
      'A sheet at its 62% detent. The scrimmed strip above it is deliberate: it is the only thing telling the user this is an overlay and not a new screen.',
    parts: [
      {
        n: 1,
        label: 'Scrim',
        value: '--ds-layer-scrim',
        kind: 'color',
        note: 'Dims the page and takes the tap that closes the sheet. On a phone it is often the largest dismiss target on screen, which is the point.',
      },
      {
        n: 2,
        label: 'Top radius',
        value: '28px, top corners only',
        kind: 'shape',
        note: 'The bottom corners stay square because they run off the screen. Rounding all four makes the sheet look like a floating card that has got stuck at the bottom.',
      },
      {
        n: 3,
        label: 'Grab handle',
        value: '36 × 4px, 12px above',
        kind: 'size',
        note: 'The only signal that the surface moves. It is decorative to a screen reader and essential to everyone else — and the drag target around it is 44px tall, not 4px.',
      },
      {
        n: 4,
        label: 'Title',
        value: '--text-h4',
        kind: 'type',
        note: 'Optional but load-bearing: it is the accessible name of the dialog. An action sheet with no title announces as an unnamed dialog.',
      },
      {
        n: 5,
        label: 'Body',
        value: '20px inline padding',
        kind: 'space',
        note: 'The only scrolling region. Its scroll must be exhausted before a downward drag starts moving the sheet, or scrolling to the top of a list throws the sheet away.',
      },
      {
        n: 6,
        label: 'Row height',
        value: '44px minimum',
        kind: 'size',
        note: 'Action rows are full-width targets. On the surface designed for thumbs, a 32px row is indefensible.',
      },
      {
        n: 7,
        label: 'Footer',
        value: '16px + safe-area inset',
        kind: 'space',
        note: 'Padded past the home indicator with max(1rem, env(safe-area-inset-bottom)), so the primary action never sits under the system swipe.',
      },
      {
        n: 8,
        label: 'Max height',
        value: '85dvh',
        kind: 'size',
        note: 'dvh, not vh — with a mobile browser’s collapsing address bar, vh is measured against a viewport the user may never actually have.',
      },
      {
        n: 9,
        label: 'Dismiss threshold',
        value: '110px of travel',
        kind: 'motion',
        note: 'Below this the sheet springs back. Far enough that a flick inside a scrollable list never dismisses by accident.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Sheet background' },
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'The dimmed page behind' },
    { category: 'color', token: '--ds-border', usedFor: 'Top edge' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Grab handle' },
    { category: 'radius', token: '--radius-3xl', value: '28px', usedFor: 'Top corners only' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Sheet elevation' },
    { category: 'spacing', token: 'padding', value: '20px', usedFor: 'Body inset' },
    {
      category: 'spacing',
      token: 'safe-area-inset-bottom',
      value: 'max(1rem, env(…))',
      usedFor: 'Footer padding',
    },
    { category: 'motion', token: 'duration', value: '280ms in, 240ms snap', usedFor: 'Enter and detent change' },
    {
      category: 'motion',
      token: '--ease-emphasized',
      value: 'cubic-bezier(0.32, 0.72, 0, 1)',
      usedFor: 'The decelerating settle',
    },
  ],

  sizes: [
    { name: 'Content height', height: 'auto, max 85dvh', use: 'The default. Right for a short list of actions.' },
    { name: 'Small detent', height: '30dvh', use: 'A summary above a map or a list that must stay visible.' },
    { name: 'Half detent', height: '50dvh', use: 'The classic half sheet. Detail plus retained context.' },
    { name: 'Large detent', height: '85–90dvh', use: 'The ceiling. Never 100 — the scrimmed strip is what makes it an overlay.' },
    { name: 'Handle', height: '4px', minWidth: '36px', touch: '44px', use: 'Small mark, large target.' },
    { name: 'Action row', height: '44px', padding: '0 8px', touch: '44px', use: 'Full-width tap target.' },
    { name: 'Footer', height: '56px + inset', padding: '16px 20px', use: 'One or two full-width actions.' },
    { name: 'Top radius', radius: '28px', use: 'Top corners only. The bottom two run off screen.' },
  ],

  do: [
    {
      title: 'Show the handle',
      why: 'It is the only thing that says the surface can be dragged. Without it the sheet is a dialog that happens to be at the bottom, and the gesture goes undiscovered.',
      render: (
        <Row gap="lg">
          <SheetDiagram fraction={0.45} tone="good" label="handle" />
          <SheetDiagram fraction={0.45} handle={false} tone="bad" label="no affordance" />
        </Row>
      ),
    },
    {
      title: 'Keep a strip of page visible',
      why: 'That scrimmed band at the top is the difference between "on top of something" and "somewhere new". It also tells the user the scrim is a dismiss target.',
      render: <SheetDiagram fraction={0.85} tone="good" label="85dvh" />,
    },
    {
      title: 'Exhaust the inner scroll before dragging',
      why: 'A list inside a sheet must scroll to its top before the drag starts moving the sheet itself. Otherwise scrolling up throws away the thing the user is reading.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          scrollTop &gt; 0 → list scrolls · scrollTop === 0 → sheet moves
        </span>
      ),
    },
    {
      title: 'Pad the footer past the home indicator',
      why: 'The bottom ~34px belongs to the system on a gesture-navigation phone. A primary action there competes with the swipe that closes the app.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          padding-block-end: max(1rem, env(safe-area-inset-bottom))
        </code>
      ),
    },
    {
      title: 'Open at the smallest useful detent',
      why: 'The sheet should arrive at the least intrusive height that answers the question. Users pull up readily; they resent a surface that opens larger than they asked for.',
      render: <SheetDiagram fraction={0.35} label="opens here, pulls up" />,
    },
  ],

  dont: [
    {
      title: 'Do not fill the screen',
      why: 'At 100% there is no visible page behind, no scrim to tap, and nothing distinguishing the sheet from a navigation push. Users then reach for the back gesture, which does something else.',
      render: <SheetDiagram fraction={1} handle={false} tone="bad" label="100dvh" />,
    },
    {
      title: 'Do not confirm a deletion in one',
      why: 'A surface whose defining feature is that it can be flicked away is the wrong place for an irreversible choice. Use a dialog, where dismissal takes a deliberate tap.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          "Delete account?" on a surface a stray swipe dismisses
        </span>
      ),
    },
    {
      title: 'Do not stack sheets',
      why: 'A second sheet over the first leaves no context and no meaning for the drag gesture — which one moves? Replace the contents and give the sheet a back control instead.',
      render: (
        <span className="relative block h-[6rem] w-[4rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-canvas)]">
          <span className="absolute inset-x-0 bottom-0 h-[62%] rounded-t-[10px] bg-[var(--ds-surface)]" />
          <span className="absolute inset-x-0 bottom-0 h-[44%] rounded-t-[10px] bg-[var(--ds-surface-overlay)] shadow-e4" />
        </span>
      ),
    },
    {
      title: 'Do not use it on desktop',
      why: 'A panel pinned to the bottom of a 1440px window is nowhere near the cursor and nowhere near the content. The gesture it is built around does not exist there either.',
      render: (
        <span className="relative block h-[4.5rem] w-[9rem] overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-canvas)]">
          <span className="absolute inset-x-0 bottom-0 h-[45%] rounded-t-[10px] border-t border-[var(--ds-border)] bg-[var(--ds-surface-overlay)]" />
        </span>
      ),
    },
    {
      title: 'Do not make drag the only way out',
      why: 'A gesture with no visible control excludes anyone using a keyboard, a switch or a screen reader — and anyone who simply never discovered it. Escape, the scrim and a real button all have to work.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          drag-only dismissal → no keyboard exit
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.5.1', name: 'Pointer Gestures', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The sheet must reach 3:1 against the scrimmed page behind it. In dark themes it needs a lighter surface as well as the scrim, because the shadow contributes almost nothing.',
      'The grab handle is decorative but has to be seen to be used. 3:1 against the sheet, which --ds-border-strong clears in both themes.',
      'Action rows are 15px text on a surface one step above the page — check them in light mode, where overlay and surface are both white and only the shadow separates them.',
    ],
    keyboard: [
      { keys: 'Escape', does: 'Closes the sheet and returns focus to the trigger.' },
      { keys: 'Tab', does: 'Cycles inside the sheet. The page behind is inert.' },
      { keys: 'Enter / Space', does: 'Activates the focused row.' },
      { keys: '↑ ↓', does: 'Scrolls the body. Detents are pointer-only, so a keyboard user always gets the full height.' },
    ],
    aria: [
      {
        attr: 'role="dialog"',
        on: 'The sheet',
        note: 'A bottom sheet is a dialog with a different geometry and a gesture attached. The role does not change.',
      },
      {
        attr: 'aria-modal="true"',
        on: 'The sheet',
        note: 'True while the scrim is up. A non-modal sheet — one the page behind stays usable under — must not claim this.',
      },
      {
        attr: 'aria-labelledby',
        on: 'The sheet',
        note: 'Points at the title. An action sheet with no title still needs an aria-label, or it announces as an unnamed dialog.',
      },
      {
        attr: 'aria-hidden="true"',
        on: 'The grab handle',
        note: 'It is a visual affordance for a gesture assistive tech does not perform. Announcing it only adds noise.',
      },
      {
        attr: 'touch-action: none',
        on: 'The drag region',
        note: 'Not ARIA, but required: without it the browser claims the vertical gesture and the sheet never moves.',
      },
    ],
    focus:
      'Focus moves to the sheet on open and back to the trigger on close, and is trapped in between. Do not focus the first field automatically — on a phone that raises the keyboard over the sheet the user has not yet read.',
    screenReader: [
      'Announced as "Deployment, dialog", then the body. The title carries the name; do not rely on the first row to explain what the sheet is.',
      'Everything behind is inert or aria-hidden while the sheet is open, or the reader wanders onto a page the user cannot see.',
      'Detents are invisible to assistive tech. A screen-reader user gets the sheet at its full height, which is why every detent must contain complete content rather than a teaser.',
      'WCAG 2.5.1 requires a non-gesture path to everything the drag does: dismissal needs Escape, the scrim and a control; expansion needs the sheet simply to be tall enough.',
    ],
    touch:
      'The handle is a 4px mark inside a 44px target — never make the visual size the hit size. Action rows are full-width and 44px tall. The footer clears the home indicator with max(1rem, env(safe-area-inset-bottom)).',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { BottomSheet } from '@/ui/Overlay'

// Content-sized. Right for a short list of actions.
<BottomSheet open={open} onClose={close} title="Deployment">
  <ActionList />
</BottomSheet>

// Detents, ascending. Opens at the smallest and pulls up from there;
// a downward drag collapses a step before it ever dismisses.
<BottomSheet
  open={open}
  onClose={close}
  title="Nearby stops"
  detents={[0.3, 0.6, 0.9]}
  footer={<Button fullWidth onClick={save}>Save</Button>}
>
  <StopList />
</BottomSheet>

// The sheet is the phone half of a pair. Same content, same state —
// the container follows the pointer the user actually has.
const isPhone = useMediaQuery('(max-width: 639px)')
const Panel = isPhone ? BottomSheet : Drawer

// The inner list must be scrolled to the top before the drag moves
// the sheet, or scrolling up throws away what the user is reading.
onPointerMove={(e) => {
  if (listRef.current!.scrollTop > 0) return
  setDragY(Math.max(0, e.clientY - startY.current))
}}`,
    },
    css: {
      lang: 'css',
      code: `.ds-sheet {
  position: fixed;
  inset-inline: 0;
  inset-block-end: 0;
  z-index: 75;
  display: flex;
  flex-direction: column;

  /* dvh, not vh — a mobile address bar collapses, and vh is measured
     against a viewport the user may never actually see. */
  max-block-size: 85dvh;

  /* Top corners only. The bottom two run off the screen, and rounding
     them makes the sheet look like a card that got stuck. */
  border-start-start-radius: var(--radius-3xl);
  border-start-end-radius: var(--radius-3xl);
  border-block-start: 1px solid var(--ds-border);

  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e5);
  animation: sheet-in 280ms var(--ease-emphasized) both;
}

/* Both properties, because a detent change animates height while a
   release from a drag animates transform. */
.ds-sheet:not(.is-dragging) {
  transition:
    transform 240ms var(--ease-emphasized),
    height 240ms var(--ease-emphasized);
}

/* 4px mark, 44px target. Without touch-action the browser claims
   the vertical gesture and the sheet never moves. */
.ds-sheet__handle-area {
  display: flex;
  justify-content: center;
  padding-block: 12px 4px;
  touch-action: none;
  cursor: grab;
}
.ds-sheet__handle {
  inline-size: 36px;
  block-size: 4px;
  border-radius: 999px;
  background: var(--ds-border-strong);
}

.ds-sheet__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-inline: 20px;
}

/* The home indicator owns the bottom ~34px on a gesture phone. */
.ds-sheet__footer {
  padding: 16px 20px;
  padding-block-end: max(1rem, env(safe-area-inset-bottom));
  border-block-start: 1px solid var(--ds-border-subtle);
}

@keyframes sheet-in {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ds-sheet { animation: fade-in 120ms linear both; }
}

/* There is no hover, no drag and no thumb zone on a desktop. */
@media (min-width: 640px) { .ds-sheet { display: none; } }`,
    },
    api: [
      {
        name: 'BottomSheet',
        props: [
          { name: 'open', type: 'boolean', required: true, description: 'Mounts and slides the sheet up. Unmounted when false.' },
          { name: 'onClose', type: '() => void', required: true, description: 'Fires for Escape, the scrim, the close control and a drag past the threshold from the smallest detent.' },
          { name: 'detents', type: 'number[]', description: 'Resting heights as fractions of the viewport, ascending. Omit for a content-sized sheet capped at 85dvh. Opens at the smallest.' },
          { name: 'title', type: 'ReactNode', description: 'Rendered in the header and used as the accessible name.' },
          { name: 'footer', type: 'ReactNode', description: 'Pinned actions, padded past the safe-area inset.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'The body. The only scrolling region.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Pair every sheet with a drawer behind a media query. They are the same component with different geometry, and shipping only one of them means one platform gets the wrong surface.',
      'Give a detented sheet content that is complete at every detent. A half height showing the top of a paragraph reads as broken, not as progressive.',
      'Two detents is usually enough. Three is the most anyone will discover; past that the pulls stop mapping to anything the user has in mind.',
      'Reset to the smallest detent on reopen. A sheet that remembers it was pulled up feels like it is second-guessing the user.',
      'A sheet with more than about six action rows wants a page. The list has stopped being a menu and started being navigation.',
    ],
    performance: [
      'Drive the drag with transform only, and set will-change: transform for the duration of the gesture — not permanently, which costs a layer on every screen the sheet exists on.',
      'Use setPointerCapture on pointerdown. Without it, a fast flick loses the pointer outside the handle and the sheet sticks halfway.',
      'Unmount the contents when closed. A sheet that stays mounted keeps its subscriptions and reopens showing the previous item.',
      'Scroll-lock the page behind, and use overscroll-behavior: contain on the body so exhausting the inner scroll does not chain to the page.',
      'Prefer dvh over vh throughout. On mobile Safari, vh is the tall viewport and produces a sheet slightly taller than the screen.',
    ],
    mistakes: [
      'A full-screen sheet, which is a page with a drag gesture bolted on.',
      'No handle, so the defining interaction is never discovered.',
      'Drag as the only dismissal, excluding keyboard and switch users and breaking WCAG 2.5.1.',
      'The inner list scrolling and the sheet moving at the same time, so scrolling up dismisses.',
      'A footer button under the home indicator, competing with the system swipe.',
      'vh instead of dvh, giving a sheet whose bottom is behind the address bar.',
      'Stacked sheets, where the drag gesture no longer has an unambiguous target.',
    ],
    realWorld: [
      'The half sheet over a map is the canonical case and worth copying exactly: summary at 30%, detail at 60%, full listing at 90%. The content behind is the reason all three exist.',
      'Watch the dismissal rate. A sheet dismissed within a second is usually one that opened taller than the question deserved.',
      'iOS and Android differ on the details — iOS dims and scales the page behind, Android does not — but the anatomy is the same. Pick one and be consistent inside your app.',
      'If a sheet has grown tabs or a nested list, it has become a page. The tell is the same as with a drawer: two navigation systems in one container.',
      'The gesture is a shortcut, not the interface. Every sheet still needs a visible way out, because a meaningful share of users never drag anything.',
    ],
  },
})
