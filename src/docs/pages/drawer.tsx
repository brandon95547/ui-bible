import * as React from 'react'
import { Filter, PanelRight } from 'lucide-react'
import { Drawer } from '@/ui/Overlay'
import { Button } from '@/ui/Button'
import { Field, TextInput, Textarea } from '@/ui/Input'
import { Checkbox } from '@/ui/Toggle'
import { Badge } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const WIDTHS = ['20rem', '26rem', '34rem', '44rem'] as const

/* -- the list that stays visible behind the panel -------------------------- */

const ROWS = [
  { id: 'api-gateway', region: 'us-east-1', status: 'Healthy' },
  { id: 'auth-service', region: 'us-east-1', status: 'Healthy' },
  { id: 'billing-worker', region: 'eu-west-1', status: 'Degraded' },
  { id: 'image-resizer', region: 'ap-south-1', status: 'Healthy' },
  { id: 'webhook-relay', region: 'us-west-2', status: 'Healthy' },
]

function ContextList({ selected, onSelect }: { selected?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
      {ROWS.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onSelect?.(r.id)}
          className={`flex w-full items-center gap-3 border-b border-[var(--ds-border-subtle)] px-3.5 py-2.5 text-left last:border-b-0 transition-colors hover:bg-[var(--ds-layer-hover)] ${
            selected === r.id ? 'bg-[var(--ds-accent-subtle)]' : 'bg-[var(--ds-surface)]'
          }`}
        >
          <span className="flex-1 font-mono text-caption text-[var(--ds-fg)]">{r.id}</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">{r.region}</span>
          <Badge tone={r.status === 'Healthy' ? 'success' : 'warning'} variant="subtle">
            {r.status}
          </Badge>
        </button>
      ))}
    </div>
  )
}

function Playground() {
  const [open, setOpen] = React.useState(false)
  const [side, setSide] = React.useState<'left' | 'right'>('right')
  const [width, setWidth] = React.useState<(typeof WIDTHS)[number]>('26rem')
  const [footer, setFooter] = React.useState(true)
  const [selected, setSelected] = React.useState<string>()

  const open_ = (id: string) => {
    setSelected(id)
    setOpen(true)
  }

  return (
    <PreviewStage
      label="Playground"
      minHeight={260}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Side">
            <KnobSelect value={side} onChange={setSide} options={['left', 'right'] as const} />
          </Knob>
          <Knob label="Width">
            <KnobSelect value={width} onChange={setWidth} options={WIDTHS} />
          </Knob>
          <KnobToggle checked={footer} onChange={setFooter} label="Footer" />
        </div>
      }
      code={`<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side="${side}"
  width="${width}"
  title={service.name}
  description="Service detail"${
    footer
      ? `
  footer={
    <>
      <Button variant="text" onClick={close}>Cancel</Button>
      <Button onClick={save}>Save changes</Button>
    </>
  }`
      : ''
  }
>
  …
</Drawer>`}
    >
      <Stack gap="md" className="w-full">
        <p className="text-caption text-[var(--ds-fg-muted)]">
          Pick a row. The list stays on screen behind the panel — that is the entire reason to
          choose a drawer over a dialog.
        </p>
        <ContextList selected={open ? selected : undefined} onSelect={open_} />
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side={side}
          width={width}
          title={selected ?? 'Service'}
          description="Deployment settings for this service"
          footer={
            footer ? (
              <>
                <Button variant="text" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setOpen(false)}>Save changes</Button>
              </>
            ) : undefined
          }
        >
          <Stack gap="md">
            <Field label="Display name" description="Shown in the deploy log and in alerts.">
              <TextInput defaultValue={selected} />
            </Field>
            <Field label="Instances">
              <TextInput defaultValue="4" inputMode="numeric" />
            </Field>
            <Field label="Notes">
              <Textarea rows={3} defaultValue="Drains connections for 30s before stopping." />
            </Field>
            <Checkbox label="Restart on configuration change" defaultChecked />
            <Checkbox label="Page on-call when unhealthy" />
          </Stack>
        </Drawer>
      </Stack>
    </PreviewStage>
  )
}

function FilterExample() {
  const [open, setOpen] = React.useState(false)
  return (
    <Stack gap="md" className="w-full">
      <Row>
        <Button variant="outlined" startIcon={<Filter size={14} />} onClick={() => setOpen(true)}>
          Filters
        </Button>
        <Badge tone="accent" variant="subtle">
          2 active
        </Badge>
      </Row>
      <ContextList />
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="right"
        width="22rem"
        title="Filters"
        description="Applied as you change them"
        footer={
          <>
            <Button variant="text" onClick={() => setOpen(false)}>
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)}>Done</Button>
          </>
        }
      >
        <Stack gap="md">
          <Stack gap="sm">
            <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">Region</span>
            <Checkbox label="us-east-1" defaultChecked />
            <Checkbox label="us-west-2" />
            <Checkbox label="eu-west-1" defaultChecked />
            <Checkbox label="ap-south-1" />
          </Stack>
          <Stack gap="sm">
            <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">Status</span>
            <Checkbox label="Healthy" />
            <Checkbox label="Degraded" />
            <Checkbox label="Failed" />
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  )
}

/** Static diagram — a non-modal panel, which is a sidebar, not a drawer. */
function NonModalDiagram({ modal }: { modal?: boolean }) {
  return (
    <div className="relative h-[9.5rem] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
      <div className="flex h-full flex-col gap-1.5 p-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="h-4 rounded-[3px] bg-[var(--ds-surface-inset)]"
            style={{ width: `${72 - i * 9}%` }}
          />
        ))}
      </div>
      {modal && <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />}
      <div className="absolute inset-y-0 right-0 w-[46%] border-l border-[var(--ds-border)] bg-[var(--ds-surface)] p-2.5 shadow-e4">
        <span className="text-[10px] font-semibold text-[var(--ds-fg)]">
          {modal ? 'Drawer' : 'Sidebar'}
        </span>
        <p className="mt-1 text-[10px] leading-snug text-[var(--ds-fg-muted)]">
          {modal ? 'Scrim, focus trapped' : 'No scrim, page stays live'}
        </p>
      </div>
    </div>
  )
}

function MiniPanel({
  side = 'right',
  scrim = true,
  width = 46,
  label,
}: {
  side?: 'left' | 'right'
  scrim?: boolean
  width?: number
  label?: string
}) {
  return (
    <span className="relative block h-16 w-28 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]">
      {scrim && <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />}
      <span
        className={`absolute inset-y-0 bg-[var(--ds-surface)] shadow-e3 ${
          side === 'right'
            ? 'right-0 border-l border-[var(--ds-border)]'
            : 'left-0 border-r border-[var(--ds-border)]'
        }`}
        style={{ width: `${width}%` }}
      />
      {label && (
        <span className="absolute bottom-1 left-1.5 text-[9px] text-[var(--ds-fg-muted)]">
          {label}
        </span>
      )}
    </span>
  )
}

export default defineDoc({
  meta: {
    id: 'drawer',
    title: 'Drawer',
    tagline:
      'An edge-anchored panel that slides over the page instead of replacing it. Pick it over a dialog when the thing behind still matters.',
    keywords: [
      'side panel',
      'off canvas',
      'slide over',
      'detail panel',
      'flyout',
      'sheet',
      'inspector',
    ],
  },

  overview: {
    purpose:
      'A drawer is a panel anchored to the left or right edge of the viewport that slides in over the current page. It carries a secondary task — inspecting a row, editing a record, adjusting filters — without navigating away, and it deliberately leaves part of the page visible behind it.',
    whenToUse: [
      'Inspecting or editing one item from a list, where the list is the context that makes the edit make sense.',
      'A filter or settings panel whose effect the user wants to watch land on the content behind it.',
      'A secondary task long enough to need real estate but not long enough to earn its own route.',
      'A form the user may need to abandon and come back to, without losing their place in the list.',
    ],
    whenNotToUse: [
      {
        text: 'The user must answer before doing anything else.',
        instead: 'a Dialog — it is centred, so it is unmissable',
        to: '#/dialog',
      },
      {
        text: 'The viewport is a phone.',
        instead: 'a Bottom Sheet, which opens where the thumb already is',
        to: '#/drawer',
      },
      {
        text: 'The panel is permanent navigation.',
        instead: 'a Sidebar — no scrim, no focus trap, no dismiss',
        to: '#/sidebar',
      },
      {
        text: 'The content is a full workspace with its own URL.',
        instead: 'a page. A drawer nobody can link to or refresh into is a page in hiding',
      },
      {
        text: 'It is a short confirmation or a menu.',
        instead: 'a Dialog or a Popover. 26rem of panel for one sentence is theatre',
      },
    ],
    reasoning: (
      <>
        <p>
          The one argument for a drawer over a dialog is <strong>retained context</strong>. A dialog
          sits in the middle and covers what you were looking at; a drawer takes an edge and leaves
          the list, the table or the canvas readable beside it. If the content behind is irrelevant
          to the task, you have chosen the wrong container — a drawer that covers nothing useful is
          just an off-centre dialog with a longer animation.
        </p>
        <p>
          <strong>It enters from the edge it is anchored to.</strong> That is not decoration. The
          motion says where the panel came from and, by implication, where it goes back to when
          dismissed. A drawer that fades in from nowhere loses that, and users hunt for the close
          button because nothing has told them the panel has a home.
        </p>
        <p>
          <strong>Modal or not is the real decision.</strong> Ours is modal: scrim, trapped focus,
          inert background. That is right when the panel owns a task with a save. If the user needs
          to keep clicking the page behind — picking rows while the panel updates — then drop the
          scrim and the trap, and what you have built is a sidebar, which is a different component
          with different rules.
        </p>
        <p>
          <strong>Side has a meaning.</strong> Right is detail: it reads after the list, in the
          direction of the reading order, and it is where every inspector in every tool lives. Left
          is navigation. Putting a detail panel on the left makes it compete with the sidebar for the
          same slot in the user's spatial model.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'filters',
        title: 'A filter panel',
        description:
          'Filters applied live, with the result changing behind the panel. This is the case a dialog cannot serve — covering the results while someone filters them is self-defeating.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <FilterExample />
          </PreviewStage>
        ),
      },
      {
        id: 'modal-vs-not',
        title: 'Modal drawer vs non-modal sidebar',
        description:
          'The scrim is the tell. With one, the page behind is inert and the panel owns the interaction; without one, the page stays live and the panel is furniture, not an overlay.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Stack gap="sm">
                <NonModalDiagram modal />
                <p className="text-caption text-[var(--ds-fg-muted)]">
                  <strong className="text-[var(--ds-fg)]">Drawer.</strong> Escape closes it, Tab
                  cannot leave it, and clicking the scrim dismisses. Use when the panel has a save.
                </p>
              </Stack>
              <Stack gap="sm">
                <NonModalDiagram />
                <p className="text-caption text-[var(--ds-fg-muted)]">
                  <strong className="text-[var(--ds-fg)]">Sidebar.</strong> No scrim, no trap. Use
                  when the user keeps working in the page while the panel is open.
                </p>
              </Stack>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'widths',
        title: 'Widths',
        description:
          'Width follows the content, not the screen. A single-column form needs 26rem; two columns of key–value detail need 34rem; anything past 44rem should have been a page.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="flex w-full flex-wrap items-end justify-center gap-4">
              {[
                { w: 30, label: '20rem · filters' },
                { w: 40, label: '26rem · form' },
                { w: 52, label: '34rem · detail' },
                { w: 66, label: '44rem · ceiling' },
              ].map((s) => (
                <Stack key={s.label} gap="xs" className="items-center">
                  <MiniPanel width={s.w} />
                  <span className="font-mono text-[10px] text-[var(--ds-fg-muted)]">{s.label}</span>
                </Stack>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Right', render: <MiniPanel side="right" /> },
      { label: 'Left', render: <MiniPanel side="left" /> },
      { label: 'Narrow', note: '20rem', render: <MiniPanel width={30} /> },
      { label: 'Wide', note: '44rem', render: <MiniPanel width={68} /> },
      { label: 'No scrim', note: 'that is a sidebar', render: <MiniPanel scrim={false} /> },
      {
        label: 'Closed',
        render: (
          <span className="block h-16 w-28 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]" />
        ),
      },
      {
        label: 'Mobile',
        note: 'full width',
        render: <MiniPanel width={100} />,
      },
      {
        label: 'Entering',
        render: (
          <span className="text-caption text-[var(--ds-fg-muted)]">260ms from the edge</span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="relative h-[13rem] w-full max-w-[30rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)]">
        <div className="flex h-full flex-col gap-2 p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-5 rounded-[3px] bg-[var(--ds-surface-inset)]"
              style={{ width: `${68 - i * 7}%` }}
            />
          ))}
        </div>
        <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />
        <div className="absolute inset-y-0 right-0 flex w-[58%] flex-col border-l border-[var(--ds-border)] bg-[var(--ds-surface)] shadow-e5">
          <div className="flex items-start justify-between gap-2 border-b border-[var(--ds-border-subtle)] px-3.5 py-3">
            <div>
              <div className="text-label text-[var(--ds-fg)]">api-gateway</div>
              <div className="text-[10px] text-[var(--ds-fg-muted)]">Deployment settings</div>
            </div>
            <span className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] text-[var(--ds-fg-muted)]">
              ✕
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 overflow-hidden p-3.5">
            <span className="h-7 rounded-[var(--radius-sm)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)]" />
            <span className="h-7 rounded-[var(--radius-sm)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)]" />
            <span className="h-7 rounded-[var(--radius-sm)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)]" />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-3.5 py-2.5">
            <span className="h-6 w-14 rounded-[var(--radius-sm)] bg-[var(--ds-surface)]" />
            <span className="h-6 w-20 rounded-[var(--radius-sm)] bg-[var(--ds-accent)]" />
          </div>
        </div>
      </div>
    ),
    caption:
      'A right-anchored modal drawer over a list. The visible strip of list on the left is not wasted space — it is the reason this is a drawer.',
    parts: [
      {
        n: 1,
        label: 'Scrim',
        value: '--ds-layer-scrim + 2px blur',
        kind: 'color',
        note: 'Dims the page and absorbs the click that closes the panel. Its opacity is the difference between "the page is paused" and "the page is gone" — 72% in dark, 42% in light, because a white page needs far less dimming to read as inactive.',
      },
      {
        n: 2,
        label: 'Panel',
        value: 'min(26rem, 100vw − 2rem)',
        kind: 'size',
        note: 'Full viewport height, anchored to one edge. The 2rem clamp keeps a sliver of scrim visible on small screens so the panel never reads as a whole new page.',
      },
      {
        n: 3,
        label: 'Edge border',
        value: '1px --ds-border',
        kind: 'color',
        note: 'A hairline on the anchored side. Shadow alone separates the panel in light mode but disappears in dark, where surfaces are lightened rather than shadowed.',
      },
      {
        n: 4,
        label: 'Header',
        value: '20px / 16px, sticky',
        kind: 'space',
        note: 'Title, optional description, and the close control. It does not scroll — the exit must be reachable no matter how far down the body the user has gone.',
      },
      {
        n: 5,
        label: 'Close control',
        value: '32px icon button',
        kind: 'size',
        note: 'Top corner on the panel’s inner side. Escape and the scrim also close, but a visible control is the only one a touch user can find without guessing.',
      },
      {
        n: 6,
        label: 'Body',
        value: '20px padding, scrolls',
        kind: 'space',
        note: 'The only scrolling region. The page behind is scroll-locked, so a stray wheel event cannot move the thing the user is using the drawer to inspect.',
      },
      {
        n: 7,
        label: 'Footer',
        value: '14px / 20px, inset surface',
        kind: 'space',
        note: 'Actions pinned to the bottom, right-aligned, primary last. Inset background so it separates from the body without a second border.',
      },
      {
        n: 8,
        label: 'Elevation',
        value: '--shadow-e5',
        kind: 'shape',
        note: 'The highest tier below a dialog. It is above everything on the page but below anything the drawer itself opens.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'The dimming layer over the page' },
    { category: 'color', token: '--ds-surface', usedFor: 'Panel background' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Footer background' },
    { category: 'color', token: '--ds-border', usedFor: 'The anchored edge' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Header and footer rules' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Panel elevation' },
    { category: 'spacing', token: 'width', value: '26rem default', usedFor: 'Panel width' },
    { category: 'spacing', token: 'padding', value: '20px', usedFor: 'Body inset' },
    { category: 'motion', token: 'duration', value: '260ms', usedFor: 'Slide in' },
    {
      category: 'motion',
      token: '--ease-emphasized',
      value: 'cubic-bezier(0.32, 0.72, 0, 1)',
      usedFor: 'Decelerating entry',
    },
  ],

  sizes: [
    {
      name: 'sm',
      minWidth: '20rem',
      padding: '16px',
      use: 'Filters, a short list of toggles, a summary. One column, no labels longer than the panel.',
    },
    {
      name: 'md',
      minWidth: '26rem',
      padding: '20px',
      use: 'The default. A single-column form of six to ten fields.',
    },
    {
      name: 'lg',
      minWidth: '34rem',
      padding: '20px',
      use: 'Two columns of key–value detail, or a form beside a preview.',
    },
    {
      name: 'xl',
      minWidth: '44rem',
      padding: '24px',
      use: 'The ceiling. Past this the page behind is gone and you have built a route without a URL.',
    },
    {
      name: 'Mobile',
      maxWidth: '100vw − 2rem',
      use: 'Below 640px it fills the viewport. Keep the 2rem gutter — full-bleed reads as navigation, not as an overlay.',
    },
    { name: 'Header', height: '56px', padding: '16px 20px', use: 'Title, description, close.' },
    { name: 'Footer', height: '60px', padding: '14px 20px', use: 'Right-aligned actions.' },
  ],

  do: [
    {
      title: 'Leave the context visible',
      why: 'The strip of page beside the panel is what distinguishes a drawer from a dialog. If the panel is so wide that nothing shows, the choice of component no longer buys anything.',
      render: <MiniPanel width={46} label="list still readable" />,
    },
    {
      title: 'Anchor detail panels to the right',
      why: 'Right is detail; left is navigation. Users have a spatial model built by every tool they use, and putting an inspector on the left makes it collide with the sidebar in that model.',
      render: (
        <Row gap="sm">
          <MiniPanel side="right" label="detail" />
          <PanelRight size={16} className="text-[var(--ds-fg-muted)]" />
        </Row>
      ),
    },
    {
      title: 'Pin the actions to the bottom',
      why: 'A save button that scrolls out of the panel is a save button users assume is missing. The footer stays put while the body scrolls, exactly as in a dialog.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          body scrolls · header and footer do not
        </span>
      ),
    },
    {
      title: 'Warn before discarding a dirty form',
      why: 'A drawer has three exits — Escape, the scrim, and the close button — and all three are easy to hit by accident. A dialog has the same problem; a drawer has it three times over.',
      render: (
        <span className="text-caption text-[var(--ds-success-text)]">
          Escape on a dirty form → "Discard changes?"
        </span>
      ),
    },
    {
      title: 'Return focus to what opened it',
      why: 'The user was on a row. Closing the panel should put them back on that row, not at the top of the document, so the keyboard path in and out is symmetrical.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          row → drawer → Escape → <span className="text-[var(--ds-success-text)]">same row</span>
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not open a drawer from a drawer',
      why: 'Two stacked panels leave no context visible and no clear meaning for Escape. If the second panel is genuinely needed, replace the contents of the first and give it a back control.',
      render: (
        <span className="relative block h-16 w-28 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-canvas)]">
          <span className="absolute inset-0 bg-[var(--ds-layer-scrim)]" aria-hidden />
          <span className="absolute inset-y-0 right-0 w-[52%] border-l border-[var(--ds-border)] bg-[var(--ds-surface)]" />
          <span className="absolute inset-y-0 right-0 w-[34%] border-l border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e4" />
        </span>
      ),
    },
    {
      title: 'Do not use one for a confirmation',
      why: 'Confirmations need to be in the centre of vision and impossible to ignore. A panel that slides in at the edge is the wrong amount of ceremony for "are you sure?".',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          "Delete this?" in a 26rem edge panel
        </span>
      ),
    },
    {
      title: 'Do not put a whole workspace in one',
      why: 'If it has tabs, its own toolbar and ten minutes of work in it, it needs a URL. Users will refresh, deep-link and open in a new tab, and a drawer supports none of those.',
      render: <MiniPanel width={92} label="no URL, no refresh, no back" />,
    },
    {
      title: 'Do not leave the background scrollable',
      why: 'Wheeling inside a modal drawer that has no overflow scrolls the page behind it. The user returns to a list that has moved and loses the row they were inspecting.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          scroll inside panel → list behind jumps
        </span>
      ),
    },
    {
      title: 'Do not animate slower than ~300ms',
      why: 'The slide is meant to explain where the panel came from, and it has done that in a quarter of a second. Beyond that it is a delay the user pays on every open.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          500ms “premium” easing → 500ms of waiting, every time
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.11', name: 'Focus Not Obscured', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The panel must reach 3:1 against the scrimmed page behind it, or the edge dissolves. In dark themes the scrim alone is not enough — the panel needs a lighter surface as well.',
      'The scrim is decorative but functional: too light and the page behind competes for attention, too dark and the retained context becomes unreadable. It is not the same value in both themes — 72% over a dark page, 42% over a white one.',
      'The close control is an icon-only button and still needs 3:1 for its glyph, at 32px, in the corner where it will be tapped in a hurry.',
    ],
    keyboard: [
      { keys: 'Escape', does: 'Closes the drawer and returns focus to the trigger. Prompt first if the form is dirty.' },
      { keys: 'Tab', does: 'Cycles inside the panel only. The page behind is inert while the drawer is modal.' },
      { keys: 'Shift + Tab', does: 'Cycles backwards, wrapping from the first element to the last.' },
      { keys: 'Enter', does: 'Submits, when the panel contains a form with a primary action.' },
    ],
    aria: [
      {
        attr: 'role="dialog"',
        on: 'The panel',
        note: 'A drawer is a dialog that happens to be anchored to an edge. The role is the same; only the geometry differs.',
      },
      {
        attr: 'aria-modal="true"',
        on: 'The panel',
        note: 'Only when it really is modal. On a non-modal panel this lies to the screen reader about whether the page behind is available.',
      },
      {
        attr: 'aria-labelledby',
        on: 'The panel',
        note: 'Points at the header title. Without it the panel announces as an unnamed dialog.',
      },
      {
        attr: 'aria-describedby',
        on: 'The panel',
        note: 'Points at the description, when there is one. Keep it to one line — it is read in full on open.',
      },
      {
        attr: 'aria-expanded',
        on: 'The trigger',
        note: 'Reflects whether the panel it controls is open, so the state is available without leaving the trigger.',
      },
    ],
    focus:
      'On open, focus moves to the panel itself — not to the first field, which would skip the title on the way in. On close it returns to the element that opened it. Focus is trapped for as long as the panel is modal, and released the moment it is not.',
    screenReader: [
      'Announced as "api-gateway, dialog" with the description following. The panel needs an accessible name even when the title is visually obvious.',
      'Everything outside the panel is hidden while it is open — either with inert on the page container or aria-hidden on the siblings. Without it, a screen reader wanders into a page the sighted user cannot see.',
      'The close button needs a real label. "Close panel" beats "Close", which is ambiguous when a dialog can also be open.',
      'Do not move focus into the body automatically on open. The user hears the title first, then chooses to Tab in.',
    ],
    touch:
      'The close control is 32px visually with a 44px hit area. On mobile the panel fills the viewport minus a 2rem gutter, and that gutter is a real dismiss target, not decoration.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Drawer } from '@/ui/Overlay'

const [open, setOpen] = useState(false)
const [selected, setSelected] = useState<Service>()

<Drawer
  open={open}
  onClose={handleClose}
  side="right"          // detail goes right; left is navigation
  width="26rem"
  title={selected?.name}
  description="Deployment settings for this service"
  footer={
    <>
      <Button variant="text" onClick={handleClose}>Cancel</Button>
      <Button onClick={save}>Save changes</Button>
    </>
  }
>
  <ServiceForm value={selected} onChange={setDraft} />
</Drawer>

// Three exits, one guard — Escape, the scrim and the close button
// all land here, so the dirty check belongs in one place.
function handleClose() {
  if (dirty && !confirm('Discard changes?')) return
  setOpen(false)
}

// Below the tablet breakpoint a drawer becomes a bottom sheet.
// Same content, same state, the container follows the thumb.
const isPhone = useMediaQuery('(max-width: 639px)')
const Panel = isPhone ? BottomSheet : Drawer`,
    },
    html: {
      lang: 'html',
      caption: 'Framework-free. The inert attribute on the page is what makes it modal.',
      code: `<div class="ds-page" inert>
  <!-- the list stays rendered and stays visible -->
</div>

<div class="ds-scrim" data-close></div>

<aside
  class="ds-drawer ds-drawer--right"
  role="dialog"
  aria-modal="true"
  aria-labelledby="drawer-title"
  aria-describedby="drawer-desc"
  tabindex="-1"
>
  <header class="ds-drawer__header">
    <div>
      <h2 id="drawer-title">api-gateway</h2>
      <p id="drawer-desc">Deployment settings for this service</p>
    </div>
    <button type="button" class="ds-icon-button" aria-label="Close panel" data-close>
      <svg aria-hidden="true"><!-- × --></svg>
    </button>
  </header>

  <div class="ds-drawer__body"><!-- the only scrolling region --></div>

  <footer class="ds-drawer__footer">
    <button class="ds-button ds-button--text" data-close>Cancel</button>
    <button class="ds-button ds-button--filled">Save changes</button>
  </footer>
</aside>`,
    },
    css: {
      lang: 'css',
      code: `.ds-drawer {
  position: fixed;
  inset-block: 0;
  z-index: 75;
  display: flex;
  flex-direction: column;

  /* Clamped, so a sliver of scrim always shows on a phone.
     A full-bleed panel reads as a new page, not as an overlay. */
  inline-size: min(26rem, 100vw - 2rem);

  background: var(--ds-surface);
  box-shadow: var(--shadow-e5);
}

/* Enter from the edge you are anchored to — the motion is the
   explanation of where the panel came from. */
.ds-drawer--right {
  inset-inline-end: 0;
  border-inline-start: 1px solid var(--ds-border);
  animation: drawer-in-right 260ms var(--ease-emphasized) both;
}
.ds-drawer--left {
  inset-inline-start: 0;
  border-inline-end: 1px solid var(--ds-border);
  animation: drawer-in-left 260ms var(--ease-emphasized) both;
}

@keyframes drawer-in-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes drawer-in-left {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

/* Header and footer are fixed; only the body moves. */
.ds-drawer__header,
.ds-drawer__footer { flex: none; }

.ds-drawer__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;   /* stops the page behind scrolling */
  padding: 20px;
}

.ds-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-block-start: 1px solid var(--ds-border-subtle);
  background: var(--ds-surface-inset);
}

.ds-scrim {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: var(--ds-layer-scrim);
  animation: fade-in 180ms linear both;
}

/* The slide is information, not decoration — but not everyone
   can take it. Keep the panel, drop the travel. */
@media (prefers-reduced-motion: reduce) {
  .ds-drawer { animation: fade-in 120ms linear both; }
}`,
    },
    api: [
      {
        name: 'Drawer',
        props: [
          { name: 'open', type: 'boolean', required: true, description: 'Mounts and animates the panel in. Unmounted when false — a hidden drawer should not keep a form alive.' },
          { name: 'onClose', type: '() => void', required: true, description: 'Fires for Escape, the scrim and the close button. Put the dirty-form guard here, once.' },
          { name: 'side', type: "'left' | 'right'", default: "'right'", description: 'Right for detail, left for navigation.' },
          { name: 'width', type: 'string', default: "'26rem'", description: 'Any CSS length. Clamped to the viewport minus 2rem.' },
          { name: 'title', type: 'ReactNode', description: 'Rendered in the header and used as the accessible name.' },
          { name: 'description', type: 'ReactNode', description: 'One line under the title. Read out on open, so keep it short.' },
          { name: 'footer', type: 'ReactNode', description: 'Pinned actions. Omit for a read-only panel.' },
          { name: 'children', type: 'ReactNode', required: true, description: 'The body. The only region that scrolls.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Give the drawer a URL parameter — ?panel=api-gateway. It costs one line, and it makes the panel linkable, refreshable and back-button-friendly without turning it into a route.',
      'When the drawer edits a row, highlight that row behind the panel. It answers "which one am I editing?" without the user having to remember.',
      'Prev/next arrows in the header turn a detail drawer into a review queue. Reviewing forty items without closing the panel forty times is a large win for a small control.',
      'Below the tablet breakpoint, swap the drawer for a bottom sheet. Same content and same state — an edge panel on a phone is a full-screen takeover with extra steps.',
      'One drawer per screen. If two features both want one, they want the same one with different contents.',
    ],
    performance: [
      'Unmount the contents when closed. A drawer that stays mounted keeps its subscriptions, its timers and its stale form state, and users notice when it reopens showing the previous row.',
      'Animate transform only. Animating width or inset-inline-end lays out every frame and drops the panel to a visible stutter on a long list.',
      'Fetch the detail when the row is selected, not when the drawer finishes animating. The 260ms of slide is free loading time.',
      'Scroll-lock the page with overflow: hidden plus a scrollbar-width pad, or the content behind jumps sideways as the drawer opens.',
    ],
    mistakes: [
      'Drawers stacked on drawers, leaving no context and no clear target for Escape.',
      'A panel wide enough to cover the page, which throws away the only advantage a drawer has.',
      'Escape discarding a half-filled form with no confirmation.',
      'Focus left on the trigger when the panel opens, so a screen reader never hears the title.',
      'aria-modal="true" on a panel whose background is still clickable, which tells assistive tech the opposite of the truth.',
      'The page behind scrolling when the wheel reaches the end of the panel body.',
    ],
    realWorld: [
      'Drawer or dialog is settled by one question: does the user need to see the page behind while they work? If the honest answer is no, use a dialog — it is simpler and it is centred.',
      'Drawer or page is settled by a second question: will anyone want to link to this? If yes, it is a page, no matter how tempting the panel is.',
      'Filter panels are the strongest case for a drawer and the most common place teams reach for a dialog instead. Watching results change as you filter is the whole interaction.',
      'Track how long panels stay open. A median over a couple of minutes means the task outgrew the container and wants a route of its own.',
      'If your drawer has grown its own tabs, that is the signal it has become a page. Tabs inside an edge panel put two navigation systems in one 26rem column.',
    ],
  },
})
