import * as React from 'react'
import { MoreHorizontal, RotateCcw, Settings2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { NativeSelect } from '@/ui/Select'
import { Switch } from '@/ui/Toggle'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, defineDoc } from '../framework/kit'

/* ===========================================================================
   MIXER
   Many channels of the same four controls, read as a group.

   Everything here is a control the platform already ships — the fader and the
   pan knob are input[type=range], mute and solo are toggle buttons — dressed
   to look like studio hardware. The hardware look is a reading aid, not a
   theme: a fader cap has to look grabbable and a meter has to look like it is
   measuring rather than filling. None of it is allowed to cost the keyboard
   model or the value semantics, which is why nothing here is a div with a
   drag handler.
   ======================================================================== */

/* -- Scale ----------------------------------------------------------------
   A mixer fader is not linear. Every console ever built gives the top of the
   travel far more room per decibel than the bottom, because that is where
   the decisions are: the difference between -3 and 0 dB matters, and the
   difference between -55 and -58 does not. A linear -60..+12 track would put
   unity gain three quarters of the way up and waste half the throw on silence
   nobody is mixing at.

   So position is a taper. Everything below is in terms of it. */
const DB_MIN = -60
const DB_MAX = 12
const TAPER = 2.4

/** dB -> 0..1 position on the track. */
function dbToPos(db: number) {
  const t = (Math.max(DB_MIN, Math.min(DB_MAX, db)) - DB_MIN) / (DB_MAX - DB_MIN)
  return Math.pow(t, 1 / TAPER)
}

/** 0..1 position -> dB. */
function posToDb(pos: number) {
  const t = Math.pow(Math.max(0, Math.min(1, pos)), TAPER)
  return DB_MIN + t * (DB_MAX - DB_MIN)
}

/** The scale marks worth printing. Not every step — a ruler is not a control. */
const DB_TICKS = [12, 6, 0, -6, -12, -24, -36, -48, -60]

function fmtDb(db: number) {
  if (db <= DB_MIN) return '-∞'
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`
}

function fmtPan(pan: number) {
  if (Math.abs(pan) < 1) return 'Centre'
  return pan < 0 ? `L${Math.round(-pan)}` : `R${Math.round(pan)}`
}

/* -- Channel colour -------------------------------------------------------
   Colour identifies a channel at a glance across eight of them. It is never
   the only signal: every strip also carries its number and its name, so a
   colour-blind user loses a convenience and not the interface. The ramp is
   fixed rather than tokenised because these are identity hues, the same
   category as chart series — semantic tokens would make every channel mean
   "success" or "danger", which they do not. */
const CHANNEL_HUES = [205, 265, 135, 30, 175, 335, 220, 45] as const

function hue(i: number, l = 58, s = 78) {
  return `hsl(${CHANNEL_HUES[i % CHANNEL_HUES.length]} ${s}% ${l}%)`
}

/* -- Meter ----------------------------------------------------------------
   Output, not a control: aria-hidden, and every number it conveys is also
   present as text. A screen reader user gets "Narration, fader, -3.2 dB" from
   the fader itself; reading a level meter aloud sixty times a second would be
   worse than useless. */
const SEGMENTS = 26

function Meter({
  level,
  peak,
  className,
}: {
  level: number
  peak?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex flex-col-reverse gap-px overflow-hidden rounded-[2px] bg-[var(--ds-sunken)] p-px',
        className,
      )}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const at = (i + 1) / SEGMENTS
        const on = level >= at
        const isPeak = peak != null && Math.abs(peak - at) < 1 / SEGMENTS
        // Green up to -12, amber into the last few dB, red once it clips. The
        // thresholds are the meter's whole message, so they are colour AND
        // position — the top of the scale is red whether or not you see red.
        const tone =
          at > 0.93
            ? 'var(--ds-danger)'
            : at > 0.82
              ? 'var(--ds-warning)'
              : 'var(--ds-success)'
        return (
          <span
            key={i}
            className="flex-1 rounded-[1px] transition-opacity duration-75"
            style={{
              background: on || isPeak ? tone : 'var(--ds-layer-active)',
              opacity: on ? 1 : isPeak ? 0.55 : 0.35,
            }}
          />
        )
      })}
    </div>
  )
}

/* -- Waveform -------------------------------------------------------------
   A static thumbnail of the clip on the channel. Decorative: it tells you
   which channel is which faster than reading the name, and carries nothing
   the name does not. */
function Waveform({ seed, colour }: { seed: number; colour: string }) {
  const bars = React.useMemo(() => {
    // Deterministic so it does not reshuffle on every render.
    let s = seed * 9301 + 49297
    return Array.from({ length: 44 }, () => {
      s = (s * 9301 + 49297) % 233280
      return 0.25 + (s / 233280) * 0.75
    })
  }, [seed])

  return (
    <div aria-hidden className="flex h-8 items-center gap-px">
      {bars.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px]"
          style={{ blockSize: `${h * 100}%`, background: colour, opacity: 0.75 }}
        />
      ))}
    </div>
  )
}

/* -- Fader ----------------------------------------------------------------
   input[type=range] turned on its side. writing-mode is the modern way to do
   this — `appearance: slider-vertical` is deprecated and was never in Firefox
   — and `direction: rtl` is what puts the minimum at the BOTTOM, which is the
   only orientation a fader is allowed to have.

   The native input carries the whole keyboard model, the value semantics and
   forced-colors support. The cap and the track are painted behind it. */
function Fader({
  db,
  onChange,
  label,
  colour,
  disabled,
  showScale = true,
}: {
  db: number
  onChange?: (db: number) => void
  label: string
  colour: string
  disabled?: boolean
  showScale?: boolean
}) {
  const pos = dbToPos(db)

  return (
    <div className="flex h-full items-stretch gap-1.5">
      {showScale && (
        <div aria-hidden className="relative w-6 shrink-0">
          {DB_TICKS.map((t) => (
            <span
              key={t}
              className="absolute right-0 -translate-y-1/2 text-[9px] leading-none tabular-nums text-[var(--ds-fg-muted)]"
              style={{ bottom: `${dbToPos(t) * 100}%` }}
            >
              {t > 0 ? `+${t}` : t}
            </span>
          ))}
        </div>
      )}

      <div className="relative flex-1">
        {/* The 44px-wide invisible target. A 6px rail is a test of accuracy. */}
        <input
          type="range"
          aria-label={label}
          aria-orientation="vertical"
          // A bare number read aloud is ambiguous. Units are the value.
          aria-valuetext={fmtDb(db)}
          min={0}
          max={1000}
          step={1}
          value={Math.round(pos * 1000)}
          disabled={disabled}
          onChange={(e) => onChange?.(posToDb(Number(e.target.value) / 1000))}
          onDoubleClick={() => onChange?.(0)}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          style={{ writingMode: 'vertical-rl', direction: 'rtl' }}
        />

        {/* Rail */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-[var(--ds-sunken)] shadow-[inset_0_1px_2px_rgb(0_0_0/0.45)]"
        />
        {/* Travelled portion, from the bottom */}
        <span
          aria-hidden
          className="absolute bottom-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
          style={{
            blockSize: `${pos * 100}%`,
            background: disabled ? 'var(--ds-border-strong)' : colour,
            boxShadow: disabled ? undefined : `0 0 8px ${colour}`,
          }}
        />
        {/* Unity mark. 0 dB is the one position on the scale a mixer engineer
            looks for without reading, so it gets a physical detent line. */}
        <span
          aria-hidden
          className="absolute left-1/2 h-px w-4 -translate-x-1/2 bg-[var(--ds-border-strong)]"
          style={{ bottom: `${dbToPos(0) * 100}%` }}
        />
        {/* Cap */}
        <span
          aria-hidden
          className={cn(
            'absolute left-1/2 flex -translate-x-1/2 translate-y-1/2 flex-col justify-center gap-[3px]',
            'rounded-[3px] border px-1 shadow-e2 transition-shadow',
            'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]',
            disabled
              ? 'border-[var(--ds-border)] bg-[var(--ds-layer-active)]'
              : 'border-[var(--ds-border-strong)] bg-gradient-to-b from-[var(--ds-surface-raised)] to-[var(--ds-surface-inset)]',
          )}
          style={{ inlineSize: 26, blockSize: 40, bottom: `${pos * 100}%` }}
        >
          {/* The grip line is the affordance: it says "this is the part that
              moves" without a label. */}
          <span className="h-px w-full bg-[var(--ds-border-strong)]" />
          <span className="h-px w-full bg-[var(--ds-border-strong)]" />
        </span>
      </div>
    </div>
  )
}

/* -- Pan knob -------------------------------------------------------------
   A rotary presentation of a range input. It rotates because a pan control is
   a position between two speakers and a rotation reads as that; it is still a
   slider underneath, so arrows and Home/End work and the value is announced. */
function PanKnob({
  pan,
  onChange,
  label,
  colour,
  disabled,
}: {
  pan: number
  onChange?: (v: number) => void
  label: string
  colour: string
  disabled?: boolean
}) {
  const angle = (pan / 100) * 135

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span aria-hidden className="text-[9px] text-[var(--ds-fg-muted)]">L</span>
      <div className="relative h-11 w-11">
        <input
          type="range"
          aria-label={label}
          aria-valuetext={fmtPan(pan)}
          min={-100}
          max={100}
          step={1}
          value={pan}
          disabled={disabled}
          onChange={(e) => onChange?.(Number(e.target.value))}
          // Double-click to recentre is the hardware convention and costs
          // nothing; the keyboard equivalent is Home then End, or just typing.
          onDoubleClick={() => onChange?.(0)}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span
          aria-hidden
          className={cn(
            'absolute inset-1 rounded-full border shadow-e1',
            'bg-gradient-to-b from-[var(--ds-surface-raised)] to-[var(--ds-surface-inset)]',
            'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]',
            disabled ? 'border-[var(--ds-border)]' : 'border-[var(--ds-border-strong)]',
          )}
        />
        {/* Pointer. The one thing that has to be readable across the room. */}
        <span
          aria-hidden
          className="absolute inset-1 transition-transform duration-100 motion-reduce:transition-none"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <span
            className="absolute left-1/2 top-[3px] h-3 w-[2px] -translate-x-1/2 rounded-full"
            style={{ background: disabled ? 'var(--ds-border-strong)' : colour }}
          />
        </span>
      </div>
      <span aria-hidden className="text-[9px] text-[var(--ds-fg-muted)]">R</span>
    </div>
  )
}

/* -- Mute / Solo ----------------------------------------------------------
   Toggle buttons, so aria-pressed carries the state. They are the two controls
   on the strip that change what you HEAR without moving anything, which is why
   they are the two that get a lit indicator rather than only a colour change. */
function StripToggle({
  on,
  onChange,
  children,
  tone,
  name,
}: {
  on: boolean
  onChange: () => void
  children: React.ReactNode
  tone: 'danger' | 'warning'
  name: string
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${children} ${name}`}
      onClick={onChange}
      className={cn(
        'inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-xs)]',
        'border text-[10px] font-semibold uppercase tracking-wide transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        on
          ? tone === 'danger'
            ? 'border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]'
            : 'border-[var(--ds-warning-border)] bg-[var(--ds-warning-subtle)] text-[var(--ds-warning-text)]'
          : 'border-[var(--ds-border)] bg-[var(--ds-surface)] text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
      )}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full transition-colors"
        style={{
          background: on
            ? tone === 'danger'
              ? 'var(--ds-danger)'
              : 'var(--ds-warning)'
            : 'var(--ds-border-strong)',
          boxShadow: on
            ? `0 0 6px ${tone === 'danger' ? 'var(--ds-danger)' : 'var(--ds-warning)'}`
            : undefined,
        }}
      />
      {children}
    </button>
  )
}

/* -- Channel state --------------------------------------------------------- */
export interface Channel {
  id: string
  name: string
  db: number
  pan: number
  mute: boolean
  solo: boolean
}

const INITIAL: Channel[] = [
  { id: '1', name: 'Narration', db: 0, pan: 0, mute: false, solo: false },
  { id: '2', name: 'Music', db: -4.2, pan: -22, mute: true, solo: false },
  { id: '3', name: 'SFX', db: -2.1, pan: 10, mute: false, solo: false },
  { id: '4', name: 'Ambience', db: -6, pan: 34, mute: false, solo: true },
  { id: '5', name: 'Track 5', db: -3.3, pan: -8, mute: false, solo: false },
  { id: '6', name: 'Track 6', db: -9.1, pan: 48, mute: true, solo: false },
  { id: '7', name: 'Track 7', db: -1.8, pan: 0, mute: false, solo: false },
  { id: '8', name: 'Track 8', db: 0, pan: -40, mute: false, solo: false },
]

/* -- Strip ---------------------------------------------------------------- */
function ChannelStrip({
  channel,
  index,
  level,
  onChange,
  audible,
  compact,
}: {
  channel: Channel
  index: number
  level: number
  onChange: (patch: Partial<Channel>) => void
  audible: boolean
  compact?: boolean
}) {
  const colour = hue(index)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-md)]',
        'border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]',
        !audible && 'opacity-60',
      )}
    >
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-xs)] text-[11px] font-semibold text-black"
            style={{ background: colour }}
          >
            {index + 1}
          </span>
          <p className="min-w-0 flex-1 truncate text-body-sm font-medium text-[var(--ds-fg)]">
            {channel.name}
          </p>
        </div>

        {!compact && <Waveform seed={index + 1} colour={colour} />}

        {/* The readout is text, not just a fader position — the number is the
            thing an engineer writes down. Tabular so it does not jitter. */}
        <div className="flex items-baseline justify-between border-t border-[var(--ds-border-subtle)] pt-1.5">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Gain</span>
          <span className="font-mono text-[11px] tabular-nums" style={{ color: colour }}>
            {fmtDb(channel.db)}
          </span>
        </div>

        <PanKnob
          pan={channel.pan}
          onChange={(pan) => onChange({ pan })}
          label={`${channel.name} pan`}
          colour={colour}
        />

        <div className="flex gap-1.5">
          <StripToggle
            on={channel.mute}
            onChange={() => onChange({ mute: !channel.mute })}
            tone="danger"
            name={channel.name}
          >
            Mute
          </StripToggle>
          <StripToggle
            on={channel.solo}
            onChange={() => onChange({ solo: !channel.solo })}
            tone="warning"
            name={channel.name}
          >
            Solo
          </StripToggle>
        </div>
      </div>

      <div className="flex flex-1 gap-2 px-2 pb-2" style={{ minBlockSize: compact ? 150 : 210 }}>
        <Fader
          db={channel.db}
          onChange={(db) => onChange({ db })}
          label={`${channel.name} fader`}
          colour={colour}
          showScale={!compact}
        />
        <Meter level={audible ? level : 0} className="w-2 shrink-0" />
      </div>

      {/* The identity bar. Reading eight strips is a scanning task, and a solid
          block of colour at a fixed position is the fastest possible index. */}
      <span aria-hidden className="h-1 w-full shrink-0" style={{ background: colour }} />
    </div>
  )
}

/* -- Master --------------------------------------------------------------- */
function MasterStrip({
  db,
  onChange,
  left,
  right,
  mute,
  onMute,
  compact,
}: {
  db: number
  onChange: (db: number) => void
  left: number
  right: number
  mute: boolean
  onMute: () => void
  compact?: boolean
}) {
  const clipping = Math.max(left, right) > 0.93

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-accent-border)] bg-[var(--ds-surface-raised)]">
      <div className="flex flex-col gap-2 p-2">
        <p className="rounded-[var(--radius-xs)] bg-[var(--ds-accent-subtle)] py-1 text-center text-overline uppercase tracking-wide text-[var(--ds-accent-text)]">
          Master
        </p>

        <div className="text-center">
          <p className="text-overline uppercase text-[var(--ds-fg-muted)]">Stereo out</p>
          <p className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">{fmtDb(db)}</p>
        </div>

        {/* Clipping is the one thing on a mixer that is genuinely an error, so
            it is the one indicator that changes text and not just colour. */}
        <p
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-[var(--radius-xs)] py-1 text-[10px] font-semibold uppercase tracking-wide',
            clipping
              ? 'bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]'
              : 'text-[var(--ds-fg-muted)]',
          )}
          role="status"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: clipping ? 'var(--ds-danger)' : 'var(--ds-border-strong)',
              boxShadow: clipping ? '0 0 6px var(--ds-danger)' : undefined,
            }}
          />
          {clipping ? 'Clipping' : 'Limiter'}
        </p>
      </div>

      <div className="flex flex-1 gap-2 px-2 pb-2" style={{ minBlockSize: compact ? 150 : 210 }}>
        <Meter level={mute ? 0 : left} className="w-2 shrink-0" />
        <Fader
          db={db}
          onChange={onChange}
          label="Master fader"
          colour="var(--ds-accent)"
          showScale={!compact}
        />
        <Meter level={mute ? 0 : right} className="w-2 shrink-0" />
      </div>

      <div className="flex gap-1.5 px-2 pb-2">
        <StripToggle on={mute} onChange={onMute} tone="danger" name="master">
          Mute
        </StripToggle>
      </div>
      <span aria-hidden className="h-1 w-full shrink-0 bg-[var(--ds-accent)]" />
    </div>
  )
}

/* -- The mixer ------------------------------------------------------------ */
function Mixer({
  count = 8,
  running = true,
  compact = false,
  showHeader = true,
  showFooter = true,
}: {
  count?: number
  running?: boolean
  compact?: boolean
  showHeader?: boolean
  showFooter?: boolean
}) {
  const [channels, setChannels] = React.useState(INITIAL)
  const [master, setMaster] = React.useState(0)
  const [masterMute, setMasterMute] = React.useState(false)
  const [levels, setLevels] = React.useState<number[]>(() => INITIAL.map(() => 0.3))
  const [processing, setProcessing] = React.useState({
    ducking: true,
    normalize: true,
    denoise: true,
  })

  const visible = channels.slice(0, count)
  const soloed = visible.some((c) => c.solo)

  // Levels are simulated so the meters mean something in a documentation page.
  // Paused when `running` is off and when the reader has asked for reduced
  // motion — a wall of flickering LEDs is exactly what that setting is for.
  React.useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!running || reduced) return
    const id = window.setInterval(() => {
      setLevels((prev) => prev.map((l) => {
        const target = 0.35 + Math.random() * 0.55
        return l + (target - l) * 0.4
      }))
    }, 110)
    return () => window.clearInterval(id)
  }, [running])

  const patch = (id: string, p: Partial<Channel>) =>
    setChannels((cs) => cs.map((c) => (c.id === id ? { ...c, ...p } : c)))

  const audible = (c: Channel) => !c.mute && (!soloed || c.solo)

  // The master meter is the sum of what is actually audible, so muting a
  // channel visibly moves it. A master meter that ignores the mutes is a lie
  // the user will eventually catch.
  const bus = visible.reduce(
    (n, c, i) => (audible(c) ? Math.max(n, levels[i] * dbToPos(c.db)) : n),
    0,
  )
  const busL = masterMute ? 0 : Math.min(1, bus * dbToPos(master) * 1.35)
  const busR = masterMute ? 0 : Math.min(1, bus * dbToPos(master) * 1.22)

  const reset = () => {
    setChannels(INITIAL)
    setMaster(0)
    setMasterMute(false)
  }

  return (
    <section
      aria-label="Mixer"
      className="flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] p-3"
    >
      {showHeader && (
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--ds-border-subtle)] pb-3">
          <h3 className="text-title-sm font-semibold tracking-tight text-[var(--ds-fg)]">Mixer</h3>
          <label className="flex items-center gap-1.5">
            <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Routing</span>
            <NativeSelect
              aria-label="Routing"
              defaultValue="studio"
              options={[
                { value: 'studio', label: 'Studio Mix' },
                { value: 'broadcast', label: 'Broadcast' },
                { value: 'stems', label: 'Stems' },
              ]}
            />
          </label>
          <label className="ml-auto flex items-center gap-1.5">
            <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Preset</span>
            <NativeSelect
              aria-label="Preset"
              defaultValue="podcast"
              options={[
                { value: 'podcast', label: 'Podcast Studio' },
                { value: 'film', label: 'Film Dialogue' },
                { value: 'flat', label: 'Flat' },
              ]}
            />
          </label>
          <div className="flex items-center gap-1">
            <IconButton size="sm" label="Previous preset" icon={<ChevronLeft size={14} />} />
            <IconButton size="sm" label="Next preset" icon={<ChevronRight size={14} />} />
            <IconButton size="sm" label="Reset mixer" onClick={reset} icon={<RotateCcw size={14} />} />
            <IconButton size="sm" label="More options" icon={<MoreHorizontal size={14} />} />
          </div>
        </header>
      )}

      {/* One scroll container, because eight strips do not fit a phone and
          shrinking them until they do produces controls nobody can hit. */}
      <div className="overflow-x-auto">
        <div
          className="grid min-w-max gap-2"
          style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(112px, 1fr)) 132px` }}
        >
          {visible.map((c, i) => (
            <ChannelStrip
              key={c.id}
              channel={c}
              index={i}
              level={levels[i]}
              audible={audible(c)}
              compact={compact}
              onChange={(p) => patch(c.id, p)}
            />
          ))}
          <MasterStrip
            db={master}
            onChange={setMaster}
            left={busL}
            right={busR}
            mute={masterMute}
            onMute={() => setMasterMute((m) => !m)}
            compact={compact}
          />
        </div>
      </div>

      {showFooter && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--ds-border-subtle)] pt-3">
          {([
            ['ducking', 'Auto ducking'],
            ['normalize', 'Normalize'],
            ['denoise', 'Noise reduction'],
          ] as const).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-2.5 py-1.5"
            >
              <Switch
                checked={processing[key]}
                onCheckedChange={(v) => setProcessing((p) => ({ ...p, [key]: v }))}
                label={label}
              />
              <IconButton size="xs" label={`${label} settings`} icon={<Settings2 size={13} />} />
            </div>
          ))}
          <Button size="sm" variant="outlined" className="ml-auto" onClick={reset}>
            <RotateCcw size={14} />
            Reset mix
          </Button>
        </footer>
      )}
    </section>
  )
}

/* -- Playground ----------------------------------------------------------- */
function Playground() {
  const [count, setCount] = React.useState<'4' | '6' | '8'>('8')
  const [compact, setCompact] = React.useState(false)
  const [running, setRunning] = React.useState(true)

  return (
    <PreviewStage
      center={false}
      minHeight={0}
      label="Mixer"
      controls={
        <>
          <Knob label="Channels">
            <KnobSelect value={count} onChange={setCount} options={['4', '6', '8'] as const} />
          </Knob>
          <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
          <KnobToggle checked={running} onChange={setRunning} label="Signal" />
        </>
      }
    >
      <Mixer count={Number(count)} compact={compact} running={running} />
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'mixer',
    title: 'Mixer',
    tagline:
      'Many channels of the same four controls, compared by eye. A mixer is not eight sliders in a row — it is one instrument for balancing them against each other.',
    status: 'beta',
    keywords: [
      'fader', 'channel strip', 'mute', 'solo', 'pan', 'level meter', 'vu',
      'audio', 'console', 'gain', 'master bus', 'db',
    ],
  },

  overview: {
    purpose:
      'A mixer shows several parallel signals and lets the user set the balance between them. Its whole value is comparison: any one channel could be a slider and a couple of toggles, but the reason to build a mixer is that the eye can read eight fader caps as a shape and see the balance in one glance. Everything in the layout exists to protect that — identical strips, one shared scale, a fixed position for every control.',
    whenToUse: [
      'Several continuous levels that are set relative to each other rather than absolutely — audio channels, EQ bands, blend weights.',
      'When the user needs to hear or see the combined result while adjusting one part of it.',
      'When temporarily removing a channel from the result (mute) or hearing it alone (solo) is part of the work.',
    ],
    whenNotToUse: [
      {
        text: 'There is one value to set.',
        instead: 'a Slider',
        to: '#/slider',
      },
      {
        text: 'The values are independent settings that happen to be numeric.',
        instead: 'a Form — a row of faders implies a relationship that is not there',
        to: '#/form',
      },
      {
        text: 'The numbers must be exact and are typed more often than dragged.',
        instead: 'a Data Table with Number Inputs',
        to: '#/number-input',
      },
      {
        text: 'You are showing levels but not setting them.',
        instead: 'a Chart, or a row of Progress indicators',
        to: '#/chart',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The strips must be identical and the scale must be shared.</strong> The
          comparison only works if a cap at the same height means the same thing on every
          channel. A per-channel range, or a strip with its controls in a different order,
          destroys the one thing a mixer does better than a list of sliders.
        </p>
        <p>
          <strong>The fader is not linear.</strong> Every console gives the top of the travel far
          more room per decibel than the bottom, because that is where the decisions are — the
          difference between &minus;3 and 0&nbsp;dB matters and the difference between &minus;55
          and &minus;58 does not. A linear track puts unity gain three quarters of the way up and
          spends half its length on silence nobody is mixing at.
        </p>
        <p>
          <strong>Meters are output; faders are input.</strong> They sit next to each other and
          look alike, which is exactly why the distinction has to be enforced: the meter is
          <code>aria-hidden</code>, carries no keyboard focus, and never contains information that
          is not also available as text. A meter that is the only source of some fact is a fact
          hidden from anyone not watching it.
        </p>
        <p>
          <strong>Solo is a mode, and modes lie.</strong> A soloed channel silences the others
          without changing their controls, so the interface is now showing a mix the user cannot
          hear. Every mixer that does not make solo loudly visible generates the same support
          ticket: "channel 3 is broken". Dim the strips that solo has silenced.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'strip',
        title: 'One channel strip',
        description:
          'The unit that repeats. Number and colour for identity, a waveform to recognise the clip, the gain readout as text, pan, mute and solo, then the fader and its meter side by side.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-[132px]">
              <ChannelStrip
                channel={INITIAL[0]}
                index={0}
                level={0.62}
                audible
                onChange={() => {}}
              />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'solo',
        title: 'Solo dims what it silenced',
        description:
          'Channel 4 is soloed, so channels 1, 2 and 3 are inaudible without any of their own controls having moved. Dimming them is what stops the user concluding the mixer is broken.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Mixer count={4} showHeader={false} showFooter={false} running={false} />
          </PreviewStage>
        ),
      },
      {
        id: 'compact',
        title: 'Compact, for a sidebar',
        description:
          'Waveforms and the printed dB scale are the first things to go. The controls keep their size — shrinking a fader to fit is how you get a control nobody can land on.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Mixer count={4} compact showHeader={false} showFooter={false} running={false} />
          </PreviewStage>
        ),
      },
      {
        id: 'scale',
        title: 'Why the taper',
        description:
          'The same eight values on a tapered scale and a linear one. On the linear track unity gain sits near the top and the useful range is squeezed into the last centimetre.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="15rem">
              <Cell label="Tapered — usable" tone="good">
                <div className="flex h-40 gap-3 py-1">
                  {[0, -3, -6, -12].map((db, i) => (
                    <Fader key={db} db={db} label={`t${i}`} colour={hue(i)} />
                  ))}
                </div>
              </Cell>
              <Cell label="Linear — unusable near unity" tone="bad">
                <div className="flex h-40 items-end gap-3 py-1">
                  {[0, -3, -6, -12].map((db) => (
                    <div key={db} className="relative flex-1">
                      <span className="absolute inset-x-0 bottom-0 rounded-full bg-[var(--ds-layer-active)]" style={{ blockSize: '100%', inlineSize: 6, marginInline: 'auto' }} />
                      <span
                        className="absolute bottom-0 left-1/2 w-6 -translate-x-1/2 rounded-[3px] border border-[var(--ds-border-strong)] bg-[var(--ds-surface-raised)]"
                        style={{ blockSize: 10, insetBlockEnd: `${((db + 60) / 72) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Unity (0 dB)', render: <div className="h-32"><Fader db={0} label="a" colour="var(--ds-accent)" showScale={false} /></div> },
      { label: 'Attenuated', render: <div className="h-32"><Fader db={-12} label="b" colour="var(--ds-accent)" showScale={false} /></div> },
      { label: 'Boosted', render: <div className="h-32"><Fader db={6} label="c" colour="var(--ds-accent)" showScale={false} /></div> },
      { label: 'Off (-∞)', render: <div className="h-32"><Fader db={-60} label="d" colour="var(--ds-accent)" showScale={false} /></div> },
      { label: 'Disabled', render: <div className="h-32"><Fader db={-6} label="e" colour="var(--ds-accent)" showScale={false} disabled /></div> },
      { label: 'Pan centre', render: <PanKnob pan={0} label="f" colour="var(--ds-accent)" /> },
      { label: 'Pan hard left', render: <PanKnob pan={-100} label="g" colour="var(--ds-accent)" /> },
      { label: 'Muted', render: <div className="w-24"><StripToggle on onChange={() => {}} tone="danger" name="x">Mute</StripToggle></div> },
      { label: 'Soloed', render: <div className="w-24"><StripToggle on onChange={() => {}} tone="warning" name="y">Solo</StripToggle></div> },
      { label: 'Meter, nominal', render: <div className="h-24"><Meter level={0.55} className="w-2.5 h-full" /></div> },
      { label: 'Meter, clipping', render: <div className="h-24"><Meter level={0.99} className="w-2.5 h-full" /></div> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-[132px] py-2">
        <ChannelStrip channel={INITIAL[0]} index={0} level={0.62} audible onChange={() => {}} />
      </div>
    ),
    caption:
      'One strip. Every element sits at the same vertical position on every channel, which is what lets eight of them be read as one picture.',
    parts: [
      { n: 1, label: 'Identity', value: 'Number + colour + name', kind: 'color', note: 'Three redundant signals for the same fact. Colour alone fails for a colour-blind user and fails again the moment there are more channels than distinguishable hues.' },
      { n: 2, label: 'Waveform', value: '32px, decorative', kind: 'size', note: 'Recognising a clip by shape is faster than reading its name. It carries nothing the name does not, so it is aria-hidden.' },
      { n: 3, label: 'Gain readout', value: 'Mono, tabular', kind: 'type', note: 'The number as text. An engineer writes this down; a fader position cannot be written down. Tabular figures so it does not jitter while dragging.' },
      { n: 4, label: 'Pan', value: '44px rotary', kind: 'size', note: 'A range input presented as a rotation, because a pan value is a position between two speakers. Double-click recentres.' },
      { n: 5, label: 'Mute / Solo', value: '28px, aria-pressed', kind: 'shape', note: 'The two controls that change what you hear without moving anything, so they are the two with a lit indicator rather than only a colour change.' },
      { n: 6, label: 'Fader', value: '26 × 40px cap', kind: 'size', note: 'The cap is deliberately large and gripped. It is the control the user reaches for most and the one they aim at while listening rather than looking.' },
      { n: 7, label: 'Scale', value: 'Meaningful stops', kind: 'type', note: '+12 down to -60, with 0 dB given a physical detent line. Printing every step would make it measuring equipment.' },
      { n: 8, label: 'Meter', value: '8px, aria-hidden', kind: 'color', note: 'Output. Segmented so a level is read as a quantity rather than a colour, with the top of the scale red by position as well as by hue.' },
      { n: 9, label: 'Identity bar', value: '4px', kind: 'color', note: 'A solid block at a fixed position is the fastest index across a row of strips.' },
    ],
  },

  tokens: [
    { category: 'color', group: 'Surfaces', token: '--ds-surface-inset', usedFor: 'The console body behind the strips' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface', usedFor: 'Channel strip' },
    { category: 'color', group: 'Surfaces', token: '--ds-surface-raised', usedFor: 'Master strip, and the top of the fader cap gradient' },
    { category: 'color', group: 'Surfaces', token: '--ds-sunken', usedFor: 'Fader rail and meter well — the recessed parts' },
    { category: 'color', group: 'Interaction', token: '--ds-layer-hover', usedFor: 'Mute and solo hover state layer' },
    { category: 'color', group: 'Interaction', token: '--ds-focus-ring', usedFor: 'Focus halo on the fader cap and pan knob' },
    { category: 'color', group: 'Interaction', token: '--ds-border-strong', usedFor: 'Cap border, grip lines, unity detent' },
    { category: 'color', group: 'Meter', token: '--ds-success', usedFor: 'Meter segments up to about -12 dB' },
    { category: 'color', group: 'Meter', token: '--ds-warning', usedFor: 'Meter approaching full scale, and solo' },
    { category: 'color', group: 'Meter', token: '--ds-danger', usedFor: 'Clipping segments, and mute' },
    { category: 'color', group: 'Channel', token: 'Channel hue ramp', value: '8 fixed hues', usedFor: 'Per-channel identity. Not semantic tokens — these are identity hues, the same category as chart series.' },
    { category: 'spacing', token: 'strip width', value: '112–132px', usedFor: 'Narrow enough for eight, wide enough for a 44px pan knob' },
    { category: 'spacing', token: 'hit area', value: '44px', usedFor: 'Invisible target around the fader rail and the knob' },
    { category: 'radius', token: '--radius-md', usedFor: 'Channel strip' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Fader cap, so it reads as sitting on the rail' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Every dB readout and scale label' },
    { category: 'motion', token: '75ms', usedFor: 'Meter segment fade. Never the fader position.' },
  ],

  sizes: [
    { name: 'Strip', minWidth: '112px', maxWidth: '160px', use: 'Below 112px the pan knob drops under the 44px target. Above 160px eight strips stop fitting a laptop.' },
    { name: 'Fader travel', height: '150px min, 210px default', use: 'Under 150px the taper stops buying anything and the useful range collapses.' },
    { name: 'Fader cap', height: '40px', minWidth: '26px', touch: '44px hit area', use: 'Large on purpose — it is aimed at while listening, not while looking.' },
    { name: 'Pan knob', height: '44px', touch: '44px', use: 'The knob is the target; there is no separate hit area to grow.' },
    { name: 'Mute / Solo', height: '28px', use: 'Two per strip, side by side. Below 28px the pair becomes a mis-click risk on the one control that silences audio.' },
    { name: 'Meter', minWidth: '8px', use: 'Segments must stay square-ish. A meter narrower than 6px reads as a line, not a measurement.' },
    { name: 'Master strip', minWidth: '132px', use: 'Wider than a channel, because it carries two meters and must not be mistaken for channel nine.' },
  ],

  do: [
    {
      title: 'Build every control on a native input',
      why: 'The fader and the pan knob are input[type=range] with a painted face. That is the whole keyboard model, the value semantics and forced-colors support for free — and it is the difference between a mixer a keyboard user can operate and a wall of undraggable divs.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;input type="range" style="writing-mode: vertical-rl; direction: rtl" /&gt;
        </code>
      ),
    },
    {
      title: 'Print the value as text next to the control',
      why: 'A fader position cannot be read out, written down or copied. The readout is what makes the mixer usable by someone who is not looking at it, and it is where a screen reader user gets the number.',
      render: (
        <div className="flex w-32 items-baseline justify-between rounded-[var(--radius-xs)] border border-[var(--ds-success-border)] px-2 py-1">
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Gain</span>
          <span className="font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">-4.2 dB</span>
        </div>
      ),
    },
    {
      title: 'Give 0 dB a detent',
      why: 'Unity gain is the one position an engineer looks for without reading the scale. A line on the rail — and a double-click that snaps to it — turns "find zero" from a task into a gesture.',
      render: (
        <div className="h-28"><Fader db={0} label="detent" colour="var(--ds-success)" showScale={false} /></div>
      ),
    },
    {
      title: 'Make solo visibly silence the others',
      why: 'Solo changes what the user hears without changing any control they can see. Dim the strips it silenced, or field the "channel 3 is broken" report forever.',
      render: (
        <Row gap="sm">
          <div className="w-16 rounded-[var(--radius-xs)] border border-[var(--ds-success-border)] p-1.5 text-center text-caption opacity-60">Dimmed</div>
          <div className="w-16 rounded-[var(--radius-xs)] border border-[var(--ds-warning-border)] bg-[var(--ds-warning-subtle)] p-1.5 text-center text-caption text-[var(--ds-warning-text)]">Solo</div>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not give channels different ranges',
      why: 'The comparison is the component. The moment a cap at the same height means -6 dB on one channel and -20 on another, the row of faders is decoration and the user has to read eight numbers instead.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          ch1: -60…0 · ch2: -100…+20 → the shape means nothing
        </span>
      ),
    },
    {
      title: 'Do not animate the fader position',
      why: 'The cap must sit under the pointer. Any transition on its position makes the whole console feel like it is lagging behind the hand — and on a mixer the user is dragging almost continuously.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          transition: bottom 200ms → the cap trails the finger
        </span>
      ),
    },
    {
      title: 'Do not put information only in the meter',
      why: 'It is aria-hidden, it never takes focus, and it is invisible to anyone not watching that pixel at that moment. Clipping in particular has to be a message that persists, not a red LED that already went out.',
      render: (
        <Row gap="sm" align="center">
          <div className="h-12"><Meter level={0.99} className="h-full w-2.5" /></div>
          <span className="text-caption text-[var(--ds-danger-text)]">no text = nobody knows it clipped</span>
        </Row>
      ),
    },
    {
      title: 'Do not shrink the controls to fit more channels',
      why: 'Sixteen strips at 60px each is a mixer nobody can operate. Scroll horizontally and keep the targets — a control you cannot reliably hit is not a smaller control, it is a broken one.',
      render: (
        <Row gap="sm">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-8 rounded-[var(--radius-xs)] border border-[var(--ds-danger-border)] p-1">
              <div className="h-10"><Fader db={-6} label={`tiny${i}`} colour={hue(i)} showScale={false} /></div>
            </div>
          ))}
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The travelled portion of the rail must reach 3:1 against the untravelled portion — that boundary is the value.',
      'The fader cap must reach 3:1 against both the rail and the strip behind it, which is why it is a bordered object with its own elevation rather than a coloured block.',
      'Channel colour is identity, not status, so it is never the only carrier: the number and the name say the same thing.',
      'Meter segment colours are a convention, not a message. Clipping must also be text.',
      'Every dB readout is content and owes 4.5:1 — including the coloured one, which is why the channel hue is lightened for text use.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through one strip at a time in visual order: pan, mute, solo, fader. Predictable order across strips matters more than any single shortcut.' },
      { keys: '↑ / ↓', does: 'Moves the focused fader by one step. ← / → move a pan knob.' },
      { keys: 'Page Up / Page Down', does: 'Larger increment — conventionally 6 dB on a fader.' },
      { keys: 'Home / End', does: 'Jumps to the minimum or maximum of the focused control.' },
      { keys: 'Double-click', does: 'Resets a fader to unity and a pan knob to centre. Provide a keyboard equivalent — this must not be the only way.' },
    ],
    aria: [
      { attr: 'role="slider"', on: 'Faders and pan knobs', note: 'Implicit on input[type=range]. This is the reason to build on it rather than on a div.' },
      { attr: 'aria-valuetext', on: 'Faders and pan knobs', note: '"-4.2 dB", "L22", "Centre". Without it a pan knob announces "-22" and a fader announces a position on an internal 0–1000 scale that means nothing.' },
      { attr: 'aria-orientation="vertical"', on: 'Faders', note: 'Changes which arrow keys are announced as increasing.' },
      { attr: 'aria-label', on: 'Every control', note: 'Scoped by channel — "Narration fader", not "fader". Eight identically-named sliders is the most common failure in this component.' },
      { attr: 'aria-pressed', on: 'Mute and solo', note: 'They are toggle buttons, not links or checkboxes. The pressed state is the whole meaning.' },
      { attr: 'aria-hidden', on: 'Meters, waveforms, identity bars', note: 'Output and decoration. None of them may be the only source of a fact.' },
      { attr: 'role="status"', on: 'The clipping indicator', note: 'A polite live region, so clipping is announced once rather than sixty times a second.' },
    ],
    focus:
      'The ring sits on the fader cap and the knob face, because those are the parts that move. It must stay visible at both ends of the travel, which means the strip needs padding the halo can occupy — a cap at 0 dB with its focus ring clipped by the strip edge is a keyboard user losing their place.',
    screenReader: [
      'Announce as "Narration fader, slider, -4.2 dB". The channel name is part of the label, not context the user is expected to remember.',
      'Never announce meter levels. They change continuously and carry nothing actionable.',
      'Announce mute and solo as pressed states, and announce the consequence when it is not obvious: "Solo on, 7 channels silenced".',
      'Group each strip so navigating by group moves channel to channel rather than control to control.',
    ],
    touch:
      'The fader rail is 6px but its target is the full 44px strip width; the pan knob is 44px square. On touch the fader is the only control that should respond to a drag — a pan knob that rotates on drag competes with page scroll, so on touch it moves in steps on tap instead.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption: 'The strip is the unit. Compose the mixer from it; do not build eight bespoke columns.',
      code: `<Mixer
  channels={channels}
  master={master}
  onChannelChange={(id, patch) => update(id, patch)}
  onMasterChange={setMaster}
/>

// One strip, if you need it alone
<ChannelStrip
  channel={{ id: '1', name: 'Narration', db: 0, pan: 0, mute: false, solo: false }}
  index={0}
  level={peak}
  audible={!muted}
  onChange={(patch) => update('1', patch)}
/>`,
    },
    css: {
      lang: 'css',
      caption:
        'The vertical fader. `appearance: slider-vertical` is deprecated and never shipped in Firefox; writing-mode is the replacement, and `direction: rtl` is what puts the minimum at the bottom.',
      code: `.fader input[type="range"] {
  writing-mode: vertical-rl;
  direction: rtl;          /* minimum at the BOTTOM */
  inline-size: 100%;       /* the 44px target */
  block-size: 100%;
  opacity: 0;              /* the face is painted behind it */
  cursor: pointer;
}

/* Never transition the cap's position — it must sit under the pointer. */
.fader__cap {
  transition: box-shadow var(--duration-fast);
}`,
    },
    api: [
      {
        name: 'Mixer',
        props: [
          { name: 'channels', type: 'Channel[]', required: true, description: 'One entry per strip. Order is the display order.' },
          { name: 'master', type: 'number', required: true, description: 'Master bus gain in dB.' },
          { name: 'onChannelChange', type: '(id: string, patch: Partial<Channel>) => void', description: 'Called for every control on a strip. Patches rather than whole objects, so a fader drag does not have to know about mute.' },
          { name: 'onMasterChange', type: '(db: number) => void', description: 'Master fader.' },
          { name: 'compact', type: 'boolean', default: 'false', description: 'Drops the waveform and the printed dB scale. Never shrinks the controls.' },
          { name: 'levels', type: 'number[]', description: 'Live meter levels, 0–1. Omit and the meters stay dark — they are display only.' },
        ],
      },
      {
        name: 'Channel',
        props: [
          { name: 'id', type: 'string', required: true, description: 'Stable identity. Not the index — strips get reordered.' },
          { name: 'name', type: 'string', required: true, description: 'Used in every aria-label on the strip.' },
          { name: 'db', type: 'number', required: true, description: 'Gain, -60 to +12. -60 is treated as -∞.' },
          { name: 'pan', type: 'number', required: true, description: '-100 (hard left) to +100 (hard right). 0 is centre.' },
          { name: 'mute', type: 'boolean', required: true, description: 'Silences this channel.' },
          { name: 'solo', type: 'boolean', required: true, description: 'Silences every channel that is not soloed. A mode — surface it.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Double-click to reset is the hardware convention and worth honouring — unity on a fader, centre on a pan knob. Give it a keyboard equivalent; it must never be the only route.',
      'Solo should be exclusive by default and additive with a modifier. Most users want "just this one"; power users want "these three".',
      'Keep the master strip visually distinct and at the end. A master that looks like channel nine will be dragged as one.',
      'Peak-hold on the meter — a mark that lingers for a second at the highest recent level — is the single most useful addition, because clipping is over before the eye catches it.',
    ],
    performance: [
      'Meter updates are the whole performance story. Drive them from one animation frame loop for the entire mixer, not one interval per channel.',
      'Never route meter levels through the same state as the controls. Sixty updates a second through a store that also owns fader values will re-render every strip.',
      'Write meter heights directly to the node — a transform or a width — rather than through React state, the way a progress bar does under a drag.',
      'The waveform thumbnail should be generated once and cached per clip. Recomputing peaks on render is invisible with eight channels and fatal with thirty-two.',
    ],
    mistakes: [
      'Eight sliders labelled "slider". The channel name has to be in every aria-label or the whole console is unnavigable by keyboard.',
      'A meter with no text equivalent, so clipping is invisible to anyone who was not looking at that pixel.',
      'Solo with no visible consequence — the most reliable source of "the mixer is broken" reports.',
      'A linear dB scale, which makes the useful range of the fader about a centimetre long.',
      'Transitioning the fader position, which makes every drag feel broken.',
      'Colour as the only channel identity, which fails for a colour-blind user and fails for everyone once there are more channels than distinguishable hues.',
    ],
    realWorld: [
      'Every hardware console ever built puts the fader at the bottom and the meter beside it. That is not nostalgia — it is because the hand rests low and the eye tracks the meter while the hand moves.',
      'Broadcast desks give solo its own colour and its own light because an accidental solo on air is a serious failure. The visual weight is proportional to the cost of the mistake.',
      'DAWs let a strip collapse to a fader and a name and nothing else. That is the honest compact mode: drop information, never target size.',
    ],
  },
})
