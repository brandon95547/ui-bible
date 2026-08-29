import * as React from 'react'
import { Check, Pipette } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, TextInput } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SWATCHES = [
  ['#6366f1', 'Indigo'],
  ['#8b5cf6', 'Violet'],
  ['#ec4899', 'Pink'],
  ['#ef4444', 'Red'],
  ['#f59e0b', 'Amber'],
  ['#10b981', 'Emerald'],
  ['#06b6d4', 'Cyan'],
  ['#64748b', 'Slate'],
] as const

/** sRGB relative luminance, so the contrast readout is real rather than eyeballed. */
function luminance(hex: string) {
  const n = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function ratioAgainstWhite(hex: string) {
  const l = luminance(hex)
  return (1.05 / (l + 0.05)).toFixed(2)
}

function Picker({
  value,
  onChange,
  showContrast = true,
  compact,
}: {
  value: string
  onChange: (v: string) => void
  showContrast?: boolean
  compact?: boolean
}) {
  const [draft, setDraft] = React.useState(value)
  // Detected in an effect, not during render — and for two reasons. The page
  // is prerendered, where `window` does not exist at all; and even in the
  // browser, deciding this while rendering makes the server's answer (no
  // button) disagree with the client's (a button), which is a hydration
  // mismatch. State that starts false and turns true after mount is the only
  // form of feature detection that survives both. The sample further down this
  // page already guards with `typeof window !== 'undefined'`; this demo did
  // not follow its own advice.
  const [hasEyeDropper, setHasEyeDropper] = React.useState(false)
  React.useEffect(() => setHasEyeDropper('EyeDropper' in window), [])
  React.useEffect(() => setDraft(value), [value])

  const valid = /^#[0-9a-f]{6}$/i.test(draft)
  const ratio = valid ? ratioAgainstWhite(draft) : null

  return (
    <div className={cn('flex flex-col gap-3', compact ? 'w-[13rem]' : 'w-[15rem]')}>
      {/* Swatches first: almost every real choice is one of these, and a
          named swatch is reproducible in a way a spectrum drag is not. */}
      <div role="radiogroup" aria-label="Preset colours" className="grid grid-cols-8 gap-1.5">
        {SWATCHES.map(([hex, name]) => {
          const on = value.toLowerCase() === hex
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${name} ${hex}`}
              onClick={() => onChange(hex)}
              style={{ background: hex }}
              className={cn(
                'grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] transition-transform',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
                // A ring, not a border: a border would change the swatch size
                // and make the row jump as the selection moves.
                on && 'ring-2 ring-[var(--ds-fg)] ring-offset-2 ring-offset-[var(--ds-surface)]',
              )}
            >
              {on && <Check size={12} className="text-white mix-blend-difference" />}
            </button>
          )
        })}
      </div>

      <div
        aria-hidden
        className="h-20 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"
        style={{
          background: `linear-gradient(to right, #fff, ${valid ? draft : '#888'}), linear-gradient(to bottom, transparent, #000)`,
          backgroundBlendMode: 'multiply',
        }}
      />

      <Row gap="sm" align="center" className="w-full">
        <span
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]"
          style={{ background: valid ? draft : 'transparent' }}
        />
        <div className="min-w-0 flex-1">
          {/* The hex field is never optional. It is the only exact, shareable,
              reproducible way to state a colour. */}
          <TextInput
            size="sm"
            value={draft}
            status={valid ? 'default' : 'error'}
            aria-label="Hex value"
            onChange={(e) => {
              const v = e.target.value
              setDraft(v)
              if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v)
            }}
            className="font-mono uppercase"
          />
        </div>
        {hasEyeDropper && (
          <button
            type="button"
            aria-label="Pick a colour from the screen"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
          >
            <Pipette size={14} />
          </button>
        )}
      </Row>

      {showContrast && ratio && (
        <Row gap="sm" align="center" className="text-caption">
          <span className="text-[var(--ds-fg-muted)]">On white</span>
          <span className="font-mono tabular-nums text-[var(--ds-fg)]">{ratio}:1</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] uppercase',
              Number(ratio) >= 4.5
                ? 'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]'
                : 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
            )}
          >
            {Number(ratio) >= 4.5 ? 'AA text' : Number(ratio) >= 3 ? 'AA large only' : 'Fails'}
          </span>
        </Row>
      )}
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState('#6366f1')
  const [contrast, setContrast] = React.useState(true)
  const [size, setSize] = React.useState<'sm' | 'md'>('md')

  return (
    <PreviewStage
      label="Playground"
      minHeight={330}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={contrast} onChange={setContrast} label="Contrast readout" />
        </div>
      }
      code={`<Field label="Brand colour" description="Used for buttons and links.">
  <ColorPicker
    value={value}
    onChange={setValue}
    swatches={BRAND_SWATCHES}
    showContrast={${contrast}}
  />
</Field>`}
    >
      <div className="w-full max-w-xs">
        <Field label="Brand colour" description="Used for buttons, links and focus rings.">
          <Picker
            value={value}
            onChange={setValue}
            showContrast={contrast}
            compact={size === 'sm'}
          />
        </Field>
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'color-picker',
    title: 'Color Picker',
    tagline:
      'Swatches first, spectrum second, hex field always. Most colour choices are a pick from a set, not an exploration of a gamut.',
    keywords: ['swatch', 'eyedropper', 'hex', 'hsl', 'palette', 'contrast', 'alpha'],
  },

  overview: {
    purpose:
      'A colour picker turns an abstract value into something the user can see. In practice almost every real choice is a pick from a small set — a label colour, a category, a brand accent — so the swatch grid does most of the work and the spectrum exists for the minority of cases that genuinely need a specific hue. The hex field is what makes any of it reproducible.',
    whenToUse: [
      'Choosing a colour with a visible effect: a label, a tag, a chart series, a theme accent.',
      'Brand and theme configuration, where the exact value matters and must be shareable.',
      'Anywhere a user would otherwise paste a hex code and hope.',
    ],
    whenNotToUse: [
      {
        text: 'The colour carries meaning that the system defines.',
        instead: 'the semantic tokens — status colours are not a user preference',
        to: '#/colors',
      },
      {
        text: 'There are fewer than about ten allowed colours.',
        instead: 'a swatch grid alone, with no spectrum at all',
        to: '#/radio-button',
      },
      {
        text: 'The user is picking a chart palette.',
        instead: 'a named categorical palette — hand-picked series colours collide and fail in greyscale',
        to: '#/chart',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Swatches beat the spectrum for almost every task.</strong> A named swatch is one
          click, it is reproducible, and it is a value someone else can name back to you. Dragging
          in a saturation square produces <code>#6f66ee</code> rather than{' '}
          <code>#6366f1</code>, and nobody can tell the difference or reproduce it deliberately.
        </p>
        <p>
          The <strong>hex field is never optional</strong>. It is the only exact, shareable,
          paste-able representation, and it is the only part of the control a keyboard user can
          operate precisely. A picker without one is a picker that cannot be used to match a brand
          guideline.
        </p>
        <p>
          If the colour will ever sit behind text, <strong>show the contrast ratio</strong>. This
          is the one place a design system can prevent an accessibility failure at the moment it is
          created rather than auditing it six months later.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'swatches-only',
        title: 'Most pickers should be swatches only',
        description:
          'Twelve labelled colours cover a label picker, a category colour, a calendar tag. Adding a spectrum invites values nobody can reproduce.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <SwatchOnly />
          </PreviewStage>
        ),
      },
      {
        id: 'contrast',
        title: 'Contrast as you choose',
        description:
          'The ratio against the surface the colour will actually sit on, checked live. It is the cheapest accessibility intervention available anywhere in a design system.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Passes AA" tone="good">
                <ContrastRow hex="#4338ca" />
              </Cell>
              <Cell label="Fails" tone="bad">
                <ContrastRow hex="#f59e0b" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'hex',
        title: 'The hex field carries everything',
        description:
          'Paste-able, typeable, shareable, and the only precise path for a keyboard user. It should accept 3-digit shorthand, a missing hash, and uppercase.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="xs" className="w-full max-w-xs">
              {['#6366F1', '6366f1', '#63f'].map((v) => (
                <Row key={v} gap="sm" align="center">
                  <code className="w-24 font-mono text-caption text-[var(--ds-fg-secondary)]">{v}</code>
                  <span className="text-[var(--ds-fg-disabled)]">→</span>
                  <code className="font-mono text-caption text-[var(--ds-success-text)]">#6366f1</code>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'preview',
        title: 'Preview it where it lands',
        description:
          'A swatch in a panel tells you the colour. The same colour behind a real button tells you whether it works, which is the actual question.',
        render: <LivePreview />,
      },
    ],
    states: [
      {
        label: 'Swatch',
        render: <span className="block h-6 w-6 rounded-[var(--radius-sm)]" style={{ background: '#6366f1' }} />,
      },
      {
        label: 'Selected',
        render: (
          <span
            className="grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] ring-2 ring-[var(--ds-fg)] ring-offset-2 ring-offset-[var(--ds-surface)]"
            style={{ background: '#6366f1' }}
          >
            <Check size={12} className="text-white" />
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span
            className="block h-6 w-6 rounded-[var(--radius-sm)] outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]"
            style={{ background: '#ec4899' }}
          />
        ),
      },
      {
        label: 'Light swatch',
        render: (
          <span
            className="block h-6 w-6 rounded-[var(--radius-sm)] border border-[var(--ds-border-strong)]"
            style={{ background: '#fefefe' }}
          />
        ),
      },
      {
        label: 'Hex field',
        render: (
          <div className="w-28">
            <TextInput size="sm" defaultValue="#6366F1" aria-label="hex" className="font-mono uppercase" />
          </div>
        ),
      },
      {
        label: 'Invalid hex',
        render: (
          <div className="w-28">
            <TextInput size="sm" defaultValue="#zzz" status="error" aria-label="bad" className="font-mono" />
          </div>
        ),
      },
      {
        label: 'AA badge',
        render: (
          <span className="rounded-full bg-[var(--ds-success-subtle)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--ds-success-text)]">
            AA text
          </span>
        ),
      },
      {
        label: 'Fail badge',
        render: (
          <span className="rounded-full bg-[var(--ds-danger-subtle)] px-1.5 py-0.5 text-[10px] uppercase text-[var(--ds-danger-text)]">
            Fails
          </span>
        ),
      },
      { label: 'Eyedropper', render: <Pipette size={16} className="text-[var(--ds-fg-muted)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xs">
        <Picker value="#6366f1" onChange={() => {}} />
      </div>
    ),
    caption:
      'Swatches at the top because they answer most choices, a spectrum for the rest, and a hex field that makes any of it reproducible.',
    parts: [
      {
        n: 1,
        label: 'Swatch',
        value: '24 × 24px, 6px gap',
        kind: 'size',
        note: 'Large enough to judge the colour, small enough that twelve fit on one row. Below 20px, similar hues become indistinguishable.',
      },
      {
        n: 2,
        label: 'Selection',
        value: 'Ring + offset, plus a check',
        kind: 'shape',
        note: 'A ring rather than a border, so the swatch never changes size and the row does not jump as the selection moves. The check is the second, non-colour signal.',
      },
      {
        n: 3,
        label: 'Light-swatch border',
        value: '1px on pale colours',
        kind: 'color',
        note: 'A white swatch on a white panel is invisible. Every swatch needs an edge that survives its own lightness.',
      },
      {
        n: 4,
        label: 'Spectrum',
        value: '80px tall',
        kind: 'size',
        note: 'Deliberately secondary. It is the escape hatch for a colour not in the set, not the primary interface.',
      },
      {
        n: 5,
        label: 'Hex field',
        value: 'Monospace, uppercase',
        kind: 'type',
        note: 'The exact, shareable value. Monospace so a column of hex codes aligns and so 0 and O cannot be confused.',
      },
      {
        n: 6,
        label: 'Contrast readout',
        value: 'Ratio + AA verdict',
        kind: 'type',
        note: 'Against the surface the colour will actually sit on. A number with no pass/fail verdict makes the reader do the work.',
      },
      {
        n: 7,
        label: 'Eyedropper',
        value: '32px, when supported',
        kind: 'size',
        note: 'Feature-detected. The EyeDropper API is not everywhere, and a dead button is worse than a missing one.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Picker panel' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Swatch and preview edges' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Edge on a pale swatch' },
    { category: 'color', token: '--ds-fg', usedFor: 'Selection ring' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline' },
    { category: 'color', token: '--ds-success-text', usedFor: 'A passing contrast verdict' },
    { category: 'color', token: '--ds-danger-text', usedFor: 'A failing verdict and an invalid hex' },
    { category: 'spacing', token: '--space-1-5', value: '6px', usedFor: 'Gap between swatches' },
    { category: 'radius', token: '--radius-sm', value: '6px', usedFor: 'Swatch corners' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Spectrum and preview corners' },
    { category: 'typography', token: 'font-mono', usedFor: 'The hex value' },
  ],

  sizes: [
    { name: 'Swatch', height: '24px', minWidth: '24px', gap: '6px', touch: '44px on coarse pointers', use: 'The primary control. Twelve fit comfortably on one row at this size.' },
    { name: 'Compact panel', minWidth: '208px', use: 'Swatches and a hex field only. No spectrum.' },
    { name: 'Default panel', minWidth: '240px', use: 'Swatches, spectrum, hex field and contrast readout.' },
    { name: 'Spectrum', height: '80px', use: 'Secondary by design. Taller makes it look like the main event.' },
    { name: 'Preview chip', height: '32px', minWidth: '32px', use: 'Beside the hex field, showing the parsed value rather than the typed text.' },
  ],

  do: [
    {
      title: 'Lead with swatches',
      why: 'Almost every real choice is one of a set. A named swatch is one click, reproducible, and something a colleague can name back to you.',
      render: (
        <Row gap="sm">
          {SWATCHES.slice(0, 6).map(([hex, name]) => (
            <span
              key={hex}
              title={name}
              className="h-6 w-6 rounded-[var(--radius-sm)]"
              style={{ background: hex }}
            />
          ))}
        </Row>
      ),
    },
    {
      title: 'Always include a hex field',
      why: 'It is the only exact, paste-able, shareable representation, and the only precise path for a keyboard user.',
      render: (
        <div className="w-28">
          <TextInput size="sm" defaultValue="#6366F1" aria-label="hex do" className="font-mono uppercase" />
        </div>
      ),
    },
    {
      title: 'Show contrast against the real surface',
      why: 'It is the cheapest possible accessibility intervention: catching the failure while the colour is being chosen rather than in an audit months later.',
      render: <ContrastRow hex="#4338ca" />,
    },
    {
      title: 'Give pale swatches an edge',
      why: 'A white swatch on a white panel is invisible, and the user cannot tell whether the option exists or the picker is broken.',
      render: (
        <Row gap="sm">
          <span className="h-6 w-6 rounded-[var(--radius-sm)] border border-[var(--ds-border-strong)] bg-white" />
          <span className="h-6 w-6 rounded-[var(--radius-sm)] border border-[var(--ds-border-strong)] bg-[#fafafa]" />
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not make the spectrum the only path',
      why: 'Dragging produces #6f66ee rather than #6366f1. Nobody can see the difference and nobody can reproduce it on purpose.',
      render: (
        <span
          aria-hidden
          className="block h-16 w-40 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]"
          style={{
            background:
              'linear-gradient(to right, #fff, #6366f1), linear-gradient(to bottom, transparent, #000)',
            backgroundBlendMode: 'multiply',
          }}
        />
      ),
    },
    {
      title: 'Do not let users pick status colours',
      why: 'Red means failure because the system says so. Making that a preference breaks the meaning across every surface at once.',
      render: (
        <Row gap="sm" align="center">
          <span className="text-caption text-[var(--ds-danger-text)]">Error colour</span>
          <span className="h-5 w-5 rounded-[var(--radius-sm)] bg-[#10b981]" />
        </Row>
      ),
    },
    {
      title: 'Do not identify colours by colour alone',
      why: 'A grid of unlabelled swatches is unusable for anyone with a colour vision deficiency, and unnameable for everyone else.',
      render: (
        <Row gap="sm">
          {['#ef4444', '#f59e0b', '#10b981'].map((c) => (
            <span key={c} className="h-6 w-6 rounded-[var(--radius-sm)]" style={{ background: c }} />
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not offer alpha unless it is used',
      why: 'A transparency slider turns every chosen colour into a value that behaves differently on every background — and users reach for it to make things "softer" when they wanted a lighter shade.',
      render: (
        <span
          aria-hidden
          className="block h-6 w-40 rounded-full"
          style={{
            background:
              'linear-gradient(to right, transparent, #6366f1), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0/8px 8px',
          }}
        />
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'Every swatch needs an edge that survives its own lightness — a 3:1 border, or an inset ring on pale colours.',
      'The selection ring must reach 3:1 against both the swatch and the panel, which is why it is drawn with an offset.',
      'The selected state carries a check as well as a ring, so it does not depend on the ring being visible against that particular colour.',
      'The contrast readout must state a verdict, not only a number. "3.1:1" leaves the reader to remember the thresholds.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the swatch grid, the spectrum, the hex field and the eyedropper as separate stops.' },
      { keys: '← / → / ↑ / ↓', does: 'Moves between swatches, wrapping across rows. The grid is one tab stop with roving focus.' },
      { keys: 'Space / Enter', does: 'Selects the focused swatch.' },
      { keys: '← / →', does: 'On the spectrum, adjusts by one step — this is the non-dragging alternative 2.5.7 requires.' },
      { keys: 'Type', does: 'In the hex field, sets the value live as soon as the string parses.' },
    ],
    aria: [
      { attr: 'role="radiogroup"', on: 'The swatch grid', note: 'One value, mutually exclusive. Each swatch is role="radio" with aria-checked.' },
      { attr: 'aria-label', on: 'Each swatch', note: 'The name and the value: "Indigo #6366f1". A swatch with no name is unusable without colour vision.' },
      { attr: 'role="slider"', on: 'Spectrum axes', note: 'With aria-valuenow and aria-valuetext, so hue and saturation are adjustable by keyboard.' },
      { attr: 'aria-label', on: 'The hex field', note: '"Hex value". It is the precise path and must be findable.' },
      { attr: 'role="status"', on: 'The contrast readout', note: 'Announces the ratio and the verdict as the colour changes, debounced.' },
      { attr: 'aria-invalid', on: 'The hex field', note: 'While the string does not parse, with the last valid colour still applied.' },
    ],
    focus:
      'The swatch grid uses roving tabindex so Tab crosses it once. Selecting a swatch keeps focus on it, so the user can arrow to a neighbour and compare. The hex field keeps its caret when the value is set from elsewhere in the picker.',
    screenReader: [
      'Swatches announce as "Indigo #6366f1, radio button, selected, 1 of 8".',
      'Announce the contrast verdict when it changes: "4.8 to 1, passes AA for text".',
      'The spectrum should announce meaningfully — "hue 243 degrees" — rather than as a bare number between 0 and 360.',
    ],
    touch:
      'Swatches need 44px targets, which usually means six per row rather than twelve. The spectrum needs a non-dragging alternative under WCAG 2.5.7 — arrow-key stepping or numeric fields — and the hex field with a numeric-friendly keyboard is the most reliable path on a phone. The EyeDropper API does not exist on mobile at all, so feature-detect rather than assuming.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { ColorPicker } from '@/ui/Input'

<Field label="Brand colour" description="Used for buttons, links and focus rings.">
  <ColorPicker
    value={brand}
    onChange={setBrand}
    swatches={BRAND_SWATCHES}       // most choices land here
    showContrast={{ against: '#ffffff', level: 'AA' }}
  />
</Field>

// Parse loosely: shorthand, missing hash, uppercase are all the same colour.
function parseHex(input: string): string | null {
  const s = input.trim().replace(/^#/, '').toLowerCase()
  if (/^[0-9a-f]{3}$/.test(s)) return '#' + s.split('').map((c) => c + c).join('')
  if (/^[0-9a-f]{6}$/.test(s)) return '#' + s
  return null
}

// Real contrast, not eyeballed. This is the whole reason to show a readout.
function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const n = hex.slice(1)
    const [r, g, bl] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl)
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Feature-detect: a dead eyedropper button is worse than a missing one.
const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window
async function pick() {
  const { sRGBHex } = await new (window as any).EyeDropper().open()
  onChange(sRGBHex)
}`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-colorpicker">
  <!-- One value, mutually exclusive: a radiogroup, not eight buttons. -->
  <div role="radiogroup" aria-label="Preset colours" class="ds-swatches">
    <button type="button" role="radio" aria-checked="true"
            aria-label="Indigo #6366f1" style="--swatch: #6366f1" tabindex="0">
      <svg aria-hidden="true">…</svg>
    </button>
    <button type="button" role="radio" aria-checked="false"
            aria-label="Violet #8b5cf6" style="--swatch: #8b5cf6" tabindex="-1"></button>
  </div>

  <!-- Keyboard-adjustable: WCAG 2.5.7 needs a non-dragging path. -->
  <div class="ds-spectrum">
    <div role="slider" aria-label="Hue" aria-valuemin="0" aria-valuemax="360"
         aria-valuenow="243" aria-valuetext="243 degrees" tabindex="0"></div>
  </div>

  <label for="hex" class="sr-only">Hex value</label>
  <input id="hex" type="text" value="#6366F1" spellcheck="false"
         autocapitalize="off" class="ds-hex" />

  <p role="status" aria-live="polite">4.8 to 1 on white, passes AA for text</p>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-swatches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.ds-swatches button {
  inline-size: 24px;
  block-size: 24px;
  border-radius: var(--radius-sm);
  background: var(--swatch);
  /* Every swatch needs an edge that survives its own lightness: a white
     swatch on a white panel is otherwise invisible. */
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.12);
}

/* A ring, not a border: a border changes the box size and the whole row
   jumps as the selection moves. */
.ds-swatches [aria-checked='true'] {
  outline: 2px solid var(--ds-fg);
  outline-offset: 2px;
}

.ds-spectrum {
  block-size: 80px;                  /* secondary by design */
  border-radius: var(--radius-md);
  background:
    linear-gradient(to right, #fff, var(--hue)),
    linear-gradient(to bottom, transparent, #000);
  background-blend-mode: multiply;
}

.ds-hex {
  /* 0 and O must be distinguishable in a value people transcribe. */
  font-family: var(--font-mono);
  text-transform: uppercase;
}

@media (pointer: coarse) {
  /* 44px targets mean six per row, not twelve. */
  .ds-swatches { grid-template-columns: repeat(6, 1fr); gap: 10px; }
  .ds-swatches button { inline-size: 44px; block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'ColorPicker',
        props: [
          { name: 'value', type: 'string', required: true, description: 'A six-digit hex string. One canonical format in state, however it was entered.' },
          { name: 'onChange', type: '(hex: string) => void', required: true, description: 'Fires only on a valid parse, so state never holds a half-typed value.' },
          { name: 'swatches', type: '{ hex: string; name: string }[]', description: 'The primary interface. Every swatch needs a name — colour alone is not an identifier.' },
          { name: 'showSpectrum', type: 'boolean', default: 'true', description: 'Turn it off wherever the allowed set is fixed, which is most of the time.' },
          { name: 'showContrast', type: "{ against: string; level: 'AA' | 'AAA' }", description: 'Live ratio and verdict against the surface the colour will actually sit on.' },
          { name: 'alpha', type: 'boolean', default: 'false', description: 'Only enable where transparency is genuinely used. It makes every value background-dependent.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show recently used colours below the swatches. In any tool where people colour many things, the last five cover most of the next choices.',
      'Suggest an accessible neighbour when the chosen colour fails contrast — "try #4338ca" is far more useful than a red badge.',
      'Preview the colour where it will actually be used, not only as a swatch. A brand accent looks different as a 4px focus ring than as a 24px square.',
      'Store one canonical format. Accepting hex, rgb and hsl on input is friendly; storing all three is a bug waiting to happen.',
      'For theme builders, derive the full ramp from the chosen colour rather than asking for ten values. One decision, ten outputs.',
    ],
    performance: [
      'Throttle live preview updates to animation frames. Dragging the spectrum fires far more often than the screen refreshes.',
      'Compute contrast on a debounce, not per pointer event. The maths is cheap but the re-render it triggers is not.',
      'Render the spectrum with CSS gradients rather than a canvas. It scales, it costs nothing, and it survives a device-pixel-ratio change.',
      'Do not put the picker panel in the DOM until it opens. Gradients and swatch grids are pure overhead when closed.',
    ],
    mistakes: [
      'A spectrum with no hex field, so no value can be matched to a brand guideline.',
      'Unlabelled swatches, identifying colours by colour alone.',
      'No edge on pale swatches, making white invisible on a white panel.',
      'A border rather than a ring for selection, so the grid jumps as the selection moves.',
      'Letting users override semantic status colours.',
      'An alpha slider nobody needs, producing values that behave differently on every background.',
      'A drag-only spectrum, failing WCAG 2.5.7.',
      'An eyedropper button on platforms with no EyeDropper API.',
    ],
    realWorld: [
      'In label and tag pickers, twelve swatches with no spectrum is almost always the right control. The freedom of a full picker produces sixty near-identical greens across a workspace.',
      'Theme builders should constrain hard. Users pick colours that fail contrast constantly, and a live verdict at the point of choice prevents more failures than any audit.',
      'The EyeDropper API is genuinely useful for matching an existing brand, and genuinely unavailable on mobile and in Safari. Feature-detect and treat it as a bonus.',
      'If your product has a design system, the honest answer is usually that users should not be picking arbitrary colours at all — offer the palette and keep the meaning intact.',
    ],
  },
})

function SwatchOnly() {
  const [value, setValue] = React.useState('#10b981')
  return (
    <Stack gap="sm" className="items-start">
      <div role="radiogroup" aria-label="Label colour" className="flex flex-wrap gap-2">
        {SWATCHES.map(([hex, name]) => {
          const on = value === hex
          return (
            <button
              key={hex}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${name} ${hex}`}
              onClick={() => setValue(hex)}
              style={{ background: hex }}
              className={cn(
                'grid h-7 w-7 place-items-center rounded-[var(--radius-sm)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
                on && 'ring-2 ring-[var(--ds-fg)] ring-offset-2 ring-offset-[var(--ds-surface)]',
              )}
            >
              {on && <Check size={13} className="text-white" />}
            </button>
          )
        })}
      </div>
      <span className="text-caption text-[var(--ds-fg-muted)]">
        {SWATCHES.find(([h]) => h === value)?.[1]} · {value}
      </span>
    </Stack>
  )
}

function ContrastRow({ hex }: { hex: string }) {
  const ratio = Number(ratioAgainstWhite(hex))
  return (
    <Stack gap="sm">
      <span
        className="grid h-9 place-items-center rounded-[var(--radius-md)] text-label"
        style={{ background: '#ffffff', color: hex }}
      >
        Deploy to production
      </span>
      <Row gap="sm" align="center" className="text-caption">
        <span className="font-mono tabular-nums text-[var(--ds-fg)]">{ratio.toFixed(2)}:1</span>
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] uppercase',
            ratio >= 4.5
              ? 'bg-[var(--ds-success-subtle)] text-[var(--ds-success-text)]'
              : 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]',
          )}
        >
          {ratio >= 4.5 ? 'AA text' : ratio >= 3 ? 'AA large only' : 'Fails'}
        </span>
      </Row>
    </Stack>
  )
}

function LivePreview() {
  const [value, setValue] = React.useState('#6366f1')
  return (
    <PreviewStage minHeight={0} allowResize={false} center={false}>
      <Row gap="lg" align="start" className="w-full">
        <div className="w-40 shrink-0">
          <Picker value={value} onChange={setValue} showContrast={false} compact />
        </div>
        <Stack gap="sm" className="min-w-0 flex-1">
          <button
            type="button"
            className="h-9 rounded-[var(--radius-md)] px-4 text-label font-medium text-white"
            style={{ background: value }}
          >
            Deploy to production
          </button>
          <a href="#/color-picker" className="text-body-sm underline" style={{ color: value }}>
            A link in the same colour
          </a>
          <span
            className="h-9 rounded-[var(--radius-md)] outline-2 outline-offset-2"
            style={{ outlineColor: value }}
          />
        </Stack>
      </Row>
    </PreviewStage>
  )
}
