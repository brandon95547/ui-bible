import * as React from 'react'
import {
  Activity, AudioLines, Clapperboard, Leaf, Mic, Minus, Music, Plus, RotateCcw,
  SlidersHorizontal, Sparkles, Spline, Trash2, TrendingDown, TrendingUp,
  Volume2, VolumeX, Waves,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button, IconButton } from '@/ui/Button'
import { Tabs } from '@/ui/Navigation'
import { NativeSelect } from '@/ui/Select'
import { Segmented, Switch } from '@/ui/Toggle'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

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

/* Two lightnesses, because one cannot do both jobs. HSL lightness is not
   perceptual: the same L% lands at wildly different contrast depending on the
   hue, so both figures below are the WORST of the eight rather than an average,
   and the violet at 265 is what sets them.

     62%  a fill. The numerals painted on these badges are black, and 58% left
          the violet at 3.91:1 — under AA for an 11px bold numeral.
     74%  the same identity as TEXT or an icon on a dark ground, where 58%
          bottomed out at 2.45:1 against --ds-surface-overlay.

   The identity is unchanged; only the lightness moves, and only far enough. */
function hslHue(deg: number, l: number, s = 78) {
  return `hsl(${deg} ${s}% ${l}%)`
}

function hue(i: number, l = 62, s = 78) {
  return hslHue(CHANNEL_HUES[i % CHANNEL_HUES.length], l, s)
}

/** The same identity, lifted until it is legible as text or as an icon. */
function hueText(i: number) {
  return hue(i, 74)
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
  orientation = 'vertical',
}: {
  level: number
  peak?: number
  className?: string
  /** Horizontal for a list row, where the row itself runs across. */
  orientation?: 'vertical' | 'horizontal'
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex gap-px overflow-hidden rounded-[2px] bg-[var(--ds-sunken)] p-px',
        orientation === 'vertical' ? 'flex-col-reverse' : 'flex-row',
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

// The five buses a video edit actually mixes, in signal order — picture first,
// then the voice it is cut to, then everything under them. "Track 5…8" was
// filler that made the demo look like a music desk; these are the ones a real
// timeline hands you, and the master takes the sum.
const INITIAL: Channel[] = [
  { id: '1', name: 'Media', db: -1.4, pan: 0, mute: false, solo: false },
  { id: '2', name: 'Storyboard', db: -8.5, pan: 0, mute: true, solo: false },
  { id: '3', name: 'Narration', db: 0, pan: 0, mute: false, solo: false },
  { id: '4', name: 'Music', db: -4.2, pan: -22, mute: false, solo: false },
  { id: '5', name: 'SFX', db: -2.1, pan: 10, mute: false, solo: true },
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
          {/* The readout is text, so it takes the lifted lightness — the fill
              value is two points under AA on the violet channel. */}
          <span className="font-mono text-[11px] tabular-nums" style={{ color: hueText(index) }}>
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

      {/* The identity bar. Reading a row of strips is a scanning task, and a
          solid block of colour at a fixed position is the fastest index. */}
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
function ConsoleMixer({
  count = INITIAL.length,
  running = true,
  compact = false,
  showHeader = true,
}: {
  count?: number
  running?: boolean
  compact?: boolean
  showHeader?: boolean
}) {
  const [channels, setChannels] = React.useState(INITIAL)
  const [master, setMaster] = React.useState(0)
  const [masterMute, setMasterMute] = React.useState(false)
  const [levels, setLevels] = React.useState<number[]>(() => INITIAL.map(() => 0.3))

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
      {/* Routing, presets, the preset steppers and the overflow menu all lived
          here. None of them mixed anything: they chose a destination, recalled
          somebody else's balance, or hid whatever was left. A header of chrome
          above the levels made the desk look configurable when the levels ARE
          the configuration. What survives is the one control that acts on the
          mix — put every fader back where it started. */}
      {showHeader && (
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--ds-border-subtle)] pb-3">
          <h3 className="text-title-sm font-semibold tracking-tight text-[var(--ds-fg)]">Mixer</h3>
          <IconButton
            size="sm"
            className="ml-auto"
            label="Reset mixer"
            onClick={reset}
            icon={<RotateCcw size={14} />}
          />
        </header>
      )}

      {/* One scroll container, because a full desk does not fit a phone and
          shrinking it until it does produces controls nobody can hit. */}
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

    </section>
  )
}

/* ===========================================================================
   VARIANT 2 — STUDIO
   The same job arranged the other way round. The console shows every channel
   at once and is optimised for COMPARING them; the studio shows one selected
   track in depth and is optimised for WORKING ON it.

   That is a real difference and not a skin. A console can hold eight faders
   because a fader is narrow; the moment a track needs volume, pan, presence,
   an enhance pass and a noise gate, eight of those side by side is a wall
   nobody can read. So the studio trades simultaneity for room, and pays for it
   with the one weakness the console does not have: you can no longer see the
   balance.
   ======================================================================== */

/* -- Rotary --------------------------------------------------------------
   The knob the studio uses three of. Same contract as the pan knob — a range
   input underneath, rotation on top — but larger, labelled, and with its value
   printed beneath, because these are values an operator reads rather than
   positions they eyeball. */
function RotaryKnob({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  label,
  format,
  colour = 'var(--ds-accent)',
  size = 56,
  reset,
  arc = 135,
}: {
  value: number
  onChange?: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
  format: (v: number) => string
  colour?: string
  size?: number
  reset?: number
  arc?: number
}) {
  const t = (value - min) / (max - min)
  const angle = -arc + t * arc * 2
  const id = React.useId()

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span id={id} className="text-caption text-[var(--ds-fg-secondary)]">
        {label}
      </span>
      <div className="relative" style={{ inlineSize: size, blockSize: size }}>
        <input
          type="range"
          aria-labelledby={id}
          aria-valuetext={format(value)}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          onDoubleClick={() => reset != null && onChange?.(reset)}
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        {/* Travel arc. The knob face alone cannot show how far through the
            range the value sits, and on a 270° sweep that is genuinely hard
            to judge from the pointer angle. */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0">
          <circle
            cx="50" cy="50" r="44" fill="none" strokeWidth="5" strokeLinecap="round"
            stroke="var(--ds-layer-active)"
            strokeDasharray={`${(arc * 2 / 360) * 276} 276`}
            transform="rotate(-225 50 50)"
          />
          <circle
            cx="50" cy="50" r="44" fill="none" strokeWidth="5" strokeLinecap="round"
            stroke={colour}
            strokeDasharray={`${(arc * 2 / 360) * 276 * t} 276`}
            transform="rotate(-225 50 50)"
          />
        </svg>
        <span
          aria-hidden
          className={cn(
            'absolute inset-[14%] rounded-full border border-[var(--ds-border-strong)] shadow-e2',
            'bg-gradient-to-b from-[var(--ds-surface-raised)] to-[var(--ds-surface-inset)]',
            'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]',
          )}
        />
        <span
          aria-hidden
          className="absolute inset-[14%] transition-transform duration-100 motion-reduce:transition-none"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <span
            className="absolute left-1/2 top-[10%] h-[30%] w-[2px] -translate-x-1/2 rounded-full"
            style={{ background: colour }}
          />
        </span>
      </div>
      <span className="font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">{format(value)}</span>
    </div>
  )
}

/* -- Track list ----------------------------------------------------------
   A listbox, not a row of buttons. Selection is the whole navigation model of
   this variant — everything to the right is "the selected track" — so it has
   to carry real single-select semantics and arrow-key movement. */
interface Track {
  id: string
  name: string
  icon: string
  volume: number
  pan: number
  presence: number
  mute: boolean
  solo: boolean
  enhance: boolean
  denoise: boolean
  eq: Eq
  dyn: Dyn
  auto: Auto
}

/* Each tab edits a different DEPTH of the same track, which is why they are
   tabs and not four separate tools: Basic is the everyday four, EQ is
   frequency, Dynamics is consistency over level, Automation is change over
   time. A user works down that list as a problem gets more specific. */
/* EQ is expressed as five NAMED bands rather than raw filter parameters.
   "Warmth" and "Air" are the same numbers a parametric EQ exposes, labelled for
   the person who actually opens this panel — and each band's number ties its
   card to its point on the curve, so the abstract graph and the concrete knob
   are visibly the same control. */
interface EqBand {
  id: string
  n: number
  label: string
  hint: string
  freq: number
  gain: number       // dB; for the low cut this is unused and slope applies
  kind: 'cut' | 'bell' | 'shelf'
  slope?: number     // dB/octave, low cut only
  hueDeg: number
}

interface Eq {
  on: boolean
  preset: string
  bands: EqBand[]
}

/* Dynamics is expressed as AMOUNTS, not thresholds and ratios. A video editor
   asks for "less uneven", not "-18 dB at 3:1", so the panel takes one dial per
   job and derives the engineering underneath. The raw controls still exist —
   behind Advanced — because someone eventually needs them. */
interface Dyn {
  on: boolean
  preset: string
  leveler: number            // 0..100
  target: 'natural' | 'balanced' | 'broadcast'
  comp: number               // 0..100
  deess: number              // 0..100
  gate: number               // threshold dB
  gateOn: boolean
  limiter: boolean
  ceiling: number            // dBTP
}

interface Keyframe {
  id: string
  t: number                  // 0..1 through the timeline
  value: number              // dB
  curve: 'smooth' | 'linear' | 'hold'
}

interface Auto {
  on: boolean
  preset: string
  mode: 'volume' | 'pan' | 'presence'
  tool: 'select' | 'draw' | 'smooth'
  snap: boolean
  zoom: number
  points: Keyframe[]
  duck: number               // 0..100
  fadeIn: number             // seconds
  fadeOut: number
}

const EQ_BANDS: EqBand[] = [
  { id: 'lowcut', n: 1, label: 'Low cut', hint: 'Removes rumble — traffic, air conditioning, desk bumps.', freq: 80, gain: 0, kind: 'cut', slope: 24, hueDeg: 265 },
  { id: 'warmth', n: 2, label: 'Warmth', hint: 'Body and weight. Too much makes speech boomy.', freq: 180, gain: -2.6, kind: 'bell', hueDeg: 30 },
  { id: 'clarity', n: 3, label: 'Clarity', hint: 'Where words become intelligible over music.', freq: 3000, gain: 2.4, kind: 'bell', hueDeg: 200 },
  { id: 'presence', n: 4, label: 'Presence', hint: 'Brings the voice forward, closer to the listener.', freq: 6000, gain: 1.8, kind: 'bell', hueDeg: 140 },
  { id: 'air', n: 5, label: 'Air', hint: 'Openness at the very top. Too much and it hisses.', freq: 12000, gain: 1.6, kind: 'shelf', hueDeg: 335 },
]

const eqFlat = (): Eq => ({
  on: true,
  preset: 'flat',
  bands: EQ_BANDS.map((b) => ({ ...b, gain: 0, slope: b.slope ? 12 : undefined })),
})

const eqVoice = (): Eq => ({ on: true, preset: 'clear-narration', bands: EQ_BANDS.map((b) => ({ ...b })) })

const DYN_OFF: Dyn = {
  on: false, preset: 'none', leveler: 0, target: 'natural', comp: 0, deess: 0,
  gate: -45, gateOn: false, limiter: true, ceiling: -1,
}

const autoFlat = (): Auto => ({
  on: false, preset: 'none', mode: 'volume', tool: 'select', snap: true, zoom: 100,
  points: [
    { id: 'a', t: 0, value: 0, curve: 'smooth' },
    { id: 'b', t: 1, value: 0, curve: 'smooth' },
  ],
  duck: 0, fadeIn: 0, fadeOut: 0,
})

const TRACKS: Track[] = [
  {
    id: 'voice', name: 'Voice', icon: 'Mic', volume: 0, pan: 0, presence: 2,
    mute: false, solo: false, enhance: true, denoise: true,
    eq: eqVoice(),
    dyn: {
      on: true, preset: 'balanced-narration', leveler: 55, target: 'balanced',
      comp: 45, deess: 40, gate: -45, gateOn: true, limiter: true, ceiling: -1,
    },
    auto: {
      ...autoFlat(), on: true, preset: 'documentary-voice', duck: 65, fadeIn: 1.5, fadeOut: 2,
      points: [
        { id: 'a', t: 0, value: -12, curve: 'smooth' },
        { id: 'b', t: 0.17, value: -2, curve: 'smooth' },
        { id: 'c', t: 0.3, value: -0.5, curve: 'smooth' },
        { id: 'd', t: 0.52, value: 2.5, curve: 'smooth' },
        { id: 'e', t: 0.72, value: 1, curve: 'smooth' },
        { id: 'f', t: 0.87, value: -4, curve: 'smooth' },
        { id: 'g', t: 1, value: -12, curve: 'smooth' },
      ],
    },
  },
  {
    id: 'music', name: 'Music', icon: 'Music', volume: -8.5, pan: -14, presence: 0,
    mute: false, solo: false, enhance: false, denoise: false,
    eq: { ...eqFlat(), preset: 'music-bed' },
    dyn: { ...DYN_OFF, on: true, preset: 'gentle', leveler: 25, comp: 30 },
    auto: {
      ...autoFlat(), on: true, duck: 65, fadeOut: 3,
      points: [
        { id: 'a', t: 0, value: 0, curve: 'smooth' },
        { id: 'b', t: 0.2, value: -9, curve: 'smooth' },
        { id: 'c', t: 0.7, value: -9, curve: 'smooth' },
        { id: 'd', t: 1, value: -24, curve: 'smooth' },
      ],
    },
  },
  {
    id: 'effects', name: 'Effects', icon: 'Sparkles', volume: -4, pan: 22, presence: 0,
    mute: false, solo: false, enhance: false, denoise: false,
    eq: eqFlat(), dyn: { ...DYN_OFF }, auto: autoFlat(),
  },
  {
    id: 'ambience', name: 'Ambience', icon: 'Leaf', volume: -18, pan: 0, presence: -1.5,
    mute: false, solo: false, enhance: false, denoise: true,
    eq: {
      ...eqFlat(),
      bands: EQ_BANDS.map((b) =>
        b.id === 'lowcut' ? { ...b, freq: 120 } : b.id === 'air' ? { ...b, gain: -3 } : { ...b, gain: 0 }),
    },
    dyn: { ...DYN_OFF }, auto: autoFlat(),
  },
  {
    id: 'clips', name: 'Clips', icon: 'Clapperboard', volume: -6, pan: 0, presence: 0,
    mute: true, solo: false, enhance: false, denoise: false,
    eq: eqFlat(), dyn: { ...DYN_OFF }, auto: autoFlat(),
  },
]

function TrackRow({
  track,
  index,
  selected,
  level,
  onSelect,
  onMute,
}: {
  track: Track
  index: number
  selected: boolean
  level: number
  onSelect: () => void
  onMute: () => void
}) {
  const colour = hue(index)

  return (
    <li
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border p-2.5 transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        selected
          ? 'border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)]'
          : 'border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] hover:bg-[var(--ds-layer-hover)]',
        track.mute && 'opacity-55',
      )}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]"
        style={{ background: `color-mix(in oklab, ${colour} 18%, transparent)`, color: hueText(index) }}
      >
        <TrackGlyph name={track.icon} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-sm font-medium text-[var(--ds-fg)]">
          {track.name}
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: colour }} />
          {/* Horizontal because the row is horizontal. Same rules as the
              console meter: decorative, aria-hidden, never the only source. */}
          <Meter level={track.mute ? 0 : level} orientation="horizontal" className="h-1.5 w-16" />
        </span>
      </span>

      <button
        type="button"
        aria-pressed={track.mute}
        aria-label={`Mute ${track.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onMute()
        }}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
          track.mute
            ? 'border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] text-[var(--ds-danger-text)]'
            : 'border-transparent text-[var(--ds-fg-muted)] hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)]',
        )}
      >
        {track.mute ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
    </li>
  )
}

function TrackGlyph({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    Mic: <Mic size={16} />,
    Music: <Music size={16} />,
    Sparkles: <Sparkles size={16} />,
    Leaf: <Leaf size={16} />,
    Clapperboard: <Clapperboard size={16} />,
  }
  return <>{map[name] ?? <Music size={16} />}</>
}

/* ---------------------------------------------------------------------------
   PANEL PRIMITIVES
   EQ and Dynamics are both "a named value with a range", many times over. One
   control, used consistently, is what stops the two panels looking like two
   different products.
   ------------------------------------------------------------------------ */
function Param({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  format,
  disabled,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format: (v: number) => string
  disabled?: boolean
  /** Plain-language note. These panels are the ones a non-engineer meets. */
  hint?: string
}) {
  const id = React.useId()
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('min-w-0', disabled && 'opacity-50')}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="truncate text-caption text-[var(--ds-fg-secondary)]">
          {label}
        </label>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">
          {format(value)}
        </span>
      </div>
      <div className="relative mt-1 flex items-center" style={{ blockSize: 16 }}>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={format(value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(Number(e.target.value))}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
        <span aria-hidden className="absolute inset-x-0 h-1 rounded-full bg-[var(--ds-layer-active)]" />
        <span
          aria-hidden
          className="absolute left-0 h-1 rounded-full bg-[var(--ds-accent)]"
          style={{ inlineSize: `${pct}%` }}
        />
        <span
          aria-hidden
          className={cn(
            'absolute h-3 w-3 rounded-full border-2 border-[var(--ds-accent)] bg-white shadow-e1',
            'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]',
          )}
          style={{ insetInlineStart: `calc(${pct}% - 6px)` }}
        />
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[10px] leading-snug text-[var(--ds-fg-muted)]">
          {hint}
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   PANEL SHELL
   Every tab renders into the same box, at the same height.

   That is a hard requirement rather than a nicety. These panels are switched
   between constantly while listening, and a shell that grows or shrinks moves
   the tab strip, the track list and the master meters under the pointer every
   time — so the control you were about to click is somewhere else, and the
   meters you were watching jump. The height is set once by the tallest panel
   and every other one fills it.
   ------------------------------------------------------------------------ */
const PANEL_MIN_H = 560

function PanelShell({
  title,
  blurb,
  children,
  footer,
}: {
  title: string
  blurb: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div
      // A FIXED height, not a minimum. A minimum only sets a floor, so the
      // tallest panel still grows past it once its cards wrap at a narrow
      // width — which is the exact jump this is meant to prevent. The header
      // and the footer are pinned; only the middle scrolls, so the preset row
      // and the on/off stay in the same place in every tab.
      className="flex flex-col gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3"
      style={{ blockSize: PANEL_MIN_H }}
    >
      <div className="shrink-0">
        <p className="text-overline uppercase tracking-wide text-[var(--ds-fg-muted)]">{title}</p>
        <p className="mt-0.5 text-caption text-[var(--ds-fg-secondary)]">{blurb}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">{children}</div>
      <div className="shrink-0">{footer}</div>
    </div>
  )
}

/* The row every panel ends with: a named preset, an A/B compare, the panel's
   own on/off, and a reset. Identical in all three, because the user learns it
   once — and because "is this panel even doing anything" has to be answerable
   in the same place every time. */
function PanelFooter({
  presets,
  preset,
  onPreset,
  on,
  onToggle,
  onReset,
  label,
}: {
  presets: { value: string; label: string }[]
  preset: string
  onPreset: (v: string) => void
  on: boolean
  onToggle: (v: boolean) => void
  onReset: () => void
  label: string
}) {
  const [ab, setAb] = React.useState<'a' | 'b'>('a')
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-[var(--ds-border-subtle)] pt-2.5">
      <label className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-caption text-[var(--ds-fg-muted)]">Preset</span>
        <NativeSelect
          size="sm"
          aria-label={`${label} preset`}
          value={preset}
          onChange={(e) => onPreset(e.target.value)}
          options={presets}
          className="min-w-0 flex-1"
        />
      </label>
      {/* A/B is two states of one control, not two buttons — which is exactly
          what a segmented control is for. */}
      <Segmented
        aria-label={`${label} compare`}
        value={ab}
        onChange={(v) => setAb(v as 'a' | 'b')}
        size="sm"
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
      />
      <Switch checked={on} onCheckedChange={onToggle} label={`${label} on`} size="sm" />
      <Button size="xs" variant="outlined" onClick={onReset}>
        <RotateCcw size={13} />
        Reset
      </Button>
    </div>
  )
}

/* The suggestion bar. It states what it would do in the user's terms and needs
   one click to accept — never applying itself, because a panel that changes
   under you is one you stop trusting. */
function RecommendationBar({ text, onApply }: { text: string; onApply: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--ds-accent-border)] bg-[var(--ds-accent-subtle)] px-2.5 py-2">
      <Sparkles size={14} className="shrink-0 text-[var(--ds-accent-text)]" />
      <p className="min-w-0 flex-1 text-caption text-[var(--ds-accent-text)]">{text}</p>
      <Button size="xs" variant="tonal" onClick={onApply}>
        Apply recommendation
      </Button>
    </div>
  )
}

/* A compact knob for a band or a dynamics stage: the same range-input contract
   as every other rotary here, sized to sit inside a card. */
function MiniKnob({
  value,
  onChange,
  min,
  max,
  step = 0.1,
  label,
  colour,
  size = 52,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  label: string
  colour: string
  size?: number
}) {
  const t = (value - min) / (max - min)
  const angle = -135 + t * 270
  return (
    <div className="relative shrink-0" style={{ inlineSize: size, blockSize: size }}>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0">
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
          stroke="var(--ds-layer-active)" strokeDasharray="212 283" transform="rotate(-225 50 50)" />
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
          stroke={colour} strokeDasharray={`${212 * t} 283`} transform="rotate(-225 50 50)" />
      </svg>
      <span
        aria-hidden
        className={cn(
          'absolute inset-[16%] rounded-full border border-[var(--ds-border-strong)] shadow-e1',
          'bg-gradient-to-b from-[var(--ds-surface-raised)] to-[var(--ds-surface-inset)]',
          'peer-focus-visible:ring-[3px] peer-focus-visible:ring-[var(--ds-focus-ring)]',
        )}
      />
      <span
        aria-hidden
        className="absolute inset-[16%] transition-transform duration-100 motion-reduce:transition-none"
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span className="absolute left-1/2 top-[8%] h-[32%] w-[2px] -translate-x-1/2 rounded-full"
          style={{ background: colour }} />
      </span>
    </div>
  )
}

/* -- EQ -------------------------------------------------------------------
   The curve is the point. Frequency controls are the hardest part of a mixer
   for a non-engineer, and a shape they can see is what turns "mid gain +3 at
   2.4k" from jargon into "this bump makes the voice cut through". The curve is
   derived from the controls, never edited independently — two sources of truth
   for the same filter is how they drift. */
function bandContribution(b: EqBand, f: number) {
  const x = Math.log10(f)
  if (b.kind === 'cut') return -(b.slope ?? 24) * 0.6 / (1 + Math.pow(f / b.freq, 4))
  if (b.kind === 'shelf') return b.gain * (1 / (1 + Math.pow(b.freq / f, 2)))
  return b.gain * Math.exp(-Math.pow((x - Math.log10(b.freq)) / 0.42, 2))
}

function eqResponse(eq: Eq, f: number) {
  if (!eq.on) return 0
  return eq.bands.reduce((db, b) => db + bandContribution(b, f), 0)
}

const EQ_AXIS = [
  { f: 20, label: '20 Hz' }, { f: 50, label: '50' }, { f: 100, label: '100' },
  { f: 200, label: '200' }, { f: 500, label: '500' }, { f: 1000, label: '1k' },
  { f: 2000, label: '2k' }, { f: 5000, label: '5k' }, { f: 10000, label: '10k' },
  { f: 20000, label: '20k' },
]
const EQ_DB_AXIS = [12, 6, 0, -6, -12]

/** The curve in words. A shape nobody can read aloud is a setting nobody can verify. */
function eqSummary(eq: Eq) {
  if (!eq.on) return 'EQ is off. The track is unchanged.'
  const parts = eq.bands
    .filter((b) => (b.kind === 'cut' ? true : Math.abs(b.gain) > 0.2))
    .map((b) =>
      b.kind === 'cut'
        ? `${b.label.toLowerCase()} below ${b.freq} hertz`
        : `${b.label.toLowerCase()} ${b.gain > 0 ? 'up' : 'down'} ${Math.abs(b.gain).toFixed(1)} decibels at ${fmtHz(b.freq)}`)
  return parts.length ? `Frequency response: ${parts.join(', ')}.` : 'Frequency response: flat, no adjustment.'
}

function fmtHz(f: number) {
  return f >= 1000 ? `${(f / 1000).toFixed(f >= 10000 ? 0 : 1)} kHz` : `${Math.round(f)} Hz`
}

/* The graph. Large, because it is the primary thing on this tab — the curve is
   what makes frequency legible to someone who does not think in hertz, and a
   thumbnail of it teaches nothing.

   Each band's point is NUMBERED and matches the number on its card below. That
   pairing is what stops the graph being decoration: touch a knob, watch its
   own dot move. */
function EqGraph({ eq }: { eq: Eq }) {
  const W = 600
  const H = 260
  const fx = (f: number) => ((Math.log10(f) - Math.log10(20)) / 3) * W
  const gy = (db: number) => H / 2 - (db / 14) * (H / 2)

  const d = React.useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 200; i++) {
      const f = 20 * Math.pow(1000, i / 200)
      pts.push(`${i === 0 ? 'M' : 'L'}${fx(f).toFixed(1)},${gy(eqResponse(eq, f)).toFixed(1)}`)
    }
    return pts.join(' ')
  }, [eq])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={eqSummary(eq)}>
      {EQ_DB_AXIS.map((db) => (
        <g key={db}>
          <line x1="0" y1={gy(db)} x2={W} y2={gy(db)} strokeWidth="1" vectorEffect="non-scaling-stroke"
            stroke={db === 0 ? 'var(--ds-border-strong)' : 'var(--ds-border-subtle)'} />
          <text x="4" y={gy(db) - 3} className="fill-[var(--ds-fg-muted)]" style={{ fontSize: 10 }}>
            {db > 0 ? `+${db}` : db}
          </text>
        </g>
      ))}
      {EQ_AXIS.map((a) => (
        <line key={a.f} x1={fx(a.f)} y1="0" x2={fx(a.f)} y2={H} stroke="var(--ds-border-subtle)"
          strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" />
      ))}

      <path d={`${d} L${W},${H} L0,${H} Z`} fill="var(--ds-accent)" opacity={eq.on ? 0.12 : 0.04} />
      <path d={d} fill="none" stroke="var(--ds-accent)" strokeWidth="2.5"
        vectorEffect="non-scaling-stroke" opacity={eq.on ? 1 : 0.35} />

      {eq.bands.map((b) => {
        const y = gy(b.kind === 'cut' ? -3 : b.gain)
        return (
          <g key={b.id} opacity={eq.on ? 1 : 0.35}>
            <circle cx={fx(b.freq)} cy={y} r="11" fill={hslHue(b.hueDeg, 62)} />
            <text x={fx(b.freq)} y={y + 4} textAnchor="middle" fill="#0b0b0f"
              style={{ fontSize: 12, fontWeight: 700 }}>{b.n}</text>
          </g>
        )
      })}
    </svg>
  )
}

const EQ_PRESETS = [
  { value: 'clear-narration', label: 'Clear narration' },
  { value: 'warm-voice', label: 'Warm voice' },
  { value: 'music-bed', label: 'Music bed' },
  { value: 'flat', label: 'Flat' },
]

function EqPanel({
  eq,
  onChange,
  name,
}: {
  eq: Eq
  onChange: (p: Partial<Eq>) => void
  name: string
}) {
  const patchBand = (id: string, p: Partial<EqBand>) =>
    onChange({ bands: eq.bands.map((b) => (b.id === id ? { ...b, ...p } : b)) })

  return (
    <PanelShell
      title={`${name} EQ`}
      blurb="Turns parts of the sound up or down by pitch. Each control below is one point on the graph."
      footer={
        <PanelFooter
          label="EQ"
          presets={EQ_PRESETS}
          preset={eq.preset}
          onPreset={(preset) => onChange({ preset })}
          on={eq.on}
          onToggle={(on) => onChange({ on })}
          onReset={() => onChange(eqFlat())}
        />
      }
    >
      <div className="h-56 shrink-0 rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-1">
        <EqGraph eq={eq} />
      </div>
      <div aria-hidden className="flex justify-between px-1 text-[9px] tabular-nums text-[var(--ds-fg-muted)]">
        {EQ_AXIS.map((a) => <span key={a.f}>{a.label}</span>)}
      </div>

      {/* One card per band, numbered to its point on the graph. The card shows
          the plain name first and the engineering underneath, which is the
          order the reader needs them in. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {eq.bands.map((b) => {
          const colour = hslHue(b.hueDeg, 62)
          const isCut = b.kind === 'cut'
          return (
            <div
              key={b.id}
              className="flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border p-2"
              style={{
                borderColor: `color-mix(in oklab, ${colour} 40%, transparent)`,
                background: `color-mix(in oklab, ${colour} 7%, transparent)`,
              }}
              title={b.hint}
            >
              <span className="flex w-full items-center gap-1.5">
                <span aria-hidden
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
                  style={{ background: colour }}>{b.n}</span>
                <span className="truncate text-caption text-[var(--ds-fg)]">{b.label}</span>
              </span>

              <MiniKnob
                label={`${b.label} ${isCut ? 'frequency' : 'gain'}`}
                colour={colour}
                value={isCut ? b.freq : b.gain}
                min={isCut ? 20 : -12}
                max={isCut ? 300 : 12}
                step={isCut ? 1 : 0.1}
                onChange={(v) => patchBand(b.id, isCut ? { freq: v } : { gain: v })}
              />

              <span className="text-center font-mono text-[10px] leading-tight tabular-nums text-[var(--ds-fg)]">
                {fmtHz(b.freq)}
                <br />
                <span className="text-[var(--ds-fg-muted)]">
                  {isCut ? `${b.slope} dB/oct` : `${b.gain > 0 ? '+' : ''}${b.gain.toFixed(1)} dB`}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {/* The curve as text. Same fact, for anyone who cannot read a shape. */}
      <p className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] px-2 py-1.5 text-[11px] text-[var(--ds-fg-secondary)]">
        {eqSummary(eq)}
      </p>

      <RecommendationBar
        text="Remove rumble and improve speech clarity."
        onApply={() => onChange(eqVoice())}
      />
    </PanelShell>
  )
}

/* -- Dynamics -------------------------------------------------------------
   The transfer curve is the honest display here: threshold and ratio are two
   numbers whose combined effect is genuinely hard to imagine, and the bend in
   the line IS that effect. */
/* Before and after, on one timeline.

   A transfer curve is the engineer's display and it explains the maths; this
   explains the RESULT. Two traces over the same waveform — what went in, what
   came out — say "the loud parts came down and the quiet parts came up" in a
   way no threshold number does, which is the whole point of describing this
   panel in a video editor's terms. */
function DynWave({ dyn }: { dyn: Dyn }) {
  const W = 600
  const H = 120
  const mid = H / 2

  const { inPath, outPath } = React.useMemo(() => {
    let s = 20250803
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    const inPts: string[] = []
    const outPts: string[] = []
    const amount = dyn.on ? (dyn.leveler * 0.6 + dyn.comp * 0.4) / 100 : 0
    for (let i = 0; i <= 150; i++) {
      const x = (i / 150) * W
      // A speech-like envelope: phrases with gaps.
      const phrase = Math.abs(Math.sin(i / 9)) * (0.55 + rnd() * 0.45)
      const raw = Math.pow(phrase, 1.4)
      // Levelling pulls everything towards the middle of the range.
      const evened = raw + (0.62 - raw) * amount
      inPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(mid - raw * mid * 0.92).toFixed(1)}`)
      outPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(mid - evened * mid * 0.72).toFixed(1)}`)
    }
    return { inPath: inPts.join(' '), outPath: outPts.join(' ') }
  }, [dyn.on, dyn.leveler, dyn.comp])

  const thresholdY = mid - ((dyn.gate + 60) / 60) * mid * 0.9

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" role="img"
      aria-label={dynSummary(dyn)}>
      <path d={`${inPath} L${W},${mid} L0,${mid} Z`} fill="var(--ds-accent)" opacity="0.16" />
      <path d={inPath} fill="none" stroke="var(--ds-accent)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.8" />
      <path d={outPath} fill="none" stroke="var(--ds-success)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {dyn.gateOn && (
        <line x1="0" y1={thresholdY} x2={W} y2={thresholdY} stroke="var(--ds-warning)"
          strokeWidth="1.4" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  )
}

function dynSummary(dyn: Dyn) {
  if (!dyn.on) return 'Dynamics is off. The track is unchanged.'
  const parts: string[] = []
  if (dyn.leveler > 2) parts.push(`voice levelling ${Math.round(dyn.leveler)} per cent, target ${dyn.target}`)
  if (dyn.comp > 2) parts.push(`compression ${Math.round(dyn.comp)} per cent`)
  if (dyn.deess > 2) parts.push(`harsh S sounds reduced ${Math.round(dyn.deess)} per cent`)
  if (dyn.gateOn) parts.push(`background noise silenced below ${dyn.gate} decibels`)
  if (dyn.limiter) parts.push(`limiter on, ceiling ${dyn.ceiling.toFixed(1)} dBTP`)
  return parts.length ? `Before and after: ${parts.join(', ')}.` : 'No dynamics processing applied.'
}

const DYN_PRESETS = [
  { value: 'balanced-narration', label: 'Balanced narration' },
  { value: 'gentle', label: 'Gentle levelling' },
  { value: 'broadcast', label: 'Broadcast' },
  { value: 'none', label: 'None' },
]

/** One named stage: an icon, a plain sentence, and its own control. */
function DynStage({
  icon,
  title,
  blurb,
  children,
}: {
  icon: React.ReactNode
  title: string
  blurb: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-2.5">
      <div className="flex items-start gap-2">
        <span aria-hidden className="mt-0.5 shrink-0 text-[var(--ds-accent)]">{icon}</span>
        <div className="min-w-0">
          <p className="text-body-sm font-medium text-[var(--ds-fg)]">{title}</p>
          <p className="text-[10px] leading-snug text-[var(--ds-fg-muted)]">{blurb}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function DynamicsPanel({
  dyn,
  onChange,
  name,
  reduction,
  inLevel,
  outLevel,
}: {
  dyn: Dyn
  onChange: (p: Partial<Dyn>) => void
  name: string
  reduction: number
  inLevel: number
  outLevel: number
}) {
  return (
    <PanelShell
      title={`${name} dynamics`}
      blurb="Evens out volume that jumps around — quiet words lifted, loud ones held back, hiss removed between phrases."
      footer={
        <PanelFooter
          label="Dynamics"
          presets={DYN_PRESETS}
          preset={dyn.preset}
          onPreset={(preset) => onChange({ preset })}
          on={dyn.on}
          onToggle={(on) => onChange({ on })}
          onReset={() => onChange({ ...DYN_OFF })}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {[
          ['Input (before)', 'var(--ds-accent)'],
          ['Output (after)', 'var(--ds-success)'],
          ['Gate threshold', 'var(--ds-warning)'],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5 text-[10px] text-[var(--ds-fg-secondary)]">
            <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      {/* IN and OUT flank the trace, so "it got more even" is a comparison you
          can make without moving your eyes off the panel. */}
      <div className="flex h-32 shrink-0 gap-2">
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span aria-hidden className="text-[9px] text-[var(--ds-fg-muted)]">IN</span>
          <Meter level={inLevel} className="w-2 flex-1" />
        </div>
        <div className="min-w-0 flex-1 rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-1">
          <DynWave dyn={dyn} />
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span aria-hidden className="text-[9px] text-[var(--ds-fg-muted)]">OUT</span>
          <Meter level={outLevel} className="w-2 flex-1" />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <DynStage icon={<AudioLines size={15} />} title="Voice leveler"
          blurb="Keeps your voice at a consistent level throughout.">
          <div className="flex items-center gap-3">
            <MiniKnob label="Voice leveler amount" colour="var(--ds-accent)" value={dyn.leveler}
              min={0} max={100} step={1} onChange={(leveler) => onChange({ leveler })} />
            <label className="min-w-0 flex-1">
              <span className="text-[10px] text-[var(--ds-fg-muted)]">Target</span>
              <NativeSelect
                size="sm" aria-label="Leveler target" value={dyn.target}
                onChange={(e) => onChange({ target: e.target.value as Dyn['target'] })}
                options={[
                  { value: 'natural', label: 'Natural' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'broadcast', label: 'Broadcast' },
                ]}
              />
            </label>
          </div>
        </DynStage>

        <DynStage icon={<Activity size={15} />} title="Compressor"
          blurb="Controls loud peaks for a smoother, steadier sound.">
          <div className="flex items-center gap-3">
            <MiniKnob label="Compressor amount" colour="var(--ds-warning)" value={dyn.comp}
              min={0} max={100} step={1} onChange={(comp) => onChange({ comp })} />
            <div className="min-w-0 flex-1">
              {/* Gain reduction is the one live number proving the compressor
                  is doing anything at all. Without it, an amount dial has no
                  visible consequence and gets tuned by superstition. */}
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-[var(--ds-fg-muted)]">Gain reduction</span>
                <span className="font-mono text-[10px] tabular-nums text-[var(--ds-fg)]">
                  -{reduction.toFixed(1)} dB
                </span>
              </div>
              <Meter level={Math.min(1, reduction / 12)} orientation="horizontal" className="mt-1 h-2 w-full" />
            </div>
          </div>
        </DynStage>

        <DynStage icon={<Waves size={15} />} title="De-esser"
          blurb="Tames sharp S sounds without dulling the whole track.">
          <div className="flex items-center gap-3">
            <MiniKnob label="De-esser amount" colour="var(--ds-info)" value={dyn.deess}
              min={0} max={100} step={1} onChange={(deess) => onChange({ deess })} />
            <p className="text-[11px] text-[var(--ds-fg-secondary)]">
              {dyn.deess < 2 ? 'Off' : `Reducing harsh S sounds by ${Math.round(dyn.deess)}%`}
            </p>
          </div>
        </DynStage>

        <DynStage icon={<Activity size={15} />} title="Noise gate"
          blurb="Silences background noise when nobody is speaking.">
          <Param
            label="Threshold" value={dyn.gate} min={-70} max={-20}
            onChange={(gate) => onChange({ gate })} disabled={!dyn.gateOn}
            format={(v) => `${v.toFixed(0)} dB`}
          />
          <Switch checked={dyn.gateOn} onCheckedChange={(gateOn) => onChange({ gateOn })}
            label="Silence background noise between words" size="sm" />
        </DynStage>
      </div>

      {/* The limiter is the safety net, so it reads as a status rather than
          another dial: on or off, one number, and a plain verdict. */}
      <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-2.5">
        <Switch checked={dyn.limiter} onCheckedChange={(limiter) => onChange({ limiter })}
          label="Limiter" description="Prevents distortion and protects your audio." size="sm" />
        <label className="ml-auto flex items-center gap-2">
          <span className="text-caption text-[var(--ds-fg-muted)]">Ceiling</span>
          <NativeSelect
            size="sm" aria-label="Limiter ceiling" value={String(dyn.ceiling)}
            onChange={(e) => onChange({ ceiling: Number(e.target.value) })}
            options={[
              { value: '-1', label: '-1.0 dBTP' },
              { value: '-2', label: '-2.0 dBTP' },
              { value: '-0.3', label: '-0.3 dBTP' },
            ]}
          />
        </label>
        <span className={cn('badge badge--sm', dyn.limiter ? 'badge--success' : 'badge--warning')}>
          <span className="badge__dot" />
          {dyn.limiter ? 'Safe output' : 'Unprotected'}
        </span>
      </div>

      <RecommendationBar
        text="Smooth uneven narration and control harsh peaks."
        onApply={() =>
          onChange({
            on: true, preset: 'balanced-narration', leveler: 55, target: 'balanced',
            comp: 45, deess: 40, gateOn: true, gate: -45, limiter: true,
          })}
      />
    </PanelShell>
  )
}

/* -- Automation -----------------------------------------------------------
   Changing a value over time. The lane is the display everybody builds; the
   LIST beside it is the part most tools skip, and it is the only reason this
   panel works without a mouse. Dragging a point on a canvas is unreachable by
   keyboard, so every keyframe is also a row with a real control. */
const AUTO_PRESETS = [
  { value: 'documentary-voice', label: 'Documentary voice' },
  { value: 'music-under', label: 'Music under narration' },
  { value: 'none', label: 'None' },
]

const fmtTime = (t: number) => `0:${String(Math.round(t * 60)).padStart(2, '0')}`

/* The automation lane. A waveform behind, the level line in front, points on
   the line — and a point editor that is real controls rather than a drag.

   Dragging a dot on a canvas is the fast path and it is unreachable by
   keyboard: a canvas cannot take focus and has no value semantics. So selecting
   a point opens an editor with a real time field, a real level field and a real
   curve select, and the lane is a picture of that state rather than a separate
   interface. This is the part most tools skip. */
function AutoLane({
  auto,
  seed,
  selected,
  onSelect,
}: {
  auto: Auto
  seed: number
  selected: string | null
  onSelect: (id: string) => void
}) {
  const W = 600
  const H = 200
  const gy = (v: number) => H / 2 - (v / 30) * (H / 2)
  const pts = [...auto.points].sort((a, b) => a.t - b.t)

  const wave = React.useMemo(() => {
    let s = seed * 7919 + 13
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    return Array.from({ length: 110 }, () => 0.2 + Math.pow(rnd(), 1.5) * 0.8)
  }, [seed])

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.t * W).toFixed(1)},${gy(p.value).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
      aria-label={`${auto.mode} automation, ${pts.length} points. ${pts.map((p) => `${fmtTime(p.t)} at ${p.value > 0 ? 'plus ' : ''}${p.value.toFixed(1)} decibels`).join('; ')}.`}>
      {/* Waveform behind, so the points can be placed against what is actually
          being said rather than against an empty grid. */}
      {wave.map((h, i) => (
        <rect key={i} x={(i / wave.length) * W} width={W / wave.length - 1}
          y={H / 2 - (h * H) / 2.6} height={(h * H) / 1.3}
          fill="var(--ds-accent)" opacity="0.18" />
      ))}
      {[12, 0, -12, -24].map((db) => (
        <g key={db}>
          <line x1="0" y1={gy(db)} x2={W} y2={gy(db)} strokeWidth="1" vectorEffect="non-scaling-stroke"
            strokeDasharray={db === 0 ? undefined : '4 4'}
            stroke={db === 0 ? 'var(--ds-border-strong)' : 'var(--ds-border-subtle)'} />
          <text x="4" y={gy(db) - 3} className="fill-[var(--ds-fg-muted)]" style={{ fontSize: 10 }}>
            {db > 0 ? `+${db}` : db === 0 ? '0 dB' : db}
          </text>
        </g>
      ))}

      <path d={line} fill="none" stroke="var(--ds-success)" strokeWidth="2.5"
        vectorEffect="non-scaling-stroke" opacity={auto.on ? 1 : 0.35} />

      {pts.map((p) => (
        <circle
          key={p.id} cx={p.t * W} cy={gy(p.value)} r={p.id === selected ? 8 : 6}
          fill={p.id === selected ? 'var(--ds-success)' : 'var(--ds-surface)'}
          stroke="var(--ds-success)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"
          className="cursor-pointer"
          onClick={() => onSelect(p.id)}
        />
      ))}
    </svg>
  )
}

/** The ducking lane: music level pushed down under narration, over time. */
function DuckLane({ amount }: { amount: number }) {
  const W = 600
  const H = 70
  const drop = (amount / 100) * 0.72
  const segs = [[0.1, 0.26], [0.34, 0.5], [0.58, 0.72], [0.8, 0.95]]
  let d = `M0,${H * 0.18}`
  segs.forEach(([a, b]) => {
    d += ` L${a * W - 18},${H * 0.18} C${a * W - 4},${H * 0.18} ${a * W},${H * (0.18 + drop)} ${a * W + 14},${H * (0.18 + drop)}`
    d += ` L${b * W - 14},${H * (0.18 + drop)} C${b * W},${H * (0.18 + drop)} ${b * W + 4},${H * 0.18} ${b * W + 18},${H * 0.18}`
  })
  d += ` L${W},${H * 0.18}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" role="img"
      aria-label={`Music ducking. Music drops ${amount} per cent beneath narration, in four places.`}>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill="var(--ds-warning)" opacity="0.14" />
      <path d={d} fill="none" stroke="var(--ds-warning)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** One of the four one-click jobs. Each is a whole intention, not a parameter. */
function AutoAction({
  icon,
  title,
  detail,
  onClick,
  children,
}: {
  icon: React.ReactNode
  title: string
  detail: string
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-2.5">
      <div className="flex items-start gap-2">
        <span aria-hidden className="mt-0.5 shrink-0 text-[var(--ds-accent)]">{icon}</span>
        <div className="min-w-0">
          <p className="text-body-sm font-medium text-[var(--ds-fg)]">{title}</p>
          <p className="text-[10px] leading-snug text-[var(--ds-fg-muted)]">{detail}</p>
        </div>
      </div>
      {children}
      <Button size="xs" variant="outlined" onClick={onClick} className="mt-auto">
        Apply
      </Button>
    </div>
  )
}

function AutomationPanel({
  auto,
  onChange,
  name,
  seed,
}: {
  auto: Auto
  onChange: (p: Partial<Auto>) => void
  name: string
  seed: number
}) {
  const [selected, setSelected] = React.useState<string | null>(auto.points[0]?.id ?? null)
  const point = auto.points.find((p) => p.id === selected) ?? null

  const patchPoint = (id: string, p: Partial<Keyframe>) =>
    onChange({ points: auto.points.map((k) => (k.id === id ? { ...k, ...p } : k)) })

  const deletePoint = (id: string) => {
    if (auto.points.length <= 2) return   // a lane needs two ends
    onChange({ points: auto.points.filter((k) => k.id !== id) })
    setSelected(null)
  }

  return (
    <PanelShell
      title={`${name} automation`}
      blurb="Changes level over time instead of one setting for the whole track — fades, ducking under narration, and lifting individual quiet phrases."
      footer={
        <PanelFooter
          label="Automation"
          presets={AUTO_PRESETS}
          preset={auto.preset}
          onPreset={(preset) => onChange({ preset })}
          on={auto.on}
          onToggle={(on) => onChange({ on })}
          onReset={() => onChange(autoFlat())}
        />
      }
    >
      {/* Toolbar. Mode says WHAT is being automated — without it, a lane of
          points is ambiguous the moment a track automates more than level. */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5">
          <span className="text-caption text-[var(--ds-fg-muted)]">Automate</span>
          <NativeSelect
            size="sm" aria-label="Automation mode" value={auto.mode}
            onChange={(e) => onChange({ mode: e.target.value as Auto['mode'] })}
            options={[
              { value: 'volume', label: 'Volume' },
              { value: 'pan', label: 'Pan' },
              { value: 'presence', label: 'Presence' },
            ]}
          />
        </label>
        <Segmented
          aria-label="Automation tool"
          value={auto.tool}
          onChange={(v) => onChange({ tool: v as Auto['tool'] })}
          size="sm"
          options={[
            { value: 'select', label: 'Select' },
            { value: 'draw', label: 'Draw' },
            { value: 'smooth', label: 'Smooth' },
          ]}
        />
        <Switch checked={auto.snap} onCheckedChange={(snap) => onChange({ snap })} label="Snap" size="sm" />
        <span className="ml-auto flex items-center gap-1">
          <IconButton size="xs" label="Zoom out"
            onClick={() => onChange({ zoom: Math.max(50, auto.zoom - 25) })} icon={<Minus size={13} />} />
          <span className="w-11 text-center font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">
            {auto.zoom}%
          </span>
          <IconButton size="xs" label="Zoom in"
            onClick={() => onChange({ zoom: Math.min(400, auto.zoom + 25) })} icon={<Plus size={13} />} />
        </span>
      </div>

      <div className="h-48 shrink-0 rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-1">
        <AutoLane auto={auto} seed={seed} selected={selected} onSelect={setSelected} />
      </div>
      <div aria-hidden className="flex justify-between px-1 text-[9px] tabular-nums text-[var(--ds-fg-muted)]">
        {['0:00', '0:10', '0:20', '0:30', '0:40', '0:50', '1:00'].map((t) => <span key={t}>{t}</span>)}
      </div>

      {/* The point editor. Real controls, so every point is reachable and
          adjustable without a pointer. */}
      <div className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] p-2.5">
        {point ? (
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-caption text-[var(--ds-fg-muted)]">
              Point {auto.points.findIndex((p) => p.id === point.id) + 1} of {auto.points.length}
            </span>
            <div className="min-w-[9rem] flex-1">
              <Param label="Time" value={point.t} min={0} max={1} step={0.01}
                onChange={(t) => patchPoint(point.id, { t })} format={fmtTime} />
            </div>
            <div className="min-w-[9rem] flex-1">
              <Param label="Level" value={point.value} min={-30} max={12} step={0.5}
                onChange={(value) => patchPoint(point.id, { value })}
                format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`} />
            </div>
            <label className="flex items-center gap-1.5">
              <span className="text-caption text-[var(--ds-fg-muted)]">Curve</span>
              <NativeSelect
                size="sm" aria-label="Point curve" value={point.curve}
                onChange={(e) => patchPoint(point.id, { curve: e.target.value as Keyframe['curve'] })}
                options={[
                  { value: 'smooth', label: 'Smooth' },
                  { value: 'linear', label: 'Linear' },
                  { value: 'hold', label: 'Hold' },
                ]}
              />
            </label>
            <Button size="xs" variant="danger-outline" onClick={() => deletePoint(point.id)}
              disabled={auto.points.length <= 2}>
              <Trash2 size={13} />
              Delete point
            </Button>
          </div>
        ) : (
          <p className="text-caption text-[var(--ds-fg-muted)]">
            Select a point on the lane to edit its time, level and curve.
          </p>
        )}
      </div>

      {/* Music ducking gets its own lane, because it is the one automation a
          video editor actually asks for by name. */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-caption text-[var(--ds-fg-secondary)]">Music auto-duck</p>
          <label className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--ds-fg-muted)]">Amount</span>
            <input
              type="range" aria-label="Duck amount" aria-valuetext={`${auto.duck} per cent`}
              min={0} max={100} value={auto.duck}
              onChange={(e) => onChange({ duck: Number(e.target.value) })}
              className="w-24 accent-[var(--ds-accent)]"
            />
            <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">
              {auto.duck}%
            </span>
          </label>
        </div>
        <div className="mt-1 h-14 rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-1">
          <DuckLane amount={auto.duck} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <AutoAction icon={<TrendingUp size={15} />} title="Fade in"
          detail="Bring the track up from silence at the start."
          onClick={() => onChange({
            points: [
              { id: 'fi0', t: 0, value: -30, curve: 'smooth' },
              { id: 'fi1', t: Math.min(0.3, auto.fadeIn / 60), value: 0, curve: 'smooth' },
              ...auto.points.filter((p) => p.t > 0.3),
              { id: 'fi2', t: 1, value: 0, curve: 'smooth' },
            ],
          })}
        >
          <label className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--ds-fg-muted)]">Duration</span>
            <NativeSelect size="sm" aria-label="Fade in duration" value={String(auto.fadeIn)}
              onChange={(e) => onChange({ fadeIn: Number(e.target.value) })}
              options={[{ value: '0.5', label: '0.5s' }, { value: '1.5', label: '1.5s' }, { value: '3', label: '3s' }]} />
          </label>
        </AutoAction>

        <AutoAction icon={<TrendingDown size={15} />} title="Fade out"
          detail="Take the track down to silence at the end."
          onClick={() => onChange({
            points: [
              ...auto.points.filter((p) => p.t < 0.7),
              { id: 'fo0', t: 1 - auto.fadeOut / 60, value: 0, curve: 'smooth' },
              { id: 'fo1', t: 1, value: -30, curve: 'smooth' },
            ],
          })}
        >
          <label className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--ds-fg-muted)]">Duration</span>
            <NativeSelect size="sm" aria-label="Fade out duration" value={String(auto.fadeOut)}
              onChange={(e) => onChange({ fadeOut: Number(e.target.value) })}
              options={[{ value: '1', label: '1s' }, { value: '2', label: '2s' }, { value: '4', label: '4s' }]} />
          </label>
        </AutoAction>

        <AutoAction icon={<AudioLines size={15} />} title="Level quiet sections"
          detail="Automatically lift phrases that were recorded too quietly."
          onClick={() => onChange({
            on: true,
            points: [
              { id: 'q0', t: 0, value: 0, curve: 'smooth' },
              { id: 'q1', t: 0.28, value: 3.5, curve: 'smooth' },
              { id: 'q2', t: 0.46, value: 0, curve: 'smooth' },
              { id: 'q3', t: 0.68, value: 4, curve: 'smooth' },
              { id: 'q4', t: 1, value: 0, curve: 'smooth' },
            ],
          })}
        />

        <AutoAction icon={<Spline size={15} />} title="Create music ducking"
          detail="Duck the music beneath narration automatically, wherever there is speech."
          onClick={() => onChange({ on: true, duck: 65 })}
        />
      </div>

      <RecommendationBar
        text="Level quiet phrases and duck music beneath narration."
        onApply={() => onChange({ on: true, preset: 'documentary-voice', duck: 65 })}
      />
    </PanelShell>
  )
}

/* -- Ducking curve -------------------------------------------------------
   Two automation lanes over the same timeline: music drops while voice is
   present. An SVG, because it is a chart — and like every chart on a control
   surface it gets a text summary, since a line nobody can read aloud is a
   setting nobody can verify. */
function DuckCurve({ amount }: { amount: number }) {
  const dip = 0.15 + (amount / 100) * 0.55
  const music = `M0,26 L26,26 C34,26 36,${26 + dip * 40} 46,${26 + dip * 40} L62,${26 + dip * 40} C72,${26 + dip * 40} 74,30 82,30 L120,30`
  const voice = 'M0,16 L24,16 C32,16 34,10 44,10 L64,10 C74,10 76,14 84,14 L120,14'

  return (
    <svg viewBox="0 0 120 76" preserveAspectRatio="none" className="h-full w-full" role="img"
      aria-label={`Ducking automation. Music drops by ${amount} per cent while voice is present.`}>
      <defs>
        <linearGradient id="duckfade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ds-warning)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--ds-warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${music} L120,76 L0,76 Z`} fill="url(#duckfade)" />
      <path d={voice} fill="none" stroke="var(--ds-accent)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <path d={music} fill="none" stroke="var(--ds-warning)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* -- Studio --------------------------------------------------------------- */
function StudioMixer({ running = true }: { running?: boolean }) {
  const [tracks, setTracks] = React.useState(TRACKS)
  const [selectedId, setSelectedId] = React.useState('voice')
  const [duck, setDuck] = React.useState(65)
  const [master, setMaster] = React.useState(0)
  const [limiter, setLimiter] = React.useState(true)
  const [tab, setTab] = React.useState('basic')
  const [levels, setLevels] = React.useState<number[]>(() => TRACKS.map(() => 0.4))

  const selected = tracks.find((t) => t.id === selectedId) ?? tracks[0]
  const selectedIndex = tracks.findIndex((t) => t.id === selected.id)
  const colour = hue(selectedIndex)

  React.useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!running || reduced) return
    const id = window.setInterval(() => {
      setLevels((prev) => prev.map((l) => l + (0.35 + Math.random() * 0.55 - l) * 0.4))
    }, 110)
    return () => window.clearInterval(id)
  }, [running])

  const patch = (p: Partial<Track>) =>
    setTracks((ts) => ts.map((t) => (t.id === selected.id ? { ...t, ...p } : t)))

  // Arrow keys move the selection, because the list is the navigation.
  const moveSelection = (dir: 1 | -1) => {
    const next = (selectedIndex + dir + tracks.length) % tracks.length
    setSelectedId(tracks[next].id)
  }

  const bus = tracks.reduce(
    (n, t, i) => (t.mute ? n : Math.max(n, levels[i] * dbToPos(t.volume))), 0,
  )
  const lufs = -14 - (1 - dbToPos(master)) * 8

  // How much the compressor is actually pulling down right now. Derived from
  // the live level rather than stored, so it moves with the signal the way the
  // real thing does — and reads zero when the panel is off, which is the honest
  // answer rather than a decorative wobble.
  //
  // The amount dial is translated into a threshold and ratio here, which is the
  // whole trade this panel makes: the user says "more even", the engineering is
  // derived, and the gain-reduction meter shows what that actually did.
  const selLevelDb = posToDb(levels[selectedIndex] ?? 0)
  const dynThreshold = -6 - (selected.dyn.comp / 100) * 24
  const dynRatio = 1 + (selected.dyn.comp / 100) * 7
  const reduction = selected.dyn.on && selected.dyn.comp > 2 && selLevelDb > dynThreshold
    ? (selLevelDb - dynThreshold) * (1 - 1 / dynRatio)
    : 0

  return (
    <section
      aria-label="Mix studio"
      className="flex w-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-surface-inset)] p-3"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-[var(--ds-border-subtle)] pb-3">
        <SlidersHorizontal size={18} className="text-[var(--ds-accent)]" />
        <h3 className="text-title-sm font-semibold tracking-tight text-[var(--ds-fg)]">Mix Studio</h3>
        <div className="ml-auto flex items-center gap-2">
          <NativeSelect
            aria-label="Mix preset"
            size="sm"
            defaultValue="film"
            options={[
              { value: 'film', label: 'Film & Documentary' },
              { value: 'podcast', label: 'Podcast' },
              { value: 'music', label: 'Music Bed' },
            ]}
          />
          <IconButton size="sm" label="Undo" icon={<RotateCcw size={14} />} />
          <Button size="sm" variant="filled">
            <Sparkles size={14} />
            Apply mix
          </Button>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(180px,220px)_1fr_minmax(150px,180px)]">
        {/* ---- Tracks ---- */}
        <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-2">
          <p className="px-1 text-overline uppercase tracking-wide text-[var(--ds-fg-muted)]">Tracks</p>
          <ul
            role="listbox"
            aria-label="Tracks"
            className="flex flex-col gap-1.5"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                moveSelection(1)
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                moveSelection(-1)
              }
            }}
          >
            {tracks.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                selected={t.id === selected.id}
                level={levels[i]}
                onSelect={() => setSelectedId(t.id)}
                onMute={() =>
                  setTracks((ts) => ts.map((x) => (x.id === t.id ? { ...x, mute: !x.mute } : x)))
                }
              />
            ))}
          </ul>
        </div>

        {/* ---- Selected track ----
             The heading in every panel names the selection. Without it these
             are anonymous controls and the user is relying on memory of what
             they clicked — the failure mode of every inspector layout. */}
        <div
          className="flex flex-col gap-3"
          role="tabpanel"
          id={`mix-panel-${tab}`}
          aria-labelledby={`mix-tab-${tab}`}
        >
          {tab === 'basic' && (
            <PanelShell
              title={`${selected.name} controls`}
              blurb="The everyday four: how loud, where in the stereo field, how present, and whether it is heard at all."
              footer={
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--ds-border-subtle)] pt-2.5">
                  <p className="min-w-0 flex-1 text-caption text-[var(--ds-fg-muted)]">
                    Auto mix ducks music beneath narration wherever there is speech.
                  </p>
                  <Button size="xs" variant="outlined"
                    onClick={() => patch({ volume: 0, pan: 0, presence: 0 })}>
                    <RotateCcw size={13} />
                    Reset
                  </Button>
                </div>
              }
            >
              <div className="rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-2">
                <Waveform seed={selectedIndex + 1} colour={colour} />
                <div aria-hidden className="mt-1 flex justify-between text-[9px] tabular-nums text-[var(--ds-fg-muted)]">
                  {['0:00', '0:20', '0:40', '1:00'].map((t) => <span key={t}>{t}</span>)}
                </div>
              </div>

              <div className="flex flex-wrap items-start justify-around gap-4">
                <RotaryKnob
                  label="Volume" value={selected.volume} min={DB_MIN} max={DB_MAX} reset={0}
                  onChange={(volume) => patch({ volume })} format={fmtDb} colour={colour}
                />
                <RotaryKnob
                  label="Pan" value={selected.pan} min={-100} max={100} step={1} reset={0}
                  onChange={(pan) => patch({ pan })} format={fmtPan} colour={colour}
                />
                <RotaryKnob
                  label="Presence" value={selected.presence} min={-6} max={6} reset={0}
                  onChange={(presence) => patch({ presence })}
                  format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} dB`} colour={colour}
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <StripToggle on={selected.mute} onChange={() => patch({ mute: !selected.mute })} tone="danger" name={selected.name}>
                  Mute
                </StripToggle>
                <StripToggle on={selected.solo} onChange={() => patch({ solo: !selected.solo })} tone="warning" name={selected.name}>
                  Solo
                </StripToggle>
                <StripToggle on={selected.enhance} onChange={() => patch({ enhance: !selected.enhance })} tone="warning" name={selected.name}>
                  Enhance
                </StripToggle>
                <StripToggle on={selected.denoise} onChange={() => patch({ denoise: !selected.denoise })} tone="warning" name={selected.name}>
                  Noise clean
                </StripToggle>
              </div>

              {/* ---- Auto mix ---- */}
              <div className="shrink-0">
                <div className="flex items-center justify-between">
                  <p className="text-caption text-[var(--ds-fg-secondary)]">Auto mix</p>
                  <label className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--ds-fg-muted)]">Duck amount</span>
                    <input
                      type="range"
                      aria-label="Duck amount"
                      aria-valuetext={`${duck} per cent`}
                      min={0}
                      max={100}
                      value={duck}
                      onChange={(e) => setDuck(Number(e.target.value))}
                      className="w-24 accent-[var(--ds-accent)]"
                    />
                    <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[var(--ds-fg)]">
                      {duck}%
                    </span>
                  </label>
                </div>
                <div className="mt-1 flex gap-3">
                  <div className="flex flex-col gap-1.5 pt-1">
                    {[['Voice', 'var(--ds-accent)'], ['Music', 'var(--ds-warning)']].map(([l, c]) => (
                      <span key={l} className="flex items-center gap-1.5 text-[10px] text-[var(--ds-fg-secondary)]">
                        <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: c }} />
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="h-24 flex-1 rounded-[var(--radius-sm)] bg-[var(--ds-sunken)] p-1">
                    <DuckCurve amount={duck} />
                  </div>
                </div>
              </div>
            </PanelShell>
          )}

          {tab === 'eq' && (
            <EqPanel
              eq={selected.eq}
              name={selected.name}
              onChange={(p) => patch({ eq: { ...selected.eq, ...p } })}
            />
          )}

          {tab === 'dynamics' && (
            <DynamicsPanel
              dyn={selected.dyn}
              name={selected.name}
              reduction={reduction}
              inLevel={levels[selectedIndex] ?? 0}
              outLevel={Math.min(1, (levels[selectedIndex] ?? 0) * (1 - reduction / 30) + (selected.dyn.on ? 0.12 : 0))}
              onChange={(p) => patch({ dyn: { ...selected.dyn, ...p } })}
            />
          )}

          {tab === 'automation' && (
            <AutomationPanel
              auto={selected.auto}
              name={selected.name}
              seed={selectedIndex + 1}
              onChange={(p) => patch({ auto: { ...selected.auto, ...p } })}
            />
          )}
        </div>

        {/* ---- Master ---- */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--ds-accent-border)] bg-[var(--ds-surface-raised)] p-3">
          <p className="text-center text-overline uppercase tracking-wide text-[var(--ds-fg-muted)]">Master</p>

          <div className="flex justify-center gap-1.5" style={{ blockSize: 120 }}>
            <Meter level={bus * 1.3} className="w-2.5" />
            <div aria-hidden className="flex flex-col justify-between py-px text-[9px] tabular-nums text-[var(--ds-fg-muted)]">
              {[0, -12, -24, -36, -60].map((d) => <span key={d}>{d}</span>)}
            </div>
            <Meter level={bus * 1.18} className="w-2.5" />
          </div>

          <div className="flex justify-center">
            <RotaryKnob
              label="Output" value={master} min={DB_MIN} max={DB_MAX} reset={0}
              onChange={setMaster} format={fmtDb} size={72}
            />
          </div>

          {/* Loudness is the number this variant is actually steering towards,
              so it is the largest text on the panel — and it says how far from
              target it is, because "-14 LUFS" alone means nothing to most
              people editing a video. */}
          <div className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-2 text-center">
            <p className="font-mono text-title-sm tabular-nums text-[var(--ds-fg)]">
              {lufs.toFixed(1)} <span className="text-caption text-[var(--ds-fg-muted)]">LUFS</span>
            </p>
            <p className="text-[10px] text-[var(--ds-fg-muted)]">
              Target -14 · {Math.abs(lufs + 14) < 0.6 ? 'on target' : lufs < -14 ? 'quiet' : 'loud'}
            </p>
          </div>

          <Switch checked={limiter} onCheckedChange={setLimiter} label="Limiter" size="sm" />
          <p className="text-center text-[10px] text-[var(--ds-fg-muted)]">
            True peak <span className="font-mono tabular-nums">-1.0 dBTP</span>
          </p>
        </div>
      </div>

      {/* Section tabs. These switch which panel of the SELECTED TRACK you are
          editing — they are not the variant switcher, which lives above the
          whole preview and is a pill strip. Two tab strips on one screen need
          visibly different jobs, so these are underline tabs sitting directly
          against the panel they change, and the panel names the track again. */}
      <Tabs
        aria-label="Track editor section"
        value={tab}
        onChange={setTab}
        fullWidth
        tabs={SECTION_TABS.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
      />
      <p className="text-center text-caption text-[var(--ds-fg-muted)]">
        {SECTION_TABS.find((t) => t.value === tab)?.blurb}
      </p>
    </section>
  )
}

/* The four depths of one track. Each blurb is written for someone who is
   editing a video, not mixing a record — these panels are where a mixer stops
   being self-explanatory, and a label like "Dynamics" tells that person
   nothing at all on its own. */
const SECTION_TABS = [
  {
    value: 'basic',
    label: 'Basic',
    icon: <SlidersHorizontal size={14} />,
    blurb: 'Everyday controls: volume, pan, presence, mute, solo, voice enhancement and noise cleanup.',
  },
  {
    value: 'eq',
    label: 'EQ',
    icon: <Activity size={14} />,
    blurb: 'Adjusts frequencies — bass, mids and treble — and removes rumble or harshness.',
  },
  {
    value: 'dynamics',
    label: 'Dynamics',
    icon: <AudioLines size={14} />,
    blurb: 'Controls inconsistent volume using compression, limiting, gating and de-essing.',
  },
  {
    value: 'automation',
    label: 'Automation',
    icon: <Spline size={14} />,
    blurb: 'Changes level over time using keyframes — fading music out, or lifting narration for one section.',
  },
]

/* -- Playground -----------------------------------------------------------
   The variant switcher. Both arrangements are the same component doing the
   same job, so they belong on one page — putting them on two would make the
   choice between them invisible, and choosing between them is the actual
   decision a reader comes here to make. */
const VARIANTS = [
  { value: 'console', label: 'Console' },
  { value: 'studio', label: 'Studio' },
] as const

function Playground() {
  const [variant, setVariant] = React.useState<string>('console')
  // Bounded by INITIAL — offering "8" when the desk holds five made the control
  // lie: picking it changed nothing.
  const [count, setCount] = React.useState<'3' | '4' | '5'>('5')
  const [compact, setCompact] = React.useState(false)
  const [running, setRunning] = React.useState(true)

  return (
    <Stack gap="sm">
      <Tabs
        aria-label="Mixer variant"
        variant="pill"
        value={variant}
        onChange={setVariant}
        tabs={VARIANTS.map((v) => ({ value: v.value, label: v.label }))}
      />
      <PreviewStage
        center={false}
        minHeight={0}
        label={variant === 'console' ? 'Console' : 'Studio'}
        controls={
          <>
            {variant === 'console' && (
              <>
                <Knob label="Channels">
                  <KnobSelect value={count} onChange={setCount} options={['3', '4', '5'] as const} />
                </Knob>
                <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
              </>
            )}
            <KnobToggle checked={running} onChange={setRunning} label="Signal" />
          </>
        }
      >
        {variant === 'console'
          ? <ConsoleMixer count={Number(count)} compact={compact} running={running} />
          : <StudioMixer running={running} />}
      </PreviewStage>
    </Stack>
  )
}

export default defineDoc({
  meta: {
    id: 'mixer',
    title: 'Mixer',
    tagline:
      'Balancing several signals against each other. Two arrangements: a console that shows every channel at once, and a studio that shows one in depth.',
    status: 'beta',
    keywords: [
      'fader', 'channel strip', 'mute', 'solo', 'pan', 'level meter', 'vu',
      'audio', 'console', 'gain', 'master bus', 'db', 'lufs', 'ducking',
      'loudness', 'inspector', 'track list',
    ],
    jumps: [
      { id: 'studio', label: 'Studio arrangement' },
      { id: 'panels', label: 'The four panels' },
      { id: 'choosing', label: 'Choosing between them' },
    ],
  },

  overview: {
    purpose:
      'A mixer shows several parallel signals and lets the user set the balance between them. It comes in two arrangements, and the choice between them is the real design decision. A CONSOLE puts every channel on screen at once so the balance can be read as a shape — its whole value is comparison. A STUDIO puts one selected track in an inspector so it can be worked on in depth — its whole value is room. Neither is a skin of the other: the console cannot fit five controls per channel, and the studio cannot show you the balance.',
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
            <ConsoleMixer count={4} showHeader={false} running={false} />
          </PreviewStage>
        ),
      },
      {
        id: 'studio',
        title: 'The studio arrangement',
        description:
          'A track list on the left, and everything to the right is the selected track. This is what you build once a track needs more than a fader — volume, pan, presence, an enhance pass and a noise gate will not fit five abreast. The trade is real: you can work in depth, and you can no longer see the balance.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <StudioMixer running={false} />
          </PreviewStage>
        ),
      },
      {
        id: 'panels',
        title: 'The four depths of one track',
        description:
          'The section tabs are not four tools — they are the same track at increasing specificity. Basic is what everyone touches; EQ is by pitch; Dynamics is consistency over level; Automation is change over time. A user works down that list as their problem gets more specific, which is why the order is fixed and Basic is first.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="md" className="w-full">
              <EqPanel eq={TRACKS[0].eq} name="Voice" onChange={() => {}} />
              <DynamicsPanel
                dyn={TRACKS[0].dyn}
                name="Voice"
                reduction={3.4}
                inLevel={0.72}
                outLevel={0.58}
                onChange={() => {}}
              />
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'fixed-shell',
        title: 'The shell never changes height',
        description:
          'All four panels render into the same box at the same height, set once by the tallest of them. That is a hard requirement, not a nicety: these tabs are switched between constantly while listening, and a shell that grows or shrinks moves the tab strip, the track list and the master meters under the pointer every time — so the control you were about to click is somewhere else, and the meters you were watching jump.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full rounded-[var(--radius-md)] border border-dashed border-[var(--ds-accent-border)] p-2">
              <p className="mb-2 text-caption text-[var(--ds-fg-secondary)]">
                Every panel fills a {PANEL_MIN_H}px box. The dashed edge is the box.
              </p>
              <AutomationPanel auto={TRACKS[1].auto} name="Music" seed={2} onChange={() => {}} />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'automation-list',
        title: 'An automation lane that works without a mouse',
        description:
          'Dragging a dot on a canvas is the fast path, and it is unreachable by keyboard — a canvas cannot take focus and has no value semantics. So selecting a point opens an editor with a real time field, a real level field and a real curve select, and the lane is a picture of that state rather than a separate interface. This is the part most tools skip.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <AutomationPanel auto={TRACKS[0].auto} name="Voice" seed={1} onChange={() => {}} />
          </PreviewStage>
        ),
      },
      {
        id: 'choosing',
        title: 'Choosing between them',
        description:
          'Ask what the user is doing. Setting levels against each other is a console job — eight caps read as one shape. Fixing one track is a studio job, and the console cannot give it the room. A tool that does both usually ships the console as the main view and opens the studio on double-click.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Console — comparison" tone="good">
                <p className="mb-2 text-caption text-[var(--ds-fg-secondary)]">
                  Every channel visible. One shared scale. The balance is the picture.
                </p>
                <ConsoleMixer count={4} compact showHeader={false} running={false} />
              </Cell>
              <Cell label="Studio — depth" tone="good">
                <p className="mb-2 text-caption text-[var(--ds-fg-secondary)]">
                  One track, five controls, room to label them. The balance is now invisible.
                </p>
                <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
                  <p className="text-overline uppercase tracking-wide text-[var(--ds-fg-muted)]">
                    Voice · controls
                  </p>
                  <div className="mt-2 flex justify-around gap-3">
                    <RotaryKnob label="Volume" value={0} min={DB_MIN} max={DB_MAX} format={fmtDb} size={44} />
                    <RotaryKnob label="Pan" value={0} min={-100} max={100} format={fmtPan} size={44} />
                    <RotaryKnob label="Presence" value={2} min={-6} max={6} format={(v) => `+${v.toFixed(1)} dB`} size={44} />
                  </div>
                </div>
              </Cell>
            </Grid>
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
            <ConsoleMixer count={4} compact showHeader={false} running={false} />
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
    { name: 'Strip', minWidth: '112px', maxWidth: '160px', use: 'Below 112px the pan knob drops under the 44px target. Above 160px a full desk stops fitting a laptop.' },
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
      title: 'Name the selection in the inspector',
      why: 'In the studio arrangement, everything on the right belongs to whatever is highlighted on the left. Without a heading saying which track that is, the panel is a set of anonymous knobs and the user is relying on memory of what they clicked.',
      render: (
        <div className="w-44 rounded-[var(--radius-xs)] border border-[var(--ds-success-border)] p-2">
          <p className="text-overline uppercase tracking-wide text-[var(--ds-fg-muted)]">
            Voice · controls
          </p>
        </div>
      ),
    },
    {
      title: 'Explain the panels in the user’s language',
      why: '"Dynamics" and "EQ" mean nothing to someone editing a video, and they are exactly the two panels that person needs. Every control here carries a plain sentence — "everything below this is removed: traffic, air conditioning, desk bumps" beats "high-pass filter, 90 Hz" for the audience that actually opens it.',
      render: (
        <div className="w-52 rounded-[var(--radius-xs)] border border-[var(--ds-success-border)] p-2">
          <p className="text-caption text-[var(--ds-fg-secondary)]">Rumble filter</p>
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--ds-fg-muted)]">
            Everything below this is removed: traffic, air conditioning, desk bumps.
          </p>
        </div>
      ),
    },
    {
      title: 'Derive the curve from the controls',
      why: 'The EQ curve, the compression transfer curve and the automation lane are all pictures of values that live elsewhere. Let a user edit the picture independently and you have two sources of truth for one filter, which drift the first time either is set another way.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          curve = f(bands) — one direction only
        </code>
      ),
    },
    {
      title: 'Say what the loudness number means',
      why: '"-14 LUFS" is meaningless to most people editing a video, and it is the number the whole studio arrangement is steering towards. Print the target beside it and say which side of it you are on.',
      render: (
        <div className="w-32 rounded-[var(--radius-xs)] border border-[var(--ds-success-border)] p-2 text-center">
          <p className="font-mono text-body-sm tabular-nums text-[var(--ds-fg)]">-14.0 LUFS</p>
          <p className="text-[10px] text-[var(--ds-fg-muted)]">Target -14 · on target</p>
        </div>
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
      title: 'Do not put two tab strips with the same weight on one screen',
      why: 'The studio has section tabs (Basic, EQ, Dynamics) that change what you edit on the selected track. If the arrangement switcher looks the same and sits nearby, neither reads as more significant than the other and every click is a guess. Give them different shapes and different places.',
      render: (
        <Row gap="sm" align="center">
          <span className="rounded-full border border-[var(--ds-danger-border)] px-2 py-0.5 text-caption text-[var(--ds-danger-text)]">Console | Studio</span>
          <span className="rounded-full border border-[var(--ds-danger-border)] px-2 py-0.5 text-caption text-[var(--ds-danger-text)]">Basic | EQ</span>
        </Row>
      ),
    },
    {
      title: 'Do not let the panel resize when the tab changes',
      why: 'These tabs are switched between constantly while listening. If each panel sizes to its own content, the tab strip, the track list and the master meters all move — so the control you were reaching for is somewhere else, and the meters you were watching jump. Fix the height once, to the tallest panel, and let the others fill it.',
      render: (
        <Row gap="sm" align="center">
          <span className="flex h-12 w-16 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--ds-danger-border)] text-caption text-[var(--ds-danger-text)]">
            tall
          </span>
          <span className="flex h-6 w-16 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--ds-danger-border)] text-caption text-[var(--ds-danger-text)]">
            short
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not make the curve the only way to edit',
      why: 'A draggable EQ curve or automation lane is a canvas. It cannot take focus, it has no value semantics and it is unreachable by keyboard — so every value it holds needs a real control somewhere too. The picture is the fast path, never the only path.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          drag the dot, or… nothing. No keyboard route in.
        </span>
      ),
    },
    {
      title: 'Do not leave a compressor with no visible effect',
      why: 'Threshold and ratio are two sliders whose combined result is invisible without a gain-reduction readout. The user cannot tell whether the compressor is doing nothing or crushing the track, so they turn knobs until it sounds wrong.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          threshold + ratio, no meter → tuning by superstition
        </span>
      ),
    },
    {
      title: 'Do not use the studio arrangement to set a balance',
      why: 'Balancing is comparing, and the inspector shows one track at a time. The user ends up clicking between tracks trying to hold two numbers in their head — which is precisely the job the console does in one glance.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          click voice → read → click music → read → guess
        </span>
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
      { keys: '↑ / ↓ in the track list', does: 'Moves the selection in the studio arrangement, which changes everything in the inspector. Tab leaves the list rather than walking it.' },
    ],
    aria: [
      { attr: 'role="slider"', on: 'Faders and pan knobs', note: 'Implicit on input[type=range]. This is the reason to build on it rather than on a div.' },
      { attr: 'aria-valuetext', on: 'Faders and pan knobs', note: '"-4.2 dB", "L22", "Centre". Without it a pan knob announces "-22" and a fader announces a position on an internal 0–1000 scale that means nothing.' },
      { attr: 'aria-orientation="vertical"', on: 'Faders', note: 'Changes which arrow keys are announced as increasing.' },
      { attr: 'aria-label', on: 'Every control', note: 'Scoped by channel — "Narration fader", not "fader". Eight identically-named sliders is the most common failure in this component.' },
      { attr: 'aria-pressed', on: 'Mute and solo', note: 'They are toggle buttons, not links or checkboxes. The pressed state is the whole meaning.' },
      { attr: 'aria-hidden', on: 'Meters, waveforms, identity bars', note: 'Output and decoration. None of them may be the only source of a fact.' },
      { attr: 'role="status"', on: 'The clipping indicator', note: 'A polite live region, so clipping is announced once rather than sixty times a second.' },
      { attr: 'role="listbox" / role="option"', on: 'The studio track list', note: 'Selection is the navigation model of that arrangement — everything in the inspector belongs to the selected option — so it needs real single-select semantics and roving tabindex, not a row of buttons.' },
      { attr: 'aria-selected', on: 'Track rows', note: 'The selected track must be announced as selected, not merely styled as such. A highlight is invisible to a screen reader.' },
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
      caption:
        'Two arrangements over the same state. Keep the channel list in one place and let each view render it — a console and a studio holding separate copies is how the two drift apart.',
      code: `// Console — every channel at once, for setting a balance
<ConsoleMixer
  channels={channels}
  master={master}
  onChannelChange={(id, patch) => update(id, patch)}
  onMasterChange={setMaster}
/>

// Studio — one selected track in depth, for working on it
<StudioMixer
  tracks={channels}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onTrackChange={(patch) => update(selectedId, patch)}
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
        name: 'StudioMixer',
        props: [
          { name: 'tracks', type: 'Track[]', required: true, description: 'The track list. Same source of truth the console reads — two views holding separate copies is how they drift apart.' },
          { name: 'selectedId', type: 'string', required: true, description: 'Which track the inspector is showing. Controlled, so the host can select a track from elsewhere.' },
          { name: 'onSelect', type: '(id: string) => void', required: true, description: 'Selection is this arrangement’s whole navigation model.' },
          { name: 'onTrackChange', type: '(patch: Partial<Track>) => void', description: 'Edits apply to the selected track. No id — the selection already says which.' },
          { name: 'target', type: 'number', default: '-14', description: 'Loudness target in LUFS. Printed beside the measured value, because the number alone means nothing to most users.' },
        ],
      },
      {
        name: 'ConsoleMixer',
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
      'Most real tools ship both arrangements: the console as the main view, the studio opened by double-clicking a strip. The console answers "is the balance right", the studio answers "what is wrong with this track", and neither question is rare enough to make the other view optional.',
      'The studio arrangement is what appears in video editors, where the user is not an audio engineer and there are five tracks rather than forty. It steers towards a loudness target instead of asking for a balance, because "-14 LUFS for this platform" is a decision the tool can make and the user cannot.',
      'Every hardware console ever built puts the fader at the bottom and the meter beside it. That is not nostalgia — it is because the hand rests low and the eye tracks the meter while the hand moves.',
      'Broadcast desks give solo its own colour and its own light because an accidental solo on air is a serious failure. The visual weight is proportional to the cost of the mistake.',
      'DAWs let a strip collapse to a fader and a name and nothing else. That is the honest compact mode: drop information, never target size.',
    ],
  },
})
