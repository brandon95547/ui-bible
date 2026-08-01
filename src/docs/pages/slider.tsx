import * as React from 'react'
import { Volume2, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, NumberInput } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  ticks,
  format = (v: number) => String(v),
  disabled,
  size = 'md',
}: {
  value: number
  onChange?: (v: number) => void
  min?: number
  max?: number
  step?: number
  label: string
  ticks?: { value: number; label: string }[]
  format?: (v: number) => string
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const pct = ((value - min) / (max - min)) * 100
  const trackH = size === 'sm' ? 'h-1' : 'h-1.5'
  const thumb = size === 'sm' ? 16 : 20

  return (
    <div className="w-full">
      <div className="relative flex items-center" style={{ blockSize: 20 }}>
        {/* The native input is the control: it brings the full keyboard model,
            the value semantics, and forced-colors support for free. */}
        <input
          type="range"
          aria-label={label}
          // A bare number is often ambiguous read aloud — "70" versus "70 per cent".
          aria-valuetext={format(value)}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 rounded-full',
            trackH,
            disabled ? 'bg-[var(--ds-layer-active)]' : 'bg-[var(--ds-layer-active)]',
          )}
        />
        <span
          aria-hidden
          className={cn(
            'absolute left-0 rounded-full',
            trackH,
            disabled ? 'bg-[var(--ds-border-strong)]' : 'bg-[var(--ds-accent)]',
          )}
          style={{ inlineSize: `${pct}%` }}
        />
        <span
          aria-hidden
          className={cn(
            'absolute rounded-full border-2 bg-white shadow-e2 transition-shadow',
            'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-accent-subtle)]',
            disabled ? 'border-[var(--ds-border-strong)]' : 'border-[var(--ds-accent)]',
          )}
          style={{
            inlineSize: thumb,
            blockSize: thumb,
            insetInlineStart: `calc(${pct}% - ${thumb / 2}px)`,
          }}
        />
      </div>

      {ticks && (
        <div aria-hidden className="relative mt-1.5 h-4">
          {ticks.map((t) => (
            <span
              key={t.value}
              className={cn(
                'absolute -translate-x-1/2 whitespace-nowrap text-caption tabular-nums',
                t.value === value ? 'text-[var(--ds-fg)]' : 'text-[var(--ds-fg-muted)]',
              )}
              style={{ insetInlineStart: `${((t.value - min) / (max - min)) * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState(70)
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [step, setStep] = React.useState<'1' | '5' | '25'>('1')
  const [showValue, setShowValue] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={190}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <Knob label="Step">
            <KnobSelect value={step} onChange={setStep} options={['1', '5', '25'] as const} />
          </Knob>
          <KnobToggle checked={showValue} onChange={setShowValue} label="Value readout" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="Disabled" />
        </div>
      }
      code={`<Field label="Sample rate">
  <Slider
    size="${size}"
    min={0}
    max={100}
    step={${step}}
    value={value}
    onChange={setValue}
    format={(v) => \`\${v}%\`}${disabled ? '\n    disabled' : ''}
  />
</Field>`}
    >
      <div className="w-full max-w-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-label text-[var(--ds-fg-secondary)]">Sample rate</span>
          {showValue && (
            <span className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">
              {value}%
            </span>
          )}
        </div>
        <Slider
          label="Sample rate"
          size={size}
          value={value}
          onChange={setValue}
          step={Number(step)}
          disabled={disabled}
          format={(v) => `${v} per cent`}
        />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'slider',
    title: 'Slider',
    tagline:
      'A value on a continuum, for when the approximate position matters more than the exact figure. If the number matters, pair it with a field.',
    keywords: ['range', 'scrubber', 'track', 'thumb', 'ticks', 'volume', 'zoom'],
  },

  overview: {
    purpose:
      'A slider maps a value onto a physical position. Its strength is that the whole range is visible at once — the user sees where they are relative to the minimum and maximum without reading a number. Its weakness is precision: hitting exactly 47 out of 100 by dragging is genuinely difficult, which is why a slider that needs an exact value needs a number field beside it.',
    whenToUse: [
      'Bounded, continuous values where "about here" is a reasonable answer: volume, opacity, zoom, brightness.',
      'Ranges where seeing the extremes matters — a price filter, a date window.',
      'Values with an immediate, visible effect the user can judge by eye rather than by number.',
    ],
    whenNotToUse: [
      {
        text: 'The exact number matters and dragging cannot reliably reach it.',
        instead: 'a Number Input, or a slider with one beside it',
        to: '#/number-input',
      },
      {
        text: 'There are fewer than about six valid values.',
        instead: 'a Radio Button group or a segmented control',
        to: '#/radio-button',
      },
      {
        text: 'The range spans several orders of magnitude.',
        instead: 'a Number Input with units — a linear track cannot express 1 to 100,000 usefully',
        to: '#/number-input',
      },
      {
        text: 'The value is binary.',
        instead: 'a Switch',
        to: '#/switch',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Build on <code>input[type=range]</code>.</strong> It brings the entire keyboard
          model, correct value semantics, forced-colors support and platform gesture handling for
          free. Style it by overlaying visuals on a transparent native input — a div-based slider
          reimplements all of that and gets some of it wrong.
        </p>
        <p>
          A slider alone answers "roughly where?" and never "exactly what?". Fitts' law makes a
          precise target on a 200px track genuinely hard, so any value the user might need to type
          or verify wants a <strong>number field beside the track</strong>, with both editing the
          same state.
        </p>
        <p>
          The step is the design. Too fine and the user cannot land on a round number; too coarse
          and the control feels notchy. Match the step to how people talk about the value — 5% for
          a percentage, 0.05 for opacity, whole units for a count.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'with-input',
        title: 'Slider plus number field',
        description:
          'The combination that solves both problems: drag for the rough position, type for the exact one. Both edit the same state, and neither is authoritative.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <WithInput />
          </PreviewStage>
        ),
      },
      {
        id: 'ticks',
        title: 'Ticks name the meaningful stops',
        description:
          'Labels on the positions that mean something turn an anonymous track into a scale. Do not label every step — that is a ruler, not a control.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-sm py-2">
              <Slider
                label="Retention"
                value={30}
                min={0}
                max={90}
                step={30}
                format={(v) => `${v} days`}
                ticks={[
                  { value: 0, label: 'Off' },
                  { value: 30, label: '30d' },
                  { value: 60, label: '60d' },
                  { value: 90, label: '90d' },
                ]}
              />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'contextual',
        title: 'With an icon and an immediate effect',
        description:
          'Volume and zoom are the archetypes: the effect is instantly perceivable, so the number is irrelevant and the position is the whole interface.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full max-w-sm">
              <Row gap="sm" align="center" className="w-full">
                <Volume2 size={16} className="shrink-0 text-[var(--ds-fg-muted)]" />
                <div className="flex-1">
                  <Slider label="Volume" value={60} size="sm" format={(v) => `${v} per cent`} />
                </div>
              </Row>
              <Row gap="sm" align="center" className="w-full">
                <ZoomIn size={16} className="shrink-0 text-[var(--ds-fg-muted)]" />
                <div className="flex-1">
                  <Slider
                    label="Zoom"
                    value={150}
                    min={50}
                    max={400}
                    step={25}
                    size="sm"
                    format={(v) => `${v} per cent`}
                  />
                </div>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'precision',
        title: 'Where a slider stops working',
        description:
          'A 200px track over a 0–10,000 range gives each pixel fifty units. No amount of care makes that precise, and the user cannot tell they missed.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="0–100, step 5" tone="good">
                <Slider label="Good range" value={40} step={5} format={(v) => `${v} per cent`} />
              </Cell>
              <Cell label="0–10,000, step 1" tone="bad">
                <Slider
                  label="Bad range"
                  value={4237}
                  min={0}
                  max={10000}
                  format={(v) => String(v)}
                />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <div className="w-40 py-2"><Slider label="a" value={50} /></div> },
      { label: 'Minimum', render: <div className="w-40 py-2"><Slider label="b" value={0} /></div> },
      { label: 'Maximum', render: <div className="w-40 py-2"><Slider label="c" value={100} /></div> },
      { label: 'Small', render: <div className="w-40 py-2"><Slider label="d" value={50} size="sm" /></div> },
      { label: 'Disabled', render: <div className="w-40 py-2"><Slider label="e" value={35} disabled /></div> },
      { label: 'Stepped', render: <div className="w-40 py-2"><Slider label="f" value={50} step={25} /></div> },
      {
        label: 'With ticks',
        render: (
          <div className="w-40 py-2">
            <Slider
              label="g"
              value={50}
              step={50}
              ticks={[
                { value: 0, label: 'Low' },
                { value: 50, label: 'Mid' },
                { value: 100, label: 'High' },
              ]}
            />
          </div>
        ),
      },
      {
        label: 'Readout',
        render: (
          <span className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">70%</span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-sm py-3">
        <Slider
          label="Anatomy"
          value={60}
          step={20}
          ticks={[
            { value: 0, label: '0' },
            { value: 60, label: '60' },
            { value: 100, label: '100' },
          ]}
        />
      </div>
    ),
    caption:
      'A track, a filled portion showing progress from the minimum, a thumb, and tick labels on the positions that mean something.',
    parts: [
      {
        n: 1,
        label: 'Track',
        value: '6px (4px small)',
        kind: 'size',
        note: 'Thin enough to read as a scale rather than a progress bar, thick enough to be a visible target on its own.',
      },
      {
        n: 2,
        label: 'Filled portion',
        value: 'Accent, from the minimum',
        kind: 'color',
        note: 'Shows how far along the range the value sits. It is the difference between "a dot on a line" and "60 out of 100" at a glance.',
      },
      {
        n: 3,
        label: 'Thumb',
        value: '20px (16px small)',
        kind: 'size',
        note: 'A white disc with an accent ring, in both themes. It has to read as a physical object sitting on the track — that metaphor is the whole affordance.',
      },
      {
        n: 4,
        label: 'Hit area',
        value: '44px tall, invisible',
        kind: 'space',
        note: 'The interactive area is far taller than the 6px track. Without it, grabbing the thumb is a test of accuracy rather than an interaction.',
      },
      {
        n: 5,
        label: 'Focus ring',
        value: '3px halo on the thumb',
        kind: 'color',
        note: 'On the thumb, not the track. The thumb is what moves, so it is what has to be visibly focused.',
      },
      {
        n: 6,
        label: 'Ticks',
        value: 'Meaningful stops only',
        kind: 'type',
        note: 'The minimum, the maximum and any position that has a name. Labelling every step turns the control into a ruler.',
      },
      {
        n: 7,
        label: 'Readout',
        value: 'Above right, tabular',
        kind: 'type',
        note: 'Tabular figures so the number does not shift as it changes. Above the track, where it does not compete with the tick labels.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-layer-active', usedFor: 'Unfilled track' },
    { category: 'color', token: '--ds-accent', usedFor: 'Filled track and thumb ring' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Focus halo on the thumb' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Disabled thumb ring and fill' },
    { category: 'color', token: '--ds-fg', usedFor: 'The value readout and the active tick' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Inactive tick labels' },
    { category: 'spacing', token: 'hit area', value: '44px', usedFor: 'Invisible target height around the track' },
    { category: 'radius', token: 'full', usedFor: 'Track and thumb' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Thumb, so it sits above the track' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Readout and tick labels' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Thumb hover and focus — never the position' },
  ],

  sizes: [
    { name: 'Small', height: '4px track', icon: '16px thumb', touch: '44px hit area', use: 'Inline beside an icon — volume, zoom, opacity.' },
    { name: 'Medium', height: '6px track', icon: '20px thumb', touch: '44px hit area', use: 'The default. A labelled form field.' },
    { name: 'Track length', minWidth: '10rem', maxWidth: '24rem', use: 'Below 10rem precision collapses; above 24rem the thumb travels further than the eye wants to follow.' },
    { name: 'Ticks', type: '12px', gap: 'Meaningful stops only', use: 'Minimum, maximum, and any position with a name.' },
    { name: 'Paired field', minWidth: '5rem', use: 'A Number Input beside the track for values that must be exact.' },
  ],

  do: [
    {
      title: 'Build on input[type=range]',
      why: 'It brings the full keyboard model, the value semantics, forced-colors support and platform gestures for free. A div-based slider reimplements all of that and gets some of it wrong.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;input type="range" class="sr-overlay" /&gt;
          <br />
          + styled track and thumb behind it
        </code>
      ),
    },
    {
      title: 'Pair it with a field when the number matters',
      why: 'Dragging to exactly 47 on a 200px track is genuinely hard. The pair gives the user the rough gesture and the exact value without choosing between them.',
      render: <WithInput compact />,
    },
    {
      title: 'Give the value units in aria-valuetext',
      why: '"70" read aloud is ambiguous. "70 per cent" is the value. The native aria-valuenow carries the number; valuetext carries the meaning.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          aria-valuetext="70 per cent"
        </code>
      ),
    },
    {
      title: 'Make the hit area far taller than the track',
      why: 'A 6px target is a test of accuracy. A 44px invisible band around it makes the control feel forgiving without changing how it looks.',
      render: (
        <div className="w-40 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-success-border)] py-3">
          <Slider label="hit area" value={50} />
        </div>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use one for a value that must be exact',
      why: 'The user cannot tell they landed on 4,237 instead of 4,200, and there is nothing on screen that would let them check.',
      render: (
        <div className="w-40 py-2">
          <Slider label="exact" value={4237} min={0} max={10000} />
        </div>
      ),
    },
    {
      title: 'Do not animate the thumb position',
      why: 'The thumb must sit under the pointer. Any transition on its position makes dragging feel like the control is lagging behind the finger.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          transition: inset-inline-start 200ms → drag feels broken
        </span>
      ),
    },
    {
      title: 'Do not hide the value entirely',
      why: 'Without a readout or a labelled effect, the user is guessing. A slider with no feedback is a control that cannot be used deliberately.',
      render: (
        <div className="w-40 py-2">
          <Slider label="no readout" value={37} />
        </div>
      ),
    },
    {
      title: 'Do not label every step',
      why: 'Twenty tick labels on a 240px track overlap into noise and make the control look like measuring equipment rather than something to adjust.',
      render: (
        <div className="w-40 py-2">
          <Slider
            label="too many ticks"
            value={50}
            step={10}
            ticks={Array.from({ length: 11 }, (_, i) => ({ value: i * 10, label: String(i * 10) }))}
          />
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The filled track must reach 3:1 against the unfilled track — the boundary between them is the value.',
      'The thumb must reach 3:1 against both the track and the page background, which is why it is a white disc with a coloured ring rather than a solid fill.',
      'Tick labels are content and owe 4.5:1.',
      'A disabled slider still has to show its value — grey it down, but do not make the position unreadable.',
    ],
    keyboard: [
      { keys: '← / ↓', does: 'Decreases by one step. → / ↑ increases.' },
      { keys: 'Page Up / Page Down', does: 'Moves by a larger increment, conventionally ten steps.' },
      { keys: 'Home / End', does: 'Jumps to the minimum or maximum.' },
      { keys: 'Tab', does: 'Reaches the slider. A range slider has two thumbs and therefore two stops.' },
      { keys: 'Shift + arrows', does: 'Optional fine adjustment on a coarse step. Worth adding when the step is large.' },
    ],
    aria: [
      { attr: 'role="slider"', on: 'The control', note: 'Implicit on input[type=range], which is the reason to build on it.' },
      { attr: 'aria-valuenow / valuemin / valuemax', on: 'The control', note: 'Native and automatic. A div-based slider has to maintain all three by hand, and they drift.' },
      { attr: 'aria-valuetext', on: 'The control', note: 'The value with its units: "70 per cent", "30 days". Without it the number is announced with no meaning attached.' },
      { attr: 'aria-label', on: 'The control', note: 'Or a real label element. An unlabelled slider announces as "slider, 70" with no indication of what it controls.' },
      { attr: 'aria-orientation', on: 'A vertical slider', note: 'Changes which arrow keys are announced as increasing.' },
    ],
    focus:
      'The focus ring is on the thumb, because the thumb is what moves. It must be visible at both ends of the track, which means the halo cannot be clipped by the container — the slider needs vertical padding of its own.',
    screenReader: [
      'Announce as "Sample rate, slider, 70 per cent". The label and the valuetext together are the whole announcement.',
      'Do not announce every intermediate value during a drag. The native control throttles this correctly; a custom one usually does not.',
      'For a two-thumb range, name each end: "Minimum price" and "Maximum price", not "slider" twice.',
    ],
    touch:
      'WCAG 2.5.7 requires a non-dragging alternative, which is why a slider that is the only way to set a value needs a paired field or stepper buttons. The hit area must be at least 44px tall, and the thumb should grow on press so it is not hidden under the finger. Never place a horizontal slider where a horizontal swipe is also a navigation gesture — the two fight, and the slider loses.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Slider } from '@/ui/Input'

<Field label="Sample rate">
  <Slider
    min={0}
    max={100}
    step={5}                        // match how people talk about the value
    value={rate}
    onChange={setRate}
    format={(v) => \`\${v} per cent\`}  // becomes aria-valuetext
  />
</Field>

// Slider + field: the pair that solves both problems at once. Both edit the
// same state; neither is authoritative.
<Row>
  <Slider min={0} max={100} value={value} onChange={setValue} label="Opacity" />
  <NumberInput
    value={value}
    onValueChange={(v) => setValue(clamp(Number(v) || 0, 0, 100))}
    min={0}
    max={100}
    suffix="%"
  />
</Row>

// Style by overlaying on a transparent native input. The native control keeps
// the keyboard model, the value semantics and forced-colors support.
<div className="relative">
  <input type="range" className="absolute inset-0 z-10 w-full opacity-0" />
  <span className="track" />
  <span className="fill"  style={{ inlineSize: \`\${pct}%\` }} />
  <span className="thumb" style={{ insetInlineStart: \`calc(\${pct}% - 10px)\` }} />
</div>`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <div class="ds-slider__head">
    <label for="rate">Sample rate</label>
    <output for="rate">70%</output>
  </div>

  <div class="ds-slider">
    <input
      id="rate"
      type="range"
      min="0"
      max="100"
      step="5"
      value="70"
      aria-valuetext="70 per cent"
    />
    <span class="ds-slider__track" aria-hidden="true"></span>
    <span class="ds-slider__fill"  aria-hidden="true" style="inline-size: 70%"></span>
    <span class="ds-slider__thumb" aria-hidden="true" style="inset-inline-start: 70%"></span>
  </div>

  <div class="ds-slider__ticks" aria-hidden="true">
    <span>0</span><span>50</span><span>100</span>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-slider {
  position: relative;
  display: flex;
  align-items: center;
  /* The track is 6px; the TARGET is 44px. Without this, grabbing the thumb
     is a test of accuracy. */
  block-size: 44px;
}

.ds-slider input[type='range'] {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  opacity: 0;                        /* keeps every native behaviour */
  cursor: pointer;
  margin: 0;
}

.ds-slider__track,
.ds-slider__fill {
  position: absolute;
  block-size: 6px;
  border-radius: 999px;
}
.ds-slider__track { inset-inline: 0; background: var(--ds-layer-active); }
.ds-slider__fill  { inset-inline-start: 0; background: var(--ds-accent); }

/* White disc with a coloured ring: 3:1 against both the track and the page,
   in either theme. */
.ds-slider__thumb {
  position: absolute;
  inline-size: 20px;
  block-size: 20px;
  translate: -50% 0;
  border: 2px solid var(--ds-accent);
  border-radius: 999px;
  background: #fff;
  box-shadow: var(--shadow-e2);
}

/* On the thumb, because the thumb is what moves. */
input[type='range']:focus-visible ~ .ds-slider__thumb {
  box-shadow: 0 0 0 3px var(--ds-accent-subtle);
}

/* Never transition the position: the thumb must sit under the pointer. */
.ds-slider__thumb { transition: box-shadow 120ms, scale 120ms; }

@media (pointer: coarse) {
  /* Grow on press so the thumb is not hidden under the finger. */
  input[type='range']:active ~ .ds-slider__thumb { scale: 1.2; }
}`,
    },
    api: [
      {
        name: 'Slider',
        props: [
          { name: 'value', type: 'number', required: true, description: 'Controlled. Clamp to the range before passing it in.' },
          { name: 'onChange', type: '(v: number) => void', required: true, description: 'Fires continuously during a drag. Debounce anything expensive downstream, not the value itself.' },
          { name: 'min / max', type: 'number', default: '0 / 100', description: 'The visible extremes. If the span exceeds about two orders of magnitude, this is the wrong control.' },
          { name: 'step', type: 'number', default: '1', description: 'The design decision. Match it to how people talk about the value.' },
          { name: 'format', type: '(v: number) => string', description: 'Produces the readout and aria-valuetext. Always include the units.' },
          { name: 'ticks', type: '{ value: number; label: string }[]', description: 'Meaningful stops only. Never one per step.' },
          { name: 'label', type: 'string', required: true, description: 'Accessible name. An unlabelled slider announces as "slider, 70".' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show the effect live wherever you can. A brightness slider that only updates on release is a slider the user has to guess at.',
      'Snap to meaningful values with the step rather than letting people land on 47.3. Round numbers are what users mean and what they will report back to you.',
      'For a two-thumb range, stop the thumbs crossing and never let them fully overlap — an invisible thumb is an unusable one.',
      'Put the readout above the track, not below. Tick labels live below, and stacking both there makes the control taller than it needs to be.',
      'Double-click or a Reset control to return to the default is worth adding on any slider people will experiment with.',
    ],
    performance: [
      'Throttle expensive side effects to animation frames. A slider driving a canvas re-render fires far more often than the screen refreshes.',
      'Update the thumb with transform rather than an inset property, so dragging does not force layout on every pointer event.',
      'Keep the drag value in local state and lift it on release when the parent tree is large — a re-render of a whole form on every pointermove is visible.',
      'Never transition the thumb position. It costs nothing to compute and makes the control feel broken.',
    ],
    mistakes: [
      'Rebuilding the slider from divs, losing the keyboard model, the value semantics and forced-colors support.',
      'A 6px hit area, making the thumb a test of accuracy.',
      'No aria-valuetext, so "70" is announced with no units or meaning.',
      'Animating the thumb position, which makes dragging feel laggy.',
      'A range so wide that each pixel is fifty units, with nothing on screen to reveal the imprecision.',
      'A tick label per step, turning the control into a ruler.',
      'No non-dragging alternative, which fails WCAG 2.5.7 for anyone who cannot drag.',
    ],
    realWorld: [
      'Volume, brightness and zoom are the cases where a slider is unambiguously right: the effect is immediate and perceivable, so the number never matters.',
      'Price filters almost always need a paired field. Users have an exact budget in mind and cannot drag to it.',
      'On touch, a slider inside a horizontally scrolling area is a permanent conflict. Move it out of the scroll region or make it vertical.',
      'If your analytics show users overwhelmingly landing on the default, the slider is decoration — ship the default and let them change it somewhere else.',
    ],
  },
})

function WithInput({ compact }: { compact?: boolean }) {
  const [value, setValue] = React.useState(47)
  return (
    <div className={cn('w-full', compact ? 'max-w-[16rem]' : 'max-w-sm')}>
      <Field label={compact ? undefined : 'Opacity'}>
        <Row gap="sm" align="center" className="w-full">
          <div className="min-w-0 flex-1">
            <Slider
              label="Opacity"
              value={value}
              onChange={setValue}
              format={(v) => `${v} per cent`}
            />
          </div>
          <div className="w-[5.5rem] shrink-0">
            <NumberInput
              size="sm"
              value={value}
              min={0}
              max={100}
              suffix="%"
              aria-label="Opacity"
              onValueChange={(v) => setValue(typeof v === 'number' ? v : 0)}
            />
          </div>
        </Row>
      </Field>
    </div>
  )
}
