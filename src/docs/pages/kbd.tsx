import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/ui/Button'
import { Kbd, Tooltip } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/** The same shortcut, expressed for whichever platform is reading. */
const SHORTCUTS: { action: string; mac: string[]; win: string[] }[] = [
  { action: 'Command palette', mac: ['⌘', 'K'], win: ['Ctrl', 'K'] },
  { action: 'Save', mac: ['⌘', 'S'], win: ['Ctrl', 'S'] },
  { action: 'Deploy to production', mac: ['⌘', '⇧', 'D'], win: ['Ctrl', 'Shift', 'D'] },
  { action: 'Delete deployment', mac: ['⌫'], win: ['Del'] },
  { action: 'Close', mac: ['Esc'], win: ['Esc'] },
]

function Chord({ keys, joiner }: { keys: string[]; joiner?: string }) {
  return (
    // One accessible name for the whole chord: "Command K", not "Command"
    // then "K" as two unrelated announcements.
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={keys.join(' plus ').replace('⌘', 'Command').replace('⇧', 'Shift').replace('⌫', 'Backspace')}
    >
      {keys.map((k, i) => (
        <React.Fragment key={k}>
          {i > 0 && joiner && (
            <span aria-hidden className="text-caption text-[var(--ds-fg-disabled)]">
              {joiner}
            </span>
          )}
          <Kbd>{k}</Kbd>
        </React.Fragment>
      ))}
    </span>
  )
}

function Playground() {
  const [platform, setPlatform] = React.useState<'mac' | 'win'>('mac')
  const [joiner, setJoiner] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={220}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Platform">
            <KnobSelect value={platform} onChange={setPlatform} options={['mac', 'win'] as const} />
          </Knob>
          <KnobToggle checked={joiner} onChange={setJoiner} label="Plus joiner" />
        </div>
      }
      code={`<Kbd>${platform === 'mac' ? '⌘' : 'Ctrl'}</Kbd>
<Kbd>K</Kbd>

// Or as a chord, with one accessible name:
<Shortcut keys={['${platform === 'mac' ? '⌘' : 'Ctrl'}', 'K']} />`}
    >
      <Stack gap="sm" className="w-full max-w-sm">
        {SHORTCUTS.map((s) => (
          <Row key={s.action} gap="sm" align="center" className="w-full">
            <span className="flex-1 text-label-sm text-[var(--ds-fg-secondary)]">{s.action}</span>
            <Chord keys={platform === 'mac' ? s.mac : s.win} joiner={joiner ? '+' : undefined} />
          </Row>
        ))}
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'kbd',
    title: 'KBD',
    tagline:
      'Rendering a physical key. Platform-correct glyphs, chord ordering, and never inventing a symbol.',
    keywords: ['keycap', 'shortcut', 'hotkey', 'key', 'chord', 'modifier', 'meta', 'shortcut hint'],
  },

  overview: {
    purpose:
      'A KBD renders a key the user is meant to press. It is the smallest component in the system and it exists for one reason: to make a shortcut look like a key rather than like a word in a sentence. "Press ⌘K" is a sentence with a fragment in it; "Press ⌘ K" with keycaps is an instruction.',
    whenToUse: [
      'Showing a keyboard shortcut in a Menu, a Tooltip or a command palette.',
      'Documenting shortcuts in help content or a cheatsheet.',
      'Hinting at a shortcut inside a control — the ⌘K chip in a search field.',
      'Any prose that instructs the reader to press something.',
    ],
    whenNotToUse: [
      {
        text: 'It is a code identifier or a value to type.',
        instead: 'a Code Snippet — monospace means "these characters", not "this key"',
        to: '#/code-snippet',
      },
      {
        text: 'It is a UI label the user should click.',
        instead: 'ordinary text or a Button — a keycap tells them to press a physical key',
        to: '#/button',
      },
      {
        text: 'The shortcut does not exist yet.',
        instead: 'nothing — a rendered key that does nothing is worse than no hint',
        to: '#/command-palette',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Use the platform’s own glyphs.</strong> A Mac user reads <code>⌘</code>{' '}
          instantly and has to translate "Cmd" or "Command". A Windows user reads "Ctrl" and has
          never seen <code>⌘</code>. Detecting the platform once and rendering the right form is a
          few lines and it is the difference between a hint and a puzzle.
        </p>
        <p>
          Chord order is fixed by convention: <strong>Control, Option/Alt, Shift, Command</strong>{' '}
          on macOS, and Ctrl, Alt, Shift on Windows. It is the order printed on every menu in both
          operating systems, and reversing it makes a familiar shortcut look unfamiliar.
        </p>
        <p>
          A chord needs <strong>one accessible name, not three</strong>. Three separate{' '}
          <code>&lt;kbd&gt;</code> elements announce as "Command, Shift, D" with no indication
          they are pressed together. Wrapping them with a single label — "Command Shift D" — is
          what makes the shortcut comprehensible without sight.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'platform',
        title: 'Platform-correct glyphs',
        description:
          'The same shortcut, twice. Detect once at startup and render the right form — a Mac user should never have to translate "Cmd".',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="macOS" tone="good">
                <Stack gap="sm">
                  {SHORTCUTS.slice(0, 3).map((s) => (
                    <Row key={s.action} gap="sm" align="center">
                      <span className="flex-1 text-caption text-[var(--ds-fg-secondary)]">
                        {s.action}
                      </span>
                      <Chord keys={s.mac} />
                    </Row>
                  ))}
                </Stack>
              </Cell>
              <Cell label="Windows" tone="good">
                <Stack gap="sm">
                  {SHORTCUTS.slice(0, 3).map((s) => (
                    <Row key={s.action} gap="sm" align="center">
                      <span className="flex-1 text-caption text-[var(--ds-fg-secondary)]">
                        {s.action}
                      </span>
                      <Chord keys={s.win} />
                    </Row>
                  ))}
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'in-context',
        title: 'Where shortcuts get discovered',
        description:
          'A hint in the search field, a chord on a menu row, a shortcut in a tooltip. These three places account for almost all shortcut discovery.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full max-w-sm">
              <button
                type="button"
                className="flex h-9 w-full items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] px-2.5 text-caption text-[var(--ds-fg-muted)]"
              >
                <Search size={14} />
                <span className="flex-1 text-left">Search pages and commands…</span>
                <Chord keys={['⌘', 'K']} />
              </button>

              <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1.5">
                {SHORTCUTS.slice(0, 3).map((s) => (
                  <Row
                    key={s.action}
                    gap="sm"
                    align="center"
                    className="rounded-[var(--radius-md)] px-2 py-1.5"
                  >
                    <span className="flex-1 text-label text-[var(--ds-fg-secondary)]">
                      {s.action}
                    </span>
                    <Chord keys={s.mac} />
                  </Row>
                ))}
              </div>

              <Row gap="sm">
                <Tooltip content="Deploy to production" shortcut="⌘⇧D">
                  <Button variant="outlined" size="sm">
                    Deploy
                  </Button>
                </Tooltip>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'in-prose',
        title: 'In prose',
        description:
          'A keycap in a sentence needs to sit on the text baseline without disturbing the line height, which is why the vertical padding is smaller than it looks like it should be.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <p className="max-w-md text-body leading-relaxed text-[var(--ds-fg-secondary)]">
              Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette, <Kbd>Esc</Kbd> to close
              it, and <Kbd>↑</Kbd> <Kbd>↓</Kbd> to move through the results. Hold <Kbd>⇧</Kbd> to
              extend the selection.
            </p>
          </PreviewStage>
        ),
      },
      {
        id: 'chords',
        title: 'Chord order and joiners',
        description:
          'Modifiers in the platform’s printed order. A "+" between caps is optional — it helps in dense prose and adds noise in a right-aligned menu column.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="14rem">
              <Cell label="No joiner" sub="Menus, lists" tone="good">
                <Chord keys={['⌘', '⇧', 'D']} />
              </Cell>
              <Cell label="With joiner" sub="Prose" tone="good">
                <Chord keys={['Ctrl', 'Shift', 'D']} joiner="+" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Letter', render: <Kbd>K</Kbd> },
      { label: 'Modifier', render: <Kbd>⌘</Kbd> },
      { label: 'Named', render: <Kbd>Esc</Kbd> },
      { label: 'Arrow', render: <Kbd>↑</Kbd> },
      { label: 'Enter', render: <Kbd>↵</Kbd> },
      { label: 'Backspace', render: <Kbd>⌫</Kbd> },
      { label: 'Chord', render: <Chord keys={['⌘', 'K']} /> },
      { label: 'Three-key', render: <Chord keys={['⌘', '⇧', 'D']} /> },
      { label: 'With joiner', render: <Chord keys={['Ctrl', 'Shift', 'D']} joiner="+" /> },
      {
        label: 'On dark surface',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-fg)] px-2.5 py-1.5">
            <Kbd className="border-white/25 bg-white/10 text-[var(--ds-fg-inverse)]">⌘K</Kbd>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="center">
        <Chord keys={['⌘', '⇧', 'D']} />
        <Chord keys={['Ctrl', 'Shift', 'D']} joiner="+" />
      </Row>
    ),
    caption:
      'A keycap with a heavier bottom border than its sides, sized to the type around it rather than to a fixed pixel value.',
    parts: [
      {
        n: 1,
        label: 'Height',
        value: '18–20px',
        kind: 'size',
        note: 'Sized to sit on a 13px line without disturbing it. A keycap taller than its line makes prose leading visibly uneven.',
      },
      {
        n: 2,
        label: 'Min width',
        value: 'Equal to the height',
        kind: 'size',
        note: 'So a single letter renders square and "Esc" renders wide. Without the minimum, "K" is a narrow sliver beside "Shift".',
      },
      {
        n: 3,
        label: 'Padding',
        value: '0 5px, 1px vertical',
        kind: 'space',
        note: 'Deliberately tight vertically. The horizontal padding does the visual work; vertical padding pushes the cap off the baseline.',
      },
      {
        n: 4,
        label: 'Bottom border',
        value: '2px, sides 1px',
        kind: 'shape',
        note: 'The single detail that makes it read as a physical key. It is the cheapest skeuomorphism left in the system and it works.',
      },
      {
        n: 5,
        label: 'Type',
        value: '11px, 500 weight',
        kind: 'type',
        note: 'Sans, not monospace. Monospace means "these literal characters"; a key is a physical object, and the two must not be confused.',
      },
      {
        n: 6,
        label: 'Chord gap',
        value: '4px between caps',
        kind: 'space',
        note: 'Tight enough that a chord reads as one instruction. The gap to surrounding text is 6px, marking the chord as a unit.',
      },
      {
        n: 7,
        label: 'Radius',
        value: '5px',
        kind: 'shape',
        note: 'Slightly less than a button at the same height. Keys are harder-edged objects than controls.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Keycap fill' },
    { category: 'color', token: '--ds-border', usedFor: 'Keycap border, doubled at the bottom' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'The key label' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'A "+" joiner between caps' },
    { category: 'color', token: '--ds-fg-inverse', usedFor: 'Keycaps on an inverted surface, such as inside a Tooltip' },
    { category: 'spacing', token: '--space-1', value: '4px', usedFor: 'Gap between caps in a chord' },
    { category: 'radius', token: '5px', usedFor: 'Keycap corners — tighter than a button' },
    { category: 'typography', token: 'font-sans', value: '11px / 500', usedFor: 'The label. Never monospace.' },
  ],

  sizes: [
    { name: 'Default', height: '18px', minWidth: '18px', padding: '0 5px', type: '11px', use: 'In menus, tooltips and lists.' },
    { name: 'In prose', height: '1.35em', minWidth: '1.35em', type: '0.85em', use: 'Sized relative to the surrounding text so it never disturbs the line height.' },
    { name: 'Large', height: '24px', minWidth: '24px', type: '13px', use: 'A cheatsheet or a keyboard-shortcuts page, where the keys are the content.' },
    { name: 'Chord gap', gap: '4px', use: 'Between caps. 6px to the surrounding text, marking the chord as one unit.' },
    { name: 'Column', minWidth: '4rem', use: 'A right-aligned shortcut column in a menu, so chords of different lengths line up.' },
  ],

  do: [
    {
      title: 'Render the platform’s own glyphs',
      why: 'A Mac user reads ⌘ instantly and has to translate "Cmd". Detecting the platform once is a few lines and removes the translation entirely.',
      render: (
        <Row gap="lg">
          <Chord keys={['⌘', 'K']} />
          <Chord keys={['Ctrl', 'K']} />
        </Row>
      ),
    },
    {
      title: 'Give the chord one accessible name',
      why: 'Three separate kbd elements announce as three unrelated keys. One label — "Command Shift D" — is what makes the shortcut comprehensible.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;span role="img" aria-label="Command Shift D"&gt;
        </code>
      ),
    },
    {
      title: 'Use the printed modifier order',
      why: 'Control, Option, Shift, Command on macOS; Ctrl, Alt, Shift on Windows. It is the order on every OS menu, and reversing it makes a familiar shortcut look wrong.',
      render: (
        <Stack gap="xs">
          <Chord keys={['⌃', '⌥', '⇧', '⌘', 'K']} />
          <span className="text-caption text-[var(--ds-fg-muted)]">Control, Option, Shift, Command</span>
        </Stack>
      ),
    },
    {
      title: 'Show it where the action is',
      why: 'Menus, tooltips and the command palette are where shortcuts get learned. A shortcuts page nobody opens teaches nobody anything.',
      render: (
        <Row gap="sm" align="center" className="w-52 rounded-[var(--radius-md)] px-2 py-1.5">
          <span className="flex-1 text-label text-[var(--ds-fg-secondary)]">Rename</span>
          <Kbd>⌘E</Kbd>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use monospace',
      why: 'Monospace is a promise that these are the literal characters to type. A key is a physical object, and confusing the two undermines both conventions.',
      render: (
        <span className="rounded-[5px] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--ds-fg-secondary)]">
          Cmd+K
        </span>
      ),
    },
    {
      title: 'Do not invent symbols',
      why: 'Only use glyphs the platform actually prints. A made-up symbol for a key the user has never seen is a puzzle in place of an instruction.',
      render: (
        <Row gap="sm">
          <Kbd>⎇</Kbd>
          <Kbd>❖</Kbd>
          <Kbd>⌤</Kbd>
        </Row>
      ),
    },
    {
      title: 'Do not show a shortcut that does not exist',
      why: 'A rendered key that does nothing when pressed is worse than no hint — it teaches the user that the hints are unreliable.',
      render: (
        <Row gap="sm" align="center" className="w-52">
          <span className="flex-1 text-label text-[var(--ds-fg-muted)]">Export</span>
          <span className="opacity-60">
            <Kbd>⌘E</Kbd>
          </span>
          <span className="text-caption text-[var(--ds-danger-text)]">not bound</span>
        </Row>
      ),
    },
    {
      title: 'Do not use one for a UI label',
      why: 'A keycap tells the user to press a physical key. Wrapping a button’s name in one sends them looking at their keyboard for a control on screen.',
      render: (
        <p className="text-body-sm text-[var(--ds-fg-secondary)]">
          Click <Kbd>Deploy</Kbd> to start the rollout.
        </p>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.4', name: 'Resize Text', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The label owes 4.5:1 at 11px — small text has no exemption, and this is some of the smallest text in the system.',
      'The keycap border owes 3:1: it is what makes the element read as a key rather than as emphasised text.',
      'On an inverted surface such as a Tooltip, the cap needs its own border and fill values. Reusing the light-surface tokens produces an invisible key.',
      'In forced-colors mode the fill is dropped, so the border must be a real border rather than a box-shadow.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Nothing — a KBD is never focusable. It describes a key; it is not one.' },
    ],
    aria: [
      { attr: '<kbd>', on: 'Each key', note: 'The native element. It carries the semantics for free and is what assistive tech expects.' },
      { attr: 'role="img" + aria-label', on: 'A chord wrapper', note: '"Command Shift D". Three kbd elements otherwise announce as three unrelated keys.' },
      { attr: 'aria-hidden', on: 'A "+" joiner', note: 'It is punctuation between caps, not something to read aloud.' },
      { attr: 'aria-keyshortcuts', on: 'The control the shortcut triggers', note: 'The real mechanism: it tells assistive tech what the shortcut is, independently of any visual keycap.' },
    ],
    focus:
      'A KBD is never in the focus order and never interactive. If a key hint is clickable — pressing it runs the action — that is a Button that happens to be styled as a key, and it needs a button’s semantics.',
    screenReader: [
      'Announce the chord as a phrase: "Command Shift D", not "Command, Shift, D" as three items.',
      'Spell out symbols. ⌘ read as an unknown glyph, or skipped entirely, is worse than "Command".',
      'Put aria-keyshortcuts on the control itself. That is what a screen-reader user actually queries; the visual keycap is for everyone else.',
    ],
    touch:
      'A device with no keyboard has no use for a shortcut hint. Hide keycaps on coarse pointers — the ⌘K chip in a search field is pure noise on a phone, and it takes space from the placeholder that is doing the real work.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Kbd } from '@/ui/Display'

<Kbd>⌘</Kbd> <Kbd>K</Kbd>

// A chord needs ONE accessible name. Three kbd elements announce as three
// unrelated keys.
function Shortcut({ keys }: { keys: string[] }) {
  return (
    <span role="img" aria-label={keys.map(spoken).join(' ')} className="inline-flex gap-1">
      {keys.map((k) => <Kbd key={k}>{k}</Kbd>)}
    </span>
  )
}

const SPOKEN: Record<string, string> = {
  '⌘': 'Command', '⇧': 'Shift', '⌥': 'Option', '⌃': 'Control',
  '⌫': 'Backspace', '↵': 'Enter', '↑': 'Up arrow', '↓': 'Down arrow',
}
const spoken = (k: string) => SPOKEN[k] ?? k

// Detect once at startup, not per render.
const isMac = typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent)

// One definition, two renderings. Modifier order follows what the OS prints:
// Control, Option, Shift, Command on macOS.
export function keysFor(shortcut: Shortcut) {
  return isMac ? shortcut.mac : shortcut.win
}

// The visual keycap is for sighted users. THIS is what a screen reader queries.
<button aria-keyshortcuts="Meta+K" onClick={openPalette}>
  Search <Shortcut keys={keysFor(PALETTE)} />
</button>`,
    },
    html: {
      lang: 'html',
      code: `<!-- In prose: sized relative to the text so it never disturbs the leading. -->
<p>Press <kbd>⌘</kbd> <kbd>K</kbd> to open the command palette.</p>

<!-- A chord: one name for the whole thing. -->
<span role="img" aria-label="Command Shift D">
  <kbd>⌘</kbd>
  <kbd>⇧</kbd>
  <kbd>D</kbd>
</span>

<!-- With a joiner in dense prose. The + is punctuation, not content. -->
<span role="img" aria-label="Control Shift D">
  <kbd>Ctrl</kbd>
  <span aria-hidden="true">+</span>
  <kbd>Shift</kbd>
  <span aria-hidden="true">+</span>
  <kbd>D</kbd>
</span>

<!-- The real mechanism sits on the control, not on the keycap. -->
<button type="button" aria-keyshortcuts="Meta+K">
  Search
  <span role="img" aria-label="Command K"><kbd>⌘</kbd><kbd>K</kbd></span>
</button>`,
    },
    css: {
      lang: 'css',
      code: `kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* Square for a single letter, wide for "Esc". Without the minimum, "K"
     is a narrow sliver beside "Shift". */
  min-inline-size: 1.35em;
  block-size: 1.35em;
  padding-inline: 5px;

  border: 1px solid var(--ds-border);
  /* The one detail that makes it read as a physical key. */
  border-block-end-width: 2px;
  border-radius: 5px;                /* tighter than a button */

  background: var(--ds-surface-raised);
  color: var(--ds-fg-secondary);

  /* Sans, NOT mono: monospace means "these literal characters", and a key
     is a physical object. */
  font-family: inherit;
  font-size: 0.85em;                 /* relative, so it scales with the text */
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

/* A chord is one unit: tight inside, looser to the text around it. */
.ds-shortcut { display: inline-flex; gap: 4px; margin-inline: 2px; }

/* On an inverted surface the light-surface tokens produce an invisible key. */
[role='tooltip'] kbd,
.ds-inverted kbd {
  border-color: rgb(255 255 255 / 0.25);
  background: rgb(255 255 255 / 0.1);
  color: inherit;
}

/* The fill is dropped here, so the border must be a real border. */
@media (forced-colors: active) {
  kbd { border: 1px solid; background: transparent; }
}

/* No keyboard, no use for a key hint. */
@media (pointer: coarse) {
  .ds-shortcut--hint { display: none; }
}`,
    },
    api: [
      {
        name: 'Kbd',
        props: [
          { name: 'children', type: 'ReactNode', required: true, description: 'One key. A whole chord in one cap loses the visual separation that makes it readable.' },
          { name: 'size', type: "'sm' | 'md'", default: "'sm'", description: 'Medium for a shortcuts page where the keys are the content.' },
          { name: 'className', type: 'string', description: 'Where inverted-surface colours are applied — a Tooltip needs its own border and fill.' },
        ],
      },
      {
        name: 'Shortcut',
        props: [
          { name: 'keys', type: 'string[]', required: true, description: 'Modifiers first, in the platform’s printed order, then the key.' },
          { name: 'joiner', type: 'string', description: 'A "+" between caps. Useful in prose, noise in a right-aligned menu column.' },
          { name: 'platform', type: "'mac' | 'win' | 'auto'", default: "'auto'", description: 'Detected once at startup. Rendering ⌘ to a Windows user is a puzzle.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Define each shortcut once, with both platform forms, and derive every rendering from it. Two hand-maintained lists will disagree within a month.',
      'Right-align the shortcut column in menus and give it a minimum width, so chords of different lengths line up down the list.',
      'Use ↵ for Enter and ⌫ for Backspace on macOS, but spell them out on Windows — the symbols are not printed on those keyboards.',
      'Hide key hints entirely on touch. A ⌘K chip on a phone is noise taking space from the placeholder that is doing the real work.',
      'If a shortcut is user-configurable, render the current binding rather than the default. A hint that no longer matches is worse than none.',
    ],
    performance: [
      'Detect the platform once at module load and store the result. Reading navigator on every render is wasteful and, in some browsers, deprecated.',
      'Render keycaps as text, not as images or generated SVG. Text scales with the user’s font size, which 1.4.4 requires.',
      'Size the cap in em rather than px so it tracks the surrounding type. A fixed 18px cap inside 20px prose looks like a rendering error.',
    ],
    mistakes: [
      'Monospace keycaps, confusing "press this key" with "type these characters".',
      'Rendering ⌘ to Windows users, or "Cmd" to Mac users.',
      'Three kbd elements with no wrapper, announcing as three unrelated keys.',
      'Fixed pixel sizing, so caps do not scale with the user’s text size.',
      'Light-surface colours reused inside a Tooltip, producing an invisible key.',
      'Showing a shortcut that is not actually bound.',
      'Wrapping a UI label in a keycap, sending users to look at their keyboard.',
      'A box-shadow instead of a border, so the cap vanishes in forced-colors mode.',
    ],
    realWorld: [
      'Menus and tooltips are where shortcuts are learned. A dedicated shortcuts page is worth having and is not where adoption comes from.',
      'The ⌘K chip in a fake search box is the single most effective shortcut advertisement in modern product UI — users learn it without ever reading documentation.',
      'Cross-platform apps that hardcode one platform’s glyphs get support tickets from the other. Deriving both from one definition removes an entire class of them.',
      'If a shortcut needs three modifiers, it is probably not a shortcut anyone will use. Reserve the short chords for the things people actually do repeatedly.',
    ],
  },
})
