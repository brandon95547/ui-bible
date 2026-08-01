import * as React from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { useCopy } from '@/lib/hooks'
import { Button } from '@/ui/Button'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

/* ---------------------------------------------------------------------------
   A deterministic stand-in: the real component renders a scannable code, but
   the anatomy that matters — modules, finder patterns, quiet zone, contrast —
   is identical, and this renders the same everywhere with no dependency.
   ------------------------------------------------------------------------ */
const GRID = 21

function pattern(seed: number) {
  const cells: boolean[] = []
  let s = seed
  for (let i = 0; i < GRID * GRID; i++) {
    s = (s * 1103515245 + 12345) % 2147483648
    cells.push(s % 100 > 52)
  }
  return cells
}

function isFinder(r: number, c: number) {
  const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7
  return inBox(0, 0) || inBox(0, GRID - 7) || inBox(GRID - 7, 0)
}

function Finder({ r, c, dark, light }: { r: number; c: number; dark: string; light: string }) {
  return (
    <g transform={`translate(${c} ${r})`}>
      <rect width={7} height={7} fill={dark} />
      <rect x={1} y={1} width={5} height={5} fill={light} />
      <rect x={2} y={2} width={3} height={3} fill={dark} />
    </g>
  )
}

function QR({
  size = 128,
  quiet = 4,
  inverted,
  logo,
  seed = 7,
}: {
  size?: number
  quiet?: number
  inverted?: boolean
  logo?: boolean
  seed?: number
}) {
  const cells = React.useMemo(() => pattern(seed), [seed])
  const total = GRID + quiet * 2
  // Inverting is a real failure mode: most scanners assume dark modules on a
  // light field and will not read the reverse.
  const dark = inverted ? '#ffffff' : '#0a0b0e'
  const light = inverted ? '#0a0b0e' : '#ffffff'

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code linking to acme.dev/d/9fJk2Lm"
      className="shrink-0 rounded-[var(--radius-md)]"
      shapeRendering="crispEdges"
    >
      {/* The quiet zone is part of the code, not padding around it. */}
      <rect width={total} height={total} fill={light} />
      <g transform={`translate(${quiet} ${quiet})`}>
        {cells.map((on, i) => {
          const r = Math.floor(i / GRID)
          const c = i % GRID
          if (isFinder(r, c)) return null
          if (logo && r >= 8 && r < 13 && c >= 8 && c < 13) return null
          return on ? <rect key={i} x={c} y={r} width={1} height={1} fill={dark} /> : null
        })}
        <Finder r={0} c={0} dark={dark} light={light} />
        <Finder r={0} c={GRID - 7} dark={dark} light={light} />
        <Finder r={GRID - 7} c={0} dark={dark} light={light} />
        {logo && (
          <g>
            <rect x={8} y={8} width={5} height={5} fill={light} />
            <rect x={9} y={9} width={3} height={3} rx={0.6} fill="var(--p-brand-500)" />
          </g>
        )}
      </g>
    </svg>
  )
}

function Playground() {
  const [size, setSize] = React.useState<'96' | '128' | '192'>('128')
  const [quiet, setQuiet] = React.useState<'0' | '2' | '4'>('4')
  const [logo, setLogo] = React.useState(false)
  const [inverted, setInverted] = React.useState(false)
  const { copied, copy } = useCopy()
  const url = 'https://acme.dev/d/9fJk2Lm'

  return (
    <PreviewStage
      label="Playground"
      minHeight={260}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect value={size} onChange={setSize} options={['96', '128', '192'] as const} />
          </Knob>
          <Knob label="Quiet zone">
            <KnobSelect value={quiet} onChange={setQuiet} options={['0', '2', '4'] as const} />
          </Knob>
          <KnobToggle checked={logo} onChange={setLogo} label="Logo" />
          <KnobToggle checked={inverted} onChange={setInverted} label="Inverted" />
        </div>
      }
      code={`<QrCode
  value="${url}"
  size={${size}}
  quietZone={${quiet}}
  errorCorrection="${logo ? 'H' : 'M'}"${logo ? '\n  logo={<Mark />}' : ''}
/>`}
    >
      <Row gap="lg" align="center">
        <QR size={Number(size)} quiet={Number(quiet)} logo={logo} inverted={inverted} />
        <Stack gap="sm" className="max-w-[16rem]">
          <span className="text-label text-[var(--ds-fg)]">Open on your phone</span>
          {/* The destination in text, always. A code nobody can scan is a dead
              end unless the URL is readable and copyable. */}
          <code className="break-all font-mono text-caption text-[var(--ds-fg-secondary)]">
            {url}
          </code>
          <Row gap="sm">
            <Button
              size="sm"
              variant="outlined"
              startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={() => copy(url)}
            >
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button size="sm" variant="text" startIcon={<Download size={14} />}>
              Save
            </Button>
          </Row>
        </Stack>
      </Row>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'qr-code',
    title: 'QR Code',
    tagline:
      'Size, quiet zone, error correction level — and always printing the destination as text beside it.',
    keywords: ['2d barcode', 'scan code', 'quiet zone', 'error correction', 'pairing', 'contrast'],
  },

  overview: {
    purpose:
      'A QR code moves a value from one screen to another device without typing it. That is its entire job, and it is a good one — a 40-character pairing token is miserable to transcribe and trivial to scan. Everything the component gets wrong comes from treating it as a graphic rather than as a machine-readable target with physical requirements.',
    whenToUse: [
      'Moving a session, a link or a token from a desktop screen to a phone.',
      'Device pairing, two-factor enrolment and Wi-Fi credentials.',
      'Print and physical surfaces, where there is no other way to hand over a URL.',
      'Tickets and passes that a scanner will read.',
    ],
    whenNotToUse: [
      {
        text: 'The user is already on the device that would open the link.',
        instead: 'a Link — nobody scans a code with the phone it is displayed on',
        to: '#/link',
      },
      {
        text: 'The value is short enough to type.',
        instead: 'a Pin Input or a Code Snippet with a copy button',
        to: '#/pin-input',
      },
      {
        text: 'It is decoration on a marketing page.',
        instead: 'a short URL — an unexplained code on a web page is scanned by almost nobody',
        to: '#/code-snippet',
      },
    ],
    reasoning: (
      <>
        <p>
          <strong>The quiet zone is part of the code.</strong> Four modules of blank margin on
          every side is what lets a scanner find the symbol’s edges. Cropping it to make the code
          "fit better" is the single most common reason a code will not scan, and it is invisible
          in review because the code still looks correct.
        </p>
        <p>
          Always show the <strong>destination as text</strong>. A code is unreadable to a human, so
          a user who cannot scan — no camera, a screen reader, a printout in bad light — has
          nothing at all. The URL beside it costs one line and removes the dead end.
        </p>
        <p>
          <strong>Never invert it.</strong> Most scanners assume dark modules on a light field, and
          a light-on-dark code fails on a meaningful share of devices. In a dark interface the code
          keeps its white field — it is a machine target that happens to be on your page, not a
          surface that should match your theme.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'quiet-zone',
        title: 'The quiet zone is not padding',
        description:
          'Four modules of white on every side is what lets a scanner locate the symbol. Cropping it is the most common cause of a code that will not read — and it still looks correct.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="13rem">
              <Cell label="4 modules" sub="Scans" tone="good">
                <QR size={112} quiet={4} />
              </Cell>
              <Cell label="2 modules" sub="Marginal" tone="bad">
                <QR size={112} quiet={2} />
              </Cell>
              <Cell label="None" sub="Frequently fails" tone="bad">
                <QR size={112} quiet={0} />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'inverted',
        title: 'Never invert for dark mode',
        description:
          'Most scanners assume dark modules on light. A code is a machine target that happens to be on your page — it keeps its white field in every theme.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="13rem">
              <Cell label="White field" tone="good">
                <QR size={112} />
              </Cell>
              <Cell label="Inverted" sub="Fails on many scanners" tone="bad">
                <QR size={112} inverted />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'logo',
        title: 'A logo costs error correction',
        description:
          'Covering the centre means raising the correction level to H, which makes the symbol denser. It is a real trade, not a free bit of branding.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="13rem">
              <Cell label="Level M" sub="No logo · lighter symbol" tone="good">
                <QR size={112} />
              </Cell>
              <Cell label="Level H" sub="Logo · denser, still scans" tone="good">
                <QR size={112} logo />
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'context',
        title: 'Always beside the destination',
        description:
          'The code, the URL as selectable text, and a copy control. Anyone who cannot scan still has a way through.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Row gap="lg" align="center">
              <QR size={112} />
              <Stack gap="sm" className="max-w-[15rem]">
                <span className="text-label text-[var(--ds-fg)]">Scan to continue on your phone</span>
                <code className="break-all font-mono text-caption text-[var(--ds-fg-secondary)]">
                  https://acme.dev/d/9fJk2Lm
                </code>
                <span className="text-caption text-[var(--ds-fg-muted)]">Expires in 10 minutes</span>
              </Stack>
            </Row>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Default', render: <QR size={80} /> },
      { label: 'Large', render: <QR size={112} /> },
      { label: 'With logo', render: <QR size={80} logo /> },
      { label: 'No quiet zone', render: <QR size={80} quiet={0} /> },
      { label: 'Inverted', render: <QR size={80} inverted /> },
      {
        label: 'Loading',
        render: <span className="block h-20 w-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--ds-layer-active)]" />,
      },
      {
        label: 'Expired',
        render: (
          <span className="relative block">
            <span className="block opacity-25">
              <QR size={80} />
            </span>
            <span className="absolute inset-0 grid place-items-center text-caption text-[var(--ds-danger-text)]">
              Expired
            </span>
          </span>
        ),
      },
      {
        label: 'On a card',
        render: (
          <span className="inline-block rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-white p-2">
            <QR size={72} />
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="center">
        <QR size={160} />
        <Stack gap="sm" className="max-w-[15rem]">
          <span className="text-label text-[var(--ds-fg)]">Open on your phone</span>
          <code className="break-all font-mono text-caption text-[var(--ds-fg-secondary)]">
            https://acme.dev/d/9fJk2Lm
          </code>
        </Stack>
      </Row>
    ),
    caption:
      'Three finder patterns, a field of modules, four modules of quiet zone, and the destination printed as text beside it.',
    parts: [
      {
        n: 1,
        label: 'Module',
        value: '≥ 4px on screen',
        kind: 'size',
        note: 'The smallest square. Below about four device pixels a phone camera cannot resolve them reliably, which is what sets the minimum overall size.',
      },
      {
        n: 2,
        label: 'Quiet zone',
        value: '4 modules, every side',
        kind: 'space',
        note: 'Part of the specification, not padding. It is what lets a scanner find the symbol’s edges, and cropping it is invisible in review.',
      },
      {
        n: 3,
        label: 'Finder patterns',
        value: '7 × 7, three corners',
        kind: 'shape',
        note: 'How the scanner establishes orientation. They must never be covered, restyled or rounded away.',
      },
      {
        n: 4,
        label: 'Field',
        value: 'White, in every theme',
        kind: 'color',
        note: 'The code keeps its own surface. It is a machine target on your page, not a surface that should follow the theme.',
      },
      {
        n: 5,
        label: 'Error correction',
        value: 'M by default, H with a logo',
        kind: 'shape',
        note: 'Level M tolerates about 15% damage; H tolerates 30% and makes the symbol denser. Only raise it when something covers the centre.',
      },
      {
        n: 6,
        label: 'Logo area',
        value: '≤ 20% of the centre',
        kind: 'size',
        note: 'With a white gap around it. Past 20% even level H stops recovering reliably.',
      },
      {
        n: 7,
        label: 'The URL',
        value: 'Selectable text beside it',
        kind: 'type',
        note: 'The only route for anyone who cannot scan. Without it the code is a dead end for a screen-reader user or a laptop with no camera.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '#0a0b0e', usedFor: 'Modules — near-black rather than pure black, for print' },
    { category: 'color', token: '#ffffff', usedFor: 'The field and quiet zone, in every theme' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'An optional card edge, outside the quiet zone' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'The destination URL' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Expiry and helper text' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Corners of the white field, never of the modules' },
    { category: 'spacing', token: 'quiet zone', value: '4 modules', usedFor: 'Margin on every side — part of the code' },
    { category: 'typography', token: 'font-mono', usedFor: 'The URL, so it can be transcribed if it must be' },
  ],

  sizes: [
    { name: 'Minimum', height: '96px', use: 'About 4px per module for a 21-module symbol. Below this, scanning becomes unreliable.' },
    { name: 'Default', height: '128px', use: 'Comfortable on a laptop screen at a normal viewing distance.' },
    { name: 'Feature', height: '192px+', use: 'A dedicated pairing or hand-off screen where the code is the subject.' },
    { name: 'Print', minWidth: '2cm', use: 'The physical minimum for a phone camera at arm’s length. Larger for anything scanned from further away.' },
    { name: 'Quiet zone', gap: '4 modules', use: 'Non-negotiable. It scales with the module size, not with the pixel size.' },
    { name: 'Logo', maxWidth: '20% of the symbol', use: 'With a white gap around it, and error correction raised to H.' },
  ],

  do: [
    {
      title: 'Keep the full quiet zone',
      why: 'Four modules on every side is what lets a scanner find the symbol. Cropping it is the most common cause of a code that will not read, and the code still looks fine.',
      render: <QR size={96} quiet={4} />,
    },
    {
      title: 'Print the destination as text',
      why: 'A code is unreadable to a human. The URL beside it is the only route for anyone without a camera, and it costs one line.',
      render: (
        <Stack gap="xs" className="items-center">
          <QR size={72} />
          <code className="font-mono text-[10px] text-[var(--ds-fg-secondary)]">acme.dev/d/9fJk2Lm</code>
        </Stack>
      ),
    },
    {
      title: 'Keep the white field in dark mode',
      why: 'The code is a machine target, not a surface. Most scanners assume dark on light, and inverting fails on a meaningful share of devices.',
      render: (
        <span className="inline-block rounded-[var(--radius-lg)] bg-[var(--ds-surface)] p-2">
          <QR size={72} />
        </span>
      ),
    },
    {
      title: 'Raise correction only when you cover the centre',
      why: 'Level H tolerates 30% damage and makes the symbol denser. It is the price of a logo, not a default to reach for.',
      render: (
        <Row gap="lg">
          <Stack gap="xs" className="items-center">
            <QR size={64} />
            <span className="text-[10px] text-[var(--ds-fg-muted)]">M</span>
          </Stack>
          <Stack gap="xs" className="items-center">
            <QR size={64} logo />
            <span className="text-[10px] text-[var(--ds-fg-muted)]">H + logo</span>
          </Stack>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not crop the quiet zone',
      why: 'It is part of the specification. Removing it to make the code sit tighter in a layout is the most common way a working code stops working.',
      render: <QR size={96} quiet={0} />,
    },
    {
      title: 'Do not invert for dark mode',
      why: 'Most scanners expect dark modules on a light field. An inverted code fails silently on a large fraction of phones, and the user blames their camera.',
      render: <QR size={96} inverted />,
    },
    {
      title: 'Do not tint the modules',
      why: 'The contrast between module and field is what makes it readable. A brand-coloured code trades a real function for a decorative one.',
      render: (
        <span className="inline-block" style={{ filter: 'hue-rotate(220deg) saturate(3)' }}>
          <QR size={96} />
        </span>
      ),
    },
    {
      title: 'Do not show one to a phone user',
      why: 'Nobody scans a code with the device displaying it. On a small viewport the same value should be a link or a copy button.',
      render: (
        <span className="grid h-24 w-16 place-items-center rounded-[var(--radius-lg)] border border-[var(--ds-danger-border)] p-1">
          <QR size={48} />
        </span>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.5', name: 'Images of Text', level: 'AA' },
      { id: '2.5.8', name: 'Target Size (Minimum)', level: 'AA' },
    ],
    contrast: [
      'Module to field contrast must be as close to maximum as possible. This is a machine-vision requirement, and it is stricter than any WCAG ratio.',
      'The code keeps a white field in dark mode. Contrast against the page is the container’s problem, not the code’s.',
      'The URL beside it is content and owes 4.5:1.',
      'In forced-colors mode the code must be exempt — a QR rendered in system colours is not scannable.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Reaches the copy and download controls beside the code. The code itself is not focusable.' },
      { keys: 'Enter', does: 'Copies the destination, which is what a keyboard user actually needs from this component.' },
    ],
    aria: [
      { attr: 'role="img"', on: 'The SVG', note: 'With aria-label naming the destination: "QR code linking to acme.dev/d/9fJk2Lm". "QR code" alone is useless.' },
      { attr: 'Visible text', on: 'Beside the code', note: 'The most important accessibility feature here. A code with no readable destination is a dead end.' },
      { attr: 'aria-describedby', on: 'The code', note: 'Pointing at expiry or instructions, so the constraints are announced with it.' },
      { attr: 'aria-live="polite"', on: 'A refreshing code', note: 'Announce regeneration: "Code refreshed". A silently changing code is disorienting.' },
    ],
    focus:
      'The code is not interactive and never focusable. The copy and download controls beside it are, and they are what make the component usable without a camera.',
    screenReader: [
      'Announce the destination, not the format: "QR code linking to acme.dev/d/9fJk2Lm".',
      'The readable URL is the real accessibility feature. Everything else is a convenience for people who can point a camera at a screen.',
      'If the code expires, say so in text as well as visually — a code that stopped working with no explanation is unexplainable.',
    ],
    touch:
      'On a phone, do not show the code at all — nobody scans a screen with the device rendering it. Detect the viewport and offer a link or a copy button instead. If the code must appear for a hand-off to a second device, keep it at least 128px so the other camera can resolve the modules.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { QrCode } from '@/ui/Display'

<Row>
  <QrCode value={pairingUrl} size={128} />
  <Stack>
    <span>Open on your phone</span>
    {/* The only route for anyone who cannot scan. Never omit it. */}
    <code>{pairingUrl}</code>
    <CopyButton value={pairingUrl} label="Copy link" />
  </Stack>
</Row>

// Nobody scans a code with the device displaying it.
const isPhone = useMediaQuery('(max-width: 640px)')
{isPhone ? <Link href={pairingUrl}>Continue</Link> : <QrCode value={pairingUrl} />}

// Error correction is a trade, not a default. M is right until something
// covers the centre; H makes the symbol denser.
<QrCode
  value={url}
  errorCorrection={logo ? 'H' : 'M'}
  logo={logo}                     // ≤ 20% of the symbol, with a white gap
/>

// The code keeps its own white field in every theme — it is a machine target
// on your page, not a surface that follows the theme.
<div className="rounded-lg bg-white p-3">
  <QrCode value={url} />
</div>

// A refreshing code must announce itself, or it changes silently mid-scan.
<p role="status" aria-live="polite" className="sr-only">Code refreshed</p>`,
    },
    html: {
      lang: 'html',
      code: `<figure class="ds-qr">
  <!-- Name the DESTINATION. "QR code" on its own is useless. -->
  <svg
    role="img"
    aria-label="QR code linking to acme.dev/d/9fJk2Lm"
    aria-describedby="qr-expiry"
    viewBox="0 0 29 29"
    shape-rendering="crispEdges"
  >
    <!-- The quiet zone is part of the code: 4 modules on every side. -->
    <rect width="29" height="29" fill="#ffffff" />
    <g transform="translate(4 4)">…</g>
  </svg>

  <figcaption>
    <p>Open on your phone</p>
    <!-- The real accessibility feature. -->
    <code>https://acme.dev/d/9fJk2Lm</code>
    <p id="qr-expiry">Expires in 10 minutes</p>
  </figcaption>
</figure>`,
    },
    css: {
      lang: 'css',
      code: `.ds-qr svg {
  /* The code keeps its own field in every theme: it is a machine target
     that happens to be on your page. */
  background: #ffffff;
  border-radius: var(--radius-md);
  /* Modules are squares. Anti-aliasing softens their edges and costs
     scan reliability at small sizes. */
  shape-rendering: crispEdges;
  /* About 4px per module for a 21-module symbol. */
  min-inline-size: 96px;
}

/* On the container, never inside the quiet zone. */
.ds-qr { padding: 8px; background: #fff; border-radius: var(--radius-lg); }

.ds-qr code {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ds-fg-secondary);
  word-break: break-all;             /* a long URL must stay fully visible */
}

/* A QR rendered in system colours is not scannable. */
@media (forced-colors: active) {
  .ds-qr svg { forced-color-adjust: none; }
}

/* Nobody scans a screen with the device rendering it. */
@media (max-width: 640px) {
  .ds-qr__code { display: none; }
  .ds-qr__link { display: block; }
}

/* Print is where codes are most useful, and printers drop backgrounds by
   default. */
@media print {
  .ds-qr svg { background: #fff !important; print-color-adjust: exact; }
}`,
    },
    api: [
      {
        name: 'QrCode',
        props: [
          { name: 'value', type: 'string', required: true, description: 'The encoded value. Keep it short — a long URL means more modules and a denser, harder-to-scan symbol.' },
          { name: 'size', type: 'number', default: '128', description: 'Pixels. 96 is the practical floor for reliable scanning on screen.' },
          { name: 'errorCorrection', type: "'L' | 'M' | 'Q' | 'H'", default: "'M'", description: 'H only when a logo covers the centre. Higher levels make the symbol denser.' },
          { name: 'quietZone', type: 'number', default: '4', description: 'Modules of margin. Reducing it is the most common cause of a code that will not read.' },
          { name: 'logo', type: 'ReactNode', description: 'Centred, at most 20% of the symbol, with a white gap. Requires level H.' },
          { name: 'label', type: 'string', description: 'The accessible name. Defaults to "QR code linking to {value}".' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Keep the encoded URL short. Every extra character adds modules, and a denser symbol is harder to scan at the same physical size — use a short link, not the canonical one.',
      'Show an expiry when the code is a session or a pairing token, and refresh it before it lapses rather than after.',
      'Offer a download for print, and export SVG rather than PNG so it stays sharp at any physical size.',
      'Test on real hardware, at arm’s length, in poor light. A code that scans in a design review at 20cm may fail on a wall at two metres.',
      'For Wi-Fi credentials, use the WIFI: URI scheme rather than a URL — the phone joins the network directly instead of opening a browser.',
    ],
    performance: [
      'Generate the SVG on the client and cache it by value. Fetching a code from a rendering service is a network round trip for something computable locally.',
      'Prefer SVG over canvas: it scales, it prints sharply, and it is smaller than a PNG at any useful size.',
      'Only regenerate when the value changes. A code that re-renders on every parent update flickers at exactly the moment someone is aiming a camera at it.',
      'Do not animate a QR code. Any motion during a scan is a failed scan.',
    ],
    mistakes: [
      'Cropping the quiet zone, which breaks scanning while looking correct.',
      'Inverting for dark mode, which fails on a large share of scanners.',
      'Tinting the modules, trading a real function for decoration.',
      'A logo larger than 20% of the symbol, past what even level H can recover.',
      'No readable URL, leaving anyone without a camera with a dead end.',
      'Showing a code on a phone, where nobody can scan it.',
      'aria-label of "QR code" with no destination.',
      'Encoding a very long URL, producing a symbol too dense to scan at the size shown.',
    ],
    realWorld: [
      'Codes work best in genuine hand-off moments: desktop to phone, screen to scanner, print to camera. Outside those, a link is almost always better.',
      'The most valuable part of the component is the readable URL beside it. It handles every case where scanning is impossible, and it costs one line.',
      'Two-factor enrolment is the archetype: a long secret, a device that cannot type it, and a scanner already open. That is where the pattern earns its place.',
      'Print is where quiet zones die. Layout tools crop them, and the failure only shows up after the run — check the artwork, not the screen.',
    ],
  },
})
