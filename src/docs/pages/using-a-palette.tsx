import { Badge } from '@/ui/Display'
import { PaletteStrip } from '../framework/PaletteSheet'
import { auditPalette, byLightness, contrast, readableOn } from '../framework/palette'
import { FLAT_UI_PALETTES, palette } from '../data/flat-ui-colors'
import { PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   The argument that the fourteen palette pages deliberately do not repeat.
   ------------------------------------------------------------------------ */

const US = palette('us')
const DEFO = palette('defo')

/** Every palette in the section, ranked by how much of it survives a white page. */
function PaletteLeague() {
  const rows = FLAT_UI_PALETTES.map((p) => ({ p, a: auditPalette(p.colors) })).sort(
    (a, b) => b.a.onWhite - a.a.onWhite,
  )

  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]">
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]">
            <th scope="col" className="px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Palette
            </th>
            <th scope="col" className="w-[34%] px-3 py-2 text-left text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Colours
            </th>
            <th scope="col" className="px-3 py-2 text-right text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Text on white
            </th>
            <th scope="col" className="px-3 py-2 text-right text-label-sm font-medium text-[var(--ds-fg-muted)]">
              Text on black
            </th>
            <th scope="col" className="px-3 py-2 text-right text-label-sm font-medium text-[var(--ds-fg-muted)]">
              3:1 on white
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ p, a }) => (
            <tr key={p.id} className="border-b border-[var(--ds-border-subtle)] last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-[var(--ds-fg-secondary)]">{p.title}</td>
              <td className="px-3 py-2">
                <PaletteStrip colors={p.colors} height={18} />
              </td>
              <td className="px-3 py-2 text-right font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-secondary)]">
                {a.onWhite}
              </td>
              <td className="px-3 py-2 text-right font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-secondary)]">
                {a.onBlack}
              </td>
              <td className="px-3 py-2 text-right font-mono text-[11.5px] tabular-nums text-[var(--ds-fg-muted)]">
                {a.largeOnWhite}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * One hue lifted out of a flat palette and rebuilt as a ramp. The flat value is
 * kept in place at the step it actually lands on, so the point survives: the
 * borrowed colour is a member of the ramp, not a replacement for one.
 */
const RAMP_FROM = US.colors.find((c) => c.slug === 'electron-blue')!
const RAMP = [
  { step: 50, hex: '#eaf4fd' },
  { step: 100, hex: '#cbe6fa' },
  { step: 200, hex: '#9ed0f6' },
  { step: 300, hex: '#66b4f0' },
  { step: 400, hex: '#3097e9' },
  { step: 500, hex: RAMP_FROM.hex },
  { step: 600, hex: '#0a6cba' },
  { step: 700, hex: '#0b5591' },
  { step: 800, hex: '#0d4271' },
  { step: 900, hex: '#0d2f50' },
]

function RampBuild() {
  return (
    <Stack gap="md" className="w-full">
      <div className="flex flex-col gap-1.5">
        <span className="text-overline uppercase text-[var(--ds-fg-muted)]">
          What you were given — one value
        </span>
        <span
          className="flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] text-caption"
          style={{ background: RAMP_FROM.hex, color: readableOn(RAMP_FROM.hex) }}
        >
          {RAMP_FROM.name} {RAMP_FROM.hex}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-overline uppercase text-[var(--ds-fg-muted)]">
          What you need — ten, evenly spaced, with the original still in it
        </span>
        <span className="flex overflow-hidden rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)]">
          {RAMP.map((s) => (
            <span
              key={s.step}
              className="flex h-12 flex-1 items-end justify-center pb-1 font-mono text-[9px] tabular-nums"
              style={{ background: s.hex, color: readableOn(s.hex) }}
              title={`${s.step} · ${s.hex}`}
            >
              {s.step}
            </span>
          ))}
        </span>
      </div>
    </Stack>
  )
}

/** The same status message, once with real status tokens and once with the
 *  prettiest red in a flat palette. */
function StatusMisuse() {
  const flatRed = US.colors.find((c) => c.slug === 'pink-glamour')!
  const ratio = contrast(flatRed.hex, '#ffffff')

  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-success-border)] bg-[var(--ds-success-subtle)]/40 p-4">
        <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">
          Our danger family
        </span>
        <div className="rounded-[var(--radius-md)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)] px-3 py-2">
          <p className="text-body-sm text-[var(--ds-danger-text)]">Payment declined</p>
        </div>
        <span className="text-caption text-[var(--ds-fg-muted)]">
          Certified pair. Passes in both themes, and the tint composites over any surface.
        </span>
      </div>
      <div className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] bg-[var(--ds-danger-subtle)]/40 p-4">
        <span className="text-overline uppercase text-[var(--ds-fg-secondary)]">
          {flatRed.name} borrowed as “danger”
        </span>
        <div className="rounded-[var(--radius-md)] px-3 py-2" style={{ background: flatRed.hex }}>
          <p className="text-body-sm text-white">Payment declined</p>
        </div>
        <span className="text-caption text-[var(--ds-fg-muted)]">
          White on {flatRed.hex} is {ratio.toFixed(2)}:1. It is a lovely colour and it fails.
        </span>
      </div>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'using-a-palette',
    title: 'Using a Palette',
    tagline:
      'How to take a palette somebody else drew and turn it into something you can ship — and the four jobs it is allowed to do on the way.',
    keywords: [
      'palette',
      'flat ui colors',
      'borrowed colour',
      'ramp',
      'categorical',
      'brand colour',
      'swatches',
    ],
  },

  overview: {
    purpose:
      'A palette is twenty opinions about hue with none of the information a design system needs. This page is the conversion: what to keep, what to measure, what to throw away, and where the result belongs in the token tiers.',
    whenToUse: [
      'Prototyping, where you need categorical colour immediately and the argument about brand can wait.',
      'Charts, tags, avatars and calendars — anywhere colour distinguishes without meaning anything.',
      'As a starting hue for a ramp you are going to build properly.',
    ],
    whenNotToUse: [
      { text: 'As status colours.', instead: 'the certified --ds-{role} families' },
      { text: 'As a brand colour, straight out of the box.', instead: 'a ramp rebuilt from that hue' },
      { text: 'As a replacement for the neutral ramp.', instead: 'the --p-neutral steps' },
    ],
    reasoning: (
      <p>
        Every palette in this section was drawn as a picture. It was judged as twenty rectangles
        side by side on a white page, at one size, with no text on it, in one theme. An interface
        palette is judged against four surfaces, at six sizes, with text on it, in two themes, by
        people who cannot all see the difference between its red and its green. Both are legitimate
        artefacts. They are not the same artefact, and the conversion between them is work.
      </p>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Fourteen palettes, measured" center={false} minHeight={0} allowResize={false}>
        <Stack gap="sm" className="w-full">
          <p className="text-body-sm text-[var(--ds-fg-secondary)]">
            Every palette in this section, ranked by how many of its twenty colours can carry body
            text on a white page. Read the first two columns together: every row adds up to exactly
            twenty, with nothing counted twice, because a colour that clears 4.5:1 on white cannot
            also clear it on black. Choosing the surface is what splits a palette in two, and not
            one of these fourteen was drawn expecting you to choose.
          </p>
          <PaletteLeague />
        </Stack>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'ramp',
        title: 'Lifting one hue into a ramp',
        description:
          'The single most useful thing you can do with a borrowed palette. Take the hue, build ten perceptually even steps, and keep the original value in place at the step it actually lands on — now it is themeable, auditable, and it still looks like the palette you liked.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <RampBuild />
          </PreviewStage>
        ),
      },
      {
        id: 'status',
        title: 'Why a flat red is not a danger colour',
        description:
          'The most common misuse, and the one that reaches production most often, because a red that looks like an error at a glance is very hard to argue with in review.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <StatusMisuse />
          </PreviewStage>
        ),
      },
      {
        id: 'age',
        title: 'A palette carries a date',
        description:
          'The 2013 original beside a 2019 contribution. Neither is better; they are from different years, and a palette will put a date on your product whether or not you intended one.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="sm" className="w-full">
              {[DEFO, US].map((p) => (
                <div key={p.id} className="flex flex-col gap-1">
                  <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{p.title}</span>
                  <PaletteStrip colors={p.colors} height={36} />
                </div>
              ))}
            </Stack>
          </PreviewStage>
        ),
      },
    ],
  },

  do: [
    {
      title: 'Put every borrowed value behind a namespaced custom property',
      why: 'A hex in a component is invisible to theming, to the contrast audit and to search. A namespace — --flat-us-* rather than --ds-* — also stops a borrowed value from ever being mistaken for a certified one.',
      render: (
        <code className="block rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] px-3 py-2 font-mono text-[11px] text-[var(--ds-fg-secondary)]">
          --flat-us-mint-leaf: #00b894;
        </code>
      ),
    },
    {
      title: 'Measure before you use, not after review',
      why: 'Every palette page in this section carries the audit table. It takes ten seconds to find out that the colour you liked is a fill, and it takes a release to find out the same thing from a user.',
      render: (
        <Row gap="sm">
          <Badge tone="success" size="sm">Text 4.5:1</Badge>
          <Badge tone="warning" size="sm">Large 3:1</Badge>
          <Badge tone="danger" size="sm">Fill only</Badge>
        </Row>
      ),
    },
    {
      title: 'Keep the names',
      why: 'Wet Asphalt and Jigglypuff are terrible token names and perfect citations. Renaming them to blue-700 and pink-300 severs the link to where they came from, and the next person cannot check your work.',
    },
    {
      title: 'Use the ends, ignore the middle',
      why: 'Almost every palette here is drawn around its mid-tones, which is exactly the region that cannot hold text on either surface. The darkest and lightest members are where the usable contrast is.',
      render: (
        <PaletteStrip colors={byLightness(DEFO.colors).filter((_, i) => i < 3 || i > 16)} height={40} />
      ),
    },
  ],

  dont: [
    {
      title: 'Do not adopt twenty colours because you liked one',
      why: 'A palette arrives as a set and gets used as a set. If you needed one teal, take the teal — importing the other nineteen guarantees that some of them end up on a screen, chosen for availability rather than for meaning.',
    },
    {
      title: 'Do not map a palette onto semantic roles',
      why: 'Success, warning, danger and info are contracts about contrast and redundancy, not slots waiting for a green, an amber, a red and a blue. Filling them from a decorative set breaks the contract while looking like it kept it.',
    },
    {
      title: 'Do not let it become a second neutral ramp',
      why: 'Most palettes here ship two or three greys. They will not match the neutral ramp, they will not be evenly spaced, and once both are in the codebase every border in the product is a coin flip.',
    },
    {
      title: 'Do not use one for data and status at once',
      why: 'The moment a chart series is coloured with the same red that means "failed", every red mark on the screen reads as an alarm. Categorical colour and status colour must come from different sets.',
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'The three grades that matter: 4.5:1 for body text, 3:1 for large text and for any graphic or boundary that carries meaning, and nothing at all for pure decoration.',
      'White and black are the bounds, not the targets. Your real surfaces sit between them, so a colour that scrapes 4.5:1 on white will fail on a card that is not quite white.',
      'A palette that passes on a dark surface and fails on a light one is not "mostly fine" — it is a palette you can only ship with one theme.',
      'None of these palettes were designed against a contrast requirement. That is not a criticism of them; it is the reason the audit exists.',
    ],
    keyboard: [
      { keys: '⌘I', does: 'Inspector Mode reports the composited contrast of anything you hover.' },
    ],
    aria: [
      {
        attr: 'Text alternative',
        on: 'Anything encoded by colour',
        note: 'A chart series, a category tag, a calendar block. Colour distinguishes; it never identifies.',
      },
      {
        attr: 'prefers-contrast: more',
        on: 'Media query',
        note: 'Users who ask for more contrast are asking you to drop the decorative palette, not to darken it slightly.',
      },
    ],
    focus:
      'A borrowed palette must never supply the focus ring. The ring has one job — clearing 3:1 against every surface in the system — and it is the one colour that cannot be chosen for how it looks.',
    screenReader: [
      'Nothing on a palette page is announced by its appearance. Every swatch has an accessible name carrying both the colour name and its value.',
      'If your only distinction between two things is which palette colour they use, they are the same thing to a screen reader.',
    ],
    touch:
      'Colour choice does not change hit area, but low-contrast controls are measurably slower to acquire — a target you can barely see is a target you aim at carefully.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption: 'The whole conversion, in the order it should happen.',
      code: `// 1. Bring it in namespaced. Never --ds-*, which means "certified".
//    --flat-us-electron-blue: #0984e3;

// 2. Categorical use is immediate and safe — no colour here means anything.
const SERIES = ['electron-blue', 'mint-leaf', 'pico-8-pink', 'sour-lemon']
  .map((slug) => \`var(--flat-us-\${slug})\`)

// 3. Semantic use is never immediate. Lift the hue, build the ramp,
//    then bind the semantic token to a step of YOUR ramp.
//    --p-brand-500: #0984e3;      <- the borrowed value, now a step
//    --ds-accent:   var(--p-brand-500);

// 4. Text on any borrowed fill is measured, not chosen.
import { readableOn } from '@/docs/framework/palette'
<span style={{ background: hex, color: readableOn(hex) }} />`,
    },
    css: {
      lang: 'css',
      caption: 'Three tiers, and where a borrowed colour is allowed to enter.',
      code: `/* Tier 0 — borrowed. Namespaced by source. Read by nothing but tier 1. */
:root {
  --flat-us-electron-blue: #0984e3;
}

/* Tier 1 — primitive. Our ramp, built from that hue, evenly spaced. */
:root {
  --p-brand-400: #3097e9;
  --p-brand-500: var(--flat-us-electron-blue);
  --p-brand-600: #0a6cba;
}

/* Tier 2 — semantic. The only tier a component is allowed to read. */
:root {
  --ds-accent:      var(--p-brand-500);
  --ds-accent-text: var(--p-brand-300);  /* measured against -subtle */
}

/* What must never happen. */
.button { background: #0984e3; }        /* untraceable  */
:root { --ds-danger: #ff7675; }         /* uncertified  */`,
    },
  },

  notes: {
    tips: [
      'Judge a palette by its extremes and its greys, not by its most attractive swatch. The attractive swatch is almost always a mid-tone, and mid-tones are the least useful part of any palette.',
      'If two palettes look interchangeable as strips, they are interchangeable in your product. Pick on the audit numbers instead.',
      'A palette is a fast way to lose an argument about colour and get on with the layout. That is a legitimate reason to use one.',
      'Sorting by hue tells you which colours can sit next to each other; sorting by lightness tells you which ones can be read. Both orders are on every palette page.',
    ],
    performance: [
      'Twenty custom properties cost nothing. Twenty custom properties defined inside a component that mounts a hundred times cost something — define them once at :root.',
      'Do not ship all fourteen palettes to the browser. Each page in this section imports only its own, and your product should import only the one it uses.',
    ],
    mistakes: [
      'Treating the palette as complete. Twenty values with no neutrals, no ramp and no dark-theme counterpart is a third of a colour system.',
      'Using palette order as importance order. The designer arranged those twenty for the picture, not for you.',
      'Assuming a name describes the colour. “Light Red” in one palette is darker than “Pastel Red” in another; the names are memorable, not measured.',
      'Copying a palette into Figma and into CSS separately. They drift within a sprint.',
    ],
    realWorld: [
      'Flat UI Colors 2 is the most-used palette collection on the web, which means these colours carry recognition. Using them says "I picked a palette" as clearly as a stock photo says "I picked a stock photo".',
      'When a stakeholder sends you a palette link, what they usually mean is "the current colours feel wrong". Take that as the brief; the link is a symptom.',
      'Keep the borrowed tier in your codebase even after you have built ramps from it. It documents where your brand hue came from, and that question gets asked about once a year, forever.',
    ],
  },
})
