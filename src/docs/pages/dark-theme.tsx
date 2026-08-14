import * as React from 'react'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Display'
import { Alert } from '@/ui/Feedback'
import { Card, CardHeader } from '@/ui/Surface'
import { Cell, PreviewStage, Row, Stack, Swatch, defineDoc } from '../framework/kit'

function SurfaceLadder({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div
      data-theme={theme}
      className="rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-4"
    >
      <p className="mb-3 text-overline uppercase text-[var(--ds-fg-muted)]">{theme}</p>
      <Stack gap="sm">
        {[
          ['canvas', '--ds-canvas'],
          ['surface', '--ds-surface'],
          ['raised', '--ds-surface-raised'],
          ['overlay', '--ds-surface-overlay'],
          ['inset', '--ds-surface-inset'],
        ].map(([label, v]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] px-3 py-2"
            style={{ background: `var(${v})` }}
          >
            <span className="text-caption text-[var(--ds-fg-secondary)]">{label}</span>
            <code className="font-mono text-[10px] text-[var(--ds-fg-muted)]">{v}</code>
          </div>
        ))}
      </Stack>
    </div>
  )
}

/* Page → panel → control, nested for real rather than drawn side by side: the
   failure only becomes obvious when the control is physically inside the thing
   it is supposed to be sitting on. */
function SurfaceStack({ correct }: { correct: boolean }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--ds-canvas)] p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wide text-[var(--ds-fg-muted)]">
        canvas · #101010
      </p>
      <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wide text-[var(--ds-fg-muted)]">
          panel · #1F1F1F
        </p>
        <div
          className="rounded-[var(--radius-sm)] border border-[var(--ds-border-interactive)] px-3 py-2"
          style={{ background: correct ? 'var(--ds-field)' : 'var(--ds-surface-inset)' }}
        >
          <span className="text-caption text-[var(--ds-fg-secondary)]">
            control · {correct ? '#383838' : '#181818'}
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-[var(--ds-fg-muted)]">
          {correct
            ? 'Two steps, both upward. The control is the lightest thing in the stack, so it is unmistakably the part you touch.'
            : 'The control is darker than the panel AND darker than the page behind it. It has fallen through both.'}
        </p>
      </div>
    </div>
  )
}

/* A real field, so the difference is judged the way it will be met — with a
   label, a placeholder and something to hover. */
function FieldSample({ token, hoverToken }: { token: string; hoverToken?: string }) {
  const [hover, setHover] = React.useState(false)
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
      <label className="mb-1.5 block text-label text-[var(--ds-fg-secondary)]">Report title</label>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--ds-border-interactive)] px-3 transition-colors duration-[120ms]"
        style={{ background: `var(${hover && hoverToken ? hoverToken : token})` }}
      >
        <span className="text-body text-[var(--ds-fg-muted)]">Enter a working title</span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--ds-fg-muted)]">
        {hoverToken
          ? 'Sits above the card and lifts again on hover — it answers the pointer.'
          : 'Sits below the card it is inside. On a near-black page there is nowhere darker left to go, so it stops reading as a field at all.'}
      </p>
    </div>
  )
}

function SampleUI({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div
      data-theme={theme}
      className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-4"
    >
      <Card padding="sm">
        <CardHeader
          title="api-gateway"
          description="Healthy · 3 regions"
          actions={<Badge tone="success" dot size="sm">Live</Badge>}
        />
      </Card>
      <Alert tone="warning" title="Certificate expires in 6 days">
        Renewal is automatic, but the DNS challenge record is missing.
      </Alert>
      <Row gap="sm">
        <Button size="sm">Deploy</Button>
        <Button size="sm" variant="outlined">Logs</Button>
        <Button size="sm" variant="text">Cancel</Button>
      </Row>
    </div>
  )
}

export default defineDoc({
  meta: {
    id: 'dark-theme',
    title: 'Dark Theme',
    tagline:
      'The default theme. Depth comes from surfaces getting lighter, not from shadows getting bigger — and it is emphatically not an inversion of the light theme.',
    keywords: ['dark mode', 'night', 'theme', 'oled', 'halation', 'surface'],
  },

  overview: {
    purpose:
      'Dark mode reduces eye strain in low light, saves power on OLED displays, and is what most developer-facing products default to. Done properly it also produces better hierarchy than a light theme, because surface lightness becomes an extra channel that light themes simply do not have.',
    whenToUse: [
      'As the default for developer tools, dashboards, editors and anything used for long sessions.',
      'When the interface surrounds media — images, video and charts read better against a dark field.',
      'When the user’s OS reports prefers-color-scheme: dark and they have expressed no preference.',
      'Always alongside a light theme. Shipping only one is shipping half a product.',
    ],
    whenNotToUse: [
      {
        text: 'For long-form reading in a bright environment — light-on-dark measurably slows reading for most people in daylight.',
        instead: 'the light theme',
        to: '#/light-theme',
      },
      {
        text: 'For content destined for print or export.',
        instead: 'a light-themed export path',
      },
      {
        text: 'When produced by inverting the light palette.',
        instead: 'a purpose-built dark ramp',
      },
    ],
    reasoning: (
      <>
        <p>
          Three rules make or break a dark theme, and all three are counter-intuitive.
        </p>
        <p>
          <strong>Never use pure black or pure white.</strong> #FFF text on #000 produces halation —
          the light text visually bleeds into the dark field, which is uncomfortable for everyone and
          genuinely difficult for readers with astigmatism. Our canvas is <code>#101010</code> and
          our brightest foreground is <code>#E5E4E3</code>, giving 15.0:1: far above the requirement
          and below the point where it starts to hurt. Both ends are deliberate. The page stops
          short of black so a well has one rung to drop into, and the foreground stops short of
          white so nothing on the page ever reaches the ratio that blooms.
        </p>
        <p>
          <strong>Elevation lightens.</strong> A shadow on near-black has almost nothing to darken,
          so depth has to come from the surface ramp — canvas, surface, raised, overlay, each one
          OKLCH lightness step (about 0.035) above the last. The shadow is still present, but it is
          defining an edge rather than communicating height, and the 1px alpha border does more of
          that work than the shadow does.
        </p>
        <p>
          <strong>Saturated colours must be desaturated and lightened.</strong> A colour tuned for
          white backgrounds vibrates against dark ones — the chromatic aberration in the eye cannot
          focus both the background and a high-chroma foreground simultaneously. Our brand goes from{' '}
          <code>#6A55F2</code> in light to <code>#6867C9</code> in dark, and the value that carries
          brand-coloured <em>text</em> goes lighter again, to <code>#B5B3ED</code> — the fill itself
          is too dark to read on. One hue, three jobs, three measured values.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="Surface ladder" center={false} minHeight={0} allowResize={false}>
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <SurfaceLadder theme="dark" />
          <SurfaceLadder theme="light" />
        </div>
      </PreviewStage>
    ),
    examples: [
      {
        id: 'side-by-side',
        title: 'The same UI in both themes',
        description:
          'Identical markup and identical component code. Only the tier-2 tokens change — and note that the dark version is not the light version with the colours flipped.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-2">
              <SampleUI theme="dark" />
              <SampleUI theme="light" />
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'halation',
        title: 'Why not pure black',
        description:
          'Both blocks pass contrast comfortably. The left is what we ship; the right is what maximum contrast actually feels like after two minutes of reading.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-2">
              <Cell label="#101010 on #E5E4E3 — 15.0:1" tone="good">
                <div className="rounded-[var(--radius-md)] bg-[#101010] p-4">
                  <p className="text-body-sm leading-relaxed text-[#E5E4E3]">
                    Deployment finished in 42 seconds across three regions. Every request is retried
                    twice before the circuit opens.
                  </p>
                </div>
              </Cell>
              <Cell label="#000 on #FFF — 21:1" tone="bad">
                <div className="rounded-[var(--radius-md)] bg-black p-4">
                  <p className="text-body-sm leading-relaxed text-white">
                    Deployment finished in 42 seconds across three regions. Every request is retried
                    twice before the circuit opens.
                  </p>
                </div>
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'stacking',
        title: 'Stacked surfaces only go up',
        description:
          'The single rule that decides every surface colour in dark mode: whatever sits on top of something else is lighter than the thing behind it. Depth is lightness here, so a surface that goes darker is not "recessed" — it has moved backwards, behind the page it is supposed to be sitting on.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-2">
              <Cell label="Each layer lighter than the last" tone="good">
                <SurfaceStack correct />
              </Cell>
              <Cell label="The control goes darker than its panel" tone="bad">
                <SurfaceStack correct={false} />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'controls-go-up',
        title: 'A control is a surface, not a hole',
        description:
          'Material 3 puts a filled text field on surface-container-highest — the lightest container in the ramp, never a darker one. The reason is behavioural, not decorative: lightness is what reads as "in front of the page", and anything a person is meant to click or type into has to read that way. The Bible used to back fields with --ds-surface-inset and it was wrong; inset is now reserved for wells nobody interacts with.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 lg:grid-cols-2">
              <Cell label="--ds-field · a control you can act on" tone="good">
                <FieldSample token="--ds-field" hoverToken="--ds-field-hover" />
              </Cell>
              <Cell label="--ds-surface-inset · reads as switched off" tone="bad">
                <FieldSample token="--ds-surface-inset" />
              </Cell>
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'inset-exception',
        title: 'The one place darker is right',
        description:
          'Inset survives for wells that hold content rather than accept input — a code block, a table header, the unfilled part of a meter. Nothing here invites a click, so reading as "behind the surface" is accurate rather than misleading. If it has a focus ring, it is not one of these.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <div className="grid w-full gap-4 sm:grid-cols-3">
              {[
                ['Code block', 'holds content'],
                ['Table header', 'labels a grid'],
                ['Meter track', 'the unfilled part'],
              ].map(([label, note]) => (
                <div
                  key={label}
                  className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3"
                >
                  <div className="rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] px-3 py-2">
                    <p className="text-caption text-[var(--ds-fg-secondary)]">{label}</p>
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--ds-fg-muted)]">{note}</p>
                </div>
              ))}
            </div>
          </PreviewStage>
        ),
      },
      {
        id: 'chroma',
        title: 'Colour has to move',
        description:
          'The top row is the light-theme value shown on a dark canvas. The bottom row is the dark-theme value. Same role, different step of the ramp.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Stack gap="md" className="w-full">
              <div>
                <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                  Light-theme values on a dark canvas — too dark, too saturated
                </p>
                <Row gap="sm">
                  <Swatch name="brand-600" value="#6a55f2" size="sm" />
                  <Swatch name="success-600" value="#0e9260" size="sm" />
                  <Swatch name="danger-600" value="#d62838" size="sm" />
                  <Swatch name="info-600" value="#1b62db" size="sm" />
                </Row>
              </div>
              <div>
                <p className="mb-2 text-overline uppercase text-[var(--ds-fg-muted)]">
                  Dark-theme values — lighter, calmer, readable
                </p>
                <Row gap="sm">
                  <Swatch name="brand-500" value="#706fd3" size="sm" />
                  <Swatch name="success-500" value="#16b375" size="sm" />
                  <Swatch name="danger-500" value="#ee4351" size="sm" />
                  <Swatch name="info-500" value="#2e7df6" size="sm" />
                </Row>
              </div>
            </Stack>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Canvas', note: '#101010', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-canvas)]" /> },
      { label: 'Surface', note: '#1F1F1F', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)]" /> },
      { label: 'Raised', note: '#282828', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)]" /> },
      { label: 'Overlay', note: '#303030', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-overlay)]" /> },
      { label: 'Inset', note: '#181818', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-inset)]" /> },
      { label: 'Hover', note: 'white 4.5%', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-surface)] ring-1 ring-inset ring-[var(--ds-border-subtle)]"><span className="block h-full w-full rounded-[var(--radius-md)] bg-[var(--ds-layer-hover)]" /></span> },
      { label: 'Border', note: 'white 11.5%', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] border border-[var(--ds-border)]" /> },
      { label: 'Scrim', note: 'black 72%', render: <span className="block h-10 w-16 rounded-[var(--radius-md)] bg-[var(--ds-layer-scrim)]" /> },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--ds-canvas)] p-4">
        <div className="rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4 shadow-e1">
          <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface-raised)] p-3 shadow-e2">
            <div className="rounded-[var(--radius-sm)] bg-[var(--ds-surface-inset)] px-3 py-2">
              <span className="text-caption text-[var(--ds-fg-muted)]">inset · a well, not a lift</span>
            </div>
          </div>
        </div>
      </div>
    ),
    caption:
      'Four surfaces, each a measured step apart. The shadow contributes almost nothing here — remove it and the hierarchy still reads.',
    parts: [
      {
        n: 1,
        label: 'Canvas',
        value: '#1E1E39',
        kind: 'color',
        note: 'Not #000. Pure black causes halation with light text and removes the ability to render anything darker than the page.',
      },
      {
        n: 2,
        label: 'Surface step',
        value: '≈4–6% lightness per level',
        kind: 'color',
        note: 'Below 3% the levels are indistinguishable; above 8% the top surface starts reading as a different colour rather than a higher one.',
      },
      {
        n: 3,
        label: 'Field',
        value: '#383838 — above every surface, the overlay included',
        kind: 'color',
        note: 'Controls go UP, past every container including the overlay. Material 3 puts a filled field on the lightest container in the ramp: a thing you can act on is a surface standing on the page, not a hole cut into it. An input inside a dialog is where systems get this wrong.',
      },
      {
        n: 3.5,
        label: 'Inset',
        value: '#181818 — darker than surface',
        kind: 'color',
        note: 'Only for wells nobody clicks: code blocks, table headers, meter tracks, media areas. It used to back inputs too, which is what made fields read as switched off.',
      },
      {
        n: 4,
        label: 'Border',
        value: 'white at 6–19% alpha',
        kind: 'color',
        note: 'Alpha, so it composes over any surface. A solid grey border only matches one background and looks wrong on the other three.',
      },
      {
        n: 5,
        label: 'Foreground ceiling',
        value: '#E5E4E3, not #FFFFFF',
        kind: 'color',
        note: '14.8:1 rather than 21:1. Well past AAA, and specifically below the point where light text starts to bloom against a dark field.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', value: '#101010', usedFor: 'Page background' },
    { category: 'color', token: '--ds-surface', value: '#1f1f1f', usedFor: 'Cards, panels' },
    { category: 'color', token: '--ds-surface-raised', value: '#282828', usedFor: 'Elevated cards, active segments' },
    { category: 'color', token: '--ds-surface-overlay', value: '#303030', usedFor: 'Dialogs, menus, toasts' },
    { category: 'color', token: '--ds-field', value: '#383838', usedFor: 'Inputs, selects, textareas — a control is a raised surface' },
    { category: 'color', token: '--ds-field-hover', value: '#3d3d3d', usedFor: 'The lift a field takes under the pointer' },
    { category: 'color', token: '--ds-surface-inset', value: '#181818', usedFor: 'Non-interactive wells only: code blocks, table headers, meter tracks' },
    { category: 'color', token: '--ds-fg', value: '#e5e4e3', usedFor: 'Primary text — 15.0:1 on canvas' },
    { category: 'color', token: '--ds-fg-secondary', value: '#b6b6b6', usedFor: 'Body text — 9.4:1' },
    { category: 'color', token: '--ds-fg-muted', value: '#aaaaaa', usedFor: 'Captions — 8.2:1 on canvas, 4.7:1 on a hovered field' },
    { category: 'color', token: '--ds-border-subtle', value: 'white 6.3%', usedFor: 'Dividers, card edges' },
    { category: 'color', token: '--ds-layer-hover', value: 'white 4.5%', usedFor: 'Hover wash over any surface' },
    { category: 'color', token: '--ds-accent', value: '#6867c9', usedFor: 'Brand — C64 Purple, one step down so a white label passes AA' },
    { category: 'color', token: '--ds-layer-scrim', value: 'black 72%', usedFor: 'Behind modal surfaces' },
    { category: 'shadow', token: '--shadow-e1 … e5', usedFor: 'Tighter and darker than their light-theme counterparts' },
  ],

  do: [
    {
      title: 'Lighten to elevate',
      why: 'Surface lightness is the primary depth channel in dark mode. It survives greyscale, high-contrast mode and a phone in sunlight; a shadow on near-black does none of those.',
      render: (
        <Stack gap="xs" className="w-full">
          {['--ds-canvas', '--ds-surface', '--ds-surface-raised', '--ds-surface-overlay'].map((v) => (
            <div
              key={v}
              className="rounded-[var(--radius-sm)] border border-[var(--ds-border-subtle)] px-2.5 py-1.5 text-caption text-[var(--ds-fg-muted)]"
              style={{ background: `var(${v})` }}
            >
              {v}
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Use alpha for overlays and borders',
      why: 'A 6% white border composes correctly over the canvas, a card, a menu and a coloured banner. A solid grey border is correct on exactly one of them.',
      render: (
        <Stack gap="xs" className="w-full">
          {['var(--ds-surface)', 'var(--ds-accent-subtle)', 'var(--ds-danger-subtle)'].map((bg) => (
            <div key={bg} className="rounded-[var(--radius-sm)] border border-[var(--ds-border)] p-2" style={{ background: bg }}>
              <span className="text-caption text-[var(--ds-fg-secondary)]">same border token</span>
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Set color-scheme',
      why: 'It tells the browser to render native scrollbars, the text caret, form controls and autofill backgrounds in dark. Without it you get white scrollbars and a blinding autofill.',
      render: (
        <code className="font-mono text-[11px] text-[var(--ds-success-text)]">
          :root {'{'} color-scheme: dark; {'}'}
        </code>
      ),
    },
    {
      title: 'Dim images and illustrations slightly',
      why: 'A photograph at full brightness against a dark UI is a light source. A small brightness reduction on non-critical imagery keeps the page comfortable without altering content.',
      render: (
        <Row gap="sm">
          <span className="block h-12 w-20 rounded-[var(--radius-md)] bg-gradient-to-br from-[#fff] to-[#ddd]" />
          <span className="block h-12 w-20 rounded-[var(--radius-md)] bg-gradient-to-br from-[#fff] to-[#ddd] brightness-[0.86]" />
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not invert the light theme',
      why: 'Inversion produces mid-greys with no meaningful lightness steps, a brand colour that vibrates, and shadows that are invisible. Dark mode is a separate design, not a filter.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] p-3" style={{ filter: 'invert(1)' }}>
          <div className="rounded-[var(--radius-sm)] bg-white p-3">
            <p className="text-body-sm text-black">Inverted — and now the brand colour is green.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Do not use pure black or pure white',
      why: 'Maximum contrast causes halation, and #000 leaves nowhere to go for anything that needs to be darker than the page — like an inset input.',
      render: (
        <div className="w-full rounded-[var(--radius-md)] bg-black p-3">
          <p className="text-body-sm text-white">#FFFFFF on #000000 — 21:1 and unpleasant.</p>
        </div>
      ),
    },
    {
      title: 'Do not reuse light-theme shadows',
      why: 'A soft grey shadow on a dark surface fogs the edge instead of defining it. Dark shadows are darker, tighter, and always paired with a hairline border.',
      render: (
        <div className="h-14 w-40 rounded-[var(--radius-lg)] bg-[var(--ds-surface-raised)]" style={{ boxShadow: '0 8px 24px rgb(140 140 150 / 0.4)' }} />
      ),
    },
    {
      title: 'Do not keep light-theme saturation',
      why: 'High-chroma colours on dark backgrounds vibrate — the eye cannot focus both planes at once. Lighten the value and pull a little chroma out of it.',
      render: (
        <Row gap="sm">
          <span className="grid h-10 w-24 place-items-center rounded-[var(--radius-md)] text-caption text-white" style={{ background: '#4835a8' }}>
            too dark
          </span>
          <span className="grid h-10 w-24 place-items-center rounded-[var(--radius-md)] text-caption text-black" style={{ background: '#a78bfa', filter: 'saturate(2)' }}>
            too hot
          </span>
        </Row>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.8', name: 'Visual Presentation', level: 'AAA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'Dark themes need contrast checked independently — a pair that passes on white frequently fails on near-black and vice versa.',
      'Our primary text is 15.0:1, body 9.4:1 and captions 8.2:1 against the canvas. All comfortably above AA, all deliberately below 21:1. Captions are certified against --ds-field-hover, where they read 4.7:1 — the lightest ground in the system, and the one that decides whether they pass.',
      'Alpha borders and tints must be composited against their actual surface before measuring. A 6% white border over the canvas and the same border over an overlay are different colours.',
    ],
    keyboard: [
      { keys: '⌘K → theme', does: 'The command palette exposes the theme switch, because a keyboard user should not have to hunt for it.' },
    ],
    aria: [
      { attr: 'color-scheme: dark', on: ':root', note: 'Native scrollbars, caret, form controls, autofill and the browser UI all follow it.' },
      { attr: 'prefers-color-scheme', on: 'Media query', note: 'The initial default only. An explicit user choice must always win and must persist.' },
      { attr: 'forced-colors', on: 'Media query', note: 'High Contrast Mode replaces the palette entirely. Test that layout and semantics survive without any of your colours.' },
    ],
    focus:
      'The focus ring uses #8584DD in dark and is drawn with a 2px offset, which is what makes it legal: against the page it reads 5.8:1, while against the accent fill it would only be 1.5:1. A ring that hugs a filled button is measuring itself against the wrong thing.',
    screenReader: [
      'Theme has no effect on assistive technology. Never use it as a signal — a "dark banner means danger" convention is invisible to a screen reader and to a light-theme user.',
    ],
    touch:
      'Dark interfaces are typically used in low light, where pupils are dilated and glare is worse. Keep large bright surfaces to a minimum and avoid full-white modals.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `// The theme lives on <html> so a single attribute re-themes everything
document.documentElement.dataset.theme = 'dark'

// Respect the OS default, but let an explicit choice win and persist
function initialTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Prevent the flash of the wrong theme: run this before first paint,
// as an inline script in <head>, not in a React effect.
;(function () {
  const t = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  document.documentElement.dataset.theme = t
})()

// A light island inside the dark app — used by every preview in this Bible
<div data-theme="light">
  <Card>Renders in light regardless of the app theme</Card>
</div>`,
    },
    css: {
      lang: 'css',
      code: `:root, [data-theme='dark'] {
  color-scheme: dark;

  /* Surfaces climb in lightness. Never pure black. */
  --ds-canvas:          #101010;
  --ds-surface:         #1f1f1f;
  --ds-surface-raised:  #282828;
  --ds-surface-overlay: #303030;
  --ds-surface-inset:   #181818;   /* darker: wells only, never a control */

  /* Foreground stops short of pure white to avoid halation */
  --ds-fg:           #e5e4e3;      /* 15.0:1 */
  --ds-fg-secondary: #b6b6b6;      /*  9.4:1 */
  --ds-fg-muted:     #aaaaaa;      /*  8.2:1 */

  /* Alpha, so one token works over every surface. The alphas are a few
     points higher than a mid-tone ground needs: white wins less contrast
     against a dark neutral, so an edge at 6% would disappear. */
  --ds-border-subtle: rgb(255 255 255 / 0.063);
  --ds-border:        rgb(255 255 255 / 0.115);
  --ds-layer-hover:   rgb(255 255 255 / 0.045);

  /* Brand lightens and loses a little chroma */
  --ds-accent: #6867c9;            /* light theme uses #6a55f2 */

  /* Shadows are darker and tighter than in light mode */
  --ds-shadow-3: 0 4px 8px -4px rgb(0 0 0 / 0.60),
                 0 12px 20px -6px rgb(0 0 0 / 0.44);
}

/* Take the edge off bright media without altering content */
[data-theme='dark'] img:not([data-no-dim]),
[data-theme='dark'] video {
  filter: brightness(0.92);
}`,
    },
  },

  notes: {
    tips: [
      'Design dark first if the product is developer-facing. Building light second exposes every place where surface lightness was doing structural work.',
      'Put the theme attribute on <html> and set it from an inline script in <head>. Setting it in a React effect guarantees a visible flash on every load.',
      'Test on an OLED phone at minimum brightness. Ramps that look smooth on a calibrated monitor often band badly there.',
      'Keep code blocks and inputs darker than their container. Inverting that relationship makes an input look like a button and confuses people before they can say why.',
    ],
    performance: [
      'Switching a data attribute on :root invalidates style for the whole document, which is one full style recalculation — imperceptible for a deliberate theme switch, far too expensive to animate.',
      'Do not transition colours on a theme switch. A 300ms crossfade of every element on the page is one of the most expensive things a web app can do.',
      'OLED screens use meaningfully less power on dark pixels. For a mobile-first product that matters more than most performance work.',
    ],
    mistakes: [
      'Forgetting color-scheme, then getting white scrollbars, a white autofill background and a light date picker in an otherwise dark app.',
      'Reusing light-theme shadow values, which look like grey fog on a dark surface.',
      'Making the input the same colour as its card, so the field boundary disappears entirely.',
      'Leaving one hard-coded #FFFFFF in a component. It is invisible in the light theme and glaring in the dark one.',
    ],
    realWorld: [
      'Ship both themes from day one. Retrofitting a second theme means auditing every hard-coded colour in the product, and there are always more than anyone expects.',
      'Give users three choices — dark, light, system — and remember the choice. "System" alone is not enough for people whose OS setting does not match their preference for your app.',
      'Screenshot your product in both themes side by side and look at them for a minute. Inconsistencies that are invisible in isolation are obvious in comparison.',
      'When a designer supplies only light-mode mockups, ask for the dark surface ramp before building. Deriving it during implementation always produces mid-greys with no hierarchy.',
    ],
  },
})
