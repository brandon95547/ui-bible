import * as React from 'react'
import { ArrowRight, Play } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/ui/Display'
import { Button } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

function Jumbotron({
  align = 'left',
  media = 'none',
  eyebrow = true,
  secondary = true,
  compact,
}: {
  align?: 'left' | 'center'
  media?: 'none' | 'gradient' | 'panel'
  eyebrow?: boolean
  secondary?: boolean
  compact?: boolean
}) {
  return (
    <section
      className={cn(
        'relative w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--ds-border-subtle)]',
        media === 'gradient' ? 'bg-[var(--ds-surface)]' : 'bg-[var(--ds-surface)]',
        compact ? 'px-6 py-8' : 'px-8 py-12',
      )}
    >
      {media === 'gradient' && (
        <>
          <span
            aria-hidden
            className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-[var(--ds-accent)] to-transparent opacity-25 blur-3xl"
          />
          {/* A scrim, so the headline's contrast does not depend on where the
              gradient happens to land. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[var(--ds-surface)] via-[var(--ds-surface)]/80 to-transparent"
          />
        </>
      )}

      <div
        className={cn(
          'relative flex gap-8',
          media === 'panel' ? 'flex-col md:flex-row md:items-center' : 'flex-col',
        )}
      >
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-4',
            align === 'center' && media !== 'panel' && 'items-center text-center',
          )}
        >
          {eyebrow && (
            <Badge tone="accent" variant="subtle" dot>
              New in 2026.3
            </Badge>
          )}

          {/* One heading. It is the whole reason the section exists. */}
          <h2
            className={cn(
              'text-balance-ds font-semibold leading-[1.06] tracking-[-0.028em] text-[var(--ds-fg)]',
              compact ? 'max-w-[18ch] text-h2' : 'max-w-[20ch] text-h1',
            )}
          >
            Deploy to twenty-four regions in one command.
          </h2>

          <p
            className={cn(
              'text-body-lg leading-relaxed text-[var(--ds-fg-secondary)]',
              compact ? 'max-w-[52ch]' : 'max-w-[56ch]',
            )}
          >
            No build servers to manage, no YAML to write, and a rollback that finishes in eight
            seconds when it goes wrong.
          </p>

          <Row gap="sm" className={cn('mt-1', align === 'center' && media !== 'panel' && 'justify-center')}>
            <Button size="lg" endIcon={<ArrowRight />}>
              Start deploying
            </Button>
            {secondary && (
              <Button size="lg" variant="text" startIcon={<Play size={16} />}>
                Watch the demo
              </Button>
            )}
          </Row>
        </div>

        {media === 'panel' && (
          <div
            aria-hidden
            className="grid h-40 flex-1 place-items-center rounded-[var(--radius-xl)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]"
          >
            <span className="font-mono text-caption text-[var(--ds-fg-muted)]">
              $ acme deploy --all
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

function Playground() {
  const [align, setAlign] = React.useState<'left' | 'center'>('left')
  const [media, setMedia] = React.useState<'none' | 'gradient' | 'panel'>('gradient')
  const [eyebrow, setEyebrow] = React.useState(true)
  const [secondary, setSecondary] = React.useState(true)

  return (
    <PreviewStage
      label="Playground"
      minHeight={340}
      center={false}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Align">
            <KnobSelect value={align} onChange={setAlign} options={['left', 'center'] as const} />
          </Knob>
          <Knob label="Media">
            <KnobSelect
              value={media}
              onChange={setMedia}
              options={['none', 'gradient', 'panel'] as const}
            />
          </Knob>
          <KnobToggle checked={eyebrow} onChange={setEyebrow} label="Eyebrow" />
          <KnobToggle checked={secondary} onChange={setSecondary} label="Secondary" />
        </div>
      }
      code={`<Jumbotron
  align="${align}"
  eyebrow={${eyebrow}}
  heading="Deploy to twenty-four regions in one command."
  body="No build servers to manage…"
  action={<Button size="lg">Start deploying</Button>}${secondary ? '\n  secondaryAction={<Button variant="text">Watch the demo</Button>}' : ''}
/>`}
    >
      <Jumbotron align={align} media={media} eyebrow={eyebrow} secondary={secondary} />
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'jumbotron',
    title: 'Jumbotron',
    tagline:
      'The full-width opening statement of a page: one heading, one sentence, one action, and nothing else competing.',
    keywords: ['hero', 'splash', 'landing', 'above the fold', 'marketing', 'headline', 'page header'],
  },

  overview: {
    purpose:
      'A jumbotron is the first thing on a page and its job is to answer one question — what is this and why should I care — before the user decides whether to keep reading. Everything about the component is scale: a heading two steps larger than anything else, generous vertical space, and exactly one action carrying the emphasis. The discipline is subtraction, not addition.',
    whenToUse: [
      'The top of a landing or marketing page, where the visitor arrived without context.',
      'A product or feature announcement that needs to be understood in one glance.',
      'An empty application state where a new user has nothing yet and needs a way in.',
      'A documentation section opener that has to set up everything below it.',
    ],
    whenNotToUse: [
      {
        text: 'It is the header of an application screen.',
        instead: 'a page title with breadcrumbs — an app screen does not need to be sold',
        to: '#/breadcrumbs',
      },
      {
        text: 'There is no single clear message.',
        instead: 'work out the message first — a jumbotron cannot rescue an unclear one',
        to: '#/typography',
      },
      {
        text: 'The content is a list of features.',
        instead: 'a Card grid below the hero',
        to: '#/card',
      },
      {
        text: 'You want to rotate several messages.',
        instead: 'pick the strongest one — a rotating hero measurably underperforms a single one',
        to: '#/carousel',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>One action carries the emphasis.</strong> Two filled buttons side by side is two
          primary actions, which means none. The pattern is one filled button and one text button:
          the recommendation and the escape hatch. Adding a third turns a decision into a menu.
        </p>
        <p>
          The heading is capped at about <strong>twenty characters per line</strong> and the body
          at fifty-five. Large type needs a much shorter measure than body copy — a 48px headline
          running the full width of a 1440px window is unreadable at exactly the moment you most
          need it to be read.
        </p>
        <p>
          If there is a background image, the text needs a <strong>scrim</strong>. Contrast against
          an arbitrary photograph is not something you can assert, and the image will eventually be
          swapped for one with a bright patch exactly where the headline sits.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'one-action',
        title: 'One action, not two',
        description:
          'A filled button and a text button read as a recommendation and an alternative. Two filled buttons read as two equally important decisions, which is no decision at all.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="17rem">
              <Cell label="One primary" tone="good">
                <Row gap="sm">
                  <Button endIcon={<ArrowRight />}>Start deploying</Button>
                  <Button variant="text">Watch the demo</Button>
                </Row>
              </Cell>
              <Cell label="Two primaries" tone="bad">
                <Row gap="sm">
                  <Button>Start deploying</Button>
                  <Button>Book a demo</Button>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'measure',
        title: 'Large type needs a short measure',
        description:
          'A 48px headline across a full-width container is unreadable. Twenty characters per line for the heading, fifty-five for the body.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="w-full">
              <Cell label="Capped at 20ch" tone="good">
                <h3 className="max-w-[20ch] text-h2 font-semibold leading-[1.06] tracking-[-0.028em] text-[var(--ds-fg)]">
                  Deploy to twenty-four regions in one command.
                </h3>
              </Cell>
              <Cell label="Full width" tone="bad">
                <h3 className="text-h2 font-semibold leading-[1.06] tracking-[-0.028em] text-[var(--ds-fg)]">
                  Deploy to twenty-four regions in one command with no build servers to manage.
                </h3>
              </Cell>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'empty-state',
        title: 'As an empty state',
        description:
          'The same anatomy at a smaller scale. A new user with no projects needs the same three things: what this is, why it matters, and one way in.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Jumbotron compact align="center" media="none" eyebrow={false} secondary={false} />
          </PreviewStage>
        ),
      },
      {
        id: 'alignment',
        title: 'Left or centred',
        description:
          'Centred suits a short heading and a single action. Left-aligned scans faster and is the only option once there is media beside the text.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="w-full">
              <Jumbotron compact align="center" media="none" />
              <Jumbotron compact align="left" media="panel" eyebrow={false} secondary={false} />
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Eyebrow', render: <Badge tone="accent" variant="subtle" dot>New in 2026.3</Badge> },
      {
        label: 'Heading',
        render: (
          <span className="block max-w-[14ch] text-h3 font-semibold leading-[1.06] tracking-[-0.028em] text-[var(--ds-fg)]">
            Deploy anywhere
          </span>
        ),
      },
      {
        label: 'Body',
        render: (
          <span className="block max-w-[30ch] text-body-sm leading-relaxed text-[var(--ds-fg-secondary)]">
            No build servers to manage and no YAML to write.
          </span>
        ),
      },
      { label: 'Primary', render: <Button endIcon={<ArrowRight />}>Start deploying</Button> },
      { label: 'Secondary', render: <Button variant="text" startIcon={<Play size={15} />}>Watch the demo</Button> },
      {
        label: 'Media panel',
        render: (
          <span className="grid h-14 w-28 place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)] font-mono text-[10px] text-[var(--ds-fg-muted)]">
            $ acme deploy
          </span>
        ),
      },
      {
        label: 'Scrim over media',
        render: (
          <span className="relative grid h-14 w-28 place-items-center overflow-hidden rounded-[var(--radius-lg)]">
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-br from-[#6366f1] to-[#ec4899]"
            />
            <span aria-hidden className="absolute inset-0 bg-black/45" />
            <span className="relative text-caption font-medium text-white">Readable</span>
          </span>
        ),
      },
      {
        label: 'Compact',
        render: (
          <span className="block rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] px-4 py-3 text-caption text-[var(--ds-fg-muted)]">
            Empty-state scale
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: <Jumbotron media="gradient" />,
    caption:
      'Eyebrow, one heading, one sentence, one filled action and one text alternative — in that order, with nothing else competing.',
    parts: [
      {
        n: 1,
        label: 'Vertical padding',
        value: '48px (32px compact)',
        kind: 'space',
        note: 'The space is the emphasis. A hero with card-level padding reads as a card, and the reader treats it as one item among several.',
      },
      {
        n: 2,
        label: 'Eyebrow',
        value: 'Badge or overline',
        kind: 'type',
        note: 'Optional, and it must earn its line. "New in 2026.3" is context; "Introducing" is a word that says nothing.',
      },
      {
        n: 3,
        label: 'Heading',
        value: 'clamp(2rem, 5vw, 3.5rem)',
        kind: 'type',
        note: 'Fluid, so it never wraps awkwardly between breakpoints. Leading tightens to about 1.06 and tracking goes negative — large type needs both.',
      },
      {
        n: 4,
        label: 'Heading measure',
        value: '~20 characters',
        kind: 'size',
        note: 'Much shorter than body copy. A 48px headline across 1440px is unreadable exactly where readability matters most.',
      },
      {
        n: 5,
        label: 'Body',
        value: '17px, ~55 characters',
        kind: 'type',
        note: 'One sentence. It expands the heading rather than repeating it, and it is the first thing to cut when the section feels crowded.',
      },
      {
        n: 6,
        label: 'Actions',
        value: 'One filled, one text',
        kind: 'space',
        note: 'Large size, 12px apart. Two filled buttons is two primaries, which is none.',
      },
      {
        n: 7,
        label: 'Media scrim',
        value: 'Gradient over the image',
        kind: 'color',
        note: 'Contrast against an arbitrary photograph cannot be asserted. The scrim is what makes the headline survive an image swap.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-surface', usedFor: 'Section background' },
    { category: 'color', token: '--ds-fg', usedFor: 'The heading' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'The body sentence' },
    { category: 'color', token: '--ds-accent', usedFor: 'Ambient gradient and the primary action' },
    { category: 'color', token: '--ds-accent-subtle', usedFor: 'Eyebrow badge fill' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'A media panel beside the text' },
    { category: 'spacing', token: '--space-12', value: '48px', usedFor: 'Vertical padding' },
    { category: 'spacing', token: '--space-4', value: '16px', usedFor: 'Gap between heading, body and actions' },
    { category: 'radius', token: '--radius-2xl', value: '20px', usedFor: 'Section corners when it is a contained block' },
    { category: 'typography', token: '--text-h1', value: 'clamp(2rem, 5vw, 3.5rem)', usedFor: 'The heading' },
    { category: 'typography', token: 'tracking', value: '−0.028em', usedFor: 'Large type needs negative tracking' },
  ],

  sizes: [
    { name: 'Compact', height: '32px padding', type: 'h2 heading', use: 'Empty states and section openers inside an application.' },
    { name: 'Default', height: '48px padding', type: 'h1 heading', use: 'The top of a landing page or a feature announcement.' },
    { name: 'Full-bleed', height: '64px+ padding', type: 'h1 heading', use: 'A dedicated landing page where the hero is the whole first screen.' },
    { name: 'Heading measure', maxWidth: '20ch', use: 'Much shorter than body copy. Large type wraps badly at any wider measure.' },
    { name: 'Body measure', maxWidth: '55ch', use: 'One sentence. Two is usually one too many.' },
    { name: 'Actions', height: '44px', gap: '12px', use: 'Large buttons. One filled, one text.' },
  ],

  do: [
    {
      title: 'Say what it is, not that it is new',
      why: '"Deploy to twenty-four regions in one command" tells a visitor what they get. "Introducing our new platform" tells them nothing they can act on.',
      render: (
        <Stack gap="sm">
          <span className="text-h4 text-[var(--ds-success-text)]">
            Deploy to twenty-four regions in one command.
          </span>
          <span className="text-h4 text-[var(--ds-danger-text)]">
            Introducing our revolutionary new platform.
          </span>
        </Stack>
      ),
    },
    {
      title: 'Cap the heading measure',
      why: 'Large type needs a much shorter line than body copy. Twenty characters is where a 48px headline stays comfortably readable.',
      render: (
        <span className="block max-w-[20ch] text-h3 font-semibold leading-[1.06] tracking-[-0.028em] text-[var(--ds-fg)]">
          Deploy to twenty-four regions in one command.
        </span>
      ),
    },
    {
      title: 'Scrim any background image',
      why: 'Contrast against an arbitrary photograph cannot be asserted, and the image will be swapped for a brighter one eventually.',
      render: (
        <span className="relative grid h-16 w-40 place-items-center overflow-hidden rounded-[var(--radius-lg)]">
          <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] to-[#ec4899]" />
          <span aria-hidden className="absolute inset-0 bg-black/45" />
          <span className="relative text-label font-medium text-white">Still readable</span>
        </span>
      ),
    },
    {
      title: 'Use a real heading element',
      why: 'It is the top of the document outline. An h1 styled as a div means a screen-reader user landing on the page has nothing to jump to.',
      render: (
        <code className="font-mono text-[11px] leading-relaxed text-[var(--ds-success-text)]">
          &lt;h1 class="ds-hero__heading"&gt;…&lt;/h1&gt;
        </code>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not put two filled buttons in one',
      why: 'Two primaries is no primary. The user has to decide which decision to make before making it, and most decide neither.',
      render: (
        <Row gap="sm">
          <Button>Start free trial</Button>
          <Button>Book a demo</Button>
          <Button>Contact sales</Button>
        </Row>
      ),
    },
    {
      title: 'Do not write three paragraphs',
      why: 'Anything past one sentence is not being read at this size. Everything else belongs in the section below.',
      render: (
        <p className="max-w-sm text-body-sm leading-relaxed text-[var(--ds-danger-text)]">
          Our platform delivers unparalleled deployment velocity through a distributed edge network
          spanning twenty-four regions. Built by engineers who have operated systems at scale, it
          removes the operational burden of build servers, configuration management and rollback
          orchestration. Teams ship faster, with fewer incidents and lower total cost of ownership.
        </p>
      ),
    },
    {
      title: 'Do not use one as an app screen header',
      why: 'A user already inside the product does not need to be sold. A hero there is 200px of vertical space taken from the thing they came for.',
      render: (
        <span className="block w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] px-4 py-8 text-center text-h4 text-[var(--ds-fg-muted)]">
          Your Deployments
        </span>
      ),
    },
    {
      title: 'Do not let text sit on an unscrimmed image',
      why: 'The contrast is whatever the photograph happens to be, and it will change the first time someone swaps the asset.',
      render: (
        <span className="relative grid h-16 w-40 place-items-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)]">
          <span aria-hidden className="absolute inset-0 bg-gradient-to-br from-[#fde68a] to-[#fff]" />
          <span className="relative text-label font-medium text-white">Unreadable</span>
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.10', name: 'Reflow', level: 'AA' },
      { id: '2.4.6', name: 'Headings and Labels', level: 'AA' },
    ],
    contrast: [
      'Text over any image or gradient needs a scrim. Contrast against an arbitrary photograph is not something you can assert or test once.',
      'The eyebrow badge is content and owes 4.5:1, not the lower bar decoration gets.',
      'Large text may use 3:1 under AA, but a headline is the thing you most want read — hold it to 4.5:1 anyway.',
      'An ambient background gradient must not reduce the heading below its ratio at any viewport width, including the ones where it lands differently.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the primary action first. It is first in the DOM as well as visually.' },
      { keys: 'Tab', does: 'Then the secondary action. Decorative media is never focusable.' },
    ],
    aria: [
      { attr: '<h1>', on: 'The heading', note: 'One per page, and it belongs here. A hero heading styled as a div leaves the page with nothing to jump to.' },
      { attr: 'aria-hidden', on: 'Decorative gradients and background media', note: 'They carry no information and must not be announced.' },
      { attr: 'alt', on: 'A meaningful hero image', note: 'If the image carries information the text does not, it needs alt text. If it is decoration, alt="".' },
      { attr: '<section>', on: 'The container', note: 'With aria-labelledby pointing at the heading, so the region has a name in the landmark list.' },
    ],
    focus:
      'The primary action is the first focusable element on the page after any skip link. Nothing decorative — no gradient, no background video — is ever in the tab order.',
    screenReader: [
      'The heading is the first thing announced after the landmark. It has to work as a standalone sentence, because that is how it will be heard.',
      'The eyebrow is read before the heading. Keep it short, or every visitor hears "Introducing, comma, new in twenty twenty-six point three" before the message.',
      'Background media must be aria-hidden. A decorative video announced as an unlabelled region is pure noise at the top of the page.',
    ],
    touch:
      'Vertical padding halves on a phone — 48px becomes 24px, or the hero consumes the entire first screen and the content below is invisible. Actions stack full-width with the primary on top. Fluid heading sizing with clamp() is what stops a headline wrapping into five lines at 375px.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Jumbotron } from '@/ui/Surface'

<Jumbotron
  eyebrow={<Badge tone="accent" dot>New in 2026.3</Badge>}
  heading="Deploy to twenty-four regions in one command."
  body="No build servers to manage, no YAML to write, and a rollback that finishes in eight seconds."
  action={<Button size="lg" endIcon={<ArrowRight />}>Start deploying</Button>}
  // One filled, one text. Two filled buttons is two primaries, which is none.
  secondaryAction={<Button size="lg" variant="text">Watch the demo</Button>}
/>

// The heading is the top of the document outline — a real h1, not a styled div.
<h1 className="ds-hero__heading">{heading}</h1>

// Over media, the scrim is not optional: contrast against an arbitrary
// photograph cannot be asserted, and the asset will be swapped eventually.
<div className="relative">
  <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
  <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
  <div className="relative">{content}</div>
</div>

// Fluid type stops the headline wrapping into five lines at 375px.
// h1 { font-size: clamp(2rem, 5vw, 3.5rem) }`,
    },
    html: {
      lang: 'html',
      code: `<section class="ds-hero" aria-labelledby="hero-heading">
  <!-- Decorative: carries no information, never announced. -->
  <span class="ds-hero__glow" aria-hidden="true"></span>

  <p class="ds-hero__eyebrow">
    <span class="ds-badge">New in 2026.3</span>
  </p>

  <!-- The top of the document outline. -->
  <h1 id="hero-heading" class="ds-hero__heading">
    Deploy to twenty-four regions in one command.
  </h1>

  <p class="ds-hero__body">
    No build servers to manage, no YAML to write, and a rollback that
    finishes in eight seconds.
  </p>

  <div class="ds-hero__actions">
    <a class="ds-btn ds-btn--filled" href="/start">Start deploying</a>
    <a class="ds-btn ds-btn--text"   href="/demo">Watch the demo</a>
  </div>
</section>`,
    },
    css: {
      lang: 'css',
      code: `.ds-hero {
  position: relative;
  overflow: hidden;
  /* The space IS the emphasis. Card-level padding makes a hero read as a
     card, and the reader treats it as one item among several. */
  padding-block: var(--space-12);
  padding-inline: var(--space-8);
}

.ds-hero__heading {
  /* Fluid, so it never wraps awkwardly between breakpoints. */
  font-size: clamp(2rem, 5vw, 3.5rem);
  /* Large type needs tight leading and negative tracking; body values look
     loose and unfinished at this size. */
  line-height: 1.06;
  letter-spacing: -0.028em;
  /* Much shorter than body copy. 48px across 1440px is unreadable. */
  max-inline-size: 20ch;
  text-wrap: balance;
}

.ds-hero__body {
  font-size: 17px;
  line-height: 1.6;
  max-inline-size: 55ch;
  color: var(--ds-fg-secondary);
}

.ds-hero__actions {
  display: flex;
  gap: 12px;
  margin-block-start: var(--space-2);
}

/* Contrast against an arbitrary photograph is not assertable. */
.ds-hero--media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgb(0 0 0 / 0.7), rgb(0 0 0 / 0.2));
}

@media (max-width: 640px) {
  /* Halved, or the hero eats the whole first screen. */
  .ds-hero { padding-block: var(--space-6); padding-inline: var(--space-4); }
  .ds-hero__actions { flex-direction: column; }
  .ds-hero__actions > * { inline-size: 100%; }
}`,
    },
    api: [
      {
        name: 'Jumbotron',
        props: [
          { name: 'heading', type: 'ReactNode', required: true, description: 'One sentence saying what this is. Rendered as an h1 by default.' },
          { name: 'body', type: 'ReactNode', description: 'One sentence expanding the heading. Two is usually one too many.' },
          { name: 'eyebrow', type: 'ReactNode', description: 'Optional context above the heading. It must earn its line.' },
          { name: 'action', type: 'ReactNode', description: 'The single filled action. It is the reason the section exists.' },
          { name: 'secondaryAction', type: 'ReactNode', description: 'A text button. Never a second filled one.' },
          { name: 'media', type: 'ReactNode', description: 'A panel beside the text, or a background image. Backgrounds are automatically scrimmed.' },
          { name: 'align', type: "'left' | 'center'", default: "'left'", description: 'Centred suits a short heading and one action; left scans faster and is required with side media.' },
          { name: 'as', type: "'h1' | 'h2'", default: "'h1'", description: 'h2 when the hero is not the top of the page — the outline must stay correct.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write the heading before designing anything. If it cannot be said in twenty words, the problem is the message, not the layout.',
      'Cut the body sentence first when the section feels crowded. The heading and the action do almost all of the work.',
      'Use text-wrap: balance on the heading. It costs one line of CSS and prevents the single orphaned word that makes a hero look unfinished.',
      'Test the heading at 375px early. A headline that wraps into five lines on a phone is the most common hero failure, and it is invisible on a desktop.',
      'For an empty state, keep the same anatomy at a smaller scale — the user needs exactly the same three things.',
    ],
    performance: [
      'The hero image is the largest contentful paint on most landing pages. Preload it, size it correctly, and never lazy-load it.',
      'Serve modern formats with a fallback, and give the image an explicit aspect ratio so the heading does not shift when it loads.',
      'Background video is rarely worth its cost: several megabytes, no autoplay on low-power mode, and a decode that competes with the text render. A poster image is usually better.',
      'Fluid type with clamp() removes the layout shift that breakpoint-based font sizes cause at the moment of resize.',
    ],
    mistakes: [
      'Two filled buttons, so neither reads as the recommendation.',
      'A heading measure as wide as the container, making large type hard to read.',
      'Text on an unscrimmed image, with contrast dependent on the asset.',
      'A styled div instead of an h1, leaving the page with no outline entry.',
      'Three paragraphs nobody reads at hero scale.',
      'Full desktop padding on mobile, so the hero fills the entire first screen.',
      'A hero on an application screen, spending 200px on selling something the user already bought.',
      'Body-copy leading and tracking on a 48px headline, which looks loose and unfinished.',
    ],
    realWorld: [
      'The heading is the highest-leverage sentence on a landing page and it is usually written last. Reverse that: it should be the first thing agreed and the last thing changed.',
      'Specific beats aspirational every time. "Deploy in eight seconds" outperforms "Ship with confidence" because one of them is a claim the reader can evaluate.',
      'Above-the-fold anxiety causes most hero bloat. Users scroll — the hero does not need to contain the whole pitch, only enough to earn the scroll.',
      'Rotating heroes and video backgrounds both test worse than a single strong message with a still image, consistently enough that the burden of proof sits with anyone proposing them.',
    ],
  },
})
