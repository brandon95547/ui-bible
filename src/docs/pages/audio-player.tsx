import * as React from 'react'
import { FastForward, MoreVertical, Pause, Play, Rewind, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from '@/ui/Button'
import { Cell, Grid, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   Peaks.

   The real thing decodes the file and takes the maximum absolute sample in each
   bucket. Until that arrives — and in this page, which has no audio — a shape
   seeded from the source URL stands in. It is deterministic, so a given clip
   always looks the same, which is the whole reason the shape is worth showing in
   a list: it identifies the track. A random shape per render would be noise
   pretending to be data.
------------------------------------------------------------------------------ */
function syntheticPeaks(seed: string, buckets: number): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const out: number[] = []
  for (let b = 0; b < buckets; b += 1) {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    h >>>= 0
    // Envelope: clips fade in and out rather than starting at full level.
    const env = Math.sin((b / buckets) * Math.PI)
    out.push(0.25 + 0.75 * ((h % 1000) / 1000) * (0.4 + 0.6 * env))
  }
  return out
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/* ---------------------------------------------------------------------------
   The waveform.

   A canvas or an SVG is a picture, not a control: it cannot take focus and has
   no value semantics. role="slider" plus real key handling is what turns it into
   something a keyboard can operate — without it you have shipped a scrubber that
   only a mouse can reach.
------------------------------------------------------------------------------ */
function Waveform({
  peaks,
  progress,
  duration,
  height,
  label,
  onSeek,
  disabled,
  tone = 'accent',
}: {
  peaks: number[]
  progress: number
  duration: number
  height: number
  label: string
  onSeek: (fraction: number) => void
  disabled?: boolean
  tone?: 'accent' | 'neutral'
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const seekAt = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    onSeek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || duration <= 0) return
    const step = (e.shiftKey ? 30 : 5) / duration
    const keys: Record<string, () => void> = {
      ArrowRight: () => onSeek(progress + step),
      ArrowUp: () => onSeek(progress + step),
      ArrowLeft: () => onSeek(progress - step),
      ArrowDown: () => onSeek(progress - step),
      Home: () => onSeek(0),
      End: () => onSeek(1),
    }
    const run = keys[e.key]
    if (!run) return
    e.preventDefault()
    run()
  }

  const played = tone === 'accent' ? 'var(--ds-accent)' : 'var(--ds-fg-secondary)'
  const unplayed = disabled ? 'var(--ds-fg-disabled)' : 'var(--ds-border-strong)'

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      // A bare 0–100 conveys nothing about a clip. The real units do.
      aria-valuetext={`${fmt(progress * duration)} of ${fmt(duration)}`}
      aria-disabled={disabled || undefined}
      onPointerDown={(e) => {
        if (disabled) return
        e.currentTarget.setPointerCapture(e.pointerId)
        seekAt(e.clientX)
      }}
      onPointerMove={(e) => {
        if (disabled || !e.currentTarget.hasPointerCapture(e.pointerId)) return
        seekAt(e.clientX)
      }}
      onKeyDown={onKeyDown}
      style={{ height }}
      className={cn(
        'relative flex min-w-0 flex-1 items-center gap-[1px] rounded-[var(--radius-sm)]',
        disabled ? 'cursor-default' : 'cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
    >
      {peaks.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="flex-1 rounded-full"
          style={{
            height: `${Math.max(8, p * 100)}%`,
            background: i / peaks.length < progress ? played : unplayed,
          }}
        />
      ))}
      {/* Only once there is a position to mark. At 0:00 it is a stray tick on the
          left edge of every idle row in the list. */}
      {progress > 0 && !disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-px bg-[var(--ds-fg)]"
          style={{ left: `${Math.min(99.6, progress * 100)}%` }}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   The player. Two sizes, one component — see the Sizes table for why they are
   sizes rather than two components.
------------------------------------------------------------------------------ */
function Player({
  title = 'Arthur',
  src = 'arthur-sample.mp3',
  duration = 26,
  size = 'row',
  bars,
  disabled,
  ready = true,
}: {
  title?: string
  src?: string
  duration?: number
  size?: 'row' | 'full'
  bars?: number
  disabled?: boolean
  /** false = peaks not decoded yet, so the synthetic shape is what is on screen. */
  ready?: boolean
}) {
  const full = size === 'full'
  const count = bars ?? (full ? 120 : 72)
  const peaks = React.useMemo(() => syntheticPeaks(src, count), [src, count])
  const [time, setTime] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(1)

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + 0.1 * rate
        if (next >= duration) {
          setPlaying(false)
          return duration
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [playing, rate, duration])

  const progress = duration > 0 ? time / duration : 0
  const seek = (f: number) => setTime(Math.max(0, Math.min(1, f)) * duration)

  const transport = (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${playing ? 'Pause' : 'Play'} ${title}`}
      onClick={() => setPlaying((p) => !p)}
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]',
        'transition-colors hover:bg-[var(--ds-accent-hover)] disabled:opacity-40 disabled:hover:bg-[var(--ds-accent)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
        full ? 'h-12 w-12' : 'h-7 w-7',
      )}
    >
      {playing ? (
        <Pause size={full ? 22 : 14} fill="currentColor" strokeWidth={0} />
      ) : (
        <Play size={full ? 22 : 14} fill="currentColor" strokeWidth={0} className={full ? 'ml-0.5' : 'ml-px'} />
      )}
    </button>
  )

  if (!full) {
    return (
      <div className="flex w-full min-w-0 select-none items-center gap-2">
        {transport}
        <Waveform
          peaks={peaks}
          progress={progress}
          duration={duration}
          height={28}
          label={`Seek ${title}`}
          onSeek={seek}
          disabled={disabled}
        />
        {/* One label, so it has to earn its place: the length until you start it,
            the position once you have. A column of "0:00" tells a reader nothing. */}
        <span className="w-9 shrink-0 text-right text-caption tabular-nums text-[var(--ds-fg-muted)]">
          {fmt(playing || time > 0 ? time : duration)}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full select-none rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-4">
      <Waveform
        peaks={peaks}
        progress={progress}
        duration={duration}
        height={64}
        label={`Seek ${title}`}
        onSeek={seek}
        disabled={disabled}
        tone="neutral"
      />
      <div className="mt-2 flex items-center justify-between text-caption tabular-nums text-[var(--ds-fg-muted)]">
        <span>{fmt(time)}</span>
        <span>{fmt(duration)}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 items-center">
        <Row gap="sm" align="center" className="justify-self-start">
          <IconButton
            size="sm"
            label={muted ? 'Unmute' : 'Mute'}
            icon={muted ? <VolumeX /> : <Volume2 />}
            disabled={disabled}
            onClick={() => setMuted((m) => !m)}
          />
          <button
            type="button"
            disabled={disabled}
            aria-label={`Playback speed, ${rate}×`}
            onClick={() => setRate((r) => (r === 2 ? 0.75 : r === 0.75 ? 1 : r === 1 ? 1.25 : r === 1.25 ? 1.5 : 2))}
            className="h-8 min-w-10 rounded-[var(--radius-md)] border border-[var(--ds-border)] px-2 text-caption font-semibold text-[var(--ds-fg-secondary)] hover:bg-[var(--ds-layer-hover)] disabled:opacity-40"
          >
            {rate}×
          </button>
        </Row>
        <Row gap="md" align="center" className="justify-self-center">
          <IconButton size="sm" label="Back 10 seconds" icon={<Rewind />} disabled={disabled} onClick={() => seek(progress - 10 / duration)} />
          {transport}
          <IconButton size="sm" label="Forward 10 seconds" icon={<FastForward />} disabled={disabled} onClick={() => seek(progress + 10 / duration)} />
        </Row>
        <span className="justify-self-end text-caption text-[var(--ds-fg-muted)]">
          {ready ? '' : 'drawing…'}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   THE ROW — a player that is one line of a table rather than a card

   The list treatment below (VoiceList) boxes each player in its own card with
   the name stacked above it. That gives every row two left edges and cuts the
   waveform to whatever is left, which is the one thing a media library must not
   do: if the shapes are not the same scale on the same baseline, they cannot be
   compared, and comparing them is why you drew them instead of printing titles.

   Here the cells are columns. Name, waveform and duration line up down the page,
   the waveform takes the slack, and the play control is an outlined circle that
   FILLS while playing — in a list of twenty that fill is how you find the row you
   are hearing without reading any of them.

   Everything optional is optional for a reason, not for configurability's sake:
     · showLabel — off when the table already has a Name column, or when the row
                   is identified by something else entirely (a date, a take number)
     · showTime  — off when the duration is meaningless or unknown
     · actions   — NOT a player concern. Whether a track can be renamed or deleted
                   is a permission question the player cannot answer, so the host
                   passes the control in. A row the user has no rights over gets no
                   menu at all rather than a disabled one: a disabled control says
                   "this is yours, later"; an absent one says "this was never
                   yours", and for a shared default voice that is the truth.
   --------------------------------------------------------------------------- */
function VoiceRow({
  name,
  src,
  duration,
  showLabel = true,
  showTime = true,
  actions,
}: {
  name: string
  src: string
  duration: number
  showLabel?: boolean
  showTime?: boolean
  actions?: React.ReactNode
}) {
  const peaks = React.useMemo(() => syntheticPeaks(src, 96), [src])
  const [time, setTime] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + 0.1
        if (next >= duration) {
          setPlaying(false)
          return duration
        }
        return next
      })
    }, 100)
    return () => window.clearInterval(id)
  }, [playing, duration])

  const progress = duration > 0 ? time / duration : 0

  return (
    <div className="flex items-center gap-4 border-b border-[var(--ds-border-subtle)] py-2.5 last:border-b-0">
      <button
        type="button"
        aria-label={`${playing ? 'Pause' : 'Play'} ${name}`}
        onClick={() => setPlaying((p) => !p)}
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
          playing
            ? 'border-transparent bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)] hover:bg-[var(--ds-accent-hover)]'
            : 'border-[var(--ds-border-strong)] text-[var(--ds-fg-secondary)] hover:border-[var(--ds-fg-muted)] hover:text-[var(--ds-fg)]',
        )}
      >
        {playing ? (
          <Pause size={14} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={14} fill="currentColor" strokeWidth={0} className="ml-px" />
        )}
      </button>

      {showLabel && (
        <span className="w-28 shrink-0 truncate text-body-sm text-[var(--ds-fg)]">{name}</span>
      )}

      <Waveform
        peaks={peaks}
        progress={progress}
        duration={duration}
        height={32}
        label={`Seek ${name}`}
        onSeek={(f) => setTime(Math.max(0, Math.min(1, f)) * duration)}
      />

      {showTime && (
        <span className="w-10 shrink-0 text-right text-caption tabular-nums text-[var(--ds-fg-muted)]">
          {fmt(playing || time > 0 ? time : duration)}
        </span>
      )}

      {/* The cell exists only where actions can. Reserving it on a read-only row
          indents that waveform to line up with a button that never arrives. */}
      {actions ? <div className="flex w-8 shrink-0 justify-end">{actions}</div> : null}
    </div>
  )
}

const TABLE_VOICES = [
  { id: 'arthur', name: 'Arthur', duration: 8 },
  { id: 'charlotte', name: 'Charlotte', duration: 9 },
  { id: 'edward', name: 'Edward', duration: 7 },
  { id: 'janet', name: 'Janet', duration: 6 },
]

function VoiceTable({
  showLabel = true,
  showTime = true,
  canDelete = false,
}: {
  showLabel?: boolean
  showTime?: boolean
  canDelete?: boolean
}) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 border-b border-[var(--ds-border)] pb-2 text-overline uppercase tracking-wider text-[var(--ds-fg-muted)]">
        <span className="flex-1">Voice</span>
        {showTime && <span className="w-10 text-right">Duration</span>}
        {canDelete && <span className="w-8" aria-hidden="true" />}
      </div>
      {TABLE_VOICES.map((v) => (
        <VoiceRow
          key={v.id}
          name={v.name}
          src={`${v.id}.mp3`}
          duration={v.duration}
          showLabel={showLabel}
          showTime={showTime}
          actions={
            canDelete ? (
              <button
                type="button"
                aria-label={`More actions for ${v.name}`}
                aria-haspopup="menu"
                className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] text-[var(--ds-fg-muted)] transition-colors hover:bg-[var(--ds-layer-hover)] hover:text-[var(--ds-fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]"
              >
                <MoreVertical size={16} />
              </button>
            ) : null
          }
        />
      ))}
    </div>
  )
}

function TablePlayground() {
  const [showLabel, setShowLabel] = React.useState(true)
  const [showTime, setShowTime] = React.useState(true)
  const [canDelete, setCanDelete] = React.useState(false)
  return (
    <PreviewStage
      label="Row variant"
      minHeight={0}
      center={false}
      allowResize={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={showLabel} onChange={setShowLabel} label="Name" />
          <KnobToggle checked={showTime} onChange={setShowTime} label="Duration" />
          <KnobToggle checked={canDelete} onChange={setCanDelete} label="User owns these" />
        </div>
      }
      code={`// One line of a table: play · name · waveform · duration.
const row = new AudioPlayer({
  mount: cell,
  variant: 'row',
  lazyWaveform: true,
  label: voice.name,
  showLabel: true,      // off when the table already has a Name column
  showTime: true,       // off when the duration means nothing
})
row.attach(voice.src, { duration: voice.duration_sec })

// Actions are the HOST's, not the player's — the player cannot know
// whether this user may delete this voice.
if (voice.owner_id === session.user_id) cell.after(overflowMenu(voice))`}
    >
      <VoiceTable showLabel={showLabel} showTime={showTime} canDelete={canDelete} />
    </PreviewStage>
  )
}

/* A list of them, to show the one rule a single player cannot demonstrate:
   starting one stops the rest. */
function VoiceList() {
  const voices = [
    { id: 'arthur', name: 'Arthur', note: 'Warm, unhurried', duration: 26 },
    { id: 'imogen', name: 'Imogen', note: 'Bright, precise', duration: 19 },
    { id: 'nadia', name: 'Nadia', note: 'Low, documentary', duration: 31 },
    { id: 'soren', name: 'Søren', note: 'Dry, conversational', duration: 22 },
  ]
  return (
    <Stack gap="xs" className="w-full">
      {voices.map((v) => (
        <div
          key={v.id}
          className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] px-3 py-2"
        >
          <div className="mb-1.5 flex items-baseline gap-2">
            <span className="text-body-sm font-medium text-[var(--ds-fg)]">{v.name}</span>
            <span className="truncate text-caption text-[var(--ds-fg-muted)]">{v.note}</span>
          </div>
          <Player title={v.name} src={`${v.id}.mp3`} duration={v.duration} bars={56} />
        </div>
      ))}
    </Stack>
  )
}

function Playground() {
  const [full, setFull] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={260}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={full} onChange={setFull} label="Full size" />
          <KnobToggle checked={disabled} onChange={setDisabled} label="No source" />
        </div>
      }
      code={`// One per view — the thing you came to listen to.
const player = new AudioPlayer({ mount: el, variant: 'full' })
player.load('/uploads/narration-12.mp3')

// In a list — one row of a table, forty of them on screen.
const row = new AudioPlayer({
  mount: cell,
  variant: 'compact',
  lazyWaveform: true,        // decode on first interest, not on page load
  label: track.title,        // "Play Arthur", not a forty-fold "Play"
})
row.attach(track.src, { duration: track.duration_sec })`}
    >
      <div className="w-full max-w-md">
        <Player size={full ? 'full' : 'row'} disabled={disabled} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'audio-player',
    title: 'Audio Player',
    tagline:
      'Playback for sound with no picture. The waveform is the content, the list is the hard case, and one clip plays at a time.',
    keywords: [
      'audio', 'waveform', 'scrubber', 'seek', 'peaks', 'voice preview',
      'narration', 'podcast', 'sample', 'playhead', 'transport',
    ],
  },

  overview: {
    purpose:
      'An audio player renders time-based media that has nothing to look at. That single fact drives every decision on this page: with no picture to hold the frame, the waveform becomes the content surface — it identifies the clip, shows where the speech is, and is the only thing on screen that distinguishes one row of a list from the next.',
    whenToUse: [
      'Auditioning generated speech, music beds or sound effects before committing to them.',
      'A list of clips where the reader is comparing them — voices, takes, library tracks, sessions.',
      'Any place a user must confirm what a file actually contains before using it.',
    ],
    whenNotToUse: [
      {
        text: 'The media has a picture.',
        instead: 'a Video — the frame carries the identity a waveform has to substitute for',
        to: '#/video',
      },
      {
        text: 'It is a UI sound — a confirmation chime, an alert.',
        instead: 'no player at all; fire it and offer a preference to turn it off',
        to: '#/switch',
      },
      {
        text: 'The audio is background ambience the user never controls.',
        instead: 'nothing. Autoplaying sound with no control fails WCAG 1.4.2',
        to: '#/accessibility',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>A progress bar is the same rectangle for every clip.</strong> A waveform is
          different for each one, which is what makes a list of them readable: the reader can tell
          the rows apart, see where the speech starts, skip the four seconds of room tone at the
          front, and spot a bad render — a flat line, a clipped block — before playing it. In a
          product whose output is generated, that is free quality assurance.
        </p>
        <p>
          <strong>The expensive part is invisible.</strong> Real peaks mean downloading and
          decoding the entire file. One player can afford it; forty rows cannot, and the naive
          implementation pulls a hundred megabytes on page load. The fix is not to drop the
          waveform — it is to draw a deterministic stand-in immediately and decode the real peaks
          on the first sign of interest.
        </p>
        <p>
          <strong>One clip at a time, globally.</strong> Two clips playing over each other is
          never what anyone meant, and a list makes it a one-click accident. Exclusivity belongs
          to the component through a registry of live instances — not to each list that happens
          to hold several.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'in-a-list',
        title: 'The hard case: a list',
        description:
          'Four voices being compared. Each row is a 28px player; starting one stops the others. This is the arrangement that decides the component — a single player is easy and is not what breaks.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-md">
              <VoiceList />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'row-variant',
        title: 'A library is a table, not a stack of cards',
        description:
          'The same four voices as columns. The card version above gives every row two left edges and cuts the waveform to whatever is left of the line — so the shapes are different scales and cannot be compared, which is the one thing a media library exists to let you do. Here name, waveform and duration line up down the page and the waveform takes the slack, so a shape is the length of its sample. The play control is outlined at rest and fills while playing: in a list of twenty that fill is how you find the row you are hearing without reading any of them.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="grid w-full gap-4 lg:grid-cols-2">
              <Cell label="Cards — every waveform a different scale" tone="bad">
                <VoiceList />
              </Cell>
              <Cell label="Columns — shapes comparable down the page" tone="good">
                <VoiceTable />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'row-options',
        title: 'What a row may drop',
        description:
          'Name and duration are each optional, and the overflow menu is not the player’s to decide. Turn "User owns these" off to see the read-only case: no menu, and no actions column reserved for one. A disabled button says "this is yours, later"; an absent one says "this was never yours" — which for a shared default voice is the truth.',
        render: <TablePlayground />,
      },
      {
        id: 'waveform-vs-bar',
        title: 'Why a waveform and not a bar',
        description:
          'The same two clips. On the left you can see which one opens with four seconds of silence and which one is clipping; on the right they are the same grey rectangle.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Waveform" sub="The clip identifies itself" tone="good">
                <Stack gap="sm">
                  <Player title="Take 1" src="take-1.mp3" duration={26} bars={48} />
                  <Player title="Take 2" src="take-2.mp3" duration={18} bars={48} />
                </Stack>
              </Cell>
              <Cell label="Progress bar" sub="Two identical rows" tone="bad">
                <Stack gap="sm">
                  {['Take 1', 'Take 2'].map((t) => (
                    <Row key={t} gap="sm" align="center" className="w-full">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]">
                        <Play size={14} fill="currentColor" strokeWidth={0} className="ml-px" />
                      </span>
                      <span className="h-1.5 min-w-0 flex-1 rounded-full bg-[var(--ds-border-strong)]" />
                      <span className="w-9 shrink-0 text-right text-caption tabular-nums text-[var(--ds-fg-muted)]">
                        0:00
                      </span>
                    </Row>
                  ))}
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'full',
        title: 'One per view',
        description:
          'When the clip is the reason the page exists, it gets the 64px waveform, its own time row, and the controls a listener reaches for over several minutes: skip, mute, speed.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-md">
              <Player size="full" title="Chapter 3" src="chapter-3.mp3" duration={214} />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'lazy',
        title: 'What a list costs',
        description:
          'Decoding peaks downloads the whole file. Lazy mode shows the seeded shape immediately and decodes the real one on hover, focus or play — so the rows a reader never looks at cost nothing.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-md">
              {[
                ['eager, 40 rows', '≈ 120 MB and 40 decodes on page load', 'bad'],
                ['lazy, 40 rows', '0 bytes until the pointer enters a row', 'good'],
                ['play before peaks land', 'audio starts; the shape catches up', 'good'],
                ['no waveform until decoded', 'an empty row that looks broken', 'bad'],
              ].map(([mode, note, tone]) => (
                <Row key={mode} gap="sm" align="start" className="w-full">
                  <code
                    className={cn(
                      'w-44 shrink-0 font-mono text-caption',
                      tone === 'good' ? 'text-[var(--ds-success-text)]' : 'text-[var(--ds-danger-text)]',
                    )}
                  >
                    {mode}
                  </code>
                  <span className="text-caption text-[var(--ds-fg-muted)]">{note}</span>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'native',
        title: 'Against the native element',
        description:
          '<audio controls> is the right answer for one clip on a plain page. In a list it is 54px of unstyleable chrome per row, it looks different in every browser, and nothing stops two of them playing at once.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Row player" sub="28px, themed, exclusive" tone="good">
                <Player title="Arthur" src="arthur.mp3" duration={26} bars={48} />
              </Cell>
              <Cell label="Native controls" sub="54px, per-browser, concurrent" tone="bad">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio controls className="w-full" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Idle',
        note: 'Shows the length, not 0:00',
        render: <div className="w-52"><Player title="Idle" src="idle.mp3" duration={26} bars={32} /></div>,
      },
      {
        label: 'Playing',
        render: (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--ds-accent)] text-[var(--ds-fg-on-accent)]">
            <Pause size={14} fill="currentColor" strokeWidth={0} />
          </span>
        ),
      },
      {
        label: 'Played / unplayed',
        render: (
          <span className="flex h-7 w-24 items-center gap-px">
            {syntheticPeaks('states', 24).map((p, i) => (
              <span
                key={i}
                className="flex-1 rounded-full"
                style={{
                  height: `${p * 100}%`,
                  background: i < 10 ? 'var(--ds-accent)' : 'var(--ds-border-strong)',
                }}
              />
            ))}
          </span>
        ),
      },
      {
        label: 'Playhead',
        render: (
          <span className="relative flex h-7 w-24 items-center gap-px">
            {syntheticPeaks('states', 24).map((p, i) => (
              <span key={i} className="flex-1 rounded-full" style={{ height: `${p * 100}%`, background: 'var(--ds-border-strong)' }} />
            ))}
            <span className="absolute inset-y-0 left-1/2 w-px bg-[var(--ds-fg)]" />
          </span>
        ),
      },
      {
        label: 'No source',
        note: 'Flat line, control disabled',
        render: <div className="w-52"><Player title="Empty" src="empty.mp3" duration={0} bars={32} disabled /></div>,
      },
      {
        label: 'Focused scrubber',
        render: (
          <span className="flex h-7 w-24 items-center gap-px rounded-[var(--radius-sm)] outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]">
            {syntheticPeaks('focus', 24).map((p, i) => (
              <span key={i} className="flex-1 rounded-full" style={{ height: `${p * 100}%`, background: 'var(--ds-border-strong)' }} />
            ))}
          </span>
        ),
      },
      {
        label: 'Time',
        render: <span className="text-caption tabular-nums text-[var(--ds-fg-muted)]">0:42 / 3:34</span>,
      },
      {
        label: 'Speed',
        render: (
          <span className="grid h-8 min-w-10 place-items-center rounded-[var(--radius-md)] border border-[var(--ds-border)] px-2 text-caption font-semibold text-[var(--ds-fg-secondary)]">
            1.5×
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Player size="full" title="Chapter 3" src="chapter-3.mp3" duration={214} />
      </div>
    ),
    caption:
      'The full player: waveform, elapsed and total time, then a transport row with the secondary controls pushed to the edges so the play button stays centred.',
    parts: [
      {
        n: 1,
        label: 'Waveform',
        value: '64px full · 28px row',
        kind: 'size',
        note: 'The content surface. Below about 24px the peaks stop resolving into a shape and it is a textured bar; above 80px it is an instrument panel in a page that is not one.',
      },
      {
        n: 2,
        label: 'Bar count',
        value: '96–120 full · 48–72 row',
        kind: 'shape',
        note: 'Derived from width, not fixed: bars narrower than 1px alias into a grey smear. Roughly one bar per 3–4px of width.',
      },
      {
        n: 3,
        label: 'Played fill',
        value: 'accent',
        kind: 'color',
        note: 'The only state that must be readable across forty rows at a glance. It answers "which one is playing?", which is why it takes the accent rather than a neutral.',
      },
      {
        n: 4,
        label: 'Playhead',
        value: '1.5px, foreground',
        kind: 'shape',
        note: 'Drawn only once position > 0. At 0:00 it is a stray tick on the left edge of every idle row.',
      },
      {
        n: 5,
        label: 'Transport',
        value: '48px full · 28px row',
        kind: 'size',
        note: 'The play button is the one control that must never wait for anything — not for peaks, not for metadata.',
      },
      {
        n: 6,
        label: 'Time',
        value: 'tabular-nums',
        kind: 'type',
        note: 'Two labels in the full player, one in a row. Proportional digits make the readout jitter on every tick.',
      },
      {
        n: 7,
        label: 'Secondary controls',
        value: 'Mute, speed, ±10s',
        kind: 'space',
        note: 'Full player only. In a row they would be 20px targets in a dense table, so they are dropped rather than shrunk.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent', usedFor: 'Played portion of the waveform and the play button fill', group: 'Waveform' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Unplayed bars — present, quiet, never competing with the played half', group: 'Waveform' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Unplayed bars when there is no source', group: 'Waveform' },
    { category: 'color', token: '--ds-fg', usedFor: 'The playhead', group: 'Waveform' },
    { category: 'color', token: '--ds-fg-on-accent', usedFor: 'The play glyph', group: 'Controls' },
    { category: 'color', token: '--ds-accent-hover', usedFor: 'Play button hover', group: 'Controls' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Time readout', group: 'Controls' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus ring on the scrubber and every control', group: 'Controls' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Full-player shell', group: 'Surfaces' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Full-player border', group: 'Surfaces' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Gap between transport, waveform and time' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Full-player shell' },
    { category: 'radius', token: '--radius-full', usedFor: 'Play button and bar caps' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Every time readout, so it does not jitter as it counts' },
  ],

  sizes: [
    { name: 'Row', height: '28px', icon: '28px play', gap: '8px', touch: '44px on coarse pointers', use: 'One cell of a list row. Play, waveform, one time label — nothing else.' },
    { name: 'Full', height: '64px waveform', padding: '16px', radius: '12px', icon: '48px play', use: 'One per view, when the clip is why the page exists.' },
    { name: 'Bars (row)', minWidth: '48', maxWidth: '72', use: 'Roughly one per 3–4px of width. Fewer at narrow widths, never more.' },
    { name: 'Bars (full)', minWidth: '96', maxWidth: '120', use: 'Enough to resolve a phrase; more is a smear at any realistic width.' },
    { name: 'Play button', height: '28px row · 48px full', use: 'Filled with the accent. It is the only affordance that is never ambiguous.' },
    { name: 'Time', type: '11px', minWidth: '36px row · none full', use: 'Fixed width in a row so the waveform does not resize as the clock counts.' },
  ],

  do: [
    {
      title: 'Draw a shape before you have the real one',
      why: 'A shape seeded from the URL is deterministic, arrives instantly, and reads as audio. An empty row while forty files decode reads as broken.',
      render: <div className="w-56"><Player title="Seeded" src="seeded.mp3" duration={22} bars={40} /></div>,
    },
    {
      title: 'Name the track in every label',
      why: 'Forty buttons that all announce "Play" are forty identical rows to a screen reader. "Play Arthur" is the row.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          aria-label="Play Arthur"
          <br />
          aria-valuetext="0:42 of 3:34"
        </code>
      ),
    },
    {
      title: 'Make the waveform a real slider',
      why: 'A canvas cannot take focus and has no value. role="slider" with arrow keys is what stops the scrubber being mouse-only.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          role="slider" tabindex="0"
          <br />← → ±5s · ⇧ ±30s · Home / End
        </code>
      ),
    },
    {
      title: 'Stop the others when one starts',
      why: 'Two clips over each other is never intended, and a list makes it one click away. Keep the registry in the component, not in each list.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          players.forEach(p =&gt; p !== active &amp;&amp; p.pause())
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not decode every row on page load',
      why: 'Peaks require the whole file. Forty three-megabyte tracks is a hundred megabytes fetched to draw pictures nobody has looked at yet.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          rows.forEach(r =&gt; decodeAudioData(r)) → 120 MB
        </code>
      ),
    },
    {
      title: 'Do not put native controls in a list',
      why: '54px of chrome per row, a different look in every browser, no exclusivity, and no way to theme the one element the reader is comparing across rows.',
      render: (
        <span className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] p-1.5">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls className="w-48" />
        </span>
      ),
    },
    {
      title: 'Do not shrink the full player to fit a row',
      why: 'Mute, speed and skip at row height are 20px targets in a dense table. A control too small to hit is worse than one that is not there.',
      render: (
        <span className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-2 py-1">
          {['▶', '🔇', '1×', '⏪', '⏩'].map((g) => (
            <span key={g} className="grid h-4 w-4 place-items-center text-[8px] text-[var(--ds-fg-muted)]">{g}</span>
          ))}
        </span>
      ),
    },
    {
      title: 'Do not show 0:00 as a row’s only label',
      why: 'A column of zeroes tells the reader nothing. Before playback the one label is the duration; after it starts, the position.',
      render: (
        <span className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] px-2 py-1 text-caption tabular-nums text-[var(--ds-fg-muted)]">
          0:00 · 0:00 · 0:00
        </span>
      ),
    },
    {
      title: 'Do not block play on the waveform',
      why: 'Peaks are decoration for the first second and content afterwards. A play button that waits for a decode is a player that feels broken on a slow connection.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          await peaks; audio.play()  → 3s of nothing
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.2', name: 'Audio Control', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '1.2.1', name: 'Audio-only (Prerecorded)', level: 'A' },
      { id: '4.1.2', name: 'Name, Role, Value', level: 'A' },
    ],
    contrast: [
      'The played and unplayed halves of the waveform must differ by more than hue — the split is what tells a reader where they are, and it is the first thing to disappear for a colour-blind user.',
      'Unplayed bars still need 3:1 against the row background. Bars drawn at 15% alpha look elegant and vanish on a projector.',
      'The playhead is a 1.5px line: it needs the strongest foreground in the palette, not a mid-grey.',
      'The focus ring goes on the scrubber itself, not on a wrapper — the wrapper is usually the full row and the ring then describes the wrong thing.',
    ],
    keyboard: [
      { keys: 'Space / Enter', does: 'Toggle playback when the scrubber or the play button has focus.' },
      { keys: '← / →', does: 'Seek by five seconds. ↑ / ↓ do the same, since a slider is expected to answer both axes.' },
      { keys: 'Shift + ← / →', does: 'Seek by thirty seconds — the coarse pass through a long clip.' },
      { keys: 'Home / End', does: 'Jump to the start, or to the last second rather than to the end event.' },
      { keys: 'Tab', does: 'Play button, then scrubber, then the secondary controls. Two stops per row, not seven.' },
    ],
    aria: [
      { attr: 'role="slider"', on: 'The waveform', note: 'It is a canvas or a stack of spans: without this it has no role, no value and no keyboard.' },
      { attr: 'tabindex="0"', on: 'The waveform', note: 'Neither a canvas nor a div is focusable by default, so the scrubber is mouse-only until this is set.' },
      { attr: 'aria-valuenow / aria-valuetext', on: 'The waveform', note: '"0:42 of 3:34". A bare percentage conveys nothing about a clip.' },
      { attr: 'aria-label', on: 'Play and the scrubber', note: 'Include the track name. In a list the bare verb is repeated for every row.' },
      { attr: 'aria-disabled', on: 'The scrubber with no source', note: 'Disabled rather than absent, so its position in the row is stable.' },
    ],
    focus:
      'The play button and the scrubber are two tab stops per player; the secondary controls exist only on the full player, so a list never costs more than two stops per row. Focus must survive a re-render — a list that rebuilds its rows while one is playing has to move the live player into the new node rather than recreate it, or the keyboard user loses both the control and the audio.',
    screenReader: [
      'Announce the clip with its length: "Arthur, audio, 26 seconds". A row that announces only "Play" is indistinguishable from the thirty-nine below it.',
      'Never announce elapsed time continuously. A live region on the clock is the fastest way to make a player unusable.',
      'Audio-only content needs a transcript to satisfy 1.2.1. For generated speech that is free — it is the script you sent to the model.',
    ],
    touch:
      'The play button is 28px in a row for density and gets a 44px ::after overlay on coarse pointers, per the touch-target rule. The waveform is already at least 44px wide and is the seek target, so it needs no expansion — but it must not be the whole row, or a tap meant to select the row scrubs the audio instead.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// One per view. Decodes real peaks as soon as it has a source.
const player = new AudioPlayer({ mount: el, variant: 'full' })
player.load('/uploads/chapter-3.mp3')

// In a list. Two differences, both load-bearing:
//   lazyWaveform — the row costs nothing until the reader shows interest
//   label        — "Play Arthur", not the forty-fold "Play"
const row = new AudioPlayer({
  mount: cell,
  variant: 'compact',
  lazyWaveform: true,
  bars: 56,
  label: track.title,
})

// attach() points it at a source WITHOUT fetching: the seeded shape and the
// duration you already have from the API are enough to render a real,
// scrubbable row before a byte is spent.
row.attach(track.src, { duration: track.duration_sec })

// A list that re-renders must MOVE its players, not rebuild them. A dropped
// player keeps playing with nothing left to stop it, and still holds its slot
// in the exclusivity registry — so it silences whatever you start next.
if (players.has(id)) players.get(id).remount(cell)
else players.set(id, new AudioPlayer({ mount: cell, variant: 'compact' }))
for (const [id, p] of players) if (!visible.has(id)) { p.destroy(); players.delete(id) }`,
    },
    html: {
      lang: 'html',
      code: `<!-- One clip on an otherwise plain page: use the native element. It brings
     keyboard control, the platform's own accessibility integration, and a
     download affordance you would otherwise have to build. -->
<figure>
  <audio controls preload="metadata" src="/uploads/chapter-3.mp3"></audio>
  <figcaption>
    Chapter 3 · 3 min 34 s ·
    <a href="/transcripts/chapter-3">Read the transcript</a>
  </figcaption>
</figure>

<!-- A themed player is the markup below. The waveform is a canvas because a
     list of forty is forty canvases rather than forty times seventy DOM nodes,
     and it is a slider because a canvas is otherwise a picture. -->
<div class="ds-audio ds-audio--row">
  <button class="ds-audio__play" type="button" aria-label="Play Arthur">…</button>

  <canvas
    class="ds-audio__wave"
    tabindex="0"
    role="slider"
    aria-label="Seek Arthur"
    aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"
    aria-valuetext="0:00 of 0:26"
  ></canvas>

  <span class="ds-audio__time">0:26</span>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-audio {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-inline-size: 0;          /* or the waveform pushes the row wider than its cell */
  user-select: none;
}

/* The scarce thing in a list is vertical space, so the row variant is one line. */
.ds-audio--row .ds-audio__wave { block-size: 28px; }
.ds-audio--full .ds-audio__wave { block-size: 64px; }

.ds-audio__wave {
  flex: 1 1 auto;
  min-inline-size: 0;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

/* A canvas is not focusable and has no value semantics. role="slider" plus a
   real focus ring is what makes it a control rather than a picture. */
.ds-audio__wave:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

.ds-audio__play {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  inline-size: 28px;
  block-size: 28px;
  border-radius: var(--radius-full);
  background: var(--ds-accent);
  color: var(--ds-fg-on-accent);
}
.ds-audio--full .ds-audio__play { inline-size: 48px; block-size: 48px; }
.ds-audio__play:hover { background: var(--ds-accent-hover); }
.ds-audio__play:disabled { opacity: 0.4; }

/* Fixed width, tabular figures: the waveform must not resize as the clock
   counts, and the digits must not jitter. */
.ds-audio__time {
  flex: 0 0 auto;
  min-inline-size: 36px;
  text-align: end;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--ds-fg-muted);
}

/* 28px is right for density and wrong for a thumb. The overlay makes the target
   44px without inflating the row. */
@media (pointer: coarse) {
  .ds-audio__play { position: relative; }
  .ds-audio__play::after {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    inline-size: 44px;
    block-size: 44px;
    translate: -50% -50%;
  }
}`,
    },
    api: [
      {
        name: 'AudioPlayer',
        props: [
          { name: 'mount', type: 'Element | string', required: true, description: 'The element the player renders itself into. The <audio> is created outside it, so the mount can be replaced without stopping playback.' },
          { name: 'audio', type: 'HTMLAudioElement', description: 'Adopt an existing element instead of creating one, so a caller keeping its own src/play logic keeps working.' },
          { name: 'variant', type: "'full' | 'compact'", default: "'full'", description: "'compact' is the 28px row: play, waveform, one time label. It drops mute, speed and skip rather than shrinking them." },
          { name: 'lazyWaveform', type: 'boolean', default: 'false', description: 'Required in lists. preload="none" plus a seeded shape until hover, focus or play; then metadata and the real peaks.' },
          { name: 'bars', type: 'number', default: '120', description: 'Bar count. Roughly one per 3–4px of expected width — narrower than 1px and they alias into a smear.' },
          { name: 'label', type: 'string', description: 'The track name, folded into every aria-label. Without it a list announces "Play" forty times.' },
          { name: 'skipSeconds', type: 'number', default: '10', description: 'Full-player skip buttons. Ten for speech, thirty for long-form is the usual pair.' },
          { name: 'attach(url, {duration})', type: 'method', description: 'Point at a source without fetching it. The duration you already have makes the row real and scrubbable before any bytes are spent.' },
          { name: 'load(url)', type: 'method', description: 'Set the source and fetch it now. The eager counterpart of attach().' },
          { name: 'remount(el)', type: 'method', description: 'Move the UI into a new element, keeping the audio and its playback. What a re-rendering list must call instead of constructing a new player.' },
          { name: 'destroy()', type: 'method', description: 'Pause, unregister, and empty the mount. A player left behind keeps playing and keeps silencing the next one you start.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show the duration before playback and the position after it. In a row that is one label doing two jobs, and it is the difference between a list you can read and a column of zeroes.',
      'Seed the placeholder shape from the source URL, never from a random number: the same clip must look the same on every render, or the shape stops being an identifier.',
      'Take the duration from your own API when you have it. It makes the row scrubbable before the media loads, and the media’s own duration overrides it on arrival.',
      'Draw the playhead only once playback has moved. At zero it is a tick on the left edge of every idle row.',
      'For generated speech, publish the script as the transcript. It satisfies 1.2.1 for free and is usually what the user wants to copy anyway.',
    ],
    performance: [
      'Peaks require the entire file: fetch, arrayBuffer, decodeAudioData. That is the one expensive thing in this component and the only one worth designing around.',
      'Share a single AudioContext across every player. Browsers cap them at around six, and a list of rows exhausts that on its own.',
      'preload="none" for lazy rows, then "metadata" on first interest. "auto" in a list will saturate the connection before anyone presses play.',
      'Redraw on timeupdate — about four times a second — not on requestAnimationFrame. A playhead does not need 60fps and a list of canvases certainly does not.',
      'Cache decoded peaks by URL. Scrolling a list back and forth otherwise re-downloads and re-decodes the same files.',
      'Size the canvas by devicePixelRatio and redraw on resize, or the bars are soft on every retina display.',
    ],
    mistakes: [
      'Decoding every row on page load, which turns a list into a hundred-megabyte download.',
      'Rebuilding players when a list re-renders, leaving orphans that keep playing and keep silencing the next clip.',
      'A waveform with no role, no tabindex and no keys — a scrubber only a mouse can reach.',
      'aria-valuenow as a bare percentage, so a screen reader announces "34" for a position.',
      'Native <audio controls> in a table, which is unstyleable, differently sized in every browser, and happy to play four clips at once.',
      'A play button that waits for the decode, so the first press appears to do nothing.',
      'Unplayed bars at 15% alpha: elegant on the designer’s monitor, invisible on a projector.',
    ],
    realWorld: [
      'The waveform earns its cost in exactly one place — a list where clips are being compared. For a single clip on a plain page, the native element is a better answer than anything custom.',
      'People use the shape to skip the silence at the front of a generated clip. That is the most common interaction with a voice preview and it is impossible with a progress bar.',
      'Exclusive playback is noticed only when it is missing: nobody remarks that one clip stops the last one, and everybody notices four playing at once.',
      'A seeded placeholder shape is indistinguishable from a real waveform for the first second of attention, which is all it needs to survive — and it is why lazy decoding does not read as a downgrade.',
    ],
  },
})
