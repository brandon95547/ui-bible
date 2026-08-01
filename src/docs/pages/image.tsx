import * as React from 'react'
import { ImageOff, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/ui/Feedback'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/** A stand-in that behaves like a real image without a network request:
    same aspect-ratio box, same object-fit, same failure path. */
function Img({
  ratio = '16 / 9',
  fit = 'cover',
  state = 'loaded',
  rounded = true,
  caption,
  className,
}: {
  ratio?: string
  fit?: 'cover' | 'contain'
  state?: 'loaded' | 'loading' | 'error'
  rounded?: boolean
  caption?: string
  className?: string
}) {
  const box = (
    <div
      // The ratio is reserved before anything loads: that is what stops the
      // page reflowing when the bytes arrive.
      style={{ aspectRatio: ratio }}
      className={cn(
        'relative w-full overflow-hidden bg-[var(--ds-surface-inset)]',
        rounded && 'rounded-[var(--radius-lg)]',
        className,
      )}
    >
      {state === 'loading' && <Skeleton className="h-full w-full" rounded="lg" />}
      {state === 'error' && (
        <span className="absolute inset-0 grid place-items-center gap-1 text-[var(--ds-fg-muted)]">
          <ImageOff size={18} aria-hidden />
          <span className="text-caption">Image unavailable</span>
        </span>
      )}
      {state === 'loaded' && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 grid place-items-center bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#ec4899]',
            fit === 'contain' && 'inset-4 rounded-[var(--radius-md)]',
          )}
        >
          <span className="font-mono text-caption text-white/80">{ratio}</span>
        </span>
      )}
    </div>
  )

  if (!caption) return box
  return (
    <figure className="w-full">
      {box}
      {/* The caption is content, not alt text — it is read by everyone. */}
      <figcaption className="mt-2 text-caption leading-relaxed text-[var(--ds-fg-muted)]">
        {caption}
      </figcaption>
    </figure>
  )
}

function Playground() {
  const [ratio, setRatio] = React.useState<'16 / 9' | '4 / 3' | '1 / 1' | '3 / 4'>('16 / 9')
  const [fit, setFit] = React.useState<'cover' | 'contain'>('cover')
  const [state, setState] = React.useState<'loaded' | 'loading' | 'error'>('loaded')
  const [caption, setCaption] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={300}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Ratio">
            <KnobSelect
              value={ratio}
              onChange={setRatio}
              options={['16 / 9', '4 / 3', '1 / 1', '3 / 4'] as const}
            />
          </Knob>
          <Knob label="Fit">
            <KnobSelect value={fit} onChange={setFit} options={['cover', 'contain'] as const} />
          </Knob>
          <Knob label="State">
            <KnobSelect
              value={state}
              onChange={setState}
              options={['loaded', 'loading', 'error'] as const}
            />
          </Knob>
          <KnobToggle checked={caption} onChange={setCaption} label="Caption" />
        </div>
      }
      code={`<Image
  src="/architecture.png"
  alt="Request flow from the load balancer to three regions"
  ratio="${ratio}"
  fit="${fit}"
  loading="lazy"
  width={1600}
  height={900}
/>`}
    >
      <div className="w-full max-w-md">
        <Img
          ratio={ratio}
          fit={fit}
          state={state}
          caption={caption ? 'Request flow from the load balancer to three regions.' : undefined}
        />
      </div>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'image',
    title: 'Image',
    tagline:
      'Aspect-ratio boxes, srcset, lazy loading, placeholders, and alt text that earns the space it takes up.',
    keywords: ['picture', 'figure', 'thumbnail', 'srcset', 'object-fit', 'lazy', 'cls', 'alt'],
  },

  overview: {
    purpose:
      'An image renders a picture at a known size without shifting anything around it. Almost all of the component is defensive: reserve the space before the bytes arrive, pick the right file for the screen, decide what happens when it fails, and describe it for people who cannot see it. The picture itself is the easy part.',
    whenToUse: [
      'Photography, screenshots, diagrams and illustrations that are part of the content.',
      'Thumbnails in lists, cards and galleries.',
      'Any raster asset whose loading could otherwise shift the layout.',
    ],
    whenNotToUse: [
      {
        text: 'It represents a person or an entity.',
        instead: 'an Avatar, which has the initials fallback built in',
        to: '#/avatar',
      },
      {
        text: 'It is a small symbol at UI scale.',
        instead: 'an Icon — an SVG scales and recolours; a raster does neither',
        to: '#/icons',
      },
      {
        text: 'It is purely decorative background texture.',
        instead: 'a CSS background, which never enters the accessibility tree',
        to: '#/colors',
      },
      {
        text: 'It is a chart rendered as a picture.',
        instead: 'a Chart, so the data stays selectable, scalable and accessible',
        to: '#/chart',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>Reserve the space before the image loads.</strong> Either set{' '}
          <code>width</code> and <code>height</code> so the browser can compute the ratio, or set{' '}
          <code>aspect-ratio</code> on the box. Without one of them the page reflows when the bytes
          arrive, which is the single largest source of layout shift on most sites and the reason
          people tap the wrong thing.
        </p>
        <p>
          Alt text describes <strong>what the image conveys</strong>, not what it depicts. A
          screenshot of an error dialog is "the deployment failed with a health-check timeout", not
          "screenshot of a dialog box". And a decorative image takes <code>alt=""</code> — an empty
          alt is a deliberate statement, while a missing one makes screen readers read the filename.
        </p>
        <p>
          <code>object-fit</code> is not optional. Without it, any image whose intrinsic ratio
          differs from its box is squashed. <strong>Cover for photography</strong>, where the crop
          is acceptable; <strong>contain for diagrams and logos</strong>, where losing an edge
          destroys the meaning.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'cls',
        title: 'Reserve the space first',
        description:
          'The left column keeps its shape from the first frame. The right one snaps into place when the image lands, pushing everything below it down.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="16rem">
              <Cell label="Ratio reserved" tone="good">
                <Stack gap="sm">
                  <Img ratio="16 / 9" state="loading" />
                  <span className="text-caption text-[var(--ds-fg-muted)]">
                    Space held before the bytes arrive
                  </span>
                </Stack>
              </Cell>
              <Cell label="No ratio" tone="bad">
                <Stack gap="sm">
                  <div className="h-6 w-full rounded-[var(--radius-lg)] bg-[var(--ds-surface-inset)]" />
                  <span className="text-caption text-[var(--ds-danger-text)]">
                    Everything below jumps when it loads
                  </span>
                </Stack>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'fit',
        title: 'Cover or contain',
        description:
          'Cover crops to fill and is right for photography. Contain fits the whole image and is the only correct choice for a diagram or a logo, where a cropped edge changes the meaning.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="14rem">
              <Cell label="cover" sub="Photography" tone="good">
                <Img ratio="1 / 1" fit="cover" />
              </Cell>
              <Cell label="contain" sub="Diagrams, logos" tone="good">
                <Img ratio="1 / 1" fit="contain" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'states',
        title: 'Loading and failure',
        description:
          'A skeleton at the correct ratio while loading, and a labelled placeholder on failure. The browser’s broken-image icon is never an acceptable outcome.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="13rem">
              <Cell label="Loading" tone="good">
                <Img ratio="4 / 3" state="loading" />
              </Cell>
              <Cell label="Loaded" tone="good">
                <Img ratio="4 / 3" />
              </Cell>
              <Cell label="Failed" tone="good">
                <Img ratio="4 / 3" state="error" />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'figure',
        title: 'Figure and caption',
        description:
          'A caption is content everyone reads; alt text is for people who cannot see the image. They are different jobs and should say different things.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <div className="w-full max-w-sm">
              <Img
                ratio="16 / 9"
                caption="Request flow from the load balancer to three regions. Failed health checks route to the previous build."
              />
            </div>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: '16:9', render: <div className="w-28"><Img ratio="16 / 9" /></div> },
      { label: '4:3', render: <div className="w-28"><Img ratio="4 / 3" /></div> },
      { label: 'Square', render: <div className="w-20"><Img ratio="1 / 1" /></div> },
      { label: 'Portrait', render: <div className="w-16"><Img ratio="3 / 4" /></div> },
      { label: 'Contain', render: <div className="w-24"><Img ratio="1 / 1" fit="contain" /></div> },
      { label: 'Loading', render: <div className="w-28"><Img ratio="16 / 9" state="loading" /></div> },
      { label: 'Failed', render: <div className="w-28"><Img ratio="16 / 9" state="error" /></div> },
      { label: 'Square corners', render: <div className="w-28"><Img ratio="16 / 9" rounded={false} /></div> },
      {
        label: 'Zoomable',
        render: (
          <span className="relative block w-28">
            <Img ratio="16 / 9" />
            <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-[var(--radius-sm)] bg-black/50 text-white">
              <Maximize2 size={12} />
            </span>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md">
        <Img
          ratio="16 / 9"
          caption="Request flow from the load balancer to three regions."
        />
      </div>
    ),
    caption:
      'A ratio-locked box holding the image, with a caption beneath it as a sibling rather than an overlay.',
    parts: [
      {
        n: 1,
        label: 'Ratio box',
        value: 'aspect-ratio on the wrapper',
        kind: 'size',
        note: 'Held before anything loads. This one property removes most of the layout shift a page suffers.',
      },
      {
        n: 2,
        label: 'Object fit',
        value: 'cover or contain',
        kind: 'shape',
        note: 'Never absent. Without it, any image whose intrinsic ratio differs from its box is squashed rather than cropped.',
      },
      {
        n: 3,
        label: 'Background',
        value: '--ds-surface-inset',
        kind: 'color',
        note: 'Visible while loading, behind a transparent PNG, and around a contained image. A transparent box shows the page through the gaps.',
      },
      {
        n: 4,
        label: 'Radius',
        value: '12px, clipped',
        kind: 'shape',
        note: 'On the wrapper with overflow hidden, so the image is clipped rather than relying on the image having its own rounded corners.',
      },
      {
        n: 5,
        label: 'Loading state',
        value: 'Skeleton at the same ratio',
        kind: 'motion',
        note: 'Occupying the exact final dimensions, so the transition to the loaded image moves nothing.',
      },
      {
        n: 6,
        label: 'Failure state',
        value: 'Icon + one line',
        kind: 'color',
        note: 'Explicit, at the same size. The browser’s broken-image icon looks like the product is broken rather than the asset.',
      },
      {
        n: 7,
        label: 'Caption',
        value: '12px, 8px below',
        kind: 'type',
        note: 'A figcaption sibling. Overlaying it on the image makes contrast dependent on the picture, which changes every time the asset does.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface-inset', usedFor: 'The box behind the image' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Optional edge, needed on images that reach the background colour' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Caption and the failure message' },
    { category: 'color', token: '--ds-layer-active', usedFor: 'Skeleton fill while loading' },
    { category: 'spacing', token: '--space-2', value: '8px', usedFor: 'Gap from image to caption' },
    { category: 'radius', token: '--radius-lg', value: '12px', usedFor: 'Standalone images and cards' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Thumbnails in lists' },
    { category: 'typography', token: '--text-caption', value: '12px', usedFor: 'Caption' },
    { category: 'motion', token: '--duration-normal', value: '180ms', usedFor: 'Fade from placeholder to loaded' },
  ],

  sizes: [
    { name: 'Thumbnail', height: '40–64px', radius: '8px', use: 'In a list row or a table cell. Square, so a mixed set of source ratios stays aligned.' },
    { name: 'Card media', height: '16:9 or 4:3', radius: '12px top corners', use: 'Full-bleed to the card edge, with the radius only on the corners it touches.' },
    { name: 'Inline content', maxWidth: '40rem', radius: '12px', use: 'Matched to the prose measure so it does not break the reading column.' },
    { name: 'Full-bleed', minWidth: '100%', radius: '0', use: 'A hero or a section break, edge to edge with no radius.' },
    { name: 'Ratios', height: '16:9, 4:3, 1:1, 3:4', use: 'A small set, used consistently. Arbitrary ratios make a grid impossible to align.' },
  ],

  do: [
    {
      title: 'Always reserve the aspect ratio',
      why: 'It is the single largest source of layout shift on most pages, and layout shift is why people tap the wrong thing.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;img width={'{'}1600{'}'} height={'{'}900{'}'} /&gt;
          <br />
          or: aspect-ratio: 16 / 9
        </code>
      ),
    },
    {
      title: 'Write alt text about meaning, not appearance',
      why: 'A screenshot of an error is "the deployment failed with a health-check timeout", not "screenshot of a dialog box". The second describes pixels; the first conveys the point.',
      render: (
        <Stack gap="xs" className="text-caption">
          <span className="text-[var(--ds-success-text)]">
            alt="Deployment failed with a health-check timeout"
          </span>
          <span className="text-[var(--ds-danger-text)]">alt="screenshot"</span>
        </Stack>
      ),
    },
    {
      title: 'Set object-fit explicitly',
      why: 'Cover for photography, contain for diagrams. Without either, any image whose ratio differs from its box is squashed.',
      render: (
        <Row gap="sm">
          <div className="w-20"><Img ratio="1 / 1" fit="cover" /></div>
          <div className="w-20"><Img ratio="1 / 1" fit="contain" /></div>
        </Row>
      ),
    },
    {
      title: 'Handle failure explicitly',
      why: 'The browser’s broken-image icon looks like the product is broken. A labelled placeholder at the same size says the asset is missing and nothing else went wrong.',
      render: <div className="w-28"><Img ratio="16 / 9" state="error" /></div>,
    },
  ],

  dont: [
    {
      title: 'Do not omit alt entirely',
      why: 'A missing alt makes some screen readers read the filename. An empty alt="" is a deliberate statement that the image is decorative — the two are not the same.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-danger-text)]">
          &lt;img src="hero-final-v3-2.png" /&gt;
          <br />
          → “hero dash final dash v three dash two dot png”
        </code>
      ),
    },
    {
      title: 'Do not lazy-load above the fold',
      why: 'The hero image is usually the largest contentful paint. Deferring it makes the page measurably slower at the only moment the user is watching.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          &lt;img loading="lazy" /&gt; on the hero
        </span>
      ),
    },
    {
      title: 'Do not put text on an image without a scrim',
      why: 'Contrast against a photograph cannot be asserted, and the asset will be swapped for a brighter one eventually.',
      render: (
        <span className="relative grid h-16 w-32 place-items-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-danger-border)]">
          <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#fde68a] to-white" />
          <span className="relative text-label font-medium text-white">Unreadable</span>
        </span>
      ),
    },
    {
      title: 'Do not ship one file for every screen',
      why: 'A 2400px hero sent to a 375px phone is several megabytes of bandwidth thrown away, on the connection least able to afford it.',
      render: (
        <span className="text-caption text-[var(--ds-danger-text)]">
          hero@2400.jpg → 375px viewport → 2.8 MB
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.5', name: 'Images of Text', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
    ],
    contrast: [
      'Text over an image needs a scrim. Contrast against a photograph is not assertable and changes with every asset swap.',
      'An image that carries meaning through colour alone — a red status diagram — needs that meaning in the alt text too.',
      'A white product photo on a white surface needs a border, or the boundaries of the image are invisible.',
      'Avoid images of text entirely. They cannot be resized, translated or read out, which is exactly what 1.4.5 is about.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Nothing — an image is not interactive unless it is inside a link or a button.' },
      { keys: 'Enter', does: 'Opens a zoomable image in a lightbox, when the wrapper is a real button.' },
      { keys: 'Esc', does: 'Closes the lightbox and returns focus to the thumbnail.' },
    ],
    aria: [
      { attr: 'alt', on: 'Every image', note: 'Required. Describes what the image conveys, not what it depicts.' },
      { attr: 'alt=""', on: 'Decorative images', note: 'A deliberate empty string. It removes the image from the accessibility tree; a missing alt does not.' },
      { attr: '<figure> / <figcaption>', on: 'Captioned images', note: 'The caption is content everyone reads. It does not replace alt text, and it should not repeat it.' },
      { attr: 'role="img"', on: 'A CSS or SVG image', note: 'With aria-label, when the picture is content rather than background.' },
      { attr: 'aria-describedby', on: 'A complex diagram', note: 'Pointing at a longer description in the page. Alt text is one sentence; an architecture diagram needs more.' },
    ],
    focus:
      'An image is never focusable on its own. When it opens a lightbox, the wrapper is a real button carrying the accessible name and the focus ring — never a click handler on the img element.',
    screenReader: [
      'Do not begin alt text with "image of" or "picture of". The role is already announced.',
      'A decorative image with alt="" is skipped entirely, which is the correct outcome. A missing alt attribute is announced, often as the filename.',
      'For a complex diagram, provide a full description in the page and point at it with aria-describedby. Everyone benefits from that description, not only screen-reader users.',
    ],
    touch:
      'Serve responsive sources — a 2400px hero on a 375px screen is several megabytes wasted on the connection least able to afford it. Pinch-to-zoom must never be disabled; images of dense content are exactly why people zoom. A zoomable image needs a 44px trigger, and the lightbox needs an obvious close control rather than relying on a swipe.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Image } from '@/ui/Display'

<Image
  src="/architecture.png"
  alt="Request flow from the load balancer to three regions"
  width={1600}                    // reserves the ratio before loading
  height={900}
  ratio="16 / 9"
  fit="contain"                   // a diagram: never crop it
  loading="lazy"                  // but NEVER on the hero
/>

// Responsive sources. One file for every screen wastes megabytes on the
// connections least able to afford them.
<picture>
  <source type="image/avif" srcSet="/hero.avif 1x, /hero@2x.avif 2x" />
  <source type="image/webp" srcSet="/hero.webp 1x, /hero@2x.webp 2x" />
  <img
    src="/hero.jpg"
    alt="Deployment dashboard showing three healthy regions"
    width={1600}
    height={900}
    sizes="(max-width: 640px) 100vw, 640px"
    fetchPriority="high"          // it is the largest contentful paint
  />
</picture>

// Failure is a state, not an accident. The browser's broken-image icon
// looks like the product is broken.
const [failed, setFailed] = React.useState(false)

{failed ? (
  <div className="ds-image__error">
    <ImageOff aria-hidden /> Image unavailable
  </div>
) : (
  <img src={src} alt={alt} onError={() => setFailed(true)} />
)}

// A complex diagram needs more than one sentence — and everyone benefits.
<img src="/arch.png" alt="System architecture" aria-describedby="arch-desc" />
<p id="arch-desc">Requests enter through the load balancer, which…</p>`,
    },
    html: {
      lang: 'html',
      code: `<!-- Dimensions let the browser compute the ratio before the bytes arrive. -->
<img
  src="/architecture.png"
  alt="Request flow from the load balancer to three regions"
  width="1600"
  height="900"
  loading="lazy"
  decoding="async"
/>

<!-- Decorative: alt="" removes it from the accessibility tree. A MISSING
     alt does not — some screen readers read the filename instead. -->
<img src="/texture.svg" alt="" />

<!-- Caption is content everyone reads; alt is for people who cannot see it.
     They should not say the same thing. -->
<figure>
  <img src="/flow.png" alt="Three regions receiving traffic in parallel" />
  <figcaption>
    Request flow from the load balancer to three regions. Failed health
    checks route to the previous build.
  </figcaption>
</figure>

<!-- The hero is the largest contentful paint: eager, and prioritised. -->
<img src="/hero.jpg" alt="…" fetchpriority="high" loading="eager" />`,
    },
    css: {
      lang: 'css',
      code: `.ds-image {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  /* Visible while loading, behind a transparent PNG, and around a contained
     image. A transparent box shows the page through the gaps. */
  background: var(--ds-surface-inset);
  /* The single most valuable line here: the space is held before the bytes
     arrive, so nothing below reflows. */
  aspect-ratio: var(--ratio, 16 / 9);
}

.ds-image img {
  inline-size: 100%;
  block-size: 100%;
  /* Never absent: without it, an image whose intrinsic ratio differs from
     its box is squashed rather than cropped. */
  object-fit: var(--fit, cover);
  object-position: center;
  display: block;
}

/* Diagrams and logos: losing an edge changes the meaning. */
.ds-image--contain img { object-fit: contain; padding: 8px; }

.ds-image img {
  opacity: 0;
  transition: opacity 180ms;
}
.ds-image img[data-loaded='true'] { opacity: 1; }

/* A white product shot on a white surface has invisible boundaries. */
.ds-image--bordered { box-shadow: inset 0 0 0 1px var(--ds-border-subtle); }

/* Text over a photograph: contrast is not assertable without this. */
.ds-image--overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 0.6), transparent 60%);
}

@media (prefers-reduced-motion: reduce) {
  .ds-image img { transition: none; }
}`,
    },
    api: [
      {
        name: 'Image',
        props: [
          { name: 'src', type: 'string', required: true, description: 'The default source. Pair it with srcSet for anything above thumbnail size.' },
          { name: 'alt', type: 'string', required: true, description: 'What the image conveys. Empty string for decoration — never omitted.' },
          { name: 'width / height', type: 'number', description: 'Intrinsic dimensions, so the browser reserves the ratio before loading.' },
          { name: 'ratio', type: 'string', description: 'Overrides the intrinsic ratio when the box is a fixed shape, such as a card thumbnail.' },
          { name: 'fit', type: "'cover' | 'contain'", default: "'cover'", description: 'Cover for photography, contain for diagrams and logos.' },
          { name: 'loading', type: "'lazy' | 'eager'", default: "'lazy'", description: 'Eager above the fold. Lazy-loading the hero delays the largest contentful paint.' },
          { name: 'fallback', type: 'ReactNode', description: 'Rendered on error at the same size. The browser’s broken-image icon is never acceptable.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Standardise on three or four aspect ratios and use them consistently. Arbitrary ratios make a grid impossible to align without cropping every asset by hand.',
      'Use a blurred low-quality placeholder for hero images. It gives the eye something at the right shape and colour while the full file arrives.',
      'Prefer SVG for diagrams, logos and anything with text in it. It scales, it recolours with the theme, and it stays sharp at every density.',
      'Serve AVIF with a WebP and JPEG fallback. The savings are large and the fallback chain is a few lines of markup.',
      'For user-uploaded images, crop and resize on the client before upload. It cuts the bandwidth and removes the entire class of "why is my photo sideways" bugs.',
    ],
    performance: [
      'The hero image is almost always the largest contentful paint. Preload it, set fetchPriority="high", and never lazy-load it.',
      'Lazy-load everything below the fold. The native loading attribute is enough — an IntersectionObserver implementation adds JavaScript for no gain.',
      'Set decoding="async" so image decoding does not block the main thread during scroll.',
      'Size sources to the layout, not to the original file. A 2400px asset displayed at 640px is 90% wasted bytes on every visit.',
      'Cap srcset density at 2x. The visual difference above that is negligible and the file size is not.',
    ],
    mistakes: [
      'No width, height or aspect-ratio, causing layout shift when the image loads.',
      'A missing alt attribute rather than an explicit alt="" for decoration.',
      'Alt text describing appearance instead of meaning.',
      'No object-fit, squashing every image whose ratio differs from its box.',
      'Lazy-loading the hero, delaying the largest contentful paint.',
      'One file for every screen, wasting megabytes on mobile.',
      'Text over an unscrimmed photograph.',
      'No error state, so a failed asset shows the browser’s broken-image icon.',
    ],
    realWorld: [
      'Layout shift from unsized images is the most common Core Web Vitals failure, and one attribute fixes it. It is the highest-value line in this whole page.',
      'Alt text is usually written last and badly. Writing it while placing the image produces better text and takes less time.',
      'User-uploaded images arrive in every ratio and orientation imaginable. A fixed ratio box with object-fit: cover is what keeps a grid looking deliberate.',
      'Modern formats are a large, uncontroversial win. AVIF with a WebP fallback typically halves the bytes with no visible difference.',
    ],
  },
})
