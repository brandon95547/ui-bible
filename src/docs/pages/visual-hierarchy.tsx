import * as React from 'react'
import { Badge } from '@/ui/Display'
import { Knob, KnobSelect, KnobToggle, Row, Stack, defineDoc } from '../framework/kit'

/* ===========================================================================
   VISUAL HIERARCHY — the method, not the values.

   Foundations/Elevation says what the six levels ARE. Foundations/Dark Theme
   says which direction they move in. Neither answers the question a developer
   actually has in front of a blank component: *which level does this thing
   get?* That question is answered by the element's ROLE, and this page is the
   procedure for getting from role to value.

   The failure this page exists to prevent is real and was found in production:
   a drawer panel correctly raised one step, with every card, tile and rail
   inside it painted with a translucent wash of the PAGE colour. The wash
   composites against its parent, so the identical class read "slightly
   lighter" on the page and "a hole" inside the panel. Nobody wrote a wrong
   value; somebody wrote a value that has no fixed meaning.
   ======================================================================== */

/* -- colour maths, so the demos can show real numbers ---------------------- */

type RGB = [number, number, number]

const hexToRgb = (hex: string): RGB => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}

const rgbToHex = ([r, g, b]: RGB) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/** `top` painted at `alpha` over `base` — what a translucent class actually does. */
const composite = (base: RGB, top: RGB, alpha: number): RGB =>
  base.map((b, i) => alpha * top[i] + (1 - alpha) * b) as RGB

const relLuminance = ([r, g, b]: RGB) => {
  const ch = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/* The Bible's own dark ramp, as literals so the demo can do arithmetic on it.
   These must track tokens.css by hand — the demos below composite them and
   print the result, so a stale value here would be a page that lies about the
   system it documents. */
const RAMP = {
  canvas: '#101010',
  surface: '#1f1f1f',
  raised: '#282828',
  overlay: '#303030',
}

/** The ramp in order, so "one rung up" is expressible. */
const LADDER: string[] = [RAMP.canvas, RAMP.surface, RAMP.raised, RAMP.overlay]

/* ===========================================================================
   DEMO 1 — THE WASH TRAP
   The same treatment rendered in two containers. A ladder step is absolute and
   survives the move; a wash is relative and inverts.
   ======================================================================== */

type Treatment = 'ladder step' | 'translucent wash'

function Tile({ bg, label }: { bg: string; label: string }) {
  return (
    <div
      style={{ background: bg }}
      className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2"
    >
      <div className="text-overline uppercase text-[var(--ds-fg-muted)]">{label}</div>
      <div className="text-caption text-[var(--ds-fg)]">Ready</div>
    </div>
  )
}

function WashTrap() {
  const [treatment, setTreatment] = React.useState<Treatment>('translucent wash')

  /* Two grounds: the bare page, and a panel already raised two steps. */
  const grounds = [
    { name: 'on the page', hex: RAMP.canvas },
    { name: 'inside a raised panel', hex: RAMP.overlay },
  ]

  const resolve = (groundHex: string) => {
    if (treatment === 'ladder step') {
      /* An opaque step is chosen relative to the ground: one rung up, always. */
      const i = LADDER.indexOf(groundHex)
      return hexToRgb(LADDER[Math.min(i + 1, LADDER.length - 1)])
    }
    /* The wash: 30% of the *page* colour, whatever it lands on. */
    return composite(hexToRgb(groundHex), hexToRgb(RAMP.canvas), 0.3)
  }

  return (
    <Stack gap="md" className="w-full">
      <Knob label="Tile treatment">
        <KnobSelect
          value={treatment}
          onChange={setTreatment}
          options={['ladder step', 'translucent wash'] as Treatment[]}
        />
      </Knob>

      <Row gap="md" className="w-full items-stretch">
        {grounds.map((g) => {
          const ground = hexToRgb(g.hex)
          const tile = resolve(g.hex)
          const delta = relLuminance(tile) - relLuminance(ground)
          /* Three outcomes, not two. A wash of the page colour painted ON the
             page composites to the page — it does not sink, it simply stops
             existing, and calling that "a hole" would overstate it. The hole is
             what the same class does one container up. */
          const verdict =
            delta > 0.0005
              ? { tone: 'success' as const, text: 'reads as raised' }
              : delta < -0.0005
                ? { tone: 'danger' as const, text: 'reads as a hole' }
                : { tone: 'warning' as const, text: 'vanishes into the ground' }
          return (
            <div key={g.name} className="min-w-0 flex-1">
              <div
                style={{ background: g.hex }}
                className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] p-3"
              >
                <div className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                  {g.name}
                </div>
                <Tile bg={rgbToHex(tile)} label="Status" />
              </div>
              <div className="mt-2 font-mono text-caption text-[var(--ds-fg-muted)]">
                {rgbToHex(tile)} on {g.hex}
              </div>
              <div className="mt-1">
                <Badge tone={verdict.tone}>{verdict.text}</Badge>
              </div>
            </div>
          )
        })}
      </Row>

      <p className="text-caption text-[var(--ds-fg-secondary)]">
        {treatment === 'ladder step'
          ? 'A rung is picked relative to whatever it lands on, so the tile reads as raised in both containers.'
          : 'One class, two meanings, neither of them the intended one. The wash is 30% of the page colour: on the page it composites to the page and the tile disappears; inside the panel it drags 30% of the way back down and reads as a hole punched in it.'}
      </p>
    </Stack>
  )
}

/* ===========================================================================
   DEMO 2 — BOXING DEPTH
   Every filled, bordered container costs a level. Past two, the levels stop
   meaning anything and the content is just far away.
   ======================================================================== */

function BoxDepth() {
  const [depth, setDepth] = React.useState(1)
  const fills = [RAMP.surface, RAMP.raised, RAMP.overlay, RAMP.overlay]

  let content = (
    <Stack gap="xs">
      <span className="text-body text-[var(--ds-fg)]">Total audio</span>
      <span className="text-caption text-[var(--ds-fg-muted)]">4h 12m across 18 lessons</span>
    </Stack>
  )

  for (let i = depth - 1; i >= 0; i--) {
    content = (
      <div
        style={{ background: fills[i] }}
        className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] p-3"
      >
        {content}
      </div>
    )
  }

  return (
    <Stack gap="md" className="w-full">
      <Knob label="Nested filled containers">
        <KnobSelect
          value={String(depth)}
          onChange={(v) => setDepth(Number(v))}
          options={['0', '1', '2', '3']}
        />
      </Knob>
      <div style={{ background: RAMP.canvas }} className="rounded-[var(--radius-lg)] p-4">
        {content}
      </div>
      <p className="text-caption text-[var(--ds-fg-secondary)]">
        {depth === 0 && 'No box at all. Spacing alone groups it, and for one stat that is enough.'}
        {depth === 1 && 'One box. The card is a thing on the page — the common, correct case.'}
        {depth === 2 && 'Two. Defensible when the inner box is genuinely a different kind of object.'}
        {depth === 3 &&
          'Three. The ramp is exhausted, the padding has eaten the width, and no level is telling the reader anything they could not get from spacing.'}
      </p>
    </Stack>
  )
}

/* ===========================================================================
   DEMO 3 — CHANNELS
   Hierarchy is not one control. Fill is the weakest of the four and the one
   people reach for first.
   ======================================================================== */

const ROWS = ['Overview', 'Projects', 'Billing', 'Settings']

function Channels() {
  const [fill, setFill] = React.useState(true)
  const [marker, setMarker] = React.useState(false)
  const [weight, setWeight] = React.useState(false)
  const [colour, setColour] = React.useState(false)
  const selected = 1

  return (
    <Stack gap="md" className="w-full">
      <Row gap="sm" className="flex-wrap">
        <KnobToggle label="Fill" checked={fill} onChange={setFill} />
        <KnobToggle label="Marker bar" checked={marker} onChange={setMarker} />
        <KnobToggle label="Type weight" checked={weight} onChange={setWeight} />
        <KnobToggle label="Foreground" checked={colour} onChange={setColour} />
      </Row>

      <div
        style={{ background: RAMP.surface }}
        className="w-full max-w-[16rem] rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-2"
      >
        {ROWS.map((r, i) => {
          const on = i === selected
          return (
            <div
              key={r}
              className="relative flex items-center rounded-[var(--radius-md)] px-3 py-1.5 text-body"
              style={{
                background: on && fill ? 'var(--ds-layer-selected)' : undefined,
                fontWeight: on && weight ? 600 : 400,
                color: on && colour ? 'var(--ds-accent-text)' : 'var(--ds-fg-secondary)',
              }}
            >
              {on && marker && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--ds-accent)]"
                />
              )}
              {r}
            </div>
          )
        })}
      </div>

      <p className="text-caption text-[var(--ds-fg-secondary)]">
        {[fill, marker, weight, colour].filter(Boolean).length === 0
          ? 'Nothing marks the selected row. Whatever else is true, this is the failure state.'
          : fill && ![marker, weight, colour].some(Boolean)
            ? 'Fill alone. It works here, and it stops working the moment this list sits on a lighter surface or the user has a low-contrast display.'
            : 'More than one channel. The selection survives a change of ground, a colour-blind reader and a dimmed screen.'}
      </p>
    </Stack>
  )
}

/* ===========================================================================
   PAGE
   ======================================================================== */

export default defineDoc({
  meta: {
    id: 'visual-hierarchy',
    title: 'Visual Hierarchy',
    tagline:
      'Decide what an element IS before you decide what colour it is. Role determines elevation; elevation is then expressed with lightness, contrast, borders and space — and contrast that is not carrying meaning is noise.',
    keywords: [
      'hierarchy',
      'elevation',
      'surface',
      'depth',
      'contrast',
      'layering',
      'dark mode',
      'boxing',
      'nesting',
      'role',
      'z-pattern',
      'scanning',
    ],
    jumps: [
      { id: 'preview', label: 'The wash trap' },
      { id: 'do', label: 'Do' },
      { id: 'dont', label: "Don't" },
    ],
  },

  preview: {
    render: <WashTrap />,
    examples: [
      {
        id: 'boxing',
        title: 'Boxing depth',
        description:
          'A filled, bordered container is a claim that what is inside is a distinct object. Make the claim twice and it is weaker, not stronger.',
        render: <BoxDepth />,
      },
      {
        id: 'channels',
        title: 'The four channels',
        description:
          'Lightness, a marker, type weight and foreground colour. Fill is the one everyone reaches for and the only one that depends on what is underneath it.',
        render: <Channels />,
      },
    ],
    states: [
      {
        label: 'Rest',
        note: 'the baseline the others are read against',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-surface)] px-3 py-1.5 text-caption text-[var(--ds-fg-secondary)]">
            Projects
          </span>
        ),
      },
      {
        label: 'Hover',
        note: 'a hint, not a commitment',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)] px-3 py-1.5 text-caption text-[var(--ds-fg)]">
            Projects
          </span>
        ),
      },
      {
        label: 'Selected',
        note: 'must outrank hover, and not by a hair',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-layer-selected)] px-3 py-1.5 text-caption font-semibold text-[var(--ds-accent-text)]">
            Projects
          </span>
        ),
      },
      {
        label: 'Selected + hover',
        note: 'still legible as selected',
        render: (
          <span className="rounded-[var(--radius-md)] bg-[var(--ds-accent-subtle-hover)] px-3 py-1.5 text-caption font-semibold text-[var(--ds-accent-text)]">
            Projects
          </span>
        ),
      },
      {
        label: 'Disabled',
        note: 'the one state allowed to lose contrast',
        render: (
          <span className="rounded-[var(--radius-md)] px-3 py-1.5 text-caption text-[var(--ds-fg-disabled)]">
            Projects
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <div style={{ background: RAMP.canvas }} className="w-full rounded-[var(--radius-lg)] p-5">
        <div
          style={{ background: RAMP.surface }}
          className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] p-4"
        >
          <div className="mb-3 text-overline uppercase text-[var(--ds-fg-muted)]">Course</div>
          <div
            style={{ background: RAMP.raised }}
            className="mb-3 rounded-[var(--radius-md)] px-3 py-2 text-caption text-[var(--ds-fg)]"
          >
            Lesson 4 — Compound interest
          </div>
          <div className="rounded-[var(--radius-md)] bg-[var(--ds-field)] px-3 py-2 text-caption text-[var(--ds-fg-muted)]">
            Search lessons…
          </div>
        </div>
      </div>
    ),
    parts: [
      { n: 1, label: 'Page', value: '--ds-canvas', note: 'The ground. On a black theme it sits one rung up from the floor, so a well still has one step to drop into.', kind: 'color' },
      { n: 2, label: 'Panel', value: '--ds-surface', note: 'A region of the page. One step.', kind: 'color' },
      { n: 3, label: 'Card', value: '--ds-surface-raised', note: 'An object on the panel. Two steps.', kind: 'color' },
      { n: 4, label: 'Control', value: '--ds-field', note: 'Interactive, so it stands above the card it sits in — never below.', kind: 'color' },
      { n: 5, label: 'Boundary', value: '--ds-border-subtle', note: 'Alpha, so one value composes over every level.', kind: 'color' },
    ],
    caption:
      'Four levels, each earned by what the element is. The search field is the highest not because it is important but because it is interactive.',
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', group: 'Surfaces', usedFor: 'The page. The floor of the ramp.' },
    { category: 'color', token: '--ds-surface', group: 'Surfaces', usedFor: 'A panel or region on the page' },
    { category: 'color', token: '--ds-surface-raised', group: 'Surfaces', usedFor: 'A card — an object on a panel' },
    { category: 'color', token: '--ds-surface-overlay', group: 'Surfaces', usedFor: 'Drawers, dialogs, menus — anything over a scrim' },
    { category: 'color', token: '--ds-surface-inset', group: 'Surfaces', usedFor: 'Non-interactive wells only. If it takes focus it is not a well.' },
    { category: 'color', token: '--ds-field', group: 'Controls', usedFor: 'Any control the user can act on' },
    { category: 'color', token: '--ds-layer-hover', group: 'Interaction layers', usedFor: 'Alpha, so it composes over any level' },
    { category: 'color', token: '--ds-layer-selected', group: 'Interaction layers', usedFor: 'Selection tint — pair it with a second channel' },
    { category: 'color', token: '--ds-border-subtle', group: 'Boundaries', usedFor: 'Grouping without a fill' },
    { category: 'color', token: '--ds-fg-secondary', group: 'Foreground', usedFor: 'De-emphasis with a 4.5:1 floor' },
    { category: 'spacing', token: '--space-3 / --space-4', usedFor: 'Grouping by proximity — try this before a box' },
  ],

  do: [
    {
      title: 'Name the role before you pick a value',
      why: 'Page, panel, card, control, overlay, selected state. The role determines the level; the level determines the token. Skipping to the token is how a control ends up darker than the card it sits in — nobody decided that, it just happened.',
    },
    {
      title: 'Use opaque steps for surfaces, alpha for layers and borders',
      why: 'A surface has an absolute position in the ramp and must keep it wherever the component is reused. Hover, selection, scrims and borders are relative by nature — they modify whatever they land on, which is exactly what alpha does.',
    },
    {
      title: 'Group with space before you group with a box',
      why: 'Proximity is free, works at any contrast, and costs no level. A box is a strong claim; spend it on objects that are genuinely separable, not on every heading and its paragraph.',
    },
    {
      title: 'Give selection at least two channels',
      why: 'A tint alone is fragile: it shifts with whatever is beneath it, it vanishes on a dimmed screen, and it is invisible to a reader who cannot distinguish the hue. A marker bar, type weight or foreground colour costs nothing and makes the state survive.',
    },
    {
      title: 'Let contrast mean something',
      why: 'If a border, fill or shadow is not communicating depth, state or importance, it is decoration competing with the things that are. The test is whether you can say what it tells the reader.',
    },
    {
      title: 'Check the rendered value, not the class name',
      why: 'Translucent classes resolve against their parent, so the same declaration reads correctly in one container and inverted in another. Composite it and look at the number before believing the name.',
    },
  ],

  dont: [
    {
      title: 'Do not paint a surface with a wash of the page colour',
      why: 'It is the single most common way the ramp gets inverted. On the page it lands slightly lighter and looks fine; inside a raised panel it lands most of the way back down to the page and reads as a hole punched in the panel.',
    },
    {
      title: 'Do not nest filled, bordered containers more than two deep',
      why: 'The ramp runs out, the padding eats the width, and by the third level the boxes are no longer telling the reader anything that spacing was not already telling them.',
    },
    {
      title: 'Do not let hover and selected land on the same weight',
      why: 'They answer different questions — "you are pointing at this" and "you are on this". When a hover in one part of a list matches a selection in another, the component has no state at all.',
    },
    {
      title: 'Do not draw a border in the same colour as what it sits on',
      why: 'It measures 1:1 and does nothing but consume a pixel. This is why boundaries are alpha values: one token stays visible across every level, instead of being correct at the level it was first written for.',
    },
    {
      title: 'Do not give the strongest treatment to the unselected items',
      why: 'It sounds impossible and it happens constantly, usually via a stray utility that outranks the intended one at equal specificity. Whatever the cause, the loudest thing on screen should not be the ten things the user is not looking at.',
    },
    {
      title: 'Do not box a single child',
      why: 'A container around one element adds a level and a boundary to communicate a grouping that has nothing to group. It is the cheapest kind of visual noise to remove.',
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
    ],
    contrast: [
      'A boundary that carries meaning — a card edge, a selected marker, a focus ring — needs 3:1 against its adjacent surface. A boundary at 1.2:1 is a decision that was never rendered.',
      'De-emphasis has a floor. Secondary and muted text still need 4.5:1; "quieter" must never resolve to "harder to read".',
      'Surface steps themselves have no contrast minimum, because they are not information on their own. That is precisely why a surface step must never be the only thing expressing a state.',
      'Check the composite, not the token. A muted foreground certified against the page can fail against an overlay, which is a lighter ground.',
    ],
    keyboard: [
      { keys: 'Tab order', does: 'Must follow the visual hierarchy. If the eye goes heading → body → action, focus goes the same way.' },
      { keys: 'Focus ring', does: 'Is a hierarchy signal and outranks hover. It must be visible on every level of the ramp, which means an alpha ring or a paired light/dark value.' },
      { keys: 'Arrow keys', does: 'Within a list, moving focus must move the visible emphasis with it — focus that leaves no trace is a hierarchy that exists only for the mouse.' },
    ],
    aria: [
      {
        attr: 'aria-current',
        on: 'The selected item',
        note: 'Selection expressed only as a fill is invisible to assistive tech. This is the programmatic half of the same statement.',
      },
      {
        attr: 'Heading levels',
        on: 'Visual hierarchy',
        note: 'Font size is not a heading level. A page whose hierarchy is purely visual has no hierarchy for a screen reader.',
      },
      {
        attr: 'Landmarks / fieldset',
        on: 'Grouped regions',
        note: 'A group made from spacing alone exists only for sighted users. If the grouping matters, give it a semantic container too.',
      },
      {
        attr: 'aria-disabled',
        on: 'De-emphasised controls',
        note: 'Disabled is the one state permitted to drop below 4.5:1, and only because it is also announced.',
      },
    ],
    focus:
      'Focus order is the hierarchy expressed for people who are not looking at it. A layout that reads correctly but tabs in a scrambled order has a hierarchy that only exists visually — the structure was implied by position rather than built.',
    screenReader: [
      'Elevation is entirely invisible without sight. Every meaning carried by a surface step — this is a dialog, this is selected, this is grouped — needs a role, a state or a landmark carrying the same claim.',
      'Boxing that exists only for looks adds nothing to the audio experience but the nesting is often announced anyway. Fewer, more meaningful containers read better in both modes.',
      'Announce state rather than relying on emphasis: "selected", "expanded", "3 of 12".',
    ],
    touch:
      'Hierarchy has to survive the absence of hover. On touch there is no intermediate state between rest and commit, so any hierarchy whose only expression is a hover treatment simply does not exist for half the users. Selected and pressed carry the whole load.',
  },

  code: {
    usage: {
      lang: 'ts',
      caption:
        'The check worth automating: composite a translucent surface against its real parent and assert it moved the intended direction.',
      code: `type RGB = [number, number, number]

const hexToRgb = (hex: string): RGB =>
  [0, 2, 4].map((i) => parseInt(hex.replace('#', '').slice(i, i + 2), 16)) as RGB

/** What a translucent class ACTUALLY paints, given what is beneath it. */
const composite = (base: RGB, top: RGB, alpha: number): RGB =>
  base.map((b, i) => alpha * top[i] + (1 - alpha) * b) as RGB

const relLuminance = ([r, g, b]: RGB) => {
  const ch = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

/**
 * In a dark theme a stacked surface must be LIGHTER than its parent.
 * Pass the parent you will really be rendered on — not the page.
 */
const raisesCorrectly = (parent: string, wash: string, alpha: number) =>
  relLuminance(composite(hexToRgb(parent), hexToRgb(wash), alpha)) >
  relLuminance(hexToRgb(parent))

raisesCorrectly('#101010', '#101010', 0.3)   // false — on the page it vanishes
raisesCorrectly('#303030', '#101010', 0.3)   // false — inside a drawer, a hole

// Which is the whole argument for opaque steps:
// a rung is absolute, a wash is a function of its parent.`,
    },
    css: {
      lang: 'css',
      caption: 'Surfaces are opaque and absolute. Layers and borders are alpha and relative.',
      code: `/* SURFACES — opaque, so the level survives being reused elsewhere. */
.panel   { background: var(--ds-surface); }
.card    { background: var(--ds-surface-raised); }
.drawer  { background: var(--ds-surface-overlay); }
.control { background: var(--ds-field); }

/* LAYERS — alpha, so one value composes over every surface above. */
.row:hover        { background: var(--ds-layer-hover); }
.row[aria-current] { background: var(--ds-layer-selected); }

/* ...and selection never rests on the tint alone. */
.row[aria-current] {
  font-weight: 600;
  color: var(--ds-accent-text);
}
.row[aria-current]::before {
  content: '';
  position: absolute;
  inset-block: 25%;
  inset-inline-start: 0;
  inline-size: 2px;
  background: var(--ds-accent);
}

/* BOUNDARIES — alpha, so one token stays visible on every level. */
.card, .drawer, .panel { border: 1px solid var(--ds-border-subtle); }

/* The bug this prevents: an opaque border equal to its parent's fill.
   border-color: #1f1f1f on a #1f1f1f panel measures 1.00:1. */`,
    },
    api: [
      {
        name: 'Role → level',
        props: [
          { name: 'Page', type: '--ds-canvas', description: 'The ground. Almost nothing goes below it — on a black theme there is one rung of headroom and --ds-sunken is already using it.' },
          { name: 'Panel / region', type: '--ds-surface', description: 'A division of the page. Often needs no fill at all — spacing may be enough.' },
          { name: 'Card / object', type: '--ds-surface-raised', description: 'Something separable that the user thinks of as a unit.' },
          { name: 'Control', type: '--ds-field', description: 'Anything actionable. Goes above its container regardless of how deep that container is.' },
          { name: 'Overlay', type: '--ds-surface-overlay', description: 'Drawer, dialog, menu. Top of the ramp, plus a scrim.' },
          { name: 'Well', type: '--ds-surface-inset', description: 'Non-interactive only: code blocks, table headers, meter tracks. Below the container it sits in, not below the page — on black the page has no room under it. If it takes focus, it is a control.' },
          { name: 'Hover / selected', type: '--ds-layer-*', description: 'Alpha over whatever the row already is. Never an opaque value.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'The fastest review question for any surface is "what is this?" — if the answer is a role, the value follows. If the answer is a colour, the decision has not been made yet.',
      'Most "this looks off but I cannot say why" reactions are a hierarchy violation, and naming the level that is wrong turns a taste argument into a one-line fix.',
      'Try deleting the box before adjusting its colour. A surprising number of surface problems are really boxing problems, and the fix removes code.',
      'When a component renders in two places — a card and a drawer, a page and a modal — its surface must be a function of the parent, not a constant. That is an argument for a class per level, not a value per component.',
      'Interactivity outranks depth. A control inside a well still goes up, because "you can act on this" is a stronger claim than "this is recessed".',
    ],
    performance: [
      'Opaque surfaces are cheaper than stacked translucent ones: every alpha layer is another blend the compositor performs on every paint.',
      'Large blurred scrims (backdrop-filter) are the expensive part of an overlay, not the panel. One scrim per view; do not nest them.',
      'Animating background-color forces paint. Animate opacity or transform where the effect allows it.',
    ],
    mistakes: [
      'Painting a surface with a translucent wash of the page colour, so the same class reads as raised on the page and as a hole inside a panel.',
      'Reaching for a darker value to make something recede, in a theme where receding is what the page already does.',
      'Expressing selection with a fill alone, then discovering it is indistinguishable from hover once the list moves to a different surface.',
      'Bordering in an opaque colour that happens to match the current parent, which works until the component is reused one level up.',
      'Adding a box for every group, until the screen is boxes and the actual content is four levels of padding away.',
      'Treating a token ladder as the principle. The ladder is one implementation of it for one theme; the reasoning is what transfers.',
    ],
    realWorld: [
      'Found in production: a drawer correctly raised one step, with its status tiles, phase rail and every card inside it painted with a 30% wash of the page colour. The panel was right and everything in it was inverted — including the "in progress" row, which came out darker than the idle rows around it.',
      'The same audit found three borders at 1.00:1, all of them the correct token for the surface the component was originally written on, and all of them invisible after it moved.',
      'A component rendered in two containers is the reliable way to catch this. If a class only looks right in one of them, it was never a level — it was a coincidence.',
      'Hierarchy bugs survive review because each individual value looks defensible in isolation. They are found by composing the stack, not by reading the diff.',
    ],
  },
})
