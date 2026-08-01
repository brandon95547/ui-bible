import * as React from 'react'
import { AlertTriangle, Check, Rocket, Trash2 } from 'lucide-react'
import { Dialog, type DialogSize } from '@/ui/Overlay'
import { Button } from '@/ui/Button'
import { Field, TextInput } from '@/ui/Input'
import { Alert } from '@/ui/Feedback'
import { Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SIZES: DialogSize[] = ['sm', 'md', 'lg', 'xl', 'fullscreen']

function Playground() {
  const [open, setOpen] = React.useState(false)
  const [size, setSize] = React.useState<DialogSize>('md')
  const [scrollable, setScrollable] = React.useState(false)
  const [dismissible, setDismissible] = React.useState(true)
  const [tone, setTone] = React.useState<'neutral' | 'danger' | 'success'>('neutral')

  return (
    <PreviewStage
      label="Playground"
      minHeight={180}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={SIZES} />
          </Knob>
          <Knob label="Tone">
            <KnobSelect
              value={tone}
              onChange={setTone}
              options={['neutral', 'danger', 'success'] as const}
            />
          </Knob>
          <KnobToggle checked={scrollable} onChange={setScrollable} label="Scrollable" />
          <KnobToggle checked={dismissible} onChange={setDismissible} label="Dismissible" />
        </div>
      }
      code={`<Dialog
  open={open}
  onClose={() => setOpen(false)}
  size="${size}"
  tone="${tone}"${scrollable ? '\n  scrollable' : ''}${dismissible ? '' : '\n  dismissible={false}'}
  title="Deploy to production"
  description="This will replace the running version in three regions."
  footer={<>…</>}
>
  …
</Dialog>`}
    >
      <Stack gap="md" className="items-center">
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          size={size}
          tone={tone}
          scrollable={scrollable}
          dismissible={dismissible}
          icon={tone === 'danger' ? <Trash2 size={17} /> : tone === 'success' ? <Check size={17} /> : <Rocket size={17} />}
          title={tone === 'danger' ? 'Delete api-gateway?' : 'Deploy to production'}
          description={
            tone === 'danger'
              ? 'This removes the service and all of its deployment history. It cannot be undone.'
              : 'This replaces the running version in three regions. Rollback takes about eight seconds.'
          }
          footer={
            <>
              <Button variant="text" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={tone === 'danger' ? 'danger' : 'filled'}
                onClick={() => setOpen(false)}
              >
                {tone === 'danger' ? 'Delete service' : 'Deploy build 4021'}
              </Button>
            </>
          }
        >
          {scrollable ? (
            <Stack gap="md">
              {Array.from({ length: 8 }).map((_, i) => (
                <p key={i} className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
                  {i + 1}. The header and the footer stay put while this region scrolls. That is the
                  only correct way to handle a long dialog — a dialog whose action buttons scroll off
                  the bottom is a dialog people abandon.
                </p>
              ))}
            </Stack>
          ) : (
            <Alert tone="warning" quiet title="Three regions will restart">
              Requests are drained before each instance stops.
            </Alert>
          )}
        </Dialog>
      </Stack>
    </PreviewStage>
  )
}

function ConfirmDemo() {
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState('')
  const ok = typed === 'api-gateway'

  return (
    <>
      <Button variant="danger-outline" startIcon={<Trash2 />} onClick={() => setOpen(true)}>
        Delete service
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          setTyped('')
        }}
        size="sm"
        tone="danger"
        icon={<AlertTriangle size={17} />}
        title="Delete api-gateway?"
        description="This removes the service, its environments and all deployment history. It cannot be undone."
        footer={
          <>
            <Button variant="text" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" disabled={!ok} onClick={() => setOpen(false)}>
              Delete service
            </Button>
          </>
        }
      >
        <Field
          label="Type api-gateway to confirm"
          htmlFor="confirm-name"
          className="pt-1"
        >
          <TextInput
            id="confirm-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="api-gateway"
            autoComplete="off"
          />
        </Field>
      </Dialog>
    </>
  )
}

export default defineDoc({
  meta: {
    id: 'dialog',
    title: 'Dialog',
    tagline:
      'A modal interrupts everything. That cost is only worth paying when the user genuinely cannot continue without deciding — which is far rarer than most products assume.',
    keywords: ['modal', 'popup', 'confirm', 'alert dialog', 'overlay', 'wizard', 'fullscreen', 'delete'],
  },

  overview: {
    purpose:
      'A dialog stops the world and asks for a decision. It traps focus, dims the page, and refuses to let the user continue until they respond. Everything about it is expensive, which is exactly why it should be the last option considered rather than the first.',
    whenToUse: [
      'A destructive or irreversible action needs explicit confirmation.',
      'A short, self-contained task must be completed before the underlying page makes sense.',
      'The user must acknowledge something before proceeding — a licence, a breaking change.',
      'A focused sub-task is genuinely better without the surrounding page competing for attention.',
    ],
    whenNotToUse: [
      {
        text: 'The action is reversible.',
        instead: 'doing it immediately with an Undo toast',
        to: '#/toast',
      },
      {
        text: 'You are confirming something routine, like "Save changes?".',
        instead: 'just saving — confirmation fatigue makes every dialog invisible',
      },
      {
        text: 'The content is a form of more than about eight fields.',
        instead: 'a page or a Drawer',
        to: '#/drawer',
      },
      {
        text: 'The surrounding context is needed while working.',
        instead: 'a Drawer, which keeps the page visible',
        to: '#/drawer',
      },
      {
        text: 'The message needs no response.',
        instead: 'a Toast or an Alert',
        to: '#/banner',
      },
    ],
    reasoning: (
      <>
        <p>
          A confirmation dialog protects against a mistake by taxing everyone who is not making one.
          If the action is reversible, <strong>do it and offer Undo</strong> — the common path stays
          fast and the rare mistake is still recoverable. Reserve dialogs for actions that genuinely
          cannot be undone.
        </p>
        <p>
          When you do confirm, make the confirmation <strong>proportional</strong>. A second click
          is muscle memory within a week. Typing the resource name is a decision, and it is why
          every serious infrastructure product asks for it before deleting production.
        </p>
        <p>
          Three technical requirements are non-negotiable and are the ones most often missed:{' '}
          <strong>focus is trapped</strong> inside the dialog, <strong>focus returns</strong> to the
          trigger on close, and the <strong>background is inert</strong>. Without them a keyboard
          user tabs straight out of the dialog into a page they cannot see, which is one of the most
          disorienting experiences on the web.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'confirm',
        title: 'Destructive confirmation',
        description:
          'Type-to-confirm for anything irreversible. The primary action stays disabled until the name matches, and the button says what it deletes.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <ConfirmDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'Small for a decision, medium for a short form, large for content, fullscreen for a genuine sub-application on mobile.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)]">
              <table className="w-full border-collapse text-body-sm">
                <tbody>
                  {[
                    ['sm', '24rem', 'A yes/no decision. One sentence of context.'],
                    ['md', '32rem', 'The default. A short form or a confirmation with detail.'],
                    ['lg', '44rem', 'Content: a diff, a preview, a table of affected resources.'],
                    ['xl', '60rem', 'Rare. A picker or an editor that needs the width.'],
                    ['fullscreen', '100vw', 'Mobile, or a genuine sub-application.'],
                  ].map(([s, w, use]) => (
                    <tr key={s} className="border-b border-[var(--ds-border-subtle)] last:border-0">
                      <td className="w-28 px-3 py-2.5 font-mono text-[11.5px] text-[var(--ds-accent-text)]">{s}</td>
                      <td className="w-24 px-3 py-2.5 font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-secondary)]">{w}</td>
                      <td className="px-3 py-2.5 text-[var(--ds-fg-muted)]">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'wizard',
        title: 'Multi-step',
        description:
          'A wizard in a dialog needs a visible position, a Back that works, and no Escape-to-close once the user has entered data — losing three steps of input to a stray keypress is unforgivable.',
        render: (
          <PreviewStage minHeight={0} allowResize={false}>
            <WizardDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'alternatives',
        title: 'What to use instead',
        description:
          'Most dialogs in a product are one of these three patterns wearing the wrong component.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-3">
              {[
                ['Reversible action', 'Do it, then offer Undo in a toast', '#/toast'],
                ['Long form', 'A page or a drawer, so the context stays visible', '#/drawer'],
                ['Information only', 'An alert in the flow of the page', '#/banner'],
              ].map(([what, instead, href]) => (
                <div key={what} className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
                  <p className="text-label text-[var(--ds-fg)]">{what}</p>
                  <p className="mt-1.5 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
                    {instead}
                  </p>
                  <a href={href} className="mt-2 inline-block text-caption text-[var(--ds-accent-text)] underline-offset-4 hover:underline">
                    See the pattern
                  </a>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Closed', render: <Button size="sm" variant="outlined">Open</Button> },
      { label: 'Scrim', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-layer-scrim)]" /> },
      { label: 'Panel', render: <span className="block h-10 w-16 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5" /> },
      { label: 'Entering', note: 'scale 0.96 → 1', render: <span className="text-caption text-[var(--ds-fg-muted)]">200ms emphasized</span> },
      { label: 'Danger', render: <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]"><Trash2 size={15} /></span> },
      { label: 'Success', render: <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]"><Check size={15} /></span> },
      { label: 'Scrollable', note: 'Header and footer pinned', render: <span className="text-caption text-[var(--ds-fg-muted)]">body scrolls</span> },
      { label: 'Non-dismissible', render: <span className="text-caption text-[var(--ds-fg-muted)]">no ×, no Esc</span> },
      { label: 'Confirm disabled', render: <Button size="sm" variant="danger" disabled>Delete</Button> },
      { label: 'Submitting', render: <Button size="sm" loading>Deploy</Button> },
      { label: 'Focus trapped', render: <span className="text-caption text-[var(--ds-fg-muted)]">Tab cycles inside</span> },
      { label: 'Restored', render: <span className="text-caption text-[var(--ds-fg-muted)]">focus → trigger</span> },
    ],
  },

  anatomy: {
    render: (
      <div className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-6">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] shadow-e5">
          <div className="flex items-start gap-3 px-6 pb-3 pt-5">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]">
              <AlertTriangle size={17} />
            </span>
            <div>
              <p className="text-h3 text-[var(--ds-fg)]">Delete api-gateway?</p>
              <p className="mt-1 text-body-sm text-[var(--ds-fg-muted)]">
                This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 pb-4 pt-5">
            <Button size="sm" variant="text">Cancel</Button>
            <Button size="sm" variant="danger">Delete service</Button>
          </div>
        </div>
      </div>
    ),
    caption:
      'Small confirmation dialog. Icon, title, one line of consequence, and a footer where the primary action sits closest to the corner the eye exits from.',
    parts: [
      {
        n: 1,
        label: 'Max width',
        value: '24rem (sm) — 32rem (md)',
        kind: 'size',
        note: 'Past about 60rem the eye has too far to travel between the title and the confirm button, and the dialog stops feeling like a single decision.',
      },
      {
        n: 2,
        label: 'Radius',
        value: '20px · --radius-2xl',
        kind: 'shape',
        note: 'Larger than a card. A modal is the topmost surface in the system, and the softer corner is part of what places it there.',
      },
      {
        n: 3,
        label: 'Scrim',
        value: '72% dark, 2px blur',
        kind: 'color',
        note: 'The page behind should read as paused, not gone. A fully opaque scrim removes the context that told the user what they are confirming.',
      },
      {
        n: 4,
        label: 'Elevation',
        value: '--shadow-e5',
        kind: 'shape',
        note: 'The highest level in the system. Combined with the scrim, it is unambiguous that nothing behind is available.',
      },
      {
        n: 5,
        label: 'Padding',
        value: '24px horizontal',
        kind: 'space',
        note: 'One step above a card, because the dialog is the only thing on screen and can afford the room.',
      },
      {
        n: 6,
        label: 'Action order',
        value: 'Cancel then primary',
        kind: 'space',
        note: 'Right-aligned with the primary last, at the corner the eye exits from on desktop. On mobile, stack with the primary on top.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Panel background' },
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'Backdrop' },
    { category: 'color', token: '--ds-border', usedFor: 'Panel edge' },
    { category: 'color', token: '--ds-danger-subtle', usedFor: 'Destructive icon container' },
    { category: 'spacing', token: 'padding-x', value: '24px', usedFor: 'Header, body and footer' },
    { category: 'spacing', token: 'footer gap', value: '10px', usedFor: 'Between actions' },
    { category: 'spacing', token: 'viewport inset', value: '16–24px', usedFor: 'Minimum margin around the panel' },
    { category: 'radius', token: '--radius-2xl', value: '20px', usedFor: 'Panel corners' },
    { category: 'shadow', token: '--shadow-e5', usedFor: 'Panel elevation' },
    { category: 'motion', token: 'scale-in', value: '200ms emphasized', usedFor: 'Panel entrance' },
    { category: 'motion', token: 'fade-in', value: '160ms standard', usedFor: 'Scrim entrance' },
  ],

  sizes: [
    { name: 'Small', maxWidth: '24rem', padding: '24px', radius: '20px', use: 'A yes/no decision with one sentence of context.' },
    { name: 'Medium', maxWidth: '32rem', padding: '24px', radius: '20px', use: 'The default. A short form or a confirmation with detail.' },
    { name: 'Large', maxWidth: '44rem', padding: '24px', radius: '20px', use: 'Content — a diff, a preview, a list of affected resources.' },
    { name: 'Extra large', maxWidth: '60rem', padding: '24px', radius: '20px', use: 'Rare. A picker or an editor that genuinely needs the width.' },
    { name: 'Fullscreen', maxWidth: '100vw', padding: '24px', radius: '0', use: 'Mobile, or a sub-application with its own navigation.' },
    { name: 'Max height', height: 'min(44rem, 100dvh − 3rem)', use: 'Beyond this the body scrolls and the header and footer pin.' },
  ],

  do: [
    {
      title: 'Label the button with the action',
      why: '"Delete service" tells the user what happens. "OK" forces them to re-read the dialog to reconstruct what they are agreeing to.',
      render: (
        <Row gap="sm">
          <Button size="sm" variant="text">Cancel</Button>
          <Button size="sm" variant="danger">Delete 3 projects</Button>
        </Row>
      ),
    },
    {
      title: 'Make the confirmation proportional to the risk',
      why: 'A second click becomes muscle memory within a week. Typing the resource name is a decision, and it is the standard for anything that destroys production data.',
      render: (
        <Field label="Type api-gateway to confirm" htmlFor="do-confirm" className="w-full max-w-xs">
          <TextInput id="do-confirm" placeholder="api-gateway" />
        </Field>
      ),
    },
    {
      title: 'Pin the header and footer when the body scrolls',
      why: 'A dialog whose action buttons scroll off the bottom is a dialog people abandon. The decision must always be reachable.',
      render: (
        <div className="w-full max-w-xs overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-border)]">
          <div className="border-b border-[var(--ds-border-subtle)] px-3 py-2 text-label">Header</div>
          <div className="h-16 overflow-y-auto px-3 py-2 text-caption text-[var(--ds-fg-muted)]">
            Scrolling content that goes on for a while and keeps going past the visible area of the
            dialog body.
          </div>
          <div className="border-t border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2 text-right">
            <Button size="xs">Confirm</Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Block dismissal only when data would be lost',
      why: 'Escape and scrim-click should almost always work. Turning them off is justified when the user has entered data, and almost never otherwise.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          dirty form → confirm before closing · clean form → Escape closes
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not confirm reversible actions',
      why: 'Every unnecessary confirmation teaches the user to click through dialogs without reading, which is exactly what makes the important one fail.',
      render: (
        <div className="w-full max-w-xs rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-4 shadow-e3">
          <p className="text-label text-[var(--ds-fg)]">Save changes?</p>
          <Row gap="sm" className="mt-3 justify-end">
            <Button size="xs" variant="text">Cancel</Button>
            <Button size="xs">OK</Button>
          </Row>
        </div>
      ),
    },
    {
      title: 'Do not stack dialogs',
      why: 'A dialog opening a dialog leaves the user with two Escape presses to escape and no idea which surface owns which action. Replace the content instead.',
      render: (
        <div className="relative w-full max-w-xs">
          <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-4 shadow-e3">
            <p className="text-label text-[var(--ds-fg)]">First dialog</p>
          </div>
          <div className="absolute left-6 top-6 w-full max-w-[14rem] rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-4 shadow-e5">
            <p className="text-label text-[var(--ds-fg)]">Second dialog</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Do not put a long form in a dialog',
      why: 'A twelve-field form in a modal is a page with the context removed and a scrollbar added. Users cannot reference the data behind the scrim, and mobile makes it worse.',
      render: (
        <div className="w-full max-w-xs rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3 shadow-e3">
          <Stack gap="xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)]" />
            ))}
            <span className="text-[10px] text-[var(--ds-danger-text)]">…7 more fields below</span>
          </Stack>
        </div>
      ),
    },
    {
      title: 'Do not make the destructive action the default',
      why: 'Do not autofocus Delete. A user pressing Enter out of habit should not destroy anything — focus the cancel action, or nothing.',
      render: (
        <Row gap="sm">
          <Button size="sm" variant="text">Cancel</Button>
          <Button size="sm" variant="danger" className="outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">
            Delete
          </Button>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.4.11', name: 'Focus Not Obscured', level: 'AA' },
      { id: '3.3.4', name: 'Error Prevention', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The scrim must make the background clearly inactive while leaving it recognisable. 72% in dark and 42% in light are the values we ship.',
      'The panel border must reach 3:1 against the scrim, or the dialog edge disappears in High Contrast Mode.',
      'The destructive action must not rely on colour alone. Ours pairs red with an explicit verb and an icon.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Cycles inside the dialog only. It never reaches the page behind.' },
      { keys: 'Shift + Tab', does: 'Cycles backwards, wrapping from the first element to the last.' },
      { keys: 'Esc', does: 'Closes, unless data would be lost — then it prompts.' },
      { keys: 'Enter', does: 'Submits the form inside the dialog. Never bound to a destructive default.' },
      { keys: 'Focus on open', does: 'The first focusable element, or the panel itself if there is none.' },
      { keys: 'Focus on close', does: 'Returns to the element that opened it.' },
    ],
    aria: [
      { attr: 'role="dialog" + aria-modal="true"', on: 'The panel', note: 'aria-modal tells assistive tech that everything outside is unavailable.' },
      { attr: 'aria-labelledby', on: 'The panel', note: 'Points at the title, so the dialog announces with a name.' },
      { attr: 'aria-describedby', on: 'The panel', note: 'Points at the description, read after the title.' },
      { attr: 'role="alertdialog"', on: 'Destructive confirmations', note: 'Announced more assertively. Use it for anything irreversible.' },
      { attr: 'inert', on: 'The background', note: 'The modern way to make the rest of the page unreachable by focus and by assistive tech in one attribute.' },
      { attr: 'aria-busy', on: 'The panel while submitting', note: 'So the pending state is announced rather than only drawn.' },
    ],
    focus:
      'Trap on open, restore on close. Both halves matter — restoring focus to the trigger is what lets a keyboard user carry on from where they were rather than at the top of the page.',
    screenReader: [
      'Do not autofocus a destructive button. Focus the first field, the cancel action, or the panel.',
      'Announce the consequence in the description, not only in the title. "This cannot be undone" is the part that matters.',
      'A dialog opened by a keyboard shortcut with no visible trigger still needs a focus-restore target — remember what had focus before it opened.',
    ],
    touch:
      'On phones, use fullscreen or a bottom sheet rather than a centred dialog. A centred modal wastes the margins and puts the actions out of thumb reach. Body scroll is locked with scrollbar compensation so the page does not shift.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Dialog } from '@/ui/Overlay'

// Confirmation. Proportional friction for something irreversible.
const [open, setOpen] = useState(false)
const [typed, setTyped] = useState('')

<Dialog
  open={open}
  onClose={() => { setOpen(false); setTyped('') }}
  size="sm"
  tone="danger"
  icon={<AlertTriangle size={17} />}
  title={'Delete ' + service.name + '?'}
  description="This removes the service and all deployment history. It cannot be undone."
  footer={
    <>
      <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
      <Button
        variant="danger"
        disabled={typed !== service.name}
        loading={deleting}
        onClick={confirmDelete}
      >
        Delete service
      </Button>
    </>
  }
>
  <Field label={'Type ' + service.name + ' to confirm'} htmlFor="confirm">
    <TextInput id="confirm" value={typed} onChange={(e) => setTyped(e.target.value)} />
  </Field>
</Dialog>

// Guard the exit when data would be lost
function requestClose() {
  if (!dirty) return setOpen(false)
  if (confirm('Discard your changes?')) setOpen(false)
}

// The native <dialog> element gives you the top layer, the backdrop
// and Escape for free. Its focus trap is still worth verifying.
const ref = useRef<HTMLDialogElement>(null)
useEffect(() => { open ? ref.current?.showModal() : ref.current?.close() }, [open])`,
    },
    html: {
      lang: 'html',
      code: `<!-- Native dialog: top layer, ::backdrop and Escape come free -->
<dialog class="ds-dialog" aria-labelledby="d-title" aria-describedby="d-desc">
  <header class="ds-dialog__header">
    <span class="ds-dialog__icon" aria-hidden="true"><svg>…</svg></span>
    <div>
      <h2 class="ds-dialog__title" id="d-title">Delete api-gateway?</h2>
      <p class="ds-dialog__desc" id="d-desc">
        This removes the service and all deployment history. It cannot be undone.
      </p>
    </div>
    <button class="ds-dialog__close" aria-label="Close dialog">
      <svg aria-hidden="true">…</svg>
    </button>
  </header>

  <div class="ds-dialog__body">…</div>

  <footer class="ds-dialog__footer">
    <button class="ds-btn ds-btn--text">Cancel</button>
    <button class="ds-btn ds-btn--danger">Delete service</button>
  </footer>
</dialog>

<!-- Destructive confirmations use role="alertdialog" -->
<dialog role="alertdialog" aria-labelledby="d-title">…</dialog>`,
    },
    css: {
      lang: 'css',
      code: `.ds-dialog {
  inline-size: min(32rem, calc(100vw - 2rem));
  max-block-size: min(44rem, calc(100dvh - 3rem));
  padding: 0;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-2xl);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e5);
  animation: scale-in 200ms var(--ease-emphasized) both;
}

/* The page behind should read as paused, not gone */
.ds-dialog::backdrop {
  background: var(--ds-layer-scrim);
  backdrop-filter: blur(2px);
  animation: fade-in 160ms var(--ease-standard) both;
}

/* Scrollable: header and footer pin, only the body moves */
.ds-dialog__header { padding: 20px 24px 16px; }
.ds-dialog__body   { overflow-y: auto; padding: 20px 24px; }
.ds-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-block-start: 1px solid var(--ds-border-subtle);
  background: var(--ds-surface);
}

/* Mobile: fullscreen beats a centred modal in the margins */
@media (max-width: 640px) {
  .ds-dialog {
    inline-size: 100vw;
    max-block-size: 100dvh;
    border-radius: 0;
    margin: 0;
  }
  .ds-dialog__footer { flex-direction: column-reverse; }
  .ds-dialog__footer > * { inline-size: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-dialog { animation-name: fade-in; }
}`,
    },
    api: [
      {
        name: 'Dialog',
        props: [
          { name: 'open', type: 'boolean', required: true, description: 'Controlled. Renders nothing when false.' },
          { name: 'onClose', type: '() => void', required: true, description: 'Called by the close button, the scrim and Escape.' },
          { name: 'title', type: 'ReactNode', required: true, description: 'Wired to aria-labelledby. A dialog with no name is unusable by screen reader.' },
          { name: 'description', type: 'ReactNode', description: 'Wired to aria-describedby. Put the consequence here.' },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'", default: "'md'", description: 'Match the content, not the importance.' },
          { name: 'tone', type: "'neutral' | 'danger' | 'success'", default: "'neutral'", description: 'Tints the icon container.' },
          { name: 'scrollable', type: 'boolean', default: 'false', description: 'Body scrolls; header and footer pin with dividers.' },
          { name: 'dismissible', type: 'boolean', default: 'true', description: 'false removes the close button and blocks Escape and scrim-click. Use only when data would be lost.' },
          { name: 'footer', type: 'ReactNode', description: 'Actions. Cancel first, primary last.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Count the dialogs in your product and ask of each one: what breaks if this just happens with an Undo? Most of them survive the question, and the product gets faster.',
      'Autofocus the first input in a form dialog, and nothing at all in a destructive one. Enter should never delete something by accident.',
      'A wizard in a dialog needs a visible step indicator and a working Back. Without both, users abandon at step two because they cannot tell how much is left.',
      'On mobile, prefer a fullscreen dialog or a bottom sheet. A centred modal on a 375px screen has no margins to spare and puts the buttons out of thumb reach.',
    ],
    performance: [
      'Render in a portal at the body. Inside a transformed ancestor, position: fixed silently stops being fixed and the dialog is clipped.',
      'Do not mount the dialog until it opens. A page with twelve dialogs mounted and hidden pays for all twelve on every render.',
      'Lock body scroll with scrollbar-width compensation, or the page shifts horizontally the moment the dialog opens.',
      'The native <dialog> element uses the browser top layer, which sidesteps z-index entirely and is measurably cheaper than a portal plus a manual scrim.',
    ],
    mistakes: [
      'No focus trap, so Tab walks into a page the user cannot see.',
      'Not restoring focus on close, dropping the keyboard user back at the top of the document.',
      'Stacking dialogs, leaving two Escape presses between the user and the page.',
      'Autofocusing the destructive action, so Enter deletes.',
      'Forgetting to lock body scroll, so the page behind scrolls under the scrim.',
      'A dialog with no accessible name, which announces as "dialog" and nothing else.',
    ],
    realWorld: [
      'Confirmation fatigue is measurable: track how quickly users dismiss each dialog. Anything under about 800ms is being clicked through without reading.',
      'For destructive actions on shared resources, name the blast radius — "This will affect 3 environments and 12 deployments" — rather than a generic warning.',
      'A dialog that appears on page load is almost always a mistake. The user has not asked for anything yet, and it is the fastest way to be dismissed unread.',
      'When a dialog needs to become a page, it usually already should have been. The moment it grows a scrollbar and a second step, move it.',
    ],
  },
})

function WizardDemo() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const steps = ['Source', 'Build', 'Review']

  return (
    <>
      <Button variant="outlined" onClick={() => { setOpen(true); setStep(0) }}>
        Open wizard
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="md"
        title="New service"
        description={`Step ${step + 1} of ${steps.length} · ${steps[step]}`}
        footer={
          <>
            <Button variant="text" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <span className="flex-1" />
            <Button
              variant="outlined"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            <Button
              onClick={() => (step === steps.length - 1 ? setOpen(false) : setStep((s) => s + 1))}
            >
              {step === steps.length - 1 ? 'Create service' : 'Continue'}
            </Button>
          </>
        }
      >
        <Stack gap="md">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                    i < step
                      ? 'bg-[var(--ds-success)] text-[var(--ds-success-fg)]'
                      : i === step
                        ? 'bg-[var(--ds-accent)] text-[var(--ds-accent-fg)]'
                        : 'bg-[var(--ds-layer-active)] text-[var(--ds-fg-muted)]'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span className="h-px flex-1 bg-[var(--ds-border-subtle)]" />
                )}
              </React.Fragment>
            ))}
          </div>
          <Field label={`${steps[step]} configuration`} htmlFor={`w-${step}`}>
            <TextInput id={`w-${step}`} placeholder={`Value for ${steps[step].toLowerCase()}`} />
          </Field>
        </Stack>
      </Dialog>
    </>
  )
}
