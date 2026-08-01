import * as React from 'react'
import { Building2, User } from 'lucide-react'
import { Avatar, AvatarStack, Badge } from '@/ui/Display'
import { Cell, Grid, Knob, KnobSelect, KnobToggle, PreviewStage, Row, Stack, defineDoc } from '../framework/kit'

const PEOPLE = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Alan Turing' },
  { name: 'Katherine Johnson' },
  { name: 'Barbara Liskov' },
  { name: 'Margaret Hamilton' },
]

function Playground() {
  const [size, setSize] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg')
  const [status, setStatus] = React.useState<'none' | 'online' | 'away' | 'busy'>('online')
  const [square, setSquare] = React.useState(false)
  const [withImage, setWithImage] = React.useState(false)

  return (
    <PreviewStage
      label="Playground"
      minHeight={170}
      controls={
        <div className="flex flex-wrap items-center gap-2.5">
          <Knob label="Size">
            <KnobSelect
              value={size}
              onChange={setSize}
              options={['xs', 'sm', 'md', 'lg', 'xl'] as const}
            />
          </Knob>
          <Knob label="Status">
            <KnobSelect
              value={status}
              onChange={setStatus}
              options={['none', 'online', 'away', 'busy'] as const}
            />
          </Knob>
          <KnobToggle checked={square} onChange={setSquare} label="Square" />
          <KnobToggle checked={withImage} onChange={setWithImage} label="Broken image" />
        </div>
      }
      code={`<Avatar
  name="Ada Lovelace"
  size="${size}"${withImage ? '\n  src="/broken.jpg"' : ''}${status !== 'none' ? `\n  status="${status}"` : ''}${square ? '\n  square' : ''}
/>`}
    >
      <Row gap="lg" align="center">
        <Avatar
          name="Ada Lovelace"
          size={size}
          // A broken src must fall back to initials, not to a broken-image icon.
          src={withImage ? '/does-not-exist.jpg' : undefined}
          status={status === 'none' ? undefined : status}
          square={square}
        />
        <Stack gap="xs">
          <span className="text-label text-[var(--ds-fg)]">Ada Lovelace</span>
          <span className="text-caption text-[var(--ds-fg-muted)]">
            {withImage ? 'Image failed — initials shown' : 'Initials from the name'}
          </span>
        </Stack>
      </Row>
    </PreviewStage>
  )
}

export default defineDoc({
  meta: {
    id: 'avatar',
    title: 'Avatar',
    tagline:
      'A person or entity reduced to one glyph. Image, initials, fallback order, presence, and stacked groups.',
    keywords: ['profile picture', 'user image', 'gravatar', 'initials', 'presence', 'stack', 'fallback'],
  },

  overview: {
    purpose:
      'An avatar identifies a person or an entity in the smallest space that still supports recognition. Its real job is the fallback chain: most users have no photo, so the component has to degrade from image to initials to a generic glyph without ever showing a broken image — and the initials have to be readable at 20px.',
    whenToUse: [
      'Identifying the author of a comment, a commit, an activity item.',
      'Showing who is in a conversation, a team or a review.',
      'Anywhere a name would be repeated so often that the text becomes noise.',
      'Representing an organisation or a project, in a square rather than a circle.',
    ],
    whenNotToUse: [
      {
        text: 'The name is the primary content.',
        instead: 'text — an avatar beside a single prominent name is decoration',
        to: '#/typography',
      },
      {
        text: 'The image is content the user needs to see.',
        instead: 'an Image, at a size where it can actually be seen',
        to: '#/image',
      },
      {
        text: 'It represents a status or a category rather than an entity.',
        instead: 'a Badge or an Icon',
        to: '#/badge',
      },
      {
        text: 'You are showing more than about six people.',
        instead: 'a stack with a "+9" counter, or a List',
        to: '#/list',
      },
    ],
    reasoning: (
      <>
        <p>
          The <strong>fallback chain is the component</strong>: image, then initials, then a
          generic glyph. A broken image icon is the one outcome that must never happen, and it is
          the default behaviour of an <code>&lt;img&gt;</code> — so the error handler is not
          optional, it is the main path for most users.
        </p>
        <p>
          Initials are harder than they look. Two characters is the ceiling at every size; three
          are illegible at 24px. Names do not reliably split on spaces —{' '}
          <code>van der Berg</code>, <code>李</code>, a single mononym — so take the first
          grapheme of the first and last parts and accept that some names yield one character.
        </p>
        <p>
          <strong>Colour must not be the identity.</strong> Deriving a background from a hash of
          the name is useful for scanning, but two people will collide, and colour alone is
          unreadable for anyone who cannot distinguish it. The initials carry the meaning; the
          colour only helps.
        </p>
      </>
    ),
  },

  preview: {
    render: <Playground />,
    examples: [
      {
        id: 'fallback',
        title: 'The fallback chain',
        description:
          'Image, initials, generic glyph. The broken-image icon is the one outcome that must never reach the screen, and it is the browser default.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="12rem">
              <Cell label="Image" tone="good">
                <Avatar name="Ada Lovelace" size="lg" src="/does-not-exist.jpg" />
              </Cell>
              <Cell label="Initials" tone="good">
                <Avatar name="Grace Hopper" size="lg" />
              </Cell>
              <Cell label="Unknown" tone="good">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ds-layer-active)] text-[var(--ds-fg-muted)]">
                  <User size={18} />
                </span>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
      {
        id: 'sizes',
        title: 'Sizes',
        description:
          'Below 20px initials stop being legible and the avatar becomes a coloured dot. That is the floor — anything smaller should be a Badge.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Row gap="lg" align="center">
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <Stack key={s} gap="xs" className="items-center">
                  <Avatar name="Ada Lovelace" size={s} />
                  <span className="text-caption text-[var(--ds-fg-muted)]">{s}</span>
                </Stack>
              ))}
            </Row>
          </PreviewStage>
        ),
      },
      {
        id: 'stack',
        title: 'Stacked groups',
        description:
          'Overlapped by about a third with a ring in the surface colour, so each face stays separable. Past four, count the rest.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Stack gap="lg" className="items-center">
              <AvatarStack people={PEOPLE.slice(0, 3)} size="md" />
              <AvatarStack people={PEOPLE} max={4} size="md" />
              <Row gap="sm" align="center">
                <AvatarStack people={PEOPLE} max={3} size="sm" />
                <span className="text-caption text-[var(--ds-fg-muted)]">
                  Ada, Grace, Alan and 3 others
                </span>
              </Row>
            </Stack>
          </PreviewStage>
        ),
      },
      {
        id: 'shape',
        title: 'Round for people, square for things',
        description:
          'A durable convention: circles are people, rounded squares are organisations, repositories and projects. Mixing them makes a list unscannable.',
        render: (
          <PreviewStage minHeight={0} allowResize={false} center={false}>
            <Grid min="14rem">
              <Cell label="People" tone="good">
                <Row gap="sm">
                  {PEOPLE.slice(0, 3).map((p) => (
                    <Avatar key={p.name} name={p.name} size="md" />
                  ))}
                </Row>
              </Cell>
              <Cell label="Organisations" tone="good">
                <Row gap="sm">
                  <Avatar name="Acme Corp" size="md" square />
                  <Avatar name="Globex" size="md" square />
                  <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-layer-active)] text-[var(--ds-fg-muted)]">
                    <Building2 size={15} />
                  </span>
                </Row>
              </Cell>
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      { label: 'Initials', render: <Avatar name="Ada Lovelace" size="lg" /> },
      { label: 'Broken image', render: <Avatar name="Grace Hopper" size="lg" src="/nope.jpg" /> },
      { label: 'Square', render: <Avatar name="Acme Corp" size="lg" square /> },
      { label: 'Online', render: <Avatar name="Ada Lovelace" size="lg" status="online" /> },
      { label: 'Away', render: <Avatar name="Ada Lovelace" size="lg" status="away" /> },
      { label: 'Busy', render: <Avatar name="Ada Lovelace" size="lg" status="busy" /> },
      { label: 'Offline', render: <Avatar name="Ada Lovelace" size="lg" status="offline" /> },
      {
        label: 'Unknown',
        render: (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ds-layer-active)] text-[var(--ds-fg-muted)]">
            <User size={18} />
          </span>
        ),
      },
      { label: 'Stack', render: <AvatarStack people={PEOPLE} max={3} size="md" /> },
      {
        label: 'With badge',
        render: (
          <span className="relative inline-block">
            <Avatar name="Ada Lovelace" size="lg" />
            <Badge tone="danger" size="sm" className="absolute -right-1 -top-1">
              3
            </Badge>
          </span>
        ),
      },
    ],
  },

  anatomy: {
    render: (
      <Row gap="lg" align="center">
        <Avatar name="Ada Lovelace" size="xl" status="online" />
        <AvatarStack people={PEOPLE} max={4} size="lg" />
      </Row>
    ),
    caption:
      'A circle carrying initials, a presence dot ringed in the surface colour, and a stack overlapped by a third with a counter for the rest.',
    parts: [
      {
        n: 1,
        label: 'Shape',
        value: 'Circle, or 8px square',
        kind: 'shape',
        note: 'Circles are people; rounded squares are organisations and projects. The convention is strong enough that breaking it makes a mixed list unscannable.',
      },
      {
        n: 2,
        label: 'Initials',
        value: 'Max 2 characters',
        kind: 'type',
        note: 'Two at every size. Three are illegible at 24px, and names do not reliably yield three meaningful parts anyway.',
      },
      {
        n: 3,
        label: 'Type scale',
        value: '~40% of the diameter',
        kind: 'type',
        note: 'Scales with the avatar rather than stepping, so a 20px and a 56px avatar look like the same component.',
      },
      {
        n: 4,
        label: 'Background',
        value: 'Derived from the name',
        kind: 'color',
        note: 'A hash into the visualisation palette. It aids scanning and is never the identity — two people will collide.',
      },
      {
        n: 5,
        label: 'Presence dot',
        value: '~28% of the diameter',
        kind: 'size',
        note: 'Ringed in the surface colour so it separates from the avatar beneath, and positioned at the bottom-right where a face is least informative.',
      },
      {
        n: 6,
        label: 'Stack overlap',
        value: '−33%, with a 2px ring',
        kind: 'space',
        note: 'A third is enough to read as a group while keeping each face separable. The ring is what stops two adjacent avatars merging.',
      },
      {
        n: 7,
        label: 'Stack order',
        value: 'First on top',
        kind: 'shape',
        note: 'The first avatar overlaps the second, so reading order matches visual order. Reversed z-index makes the last person appear most prominent.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--p-viz-1 … --p-viz-8', usedFor: 'Name-derived background — categorical, never status' },
    { category: 'color', token: '--ds-layer-active', usedFor: 'The unknown-entity fallback' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'The generic person glyph' },
    { category: 'color', token: '--ds-surface', usedFor: 'The ring around a presence dot and around stacked avatars' },
    { category: 'color', token: '--ds-success', usedFor: 'Online presence' },
    { category: 'color', token: '--ds-warning', usedFor: 'Away presence' },
    { category: 'color', token: '--ds-danger', usedFor: 'Busy presence' },
    { category: 'radius', token: 'full', usedFor: 'People' },
    { category: 'radius', token: '--radius-md', value: '8px', usedFor: 'Organisations and projects' },
    { category: 'typography', token: 'weight', value: '600', usedFor: 'Initials, which are small and need the weight' },
  ],

  sizes: [
    { name: 'xs', height: '20px', type: '9px', use: 'Inside a Chip or a dense table cell. The floor for legible initials.' },
    { name: 'sm', height: '24px', type: '10px', use: 'Table rows and inline mentions.' },
    { name: 'md', height: '32px', type: '11px', use: 'The default. List rows and comment authors.' },
    { name: 'lg', height: '40px', type: '13px', use: 'Card headers and hover cards.' },
    { name: 'xl', height: '56px', type: '18px', use: 'A profile header, where the avatar is the subject.' },
    { name: 'Presence dot', height: '~28% of diameter', use: 'With a 2px ring in the surface colour. Below 20px there is no room for it.' },
  ],

  do: [
    {
      title: 'Fall back to initials, never to a broken image',
      why: 'Most users have no photo and some URLs fail. The browser’s default for both is a broken-image icon, which looks like the product is broken.',
      render: (
        <Row gap="sm" align="center">
          <Avatar name="Ada Lovelace" size="md" src="/nope.jpg" />
          <span className="text-caption text-[var(--ds-fg-muted)]">src failed → initials</span>
        </Row>
      ),
    },
    {
      title: 'Cap initials at two characters',
      why: 'Three are illegible at 24px, and names do not reliably yield three meaningful parts. Two works for almost every name in the world.',
      render: (
        <Row gap="sm">
          <Avatar name="Ada Lovelace" size="md" />
          <Avatar name="李" size="md" />
          <Avatar name="Margaret Heafield Hamilton" size="md" />
        </Row>
      ),
    },
    {
      title: 'Ring stacked avatars in the surface colour',
      why: 'Without the ring, two adjacent avatars merge into one shape and the group becomes uncountable.',
      render: <AvatarStack people={PEOPLE} max={4} size="md" />,
    },
    {
      title: 'Put the name in text, not only in the avatar',
      why: 'Initials are recognition aids, not identification. A list of avatars with no names is a puzzle for everyone and unusable without sight.',
      render: (
        <Row gap="sm" align="center">
          <Avatar name="Ada Lovelace" size="sm" />
          <span className="text-label-sm text-[var(--ds-fg-secondary)]">Ada Lovelace</span>
        </Row>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not use colour as the identity',
      why: 'Two people will hash to the same colour, and colour alone is unreadable for anyone who cannot distinguish it. The initials carry the meaning.',
      render: (
        <Row gap="sm">
          {['#6366f1', '#6366f1', '#10b981'].map((c, i) => (
            <span key={i} className="block h-8 w-8 rounded-full" style={{ background: c }} />
          ))}
        </Row>
      ),
    },
    {
      title: 'Do not go below 20px',
      why: 'Initials stop being legible and the avatar becomes a coloured dot that identifies nobody. If that is all the space there is, use text.',
      render: (
        <Row gap="sm" align="center">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--p-viz-1)] text-[6px] font-semibold text-white">
            AL
          </span>
          <span className="text-caption text-[var(--ds-danger-text)]">14px — unreadable</span>
        </Row>
      ),
    },
    {
      title: 'Do not mix circles and squares in one list',
      why: 'The shape carries meaning. A list alternating people and organisations with no shape distinction takes real effort to scan.',
      render: (
        <Row gap="sm">
          <Avatar name="Ada Lovelace" size="md" />
          <Avatar name="Acme Corp" size="md" />
          <Avatar name="Grace Hopper" size="md" square />
          <Avatar name="Globex" size="md" />
        </Row>
      ),
    },
    {
      title: 'Do not stack more than about five',
      why: 'Past five the overlap hides most of each face and the group stops being countable. Show four and count the rest.',
      render: (
        <div className="flex -space-x-3">
          {[...PEOPLE, ...PEOPLE].map((p, i) => (
            <span key={i} className="ring-2 ring-[var(--ds-surface)]">
              <Avatar name={p.name} size="sm" />
            </span>
          ))}
        </div>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.1.1', name: 'Non-text Content', level: 'A' },
      { id: '1.4.1', name: 'Use of Color', level: 'A' },
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
    ],
    contrast: [
      'Initials must reach 4.5:1 against their derived background. A palette generated by hashing will produce failures unless the foreground is chosen per swatch.',
      'The presence dot needs its 2px ring to reach 3:1 against whatever is beneath — the avatar itself is an unpredictable background.',
      'Presence must not rely on colour alone: an accessible label carries the state, since green and amber are indistinguishable for many users at 8px.',
      'A stack ring owes 3:1 against the adjacent avatar, or the group merges into one shape.',
    ],
    keyboard: [
      { keys: 'Tab', does: 'Nothing — an avatar is not interactive on its own.' },
      { keys: 'Tab', does: 'Reaches it only when it is inside a link or a button, in which case that ancestor carries the name and the focus ring.' },
    ],
    aria: [
      { attr: 'alt', on: 'The image', note: 'The person’s name, not "avatar" or "profile picture". If the name is already beside it, alt="" and let the text speak.' },
      { attr: 'aria-hidden', on: 'A decorative avatar', note: 'When the name is right next to it, the avatar is duplication — hide it rather than announcing the name twice.' },
      { attr: 'aria-label', on: 'The presence dot', note: '"Online". A coloured dot with no label is meaningless to a screen reader and to many sighted users.' },
      { attr: 'aria-label', on: 'A stack', note: '"Ada, Grace, Alan and 3 others". Six unlabelled images is six announcements of nothing.' },
      { attr: 'role="img"', on: 'An initials avatar', note: 'With aria-label naming the person. Two letters read literally are "A, L", which identifies nobody.' },
    ],
    focus:
      'An avatar is never focusable on its own. When it opens a profile it is inside a link or a button, and that ancestor carries the accessible name and the focus ring — never the image.',
    screenReader: [
      'Avoid announcing the name twice. If the name is beside the avatar, the avatar should be silent.',
      'A stack announces once, as a group: "Ada, Grace, Alan and 3 others" beats six separate images.',
      'Presence needs a text equivalent. "Ada Lovelace, online" is one announcement; a green dot is none.',
    ],
    touch:
      'An avatar that opens something needs a 44px target, which usually means padding around a 32px avatar rather than a larger avatar. In a stack, only the counter should be interactive — overlapping targets are ambiguous to hit and impossible to describe.',
  },

  code: {
    usage: {
      lang: 'tsx',
      code: `import { Avatar, AvatarStack } from '@/ui/Display'

<Avatar name="Ada Lovelace" src={user.avatarUrl} size="md" status="online" />

<AvatarStack people={reviewers} max={4} size="sm" />

// The fallback chain IS the component. A broken-image icon must never reach
// the screen, and it is the browser's default for a failed src.
function Avatar({ name, src, size }: AvatarProps) {
  const [failed, setFailed] = React.useState(false)
  const showImage = src && !failed

  return (
    <span role="img" aria-label={name} className={cls(size)}>
      {showImage ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        initials(name) || <UserIcon aria-hidden />
      )}
    </span>
  )
}

// Names do not split reliably. "van der Berg", "李", a mononym — take the
// first grapheme of the first and last parts and accept one character.
function initials(name: string) {
  const parts = name.trim().split(/\\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  const first = [...parts[0]][0] ?? ''
  const last = parts.length > 1 ? ([...parts[parts.length - 1]][0] ?? '') : ''
  return (first + last).toUpperCase()
}

// Colour aids scanning; it is never the identity. Two people will collide.
function hue(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) % VIZ_COLORS.length
  return VIZ_COLORS[h]
}`,
    },
    html: {
      lang: 'html',
      code: `<!-- With an image: the name is the alt text, never "avatar". -->
<span class="ds-avatar ds-avatar--md">
  <img src="/u/ada.jpg" alt="Ada Lovelace" />
</span>

<!-- Initials: role="img" with a label, because "A L" identifies nobody. -->
<span class="ds-avatar ds-avatar--md" role="img" aria-label="Grace Hopper"
      style="--avatar-bg: var(--p-viz-3)">
  <span aria-hidden="true">GH</span>
</span>

<!-- Beside the name, the avatar is duplication: hide it. -->
<div class="ds-row">
  <span class="ds-avatar" aria-hidden="true"><img src="/u/ada.jpg" alt="" /></span>
  <span>Ada Lovelace</span>
</div>

<!-- Presence needs a text equivalent. -->
<span class="ds-avatar">
  <img src="/u/ada.jpg" alt="Ada Lovelace" />
  <span class="ds-avatar__status" data-status="online">
    <span class="sr-only">Online</span>
  </span>
</span>

<!-- One announcement for the group, not six. -->
<span class="ds-avatar-stack" role="img"
      aria-label="Ada, Grace, Alan and 3 others">…</span>`,
    },
    css: {
      lang: 'css',
      code: `.ds-avatar {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 999px;              /* circles are people */
  background: var(--avatar-bg, var(--ds-layer-active));
  color: #fff;
  font-weight: 600;                  /* initials are small and need it */
  overflow: hidden;
  user-select: none;
}

/* Rounded squares are organisations, repositories and projects. */
.ds-avatar--square { border-radius: var(--radius-md); }

/* Scales with the avatar rather than stepping, so 20px and 56px read as the
   same component. */
.ds-avatar { font-size: calc(var(--avatar-size) * 0.4); }

.ds-avatar img {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;                 /* never squash a non-square photo */
}

/* The ring separates the dot from an unpredictable background. */
.ds-avatar__status {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
  inline-size: calc(var(--avatar-size) * 0.28);
  block-size: calc(var(--avatar-size) * 0.28);
  border-radius: 999px;
  box-shadow: 0 0 0 2px var(--ds-surface);
}
.ds-avatar__status[data-status='online'] { background: var(--ds-success); }
.ds-avatar__status[data-status='away']   { background: var(--ds-warning); }
.ds-avatar__status[data-status='busy']   { background: var(--ds-danger); }

/* A third of overlap: enough to read as a group, enough to stay separable. */
.ds-avatar-stack { display: inline-flex; }
.ds-avatar-stack > * + * { margin-inline-start: -33%; }
.ds-avatar-stack > * {
  box-shadow: 0 0 0 2px var(--ds-surface);
  /* First on top, so reading order matches visual order. */
  position: relative;
}`,
    },
    api: [
      {
        name: 'Avatar',
        props: [
          { name: 'name', type: 'string', required: true, description: 'Drives the initials, the derived colour and the accessible label. Required even when an image is present.' },
          { name: 'src', type: 'string', description: 'Falls back to initials on error. The onError handler is the main path for most users.' },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: '20px to 56px. Below xs, initials stop being legible.' },
          { name: 'square', type: 'boolean', default: 'false', description: 'For organisations, repositories and projects. Circles are for people.' },
          { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Adds a ringed presence dot with a visually hidden label.' },
        ],
      },
      {
        name: 'AvatarStack',
        props: [
          { name: 'people', type: '{ name: string; src?: string }[]', required: true, description: 'In reading order. The first is rendered on top.' },
          { name: 'max', type: 'number', default: '4', description: 'Past this, a "+n" counter. Five is the practical ceiling before faces stop being separable.' },
          { name: 'size', type: "'xs' | 'sm' | 'md'", default: "'sm'", description: 'Stacks are dense by nature; larger sizes overlap too much to read.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Serve avatars at twice their display size for high-density screens and no larger. A 512px image rendered at 32px is 250 KB thrown away.',
      'Cache the derived colour per user id rather than recomputing the hash on every render — it also keeps the colour stable if the display name changes.',
      'Show the full name on hover via a Tooltip in dense lists, and always have the name in text somewhere for touch users.',
      'For organisations, prefer a logo over initials where one exists, but keep the same square shape so the list stays scannable.',
      'Uploaded avatars should be cropped to a square on the client before upload. A component that squashes non-square photos is a component nobody trusts with their face.',
    ],
    performance: [
      'Lazy-load avatars below the fold, but never the ones in the viewport — a page of empty circles filling in is worse than a slightly later paint.',
      'Use a sprite or a single request for a stack rather than six separate image requests in a table with fifty rows.',
      'Render initials as text, not as generated SVG or canvas. Text is cached, scalable, selectable by the accessibility tree and free.',
      'Set explicit width and height so a late-loading image does not shift the row it sits in.',
    ],
    mistakes: [
      'No onError handler, so a failed image shows the browser’s broken-image icon.',
      'Three or more initials, illegible at small sizes.',
      'alt="avatar" instead of the person’s name.',
      'The name announced twice — once by the avatar and once by the text beside it.',
      'Colour as the only identity signal, which collides and fails in greyscale.',
      'Avatars below 20px, where initials become an unreadable smudge.',
      'A presence dot with no accessible label.',
      'object-fit missing, squashing every non-square photo.',
    ],
    realWorld: [
      'Most users never upload a photo. The initials path is the main path, not the fallback, and it deserves the majority of the design attention.',
      'Name-derived colours are genuinely useful for scanning a long activity feed — but only alongside the initials, never instead of them.',
      'Stacked avatars work best at three or four. Past that people stop counting and start reading it as "a lot", at which point the number is doing the work.',
      'Square avatars for organisations is one of the most reliable conventions in product UI. Users pick it up without being told, and breaking it is immediately disorienting.',
    ],
  },
})
