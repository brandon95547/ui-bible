import * as React from 'react'
import { AlertCircle, Check, FileText, Image as ImageIcon, RotateCcw, Upload, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Progress } from '@/ui/Feedback'
import { Field } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

interface UploadItem {
  id: string
  name: string
  size: string
  state: 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

const SEED: UploadItem[] = [
  { id: '1', name: 'deployment-log-4021.txt', size: '284 KB', state: 'done', progress: 100 },
  { id: '2', name: 'architecture.png', size: '1.2 MB', state: 'uploading', progress: 62 },
  { id: '3', name: 'trace.har', size: '48 MB', state: 'error', progress: 0, error: 'Larger than the 10 MB limit' },
]

function FileRow({ file, onRemove, onRetry }: { file: UploadItem; onRemove: () => void; onRetry: () => void }) {
  const Icon = file.name.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? ImageIcon : FileText
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2',
        file.state === 'error'
          ? 'border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/30'
          : 'border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
      )}
    >
      <span
        className={cn(
          'shrink-0',
          file.state === 'error' ? 'text-[var(--ds-danger-text)]' : 'text-[var(--ds-fg-muted)]',
        )}
      >
        <Icon size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-label text-[var(--ds-fg)]">{file.name}</span>
          <span className="shrink-0 text-caption tabular-nums text-[var(--ds-fg-muted)]">
            {file.size}
          </span>
        </span>
        {file.state === 'uploading' && <Progress value={file.progress} size="xs" />}
        {file.state === 'error' && (
          <span className="flex items-center gap-1.5 text-caption text-[var(--ds-danger-text)]">
            <AlertCircle size={12} /> {file.error}
          </span>
        )}
      </span>
      {file.state === 'done' && (
        <Check size={15} aria-label="Uploaded" className="shrink-0 text-[var(--ds-success-text)]" />
      )}
      {file.state === 'error' && (
        <IconButton size="sm" label={`Retry ${file.name}`} icon={<RotateCcw />} onClick={onRetry} />
      )}
      <IconButton size="sm" label={`Remove ${file.name}`} icon={<X />} onClick={onRemove} />
    </li>
  )
}

function Dropzone({
  files,
  setFiles,
  compact,
  accept = 'PNG, JPG or PDF',
  maxNote = 'up to 10 MB each',
}: {
  files: UploadItem[]
  setFiles: React.Dispatch<React.SetStateAction<UploadItem[]>>
  compact?: boolean
  accept?: string
  maxNote?: string
}) {
  const [over, setOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = () =>
    setFiles((f) => [
      ...f,
      {
        id: String(Date.now()),
        name: `screenshot-${f.length + 1}.png`,
        size: '640 KB',
        state: 'uploading',
        progress: 20,
      },
    ])

  return (
    <div className="w-full">
      {/* The drop zone is a label wrapping a real file input: click, keyboard
          and drag all work without a single event handler for the first two. */}
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          add()
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed text-center transition-colors',
          'focus-within:border-[var(--ds-accent)] focus-within:bg-[var(--ds-accent-subtle)]/40',
          compact ? 'px-4 py-4' : 'px-6 py-8',
          over
            ? 'border-[var(--ds-accent)] bg-[var(--ds-accent-subtle)]/60'
            : 'border-[var(--ds-border)] bg-[var(--ds-surface-inset)] hover:border-[var(--ds-border-strong)]',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only-ds"
          onChange={add}
          aria-describedby="upload-constraints"
        />
        <Upload size={compact ? 16 : 20} aria-hidden className="text-[var(--ds-fg-muted)]" />
        <span className="text-body-sm text-[var(--ds-fg-secondary)]">
          <span className="font-medium text-[var(--ds-accent-text)]">Choose files</span> or drag
          them here
        </span>
        {/* Constraints stated up front, not discovered by failing. */}
        <span id="upload-constraints" className="text-caption text-[var(--ds-fg-muted)]">
          {accept}, {maxNote}
        </span>
      </label>

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              onRemove={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
              onRetry={() =>
                setFiles((prev) =>
                  prev.map((x) => (x.id === f.id ? { ...x, state: 'uploading', progress: 10 } : x)),
                )
              }
            />
          ))}
        </ul>
      )}

      <p aria-live="polite" className="mt-2 text-caption text-[var(--ds-fg-muted)]">
        {files.filter((f) => f.state === 'done').length} of {files.length} uploaded
      </p>
    </div>
  )
}

function Playground() {
  const [files, setFiles] = React.useState<UploadItem[]>(SEED)
  const [compact, setCompact] = React.useState(false)
  const [variant, setVariant] = React.useState<'dropzone' | 'button'>('dropzone')

  return (
    <PreviewStage
      label="Playground"
      minHeight={320}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Variant">
            <KnobSelect
              value={variant}
              onChange={setVariant}
              options={['dropzone', 'button'] as const}
            />
          </Knob>
          <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
          <Button size="sm" variant="outlined" onClick={() => setFiles(SEED)}>
            Reset
          </Button>
        </div>
      }
      code={`<Field label="Attachments" description="PNG, JPG or PDF, up to 10 MB each.">
  <FileUpload
    multiple
    accept="image/png,image/jpeg,application/pdf"
    maxSize={10 * 1024 * 1024}
    variant="${variant}"
    files={files}
    onFilesChange={setFiles}
  />
</Field>`}
    >
      <div className="w-full max-w-lg">
        <Field label="Attachments" description="Attached to the deployment record.">
          {variant === 'dropzone' ? (
            <Dropzone files={files} setFiles={setFiles} compact={compact} />
          ) : (
            <Stack gap="sm">
              <Row gap="sm" align="center">
                <Button variant="outlined" startIcon={<Upload size={15} />}>
                  Choose files
                </Button>
                <span className="text-caption text-[var(--ds-fg-muted)]">
                  PNG, JPG or PDF, up to 10 MB each
                </span>
              </Row>
              <ul className="flex flex-col gap-2">
                {files.map((f) => (
                  <FileRow key={f.id} file={f} onRemove={() => {}} onRetry={() => {}} />
                ))}
              </ul>
            </Stack>
          )}
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'file-upload',
    title: 'File Upload',
    tagline:
      'Drop zone, file list, per-file progress and retry — plus the validation that has to happen before a byte is sent.',
    keywords: ['dropzone', 'file input', 'attachment', 'drag and drop', 'progress', 'multipart'],
  },

  overview: {
    purpose:
      'A file upload takes something off the user’s disk and puts it somewhere else. The visible part is small; almost all of the design is in the failure paths — a file that is too large, a type you do not accept, a connection that dropped at 80%. A component that only handles the happy path is a component that silently loses people’s work.',
    whenToUse: [
      'Attachments, avatars, imports, evidence, logs — anything the user already has as a file.',
      'Bulk imports where several files are selected at once and progress matters per file.',
      'Any flow where a failed upload must be retryable without redoing everything.',
    ],
    whenNotToUse: [
      {
        text: 'The content is text the user could paste.',
        instead: 'a Textarea or a JSON Input — pasting is faster than saving a file first',
        to: '#/json-input',
      },
      {
        text: 'You are showing files that already exist.',
        instead: 'a List or a Gallery',
        to: '#/list',
      },
      {
        text: 'The file is huge and the flow is technical.',
        instead: 'a CLI or a signed upload URL — a browser is a poor place for a 4 GB transfer',
        to: '#/code-snippet',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Validate before uploading, not after.</strong> Size and type are knowable the
          instant the file is selected. Sending 48 MB across a mobile connection to be told the
          limit is 10 MB is a minute of the user’s life and their data allowance spent on an error
          you could have shown immediately.
        </p>
        <p>
          The drop zone must be a <code>&lt;label&gt;</code> wrapping a real{' '}
          <code>&lt;input type="file"&gt;</code>. Click, keyboard and the platform picker all work
          with no JavaScript at all, and drag-and-drop becomes an enhancement on top rather than
          the only way in. A div with a click handler is unreachable by keyboard and invisible to
          assistive tech.
        </p>
        <p>
          <strong>Per-file progress and per-file retry.</strong> One aggregate bar for five files
          hides which one failed, and a single "Retry" that restarts all five re-uploads four
          files that were already fine.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'states',
        title: 'The three file states',
        description:
          'Uploading with progress, done with a check, failed with a reason and a retry. Each row owns its own state — an aggregate bar hides which file went wrong.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <ul className="flex w-full max-w-lg flex-col gap-2">
              {SEED.map((f) => (
                <FileRow key={f.id} file={f} onRemove={() => {}} onRetry={() => {}} />
              ))}
            </ul>
          </PreviewStage>
        ),
      },
      {
        id: 'constraints',
        title: 'State the constraints up front',
        description:
          'Accepted types and the size limit belong in the zone, before selection. Discovering them through a rejection is the most common way this component wastes people’s time.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Stated" tone="good">
                <ConstraintDemo accept="PNG, JPG or PDF" maxNote="up to 10 MB each" />
              </Cell>
              <Cell label="Hidden" tone="bad">
                <ConstraintDemo accept="Upload a file" maxNote="" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'variants',
        title: 'Drop zone or button',
        description:
          'A drop zone earns its space when uploading is the main task. Everywhere else — a comment box, a settings row — a plain button plus a file list is less visual weight for the same function.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Drop zone" sub="Uploading is the task" tone="good">
                <ConstraintDemo accept="PNG, JPG or PDF" maxNote="up to 10 MB each" />
              </Cell>
              <Cell label="Button" sub="Uploading is incidental" tone="good">
                <Row gap="sm" align="center">
                  <Button size="sm" variant="outlined" startIcon={<Upload size={14} />}>
                    Attach
                  </Button>
                  <span className="text-caption text-[var(--ds-fg-muted)]">PNG or PDF, 10 MB</span>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'rejection',
        title: 'Rejected files stay visible',
        description:
          'A file that fails validation must appear in the list with its reason. Silently dropping it means the user thinks it uploaded.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <ul className="flex w-full max-w-lg flex-col gap-2">
              <FileRow
                file={{
                  id: 'a',
                  name: 'trace.har',
                  size: '48 MB',
                  state: 'error',
                  progress: 0,
                  error: 'Larger than the 10 MB limit',
                }}
                onRemove={() => {}}
                onRetry={() => {}}
              />
              <FileRow
                file={{
                  id: 'b',
                  name: 'notes.docx',
                  size: '92 KB',
                  state: 'error',
                  progress: 0,
                  error: 'Only PNG, JPG and PDF are accepted',
                }}
                onRemove={() => {}}
                onRetry={() => {}}
              />
            </ul>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Idle',
        render: <div className="w-56"><ConstraintDemo accept="PNG or PDF" maxNote="10 MB" compact /></div>,
      },
      {
        label: 'Drag over',
        render: (
          <span className="flex h-16 w-56 items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--ds-accent)] bg-[var(--ds-accent-subtle)]/60 text-caption text-[var(--ds-accent-text)]">
            Drop to upload
          </span>
        ),
      },
      {
        label: 'Uploading',
        render: <div className="w-56"><FileRow file={SEED[1]} onRemove={() => {}} onRetry={() => {}} /></div>,
      },
      {
        label: 'Done',
        render: <div className="w-56"><FileRow file={SEED[0]} onRemove={() => {}} onRetry={() => {}} /></div>,
      },
      {
        label: 'Failed',
        render: <div className="w-56"><FileRow file={SEED[2]} onRemove={() => {}} onRetry={() => {}} /></div>,
      },
      { label: 'Button', render: <Button size="sm" variant="outlined" startIcon={<Upload size={14} />}>Choose files</Button> },
      { label: 'Progress', render: <div className="w-40"><Progress value={62} size="xs" /></div> },
      {
        label: 'Count',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">1 of 3 uploaded</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <ConstraintDemo accept="PNG, JPG or PDF" maxNote="up to 10 MB each" withList />
      </div>
    ),
    caption:
      'A dashed zone that is really a label around a file input, followed by one row per file carrying its own state and its own controls.',
    parts: [
      {
        n: 1,
        label: 'Zone height',
        value: '96px (64px compact)',
        kind: 'size',
        note: 'Big enough to be an obvious drop target, small enough that it does not dominate a form where uploading is one field among several.',
      },
      {
        n: 2,
        label: 'Border',
        value: '2px dashed',
        kind: 'shape',
        note: 'Dashed is the near-universal signal for a drop target. A solid border reads as a container, and users stop trying to drag onto it.',
      },
      {
        n: 3,
        label: 'Constraints line',
        value: '12px, muted, always visible',
        kind: 'type',
        note: 'Accepted types and the size limit. It is the difference between a rejection the user could have avoided and one they could not.',
      },
      {
        n: 4,
        label: 'Drag-over state',
        value: 'Accent border + tinted fill',
        kind: 'color',
        note: 'Two changes at once. A border colour alone is easy to miss with a file hovering over the cursor.',
      },
      {
        n: 5,
        label: 'File row',
        value: '48px, icon + name + size',
        kind: 'size',
        note: 'The name truncates from the end but keeps the extension visible — the extension is what users check.',
      },
      {
        n: 6,
        label: 'Per-file progress',
        value: '2px bar inside the row',
        kind: 'size',
        note: 'Per file, never aggregate. One bar for five files hides which one is stuck.',
      },
      {
        n: 7,
        label: 'Row actions',
        value: 'Retry on error, remove always',
        kind: 'space',
        note: 'Retry re-sends one file. A single global retry re-uploads the four that already succeeded.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Idle zone fill' },
    { category: 'color', token: '--ds-border', usedFor: 'Idle dashed border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Drag-over border and the “Choose files” text' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Drag-over fill' },
    { category: 'color', token: '--ds-danger-border', usedFor: 'Failed file row' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'Rejection reason' },
    { category: 'color', token: '--ds-success-text', usedFor: 'Completed check' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'File size, constraints, file-type icon' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Row padding and gap to the list' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Zone corners' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'File row corners' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Drag-over transition' },
  ],

  sizes: [
    { name: 'Compact zone', height: '64px', padding: '16px', use: 'A field among others, where uploading is one step of many.' },
    { name: 'Default zone', height: '96px', padding: '24px', use: 'The default. Uploading is a main action on the screen.' },
    { name: 'Full zone', height: '160px', padding: '32px', use: 'An import screen where the upload is the entire task.' },
    { name: 'File row', height: '48px', padding: '8px 12px', gap: '12px', use: '64px when a thumbnail preview is shown.' },
    { name: 'Progress bar', height: '2px', use: 'Inside the row, under the filename. Per file, never aggregate.' },
    { name: 'Thumbnail', height: '32px', minWidth: '32px', use: 'Images only, generated client-side from an object URL — revoke it on unmount.' },
  ],

  do: [
    {
      title: 'Validate before a byte is sent',
      why: 'Size and type are known at selection. Uploading 48 MB to be told the limit is 10 MB spends a minute of the user’s time and their data on an avoidable error.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          if (file.size &gt; maxSize) reject(file, 'Larger than 10 MB')
        </code>
      ),
    },
    {
      title: 'Make the zone a label around a real file input',
      why: 'Click, keyboard and the platform picker all work with no JavaScript. Drag-and-drop is then an enhancement rather than the only way in.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;label&gt;&lt;input type="file" class="sr-only" /&gt;…&lt;/label&gt;
        </code>
      ),
    },
    {
      title: 'Give every file its own progress and retry',
      why: 'One aggregate bar hides which file is stuck, and a global retry re-uploads the four that already succeeded.',
      render: (
        <div className="w-full max-w-xs">
          <FileRow file={SEED[2]} onRemove={() => {}} onRetry={() => {}} />
        </div>
      ),
    },
    {
      title: 'Keep rejected files in the list',
      why: 'A file that silently disappears is a file the user believes uploaded. The row with its reason is the only way they find out otherwise.',
      render: (
        <div className="w-full max-w-xs">
          <FileRow
            file={{ id: 'x', name: 'notes.docx', size: '92 KB', state: 'error', progress: 0, error: 'Only PNG, JPG and PDF are accepted' }}
            onRemove={() => {}}
            onRetry={() => {}}
          />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not build the zone from a div',
      why: 'A div with a click handler is unreachable by keyboard and announces as nothing. The file input is the control; everything else is decoration around it.',
      render: (
        <span className="flex h-14 w-56 items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--ds-danger-border)] text-caption text-[var(--ds-danger-text)]">
          &lt;div onClick={'{'}pick{'}'}&gt;
        </span>
      ),
    },
    {
      title: 'Do not hide the constraints until failure',
      why: 'The user picks a file, waits, and is told it was never going to work. Both facts were available before they opened the picker.',
      render: (
        <span className="flex h-14 w-56 items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] text-caption text-[var(--ds-fg-muted)]">
          Drop files here
        </span>
      ),
    },
    {
      title: 'Do not use one aggregate progress bar',
      why: 'Five files behind one bar means a single stalled upload looks like the whole batch is slow, and there is nothing to retry individually.',
      render: (
        <div className="w-full max-w-xs">
          <Progress value={44} size="sm" label="Uploading 5 files" />
        </div>
      ),
    },
    {
      title: 'Do not rely on the accept attribute for validation',
      why: 'It filters the picker and nothing else. Drag-and-drop bypasses it entirely, and so does anyone who switches the picker to “All files”.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          accept="image/png" → drag a .exe → accepted
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '3.3.1', name: 'Error Identification', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'The dashed border owes 3:1 — it is the only thing defining the drop target.',
      'The drag-over state changes both border and fill, so it is perceivable without relying on a colour shift alone.',
      'Rejection reasons owe 4.5:1 and must name the cause, not just colour the row red.',
      'Progress bars owe 3:1 against the row background; at 2px tall a low-contrast fill is invisible.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the file input through the label, then each file row’s controls.' },
      { keys: 'Enter / Space', does: 'Opens the platform file picker. This is why the input must be real.' },
      { keys: 'Tab', does: 'Within a row, reaches Retry then Remove. Both need names that include the filename.' },
      { keys: 'Esc', does: 'Cancels an in-flight upload when the row has a cancel control.' },
    ],
    aria: [
      { attr: '<label>', on: 'The drop zone', note: 'Wrapping a real input[type=file]. This is the whole accessibility story — a div cannot be made equivalent.' },
      { attr: 'aria-describedby', on: 'The file input', note: 'Points at the constraints line, so accepted types and the size limit are read before the picker opens.' },
      { attr: 'aria-live="polite"', on: 'The upload count', note: '"2 of 3 uploaded". Progress bars alone announce nothing useful.' },
      { attr: 'role="alert"', on: 'A rejection', note: 'Assertive, because the user needs to know immediately that a file they chose is not going.' },
      { attr: 'aria-label', on: 'Row controls', note: '"Remove architecture.png", not "Remove". A list of five files otherwise has five identical buttons.' },
      { attr: 'aria-busy', on: 'A row that is uploading', note: 'So the state is exposed rather than only animated.' },
    ],
    focus:
      'Removing a file moves focus to the next row, or back to the drop zone if it was the last. After a rejection, focus stays where it was and the alert announces — yanking focus to an error row while the user is still selecting files is disorienting.',
    screenReader: [
      'Announce each rejection with its reason: "trace.har rejected, larger than the 10 MB limit".',
      'Announce completion per file rather than a percentage stream: "architecture.png uploaded".',
      'Do not announce progress continuously. A percentage read every frame is unusable; announce at start, at completion, and on failure.',
    ],
    touch:
      'Drag-and-drop does not exist on touch, so the picker path must be complete on its own — WCAG 2.5.7 requires exactly this. Tapping the zone should open the platform sheet, which on mobile offers camera and photo library alongside files. Row controls need 44px targets, which usually means a 56px row rather than 48px.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { FileUpload } from '@/ui/Input'

<Field label="Attachments" description="Attached to the deployment record.">
  <FileUpload
    multiple
    accept="image/png,image/jpeg,application/pdf"
    maxSize={10 * 1024 * 1024}
    files={files}
    onFilesChange={setFiles}
  />
</Field>

// Validate at selection. Both facts are known before a byte moves.
function validate(file: File) {
  if (file.size > MAX) return \`Larger than the \${format(MAX)} limit\`
  // accept= only filters the picker: drag-and-drop bypasses it entirely.
  if (!ACCEPTED.includes(file.type)) return 'Only PNG, JPG and PDF are accepted'
  return null
}

// Per-file upload, so one failure does not restart the others.
async function upload(item: Upload) {
  const controller = new AbortController()
  setState(item.id, { state: 'uploading', controller })
  try {
    await put(item.file, {
      signal: controller.signal,
      onProgress: (p) => setState(item.id, { progress: p }),
    })
    setState(item.id, { state: 'done', progress: 100 })
  } catch (e) {
    if (e.name === 'AbortError') return
    setState(item.id, { state: 'error', error: 'Upload failed' })
  }
}

// Object URLs leak until revoked. One per preview, released on unmount.
React.useEffect(() => {
  const url = URL.createObjectURL(file)
  setPreview(url)
  return () => URL.revokeObjectURL(url)
}, [file])`,
    },
    html: {
      lang: 'html',
      code: `<!-- A label around a real input. Click, keyboard and the platform picker
     all work with zero JavaScript; drag-and-drop is the enhancement. -->
<label class="ds-dropzone">
  <input
    type="file"
    multiple
    accept="image/png,image/jpeg,application/pdf"
    class="sr-only"
    aria-describedby="upload-constraints"
  />
  <svg aria-hidden="true">…</svg>
  <span><strong>Choose files</strong> or drag them here</span>
  <span id="upload-constraints">PNG, JPG or PDF, up to 10 MB each</span>
</label>

<ul class="ds-filelist">
  <li aria-busy="true">
    <svg aria-hidden="true">…</svg>
    <span>architecture.png</span>
    <span>1.2 MB</span>
    <progress value="62" max="100">62%</progress>
    <button type="button" aria-label="Cancel architecture.png">…</button>
  </li>
</ul>

<p role="status" aria-live="polite">2 of 3 uploaded</p>
<p role="alert">trace.har rejected: larger than the 10 MB limit</p>`,
    },
    css: {
      lang: 'css',
      code: `.ds-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  /* Dashed is the near-universal drop-target signal. A solid border reads
     as a container and people stop trying to drag onto it. */
  border: 2px dashed var(--ds-border);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-inset);
  cursor: pointer;
  text-align: center;
}

/* The input is visually hidden, never display:none — that would remove it
   from the tab order and from the accessibility tree. */
.ds-dropzone input[type='file'] {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  clip-path: inset(50%);
  overflow: hidden;
}

/* The ring belongs to the zone, since the input itself is invisible. */
.ds-dropzone:focus-within {
  border-color: var(--ds-accent);
  background: color-mix(in oklab, var(--ds-accent-subtle) 40%, transparent);
}

/* Two changes at once: a border shift alone is easy to miss with a file
   hovering under the cursor. */
.ds-dropzone[data-over='true'] {
  border-color: var(--ds-accent);
  background: var(--ds-accent-subtle);
}

.ds-filelist li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-block-size: 48px;
  padding-inline: 12px;
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-md);
}
.ds-filelist li[data-state='error'] { border-color: var(--ds-danger-border); }

/* Truncate from the middle: the extension is what users check. */
.ds-filelist__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (pointer: coarse) {
  .ds-filelist li { min-block-size: 56px; }   /* 44px controls fit */
}`,
    },
    api: [
      {
        name: 'FileUpload',
        props: [
          { name: 'files', type: 'UploadItem[]', required: true, description: 'Controlled list, including rejected files. A rejected file that is not in the list is one the user thinks uploaded.' },
          { name: 'onFilesChange', type: '(files: UploadItem[]) => void', required: true, description: 'Fires on selection, drop, removal and every state transition.' },
          { name: 'accept', type: 'string', description: 'Filters the picker only. Always validate the type again after selection — drag-and-drop bypasses it.' },
          { name: 'maxSize', type: 'number', description: 'Bytes. Checked before upload, and stated in the zone.' },
          { name: 'multiple', type: 'boolean', default: 'false', description: 'Single-file uploads should replace rather than append, and say so.' },
          { name: 'variant', type: "'dropzone' | 'button'", default: "'dropzone'", description: 'Button where uploading is incidental to the surface.' },
          { name: 'onRetry', type: '(id: string) => void', description: 'Per file. A global retry re-uploads the ones that already succeeded.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show an image thumbnail from an object URL as soon as a file is selected. It confirms the right file was chosen before the upload finishes — and revoke the URL on unmount.',
      'Truncate long filenames from the middle so the extension stays visible. That is the part users check.',
      'Upload immediately on selection rather than waiting for form submit. By the time the user finishes the rest of the form, the file is already there.',
      'For single-file fields, say the new file replaces the old one. Users expect append and are surprised by silent replacement.',
      'Accept a paste of an image from the clipboard where it makes sense. Screenshots are the most common attachment in any support or bug flow.',
    ],
    performance: [
      'Upload in parallel with a cap of three or four. More than that and each file gets a slice of the same bandwidth, so everything finishes slower.',
      'Use resumable or chunked uploads past about 50 MB. A single failed request at 90% is otherwise a complete restart.',
      'Downscale images client-side with a canvas before uploading where quality permits. A 12 MP phone photo for a 200px avatar is entirely wasted transfer.',
      'Revoke every object URL. A gallery of previews that never revokes leaks the full file into memory for the life of the page.',
    ],
    mistakes: [
      'A div-based drop zone, unreachable by keyboard and invisible to assistive tech.',
      'Validating after the upload, wasting the user’s time and data on an avoidable rejection.',
      'Relying on accept= as validation, which drag-and-drop bypasses entirely.',
      'One aggregate progress bar for a batch, hiding which file is stuck.',
      'A global retry that re-uploads files that already succeeded.',
      'Rejected files silently dropped, so the user believes they uploaded.',
      'Row controls named "Remove" with no filename, giving five identical buttons.',
      'Leaked object URLs holding every preview in memory.',
    ],
    realWorld: [
      'Drag-and-drop is used far less than its visual prominence suggests. The click path is the majority path on desktop and the only path on touch — polish that first.',
      'Users choose the wrong file constantly. A thumbnail or a clear filename in the list catches it before submit, which is much cheaper than catching it afterwards.',
      'Mobile uploads mostly come straight from the camera. Make sure the accept attribute does not prevent the camera option appearing in the platform sheet.',
      'Size limits should be generous and clearly stated. A 2 MB limit in a world of 8 MP phone photos generates support tickets rather than smaller files.',
    ],
  },
})

function ConstraintDemo({
  accept,
  maxNote,
  compact,
  withList,
}: {
  accept: string
  maxNote: string
  compact?: boolean
  withList?: boolean
}) {
  const [files, setFiles] = React.useState<UploadItem[]>(withList ? SEED : [])
  return (
    <Dropzone
      files={files}
      setFiles={setFiles}
      compact={compact}
      accept={accept}
      maxNote={maxNote}
    />
  )
}
