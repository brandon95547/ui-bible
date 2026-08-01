import * as React from 'react'
import { Captions, Maximize2, Pause, Play, Settings2, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from '@/ui/Button'
import { Cell, Grid, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Player({
  captions = true,
  compact,
  poster = true,
}: {
  captions?: boolean
  compact?: boolean
  poster?: boolean
}) {
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(true)
  const [cc, setCc] = React.useState(captions)
  const [progress, setProgress] = React.useState(0.34)

  return (
    <figure className="w-full">
      <div
        style={{ aspectRatio: '16 / 9' }}
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] bg-black"
      >
        {/* The poster is what holds the frame before a byte of video loads. */}
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
            !poster && 'opacity-0',
          )}
        />

        {!playing && (
          <button
            type="button"
            aria-label="Play video"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 grid place-items-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[var(--ds-focus-ring)]"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-black shadow-e3">
              <Play size={22} className="ml-0.5" />
            </span>
          </button>
        )}

        {cc && playing && (
          // Captions sit above the controls, never behind them.
          <span className="absolute inset-x-4 bottom-14 text-center">
            <span className="inline-block rounded-[var(--radius-sm)] bg-black/75 px-2 py-1 text-caption text-white">
              …and the rollback completed in about eight seconds.
            </span>
          </span>
        )}

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6',
            compact && 'px-1.5 pb-1',
          )}
        >
          {/* The scrubber is a real range input: keyboard, screen reader and
              touch all work without reimplementing any of it. */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${Math.round(progress * 214)} seconds of 214`}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, #fff ${progress * 100}%, rgb(255 255 255 / 0.25) ${progress * 100}%)`,
            }}
          />

          <Row gap="sm" align="center" className="w-full">
            <IconButton
              size="sm"
              label={playing ? 'Pause' : 'Play'}
              icon={playing ? <Pause /> : <Play />}
              onClick={() => setPlaying((p) => !p)}
              className="text-white hover:bg-white/15"
            />
            <IconButton
              size="sm"
              label={muted ? 'Unmute' : 'Mute'}
              icon={muted ? <VolumeX /> : <Volume2 />}
              onClick={() => setMuted((m) => !m)}
              className="text-white hover:bg-white/15"
            />
            <span className="font-mono text-[11px] tabular-nums text-white/80">
              {String(Math.floor(progress * 214 / 60)).padStart(1, '0')}:
              {String(Math.floor((progress * 214) % 60)).padStart(2, '0')} / 3:34
            </span>
            <span className="flex-1" />
            <IconButton
              size="sm"
              label={cc ? 'Hide captions' : 'Show captions'}
              icon={<Captions />}
              onClick={() => setCc((c) => !c)}
              className={cn('text-white hover:bg-white/15', cc && 'bg-white/20')}
            />
            {!compact && (
              <IconButton
                size="sm"
                label="Playback settings"
                icon={<Settings2 />}
                className="text-white hover:bg-white/15"
              />
            )}
            <IconButton
              size="sm"
              label="Full screen"
              icon={<Maximize2 />}
              className="text-white hover:bg-white/15"
            />
          </Row>
        </div>
      </div>
      <figcaption className="mt-2 text-caption text-[var(--ds-fg-muted)]">
        Rolling back a failed deployment · 3 min 34 s ·{' '}
        <a href="#/video" className="underline underline-offset-2">
          Read the transcript
        </a>
      </figcaption>
    </figure>
  )
}

function Playground() {
  const [captions, setCaptions] = React.useState(true)
  const [poster, setPoster] = React.useState(true)
  const [compact, setCompact] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={330}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={captions} onChange={setCaptions} label="Captions" />
          <KnobToggle checked={poster} onChange={setPoster} label="Poster" />
          <KnobToggle checked={compact} onChange={setCompact} label="Compact" />
        </div>
      }
      code={`<video
  controls
  playsInline
  preload="metadata"
  poster="/poster.jpg"
  width={1600}
  height={900}
>
  <source src="/rollback.webm" type="video/webm" />
  <source src="/rollback.mp4"  type="video/mp4" />
  <track kind="captions" srcLang="en" label="English" src="/rollback.vtt" default />
</video>`}
    >
      <div className="w-full max-w-lg">
        <Player captions={captions} poster={poster} compact={compact} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'video',
    title: 'Video',
    tagline:
      'Player controls, poster frames, captions, and the autoplay rules that keep it legal and quiet.',
    keywords: ['player', 'media player', 'audio', 'captions', 'poster', 'autoplay', 'transcript', 'controls'],
  },

  overview: {
    purpose:
      'A video player renders time-based media with the controls to move through it. Almost everything that matters about it is outside the picture: a poster that holds the frame before anything loads, captions that are not optional, controls that reach the keyboard, and an autoplay policy that does not ambush the user with sound.',
    whenToUse: [
      'Product demos, tutorials and walkthroughs where motion carries the explanation.',
      'Recorded sessions, incident replays and screen captures.',
      'Short looping clips that illustrate an interaction better than a still can.',
    ],
    whenNotToUse: [
      {
        text: 'A still image would say the same thing.',
        instead: 'an Image — it loads faster, prints, and can be read at any pace',
        to: '#/image',
      },
      {
        text: 'It is decorative background motion.',
        instead: 'a still image; background video costs megabytes and battery for atmosphere',
        to: '#/jumbotron',
      },
      {
        text: 'The content is a sequence of steps.',
        instead: 'text and images — a reader can move at their own pace and copy the commands',
        to: '#/code-snippet',
      },
      {
        text: 'It is a loading animation.',
        instead: 'a Progress Indicator or a Skeleton',
        to: '#/progress-indicator',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Captions are not optional.</strong> WCAG 1.2.2 requires them for prerecorded
          video with audio at level A, and they are used far beyond their original audience —
          people watching in an open office, on a train, or in a second language. Auto-generated
          captions are a starting point, not a delivery.
        </p>
        <p>
          <strong>Autoplay must be muted or it will not play.</strong> Every browser blocks
          unmuted autoplay, so a player relying on it appears broken rather than loud. If motion
          starts on its own, WCAG 2.2.2 also requires a way to pause it — and{' '}
          <code>prefers-reduced-motion</code> means some users should never see it start at all.
        </p>
        <p>
          Prefer the <strong>native player</strong> unless you have a specific reason not to. It
          brings keyboard control, captions, picture-in-picture, AirPlay, playback speed and the
          platform’s own accessibility integration. A custom player has to rebuild all of it, and
          most rebuild about half.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'poster',
        title: 'The poster holds the frame',
        description:
          'A poster at the same aspect ratio means nothing shifts when the video loads — and it gives the user something to decide about before any bytes are spent.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="With poster" tone="good">
                <Player compact />
              </Cell>
              <Cell label="Without" sub="Black box, no context" tone="bad">
                <Player compact poster={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'captions',
        title: 'Captions and transcript',
        description:
          'Captions are required at level A. A transcript beside the player is not required and is often more useful — it is searchable, skimmable and copyable.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-lg">
              <Player />
              <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] p-3">
                <span className="text-overline uppercase text-[var(--ds-fg-muted)]">Transcript</span>
                <p className="mt-1.5 text-caption leading-relaxed text-[var(--ds-fg-secondary)]">
                  <span className="font-mono text-[var(--ds-fg-muted)]">0:12</span> The health check
                  failed in eu-west-2 after the connection pool saturated.{' '}
                  <span className="font-mono text-[var(--ds-fg-muted)]">0:24</span> We rolled back
                  to build 4019, and the rollback completed in about eight seconds.
                </p>
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'autoplay',
        title: 'Autoplay rules',
        description:
          'Muted or it will not play at all. Looping decorative clips need a pause control under WCAG 2.2.2, and reduced-motion users should get the poster instead.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full max-w-md">
              {[
                ['muted + playsInline + loop', 'Plays. The only autoplay that works.', 'good'],
                ['autoplay with sound', 'Blocked by every browser. Looks broken.', 'bad'],
                ['autoplay, no pause control', 'Fails WCAG 2.2.2 past five seconds.', 'bad'],
                ['prefers-reduced-motion', 'Show the poster, do not start.', 'good'],
              ].map(([rule, note, tone]) => (
                <Row key={rule} gap="sm" align="start" className="w-full">
                  <code
                    className={cn(
                      'w-52 shrink-0 font-mono text-caption',
                      tone === 'good' ? 'text-[var(--ds-success-text)]' : 'text-[var(--ds-danger-text)]',
                    )}
                  >
                    {rule}
                  </code>
                  <span className="text-caption text-[var(--ds-fg-muted)]">{note}</span>
                </Row>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'controls',
        title: 'The control bar',
        description:
          'Play, mute, elapsed time, captions, settings and full screen. The scrubber is a real range input, so keyboard and screen-reader support come for free.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-md rounded-[var(--radius-lg)] bg-black p-2">
              <Row gap="sm" align="center" className="w-full">
                <IconButton size="sm" label="Play" icon={<Play />} className="text-white hover:bg-white/15" />
                <IconButton size="sm" label="Mute" icon={<Volume2 />} className="text-white hover:bg-white/15" />
                <span className="font-mono text-[11px] tabular-nums text-white/80">1:12 / 3:34</span>
                <span className="flex-1" />
                <IconButton size="sm" label="Captions" icon={<Captions />} className="bg-white/20 text-white" />
                <IconButton size="sm" label="Settings" icon={<Settings2 />} className="text-white hover:bg-white/15" />
                <IconButton size="sm" label="Full screen" icon={<Maximize2 />} className="text-white hover:bg-white/15" />
              </Row>
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Poster',
        render: (
          <span className="relative grid h-16 w-28 place-items-center overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-black">
              <Play size={14} className="ml-0.5" />
            </span>
          </span>
        ),
      },
      {
        label: 'Playing',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-white/15 text-white">
            <Pause size={15} />
          </span>
        ),
      },
      {
        label: 'Muted',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-black text-white">
            <VolumeX size={15} />
          </span>
        ),
      },
      {
        label: 'Captions on',
        render: (
          <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-white/20 text-white">
            <Captions size={15} />
          </span>
        ),
      },
      {
        label: 'Caption text',
        render: (
          <span className="rounded-[var(--radius-sm)] bg-black/75 px-2 py-1 text-caption text-white">
            …completed in eight seconds.
          </span>
        ),
      },
      {
        label: 'Scrubber',
        render: (
          <span
            className="block h-1 w-28 rounded-full"
            style={{ background: 'linear-gradient(to right, #fff 34%, rgb(255 255 255 / 0.25) 34%)' }}
          />
        ),
      },
      {
        label: 'Time',
        render: (
          <span className="font-mono text-[11px] tabular-nums text-white/80">1:12 / 3:34</span>
        ),
      },
      {
        label: 'Reduced motion',
        render: (
          <span className="grid h-16 w-28 place-items-center rounded-[var(--radius-md)] bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] text-caption text-white/70">
            Poster only
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Player />
      </div>
    ),
    caption:
      'A 16:9 frame with a poster, a scrim-backed control bar, captions positioned above the controls, and a caption line linking to the transcript.',
    parts: [
      {
        n: 1,
        label: 'Aspect ratio',
        value: '16:9, reserved',
        kind: 'size',
        note: 'Held before anything loads, exactly as for an image. A player that resizes on load shifts everything below it.',
      },
      {
        n: 2,
        label: 'Poster',
        value: 'Same ratio, real frame',
        kind: 'color',
        note: 'A frame from the video rather than a generic thumbnail. It is what the user decides on before any bytes are spent.',
      },
      {
        n: 3,
        label: 'Play affordance',
        value: '56px, centred',
        kind: 'size',
        note: 'Large and unmissable. It is the only control that matters before playback starts, and it must be a real button.',
      },
      {
        n: 4,
        label: 'Control bar',
        value: '40px over a scrim',
        kind: 'space',
        note: 'The gradient is not decoration — white controls over an arbitrary frame have no contrast without it.',
      },
      {
        n: 5,
        label: 'Scrubber',
        value: 'Real input[type=range]',
        kind: 'shape',
        note: 'Native, so arrow keys, Home, End and screen-reader value announcements all work without being rebuilt.',
      },
      {
        n: 6,
        label: 'Caption position',
        value: 'Above the controls',
        kind: 'space',
        note: 'Captions hidden behind the control bar is the most common video bug, and it appears the moment the controls fade in.',
      },
      {
        n: 7,
        label: 'Transcript link',
        value: 'Below the player',
        kind: 'type',
        note: 'Not required by WCAG, and frequently more useful than the video: searchable, skimmable, copyable and printable.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: 'black', usedFor: 'The frame behind the video, so letterboxing is deliberate' },
    { category: 'color', token: 'white', usedFor: 'Controls, which sit over an unpredictable image' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on controls' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'The caption line and duration beneath the player' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Control bar padding' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Player corners' },
    { category: 'typography', token: 'tabular-nums', usedFor: 'Elapsed time, so it does not jitter every second' },
    { category: 'motion', token: 'controls fade', value: '200ms', usedFor: 'Auto-hide during playback' },
  ],

  sizes: [
    { name: 'Inline', maxWidth: '40rem', height: '16:9', use: 'Inside prose, matched to the reading measure.' },
    { name: 'Full-width', minWidth: '100%', height: '16:9', use: 'A demo that is the subject of the page.' },
    { name: 'Thumbnail', height: '16:9', minWidth: '160px', use: 'In a list or a grid. Poster plus a duration badge, no controls.' },
    { name: 'Control bar', height: '40px', padding: '0 8px', touch: '44px on coarse pointers', use: 'Over a gradient scrim, since white on an arbitrary frame has no contrast.' },
    { name: 'Play affordance', height: '56px', use: 'Centred, unmissable, and a real button.' },
    { name: 'Captions', type: '13–16px', use: 'User-resizable. Positioned above the control bar, never behind it.' },
  ],

  do: [
    {
      title: 'Ship real captions',
      why: 'Required at level A for prerecorded video with audio, and used far beyond their original audience — open offices, trains, second languages.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;track kind="captions" srclang="en"
          <br />
          &nbsp;&nbsp;label="English" src="/v.vtt" default /&gt;
        </code>
      ),
    },
    {
      title: 'Use a real frame as the poster',
      why: 'It holds the aspect ratio, gives the user something to decide on, and costs a fraction of the video. A black box tells them nothing.',
      render: (
        <span className="relative grid h-16 w-28 place-items-center overflow-hidden rounded-[var(--radius-md)] bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-black">
            <Play size={14} className="ml-0.5" />
          </span>
        </span>
      ),
    },
    {
      title: 'Offer a transcript',
      why: 'Not required, and often more useful than the video itself: searchable, skimmable, copyable, printable, and translatable.',
      render: (
        <a href="#/video" className="text-caption text-[var(--ds-accent-text)] underline underline-offset-2">
          Read the transcript
        </a>
      ),
    },
    {
      title: 'Respect prefers-reduced-motion',
      why: 'An autoplaying loop can trigger vestibular symptoms. Show the poster and let the user start it deliberately.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          @media (prefers-reduced-motion: reduce) {'{'}
          <br />
          &nbsp;&nbsp;video {'{'} display: none {'}'} .poster {'{'} display: block {'}'}
          <br />
          {'}'}
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not autoplay with sound',
      why: 'Every browser blocks it, so the player appears broken rather than loud — and where it does play, it is the single most hostile thing a page can do.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">
          &lt;video autoplay&gt;  → blocked, shows a frozen frame
        </code>
      ),
    },
    {
      title: 'Do not hide the controls',
      why: 'A video with no controls cannot be paused, scrubbed or muted. If it is decorative enough not to need them, it should be an image.',
      render: (
        <span className="grid h-16 w-28 place-items-center rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-black text-caption text-white/60">
          no controls
        </span>
      ),
    },
    {
      title: 'Do not let captions sit behind the controls',
      why: 'The most common video bug, and it appears the moment the control bar fades in — exactly when the user reaches for it.',
      render: (
        <span className="relative grid h-16 w-32 place-items-end overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-black">
          <span className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/90 to-transparent" />
          <span className="relative z-0 mb-1 w-full text-center text-[9px] text-white/40">
            …hidden caption text
          </span>
        </span>
      ),
    },
    {
      title: 'Do not ship a background video for atmosphere',
      why: 'Several megabytes, sustained battery drain, no autoplay in low-power mode, and a decode that competes with rendering the text people came for.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          hero-loop.mp4 — 8.4 MB, plays on every visit
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.2.2', name: 'Captions (Prerecorded)', level: 'A' },
      { id: '1.2.3', name: 'Audio Description or Media Alternative', level: 'A' },
      { id: '1.2.5', name: 'Audio Description (Prerecorded)', level: 'AA' },
      { id: '1.4.2', name: 'Audio Control', level: 'A' },
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
    ],
    contrast: [
      'Controls sit over an unpredictable frame, so they need a scrim. White icons over an arbitrary video have no assertable contrast.',
      'Caption text needs a solid or near-solid background, not a text shadow. A shadow fails against a bright frame.',
      'Captions must be resizable to at least 200% without being clipped — the user’s setting, not yours.',
      'The focus ring on a control must be visible against both the scrim and a bright frame, which usually means an inset ring rather than an outset one.',
    ],
    keyboard: [
      { keys: 'Space / K', does: 'Play and pause. Both, because both are conventions users arrive with.' },
      { keys: '← / →', does: 'Seek by five seconds. ↑ / ↓ adjusts volume.' },
      { keys: 'Home / End', does: 'Jump to the start or end.' },
      { keys: 'M', does: 'Toggle mute. C toggles captions. F toggles full screen.' },
      { keys: 'Tab', does: 'Moves through the control bar, which must not auto-hide while it holds focus.' },
    ],
    aria: [
      { attr: '<track kind="captions">', on: 'The video', note: 'Required at level A. Auto-generated captions are a starting point, not a delivery.' },
      { attr: '<track kind="descriptions">', on: 'The video', note: 'Audio description for anything conveyed visually and not spoken — required at AA.' },
      { attr: 'aria-label', on: 'Every control', note: '"Play", "Mute", "Show captions". Icon-only controls over video are the least self-explanatory in any product.' },
      { attr: 'aria-valuetext', on: 'The scrubber', note: '"1 minute 12 seconds of 3 minutes 34" — a bare 0–1 range value is meaningless.' },
      { attr: 'aria-live="off"', on: 'The elapsed time', note: 'Explicitly off. A time display that announces every second is unusable.' },
    ],
    focus:
      'The control bar must not auto-hide while any control inside it has focus — otherwise a keyboard user loses the thing they are operating. Entering full screen keeps focus inside the player; leaving it returns focus to the control that triggered it.',
    screenReader: [
      'The player announces its length up front: "Rolling back a failed deployment, video, 3 minutes 34 seconds".',
      'The scrubber needs aria-valuetext in real units. A value between 0 and 1 conveys nothing about position.',
      'Do not announce elapsed time continuously. It is the most common way a custom player becomes unusable with a screen reader.',
    ],
    touch:
      'playsInline is mandatory, or iOS takes every video full screen on play. Controls need 44px targets, which usually means a 52px bar. Tap-to-play-pause on the frame is expected on mobile, but keep the explicit button too — a tap-only player is undiscoverable for anyone who does not already know the convention.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// Prefer the native player: keyboard control, captions, picture-in-picture,
// AirPlay, playback speed and platform accessibility all come free.
<video
  controls
  playsInline                     // or iOS takes it full screen on play
  preload="metadata"              // enough for the duration and the poster
  poster="/rollback-poster.jpg"   // holds the ratio, costs a fraction
  width={1600}
  height={900}
>
  <source src="/rollback.webm" type="video/webm" />
  <source src="/rollback.mp4"  type="video/mp4" />

  {/* Required at level A. Auto-generated is a start, not a delivery. */}
  <track kind="captions"     srcLang="en" label="English" src="/rollback.vtt" default />
  <track kind="descriptions" srcLang="en" label="Audio description" src="/rollback-ad.vtt" />

  <p>Your browser cannot play this video. <a href="/rollback.mp4">Download it</a>.</p>
</video>

// The only autoplay that works. Unmuted autoplay is blocked everywhere, so
// the player looks broken rather than loud.
<video autoPlay muted loop playsInline poster="/poster.jpg" />

// An autoplaying loop can trigger vestibular symptoms.
const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
{reduced ? <img src="/poster.jpg" alt={description} /> : <video autoPlay muted loop />}

// If you must build a custom player, the scrubber stays a real range input.
<input
  type="range" min={0} max={duration} value={time}
  aria-label="Seek"
  aria-valuetext={\`\${fmt(time)} of \${fmt(duration)}\`}
  onChange={(e) => seek(Number(e.target.value))}
/>`,
    },
    html: {
      lang: 'html',
      code: `<figure>
  <video
    controls
    playsinline
    preload="metadata"
    poster="/rollback-poster.jpg"
    width="1600"
    height="900"
  >
    <source src="/rollback.webm" type="video/webm" />
    <source src="/rollback.mp4" type="video/mp4" />

    <track kind="captions" srclang="en" label="English"
           src="/rollback.vtt" default />
    <track kind="descriptions" srclang="en" label="Audio description"
           src="/rollback-ad.vtt" />

    <!-- The fallback is a real download, not an apology. -->
    <p>Your browser cannot play this video.
       <a href="/rollback.mp4">Download it instead</a>.</p>
  </video>

  <figcaption>
    Rolling back a failed deployment · 3 min 34 s ·
    <a href="/transcripts/rollback">Read the transcript</a>
  </figcaption>
</figure>`,
    },
    css: {
      lang: 'css',
      code: `.ds-video {
  position: relative;
  /* Held before anything loads, exactly as for an image. */
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--radius-lg);
  /* So letterboxing looks deliberate rather than like a gap. */
  background: #000;
}

.ds-video video {
  inline-size: 100%;
  block-size: 100%;
  object-fit: contain;               /* never crop the frame */
}

/* White controls over an arbitrary frame have no assertable contrast. */
.ds-video__controls {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  padding: 24px 8px 6px;
  background: linear-gradient(to top, rgb(0 0 0 / 0.8), transparent);
  transition: opacity 200ms;
}

/* Must not hide while it holds focus — a keyboard user would lose the
   control they are operating. */
.ds-video[data-playing='true'] .ds-video__controls { opacity: 0; }
.ds-video:hover .ds-video__controls,
.ds-video__controls:focus-within { opacity: 1; }

/* Above the control bar, never behind it. This is the most common video bug
   and it appears exactly when the user reaches for the controls. */
video::cue { background: rgb(0 0 0 / 0.75); color: #fff; font-size: 1em; }
video::-webkit-media-text-track-container { inset-block-end: 56px; }

@media (prefers-reduced-motion: reduce) {
  .ds-video--autoplay video { display: none; }
  .ds-video--autoplay .ds-video__poster { display: block; }
}

@media (pointer: coarse) {
  .ds-video__controls button { inline-size: 44px; block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'Video',
        props: [
          { name: 'src', type: 'string | Source[]', required: true, description: 'WebM first, MP4 as the fallback. One format is a compatibility bet you do not need to take.' },
          { name: 'poster', type: 'string', required: true, description: 'A real frame from the video. It holds the ratio and gives the user something to decide on.' },
          { name: 'captions', type: 'Track[]', required: true, description: 'Required at level A. Include a descriptions track for anything shown but not spoken.' },
          { name: 'autoPlay', type: 'boolean', default: 'false', description: 'Only ever with muted and loop. Unmuted autoplay is blocked everywhere.' },
          { name: 'controls', type: 'boolean', default: 'true', description: 'Turning them off means the video cannot be paused. If it does not need controls, it should be an image.' },
          { name: 'preload', type: "'none' | 'metadata' | 'auto'", default: "'metadata'", description: 'Metadata is enough for the duration and the poster without downloading the file.' },
          { name: 'transcript', type: 'string', description: 'A link rendered beneath the player. Frequently more useful than the video itself.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Show the duration on the poster. "3:34" is what people use to decide whether to start, and its absence is why so many videos go unplayed.',
      'Keep product demos under two minutes. Completion falls off a cliff past that, and a long video is nearly always three short ones.',
      'Publish the transcript as a real page. It is indexable, translatable, and often the version people actually use.',
      'Never link a video as the only documentation of a process. Text can be searched, copied and followed at the reader’s pace.',
      'For short interaction demos, an optimised looping clip with no audio and no controls is often better as an animated image than as a video element.',
    ],
    performance: [
      'preload="metadata" gets you the duration and the poster without downloading the file. preload="auto" on a page with several videos will saturate the connection.',
      'Serve WebM with an MP4 fallback. The savings are substantial and the fallback is one extra source element.',
      'Never autoplay more than one video on a page. Each decode competes for the same main thread and the same battery.',
      'Use an intersection observer to pause off-screen videos. A looping clip playing behind the fold is pure waste.',
      'The poster is often the largest contentful paint on a video page — size and prioritise it like a hero image.',
    ],
    mistakes: [
      'No captions, which fails WCAG 1.2.2 at level A.',
      'Unmuted autoplay, which is blocked everywhere and makes the player look broken.',
      'Missing playsInline, so iOS takes every video full screen on play.',
      'Captions positioned behind the control bar.',
      'A control bar that auto-hides while it still holds keyboard focus.',
      'A scrubber built from divs, losing arrow keys and value announcements.',
      'No poster, so the player is a black box with no ratio and no context.',
      'A background video shipped for atmosphere at several megabytes.',
    ],
    realWorld: [
      'Captions are used most by people who can hear perfectly well — muted autoplay feeds, open offices, second languages. They are an accessibility requirement and a usability win at the same time.',
      'The native player is better than almost every custom one shipped. Custom players are usually built for branding and lose picture-in-picture, AirPlay, playback speed and half the keyboard model.',
      'Video is a poor primary format for documentation. It cannot be searched, copied or skimmed, and it dates the moment the UI changes.',
      'Background video in heroes tests badly and costs a lot. A still frame with a play control gets more engagement than an autoplaying loop nobody asked for.',
    ],
  },
})
