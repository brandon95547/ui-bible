import * as React from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from '@/ui/Button'
import { Cell, Grid, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const SLIDES = [
  { id: '1', title: 'Deploy in seconds', tone: 'from-[#6366f1] to-[#8b5cf6]' },
  { id: '2', title: 'Roll back instantly', tone: 'from-[#0ea5e9] to-[#06b6d4]' },
  { id: '3', title: 'Twenty-four regions', tone: 'from-[#10b981] to-[#059669]' },
  { id: '4', title: 'Secrets at rest', tone: 'from-[#f59e0b] to-[#ef4444]' },
]

function Carousel({
  peek,
  dots = true,
  autoplay,
  compact,
}: {
  peek?: boolean
  dots?: boolean
  autoplay?: boolean
  compact?: boolean
}) {
  const [index, setIndex] = React.useState(0)
  const [playing, setPlaying] = React.useState(!!autoplay)
  const trackRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!playing) return
    const t = window.setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 3500)
    return () => window.clearInterval(t)
  }, [playing])

  const go = (i: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i))
    setIndex(next)
    // Scroll-snap does the movement; this just drives it declaratively.
    trackRef.current?.scrollTo({
      left: next * (trackRef.current.clientWidth * (peek ? 0.8 : 1)),
      behavior: 'smooth',
    })
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Product highlights"
      className="w-full"
      // Autoplay must stop on hover and on focus, or the user is reading
      // something that moves out from under them.
      onMouseEnter={() => setPlaying(false)}
      onFocus={() => setPlaying(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={!peek && i !== index}
              className={cn(
                'shrink-0 snap-start',
                peek ? 'w-[80%]' : 'w-full',
                compact ? 'h-24' : 'h-36',
              )}
            >
              <div
                className={cn(
                  'grid h-full place-items-center rounded-[var(--radius-lg)] bg-gradient-to-br px-4 text-center',
                  s.tone,
                )}
              >
                <span
                  className={cn(
                    'font-semibold text-white drop-shadow',
                    compact ? 'text-body' : 'text-h4',
                  )}
                >
                  {s.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Real buttons, always visible — hover-revealed arrows do not exist
            on touch, which is where a carousel is used most. */}
        <IconButton
          size="sm"
          variant="elevated"
          label="Previous slide"
          icon={<ChevronLeft />}
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2"
        />
        <IconButton
          size="sm"
          variant="elevated"
          label="Next slide"
          icon={<ChevronRight />}
          disabled={index === SLIDES.length - 1}
          onClick={() => go(index + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        />
      </div>

      <Row gap="sm" align="center" className="mt-3 justify-center">
        {autoplay && (
          <IconButton
            size="sm"
            label={playing ? 'Pause' : 'Play'}
            icon={playing ? <Pause /> : <Play />}
            onClick={() => setPlaying((p) => !p)}
          />
        )}
        {dots && (
          <div role="tablist" aria-label="Choose a slide" className="flex items-center gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
                onClick={() => go(i)}
                // The dot is 8px; the target is 24px. Padding, not size.
                className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--ds-focus-ring)]"
              >
                <span
                  className={cn(
                    'block h-2 w-2 rounded-full transition-colors',
                    i === index ? 'bg-[var(--ds-accent)]' : 'bg-[var(--ds-border-strong)]',
                  )}
                />
              </button>
            ))}
          </div>
        )}
        <span aria-live="polite" className="ml-1 text-caption tabular-nums text-[var(--ds-fg-muted)]">
          {index + 1} of {SLIDES.length}
        </span>
      </Row>
    </section>
  )
}

function Playground() {
  const [peek, setPeek] = React.useState(true)
  const [dots, setDots] = React.useState(true)
  const [autoplay, setAutoplay] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={280}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <KnobToggle checked={peek} onChange={setPeek} label="Peek" />
          <KnobToggle checked={dots} onChange={setDots} label="Dots" />
          <KnobToggle checked={autoplay} onChange={setAutoplay} label="Autoplay" />
        </div>
      }
      code={`<Carousel
  aria-label="Product highlights"
  peek={${peek}}
  autoplay={${autoplay}}
>
  {slides.map((s) => (
    <CarouselSlide key={s.id}>{s.content}</CarouselSlide>
  ))}
</Carousel>`}
    >
      <div className="w-full max-w-lg">
        <Carousel key={String(autoplay)} peek={peek} dots={dots} autoplay={autoplay} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'carousel',
    title: 'Carousel',
    tagline:
      'Sequential content shown a frame at a time, with the accessibility and engagement debt that always comes attached.',
    keywords: ['slideshow', 'content slider', 'coverflow', 'autoplay', 'dots', 'swipe', 'snap', 'peek'],
  },

  overview: {
    purpose:
      'A carousel shows one part of a set at a time and lets the user move through the rest. It buys horizontal space in a layout that has run out of vertical space — and it pays for that with everything past the first frame being seen by a small fraction of people. That trade is occasionally worth making, and the honest version of this page is mostly about when it is not.',
    whenToUse: [
      'A gallery of media where browsing is the task and the order does not matter.',
      'Peer content on a narrow screen — related products, other articles — where a grid would not fit.',
      'A set the user is expected to scan rather than read, with the first item still the most important.',
    ],
    whenNotToUse: [
      {
        text: 'The content is important and must be seen.',
        instead: 'stack it — anything past the first frame is seen by a small minority',
        to: '#/grid',
      },
      {
        text: 'The frames are alternatives the user chooses between.',
        instead: 'Tabs, which show every label at once',
        to: '#/tabs',
      },
      {
        text: 'It is a hero rotating marketing messages.',
        instead: 'one Jumbotron with the strongest message — rotating heroes measurably underperform a single one',
        to: '#/jumbotron',
      },
      {
        text: 'The user needs to compare items.',
        instead: 'a Gallery or a Data Table, where everything is visible at once',
        to: '#/gallery',
      },
    ],
    reasoning: (
      <>
        <p>
          The evidence on carousels is not ambiguous: <strong>the first frame gets almost all the
          attention</strong> and later frames get a small fraction of it. If your second slide
          matters, a carousel is the wrong container for it. This is the one component where the
          most useful guidance is a recommendation not to use it.
        </p>
        <p>
          <strong>Autoplay is hostile by default.</strong> It moves content while people are
          reading it, it fails WCAG 2.2.2 without a pause control, and it competes with the user
          for control of the page. If it must exist, it pauses on hover, on focus, and permanently
          once the user interacts.
        </p>
        <p>
          Build it on <strong>CSS scroll-snap</strong>. The browser then gives you momentum,
          touch physics, keyboard scrolling and reduced-motion handling for free, and the buttons
          become a thin layer over a scroll container rather than a bespoke transform engine.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'peek',
        title: 'Peek is the affordance',
        description:
          'A sliver of the next frame is what tells the user there is more. Full-width frames with no peek rely entirely on the dots, which most people never look at.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="With peek" tone="good">
                <Carousel peek compact dots={false} />
              </Cell>
              <Cell label="Full width" sub="Nothing says there is more" tone="bad">
                <Carousel compact dots={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'autoplay',
        title: 'Autoplay needs a pause control',
        description:
          'WCAG 2.2.2 requires it for anything that moves for more than five seconds. It must also stop on hover and on focus, and stay stopped once the user takes over.',
        render: (
          <PreviewStage minHeight={260} center={false}>
            <div className="w-full max-w-lg">
              <Carousel autoplay compact />
              <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">
                Hover or focus the carousel and the rotation stops.
              </p>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'vs-alternatives',
        title: 'What to build instead',
        description:
          'Most carousels exist because a grid did not fit. On a narrow screen a horizontally scrollable row of cards does the same job with none of the machinery.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="sm" className="w-full">
              <span className="text-caption text-[var(--ds-fg-muted)]">
                A scroll row: no dots, no arrows, no state — just overflow and snap.
              </span>
              <div className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[...SLIDES, ...SLIDES].map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      'grid h-20 w-40 shrink-0 snap-start place-items-center rounded-[var(--radius-lg)] bg-gradient-to-br px-3 text-center text-label font-medium text-white',
                      s.tone,
                    )}
                  >
                    {s.title}
                  </div>
                ))}
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'dots',
        title: 'Dots are indicators, not navigation',
        description:
          'Past about six frames the dots stop being countable and start being decoration. At that point a scroll row with no indicator is more honest.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="items-center">
              <Row gap="sm">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      'block h-2 w-2 rounded-full',
                      i === 1 ? 'bg-[var(--ds-accent)]' : 'bg-[var(--ds-border-strong)]',
                    )}
                  />
                ))}
              </Row>
              <Row gap="sm">
                {Array.from({ length: 14 }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'block h-2 w-2 rounded-full',
                      i === 1 ? 'bg-[var(--ds-danger)]' : 'bg-[var(--ds-border-strong)]',
                    )}
                  />
                ))}
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Frame',
        render: (
          <span className="grid h-14 w-24 place-items-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-caption font-medium text-white">
            Slide 1
          </span>
        ),
      },
      { label: 'Prev', render: <IconButton size="sm" variant="elevated" label="Previous" icon={<ChevronLeft />} /> },
      { label: 'Next', render: <IconButton size="sm" variant="elevated" label="Next" icon={<ChevronRight />} /> },
      {
        label: 'At the end',
        render: <IconButton size="sm" variant="elevated" label="Next" icon={<ChevronRight />} disabled />,
      },
      {
        label: 'Dot idle',
        render: <span className="block h-2 w-2 rounded-full bg-[var(--ds-border-strong)]" />,
      },
      {
        label: 'Dot active',
        render: <span className="block h-2 w-2 rounded-full bg-[var(--ds-accent)]" />,
      },
      { label: 'Playing', render: <IconButton size="sm" label="Pause" icon={<Pause />} /> },
      { label: 'Paused', render: <IconButton size="sm" label="Play" icon={<Play />} /> },
      {
        label: 'Counter',
        render: <span className="text-caption tabular-nums text-[var(--ds-fg-muted)]">2 of 4</span>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <Carousel peek />
      </div>
    ),
    caption:
      'A snapping scroll track, always-visible arrows, dots that indicate position, and a live counter that says where you are.',
    parts: [
      {
        n: 1,
        label: 'Track',
        value: 'scroll-snap-type: x mandatory',
        kind: 'motion',
        note: 'A scroll container, not a transform. The browser supplies momentum, touch physics and reduced-motion handling for nothing.',
      },
      {
        n: 2,
        label: 'Peek',
        value: '80% frame width',
        kind: 'size',
        note: 'The sliver of the next frame is the affordance. Without it, nothing on screen says there is more than one.',
      },
      {
        n: 3,
        label: 'Gap',
        value: '12px between frames',
        kind: 'space',
        note: 'Enough that frames read as separate objects. Zero makes a set of cards read as one wide image.',
      },
      {
        n: 4,
        label: 'Arrows',
        value: '32px, always visible',
        kind: 'size',
        note: 'Never hover-revealed: hover does not exist on touch, which is where carousels are used most. Disabled at the ends rather than removed.',
      },
      {
        n: 5,
        label: 'Dot',
        value: '8px dot, 24px target',
        kind: 'size',
        note: 'The target is padding around the dot. An 8px hit area is unusable, and growing the dot makes the row look like a control panel.',
      },
      {
        n: 6,
        label: 'Counter',
        value: '"2 of 4", aria-live',
        kind: 'type',
        note: 'The only feedback a non-visual user gets that the frame changed, and the only exact position readout for everyone else.',
      },
      {
        n: 7,
        label: 'Autoplay interval',
        value: '≥5s, pause on hover',
        kind: 'motion',
        note: 'Anything faster is unreadable. Under WCAG 2.2.2, anything moving for more than five seconds needs a pause control.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-accent', usedFor: 'The active dot' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Inactive dots' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'Elevated arrow buttons over content' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'The position counter' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on arrows and dots' },
    { category: 'spacing', token: '--space-3', value: '12px', usedFor: 'Gap between frames' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Frame corners' },
    { category: 'shadow', token: '--shadow-e2', usedFor: 'Arrows, so they read above the content' },
    { category: 'motion', token: 'scroll-behavior', value: 'smooth', usedFor: 'Programmatic movement between frames' },
    { category: 'motion', token: 'autoplay interval', value: '≥5000ms', usedFor: 'If autoplay exists at all' },
  ],

  sizes: [
    { name: 'Frame', height: 'Content-driven', minWidth: '80% with peek', use: 'Peek at 80% is the standard. 100% removes the affordance entirely.' },
    { name: 'Arrow', height: '32px', minWidth: '32px', touch: '44px on coarse pointers', use: 'Always visible, disabled at the ends, never removed.' },
    { name: 'Dot', height: '8px', touch: '24px target', use: 'The target is padding. Growing the dot itself makes the row read as a control panel.' },
    { name: 'Dot row', maxWidth: '6 dots', use: 'Past six, switch to a counter alone — nobody counts fourteen dots.' },
    { name: 'Gap', gap: '12px', use: 'Between frames, so a set of cards does not read as one wide image.' },
  ],

  do: [
    {
      title: 'Build it on scroll-snap',
      why: 'The browser gives you momentum, touch physics, keyboard scrolling and reduced-motion handling. A transform-based carousel reimplements all of it and gets some wrong.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          overflow-x: auto
          <br />
          scroll-snap-type: x mandatory
        </code>
      ),
    },
    {
      title: 'Show a sliver of the next frame',
      why: 'The peek is the only thing that says "there is more". Dots are a fallback most people never look at.',
      render: <div className="w-full max-w-xs"><Carousel peek compact dots={false} /></div>,
    },
    {
      title: 'Keep arrows visible and disable at the ends',
      why: 'Hover-revealed arrows do not exist on touch. Removing them at the ends shifts the layout at exactly the moment the user reaches the boundary.',
      render: (
        <Row gap="sm">
          <IconButton size="sm" variant="elevated" label="Previous" icon={<ChevronLeft />} disabled />
          <IconButton size="sm" variant="elevated" label="Next" icon={<ChevronRight />} />
        </Row>
      ),
    },
    {
      title: 'Announce the position',
      why: '"2 of 4" in a live region is the only feedback a non-visual user gets that anything moved, and the only exact readout for everyone else.',
      render: (
        <span aria-live="polite" className="text-caption tabular-nums text-[var(--ds-fg-secondary)]">
          2 of 4
        </span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not autoplay without a pause control',
      why: 'It fails WCAG 2.2.2 outright, and it moves content while people are reading it. If it must autoplay, it must also stop.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          setInterval(next, 3000) · no pause · no hover stop
        </span>
      ),
    },
    {
      title: 'Do not put important content past frame one',
      why: 'The evidence is consistent: later frames are seen by a small fraction of visitors. If it matters, it does not belong in a carousel.',
      render: (
        <Row gap="sm" align="center">
          <span className="grid h-12 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-accent)] text-[10px] text-white">
            seen
          </span>
          <span className="grid h-12 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] text-[10px] text-[var(--ds-fg-disabled)]">
            rarely
          </span>
          <span className="grid h-12 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] text-[10px] text-[var(--ds-fg-disabled)]">
            never
          </span>
        </Row>
      ),
    },
    {
      title: 'Do not use dots past about six frames',
      why: 'Nobody counts fourteen dots, and each one is a 24px target for a one-in-fourteen chance of being useful. Use the counter alone.',
      render: (
        <Row gap="sm">
          {Array.from({ length: 14 }, (_, i) => (
            <span
              key={i}
              className={cn(
                'block h-2 w-2 rounded-full',
                i === 3 ? 'bg-[var(--ds-danger)]' : 'bg-[var(--ds-border-strong)]',
              )}
            />
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not rotate a marketing hero',
      why: 'A rotating hero consistently underperforms a single strong message. Each slide dilutes the one before it and none of them get read.',
      render: (
        <span className="grid h-16 w-full max-w-xs place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-caption text-white">
          Three competing headlines, rotating
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
      { id: '2.5.7', name: 'Dragging Movements', level: 'AA' },
      { id: '4.1.3', name: 'Status Messages', level: 'AA' },
    ],
    contrast: [
      'Arrows sit over arbitrary content, so they need their own surface — an elevated button, not a bare glyph over a photograph.',
      'The active dot must differ from the inactive ones by more than opacity; at 8px a subtle difference is invisible.',
      'Any text over a media frame needs a scrim or a solid panel behind it. Contrast against an unknown image is not something you can assert.',
      'The counter is content and owes 4.5:1.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the previous and next buttons, the dots, and any interactive content inside the current frame.' },
      { keys: '← / →', does: 'Moves between frames when focus is on the dot group. Also scrolls the track natively when it has focus.' },
      { keys: 'Home / End', does: 'Jumps to the first or last frame.' },
      { keys: 'Space', does: 'Toggles autoplay when focus is on the play/pause control.' },
    ],
    aria: [
      { attr: 'aria-roledescription="carousel"', on: 'The container', note: 'With aria-label naming its purpose. It tells assistive tech this is a rotating region before anything moves.' },
      { attr: 'aria-roledescription="slide"', on: 'Each frame', note: 'With aria-label "2 of 4". Position is the single most useful thing a frame can announce.' },
      { attr: 'aria-live="polite"', on: 'The counter', note: 'Off while autoplay is running — an auto-advancing live region is a screen reader talking over the user.' },
      { attr: 'role="tablist" / "tab"', on: 'The dots', note: 'With aria-selected. Each dot needs a real label; a bare dot announces as an unnamed button.' },
      { attr: 'aria-hidden', on: 'Off-screen frames', note: 'Only when they are genuinely not visible. With peek, the next frame is partly visible and must not be hidden.' },
    ],
    focus:
      'Moving to a frame must not steal focus from whatever the user was doing. Interactive content inside an off-screen frame must be removed from the tab order — otherwise Tab scrolls the track sideways to something the user cannot see, which is deeply disorienting.',
    screenReader: [
      'Announce position on change: "Slide 2 of 4". Nothing else about the movement is useful.',
      'Turn the live region off while autoplay is running. A region that announces every five seconds is a screen reader talking over its user.',
      'Off-screen frames must be inert. A user tabbing into an invisible frame has no way to understand where they are.',
    ],
    touch:
      'Swipe is the primary interaction here and scroll-snap gives it to you correctly. Arrows must still exist for WCAG 2.5.7 — swipe cannot be the only path. Keep the peek: it is even more important on a phone, where the dots are small and easily missed. Never trap vertical scrolling inside a horizontal carousel; scroll-snap on one axis leaves the other alone.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Carousel, CarouselSlide } from '@/ui/Surface'

<Carousel aria-label="Product highlights" peek>
  {slides.map((s) => (
    <CarouselSlide key={s.id}>{s.content}</CarouselSlide>
  ))}
</Carousel>

// Scroll-snap does the work. The buttons are a thin layer over a scroll
// container, not a bespoke transform engine.
function go(index: number) {
  const track = trackRef.current!
  track.scrollTo({
    left: index * track.clientWidth * PEEK_RATIO,
    behavior: 'smooth',
  })
}

// Read the position back FROM the scroll, so a swipe and a button press end
// up in the same state.
function onScroll() {
  const track = trackRef.current!
  setIndex(Math.round(track.scrollLeft / (track.clientWidth * PEEK_RATIO)))
}

// Autoplay: stops on hover, stops on focus, and stays stopped once the user
// takes over. Anything less fails WCAG 2.2.2.
React.useEffect(() => {
  if (!playing || userInteracted) return
  const id = setInterval(next, 5000)
  return () => clearInterval(id)
}, [playing, userInteracted])

// Off-screen frames must leave the tab order, or Tab scrolls sideways to
// something the user cannot see.
<div inert={!isVisible}>{slide.content}</div>`,
    },
    html: {
      lang: 'html',
      code: `<section aria-roledescription="carousel" aria-label="Product highlights">
  <div class="ds-carousel__track">
    <div role="group" aria-roledescription="slide" aria-label="1 of 4">…</div>
    <!-- With peek the next frame is partly visible, so it must NOT be hidden. -->
    <div role="group" aria-roledescription="slide" aria-label="2 of 4">…</div>
    <div role="group" aria-roledescription="slide" aria-label="3 of 4" inert>…</div>
  </div>

  <!-- Always visible: hover does not exist on touch. -->
  <button type="button" aria-label="Previous slide" disabled>‹</button>
  <button type="button" aria-label="Next slide">›</button>

  <div role="tablist" aria-label="Choose a slide">
    <button type="button" role="tab" aria-selected="true"  aria-label="Slide 1 of 4"></button>
    <button type="button" role="tab" aria-selected="false" aria-label="Slide 2 of 4"></button>
  </div>

  <!-- Turn this off while autoplay is running. -->
  <p role="status" aria-live="polite">Slide 1 of 4</p>
</section>`,
    },
    css: {
      lang: 'css',
      code: `.ds-carousel__track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  /* The browser supplies momentum, touch physics and reduced-motion
     handling. A transform-based carousel reimplements all of it. */
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.ds-carousel__track::-webkit-scrollbar { display: none; }

.ds-carousel__slide {
  flex: 0 0 auto;
  /* The peek IS the affordance. 100% and nothing says there is more. */
  inline-size: 80%;
  scroll-snap-align: start;
}

/* Over arbitrary content, so they need their own surface — not a bare
   glyph over a photograph. */
.ds-carousel__arrow {
  position: absolute;
  inset-block-start: 50%;
  translate: 0 -50%;
  inline-size: 32px;
  block-size: 32px;
  background: var(--ds-surface-raised);
  box-shadow: var(--shadow-e2);
}

/* The dot is 8px; the TARGET is 24px. Padding, not size. */
.ds-carousel__dot {
  inline-size: 24px;
  block-size: 24px;
  display: grid;
  place-items: center;
}
.ds-carousel__dot::before {
  content: '';
  inline-size: 8px;
  block-size: 8px;
  border-radius: 999px;
  background: var(--ds-border-strong);
}
.ds-carousel__dot[aria-selected='true']::before { background: var(--ds-accent); }

@media (prefers-reduced-motion: reduce) {
  .ds-carousel__track { scroll-behavior: auto; }
}

@media (pointer: coarse) {
  .ds-carousel__arrow { inline-size: 44px; block-size: 44px; }
}`,
    },
    api: [
      {
        name: 'Carousel',
        props: [
          { name: 'aria-label', type: 'string', required: true, description: 'Names the set. A carousel with no label is an unexplained rotating region.' },
          { name: 'peek', type: 'boolean', default: 'true', description: 'Shows a sliver of the next frame. Turning it off removes the only affordance most users notice.' },
          { name: 'autoplay', type: 'boolean', default: 'false', description: 'Requires a visible pause control. Stops on hover and focus, and permanently once the user interacts.' },
          { name: 'interval', type: 'number', default: '5000', description: 'Milliseconds. Below 5000 the content cannot be read before it moves.' },
          { name: 'dots', type: 'boolean', default: 'true', description: 'Hide past about six frames — nobody counts fourteen dots.' },
          { name: 'loop', type: 'boolean', default: 'false', description: 'Off by default. A looping track removes the only signal that the user has seen everything.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Before building one, check whether a horizontally scrollable row of cards would do. It usually would, with no dots, no arrows and no state to manage.',
      'Do not loop by default. Reaching the end is the only signal a user gets that they have seen everything, and looping removes it.',
      'Read the index back from the scroll position rather than tracking it separately, so a swipe and a button press cannot disagree.',
      'Lazy-load frames beyond the next one, but never lazy-load the first — it is the one almost everyone sees.',
      'If the frames are links or cards, make the whole frame the target rather than a small button inside it.',
    ],
    performance: [
      'Scroll-snap runs on the compositor. A JavaScript transform carousel runs on the main thread and stutters exactly when the page is busiest.',
      'Debounce the scroll handler that derives the index. It fires far more often than the frame actually changes.',
      'Use content-visibility: auto on off-screen frames so their layout is skipped until they scroll in.',
      'Clear the autoplay timer on unmount and on every user interaction. An orphaned interval scrolling a removed element is a memorable bug.',
    ],
    mistakes: [
      'Autoplay with no pause control, failing WCAG 2.2.2.',
      'Hover-revealed arrows, which do not exist on touch.',
      'No peek, so nothing indicates there is more than one frame.',
      'Off-screen frames left in the tab order, so Tab scrolls sideways to invisible content.',
      'Dots as the only position indicator past six frames.',
      'A transform-based implementation that loses momentum, touch physics and reduced-motion handling.',
      'Important content on slide three, which almost nobody sees.',
      'Arrows removed at the ends, shifting the layout at the boundary.',
    ],
    realWorld: [
      'Carousels on marketing pages have been measured repeatedly and the finding does not change: the first frame gets the clicks and the rest get almost none. Put your best message there and stop.',
      'Where they genuinely work is media browsing on a phone — a product gallery, a photo set — because swiping is natural and the order does not carry meaning.',
      'Content rows in streaming interfaces are carousels that stopped pretending: no dots, no autoplay, just a scroll row with peek. That is usually the right design.',
      'If a stakeholder wants a rotating hero, ask which message is strongest and ship that one. The carousel is nearly always a way of avoiding that decision.',
    ],
  },
})
