import * as React from 'react'
import { AlertCircle, Check, Wand2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Field } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const VALID = `{
  "project": "api-gateway",
  "region": "eu-west-2",
  "replicas": 3,
  "healthCheck": {
    "path": "/healthz",
    "timeoutMs": 2000
  }
}`

const BROKEN = `{
  "project": "api-gateway",
  "region": "eu-west-2",
  "replicas": 3,
  "healthCheck": {
    "path": "/healthz"
    "timeoutMs": 2000
  }
}`

interface ParseError {
  line: number
  column: number
  message: string
}

/** Parses and converts the engine's byte offset into a line and column, which
    is the only form of the error a human can act on. */
function parse(text: string): { ok: true } | { ok: false; error: ParseError } {
  try {
    JSON.parse(text)
    return { ok: true }
  } catch (e) {
    const raw = (e as Error).message
    const pos = Number(/position (\d+)/.exec(raw)?.[1] ?? -1)
    if (pos < 0) return { ok: false, error: { line: 1, column: 1, message: raw } }
    const before = text.slice(0, pos)
    const line = before.split('\n').length
    const column = pos - before.lastIndexOf('\n')
    return {
      ok: false,
      error: {
        line,
        column,
        message: raw.replace(/ in JSON at position \d+.*/, '').replace(/^JSON\.parse: /, ''),
      },
    }
  }
}

function JsonEditor({
  value,
  onChange,
  rows = 10,
  readOnly,
}: {
  value: string
  onChange?: (v: string) => void
  rows?: number
  readOnly?: boolean
}) {
  const result = parse(value)
  const lines = value.split('\n')
  const errLine = result.ok ? -1 : result.error.line

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex overflow-hidden rounded-[var(--radius-md)] border bg-[var(--ds-surface-inset)]',
          'focus-within:border-[var(--ds-accent)] focus-within:shadow-[0_0_0_3px_var(--ds-accent-subtle)]',
          result.ok ? 'border-[var(--ds-border-interactive)]' : 'border-[var(--ds-danger-border)]',
        )}
      >
        {/* Unselectable, and never part of what the user copies out. */}
        <div
          aria-hidden
          className="shrink-0 select-none border-r border-[var(--ds-border-subtle)] py-2.5 pl-3 pr-2 text-right font-mono text-[11px] leading-[1.55] text-[var(--ds-fg-disabled)]"
        >
          {lines.map((_, i) => (
            <div
              key={i}
              className={cn(i + 1 === errLine && 'font-semibold text-[var(--ds-danger-text)]')}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          spellCheck={false}
          aria-label="Configuration JSON"
          aria-invalid={!result.ok}
          aria-errormessage={result.ok ? undefined : 'json-error'}
          onKeyDown={(e) => {
            // Tab must indent, not leave — but Escape then Tab has to escape,
            // or the field is a keyboard trap.
            if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault()
              const el = e.currentTarget
              const { selectionStart: s, selectionEnd: en } = el
              const next = `${value.slice(0, s)}  ${value.slice(en)}`
              onChange?.(next)
              requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2))
            }
          }}
          className="min-w-0 flex-1 resize-y bg-transparent p-2.5 font-mono text-[13px] leading-[1.55] text-[var(--ds-fg)] outline-none"
        />
      </div>

      <div className="mt-1.5 flex items-start gap-2">
        {result.ok ? (
          <p className="flex items-center gap-1.5 text-caption text-[var(--ds-success-text)]">
            <Check size={13} /> Valid JSON
          </p>
        ) : (
          <p
            id="json-error"
            role="status"
            className="flex items-start gap-1.5 text-caption text-[var(--ds-danger-text)]"
          >
            <AlertCircle size={13} className="mt-px shrink-0" />
            <span>
              Line {result.error.line}, column {result.error.column}: {result.error.message}
            </span>
          </p>
        )}
        {onChange && result.ok && (
          <Button
            size="sm"
            variant="text"
            startIcon={<Wand2 size={13} />}
            className="ml-auto shrink-0"
            onClick={() => onChange(JSON.stringify(JSON.parse(value), null, 2))}
          >
            Format
          </Button>
        )}
      </div>
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState(VALID)
  const [rows, setRows] = React.useState<'8' | '12' | '16'>('12')
  const [readOnly, setReadOnly] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={320}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Rows">
            <KnobSelect value={rows} onChange={setRows} options={['8', '12', '16'] as const} />
          </Knob>
          <KnobToggle checked={readOnly} onChange={setReadOnly} label="Read only" />
          <Button size="sm" variant="outlined" onClick={() => setValue(BROKEN)}>
            Break it
          </Button>
        </div>
      }
      code={`<Field label="Deployment config" description="Merged over the project defaults.">
  <JsonInput
    rows={${rows}}${readOnly ? '\n    readOnly' : ''}
    value={config}
    onChange={setConfig}
    schema={deploymentSchema}
  />
</Field>`}
    >
      <div className="w-full max-w-lg">
        <Field
          label="Deployment config"
          description="Merged over the project defaults on every deploy."
        >
          <JsonEditor
            value={value}
            onChange={readOnly ? undefined : setValue}
            rows={Number(rows)}
            readOnly={readOnly}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'json-input',
    title: 'JSON Input',
    tagline:
      'Structured-data entry with a gutter, live validation, and an error message that says which line broke.',
    keywords: ['code editor', 'yaml', 'config', 'schema', 'linting', 'monospace', 'parse error'],
  },

  overview: {
    purpose:
      'A JSON input is a textarea that knows what it holds. It adds three things a plain field cannot: a line gutter so an error can be pointed at, live parsing so the user finds out before submitting, and a format action so a pasted single line becomes readable. It is for the small proportion of users who edit configuration by hand — and for them it is the difference between a usable product and a guessing game.',
    whenToUse: [
      'Configuration, request bodies, feature-flag payloads, webhook templates.',
      'Anywhere a user pastes structured data from documentation or an API response.',
      'Read-only display of a payload that has to stay copyable and searchable.',
    ],
    whenNotToUse: [
      {
        text: 'The shape is known and small.',
        instead: 'a real Form — nobody should hand-write JSON for four settings',
        to: '#/form',
      },
      {
        text: 'The content is prose.',
        instead: 'a Textarea',
        to: '#/textarea',
      },
      {
        text: 'The value is read-only and meant to be copied.',
        instead: 'a Code Snippet, which is built for exactly that',
        to: '#/code-snippet',
      },
      {
        text: 'Users would be editing a full source file.',
        instead: 'a real editor — this component is a field, not an IDE',
        to: '#/toolbar',
      },
    ],
    reasoning: (
      <>
        <p>
          <code>JSON.parse</code> throws a message containing a byte offset, which is useless to a
          human. The component's actual job is <strong>converting that offset into a line and a
          column</strong> and highlighting the gutter row. "Unexpected string at position 118" is a
          riddle; "Line 6, column 5: expected a comma" is an instruction.
        </p>
        <p>
          Tab has to indent, or the field is unusable for its one purpose. But a field that
          swallows Tab is a keyboard trap under 2.1.2, so <strong>Escape then Tab must
          escape</strong>. That pair of behaviours is non-negotiable and it is the thing most
          in-page code fields get wrong.
        </p>
        <p>
          Validate on a debounce, not on every keystroke. Every partially typed object is invalid
          on the way to being valid, and an error that appears the moment a brace is opened trains
          people to ignore the error line entirely.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'error',
        title: 'The error names a line',
        description:
          'A missing comma on line 6. The gutter marks it, the message says where, and the field border carries the state — three signals for one fault.',
        render: (
          <PreviewStage minHeight={300} center={false}>
            <div className="w-full max-w-lg">
              <JsonEditor value={BROKEN} rows={9} readOnly />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'format',
        title: 'Format on demand, never on type',
        description:
          'A pasted single line becomes readable in one press. Reformatting as the user types moves the caret out from under them mid-word.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Pasted" tone="bad">
                <code className="block overflow-x-auto whitespace-nowrap font-mono text-[11px] text-[var(--ds-fg-secondary)]">
                  {'{"project":"api-gateway","region":"eu-west-2","replicas":3}'}
                </code>
              </Cell>
              <Cell label="After Format" tone="good">
                <code className="block whitespace-pre font-mono text-[11px] leading-relaxed text-[var(--ds-fg-secondary)]">
                  {'{\n  "project": "api-gateway",\n  "region": "eu-west-2",\n  "replicas": 3\n}'}
                </code>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'schema',
        title: 'Schema errors are different from syntax errors',
        description:
          'Valid JSON can still be wrong. Say which it is — a user hunting for a missing brace when the real problem is an unknown key will not find it.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-lg">
              <Row gap="sm" align="start" className="text-caption text-[var(--ds-danger-text)]">
                <AlertCircle size={13} className="mt-px shrink-0" />
                <span>Line 6, column 5: expected a comma — the document could not be parsed.</span>
              </Row>
              <Row gap="sm" align="start" className="text-caption text-[var(--ds-warning-text)]">
                <AlertCircle size={13} className="mt-px shrink-0" />
                <span>
                  Line 4: “replicas” must be between 1 and 12 — the document parsed, but the value
                  is not allowed.
                </span>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'readonly',
        title: 'Read-only payloads',
        description:
          'Still focusable, still selectable, still copyable. A response body the user cannot select is a response body they will screenshot.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-lg">
              <JsonEditor value={VALID} rows={9} readOnly />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Valid', render: <div className="w-56"><JsonEditor value={'{\n  "a": 1\n}'} rows={3} readOnly /></div> },
      { label: 'Invalid', render: <div className="w-56"><JsonEditor value={'{\n  "a": 1\n  "b": 2\n}'} rows={4} readOnly /></div> },
      { label: 'Empty', render: <div className="w-56"><JsonEditor value={''} rows={3} readOnly /></div> },
      { label: 'Read only', render: <div className="w-56"><JsonEditor value={'{ "ok": true }'} rows={2} readOnly /></div> },
      {
        label: 'Error line',
        render: (
          <span className="font-mono text-[11px] font-semibold text-[var(--ds-danger-text)]">6</span>
        ),
      },
      {
        label: 'Gutter',
        render: (
          <span className="select-none font-mono text-[11px] leading-[1.55] text-[var(--ds-fg-disabled)]">
            1<br />2<br />3
          </span>
        ),
      },
      {
        label: 'Valid message',
        render: (
          <span className="flex items-center gap-1.5 text-caption text-[var(--ds-success-text)]">
            <Check size={13} /> Valid JSON
          </span>
        ),
      },
      {
        label: 'Format action',
        render: (
          <Button size="sm" variant="text" startIcon={<Wand2 size={13} />}>
            Format
          </Button>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <JsonEditor value={BROKEN} rows={9} readOnly />
      </div>
    ),
    caption:
      'Gutter, monospace body, a border carrying the parse state, and a message that converts a byte offset into a line and column.',
    parts: [
      {
        n: 1,
        label: 'Gutter',
        value: '11px, unselectable',
        kind: 'type',
        note: 'The reason this is not a textarea. Without line numbers an error message has nothing to point at. Never part of a selection or a copy.',
      },
      {
        n: 2,
        label: 'Error row',
        value: 'Danger tone, semibold',
        kind: 'color',
        note: 'The gutter number for the failing line changes weight and colour. It is what turns "line 6" from a number into a location.',
      },
      {
        n: 3,
        label: 'Type',
        value: '13px / 1.55 monospace',
        kind: 'type',
        note: 'Same as a Code Snippet, for the same reason: 1, l and I must be distinguishable, and indentation only reads if the glyphs are even.',
      },
      {
        n: 4,
        label: 'Tab width',
        value: '2 spaces',
        kind: 'space',
        note: 'Two, not four. Config nests deeply and four spaces pushes the values off a narrow field.',
      },
      {
        n: 5,
        label: 'Rows',
        value: '12 default, resizable',
        kind: 'size',
        note: 'Deep enough to see a nested object without scrolling. Vertical resize stays enabled — this is the one field where users genuinely want more room.',
      },
      {
        n: 6,
        label: 'Validation delay',
        value: '400ms after typing stops',
        kind: 'motion',
        note: 'Every partial object is invalid on the way to valid. Erroring instantly trains people to ignore the message.',
      },
      {
        n: 7,
        label: 'Format action',
        value: 'Below, right-aligned',
        kind: 'space',
        note: 'Explicit, never automatic. Reformatting while typing moves the caret out from under the user.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Editor fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Idle border' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Gutter divider' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Border while unparseable' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Error message and failing gutter row' },
    { category: 'color', token: '--ds-warning-text', usedFor: 'Schema violations, which parsed fine' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Valid confirmation' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Gutter numbers — non-content' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field corners' },
    { category: 'typography', token: 'font-mono', value: '13px / 1.55', usedFor: 'Editor body and gutter' },
    { category: 'motion', token: 'debounce', value: '400ms', usedFor: 'Validation delay' },
  ],

  sizes: [
    { name: 'Compact', height: '6 rows', padding: '8px', type: '12px', use: 'A small payload inside a dialog or a table row expansion.' },
    { name: 'Default', height: '12 rows', padding: '10px', type: '13px', use: 'The default. Deep enough to see a nested object whole.' },
    { name: 'Tall', height: '20 rows', padding: '10px', type: '13px', use: 'A dedicated configuration page where the field is the screen.' },
    { name: 'Gutter', minWidth: '2.5rem', type: '11px', use: 'Right-aligned, unselectable, widening only past 999 lines.' },
    { name: 'Measure', maxWidth: '48rem', use: 'About 90 monospace characters. Wider and deeply nested values become hard to trace back to their key.' },
  ],

  do: [
    {
      title: 'Convert the parser offset into a line and column',
      why: '"Unexpected string at position 118" is a riddle. "Line 6, column 5: expected a comma" is an instruction, and it is a dozen lines of arithmetic.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          const before = text.slice(0, pos)
          <br />
          line = before.split('\\n').length
        </code>
      ),
    },
    {
      title: 'Make Tab indent, and Escape-then-Tab escape',
      why: 'A code field that does not indent is unusable. One that swallows Tab with no escape hatch is a keyboard trap and a WCAG 2.1.2 failure.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>Tab → indent</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>Esc then Tab → leave</span>
        </Row>
      ),
    },
    {
      title: 'Separate syntax errors from schema errors',
      why: 'Valid JSON can still be wrong. A user hunting for a missing brace when the real fault is an unknown key will never find it.',
      render: (
        <Stack gap="xs" className="text-caption">
          <span className="text-[var(--ds-danger-text)]">Could not be parsed — line 6</span>
          <span className="text-[var(--ds-warning-text)]">Parsed, but “replicas” must be 1–12</span>
        </Stack>
      ),
    },
    {
      title: 'Offer Format as an explicit action',
      why: 'People paste minified JSON constantly. One press to make it readable is the highest-value affordance on the component — and it must never fire on its own.',
      render: (
        <Button size="sm" variant="text" startIcon={<Wand2 size={13} />}>
          Format
        </Button>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not show the raw parser message',
      why: 'A byte offset is meaningless without counting characters by hand, and every engine words it differently. Translate it or say nothing.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          SyntaxError: Unexpected string in JSON at position 118
        </code>
      ),
    },
    {
      title: 'Do not validate on every keystroke',
      why: 'Every partial object is invalid on the way to being valid. An error that flashes at the first open brace teaches people to ignore the error line.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          {'{'} → “Unexpected end of input” → {'{"'} → “Unexpected end of input” → …
        </span>
      ),
    },
    {
      title: 'Do not reformat while the user types',
      why: 'The caret jumps out from under them mid-word and their indentation is replaced by yours. Formatting is a request, not a policy.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          onChange → JSON.stringify(parse(v), null, 2) → caret at end
        </span>
      ),
    },
    {
      title: 'Do not use it for a known, small shape',
      why: 'Nobody should hand-write JSON for four settings. Every character of syntax is a chance to fail at a task a form would have made impossible to get wrong.',
      render: (
        <code className="block whitespace-pre font-mono text-[11px] text-[var(--ds-danger-text)]">
          {'{\n  "notifyByEmail": true,\n  "theme": "dark"\n}'}
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '3.3.3', name: 'Error Suggestion', level: 'AA' },
    ],
    contrast: [
      'Every syntax colour owes 4.5:1 against the inset surface, in both themes. Themes ported from an editor almost always fail on strings and comments.',
      'The gutter is non-content and may use the disabled tone — but the failing line’s number is content and owes full contrast.',
      'The error state is carried by border, message and gutter together, so it survives greyscale and High Contrast Mode.',
      'Do not distinguish syntax errors from schema errors by colour alone; the wording carries it.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Inserts two spaces. Shift+Tab outdents.' },
      { keys: 'Esc then Tab', does: 'Leaves the field. Required — without it, Tab-to-indent is a keyboard trap.' },
      { keys: '⌘ / Ctrl + Enter', does: 'Submits, since Enter must insert a newline.' },
      { keys: '⌘ / Ctrl + ⇧ + F', does: 'Formats. Optional, but it matches every editor the audience already uses.' },
      { keys: '⌘ / Ctrl + A', does: 'Selects the document only. The gutter must never be included.' },
    ],
    aria: [
      { attr: 'aria-label', on: 'The field', note: 'Names what the document is: "Deployment configuration JSON", not "Editor".' },
      { attr: 'aria-invalid', on: 'The field', note: 'Set when parsing fails. Not set for schema violations, which are valid documents with wrong values.' },
      { attr: 'aria-errormessage', on: 'The field', note: 'Points at the message element, which must be rendered before it is referenced.' },
      { attr: 'role="status"', on: 'The validation message', note: 'Polite, and debounced. Announcing on every keystroke is unusable.' },
      { attr: 'aria-hidden', on: 'The gutter', note: 'Line numbers are visual scaffolding. The error message carries the line for anyone not looking at them.' },
      { attr: 'spellcheck="false"', on: 'The field', note: 'Not ARIA, but the same intent: red squiggles under every key name make the real error impossible to find.' },
    ],
    focus:
      'The focus halo surrounds the whole control including the gutter, so it never looks like two adjacent fields. After a failed submit, focus moves into the field and the caret goes to the reported error position — putting the user exactly where the problem is.',
    screenReader: [
      'Announce the outcome, not the document: "Valid JSON" or "Line 6, column 5: expected a comma".',
      'Never announce the code as it is typed. A live region on a code field reading punctuation is the worst possible experience.',
      'For read-only payloads, state the size up front — "Response body, 24 lines" — so the user knows what they are about to arrow through.',
    ],
    touch:
      'This is a desktop control. On a phone, an on-screen keyboard without braces, brackets and colons on the primary layer makes JSON editing genuinely hostile. Where you must ship it, provide a symbol bar above the keyboard with the six characters that matter, keep the field read-only where possible, and let the user copy the value out to edit elsewhere.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { JsonInput } from '@/ui/Input'

<Field label="Deployment config" description="Merged over the project defaults.">
  <JsonInput
    value={config}
    onChange={setConfig}
    rows={12}
    schema={deploymentSchema}       // schema errors are reported separately
  />
</Field>

// The component's real job: JSON.parse throws a BYTE OFFSET. A human needs
// a line and a column.
function parseWithPosition(text: string) {
  try {
    return { ok: true, value: JSON.parse(text) } as const
  } catch (e) {
    const raw = (e as Error).message
    const pos = Number(/position (\\d+)/.exec(raw)?.[1] ?? -1)
    if (pos < 0) return { ok: false, line: 1, column: 1, message: raw } as const
    const before = text.slice(0, pos)
    return {
      ok: false,
      line: before.split('\\n').length,
      column: pos - before.lastIndexOf('\\n'),
      message: raw.replace(/ in JSON at position \\d+.*/, ''),
    } as const
  }
}

// Tab indents. Escape-then-Tab escapes, or this is a keyboard trap.
function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (e.key === 'Escape') return setEscaping(true)
  if (e.key === 'Tab' && escaping) return           // let it bubble: leave
  if (e.key === 'Tab') {
    e.preventDefault()
    insertAtCaret('  ')
  }
  setEscaping(false)
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-json">
  <!-- Visual scaffolding only. The message carries the line for everyone else. -->
  <div class="ds-json__gutter" aria-hidden="true">
    <span>1</span>
    <span>2</span>
    <span class="is-error">3</span>
  </div>

  <textarea
    id="config"
    class="ds-json__body"
    aria-label="Deployment configuration JSON"
    aria-invalid="true"
    aria-errormessage="config-error"
    spellcheck="false"
    autocapitalize="off"
    autocorrect="off"
    rows="12"
  ></textarea>
</div>

<!-- Debounced. Announcing on every keystroke is unusable. -->
<p id="config-error" role="status" aria-live="polite" class="ds-json__error">
  Line 3, column 5: expected a comma
</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-json {
  display: flex;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
  overflow: hidden;
}

/* One ring around both halves, or it reads as two adjacent fields. */
.ds-json:focus-within {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
}

.ds-json__gutter {
  flex: 0 0 auto;
  min-inline-size: 2.5rem;
  padding: 10px 8px 10px 12px;
  border-inline-end: 1px solid var(--ds-border-subtle);
  text-align: end;
  /* Never selected, never copied. */
  user-select: none;
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.55;                 /* must match the body exactly */
  color: var(--ds-fg-disabled);
}

/* This line IS content — it is the location of the fault. */
.ds-json__gutter .is-error {
  color: var(--ds-danger-text);
  font-weight: 600;
}

.ds-json__body {
  flex: 1;
  min-inline-size: 0;
  padding: 10px;
  border: 0;
  background: none;
  resize: vertical;                  /* the one field where users want more room */
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.55;
  tab-size: 2;                       /* two, not four: config nests deeply */
}

.ds-json[data-invalid='true'] { border-color: var(--ds-danger-border); }`,
    },
    api: [
      {
        name: 'JsonInput',
        props: [
          { name: 'value', type: 'string', required: true, description: 'The raw text, not a parsed object. Round-tripping through an object destroys the user’s formatting.' },
          { name: 'onChange', type: '(v: string) => void', required: true, description: 'Fires with the raw text on every keystroke. Parse downstream, on a debounce.' },
          { name: 'rows', type: 'number', default: '12', description: 'Initial height. Vertical resize stays enabled.' },
          { name: 'schema', type: 'JSONSchema', description: 'Validates the parsed document. Schema errors are reported separately from syntax errors.' },
          { name: 'readOnly', type: 'boolean', default: 'false', description: 'Still focusable, selectable and copyable — a payload the user cannot select is one they will screenshot.' },
          { name: 'onValidChange', type: '(value: unknown | null) => void', description: 'Fires with the parsed document, or null while it is unparseable.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep the raw text as the source of truth. Parsing to an object and stringifying back destroys the user’s formatting and their comments-as-whitespace.',
      'Disable submit while the document is unparseable, and say why on the button’s tooltip. Submitting broken JSON to find out it is broken is a wasted round trip.',
      'Show the schema’s defaults as a placeholder or a "Reset to defaults" action. Most users want a small change to a known-good document, not a blank field.',
      'If you accept YAML too, detect which one was pasted and say so rather than erroring — the two are pasted interchangeably from documentation.',
      'Autosave drafts. A long config lost to a navigation is the most avoidable frustration this component has.',
    ],
    performance: [
      'Debounce parsing by about 400ms. Parsing a large document on every keystroke is measurable, and every intermediate state is invalid anyway.',
      'Do not tokenise for syntax colouring on every render. Memoise on the text, or a large payload re-highlights on each keypress.',
      'Cap the document size you will validate live. Past a few hundred kilobytes, move validation to submit and say so.',
      'Keep the gutter and body line-heights identical to the pixel. Any drift and the numbers desynchronise from the lines they label, which is worse than having no gutter.',
    ],
    mistakes: [
      'Showing the raw parser message with its byte offset.',
      'Validating on every keystroke, so an error flashes at the first open brace.',
      'Auto-formatting on type, which moves the caret and replaces the user’s indentation.',
      'Tab that leaves the field, making indentation impossible — or Tab with no escape hatch, which is a keyboard trap.',
      'A gutter that is selectable, so line numbers end up in the clipboard.',
      'Spellcheck left on, putting red squiggles under every key name.',
      'Line-height drift between gutter and body, desynchronising the numbers from the lines.',
      'Using it for a small known shape that should have been a form.',
    ],
    realWorld: [
      'The users of this component are a small, expert minority — and they are usually the ones configuring the thing everyone else depends on. The error message quality matters more than the visual polish.',
      'Most edits start from a paste. Format-on-demand and a schema-default starting document remove nearly all of the friction.',
      'Where a form and a JSON view both exist, keep them in sync and let users switch. The form is for the common case; the raw view is the escape hatch, and knowing it exists is what makes the form acceptable.',
      'On mobile, do not pretend this works. Make it read-only with a copy button and let people edit on a machine with a real keyboard.',
    ],
  },
})
