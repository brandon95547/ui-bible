import {
  ContrastSection,
  CoreSection,
  DecorativeSection,
  ElementsSection,
  ElevationSection,
  PrimarySpecimen,
  RawSection,
  StateSpecimen,
} from './ThemeSheet'
import { buttonContrast, classifyTheme, contrastRows, describe, themeCss } from './theme-system'
import { defineDoc } from './types'
import type { DocSpec } from './types'
import type { SiteTheme } from '@/docs/data/site-theme'

/* ===========================================================================
   ONE THEME, ONE SHEET

   A palette page is built from twenty swatches and asks what could be made of
   them. This is built from a theme and sets it down in the order someone
   building with it needs to know.

     01  surfaces          the ladder, what sits on which rung, and the states
     02  the core palette  text, borders, status — and nothing else
     03  elements          the standard controls, built from 01 and 02
     04  contrast          text on the surfaces it is actually put on
     05  decorative        shut
     06  raw tokens        shut

   05 and 06 are real and closed, because the moment they are open they are
   the loudest thing on the page.

   These are the page's own sections (DocSpec.sheet), not examples under a
   "Live preview". A palette is not a component: it has no controls and no
   states, and nothing on it is live.

   Nothing below is specific to one theme. Hand it a SiteTheme and it draws
   that one; a role the data does not have is a section that is not there.
   ======================================================================== */

const list = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`

export function defineThemePage(theme: SiteTheme): DocSpec {
  const cls = classifyTheme(theme)
  const observed = theme.elevation.filter((l) => l.evidence === 'observed')
  const inferred = theme.elevation.filter((l) => l.evidence === 'inferred')
  const page = theme.elevation[0]
  const primary = theme.buttons[0]
  const decorativeCount = theme.decorative.reduce((n, g) => n + g.items.length, 0)
  const rawRamps = theme.raw.ramps.length
  const chromaticRamps = Math.max(0, rawRamps - 1)
  const rows = contrastRows(theme)
  const fills = buttonContrast(theme).filter((b) => b.button.fill)
  const body = rows.find((r) => r.token.key === 'fg-primary') ?? rows[0]
  const muted = rows.find((r) => r.token.key === 'fg-muted')
  const brand = theme.decorative.flatMap((g) => g.items).find((i) => /brand/i.test(i.label))
  const ns = theme.namespace

  const css = themeCss(theme)

  const usage = `/* Stand it on a surface, write on it with a foreground, rule it with a border.
   A state is a layer over whatever is already there — never the next surface. */
.card {
  background: var(--${ns}-surface-1);
  color: var(--${ns}-fg-primary);
  border: 1px solid var(--${ns}-border-subtle);
}

.row { color: var(--${ns}-fg-muted); }
.row:hover { background: var(--${ns}-state-hover); }
.row[aria-current='page'] {
  background: var(--${ns}-state-selected);
  color: var(--${ns}-fg-primary);
}

:focus-visible {
  outline: 2px solid var(--${ns}-state-focus);
  outline-offset: 2px;
}`

  return defineDoc({
    meta: {
      id: theme.id,
      title: theme.title,
      tagline: theme.summary,
      keywords: [
        'theme',
        'palette',
        'design sheet',
        theme.site.toLowerCase(),
        cls.scheme,
        cls.chroma,
        'elevation',
        'surfaces',
        'tokens',
      ],
    },

    /* Not a `preview`. There is nothing here to change the controls of: each
       group of values is a section in its own right. The boards are drawn
       bare for the same reason — a stage with a theme switch and a device
       toggle around a list of colors offers to do things that would make it
       wrong. */
    sheet: [
      {
        id: 'surfaces',
        title: 'Surfaces and elevation',
        description: `${observed.length} surfaces are in use, from the page up${
          inferred.length ? `; ${inferred.length} more continue the same ramp` : ''
        }. A level is where a component sits, not where its gray sorts — which is why the dialog and the menu are not on the rungs you would guess. Hover and selected are underneath, on their own, because neither is a level.`,
        render: <ElevationSection theme={theme} />,
      },
      {
        id: 'core',
        title: 'Core palette',
        description:
          'What goes on those surfaces, in three groups: the text, the lines, and the handful of colors that mean something. Each has its role name, the token behind it, and what it is for. Surfaces are not repeated here.',
        render: <CoreSection theme={theme} />,
      },
      {
        id: 'elements',
        title: 'Interface elements',
        description:
          'The standard controls — buttons, fields, navigation rows, a menu and a dialog — assembled from the two sections above and nothing else.',
        render: <ElementsSection theme={theme} />,
      },
      {
        id: 'contrast',
        title: 'Contrast',
        description:
          'Each text color against each surface it is set on, and each button label against its own fill. The theme has already chosen its surfaces, so these are the only ratios a reader will ever meet.',
        render: <ContrastSection theme={theme} />,
      },
      {
        id: 'decorative',
        title: 'Decorative colors and special effects',
        description: `Shut by default. ${decorativeCount} treatments used now and then — a promotional button, an indicator, glass over artwork — grouped by the job each does. They are kept out of the way so they are not mistaken for the theme.`,
        render: <DecorativeSection theme={theme} />,
      },
      {
        id: 'raw',
        title: 'Raw tokens',
        description: `Shut by default. The ${rawRamps} ramps the roles above are drawn from. ${chromaticRamps} of them are hues, and the sections above take a status color from ${
          new Set(theme.semantic.map((s) => s.ref?.replace(/-\d+$/, ''))).size
        } of those. The rest are here for reference.`,
        render: <RawSection theme={theme} />,
      },
    ],

    do: [
      {
        title: 'Fill the primary button with the primary fill',
        why: `The primary button is ${
          primary?.fill ? describe(primary.fill.hex, primary.fill.alpha) : 'unfilled'
        } with ${primary?.ink.toUpperCase()} on it. It is the one thing on a screen the eye is sent to, whatever else there is a ramp for.`,
        render: <PrimarySpecimen theme={theme} />,
      },
      {
        title: 'Raise with the next surface, mark state with a layer',
        why: 'A menu is on a higher surface because it is a different object, over the thing it opened from. A hovered row is the same object, so it stays where it is and takes a translucent layer. Keeping the two apart is what stops a hover from looking like a popup.',
        render: <StateSpecimen theme={theme} />,
      },
      {
        title: 'Put a component on the level it belongs to',
        why: `${list(
          observed.map((l) => `E${l.level} is ${l.components.slice(0, 2).join(' and ').toLowerCase()}`),
        )}. Choose the level by what the component is, not by which gray looks right beside it.`,
      },
    ],

    dont: [
      {
        title: 'Do not promote a color because it has a ramp',
        why: `${chromaticRamps} hue ramps are in the raw tokens, and ${cls.chromatic.length} of ${cls.roles} interface roles carry a hue. A ramp is inventory. The theme is what the roles are painted with.`,
        render: brand ? <PrimarySpecimen theme={theme} accent={brand.css} /> : undefined,
      },
      {
        title: 'Do not use a surface as a hover',
        why: 'Lifting a row to the next level under the pointer spends a rung of a short ladder on something that lasts a second, and makes every hovered row look like the start of a menu.',
        render: <StateSpecimen theme={theme} wrong />,
      },
      {
        title: 'Do not bring decorative color into the chrome',
        why: 'The treatments in the collapsed section are for one button and a few badges. On a surface, a border or body text they stop being an accent, and the interface stops being this theme.',
      },
    ],

    a11y: {
      criteria: [
        { id: '1.4.1', name: 'Use of Color', level: 'A' },
        { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
        { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
        { id: '2.4.7', name: 'Focus Visible', level: 'AA' },
      ],
      contrast: [
        body
          ? `${body.token.label} text is ${body.cells
              .map((c) => `${c.ratio.toFixed(1)}:1 on E${c.level}`)
              .join(', ')}. It clears 7:1 on every surface it is used on, so nothing has to be re-checked when a component moves up a level.`
          : 'No text color was recorded for this site.',
        muted
          ? `${muted.token.label} text is ${muted.cells
              .map((c) => `${c.ratio.toFixed(1)}:1 on E${c.level}`)
              .join(', ')} — the lowest of the three that carry reading text, and the one to watch on the higher surfaces.`
          : 'No muted text color was recorded.',
        fills.length
          ? `Button labels against their own fills: ${fills
              .map((b) => `${b.button.label.toLowerCase()} ${b.ratio.toFixed(1)}:1`)
              .join(', ')}.`
          : 'No filled button was recorded.',
        'Borders drawn at low alpha are separators, not boundaries of a control: they sit well under 3:1 and are not asked to carry meaning. A field’s outline is the exception, and it is the strongest line on the sheet for that reason.',
      ],
      keyboard: [
        { keys: 'Tab', does: 'Moves through every value on the sheet; each one is a button that copies itself.' },
        { keys: 'Enter / Space', does: 'Copies the focused value, or opens and closes a collapsed section.' },
        { keys: '⌘I', does: 'Inspector Mode reports the live contrast of anything on this page.' },
      ],
      aria: [
        {
          attr: '<details> / <summary>',
          on: 'Decorative and Raw tokens',
          note: 'Native disclosure: announced as collapsed or expanded without any ARIA of ours, and operable before a script has run.',
        },
        {
          attr: 'aria-label',
          on: 'Each ramp step',
          note: 'A swatch announces as nothing. The label carries the ramp, the step and the value.',
        },
      ],
      focus:
        'Copyable values take a ring in their own text color, offset outward, because they sit on the theme’s surfaces rather than ours and our ring color was not chosen for them.',
      screenReader: [
        'Observed and Inferred are words as well as a filled and a hollow dot, so the distinction is read and survives grayscale.',
        'Every state on this sheet is described by what changes — a layer, a label, an outline — because "selected" announced by color alone is selected for nobody who cannot see it.',
      ],
      touch:
        'Ramp steps in the raw section are 28px tall and are a reference, not a control surface; on a phone, copy from the role rows above, which are full-width.',
    },

    code: {
      css: {
        lang: 'css',
        code: css,
        caption: `The theme as custom properties. Roles point at primitives, so a value is written once; only the primitives a role uses are included.`,
      },
      usage: { lang: 'css', code: usage, caption: 'How the roles combine: a surface, text on it, a line around it, and state as a layer.' },
    },

    notes: {
      tips: [
        theme.summary,
        `The page is ${page?.hex.toUpperCase()}, not black, and the text is ${
          body?.token.hex.toUpperCase() ?? 'near-white'
        }, not white. Most of what makes a neutral interface look like a particular neutral interface is in those two choices.`,
        'If a value you need is not a role, it is in Raw tokens. Give it a role before using it, so it is written once and can be changed in one place.',
      ],
      mistakes: [
        'Reaching into Raw tokens for a color a role already covers. A ramp step used directly is a value nobody can re-theme.',
        'Sorting surfaces by lightness and calling the result elevation. Where a component sits is a decision, and it does not always follow the grays.',
        'Treating an inferred row as settled. It is marked because its role is a reading rather than something measured in use; check it before relying on it.',
      ],
    },
  })
}
