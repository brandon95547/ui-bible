import * as React from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const TILES = [
  { id: '1', alt: 'Deployment dashboard showing three healthy regions', tone: 'from-[#6366f1] to-[#8b5cf6]', ratio: '4 / 3' },
  { id: '2', alt: 'Request latency chart across eu-west-2', tone: 'from-[#0ea5e9] to-[#06b6d4]', ratio: '3 / 4' },
  { id: '3', alt: 'Rollback confirmation dialog', tone: 'from-[#10b981] to-[#059669]', ratio: '1 / 1' },
  { id: '4', alt: 'Build log with a failed health check', tone: 'from-[#f59e0b] to-[#ef4444]', ratio: '16 / 9' },
  { id: '5', alt: 'Region selector with 24 options', tone: 'from-[#ec4899] to-[#8b5cf6]', ratio: '4 / 3' },
  { id: '6', alt: 'Secrets panel with values masked', tone: 'from-[#64748b] to-[#334155]', ratio: '1 / 1' },
]

function Tile({
  tone,
  alt,
  ratio,
  uniform,
  onOpen,
}: {
  tone: string
  alt: string
  ratio: string
  uniform: boolean
  onOpen?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      // The whole tile is the target and it carries the image's description —
      // "View image" repeated six times identifies nothing.
      aria-label={`View: ${alt}`}
      style={{ aspectRatio: uniform ? '1 / 1' : ratio }}
      className={cn(
        'group relative w-full overflow-hidden rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ds-focus-ring)]',
      )}
    >
      <span aria-hidden className={cn('absolute inset-0 bg-gradient-to-br', tone)} />
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100"
      >
        <ZoomIn size={18} className="text-white" />
      </span>
    </button>
  )
}

function Lightbox({
  index,
  onClose,
  onMove,
}: {
  index: number
  onClose: () => void
  onMove: (delta: number) => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  const tile = TILES[index]
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={tile.alt}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowRight') onMove(1)
        if (e.key === 'ArrowLeft') onMove(-1)
      }}
      className="absolute inset-0 z-20 flex flex-col bg-black/85 outline-none backdrop-blur-sm"
    >
      <Row gap="sm" align="center" className="justify-between p-2">
        <span className="px-1 font-mono text-caption tabular-nums text-white/70">
          {index + 1} / {TILES.length}
        </span>
        <IconButton size="sm" label="Close" icon={<X />} onClick={onClose} className="text-white hover:bg-white/15" />
      </Row>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-10 pb-3">
        <span
          aria-hidden
          className={cn('h-full w-full max-w-md rounded-[var(--radius-lg)] bg-gradient-to-br', tile.tone)}
          style={{ aspectRatio: tile.ratio }}
        />
        <IconButton
          size="sm"
          label="Previous image"
          icon={<ChevronLeft />}
          onClick={() => onMove(-1)}
          className="absolute left-2 text-white hover:bg-white/15"
        />
        <IconButton
          size="sm"
          label="Next image"
          icon={<ChevronRight />}
          onClick={() => onMove(1)}
          className="absolute right-2 text-white hover:bg-white/15"
        />
      </div>

      <p className="px-4 pb-3 text-center text-caption text-white/80">{tile.alt}</p>
    </div>
  )
}

function GalleryDemo({
  uniform = true,
  columns = 3,
  withLightbox = true,
}: {
  uniform?: boolean
  columns?: number
  withLightbox?: boolean
}) {
  const [open, setOpen] = React.useState<number | null>(null)

  return (
    <div className="relative w-full">
      <ul
        className={cn('grid gap-2', uniform ? '' : '[column-fill:balance]')}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {TILES.map((t, i) => (
          <li key={t.id}>
            <Tile
              {...t}
              uniform={uniform}
              onOpen={withLightbox ? () => setOpen(i) : undefined}
            />
          </li>
        ))}
      </ul>

      {open !== null && (
        <Lightbox
          index={open}
          onClose={() => setOpen(null)}
          onMove={(d) => setOpen((i) => (i === null ? null : (i + d + TILES.length) % TILES.length))}
        />
      )}
    </div>
  )
}

function Playground() {
  const [uniform, setUniform] = React.useState(true)
  const [columns, setColumns] = React.useState<'2' | '3' | '4'>('3')
  const [lightbox, setLightbox] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Columns">
            <KnobSelect value={columns} onChange={setColumns} options={['2', '3', '4'] as const} />
          </Knob>
          <KnobToggle checked={uniform} onChange={setUniform} label="Uniform ratio" />
          <KnobToggle checked={lightbox} onChange={setLightbox} label="Lightbox" />
        </div>
      }
      code={`<Gallery columns={${columns}} ratio="${uniform ? '1 / 1' : 'auto'}">
  {images.map((img) => (
    <GalleryItem key={img.id} src={img.src} alt={img.alt} />
  ))}
</Gallery>`}
    >
      <div className="w-full max-w-lg">
        <GalleryDemo uniform={uniform} columns={Number(columns)} withLightbox={lightbox} />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'gallery',
    title: 'Gallery',
    tagline:
      'A grid of media with a lightbox. Aspect ratios, gutters, lazy loading and keyboard traversal.',
    keywords: ['image list', 'image grid', 'masonry', 'photo grid', 'lightbox', 'thumbnail', 'zoom'],
  },

  overview: {
    purpose:
      'A gallery shows a set of images together so the user can compare them and pick one to look at properly. Everything visible is a thumbnail — the real content is behind the lightbox, and the grid’s job is to get the user there with as little friction as possible. That makes ratio consistency and target size the two decisions that matter most.',
    whenToUse: [
      'Several images that are peers: screenshots, photographs, design variants, assets.',
      'Anywhere the user needs to compare before choosing one to inspect.',
      'A media picker, where the grid is the selection interface.',
    ],
    whenNotToUse: [
      {
        text: 'Each item needs a title, a description and its own actions.',
        instead: 'a Card grid, where the image is one part of the item',
        to: '#/card',
      },
      {
        text: 'Images are shown one at a time in sequence.',
        instead: 'a Carousel',
        to: '#/carousel',
      },
      {
        text: 'There is only one image.',
        instead: 'an Image — a grid of one is a grid with a bug',
        to: '#/image',
      },
      {
        text: 'The items are files of mixed types.',
        instead: 'a List or a Data Table, where the type and size matter more than a preview',
        to: '#/list',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>One ratio, applied to everything.</strong> A grid of mixed ratios has no
          alignment in either direction, and the eye spends its effort on the ragged edges rather
          than on the pictures. Crop to a single ratio with <code>object-fit: cover</code> and let
          the lightbox show the whole image.
        </p>
        <p>
          Masonry looks good in a design and reads badly in use: the reading order stops matching
          the visual order, so keyboard focus jumps around the grid unpredictably. Use it only
          where the images genuinely are the content and order does not matter — a portfolio, not
          a picker.
        </p>
        <p>
          Every tile needs its <strong>own description</strong>, not "View image" six times. The
          alt text is what a screen-reader user picks from, and it is also what appears when the
          image fails — which in a gallery of six is a visible fraction of the time.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'ratio',
        title: 'One ratio beats every ratio',
        description:
          'The uniform grid aligns in both directions and the eye goes straight to the pictures. The mixed grid has no alignment anywhere, and the ragged edges take the attention.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="Uniform" tone="good">
                <GalleryDemo uniform columns={3} withLightbox={false} />
              </Cell>
              <Cell label="Mixed" tone="bad">
                <GalleryDemo uniform={false} columns={3} withLightbox={false} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'lightbox',
        title: 'The lightbox is where the content lives',
        description:
          'A modal with a focus trap, arrow-key traversal, a position counter and the description in view. Escape closes it and focus returns to the thumbnail.',
        render: (
          <PreviewStage minHeight={340} center={false}>
            <div className="w-full max-w-lg">
              <GalleryDemo columns={3} />
              <p className="mt-2 text-caption text-[var(--ds-fg-muted)]">
                Open one, then try ← → and Escape.
              </p>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'density',
        title: 'Column count and target size',
        description:
          'Below about 80px a thumbnail stops being recognisable and becomes a coloured square. That is the floor, and it is what caps the column count on a phone.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="w-full">
              {([2, 3, 4] as const).map((c) => (
                <Stack key={c} gap="xs">
                  <span className="text-caption text-[var(--ds-fg-muted)]">{c} columns</span>
                  <GalleryDemo columns={c} withLightbox={false} />
                </Stack>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'alt',
        title: 'Every tile describes itself',
        description:
          '"View image" six times identifies nothing. The description is what a screen-reader user picks from, and what appears when the file fails to load.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Described" tone="good">
                <Stack gap="xs" className="text-caption text-[var(--ds-fg-secondary)]">
                  <span>“Deployment dashboard showing three healthy regions”</span>
                  <span>“Rollback confirmation dialog”</span>
                </Stack>
              </Cell>
              <Cell label="Generic" tone="bad">
                <Stack gap="xs" className="text-caption text-[var(--ds-fg-muted)]">
                  <span>“View image”</span>
                  <span>“View image”</span>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Tile',
        render: (
          <span className="block h-16 w-16 rounded-[var(--radius-md)] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" />
        ),
      },
      {
        label: 'Hover',
        render: (
          <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-[var(--radius-md)]">
            <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" />
            <span aria-hidden className="absolute inset-0 bg-black/30" />
            <ZoomIn size={16} className="relative text-white" />
          </span>
        ),
      },
      {
        label: 'Focus',
        render: (
          <span className="block h-16 w-16 rounded-[var(--radius-md)] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] outline-2 outline-offset-2 outline-[var(--ds-focus-ring)]" />
        ),
      },
      {
        label: 'Selected',
        render: (
          <span className="block h-16 w-16 rounded-[var(--radius-md)] bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] ring-2 ring-[var(--ds-accent)] ring-offset-2 ring-offset-[var(--ds-surface)]" />
        ),
      },
      {
        label: 'Loading',
        render: (
          <span className="block h-16 w-16 animate-pulse rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />
        ),
      },
      {
        label: 'Failed',
        render: (
          <span className="grid h-16 w-16 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] text-caption text-[var(--ds-fg-muted)]">
            ✕
          </span>
        ),
      },
      {
        label: 'Counter',
        render: (
          <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-muted)]">3 / 6</span>
        ),
      },
      {
        label: 'Overflow',
        render: (
          <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-[var(--radius-md)]">
            <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#64748b] to-[#334155]" />
            <span aria-hidden className="absolute inset-0 bg-black/50" />
            <span className="relative text-label font-medium text-white">+12</span>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-lg">
        <GalleryDemo columns={3} />
      </div>
    ),
    caption:
      'A uniform grid of pressable tiles, each carrying its own description, opening into a modal with arrow traversal and a position counter.',
    parts: [
      {
        n: 1,
        label: 'Ratio',
        value: 'One, applied to all',
        kind: 'shape',
        note: 'Square or 4:3, with object-fit: cover. Mixed ratios leave the grid with no alignment in either direction.',
      },
      {
        n: 2,
        label: 'Gutter',
        value: '8px',
        kind: 'space',
        note: 'Tight, so the set reads as one field of images. Card-sized gaps make each tile read as a separate object.',
      },
      {
        n: 3,
        label: 'Tile radius',
        value: '8px',
        kind: 'shape',
        note: 'Smaller than a card. A gallery is a grid of content, not a grid of containers.',
      },
      {
        n: 4,
        label: 'Minimum tile',
        value: '80px',
        kind: 'size',
        note: 'Below this a thumbnail stops being recognisable, and the whole point of a grid is recognition before selection.',
      },
      {
        n: 5,
        label: 'Hover affordance',
        value: 'Scrim + zoom glyph',
        kind: 'motion',
        note: 'A scrim rather than a scale transform, because scaling a tile inside a tight grid overlaps its neighbours.',
      },
      {
        n: 6,
        label: 'Lightbox',
        value: 'Modal, contain, 85% scrim',
        kind: 'color',
        note: 'contain, never cover — the whole image is the reason the user opened it.',
      },
      {
        n: 7,
        label: 'Position counter',
        value: '"3 / 6"',
        kind: 'type',
        note: 'The only thing telling the user how far through the set they are, and how much is left.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Tile background before an image loads' },
    { category: 'color', token: '--ds-layer-active', usedFor: 'Loading skeleton' },
    { category: 'color', token: '--ds-accent', usedFor: 'Selection ring in a picker' },
    { category: 'color', token: '--ds-layer-scrim', usedFor: 'Lightbox backdrop' },
    { category: 'color', token: '--ds-focus-ring', usedFor: 'Focus outline on a tile' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Grid gutter' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Tile corners' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'The image inside the lightbox' },
    { category: 'motion', token: '--duration-fast', value: '120ms', usedFor: 'Hover scrim' },
  ],

  sizes: [
    { name: 'Dense', height: '80px tiles', gap: '4px', use: 'An asset picker where recognition is enough and density is the point.' },
    { name: 'Default', height: '120–200px tiles', gap: '8px', use: 'The default. Three or four columns on a desktop.' },
    { name: 'Feature', height: '240px+ tiles', gap: '12px', use: 'A portfolio or a photo set where the images are the content.' },
    { name: 'Mobile', minWidth: '2 columns', gap: '4px', use: 'Two columns at 375px. Three leaves tiles below the recognition floor.' },
    { name: 'Lightbox image', maxWidth: '90vw', height: '80vh max', use: 'contain, so the whole image is visible. Cropping the thing the user opened is the one unforgivable bug here.' },
  ],

  do: [
    {
      title: 'Crop everything to one ratio',
      why: 'A uniform grid aligns in both directions and the eye goes to the pictures. A ragged grid spends the reader’s attention on the edges.',
      render: <div className="w-40"><GalleryDemo columns={3} uniform withLightbox={false} /></div>,
    },
    {
      title: 'Give every tile its own description',
      why: 'It is what a screen-reader user picks from, and what appears when a file fails — which in a set of images happens often enough to matter.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          aria-label="View: Rollback confirmation dialog"
        </code>
      ),
    },
    {
      title: 'Give the lightbox the full modal contract',
      why: 'Focus trap, Escape to close, arrow keys between images, and focus returning to the thumbnail that opened it.',
      render: (
        <Row gap="sm" align="center" className="text-caption text-[var(--ds-fg-secondary)]">
          <span>Esc closes</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>← → traverses</span>
          <span className="text-[var(--ds-fg-disabled)]">·</span>
          <span>focus returns</span>
        </Row>
      ),
    },
    {
      title: 'Show a position counter',
      why: '"3 / 6" is the only thing telling the user how far in they are and how much is left. Without it a lightbox is a corridor with no end.',
      render: (
        <span className="font-mono text-caption tabular-nums text-[var(--ds-fg-secondary)]">3 / 6</span>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not mix aspect ratios in a uniform grid',
      why: 'There is no alignment in either direction, and the ragged edges take the attention the images should be getting.',
      render: <div className="w-40"><GalleryDemo columns={3} uniform={false} withLightbox={false} /></div>,
    },
    {
      title: 'Do not use masonry for a picker',
      why: 'The reading order stops matching the visual order, so keyboard focus jumps around the grid unpredictably.',
      render: (
        <div className="grid w-40 grid-cols-3 gap-1.5">
          {[24, 40, 32, 40, 24, 36].map((h, i) => (
            <span
              key={i}
              className="rounded-[var(--radius-sm)] border border-[var(--ds-danger-border)] bg-[var(--ds-surface-inset)]"
              style={{ height: h }}
            />
          ))}
        </div>
      ),
    },
    {
      title: 'Do not crop inside the lightbox',
      why: 'The whole image is the reason the user opened it. object-fit: cover there crops the thing they came to see.',
      render: (
        <span className="grid h-16 w-24 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <span
            aria-hidden
            className="h-full w-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]"
            style={{ transform: 'scale(1.6)' }}
          />
        </span>
      ),
    },
    {
      title: 'Do not go below 80px tiles',
      why: 'A thumbnail smaller than that is a coloured square. Recognition before selection is the entire purpose of the grid.',
      render: (
        <div className="grid w-32 grid-cols-6 gap-1">
          {TILES.map((t) => (
            <span
              key={t.id}
              className={cn('h-4 w-4 rounded-[3px] bg-gradient-to-br', t.tone)}
            />
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '2.1.1', name: 'Keyboard', level: 'A' },
      { id: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { id: '2.4.3', name: 'Focus Order', level: 'A' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
    ],
    contrast: [
      'The focus ring must be visible against an arbitrary image, which is why it is offset outside the tile rather than drawn on it.',
      'A selection ring needs both an offset and a ring in the surface colour, or it disappears against a light photograph.',
      'Lightbox controls sit over an unpredictable image and need their own surface or a scrim.',
      'The hover scrim must be dark enough for the zoom glyph to reach 3:1 against any image beneath it.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Moves through the tiles in DOM order, which must match the visual order — the reason masonry is a problem.' },
      { keys: 'Enter / Space', does: 'Opens the lightbox and moves focus into it.' },
      { keys: '← / →', does: 'Moves between images inside the lightbox.' },
      { keys: 'Esc', does: 'Closes and returns focus to the thumbnail that opened it.' },
      { keys: 'Home / End', does: 'Jumps to the first or last image in the lightbox.' },
    ],
    aria: [
      { attr: 'alt', on: 'Each thumbnail', note: 'A real description. In a gallery this is the primary content, not an afterthought.' },
      { attr: 'aria-label', on: 'Each tile button', note: '"View: Rollback confirmation dialog". "View image" six times identifies nothing.' },
      { attr: 'role="dialog" aria-modal', on: 'The lightbox', note: 'With aria-label carrying the current image’s description.' },
      { attr: 'aria-live="polite"', on: 'The position counter', note: 'Announces movement between images: "3 of 6".' },
      { attr: '<ul> / <li>', on: 'The grid', note: 'The count is announced from the markup, which tells a screen-reader user how large the set is before they start.' },
    ],
    focus:
      'Opening the lightbox traps focus inside it; closing returns focus to the exact thumbnail that opened it, not to the first tile. Arrow traversal inside the lightbox must not move focus out of the dialog.',
    screenReader: [
      'The grid announces its size: "list, 24 items". That is what tells a user whether to explore it at all.',
      'Each tile announces its own description, so the user can choose rather than opening each one in turn.',
      'Announce the position on every move: "3 of 6". Without it there is no sense of progress through the set.',
    ],
    touch:
      'Two columns at 375px — three puts tiles below the recognition floor. Swipe between images in the lightbox, but keep the arrows: swipe alone fails WCAG 2.5.7 and is undiscoverable. Pinch-to-zoom must work inside the lightbox; that is frequently the reason someone opened it.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Gallery, GalleryItem } from '@/ui/Display'

<Gallery columns={{ base: 2, sm: 3, lg: 4 }} ratio="1 / 1" gap={8}>
  {images.map((img) => (
    <GalleryItem
      key={img.id}
      src={img.thumb}
      alt={img.alt}                 // the primary content, not an afterthought
      full={img.full}
    />
  ))}
</Gallery>

// The lightbox owes the full modal contract: trap, Escape, arrows, and
// focus returning to the exact thumbnail that opened it.
function openAt(index: number) {
  triggerRef.current = tileRefs.current[index]
  setOpen(index)
}
function close() {
  setOpen(null)
  triggerRef.current?.focus()       // not the first tile — the right one
}

// Preload the neighbours so arrow traversal feels instant.
React.useEffect(() => {
  if (open === null) return
  for (const i of [open - 1, open + 1]) {
    const img = images[(i + images.length) % images.length]
    if (img) new Image().src = img.full
  }
}, [open])

// One ratio, applied to everything. Mixed ratios leave the grid with no
// alignment in either direction.
<img src={src} alt={alt} loading="lazy" decoding="async"
     className="h-full w-full object-cover" />`,
    },
    html: {
      lang: 'html',
      code: `<!-- A list, so the count is announced before the user starts exploring. -->
<ul class="ds-gallery" role="list">
  <li>
    <!-- The tile is the button and it carries the description. -->
    <button type="button" aria-label="View: Deployment dashboard showing three healthy regions">
      <img src="/thumbs/1.jpg" alt="" loading="lazy" decoding="async"
           width="400" height="400" />
    </button>
  </li>
</ul>

<div role="dialog" aria-modal="true"
     aria-label="Deployment dashboard showing three healthy regions">
  <p role="status" aria-live="polite">3 of 6</p>

  <!-- contain, never cover: the whole image is why they opened it. -->
  <img src="/full/3.jpg" alt="Deployment dashboard showing three healthy regions" />

  <button type="button" aria-label="Previous image">‹</button>
  <button type="button" aria-label="Next image">›</button>
  <button type="button" aria-label="Close">✕</button>
</div>`,
    },
    css: {
      lang: 'css',
      code: `.ds-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  /* Tight, so the set reads as one field of images rather than a grid of
     separate objects. */
  gap: 8px;
  list-style: none;
  padding: 0;
}

.ds-gallery button {
  position: relative;
  inline-size: 100%;
  /* One ratio for everything: mixed ratios leave no alignment in either
     direction. */
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: var(--ds-surface-inset);
}

.ds-gallery img { inline-size: 100%; block-size: 100%; object-fit: cover; }

/* A scrim, not a scale transform — scaling a tile in a tight grid overlaps
   its neighbours. */
.ds-gallery button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0);
  transition: background 120ms;
}
.ds-gallery button:hover::after { background: rgb(0 0 0 / 0.3); }

/* Offset outside the tile, so it survives an arbitrary image beneath it. */
.ds-gallery button:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

/* contain: cropping the image the user opened is the one unforgivable bug. */
.ds-lightbox img {
  max-inline-size: 90vw;
  max-block-size: 80vh;
  object-fit: contain;
}

@media (max-width: 480px) {
  /* Three columns at 375px puts tiles below the recognition floor. */
  .ds-gallery { grid-template-columns: repeat(2, 1fr); gap: 4px; }
}`,
    },
    api: [
      {
        name: 'Gallery',
        props: [
          { name: 'columns', type: 'number | Record<Breakpoint, number>', default: 'auto-fill', description: 'Two on a phone. Auto-fill with a minimum tile size handles most layouts.' },
          { name: 'ratio', type: 'string', default: "'1 / 1'", description: 'One ratio for every tile. "auto" enables masonry, which breaks focus order.' },
          { name: 'gap', type: 'number', default: '8', description: 'Tight, so the set reads as one field of images.' },
          { name: 'lightbox', type: 'boolean', default: 'true', description: 'Turn it off for a picker, where the tile selects rather than opens.' },
          { name: 'onSelect', type: '(id: string) => void', description: 'Picker mode. Selection is a ring; it is not the same as opening.' },
        ],
      },
      {
        name: 'GalleryItem',
        props: [
          { name: 'src', type: 'string', required: true, description: 'The thumbnail. Serve it at roughly twice the tile size, not the full-resolution file.' },
          { name: 'alt', type: 'string', required: true, description: 'The primary content of a gallery. It is what a non-visual user picks from.' },
          { name: 'full', type: 'string', description: 'The full-resolution source for the lightbox, loaded only when it opens.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Serve thumbnails at roughly twice the tile size, not the full file. A grid of twenty full-resolution photographs is tens of megabytes for pictures shown at 150px.',
      'Preload the neighbouring images when the lightbox opens, so arrow traversal feels instant without preloading the whole set.',
      'Show a "+12" overflow tile rather than a scrolling grid when the gallery is a preview inside a card.',
      'For pickers, make selection a ring and opening a separate affordance. Conflating them means every attempt to inspect an image also selects it.',
      'Keep the lightbox index in the URL. A user who wants to share the third image should be able to.',
    ],
    performance: [
      'Lazy-load everything below the fold with the native attribute and set decoding="async" so decoding does not block scrolling.',
      'Virtualise past a few hundred tiles. A gallery of a thousand images will otherwise take seconds to lay out.',
      'Load the full-resolution image only when the lightbox opens, and show the thumbnail scaled up until it arrives.',
      'Give every tile explicit dimensions. A grid without them reflows continuously as images arrive, which is the worst possible scrolling experience.',
    ],
    mistakes: [
      'Mixed aspect ratios, leaving the grid with no alignment anywhere.',
      'Masonry in a picker, so keyboard focus jumps unpredictably.',
      '"View image" as the label on every tile.',
      'object-fit: cover inside the lightbox, cropping the image the user opened.',
      'Focus returning to the first tile instead of the one that was opened.',
      'Tiles below 80px, where recognition fails.',
      'No position counter, so the lightbox has no sense of progress.',
      'Full-resolution files used as thumbnails.',
    ],
    realWorld: [
      'Users open a lightbox to see detail. If your thumbnails are already large enough to read, the gallery may not need one at all.',
      'Cropping to a uniform ratio is nearly always the right call, even for photography — the alignment gain outweighs the occasional awkward crop, and the lightbox shows the full frame anyway.',
      'On mobile, swipe between lightbox images is expected. Keep the arrow buttons too: swipe alone is undiscoverable and fails 2.5.7.',
      'Asset pickers are galleries with selection instead of a lightbox. Keeping the two behaviours visually distinct prevents a whole class of accidental selections.',
    ],
  },
})
