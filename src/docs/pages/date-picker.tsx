import * as React from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/Button'
import { Field, TextInput } from '@/ui/Input'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Deterministic: no Date.now() anywhere, so the page renders identically
    in every environment and the examples never drift. */
const TODAY = { y: 2026, m: 6, d: 21 } // 21 July 2026

function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}
/** Monday-first offset for the 1st of the month. */
function startOffset(y: number, m: number) {
  return (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7
}

function Calendar({
  value,
  onChange,
  range,
  disabledBefore,
  compact,
}: {
  value: { y: number; m: number; d: number } | null
  onChange?: (v: { y: number; m: number; d: number }) => void
  range?: { start: number | null; end: number | null }
  disabledBefore?: number
  compact?: boolean
}) {
  const [view, setView] = React.useState({ y: value?.y ?? TODAY.y, m: value?.m ?? TODAY.m })
  const total = daysInMonth(view.y, view.m)
  const offset = startOffset(view.y, view.m)
  const cell = compact ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 text-caption'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-overlay)] p-3 shadow-e4',
        compact ? 'w-[15rem]' : 'w-[16.5rem]',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { ...v, m: v.m - 1 }))}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <ChevronLeft size={14} />
        </button>
        {/* aria-live so a keyboard user hears the month change as they page. */}
        <span aria-live="polite" className="text-label text-[var(--ds-fg)]">
          {MONTHS[view.m]} {view.y}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { ...v, m: v.m + 1 }))}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div role="grid" aria-label={`${MONTHS[view.m]} ${view.y}`}>
        <div role="row" className="mb-1 grid grid-cols-7 gap-0.5">
          {DOW.map((d) => (
            <span
              key={d}
              role="columnheader"
              aria-label={d}
              className={cn('grid place-items-center text-[10px] text-[var(--ds-fg-muted)]', cell)}
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad-${i}`} className={cell} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const d = i + 1
            const isToday = view.y === TODAY.y && view.m === TODAY.m && d === TODAY.d
            const isSelected = !!value && value.y === view.y && value.m === view.m && value.d === d
            const inRange =
              range?.start != null && range.end != null && d >= range.start && d <= range.end
            const isEdge = range?.start === d || range?.end === d
            const disabled = disabledBefore != null && d < disabledBefore

            return (
              <button
                key={d}
                type="button"
                role="gridcell"
                disabled={disabled}
                aria-selected={isSelected || isEdge}
                aria-current={isToday ? 'date' : undefined}
                // The full date, never a bare number: "14" is meaningless read aloud.
                aria-label={`${d} ${MONTHS[view.m]} ${view.y}`}
                onClick={() => onChange?.({ y: view.y, m: view.m, d })}
                className={cn(
                  'grid place-items-center rounded-[var(--radius-md)] tabular-nums transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]',
                  cell,
                  disabled && 'cursor-not-allowed text-[var(--ds-fg-disabled)]',
                  !disabled && !isSelected && !isEdge && 'text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)]',
                  inRange && !isEdge && 'rounded-none bg-[var(--ds-accent-subtle)] text-[var(--ds-fg)]',
                  (isSelected || isEdge) && 'bg-[var(--ds-accent)] font-medium text-[var(--ds-fg-on-accent)]',
                  // Today is a ring, never a fill — otherwise it competes with
                  // the selection for the same visual channel.
                  isToday && !isSelected && !isEdge && 'ring-1 ring-inset ring-[var(--ds-accent-border)]',
                )}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Playground() {
  const [value, setValue] = React.useState<{ y: number; m: number; d: number } | null>({
    y: 2026,
    m: 6,
    d: 21,
  })
  const [size, setSize] = React.useState<'sm' | 'md'>('md')
  const [typeable, setTypeable] = React.useState(true)
  const [restricted, setRestricted] = React.useState(false)

  const pretty = value ? `${value.d} ${MONTHS[value.m]} ${value.y}` : ''

  return (
    <PreviewStage
      label="Playground"
      minHeight={400}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['sm', 'md'] as const} />
          </Knob>
          <KnobToggle checked={typeable} onChange={setTypeable} label="Typeable" />
          <KnobToggle checked={restricted} onChange={setRestricted} label="Min date" />
        </div>
      }
      code={`<Field label="Deployment date" description="Times are shown in Europe/London.">
  <DatePicker
    size="${size}"
    value={value}
    onChange={setValue}${restricted ? '\n    min={new Date()}' : ''}
    ${typeable ? 'typeable' : 'typeable={false}'}
  />
</Field>`}
    >
      <Stack gap="md" className="w-full max-w-xs">
        <Field
          label="Deployment date"
          description="Times are shown in Europe/London."
        >
          <TextInput
            size={size}
            readOnly={!typeable}
            value={pretty}
            onChange={() => {}}
            endIcon={<CalendarDays />}
            aria-label="Deployment date"
          />
        </Field>
        <Calendar
          value={value}
          onChange={setValue}
          compact={size === 'sm'}
          disabledBefore={restricted ? TODAY.d : undefined}
        />
      </Stack>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'date-picker',
    title: 'Date Picker',
    tagline:
      'A calendar you can also type into. Ranges, presets, disabled dates — and the time-zone question you must answer before you build it.',
    keywords: ['calendar', 'range', 'presets', 'timezone', 'locale', 'min max', 'grid'],
  },

  overview: {
    purpose:
      'A date picker offers two ways to reach the same value: a grid for dates that are easier to find than to name — next Tuesday, the last Friday of the quarter — and a text field for dates the user already knows. Which one dominates depends entirely on the task. Booking flows need the calendar; a date of birth needs the field, and forcing someone born in 1974 to page back six hundred months is the classic failure of this component.',
    whenToUse: [
      'Choosing a date where the day of the week or its position in the month matters.',
      'Ranges — reporting windows, bookings, filters — where the span is easier to see than to describe.',
      'Dates constrained by availability, where invalid days must be visibly unavailable.',
    ],
    whenNotToUse: [
      {
        text: 'The user knows the exact date, such as a birthday.',
        instead: 'a Text Field with a format hint — typing beats six hundred pages of calendar',
        to: '#/text-field',
      },
      {
        text: 'Only a time of day is needed.',
        instead: 'a Time Picker',
        to: '#/time-picker',
      },
      {
        text: 'The choice is really a preset.',
        instead: 'a Select or Radio Button — "Last 7 days" is a value, not a date',
        to: '#/select',
      },
      {
        text: 'The date is a rough duration.',
        instead: 'a Number Input with units, which is what the user is actually thinking in',
        to: '#/number-input',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Always allow typing.</strong> The calendar is an aid, not a gate. Users who know
          their date want to type it, and any picker that forces navigation punishes exactly the
          people who were fastest. Parse loosely — accept <code>21/07/2026</code>,{' '}
          <code>2026-07-21</code> and <code>21 Jul 2026</code> — and reformat on blur.
        </p>
        <p>
          The grid is a <strong>grid</strong>, and its keyboard model is the whole component:
          arrows move by day, Page Up and Page Down by month, Home and End to the ends of the week.
          Without it a calendar is a mouse-only control, and 2.1.1 is not optional.
        </p>
        <p>
          Decide the <strong>time zone before you build anything</strong>. "21 July" means a
          different instant in Auckland than in Los Angeles, and a picker that quietly stores local
          midnight will produce off-by-one bugs that surface weeks later in a different country.
          State the zone under the field.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'range',
        title: 'Ranges with presets',
        description:
          'Most range choices are one of five spans. Presets answer them in one click and leave the calendar for the case that is genuinely custom.',
        render: <RangeDemo />,
      },
      {
        id: 'typeable',
        title: 'Typing must always work',
        description:
          'A read-only field with a calendar attached is the fastest way to make a date-of-birth form hostile. Parse loosely, reformat on blur, and keep the grid as the alternative.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Typeable" tone="good">
                <Stack gap="xs">
                  <TextInput
                    defaultValue="21/07/2026"
                    endIcon={<CalendarDays />}
                    aria-label="Date typeable"
                  />
                  <span className="text-caption text-[var(--ds-fg-muted)]">
                    Accepts 21/07/2026, 2026-07-21, 21 Jul 2026
                  </span>
                </Stack>
              </Cell>
              <Cell label="Calendar only" tone="bad">
                <Stack gap="xs">
                  <TextInput
                    readOnly
                    defaultValue="21/07/2026"
                    endIcon={<CalendarDays />}
                    aria-label="Date readonly"
                  />
                  <span className="text-caption text-[var(--ds-danger-text)]">
                    Born in 1974? Page back 624 months.
                  </span>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'disabled',
        title: 'Unavailable dates',
        description:
          'Disabled days must be visibly unavailable rather than silently rejected on submit — and the reason belongs near the field, not in an error afterwards.',
        render: (
          <PreviewStage minHeight={300} center={false}>
            <Stack gap="sm" className="items-start">
              <Calendar value={{ y: 2026, m: 6, d: 24 }} disabledBefore={21} />
              <span className="text-caption text-[var(--ds-fg-muted)]">
                Deployments cannot be scheduled in the past.
              </span>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'today',
        title: 'Today is a ring, selection is a fill',
        description:
          'Two different facts need two different channels. If both use a fill, the user cannot tell which day they picked.',
        render: (
          <PreviewStage minHeight={300} center={false}>
            <Calendar value={{ y: 2026, m: 6, d: 24 }} />
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Idle field',
        render: <div className="w-44"><TextInput placeholder="dd/mm/yyyy" endIcon={<CalendarDays />} aria-label="a" /></div>,
      },
      {
        label: 'Filled',
        render: <div className="w-44"><TextInput defaultValue="21/07/2026" endIcon={<CalendarDays />} aria-label="b" /></div>,
      },
      {
        label: 'Invalid',
        render: <div className="w-44"><TextInput defaultValue="31/02/2026" status="error" endIcon={<CalendarDays />} aria-label="c" /></div>,
      },
      {
        label: 'Day idle',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-caption tabular-nums text-[var(--ds-fg-secondary)]">
            14
          </span>
        ),
      },
      {
        label: 'Day selected',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent)] text-caption font-medium tabular-nums text-[var(--ds-fg-on-accent)]">
            14
          </span>
        ),
      },
      {
        label: 'Today',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-caption tabular-nums text-[var(--ds-fg-secondary)] ring-1 ring-inset ring-[var(--ds-accent-border)]">
            21
          </span>
        ),
      },
      {
        label: 'In range',
        render: (
          <span className="grid h-8 w-8 place-items-center bg-[var(--ds-accent-subtle)] text-caption tabular-nums text-[var(--ds-fg)]">
            17
          </span>
        ),
      },
      {
        label: 'Disabled day',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-caption tabular-nums text-[var(--ds-fg-disabled)]">
            9
          </span>
        ),
      },
      { label: 'Preset', render: <Button size="sm" variant="text">Last 7 days</Button> },
    ],
  },

  anatomy: {
    render: <Calendar value={{ y: 2026, m: 6, d: 24 }} />,
    caption:
      'A month header with paging controls, weekday column headers, and a seven-column grid of day cells. Today is ringed; the selection is filled.',
    parts: [
      {
        n: 1,
        label: 'Panel width',
        value: '264px',
        kind: 'size',
        note: 'Seven 32px cells plus gaps and padding. Fixed, so paging between a 28-day and a 31-day month never resizes the panel.',
      },
      {
        n: 2,
        label: 'Header',
        value: 'Month + year, aria-live',
        kind: 'type',
        note: 'The live region is what lets a keyboard user hear the month change as they page. Without it, paging is silent.',
      },
      {
        n: 3,
        label: 'Day cell',
        value: '32 × 32px (44px on touch)',
        kind: 'size',
        note: 'Square, so a 1 and a 31 are the same target. Tabular figures stop the column widths shifting between months.',
      },
      {
        n: 4,
        label: 'Weekday headers',
        value: '10px, muted, two letters',
        kind: 'type',
        note: 'Two letters is the shortest form that stays unambiguous in English. The first day of the week is a locale setting, not a constant.',
      },
      {
        n: 5,
        label: 'Today',
        value: 'Inset ring',
        kind: 'color',
        note: 'A ring, not a fill. Today and the selection are different facts, and reusing the fill for both makes the choice invisible.',
      },
      {
        n: 6,
        label: 'Range fill',
        value: 'Subtle tint, square corners',
        kind: 'shape',
        note: 'Square between the ends and rounded at them, so the span reads as one continuous bar rather than a row of chips.',
      },
      {
        n: 7,
        label: 'Row height',
        value: 'Six rows always',
        kind: 'space',
        note: 'Reserve six week-rows even when the month needs five. A panel that changes height as you page moves the button you are aiming at.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Calendar panel' },
    { category: 'color', token: '--ds-accent', usedFor: 'Selected day fill' },
    { category: 'color', token: '--ds-fg-on-accent', usedFor: 'Selected day text' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Days inside a range' },
    { category: 'color', token: '--ds-accent-border', usedFor: 'The ring on today' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Day hover' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Weekday headers and paging chevrons' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Unavailable days' },
    { category: 'spacing', token: 'cell gap', value: '2px', usedFor: 'Between day cells' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Day cell corners' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Day numbers, so columns never shift' },
    { category: 'shadow', token: '--shadow-e4', usedFor: 'Panel elevation' },
  ],

  sizes: [
    { name: 'Compact', height: '28px cells', minWidth: '240px', use: 'Inside a dense filter bar or a narrow popover.' },
    { name: 'Default', height: '32px cells', minWidth: '264px', use: 'The default. Seven cells plus gaps and padding.' },
    { name: 'Touch', height: '44px cells', minWidth: '340px', touch: '44px', use: 'Coarse pointers. Below 44px, adjacent days are routinely mis-tapped.' },
    { name: 'Range panel', minWidth: '540px', use: 'Two months side by side, so a span crossing a month boundary is visible whole.' },
    { name: 'Presets', minWidth: '9rem', use: 'A column beside the calendar. Five spans cover most range choices.' },
  ],

  do: [
    {
      title: 'Let the field be typed into',
      why: 'The calendar is an aid, not a gate. Anyone who already knows the date is fastest with a keyboard, and a read-only field punishes exactly them.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <TextInput defaultValue="21/07/2026" endIcon={<CalendarDays />} aria-label="typeable" />
          <span className="text-caption text-[var(--ds-fg-muted)]">
            Accepts several formats. Reformats on blur.
          </span>
        </Stack>
      ),
    },
    {
      title: 'Offer presets for ranges',
      why: 'Most range choices are one of about five spans. A preset answers them in a click and leaves the calendar for the genuinely custom case.',
      render: (
        <Row gap="sm">
          {['Last 7 days', 'Last 30 days', 'This quarter'].map((p) => (
            <Button key={p} size="sm" variant="outlined">
              {p}
            </Button>
          ))}
        </Row>
      ),
    },
    {
      title: 'Name the full date on every cell',
      why: '"14" read aloud is meaningless. "14 July 2026" is the value, and it costs one template string.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          aria-label="14 July 2026"
        </code>
      ),
    },
    {
      title: 'State the time zone under the field',
      why: '"21 July" is a different instant in Auckland and Los Angeles. Saying which zone applies is the cheapest fix for a whole class of off-by-one bugs.',
      render: (
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Times are shown in Europe/London.
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use a calendar for a date of birth',
      why: 'Paging back six hundred months is not navigation. Three fields or one typed field with a format hint is faster by an order of magnitude.',
      render: (
        <Stack gap="xs" className="w-full max-w-xs">
          <TextInput readOnly defaultValue="dd/mm/yyyy" endIcon={<CalendarDays />} aria-label="dob" />
          <span className="text-caption text-[var(--ds-danger-text)]">624 months back to 1974</span>
        </Stack>
      ),
    },
    {
      title: 'Do not let the panel change height between months',
      why: 'A five-week month is 32px shorter than a six-week one. Paging then moves every control below it, including the one the pointer is heading for.',
      render: (
        <Row gap="sm" align="start">
          <span className="h-20 w-20 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
          <span className="h-16 w-20 rounded-[var(--radius-md)] border border-dashed border-[var(--ds-danger-border)]" />
        </Row>
      ),
    },
    {
      title: 'Do not mark today and the selection the same way',
      why: 'Two different facts sharing one visual channel means the user cannot tell which day they picked. Today gets a ring; the selection gets the fill.',
      render: (
        <Row gap="sm">
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent)] text-caption text-[var(--ds-fg-on-accent)]">
            21
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent)] text-caption text-[var(--ds-fg-on-accent)]">
            24
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not assume the week starts on Sunday',
      why: 'It starts on Monday across most of Europe and much of Asia. Getting it wrong shifts every date by a column and users misread the whole grid.',
      render: (
        <Row gap="sm" className="font-mono text-caption text-[var(--ds-danger-text)]">
          <span>Su Mo Tu We Th Fr Sa</span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The selected day carries a fill and inverted text, so it survives greyscale.',
      'Today’s ring must reach 3:1 — it is a meaningful boundary, not decoration.',
      'Disabled days may use the disabled tone, but their unavailability must also be exposed through the disabled attribute.',
      'The range tint must be distinguishable from the hover wash, or a user cannot tell what is selected while the pointer is in the grid.',
    ],
    keyboard: [
      { keys: '← / →', does: 'Moves one day. ↑ / ↓ moves one week.' },
      { keys: 'Page Up / Page Down', does: 'Moves one month. With Shift, one year.' },
      { keys: 'Home / End', does: 'Jumps to the first or last day of the week.' },
      { keys: 'Enter / Space', does: 'Selects the focused day and closes the panel.' },
      { keys: 'Esc', does: 'Closes without selecting and returns focus to the field.' },
      { keys: 'Tab', does: 'Moves between the paging controls and the grid. The grid itself is one stop with roving focus inside.' },
    ],
    aria: [
      { attr: 'role="grid"', on: 'The month', note: 'With role="row" and role="gridcell". This is what makes arrow-key navigation announced correctly rather than improvised.' },
      { attr: 'aria-label', on: 'Each day cell', note: 'The full date: "14 July 2026". A bare number tells a screen-reader user nothing.' },
      { attr: 'aria-selected', on: 'The chosen day', note: 'Plus both ends of a range. The days between are conveyed by the label, not by selection.' },
      { attr: 'aria-current="date"', on: 'Today', note: 'Distinct from selection. Both facts must be separately announced.' },
      { attr: 'aria-live="polite"', on: 'The month header', note: 'Announces the month as the user pages. Without it, paging is completely silent.' },
      { attr: 'aria-disabled', on: 'Unavailable days', note: 'With the reason available nearby — a silently unclickable day looks like a bug.' },
    ],
    focus:
      'Opening the panel moves focus to the selected day, or to today if nothing is selected. Roving tabindex means only one cell is tabbable, so Tab leaves the grid rather than walking thirty-one cells. Closing returns focus to the field with the value filled.',
    screenReader: [
      'The grid announces as "July 2026, grid" then "14 July 2026, gridcell".',
      'Announce the month on every page. This is the single most common omission and it makes the picker unusable without sight.',
      'For a range, announce the span once both ends are set: "17 to 24 July 2026, 8 days".',
    ],
    touch:
      'Day cells go to 44px, which makes the panel about 340px wide — full-screen on most phones, and that is the right answer. Prefer native input[type=date] on mobile where the design allows: the platform picker is familiar, accessible and free. A two-month range panel does not fit a phone; stack the months and scroll.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { DatePicker } from '@/ui/Input'

<Field label="Deployment date" description="Times are shown in Europe/London.">
  <DatePicker
    value={date}
    onChange={setDate}
    min={startOfToday}
    typeable                      // never a gate
    format="dd/MM/yyyy"
  />
</Field>

// Parse loosely, reformat on blur. Users type dates six different ways and
// all of them are the same date.
const PATTERNS = ['dd/MM/yyyy', 'yyyy-MM-dd', 'd MMM yyyy', 'MM/dd/yyyy']
function parseLoose(input: string, locale: string) {
  for (const p of PATTERNS) {
    const d = parse(input, p, new Date(), { locale })
    if (isValid(d)) return d
  }
  return null
}

// The grid keyboard model IS the component. Without it this is mouse-only.
function onGridKeyDown(e: React.KeyboardEvent) {
  const move = {
    ArrowLeft: -1, ArrowRight: 1,
    ArrowUp: -7,   ArrowDown: 7,
  }[e.key]
  if (move) { e.preventDefault(); return setFocused(addDays(focused, move)) }
  if (e.key === 'PageUp')   { e.preventDefault(); setFocused(addMonths(focused, -1)) }
  if (e.key === 'PageDown') { e.preventDefault(); setFocused(addMonths(focused, 1)) }
}

// Store the instant, display the local date. Storing local midnight is where
// off-by-one bugs come from.
const iso = zonedTimeToUtc(startOfDay(date), 'Europe/London').toISOString()`,
    },
    html: {
      lang: 'html',
      code: `<div class="ds-datepicker">
  <label for="date">Deployment date</label>
  <input id="date" type="text" inputmode="numeric"
         placeholder="dd/mm/yyyy" aria-describedby="date-hint" />
  <button type="button" aria-label="Open calendar" aria-haspopup="dialog"
          aria-expanded="false">…</button>
  <p id="date-hint">Times are shown in Europe/London.</p>
</div>

<div role="dialog" aria-label="Choose a date">
  <div class="ds-cal__head">
    <button type="button" aria-label="Previous month">‹</button>
    <!-- Without the live region, paging is completely silent. -->
    <span aria-live="polite">July 2026</span>
    <button type="button" aria-label="Next month">›</button>
  </div>

  <div role="grid" aria-label="July 2026">
    <div role="row">
      <span role="columnheader" aria-label="Monday">Mo</span>
      …
    </div>
    <div role="row">
      <button role="gridcell" aria-label="21 July 2026"
              aria-current="date" tabindex="-1">21</button>
      <button role="gridcell" aria-label="24 July 2026"
              aria-selected="true" tabindex="0">24</button>
      <button role="gridcell" aria-label="9 July 2026" disabled>9</button>
    </div>
  </div>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-cal {
  inline-size: 264px;                /* 7 × 32px + gaps + padding */
  padding: 12px;
  border: 1px solid var(--ds-border);
  border-radius: var(--radius-lg);
  background: var(--ds-surface-overlay);
  box-shadow: var(--shadow-e4);
}

.ds-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  /* Six rows always. A five-week month is 32px shorter, and paging would
     otherwise move every control below the panel. */
  grid-auto-rows: 32px;
  min-block-size: calc(6 * 32px + 5 * 2px);
}

[role='gridcell'] {
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  /* Square cells and tabular figures: a 1 and a 31 are the same target and
     the columns never shift between months. */
  font-variant-numeric: tabular-nums;
  color: var(--ds-fg-secondary);
}

[role='gridcell']:hover:not(:disabled) { background: var(--ds-layer-hover); }

[role='gridcell'][aria-selected='true'] {
  background: var(--ds-accent);
  color: var(--ds-fg-on-accent);
}

/* Today is a RING. Selection is a FILL. Two facts, two channels. */
[role='gridcell'][aria-current='date'] {
  box-shadow: inset 0 0 0 1px var(--ds-accent-border);
}

/* Square between the ends, rounded at them: the span reads as one bar. */
[role='gridcell'][data-in-range='true'] {
  border-radius: 0;
  background: var(--ds-accent-subtle);
}

@media (pointer: coarse) {
  .ds-cal { inline-size: 340px; }
  .ds-cal__grid { grid-auto-rows: 44px; }
}`,
    },
    api: [
      {
        name: 'DatePicker',
        props: [
          { name: 'value', type: 'Date | null', required: true, description: 'Null is empty. Store the instant; display the local date.' },
          { name: 'onChange', type: '(d: Date | null) => void', required: true, description: 'Fires on selection and on a successful parse from the field.' },
          { name: 'min / max', type: 'Date', description: 'Days outside the range render disabled, not merely rejected on submit.' },
          { name: 'typeable', type: 'boolean', default: 'true', description: 'Turning this off is almost always wrong. The calendar is an aid, not a gate.' },
          { name: 'format', type: 'string', default: "locale default", description: 'Display format. Parsing stays loose regardless of what this is set to.' },
          { name: 'weekStartsOn', type: '0 | 1', default: 'locale default', description: 'Monday across most of Europe and Asia. Never hardcode Sunday.' },
          { name: 'disabledDates', type: '(d: Date) => boolean', description: 'For availability. Pair it with a visible reason near the field.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show two months for range selection. A span crossing a month boundary is otherwise chosen half-blind.',
      'Highlight the range as the pointer moves between the two ends. It is the only preview of what clicking will produce.',
      'For availability calendars, show why a day is unavailable on hover or focus — "fully booked" beats a grey square.',
      'Default to something sensible rather than empty. Today, the next business day, or the start of the current month removes an interaction for most users.',
      'On mobile, consider native input[type=date] outright. The platform picker is familiar, accessible and costs nothing to maintain.',
    ],
    performance: [
      'Import only the date functions you use. A full date library in the entry bundle is a few hundred kilobytes for a component most users never open.',
      'Memoise the month grid on year and month. Recomputing thirty-one cells on every render is visible when the panel is open during typing.',
      'Load the picker lazily. It is a large component behind a single button and rarely needed on first paint.',
      'Never call Date.now() during render. It makes output non-deterministic and breaks any snapshot or server render.',
    ],
    mistakes: [
      'A read-only field, forcing calendar navigation for a date the user already knows.',
      'Using the calendar for a date of birth, which means paging back hundreds of months.',
      'A panel that changes height between five-week and six-week months.',
      'Today and the selection sharing the fill, so the choice is invisible.',
      'A hardcoded Sunday week start, shifting every date by a column for most of the world.',
      'Bare day numbers as accessible names, announcing "14" with no month or year.',
      'No live region on the month header, making paging silent.',
      'Storing local midnight, which produces off-by-one dates for users in other zones.',
    ],
    realWorld: [
      'Date range pickers in analytics tools are almost always used through the presets. Build those first and treat the calendar as the escape hatch.',
      'Booking flows are where the calendar genuinely earns its space: availability is spatial, and seeing which days are free is the whole task.',
      'Users type dates in whatever format they grew up with. Loose parsing removes more support tickets than any amount of placeholder text.',
      'Time zones are the source of most date bugs that reach production. Decide whether you are storing a calendar date or an instant, write it down, and be consistent.',
    ],
  },
})

function RangeDemo() {
  const [range, setRange] = React.useState<{ start: number | null; end: number | null }>({
    start: 17,
    end: 24,
  })
  const [preset, setPreset] = React.useState('Custom')

  const PRESETS: [string, number, number][] = [
    ['Last 7 days', 15, 21],
    ['Last 14 days', 8, 21],
    ['This month', 1, 31],
  ]

  return (
    <PreviewStage minHeight={330} center={false}>
      <Row gap="lg" align="start">
        <Stack gap="xs" className="w-36 shrink-0">
          {PRESETS.map(([label, s, e]) => (
            <Button
              key={label}
              size="sm"
              variant={preset === label ? 'tonal' : 'text'}
              className="justify-start"
              onClick={() => {
                setRange({ start: s, end: e })
                setPreset(label)
              }}
            >
              {label}
            </Button>
          ))}
          <Button
            size="sm"
            variant={preset === 'Custom' ? 'tonal' : 'text'}
            className="justify-start"
            onClick={() => setPreset('Custom')}
          >
            Custom
          </Button>
        </Stack>
        <Stack gap="sm" className="items-start">
          <Calendar value={null} range={range} />
          <span aria-live="polite" className="text-caption text-[var(--ds-fg-muted)]">
            {range.start} – {range.end} July 2026 ·{' '}
            {(range.end ?? 0) - (range.start ?? 0) + 1} days
          </span>
        </Stack>
      </Row>
    </PreviewStage>
  )
}
