import * as React from 'react'
import { Clock, Globe } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Field, TextInput } from '@/ui/Input'
import { NativeSelect } from '@/ui/Select'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/** Minutes since midnight → a display string. Deterministic, no Date. */
function fmt(mins: number, hour12: boolean) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (!hour12) return `${pad(h)}:${pad(m)}`
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${pad(m)} ${suffix}`
}

function TimeList({
  value,
  onChange,
  interval = 30,
  hour12,
  from = 0,
  to = 24 * 60,
  disabledBefore,
}: {
  value: number
  onChange?: (v: number) => void
  interval?: number
  hour12: boolean
  from?: number
  to?: number
  disabledBefore?: number
}) {
  const listRef = React.useRef<HTMLUListElement>(null)
  const slots: number[] = []
  for (let t = from; t < to; t += interval) slots.push(t)

  // Scroll the current value into view on open — a list that opens at 00:00
  // when the value is 17:30 makes the user scroll past thirty-five rows.
  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Time"
      className="max-h-56 w-[9rem] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-1 shadow-e4"
    >
      {slots.map((t) => {
        const on = t === value
        const disabled = disabledBefore != null && t < disabledBefore
        return (
          <li key={t}>
            <button
              type="button"
              role="option"
              aria-selected={on}
              disabled={disabled}
              onClick={() => onChange?.(t)}
              className={cn(
                'flex w-full items-center rounded-[var(--radius-md)] px-2 py-1.5 text-left font-mono text-caption tabular-nums',
                'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--ds-focus-ring)]',
                disabled
                  ? 'cursor-not-allowed text-[var(--ds-fg-disabled)]'
                  : on
                    ? 'bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]'
                    : 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]',
              )}
            >
              {fmt(t, hour12)}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Playground() {
  const [value, setValue] = React.useState(17 * 60 + 30)
  const [interval, setInterval] = React.useState<'15' | '30' | '60'>('30')
  const [hour12, setHour12] = React.useState(false)
  const [zone, setZone] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={360}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Interval">
            <KnobSelect
              value={interval}
              onChange={setInterval}
              options={['15', '30', '60'] as const}
            />
          </Knob>
          <KnobToggle checked={hour12} onChange={setHour12} label="12-hour" />
          <KnobToggle checked={zone} onChange={setZone} label="Time zone" />
        </div>
      }
      code={`<Field label="Deployment window" description="Times are in Europe/London.">
  <TimePicker
    value={value}
    onChange={setValue}
    interval={${interval}}
    hour12={${hour12}}
  />
</Field>`}
    >
      <Stack gap="md" className="w-full max-w-xs">
        <Field
          label="Deployment window"
          description={zone ? 'Times are in Europe/London (BST, UTC+1).' : undefined}
        >
          <Row gap="sm" align="center" className="w-full">
            <div className="min-w-0 flex-1">
              <TextInput
                value={fmt(value, hour12)}
                onChange={() => {}}
                endIcon={<Clock />}
                aria-label="Time"
                className="font-mono tabular-nums"
              />
            </div>
            {zone && (
              <div className="w-[8.5rem] shrink-0">
                <NativeSelect
                  size="md"
                  aria-label="Time zone"
                  defaultValue="London"
                  options={[
                    { value: 'London', label: 'Europe/London' },
                    { value: 'NY', label: 'America/New_York' },
                    { value: 'Tokyo', label: 'Asia/Tokyo' },
                  ]}
                />
              </div>
            )}
          </Row>
        </Field>
        <TimeList
          value={value}
          onChange={setValue}
          interval={Number(interval)}
          hour12={hour12}
        />
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'time-picker',
    title: 'Time Picker',
    tagline:
      'Discrete time entry. A stepped list beats a clock face on every device that has a keyboard — and most of the ones that do not.',
    keywords: ['clock', 'duration', '12 hour', '24 hour', 'interval', 'timezone', 'meridiem'],
  },

  overview: {
    purpose:
      'A time picker collects a time of day. Almost all real times are round — a meeting at 14:30, a deployment window at 02:00, a delivery slot between 9 and 11 — which is why a list of sensible increments outperforms a control that offers all 1,440 minutes. The interval is the design decision: get it right and most users pick in one click.',
    whenToUse: [
      'Scheduling, booking and reminder flows where the time falls on a round increment.',
      'Business-hours ranges, delivery windows and appointment slots.',
      'Any time paired with a date, where the two must be read as one value.',
    ],
    whenNotToUse: [
      {
        text: 'You need a date as well and the time is incidental.',
        instead: 'a Date Picker with a time field beside it',
        to: '#/date-picker',
      },
      {
        text: 'The value is a length rather than a moment.',
        instead: 'a Number Input with units — "30 minutes" is a quantity, not a time',
        to: '#/number-input',
      },
      {
        text: 'Only a few fixed slots are available.',
        instead: 'a Select or Radio Button — a picker over four options is work',
        to: '#/select',
      },
      {
        text: 'The precision needed is seconds or finer.',
        instead: 'a Text Field with a strict format hint',
        to: '#/text-field',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>A list beats a clock face.</strong> Analogue clock pickers came from phones with
          no keyboard, and even there they are slow: two dial interactions to express what "1430"
          says in four keystrokes. A stepped list scrolls, filters as you type, and works
          identically with a mouse, a keyboard and a thumb.
        </p>
        <p>
          The <strong>interval determines whether the list is usable</strong>. Fifteen minutes over
          a full day is ninety-six rows; thirty is forty-eight; an hour is twenty-four. Constrain
          the range to the hours that are actually valid and the list stops being a scroll and
          starts being a choice.
        </p>
        <p>
          A time without a zone is ambiguous the moment two people look at it. Show the zone under
          the field, and if users span regions, make it a field of its own — the assumption that
          everyone is in the server's zone is one of the most durable sources of scheduling bugs.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'interval',
        title: 'The interval is the design',
        description:
          'The same list at 15, 30 and 60 minutes. Ninety-six rows is a scroll; twenty-four is a choice. Pick the coarsest interval the task tolerates.',
        render: (
          <PreviewStage minHeight={280} center={false}>
            <Row gap="lg" align="start">
              {([15, 30, 60] as const).map((i) => (
                <Stack key={i} gap="xs" className="items-center">
                  <span className="text-caption text-[var(--ds-fg-muted)]">{i} min</span>
                  <TimeList value={17 * 60 + 30} interval={i} hour12={false} from={16 * 60} to={20 * 60} />
                </Stack>
              ))}
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'constrained',
        title: 'Constrain the range',
        description:
          'A booking window of 09:00–17:00 at 30 minutes is sixteen rows. The same picker unconstrained is forty-eight, and thirty-two of them are never valid.',
        render: (
          <PreviewStage minHeight={280} center={false}>
            <Grid min="15rem">
              <Cell label="Business hours" sub="16 rows" tone="good">
                <TimeList value={9 * 60 + 30} interval={30} hour12={false} from={9 * 60} to={17 * 60} />
              </Cell>
              <Cell label="Full day" sub="48 rows" tone="bad">
                <TimeList value={9 * 60 + 30} interval={30} hour12={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'formats',
        title: '12-hour and 24-hour',
        description:
          'A locale preference, not a design one. 24-hour is unambiguous and sorts correctly; 12-hour is what most of the US and UK read naturally. Follow the user’s locale.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="24-hour" tone="good">
                <Row gap="sm" className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">
                  <span>09:00</span>
                  <span>14:30</span>
                  <span>23:45</span>
                </Row>
              </Cell>
              <Cell label="12-hour" tone="good">
                <Row gap="sm" className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">
                  <span>9:00 am</span>
                  <span>2:30 pm</span>
                  <span>11:45 pm</span>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'zone',
        title: 'Time zones are part of the value',
        description:
          'A time with no zone is ambiguous between any two people. State it under the field, and make it editable where users span regions.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-sm">
              <Row gap="sm" align="center" className="w-full">
                <div className="min-w-0 flex-1">
                  <TextInput
                    defaultValue="14:30"
                    endIcon={<Clock />}
                    aria-label="Time"
                    className="font-mono tabular-nums"
                  />
                </div>
                <div className="w-[9rem] shrink-0">
                  <NativeSelect
                    aria-label="Time zone"
                    defaultValue="London"
                    options={[
                      { value: 'London', label: 'Europe/London' },
                      { value: 'NY', label: 'America/New_York' },
                    ]}
                  />
                </div>
              </Row>
              <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-muted)]">
                <Globe size={12} />
                <span>14:30 BST is 09:30 in New York and 22:30 in Tokyo.</span>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Idle field',
        render: <div className="w-32"><TextInput placeholder="--:--" endIcon={<Clock />} aria-label="a" className="font-mono" /></div>,
      },
      {
        label: 'Filled',
        render: <div className="w-32"><TextInput defaultValue="14:30" endIcon={<Clock />} aria-label="b" className="font-mono tabular-nums" /></div>,
      },
      {
        label: 'Invalid',
        render: <div className="w-32"><TextInput defaultValue="25:70" status="error" endIcon={<Clock />} aria-label="c" className="font-mono" /></div>,
      },
      {
        label: 'Slot idle',
        render: (
          <span className="block w-24 rounded-[var(--radius-md)] px-2 py-1.5 font-mono text-caption tabular-nums text-[var(--ds-fg-secondary)]">
            14:30
          </span>
        ),
      },
      {
        label: 'Slot selected',
        render: (
          <span className="block w-24 rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle)] px-2 py-1.5 font-mono text-caption tabular-nums text-[var(--ds-fg)]">
            14:30
          </span>
        ),
      },
      {
        label: 'Slot disabled',
        render: (
          <span className="block w-24 rounded-[var(--radius-md)] px-2 py-1.5 font-mono text-caption tabular-nums text-[var(--ds-fg-disabled)]">
            09:00
          </span>
        ),
      },
      {
        label: '12-hour',
        render: (
          <span className="block w-24 rounded-[var(--radius-md)] px-2 py-1.5 font-mono text-caption tabular-nums text-[var(--ds-fg-secondary)]">
            2:30 pm
          </span>
        ),
      },
      {
        label: 'Zone note',
        render: <span className="text-caption text-[var(--ds-fg-muted)]">Europe/London (BST)</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <Stack gap="sm" className="w-full max-w-xs items-start">
        <div className="w-32">
          <TextInput
            defaultValue="17:30"
            endIcon={<Clock />}
            aria-label="Time"
            className="font-mono tabular-nums"
          />
        </div>
        <TimeList value={17 * 60 + 30} interval={30} hour12={false} from={16 * 60} to={20 * 60} />
      </Stack>
    ),
    caption:
      'A typeable field with a clock affordance, and a list of increments that opens scrolled to the current value.',
    parts: [
      {
        n: 1,
        label: 'Field width',
        value: '7–9rem',
        kind: 'size',
        note: 'Sized to the longest format — "11:45 pm" is wider than "23:45". Never full width: the field’s width is a hint about what goes in it.',
      },
      {
        n: 2,
        label: 'Type',
        value: 'Monospace, tabular',
        kind: 'type',
        note: 'So a column of times aligns on the colon, and so the field does not shift as digits change.',
      },
      {
        n: 3,
        label: 'List width',
        value: '9rem, matched to the field',
        kind: 'size',
        note: 'Narrow, because every row is five to eight characters. A full-width list of times looks like a mistake.',
      },
      {
        n: 4,
        label: 'Slot height',
        value: '30px (44px on touch)',
        kind: 'size',
        note: 'Dense, because the list is scanned rather than read. Touch needs the full 44px or adjacent slots are mis-tapped.',
      },
      {
        n: 5,
        label: 'Initial scroll',
        value: 'Current value centred',
        kind: 'motion',
        note: 'A list that opens at 00:00 when the value is 17:30 makes the user scroll past thirty-five rows to see where they are.',
      },
      {
        n: 6,
        label: 'Interval',
        value: '15 / 30 / 60 min',
        kind: 'space',
        note: 'The design decision. Coarser is better wherever the task tolerates it — the list length is the interval divided into the range.',
      },
      {
        n: 7,
        label: 'Zone note',
        value: 'Under the field',
        kind: 'type',
        note: 'A time without a zone is ambiguous the moment a second person reads it.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Field fill' },
    { category: 'color', token: '--ds-border-interactive', usedFor: 'Field border' },
    { category: 'color', token: '--ds-accent', usedFor: 'Focus border' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Slot list panel' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Selected slot' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Slot hover' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Clock icon and the zone note' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Unavailable slots' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Field and slot corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Panel corners' },
    { category: 'typography', token: 'font-mono + tabular-nums', usedFor: 'Times, so they align on the colon' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
  ],

  sizes: [
    { name: 'Small', height: '32px field', minWidth: '6rem', type: '13px', use: 'In a table filter or beside a compact date field.' },
    { name: 'Medium', height: '36px field', minWidth: '7rem', type: '15px', use: 'The default. 9rem when the format is 12-hour.' },
    { name: 'Large', height: '44px field', minWidth: '8rem', type: '16px', use: 'Touch layouts and booking flows.' },
    { name: 'Slot list', minWidth: '9rem', height: 'max 224px', use: 'About eight rows before scrolling, opened at the current value.' },
    { name: 'Slot', height: '30px', padding: '0 8px', touch: '44px on coarse pointers', use: 'Dense — every row is a handful of characters.' },
  ],

  do: [
    {
      title: 'Constrain the range to what is valid',
      why: '09:00–17:00 at thirty minutes is sixteen rows. The same picker unconstrained is forty-eight, and two thirds of them can never be chosen.',
      render: (
        <div className="w-32">
          <TimeList value={9 * 60 + 30} interval={30} hour12={false} from={9 * 60} to={12 * 60} />
        </div>
      ),
    },
    {
      title: 'Open the list at the current value',
      why: 'A list that starts at 00:00 when the value is 17:30 hides the user’s own selection thirty-five rows down.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          selected?.scrollIntoView({'{'} block: 'center' {'}'})
        </code>
      ),
    },
    {
      title: 'Let the field be typed into',
      why: '"1430" is four keystrokes. Scrolling to 14:30 in a list is a scroll and a click, and the user usually already knows the time.',
      render: (
        <div className="w-32">
          <TextInput defaultValue="14:30" endIcon={<Clock />} aria-label="typed" className="font-mono tabular-nums" />
        </div>
      ),
    },
    {
      title: 'State the time zone',
      why: 'A time with no zone is ambiguous the moment a second person reads it, and scheduling bugs from this assumption surface weeks later.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Times are in Europe/London (BST, UTC+1).
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use an analogue clock face',
      why: 'Two dial interactions to express what four keystrokes say. It came from phones with no keyboard and it is slow even there.',
      render: (
        <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--ds-danger-border)] text-caption text-[var(--ds-danger-text)]">
          ⌚
        </span>
      ),
    },
    {
      title: 'Do not offer every minute',
      why: '1,440 rows is not a list. Almost every real time is round, and the few that are not can be typed.',
      render: (
        <div className="w-24">
          <TimeList value={9 * 60 + 3} interval={1} hour12={false} from={9 * 60} to={9 * 60 + 12} />
        </div>
      ),
    },
    {
      title: 'Do not make the field full width',
      why: 'Field width is a hint about the value. A time field stretched across a form reads as somewhere to type a sentence.',
      render: (
        <div className="w-full max-w-sm">
          <TextInput defaultValue="14:30" endIcon={<Clock />} aria-label="wide" className="font-mono" />
        </div>
      ),
    },
    {
      title: 'Do not assume the server’s time zone',
      why: 'Your 09:00 window is someone else’s 04:00. If users span regions, the zone is part of the value and needs its own control.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          “Deploy at 02:00” → whose 02:00?
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.5', name: 'Identify Input Purpose', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '3.3.2', name: 'Labels or Instructions', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The selected slot must be distinguishable from the hover state, or the user cannot tell what is chosen while the pointer is in the list.',
      'Disabled slots may use the disabled tone, and must also carry the disabled attribute so the unavailability is exposed rather than merely dimmed.',
      'The zone note is content and owes 4.5:1 — it is part of the value.',
      'Monospace times at 12px still owe 4.5:1; small tabular figures are easy to under-contrast.',
    ],
    keyboard: [
      { keys: '↓', does: 'Opens the list and highlights the current value. Focus stays in the field.' },
      { keys: '↑ / ↓', does: 'Moves the highlight one slot, wrapping at the ends.' },
      { keys: 'Page Up / Page Down', does: 'Moves by an hour, which is the useful jump in a list of thirty-minute slots.' },
      { keys: 'Home / End', does: 'Jumps to the first or last available slot.' },
      { keys: '0–9', does: 'Types directly into the field. "1430" and "2:30 pm" must both parse.' },
      { keys: 'Enter', does: 'Commits the highlighted slot; Esc closes without changing anything.' },
    ],
    aria: [
      { attr: 'role="combobox"', on: 'The field', note: 'With aria-expanded and aria-activedescendant, exactly as in a Combobox. Focus never leaves the field.' },
      { attr: 'role="listbox" / "option"', on: 'The slot list', note: 'With aria-selected on the current value.' },
      { attr: 'aria-label', on: 'Each slot', note: 'The spoken form: "half past two in the afternoon" is unnecessary, but "14:30" must be announced as a time, not as digits.' },
      { attr: 'aria-describedby', on: 'The field', note: 'Points at the zone note and the expected format, both read before typing.' },
      { attr: 'aria-invalid', on: 'The field', note: 'On an unparseable value, with a message giving an example rather than a rule.' },
      { attr: 'autocomplete', on: 'The field', note: 'Where the platform supports it, so a saved time can be filled.' },
    ],
    focus:
      'Focus stays in the field for the whole interaction, with the highlight moved by aria-activedescendant. Choosing a slot closes the list and leaves focus in the field with the value filled, so the user can immediately correct it.',
    screenReader: [
      'Announce the slot count when the list opens: "16 times available".',
      'Announce the zone with the value on commit: "14:30, Europe/London".',
      'For constrained ranges, say why in the description — "Between 09:00 and 17:00" — rather than leaving the user to discover it by finding rows disabled.',
    ],
    touch:
      'Slots go to 44px, and native input[type=time] is worth serious consideration on mobile — the platform picker is familiar and free. Set inputmode="numeric" on the field so the numeric keypad appears. A 12-hour picker on touch should show am/pm as a segmented control rather than expecting the user to type it.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { TimePicker } from '@/ui/Input'

<Field label="Deployment window" description="Times are in Europe/London (BST).">
  <TimePicker
    value={time}                    // minutes since midnight
    onChange={setTime}
    interval={30}                   // the design decision
    min={9 * 60}                    // constrain to what is valid…
    max={17 * 60}                   // …and the list stops being a scroll
    hour12={locale.hour12}
  />
</Field>

// Parse loosely. "1430", "14:30", "2:30 pm" and "2.30pm" are one time.
function parseTime(input: string): number | null {
  const s = input.trim().toLowerCase()
  const m = /^(\\d{1,2})[:.]?(\\d{2})?\\s*(am|pm)?$/.exec(s)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2] ?? 0)
  if (m[3] === 'pm' && h < 12) h += 12
  if (m[3] === 'am' && h === 12) h = 0
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

// Open at the current value. A list that starts at 00:00 hides the user's
// own selection thirty-five rows down.
React.useEffect(() => {
  if (!open) return
  listRef.current
    ?.querySelector('[aria-selected="true"]')
    ?.scrollIntoView({ block: 'center' })
}, [open])

// Store the instant, not the wall-clock time, whenever a date is involved.
const instant = zonedTimeToUtc(setMinutes(setHours(date, h), m), zone)`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-field">
  <label for="time">Deployment window</label>
  <p id="time-hint">Times are in Europe/London (BST). Between 09:00 and 17:00.</p>

  <input
    id="time"
    type="text"
    inputmode="numeric"
    role="combobox"
    aria-expanded="true"
    aria-controls="time-list"
    aria-activedescendant="slot-1730"
    aria-describedby="time-hint"
    autocomplete="off"
    value="17:30"
  />
</div>

<ul id="time-list" role="listbox" aria-label="Time">
  <li id="slot-1700" role="option" aria-selected="false">17:00</li>
  <li id="slot-1730" role="option" aria-selected="true">17:30</li>
  <li id="slot-1800" role="option" aria-selected="false" aria-disabled="true">18:00</li>
</ul>`,
    },
    css: {
      lang: 'css',
      code: `.ds-timepicker input {
  /* Width is a hint about the value. "11:45 pm" is the widest case. */
  inline-size: 7rem;
  block-size: 36px;
  padding-inline: 12px 32px;
  border: 1px solid var(--ds-border-interactive);
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
  /* Aligns a column of times on the colon and stops the field shifting. */
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.ds-timepicker__list {
  inline-size: 9rem;
  max-block-size: 224px;             /* ~8 rows, then scroll */
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
  /* Slots snap so a flick lands on a row rather than between two. */
  scroll-snap-type: y proximity;
}

[role='option'] {
  block-size: 30px;
  padding-inline: 8px;
  border-radius: var(--radius-md);
  scroll-snap-align: center;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--ds-fg-secondary);
}

[role='option'][aria-selected='true'] {
  background: var(--ds-accent-subtle);
  color: var(--ds-fg);
}
[role='option'][aria-disabled='true'] { color: var(--ds-fg-disabled); }

@media (pointer: coarse) {
  [role='option'] { block-size: 44px; }
  .ds-timepicker input { block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'TimePicker',
        props: [
          { name: 'value', type: 'number | null', required: true, description: 'Minutes since midnight. Not a Date — a time of day has no date attached.' },
          { name: 'onChange', type: '(v: number | null) => void', required: true, description: 'Fires on slot selection and on a successful parse from the field.' },
          { name: 'interval', type: 'number', default: '30', description: 'Minutes between slots. Coarser is better wherever the task tolerates it.' },
          { name: 'min / max', type: 'number', description: 'Minutes since midnight. Constrains the list rather than merely rejecting on submit.' },
          { name: 'hour12', type: 'boolean', default: 'locale default', description: 'A locale preference, not a design one.' },
          { name: 'disabledTimes', type: '(mins: number) => boolean', description: 'For availability. Disabled slots stay in the list so the pattern of availability is visible.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Pair the picker with a duration rather than an end time where you can. "30 minutes" is easier to choose than "15:00", and it stays correct when the start moves.',
      'Show the equivalent in the viewer’s zone when scheduling across regions: "14:30 BST — 09:30 your time" prevents most double-bookings.',
      'Default to the next sensible slot rather than empty. The next half hour, or the start of business hours, removes an interaction for most users.',
      'Show slot availability inline for booking flows. A greyed 14:30 with "fully booked" beside it is more useful than a hidden row.',
      'On mobile, consider native input[type=time] outright — familiar, accessible, and free to maintain.',
    ],
    performance: [
      'Generate the slot list once per range and interval, memoised. Rebuilding forty-eight rows on every keystroke while the user types is unnecessary work.',
      'Virtualise only if you have somehow ended up with a minute-level list, which is itself the problem to fix.',
      'Format times with a cached Intl.DateTimeFormat instance. Constructing one per row is a measurable cost in a long list.',
      'Keep the value as minutes since midnight rather than a Date. It sidesteps daylight-saving arithmetic entirely until a date is actually attached.',
    ],
    mistakes: [
      'An analogue clock face, which is slower than typing on every device.',
      'Minute-level granularity, producing a list nobody can use.',
      'A list that opens at 00:00 instead of the current value.',
      'A read-only field, so "1430" cannot be typed.',
      'No time zone stated, making the value ambiguous between any two people.',
      'A full-width field, misrepresenting how much goes in it.',
      'Proportional figures, so a column of times does not align on the colon.',
      'Availability enforced only on submit rather than shown in the list.',
    ],
    realWorld: [
      'Booking flows are where this control matters most, and availability is the real content — the times themselves are trivial by comparison.',
      'Cross-zone scheduling is where teams lose the most time. Showing both zones side by side costs one line and prevents a category of mistake.',
      'Users type far more than they scroll once they know the field accepts it. Loose parsing is worth more than any refinement to the list.',
      'For anything recurring, the time is usually a preference rather than a per-instance choice. Consider collecting it once in settings instead of on every form.',
    ],
  },
})
