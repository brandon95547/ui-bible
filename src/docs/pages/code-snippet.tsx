import * as React from 'react'
import { Check, Copy, Eye, EyeOff, Terminal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCopy } from '@/lib/hooks'
import { IconButton } from '@/ui/Button'
import { Tooltip } from '@/ui/Display'
import { CodeBlock, Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   The copy affordance is the component. Everything else on this page is a
   container for it — a code block, an API key field, a share link.
   ------------------------------------------------------------------------ */
function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const { copied, copy } = useCopy()
  return (
    <Tooltip content={copied ? 'Copied' : label}>
      <button
        type="button"
        onClick={() => copy(value)}
        // The accessible name carries the result, because a screen-reader user
        // gets no green tick. aria-live on the label is what tells them it worked.
        aria-label={copied ? `${label}: copied` : label}
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-md)] transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
          copied
            ? 'text-[var(--ds-success-text)]'
            : 'text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </Tooltip>
  )
}

function InlineSnippet({ children }: { children: string }) {
  return (
    <code className="rounded-[var(--radius-xs)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-1.5 py-0.5 font-mono text-[0.9em] text-[var(--ds-fg)]">
      {children}
    </code>
  )
}

function SingleLine({
  value,
  secret,
  prefix,
}: {
  value: string
  secret?: boolean
  prefix?: string
}) {
  const [revealed, setRevealed] = React.useState(!secret)
  const shown = revealed ? value : '•'.repeat(Math.min(value.length, 36))

  return (
    <div className="flex w-full items-center gap-1 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] py-1 pl-2.5 pr-1">
      {prefix && (
        <span aria-hidden className="shrink-0 select-none font-mono text-[13px] text-[var(--ds-fg-disabled)]">
          {prefix}
        </span>
      )}
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-[var(--ds-fg)]">
        {shown}
      </code>
      {secret && (
        <IconButton
          size="sm"
          label={revealed ? 'Hide value' : 'Reveal value'}
          icon={revealed ? <EyeOff /> : <Eye />}
          onClick={() => setRevealed((r) => !r)}
        />
      )}
      {/* Copy always copies the real value, revealed or not. Forcing a reveal
          before copying leaks the secret to whoever is behind the user. */}
      <CopyButton value={value} label="Copy value" />
    </div>
  )
}

const SAMPLE = `import { createClient } from '@acme/sdk'

const client = createClient({
  apiKey: process.env.ACME_API_KEY,
  region: 'eu-west-2',
})

const deployment = await client.deployments.create({
  project: 'api-gateway',
  ref: 'main',
})`

function Playground() {
  const [filename, setFilename] = React.useState(false)
  const [lines, setLines] = React.useState(true)
  const [lang, setLang] = React.useState<'tsx' | 'bash' | 'json'>('tsx')

  const code =
    lang === 'bash'
      ? 'npx @acme/cli deploy --project api-gateway --ref main'
      : lang === 'json'
        ? '{\n  "project": "api-gateway",\n  "ref": "main",\n  "region": "eu-west-2"\n}'
        : SAMPLE

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Language">
            <KnobSelect value={lang} onChange={setLang} options={['tsx', 'bash', 'json'] as const} />
          </Knob>
          <KnobToggle checked={lines} onChange={setLines} label="Line numbers" />
          <KnobToggle checked={filename} onChange={setFilename} label="Filename" />
        </div>
      }
      code={`<CodeSnippet
  lang="${lang}"
  showLineNumbers={${lines}}${filename ? `\n  filename="${lang === 'bash' ? 'deploy.sh' : lang === 'json' ? 'deploy.json' : 'client.ts'}"` : ''}
>{code}</CodeSnippet>`}
    >
      <div className="w-full">
        <CodeBlock
          code={code}
          lang={lang}
          showLineNumbers={lines}
          filename={
            filename
              ? lang === 'bash'
                ? 'deploy.sh'
                : lang === 'json'
                  ? 'deploy.json'
                  : 'client.ts'
              : undefined
          }
        />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'code-snippet',
    title: 'Code Snippet',
    tagline:
      'Read-only code with a copy affordance that confirms it copied. Inline, single-line and multi-line — plus the copy button everywhere else a value has to be transcribed.',
    keywords: ['copy to clipboard', 'clipboard', 'code block', 'terminal', 'api key', 'syntax highlighting'],
  },

  overview: {
    purpose:
      'A code snippet presents a value the user is meant to take away rather than read for meaning — a command, a key, an ID, a config block. Its job is to be unambiguous about what the characters are and to remove transcription entirely. The copy button is not an accessory to it; the copy button is the component, and the code block is the largest of the several containers it lives in.',
    whenToUse: [
      'Any command, snippet or config the user is expected to run or paste.',
      'API keys, connection strings, webhook URLs, support reference IDs.',
      'Inline identifiers in prose — a flag, a file path, a property name.',
      'Anywhere a user would otherwise select text by hand and risk clipping a character.',
    ],
    whenNotToUse: [
      {
        text: 'The value is editable.',
        instead: 'a JSON Input or a Text Field',
        to: '#/json-input',
      },
      {
        text: 'It is prose that merely mentions a term.',
        instead: 'ordinary emphasis — monospace is a promise of literal characters',
        to: '#/typography',
      },
      {
        text: 'The block is long enough to need scrolling and search.',
        instead: 'link to the file or the docs; a 300-line block in a panel helps nobody',
        to: '#/link',
      },
      {
        text: 'You need to show a diff or a stack trace with interaction.',
        instead: 'a purpose-built viewer — this component is read-and-copy only',
        to: '#/data-table',
      },
    ],
    reasoning: (
      <>
        <p>
          The reason monospace is non-negotiable here is <strong>character
          disambiguation</strong>. In a proportional face, <code>l</code>, <code>1</code> and{' '}
          <code>I</code> collapse, as do <code>0</code> and <code>O</code>. A user transcribing an
          API key from a proportional font will eventually get it wrong, and the error surfaces as
          a 401 with no clue attached.
        </p>
        <p>
          Copy must <strong>confirm</strong>. A button that silently succeeds leaves the user
          pressing it again, and after the third press they paste to check. The confirmation is
          two things at once: a visual swap to a tick for about 1.6 seconds, and an{' '}
          <code>aria-live</code> announcement — because a screen-reader user gets nothing at all
          from the green tick.
        </p>
        <p>
          The most common failure is copying <strong>what was rendered rather than what was
          meant</strong>. Line numbers, the <code>$</code> prompt, and the syntax-highlighting
          markup must never end up on the clipboard. Copy from the source string, never from the
          DOM.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'three-sizes',
        title: 'The three containers',
        description:
          'Inline for a term in a sentence, single-line for a value to take away, multi-line for something to run. All three copy the exact characters and nothing else.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full">
              <p className="text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
                Set <InlineSnippet>ACME_API_KEY</InlineSnippet> in your environment, then run{' '}
                <InlineSnippet>acme deploy</InlineSnippet> from the project root.
              </p>
              <SingleLine value="npx @acme/cli deploy --project api-gateway" prefix="$" />
              <CodeBlock
                code={`curl -X POST https://api.acme.dev/v1/deployments \\
  -H "Authorization: Bearer $ACME_API_KEY" \\
  -d '{"project":"api-gateway","ref":"main"}'`}
                lang="bash"
              />
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'secret',
        title: 'Secrets',
        description:
          'Masked by default, revealable, and copyable without revealing. Forcing a reveal before copy shows the key to everyone behind the user for no security benefit at all.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full">
              <span className="text-label-sm text-[var(--ds-fg-secondary)]">Live API key</span>
              <SingleLine value="acme_live_R8vTx2mK9pQ4wL6zN3jH7bF" secret />
              <p className="text-caption text-[var(--ds-fg-muted)]">
                Shown once at creation. Copy works while masked.
              </p>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'prompt',
        title: 'The prompt must not be copied',
        description:
          'A leading $ tells the reader this is a shell command. Pasting it into a shell produces "command not found: $". Render it as an aria-hidden, unselectable prefix.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="18rem">
              <Cell label="Right" sub="Prefix is decoration" tone="good">
                <SingleLine value="npm install @acme/sdk" prefix="$" />
              </Cell>
              <Cell label="Wrong" sub="$ is part of the string" tone="bad">
                <div className="flex w-full items-center gap-1 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] py-1 pl-2.5 pr-1">
                  <code className="min-w-0 flex-1 font-mono text-[13px] text-[var(--ds-fg)]">
                    $ npm install @acme/sdk
                  </code>
                  <CopyButton value="$ npm install @acme/sdk" />
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'copy-anywhere',
        title: 'Copy outside a code block',
        description:
          'The same affordance, the same confirmation. A support reference, a share link, a resource ID — all values a user would otherwise transcribe.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full">
              {[
                ['Support reference', 'ERR-4021-A7F3'],
                ['Share link', 'https://acme.dev/d/9fJk2Lm'],
                ['Deployment ID', 'dpl_7Hq3nR8vTx'],
              ].map(([label, value]) => (
                <Row key={label} gap="sm" align="center" className="w-full">
                  <span className="w-36 shrink-0 text-caption text-[var(--ds-fg-muted)]">
                    {label}
                  </span>
                  <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-[var(--ds-fg-secondary)]">
                    {value}
                  </code>
                  <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Inline', render: <InlineSnippet>--dry-run</InlineSnippet> },
      { label: 'Idle copy', render: <CopyButton value="idle" /> },
      {
        label: 'Copied',
        render: (
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] text-[var(--ds-success-text)]">
            <Check size={14} />
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] outline-2 outline-offset-1 outline-[var(--ds-focus-ring)]">
            <Copy size={14} />
          </span>
        ),
      },
      { label: 'Single line', render: <div className="w-56"><SingleLine value="acme deploy" prefix="$" /></div> },
      { label: 'Masked', render: <div className="w-56"><SingleLine value="acme_live_R8vTx2mK" secret /></div> },
      {
        label: 'Terminal',
        render: (
          <span className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] px-2 py-1 font-mono text-[12px] text-[var(--ds-fg-secondary)]">
            <Terminal size={12} /> bash
          </span>
        ),
      },
      { label: 'Overflowing', render: <div className="w-40"><SingleLine value="npx @acme/cli deploy --project api-gateway --ref main" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <CodeBlock code={`const client = createClient({\n  region: 'eu-west-2',\n})`} lang="tsx" showLineNumbers />
      </div>
    ),
    caption:
      'A multi-line block: language tag, line numbers, syntax colours, and the copy control in the corner nearest the reader’s exit.',
    parts: [
      {
        n: 1,
        label: 'Type',
        value: '13px / 1.55 monospace',
        kind: 'type',
        note: 'One step below body copy — monospace runs optically larger at the same nominal size. The 1.55 leading is looser than prose because code is scanned vertically as columns.',
      },
      {
        n: 2,
        label: 'Surface',
        value: '--ds-surface-inset',
        kind: 'color',
        note: 'A well, not a raised card. Code is content set into the page, and the inset reads as "this is a different kind of text" without needing a heavy border.',
      },
      {
        n: 3,
        label: 'Padding',
        value: '14px, 12px with numbers',
        kind: 'space',
        note: 'Reduced on the left when line numbers are present, since the gutter already provides the inset.',
      },
      {
        n: 4,
        label: 'Line numbers',
        value: '11px, disabled tone, user-select: none',
        kind: 'type',
        note: 'Deliberately unselectable. Numbers landing on the clipboard is the single most common bug in this component.',
      },
      {
        n: 5,
        label: 'Copy control',
        value: '28px, top-right, 8px inset',
        kind: 'size',
        note: 'Top-right because that is where the eye leaves a left-aligned block. Always visible on touch; may fade in on hover on fine pointers, never on touch where there is no hover.',
      },
      {
        n: 6,
        label: 'Confirmation',
        value: 'Tick for 1.6s + aria-live',
        kind: 'motion',
        note: 'Long enough to be noticed after the eye returns from the paste target, short enough that a second copy still reads as a new event.',
      },
      {
        n: 7,
        label: 'Max height',
        value: '24rem, then scrolls',
        kind: 'size',
        note: 'About 24 lines. Past that the block dominates the page and the reader has lost the context it was illustrating.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Block and inline background' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Block edge and inline outline' },
    { category: 'color', token: '--ds-fg', usedFor: 'Default code text' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Comments, and the idle copy glyph' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Line-number gutter and the shell prompt — both non-content' },
    { category: 'color', token: '--ds-success-text', usedFor: 'The copied confirmation' },
    { category: 'color', token: '--ds-accent-text', usedFor: 'Keywords in the highlight theme' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Block padding' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Copy-control inset from the corner' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Block corners' },
    { category: 'radius', token: '--radius-xs', value: '4px', usedFor: 'Inline snippet corners' },
    { category: 'typography', token: 'font-mono', value: 'JetBrains Mono', usedFor: 'All code, at every size' },
    { category: 'motion', token: 'confirm hold', value: '1600ms', usedFor: 'How long the tick stays' },
  ],

  sizes: [
    { name: 'Inline', height: 'Line height', padding: '2px 6px', radius: '4px', type: '0.9em', use: 'Inside a sentence. Sized relative to the surrounding text so it never breaks the line rhythm.' },
    { name: 'Single line', height: '36px', padding: '0 4px 0 10px', radius: '8px', type: '13px', use: 'A value to take away: a command, a key, an ID. Scrolls horizontally rather than wrapping.' },
    { name: 'Multi-line', height: 'Max 24rem, then scrolls', padding: '14px', radius: '12px', type: '13px', use: 'Something to run or paste. About 24 lines before the block starts dominating the page.' },
    { name: 'Copy control', height: '28px', touch: '44px on coarse pointers', use: 'Fixed size at every container size — it is a target, not a decoration.' },
    { name: 'Gutter', minWidth: '2.5rem', type: '11px', use: 'Right-aligned numbers, unselectable, never part of the copied string.' },
  ],

  do: [
    {
      title: 'Copy from the source, never from the DOM',
      why: 'Reading innerText drags in line numbers, the shell prompt, and whatever the highlighter injected. The user pastes something that will not run and has no idea why.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          copy(props.code)
          <br />
          <span className="text-[var(--ds-danger-text)]">✗ copy(el.innerText)</span>
        </code>
      ),
    },
    {
      title: 'Confirm in two channels',
      why: 'The tick is for the eye; the aria-live announcement is for everyone else. A silent success is indistinguishable from a failure, and users press again until they paste to check.',
      render: (
        <Row gap="sm" align="center">
          <span className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] text-[var(--ds-success-text)]">
            <Check size={14} />
          </span>
          <code className="font-mono text-[11px] text-[var(--ds-fg-muted)]">
            role="status" → “Copied”
          </code>
        </Row>
      ),
    },
    {
      title: 'Let secrets be copied while masked',
      why: 'Revealing a key to copy it shows it to the room and to any screen share. The clipboard does not need the pixels.',
      render: <div className="w-full max-w-xs"><SingleLine value="acme_live_R8vTx2mK9pQ4" secret /></div>,
    },
    {
      title: 'Keep the copy control visible on touch',
      why: 'A control that appears on hover does not exist on a phone, which is exactly where selecting text by hand is hardest.',
      render: <div className="w-full max-w-xs"><SingleLine value="dpl_7Hq3nR8vTx" /></div>,
    },
  ],

  dont: [
    {
      title: 'Do not include the prompt in the copied string',
      why: 'Pasting "$ npm install" into a shell fails with "command not found: $". The prompt is a hint that this is a command, and hints are aria-hidden decoration.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-danger-text)]">
          $ npm install @acme/sdk → clipboard
        </code>
      ),
    },
    {
      title: 'Do not use monospace for emphasis',
      why: 'Monospace is a promise that these are the literal characters to type. Using it to make a word look technical trains readers to ignore that promise.',
      render: (
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          Our <InlineSnippet>revolutionary</InlineSnippet> new platform is{' '}
          <InlineSnippet>blazing fast</InlineSnippet>.
        </p>
      ),
    },
    {
      title: 'Do not wrap long command lines',
      why: 'A wrapped shell command hides where the real line breaks are, and a copied fragment with an invented newline is a command that fails in a confusing way. Scroll instead.',
      render: (
        <div className="w-full max-w-xs rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] p-2.5">
          <code className="whitespace-pre-wrap break-all font-mono text-[12px] text-[var(--ds-fg-secondary)]">
            npx @acme/cli deploy --project api-gateway --ref main --region eu-west-2
          </code>
        </div>
      ),
    },
    {
      title: 'Do not paste 300 lines into a panel',
      why: 'Past about 24 lines the block stops illustrating and starts being the page. Show the ten lines that matter and link to the file.',
      render: (
        <div className="w-full max-w-xs overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <div className="max-h-24 overflow-hidden bg-[var(--ds-surface-inset)] p-2.5">
            <code className="font-mono text-[10px] leading-tight text-[var(--ds-fg-disabled)]">
              {Array.from({ length: 12 }, (_, i) => `line ${i + 1} of 300…`).join('\n')}
            </code>
          </div>
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'Every syntax colour must reach 4.5:1 against the inset surface, in both themes. Highlight themes ported from an editor almost never do — comments are the usual failure.',
      'Comments are the one token allowed to sit at the bottom of the range, and they still owe 4.5:1. They are content, not chrome.',
      'The line-number gutter is non-content and may use the disabled tone. Nothing a user needs to read may.',
      'The copied tick must not be the only signal of success — colour alone fails for the 8% who cannot distinguish it from the idle glyph.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the copy control. It is a real button, never a click handler on a div.' },
      { keys: 'Enter / Space', does: 'Copies and fires the confirmation.' },
      { keys: 'Tab', does: 'Reaches a scrollable block itself, which must carry tabindex="0" so a keyboard user can scroll it.' },
      { keys: '← / → / Home / End', does: 'Scrolls a focused overflowing block horizontally.' },
      { keys: '⌘A / ⌃A', does: 'Inside a focused block, selects the code — and must select the code only, not the gutter.' },
    ],
    aria: [
      { attr: 'role="status"', on: 'A visually hidden live region', note: 'Announces "Copied". Without it the confirmation is purely visual and the interaction has no feedback at all for a screen-reader user.' },
      { attr: 'aria-label', on: 'The copy button', note: 'Names the value: "Copy API key", not "Copy". A page with six copy buttons otherwise has six identical controls.' },
      { attr: 'tabindex="0"', on: 'A scrollable block', note: 'Required by 2.1.1 — a region that scrolls must be reachable by keyboard.' },
      { attr: 'aria-label', on: 'The scrollable block', note: 'Names what the code is, so the region announces as "Deployment example, code" rather than as an anonymous scroll area.' },
      { attr: 'user-select: none', on: 'The gutter and the prompt', note: 'Not ARIA, but the same intent: these characters are not content and must never reach a selection or the clipboard.' },
    ],
    focus:
      'The copy control keeps its focus ring after activation — a control that visually changes on success must not also appear to lose focus. Focus never moves on copy; the user stays exactly where they were.',
    screenReader: [
      'Announce the language and line count before the code: "TypeScript, 9 lines". Reading nine lines of punctuation with no warning is disorienting.',
      'The copy confirmation must be announced. "Copied" from a polite live region is enough; do not use assertive, which interrupts.',
      'A masked secret should announce as masked — "API key, hidden" — so a screen-reader user knows the reveal control exists and why.',
    ],
    touch:
      'The copy control is 44px on coarse pointers and always visible — hover-revealed controls do not exist on touch, and hand-selecting a 40-character key on a phone is the worst interaction in any developer product. Blocks scroll horizontally with momentum rather than wrapping, and the block itself must not swallow the page’s vertical scroll.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { CodeSnippet, CopyButton } from '@/ui/Code'

<CodeSnippet lang="bash" prompt="$">
  npx @acme/cli deploy --project api-gateway
</CodeSnippet>

// The copy affordance is the component. It works anywhere a value has to
// be transcribed — this is why there is no separate "Copy to Clipboard".
<CopyButton value={deployment.id} label="Copy deployment ID" />

// Copy from the source string. Never from the DOM: innerText drags in line
// numbers, the prompt, and the highlighter's markup.
function useCopy(timeout = 1600) {
  const [copied, setCopied] = React.useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      legacyCopy(text)          // http:// and older Safari have no clipboard API
    }
    setCopied(true)
    setTimeout(() => setCopied(false), timeout)
  }
  return { copied, copy }
}`,
    },
    html: {
      lang: 'html',
      code: `<!-- Multi-line. The block is focusable because it scrolls. -->
<figure class="ds-code">
  <figcaption class="sr-only">Deployment example, TypeScript, 9 lines</figcaption>

  <pre tabindex="0" aria-label="Deployment example"><code class="language-ts"
    ><span class="ds-code__gutter" aria-hidden="true">1</span>const client = createClient({}</code></pre>

  <button type="button" class="ds-code__copy" aria-label="Copy code">
    <svg aria-hidden="true">…</svg>
  </button>
</figure>

<!-- The confirmation everyone forgets -->
<p class="sr-only" role="status" aria-live="polite">Copied</p>

<!-- Single line with a shell prompt. The $ is decoration. -->
<div class="ds-code ds-code--inline-block">
  <span class="ds-code__prompt" aria-hidden="true">$</span>
  <code>npm install @acme/sdk</code>
  <button type="button" aria-label="Copy command">…</button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-code {
  position: relative;
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-inset);   /* a well, not a raised card */
}

.ds-code pre {
  margin: 0;
  padding: 14px;
  max-block-size: 24rem;                 /* ~24 lines, then scroll */
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 13px;                       /* mono runs optically large */
  line-height: 1.55;                     /* looser than prose: scanned as columns */
  tab-size: 2;
}

/* Never selectable, never copied. This is the bug that ships most often. */
.ds-code__gutter,
.ds-code__prompt {
  user-select: none;
  -webkit-user-select: none;
  color: var(--ds-fg-disabled);          /* allowed: not content */
}

.ds-code__copy {
  position: absolute;
  inset-block-start: 8px;
  inset-inline-end: 8px;
  inline-size: 28px;
  block-size: 28px;
}

/* Hover-reveal is fine on a mouse and catastrophic on touch. */
@media (hover: hover) and (pointer: fine) {
  .ds-code__copy { opacity: 0; transition: opacity 120ms; }
  .ds-code:hover .ds-code__copy,
  .ds-code__copy:focus-visible { opacity: 1; }
}
@media (pointer: coarse) {
  .ds-code__copy { inline-size: 44px; block-size: 44px; }
}

/* No wrapping. A copied fragment with an invented newline is a broken command. */
.ds-code--inline-block code { white-space: nowrap; overflow-x: auto; }`,
    },
    api: [
      {
        name: 'CodeSnippet',
        props: [
          { name: 'children', type: 'string', required: true, description: 'The exact source. This string is what gets copied — never the rendered DOM.' },
          { name: 'lang', type: "'tsx' | 'ts' | 'js' | 'html' | 'css' | 'bash' | 'json' | 'text'", default: "'text'", description: 'Drives highlighting and the announced language.' },
          { name: 'prompt', type: 'string', description: 'A decorative shell prefix. aria-hidden and unselectable; never part of the copied value.' },
          { name: 'showLineNumbers', type: 'boolean', default: 'false', description: 'Adds an unselectable gutter. Only useful when the surrounding prose references line numbers.' },
          { name: 'wrap', type: 'boolean', default: 'false', description: 'Off for commands, where an invented newline breaks the paste. Acceptable for prose-like config.' },
            { name: 'maxHeight', type: 'number', default: '460', description: 'Pixel height past which the block scrolls rather than growing.' },
        ],
      },
      {
        name: 'CopyButton',
        props: [
          { name: 'value', type: 'string', required: true, description: 'Exactly what lands on the clipboard.' },
          { name: 'label', type: 'string', default: "'Copy'", description: 'Accessible name. Must identify the value on any page with more than one copy control.' },
          { name: 'timeout', type: 'number', default: '1600', description: 'How long the confirmation holds, in ms.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Offer a package-manager switcher (npm / pnpm / yarn / bun) on install commands and remember the choice across the whole site. It is the single highest-value affordance on any docs page.',
      'Show the copy control on focus as well as on hover, or keyboard users never discover it exists.',
      'Truncate long single-line values in the middle rather than the end — the tail of a key is what people check against.',
      'If a snippet contains a placeholder the user must replace, mark it visually and keep it in the copied string. Silently substituting their real key is worse than making them edit one word.',
    ],
    performance: [
      'Highlight on the server or at build time where you can. A client-side highlighter on twenty blocks is a measurable chunk of main-thread time on first paint.',
      'Do not re-highlight on every render. Memoise on the source string and the language, or a page of snippets re-tokenises on every keystroke elsewhere.',
      'Virtualise blocks over roughly 500 lines — but a 500-line block in a doc page is a design problem before it is a performance one.',
      'The clipboard API is async and can reject on an insecure origin. Always keep the legacy fallback; failing silently on http:// is a support ticket nobody can diagnose.',
    ],
    mistakes: [
      'Copying innerText, so line numbers and the shell prompt land on the clipboard.',
      'No confirmation, so users press the button repeatedly and then paste to check.',
      'A visual tick with no live-region announcement, leaving screen-reader users with no feedback at all.',
      'Every copy button on the page named "Copy", so assistive tech reports six identical controls.',
      'Hover-only copy controls, which are invisible on every touch device.',
      'Syntax colours ported straight from a code editor, where comments routinely sit around 2.5:1.',
      'A scrollable block with no tabindex, unreachable and unscrollable by keyboard.',
    ],
    realWorld: [
      'On docs pages, copy rate is one of the few honest engagement metrics — it means someone is actually running the thing rather than skimming.',
      'API-key screens should show the value exactly once, mask it thereafter, and keep copy working while masked. Every product that forces a reveal to copy gets keys screen-shared into meetings.',
      'For multi-step setup, give each step its own snippet with its own copy control. One block containing five commands guarantees someone runs all five when they only meant to run the third.',
      'Include the expected output as a separate, non-copyable block. Users need to know what success looks like, and they must not be able to paste it back into a shell.',
    ],
  },
})
