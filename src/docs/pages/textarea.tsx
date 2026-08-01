import * as React from 'react'
import { Button } from '@/ui/Button'
import { Field, Textarea } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const MAX = 280

function Playground() {
  const [value, setValue] = React.useState(
    'Rolled back to 4019 after the health check failed in eu-west-2.',
  )
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg'>('md')
  const [status, setStatus] = React.useState<'default' | 'error' | 'success'>('default')
  const [autoResize, setAutoResize] = React.useState(true)
  const [counter, setCounter] = React.useState(true)

  const over = value.length > MAX

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md', 'lg'] as const} />
          </Knob>
          <Knob label="Status">
            <KnobSelect
              value={status}
              onChange={setStatus}
              options={['default', 'error', 'success'] as const}
            />
          </Knob>
          <KnobToggle checked={autoResize} onChange={setAutoResize} label="Auto-resize" />
          <KnobToggle checked={counter} onChange={setCounter} label="Counter" />
        </div>
      }
      code={`<Field
  label="Deployment note"
  description="Visible to everyone with access to this project."${counter ? `\n  counter={{ value: ${value.length}, max: ${MAX} }}` : ''}
  status="${over ? 'error' : status}"
>
  <Textarea
    size="${size}"
    autoResize={${autoResize}}
    rows={4}
  />
</Field>`}
    >
      <div className="w-full max-w-md">
        <Field
          label="Deployment note"
          description="Visible to everyone with access to this project."
          counter={counter ? { value: value.length, max: MAX } : undefined}
          status={over ? 'error' : status}
          message={
            over
              ? `${value.length - MAX} characters over the limit`
              : status === 'error'
                ? 'A note is required when rolling back.'
                : status === 'success'
                  ? 'Saved'
                  : undefined
          }
        >
          <Textarea
            size={size}
            autoResize={autoResize}
            rows={4}
            value={value}
            status={over ? 'error' : status}
            onChange={(e) => setValue(e.target.value)}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

function SubmitDemo() {
  const [value, setValue] = React.useState('')
  const [sent, setSent] = React.useState<string[]>([])

  const send = () => {
    if (!value.trim()) return
    setSent((s) => [...s, value.trim()])
    setValue('')
  }

  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <Stack gap="sm" className="w-full max-w-md">
        {sent.map((s, i) => (
          <p
            key={i}
            className="rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] px-3 py-2 text-body-sm text-[var(--ds-fg-secondary)]"
          >
            {s}
          </p>
        ))}
        <Textarea
          rows={2}
          autoResize
          value={value}
          placeholder="Add a comment…"
          aria-label="Add a comment"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter inserts a newline. ⌘/Ctrl+Enter submits. Never the other
            // way round — a multi-line field whose Enter submits eats drafts.
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
        />
        <Row gap="sm" align="center">
          <Button size="sm" onClick={send} disabled={!value.trim()}>
            Comment
          </Button>
          <span className="text-caption text-[var(--ds-fg-muted)]">⌘↵ to send</span>
        </Row>
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'textarea',
    title: 'Textarea',
    tagline:
      'Multi-line free text. Autosize, counters, a resize handle the user keeps — and an Enter key that must not submit the form.',
    keywords: ['multiline', 'comment', 'autosize', 'rows', 'counter', 'resize', 'description'],
  },

  overview: {
    purpose:
      'A textarea collects text that may run to several lines and whose shape the user controls: a comment, a description, a note, a reason. Everything it inherits from Text Field — the label, the description, the error stacking — stays identical. What changes is that the field has a height the user can see and often change, an Enter key that means "new line", and a length the user needs to be able to judge before they hit a limit.',
    whenToUse: [
      'The expected answer runs longer than a line: a description, a reason, a comment, a message.',
      'The user may want to structure their answer with line breaks or short paragraphs.',
      'A limit exists and the user should be able to see how close they are before hitting it.',
    ],
    whenNotToUse: [
      {
        text: 'The answer is one line.',
        instead: 'a Text Field — the extra height promises detail the field does not want',
        to: '#/text-field',
      },
      {
        text: 'The content is code or structured data.',
        instead: 'a JSON Input, which brings monospace and validation',
        to: '#/json-input',
      },
      {
        text: 'The answer is one of a known set.',
        instead: 'a Select or Radio Button',
        to: '#/select',
      },
      {
        text: 'The content needs formatting the user can see.',
        instead: 'a rich-text editor with a Toolbar — this component is plain text only',
        to: '#/toolbar',
      },
    ],
    reasoning: (
      <>
        <p>
          The height of a textarea is a <strong>promise about the expected answer</strong>. Four
          rows says "a paragraph would be welcome"; two rows says "a sentence is fine"; twelve rows
          says "we expect an essay" and quietly makes people feel their honest one-line answer is
          inadequate. Pick the initial height from the answer you actually want.
        </p>
        <p>
          <strong>Enter must insert a newline.</strong> That is what the key means in a multi-line
          field and every user knows it. If the surrounding surface needs a submit shortcut, it is{' '}
          <code>⌘</code>/<code>Ctrl</code> + Enter, and it must be visible next to the button —
          otherwise it is a secret. Submitting on bare Enter destroys drafts, and the person it
          happens to has no idea what they did wrong.
        </p>
        <p>
          A counter that only appears when the user is close to the limit is worse than no counter.
          Someone typing a long answer needs to know a limit exists <em>before</em> they have
          written past it, and discovering it at 290 of 280 characters means rewriting rather than
          trimming.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'submit',
        title: 'Enter is a newline',
        description:
          'The comment box every product needs. Enter breaks the line; ⌘↵ sends; the shortcut is printed next to the button so it is discoverable rather than folkloric.',
        render: <SubmitDemo />,
      },
      {
        id: 'height',
        title: 'Height sets the expectation',
        description:
          'The same question at two rows and at ten. The taller field does not collect better answers — it collects more apologetic ones.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Two rows" sub="“A sentence is fine”" tone="good">
                <Field label="Why are you rolling back?">
                  <Textarea rows={2} placeholder="Health check failed in eu-west-2" />
                </Field>
              </Cell>
              <Cell label="Ten rows" sub="“We expect an essay”" tone="bad">
                <Field label="Why are you rolling back?">
                  <Textarea rows={10} />
                </Field>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'autosize',
        title: 'Autosize with a ceiling',
        description:
          'The field grows with the content up to a maximum, then scrolls. Without the ceiling, a pasted wall of text pushes the submit button off the screen.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-md">
              <Field
                label="Release notes"
                description="Grows to 12 rows, then scrolls."
              >
                <Textarea autoResize rows={2} maxRows={12} placeholder="Type a few lines…" />
              </Field>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'counter',
        title: 'Counters and over-limit',
        description:
          'The counter is visible from the first character. Going over is an error state, not a hard block — cutting the user off mid-word loses the sentence they were finishing.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Under" tone="good">
                <Field label="Summary" counter={{ value: 64, max: 280 }}>
                  <Textarea rows={2} defaultValue="Rolled back to 4019 after the health check failed in eu-west-2." />
                </Field>
              </Cell>
              <Cell label="Over" tone="bad">
                <Field
                  label="Summary"
                  counter={{ value: 296, max: 280 }}
                  status="error"
                  message="16 characters over the limit"
                >
                  <Textarea
                    rows={2}
                    status="error"
                    defaultValue="Rolled back to 4019 after the health check failed in eu-west-2, then again in us-east-1 once the connection pool saturated and the retry budget was exhausted well before the circuit opened."
                  />
                </Field>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <div className="w-52"><Textarea rows={2} placeholder="Add a note…" aria-label="d" /></div> },
      { label: 'Filled', render: <div className="w-52"><Textarea rows={2} defaultValue="Rolled back to 4019." aria-label="f" /></div> },
      { label: 'Focus', render: <div className="w-52"><Textarea rows={2} className="border-[var(--ds-accent)] shadow-[0_0_0_3px_var(--ds-accent-subtle)]" defaultValue="Focused" aria-label="fo" /></div> },
      { label: 'Error', render: <div className="w-52"><Textarea rows={2} status="error" defaultValue="Too short" aria-label="e" /></div> },
      { label: 'Success', render: <div className="w-52"><Textarea rows={2} status="success" defaultValue="Saved" aria-label="s" /></div> },
      { label: 'Disabled', render: <div className="w-52"><Textarea rows={2} disabled defaultValue="Locked" aria-label="di" /></div> },
      { label: 'Read only', render: <div className="w-52"><Textarea rows={2} readOnly defaultValue="Read only" aria-label="ro" /></div> },
      { label: 'Small', render: <div className="w-52"><Textarea size="sm" rows={2} placeholder="Small" aria-label="sm" /></div> },
      { label: 'Large', render: <div className="w-52"><Textarea size="lg" rows={2} placeholder="Large" aria-label="lg" /></div> },
      { label: 'Scrolling', render: <div className="w-52"><Textarea rows={2} defaultValue={'One\nTwo\nThree\nFour\nFive'} aria-label="sc" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Field
          label="Deployment note"
          description="Visible to everyone with access to this project."
          counter={{ value: 64, max: 280 }}
        >
          <Textarea rows={4} defaultValue="Rolled back to 4019 after the health check failed in eu-west-2." />
        </Field>
      </div>
    ),
    caption:
      'Label, static description, the field itself, and a counter that has been visible since the first character.',
    parts: [
      {
        n: 1,
        label: 'Initial rows',
        value: '4 rows ≈ 96px',
        kind: 'size',
        note: 'The promise about the expected answer. Two rows for a sentence, four for a paragraph. Ten rows makes an honest short answer feel inadequate.',
      },
      {
        n: 2,
        label: 'Padding',
        value: '10px 12px',
        kind: 'space',
        note: 'Slightly more vertical padding than a single-line input, because the first line needs to sit off the top edge rather than be optically centred.',
      },
      {
        n: 3,
        label: 'Line height',
        value: '1.6',
        kind: 'type',
        note: 'Looser than a single-line control. Multi-line text needs the leading to stay readable, and it is what makes the row count predict the height.',
      },
      {
        n: 4,
        label: 'Max height',
        value: '12 rows, then scroll',
        kind: 'size',
        note: 'The ceiling on autosize. Without it, a pasted wall of text pushes the submit button below the fold and the user cannot find it.',
      },
      {
        n: 5,
        label: 'Resize handle',
        value: 'Vertical only, 16px',
        kind: 'shape',
        note: 'Never horizontal — a field wider than its container breaks the form layout. Disabled when autosize is on, since two things would be fighting for the height.',
      },
      {
        n: 6,
        label: 'Counter',
        value: '12px, top-right of the field',
        kind: 'type',
        note: 'Visible from the first character. Appearing only near the limit means the user learns about it after they have written past it.',
      },
      {
        n: 7,
        label: 'Message',
        value: 'Stacks under the description',
        kind: 'space',
        note: 'It never replaces the description. Losing the instructions at the moment of failure is exactly backwards.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Error border' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Error message and over-limit counter' },
    { category: 'color', token: '--ds-fg', usedFor: 'Typed text' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Placeholder, description, counter' },
    { category: 'spacing', token: 'padding', value: '10px 12px', usedFor: 'Field padding' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'typography', token: '--text-body', value: '15px / 1.6', usedFor: 'Typed text and its leading' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Border and halo transition' },
  ],

  sizes: [
    { name: 'Small', height: '2 rows ≈ 56px', padding: '8px 10px', radius: '8px', type: '13px', use: 'Inline comment boxes and dense forms.' },
    { name: 'Medium', height: '4 rows ≈ 96px', padding: '10px 12px', radius: '8px', type: '15px', use: 'The default. Descriptions and notes.' },
    { name: 'Large', height: '6 rows ≈ 152px', padding: '12px 14px', radius: '12px', type: '16px', use: 'The main content field on a page dedicated to writing.' },
    { name: 'Autosize ceiling', height: '12 rows', use: 'Grows with content to here, then scrolls. Non-negotiable — without it the submit button leaves the screen.' },
    { name: 'Measure', maxWidth: '36rem', use: 'About 70 characters per line. Wider and the eye loses the start of the next line.' },
  ],

  do: [
    {
      title: 'Let Enter insert a newline',
      why: 'It is what the key means in a multi-line field. If a submit shortcut is needed, use ⌘/Ctrl+Enter and print it next to the button.',
      render: (
        <Row gap="sm" align="center">
          <Button size="sm">Comment</Button>
          <span className="text-caption text-[var(--ds-fg-muted)]">⌘↵ to send</span>
        </Row>
      ),
    },
    {
      title: 'Show the counter from the first character',
      why: 'The limit is a constraint on what to write, not a punishment discovered afterwards. At 290 of 280 the user is rewriting, not trimming.',
      render: (
        <div className="w-full max-w-xs">
          <Field label="Summary" counter={{ value: 0, max: 280 }}>
            <Textarea rows={2} placeholder="Start typing…" />
          </Field>
        </div>
      ),
    },
    {
      title: 'Allow going over, then explain',
      why: 'Hard-blocking at the limit swallows keystrokes mid-word. Let the text through, mark it as an error, and say how much to cut.',
      render: (
        <div className="w-full max-w-xs">
          <Field
            label="Summary"
            counter={{ value: 296, max: 280 }}
            status="error"
            message="16 characters over the limit"
          >
            <Textarea rows={2} status="error" defaultValue="…" />
          </Field>
        </div>
      ),
    },
    {
      title: 'Cap the measure at about 70 characters',
      why: 'A textarea stretched across a 1440px window produces lines the eye cannot track back from. Width is a readability setting, not a space-filling one.',
      render: (
        <div className="w-full max-w-sm">
          <Textarea rows={3} aria-label="measure" defaultValue="Roughly seventy characters per line is where the eye reliably finds the start of the next one." />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not submit on bare Enter',
      why: 'The user was writing a paragraph and the form went away. They have no idea what they pressed, and the draft is gone.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          onKeyDown: if (e.key === 'Enter') submit()
        </span>
      ),
    },
    {
      title: 'Do not allow horizontal resize',
      why: 'A field dragged wider than its container breaks the form layout and can push the submit button off-screen. Vertical only, always.',
      render: (
        <div className="w-full max-w-xs">
          <textarea
            aria-label="horizontal resize"
            className="h-16 w-full rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] p-2 text-body-sm"
            style={{ resize: 'both' }}
          />
        </div>
      ),
    },
    {
      title: 'Do not use the placeholder as the label',
      why: 'It disappears at the first keystroke, which for a long answer means the question is gone for the entire time it takes to answer it.',
      render: (
        <div className="w-full max-w-xs">
          <Textarea rows={2} placeholder="Why are you rolling back?" aria-label="placeholder as label" />
        </div>
      ),
    },
    {
      title: 'Do not grow without a ceiling',
      why: 'A pasted log file turns the field into the page and the submit button ends up below the fold with no indication it is there.',
      render: (
        <div className="w-full max-w-xs overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <div className="h-28 bg-[var(--ds-surface-inset)] p-2">
            <span className="text-[10px] leading-tight text-[var(--ds-fg-disabled)]">
              {Array.from({ length: 9 }, () => 'pasted log line…').join('\n')}
            </span>
          </div>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The idle border owes 3:1 — it is the only thing showing an input is there.',
      'Placeholder text owes 4.5:1 like any other text. The common 2.5:1 placeholder is a contrast failure people excuse because it is "just a hint".',
      'The error state changes the border, the message and the counter together, so it survives greyscale and High Contrast Mode.',
      'The resize handle is a control and owes 3:1 against the field fill.',
    ],
    keyboard: [
      { keys: 'Enter', does: 'Inserts a newline. Always.' },
      { keys: '⌘ / Ctrl + Enter', does: 'Submits, when the surrounding surface has a submit action. Must be printed next to the button.' },
      { keys: 'Tab', does: 'Leaves the field. It must never insert a tab character — that traps keyboard users inside the textarea.' },
      { keys: 'Esc', does: 'In a comment box, optionally discards the draft. Confirm first if anything has been typed.' },
      { keys: '⌘ / Ctrl + A', does: 'Selects the field’s content only, never the page.' },
    ],
    aria: [
      { attr: '<label for>', on: 'The field', note: 'A real label element. aria-label is the fallback for a field with no visible label, such as a bare comment box.' },
      { attr: 'aria-describedby', on: 'The field', note: 'Points at the description and, when present, the counter — so both are read after the label.' },
      { attr: 'aria-invalid', on: 'The field', note: 'Set when the value is invalid, including over the character limit.' },
      { attr: 'aria-errormessage', on: 'The field', note: 'Points at the message element, which must be rendered before it is referenced.' },
      { attr: 'role="status"', on: 'The counter', note: 'Polite, and throttled to roughly every 20 characters. Announcing every keystroke is unusable.' },
      { attr: 'maxlength', on: 'The field', note: 'Deliberately omitted when you want to allow going over. A hard maxlength swallows keystrokes with no explanation.' },
    ],
    focus:
      'The focus halo must be visible on all four sides, which means the field cannot sit flush against a container edge. On error, focus moves to the first invalid field and the message is announced — not just coloured.',
    screenReader: [
      'Announce the limit in the description, not only in the counter: "Up to 280 characters" is read once, at the point it is useful.',
      'Throttle counter announcements. Every keystroke is unusable; roughly every 20 characters, plus one at the limit and one when going over, is right.',
      'A textarea with a placeholder and no label announces as "edit text, blank" once typing starts. There must always be a real label or an aria-label.',
    ],
    touch:
      'The on-screen keyboard covers the lower half of the screen, so a textarea near the bottom of a form must scroll into view on focus along with its submit button. Autosize matters more on touch than anywhere else: a two-row field on a phone shows almost nothing of what has been written. Set inputmode and the enterKeyHint so the keyboard offers a newline key rather than "Go".',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Field, Textarea } from '@/ui/Input'

const MAX = 280
const over = value.length > MAX

<Field
  label="Deployment note"
  description="Visible to everyone with access to this project."
  // Visible from the first character, not only when the user is close.
  counter={{ value: value.length, max: MAX }}
  status={over ? 'error' : 'default'}
  message={over ? \`\${value.length - MAX} characters over the limit\` : undefined}
>
  <Textarea
    rows={4}
    autoResize
    maxRows={12}                    // the ceiling is not optional
    value={value}
    onChange={(e) => setValue(e.target.value)}
    // No maxLength: we want the text through so we can explain it, rather
    // than swallowing keystrokes mid-word.
    onKeyDown={(e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        submit()
      }
    }}
  />
</Field>

// Autosize without layout thrash: reset, then read, then set. Reading
// scrollHeight before the reset gives you the previous height forever.
function autosize(el: HTMLTextAreaElement, maxRows = 12) {
  el.style.height = 'auto'
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
  el.style.height = \`\${Math.min(el.scrollHeight, lineHeight * maxRows)}px\`
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label for="note">Deployment note</label>

  <p id="note-desc" class="ds-field__desc">
    Visible to everyone with access to this project. Up to 280 characters.
  </p>

  <textarea
    id="note"
    rows="4"
    aria-describedby="note-desc note-count"
    aria-invalid="true"
    aria-errormessage="note-err"
    enterkeyhint="enter"
  ></textarea>

  <!-- Throttled: announcing every keystroke is unusable. -->
  <p id="note-count" role="status" aria-live="polite">296 of 280</p>

  <!-- Stacks under the description. It never replaces it. -->
  <p id="note-err" class="ds-field__error">16 characters over the limit</p>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-textarea {
  inline-size: 100%;
  max-inline-size: 36rem;            /* ~70 characters — a readability cap */
  min-block-size: calc(4 * 1.6em + 20px);
  padding: 10px 12px;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
  font: inherit;
  line-height: 1.6;                  /* looser than a single-line control */

  /* Vertical only. A field dragged wider than its container breaks the
     form and can push the submit button off-screen. */
  resize: vertical;
  field-sizing: content;             /* native autosize where supported */
  max-block-size: calc(12 * 1.6em + 20px);
}

/* Two things fighting over the height is one too many. */
.ds-textarea[data-autoresize='true'] { resize: none; }

.ds-textarea:focus-visible {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
  outline: none;
}

.ds-textarea[aria-invalid='true'] { border-color: var(--ds-danger-border); }

/* Placeholders are text and owe 4.5:1 like any other text. */
.ds-textarea::placeholder { color: var(--ds-fg-muted); }

.ds-field__count[data-over='true'] { color: var(--ds-danger-text); }`,
    },
    api: [
      {
        name: 'Textarea',
        props: [
          { name: 'rows', type: 'number', default: '4', description: 'Initial height. This is a promise about the answer you expect — pick it deliberately.' },
          { name: 'autoResize', type: 'boolean', default: 'false', description: 'Grows with content up to maxRows. Disables the manual resize handle.' },
          { name: 'maxRows', type: 'number', default: '12', description: 'The autosize ceiling. Past it the field scrolls.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Sets padding, type size and radius.' },
          { name: 'status', type: "'default' | 'error' | 'success' | 'warning'", default: "'default'", description: 'Drives the border and pairs with the Field message.' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Removes the field from the tab order. Prefer readOnly when the value still matters.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Focusable, selectable, copyable — but not editable.' },
        ],
      },
      {
        name: 'Field',
        props: [
          { name: 'label', type: 'string', description: 'Always above the field. Never a placeholder.' },
          { name: 'description', type: 'string', description: 'Static guidance. Stays visible when an error appears.' },
          { name: 'message', type: 'string', description: 'Validation message. Stacks under the description rather than replacing it.' },
          { name: 'counter', type: '{ value: number; max: number }', description: 'Visible from the first character, and turns danger-toned when over.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Autosave drafts on a debounce. A long answer lost to a refresh is the most avoidable frustration this component has.',
      'Preserve the draft when validation fails elsewhere in the form. Users notice immediately when a rejected submit clears the paragraph they wrote.',
      'Set enterKeyHint on mobile so the on-screen keyboard offers a newline key rather than "Go".',
      'If the field accepts Markdown, say so under it and offer a preview toggle. Users type asterisks either way; the question is whether the product acknowledges it.',
      'Trim trailing whitespace on submit, not while typing. Trimming as the user types eats the space they just pressed before the next word.',
    ],
    performance: [
      'Autosize needs two writes and one read per keystroke: reset the height, read scrollHeight, set the height. Reading before the reset returns the previous height forever.',
      'Prefer CSS field-sizing: content where it is supported and keep the JS as a fallback — it removes the layout thrash entirely.',
      'Debounce autosave and validation by roughly 300ms. Validating on every keystroke in a long field is wasted work and produces errors while the user is mid-word.',
      'Do not re-render an entire form on every keystroke in one textarea. Keep the value local and lift it on blur when the form is large.',
    ],
    mistakes: [
      'Submitting on bare Enter, silently destroying drafts.',
      'A counter that only appears near the limit, so the constraint is discovered after it is broken.',
      'A hard maxlength that swallows keystrokes mid-word with no explanation.',
      'Autosize with no ceiling, pushing the submit button off the screen.',
      'resize: both, letting the user break the form layout horizontally.',
      'Placeholder as label, which disappears exactly when the user needs the question most.',
      'A 12-row field for a one-sentence answer, which makes an honest short answer feel wrong.',
    ],
    realWorld: [
      'Comment boxes should start at two rows and grow. A tall empty box reads as a demand for an essay, and it measurably reduces the number of people who reply at all.',
      'Character limits should be generous or absent. A 280-character limit on an internal deployment note is a rule inherited from a product that had a reason for it.',
      'Users paste far more than they type into textareas. Handle a pasted wall of text gracefully: grow to the ceiling, scroll, keep the counter accurate.',
      'If you find yourself adding formatting buttons above a textarea, you have outgrown the component. That is a rich-text editor, and pretending otherwise produces the worst of both.',
    ],
  },
})
