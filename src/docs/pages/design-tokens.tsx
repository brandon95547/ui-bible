import * as React from 'react'
import { ArrowDown } from 'lucide-react'
import { Badge } from '@/ui/Display'
import { Callout } from '@/ui/Surface'
import { CodeBlock, Grid, PreviewStage, Row, Stack, Swatch, defineDoc } from '../framework/kit'

const TIERS = [
  {
    tier: '1',
    name: 'Primitive',
    prefix: '--p-*',
    tone: 'neutral' as const,
    example: '--p-brand-500: #7c6cff',
    rule: 'Raw values with no meaning attached. A number in a ramp. Never referenced by a component, ever.',
  },
  {
    tier: '2',
    name: 'Semantic',
    prefix: '--ds-*',
    tone: 'accent' as const,
    example: '--ds-accent: var(--p-brand-500)',
    rule: 'Meaning, not appearance. This is the only tier a component is allowed to read, and the only tier a theme is allowed to change.',
  },
  {
    tier: '3',
    name: 'Component',
    prefix: '--c-*',
    tone: 'success' as const,
    example: '--c-btn-padding-x: 14px',
    rule: 'A single component’s private overrides. Must reference tier 2. Exists so one component can deviate without forking the system.',
  },
]

function TierDiagram() {
  return (
    <Stack gap="sm" className="w-full max-w-2xl">
      {TIERS.map((t, i) => (
        <React.Fragment key={t.tier}>
          <div className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--ds-surface-inset)] font-mono text-label text-[var(--ds-fg-secondary)]">
              {t.tier}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-label text-[var(--ds-fg)]">{t.name}</span>
                <Badge tone={t.tone} size="sm">
                  {t.prefix}
                </Badge>
              </div>
              <code className="font-mono text-[11.5px] text-[var(--ds-accent-text)]">
                {t.example}
              </code>
              <p className="text-caption leading-relaxed text-[var(--ds-fg-muted)]">{t.rule}</p>
            </div>
          </div>
          {i < TIERS.length - 1 && (
            <div className="flex justify-center py-0.5" aria-hidden>
              <ArrowDown size={14} className="text-[var(--ds-fg-disabled)]" />
            </div>
          )}
        </React.Fragment>
      ))}
    </Stack>
  )
}

function ThemeSwapDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['dark', 'light'] as const).map((t) => (
        <div
          key={t}
          data-theme={t}
          className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--ds-border)] bg-[var(--ds-canvas)] p-4"
        >
          <span className="text-overline uppercase text-[var(--ds-fg-muted)]">{t}</span>
          <div className="rounded-[var(--radius-md)] border border-[var(--ds-border-subtle)] bg-[var(--ds-surface)] p-3">
            <p className="text-label text-[var(--ds-fg)]">Same markup</p>
            <p className="mt-1 text-caption text-[var(--ds-fg-muted)]">
              Not one class changed. Only <code className="font-mono">--ds-*</code> moved.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-[var(--radius-sm)] bg-[var(--ds-accent)] px-2.5 py-1 text-caption text-[var(--ds-accent-fg)]">
              Accent
            </span>
            <span className="rounded-[var(--radius-sm)] bg-[var(--ds-success-subtle)] px-2.5 py-1 text-caption text-[var(--ds-success-text)]">
              Success
            </span>
            <span className="rounded-[var(--radius-sm)] bg-[var(--ds-danger-subtle)] px-2.5 py-1 text-caption text-[var(--ds-danger-text)]">
              Danger
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

export default defineDoc({
  meta: {
    id: 'design-tokens',
    title: 'Design Tokens',
    group: 'Foundations',
    tagline:
      'Three tiers, one direction of reference. Every colour, size, radius, shadow and duration in this Bible resolves to a token — and every token resolves to a reason.',
    keywords: ['variables', 'theming', 'css custom properties', 'primitives', 'semantic', 'alias'],
  },

  overview: {
    purpose:
      'A design token is a named decision. Instead of a component knowing that a border is #FFFFFF1C, it knows the border is --ds-border — and the system decides what that means in this theme, on this platform, at this moment. Tokens are how a design survives contact with fifty engineers and three years.',
    whenToUse: [
      'Always. Every value a component renders should come from a token or be derived from one.',
      'When a value appears in more than one place — that is the definition of a decision worth naming.',
      'When a value must change per theme, per brand, or per density.',
      'When you want a value to be inspectable and auditable rather than buried in a class list.',
    ],
    whenNotToUse: [
      {
        text: 'A truly one-off value with no meaning beyond a single element, such as a hero illustration’s exact offset.',
        instead: 'a literal, with a comment explaining why it is exempt',
      },
      {
        text: 'A value derived arithmetically from another token at runtime.',
        instead: 'calc() on the existing token',
      },
      {
        text: 'A new colour invented because none of the existing ones "felt right".',
        instead: 'the closest existing semantic token',
      },
    ],
    reasoning: (
      <>
        <p>
          Most design systems fail in the same way: a component needs a colour that does not exist,
          someone pastes a hex, and six months later there are forty greys that are all almost the
          same. The three-tier model exists specifically to make that shortcut impossible to take
          accidentally.
        </p>
        <p>
          The critical rule is <strong>direction</strong>. Tier 3 may read tier 2. Tier 2 may read
          tier 1. Nothing ever reads upward, and a component never reaches past tier 2. The moment a
          component references <code>--p-brand-500</code> directly, it has hard-coded an appearance
          into something that was supposed to express intent — it will look correct in dark mode and
          wrong in light mode, and nobody will know why.
        </p>
        <p>
          Semantic names describe <em>role</em>, never <em>appearance</em>. <code>--ds-danger</code>{' '}
          is right; <code>--ds-red</code> is wrong, because the day danger becomes orange you are
          left with a token called red that is not red. This sounds pedantic until it happens.
        </p>
      </>
    ),
  },

  preview: {
    render: (
      <PreviewStage label="The three tiers" center={false} minHeight={0} allowResize={false}>
        <TierDiagram />
      </PreviewStage>
    ),
    examples: [
      {
        id: 'theme-swap',
        title: 'One markup, two themes',
        description:
          'Both panels below render identical DOM. The only difference is a data-theme attribute redefining the tier-2 variables. This is the entire payoff of the semantic tier.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <ThemeSwapDemo />
          </PreviewStage>
        ),
      },
      {
        id: 'ramp-demo',
        title: 'A primitive ramp',
        description:
          'Tier 1 is boring on purpose. Eleven evenly-spaced steps, no meaning, no opinions — the raw material that semantic tokens are cut from.',
        render: (
          <PreviewStage center={false} minHeight={0} allowResize={false}>
            <Grid min="8rem" className="w-full">
              {RAMP.map((step) => (
                <Swatch
                  key={step}
                  name={`--p-brand-${step}`}
                  value={`var(--p-brand-${step})`}
                  size="sm"
                />
              ))}
            </Grid>
          </PreviewStage>
        ),
      },
    ],
    states: [
      {
        label: 'Correct',
        note: 'Component → semantic',
        render: <code className="font-mono text-[11px] text-[var(--ds-success-text)]">bg: var(--ds-accent)</code>,
      },
      {
        label: 'Wrong',
        note: 'Component → primitive',
        render: <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">bg: var(--p-brand-500)</code>,
      },
      {
        label: 'Wrong',
        note: 'Hard-coded literal',
        render: <code className="font-mono text-[11px] text-[var(--ds-danger-text)]">bg: #7c6cff</code>,
      },
      {
        label: 'Acceptable',
        note: 'Derived with calc()',
        render: <code className="font-mono text-[11px] text-[var(--ds-warning-text)]">calc(var(--radius-xl) - 8px)</code>,
      },
    ],
  },

  anatomy: {
    render: (
      <div className="w-full max-w-xl">
        <CodeBlock
          lang="css"
          code={`/* 1 — PRIMITIVE. A value. No meaning. */
:root {
  --p-brand-500: #7c6cff;
}

/* 2 — SEMANTIC. A role. Redefined per theme. */
:root, [data-theme='dark'] {
  --ds-accent: var(--p-brand-500);
}
[data-theme='light'] {
  --ds-accent: var(--p-brand-600);   /* darker: needs 4.5:1 on white */
}

/* 3 — COMPONENT. Private. References tier 2 only. */
.ds-btn--filled {
  --c-btn-bg: var(--ds-accent);
  background: var(--c-btn-bg);
}`}
        />
      </div>
    ),
    caption:
      'The whole architecture in fourteen lines. Note that the light theme does not invert the value — it picks a different step of the same ramp, because contrast requirements differ on white.',
    parts: [
      {
        n: 1,
        label: 'Primitive naming',
        value: '--p-{family}-{step}',
        kind: 'color',
        note: 'Numeric steps, never names like "light" or "dark" — those stop making sense the moment the ramp is extended or the theme flips.',
      },
      {
        n: 2,
        label: 'Semantic naming',
        value: '--ds-{role}[-{modifier}]',
        kind: 'color',
        note: 'Role first: accent, danger, surface, fg. Modifiers are a closed set: -hover, -active, -subtle, -border, -text, -fg.',
      },
      {
        n: 3,
        label: 'Theme scoping',
        value: '[data-theme="light"]',
        kind: 'color',
        note: 'Applied on an element, not only on :root, so a light island can live inside a dark app — which is how the previews in this Bible work.',
      },
      {
        n: 4,
        label: 'Tailwind binding',
        value: '@theme inline',
        kind: 'shape',
        note: '`inline` keeps the var() reference in the generated utility instead of resolving it at build time. Without it, runtime theming silently stops working.',
      },
      {
        n: 5,
        label: 'Component tier',
        value: '--c-{component}-{prop}',
        kind: 'space',
        note: 'Optional and rare. Its purpose is to let one component deviate in a way that is visible and greppable, rather than by adding a magic class.',
      },
    ],
  },

  tokens: [
    { category: 'color', token: '--ds-canvas', usedFor: 'Page background — the furthest-back surface' },
    { category: 'color', token: '--ds-surface', usedFor: 'Default card and panel background' },
    { category: 'color', token: '--ds-surface-raised', usedFor: 'A surface sitting above another surface' },
    { category: 'color', token: '--ds-surface-overlay', usedFor: 'Dialogs, popovers, menus, toasts' },
    { category: 'color', token: '--ds-surface-inset', usedFor: 'Wells: inputs, code blocks, table headers' },
    { category: 'color', token: '--ds-fg', usedFor: 'Primary text' },
    { category: 'color', token: '--ds-fg-secondary', usedFor: 'Body text, labels' },
    { category: 'color', token: '--ds-fg-muted', usedFor: 'Captions, metadata, placeholders' },
    { category: 'color', token: '--ds-fg-disabled', usedFor: 'Disabled text — exempt from contrast rules' },
    { category: 'color', token: '--ds-border-subtle', usedFor: 'Dividers and card edges' },
    { category: 'color', token: '--ds-border', usedFor: 'Default component borders' },
    { category: 'color', token: '--ds-border-strong', usedFor: 'Checkbox and radio outlines, scrollbars' },
    { category: 'color', token: '--ds-accent', usedFor: 'Brand actions and selection' },
    { category: 'color', token: '--ds-layer-hover', usedFor: 'Alpha wash applied on hover, composes over anything' },
    { category: 'spacing', token: 'Tailwind scale', value: '0.25rem base', usedFor: 'gap-*, p-*, m-* — every step is a multiple of 4px' },
    { category: 'radius', token: '--radius-xs … --radius-3xl', value: '4 → 28px', usedFor: 'Seven steps, no more' },
    { category: 'shadow', token: '--shadow-e0 … --shadow-e5', usedFor: 'Six elevation levels' },
    { category: 'typography', token: '--text-display … --text-overline', usedFor: 'Thirteen named type styles' },
    { category: 'motion', token: '--ease-standard', usedFor: 'The default curve for almost everything' },
    { category: 'motion', token: '--duration-fast … --duration-deliberate', value: '120 → 640ms', usedFor: 'Seven duration steps' },
  ],

  do: [
    {
      title: 'Name by role, not by appearance',
      why: '--ds-danger survives a rebrand from red to orange. --ds-red becomes a lie the day the brand changes, and then someone adds --ds-red-but-actually-orange.',
      render: (
        <Stack gap="xs" className="font-mono text-[11.5px]">
          <span className="text-[var(--ds-success-text)]">--ds-danger-subtle</span>
          <span className="text-[var(--ds-success-text)]">--ds-surface-raised</span>
          <span className="text-[var(--ds-success-text)]">--ds-fg-muted</span>
        </Stack>
      ),
    },
    {
      title: 'Let the theme choose a different ramp step',
      why: 'Light and dark are not inverses. #7C6CFF passes 4.5:1 on near-black and fails on white; the light theme uses the 600 step instead. The token name stays identical, so no component knows or cares.',
      render: (
        <Row gap="sm">
          <Swatch name="dark" value="#7c6cff" size="sm" />
          <Swatch name="light" value="#6a55f2" size="sm" />
        </Row>
      ),
    },
    {
      title: 'Use alpha for interaction layers',
      why: 'A hover state defined as an alpha white composes correctly over a card, a table row, a menu item and a coloured banner. A hover state defined as a solid grey works on exactly one of those.',
      render: (
        <Stack gap="xs" className="w-full">
          {['var(--ds-surface)', 'var(--ds-accent-subtle)', 'var(--ds-danger-subtle)'].map((bg) => (
            <div key={bg} className="rounded-[var(--radius-sm)] p-2" style={{ background: bg }}>
              <div className="rounded-[3px] bg-[var(--ds-layer-hover)] px-2 py-1 text-caption">
                hovered row
              </div>
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: 'Keep the modifier vocabulary closed',
      why: 'Six suffixes cover every state we have ever needed: -hover, -active, -subtle, -border, -text, -fg. A closed vocabulary means you can guess a token name correctly without looking it up.',
      render: (
        <Stack gap="xs" className="font-mono text-[11px] text-[var(--ds-fg-secondary)]">
          <span>--ds-success</span>
          <span>--ds-success-subtle</span>
          <span>--ds-success-border</span>
          <span>--ds-success-text</span>
        </Stack>
      ),
    },
  ],

  dont: [
    {
      title: 'Do not reference a primitive from a component',
      why: 'It bypasses the theme layer entirely. The component will look correct in whichever theme you developed it in and subtly wrong in the other, and the bug will be invisible in code review.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          .card {'{'} background: var(--p-neutral-900); {'}'}
        </code>
      ),
    },
    {
      title: 'Do not create a token for a single usage',
      why: 'A token is a shared decision. One with a single call site is just a variable with extra ceremony, and it inflates the surface area everyone else has to learn.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          --ds-onboarding-step-3-icon-offset: 3px;
        </code>
      ),
    },
    {
      title: 'Do not encode numbers into semantic names',
      why: '--ds-gray-4 tells you nothing about when to use it, so people pick by eye and the meaning drifts. Numbers belong in tier 1, where they describe position in a ramp and nothing more.',
      render: (
        <Stack gap="xs" className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          <span>--ds-gray-4</span>
          <span>--ds-shadow-3-alt</span>
          <span>--ds-blue-secondary-2</span>
        </Stack>
      ),
    },
    {
      title: 'Do not resolve theme variables at build time',
      why: 'Tailwind’s @theme without `inline` bakes the value into the utility. Runtime theming stops working and nothing errors — the light-mode toggle just silently does nothing.',
      render: (
        <code className="font-mono text-[11.5px] text-[var(--ds-danger-text)]">
          @theme {'{'} --color-accent: var(--ds-accent); {'}'}
        </code>
      ),
    },
  ],

  a11y: {
    criteria: [
      { id: '1.4.3', name: 'Contrast (Minimum)', level: 'AA' },
      { id: '1.4.11', name: 'Non-text Contrast', level: 'AA' },
      { id: '1.4.12', name: 'Text Spacing', level: 'AA' },
    ],
    contrast: [
      'Every foreground/background token pair we ship is verified at 4.5:1 for body text and 3:1 for large text and UI boundaries, in both themes.',
      'The -text suffix exists precisely for this: --ds-danger-text is the variant certified to sit on --ds-danger-subtle. Using --ds-danger there would fail.',
      'Contrast is a property of a *pair*, not of a colour. A token audit that checks colours in isolation proves nothing.',
      'Turn on Inspector Mode and hover any text in this app — it computes the live ratio against the composited background, including alpha layers.',
    ],
    keyboard: [
      { keys: '⌘I', does: 'Toggles Inspector Mode, which reports the tokens behind any element.' },
      { keys: '⌘K', does: 'Opens the command palette to jump between token pages.' },
    ],
    aria: [
      {
        attr: 'color-scheme',
        on: ':root and each theme block',
        note: 'Tells the browser to render native scrollbars, form controls and the caret in the matching scheme. Forgetting it gives you white scrollbars in dark mode.',
      },
      {
        attr: 'prefers-reduced-motion',
        on: 'Motion tokens',
        note: 'Durations collapse to ~1ms rather than being removed, so transitionend still fires and state machines do not stall.',
      },
      {
        attr: 'forced-colors',
        on: 'All tokens',
        note: 'In Windows High Contrast Mode the OS overrides colour entirely. Never rely on a token alone to convey state — pair it with an icon, a border or text.',
      },
    ],
    focus:
      'One focus token, --ds-focus-ring, used by every component with no exceptions. Users learn what focus looks like exactly once, and a single change fixes it everywhere.',
    screenReader: [
      'Tokens are invisible to assistive tech, which is the point: they must never be the only carrier of meaning.',
      'Any state expressed with a colour token also needs a text or icon equivalent — status badges pair a tone with a dot and a word.',
    ],
    touch:
      'Spacing tokens are the mechanism for hit-area compliance. The 44px minimum is enforced in the component layer using the same 4px scale, not by ad-hoc padding.',
  },

  code: {
    usage: {
      lang: 'tsx',
      caption: 'Reading tokens from TypeScript, for canvas rendering, charts and email templates.',
      code: `// In JSX, prefer the Tailwind utility bound to the token
<div className="bg-surface text-fg border-line rounded-xl" />

// Or reference the variable directly when the utility does not exist
<div style={{ boxShadow: 'var(--shadow-e3)' }} />

// Reading a resolved value at runtime — charts, canvas, dynamic SVG
function token(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

const accent = token('--ds-accent')       // "#7c6cff"
const gridLine = token('--ds-border')     // "rgb(255 255 255 / 0.11)"

// Re-read on theme change; the values are not static
const observer = new MutationObserver(() => redrawChart())
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
})`,
    },
    css: {
      lang: 'css',
      caption: 'Adding a new semantic token. Follow this shape exactly.',
      code: `/* 1. Add the primitive, only if no existing ramp step works */
:root {
  --p-teal-400: #2ed3d3;
  --p-teal-600: #12a3a3;
}

/* 2. Add the semantic role to BOTH themes. Never only one. */
:root, [data-theme='dark'] {
  --ds-beta: var(--p-teal-400);
  --ds-beta-subtle: rgb(46 211 211 / 0.14);
  --ds-beta-border: rgb(46 211 211 / 0.34);
  --ds-beta-text: var(--p-teal-400);     /* 4.5:1 on --ds-beta-subtle */
  --ds-beta-fg: #04231a;                 /* text ON --ds-beta */
}
[data-theme='light'] {
  --ds-beta: var(--p-teal-600);
  --ds-beta-subtle: rgb(18 163 163 / 0.11);
  --ds-beta-border: rgb(18 163 163 / 0.28);
  --ds-beta-text: var(--p-teal-600);
  --ds-beta-fg: #ffffff;
}

/* 3. Bind it for Tailwind. The "inline" keyword is mandatory. */
@theme inline {
  --color-beta: var(--ds-beta);
  --color-beta-subtle: var(--ds-beta-subtle);
  --color-beta-text: var(--ds-beta-text);
}

/* 4. Verify both pairs before you commit:
      --ds-beta-fg   on --ds-beta         >= 4.5:1
      --ds-beta-text on --ds-beta-subtle  >= 4.5:1  */`,
    },
    api: [
      {
        name: 'Naming grammar',
        props: [
          { name: '--p-{family}-{step}', type: 'primitive', description: 'Tier 1. Step is 0–1000. No meaning.' },
          { name: '--ds-{role}', type: 'semantic', description: 'Tier 2. The base value for a role.' },
          { name: '--ds-{role}-hover', type: 'semantic', description: 'Pointer-over variant of the base.' },
          { name: '--ds-{role}-active', type: 'semantic', description: 'Pressed variant of the base.' },
          { name: '--ds-{role}-subtle', type: 'semantic', description: 'Low-alpha fill for backgrounds behind text.' },
          { name: '--ds-{role}-border', type: 'semantic', description: 'Border pair for the subtle fill.' },
          { name: '--ds-{role}-text', type: 'semantic', description: 'Text colour certified against the subtle fill.' },
          { name: '--ds-{role}-fg', type: 'semantic', description: 'Text colour certified against the solid fill.' },
          { name: '--c-{component}-{prop}', type: 'component', description: 'Tier 3. Private. Must reference tier 2.' },
        ],
      },
    ],
  },

  notes: {
    tips: [
      'Write a lint rule that fails any --p-* reference outside the token file. It takes twenty minutes and it is the single highest-leverage thing you can do for a design system.',
      'When adding a semantic token, add it to every theme in the same commit. A token that exists in one theme resolves to an empty string in the other and silently renders as transparent.',
      'Alpha values compose; solid values do not. If you are unsure which to pick, ask whether the token will ever sit on more than one background.',
      'Keep the total count small enough to memorise. Around 80 semantic tokens is the point where people stop guessing correctly and start opening the file.',
    ],
    performance: [
      'CSS custom properties are resolved at computed-value time and inherit. A variable defined on :root and used in 10,000 elements costs essentially nothing to read.',
      'Changing a variable on :root does invalidate style for the whole subtree. That is fine for a theme switch; it is not fine to animate a variable on every frame.',
      'Prefer @theme inline for anything theme-swappable and plain @theme for values that genuinely never change — the latter produces slightly smaller CSS.',
      'Do not put a var() inside a keyframe you expect to change mid-animation; Chrome and Safari snapshot custom properties at animation start.',
    ],
    mistakes: [
      'Defining a token in the dark theme and forgetting the light theme. Nothing errors — the value resolves to an empty string and the element renders transparent.',
      'Using --ds-danger for text on --ds-danger-subtle. That pair is not certified; --ds-danger-text is.',
      'Building a "spacing token" per component (--c-card-gap, --c-panel-gap, --c-list-gap) that all equal 16px. That is not a system, it is an indirection tax.',
      'Forgetting color-scheme, then wondering why native scrollbars, date pickers and autofill backgrounds are white in dark mode.',
    ],
    realWorld: [
      'Ship tokens as the source of truth in one format (CSS custom properties) and generate everything else — Figma variables, Swift, Kotlin, JSON — from it. Two hand-maintained sources will diverge within a month.',
      'Version the token file separately from the components. Consumers can then adopt a new palette without a component upgrade.',
      'Deprecate rather than delete. Keep the old name aliased to the new one for at least one release, and log a console warning in development.',
      'When a designer asks for "a slightly different blue", the answer is almost always an existing ramp step. Show them the ramp before adding to it — nine times out of ten one of them is the colour they meant.',
    ],
  },

  appendix: [
    {
      id: 'extending',
      title: 'Extending the system',
      description: 'The checklist for anyone proposing a new token.',
      render: (
        <Stack gap="md">
          <Callout title="Before you add a token, answer all five">
            <ol className="mt-1 flex list-decimal flex-col gap-1.5 pl-4">
              <li>Which existing token is closest, and precisely why is it unusable?</li>
              <li>What role does this express? Write the name from the role, not the colour.</li>
              <li>What is its value in both themes, and does each pass contrast against its pair?</li>
              <li>How many places will use it? Fewer than three is usually a no.</li>
              <li>What breaks if we remove it in a year? If nothing, it did not need a name.</li>
            </ol>
          </Callout>
          <p className="text-body-sm leading-relaxed text-[var(--ds-fg-muted)]">
            Adding to tier 1 is cheap — a ramp step has no opinions. Adding to tier 2 is expensive,
            because every consumer now has one more thing to learn and one more thing to get wrong.
            Bias hard toward reuse.
          </p>
        </Stack>
      ),
    },
  ],
})
