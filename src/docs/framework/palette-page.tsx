import { ExternalLink } from 'lucide-react'
import { PreviewStage } from './PreviewStage'
import { ContrastAudit, PaletteSheet, PaletteStrip } from './PaletteSheet'
import {
  AlertExamples,
  ChartColors,
  ComponentExamples,
  ElevationScale,
  SemanticRows,
  TokenRows,
} from './PaletteSystem'
import { derivePaletteSystem, systemCss } from './palette-system'
import { auditPalette, byLightness, contrast, readableOn } from './palette'
import { defineDoc } from './types'
import type { DocSpec } from './types'
import { FLAT_UI_SOURCE, type Palette } from '@/docs/data/flat-ui-colors'

/* ===========================================================================
   ONE PALETTE, ONE PAGE
   Fourteen palettes share one page shape, because the questions you ask of a
   borrowed palette are always the same four: what is in it, what can hold
   text, what does it look like doing a job, and how do I get it into the
   codebase. What differs between them is the answer, and every answer here is
   computed from the hex values rather than written down — a transcription
   error in the data cannot survive contact with the audit table.

   The argument for *why* you treat a borrowed palette this way lives once, on
   the Using a Palette page. It is not repeated fourteen times.
   ======================================================================== */

const num = (n: number) => n.toFixed(2)

export function definePalettePage(p: Palette): DocSpec {
  const audit = auditPalette(p.colors)
  const darkest = byLightness(p.colors)[0]
  const lightest = byLightness(p.colors)[p.colors.length - 1]
  const sys = derivePaletteSystem(p)
  const taken = [...sys.surfaces, ...sys.text].filter((t) => t.taken).length +
    sys.semantic.filter((r) => r.base.taken).length +
    sys.semantic.filter((r) => r.hover.taken).length
  const totalTokens =
    sys.surfaces.length + sys.text.length + sys.semantic.length * 3 + sys.chart.length

  /* -- generated code ----------------------------------------------------- */

  const vars = p.colors.map((c) => `  --flat-${p.id}-${c.slug}: ${c.hex};`).join('\n')

  const css = `/* ---- The twenty, verbatim. Namespaced, so a borrowed value can never
        be mistaken for one of ours. ---------------------------------------- */
/* ${p.title} — ${p.author}, Flat UI Colors 2 */
:root {
${vars}
}

/* ---- The system derived from them. This is the half a palette does not
        ship, and the half a product cannot be built without. -------------- */
${systemCss(sys)}`

  const usage = `// A borrowed palette is categorical data, not a set of semantics.
// Bind it to series, not to states.
const ${p.id.toUpperCase()}_SERIES = [
${byLightness(p.colors)
  .slice(-6)
  .map((c) => `  'var(--flat-${p.id}-${c.slug})', // ${c.name}`)
  .join('\n')}
]

<Chart series={data} colors={${p.id.toUpperCase()}_SERIES} />

// Text on any of them uses the measured pair, never a guess.
// ${p.colors[0].name} takes ${readableOn(p.colors[0].hex)} at ${num(
   Math.max(contrast(p.colors[0].hex, '#ffffff'), contrast(p.colors[0].hex, '#000000')),
 )}:1.
<span style={{
  background: 'var(--flat-${p.id}-${p.colors[0].slug})',
  color: '${readableOn(p.colors[0].hex)}',
}}>
  ${p.colors[0].name}
</span>`

  return defineDoc({
    meta: {
      id: `flat-ui-${p.id}`,
      title: p.title,
      tagline: p.character,
      keywords: [
        'palette',
        'flat ui colors',
        'swatches',
        'hex',
        p.author.toLowerCase(),
        ...p.colors.slice(0, 6).map((c) => c.name.toLowerCase()),
      ],
    },

    preview: {
      render: (
        <PreviewStage label={`${p.colors.length} colours`} center={false} minHeight={0} allowResize={false}>
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-caption text-[var(--ds-fg-muted)]">
              <span>
                Drawn by <span className="text-[var(--ds-fg-secondary)]">{p.author}</span> for Flat UI
                Colors 2.
              </span>
              <a
                href={p.source ?? FLAT_UI_SOURCE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[var(--ds-accent-text)] underline decoration-[var(--ds-accent-border)] underline-offset-2 hover:decoration-current"
              >
                Original
                <ExternalLink size={11} aria-hidden />
              </a>
            </div>
            <PaletteStrip colors={p.colors} height={28} />
            <PaletteSheet colors={p.colors} />
          </div>
        </PreviewStage>
      ),
      examples: [
        {
          id: 'text',
          title: '01 · Text colours',
          description: `A palette ships hues, not a text ramp. These five are solved against the page background rather than mixed by percentage — "secondary" means 8:1 on every one of the fourteen palettes, so the pages stay comparable and none of them ships a ramp that fails. Disabled sits below the floor deliberately; it is the one role WCAG exempts.`,
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <TokenRows sys={sys} tokens={sys.text} />
            </PreviewStage>
          ),
        },
        {
          id: 'surfaces',
          title: '02 · Surfaces and backgrounds',
          description: `Anchored on ${darkest.name}, the darkest colour in the set. The rest of the ladder is computed, because no palette ships two darks that happen to sit 16% apart — and depth read from surface lightness is the only kind that survives greyscale, high-contrast mode and a phone in sunlight.`,
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <TokenRows sys={sys} tokens={sys.surfaces} />
            </PreviewStage>
          ),
        },
        {
          id: 'semantic',
          title: '03 · Semantic colours',
          description:
            'Primary is the palette’s opening colour — designers lead with their signature. The status roles are the nearest hue this palette carries to each target, which is the honest version of a choice usually made by eye. Hover prefers a darker sibling the designer actually drew; active is always computed. Where a role sits far from its ideal hue, the row says so.',
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <SemanticRows sys={sys} />
            </PreviewStage>
          ),
        },
        {
          id: 'components',
          title: '04 · Component examples',
          description:
            'The moment the palette stops being a picture. Filled, outlined and text buttons across five roles, four field states, and the selection controls — a colour that read as confident in a swatch grid often cannot hold a five-character label, and there is no way to discover that except by putting the label on it.',
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <ComponentExamples sys={sys} />
            </PreviewStage>
          ),
        },
        {
          id: 'chart',
          title: '05 · Chart colours',
          description:
            'Eight hues spread around the circle, each required to clear 3:1 against the page — under WCAG 1.4.11 a chart mark is a meaningful graphic, so a series nobody can see is not a style choice. This set is kept separate from the semantic roles on purpose: a series that happens to be red must not read as a failure.',
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <ChartColors sys={sys} />
            </PreviewStage>
          ),
        },
        {
          id: 'alerts',
          title: '06 · Alerts and notifications',
          description:
            'The four status roles doing the job they exist for, each with an icon and a word alongside the fill. Run these through a greyscale filter — if you can still tell the error from the success, colour was reinforcing the message rather than carrying it.',
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <AlertExamples sys={sys} />
            </PreviewStage>
          ),
        },
        {
          id: 'elevation',
          title: '07 · Elevation',
          description:
            'The one part of the system that is not derived from the palette and never should be. Shadows are black at rising alpha on every palette on earth; on a page this dark they barely register, which is why the surface ladder in section 02 is what actually carries depth.',
          render: (
            <PreviewStage center={false} minHeight={0} allowResize={false}>
              <ElevationScale sys={sys} />
            </PreviewStage>
          ),
        },
      ],
    },

    do: [
      {
        title: 'Take the hues, rebuild the ramp',
        why: `Twenty flat values is a mood board, not a system. Lift the hues you want, generate a perceptually even ramp from each, and put those in the semantic tier — that is what makes the palette themeable, auditable and extensible.`,
        render: <PaletteStrip colors={byLightness(p.colors).slice(-8)} height={44} />,
      },
      {
        title: 'Use it where colour carries no valence',
        why: 'Charts, tags, avatars, calendar categories. These are the jobs a decorative palette is genuinely good at, because nothing here has to mean "this failed" to someone who cannot see it.',
      },
      {
        title: `Reach for ${darkest.name} and ${lightest.name} before the middle`,
        why: `The ends do the structural work. ${darkest.name} ${darkest.hex} is the darkest value here — ${num(
          contrast(darkest.hex, '#ffffff'),
        )}:1 on white — and ${lightest.name} ${lightest.hex} the lightest, at ${num(
          contrast(lightest.hex, '#000000'),
        )}:1 on black. A palette's usable contrast lives at its extremes, and the extremes are the two swatches people skip.`,
        render: (
          <span className="flex gap-2">
            {[darkest, lightest].map((c) => (
              <span
                key={c.slug}
                className="flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] text-[11px]"
                style={{ background: c.hex, color: readableOn(c.hex) }}
              >
                {c.name}
              </span>
            ))}
          </span>
        ),
      },
    ],

    dont: [
      {
        title: 'Do not map these onto success, warning and danger',
        why: 'A status colour has to clear 4.5:1 against the surface it sits on, in both themes, next to an icon and a word. These were drawn to look good in a grid. The two requirements overlap by accident, never by design.',
      },
      {
        title: 'Do not paste the hex into a component',
        why: 'A literal hex cannot be themed, cannot be audited, and cannot be found later. Every one of these values belongs behind a custom property, exactly like the values in our own token tiers.',
      },
      {
        title: 'Do not call a colour accessible without naming the surface',
        why: `${audit.onWhite} of these ${audit.total} can set body text on a white page and ${audit.onBlack} can on a black one${
          audit.both ? `, and ${audit.both} manage both` : ' — and none manage both'
        }. The two sets are nearly disjoint by arithmetic, not by taste. Pick the surface first and the palette divides itself.`,
      },
    ],

    a11y: {
      criteria: [
        { id: '1.4.1', name: 'Use of Color', level: 'A' },
        { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
        { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      ],
      contrast: [
        `${audit.onWhite} of ${audit.total} colours clear 4.5:1 against white and can carry body text on a light page. ${audit.onBlack} clear it against black. ${
          audit.both === 0 ? 'None do both.' : `${audit.both} do both.`
        }`,
        'Those two sets are nearly disjoint for a reason, not by accident: a colour’s contrast with white multiplied by its contrast with black is always exactly 21. Clearing 4.5:1 on one surface leaves at most 4.67:1 on the other.',
        `${audit.largeOnWhite} of ${audit.total} reach 3:1 on white, which is the bar for large text, icons, borders and chart marks — a much larger set, and the one most of this palette is genuinely for.`,
        'White and black are the bounds, not our surfaces. Against a real canvas the numbers move, and alpha moves them again — composite first or the ratio is fiction.',
      ],
      keyboard: [
        { keys: 'Tab', does: 'Moves through the swatches; each one is a button that copies its value.' },
        { keys: '⌘I', does: 'Inspector Mode reports the live contrast of anything on this page.' },
      ],
      aria: [
        {
          attr: 'aria-label',
          on: 'Each swatch',
          note: 'Names the colour and its value, because the swatch itself announces as nothing — a background colour is invisible to a screen reader.',
        },
        {
          attr: 'forced-colors: active',
          on: 'Media query',
          note: 'Windows High Contrast Mode discards this palette wholesale. Anything that was only distinguishable by fill becomes identical.',
        },
      ],
      focus:
        'Swatches take the standard focus ring, offset outwards. An inset ring would have to sit on the colour being demonstrated and would fail contrast on roughly half of these values.',
      screenReader: [
        'A colour has no accessible meaning. If a chart series is identified only by its fill, the series does not exist for a screen reader — label it directly or provide the table.',
        'Colour names like “Jigglypuff” or “Wet Asphalt” are identifiers, not descriptions. Never use one as the only label for a state.',
      ],
      touch:
        'Swatches are 88px tall and at least 152px wide, comfortably past the 44px minimum, so the copy affordance is reachable on a phone without a precise tap.',
    },

    code: {
      usage: { lang: 'tsx', code: usage, caption: 'What this palette is for, and what it is not for.' },
      css: {
        lang: 'css',
        code: css,
        caption: `The twenty plus the ${totalTokens} they were expanded into. ${taken} of those are literal palette colours; the rest are computed, and each carries the arithmetic that produced it.`,
      },
    },

    notes: {
      tips: [
        p.character,
        `Darkest value: ${darkest.name} ${darkest.hex}. Lightest: ${lightest.name} ${lightest.hex}. Between them sits every ramp you could build from this set.`,
        'Sort the sheet by Hue to find neighbours you can safely put side by side, and by Lightness to find the ones that can carry text. Source order is the designer’s order and tells you about their intent, not about contrast.',
        'If you only need one colour from this palette, take it and leave the rest. Adopting twenty because you liked one is how a product ends up with two palettes.',
      ],
      mistakes: [
        'Using the palette at full saturation across a whole screen. These were drawn as accents against neutral ground; twenty of them at once is a swatch page, not an interface.',
        'Assuming the names mean something. They are memorable, not systematic — “Light Red” is darker than “Pastel Red” in the palette next door.',
        'Copying the hexes into a design file and the CSS separately. They will drift, and the design file will win the argument for about six months.',
      ],
      realWorld: [
        `Credit stays attached: this set was drawn by ${p.author}${
          p.dribbble ? ` (@${p.dribbble} on Dribbble)` : ''
        } and published in Flat UI Colors 2 by Ahmet Sülek.`,
        'Palettes like this one age visibly. A 2013 flat palette reads as 2013 — which is useful when that is the intent and a liability when it is not.',
        'The fastest legitimate use is prototyping: grab a palette, get the categorical colours out of the way, and spend the argument you saved on hierarchy instead.',
      ],
    },

    appendix: [
      {
        id: 'reference',
        title: 'Contrast reference',
        description:
          'The measurement behind every derivation above. White and black bound what a colour can do, and reading a row in both directions gives you both answers at once — 4.86:1 on white is equally “this as text on a white page” and “white as a label on this fill”. The last column is what people mean when they ask whether a colour is accessible, and it is almost never both.',
        render: <ContrastAudit colors={p.colors} />,
      },
    ],
  })
}
